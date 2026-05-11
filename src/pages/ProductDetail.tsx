import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowLeft, Heart, Sparkles, Plus, Minus, ShieldCheck, MapPin, Loader2, ZoomIn, X, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

export const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, 'products', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching product", error);
      setProduct(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    
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
      quantity: quantity
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      setFullScreenImage(null);
    }
  };

  const allImages = product ? [product.image, ...(product.gallery || [])] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] dark:bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-[#5A3E2B] animate-spin mx-auto" />
          <p className="text-stone-500 text-xs tracking-wider uppercase">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDF8F0] dark:bg-slate-950">
        <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-stone-400" />
        </div>
        <h2 className="text-2xl font-serif font-bold italic text-[#2C1810] dark:text-white mb-4">Product Not Found</h2>
        <Link to="/shop" className="px-6 py-3 rounded-full bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock !== undefined && product.stock <= 5 && product.stock > 0;

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-slate-950 pb-16 md:pb-24">
      <div className="px-5 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Back Link */}
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 text-stone-500 hover:text-[#5A3E2B] transition-colors mb-6 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Back to Shop</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            {/* Images Section */}
            <div>
              {/* Main Image */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 mb-4"
              >
                <img 
                  src={activeImage || product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className="px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#2C1810] text-[8px] font-bold uppercase tracking-wider">
                    Community Made
                  </span>
                  {isLowStock && !isOutOfStock && (
                    <span className="px-2 py-1 rounded-full bg-[#5A3E2B]/90 text-white text-[8px] font-bold uppercase tracking-wider">
                      Only {product.stock} left
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="px-2 py-1 rounded-full bg-stone-500/90 text-white text-[8px] font-bold uppercase tracking-wider">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Zoom Button */}
                <button
                  onClick={() => setFullScreenImage(activeImage || product.image)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-300"
                >
                  <ZoomIn className="h-3.5 w-3.5 text-[#2C1810]" />
                </button>
              </motion.div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={cn(
                        "shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all",
                        (activeImage === img || (!activeImage && idx === 0)) 
                          ? "ring-2 ring-[#5A3E2B] opacity-100" 
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Category & Title */}
              <div>
                <div className="inline-flex items-center gap-2 text-[#5A3E2B] dark:text-amber-400 mb-3">
                  <Sparkles className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{product.category}</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold italic text-[#2C1810] dark:text-white leading-tight mb-4">
                  {product.name}
                </h1>
                
                {/* Price & Impact */}
                <div className="flex items-center justify-between flex-wrap gap-3 py-4 border-t border-b border-stone-200 dark:border-stone-800">
                  <span className="text-2xl md:text-3xl font-bold text-[#2C1810] dark:text-white">
                    Ksh {product.price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                    <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                      {product.impact}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                {product.description}
              </p>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-stone-700">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock}
                      className="p-2.5 hover:text-[#5A3E2B] transition-colors disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-medium text-base">{quantity}</span>
                    <button 
                      onClick={() => {
                        if (product.stock !== undefined && quantity >= product.stock) return;
                        setQuantity(quantity + 1);
                      }}
                      disabled={isOutOfStock}
                      className="p-2.5 hover:text-[#5A3E2B] transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 py-3 rounded-xl bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addedToCart ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Info Icons */}
              <div className="grid grid-cols-3 gap-3 pt-6">
                <div className="text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto">
                    <MapPin className="h-3.5 w-3.5 text-stone-500" />
                  </div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-stone-500">Event Pickup</p>
                </div>
                <div className="text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-3.5 w-3.5 text-stone-500" />
                  </div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-stone-500">Ethically Made</p>
                </div>
                <div className="text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto">
                    <Heart className="h-3.5 w-3.5 text-stone-500" />
                  </div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-stone-500">100% Impact</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setFullScreenImage(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button 
              onClick={() => setFullScreenImage(null)}
              className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 text-white"
            >
              <X className="h-5 w-5" />
            </button>
            
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={fullScreenImage}
              alt="Full size view"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent">
              <p className="text-center text-white text-sm font-serif italic">{product.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};