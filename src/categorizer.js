// ─── Categorizer ─────────────────────────────────────────────────────────────
// Matches a merchant description against RULES (first match wins).
// Returns { cat, conf, src }.

function categorize(desc) {
  const d = desc.toLowerCase();
  for (const r of RULES) {
    if (d.includes(r.kw.toLowerCase())) {
      // Confidence: base 52 + 3 per keyword char + bonus for learned/custom
      const bonus = r.src === 'learned' ? 15 : r.src === 'custom' ? 8 : 0;
      const conf  = Math.min(97, 52 + r.kw.length * 3 + bonus);
      return { cat: r.cat, conf, src: r.src };
    }
  }
  return { cat: 'Miscellaneous', conf: 18, src: 'default' };
}

// Called whenever a user manually corrects a category in the import preview.
// Extracts the first 2 meaningful words from the description and adds a rule.
function learnFromCorrection(desc, correctedCat) {
  const stopWords = new Set(['the','and','for','from','inc','llc','com','dba','usa','corp']);
  const words = desc
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (!words.length) return;
  const kw = words.slice(0, 2).join(' ');
  if (kw.length < 3) return;

  // Don't duplicate
  if (RULES.find(r => r.kw === kw && r.cat === correctedCat)) return;

  RULES.unshift({ kw, cat: correctedCat, src: 'learned' });
  Storage.saveRules();
}
