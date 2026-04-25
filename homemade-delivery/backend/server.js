// server.js — Main Express server for HomeMade delivery platform

const path = require('path');
const express = require('express');
const cors = require('cors');
const createRoutes = require('./routes');
const { getDb } = require('./db');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const frontendPath = path.join(__dirname, '../frontend');

async function startServer() {
  const db = await getDb();
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(frontendPath));

  app.use('/api', await createRoutes(db));

  // JSON 404 for any unmatched /api/* route — prevents Express sending HTML error pages
  // which cause JSON.parse() to throw in the frontend fetch handlers
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  // Serve frontend for all non-API requests
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  const server = app.listen(PORT, HOST, () => {
    console.log(`\n🍱 HomeMade Delivery Server running at http://${HOST}:${PORT}`);
    console.log(`   Open via your instance public IP or hostname on port ${PORT}.`);
    console.log('   Press Ctrl+C to stop.\n');
  });

  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n🔥 Port ${PORT} is already in use.\n` +
        `   Either stop the process using this port or set a different PORT environment variable.`);
    } else {
      console.error('\n🔥 Server error:', err.message || err);
    }
    process.exit(1);
  });
}

startServer().catch(err => {
  console.error('\n🔥 Failed to start server:', err.message || err);
  process.exit(1);
});
