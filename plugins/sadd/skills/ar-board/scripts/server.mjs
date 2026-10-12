#!/usr/bin/env node
// AR Board server: serves a board.json for keyboard triage (A = approve, R = reject, comment per item)
// and persists decisions to <board>.results.json. Zero dependencies. Exits after idle timeout.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const [boardPath, ...rest] = process.argv.slice(2);
if (!boardPath) {
  console.error('Usage: node server.mjs <board.json> [--port N] [--idle-minutes N]');
  process.exit(1);
}
const opt = (name, def) => {
  const i = rest.indexOf(name);
  return i >= 0 ? Number(rest[i + 1]) : def;
};
const idleMs = opt('--idle-minutes', 60) * 60_000;
const resultsPath = boardPath.replace(/\.json$/, '') + '.results.json';

const board = JSON.parse(fs.readFileSync(boardPath, 'utf8'));
if (!Array.isArray(board.items) || board.items.length === 0) {
  console.error('board.json must contain a non-empty "items" array');
  process.exit(1);
}
board.items.forEach((it, i) => { it.id = it.id ?? i + 1; });

let decisions = {};
if (fs.existsSync(resultsPath)) {
  try { decisions = JSON.parse(fs.readFileSync(resultsPath, 'utf8')).decisions ?? {}; } catch { /* start fresh */ }
}

const summary = () => {
  const list = board.items.map((it) => ({
    id: it.id,
    title: it.title,
    decision: decisions[it.id]?.decision ?? 'pending',
    comment: decisions[it.id]?.comment ?? '',
  }));
  return {
    title: board.title ?? 'AR Board',
    approved: list.filter((x) => x.decision === 'approved'),
    rejected: list.filter((x) => x.decision === 'rejected'),
    pending: list.filter((x) => x.decision === 'pending'),
    finished: Boolean(decisions.__finished),
    decisions,
  };
};
const save = () => fs.writeFileSync(resultsPath, JSON.stringify(summary(), null, 2));

let timer;
const touch = () => { clearTimeout(timer); timer = setTimeout(() => process.exit(0), idleMs); };

const json = (res, code, body) => {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};

const server = http.createServer((req, res) => {
  touch();
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(PAGE);
  }
  if (req.method === 'GET' && url.pathname === '/api/board') return json(res, 200, { board, decisions });
  if (req.method === 'GET' && url.pathname === '/api/results') return json(res, 200, summary());
  if (req.method === 'POST' && url.pathname === '/api/decision') {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => {
      try {
        const { id, decision, comment, finished } = JSON.parse(data);
        if (finished !== undefined) decisions.__finished = Boolean(finished);
        if (id !== undefined) {
          if (!board.items.some((it) => String(it.id) === String(id))) return json(res, 400, { error: 'unknown id' });
          if (!['approved', 'rejected', 'pending'].includes(decision)) return json(res, 400, { error: 'bad decision' });
          decisions[id] = { decision, comment: comment ?? '' };
        }
        save();
        json(res, 200, { ok: true });
      } catch {
        json(res, 400, { error: 'invalid json' });
      }
    });
    return;
  }
  json(res, 404, { error: 'not found' });
});

server.listen(opt('--port', 0), '127.0.0.1', () => {
  touch();
  const { port } = server.address();
  console.log(`AR_BOARD_URL=http://127.0.0.1:${port}`);
  console.log(`AR_BOARD_RESULTS=${path.resolve(resultsPath)}`);
});

