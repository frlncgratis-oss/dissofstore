import React, { useState } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Layers,
  Wand2, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  MessageCircle,
  ExternalLink,
  CreditCard,
  Eye,
  Palette
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatIDR, formatDate, createWhatsAppLink } from '../../lib/utils';
import { Order } from '../../types';

interface AdminDashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateTab }) => {
  const { settings, products, categories, orders, updateOrderStatusLocal } = useStore();

  const totalProductsCount = products.length;
  const totalCategoriesCount = categories.length;
  const lowStockCount = products.filter((p) => (p.stock ?? 0) <= 3).length;

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const processingOrders = orders.filter((o) => o.status === 'Processing').length;
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/5 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-pink-500">Editorial Dashboard</span>
          <h1 className="font-playfair text-3xl font-bold text-[#2D2D2D]">
            Ringkasan Toko {settings?.brand_name || 'DISSOF.ID'} ♡
          </h1>
          <p className="text-xs text-[#A08C8C] mt-0.5 font-medium">
            Pantau omset penjualan, pesanan masuk, kategori etalase, dan stok aksesoris handmade.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('branding')}
            className="px-4 py-2.5 rounded-full bg-pink-50 border border-pink-200 hover:bg-pink-100 text-pink-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-pink-500" />
            <span>Branding & Tampilan</span>
          </button>

          <button
            onClick={() => onNavigateTab('categories')}
            className="px-4 py-2.5 rounded-full bg-white border border-pink-200 hover:bg-pink-50 text-pink-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-pink-500" />
            <span>Kelola Kategori</span>
          </button>

          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2.5 rounded-full bg-[#2D2D2D] hover:bg-black text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-pink-300" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]">
            <span className="text-xs font-semibold text-[#A08C8C] uppercase tracking-wider">Omset Penjualan</span>
            <div className="w-8 h-8 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2D2D2D] font-playfair">
            {formatIDR(totalRevenue)}
          </p>
          <span className="text-[10px] text-pink-600 font-semibold bg-pink-50 px-2.5 py-0.5 rounded-full inline-block">
            {orders.length} total transaksi
          </span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]">
            <span className="text-xs font-semibold text-[#A08C8C] uppercase tracking-wider">Pesanan Pending</span>
            <div className="w-8 h-8 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2D2D2D] font-playfair">
            {pendingOrders}
          </p>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-[10px] text-pink-600 font-bold hover:underline block cursor-pointer"
          >
            {pendingOrders > 0 ? 'Periksa & konfirmasi pesanan →' : 'Tidak ada pesanan pending'}
          </button>
        </div>

        {/* Total Categories */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]">
            <span className="text-xs font-semibold text-[#A08C8C] uppercase tracking-wider">Total Kategori</span>
            <div className="w-8 h-8 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2D2D2D] font-playfair">
            {totalCategoriesCount}
          </p>
          <button
            onClick={() => onNavigateTab('categories')}
            className="text-[10px] text-pink-600 font-bold hover:underline block cursor-pointer"
          >
            Atur etalase kategori →
          </button>
        </div>

        {/* Total Products & Low stock */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#2D2D2D]">
            <span className="text-xs font-semibold text-[#A08C8C] uppercase tracking-wider">Total Produk</span>
            <div className="w-8 h-8 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
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
      <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 pb-3">
          <div>
            <h3 className="font-playfair text-lg font-bold text-[#2D2D2D]">Pesanan Terbaru</h3>
            <p className="text-xs text-[#A08C8C]">Daftar pesanan customer yang masuk secara real-time</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Kelola Semua Pesanan ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            Belum ada pesanan yang masuk di LocalStorage.
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
                  <th className="pb-3 px-3">Metode</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F9F7F2] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#2D2D2D]">#{ord.id}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-[#2D2D2D]">{ord.customer_name}</p>
                      <span className="text-[10px] text-gray-400">{ord.customer_whatsapp}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-[#574941] line-clamp-1">
                        {ord.items.map((it) => `${it.product_name} (${it.quantity}x)`).join(', ')}
                      </p>
                    </td>
                    <td className="py-3 px-3 font-bold text-pink-600">
                      {formatIDR(ord.total)}
                    </td>
                    <td className="py-3 px-3">
                      {ord.payment_method === 'bank_transfer' ? (
                        <span className="text-[10px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full font-bold">
                          Transfer Bank/QRIS
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                          WhatsApp
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatusLocal(ord.id, e.target.value as any)}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
