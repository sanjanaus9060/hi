// script.js — HomeMade Delivery Platform Frontend Logic
// Corrected: poll cleanup on tab switch, delegated history events,
//            button-state race in admin, safe apiFetch wrapper, HTML escaping.

const API = 'http://localhost:3000/api';

// ─── State ─────────────────────────────────────────────────
let qty = 1;
let pendingOrder   = null;  // form data held between Summary and Confirm
let currentTrackId = null;  // order ID currently being polled
let pollInterval   = null;  // handle — always cleared before reassigning
let adminOrder     = null;  // order loaded in Admin panel

// ─── Utilities ─────────────────────────────────────────────

// Minimal HTML escaping for user-supplied strings inserted via innerHTML.
function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3200);
}

function setMinDate(dateEl) {
  dateEl.min = new Date().toISOString().split('T')[0];
}

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

// Safe fetch wrapper.
// Problem it solves: when the server returns an HTML error page (e.g. Express default 404),
// calling res.json() throws a SyntaxError that bypasses the catch block's showToast call.
// This wrapper always parses safely and always throws a clean Error on non-2xx.
async function apiFetch(url, options = {}) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (networkErr) {
    // fetch() itself failed — server is down or CORS blocked before response
    throw new Error('Cannot reach server. Is the backend running on port 3000?');
  }

  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { error: `Server error ${res.status}: ${text.slice(0, 160)}` };
  }

  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ─── Tab Navigation ────────────────────────────────────────
function switchTab(name) {
  // Stop polling whenever we leave the Track tab — prevents interval stacking
  if (name !== 'track') {
    clearInterval(pollInterval);
    pollInterval = null;
  }

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  document.getElementById(`tab-${name}`).classList.add('active');

  if (name === 'history') renderHistory();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
    document.getElementById('mobileMenu').classList.remove('open');
  });
});

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});

// ─── Quantity Control ──────────────────────────────────────
document.getElementById('qtyMinus').addEventListener('click', () => {
  if (qty > 1) { qty--; updateQty(); }
});
document.getElementById('qtyPlus').addEventListener('click', () => {
  if (qty < 99) { qty++; updateQty(); }
});
function updateQty() {
  document.getElementById('qtyDisplay').textContent = qty;
  document.getElementById('quantity').value = qty;
}

// ─── Form Validation ──────────────────────────────────────
function validateForm() {
  const required = ['name', 'phone', 'pickupAddress', 'deliveryAddress', 'date', 'time', 'items'];
  let valid = true;
  required.forEach(id => {
    const el = document.getElementById(id);
    const isEmpty = !el.value || !el.value.trim();
    if (isEmpty) {
      el.classList.add('error');
      // date/time pickers fire 'change', text inputs fire 'input'
      el.addEventListener('input',  () => el.classList.remove('error'), { once: true });
      el.addEventListener('change', () => el.classList.remove('error'), { once: true });
      valid = false;
    }
  });
  if (!valid) showToast('Please fill in all required fields.', 'error');
  return valid;
}

// ─── Form Submit → Show Summary ────────────────────────────
document.getElementById('orderForm').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateForm()) return;

  // Build payload — field names match backend POST /api/order exactly
  pendingOrder = {
    name:            document.getElementById('name').value.trim(),
    phone:           document.getElementById('phone').value.trim(),
    pickupAddress:   document.getElementById('pickupAddress').value.trim(),
    deliveryAddress: document.getElementById('deliveryAddress').value.trim(),
    date:            document.getElementById('date').value,           // "YYYY-MM-DD"
    time:            document.getElementById('time').value,           // "HH:MM"
    items:           document.getElementById('items').value.trim(),
    quantity:        qty,
    notes:           document.getElementById('notes').value.trim()
  };

  showSummary(pendingOrder);
});

// ─── Order Summary ─────────────────────────────────────────
function showSummary(order) {
  document.getElementById('orderFormCard').classList.add('hidden');
  document.getElementById('summaryCard').classList.remove('hidden');

  const fields = [
    { label: 'Name',             value: escHtml(order.name) },
    { label: 'Phone',            value: escHtml(order.phone) },
    { label: 'Food Items',       value: escHtml(order.items) },
    { label: 'Quantity',         value: order.quantity },
    { label: 'Date',             value: formatDate(order.date) },
    { label: 'Time',             value: escHtml(order.time) },
    { label: 'Pickup Address',   value: escHtml(order.pickupAddress) },
    { label: 'Delivery Address', value: escHtml(order.deliveryAddress) },
    { label: 'Notes',            value: escHtml(order.notes) || '—' }
  ];

  // 9 items — last one gets full-width class so the 2-col grid doesn't leave a gap
  const html = `<div class="summary-content-row">${
    fields.map((f, i) => {
      const fullWidth = (i === fields.length - 1) && (fields.length % 2 !== 0) ? ' full-width' : '';
      return `
        <div class="summary-item${fullWidth}">
          <div class="label">${f.label}</div>
          <div class="value">${f.value}</div>
        </div>`;
    }).join('')
  }</div>`;

  document.getElementById('summaryContent').innerHTML = html;
  document.getElementById('sumItemsCost').textContent = '₹0 (homemade)';
  document.getElementById('sumTotal').textContent = '₹30';
}

