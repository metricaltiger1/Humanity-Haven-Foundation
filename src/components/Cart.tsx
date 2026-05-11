import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FDF8F0] dark:bg-slate-950 z-101 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#5A3E2B]/10 rounded-xl">
                  <ShoppingBag className="h-5 w-5 text-[#5A3E2B]" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold italic text-[#2C1810] dark:text-white">
                    Your Cart
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-12">
                  <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-stone-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold italic text-[#2C1810] dark:text-white mb-1">
                      Your cart is empty
                    </h3>
                    <p className="text-xs text-stone-500">Start your impact journey today.</p>
                  </div>
                  <Link 
                    to="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-[#2C1810] text-white text-xs font-medium hover:bg-[#5A3E2B] transition-all"
                  >
                    Browse Collection
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    {/* Product Image */}
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-serif font-bold italic text-[#2C1810] dark:text-white group-hover:text-[#5A3E2B] transition-colors line-clamp-2">
                          {item.name}
                        </h4>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-rose-500 transition-colors shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      
                      {/* Impact */}
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-2.5 w-2.5 text-rose-500 fill-rose-500" />
                        <span className="text-[8px] font-bold uppercase tracking-wider text-stone-500">
                          {item.impact}
                        </span>
                      </div>
                      
                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-stone-200 dark:border-stone-700">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1.5 hover:text-[#5A3E2B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-[#2C1810] dark:text-white">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                            className="p-1.5 hover:text-[#5A3E2B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-[#2C1810] dark:text-white">
                          Ksh {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                      Total
                    </p>
                    <p className="text-2xl font-bold text-[#2C1810] dark:text-white">
                      Ksh {cartTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-[#5A3E2B]">
                      100% to Impact
                    </p>
                    <p className="text-[8px] text-stone-400">Tax-deductible</p>
                  </div>
                </div>
                
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#2C1810] text-white text-sm font-medium hover:bg-[#5A3E2B] transition-all flex items-center justify-center gap-2"
                >
                  <span>Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 text-xs font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};