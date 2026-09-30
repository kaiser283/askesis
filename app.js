const KEY='ledger_v1';
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,'0');
const dstr=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=new Date(); const TODAY=dstr(today);
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{habits:[],logs:{},todos:{},moods:{},sleep:{}};
db.winterArc = db.winterArc || {};
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

function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
const earliestHabitDate = ()=> db.habits.length ? db.habits.reduce((m,h)=>h.createdAt<m?h.createdAt:m, db.habits[0].createdAt) : null;

function habitPctForDate(ds,d){
  const eh=earliestHabitDate();
  if(!eh || ds<eh || d>today) return null;
  return Math.round(db.habits.filter(h=>habitDone(h.id,ds)).length/db.habits.length*100);
}
function todoPctForDate(ds,d){
  if(d>today) return null;
  const list=db.todos[ds];
  if(!list||list.length===0) return null;
  return Math.round(list.filter(t=>t.done).length/list.length*100);
}
function sleepForDate(ds,d){
  if(d>today) return null;
  return db.sleep[ds]!==undefined?db.sleep[ds]:null;
}
function monthAvg(fn,y,m){
  let sum=0,count=0;
  for(let day=1;day<=daysInMonth(y,m);day++){
    const d=new Date(y,m,day); if(d>today) break;
    const v=fn(dstr(d),d);
    if(v!==null){sum+=v;count++;}
  }
  return count?Math.round((sum/count)*10)/10:null;
}

