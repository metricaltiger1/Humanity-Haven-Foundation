import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Heart, Sparkles, Users, Calendar, Gift, HandHeart, Shield, Droplets, BookOpen, Home as HomeIcon, Clock, MapPin, Phone, Mail, Quote, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

// ============ HERO SECTION WITH AUTO-TRANSITIONING IMAGES ============
const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=2070&auto=format&fit=crop",
      alt: "Children smiling together",
      gradient: "from-[#2C1810]/90 via-[#2C1810]/70 to-transparent"
    },
    {
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop",
      alt: "Children learning",
      gradient: "from-[#2C1810]/85 via-[#2C1810]/60 to-transparent"
    },
    {
      url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2026&auto=format&fit=crop",
      alt: "Community outreach",
      gradient: "from-[#2C1810]/90 via-[#2C1810]/70 to-transparent"
    },
    {
      url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
      alt: "Healthcare for children",
      gradient: "from-[#2C1810]/85 via-[#2C1810]/60 to-transparent"
    },
    {
      url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop",
      alt: "Volunteers helping",
      gradient: "from-[#2C1810]/90 via-[#2C1810]/70 to-transparent"
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="absolute inset-0"
          >
            <div className={`absolute inset-0 bg-linear-to-r ${heroImages[currentImageIndex].gradient} z-10`} />
            <img 
              src={heroImages[currentImageIndex].url}
              alt={heroImages[currentImageIndex].alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Animated floating orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#5A3E2B]/10 rounded-full blur-3xl"
        />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -150],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 6 + 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div 
        style={{ scale: heroScale }}
        className="max-w-7xl mx-auto w-full relative z-20 px-5"
      >
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Heart className="h-3 w-3 fill-amber-300" />
            </motion.div>
            <span>Humanity's Haven Foundation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold italic leading-[1.1] text-white mb-6"
          >
            Every Child Deserves <br />
            <motion.span 
              className="text-amber-300 inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >A Loving Home</motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-2xl"
          >
            Humanity's Haven Foundation is a sanctuary of hope, providing shelter, education, 
            and love to orphaned and vulnerable children. Join us in building brighter futures.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/donate" className="px-8 py-4 rounded-full bg-amber-500 text-[#2C1810] text-base font-bold hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-xl">
                <Heart className="h-5 w-5" />
                <span>Support a Child Today</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/events" className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white text-base font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>View All Events</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentImageIndex(index);
              setIsPlaying(false);
              setTimeout(() => setIsPlaying(true), 8000);
            }}
            className={cn(
              "transition-all duration-300 rounded-full",
              currentImageIndex === index
                ? "w-8 h-1.5 bg-amber-400"
                : "w-4 h-1.5 bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </section>
  );
};

