import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, CartItem, SiteSettings, EventItem, Testimonial } from '../types';
import { api } from '../lib/api';
import { formatIDR, createWhatsAppLink } from '../lib/utils';
import confetti from 'canvas-confetti';

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
  cartSubtotal: number;
  cartCount: number;
  checkoutViaWhatsApp: (customer: { name: string; phone: string; address?: string; notes?: string }) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
      setCategories(c);
      setProducts(p);
      setEvents(ev);
      setTestimonials(t);
    } catch (err) {
      console.error('Error fetching store data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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

    // 1. Save order to database
    try {
      await api.createOrder({
        customer_name: customer.name,
        customer_whatsapp: customer.phone,
        customer_address: customer.address || 'Ambil di Car Free Night / Dikirim via Ekspedisi',
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
    refreshData();
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