function linePath(points,w,h,pad,minY,maxY){
  const n=points.length; const stepX=n>1?(w-2*pad)/(n-1):0;
  let d='',dots='',started=false;
  points.forEach((v,i)=>{
    const x=pad+i*stepX;
    if(v===null||v===undefined){started=false;return;}
    const y=h-pad-((v-minY)/(maxY-minY||1))*(h-2*pad);
    d+=(started?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' ';
    dots+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="#c9a86a"/>`;
    started=true;
  });
  return {d,dots};
}
function renderLineChart(id,points,opts={}){
  const el=$('#'+id);
  const hasData=points.some(v=>v!==null&&v!==undefined);
  if(!hasData){ el.innerHTML=`<div class="empty">${opts.emptyText||'No data yet.'}</div>`; return; }
  const w=380,h=100,pad=14;
  const real=points.filter(v=>v!==null&&v!==undefined);
  const maxY=opts.maxY??Math.max(...real,1);
  const minY=opts.minY??0;
  const {d,dots}=linePath(points,w,h,pad,minY,maxY);
  const gl=[0,.5,1].map(f=>{const y=h-pad-f*(h-2*pad);return `<line x1="${pad}" x2="${w-pad}" y1="${y}" y2="${y}" stroke="#1e1e21" stroke-width="1"/>`}).join('');
  el.innerHTML=`<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${gl}<path d="${d}" fill="none" stroke="#c9a86a" stroke-width="1.5"/>${dots}</svg>`
    +(opts.foot?`<div class="chart-foot"><span>${opts.foot[0]}</span><span>${opts.foot[1]}</span></div>`:'');
}

const MONTH_NAMES=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function renderAnalytics(){
  const y=today.getFullYear(), m=today.getMonth();
  const dim=daysInMonth(y,m);
  const monthDates=Array.from({length:dim},(_,i)=>new Date(y,m,i+1));
  const monthDS=monthDates.map(dstr);
  const yearMonths=Array.from({length:12},(_,i)=>i);

  // Habits
  renderLineChart('chartHabitWeek', WEEK.map(d=>habitPctForDate(dstr(d),d)), {emptyText:'No habits yet — add one to see weekly progress.', foot:['Mon','Sun']});
  renderLineChart('chartHabitMonth', monthDates.map(d=>habitPctForDate(dstr(d),d)), {emptyText:'Not enough habit data this month yet.', foot:['1',String(dim)]});
  renderLineChart('chartHabitYear', yearMonths.map(mo=>monthAvg(habitPctForDate,y,mo)), {emptyText:'Not enough habit data this year yet.', foot:[MONTH_NAMES[0],MONTH_NAMES[11]]});

  // To-Do
  renderLineChart('chartTodoWeek', WEEK.map(d=>todoPctForDate(dstr(d),d)), {emptyText:'No tasks logged this week yet.', foot:['Mon','Sun']});
  renderLineChart('chartTodoMonth', monthDates.map(d=>todoPctForDate(dstr(d),d)), {emptyText:'No tasks logged this month yet.', foot:['1',String(dim)]});
  renderLineChart('chartTodoYear', yearMonths.map(mo=>monthAvg(todoPctForDate,y,mo)), {emptyText:'No tasks logged this year yet.', foot:[MONTH_NAMES[0],MONTH_NAMES[11]]});

  // Sleep
  const sleepMax=Math.max(10, ...Object.values(db.sleep), 1);
  renderLineChart('chartSleepWeek', WEEK.map(d=>sleepForDate(dstr(d),d)), {emptyText:'No sleep data yet — log your sleep to see trends.', minY:0, maxY:sleepMax, foot:['Mon','Sun']});
  renderLineChart('chartSleepMonth', monthDates.map(d=>sleepForDate(dstr(d),d)), {emptyText:'No sleep data logged this month yet.', minY:0, maxY:sleepMax, foot:['1',String(dim)]});
  renderLineChart('chartSleepYear', yearMonths.map(mo=>monthAvg(sleepForDate,y,mo)), {emptyText:'No sleep data logged this year yet.', minY:0, maxY:sleepMax, foot:[MONTH_NAMES[0],MONTH_NAMES[11]]});
}

const WARC_START=new Date(2026,9,1);
const WARC_DATES=Array.from({length:90},(_,i)=>{const d=new Date(WARC_START);d.setDate(WARC_START.getDate()+i);return d;});
const WARC_END=WARC_DATES[89];
const WARC_MILESTONES=[1,30,45,60,75,90];
function toggleWarc(ds){
  const cur=db.winterArc[ds];
  if(cur==='done') db.winterArc[ds]='missed';
  else if(cur==='missed') delete db.winterArc[ds];
  else db.winterArc[ds]='done';
  save(); renderAll();
}
function warcStats(){
  let completed=0,longest=0,run=0;
  WARC_DATES.forEach(d=>{ const st=db.winterArc[dstr(d)]; if(st==='done'){completed++;run++;longest=Math.max(longest,run);} else run=0; });
  let refIdx;
  if(today<WARC_START) refIdx=-1; else if(today>WARC_END) refIdx=89; else refIdx=Math.floor((today-WARC_START)/86400000);
  let cur=0;
  for(let i=refIdx;i>=0;i--){ if(db.winterArc[dstr(WARC_DATES[i])]==='done') cur++; else break; }
  return {completed,longest,cur,refIdx};
}
function renderWinterArc(){
  const s=warcStats();
  const dayNum=s.refIdx>=0?Math.min(s.refIdx+1,90):0;
  $('#warcDay').textContent=dayNum?`Day ${dayNum} / 90`:'Starts Oct 1, 2026';
  $('#warcDate').textContent=today.toLocaleDateString('default',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  const pct=Math.round(s.completed/90*100);
  $('#warcPct').textContent=pct+'%';
  $('#warcCount').textContent=`${s.completed} / 90`;
  $('#warcCur').textContent=s.cur+'d';
  $('#warcBest').textContent=s.longest+'d';
  $('#warcBarFill').style.width=pct+'%';
  $('#warcMilestones').innerHTML=WARC_MILESTONES.map(m=>{
    const reached=db.winterArc[dstr(WARC_DATES[m-1])]==='done';
    return `<span class="ms-chip ${reached?'reached':''}">Day ${m}${reached?' ✓':''}</span>`;
  }).join('');
  const day90done=db.winterArc[dstr(WARC_DATES[89])]==='done';
  $('#warcComplete').innerHTML=day90done?`<div class="celebrate" style="text-align:center;margin-bottom:12px"><div style="font-size:15px;font-weight:600">❄ Winter Arc Complete</div><div class="mut" style="margin-top:4px">${s.completed}/90 days completed · longest streak ${s.longest}d</div></div>`:'';
  const groups=[{label:'October 1–31',start:0,end:31},{label:'November 1–30',start:31,end:61},{label:'December 1–29',start:61,end:90}];
  $('#warcGrid').innerHTML=groups.map(g=>{
    let cells='';
    for(let i=g.start;i<g.end;i++){
      const d=WARC_DATES[i],ds=dstr(d),st=db.winterArc[ds],isToday=ds===TODAY;
      cells+=`<span class="warc-cell ${st==='done'?'done':''} ${st==='missed'?'missed':''} ${isToday?'today':''}" data-warc="${ds}" title="${d.toLocaleDateString('default',{month:'short',day:'numeric'})}">${d.getDate()}</span>`;
    }
    return `<div class="mut" style="font-size:11px;margin:10px 0 5px">${g.label}</div><div class="warc-grid">${cells}</div>`;
  }).join('');
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
  renderStats(); renderHabitTable(); renderTodos(); renderMood(); renderSleep(); renderQuote(); renderTop(); renderAnalytics(); renderCal(); renderWinterArc();
}

// events
document.body.addEventListener('click',e=>{
  const cell=e.target.closest('[data-hid]'); if(cell){toggleHabit(cell.dataset.hid,cell.dataset.ds);return;}
  const del=e.target.closest('[data-del]'); if(del){ if(confirm('Delete this habit and its history?')){ db.habits=db.habits.filter(h=>h.id!==del.dataset.del); Object.values(db.logs).forEach(l=>delete l[del.dataset.del]); save(); renderAll();} return;}
  const chk=e.target.closest('[data-tid]'); if(chk){ const t=(db.todos[TODAY]||[]).find(x=>x.id===chk.dataset.tid); if(t){t.done=!t.done; save(); renderAll();} return;}
  const tdel=e.target.closest('[data-tdel]'); if(tdel){ db.todos[TODAY]=(db.todos[TODAY]||[]).filter(x=>x.id!==tdel.dataset.tdel); save(); renderAll(); return;}
  const mood=e.target.closest('[data-mood]'); if(mood){ db.moods[TODAY]=parseInt(mood.dataset.mood); save(); renderAll(); return;}
  const warc=e.target.closest('[data-warc]'); if(warc){ toggleWarc(warc.dataset.warc); return;}
});
$('#warcNavBtn').onclick=()=>$('#winterArc').scrollIntoView({behavior:'smooth',block:'start'});
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
$('#resetBtn').onclick=()=>{ if(confirm('This will permanently erase all habits, tasks, mood, sleep and Winter Arc data on this device. Continue?')){ db={habits:[],logs:{},todos:{},moods:{},sleep:{},winterArc:{}}; save(); $('#modalBg').style.display='none'; renderAll(); } };
$('#exportBtn').onclick=()=>{
  const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ledger-export.json'; a.click();
};

renderAll();
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});
}
