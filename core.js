/* core.js — 공용 도구: 시간, 저장, 이미지 DB, 다이얼로그, 아이콘 */
(function(){
const D = window.PHONE_DATA;
const K = window.K = { D, apps:{}, state:null, photos:[], urls:{} };

/* ---------- 작은 DOM 헬퍼 ---------- */
K.$ = (s, r=document) => r.querySelector(s);
K.$$ = (s, r=document) => [...r.querySelectorAll(s)];
K.h = function(tag, props, ...kids){
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(props||{})){
    if (v==null || v===false) continue;
    if (k==='class') el.className = v;
    else if (k==='style') typeof v==='string' ? el.style.cssText=v : Object.assign(el.style,v);
    else if (k==='html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v===true?'':v);
  }
  for (const c of kids.flat(9)){ if (c==null||c===false) continue; el.append(c.nodeType?c:document.createTextNode(c)); }
  return el;
};
const h = K.h;

/* ---------- 시간 ---------- */
let offsetMs = 0;
if (D.settings.fixedNow) offsetMs = +new Date(D.settings.fixedNow) - Date.now();
else if (D.settings.fixedTime){ const n=new Date(), [fh,fm]=D.settings.fixedTime.split(':'); offsetMs = +new Date(n.getFullYear(),n.getMonth(),n.getDate(),+fh,+fm,0) - Date.now(); }
K.now = () => new Date(Date.now() + offsetMs);
const DOW = ['일','월','화','수','목','금','토'];
K.DOW = DOW;
K.dayStart = d => { const x=new Date(d); x.setHours(0,0,0,0); return x; };
K.dayDiff = (a,b) => Math.round((K.dayStart(a)-K.dayStart(b))/86400000);
K.atFixed = (offset, time) => { const sd=D.settings.storyToday; if(!sd) return K.at(offset,time); const [y,m,dd]=sd.split('-').map(Number); const d=new Date(y,m-1,dd+offset); const [H,M]=time.split(':'); d.setHours(+H,+M,0,0); return +d; };   // 소설 속 '오늘'을 고정 날짜로
K.at = (offset, time) => { let n=K.now(); const ft=D.settings.fixedToday; if(ft){ const [fy,fm,fd]=ft.split('-').map(Number); n=new Date(fy,fm-1,fd); } const d=new Date(n.getFullYear(),n.getMonth(),n.getDate()+offset); const [H,M]=time.split(':'); d.setHours(+H,+M,0,0); return +d; };
K.hm = ts => { const d=new Date(ts); const H=d.getHours(), M=String(d.getMinutes()).padStart(2,'0'); return (H<12?'오전 ':'오후 ')+(H%12||12)+':'+M; };
K.hm24 = ts => { const d=new Date(ts); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
K.mdw = ts => { const d=new Date(ts); return (d.getMonth()+1)+'월 '+d.getDate()+'일 '+DOW[d.getDay()]+'요일'; };
K.ymdw = ts => { const d=new Date(ts); return d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 '+DOW[d.getDay()]+'요일'; };
K.listTime = ts => {            // 목록 오른쪽에 표시되는 시간
  if(D.settings.fixedToday){ const d=new Date(ts), fy=+D.settings.fixedToday.slice(0,4); return (d.getFullYear()!==fy?d.getFullYear()+'. ':'')+(d.getMonth()+1)+'월 '+d.getDate()+'일'; }   // 날짜 고정 모드: '어제·요일' 대신 날짜
  const n = K.now(), diff = K.dayDiff(n, ts);
  if (diff<=0) return K.hm(ts);
  if (diff===1) return '어제';
  if (diff<7) return DOW[new Date(ts).getDay()]+'요일';
  const d=new Date(ts); return (d.getFullYear()!==n.getFullYear()?d.getFullYear()+'. ':'')+(d.getMonth()+1)+'월 '+d.getDate()+'일';
};
K.relDay = ts => { if(D.settings.fixedToday){ const d=new Date(ts); return d.getFullYear()+'년 '+(d.getMonth()+1)+'월'; } const diff=K.dayDiff(K.now(),ts); return diff<=0?'오늘':diff===1?'어제':diff<8?'지난 7일':diff<31?'지난 30일':new Date(ts).getFullYear()+'년 '+(new Date(ts).getMonth()+1)+'월'; };
K.ymd = d => { d=new Date(d); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };

/* ---------- 시스템 상태 (제어 센터·상태 표시줄·잠금 화면·설정 앱이 같이 쓰는 값) ---------- */
K.SYSKEYS = ['lowPower','silent','notificationPreview','doNotDisturb','volume','batteryLevel','lockWidgets','brightness','focus'];
K.sysDefaults = () => ({ lowPower:false, silent:false, notificationPreview:'always', doNotDisturb:false, volume:.5,
  batteryLevel:(typeof D.settings.battery==='number'?D.settings.battery:75), lockWidgets:{calendar:true,weather:true,order:['weather','calendar'],calWeeks:3,wxHiLo:true} });
const SYSKEY = 'kyh_iphone_sys_t1';
K.fillSys = ui => {                       // 저장돼 있던 값은 그대로 두고, 없는 시스템 값만 기본값으로 보충
  const df=K.sysDefaults(); Object.keys(df).forEach(k=>{ if(ui[k]===undefined) ui[k]=df[k]; });
  if(typeof ui.lockWidgets!=='object'||!ui.lockWidgets) ui.lockWidgets=df.lockWidgets;
  else Object.keys(df.lockWidgets).forEach(k=>{ if(ui.lockWidgets[k]===undefined) ui.lockWidgets[k]=Array.isArray(df.lockWidgets[k])?df.lockWidgets[k].slice():df.lockWidgets[k]; });
  if(ui.focus && ui.focus['방해 금지'] && !ui._dndMig){ ui.doNotDisturb=true; }   // 예전 집중 모드의 방해 금지 값 이어받기
  ui._dndMig=true;
  if(!['always','unlocked','never'].includes(ui.notificationPreview)) ui.notificationPreview='always';
  ui.batteryLevel=Math.max(1,Math.min(100,+ui.batteryLevel||df.batteryLevel)); ui.volume=Math.max(0,Math.min(1,+ui.volume)); if(isNaN(ui.volume)) ui.volume=df.volume;
  ui.brightness=Math.max(.15,Math.min(1,+ui.brightness||1));
  return ui; };
K.saveSys = () => { try{ const u=K.state.ui, o={}; K.SYSKEYS.forEach(k=>{ if(u[k]!==undefined) o[k]=u[k]; }); localStorage.setItem(SYSKEY, JSON.stringify(o)); }catch(e){} };   // 읽기 전용 사이트에서도 이 기기의 시스템 설정은 새로고침 후 유지
K.loadSys = ui => { try{ const o=JSON.parse(localStorage.getItem(SYSKEY)||'null'); if(o&&typeof o==='object') K.SYSKEYS.forEach(k=>{ if(o[k]!==undefined) ui[k]=o[k]; }); if(o) ui._dndMig=true; }catch(e){} };
/* ---------- 상태 만들기 / 저장 ---------- */
const KEY = 'kyh_iphone_state_v1';
function build(){
  const S = { v:D.version, builtOn:K.ymd(K.now()),
    ui:{ passcode:D.settings.passcode, brightness:1, wallLock:'', wallHome:'', airplane:false, wifi:true, bt:true, cell:true, flash:false, ownerName:D.settings.ownerName, status:D.settings.statusMessage,
          ...K.sysDefaults() },
    notes: D.notes.map(n=>({id:n.id, ts:K.at(n.day,n.time), pinned:!!n.pinned, folder:n.folder||'', body:n.body})),
    chats: D.chats.map(c=>({id:c.id, with:c.with, title:c.title, pinned:!!c.pinned, members:c.members||null, avatarText:c.avatarText||'', autoReply:c.autoReply||null, flow:c.flow||null, cmd:c.cmd||null, alt:c.alt||null, rand:c.rand||null,
      msgs:c.msgs.map(m=>({from:m.from, name:m.name||'', ts:K.atFixed(m.day,m.time), text:m.text||'', img:m.img||'', link:m.link||null, sys:m.sys||'', call:m.call||'', unread:!!m.unread}))})),
    sms: D.sms.map(s=>({id:s.id, name:s.name, avatar:s.avatar, msgs:s.msgs.map(m=>({from:m.from, ts:K.at(m.day,m.time), text:m.text, unread:false}))})),
    calls: D.calls.map(c=>({c:c.c, num:'', type:c.type, ts:K.at(c.day,c.time), dur:c.dur||''})),
    events: D.events.map((e,i)=>({id:'e'+i, ts:K.at(e.day,e.time), end:e.end||'', title:e.title, place:e.place||'', color:e.color, allDay:!!e.allDay})),
    seedFav:{}, hiddenSeeds:[], missed:[], igPosts:[], notiDismissed:[], ddays:D.ddays.map(x=>({...x})), searches:[...D.searches]
  };
  return S;
}
K.RO = !!D.settings.readOnly;
K.ADMIN = !!D.settings.admin;   /* 관리자용 아이폰(admin-phone)에서만 true */
K.adminKey = () => { try{ return localStorage.getItem('kyh_admin_key')||''; }catch(e){ return ''; } };
K.roToast = () => K.toast('읽기 전용이라 바꿀 수 없어요');
K.save = () => { if(K.state&&K.state.ui) K.saveSys(); if(K.RO) return; try{ localStorage.setItem(KEY, JSON.stringify(K.state)); }catch(e){} };
function shiftDays(S, days){ if(D.settings.fixedToday) return;            // 며칠 지났으면 모든 시각을 같이 밀어서 "최근"처럼 보이게
  const ms = days*86400000, sh = o => { if(o && typeof o.ts==='number') o.ts += ms; };
  S.notes.forEach(sh); if(!D.settings.storyToday) S.chats.forEach(c=>c.msgs.forEach(sh)); S.sms.forEach(c=>c.msgs.forEach(sh));
  S.calls.forEach(sh); S.events.filter(e=>!e.user).forEach(sh);
}
K.load = function(){
  let S=null;
  if(!K.RO){ try{ S = JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){} }
  const OLDUI = S&&S.ui;
  if (!S || S.v!==D.version){ S = build(); if(OLDUI) K.SYSKEYS.forEach(k=>{ if(OLDUI[k]!==undefined) S.ui[k]=OLDUI[k]; }); }
  S.ui = S.ui||{}; if(!Array.isArray(S.missed)) S.missed=[];
  else {
    const diff = K.dayDiff(K.now(), new Date(S.builtOn+'T00:00:00'));
    if (diff>0 && !D.settings.fixedNow){ shiftDays(S, diff); S.builtOn = K.ymd(K.now()); }
  }
  K.loadSys(S.ui); K.fillSys(S.ui);
  K.state = S; K.save();
};
K.reset = async function(){
  try{ localStorage.removeItem(KEY); }catch(e){}
  await K.idbClear(); location.reload();
};

/* ---------- IndexedDB (사진/배경화면 보관) ---------- */
let _db;
function db(){
  if (_db) return _db;
  _db = new Promise((res,rej)=>{
    try{
      const rq = indexedDB.open('kyh_iphone', 1);
      rq.onupgradeneeded = () => { const d=rq.result; d.createObjectStore('photos',{keyPath:'id'}); d.createObjectStore('misc',{keyPath:'id'}); };
      rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
    }catch(e){ rej(e); }
  });
  return _db;
}
const tx = async (st, mode, fn) => { try{ const d=await db(); return await new Promise((res,rej)=>{ const t=d.transaction(st,mode); const r=fn(t.objectStore(st)); t.oncomplete=()=>res(r&&r.result); t.onerror=()=>rej(t.error); }); }catch(e){ return null; } };
K.idbPut = (st,v) => tx(st,'readwrite',s=>s.put(v));
K.idbDel = (st,id) => tx(st,'readwrite',s=>s.delete(id));
K.idbAll = async st => (await tx(st,'readonly',s=>s.getAll())) || [];
K.idbGet = (st,id) => tx(st,'readonly',s=>s.get(id));
K.idbClear = async () => { await tx('photos','readwrite',s=>s.clear()); await tx('misc','readwrite',s=>s.clear()); };

K.url = rec => { if(!rec) return ''; if(!K.urls[rec.id]) K.urls[rec.id]=URL.createObjectURL(rec.blob); return K.urls[rec.id]; };
K.loadPhotos = async () => { if(K.RO){ K.photos=[]; return; } K.photos = (await K.idbAll('photos')).sort((a,b)=>b.ts-a.ts); };
K.addPhoto = async (file, extra={}) => {
  const rec = { id:'u'+Date.now()+Math.random().toString(36).slice(2,6), blob:file, ts:file.lastModified||Date.now(), fav:false, album:'', ...extra };
  await K.idbPut('photos', rec); K.photos.unshift(rec); K.photos.sort((a,b)=>b.ts-a.ts); return rec;
};
K.pickFiles = (cb, multiple=true, force=false) => {
  if(K.RO&&!force){ K.roToast(); return; }
  const inp = K.$('#fileIn'); inp.value=''; inp.multiple = multiple;
  inp.onchange = () => { const fs=[...inp.files]; if(fs.length) cb(fs); };
  inp.click();
};
K.resizeToDataURL = (file, max=640) => new Promise(res=>{
  const img = new Image(), u = URL.createObjectURL(file);
  img.onload = () => { const r=Math.min(1,max/Math.max(img.width,img.height)); const c=document.createElement('canvas'); c.width=img.width*r; c.height=img.height*r; c.getContext('2d').drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg',.78)); };
  img.onerror = () => res(''); img.src = u;
});

/* ---------- 연락처 ---------- */
K.contact = id => D.contacts.find(c=>c.id===id);
K.cname = id => (K.contact(id)||{}).name || id;
K.initial = name => { const m=[...name.replace(/[^\p{L}\p{N}\p{Emoji_Presentation}]/gu,'')]; return m[0]||'?'; };
K.avatarStyle = c => `background:linear-gradient(145deg,${(c&&c.color||['#cfd4dc','#9aa3b2'])[0]},${(c&&c.color||['#cfd4dc','#9aa3b2'])[1]})`;
K.choseong = s => { const ch=s.replace(/^[^\p{L}]+/u,'')[0]||'#'; const c=ch.charCodeAt(0); if(c>=0xAC00&&c<=0xD7A3){ const L='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'[Math.floor((c-0xAC00)/588)]; return {'ㄲ':'ㄱ','ㄸ':'ㄷ','ㅃ':'ㅂ','ㅆ':'ㅅ','ㅉ':'ㅈ'}[L]||L; } return /[a-z]/i.test(ch)?ch.toUpperCase():'#'; };

/* ---------- 다이얼로그 ---------- */
K.toast = msg => { const t=K.$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(K._tt); K._tt=setTimeout(()=>t.classList.remove('show'),1800); };
K.alert = (title,msg,buttons=[{t:'확인'}]) => {
  const o=K.$('#overlay'); o.innerHTML='';
  const d=h('div',{class:'dlg'}, h('div',{class:'bd'}, h('h4',{},title), msg?h('p',{},msg):null),
    h('div',{class:'btns'}, buttons.map(b=>h('button',{class:b.red?'red':'',onclick:()=>{o.classList.remove('show'); if(K.RO&&b.red){K.roToast();return;} b.fn&&b.fn();}},b.t))));
  o.append(d); o.classList.add('show');
};
K.prompt = (title,value,cb,{multiline=false,ok='확인'}={}) => {
  if(K.RO){ K.roToast(); return; }
  const o=K.$('#overlay'); o.innerHTML='';
  const inp = h(multiline?'textarea':'input',{value:value||'', rows:3}); if(multiline) inp.value=value||''; else inp.value=value||'';
  const d=h('div',{class:'dlg'}, h('div',{class:'bd'}, h('h4',{},title), inp),
    h('div',{class:'btns'}, h('button',{onclick:()=>o.classList.remove('show')},'취소'), h('button',{onclick:()=>{o.classList.remove('show'); cb(inp.value);}},ok)));
  o.append(d); o.classList.add('show'); setTimeout(()=>inp.focus(),80);
};
K.sheet = (title, items) => {
  const w=K.$('#sheetWrap'); w.innerHTML='';
  const close=()=>w.classList.remove('show');
  const s=h('div',{class:'sheet'}, h('div',{class:'grp'}, title?h('div',{class:'st'},title):null, items.map(i=>h('button',{class:i.red?'red':'',onclick:()=>{close(); if(K.RO&&i.red){K.roToast();return;} i.fn&&i.fn();}},i.t))), h('div',{class:'grp'}, h('button',{class:'cancel',onclick:close},'취소')));
  w.append(s); w.classList.add('show'); w.onclick = e=>{ if(e.target===w) close(); };
};

/* ---------- 앱 안의 화면 전환 (iOS식 푸시/팝) ---------- */
K.makeNav = function(root){
  const stack=[];
  const nav = {
    push(page){
      const prev = stack[stack.length-1];
      page.classList.add('enter'); root.append(page); stack.push(page);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{ page.classList.remove('enter'); prev&&prev.classList.add('under'); }));
      return page;
    },
    pop(){
      if (stack.length<2) return false;
      const cur=stack.pop(), prev=stack[stack.length-1];
      cur.classList.add('leave'); prev.classList.remove('under');
      setTimeout(()=>cur.remove(),380); return true;
    },
    replace(page){ stack.forEach(p=>p.remove()); stack.length=0; root.append(page); stack.push(page); },
    get depth(){ return stack.length; }
  };
  return nav;
};
K.page = (...kids) => h('div',{class:'page'}, ...kids);
K.back = (label, fn) => h('button',{onclick:fn}, h('span',{html:'<svg class="chev" viewBox="0 0 12 20"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'}), label||'');

/* ---------- 앱 아이콘 (SVG) ---------- */
const svg = (inner, vb='0 0 60 60') => `<svg viewBox="${vb}">${inner}</svg>`;
const grad = (id,a,b,dir='v') => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="${dir==='v'?0:1}" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="60" height="60" fill="url(#${id})"/>`;
const PHONE_PATH = 'M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z';
K.PHONE_PATH = PHONE_PATH;
const ICONS = {
  phone: () => svg(grad('gp','#67ee7a','#12b337')+`<g transform="translate(13 13) scale(1.5)"><path d="${PHONE_PATH}" fill="#fff"/></g>`),
  kakao: () => svg(`<rect width="60" height="60" fill="#fee500"/><ellipse cx="30" cy="28.5" rx="19.5" ry="15.5" fill="#3a1d1d"/><path d="M19 40.5 17 50l12.5-7z" fill="#3a1d1d"/>`),
  messages: () => svg(`<defs><linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9af28b"/><stop offset="1" stop-color="#4fc34a"/></linearGradient><linearGradient id="gmb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d7f5d2"/></linearGradient></defs><rect width="60" height="60" fill="url(#gm)"/><ellipse cx="30" cy="28" rx="20" ry="15.500" fill="url(#gmb)"/><path d="M15 40c0 3.500-2 6-5 7.500 4.500.6 8.500-1 11-3.500z" fill="#d7f5d2"/>`),
  photos: () => { const cs=['#ff5f57','#ffb100','#ffe600','#7ed321','#00d1b2','#1e90ff','#5e5ce6','#d94fe0']; return svg(`<rect width="60" height="60" fill="#fff"/>`+cs.map((c,i)=>`<ellipse cx="30" cy="19" rx="7.5" ry="12" fill="${c}" opacity=".82" transform="rotate(${i*45} 30 30)" style="mix-blend-mode:multiply"/>`).join('')); },
  camera: () => svg(grad('gc','#9a9aa0','#5b5b60')+`<rect x="9" y="19" width="42" height="28" rx="6" fill="#1c1c1e"/><path d="M21 19l3-5h12l3 5z" fill="#1c1c1e"/><circle cx="30" cy="33" r="10.5" fill="#3a3a3f"/><circle cx="30" cy="33" r="7.5" fill="#101012"/><circle cx="27.5" cy="30.5" r="2" fill="#6b6b7a"/><circle cx="43" cy="24.5" r="1.8" fill="#ffd60a"/>`),
  clock: () => svg(`<rect width="60" height="60" fill="#000"/><circle cx="30" cy="30" r="25" fill="#fff"/>`+[...Array(12)].map((_,k)=>`<rect x="29.3" y="7" width="1.4" height="${k%3?2.5:4.5}" fill="#111" transform="rotate(${k*30} 30 30)"/>`).join('')+`<rect class="ck-h" x="29" y="16" width="2.4" height="15.500" rx="1.2" fill="#111" transform="rotate(0 30 30)"/><rect class="ck-m" x="29.100" y="9.500" width="1.900" height="22" rx="1" fill="#111" transform="rotate(0 30 30)"/><rect class="ck-s" x="29.400" y="8.500" width="1.200" height="26" fill="#ff9500" transform="rotate(0 30 30)"/><circle cx="30" cy="30" r="2" fill="#ff9500"/>`),  maps: () => svg(`<rect width="60" height="60" fill="#e7efdc"/><path d="M0 40 60 20" stroke="#fff" stroke-width="9"/><path d="M8 0 30 60" stroke="#f5d86e" stroke-width="6"/><rect x="38" y="36" width="22" height="24" fill="#a8d4f5"/><path d="M30 12c-6 0-10 4.2-10 9.5C20 29 30 40 30 40s10-11 10-18.500C40 16.2 36 12 30 12z" fill="#ff3b30"/><circle cx="30" cy="21.500" r="3.800" fill="#fff"/>`),
  weather: () => svg(grad('gw','#2d78e8','#74c2ff')+`<circle cx="22" cy="22" r="9" fill="#ffd60a"/><path d="M20 44c-5 0-9-3-9-7.500s4-7 8-6.500c1-5 5.500-8 10.500-7 5 .8 8 4.500 8 8.500 5 0 8.500 3 8.500 6.500s-3 6.500-8 6.500z" fill="#fff"/>`),
  notes: () => svg(`<rect width="60" height="60" fill="#fff"/><rect width="60" height="16" fill="#ffd60a"/><path d="M0 28h60M0 38h60M0 48h60" stroke="#e5e5ea" stroke-width="1.4"/>`),
  music: () => svg(grad('gmu','#ff6a7a','#fa233b')+`<path d="M38 15 24 18v21.500a6 6 0 1 0 3.500 5.400V25l7-1.500v11.500a6 6 0 1 0 3.500 5.400z" fill="#fff"/>`),
  safari: () => svg(`<rect width="60" height="60" fill="#fff"/><circle cx="30" cy="30" r="22" fill="#e6f1ff" stroke="#1d8bff" stroke-width="2.5"/>`+[...Array(12)].map((_,i)=>`<rect x="29.5" y="9" width="1" height="${i%3?2:3.5}" fill="#889" transform="rotate(${i*30} 30 30)"/>`).join('')+`<path d="M44 16 33.500 33.500 26.500 26.500z" fill="#ff3b30"/><path d="M16 44l10.500-17.500 7 7z" fill="#cfd8e3"/>`),
  instagram: () => svg(`<defs><linearGradient id="gi" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".35" stop-color="#fa7e1e"/><stop offset=".6" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect width="60" height="60" fill="url(#gi)"/><rect x="14" y="14" width="32" height="32" rx="10" fill="none" stroke="#fff" stroke-width="3.2"/><circle cx="30" cy="30" r="7.500" fill="none" stroke="#fff" stroke-width="3.200"/><circle cx="40" cy="20" r="2.200" fill="#fff"/>`),
  youtube: () => svg(`<rect width="60" height="60" fill="#fff"/><rect x="7" y="15" width="46" height="32" rx="10" fill="#ff0000"/><path d="M25 23v16l14-8z" fill="#fff"/>`),
  mail: () => svg(grad('gml','#5ec8ff','#1a7cf0')+`<rect x="9" y="16" width="42" height="29" rx="4" fill="#fff"/><path d="M10 19l20 15 20-15" fill="none" stroke="#1a7cf0" stroke-width="3" stroke-linejoin="round"/>`),
  dday: () => svg(grad('gd','#ff6b81','#e8264a')+`<path d="M30 46C14 35 12 25 17 20.500c4-3.500 9-1.500 13 3 4-4.500 9-6.500 13-3 5 4.500 3 14.500-13 25.500z" fill="#fff"/>`),
  health: () => svg(`<rect width="60" height="60" fill="#fff"/><path d="M30 47C16 38 14 28 18.500 23.500c3.500-3.500 8.500-2.500 11.500 2 3-4.500 8-5.500 11.500-2C46 28 44 38 30 47z" fill="#ff2d55"/>`),
  wallet: () => svg(`<rect width="60" height="60" fill="#000"/><rect x="10" y="14" width="40" height="9" rx="3" fill="#ff9500"/><rect x="10" y="20" width="40" height="9" rx="3" fill="#34c759"/><rect x="10" y="26" width="40" height="9" rx="3" fill="#0a84ff"/><rect x="8" y="31" width="44" height="19" rx="4" fill="#2b2b2e"/><rect x="38" y="38" width="9" height="5" rx="2.500" fill="#000"/>`),
  settings: () => svg(grad('gs','#a4a4aa','#6d6d73')+`<circle cx="30" cy="30" r="17" fill="none" stroke="#e6e6ea" stroke-width="8" stroke-dasharray="6.24 6.24"/><circle cx="30" cy="30" r="14" fill="#dcdce1"/><circle cx="30" cy="30" r="6" fill="#75757b"/>`)
};
K.ICONS = ICONS;
const EMO = { coupang:['📦','#e5352b'], carrot:['🥕','#ff8a3d'], shcard:['💳','#14213d'], musinsa:['MUSINSA','#000'], drive:['🚗','#2f6bff'], ktaxi:['🚕','#fee500'], nmap:['📍','#03c75a'], pub:['정유','#e9dcc5'] };
const IMGIC = { phone:'ic-phone.jpg', safari:'ic-safari.jpg', mail:'ic-mail.jpg', instagram:'ic-insta.jpg' };
K.icon = function(id){
  if (id==='pub') return h('span',{class:'icon',style:'background:url(photos/pub-icon.jpg) center/cover no-repeat'});
  if (id==='mapo') return h('span',{class:'icon',style:'background:#2c3440 url(photos/app-mapo.jpg) center/cover no-repeat'});
  if (id==='shcard') return h('span',{class:'icon',style:'background:url(photos/shcard-icon.jpg) center/cover no-repeat'});
  if (IMGIC[id]) return h('span',{class:'icon',style:'background:url(photos/'+IMGIC[id]+') center/cover no-repeat'});
  if (id==='calendar'){ const n=K.now(); return h('span',{class:'icon cal'}, h('b',{},DOW[n.getDay()]+'요일'), h('i',{},String(n.getDate()))); }
  if (EMO[id]){ const t=EMO[id][0]; const ts = id==='pub'?';font-size:19px;font-weight:700;color:#5a4426':(t.length>2?';font-size:10.5px;font-weight:800;color:#fff;letter-spacing:.3px':''); return h('span',{class:'icon emo',style:`background:${EMO[id][1]}${ts}`}, t); }
  if (id==='music') return h('span',{class:'icon',style:'background:url(photos/music-icon.jpg) center/cover no-repeat'});
  return h('span',{class:'icon',html:(ICONS[id]||ICONS.settings)()});
};
/* 시계 앱 아이콘: 폰 시간과 같은 시각을 가리키게 */
K.tickClockIcon = function(){
  const n=K.now(), s=n.getSeconds()+n.getMilliseconds()/1000, m=n.getMinutes()+s/60, hh=(n.getHours()%12)+m/60;
  document.querySelectorAll('.ck-h').forEach(e=>e.setAttribute('transform',`rotate(${hh*30} 30 30)`));
  document.querySelectorAll('.ck-m').forEach(e=>e.setAttribute('transform',`rotate(${m*6} 30 30)`));
  document.querySelectorAll('.ck-s').forEach(e=>e.setAttribute('transform',`rotate(${s*6} 30 30)`));
};
setInterval(K.tickClockIcon,500); setTimeout(K.tickClockIcon,0);
K.appName = {mapo:'마포한강래미안',youtube:'YouTube',mail:'메일',pub:'정유출판사',shcard:'MY 신현',coupang:'쿠팡',carrot:'당근',musinsa:'무신사',drive:'운전면허연습',ktaxi:'카카오택시',nmap:'네이버지도',phone:'전화',kakao:'카카오톡',messages:'메시지',calendar:'캘린더',photos:'사진',camera:'카메라',notes:'메모',maps:'지도',weather:'날씨',clock:'시계',music:'Music',safari:'Safari',instagram:'Instagram',dday:'디데이',health:'건강',wallet:'지갑',coupang:'쿠팡',carrot:'당근',settings:'설정'};

/* ---------- 알림 ---------- */
K.notis = () => D.notifications.map((n,i)=>({...n, id:'n'+i})).filter(n=>!K.state.notiDismissed.includes(n.id));
K.dim = v => { v=Math.max(.15,Math.min(1,+v||1)); K.$('#dim').style.opacity = String(Math.max(0,Math.min(.7,(1-v)*0.8))); };   // 가장 어둡게 해도 화면이 보이고 터치도 되게(최대 68%)

/* ---------- 디데이 ---------- */
K.ddayText = d => { const diff = K.dayDiff(K.now(), new Date(d.date+'T00:00:00')); return diff>=0 ? '+'+diff+'일' : '-'+(-diff)+'일 남음'; };
})();

