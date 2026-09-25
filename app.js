const KEY='ledger_v1';
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,'0');
const dstr=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=new Date(); const TODAY=dstr(today);
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{habits:[],logs:{},todos:{},moods:{},sleep:{}};
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}

function weekDates(offset=0){
  const d=new Date(today); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day+offset*7);
  return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return x});
}
const WEEK=weekDates(0);
const DOW=['MON','TUE','WED','THU','FRI','SAT','SUN'];

function habitDone(hid,ds){return !!(db.logs[ds]&&db.logs[ds][hid])}
function toggleHabit(hid,ds){
  db.logs[ds]=db.logs[ds]||{};
  if(db.logs[ds][hid]) delete db.logs[ds][hid]; else db.logs[ds][hid]=true;
  save(); renderAll();
}
function streaks(hid){
  let cur=0,best=0,run=0,total=0;
  let d=new Date(today);
  for(let i=0;i<3650;i++){
    const ds=dstr(d);
    if(db.logs[ds]&&db.logs[ds][hid]){ run++; total++; if(i===0||cur===i) cur=run; best=Math.max(best,run);}
    else { if(i===0) cur=0; run=0; if(dstr(d) < (db.habits.find(h=>h.id===hid)?.createdAt||'0')) break; }
    d.setDate(d.getDate()-1);
    if(i>0 && dstr(d) < (db.habits.find(h=>h.id===hid)?.createdAt||TODAY) ) break;
  }
  return {cur,best,total};
}
function habitPct(hid){
  const h=db.habits.find(x=>x.id===hid); if(!h) return 0;
  const start=new Date(h.createdAt); const days=Math.max(1,Math.round((today-start)/86400000)+1);
  let done=0; let d=new Date(start);
  for(let i=0;i<days;i++){ if(habitDone(hid,dstr(d))) done++; d.setDate(d.getDate()+1); }
  return Math.round(done/days*100);
}

function renderStats(){
  const habitsToday=db.habits.length? db.habits.filter(h=>habitDone(h.id,TODAY)).length:0;
  const todosToday=db.todos[TODAY]||[];
  const bestStreak=db.habits.reduce((m,h)=>Math.max(m,streaks(h.id).cur),0);
  const mood=db.moods[TODAY];
  const sleep=db.sleep[TODAY];
  const stats=[
    ['Habits Today',`${habitsToday}/${db.habits.length||0}`],
    ['Tasks Today',`${todosToday.filter(t=>t.done).length}/${todosToday.length}`],
    ['Best Streak',`${bestStreak}d`],
    ['Sleep',sleep?`${sleep}h`:'—'],
  ];
  $('#statGrid').innerHTML=stats.map(s=>`<div class="stat"><div class="l">${s[0]}</div><div class="v mono">${s[1]}</div></div>`).join('');
  const allDone=db.habits.length>0 && habitsToday===db.habits.length;
  $('#celebrateSlot').innerHTML=allDone?`<div class="celebrate">Perfect day — every habit completed.</div>`:'';
}

function renderHabitTable(){
  const t=$('#habitTable');
  if(db.habits.length===0){t.innerHTML=`<tr><td class="empty">No habits yet. Add your first habit below.</td></tr>`;return;}
  let h=`<tr><th class="hname">Habit</th>`+DOW.map((d,i)=>`<th>${d}${WEEK[i].getDate()===today.getDate()&&WEEK[i].getMonth()===today.getMonth()?'•':''}</th>`).join('')+`<th>Streak</th><th>%</th></tr>`;
  db.habits.forEach(hb=>{
    const s=streaks(hb.id);
    h+=`<tr><td class="hname">${hb.icon||'▪'} ${hb.name}<span class="del" data-del="${hb.id}">✕</span></td>`;
    WEEK.forEach(d=>{
      const ds=dstr(d); const on=habitDone(hb.id,ds); const future=d>today;
      h+=`<td><span class="cell ${on?'on':''}" ${future?'style="opacity:.3;pointer-events:none"':''} data-hid="${hb.id}" data-ds="${ds}">${on?'✓':'·'}</span></td>`;
    });
    h+=`<td class="streakcol">${s.cur}/${s.best}</td><td class="streakcol">${habitPct(hb.id)}%</td></tr>`;
  });
  t.innerHTML=h;
}

