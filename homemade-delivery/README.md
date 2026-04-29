# 🍱 HomeMade — Food Pickup & Delivery Platform

Home-to-home food delivery prototype. Full-stack: Express backend + vanilla JS frontend.

---

## ▶️ Running Locally (Windows / Mac / Linux)

### Step 1 — Install dependencies

```bash
cd backend
npm install
```

### Step 2 — Configure MongoDB Atlas (optional)

If you have a MongoDB Atlas cluster, set the Atlas connection string in `MONGODB_URI` before starting the server. Example:

```powershell
$env:MONGODB_URI='your-atlas-connection-string'
```

If you do not set `MONGODB_URI`, the app will still run using an in-memory store for orders. In-memory mode is fine for testing, but the data will be lost when the server restarts.

```powershell
npm start
```

On macOS/Linux:

```bash
export MONGODB_URI='your-atlas-connection-string'
npm start
```

If you prefer, you can also use a `.env` helper in your shell.

### Step 3 — Start the server

If port `3000` is already in use, set a different port before starting:

```bash
export PORT=3001
npm start
```

On Windows PowerShell:

```powershell
$env:PORT='3001'
npm start
```

You'll see:
```
🍱 HomeMade Delivery Server running at http://localhost:3000
```

### Step 3 — Open the app

Open `http://localhost:3000` in your browser.

> The backend now serves the frontend directly, so the app works from the same origin and you do not need to open `frontend/index.html` manually.

---

## ☁️ Deploy on AWS EC2 by public IP

### 1 — Launch an EC2 instance
- Use Amazon Linux 2023 or Ubuntu 22.04
- Allow inbound traffic for port `22` (SSH) and port `3000` (HTTP)
- Optionally attach an Elastic IP for a stable address

### 2 — SSH into the instance
```bash
ssh -i /path/to/key.pem ec2-user@PUBLIC_IP
```
For Ubuntu:
```bash
ssh -i /path/to/key.pem ubuntu@PUBLIC_IP
```

### 3 — Install Node.js and Git
Amazon Linux:
```bash
sudo yum update -y
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs git
```
Ubuntu:
```bash
sudo apt update
sudo apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4 — Clone and install the app
```bash
cd /home/ec2-user
git clone <your-repo-url> homemade-delivery
cd homemade-delivery/backend
npm install
```

### 5 — Set MongoDB Atlas URI and port
```bash
export MONGODB_URI='your-atlas-connection-string'
export PORT=3000
export HOST=0.0.0.0
npm start
```

### 6 — Open via public IP
Open in browser:
- `http://PUBLIC_IP:3000`

### 7 — Run it as a service
For production, use a process manager like `pm2` or `systemd` so the server keeps running after logout.

### Notes
- You do not need local MongoDB installed on the EC2 instance if you use Atlas.
- If you want to use port `80`, set up `nginx` as a reverse proxy to forward traffic to `localhost:3000`.
---

## 📁 Project Structure

```
/
├── package.json            ← Root convenience scripts
├── README.md
├── backend/
│   ├── server.js           ← Express app (port 3000)
│   ├── routes.js           ← All REST endpoints + seed data
│   └── package.json        ← Backend deps (express, cors) + devDep (nodemon)
└── frontend/
    ├── index.html          ← Single-page app (4 tabs)
    ├── styles.css          ← All styles
    └── script.js           ← All logic, API calls, localStorage
```

---

## 🔌 REST API Contract

| Method | Endpoint                | Body / Params                          | Response                        |
|--------|-------------------------|----------------------------------------|---------------------------------|
| POST   | `/api/order`            | JSON: name, phone, pickupAddress, deliveryAddress, date, time, items, quantity, notes | `{ success, order }` |
| GET    | `/api/orders`           | —                                      | `{ success, orders[] }`         |
| GET    | `/api/order/:id`        | id e.g. `HM-1000`                     | `{ success, order }`            |
| PUT    | `/api/order/:id/status` | —                                      | `{ success, order }` (advanced) |

All error responses: `{ error: "message" }` with appropriate HTTP status.

---

## 📦 Order Object Shape

```json
{
  "id": "HM-1000",
  "name": "Priya Sharma",
  "phone": "9876543210",
  "pickupAddress": "12 MG Road, Bengaluru",
  "deliveryAddress": "45 Koramangala, Bengaluru",
  "date": "2025-07-15",
  "time": "12:30",
  "items": "Dal Makhani, Roti, Raita",
  "quantity": 2,
  "notes": "No onions please",
  "status": "Pickup Scheduled",
  "statusIndex": 1,
  "deliveryCharge": 30,
  "createdAt": "2025-07-15T06:20:00.000Z"
}
```

---

## 🧭 Feature Summary

| Tab          | What it does                                                              |
|--------------|---------------------------------------------------------------------------|
| Place Order  | Form with validation, +/− quantity, date/time picker, notes               |
| Order Summary| Review details + ₹30 delivery charge before confirming                   |
| Track Order  | 5-step progress bar, auto-polls every 5 s, stops when Delivered           |
| Admin/Driver | Load any order ID → advance status one step at a time                    |
| My Orders    | localStorage history, one-click track button per order                    |

**Seed order** `HM-1000` is pre-loaded so Admin and Track work immediately on first launch.

---

## 🐛 Known Limitations (prototype scope)

- Orders are in-memory only — restart clears all orders (except HM-1000 seed)
- No authentication on Admin panel
- Delivery charge is fixed at ₹30 regardless of distance
- Map is a placeholder — no real geolocation
Testing Jenkins webhook final
