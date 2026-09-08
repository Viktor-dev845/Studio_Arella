import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// One "Add to Cart" action from /book = one real uploaded ad creative,
// booked against one screen, across one or more real computed slots. Slots
// are plain JSON (real {start, end, mins} objects, matching the shape
// POST /bookings/reserve expects), not reserved yet — reservation only
// happens at actual checkout time, so items can sit in the cart without
// tying up a 5-minute slot lock while the user keeps shopping.
export interface CartItem {
  id: string;
  adId: string;
  adTitle: string;
  adPreviewUrl?: string;
  screenId: string;
  screenName: string;
  slots: { start: string; end: string; mins: number }[];
  estimatedCost: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((c) => c.id !== id) })),
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => get().cart.reduce((total, item) => total + (item.estimatedCost || 0), 0),
    }),
    {
      name: 'rella-cart-storage',
    }
  )
);
