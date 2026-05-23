// ─── Budget Tab ───────────────────────────────────────────────────────────────
const Budget = (() => {
  function fc(r) { return r > 1.1 ? 'fill-over' : r > 0.85 ? 'fill-warn' : 'fill-ok'; }

  function sectionHtml(title, items) {
    if (!items || !items.length) return '';
    const rows = items.map(it => {
      const r    = it.p > 0 ? it.a / it.p : 0;
      const diff = it.p - it.a;
      return `<div class="row">
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between">
            <span>${it.n}</span>
            <span class="muted" style="font-size:11px">budget: ${fmt(it.p)}</span>
          </div>
          ${it.p > 0 ? `<div class="bar"><div class="fill ${fc(r)}" style="width:${Math.min(r*100,100).toFixed(0)}%"></div></div>` : ''}
        </div>
        <div style="text-align:right;margin-left:14px">
          <div style="font-weight:500">${fmt(it.a)}</div>
          ${it.p > 0 ? `<div style="font-size:11px;color:${diff>=0?'var(--green)':'var(--red)'}">${diff>=0?'+':''}${fmt(diff)}</div>` : ''}
        </div>
      </div>`;
    }).join('');
    return `<div class="slbl">${title}</div>${rows}`;
  }

  function render() {
    const m   = document.getElementById('bud-month').value;
    const b   = window.BUD[m] || { income:0, sk:0, dtd:0, cal:0, nm:0, pI:11283.66, pE:10719.70 };
    const exp = (b.sk||0)+(b.dtd||0)+(b.cal||0)+(b.nm||0);

    document.getElementById('bud-metrics').innerHTML = `
      <div class="metric"><div class="lbl">Planned Income</div><div class="val">${fmt(b.pI||0)}</div></div>
      <div class="metric"><div class="lbl">Actual Income</div><div class="val pos">${fmt(b.income||0)}</div></div>
      <div class="metric"><div class="lbl">Planned Expense</div><div class="val">${fmt(b.pE||0)}</div></div>
      <div class="metric"><div class="lbl">Actual Expense</div>
        <div class="val ${exp>(b.pE||0)?'neg':'pos'}">${fmt(exp)}</div></div>
    `;
    document.getElementById('bud-lines').innerHTML =
      sectionHtml('Skeleton — Fixed Bills', window.SKI[m]) +
      sectionHtml('Day to Day',             window.DTDI[m]);
  }

  function mount() {
    const el = document.getElementById('tab-budget');
    el.innerHTML = `
      <div style="margin-bottom:14px">
        <label>Month</label>
        <select id="bud-month" style="width:auto">
          ${MONTHS.map(m => `<option>${m}</option>`).join('')}
        </select>
      </div>
      <div class="metrics" id="bud-metrics"></div>
      <div class="card" id="bud-lines"></div>
    `;
    document.getElementById('bud-month').addEventListener('change', render);
    render();
  }

  return { mount, render };
})();
