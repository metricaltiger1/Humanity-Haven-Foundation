import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorToast } from './lib/ErrorToast'; 
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Shop } from './pages/Shop';
import { Contact } from './pages/Contact';
import { Donate } from './pages/Donate';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';
import { DownloadPass } from './pages/DownloadPass';

const lightLogo = "/images/logo-light.png";
const darkLogo = "/images/logo-dark.png";

const GlobalLoader = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#FDF8F0] dark:bg-slate-950"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Rotating ring with text */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="relative w-32 h-32"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#5A3E2B] dark:text-amber-400">
            <path 
              id="circlePath" 
              d="M 50, 50 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" 
              fill="transparent" 
            />
            <text 
              fontSize="12" 
              fill="currentColor" 
              letterSpacing="3" 
              className="uppercase font-bold tracking-widest font-serif"
            >
              <textPath href="#circlePath" startOffset="0%">
                • Sanctuary • Foundation • Hope •
              </textPath>
            </text>
          </svg>
        </motion.div>

        {/* Logo image in the center */}
        <motion.div 
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg overflow-hidden">
            <img 
              src={isDark ? lightLogo : darkLogo} 
              alt="Humanity's Haven Foundation" 
              className="w-16 h-16 object-contain p-1"
            />
          </div>
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A3E2B] dark:text-amber-400"
      >
        Sweet Havens
      </motion.p>
    </motion.div>
  );
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="relative min-h-screen bg-brand-cream dark:bg-slate-950 font-sans">
      <Navbar />
      <Cart />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/download/:token" element={<DownloadPass />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {isHomePage && <Footer />}
      <ErrorToast />
    </div>
  );
};

export default function App() {
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <AnimatePresence mode="wait">
            {initialLoad && <GlobalLoader key="global-loader" />}
          </AnimatePresence>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}