import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, ArrowLeft, Sparkles, Heart, Users, X, Maximize2, ArrowRight, Loader2, CheckCircle2, Share2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

// RSVPForm component remains same as before (only minimal style changes)
const RSVPForm = ({ eventId, eventTitle }: { eventId: string; eventTitle: string }) => {
  const [formData, setFormData] = useState({ name: '', email: '', guests: 1 });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'rsvps'), {
        ...formData,
        eventId,
        eventTitle,
        createdAt: serverTimestamp(),
      });
      setStatus('success');
    } catch (error) {
      console.error('RSVP Error:', error);
      setStatus('error');
      try { handleFirestoreError(error, OperationType.CREATE, 'rsvps'); } catch(e) {}
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-3xl text-center space-y-5 border border-stone-200 dark:border-stone-800"
      >
        <div className="w-16 h-16 bg-[#5A3E2B] rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-serif font-bold italic text-[#2C1810] dark:text-white">See you there!</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">Your registration is confirmed.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-6 border border-stone-200 dark:border-stone-800 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#5A3E2B]/10 rounded-xl flex items-center justify-center">
          <Users className="h-5 w-5 text-[#5A3E2B]" />
        </div>
        <h3 className="text-xl md:text-2xl font-serif font-bold italic text-[#2C1810] dark:text-white">RSVP</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 ml-2">Full Name</label>
          <input required type="text" placeholder="Your name"
            className="w-full bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5 text-sm text-[#2C1810] dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] transition-all"
            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 ml-2">Email</label>
          <input required type="email" placeholder="your@email.com"
            className="w-full bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5 text-sm text-[#2C1810] dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] transition-all"
            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 ml-2">Guests</label>
          <select className="w-full bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5 text-sm text-[#2C1810] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] transition-all cursor-pointer"
            value={formData.guests} onChange={e => setFormData({ ...formData, guests: parseInt(e.target.value) })}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
          </select>
        </div>
        <button type="submit" disabled={status === 'submitting'}
          className="w-full py-3.5 rounded-xl bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Confirm Attendance <ArrowRight className="h-4 w-4" /></>}
        </button>
        {status === 'error' && <p className="text-red-500 text-xs text-center">Something went wrong. Please try again.</p>}
      </form>
    </div>
  );
};

export const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, 'events', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setEvent({ id: docSnap.id, ...docSnap.data() });
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching event:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error('Failed to copy:', err); }
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => {
    if (event?.gallery && lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % event.gallery.length);
    }
  };
  const prevImage = () => {
    if (event?.gallery && lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + event.gallery.length) % event.gallery.length);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] dark:bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-[#5A3E2B] animate-spin mx-auto" />
          <p className="text-stone-500 text-xs tracking-wider uppercase">Loading legacy data...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDF8F0] dark:bg-slate-950">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto">
            <Heart className="h-10 w-10 text-stone-400" />
          </div>
          <h2 className="text-2xl font-serif italic text-[#2C1810] dark:text-white">Chapter Not Found</h2>
          <Link to="/events" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all">
            <ArrowLeft className="h-4 w-4" /> <span>Return to Events</span>
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages = event.gallery || [];

  return (
    <main className="min-h-screen bg-[#FDF8F0] dark:bg-slate-950">
      {/* Lightbox with navigation */}
      <AnimatePresence>
        {lightboxIndex !== null && galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              className="absolute top-5 right-5 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white z-10"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Previous button (desktop) */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white hidden md:block"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}

            {/* Next button (desktop) */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white hidden md:block"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={galleryImages[lightboxIndex]}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl cursor-pointer"
              alt="Full view"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image counter */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-xs">
                {lightboxIndex + 1} / {galleryImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero header (same as before) */}
      <section className="relative min-h-[50vh] md:h-[60vh] flex flex-col justify-end pb-12 md:pb-16 px-5 pt-20">
        <div className="absolute inset-0 z-0">
          <img src={event.img} alt={event.title} className="w-full h-full object-cover brightness-[0.35]" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-linear-to-t from-[#FDF8F0] dark:from-slate-950 via-transparent to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <Link to="/events" className="inline-flex items-center gap-2 text-amber-200/80 hover:text-white text-xs uppercase tracking-wider mb-6 transition-all group">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Events</span>
          </Link>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 text-amber-300 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[10px] tracking-[0.2em] uppercase">{event.type || 'Community Gathering'}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold italic leading-[1.1] text-white mb-6">{event.title}</h1>
            <div className="flex flex-wrap gap-4 md:gap-6 text-white/80">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span className="text-sm md:text-base">{event.date}, {event.year}</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span className="text-sm md:text-base">{event.location}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-20 px-5">
        <div className="max-w-7xl mx-auto">
          {/* Share button */}
          <div className="flex justify-end mb-8">
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 text-sm hover:bg-stone-50 dark:hover:bg-slate-800 transition-all">
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-12">
              {event.story && (
                <div className="space-y-4">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">The Narrative</h2>
                  <p className="text-lg md:text-2xl font-serif italic leading-relaxed text-[#2C1810] dark:text-white">{event.story}</p>
                </div>
              )}

              {event.impact && event.impact.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-8 border-y border-stone-200 dark:border-stone-800">
                  {event.impact.map((item: any, idx: number) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="text-center md:text-left">
                      <div className="text-3xl md:text-4xl font-serif font-bold text-[#5A3E2B] dark:text-amber-400">{item.value}</div>
                      <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mt-1">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Gallery - Full width, no leftover space, responsive grid */}
              {galleryImages.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {galleryImages.map((img: string, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: idx * 0.03 }}
                        className="group relative rounded-xl overflow-hidden cursor-zoom-in aspect-square bg-stone-100 dark:bg-stone-800"
                        onClick={() => openLightbox(idx)}
                      >
                        <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt={`Gallery ${idx + 1}`} loading="lazy" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="h-5 w-5 text-white" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {event.isUpcoming && <RSVPForm eventId={event.id} eventTitle={event.title} />}
              
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#5A3E2B]" />
                  <h3 className="font-serif font-bold italic text-[#2C1810] dark:text-white">Event Details</h3>
                </div>
                <div className="space-y-4">
                  {event.time && <div><p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Time</p><p className="text-sm">{event.time}</p></div>}
                  {event.location && <div><p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Venue</p><p className="text-sm">{event.location}</p></div>}
                </div>
              </div>

              {event.isUpcoming && event.timeline && event.timeline.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
                  <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-[#5A3E2B]" /><h3 className="font-serif font-bold italic">Timeline</h3></div>
                  <div className="space-y-5">
                    {event.timeline.map((step: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-[#5A3E2B] mt-2" />
                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#5A3E2B]">{step.time}</p><p className="text-sm">{step.activity}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};