import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mail, MapPin, Phone, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'unread'
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus('error');
    }
  };

  const contactInfo = [
    { icon: Mail, label: "Email", value: "hello@haven.com", color: "#5A3E2B" },
    { icon: MapPin, label: "Location", value: "Nakuru, Kenya", color: "#2C1810" },
    { icon: Phone, label: "Phone", value: "+254 796 917 836", color: "#5A3E2B" },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-slate-950 pb-16">
      <div className="px-5 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
            {/* Left Side - Info */}
            <div className="space-y-10">
              <div>
                <div className="inline-flex items-center gap-2 text-[#5A3E2B] dark:text-amber-400 font-bold tracking-[0.2em] uppercase text-[9px] mb-4">
                  <Sparkles className="h-3 w-3" />
                  <span>Open Communication</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold italic leading-[1.1] text-[#2C1810] dark:text-white mb-4">
                  Speak to <br />
                  <span className="text-[#5A3E2B] dark:text-amber-400">the Haven.</span>
                </h1>
                <p className="text-stone-500 text-base leading-relaxed max-w-sm">
                  Whether it's a whisper of support or a shout for help, we are here to listen with radical empathy.
                </p>
              </div>

              {/* Contact Info Cards */}
              <div className="space-y-5">
                {contactInfo.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-5 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-stone-800"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#5A3E2B]/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-[#5A3E2B]" />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">
                        {item.label}
                      </p>
                      <p className="text-base font-medium text-[#2C1810] dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social/Impact Note */}
              <div className="p-5 rounded-2xl bg-[#2C1810] text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-amber-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">24/7 Support Line</span>
                </div>
                <p className="text-sm opacity-90">
                  For emergencies, call our dedicated support line immediately.
                </p>
              </div>
            </div>

            {/* Right Side - Form */}
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-stone-200 dark:border-stone-800"
              >
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-12 space-y-6"
                    >
                      <div className="w-16 h-16 bg-[#5A3E2B] rounded-full mx-auto flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-serif font-bold italic text-[#2C1810] dark:text-white mb-2">
                          Message Received.
                        </h3>
                        <p className="text-sm text-stone-500 max-w-xs mx-auto">
                          Your voice has been carried to our sanctuary. We will respond soon.
                        </p>
                      </div>
                      <button 
                        onClick={() => setStatus('idle')} 
                        className="text-sm text-[#5A3E2B] font-medium underline underline-offset-4"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit} 
                      className="space-y-5"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
                            Full Name
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="Esther Karue"
                            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] text-sm"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
                            Email
                          </label>
                          <input
                            required
                            type="email"
                            placeholder="esther@example.com"
                            className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] text-sm"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
                          Subject
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="How can we help?"
                          className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] text-sm"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
                          Message
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Share your thoughts with us..."
                          className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] text-sm resize-none"
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="w-full py-3 rounded-xl bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {status === 'sending' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      
                      {status === 'error' && (
                        <p className="text-center text-rose-500 text-xs">
                          Failed to send. Please try again.
                        </p>
                      )}
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