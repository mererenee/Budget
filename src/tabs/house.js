// ─── House Projects Tab ───────────────────────────────────────────────────────
const House = (() => {
  function statusBadge(p) {
    const r = p.quote > 0 ? p.saved / p.quote : 0;
    if (p.quote === 0)  return '<span class="tag">No quote</span>';
    if (r >= 1)         return '<span class="tag tag-learned">Funded ✓</span>';
    if (p.saved > 0)    return '<span class="tag tag-custom">Saving…</span>';
    return '<span class="tag">Pending</span>';
  }

  function render() {
    const projs = window.PROJS || [];
    const totQ  = projs.reduce((s, p) => s + (p.quote    || 0), 0);
    const totS  = projs.reduce((s, p) => s + (p.saved    || 0), 0);
    const totB  = projs.reduce((s, p) => s + (p.budgeted || 0), 0);

    document.getElementById('house-metrics').innerHTML = `
      <div class="metric"><div class="lbl">Total Quoted</div><div class="val">${fmt(totQ)}</div></div>
      <div class="metric"><div class="lbl">Total Budgeted</div><div class="val">${fmt(totB)}</div></div>
      <div class="metric"><div class="lbl">Total Saved</div><div class="val pos">${fmt(totS)}</div></div>
      <div class="metric"><div class="lbl">Still Needed</div><div class="val warn">${fmt(Math.max(0, totQ - totS))}</div></div>
    `;

    document.getElementById('house-body').innerHTML = projs.map((p, i) => {
      const r   = p.quote > 0 ? Math.min(p.saved / p.quote, 1) : 0;
      const cls = r >= 1 ? 'fill-ok' : r > 0.5 ? 'fill-warn' : 'fill-blue';
      return `<tr>
        <td title="${escHtml(p.name)}">${escHtml(p.name)}</td>
        <td title="${escHtml(p.vendor)}">${escHtml(p.vendor) || '—'}</td>
        <td>${fmt(p.quote)}</td>
        <td>${fmt(p.budgeted)}</td>
        <td>
          ${fmt(p.saved)}
          <div class="bar" style="margin-top:2px">
            <div class="fill ${cls}" style="width:${(r*100).toFixed(0)}%"></div>
          </div>
        </td>
        <td>${escHtml(p.timeline) || '—'}</td>
        <td>${statusBadge(p)}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="House._delete(${i})">✕</button>
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="8" style="padding:14px;color:var(--muted)">No projects yet.</td></tr>';
  }

  function _delete(i) {
    if (!confirm(`Remove project "${window.PROJS[i].name}"?`)) return;
    window.PROJS.splice(i, 1);
    Storage.saveProjs();
    render();
  }

  function _add() {
    const name     = document.getElementById('hn').value.trim();
    const vendor   = document.getElementById('hv').value.trim();
    const quote    = parseFloat(document.getElementById('hq').value)  || 0;
    const budgeted = parseFloat(document.getElementById('hb').value)  || 0;
    const saved    = parseFloat(document.getElementById('hs').value)  || 0;
    const timeline = document.getElementById('ht').value.trim();
    if (!name) { showMsg('h-msg', 'Enter a project name.', 'err'); return; }

    const ex = window.PROJS.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (ex) { Object.assign(ex, { vendor, quote, budgeted, saved, timeline }); }
    else    { window.PROJS.push({ name, vendor, quote, budgeted, saved, timeline }); }

    Storage.saveProjs();
    render();
    showMsg('h-msg', 'Project saved.', 'ok');
  }

  function mount() {
    const el = document.getElementById('tab-house');
    el.innerHTML = `
      <div class="metrics" id="house-metrics"></div>
      <div class="card">
        <h3>Project Tracker</h3>
        <div class="tbl-wrap">
          <table class="tbl" style="table-layout:fixed">
            <colgroup>
              <col style="width:18%"><col style="width:14%"><col style="width:10%">
              <col style="width:10%"><col style="width:16%"><col style="width:12%">
              <col style="width:12%"><col style="width:8%">
            </colgroup>
            <thead>
              <tr>
                <th>Project</th><th>Vendor</th><th>Quote</th>
                <th>Budgeted</th><th>Saved</th><th>Timeline</th>
                <th>Status</th><th></th>
              </tr>
            </thead>
            <tbody id="house-body"></tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <h3>Add / Update Project</h3>
        <div class="fr fr3" style="margin-bottom:8px">
          <div><label>Project Name</label><input type="text" id="hn" placeholder="Shower Door"></div>
          <div><label>Vendor / Note</label><input type="text" id="hv" placeholder="ABC Contractors"></div>
          <div><label>Quote ($)</label><input type="number" id="hq" placeholder="0"></div>
        </div>
        <div class="fr fr3" style="margin-bottom:10px">
          <div><label>Budgeted ($)</label><input type="number" id="hb" placeholder="0"></div>
          <div><label>Saved ($)</label><input type="number" id="hs" placeholder="0"></div>
          <div><label>Timeline</label><input type="text" id="ht" placeholder="Q3 2026"></div>
        </div>
        <button class="btn btn-primary" onclick="House._add()">Save Project</button>
        <div id="h-msg"></div>
      </div>
    `;
    render();
  }

  return { mount, render, _delete, _add };
})();
