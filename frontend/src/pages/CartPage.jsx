import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useCart } from '../contexts/CartContext';
import PaymentModal from '../components/PaymentModal';
import './CartPage.css';

const CartPage = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart
  } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentInfo) => {
    setIsProcessing(true);

    try {
      // Create order ID
      const orderId = `ORD-${Date.now()}`;

      // Create order object with customer details
      const newOrder = {
        orderId,
        items: cart,
        amount: totalPrice,
        currency: 'INR',
        status: paymentInfo.status,
        paymentMethod: paymentInfo.method,
        transactionId: paymentInfo.transactionId,
        customerEmail: user?.primaryEmailAddress?.emailAddress || 'guest@example.com',
        customerName: user?.fullName || 'Guest User',
        customerPhone: user?.phoneNumbers?.[0]?.phoneNumber || 'N/A'
      };

      // Send order to backend API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const savedOrder = await response.json();

      // Also save to localStorage as backup
      const savedOrders = localStorage.getItem('foodOrders');
      const existingOrders = savedOrders ? JSON.parse(savedOrders) : [];
      existingOrders.push({
        ...savedOrder,
        date: new Date().toISOString()
      });
      localStorage.setItem('foodOrders', JSON.stringify(existingOrders));

      // Clear cart
      clearCart();

      // Close modal
      setShowPaymentModal(false);

      // Navigate to orders page with success message
      navigate(`/orders?success=true&orderId=${orderId}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <Link to="/" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h1>
        <button onClick={clearCart} className="clear-cart">
          Clear Cart
        </button>
      </div>

      <div className="cart-container">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                <img
                  src={item.imageUrl || '/placeholder-food.jpg'}
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-food.jpg';
                  }}
                />
              </div>

              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-category">{item.category}</p>
                <p className="item-price">₹{item.price} each</p>

                <div className="quantity-section">
                  <div className="quantity-label">Quantity:</div>
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      −
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  <div className="quantity-total">
                    {item.quantity} × ₹{item.price} = ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="remove-item"
                >
                  Remove
                </button>
              </div>

              <div className="item-total">
                <div className="item-total-label">Total</div>
                <div className="item-total-amount">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal ({totalItems} items):</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee:</span>
            <span>Free</span>
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>

          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={isProcessing}
            style={{
              opacity: isProcessing ? 0.7 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </button>

          <Link to="/" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </div>
      </div>

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPayment={handlePayment}
        totalAmount={totalPrice}
      />
    </div>
  );
};

export default CartPage;
