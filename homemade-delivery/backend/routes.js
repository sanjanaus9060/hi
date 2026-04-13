// routes.js — REST API routes for HomeMade Delivery

const express = require('express');
const router = express.Router();

// In-memory store (acts as a lightweight DB for the prototype)
let orders = [];
let nextId = 1000;

// ─── Seed data — allows Admin & Track tabs to work on first launch ────────────
orders.push({
  id: 'HM-1000',
  name: 'Priya Sharma',
  phone: '9876543210',
  pickupAddress: '12 MG Road, Indiranagar, Bengaluru',
  deliveryAddress: '45 Koramangala 5th Block, Bengaluru',
  date: new Date().toISOString().split('T')[0],
  time: '12:30',
  items: 'Dal Makhani, Jeera Rice, Roti (x4), Raita',
  quantity: 2,
  notes: 'No onions please',
  status: 'Pickup Scheduled',
  statusIndex: 1,
  deliveryCharge: 30,
  createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
});
nextId = 1001; // next order starts at HM-1001

// Valid status transitions
const STATUS_STEPS = [
  'Order Placed',
  'Pickup Scheduled',
  'Picked Up',
  'Out for Delivery',
  'Delivered'
];

// ─────────────────────────────────────────
// POST /api/order — Create a new order
// ─────────────────────────────────────────
router.post('/order', (req, res) => {
  const { name, phone, pickupAddress, deliveryAddress, date, time, items, quantity, notes } = req.body;

  // Basic validation
  if (!name || !phone || !pickupAddress || !deliveryAddress || !date || !time || !items) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const order = {
    id: `HM-${nextId++}`,
    name,
    phone,
    pickupAddress,
    deliveryAddress,
    date,
    time,
    items,
    quantity: quantity || 1,
    notes: notes || '',
    status: 'Order Placed',
    statusIndex: 0,
    deliveryCharge: 30,
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  res.status(201).json({ success: true, order });
});

// ─────────────────────────────────────────
// GET /api/orders — Get all orders
// ─────────────────────────────────────────
router.get('/orders', (req, res) => {
  res.json({ success: true, orders: orders.slice().reverse() });
});

// ─────────────────────────────────────────
// GET /api/order/:id — Get a specific order
// ─────────────────────────────────────────
router.get('/order/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json({ success: true, order });
});

// ─────────────────────────────────────────
// PUT /api/order/:id/status — Update order status
// ─────────────────────────────────────────
router.put('/order/:id/status', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const nextIndex = order.statusIndex + 1;
  if (nextIndex >= STATUS_STEPS.length) {
    return res.status(400).json({ error: 'Order is already delivered.' });
  }

  order.statusIndex = nextIndex;
  order.status = STATUS_STEPS[nextIndex];
  order.updatedAt = new Date().toISOString();

  res.json({ success: true, order });
});

module.exports = router;
