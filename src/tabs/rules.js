// ─── Auto-Cat Rules Tab ───────────────────────────────────────────────────────
const RulesTab = (() => {
  function catOptions(selected) {
    return CATS.map(c =>
      `<option value="${c}"${c === selected ? ' selected' : ''}>${c}</option>`
    ).join('');
  }

  function srcTag(src) {
    const map = { 'built-in':'tag-builtin', learned:'tag-learned', custom:'tag-custom' };
    return `<span class="tag ${map[src] || ''}">${src}</span>`;
  }

  function render() {
    const filter = (document.getElementById('rf')?.value || '').toLowerCase();
    const srcF   = document.getElementById('rs')?.value || 'all';

    const rows = RULES
      .filter(r =>
        (!filter || r.kw.includes(filter) || r.cat.toLowerCase().includes(filter)) &&
        (srcF === 'all' || r.src === srcF)
      )
      .slice(0, 100);

    document.getElementById('rules-body').innerHTML = rows.map(r => `
      <tr>
        <td><code>${escHtml(r.kw)}</code></td>
        <td style="font-size:12px">${escHtml(r.cat)}</td>
        <td>${srcTag(r.src)}</td>
        <td>
          ${r.src !== 'built-in'
            ? `<button class="btn btn-sm btn-danger"
                       onclick="RulesTab._delete('${escHtml(r.kw)}','${escHtml(r.cat)}')">✕</button>`
            : ''}
        </td>
      </tr>`).join('') ||
      '<tr><td colspan="4" style="padding:12px;color:var(--muted)">No matching rules.</td></tr>';
  }

  function _delete(kw, cat) {
    const idx = RULES.findIndex(r => r.kw === kw && r.cat === cat);
    if (idx === -1) return;
    RULES.splice(idx, 1);
    Storage.saveRules();
    render();
    toast('Rule deleted.', 'ok');
  }

  function _add() {
    const kw  = document.getElementById('rk').value.trim().toLowerCase();
    const cat = document.getElementById('rc').value;
    if (!kw) { showMsg('r-msg', 'Enter a keyword.', 'err'); return; }
    if (RULES.find(r => r.kw === kw)) {
      showMsg('r-msg', 'That keyword already exists — delete the old one first if you want to change it.', 'warn');
      return;
    }
    RULES.unshift({ kw, cat, src: 'custom' });
    Storage.saveRules();
    render();
    showMsg('r-msg', 'Rule added. It will apply to future imports.', 'ok');
    document.getElementById('rk').value = '';
  }

  function mount() {
    const el = document.getElementById('tab-rules');
    el.innerHTML = `
      <div class="card">
        <h3>How Smart Categorization Works</h3>
        <p class="sheets-info" style="margin-bottom:10px;line-height:1.7">
          Each rule is a keyword (case-insensitive, partial match) mapped to a category. Rules are checked in
          order — the <strong>first match wins</strong>. Learned and custom rules sit at the top of the list
          and take priority over built-in rules.<br>
          When you correct a category in the Import preview, the merchant's first two meaningful words are
          automatically added as a <em>learned</em> rule so future imports are smarter.
        </p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px">
          <span class="tag tag-builtin">built-in — seeded from your real merchants</span>
          <span class="tag tag-learned">learned — auto-added when you corrected an import</span>
          <span class="tag tag-custom">custom — added manually below</span>
        </div>
      </div>

      <div class="card">
        <div style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap;align-items:flex-end">
          <div style="flex:1"><label>Search keywords or categories</label>
            <input type="text" id="rf" placeholder="e.g. publix, grocery, income…" oninput="RulesTab.render()">
          </div>
          <div><label>Source</label>
            <select id="rs" onchange="RulesTab.render()" style="width:auto">
              <option value="all">All</option>
              <option value="built-in">Built-in</option>
              <option value="learned">Learned</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
        <div class="tbl-wrap">
          <table class="tbl" style="table-layout:fixed">
            <colgroup>
              <col style="width:38%"><col style="width:36%"><col style="width:16%"><col style="width:10%">
            </colgroup>
            <thead>
              <tr><th>Keyword pattern</th><th>Maps to category</th><th>Source</th><th></th></tr>
            </thead>
            <tbody id="rules-body"></tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h3>Add Custom Rule</h3>
        <div class="fr fr2" style="margin-bottom:10px">
          <div><label>Keyword (partial match, case-insensitive)</label>
            <input type="text" id="rk" placeholder="e.g. publix, racetrac, usaa life"></div>
          <div><label>Category</label>
            <select id="rc">${catOptions(CATS[0])}</select></div>
        </div>
        <button class="btn btn-primary" onclick="RulesTab._add()">Add Rule</button>
        <div id="r-msg"></div>
      </div>
    `;
    render();
  }

  return { mount, render, _delete, _add };
})();
