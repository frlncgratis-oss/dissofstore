import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, CartItem, SiteSettings, EventItem, Testimonial, PaymentSettings, Order } from '../types';
import { api } from '../lib/api';
import { 
  formatIDR, 
  createWhatsAppLink, 
  getStoredWhatsAppNumber, 
  setStoredWhatsAppNumber, 
  playNotificationChime,
  getStoredLogo,
  setStoredLogo,
  removeStoredLogo,
  getStoredHeroBanner,
  setStoredHeroBanner,
  removeStoredHeroBanner,
  getStoredBackground,
  setStoredBackground,
  resetStoredBackground,
  StoreBackgroundData,
  STORE_LOGO_KEY,
  STORE_HERO_BANNER_KEY,
  STORE_BACKGROUND_KEY
} from '../lib/utils';
import confetti from 'canvas-confetti';

const PRODUCTS_STORAGE_KEY = 'products';
const CATEGORIES_STORAGE_KEY = 'categories';
const PAYMENT_SETTINGS_KEY = 'paymentSettings';
const ORDERS_STORAGE_KEY = 'orders';
const SETTINGS_STORAGE_KEY = 'site_settings';
const WHATSAPP_STORAGE_KEY = 'whatsapp_number';

export const DEFAULT_CATEGORIES: Category[] = [
  { 
    id: 'bracelets', 
    name: 'Charm Bracelets', 
    slug: 'bracelets', 
    description: 'Gelang manik-manik handmade dengan charm lucu & liontin custom',
    icon: '✨',
    image: 'https://images.unsplash.com/photo-1611591475152-4735d38d0145?w=600&auto=format&fit=crop&q=80'
  },
  { 
    id: 'phone-charms', 
    name: 'Phone Charms', 
    slug: 'phone-charms', 
    description: 'Gantungan HP estetik dengan manik pastel & mutiara sintetis',
    icon: '📱',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80'
  },
  { 
    id: 'necklaces', 
    name: 'Beaded Necklaces', 
    slug: 'necklaces', 
    description: 'Kalung manik-manik manis dengan sentuhan daisy & butterfly charm',
    icon: '🌸',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80'
  },
  { 
    id: 'rings', 
    name: 'Beaded Rings', 
    slug: 'rings', 
    description: 'Cincin manik-manik pastel elastis yang nyaman dipakai',
    icon: '💍',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80'
  },
  { 
    id: 'keychains', 
    name: 'Keychains & Bag Charms', 
    slug: 'keychains', 
    description: 'Gantungan kunci & tas lucu perpaduan ribbon dan charm gemas',
    icon: '🎀',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80'
  },
  { 
    id: 'gift-sets', 
    name: 'Gift Sets & Bundles', 
    slug: 'gift-sets', 
    description: 'Paket kado spesial dengan greeting card & premium packaging',
    icon: '🎁',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80'
  },
];

