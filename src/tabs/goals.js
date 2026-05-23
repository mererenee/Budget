// ─── Goals Tab ────────────────────────────────────────────────────────────────
const Goals = (() => {
  let CH = {};
  function kc(id) { if (CH[id]) { CH[id].destroy(); delete CH[id]; } }

  function render() {
    const goals = window.GOALS || [];
    const total = goals.reduce((s, g) => s + g.target,  0);
    const saved = goals.reduce((s, g) => s + g.current, 0);
    const pct   = total > 0 ? Math.round(saved / total * 100) : 0;

    document.getElementById('goals-metrics').innerHTML = `
      <div class="metric"><div class="lbl">Total Target</div><div class="val">${fmt(total)}</div></div>
      <div class="metric"><div class="lbl">Total Saved</div><div class="val pos">${fmt(saved)}</div></div>
      <div class="metric"><div class="lbl">Still Needed</div><div class="val warn">${fmt(Math.max(0,total-saved))}</div></div>
      <div class="metric"><div class="lbl">Overall Progress</div><div class="val ${pct>=50?'pos':'warn'}">${pct}%</div></div>
    `;

    document.getElementById('goals-list').innerHTML = goals.map((g, i) => {
      const r   = g.target > 0 ? Math.min(g.current / g.target, 1) : 0;
      const cls = r >= 1 ? 'fill-ok' : r > 0.5 ? 'fill-warn' : 'fill-blue';
      const p   = g.target > 0 ? Math.round(r * 100) : 0;
      return `<div class="row" style="align-items:flex-start;padding:9px 0">
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:500">${escHtml(g.name)}</span>
            <span class="muted" style="font-size:11px">${p}%</span>
          </div>
          <div class="bar" style="height:5px;margin-top:5px">
            <div class="fill ${cls}" style="width:${p}%"></div>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:3px">${fmt(g.current)} of ${fmt(g.target)}</div>
        </div>
        <button class="btn btn-sm btn-danger" style="margin-left:12px;margin-top:2px"
                onclick="Goals._delete(${i})">✕</button>
      </div>`;
    }).join('') || '<p class="muted" style="font-size:12px;padding:8px 0">No goals yet.</p>';

    // Horizontal bar chart
    kc('c-goals');
    CH['c-goals'] = new Chart(document.getElementById('c-goals'), {
      type: 'bar',
      data: {
        labels: goals.map(g => g.name.length > 14 ? g.name.slice(0, 14) + '…' : g.name),
        datasets: [
          { label:'Saved',     data: goals.map(g => g.current), backgroundColor:'#34c98a', borderWidth:0, borderRadius:3 },
          { label:'Remaining', data: goals.map(g => Math.max(g.target - g.current, 0)),
            backgroundColor:'rgba(52,201,138,0.12)', borderWidth:0, borderRadius:3 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { stacked: false, ticks: { callback: v => '$'+Math.round(v/1000)+'k', font:{size:10} },
               grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { font:{size:10}, color:'#7b82a0' }, grid: { display:false } }
        }
      }
    });
  }

  function _delete(i) {
    if (!confirm(`Delete goal "${window.GOALS[i].name}"?`)) return;
    window.GOALS.splice(i, 1);
    Storage.saveGoals();
    render();
  }

  function _add() {
    const name    = document.getElementById('gn').value.trim();
    const current = parseFloat(document.getElementById('gc').value) || 0;
    const target  = parseFloat(document.getElementById('gt').value) || 0;
    if (!name) { showMsg('g-msg', 'Enter a goal name.', 'err'); return; }

    const ex = window.GOALS.find(g => g.name.toLowerCase() === name.toLowerCase());
    if (ex) { ex.current = current; ex.target = target; }
    else    { window.GOALS.push({ name, current, target }); }

    Storage.saveGoals();
    render();
    showMsg('g-msg', 'Goal saved.', 'ok');
    document.getElementById('gn').value = '';
    document.getElementById('gc').value = '';
    document.getElementById('gt').value = '';
  }

  function mount() {
    const el = document.getElementById('tab-goals');
    el.innerHTML = `
      <div class="metrics" id="goals-metrics"></div>
      <div class="grid2">
        <div><div class="card"><h3>Savings Goals</h3><div id="goals-list"></div></div></div>
        <div><div class="card"><h3>Progress Overview</h3>
          <div class="chart-wrap" style="height:220px"><canvas id="c-goals"></canvas></div>
        </div></div>
      </div>
      <div class="card">
        <h3>Add / Update Goal</h3>
        <div class="fr fr3" style="margin-bottom:10px">
          <div><label>Name</label><input type="text" id="gn" placeholder="Emergency Fund"></div>
          <div><label>Currently Saved ($)</label><input type="number" id="gc" placeholder="0"></div>
          <div><label>Target ($)</label><input type="number" id="gt" placeholder="0"></div>
        </div>
        <button class="btn btn-primary" onclick="Goals._add()">Save Goal</button>
        <div id="g-msg"></div>
      </div>
    `;
    render();
  }

  return { mount, render, _delete, _add };
})();
