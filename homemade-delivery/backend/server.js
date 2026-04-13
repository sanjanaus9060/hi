// server.js — Main Express server for HomeMade delivery platform

const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// JSON 404 for any unmatched /api/* route — prevents Express sending HTML error pages
// which cause JSON.parse() to throw in the frontend fetch handlers
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'HomeMade Delivery API is running 🍱', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`\n🍱 HomeMade Delivery Server running at http://localhost:${PORT}`);
  console.log('   Press Ctrl+C to stop.\n');
});
