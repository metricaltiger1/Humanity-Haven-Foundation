import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Sparkles, Clock, ArrowRight, Heart, Timer, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventData);
      setIsLoading(false);
    }, (error) => {
      console.error("Events fetch error:", error);
      try {
        handleFirestoreError(error, OperationType.GET, 'events');
      } catch (e) {}
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const upcomingEvents = events.filter(e => e.isUpcoming);
  const pastEvents = events.filter(e => !e.isUpcoming);

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-slate-950 pb-16 md:pb-24">
      <div className="px-5 md:px-8 pt-20 md:pt-24 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section - Compact & Balanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 md:mb-20"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-[#5A3E2B] dark:text-amber-400 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-4">
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                  <span>Chapter Timeline & Archives</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold italic leading-[1.1] md:leading-[1.2] text-[#2C1810] dark:text-white">
                  The <span className="text-[#5A3E2B] dark:text-amber-400">Sanctuary</span>
                  <br className="hidden sm:block" /> Chronicle.
                </h1>
              </div>
              <div className="flex-1 md:text-right">
                <p className="text-sm md:text-base lg:text-lg text-stone-500 dark:text-stone-400 italic leading-relaxed max-w-lg md:ml-auto">
                  Tracking our movement from ambition to tangible impact. Join the upcoming chapters or witness our legacy.
                </p>
              </div>
            </div>
            
            {/* Decorative line */}
            <div className="h-px bg-linear-to-r from-transparent via-[#5A3E2B]/20 to-transparent mt-6 md:mt-8" />
          </motion.div>

          {/* Upcoming Gatherings */}
          <div className="mb-16 md:mb-24">
            <div className="flex items-center gap-3 mb-6 md:mb-10">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#5A3E2B]/10 rounded-full flex items-center justify-center">
                <Timer className="h-4 w-4 md:h-5 md:w-5 text-[#5A3E2B] dark:text-amber-400" />
              </div>
              <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-stone-400">Next Horizons</h2>
              <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[1, 2, 3].map((skeleton) => (
                  <div key={skeleton} className="animate-pulse">
                    <div className="rounded-2xl bg-stone-100 dark:bg-stone-800 h-125" />
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {upcomingEvents.map((event, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    {/* Event Card - Responsive Grid Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-stone-100 dark:border-stone-800 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-56 md:h-64 overflow-hidden">
                        <motion.img 
                          initial={{ scale: 1.1 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 1.2 }}
                          src={event.img} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Date Badge */}
                        <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4">
                          <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/20">
                            <span className="text-lg md:text-xl lg:text-2xl font-serif font-black italic text-white leading-none block">
                              {event.date}
                            </span>
                            <p className="text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase text-white/60 mt-1">
                              Live Gathering
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="p-5 md:p-6 space-y-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="px-2 md:px-3 py-1 rounded-full bg-[#5A3E2B] text-white text-[8px] md:text-[9px] font-bold uppercase tracking-wider">
                            {event.type || 'Community'}
                          </span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-serif font-bold leading-tight group-hover:text-[#5A3E2B] dark:group-hover:text-amber-400 transition-colors text-[#2C1810] dark:text-white line-clamp-2">
                          {event.title}
                        </h3>
                        
                        <p className="text-stone-500 dark:text-stone-400 text-xs md:text-sm leading-relaxed line-clamp-3">
                          {event.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t border-stone-100 dark:border-stone-800 mt-auto">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-stone-400">
                              <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                              <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em]">Time</p>
                            </div>
                            <p className="text-xs md:text-sm font-medium text-[#2C1810] dark:text-white line-clamp-1">
                              {event.time}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-stone-400">
                              <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3" />
                              <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em]">Venue</p>
                            </div>
                            <p className="text-xs md:text-sm font-medium text-[#2C1810] dark:text-white line-clamp-1">
                              {event.location}
                            </p>
                          </div>
                        </div>

                        <Link to={`/events/${event.id}`} className="flex items-center justify-between w-full py-2.5 md:py-3 px-4 md:px-5 rounded-full bg-[#2C1810] dark:bg-amber-600 text-white text-xs md:text-sm font-medium hover:bg-[#5A3E2B] dark:hover:bg-amber-700 transition-all group/btn mt-2">
                          <span>Explore Chapter</span>
                          <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State for Upcoming Events */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 md:py-24 bg-white dark:bg-slate-900 rounded-3xl border border-stone-100 dark:border-stone-800"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-stone-100 dark:bg-stone-800 mb-4 md:mb-6">
                  <CalendarDays className="h-8 w-8 md:h-10 md:w-10 text-stone-400" />
                </div>
                <h3 className="text-lg md:text-xl font-serif font-bold text-[#2C1810] dark:text-white mb-2">
                  No Upcoming Events
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Check back soon for future gatherings and opportunities to make an impact.
                </p>
              </motion.div>
            )}
          </div>

          {/* Past Events Archive - Full Width Cinematic Cards */}
          {pastEvents.length > 0 && (
            <div className="relative">
              <div className="text-center mb-8 md:mb-12">
                <span className="text-[9px] md:text-xs font-bold tracking-[0.5em] text-stone-400 uppercase block mb-3">Legacy Records</span>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold italic text-[#2C1810] dark:text-white">
                  The <span className="text-[#5A3E2B] dark:text-amber-400">Impact</span> Archive.
                </h2>
                <div className="w-12 md:w-16 h-px bg-[#5A3E2B] mx-auto mt-3 md:mt-4" />
              </div>
              
              {isLoading ? (
                <div className="space-y-6 md:space-y-8">
                  {[1, 2, 3].map((skeleton) => (
                    <div key={skeleton} className="animate-pulse rounded-3xl bg-stone-100 dark:bg-stone-800 h-87.5 md:h-112.5" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {pastEvents.map((event, i) => (
                    <Link key={event.id} to={`/events/${event.id}`}>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative rounded-2xl md:rounded-3xl overflow-hidden h-87.5 md:h-112.5 lg:h-125 shadow-lg cursor-pointer"
                      >
                        <img 
                          src={event.img} 
                          alt={event.title}
                          className="w-full h-full object-cover grayscale brightness-[0.4] group-hover:grayscale-0 group-hover:brightness-90 group-hover:scale-110 transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-80" />
                        <div className="absolute inset-0 p-6 md:p-8 lg:p-12 flex flex-col justify-end">
                          <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="px-2 md:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                                {event.date}
                              </span>
                              <div className="h-px flex-1 bg-white/20" />
                            </div>
                            <h4 className="text-xl md:text-3xl lg:text-4xl font-serif font-bold italic text-white leading-tight">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[#5A3E2B] dark:text-amber-400">
                              <Heart className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                              <span className="text-sm md:text-base italic font-light text-white/80">
                                {event.impact?.[0] ? `${event.impact[0].value} ${event.impact[0].label}` : 'Sanctuary Legacy'}
                              </span>
                            </div>
                            <div className="pt-3 md:pt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                              <span className="inline-flex items-center gap-2 text-white font-bold tracking-wider uppercase text-[9px] md:text-[10px]">
                                <span>Review Full Impact</span>
                                <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};