// ============ MISSION SECTION ============
const MissionSection = () => {
  return (
    <section className="py-20 px-5 bg-[#FDF8F0] dark:bg-slate-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-64 h-64 bg-[#5A3E2B]/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 text-[#5A3E2B] font-bold tracking-[0.2em] uppercase text-[10px]"
            >
              <Heart className="h-3 w-3" />
              <span>Our Mission</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-serif font-bold italic text-[#2C1810] dark:text-white"
            >
              Creating Safe Havens for <br />
              <span className="text-[#5A3E2B]">Vulnerable Children</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-stone-600 dark:text-stone-400 leading-relaxed"
            >
              At Humanity's Haven Foundation, we believe every child deserves love, care, and 
              the opportunity to thrive. We provide a nurturing environment where orphaned 
              and abandoned children find safety, education, and hope for a brighter future.
            </motion.p>
            <div className="space-y-3 pt-4">
              {[
                { icon: Heart, text: "Provide love and emotional support" },
                { icon: BookOpen, text: "Access to quality education" },
                { icon: HomeIcon, text: "Safe and loving shelter" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-8 h-8 rounded-full bg-[#5A3E2B]/10 flex items-center justify-center"
                  >
                    <item.icon className="h-4 w-4 text-[#5A3E2B]" />
                  </motion.div>
                  <span className="text-sm text-[#2C1810] dark:text-white">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2026&auto=format&fit=crop"
                alt="Children learning"
                className="w-full h-100 object-cover transition-transform duration-700 hover:scale-110"
              />
            </motion.div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#5A3E2B] rounded-full -z-10"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============ UPCOMING EVENT SECTION (Conditional) ============
const UpcomingEvent = () => {
  const [upcomingEvent, setUpcomingEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvent = async () => {
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('isUpcoming', '==', true),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(eventsQuery);
        if (!snapshot.empty) {
          setUpcomingEvent({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        }
      } catch (error) {
        console.error('Error fetching upcoming event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingEvent();
  }, []);

  if (loading) return null;
  if (!upcomingEvent) return null;

  return (
    <section className="py-20 px-5 bg-[#2C1810] text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-amber-500/5 to-transparent"
        />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Calendar className="h-3 w-3" />
          </motion.div>
          <span>Mark Your Calendar</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-serif font-bold italic mb-6"
        >
          {upcomingEvent.title || "Upcoming Event"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/80 text-lg max-w-2xl mx-auto mb-8"
        >
          {upcomingEvent.description || "Join us for a day of love, laughter, and connection."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-6 mb-10"
        >
          <motion.div 
            whileHover={{ x: 5 }}
            className="flex items-center gap-4 text-amber-300"
          >
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{upcomingEvent.location || "Location TBA"}</span>
          </motion.div>
          <motion.div 
            whileHover={{ x: 5 }}
            className="flex items-center gap-4 text-amber-300"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-lg">{upcomingEvent.date || "Date TBA"}</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to={`/events/${upcomingEvent.id}`} className="px-8 py-3 rounded-full bg-amber-500 text-[#2C1810] font-bold hover:bg-amber-400 transition-all">
              Learn More
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/donate" className="px-8 py-3 rounded-full bg-white/10 border border-white/30 text-white font-medium hover:bg-white/20 transition-all">
              Support This Event
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ============ DONATION ITEMS SECTION ============
const DonationItems = () => {
  const items = [
    { name: "Sanitary Towels", icon: Heart },
    { name: "Tissues", icon: Heart },
    { name: "Dry Foods", icon: Heart },
    { name: "School Supplies", icon: BookOpen },
    { name: "Blankets", icon: HomeIcon },
    { name: "Toys", icon: Gift },
  ];

  return (
    <section className="py-20 px-5 bg-[#FDF8F0] dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-[#5A3E2B] font-bold tracking-[0.2em] uppercase text-[10px] mb-4"
          >
            <Gift className="h-3 w-3" />
            <span>Items Needed</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-serif font-bold italic text-[#2C1810] dark:text-white"
          >
            How You Can Help
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-stone-500 max-w-2xl mx-auto mt-4"
          >
            Your generosity, big or small, makes a world of difference. Here's what we urgently need:
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 text-center cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 rounded-full bg-[#5A3E2B]/10 flex items-center justify-center mx-auto mb-4"
              >
                <item.icon className="h-7 w-7 text-[#5A3E2B]" />
              </motion.div>
              <h3 className="text-xl font-bold text-[#2C1810] dark:text-white mb-2">{item.name}</h3>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link to="/contact" className="inline-flex items-center gap-2 text-[#5A3E2B] font-medium hover:underline group">
            <span>Contact us to donate items</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// ============ IMPACT STATS SECTION ============
const ImpactStats = () => {
  const stats = [
    { value: "150+", label: "Children Housed", icon: HomeIcon },
    { value: "100%", label: "School Enrollment", icon: BookOpen },
    { value: "15+", label: "Program Graduates", icon: Users },
    { value: "24/7", label: "Care & Support", icon: Heart },
  ];

  return (
    <section className="py-20 px-5 bg-[#5A3E2B] relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            initial={{ x: Math.random() * window.innerWidth, y: -50 }}
            animate={{ y: window.innerHeight + 50 }}
            transition={{ duration: Math.random() * 8 + 4, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold italic text-white"
          >
            Our Impact So Far
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-amber-200/80 mt-4"
          >
            Thanks to supporters like YOU
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.15, type: "spring", stiffness: 200 }}
              whileHover={{ y: -8 }}
              className="text-center cursor-pointer"
            >
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4"
              >
                <stat.icon className="h-8 w-8 text-amber-300" />
              </motion.div>
              <motion.p 
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: idx * 0.15 + 0.2 }}
                className="text-4xl md:text-5xl font-bold text-white"
              >
                {stat.value}
              </motion.p>
              <p className="text-amber-200/80 text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ TESTIMONIAL SECTION ============
const TestimonialSection = () => {
  return (
    <section className="py-20 px-5 bg-[#FDF8F0] dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold italic text-[#2C1810] dark:text-white"
          >
            Stories of Hope
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-stone-500 mt-4"
          >
            Real lives changed through your support
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-stone-200 dark:border-stone-800 shadow-md hover:shadow-xl transition-all"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12"
            >
              <Quote className="h-8 w-8 text-[#5A3E2B] mb-4" />
            </motion.div>
            <p className="text-stone-600 dark:text-stone-400 italic leading-relaxed">
              "Thanks to the supporters, I was able to go back to school. 
              Now I'm in high school and hoping to become a doctor someday."
            </p>
            <p className="font-bold text-[#2C1810] dark:text-white mt-4">— Sarah, Age 14</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-stone-200 dark:border-stone-800 shadow-md hover:shadow-xl transition-all"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12"
            >
              <Quote className="h-8 w-8 text-[#5A3E2B] mb-4" />
            </motion.div>
            <p className="text-stone-600 dark:text-stone-400 italic leading-relaxed">
              "The love and care I received gave me a second chance at life. 
              I'm forever grateful to this family."
            </p>
            <p className="font-bold text-[#2C1810] dark:text-white mt-4">— James, Age 17</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============ CALL TO ACTION SECTION ============
const CTASection = () => {
  return (
    <section className="py-20 px-5 bg-[#2C1810] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-linear-to-tr from-amber-500/10 via-transparent to-transparent"
        />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-500/20 rounded-full"
            initial={{ x: Math.random() * window.innerWidth, y: -50 }}
            animate={{ y: window.innerHeight + 50 }}
            transition={{ duration: Math.random() * 6 + 3, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200 }}
          className="space-y-6"
        >
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto"
          >
            <Heart className="h-10 w-10 text-amber-400" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-bold italic text-white"
          >
            Ready to Make a Difference?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-lg max-w-2xl mx-auto"
          >
            Your support, whether through donation, volunteering, or spreading the word, 
            transforms lives and builds hope for these precious children.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/donate" className="px-8 py-3 rounded-full bg-amber-500 text-[#2C1810] font-bold hover:bg-amber-400 transition-all">
                Support a Child Today
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/contact" className="px-8 py-3 rounded-full bg-white/10 border border-white/30 text-white font-medium hover:bg-white/20 transition-all">
                Volunteer With Us
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/shop" className="px-8 py-3 rounded-full bg-white/10 border border-white/30 text-white font-medium hover:bg-white/20 transition-all">
                Shop to Support
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ============ MAIN HOME COMPONENT ============
export const Home = () => {
  return (
    <main>
      <Hero />
      <MissionSection />
      <ImpactStats />
      <DonationItems />
      <UpcomingEvent />
      <TestimonialSection />
      <CTASection />
    </main>
  );
};