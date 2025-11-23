// frontend/src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

// Create a context for the cart
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  // Initialize cart state with localStorage data
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('foodCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('foodCart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Add an item to the cart
  const addToCart = (item, quantity = 1) => {
    if (!item || !item.id) {
      console.error('Invalid item added to cart:', item);
      return;
    }

    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(cartItem => 
        cartItem.id === item.id
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity,
          price: item.price || newCart[existingItemIndex].price || 0
        };
        return newCart;
      } else {
        // Add new item to cart
        return [...prevCart, { 
          ...item, 
          quantity,
          price: item.price || 0,
          name: item.name || 'Unnamed Item',
          imageUrl: item.imageUrl || '/placeholder-food.jpg',
          category: item.category || 'Uncategorized'
        }];
      }
    });
  };

  // Remove an item from the cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  // Update the quantity of an item in the cart
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Clear all items from the cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate total number of items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total price of all items in cart
  const totalPrice = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

  // Create the context value
  const contextValue = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};