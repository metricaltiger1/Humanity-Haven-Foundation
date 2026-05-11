import React, { useState, useRef, memo } from 'react';
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader2, Check } from 'lucide-react';

interface ImageUploadElementProps {
  initialValue?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const ImageUploadElement: React.FC<ImageUploadElementProps> = memo(({ 
  initialValue = '', 
  onChange, 
  label, 
  placeholder = "Image URL (e.g., from Unsplash)",
  className = "" 
}) => {
  const [value, setValue] = useState(initialValue);
  const [mode, setMode] = useState<'url' | 'upload'>(value && value.startsWith('data:') ? 'upload' : 'url');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInternalChange = (newVal: string) => {
    setValue(newVal);
    onChange(newVal);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Please select an image under 5MB.');
      return;
    }

    setIsProcessing(true);
    try {
      const dataUrl = await compressImage(file);
      handleInternalChange(dataUrl);
      setMode('upload');
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    handleInternalChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
          <ImageIcon className="h-3 w-3" />
          <span>{label}</span>
        </label>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
            mode === 'url' 
              ? 'bg-white dark:bg-stone-700 text-[#5A3E2B] shadow-sm' 
              : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          <LinkIcon className="h-3 w-3" />
          <span>URL</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
            mode === 'upload' 
              ? 'bg-white dark:bg-stone-700 text-[#5A3E2B] shadow-sm' 
              : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          <Upload className="h-3 w-3" />
          <span>Upload</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          {mode === 'url' ? (
            <input
              type="text"
              placeholder={placeholder}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-sm text-[#2C1810] dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B] transition-all"
              value={value && !value.startsWith('data:') ? value : ''}
              onChange={(e) => handleInternalChange(e.target.value)}
            />
          ) : (
            <div 
              className={`relative w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-[#5A3E2B] bg-[#5A3E2B]/5' 
                  : value && value.startsWith('data:')
                    ? 'border-[#5A3E2B] bg-[#5A3E2B]/5'
                    : 'border-stone-300 dark:border-stone-600 hover:border-[#5A3E2B]/50 bg-stone-50 dark:bg-stone-800/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#5A3E2B]" />
                  <p className="text-[9px] font-medium text-stone-500">Processing...</p>
                </div>
              ) : value && value.startsWith('data:') ? (
                <div className="flex flex-col items-center gap-1">
                  <Check className="h-6 w-6 text-[#5A3E2B]" />
                  <p className="text-[9px] font-medium text-stone-500">Image loaded</p>
                  <p className="text-[8px] text-stone-400">Click or drag to replace</p>
                </div>
              ) : (
                <>
                  <Upload className={`h-6 w-6 mb-1 ${dragActive ? 'text-[#5A3E2B]' : 'text-stone-400'}`} />
                  <p className="text-[9px] font-medium text-stone-500">Click or drag to upload</p>
                  <p className="text-[7px] text-stone-400 mt-0.5">JPEG, PNG, GIF up to 5MB</p>
                </>
              )}
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processFile(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Preview */}
        {value && (
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0 group">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <button 
              type="button"
              onClick={clearImage}
              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-500 rounded-md text-white opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Optional hint text */}
      {mode === 'url' && !value && (
        <p className="text-[8px] text-stone-400 mt-1">
          Supported: Unsplash, Imgur, or any direct image URL
        </p>
      )}
    </div>
  );
});

ImageUploadElement.displayName = 'ImageUploadElement';