/* 행동(trigger)에 반응: 팝업(배너) + 카톡 메시지 도착 */
K.trigger = function(name){
  const t=(K.D.triggers||{})[name]; if(!t) return;
  const ch=K.state.chats.find(x=>x.id===t.chat); if(!ch) return;
  const texts=[].concat(t.send);
  { const lab={'weather-app':'날씨 앱 클릭','jm-reply':'임종민 선톡에 답장','contact-sj':'박성진 연락처 열기'}[name]||name; K.logEvent&&K.logEvent(ch,lab,texts.join(' / '),t.name||((K.contact&&K.contact(t.from))||{}).name); }
  if(t.popupOnly){ setTimeout(()=>K.banner({app:'kakao',title:((K.contact&&K.contact(t.from))||{}).name||t.name,text:texts[texts.length-1],onTap:()=>K.openKakaoChat(t.chat)}),500); return; }   // 팝업만, 기록 안 남김
  const last=ch.msgs[ch.msgs.length-1];
  if(!(last && last.from===t.from && last.text===texts[0])){   // 같은 말이 답을 기다리는 중이면 또 보내지 않아요
    texts.forEach(x=>ch.msgs.push({from:t.from,name:'',ts:+K.now(),text:x,img:'',unread:true,noti:true}));
  }
  if(t.arm && !ch._chain){ const src=(K.D.chats||[]).find(c=>c.id===ch.id); if(src&&src.alt) ch.alt=src.alt; ch._armed=true; }
  K.save();
  setTimeout(()=>{ K.banner({app:'kakao',title:((K.contact&&K.contact(t.from))||{}).name||t.name,text:texts[texts.length-1],onTap:()=>K.openKakaoChat(ch.id)}); K.refreshKakao&&K.refreshKakao(); K.refreshHome&&K.refreshHome(); },500);
};

