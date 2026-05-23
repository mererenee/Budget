// ─── Storage ──────────────────────────────────────────────────────────────────
// All app state is persisted to localStorage under namespaced keys.
// Call Storage.load() on startup; individual save* methods on mutation.

const Storage = (() => {
  const KEY_TXNS    = 'knb_txns';
  const KEY_GOALS   = 'knb_goals';
  const KEY_DEBTS   = 'knb_debts';
  const KEY_INVS    = 'knb_investments';
  const KEY_PROJS   = 'knb_projects';
  const KEY_RULES   = 'knb_rules';
  const KEY_BUD     = 'knb_budget';
  const KEY_SKI     = 'knb_skeleton';
  const KEY_DTDI    = 'knb_dtd';

  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) { console.warn('Storage full?', e); }
  }
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(e) { return fallback; }
  }

  return {
    // ── Transactions ────────────────────────────────────────────────────────
    saveTxns:    ()  => save(KEY_TXNS,  window.TXNS),
    loadTxns:    ()  => load(KEY_TXNS,  {}),

    // ── Goals ───────────────────────────────────────────────────────────────
    saveGoals:   ()  => save(KEY_GOALS,  window.GOALS),
    loadGoals:   ()  => load(KEY_GOALS, [
      { name:'Emergency Fund',  current:8500,  target:6000  },
      { name:'2-Month Buffer',  current:0,     target:24000 },
      { name:'Wedding',         current:0,     target:6000  },
      { name:'New Car Down',    current:0,     target:10000 },
      { name:'Childbirth',      current:0,     target:5000  },
      { name:'Furniture',       current:0,     target:5000  },
    ]),

    // ── Debts ────────────────────────────────────────────────────────────────
    saveDebts:   ()  => save(KEY_DEBTS,  window.DEBTS),
    loadDebts:   ()  => load(KEY_DEBTS, [
      { name:'Credit Card (Freedom)', balance:6493.26, min:130,    rate:19.99 },
      { name:'Mohela',                balance:3590,    min:224.48, rate:5.5   },
      { name:'Sallie Mae',            balance:8200,    min:154.45, rate:6.8   },
      { name:'Nelnet',                balance:24000,   min:448.13, rate:6.54  },
      { name:'Killian Hospital',      balance:0,       min:0,      rate:0     },
      { name:'Meredith Hospital',     balance:0,       min:0,      rate:0     },
    ]),

    // ── Investments ──────────────────────────────────────────────────────────
    saveInvs:    ()  => save(KEY_INVS,  window.INVS),
    loadInvs:    ()  => load(KEY_INVS, [
      { name:'Taxable Brokerage', balance:0, contrib:0, type:'Taxable Brokerage'   },
      { name:'401k / Retirement', balance:0, contrib:0, type:'Retirement (401k/IRA)'},
      { name:'Roth IRA',          balance:0, contrib:0, type:'Retirement (401k/IRA)'},
      { name:'Cryptocurrency',    balance:0, contrib:0, type:'Cryptocurrency'       },
    ]),

    // ── House Projects ───────────────────────────────────────────────────────
    saveProjs:   ()  => save(KEY_PROJS, window.PROJS),
    loadProjs:   ()  => load(KEY_PROJS, [
      { name:'Shower Door',           vendor:'', quote:0, budgeted:0, saved:0, timeline:'2026' },
      { name:'Gutters',               vendor:'', quote:0, budgeted:0, saved:0, timeline:'2026' },
      { name:'Fence',                 vendor:'', quote:0, budgeted:0, saved:0, timeline:'2026' },
      { name:'Dining Furniture',      vendor:'', quote:0, budgeted:0, saved:0, timeline:'2026' },
      { name:'Barstools',             vendor:'', quote:0, budgeted:0, saved:0, timeline:'2026' },
      { name:'Living Room Furniture', vendor:'', quote:0, budgeted:0, saved:0, timeline:'2026' },
      { name:'Office Furniture',      vendor:'', quote:0, budgeted:0, saved:0, timeline:'2026' },
    ]),

    // ── Rules ────────────────────────────────────────────────────────────────
    // Merge saved learned/custom rules on top of built-in defaults
    saveRules: () => {
      const userRules = RULES.filter(r => r.src !== 'built-in');
      save(KEY_RULES, userRules);
    },
    loadRules: () => {
      const saved = load(KEY_RULES, []);
      // Prepend user rules (learned/custom) before built-ins
      const builtIn = RULES.filter(r => r.src === 'built-in');
      RULES = [...saved, ...builtIn];
    },

    // ── Budget / Line Items ──────────────────────────────────────────────────
    saveBudget: () => { save(KEY_BUD, window.BUD); save(KEY_SKI, window.SKI); save(KEY_DTDI, window.DTDI); },
    loadBudget: () => {
      const savedBud  = load(KEY_BUD,  null);
      const savedSki  = load(KEY_SKI,  null);
      const savedDtdi = load(KEY_DTDI, null);
      if (savedBud)  Object.assign(window.BUD,  savedBud);
      if (savedSki)  Object.assign(window.SKI,  savedSki);
      if (savedDtdi) Object.assign(window.DTDI, savedDtdi);
    },

    // ── Full Load ────────────────────────────────────────────────────────────
    load() {
      window.TXNS  = this.loadTxns();
      window.GOALS = this.loadGoals();
      window.DEBTS = this.loadDebts();
      window.INVS  = this.loadInvs();
      window.PROJS = this.loadProjs();
      this.loadRules();
      this.loadBudget();
    },

    // ── Year-End Purge ───────────────────────────────────────────────────────
    // Wipes all transaction data and resets budget actuals for the new year.
    // Should only be called AFTER confirming export to Google Sheets.
    purgeYear() {
      window.TXNS = {};
      MONTHS.forEach(m => {
        if (window.BUD[m]) { window.BUD[m].income = 0; window.BUD[m].sk = 0; window.BUD[m].dtd = 0; window.BUD[m].cal = 0; window.BUD[m].nm = 0; }
        if (window.SKI[m])  window.SKI[m].forEach(i  => i.a = 0);
        if (window.DTDI[m]) window.DTDI[m].forEach(i => i.a = 0);
      });
      this.saveTxns();
      this.saveBudget();
      toast('Year purged. Starting fresh for new year.', 'ok');
    },

    // ── Export full snapshot as JSON (download) ──────────────────────────────
    exportJSON() {
      const snapshot = {
        exportedAt: new Date().toISOString(),
        year: new Date().getFullYear(),
        transactions: window.TXNS,
        goals:        window.GOALS,
        debts:        window.DEBTS,
        investments:  window.INVS,
        projects:     window.PROJS,
        budget:       window.BUD,
        rules:        RULES.filter(r => r.src !== 'built-in'),
      };
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `kline-nall-budget-${snapshot.year}-backup.json`; a.click();
      URL.revokeObjectURL(url);
      toast('JSON backup downloaded.', 'ok');
    },
  };
})();
