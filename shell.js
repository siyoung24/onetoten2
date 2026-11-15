/* shell.js — 아이폰 껍데기: 상태바, 잠금화면, 홈, 알림센터, 제어센터, 제스처 */
(function(){
const {h,$,$$,D} = K;
const S = () => K.state;
const screen = $('#screen');

K.load();

/* ---------- 화면 크기 맞춤 ---------- */
K.scale = 1;
let baseH = innerHeight;
function fit(){
  const small = innerWidth <= 520, W = small?390:414, H = small?844:868, vv = window.visualViewport;
  const ph=$('#phone'), st=$('#stage');
  const vh = (small&&vv)? vv.height : innerHeight;
  if(!small || vh >= innerHeight-4) baseH = Math.max(baseH, innerHeight);
  const kb = small && vv && vh < baseH*0.8;          // 폰의 실제 키보드가 올라온 상태
  if(small){                                         // 폰: 화면 가득 채움 (키보드가 올라오면 그 위쪽 영역에 맞춰 줄임)
    const s = innerWidth/390*1.006, h2 = Math.max(kb?300:560, Math.round(vh/s));   // 폰: 화면 가득 (가장자리 틈 방지로 살짝 키움)
    ph.style.height = h2+'px'; screen.style.height = h2+'px';
    st.style.cssText = `top:${vv.offsetTop}px;height:${vh}px;bottom:auto;align-items:flex-start`;
    ph.style.transformOrigin = '50% 0'; ph.style.transform = `scale(${s})`; K.scale = s;
    document.body.classList.toggle('kbopen',!!kb);
  } else {
    ph.style.height = ''; screen.style.height = ''; st.style.cssText = ''; ph.style.transformOrigin = '';
    const s = Math.min(innerWidth/W, innerHeight/H, small?10:1.1);
    ph.style.transform = `scale(${s})`; K.scale = s;
    document.body.classList.remove('kbopen');
  }
}
if(window.visualViewport){ visualViewport.addEventListener('resize', fit); visualViewport.addEventListener('scroll', fit); }
addEventListener('resize', fit); fit();
const local = e => { const r = screen.getBoundingClientRect(); return { x:(e.clientX-r.left)/K.scale, y:(e.clientY-r.top)/K.scale }; };

/* ---------- 상태바 ---------- */
const bars = (n) => [0,1,2,3].map(i=>`<rect x="${i*5}" y="${10-i*3}" width="3.4" height="${3+i*3}" rx="1" opacity="${i<n?1:.35}"/>`).join('');
K.refreshStatus = function(){
  const st=$('#status'), u=S().ui, n=K.now();
  const t=K.hm(+n).replace(/^(오전|오후) /,'');
  const air=u.airplane;
  const HP=K._bmwOn?`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.300" stroke-linecap="round" stroke-linejoin="round" style="fill:none"><path d="M4 16v-3.500a8 8 0 0 1 16 0V16"/><rect x="3" y="14" width="4" height="6.500" rx="1.800" fill="currentColor" stroke="none"/><rect x="17" y="14" width="4" height="6.500" rx="1.800" fill="currentColor" stroke="none"/></svg>`:'';
  const lv=u.batteryLevel, bcol=u.lowPower?'#ffd60a':(lv<=20?'#ff3b30':'currentColor');
  const MOON=u.doNotDisturb?`<span class="fi" title="방해 금지"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20 14.500A8.500 8.500 0 0 1 9.500 4a8.500 8.500 0 1 0 10.500 10.500z"/></svg></span>`:'';
  st.innerHTML = `<div class="t"><span class="${K._inCall?'cpill':''}">${t}</span></div>${MOON}<div class="r">`+
    (air?`<svg width="18" height="14" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.500a1.500 1.500 0 0 0-3 0V9l-8 5v2l8-2.500V19l-2 1.500V22l3.500-1 3.500 1v-1.500L13 19v-5.500z"/></svg>`:
    `<svg width="19" height="12" viewBox="0 0 19 12">${bars(u.cell?4:0)}</svg>`+
    (u.wifi?`<svg width="17" height="12.5" viewBox="-1.7 1 27.4 20"><path d="M12 20.5L7.76 16.26A6 6 0 0 1 16.24 16.26zM2.95 11.45A12.8 12.8 0 0 1 21.05 11.45L18.01 14.49A8.5 8.5 0 0 0 5.99 14.49zM-1.65 6.85A19.3 19.3 0 0 1 25.65 6.85L22.61 9.89A15 15 0 0 0 1.39 9.89z"/></svg>`:'<span style="font-size:11px">LTE</span>'))+
    HP+    `<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.800" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="${Math.max(1.5,20*lv/100)}" height="9" rx="2.400" fill="${bcol}"/><path d="M25 4.500v4c.8-.3 1.500-1.100 1.500-2s-.7-1.700-1.500-2z" opacity=".45"/></svg></div>`;
};
K.refreshStatus(); setInterval(()=>{K.refreshStatus();K.refreshLockClock&&K.refreshLockClock();},10000);
K.flipBar = () => { if(!K.cur) return false; const id=K.cur.id, u=S().ui; if(id==='mail') return u.dark!==true; if(u.dark===true) return !['weather','camera','youtube','music','clock'].includes(id); return false; };
K.setBar = dark => { K._bar=dark; const d=dark!==K.flipBar(); $('#status').classList.toggle('dark',d); $('#homebar').classList.toggle('dark',d); };
K.applyTheme = () => { const u=S().ui, sc=$('#screen'); sc.classList.toggle('sys-dark',u.dark===true); sc.classList.toggle('sys-light',u.dark===false); if(K.cur&&K.cur.id==='youtube'&&K.ytBar) K.ytBar(); if(K._bar!==undefined) K.setBar(K._bar); };

/* ---------- 배경화면 ---------- */
const DEFAULT_WP = 'center/cover no-repeat url("data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20390%20844%22%20preserveAspectRatio=%22xMidYMid%20slice%22%3E%0A%3Cdefs%3E%0A%3ClinearGradient%20id=%22s%22%20x1=%220%22%20y1=%220%22%20x2=%220%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%233a3a7a%22/%3E%3Cstop%20offset=%22.28%22%20stop-color=%22%238a4f98%22/%3E%3Cstop%20offset=%22.48%22%20stop-color=%22%23e2688a%22/%3E%3Cstop%20offset=%22.62%22%20stop-color=%22%23ff9a5a%22/%3E%3Cstop%20offset=%22.72%22%20stop-color=%22%23ffcf7a%22/%3E%3C/linearGradient%3E%0A%3ClinearGradient%20id=%22r%22%20x1=%220%22%20y1=%220%22%20x2=%220%22%20y2=%221%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%23e98a6a%22/%3E%3Cstop%20offset=%22.4%22%20stop-color=%22%238d4f7e%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%232c2548%22/%3E%3C/linearGradient%3E%0A%3CradialGradient%20id=%22g%22%3E%3Cstop%20offset=%220%22%20stop-color=%22%23fff3c4%22%20stop-opacity=%22.95%22/%3E%3Cstop%20offset=%22.4%22%20stop-color=%22%23ffc56e%22%20stop-opacity=%22.5%22/%3E%3Cstop%20offset=%221%22%20stop-color=%22%23ff9a5a%22%20stop-opacity=%220%22/%3E%3C/radialGradient%3E%0A%3C/defs%3E%0A%3Crect%20width=%22390%22%20height=%22844%22%20fill=%22url(%23s)%22/%3E%0A%3Ccircle%20cx=%22250%22%20cy=%22560%22%20r=%22150%22%20fill=%22url(%23g)%22/%3E%0A%3Ccircle%20cx=%22250%22%20cy=%22565%22%20r=%2226%22%20fill=%22%23fff6d6%22/%3E%0A%3Cpath%20d=%22M0%20520q60-18%20120-6t130-4%20140%208V600H0z%22%20fill=%22%23b8567a%22%20opacity=%22.55%22/%3E%0A%3Cg%20fill=%22%235a3358%22%20opacity=%22.85%22%3E%3Crect%20x=%2220%22%20y=%22560%22%20width=%2214%22%20height=%2240%22/%3E%3Crect%20x=%2238%22%20y=%22548%22%20width=%2218%22%20height=%2252%22/%3E%3Crect%20x=%2260%22%20y=%22566%22%20width=%2212%22%20height=%2234%22/%3E%3Crect%20x=%22300%22%20y=%22552%22%20width=%2216%22%20height=%2248%22/%3E%3Crect%20x=%22320%22%20y=%22540%22%20width=%2220%22%20height=%2260%22/%3E%3Crect%20x=%22344%22%20y=%22562%22%20width=%2214%22%20height=%2238%22/%3E%3Crect%20x=%22362%22%20y=%22550%22%20width=%2218%22%20height=%2250%22/%3E%3C/g%3E%0A%3Crect%20y=%22600%22%20width=%22390%22%20height=%22244%22%20fill=%22url(%23r)%22/%3E%0A%3Cg%20stroke=%22%232a1f3f%22%20stroke-width=%225%22%20fill=%22none%22%3E%3Cpath%20d=%22M0%20596H390%22/%3E%3C/g%3E%0A%3Cg%20fill=%22%232a1f3f%22%3E%3Crect%20x=%2270%22%20y=%22580%22%20width=%224%22%20height=%2222%22/%3E%3Crect%20x=%22170%22%20y=%22580%22%20width=%224%22%20height=%2222%22/%3E%3Crect%20x=%22270%22%20y=%22580%22%20width=%224%22%20height=%2222%22/%3E%3Crect%20x=%22360%22%20y=%22580%22%20width=%224%22%20height=%2222%22/%3E%3C/g%3E%0A%3Cpath%20d=%22M0%20600q85-48%20170%200t170%200q30-14%2050%200%22%20stroke=%22%232a1f3f%22%20stroke-width=%224%22%20fill=%22none%22/%3E%0A%3Cg%20fill=%22%23ffe3a0%22%20opacity=%22.55%22%3E%3Crect%20x=%22228%22%20y=%22612%22%20width=%2244%22%20height=%223%22%20rx=%221.500%22/%3E%3Crect%20x=%22214%22%20y=%22626%22%20width=%2272%22%20height=%223%22%20rx=%221.500%22/%3E%3Crect%20x=%22232%22%20y=%22642%22%20width=%2236%22%20height=%223%22%20rx=%221.500%22/%3E%3Crect%20x=%22200%22%20y=%22660%22%20width=%22100%22%20height=%223%22%20rx=%221.500%22%20opacity=%22.6%22/%3E%3Crect%20x=%22226%22%20y=%22682%22%20width=%2248%22%20height=%223%22%20rx=%221.500%22%20opacity=%22.5%22/%3E%3C/g%3E%0A%3Cpath%20d=%22M0%20760q100-26%20200-6t190-14V844H0z%22%20fill=%22%231e1833%22/%3E%0A%3Cg%20fill=%22%23150f26%22%3E%3Cpath%20d=%22M30%20790c-14-4-20-34-8-52%208%2018%2020%2034%208%2052z%22/%3E%3Cpath%20d=%22M52%20800c-12-6-12-36%202-54%206%2020%2014%2038-2%2054z%22/%3E%3Cpath%20d=%22M350%20792c14-6%2024-34%2014-52-10%2018-22%2034-14%2052z%22/%3E%3C/g%3E%0A%3Cpath%20d=%22M0%20812q120-30%20230-8t160-8V844H0z%22%20fill=%22%230f0a1c%22/%3E%0A%3C/svg%3E")';
const LOCK_WP = 'center/cover no-repeat url("photos/lockscreen.jpg")';
K.wallList = () => (D.settings.wallpapers&&D.settings.wallpapers.length?D.settings.wallpapers:[{lock:'photos/lockscreen.jpg'}]);
K.wallIdx = () => { const df=D.settings.wallpaperDefault||0; let n=df; try{ const v=localStorage.getItem('kyh_wall'); if(v!==null) n=parseInt(v,10); }catch(e){} return n>=0&&n<K.wallList().length?n:df; };
K.WFLT = [{id:'none',n:'자연스럽게'},{id:'bw',n:'흑백'},{id:'warm',n:'따뜻하게'},{id:'cool',n:'차갑게'}];
const lsGet=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } }, lsSet=(k,v)=>{ try{ if(v===null||v===undefined) localStorage.removeItem(k); else localStorage.setItem(k,String(v)); }catch(e){} };
K.wallHomeIdx = () => { const v=lsGet('kyh_wall_h'); const n=v===null?NaN:parseInt(v,10); return n>=0&&n<K.wallList().length?n:K.wallIdx(); };
K.wallBlur = () => lsGet('kyh_wall_hb')!=='off';   // 홈 화면 블러 (기본: 켬)
K.wallFlt = which => lsGet(which==='home'?'kyh_wall_hf':'kyh_wall_lf')||'none';
/* 잠금화면+홈 화면을 같이 바꾸거나(i), null이면 모두 기본으로 되돌림 */
K.setWall = i => { if(i===null){ ['kyh_wall','kyh_wall_h','kyh_wall_lf','kyh_wall_hf','kyh_wall_hb'].forEach(k=>lsSet(k,null)); } else { lsSet('kyh_wall',i); lsSet('kyh_wall_h',null); lsSet('kyh_wall_lf',null); lsSet('kyh_wall_hf',null); lsSet('kyh_wall_hb',null); } K.applyWallpapers(); };
K.setWallParts = (li,hi,lf,hf,hb) => { lsSet('kyh_wall_hb',hb===false?'off':null); lsSet('kyh_wall',li); lsSet('kyh_wall_h',hi===li?null:hi); lsSet('kyh_wall_lf',lf==='none'?null:lf); lsSet('kyh_wall_hf',hf==='none'?null:hf); K.applyWallpapers(); };
K.wallBg = (url,f,el) => { const base=`center/cover no-repeat url("${url}")`; el.style.backgroundBlendMode='normal';
  if(f==='bw'){ el.style.background=`linear-gradient(#808080,#808080), ${base}`; el.style.backgroundBlendMode='saturation, normal'; }
  else if(f==='warm') el.style.background=`linear-gradient(rgba(255,140,40,.26),rgba(255,140,40,.26)), ${base}`;
  else if(f==='cool') el.style.background=`linear-gradient(rgba(60,130,255,.26),rgba(60,130,255,.26)), ${base}`;
  else el.style.background=base; };
