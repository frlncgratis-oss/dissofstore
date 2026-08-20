import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  MessageCircle, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ArrowUpDown,
  ExternalLink,
  CreditCard,
  Image as ImageIcon,
  X,
  Eye,
  Building2,
  Calendar,
  AlertCircle,
  Volume2,
  Sparkles,
  Send
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { formatIDR, formatDate, createWhatsAppLink, playNotificationChime } from '../../lib/utils';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

export const AdminOrdersPage: React.FC = () => {
  const { settings, orders, updateOrderStatusLocal, deleteOrderLocal } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewProof, setPreviewProof] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ id: string; msg: string } | null>(null);

  const brandName = settings?.brand_name || 'DISSOF.ID';

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatusLocal(orderId, status);
      setStatusFeedback({ id: orderId, msg: `Status diubah ke ${status}` });
      setTimeout(() => setStatusFeedback(null), 2500);
    } catch (e) {
      console.warn('Status update error:', e);
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (confirm(`Hapus catatan pesanan #${order.id} dari "${order.customer_name}"? Data akan terhapus dari LocalStorage.`)) {
      try {
        await deleteOrderLocal(order.id);
      } catch (e) {
        console.warn('Delete order error:', e);
      }
    }
  };

  const handleTestChime = () => {
    playNotificationChime();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = o.id.toLowerCase().includes(q);
        const matchName = o.customer_name.toLowerCase().includes(q);
        const matchPhone = o.customer_whatsapp.includes(q);
        const matchItems = o.items.some((it) => it.product_name.toLowerCase().includes(q));
        return matchId || matchName || matchPhone || matchItems;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const completedCount = orders.filter((o) => o.status === 'Completed').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#2D2D2D]">
              Daftar Pesanan Masuk ♡
            </h1>
            {pendingCount > 0 && (
              <span className="bg-pink-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                {pendingCount} Pesanan Baru
              </span>
            )}
          </div>
          <p className="text-xs text-[#A08C8C] mt-0.5 font-medium">
            Kelola pesanan Transfer Bank / QRIS & WhatsApp yang masuk. Data tersimpan 100% di LocalStorage.
          </p>
        </div>

        {/* Audio Chime Test Button */}
        <button
          type="button"
          onClick={handleTestChime}
          className="px-3.5 py-2 rounded-2xl bg-white border border-pink-200 hover:bg-pink-50 text-pink-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
          title="Tes Suara Notifikasi Pesanan Masuk"
        >
          <Volume2 className="w-3.5 h-3.5 text-pink-500" />
          <span>Tes Suara Notifikasi (Chime)</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A08C8C]" />
          <input
            type="text"
            placeholder="Cari ID order, nama, produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F9F7F2] border border-black/5 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-[#FF9AA2]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua', count: orders.length },
            { id: 'Pending', label: 'Pending', count: pendingCount },
            { id: 'Processing', label: 'Processing', count: processingCount },
            { id: 'Completed', label: 'Completed', count: completedCount },
            { id: 'Cancelled', label: 'Cancelled', count: orders.filter((o) => o.status === 'Cancelled').length },
          ].map((item) => {
            const active = statusFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setStatusFilter(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#2D2D2D] text-white shadow-xs'
                    : 'bg-[#F9F7F2] text-[#63534B] hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                <span>{item.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-black/5 text-gray-600'}`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-black/5 text-gray-400 text-xs space-y-2">
            <Package className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="font-semibold text-gray-600">Tidak ada catatan pesanan yang sesuai.</p>
            <p className="text-[11px]">Pesanan yang dibuat customer di keranjang akan otomatis tampil di sini secara real-time.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 shadow-xs space-y-4 ${
                ord.status === 'Pending' ? 'border-pink-300 ring-2 ring-pink-100/70' : 'border-black/5 hover:border-pink-200'
              }`}
            >
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#2D2D2D] bg-[#F9F7F2] px-2.5 py-1 rounded-lg border border-black/5">
                    #{ord.id}
                  </span>
                  <span className="text-xs text-[#A08C8C]">{formatDate(ord.created_at)}</span>

                  {/* Payment Method Badge */}
                  {ord.payment_method === 'bank_transfer' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 font-bold text-[10px] border border-pink-200">
                      <CreditCard className="w-3 h-3" />
                      <span>Transfer Bank / QRIS</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp Order</span>
                    </span>
                  )}

                  {statusFeedback?.id === ord.id && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full animate-bounce">
                      ✓ {statusFeedback.msg}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[11px] font-bold text-gray-500 hidden sm:inline">Status:</label>
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-full border cursor-pointer focus:outline-none transition-colors shadow-2xs ${
                      ord.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : ord.status === 'Processing'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : ord.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}
                  >
                    <option value="Pending">Pending (Verifikasi Bukti)</option>
                    <option value="Processing">Processing (Sedang Dibuat)</option>
                    <option value="Completed">Completed (Selesai/Terkirim)</option>
                    <option value="Cancelled">Cancelled (Dibatalkan)</option>
                  </select>

                  <button
                    onClick={() => handleDeleteOrder(ord)}
                    className="text-gray-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    title="Hapus order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Order Body Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
                
                {/* Customer Column */}
                <div className="md:col-span-4 space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-[#A08C8C] tracking-wider block">Customer & Kontak</span>
                  <div>
                    <p className="font-bold text-sm text-[#2D2D2D]">{ord.customer_name}</p>
                    <p className="text-xs text-pink-600 font-semibold">{ord.customer_whatsapp}</p>
                  </div>
                  
                  {ord.customer_address && (
                    <div className="p-2.5 bg-[#F9F7F2] rounded-xl text-[#63534B] text-[11px] leading-relaxed">
                      📍 {ord.customer_address}
                    </div>
                  )}

                  {/* WhatsApp Quick Chat */}
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    <a
                      href={createWhatsAppLink(
                        ord.customer_whatsapp,
                        `Halo kak ${ord.customer_name} ♡\nIni admin ${brandName} terkait pesanan #${ord.id}.\nStatus pesanan: *${ord.status}*.\nTotal: *${formatIDR(ord.total)}*.\nTerima kasih sudah order aksesoris di DISSOF.ID ♡`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#2D2D2D] hover:bg-black text-white font-bold text-[11px] transition-all shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-pink-400" />
                      <span>Chat WA Customer</span>
                    </a>
                  </div>
                </div>

                {/* Items List Column */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#A08C8C] tracking-wider block">Daftar Produk ({ord.items.length})</span>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between bg-[#F9F7F2] p-2.5 rounded-xl border border-black/5">
                        <div className="flex gap-2.5">
                          {item.image && (
                            <ImageWithFallback
                              src={item.image}
                              alt={item.product_name}
                              className="w-11 h-11 rounded-lg object-cover border border-black/5 shrink-0 bg-white"
                            />
                          )}
                          <div>
                            <p className="font-bold text-[#2D2D2D]">
                              {item.product_name} <span className="text-pink-600 font-extrabold">x{item.quantity}</span>
                            </p>
                            {item.variant && (
                              <p className="text-[10px] text-gray-500">Varian: {item.variant}</p>
                            )}
                            {item.custom_note && (
                              <p className="text-[10px] text-pink-600 font-semibold">
                                Request: "{item.custom_note}"
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-[#2D2D2D] whitespace-nowrap text-xs">
                          {formatIDR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Payment Proof Column */}
                <div className="md:col-span-3 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A08C8C] tracking-wider block">Total Belanja</span>
                    <p className="text-xl font-bold text-pink-600 font-playfair">{formatIDR(ord.total)}</p>
                    
                    {(ord.order_notes || ord.notes) && (
                      <div className="mt-2 p-2.5 bg-pink-50/70 border border-pink-100 rounded-xl text-[11px] text-[#2D2D2D]">
                        <b>Catatan Customer:</b> {ord.order_notes || ord.notes}
                      </div>
                    )}
                  </div>

                  {/* Bukti Transfer Box */}
                  {ord.payment_proof_url ? (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bukti Transfer Terlampir</span>
                      </span>
                      <div className="flex items-center gap-2.5">
                        <ImageWithFallback
                          src={ord.payment_proof_url}
                          alt="Bukti Transfer"
                          onClick={() => setPreviewProof(ord.payment_proof_url || null)}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-300 cursor-pointer hover:opacity-80 transition-opacity bg-white shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewProof(ord.payment_proof_url || null)}
                          className="text-[11px] text-emerald-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Periksa Struk →</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-black/5 text-[10px] text-gray-500">
                      Tidak ada foto bukti transfer (Order via WA).
                    </div>
                  )}

                </div>

              </div>

            </div>
          ))
        )}
      </div>

      {/* Proof of Payment Zoom Modal */}
      {previewProof && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewProof(null)}
        >
          <div className="max-w-xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="font-bold text-xs text-[#2D2D2D]">Foto Bukti Pembayaran / Struk Transfer Customer</span>
              <button
                type="button"
                onClick={() => setPreviewProof(null)}
                className="p-1 rounded-full text-gray-400 hover:text-black cursor-pointer hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-[#F9F7F2] rounded-2xl p-2 max-h-[75vh] overflow-auto">
              <ImageWithFallback
                src={previewProof}
                alt="Zoom Bukti Transfer"
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
