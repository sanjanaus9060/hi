const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'homemade_delivery';
let client = null;
let db = null;
let mongoEnabled = false;

async function getDb() {
  if (!uri) {
    mongoEnabled = false;
    return null;
  }

  if (db) return db;
  if (!client) {
    client = new MongoClient(uri);
  }

  await client.connect();
  db = client.db(dbName);
  mongoEnabled = true;
  return db;
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    mongoEnabled = false;
  }
}

module.exports = {
  getDb,
  close,
  isMongoEnabled: () => mongoEnabled,
};