K.applyWallpapers = function(){
  const L=K.wallList(), w=L[K.wallIdx()], hw=L[K.wallHomeIdx()];
  K.wallBg(w.lock,K.wallFlt('lock'),$('#lock'));
  K.wallBg(hw.home||hw.lock,K.wallFlt('home'),$('#wp')); $('#wp').classList.toggle('nb',!K.wallBlur());
};
K.applyWallpapers();

/* ---------- 홈 화면 ---------- */
const home = $('#home');
const DOCK = ['phone','safari','messages','kakao'];
const PAGE1 = ['calendar','photos','music','camera'];
const PAGE2 = ['clock','mail','weather','youtube','instagram','safari','notes','settings','pub','mapo'];
const badgeFor = id => {
  if(id==='kakao'){ const n=S().chats.reduce((a,c)=>a+c.msgs.filter(m=>m.unread&&m.from!=='me').length,0); return n; }
  if(id==='phone'){ return 0; }
  return 0;
};
const FOLDERS = { shop:{name:'쇼핑',apps:['coupang','carrot','musinsa']}, ride:{name:'교통',apps:['drive','ktaxi','nmap']} };
function openFolder(key){
  if($('#fold-ov')){ $('#fold-ov').remove(); return; }
  const f=FOLDERS[key], ov=h('div',{id:'fold-ov',onclick:e=>{ if(e.target===ov) ov.remove(); }},
    h('div',{class:'fold-box'}, h('div',{class:'fold-t'},f.name), h('div',{class:'fold-g'},f.apps.map(i=>h('div',{class:'app-i',onclick:()=>K.openApp(i)},K.icon(i),h('span',{class:'lb'},K.appName[i]))))));
  screen.append(ov);
}
function appIcon(id,withLabel=true){
  if(id.startsWith('folder:')){ const key=id.slice(7), f=FOLDERS[key];
    return h('div',{class:'app-i','data-app':id,onclick:()=>openFolder(key)}, h('span',{class:'icon fold-i'},f.apps.map(i=>{ const m=K.icon(i); m.classList.add('mini'); return m; })), h('span',{class:'lb'},f.name)); }
  const el = h('div',{class:'app-i','data-app':id,onclick:()=>{ K.openApp(id); if(id==='weather') K.trigger('weather-app'); }}, K.icon(id), withLabel?h('span',{class:'lb'},K.appName[id]):null);
  const b=badgeFor(id); if(b) el.append(h('div',{class:'badge'},String(b)));
  return el;
}
K.openYT = () => { const t=K.allTracks[K.music.i]||{}; const u=t.link||(t.yt?'https://youtu.be/'+t.yt:'https://www.youtube.com'); window.open(u,'_blank','noopener'); };
function widgets(){
  const dd = S().ddays.find(d=>d.main)||S().ddays[0];
  const tr0 = K.allTracks[K.music.i]||{t:'',a:''};
  const NOTE='<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M9 4.500 20 2.500v13.200a3.200 3.200 0 1 1-2-2.950V7.300l-7 1.300v9.100a3.200 3.200 0 1 1-2-2.950z"/></svg>';
  const ppb0 = h('button',{style:'height:26px;padding:0 13px 0 11px;border-radius:13px;background:rgba(255,255,255,.2);color:#fff;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:6px;align-self:flex-start',onclick:e=>{e.stopPropagation();K.togglePlay();K.refreshHome();}},h('span',{style:'font-size:11px'},K.music.playing?'❚❚':'▶︎'),K.music.playing?'일시정지':'재생');
  const w1 = h('div',{class:'wd s',onclick:()=>K.openYT(),style:'background:linear-gradient(170deg,#605d57,#46443f);color:#fff;padding:15px;display:flex;flex-direction:column;justify-content:space-between;cursor:pointer'},
    h('div',{style:'display:flex;justify-content:space-between;align-items:flex-start'},h('div',{style:'width:56px;height:56px;border-radius:9px;background:url(photos/album-cover.jpg) center/cover;box-shadow:0 0 0 .5px rgba(255,255,255,.15)'}),h('span',{style:'margin:2px 1px 0 0',html:NOTE})),
    h('div',{style:'margin-top:2px'},h('div',{style:'font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'},tr0.t),h('div',{style:'font-size:14px;color:rgba(255,255,255,.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis'},tr0.a)),
    h('div',{style:'display:flex;margin-top:-2px'},ppb0));
  const w=D.weather;
  const LOC='<svg viewBox="0 0 24 24" width="13" height="13" fill="#fff" style="margin-left:5px;vertical-align:-1px"><path d="M21 3 3 10.500l7 2.500 2.500 7z"/></svg>';
  const SUNI='<svg viewBox="0 0 24 24" width="19" height="19"><circle cx="12" cy="12" r="5" fill="#ffd43b"/><g stroke="#ffd43b" stroke-width="1.800" stroke-linecap="round"><path d="M12 2.500v2.500" transform="rotate(0 12 12)"/><path d="M12 2.500v2.500" transform="rotate(45 12 12)"/><path d="M12 2.500v2.500" transform="rotate(90 12 12)"/><path d="M12 2.500v2.500" transform="rotate(135 12 12)"/><path d="M12 2.500v2.500" transform="rotate(180 12 12)"/><path d="M12 2.500v2.500" transform="rotate(225 12 12)"/><path d="M12 2.500v2.500" transform="rotate(270 12 12)"/><path d="M12 2.500v2.500" transform="rotate(315 12 12)"/></g></svg>';
  const wic = (/맑음/.test(w.cond||''))?h('span',{style:'display:inline-flex;vertical-align:-4px;margin-right:6px',html:SUNI}):((w.emoji||'⛅')+' ');
  const w2 = h('div',{class:'wd s',onclick:()=>{ K.loadWeather(); K.openApp('weather'); },style:'background:linear-gradient(180deg,#335a8e,#5a82b3 60%,#86a4c8);padding:15px;cursor:pointer'},
    h('div',{style:'font-size:15px;font-weight:600;white-space:nowrap'},w.city,h('span',{html:LOC})), h('div',{style:'font-size:52px;font-weight:300;margin-top:0;line-height:1.1;letter-spacing:-1px'},w.temp+'°'), h('div',{style:'position:absolute;bottom:13px;left:15px;font-size:13px;line-height:1.35;font-weight:500'},wic,h('br'),w.cond,h('br'),'최고:'+w.hi+'° 최저:'+w.lo+'°'));
  const tr = K.allTracks[K.music.i]||{t:'',a:''};
  const prog = h('i',{style:'display:block;height:100%;width:'+(K.music.t||0)+'%;background:#fff;border-radius:2px'});
  const ppb = h('button',{style:'font-size:22px;color:#fff',onclick:e=>{e.stopPropagation();K.togglePlay();K.refreshHome();}},K.music.playing?'⏸':'▶︎');
  const w3 = h('div',{class:'wd m',onclick:()=>K.openYT(),style:'background:linear-gradient(120deg,#2b1f3d,#5a2f55);padding:14px;display:flex;flex-direction:column;justify-content:space-between;cursor:pointer'},
    h('div',{style:'display:flex;gap:12px;align-items:center'}, h('div',{style:'width:62px;height:62px;border-radius:12px;background:url(photos/album-cover.jpg) center/cover'}),
      h('div',{style:'flex:1;min-width:0'},h('div',{style:'font-size:16px;font-weight:600'},tr.t),h('div',{style:'font-size:13px;opacity:.65'},tr.a+' · '+D.playlist.name)),
      h('div',{style:'display:flex;gap:14px;align-items:center'},h('button',{style:'color:#fff;font-size:18px',onclick:e=>{e.stopPropagation();K.music.i=(K.music.i+K.allTracks.length-1)%K.allTracks.length;K.refreshHome();}},'⏮'),ppb,h('button',{style:'color:#fff;font-size:18px',onclick:e=>{e.stopPropagation();K.music.i=(K.music.i+1)%K.allTracks.length;K.music.t=0;K.refreshHome();}},'⏭'))),
    h('div',{style:'height:4px;border-radius:2px;background:rgba(255,255,255,.3)'},prog));
  const notes=[...S().notes].sort((a,b)=>b.ts-a.ts).slice(0,3);
  const w4 = h('div',{class:'wd m',onclick:()=>K.openApp('notes'),style:'background:#f6e7cf;color:#3a2a14;padding:14px 16px;cursor:pointer'},
    h('div',{style:'font-size:14px;font-weight:700;color:#b5651d;margin-bottom:6px'},'메모'),
    notes.map(n=>h('div',{style:'display:flex;justify-content:space-between;font-size:15px;padding:5px 0;border-top:.5px solid rgba(0,0,0,.1)'},h('span',{style:'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:230px'},(n.body.split('\n').find(l=>l.trim())||'새로운 메모')),h('span',{style:'font-size:12px;opacity:.5;padding-top:2px'},K.listTime(n.ts)))));
  return {w1,w2,w3,w4};
}
/* ---------- 홈 화면 가장 왼쪽: 오늘 보기 (배터리·날씨·스크린 타임·지도·캘린더 위젯) ---------- */
function todayPage(){
  const w=D.weather||{}, bat=S().ui.batteryLevel||(D.settings&&D.settings.battery)||75;
  const ring=(pct,icon,chg)=>{ const r=39,c=2*Math.PI*r; return h('div',{class:'bring',html:`<svg viewBox="0 0 100 100" width="68" height="68"><circle cx="50" cy="50" r="${r}" fill="none" stroke="#3a3a3c" stroke-width="9"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="#5fd068" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c*pct/100} ${c}" transform="rotate(-90 50 50)"/></svg><span class="bi">${icon}</span>${chg?'<span class="bchg"><svg viewBox="0 0 24 24" width="17" height="17" fill="#5fd068"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg></span>':''}`}); };
  const IC={
    ph:'<svg viewBox="0 0 24 34" width="20" height="28" fill="none" stroke="#fff" stroke-width="2"><rect x="2.500" y="1.500" width="19" height="31" rx="4.500"/><path d="M9 28h6" stroke-linecap="round"/></svg>',
    wa:'<svg viewBox="0 0 30 36" width="24" height="29"><rect x="4" y="6" width="20" height="24" rx="7" fill="#fff" fill-opacity=".92"/><rect x="24" y="14" width="3" height="7" rx="1.500" fill="#fff" fill-opacity=".8"/><rect x="7.500" y="9.500" width="13" height="17" rx="4.500" fill="#48484a"/><path d="M9 3h10M9 33h10" stroke="#8e8e93" stroke-width="3" stroke-linecap="round"/></svg>',
    ap:'<svg viewBox="0 0 40 30" width="36" height="27" fill="#fff"><circle cx="9" cy="9" r="6.500"/><rect x="6.800" y="12" width="4.400" height="15" rx="2.200"/><circle cx="31" cy="9" r="6.500"/><rect x="28.800" y="12" width="4.400" height="15" rx="2.200"/></svg>',
    cs:'<svg viewBox="0 0 40 30" width="36" height="27"><rect x="2" y="4" width="36" height="24" rx="9" fill="#fff"/><path d="M2 14h36" stroke="#d1d1d6" stroke-width="1.500"/><circle cx="20" cy="9" r="1.400" fill="#8e8e93"/></svg>'};
  const wBat=h('div',{class:'wd s tdbat'},ring(bat,IC.ph),ring(95,IC.wa),ring(100,IC.ap,true),ring(68,IC.cs));
  const wWea=h('div',{class:'wd s tdwea',onclick:()=>{ K.loadWeather&&K.loadWeather(); K.openApp('weather'); }},
    h('div',{class:'c'},(w.city||'서울특별시')+' ➤'),h('div',{class:'t'},(w.temp!=null?w.temp:10)+'°'),h('div',{class:'d'},(w.emoji||'☀️')+' '+(w.cond||'대체로 맑음'),h('br'),'최고:'+(w.hi!=null?w.hi:16)+'° 최저:'+(w.lo!=null?w.lo:5)+'°'));
  /* 스크린 타임 (그래프: 0~4시, 8~10시에 사용) */
  const BARS={0:[20,8,0,6],1:[20,9,0,29],2:[48,0,0,3],3:[41,0,10,1],4:[1,0,28,0],8:[4,1,0,9],9:[24,2,0,8],10:[12,0,0,2]};
  const COL=['#3b8cf5','#f5a142','#52d0dc','#4a4a4e'];
  let bars=''; Object.keys(BARS).forEach(hr=>{ let y=100; BARS[hr].forEach((m,k)=>{ if(!m) return; const hgt=m*100/60; y-=hgt; bars+=`<rect x="${+hr*20+2}" y="${y}" width="9" height="${hgt}" rx="1.600" fill="${COL[k]}"/>`; }); });
  const chart=`<svg viewBox="0 0 272 112" width="272" height="112"><g stroke="#5a5a5e" stroke-width=".8"><path d="M0 0.500h232M0 50.500h232"/><path d="M0 100.500h232" /></g><g stroke="#5a5a5e" stroke-width=".8" stroke-dasharray="3 3"><path d="M.5 0v108M120.500 0v108M240.500 0v108"/></g><g fill="#a1a1a6" font-size="11"><text x="238" y="5">60분</text><text x="238" y="54">30분</text><text x="238" y="104">0</text></g>${bars}<g fill="#a1a1a6" font-size="11.500"><text x="2" y="111">0시</text><text x="124" y="111">6시</text><text x="244" y="111" font-size="0">12</text></g></svg>`;
  const appRow=(ic,t)=>h('div',{class:'strow'},ic,h('span',{},t));
  const gIc=bg=>h('i',{class:'sti',style:'background:'+bg});
  const wSt=h('div',{class:'wd m tdst'},
    h('div',{class:'stl'},h('div',{class:'sth'},h('i',{class:'sta'},'박'),h('b',{},'4시간 49분')),h('div',{class:'stc',html:chart})),
    h('div',{class:'str'},
      appRow(h('i',{class:'sti'},K.icon('kakao')),'58분'),
      appRow(h('i',{class:'sti x'},'𝕏'),'54분'),
      appRow(h('i',{class:'sti g'},'🎣'),'40분'),
      appRow(h('i',{class:'sti p'},'ℙ'),'33분')));
  /* 지도 */
  const wMap=h('div',{class:'wd s tdmap',html:`<svg viewBox="0 0 158 158" width="158" height="158" preserveAspectRatio="xMidYMid slice"><rect width="158" height="158" fill="#2a3340"/><g fill="#2f5b49" opacity=".95"><path d="M0 0h50l-8 38-28 20L0 40z"/><path d="M104 118l38-10 16 22v28h-48z"/><path d="M62 82l20-6 10 18-12 20-22-6z"/><path d="M118 0h40v40l-24-6z"/><path d="M0 108l22 14-4 36H0z"/></g><g fill="none" stroke="#9aa6c2" stroke-opacity=".75" stroke-width="1.100"><path d="M70 0 76 60 90 100 88 158M0 112 60 102 120 90 158 96M32 0 52 50 46 98 20 158M120 0 112 50 100 82M0 58 40 66 76 60 118 54 158 40M40 66 46 98M112 50 150 70 158 78M62 128 100 120 158 130M88 100 140 132"/></g><g fill="none" stroke="#c7d0e6" stroke-opacity=".85" stroke-width="2"><path d="M74 0c4 30 2 60 16 100l-2 58"/><path d="M0 110c40-8 80-14 158-20"/></g></svg>`},
    h('i',{class:'mdot'}),h('b',{class:'m47'},'47'));
  /* 캘린더 */
  const n=K.now(), today=(S().events||[]).filter(e=>K.dayDiff(e.ts,+n)===0).sort((a,b)=>a.ts-b.ts);
  const wCal=h('div',{class:'wd s tdcal',onclick:()=>K.openApp('calendar')},h('div',{class:'dw'},K.DOW[n.getDay()]+'요일'),h('div',{class:'dn'},String(n.getDate())),
    today.length?h('div',{class:'dev'},...today.slice(0,2).map(e=>h('div',{class:'ev1'},h('i',{style:'background:'+(e.color||'#ff3b30')}),K.hm(e.ts).replace(/^(오전|오후) /,'')+' '+e.title))):h('div',{class:'dno'},'오늘 이벤트 없음'));
  return h('div',{class:'pg tdy'},h('div',{class:'wrow'},wBat,wWea),h('div',{class:'wrow'},wSt),h('div',{class:'wrow'},wMap,wCal));
}
K.refreshHome = function(){
  const x = widgets();
  home.innerHTML='';
  const p1=h('div',{class:'pg'}, h('div',{class:'wrow'},x.w2,K.allTracks[K.music.i]?x.w1:null), h('div',{class:'grid'},PAGE1.map(i=>appIcon(i))));
  const p2=h('div',{class:'pg'}, h('div',{class:'grid'},PAGE2.map(i=>appIcon(i))));
  const pages=h('div',{id:'pages'},p1,p2);
  if(!K.homeIdx || K.homeIdx>1) K.homeIdx=0;
  const dots=h('div',{id:'dots'},h('i',{class:K.homeIdx===0?'on':''}),h('i',{class:K.homeIdx===1?'on':''}));
  pages.addEventListener('scroll',()=>{ const i=Math.round(pages.scrollLeft/(pages.clientWidth||390)); K.homeIdx=i; [...dots.children].forEach((d,k)=>d.classList.toggle('on',k===i)); });
  const dock=h('div',{id:'dock'},DOCK.map(i=>appIcon(i,false)));
  home.append(pages,dots,dock);
  if(K.homeIdx){ pages.style.scrollBehavior='auto'; pages.scrollLeft=K.homeIdx*(pages.clientWidth||390); }   // 직전에 보던 홈 페이지 유지
};
K.refreshHome();
K.audio = new Audio(); K.audio.preload='none';
const nextTrack=()=>{ K.music.i=(K.music.i+1)%K.allTracks.length; K.music.t=0; };
K.audio.addEventListener('ended',nextTrack);
/* 유튜브(숨김 플레이어) */
let yt=null, ytReady=false, ytId='', ytLoading=false;
function ytInit(){ if(ytLoading) return; ytLoading=true;
  const box=document.createElement('div'); box.id='ytbox'; box.style.cssText='position:fixed;left:-400px;top:0;width:200px;height:200px;opacity:0;pointer-events:none'; box.innerHTML='<div id="ytp"></div>'; document.body.append(box);
  window.onYouTubeIframeAPIReady=()=>{ yt=new YT.Player('ytp',{width:200,height:200,playerVars:{playsinline:1,controls:0},events:{onReady:()=>{ytReady=true;},onStateChange:e=>{ if(e.data===0) nextTrack(); }}}); };
  const sc=document.createElement('script'); sc.src='https://www.youtube.com/iframe_api'; document.head.append(sc); }
