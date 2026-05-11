import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { Heart, Sparkles, Quote, Globe, Users, ShieldCheck, ArrowRight, Star, Compass } from 'lucide-react';
import { cn } from '../lib/utils';

export const About = () => {
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  const stats = [
    { label: "Lives Touched", value: "1.2M+", icon: Heart },
    { label: "Global Hubs", value: "24", icon: Globe },
    { label: "Volunteers", value: "15k+", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-slate-950 pb-16 overflow-x-hidden">
      
      {/* Hero Section - Enhanced Animations */}
      <motion.section 
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="relative px-5 pt-20 md:pt-24 pb-8 overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 left-10 w-64 h-64 bg-[#5A3E2B]/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#5A3E2B]/3 rounded-full blur-2xl"
          />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 text-[#5A3E2B] dark:text-amber-400 font-bold tracking-[0.2em] uppercase text-[9px] mb-4 px-4 py-2 rounded-full bg-[#5A3E2B]/5"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-3 w-3" />
            </motion.div>
            <span>The Sanctuary Genesis</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold italic leading-[1.1] text-[#2C1810] dark:text-white mb-4"
          >
            For <motion.span 
              className="text-[#5A3E2B] dark:text-amber-400 inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >Humanity</motion.span>.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-xl text-stone-500 italic max-w-2xl mx-auto leading-relaxed"
          >
            "We didn't build a foundation; we sparked a movement to ensure no soul is left in the silence of neglect."
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-px bg-linear-to-r from-transparent via-[#5A3E2B]/30 to-transparent mx-auto mt-8"
          />
        </div>
      </motion.section>

      {/* Founder's Vision - Enhanced Animations */}
      <section className="py-12 md:py-24 px-5">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 mb-10"
          >
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                transition={{ duration: 0.6 }}
                className="h-px bg-[#5A3E2B]"
              />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-400">The Architect of Hope</span>
            </div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold italic leading-[1.1] text-[#2C1810] dark:text-white"
            >
              From empathy to <span className="text-[#5A3E2B] dark:text-amber-400">Action</span>.
            </motion.h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Founder Image with floating animation */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              {/* Decorative rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -left-4 w-full h-full border border-[#5A3E2B]/10 rounded-3xl"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-4 -right-4 w-full h-full border border-amber-500/10 rounded-3xl"
              />
              
              <div className="relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img 
                  src="/images/founder.png?q=80&w=1976&auto=format&fit=crop" 
                  alt="Esther Wanjiru Karue" 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-0 left-0 right-0 p-5 bg-linear-to-t from-black/70 via-black/40 to-transparent rounded-b-2xl"
                >
                  <p className="text-white text-lg font-serif font-bold italic">Esther Wanjiru Karue</p>
                  <p className="text-amber-300 text-[9px] font-bold uppercase tracking-wider">Visionary & Founder</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Founder Message with staggered animations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base leading-relaxed">
                  Growing up in the heart of East Africa, Esther witnessed a painful paradox: immense human potential stifled by the lack of a basic safety net.
                </p>
                <motion.p 
                  whileHover={{ scale: 1.02 }}
                  className="text-[#2C1810] dark:text-white text-base md:text-lg italic font-medium border-l-3 border-[#5A3E2B] pl-4 transition-all"
                >
                  "Helping those in need isn't charity; it's a recalibration of justice. It's about restoring the dignity that circumstance tried to steal."
                </motion.p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-stone-200 dark:border-stone-800"
              >
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="space-y-2 transition-all"
                >
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-9 h-9 bg-[#5A3E2B]/10 rounded-xl flex items-center justify-center"
                  >
                    <Quote className="h-4 w-4 text-[#5A3E2B]" />
                  </motion.div>
                  <h4 className="text-sm font-serif font-bold italic text-[#2C1810] dark:text-white">The Humanity Vow</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    A commitment to dedicate every resource to the empowerment of the underserved.
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="space-y-2 transition-all"
                >
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-9 h-9 bg-[#5A3E2B]/10 rounded-xl flex items-center justify-center"
                  >
                    <ShieldCheck className="h-4 w-4 text-[#5A3E2B]" />
                  </motion.div>
                  <h4 className="text-sm font-serif font-bold italic text-[#2C1810] dark:text-white">Unwavering Integrity</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Ensuring that 100% of public support reaches the frontlines of our sanctuaries.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Animated Cards */}
      <section className="py-14 md:py-24 px-5 bg-[#2C1810] text-white relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full"
              initial={{ x: Math.random() * window.innerWidth, y: -50 }}
              animate={{ y: window.innerHeight + 50 }}
              transition={{ duration: Math.random() * 8 + 4, repeat: Infinity, delay: Math.random() * 5 }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-400/60 mb-10"
          >
            The Footprint of Compassion
          </motion.h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.15, type: "spring", stiffness: 200 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="space-y-3 cursor-pointer"
              >
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto"
                >
                  <stat.icon className="h-6 w-6 text-amber-400" />
                </motion.div>
                <div>
                  <motion.p 
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: idx * 0.15 + 0.2 }}
                    className="text-3xl md:text-4xl font-serif font-bold italic text-white mb-1"
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-white/40">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section - Enhanced */}
      <section className="py-12 md:py-24 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-12 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-serif font-bold italic leading-[1.1] text-[#2C1810] dark:text-white"
              >
                A sanctuary for the <span className="text-[#5A3E2B] dark:text-amber-400">Silenced</span>.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-stone-600 dark:text-stone-400 text-sm md:text-base leading-relaxed"
              >
                We focus on the intersections of extreme poverty, lack of education, and healthcare deserts. Our purpose is to build durable systems of support that outlast temporary aid.
              </motion.p>
              
              <div className="space-y-3">
                {[
                  "Building sustainable learning environments in urban slums.",
                  "Deploying mobile health sanctuaries to remote border regions.",
                  "Empowering local leaders to take ownership of their future."
                ].map((point, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex gap-3 group cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.2 }}
                      className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5A3E2B] shrink-0"
                    />
                    <p className="text-sm text-[#2C1810] dark:text-stone-300">{point}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="pt-3"
              >
                <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all group">
                  <span>Collaborate with Us</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>

            {/* Image Grid with hover animations */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-2"
            >
              <div className="space-y-2">
                <motion.div whileHover={{ scale: 1.02 }} className="overflow-hidden rounded-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2026&auto=format&fit=crop" 
                    className="rounded-xl h-40 w-full object-cover transition-transform duration-500 hover:scale-110" 
                    alt="Sanctuary activity" 
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className="overflow-hidden rounded-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" 
                    className="rounded-xl h-28 w-full object-cover transition-transform duration-500 hover:scale-110" 
                    alt="Needy support" 
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>
              <div className="space-y-2 pt-5">
                <motion.div whileHover={{ scale: 1.02 }} className="overflow-hidden rounded-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop" 
                    className="rounded-xl h-28 w-full object-cover transition-transform duration-500 hover:scale-110" 
                    alt="Education focus" 
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className="overflow-hidden rounded-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" 
                    className="rounded-xl h-40 w-full object-cover transition-transform duration-500 hover:scale-110" 
                    alt="Health focus" 
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action - Enhanced */}
      <section className="py-12 md:py-20 px-5 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.1, rotate: 360 }}
            className="w-14 h-14 bg-[#5A3E2B]/10 rounded-full flex items-center justify-center mx-auto cursor-pointer"
          >
            <Heart className="h-6 w-6 text-[#5A3E2B]" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-4xl font-serif font-bold italic leading-[1.2] text-[#2C1810] dark:text-white"
          >
            Humanity's Haven is a vow to <motion.span 
              className="text-[#5A3E2B] dark:text-amber-400 inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >Persist</motion.span>.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mx-auto"
          >
            Join us in rewriting the narrative for the needy. We don't just provide aid; we build sanctuaries of dignity.
          </motion.p>
        </div>
      </section>
    </div>
  );
};