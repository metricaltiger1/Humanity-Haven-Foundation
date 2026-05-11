import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Calendar, 
  ShoppingBag, 
  Trash2, 
  CheckCircle, 
  Heart, 
  Users,
  LayoutDashboard,
  ShieldCheck,
  Plus,
  X,
  Save,
  Loader2,
  Mail,
  TrendingUp,
  Package,
  Search,
  Inbox,
  PackageOpen,
  Gift,
  LogOut,
  ImageIcon,
  Scan,
  QrCode
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ImageUploadElement } from '../components/ImageUploader';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useErrorToast } from '../lib/ErrorToast';

// ============ SKELETON LOADER ============
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-stone-100 dark:bg-stone-800 rounded-xl h-32 mb-3" />
    <div className="bg-stone-100 dark:bg-stone-800 rounded-lg h-5 w-3/4 mb-2" />
    <div className="bg-stone-100 dark:bg-stone-800 rounded-lg h-4 w-1/2" />
  </div>
);

const SkeletonStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 mb-3" />
        <div className="h-3 w-20 bg-stone-100 dark:bg-stone-800 rounded mb-2" />
        <div className="h-7 w-16 bg-stone-100 dark:bg-stone-800 rounded" />
      </div>
    ))}
  </div>
);

// ============ EMPTY STATE ============
const EmptyState = ({ icon: Icon, title, message }: { icon: any; title: string; message: string }) => (
  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-stone-800">
    <Icon className="h-12 w-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
    <p className="text-stone-500 dark:text-stone-400 font-medium">{title}</p>
    <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">{message}</p>
  </div>
);