setInterval(()=>{ const tr=K.allTracks[K.music.i]; const a=K.audio; if(!tr) return;
  if(tr.yt){ if(!a.paused) a.pause(); ytInit(); if(!ytReady) return;
    if(ytId!==tr.yt){ ytId=tr.yt; yt.loadVideoById(tr.yt); if(!K.music.playing) yt.pauseVideo(); return; }
    const st=yt.getPlayerState();
    if(K.music.playing){ if(st!==1&&st!==3) yt.playVideo(); const du=yt.getDuration(); if(du) K.music.t=yt.getCurrentTime()/du*100; if(!K.cur) K.refreshHome(); }
    else if(st===1) yt.pauseVideo();
    return; }
  if(ytReady&&yt&&yt.getPlayerState()===1){ yt.pauseVideo(); ytId=''; }
  if(tr.src){ if(a.getAttribute('data-s')!==tr.src){ a.setAttribute('data-s',tr.src); a.src=tr.src; }
    if(K.music.playing){ if(a.paused) a.play().catch(()=>{}); if(a.duration) K.music.t=a.currentTime/a.duration*100; if(!K.cur) K.refreshHome(); } else if(!a.paused) a.pause();
  } else if(!a.paused) a.pause(); },500);
setInterval(()=>{ const cur=K.allTracks[K.music.i]; if(cur&&(cur.src||cur.yt)) return; if(K.music.playing){ K.music.t=(K.music.t||0)+0.8; if(K.music.t>=100){ K.music.t=0; K.music.i=(K.music.i+1)%K.allTracks.length; } if(!K.cur) K.refreshHome(); } },1000);

/* ---------- 앱 열기/닫기 ---------- */
K.cur = null;
K.openApp = function(id, params={}){
  if((D.settings.disabledApps||[]).includes(id)) return;   // 눌러도 아무 반응 없는 앱 (data.js의 disabledApps)
  if(id==='photos'){ window.open('https://pin.it/6asQB9GqJ','_blank','noopener'); return; }   // 사진(갤러리) 앱 = 외부 링크로 이동
  if(id==='pub'){ K.alert('정유출판사 홈페이지로\n가시겠습니까?','',[{t:'아니요'},{t:'예',fn:()=>window.open('https://www.postype.com/@kongpuday?utm_source=link&utm_medium=social&utm_content=if_sh_wl&utm_campaign=channel','_blank','noopener')}]); return; }
  if(!K.apps[id]){ K.toast('열 수 없는 앱이에요'); return; }
  if(id==='mail' && !params._ok){   // 메일은 암호(mailLock)를 입력해야 열려요
    const lk=D.settings.mailLock; const OKL=D.settings.openableApps; if(OKL && !OKL.includes(id)){ K.toast('이 앱은 열 수 없어요'); return; }
    if(lk){ K.askCode(lk,'암호 입력',()=>K.openApp('mail',{_ok:1})); return; } }
  const OK = D.settings.openableApps; if(OK && !OK.includes(id)){ K.toast('이 앱은 열 수 없어요'); return; }
  if(K.cur){ if(K.cur.id===id){ return; } K.closeApp(true); }
  closeSheets();
  const icon = $(`#home [data-app="${id}"] .icon`) || $('#home .icon');
  const sr=screen.getBoundingClientRect(), ir=icon?icon.getBoundingClientRect():sr;
  const dx=((ir.left+ir.width/2)-(sr.left+sr.width/2))/K.scale, dy=((ir.top+ir.height/2)-(sr.top+sr.height/2))/K.scale;
  const el=h('div',{class:'app','data-id':id,style:`--dx:${dx}px;--dy:${dy}px`});
  $('#apps').append(el); home.classList.add('back');
  const ctl={ bar:d=>K.setBar(d) };
  K.cur={id,el}; K.setBar(true);
  try{ K.apps[id].mount(el, params, ctl); }catch(e){ console.error(e); el.append(h('div',{class:'empty'},'앱을 여는 중 문제가 생겼어요')); }
};
K.closeApp = function(instant){
  if(!K.cur) return;
  const {el}=K.cur; K.cur=null;
  K.setBar(false);
  if(instant){ el.remove(); }
  else { el.classList.add('closing'); setTimeout(()=>el.remove(),340); }
  home.classList.remove('back'); K.refreshHome(); K.refreshLock&&K.refreshLock();
};

/* ---------- 잠금화면 ---------- */
const lock = $('#lock');
K.refreshLockClock = function(){ const n=K.now(); const d=$('#lock .date'), t=$('#lock .time'); if(d) d.textContent=K.mdw(+n); if(t) t.textContent=K.hm(+n).replace(/^(오전|오후) /,''); const nd=$('#nc .date'),nt=$('#nc .time'); if(nd){nd.textContent=K.mdw(+n);nt.textContent=K.hm(+n).replace(/^(오전|오후) /,'');} };
/* 알림 미리보기: 항상 / 잠금 해제 시 / 안 함. 알림 자체는 그대로 두고 보이는 글만 바꿔요 (잠금 화면·알림 센터·배너 공통) */
K.previewText = (app,title,body) => {
  const mode=S().ui.notificationPreview||'always', locked=lock.classList.contains('hide')===false;
  const appName=(K.appName&&K.appName[app])||'알림';
  if(mode==='never') return {title:appName, body:'알림', hidden:true};
  if(mode==='unlocked'&&locked) return {title, body:'잠금을 해제하면 내용이 보여요', hidden:true};
  return {title, body, hidden:false};
};
const notiEl = (n,dark) => {
  const mins=n.mins; const when = mins<1?'지금':mins<60?mins+'분 전':mins<1440?Math.floor(mins/60)+'시간 전':'어제';
  const p=K.previewText(n.app,n.title,n.body);
  return h('div',{class:'noti'+(dark?' dk':'')+(p.hidden?' hid':''),onclick:e=>{ e.stopPropagation(); go(n); }}, h('div',{class:'ic'},K.icon(n.app)), h('div',{class:'tx'},h('div',{class:'ti'},p.title,h('span',{},when)),h('div',{class:'bd'},p.body)));
};
function go(n){ if(n.reload){ location.reload(); return; } const [app,arg]=n.open.split(':'); const after=()=>{ hideNC(); K.openApp(app, arg?{chat:arg.replace('kakao','')}:{}); };
  if(lockedNow()) unlock(after); else after(); }
