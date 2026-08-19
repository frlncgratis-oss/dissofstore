import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Wand2, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { formatIDR, formatDate, createWhatsAppLink } from '../../lib/utils';
import { Order, CustomRequest } from '../../types';

interface AdminDashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateTab }) => {
  const { settings, products } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentCustoms, setRecentCustoms] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const totalProductsCount = products.length;
  const lowStockCount = products.filter((p) => (p.stock ?? 0) <= 3).length;

  const fetchDashboardData = async () => {
    try {
      let customsList: CustomRequest[] = [];
      const savedCustomsRaw = localStorage.getItem('customRequests');
      if (savedCustomsRaw) {
        try {
          const parsed = JSON.parse(savedCustomsRaw);
          if (Array.isArray(parsed)) {
            customsList = parsed;
          }
        } catch {
          // ignore
        }
      }

      const [s, o, c] = await Promise.all([
        api.getStats().catch(() => null),
        api.getOrders().catch(() => []),
        customsList.length > 0 ? Promise.resolve(customsList) : api.getCustomRequests().catch(() => []),
      ]);

      const finalCustoms = customsList.length > 0 ? customsList : c;
      setStats({
        ...s,
        totalCustomRequests: finalCustoms.length,
        newCustomRequests: finalCustoms.filter((item: CustomRequest) => item.status === 'New').length,
      });
      setRecentOrders(o.slice(0, 5));
      setRecentCustoms(finalCustoms.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await api.updateOrderStatus(orderId, status);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status pesanan.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/5 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF9AA2]">Editorial Dashboard</span>
          <h1 className="font-playfair text-3xl font-bold text-[#2D2D2D]">
            Ringkasan Toko DISSOF.ID ♡
          </h1>
          <p className="text-xs text-[#A08C8C] mt-0.5 font-medium">
            Pantau performa penjualan, pesanan masuk, custom requests, dan stok produk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('products')}
            className="px-5 py-2.5 rounded-full bg-[#2D2D2D] hover:bg-black text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF9AA2]" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]">
            <span className="text-xs font-semibold text-[#A08C8C] uppercase tracking-wider">Omset Terkumpul</span>
            <div className="w-8 h-8 rounded-full bg-[#FFEFF1] flex items-center justify-center text-[#FF9AA2]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2D2D2D] font-playfair">
            {formatIDR(stats?.totalRevenue || 0)}
          </p>
          <span className="text-[10px] text-[#FF9AA2] font-semibold bg-[#FFEFF1] px-2.5 py-0.5 rounded-full inline-block">
            Pesanan selesai & diproses
          </span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]">
            <span className="text-xs font-semibold text-[#A08C8C] uppercase tracking-wider">Pesanan Pending</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2D2D2D] font-playfair">
            {stats?.pendingOrders || 0}
          </p>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-[10px] text-[#FF9AA2] font-bold hover:underline block"
          >
            Lihat semua pesanan →
          </button>
        </div>

        {/* Custom Requests */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]">
            <span className="text-xs font-semibold text-[#A08C8C] uppercase tracking-wider">Custom Requests</span>
            <div className="w-8 h-8 rounded-full bg-[#FFEFF1] flex items-center justify-center text-[#FF9AA2]">
              <Wand2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2D2D2D] font-playfair">
            {stats?.totalCustomRequests || 0}
          </p>
          <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full inline-block">
            {stats?.newCustomRequests || 0} request baru
          </span>
        </div>

        {/* Total Products & Low stock */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]">
            <span className="text-xs font-semibold text-[#A08C8C] uppercase tracking-wider">Total Produk</span>
            <div className="w-8 h-8 rounded-full bg-[#FFEFF1] flex items-center justify-center text-[#FF9AA2]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2D2D2D] font-playfair">
            {totalProductsCount}
          </p>
          {lowStockCount > 0 ? (
            <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
              <AlertTriangle className="w-3 h-3" />
              {lowStockCount} stok menipis
            </span>
          ) : (
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
              Semua stok aman
            </span>
          )}
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 pb-3">
          <div>
            <h3 className="font-playfair text-lg font-bold text-[#2D2D2D]">Pesanan Terbaru</h3>
            <p className="text-xs text-[#A08C8C]">Daftar checkout WhatsApp dari customer</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-[#FF9AA2] hover:text-[#e07f87] flex items-center gap-1"
          >
            <span>Kelola Semua Pesanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            Belum ada pesanan yang masuk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 text-[#A08C8C] uppercase tracking-wider font-bold">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">Customer</th>
                  <th className="pb-3 px-3">Produk</th>
                  <th className="pb-3 px-3">Total</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F9F7F2] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#2D2D2D]">{ord.id}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-[#2D2D2D]">{ord.customer_name}</p>
                      <a
                        href={`https://wa.me/${ord.customer_whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>{ord.customer_whatsapp}</span>
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-[#574941] line-clamp-1">
                        {ord.items.map((it) => `${it.product_name} (${it.quantity}x)`).join(', ')}
                      </p>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#FF9AA2]">
                      {formatIDR(ord.total)}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
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
                    </td>
                    <td className="py-3 px-3">
                      <a
                        href={createWhatsAppLink(
                          ord.customer_whatsapp,
                          `Halo kak ${ord.customer_name} ♡ Ini admin ${settings?.brand_name || 'DISSOF.ID'} terkait pesanan #${ord.id}.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-full bg-[#2D2D2D] hover:bg-black text-white font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 text-[#FF9AA2]" />
                        <span>Chat WA</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Access to Custom Requests */}
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 pb-3">
          <div>
            <h3 className="font-playfair text-lg font-bold text-[#2D2D2D]">Permintaan Custom Terbaru</h3>
            <p className="text-xs text-[#A08C8C]">Inisial, nuansa warna, dan request charm dari customer</p>
          </div>
          <button
            onClick={() => onNavigateTab('custom-requests')}
            className="text-xs font-bold text-[#FF9AA2] hover:text-[#e07f87] flex items-center gap-1"
          >
            <span>Lihat Semua Custom</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentCustoms.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            Belum ada custom request masuk.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCustoms.map((req) => (
              <div key={req.id} className="bg-[#F9F7F2] p-5 rounded-2xl border border-black/5 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#2D2D2D]">{req.customer_name}</h4>
                    <p className="text-[10px] text-[#FF9AA2] font-semibold">{req.accessory_type}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    req.status === 'New' ? 'bg-[#FFEFF1] text-[#FF9AA2]' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
                {req.custom_initials && (
                  <p className="text-[11px] text-[#2D2D2D]">
                    Inisial: <b>"{req.custom_initials}"</b>
                  </p>
                )}
                <p className="text-[10px] text-[#A08C8C] line-clamp-1">
                  Warna: {req.color_theme} | Charms: {req.charms_selected?.join(', ')}
                </p>
                <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                  <span className="text-[10px] text-[#A08C8C]">{formatDate(req.created_at)}</span>
                  <a
                    href={createWhatsAppLink(
                      req.customer_whatsapp,
                      `Halo kak ${req.customer_name} ♡ Ini dari ${settings?.brand_name || 'DISSOF.ID'} terkait request custom ${req.accessory_type} kamu!`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Follow-up WA</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
