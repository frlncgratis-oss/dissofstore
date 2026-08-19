import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
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
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

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
  const { settings } = useStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const brandName = settings?.brand_name || 'DISSOF.ID';

  const menuItems = [
    { id: 'dashboard', label: 'Ringkasan / Stats', icon: LayoutDashboard },
    { id: 'products', label: 'Kelola Produk', icon: ShoppingBag },
    { id: 'orders', label: 'Daftar Pesanan', icon: Package },
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
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col md:flex-row text-[#3D312A]">
      
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
        <button
          onClick={onViewStore}
          className="text-xs font-bold text-pink-600 flex items-center gap-1 bg-pink-50 px-2.5 py-1 rounded-full"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Lihat Web</span>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 inset-y-0 left-0 w-64 bg-white border-r border-pink-100/90 flex flex-col justify-between transition-transform duration-300 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } shadow-lg md:shadow-none h-screen`}
      >
        <div className="p-5 space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={onViewStore}>
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white font-bold flex items-center justify-center shadow-xs">
                ♡
              </div>
              <div>
                <h2 className="font-fredoka font-bold text-base text-[#2E241E]">{brandName}</h2>
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                    active
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                      : 'text-[#63534B] hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Info & Logout */}
        <div className="p-4 border-t border-pink-100 space-y-3 bg-[#FAF7F2]/60">
          <button
            onClick={onViewStore}
            className="w-full py-2 px-3 rounded-xl bg-white border border-pink-200 text-xs font-bold text-pink-700 hover:bg-pink-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat Website Customer</span>
          </button>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#2E241E] truncate max-w-[90px]">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-[#7B6E67]">Superadmin</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        {children}
      </main>

    </div>
  );
};