function renderTodos(){
  const list=db.todos[TODAY]||[];
  $('#todoCount').textContent=`${list.filter(t=>t.done).length} / ${list.length}`;
  $('#todoList').innerHTML=list.length?list.map(t=>`
    <div class="todo-item"><span class="chk ${t.done?'on':''}" data-tid="${t.id}"></span>
    <span class="tx ${t.done?'tdone':''}">${t.text}</span>
    <span class="del" data-tdel="${t.id}">✕</span></div>`).join(''):`<div class="empty">No tasks yet. Add something to your list.</div>`;
}

const MOODS=[['😄','Great'],['🙂','Good'],['😐','Okay'],['😕','Low'],['😞','Bad']];
function renderMood(){
  $('#moodRow').innerHTML=MOODS.map((m,i)=>`<span class="mood-btn ${db.moods[TODAY]===i?'sel':''}" data-mood="${i}" title="${m[1]}">${m[0]}</span>`).join('');
}
function renderSleep(){
  $('#sleepLast').textContent=db.sleep[TODAY]?`Logged: ${db.sleep[TODAY]}h today`:'Not logged today';
}

const QUOTES=[
  ["Discipline is choosing between what you want now and what you want most.",""],
  ["The days are long, but the practice is what remains.",""],
  ["Small repeated acts outweigh rare grand ones.",""],
  ["You do not rise to your goals; you fall to your habits.",""],
  ["Patience is not waiting — it is working while you wait.",""],
  ["What is done consistently compounds; what is done occasionally fades.",""],
  ["The obstacle in the path becomes the path.",""],
  ["Consistency turns intention into identity.",""],
  ["A day poorly closed is easier to lose than a day poorly started.",""],
  ["Growth is a series of small, unglamorous choices.",""],
];
function renderQuote(){
  const idx=Math.abs(TODAY.split('-').reduce((a,c)=>a+parseInt(c),0))%QUOTES.length;
  const q=QUOTES[idx];
  $('#quoteBox').innerHTML=`“${q[0]}”`;
}

function renderTop(){
  if(db.habits.length===0){$('#topHabits').innerHTML='<div class="empty">No habits yet.</div>';return;}
  const rows=db.habits.map(h=>({name:h.name,pct:habitPct(h.id),cur:streaks(h.id).cur,total:streaks(h.id).total}))
    .sort((a,b)=>b.pct-a.pct).slice(0,10);
  $('#topHabits').innerHTML=rows.map(r=>`<div class="toprow"><span class="name">${r.name}</span><span class="meta">${r.pct}% · ${r.cur}d streak · ${r.total} total</span></div>`).join('');
}

