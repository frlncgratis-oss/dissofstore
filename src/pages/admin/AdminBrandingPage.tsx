import React, { useState, useRef } from 'react';
import { 
  Palette, 
  Upload, 
  Trash2, 
  Sparkles, 
  Check, 
  Image as ImageIcon, 
  RotateCcw, 
  Eye, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Crop
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { compressImageFile } from '../../lib/utils';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { ImageCropModal } from '../../components/common/ImageCropModal';

const PRESET_LOGOS = [
  {
    name: 'Heart Ribbon Script',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&auto=format&fit=crop&q=80',
    desc: 'Logo feminin dengan aksen pita & pastel pink'
  },
  {
    name: 'Sparkle Beads Badge',
    url: 'https://images.unsplash.com/photo-1611591475152-4735d38d0145?w=400&auto=format&fit=crop&q=80',
    desc: 'Badge aksesoris beads minimalis & estetik'
  },
  {
    name: 'Pastel Daisy Emblem',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=80',
    desc: 'Emblem bunga daisy ceria khas DISSOF'
  }
];

const PRESET_BANNERS = [
  {
    name: 'Strawberry & Pastel Beads (Default)',
    url: 'https://images.unsplash.com/photo-1611591475152-4735d38d0145?w=900&auto=format&fit=crop&q=80',
    tag: 'Best Seller Series'
  },
  {
    name: 'Soft Pearl & Crystal Charms',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&auto=format&fit=crop&q=80',
    tag: 'Pearl Collection'
  },
  {
    name: 'Daisy Flower & Ribbon Bracelets',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&auto=format&fit=crop&q=80',
    tag: 'Spring Blooms'
  },
  {
    name: 'Sweet Candy Pastel Charm Stack',
    url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=80',
    tag: 'Pastel Dream'
  }
];

const PRESET_BG_COLORS = [
  { name: 'Krem Pastel (Default)', color: '#F9F7F2', desc: 'Warna bawaan estetik khas DISSOF.ID' },
  { name: 'Soft Blush Pink', color: '#FFF0F3', desc: 'Sentuhan manis feminin lembut' },
  { name: 'Fairy Lavender', color: '#F7F2FA', desc: 'Nuansa ungu pastel magis' },
  { name: 'Minty Blossom', color: '#F0FAF7', desc: 'Segar dan menenangkan' },
  { name: 'Pure Soft Ivory', color: '#FCFBF7', desc: 'Putih gading minimalis & bersih' },
  { name: 'Warm Oat & Sand', color: '#F5EFEB', desc: 'Hangat bernuansa earthy' },
  { name: 'Peach Ribbon Glow', color: '#FFEFEF', desc: 'Aksen peach pastel berkilau' },
  { name: 'Cloudy Sky Pastel', color: '#F0F6FA', desc: 'Biru langit pastel cerah' },
];

const PRESET_BG_PATTERNS = [
  {
    name: 'Soft Pink Bokeh & Sparkles',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&auto=format&fit=crop&q=80',
    tag: 'Sparkle Texture'
  },
  {
    name: 'Delicate Pastel Flora',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&auto=format&fit=crop&q=80',
    tag: 'Floral Background'
  },
  {
    name: 'Daisy Garden Dream',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&auto=format&fit=crop&q=80',
    tag: 'Garden Pattern'
  }
];

export const AdminBrandingPage: React.FC = () => {
  const { 
    settings, 
    storeLogo, 
    storeHeroBanner, 
    storeBackground,
    saveStoreLogo, 
    removeStoreLogo, 
    saveHeroBanner, 
    removeHeroBanner,
    saveStoreBackground,
    resetStoreBackground
  } = useStore();

  const brandName = settings?.brand_name || 'DISSOF.ID';
  const tagline = settings?.tagline || 'everything is heartmade♡';

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const [logoInputUrl, setLogoInputUrl] = useState('');
  const [bannerInputUrl, setBannerInputUrl] = useState('');
  const [bgInputUrl, setBgInputUrl] = useState('');

  // Background color state for color picker
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    return storeBackground?.type === 'color' && storeBackground?.value ? storeBackground.value : '#F9F7F2';
  });

  const [bgMode, setBgMode] = useState<'cover' | 'repeat' | 'fixed'>(() => storeBackground?.mode || 'cover');

  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [isProcessingBanner, setIsProcessingBanner] = useState(false);
  const [isProcessingBg, setIsProcessingBg] = useState(false);

  // Crop Modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropTargetType, setCropTargetType] = useState<'logo' | 'banner' | 'background' | null>(null);
  const [cropAspect, setCropAspect] = useState<number | undefined>(1 / 1);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openCropForLogo = (imageSrc: string) => {
    setCropImageSrc(imageSrc);
    setCropTargetType('logo');
    setCropAspect(1 / 1);
    setCropModalOpen(true);
  };

  const openCropForBanner = (imageSrc: string) => {
    setCropImageSrc(imageSrc);
    setCropTargetType('banner');
    setCropAspect(4 / 5);
    setCropModalOpen(true);
  };

  const openCropForBackground = (imageSrc: string) => {
    setCropImageSrc(imageSrc);
    setCropTargetType('background');
    setCropAspect(16 / 9);
    setCropModalOpen(true);
  };

  const handleCropComplete = async (croppedBase64: string) => {
    try {
      if (cropTargetType === 'logo') {
        setIsProcessingLogo(true);
        await saveStoreLogo(croppedBase64);
        showToast('success', 'Logo Header berhasil di-crop & disimpan!');
      } else if (cropTargetType === 'banner') {
        setIsProcessingBanner(true);
        await saveHeroBanner(croppedBase64);
        showToast('success', 'Banner Hero Card berhasil di-crop & disimpan!');
      } else if (cropTargetType === 'background') {
        setIsProcessingBg(true);
        await saveStoreBackground({ type: 'image', value: croppedBase64, mode: bgMode });
        showToast('success', 'Gambar Background berhasil di-crop & diterapkan!');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan hasil crop.');
    } finally {
      setIsProcessingLogo(false);
      setIsProcessingBanner(false);
      setIsProcessingBg(false);
      setCropModalOpen(false);
      setCropImageSrc(null);
      setCropTargetType(null);
    }
  };

  // --- LOGO HANDLERS ---
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        openCropForLogo(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  const handleApplyLogoUrl = async () => {
    if (!logoInputUrl.trim()) return;
    setIsProcessingLogo(true);
    try {
      await saveStoreLogo(logoInputUrl.trim());
      showToast('success', 'Logo Header dari URL berhasil disimpan!');
      setLogoInputUrl('');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan URL logo.');
    } finally {
      setIsProcessingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (window.confirm('Yakin ingin menghapus logo header? Tampilan navbar akan kembali menggunakan teks default "DISSOF.ID".')) {
      await removeStoreLogo();
      showToast('success', 'Logo Header telah dihapus. Navbar kembali menggunakan teks default.');
    }
  };

  // --- BANNER HANDLERS ---
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        openCropForBanner(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
  };

  const handleApplyBannerUrl = async () => {
    if (!bannerInputUrl.trim()) return;
    setIsProcessingBanner(true);
    try {
      await saveHeroBanner(bannerInputUrl.trim());
      showToast('success', 'Gambar Hero/Banner dari URL berhasil disimpan!');
      setBannerInputUrl('');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan URL banner.');
    } finally {
      setIsProcessingBanner(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (window.confirm('Yakin ingin menghapus gambar banner utama? Halaman depan akan kembali menggunakan foto default estetik.')) {
      await removeHeroBanner();
      showToast('success', 'Banner utama telah dihapus. Card hero kembali menggunakan foto default.');
    }
  };

  const defaultHeroImage = 'https://images.unsplash.com/photo-1611591475152-4735d38d0145?w=900&auto=format&fit=crop&q=80';
  const activeHeroImage = storeHeroBanner || defaultHeroImage;

  // --- BACKGROUND HANDLERS ---
  const handleApplyColor = async (colorHex: string) => {
    setSelectedColor(colorHex);
    setIsProcessingBg(true);
    try {
      await saveStoreBackground({ type: 'color', value: colorHex, mode: 'cover' });
      showToast('success', `Warna latar belakang (${colorHex}) berhasil diterapkan dan disimpan ke LocalStorage (key: store_background)!`);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan warna background.');
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleBgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        openCropForBackground(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    if (bgFileInputRef.current) bgFileInputRef.current.value = '';
  };

  const handleApplyBgUrl = async () => {
    if (!bgInputUrl.trim()) return;
    setIsProcessingBg(true);
    try {
      await saveStoreBackground({ type: 'image', value: bgInputUrl.trim(), mode: bgMode });
      showToast('success', 'Gambar latar belakang dari URL berhasil disimpan!');
      setBgInputUrl('');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan URL gambar background.');
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleBgModeChange = async (newMode: 'cover' | 'repeat' | 'fixed') => {
    setBgMode(newMode);
    if (storeBackground?.type === 'image') {
      await saveStoreBackground({ ...storeBackground, mode: newMode });
      showToast('success', `Mode gambar latar belakang diubah menjadi "${newMode === 'repeat' ? 'Pola Berulang (Repeat Pattern)' : newMode === 'fixed' ? 'Parallax (Fixed Background)' : 'Penuh (Full Cover)'}"!`);
    }
  };

  const handleResetDefaultBackground = async () => {
    if (window.confirm('Kembalikan latar belakang website ke warna default (krem pastel #F9F7F2)?')) {
      setSelectedColor('#F9F7F2');
      await resetStoreBackground();
      showToast('success', 'Latar belakang berhasil dikembalikan ke warna default (krem pastel #F9F7F2)!');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-pink-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100/60 text-pink-700 text-xs font-bold mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>Kustomisasi Tampilan & Identitas Toko</span>
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#2D2D2D]">
            Pengaturan Toko / Branding ♡
          </h1>
          <p className="text-xs text-[#7A6A61] mt-1 font-medium max-w-2xl">
            Kelola Logo Header Navbar, Gambar Banner/Hero Card Utama, dan Latar Belakang (Warna & Gambar Pattern) seluruh website. Perubahan langsung tersinkronisasi ke Database Online Firestore dan aktif secara real-time di semua HP & perangkat.
          </p>
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

      {/* ========================================================
          1. PENGATURAN LOGO HEADER
          ======================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-pink-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-xs">
                1
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#2E241E]">
                Pengaturan Logo Header (Navbar Atas)
              </h2>
            </div>
            <p className="text-xs text-[#7A6A61]">
              Unggah logo kustom toko Anda. Jika kosong atau dihapus, navbar otomatis menampilkan teks default <strong className="text-pink-600">"{brandName}"</strong>.
            </p>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-pink-50 text-pink-700 px-3 py-1 rounded-full border border-pink-200">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
            <span>key: 'store_logo'</span>
          </span>
        </div>

        {/* Live Preview Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#2E241E] flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-pink-500" />
            <span>Pratinjau Tampilan Header Navbar:</span>
          </label>
          <div className="bg-[#F9F7F2] p-4 sm:p-6 rounded-2xl border-2 border-dashed border-pink-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              {storeLogo ? (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-pink-100 shadow-xs">
                  <img
                    src={storeLogo}
                    alt="Logo Header Toko"
                    className="h-10 sm:h-12 max-w-[180px] object-contain rounded-xl"
                  />
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    Logo Aktif ✓
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2D2D2D] text-white flex items-center justify-center text-base font-bold shadow-xs">
                    ♡
                  </div>
                  <div className="flex flex-col">
                    <span className="font-playfair text-xl sm:text-2xl font-bold tracking-tight text-[#2D2D2D]">
                      {brandName}
                    </span>
                    <span className="text-[10px] text-[#A08C8C] uppercase tracking-widest font-semibold">
                      {tagline}
                    </span>
                  </div>
                  <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full ml-2">
                    Teks Default Aktif
                  </span>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#7A6A61] font-semibold">
              <span className="text-pink-600">HOME</span> • <span>SHOP</span> • <span>CUSTOM ORDER ♡</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Ubah Logo & Hapus Logo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* File Upload Button */}
          <div className="space-y-2">
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoFileUpload}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => logoFileInputRef.current?.click()}
                disabled={isProcessingLogo}
                className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-md shadow-pink-200 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{storeLogo ? 'Ubah Logo (Pilih File)' : 'Unggah Logo Header Baru'}</span>
              </button>

              {storeLogo && (
                <>
                  <button
                    type="button"
                    onClick={() => openCropForLogo(storeLogo)}
                    disabled={isProcessingLogo}
                    className="px-3.5 py-3 rounded-2xl bg-pink-100/90 hover:bg-pink-200 text-pink-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs border border-pink-200"
                    title="Crop & Sesuaikan Posisi Logo"
                  >
                    <Crop className="w-4 h-4 text-pink-600" />
                    <span>Crop Logo ♡</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={isProcessingLogo}
                    className="px-3.5 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Hapus Logo Header"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Hapus</span>
                  </button>
                </>
              )}
            </div>
            <p className="text-[10px] text-[#8C7D75]">
              Mendukung PNG (transparan), JPG, atau WebP. Gambar otomatis dioptimasi agar hemat memori LocalStorage.
            </p>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Atau tempel link / URL logo gambar..."
                value={logoInputUrl}
                onChange={(e) => setLogoInputUrl(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-xs text-[#2E241E] focus:ring-1 focus:ring-pink-400 placeholder:text-[#A08C8C]"
              />
              <button
                type="button"
                onClick={handleApplyLogoUrl}
                disabled={!logoInputUrl.trim() || isProcessingLogo}
                className="px-4 py-2.5 rounded-xl bg-[#2D2D2D] text-white text-xs font-bold hover:bg-black transition-colors disabled:opacity-40 cursor-pointer"
              >
                Terapkan URL
              </button>
            </div>
          </div>
        </div>

        {/* Quick Preset Logos */}
        <div className="pt-2 border-t border-pink-50 space-y-2.5">
          <p className="text-[11px] font-bold text-[#7A6A61] uppercase tracking-wider">
            Atau Gunakan Logo Preset Estetik (1-Klik):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESET_LOGOS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  saveStoreLogo(preset.url);
                  showToast('success', `Logo "${preset.name}" berhasil diterapkan!`);
                }}
                className="p-3 rounded-2xl border border-pink-100 bg-pink-50/30 hover:bg-pink-50 hover:border-pink-300 transition-all text-left flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-10 h-10 rounded-xl object-cover border border-pink-200 group-hover:scale-105 transition-transform"
                />
                <div>
                  <h4 className="font-bold text-xs text-[#2E241E] group-hover:text-pink-600">
                    {preset.name}
                  </h4>
                  <p className="text-[10px] text-[#8C7D75] line-clamp-1">
                    {preset.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          2. PENGATURAN GAMBAR BANNER / HERO CARD
          ======================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-pink-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#2E241E]">
                Pengaturan Gambar Banner / Hero Card Utama
              </h2>
            </div>
            <p className="text-xs text-[#7A6A61]">
              Foto card visual utama yang tampil di sebelah tombol "SHOP NOW" & "MAKE YOUR CUSTOM ♡" pada Beranda.
            </p>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-pink-50 text-pink-700 px-3 py-1 rounded-full border border-pink-200">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
            <span>key: 'store_hero_banner'</span>
          </span>
        </div>

        {/* Hero Card Preview & Action Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Hero Card Mockup Preview */}
          <div className="lg:col-span-5">
            <label className="text-xs font-bold text-[#2E241E] flex items-center gap-1.5 mb-2">
              <Eye className="w-3.5 h-3.5 text-pink-500" />
              <span>Pratinjau Hero Card Beranda:</span>
            </label>

            <div className="relative mx-auto max-w-xs rounded-3xl overflow-hidden border-4 border-pink-200 shadow-xl bg-pink-50 aspect-[4/5] group">
              <ImageWithFallback
                src={activeHeroImage}
                alt="Banner Hero Card Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Top Floating Badge Mockup */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[10px] font-bold text-[#2E241E] shadow-sm flex items-center gap-1">
                <span>✨</span>
                <span>everything is heartmade ♡</span>
              </div>

              {/* Bottom Tag Mockup */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-pink-100 flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[9px] uppercase font-bold text-pink-600">Heartmade Series</span>
                  <h4 className="font-bold text-[11px] text-[#2E241E] truncate max-w-[140px]">Custom Beads DISSOF.ID</h4>
                </div>
                <span className="font-extrabold text-xs text-pink-600">Rp 35.000</span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                storeHeroBanner ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {storeHeroBanner ? '● Gambar Banner Kustom Aktif' : '○ Foto Default Aesthetic Digunakan'}
              </span>
            </div>
          </div>

          {/* Right Upload & Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-2">
              <h3 className="font-bold text-xs text-[#2E241E] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Upload Foto Banner Kustom Pilihan Anda</span>
              </h3>
              <p className="text-[11px] text-[#7A6A61] leading-relaxed">
                Pilih foto produk terbaik, showcase gelang beads terbaru, atau foto photoshoot pop-up store. Foto akan ditampilkan secara proporsional dan tidak akan pernah broken.
              </p>
            </div>

            {/* Hidden Input & Action Buttons */}
            <input
              ref={bannerFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerFileUpload}
            />

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                disabled={isProcessingBanner}
                className="flex-1 min-w-[180px] px-5 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white text-xs font-bold shadow-md shadow-pink-200 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{storeHeroBanner ? 'Ubah Banner (Upload)' : 'Unggah Gambar Banner Utama'}</span>
              </button>

              {storeHeroBanner && (
                <>
                  <button
                    type="button"
                    onClick={() => openCropForBanner(storeHeroBanner)}
                    disabled={isProcessingBanner}
                    className="px-4 py-3.5 rounded-2xl bg-pink-100/90 hover:bg-pink-200 text-pink-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs border border-pink-200"
                    title="Crop & Sesuaikan Posisi Banner"
                  >
                    <Crop className="w-4 h-4 text-pink-600" />
                    <span>Crop Banner ♡</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    disabled={isProcessingBanner}
                    className="px-4 py-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Hapus</span>
                  </button>
                </>
              )}
            </div>

            {/* URL Input */}
            <div className="pt-2 space-y-1.5">
              <label className="text-[11px] font-bold text-[#7A6A61]">
                Atau Masukkan URL / Link Gambar Eksternal:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... atau link foto banner"
                  value={bannerInputUrl}
                  onChange={(e) => setBannerInputUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-xs text-[#2E241E] focus:ring-1 focus:ring-pink-400 placeholder:text-[#A08C8C]"
                />
                <button
                  type="button"
                  onClick={handleApplyBannerUrl}
                  disabled={!bannerInputUrl.trim() || isProcessingBanner}
                  className="px-4 py-2.5 rounded-xl bg-[#2D2D2D] text-white text-xs font-bold hover:bg-black transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </div>

            {/* Preset Aesthetic Banners */}
            <div className="pt-3 border-t border-pink-100 space-y-2">
              <p className="text-[11px] font-bold text-[#7A6A61] uppercase tracking-wider">
                Pilih Preset Banner Estetik Bawaan:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {PRESET_BANNERS.map((banner, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      saveHeroBanner(banner.url);
                      showToast('success', `Banner "${banner.name}" berhasil diterapkan!`);
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeHeroImage === banner.url
                        ? 'border-pink-500 bg-pink-50/70 shadow-xs'
                        : 'border-pink-100 bg-white hover:border-pink-300'
                    }`}
                  >
                    <img
                      src={banner.url}
                      alt={banner.name}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-[#2E241E] truncate">
                        {banner.name}
                      </p>
                      <span className="text-[9px] text-pink-600 font-semibold">
                        {banner.tag}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          3. PENGATURAN LATAR BELAKANG WEBSITE (BACKGROUND)
          ======================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-pink-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-xs">
                3
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#2E241E]">
                Pengaturan Latar Belakang Website (Background)
              </h2>
            </div>
            <p className="text-xs text-[#7A6A61]">
              Sesuaikan warna atau gambar pattern latar belakang untuk seluruh halaman toko (Beranda, Katalog, Detail Produk, Keranjang, dll).
            </p>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-pink-50 text-pink-700 px-3 py-1 rounded-full border border-pink-200">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
            <span>key: 'store_background'</span>
          </span>
        </div>

        {/* Live Preview & Status Box */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-[#2E241E] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-pink-500" />
              <span>Pratinjau Latar Belakang Aktif:</span>
            </label>

            <button
              type="button"
              onClick={handleResetDefaultBackground}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-all border border-pink-200 cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Default (Krem Pastel)</span>
            </button>
          </div>

          <div 
            className="p-6 sm:p-8 rounded-3xl border-2 border-dashed border-pink-200 relative overflow-hidden transition-all shadow-inner"
            style={{
              backgroundColor: storeBackground?.type === 'color' ? storeBackground.value : '#F9F7F2',
              backgroundImage: storeBackground?.type === 'image' ? `url("${storeBackground.value}")` : 'none',
              backgroundSize: storeBackground?.mode === 'repeat' ? 'auto' : 'cover',
              backgroundRepeat: storeBackground?.mode === 'repeat' ? 'repeat' : 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
            {/* Mockup Card inside preview */}
            <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-pink-100 shadow-lg flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center text-xl font-bold shadow-xs shrink-0">
                ♡
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">
                  {storeBackground?.type === 'image' ? 'Latar Gambar Aktif' : 'Latar Warna Aktif'}
                </span>
                <h4 className="font-playfair text-base font-bold text-[#2E241E] truncate">
                  {brandName} — {tagline}
                </h4>
                <p className="text-[11px] text-[#7A6A61] font-mono mt-0.5 truncate">
                  {storeBackground?.type === 'color' 
                    ? `Warna: ${storeBackground.value} ${storeBackground.value.toLowerCase() === '#f9f7f2' ? '(Default)' : ''}` 
                    : `Mode: ${storeBackground?.mode === 'repeat' ? 'Pola Berulang' : storeBackground?.mode === 'fixed' ? 'Parallax Fixed' : 'Full Cover'}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Options A: Color Picker & Preset Colors */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF8F5] border border-pink-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-[#2E241E] flex items-center gap-1.5 uppercase tracking-wide">
                <Palette className="w-4 h-4 text-pink-500" />
                <span>Opsi A: Pilih Warna Latar Belakang (Color Picker)</span>
              </h3>
              <p className="text-[11px] text-[#7A6A61] mt-0.5">
                Gunakan pemilih warna kustom interaktif atau klik palet warna pastel estetik di bawah.
              </p>
            </div>

            {/* Live Color Input & Hex */}
            <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-2xl border border-pink-200 shadow-xs self-start sm:self-auto">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => {
                  setSelectedColor(e.target.value);
                  handleApplyColor(e.target.value);
                }}
                className="w-8 h-8 rounded-xl border border-pink-200 cursor-pointer p-0.5 shrink-0"
                title="Klik untuk memilih warna kustom"
              />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[#A08C8C] uppercase">KODE HEX</span>
                <span className="font-mono text-xs font-extrabold text-[#2E241E] uppercase">{selectedColor}</span>
              </div>
            </div>
          </div>

          {/* Preset Pastel Color Chips */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-bold text-[#7A6A61] uppercase tracking-wider">
              Pilihan Palet Warna Pastel Estetik:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_BG_COLORS.map((preset, idx) => {
                const isSelected = storeBackground?.type === 'color' && storeBackground.value.toLowerCase() === preset.color.toLowerCase();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyColor(preset.color)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer group ${
                      isSelected 
                        ? 'border-pink-500 bg-white ring-2 ring-pink-300 shadow-sm' 
                        : 'border-pink-100 bg-white hover:border-pink-300'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-xl border border-black/10 shadow-2xs shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: preset.color }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-pink-600 stroke-[3]" />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#2E241E] group-hover:text-pink-600 truncate">
                        {preset.name}
                      </p>
                      <span className="text-[10px] font-mono text-[#8C7D75]">
                        {preset.color}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Options B: Upload Image / Pattern Background */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF8F5] border border-pink-100 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-[#2E241E] flex items-center gap-1.5 uppercase tracking-wide">
              <ImageIcon className="w-4 h-4 text-pink-500" />
              <span>Opsi B: Unggah Gambar / Pattern Latar Belakang</span>
            </h3>
            <p className="text-[11px] text-[#7A6A61] mt-0.5">
              Gunakan wallpaper, tekstur motif beads, atau pattern halus untuk background website.
            </p>
          </div>

          <input
            ref={bgFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBgFileUpload}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Upload Button */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bgFileInputRef.current?.click()}
                  disabled={isProcessingBg}
                  className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-md shadow-pink-200 hover:shadow-lg hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{storeBackground?.type === 'image' ? 'Ganti Gambar Latar Belakang' : 'Unggah Foto / Pattern Background'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#8C7D75]">
                Mendukung PNG, JPG, WebP. Gambar dioptimasi otomatis agar hemat kuota memori browser.
              </p>
            </div>

            {/* URL Input */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Atau masukkan URL gambar background..."
                  value={bgInputUrl}
                  onChange={(e) => setBgInputUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-xs text-[#2E241E] focus:ring-1 focus:ring-pink-400 placeholder:text-[#A08C8C]"
                />
                <button
                  type="button"
                  onClick={handleApplyBgUrl}
                  disabled={!bgInputUrl.trim() || isProcessingBg}
                  className="px-4 py-2.5 rounded-xl bg-[#2D2D2D] text-white text-xs font-bold hover:bg-black transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Terapkan URL
                </button>
              </div>
            </div>
          </div>

          {/* Background Display Mode Selection */}
          <div className="pt-2 border-t border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-xs font-bold text-[#2E241E]">Mode Tampilan Gambar:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBgModeChange('cover')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bgMode === 'cover' 
                    ? 'bg-pink-600 text-white shadow-xs' 
                    : 'bg-white text-[#7A6A61] border border-pink-200 hover:bg-pink-50'
                }`}
              >
                Penuh (Full Cover)
              </button>
              <button
                type="button"
                onClick={() => handleBgModeChange('repeat')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bgMode === 'repeat' 
                    ? 'bg-pink-600 text-white shadow-xs' 
                    : 'bg-white text-[#7A6A61] border border-pink-200 hover:bg-pink-50'
                }`}
              >
                Pola Berulang (Repeat Pattern)
              </button>
              <button
                type="button"
                onClick={() => handleBgModeChange('fixed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bgMode === 'fixed' 
                    ? 'bg-pink-600 text-white shadow-xs' 
                    : 'bg-white text-[#7A6A61] border border-pink-200 hover:bg-pink-50'
                }`}
              >
                Parallax (Fixed)
              </button>
            </div>
          </div>

          {/* Preset Background Patterns */}
          <div className="pt-2 border-t border-pink-100 space-y-2">
            <span className="text-[11px] font-bold text-[#7A6A61] uppercase tracking-wider">
              Atau Gunakan Pilihan Pattern Estetik Siap Pakai:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_BG_PATTERNS.map((pattern, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    saveStoreBackground({ type: 'image', value: pattern.url, mode: bgMode });
                    showToast('success', `Pattern "${pattern.name}" berhasil diterapkan!`);
                  }}
                  className="p-2.5 rounded-2xl border border-pink-100 bg-white hover:border-pink-300 transition-all text-left flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={pattern.url}
                    alt={pattern.name}
                    className="w-11 h-11 rounded-xl object-cover border border-pink-200 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#2E241E] group-hover:text-pink-600">
                      {pattern.name}
                    </h4>
                    <span className="text-[10px] text-pink-600 font-semibold">
                      {pattern.tag}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* Image Crop Modal for Branding */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        title={
          cropTargetType === 'logo' 
            ? 'Crop & Sesuaikan Logo Header ♡' 
            : cropTargetType === 'banner' 
            ? 'Crop & Sesuaikan Banner Hero Card ♡' 
            : 'Crop & Sesuaikan Background Pattern ♡'
        }
        description={
          cropTargetType === 'logo'
            ? 'Gunakan rasio 1:1 atau Bebas untuk mengatur logo agar pas di header navbar.'
            : cropTargetType === 'banner'
            ? 'Rasio 3:4 atau 4:3 sangat pas untuk card visual hero di halaman utama.'
            : 'Sesuaikan potongan gambar pola latar belakang agar estetik di seluruh layar.'
        }
        defaultAspect={cropAspect}
        cropOptions={{
          maxDimension: cropTargetType === 'background' ? 1200 : 900,
          quality: 0.85,
          preserveAlpha: cropTargetType === 'logo', // Preserve transparency for logo PNG
        }}
        onCropComplete={handleCropComplete}
        onClose={() => {
          setCropModalOpen(false);
          setCropImageSrc(null);
          setCropTargetType(null);
        }}
      />

    </div>
  );
};
