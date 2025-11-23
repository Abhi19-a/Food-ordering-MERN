import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
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
            onClick={() => {
              const order = {
                orderId: `ORD-${Date.now()}`,
                date: new Date().toISOString(),
                items: cart,
                total: totalPrice,
                status: 'Preparing'
              };
              try {
                const existingOrders = localStorage.getItem('foodOrders');
                const orders = existingOrders ? JSON.parse(existingOrders) : [];
                orders.push(order);
                localStorage.setItem('foodOrders', JSON.stringify(orders));
                clearCart();
                alert(`Order placed successfully! Order ID: ${order.orderId}`);
                window.location.href = '/orders';
              } catch (error) {
                console.error('Error saving order:', error);
                alert('Error placing order. Please try again.');
              }
            }}
          >
            Proceed to Checkout
          </button>
          
          <Link to="/" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
