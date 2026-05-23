// ─── Dashboard Tab ───────────────────────────────────────────────────────────
const Dashboard = (() => {
  const CH = {};
  function kc(id) { if (CH[id]) { CH[id].destroy(); delete CH[id]; } }

  function fc(r) { return r > 1.1 ? 'fill-over' : r > 0.85 ? 'fill-warn' : 'fill-ok'; }

  function rowHtml(it) {
    const r   = it.p > 0 ? it.a / it.p : 0;
    const cls = fc(r);
    return `<div class="row">
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between">
          <span>${it.n}</span>
          <span class="muted" style="font-size:11px">budget: ${fmt(it.p)}</span>
        </div>
        ${it.p > 0 ? `<div class="bar"><div class="fill ${cls}" style="width:${Math.min(r*100,100).toFixed(0)}%"></div></div>` : ''}
      </div>
      <div style="text-align:right;margin-left:12px;font-weight:500">${fmt(it.a)}</div>
    </div>`;
  }

  function render() {
    const m   = document.getElementById('dash-month').value;
    const b   = window.BUD[m] || {};
    const exp = (b.sk||0)+(b.dtd||0)+(b.cal||0)+(b.nm||0);
    const net = (b.income||0) - exp;
    const sr  = b.income > 0 ? Math.round(net / b.income * 100) : 0;

    document.getElementById('dash-net').innerHTML =
      `<span class="${net >= 0 ? 'pos' : 'neg'}">${net >= 0 ? 'Surplus' : 'Deficit'}: ${fmt(net)}</span>`;

    document.getElementById('dash-metrics').innerHTML = `
      <div class="metric"><div class="lbl">Income</div><div class="val pos">${fmt(b.income||0)}</div></div>
      <div class="metric"><div class="lbl">Expenses</div><div class="val neg">${fmt(exp)}</div></div>
      <div class="metric"><div class="lbl">Net</div><div class="val ${net>=0?'pos':'neg'}">${fmt(net)}</div></div>
      <div class="metric"><div class="lbl">Savings rate</div><div class="val ${sr>=15?'pos':sr>=5?'warn':'neg'}">${sr}%</div></div>
    `;

    // Bar chart
    const mos   = ['Jan','Feb','Mar','Apr','May','Jun'];
    const incD  = mos.map(x => window.BUD[x]?.income || 0);
    const expD  = mos.map(x => { const bx=window.BUD[x]||{}; return (bx.sk||0)+(bx.dtd||0)+(bx.cal||0)+(bx.nm||0); });
    kc('c-bar');
    CH['c-bar'] = new Chart(document.getElementById('c-bar'), {
      type: 'bar',
      data: { labels: mos, datasets: [
        { label:'Income',   data: incD, backgroundColor:'rgba(52,201,138,0.8)', borderWidth:0, borderRadius:3 },
        { label:'Expenses', data: expD, backgroundColor:'rgba(240,90,90,0.75)', borderWidth:0, borderRadius:3 },
      ]},
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false} },
        scales: { y:{ ticks:{callback:v=>'$'+Math.round(v/1000)+'k',font:{size:10}}, grid:{color:'rgba(255,255,255,0.05)'} },
                  x:{ ticks:{font:{size:11}}, grid:{display:false} } } }
    });

    // Donut
    kc('c-pie');
    CH['c-pie'] = new Chart(document.getElementById('c-pie'), {
      type: 'doughnut',
      data: { labels:['Skeleton','Day to Day','Other'],
              datasets:[{ data:[b.sk||0,b.dtd||0,(b.cal||0)+(b.nm||0)],
                         backgroundColor:['#4f8ef7','#34c98a','#f5a623'], borderWidth:0 }] },
      options: { responsive:true, maintainAspectRatio:false,
                 plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, boxWidth:8, padding:6, color:'#7b82a0' } } },
                 cutout:'62%' }
    });

    document.getElementById('dash-sk').innerHTML  =
      (window.SKI[m]  || []).slice(0,8).map(rowHtml).join('') || '<p class="muted" style="font-size:12px;padding:6px 0">No data yet</p>';
    document.getElementById('dash-dtd').innerHTML =
      (window.DTDI[m] || []).slice(0,7).map(rowHtml).join('') || '<p class="muted" style="font-size:12px;padding:6px 0">No data yet</p>';
  }

  function mount() {
    const el = document.getElementById('tab-dashboard');
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
        <select id="dash-month">${MONTHS.map(m=>`<option>${m}</option>`).join('')}</select>
        <span id="dash-net" style="font-size:14px;font-weight:500"></span>
      </div>
      <div class="metrics" id="dash-metrics"></div>
      <div class="grid2">
        <div>
          <div class="card">
            <h3>Income vs Expenses — Jan–Jun</h3>
            <div class="chart-wrap" style="height:155px"><canvas id="c-bar"></canvas></div>
          </div>
          <div class="card">
            <h3>Spending Mix</h3>
            <div class="chart-wrap" style="height:155px"><canvas id="c-pie"></canvas></div>
          </div>
        </div>
        <div>
          <div class="card"><h3>Skeleton Bills</h3><div id="dash-sk"></div></div>
          <div class="card"><h3>Day to Day</h3><div id="dash-dtd"></div></div>
        </div>
      </div>
    `;
    document.getElementById('dash-month').value = 'Jan';
    document.getElementById('dash-month').addEventListener('change', render);
    render();
  }

  return { mount, render };
})();
