import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Upload, 
  Trash2, 
  Eye, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Image as ImageIcon, 
  RefreshCw,
  Layers,
  Camera,
  Instagram,
  MapPin,
  MessageCircle,
  Megaphone,
  Radio,
  FileText,
  Save,
  CreditCard,
  QrCode
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { SiteSettings, PaymentSettings } from '../../types';
import { getImageSizeInKB } from '../../lib/utils';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

const COLOR_PRESETS = [
  { name: 'Krem Pastel (Bawaan)', hex: '#F9F7F2' },
  { name: 'Soft Blush Pink', hex: '#FFF5F6' },
  { name: 'Pure White (Bersih)', hex: '#FFFFFF' },
  { name: 'Warm Cream Latte', hex: '#FAF5EE' },
  { name: 'Light Rose Marshmallow', hex: '#FDF2F4' },
  { name: 'Soft Sage Matcha', hex: '#F4F7F4' },
  { name: 'Lavender Mist', hex: '#F7F4FA' },
  { name: 'Pale Peach Butter', hex: '#FFF8F2' },
];

export const AdminBrandingPage: React.FC = () => {
  const { 
    settings, 
    saveSettingsLocal, 
    storeLogo, 
    storeHeroBanner, 
    storeBackground,
    saveStoreBackground,
    resetStoreBackground,
    paymentSettings,
    savePaymentSettings,
    isOnlineSynced
  } = useStore();

  const [activeTab, setActiveTab] = useState<'media' | 'content' | 'background'>('media');

  // Local state for instant preview & responsive reactivity
  const [brandingData, setBrandingData] = useState<{
    logoUrl?: string;
    faviconUrl?: string;
    heroBanner?: string;
    eventBanner?: string;
    qrisImage?: string;
    bankAccountImage?: string;
    highlightImage0?: string;
    highlightImage1?: string;
    igFeed0?: string;
    igFeed1?: string;
    igFeed2?: string;
    igFeed3?: string;
  }>({});

  // Real-time Text State
  const [brandName, setBrandName] = useState(settings?.brand_name || 'DISSOF.ID');
  const [tagline, setTagline] = useState(settings?.tagline || 'everything is heartmade♡');
  const [subTagline, setSubTagline] = useState(settings?.sub_tagline || 'handmade accessories & little treasures');
  const [announcementBanner, setAnnouncementBanner] = useState(
    settings?.announcement_banner || '✨ FREE GIFT BOX & POUCH UNTUK SETIAP PEMBELIAN ♡ | BISA CUSTOM NAMA & INISIAL'
  );
  const [instagram, setInstagram] = useState(settings?.instagram || '@dissof.id');
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsapp_number || '6282284901234');
  const [location, setLocation] = useState(settings?.location || 'Dumai, Riau');
  const [offlineSpot, setOfflineSpot] = useState(settings?.offline_spot || 'Dumai Pop-Up Store / Bazaars');
  const [offlineSchedule, setOfflineSchedule] = useState(settings?.offline_schedule || 'Setiap Sabtu & Minggu Malam (19.00 - 23.00 WIB)');
  const [aboutStory, setAboutStory] = useState(
    settings?.about_story || 'DISSOF.ID adalah UMKM handmade accessories lokal dari Dumai yang merangkai manik-manik indah secara manual dengan cinta.'
  );
  const [footerText, setFooterText] = useState(
    settings?.footer_text || 'everything is heartmade♡ Crafted with love in Dumai, Indonesia.'
  );

  // Background states
  const [selectedColor, setSelectedColor] = useState<string>(storeBackground?.value || '#F9F7F2');
  const [bgMode, setBgMode] = useState<'cover' | 'repeat' | 'fixed'>(storeBackground?.mode || 'cover');

  // Status & Feedback
  const [uploadingKeys, setUploadingKeys] = useState<Record<string, boolean>>({});
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [previewZoomImage, setPreviewZoomImage] = useState<{ src: string; label: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Synchronize state with store settings
  useEffect(() => {
    if (settings) {
      if (settings.brand_name) setBrandName(settings.brand_name);
      if (settings.tagline) setTagline(settings.tagline);
      if (settings.sub_tagline) setSubTagline(settings.sub_tagline);
      if (settings.announcement_banner) setAnnouncementBanner(settings.announcement_banner);
      if (settings.instagram) setInstagram(settings.instagram);
      if (settings.whatsapp_number) setWhatsappNumber(settings.whatsapp_number);
      if (settings.location) setLocation(settings.location);
      if (settings.offline_spot) setOfflineSpot(settings.offline_spot);
      if (settings.offline_schedule) setOfflineSchedule(settings.offline_schedule);
      if (settings.about_story) setAboutStory(settings.about_story);
      if (settings.footer_text) setFooterText(settings.footer_text);

      setBrandingData({
        logoUrl: settings.logo_url || storeLogo || undefined,
        faviconUrl: settings.favicon_url || undefined,
        heroBanner: settings.hero_banner_url || storeHeroBanner || undefined,
        eventBanner: settings.popup_banner_image || undefined,
        qrisImage: paymentSettings?.qris_image || undefined,
        bankAccountImage: (paymentSettings as any)?.bank_account_image || undefined,
        highlightImage0: settings.highlight_images?.[0] || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&auto=format&fit=crop&q=80',
        highlightImage1: settings.highlight_images?.[1] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&auto=format&fit=crop&q=80',
        igFeed0: settings.instagram_feed_images?.[0] || 'https://images.unsplash.com/photo-1611591475152-4735d38d0145?w=600&auto=format&fit=crop&q=80',
        igFeed1: settings.instagram_feed_images?.[1] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
        igFeed2: settings.instagram_feed_images?.[2] || 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80',
        igFeed3: settings.instagram_feed_images?.[3] || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
      });
    }
  }, [settings, storeLogo, storeHeroBanner, paymentSettings]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // =========================================================================
  // 1 & 2. UNIVERSAL IMAGE UPLOAD WITH CANVAS COMPRESSION & DIRECT FIRESTORE SAVE
  // =========================================================================
  const handleBrandingImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    keyType: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKeys((prev) => ({ ...prev, [keyType]: true }));

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Canvas compression: max 800px, JPEG 0.6
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

          // 1. Update State Lokal secara instan
          setBrandingData((prev) => ({ ...prev, [keyType]: compressedBase64 }));

          // Mapping ke document schema Firestore
          const nowIso = new Date().toISOString();
          const generalPayload: Record<string, any> = {
            [keyType]: compressedBase64,
            updatedAt: nowIso
          };

          // Synchronize to settings/store_config & payment_settings
          const storeConfigPayload: Partial<SiteSettings> = {};
          if (keyType === 'logoUrl' || keyType === 'logo_url') {
            storeConfigPayload.logo_url = compressedBase64;
          } else if (keyType === 'faviconUrl' || keyType === 'favicon_url') {
            storeConfigPayload.favicon_url = compressedBase64;
          } else if (keyType === 'heroBanner' || keyType === 'hero_banner_url') {
            storeConfigPayload.hero_banner_url = compressedBase64;
          } else if (keyType === 'eventBanner' || keyType === 'popup_banner_image') {
            storeConfigPayload.popup_banner_image = compressedBase64;
          } else if (keyType.startsWith('highlightImage')) {
            const idx = parseInt(keyType.replace('highlightImage', ''), 10);
            const currentHighlights = settings?.highlight_images && settings.highlight_images.length > 0
              ? [...settings.highlight_images]
              : [
                  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&auto=format&fit=crop&q=80',
                ];
            currentHighlights[idx] = compressedBase64;
            storeConfigPayload.highlight_images = currentHighlights;
            generalPayload.highlight_images = currentHighlights;
          } else if (keyType.startsWith('igFeed')) {
            const idx = parseInt(keyType.replace('igFeed', ''), 10);
            const currentFeeds = settings?.instagram_feed_images && settings.instagram_feed_images.length === 4
              ? [...settings.instagram_feed_images]
              : [
                  'https://images.unsplash.com/photo-1611591475152-4735d38d0145?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
                ];
            currentFeeds[idx] = compressedBase64;
            storeConfigPayload.instagram_feed_images = currentFeeds;
            generalPayload.instagram_feed_images = currentFeeds;
          }

          // 2. LANGSUNG SIMPAN KE FIRESTORE (Doc: 'store_settings/general' dan 'settings/store_config')
          try {
            await setDoc(doc(db, 'store_settings', 'general'), generalPayload, { merge: true });

            if (Object.keys(storeConfigPayload).length > 0) {
              await saveSettingsLocal(storeConfigPayload);
            }

            if (keyType === 'qrisImage' || keyType === 'qris_image') {
              await savePaymentSettings({
                ...paymentSettings,
                qris_image: compressedBase64
              });
            }

            if (keyType === 'bankAccountImage') {
              await savePaymentSettings({
                ...paymentSettings,
                bank_account_image: compressedBase64
              } as any);
            }

            showToast('success', 'Foto berhasil diperbarui & tersimpan langsung ke Firestore ♡');
          } catch (err: any) {
            console.error('Gagal simpan ke Firestore:', err);
            showToast('error', 'Gagal menyimpan foto ke database: ' + err.message);
          }
        } catch (procErr: any) {
          console.error('Error proses kompresi gambar:', procErr);
          showToast('error', 'Gagal memproses file gambar.');
        } finally {
          setUploadingKeys((prev) => ({ ...prev, [keyType]: false }));
        }
      };
      img.onerror = () => {
        setUploadingKeys((prev) => ({ ...prev, [keyType]: false }));
        showToast('error', 'Format gambar tidak didukung atau file rusak.');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadingKeys((prev) => ({ ...prev, [keyType]: false }));
      showToast('error', 'Gagal membaca file dari perangkat.');
    };
    reader.readAsDataURL(file);

    // Reset input value so user can re-upload same image if needed
    if (e.target) e.target.value = '';
  };

  // Helper to remove / reset image
  const handleRemoveImage = async (keyType: string) => {
    if (!window.confirm('Hapus foto ini?')) return;

    setBrandingData((prev) => ({ ...prev, [keyType]: undefined }));

    try {
      await setDoc(doc(db, 'store_settings', 'general'), {
        [keyType]: '',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      if (keyType === 'logoUrl') {
        await saveSettingsLocal({ logo_url: '' });
      } else if (keyType === 'faviconUrl') {
        await saveSettingsLocal({ favicon_url: '' });
      } else if (keyType === 'heroBanner') {
        await saveSettingsLocal({ hero_banner_url: '' });
      } else if (keyType === 'eventBanner') {
        await saveSettingsLocal({ popup_banner_image: '' });
      } else if (keyType === 'qrisImage') {
        await savePaymentSettings({ ...paymentSettings, qris_image: undefined });
      }

      showToast('success', 'Foto berhasil dihapus.');
    } catch (err: any) {
      showToast('error', 'Gagal menghapus foto: ' + err.message);
    }
  };

  // --- SAVE ALL GLOBAL TEXT BRANDING TO FIRESTORE ---
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingGlobal(true);
    try {
      const payload: Partial<SiteSettings> = {
        brand_name: brandName.trim(),
        tagline: tagline.trim(),
        sub_tagline: subTagline.trim(),
        announcement_banner: announcementBanner.trim(),
        instagram: instagram.trim(),
        whatsapp_number: whatsappNumber.trim(),
        location: location.trim(),
        offline_spot: offlineSpot.trim(),
        offline_schedule: offlineSchedule.trim(),
        about_story: aboutStory.trim(),
        footer_text: footerText.trim(),
      };

      await saveSettingsLocal(payload);

      // Also persist to store_settings/general
      await setDoc(doc(db, 'store_settings', 'general'), {
        ...payload,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert('Pengaturan Berhasil Disimpan!');
      showToast('success', 'Pengaturan Berhasil Disimpan! Real-time live ke seluruh HP pembeli ♡');
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
      showToast('error', err.message || 'Gagal menyimpan pengaturan branding.');
    } finally {
      setIsSavingGlobal(false);
    }
  };

  // --- BACKGROUND COLOR & PATTERN HANDLERS ---
  const handleApplyColor = async (colorHex: string) => {
    setSelectedColor(colorHex);
    try {
      await saveStoreBackground({ type: 'color', value: colorHex, mode: 'cover' });
      await setDoc(doc(db, 'store_settings', 'general'), {
        backgroundColor: colorHex,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      showToast('success', `Warna tema latar belakang (${colorHex}) berhasil diterapkan!`);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan warna background.');
    }
  };

  // =========================================================================
  // RENDER ITEM UPLOAD WITH NATIVE LABEL & HIDDEN INPUT TRIGGER
  // =========================================================================
  const renderUploadBox = (
    keyType: string,
    label: string,
    sublabel: string,
    currentImg: string | undefined,
    aspectRatioText: string,
    heightClass: string = 'h-40'
  ) => {
    const inputId = `upload-branding-${keyType}`;
    const isUploading = !!uploadingKeys[keyType];

    return (
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-xs space-y-3">
        {/* Hidden native HTML file input */}
        <input
          type="file"
          id={inputId}
          accept="image/*"
          onChange={(e) => handleBrandingImageUpload(e, keyType)}
          style={{ display: 'none' }}
        />

        {/* Header item */}
        <div className="flex items-center justify-between border-b border-pink-100 pb-2.5">
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#2E241E]">{label}</h4>
            <p className="text-[11px] text-[#7A6A61]">{sublabel}</p>
          </div>
          <span className="text-[10px] text-pink-600 font-medium bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100 shrink-0">
            {aspectRatioText}
          </span>
        </div>

        {/* Content Box: Preview if exists, else Upload Prompt */}
        {currentImg ? (
          <div className="space-y-2.5">
            <div className={`relative ${heightClass} w-full rounded-2xl overflow-hidden bg-[#FAF7F2] border border-pink-100 flex items-center justify-center group shadow-2xs`}>
              <ImageWithFallback
                src={currentImg}
                alt={label}
                className="w-full h-full object-cover"
              />

              {/* Hover/Tap Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  onClick={() => setPreviewZoomImage({ src: currentImg, label })}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#2D2D2D] font-bold text-[11px] shadow-sm hover:bg-pink-50 flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Full</span>
                </button>
              </div>

              {/* Compression Badge */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-pink-300" />
                <span>{getImageSizeInKB(currentImg)} KB (Auto-Optimized)</span>
              </div>
            </div>

            {/* Action Row: Label Trigger (Ganti) & Hapus */}
            <div className="flex items-center gap-2">
              <label
                htmlFor={inputId}
                className="flex-1 min-w-[130px] px-3.5 py-2 rounded-xl bg-white border border-pink-300 hover:bg-pink-50 text-pink-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer select-none"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-600" />
                    <span>Mengompres...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-pink-600" />
                    <span>Ganti Foto (Galeri/HP)</span>
                  </>
                )}
              </label>

              <button
                type="button"
                onClick={() => handleRemoveImage(keyType)}
                className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Hapus Foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty Box wrapped in label for 1-click native picker */
          <div className="space-y-2">
            <label
              htmlFor={inputId}
              className="border-2 border-dashed border-pink-200 hover:border-pink-400 bg-white rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-pink-50/40 group shadow-2xs select-none block"
            >
              <div className="w-11 h-11 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform mb-2">
                {isUploading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-pink-600" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <p className="font-bold text-xs text-[#2E241E]">
                {isUploading ? 'Sedang Mengompres...' : 'Klik untuk Pilih Foto dari Galeri HP / PC'}
              </p>
              <span className="text-[10px] text-[#8C7D75] mt-0.5 block">
                Format JPG/PNG/WEBP (Otomatis dikompres &lt; 150KB &amp; simpan ke Firestore)
              </span>
            </label>

            <label
              htmlFor={inputId}
              className="w-full px-4 py-2.5 rounded-xl bg-pink-50 border border-pink-200 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer select-none"
            >
              <Upload className="w-4 h-4 text-pink-600" />
              <span>Pilih Foto / Unggah dari Galeri</span>
            </label>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-pink-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100/70 text-pink-700 text-xs font-bold mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>Pusat Kendali Branding &amp; Media Toko</span>
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#2D2D2D]">
            Pengaturan Toko &amp; Branding DISSOF.ID ♡
          </h1>
          <p className="text-xs text-[#7A6A61] mt-1 font-medium max-w-3xl">
            Unggah logo, banner hero, banner event pop-up, foto QRIS, rekening bank, serta galeri Instagram. Semua foto langsung dikompres (maks 800px, JPEG 0.6) dan tersimpan ke Firestore secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0 shadow-2xs">
          <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Real-Time Sync Live</span>
        </div>
      </div>

      {/* Toast Pop-Up */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-md animate-in fade-in duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-pink-100 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'media'
              ? 'bg-[#2D2D2D] text-white shadow-md'
              : 'bg-white text-[#63534B] hover:bg-pink-50 border border-pink-100'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-pink-300" />
          <span>1. Unggah Foto &amp; Media (Logo, Banner, QRIS, IG)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'content'
              ? 'bg-[#2D2D2D] text-white shadow-md'
              : 'bg-white text-[#63534B] hover:bg-pink-50 border border-pink-100'
          }`}
        >
          <FileText className="w-4 h-4 text-pink-300" />
          <span>2. Teks Toko &amp; Running Announcement Bar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('background')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'background'
              ? 'bg-[#2D2D2D] text-white shadow-md'
              : 'bg-white text-[#63534B] hover:bg-pink-50 border border-pink-100'
          }`}
        >
          <Layers className="w-4 h-4 text-pink-300" />
          <span>3. Tema Warna Latar Belakang</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: MEDIA UPLOADERS (NATIVE INPUT + INSTANT FIRESTORE)
          ======================================================== */}
      {activeTab === 'media' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Section 1: Logo & Favicon */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderUploadBox(
              'logoUrl',
              'Logo Toko (Header Navbar)',
              'Tampil di bagian atas navigasi website pembeli (Format PNG Transparan / JPG)',
              brandingData.logoUrl,
              'Rasio Bebas / Transparan',
              'h-32'
            )}

            {renderUploadBox(
              'faviconUrl',
              'Favicon Toko (Icon Tab Browser)',
              'Icon kecil tab browser dan shortcut home screen pembeli',
              brandingData.faviconUrl,
              'Rasio 1:1 Persegi (256x256)',
              'h-32'
            )}
          </div>

          {/* Section 2: Banner Hero & Barcode QRIS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderUploadBox(
              'heroBanner',
              'Hero Banner Promo Utama',
              'Foto highlight aksesoris besar di sebelah kanan headline halaman depan',
              brandingData.heroBanner,
              'Rasio 4:5 atau 1:1',
              'h-52'
            )}

            {renderUploadBox(
              'qrisImage',
              'Foto Barcode QRIS Toko',
              'Muncul otomatis saat pembeli memilih pembayaran QRIS di checkout',
              brandingData.qrisImage,
              'Rasio 1:1 Persegi',
              'h-52'
            )}
          </div>

          {/* Section 3: Banner Pop-Up Event & Foto Rekening Bank */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderUploadBox(
              'eventBanner',
              'Banner Event & Pop-Up Store Offline Dumai',
              'Foto booth Car Free Night / bazaar di section "Find Us Offline ♡"',
              brandingData.eventBanner,
              'Rasio 16:9 atau 4:3',
              'h-48'
            )}

            {renderUploadBox(
              'bankAccountImage',
              'Foto Buku Rekening / Panduan Transfer Bank',
              'Tampil sebagai panduan visual pembayaran transfer bank di checkout',
              brandingData.bankAccountImage,
              'Rasio Bebas / 16:9',
              'h-48'
            )}
          </div>

          {/* Section 4: Galeri Craft Highlight (2 Foto) */}
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-xs space-y-4">
            <div className="border-b border-pink-100 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                Galeri Highlight Aksesoris Handmade (2 Foto)
              </h3>
              <p className="text-xs text-[#7A6A61]">
                Dua foto proses kerajinan di samping cerita "made with love, bead by bead ♡"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderUploadBox(
                'highlightImage0',
                'Foto Highlight Craft #1',
                'Proses merangkai manik-manik',
                brandingData.highlightImage0,
                'Rasio 4:5 atau 1:1',
                'h-44'
              )}

              {renderUploadBox(
                'highlightImage1',
                'Foto Highlight Craft #2',
                'Detail charm & packaging estetik',
                brandingData.highlightImage1,
                'Rasio 4:5 atau 1:1',
                'h-44'
              )}
            </div>
          </div>

          {/* Section 5: Galeri Instagram Feed (4 Foto Kotak) */}
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2E241E] flex items-center gap-2">
                  <span>Galeri Instagram Feed (4 Foto Kotak)</span>
                  <Instagram className="w-4 h-4 text-pink-600" />
                </h3>
                <p className="text-xs text-[#7A6A61]">
                  Katalog Instagram @{instagram.replace('@', '')} di bagian bawah homepage
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderUploadBox('igFeed0', 'Kotak IG #1', 'Foto grid 1', brandingData.igFeed0, '1:1 Persegi', 'h-36')}
              {renderUploadBox('igFeed1', 'Kotak IG #2', 'Foto grid 2', brandingData.igFeed1, '1:1 Persegi', 'h-36')}
              {renderUploadBox('igFeed2', 'Kotak IG #3', 'Foto grid 3', brandingData.igFeed2, '1:1 Persegi', 'h-36')}
              {renderUploadBox('igFeed3', 'Kotak IG #4', 'Foto grid 4', brandingData.igFeed3, '1:1 Persegi', 'h-36')}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: CONTENT & TEXTS
          ======================================================== */}
      {activeTab === 'content' && (
        <form onSubmit={handleSaveAll} className="space-y-6 animate-in fade-in duration-200">
          
          {/* Running Announcement Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-pink-100 pb-3">
              <Megaphone className="w-5 h-5 text-pink-500" />
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                  Running Announcement Bar (Pengumuman Paling Atas)
                </h3>
                <p className="text-xs text-[#7A6A61]">Banner strip berjalan di paling atas halaman</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2E241E]">Teks Pengumuman Banner:</label>
              <input
                type="text"
                required
                value={announcementBanner}
                onChange={(e) => setAnnouncementBanner(e.target.value)}
                placeholder="✨ FREE GIFT BOX & POUCH UNTUK SETIAP PEMBELIAN ♡ | BISA CUSTOM NAMA & INISIAL"
                className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Brand Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-pink-100 pb-3">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                  Identitas Brand &amp; Kontak Resmi
                </h3>
                <p className="text-xs text-[#7A6A61]">Nama brand, tagline, WhatsApp, Instagram</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E241E]">Nama Brand / Toko:</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E241E]">Tagline Brand (Huruf Kecil Estetik):</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E241E]">Username Instagram:</label>
                <div className="relative">
                  <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                  <input
                    type="text"
                    required
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E241E]">No. WhatsApp Admin (Format 62... / 08...):</label>
                <div className="relative">
                  <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Offline Spot */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-pink-100 pb-3">
              <MapPin className="w-5 h-5 text-pink-500" />
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                  Lokasi Pop-Up Bazaar &amp; Cerita Brand
                </h3>
                <p className="text-xs text-[#7A6A61]">Jadwal offline booth dan cerita handmade</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E241E]">Nama Spot Pop-Up Offline:</label>
                <input
                  type="text"
                  value={offlineSpot}
                  onChange={(e) => setOfflineSpot(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E241E]">Jadwal Buka Booth Pop-Up:</label>
                <input
                  type="text"
                  value={offlineSchedule}
                  onChange={(e) => setOfflineSchedule(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2E241E]">Kisah / Filosofi Brand (About Story):</label>
              <textarea
                rows={3}
                value={aboutStory}
                onChange={(e) => setAboutStory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
              />
            </div>
          </div>

        </form>
      )}

      {/* ========================================================
          TAB 3: THEME COLOR
          ======================================================== */}
      {activeTab === 'background' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="border-b border-pink-100 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                Pilihan Warna Latar Belakang Pastel
              </h3>
              <p className="text-xs text-[#7A6A61]">Klik palet warna untuk langsung mengubah nuansa estetika website</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COLOR_PRESETS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => handleApplyColor(col.hex)}
                  className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 text-left cursor-pointer ${
                    String(selectedColor || '').toLowerCase() === String(col.hex || '').toLowerCase()
                      ? 'border-pink-500 bg-pink-50/50 shadow-xs'
                      : 'border-black/5 hover:border-pink-300 bg-white'
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-xl border border-black/10 shadow-xs shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  <div>
                    <p className="text-xs font-bold text-[#2E241E]">{col.name}</p>
                    <span className="text-[10px] text-gray-500 font-mono">{col.hex}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          BOTTOM FLOATING SAVE BAR
          ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur-md border-t border-pink-100 shadow-2xl flex items-center justify-between gap-4 max-w-7xl mx-auto rounded-t-3xl sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:shadow-none sm:p-0 sm:mt-8">
        <div className="hidden sm:flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <span className="text-xs text-[#55473F] font-semibold">
            Semua foto &amp; teks otomatis terkirim real-time ke Firestore (store_settings/general) ♡
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleSaveAll()}
          disabled={isSavingGlobal}
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          {isSavingGlobal ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Menyimpan ke Firestore...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-white" />
              <span>Simpan Perubahan / Update Branding ♡</span>
            </>
          )}
        </button>
      </div>

      {/* Zoom Modal */}
      {previewZoomImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div className="max-w-2xl w-full bg-white rounded-3xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="font-bold text-xs text-[#2D2D2D]">{previewZoomImage.label} (Pratinjau)</span>
              <button onClick={() => setPreviewZoomImage(null)} className="text-gray-400 hover:text-black text-xs font-bold px-2 py-1 cursor-pointer">
                Tutup ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-[#F9F7F2] rounded-2xl p-2">
              <ImageWithFallback src={previewZoomImage.src} alt={previewZoomImage.label} className="max-h-[65vh] w-auto object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