const getDefaultSampleOrders = (): Order[] => {
  const now = new Date();
  const today1 = new Date(now.getTime() - 1000 * 60 * 35); // 35 minutes ago
  const today2 = new Date(now.getTime() - 1000 * 60 * 150); // 2.5 hours ago
  const yesterday1 = new Date(now.getTime() - 1000 * 60 * 60 * 25);
  const yesterday2 = new Date(now.getTime() - 1000 * 60 * 60 * 29);
  const day3 = new Date(now.getTime() - 1000 * 60 * 60 * 68);
  const day5 = new Date(now.getTime() - 1000 * 60 * 60 * 120);
  const day9 = new Date(now.getTime() - 1000 * 60 * 60 * 216);

  return [
    {
      id: 'ORD-89211',
      customer_name: 'Nabila Putri Zahra',
      customer_whatsapp: '081234567890',
      customer_address: 'Jl. Jend. Sudirman No. 45, Dumai Kota',
      items: [
        { product_id: '1', product_name: 'Strawberry Dream Charm Bracelet', price: 35000, quantity: 2, variant: 'Pastel Pink' },
        { product_id: '2', product_name: 'Custom Initial Daisy Beads Ring', price: 15000, quantity: 1, variant: 'Letter N' }
      ],
      subtotal: 85000,
      total: 85000,
      payment_method: 'bank_transfer',
      status: 'Processing',
      source: 'online',
      created_at: today1.toISOString(),
      updated_at: today1.toISOString()
    },
    {
      id: 'ORD-89210',
      customer_name: 'Aulia Rahmawati',
      customer_whatsapp: '085278912345',
      customer_address: 'Dumai Timur (Ambil di Booth Pop-Up)',
      items: [
        { product_id: '3', product_name: 'Ocean Breeze Pearl Phone Strap', price: 45000, quantity: 1 }
      ],
      subtotal: 45000,
      total: 45000,
      payment_method: 'qris',
      status: 'Completed',
      source: 'online',
      created_at: today2.toISOString(),
      updated_at: today2.toISOString()
    },
    {
      id: 'ORD-89209',
      customer_name: 'Clarissa Maharani',
      customer_whatsapp: '082198765432',
      customer_address: 'Bagan Besar, Dumai',
      items: [
        { product_id: '4', product_name: 'Fairy Ribbon Pastel Necklace', price: 55000, quantity: 1 }
      ],
      subtotal: 55000,
      total: 55000,
      payment_method: 'whatsapp',
      status: 'Completed',
      source: 'whatsapp',
      created_at: yesterday1.toISOString(),
      updated_at: yesterday1.toISOString()
    },
    {
      id: 'ORD-89208',
      customer_name: 'Dinda Lestari',
      customer_whatsapp: '081365432198',
      customer_address: 'Dumai Kota',
      items: [
        { product_id: '1', product_name: 'Strawberry Dream Charm Bracelet', price: 35000, quantity: 1 },
        { product_id: '5', product_name: 'Cherry Blossom Bag Charm', price: 38000, quantity: 1 }
      ],
      subtotal: 73000,
      total: 73000,
      payment_method: 'bank_transfer',
      status: 'Completed',
      source: 'online',
      created_at: yesterday2.toISOString(),
      updated_at: yesterday2.toISOString()
    },
    {
      id: 'ORD-89207',
      customer_name: 'Siti Nurhaliza',
      customer_whatsapp: '082233445566',
      customer_address: 'Bukit Kapur, Dumai',
      items: [
        { product_id: '2', product_name: 'Custom Initial Daisy Beads Ring', price: 15000, quantity: 3 }
      ],
      subtotal: 45000,
      total: 45000,
      payment_method: 'qris',
      status: 'Completed',
      source: 'online',
      created_at: day3.toISOString(),
      updated_at: day3.toISOString()
    },
    {
      id: 'ORD-89206',
      customer_name: 'Tiara Amanda Putri',
      customer_whatsapp: '087711223344',
      customer_address: 'Dumai Barat',
      items: [
        { product_id: '6', product_name: 'Sweet Heart DIY Gift Box Set', price: 95000, quantity: 1 }
      ],
      subtotal: 95000,
      total: 95000,
      payment_method: 'bank_transfer',
      status: 'Completed',
      source: 'online',
      created_at: day5.toISOString(),
      updated_at: day5.toISOString()
    },
    {
      id: 'ORD-89205',
      customer_name: 'Rania Bella Safitri',
      customer_whatsapp: '085344556677',
      customer_address: 'Sukajadi, Dumai',
      items: [
        { product_id: '3', product_name: 'Ocean Breeze Pearl Phone Strap', price: 45000, quantity: 2 }
      ],
      subtotal: 90000,
      total: 90000,
      payment_method: 'bank_transfer',
      status: 'Completed',
      source: 'online',
      created_at: day9.toISOString(),
      updated_at: day9.toISOString()
    }
  ];
};

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  bank_name: 'BCA (Bank Central Asia)',
  account_number: '8280-9912-3456',
  account_holder: 'DISSOF ACCESSORIES DUMAI',
  qris_label: 'QRIS DISSOF.ID (BCA, Mandiri, BRI, BNI, GoPay, DANA, OVO, ShopeePay)',
  qris_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  instructions: '1. Transfer sesuai nominal total belanja ke Rekening / scan QRIS di atas.\n2. Simpan struk / screenshot bukti transfer.\n3. Unggah foto bukti transfer di bawah ini lalu klik tombol "Konfirmasi & Selesaikan Pesanan".',
  is_enabled: true,
  notes: 'Pesanan kamu akan langsung terverifikasi dan diproses oleh pengrajin DISSOF Dumai ♡'
};