function renderChart(){
  const w=640,h=140,pad=20;
  const pts=WEEK.map(d=>{
    const ds=dstr(d);
    if(db.habits.length===0) return 0;
    const done=db.habits.filter(hb=>habitDone(hb.id,ds)).length;
    return Math.round(done/db.habits.length*100);
  });
  const stepX=(w-2*pad)/6;
  const coords=pts.map((p,i)=>[pad+i*stepX, h-pad-(p/100)*(h-2*pad)]);
  const path=coords.map((c,i)=>(i===0?'M':'L')+c[0].toFixed(1)+','+c[1].toFixed(1)).join(' ');
  const dots=coords.map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="2.6" fill="#c9a86a"/>`).join('');
  const gridlines=[0,25,50,75,100].map(v=>{const y=h-pad-(v/100)*(h-2*pad);return `<line x1="${pad}" x2="${w-pad}" y1="${y}" y2="${y}" stroke="#1e1e21" stroke-width="1"/>`}).join('');
  $('#chart').innerHTML=gridlines+`<path d="${path}" fill="none" stroke="#c9a86a" stroke-width="1.6"/>`+dots;
}

function renderCal(){
  const m=today.getMonth(),y=today.getFullYear();
  $('#calLabel').textContent=today.toLocaleString('default',{month:'long',year:'numeric'});
  const first=new Date(y,m,1); const startDow=(first.getDay()+6)%7;
  const daysIn=new Date(y,m+1,0).getDate();
  let html=['M','T','W','T','F','S','S'].map(d=>`<div class="dow">${d}</div>`).join('');
  for(let i=0;i<startDow;i++) html+='<div class="day empty"></div>';
  for(let d=1;d<=daysIn;d++){
    const ds=dstr(new Date(y,m,d));
    const hasData=db.habits.some(h=>habitDone(h.id,ds));
    const isToday=d===today.getDate();
    html+=`<div class="day ${isToday?'today':''}">${d}${hasData?'<span class="dot"></span>':''}</div>`;
  }
  $('#cal').innerHTML=html;
}

function renderAll(){
  const hr=today.getHours();
  $('#greet').textContent = hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  $('#dateline').textContent = today.toLocaleDateString('default',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  renderStats(); renderHabitTable(); renderTodos(); renderMood(); renderSleep(); renderQuote(); renderTop(); renderChart(); renderCal();
}

// events
document.body.addEventListener('click',e=>{
  const cell=e.target.closest('[data-hid]'); if(cell){toggleHabit(cell.dataset.hid,cell.dataset.ds);return;}
  const del=e.target.closest('[data-del]'); if(del){ if(confirm('Delete this habit and its history?')){ db.habits=db.habits.filter(h=>h.id!==del.dataset.del); Object.values(db.logs).forEach(l=>delete l[del.dataset.del]); save(); renderAll();} return;}
  const chk=e.target.closest('[data-tid]'); if(chk){ const t=(db.todos[TODAY]||[]).find(x=>x.id===chk.dataset.tid); if(t){t.done=!t.done; save(); renderAll();} return;}
  const tdel=e.target.closest('[data-tdel]'); if(tdel){ db.todos[TODAY]=(db.todos[TODAY]||[]).filter(x=>x.id!==tdel.dataset.tdel); save(); renderAll(); return;}
  const mood=e.target.closest('[data-mood]'); if(mood){ db.moods[TODAY]=parseInt(mood.dataset.mood); save(); renderAll(); return;}
});
$('#addHabitBtn').onclick=()=>{
  const inp=$('#newHabit'); const name=inp.value.trim();
  if(!name) return;
  if(db.habits.length>=15){alert('Maximum of 15 habits.');return;}
  db.habits.push({id:'h'+Date.now(),name,icon:'',createdAt:TODAY});
  inp.value=''; save(); renderAll();
};
$('#newHabit').addEventListener('keydown',e=>{if(e.key==='Enter')$('#addHabitBtn').click()});
$('#addTodoBtn').onclick=()=>{
  const inp=$('#newTodo'); const text=inp.value.trim(); if(!text)return;
  db.todos[TODAY]=db.todos[TODAY]||[]; db.todos[TODAY].push({id:'t'+Date.now(),text,done:false});
  inp.value=''; save(); renderAll();
};
$('#newTodo').addEventListener('keydown',e=>{if(e.key==='Enter')$('#addTodoBtn').click()});
$('#sleepSave').onclick=()=>{
  const v=parseFloat($('#sleepInput').value); if(isNaN(v))return;
  db.sleep[TODAY]=v; save(); renderAll();
};
$('#settingsBtn').onclick=()=>$('#modalBg').style.display='flex';
$('#closeModal').onclick=()=>$('#modalBg').style.display='none';
$('#resetBtn').onclick=()=>{ if(confirm('This will permanently erase all habits, tasks, mood and sleep data on this device. Continue?')){ db={habits:[],logs:{},todos:{},moods:{},sleep:{}}; save(); $('#modalBg').style.display='none'; renderAll(); } };
$('#exportBtn').onclick=()=>{
  const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ledger-export.json'; a.click();
};

renderAll();
