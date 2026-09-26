/**
 * qa-perf-diagnose.cjs — prints the main-thread breakdown from a saved
 * Lighthouse report so optimisation targets real culprits, not guesses.
 *
 * Usage: node scripts/qa-perf-diagnose.cjs qa-evidence/lighthouse-home.json
 */
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || 'qa-evidence/lighthouse-home.json';
if (!fs.existsSync(file)) {
  console.error(`No such report: ${file}`);
  process.exit(2);
}
const lhr = JSON.parse(fs.readFileSync(file, 'utf8'));
const a = lhr.audits || {};
const num = (id) => (a[id] && typeof a[id].numericValue === 'number' ? a[id].numericValue : null);
const fmt = (ms) => (ms == null ? 'n/a' : `${Math.round(ms)}ms`);

console.log(`report     : ${path.basename(file)}  (${lhr.finalDisplayedUrl || lhr.finalUrl})`);
console.log(`fetch time : ${lhr.fetchTime}`);
console.log('');

console.log('=== METRICS ===');
const perf = lhr.categories && lhr.categories.performance;
if (perf) perf.auditRefs.forEach((r) => {
  const av = a[r.id];
  if (av && av.score !== null && av.scoreDisplayMode !== 'notApplicable' && av.score < 1) {
    console.log(`  ${String(r.id).padEnd(26)} score=${av.score}  ${fmt(av.numericValue)}`);
  }
});
console.log(`  FCP  ${fmt(num('first-contentful-paint'))}`);
console.log(`  LCP  ${fmt(num('largest-contentful-paint'))}`);
console.log(`  TBT  ${fmt(num('total-blocking-time'))}`);
console.log(`  CLS  ${a['cumulative-layout-shift'] && a['cumulative-layout-shift'].numericValue}`);
console.log('');

console.log('=== LCP ELEMENT ===');
const lcpEl = a['largest-contentful-paint-element'];
const le = lcpEl && lcpEl.details && lcpEl.details.items && lcpEl.details.items[0];
if (le) {
  console.log(`  phase: ${le.phase}`);
  console.log(`  node : ${JSON.stringify(le.node && le.node.snippet)}`);
  console.log(`  sel  : ${JSON.stringify(le.node && le.node.selector)}`);
} else console.log('  (no element detail)');
console.log('');

console.log('=== LCP PHASE BREAKDOWN ===');
[['ttfb', 'server response'], ['load delay', 'resource load delay'],
 ['load time', 'resource load duration'], ['render delay', 'element render delay']]
  .forEach(([k, label]) => {
    const v = a[`lcp-breakdown-${k}`] || a[`lcp-phases-${k}`] || a[k];
    const ms = v && v.details && v.details.items && v.details.items[0]
      ? v.details.items[0].phase : (v && v.numericValue);
    console.log(`  ${label.padEnd(24)} ${ms == null ? 'n/a' : Math.round(ms) + 'ms'}`);
  });
console.log('');

const boot = a['bootup-time'] || a['long-tasks'];
console.log(`=== ${a['bootup-time'] ? 'BOOTUP TIME' : 'LONG TASKS'} ===`);
if (boot && boot.details && boot.details.items) {
  const items = [...boot.details.items].sort((x, y) => (y.duration || 0) - (x.duration || 0));
  const total = items.reduce((s, i) => s + (i.duration || 0), 0);
  console.log(`  total ${Math.round(total)}ms across ${items.length}; top 15:`);
  items.slice(0, 15).forEach((i) => {
    const label = i.url ? i.url.split('/').pop().slice(0, 44)
      : (i.groupLabel || i.group || i.taskName || '(grouped)');
    console.log(`  ${String(Math.round(i.duration)).padStart(6)}ms  ${label}`);
  });
} else console.log('  (no items)');
console.log('');

console.log('=== TBT ATTRIBUTION (long tasks >50ms) ===');
const lt = a['long-tasks'];
if (lt && lt.details && lt.details.items) {
  const rows = lt.details.items.map((i) => ({
    url: i.url || '(anonymous)',
    start: Math.round(i.startTime),
    dur: Math.round(i.duration),
    blocking: Math.round(Math.max(0, i.duration - 50)),
  })).sort((x, y) => y.blocking - x.blocking);
  const sum = rows.reduce((s, r) => s + r.blocking, 0);
  console.log(`  ${rows.length} long tasks, ${sum}ms blocking (TBT ${fmt(num('total-blocking-time'))})`);
  rows.slice(0, 12).forEach((r) => {
    console.log(`  blocking ${String(r.blocking).padStart(5)}ms (dur ${String(r.dur).padStart(5)}ms @${r.start}ms) ${r.url.split('/').pop().slice(0, 44)}`);
  });
  const byUrl = {};
  rows.forEach((r) => { byUrl[r.url] = (byUrl[r.url] || 0) + r.blocking; });
  console.log('  --- blocking ms by script ---');
  Object.entries(byUrl).sort((x, y) => y[1] - x[1]).slice(0, 12)
    .forEach(([u, ms]) => console.log(`  ${String(ms).padStart(6)}ms  ${u.split('/').pop().slice(0, 48)}`));
} else console.log('  (no long-tasks audit)');
console.log('');

const net = a['network-requests'];
if (net && net.details && net.details.items) {
  const byType = {};
  net.details.items.forEach((i) => {
    byType[i.resourceType] = (byType[i.resourceType] || 0) + (i.transferSize || 0);
  });
  console.log('=== TRANSFER BY TYPE ===');
  Object.entries(byType).sort((x, y) => y[1] - x[1])
    .forEach(([t, b]) => console.log(`  ${t.padEnd(14)} ${(b / 1024).toFixed(0).padStart(7)} KB`));
  console.log('=== LARGEST RESOURCES ===');
  [...net.details.items].sort((x, y) => (y.transferSize || 0) - (x.transferSize || 0)).slice(0, 12)
    .forEach((i) => console.log(`  ${((i.transferSize || 0) / 1024).toFixed(0).padStart(7)} KB ${i.resourceType.padEnd(10)} ${i.url.split('/').pop().slice(0, 42)}`));
  console.log('');
}
const uj = a['unused-javascript'];
if (uj && uj.details && uj.details.items && uj.details.items.length) {
  console.log('=== UNUSED JS (top) ===');
  uj.details.items.slice(0, 6).forEach((i) =>
    console.log(`  wasted ${((i.wastedBytes || 0) / 1024).toFixed(0).padStart(5)} KB of ${((i.totalBytes || 0) / 1024).toFixed(0).padStart(5)} KB  ${String(i.url).split('/').pop().slice(0, 44)}`));
}
process.exit(0);
