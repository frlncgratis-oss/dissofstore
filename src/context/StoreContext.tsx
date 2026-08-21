import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Product, 
  Category, 
  CartItem, 
  SiteSettings, 
  EventItem, 
  Testimonial, 
  PaymentSettings, 
  Order 
} from '../types';
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

export const DEFAULT_INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Strawberry Dream Charm Bracelet',
    slug: 'strawberry-dream-charm-bracelet',
    category_id: 'bracelets',
    category_name: 'Charm Bracelets',
    price: 35000,
    original_price: 45000,
    stock: 12,
    description: 'Gelang manik-manik pastel kombinasi buah strawberry, mutiara air tawar sintetis, dan charm hati pink manis.',
    details: ['Bahan: Glass beads, faux pearl, acrylic charm', 'Panjang: 16cm + 4cm rantai extender fleksibel', 'Tahan air & tidak mudah luntur'],
    variants: ['Pastel Pink', 'Soft Lilac', 'Strawberry Milk'],
    tags: ['Best Seller', 'Pastel', 'Handmade', 'Viral'],
    images: ['https://images.unsplash.com/photo-1611591475152-4735d38d0145?w=700&auto=format&fit=crop&q=80'],
    is_best_seller: true,
    is_sold_out: false,
    is_visible: true,
    rating: 5,
    review_count: 48,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Custom Initial Daisy Beads Ring',
    slug: 'custom-initial-daisy-beads-ring',
    category_id: 'rings',
    category_name: 'Beaded Rings',
    price: 15000,
    original_price: 20000,
    stock: 25,
    description: 'Cincin manik motif bunga daisy cantik dengan inisial huruf nama kamu sendiri.',
    details: ['Bahan: Manik Jepang MGB & tali elastis jepang super kuat', 'Bisa request inisial A-Z', 'Ukuran all-size jari wanita'],
    variants: ['Letter A-Z (Custom)', 'Daisy Putih', 'Daisy Lavender'],
    tags: ['Custom Name', 'Gift Idea', 'Best Price'],
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&auto=format&fit=crop&q=80'],
    is_best_seller: true,
    is_sold_out: false,
    is_visible: true,
    rating: 5,
    review_count: 62,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Ocean Breeze Pearl Phone Strap',
    slug: 'ocean-breeze-pearl-phone-strap',
    category_id: 'phone-charms',
    category_name: 'Phone Charms',
    price: 45000,
    original_price: 55000,
    stock: 8,
    description: 'Gantungan handphone estetik bernuansa laut dengan mutiara, kerang mutiara, dan manik crystal biru pastel.',
    details: ['Tali strap nilon tebal ekstra kokoh', 'Mencegah HP jatuh saat selfie', 'Panjang total 22cm'],
    variants: ['Sky Blue', 'Aqua Pearl', 'Deep Sea'],
    tags: ['Phone Charm', 'Aesthetic', 'Strap HP'],
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=700&auto=format&fit=crop&q=80'],
    is_best_seller: true,
    is_sold_out: false,
    is_visible: true,
    rating: 5,
    review_count: 34,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Fairy Ribbon Pastel Necklace',
    slug: 'fairy-ribbon-pastel-necklace',
    category_id: 'necklaces',
    category_name: 'Beaded Necklaces',
    price: 55000,
    original_price: 68000,
    stock: 5,
    description: 'Kalung manik fairycore dengan charm pita ribbon logam silver dan gradasi manik lilac & soft pink.',
    details: ['Pengait stainless steel anti karat', 'Panjang 40cm + 5cm extender', 'Kemasan gift bag cantik'],
    variants: ['Silver Ribbon', 'Rose Gold Ribbon'],
    tags: ['Fairycore', 'Necklace', 'Trending'],
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&auto=format&fit=crop&q=80'],
    is_best_seller: false,
    is_sold_out: false,
    is_visible: true,
    rating: 5,
    review_count: 19,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Cherry Blossom Bag Charm',
    slug: 'cherry-blossom-bag-charm',
    category_id: 'keychains',
    category_name: 'Keychains & Bag Charms',
    price: 38000,
    stock: 14,
    description: 'Gantungan tas manik premium dengan gantungan lobster claw gold dan charm bunga sakura.',
    details: ['Ring gantungan kokoh untuk tas & kunci', 'Charm enamel bunga sakura Jepang'],
    variants: ['Sakura Pink', 'Matcha Mint'],
    tags: ['Bag Charm', 'Keychain', 'Cute'],
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&auto=format&fit=crop&q=80'],
    is_best_seller: false,
    is_sold_out: false,
    is_visible: true,
    rating: 5,
    review_count: 22,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Sweet Heart DIY Gift Box Set',
    slug: 'sweet-heart-diy-gift-box-set',
    category_id: 'gift-sets',
    category_name: 'Gift Sets & Bundles',
    price: 95000,
    original_price: 120000,
    stock: 6,
    description: 'Set kado spesial berisi 1 gelang charm, 1 kalung mutiara, 1 cincin daisy, bonus greeting card & kotak kado pita estetik.',
    details: ['Free custom kartu ucapan', 'Hardbox pita premium', 'Bisa langsung dikirim ke orang tersayang'],
    variants: ['Pink Valentine Box', 'Lavender Sky Box', 'Pastel Blossom Box'],
    tags: ['Gift Box', 'Hampers', 'Birthday Gift'],
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=700&auto=format&fit=crop&q=80'],
    is_best_seller: true,
    is_sold_out: false,
    is_visible: true,
    rating: 5,
    review_count: 57,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const getDefaultSampleOrders = (): Order[] => {
  const now = new Date();
  const today1 = new Date(now.getTime() - 1000 * 60 * 35);
  const today2 = new Date(now.getTime() - 1000 * 60 * 150);
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

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  bank_name: 'BCA (Bank Central Asia)',
  account_number: '8280-9912-3456',
  account_holder: 'DISSOF ACCESSORIES DUMAI',
  qris_label: 'QRIS DISSOF.ID (BCA, Mandiri, BRI, BNI, GoPay, DANA, OVO, ShopeePay)',
  qris_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  instructions: '1. Transfer sesuai nominal total belanja ke Rekening / scan QRIS di atas.\n2. Simpan struk / screenshot bukti transfer.\n3. Unggah foto bukti transfer di bawah ini lalu klik tombol "Konfirmasi & Selesaikan Pesanan".',
  is_enabled: true,
  notes: 'Pesanan kamu akan langsung terverifikasi dan diproses oleh pengrajin DISSOF Dumai ♡'
};

