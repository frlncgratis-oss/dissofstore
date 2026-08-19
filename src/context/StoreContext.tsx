import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, CartItem, SiteSettings, EventItem, Testimonial } from '../types';
import { api } from '../lib/api';
import { formatIDR, createWhatsAppLink } from '../lib/utils';
import confetti from 'canvas-confetti';

const PRODUCTS_STORAGE_KEY = 'products';

interface StoreContextType {
  settings: SiteSettings | null;
  categories: Category[];
  products: Product[];
  events: EventItem[];
  testimonials: Testimonial[];
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  isLoading: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedVariant?: string, customNote?: string) => void;
  removeFromCart: (productId: string, selectedVariant?: string) => void;
  updateCartQty: (productId: string, quantity: number, selectedVariant?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  refreshData: () => Promise<void>;
  saveProductLocal: (productData: Partial<Product>, editingId?: string) => Promise<Product>;
  deleteProductLocal: (productId: string) => Promise<void>;
  cartSubtotal: number;
  cartCount: number;
  checkoutViaWhatsApp: (customer: { name: string; phone: string; address?: string; notes?: string }) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Products initialized from LocalStorage 'products' key if available
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
      if (c && c.length > 0) setCategories(c);
      if (ev && ev.length > 0) setEvents(ev);
      if (t && t.length > 0) setTestimonials(t);

      // Check if products exist in LocalStorage
      const localProductsRaw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (localProductsRaw) {
        try {
          const parsed = JSON.parse(localProductsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
            return;
          }
        } catch {
          // fallback to fetched
        }
      }

      // If LocalStorage was empty, use fetched products and persist to LocalStorage
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

  // Local-first product saving (handles add and edit without external backend failure)
  const saveProductLocal = async (productData: Partial<Product>, editingId?: string): Promise<Product> => {
    let currentProducts = [...products];

    // Find category name
    const category = categories.find((c) => c.id === productData.category_id);
    const categoryName = category?.name || 'Accessories';

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

  const addToCart = (product: Product, quantity = 1, selectedVariant?: string, customNote?: string) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant === selectedVariant
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        if (customNote) next[existingIdx].customNote = customNote;
        return next;
      }
      return [...prev, { product, quantity, selectedVariant, customNote }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedVariant?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedVariant === selectedVariant)
      )
    );
  };

  const updateCartQty = (productId: string, quantity: number, selectedVariant?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedVariant);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.selectedVariant === selectedVariant) {
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

    const orderItems = cart.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      variant: item.selectedVariant,
      image: item.product.images?.[0],
      custom_note: item.customNote,
    }));

    // 1. Save order to database if available
    try {
      await api.createOrder({
        customer_name: customer.name,
        customer_whatsapp: customer.phone,
        customer_address: customer.address || 'Ambil di Dumai Pop-Up Market / Dikirim via Ekspedisi',
        items: orderItems,
        subtotal: cartSubtotal,
        total: cartSubtotal,
        order_notes: customer.notes || '',
      });
    } catch (e) {
      console.error('Order creation error:', e);
    }

    // 2. Trigger festive confetti
    confetti({
      particleCount: 80,
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
