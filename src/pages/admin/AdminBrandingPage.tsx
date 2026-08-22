import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Upload, 
  Trash2, 
  Crop, 
  Eye, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Image as ImageIcon, 
  Layout, 
  Sliders, 
  ShieldCheck, 
  RefreshCw,
  Layers,
  Camera,
  Instagram,
  MapPin,
  Calendar,
  MessageCircle,
  Megaphone,
  Radio,
  FileText,
  HelpCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SiteSettings, StoreBackground } from '../../types';
import { 
  hardCompressImage, 
  getImageSizeInKB, 
  createWhatsAppLink 
} from '../../lib/utils';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { ImageCropModal } from '../../components/common/ImageCropModal';
import { UniversalImageUploader } from '../../components/common/UniversalImageUploader';

const COLOR_PRESETS = [
  { name: 'Krem Pastel (Bawaan)', hex: '#F9F7F2', border: 'border-amber-200' },
  { name: 'Soft Blush Pink', hex: '#FFF5F6', border: 'border-pink-200' },
  { name: 'Pure White (Bersih)', hex: '#FFFFFF', border: 'border-gray-200' },
  { name: 'Warm Cream Latte', hex: '#FAF5EE', border: 'border-orange-200' },
  { name: 'Light Rose Marshmallow', hex: '#FDF2F4', border: 'border-rose-200' },
  { name: 'Soft Sage Matcha', hex: '#F4F7F4', border: 'border-emerald-200' },
  { name: 'Lavender Mist', hex: '#F7F4FA', border: 'border-purple-200' },
  { name: 'Pale Peach Butter', hex: '#FFF8F2', border: 'border-amber-200' },
];