/* 안 읽은 카톡(트리거/답장으로 온 것)은 알림 센터에도 쌓여요 */
(()=>{ const base=K.notis;
  K.notis=()=>{ const live=[]; K.state.chats.forEach(c=>c.msgs.forEach((m,i)=>{ if(m.noti&&m.unread&&m.from!=='me'){ const ct=K.contact&&K.contact(m.from); live.push({app:'kakao',title:(ct&&ct.name)||c.name||'',body:m.text,mins:Math.max(0,Math.floor((+K.now()-m.ts)/60000)),open:'kakao:'+c.id,id:'k'+c.id+'_'+m.ts+'_'+i}); } }));
    const upd=K._upd?[{app:'kakao',title:'개발자딱지',body:'새 버전이 업데이트 되었으니 새로고침해주세요.',mins:Math.max(0,Math.floor((Date.now()-K._upd)/60000)),open:'reload',id:'upd',reload:true}]:[];   // 새로고침 전까지 계속 남는 알림
    return upd.concat(live.reverse().filter(n=>!K.state.notiDismissed.includes(n.id)),base()); };
})();

/* ---------- 실제 날씨 (마포구, Open-Meteo — 키 필요 없음). 못 가져오면 data.js의 값을 그대로 써요 ---------- */
K.wcode = c => c===0?{t:'맑음',e:'☀️',k:'sun'}: c===1?{t:'대체로 맑음',e:'🌤',k:'sun'}: c===2?{t:'구름 많음',e:'⛅',k:'cloud'}: c===3?{t:'흐림',e:'☁️',k:'cloud'}:
  (c===45||c===48)?{t:'안개',e:'🌫',k:'cloud'}: (c>=51&&c<=57)?{t:'이슬비',e:'🌦',k:'rain'}: ((c>=61&&c<=67)||(c>=80&&c<=82))?{t:(c>=80?'소나기':'비'),e:'🌧',k:'rain'}:
  ((c>=71&&c<=77)||c===85||c===86)?{t:'눈',e:'🌨',k:'snow'}: (c>=95)?{t:'뇌우',e:'⛈',k:'rain'}: {t:'흐림',e:'☁️',k:'cloud'};
