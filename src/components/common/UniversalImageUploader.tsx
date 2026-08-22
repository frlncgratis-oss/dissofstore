import React, { useRef, useState } from 'react';
import { Upload, Camera, Trash2, Crop, Eye, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { compressImageFile, hardCompressImage, getImageSizeInKB } from '../../lib/utils';
import { ImageCropModal } from './ImageCropModal';
import { ImageWithFallback } from './ImageWithFallback';

interface UniversalImageUploaderProps {
  label: string;
  sublabel?: string;
  currentImage?: string | null;
  onImageChange: (base64OrUrl: string) => void | Promise<void>;
  onImageRemove?: () => void | Promise<void>;
  aspectRatioLabel?: string;
  enableCrop?: boolean;
  maxDimension?: number;
  quality?: number;
  targetMaxKB?: number;
  previewHeightClass?: string;
}

export const UniversalImageUploader: React.FC<UniversalImageUploaderProps> = ({
  label,
  sublabel,
  currentImage,
  onImageChange,
  onImageRemove,
  aspectRatioLabel = 'Rekomendasi rasio 1:1 atau 16:9',
  enableCrop = true,
  maxDimension = 800,
  quality = 0.6,
  targetMaxKB = 150,
  previewHeightClass = 'h-40 sm:h-48',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageForCrop, setTempImageForCrop] = useState<string | null>(null);
  const [previewZoomOpen, setPreviewZoomOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBadge, setSuccessBadge] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processAndSetImage = async (rawSrc: string) => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      // 1. Auto Hard Compress <= 800px, 0.6 JPEG, <150KB
      const compressed = await hardCompressImage(rawSrc, maxDimension, quality, targetMaxKB);
      const sizeKB = getImageSizeInKB(compressed);
      
      await onImageChange(compressed);
      setSuccessBadge(`Tersimpan (${sizeKB} KB) ✓`);
      setTimeout(() => setSuccessBadge(null), 3000);
    } catch (err: any) {
      console.warn('Image processing error:', err);
      try {
        // Fallback standard compression
        await onImageChange(rawSrc);
        setSuccessBadge('Tersimpan ✓');
        setTimeout(() => setSuccessBadge(null), 3000);
      } catch (fallbackErr: any) {
        setErrorMsg(fallbackErr.message || 'Gagal memproses dan menyimpan gambar.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const resultStr = reader.result as string;
        if (enableCrop) {
          setTempImageForCrop(resultStr);
          setCropModalOpen(true);
        } else {
          processAndSetImage(resultStr);
        }
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleCropComplete = async (croppedBase64: string) => {
    setCropModalOpen(false);
    setTempImageForCrop(null);
    await processAndSetImage(croppedBase64);
  };

  const handleCropExisting = () => {
    if (!currentImage) return;
    setTempImageForCrop(currentImage);
    setCropModalOpen(true);
  };

  const handleRemove = async () => {
    if (window.confirm('Hapus foto ini?')) {
      if (onImageRemove) {
        await onImageRemove();
      } else {
        await onImageChange('');
      }
    }
  };

  return (
    <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-pink-100/80 space-y-3 shadow-2xs">
      
      {/* Label and Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-[#2E241E] flex items-center gap-2">
            <span>{label}</span>
            {successBadge && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full animate-bounce">
                {successBadge}
              </span>
            )}
          </h4>
          {sublabel && (
            <p className="text-[11px] text-[#7A6A61] mt-0.5">{sublabel}</p>
          )}
        </div>
        <span className="text-[10px] text-pink-600 font-medium self-start sm:self-auto bg-white px-2 py-0.5 rounded-md border border-pink-100">
          {aspectRatioLabel} • Auto-Compress &lt; 150KB
        </span>
      </div>

      {/* Hidden File and Camera Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Main Preview or Upload Trigger Box */}
      {currentImage ? (
        <div className="space-y-2.5">
          <div className={`relative rounded-2xl overflow-hidden border-2 border-pink-200 bg-white group shadow-xs ${previewHeightClass}`}>
            <ImageWithFallback
              src={currentImage}
              alt={label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Overlay Gradient on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => setPreviewZoomOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white text-[#2D2D2D] font-bold text-[11px] shadow-sm hover:bg-pink-50 flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Zoom</span>
              </button>

              {enableCrop && (
                <button
                  type="button"
                  onClick={handleCropExisting}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#2D2D2D] font-bold text-[11px] shadow-sm hover:bg-pink-50 flex items-center gap-1 cursor-pointer"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Crop</span>
                </button>
              )}
            </div>

            {/* Quick size badge */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono">
              {getImageSizeInKB(currentImage)} KB (Optimal)
            </div>
          </div>

          {/* Action Row: Ganti, Kamera, Hapus */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1 min-w-[120px] px-3 py-2 rounded-xl bg-white border border-pink-200 hover:bg-pink-50 text-pink-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Mengompres...' : 'Ganti dari Galeri'}</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
              className="px-3 py-2 rounded-xl bg-white border border-pink-200 hover:bg-pink-50 text-pink-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Ambil Foto Kamera HP"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kamera HP</span>
            </button>

            {enableCrop && (
              <button
                type="button"
                onClick={handleCropExisting}
                disabled={isProcessing}
                className="px-3 py-2 rounded-xl bg-white border border-pink-200 hover:bg-pink-50 text-[#55473F] font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
                title="Crop & Sesuaikan Posisi"
              >
                <Crop className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Crop</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing}
              className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="Hapus Foto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hapus</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div className="space-y-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-pink-200 hover:border-pink-400 bg-white rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-pink-50/40 group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="font-bold text-xs text-[#2E241E]">
              {isProcessing ? 'Mengompres Gambar...' : 'Klik untuk Pilih dari Galeri HP / PC'}
            </p>
            <span className="text-[10px] text-[#8C7D75] mt-0.5">
              Format JPG, PNG, WEBP (Otomatis dikompres &lt; 150 KB untuk performa cepat)
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-white border border-pink-200 hover:bg-pink-50 text-pink-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-pink-500" />
              <span>Ambil dari Kamera HP Langsung</span>
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Image Crop Modal */}
      {cropModalOpen && tempImageForCrop && (
        <ImageCropModal
          imageSrc={tempImageForCrop}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setCropModalOpen(false);
            setTempImageForCrop(null);
          }}
        />
      )}

      {/* Fullscreen Zoom Modal */}
      {previewZoomOpen && currentImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewZoomOpen(false)}
        >
          <div className="max-w-2xl w-full bg-white rounded-3xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="font-bold text-xs text-[#2D2D2D]">{label} (Pratinjau)</span>
              <button onClick={() => setPreviewZoomOpen(false)} className="text-gray-400 hover:text-black text-xs font-bold px-2 py-1">
                Tutup ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-[#F9F7F2] rounded-2xl p-2">
              <ImageWithFallback src={currentImage} alt={label} className="max-h-[65vh] w-auto object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