const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>AR Board</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{--bg:#f6f7f9;--fg:#15171a;--card:#fff;--line:#d9dde3;--ok:#1a7f4b;--no:#b3261e;--mut:#6b7280}
@media(prefers-color-scheme:dark){:root{--bg:#0f1115;--fg:#e8eaed;--card:#181b21;--line:#2a2f38;--ok:#4cc38a;--no:#f2766e;--mut:#9aa3b2}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
header{display:flex;gap:16px;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--line);flex-wrap:wrap}
h1{font-size:16px;margin:0}.mut{color:var(--mut);font-size:13px}
main{max-width:900px;margin:0 auto;padding:16px}
.card{background:var(--card);border:2px solid var(--line);border-radius:10px;padding:14px;margin-bottom:12px}
.card.cur{border-color:var(--fg)}.card.approved{border-left:6px solid var(--ok)}.card.rejected{border-left:6px solid var(--no)}
.card h2{font-size:15px;margin:0 0 4px}.badge{font-size:12px;font-weight:600}
.approved .badge{color:var(--ok)}.rejected .badge{color:var(--no)}
iframe{width:100%;height:260px;border:1px solid var(--line);border-radius:6px;margin:8px 0;background:#fff}
textarea{width:100%;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:6px;font:inherit}
button{font:inherit;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:6px;padding:6px 12px;cursor:pointer}
button.ok{border-color:var(--ok);color:var(--ok)}button.no{border-color:var(--no);color:var(--no)}
kbd{border:1px solid var(--line);border-radius:4px;padding:0 5px;font-size:12px}
</style></head><body>
<header><div><h1 id="t">AR Board</h1><div class="mut" id="stats"></div></div>
<div class="mut"><kbd>A</kbd> approve · <kbd>R</kbd> reject · <kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>C</kbd> comment · <kbd>Esc</kbd> leave comment</div>
<button id="fin">Finished</button></header>
<main id="list"></main>
<script>
let items=[],dec={},cur=0;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const post=b=>fetch('/api/decision',{method:'POST',body:JSON.stringify(b)});
function render(){
  $('#list').innerHTML=items.map((it,i)=>{
    const d=dec[it.id]||{decision:'pending',comment:''};
    return '<section class="card '+d.decision+(i===cur?' cur':'')+'" data-i="'+i+'">'
    +'<h2>'+esc(it.id)+'. '+esc(it.title)+' <span class="badge">'+(d.decision==='pending'?'':d.decision.toUpperCase())+'</span></h2>'
    +'<div class="mut">'+esc(it.summary)+'</div>'
    +(it.html?'<iframe sandbox srcdoc="'+esc(it.html)+'"></iframe>':'')
    +'<textarea rows="1" placeholder="Why? (optional)" data-id="'+esc(it.id)+'">'+esc(d.comment)+'</textarea>'
    +'<div style="margin-top:6px;display:flex;gap:8px"><button class="ok" data-a="approved">Approve</button><button class="no" data-a="rejected">Reject</button></div></section>';
  }).join('');
  const n=k=>items.filter(it=>(dec[it.id]||{}).decision===k).length;
  $('#stats').textContent=n('approved')+' approved · '+n('rejected')+' rejected · '+(items.length-n('approved')-n('rejected'))+' pending';
  const c=document.querySelector('.card.cur');if(c)c.scrollIntoView({block:'nearest'});
}
function set(i,decision){
  const it=items[i],ta=document.querySelector('textarea[data-id="'+it.id+'"]');
  const comment=ta?ta.value:(dec[it.id]||{}).comment||'';
  dec[it.id]={decision,comment};post({id:it.id,decision,comment});
  if(i<items.length-1)cur=i+1;render();
}
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='TEXTAREA'){if(e.key==='Escape')e.target.blur();return;}
  const k=e.key.toLowerCase();
  if(k==='a')set(cur,'approved');else if(k==='r')set(cur,'rejected');
  else if(k==='arrowdown'){cur=Math.min(cur+1,items.length-1);render();}
  else if(k==='arrowup'){cur=Math.max(cur-1,0);render();}
  else if(k==='c'){e.preventDefault();document.querySelector('.card.cur textarea').focus();}
});
$('#list').addEventListener('click',e=>{
  const card=e.target.closest('.card');if(!card)return;cur=+card.dataset.i;
  if(e.target.dataset.a)set(cur,e.target.dataset.a);else if(e.target.tagName!=='TEXTAREA')render();
});
$('#list').addEventListener('change',e=>{
  if(e.target.tagName!=='TEXTAREA')return;
  const id=e.target.dataset.id,d=dec[id]||{decision:'pending'};
  dec[id]={decision:d.decision,comment:e.target.value};post({id,decision:d.decision,comment:e.target.value});
});
$('#fin').onclick=async()=>{await post({finished:true});$('#fin').textContent='Finished ✓ — return to your Claude Code session and say "finished"';};
fetch('/api/board').then(r=>r.json()).then(d=>{items=d.board.items;dec=d.decisions;$('#t').textContent=d.board.title||'AR Board';document.title=$('#t').textContent;render();});
</script></body></html>`;
