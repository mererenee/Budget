// ─── Google Sheets Integration ────────────────────────────────────────────────
//
// Uses the Google Sheets API v4 via OAuth 2.0 (token obtained client-side).
// Setup instructions are surfaced in the UI (Sheets tab).
//
// Flow:
//   1. User creates a Google Cloud project, enables Sheets API, creates OAuth client ID.
//   2. User pastes their Client ID and Spreadsheet ID into the Sheets tab.
//   3. App exchanges for an access token via Google's OAuth popup.
//   4. Push buttons write data to the specified sheet.
//   5. Year-end purge is gated behind a confirmed successful push.

const Sheets = (() => {
  const SCOPES   = 'https://www.googleapis.com/auth/spreadsheets';
  const DISC_URL = 'https://accounts.google.com/.well-known/openid-configuration';

  let _token       = null;
  let _clientId    = '';
  let _spreadsheetId = '';

  // ── Config persistence ─────────────────────────────────────────────────────
  function loadConfig() {
    _clientId      = localStorage.getItem('knb_goog_client_id')  || '';
    _spreadsheetId = localStorage.getItem('knb_goog_sheet_id')   || '';
    _token         = null; // tokens are session-only; re-auth each session
  }

  function saveConfig(clientId, sheetId) {
    _clientId      = clientId;
    _spreadsheetId = sheetId;
    localStorage.setItem('knb_goog_client_id', clientId);
    localStorage.setItem('knb_goog_sheet_id',  sheetId);
  }

  // ── OAuth popup ────────────────────────────────────────────────────────────
  function authorize() {
    return new Promise((resolve, reject) => {
      if (!_clientId) { reject(new Error('No Client ID configured.')); return; }

      const params = new URLSearchParams({
        client_id:     _clientId,
        redirect_uri:  'postmessage',           // for popup flow
        response_type: 'token',
        scope:         SCOPES,
        prompt:        'select_account',
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      const popup   = window.open(authUrl, 'googleAuth', 'width=500,height=620');

      const listener = (e) => {
        if (e.source !== popup) return;
        window.removeEventListener('message', listener);
        if (e.data?.access_token) { _token = e.data.access_token; resolve(_token); }
        else reject(new Error('Auth failed or was cancelled.'));
      };

      window.addEventListener('message', listener);

      // Fallback: detect popup close
      const check = setInterval(() => {
        if (popup.closed) {
          clearInterval(check);
          window.removeEventListener('message', listener);
          if (!_token) reject(new Error('Auth popup closed.'));
        }
      }, 500);
    });
  }

  // ── Low-level API call ─────────────────────────────────────────────────────
  async function sheetsRequest(method, path, body) {
    if (!_token) throw new Error('Not authorized. Click "Connect Google Account" first.');
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${_spreadsheetId}${path}`, {
      method,
      headers: { Authorization: `Bearer ${_token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // ── Ensure sheet tab exists ────────────────────────────────────────────────
  async function ensureSheet(title) {
    const meta = await sheetsRequest('GET', '');
    const exists = meta.sheets.some(s => s.properties.title === title);
    if (!exists) {
      await sheetsRequest('POST', ':batchUpdate', {
        requests: [{ addSheet: { properties: { title } } }]
      });
    }
  }

  // ── Write rows to a named range ────────────────────────────────────────────
  async function writeRows(sheetName, rows) {
    await ensureSheet(sheetName);
    // Clear existing content first
    await sheetsRequest('POST', `/values/${encodeURIComponent(sheetName)}!A1:ZZ9999:clear`, {});
    await sheetsRequest('PUT',
      `/values/${encodeURIComponent(sheetName)}!A1?valueInputOption=USER_ENTERED`,
      { values: rows }
    );
  }

  // ── Build transactions rows ────────────────────────────────────────────────
  function txnRows(year) {
    const header = ['Month','Date','Description','Category','Amount','Type','Confidence','Source'];
    const rows = [header];
    for (const [month, txns] of Object.entries(window.TXNS || {})) {
      for (const t of txns) {
        rows.push([
          month, t.date, t.desc, t.cat,
          t.type === 'expense' ? -t.amount : t.amount,
          t.type,
          t.conf ?? '',
          t.autoSrc ?? 'manual',
        ]);
      }
    }
    return rows;
  }

  // ── Build budget summary rows ──────────────────────────────────────────────
  function budgetRows(year) {
    const header = ['Month','Planned Income','Actual Income','Planned Expense','Actual Expense','Net','Savings Rate %'];
    const rows = [header];
    MONTHS.forEach(m => {
      const b = window.BUD[m] || {};
      const exp = (b.sk||0)+(b.dtd||0)+(b.cal||0)+(b.nm||0);
      const net = (b.income||0) - exp;
      const sr  = b.income > 0 ? ((net / b.income)*100).toFixed(1) : 0;
      rows.push([m, b.pI||0, b.income||0, b.pE||0, exp, net, sr]);
    });
    return rows;
  }

  // ── Build goals rows ───────────────────────────────────────────────────────
  function goalRows() {
    const header = ['Goal','Current ($)','Target ($)','Progress %'];
    const rows = [header];
    (window.GOALS || []).forEach(g => {
      const pct = g.target > 0 ? ((g.current / g.target)*100).toFixed(1) : 'N/A';
      rows.push([g.name, g.current, g.target, pct]);
    });
    return rows;
  }

  // ── Build debt rows ────────────────────────────────────────────────────────
  function debtRows() {
    const header = ['Account','Balance ($)','Min Payment ($)','APR %'];
    return [header, ...(window.DEBTS||[]).map(d => [d.name, d.balance, d.min, d.rate])];
  }

  // ── Build investment rows ──────────────────────────────────────────────────
  function investRows() {
    const header = ['Account','Type','Balance ($)','Monthly Contribution ($)'];
    return [header, ...(window.INVS||[]).map(i => [i.name, i.type, i.balance, i.contrib])];
  }

  // ── Build project rows ─────────────────────────────────────────────────────
  function projectRows() {
    const header = ['Project','Vendor','Quote ($)','Budgeted ($)','Saved ($)','Timeline'];
    return [header, ...(window.PROJS||[]).map(p => [p.name, p.vendor, p.quote, p.budgeted, p.saved, p.timeline])];
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    loadConfig,
    saveConfig,
    get clientId()      { return _clientId; },
    get spreadsheetId() { return _spreadsheetId; },
    get isAuthed()      { return !!_token; },

    async connect() {
      await authorize();
      toast('Connected to Google account.', 'ok');
    },

    // Push all data to Sheets
    async pushAll(year = new Date().getFullYear()) {
      if (!_spreadsheetId) throw new Error('No Spreadsheet ID configured.');
      const label = `${year}`;
      await Promise.all([
        writeRows(`${label}_Transactions`, txnRows(year)),
        writeRows(`${label}_Budget`,       budgetRows(year)),
        writeRows(`${label}_Goals`,        goalRows()),
        writeRows(`${label}_Debt`,         debtRows()),
        writeRows(`${label}_Investments`,  investRows()),
        writeRows(`${label}_Projects`,     projectRows()),
      ]);
      // Mark last successful push
      localStorage.setItem('knb_last_push', new Date().toISOString());
      toast('All data pushed to Google Sheets.', 'ok');
      return true;
    },

    // Push only transactions
    async pushTransactions(year = new Date().getFullYear()) {
      if (!_spreadsheetId) throw new Error('No Spreadsheet ID configured.');
      await writeRows(`${year}_Transactions`, txnRows(year));
      localStorage.setItem('knb_last_push', new Date().toISOString());
      toast('Transactions pushed to Google Sheets.', 'ok');
    },

    get lastPush() {
      const ts = localStorage.getItem('knb_last_push');
      return ts ? new Date(ts) : null;
    },

    // Year-end: push everything, confirm, then purge
    async yearEndExportAndPurge(year) {
      await this.pushAll(year);
      Storage.exportJSON(); // also download local backup
      const confirmed = window.confirm(
        `Data for ${year} has been saved to Google Sheets and downloaded as JSON.\n\n` +
        `Click OK to permanently clear this year's transactions and reset actuals for the new year.\n` +
        `This cannot be undone.`
      );
      if (confirmed) {
        Storage.purgeYear();
        return true;
      }
      return false;
    },
  };
})();
