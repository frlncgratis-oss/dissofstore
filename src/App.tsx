import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CustomOrderPage } from './pages/CustomOrderPage';
import { EventsPage } from './pages/EventsPage';
import { AboutPage } from './pages/AboutPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomRequestsPage } from './pages/admin/AdminCustomRequestsPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminChangePasswordPage } from './pages/admin/AdminChangePasswordPage';
import { Product } from './types';

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isCartOpen, setIsCartOpen, settings } = useStore();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [shopCategoryFilter, setShopCategoryFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Admin sub-tab
  const [currentAdminTab, setCurrentAdminTab] = useState<string>('dashboard');

  const handleNavigate = (tab: string, filterCategory?: string) => {
    if (tab === 'shop' && filterCategory) {
      setShopCategoryFilter(filterCategory);
    } else if (tab === 'shop') {
      setShopCategoryFilter('all');
    }

    if (tab !== 'product-detail') {
      setSelectedProduct(null);
    }

    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentTab('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is in Admin mode
  if (currentTab === 'admin') {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-[#F9F7F2]">
          <AdminLoginPage
            onSuccess={() => {
              setCurrentAdminTab('dashboard');
            }}
            onBackToStore={() => handleNavigate('home')}
          />
        </div>
      );
    }

    return (
      <AdminLayout
        currentAdminTab={currentAdminTab}
        setCurrentAdminTab={setCurrentAdminTab}
        onViewStore={() => handleNavigate('home')}
      >
        {currentAdminTab === 'dashboard' && (
          <AdminDashboardPage onNavigateTab={(tab) => setCurrentAdminTab(tab)} />
        )}
        {currentAdminTab === 'products' && <AdminProductsPage />}
        {currentAdminTab === 'orders' && <AdminOrdersPage />}
        {currentAdminTab === 'custom-requests' && <AdminCustomRequestsPage />}
        {currentAdminTab === 'events' && <AdminEventsPage />}
        {currentAdminTab === 'testimonials' && <AdminTestimonialsPage />}
        {currentAdminTab === 'settings' && <AdminSettingsPage />}
        {currentAdminTab === 'change-password' && <AdminChangePasswordPage />}
      </AdminLayout>
    );
  }

  // Customer Facing Store
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#2D2D2D] selection:bg-[#FFEFF1] selection:text-[#2D2D2D]">
      
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentTab === 'shop' && (
          <ShopPage
            initialCategory={shopCategoryFilter}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => handleNavigate('shop')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentTab === 'custom' && <CustomOrderPage />}

        {currentTab === 'events' && <EventsPage />}

        {currentTab === 'about' && <AboutPage onNavigate={handleNavigate} />}

        {currentTab === 'wishlist' && (
          <WishlistPage
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigateToShop={() => handleNavigate('shop')}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainApp />
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