export const AdminBrandingPage: React.FC = () => {
  const { 
    settings, 
    saveSettingsLocal, 
    storeLogo, 
    saveStoreLogo, 
    removeStoreLogo,
    storeHeroBanner,
    saveHeroBanner,
    removeHeroBanner,
    storeBackground,
    saveStoreBackground,
    resetStoreBackground,
    isOnlineSynced
  } = useStore();

  const [activeTab, setActiveTab] = useState<'media' | 'content' | 'background'>('media');
  
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
  const [isSavingText, setIsSavingText] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    }
  }, [settings]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- SAVE TEXT SETTINGS ---
  const handleSaveTextSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingText(true);
    try {
      await saveSettingsLocal({
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
      });
      showToast('success', 'Pengaturan teks & pengumuman berhasil disimpan ke Firestore secara real-time!');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan pengaturan teks.');
    } finally {
      setIsSavingText(false);
    }
  };

  // --- MEDIA HANDLERS ---
  const handleUpdateLogo = async (compressedData: string) => {
    if (!compressedData) {
      await removeStoreLogo();
      showToast('success', 'Logo toko telah dihapus (Navbar kembali ke teks default).');
    } else {
      await saveStoreLogo(compressedData);
      showToast('success', 'Logo toko berhasil diperbarui & disimpan ke Firestore!');
    }
  };

  const handleUpdateHeroBanner = async (compressedData: string) => {
    if (!compressedData) {
      await removeHeroBanner();
      showToast('success', 'Hero banner dihapus (kembali ke foto default).');
    } else {
      await saveHeroBanner(compressedData);
      showToast('success', 'Hero banner utama berhasil diperbarui & disimpan ke Firestore!');
    }
  };

  const handleUpdatePopupBanner = async (compressedData: string) => {
    await saveSettingsLocal({ popup_banner_image: compressedData || undefined });
    showToast('success', 'Foto/Banner Event Pop-Up Store berhasil diperbarui!');
  };

  const handleUpdateHighlightImage = async (index: number, compressedData: string) => {
    const currentHighlights = settings?.highlight_images && settings.highlight_images.length > 0
      ? [...settings.highlight_images]
      : [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&auto=format&fit=crop&q=80',
        ];
    
    currentHighlights[index] = compressedData;
    await saveSettingsLocal({ highlight_images: currentHighlights });
    showToast('success', `Foto Highlight Handmade #${index + 1} berhasil diperbarui!`);
  };

  const handleUpdateInstagramImage = async (index: number, compressedData: string) => {
    const currentFeeds = settings?.instagram_feed_images && settings.instagram_feed_images.length === 4
      ? [...settings.instagram_feed_images]
      : [
          'https://images.unsplash.com/photo-1611591475152-4735d38d0145?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
        ];

    currentFeeds[index] = compressedData;
    await saveSettingsLocal({ instagram_feed_images: currentFeeds });
    showToast('success', `Foto Instagram Feed Kotak #${index + 1} berhasil diperbarui!`);
  };

  // --- BACKGROUND HANDLERS ---
  const handleApplyColor = async (colorHex: string) => {
    setSelectedColor(colorHex);
    try {
      await saveStoreBackground({ type: 'color', value: colorHex, mode: 'cover' });
      showToast('success', `Warna latar belakang (${colorHex}) berhasil diterapkan!`);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan warna background.');
    }
  };

  const handleBgFileUpload = async (compressedData: string) => {
    if (!compressedData) {
      await resetStoreBackground();
      showToast('success', 'Gambar latar belakang dihapus (kembali ke warna default).');
    } else {
      await saveStoreBackground({ type: 'image', value: compressedData, mode: bgMode });
      showToast('success', 'Gambar pola background berhasil disimpan ke Firestore!');
    }
  };

  const handleBgModeChange = async (newMode: 'cover' | 'repeat' | 'fixed') => {
    setBgMode(newMode);
    if (storeBackground?.type === 'image') {
      await saveStoreBackground({ ...storeBackground, mode: newMode });
      showToast('success', `Mode background diubah ke "${newMode}"`);
    }
  };

  const highlightImages = settings?.highlight_images || [
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&auto=format&fit=crop&q=80',
  ];

  const instagramImages = settings?.instagram_feed_images || [
    'https://images.unsplash.com/photo-1611591475152-4735d38d0145?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
  ];

  const popupImage = settings?.popup_banner_image || 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=700&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-8">
      
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-pink-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100/70 text-pink-700 text-xs font-bold mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>Dynamic Branding, Media & Content Editor</span>
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#2D2D2D]">
            Pengaturan Tampilan & Media ♡
          </h1>
          <p className="text-xs text-[#7A6A61] mt-1 font-medium max-w-3xl">
            Pusat kendali seluruh foto, banner, running announcement bar, Instagram feed, info event bazaar Dumai, dan identitas toko. Semua perubahan langsung terhubung 100% ke Cloud Firestore secara instan di semua HP pembeli.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0 shadow-2xs">
          <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Firestore onSnapshot Aktif</span>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-md animate-in fade-in slide-in-from-top-2 duration-200 ${
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

      {/* Navigation Tabs */}
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
          <span>1. Unggah Foto & Banner (Universal Uploader)</span>
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
          <span>2. Teks Toko & Running Announcement Bar</span>
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
          <span>3. Tema Warna & Pola Latar Belakang</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: UNIVERSAL MEDIA UPLOADER (ALL SECTIONS)
          ======================================================== */}
      {activeTab === 'media' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Section A: Logo Header & Hero Promo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* A1: Logo Header Navbar */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-xs">
                    A
                  </span>
                  <h3 className="font-bold text-sm text-[#2E241E]">Logo Header Toko (Navbar)</h3>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">Navbar Brand Logo</span>
              </div>

              <UniversalImageUploader
                label="Logo Header Toko"
                sublabel="Akan tampil di navbar atas website. Jika dihapus, otomatis menampilkan teks nama toko."
                currentImage={storeLogo}
                onImageChange={handleUpdateLogo}
                onImageRemove={() => handleUpdateLogo('')}
                aspectRatioLabel="Rasio Bebas / Transparan PNG"
                previewHeightClass="h-28"
              />
            </div>

            {/* A2: Hero Banner / Promo Utama */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-xs">
                    B
                  </span>
                  <h3 className="font-bold text-sm text-[#2E241E]">Hero Banner Promo Utama</h3>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">Card Showcase Depan</span>
              </div>

              <UniversalImageUploader
                label="Foto Banner Utama (Hero Card)"
                sublabel="Foto highlight aksesoris besar di sebelah kanan headline halaman depan."
                currentImage={storeHeroBanner}
                onImageChange={handleUpdateHeroBanner}
                onImageRemove={() => handleUpdateHeroBanner('')}
                aspectRatioLabel="Rasio 4:5 atau 1:1"
                previewHeightClass="h-44 sm:h-52"
              />
            </div>

          </div>

          {/* Section B: Info Event Pop-Up Store */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-xs">
                  C
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                    Section Info Event & Pop-Up Store (Banner / Foto Event Dumai)
                  </h3>
                  <p className="text-xs text-[#7A6A61]">Foto booth Car Free Night Soebrantas atau Bazaar Pop-Up di section "Find Us Offline ♡"</p>
                </div>
              </div>
            </div>

            <UniversalImageUploader
              label="Banner / Foto Booth Pop-Up Market"
              sublabel="Foto suasana booth Dissof di CFN Soebrantas / event bazar Dumai."
              currentImage={popupImage}
              onImageChange={handleUpdatePopupBanner}
              aspectRatioLabel="Rasio 16:9 atau 4:3"
              previewHeightClass="h-48 sm:h-64"
            />
          </div>

          {/* Section C: Highlight Aksesoris Handmade (2 Foto) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-xs">
                  D
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                    Section Galeri / Highlight Aksesoris Handmade (2 Foto Craft)
                  </h3>
                  <p className="text-xs text-[#7A6A61]">Dua foto estetik di samping deskripsi "made with love, bead by bead ♡" di homepage</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <UniversalImageUploader
                label="Foto Highlight Craft #1"
                sublabel="Proses merangkai manik-manik / beaded collection"
                currentImage={highlightImages[0]}
                onImageChange={(data) => handleUpdateHighlightImage(0, data)}
                aspectRatioLabel="Rasio 4:5 atau 1:1"
                previewHeightClass="h-44 sm:h-48"
              />

              <UniversalImageUploader
                label="Foto Highlight Craft #2"
                sublabel="Detail liontin, charm, atau packaging estetik"
                currentImage={highlightImages[1]}
                onImageChange={(data) => handleUpdateHighlightImage(1, data)}
                aspectRatioLabel="Rasio 4:5 atau 1:1"
                previewHeightClass="h-44 sm:h-48"
              />
            </div>
          </div>

          {/* Section D: Instagram Feed (4 Kotak Foto Instagram) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-xs">
                  E
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#2E241E] flex items-center gap-2">
                    <span>Section Instagram Feed (4 Kotak Foto Instagram)</span>
                    <Instagram className="w-4 h-4 text-pink-600" />
                  </h3>
                  <p className="text-xs text-[#7A6A61]">Unggah 4 foto katalog terbaru untuk grid Instagram @{instagram.replace('@', '')} di bagian bawah halaman depan</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {instagramImages.map((imgSrc, idx) => (
                <UniversalImageUploader
                  key={idx}
                  label={`Kotak Instagram #${idx + 1}`}
                  sublabel={`Foto grid ${idx + 1}`}
                  currentImage={imgSrc}
                  onImageChange={(data) => handleUpdateInstagramImage(idx, data)}
                  aspectRatioLabel="Rasio 1:1 Persegi"
                  previewHeightClass="h-36 sm:h-40"
                />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: REAL-TIME TEXT & CONTENT EDITOR
          ======================================================== */}
      {activeTab === 'content' && (
        <form onSubmit={handleSaveTextSettings} className="space-y-6 animate-in fade-in duration-200">
          
          {/* 1. Running Announcement Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-pink-100 pb-3">
              <Megaphone className="w-5 h-5 text-pink-500" />
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                  Running Announcement Bar (Pengumuman Paling Atas di Header)
                </h3>
                <p className="text-xs text-[#7A6A61]">Banner strip hitam di atas navbar yang berjalan/tampil di seluruh halaman</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2E241E]">Teks Pengumuman Banner:</label>
              <input
                type="text"
                required
                value={announcementBanner}
                onChange={(e) => setAnnouncementBanner(e.target.value)}
                placeholder="Contoh: ✨ FREE GIFT BOX & POUCH UNTUK SETIAP PEMBELIAN ♡ | BISA CUSTOM NAMA & INISIAL"
                className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
              />
              <p className="text-[11px] text-gray-500">
                Gunakan emoji dan teks menarik untuk mengumumkan promo gratis ongkir, bazaar akhir pekan, atau free gift.
              </p>
            </div>
          </div>

          {/* 2. Informasi Brand & Kontak */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-pink-100 pb-3">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                  Identitas Brand &amp; Kontak Resmi
                </h3>
                <p className="text-xs text-[#7A6A61]">Nama brand, tagline estetik, WhatsApp, dan username Instagram</p>
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
                  placeholder="everything is heartmade♡"
                  className="w-full px-4 py-2.5 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E241E]">Username &amp; Link Instagram:</label>
                <div className="relative">
                  <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                  <input
                    type="text"
                    required
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@dissof.id"
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
                    placeholder="6282284901234"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Pop-Up Store Dumai & Deskripsi Toko */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-pink-100 pb-3">
              <MapPin className="w-5 h-5 text-pink-500" />
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                  Lokasi Pop-Up Bazaar &amp; Cerita Brand
                </h3>
                <p className="text-xs text-[#7A6A61]">Jadwal offline booth dan teks cerita handmade</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E241E]">Nama Spot Pop-Up Offline:</label>
                <input
                  type="text"
                  value={offlineSpot}
                  onChange={(e) => setOfflineSpot(e.target.value)}
                  placeholder="Dumai Pop-Up Store / Bazaars"
                  className="w-full px-4 py-2.5 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E241E]">Jadwal Buka Booth Pop-Up:</label>
                <input
                  type="text"
                  value={offlineSchedule}
                  onChange={(e) => setOfflineSchedule(e.target.value)}
                  placeholder="Setiap Sabtu & Minggu Malam (19.00 - 23.00 WIB)"
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2E241E]">Teks Catatan Kaki (Footer):</label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="everything is heartmade♡ Crafted with love in Dumai, Indonesia."
                className="w-full px-4 py-2.5 rounded-2xl border border-black/10 bg-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSavingText}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-white" />
              <span>{isSavingText ? 'Menyimpan ke Firestore...' : 'Simpan Semua Pengaturan Teks ♡'}</span>
            </button>
          </div>

        </form>
      )}

      {/* ========================================================
          TAB 3: BACKGROUND COLOR & PATTERNS
          ======================================================== */}
      {activeTab === 'background' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Preset Palettes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                  Pilihan Warna Latar Belakang Pastel
                </h3>
                <p className="text-xs text-[#7A6A61]">Klik palet warna untuk langsung mengubah nuansa estetika seluruh website</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COLOR_PRESETS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => handleApplyColor(col.hex)}
                  className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 text-left cursor-pointer ${
                    selectedColor.toLowerCase() === col.hex.toLowerCase()
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

          {/* Custom Pattern Background Uploader */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2E241E]">
                  Unggah Gambar Pola Background (Wallpaper Pattern)
                </h3>
                <p className="text-xs text-[#7A6A61]">Unggah pola seamless atau wallpaper estetika untuk latar website</p>
              </div>
            </div>

            <UniversalImageUploader
              label="Gambar Pola / Wallpaper Background"
              sublabel="Otomatis dikompres &lt; 150 KB dan diterapkan ke body website"
              currentImage={storeBackground?.type === 'image' ? storeBackground.value : null}
              onImageChange={handleBgFileUpload}
              onImageRemove={() => handleBgFileUpload('')}
              aspectRatioLabel="Rasio Bebas / Seamless Tile"
              previewHeightClass="h-40"
            />

            {storeBackground?.type === 'image' && (
              <div className="pt-2 flex items-center gap-2">
                <span className="text-xs font-bold text-[#2E241E]">Mode Tampilan:</span>
                {(['cover', 'repeat', 'fixed'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleBgModeChange(m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bgMode === m
                        ? 'bg-[#2D2D2D] text-white'
                        : 'bg-[#FAF7F2] text-[#63534B] hover:bg-pink-100'
                    }`}
                  >
                    {m === 'cover' ? 'Full Cover' : m === 'repeat' ? 'Repeat Pattern' : 'Parallax Fixed'}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
