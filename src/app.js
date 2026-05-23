// ─── Utilities ────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null || isNaN(n)) return '$0';
  return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showMsg(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, 4000);
}

let _toastTimer;
function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show alert-${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ─── Tab Router ───────────────────────────────────────────────────────────────
const TABS = {
  dashboard: Dashboard,
  import:    Import,
  budget:    Budget,
  goals:     Goals,
  debt:      Debt,
  invest:    Invest,
  house:     House,
  rules:     RulesTab,
  sheets:    SheetsTab,
};

let _mounted = {};

function go(name) {
  // Hide all tabs, deactivate all nav buttons
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('#nav button').forEach(b => b.classList.remove('on'));

  // Show selected tab + activate nav button
  document.getElementById('tab-' + name).classList.add('on');
  document.querySelector(`#nav button[data-tab="${name}"]`).classList.add('on');

  // Mount once, then just re-render on subsequent visits
  const mod = TABS[name];
  if (!mod) return;
  if (!_mounted[name]) {
    mod.mount();
    _mounted[name] = true;
  } else if (mod.render) {
    mod.render();
  }
}

// ─── Nav wiring ───────────────────────────────────────────────────────────────
document.querySelectorAll('#nav button[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => go(btn.dataset.tab));
});

// ─── Init ─────────────────────────────────────────────────────────────────────
(function init() {
  Storage.load();
  Sheets.loadConfig();
  go('dashboard');
})();
