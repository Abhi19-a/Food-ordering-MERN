import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000';

function App() {
  const [step, setStep] = useState('login');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [userId, setUserId] = useState(null);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (step === 'order') {
      fetch(`${API_URL}/api/items`)
        .then(res => res.json())
        .then(setItems)
        .catch(() => setMessage('Failed to load items'));
    }
  }, [step]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error('Invalid credentials');
      }
      const data = await res.json();
      setUserId(data.userId);
      setStep('order');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const addToCart = (item) => {
    setCart(prev => [...prev, item]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const placeOrder = async () => {
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items: cart, total }),
      });
      if (!res.ok) throw new Error('Failed to place order');
      const data = await res.json();
      setOrder(data);
      setStep('pay');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const payNow = async () => {
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!res.ok) throw new Error('Payment failed');
      const data = await res.json();
      setOrder(data.order);
      setMessage('Payment successful!');
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (step === 'login') {
    return (
      <div style={{ padding: 20 }}>
        <h1>Statanary Login</h1>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email: </label>
            <input value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Password: </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit">Login</button>
        </form>
        {message && <p style={{ color: 'red' }}>{message}</p>}
        <p>Use email: test@example.com, password: password</p>
      </div>
    );
  }

  if (step === 'order') {
    return (
      <div style={{ padding: 20 }}>
        <h1>Order Stationery</h1>
        {message && <p style={{ color: 'red' }}>{message}</p>}
        <h2>Items</h2>
        <ul>
          {items.map(item => (
            <li key={item.id}>
              {item.name} - ₹{item.price}{' '}
              <button onClick={() => addToCart(item)}>Add to cart</button>
            </li>
          ))}
        </ul>
        <h2>Cart</h2>
        <ul>
          {cart.map((item, index) => (
            <li key={index}>{item.name} - ₹{item.price}</li>
          ))}
        </ul>
        <p>Total: ₹{total}</p>
        <button onClick={placeOrder} disabled={cart.length === 0}>Place Order</button>
      </div>
    );
  }

  if (step === 'pay' && order) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Payment</h1>
        <p>Order ID: {order.id}</p>
        <p>Total: ₹{order.total}</p>
        <p>Status: {order.status}</p>
        <button onClick={payNow} disabled={order.status === 'PAID'}>Pay Now</button>
        {message && <p style={{ color: 'green' }}>{message}</p>}
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default App;
