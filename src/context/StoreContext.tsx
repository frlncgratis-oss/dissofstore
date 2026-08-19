import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, CartItem, SiteSettings, EventItem, Testimonial, PaymentSettings, Order } from '../types';
import { api } from '../lib/api';
import { formatIDR, createWhatsAppLink } from '../lib/utils';
import confetti from 'canvas-confetti';

const PRODUCTS_STORAGE_KEY = 'products';
const CATEGORIES_STORAGE_KEY = 'categories';
const PAYMENT_SETTINGS_KEY = 'paymentSettings';
const ORDERS_STORAGE_KEY = 'orders';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'bracelets', name: 'Charm Bracelets', slug: 'bracelets', description: 'Handmade beaded bracelets with cute charms' },
  { id: 'phone-charms', name: 'Phone Charms', slug: 'phone-charms', description: 'Aksesoris gantungan HP estetik' },
  { id: 'necklaces', name: 'Beaded Necklaces', slug: 'necklaces', description: 'Kalung manik-manik handmade' },
  { id: 'rings', name: 'Beaded Rings', slug: 'rings', description: 'Cincin manik-manik pastel' },
  { id: 'keychains', name: 'Keychains & Bag Charms', slug: 'keychains', description: 'Gantungan kunci & tas lucu' },
  { id: 'gift-sets', name: 'Gift Sets & Bundles', slug: 'gift-sets', description: 'Paket kado spesial' },
];

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

interface StoreContextType {
  settings: SiteSettings | null;
  categories: Category[];
  products: Product[];
  events: EventItem[];
  testimonials: Testimonial[];
  paymentSettings: PaymentSettings;
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  isLoading: boolean;
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
  saveCategoryLocal: (categoryName: string) => Promise<Category>;
  deleteCategoryLocal: (categoryId: string) => Promise<void>;
  savePaymentSettings: (newSettings: PaymentSettings) => void;
  createOrderLocal: (orderData: {
    customer_name: string;
    customer_whatsapp: string;
    customer_address?: string;
    order_notes?: string;
    payment_method: 'bank_transfer' | 'qris' | 'whatsapp';
    payment_proof_url?: string;
  }) => Promise<Order>;
  cartSubtotal: number;
  cartCount: number;
  checkoutViaWhatsApp: (customer: { name: string; phone: string; address?: string; notes?: string }) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Categories initialized from LocalStorage 'categories' key
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
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

  const refreshData = useCallback(async () => {
    try {
      const [s, c, p, ev, t] = await Promise.all([
        api.getSettings().catch(() => null),
        api.getCategories().catch(() => []),
        api.getProducts({ all: true }).catch(() => []),
        api.getEvents().catch(() => []),
        api.getTestimonials().catch(() => []),
      ]);
      if (s) setSettings(s);
      if (ev && ev.length > 0) setEvents(ev);
      if (t && t.length > 0) setTestimonials(t);

      // 1. Sync Categories: check LocalStorage first
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
        setCategories(c);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(c));
      } else {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      }

      // 2. Sync Products: check LocalStorage first
      const localProductsRaw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (localProductsRaw) {
        try {
          const parsed = JSON.parse(localProductsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
            return;
          }
        } catch {
          // fallback
        }
      }

      if (p && p.length > 0) {
        setProducts(p);
        try {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(p));
        } catch (e) {
          console.warn('Could not cache initial products to LocalStorage:', e);
        }
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
  const saveCategoryLocal = async (categoryName: string): Promise<Category> => {
    const trimmed = categoryName.trim();
    if (!trimmed) {
      throw new Error('Nama kategori tidak boleh kosong.');
    }

    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase() || c.slug === slug);
    if (existing) {
      return existing;
    }

    const newCat: Category = {
      id: slug || `cat-${Date.now()}`,
      name: trimmed,
      slug: slug || `cat-${Date.now()}`,
      description: `Koleksi ${trimmed} handmade DISSOF.ID`,
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

  const deleteCategoryLocal = async (categoryId: string): Promise<void> => {
    const updated = categories.filter((c) => c.id !== categoryId);
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      setCategories(updated);
    } catch (err) {
      console.error('Failed to delete category:', err);
      throw new Error('Gagal menghapus kategori.');
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
      // Persist to LocalStorage under 'products' key
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

  // Save full Order to LocalStorage 'orders'
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

    const waNumber = settings?.whatsapp_number || '6282284901234';
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
        events,
        testimonials,
        paymentSettings,
        cart,
        wishlist,
        isCartOpen,
        isLoading,
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
        deleteCategoryLocal,
        savePaymentSettings,
        createOrderLocal,
        cartSubtotal,
        cartCount,
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
