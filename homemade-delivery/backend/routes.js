// routes.js — REST API routes for HomeMade Delivery

const express = require('express');

const STATUS_STEPS = [
  'Order Placed',
  'Pickup Scheduled',
  'Picked Up',
  'Out for Delivery',
  'Delivered'
];

module.exports = async function createRoutes(db) {
  const router = express.Router();
  const useMongo = Boolean(db);
  let ordersCollection = null;
  let inMemoryOrders = [];
  let nextNumber = 1000;

  if (useMongo) {
    ordersCollection = db.collection('orders');
    await ordersCollection.createIndex({ id: 1 }, { unique: true });
    await ordersCollection.createIndex({ number: 1 }, { unique: true });
    await seedInitialOrderMongo(ordersCollection);
  } else {
    seedInitialOrderMemory(inMemoryOrders);
    nextNumber = 1001;
  }

  // ─────────────────────────────────────────
  // POST /api/order — Create a new order
  // ─────────────────────────────────────────
  router.post('/order', async (req, res) => {
    const { name, phone, pickupAddress, deliveryAddress, date, time, items, quantity, notes } = req.body;

    if (!name || !phone || !pickupAddress || !deliveryAddress || !date || !time || !items) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    let orderNumber;
    if (useMongo) {
      const lastOrder = await ordersCollection.find().sort({ number: -1 }).limit(1).toArray();
      orderNumber = lastOrder.length ? lastOrder[0].number + 1 : 1000;
    } else {
      orderNumber = nextNumber++;
    }

    const order = {
      id: `HM-${orderNumber}`,
      number: orderNumber,
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

    if (useMongo) {
      await ordersCollection.insertOne(order);
    } else {
      inMemoryOrders.push(order);
    }

    res.status(201).json({ success: true, order });
  });

  // ─────────────────────────────────────────
  // GET /api/orders — Get all orders
  // ─────────────────────────────────────────
  router.get('/orders', async (req, res) => {
    if (useMongo) {
      const allOrders = await ordersCollection.find().sort({ createdAt: -1 }).toArray();
      return res.json({ success: true, orders: allOrders });
    }

    return res.json({ success: true, orders: [...inMemoryOrders].reverse() });
  });

  // ─────────────────────────────────────────
  // GET /api/order/:id — Get a specific order
  // ─────────────────────────────────────────
  router.get('/order/:id', async (req, res) => {
    const order = useMongo
      ? await ordersCollection.findOne({ id: req.params.id })
      : inMemoryOrders.find(o => o.id === req.params.id);

    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json({ success: true, order });
  });

  // ─────────────────────────────────────────
  // PUT /api/order/:id/status — Update order status
  // ─────────────────────────────────────────
  router.put('/order/:id/status', async (req, res) => {
    const existingOrder = useMongo
      ? await ordersCollection.findOne({ id: req.params.id })
      : inMemoryOrders.find(o => o.id === req.params.id);

    if (!existingOrder) return res.status(404).json({ error: 'Order not found.' });

    const nextIndex = existingOrder.statusIndex + 1;
    if (nextIndex >= STATUS_STEPS.length) {
      return res.status(400).json({ error: 'Order is already delivered.' });
    }

    if (useMongo) {
      const updated = await ordersCollection.findOneAndUpdate(
        { id: req.params.id },
        {
          $set: {
            statusIndex: nextIndex,
            status: STATUS_STEPS[nextIndex],
            updatedAt: new Date().toISOString()
          }
        },
        { returnDocument: 'after' }
      );
      return res.json({ success: true, order: updated.value });
    }

    existingOrder.statusIndex = nextIndex;
    existingOrder.status = STATUS_STEPS[nextIndex];
    existingOrder.updatedAt = new Date().toISOString();
    return res.json({ success: true, order: existingOrder });
  });

  return router;
};

async function seedInitialOrderMongo(orders) {
  const count = await orders.countDocuments();
  if (count > 0) return;

  await orders.insertOne({
    id: 'HM-1000',
    number: 1000,
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
}

function seedInitialOrderMemory(inMemoryOrders) {
  inMemoryOrders.push({
    id: 'HM-1000',
    number: 1000,
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
}
