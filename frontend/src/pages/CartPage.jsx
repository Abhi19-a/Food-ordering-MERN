import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { api } from '../api';
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
  const [paymentError, setPaymentError] = useState(null);
  const [searchParams] = useSearchParams();

  // Check for cancelled payment
  useEffect(() => {
    if (searchParams.get('cancelled') === 'true') {
      setPaymentError('Payment was cancelled. Your cart items are still saved.');
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create Stripe Checkout session
      const sessionData = await api.createCheckoutSession(
        cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
          imageUrl: item.imageUrl
        }))
      );

      if (sessionData.success && sessionData.url) {
        // Save order ID for reference
        localStorage.setItem('pendingOrderId', sessionData.orderId);

        // Redirect to Stripe Checkout
        window.location.href = sessionData.url;
      } else {
        throw new Error('Failed to create checkout session');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentError(error.message || 'Failed to initiate payment. Please try again.');
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

          {paymentError && (
            <div className="payment-error" style={{
              color: '#ef4444',
              background: '#fef2f2',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {paymentError}
            </div>
          )}

          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={isProcessing}
            style={{
              opacity: isProcessing ? 0.7 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? 'Redirecting to Stripe...' : 'Pay with Stripe'}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '12px',
            color: '#666',
            fontSize: '13px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure payment powered by Stripe
          </div>

          <Link to="/" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