K.loadWeather = function(force){
  const D=K.D, W=D.weather; if(!W) return Promise.resolve();
  if(!force && K._wp && Date.now()-(K._wat||0)<600000) return K._wp;
  K._wat=Date.now();
  const url='https://api.open-meteo.com/v1/forecast?latitude=37.5663&longitude=126.9019&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul&forecast_days=10&wind_speed_unit=ms';
  K._wp = fetch(url).then(r=>{ if(!r.ok) throw new Error('weather '+r.status); return r.json(); }).then(j=>{
    const kst=new Date(Date.now()+9*3600e3).toISOString().slice(0,13);   // 서울 기준 현재 시(YYYY-MM-DDTHH)
    let i0=j.hourly.time.findIndex(t=>t.startsWith(kst)); if(i0<0) i0=0;
    const c0=K.wcode(j.current.weather_code);
    W.temp=Math.round(j.current.temperature_2m); W.cond=c0.t; W.emoji=c0.e; W.kind=c0.k;
    W.hi=Math.round(j.daily.temperature_2m_max[0]); W.lo=Math.round(j.daily.temperature_2m_min[0]);
    W.hoursN=[]; for(let n=0;n<7;n++){ const i=i0+n; if(i>=j.hourly.time.length) break; const hr=+j.hourly.time[i].slice(11,13);
      W.hoursN.push({l:n===0?'지금':hr+'시', t:Math.round(n===0?j.current.temperature_2m:j.hourly.temperature_2m[i]), k:K.wcode(j.hourly.weather_code[i]).k}); }
    W.hours=W.hoursN.map(x=>[x.l,K.wcode(0).e,x.t]);
    W.days=j.daily.time.map((d,i)=>{ const c=K.wcode(j.daily.weather_code[i]); const dow=K.DOW[new Date(d+'T00:00:00Z').getUTCDay()];
      const pp=j.daily.precipitation_probability_max[i]; return {n:i===0?'오늘':dow, k:c.k, lo:Math.round(j.daily.temperature_2m_min[i]), hi:Math.round(j.daily.temperature_2m_max[i]), pc:(c.k==='rain'||c.k==='snow')&&pp>=20?pp+'%':''}; });
    let g=0; for(let i=i0;i<j.hourly.time.length&&j.hourly.time[i].slice(0,10)===j.hourly.time[i0].slice(0,10);i++) g=Math.max(g,j.hourly.wind_gusts_10m[i]||0);
    W.summary='남은 하루 동안 '+c0.t+' 상태가 이어지겠습니다. 돌풍의 풍속은 최대 '+Math.round(g)+'m/s입니다.';
    W.live=true;
    K.refreshHome&&K.refreshHome(); K.onWeather&&K.onWeather(); try{ if(K.refreshLock&&!document.querySelector('#lock').classList.contains('hide')) K.refreshLock(); }catch(e){}
  }).catch(e=>{ K._wat=0; console.warn('날씨를 가져오지 못했어요',e); });
  return K._wp;
};
setTimeout(()=>K.loadWeather(),300);