export const DEFAULT_SETTINGS: SiteSettings = {
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
  isOnlineSynced: boolean;
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
  const [isOnlineSynced, setIsOnlineSynced] = useState<boolean>(true);

  // Settings State
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
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Categories State
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_CATEGORIES;
  });

  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_INITIAL_PRODUCTS;
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return getDefaultSampleOrders();
  });

  // Payment Settings State
  const [paymentSettings, setPaymentSettingsState] = useState<PaymentSettings>(() => {
    try {
      const saved = localStorage.getItem(PAYMENT_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PAYMENT_SETTINGS, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PAYMENT_SETTINGS;
  });

  const [events, setEvents] = useState<EventItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Store Logo, Hero Banner & Background
  const [storeLogo, setStoreLogo] = useState<string | null>(() => getStoredLogo());
  const [storeHeroBanner, setStoreHeroBannerState] = useState<string | null>(() => getStoredHeroBanner());
  const [storeBackground, setStoreBackgroundState] = useState<StoreBackgroundData>(() => getStoredBackground());

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dissof_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dissof_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save Cart and Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('dissof_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('dissof_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // =========================================================================
  // 1. REAL-TIME FIRESTORE DATABASE LISTENERS (SYNC ACROSS ALL MOBILE & DESKTOP)
  // =========================================================================
  useEffect(() => {
    // A. Listen to Site Settings & Branding (Real-time)
    const settingsDocRef = doc(db, 'settings', 'store_config');
    const unsubSettings = onSnapshot(settingsDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SiteSettings;
        setSettings((prev) => ({
          ...prev,
          ...data,
        }));
        if (data.logo_url !== undefined) {
          setStoreLogo(data.logo_url || null);
          setStoredLogo(data.logo_url || '');
        }
        if (data.hero_banner_url !== undefined) {
          setStoreHeroBannerState(data.hero_banner_url || null);
          setStoredHeroBanner(data.hero_banner_url || '');
        }
        if (data.background) {
          setStoreBackgroundState(data.background);
          setStoredBackground(data.background);
        }
        if (data.whatsapp_number) {
          setStoredWhatsAppNumber(data.whatsapp_number);
        }
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...data }));
        setIsOnlineSynced(true);
      } else {
        // Seed initial settings into Firestore if empty
        const initialBg = getStoredBackground();
        const initialLogo = getStoredLogo();
        const initialBanner = getStoredHeroBanner();
        const initialWA = getStoredWhatsAppNumber() || DEFAULT_SETTINGS.whatsapp_number;
        const seedData: SiteSettings = {
          ...DEFAULT_SETTINGS,
          logo_url: initialLogo || undefined,
          hero_banner_url: initialBanner || undefined,
          background: initialBg,
          whatsapp_number: initialWA,
        };
        setDoc(settingsDocRef, seedData, { merge: true }).catch(console.warn);
      }
    }, (err) => {
      console.warn('Firestore settings listener error (offline cache active):', err);
    });

    // B. Listen to Categories (Real-time)
    const categoriesColRef = collection(db, 'categories');
    const unsubCategories = onSnapshot(categoriesColRef, (snap) => {
      if (!snap.empty) {
        const loadedCats: Category[] = [];
        snap.forEach((docSnap) => {
          loadedCats.push({ ...docSnap.data(), id: docSnap.id } as Category);
        });
        setCategories(loadedCats);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(loadedCats));
        setIsOnlineSynced(true);
      } else {
        // Seed initial categories
        DEFAULT_CATEGORIES.forEach((cat) => {
          setDoc(doc(db, 'categories', cat.id), cat, { merge: true }).catch(console.warn);
        });
      }
    }, (err) => {
      console.warn('Firestore categories listener error:', err);
    });

    // C. Listen to Products (Real-time)
    const productsColRef = collection(db, 'products');
    const unsubProducts = onSnapshot(productsColRef, (snap) => {
      if (!snap.empty) {
        const loadedProducts: Product[] = [];
        snap.forEach((docSnap) => {
          loadedProducts.push({ ...docSnap.data(), id: docSnap.id } as Product);
        });
        setProducts(loadedProducts);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(loadedProducts));
        setIsOnlineSynced(true);
      } else {
        // Seed initial products
        DEFAULT_INITIAL_PRODUCTS.forEach((prod) => {
          setDoc(doc(db, 'products', prod.id), prod, { merge: true }).catch(console.warn);
        });
      }
    }, (err) => {
      console.warn('Firestore products listener error:', err);
    });

    // D. Listen to Orders (Real-time)
    const ordersColRef = collection(db, 'orders');
    const unsubOrders = onSnapshot(ordersColRef, (snap) => {
      if (!snap.empty) {
        const loadedOrders: Order[] = [];
        snap.forEach((docSnap) => {
          loadedOrders.push({ ...docSnap.data(), id: docSnap.id } as Order);
        });
        // Sort newest first
        loadedOrders.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setOrders(loadedOrders);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(loadedOrders));
        setIsOnlineSynced(true);
      } else {
        // Seed initial sample orders
        const samples = getDefaultSampleOrders();
        samples.forEach((ord) => {
          setDoc(doc(db, 'orders', ord.id), ord, { merge: true }).catch(console.warn);
        });
      }
    }, (err) => {
      console.warn('Firestore orders listener error:', err);
    });

    // E. Listen to Payment Settings (Real-time)
    const paymentDocRef = doc(db, 'payment_settings', 'main_config');
    const unsubPayment = onSnapshot(paymentDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as PaymentSettings;
        setPaymentSettingsState(data);
        localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(data));
        setIsOnlineSynced(true);
      } else {
        // Seed initial payment settings
        setDoc(paymentDocRef, DEFAULT_PAYMENT_SETTINGS, { merge: true }).catch(console.warn);
      }
    }, (err) => {
      console.warn('Firestore payment listener error:', err);
    });

    return () => {
      unsubSettings();
      unsubCategories();
      unsubProducts();
      unsubOrders();
      unsubPayment();
    };
  }, []);

  // Listen to custom cross-tab events
  useEffect(() => {
    const handleBrandingUpdate = () => {
      setStoreLogo(getStoredLogo());
      setStoreHeroBannerState(getStoredHeroBanner());
      setStoreBackgroundState(getStoredBackground());
    };

    window.addEventListener('dissof_branding_updated', handleBrandingUpdate);
    return () => {
      window.removeEventListener('dissof_branding_updated', handleBrandingUpdate);
    };
  }, []);

  const refreshData = useCallback(async () => {
    // Data is synced real-time via Firestore listeners
  }, []);

  // =========================================================================
  // 2. REAL-TIME MUTATIONS (ONLINE DATABASE FIRST + LOCALSTORAGE FALLBACK)
  // =========================================================================

  // Save Settings & Branding Online
  const saveSettingsLocal = async (newSettings: Partial<SiteSettings>): Promise<SiteSettings> => {
    const updated: SiteSettings = {
      ...settings,
      ...newSettings,
    };

    if (newSettings.whatsapp_number) {
      setStoredWhatsAppNumber(newSettings.whatsapp_number);
    }

    setSettings(updated);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'settings', 'store_config'), updated, { merge: true });
    } catch (e) {
      console.warn('Online sync failed for settings:', e);
    }

    return updated;
  };

  const updateWhatsAppNumberLocal = (newNumber: string) => {
    setStoredWhatsAppNumber(newNumber);
    setSettings((prev) => ({ ...prev, whatsapp_number: newNumber }));
    setDoc(doc(db, 'settings', 'store_config'), { whatsapp_number: newNumber }, { merge: true }).catch(console.warn);
  };

  const saveStoreLogo = async (logoData: string): Promise<void> => {
    setStoredLogo(logoData);
    setStoreLogo(logoData);
    setSettings((prev) => (prev ? { ...prev, logo_url: logoData } : prev));
    try {
      await setDoc(doc(db, 'settings', 'store_config'), { logo_url: logoData }, { merge: true });
    } catch (e) {
      console.warn('Online sync failed for logo:', e);
    }
  };

  const removeStoreLogo = async (): Promise<void> => {
    removeStoredLogo();
    setStoreLogo(null);
    setSettings((prev) => (prev ? { ...prev, logo_url: undefined } : prev));
    try {
      await setDoc(doc(db, 'settings', 'store_config'), { logo_url: '' }, { merge: true });
    } catch (e) {
      console.warn('Online sync failed for removing logo:', e);
    }
  };

  const saveHeroBanner = async (bannerData: string): Promise<void> => {
    setStoredHeroBanner(bannerData);
    setStoreHeroBannerState(bannerData);
    setSettings((prev) => (prev ? { ...prev, hero_banner_url: bannerData } : prev));
    try {
      await setDoc(doc(db, 'settings', 'store_config'), { hero_banner_url: bannerData }, { merge: true });
    } catch (e) {
      console.warn('Online sync failed for hero banner:', e);
    }
  };

  const removeHeroBanner = async (): Promise<void> => {
    removeStoredHeroBanner();
    setStoreHeroBannerState(null);
    setSettings((prev) => (prev ? { ...prev, hero_banner_url: undefined } : prev));
    try {
      await setDoc(doc(db, 'settings', 'store_config'), { hero_banner_url: '' }, { merge: true });
    } catch (e) {
      console.warn('Online sync failed for removing hero banner:', e);
    }
  };

  const saveStoreBackground = async (bg: StoreBackgroundData): Promise<void> => {
    setStoredBackground(bg);
    setStoreBackgroundState(bg);
    setSettings((prev) => (prev ? { ...prev, background: bg } : prev));
    try {
      await setDoc(doc(db, 'settings', 'store_config'), { background: bg }, { merge: true });
    } catch (e) {
      console.warn('Online sync failed for background:', e);
    }
  };

  const resetStoreBackground = async (): Promise<void> => {
    resetStoredBackground();
    const defaultBg = getStoredBackground();
    setStoreBackgroundState(defaultBg);
    setSettings((prev) => (prev ? { ...prev, background: defaultBg } : prev));
    try {
      await setDoc(doc(db, 'settings', 'store_config'), { background: defaultBg }, { merge: true });
    } catch (e) {
      console.warn('Online sync failed for reset background:', e);
    }
  };

  const savePaymentSettings = async (newSettings: PaymentSettings) => {
    setPaymentSettingsState(newSettings);
    localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(newSettings));
    try {
      await setDoc(doc(db, 'payment_settings', 'main_config'), newSettings, { merge: true });
    } catch (e) {
      console.warn('Online sync failed for payment settings:', e);
    }
  };

  // Categories Online Sync
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
    setCategories(updatedCategories);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));

    try {
      await setDoc(doc(db, 'categories', newCat.id), newCat, { merge: true });
    } catch (e) {
      console.warn('Failed to sync new category to online database:', e);
    }

    return newCat;
  };

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

    setCategories(updated);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'categories', category.id), category, { merge: true });
    } catch (e) {
      console.warn('Failed to sync category update to online database:', e);
    }

    return category;
  };

  const deleteCategoryLocal = async (categoryId: string): Promise<void> => {
    const updated = categories.filter((c) => c.id !== categoryId && c.slug !== categoryId);
    setCategories(updated);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));

    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (e) {
      console.warn('Failed to delete category from online database:', e);
    }
  };

  const resetCategoriesToDefault = async () => {
    setCategories(DEFAULT_CATEGORIES);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));

    try {
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      }
    } catch (e) {
      console.warn('Failed to reset categories in online database:', e);
    }
  };

  // Products Online Sync
  const saveProductLocal = async (productData: Partial<Product>, editingId?: string): Promise<Product> => {
    let currentProducts = [...products];

    const category = categories.find((c) => c.id === productData.category_id);
    const categoryName = category?.name || productData.category_name || 'Accessories';

    let updatedProduct: Product;

    if (editingId) {
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

    setProducts(currentProducts);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(currentProducts));

    try {
      await setDoc(doc(db, 'products', updatedProduct.id), updatedProduct, { merge: true });
    } catch (e) {
      console.warn('Failed to sync product to online database:', e);
    }

    return updatedProduct;
  };

  const deleteProductLocal = async (productId: string): Promise<void> => {
    const updatedProducts = products.filter((p) => p.id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));

    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (e) {
      console.warn('Failed to delete product from online database:', e);
    }
  };

  // Orders Online Sync (Real-time sync between buyer & admin HP)
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

    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: newOrderId,
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

    // Update local state immediately for instant feedback
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));

    // Push to Firestore Online Database (Directly triggers Admin's dashboard in real-time)
    try {
      await setDoc(doc(db, 'orders', newOrderId), newOrder);
    } catch (e) {
      console.warn('Failed to sync new order to Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('dissof_new_order', { detail: newOrder }));
    window.dispatchEvent(new Event('dissof_orders_updated'));
    playNotificationChime();

    return newOrder;
  };

  const updateOrderStatusLocal = async (orderId: string, status: Order['status']): Promise<void> => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o));
    setOrders(updated);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Failed to sync order status update to online database:', e);
    }
  };

  const deleteOrderLocal = async (orderId: string): Promise<void> => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (e) {
      console.warn('Failed to delete order from online database:', e);
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

    await createOrderLocal({
      customer_name: customer.name,
      customer_whatsapp: customer.phone,
      customer_address: customer.address,
      order_notes: customer.notes,
      payment_method: 'whatsapp',
    });

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F472B6', '#FB7185', '#C084FC', '#FDE047', '#A7F3D0'],
    });

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

    const waUrl = createWhatsAppLink(waNumber, message);
    window.location.href = waUrl;

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
        isOnlineSynced,
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
