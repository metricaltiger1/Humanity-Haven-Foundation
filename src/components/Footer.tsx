import React from 'react';
import { Link } from 'react-router-dom';
import { Music2, Instagram, Sparkles, ArrowUpRight, Code, Shield, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Get theme from localStorage
  const [isDark, setIsDark] = React.useState(false);
  const lightLogo = "/images/logo-light.png";
  const darkLogo = "/images/logo-dark.png";
  
  React.useEffect(() => {
    const isDarkMode = localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          setIsDark(isDarkNow);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white pt-20 md:pt-32 pb-12 px-5 border-t border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-16 md:mb-24">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3 group">
              {/* Logo image that changes based on theme */}
              <img 
                src={isDark ? lightLogo : darkLogo} 
                alt="Humanity's Haven Foundation" 
                className="h-8 w-auto group-hover:scale-110 transition-transform"
              />
              <span className="font-serif font-bold text-2xl tracking-tight text-[#2C1810] dark:text-white">
                Humanity's<span className="text-[#5A3E2B]">Haven</span>
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold italic leading-tight max-w-md text-[#2C1810] dark:text-white">
              Leading the world towards <span className="text-[#5A3E2B]">Radical</span> hope.
            </h2>
            <div className="flex gap-4">
              {[
                { Icon: Music2, href: "https://www.tiktok.com/@humanityshavenfoundation", label: "TikTok" },
                { Icon: Instagram, href: "https://www.instagram.com/humanityshavenfoundation", label: "Instagram" },
                { Icon: MessageCircle, href: "https://wa.me/254796917836", label: "WhatsApp" }
              ].map((social, i) => (
                <motion.a 
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-[#5A3E2B] hover:text-white hover:border-[#5A3E2B] transition-all"
                  aria-label={social.label}
                >
                  <social.Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3 space-y-5">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-400">Navigation</h4>
            <ul className="space-y-3">
              {[
                { name: 'About', path: '/about' },
                { name: 'Events', path: '/events' },
                { name: 'Shop', path: '/shop' },
                { name: 'Contact', path: '/contact' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="text-base font-serif font-medium italic group flex items-center gap-2 text-[#2C1810] dark:text-stone-300 hover:text-[#5A3E2B] transition-colors"
                  >
                    <span>{item.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 group-hover:translate-y-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4 space-y-5">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-400">Sanctuary Hub</h4>
            <div className="space-y-5 text-stone-600 dark:text-stone-400 text-sm">
              <div>
                <p className="text-[#2C1810] dark:text-white font-bold text-[10px] uppercase tracking-wider mb-1">East Africa</p>
                <p>Nakuru, Kenya</p>
                <p className="text-xs">+254 796 917 836</p>
              </div>
              <div>
                <p className="text-[#2C1810] dark:text-white font-bold text-[10px] uppercase tracking-wider mb-1">Email</p>
                <p>hello@haven.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Creative Credit */}
        <div className="pt-8 border-t border-stone-200 dark:border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-stone-400 uppercase">
            <Sparkles className="h-3 w-3" />
            <span>Design for the Future of Humanity</span>
          </div>
          
          {/* Creative Developer Credit */}
          <motion.a
            href="https://christopher-okumu-portfolio.web.app"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-50 dark:bg-stone-900/50 hover:bg-[#5A3E2B]/10 transition-all border border-stone-200 dark:border-stone-700"
          >
            <Code className="h-3 w-3 text-[#5A3E2B]" />
            <span className="text-[8px] font-medium text-stone-500 dark:text-stone-400 group-hover:text-[#5A3E2B] transition-colors">
              Built with integrity by
            </span>
            <span className="text-[8px] font-bold text-[#2C1810] dark:text-white group-hover:text-[#5A3E2B] transition-colors">
              Christopher Wasonga
            </span>
            <Shield className="h-3 w-3 text-[#5A3E2B] opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.a>

          <div className="text-[9px] font-bold tracking-wider text-stone-400 uppercase">
            &copy; {currentYear} • All Vows Reserved
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-[8px] text-stone-400">
            <span className="inline-flex items-center gap-1">
              <Shield className="h-2.5 w-2.5" />
              Secured by ethical protocols
            </span>
            <span className="mx-2">•</span>
            <span>100% of proceeds go to sanctuary programs</span>
          </p>
        </div>
      </div>
    </footer>
  );
};