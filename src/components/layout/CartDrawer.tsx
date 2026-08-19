import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, Sparkles, Heart, ArrowRight, Gift } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatIDR } from '../../lib/utils';
import { ImageWithFallback, FALLBACK_PRODUCT_IMAGE } from '../common/ImageWithFallback';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onNavigateToShop }) => {
  const { cart, removeFromCart, updateCartQty, cartSubtotal, checkoutViaWhatsApp } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const FREE_GIFT_THRESHOLD = 50000;
  const remainingForGift = Math.max(0, FREE_GIFT_THRESHOLD - cartSubtotal);
  const giftProgress = Math.min(100, (cartSubtotal / FREE_GIFT_THRESHOLD) * 100);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Mohon isi nama kamu.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 8) {
      setErrorMsg('Mohon isi nomor WhatsApp yang valid.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await checkoutViaWhatsApp({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: customerAddress.trim(),
        notes: orderNotes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FFFDFB] shadow-2xl flex flex-col border-l border-black/5 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 bg-[#F9F7F2] border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2D2D2D] text-white flex items-center justify-center font-bold text-xs">
                ♡
              </div>
              <div>
                <h3 className="font-playfair font-bold text-base text-[#2D2D2D]">
                  Keranjang Belanja
                </h3>
                <span className="text-[11px] text-[#A08C8C] font-semibold">
                  {cart.length} item dipilih
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-[#2D2D2D] hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Gift Progress Indicator */}
          <div className="bg-[#FFEFF1] px-5 py-3 border-b border-[#FFD1DC] text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[#2D2D2D] flex items-center gap-1.5 text-[11px]">
                <Gift className="w-3.5 h-3.5 text-[#FF9AA2]" />
                {remainingForGift === 0 ? (
                  <span className="text-[#FF9AA2]">Hore! Kamu dapat Free Cute Gift Box & Pouch ♡</span>
                ) : (
                  <span>Belanja <b>{formatIDR(remainingForGift)}</b> lagi untuk Free Gift Pouch!</span>
                )}
              </span>
              <span className="text-[10px] font-bold text-[#FF9AA2]">{Math.round(giftProgress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF9AA2] rounded-full transition-all duration-500"
                style={{ width: `${giftProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <div className="w-16 h-16 rounded-full bg-[#FFEFF1] text-[#FF9AA2] flex items-center justify-center text-2xl shadow-xs">
                  🛍️
                </div>
                <h4 className="font-playfair font-bold text-base text-[#2D2D2D]">
                  Keranjangmu masih kosong
                </h4>
                <p className="text-xs text-[#A08C8C] max-w-xs">
                  Yuk jelajahi koleksi gelang charm, phone strap, dan kalung lucu di toko kami!
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToShop();
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#2D2D2D] hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  Mulai Belanja ♡
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.variant || 'default'}-${item.custom_note || ''}`}
                  className="bg-[#F9F7F2] rounded-2xl p-3.5 border border-black/5 flex gap-3 shadow-2xs"
                >
                  <ImageWithFallback
                    src={item.product.images?.[0]}
                    alt={item.product.name}
                    className="w-18 h-18 rounded-xl object-cover border border-black/5 shrink-0 bg-white"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-xs text-[#2D2D2D] line-clamp-1">
                          {item.product.name}
                        </h4>
                        {item.variant && (
                          <span className="text-[10px] text-[#A08C8C] block">
                            Varian: {item.variant}
                          </span>
                        )}
                        {item.custom_note && (
                          <span className="text-[10px] text-[#FF9AA2] font-semibold block">
                            Request: "{item.custom_note}"
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.variant, item.custom_note)}
                        className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer"
                        title="Hapus dari keranjang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-bold text-xs text-[#FF9AA2]">
                        {formatIDR(item.product.price * item.quantity)}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center bg-white rounded-lg border border-black/10 p-0.5">
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1, item.variant, item.custom_note)}
                          className="w-6 h-6 rounded flex items-center justify-center text-xs text-[#2D2D2D] hover:bg-[#F9F7F2]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[#2D2D2D]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1, item.variant, item.custom_note)}
                          className="w-6 h-6 rounded flex items-center justify-center text-xs text-[#2D2D2D] hover:bg-[#F9F7F2]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer Form */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-black/5 space-y-4">
              
              {/* Subtotal */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A08C8C] uppercase tracking-wider font-semibold">Subtotal</span>
                <span className="font-bold text-base text-[#2D2D2D] font-playfair">
                  {formatIDR(cartSubtotal)}
                </span>
              </div>

              {/* Customer input fields */}
              <form onSubmit={handleCheckout} className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="No. WhatsApp *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Alamat Pengiriman (Dumai / Luar Kota)"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
                />

                <input
                  type="text"
                  placeholder="Catatan tambahan (opsional)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-[#F9F7F2] text-xs focus:outline-none"
                />

                {errorMsg && (
                  <p className="text-[11px] text-rose-600 font-bold bg-rose-50 p-2 rounded-lg">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-full bg-[#2D2D2D] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#FF9AA2]" />
                  <span>{isSubmitting ? 'Memproses Order...' : 'CHECKOUT VIA WHATSAPP ♡'}</span>
                </button>
              </form>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