const DEFAULT_SETTINGS: SiteSettings = {
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
};

interface StoreContextType {
  settings: SiteSettings | null;
  categories: Category[];
  products: Product[];
  orders: Order[];
  events: EventItem[];
  testimonials: Testimonial[];
  paymentSettings: PaymentSettings;
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  isLoading: boolean;
  storeLogo: string | null;
  storeHeroBanner: string | null;
  storeBackground: StoreBackgroundData;
  saveStoreLogo: (logoData: string) => Promise<void>;
  removeStoreLogo: () => Promise<void>;
  saveHeroBanner: (bannerData: string) => Promise<void>;
  removeHeroBanner: () => Promise<void>;
  saveStoreBackground: (bg: StoreBackgroundData) => Promise<void>;
  resetStoreBackground: () => Promise<void>;
  setIsCartOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedVariant?: string, customNote?: string) => void;
  removeFromCart: (productId: string, selectedVariant?: string, customNote?: string) => void;
  updateCartQty: (productId: string, quantity: number, selectedVariant?: string, customNote?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  refreshData: () => Promise<void>;
  saveProductLocal: (productData: Partial<Product>, editingId?: string) => Promise<Product>;
  deleteProductLocal: (productId: string) => Promise<void>;
  saveCategoryLocal: (categoryName: string, categoryData?: Partial<Category>) => Promise<Category>;
  saveFullCategoryLocal: (category: Category) => Promise<Category>;
  deleteCategoryLocal: (categoryId: string) => Promise<void>;
  resetCategoriesToDefault: () => void;
  savePaymentSettings: (newSettings: PaymentSettings) => void;
  saveSettingsLocal: (newSettings: Partial<SiteSettings>) => Promise<SiteSettings>;
  updateWhatsAppNumberLocal: (newNumber: string) => void;
  createOrderLocal: (orderData: {
    customer_name: string;
    customer_whatsapp: string;
    customer_address?: string;
    order_notes?: string;
    payment_method: 'bank_transfer' | 'qris' | 'whatsapp';
    payment_proof_url?: string;
  }) => Promise<Order>;
  updateOrderStatusLocal: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrderLocal: (orderId: string) => Promise<void>;
  cartSubtotal: number;
  cartCount: number;
  pendingOrdersCount: number;
  checkoutViaWhatsApp: (customer: { name: string; phone: string; address?: string; notes?: string }) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings initialized from LocalStorage 'site_settings' & 'whatsapp_number'
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const storedWA = localStorage.getItem(WHATSAPP_STORAGE_KEY);
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          whatsapp_number: storedWA || parsed.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number,
        };
      }
      if (storedWA) {
        return { ...DEFAULT_SETTINGS, whatsapp_number: storedWA };
      }
    } catch (e) {
      console.warn('Could not load site settings from LocalStorage:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Categories initialized from LocalStorage 'categories' key with aesthetic fallbacks
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure every category has a valid image fallback
          return parsed.map((cat: Category) => {
            const matchedDefault = DEFAULT_CATEGORIES.find(
              (d) => d.id === cat.id || d.slug === cat.slug || d.name.toLowerCase() === cat.name.toLowerCase()
            );
            return {
              ...cat,
              image: cat.image || matchedDefault?.image || DEFAULT_CATEGORIES[0].image,
              icon: cat.icon || matchedDefault?.icon || '✨',
            };
          });
        }
      }
    } catch (e) {
      console.warn('Could not load categories from LocalStorage:', e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Products initialized from LocalStorage 'products' key
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load products from LocalStorage:', e);
    }
    return [];
  });

  // Orders initialized from LocalStorage 'orders' key
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Initialize with sample orders for first-time dashboard preview
      const initialSamples = getDefaultSampleOrders();
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(initialSamples));
      return initialSamples;
    } catch (e) {
      console.warn('Could not load orders from LocalStorage:', e);
    }
    return getDefaultSampleOrders();
  });

  // Payment settings initialized from LocalStorage 'paymentSettings' key
  const [paymentSettings, setPaymentSettingsState] = useState<PaymentSettings>(() => {
    try {
      const saved = localStorage.getItem(PAYMENT_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PAYMENT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load payment settings from LocalStorage:', e);
    }
    return DEFAULT_PAYMENT_SETTINGS;
  });

  const [events, setEvents] = useState<EventItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Store Logo, Hero Banner & Background from LocalStorage keys 'store_logo', 'store_hero_banner', 'store_background'
  const [storeLogo, setStoreLogo] = useState<string | null>(() => getStoredLogo());
  const [storeHeroBanner, setStoreHeroBannerState] = useState<string | null>(() => getStoredHeroBanner());
  const [storeBackground, setStoreBackgroundState] = useState<StoreBackgroundData>(() => getStoredBackground());

  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dissof_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dissof_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem('dissof_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  // Save wishlist
  useEffect(() => {
    try {
      localStorage.setItem('dissof_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  // Listen for WhatsApp number updates or orders across the app
  useEffect(() => {
    const handleWaUpdate = () => {
      const stored = localStorage.getItem(WHATSAPP_STORAGE_KEY);
      if (stored) {
        setSettings((prev) => ({ ...prev, whatsapp_number: stored }));
      }
    };

    const handleBrandingUpdate = () => {
      setStoreLogo(getStoredLogo());
      setStoreHeroBannerState(getStoredHeroBanner());
      setStoreBackgroundState(getStoredBackground());
    };

    const handleOrdersUpdate = () => {
      try {
        const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setOrders(parsed);
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('dissof_whatsapp_updated', handleWaUpdate);
    window.addEventListener('dissof_orders_updated', handleOrdersUpdate);
    window.addEventListener('dissof_branding_updated', handleBrandingUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === WHATSAPP_STORAGE_KEY) handleWaUpdate();
      if (e.key === ORDERS_STORAGE_KEY) handleOrdersUpdate();
      if (e.key === STORE_LOGO_KEY || e.key === STORE_HERO_BANNER_KEY || e.key === STORE_BACKGROUND_KEY) handleBrandingUpdate();
    });

    return () => {
      window.removeEventListener('dissof_whatsapp_updated', handleWaUpdate);
      window.removeEventListener('dissof_orders_updated', handleOrdersUpdate);
      window.removeEventListener('dissof_branding_updated', handleBrandingUpdate);
    };
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [s, c, p, ev, t, ords] = await Promise.all([
        api.getSettings().catch(() => null),
        api.getCategories().catch(() => []),
        api.getProducts({ all: true }).catch(() => []),
        api.getEvents().catch(() => []),
        api.getTestimonials().catch(() => []),
        api.getOrders().catch(() => []),
      ]);

      // 1. Settings
      const storedWA = localStorage.getItem(WHATSAPP_STORAGE_KEY);
      const storedSettingsRaw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettingsRaw) {
        try {
          const parsed = JSON.parse(storedSettingsRaw);
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed,
            whatsapp_number: storedWA || parsed.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number,
          });
        } catch {
          // ignore
        }
      } else if (s) {
        const merged = { ...s, whatsapp_number: storedWA || s.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number };
        setSettings(merged);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      }

      if (ev && ev.length > 0) setEvents(ev);
      if (t && t.length > 0) setTestimonials(t);

      // 2. Categories: check LocalStorage first
      const localCatRaw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (localCatRaw) {
        try {
          const parsed = JSON.parse(localCatRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
          }
        } catch {
          // ignore
        }
      } else if (c && c.length > 0) {
        const enriched = c.map((cat: Category) => {
          const def = DEFAULT_CATEGORIES.find((d) => d.id === cat.id || d.slug === cat.slug);
          return {
            ...cat,
            image: cat.image || def?.image || DEFAULT_CATEGORIES[0].image,
            icon: cat.icon || def?.icon || '✨',
          };
        });
        setCategories(enriched);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(enriched));
      } else {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      }

      // 3. Products: check LocalStorage first
      const localProductsRaw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (localProductsRaw) {
        try {
          const parsed = JSON.parse(localProductsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        } catch {
          // fallback
        }
      } else if (p && p.length > 0) {
        setProducts(p);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(p));
      }

      // 4. Orders: check LocalStorage first
      const localOrdersRaw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (localOrdersRaw) {
        try {
          const parsed = JSON.parse(localOrdersRaw);
          if (Array.isArray(parsed)) {
            setOrders(parsed);
          }
        } catch {
          // ignore
        }
      } else if (ords && ords.length > 0) {
        setOrders(ords);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ords));
      }
    } catch (err) {
      console.error('Error fetching store data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Save full SiteSettings to LocalStorage
  const saveSettingsLocal = async (newSettings: Partial<SiteSettings>): Promise<SiteSettings> => {
    const updated: SiteSettings = {
      ...settings,
      ...newSettings,
    };

    if (newSettings.whatsapp_number) {
      setStoredWhatsAppNumber(newSettings.whatsapp_number);
    }

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      setSettings(updated);
    } catch (e) {
      console.error('Failed to save settings to LocalStorage:', e);
    }

    // Background sync
    try {
      await api.updateSettings(updated);
    } catch {
      // ignore
    }

    return updated;
  };

  const updateWhatsAppNumberLocal = (newNumber: string) => {
    setStoredWhatsAppNumber(newNumber);
    setSettings((prev) => ({ ...prev, whatsapp_number: newNumber }));
  };

  // 100% Client-Side Store Logo & Hero Banner Handlers
  const saveStoreLogo = async (logoData: string): Promise<void> => {
    setStoredLogo(logoData);
    setStoreLogo(logoData);
    setSettings((prev) => (prev ? { ...prev, logo_url: logoData } : prev));
  };

  const removeStoreLogo = async (): Promise<void> => {
    removeStoredLogo();
    setStoreLogo(null);
    setSettings((prev) => (prev ? { ...prev, logo_url: undefined } : prev));
  };

  const saveHeroBanner = async (bannerData: string): Promise<void> => {
    setStoredHeroBanner(bannerData);
    setStoreHeroBannerState(bannerData);
    setSettings((prev) => (prev ? { ...prev, hero_banner_url: bannerData } : prev));
  };

  const removeHeroBanner = async (): Promise<void> => {
    removeStoredHeroBanner();
    setStoreHeroBannerState(null);
    setSettings((prev) => (prev ? { ...prev, hero_banner_url: undefined } : prev));
  };

  const saveStoreBackground = async (bg: StoreBackgroundData): Promise<void> => {
    setStoredBackground(bg);
    setStoreBackgroundState(bg);
    setSettings((prev) => (prev ? { ...prev, background: bg } : prev));
  };

  const resetStoreBackground = async (): Promise<void> => {
    resetStoredBackground();
    setStoreBackgroundState(getStoredBackground());
    setSettings((prev) => (prev ? { ...prev, background: getStoredBackground() } : prev));
  };

  // Save payment settings to LocalStorage 'paymentSettings'
  const savePaymentSettings = (newSettings: PaymentSettings) => {
    setPaymentSettingsState(newSettings);
    try {
      localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save payment settings to LocalStorage:', e);
    }
  };

  // Save category to LocalStorage 'categories'
  const saveCategoryLocal = async (categoryName: string, categoryData?: Partial<Category>): Promise<Category> => {
    const trimmed = categoryName.trim();
    if (!trimmed) {
      throw new Error('Nama kategori tidak boleh kosong.');
    }

    const slug = (categoryData?.slug || trimmed).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase() || c.slug === slug);
    if (existing) {
      return existing;
    }

    // Pick aesthetic image fallback matching category name
    let fallbackImg = DEFAULT_CATEGORIES[0].image;
    if (slug.includes('phone') || slug.includes('charm')) fallbackImg = DEFAULT_CATEGORIES[1].image;
    else if (slug.includes('neck') || slug.includes('kalung')) fallbackImg = DEFAULT_CATEGORIES[2].image;
    else if (slug.includes('ring') || slug.includes('cincin')) fallbackImg = DEFAULT_CATEGORIES[3].image;
    else if (slug.includes('key') || slug.includes('bag')) fallbackImg = DEFAULT_CATEGORIES[4].image;
    else if (slug.includes('gift') || slug.includes('set') || slug.includes('hampers')) fallbackImg = DEFAULT_CATEGORIES[5].image;

    const newCat: Category = {
      id: slug || `cat-${Date.now()}`,
      name: trimmed,
      slug: slug || `cat-${Date.now()}`,
      description: categoryData?.description || `Koleksi ${trimmed} handmade DISSOF.ID`,
      icon: categoryData?.icon || '✨',
      image: categoryData?.image || fallbackImg,
    };

    const updatedCategories = [...categories, newCat];
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
      return newCat;
    } catch (err) {
      console.error('Failed to save category in LocalStorage:', err);
      throw new Error('Gagal menyimpan kategori baru ke LocalStorage.');
    }
  };

  // Save / Edit full category (with image, description, icon)
  const saveFullCategoryLocal = async (category: Category): Promise<Category> => {
    const current = [...categories];
    const index = current.findIndex((c) => c.id === category.id || c.slug === category.slug);

    let updated: Category[];
    if (index >= 0) {
      current[index] = { ...current[index], ...category };
      updated = current;
    } else {
      updated = [...current, category];
    }

    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      setCategories(updated);
      return category;
    } catch (err) {
      console.error('Failed to save full category in LocalStorage:', err);
      throw new Error('Gagal menyimpan perubahan kategori.');
    }
  };

  const deleteCategoryLocal = async (categoryId: string): Promise<void> => {
    const updated = categories.filter((c) => c.id !== categoryId && c.slug !== categoryId);
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      setCategories(updated);
    } catch (err) {
      console.error('Failed to delete category:', err);
      throw new Error('Gagal menghapus kategori.');
    }
  };

  const resetCategoriesToDefault = () => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      setCategories(DEFAULT_CATEGORIES);
    } catch (err) {
      console.error('Failed to reset categories:', err);
    }
  };

  // Local-first product saving (handles add and edit without external backend failure)
  const saveProductLocal = async (productData: Partial<Product>, editingId?: string): Promise<Product> => {
    let currentProducts = [...products];

    // Find category name
    const category = categories.find((c) => c.id === productData.category_id);
    const categoryName = category?.name || productData.category_name || 'Accessories';

    let updatedProduct: Product;

    if (editingId) {
      // Edit existing product
      const targetIndex = currentProducts.findIndex((p) => p.id === editingId);
      if (targetIndex === -1) {
        throw new Error(`Produk dengan ID ${editingId} tidak ditemukan.`);
      }

      updatedProduct = {
        ...currentProducts[targetIndex],
        ...productData,
        category_name: categoryName,
        updated_at: new Date().toISOString(),
      } as Product;

      currentProducts[targetIndex] = updatedProduct;
    } else {
      // Create new product
      const slug = (productData.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const newId = `prod-${Date.now()}`;

      updatedProduct = {
        id: newId,
        name: productData.name || 'Produk Baru',
        slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
        category_id: productData.category_id || 'bracelets',
        category_name: categoryName,
        price: Number(productData.price) || 0,
        original_price: productData.original_price ? Number(productData.original_price) : undefined,
        stock: productData.stock != null ? Number(productData.stock) : 10,
        description: productData.description || '',
        details: productData.details || [],
        variants: productData.variants || [],
        tags: productData.tags || [],
        images: productData.images && productData.images.length > 0 ? productData.images : [],
        is_best_seller: Boolean(productData.is_best_seller),
        is_sold_out: Boolean(productData.is_sold_out),
        is_visible: productData.is_visible !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      currentProducts = [updatedProduct, ...currentProducts];
    }

    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(currentProducts));
      setProducts(currentProducts);
      return updatedProduct;
    } catch (storageErr: any) {
      console.error('LocalStorage write error:', storageErr);
      if (
        storageErr.name === 'QuotaExceededError' ||
        storageErr.code === 22 ||
        storageErr.message?.toLowerCase().includes('quota') ||
        storageErr.message?.toLowerCase().includes('storage')
      ) {
        throw new Error('Ukuran gambar terlalu besar atau memori browser penuh. Silakan kurangi jumlah foto, pilih foto yang lebih kecil, atau gunakan link/URL gambar.');
      }
      throw new Error('Gagal menyimpan ke penyimpanan lokal browser. Pastikan browser mengizinkan penyimpanan LocalStorage.');
    }
  };

  // Local-first product deletion
  const deleteProductLocal = async (productId: string): Promise<void> => {
    const updatedProducts = products.filter((p) => p.id !== productId);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    } catch (storageErr: any) {
      console.error('LocalStorage delete error:', storageErr);
      throw new Error('Gagal menghapus produk dari penyimpanan lokal.');
    }
  };

  // Save full Order to LocalStorage 'orders' & fire real-time events & play chime
  const createOrderLocal = async (orderData: {
    customer_name: string;
    customer_whatsapp: string;
    customer_address?: string;
    order_notes?: string;
    payment_method: 'bank_transfer' | 'qris' | 'whatsapp';
    payment_proof_url?: string;
  }): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('Keranjang belanja kosong.');
    }

    const orderItems = cart.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      variant: item.selectedVariant,
      image: item.product.images?.[0],
      custom_note: item.customNote,
    }));

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customer_name: orderData.customer_name,
      customer_whatsapp: orderData.customer_whatsapp,
      customer_address: orderData.customer_address || 'Dumai (Ambil di tempat / Kirim)',
      items: orderItems,
      subtotal: cartSubtotal,
      total: cartSubtotal,
      order_notes: orderData.order_notes || '',
      notes: orderData.order_notes || '',
      source: 'online',
      payment_method: orderData.payment_method,
      payment_proof_url: orderData.payment_proof_url,
      status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const savedOrdersRaw = localStorage.getItem(ORDERS_STORAGE_KEY);
      const existingOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : [];
      const updatedOrders = [newOrder, ...(Array.isArray(existingOrders) ? existingOrders : [])];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
      setOrders(updatedOrders);

      // Trigger custom notification event & sound
      window.dispatchEvent(new CustomEvent('dissof_new_order', { detail: newOrder }));
      window.dispatchEvent(new Event('dissof_orders_updated'));
      playNotificationChime();
    } catch (err: any) {
      console.error('Failed to save order to LocalStorage:', err);
    }

    // Optional background sync
    try {
      await api.createOrder({
        customer_name: newOrder.customer_name,
        customer_whatsapp: newOrder.customer_whatsapp,
        customer_address: newOrder.customer_address,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        total: newOrder.total,
        order_notes: newOrder.order_notes,
      });
    } catch {
      // ignore
    }

    return newOrder;
  };

  // Update order status 100% Client-Side without error pop-up
  const updateOrderStatusLocal = async (orderId: string, status: Order['status']): Promise<void> => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o));
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('dissof_orders_updated'));
      } catch (e) {
        console.warn('Failed to update orders in LocalStorage:', e);
      }
      return updated;
    });

    // Optional background sync (fails silently without breaking UI)
    try {
      await api.updateOrderStatus(orderId, status);
    } catch {
      // ignore
    }
  };

  // Delete order 100% Client-Side without error pop-up
  const deleteOrderLocal = async (orderId: string): Promise<void> => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('dissof_orders_updated'));
      } catch (e) {
        console.warn('Failed to delete order from LocalStorage:', e);
      }
      return updated;
    });

    // Optional background sync
    try {
      await api.deleteOrder(orderId);
    } catch {
      // ignore
    }
  };

  const addToCart = (product: Product, quantity = 1, selectedVariant?: string, customNote?: string) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant === selectedVariant && item.customNote === customNote
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity, selectedVariant, customNote }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedVariant?: string, customNote?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedVariant === selectedVariant && item.customNote === customNote)
      )
    );
  };

  const updateCartQty = (productId: string, quantity: number, selectedVariant?: string, customNote?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedVariant, customNote);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.selectedVariant === selectedVariant && item.customNote === customNote) {
          const maxStock = item.product.stock || 99;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const cartSubtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

  const checkoutViaWhatsApp = async (customer: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  }) => {
    if (cart.length === 0) return;

    // 1. Save order locally
    await createOrderLocal({
      customer_name: customer.name,
      customer_whatsapp: customer.phone,
      customer_address: customer.address,
      order_notes: customer.notes,
      payment_method: 'whatsapp',
    });

    // 2. Trigger festive confetti
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F472B6', '#FB7185', '#C084FC', '#FDE047', '#A7F3D0'],
    });

    // 3. Construct clean WhatsApp message
    let itemsText = '';
    cart.forEach((item, index) => {
      itemsText += `${index + 1}. *${item.product.name}*\n`;
      if (item.selectedVariant) {
        itemsText += `   • Varian: ${item.selectedVariant}\n`;
      }
      if (item.customNote) {
        itemsText += `   • Request/Inisial: ${item.customNote}\n`;
      }
      itemsText += `   • Jumlah: ${item.quantity} pcs x ${formatIDR(item.product.price)} = *${formatIDR(item.product.price * item.quantity)}*\n\n`;
    });

    const waNumber = settings?.whatsapp_number || getStoredWhatsAppNumber();
    const message = `Halo ${settings?.brand_name || 'DISSOF.ID'} ♡\nSaya ingin order aksesoris handmade berikut:\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Data Pemesan:*\n` +
      `• Nama: ${customer.name}\n` +
      `• No. HP / WA: ${customer.phone}\n` +
      (customer.address ? `• Alamat / Pengambilan: ${customer.address}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `🛍️ *Daftar Produk:*\n` +
      itemsText +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Total Belanja:* *${formatIDR(cartSubtotal)}*\n` +
      (customer.notes ? `📝 *Catatan Tambahan:* ${customer.notes}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `Mohon info total ongkir & rekening pembayarannya ya kak. Terima kasih ♡`;

    // 4. Open WhatsApp
    const waUrl = createWhatsAppLink(waNumber, message);
    window.location.href = waUrl;

    // 5. Clear cart and close drawer
    clearCart();
    setIsCartOpen(false);
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        products,
        orders,
        events,
        testimonials,
        paymentSettings,
        cart,
        wishlist,
        isCartOpen,
        isLoading,
        storeLogo,
        storeHeroBanner,
        storeBackground,
        saveStoreLogo,
        removeStoreLogo,
        saveHeroBanner,
        removeHeroBanner,
        saveStoreBackground,
        resetStoreBackground,
        setIsCartOpen,
        setCartOpen: setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,
        isWishlisted,
        refreshData,
        saveProductLocal,
        deleteProductLocal,
        saveCategoryLocal,
        saveFullCategoryLocal,
        deleteCategoryLocal,
        resetCategoriesToDefault,
        savePaymentSettings,
        saveSettingsLocal,
        updateWhatsAppNumberLocal,
        createOrderLocal,
        updateOrderStatusLocal,
        deleteOrderLocal,
        cartSubtotal,
        cartCount,
        pendingOrdersCount,
        checkoutViaWhatsApp,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
