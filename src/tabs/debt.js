// ─── Debt Tab ─────────────────────────────────────────────────────────────────
const Debt = (() => {
  let CH = {};
  function kc(id) { if (CH[id]) { CH[id].destroy(); delete CH[id]; } }

  function render() {
    const extra  = parseFloat(document.getElementById('debt-extra')?.value) || 0;
    const strat  = document.getElementById('debt-strat')?.value || 'avalanche';
    const active = (window.DEBTS || []).filter(d => d.balance > 0);
    const totBal = active.reduce((s, d) => s + d.balance, 0);
    const totMin = active.reduce((s, d) => s + d.min,     0);
    const avgAPR = active.length ? active.reduce((s, d) => s + d.rate, 0) / active.length : 0;

    document.getElementById('debt-metrics').innerHTML = `
      <div class="metric"><div class="lbl">Total Debt</div><div class="val neg">${fmt(totBal)}</div></div>
      <div class="metric"><div class="lbl">Min Payments / Mo</div><div class="val warn">${fmt(totMin)}</div></div>
      <div class="metric"><div class="lbl">Avg APR</div><div class="val warn">${avgAPR.toFixed(1)}%</div></div>
      <div class="metric"><div class="lbl">Active Accounts</div><div class="val">${active.length}</div></div>
    `;

    document.getElementById('debt-list').innerHTML = (window.DEBTS || []).map((d, i) => `
      <div class="row">
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between">
            <span style="font-weight:500">${escHtml(d.name)}</span>
            <span class="${d.balance>0?'neg':'pos'}">${fmt(d.balance)}</span>
          </div>
          <div style="font-size:11px;color:var(--muted)">
            Min: ${fmt(d.min)}/mo &nbsp;·&nbsp; APR: ${d.rate}%
            ${d.balance===0 ? ' &nbsp;·&nbsp; <span style="color:var(--green)">✓ Paid off</span>' : ''}
          </div>
        </div>
        <button class="btn btn-sm btn-danger" style="margin-left:10px"
                onclick="Debt._delete(${i})">✕</button>
      </div>`).join('') || '<p class="muted" style="font-size:12px;padding:6px 0">No debts added yet.</p>';

    // Payoff simulation
    const sorted = [...active].sort((a, b) =>
      strat === 'avalanche' ? b.rate - a.rate : a.balance - b.balance
    );
    const snap = sorted.map(d => ({ ...d }));
    const cL = [], cD = [];
    let months = 0, bal = totBal;
    while (bal > 0 && months < 360) {
      for (const d of snap) {
        if (d.balance <= 0) continue;
        d.balance = Math.max(0, d.balance * (1 + d.rate / 1200) - d.min);
      }
      const focus = snap.find(d => d.balance > 0);
      if (focus && extra > 0) focus.balance = Math.max(0, focus.balance - extra);
      bal = snap.reduce((s, d) => s + Math.max(0, d.balance), 0);
      months++;
      if (months % 3 === 0 || bal <= 0) { cL.push('Mo ' + months); cD.push(Math.round(bal)); }
    }
    const y = Math.floor(months / 12), mo = months % 12;
    document.getElementById('debt-calc-out').innerHTML =
      `<div class="alert alert-info" style="margin-top:8px">
        Using <strong>${strat}</strong>${extra > 0 ? ` + <strong>${fmt(extra)}/mo extra</strong>` : ''},
        you'll be debt-free in
        <strong>${y > 0 ? y + 'y ' : ''}${mo > 0 ? mo + 'mo' : ''}</strong>
        ${months >= 360 ? '— consider increasing payments.' : ''}
      </div>`;

    kc('c-debt');
    CH['c-debt'] = new Chart(document.getElementById('c-debt'), {
      type: 'line',
      data: { labels: cL, datasets: [{
        label:'Balance', data: cD,
        borderColor:'#f05a5a', backgroundColor:'rgba(240,90,90,0.07)',
        tension:0.35, borderWidth:1.5, pointRadius:0, fill:true
      }]},
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins: { legend: { display:false } },
        scales: {
          y: { ticks:{ callback: v=>'$'+Math.round(v/1000)+'k', font:{size:10} }, grid:{color:'rgba(255,255,255,0.05)'} },
          x: { ticks:{ font:{size:10}, maxTicksLimit:8 }, grid:{display:false} }
        }
      }
    });
  }

  function _delete(i) {
    if (!confirm(`Remove "${window.DEBTS[i].name}"?`)) return;
    window.DEBTS.splice(i, 1);
    Storage.saveDebts();
    render();
  }

  function _add() {
    const name    = document.getElementById('dn').value.trim();
    const balance = parseFloat(document.getElementById('db').value) || 0;
    const min     = parseFloat(document.getElementById('dmin').value) || 0;
    const rate    = parseFloat(document.getElementById('dr').value) || 0;
    if (!name) { showMsg('d-msg', 'Enter an account name.', 'err'); return; }

    const ex = window.DEBTS.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (ex) { ex.balance = balance; ex.min = min; ex.rate = rate; }
    else    { window.DEBTS.push({ name, balance, min, rate }); }

    Storage.saveDebts();
    render();
    showMsg('d-msg', 'Debt saved.', 'ok');
  }

  function mount() {
    const el = document.getElementById('tab-debt');
    el.innerHTML = `
      <div class="metrics" id="debt-metrics"></div>
      <div class="grid2">
        <div>
          <div class="card"><h3>Accounts</h3><div id="debt-list"></div></div>
          <div class="card">
            <h3>Payoff Calculator</h3>
            <div class="fr fr2" style="margin-bottom:8px">
              <div><label>Extra Payment / Mo ($)</label>
                <input type="number" id="debt-extra" value="0" oninput="Debt.render()"></div>
              <div><label>Strategy</label>
                <select id="debt-strat" onchange="Debt.render()">
                  <option value="avalanche">Avalanche (highest APR first)</option>
                  <option value="snowball">Snowball (lowest balance first)</option>
                </select></div>
            </div>
            <div id="debt-calc-out"></div>
          </div>
          <div class="card">
            <h3>Add / Update Debt</h3>
            <div class="fr fr4" style="margin-bottom:10px">
              <div><label>Name</label><input type="text" id="dn" placeholder="Credit Card"></div>
              <div><label>Balance ($)</label><input type="number" id="db" placeholder="6493"></div>
              <div><label>Min Pmt ($)</label><input type="number" id="dmin" placeholder="130"></div>
              <div><label>APR %</label><input type="number" id="dr" placeholder="19.99"></div>
            </div>
            <button class="btn btn-primary" onclick="Debt._add()">Save Debt</button>
            <div id="d-msg"></div>
          </div>
        </div>
        <div>
          <div class="card">
            <h3>Payoff Projection</h3>
            <div class="chart-wrap" style="height:320px"><canvas id="c-debt"></canvas></div>
          </div>
        </div>
      </div>
    `;
    render();
  }

  return { mount, render, _delete, _add };
})();
