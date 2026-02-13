const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory "database"
let users = [{ id: 1, email: 'test@example.com', password: 'password' }];
let items = [
  { id: 1, name: 'Pen', price: 10 },
  { id: 2, name: 'Notebook', price: 50 },
  { id: 3, name: 'Pencil', price: 5 },
];
let orders = [];

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ message: 'Login successful', userId: user.id });
});

app.get('/api/items', (req, res) => {
  res.json(items);
});

app.post('/api/orders', (req, res) => {
  const { userId, items: orderItems, total } = req.body;
  const newOrder = {
    id: orders.length + 1,
    userId,
    items: orderItems,
    total,
    status: 'PENDING',
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.post('/api/pay', (req, res) => {
  const { orderId } = req.body;
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  order.status = 'PAID';
  res.json({ message: 'Payment successful', order });
});

app.get('/', (req, res) => {
  res.send('Statanary API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