/* 잠금 화면 위젯: 배터리 / 저전력 모드 / 방해 금지 (실제 시스템 상태를 그대로 보여줘요) */
/* 잠금 화면 위젯: 캘린더·날씨. 추가한 순서대로 왼쪽부터 놓여요 (lockWidgets.order) */
K.lwOrder = lw => { const o=(Array.isArray(lw.order)?lw.order:[]).filter((k,i,a)=>lw[k]&&a.indexOf(k)===i&&(k==='calendar'||k==='weather')); ['calendar','weather'].forEach(k=>{ if(lw[k]&&!o.includes(k)) o.push(k); }); return o; };
K.lwToggle = (lw,key) => { const on=!lw[key]; lw[key]=on; const o=(lw.order||[]).filter(k=>k!==key); if(on) o.push(key); lw.order=o; return lw; };
K.lwEditor = (lw,onChange,cls) => { const box=h('div',{class:'lwed '+(cls||'')});
  const draw=()=>{ box.innerHTML='';
    const row=(k,t)=>h('button',{class:'lwr',onclick:()=>{ K.lwToggle(lw,k); draw(); onChange(lw); }},h('i',{class:'lwb2 '+(lw[k]?'rm':'ad')},lw[k]?'−':'+'),h('span',{},t),h('em',{},lw[k]?'삭제':'추가'));
    box.append(row('calendar','캘린더'),row('weather','날씨'));
    box.append(h('div',{class:'lwn'},'먼저 추가한 위젯이 왼쪽에 놓여요. 순서를 바꾸려면 삭제했다가 원하는 순서로 다시 추가하세요.')); };
  draw(); return box; };
function lockWidgets(){
  const u=S().ui, w=u.lockWidgets||{};
  const bot=h('div',{class:'lwb'});   // 아래쪽 위젯 (캘린더 / 날씨)
  const W=K.D.weather;
  const mk={
    weather:()=>{ if(!W) return null; const hr=+new Date(Date.now()+9*3600e3).toISOString().slice(11,13), night=hr>=18||hr<6, cond=W.cond||'';
      const SVG=(p)=>'<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">'+p+'</svg>';
      const ICO={moon:'<path d="M20 14.500A8.500 8.500 0 0 1 9.500 4a8.500 8.500 0 1 0 10.500 10.500z"/><path d="M17 3l.7 1.800L19.500 5.500l-1.800.7L17 8l-.7-1.800L14.500 5.500l1.800-.7z"/>',
        sun:'<circle cx="12" cy="12" r="4.500"/><g stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800"/></g>',
        cloud:'<path d="M7 18a4.500 4.500 0 0 1-.4-9A6 6 0 0 1 18 10.500 3.800 3.800 0 0 1 17.500 18z"/>',
        rain:'<path d="M7 14a4.500 4.500 0 0 1-.4-9A6 6 0 0 1 18 6.500 3.800 3.800 0 0 1 17.500 14z"/><g stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/></g>',
        snow:'<path d="M7 14a4.500 4.500 0 0 1-.4-9A6 6 0 0 1 18 6.500 3.800 3.800 0 0 1 17.500 14z"/><g><circle cx="8" cy="18.500" r="1.300"/><circle cx="12" cy="20" r="1.300"/><circle cx="16" cy="18.500" r="1.300"/></g>'};
      const kind=(night&&W.kind==='sun')?'moon':(W.kind||'cloud'); const ico=h('span',{class:'lwi',html:SVG(ICO[kind]||ICO.cloud)});
      return h('div',{class:'lwx'},h('div',{class:'lwt'},ico,W.temp+'°'),h('div',{class:'lwc'},(night&&cond==='맑음')?'청명함':cond),w.wxHiLo!==false?h('div',{class:'lwh'},'최고:'+W.hi+'° 최저:'+W.lo+'°'):null); },
    calendar:()=>{ const ft=K.D.settings.fixedToday, t=ft?new Date(+ft.slice(0,4),+ft.slice(5,7)-1,+ft.slice(8,10)):new Date(); const st=new Date(t.getFullYear(),t.getMonth(),t.getDate()-t.getDay()); const wk=Math.max(1,Math.min(3,w.calWeeks||3));
      const g=h('div',{class:'lcal'}); '일월화수목금토'.split('').forEach(d=>g.append(h('span',{class:'lh'},d)));
      for(let i=0;i<7*wk;i++){ const d=new Date(st.getFullYear(),st.getMonth(),st.getDate()+i); g.append(h('span',{class:d.getTime()===t.getTime()?'td':''},String(d.getDate()))); } return g; }
  };
  K.lwOrder(w).forEach(k=>{ const el=mk[k](); if(el) bot.append(el); });
  if(!bot.children.length) bot.style.display='none';
  K._lwBot=bot.children.length>0; return bot;
}
K.refreshLock = function(){
  lock.innerHTML='';
  lock.append(h('div',{class:'shade'}),
    h('div',{class:'lockicon',html:'<svg viewBox="0 0 18 22"><rect x="1" y="9" width="16" height="12" rx="3" fill="#fff"/><path d="M4.500 9V6.500a4.500 4.500 0 0 1 9 0V9" fill="none" stroke="#fff" stroke-width="2"/></svg>'}),
    h('div',{class:'date'}), h('div',{class:'time'}), lockWidgets(),
    h('div',{class:'notis'+(K._lwBot?' wb':'')}, K.notis().slice(0,4).map(n=>notiEl(n))),
    h('div',{class:'qa l',html:'<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M8 2h8v4l-2 3v13h-4V9L8 6z"/></svg>',onclick:e=>{e.stopPropagation();K.toast('손전등');}}),
    h('div',{class:'qa r',onclick:e=>{e.stopPropagation();unlock(()=>K.openApp('camera'));},html:'<svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M4 7h3l2-3h6l2 3h3v13H4zM12 18a4.500 4.500 0 1 0 0-9 4.500 4.500 0 0 0 0 9z"/></svg>'}),
    h('div',{class:'hint'},'화면을 탭하거나 위로 쓸어올려 잠금 해제'));
  K.refreshLockClock(); try{ K.loadWeather&&K.loadWeather(); }catch(e){}
};
K.refreshLock();
const lockedNow = () => !lock.classList.contains('hide');
function lockPhone(){ closeSheets(); if(K.cur) K.closeApp(true); K.setBar(false); lock.classList.remove('hide'); K.refreshLock(); $('#pass').classList.remove('show'); }
K.lockPhone = lockPhone;
/* 새 버전이 올라오면 카톡 알림으로 안내만 함 (자동 새로고침 안 함) */
(()=>{ const cur=(document.querySelector('script[src*="shell.js"]').src.match(/[?&]v=([0-9a-z]+)/)||[])[1]; if(!cur||location.protocol==='file:') return;
  let told=false;
  const check=async()=>{ if(told) return; try{ const r=await fetch(location.pathname+'?_='+Date.now(),{cache:'no-store'}); const t=await r.text(); const m=t.match(/shell\.js\?v=([0-9a-z]+)/);
    if(m&&m[1]!==cur){ told=true; K._upd=Date.now(); if(K.refreshLock) K.refreshLock(); if(nc.classList.contains('show')) renderNC(); K.banner({app:'kakao',title:'개발자딱지',text:'새 버전이 업데이트 되었으니 새로고침해주세요.',onTap:()=>location.reload()}); } }catch(e){} };
  setTimeout(check,4000); setInterval(check,60000);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') check(); });
})();
function unlock(after){
  K._after = after;
  const pc=S().ui.passcode;
  if(!pc){ lock.classList.add('hide'); setTimeout(()=>{ const a=K._after; K._after=null; a&&a(); },350); return; }
  showPass();
}
/* 암호 */
function showPass(){
  const pc=S().ui.passcode, el=$('#pass'); let val='';
  el.innerHTML='';
  const dots=h('div',{class:'dots'}, [...pc].map(()=>h('i')));
  const hint=h('div',{class:'hintt'},'');
  const L={2:'ABC',3:'DEF',4:'GHI',5:'JKL',6:'MNO',7:'PQRS',8:'TUV',9:'WXYZ'};
  const press=d=>{ if(val.length>=pc.length) return; val+=d; upd(); if(val.length===pc.length){ setTimeout(()=>{ if(val===pc){ el.classList.remove('show'); lock.classList.add('hide'); const a=K._after; K._after=null; setTimeout(()=>a&&a(),350); } else { dots.classList.add('shake'); hint.textContent=D.settings.passcodeHint||'암호가 일치하지 않아요'; setTimeout(()=>{dots.classList.remove('shake');val='';upd();},450); } },120); } };
  const upd=()=>[...dots.children].forEach((d,i)=>d.classList.toggle('on',i<val.length));
  const pad=h('div',{class:'pad'}, ['1','2','3','4','5','6','7','8','9'].map(k=>h('button',{onclick:()=>press(k)},k,h('small',{},L[k]||''))), h('div',{class:'blank'}), h('button',{onclick:()=>press('0')},'0',h('small',{})), h('button',{class:'txt',onclick:()=>{val=val.slice(0,-1);upd();}},'⌫'));
  el.append(h('div',{class:'ttl'},'암호 입력'),dots,hint,pad,h('div',{class:'bt'},h('button',{onclick:()=>el.classList.remove('show')},'긴급'),h('button',{onclick:()=>el.classList.remove('show')},'취소')));
  el.classList.add('show');
}
document.addEventListener('keydown',e=>{
  const el=$('#pass'); if(!el.classList.contains('show')) return;
  if(/^\d$/.test(e.key)){ const b=$$('.pad button',el).find(x=>x.firstChild&&x.firstChild.textContent===e.key); b&&b.click(); } else if(e.key==='Backspace'){ $$('.pad .txt',el)[0].click(); } else if(e.key==='Escape') el.classList.remove('show');
});

