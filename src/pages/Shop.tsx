import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Sparkles, Heart, Loader2, X, ZoomIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useState, useEffect, useRef } from 'react';

export const Shop = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(fetchedProducts);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === undefined || product.stock > 0) {
      // Convert Product to CartItem by adding quantity
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
        category: product.category,
        impact: product.impact,
        description: product.description,
        quantity: 1
      });
    }
  };

  const openLightbox = (product: Product) => {
    setSelectedProduct(product);
    setSelectedImage(product.image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedProduct(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      closeLightbox();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-slate-950 pb-16 md:pb-24">
      <div className="px-5 pt-20 md:pt-24 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 md:mb-16"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-[#5A3E2B] dark:text-amber-400 font-bold tracking-[0.2em] uppercase text-[10px] mb-4">
                  <Sparkles className="h-3 w-3" />
                  <span>Branded for a Cause</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold italic leading-[1.1] text-[#2C1810] dark:text-white">
                  Wear the <br />
                  <span className="text-[#5A3E2B] dark:text-amber-400">Movement</span>.
                </h1>
              </div>
              <div className="flex-1 md:text-right">
                <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 italic leading-relaxed max-w-lg md:ml-auto">
                  Branded humanitarian gear for fundraising and awareness. 100% of proceeds go directly to our relief hubs.
                </p>
              </div>
            </div>
            <div className="h-px bg-linear-to-r from-transparent via-stone-200 to-transparent mt-6" />
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="animate-pulse">
                  <div className="aspect-3/4 rounded-2xl bg-stone-200 dark:bg-stone-800 mb-4" />
                  <div className="space-y-3">
                    <div className="h-3 w-20 bg-stone-200 dark:bg-stone-800 rounded-full" />
                    <div className="h-6 w-32 bg-stone-200 dark:bg-stone-800 rounded" />
                    <div className="h-4 w-24 bg-stone-200 dark:bg-stone-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-serif font-bold italic text-[#2C1810] dark:text-white mb-2">
                No products yet
              </h3>
              <p className="text-stone-500 text-sm">Check back soon for new arrivals!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                  <Link to={`/shop/${product.id}`} className="block">
                    {/* Image Container */}
                    <div className="relative aspect-3/4 rounded-2xl overflow-hidden mb-4 bg-stone-100 dark:bg-stone-800">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        referrerPolicy="no-referrer" 
                      />
                      
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className="px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#2C1810] text-[8px] font-bold uppercase tracking-wider">
                          Limited
                        </span>
                        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                          <span className="px-2 py-1 rounded-full bg-[#5A3E2B]/90 text-white text-[8px] font-bold uppercase tracking-wider">
                            Only {product.stock} left
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="px-2 py-1 rounded-full bg-stone-500/90 text-white text-[8px] font-bold uppercase tracking-wider">
                            Sold Out
                          </span>
                        )}
                      </div>

                      {/* Zoom Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openLightbox(product);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <ZoomIn className="h-3.5 w-3.5 text-[#2C1810]" />
                      </button>

                      {/* Add to Cart Button */}
                      {product.stock !== 0 && (
                        <button 
                          onClick={(e) => handleAddToCart(e, product)}
                          className="absolute bottom-3 right-3 w-10 h-10 bg-[#2C1810] hover:bg-[#5A3E2B] text-white rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[#5A3E2B] dark:text-amber-400">
                            {product.category}
                          </p>
                          <h3 className="text-lg md:text-xl font-serif font-bold italic text-[#2C1810] dark:text-white group-hover:text-[#5A3E2B] dark:group-hover:text-amber-400 transition-colors leading-tight mt-0.5">
                            {product.name}
                          </h3>
                        </div>
                        <div className="text-lg md:text-xl font-bold text-[#2C1810] dark:text-white">
                          Ksh {product.price.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                          {product.impact}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button 
              onClick={closeLightbox}
              className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 text-white"
            >
              <X className="h-5 w-5" />
            </button>
            
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            {selectedProduct && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent">
                <div className="max-w-md mx-auto text-center">
                  <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    {selectedProduct.category}
                  </p>
                  <h3 className="text-xl font-serif font-bold italic text-white mb-2">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-white/80 text-sm mb-3">
                    {selectedProduct.description}
                  </p>
                  <p className="text-amber-400 text-sm font-bold">
                    Ksh {selectedProduct.price.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};