import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { Heart, Sparkles, ArrowRight, ShieldCheck, Phone, Box, MapPin, CheckCircle2, Loader2, Download, X, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, setDoc, doc, serverTimestamp, query, where, getDocs, updateDoc, increment, getDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { handleError, ErrorHandlers, withErrorHandling } from '../lib/errorHandler';

export const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '' });
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const [pickupLocations, setPickupLocations] = useState<{ id: string, name: string, date: string }[]>([]);
  const [selectedPickup, setSelectedPickup] = useState('');

  const functions = getFunctions();
  const stkPush = httpsCallable(functions, 'stkPush');
  const queryStatus = httpsCallable(functions, 'queryStatus');
  const sendEmail = httpsCallable(functions, 'sendOrderConfirmation');

  useEffect(() => {
    const fetchLocations = async () => {
      await withErrorHandling(async () => {
        const q = query(collection(db, 'events'), where('isUpcoming', '==', true));
        const snapshot = await getDocs(q);
        const locations = snapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, name: data.title, date: data.date };
        });
        setPickupLocations(locations);
        if (locations.length > 0) {
          setSelectedPickup(locations[0].id);
        }
        return locations;
      }, {
        source: 'firestore',
        severity: 'warning',
        showAlert: false,
        customUserMessage: 'Unable to load pickup locations. Please refresh the page.'
      });
    };
    fetchLocations();
  }, []);

  // Auto-send email when order is successfully created
  useEffect(() => {
    const sendAutoEmail = async () => {
      if (orderDetails && !emailSent && isSuccess) {
        const downloadToken = btoa(orderDetails.orderId);
        const downloadLink = `${window.location.origin}/download/${downloadToken}`;
        
        try {
          await sendEmail({
            to: orderDetails.customerEmail,
            name: orderDetails.customerName,
            orderId: orderDetails.orderId,
            totalAmount: orderDetails.totalAmount,
            pickupLocation: orderDetails.pickupLocation,
            downloadLink: downloadLink,
            mpesaReceiptNumber: orderDetails.mpesaReceiptNumber || ''
          });
          setEmailSent(true);
          console.log('Auto-email sent successfully');
        } catch (error) {
          console.error('Failed to send auto-email:', error);
        }
      }
    };

    sendAutoEmail();
  }, [orderDetails, isSuccess, emailSent, sendEmail]);

  const saveOrderToFirestore = async (orderData: any, mpesaReceiptNumber?: string) => {
    try {
      const itemsWithIds = orderData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || ''
      }));

      const finalOrder = {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        mpesaNumber: orderData.mpesaNumber,
        items: itemsWithIds,
        totalAmount: orderData.totalAmount,
        deliveryMethod: 'pickup',
        pickupLocation: orderData.pickupLocation,
        status: 'paid',
        createdAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        mpesaReceiptNumber: mpesaReceiptNumber || '',
        timestamp: serverTimestamp()
      };

      await setDoc(doc(db, 'orders', orderData.orderId), finalOrder);
      
      setOrderDetails(finalOrder);
      setPaymentStatus('completed');
      setPaymentMessage('Order confirmed! Redirecting to your pass...');
      
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        clearCart();
      }, 1500);
      
    } catch (error) {
      console.error("Order creation failed:", error);
      ErrorHandlers.database(error);
      setPaymentStatus('failed');
      setPaymentMessage('Failed to save order. Please contact support.');
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (orderId: string, checkoutId: string) => {
    let attempts = 0;
    const maxAttempts = 30;
    const interval = 2000;

    const poll = setInterval(async () => {
      attempts++;
      try {
        const result = await queryStatus({ checkoutRequestID: checkoutId, orderId });
        const data = result.data as any;

        if (data.success) {
          clearInterval(poll);
          setPaymentMessage('Payment successful! Creating your order...');
          
          const orderRef = doc(db, 'orders', orderId);
          const orderSnap = await getDoc(orderRef);
          
          if (orderSnap.exists()) {
            const orderData = orderSnap.data();
            await saveOrderToFirestore(orderData, data.mpesaReceiptNumber);
          } else {
            const tempOrder = await getDoc(doc(db, 'orders', orderId));
            if (tempOrder.exists()) {
              await saveOrderToFirestore(tempOrder.data());
            }
          }
        } else if (data.resultCode && data.resultCode !== '0') {
          clearInterval(poll);
          setPaymentStatus('failed');
          setPaymentMessage(`Payment failed: ${data.resultDesc || 'Please try again'}`);
          setIsProcessing(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          setPaymentStatus('failed');
          setPaymentMessage('Payment timeout. Please check your M-Pesa statement or contact support.');
          setIsProcessing(false);
        } else {
          setPaymentMessage(`Waiting for M-Pesa confirmation... (${Math.floor(attempts * interval / 1000)}s)`);
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setPaymentStatus('failed');
          setPaymentMessage('Payment verification failed. Please check your M-Pesa statement.');
          setIsProcessing(false);
        }
      }
    }, interval);

    return () => clearInterval(poll);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mpesaNumber || mpesaNumber.length !== 9) {
      alert('Please enter a valid M-Pesa number (9 digits)');
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      alert('Please enter your name and email');
      return;
    }

    if (!selectedPickup) {
      alert('Please select a pickup location');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');
    setPaymentMessage('Verifying stock availability...');
    
    // Check stock
    let outOfStockMessages: string[] = [];
    for (const item of cart) {
      if (item.stock !== undefined) {
        try {
          const productSnap = await getDoc(doc(db, 'products', item.id));
          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock;
            if (currentStock !== undefined && currentStock < item.quantity) {
              if (currentStock <= 0) {
                outOfStockMessages.push(`${item.name} is out of stock.`);
              } else {
                outOfStockMessages.push(`Only ${currentStock} left for ${item.name}.`);
              }
            }
          }
        } catch (error) {
          console.error("Failed to verify stock:", error);
        }
      }
    }

    if (outOfStockMessages.length > 0) {
      alert("Stock issue:\n" + outOfStockMessages.join('\n'));
      setIsProcessing(false);
      setPaymentStatus('idle');
      return;
    }

    const orderId = `SNCT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const orderData = {
      orderId,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      mpesaNumber,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || ''
      })),
      totalAmount: cartTotal,
      deliveryMethod: 'pickup',
      pickupLocation: pickupLocations.find(l => l.id === selectedPickup)?.name || 'Event Hub',
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };

    try {
      await setDoc(doc(db, 'orders', orderId), orderData);
      
      setPaymentMessage('Initiating M-Pesa payment...');
      
      let formattedPhone = mpesaNumber;
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('7')) {
        formattedPhone = '254' + formattedPhone;
      }
      
      const result = await stkPush({
        orderId,
        amount: Math.round(cartTotal),
        phoneNumber: formattedPhone,
        accountReference: orderId,
        transactionDesc: `Payment for order ${orderId}`
      });
      
      const data = result.data as any;
      
      if (data.success && data.checkoutRequestID) {
        setCheckoutRequestID(data.checkoutRequestID);
        setPaymentMessage('Payment request sent to your phone. Please enter your M-Pesa PIN to complete payment.');
        await pollPaymentStatus(orderId, data.checkoutRequestID);
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
      
    } catch (error: any) {
      console.error("Payment failed:", error);
      
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'failed_payment',
        failedAt: serverTimestamp(),
        failureReason: error.message || 'Payment initiation failed'
      });
      
      ErrorHandlers.payment(error, 'Failed to initiate payment. Please try again.');
      setPaymentStatus('failed');
      setIsProcessing(false);
    }
  };

  const downloadAsPDF = async () => {
    const element = document.getElementById('pickup-pass');
    if (!element) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: '#FDF8F0',
        logging: false,
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`pass-${orderDetails.orderId}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to download pass. Please use the print option instead.');
    }
  };

  if (isSuccess && orderDetails) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] dark:bg-slate-950 py-16 px-5">
        <div className="max-w-lg mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 text-center"
          >
            <div className="w-16 h-16 bg-[#5A3E2B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-[#5A3E2B]" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-serif font-bold italic text-[#2C1810] dark:text-white mb-3">
              Support Confirmed
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
              Your contribution has been received. Your pickup pass is below.
            </p>
            
            {emailSent && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-700 dark:text-green-400">
                  ✓ Confirmation email sent to {orderDetails.customerEmail}
                </p>
              </div>
            )}

            <div id="pickup-pass" className="bg-stone-50 dark:bg-slate-800 rounded-xl p-6 mb-6 border border-stone-200 dark:border-stone-700">
              <div className="flex justify-between items-start mb-6">
                <div className="text-left">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#5A3E2B] mb-1">Order ID</p>
                  <p className="text-sm font-mono font-bold text-[#2C1810] dark:text-white">{orderDetails.orderId}</p>
                </div>
                <button 
                  onClick={() => setShowQR(!showQR)}
                  className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm"
                >
                  {showQR ? <X className="h-5 w-5" /> : <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>}
                </button>
              </div>

              {showQR && (
                <div className="flex justify-center mb-6 p-4 bg-white rounded-xl">
                  <QRCodeSVG 
                    value={orderDetails.orderId} 
                    size={200} 
                    level="H" 
                    includeMargin={true}
                  />
                </div>
              )}

              <div className="space-y-3 text-left">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Supporter</p>
                  <p className="text-sm font-medium text-[#2C1810] dark:text-white">{orderDetails.customerName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Pickup Location</p>
                  <p className="text-sm font-medium text-[#2C1810] dark:text-white">{orderDetails.pickupLocation}</p>
                </div>
                {orderDetails.mpesaReceiptNumber && (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">M-Pesa Receipt</p>
                    <p className="text-xs font-mono text-[#2C1810] dark:text-white">{orderDetails.mpesaReceiptNumber}</p>
                  </div>
                )}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Status</p>
                    <p className="text-sm font-bold text-[#5A3E2B]">PAID</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Total</p>
                    <p className="text-lg font-bold text-[#2C1810] dark:text-white">Ksh {orderDetails.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={downloadAsPDF}
                className="w-full py-3 rounded-xl bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Save Pass</span>
              </button>
              <Link to="/events" className="block w-full py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-center">
                View Events
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Rest of your JSX remains the same...
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDF8F0] dark:bg-slate-950">
        <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-6">
          <Box className="h-10 w-10 text-stone-400" />
        </div>
        <h2 className="text-2xl font-serif font-bold italic text-[#2C1810] dark:text-white mb-4 text-center">
          Your cart is empty
        </h2>
        <Link to="/shop" className="px-6 py-3 rounded-full bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-slate-950 pb-16">
      <div className="px-5 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 text-[#5A3E2B] dark:text-amber-400 mb-3">
                  <Sparkles className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Complete Your Support</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold italic text-[#2C1810] dark:text-white">
                  Checkout
                </h1>
              </div>

              <AnimatePresence>
                {isProcessing && paymentStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  >
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full">
                      <div className="text-center">
                        {paymentStatus === 'pending' && (
                          <>
                            <div className="w-16 h-16 rounded-full bg-[#5A3E2B]/10 flex items-center justify-center mx-auto mb-4">
                              <Loader2 className="h-8 w-8 text-[#5A3E2B] animate-spin" />
                            </div>
                            <h3 className="text-lg font-bold text-[#2C1810] dark:text-white mb-2">
                              Processing Payment
                            </h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                              {paymentMessage}
                            </p>
                            <div className="mt-4 p-3 bg-stone-50 dark:bg-slate-800 rounded-lg">
                              <p className="text-[10px] text-stone-400">
                                Phone: {mpesaNumber}
                              </p>
                              <p className="text-[10px] text-stone-400 mt-1">
                                Amount: Ksh {cartTotal.toLocaleString()}
                              </p>
                            </div>
                          </>
                        )}

                        {paymentStatus === 'failed' && (
                          <>
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                              <X className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-red-600 mb-2">
                              Payment Failed
                            </h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                              {paymentMessage}
                            </p>
                            <button
                              onClick={() => {
                                setPaymentStatus('idle');
                                setIsProcessing(false);
                              }}
                              className="mt-4 px-6 py-2 rounded-lg bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all"
                            >
                              Close
                            </button>
                          </>
                        )}

                        {paymentStatus === 'completed' && (
                          <>
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-green-600 mb-2">
                              Payment Successful!
                            </h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                              {paymentMessage}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleCheckout} className="space-y-8">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-serif font-bold italic text-[#2C1810] dark:text-white">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                        Full Name
                      </label>
                      <input 
                        required 
                        type="text" 
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] text-sm"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                        Email
                      </label>
                      <input 
                        required 
                        type="email" 
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] text-sm"
                        placeholder="your@email.com"
                      />
                      <p className="text-[8px] text-stone-400 mt-1">
                        A confirmation email with your pickup pass will be sent here
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pickup Location */}
                <div className="space-y-4">
                  <h3 className="text-sm font-serif font-bold italic text-[#2C1810] dark:text-white">
                    Pickup Location
                  </h3>
                  
                  <div className="space-y-3">
                    {pickupLocations.length === 0 ? (
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-stone-700 text-center text-sm text-stone-500">
                        Loading events...
                      </div>
                    ) : (
                      pickupLocations.map((loc) => (
                        <div 
                          key={loc.id}
                          onClick={() => setSelectedPickup(loc.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 cursor-pointer transition-all",
                            selectedPickup === loc.id 
                              ? "border-[#5A3E2B] bg-[#5A3E2B]/5" 
                              : "border-stone-200 dark:border-stone-700 bg-white dark:bg-slate-900"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                selectedPickup === loc.id ? "bg-[#5A3E2B] text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-400"
                              )}>
                                <MapPin className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#2C1810] dark:text-white">{loc.name}</p>
                                <p className="text-[9px] text-stone-400">{loc.date}</p>
                              </div>
                            </div>
                            {selectedPickup === loc.id && <CheckCircle2 className="h-5 w-5 text-[#5A3E2B]" />}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* M-Pesa Payment */}
                <div className="space-y-4">
                  <h3 className="text-sm font-serif font-bold italic text-[#2C1810] dark:text-white">
                    M-Pesa Payment
                  </h3>
                  
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-stone-200 dark:border-stone-700 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#5A3E2B]/10 rounded-xl flex items-center justify-center">
                        <Phone className="h-5 w-5 text-[#5A3E2B]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#2C1810] dark:text-white">M-Pesa Number</p>
                        <p className="text-[9px] text-stone-400">You'll receive a prompt to pay</p>
                      </div>
                    </div>

                    <div>
                      <input 
                        required 
                        type="tel" 
                        pattern="[0-9]{9}"
                        maxLength={9}
                        value={mpesaNumber}
                        onChange={(e) => setMpesaNumber(e.target.value)}
                        placeholder="7XX XXX XXX" 
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] text-sm font-mono"
                      />
                      <p className="text-[8px] text-stone-400 mt-1">
                        Enter 9-digit M-Pesa number (e.g., 712345678)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#5A3E2B]/5 border border-[#5A3E2B]/10">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#5A3E2B]" />
                      <p className="text-[9px] text-[#5A3E2B]">
                        Total: <span className="font-bold">Ksh {cartTotal.toLocaleString()}</span> will be processed
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing || !selectedPickup || !mpesaNumber}
                  className="w-full py-4 rounded-xl bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay Ksh {cartTotal.toLocaleString()}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-[9px] text-center text-stone-400">
                  By completing this purchase, you support our community impact programs.
                </p>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-700">
                <h2 className="text-lg font-serif font-bold italic text-[#2C1810] dark:text-white mb-5">
                  Order Summary
                </h2>
                
                <div className="space-y-4 max-h-80 overflow-y-auto mb-5">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#2C1810] dark:text-white">{item.name}</p>
                        <p className="text-[9px] text-stone-400">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#2C1810] dark:text-white">
                          Ksh {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-stone-200 dark:border-stone-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="text-[#2C1810] dark:text-white">Ksh {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Pickup</span>
                    <span className="text-[#5A3E2B] text-xs font-medium">Free</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-2 border-t border-stone-200 dark:border-stone-700">
                    <span className="font-bold text-[#2C1810] dark:text-white">Total</span>
                    <span className="text-xl font-bold text-[#2C1810] dark:text-white">Ksh {cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500">100% Goes to Impact</span>
                  </div>
                  <p className="text-[10px] text-stone-500 leading-relaxed">
                    Every shilling directly supports our relief efforts and community programs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};