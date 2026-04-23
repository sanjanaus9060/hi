# 🍱 HomeMade — Food Pickup & Delivery Platform

Home-to-home food delivery prototype. Full-stack: Express backend + vanilla JS frontend.

---

## ▶️ Running Locally (Windows / Mac / Linux)

### Step 1 — Install dependencies

```bash
cd backend
npm install
```

### Step 2 — Start the server

```bash
npm start
```

You'll see:
```
🍱 HomeMade Delivery Server running at http://localhost:3000
```

### Step 3 — Open the frontend

Open `frontend/index.html` in your browser (double-click, or drag into Chrome/Edge/Firefox).

> The backend **must** be running on port 3000 before you open the frontend.

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
