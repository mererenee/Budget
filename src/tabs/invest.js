// ─── Invest Tab ───────────────────────────────────────────────────────────────
const Invest = (() => {
  const AC = ['#4f8ef7','#34c98a','#f5a623','#a78bfa','#f87171'];
  let CH = {};
  function kc(id) { if (CH[id]) { CH[id].destroy(); delete CH[id]; } }

  function render() {
    const contrib = parseFloat(document.getElementById('inv-contrib')?.value) || 0;
    const rate    = parseFloat(document.getElementById('inv-rate')?.value)    || 7;
    const yrs     = parseInt(document.getElementById('inv-yrs')?.value)       || 25;
    const invs    = window.INVS || [];
    const totBal  = invs.reduce((s, i) => s + i.balance, 0);
    const totC    = invs.reduce((s, i) => s + i.contrib, 0);

    document.getElementById('inv-metrics').innerHTML = `
      <div class="metric"><div class="lbl">Total Invested</div><div class="val pos">${fmt(totBal)}</div></div>
      <div class="metric"><div class="lbl">Monthly Contributions</div><div class="val">${fmt(totC)}</div></div>
      <div class="metric"><div class="lbl">Accounts</div><div class="val">${invs.length}</div></div>
    `;

    document.getElementById('inv-list').innerHTML = invs.map((inv, i) => `
      <div class="row">
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between">
            <span style="font-weight:500">${escHtml(inv.name)}</span>
            <span class="pos">${fmt(inv.balance)}</span>
          </div>
          <div style="font-size:11px;color:var(--muted)">${inv.type} &nbsp;·&nbsp; +${fmt(inv.contrib)}/mo</div>
        </div>
        <button class="btn btn-sm btn-danger" style="margin-left:10px"
                onclick="Invest._delete(${i})">✕</button>
      </div>`).join('') || '<p class="muted" style="font-size:12px;padding:6px 0">No accounts yet.</p>';

    // Allocation donut
    kc('c-alloc');
    CH['c-alloc'] = new Chart(document.getElementById('c-alloc'), {
      type: 'doughnut',
      data: {
        labels: invs.map(i => i.name),
        datasets: [{ data: invs.map(i => i.balance || 0.01), backgroundColor: AC, borderWidth: 0 }]
      },
      options: {
        responsive:true, maintainAspectRatio:false, cutout:'60%',
        plugins: { legend: { position:'bottom', labels:{ font:{size:10}, boxWidth:8, padding:6, color:'#7b82a0' } } }
      }
    });

    // Growth projection
    const gL = [], gP = [], gT = [];
    let bal = totBal, contributed = totBal;
    for (let y = 0; y <= yrs; y++) {
      gL.push(y === 0 ? 'Now' : 'Yr ' + y);
      gP.push(Math.round(contributed));
      gT.push(Math.round(bal));
      bal = bal * (1 + rate / 100) + contrib * 12;
      contributed += contrib * 12;
    }
    const fv = gT[gT.length - 1], fp = gP[gP.length - 1];
    document.getElementById('inv-proj').innerHTML =
      `Projected in <strong>${yrs} years</strong>: <span class="pos" style="font-weight:500">${fmt(fv)}</span>
       &nbsp;·&nbsp; contributions: ${fmt(fp)} &nbsp;·&nbsp; growth: <span class="pos">${fmt(fv - fp)}</span>`;

    kc('c-growth');
    CH['c-growth'] = new Chart(document.getElementById('c-growth'), {
      type: 'line',
      data: { labels: gL, datasets: [
        { label:'Portfolio Value', data: gT,
          borderColor:'#4f8ef7', backgroundColor:'rgba(79,142,247,0.08)',
          tension:0.35, borderWidth:1.5, pointRadius:0, fill:true },
        { label:'Contributions', data: gP,
          borderColor:'rgba(52,201,138,0.5)', backgroundColor:'transparent',
          tension:0.35, borderWidth:1, pointRadius:0, borderDash:[4,3] },
      ]},
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins: { legend: { display:false } },
        scales: {
          y: { ticks:{ callback: v=>'$'+Math.round(v/1000)+'k', font:{size:10} }, grid:{color:'rgba(255,255,255,0.05)'} },
          x: { ticks:{ maxTicksLimit:8, font:{size:10} }, grid:{display:false} }
        }
      }
    });
  }

  function _delete(i) {
    if (!confirm(`Remove "${window.INVS[i].name}"?`)) return;
    window.INVS.splice(i, 1);
    Storage.saveInvs();
    render();
  }

  function _add() {
    const name    = document.getElementById('ian').value.trim();
    const balance = parseFloat(document.getElementById('iab').value) || 0;
    const contrib = parseFloat(document.getElementById('iac').value) || 0;
    const type    = document.getElementById('iat').value;
    if (!name) { showMsg('i-msg', 'Enter an account name.', 'err'); return; }

    const ex = window.INVS.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (ex) { ex.balance = balance; ex.contrib = contrib; ex.type = type; }
    else    { window.INVS.push({ name, balance, contrib, type }); }

    Storage.saveInvs();
    render();
    showMsg('i-msg', 'Account saved.', 'ok');
  }

  function mount() {
    const el = document.getElementById('tab-invest');
    const typeOpts = ['Retirement (401k/IRA)','Taxable Brokerage','Cryptocurrency','HSA','529 / Education']
      .map(t => `<option>${t}</option>`).join('');
    el.innerHTML = `
      <div class="metrics" id="inv-metrics"></div>
      <div class="grid2">
        <div>
          <div class="card"><h3>Accounts</h3><div id="inv-list"></div></div>
          <div class="card">
            <h3>Allocation</h3>
            <div class="chart-wrap" style="height:165px"><canvas id="c-alloc"></canvas></div>
          </div>
          <div class="card">
            <h3>Add / Update Account</h3>
            <div class="fr fr3" style="margin-bottom:8px">
              <div><label>Name</label><input type="text" id="ian" placeholder="Roth IRA"></div>
              <div><label>Balance ($)</label><input type="number" id="iab" placeholder="0"></div>
              <div><label>Monthly Contrib ($)</label><input type="number" id="iac" placeholder="0"></div>
            </div>
            <div style="margin-bottom:10px"><label>Type</label><select id="iat">${typeOpts}</select></div>
            <button class="btn btn-primary" onclick="Invest._add()">Save Account</button>
            <div id="i-msg"></div>
          </div>
        </div>
        <div>
          <div class="card">
            <h3>Growth Projection</h3>
            <div class="fr fr3" style="margin-bottom:10px">
              <div><label>Monthly Contribution ($)</label>
                <input type="number" id="inv-contrib" value="500" oninput="Invest.render()"></div>
              <div><label>Expected Return (% / yr)</label>
                <input type="number" id="inv-rate" value="7" oninput="Invest.render()"></div>
              <div><label>Years</label>
                <input type="number" id="inv-yrs" value="25" oninput="Invest.render()"></div>
            </div>
            <div class="chart-wrap" style="height:220px"><canvas id="c-growth"></canvas></div>
            <div id="inv-proj" style="margin-top:10px;font-size:13px;color:var(--muted)"></div>
          </div>
        </div>
      </div>
    `;
    render();
  }

  return { mount, render, _delete, _add };
})();
