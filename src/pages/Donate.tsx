import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Smartphone, Banknote, Sparkles, Loader2, CheckCircle, Shield, X } from 'lucide-react';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useErrorToast } from '../lib/ErrorToast';

export const Donate = () => {
  const [amount, setAmount] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [contributionId, setContributionId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { showError } = useErrorToast();

  const functions = getFunctions();
  const stkPush = httpsCallable(functions, 'stkPush');
  const queryStatus = httpsCallable(functions, 'queryStatus');

  const formatPhoneNumber = (phoneNumber: string): string => {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      cleaned = cleaned;
    } else if (cleaned.length === 9) {
      cleaned = '254' + cleaned;
    } else if (cleaned.startsWith('7') && cleaned.length === 10) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  // Validate phone number
  const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length === 12 && cleaned.startsWith('254');
  };

  const pollPaymentStatus = async (contributionId: string, checkoutRequestID: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds
    const interval = 2000; // 2 seconds

    const poll = setInterval(async () => {
      attempts++;
      try {
        const result = await queryStatus({ checkoutRequestID, orderId: contributionId });
        const data = result.data as any;

        if (data.success) {
          clearInterval(poll);
          setPaymentMessage('Payment successful! Updating your contribution...');
          
          const contribRef = doc(db, 'contributions', contributionId);
          await updateDoc(contribRef, {
            status: 'completed',
            mpesaReceiptNumber: data.mpesaReceiptNumber || '',
            completedAt: serverTimestamp()
          });
          
          setPaymentStatus('completed');
          setPaymentMessage('Thank you for your contribution!');
          
          setTimeout(() => {
            setShowPaymentModal(false);
            setLoading(false);
            setSuccess(true);
            setPaymentStatus('idle');
          }, 2000);
          
        } else if (data.resultCode && data.resultCode !== '0') {
          clearInterval(poll);
          setPaymentStatus('failed');
          const errorMsg = `Payment failed: ${data.resultDesc || 'Please try again'}`;
          setPaymentMessage(errorMsg);
          showError(errorMsg);
          
          const contribRef = doc(db, 'contributions', contributionId);
          await updateDoc(contribRef, {
            status: 'failed',
            failureReason: data.resultDesc,
            failedAt: serverTimestamp()
          });
          
          setTimeout(() => {
            setShowPaymentModal(false);
            setLoading(false);
            setPaymentStatus('idle');
          }, 3000);
          
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          setPaymentStatus('failed');
          const errorMsg = 'Payment timeout. Please check your M-Pesa statement.';
          setPaymentMessage(errorMsg);
          showError(errorMsg);
          
          const contribRef = doc(db, 'contributions', contributionId);
          await updateDoc(contribRef, {
            status: 'timeout',
            failedAt: serverTimestamp()
          });
          
          setTimeout(() => {
            setShowPaymentModal(false);
            setLoading(false);
            setPaymentStatus('idle');
          }, 3000);
          
        } else {
          setPaymentMessage(`Waiting for M-Pesa confirmation... (${Math.floor(attempts * interval / 1000)}s)`);
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setPaymentStatus('failed');
          const errorMsg = 'Payment verification failed. Please check your M-Pesa statement.';
          setPaymentMessage(errorMsg);
          showError(errorMsg);
          setTimeout(() => {
            setShowPaymentModal(false);
            setLoading(false);
            setPaymentStatus('idle');
          }, 3000);
        }
      }
    }, interval);

    return () => clearInterval(poll);
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add a flag to prevent multiple error submissions
    if (loading) return;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showError("Please enter a valid amount.");
      return;
    }
    
    if (!phone || !name) {
      showError("Please provide your name and M-Pesa number.");
      return;
    }

    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phone);
    if (!isValidPhoneNumber(formattedPhone)) {
      // Only show error once
      showError("Please enter a valid M-Pesa number (e.g., 0712345678 or 254712345678)");
      return;
    }

    setLoading(true);
    setShowPaymentModal(true);
    setPaymentStatus('pending');
    setPaymentMessage('Creating your contribution...');

    try {
      const contribId = `DON-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setContributionId(contribId);
      
      const contribRef = doc(db, 'contributions', contribId);
      await setDoc(contribRef, {
        contributionId: contribId,
        donorName: name,
        mpesaNumber: phone,
        amount: Number(amount),
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setPaymentMessage('Initiating M-Pesa payment...');

      // Initiate STK Push with formatted phone number
      const result = await stkPush({
        orderId: contribId,
        amount: Math.round(Number(amount)),
        phoneNumber: formattedPhone,
        accountReference: contribId,
        transactionDesc: `Donation from ${name}`
      });

      const data = result.data as any;

      if (data.success && data.checkoutRequestID) {
        setPaymentMessage('Payment request sent to your phone. Please enter your M-Pesa PIN to complete payment.');
        await pollPaymentStatus(contribId, data.checkoutRequestID);
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }

    } catch (error: any) {
      console.error("Contribution error:", error);
      
      if (contributionId) {
        const contribRef = doc(db, 'contributions', contributionId);
        await updateDoc(contribRef, {
          status: 'failed',
          failureReason: error.message || 'Payment initiation failed',
          failedAt: serverTimestamp()
        });
      }
      
      setPaymentStatus('failed');
      const errorMsg = error.message || 'Failed to process contribution. Please try again.';
      setPaymentMessage(errorMsg);
      showError(errorMsg);
      
      setTimeout(() => {
        setShowPaymentModal(false);
        setLoading(false);
        setPaymentStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-slate-950 pb-16">
      {/* Payment Status Modal */}
      <AnimatePresence>
        {showPaymentModal && paymentStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full"
            >
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
                        Amount: Ksh {Number(amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">
                        Phone: {phone}
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
                        setShowPaymentModal(false);
                        setLoading(false);
                        setPaymentStatus('idle');
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
                      <CheckCircle className="h-8 w-8 text-green-600" />
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-5 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left Side - Info */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 text-[#5A3E2B] dark:text-amber-400 font-bold tracking-[0.2em] uppercase text-[9px] mb-4">
                  <Sparkles className="h-3 w-3" />
                  <span>Investment in Humanity</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold italic leading-[1.1] text-[#2C1810] dark:text-white mb-4">
                  Your <span className="text-[#5A3E2B] dark:text-amber-400">Love</span>
                  <br />
                  in Action.
                </h1>
                <p className="text-stone-600 dark:text-stone-400 text-base leading-relaxed">
                  "We take the responsibility of your generosity seriously. Every contribution is a brick in the sanctuary of someone's future."
                </p>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {/* M-Pesa Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800">
                  <div className="w-10 h-10 bg-[#5A3E2B]/10 rounded-xl flex items-center justify-center mb-4">
                    <Smartphone className="h-5 w-5 text-[#5A3E2B]" />
                  </div>
                  <h3 className="text-base font-serif font-bold italic text-[#2C1810] dark:text-white mb-3">
                    M-Pesa Till Number
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-stone-400">Till Number</p>
                      <p className="text-xl font-bold text-[#5A3E2B]">5419692</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-stone-400">Account Name.</p>
                      <p className="text-sm font-medium">ESTHER WANJIRU KARUE</p>
                    </div>
                  </div>
                </div>

                {/* Bank Card */}
                {/* <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800">
                  <div className="w-10 h-10 bg-[#5A3E2B]/10 rounded-xl flex items-center justify-center mb-4">
                    <Banknote className="h-5 w-5 text-[#5A3E2B]" />
                  </div>
                  <h3 className="text-base font-serif font-bold italic text-[#2C1810] dark:text-white mb-3">
                    Bank Transfer
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <p><span className="font-bold text-[#2C1810]">Bank:</span> Global Trust Bank</p>
                    <p><span className="font-bold text-[#2C1810]">Acc:</span> 0988 1223 4455</p>
                    <p><span className="font-bold text-[#2C1810]">Swift:</span> HAVNINTL</p>
                  </div>
                </div> */}
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#2C1810]/5 dark:bg-white/5 border border-[#2C1810]/10">
                <Shield className="h-8 w-8 text-[#5A3E2B]" />
                <div>
                  <p className="text-xs font-bold text-[#2C1810] dark:text-white">100% Impact Guarantee</p>
                  <p className="text-[9px] text-stone-500">Every shilling goes directly to those in need</p>
                </div>
              </div>
            </div>

            {/* Right Side - Donation Form */}
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-stone-200 dark:border-stone-800"
              >
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8 space-y-5"
                    >
                      <div className="w-16 h-16 bg-[#5A3E2B]/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="h-8 w-8 text-[#5A3E2B]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-serif font-bold italic text-[#2C1810] dark:text-white mb-2">
                          Thank You!
                        </h3>
                        <p className="text-sm text-stone-500">
                          Your contribution of <span className="font-bold text-[#2C1810]">Ksh {Number(amount).toLocaleString()}</span> has been received with gratitude.
                        </p>
                        <p className="text-xs text-stone-400 mt-2">
                          Reference: {contributionId}
                        </p>
                      </div>
                      <button 
                        onClick={() => { 
                          setSuccess(false); 
                          setAmount(''); 
                          setPhone(''); 
                          setName('');
                          setContributionId('');
                        }}
                        className="px-5 py-2.5 rounded-full bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all"
                      >
                        Make Another Gift
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      onSubmit={handleContribute}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5"
                    >
                      <h2 className="text-xl font-serif font-bold italic text-[#2C1810] dark:text-white">
                        Make a Contribution
                      </h2>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
                            Your Name
                          </label>
                          <input 
                            type="text" 
                            placeholder="Full name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] text-sm"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
                            M-Pesa Number
                          </label>
                          <input 
                            type="tel" 
                            placeholder="0712 345 678 or 254712 345 678"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] text-sm"
                          />
                          <p className="text-[8px] text-stone-400">Enter number in format: 0707390793 or 254707390793</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
                            Amount (Ksh)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-medium text-sm">Ksh</span>
                            <input 
                              type="number" 
                              placeholder="Enter amount"
                              required
                              min="10"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full pl-14 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] text-sm font-medium"
                            />
                          </div>
                          <div className="flex gap-2 mt-2">
                            {[500, 1000, 2500, 5000].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setAmount(preset.toString())}
                                className="flex-1 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-[#5A3E2B] hover:text-[#5A3E2B] transition-all"
                              >
                                Ksh {preset.toLocaleString()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>Contribute Now</span>
                            <Heart className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      
                      <p className="text-center text-[8px] text-stone-400">
                        Secure transaction via M-Pesa • 100% goes to impact
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};