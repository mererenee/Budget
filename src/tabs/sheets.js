// ─── Google Sheets Tab ────────────────────────────────────────────────────────
const SheetsTab = (() => {
  function updateStatus() {
    const lp = Sheets.lastPush;
    document.getElementById('sheets-status').innerHTML = Sheets.isAuthed
      ? `<span class="tag tag-learned">● Connected</span>
         ${lp ? `<span class="muted" style="font-size:11px;margin-left:8px">Last push: ${lp.toLocaleString()}</span>` : ''}`
      : `<span class="tag">Not connected</span>`;
  }

  async function connect() {
    const clientId = document.getElementById('sh-client-id').value.trim();
    const sheetId  = document.getElementById('sh-sheet-id').value.trim();
    if (!clientId || !sheetId) {
      showMsg('sh-msg', 'Enter both your OAuth Client ID and Spreadsheet ID first.', 'err'); return;
    }
    Sheets.saveConfig(clientId, sheetId);
    try {
      await Sheets.connect();
      updateStatus();
      showMsg('sh-msg', 'Connected! You can now push data to Google Sheets.', 'ok');
    } catch (e) {
      showMsg('sh-msg', `Connection failed: ${e.message}`, 'err');
    }
  }

  async function pushAll() {
    try {
      setBusy('sh-push-all', true);
      await Sheets.pushAll();
      updateStatus();
    } catch (e) {
      showMsg('sh-msg', `Push failed: ${e.message}`, 'err');
    } finally {
      setBusy('sh-push-all', false);
    }
  }

  async function pushTxns() {
    try {
      setBusy('sh-push-txns', true);
      await Sheets.pushTransactions();
      updateStatus();
    } catch (e) {
      showMsg('sh-msg', `Push failed: ${e.message}`, 'err');
    } finally {
      setBusy('sh-push-txns', false);
    }
  }

  async function yearEnd() {
    const year = parseInt(document.getElementById('sh-year').value) || new Date().getFullYear();
    try {
      setBusy('sh-year-end', true);
      const done = await Sheets.yearEndExportAndPurge(year);
      if (done) {
        showMsg('sh-msg', `${year} data exported and purged. Ready for new year.`, 'ok');
        updateStatus();
      } else {
        showMsg('sh-msg', 'Purge cancelled — your data is safe.', 'warn');
      }
    } catch (e) {
      showMsg('sh-msg', `Year-end failed: ${e.message}`, 'err');
    } finally {
      setBusy('sh-year-end', false);
    }
  }

  function setBusy(id, busy) {
    const el = document.getElementById(id);
    if (el) { el.disabled = busy; el.textContent = busy ? 'Working…' : el.dataset.label; }
  }

  function mount() {
    const el = document.getElementById('tab-sheets');
    el.innerHTML = `
      <div class="card">
        <h3>Google Sheets Setup</h3>
        <p class="sheets-info" style="margin-bottom:14px;line-height:1.8">
          This app integrates with Google Sheets via the official Sheets API v4.
          Your data <strong>never passes through any third-party server</strong> — requests go directly
          from your browser to Google's API using your own credentials.
          <br><br>
          <strong>One-time setup:</strong><br>
          1. Go to <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a>
             → Create a project → Enable <em>Google Sheets API</em>.<br>
          2. Go to <em>APIs &amp; Services → Credentials → Create OAuth 2.0 Client ID</em>.<br>
             &nbsp;&nbsp;• Application type: <strong>Web application</strong><br>
             &nbsp;&nbsp;• Authorized JavaScript origins: <code>http://localhost</code> (or your deployed URL)<br>
             &nbsp;&nbsp;• Authorized redirect URIs: <code>postmessage</code><br>
          3. Copy your <strong>Client ID</strong> and paste below.<br>
          4. Create a new Google Sheet and copy its <strong>Spreadsheet ID</strong>
             (the long string in the URL between <code>/d/</code> and <code>/edit</code>).
        </p>
        <div class="fr fr2" style="margin-bottom:10px">
          <div>
            <label>OAuth Client ID</label>
            <input type="text" id="sh-client-id" placeholder="123456789-abc…apps.googleusercontent.com"
                   value="${Sheets.clientId}">
          </div>
          <div>
            <label>Spreadsheet ID</label>
            <input type="text" id="sh-sheet-id" placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                   value="${Sheets.spreadsheetId}">
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" onclick="SheetsTab.connect()">Connect Google Account</button>
          <span id="sheets-status"></span>
        </div>
        <div id="sh-msg"></div>
      </div>

      <div class="card">
        <h3>Push Data to Sheets</h3>
        <p class="sheets-info" style="margin-bottom:12px">
          Each push writes to its own named tab in your spreadsheet (e.g. <code>2026_Transactions</code>,
          <code>2026_Budget</code>, etc.). Existing data in those tabs is overwritten.
        </p>
        <div class="btn-group">
          <button class="btn btn-primary" id="sh-push-all" data-label="Push Everything"
                  onclick="SheetsTab.pushAll()">Push Everything</button>
          <button class="btn" id="sh-push-txns" data-label="Push Transactions Only"
                  onclick="SheetsTab.pushTxns()">Push Transactions Only</button>
          <button class="btn" onclick="Storage.exportJSON()">Download JSON Backup</button>
        </div>
      </div>

      <div class="card year-purge-zone">
        <h3>⚠ Year-End Export &amp; Purge</h3>
        <p class="sheets-info" style="margin-bottom:12px;line-height:1.7">
          At the end of each year, use this to export <em>all</em> data to Google Sheets,
          download a local JSON backup, then permanently clear transactions and reset actuals
          so you can start fresh. <strong>This cannot be undone.</strong>
          You will be asked to confirm before anything is deleted.
        </p>
        <div class="fr fr2" style="margin-bottom:10px;max-width:400px">
          <div>
            <label>Year being closed out</label>
            <input type="number" id="sh-year" value="${new Date().getFullYear()}">
          </div>
        </div>
        <button class="btn btn-danger" id="sh-year-end" data-label="Export &amp; Purge Year"
                onclick="SheetsTab.yearEnd()" style="border-color:var(--red);color:var(--red)">
          Export &amp; Purge Year
        </button>
      </div>
    `;
    updateStatus();
  }

  return { mount, connect, pushAll, pushTxns, yearEnd };
})();