/* ---------- 배경화면 편집 화면(보기 전용) ---------- */
K.wallEdit = function(opt){
  opt=opt||{};
  if($('#wpedit')) return;
  const WPS=K.wallList().map(w=>w.lock), START=(opt.idx!=null?opt.idx:K.wallIdx());   // 가운데 = 현재 배경화면
  const n=K.now(), time=K.hm(+n).replace(/^(오전|오후) /,''), date='월 '+n.getDate();
  const close=(apply)=>{ if(apply!==false){ const k=idx(); if(k!==START) K.setWall(k); } ov.classList.add('out'); setTimeout(()=>ov.remove(),220); };
  const cards=WPS.map(u=>{
    const c=h('div',{class:'wcard'},
      h('div',{class:'wsh'}), h('div',{class:'wd1'},date), h('div',{class:'wt'},time),
      h('div',{class:'wfocus'},h('span',{html:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/></svg>'}),'집중 모드'));
    c.style.backgroundImage=`url(${u})`;
    return c; });
  const dots=h('div',{class:'wdots'},WPS.map((_,i)=>h('i',{class:i===START?'on':''})));
  const track=h('div',{class:'wtrack'},cards);
  const idx=()=>{ const c=cards[0].offsetWidth+parseFloat(getComputedStyle(track).columnGap||0); return Math.max(0,Math.min(WPS.length-1,Math.round(track.scrollLeft/c))); };
  const sync=()=>{ const i=idx(); [...dots.children].forEach((d,k)=>d.classList.toggle('on',k===i)); cards.forEach((c,k)=>c.classList.toggle('cur',k===i)); };
  track.addEventListener('scroll',sync); cards[START].classList.add('cur');
  const goto=k=>track.scrollTo({left:k*(cards[0].offsetWidth+parseFloat(getComputedStyle(track).columnGap||0)),behavior:'smooth'});
  [...dots.children].forEach((d,k)=>d.onclick=()=>goto(k));
  /* 마우스 드래그 / 카드 탭 = 닫기 (터치는 기본 스크롤) */
  let md=null, dragged=false;
  track.addEventListener('pointerdown',e=>{ dragged=false; if(e.pointerType==='mouse'){ md={x:e.clientX,l:track.scrollLeft}; track.style.scrollSnapType='none'; } });
  track.addEventListener('pointermove',e=>{ if(md){ if(Math.abs(e.clientX-md.x)>6) dragged=true; track.scrollLeft=md.l-(e.clientX-md.x); } });
  const end=()=>{ if(!md) return; md=null; track.style.scrollSnapType=''; goto(idx()); };
  track.addEventListener('pointerup',end); track.addEventListener('pointercancel',end);
  track.addEventListener('scroll',()=>{ dragged=true; });
  cards.forEach((c,k)=>c.addEventListener('click',()=>{ if(dragged) { dragged=false; return; } if(k===idx()) close(); else goto(k); }));
  /* 맞춤화: 잠금화면/홈 화면을 따로 고르고 필터를 입혀요 (정해둔 사진 중에서만) */
  function customize(){
    const cur=idx(); let tgt='lock'; const st={li:cur,hi:(cur===K.wallIdx()?K.wallHomeIdx():cur),lf:(cur===K.wallIdx()?K.wallFlt('lock'):'none'),hf:(cur===K.wallIdx()?K.wallFlt('home'):'none'),hb:(cur===K.wallIdx()?K.wallBlur():true),lw:Object.assign({},K.state.ui.lockWidgets||{})}; st.lw.order=K.lwOrder(st.lw);
    const prevL=h('div',{class:'czp'}), prevH=h('div',{class:'czp'});
    prevL.append(h('div',{class:'czd'},date),h('div',{class:'czt'},time)); const lwp0=null;
    const bgH=h('div',{class:'czbg'}); prevH.append(bgH,h('div',{class:'czg'},...Array.from({length:12},()=>h('i',{}))));
    const thumbs=h('div',{class:'czth'}), flts=h('div',{class:'czfl'});
    const lwp=h('div',{class:'czlw'}), wl=K.lwEditor(st.lw,()=>draw(),'dk');
    const blr=h('div',{class:'czfl'},h('button',{onclick:()=>{ st.hb=true; draw(); }},'블러 켬'),h('button',{onclick:()=>{ st.hb=false; draw(); }},'블러 끔'));
    const draw=()=>{
      K.wallBg(WPS[st.li],st.lf,prevL); K.wallBg((K.wallList()[st.hi].home||WPS[st.hi]),st.hf,bgH); prevH.classList.toggle('hb',st.hb); [...blr.children].forEach((b,k)=>b.classList.toggle('on',(k===0)===st.hb));
      lwp.innerHTML=''; K.lwOrder(st.lw).forEach(k=>lwp.append(h('i',{class:'czw '+k},k==='weather'?'날씨':'캘린더')));
      prevL.classList.toggle('sel',tgt==='lock'); prevH.classList.toggle('sel',tgt==='home');
      [...thumbs.children].forEach((t,k)=>t.classList.toggle('on',k===(tgt==='lock'?st.li:st.hi)));
      [...flts.children].forEach((b,k)=>b.classList.toggle('on',K.WFLT[k].id===(tgt==='lock'?st.lf:st.hf)));
    };
    WPS.forEach((u,k)=>thumbs.append(h('div',{class:'czti',style:`background-image:url(${u})`,onclick:()=>{ if(tgt==='lock') st.li=k; else st.hi=k; draw(); }})));
    K.WFLT.forEach(f=>flts.append(h('button',{onclick:()=>{ if(tgt==='lock') st.lf=f.id; else st.hf=f.id; draw(); }},f.n)));
    prevL.append(lwp); prevL.onclick=()=>{ tgt='lock'; draw(); }; prevH.onclick=()=>{ tgt='home'; draw(); };
    const bgPane=h('div',{class:'czpane'},h('div',{class:'czlb'},'사진'),thumbs,h('div',{class:'czlb'},'필터'),flts,h('div',{class:'czlb'},'홈 화면 블러'),blr), wPane=h('div',{class:'czpane',style:'display:none'},h('div',{class:'czlb'},'잠금 화면 위젯'),wl);
    const czseg=h('div',{class:'czseg'},[['bg','배경',bgPane],['wd','위젯',wPane]].map(([k,t,pn],i)=>h('button',{class:i===0?'on':'',onclick:e=>{ [...czseg.children].forEach(b=>b.classList.toggle('on',b===e.currentTarget)); bgPane.style.display=k==='bg'?'':'none'; wPane.style.display=k==='wd'?'':'none'; }},t)));
    const cz=h('div',{id:'wpcz'},
      h('div',{class:'czhd'},h('button',{onclick:()=>cz.remove()},'취소'),h('b',{},'맞춤화'),h('button',{class:'ok',onclick:()=>{ K.setWallParts(st.li,st.hi,st.lf,st.hf,st.hb); K.sysSet('lockWidgets',st.lw); cz.remove(); close(false); }},'완료')),
      h('div',{class:'czpv'},h('div',{},prevL,h('span',{},'잠금화면')),h('div',{},prevH,h('span',{},'홈 화면'))),
      czseg,bgPane,wPane);
    cz.addEventListener('pointerdown',e=>e.stopPropagation());
    screen.append(cz); draw();
  }
  /* ＋ : 정해둔 사진 목록에서 골라 잠금화면+홈 화면에 적용 */
  function pickNew(){
    const g=h('div',{class:'pkgrid'},WPS.map((u,k)=>h('div',{class:'pkit',style:`background-image:url(${u})`,onclick:()=>{ K.setWall(k); pk.remove(); close(false); }})));
    const pk=h('div',{id:'wppk'},h('div',{class:'czhd'},h('button',{onclick:()=>pk.remove()},'취소'),h('b',{},'사진'),h('span',{})),g);
    pk.addEventListener('pointerdown',e=>e.stopPropagation()); screen.append(pk);
  }
  const ov=h('div',{id:'wpedit'},
    h('div',{class:'wlab'},'사진'), track, dots,
    h('div',{class:'wbtn'},h('button',{class:'cz',onclick:()=>customize()},'맞춤화'),h('button',{class:'pl',onclick:()=>pickNew()},'＋')));
  ov.addEventListener('pointerdown',e=>e.stopPropagation());
  screen.append(ov);
  track.style.scrollBehavior='auto'; track.style.scrollSnapType='none'; track.scrollLeft=START*(cards[0].offsetWidth+parseFloat(getComputedStyle(track).columnGap||0)); setTimeout(()=>{ track.style.scrollSnapType=''; track.style.scrollBehavior=''; sync(); },50);
  setTimeout(()=>{ dragged=false; },400);
  if(opt.cz) setTimeout(()=>customize(),120);
};

/* ---------- 알림센터 ---------- */
const nc=$('#nc'), cc=$('#cc');
K.renderCC=()=>renderCC(); K.renderNC=()=>renderNC();
function renderNC(){
  nc.innerHTML=''; const list=K.notis();
  nc.append(h('div',{class:'date'}),h('div',{class:'time'}), h('div',{class:'notis'}, list.length?[h('div',{class:'nh'},'알림 센터',h('button',{onclick:()=>{ list.forEach(n=>S().notiDismissed.push(n.id)); K.save(); renderNC(); }},'✕')), list.map(n=>notiEl(n,true))]:h('div',{class:'none'},'알림 없음')));
  K.refreshLockClock();
}
function showNC(){ if(cc.classList.contains('show')) hideCC(); renderNC(); nc.classList.add('show'); }
function hideNC(){ nc.classList.remove('show'); }
/* ---------- 제어센터 ---------- */
const I = {
  air:'M21 16v-2l-8-5V3.500a1.500 1.500 0 0 0-3 0V9l-8 5v2l8-2.500V19l-2 1.500V22l3.500-1 3.500 1v-1.500L13 19v-5.500z',
  cell:'M2 20h3v-4H2zm5 0h3V12H7zm5 0h3V8h-3zm5 0h3V3h-3z',
  wifi:'M12 18.500l2.500-2.500a3.500 3.500 0 0 0-5 0zM12 13c1.800 0 3.400.7 4.600 1.900l1.600-1.600A9.500 9.500 0 0 0 12 10.500 9.500 9.500 0 0 0 5.800 13.300l1.600 1.600A6.600 6.600 0 0 1 12 13zm0-6.500c2.900 0 5.600 1.100 7.600 3l1.600-1.600A14 14 0 0 0 12 4a14 14 0 0 0-9.200 3.900l1.600 1.600c2-1.900 4.700-3 7.600-3z',
  bt:'M7 7l10 10-5 5V2l5 5L7 17',
  flash:'M8 2h8v4l-2 3v13h-4V9L8 6z', timer:'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 4v4.500l3 1.800-.8 1.300L11 13V8zM9 1h6v2H9z', calc:'M5 3h14v18H5zM8 6h8v3H8zM8 12h2v2H8zm3 0h2v2h-2zm3 0h2v2h-2zM8 16h2v2H8zm3 0h2v2h-2zm3 0h2v4h-2z', cam:'M4 7h3l2-3h6l2 3h3v13H4zM12 18a4.500 4.500 0 1 0 0-9 4.500 4.500 0 0 0 0 9z',
  lockr:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 3a3 3 0 0 1 3 3v1h1v6H8v-6h1V9a3 3 0 0 1 3-3z', mirror:'M3 5h18v12H3zM8 21l4-3 4 3', moon:'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z', sun:'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM11 1h2v3h-2zM11 20h2v3h-2zM1 11h3v2H1zM20 11h3v2h-3z', vol:'M3 9v6h4l5 4V5L7 9z'
};
const ico = p => `<svg viewBox="0 0 24 24"><path d="${p}"/></svg>`;
function renderCC(){
  cc.innerHTML=''; const u=S().ui; if(u.rot===undefined||u.rot===false&&!K._rotSet){ u.rot=true; K._rotSet=true; }
  const SV=(d,fill)=>`<svg viewBox="0 0 24 24" ${fill?'fill="currentColor"':'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"'}>${d}</svg>`;
  const IC={
    air:SV('<path d="M21 16v-2l-8-5V3.500a1.500 1.500 0 0 0-3 0V9l-8 5v2l8-2.500V19l-2 1.500V22l3.500-1 3.500 1v-1.500L13 19v-5.500z"/>',1),
    hot:SV('<circle cx="12" cy="12" r="2"/><path d="M8 8a5.700 5.700 0 0 0 0 8M16 8a5.700 5.700 0 0 1 0 8M5 5a9.800 9.800 0 0 0 0 14M19 5a9.800 9.800 0 0 1 0 14"/>'),
    wifi:SV('<path d="M12 20.5L7.76 16.26A6 6 0 0 1 16.24 16.26zM2.95 11.45A12.8 12.8 0 0 1 21.05 11.45L18.01 14.49A8.5 8.5 0 0 0 5.99 14.49zM-1.65 6.85A19.3 19.3 0 0 1 25.65 6.85L22.61 9.89A15 15 0 0 0 1.39 9.89z"/>',1),
    cell:SV('<path d="M4 19v-3M9 19v-6M14 19V9M19 19V5" stroke-width="3"/>'),
    bt:SV('<path d="M7 7.500l10 9-5 4.500V3l5 4.500-10 9"/>'),
    link:SV('<path d="M10 14a4 4 0 0 0 5.500 0l2.500-2.500a4 4 0 0 0-5.500-5.500M14 10a4 4 0 0 0-5.500 0L6 12.500a4 4 0 0 0 5.500 5.500M4 4l16 16"/>'),
    globe:SV('<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c3 3 3 14 0 17M12 3.500c-3 3-3 14 0 17"/>'),
    rot:SV('<path d="M20 12a8 8 0 1 1-2.600-5.900"/><path d="M20.500 3.500v4.500H16"/><rect x="9" y="11.500" width="6" height="5" rx="1.200" fill="currentColor" stroke="none"/><path d="M10.200 11.500v-1.300a1.800 1.800 0 0 1 3.600 0v1.300"/>'),
    bell:SV('<path d="M6 17h12l-1.500-2V11a4.500 4.500 0 0 0-9 0v4zM10 20a2 2 0 0 0 4 0M4 4l16 16"/>'),
    moon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 14.500A8.500 8.500 0 0 1 9.500 4a8.500 8.500 0 1 0 10.500 10.500z"/></svg>',
    sun:'<svg viewBox="0 0 24 24" fill="#ffd60a" stroke="#ffd60a" stroke-width="1.700" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M18.700 5.300l-1.800 1.800M7.100 16.900l-1.800 1.800" fill="none"/></svg>',
    vol:SV('<path d="M4 9.500h3.500L12 5.500v13l-4.500-4H4z" fill="currentColor"/><path d="M4.500 4.500l15 15"/>'),
    vol2:SV('<path d="M4 9.500h3.500L12 5.500v13l-4.500-4H4z" fill="currentColor"/><path d="M15.500 9a4 4 0 0 1 0 6M18.300 6.500a8 8 0 0 1 0 11"/>'),
    flash:SV('<path d="M9 3h6v4l-1.500 2.500V21h-3V9.500L9 7z" fill="currentColor"/>'),
    cam:SV('<path d="M4 8h3l1.500-2.500h7L17 8h3v11H4z" fill="currentColor" stroke="none"/><circle cx="12" cy="13.500" r="3.500" fill="#2a2420" stroke="none"/>'),
    contrast:SV('<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
    batt:SV('<rect x="3" y="7.500" width="16" height="9" rx="2.500"/><path d="M21 10.500v3"/><rect x="5" y="9.500" width="4.500" height="5" rx="1" fill="currentColor"/>'),
    rec:SV('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.500" fill="currentColor"/>'),
    shz:SV('<path d="M9 15a4 4 0 0 1 0-5.500L12 7M15 9a4 4 0 0 1 0 5.500L12 17M9.500 10L14.500 14"/>'),
    qr:SV('<path d="M4 8V5.500A1.500 1.500 0 0 1 5.500 4H8M16 4h2.500A1.500 1.500 0 0 1 20 5.500V8M20 16v2.500a1.500 1.500 0 0 1-1.500 1.500H16M8 20H5.500A1.500 1.500 0 0 1 4 18.500V16"/><rect x="8" y="8" width="3" height="3"/><rect x="13" y="8" width="3" height="3"/><rect x="8" y="13" width="3" height="3"/><path d="M13 13h3v3"/>'),
    mir:SV('<rect x="7" y="4" width="14" height="11" rx="2"/><path d="M4 8v10a2 2 0 0 0 2 2h11"/>'),
    scan:SV('<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16"/>'),
    spd:SV('<circle cx="16" cy="12" r="4.500" fill="currentColor"/><path d="M3 8h7M3 12h5M3 16h7"/>'),
    book:SV('<path d="M7 4h10a1 1 0 0 1 1 1v13H8a2 2 0 0 0-2 2V5a1 1 0 0 1 1-1zM6 18h12" fill="currentColor" fill-opacity=".9"/>'),
    open:SV('<path d="M12 6.500C10 5 6.500 4.500 3 5v13c3.500-.5 7 0 9 1.500 2-1.500 5.500-2 9-1.500V5c-3.500-.5-7 0-9 1.500z" fill="currentColor"/>'),
    plus:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>',
    pwr:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round"><path d="M12 3v8M6.800 6.500a8 8 0 1 0 10.400 0"/></svg>',
    rew:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 6v12L3 12zM21 6v12l-8-6z"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>',
    pause:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    ff:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 6v12l8-6zM3 6v12l8-6z"/></svg>',
    airp:SV('<path d="M5 15a8 8 0 1 1 14 0M8 13.500a4.500 4.500 0 1 1 8 0"/><path d="M12 14l5 6H7z" fill="currentColor"/>')
  };
  const rb=(icon,extra='',fn)=>{ const b=h('button',{class:'rb '+extra,html:icon}); if(fn) b.onclick=fn; return b; };
  const tg=(key,icon,cls,fn)=>{ const b=rb(icon,cls+(u[key]?' on':'')); b.onclick=()=>{ u[key]=!u[key]; b.classList.toggle('on',u[key]); K.save(); K.refreshStatus(); fn&&fn(u[key]); }; return b; };
  const none=(label)=>()=>K.toast(label);
  const top=h('div',{class:'cctop'},h('button',{html:IC.plus}),h('button',{html:IC.pwr,onclick:e=>{ e.stopPropagation(); hideCC(); lockPhone(); }}));
  const g=h('div',{class:'ccg'});
  // 연결 블록
  const smalls=h('div',{class:'sm4'},tg('cell',IC.cell,'sm gr'),tg('bt',IC.bt,'sm bl',v=>{ if(!v&&K._bmwOn){ K._bmwOn=false; try{ K._bmwA&&K._bmwA.pause(); }catch(e){} K.refreshStatus(); } }),rb(IC.link,'sm bl on'),rb(IC.globe,'sm bl on'));
  g.append(h('div',{class:'ccblk col2 row2'},tg('airplane',IC.air,'big or'),rb(IC.hot,'big bl on'),tg('wifi',IC.wifi,'big bl'),smalls));
  // 음악 블록
  if(K.ccPlaying===undefined) K.ccPlaying=false;   // 제어센터 음악: 태양계 (멈춤 상태, 모양만)
  g.append(h('div',{class:'ccblk col2 row2 mus',onclick:e=>{ if(e.target.closest('button')) return; K.openYT(); }},h('div',{class:'mtop'},h('div',{class:'art',style:'background:url(photos/album-cover.jpg) center/cover'}),h('button',{class:'ap',html:IC.airp})),
    h('div',{class:'mt2'},'태양계'),
    h('div',{class:'ctl'},h('button',{html:IC.rew}),h('button',{html:K.ccPlaying?IC.pause:IC.play,onclick:()=>{K.ccPlaying=!K.ccPlaying;renderCC();}}),h('button',{html:IC.ff}))));
  // 회전잠금 / 무음
  g.append(tg('rot',IC.rot,'wh red'),(()=>{ const b=rb(IC.bell,'wh red'+(u.silent?' on':'')); b.onclick=()=>{ K.sysSet('silent',!S().ui.silent); K.toast(S().ui.silent?'무음 모드 켬':'무음 모드 끔'); }; return b; })());
  const slider=(key,icon,fn,cls)=>{ const w=h('div',{class:'ccsw row2 '+cls}); const init=key==='brightness'?u.brightness:u.volume; const fill=h('div',{class:'fill',style:'height:'+(init*100)+'%'}); const ispan=h('span',{html:(key==='volume'&&init>0.03)?IC.vol2:icon,style:'display:contents'}); const sl=h('div',{class:'ccsl'},fill,ispan); w.append(sl);
    const set=e=>{ const r=w.getBoundingClientRect(); let v=Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height)); if(key==='brightness') v=Math.max(.15,v); fill.style.height=v*100+'%'; if(key==='volume') ispan.innerHTML = v>0.03 ? IC.vol2 : IC.vol; fn(v); };
    sl.addEventListener('pointerdown',e=>{ e.stopPropagation(); sl.setPointerCapture(e.pointerId); set(e); sl.onpointermove=set; }); sl.addEventListener('pointerup',()=>{ sl.onpointermove=null; K.save(); if(key==='volume'&&!K.quiet()&&u.volume>0) K.msgSound(); }); return w; };
  g.append(slider('brightness',IC.sun,v=>{ u.brightness=v; K.dim(v); K._sysL=K._sysL.filter(f=>{ try{ return f('brightness')!==false; }catch(e){ return false; } }); },'br'), slider('volume',IC.vol,v=>{ u.volume=v; K.applyVolume(); K._sysL=K._sysL.filter(f=>{ try{ return f('volume')!==false; }catch(e){ return false; } }); },'vl'));
  const otherFocus=Object.keys(u.focus||{}).filter(k=>k!=='방해 금지'&&u.focus[k])[0];
  const fl=u.doNotDisturb?'방해 금지':(otherFocus||'집중 모드');
  const fcs=h('div',{class:'ccfocus col2'+((u.doNotDisturb||otherFocus)?' on':''),onclick:()=>{ K.sysSet('doNotDisturb',!S().ui.doNotDisturb); }},h('span',{class:'mo',html:IC.moon}),h('span',{},fl),h('span',{class:'ud',html:'<svg class="ud2" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9.500l5-5 5 5M7 14.500l5 5 5-5"/></svg>'}));
  g.append(fcs);
  // 버튼 격자
  g.append(tg('flash',IC.flash,'gl',v=>{ K.flashlight(v); K.toast(v?'손전등 켜짐':'손전등 꺼짐'); }), rb(IC.rec,'gl2',none('화면 기록')), (()=>{ const b=rb(IC.contrast,'gl'+(u.dark===true?' on':'')); b.onclick=()=>{ u.dark=!(u.dark===true); b.classList.toggle('on',u.dark); K.save(); K.applyTheme(); K.toast(u.dark?'다크 모드':'라이트 모드'); }; return b; })(), (()=>{ const b=rb(IC.batt,'gl lp'+(u.lowPower?' on':'')); b.onclick=()=>{ K.sysSet('lowPower',!S().ui.lowPower); K.toast(S().ui.lowPower?'저전력 모드 켬':'저전력 모드 끔'); }; return b; })());
  const blk=g.querySelector('.ccblk');
  blk.addEventListener('click',e=>{ if(e.target.closest('button')) return; openNet(); });
  const stat=h('div',{class:'ccstat'},h('div',{class:'l',html:IC.cell.replace('stroke-width="1.9"','stroke-width="2.4"')+'<b>OneToTen</b>'+IC.wifi}),h('div',{class:'r'},h('b',{},u.batteryLevel+'%'),h('i',{class:'bt'+(u.lowPower?' lp':u.batteryLevel<=20?' lo':'')},h('em',{style:'width:'+u.batteryLevel+'%'}))));
  const side=h('div',{class:'ccside',html:'<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 21s-8-5.500-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.500-8 11-8 11z"/></svg><svg viewBox="0 0 24 24" fill="#aaa"><path d="M9 18V5l11-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z"/></svg><svg viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.800" stroke-linecap="round"><path d="M12 11v9M8.500 8a5 5 0 0 0 0 6M15.500 8a5 5 0 0 1 0 6M5.500 5.500a9 9 0 0 0 0 11M18.500 5.500a9 9 0 0 1 0 11"/></svg>'});
  cc.append(top,stat,g);
  function openNet(){
    const on=(k)=>u[k], row=(icon,cls,t1,t2,key)=>{ const b=h('div',{class:'nrow2 '+cls},h('i',{class:'ci'+(key&&on(key)?' on':'')+(key==='cell'||key==='bt'||key==='wifi'?' '+({cell:'gr',bt:'bl',wifi:'bl'})[key]:''),html:icon}),h('div',{class:'tx'},h('b',{},t1),h('small',{html:t2.replace(' ⌃⌄',' '+'<svg class="ud2" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9.500l5-5 5 5M7 14.500l5 5 5-5"/></svg>')}))); if(key){ b.onclick=e=>{ e.stopPropagation(); u[key]=!u[key]; K.save(); K.refreshStatus(); openNet(); }; } return b; };
    const old=cc.querySelector('.ccnet'); if(old) old.remove();
    const ov=h('div',{class:'ccnet'},
      h('div',{class:'wide'},row(IC.air,'w','에어플레인 모드',u.airplane?'켬':'끔','airplane')),
      h('div',{class:'two'},row(IC.wifi,'t','Wi-Fi',u.wifi?'mangwon_rem_1704 ⌃⌄':'꺼짐','wifi'),row(IC.hot,'t airdrop','AirDrop','연락처만 ⌃⌄',null)),
      h('div',{class:'two'},row(IC.cell,'t','셀룰러 데이터',u.cell?'OneToTen':'꺼짐','cell'),row(IC.bt,'t','Bluetooth',u.bt?'켬 ⌃⌄':'끔 ⌃⌄','bt')),
      h('div',{class:'wide'},row(IC.link,'w','개인용 핫스팟','끔',null)),
      h('div',{class:'wide'},row(IC.globe,'w','VPN','끔',null)));
    ov.onclick=e=>{ if(e.target===ov) ov.remove(); };
    cc.append(ov);
  }
}
function showCC(){ if(nc.classList.contains('show')) hideNC(); renderCC(); cc.classList.add('show'); $('#status').classList.add('ccopen'); }
function hideCC(){ cc.classList.remove('show'); $('#status').classList.remove('ccopen'); }
function closeSheets(){ hideNC(); hideCC(); }
K.dim(S().ui.brightness); K.applyTheme();


/* ---------- 사진 크게 보기 (카톡 사진 뷰어) ---------- */
K.viewImg = function(src, meta={}, thumb){
  const scr=document.getElementById('screen'); if(scr.querySelector('.pv')) return;
  const sr=scr.getBoundingClientRect(), sc=K.scale||1, W=sr.width/sc, H=sr.height/sc;
  const ICO=(d)=>`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const list=meta.list&&meta.list.length>1?meta.list:null; let idx=Math.max(0,meta.index||0);
  const cur=()=>list?list[idx]:meta;
  const whenOf=ts=>{ const t=ts?new Date(ts):null; return t?`${t.getFullYear()}년 ${t.getMonth()+1}월 ${t.getDate()}일 ${t.getHours()<12?'오전':'오후'} ${(t.getHours()%12)||12}:${String(t.getMinutes()).padStart(2,'0')}`:''; };
  const bg=h('div',{class:'pv-bg'}), img=h('img',{class:'pv-img',src,draggable:'false'});
  const top=h('div',{class:'pv-top'},h('button',{class:'pv-x',html:ICO('<path d="M6 6l12 12M18 6L6 18"/>')}),h('div',{class:'pv-t'},h('b',{},cur().name||''),h('small',{},whenOf(cur().ts))),h('span',{style:'width:44px'}));
  const bot=h('div',{class:'pv-bot'},...[ICO('<path d="M12 15V4M7.500 8.500L12 4l4.500 4.500M5 13v5.500A1.500 1.500 0 0 0 6.500 20h11a1.500 1.500 0 0 0 1.500-1.500V13"/>'),ICO('<path d="M12 4v11M7.500 10.500L12 15l4.500-4.500M5 19.500h14"/>'),ICO('<path d="M12 20.500s-7.500-4.500-7.500-10A4.300 4.300 0 0 1 12 7.800a4.300 4.300 0 0 1 7.500 2.700c0 5.500-7.500 10-7.500 10z"/>'),ICO('<path d="M5 7h14M10 7V4.500h4V7M7 7l1 13h8l1-13"/>')].map(x=>h('button',{html:x})));
  const pv=h('div',{class:'pv'},bg,img,top,bot); scr.append(pv);
  const prevBar=K._bar; K.setBar(false);
  let ar=1, fw=0, fh=0, fx=0, fy=0, z=1, tx=0, ty=0, ui=true, closing=false, mode='', busy=false;
  const fit=()=>{ ar=(img.naturalWidth||1)/(img.naturalHeight||1); fw=Math.min(W,H*ar); fh=fw/ar; fx=(W-fw)/2; fy=(H-fh)/2; img.style.cssText=`left:${fx}px;top:${fy}px;width:${fw}px;height:${fh}px`; };
  const setT=(x,y,s,anim)=>{ img.style.transition=anim?'transform .3s cubic-bezier(.2,.8,.2,1)':'none'; img.style.transform=`translate(${x}px,${y}px) scale(${s})`; };
  const thumbT=()=>{ if(!thumb||!thumb.isConnected) return null; const r=thumb.getBoundingClientRect(); const l=(r.left-sr.left)/sc, tp=(r.top-sr.top)/sc, w=r.width/sc, hh=r.height/sc; return {x:l-fx+(w-fw)/2, y:tp-fy+(hh-fh)/2, s:Math.max(w/fw,hh/fh)}; };
  const start=()=>{ fit(); const o=thumbT(); if(o){ setT(o.x,o.y,o.s,false); void img.offsetWidth; } else { img.style.opacity=0; }
    requestAnimationFrame(()=>{ bg.style.opacity=1; img.style.opacity=1; setT(0,0,1,true); pv.classList.add('on'); }); if(thumb&&thumb.isConnected) thumb.style.visibility='hidden'; };
  const go=d=>{ if(busy) return; busy=true; const ni=idx+d, it=list[ni];
    img.style.transition='transform .2s ease-out'; img.style.transform=`translate(${d*W}px,0) scale(1)`;
    setTimeout(()=>{ const old=thumb; idx=ni; thumb=meta.thumbFor?meta.thumbFor(it):null;
      const done=()=>{ fit(); img.style.opacity=1; if(old&&old!==thumb) old.style.visibility=''; if(thumb&&thumb.isConnected) thumb.style.visibility='hidden';
        top.querySelector('b').textContent=it.name||''; top.querySelector('small').textContent=whenOf(it.ts);
        tx=0; ty=0; setT(-d*W,0,1,false); void img.offsetWidth; setT(0,0,1,true); setTimeout(()=>{ busy=false; },220); };
      img.style.opacity=0; img.onload=()=>{ img.onload=null; img.style.opacity=1; done(); }; img.src=it.src; },200); };
  const close=()=>{ if(closing) return; closing=true; pv.classList.remove('on'); bg.style.opacity=0; const o=thumbT();
    if(o) setT(o.x,o.y,o.s,true); else { img.style.transition='opacity .25s'; img.style.opacity=0; }
    setTimeout(()=>{ if(thumb) thumb.style.visibility=''; pv.remove(); K.setBar(prevBar===undefined?true:prevBar); },300); };
  top.querySelector('.pv-x').onclick=e=>{ e.stopPropagation(); close(); };
  // 제스처: 탭=메뉴 켜고 끄기, 더블탭=확대, 두 손가락=확대/축소, 아래로 쓸기=닫기
  const ptrs=new Map(); let g0=null, lastTap=0, moved=false;
  const loc=e=>({x:(e.clientX-sr.left)/sc, y:(e.clientY-sr.top)/sc});
  pv.addEventListener('pointerdown',e=>{ if(e.target.closest('.pv-top,.pv-bot')) return; pv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId,loc(e)); moved=false; mode='';
    g0={tx,ty,z,pts:[...ptrs.values()].map(p=>({...p})),d:null}; if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; g0.d=Math.hypot(a.x-b.x,a.y-b.y); g0.c={x:(a.x+b.x)/2,y:(a.y+b.y)/2}; } });
  pv.addEventListener('pointermove',e=>{ if(!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId,loc(e)); const ps=[...ptrs.values()];
    if(ps.length===2&&g0.d){ moved=true; const d=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y); z=Math.max(1,Math.min(5,g0.z*d/g0.d)); setT(tx,ty,z,false); return; }
    if(ps.length===1&&g0){ const p=ps[0], s0=g0.pts[0]; if(!s0) return; const dx=p.x-s0.x, dy=p.y-s0.y; if(Math.hypot(dx,dy)>6) moved=true;
      if(z>1.02){ tx=g0.tx+dx; ty=g0.ty+dy; setT(tx,ty,z,false); } else if(moved){ if(!mode) mode=(list&&Math.abs(dx)>Math.abs(dy))?'h':'v';
        if(mode==='h'){ const edge=(dx>0&&idx===list.length-1)||(dx<0&&idx===0); tx=edge?dx*.3:dx; ty=0; setT(tx,0,1,false); }
        else { ty=dy; tx=dx*.4; setT(tx,ty,1,false); bg.style.opacity=Math.max(.2,1-Math.abs(dy)/400); } } } });
  const up=e=>{ if(!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
    if(ptrs.size) { g0={tx,ty,z,pts:[...ptrs.values()].map(p=>({...p})),d:null}; return; }
    if(z<=1.02){ z=1;
      if(mode==='h'){ const d=tx>0?1:-1; if(Math.abs(tx)>70&&idx+d>=0&&idx+d<list.length){ go(d); return; } tx=0; ty=0; setT(0,0,1,true); return; }
      if(Math.abs(ty)>110){ close(); return; } tx=0; ty=0; setT(0,0,1,true); bg.style.opacity=1; }
    if(!moved){ const now=Date.now(); if(now-lastTap<300){ lastTap=0; if(z>1.02){ z=1; tx=0; ty=0; } else { z=2.4; const p=loc(e); tx=(W/2-p.x)*(z-1); ty=(H/2-p.y)*(z-1); } setT(tx,ty,z,true); }
      else { lastTap=now; setTimeout(()=>{ if(lastTap&&Date.now()-lastTap>=290){ lastTap=0; ui=!ui; pv.classList.toggle('hideui',!ui); } },300); } } };
  pv.addEventListener('pointerup',up); pv.addEventListener('pointercancel',up);
  if(img.complete&&img.naturalWidth) start(); else img.addEventListener('load',start,{once:true});
};

/* ---------- 통화 화면 ---------- */
let callTimer=null;
/* 통화 연결음(발신 중)·전화 벨소리(수신 중). 브라우저가 소리를 막지 않도록 첫 터치 때 한 번 준비해 둬요 */
K.ringback = new Audio('music/ringback.mp3'); K.ringback.loop=true; K.ringtone = new Audio('music/ringtone.mp3'); K.ringtone.loop=true;
K.sjCallA = new Audio('music/sj-call.mp3'); K.sjCallA.preload='auto';   // 박성진과 통화가 연결된 지 2초 뒤에 재생
K.stopRing = () => { K._incoming=false; [K.ringback,K.ringtone].forEach(a=>{ try{ a._real=false; a.pause(); a.currentTime=0; }catch(e){} }); };
K.playRing = a => { if(a===K.ringtone && !K._incoming) return; try{ a._real=true; a.volume=1; a.muted=false; a.currentTime=0; const p=a.play(); if(p&&p.catch) p.catch(()=>{}); }catch(e){} };   // 벨소리는 걸려오는 전화 화면일 때만 재생
K.startCall = function(name,number,contact,video){
  const el=$('#call'); el.innerHTML='';
  const st=h('div',{class:'cv-st'},video?'FaceTime 연결 중...':'휴대전화 연결 중...');
  const I2={
    spk:'<svg viewBox="0 0 24 24"><path d="M3 9.500v5h3.500L11 18.500v-13L6.500 9.500z"/><path d="M14 8.500a5 5 0 0 1 0 7M16.500 5.500a9 9 0 0 1 0 13" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    ft:'<svg viewBox="0 0 24 24"><path d="M2.500 7.500A2.500 2.500 0 0 1 5 5h8a2.500 2.500 0 0 1 2.500 2.500v9A2.500 2.500 0 0 1 13 19H5a2.500 2.500 0 0 1-2.500-2.500zM17 10.500l4.500-3v9L17 13.500z"/></svg>',
    mic:'<svg viewBox="0 0 24 24"><rect x="8.500" y="2.500" width="7" height="12" rx="3.500"/><path d="M5 11.500a7 7 0 0 0 14 0M12 18.500V22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    more:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    kp:'<svg viewBox="0 0 24 24">'+[5,12,19].map(y=>[5,12,19].map(x=>`<circle cx="${x}" cy="${y}" r="1.900"/>`).join('')).join('')+'</svg>',
    end:`<svg viewBox="0 0 24 24" style="transform:rotate(135deg)"><path d="${K.PHONE_PATH}"/></svg>`
  };
  const cell=(ic,label,fn,cls)=>h('div',{class:'cv-c'},h('b',{class:cls||'',onclick:fn||null,html:ic}),label);
  const tg=e=>e.currentTarget.classList.toggle('on');
  el.append(h('div',{class:'cv2'}, st, h('div',{class:'cv-nm'},name),
    h('div',{class:'cv-g'},
      cell(I2.spk,'스피커',tg), cell(I2.ft,'FaceTime'), cell(I2.mic,'소리 끔',tg),
      cell(I2.more,'더 보기'), cell(I2.end,'종료',()=>endCall(),'red'), cell(I2.kp,'키패드'))));
  K.unlockAudio(); el.classList.add('show'); K.setBar(false); K._inCall=true; K.refreshStatus();   // 통화 중엔 상태바 시간이 초록 알약
  const answered=K._answered; K._answered=false; K.stopRing(); if(!answered) K.playRing(K.ringback);   // 내가 거는 전화일 때만 연결음
  let sec=answered?0:-5; const isl=$('#island'); let started=false, startTs=0, sjT=null;
  const armSj=()=>{ if(contact&&contact.id==='sj'){ clearTimeout(sjT); sjT=setTimeout(()=>{ if(!started) return; try{ const a=K.sjCallA; a._real=true; a.loop=false; a.currentTime=0; a.volume=1; a.muted=false; const p=a.play(); if(p&&p.catch) p.catch(()=>{}); }catch(e){} },2000); } };
  /* 아이폰은 '누른 순간'에 시작한 재생만 허용하므로, 통화 시작(터치) 때 무음으로 미리 재생해 두었다가 연결 2초 뒤에 소리를 켜요 */
  if(contact&&contact.id==='sj'){ try{ const a=K.sjCallA; a._real=true; a.loop=true; a.muted=true; a.currentTime=0; const p=a.play(); if(p&&p.catch) p.catch(()=>{}); }catch(e){} }
  clearInterval(callTimer);
  if(answered){ started=true; startTs=Date.now(); armSj(); isl.classList.add('call'); st.textContent=(video?'FaceTime ':'')+'00:00'; $('#islT').textContent='0:00'; }   // 받은 전화는 '연결 중' 없이 바로 통화 시간 표시
  callTimer=setInterval(()=>{ sec++; if(sec===0){ K.stopRing(); started=true; startTs=Date.now(); armSj(); isl.classList.add('call'); }
    if(started){ const s=Math.floor((Date.now()-startTs)/1000), t=Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); st.textContent=(video?'FaceTime ':'')+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); $('#islT').textContent=t; } },1000);
  function endCall(){
    clearInterval(callTimer); clearTimeout(sjT); try{ const a=K.sjCallA; a._real=false; a.loop=false; a.pause(); a.currentTime=0; a.muted=false; }catch(e){} K.stopRing(); el.classList.remove('show'); $('#island').classList.remove('call'); K.setBar(!!K.cur); K._inCall=false; K.refreshStatus();
    const s=started?Math.floor((Date.now()-startTs)/1000):0;
    S().calls.push({c:contact?contact.id:'',num:number,type:'out',ts:+K.now(),dur:s?(s>=60?Math.floor(s/60)+'분 ':'')+(s%60)+'초':''}); K.save();
    if(K._afterCall){ const f=K._afterCall; K._afterCall=null; f(); }
  }
};

/* ---------- 걸려오는 전화 ---------- */
K.incomingCall = function(contact){
  if(!contact) return; const el=$('#call'); if(el.classList.contains('show')) return;
  el.innerHTML='';
  const close=()=>{ K.stopRing(); el.classList.remove('show'); el.innerHTML=''; K.setBar(!!K.cur); };
  const decline=()=>{ close(); if(K._afterCall){ const f=K._afterCall; K._afterCall=null; f(); } };
  const rb=(bg,rot,fn)=>h('div',{style:`position:absolute;bottom:70px;width:74px;height:74px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;cursor:pointer;${bg==='#ff3b30'?'left:56px':'right:56px'}`,onclick:fn,html:`<svg viewBox="0 0 24 24" style="width:34px;height:34px;fill:#fff;transform:rotate(${rot}deg)"><path d="${K.PHONE_PATH}"/></svg>`});
  el.append(h('div',{class:'nm'},contact.name), h('div',{class:'st'},'iPhone 수신 중...'),
    rb('#ff3b30',135,decline), rb('#34c759',0,()=>{ close(); K._answered=true; K.startCall(contact.name,contact.phone,contact); }));
  el.classList.add('show'); K.setBar(false); K.stopRing(); K._incoming=true; K.playRing(K.ringtone);
};

/* ---------- 제스처 ---------- */
let g=null;
screen.addEventListener('pointerdown',e=>{
  if(e.target.closest('input,textarea,[contenteditable],.ccsl,.sheet,.dlg,#wpedit,#banner,#mzsd,.pv')) { g=null; return; }
  const p=local(e); g={x:p.x,y:p.y,id:e.pointerId,zone:p.y<46?(p.x<230?'topL':'topR'):p.y>800?'bottom':'body',moved:false,target:e.target};
  clearTimeout(K._lp);
  if(lockedNow() && g.zone==='body' && !e.target.closest('.noti,.qa') && !$('#pass').classList.contains('show') && !$('#wpedit')){
    const mine=g; K._lp=setTimeout(()=>{ if(g===mine && !g.moved){ g.long=true; if(navigator.vibrate) try{navigator.vibrate(15);}catch(_){} const pc=S().ui.passcode; if(pc) K.askCode(pc,'암호 입력',K.wallEdit); else K.wallEdit(); } },550);
  }
});
addEventListener('pointermove',e=>{ if(!g||e.pointerId!==g.id) return; const p=local(e); if(Math.abs(p.y-g.y)>8||Math.abs(p.x-g.x)>8){ g.moved=true; clearTimeout(K._lp); } });
addEventListener('pointerup',e=>{
  if(!g||e.pointerId!==g.id) return; const p=local(e), dy=p.y-g.y, dx=p.x-g.x, t=g.target, z=g.zone; const moved=g.moved, wasLong=g.long; g=null; clearTimeout(K._lp); if(wasLong) return;
  const sheetOpen = nc.classList.contains('show')||cc.classList.contains('show');
  if(sheetOpen){ if(dy<-50 || (z==='bottom'&&!moved)) closeSheets(); return; }
  if($('#pass').classList.contains('show')){ if(z==='bottom'&&dy<-50) $('#pass').classList.remove('show'); return; }
  if(z==='topL'||z==='topR'){
    if(dy>40 || !moved){ if(z==='topR'&&(dy>40||!moved)&&p.x>=230) showCC(); else showNC(); }
    return;
  }
  if(z==='bottom'){
    if(dy<-45 || (!moved&&t.id==='homebar')){ if(K.cur) K.closeApp(); else if(lockedNow()) unlock(); }
    return;
  }
  if(lockedNow()){
    if(dy<-60) { unlock(); return; }
    if(!moved && !t.closest('.noti,.qa')) unlock();
  }
});
$('#statusHit').addEventListener('dblclick',()=>{ if(!lockedNow()) lockPhone(); });
addEventListener('keydown',e=>{ if(e.key==='l'&&e.altKey) lockPhone(); if(e.key==='Escape'){ if(K.cur) K.closeApp(); } });
/* 측면 버튼(데스크톱 프레임) — 누르면 화면 잠금 */
(function(){ const b=h('div',{style:'position:absolute;right:-9px;top:210px;width:16px;height:92px;cursor:pointer;z-index:3',title:'잠금',onclick:()=>lockPhone()}); $('#phone').append(b); })();

K.loadPhotos().then(()=>{});

/* ---------- 브라우저/폰 뒤로가기: 기록을 쌓지 않고 한 단계만 뒤로 ----------
   기록 칸은 딱 1개(가드)만 유지해요. 뒤로가기를 누르면 가드를 다시 세워 두고 화면을 한 단계 돌려요.
   홈 화면에서 누르면 가드를 세우지 않고 그대로 사이트에서 나가요. */
(function(){
  let has=false;
  const guard = () => { try{ history.pushState({kyh:1}, ''); has=true; }catch(e){} };
  try{ history.replaceState({kyh:0}, ''); }catch(e){}
  addEventListener('pointerdown', ()=>{ if(!has) guard(); }, true);   // 크롬은 터치 없이 쌓은 기록을 건너뛰므로 터치할 때도 확인
  function stepBack(){
    const pages=[...K.cur.el.querySelectorAll(':scope > .page:not(.leave)')], top=pages[pages.length-1];
    let b=null;
    if(top){ const chev=top.querySelector('.chev'); b = chev ? chev.closest('button') : [...top.querySelectorAll('button')].find(x=>x.textContent.trim().startsWith('‹')); }
    if(b) b.click(); else K.closeApp();
  }
  /* 화면 왼쪽 가장자리에서 오른쪽으로 밀면 이전 화면 (앱 안에서만) */
  let sw=null;
  screen.addEventListener('pointerdown',e=>{
    if(!K.cur || e.target.closest('input,textarea,[contenteditable],.codeov,#fold-ov')){ sw=null; return; }
    const r=screen.getBoundingClientRect(), x=(e.clientX-r.left)/K.scale, y=(e.clientY-r.top)/K.scale;
    sw = x<=30 ? {id:e.pointerId,x,y} : null;
  },true);
  screen.addEventListener('pointerup',e=>{
    if(!sw||e.pointerId!==sw.id||!K.cur){ sw=null; return; }
    const r=screen.getBoundingClientRect(), dx=(e.clientX-r.left)/K.scale-sw.x, dy=(e.clientY-r.top)/K.scale-sw.y; sw=null;
    if(dx>70 && Math.abs(dy)<Math.abs(dx)*0.6) stepBack();
  },true);
  screen.addEventListener('pointercancel',()=>{ sw=null; },true);
  addEventListener('popstate', ()=>{
    has=false;
    const lk = $('#lock'), callEl = $('#call');
    if(callEl && callEl.classList.contains('show')){ return; }          // 통화 중엔 무시
    if(lk && !lk.classList.contains('hide')){ return; }                  // 잠금 화면에선 무시
    if(nc.classList.contains('show')||cc.classList.contains('show')){ closeSheets(); return; }
    if(K.cur){ stepBack(); return; }
    history.back();                                                              // 홈: 사이트에서 나감
  });
})();
})();

/* ---------- 알림 팝업(배너) ---------- */
K.openKakaoChat = id => { if(K.cur&&K.cur.id==='kakao') K.closeApp(true); K.openApp('kakao',{chat:id}); };
/* 손전등: 제어센터에서 켜면 화면 위쪽에 하얀 빛이 번져요 */
K.flashlight = on => { let t=K.$('#torch'); if(!t){ t=document.createElement('div'); t.id='torch'; K.$('#screen').append(t); } t.classList.toggle('on',!!on); };
K.flashlight(K.state.ui.flash);
/* 효과음 (파일 없이 만든 짧은 소리) */
K.tone = (freqs,dur,vol,delay)=>{ try{ const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; K._ac=K._ac||new AC(); const ac=K._ac; if(ac.state==='suspended') ac.resume(); const t0=ac.currentTime+(delay||0); const g=ac.createGain(); g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol,t0+.01); g.gain.setValueAtTime(vol,t0+dur-.02); g.gain.linearRampToValueAtTime(0,t0+dur); g.connect(ac.destination); freqs.forEach(f=>{ const o=ac.createOscillator(); o.type='sine'; o.frequency.value=f; o.connect(g); o.start(t0); o.stop(t0+dur+.02); }); }catch(e){} };
K.dtmf = k => { const R=[697,770,852,941], C=[1209,1336,1477]; const i='123456789*0#'.indexOf(k); if(i<0) return; K.tone([R[Math.floor(i/3)],C[i%3]],.13,.05); };   // 키패드 터치음
K.notifyA = new Audio('music/notify.mp3'); K.notifyA.preload='auto'; K.notifyA.volume=.5;   // 알림음 볼륨(0~1)
K.applyVolume = () => { try{ K.notifyA.volume=Math.max(0,Math.min(1,K.state.ui.volume)); }catch(e){} };   // 시스템 음량 → 일반 알림음 (전화 벨소리·통화음은 따로 둠)
K.applyVolume();
K.quiet = () => { const u=K.state.ui; return !!(u.silent||u.doNotDisturb); };   // 무음 모드 또는 방해 금지면 일반 알림음을 내지 않아요
K.msgSound = () => { if(K.quiet()) return; try{ K.applyVolume(); const a=K.notifyA; a._real=true; a.currentTime=0; const p=a.play(); if(p&&p.catch) p.catch(()=>{}); }catch(e){} };   // 카톡 알림음 (music/notify.mp3)
/* 시스템 값 하나를 바꾸면 상태 표시줄·잠금 화면·제어 센터·설정 앱이 모두 같이 바뀌어요 */
K._sysL = [];
K.sysSet = (key,val) => { const u=K.state.ui; if(key==='lockWidgets'){ u.lockWidgets=Object.assign({},u.lockWidgets,val); } else u[key]=val;
  K.save(); K.applyVolume(); K.dim(u.brightness); K.refreshStatus(); K.refreshLock();
  if(K.$('#cc').classList.contains('show')&&K.renderCC) K.renderCC(); if(K.$('#nc').classList.contains('show')&&K.renderNC) K.renderNC();
  K._sysL=K._sysL.filter(f=>{ try{ return f(key)!==false; }catch(e){ return false; } });
  if(key==='batteryLevel') K.lowBatteryCheck(); };
K.sysToggle = key => K.sysSet(key,!K.state.ui[key]);
K.lowBatteryCheck = (force) => { const u=K.state.ui; if(u.batteryLevel>20){ K._lpAsked=false; return; } if(u.lowPower||(K._lpAsked&&!force)) return; K._lpAsked=true;
  K.alert('배터리 '+u.batteryLevel+'% 남음','저전력 모드를 켜면 배터리를 더 오래 쓸 수 있어요.',[{t:'닫기'},{t:'저전력 모드',fn:()=>K.sysSet('lowPower',true)}]); };
/* 소리 잠금 해제 (iPhone Safari 등): 화면을 터치(touchend/click)했을 때 소리 파일을 한 번씩 무음으로 재생해 두면, 이후 타이머로 재생해도 소리가 나요.
   pointerdown은 사용자 동작으로 인정되지 않아서 touchend/click/keydown에서 시도하고, 성공할 때까지 계속 시도해요. */
K._unl = new Set();
K.unlockAudio = () => { [K.ringback,K.ringtone,K.sjCallA,K.notifyA].forEach(a=>{ if(!a||K._unl.has(a)||a._real) return;
  try{ const vol=a.volume; a.muted=true; const p=a.play(); const fin=()=>{ K._unl.add(a); if(!a._real){ a.pause(); a.currentTime=0; a.muted=false; a.volume=vol; } };
    if(p&&p.then) p.then(fin).catch(()=>{ if(!a._real) a.muted=false; }); else fin(); }catch(e){ if(!a._real) a.muted=false; } }); };
['touchend','click','keydown','pointerup'].forEach(ev=>addEventListener(ev,K.unlockAudio,true));
K.banner = function(o){
  if(K.state.ui.doNotDisturb){   /* 방해 금지: 배너·소리만 막고, 알림 데이터는 알림 센터에 남겨둬요 (카톡은 읽지 않은 메시지로 이미 남아 있어요) */
    if((o.app||'kakao')!=='kakao'){ const ms=K.state.missed=K.state.missed||[]; ms.push({app:o.app,title:o.title,body:o.text,ts:Date.now()}); K.save(); if(nc.classList.contains('show')) renderNC(); K.refreshLock&&K.refreshLock(); }
    return; }
  if((o.app||'kakao')==='kakao') K.msgSound();
  const {h,$}=K; const scr=$('#screen'); const old=$('#banner'); if(old) old.remove();
  const b=h('div',{id:'banner',onclick:()=>{ b.remove(); o.onTap&&o.onTap(); }},
    h('div',{class:'bic'},K.icon(o.app||'kakao')),
    h('div',{class:'btx'},h('b',{},K.previewText(o.app||'kakao',o.title,o.text).title),h('span',{},K.previewText(o.app||'kakao',o.title,o.text).body)),
    h('small',{},'지금'));
  scr.append(b);
  requestAnimationFrame(()=>requestAnimationFrame(()=>b.classList.add('show')));
  setTimeout(()=>{ b.classList.remove('show'); setTimeout(()=>b.remove(),400); },4500);
};

(()=>{ const base=K.notis;
  K.notis=()=>{ const ms=(K.state.missed||[]).map((m,i)=>({app:m.app,title:m.title,body:m.body,mins:Math.max(0,Math.floor((Date.now()-m.ts)/60000)),open:m.app,id:'ms'+m.ts+'_'+i})).filter(n=>!K.state.notiDismissed.includes(n.id)).reverse();
    return ms.concat(base()); };
})();
setTimeout(()=>{ try{ K.lowBatteryCheck(); }catch(e){} },1800);   // 잔량이 20% 이하로 저장돼 있으면 저전력 모드를 제안
