import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { api } from '../api';
import './OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    // Check if coming from successful Stripe payment
    const isSuccess = searchParams.get('success') === 'true';
    const pendingOrderId = localStorage.getItem('pendingOrderId');

    if (isSuccess && pendingOrderId) {
      // Clear cart and show success message
      clearCart();
      setSuccessMessage(`Payment successful! Order ID: ${pendingOrderId}`);
      localStorage.removeItem('pendingOrderId');

      // Save order to local storage
      const newOrder = {
        orderId: pendingOrderId,
        date: new Date().toISOString(),
        items: JSON.parse(localStorage.getItem('lastCartItems') || '[]'),
        total: parseFloat(localStorage.getItem('lastCartTotal') || '0'),
        status: 'Paid'
      };

      try {
        const savedOrders = localStorage.getItem('foodOrders');
        const existingOrders = savedOrders ? JSON.parse(savedOrders) : [];
        existingOrders.push(newOrder);
        localStorage.setItem('foodOrders', JSON.stringify(existingOrders));
      } catch (error) {
        console.error('Error saving order:', error);
      }

      // Clear URL params
      window.history.replaceState({}, '', '/orders');
    }

    // Load orders from localStorage
    try {
      const savedOrders = localStorage.getItem('foodOrders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        // Sort by date (newest first)
        const sortedOrders = parsedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, [searchParams, clearCart]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return '#22c55e';
      case 'Delivered':
        return '#22c55e';
      case 'Out for Delivery':
        return '#3b82f6';
      case 'Preparing':
        return '#f59e0b';
      case 'Pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <h1>My Orders</h1>
        {successMessage && (
          <div style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ✅ {successMessage}
          </div>
        )}
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Your order history will appear here once you place an order.</p>
          <Link to="/" style={{
            display: 'inline-block',
            marginTop: '16px',
            padding: '12px 24px',
            background: '#ff6b6b',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none'
          }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders ({orders.length})</h1>

      {successMessage && (
        <div style={{
          background: '#dcfce7',
          color: '#166534',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          ✅ {successMessage}
        </div>
      )}

      <div className="orders-list">
        {orders.map((order, index) => (
          <div key={index} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order.orderId || `ORD-${String(index + 1).padStart(4, '0')}`}</h3>
                <p className="order-date">
                  {new Date(order.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="order-status" style={{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}>
                <span className="status-dot" style={{ backgroundColor: getStatusColor(order.status) }}></span>
                {order.status || 'Pending'}
              </div>
            </div>

            <div className="order-items">
              {order.items && order.items.map((item, itemIndex) => (
                <div key={itemIndex} className="order-item">
                  <img
                    src={item.imageUrl || '/placeholder-food.jpg'}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-food.jpg';
                    }}
                  />
                  <div className="order-item-details">
                    <h4>{item.name}</h4>
                    <p>{item.category}</p>
                    <p className="order-item-quantity">Quantity: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <div className="order-item-total">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-total">
                <span>Total Amount:</span>
                <span className="total-amount">₹{order.total?.toFixed(2) || '0.00'}</span>
              </div>
              {order.deliveryAddress && (
                <div className="order-address">
                  <strong>Delivery Address:</strong> {order.deliveryAddress}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
