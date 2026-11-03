// Counts one vote per GitHub user and redraws assets/votes.svg
const fs = require('fs');
const LABELS = {twring: 'Twring: voice notes both ways', bibrain: 'BiBrain: open public beta', new: 'Surprise me: a new product'};
const COLORS = {twring: '#7ee787', bibrain: '#a78bfa', new: '#f778ba'};
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function render(db){
  const total = Object.values(db.options).reduce((a,b)=>a+b,0);
  let y = 70, rows = '';
  for (const k of Object.keys(LABELS)) {
    const n = db.options[k]||0, pct = total? Math.round(n*100/total):0, w = Math.max(6, Math.round(520*pct/100));
    rows += `<text x="28" y="${y}" font-size="15" fill="#e6edf3">${esc(LABELS[k])}</text>
    <rect x="28" y="${y+10}" width="520" height="14" rx="7" fill="#21262d"/>
    <rect x="28" y="${y+10}" width="0" height="14" rx="7" fill="${COLORS[k]}"><animate attributeName="width" values="0;${w}" dur="1.2s" fill="freeze"/></rect>
    <text x="566" y="${y+22}" font-size="14" font-family="ui-monospace,Menlo,Consolas,monospace" fill="${COLORS[k]}">${pct}%  (${n})</text>`;
    y += 56;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="${y+10}" viewBox="0 0 900 ${y+10}" role="img" aria-label="Vote results: what Rish ships next">
  <rect x="1" y="1" width="898" height="${y+8}" rx="14" fill="#0d1117" stroke="#30363d"/>
  <g font-family="ui-sans-serif,-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
  <text x="28" y="38" font-size="18" font-weight="700" fill="#f0f6fc">What should I ship next?</text>
  <text x="872" y="38" text-anchor="end" font-size="13" font-family="ui-monospace,Menlo,Consolas,monospace" fill="#8b949e">${total} vote${total===1?'':'s'}, live</text>
  ${rows}</g></svg>`;
}
module.exports = {render};
if (require.main === module) {
  const db = JSON.parse(fs.readFileSync('votes.json','utf8'));
  const [choice, user] = process.argv.slice(2);
  if (choice && LABELS[choice] && user) {
    const prev = db.voters[user];
    if (prev && db.options[prev] > 0) db.options[prev]--;
    db.voters[user] = choice; db.options[choice]++;
    fs.writeFileSync('votes.json', JSON.stringify(db, null, 2) + '\n');
  }
  fs.writeFileSync('assets/votes.svg', render(db));
}
