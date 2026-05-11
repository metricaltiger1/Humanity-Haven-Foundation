import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Sun, Moon, Sparkles, ShoppingBag, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { auth } from '../lib/firebase';

const lightLogo = "/images/logo-light.png";
const darkLogo = "/images/logo-dark.png";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const location = useLocation();
  const { cartCount, setIsCartOpen } = useCart();

  // Check admin authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAdminLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const isDarkMode = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newDark = !document.documentElement.classList.contains('dark');
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Shop', path: '/shop' },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-5">
        <div 
          className={cn(
            "flex justify-between items-center transition-all duration-300",
            scrolled ? "h-14 md:h-16" : "h-16 md:h-20"
          )}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              {/* Logo that changes based on theme */}
              <img 
                src={isDark ? lightLogo : darkLogo} 
                alt="Humanity's Haven Foundation" 
                className="h-8 w-auto md:h-10 group-hover:scale-105 transition-transform"
              />
              <Sparkles className="h-2.5 w-2.5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="font-serif font-bold text-lg md:text-xl tracking-tight text-[#2C1810] dark:text-white">
              Humanity's<span className="text-[#5A3E2B]">Haven</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  location.pathname === link.path 
                    ? "bg-[#5A3E2B] text-white" 
                    : "text-stone-600 dark:text-stone-400 hover:text-[#5A3E2B] hover:bg-stone-100 dark:hover:bg-stone-800"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Admin Button - Only shows when logged in */}
            {isAdminLoggedIn && (
              <Link
                to="/admin"
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  location.pathname === '/admin' 
                    ? "bg-[#5A3E2B] text-white" 
                    : "text-stone-600 dark:text-stone-400 hover:text-[#5A3E2B] hover:bg-stone-100 dark:hover:bg-stone-800"
                )}
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <ShoppingBag className="h-5 w-5 text-stone-600 dark:text-stone-400" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#5A3E2B] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-stone-600" />}
            </button>

            {/* Support Button */}
            <Link 
              to="/donate" 
              className="ml-2 px-5 py-2 rounded-full bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all"
            >
              Support
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-2 rounded-full bg-stone-100 dark:bg-stone-800"
            >
              <ShoppingBag className="h-4 w-4 text-stone-600 dark:text-stone-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#5A3E2B] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-stone-100 dark:bg-stone-800"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-stone-600" />}
            </button>
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full bg-[#2C1810] text-white"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 mx-5 mt-2 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    location.pathname === link.path 
                      ? "bg-[#5A3E2B] text-white" 
                      : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Admin Button in Mobile Menu */}
              {isAdminLoggedIn && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                    location.pathname === '/admin' 
                      ? "bg-[#5A3E2B] text-white" 
                      : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              
              <div className="h-px bg-stone-200 dark:bg-stone-700 my-1" />
              <Link
                to="/donate"
                onClick={() => setIsOpen(false)}
                className="py-3 rounded-xl bg-[#2C1810] text-white text-center font-medium text-sm"
              >
                Support
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};