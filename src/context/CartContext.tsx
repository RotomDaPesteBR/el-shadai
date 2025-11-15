'use client';

import { CartItem } from '@/types';
import { ProductType } from '@/types/products';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: ProductType, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  updateCartItemStock: (productId: number, newStock: number) => void; // New function
  isCartValid: () => boolean; // New function
  getInvalidCartItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else if (typeof window !== 'undefined' && localStorage.getItem('cart')) {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const addToCart = useCallback((product: ProductType, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          // Optionally, show a toast here or handle in the component calling addToCart
          return prevCart; // Do not add if it exceeds stock
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantity > product.stock) {
          // Optionally, show a toast here
          return prevCart; // Do not add if initial quantity exceeds stock
        }
        return [...prevCart, { ...product, quantity, stock: product.stock }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    setCart(
      prevCart =>
        prevCart
          .map(item => {
            if (item.id === productId) {
              // Ensure newQuantity does not exceed stock
              const quantityToSet = Math.min(Math.max(0, newQuantity), item.stock);
              return { ...item, quantity: quantityToSet };
            }
            return item;
          })
          .filter(item => item.quantity > 0)
    );
  }, []);

  const updateCartItemStock = useCallback((productId: number, newStock: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, stock: newStock } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const isCartValid = useCallback(() => {
    return cart.every(item => item.quantity <= item.stock);
  }, [cart]);

  const getInvalidCartItems = useCallback(() => {
    return cart.filter(item => item.quantity > item.stock);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        updateCartItemStock,
        isCartValid,
        getInvalidCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