// ============ STAT CARD ============
const AdminStat = ({ label, value, icon: Icon }: any) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-[#5A3E2B]/10 dark:bg-[#5A3E2B]/20 flex items-center justify-center">
        <Icon className="h-5 w-5 text-[#5A3E2B] dark:text-amber-400" />
      </div>
    </div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-[#2C1810] dark:text-white">{value}</p>
  </motion.div>
);

// ============ ORDER CONFIRMATION MODAL ============
const OrderConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  order, 
  isProcessing 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  order: any; 
  isProcessing: boolean;
}) => {
  if (!isOpen || !order) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2 text-[#2C1810] dark:text-white">Confirm Pickup</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 text-center mb-4">
          Please verify the order details before confirming pickup.
        </p>
        
        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 space-y-2 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-stone-500 dark:text-stone-400">Order ID:</span>
            <span className="font-mono font-bold text-[#2C1810] dark:text-white">{order.orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500 dark:text-stone-400">Customer:</span>
            <span className="font-medium text-[#2C1810] dark:text-white">{order.customerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500 dark:text-stone-400">Items:</span>
            <span className="font-medium text-[#2C1810] dark:text-white">{order.items?.length || 0} items</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500 dark:text-stone-400">Total:</span>
            <span className="font-bold text-[#5A3E2B] dark:text-amber-400">Ksh {order.totalAmount?.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="flex-1 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isProcessing}
            className="flex-1 px-4 py-2 rounded-xl bg-[#2C1810] dark:bg-[#2C1810] text-white hover:bg-[#5A3E2B] dark:hover:bg-[#5A3E2B] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Confirm Pickup</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============ CONFIRM MODAL ============
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string }) => {
  if (!isOpen) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2 text-[#2C1810] dark:text-white">{title}</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition">
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============ QR SCANNER MODAL WITH CAMERA ============
const QRScannerModal = ({ isOpen, onClose, onScan }: { isOpen: boolean; onClose: () => void; onScan: (orderId: string) => void }) => {
  const [scannedValue, setScannedValue] = useState('');
  const [scanning, setScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);
  const { showError, showSuccess } = useErrorToast();

  // Initialize scanner when modal opens
  useEffect(() => {
    isMounted.current = true;
    
    if (isOpen && scanning && !cameraError) {
      const timer = setTimeout(() => {
        try {
          if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
          }

          scannerRef.current = new Html5QrcodeScanner(
            "qr-reader-container",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            false
          );

          scannerRef.current.render(
            (decodedText: string) => {
              console.log('✅ QR Code scanned:', decodedText);
              
              if (isMounted.current) {
                setScannedValue(decodedText);
                setScanning(false);
                
                if (scannerRef.current) {
                  scannerRef.current.clear();
                  scannerRef.current = null;
                }
                
                showSuccess(`QR Code scanned: ${decodedText}`);
                
                setTimeout(() => {
                  if (isMounted.current) {
                    onScan(decodedText);
                    onClose();
                  }
                }, 500);
              }
            },
            () => {
              if (isMounted.current) {
                console.log('🔍 Scanning for QR code...');
              }
            }
          );
        } catch (error) {
          console.error('Scanner error:', error);
          if (isMounted.current) {
            setCameraError('Unable to initialize camera. Please check permissions.');
            showError('Unable to initialize camera. Please check permissions and try again.');
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [isOpen, scanning, cameraError, onScan, onClose, showError, showSuccess]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  const handleManualScan = () => {
    if (scannedValue.trim()) {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      onScan(scannedValue.trim());
      setScannedValue('');
      onClose();
    }
  };

  // Handle paste via keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key === 'v') {
      setTimeout(() => {
        if (inputRef.current) {
          setScannedValue(inputRef.current.value.toUpperCase());
        }
      }, 10);
    }
  };

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScannedValue('');
    setScanning(true);
    setCameraError(null);
    onClose();
  };

  const handleRetryCamera = () => {
    setCameraError(null);
    setScanning(true);
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    > 
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-2">
          <div className="w-12 h-12 rounded-full bg-[#5A3E2B]/10 dark:bg-[#5A3E2B]/20 flex items-center justify-center mx-auto mb-4">
            <Scan className="h-6 w-6 text-[#5A3E2B] dark:text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-center mb-2 text-[#2C1810] dark:text-white">Scan QR Code</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center mb-6">
            Position the customer's QR code in front of the camera
          </p>
        </div>
        
        {/* Camera QR Scanner */}
        <div className="px-6">
          {cameraError ? (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
              <p className="text-red-600 dark:text-red-400 text-sm">{cameraError}</p>
              <button
                onClick={handleRetryCamera}
                className="mt-3 text-sm text-[#5A3E2B] dark:text-amber-400 font-medium hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
              <div 
                id="qr-reader-container" 
                className="w-full h-full"
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/40 rounded-lg" />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/80 text-xs bg-black/50 py-1 px-3 rounded-full inline-block mx-auto">
                  Align QR code within the frame
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center px-6 my-4">
          <div className="flex-1 border-t border-stone-200 dark:border-stone-700" />
          <span className="mx-3 text-xs text-stone-400 dark:text-stone-500">OR</span>
          <div className="flex-1 border-t border-stone-200 dark:border-stone-700" />
        </div>

        {/* Manual Entry */}
        <div className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Enter Order ID Manually
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="SNCT-XXXXX"
                value={scannedValue}
                onChange={(e) => setScannedValue(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                className="flex-1 px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white text-sm font-mono uppercase"
                autoFocus={false}
              />
            </div>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-2">
              Format: SNCT-XXXXX (example: SNCT-7A2B9C3)
              <br />
              💡 Tip: Press Ctrl+V to paste directly into the field
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleClose} 
              className="flex-1 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleManualScan} 
              disabled={!scannedValue.trim()}
              className="flex-1 px-4 py-2 rounded-xl bg-[#2C1810] dark:bg-[#2C1810] text-white hover:bg-[#5A3E2B] dark:hover:bg-[#5A3E2B] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm Pickup
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-2 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <p className="text-[10px] text-stone-500 dark:text-stone-400 text-center">
              💡 Tips:
              <br />
              • For scanning: Place QR code in frame, hold steady
              <br />
              • For manual entry: Type or press Ctrl+V to paste
              <br />
              • Order ID format starts with "SNCT-" followed by 7 characters
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============ GALLERY IMAGE ITEM ============
const GalleryImageItem = React.memo(({ index, initialValue, onChange }: { index: number; initialValue: string; onChange: (index: number, val: string) => void }) => {
  const [value, setValue] = useState(initialValue);
  const handleChange = useCallback((val: string) => {
    setValue(val);
    onChange(index, val);
  }, [index, onChange]);
  return <ImageUploadElement initialValue={value} onChange={handleChange} placeholder="Gallery image URL" />;
});

// ============ SIGN OUT CONFIRM MODAL ============
const SignOutConfirmModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  if (!isOpen) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
          <LogOut className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2 text-[#2C1810] dark:text-white">Sign Out</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 text-center mb-6">
          Are you sure you want to sign out of the admin dashboard?
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 px-4 py-2 rounded-xl bg-[#2C1810] dark:bg-[#2C1810] text-white hover:bg-[#5A3E2B] dark:hover:bg-[#5A3E2B] transition"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============ DATE PICKER HELPER ============
const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.split(' ');
  if (parts.length === 3) {
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    const day = parseInt(parts[0]);
    const month = monthMap[parts[1]];
    const year = parseInt(parts[2]);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      const date = new Date(year, month, day);
      return date.toISOString().split('T')[0];
    }
  }
  return dateString;
};

const formatDateForDisplay = (dateString: string) => {
  if (!dateString) return '';
  if (dateString.includes(' ')) return dateString;
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return dateString;
};

// ============ ADMIN MODAL ============
const AdminModal = ({ type, item, onClose, onSave }: { type: 'event' | 'product'; item: any; onClose: () => void; onSave: (data: any) => Promise<boolean> }) => {
  const isEditing = !!item;
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const imgRef = React.useRef(item?.img || '');
  const imageRef = React.useRef(item?.image || '');
  const galleryRef = React.useRef<string[]>(item?.gallery || []);
  
  const [formData, setFormData] = useState<any>(() => {
    if (item) {
      if (type === 'product') {
        return { 
          name: item.name || '',
          price: item.price || 0,
          stock: item.stock ?? 0,
          category: item.category || 'Apparel',
          description: item.description || '',
          impact: item.impact || ''
        };
      }
      return { 
        title: item.title || '',
        date: item.date || '',
        location: item.location || '',
        description: item.description || '',
        story: item.story || '',
        time: item.time || '',
        isUpcoming: item.isUpcoming ?? true
      };
    }
    return type === 'event' ? {
      title: '', date: '', location: '', description: '', story: '', time: '', isUpcoming: true
    } : {
      name: '', price: 0, stock: 0, category: 'Apparel', description: '', impact: ''
    };
  });

  const [galleryItems, setGalleryItems] = useState<{id: string, url: string}[]>(() => 
    (item?.gallery || []).map((url: string) => ({ id: crypto.randomUUID(), url }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    let data: any;
    if (type === 'product') {
      data = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image: imageRef.current,
        category: formData.category,
        description: formData.description,
        impact: formData.impact,
        gallery: galleryRef.current.filter(Boolean)
      };
    } else {
      const formattedDate = formatDateForDisplay(formData.date);
      data = {
        title: formData.title,
        date: formattedDate,
        location: formData.location,
        description: formData.description,
        story: formData.story,
        time: formData.time,
        isUpcoming: formData.isUpcoming,
        img: imgRef.current,
        year: new Date().getFullYear().toString(),
        type: 'Community',
        gallery: galleryRef.current.filter(Boolean)
      };
    }
    
    const success = await onSave(data);
    setIsSaving(false);
    
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1500);
    }
  };

  const addGalleryImage = () => {
    setGalleryItems(prev => [...prev, { id: crypto.randomUUID(), url: '' }]);
    galleryRef.current.push('');
  };

  const removeGalleryImage = (index: number) => {
    setGalleryItems(prev => prev.filter((_, i) => i !== index));
    galleryRef.current = galleryRef.current.filter((_, i) => i !== index);
  };

  const handleGalleryChange = useCallback((index: number, val: string) => {
    galleryRef.current[index] = val;
  }, []);

  const handleEventImgChange = useCallback((val: string) => {
    imgRef.current = val;
  }, []);

  const handleProductImageChange = useCallback((val: string) => {
    imageRef.current = val;
  }, []);

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-[#2C1810] dark:text-white mb-2">Saved Successfully!</h3>
          <p className="text-stone-500 dark:text-stone-400">Your changes have been published.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl"
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-stone-200 dark:border-stone-800 p-5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#2C1810] dark:text-white">{isEditing ? `Edit ${type === 'event' ? 'Event' : 'Product'}` : `Create New ${type === 'event' ? 'Event' : 'Product'}`}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition"><X className="h-5 w-5 text-stone-500 dark:text-stone-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {type === 'event' ? (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Event Title</label>
                <input required className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input 
                      type="date" 
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white"
                      value={formatDateForInput(formData.date)}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Time</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Location</label>
                <input required className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Event Image</label>
                <ImageUploadElement initialValue={item?.img || ''} onChange={handleEventImgChange} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Short Description</label>
                <textarea rows={2} className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Full Story</label>
                <textarea rows={4} className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white" value={formData.story} onChange={e => setFormData({ ...formData, story: e.target.value })} />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50">
                <input type="checkbox" id="isUpcoming" checked={formData.isUpcoming} onChange={e => setFormData({ ...formData, isUpcoming: e.target.checked })} className="w-5 h-5 rounded border-stone-300" />
                <label htmlFor="isUpcoming" className="text-sm font-medium text-[#2C1810] dark:text-white">Show as Upcoming Event</label>
              </div>

              {/* Event Gallery Images */}
              <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Event Gallery Images</span>
                  </label>
                  <button type="button" onClick={addGalleryImage} className="text-xs text-[#5A3E2B] dark:text-amber-400 font-medium hover:underline">+ Add Image</button>
                </div>
                <div className="space-y-3">
                  {galleryItems.map((gItem, i) => (
                    <div key={gItem.id} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <GalleryImageItem index={i} initialValue={gItem.url} onChange={handleGalleryChange} />
                      </div>
                      <button type="button" onClick={() => removeGalleryImage(i)} className="p-2 mt-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {galleryItems.length === 0 && (
                    <p className="text-xs text-stone-400 dark:text-stone-500 italic">No gallery images added. Click "+ Add Image" to add.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Product Name</label>
                <input required className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Price (Ksh)</label>
                  <input required type="number" className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Stock Quantity</label>
                  <input required type="number" className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Category</label>
                <select className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option>Apparel</option>
                  <option>Accessories</option>
                  <option>Art</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Product Main Image</label>
                <ImageUploadElement initialValue={item?.image || ''} onChange={handleProductImageChange} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Description</label>
                <textarea rows={3} className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">Impact Statement</label>
                <textarea rows={2} className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white" value={formData.impact} onChange={e => setFormData({ ...formData, impact: e.target.value })} placeholder="e.g., Provides meals for 10 children" />
              </div>

              {/* Product Gallery Images */}
              <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Product Gallery Images</span>
                  </label>
                  <button type="button" onClick={addGalleryImage} className="text-xs text-[#5A3E2B] dark:text-amber-400 font-medium hover:underline">+ Add Image</button>
                </div>
                <div className="space-y-3">
                  {galleryItems.map((gItem, i) => (
                    <div key={gItem.id} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <GalleryImageItem index={i} initialValue={gItem.url} onChange={handleGalleryChange} />
                      </div>
                      <button type="button" onClick={() => removeGalleryImage(i)} className="p-2 mt-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {galleryItems.length === 0 && (
                    <p className="text-xs text-stone-400 dark:text-stone-500 italic">No gallery images added. Click "+ Add Image" to add multiple product photos.</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="sticky bottom-0 bg-white dark:bg-slate-900 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button type="submit" disabled={isSaving} className="w-full py-3 rounded-xl bg-[#2C1810] dark:bg-[#2C1810] text-white font-medium hover:bg-[#5A3E2B] dark:hover:bg-[#5A3E2B] transition disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Create')}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ============ MAIN ADMIN COMPONENT ============
type AdminTab = 'overview' | 'messages' | 'events' | 'rsvps' | 'shop' | 'orders' | 'contributions';

// Helper function for user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    default:
      return 'Authentication failed. Please try again.';
  }
};

export const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [messages, setMessages] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'event' | 'product'>('event');
  const [editItem, setEditItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, coll: string, id: string}>({isOpen: false, coll: '', id: ''});
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [pickupSuccess, setPickupSuccess] = useState<{show: boolean, orderId: string}>({show: false, orderId: ''});
  const [confirmOrder, setConfirmOrder] = useState<{isOpen: boolean, order: any}>({isOpen: false, order: null});
  const [isProcessingConfirm, setIsProcessingConfirm] = useState(false);
  const { showError, showSuccess, showWarning } = useErrorToast();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Check if already authenticated on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
      if (user) {
        // Get user's display name or email for welcome message
        const displayName = user.displayName || user.email?.split('@')[0] || 'Admin';
        setWelcomeName(displayName);
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 5000);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      // Welcome message is handled by onAuthStateChanged
    } catch (err: any) {
      const errorMsg = getAuthErrorMessage(err.code);
      setLoginError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      showSuccess('Signed out successfully.');
    } catch (error) {
      console.error('Sign out error:', error);
      showError('Failed to sign out. Please try again.');
    } finally {
      setShowSignOutConfirm(false);
    }
  };

  // Fetch data only when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoadingData(true);

    const unsubMessages = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubEvents = onSnapshot(query(collection(db, 'events'), orderBy('createdAt', 'desc')), (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubContributions = onSnapshot(query(collection(db, 'contributions'), orderBy('createdAt', 'desc')), (snap) => {
      setContributions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubRsvps = onSnapshot(query(collection(db, 'rsvps'), orderBy('createdAt', 'desc')), (snap) => {
      setRsvps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setTimeout(() => setIsLoadingData(false), 500);

    return () => {
      unsubMessages(); unsubEvents(); unsubProducts(); unsubOrders(); unsubContributions(); unsubRsvps();
    };
  }, [isAuthenticated]);

  const handleDelete = (coll: string, id: string) => setDeleteConfirm({ isOpen: true, coll, id });
  const confirmDelete = async () => { 
    try { 
      await deleteDoc(doc(db, deleteConfirm.coll, deleteConfirm.id)); 
      showSuccess('Item deleted successfully.');
    } catch(e) { 
      console.error(e); 
      showError('Failed to delete item. Please try again.');
    } 
  };
  
  const markMessageRead = async (id: string) => { 
    try { 
      await updateDoc(doc(db, 'messages', id), { status: 'read' }); 
      showSuccess('Message marked as read.');
    } catch(e) { 
      console.error(e); 
      showError('Failed to mark message as read.');
    } 
  };
  
  const markOrderPicked = async (id: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { 
        status: 'picked_up', 
        pickedUpAt: new Date().toISOString() 
      });
      showSuccess('Order marked as picked up successfully!');
      return true;
    } catch(e) { 
      console.error(e); 
      showError('Failed to mark order as picked up.');
      return false;
    }
  };

  // Open confirmation modal for order pickup
  const openOrderConfirmation = (order: any) => {
    setConfirmOrder({ isOpen: true, order });
  };

  // Handle order confirmation
  const handleConfirmPickup = async () => {
    if (!confirmOrder.order) return;
    
    setIsProcessingConfirm(true);
    const success = await markOrderPicked(confirmOrder.order.id);
    setIsProcessingConfirm(false);
    
    if (success) {
      setConfirmOrder({ isOpen: false, order: null });
      setPickupSuccess({ show: true, orderId: confirmOrder.order.orderId });
      setTimeout(() => setPickupSuccess({ show: false, orderId: '' }), 3000);
    }
  };

  // QR Scan Handler
  const handleQRScan = async (scannedOrderId: string) => {
    const order = orders.find(o => o.orderId === scannedOrderId);
    
    if (!order) {
      showError(`Order not found: ${scannedOrderId}\n\nPlease check the QR code and try again.`);
      return;
    }
    
    if (order.status === 'picked_up') {
      showWarning(`Order ${scannedOrderId} has already been picked up.\nCustomer: ${order.customerName}`);
      return;
    }
    
    if (order.status === 'pending_payment') {
      showError(`Order ${scannedOrderId} has not been paid yet.\nCustomer: ${order.customerName}\nStatus: Pending Payment`);
      return;
    }
    
    if (order.status === 'paid') {
      openOrderConfirmation(order);
    }
  };

  const openModal = (type: 'event' | 'product', item: any = null) => { setModalType(type); setEditItem(item); setIsModalOpen(true); };
  
  const handleSave = async (data: any) => {
    try {
      const coll = modalType === 'event' ? 'events' : 'products';
      if (editItem?.id) await updateDoc(doc(db, coll, editItem.id), data);
      else await addDoc(collection(db, coll), { ...data, createdAt: serverTimestamp() });
      showSuccess(`${modalType === 'event' ? 'Event' : 'Product'} saved successfully!`);
      return true;
    } catch(e) { 
      console.error(e); 
      showError('Failed to save. Please try again.'); 
      return false; 
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) + contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'paid').length;
  const unreadMessages = messages.filter(m => m.status === 'unread').length;
  const filteredOrders = orders.filter(o => 
    o.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDF8F0] dark:bg-slate-950">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-[#5A3E2B]/10 dark:bg-[#5A3E2B]/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <ShieldCheck className="h-8 w-8 text-[#5A3E2B] dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 text-[#2C1810] dark:text-white">Admin Access</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center mb-8">Enter your credentials to continue</p>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input 
              required 
              type="email" 
              placeholder="Email" 
              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white placeholder:text-stone-400" 
              value={loginData.email} 
              onChange={e => setLoginData({ ...loginData, email: e.target.value })} 
            />
            <input 
              required 
              type="password" 
              placeholder="Password" 
              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white placeholder:text-stone-400" 
              value={loginData.password} 
              onChange={e => setLoginData({ ...loginData, password: e.target.value })} 
            />
            {loginError && <p className="text-red-500 dark:text-red-400 text-sm">{loginError}</p>}
            <button 
              type="submit" 
              disabled={isLoggingIn} 
              className="w-full py-3 rounded-xl bg-[#2C1810] dark:bg-[#2C1810] text-white font-medium hover:bg-[#5A3E2B] dark:hover:bg-[#5A3E2B] transition disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] dark:bg-slate-950">
        <Loader2 className="h-8 w-8 text-[#5A3E2B] dark:text-amber-400 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', badge: unreadMessages },
    { id: 'events', icon: Calendar, label: 'Events', count: events.length },
    { id: 'shop', icon: ShoppingBag, label: 'Products', count: products.length },
    { id: 'rsvps', icon: Users, label: 'RSVPs', count: rsvps.length },
    { id: 'orders', icon: Package, label: 'Orders', badge: pendingOrders, count: orders.length },
    { id: 'contributions', icon: Heart, label: 'Donations', count: contributions.length }
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-slate-950 pt-20 pb-16">
      {/* Welcome Toast - Personalized */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 bg-[#2C1810] text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-center gap-3 max-w-md mx-auto"
          >
            <div className="w-8 h-8 rounded-full bg-[#5A3E2B] flex items-center justify-center">
              <Heart className="h-4 w-4 text-white fill-white" />
            </div>
            <div>
              <p className="font-medium text-sm">Welcome back, {welcomeName}! 👋</p>
              <p className="text-xs text-amber-400">We missed you. Ready to make an impact?</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pickup Success Toast */}
      <AnimatePresence>
        {pickupSuccess.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Order {pickupSuccess.orderId} marked as picked up!</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="px-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#2C1810] dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">Manage your sanctuary's operations</p>
          </div>
          <button 
            onClick={() => setShowSignOutConfirm(true)} 
            className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-stone-200 dark:border-stone-800 pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-[#2C1810] dark:bg-[#2C1810] text-white" 
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {(tab.badge !== undefined && tab.badge > 0) && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{tab.badge}</span>
              )}
              {(tab.count !== undefined && tab.count > 0 && tab.id !== 'messages') && (
                <span className="text-[10px] opacity-60">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content with Loading and Empty States */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {isLoadingData ? (
                <SkeletonStats />
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <AdminStat label="Total Revenue" value={`Ksh ${totalRevenue.toLocaleString()}`} icon={TrendingUp} />
                    <AdminStat label="Pending Orders" value={pendingOrders.toString()} icon={Package} />
                    <AdminStat label="Unread Messages" value={unreadMessages.toString()} icon={MessageSquare} />
                    <AdminStat label="Total Donations" value={contributions.length.toString()} icon={Heart} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800">
                      <h3 className="font-bold mb-4 flex items-center gap-2 text-[#2C1810] dark:text-white">
                        <Plus className="h-4 w-4 text-[#5A3E2B] dark:text-amber-400" />
                        Quick Actions
                      </h3>
                      <div className="space-y-2">
                        <button onClick={() => openModal('event')} className="w-full text-left px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition flex justify-between items-center text-[#2C1810] dark:text-white">
                          <span>Create New Event</span>
                          <Plus className="h-4 w-4" />
                        </button>
                        <button onClick={() => openModal('product')} className="w-full text-left px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition flex justify-between items-center text-[#2C1810] dark:text-white">
                          <span>Add New Product</span>
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800">
                      <h3 className="font-bold mb-4 flex items-center gap-2 text-[#2C1810] dark:text-white">
                        <Heart className="h-4 w-4 text-[#5A3E2B] dark:text-amber-400" />
                        Recent Activity
                      </h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {orders.slice(0, 3).map(order => (
                          <div key={order.id} className="flex justify-between text-sm">
                            <span className="text-stone-600 dark:text-stone-400">{order.customerName}</span>
                            <span className="text-[#5A3E2B] dark:text-amber-400 font-medium">Ksh {order.totalAmount?.toLocaleString()}</span>
                          </div>
                        ))}
                        {orders.length === 0 && contributions.length === 0 && (
                          <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-4">No recent activity</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              {isLoadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : messages.length === 0 ? (
                <EmptyState icon={Inbox} title="No messages yet" message="Messages will appear here when supporters reach out" />
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={cn("bg-white dark:bg-slate-900 rounded-xl p-4 border", msg.status === 'unread' ? "border-l-4 border-l-[#5A3E2B] dark:border-l-amber-400" : "border-stone-200 dark:border-stone-800")}>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#5A3E2B]/10 dark:bg-[#5A3E2B]/20 flex items-center justify-center font-bold text-[#5A3E2B] dark:text-amber-400">
                            {msg.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#2C1810] dark:text-white">{msg.name}</h4>
                            <p className="text-xs text-stone-500 dark:text-stone-400">{msg.email}</p>
                          </div>
                          {msg.status === 'unread' && (
                            <span className="text-[8px] bg-[#5A3E2B] dark:bg-amber-400 text-white px-2 py-0.5 rounded-full">New</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">{msg.subject}</p>
                        <p className="text-sm text-stone-500 dark:text-stone-500 italic">"{msg.message}"</p>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-2">
                          {msg.createdAt?.toDate?.().toLocaleString() || 'Unknown date'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-[#5A3E2B] dark:hover:bg-amber-400 hover:text-white transition">
                          <Mail className="h-4 w-4" />
                        </a>
                        {msg.status === 'unread' && (
                          <button onClick={() => markMessageRead(msg.id)} className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-green-600 hover:text-white transition">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete('messages', msg.id)} className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-red-600 hover:text-white transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex justify-end mb-4">
                <button onClick={() => openModal('event')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2C1810] dark:bg-[#2C1810] text-white text-sm hover:bg-[#5A3E2B] dark:hover:bg-[#5A3E2B] transition">
                  <Plus className="h-4 w-4" />
                  New Event
                </button>
              </div>
              {isLoadingData ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : events.length === 0 ? (
                <EmptyState icon={Calendar} title="No events yet" message="Create your first event to start building your sanctuary" />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map(event => (
                    <div key={event.id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                      <div className="h-36 overflow-hidden">
                        <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-[#2C1810] dark:text-white mb-1">{event.title}</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">{event.date}</p>
                        <div className="flex gap-2">
                          <button onClick={() => openModal('event', event)} className="flex-1 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm text-[#2C1810] dark:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition">Edit</button>
                          <button onClick={() => handleDelete('events', event.id)} className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'shop' && (
            <motion.div key="shop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex justify-end mb-4">
                <button onClick={() => openModal('product')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2C1810] dark:bg-[#2C1810] text-white text-sm hover:bg-[#5A3E2B] dark:hover:bg-[#5A3E2B] transition">
                  <Plus className="h-4 w-4" />
                  New Product
                </button>
              </div>
              {isLoadingData ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <EmptyState icon={ShoppingBag} title="No products yet" message="Add merchandise to support your fundraising efforts" />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                      <div className="h-32 overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-sm text-[#2C1810] dark:text-white mb-0.5">{product.name}</h3>
                        <p className="text-[#5A3E2B] dark:text-amber-400 font-bold text-sm">Ksh {product.price?.toLocaleString()}</p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mb-2">Stock: {product.stock || 0}</p>
                        <div className="flex gap-2">
                          <button onClick={() => openModal('product', product)} className="flex-1 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm text-[#2C1810] dark:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition">Edit</button>
                          <button onClick={() => handleDelete('products', product.id)} className="p-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'rsvps' && (
            <motion.div key="rsvps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              {isLoadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : rsvps.length === 0 ? (
                <EmptyState icon={Users} title="No RSVPs yet" message="Event registrations will appear here" />
              ) : (
                rsvps.map(rsvp => (
                  <div key={rsvp.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-[#2C1810] dark:text-white">{rsvp.name}</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{rsvp.email}</p>
                      <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Event: {rsvp.eventTitle}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-stone-400 dark:text-stone-500">Guests</p>
                        <p className="font-bold text-[#5A3E2B] dark:text-amber-400">+{rsvp.guests || 1}</p>
                      </div>
                      <button onClick={() => handleDelete('rsvps', rsvp.id)} className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="Search by Order ID or Customer Name..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-stone-700 text-[#2C1810] dark:text-white placeholder:text-stone-400 text-sm" 
                  />
                </div>
                <button
                  onClick={() => setIsQRScannerOpen(true)}
                  className="px-5 py-3 rounded-xl bg-[#5A3E2B] dark:bg-amber-400 text-white dark:text-[#2C1810] hover:bg-[#5A3E2B]/80 dark:hover:bg-amber-500 transition flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                >
                  <Scan className="h-4 w-4" />
                  Scan QR Code
                </button>
              </div>
              {isLoadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : filteredOrders.length === 0 ? (
                <EmptyState icon={PackageOpen} title="No orders found" message={searchQuery ? "Try a different search term" : "Orders will appear here when supporters make purchases"} />
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} className={cn("bg-white dark:bg-slate-900 rounded-xl p-4 border", 
                    order.status === 'paid' ? "border-l-4 border-l-green-500" : 
                    order.status === 'picked_up' ? "border-l-4 border-l-blue-500 opacity-60" : 
                    "border-stone-200 dark:border-stone-800"
                  )}>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-[#2C1810] dark:text-white">{order.customerName}</h4>
                          {order.status === 'paid' && (
                            <span className="text-[8px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Ready for Pickup</span>
                          )}
                          {order.status === 'picked_up' && (
                            <span className="text-[8px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">Picked Up</span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-stone-500 dark:text-stone-400">{order.orderId}</p>
                        <p className="text-sm mt-2 text-stone-600 dark:text-stone-400">{order.items?.length} items • Ksh {order.totalAmount?.toLocaleString()}</p>
                        {order.items && (
                          <div className="mt-2 text-xs text-stone-500 dark:text-stone-500">
                            Items: {order.items.map((item: any) => `${item.name} (x${item.quantity})`).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {order.status === 'paid' ? (
                          <button 
                            onClick={() => openOrderConfirmation(order)}
                            className="px-4 py-2 rounded-xl bg-[#2C1810] dark:bg-[#2C1810] text-white text-sm hover:bg-[#5A3E2B] dark:hover:bg-[#5A3E2B] transition flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Confirm Pickup
                          </button>
                        ) : order.status === 'picked_up' ? (
                          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">✓ Picked Up</span>
                        ) : (
                          <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full">Pending Payment</span>
                        )}
                        <button onClick={() => handleDelete('orders', order.id)} className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'contributions' && (
            <motion.div key="contributions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              {isLoadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : contributions.length === 0 ? (
                <EmptyState icon={Gift} title="No donations yet" message="Contributions will appear here when supporters donate" />
              ) : (
                contributions.map(contrib => (
                  <div key={contrib.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-[#2C1810] dark:text-white">{contrib.donorName}</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{contrib.mpesaNumber}</p>
                      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{contrib.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-[#5A3E2B] dark:text-amber-400">Ksh {contrib.amount?.toLocaleString()}</p>
                      {contrib.status === 'completed' && (
                        <span className="text-[8px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Completed</span>
                      )}
                      <button onClick={() => handleDelete('contributions', contrib.id)} className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {confirmOrder.isOpen && (
          <OrderConfirmationModal 
            isOpen={confirmOrder.isOpen}
            onClose={() => setConfirmOrder({ isOpen: false, order: null })}
            onConfirm={handleConfirmPickup}
            order={confirmOrder.order}
            isProcessing={isProcessingConfirm}
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {deleteConfirm.isOpen && <ConfirmModal isOpen={deleteConfirm.isOpen} title="Delete Item" message="Are you sure? This cannot be undone." onConfirm={confirmDelete} onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })} />}
      </AnimatePresence>
      
      {isModalOpen && <AdminModal type={modalType} item={editItem} onClose={() => { setIsModalOpen(false); setEditItem(null); }} onSave={handleSave} />}

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {isQRScannerOpen && (
          <QRScannerModal 
            isOpen={isQRScannerOpen}
            onClose={() => setIsQRScannerOpen(false)}
            onScan={handleQRScan}
          />
        )}
      </AnimatePresence>

      {/* Sign Out Modal */}
      <AnimatePresence>
        {showSignOutConfirm && (
          <SignOutConfirmModal 
            isOpen={showSignOutConfirm}
            onClose={() => setShowSignOutConfirm(false)}
            onConfirm={handleSignOut}
          />
        )}
      </AnimatePresence>
    </div>
  );
};