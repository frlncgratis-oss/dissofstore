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
  ExternalLink 
} from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { formatIDR, formatDate, createWhatsAppLink } from '../../lib/utils';

export const AdminOrdersPage: React.FC = () => {
  const { settings } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
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
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o))
      );
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status pesanan.');
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (confirm(`Hapus catatan pesanan #${order.id} dari ${order.customer_name}?`)) {
      try {
        await api.deleteOrder(order.id);
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus pesanan.');
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
            Daftar Pesanan Customer
          </h1>
          <p className="text-xs text-[#A08C8C] mt-0.5 font-medium">
            Kelola pesanan WhatsApp yang masuk, perbarui status pengiriman, dan hubungi customer.
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
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
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

      {/* Orders List Cards / Table */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-black/5 text-gray-400 text-xs">
            Tidak ada pesanan yang sesuai filter.
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs space-y-4 hover:border-[#FFD1DC] transition-colors"
            >
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#2D2D2D] bg-[#F9F7F2] px-2.5 py-1 rounded-lg border border-black/5">
                    #{ord.id}
                  </span>
                  <span className="text-xs text-[#A08C8C]">{formatDate(ord.created_at)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                    className={`text-xs font-bold px-3 py-1 rounded-full border cursor-pointer focus:outline-none ${
                      ord.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ord.status === 'Processing'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : ord.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => handleDeleteOrder(ord)}
                    className="text-gray-400 hover:text-rose-600 p-1"
                    title="Hapus order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Order Body Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                
                {/* Customer Column */}
                <div className="md:col-span-4 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#A08C8C] tracking-wider">Customer</span>
                  <p className="font-bold text-sm text-[#2D2D2D]">{ord.customer_name}</p>
                  
                  {ord.customer_address && (
                    <p className="text-[#63534B] text-[11px] leading-relaxed">
                      📍 {ord.customer_address}
                    </p>
                  )}

                  <div className="pt-1">
                    <a
                      href={createWhatsAppLink(
                        ord.customer_whatsapp,
                        `Halo kak ${ord.customer_name} ♡ Ini admin ${settings?.brand_name || 'DISSOF.ID'} terkait pesanan #${ord.id}.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2D2D2D] hover:bg-black text-white font-bold text-[11px] transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#FF9AA2]" />
                      <span>Chat WhatsApp ({ord.customer_whatsapp})</span>
                    </a>
                  </div>
                </div>

                {/* Items List Column */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#A08C8C] tracking-wider">Item Yang Dipesan</span>
                  <div className="space-y-1.5">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between bg-[#F9F7F2] p-2 rounded-xl">
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
                        <span className="font-bold text-[#2D2D2D]">
                          {formatIDR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Notes Column */}
                <div className="md:col-span-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A08C8C] tracking-wider">Total Belanja</span>
                    <p className="text-lg font-bold text-[#FF9AA2] font-playfair">{formatIDR(ord.total)}</p>
                    {ord.notes && (
                      <div className="mt-2 p-2 bg-[#FFEFF1] rounded-xl text-[10px] text-[#2D2D2D]">
                        <b>Catatan:</b> {ord.notes}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
