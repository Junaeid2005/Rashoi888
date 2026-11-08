import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }, openDrawer?: boolean) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  collectionDiscountPercent: number;
  setCollectionDiscountPercent: (pct: number) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  subtotal: 0,
  discount: 0,
  total: 0,
  itemCount: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
  collectionDiscountPercent: 10,
  setCollectionDiscountPercent: () => {},
});

const CART_STORAGE_KEY = 'rashoi_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [collectionDiscountPercent, setCollectionDiscountPercent] = useState(10);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to localStorage:', e);
    }
  }, [items]);

  const addItem = (
    item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number },
    openDrawer: boolean = false
  ) => {
    const qty = item.quantity || 1;
    const itemKey = `${item.name}-${item.selectedProtein || 'standard'}`;
    
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => `${i.name}-${i.selectedProtein || 'standard'}` === itemKey
      );

      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      } else {
        return [
          ...prevItems,
          {
            ...item,
            id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            quantity: qty,
          },
        ];
      }
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeItem = (lineId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== lineId));
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(lineId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === lineId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = (subtotal * collectionDiscountPercent) / 100;
  const total = Math.max(0, subtotal - discount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        discount,
        total,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        collectionDiscountPercent,
        setCollectionDiscountPercent,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
