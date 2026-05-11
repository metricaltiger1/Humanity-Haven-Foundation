// src/pages/DownloadPass.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { Download, CheckCircle2, X, Heart, ArrowLeft, Loader2, PackageCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useErrorToast } from '../lib/ErrorToast';

export const DownloadPass = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const { showError, showSuccess } = useErrorToast();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError('Invalid download link');
        setLoading(false);
        return;
      }

      try {
        let orderId = token;
        
        // Try to decode if it's base64 encoded
        try {
          const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(token);
          if (isBase64 && token.length > 10) {
            const decoded = atob(token);
            if (decoded.startsWith('SNCT-')) {
              orderId = decoded;
            }
          }
        } catch (decodeError) {
          // If decoding fails, use the token as is
          console.log('Token is not base64 encoded, using as raw Order ID');
        }
        
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          
          // Allow both 'paid' and 'picked_up' status to view the pass
          if (orderData.status === 'paid') {
            setOrder({ id: orderDoc.id, ...orderData });
          } else if (orderData.status === 'picked_up') {
            setOrder({ id: orderDoc.id, ...orderData });
          } else {
            setError('This order has not been paid yet.');
          }
        } else {
          setError('Order not found. Please check your link or contact support.');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Invalid or expired download link.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  const downloadAsPDF = async () => {
    const element = document.getElementById('pickup-pass');
    if (!element) return;
    
    try {
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
      pdf.save(`pass-${order.orderId}.pdf`);
      showSuccess('Pass downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showError('Failed to download pass. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] dark:bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-[#5A3E2B] animate-spin mx-auto" />
          <p className="text-stone-500 text-xs tracking-wider uppercase">Loading your pass...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDF8F0] dark:bg-slate-950">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
          <X className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-serif font-bold italic text-[#2C1810] dark:text-white mb-4 text-center">
          Unable to Load Pass
        </h2>
        <p className="text-stone-500 dark:text-stone-400 text-center mb-6">{error}</p>
        <Link to="/" className="px-6 py-3 rounded-full bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all">
          Return to Home
        </Link>
      </div>
    );
  }

  const isPickedUp = order.status === 'picked_up';

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-slate-950 py-16 px-5">
      <div className="max-w-lg mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8"
        >
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-[#5A3E2B] transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs">Back to Home</span>
            </Link>
          </div>

          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isPickedUp ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-[#5A3E2B]/10 dark:bg-[#5A3E2B]/20'}`}>
              {isPickedUp ? (
                <PackageCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-[#5A3E2B] dark:text-[#5A3E2B]" />
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-serif font-bold italic text-[#2C1810] dark:text-white mb-3">
              {isPickedUp ? 'Pickup Confirmed' : 'Your Pickup Pass'}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
              {isPickedUp 
                ? 'This order has already been picked up. Thank you for supporting our cause!' 
                : 'Download or save your pass for event pickup'}
            </p>
          </div>

          {/* Pickup Pass Card */}
          <div id="pickup-pass" className={`rounded-xl p-6 mb-6 border ${isPickedUp ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-stone-700'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="text-left">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#5A3E2B] mb-1">Order ID</p>
                <p className="text-sm font-mono font-bold text-[#2C1810] dark:text-white">{order.orderId}</p>
              </div>
              {!isPickedUp && (
                <button 
                  onClick={() => setShowQR(!showQR)}
                  className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm"
                >
                  {showQR ? <X className="h-5 w-5" /> : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
                    </svg>
                  )}
                </button>
              )}
            </div>

            {showQR && !isPickedUp && (
              <div className="flex justify-center mb-6 p-4 bg-white rounded-xl">
                <QRCodeSVG 
                  value={order.orderId} 
                  size={200} 
                  level="H" 
                  includeMargin={true}
                />
              </div>
            )}

            <div className="space-y-3 text-left">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Supporter</p>
                <p className="text-sm font-medium text-[#2C1810] dark:text-white">{order.customerName}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Pickup Location</p>
                <p className="text-sm font-medium text-[#2C1810] dark:text-white">{order.pickupLocation}</p>
              </div>
              {order.mpesaReceiptNumber && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">M-Pesa Receipt</p>
                  <p className="text-xs font-mono text-[#2C1810] dark:text-white">{order.mpesaReceiptNumber}</p>
                </div>
              )}
              {isPickedUp && order.pickedUpAt && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Picked Up On</p>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {new Date(order.pickedUpAt).toLocaleDateString()} at {new Date(order.pickedUpAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Status</p>
                  <p className={`text-sm font-bold ${isPickedUp ? 'text-blue-600 dark:text-blue-400' : 'text-[#5A3E2B]'}`}>
                    {isPickedUp ? 'PICKED UP' : 'PAID'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Total</p>
                  <p className="text-lg font-bold text-[#2C1810] dark:text-white">Ksh {order.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!isPickedUp && (
              <button 
                onClick={downloadAsPDF}
                className="w-full py-3 rounded-xl bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Pass</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="w-full py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-center"
            >
              {isPickedUp ? 'Print Receipt' : 'Print Pass'}
            </button>
            <Link to="/events" className="block w-full py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-center">
              View Events
            </Link>
          </div>

          <div className={`mt-6 p-3 rounded-lg ${isPickedUp ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-stone-50 dark:bg-stone-800/50'}`}>
            <p className="text-[9px] text-stone-500 dark:text-stone-400 text-center">
              {isPickedUp 
                ? 'Thank you for supporting Humanity Haven Foundation! Your contribution has made a difference.' 
                : 'This pass is required for event entry. Please present this QR code at the pickup location.'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};