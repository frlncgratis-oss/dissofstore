import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Sparkles, 
  Check, 
  Instagram, 
  MessageCircle, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../lib/api';
import { SiteSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { settings, refreshData } = useStore();

  const [formData, setFormData] = useState<SiteSettings>({
    brand_name: 'DISSOF.ID',
    tagline: 'everything is heartmade♡',
    sub_tagline: 'handmade accessories & little treasures',
    instagram: '@dissof.id',
    whatsapp_number: '6282284901234',
    location: 'Dumai, Riau',
    offline_spot: 'Dumai Pop-Up Store / Bazaars',
    offline_schedule: 'Setiap Sabtu & Minggu Malam (19.00 - 23.00 WIB)',
    announcement_banner: '✨ FREE GIFT BOX & POUCH UNTUK SETIAP PEMBELIAN ♡ | BISA CUSTOM NAMA & INISIAL',
    about_story: 'DISSOF.ID adalah UMKM handmade accessories lokal dari Dumai yang merangkai manik-manik indah secara manual dengan cinta.',
    footer_text: 'everything is heartmade♡ Crafted with love in Dumai, Indonesia.',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        brand_name: settings.brand_name ?? 'DISSOF.ID',
        tagline: settings.tagline ?? 'everything is heartmade♡',
        sub_tagline: settings.sub_tagline ?? 'handmade accessories & little treasures',
        instagram: settings.instagram ?? '@dissof.id',
        whatsapp_number: settings.whatsapp_number ?? '6282284901234',
        location: settings.location ?? 'Dumai, Riau',
        offline_spot: settings.offline_spot ?? 'Dumai Pop-Up Store / Bazaars',
        offline_schedule: settings.offline_schedule ?? 'Setiap Sabtu & Minggu Malam (19.00 - 23.00 WIB)',
        announcement_banner: settings.announcement_banner ?? settings.announcement ?? '✨ FREE GIFT BOX & POUCH UNTUK SETIAP PEMBELIAN ♡ | BISA CUSTOM NAMA & INISIAL',
        about_story: settings.about_story ?? '',
        footer_text: settings.footer_text ?? '',
      });
    }
  }, [settings]);

  const handleChange = (field: keyof SiteSettings, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.updateSettings(formData);
      await refreshData();
      setSuccessMsg('Pengaturan website berhasil disimpan dan aktif seketika!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#2D2D2D]">
            Pengaturan Website & Kontak Toko
          </h1>
          <p className="text-xs text-[#A08C8C] mt-0.5 font-medium">
            Atur nomor WhatsApp penerima pesanan, akun Instagram, nama brand, dan lokasi offline.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs space-y-6 text-xs">
        
        {/* Brand & Tagline */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#2D2D2D] border-b border-black/5 pb-2">
            1. Identitas Brand
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#2D2D2D]">Nama Brand</label>
              <input
                type="text"
                required
                value={formData.brand_name ?? ''}
                onChange={(e) => handleChange('brand_name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#2D2D2D]">Tagline Utama</label>
              <input
                type="text"
                required
                value={formData.tagline ?? ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#2D2D2D]">Sub-tagline (Headline Penjelasan)</label>
            <input
              type="text"
              value={formData.sub_tagline ?? ''}
              onChange={(e) => handleChange('sub_tagline', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#2D2D2D] border-b border-black/5 pb-2">
            2. Kontak & WhatsApp Integrasi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#2D2D2D] flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nomor WhatsApp Checkout (format 62...)</span>
              </label>
              <input
                type="text"
                required
                placeholder="6282284901234"
                value={formData.whatsapp_number ?? ''}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none font-mono font-bold"
              />
              <p className="text-[10px] text-[#A08C8C]">
                Semua tombol WhatsApp di cart, detail produk, & custom request otomatis mengirim pesan ke nomor ini.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#2D2D2D] flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-[#FF9AA2]" />
                <span>Akun Instagram Brand</span>
              </label>
              <input
                type="text"
                required
                placeholder="@dissof.id"
                value={formData.instagram ?? ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Offline Spot & Schedules */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#2D2D2D] border-b border-black/5 pb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#FF9AA2]" />
            <span>3. Lokasi Toko & Offline Spot (Dumai)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#2D2D2D]">Kota Asal Brand</label>
              <input
                type="text"
                value={formData.location ?? ''}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#2D2D2D]">Nama Spot Offline / Bazaar</label>
              <input
                type="text"
                value={formData.offline_spot ?? ''}
                onChange={(e) => handleChange('offline_spot', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#2D2D2D]">Jadwal Buka Offline Spot</label>
            <input
              type="text"
              value={formData.offline_schedule ?? ''}
              onChange={(e) => handleChange('offline_schedule', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Announcement Banner & Footer */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#2D2D2D] border-b border-black/5 pb-2">
            4. Teks Promosi & Footer
          </h3>

          <div className="space-y-1">
            <label className="font-bold text-[#2D2D2D]">Teks Running Announcement Bar (Paling Atas Website)</label>
            <input
              type="text"
              value={formData.announcement_banner ?? ''}
              onChange={(e) => handleChange('announcement_banner', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#2D2D2D]">Ringkasan Cerita Brand (About)</label>
            <textarea
              rows={3}
              value={formData.about_story ?? ''}
              onChange={(e) => handleChange('about_story', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#2D2D2D]">Teks Hak Cipta / Footer</label>
            <input
              type="text"
              value={formData.footer_text ?? ''}
              onChange={(e) => handleChange('footer_text', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-black/5 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-full bg-[#2D2D2D] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#FF9AA2]" />
            <span>{isSaving ? 'Menyimpan...' : 'SIMPAN SEMUA PENGATURAN'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