// ─── Edit Button ───────────────────────────────────────────
document.getElementById('editBtn').addEventListener('click', () => {
  document.getElementById('summaryCard').classList.add('hidden');
  document.getElementById('orderFormCard').classList.remove('hidden');
});

// ─── Confirm & Place Order ─────────────────────────────────
document.getElementById('confirmBtn').addEventListener('click', async () => {
  if (!pendingOrder) return;
  const btn = document.getElementById('confirmBtn');
  btn.disabled = true;
  btn.textContent = 'Placing…';

  try {
    // POST body field names verified against backend routes.js destructuring:
    // { name, phone, pickupAddress, deliveryAddress, date, time, items, quantity, notes }
    const data = await apiFetch(`${API}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pendingOrder)
    });

    const order = data.order;
    saveToHistory(order);
    showToast(`✅ Order ${order.id} placed!`, 'success');

    document.getElementById('trackId').value = order.id;

    // Reset form
    document.getElementById('orderForm').reset();
    qty = 1;
    updateQty();
    document.getElementById('summaryCard').classList.add('hidden');
    document.getElementById('orderFormCard').classList.remove('hidden');
    pendingOrder = null;

    setTimeout(() => {
      switchTab('track');
      loadTrackOrder(order.id);
    }, 900);

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    // Always restore button — regardless of success/failure outcome
    btn.disabled = false;
    btn.textContent = '✅ Confirm Order';
  }
});

// ─── Track Order ───────────────────────────────────────────
document.getElementById('trackBtn').addEventListener('click', () => {
  const id = document.getElementById('trackId').value.trim().toUpperCase();
  if (!id) { showToast('Enter an order ID.', 'error'); return; }
  loadTrackOrder(id);
});

// Enter key shortcut in track input
document.getElementById('trackId').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('trackBtn').click();
});

async function loadTrackOrder(id) {
  try {
    const data = await apiFetch(`${API}/order/${id}`);
    renderTrackCard(data.order);

    // Clear any prior poll before starting a new one — prevents stacking intervals
    clearInterval(pollInterval);
    currentTrackId = id;
    pollInterval = setInterval(async () => {
      try {
        const d = await apiFetch(`${API}/order/${currentTrackId}`);
        renderTrackCard(d.order);
        // Auto-stop when delivered — no point continuing to poll
        if (d.order.statusIndex >= 4) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      } catch (_) { /* network blip — keep polling */ }
    }, 5000);

  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderTrackCard(order) {
  document.getElementById('trackResult').classList.remove('hidden');
  document.getElementById('trackOrderId').textContent = `Order ${order.id}`;
  document.getElementById('trackCustomer').textContent = `${order.name} · ${order.phone}`;

  const badge = document.getElementById('trackBadge');
  badge.textContent = order.status;
  badge.className = `status-badge${order.statusIndex >= 4 ? ' delivered' : ''}`;

  updateSteps('stepsRow', 'stepsLineFill', order.statusIndex);

  // All keys below are present on every order object returned by the backend
  document.getElementById('trackDetails').innerHTML = `
    <div class="track-detail-item"><div class="label">Food Items</div><div class="value">${escHtml(order.items)}</div></div>
    <div class="track-detail-item"><div class="label">Quantity</div><div class="value">${order.quantity}</div></div>
    <div class="track-detail-item"><div class="label">Pickup</div><div class="value">${escHtml(order.pickupAddress)}</div></div>
    <div class="track-detail-item"><div class="label">Delivery</div><div class="value">${escHtml(order.deliveryAddress)}</div></div>
    <div class="track-detail-item"><div class="label">Date &amp; Time</div><div class="value">${formatDate(order.date)} at ${escHtml(order.time)}</div></div>
    <div class="track-detail-item"><div class="label">Delivery Charge</div><div class="value">₹${order.deliveryCharge}</div></div>
  `;
}

// ─── Step Progress Bar ────────────────────────────────────
function updateSteps(rowId, fillId, statusIndex) {
  const steps = document.querySelectorAll(`#${rowId} .step`);
  const fill  = document.getElementById(fillId);
  const pct   = statusIndex === 0 ? 0 : (statusIndex / (steps.length - 1)) * 100;
  fill.style.width = `${pct}%`;
  steps.forEach((s, i) => {
    s.classList.remove('done', 'active');
    if (i < statusIndex)       s.classList.add('done');
    else if (i === statusIndex) s.classList.add('active');
  });
}

// ─── Admin Panel ───────────────────────────────────────────
document.getElementById('adminLoadBtn').addEventListener('click', async () => {
  const id = document.getElementById('adminId').value.trim().toUpperCase();
  if (!id) { showToast('Enter an order ID.', 'error'); return; }
  await loadAdminOrder(id);
});

document.getElementById('adminId').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('adminLoadBtn').click();
});

async function loadAdminOrder(id) {
  try {
    const data = await apiFetch(`${API}/order/${id}`);
    adminOrder = data.order;
    renderAdminPanel(adminOrder);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

const STATUS_STEPS = ['Order Placed', 'Pickup Scheduled', 'Picked Up', 'Out for Delivery', 'Delivered'];

function renderAdminPanel(order) {
  document.getElementById('adminPanel').classList.remove('hidden');
  document.getElementById('adminOrderId').textContent = `Order ${order.id}`;
  document.getElementById('adminCustomer').textContent = `${order.name} · ${order.phone}`;

  const badge = document.getElementById('adminBadge');
  badge.textContent = order.status;
  badge.className = `status-badge${order.statusIndex >= 4 ? ' delivered' : ''}`;

  updateSteps('adminStepsRow', 'adminLineFill', order.statusIndex);

  const msg     = document.getElementById('adminMsg');
  const nextBtn = document.getElementById('nextStatusBtn');
  const done    = order.statusIndex >= STATUS_STEPS.length - 1;

  nextBtn.disabled = done;
  msg.textContent  = done
    ? '🎉 Order has been delivered!'
    : `Next step: "${STATUS_STEPS[order.statusIndex + 1]}"`;
}

document.getElementById('nextStatusBtn').addEventListener('click', async () => {
  if (!adminOrder) return;
  const btn = document.getElementById('nextStatusBtn');
  btn.disabled = true;
  btn.textContent = 'Updating…';

  try {
    const data = await apiFetch(`${API}/order/${adminOrder.id}/status`, { method: 'PUT' });
    adminOrder = data.order;
    renderAdminPanel(adminOrder);                              // sets btn.disabled correctly
    updateHistoryStatus(adminOrder.id, adminOrder.status, adminOrder.statusIndex);
    showToast(`Status → ${adminOrder.status}`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
    // Re-enable only on error — renderAdminPanel handles the delivered-disabling case
    btn.disabled = false;
  } finally {
    // Always restore label — fixes race where catch ran but label stayed "Updating…"
    btn.textContent = '▶ Advance to Next Status';
  }
});

// ─── LocalStorage History ──────────────────────────────────
function saveToHistory(order) {
  const history = getHistory().filter(o => o.id !== order.id); // dedupe
  history.unshift(order);
  try {
    localStorage.setItem('hm_orders', JSON.stringify(history.slice(0, 50)));
  } catch (_) { /* storage quota exceeded — non-fatal */ }
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem('hm_orders')) || []; }
  catch { return []; }
}

function updateHistoryStatus(id, status, statusIndex) {
  const history = getHistory();
  const idx = history.findIndex(o => o.id === id);
  if (idx !== -1) {
    history[idx].status = status;
    history[idx].statusIndex = statusIndex;
    try { localStorage.setItem('hm_orders', JSON.stringify(history)); } catch (_) {}
  }
}

// ─── History Tab ──────────────────────────────────────────
function renderHistory() {
  const list    = document.getElementById('historyList');
  const history = getHistory();

  if (!history.length) {
    list.innerHTML = `<div class="empty-state"><span>🍱</span><p>No orders yet. Place your first order!</p></div>`;
    return;
  }

  // data-track-id replaces inline onclick — avoids string injection risk
  list.innerHTML = history.map(o => `
    <div class="history-card">
      <div>
        <div class="history-id">${escHtml(o.id)}</div>
        <div class="history-meta">${escHtml(o.items)} · Qty ${o.quantity}</div>
        <div class="history-meta">${formatDate(o.date)} at ${escHtml(o.time)}</div>
      </div>
      <div class="history-right">
        <span class="status-badge${(o.statusIndex || 0) >= 4 ? ' delivered' : ''}">${escHtml(o.status)}</span>
        <button class="btn btn-outline btn-sm" data-track-id="${escHtml(o.id)}">Track →</button>
      </div>
    </div>
  `).join('');
}

// Single delegated listener — safe replacement for inline onclick="trackFromHistory(...)"
document.getElementById('historyList').addEventListener('click', e => {
  const btn = e.target.closest('[data-track-id]');
  if (!btn) return;
  document.getElementById('trackId').value = btn.dataset.trackId;
  switchTab('track');
  loadTrackOrder(btn.dataset.trackId);
});

// ─── Init ──────────────────────────────────────────────────
setMinDate(document.getElementById('date'));
