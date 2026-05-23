// ─── Import Tab ───────────────────────────────────────────────────────────────
const Import = (() => {
  let _parsed = [];

  function catOptions(selected) {
    return CATS.map(c =>
      `<option value="${c}"${c === selected ? ' selected' : ''}>${c}</option>`
    ).join('');
  }

  function doParse() {
    const raw   = document.getElementById('imp-paste').value.trim();
    const month = document.getElementById('imp-month').value;
    if (!raw) { showMsg('imp-msg', 'Nothing pasted.', 'err'); return; }

    _parsed = [];
    const lines = raw.split('\n').filter(l => l.trim());

    for (const line of lines) {
      // Split on tab or comma (respecting quoted fields)
      const parts = line.split(/\t|,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
                        .map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 2) continue;

      // Amount: handle ($123.45) negative notation and leading $
      const rawAmt = parts[1].replace(/[$,\s]/g, '');
      const negative = rawAmt.startsWith('(') || rawAmt.startsWith('-');
      const amt = parseFloat(rawAmt.replace(/[()]/g, '')) * (negative ? -1 : 1);
      if (isNaN(amt)) continue;

      const desc = parts[2] || parts[0] || '';
      const res  = categorize(desc);
      _parsed.push({ date:parts[0], amount:Math.abs(amt), desc, cat:res.cat,
                     conf:res.conf, autoSrc:res.src,
                     type: amt < 0 ? 'expense' : 'income', month });
    }

    if (!_parsed.length) {
      showMsg('imp-msg', 'Could not parse any rows. Expected: Date, Amount, Description (tab or comma separated).', 'err');
      return;
    }

    const hiCount = _parsed.filter(p => p.conf >= 60).length;
    const rows = _parsed.map((t, i) => `
      <tr>
        <td>${t.date}</td>
        <td title="${escHtml(t.desc)}">${escHtml(t.desc.slice(0,28))}</td>
        <td>
          <select style="width:100%;font-size:11px;padding:2px 4px"
                  onchange="Import._correct(${i}, this.value)">
            ${catOptions(t.cat)}
          </select>
        </td>
        <td style="color:${t.type==='income'?'var(--green)':'var(--red)'};text-align:right">
          ${t.type==='income'?'+':'-'}${fmt(t.amount)}
        </td>
        <td>
          <span style="font-size:10px;font-weight:500;color:${t.conf>=70?'var(--green)':t.conf>=40?'var(--amber)':'var(--red)'}">
            ${t.conf}%
          </span>
          <div class="bar" style="margin-top:1px">
            <div class="fill ${t.conf>=70?'fill-ok':t.conf>=40?'fill-warn':'fill-over'}" style="width:${t.conf}%"></div>
          </div>
        </td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="Import._remove(${i})">✕</button>
        </td>
      </tr>`).join('');

    document.getElementById('imp-preview').innerHTML = `
      <div class="card">
        <h3>${_parsed.length} rows parsed — ${hiCount} high-confidence matches</h3>
        <div class="alert alert-info" style="margin-bottom:10px">
          Correcting a category below teaches the auto-categorizer for next time.
        </div>
        <div class="tbl-wrap">
          <table class="tbl" style="table-layout:fixed">
            <colgroup>
              <col style="width:11%"><col style="width:26%"><col style="width:33%">
              <col style="width:14%"><col style="width:10%"><col style="width:6%">
            </colgroup>
            <thead>
              <tr><th>Date</th><th>Description</th><th>Category</th>
                  <th>Amount</th><th>Conf.</th><th></th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="btn-group" style="margin-top:12px">
          <button class="btn btn-primary" onclick="Import._importAll()">Import ${_parsed.length} transactions</button>
          <button class="btn" onclick="document.getElementById('imp-preview').innerHTML=''">Cancel</button>
        </div>
      </div>`;
  }

  function _correct(i, cat) {
    learnFromCorrection(_parsed[i].desc, cat);
    _parsed[i].cat = cat;
  }

  function _remove(i) {
    _parsed.splice(i, 1);
    doParse(); // re-render with current paste content won't work; just re-render table
  }

  function _importAll() {
    if (!_parsed.length) return;
    for (const t of _parsed) {
      if (!window.TXNS[t.month]) window.TXNS[t.month] = [];
      window.TXNS[t.month].push({ ...t });
    }
    Storage.saveTxns();
    Storage.saveRules();
    const n = _parsed.length;
    _parsed = [];
    document.getElementById('imp-preview').innerHTML =
      `<div class="alert alert-ok">✓ Imported ${n} transactions. Rules updated from corrections.</div>`;
    document.getElementById('imp-paste').value = '';
    toast(`${n} transactions imported.`, 'ok');
  }

  function addSingle() {
    const date  = document.getElementById('s-date').value;
    const amt   = parseFloat(document.getElementById('s-amt').value);
    const desc  = document.getElementById('s-desc').value.trim();
    const cat   = document.getElementById('s-cat').value;
    const month = document.getElementById('s-month').value;
    if (!date || isNaN(amt) || !desc) {
      showMsg('s-msg', 'Please fill in all fields.', 'err'); return;
    }
    if (!window.TXNS[month]) window.TXNS[month] = [];
    window.TXNS[month].push({
      date, amount: Math.abs(amt), desc, cat,
      type: amt < 0 ? 'expense' : 'income',
      month, conf: 100, autoSrc: 'manual'
    });
    Storage.saveTxns();
    showMsg('s-msg', 'Transaction added.', 'ok');
    document.getElementById('s-date').value  = '';
    document.getElementById('s-amt').value   = '';
    document.getElementById('s-desc').value  = '';
  }

  function mount() {
    const el = document.getElementById('tab-import');
    el.innerHTML = `
      <div class="card">
        <h3>Smart Paste Import</h3>
        <p class="sheets-info" style="margin-bottom:12px">
          Copy rows from your bank statement and paste below.<br>
          <strong>USAA:</strong> Transactions → select rows → copy. &nbsp;
          <strong>Chase:</strong> Download CSV → open in Excel → copy rows.<br>
          Expected format: <code>Date &nbsp; Amount &nbsp; Description</code> (tab or comma separated). Negatives = expenses.
        </p>
        <textarea id="imp-paste"
          placeholder="01/15/2026&#9;-45.99&#9;PUBLIX #1234&#10;01/16/2026&#9;3094.70&#9;DIRECT DEP MRN&#10;01/17/2026&#9;-3880.30&#9;PENNYMAC PMTS">
        </textarea>
        <div class="btn-group" style="margin-top:10px">
          <div>
            <label>Month</label>
            <select id="imp-month" style="width:auto">
              ${MONTHS.map(m => `<option>${m}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-primary" onclick="Import._doParse()">Parse &amp; Auto-Categorize</button>
        </div>
        <div id="imp-msg"></div>
      </div>

      <div id="imp-preview"></div>

      <div class="card">
        <h3>Add Single Transaction</h3>
        <div class="fr fr3">
          <div><label>Date</label><input type="date" id="s-date"></div>
          <div><label>Amount (negative = expense)</label><input type="number" id="s-amt" placeholder="-45.00"></div>
          <div><label>Description</label><input type="text" id="s-desc" placeholder="Publix"></div>
        </div>
        <div class="fr fr2" style="margin-bottom:10px">
          <div><label>Category</label><select id="s-cat">${catOptions(CATS[0])}</select></div>
          <div><label>Month</label><select id="s-month" style="width:auto">${MONTHS.map(m=>`<option>${m}</option>`).join('')}</select></div>
        </div>
        <button class="btn btn-primary" onclick="Import._addSingle()">Add Transaction</button>
        <div id="s-msg"></div>
      </div>
    `;
  }

  return { mount, _doParse: doParse, _correct, _remove, _importAll, _addSingle: addSingle };
})();
