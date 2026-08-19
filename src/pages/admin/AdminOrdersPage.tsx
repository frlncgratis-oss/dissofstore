import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { formatIDR, formatDate, createWhatsAppLink } from '../../lib/utils';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

const ORDERS_STORAGE_KEY = 'orders';

export const AdminOrdersPage: React.FC = () => {
  const { settings } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewProof, setPreviewProof] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      // 1. Check LocalStorage first
      const savedOrdersRaw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrdersRaw) {
        try {
          const parsed = JSON.parse(savedOrdersRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
            return;
          }
        } catch {
          // ignore
        }
      }

      // 2. Fallback to API if LocalStorage is empty
      const data = await api.getOrders().catch(() => []);
      if (data && data.length > 0) {
        setOrders(data);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o));
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update orders in LocalStorage:', e);
      }
      return updated;
    });

    // Optional background sync
    try {
      await api.updateOrderStatus(orderId, status);
    } catch {
      // ignore
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (confirm(`Hapus catatan pesanan #${order.id} dari "${order.customer_name}"?`)) {
      setOrders((prev) => {
        const updated = prev.filter((o) => o.id !== order.id);
        try {
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to delete order from LocalStorage:', e);
        }
        return updated;
      });

      // Optional background sync
      try {
        await api.deleteOrder(order.id);
      } catch {
        // ignore
      }
    }
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#2D2D2D]">
            Daftar Pesanan Masuk (Orders) ♡
          </h1>
          <p className="text-xs text-[#A08C8C] mt-0.5 font-medium">
            Kelola pesanan Transfer Bank / QRIS & WhatsApp yang masuk, periksa bukti transfer, dan perbarui status pesanan.
          </p>
        </div>
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

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'Pending', 'Processing', 'Completed', 'Cancelled'].map((status) => {
            const count = status === 'all' ? orders.length : orders.filter((o) => o.status === status).length;
            const active = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#2D2D2D] text-white'
                    : 'bg-[#F9F7F2] text-[#63534B] hover:bg-[#FFEFF1]'
                }`}
              >
                {status === 'all' ? 'Semua' : status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-black/5 text-gray-400 text-xs">
            Tidak ada catatan pesanan yang sesuai.
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-black/5 shadow-xs space-y-4 hover:border-[#FFD1DC] transition-colors"
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
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none ${
                      ord.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ord.status === 'Processing'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : ord.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <option value="Pending">Pending (Verifikasi)</option>
                    <option value="Processing">Processing (Dibuat/Kemas)</option>
                    <option value="Completed">Completed (Selesai/Terkirim)</option>
                    <option value="Cancelled">Cancelled (Batal)</option>
                  </select>

                  <button
                    onClick={() => handleDeleteOrder(ord)}
                    className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                    title="Hapus order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Order Body Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
                
                {/* Customer Column */}
                <div className="md:col-span-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#A08C8C] tracking-wider block">Customer & Pengiriman</span>
                  <div>
                    <p className="font-bold text-sm text-[#2D2D2D]">{ord.customer_name}</p>
                    <p className="text-xs text-pink-600 font-semibold">{ord.customer_whatsapp}</p>
                  </div>
                  
                  {ord.customer_address && (
                    <div className="p-2.5 bg-[#F9F7F2] rounded-xl text-[#63534B] text-[11px] leading-relaxed">
                      📍 {ord.customer_address}
                    </div>
                  )}

                  <div className="pt-1">
                    <a
                      href={createWhatsAppLink(
                        ord.customer_whatsapp,
                        `Halo kak ${ord.customer_name} ♡ Ini admin ${settings?.brand_name || 'DISSOF.ID'} terkait pesanan #${ord.id}.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#2D2D2D] hover:bg-black text-white font-bold text-[11px] transition-all shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#FF9AA2]" />
                      <span>Chat Customer ({ord.customer_whatsapp})</span>
                    </a>
                  </div>
                </div>

                {/* Items List Column */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#A08C8C] tracking-wider block">Daftar Produk ({ord.items.length})</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between bg-[#F9F7F2] p-2.5 rounded-xl border border-black/5">
                        <div className="flex gap-2">
                          {item.image && (
                            <ImageWithFallback
                              src={item.image}
                              alt={item.product_name}
                              className="w-10 h-10 rounded-lg object-cover border border-black/5 shrink-0 bg-white"
                            />
                          )}
                          <div>
                            <p className="font-bold text-[#2D2D2D]">
                              {item.product_name} <span className="text-[#FF9AA2]">x{item.quantity}</span>
                            </p>
                            {item.variant && (
                              <p className="text-[10px] text-[#A08C8C]">Varian: {item.variant}</p>
                            )}
                            {item.custom_note && (
                              <p className="text-[10px] text-[#FF9AA2] font-semibold">
                                Request: "{item.custom_note}"
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-[#2D2D2D] whitespace-nowrap">
                          {formatIDR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Payment Proof Column */}
                <div className="md:col-span-3 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A08C8C] tracking-wider block">Total Pembayaran</span>
                    <p className="text-xl font-bold text-[#FF9AA2] font-playfair">{formatIDR(ord.total)}</p>
                    
                    {(ord.order_notes || ord.notes) && (
                      <div className="mt-2 p-2.5 bg-[#FFEFF1] rounded-xl text-[11px] text-[#2D2D2D]">
                        <b>Catatan:</b> {ord.order_notes || ord.notes}
                      </div>
                    )}
                  </div>

                  {/* Bukti Transfer Box */}
                  {ord.payment_proof_url ? (
                    <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bukti Transfer Tersedia</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <ImageWithFallback
                          src={ord.payment_proof_url}
                          alt="Bukti Transfer"
                          onClick={() => setPreviewProof(ord.payment_proof_url || null)}
                          className="w-12 h-12 rounded-lg object-cover border border-emerald-300 cursor-pointer hover:opacity-80 transition-opacity bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewProof(ord.payment_proof_url || null)}
                          className="text-[11px] text-emerald-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Periksa Struk →</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-[10px] text-gray-500">
                      Belum ada foto bukti transfer terlampir.
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
          <div className="max-w-xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-2 border-b border-black/5">
              <span className="font-bold text-xs text-[#2D2D2D]">Foto Bukti Pembayaran / Struk Transfer</span>
              <button
                type="button"
                onClick={() => setPreviewProof(null)}
                className="p-1 rounded-full text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center">
              <ImageWithFallback
                src={previewProof}
                alt="Zoom Bukti Transfer"
                className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
