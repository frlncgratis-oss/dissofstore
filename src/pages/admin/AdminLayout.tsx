import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Layers,
  Wand2, 
  Calendar, 
  MessageSquareQuote, 
  Settings, 
  CreditCard,
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck,
  KeyRound,
  Bell,
  Sparkles,
  ArrowRight,
  Palette
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { formatIDR, playNotificationChime } from '../../lib/utils';

interface AdminLayoutProps {
  currentAdminTab: string;
  setCurrentAdminTab: (tab: string) => void;
  onViewStore: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentAdminTab,
  setCurrentAdminTab,
  onViewStore,
  children,
}) => {
  const { user, logout } = useAuth();
  const { settings, pendingOrdersCount, orders } = useStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [newOrderNotification, setNewOrderNotification] = useState<Order | null>(null);

  const brandName = settings?.brand_name || 'DISSOF.ID';

  // Listen to incoming order events & cross-tab storage changes
  useEffect(() => {
    const handleNewOrder = (e: any) => {
      const order = e.detail as Order;
      if (order) {
        setNewOrderNotification(order);
        playNotificationChime();
      }
    };

    window.addEventListener('dissof_new_order', handleNewOrder);
    return () => {
      window.removeEventListener('dissof_new_order', handleNewOrder);
    };
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Ringkasan / Stats', icon: LayoutDashboard },
    { id: 'branding', label: 'Pengaturan Toko / Branding', icon: Palette },
    { id: 'categories', label: 'Kelola Kategori', icon: Layers },
    { id: 'products', label: 'Kelola Produk', icon: ShoppingBag },
    { 
      id: 'orders', 
      label: 'Daftar Pesanan', 
      icon: Package, 
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined 
    },
    { id: 'payment-settings', label: 'Pengaturan Pembayaran', icon: CreditCard },
    { id: 'custom-requests', label: 'Custom Requests', icon: Wand2 },
    { id: 'events', label: 'Event & Pop-Up', icon: Calendar },
    { id: 'testimonials', label: 'Testimoni Customer', icon: MessageSquareQuote },
    { id: 'settings', label: 'Pengaturan Website', icon: Settings },
    { id: 'change-password', label: 'Ganti Password', icon: KeyRound },
  ];

  const handleSelectTab = (id: string) => {
    setCurrentAdminTab(id);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col md:flex-row text-[#3D312A] relative">
      
      {/* Floating New Order Banner Notification */}
      {newOrderNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-[calc(100%-2rem)] bg-gradient-to-r from-[#2D2D2D] to-[#1E1B18] text-white p-4 rounded-3xl shadow-2xl border-2 border-pink-400 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-md animate-bounce">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">Pesanan Baru Masuk! ♡</span>
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                </div>
                <h4 className="font-bold text-sm text-white">
                  {newOrderNotification.customer_name} ({formatIDR(newOrderNotification.total)})
                </h4>
                <p className="text-[11px] text-gray-300 line-clamp-1">
                  ID: #{newOrderNotification.id} • {newOrderNotification.items.length} item aksesoris
                </p>
              </div>
            </div>

            <button
              onClick={() => setNewOrderNotification(null)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[10px] text-gray-400">Tersimpan di LocalStorage</span>
            <button
              onClick={() => {
                setNewOrderNotification(null);
                handleSelectTab('orders');
              }}
              className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
            >
              <span>Buka Daftar Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Top bar */}
      <div className="md:hidden bg-white border-b border-pink-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-xl text-[#6B5E57] hover:bg-pink-50"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm text-pink-600">Admin {brandName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {pendingOrdersCount > 0 && (
            <button
              onClick={() => handleSelectTab('orders')}
              className="bg-pink-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs animate-pulse"
            >
              <Package className="w-3 h-3" />
              <span>{pendingOrdersCount} Baru</span>
            </button>
          )}
          <button
            onClick={onViewStore}
            className="text-xs font-bold text-pink-600 flex items-center gap-1 bg-pink-50 px-2.5 py-1 rounded-full"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat Web</span>
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 inset-y-0 left-0 w-64 bg-white border-r border-pink-100/90 flex flex-col justify-between transition-transform duration-300 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } shadow-lg md:shadow-none h-screen`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={onViewStore}>
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white font-bold flex items-center justify-center shadow-xs">
                ♡
              </div>
              <div>
                <h2 className="font-playfair font-bold text-base text-[#2E241E]">{brandName}</h2>
                <p className="text-[10px] text-pink-500 font-semibold uppercase tracking-wider">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="md:hidden text-gray-400 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = currentAdminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                    active
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                      : 'text-[#63534B] hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs ${
                        active
                          ? 'bg-white text-pink-600'
                          : 'bg-pink-500 text-white animate-pulse'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Info & Logout */}
        <div className="p-4 border-t border-pink-100 space-y-3 bg-[#FAF7F2]/60 shrink-0">
          <button
            onClick={onViewStore}
            className="w-full py-2 px-3 rounded-xl bg-white border border-pink-200 text-xs font-bold text-pink-700 hover:bg-pink-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat Website Customer</span>
          </button>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-pink-200 flex items-center justify-center text-[10px] font-bold text-pink-800">
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="text-[11px] leading-tight">
                <p className="font-bold text-[#2E241E] truncate max-w-[90px]">{user?.name || 'Admin DISSOF'}</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Cloud Firestore</p>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

    </div>
  );
};
