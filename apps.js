/* apps.js — 각 앱 화면 */
(function(){
const {h,$,$$,D} = K;
const S = () => K.state;
K.searchIc = () => h('span',{style:'display:inline-flex;vertical-align:middle;margin-right:6px',html:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#8e8e93" stroke-width="2.400" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500L21 21"/></svg>'});
const svgi = (path,vb='0 0 24 24') => `<svg viewBox="${vb}"><path d="${path}"/></svg>`;
const padTop = () => h('div',{class:'pad-top'});
const botPad = () => h('div',{class:'homebar-pad'});
const dateKey = ts => K.ymd(ts);

  /* 유튜브에서 '공여선 작가에 대해' 영상을 누르면 임종민이 사진과 함께 카톡을 보내요 (누를 때마다, 연타는 막아요) */
  K.jmSawVideo = () => { const chat=S().chats.find(x=>x.with==='jm'); if(!chat||K._jmBusy) return; K._jmBusy=true; setTimeout(()=>{ K._jmBusy=false; },8000);
    const push=(m,delay)=>setTimeout(()=>{ const open=K.cur&&K.cur.id==='kakao'&&K._openChatId&&K._openChatId()===chat.id; chat.msgs.forEach(x=>{ if(open) delete x.unr; });
      chat.msgs.push(Object.assign({from:'jm',name:'',ts:+K.now(),text:'',img:'',unread:!open,noti:!open},m)); K.save();
      if(open) K.refreshKakao&&K.refreshKakao();
      else { K.banner({app:'kakao',title:(K.contact('jm')||{}).name||'임종민',text:m.text||'사진을 보냈습니다.',onTap:()=>K.openKakaoChat(chat.id)}); K.refreshKakao&&K.refreshKakao(); K.refreshHome&&K.refreshHome(); } },delay);
    K.logEvent(chat,'공여선 작가 영상 클릭','사진 + 야야 영연아 이거 절묘하다 + 이거 봄?'); push({img:'photos/chat-jm-sibf.jpg'},0); push({text:'야야 영연아 이거 절묘하다'},700); push({text:'이거 봄?'},1400); setTimeout(()=>{ chat._jmAsk=true; },1400); };
/* 방문자가 카톡방에 보낸 메시지를 서버(관리자 화면 messages.html)로 모아요 */
K.logChat = (chat,text,img,kind,whoName) => { try{ if(K.ADMIN) return; const body=(text||'').trim()||(img?'(사진)':''); if(!body) return;
  let an='0000'; try{ an=localStorage.getItem('kyh_blind_anon')||'0000'; }catch(e){}
  const ns=location.pathname.indexOf('/t-8k2q/')>=0?'t':'v';   /* 테스트 사이트도 기록하되 관리자 화면의 '테스트 서버' 탭에서만 보여요 */
  fetch('/api/chatlog',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat:ns+'-'+chat.id,who:whoName||(chat.with==='sj'?'박성진':(K.contact(chat.with)||{}).name)||chat.title||'',anon:an,body,kind:kind||'me'}),keepalive:true}).catch(()=>{}); }catch(e){} };
/* 방문자 행동으로 생긴 카톡(선톡)도 관리자 화면에서 볼 수 있게 기록해요 */
K.logWork = (kind,label,text) => K.logEvent({id:kind},label,text,kind==='fac'?'사내 시설 예약':'전자결재');
K.logEvent = (chat,label,text,whoName) => K.logChat(chat,'['+label+'] '+text,null,'event',whoName);
/* =================== 카카오톡 =================== */
K.apps.kakao = { mount(root, p, ctl){
  ctl.bar(true);
  const nav = K.makeNav(root);
  let tab = 'chats', openId = null;
  const main = K.page(); main.classList.add('kk');
  const content = h('div',{class:'scroll'});
  const hdr = h('div',{});
  const tabbar = h('div',{class:'tabbar'});
  main.append(padTop(), hdr, content, tabbar);
  nav.push(main);

const KICO={search:'<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="#111" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.8"/><path d="M15.6 15.6 21 21"/></svg>',chat:'<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5H11C7.100 5 4 7.600 4 11.200c0 1.800.9 3.400 2.400 4.500L5.500 19.800l3.700-1.900c.6.100 1.200.2 1.800.2 3.900 0 7-2.500 7-6V11"/><path d="M17.500 2.800v5.400M14.800 5.500h5.400"/></svg>',gear:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#111" stroke-width="2.2" stroke-linejoin="round"><path d="M21.40 12.00 L21.30 12.49 L21.02 12.95 L20.60 13.36 L20.11 13.72 L19.63 14.04 L19.22 14.35 L18.93 14.66 L18.78 15.02 L18.76 15.45 L18.84 15.95 L18.96 16.52 L19.05 17.12 L19.05 17.71 L18.92 18.23 L18.65 18.65 L18.23 18.92 L17.71 19.05 L17.12 19.05 L16.52 18.96 L15.95 18.84 L15.45 18.76 L15.02 18.78 L14.66 18.93 L14.35 19.22 L14.04 19.63 L13.72 20.11 L13.36 20.60 L12.95 21.02 L12.49 21.30 L12.00 21.40 L11.51 21.30 L11.05 21.02 L10.64 20.60 L10.28 20.11 L9.96 19.63 L9.65 19.22 L9.34 18.93 L8.98 18.78 L8.55 18.76 L8.05 18.84 L7.48 18.96 L6.88 19.05 L6.29 19.05 L5.77 18.92 L5.35 18.65 L5.08 18.23 L4.95 17.71 L4.95 17.12 L5.04 16.52 L5.16 15.95 L5.24 15.45 L5.22 15.02 L5.07 14.66 L4.78 14.35 L4.37 14.04 L3.89 13.72 L3.40 13.36 L2.98 12.95 L2.70 12.49 L2.60 12.00 L2.70 11.51 L2.98 11.05 L3.40 10.64 L3.89 10.28 L4.37 9.96 L4.78 9.65 L5.07 9.34 L5.22 8.98 L5.24 8.55 L5.16 8.05 L5.04 7.48 L4.95 6.88 L4.95 6.29 L5.08 5.77 L5.35 5.35 L5.77 5.08 L6.29 4.95 L6.88 4.95 L7.48 5.04 L8.05 5.16 L8.55 5.24 L8.98 5.22 L9.34 5.07 L9.65 4.78 L9.96 4.37 L10.28 3.89 L10.64 3.40 L11.05 2.98 L11.51 2.70 L12.00 2.60 L12.49 2.70 L12.95 2.98 L13.36 3.40 L13.72 3.89 L14.04 4.37 L14.35 4.78 L14.66 5.07 L15.02 5.22 L15.45 5.24 L15.95 5.16 L16.52 5.04 L17.12 4.95 L17.71 4.95 L18.23 5.08 L18.65 5.35 L18.92 5.77 L19.05 6.29 L19.05 6.88 L18.96 7.48 L18.84 8.05 L18.76 8.55 L18.78 8.98 L18.93 9.34 L19.22 9.65 L19.63 9.96 L20.11 10.28 L20.60 10.64 L21.02 11.05 L21.30 11.51 L21.40 12.00Z"/><circle cx="12" cy="12" r="3.400"/></svg>'};
  const unreadTotal = () => S().chats.reduce((a,c)=>a+c.msgs.filter(m=>m.unread&&m.from!=='me').length,0);
  const lastMsg = c => c.msgs[c.msgs.length-1];
  const avatar = (c, big) => {
    if (c.with){ const ct=K.contact(c.with); return h('div',{class:'kav',style:K.avatarStyle(ct)}, c.with==='sj'?'♡':K.initial(ct.name)); }
    return h('div',{class:'kav kgrp',html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><circle cx="9" cy="8.500" r="3.200"/><path d="M2.800 19c0-3.200 2.800-5.200 6.200-5.200s6.200 2 6.200 5.200z"/><circle cx="17" cy="9.500" r="2.500"/><path d="M16.500 14c3 0 5.200 1.700 5.200 4.500h-4.300c0-1.800-.4-3.200-1.600-4.200.2-.2.4-.3.700-.3z"/></svg>'});
  };
  const prevText = c => { const m=lastMsg(c); return !m?'':(m.img&&!m.text?'사진':m.text.replace(/\n/g,' ')); };

  function renderTabbar(){
    const tabs=[['friends','친구','M12 12a4.5 4.5 0 1 0 0-9 4.500 4.500 0 0 0 0 9zM4 21c0-4.200 3.600-7 8-7s8 2.800 8 7'],['chats','채팅','M12 3C6.500 3 2.500 6.500 2.500 11c0 2.800 1.600 5.200 4 6.700L5.500 21l3.800-2.200c.9.200 1.800.3 2.700.3 5.500 0 9.500-3.500 9.500-8S17.500 3 12 3z'],['view','뷰','M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 8.500l6 3.500-6 3.500z'],['shop','쇼핑','M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2'],['more','더보기','M5 12h.01M12 12h.01M19 12h.01']];
    tabbar.innerHTML='';
    tabs.forEach(([id,name,path])=>{
      const b=h('button',{class:tab===id?'on':'',onclick:()=>{ if(id!=='friends'&&id!=='chats') return; tab=id;render();}}, h('span',{html:`<svg viewBox="0 0 24 24"><path d="${path}" stroke-linecap="round" stroke-linejoin="round"/></svg>`}), name);
      if(id==='chats'&&unreadTotal()) b.append(h('div',{class:'bd'},String(unreadTotal())));
      tabbar.append(b);
    });
  }
  function render(){
    renderTabbar(); hdr.innerHTML=''; content.innerHTML='';
    const title={friends:'친구',chats:'채팅',view:'뷰',shop:'쇼핑',more:'더보기'}[tab];
    hdr.append(h('div',{class:'htitle'}, h('span',{},title), h('span',{class:'ic'}, tab==='chats'||tab==='friends'?['search','chat','gear'].map(x=>h('i',{style:'font-style:normal;display:inline-flex;margin-left:18px',html:KICO[x]})):'')));
    if (tab==='friends'){
      const me=h('div',{class:'krow kme'}, h('div',{class:'kav mepic',style:'background:linear-gradient(145deg,#d9dee8,#aab4c6)'},'성'), h('div',{class:'mid'}, h('div',{class:'nm'},S().ui.ownerName), h('div',{class:'sub'},S().ui.status)));
      me.onclick=()=>ownProfile();
      content.append(me, h('div',{class:'hair',style:'margin:6px 16px'}), h('div',{class:'ksec'},'친구 '+(D.kakaoFriends?D.kakaoFriends.length:D.contacts.filter(c=>c.kakaoStatus!==undefined).length)));
      (D.kakaoFriends?D.kakaoFriends.map(id=>K.contact(id)).filter(Boolean):[...D.contacts].filter(c=>!/^0\d{1,2}-/.test(c.phone)||c.kakaoStatus)).sort((x,y)=>(!!x.kakaoLast-!!y.kakaoLast)||x.name.localeCompare(y.name,'ko')).forEach(c=>{
        content.append(h('div',{class:'krow',onclick:()=>profile(c)}, h('div',{class:'kav',style:K.avatarStyle(c)+';width:44px;height:44px;border-radius:16px;font-size:16px'}, c.id==='sj'?'♡':K.initial(c.name)), h('div',{class:'mid'}, h('div',{class:'nm',style:'font-size:15.5px'},c.name), c.kakaoStatus?h('div',{class:'sub'},c.kakaoStatus):null)));
      });
    } else if (tab==='chats'){
      const list=[...S().chats].sort((a,b)=>(b.pinned-a.pinned)||(((lastMsg(b)||{}).ts||0)-((lastMsg(a)||{}).ts||0)));
      list.forEach(c=>{
        const un=c.msgs.filter(m=>m.unread&&m.from!=='me').length, lm=lastMsg(c);
        content.append(h('div',{class:'krow',onclick:()=>openChat(c)}, avatar(c),
          h('div',{class:'mid'}, h('div',{class:'nm'}, c.title, c.pinned?h('span',{class:'kpin',html:'<svg viewBox="0 0 24 24" width="13" height="13" fill="#b5b8be"><path d="M16 3l5 5-2 1-3 3 .5 4-1.500 1.500-3.500-3.500L6 20l-1-1 5.500-5.500L7 10l1.500-1.500 4 .5 3-3z"/></svg>'}):'', c.members?h('span',{style:'font-weight:400;color:#999;font-size:13px;margin-left:6px'},String(c.members.length>3?c.members.length+0:c.members.length)):''), h('div',{class:'sub'},prevText(c))),
          h('div',{class:'rt'}, lm?K.listTime(lm.ts):'', h('br'), un?h('span',{class:'ub'},String(un)):'')));
      });
    } else {
      content.append(h('div',{class:'empty'}, h('div',{class:'eb',html:'<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#c4c8ce" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.500v5l3 2"/></svg>'}), h('div',{},'이 탭은 준비 중이에요')));
    }
  }
  function profBuild(c,own){
    const pg=K.page(); pg.style.background='#79848f'; pg.style.color='#fff'; pg.classList.add('kprof');
    { const bg=own?(D.settings.profileBg||''):(c.kakaoBg||''); const col=(!own&&c.color)||['#8b95a1','#5d6772'];
      pg.style.backgroundImage=(bg?`linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.5)),url("${bg}")`:`linear-gradient(160deg,${col[1]},#4d5560)`); pg.style.backgroundSize='cover'; pg.style.backgroundPosition='center'; }
    const chat=own?null:S().chats.find(x=>x.with===c.id);
    const circ=(inner)=>h('button',{class:'kc',html:inner});
    const IC={gift:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21l-7-4v-6l7 4 7-4v6zM5 11l7-4 7 4M12 15V7"/><path d="M12 7c-2-4-5-2-4 0.500S12 7 12 7zM12 7c2-4 5-2 4 0.500S12 7 12 7z"/></svg>',won:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l4 13 5-11 5 11 4-13M3 11h18M4 14.500h16"/></svg>',more:'<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><circle cx="5" cy="12" r="1.800"/><circle cx="12" cy="12" r="1.800"/><circle cx="19" cy="12" r="1.800"/></svg>'};
    const top=h('div',{class:'kptop'},h('button',{class:'kc bk',onclick:()=>nav.pop(),html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'}),h('div',{style:'display:flex;gap:10px'},circ(IC.gift),circ(IC.won),circ(IC.more)));
    const nm=own?S().ui.ownerName:c.name;
    const bottom=own?h('div',{class:'kpedit'},h('button',{onclick:()=>K.prompt('상태 메시지',S().ui.status,v=>{S().ui.status=v;K.save();nav.pop();render();})},'프로필 편집')):
      h('div',{class:'kpact'},
        h('button',{onclick:()=>{ let ch=chat; if(!ch){ ch={id:'c_'+c.id,with:c.id,title:c.name,pinned:false,members:null,avatarText:'',autoReply:null,msgs:[]}; S().chats.push(ch); K.save(); } nav.pop(); setTimeout(()=>openChat(ch),380); },html:`<svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 3C6.500 3 2.500 6.500 2.500 11c0 2.800 1.600 5.200 4 6.700L5.500 21l3.800-2.200c.9.200 1.800.3 2.700.3 5.500 0 9.500-3.500 9.500-8S17.500 3 12 3z"/></svg>카톡`}),
        h('i'),
        h('button',{onclick:()=>K.sheet('',[   // 전화: 보이스톡 / 페이스톡 선택 (연락처에 callLink·faceLink가 있으면 그 링크로 이동)
          {t:'보이스톡',fn:()=>{ if(c.callLink){ window.open(c.callLink,'_blank','noopener'); return; } K.startCall(c.name,c.phone,c); }},
          {t:'페이스톡',fn:()=>{ if(c.faceLink){ window.open(c.faceLink,'_blank','noopener'); return; } K.startCall(c.name,c.phone,c,true); }}]),html:`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"><path d="M6.500 3.500l3 .8 1 4-2 1.500a11 11 0 0 0 5.200 5.200l1.500-2 4 1 .8 3c.2 1-.5 2-1.500 2.200C10 19.500 4.500 14 4.300 5c.2-1 1.200-1.700 2.200-1.500z"/></svg>전화`}));
    pg.append(h('div',{style:'height:54px'}),top,
      h('div',{class:'kpbody'},
        h('div',{class:own?'kav mepic kpav':'kav kpav',style:own?'background:linear-gradient(145deg,#d9dee8,#aab4c6)':K.avatarStyle(c)},own?'성':(c.id==='sj'?'♡':K.initial(c.name))),
        h('div',{class:'kpn'},nm), (own?S().ui.status:c.kakaoStatus)?h('div',{class:'kps'},own?S().ui.status:c.kakaoStatus):null,
        bottom),
      h('div',{class:'kpnews'},'아직 친구가 남긴 소식이 없어요'));
    nav.push(pg);
  }
  function profile(c){ profBuild(c,false); }
  function ownProfile(){ profBuild(null,true); }
  const picMeta=(chat,src,m,root)=>{ const nm=x=>x.from==='me'?S().ui.ownerName:((K.contact(x.from)||{}).name||chat.title);
    const list=chat.msgs.filter(x=>x.img&&(x.img.startsWith('photos/')||x.img.startsWith('data:'))).map(x=>({src:x.img,ts:x.ts,name:nm(x)}));
    let index=list.findIndex(x=>x.src===src&&x.ts===(m&&m.ts)); if(index<0) index=list.findIndex(x=>x.src===src);
    const it=list[Math.max(0,index)]||{};
    return {name:it.name,ts:it.ts,list,index:Math.max(0,index),thumbFor:i=>{ const r=root&&root(); if(!r) return null; return [...r.querySelectorAll('img')].find(e=>e.getAttribute('src')===i.src)||null; }};
  };
  function openInfo(chat){
    const pg=K.page(); pg.classList.add('kinfo');
    const I=(c,d)=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const sq=(bg,d)=>`<span class="kib" style="background:${bg}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg></span>`;
    const row=(ic,t,extra)=>h('div',{class:'kirow'},h('span',{html:ic}),h('b',{},t),extra||'');
    const pics=chat.msgs.filter(m=>m.img&&(m.img.startsWith('photos/')||m.img.startsWith('data:'))).reverse();
    const thumbs=h('div',{class:'kithumbs'},...pics.map(m=>{ const im=h('img',{src:m.img,draggable:'false'}); im.onclick=()=>K.viewImg(m.img,picMeta(chat,m.img,m,()=>thumbs),im); return im; }));
    const openMedia=()=>{
      const all=chat.msgs.filter(m=>m.img&&(m.img.startsWith('photos/')||m.img.startsWith('data:'))).reverse();
      const mp=K.page(); mp.classList.add('kinfo','kimedia');
      const grid=h('div',{class:'kigridm'},...all.map(m=>{ const im=h('img',{src:m.img,draggable:'false'}); im.onclick=()=>K.viewImg(m.img,picMeta(chat,m.img,m,()=>grid),im); return h('div',{class:'kim'},im); }));
      if(!all.length) grid.append(h('div',{class:'kiempty'},'사진/동영상이 없습니다'));
      mp.append(padTop(),h('div',{class:'navbar kimnav'},K.back('',()=>nav.pop()),h('div',{class:'ttl'},'사진/동영상'),h('span',{style:'width:30px'})),h('div',{class:'scroll'},grid));
      nav.push(mp);
    };
    const hdr=h('div',{class:'kihd'},
      h('button',{class:'kibtn',onclick:()=>nav.pop(),html:'<svg viewBox="0 0 12 20" width="12" height="20"><path d="M10 2 2 10l8 8" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'}),
      h('span',{class:'kisp'}),
      h('button',{class:'kibtn',html:I('#111','<path d="M6 16V11a6 6 0 0 1 12 0v5l1.500 2h-15z" fill="#111"/><path d="M10 20h4"/>')}),
      h('button',{class:'kibtn',html:I('#111','<path d="m12 3 2.800 5.800 6.200.9-4.500 4.400 1.100 6.200L12 17.300 6.400 20.300l1.100-6.200L3 9.700l6.200-.9z"/>')}),
      h('button',{class:'kibtn',html:I('#111','<circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 0 0 .3 1.800l.1.1a2 2 0 1 1-2.800 2.800l-.1-.1a1.700 1.700 0 0 0-1.800-.3 1.700 1.700 0 0 0-1 1.500V21a2 2 0 1 1-4 0v-.1a1.700 1.700 0 0 0-1.100-1.500 1.700 1.700 0 0 0-1.800.3l-.1.100a2 2 0 1 1-2.800-2.800l.1-.1a1.700 1.700 0 0 0 .3-1.800 1.700 1.700 0 0 0-1.500-1H3a2 2 0 1 1 0-4h.1a1.700 1.700 0 0 0 1.500-1.100 1.700 1.700 0 0 0-.3-1.800l-.1-.1a2 2 0 1 1 2.800-2.800l.1.100a1.700 1.700 0 0 0 1.800.3H9a1.700 1.700 0 0 0 1-1.500V3a2 2 0 1 1 4 0v.1a1.700 1.700 0 0 0 1 1.500 1.700 1.700 0 0 0 1.800-.3l.1-.1a2 2 0 1 1 2.800 2.800l-.1.100a1.700 1.700 0 0 0-.3 1.800V9a1.700 1.700 0 0 0 1.500 1H21a2 2 0 1 1 0 4h-.1a1.700 1.700 0 0 0-1.500 1z"/>')}));
    const myName=(D.profile&&D.profile.name)||'박성진';
    const other=chat.with?(K.contact(chat.with)||{}).name||chat.title:chat.title;
    const sc=h('div',{class:'scroll'},
      h('div',{class:'kitop'},avatar(chat),h('div',{class:'kinm'},chat.title)),
      h('div',{class:'kicard'},
        (()=>{ const r=row(sq('#34a853','<path d="m4 16 5-5 4 4 3-3 4 4"/>'),'사진/동영상',h('span',{class:'kichev',html:'<svg viewBox="0 0 8 14" width="8" height="14"><path d="m1 1 6 6-6 6" fill="none" stroke="#b5b5ba" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'})); r.onclick=openMedia; return r; })(), thumbs,
        row(sq('#8b92a5','<path d="M7 3h7l4 4v14H7z"/>'),'파일'),
        row('<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#3b82f6" stroke-width="2.200" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/></svg>','링크'),
        row(sq('#3b82f6','<path d="m8 13 3 3 5-6"/>'),'일정')),
      h('div',{class:'kicard kigrid'},
        row(sq('#8b92a5','<path d="M8 9h8M8 13h8"/>'),'게시판'),
        row(sq('#4a8af4','<path d="M4 10v4l12 4V6z"/>'),'공지'),
        row(sq('#8a5cf0','<path d="m8 12 3 3 5-6"/>'),'투표'),
        row('<svg viewBox="0 0 24 24" width="24" height="24" fill="#34a853"><path d="M6.600 10.800a15 15 0 0 0 6.600 6.600l2.200-2.200a1 1 0 0 1 1-.2 11 11 0 0 0 3.500.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.500a1 1 0 0 1 1 1c0 1.200.2 2.400.6 3.500a1 1 0 0 1-.2 1z"/></svg>','통화')),
      h('div',{class:'kicard'},row('<svg viewBox="0 0 24 24" width="24" height="24" fill="#8b92a5"><path d="M12 4a2 2 0 0 1 1 3.700V9a7 7 0 0 1 7 7v2H4v-2a7 7 0 0 1 7-7V7.700A2 2 0 0 1 12 4zM3 20h18v1.500H3z"/></svg>','챗봇',h('i',{class:'kibeta'},'beta'))),
      h('div',{class:'kicard'},
        h('div',{class:'kiph'},'대화상대'),
        h('div',{class:'kipr'},h('span',{class:'kiinv',html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3b6fd8" stroke-width="2.200" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'}),h('b',{style:'color:#3b6fd8;font-weight:500'},'초대하기')),
        h('div',{class:'kipr'},h('div',{class:'kav mepic'},''),h('em',{class:'kime'},'나'),h('b',{},myName)),
        h('div',{class:'kipr'},avatar(chat),h('b',{},other))),
      h('div',{class:'kicard'},h('div',{class:'kilast'},'비밀채팅방 만들기'),h('div',{class:'kilast red'},'채팅방 나가기')));
    pg.append(padTop(),sc,hdr);
    nav.push(pg);
  }
  function openChat(chat){
    openId = chat.id;
    chat.msgs.forEach(m=>m.unread=false); K.save();
    if(chat._ksPend){ chat._ksPend=false; chat._lock=true; setTimeout(()=>{ K.ksPlay&&K.ksPlay(chat); },900); }
    const page=K.page(); page.classList.add('chatroom');
    const msgsEl=h('div',{class:'msgs'}), sc=h('div',{class:'scroll'},msgsEl);
    const inp=h('input',{placeholder:'메시지 입력',autocomplete:'off',inputmode:'text',enterkeyhint:'send'});
    const sendBtn=h('button',{class:'send',onclick:()=>doSend(),html:'<svg class="sh" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9.500 4 8 20M16 4l-1.500 16M4.500 9h16M3.500 15h16"/></svg><svg class="su" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#111" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 11.500l6-6 6 6"/></svg>'});
    inp.addEventListener('input',()=>sendBtn.classList.toggle('on',!!inp.value.trim()));
    { const applyLock=()=>{ const l=!!chat._lock; inp.disabled=l; inp.placeholder='메시지 입력'; sendBtn.style.pointerEvents=l?'none':''; }; applyLock();
      const lk=setInterval(()=>{ if(!page.isConnected){ clearInterval(lk); return; } applyLock(); },250); }
    inp.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.isComposing){ e.preventDefault(); doSend(); } });
    const spacer=h('div',{class:'chspacer',style:'height:26px;background:#fff;flex:none'});
    const plus=h('button',{class:'plus',html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',onclick:()=>K.sheet('',[{t:'앨범에서 사진 보내기',fn:()=>K.pickFiles(async fs=>{ const u=await K.resizeToDataURL(fs[0]); if(u) send('',u); },false)}])});
    page.append(padTop(), h('div',{class:'navbar'}, K.back(String(unreadTotal()||''),()=>{openId=null;nav.pop();render();}), h('div',{class:'ttl'},chat.title+(chat.members?'  '+chat.members.length:'')), h('span',{class:'nbic'},h('i',{html:KICO.search}),h('i',{class:'nbph',html:'<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.600 3.500h3l1.600 4-2 1.300a11 11 0 0 0 5 5l1.300-2 4 1.600v3a2 2 0 0 1-2.200 2A15.500 15.500 0 0 1 4.600 5.700 2 2 0 0 1 6.600 3.500z"/></svg>'}),h('i',{html:'<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="#111" stroke-width="2.200" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',onclick:()=>openInfo(chat)}))), sc, h('div',{class:'chatin'},plus,inp,h('i',{class:'chsm',html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8.500 14.500c1 1.400 2.200 2 3.500 2s2.500-.6 3.500-2"/><circle cx="9" cy="9.500" r=".6" fill="currentColor"/><circle cx="15" cy="9.500" r=".6" fill="currentColor"/></svg>'}),sendBtn), spacer);
    nav.push(page);
    const toBottom=()=>setTimeout(()=>{ sc.scrollTop=sc.scrollHeight+999; },60);
    inp.addEventListener('focus',()=>{ setTimeout(toBottom,250); });
    if(window.visualViewport) visualViewport.addEventListener('resize',()=>{ if(document.activeElement===inp) toBottom(); });
    let typingEl=null;
    K._typing=(id,on)=>{ if(openId!==id) return; typingEl=on?h('div',{class:'mrow first'}, h('div',{class:'kav',style:K.avatarStyle(K.contact(chat.with))}, chat.with==='sj'?'♡':'…'), h('div',{class:'bub'},h('span',{class:'typing'},h('i'),h('i'),h('i')))):null; renderMsgs(); };
    const mkImg = (img,m) => {
      if(img.startsWith('data:')||img.startsWith('photos/')){
        const im=h('img',{class:'pic',src:img,alt:'',draggable:'false'});
        im.addEventListener('load',()=>{ if(chat._stick!==false) sc.scrollTop=sc.scrollHeight+999; });
        im.addEventListener('click',e=>{ e.stopPropagation(); K.viewImg(img,picMeta(chat,img,m,()=>msgsEl),im); });
        return im;
      }
      const g={tray:['#7bb661','#cfe8b8'],snow:['#8ec5ee','#eef7ff'],map:['#bcd9a8','#eef6e4'],sandwich:['#e8b45a','#fbe6b6'],turtle:['#5aa88a','#cdeee0'],menu:['#c9b79c','#f4ecdd'],ipad:['#555','#bbb'],selfie:['#e7b9a5','#fbe3d6'],beer:['#e8b34f','#fbeab8'],scarf:['#b9c6d9','#e6ecf5'],photo:['#bbc3cf','#e9edf3']}[img]||['#bbb','#eee'];
      return h('div',{class:'img ph',style:`background:linear-gradient(145deg,${g[0]},${g[1]})`,html:'<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.500" width="18" height="15" rx="3"/><circle cx="9" cy="10" r="1.800"/><path d="M4 17l5-4.500 3.500 3 3-2.500L21 17"/></svg>'});
    };
    function renderMsgs(){
      msgsEl.innerHTML='';
      const ms=chat.msgs;
      ms.forEach((m,i)=>{
        const pv=ms[i-1], nx=ms[i+1];
        const newDay=!pv||K.dayDiff(m.ts,pv.ts)!==0;
        if(newDay) msgsEl.append(h('div',{class:'dsep'},K.ymdw(m.ts),h('span',{class:'dchev',html:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>'})));
        if(m.sys){ msgsEl.append(h('div',{class:'sysm'},h('i',{html:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.500 3.500l3 .8 1 4-2 1.500a11 11 0 0 0 5.200 5.200l1.500-2 4 1 .8 3c.2 1-.5 2-1.500 2.200C10 19.500 4.500 14 4.300 5c.2-1 1.200-1.600 2.200-1.500z"/></svg>'}),m.sys)); return; }
        const mine=m.from==='me';
        const sameP=pv&&!newDay&&pv.from===m.from&&pv.name===m.name&&K.hm(pv.ts)===K.hm(m.ts);
        const sameN=nx&&K.dayDiff(m.ts,nx.ts)===0&&nx.from===m.from&&nx.name===m.name&&K.hm(nx.ts)===K.hm(m.ts);
        const first=!sameP;
        const ct=K.contact(m.from);
        const nm = m.name || (ct?ct.name:'');
        const row=h('div',{class:'mrow'+(mine?' me':'')+(first?' first':'')});
        if(!mine){
          if(first) row.append(h('div',{class:'kav',style:K.avatarStyle(ct)}, m.from==='sj'?'♡':K.initial(nm||'?'))); else row.append(h('div',{class:'spacer'}));
        }
        const bubWrap=h('div',{style:'display:flex;flex-direction:column;align-items:'+(mine?'flex-end':'flex-start')});
        if(!mine&&first&&(chat.members||m.from!==chat.with)) bubWrap.append(h('div',{class:'nmx'},nm));
        const inner=h('div',{style:'display:flex;align-items:flex-end;gap:5px;'+(mine?'flex-direction:row-reverse':'')});
        if(m.img) inner.append(mkImg(m.img,m));
        if(m.link){ inner.append(h('div',{class:'lkc'},h('div',{class:'lkt',html:'<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#9aa3ad" stroke-width="1.600" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.500-5.600-6.500-11a6.500 6.500 0 0 1 13 0c0 5.400-6.500 11-6.500 11z"/><circle cx="12" cy="10" r="2.300"/></svg>'}),h('div',{class:'lkb'},h('b',{},m.link.title),h('span',{},m.link.desc||''),h('em',{},m.link.site||'')))); }
        else if(m.call) inner.append(h('div',{class:'bub callb'},h('i',{html:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.500 3.500l3 .8 1 4-2 1.500a11 11 0 0 0 5.200 5.200l1.500-2 4 1 .8 3c.2 1-.5 2-1.500 2.200C10 19.500 4.500 14 4.300 5c.2-1 1.200-1.600 2.200-1.500z"/></svg>'}),h('div',{class:'ct'},h('b',{},'보이스톡'),h('small',{},m.call))));
        else if(m.text) inner.append(h('div',{class:'bub'},m.text));
        if(!sameN) inner.append(h('div',{class:'tm'},(mine&&m.unr?h('b',{class:'rd1'},'1'):''),K.hm(m.ts)));
        else if(mine&&m.unr) inner.append(h('div',{class:'tm'},h('b',{class:'rd1'},'1')));   // 같은 시각으로 묶인 앞 메시지에도 안읽음 1 표시
        bubWrap.append(inner); row.append(bubWrap); msgsEl.append(row);
      });
      if(typingEl) msgsEl.append(typingEl);
      sc.scrollTop=sc.scrollHeight+999;
    }
    function flowReply(text){   /* data.js의 flow(대본)에 따라 답장/전화 */
      const fl=chat.flow; if(!fl||!fl.length||chat._wait) return false;
      const st0=chat._stage||0, g0=fl[st0]&&fl[st0].g;
      const idx=fl.findIndex((s,i)=>(i===st0||(g0!==undefined&&s.g===g0))&&s.when.some(w=>s.exact?text.trim()===w:text.includes(w)));
      if(idx<0) return false; const step=fl[idx], st=idx;
      chat._wait=true; const who=chat.with||'other';
      const list=[].concat(step.reply||[]), d0=step.delay||600;
      const clr=()=>chat.msgs.forEach(m=>{delete m.unr;});
      const typing=()=>{ clr(); if(openId===chat.id){ typingEl=h('div',{class:'mrow first'}, h('div',{class:'kav',style:K.avatarStyle(K.contact(chat.with))}, chat.with==='sj'?'♡':'…'), h('div',{class:'bub'},h('span',{class:'typing'},h('i'),h('i'),h('i')))); renderMsgs(); } };
      let t=d0;
      list.forEach(txt=>{   // 메시지 하나마다 입력중 → 전송
        setTimeout(typing,t); t+=1300;
        setTimeout(()=>{ typingEl=null; chat.msgs.push({from:who,name:'',ts:+K.now(),text:txt,img:'',unread:openId!==chat.id}); K.save(); if(openId===chat.id) renderMsgs(); },t);
        t+=500;
      });
      if(!list.length) t=d0+1300; else t-=500;
      setTimeout(()=>{ clr(); chat._wait=false; typingEl=null; { let nx=st+1; while(nx<fl.length&&step.g!==undefined&&fl[nx].g===step.g) nx++; chat._stage=(nx>=fl.length)?0:nx; }
        if(step.call){ setTimeout(()=>K.incomingCall(K.contact(chat.with)),step.callDelay||2500); }
        if(step.banner){ const b=step.banner; setTimeout(()=>{ if(b.app==='mapo'){ const d=new Date(+K.now()); K.state.mapoOut=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2); K.save(); } K.banner({app:b.app,title:b.title,text:b.text,onTap:()=>K.openApp(b.app)}); },b.delay||2000); }
        if(openId===chat.id) renderMsgs();
      },t+20);
      return true;
    }
    /* 날씨 위젯 등으로 시작된 대본: 무엇을 보내도 입력중이 뜰 때까지는 안읽음 "1"이 떠 있어요 */
    function tryAlt(text){
      if(!((chat._armed&&chat.alt)||chat._chain)) return false;
      chat.msgs[chat.msgs.length-1].unr=true; renderMsgs();
      if(chat._chain){
        const cur=chat._cur, nx=cur&&cur.then&&cur.then.find(x=>x.when.some(w=>text.includes(w)));
        if(nx){ chat._gen=(chat._gen||0)+1; typingEl=null; chat._chain=false; chat._wait=false; chat._pend=[]; runAlt(nx,0); return true; }   // 진행 중에 다음 단계 단어가 나오면 하던 걸 멈추고 바로 이어가요
        (chat._pend=chat._pend||[]).push(text); return true;
      }
      const alt=chat.alt.find(x=>x.when.some(w=>text.includes(w)));
      if(alt) runAlt(alt);
      return true;   // 맞는 말이 아니면 조용히 기다려요 (다른 자동 답장 없음)
    }
    function runAlt(alt,d0){
      const gen=chat._gen=(chat._gen||0)+1; chat._cur=alt;
      chat._armed=false; chat._chain=true; chat._wait=true; const who=chat.with||'other';
      const steps=alt.chain.map(g=>[].concat(g).map(t=>[t])).flat();   // 메시지 하나마다 입력중 → 전송
      const isOpen=()=>openId===chat.id && page.isConnected && K.cur && K.cur.id==='kakao';
      const finish=()=>{ if(chat._gen!==gen) return; chat._wait=false; chat._chain=false; typingEl=null;
        if(alt.then){ chat.alt=alt.then; chat._armed=true; }
        const pend=chat._pend||[]; chat._pend=[]; K.save();
        if(alt.then){ for(const t of pend){ const nx=alt.then.find(x=>x.when.some(w=>t.includes(w))); if(nx){ runAlt(nx); break; } } } };
      const next=(d)=>{ d=d||0;
        const grp=steps.shift(); if(!grp){ finish(); return; }
        setTimeout(()=>{ if(chat._gen!==gen) return; chat.msgs.forEach(m=>{delete m.unr;}); if(isOpen()){ typingEl=h('div',{class:'mrow first'}, h('div',{class:'kav',style:K.avatarStyle(K.contact(chat.with))}, chat.with==='sj'?'♡':'…'), h('div',{class:'bub'},h('span',{class:'typing'},h('i'),h('i'),h('i')))); renderMsgs(); } },(alt.typeDelay!==undefined?alt.typeDelay:700)+d);
        setTimeout(()=>{ if(chat._gen!==gen) return; typingEl=null; const open=isOpen();
          grp.forEach(t=>chat.msgs.push({from:who,name:'',ts:+K.now(),text:t,img:'',unread:!open,noti:!open})); K.save();
          if(open) renderMsgs();
          else { K.banner({app:'kakao',title:(K.contact(chat.with)||{}).name||'♡',text:grp[grp.length-1],onTap:()=>K.openKakaoChat(chat.id)}); K.refreshKakao&&K.refreshKakao(); K.refreshHome&&K.refreshHome(); }
          next(); },2100+d);
      };
      next(d0!==undefined?d0:(alt.delay!==undefined?alt.delay:10000));
    }
    /* data.js의 cmd: 특정 말을 보내면 N초 뒤 전화 → 전화를 끊고 M초 뒤 메시지(링크 카드) */
    function runCmd(text){
      const c=(chat.cmd||[]).find(x=>x.when.some(w=>text.includes(w))); if(!c) return false;
      const who=chat.with||'other';
      setTimeout(()=>{ chat.msgs.forEach(m=>{delete m.unr;}); K.save(); if(openId===chat.id) renderMsgs(); },c.readDelay||1000);   // 보내고 1초 뒤 안읽음 1 사라짐
      setTimeout(()=>{
        chat.msgs.forEach(m=>{delete m.unr;}); K.save(); if(openId===chat.id) renderMsgs();
        if(!c.afterCall) return;
        K._afterCall=()=>{ setTimeout(()=>{
          chat.msgs.forEach(m=>{delete m.unr;});
          const open=openId===chat.id && page.isConnected && K.cur && K.cur.id==='kakao';
          chat.msgs.push(Object.assign({from:who,name:'',ts:+K.now(),img:'',unread:!open,noti:!open},c.afterCall.msg)); K.save();
          if(open) renderMsgs();
          else { K.banner({app:'kakao',title:(K.contact(chat.with)||{}).name||'♡',text:c.afterCall.msg.link?c.afterCall.msg.link.title:c.afterCall.msg.text,onTap:()=>K.openKakaoChat(chat.id)}); K.refreshKakao&&K.refreshKakao(); K.refreshHome&&K.refreshHome(); }
          if(c.afterCall.then&&c.afterCall.then.length) runAlt({typeDelay:0,chain:c.afterCall.then.map(t=>[t])},0);   // 이어서 입력중 → 메시지 하나씩
        },c.afterCall.delay||10000); };
        K.incomingCall(K.contact(chat.with));
      },c.callDelay||5000);
      return true;
    }
    function send(text,img=''){
      if(K.RO && !chat.flow && chat.with!=='kp' && chat.with!=='jm'){ K.roToast(); return; }   // 읽기 전용이어도 콩사원(kp)에게만 채팅을 보낼 수 있어요 (안읽음 1은 계속 남아요)
      chat.msgs.push({from:'me',name:'',ts:+K.now(),text,img,unread:false,unr:true}); K.save(); renderMsgs(); K.logChat(chat,text,img); { const from0=chat.msgs.length; let n=from0,quiet=0,tries=0; const iv=setInterval(()=>{ tries++; const cur=chat.msgs.length; if(cur>n){ n=cur; quiet=0; } else quiet++;   /* 자동 반응이 끝날 때까지 기다렸다가 한 번에 기록 */
          if((n>from0&&quiet>=4)||tries>60){ clearInterval(iv); const rs=chat.msgs.slice(from0).filter(m=>m.from!=='me'&&m.text); if(rs.length) K.logChat(chat,rs.map(m=>m.text).join(' / '),null,'react'); } },1000); } if(chat.with==='jm'&&chat._jmAsk){ chat._jmAsk=false; setTimeout(()=>K.trigger('jm-reply'),0); }
      { const R0=chat.rand||((K.D.chats||[]).find(c=>c.id===chat.id)||{}).rand, of=R0&&(R0.offers||[]).find(o=>o.reply===chat._callOffer);
        if(of&&!chat._wait&&of.when.some(w=>text.includes(w))){ chat._callOffer=null; chat.msgs.forEach(m=>{delete m.unr;}); K.save(); renderMsgs(); setTimeout(()=>K.incomingCall(K.contact(chat.with)),1800); return; }
        chat._callOffer=null; }
      if(runCmd(text)) return;
      if(tryAlt(text)) return;
      if(chat.flow){ if(flowReply(text)) return;
        const R=chat.rand||((K.D.chats||[]).find(c=>c.id===chat.id)||{}).rand; if(R&&!chat._wait&&!chat._lock&&R.when.some(w=>text.includes(w))){
          if(Math.random()<(R.p===undefined?0.6:R.p)){ chat._wait=true; const who=chat.with||'other';
            setTimeout(()=>{ chat.msgs.forEach(m=>{delete m.unr;}); if(openId===chat.id){ typingEl=h('div',{class:'mrow first'}, h('div',{class:'kav',style:K.avatarStyle(K.contact(chat.with))}, chat.with==='sj'?'♡':'…'), h('div',{class:'bub'},h('span',{class:'typing'},h('i'),h('i'),h('i')))); renderMsgs(); } },600);
            setTimeout(()=>{ chat.msgs.forEach(m=>{delete m.unr;}); chat._wait=false; typingEl=null;
              const rt=R.replies[Math.floor(Math.random()*R.replies.length)]; chat._callOffer=(R.offers||[]).some(o=>o.reply===rt)?rt:null; chat.msgs.push({from:who,name:'',ts:+K.now(),text:rt,img:'',unread:openId!==chat.id}); K.save(); if(openId===chat.id) renderMsgs(); },2000+Math.random()*900); }
        }
        return; }
      if(chat.autoReply&&chat.autoReply.length&&!chat._wait){
        chat._wait=true;
        const who=chat.with||'other', nmx=chat.with?'':(chat.members?chat.members.find(x=>x!=='강영현'):'');
        setTimeout(()=>{ chat.msgs.forEach(m=>{delete m.unr;}); if(openId===chat.id){ typingEl=h('div',{class:'mrow first'}, h('div',{class:'kav',style:K.avatarStyle(K.contact(chat.with))}, chat.with==='sj'?'♡':'…'), h('div',{class:'bub'},h('span',{class:'typing'},h('i'),h('i'),h('i')))); renderMsgs(); } },500);
        setTimeout(()=>{ chat.msgs.forEach(m=>{delete m.unr;}); chat._wait=false; typingEl=null;
          chat.msgs.push({from:who,name:nmx||'',ts:+K.now(),text:chat.autoReply[Math.floor(Math.random()*chat.autoReply.length)],img:'',unread:openId!==chat.id}); K.save(); if(openId===chat.id) renderMsgs(); },1700+Math.random()*900);
      }
    }
    function doSend(){ if(chat._lock) return; const v=inp.value.trim(); if(!v) return; inp.value=''; sendBtn.classList.remove('on'); send(v); inp.focus(); }
    K._renderOpenChat=()=>{ if(openId===chat.id){ chat.msgs.forEach(m=>m.unread=false); renderMsgs(); } };
    renderMsgs();
  }
  K._openChatId = () => openId;
  K.refreshKakao = () => { if(!(K.cur&&K.cur.id==='kakao')) return; if(K._renderOpenChat) K._renderOpenChat(); if(!openId) render(); };
  K._kakaoOpen = id => { const c=S().chats.find(x=>x.id===id); if(c) setTimeout(()=>openChat(c),450); };
  render();
  if (p && p.chat) K._kakaoOpen(p.chat);
}};

/* =================== 전화 =================== */
K.apps.phone = { mount(root, p, ctl){
  ctl.bar(true);
  const nav=K.makeNav(root);
  let tab='keypad', filter='all';
  const main=K.page(); const content=h('div',{class:'scroll'}); const tabs=h('div',{class:'tabs'});
  main.classList.add('ph'); main.append(padTop(), content, tabs); nav.push(main);
  const IC={fav:'M12 17.3l-5.2 3.100 1.400-5.900L3.600 10.600l6-.5L12 4.500l2.400 5.600 6 .5-4.600 3.900 1.400 5.900z',rec:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5v5.500l4 2.300-.8 1.300L11 13V7z',con:'M12 12a4.500 4.500 0 1 0 0-9 4.500 4.500 0 0 0 0 9zm0 2c-4.400 0-8 2.200-8 5v2h16v-2c0-2.800-3.600-5-8-5z',key:'M6 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM6 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM6 16a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',vm:'M18.500 6A5.500 5.500 0 0 0 13 11.500c0 1.500.6 2.800 1.600 3.800H9.400A5.500 5.500 0 1 0 5.500 17H18.500a5.500 5.500 0 0 0 0-11z'};
  function renderTabs(){
    tabs.innerHTML='';
    [['recents','최근 기록'],['contacts','연락처'],['keypad','키패드']].forEach(([id,n])=>{
      tabs.append(h('button',{class:tab===id?'on':'',onclick:()=>{tab=id;render();}}, h('span',{html:`<svg viewBox="0 0 24 24"><path d="${IC[{fav:'fav',recents:'rec',contacts:'con',keypad:'key',vm:'vm'}[id]]}"/></svg>`}), n));
    });
  }
  const pav=(c,sz=40)=>h('div',{class:'pav',style:K.avatarStyle(c)+`;width:${sz}px;height:${sz}px;font-size:${sz*.4}px`}, c&&c.id==='sj'?'♡':K.initial(c?c.name:'?'));
  function render(){
    renderTabs(); content.innerHTML=''; content.classList.remove('kp'); content.style.position='';
    if(tab==='recents'){
      content.append(h('div',{style:'display:flex;justify-content:space-between;align-items:center;padding:6px 16px'}, h('button',{style:'color:#007aff;font-size:17px'},'편집'),
        h('div',{class:'seg'},['all','missed'].map(k=>h('button',{class:filter===k?'on':'',onclick:()=>{filter=k;render();}},k==='all'?'모두':'부재중'))), h('span',{style:'width:34px'})));
      content.append(h('div',{class:'large'},'최근 기록'));
      [...S().calls].filter(c=>filter==='all'||c.type==='missed').sort((a,b)=>b.ts-a.ts).forEach(c=>{
        const ct=K.contact(c.c);
        const row=h('div',{class:'prow',onclick:()=>K.startCall(ct?ct.name:c.num,ct?ct.phone:c.num,ct)},
          h('div',{class:'mid'}, h('div',{class:'nm'+(c.type==='missed'?' red':'')}, ct?ct.name:c.num), h('div',{class:'sb'+(c.type==='missed'?' red':'')},c.type==='missed'?'부재중':(ct&&ct.phone.startsWith('+')?'해외 ':'휴대전화 ')+(c.type==='out'?'발신':'수신')+(c.dur?' · '+c.dur:''))),
          h('div',{class:'rt'}, K.listTime(c.ts), h('span',{class:'info',onclick:e=>{e.stopPropagation();detail(ct);}},'i')));
        content.append(row);
      });
    } else if(tab==='contacts'){
      content.append(h('div',{class:'large'},'연락처'), h('div',{class:'search'},K.searchIc(),h('input',{placeholder:'검색',oninput:e=>list(e.target.value)})));
      const own=h('div',{class:'prow',style:'height:72px',onclick:()=>ownCard()}, h('div',{class:'pav',style:'width:56px;height:56px;margin-right:14px;font-size:22px;background:linear-gradient(145deg,#d9dee8,#aab4c6)'},'성'), h('div',{},h('div',{class:'nm',style:'font-size:20px;font-weight:600'},S().ui.ownerName), h('div',{class:'sb'},'내 카드')));
      content.append(own); const box=h('div'); content.append(box);
      function list(q=''){
        box.innerHTML='';
        const groups={};
        D.contacts.filter(c=>!c.kakaoOnly&&(!q||c.name.includes(q)||c.phone.includes(q))).sort((a,b)=>a.name.localeCompare(b.name,'ko')).forEach(c=>{ const g=K.choseong(c.name); (groups[g]=groups[g]||[]).push(c); });
        Object.keys(groups).sort((a,b)=>(a==='#')-(b==='#')||a.localeCompare(b,'ko')).forEach(g=>{
          box.append(h('div',{class:'hd'},g));
          groups[g].forEach(c=>box.append(h('div',{class:'prow',onclick:()=>{ detail(c); if(c.id==='sj') K.trigger('contact-sj'); }}, h('div',{class:'nm',style:'font-weight:'+(c.fav?600:500)},c.name))));
        });
      }
      list();
    } else if(tab==='fav'){
      content.append(h('div',{class:'large'},'즐겨찾기'));
      D.contacts.filter(c=>c.fav).forEach(c=>content.append(h('div',{class:'prow',onclick:()=>K.startCall(c.name,c.phone,c)}, pav(c), h('div',{class:'mid'},h('div',{class:'nm'},c.name),h('div',{class:'sb'},'휴대전화')), h('span',{class:'info',onclick:e=>{e.stopPropagation();detail(c);}},'i'))));
    } else if(tab==='keypad'){
      content.classList.add('kp'); content.style.position='relative';
      let num=''; const disp=h('div',{class:'num'},'');
      const keys=h('div',{class:'keys'});
      const L={2:'ABC',3:'DEF',4:'GHI',5:'JKL',6:'MNO',7:'PQRS',8:'TUV',9:'WXYZ'};
      ['1','2','3','4','5','6','7','8','9','*','0','#'].forEach(k=>{
        const b=h('button',{onclick:()=>{ if(b._long){ b._long=false; return; } K.dtmf(k); num+=k; upd(); }}, k, h('small',{},k==='1'?'':(L[k]||'')));
        if(k==='1'){   // 1번 꾹 누르면 성진(♡)에게 전화
          let t=null; const stop=()=>{ clearTimeout(t); };
          b.addEventListener('pointerdown',()=>{ b._long=false; stop(); t=setTimeout(()=>{ b._long=true; const c=K.contact('sj'); if(c) K.startCall(c.name,c.phone,c); },550); });
          ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,stop));
          b.addEventListener('contextmenu',e=>e.preventDefault());
        }
        keys.append(b);
      });
      keys.append(h('button',{class:'go',onclick:()=>{ if(!num) return; const c=D.contacts.find(x=>x.phone.replace(/\D/g,'')===num.replace(/\D/g,'')); K.startCall(c?c.name:num,num,c); },html:`<svg viewBox="0 0 24 24"><path d="${K.PHONE_PATH}"/></svg>`}));
      const del=h('button',{class:'del',onclick:()=>{ num=num.slice(0,-1); upd(); }},'⌫');
      function fmt(n){ const d=n.replace(/\D/g,''); if(n.startsWith('010')&&d.length>7) return d.slice(0,3)+'-'+d.slice(3,7)+'-'+d.slice(7,11); return n; }
      function upd(){ disp.textContent=fmt(num); del.style.display=num?'':'none'; }
      content.append(disp,keys,del); upd();
    } else {
      content.append(h('div',{class:'large'},'음성사서함'), h('div',{class:'empty',style:'height:400px'},h('div',{class:'eb'},'📼'),h('div',{},'음성사서함 메시지가 없어요')));
    }
    if(tab!=='keypad') content.append(botPad());
  }
  function detail(c){
    if(!c) return;
    const pg=K.page(); pg.classList.add('cdetail','gbg');
    const hist=S().calls.filter(x=>x.c===c.id).sort((a,b)=>b.ts-a.ts).slice(0,5);
    const act=(label,svg,fn)=>h('button',{onclick:fn},h('span',{html:svg}),label);
    pg.append(padTop(), h('div',{class:'navbar'},K.back('연락처',()=>nav.pop()),h('button',{},'편집')),
      h('div',{class:'scroll'}, h('div',{class:'big',style:K.avatarStyle(c)}, c.id==='sj'?'♡':K.initial(c.name)), h('h2',{},c.name), h('div',{class:'org'},c.org||''),
        h('div',{class:'cact'}, act('메시지',`<svg viewBox="0 0 24 24"><path d="M12 3C6.500 3 2.500 6.500 2.500 11c0 2.800 1.600 5.200 4 6.700L5.500 21l3.800-2.200c.9.200 1.800.3 2.700.3 5.500 0 9.500-3.500 9.500-8S17.500 3 12 3z"/></svg>`,()=>{ K.openApp('kakao',{chat:(S().chats.find(x=>x.with===c.id)||{}).id}); }), act('통화',`<svg viewBox="0 0 24 24"><path d="${K.PHONE_PATH}"/></svg>`,()=>K.startCall(c.name,c.phone,c))),
        h('div',{class:'card'},h('small',{},'휴대전화'),h('div',{},c.phone)),
        c.org?h('div',{class:'card'},h('small',{},'회사/소속'),h('div',{style:'color:#000'},c.org)):null,
        hist.length?h('div',{class:'card'},h('small',{},'최근 통화'),hist.map(x=>h('div',{style:'color:#000;font-size:15px'},`${K.mdw(x.ts)} ${K.hm(x.ts)} · ${x.type==='out'?'발신':x.type==='in'?'수신':'부재중'}${x.dur?' · '+x.dur:''}`))):null,
        botPad()));
    nav.push(pg);
  }
  function ownCard(){
    const pg=K.page(); pg.classList.add('owncard');
    const SV=(d)=>`<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const act=(n,d)=>h('div',{class:'oa'},h('i',{html:SV(d)}),h('small',{},n));
    const num='010-1993-1219';
    pg.append(padTop(),
      h('div',{class:'onav'},h('button',{class:'ob bk',onclick:()=>nav.pop(),html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'}),h('button',{class:'oe'},'편집')),
      h('div',{class:'scroll'},
        h('div',{class:'oav',html:'<svg viewBox="0 0 100 100"><circle cx="50" cy="38" r="17" fill="#fff" opacity=".9"/><path d="M16 92c2-20 16-30 34-30s32 10 34 30z" fill="#fff" opacity=".9"/></svg>'}),
        h('h2',{},S().ui.ownerName),
        h('div',{class:'oacts'},act('메시지','<path d="M12 4C7 4 3.500 7.200 3.500 11.200c0 2.300 1.200 4.300 3.100 5.600L5.800 20l3.600-2c.8.200 1.700.3 2.600.3 5 0 8.500-3.200 8.500-7.100S17 4 12 4z"/>'),act('통화','<path d="M6.500 3.500l3 .8 1 4-2 1.500a11 11 0 0 0 5.200 5.200l1.500-2 4 1 .8 3c.2 1-.5 2-1.500 2.200C10 19.500 4.500 14 4.300 5c.2-1 1.200-1.700 2.200-1.500z"/>'),act('FaceTime','<rect x="3" y="7" width="12.500" height="10" rx="2.500"/><path d="M15.500 11l5-3v8l-5-3z"/>'),act('메일','<rect x="3.500" y="5.500" width="17" height="13" rx="2.500"/><path d="M4 8l8 5.500L20 8"/>')),
        h('div',{class:'ocard'},h('div',{},h('b',{},'이름 및 사진 공유'),h('small',{},'공유 끔')),h('span',{class:'oc'},'›')),
        h('div',{class:'ocard col'},h('small',{},'휴대전화'),h('div',{class:'ov'},num)),
        h('div',{class:'ocard col'},h('small',{},'메모'),h('div',{class:'ov'},'\u00a0')),
        botPad()));
    nav.push(pg);
  }
  render();
}};

/* =================== 메시지(SMS) =================== */
K.apps.messages = { mount(root, p, ctl){
  ctl.bar(true);
  const nav=K.makeNav(root);
  const main=K.page(); const sc=h('div',{class:'scroll'});
  main.append(padTop(), h('div',{class:'navbar'},h('button',{},'편집'),h('span',{style:'color:#007aff'},'✎')), h('div',{class:'large'},'메시지'), h('div',{class:'search'},K.searchIc(),h('input',{placeholder:'검색'})), sc);
  nav.push(main);
  function render(){
    sc.innerHTML='';
    [...S().sms].sort((a,b)=>b.msgs[b.msgs.length-1].ts-a.msgs[a.msgs.length-1].ts).forEach(t=>{
      const lm=t.msgs[t.msgs.length-1];
      sc.append(h('div',{class:'prow',style:'height:72px',onclick:()=>thread(t)}, h('div',{class:'pav',style:'width:48px;height:48px;font-size:24px;background:linear-gradient(#c6cbd4,#9ea6b4)'},t.avatar), h('div',{class:'mid'},h('div',{class:'nm',style:'font-weight:600'},t.name),h('div',{class:'sb',style:'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:240px'},lm.text.replace(/\n/g,' '))), h('div',{class:'rt',style:'font-size:14px'},K.listTime(lm.ts))));
    });
    sc.append(botPad());
  }
  function thread(t){
    const pg=K.page(); const s2=h('div',{class:'scroll',style:'display:flex;flex-direction:column;padding-bottom:10px'});
    pg.append(padTop(), h('div',{class:'navbar',style:'border-bottom:.5px solid var(--sep)'},K.back('메시지',()=>nav.pop()),h('div',{class:'ttl'},t.name),h('span')), s2,
      h('div',{style:'padding:8px 14px 34px;color:#aaa;font-size:14px;border-top:.5px solid var(--sep)'},'답장할 수 없는 번호예요'));
    let last=null;
    t.msgs.forEach(m=>{ if(last===null||K.dayDiff(m.ts,last)!==0) s2.append(h('div',{class:'sms-dt'},K.mdw(m.ts)+' '+K.hm(m.ts))); last=m.ts; s2.append(h('div',{class:'sms-bub'+(m.from==='me'?' me':'')},m.text)); });
    nav.push(pg); setTimeout(()=>s2.scrollTop=s2.scrollHeight,60);
  }
  render();
}};

/* =================== 메모 =================== */

/* 암호 입력창 (메모 폴더 잠금 등) */
K.askCode = function(code,title,onOk){
  const scr=document.querySelector('#screen'); let val='';
  const el=h('div',{class:'codeov'}), dots=h('div',{class:'dots'},[...code].map(()=>h('i')));
  const upd=()=>[...dots.children].forEach((d,i)=>d.classList.toggle('on',i<val.length));
  const close=()=>{ document.removeEventListener('keydown',kd); el.remove(); };
  const press=d=>{ if(val.length>=code.length) return; val+=d; upd();
    if(val.length===code.length) setTimeout(()=>{ if(val===code){ close(); onOk(); } else { val=''; upd(); } },160); };
  const back=()=>{ val=val.slice(0,-1); upd(); };
  const L={2:'ABC',3:'DEF',4:'GHI',5:'JKL',6:'MNO',7:'PQRS',8:'TUV',9:'WXYZ'};
  const pad=h('div',{class:'pad'},['1','2','3','4','5','6','7','8','9'].map(k=>h('button',{onclick:()=>press(k)},k,h('small',{},L[k]||''))),h('div',{class:'blank'}),h('button',{onclick:()=>press('0')},'0',h('small',{})),h('button',{class:'txt',onclick:back},'⌫'));
  el.append(h('div',{class:'ttl'},title||'암호 입력'),dots,h('div',{class:'hintt'},''),pad,h('div',{class:'bt'},h('span'),h('button',{onclick:close},'취소')));
  const kd=e=>{ if(/^\d$/.test(e.key)) press(e.key); else if(e.key==='Backspace') back(); else if(e.key==='Escape') close(); };
  document.addEventListener('keydown',kd);
  el.addEventListener('pointerdown',e=>e.stopPropagation());
  el.classList.add('show'); scr.append(el);
};

K.apps.notes = { mount(root, p, ctl){
  ctl.bar(true);
  const nav=K.makeNav(root);
  const clean = t => t.replace(/^\[[ xX]\]\s?/gm,'').replace(/\*\*(.+?)\*\*/g,'$1');
  const titleOf = n => clean(n.body.split('\n').find(l=>l.trim())||'새로운 메모').trim();
  const restOf = n => { const ls=n.body.split('\n'); const i=ls.findIndex(l=>l.trim()); return clean(ls.slice(i+1).join(' ')).trim(); };
  const folders=K.page(); folders.classList.add('gbg'); const fsc=h('div',{class:'scroll'});
  folders.append(padTop(),h('div',{class:'navbar'},h('span'),h('button',{class:'yel'},'편집')),fsc); nav.push(folders);
  const FOLD='younghyun의 iCloud 동기화';
  fsc.append(h('div',{class:'large'},'메모'), h('div',{class:'search'},K.searchIc(),h('input',{placeholder:'검색'})));
  const mkFold=(n,c,key)=>h('div',{class:'fold',onclick:()=>{ const lk=D.settings.notesLock; if(lk) K.askCode(lk,'암호 입력',()=>list(n,key)); else list(n,key); }}, h('span',{html:'<svg viewBox="0 0 24 24"><path d="M3 6h7l2 2h9v11H3z"/></svg>'}), n, h('span',{class:'c'},c+' ›'));
  const fg=h('div',{class:'ngroup'}), mine=h('div',{class:'ngroup'});
  fsc.append(h('div',{class:'nsec'},'나의 노트'), mine, h('div',{class:'nsec',style:'font-size:17px;color:#000'},'iCloud'), fg);
  function fRender(){
    mine.innerHTML=''; fg.innerHTML='';
    S().notes.filter(n=>!n.folder).sort((x,y)=>y.ts-x.ts).forEach(n=>mine.append(h('div',{class:'nrow',onclick:()=>{ list._cur={_r:fRender}; edit(n); }},h('div',{class:'in'},h('b',{},titleOf(n)),h('p',{},h('em',{},K.dayDiff(K.now(),n.ts)===0?K.hm(n.ts):K.listTime(n.ts)),restOf(n)||'추가 텍스트 없음')))));
    fg.append(mkFold(FOLD,S().notes.filter(n=>n.folder===FOLD).length,FOLD), h('div',{class:'fold',onclick:()=>list('최근 삭제된 항목','최근 삭제된 항목')},h('span',{html:'<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7zM9 7V4h6v3"/></svg>'}),'최근 삭제된 항목',h('span',{class:'c'},S().notes.filter(n=>n.folder==='최근 삭제된 항목').length+' ›')));
  }
  fRender();
  function list(name,key){
    const pg=K.page(); pg.classList.add('gbg','nt'); const sc=h('div',{class:'scroll'});
    let q='';
    const render=()=>{
      sc.innerHTML='';
      const arr=[...S().notes].filter(n=>(!key||n.folder===key)&&(!q||n.body.includes(q))).sort((a,b)=>b.ts-a.ts);
      const pinned=arr.filter(n=>n.pinned), rest=arr.filter(n=>!n.pinned);
      const sec=(title,items)=>{ if(!items.length) return; sc.append(h('div',{class:'nsec'},title)); const g=h('div',{class:'ngroup'}); items.forEach(n=>g.append(h('div',{class:'nrow',onclick:()=>edit(n)},h('div',{class:'in'},h('b',{},titleOf(n)),h('p',{},h('em',{},K.dayDiff(K.now(),n.ts)===0?K.hm(n.ts):K.listTime(n.ts)),restOf(n)||'추가 텍스트 없음'))))); sc.append(g); };
      sec('고정됨',pinned);
      const seen=[]; rest.forEach(n=>{ const g=K.relDay(n.ts); if(!seen.includes(g)) seen.push(g); });
      seen.forEach(g=>sec(g,rest.filter(n=>K.relDay(n.ts)===g)));
      sc.append(h('div',{style:'text-align:center;color:#8e8e93;font-size:13px;padding:18px 0 90px'},arr.length+'개의 메모'));
    };
    pg.append(padTop(),h('div',{class:'navbar'},K.back('폴더',()=>{nav.pop();fRender();}),h('button',{class:'yel'},'⋯')), h('div',{class:'large',style:'padding-bottom:0'},name), h('div',{class:'search'},K.searchIc(),h('input',{placeholder:'검색',oninput:e=>{q=e.target.value;render();}})), sc,
      h('div',{class:'fab',onclick:()=>{ if(K.RO){K.roToast();return;} const n={id:'n'+Date.now(),ts:+K.now(),pinned:false,body:''}; S().notes.push(n); edit(n,true); }},'✎'));
    pg._render=render; nav.push(pg); render(); pg._r=render; list._cur=pg;
  }
  function edit(n,isNew){
    const pg=K.page(); pg.classList.add('nt');
    const ed=h('div',{class:'neditor',contenteditable:K.RO?'false':'true'});
    const lines=n.body.split('\n'); ed.innerHTML=lines.map((l,i)=>{ let cls=i===0?'t1':''; const ck=/^\[([ xX])\]\s?/.exec(l); if(ck){ cls+=(ck[1]===' '?' ck':' ck on'); l=l.slice(ck[0].length); } const esc=l?l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>'):'<br>'; return `<div${cls?' class="'+cls.trim()+'"':''}>${esc}</div>`; }).join('')||'<div class="t1"><br></div>';
    const body0=n.body, ts0=n.ts; const commit=()=>{ if(K.RO){ n.body=body0; n.ts=ts0; return; } const nb=ed.innerText.replace(/\n\n$/,'\n').replace(/ /g,' '); if(nb!==body0){ n.body=nb; n.ts=+K.now(); } if(!n.body.trim()){ S().notes=S().notes.filter(x=>x!==n); } K.save(); };
    ed.addEventListener('input',()=>{ if(K.RO) return; n.body=ed.innerText.replace(/ /g,' '); K.save(); });
    const back=()=>{commit();nav.pop();const cur=list._cur; cur&&cur._r&&cur._r();};
    const del=()=>{S().notes=S().notes.filter(x=>x!==n);K.save();nav.pop();const cur=list._cur; cur&&cur._r&&cur._r();};
    const SV=(d,w=26,sw=2)=>`<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="#111" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const d0=new Date(n.ts), pad=x=>String(x).padStart(2,'0');
    const dstr=`${d0.getFullYear()}년 ${d0.getMonth()+1}월 ${d0.getDate()}일 ${pad(d0.getHours())}:${pad(d0.getMinutes())}`;
    pg.classList.add('ned2');
    pg.append(padTop(),
      h('div',{class:'ntop'},h('button',{class:'nc1 bk',onclick:back,html:SV('<path d="M15 5l-7 7 7 7"/>',26,2.400)}),
        h('div',{class:'nc2'},h('button',{html:SV('<path d="M12 15V4M8 8l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-1"/>',26,1.800).replace('#111','#8e8e93')}),
          h('button',{onclick:()=>K.sheet('메모',[{t:n.pinned?'고정 해제':'메모 고정',fn:()=>{n.pinned=!n.pinned;K.save();}},{t:'삭제',red:true,fn:del}]),html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="#111"><circle cx="5" cy="12" r="1.900"/><circle cx="12" cy="12" r="1.900"/><circle cx="19" cy="12" r="1.900"/></svg>'}))),
      h('div',{class:'ndate'},dstr), ed,
      h('div',{class:'nbar'},
        h('div',{class:'npill'},h('span',{html:SV('<circle cx="6" cy="7" r="3" fill="#111"/><path d="M4.800 7l1 1 1.800-2M12 7h8M12 17h8"/><circle cx="6" cy="17" r="3"/>',30,1.800)}),h('span',{html:SV('<path d="M21.440 11.050l-9.190 9.190a6 6 0 0 1-8.490-8.490l9.190-9.190a4 4 0 0 1 5.660 5.660l-9.200 9.190a2 2 0 0 1-2.830-2.830l8.490-8.480"/>',30,1.800)}),h('span',{html:SV('<circle cx="12" cy="12" r="9"/><path d="M8.500 16l3.500-8 3.500 8M9.800 13.500h4.400"/>',30,1.800)}),h('span',{html:SV('<path d="M4 20l4-1 11-11a2.500 2.500 0 0 0-3.500-3.500L4.500 15.500z"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-45 12 12)"/>',30,1.500)})),
        h('div',{class:'ncomp',html:SV('<path d="M12 5H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-5"/><path d="M17.500 3.500l3 3L11 16l-4 1 1-4z"/>',28,1.800).replace('#111','#8e8e93')})));
    nav.push(pg); if(isNew) setTimeout(()=>ed.focus(),400);
  }
  const st=document.createElement('style'); st.textContent='.neditor .t1{font-size:26px;font-weight:700;margin-bottom:4px}.neditor .ck{position:relative;padding-left:34px;min-height:24px}.neditor .ck::before{content:"";position:absolute;left:2px;top:2px;width:20px;height:20px;border-radius:50%;border:1.6px solid #c7a21a;box-sizing:border-box}.neditor .ck.on::before{background:#ffcc00 url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\'%3E%3Cpath d=\'M5.500 10.500l3 3 6-6.500\' fill=\'none\' stroke=\'%23fff\' stroke-width=\'2.200\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") center/20px no-repeat;border-color:#ffcc00}.neditor .ck.on{color:#8e8e93;text-decoration:line-through}.neditor b{font-weight:700}'; root.append(st);
}};

/* =================== 캘린더 =================== */
K.apps.calendar = { mount(root, p, ctl){
  ctl.bar(true);
  const nav=K.makeNav(root);
  const today=K.now(); let y=today.getFullYear(), m=today.getMonth(), sel=K.dayStart(today);
  const pg=K.page(); pg.classList.add('cal'); nav.push(pg);
  const evsOf = d => S().events.filter(e=>K.dayDiff(e.ts,d)===0).sort((a,b)=>a.ts-b.ts);
  function render(){
    pg.innerHTML='';
    pg.append(padTop(), h('div',{class:'navbar'},h('button',{style:'color:#ff3b30;font-size:17px',onclick:()=>{m--;if(m<0){m=11;y--;}render();}},'‹ '+(m===0?12:m)+'월'),h('div',{}),h('button',{style:'color:#ff3b30',onclick:()=>{m++;if(m>11){m=0;y++;}render();}},((m+2)>12?1:m+2)+'월 ›')),
      h('div',{class:'mt'},h('h1',{},(m+1)+'월'),h('span',{style:'color:#ff3b30;font-size:17px'},y+'년')),
      h('div',{class:'wk'},K.DOW.map(d=>h('span',{},d))));
    const first=new Date(y,m,1), start=new Date(y,m,1-first.getDay()), grid=h('div',{class:'mg'});
    for(let i=0;i<42;i++){
      const d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);
      if(i>=35&&d.getMonth()!==m) break;
      const ev=evsOf(d); const cls='d'+(d.getMonth()!==m?' mut':'')+(d.getDay()===0?' sun':'')+(K.dayDiff(d,K.now())===0?' today':'')+(K.dayDiff(d,sel)===0?' sel':'');
      grid.append(h('div',{class:cls,onclick:()=>{sel=d;render();}},h('i',{},String(d.getDate())),h('u',{},ev.slice(0,3).map(e=>h('b',{style:'background:'+e.color})))));
    }
    pg.append(grid);
    const list=h('div',{class:'evl'}); list.append(h('div',{class:'evh'},K.mdw(sel)));
    const ev=evsOf(sel);
    if(!ev.length) list.append(h('div',{style:'text-align:center;color:#8e8e93;padding:30px 0'},'일정 없음'));
    ev.forEach(e=>list.append(h('div',{class:'ev',onclick:()=>K.sheet(e.title,[{t:'일정 삭제',red:true,fn:()=>{S().events=S().events.filter(x=>x!==e);K.save();render();}}])},
      h('div',{class:'tm'},e.allDay?'종일':K.hm24(e.ts),e.end&&!e.allDay?h('small',{},e.end):null), h('div',{class:'bar',style:'background:'+e.color}), h('div',{},h('div',{class:'tt'},e.title),e.place?h('div',{class:'pl'},e.place):null))));
    pg.append(list, h('div',{class:'tb'},h('button',{onclick:()=>{sel=K.dayStart(K.now());y=sel.getFullYear();m=sel.getMonth();render();}},'오늘'),h('button',{onclick:()=>addEv()},'＋ 일정'),h('button',{},'받은 편지함')));
  }
  function addEv(){
    if(K.RO){ K.roToast(); return; }
    const f=K.page(); f.classList.add('gbg');
    const ti=h('input',{placeholder:'제목',style:'border:0;outline:0;font-size:17px;width:100%;height:44px;background:#fff;border-radius:12px;padding:0 14px'});
    const pl=h('input',{placeholder:'위치',style:'border:0;outline:0;font-size:17px;width:100%;height:44px;background:#fff;border-radius:12px;padding:0 14px;margin-top:10px'});
    const dt=h('input',{type:'date',value:K.ymd(sel),style:'font-size:17px;border:0;background:#fff;border-radius:12px;height:44px;padding:0 10px;width:100%;margin-top:10px'});
    const tm=h('input',{type:'time',value:'12:00',style:'font-size:17px;border:0;background:#fff;border-radius:12px;height:44px;padding:0 10px;width:100%;margin-top:10px'});
    f.append(padTop(),h('div',{class:'navbar'},h('button',{style:'color:#ff3b30',onclick:()=>nav.pop()},'취소'),h('div',{class:'ttl'},'새로운 일정'),h('button',{style:'color:#ff3b30;font-weight:600',onclick:()=>{ if(!ti.value.trim()){K.toast('제목을 입력해 주세요');return;} const [yy,mm,dd]=dt.value.split('-').map(Number); const [H,M]=tm.value.split(':').map(Number); S().events.push({id:'e'+Date.now(),user:true,ts:+new Date(yy,mm-1,dd,H,M),end:'',title:ti.value.trim(),place:pl.value,color:'#ff3b30',allDay:false}); K.save(); sel=new Date(yy,mm-1,dd); y=yy;m=mm-1; nav.pop(); render(); }},'추가')),
      h('div',{style:'padding:16px'},ti,pl,dt,tm));
    nav.push(f);
  }
  render();
}};

/* =================== 사진 =================== */
K.apps.photos = { mount(root, p, ctl){
  ctl.bar(true);
  const nav=K.makeNav(root);
  let tab='lib'; if(!S().albums) S().albums=['편지','일상'];
  const main=K.page(); main.classList.add('pho'); const content=h('div',{class:'scroll'}); const tabs=h('div',{class:'tabs'});
  main.append(padTop(),content,tabs); nav.push(main);
  const items = () => {
    const seeds=(D.seedPhotos||[]).filter(s=>!S().hiddenSeeds.includes(s.id)).map(s=>({id:s.id,seed:s,ts:K.at(s.day,s.time),fav:s.id in S().seedFav?S().seedFav[s.id]:s.fav,album:''}));
    const mine=K.photos.map(r=>({id:r.id,rec:r,ts:r.ts,fav:r.fav,album:r.album}));
    return [...seeds,...mine].sort((a,b)=>a.ts-b.ts);
  };
  const cell=(it,all,onclick)=>{
    const c=h('div',{class:'c',onclick});
    if(it.rec) c.append(h('img',{src:K.url(it.rec),loading:'lazy'}));
    else if(it.seed.src){ c.append(h('img',{src:it.seed.src,loading:'lazy'}), h('div',{class:'ttl2'},it.seed.title||'')); }
    else { const s=it.seed; c.append(h('div',{class:'ph-t',style:`background:linear-gradient(145deg,${s.a},${s.b});${s.dark?'':''}`},s.glyph), h('div',{class:'ttl2'},s.title)); }
    if(it.fav) c.append(h('div',{class:'hrt'},'♥'));
    return c;
  };
  function addPhotos(album){
    K.pickFiles(async fs=>{ for(const f of fs) await K.addPhoto(f,{album:album||''}); K.toast(fs.length+'장을 추가했어요'); render(); });
  }
  function grid(list,title,album){
    const pg=K.page(); pg.classList.add('pho'); const sc=h('div',{class:'scroll'});
    const g=h('div',{class:'pgrid'}); list.forEach((it,i)=>g.append(cell(it,list,()=>viewer(list,i,()=>{rebuild();}))));
    const rebuild=()=>{ nav.pop(); setTimeout(()=>grid(items().filter(album===undefined?()=>true:album==='__fav'?x=>x.fav:x=>x.album===album),title,album),0); };
    pg.append(padTop(),h('div',{class:'navbar'},K.back('앨범',()=>{nav.pop();render();}),h('button',{onclick:()=>addPhotos(album&&album!=='__fav'?album:'')},'＋ 추가')),h('div',{class:'large'},title),sc);
    sc.append(g, h('div',{style:'text-align:center;color:#8e8e93;font-size:15px;padding:16px 0 30px'},list.length+'장의 사진'));
    nav.push(pg); setTimeout(()=>sc.scrollTop=sc.scrollHeight,50);
  }
  function viewer(list,i,done){
    let idx=i; const pg=K.page(); pg.classList.add('viewer'); const area=h('div',{class:'img'}); const top=h('div',{class:'vtop'});
    const bar=h('div',{class:'vb'});
    const show=()=>{
      const it=list[idx]; if(!it){ nav.pop(); done&&done(); return; }
      area.innerHTML=''; top.innerHTML=''; bar.innerHTML='';
      if(it.rec) area.append(h('img',{src:K.url(it.rec)}));
      else if(it.seed.src) area.append(h('img',{src:it.seed.src,style:'width:100%;height:100%;object-fit:contain'}));
      else area.append(h('div',{class:'big',style:`background:linear-gradient(145deg,${it.seed.a},${it.seed.b});color:${it.seed.dark?'#333':'#fff'}`},it.seed.glyph,h('small',{},it.seed.title+' (임시 사진 — 직접 올린 사진으로 교체하세요)')));
      top.append(h('b',{},K.relDay(it.ts)==='오늘'?'오늘':K.mdw(it.ts)),h('small',{},K.hm(it.ts)));
      bar.append(h('button',{onclick:()=>K.toast('공유할 수 없어요')},'⬆︎'),
        h('button',{style:'color:'+(it.fav?'#ff3b30':'inherit'),onclick:async()=>{ it.fav=!it.fav; if(it.rec){ it.rec.fav=it.fav; await K.idbPut('photos',it.rec);} else { S().seedFav[it.id]=it.fav; K.save(); } show(); }},it.fav?'♥':'♡'),
        h('button',{onclick:()=>{ if(!it.rec){K.toast('임시 사진이에요');return;} K.prompt('날짜·시간 변경',new Date(it.ts-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16),async v=>{ const t=+new Date(v); if(!isNaN(t)){ it.rec.ts=t; it.ts=t; await K.idbPut('photos',it.rec); K.photos.sort((a,b)=>b.ts-a.ts); show(); } }); }},'ⓘ'),
        h('button',{onclick:()=>K.alert('사진 삭제',it.seed?'기본 임시 사진을 삭제할까요?':'이 사진을 삭제할까요?',[{t:'취소'},{t:'삭제',red:true,fn:async()=>{ if(it.rec){ await K.idbDel('photos',it.id); K.photos=K.photos.filter(x=>x.id!==it.id);} else { S().hiddenSeeds.push(it.id); K.save(); } list.splice(idx,1); if(idx>=list.length) idx=list.length-1; if(!list.length){nav.pop();done&&done();return;} show(); }}])},'🗑'));
    };
    pg.append(padTop(),h('div',{class:'navbar',style:'background:rgba(20,20,20,.0)'},K.back('보관함',()=>{nav.pop();done&&done();}),top,h('span',{style:'width:50px'})),area,bar);
    let sx=0; area.addEventListener('pointerdown',e=>sx=e.clientX); area.addEventListener('pointerup',e=>{ const dx=e.clientX-sx; if(dx<-50&&idx<list.length-1){idx++;show();} else if(dx>50&&idx>0){idx--;show();} });
    nav.push(pg); show();
  }
  function render(){
    content.innerHTML=''; tabs.innerHTML='';
    [['lib','보관함','M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],['alb','앨범','M3 7h18v13H3zM6 4h12v2H6z'],['sr','검색','M10 3a7 7 0 1 0 4.200 12.600L20 21.500 21.500 20l-5.900-5.800A7 7 0 0 0 10 3z']].forEach(([id,n,path])=>tabs.append(h('button',{class:tab===id?'on':'',onclick:()=>{tab=id;render();}},h('span',{html:`<svg viewBox="0 0 24 24"><path d="${path}"/></svg>`}),n)));
    if(tab==='lib'){
      const list=items();
      const hd=h('div',{style:'display:flex;justify-content:space-between;align-items:flex-end;padding:6px 16px 4px'},h('div',{style:'font-size:34px;font-weight:700'},'보관함'),h('div',{style:'display:flex;gap:18px;font-size:17px;color:#007aff;padding-bottom:6px'},h('button',{onclick:()=>addPhotos('')},'＋ 추가')));
      const sc=h('div',{class:'scroll',style:'flex:1'}); sc.append(hd);
      const g=h('div',{class:'pgrid'}); list.forEach((it,i)=>g.append(cell(it,list,()=>viewer(list,i,render)))); sc.append(g,h('div',{style:'text-align:center;padding:14px 0 20px'},h('b',{style:'display:block;font-size:17px'},list.length+'장의 사진'),h('small',{style:'color:#8e8e93'},'직접 올린 사진 '+K.photos.length+'장')));
      content.replaceWith(sc); sc.className='scroll'; content.style.display='none'; main.insertBefore(sc,tabs); main._sc&&main._sc.remove(); main._sc=sc; setTimeout(()=>sc.scrollTop=sc.scrollHeight,30);
      return;
    }
    if(main._sc){ main._sc.remove(); main._sc=null; content.style.display=''; if(!content.parentNode) main.insertBefore(content,tabs); }
    if(tab==='alb'){
      content.append(h('div',{class:'large'},'앨범'));
      const all=items(); const mk=(name,list,key)=>{ const last=list[list.length-1]; const cv=h('div',{class:'cv'}); if(last&&last.rec) cv.append(h('img',{src:K.url(last.rec)})); else if(last&&last.seed.src) cv.append(h('img',{src:last.seed.src})); else if(last) { cv.style.background=`linear-gradient(145deg,${last.seed.a},${last.seed.b})`; cv.textContent=last.seed.glyph; } else cv.textContent='🖼️';
        return h('div',{class:'al',onclick:()=>grid(list,name,key)},cv,h('b',{},name),h('small',{},String(list.length))); };
      const g=h('div',{class:'albums'}); g.append(mk('최근 항목',all,undefined),mk('즐겨찾는 사진',all.filter(x=>x.fav),'__fav'));
      S().albums.forEach(a=>g.append(mk(a,all.filter(x=>x.album===a),a)));
      g.append(h('div',{class:'al',onclick:()=>K.prompt('새로운 앨범','',v=>{ v=v.trim(); if(v&&!S().albums.includes(v)){ S().albums.push(v); K.save(); render(); } },{ok:'저장'})},h('div',{class:'cv',style:'font-size:40px;color:#007aff'},'＋'),h('b',{},'새로운 앨범'),h('small',{},' ')));
      content.append(g);
    } else content.append(h('div',{class:'large'},'검색'),h('div',{class:'empty',style:'height:400px'},h('div',{class:'eb',html:'<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#8e8e93" stroke-width="2" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500L21 21"/></svg>'}),h('div',{},'사진 검색은 준비 중이에요')));
    content.append(botPad());
  }
  render();
}};

/* =================== 카메라 =================== */
K.apps.camera = { mount(root,p,ctl){ ctl.bar(false);
  const pg=K.page(); pg.classList.add('cam'); root.append(pg);
  let front=true, zoom='1', mode='사진';
  const sv=(d,o={})=>'<svg viewBox="0 0 24 24" width="'+(o.s||24)+'" height="'+(o.s||24)+'" fill="'+(o.f||'none')+'" stroke="'+(o.c||'#fff')+'" stroke-width="'+(o.w||1.8)+'" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg>';
  const Y='#ffd60a';
  const bolt=c=>sv('<path d="M12.500 2.500L5 13h5l-1 8.500L17 10.500h-5z"/><circle cx="18" cy="17.500" r="4.200" fill="#000" stroke="none"/><text x="18" y="20" text-anchor="middle" font-size="7.500" font-weight="800" fill="'+c+'" stroke="none" font-family="Helvetica,Arial,sans-serif">A</text>',{c,f:c,w:.4,s:28});
  const liveOff=sv('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" stroke-dasharray="1.500 2.400"/><path d="M4 4l16 16" stroke-width="2.200"/>',{s:30});
  const style=sv('<rect x="7.500" y="3" width="12.500" height="12.500" rx="2.200" transform="rotate(10 13.700 9.200)"/><rect x="4" y="7.500" width="12.500" height="12.500" rx="2.200" transform="rotate(-8 10.200 13.700)"/>',{c:'#fff',w:1.900,s:30});
  const moon=(c,b)=>sv('<path d="M19 14.500A8 8 0 1 1 9.500 5a6.500 6.500 0 0 0 9.500 9.500z" fill="'+c+'" stroke="none"/><text x="18.500" y="9.500" text-anchor="middle" font-size="8.500" font-weight="800" fill="'+c+'" stroke="none" font-family="Helvetica,Arial,sans-serif">'+b+'</text>',{s:30});
  const dots='<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">'+[6,12,18].map(y=>[6,12,18].map(x=>'<circle cx="'+x+'" cy="'+y+'" r="1.700"/>').join('')).join('')+'</svg>';
  const flipI=sv('<path d="M20 11a8 8 0 0 0-14-4.500L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4.500L20 15M20 20v-5h-5"/>',{s:28,w:2});
  const expI=sv('<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',{s:24,w:2});
  const stage=h('div',{class:'cm-st'});
  const img=h('img',{class:'cm-img',src:'photos/cam-front.jpg',alt:''});
  const img2=h('img',{class:'cm-img',src:'photos/cam-rear.jpg',alt:'',style:'object-position:40% 50%'}), flash=h('div',{class:'cm-fl'});
  const vf=h('div',{class:'cm-vf'},img,img2,h('div',{class:'cm-grid'}),h('div',{class:'cm-lv'},h('i',{class:'a'}),h('i',{class:'b'}),h('i',{class:'c'})),flash);
  const top=h('div',{class:'cm-top'}), zm=h('div',{class:'cm-zm'}), lft=h('div',{class:'cm-b cm-l'}), thumb=h('div',{class:'cm-th'});
  const pill=h('div',{class:'cm-pill'});
  const drawPill=()=>{ pill.innerHTML=''; ['비디오','사진','인물 사진'].forEach(t=>pill.append(h('span',{class:t===mode?'on':''},t))); };
  const draw=()=>{ top.innerHTML=''; [bolt('#fff'),liveOff,style,moon('#fff',front?'2':'A')].forEach(s=>top.append(h('i',{html:s})));
    zm.innerHTML=''; img.style.display=front?'block':'none'; img2.style.display=front?'none':'block'; vf.classList.toggle('rear',!front);
    if(front) zm.append(h('b',{class:'cm-ex',html:expI}));
    else [['.5','.5'],['1','1'],['2','2'],['3','3']].forEach(z=>zm.append(h('b',{class:'cm-z'+(zoom===z[0]?' on':''),onclick:()=>{ zoom=z[0]; draw(); }},z[1]+(zoom===z[0]?'×':''))));
    lft.className='cm-b cm-l'; lft.innerHTML=sv('<path d="M16.500 3.800c-1.900-1.300-4.400-.3-4.800 2.100L9.300 18.600c-.5 2.300-2.800 3.300-4.600 2M5.800 11.200h9.200" stroke="#fff" stroke-width="2.200"/>',{s:32}); };
  const shut=h('div',{class:'cm-sh',onclick:()=>{ flash.classList.add('on'); setTimeout(()=>flash.classList.remove('on'),140); K.pickFiles(async fs=>{ for(const f of fs) await K.addPhoto(f); K.toast(fs.length+'장을 사진 앱에 저장했어요'); },true); }},h('i'));
  const flip=h('div',{class:'cm-b cm-r2',html:flipI,onclick:()=>{ front=!front; vf.classList.add('sw'); setTimeout(()=>{ draw(); vf.classList.remove('sw'); },150); }});
  stage.append(h('i',{class:'cm-dot'}),top,vf,zm,lft,shut,h('div',{class:'cm-b cm-r1',html:dots}),thumb,pill,flip);
  pg.append(stage);
  const fit=()=>{ const w=pg.clientWidth||393, hh=pg.clientHeight||852, s=w/393; stage.style.transform='scale('+s+')'; stage.style.left='0px'; stage.style.top='0px'; stage.style.height=(hh/s)+'px'; stage.style.setProperty('--d',Math.max(-170,hh/s-852)+'px'); }; fit(); setTimeout(fit,60); setTimeout(fit,400); if(window.ResizeObserver){ try{ new ResizeObserver(fit).observe(pg); }catch(e){} } window.addEventListener('resize',fit);
  draw(); drawPill();
}};

/* =================== 설정 =================== */
K.apps.settings = { mount(root,p,ctl){
  ctl.bar(true);
  const nav=K.makeNav(root); const main=K.page(); main.classList.add('ss'); const sc=h('div',{class:'scroll'}); main.append(padTop(),sc);
  const U=()=>S().ui, owner=()=>U().ownerName||D.settings.ownerName||'박성진';
  const EMAIL='briankang@gmail.com';
  const CH='<svg width="8" height="14" viewBox="0 0 8 14"><path d="M1 1l6 6-6 6" fill="none" stroke="#c4c4c9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const G=(d,o={})=>`<svg viewBox="${o.vb||'0 0 24 24'}" width="21" height="21" fill="${o.fill===undefined?'#fff':o.fill}" stroke="${o.st||'none'}" stroke-width="${o.sw||2}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const S2=(d,sw=1.9)=>G(d,{fill:'none',st:'#fff',sw});
  const BL='#007aff', GR='#8e8e93';
  const ICON={
    air:G('<path d="M21 16v-2l-8-5V3.500a1.500 1.500 0 0 0-3 0V9l-8 5v2l8-2.500V19l-2 1.500V22l3.500-1 3.500 1v-1.500L13 19v-5.500z"/>'),
    wifi:G('<path d="M12 20.5L7.76 16.26A6 6 0 0 1 16.24 16.26zM2.95 11.45A12.8 12.8 0 0 1 21.05 11.45L18.01 14.49A8.5 8.5 0 0 0 5.99 14.49zM-1.65 6.85A19.3 19.3 0 0 1 25.65 6.85L22.61 9.89A15 15 0 0 0 1.39 9.89z"/>',{vb:'-1.7 1 27.4 20'}),
    bt:S2('<path d="M7 7.500l10 9-5 4.500V3l5 4.500-10 9"/>',2),
    wall:S2('<rect x="3.500" y="4" width="17" height="16" rx="3"/><circle cx="9" cy="10" r="1.600"/><path d="m4 18 5-5 4 4 3-3 4.500 4.500"/>',1.8),
    cell:G('<circle cx="12" cy="11" r="1.700" fill="#fff"/><path d="M12 12.500V21M8.600 7.500a4.800 4.800 0 0 0 0 7M15.400 7.500a4.800 4.800 0 0 1 0 7M6 5a8.400 8.400 0 0 0 0 12M18 5a8.400 8.400 0 0 1 0 12"/>',{fill:'none',st:'#fff',sw:1.800}),
    gear:S2('<path d="M21.40 12.00 L21.30 12.49 L21.02 12.95 L20.60 13.36 L20.11 13.72 L19.63 14.04 L19.22 14.35 L18.93 14.66 L18.78 15.02 L18.76 15.45 L18.84 15.95 L18.96 16.52 L19.05 17.12 L19.05 17.71 L18.92 18.23 L18.65 18.65 L18.23 18.92 L17.71 19.05 L17.12 19.05 L16.52 18.96 L15.95 18.84 L15.45 18.76 L15.02 18.78 L14.66 18.93 L14.35 19.22 L14.04 19.63 L13.72 20.11 L13.36 20.60 L12.95 21.02 L12.49 21.30 L12.00 21.40 L11.51 21.30 L11.05 21.02 L10.64 20.60 L10.28 20.11 L9.96 19.63 L9.65 19.22 L9.34 18.93 L8.98 18.78 L8.55 18.76 L8.05 18.84 L7.48 18.96 L6.88 19.05 L6.29 19.05 L5.77 18.92 L5.35 18.65 L5.08 18.23 L4.95 17.71 L4.95 17.12 L5.04 16.52 L5.16 15.95 L5.24 15.45 L5.22 15.02 L5.07 14.66 L4.78 14.35 L4.37 14.04 L3.89 13.72 L3.40 13.36 L2.98 12.95 L2.70 12.49 L2.60 12.00 L2.70 11.51 L2.98 11.05 L3.40 10.64 L3.89 10.28 L4.37 9.96 L4.78 9.65 L5.07 9.34 L5.22 8.98 L5.24 8.55 L5.16 8.05 L5.04 7.48 L4.95 6.88 L4.95 6.29 L5.08 5.77 L5.35 5.35 L5.77 5.08 L6.29 4.95 L6.88 4.95 L7.48 5.04 L8.05 5.16 L8.55 5.24 L8.98 5.22 L9.34 5.07 L9.65 4.78 L9.96 4.37 L10.28 3.89 L10.64 3.40 L11.05 2.98 L11.51 2.70 L12.00 2.60 L12.49 2.70 L12.95 2.98 L13.36 3.40 L13.72 3.89 L14.04 4.37 L14.35 4.78 L14.66 5.07 L15.02 5.22 L15.45 5.24 L15.95 5.16 L16.52 5.04 L17.12 4.95 L17.71 4.95 L18.23 5.08 L18.65 5.35 L18.92 5.77 L19.05 6.29 L19.05 6.88 L18.96 7.48 L18.84 8.05 L18.76 8.55 L18.78 8.98 L18.93 9.34 L19.22 9.65 L19.63 9.96 L20.11 10.28 L20.60 10.64 L21.02 11.05 L21.30 11.51 L21.40 12.00Z"/>'+'<circle cx="12" cy="12" r="3.400"/>',1.700),
    moon:G('<path d="M20.500 14.500A8.500 8.500 0 1 1 9.500 3.500a6.800 6.800 0 0 0 11 11z"/>'),
    bed:S2('<path d="M3 18V7M3 14h18v4M21 14v-2.500a3 3 0 0 0-3-3h-7V14"/><circle cx="7" cy="11" r="1.500" fill="#fff"/>'),
    person:G('<circle cx="12" cy="8" r="3.600"/><path d="M5 20c0-4 3-6.500 7-6.500s7 2.500 7 6.500z"/>'),
    brief:S2('<rect x="3.500" y="7.500" width="17" height="12" rx="2.500"/><path d="M9 7.500V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.500M3.500 13h17"/>'),
    check:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007aff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.500l5 5L20 6.500"/></svg>',
    idcard:S2('<rect x="3" y="5" width="18" height="14" rx="2.500"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.800 2-2.500 3-2.500s2.500.7 3 2.500M14.500 10h3.500M14.500 13.500H18"/>'),
    shield:S2('<path d="M12 3l7 3v5c0 4.500-3 8-7 10-4-2-7-5.500-7-10V6z"/><circle cx="12" cy="10" r="1.800"/><path d="M12 12v4"/>'),
    card:S2('<rect x="3" y="6" width="18" height="12" rx="2.500"/><path d="M3 10.500h18M6.500 15h3"/>'),
    sub:S2('<path d="M20 12a8 8 0 1 1-3-6.200M20 3.500v3.500h-3.500M12 9v6M9 12h6"/>'),
    phone:S2('<rect x="7" y="3" width="10" height="18" rx="2.500"/><path d="M10.500 5.800h3"/>'),
    swup:S2('<circle cx="11" cy="13" r="3"/><path d="M11 5.500v2.300M11 18.200v2.300M3.500 13h2.300M16.200 13h2.300M5.700 7.700l1.600 1.600M14.700 16.700l1.600 1.600M16.300 7.700l-1.600 1.600M7.300 16.700l-1.600 1.600"/><circle cx="18" cy="6" r="2" fill="#fff"/>',1.800),
    drive:S2('<path d="M4 13l2.500-6.500a2 2 0 0 1 1.900-1.300h7.200a2 2 0 0 1 1.900 1.300L20 13"/><rect x="3.500" y="13" width="17" height="6" rx="2.500"/><circle cx="16.500" cy="16" r=".9" fill="#fff"/>',1.800),
    apple:'<svg viewBox="0 0 24 24" width="22" height="22" fill="#ff3b30"><path d="M16.300 12.800c0-2.300 1.900-3.400 2-3.500-1.100-1.600-2.800-1.800-3.400-1.800-1.400-.1-2.800.9-3.500.9s-1.800-.8-3-.8C6.800 7.700 5.400 8.600 4.600 10c-1.600 2.800-.4 6.900 1.100 9.100.8 1.100 1.700 2.300 2.900 2.300 1.200 0 1.600-.7 3-.7s1.800.7 3 .7c1.300 0 2.100-1.100 2.800-2.200.9-1.300 1.200-2.500 1.300-2.600-.1 0-2.400-.9-2.400-3.800zM14 5.800c.6-.8 1.100-1.800.9-2.900-.9 0-2 .6-2.700 1.400-.6.700-1.100 1.800-.9 2.800 1 .1 2.100-.5 2.700-1.300z"/></svg>',
    airdrop:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2a7ae8" stroke-width="1.900" stroke-linecap="round"><circle cx="12" cy="12.500" r="1.800" fill="#2a7ae8"/><path d="M8.500 9a5 5 0 0 0 0 7M15.500 9a5 5 0 0 1 0 7M5.800 6.500a8.800 8.800 0 0 0 0 12M18.200 6.500a8.800 8.800 0 0 1 0 12"/></svg>',
    airplay:S2('<rect x="3.500" y="4.500" width="17" height="11" rx="2"/><path d="M12 14.500l4 5H8z" fill="#fff"/>',1.800),
    pip:S2('<rect x="3" y="5" width="18" height="14" rx="2.500"/><rect x="11" y="11" width="8" height="6" rx="1.500" fill="#fff"/>',1.800),
    capture:S2('<path d="M4 8V6.500A2.500 2.500 0 0 1 6.500 4H8M16 4h1.500A2.500 2.500 0 0 1 20 6.500V8M20 16v1.500a2.500 2.500 0 0 1-2.500 2.500H16M8 20H6.500A2.500 2.500 0 0 1 4 17.500V16"/><circle cx="12" cy="12" r="3"/>',1.900),
    carplay:G('<circle cx="12" cy="12" r="8.500" fill="none" stroke="#fff" stroke-width="2"/><path d="M10.200 8.500v7l5.500-3.500z"/>'),
    cal:S2('<rect x="3.500" y="5" width="17" height="15" rx="2.500"/><path d="M3.500 9.500h17M8 3v4M16 3v4"/><circle cx="17" cy="16.500" r="3.200" fill="#007aff" stroke="#fff"/><path d="M17 15v1.700l1.100.7" stroke-width="1.400"/>',1.800),
    bgref:S2('<path d="M19 12a7 7 0 1 1-2.300-5.200M19 4.500V8h-3.500"/>',2),
    dict:S2('<path d="M6 4h11a1.500 1.500 0 0 1 1.500 1.500v14H7.500A1.500 1.500 0 0 1 6 18z"/><path d="M9.500 8.500h5M9.500 11.500h5"/>',1.800),
    font:'<svg viewBox="0 0 24 24" width="24" height="24"><text x="12" y="17" text-anchor="middle" font-size="14" font-weight="500" fill="#fff" font-family="-apple-system,Helvetica,Arial,sans-serif">Aa</text></svg>',
    globe:S2('<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c2.500 2.500 3.500 5.500 3.500 8.500s-1 6-3.500 8.500c-2.500-2.500-3.500-5.500-3.500-8.500s1-6 3.500-8.500z"/>',1.700),
    key:S2('<circle cx="12" cy="7" r="3"/><path d="M12 10v6.500M12 13.500h2.500M12 16.500h2"/><circle cx="7" cy="19.500" r=".8" fill="#fff"/><circle cx="12" cy="19.500" r=".8" fill="#fff"/><circle cx="17" cy="19.500" r=".8" fill="#fff"/>',1.800),
    kbd:S2('<rect x="2.500" y="6.500" width="19" height="11" rx="2.500"/><path d="M6 10h.01M9.500 10h.01M13 10h.01M16.500 10h.01M7 14h10"/>',2),
    tv:S2('<path d="M5 8h4V5M19 16h-4v3M5 12.500h8a2.500 2.500 0 0 1 0 5H8"/><path d="M5 8c0 0 .5 0 1 0"/>',1.900),
    legal:S2('<rect x="5" y="3.500" width="14" height="17" rx="2.500"/><path d="M9 14.500h6M9 17h4"/><path d="M9.500 9l1.800 1.800L14.800 7.500" />',1.800),
    reset:S2('<path d="M4.500 12a7.500 7.500 0 1 0 2.300-5.400M4.500 4.500V8H8"/>',2),
    notif:S2('<path d="M6 17h12l-1.500-2V11a4.500 4.500 0 0 0-9 0v4zM10 20a2 2 0 0 0 4 0"/>',1.900),
    sound:S2('<path d="M4 9.500h3.500L12 5.500v13l-4.500-4H4z" fill="#fff"/><path d="M15.500 9a4 4 0 0 1 0 6M18.300 6.500a8 8 0 0 1 0 11"/>',1.800),
    disp:S2('<circle cx="12" cy="12" r="4"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M18.400 5.600l-1.800 1.800M7.400 16.600l-1.800 1.800"/>',1.800),
    batt:S2('<rect x="3" y="7.500" width="16" height="9" rx="2.500"/><path d="M21 10.500v3"/><rect x="5" y="9.500" width="6" height="5" rx="1" fill="#fff"/>',1.800),
    lockw:S2('<rect x="5" y="10.500" width="14" height="10" rx="2.500"/><path d="M8 10.500V8a4 4 0 0 1 8 0v2.500"/>',1.900)
  };
  const ic=(k,bg,white)=>h('div',{class:'ssi'+(white?' wh':''),style:'background:'+bg,html:ICON[k]});
  const tg=(key,after)=>{ const t=h('div',{class:'tg'+(U()[key]?' on':'')}); t.onclick=e=>{ e.stopPropagation(); U()[key]=!U()[key]; t.classList.toggle('on'); K.save(); K.refreshStatus&&K.refreshStatus(); after&&after(U()[key]); }; return t; };
  const row=(icon,label,val,fn,cls)=>h('div',{class:'ssr'+(fn?' go':'')+(cls?' '+cls:''),onclick:fn||null},icon||null,h('div',{class:'ssl'},label),val===undefined?null:h('div',{class:'ssv'},val),(fn||fn===null)?h('i',{class:'ssc',html:CH}):null);
  const card=(...rows)=>h('div',{class:'ssg'+(rows.some(r=>r&&r.querySelector&&r.querySelector('.ssi'))?' ic':'')},...rows);
  const wifiName=()=>U().wifi?'mangwon_rem_1704':'꺼짐';
  const note=t=>h('div',{class:'ssn'},t);
  const head=t=>h('div',{class:'ssh'},t);
  const simple=(label,val)=>row(null,label,val);
  /* 하위 화면: 왼쪽 위 둥근 뒤로가기 버튼. hd = {k, bg, desc} 이면 큰 아이콘 머리말 카드가 붙어요 */
  function sub(title,build,hd){
    const pg=K.page(); pg.classList.add('ss'); const s2=h('div',{class:'scroll'});
    const tb=h('div',{class:'sstb'+(hd?' hid':'')},title);
    const bk=h('button',{class:'ssbk',onclick:()=>nav.pop(),html:'<svg viewBox="0 0 12 20" width="12" height="20"><path d="M10 2 2 10l8 8" fill="none" stroke="#111" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg>'});
    pg.append(padTop(),tb,bk,s2);
    s2.append(h('div',{style:'height:'+(hd?'88':'64')+'px'}));
    if(hd) s2.append(h('div',{class:'ssg sshd'},h('div',{class:'ssi big',style:'background:'+hd.bg,html:ICON[hd.k]}),h('b',{},title),h('p',{},hd.desc||''),...(hd.extra||[])));
    if(hd) s2.addEventListener('scroll',()=>tb.classList.toggle('hid',s2.scrollTop<110));
    build(s2); s2.append(h('div',{style:'height:100px'})); nav.push(pg);
  }
  const generic=(title,k,bg,desc,white)=>()=>sub(title,s=>{ },{k,bg,desc});
  /* ---- Apple 계정 ---- */
  const WPG=id=>`<linearGradient id="${id}" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#cfe9ff"/><stop offset=".35" stop-color="#5aa6ea"/><stop offset=".7" stop-color="#2d62c4"/><stop offset="1" stop-color="#16367f"/></linearGradient><radialGradient id="${id}h" cx=".3" cy=".18" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
  const phoneImg=`<svg viewBox="0 0 36 72" width="23" height="46"><defs><linearGradient id="pbd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d5d7dc"/><stop offset=".5" stop-color="#9da1a9"/><stop offset="1" stop-color="#c3c6cc"/></linearGradient>${WPG('pw')}</defs>
    <rect x="0.300" y="14" width="1" height="4" rx=".5" fill="#8b8f97"/><rect x="0.300" y="20" width="1" height="7" rx=".5" fill="#8b8f97"/><rect x="0.300" y="29" width="1" height="7" rx=".5" fill="#8b8f97"/><rect x="34.700" y="23" width="1" height="11" rx=".5" fill="#8b8f97"/>
    <rect x="1.200" y="1" width="33.600" height="70" rx="8" fill="url(#pbd)"/><rect x="2.100" y="1.900" width="31.800" height="68.200" rx="7.200" fill="#050506"/>
    <rect x="2.900" y="2.700" width="30.200" height="66.600" rx="6.500" fill="url(#pw)"/><rect x="2.900" y="2.700" width="30.200" height="66.600" rx="6.500" fill="url(#pwh)"/>
    <rect x="12.500" y="5.200" width="11" height="3.200" rx="1.600" fill="#000"/></svg>`;
  const padImg=`<svg viewBox="0 0 56 72" width="36" height="46"><defs><linearGradient id="ibd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dfe2e8"/><stop offset=".5" stop-color="#b3b8c1"/><stop offset="1" stop-color="#d3d6dc"/></linearGradient>${WPG('iw')}</defs>
    <rect x="40" y="0.300" width="7" height="1" rx=".5" fill="#a4a9b2"/><rect x="55" y="12" width="1" height="8" rx=".5" fill="#a4a9b2"/>
    <rect x="1" y="1.200" width="54" height="69.600" rx="6.500" fill="url(#ibd)"/><rect x="1.900" y="2.100" width="52.200" height="67.800" rx="5.700" fill="#050506"/>
    <rect x="4" y="4.200" width="48" height="63.600" rx="3.200" fill="url(#iw)"/><rect x="4" y="4.200" width="48" height="63.600" rx="3.200" fill="url(#iwh)"/>
    <circle cx="28" cy="3.100" r=".6" fill="#1b1d22"/></svg>`;
  const devRow=(img,name,model,fn)=>h('div',{class:'ssr go dev',onclick:fn},h('div',{class:'dimg',html:img}),h('div',{class:'dtx'},h('b',{},name),h('small',{},model)),h('i',{class:'ssc',html:CH}));
  const devPage=(name,model)=>()=>sub(name,s=>{ s.append(card(simple('이름',name),simple('모델',model))); });
  const pAccount=()=>sub('Apple 계정',s=>{
    s.querySelector('div').style.height='96px';
    s.append(h('div',{class:'ssav'},h('div',{class:'pbig'},[...owner()][0]||'강'),h('b',{},owner()),h('small',{},EMAIL)),
      card(row(ic('idcard',GR),'개인정보',undefined,null),
           row(ic('shield',GR),'로그인 및 보안',undefined,null),
           row(ic('card',GR),'결제 및 배송','SHINHYUN',null),
           row(ic('sub',GR),'구독',undefined,null)),
      card(devRow(phoneImg,owner()+'의 iPhone','이 iPhone',devPage(owner()+'의 iPhone','이 iPhone')),
           devRow(padImg,owner()+'의 iPad','iPad Air',devPage(owner()+'의 iPad','iPad Air'))));
  });
  /* ---- Wi-Fi ---- */
  const pWifi=()=>sub('Wi-Fi',s=>{
    const box=h('div'); 
    const draw=()=>{ box.innerHTML=''; box.append(
      card(h('div',{class:'ssr'},h('div',{class:'ssl'},'Wi-Fi'),tg('wifi',()=>{ draw(); const v=main.querySelector('[data-k="wifi"]'); if(v) v.textContent=wifiName(); }))),
      ...(U().wifi?[head('네트워크'),card(h('div',{class:'ssr'},h('i',{class:'ssck',html:ICON.check}),h('div',{class:'ssl'},'mangwon_rem_1704'),h('div',{class:'ssv ic2 wfi',html:'<svg viewBox="0 0 24 24" width="15" height="15" fill="#3c3c43" fill-opacity=".62"><path d="M7 10V8a5 5 0 0 1 10 0v2h.500A1.500 1.500 0 0 1 19 11.500v8a1.500 1.500 0 0 1-1.500 1.500h-11A1.500 1.500 0 0 1 5 19.500v-8A1.500 1.500 0 0 1 6.500 10zm2 0h6V8a3 3 0 0 0-6 0z"/></svg><img src="photos/fav/wifi-gray.png" width="19" height="16" style="display:block">'}),infoBtn(()=>{})),row(null,'다른 네트워크…',undefined)),note('알려진 네트워크에 자동으로 연결됩니다.')]:[note('Wi-Fi를 켜면 근처 네트워크를 찾아 연결합니다.')])); };
    draw(); s.append(box);
  });
  /* ---- Bluetooth ---- */
  const infoBtn=fn=>h('i',{class:'ssinfo',onclick:e=>{e.stopPropagation();fn&&fn();},html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#3b82f6" stroke-width="1.700"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="7.500" r="1.100" fill="#3b82f6" stroke="none"/><path d="M12 11v6" stroke-linecap="round" stroke-width="2"/></svg>'});
  /* BMW X7 m60i 를 누르면 연결된 것처럼 music/bmw.mp3 가 재생돼요 (다시 누르면 연결 해제, 소리 멈춤) */
  const bmwAudio=()=>{ if(!K._bmwA){ K._bmwA=new Audio('music/bmw.mp3'); K._bmwA.preload='auto'; K._bmwA.addEventListener('ended',()=>{ K._bmwOn=false; K.refreshStatus(); document.querySelectorAll('.ssv[data-bmw]').forEach(e=>e.textContent='연결 안 됨'); }); } return K._bmwA; };
  const btDev=n=>{ const isCar=n==='BMW X7 m60i'; const val=h('div',{class:'ssv'},isCar&&K._bmwOn?'연결됨':'연결 안 됨'); if(isCar) val.setAttribute('data-bmw','1');
    const r=h('div',{class:'ssr',style:isCar?'cursor:pointer':''},h('div',{class:'ssl'},n),val,infoBtn(()=>sub(n,s=>{ s.append(card(simple('이름',n)),card(row(null,'이 기기 지우기',undefined,null,'red'))); })));
    if(isCar) r.addEventListener('click',e=>{ if(e.target.closest('button')||e.target.closest('.info')) return; const au=bmwAudio(); K._bmwOn=!K._bmwOn; val.textContent=K._bmwOn?'연결됨':'연결 안 됨'; K.refreshStatus(); if(K._bmwOn){ au.currentTime=0; au.play().catch(()=>{ K._bmwOn=false; val.textContent='연결 안 됨'; K.refreshStatus(); }); } else au.pause(); });
    return r; };
  const pBt=()=>sub('Bluetooth',s=>{
    const box=h('div'); const draw=()=>{ box.innerHTML=''; box.append(
      note(U().bt?`이 iPhone은 Bluetooth 설정이 열려 있는 동안 '${owner()}'(으)로 인식 가능합니다.`:'Bluetooth를 켜면 근처 기기와 연결할 수 있습니다.'),
      ...(U().bt?[head('나의 기기'),card(btDev('BMW X7 m60i'),btDev(owner()+'의 AirPods Pro'))]:[])); };
    const t=tg('bt',()=>{ draw(); const v=main.querySelector('[data-k="bt"]'); if(v) v.textContent=U().bt?'켬':'끔'; });
    const hdrCard=s.querySelector('.sshd'); hdrCard.append(h('div',{class:'ssline'}),h('div',{class:'ssr tgr'},h('div',{class:'ssl'},'Bluetooth'),t));
    draw(); s.append(box);
  },{k:'bt',bg:'linear-gradient(#5aa7f7,#1f6fe0)',desc:'음악 스트리밍, 전화 통화 및 게임과 같은 활동에 사용할 수 있는 액세서리에 연결하십시오. 더 알아보기…'});
  /* ---- 셀룰러 ---- */
  const pCell=()=>sub('셀룰러',s=>{
    s.append(card(h('div',{class:'ssr'},h('div',{class:'ssl'},'셀룰러 데이터'),tg('cell',()=>{ const v=main.querySelector('[data-k="cell"]'); if(v) v.textContent=''; }))),
      card(simple('통신사','OneToTen'),h('div',{class:'ssr'},h('div',{class:'ssl'},'데이터 로밍'),h('div',{class:'tg'}))),
      note('셀룰러 데이터를 끄면 Wi-Fi로만 인터넷을 사용합니다.'));
    const tgr=s.querySelectorAll('.tg')[1]; if(tgr) tgr.onclick=e=>{ e.stopPropagation(); tgr.classList.toggle('on'); };
  });
  /* ---- 일반 ---- */
  const A=(title,k,bg,desc,white)=>({title,k,bg,white,desc,fn:generic(title,k,bg,desc)});
  const pWall=()=>sub('배경화면',s=>{
    s.parentNode.classList.add('wpd2');
    const list=K.wallList(); let cur=K.wallIdx();
    const n=K.now(), tm=K.hm(+n).replace(/^(오전|오후) /,''), dt=(n.getMonth()+1)+'월 '+n.getDate()+'일 ('+K.DOW[n.getDay()]+')';
    const mini=()=>{ const lw=U().lockWidgets||{}, W=K.D.weather, box=h('div',{class:'wmw'});
      K.lwOrder(lw).forEach(k=>{ if(k==='weather'&&W) box.append(h('div',{class:'wmx'},h('b',{},W.temp+'°'),h('span',{},W.cond==='맑음'?'청명함':W.cond),h('span',{},'최고:'+W.hi+'° 최저:'+W.lo+'°')));
        if(k==='calendar'){ const ft=K.D.settings.fixedToday, t=ft?new Date(+ft.slice(0,4),+ft.slice(5,7)-1,+ft.slice(8,10)):new Date(); const st=new Date(t.getFullYear(),t.getMonth(),t.getDate()-t.getDay()); const g=h('div',{class:'wmc'}); '일월화수목금토'.split('').forEach(d=>g.append(h('i',{},d)));
          for(let q=0;q<21;q++){ const d=new Date(st.getFullYear(),st.getMonth(),st.getDate()+q); g.append(h('i',{class:d.getTime()===t.getTime()?'td':''},String(d.getDate()))); } box.append(g); } });
      return box; };
    const slides=list.map((w,i)=>{
      const cz=()=>K.wallEdit({idx:i,cz:true});
      const lk=h('div',{class:'wpc2 lk'},h('div',{class:'wd2'},dt),h('div',{class:'wt2'},tm),mini(),h('button',{class:'wcz',onclick:cz},'사용자화')); lk.style.backgroundImage=`url(${w.lock})`;
      const hm=h('div',{class:'wpc2 hm'},h('div',{class:'wbg',style:`background-image:url(${w.home||w.lock})`}),h('div',{class:'wic'},h('b'),h('b'),h('i'),h('i'),h('i'),h('i')),h('button',{class:'wcz',onclick:cz},'사용자화'));
      const lab=h('div',{class:'wpl2'}); const upd=()=>{ lab.innerHTML=''; if(i===cur) lab.append(h('span',{class:'cur'},'현재 배경화면')); else lab.append(h('button',{onclick:()=>{ cur=i; K.setWall(i); slides.forEach(x=>x.upd()); K.toast&&K.toast('배경화면이 변경되었습니다'); }},'현재 배경화면으로 설정')); };
      upd(); const el=h('div',{class:'wps2'},lab,h('div',{class:'wpp2'},lk,hm)); el.upd=upd; return el; });
    const track=h('div',{class:'wptrack2'},...slides), dots=h('div',{class:'wpdots2'},...list.map((_,i)=>h('i',{class:i===cur?'on':'',onclick:()=>track.scrollTo({left:i*track.clientWidth,behavior:'smooth'})})));
    track.addEventListener('scroll',()=>{ const k=Math.round(track.scrollLeft/track.clientWidth); [...dots.children].forEach((d,j)=>d.classList.toggle('on',j===k)); });
    const info=h('div',{class:'wpinfo'},h('div',{},h('b',{},'잠금 화면에서 배경화면 변경'),h('p',{},'각기 다른 배경화면과 위젯 간에 전환하거나, 추가 또는 편집하려면 잠금 화면에서 배경화면을 길게 터치하십시오.')),h('div',{class:'wpmini'},'9:41'));
    const reset=h('button',{class:'wpreset',onclick:()=>{ K.setWall(null); cur=K.wallIdx(); slides.forEach(x=>x.upd()); [...dots.children].forEach((d,j)=>d.classList.toggle('on',j===cur)); track.scrollTo({left:cur*track.clientWidth,behavior:'smooth'}); K.toast&&K.toast('기본 배경화면으로 되돌렸습니다'); }},'기본 배경화면 설정으로 되돌리기');
    s.append(h('div',{class:'wpcard2'},track,dots), info, reset);
    setTimeout(()=>{ track.style.scrollBehavior='auto'; track.scrollLeft=cur*track.clientWidth; track.style.scrollBehavior=''; },30);
  });
  const pInfo=()=>sub('정보',s=>{ s.append(card(simple('이름',owner()+'의 iPhone'))); });
  const R=(title,k,bg,white,fn)=>fn?row(ic(k,bg,white),title,undefined,fn):h('div',{class:'ssr'},ic(k,bg,white),h('div',{class:'ssl'},title),h('i',{class:'ssc',html:CH}));
  const pGeneral=()=>sub('일반',s=>{
    s.append(
      card(R('정보','phone',GR,false,pInfo),R('소프트웨어 업데이트','swup',GR),R('iPhone 저장 공간','drive',GR)),
      card(R('AppleCare 및 보증','apple','#fff',true)),
      card(R('AirDrop','airdrop','#fff',true),R('AirPlay 및 연속성','airplay',BL),R('화면 속 화면','pip','#000'),R('화면 캡처','capture',GR),R('CarPlay','carplay','#34c759')),
      card(R('날짜 및 시간','cal',BL),R('백그라운드 앱 새로 고침','bgref',GR),R('사전','dict',BL),R('서체','font',GR),R('언어 및 지역','globe',BL),R('자동 완성 및 암호','key',GR),R('키보드','kbd',GR)),
      card(R('TV 제공업체','tv','#000')),
      card(R('VPN 및 기기 관리','gear',GR)),
      card(R('법률 및 규제 정보','legal',GR)),
      card(R('전송 또는 iPhone 재설정','reset',GR)),
      card(h('div',{class:'ssr blue'},h('div',{class:'ssl'},'시스템 종료'))));
  },{k:'gear',bg:'linear-gradient(#a3a3a8,#78787d)',desc:'소프트웨어 업데이트, 기기 언어, CarPlay, AirDrop 등 iPhone에서 사용할 전반적인 설정 및 선호 사항을 관리합니다.'});
  /* ---- 집중 모드 ---- */
  const FOC=[['방해 금지','moon','#5e5ce6'],['수면','bed','#32ade6'],['개인 시간','person','#af52de'],['업무','brief','#32ade6']];
  const pFocus=()=>sub('집중 모드',s=>{
    U().focus=U().focus||{};
    const isOn=n=>n==='방해 금지'?!!U().doNotDisturb:!!U().focus[n];
    const rows=FOC.map(([n,k,bg])=>{ const v=h('div',{class:'ssv'},isOn(n)?'켬':'꺼짐'); const r=h('div',{class:'ssr go',onclick:()=>{ if(n==='방해 금지') K.sysSet('doNotDisturb',!U().doNotDisturb); else { U().focus[n]=!U().focus[n]; K.save(); K.refreshStatus(); K.refreshLock(); } v.textContent=isOn(n)?'켬':'꺼짐'; const mv=main.querySelector('[data-k="focus"]'); if(mv) mv.textContent=vf(); },},ic(k,bg),h('div',{class:'ssl'},n),v);
      K._sysL.push(()=>{ if(!r.isConnected) return false; v.textContent=isOn(n)?'켬':'꺼짐'; }); return r; });
    s.append(card(...rows),note('집중 모드를 눌러 켜고 끌 수 있어요.'));
  });
  /* ---- 시스템 기능: 알림 / 사운드 / 디스플레이 / 배터리 / 잠금 화면 (제어 센터와 같은 상태를 써요) ---- */
  const bindSys=(el,fn)=>{ K._sysL.push(k=>{ if(!el.isConnected) return false; fn(k); }); return el; };
  const stg=(key,after)=>{ const t=h('div',{class:'tg'+(U()[key]?' on':'')}); t.onclick=e=>{ e.stopPropagation(); K.sysSet(key,!U()[key]); after&&after(U()[key]); }; return bindSys(t,()=>t.classList.toggle('on',!!U()[key])); };
  const wtg=key=>{ const t=h('div',{class:'tg'+((U().lockWidgets||{})[key]?' on':'')}); t.onclick=e=>{ e.stopPropagation(); K.sysSet('lockWidgets',{[key]:!U().lockWidgets[key]}); }; return bindSys(t,()=>t.classList.toggle('on',!!U().lockWidgets[key])); };
  const rng=(min,max,get,live,commit,fmt)=>{ const inp=h('input',{type:'range',min:String(min),max:String(max),value:String(Math.round(get()*100))}); const em=h('em',{},fmt(get()));
    inp.oninput=()=>{ const v=(+inp.value)/100; em.textContent=fmt(v); live&&live(v); };
    inp.onchange=()=>commit((+inp.value)/100);
    bindSys(inp,()=>{ inp.value=String(Math.round(get()*100)); em.textContent=fmt(get()); });
    return h('div',{class:'ssrng'},inp,em); };
  const pNotif=()=>sub('알림',s=>{
    const OPT=[['always','항상'],['unlocked','잠금 해제 시'],['never','안 함']];
    const rows=OPT.map(([k,t])=>{ const r=h('div',{class:'ssr go',onclick:()=>K.sysSet('notificationPreview',k)},h('div',{class:'ssl'},t),h('div',{class:'ssv',style:'margin-left:auto'},''));
      const mark=()=>{ r.lastChild.innerHTML=U().notificationPreview===k?ICON.check:''; }; mark(); bindSys(r,mark); return r; });
    s.append(head('미리보기 표시'),card(...rows),note('항상: 잠금 화면과 알림 센터에 제목과 내용을 보여줘요.\n잠금 해제 시: 잠금 화면에서는 내용을 숨기고, 잠금을 해제한 뒤 알림 센터에서 보여줘요.\n안 함: 앱 이름만 보여줘요. 알림 자체는 지워지지 않아요.'));
  });
  const pSound=()=>sub('사운드 및 햅틱',s=>{
    s.append(card(h('div',{class:'ssr'},h('div',{class:'ssl'},'무음 모드'),stg('silent'))),note('무음 모드를 켜면 알림 소리가 나지 않아요. 알림 배너는 그대로 보여요. 전화 벨소리와 통화 소리는 따로 동작해요.'),
      head('알림음 음량'),card(rng(0,100,()=>U().volume,v=>{ U().volume=v; K.applyVolume(); },v=>K.sysSet('volume',v),v=>Math.round(v*100)+'%')),note('음량을 0으로 줄이는 것과 무음 모드는 서로 다른 설정이에요.'));
  });
  const pDisp=()=>sub('디스플레이 및 밝기',s=>{
    s.append(head('밝기'),card(rng(15,100,()=>U().brightness,v=>K.dim(v),v=>K.sysSet('brightness',v),v=>Math.round(v*100)+'%')),note('제어 센터의 밝기 슬라이더와 같은 값이에요.'));
  });
  const pBatt=()=>sub('배터리',s=>{
    s.append(card(h('div',{class:'ssr'},h('div',{class:'ssl'},'저전력 모드'),stg('lowPower'))),note('저전력 모드를 켜면 상태 표시줄의 배터리가 노란색으로 바뀌어요. 이 폰 안에서만 작동하는 표시예요.'),
      head('배터리 잔량'),card(rng(1,100,()=>U().batteryLevel/100,null,v=>K.sysSet('batteryLevel',Math.max(1,Math.round(v*100))),v=>Math.round(v*100)+'%')),note('잔량은 직접 조절할 때만 바뀌어요. 20% 이하로 낮추면 저전력 모드를 켤지 물어봐요.'));
  });
  /* ---- 첫 화면 ---- */
  const vf=()=>(U().doNotDisturb||Object.values(U().focus||{}).some(Boolean))?'켬':'';
  const mk=(k,txt)=>h('span',{'data-k':k},txt);
  sc.append(h('div',{class:'sslarge'},'설정'),
    h('div',{class:'ssg prof'},
      h('div',{class:'ssr go pr',onclick:pAccount},h('div',{class:'pbig'},[...owner()][0]||'강'),h('div',{class:'prt'},h('b',{},owner()),h('small',{},'Apple 계정, iCloud+ 등')),h('i',{class:'ssc',html:CH}))),
    h('div',{class:'ssg ic'},
      h('div',{class:'ssr'},ic('air','#ff9500'),h('div',{class:'ssl'},'에어플레인 모드'),tg('airplane')),
      h('div',{class:'ssr go',onclick:pWifi},ic('wifi','#007aff'),h('div',{class:'ssl'},'Wi-Fi'),h('div',{class:'ssv'},mk('wifi',wifiName())),h('i',{class:'ssc',html:CH})),
      h('div',{class:'ssr go',onclick:pBt},ic('bt','#007aff'),h('div',{class:'ssl'},'Bluetooth'),h('div',{class:'ssv'},mk('bt',U().bt?'켬':'끔')),h('i',{class:'ssc',html:CH})),
      h('div',{class:'ssr go',onclick:pCell},ic('cell','#34c759'),h('div',{class:'ssl'},'셀룰러'),h('div',{class:'ssv'},mk('cell','')),h('i',{class:'ssc',html:CH}))),
    h('div',{class:'ssg ic'},
      h('div',{class:'ssr go',onclick:pWall},ic('wall','#32ade6'),h('div',{class:'ssl'},'배경화면'),h('i',{class:'ssc',html:CH})),
      h('div',{class:'ssr go',onclick:pGeneral},ic('gear','#8e8e93'),h('div',{class:'ssl'},'일반'),h('i',{class:'ssc',html:CH})),
      h('div',{class:'ssr go',onclick:pFocus},ic('moon','#5e5ce6'),h('div',{class:'ssl'},'집중 모드'),h('div',{class:'ssv'},mk('focus',vf())),h('i',{class:'ssc',html:CH}))),
    h('div',{class:'ssg ic'},
      h('div',{class:'ssr go',onclick:pNotif},ic('notif','#ff3b30'),h('div',{class:'ssl'},'알림'),h('i',{class:'ssc',html:CH})),
      h('div',{class:'ssr go',onclick:pSound},ic('sound','#ff2d55'),h('div',{class:'ssl'},'사운드 및 햅틱'),h('i',{class:'ssc',html:CH})),
      h('div',{class:'ssr go',onclick:pDisp},ic('disp','#007aff'),h('div',{class:'ssl'},'디스플레이 및 밝기'),h('i',{class:'ssc',html:CH})),
      h('div',{class:'ssr go',onclick:pBatt},ic('batt','#34c759'),h('div',{class:'ssl'},'배터리'),h('i',{class:'ssc',html:CH}))),
    h('div',{style:'height:130px'}));
  main.append(h('div',{class:'sssr'},h('span',{html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6b6b70" stroke-width="2.400" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500 21 21"/></svg>'}),h('input',{placeholder:'검색'}),h('span',{html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3a3a3c" stroke-width="2.100" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="#3a3a3c"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21"/></svg>'})));
  nav.push(main);
}};

/* =================== 음악 =================== */
K.music = { i:0, playing:false, t:0 };
K.askLink = link => K.alert('강영현 버전을 들으시겠습니까?','',[{t:'아니요'},{t:'예',fn:()=>window.open(link,'_blank','noopener')}]);
K.togglePlay = function(){ const t=(K.allTracks||[])[K.music.i]; if(t&&t.link){ K.askLink(t.link); return; } K.music.playing=!K.music.playing; };
K.allTracks = [...D.playlist.tracks, ...(D.singles||[])];
K.dur = t => { const m=String((t&&t.d)||'').match(/^(\d+):(\d\d)$/); return m?(+m[1])*60+(+m[2]):200; };
K.mmss = s => { s=Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };

K.apps.music = { mount(root,p,ctl){
  ctl.bar(true);
  const pg=K.page(); pg.classList.add('mu'); root.append(pg);
  const pl=D.playlist, sc=h('div',{class:'scroll'}), np=h('div',{class:'np'});
  const mtabs=h('div',{class:'mtabs'},[['홈','M3 11l9-7 9 7v9H3z'],['신규','M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],['라디오','M5 12a7 7 0 0 1 14 0M8 12a4 4 0 0 1 8 0M12 12v8'],['보관함','M9 18V5l11-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z'],['검색','M10 3a7 7 0 1 0 4.200 12.600L20 21.500 21.500 20l-5.900-5.800A7 7 0 0 0 10 3z']].map(([n,d])=>h('div',{class:n==='보관함'?'on':''},h('span',{html:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`}),n)));
  pg.append(padTop(),sc,np,mtabs);
  const all=K.allTracks, N=pl.tracks.length; let view='home';
  const btn='flex:1;background:#f2f2f7;color:#fa2d48;border-radius:10px;padding:11px;font-weight:600';
  const cover=(sz)=>h('div',{style:`width:${sz}px;height:${sz}px;border-radius:${sz>60?10:8}px;background:linear-gradient(135deg,#ff9a7a,#ff5f8a 55%,#8a5cff);display:flex;align-items:center;justify-content:center;color:#fff;font-size:${Math.round(sz*.45)}px;flex:none`},'♫');
  function mini(){
    const t=all[K.music.i]||all[0];
    np.innerHTML=''; np.append(h('div',{class:'mini'},'♫'),h('div',{style:'flex:1;min-width:0'},h('b',{style:'font-weight:500'},t.t),h('div',{style:'font-size:12px;color:#8e8e93'},t.a)),h('button',{style:'font-size:22px',onclick:()=>{K.togglePlay();render();}},K.music.playing?'⏸':'▶︎'),h('button',{style:'font-size:22px',onclick:()=>{K.music.i=(K.music.i+1)%all.length;K.music.t=0;render();}},'⏭'));
  }
  function render(){
    sc.innerHTML='';
    if(view==='home'){
      sc.append(h('div',{style:'display:flex;justify-content:space-between;align-items:flex-end;padding:6px 16px 12px'},h('span',{style:'font-size:32px;font-weight:700'},'보관함'),h('span',{style:'color:#fa2d48;font-size:17px;padding-bottom:4px'},'편집')));
      sc.append(h('div',{style:'font-size:13px;font-weight:600;color:#8e8e93;padding:4px 16px 6px'},'플레이리스트'));
      sc.append(h('div',{style:'display:flex;gap:12px;align-items:center;padding:8px 16px;cursor:pointer',onclick:()=>{view='list';render();}},cover(56),h('div',{style:'flex:1'},h('div',{style:'font-size:17px;font-weight:500'},pl.name),h('div',{style:'font-size:13px;color:#8e8e93;margin-top:2px'},N+'곡')),h('div',{style:'color:#c7c7cc;font-size:20px'},'›')));
      (D.viewOnlyPlaylists||[]).forEach((vp,k)=>sc.append(h('div',{style:'display:flex;gap:12px;align-items:center;padding:8px 16px;cursor:pointer',onclick:()=>{view='vp'+k;render();}},cover(56),h('div',{style:'flex:1'},h('div',{style:'font-size:17px;font-weight:500'},vp.name),h('div',{style:'font-size:13px;color:#8e8e93;margin-top:2px'},(vp.tracks||[]).length+'곡')),h('div',{style:'color:#c7c7cc;font-size:20px'},'›'))));
      if((D.singles||[]).length) sc.append(h('div',{style:'font-size:13px;font-weight:600;color:#8e8e93;padding:18px 16px 6px'},'노래'));
      (D.singles||[]).forEach((t,j)=>{ const i=N+j, on=K.music.i===i;
        sc.append(h('div',{style:'display:flex;gap:12px;align-items:center;padding:8px 16px;cursor:pointer',onclick:()=>{K.music.i=i;K.music.playing=true;K.music.t=0;render();}},cover(48),h('div',{style:'flex:1;min-width:0'},h('div',{style:'font-size:16px;font-weight:500;color:'+(on?'#fa2d48':'#000')},t.t),h('div',{style:'font-size:13px;color:#8e8e93;margin-top:2px'},t.a)),h('div',{style:'color:#fa2d48;font-size:18px'},on&&K.music.playing?'♪':''))); });
      sc.append(botPad());
    } else if(String(view).startsWith('vp')){
      const vp=(D.viewOnlyPlaylists||[])[+view.slice(2)]||{name:'',tracks:[]};
      sc.append(h('button',{style:'color:#fa2d48;font-size:17px;padding:2px 16px 8px',onclick:()=>{view='home';render();}},'‹ 보관함'));
      sc.append(h('div',{class:'pl'},h('div',{class:'cover'},'♫'),h('div',{},h('div',{style:'font-size:22px;font-weight:700'},vp.name),h('div',{style:'color:#fa2d48;font-size:15px;margin-top:2px'},S().ui.ownerName),h('div',{style:'color:#8e8e93;font-size:13px;margin-top:4px'},vp.desc||''))));
      vp.tracks.forEach((t,i)=>sc.append(h('div',{class:'tr'},h('div',{class:'n'},String(i+1)),h('div',{},h('b',{},t.t),h('small',{},t.a)),h('div',{class:'eq'},t.d||''))));
      sc.append(botPad());
    } else {
      sc.append(h('button',{style:'color:#fa2d48;font-size:17px;padding:2px 16px 8px',onclick:()=>{view='home';render();}},'‹ 보관함'));
      sc.append(h('div',{class:'pl'},h('div',{class:'cover'},'♫'),h('div',{},h('div',{style:'font-size:22px;font-weight:700'},pl.name),h('div',{style:'color:#fa2d48;font-size:15px;margin-top:2px'},S().ui.ownerName),h('div',{style:'color:#8e8e93;font-size:13px;margin-top:4px'},pl.desc))));
      sc.append(h('div',{style:'display:flex;gap:12px;padding:0 16px 12px'},h('button',{style:btn,onclick:()=>{K.music.i=0;K.music.t=0;if(all[0].link){K.askLink(all[0].link);}else K.music.playing=true;render();}},'▶︎ 재생'),h('button',{style:btn,onclick:()=>{const j=Math.floor(Math.random()*N);K.music.i=j;K.music.t=0;if(all[j].link){K.askLink(all[j].link);}else K.music.playing=true;render();}},'⤨ 셔플')));
      pl.tracks.forEach((t,i)=>sc.append(h('div',{class:'tr'+(K.music.i===i?' on':''),onclick:()=>{K.music.i=i;if(t.link){K.askLink(t.link);render();return;}K.music.playing=true;K.music.t=0;render();}},h('div',{class:'n'},K.music.i===i&&K.music.playing?'♪':String(i+1)),h('div',{},h('b',{},t.t),h('small',{},t.a)),h('div',{class:'eq'},t.d||'⋯'))));
      sc.append(botPad());
    }
    mini();
  }
  render();
}};


/* =================== 시계 =================== */
K.apps.clock = { mount(root,p,ctl){
  ctl.bar(false);
  const pg=K.page(); pg.classList.add('clk2'); root.append(pg);
  const body=h('div',{class:'cbody'}), tabs=h('div',{class:'ctabs'});
  pg.append(padTop(),body,tabs);
  let tab='alarm';
  const ICO={world:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2.500 12h19M12 2c3 3 4.500 6.500 4.500 10S15 19 12 22M12 2C9 5 7.500 8.500 7.500 12S9 19 12 22',alarm:'M12 6v6l4 2M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM4 6l3-3M20 6l-3-3',stop:'M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 9v5M9.500 2h5M12 2v3',timer:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l-3 3'};
  const TABS=[['world','세계 시각'],['alarm','알람'],['stop','스톱워치'],['timer','타이머']];
  const CITIES=[['토론토','캐나다','America/Toronto'],['아테네','그리스','Europe/Athens'],['런던','영국','Europe/London']];
  const off=(tz,d)=>{ const f=z=>Date.parse(d.toLocaleString('en-US',{timeZone:z})); return Math.round((f(tz)-f('Asia/Seoul'))/36e5); };
  const dayStr=(tz,d)=>d.toLocaleDateString('en-CA',{timeZone:tz});
  const big=t=>h('div',{class:'cl-large'},t);
  function render(){
    body.innerHTML=''; tabs.innerHTML='';
    TABS.forEach(([id,n])=>tabs.append(h('button',{class:tab===id?'on':'',onclick:()=>{tab=id;render();}},h('span',{html:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${ICO[id]}"/></svg>`}),n)));
    const sc=h('div',{class:'scroll'}); body.append(sc);
    if(tab==='world'){
      sc.append(h('div',{class:'cl-top'},h('span',{style:'color:#ff9f0a'},'편집'),h('span',{style:'color:#ff9f0a;font-size:26px'},'＋')),big('세계 시각'));
      const now=K.now();
      CITIES.forEach(([c,co,tz])=>{
        const o=off(tz,now), dl=dayStr(tz,now)===dayStr('Asia/Seoul',now)?'오늘':(dayStr(tz,now)<dayStr('Asia/Seoul',now)?'어제':'내일');
        const t=now.toLocaleTimeString('ko-KR',{timeZone:tz,hour:'numeric',minute:'2-digit',hour12:true});
        const m=t.match(/(오전|오후)\s*(\d+:\d+)/)||[0,'',t];
        sc.append(h('div',{class:'cl-row'},h('div',{},h('div',{class:'cl-sub'},dl+', '+(o>=0?'+':'')+o+'시간'),h('div',{class:'cl-city'},c+' · '+co)),h('div',{class:'cl-time'},h('small',{},m[1]),m[2])));
      });
    } else if(tab==='alarm'){
      sc.append(h('div',{class:'cl-top'},h('span',{style:'color:#ff9f0a'},'편집'),h('span',{style:'color:#ff9f0a;font-size:26px'},'＋')),big('알람'),h('div',{class:'cl-sec'},'기타'));
      [['07:00','알람',true]].forEach(a=>{ const t=h('div',{class:'tg'+(a[2]?' on':'')}); t.onclick=()=>t.classList.toggle('on'); sc.append(h('div',{class:'cl-row'},h('div',{},h('div',{class:'cl-alarm'},h('small',{},'오전'),a[0]),h('div',{class:'cl-sub'},a[1])),t)); });
    } else if(tab==='stop'){
      sc.append(h('div',{class:'cl-stop'},'00:00.00'),h('div',{class:'cl-btns'},h('div',{class:'cb dim'},'랩'),h('div',{class:'cb go'},'시작')));
    } else {
      sc.append(h('div',{class:'cl-stop',style:'margin-top:90px'},'0:00:00'),h('div',{class:'cl-btns'},h('div',{class:'cb dim'},'취소'),h('div',{class:'cb go'},'시작')),h('div',{class:'cl-row',style:'margin-top:34px'},h('span',{},'타이머 종료 시'),h('span',{style:'color:#8e8e93'},'전파음 ›')));
    }
  }
  render();
}};

/* =================== 날씨 =================== */
K.apps.weather = { mount(root,p,ctl){
  ctl.bar(false); const w=D.weather;
  const pg=K.page(); pg.classList.add('wea'); root.append(pg);
  const CL='<svg viewBox="0 0 32 22" width="34" height="24"><path d="M9 20a6 6 0 0 1-.8-11.900A8 8 0 0 1 23.500 7.500 6.300 6.300 0 0 1 24 20z" fill="#fff"/></svg>';
  const SUN='<svg viewBox="0 0 32 32" width="28" height="28" stroke="#ffd60a" stroke-width="2" stroke-linecap="round"><circle cx="16" cy="16" r="6" fill="#ffd60a"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.800 6.800l2.800 2.800M22.400 22.400l2.800 2.800M25.200 6.800l-2.800 2.800M9.600 22.400l-2.800 2.800"/></svg>';
  const RAIN='<svg viewBox="0 0 32 32" width="30" height="30"><path d="M9 17a5 5 0 0 1-.6-10A7 7 0 0 1 22 6a5.500 5.500 0 0 1 .5 11z" fill="#fff"/><path d="M11 21l-1 3M16 21l-1 3M21 21l-1 3" stroke="#5ac8fa" stroke-width="1.600" stroke-linecap="round"/></svg>';
  const SNOW='<svg viewBox="0 0 32 32" width="30" height="30"><path d="M9 17a5 5 0 0 1-.6-10A7 7 0 0 1 22 6a5.500 5.500 0 0 1 .5 11z" fill="#fff"/><circle cx="11" cy="22" r="1.600" fill="#cfe8ff"/><circle cx="16" cy="25" r="1.600" fill="#cfe8ff"/><circle cx="21" cy="22" r="1.600" fill="#cfe8ff"/></svg>';
  const ICN={sun:SUN,cloud:CL,rain:RAIN,snow:SNOW};
  const bar=(lo,hi)=>{ const mn=0,mx=24; const l=(lo-mn)/(mx-mn)*100, wd=(hi-lo)/(mx-mn)*100; return `<span class="tbar"><i style="left:${l}%;width:${wd}%"></i></span>`; };
  const wsc=()=>{ const w=D.weather;
    const hrs=(w.hoursN&&w.hoursN.length)?w.hoursN:[{l:'지금',t:w.temp,k:'cloud'}];
    const dys=(w.days&&w.days.length)?w.days:[{n:'오늘',k:'cloud',lo:w.lo,hi:w.hi,pc:''}];
    const mn=Math.min(...dys.map(d=>d.lo)), mx=Math.max(...dys.map(d=>d.hi));
    const bar2=(lo,hi)=>{ const sp=Math.max(1,mx-mn); return `<span class="tbar"><i style="left:${(lo-mn)/sp*100}%;width:${Math.max(6,(hi-lo)/sp*100)}%"></i></span>`; };
    return h('div',{class:'scroll wsc'},
      h('div',{class:'whead'},h('small',{},'서울특별시'),h('h1',{},w.city),h('div',{class:'big'},w.temp+'°'),h('div',{class:'cond'},w.cond),h('div',{class:'hl'},'최고:'+w.hi+'° 최저:'+w.lo+'°')),
      h('div',{class:'wcard'},h('div',{class:'wsum'},w.summary||'남은 하루 동안 흐린 상태가 이어지겠습니다.'),
        h('div',{class:'hr2'},hrs.map(x=>h('div',{},x.l,h('span',{html:ICN[x.k]||CL}),x.t+'°')))),
      h('div',{class:'wcard'},h('div',{class:'wlab'},'📅 10일간의 일기예보'),
        dys.map(d=>h('div',{class:'drow'},h('b',{},d.n),h('span',{class:'di',html:(ICN[d.k]||CL)+(d.pc?`<em>${d.pc}</em>`:'')}),h('span',{class:'dl'},d.lo+'°'),h('span',{html:bar2(d.lo,d.hi)}),h('span',{class:'dh'},d.hi+'°')))),
      botPad()); };
  let cur=wsc();
  pg.append(padTop(),
    h('div',{class:'wtop'},h('button',{class:'wc',onclick:()=>K.closeApp(),html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'}),h('button',{class:'wc',html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'})),
    cur);
  K.onWeather=()=>{ if(!pg.isConnected) return; const n=wsc(); cur.replaceWith(n); cur=n; };
  K.loadWeather();
}};

/* =================== Safari =================== */
K.apps.safari = { mount(root,p,ctl){
  ctl.bar(true); const nav=K.makeNav(root);
  const pg=K.page(); pg.classList.add('sf'); const sc=h('div',{class:'scroll'}); nav.push(pg);
  const inp=h('input',{placeholder:'Google에 물어보세요'});
  const SVG=(d,w=26,s='#111',sw=2)=>`<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="${s}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const MIC='<rect x="9" y="3" width="6" height="11" rx="3" fill="#111"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21"/>';
  const CAM='<path d="M4 8V6.500A2.500 2.500 0 0 1 6.500 4H8M16 4h1.500A2.500 2.500 0 0 1 20 6.500V8M20 16v1.500a2.500 2.500 0 0 1-2.500 2.500H16M8 20H6.500A2.500 2.500 0 0 1 4 17.500V16"/><circle cx="12" cy="12" r="3.200" fill="#111"/>';
  const PAGEIC='<path d="M4 7h16M4 12h12M4 17h8"/>'; const TABSIC='<rect x="8.500" y="3.500" width="12" height="12" rx="3" fill="none"/><path d="M5.500 8.500a3 3 0 0 0-2 2.800v6.200a3 3 0 0 0 3 3h6.200a3 3 0 0 0 2.800-2"/>';
  const RELOAD='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.800-6.100M20 4v5h-5"/></svg>';
  const DOTS='<circle cx="5" cy="12" r="1.700" fill="#111"/><circle cx="12" cy="12" r="1.700" fill="#111"/><circle cx="19" cy="12" r="1.700" fill="#111"/>';
  const chrome=host=>{ const bar=chrome0(host); setTimeout(()=>{ const sc=bar.parentNode&&bar.parentNode.querySelector('.scroll'); if(!sc) return; let last=0; sc.addEventListener('scroll',()=>{ const t=sc.scrollTop, d=t-last; if(Math.abs(d)<6) return; last=t; if(t>40&&d>0) bar.classList.add('min'); else if(d<0||t<=10) bar.classList.remove('min'); },{passive:true}); },0); bar.addEventListener('click',ev=>{ if(bar.classList.contains('min')){ ev.stopPropagation(); ev.preventDefault(); bar.classList.remove('min'); } },true); return bar; };
  const chrome0=host=>h('div',{class:'sfbar'},
    h('i',{class:'sfc'+(host?'':' dis'),onclick:()=>{ if(host) nav.pop(); },html:SVG('<path d="M15 5l-7 7 7 7"/>',22,host?'#111':'#b7b7bc',2.2)}),
    h('div',{class:'sfpill',onclick:()=>{ if(!host) openSearch(); }},h('span',{class:'sfi',html:SVG(PAGEIC,22,'#111',1.8)}),h('span',{class:'sfq'+(host?'':' ph')},host||'검색 또는 웹 사이트 이름 입력'),host?h('span',{class:'sfr',html:RELOAD}):h('span',{class:'sfr'})),
    h('i',{class:'sfc',onclick:()=>menu(),html:SVG(TABSIC,22,'#111',1.8)}));
  const FAV=[['Apple','photos/fav/apple.png'],['구글','photos/fav/google.png'],['네이버','photos/fav/naver.png'],['유튜브','photos/fav/youtube.png'],
    ['쿠팡','photos/fav/coupang.png'],['신현카드','photos/shcard-icon.jpg'],['정유출판사','photos/pub-icon.jpg'],['Blind','photos/fav/blind.png']];
  function start(){ sc.innerHTML='';
    sc.append(h('div',{style:'height:64px'}),h('div',{class:'sfsec'},'즐겨찾기'),
      h('div',{class:'sffav'},...FAV.map(([n,bg,ic])=>h('div',{class:'sff',onclick:()=>{ if(n==='Blind') pageBlind(); else if(n==='유튜브') K.openApp('youtube'); else if(n==='정유출판사') K.openApp('pub'); }},ic?h('i',{style:'background:'+bg,html:ic}):h('i',{class:'img',style:'background:#f2f2f7 url('+bg+') center/cover no-repeat'}),h('span',{},n)))),
      h('div',{class:'sfsec'},h('span',{},'개인정보 보호 리포트'),h('i',{class:'sfchev',html:SVG('<path d="M9 6l6 6-6 6"/>',16,'#8e8e93',2.4)})),
      h('div',{class:'sfpr'},h('i',{html:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#3a7bd5" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.500-3 8-7 10-4-2-7-5.500-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>'}),h('div',{},h('b',{},'34'),h('small',{},'지난 7일 동안 Safari가 추적기 34개의 프로필 작성을 방지했습니다.'))),
      h('div',{style:'height:150px'})); }
  function openSearch(){
    if(pg.querySelector('.sfov')) return;
    const q=h('input',{placeholder:'검색 또는 웹 사이트 이름 입력',autocomplete:'off',autocapitalize:'none',autocorrect:'off',enterkeyhint:'search'});
    const list=h('div',{class:'sflist'});
    const close=()=>ov.remove();
    const go=s=>{ const f=LOCK[s]; if(f){ close(); f(); } };
    const draw=()=>{ list.innerHTML=''; const v=q.value.trim();
      if(v) list.append(h('div',{class:'sfrow',onclick:()=>go(v)},h('i',{html:SVG('<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',22,'#8e8e93',2)}),h('span',{},v),h('small',{},'Google 검색')));
      const arr=S().searches.filter(s=>!v||s.includes(v));
      if(arr.length) list.append(h('div',{class:'sfsec sm'},v?'기록':'최근 검색'));
      arr.forEach(s=>list.append(h('div',{class:'sfrow',onclick:()=>go(s)},h('i',{html:SVG('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.500l3.500 2"/>',22,'#8e8e93',1.800)}),h('span',{},s)))); };
    q.addEventListener('input',draw); q.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.isComposing){ e.preventDefault(); go(q.value.trim()); } });
    const ov=h('div',{class:'sfov'},padTop(),h('div',{class:'sftop'},h('div',{class:'sfinp'},h('i',{html:SVG('<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',18,'#8e8e93',2.200)}),q),h('button',{onclick:close},'취소')),list);
    pg.append(ov); draw(); setTimeout(()=>q.focus(),60);
  }
  function openHistory(){
    const e=K.page(); e.classList.add('sfhist'); const s=S().searches;
    const grp=(t,arr)=>arr.length?[...(t?[h('div',{class:'sfsec sm'},t)]:[]),...arr.map(x=>h('div',{class:'sfh',onclick:()=>{ const f=LOCK[x]; if(f) f(); }},h('i',{html:'<b style="font:700 15px/1 Arial;background:linear-gradient(90deg,#4285f4,#ea4335,#fbbc05,#34a853);-webkit-background-clip:text;color:transparent">G</b>'}),h('div',{},h('b',{},x+' - Google 검색'),h('small',{},'google.com'))))]:[];
    e.append(padTop(),h('div',{class:'sfhd'},h('span',{}),h('b',{},'기록'),h('button',{onclick:()=>nav.pop()},'완료')),h('div',{class:'scroll'},...grp('',s),botPad()));
    nav.push(e);
  }
  function menu(){ K.sheet('',[{t:'기록',fn:openHistory}]); }
  pg.append(padTop(),sc,chrome(null));

  const GL=(q,shown)=>h('div',{class:'gtop'},h('div',{class:'gq'},h('span',{class:'gg'},'G'),h('span',{class:'gt'},shown||q)));
  const res=(site,url,title,snip,ic)=>h('div',{class:'gres'},h('div',{class:'gs'},h('i',{class:'gi'},ic||site[0]),h('div',{},h('b',{},site),h('small',{},url))),h('div',{class:'gh'},title),h('div',{class:'gd'},snip));
  function placeHead(){ return h('div',{class:'gph'},h('span',{class:'t'},'서순라길'),h('span',{class:'ic'},h('b',{html:'<svg viewBox="0 0 24 24" width="18" height="18" fill="#444"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>'}),h('b',{class:'sh',html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="#3c4a8a"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8 11l8-5M8 13l8 5" stroke="#3c4a8a" stroke-width="1.800" fill="none"/></svg>'}))); }
  function mapCard(){ return h('div',{class:'gmap'},
    h('div',{class:'park'}),h('div',{class:'rd r1'}),h('div',{class:'rd r2'}),h('div',{class:'rd r3'}),h('div',{class:'ln l1'}),h('div',{class:'ln l2'}),
    h('span',{class:'mp',style:'left:30%;top:22%'},'익선동 한옥마을'),h('span',{class:'mp',style:'left:56%;top:46%'},'훈정동'),h('span',{class:'mp',style:'left:12%;top:60%'},'낙원동'),h('span',{class:'mp',style:'left:42%;top:66%'},'묘동'),h('span',{class:'mp',style:'left:68%;top:16%'},'권농동'),
    h('i',{class:'pin',style:'left:44%;top:6%'}),h('i',{class:'pin',style:'left:6%;top:50%'}),h('i',{class:'sbw',style:'left:55%;top:64%'},'M'),h('i',{class:'exp'},'⤢')); }
  function aiBox(){ return h('div',{class:'gai'},h('div',{class:'ah'},h('span',{},'✦'),' AI 개요'),
    h('p',{},h('b',{},'서순라길'),'은 ',h('mark',{},'서울 종로구 종묘 서쪽 담장을 따라 이어지는 약 800m~1.2km 길이의 고즈넉한 돌담길'),'입니다.'),
    h('h3',{},'기본 정보'),
    h('ul',{},h('li',{},h('b',{},'위치: '),'서울특별시 종로구 종로3가 45-5 ~ 권농동 26 (지하철 1·3·5호선 종로3가역 7번 출구 인근)'),h('li',{class:'fade'},h('b',{},'이름 유래: '),'조선시대 왕실을 호위하고 야간 순찰을 돌던 \'순라군\'이 머물던 순라청의 서쪽에 있어서 붙은 이름입니다.')),
    h('button',{class:'gmore',onclick:e=>{ const b=e.currentTarget; b.parentNode.querySelector('.fade').classList.remove('fade'); b.remove(); }},'더보기 ⌄')); }
  function pageSol(){
    const e=K.page(); e.classList.add('gpage');
    e.append(padTop(),GL('서순라길','솔방울길'),h('div',{class:'scroll'},
      h('div',{class:'gfix'},h('div',{},'다음에 대한 검색 결과 표시 중 ',h('b',{class:'bl'},'서순라길')),h('div',{class:'orig'},'처음에 검색한 결과 ',h('b',{class:'bl'},'솔방울길'))),
      res('서울관광재단','www.visitseoul.net','서순라길 | 서울 가볼 만한 곳','종묘 담장을 따라 이어지는 골목길로, 한옥과 작은 가게, 조용한 카페가 모여 있어 산책하기 좋은 길입니다.'),
      res('네이버 블로그','blog.naver.com','익선동 옆 조용한 산책로, 서순라길 데이트 후기','종묘 돌담길을 따라 걷다 보면 분위기 좋은 식당과 바가 이어져요. 저녁 무렵 방문을 추천합니다.'),
      res('위키백과','ko.wikipedia.org','서순라길 - 위키백과','서순라길은 서울 종로구 훈정동에 있는 거리로, 종묘의 서쪽 담장을 따라 형성되어 있다.'),
      h('div',{class:'gsec'}), placeHead(), mapCard(), aiBox(),
      res('블로그','https://m.blog.naver.com','서순라길 데이트 코스 추천 | 종묘 돌담길 카페 · 맛집','종로3가역에서 걸어서 5분. 한옥 카페와 작은 바, 와인 가게가 이어져 있어 해 질 무렵 걷기 좋아요.','b'),
      res('인스타그램','https://www.instagram.com','#서순라길 해시태그 게시물','종묘 담장 따라 걷던 오후. 요즘 서울에서 제일 좋아하는 산책 코스 🌿','i'),
      res('티스토리','https://seosullagil.tistory.com','서순라길 주차 · 가는 법 · 운영시간 정리','종로3가역 7번 출구에서 도보 약 5분, 종묘 서쪽 담장을 따라 이어지는 골목입니다.','t'),
      botPad()));
    e.append(chrome('google.com'));
    nav.push(e);
  }
  function pageBlind(){
    const e=K.page(); e.classList.add('bdpage'); let tab=0;
    const I=(d,w=20,c='#8a8f99',sw=1.8)=>`<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const HT=I('<path d="M12 20.500C4 15 2.500 11 2.500 8.300 2.500 5.700 4.500 4 6.800 4c2 0 3.900 1.200 5.200 3.300C13.300 5.200 15.200 4 17.200 4c2.300 0 4.300 1.700 4.300 4.300 0 2.700-1.500 6.700-9.500 12.200z"/>',19), CM=I('<path d="M12 4.500c4.700 0 8.500 3 8.500 6.800S16.700 18 12 18c-1 0-2-.1-2.800-.4L5 19.500l1.100-3.400C4.500 15 3.500 13.200 3.500 11.300 3.500 7.500 7.300 4.500 12 4.500z"/>',19), EY=I('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',20);
    const LOGO='<svg viewBox="0 0 40 40" width="34" height="34"><g fill="none" stroke="#d6453d" stroke-width="3.400" stroke-linecap="round"><path d="M7 5v30"/><path d="M13 5v30"/><path d="M13 6h9a6.500 6.500 0 0 1 0 13h-9"/><path d="M13 19h10a7.500 7.500 0 0 1 0 15H13"/></g></svg>';
    const cimg=k=>h('i',{class:'bdcir',style:'overflow:hidden;background:#ddd'},h('img',{src:'photos/ch-'+k+'.svg',alt:'',style:'width:100%;height:100%;display:block'}));
    const ico=(bg,t)=>h('i',{class:'bdcir',style:'background:'+bg},t);
    const READ=new Set(); let SY=0;
    const row=(av,ch,ti,l,c,v,po)=>h('div',{class:'bdrow'+(po&&READ.has(po)?' rd':''),onclick:()=>{ if(po&&/^sh[1-5]$/.test(po.id)){ SY=sc.scrollTop; READ.add(po); post(po); } }},h('div',{class:'bdrc'},av,h('span',{},ch)),h('div',{class:'bdrt'},ti),h('div',{class:'bdrf'},...(l!=null?[h('span',{html:HT+l}),h('span',{html:CM+c}),...(v?[h('span',{html:EY+v})]:[])]:[h('span',{html:EY+v})])));
    const bar=()=>h('div',{class:'bdtop'},h('span',{class:'bdlg',html:LOGO}),h('div',{class:'bdsr'},h('span',{html:I('<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',22,'#222',1.800)}),'관심있는 내용을 검색해보세요!'),h('span',{class:'bdbell',html:I('<path d="M6 17V11a6 6 0 0 1 12 0v6l1.500 2h-15z"/><path d="M10 21.500h4"/>',25,'#222',1.800)+'<i></i>'}),h('span',{class:'bdme',onclick:()=>profile(),html:LG('신현카드')}));
    const tabs=()=>h('div',{class:'bdtabs'},...['홈','채널','기업 리뷰'].map((t,i)=>h('span',{class:i===tab?'on':'',onclick:()=>{ tab=i; draw(); }},t)),h('span',{class:'bdsale'},'금주의 특가 ',h('b',{},'AD')));
    const sc=h('div',{class:'scroll'});
    const IMG=I('<rect x="4" y="5" width="16" height="14" rx="2.500"/><circle cx="9" cy="10" r="1.500"/><path d="M5 17l4.500-4.500 3 3 2.500-2.500L19 17"/>',14,'#fff',2);
    const SHAV=()=>h('i',{class:'bdcir',style:'background:#101a35;overflow:hidden',html:LG('신현카드')});
    const PO=[
      {ad:1,av:ico('#c9463d','AD'),ch:'광고',t:'독서 등 조명 하나로 달라지는 밤 독서, 구경하기',v:'372'},
      {id:'n1',cat:['hot', 'bamboo'],ch:'직장생활',t:"연말 성과급 공지 언제쯤 나오는지 아는 사람",l:87,v:'3,880',time:'1일 전',ct:['2026.11.06.', '2026.11.06.', '2026.11.06.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.'],au:'익명의 신현카드 사원',
        body:"작년에는 12월 둘째 주에 공지 나왔던 것 같은데 올해는 아직 소식이 없네요.\n팀장님들도 모르시는 눈치라 혹시 아시는 분 있나 궁금해서 글 올려봐요.",
        cm:[["작년엔 12월 둘째 주 금요일에 공지 나왔음",46],["올해는 실적 발표 끝나고 나온다는 얘기 있던데 확실하진 않음",31],["기다리는 사이에 연말이 다 가버리는 느낌ㅋㅋ",52,1],["공지 나오면 여기에 제일 먼저 올라올 듯",23],["작년엔 생각보다 적어서 올해도 기대 안 하는 중",39],["그래도 나오는 게 어디냐",22,1],["성과급 공지 나오는 날 블라인드 접속자 폭주함ㅋㅋ",44],["팀 평가 먼저 나와야 공지 가능하다고 들음",17],["올해는 조금 오르면 좋겠다ㅠ",28],["공지 뜨는 순간 회사 메신저 난리날 듯",26],["작년에 12월 20일쯤 입금됐던 기억",34],["올해 실적이 나쁘진 않다던데 기대해도 될 듯",29],["성과급 나오면 뭐 살 거임?",25],["대출 갚으려고요…",32,1],["나는 해외여행 질러보려고",21],["팀장님한테 슬쩍 물어봤는데 모른다고 하심",18],["인사팀에서 공지 올릴 때 메일부터 오더라",23],["공지 뜨면 바로 알려줄게요 (아마 못 알려줄 듯)",16]]},
      {id:'n2',cat:['bamboo'],ch:'일상·이야기',t:"여의도 점심 메뉴 추천 좀… 한식 질림",l:34,v:'1,240',time:'2일 전',ct:['2026.11.05.', '2026.11.05.', '2026.11.05.', '2026.11.06.', '2026.11.06.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.'],au:'익명의 마케팅팀 직원',
        body:"일주일 내내 근처 한식만 먹었더니 이제 뭘 먹어야 할지 모르겠음. 줄 안 서고 빨리 먹을 수 있는 곳 있으면 추천 부탁드려요.",
        cm:[["지하 1층 칼국수집 의외로 괜찮음",19],["비 오는 날은 국밥이 정답",27],["샐러드 먹으면 오후 졸음이 덜해요. 줄은 길지만",15],["나는 요즘 샌드위치 사서 공원 가서 먹음",24],["여의도 공원 벤치 날씨 좋을 때 최고",31,1],["지하 푸드코트 마라탕 줄 너무 길어요",15],["분식집도 은근 가성비 좋음",18],["오늘은 순대국 먹으러 감. 추천 감사합니다",12],["회사 근처 쌀국수집 점심에 괜찮음",22],["웨이팅 길어서 12시 전에 가야 함",17,1],["돈가스 먹으러 가세요. 한식 아님",14],["점심시간 줄이 제일 짧은 곳은 한 군데 있는데 비밀임",30],["국수류가 빨리 나와서 좋음",13],["오늘 점심은 뭐 먹지가 평생 숙제임",39],["샐러드 정기구독 해보는 것도 추천",11]]},
      {id:'sh1',cat:['hot','cafe','love'],ch:'사내카페/복지',t:'사내 카페 알바생 때문에 점심시간마다 마인드컨트롤 한다 진짜',l:150,v:'3,420',time:'2주 전',ct:['2026.10.24.', '2026.10.24.', '2026.10.25.', '2026.10.25.', '2026.10.26.', '2026.10.27.', '2026.10.28.', '2026.10.28.', '2026.10.29.', '2026.10.29.', '2026.10.30.', '2026.10.30.', '2026.10.31.', '2026.10.31.', '2026.11.01.', '2026.11.01.', '2026.11.01.', '2026.11.02.', '2026.11.02.', '2026.11.02.', '2026.11.03.', '2026.11.03.', '2026.11.03.', '2026.11.04.'],au:'익명의 신현카드 사원',img:1,
        body:"아니 1층 카페에서 베레모 쓰고 커피 내리는 알바생 얼굴 진짜 실화냐? 여의도 직장인들 다 거기서 커피 사 마시느라 점심시간마다 줄 섰음.\n우리 층 여직원들은 이미 단체로 정신 나갔고, 쇼케이스에서 초코케이크 하나 서비스로 받아온 사람은 전설 취급받는 중ㅋㅋ 나만 아메리카노 시켜놓고 마인드컨트롤 하는 거 아니지?",
        cm:[["줄 서서 샷추가 시켰는데 이름까지 물어봐줘서 하루종일 기분 좋았음 ㅋㅋ",41],["알바생 나 거기 일주일째 들락거리는데 안 외워줌 ㅠㅠ",17],["초코케이크 서비스 받은 사람 누구냐 증언 좀",52],["그 짤 아직도 단톡방에 돌아다님ㅋㅋㅋ",31,1],["커피 맛도 괜찮아서 더 문제임. 얼굴로만 먹고사는 줄 알았는데 라떼아트도 함",38],["점심시간 카페 줄이 엘베 앞까지 와서 오늘은 못 사 마셨음. 이게 회사 복지 맞냐",29],["나도 어제 줄 서다가 포기하고 편의점 갔음",34],["텀블러 가져가면 할인되는 거 아는 사람?",28],["200원 할인임 ㅇㅇ",19,1],["이 글 보고 오늘 점심에 처음 가봄. 인정이다",45],["커피 나오는 속도는 좀 느린데 분위기가 다 해결함",22],["케이크는 오후 3시 이후엔 거의 다 나감",16],["줄이 길어서 모바일 주문하는 팀도 있더라",27],["회사 앞 카페 다 망하겠다ㅋㅋ",36],["점심시간 전에 미리 주문해두면 안 기다려도 됨",33],["모바일 주문 알림 소리 크게 나서 민망함ㅋㅋ",21,1],["아메리카노 한 잔에 3천원대면 가성비 괜찮은 편",25],["우유 바꿔주는 옵션 있는지 아는 사람?",12],["오트밀크 되는 걸로 알고 있음",14,1],["케이크 맛은 솔직히 평범한데 쇼케이스가 예쁨",29],["점심 먹고 커피 사러 내려가는 게 유일한 낙",47],["출근길에 사 가는 사람이 더 많은 듯",18],["프로모션 기간에 쿠키 서비스 준다던데",23],["여기 단골 되면 이름 기억해주는 것도 신기함ㅋㅋ",38]]},
      {id:'n3',cat:['hot', 'bamboo'],ch:'직장생활',t:"회의 자료를 꼭 PPT로 만들어야 하나요",l:128,v:'4,510',time:'5일 전',ct:['2026.11.02.', '2026.11.02.', '2026.11.03.', '2026.11.03.', '2026.11.04.', '2026.11.04.', '2026.11.05.', '2026.11.05.', '2026.11.06.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.', '2026.11.07.'],au:'익명의 신현카드 사원',
        body:"30분 회의 하려고 자료 만드는 데 반나절 걸림. 요약 한 장짜리 문서로 하면 안 되나 싶은데 다들 어떻게 하세요?",
        cm:[["한 장 요약 + 필요하면 첨부로 가는 팀도 있음",61],["윗분들이 PPT 아니면 일 안 한 줄 알아서…",84],["그래서 우리 팀은 PPT 한 장에 다 넣는 걸로 타협함",37,1],["회의 목적부터 정하면 자료가 절반으로 줄어요",29],["회의록 한 줄 요약 문화가 필요함",27],["PPT는 보고용이고 회의는 구두로 하자",33],["그래도 결국 윗선 보고 때문에 PPT 만들게 됨ㅋㅋ",41,1],["템플릿 공유해주는 팀이 있어서 그나마 낫다",19],["이거 진짜 공감. 자료 만드는 시간이 일의 절반",52],["우리 팀은 노션 정리로 대체하고 있음",26],["PPT 한 장짜리 요약본 잘 만드는 법 알려주세요",19],["목차-핵심-액션 아이템 세 칸이면 끝",28,1],["회의 시작 전에 자료 안 읽고 오는 사람이 제일 문제",43],["회의 줄이는 게 제일 근본적인 해결책",37],["회의 없는 수요일 같은 거 도입하면 좋겠다",32],["이거 우리 회사 얘기 같아서 웃음 남",21]]},
      {id:'sh2',cat:['hot','love','bamboo'],ch:'연애/목격담',t:'대외협력실 ㄱㅇㅎ 대리 루틴 바뀐 거 제발 해명 좀',l:92,v:'2,890',time:'3주 전',ct:['2026.10.17.', '2026.10.17.', '2026.10.18.', '2026.10.18.', '2026.10.19.', '2026.10.19.', '2026.10.20.', '2026.10.20.', '2026.10.21.', '2026.10.21.', '2026.10.22.', '2026.10.22.', '2026.10.23.', '2026.10.24.', '2026.10.24.', '2026.10.24.', '2026.10.25.', '2026.10.25.', '2026.10.25.', '2026.10.26.', '2026.10.26.', '2026.10.26.'],au:'ㅇㅈㅎ 실장 라인 직원',
        body:"원래 퇴근하면 서재에서 공부도 하고 혼자 잘 놀던 애가 요즘은 퇴근하자마자 무슨 로켓처럼 사출하듯 사라짐.\n출근길에 우드랑 머스크 섞인 향수 뿌리고 다크서클 살짝 달고 다니는데, 손에 끼워진 다이아 반지 반짝거리는 거 나만 봤냐?\n백 미터 밖에서 봐도 완벽한 뉘앙스의 연인이 생긴 티가 팍팍 나는데, 일은 또 미친 듯이 잘하니까 뭐라고 하기도 애매하고 미치겠음.",
        cm:[["ㄱㅇㅎ 대리 반지 뭐야? 불가리에 다이아 박혀 있던데 눈부셔 죽는 줄",47],["출근길에 애인 차에서 내리면서 \"자기야\" 하고 손 흔들고 들어온다는 목격담 진심이냐고ㅋㅋ",72],["그거 나도 봤음 1층 로비에서ㅋㅋㅋ 뒤에서 사진 찍을 뻔",35,1],["일 잘해서 아무도 못 건드리는 타입임. 연애하는 건 인정",44],["향수 뭐 쓰는지 아는 사람? 우드랑 머스크 섞인 거 궁금함",21],["탐 포드 같기도 한데… 그냥 선물받은 걸 수도",12,1],["퇴근 후에 뭐 하는지 궁금하긴 한데 사생활이니까…",29],["ㄱㅇㅎ 대리 요즘 얼굴 좋아진 건 팩트임",41],["그건 인정. 피부가 달라짐ㅋㅋ",27,1],["일 잘하는 사람 연애는 응원해야지",33],["손에 반지만 봤냐 시계도 바뀜",18],["이 글 쓴 사람 관찰력 대단하다 ㅋㅋㅋ",52],["다이아 반지는 아무리 봐도 약혼 느낌인데",24],["출근 시간이 달라진 게 제일 눈에 띔",26],["점심시간에도 폰 보면서 웃는 거 봄",34],["그게 다 티가 나는 법임ㅋㅋ",19,1],["향수는 인정. 엘베 타면 향 남음",28],["예전엔 야근 자주 했던 것 같은데 요즘은 칼퇴임",37],["업무 성과는 그대로니까 상관없지 않나",22],["솔직히 부러움",41],["회식 자리에서도 일찍 가는 이유가 있었네",30],["아는 척하지 말고 그냥 응원해주자",35]]},
      {id:'n4',cat:['bamboo'],ch:'직장생활',t:"출장비 정산 시스템 진짜 불편함",l:56,v:'1,970',time:'1주 전',ct:['2026.10.31.', '2026.10.31.', '2026.10.31.', '2026.11.01.', '2026.11.01.', '2026.11.02.', '2026.11.02.', '2026.11.03.', '2026.11.04.', '2026.11.04.', '2026.11.04.', '2026.11.05.', '2026.11.05.', '2026.11.05.', '2026.11.06.'],au:'익명의 동기',
        body:"영수증 하나 올리는 데도 클릭을 몇 번이나 해야 하는지… 나만 불편한가요? 개선 요청 넣어본 분 있나요?",
        cm:[["영수증 첨부하다가 세션 끊겨서 처음부터 다시 한 적 있음 ㅠㅠ",44],["모바일 앱에서 사진 찍어서 올리는 게 그나마 편함",22,1],["개선 요청 올려봤는데 답이 없음",18],["모바일 앱은 로그인이 자꾸 풀리는 게 문제",25],["영수증 분실하면 정산 반려되는 것도 불편",32],["출장비 정산 마감일이 월초라 놓칠 때 많음",20,1],["팀 서무가 대신 해주는 팀은 복받은 거임",28],["이 시스템 교체한다는 얘기 있던데 확실하진 않음",14],["정산 규정이 자주 바뀌는 것도 문제",18],["교통비는 자동으로 연동되면 좋겠다",29],["택시비는 사유 적는 칸이 너무 작음",15],["나 지난달 영수증 두 번 올렸다가 반려됨ㅠ",24,1],["결재선이 길어서 승인까지 일주일 걸림",31],["법인카드 쓰면 이 과정이 없어서 편하긴 함",22],["출장 많이 다니는 팀은 정산만 하다 퇴근함",27]]},
      {id:'sh3',cat:['hot','cafe','bamboo'],ch:'사내카페/복지',t:'신현카드 사내 복지라곤 1층 카페 알바생 얼굴밖에 없다는 게 학계 정설',l:185,v:'4,120',time:'3주 전',ct:['2026.10.17.', '2026.10.18.', '2026.10.19.', '2026.10.20.', '2026.10.20.', '2026.10.21.', '2026.10.21.', '2026.10.22.', '2026.10.22.', '2026.10.23.', '2026.10.23.', '2026.10.23.', '2026.10.24.', '2026.10.24.', '2026.10.24.', '2026.10.25.', '2026.10.25.'],au:'익명의 마케팅팀 직원',img:1,
        body:"사내 복지 다 없앨 거면 왜 이러나 싶었는데, 1층 사내 카페에 새로 온 알바생 얼굴 보고 마음의 평화 찾았다.\n멀끔하게 베레모 쓰고 커피 내리는데 여의도 직장인들 다 홀리는 중. 사내 카페가 아주 복지 맛집임.",
        cm:[["사내 카페 알바생 생기니까 블라인드가 아주 술렁임ㅋㅋㅋ",58],["복지 줄어드는 건 짜증나는데 카페 때문에 출근길이 설레는 건 인정",26],["알바생이 줄 서 있는 사람들한테 \"조금만 기다려주세요\" 하는 목소리 미쳤음",33],["복지 없어지는 건 슬픈데 카페는 인정",45],["커피 원두 바뀐 것도 아는 사람?",21],["산미 줄어서 더 마시기 편해짐",15,1],["점심 후에 카페 앞 벤치에서 쉬는 것도 좋음",19],["복지가 줄어드는 건 팩트인데 그래도 다닐 만함",38],["근무 시간 유연제도 없어지면 진짜 힘들 듯",26],["점심 후에 마시는 카페라떼가 하루의 낙",32],["복지 줄어도 카페만큼은 유지해줘라",44],["1층 카페 인테리어도 바뀌었던데 좋더라",18],["테이크아웃 컵 사이즈 커진 거 나만 알아차렸나",11],["원두 로스팅 날짜가 적혀 있는 게 신뢰감 줌",15],["사내 복지 포인트로 결제되는 거 알고 있음?",27],["그건 몰랐네. 알려줘서 고마워요",13,1],["복지 포인트 연말에 소멸되니까 서둘러 쓰세요",31]]},
      {id:'n7',cat:['cafe','bamboo'],ch:'사내카페/복지',t:"사내에 사우나도 있는 거 아는 사람?",l:73,v:'2,640',time:'3주 전',ct:['2026.10.17.', '2026.10.17.', '2026.10.18.', '2026.10.19.', '2026.10.19.', '2026.10.20.', '2026.10.20.', '2026.10.21.', '2026.10.21.', '2026.10.22.', '2026.10.23.', '2026.10.23.', '2026.10.23.', '2026.10.24.', '2026.10.24.', '2026.10.24.', '2026.10.25.'],au:'익명의 신현카드 사원',
        body:"지하 2층에 사내 사우나가 있는데 원래는 임원, 부장급 이상 간부분들이 주로 이용하던 곳임.\n근데 예전에 과장님 한 분이 이용을 못 하게 된 일이 있었고, 그 뒤로 눈치가 보여서 다들 잘 안 가는 분위기라고 함. 지금은 거의 텅 비어 있다는데 이용해본 사람 있나요?",
        cm:[["그 일 이후로 이용하는 사람이 거의 없다고 들었음",38],["임원 전용 같은 분위기라 직원들은 존재도 모름",52],["나 입사 2년차인데 오늘 처음 앎ㅋㅋ",24,1],["이용 기준이라도 공지해줬으면 좋겠음",31],["시설 관리는 계속 하는 것 같던데 좀 아깝긴 함",17],["사우나 이용 기준이 뭔지 아는 사람?",21],["임원 비서실에 물어보면 알려준다던데",14,1],["수건 제공되는지도 궁금함",9],["겨울에 가면 진짜 좋을 것 같은데 눈치가 ㅠ",33],["사우나 있는 회사 다닌다고 하면 다들 놀람ㅋㅋ",27],["사우나에서 협상 잘 되는 건 사실일지도ㅋㅋ",25],["나이 지긋하신 분들한테는 아직 인기 있는 듯",13],["직원들한테 일부 개방한다는 얘기도 있던데",20,1],["진짜면 겨울에 한 번 가보고 싶다",34],["관리 인력 따로 있다는데 비용 꽤 나올 듯",16],["이런 시설 있는지 입사 때 안내라도 해줬으면",28],["운영 시간이 뭔지 아는 사람?",11]]},
      {id:'n5',cat:['cafe'],ch:'사내카페/복지',t:"사내 헬스장 이용하는 사람 있나요?",l:41,v:'1,560',time:'9일 전',ct:['2026.10.29.', '2026.10.29.', '2026.10.29.', '2026.10.30.', '2026.10.30.', '2026.10.31.', '2026.10.31.', '2026.11.01.', '2026.11.02.', '2026.11.02.', '2026.11.02.', '2026.11.03.', '2026.11.03.', '2026.11.03.', '2026.11.04.'],au:'익명의 신현카드 사원',
        body:"등록은 해놨는데 막상 가게 되지는 않네요. 이용해보신 분들 혼잡한 시간대 같은 거 알려주세요.",
        cm:[["점심시간 직전에 가면 한가함",26],["샤워실 온수 잘 나와서 퇴근 전에 가는 중",19],["운동화를 사무실에 놔두면 편함",8,1],["샤워실 청소 잘 돼 있어서 좋음",22],["PT 선생님 있으면 더 좋겠다",17],["러닝머신은 점심시간에 거의 만석",25],["이용료 무료인 게 제일 큰 장점",36],["탁구대도 있던데 이용하는 사람 있나",13,1],["스트레칭 매트가 있어서 점심시간에 잠깐 하기 좋음",19],["조명이 너무 밝아서 눈이 부신 건 단점",11],["수건 비치되어 있는 건 몰랐음",16],["운동 기구가 오래돼서 소리 나는 게 있음",14],["시설 개선 요청하면 반영해주려나",12,1],["퇴근 후에 가는 사람이 은근 많음",21],["나는 오전 7시에 가는데 아무도 없어서 좋음",25]]},
      {id:'sh4',cat:['love','bamboo'],ch:'신현카드 대나무숲',t:'우리 회사 에이스 라인업 왜 다 이 모양이냐 (feat. ㄱㅇㅎ, ㄱㅇㅍ)',l:115,v:'1,940',time:'1개월 전',ct:['2026.10.07.', '2026.10.08.', '2026.10.09.', '2026.10.09.', '2026.10.10.', '2026.10.10.', '2026.10.11.', '2026.10.11.', '2026.10.12.', '2026.10.13.', '2026.10.13.', '2026.10.13.', '2026.10.14.', '2026.10.14.', '2026.10.14.', '2026.10.15.', '2026.10.15.'],au:'익명의 동기',
        body:"동기라인업 중에 ㄱㅇㅎ 대리는 이미 임자 만나서 품절됐고, 이제 남은 건 ㄱㅇㅍ 대리 하나 남은 건가?\n근데 ㄱㅇㅍ 대리는 연애를 하는지 안 하는지 아무도 모름… 사생활 철벽이라 에이스들 연애 현황 중에서 제일 궁금한 사람임. 여의도 에이스들 연애 소문이 줄줄이 도는 현장이 아주 흥미진진하다.",
        cm:[["ㄱㅇㅎ 대리는 품절 확정인데 ㄱㅇㅍ 대리는 연애하는지 아무도 모름ㅋㅋ 일 잘하는 사람들은 사생활도 철벽인가",36],["ㄱㅇㅍ 대리는 점심도 혼자 먹어서 정보가 하나도 없음ㅋㅋ",27,1],["동기 중에 아직 솔로인 사람 나 포함 몇 명이냐 손",19],["1",5,1],["ㄱㅇㅎ 대리 품절은 사실상 공식임ㅋㅋ",44],["ㄱㅇㅍ 대리는 사원증 목걸이도 안 걸고 다녀서 정보가 없음",31],["그건 성격이 그런 거지 철벽은 아님",16,1],["동기 중에 제일 말 없는 사람이 ㄱㅇㅍ 대리 아님?",23],["이런 글 올라오는 거 보면 우리 회사 평화로운 편이긴 함",34],["동기 모임 한 번 해야 하는데 날짜 못 잡는 중",24],["우리 동기들 다 바빠서 점심 한 번 먹기도 힘들음",29],["ㄱㅇㅎ 대리는 결혼 준비 중일 수도 있겠다",22],["그건 너무 앞서간 듯ㅋㅋ",14,1],["에이스라는 말이 부담스러울 수도 있겠다",19],["일 잘하는 사람이 사생활까지 완벽하면 곤란하지",26],["이 글 쓴 동기가 누군지 궁금하다",21],["우리 동기들 단톡방에선 별 얘기 없던데",17]]},
      {id:'n6',cat:['hot', 'bamboo'],ch:'일상·이야기',t:"재택 하루 더 늘려줬으면 좋겠다",l:162,v:'5,020',time:'2주 전',ct:['2026.10.24.', '2026.10.24.', '2026.10.25.', '2026.10.26.', '2026.10.26.', '2026.10.27.', '2026.10.27.', '2026.10.28.', '2026.10.29.', '2026.10.29.', '2026.10.29.', '2026.10.30.', '2026.10.30.', '2026.10.30.', '2026.10.31.'],au:'익명의 마케팅팀 직원',
        body:"주 2회 재택도 감지덕지이긴 한데 출퇴근에 쓰는 시간이 너무 아깝다. 다들 같은 마음 아닌가요?",
        cm:[["주 2회도 감지덕지입니다",38],["출근하는 날 지하철이 제일 힘들어요",47],["다들 같은 마음일 듯",21,1],["주 3일 재택하는 회사도 있다던데 부럽다",43],["재택하는 날이 제일 집중 잘 됨",35],["근데 팀 협업이 좀 느려지긴 함",24,1],["출근하면 오히려 야근이 줄어드는 사람도 있음ㅋㅋ",18],["회사 방침 바뀌기 전에 누릴 수 있을 때 누리자",29],["재택하는 날 점심 먹고 낮잠 자는 게 낙",36],["카메라 켜고 회의하는 건 아직 적응 안 됨",20],["출근하는 날 집중 안 되는 건 나만 그런가",27],["나는 반대임. 출근해야 일이 됨",22,1],["사람마다 다르니까 선택제가 제일 좋긴 함",31],["대중교통 시간 줄어드는 게 가장 큼",29],["결국 팀 분위기 따라 다름",18]]},
      {id:'sh5',cat:['love','bamboo'],ch:'신현카드 대나무숲',t:'ㅇㅈㅎ 실장님이랑 ㄱㅇㅎ 대리 스캔들 도는 거 진짜임?',l:203,v:'5,230',time:'3개월 전',ct:['2026.08.07.', '2026.08.07.', '2026.08.08.', '2026.08.08.', '2026.08.09.', '2026.08.10.', '2026.08.12.', '2026.08.13.', '2026.08.13.', '2026.08.14.', '2026.08.14.', '2026.08.15.', '2026.08.16.', '2026.08.16.', '2026.08.16.', '2026.08.17.', '2026.08.17.', '2026.08.17.', '2026.08.18.', '2026.08.18.'],au:'익명의 신현카드 사원',
        body:"요즘 사내에서 ㅇㅈㅎ 실장님이랑 ㄱㅇㅎ 대리 스캔들 도는 거 나만 들었냐?\n엘베에서 둘이 같이 내리는 거 봤다는 사람도 있고, 실장실에 밤늦게까지 둘만 있었다는 얘기도 있고… 출처는 모르겠는데 소문이 너무 퍼져서 궁금함.",
        cm:[["그 얘기 사내 메신저에서도 돌던데 출처가 불분명함",44],["실장실에서 밤늦게까지 불 켜져 있었다는 건 그냥 프로젝트 마감이었음 ㅇㅇ",57],["맞음 그날 우리 팀도 같이 야근함",33,1],["ㅇㅈㅎ 실장님 샤우팅하는 거 들으면 스캔들이 아니라 전쟁임ㅋㅋㅋ",72],["ㄱㅇㅎ 대리는 애인 따로 있다는 말도 돌던데 이건 또 뭐냐",39],["소문은 소문일 뿐. 일단 지켜보자",15,1],["확인도 안 된 얘기로 말 만들지 맙시다",28],["이 글 쓴 사람도 소문 퍼뜨린 사람 중 하나 아님ㅋㅋ",35],["실장님이랑 ㄱㅇㅎ 대리 둘 다 일 얘기 많이 하는 건 맞음",29],["회의 때 같이 있는 모습이 자주 보였을 뿐이겠지",21,1],["소문 돌 때마다 당사자들만 모르는 법",42],["그냥 둘 다 바쁜 사람들이라 같이 찍힌 거임",18],["진짜 확인된 건 하나도 없는 거 아님?",31],["소문이 소문을 낳는 전형적인 케이스ㅋㅋ",28],["실장님이 일 많이 맡기는 건 맞는 듯",24],["ㄱㅇㅎ 대리 이미 칭찬 자자하니까 그런 거겠지",33,1],["사내 메신저에서 누가 먼저 퍼뜨린 거냐",20],["그 얘기 나도 들었는데 출처는 모르겠음",15],["이런 글이 더 소문을 키우는 거 아님?",37],["그냥 웃고 넘어가자 다들",26]]},
      {id:"n8",cat:["hot", "bamboo"],ch:"직장생활",t:"카드 수수료 인하 기사 또 나왔네… 올해 또 힘들겠다",l:134,v:"3,910",time:"5일 전",ct:["2026.11.02.", "2026.11.02.", "2026.11.03.", "2026.11.03.", "2026.11.03.", "2026.11.03.", "2026.11.04.", "2026.11.05.", "2026.11.05.", "2026.11.05.", "2026.11.05.", "2026.11.05."],au:"익명의 신현카드 사원",
        body:"가맹점 수수료 재산정 얘기 또 나오는데 이번엔 영업팀도 분위기 안 좋음.\n경영진은 \"비용 절감\"만 얘기하고, 현장은 이미 쥐어짤 대로 짠 상태인데 어디서 더 줄이라는 건지 모르겠다. 다들 어떻게 보고 있어요?",
        cm:[["수수료 이슈는 매년 나오는데 올해가 제일 체감 큼", 31], ["영업팀 분위기 안 좋은 거 사실임. 목표는 그대로인데 마진이 줄어서", 58], ["그래서 연말 성과급이 걱정임", 16, 1], ["마케팅 예산부터 줄이겠지… 프로모션 반토막 날 듯", 57], ["부가서비스 줄이는 건 결국 고객 불만으로 돌아옴", 14], ["그래도 우리는 대형사라 버티는 거지 중소 카드사는 더 힘들 듯", 33], ["맞음 업계 전체가 힘든 시기", 7, 1], ["신사업(마이데이터, 페이)으로 메꾼다는데 아직 체감은 없음", 22], ["경영진 발표 자료 보면 항상 '위기 속 기회'라고만 써 있음ㅋㅋ", 37], ["이럴 때일수록 조직 흔들리지 않게 소통이나 좀 해줬으면", 47], ["연말 인사 앞두고 더 뒤숭숭함", 41], ["수수료 얘기하면 뭐해 월급은 그대로인데ㅋㅋ", 31]]},
      {id:"n9",cat:["cafe", "hot"],ch:"사내카페/복지",t:"구내식당 이번 주 메뉴 평가 좀",l:88,v:"2,780",time:"4일 전",ct:["2026.11.03.", "2026.11.04.", "2026.11.04.", "2026.11.05.", "2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 마케팅팀 직원",
        body:"월요일 제육, 화요일 돈가스, 수요일 비빔밥까진 괜찮았는데 목요일 생선구이는 진짜 호불호 갈리더라.\n오늘 메뉴 보고 밖에서 먹을지 고민 중임. 여의도 점심값도 너무 올라서 구내식당 의존도가 높아지는 중.",
        cm:[["수요일 비빔밥 나물이 진짜 맛있었음", 42], ["목요일 생선구이 냄새 때문에 사무실 가는 길에 이미 알아챔ㅋㅋ", 44], ["나는 오히려 좋았는데", 2, 1], ["여의도 점심 만 오천 원 시대라 구내식당이 최고임", 7], ["돈가스 소스 따로 주는 게 센스 있음", 15], ["샐러드바 종류 좀 늘려줬으면", 41], ["디저트는 언제 생기냐 요거트만 있음", 32], ["요거트 하나로 버티는 중ㅋㅋ", 20, 1], ["식권 시스템 앱으로 바뀌면 좋겠다", 36], ["줄 서는 시간이 제일 아까움 11시 40분이 골든타임", 21], ["조리사님들 항상 친절하셔서 감사함", 45], ["오늘 메뉴 뭐임? 이거 보려고 들어옴", 44]]},
      {id:"n10",cat:["bamboo"],ch:"직장생활",t:"결재 올릴 때 첨부파일 누락 진짜 자주 나는 사람",l:67,v:"1,820",time:"6일 전",ct:["2026.11.01.", "2026.11.02.", "2026.11.03.", "2026.11.04.", "2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 동기",
        body:"결재 올리고 나서 첨부 빠진 거 알게 되는 일이 한 달에 두 번은 있음. 반려되면 부장님 한 번 보고 다시 올려야 하는데 그 민망함이란…\n다들 뭐 체크리스트 같은 거 쓰세요?",
        cm:[["올리기 전에 미리보기 한 번 켜보는 습관 들이면 줄어듦", 38], ["나는 결재 올리기 전에 일부러 10분 쉬었다 다시 봄", 56], ["좋은 방법이네", 10, 1], ["첨부파일 이름에 날짜 안 넣으면 버전 헷갈려서 더 사고남", 17], ["팀장님이 '다음부터 잘 보고 올리세요' 한 마디 하면 하루가 끝남", 4], ["이건 시스템에서 경고창 띄워주면 좋겠음", 52], ["첨부 안 하셨습니다 팝업 하나만 있어도 살 듯", 5, 1], ["나만 그런 게 아니구나 위로됨", 27], ["서무님이 대신 확인해주는 팀 부럽다", 4], ["체크리스트 만들어서 모니터에 붙여놨음", 3]]},
      {id:"n11",cat:["cafe", "bamboo"],ch:"사내카페/복지",t:"연차 소진 독려 메일 왔는데 현실은 눈치게임",l:152,v:"4,640",time:"3일 전",ct:["2026.11.04.", "2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 신현카드 사원",
        body:"연말까지 연차 소진하라고 인사팀에서 메일 왔는데, 팀 일정 맞추다 보면 쓸 수 있는 날이 없음.\n다들 올해 연차 몇 개 남으셨나요? 저는 아직 8개 남았는데 12월에 몰아서 써야 하나 고민.",
        cm:[["나도 7개 남음 12월 중순에 몰아서 쓸 계획", 6], ["인사팀 메일은 매년 똑같은데 팀장님 허락이 문제임", 33], ["팀장님이 먼저 써야 우리도 쓰는 분위기", 24, 1], ["연차 촉진제도 있어서 안 쓰면 수당 못 받는 거 아님?", 7], ["올해는 반차로 쪼개서 쓰는 중", 15], ["평일 하루 껴서 4일 쉬는 게 제일 이득임", 20], ["12월은 다들 쓰려고 해서 일정 겹침", 22], ["그래서 미리 말해두는 중", 15, 1], ["연차 남은 사람 모여서 팀 단위로 같이 쓰자고 건의해볼까", 10], ["결국 눈치가 제일 큰 문제", 48], ["나는 작년에 다 못 써서 너무 아까웠음", 6], ["연차 사용 눈치 안 주는 팀이 진짜 좋은 팀임", 34]]},
      {id:"n12",cat:["hot", "bamboo"],ch:"일상·이야기",t:"올해 성과급 얼마 나올 것 같아? (불안)",l:176,v:"5,380",time:"2일 전",ct:["2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 마케팅팀 직원",
        body:"연말 성과급 시즌이 다가오는데 수수료 이슈도 있고 실적 얘기가 계속 나와서 불안함.\n작년이랑 비슷하게 나올까요? 아니면 줄어들까요?",
        cm:[["작년 수준만 나와도 감사할 듯", 38], ["수수료 이슈 때문에 줄 거라는 얘기 돌던데", 15], ["소문만 무성하고 확정된 건 없음", 15], ["소문 믿지 말고 공지 기다리자", 6, 1], ["팀마다 평가 달라서 편차가 클 듯", 27], ["성과급 나오면 뭐 살 건지 계획만 세우는 중ㅋㅋ", 29], ["연말 정산 환급금이랑 겹치면 큰데 올해는 별로 기대 안 함", 3], ["작년에 기대했다가 실망해서 이번엔 마음 비웠음", 54], ["그게 정신건강에 좋음", 2, 1], ["성과급은 로또라고 생각하는 게 편함", 28], ["인사팀에서 일정이라도 미리 알려줬으면", 41]]},
      {id:"n13",cat:["bamboo"],ch:"직장생활",t:"신입 공채 면접관 해본 사람 있어?",l:59,v:"1,710",time:"1주 전",ct:["2026.10.31.", "2026.10.31.", "2026.11.01.", "2026.11.01.", "2026.11.01.", "2026.11.02.", "2026.11.03.", "2026.11.04."],au:"익명의 동기",
        body:"이번에 면접관으로 들어가게 됐는데 처음이라 막막함. 어떤 질문 위주로 보면 좋은지, 주의할 점 같은 게 있으면 알려주세요.",
        cm:[["지원동기보다 경험에서 뭘 배웠는지 위주로 물어보면 좋음", 9], ["사적인 질문 하지 않는 게 제일 중요함 (결혼, 출신 등)", 5], ["맞음 인사팀 가이드 한 번 읽어보고 들어가", 8, 1], ["긴장한 지원자 많으니까 첫 질문은 편하게", 3], ["시간 지키는 것도 중요함. 길어지면 뒤 지원자한테 미안해짐", 24], ["평가표 기준 미리 맞춰두면 편함", 27], ["나도 처음에 긴장했는데 지원자가 더 긴장하고 있었음ㅋㅋ", 8], ["면접 끝나고 결과 정리할 때 객관적으로 쓰는 게 중요", 43]]},
      {id:"n14",cat:["cafe"],ch:"사내카페/복지",t:"사내 동호회 활동 해보신 분? (풋살/독서/러닝)",l:46,v:"1,450",time:"8일 전",ct:["2026.10.30.", "2026.10.31.", "2026.11.01.", "2026.11.02.", "2026.11.03.", "2026.11.04.", "2026.11.05.", "2026.11.05."],au:"익명의 신현카드 사원",
        body:"입사하고 나서 동호회 하나쯤은 들어보고 싶은데 어떤 곳이 분위기 좋은지 모르겠음.\n풋살, 독서, 러닝 이런 곳 활동 많이 하나요? 가입 팁 있으면 알려주세요.",
        cm:[["러닝 동호회 한강에서 주 1회 뛰는데 분위기 좋음", 41], ["독서 동호회는 한 달에 한 권씩 읽고 얘기하는데 부담 없음", 26], ["독서 쪽이 신입한테 제일 편할 듯", 16, 1], ["풋살은 부서 상관없이 친해질 수 있어서 좋긴 한데 부상 조심", 40], ["동호회 지원금 나오니까 신청서 확인해보세요", 39], ["가입 전에 한 번 구경 가보는 것도 가능함", 27], ["처음엔 어색한데 두세 번 나가면 금방 친해짐", 12], ["나도 하나 들어갈까 고민 중", 17]]},
      {id:"n15",cat:["bamboo", "hot"],ch:"직장생활",t:"보안 때문에 PC에서 뭐가 자꾸 막히는 거 나만 그래?",l:93,v:"2,960",time:"5일 전",ct:["2026.11.02.", "2026.11.03.", "2026.11.03.", "2026.11.04.", "2026.11.04.", "2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 신현카드 사원",
        body:"금융회사라 보안 중요한 건 아는데, 업무용 파일 하나 열려고 해도 승인 절차가 너무 많음. 외부 자료 받을 때마다 보안팀에 요청 넣어야 하는 것도 번거롭고…\n나만 이런 거 아니죠?",
        cm:[["외부 USB 막힌 건 이해하는데 클라우드 문서도 막히는 건 불편함", 18], ["보안팀 담당자분들 항상 바쁘셔서 답변이 늦음", 49], ["그래도 사고 나는 것보다는 나음", 25, 1], ["접근 권한 신청하는 시스템이 너무 복잡함", 38], ["새로 입사하면 권한 받는 데만 일주일 걸림", 27], ["보안 교육은 매년 똑같은 내용이라 졸림ㅋㅋ", 41], ["그래도 금융권이라 어쩔 수 없다고 생각함", 6], ["화면 캡처 막히는 건 업무할 때 좀 불편하더라", 5], ["개선 건의하는 창구가 있으면 좋겠다", 19]]},
      {id:"n16",cat:["bamboo"],ch:"일상·이야기",t:"여의도 점심 맛집 공유합시다",l:121,v:"3,640",time:"1주 전",ct:["2026.10.30.", "2026.10.31.", "2026.11.01.", "2026.11.02.", "2026.11.02.", "2026.11.03.", "2026.11.03.", "2026.11.03.", "2026.11.04."],au:"익명의 마케팅팀 직원",
        body:"맨날 가는 데만 가다 보니 질림. 사무실에서 도보 10분 이내로 갈 만한 데 추천 부탁드려요. 혼밥하기 좋은 곳이면 더 좋고요.",
        cm:[["지하상가 쪽 칼국수집 점심 때 줄 길지만 맛있음", 48], ["국회의사당역 근처 돈가스집 혼밥하기 좋음", 28], ["거기 소스가 맛있어서 인정", 21, 1], ["한강공원 쪽으로 걸어가면 샐러드 파는 데 있음", 36], ["점심시간 짧아서 멀리 가긴 힘들더라", 49], ["낙지볶음집 매운 거 좋아하면 추천", 11], ["오늘은 어디 갈지 고르는 게 제일 일임ㅋㅋ", 38], ["비 오는 날은 지하로만 다녀서 선택지가 제한됨", 42], ["혼밥은 지하 푸드코트가 마음 편함", 20]]},
      {id:"n17",cat:["bamboo"],ch:"직장생활",t:"퇴근 직전에 업무 요청 오는 거 어떻게 대처함?",l:184,v:"5,910",time:"4일 전",ct:["2026.11.03.", "2026.11.04.", "2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 동기",
        body:"5시 50분에 \"오늘 중으로 부탁드려요\" 하는 요청 올 때마다 마음이 무너짐.\n무조건 해야 하는 건지, 내일 해도 된다고 말해도 되는 건지 모르겠음. 다들 어떻게 하세요?",
        cm:[["내일 오전까지 드려도 되는지 먼저 물어보는 게 제일 안전함", 16], ["진짜 급한 건 거의 없음. 일단 마감 확인부터", 50], ["공감 요청하는 쪽도 여유 없는 경우가 많음", 10, 1], ["메신저로 요청 오면 기록 남겨두는 것도 중요", 18], ["퇴근 시간 지나서 연락 오는 건 안 받는 걸로 마음먹음", 14], ["팀장님한테 우선순위 물어보는 게 방법", 36], ["이런 요청이 한 번 시작되면 계속 오더라", 11], ["그래서 처음에 선을 잘 그어야 함", 11], ["현실은 결국 하게 되는 경우가 많음ㅋㅋ", 24], ["담당자 이름 확인하고 기억해둠", 47], ["야근 택시비 정산도 번거로움", 11], ["퇴근 직전 요청 금지 캠페인 하자", 4]]},
      {id:"n18",cat:["cafe", "bamboo"],ch:"사내카페/복지",t:"사내 카페 시즌 메뉴 나왔는데 먹어본 사람",l:77,v:"2,330",time:"2일 전",ct:["2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 신현카드 사원",
        body:"이번에 새로 나온 군고구마 라떼랑 쑥 아인슈페너 둘 중에 뭐가 나은지 궁금함. 줄이 길어서 고민하다 못 사 먹음ㅠ",
        cm:[["군고구마 라떼 달달해서 오후에 마시기 좋음", 25], ["쑥 아인슈페너는 호불호 갈릴 듯", 47], ["나는 쑥 맛이 은근 중독", 3, 1], ["점심시간엔 줄이 너무 길어서 3시쯤 가는 게 편함", 43], ["카페 앱 쿠폰으로 결제하면 할인됨", 7], ["사이즈 업이 천 원이라 부담 없음", 23], ["텀블러 가져가면 할인되는 거 아는 사람?", 7], ["시즌 메뉴 나올 때마다 한 번씩은 마셔보게 됨", 37]]},
      {id:"n19",cat:["hot", "bamboo"],ch:"직장생활",t:"연말 인사 앞두고 다들 어떤 기분이세요",l:142,v:"4,720",time:"3일 전",ct:["2026.11.04.", "2026.11.04.", "2026.11.04.", "2026.11.04.", "2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 마케팅팀 직원",
        body:"슬슬 인사 이동 얘기가 사내에 돌기 시작하는데 마음이 싱숭생숭함. 팀 옮기고 싶은 사람도, 남고 싶은 사람도 있을 텐데 다들 어떻게 준비하고 계세요?",
        cm:[["아직 아무 소식 없어서 오히려 더 불안함", 5], ["팀 이동 희망서 쓴 사람 있으면 반응 좀", 60], ["나는 올해도 그냥 현 부서 유지하고 싶음", 25, 1], ["인사철만 되면 복도에서 속닥속닥 분위기", 53], ["승진 대상자 발표 언제 나는지 아는 사람?", 24], ["올해는 조직 개편이 있다는 얘기도 있던데", 46], ["어떤 결과든 담담하게 받아들이려고 노력 중", 7], ["정해진 건 없으니까 일단 맡은 일부터 하자", 29], ["그게 맞음", 2, 1], ["이럴 때 괜히 소문 퍼뜨리지 말자", 39], ["12월 중순쯤 공지 나올 듯", 45]]},
      {id:"n20",cat:["bamboo", "hot"],ch:"직장생활",t:"팀장님이 회의 때마다 \"아까 말한 거 다시 정리해줘\" 하는 거 어떡하죠",l:168,v:"5,120",time:"3일 전",ct:["2026.11.04.", "2026.11.04.", "2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 신현카드 사원",
        body:"분명 회의 때 얘기 끝난 건데 끝나고 나서 \"아까 말한 거 한 번 더 정리해서 보내줘\" 하심. 회의록도 이미 공유했는데 또 요청…\n이거 그냥 제가 맞춰드리는 게 맞나요? 다들 이런 팀장님 어떻게 대하세요?",
        cm:[["회의록 공유할 때 핵심 3줄 요약 맨 위에 넣어보세요. 의외로 줄어듦", 52], ["팀장님들 대부분 본인이 머릿속 정리가 안 돼서 그러는 경우 많음", 21], ["공감 그래서 우리 팀은 회의 끝나기 전에 액션 아이템 같이 확인함", 4, 1], ["그냥 맞춰주는 게 속 편하긴 한데 반복되면 지침", 22], ["메신저로 '이렇게 이해했는데 맞을까요?' 먼저 보내두면 편함", 36], ["나는 템플릿 만들어놨음. 숫자만 바꿔서 바로 보냄ㅋㅋ", 49], ["템플릿 대박 나도 해야겠다", 16, 1], ["상사 성향 파악하는 게 반이라고 생각함", 42], ["그래도 시키는 사람은 이유가 있겠지… 라고 위로중", 4], ["이직하면 또 다른 스타일 상사 만날 뿐이다", 48]]},
      {id:"n21",cat:["bamboo"],ch:"직장생활",t:"부장님이 퇴근 시간 되면 갑자기 얘기 걸어오심",l:204,v:"6,430",time:"2일 전",ct:["2026.11.05.", "2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 마케팅팀 직원",
        body:"6시 땡 하면 가방 싸려는 순간 \"잠깐 얘기 좀 할까?\" 하시는데 막상 별 얘기도 아님. 30분 지나면 이미 7시임.\n눈치 봐서 거절하기도 어렵고… 다들 이럴 때 어떻게 빠져나오세요?",
        cm:[["약속 있다고 미리 말해두는 게 제일 확실함", 4], ["퇴근 10분 전에 먼저 가서 \"혹시 오늘 필요한 일 있으신가요?\" 물어보는 방법도 있음", 35], ["오 이거 좋다 미리 정리하게 되니까", 15, 1], ["부장님 입장에선 퇴근 직전이 한가해서 말 걸고 싶으신 걸지도", 6], ["그래도 일이랑 상관없는 얘기면 정중히 거절해도 됨", 5], ["저녁 약속 있다고 하면 대부분 보내주심", 45], ["나는 일부러 메신저 상태 '식사중'으로 바꿔놓음ㅋㅋ", 16], ["그건 좀 티나지 않나요", 13, 1], ["타이밍 맞춰서 미리 일어나는 연습 중임", 58], ["결국 관계 때문에 완전히 거절은 못 하겠더라", 39]]},
      {id:"n22",cat:["bamboo", "hot"],ch:"직장생활",t:"상사가 휴가 중인 직원한테 카톡 보내는 거 정상임?",l:231,v:"7,280",time:"1일 전",ct:["2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 동기",
        body:"연차 쓴 날 \"잠깐만 확인 좀 해줘\" 하고 연락 오는 거 은근 흔하지 않나요?\n내용은 사소한데 쉬는 날이라 마음이 불편해짐. 답장해야 하는지 아닌지 항상 고민됨.",
        cm:[["긴급한 거 아니면 휴가 끝나고 확인한다고 답하는 게 맞다고 봄", 23], ["나는 휴가 가기 전에 인수인계 메모 꼼꼼히 써두고 감", 39], ["그래도 연락 오는 건 피할 수 없음", 17, 1], ["정말 급하면 전화가 오지 카톡은 급한 게 아닌 경우가 많음", 33], ["연차는 법적 권리니까 당당하게 쉬어도 됨", 31], ["메신저 알림 꺼두고 쉬는 날은 아예 안 봄", 13], ["나중에 \"못 봤습니다\" 하면 의외로 별말 안 하심", 14], ["그게 정답일지도", 23, 1], ["휴가 전에 비상 연락 담당자 정해두면 좋음", 15], ["팀 문화가 중요함. 좋은 팀은 연차 중에 절대 연락 안 함", 8]]},
      {id:"n23",cat:["bamboo"],ch:"일상·이야기",t:"회식 2차 가자고 하는 상사 대처법 있음?",l:139,v:"4,350",time:"5일 전",ct:["2026.11.02.", "2026.11.03.", "2026.11.04.", "2026.11.05.", "2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 신현카드 사원",
        body:"1차에서 끝날 줄 알았는데 \"2차는 내가 쏜다\"는 말과 함께 분위기가 흘러감.\n안 가면 눈치 보이고 가면 새벽까지 이어지고… 다들 어떻게 하세요?",
        cm:[["1차 끝나고 \"내일 일정이 있어서요\" 한 마디 하고 인사하면 의외로 보내줌", 5], ["상사가 쏜다 해도 거절할 수 있는 건 거절해야 함", 39], ["그래도 팀 분위기 때문에 가끔은 가게 됨", 20, 1], ["2차 가면 보통 1시간만 있다 나옴", 40], ["회식 시간 자체가 많이 줄어든 편이긴 함", 26], ["빠질 땐 미리 일정 있다고 알려두는 게 좋음", 37], ["회식 문화 바뀌는 중이라 생각함", 52], ["우리 팀은 점심 회식으로 바뀜 너무 좋음", 8, 1], ["저녁 회식 줄고 점심 회식 늘어서 만족", 9], ["결국 팀장님 성향에 달려있음", 10]]},
      {id:"n24",cat:["bamboo", "hot"],ch:"직장생활",t:"보고서 한 줄 고치려고 하루 종일 붙잡고 있는 상사",l:187,v:"5,760",time:"4일 전",ct:["2026.11.03.", "2026.11.04.", "2026.11.05.", "2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 마케팅팀 직원",
        body:"\"이 문장 톤을 조금만 바꿔보자\"로 시작해서 오후 내내 단어 하나 놓고 왔다 갔다 하는 중…\n내용은 이미 다 끝났는데 문구 때문에 퇴근이 늦어짐. 이런 상사 만나본 사람?",
        cm:[["이거 완전 공감. 쉼표 하나 가지고 한 시간 쓴 적 있음", 56], ["그럴 땐 선택지를 두세 개 만들어서 고르시라고 하면 빨리 끝남", 34], ["오 선택지 방식 좋네요", 19, 1], ["어차피 윗선 보고용이라 부담이 커서 그런 듯", 50], ["내용이 아니라 표현에서 불안해하시는 경우 많음", 27], ["나는 마지막 수정 요청이면 '최종본'이라고 파일명에 적고 보냄ㅋㅋ", 5], ["ㅋㅋㅋ 효과 있나요?", 15, 1], ["상사도 윗사람한테 한 소리 들을까봐 그러는 거임", 13], ["수정 이력 다 남겨두면 나중에 편함", 46], ["결국 하루가 끝나감… 퇴근하고 싶다", 17]]},
      {id:"n25",cat:["bamboo"],ch:"직장생활",t:"신입한테 \"알아서 잘 하세요\" 하는 선배들 어떡하죠",l:112,v:"3,210",time:"1주 전",ct:["2026.10.31.", "2026.10.31.", "2026.10.31.", "2026.11.01.", "2026.11.02.", "2026.11.03.", "2026.11.04.", "2026.11.04."],au:"익명의 동기",
        body:"입사 3개월차인데 모르는 걸 물어보면 \"일단 해보고 안 되면 물어봐\"라고만 하시는 선배들이 많음.\n눈치껏 하라는 건지 아닌지 헷갈리고, 괜히 틀릴까봐 겁나요.",
        cm:[["처음엔 다 그래요. 질문 리스트 모아서 한 번에 물어보면 덜 부담스러움", 6], ["메모해서 매일 정리하는 습관 들이면 도움 됨", 37], ["저도 신입 때 그렇게 해서 살아남음", 16, 1], ["멘토 지정해달라고 팀장님께 말씀드리는 것도 방법", 25], ["물어보면 귀찮아하는 선배도 있고 아닌 선배도 있음", 53], ["질문할 때 '제가 이해한 게 맞는지' 먼저 보여주면 좋아함", 15], ["시간이 지나면 점점 눈에 들어옴", 19], ["그래도 신입 땐 모르는 게 당연한 거임. 너무 겁먹지 마세요", 15]]},
      {id:"n26",cat:["bamboo", "hot"],ch:"일상·이야기",t:"업무 지시가 매번 바뀌는 상사 어떻게 해야 해요?",l:196,v:"6,050",time:"3일 전",ct:["2026.11.04.", "2026.11.05.", "2026.11.05.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06.", "2026.11.06."],au:"익명의 신현카드 사원",
        body:"월요일에 지시한 거랑 수요일에 지시한 게 완전 반대임. 이미 반쯤 해놨는데 \"방향이 좀 바뀌었어\" 한마디에 처음부터 다시…\n어디서부터 대응해야 할지 모르겠음.",
        cm:[["일단 이메일이나 메신저로 지시 내용 기록 남겨두세요", 32], ["방향 바뀌면 \"이전 방향 대비 어떤 부분이 바뀐 건가요?\" 정확히 확인하는 게 좋음", 21], ["그러면 상사도 스스로 정리하게 됨", 5, 1], ["중간 공유를 자주 하면 큰 수정은 막을 수 있음", 44], ["상사도 위에서 지시가 바뀌어서 그런 경우가 많음", 37], ["작업 단계별로 확인받는 게 시간 절약됨", 18], ["나는 초안 30%만 하고 방향 확인받음", 29], ["이거 진짜 좋은 방법 같음", 2, 1], ["어차피 바뀔 거라 생각하고 완성도 너무 올리지 않기", 24], ["그래도 마음의 준비는 필요함", 29]]},
      {id:"n27",cat:["bamboo"],ch:"직장생활",t:"부서장 바뀌면 분위기 확 달라지는 거 겪어본 사람",l:98,v:"2,840",time:"6일 전",ct:["2026.11.01.", "2026.11.01.", "2026.11.02.", "2026.11.02.", "2026.11.03.", "2026.11.04.", "2026.11.04.", "2026.11.04."],au:"익명의 마케팅팀 직원",
        body:"이번에 인사 이동으로 부서장이 바뀔 수 있다는 얘기가 돌고 있음. 전에 부서장 바뀌었을 때 일하는 방식이 완전히 달라져서 적응하는 데 몇 달 걸렸는데…\n다들 비슷한 경험 있으세요?",
        cm:[["진짜 부서장 한 명 바뀌면 보고 체계부터 회의 방식까지 다 바뀜", 60], ["처음 한 달은 서로 탐색전임", 42], ["그래서 초반에 면담 요청하는 게 좋음", 15, 1], ["새 부서장 스타일 파악하는 게 제일 중요", 56], ["기존 방식 고집하지 말고 일단 맞춰보는 게 편함", 50], ["좋은 분 오시면 분위기 확 좋아지기도 함", 21], ["경험상 3개월 지나면 다 적응하더라", 22], ["불안하지만 일단 지켜보자", 38]]},
    ];
    PO.forEach(x=>{ if(x.cm) x.c=x.cm.length; });
    let cat=null;
    const CATS=[['hot','🔥 실시간 핫토픽'],['bamboo','🏢 신현카드 대나무숲'],['cafe','☕ 사내카페/복지'],['love','💔 연애/목격담']];
    /* 책 광고 6종 (낙원과 케이크 / 하나부터 열까지 1·2·3권 / 하나부터 열까지 전자책 / 이러려고 세자가 된 건 아니었습니다만) — 보여줄 때마다 랜덤 */
    const BKADS=6;
    const bkAd=k=>{ if(k==null) k=Math.floor(Math.random()*BKADS);
      const PUB='콩푸 · 정유출판사';
      const mk=(cls,small,title,sub,img)=>h('div',{class:'bdad1 bk2 '+cls},h('div',{class:'bkt'},h('b',{},...title),h('em',{},sub)),h('img',{src:img,alt:''}),h('u',{},'AD'));
      if(k===1) return mk('bkh bkh1','',[h('img',{class:'bkty',src:'photos/ty-hana.png',alt:'하나부터 열까지'})],'단행본 1권 · 콩푸 · 정유출판사','photos/ad-hana1.jpg');
      if(k===2) return mk('bkh bkh2','',[h('img',{class:'bkty',src:'photos/ty-hana.png',alt:'하나부터 열까지'})],'단행본 2권 · 콩푸 · 정유출판사','photos/ad-hana2.jpg');
      if(k===3) return mk('bkh bkh3','',[h('img',{class:'bkty',src:'photos/ty-hana.png',alt:'하나부터 열까지'})],'단행본 3권 · 콩푸 · 정유출판사','photos/ad-hana3.jpg');
      if(k===4) return mk('bkhana','',[h('img',{class:'bkty',src:'photos/ty-hana.png',alt:'하나부터 열까지'})],'전자책 1~3권 · 콩푸 · 정유출판사','photos/ad-hana.jpg');
      if(k===5) return mk('bkseja','',[h('img',{class:'bkty bktys',src:'photos/ty-seja.png',alt:'이러려고 세자가 된 건 아니었습니다만'})],'소장본 · 콩푸 · 정유출판사','photos/ad-seja.webp');
      return mk('rd','NEW BOOK',['paradise',h('br'),'and cake'],'낙원과 케이크 · '+PUB,'photos/ad-book2.webp'); };
    const home=()=>[
      h('div',{class:'bdlounge'},h('i',{class:'bdcir',style:'background:#101a35;overflow:hidden;width:36px;height:36px',html:LG('신현카드')}),h('div',{},h('b',{},'신현카드 라운지'),h('small',{},'강 대리님 · 신현카드 인증 완료'))),
      h('div',{class:'bdkw'},h('small',{},'실시간 검색어'),...['ㅇㅈㅎ 실장 샤우팅','연말 성과급','사내 카페'].map((t,i)=>h('span',{},h('em',{},String(i+1)),t))),
      h('div',{class:'bdchips bdcat'},...CATS.map(([k,t])=>h('span',{class:cat===k?'on':'',onclick:()=>{ cat=cat===k?null:k; draw(); }},t))),
      bkAd(),
      h('h2',{class:'bdh'},'토픽 베스트'),
      ...PO.filter(po=>!cat||po.ad||(po.cat||[]).includes(cat)).map(po=>row(po.ad?po.av:SHAV(),po.ch,h('span',{},po.img?h('i',{class:'bdimg',html:IMG}):null,po.t),po.l,po.c,po.v,po.ad?null:po)),
      h('div',{class:'bdmore'},'토픽 베스트 더보기'),
      h('div',{style:'height:130px'})];
    function profile(){
      const e3=K.page(); e3.classList.add('bdpage','bdpd');
      const li=(t,r,c)=>h('div',{class:'bdpl'},h('span',{},t),h('b',{style:c?'color:'+c:''},r));
      e3.append(padTop(),
        h('div',{class:'bdpth'},h('i',{class:'bdbk',onclick:()=>nav.pop(),html:I('<path d="M15 5l-7 7 7 7"/>',24,'#222',2.200)}),h('b',{},'내 프로필')),
        h('div',{class:'scroll'},
          h('div',{class:'bdpf'},h('span',{class:'bdme big',html:LG('신현카드')}),h('div',{},h('b',{},'신현카드 · 대리'),h('small',{},'회사 이메일 인증 완료'))),
          h('div',{class:'bdgap'}),
          li('내가 쓴 글','0'),li('내가 쓴 댓글','0'),li('스크랩','0'),li('받은 좋아요','0'),
          h('div',{class:'bdgap'}),
          li('알림','새 알림 1',"#e0625c"),li('내 회사','신현카드'),li('직군','대외협력'),
          h('div',{style:'height:150px'})));
      e3.append(chrome('teamblind.com')); nav.push(e3);
    }
    function chanBooks(){
      const e4=K.page(); e4.classList.add('bdpage','bdpd');
      const P=[
        {hot:1,t:'나 지금 사당에 신 모시러 간다',b:'불완전 중편 읽은 사람 있어? 나 길 가면서 읽다가 주저앉았잖아.. 제발 나도 향 피우러 갈게... 제발ㅠㅠ',co:'대한과학공학원',nk:'y*****',v:318,l:21,c:0,tm:'오늘'},
        {t:'콩푸 작가 신작 불완전 읽은 사람?',b:'불완전 上 나왔길래 읽어봤는데 첫 장면부터 분위기 장난 아니네요. 하 다음 편 언제 나오는지ㅠㅠ',co:'한솔자산운영공단',nk:'k*****',v:212,l:9,c:0,tm:'5일'},
        {t:'아 날씨 쌀쌀해지니까 진짜 [하나부터 열까지] 생각나서 미치겠네',b:'아니 진짜 왜 이렇게 눈물이 나는 거냐고... 역시 슬픈 사랑이 제일 강하다는 게 진리임. 날이 쌀쌀해지려 하니까 진짜 [하나부터 열까지] 싹 다 더 생각나는 밤이라 안 되겠다. 회사 일에 치여 살다가도 이맘때쯤 되면 이 기류랑 서사가 아주 뼈를 때림. 다들 과몰입 치료 좀 어떻게 해주셈... 난 오늘 밤도 홀린 듯이 다시 정주행하러 간다 ㅠㅠ',co:'한빛전력설계',nk:'w*****',v:203,l:13,c:0,tm:'3일'},
        {t:'하나부터 열까지 시리즈 정주행 후기',b:'올라온 편까지 한 번에 달렸는데 이틀 밤샘함. 이렇게 이야기 풀어가는 거 신선하다 싶었음. 다음 편 올라오면 또 밤샐 듯',co:'선라인플러스',nk:'h*****',v:189,l:11,c:0,tm:'6일'},
        {t:'요즘 나태해져서 책을 안 읽기 시작하니',b:'다시 독서 집중하기가 되게 어렵네요 참.. 요즘 왜 이렇게 산만하지 계절이 계절인지라 분위기 타나',co:'시민건강케어공단',nk:'무********',v:75,l:1,c:0,tm:'5일'},
        {t:'책 추천 해주실 수 있을까요',b:'이제 막 책에 재미를 붙이기 시작해서 책에 대한 지식이 깊지 않습니다 제가 최근 읽었던 책들 중 좋았던 것, 별로였던 것 나름대로 정리해봤는데 혹시 추천해주실만한 책이 있을까요? 이…',co:'한빛전력설계',nk:'i*******',v:151,l:0,c:0,tm:'6일'},
        {t:'이러려고 세자가 된 건 아니었습니다만 완결 후기',b:'이 글 읽고 난 이제 진짜 경복궁 여시가 됨.. 나만 그래?',co:'신현카드',nk:'s****',v:164,l:7,c:0,tm:'1주'},
        {t:'사랑은 약속이다',b:'사랑은 감정이나 느낌이 아니다. 사랑은 의지의 영역이 속한다.',co:'대한과학공학원',nk:'P*********',v:135,l:3,c:0,tm:'10.31'},
        {t:'웹소설 소장본 신청 해보신 분 계세요?',b:'좋아하는 작가님 소장본 진행한다는데 처음이라 잘 모르겠어요. 입금하고 나서 얼마나 걸리나요? 후기 좀 알려주세요',co:'시민연금운영단',nk:'m*****',v:98,l:4,c:0,tm:'10.30'},
        {t:'책 기록 어디에 해 다들?',b:'ㅈㄱㄴ 노션에 했다가 블로그에 했다가 왔다리갔다리하네ㅠ 하나에 정착해야하는뎅',co:'고요한남매들',nk:'i*********',v:105,l:0,c:0,tm:'10.29'},
        {t:'낙원과 케이크 上 읽은 사람 있어?',b:'퇴근 길에 읽다가 내릴 정류장 놓칠 뻔함. 왜 이렇게 슬퍼? 어쩌다보니까 나 그냥  버스에서 그냥 사연 있어서 우는 사람 됨..',co:'아마루나',nk:'n*****',v:187,l:8,c:0,tm:'10.27'},
        {t:'북스타그램 맞팔 하실분 계신가여',b:'전 독서모임 채널이긴한데 그래도..',co:'치과의사',nk:'7******',v:85,l:0,c:0,tm:'10.19'},
        {t:'민연사 인문잡지한편 시리즈',b:'되게재밌네 ~! 혹시 비슷한 책 있으면 추천해줄 사람~',co:'시민연금운영단',nk:'l*********',v:67,l:2,c:0,tm:'10.18'},
        {t:'좋아하는 책 주제로 얘기나눌사람',b:'~~~있을까요',co:'새회사',nk:'P*********',v:45,l:0,c:0,tm:'10.17'}];
      const EYE=I('<path d="M2 12s3.500-6.500 10-6.500S22 12 22 12s-3.500 6.500-10 6.500S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',17),BM=I('<path d="M6 4h12v17l-6-4-6 4z"/>',21,'#8a8f99',1.600);
      const card=p=>h('div',{class:'bdbk3','data-v':p.v,'data-id':p.id||'bk'+P.indexOf(p),onclick:()=>post({id:p.id||'bk'+P.indexOf(p),ch:'책 읽는 사람들',t:p.t,body:p.b,co:p.co,nk:p.nk,time:p.tm,v:p.v,l:p.l,c:0,cm:[],back:()=>refreshCounts&&refreshCounts()})},
        h('div',{class:'bdbkx'},
          h('div',{class:'bdbkt'},p.t),h('div',{class:'bdbkb'},p.b),
          h('div',{class:'bdbkw'},p.co+' · '+p.nk),
          h('div',{class:'bdbkf'},h('span',{html:EYE+p.v}),h('span',{html:HT+(p.l||'좋아요')}),h('span',{class:'bdcc3',html:CM+p.c}),h('em',{},p.tm),h('i',{html:BM}))),
        p.img?h('img',{class:'bdbki',src:p.img,alt:''}):null);
      e4.append(padTop(),
        h('div',{class:'bdpth'},h('i',{class:'bdbk',onclick:()=>nav.pop(),html:I('<path d="M15 5l-7 7 7 7"/>',24,'#222',2.200)}),h('div',{class:'bdttl'},h('b',{},'책 읽는 사람들'),h('small',{class:'bdnote'},'(하나부터 열까지의 스토리와는 무관합니다)')),h('span',{class:'bdsrt',html:I('<path d="M8 4v16M8 20l-3-3M8 20l3-3M16 20V4M16 4l-3 3M16 4l3 3"/>',17,'#222',1.800)+'최신순'})),
        h('div',{class:'scroll'},...(()=>{ const n=P.length, at=new Set(); while(at.size<2) at.add(2+Math.floor(Math.random()*(n-2)));   /* 광고 2개를 글 사이 아무 데나 */
            const ks=Array.from({length:BKADS},(_,i)=>i).sort(()=>Math.random()-.5);   /* 광고마다 다른 책 */
            let ai=0; const L=[]; P.forEach((p,i)=>{ L.push(card(p)); if(at.has(i)) L.push(bkAd(ks[ai++])); }); return L; })(),h('div',{style:'height:150px'})));
      /* ---- 방문자 글쓰기 (서버 /api/posts) ---- */
      const scr=e4.querySelector('.scroll');
      const markHot=()=>{ let best=null,bv=-1; scr.querySelectorAll('.bdbk3').forEach(el=>{ const b=el.querySelector('.bdhot'); if(b) b.remove(); const v=+el.dataset.v||0; if(v>bv){ bv=v; best=el; } });
        if(best){ const x=best.querySelector('.bdbkx'); x.insertBefore(h('b',{class:'bdhot'},'HOT'),x.firstChild); if(scr.firstChild!==best) scr.insertBefore(best,scr.firstChild); } };   /* 조회수가 가장 높은 글에 항상 HOT */
      markHot();
      /* 댓글이 달리면 목록의 댓글 숫자도 올려요 */
      var refreshCounts=()=>{ api('/api/comment-counts?ns='+NS).then(d=>{ scr.querySelectorAll('.bdbk3').forEach(el=>{ const n=(d.counts||{})[NS+'-'+el.dataset.id]||0; const sp=el.querySelector('.bdcc3'); if(sp) sp.innerHTML=CM+n; }); }).catch(()=>{}); };
      refreshCounts();
      const upCard=u=>card({t:u.title,b:u.body,co:'신현카드',nk:MKI(u.anon)+'*****',v:1,l:0,c:0,tm:ago(u.created),id:'u'+u.id});
      api('/api/posts?chan='+NS+'-books').then(d=>{ const first=scr.firstChild; (d.posts||[]).forEach(u=>scr.insertBefore(upCard(u),first)); markHot(); refreshCounts(); }).catch(()=>{});
      const compose=()=>{ const ti=h('input',{class:'bwti',placeholder:'제목',maxlength:60}), bo=h('textarea',{class:'bwbo',placeholder:'내용을 입력해 주세요',maxlength:1000}); let busy=false;
        const e5=K.page(); e5.classList.add('bdpage','bdpd'); const sub=h('button',{class:'bwok'},'등록');
        sub.onclick=async()=>{ if(busy) return; const title=ti.value.trim(), body=bo.value.trim(); if(!title){ K.toast('제목을 입력해 주세요'); return; } if(!body){ K.toast('내용을 입력해 주세요'); return; }
          busy=true; try{ const d=await api('/api/posts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chan:NS+'-books',anon:ANON,title,body})}); scr.insertBefore(upCard(d.post),scr.firstChild); markHot(); nav.pop(); K.toast('게시글이 등록됐어요'); }catch(e){ K.toast(e.message); } busy=false; };
        e5.append(padTop(),h('div',{class:'bdpth'},h('i',{class:'bdbk',onclick:()=>nav.pop(),html:I('<path d="M15 5l-7 7 7 7"/>',24,'#222',2.200)}),h('b',{},'글쓰기'),sub),h('div',{class:'bwbx'},ti,bo,h('small',{},'책 읽는 사람들 채널에 신현카드 직원으로 올라가요.')));
        e5.append(chrome('teamblind.com')); nav.push(e5); setTimeout(()=>ti.focus(),350); };
      e4.append(h('div',{class:'bwfab',onclick:compose,html:I('<path d="M12 20h9M16.500 3.500a2.100 2.100 0 0 1 3 3L7 19l-4 1 1-4z"/>',24,'#fff',2)}));
      e4.append(chrome('teamblind.com')); nav.push(e4);
    }
    /* ---- 댓글 서버 (worker.js · /api/comments) ---- */
    const NS=location.pathname.indexOf('/t-8k2q/')>=0?'t':'v';   // 테스트 사이트와 원래 사이트 댓글은 따로 저장돼요
    const ANON=(()=>{ try{ let v=localStorage.getItem('kyh_blind_anon'); if(!/^\d{4}$/.test(v||'')){ v=String(1000+Math.floor(Math.random()*9000)); localStorage.setItem('kyh_blind_anon',v); } return v; }catch(e){ let x=7; for(const c of navigator.userAgent+screen.width+'x'+screen.height) x=(x*31+c.charCodeAt(0))>>>0; return String(1000+x%9000); } })();   // 같은 브라우저에서는 새로고침해도 그대로
    const MKI=v=>{ const n=parseInt(v,10)||0; return String.fromCharCode(97+n%26)+String.fromCharCode(97+Math.floor(n/26)%26); };   // 숫자 → 알파벳 2자
    const api=async(path,opt)=>{ let r; try{ r=await fetch(path,opt); }catch(e){ throw new Error('댓글 서버에 연결할 수 없어요'); } let d={}; try{ d=await r.json(); }catch(e){} if(!r.ok) throw new Error(d.error||'댓글 서버에 연결할 수 없어요'); return d; };
    const ago=t=>{ const m=Math.floor((Date.now()-t)/60000); return m<1?'방금 전':m<60?m+'분 전':m<1440?Math.floor(m/60)+'시간 전':m<43200?Math.floor(m/1440)+'일 전':Math.floor(m/43200)+'개월 전'; };
    const pwBox=(title,msg,ok,cb)=>{ const o=K.$('#overlay'); o.innerHTML=''; const inp=h('input',{type:'password',maxlength:20,placeholder:'비밀번호',autocomplete:'off'});
      const go=()=>{ const v=inp.value; if(v.length<(ok==='등록'?4:1)){ K.toast(ok==='등록'?'비밀번호는 4자 이상이에요':'비밀번호를 입력해 주세요'); return; } o.classList.remove('show'); cb(v); };
      inp.addEventListener('keydown',ev=>{ if(ev.key==='Enter'&&!ev.isComposing){ ev.preventDefault(); go(); } });
      o.append(h('div',{class:'dlg'},h('div',{class:'bd'},h('h4',{},title),msg?h('p',{},msg):null,inp),h('div',{class:'btns'},h('button',{onclick:()=>o.classList.remove('show')},'취소'),h('button',{onclick:go},ok)))); o.classList.add('show'); setTimeout(()=>inp.focus(),80); };
    function post(po){
      const e2=K.page(); e2.classList.add('bdpage','bdpd'); let liked=false,n=po.l; const pid=NS+'-'+po.id;
      const lk=h('span',{class:'bdlk',html:HT+n}), cmn=h('span',{html:CM+po.c}), cmn2=h('span',{html:CM+po.c}), vw=h('span',{html:EY+po.v}), mk=String.fromCharCode(97+[...po.id].reduce((a,c)=>a+c.charCodeAt(0),0)%26)+'********', BKM=I('<path d="M6 4h12v17l-6-4.500L6 21z"/>',22,'#222',1.800), DOTS=I('<circle cx="5" cy="12" r="1.500" fill="#222"/><circle cx="12" cy="12" r="1.500" fill="#222"/><circle cx="19" cy="12" r="1.500" fill="#222"/>',22,'#222');
      lk.onclick=()=>{ liked=!liked; n=po.l+(liked?1:0); lk.className='bdlk'+(liked?' on':''); lk.innerHTML=(liked?HT.replace('fill="none"','fill="#e0625c"').replace(/stroke="#8a8f99"/,'stroke="#e0625c"'):HT)+n; };
      const cmh=h('div',{class:'bdcmh'},'댓글 ',h('b',{},String(po.cm.length))), box=h('div',{class:'bdsv'}); let svN=0;
      const upd=()=>{ cmh.querySelector('b').textContent=String(po.cm.length+svN); cmn.innerHTML=CM+(po.c+svN); cmn2.innerHTML=CM+(po.c+svN); };
      const delAdmin=async(c,el)=>{ if(!confirm('이 댓글을 삭제할까요? (달린 답글도 함께 지워져요)')) return; try{ await api('/api/admin/comments/'+c.id,{method:'DELETE',headers:{'x-admin-key':K.adminKey()}}); svN-=1+el.querySelectorAll('.bdrps .bdcm').length; el.remove(); upd(); K.toast('댓글을 삭제했어요'); }catch(er){ K.toast(er.message); } };
      const delC=(c,el)=>K.ADMIN?delAdmin(c,el):pwBox('댓글 삭제','댓글을 쓸 때 정한 비밀번호를 입력해 주세요','삭제',async pw=>{ try{ await api('/api/comments/'+c.id,{method:'DELETE',headers:{'content-type':'application/json'},body:JSON.stringify({pw})}); svN-=1+el.querySelectorAll('.bdrps .bdcm').length; el.remove(); upd(); K.toast('댓글을 삭제했어요'); }catch(er){ K.toast(er.message); } });
      const dstr=t=>{ const d=new Date(t); return d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0')+'.'; };
      const CLK=I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.500l3.500 2"/>',19,'#9aa0aa',1.800);
      const hv=(l)=>{ let on=false,n=l||0; const sp=h('span',{class:'bdhv',html:HT+(n?n:'좋아요')}); sp.onclick=()=>{ on=!on; const m=n+(on?1:0); sp.innerHTML=(on?HT.replace('fill="none"','fill="#e0625c"').replace(/stroke="#8a8f99"/,'stroke="#e0625c"'):HT)+(m?m:'좋아요'); sp.classList.toggle('on',on); }; return sp; };
      const cm1=({anon,text,likes,date,reply,cnt,del,onRep,co})=>h('div',{class:'bdcm'+(reply?' rp':'')},h('div',{class:'bdcu'},h('b',{class:'bdcc2'},co||'신현카드'),h('span',{},'· '+MKI(anon)+'******'),del?h('i',{class:'bddel',onclick:del},'삭제'):null),h('div',{class:'bdct'},text),h('div',{class:'bdcl2'},h('span',{html:CLK+date}),hv(likes),cnt?h('span',{html:CM.replace(/width="19" height="19"/,'width="19" height="19"')+cnt}):null,onRep?h('span',{class:'bdrpb',onclick:onRep},'답글'):null));
      const lst=h('div',{class:'bdbl'}); let shown=0; const PAGE=8;
      const HOLD={}, PEND={}; let rt=null;
      const rbar=h('div',{class:'bdrbar'}), inp=h('input',{class:'bdinp',placeholder:K.ADMIN?'정유출판사로 댓글을 남겨보세요':'신현카드 직원으로 댓글을 남겨보세요',maxlength:200,autocomplete:'off'});
      const setRt=(key,who)=>{ rt=key?{key,who}:null; rbar.innerHTML=''; rbar.style.display=rt?'flex':'none'; inp.placeholder=rt?'답글을 남겨보세요':(K.ADMIN?'정유출판사로 댓글을 남겨보세요':'신현카드 직원으로 댓글을 남겨보세요'); if(rt){ rbar.append(h('span',{},who+'님에게 답글 다는 중'),h('i',{onclick:()=>setRt(null)},'✕')); inp.focus(); } };
      const hold=key=>{ const rb=HOLD[key]; if(rb&&PEND[key]){ PEND[key].forEach(f=>f()); delete PEND[key]; } return rb; };
      const cmEl=ci=>{ const [t,l,rp]=po.cm[ci]; let top=ci; while(top>0&&po.cm[top][2]) top--; let cnt=0; if(!rp){ for(let k=ci+1;k<po.cm.length&&po.cm[k][2];k++) cnt++; } const hs=[...t].reduce((x,c)=>(x*31+c.charCodeAt(0))>>>0,7); const an=String(1000+hs%9000);
        const wrap=h('div'), rb=h('div',{class:'bdrps'}); wrap.append(cm1({anon:an,text:t,likes:l,date:(po.ct||[])[ci]||po.time,reply:rp,cnt,onRep:()=>setRt('b'+top,MKI(an)+'******')}),rb); if(!rp){ HOLD['b'+ci]=rb; hold('b'+ci); } return wrap; };
      const mbtn=h('div',{class:'bdcmore'});
      const showMore=()=>{ let end=Math.min(po.cm.length,shown+PAGE); while(end<po.cm.length&&po.cm[end][2]) end++; for(let i=shown;i<end;i++) lst.append(cmEl(i)); shown=end; const left=po.cm.length-shown; mbtn.style.display=po.cm.length?'':'none'; mbtn.classList.toggle('off',left<=0); mbtn.textContent='댓글 더보기'+(left>0?' ('+left+')':''); };
      mbtn.onclick=()=>{ if(!mbtn.classList.contains('off')) showMore(); }; showMore();
      const addC=(c,fresh)=>{ const par=c.parent; const el=cm1({co:c.co,anon:c.anon,text:c.body,likes:0,date:dstr(c.created),reply:!!par,onRep:()=>setRt(par||String(c.id),MKI(c.anon)+'******')});
        el.querySelector('.bdcu').append(h('i',{class:'bddel',onclick:()=>delC(c,wrap)},'삭제')); const wrap=h('div'), rb=h('div',{class:'bdrps'}); wrap.append(el,rb);
        if(!par){ HOLD[String(c.id)]=rb; box.prepend(wrap); }
        else { const put=()=>{ HOLD[par].append(wrap); }; if(HOLD[par]) put(); else (PEND[par]=PEND[par]||[]).push(put); }
        svN++; upd(); };
      api('/api/comments?post='+pid).then(d=>{ box.innerHTML=''; svN=0; d.comments.forEach(c=>addC(c)); }).catch(()=>{});
      const btn=h('button',{class:'bdsend'},'등록'); let busy=false;
      const send=()=>{ const body=inp.value.trim(); if(!body){ K.toast('댓글 내용을 입력해 주세요'); return; } if(busy) return;
        pwBox('비밀번호 설정','나중에 이 댓글을 지울 때 필요해요. (4자 이상)','등록',async pw=>{ busy=true; try{ const d=await api('/api/comments',{method:'POST',headers:Object.assign({'content-type':'application/json'},K.ADMIN?{'x-admin-key':K.adminKey()}:{}),body:JSON.stringify({post:pid,anon:ANON,body,pw,parent:rt?rt.key:null})}); const wasRp=!!rt; addC(d.comment); inp.value=''; setRt(null); K.toast('댓글을 등록했어요'); if(!wasRp) setTimeout(()=>{ const sc2=e2.querySelector('.scroll'); sc2.scrollTop=Math.max(0,cmh.offsetTop-8); },50); }catch(er){ K.toast(er.message); } busy=false; }); };
      btn.onclick=send; inp.addEventListener('keydown',ev=>{ if(ev.key==='Enter'&&!ev.isComposing){ ev.preventDefault(); send(); } });
      e2.append(padTop(),
        h('div',{class:'bdpth'},h('i',{class:'bdbk',onclick:()=>{ nav.pop(); if(po.back){ po.back(); return; } const y=SY; draw(); sc.scrollTop=y; },html:I('<path d="M15 5l-7 7 7 7"/>',24,'#222',2.200)}),h('b',{},po.ch),(K.ADMIN&&/^u\d+$/.test(po.id))?h('span',{class:'bdfol',style:'color:#e03131;border-color:#e03131',onclick:async()=>{ if(!confirm('이 글을 삭제할까요? (달린 댓글도 함께 지워져요)')) return; try{ await api('/api/admin/posts/'+po.id.slice(1),{method:'DELETE',headers:{'x-admin-key':K.adminKey()}}); document.querySelectorAll('.bdbk3').forEach(el=>{ if(el.dataset.id===po.id) el.remove(); }); nav.pop(); K.toast('글을 삭제했어요'); }catch(er){ K.toast(er.message); } }},'글 삭제'):null,h('span',{class:'bdfol'+(po.ch==='신현카드 대나무숲'?' on':'')},po.ch==='신현카드 대나무숲'?'팔로잉':'팔로우'),h('span',{style:'margin-left:auto',html:I('<circle cx="5" cy="12" r="1.500" fill="#222"/><circle cx="12" cy="12" r="1.500" fill="#222"/><circle cx="19" cy="12" r="1.500" fill="#222"/>',22,'#222')})),
        h('div',{class:'scroll'},
          h('div',{class:'bdpb'},h('h1',{},po.t),
            h('div',{class:'bdau2'},h('b',{},po.co||'신현카드'),' · '+(po.nk||mk)),
            h('div',{class:'bdmt'},h('span',{html:CLK+po.time}),h('span',{html:EY+po.v}),cmn2,h('i',{class:'bdmr',html:BKM}),h('i',{html:DOTS})),
            h('div',{class:'bdtx'},...po.body.split('\n').map(l=>h('p',{},l||' '))),
            h('div',{class:'bdst2'},lk,cmn,h('i',{class:'bdshr',html:I('<circle cx="18" cy="5" r="2.600" fill="#fff"/><circle cx="6" cy="12" r="2.600" fill="#fff"/><circle cx="18" cy="19" r="2.600" fill="#fff"/><path d="M8.300 10.800l7.400-4.300M8.300 13.200l7.400 4.300"/>',22,'#fff',1.800)}))),
          cmh,
          box,lst,mbtn,
          h('div',{style:'height:150px'})),
        rbar,
        h('div',{class:'bdin'},h('span',{class:'bdme sm',html:LG('신현카드')}),inp,btn));
      e2.append(chrome('teamblind.com')); nav.push(e2);
    }
    const chan=(av,n,f,d,on0,go)=>{ const fb=h('span',{class:'bdfb'+(on0?' on':''),onclick:()=>{ const on=fb.classList.toggle('on'); fb.textContent=on?'팔로잉':'팔로우'; }},on0?'팔로잉':'팔로우'); return h('div',{class:'bdcc',onclick:go?(ev=>{ if(ev.target.closest('.bdfb')) return; go(); }):null},av,h('div',{class:'bdcb2'},h('b',{},n),h('small',{},f),d?h('p',{},d):null),fb); };
    const chans=()=>[
      h('div',{class:'bdad2'},h('i',{},'AD'),h('span',{},'새 책 알림, 지금 받아보세요'),h('em',{},'바로가기')),
      h('h2',{class:'bdh'},'채널 탐색'),
      h('div',{class:'bdchips'},...['🔥 인기 채널','✨ 신규 채널','일상/이야기','친목/모임','취미','경제/재테크','맛집/요리'].map((t,i)=>h('span',{class:i===0?'on':''},t))),
      chan(h('i',{class:'bdcir',style:'background:#101a35;overflow:hidden;width:52px;height:52px',html:LG('신현카드')}),'신현카드 대나무숲','1,284 팔로워','신현카드 임직원들의 사내 이야기, 복지, 연애 목격담',true),
      chan(cimg('books'),'책 읽는 사람들','16.3K 팔로워','독서 취향 나누기',false,()=>chanBooks()),
      chan(cimg('unmarried'),'4n 미혼방','2,367 팔로워','이 채널은 ‘4N 미혼’을 대상으로 운영되며, 여기서 미혼은 혼인 이력이 없는 경우를 의미합니다…'),
      chan(cimg('wine'),'와인이부터 와른이까지','10.7K 팔로워','데일리 와인 / 특가 와인 / 가심비 와인 등 추천 콜키지 프리 음식점, 와인 성지 공유 (…'),
      chan(cimg('estate'),'부동산','6.8M 팔로워'),
      chan(cimg('love'),'썸·연애','6.7M 팔로워'),
      chan(cimg('swim'),'수영수영','22K 팔로워','수영하는 사람들'),
      chan(cimg('single'),'I’m솔로','6.7M 팔로워'),
      chan(cimg('interior'),'인테리어 & 라이프 스타일','2,619 팔로워','인테리어, 라이프 스타일 팁을 공유하는 채널입니다.'),
      h('div',{style:'height:130px'})];
    const LG=nm=>{ const T=(x,y,fs,fill,txt)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="Pretendard,Apple SD Gothic Neo,Malgun Gothic,sans-serif" font-size="${fs}" font-weight="900" fill="${fill}">${txt}</text>`;
      const art=nm==='민연사'?'<image href="photos/ic-min-co.jpg" width="100" height="100" preserveAspectRatio="xMidYMid slice"/>':nm==='교보문고'?'<rect width="100" height="100" fill="#20397c"/><ellipse cx="76" cy="33" rx="9" ry="6.500" fill="#6cc04a"/><circle cx="70" cy="29" r="4.500" fill="#6cc04a"/><path d="M78 37l-2 8" stroke="#6cc04a" stroke-width="3" stroke-linecap="round"/>'+T(48,59,19.500,'#fff','KYOBO').replace('<text','<text letter-spacing="1.600"')+T(48,76,15,'#fff','교보문고'):'<rect width="100" height="100" fill="#101a35"/><image href="photos/ic-sh-logo.png" x="31" y="14" width="38" height="43"/>'+T(50,82,18,'#d3d6de','신현카드');
      return `<svg viewBox="0 0 100 100" width="100%" height="100%">${art}</svg>`; };
    const star=(n)=>h('span',{class:'bdst'},'★★★★★'.slice(0,Math.round(n)),h('u',{},'★★★★★'.slice(Math.round(n))));
    const co=(bg,nm,r,rv,tt,ob)=>h('div',{class:'bdco'},h('div',{class:'bdcb',style:'background:'+bg}),h('i',{class:'bdcl',html:LG(nm)}),h('b',{class:'bdcn'},nm),h('div',{class:'bdcr'},star(r),h('b',{},r.toFixed(1)),h('small',{},'·'+rv+'개 리뷰')),h('div',{class:'bdrec'},'👍🏻 직원이 추천하는 기업'),
      h('div',{class:'bdgr'},...ob.map(([v,k])=>h('span',{},h('b',{},v.toFixed(1)),h('i',{},'★'),k))),h('div',{class:'bdq'},tt));
    let rcat=5;
    const RC=[{t:'커리어 향상을 기대할 수 있는 기업',e:'🚀',l:['아마루나','보바리퍼블릭']},{t:'워라밸이 좋은 기업',e:'⚖️',l:['시민연금운영단','동해가스에너지공사','시민건강케어공단']},{t:'급여 및 복지가 우수한 기업',e:'💎',l:['고요한남매들','onetoten 텔레콤','보바리퍼블릭']},{t:'사내문화가 우수한 기업',e:'☘️',l:['한빛전력설계','고요한남매들','선라인플러스']},{t:'경영진이 지지받는 기업',e:'👤',l:['대한과학공학원','보바리퍼블릭','한솔자산운영공단']},{t:'직원이 추천하는 기업',e:'👍🏻',l:['동해가스에너지공사','선라인플러스','대한과학공학원']}];
    const CL={'아마루나':['#fff','#222','amaruna'],'보바리퍼블릭':['#4f7dff','#fff','B'],'시민연금운영단':['#232a82','#fff','SYM'],'동해가스에너지공사':['#eef0f3','#2a4ea0','동해가스'],'시민건강케어공단':['#f4f4f4','#d33','케어'],'고요한남매들':['#e6e6e6','#111','고요한'],'onetoten 텔레콤':['#b8323a','#fff','onetoten'],'한빛전력설계':['#f5f5f5','#c33','한빛'],'선라인플러스':['#6cc04a','#fff','SUN+'],'대한과학공학원':['#f5f5f5','#c4472f','KAIE'],'한솔자산운영공단':['#f5f5f5','#243a7a','한솔']};
    const MINI=nm=>{ if(!CL[nm]) return LG(nm); const c=CL[nm]; return `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="50" fill="${c[0]}"/><text x="50" y="58" text-anchor="middle" font-size="${c[2].length>5?20:28}" font-weight="900" fill="${c[1]}" font-family="Pretendard,sans-serif">${c[2]}</text></svg>`; };
    const COV={sh:'linear-gradient(135deg,#0d1b3a,#2e5aa8)',kb:'linear-gradient(135deg,#1c3b2a,#4a8a62)',my:'linear-gradient(135deg,#2c4a2a,#6aa35c)',a:'linear-gradient(135deg,#0a0a3a,#1f1f8a)',b:'linear-gradient(135deg,#c9cdd2,#8e949c)',g:'linear-gradient(135deg,#2f3a44,#6d7b88)',s:'linear-gradient(135deg,#1f2a33,#6b8a99)',n:'linear-gradient(135deg,#050a1a,#1b2d55)',t:'linear-gradient(135deg,#8aa3ab,#c4d0d4)'};
    const RCO=[
      [['아마루나',4.1,'1,116','a','이제 다 끝난 것 같은데','현직원 · 영업 전문가',[4.4,4.0,3.8,3.9,3.3]],['보바리퍼블릭',3.8,'1,938','b','다른회사 비판하지만 그회사들보다 더 총체적 난국인회사. 여기저기 언플 심해지는거 보고 못참고 적습니다.','전직원 · IT 기획·매니지먼트 전문가',[4.1,2.4,4.2,3.5,3.4]]],
      [['시민연금운영단',3.6,'1,287','g','급여 및 복지의 하향평준화를 추구하는 회사','현직원 · 경영전략·사업기획·분석전문가',[2.8,4.5,2.8,3.9,2.7]],['동해가스에너지공사',4.2,'881','g','기술직에게 탑이라고 불리는 회사','현직원 · 건설 엔지니어',[3.4,4.5,4.1,3.9,3.0]],['시민건강케어공단',3.8,'3,057','g','별로','현직원 · 회계·세무·재무 전문가',[3.0,4.4,3.2,3.8,2.9]]],
      [['고요한남매들',4.0,'1,861','a','장점이 많은 회사','전직원 · IT 기획·매니지먼트 전문가',[3.8,3.5,4.3,4.1,3.3]],['onetoten 텔레콤',3.7,'2,018','t','개발자의 무덤','현직원 · IT 기획·매니지먼트 전문가',[2.9,4.2,4.2,3.6,2.7]],['보바리퍼블릭',3.8,'1,938','b','다른회사 비판하지만 그회사들보다 더 총체적 난국인회사. 여기저기 언플 심해지는거 보고 못참고 적습니다.','전직원 · IT 기획·매니지먼트 전문가',[4.1,2.4,4.2,3.5,3.4]]],
      [['한빛전력설계',4.1,'838','t','김천인것만 제외하면 최고의…회사 ?','현직원 · 건설 엔지니어',[4.0,4.4,4.0,4.3,3.1]],['고요한남매들',4.0,'1,861','a','장점이 많은 회사','전직원 · IT 기획·매니지먼트 전문가',[3.8,3.5,4.3,4.1,3.3]],['선라인플러스',4.1,'1,698','n','조직장들이 다 해먹는 곳','현직원 · IT 디자이너',[4.0,4.0,4.1,4.1,3.2]]],
      [['대한과학공학원',4.1,'1,616','g','천룡인 정규직들의 갑질을 느낄 수 있는 곳','현직원 · 연구개발(R&D)',[4.1,4.0,3.7,3.7,3.5]],['보바리퍼블릭',3.8,'1,938','b','다른회사 비판하지만 그회사들보다 더 총체적 난국인회사. 여기저기 언플 심해지는거 보고 못참고 적습니다.','전직원 · IT 기획·매니지먼트 전문가',[4.1,2.4,4.2,3.5,3.4]],['한솔자산운영공단',3.9,'848','g','내일 없어져도 아무런 이상 없는 곳','현직원 · 경영전략·사업기획·분석전문가',[3.4,4.0,3.7,3.7,3.4]]],
      [['신현카드',4.0,'342','sh','안정적이고 복지는 좋은데 월말 마감은 늘 전쟁','현 직원 · 마케팅',[4.0,4.1,4.1,3.8,3.2]],['교보문고',3.9,'215','kb','책을 좋아하면 다닐 만한 회사','현직원 · 영업·마케팅',[3.5,3.8,3.6,4.1,3.3]],['민연사',4.2,'128','my','책 만드는 사람들이 모인 곳','현직원 · 편집자',[3.9,3.7,3.5,4.2,3.6]],['동해가스에너지공사',4.2,'881','g','기술직에게 탑이라고 불리는 회사','현직원 · 건설 엔지니어',[3.4,4.5,4.1,3.9,3.0]],['선라인플러스',4.1,'1,698','n','조직장들이 다 해먹는 곳','현직원 · IT 디자이너',[4.0,4.0,4.1,4.1,3.2]],['대한과학공학원',4.1,'1,616','g','천룡인 정규직들의 갑질을 느낄 수 있는 곳','현직원 · 연구개발(R&D)',[4.1,4.0,3.7,3.7,3.5]]]
    ];
    const KEY=['커리어 향상','워라밸','급여 및 복지','사내문화','경영진'], HL=[0,1,2,3,4];
    const co2=([nm,r,rv,cv,tt,who,sc5],ci)=>{ const hi=[0,1,2,3,4][[0,1,2,3,4].includes(ci)?ci:0]; return h('div',{class:'bdco'},h('div',{class:'bdcb',style:'background:'+COV[cv]}),h('i',{class:'bdcl',html:MINI(nm)}),h('b',{class:'bdcn'},nm),h('div',{class:'bdcr'},star(r),h('b',{},r.toFixed(1)),h('small',{},'·'+rv+'개 리뷰')),h('div',{class:'bdrec'},RC[ci].e+' '+RC[ci].t.replace('을 기대할 수 있는','이 기대되는').replace('커리어 향상이 기대되는 기업','커리어 향상이 기대되는 기업')),h('div',{class:'bdgr'},...sc5.map((v,k)=>h('span',{class:k===ci?'hl':''},h('b',{},v.toFixed(1)),h('i',{},'★'),KEY[k]))),h('div',{class:'bdq'},h('div',{},tt),h('small',{},who))); };
    const rev=()=>[
      h('div',{class:'bdhero'},h('b',{},'숨겨진 나만의 1위 기업'),h('small',{},'회원 리뷰로 확인하는 진짜 회사 이야기'),h('div',{class:'bdhs'},h('span',{html:I('<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',22,'#222',1.800)}),'나에게 맞는 회사를 찾아보세요')),
      h('div',{class:'bdmy'},h('div',{class:'bdmb'},h('span',{html:I('<path d="M4 20l4-1 11-11a2.100 2.100 0 0 0-3-3L5 16z"/>',18,'#4a6cf0',2.200)}),'내 회사 리뷰하기'),h('p',{},'회원님의 리뷰는 구직자들이 회사를 검토하는 데 도움이 됩니다. 직접 경험한 이야기를 남겨주세요.')),
      h('h2',{class:'bdh'},'리뷰로 더 나은 내일을 가지세요'),
      h('div',{class:'bdrvcs'},...RC.map((c,i)=>h('div',{class:'bdrvc'+(i===rcat?' on':''),onclick:()=>{ rcat=i; const y=sc.scrollTop; draw(); sc.scrollTop=y; }},h('b',{},c.t),h('span',{class:'bdcls'},...c.l.map(x=>h('i',{html:MINI(x)})))))),
      h('div',{class:'bdcos'},...RCO[rcat].map(x=>co2(x,rcat))),
      h('div',{style:'height:130px'})];
    const draw=()=>{ e.querySelector('.bdtabs')&&e.querySelector('.bdtabs').replaceWith(tabs()); sc.innerHTML=''; sc.append(...[home,chans,rev][tab]()); sc.scrollTop=0; };
    e.append(padTop(),bar(),tabs(),sc); draw();
    e.append(chrome('teamblind.com'));
    nav.push(e);
  }
  function pagePub(){
    const e=K.page(); e.classList.add('gpage');
    e.append(padTop(),GL('정유출판사'),h('div',{class:'scroll'},
            h('div',{class:'gpanel'},h('div',{class:'phd'},h('div',{},h('div',{class:'pt2'},'정유출판사'),h('div',{class:'ps'},'출판사 · 서울특별시')),h('img',{class:'plogo',src:'photos/pub-logo.png'})),
        h('div',{class:'pbtn'},h('span',{},'웹사이트'),h('span',{},'길찾기'),h('span',{},'저장')),
        h('div',{class:'pr'},h('b',{},'분야: '),'소설 · 에세이 단행본'),h('div',{class:'pr'},h('b',{},'사원수: '),'1명 (2024.10.11)'),
        h('div',{class:'pbk'},h('b',{},'출간 도서'),h('div',{class:'bks'},['사랑이 아니어도','사랑이 아니어도2','화한 것에 대하여'].map((t,i)=>h('div',{class:'bk'},h('i',{style:'background:'+['#e8b4b8','#b4c7e8','#c9e8b4'][i]},'정유'),h('small',{},t)))))),
      res('예스24','https://www.yes24.com','공여선 | 국내작가','공여선 작가는 국내작가로 대표작 《사랑이 아니어도》, 《사랑이 아니어도2》, 《화한 것에 대하여》을 비롯한 작...','y'),
      res('알라딘','https://www.aladin.co.kr','정유출판사 - 출판사별 도서','정유출판사에서 출간한 도서 목록. 사랑이 아니어도, 사랑이 아니어도2, 화한 것에 대하여 ...','a'),
      res('교보문고','https://product.kyobobook.co.kr','정유출판사 | 출판사 소개 · 신간 도서','신간 소식과 베스트셀러, 작가 소개를 만나 보세요.','k'),
      res('블로그','https://m.blog.naver.com','정유출판사 신간 후기 | 사랑이 아니어도2 읽고 나서','출간 소식을 듣고 바로 주문해서 읽었어요. 문장 하나하나가 오래 남는 소설이었습니다.','b'),
      botPad()));
    e.append(chrome('google.com'));
    nav.push(e);
  }
  const LOCK={'솔방울길':pageSol,'정유출판사':pagePub,'민연사 유튜브':()=>K.openApp('youtube',{channel:'민연사'})};   // '민연사 유튜브' 검색기록 → 유튜브 앱의 민연사 채널 화면
  const render=start;
  render();
}};

/* =================== 인스타그램 =================== */
K.apps.instagram = { mount(root,p,ctl){
  ctl.bar(true);
  const pg=K.page(); pg.classList.add('ig'); const sc=h('div',{class:'scroll'}); root.append(pg);
  const render=()=>{
    pg.innerHTML='';
    pg.append(padTop(),h('div',{class:'hdr'},h('span',{},'Instagram'),h('span',{style:'display:flex;gap:18px;font-size:24px;font-family:var(--font)'},h('button',{onclick:()=>K.pickFiles(async fs=>{ const u=await K.resizeToDataURL(fs[0],900); if(!u) return; K.prompt('문구 입력','',v=>{ S().igPosts.unshift({user:D.instagram.handle,text:v,img:u,likes:0}); K.save(); render(); },{ok:'공유'}); },false)},'＋'),h('span',{},'✈︎'))),
      h('div',{class:'stories'},D.instagram.stories.map((n,i)=>h('div',{class:'st'+(i===0?' me':'')},h('i',{},h('span',{style:i===0?'background:linear-gradient(145deg,#d9dee8,#aab4c6)':''},['성','👩','👨','☕','🏙️'][i])),n))),sc,h('div',{class:'itab'},h('i',{html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="#111" stroke="#111" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7.500L21 11v9.500h-6.500v-6h-5v6H3z"/></svg>'}),h('i',{html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#111" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><rect x="3.500" y="3.500" width="17" height="17" rx="4.500"/><path d="M3.500 9h17M9 3.500l3 5.500M15 3.500l3 5.500"/><path d="M10.500 12.500v4.500l4-2.250z" fill="#111"/></svg>'}),h('i',{html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#111" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3.500L10 14M21 3.500l-6.500 17-4-6.500-6.500-4z"/></svg>'}),h('i',{html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#111" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500L21 21"/></svg>'}),h('i',{html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#111" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.500" r="4"/><path d="M4.500 20.500c.8-4 3.700-6 7.500-6s6.700 2 7.500 6"/></svg>'})));
    sc.innerHTML='';
    [...S().igPosts,...D.instagram.posts].forEach(po=>{
      const pi=h('div',{class:'pi'}); if(po.img) pi.style.backgroundImage=`url(${po.img})`; else { pi.style.background=`linear-gradient(145deg,${po.a},${po.b})`; pi.textContent=po.glyph; }
      let liked=false; const hr=h('button',{onclick:()=>{liked=!liked;hr.textContent=liked?'♥':'♡';hr.style.color=liked?'#ff3b30':'';lk.textContent='좋아요 '+(po.likes+(liked?1:0))+'개';}},'♡'); const lk=h('div',{class:'lk'},'좋아요 '+po.likes+'개');
      sc.append(h('div',{class:'post'},h('div',{class:'ph'},h('i'),po.user),pi,h('div',{class:'ac'},hr,'💬','✈︎'),lk,h('div',{class:'cp'},h('b',{},po.user+' '),po.text)));
    });
    sc.append(botPad());
  };
  render();
}};

/* =================== 유튜브 (실제 앱 모양 · 다크) =================== */
K.apps.youtube = { mount(root,p,ctl){
  ctl.bar(false);
  const pg=K.page(); pg.classList.add('yt'); root.append(pg);
  const st=(sz,inner,extra='')=>`<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${inner}</svg>`;
  const IC={
    bell:st(26,'<path d="M6 17V11a6 6 0 0 1 12 0v6l1.500 2h-15z"/><path d="M10 21.500h4"/>'),
    search:st(26,'<circle cx="10.500" cy="10.500" r="6.500"/><path d="m15.500 15.500 5 5"/>'),
    gear:st(26,'<circle cx="12" cy="12" r="3"/><path d="M12 2.500l1.600 2.300 2.700-.6.900 2.600 2.600.9-.6 2.700L21.500 12l-2.300 1.600.6 2.700-2.600.9-.9 2.600-2.700-.6L12 21.500l-1.600-2.300-2.700.6-.9-2.600-2.600-.9.6-2.700L2.500 12l2.300-1.600-.6-2.700 2.600-.9.9-2.600 2.700.6z"/>'),
    dots:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="5" cy="12" r="1.800"/><circle cx="12" cy="12" r="1.800"/><circle cx="19" cy="12" r="1.800"/></svg>',
    chev:st(20,'<path d="M9 5l7 7-7 7"/>'),chevd:st(18,'<path d="M6 9l6 6 6-6"/>'),
    home:'<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2.800 3 9.800V21h6.500v-6.500h5V21H21V9.800z"/></svg>',
    homeO:st(28,'<path d="M12 3.300 4 9.500V20.500h5.500v-6h5v6H20V9.500z"/>'),
    shorts:st(28,'<path d="M9.500 3.500 16 7a3 3 0 0 1 .5 5L15 13M14.500 20.500 8 17a3 3 0 0 1-.5-5L9 11"/><path d="m10 9.500 5 2.500-5 2.500z" fill="currentColor"/>'),
    plus:st(30,'<circle cx="12" cy="12" r="10"/><path d="M12 7.500v9M7.500 12h9"/>'),
    heart:st(34,'<path d="M12 20.500C4 15 2.500 11 2.500 8.300 2.500 5.700 4.500 4 6.800 4c2 0 3.900 1.200 5.200 3.300C13.300 5.200 15.200 4 17.200 4c2.300 0 4.300 1.700 4.300 4.300 0 2.700-1.500 6.700-9.500 12.200z"/>'),
    cmt:st(34,'<path d="M4 4.500h16v11.500H10l-5 4v-4H4z"/><path d="M8 9h8M8 12.500h5"/>'),
    mark:st(34,'<path d="M6 3.500h12v17l-6-4.500-6 4.500z"/>'),
    share:st(34,'<path d="M21 11 14 4.500v4C7 9 4 13 3 19.500c2.500-3.500 6-5 11-5v4z"/>'),
    remix:st(34,'<path d="M4 9a8 8 0 0 1 14-3.500L20 8M20 3.500V8h-4.500M20 15a8 8 0 0 1-14 3.500L4 16M4 20.500V16h4.500"/><path d="M12 9.500v5M9.500 12h5"/>'),
    cast:st(26,'<path d="M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/><path d="M3 12a9 9 0 0 1 9 9M3 16a5 5 0 0 1 5 5"/>')
  };
  const SH='<svg viewBox="0 0 24 24" width="34" height="34"><path d="M9.500 3.500 16 7a3 3 0 0 1 .5 5L15 13" fill="none" stroke="#ff2a3d" stroke-width="3.800" stroke-linecap="round"/><path d="M14.500 20.500 8 17a3 3 0 0 1-.5-5L9 11" fill="none" stroke="#ff2a3d" stroke-width="3.800" stroke-linecap="round"/><path d="m10 9.500 5 2.500-5 2.500z" fill="#ff2a3d"/></svg>';
  const LOGO='<img class="l" src="photos/yt-logo-l.png" alt="YouTube" style="height:28px;display:block"><img class="d" src="photos/yt-logo.png" alt="YouTube" style="height:28px;display:block">';
  const hash=s=>{ let x=7; for(const c of s) x=(x*31+c.charCodeAt(0))>>>0; return x; };
  const fmtV=n=>n>=1e8?(n/1e8).toFixed(1).replace(/\.0$/,'')+'억':n>=1e4?(n>=1e5?Math.round(n/1e4):(n/1e4).toFixed(1).replace(/\.0$/,''))+'만':n>=1e3?(n/1e3).toFixed(1).replace(/\.0$/,'')+'천':String(n);
  const AGO=['6일 전','2주 전','3주 전','1개월 전','2개월 전','5개월 전','1년 전','2년 전'];
  const COL=['#7aa7ff','#3ddc97','#ffb86b','#c792ea','#ff7a90','#5fd0d6'];
  const Y=D.youtube||{}, me=Y.me||{name:'강영현',handle:'@'+((D.instagram&&D.instagram.handle)||'kangyh').replace(/^@/,'')};
  const vids=(Y.videos||D.playlist.tracks.map(t=>({t:t.t,ch:t.a,cv:t.cv,dur:t.d||'3:30'}))).map(v=>{ const hs=hash(v.t+(v.ch||'')); return {...v, views:v.views!=null?v.views:(hs%97)*10000+(hs%9)*1000+20000, ago:v.ago||AGO[hs%AGO.length], col:COL[hs%COL.length], likes:v.likes!=null?v.likes:(hs%900)+30, cm:(hs%40)+2}; });
  const go=v=>{ if(v.jm&&K.jmSawVideo) K.jmSawVideo(); if(v.watch){ wv=v; render(); return; } if(v.ytLink) window.open(v.ytLink,'_blank','noopener'); };   // 유튜브 안의 영상은 data.js에서 ytLink를 직접 적은 것만 열려요 (안 적으면 눌러도 아무 일 없음)
  const avatar=(v,sz)=>h('i',{class:'yav',style:`width:${sz}px;height:${sz}px;background:${v.col||'#7aa7ff'};font-size:${Math.round(sz*.42)}px`},(v.ch||'?').trim().charAt(0).toUpperCase());
  const meAv=sz=>h('i',{class:'yav',style:`width:${sz}px;height:${sz}px;background:#6b5bd6;color:#fff;font-size:${Math.round(sz*.5)}px;font-weight:500`},'강');
  const thumb=v=>v.pic?h('div',{class:'yth pic',style:`background-image:url(${v.cv})`},v.dur?(/플레이리스트/.test(v.t)?h('span',{class:'ydur pl',html:'<svg viewBox="0 0 24 24" width="15" height="15" fill="#fff"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>'+v.dur}):h('span',{class:'ydur'},v.dur)):null,v.prog?h('div',{class:'yprog'},h('i',{style:`width:${v.prog}%`})):null):v.full?h('div',{class:'yth full',style:`background-image:url(${v.cv})`}):v.bg?h('div',{class:'yth'},h('div',{class:'ybgt',style:`background:${v.bg};color:${v.fg||'#0b0b0b'}`},v.big||''),h('span',{class:'ydur'},v.dur||'3:30')):h('div',{class:'yth'},h('div',{class:'ybg',style:`background-image:url(${v.cv||''})`}),h('div',{class:'ysq',style:`background-image:url(${v.cv||''})`}),h('span',{class:'ydur'},v.dur||'3:30'));
  const more=(v)=>h('button',{class:'ymore',html:IC.dots,onclick:e=>{e.stopPropagation(); K.sheet(v.t,[{t:'나중에 볼 동영상에 저장',fn:()=>K.toast('나중에 볼 동영상에 저장했어요')},{t:'공유',fn:()=>K.toast('링크를 복사했어요')},{t:'관심 없음',fn:()=>K.toast('이 동영상을 숨겼어요')}]);}});
  const meta=v=>v.ch+(v.views===0?'  ':'  ▷'+fmtV(v.views)+'  ')+v.ago;
  const wide=v=>h('div',{class:'yw'+((v.full||v.row)?' sm':''),onclick:()=>go(v)},thumb(v),h('div',{class:'ywm'},h('div',{class:'ytt'},v.t),more(v)),h('div',{class:'yts'},meta(v)));
  const card=v=>h('div',{class:'yc',onclick:()=>go(v)},thumb(v),h('div',{class:'ym'},h('div',{class:'yt2'},h('div',{class:'ytt'},v.t),h('div',{class:'yts'},meta(v))),more(v)));
  const shortsGrid=(arr,head=true)=>h('div',{class:'ysh'},head?h('div',{class:'yshh'},h('span',{html:SH}),h('b',{},'Shorts'),h('span',{class:'yshm',html:IC.dots})):null,
    h('div',{class:'ysg'},arr.map((v,i)=>h('div',{class:'ysc',style:`background-image:url(${v.cv||''})`,onclick:()=>{ tab='shorts'; sIdx=vids.indexOf(v); render(); }},(i%3===1)?h('span',{class:'ynew'},'새 동영상'):null,h('span',{class:'ysmore',html:IC.dots}),h('div',{class:'ysct'},v.ch+' - '+v.t)))));
  const chAv=(c,sz)=>{ const T=(x,y,fs,fill,txt,w=800)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="Pretendard,Apple SD Gothic Neo,Malgun Gothic,sans-serif" font-size="${fs}" font-weight="${w}" fill="${fill}">${txt}</text>`;
    const art=c.av==='book'?'<rect width="100" height="100" fill="#fff"/>'+T(50,66,52,'#111','책',900):c.av==='min'?'<image href="photos/ic-min.jpg" width="100" height="100" preserveAspectRatio="xMidYMid slice"/>':c.av==='kb'?'<rect width="100" height="100" fill="#20397c"/><ellipse cx="76" cy="33" rx="9" ry="6.500" fill="#6cc04a"/><circle cx="70" cy="29" r="4.500" fill="#6cc04a"/><path d="M78 37l-2 8" stroke="#6cc04a" stroke-width="3" stroke-linecap="round"/>'+T(48,59,19.500,'#fff','KYOBO',800).replace('<text','<text letter-spacing="1.600"')+T(48,76,15,'#fff','교보문고',900):c.av==='pe'?'<defs><radialGradient id="gpe" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#d9defa"/><stop offset="1" stop-color="#8f9fe6"/></radialGradient></defs><rect width="100" height="100" fill="url(#gpe)"/>':'<rect width="100" height="100" fill="#101a35"/><image href="photos/ic-sh-logo.png" x="31" y="14" width="38" height="43"/>'+T(50,82,18,'#d3d6de','신현카드',900);
    return h('i',{class:'yav',style:`width:${sz}px;height:${sz}px;overflow:hidden`,html:`<svg viewBox="0 0 100 100" width="${sz}" height="${sz}">${art}</svg>`}); };
  const SHORTS=(Y.shorts||[]).map(v=>({...v,views:0,ago:''}));   // 쇼츠 탭에 보이는 영상 (data.js의 youtube.shorts)
  const CHS=(Y.channels||[]), subVids=[]; for(let k=0;k<4;k++) CHS.forEach((c,ci)=>{ const v=c.videos[k]; if(v) subVids.push({...v,ci,hide:!!c.hide,ch:c.name,views:v.views!=null?v.views:100,ago:v.ago||'1개월 전'}); });
  // 홈: 노래 말고 data.js 채널에 넣은 영상 섬네일들을 앱을 열 때마다 무작위 순서로 보여줘요 (숨김 채널·재생목록 제외)
  const homeVids=[]; CHS.forEach(c=>{ if(c.hide) return; (c.videos||[]).forEach(v=>{ if(v.full||v.row) return; homeVids.push({...v,ch:c.name,c0:c,views:v.views!=null?v.views:100,ago:v.ago||'1개월 전'}); }); });
  const vcard=v=>h('div',{class:'ycc',onclick:()=>go(v)},thumb(v),h('div',{class:'ycm'},h('span',{class:'ycav',onclick:e=>{ e.stopPropagation(); openCh(v.c0); }},chAv(v.c0,40)),h('div',{class:'yt2'},h('div',{class:'ytt'},v.t),h('div',{class:'yts'},meta(v))),more(v)));
  const HIST=(Y.searchHistory||[]);
  const ICH='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.500 12a8.500 8.500 0 1 0 2.600-6.100"/><path d="M3 3.500V8h4.500"/><path d="M12 7.500V12l3 2"/></svg>';
  const ICA='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 17L7 7"/><path d="M7.500 15.500V7h8.500"/></svg>';
  const ICM='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21"/></svg>';
  let inpEl=null;
  const shuffle=()=>{ for(let i=homeVids.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [homeVids[i],homeVids[j]]=[homeVids[j],homeVids[i]]; } homeVids.sort((a,b)=>(a.last?1:0)-(b.last?1:0)); };   /* data.js에서 last: true 를 단 영상은 홈 맨 아래 */ shuffle();   // 홈으로 올 때마다 다시 섞어요
  let wv=null;   // 시청 화면으로 열린 영상 (data.js에서 watch: true 를 단 영상만)
  let tab='home', sub=0, q=null, sIdx=0, selCh=null, subX=0, showAll=false;
  let nPage=false, libPage=null;   // 알림 화면 / 보관함 목록(좋아요 표시한 동영상·형) 화면
  const subSet=new Set(CHS.map(c=>c.name));   // 구독 중인 채널 (구독 목록에 있는 채널은 처음부터 구독중)
  const AGDAYS=t=>{ const m=/(\d+)(일|주|개월|년) 전/.exec(t||''); return m?parseInt(m[1])*({'일':1,'주':7,'개월':30,'년':365}[m[2]]):99999; };
  const allVids=()=>{ const a=[]; CHS.forEach(c=>{ (c.videos||[]).forEach(v=>{ if(v.full) return; a.push({...v,ch:c.name,c0:c,hide:!!c.hide,views:v.views!=null?v.views:100,ago:v.ago||'1개월 전'}); }); }); return a; };
  const DOTS3='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="12" cy="5" r="1.800"/><circle cx="12" cy="12" r="1.800"/><circle cx="12" cy="19" r="1.800"/></svg>';
  const bellGo=()=>{ nPage=true; libPage=null; chPage=null; render(); };
  const LIBS=[{key:'좋아요',name:'좋아요 표시한 동영상',sm:'비공개'},{key:'형',name:'형',sm:'비공개 · 동영상 6개'}];
  let chPage=null; if(p&&p.channel){ const ci=CHS.findIndex(c=>c.name===p.channel); if(ci>=0) chPage=ci; }   // 채널 페이지(채널 이름·프로필을 눌렀을 때)로 보고 있는 채널 번호
  const openCh=c=>{ const i=CHS.indexOf(c); if(i<0) return; chPage=i; render(); };
  const chanPage=(sc,c)=>{
    const vs=(c.videos||[]).map(v=>({...v,ch:c.name,c0:c,views:v.views!=null?v.views:100,ago:v.ago||'1개월 전'}));
    const AG=t=>{ const m=/(\d+)(일|주|개월|년) 전/.exec(t||''); return m?parseInt(m[1])*({'일':1,'주':7,'개월':30,'년':365}[m[2]]):99999; };
    vs.sort((a,b)=>AG(a.ago)-AG(b.ago));
    const BELL='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.500 2h-15z"/><path d="M10 21h4"/></svg>';
    const sbSet=()=>{ const on=subSet.has(c.name); sb.classList.toggle('on',on); sb.innerHTML=on?'<span style="display:inline-flex;align-items:center;gap:8px">'+BELL+'구독중</span>':'구독'; };
    const sb=h('button',{class:'ycsub',onclick:()=>{ if(subSet.has(c.name)) subSet.delete(c.name); else subSet.add(c.name); sbSet(); }},'구독'); sbSet();
    sc.append(h('div',{class:'ycb',style:c.banner?`background-image:url(${c.banner})`:''}),
      h('div',{class:'ycp'},chAv(c,84),h('div',{},h('div',{class:'pn'},c.title||c.name,c.verified?h('span',{class:'ycvf',html:'<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="11" fill="#aaa"/><path d="M7 12.500l3.200 3.200L17 8.800" fill="none" stroke="#0f0f0f" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"/></svg>'}):null),h('small',{},c.handle||''),h('small',{},'구독자 '+(c.subs||'1.2만명')+'  ·  동영상 '+(c.count||(vs.length+'개'))))),
      c.about?h('div',{class:'ycabout'},c.about+' ',h('b',{},'...더보기')):null,
      c.links?h('div',{class:'yclinks'},h('span',{html:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/></svg>'}),c.links):null,
      c.community?h('div',{class:'ycbtns'},sb,h('button',{class:'yccm',onclick:()=>K.toast('커뮤니티를 볼 수 없어요')},h('span',{html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="3.200"/><circle cx="5" cy="9.500" r="2.300"/><circle cx="19" cy="9.500" r="2.300"/><path d="M6.500 19c0-3.200 2.500-5 5.500-5s5.500 1.800 5.500 5M1.500 17c0-2 1.500-3.200 3.500-3.200M22.500 17c0-2-1.500-3.200-3.500-3.200"/></svg>'}),'커뮤니티')):sb,
      c.tabs?h('div',{class:'yctabs'},['홈','동영상','Shorts','라이브','팟캐스트','재생목록'].map((t,i)=>h('span',{class:i===0?'on':''},t))):h('div',{style:'height:36px'}));
    vs.slice(0,1).forEach(v=>sc.append(vcard(v)));
    if(vs.length>1){ sc.append(h('div',{class:'ysec'},'추천')); vs.slice(1).forEach(v=>sc.append(vcard(v))); }
    sc.append(h('div',{style:'height:130px'}));
  };
  const SUBS=['홈','구독','음악','라이브','더보기'];
  const navItem=(id,ic,icOn)=>h('button',{class:'yni'+(tab===id?' on':''),onclick:()=>{ if(id==='plus'){ K.toast('만들기는 아직 지원하지 않아요'); return; } if(id==='home') shuffle(); tab=id; q=null; chPage=null; nPage=false; libPage=null; render(); }},id==='me'?meAv(28):h('span',{html:tab===id?icOn:ic}));
  const WCOL=['#e8734a','#2f9e8f','#8e5bd6','#d6a21f','#3b82c4'];
  const WV=allVids().filter(x=>x.watch).map(x=>x.t);
  function watchView(){
    pg.classList.remove('shorts');
    const v=wv, c=v.c0||CHS.find(x=>x.name===v.ch)||CHS[0]||{};
    const views=v.views!=null?v.views:100, lk=fmtV(Math.max(3,Math.round(views*0.04)));
    const back=()=>{ wv=null; render(); };
    const pl=h('div',{class:'ywplr',style:`background-image:url(${v.cv||''})`},
      h('button',{class:'ywb',html:st(28,'<path d="M5 9l7 7 7-7"/>'),onclick:back}),
      h('button',{class:'ywd',html:DOTS3,onclick:e=>e.stopPropagation()}),
      v.dur?h('span',{class:'ydur'},v.dur):null,
      h('i',{class:'ywbar'},h('b',{style:`width:${v.prog||0}%`})));
    const sbt=h('button',{class:'ywsub',onclick:()=>{ if(subSet.has(c.name)) subSet.delete(c.name); else subSet.add(c.name); sbSet(); }},'구독');
    const sbSet=()=>{ const on=subSet.has(c.name); sbt.classList.toggle('on',on); sbt.textContent=on?'구독중':'구독'; }; sbSet();
    const ic=(inner,fl='')=>h('button',{class:'ywi',html:st(26,inner),style:fl,onclick:()=>{}});
    const rel=allVids().filter(x=>[].concat(x.lib||[]).includes('형')&&x.t!==v.t&&x.ch!=='신현카드'&&!(x.c0&&x.c0.name==='신현카드'));
    for(let i=rel.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [rel[i],rel[j]]=[rel[j],rel[i]]; }
    const sc=h('div',{class:'scroll ysc0 ywsc'},
      h('div',{class:'ywt'},v.t),
      h('div',{class:'ywm'},h('b',{},c.handle||('@'+(v.ch||'').replace(/\s/g,''))),h('span',{},'좋아요 '+lk+'개'),h('span',{},'조회수 '+fmtV(views)+'회'),h('span',{},v.ago||'1년 전'),h('b',{class:'ywmore'},'더보기')),
      h('div',{class:'ywch'},h('span',{class:'ycav',onclick:()=>{ wv=null; openCh(c); }},chAv(c,46)),sbt,h('span',{class:'ywacts'},
        (()=>{ const b=ic('<path d="M7 11v9H4v-9zM7 11l4-8c1.700 0 2.600 1.200 2.300 2.700L12.800 9H19a2 2 0 0 1 2 2.300l-1.300 7A2 2 0 0 1 17.700 20H7"/>'); if(v.liked) b.classList.add('on'); b.onclick=()=>b.classList.toggle('on'); return b; })(),
        ic('<path d="M7 11v9H4v-9zM7 11l4-8c1.700 0 2.600 1.200 2.300 2.700L12.800 9H19a2 2 0 0 1 2 2.300l-1.300 7A2 2 0 0 1 17.700 20H7"/>','transform:scaleY(-1)'),
        ic('<path d="M21 11 14 4.500v4C7 9 4 13 3 19.500c2.500-3.500 6-5 11-5v4z"/>'),
        ic('<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="currentColor"/>'),
        h('button',{class:'ywi',html:DOTS3}))),
      h('div',{class:'ywcm'},h('div',{class:'ywch2'},h('b',{},'댓글'),h('span',{},v.cc||'1'),h('i',{class:'ywdots'},h('u',{}),h('u',{class:'o'}))),
        h('div',{class:'ywcr'},h('i',{class:'yav',style:`width:36px;height:36px;background:${WCOL[Math.max(0,WV.indexOf(v.t))%WCOL.length]}`}),h('span',{},...String(v.wc||'').split(/(\d{1,2}:\d{2})/).map(s=>/^\d{1,2}:\d{2}$/.test(s)?h('u',{class:'ywlk'},s):s)))),
      ...rel.slice(0,3).map(x=>vcard({...x,c0:x.c0||CHS.find(k=>k.name===x.ch)})),
      h('div',{style:'height:60px'}));
    pg.append(h('div',{class:'ywtop'}),pl,sc);
  }
  function render(){
    pg.innerHTML=''; pg.classList.toggle('shorts',tab==='shorts'&&q===null);
    K.ytBar=()=>ctl.bar(!(!!wv||(tab==='shorts'&&q===null&&!nPage&&libPage===null&&chPage===null)||S().ui.dark===true)); K.ytBar();
    if(wv){ watchView(); return; }
    const sc=h('div',{class:'scroll ysc0'}); pg.append(h('div',{class:'pad-top'}));
    if(q!==null){
      const inp=h('input',{placeholder:'YouTube 검색',value:q,oninput:e=>{ q=e.target.value; list(); }}); inpEl=inp;
      pg.append(h('div',{class:'yhd ysrch'},h('button',{html:st(26,'<path d="M15 5l-7 7 7 7"/>'),onclick:()=>{ q=null; render(); }}),h('div',{class:'ysb'},inp),h('button',{class:'ymic',html:ICM,onclick:()=>K.toast('음성 검색은 지원하지 않아요')})));
      setTimeout(()=>inp.focus(),50);
    } else if(nPage){
      pg.append(h('div',{class:'yhd ynhd'},h('button',{html:st(26,'<path d="M15 5l-7 7 7 7"/>'),onclick:()=>{ nPage=false; render(); }}),h('b',{},'알림'),h('span',{class:'yr'},h('button',{html:IC.search,onclick:()=>{ nPage=false; q=''; render(); }}),h('button',{html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.800"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M5.600 18.400l2.100-2.100M16.300 7.700l2.100-2.100"/></svg>'}))));
    } else if(libPage!==null){
      pg.append(h('div',{class:'yhd ychd'},h('button',{html:st(26,'<path d="M15 5l-7 7 7 7"/>'),onclick:()=>{ libPage=null; render(); }}),h('span',{class:'yr'},h('button',{html:IC.search,onclick:()=>{ libPage=null; q=''; render(); }}),h('button',{html:DOTS3,onclick:e=>e.stopPropagation()}))));
    } else if(chPage!==null){
      pg.append(h('div',{class:'yhd ychd'},h('button',{html:st(26,'<path d="M15 5l-7 7 7 7"/>'),onclick:()=>{ chPage=null; render(); }}),h('span',{class:'yr'},h('button',{html:IC.search,onclick:()=>{ q=''; render(); }}),h('button',{html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="12" cy="5" r="1.800"/><circle cx="12" cy="12" r="1.800"/><circle cx="12" cy="19" r="1.800"/></svg>',onclick:()=>K.toast('준비 중이에요')}))));
    } else if(tab==='home'){
      pg.append(h('div',{class:'yhd'},h('span',{class:'ylogo',html:LOGO}),h('span',{class:'yr'},h('button',{class:'ybell',onclick:bellGo},h('span',{html:IC.bell}),h('i',{},'9+')),h('button',{html:IC.search,onclick:()=>{ q=''; render(); }}))),
        h('div',{class:'ysubt'},SUBS.map((c,i)=>h('span',{class:i===sub?'on':'',onclick:()=>{ if(i>=2) return;   /* 음악·라이브·더보기 탭은 눌러도 아무 일 없음 */ if(i===0) shuffle(); sub=i; render(); }},c))));
    } else if(tab==='me'){
      pg.append(h('div',{class:'yhd'},h('button',{class:'yacc',onclick:()=>K.toast('계정을 전환할 수 없어요')},'계정',h('span',{html:IC.chevd})),h('span',{class:'yr'},h('button',{class:'ybell',onclick:bellGo},h('span',{html:IC.bell}),h('i',{},'9+')),h('button',{html:IC.search,onclick:()=>{ q=''; render(); }}),h('button',{html:IC.gear,onclick:()=>K.toast('설정은 지원하지 않아요')}))));
    }
    if(tab!=='shorts'||q!==null) pg.append(sc); else pg.append(sc);
    function list(){
      sc.innerHTML='';
      if(q!==null){ const k=q.trim().toLowerCase();
        if(!k){ HIST.forEach(t=>sc.append(h('div',{class:'yhi',onclick:()=>{ q=t; if(inpEl) inpEl.value=t; list(); }},h('span',{class:'yhii',html:ICH}),h('span',{class:'yhit'},t),h('button',{class:'yhia',html:ICA,onclick:e=>{ e.stopPropagation(); q=t; if(inpEl){ inpEl.value=t; inpEl.focus(); } list(); }})))); sc.append(h('div',{style:'height:130px'})); return; }
        const agd=t=>{ const m=/(\d+)(일|주|개월|년) 전/.exec(t||''); return m?parseInt(m[1])*({'일':1,'주':7,'개월':30,'년':365}[m[2]]):99999; };
        homeVids.filter(v=>(v.t+' '+v.ch+' '+(v.kw||'')).toLowerCase().includes(k)).sort((a,b)=>agd(a.ago)-agd(b.ago)).forEach(v=>sc.append(vcard(v)));   /* data.js의 kw: "검색어" 를 적으면 제목에 없어도 그 말로 검색돼요 */ if(!sc.children.length) sc.append(h('div',{class:'yem'},'검색 결과가 없습니다')); sc.append(h('div',{style:'height:130px'})); return; }
      if(nPage){
        const byAge=allVids().filter(v=>!v.hide).sort((a,b)=>AGDAYS(a.ago)-AGDAYS(b.ago)), cnt={}; const items=byAge.filter(v=>(cnt[v.ch]=(cnt[v.ch]||0)+1)<=3).slice(0,10);   /* 채널마다 최신 3개씩 섞어서 */
        sc.append(h('div',{class:'yns'},'이번 주'));
        items.forEach((v,i)=>{ if(i===3) sc.append(h('div',{class:'yns'},'이전 알림'));
          sc.append(h('div',{class:'yn'+(i<4?' new':''),onclick:()=>go(v)},h('i',{class:'ynd'}),h('span',{class:'ycav'},chAv(v.c0,44)),
            h('div',{class:'ynt'},h('div',{class:'ynx'},v.ch+'님이 업로드: '+v.t),h('small',{},v.ago)),
            h('div',{class:'ynth',style:`background-image:url(${v.cv||''})`}),h('button',{class:'ynm',html:DOTS3,onclick:e=>{ e.stopPropagation(); K.toast('알림 설정은 지원하지 않아요'); }}))); });
        sc.append(h('div',{style:'height:130px'})); return; }
      if(libPage!==null){
        const L=LIBS[libPage]; const vs=allVids().filter(v=>[].concat(v.lib||[]).includes(L.key)).sort((a,b)=>AGDAYS(a.ago)-AGDAYS(b.ago));
        sc.append(h('div',{class:'ylhd'},h('div',{class:'ylcv',style:`background-image:url(${(vs[0]&&vs[0].cv)||''})`}),h('div',{class:'ylht'},L.name),h('small',{},'강영현 · 비공개 · 동영상 '+vs.length+'개')));
        vs.forEach(v=>sc.append(h('div',{class:'ylrow',onclick:()=>go(v)},thumb(v),h('div',{class:'ylrt'},h('div',{class:'ylrn'},v.t),h('div',{class:'ylrs'},v.ch)),more(v))));
        sc.append(h('div',{style:'height:130px'})); return; }
      if(chPage!==null){ chanPage(sc,CHS[chPage]); return; }
      if(tab==='home'){
        if(sub===0){ homeVids.forEach(v=>sc.append(vcard(v))); }
        else if(sub===1){
          const row=h('div',{class:'ysubs',onscroll:e=>{ subX=e.target.scrollLeft; }},CHS.map((c,i)=>(showAll||!c.hide)?h('div',{class:'ysu'+(selCh===i?' sel':''),onclick:()=>{ selCh=(selCh===i?null:i); render(); }},chAv(c,64),h('small',{},c.name)):null),showAll?null:h('span',{class:'ysall',onclick:()=>{ showAll=true; render(); }},'전체'));
          sc.append(row); setTimeout(()=>{ row.scrollLeft=subX; },0);
          if(selCh!==null){
            const c=CHS[selCh]; const cv=c.videos||[];
            sc.append(h('div',{class:'ychv'},h('span',{class:'ychs'},c.desc||''),h('button',{class:'ychb',onclick:()=>openCh(c)},h('span',{html:st(30,'<circle cx="12" cy="12" r="9.500"/><circle cx="12" cy="10" r="3.200"/><path d="M5.800 18.500c1.500-3 4-4.300 6.200-4.300s4.700 1.300 6.200 4.300"/>')}),'채널 방문')));
            if(!cv.length) sc.append(h('div',{class:'ychem'},h('span',{html:'<svg viewBox="0 0 24 24" width="64" height="64" fill="#888"><path d="M4 3h16v18H4z"/><g fill="#0f0f0f"><rect x="5.500" y="5" width="2.200" height="2.200"/><rect x="5.500" y="9" width="2.200" height="2.200"/><rect x="5.500" y="13" width="2.200" height="2.200"/><rect x="5.500" y="17" width="2.200" height="2.200"/><rect x="16.300" y="5" width="2.200" height="2.200"/><rect x="16.300" y="9" width="2.200" height="2.200"/><rect x="16.300" y="13" width="2.200" height="2.200"/><rect x="16.300" y="17" width="2.200" height="2.200"/></g></svg>'}),h('div',{},'구독정보에 아직 업로드된 동영상이 없습니다.'),h('small',{},'구독할 다른 채널을 찾아보세요.')));
            const rowsL=cv.length&&cv.every(x=>x.row);
            if(rowsL) sc.append(h('div',{class:'ycl'},cv.map(v0=>{ const v={...v0,ch:c.name}; return h('div',{class:'ycr',onclick:()=>go(v)},thumb(v),h('div',{class:'ycrt'},h('div',{class:'ycrn'},v.t),h('div',{class:'ycrs'},c.name,h('i',{html:'<svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="10" fill="#aaa"/><path d="m7.500 12.300 3 3 6-6.500" fill="none" stroke="#0f0f0f" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/></svg>'}),v.by||''),h('div',{class:'ycrs'},'▷ '+fmtV(v.views)+'  '+v.ago)),more(v)); })),h('div',{style:'height:130px'}));
            const grid=cv.length&&cv.every(x=>x.full);
            if(grid) sc.append(h('div',{class:'ycg'},cv.map(v=>h('div',{class:'ycgi',onclick:()=>go({...v,ch:c.name})},h('div',{class:'yth full',style:`background-image:url(${v.cv})`}),h('div',{class:'ycgt'},v.t),h('small',{},'재생목록'),h('small',{},'전체 재생목록 보기')))),h('div',{style:'height:130px'}));
            ((grid||rowsL)?[]:cv).forEach(v0=>{ const v={...v0,ch:c.name,views:v0.views!=null?v0.views:100,ago:v0.ago||'1개월 전'};
              sc.append(h('div',{class:'ycc',onclick:()=>go(v)},thumb(v),h('div',{class:'ycm'},h('span',{class:'ycav',onclick:e=>{ e.stopPropagation(); openCh(c); }},chAv(c,40)),h('div',{class:'yt2'},h('div',{class:'ytt'},v.t),h('div',{class:'yts'},meta(v))),more(v)))); });
          } else {
            const AGD=t=>{ const m=/(\d+)(일|주|개월|년) 전/.exec(t||''); return m?parseInt(m[1])*({'일':1,'주':7,'개월':30,'년':365}[m[2]]):99999; };
            const subNew=[]; CHS.forEach((c,ci)=>{ if(c.hide&&!showAll) return; (c.videos||[]).forEach(v=>subNew.push({...v,ci,hide:!!c.hide,ch:c.name,views:v.views!=null?v.views:100,ago:v.ago||'1개월 전'})); });
            subNew.sort((a,b)=>AGD(a.ago)-AGD(b.ago));   // 구독 > 관련성: 최신 영상 순 (쇼츠 없음)
            sc.append(h('div',{class:'ysec'},'관련성')); subNew.forEach(v=>sc.append(vcard({...v,c0:CHS[v.ci]}))); sc.append(h('div',{style:'height:130px'}));
          }
        }
        else if(sub===2){ vids.filter((_,i)=>i%2===0).forEach(v=>sc.append(card(v))); }
        else sc.append(h('div',{class:'yem'},'지금 라이브 중인 동영상이 없어요'));
        sc.append(h('div',{style:'height:130px'}));
      }
      else if(tab==='shorts'){
        sc.classList.add('ysnap');
        SHORTS.forEach(v=>sc.append(h('div',{class:'yspl',onclick:()=>go(v)},
          h('div',{class:'ysv',style:`background-image:url(${v.cv||''})`}),
          h('div',{class:'yshd2'},h('button',{html:st(28,'<path d="M15 5l-7 7 7 7"/>'),onclick:e=>{ e.stopPropagation(); tab='home'; render(); }}),h('span',{class:'yr'},h('button',{html:IC.search,onclick:e=>{ e.stopPropagation(); q=''; render(); }}),h('button',{html:IC.dots,onclick:e=>e.stopPropagation()}))),
          h('div',{class:'ystt'},v.ch),
          h('div',{class:'ysr'},[[IC.heart,v.likes],[IC.cmt,v.cm],[IC.mark,'저장'],[IC.share,'공유'],[IC.remix,'리믹스']].map(([ic,t],i)=>h('div',{class:'ysa'+(i===4?' dim':''),onclick:e=>e.stopPropagation()},h('span',{html:ic}),h('em',{},String(t))))),
          h('div',{class:'ysfb'},h('div',{class:'ysrow'},h('i',{class:'yav ysl',style:`background-image:url(${v.logo||''})`}),h('b',{},v.handle||('@'+v.ch.replace(/\s/g,'_'))),v.sub?null:h('span',{class:'ysub',onclick:e=>{e.stopPropagation();e.target.textContent='구독중';}},'구독')),h('div',{class:'yssd'},h('span',{html:'<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg>'}),v.ch),h('div',{class:'ysdesc'},v.t)),
          h('div',{class:'ydisc ysld',style:`background-image:url(${v.logo||v.cv||''})`}),
          h('i',{class:'ysbar'},h('b',{})))));
        setTimeout(()=>{ sc.scrollTop=sIdx*sc.clientHeight; },0);
      }
      else {
        sc.append(h('div',{class:'ylp'},meAv(86),h('div',{},h('b',{},me.name),h('small',{},me.handle))),
          h('div',{class:'ylb'},h('button',{class:'l',onclick:()=>K.toast('채널을 볼 수 없어요')},'채널 보기'),h('button',{onclick:()=>K.toast('Google 계정 관리')},'Google 계정 관리')),
          h('div',{class:'ylh'},h('b',{},'보관함')),
          h('div',{class:'ychips'},h('span',{class:'ychip'},'최근 항목',h('span',{html:IC.chevd})),['오프라인 저장','재생목록','음악'].map(c=>h('span',{class:'ychip'},c))),
          ...[[{...vids[1],cv:'photos/my-qa.jpg'},'좋아요 표시한 동영상','비공개',null],[{...vids[0],cv:(allVids().filter(x=>[].concat(x.lib||[]).includes('형')).sort((p,q)=>AGDAYS(p.ago)-AGDAYS(q.ago))[0]||{}).cv||'photos/my-bag.jpg'},'형','비공개 · 동영상 6개',1]   /* 형 재생목록 섬네일 = 목록에서 가장 최신 영상 */].map(([v,n,sm,li])=>h('div',{class:'ylpl',onclick:()=>{ if(li===null) return;   /* 좋아요 표시한 동영상은 눌러도 안 열림 */ libPage=li; render(); }},h('div',{class:'ylt s',style:`background-image:url(${v.cv||''})`+(li?';background-size:110% auto;background-position:0 0':'')}),h('div',{class:'ylpt'},h('b',{},n),sm?h('small',{},sm):null),more(v))));
        sc.append(h('div',{style:'height:130px'}));
      }
    }
    list();
    pg.append(h('div',{class:'ynav'},navItem('home',IC.homeO,IC.home),navItem('shorts',IC.shorts,IC.shorts),navItem('plus',IC.plus,IC.plus),navItem('me')));
  }
  render();
}};

/* =================== 디데이 =================== */
K.apps.dday = { mount(root,p,ctl){
  ctl.bar(true); const nav=K.makeNav(root);
  const pg=K.page(); pg.classList.add('dd'); const sc=h('div',{class:'scroll'}); nav.push(pg);
  pg.append(padTop(),h('div',{class:'navbar'},h('span'),h('button',{onclick:()=>add()},'＋')),h('div',{class:'large'},'디데이'),sc);
  const render=()=>{ sc.innerHTML=''; S().ddays.forEach((d,i)=>sc.append(h('div',{class:'ddc',onclick:()=>K.sheet(d.title,[{t:'삭제',red:true,fn:()=>{S().ddays.splice(i,1);K.save();render();}}])},h('b',{},d.title),h('span',{style:'font-weight:700;font-size:21px;color:'+(K.ddayText(d).startsWith('-')?'#ff3b30':'#2f6bff')},K.ddayText(d))))); };
  function add(){ K.prompt('제목','',t=>{ if(!t.trim()) return; K.prompt('날짜 (YYYY-MM-DD)',K.ymd(K.now()),d=>{ if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){K.toast('형식이 맞지 않아요');return;} S().ddays.push({title:t.trim(),date:d}); K.save(); render(); }); }); }
  render();
}};

/* =================== 기타(내용 없음) 앱 =================== */
['maps','health','wallet','coupang','carrot'].forEach(id=>{
  K.apps[id] = { mount(root,p,ctl){ ctl.bar(true); const pg=K.page(); pg.classList.add('gbg'); root.append(pg);
    pg.append(padTop(),h('div',{class:'large'},K.appName[id]),h('div',{class:'empty'},h('div',{class:'eb'},{maps:'🗺️',health:'❤️',wallet:'👛',coupang:'📦',carrot:'🥕',shcard:'💳'}[id]),h('div',{},'이 앱은 아직 비어 있어요'))); } };
});


/* =================== MY 신현 (홈=사원증·출입QR / 전자명함 / 사내포털) =================== */
K.apps.shcard = { mount(root,p,ctl){
  ctl.bar(false);
  const E=D.shcard, T={home:'홈',card:'전자명함',portal:'사내포털'};
  let tab=(p&&p.tab)||'home', qTimer=null, nv=null, fvInit=0, nq='', ncat='전체';
  const pg=K.page(); pg.classList.add('mz'); root.append(pg);
  const SV=(d,w=24,sw=1.8)=>`<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const body=h('div',{class:'mz-body'}), tabs=h('div',{class:'mz-tabs'});
  const hd=h('div',{class:'mz-hd'},padTop(),h('div',{class:'mz-tr'},h('b',{},'MY 신현'),h('i',{html:SV('<path d="M6 16.500V11a6 6 0 0 1 12 0v5.500l1.500 2h-15zM10 20.500a2 2 0 0 0 4 0",1.700)',24)})));
  pg.append(hd,body,tabs);
  function stop(){ clearInterval(qTimer); }
  function drawTabs(){ tabs.innerHTML=''; Object.keys(T).forEach(k=>tabs.append(h('div',{class:'mz-tab'+(tab===k?' on':''),onclick:()=>{ if(tab!==k||(k==='portal'&&(nv||fv||av))){ tab=k; nv=null; fv=null; av=null; show(); } }},h('span',{},T[k])))); tabs.append(h('div',{class:'mz-hbp'})); }
  const logoBand=()=>h('div',{class:'mz-band'},h('img',{src:'photos/ic-sh-logo.png',alt:''}),h('div',{},h('b',{},'신현카드'),h('small',{},'SHINHYUN CARD')));
  /* 모양만 QR(25x25, 파인더 3개) */
  function qrSvg(seed){ const n=25, M=[]; let s=seed>>>0; const rnd=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
    for(let y=0;y<n;y++){ M[y]=[]; for(let x=0;x<n;x++) M[y][x]=rnd()<.5; }
    const fin=(ox,oy)=>{ for(let y=-1;y<=7;y++) for(let x=-1;x<=7;x++){ const X=ox+x,Y=oy+y; if(X<0||Y<0||X>=n||Y>=n) continue; const edge=x===0||x===6||y===0||y===6, core=x>=2&&x<=4&&y>=2&&y<=4; M[Y][X]=(x>=0&&x<=6&&y>=0&&y<=6)&&(edge||core); } };
    fin(0,0); fin(n-7,0); fin(0,n-7);
    for(let i=8;i<n-8;i++){ M[6][i]=i%2===0; M[i][6]=i%2===0; }
    let r=''; for(let y=0;y<n;y++) for(let x=0;x<n;x++) if(M[y][x]) r+=`<rect x="${x}" y="${y}" width="1.020" height="1.020"/>`;
    return `<svg viewBox="0 0 ${n} ${n}" width="100%" height="100%" shape-rendering="crispEdges"><g fill="#fff">${r}</g></svg>`; }
  const rows=a=>h('div',{class:'mz-rs'},...a.map(r=>h('div',{},h('span',{},r[0]),h('b',{},...[].concat(r[1])))));
  function homeView(){
    const ttl=h('div',{class:'mz-sub'},'사원증');
    const c1=h('div',{class:'mz-cd'},logoBand(),h('div',{class:'mz-ph'},h('img',{src:E.photo,alt:''})),
      rows([['이름',[E.name+' / '+E.nameEn]],['회사명',[E.biz.company]],['소속/직책',[E.dept+' / '+E.rank]],['부서(EN)',[E.deptEn]],['사번',[E.empNo]]]),h('div',{class:'mz-ft'},'SHINHYUN CARD CO., LTD.'));
    const qrBox=h('div',{class:'mz-qr fk'}), cd=h('div',{class:'mz-cd2'});
    let left=30, seed=Math.floor(Math.random()*1e9);
    const paint=()=>{ qrBox.innerHTML=qrSvg(seed); cd.textContent='유효시간 00:'+String(left).padStart(2,'0'); };
    paint(); qTimer=setInterval(()=>{ left--; if(left<=0){ left=30; seed=Math.floor(Math.random()*1e9); } paint(); },1000);
    { let lt=null; const clr=()=>{ clearTimeout(lt); lt=null; };
      qrBox.addEventListener('pointerdown',()=>{ clr(); lt=setTimeout(()=>{ lt=null; K.alert('연결하시겠습니까?','',[{t:'아니요'},{t:'예',fn:()=>window.open('https://x.com/kongpu_116?s=20','_blank','noopener')}]); },650); });
      ['pointerup','pointerleave','pointercancel','pointermove'].forEach(ev=>qrBox.addEventListener(ev,clr));
      qrBox.addEventListener('contextmenu',e=>e.preventDefault()); }
    const c2=h('div',{class:'mz-cd mz-nv'},h('div',{class:'mz-band nv'},h('img',{src:'photos/ic-sh-logo.png',alt:''}),h('div',{},h('b',{},'신현카드'),h('small',{},'SHINHYUN CARD'))),
      h('div',{class:'mz-qw'},h('i',{class:'c1'}),h('i',{class:'c2'}),h('i',{class:'c3'}),h('i',{class:'c4'}),qrBox),cd,h('p',{},E.qrNote));
    const car=h('div',{class:'mz-car'},h('div',{class:'mz-sl'},c1),h('div',{class:'mz-sl'},c2));
    const dots=h('div',{class:'mz-dots'}), N=2; let cur=0;
    const prev=h('i',{class:'ar',html:SV('<path d="M15 5l-7 7 7 7"/>',20)}), next=h('i',{class:'ar',html:SV('<path d="M9 5l7 7-7 7"/>',20)});
    const stepW=()=>{ const s=car.children[1]; return s.offsetLeft-car.children[0].offsetLeft; };
    const go=i=>car.scrollTo({left:i*stepW(),behavior:'smooth'});
    prev.onclick=()=>go(Math.max(0,cur-1)); next.onclick=()=>go(Math.min(N-1,cur+1));
    const sync=()=>{ cur=Math.round(car.scrollLeft/stepW()); [...dots.children].forEach((d,k)=>d.classList.toggle('on',k===cur)); ttl.textContent=cur===0?'사원증':'출입 인증'; prev.style.opacity=cur===0?.25:1; next.style.opacity=cur===N-1?.25:1; };
    for(let i=0;i<N;i++) dots.append(h('b',{class:i===0?'on':''}));
    const nav=h('div',{class:'mz-nav'},prev,dots,next);
    car.addEventListener('scroll',sync); setTimeout(sync,0);
    return h('div',{class:'mz-home'},car); }
  function cardView(){
    const c=E.biz;
    const card=h('div',{class:'mz-cd mz-bz'},logoBand(),h('div',{class:'mz-ph sm'},h('img',{src:E.photo,alt:''})),
      rows([['이름',[E.name+' / '+E.nameEn]],['회사명',[c.company]],['소속/직책',['대외협력 커뮤니케이션실 / '+E.rank]],['연락처',[c.phone]],['이메일',[c.email]]]),
      h('button',{class:'mz-bt'},'연락처 저장하기 (vCard 다운로드)'),
      h('button',{class:'mz-bt',onclick:()=>kakaoShare()},'명함 이미지 공유하기'));
    return h('div',{class:'mz-home'},h('div',{class:'mz-onecd'},card)); }
  function dl(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.append(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500); }
  function saveVcard(){ const c=E.biz;
    const v=['BEGIN:VCARD','VERSION:3.0','N:강;영현;;;','FN:강영현 (Younghyun KANG)','ORG:'+c.company+';대외협력 커뮤니케이션실','TITLE:'+c.rank,'TEL;TYPE=CELL:'+c.phone,'EMAIL;TYPE=WORK:'+c.email,'END:VCARD'].join('\r\n');
    dl(new Blob([v],{type:'text/vcard;charset=utf-8'}),'강영현.vcf'); K.toast('연락처 파일을 저장했어요'); }
  function cardImg(cb){ const c=E.biz, cv=document.createElement('canvas'); cv.width=1050; cv.height=600; const g=cv.getContext('2d');
    g.fillStyle='#fff'; g.fillRect(0,0,1050,600); g.fillStyle='#22346a'; g.fillRect(0,0,1050,150);
    const done=()=>{ g.fillStyle='#fff'; g.font='700 44px sans-serif'; g.fillText('신현카드',150,82); g.font='600 20px sans-serif'; g.fillText('SHINHYUN CARD',152,116);
      g.fillStyle='#0d1b3a'; g.font='700 58px sans-serif'; g.fillText(E.name,70,260); g.font='400 26px sans-serif'; g.fillStyle='#6b7488'; g.fillText(E.nameEn,70,304);
      g.fillStyle='#0d1b3a'; g.font='400 28px sans-serif'; g.fillText(c.company,70,370); g.fillText('대외협력 커뮤니케이션실 / '+E.rank,70,416); g.fillText(c.phone,70,484); g.fillText(c.email,70,530);
      cb(cv.toDataURL('image/png')); };
    const withPhoto=()=>{ const ph=new Image(); const fin=()=>done(); ph.onload=()=>{ const x=780,y=190,w=210,hh=270; g.save(); g.beginPath(); g.moveTo(x+16,y); g.arcTo(x+w,y,x+w,y+hh,16); g.arcTo(x+w,y+hh,x,y+hh,16); g.arcTo(x,y+hh,x,y,16); g.arcTo(x,y,x+w,y,16); g.closePath(); g.clip();
        const r=Math.max(w/ph.width,hh/ph.height), dw=ph.width*r, dh=ph.height*r; g.drawImage(ph,x+(w-dw)/2,y+(hh-dh)/2,dw,dh); g.restore(); done(); }; ph.onerror=fin; ph.src=E.photo; };
    const im=new Image(); im.onload=()=>{ g.filter='brightness(1.6)'; g.drawImage(im,64,32,76,87); g.filter='none'; withPhoto(); }; im.onerror=withPhoto; im.src='photos/ic-sh-logo.png'; }
  /* 명함 이미지 공유하기 → 카카오톡 공유 시트 → ♡에게 보내기 → 카톡방(c_sj)에 명함 이미지 + 메시지 */
  const KS_MSGS=['형, 이거 봐요!','저 이제 강 대리 아니고 강 과장 ㅎㅎ'], KS_REPLY=['강 과장님','오늘 좋은 날인데 저녁에 축하주라도 한잔하시죠'];
  function doneToast(){ const scr=K.$('#screen'); const old=K.$('#mzsd'); if(old) old.remove();
    const b=h('div',{id:'mzsd'},h('div',{class:'ic',html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="#191919"><path d="M12 3C6.500 3 2.500 6.500 2.500 11c0 2.800 1.600 5.200 4 6.700L5.500 21l3.800-2.200c.9.200 1.800.3 2.700.3 5.500 0 9.500-3.500 9.500-8.100S17.500 3 12 3z"/></svg>'}),h('b',{},'공유가 완료되었습니다.'),
      h('button',{onclick:()=>{ b.remove(); K.openKakaoChat('c_sj'); }},'채팅방 이동'));
    scr.append(b); requestAnimationFrame(()=>requestAnimationFrame(()=>b.classList.add('show'))); setTimeout(()=>{ b.classList.remove('show'); setTimeout(()=>b.remove(),400); },6000); }
  function kakaoShare(){
    const chat=(K.state.chats||[]).find(x=>x.id==='c_sj'); if(!chat){ K.toast('공유할 수 없어요'); return; }
    const ct=K.contact(chat.with)||{name:'♡'};
    let sent=false, url='';
    const close=()=>{ ov.classList.remove('on'); setTimeout(()=>ov.remove(),220); };
    const pv=h('div',{class:'mz-kpv'});
    const send=h('button',{class:'mz-kgo',onclick:()=>{ if(sent||!url) return; sent=true; send.textContent='전송 중…';
      chat.msgs.push({from:'me',name:'',ts:+K.now(),text:'',img:url,unread:false}); chat._ksPend=true; K.save(); K.refreshKakao&&K.refreshKakao();
      K.ksPlay=c=>{ KS_MSGS.forEach((t,i)=>setTimeout(()=>{ c.msgs.push({from:'me',name:'',ts:+K.now(),text:t,img:'',unread:false}); K.save(); K.refreshKakao&&K.refreshKakao(); },i*800));
        KS_REPLY.forEach((t,i)=>{ setTimeout(()=>{ K._typing&&K._typing(c.id,true); },1300+i*2600); setTimeout(()=>{ const open=K.cur&&K.cur.id==='kakao'&&K._openChatId&&K._openChatId()===c.id;
          K._typing&&K._typing(c.id,false); c.msgs.push({from:c.with,name:'',ts:+K.now(),text:t,img:'',unread:!open,noti:!open}); K.save();
          if(open) K.refreshKakao&&K.refreshKakao(); else { K.banner({app:'kakao',title:ct.name,text:t,onTap:()=>K.openKakaoChat(c.id)}); K.refreshKakao&&K.refreshKakao(); K.refreshHome&&K.refreshHome(); } },2600+i*2600); }); setTimeout(()=>{ c._lock=false; },2600+(KS_REPLY.length-1)*2600+700); };
      setTimeout(()=>{ close(); doneToast(); },400); }},ct.name+'에게 보내기');
    const ov=h('div',{class:'mz-ks',onclick:e=>{ if(e.target===ov) close(); }},
      h('div',{class:'mz-kp'},h('div',{class:'kh'},h('i',{html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="#191919"><path d="M12 3C6.500 3 2.500 6.500 2.500 11c0 2.800 1.600 5.200 4 6.700L5.500 21l3.800-2.200c.9.200 1.800.3 2.700.3 5.500 0 9.500-3.500 9.500-8.100S17.500 3 12 3z"/></svg>'}),h('b',{},'카카오톡 공유하기')),
        pv,
        h('div',{class:'kf'},h('div',{class:'kav',style:K.avatarStyle(ct)},ct.id==='sj'?'♡':K.initial(ct.name)),h('b',{},ct.name)),
        send,h('button',{class:'mz-kcx',onclick:close},'취소')));
    pg.append(ov); requestAnimationFrame(()=>ov.classList.add('on'));
    cardImg(u=>{ url=u; pv.append(h('img',{src:u,alt:''})); }); }
  const PI={ att:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#22346a" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.500"/><path d="M12 7v5l3.200 2"/></svg>',
    apr:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#22346a" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.500h8l3.500 3.500v13.500H7z"/><path d="M14.500 3.500V7.500H18.500M9.800 13.500l2 2 3.500-4"/></svg>',
    wel:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#22346a" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.500-4.500-7.500-10A4.200 4.200 0 0 1 12 7.500 4.200 4.200 0 0 1 19.500 10c0 5.500-7.500 10-7.500 10z"/></svg>',
    auth:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#22346a" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.500-3 8-7 10-4-2-7-5.500-7-10V6z"/><path d="M9 12l2.200 2.200L15.500 10"/></svg>',
    fac:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#22346a" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"><rect x="3.500" y="5" width="17" height="15" rx="2.500"/><path d="M3.500 10h17M8 3v4M16 3v4M8.500 14.500h3M8.500 17h6"/></svg>',
    ntc:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#22346a" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h3l6 4V6L7 10zM16.500 9.500a4 4 0 0 1 0 5"/></svg>'};
  function openAuth(){
    let left=30, code='', iv=null; const gen=()=>{ code=String(Math.floor(Math.random()*1e6)).padStart(6,'0'); left=30; };
    gen();
    const num=h('div',{class:'mz-ac'}), cd=h('div',{class:'mz-at'}), bar=h('i');
    const paint=()=>{ num.textContent=code.slice(0,3)+' '+code.slice(3); cd.textContent='남은 시간 00:'+String(left).padStart(2,'0'); bar.style.width=(left/30*100)+'%'; };
    const close=()=>{ clearInterval(iv); ov.classList.remove('on'); setTimeout(()=>ov.remove(),250); };
    const ov=h('div',{class:'mz-au'},padTop(),
      h('div',{class:'mz-ah'},h('button',{class:'mz-ax',onclick:close,html:SV('<path d="M15 5l-7 7 7 7"/>',24)}),h('b',{},'사내 인증'),h('span',{style:'width:34px'})),
      h('div',{class:'mz-ab'},h('i',{html:PI.auth.replace(/width="30" height="30"/,'width="56" height="56"')}),h('h3',{},'본인 인증'),
        h('p',{},'일부 업무 시스템에 로그인할 때 본인 인증을 위해 사용해요.'),
        h('div',{class:'mz-acw'},num,h('div',{class:'mz-abar'},bar),cd),
        h('small',{},'인증 번호는 30초마다 바뀌어요.')));
    pg.append(ov); requestAnimationFrame(()=>ov.classList.add('on')); paint();
    iv=setInterval(()=>{ if(!ov.isConnected){ clearInterval(iv); return; } left--; if(left<=0) gen(); paint(); },1000); }

  /* ===== 사내 공지사항 (데이터: D.shNotices) ===== */
  const NK='kyh_shn_t1'; let NR={}; try{ NR=JSON.parse(localStorage.getItem(NK)||'{}')||{}; }catch(e){ NR={}; }
  const nSave=()=>{ try{ localStorage.setItem(NK,JSON.stringify(NR)); }catch(e){} };
  const NCATS=['전체','필독','업무','인사','복리후생','사내 행사','교육·보안'];
  const nAll=()=>D.shNotices||[];
  const nSorted=()=>nAll().slice().sort((a,b)=>((b.must?1:0)-(a.must?1:0))||(a.date<b.date?1:a.date>b.date?-1:0));
  const nUnread=()=>nAll().filter(n=>!NR[n.id]).length;
  const nViews=n=>(n.views+(NR[n.id]?1:0)).toLocaleString('ko-KR');
  const openBoard=id=>{ tab='portal'; av=null; nv=id?{m:'d',id}:{m:'l'}; show(); };
  const IC={ pin:SV('<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v7"/>',14,2), clip:SV('<path d="M20 11l-8 8a5 5 0 0 1-7-7l8-8a3.500 3.500 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7"/>',14,1.800), eye:SV('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',14,1.800), back:SV('<path d="M15 5l-7 7 7 7"/>',22,2), srch:SV('<circle cx="11" cy="11" r="6.500"/><path d="M20 20l-4-4"/>',18,2), file:SV('<path d="M7 3.500h8l3.500 3.500v13.500H7z"/><path d="M14.500 3.500V7.500H18.500"/>',22,1.700) };
  function noticeView(){ return nv.m==='d'?noticeDetail(nv.id):noticeList(); }
  function nBar(title,onBack){ return h('div',{class:'mz-nb'},h('button',{class:'mz-nbk',html:IC.back,onclick:onBack}),h('b',{},title),h('span',{style:'width:34px'})); }
  function noticeList(){
    const wrap=h('div',{class:'mz-nw'}), cnt=h('small',{}), list=h('div',{class:'mz-nl'});
    const inp=h('input',{class:'mz-ns',type:'search',placeholder:'공지사항 검색 (제목·부서·내용)',value:nq,oninput:e=>{ nq=e.target.value; paint(); }});
    const chips=h('div',{class:'mz-nch'});
    function paint(){
      chips.innerHTML=''; NCATS.forEach(c=>chips.append(h('button',{class:ncat===c?'on':'',onclick:()=>{ ncat=c; paint(); }},c)));
      const q=nq.trim().toLowerCase();
      const rows=nSorted().filter(n=>(ncat==='전체'||(ncat==='필독'?n.must:n.cat===ncat))&&(!q||(n.title+' '+n.dept+' '+n.body.map(b=>b.t).join(' ')).toLowerCase().includes(q)));
      cnt.textContent='전체 '+nAll().length+'건'+((ncat!=='전체'||q)?' · 검색 결과 '+rows.length+'건':'')+' · 읽지 않음 '+nUnread()+'건';
      list.innerHTML='';
      if(!rows.length){ list.append(h('div',{class:'mz-ne'},h('b',{},'검색 결과가 없어요'),h('p',{},'검색어를 바꾸거나 분류를 변경해 보세요.'))); return; }
      rows.forEach(n=>list.append(h('div',{class:'mz-nc'+(n.must?' must':'')+(NR[n.id]?' rd':''),onclick:()=>{ nv={m:'d',id:n.id}; show(); }},
        h('div',{class:'r1'},n.must?h('span',{class:'mz-pn',html:IC.pin+'<em>중요 공지</em>'}):null,h('span',{class:'mz-tag'+(n.must?' mu':'')},n.tag),h('span',{style:'flex:1'}),NR[n.id]?h('em',{class:'rdt'},'읽음'):h('i',{class:'nw'},'')),
        h('p',{},n.title),
        h('div',{class:'mt'},h('span',{},n.dept),h('span',{},n.date.replace(/-/g,'.')),h('span',{html:IC.eye+' '+nViews(n)}),n.att.length?h('span',{html:IC.clip+' '+n.att.length}):null)))); }
    wrap.append(nBar('사내 공지사항',()=>{ nv=null; show(); }),
      h('div',{class:'mz-nh2'},h('b',{},'사내 공지사항'),cnt),
      h('div',{class:'mz-nsw'},h('i',{html:IC.srch}),inp),chips,list,h('div',{style:'height:24px'}));
    paint(); return wrap; }
  function nText(n){ return n.title+'\n'+'작성 부서: '+n.dept+' ('+n.wr+')\n게시일: '+n.date+'\n\n'+n.body.map(b=>b.k==='h'?'\n'+b.t:b.k==='l'?' - '+b.t:b.t).join('\n')+'\n'; }
  function attPreview(n,a){
    const close=()=>{ ov.classList.remove('on'); setTimeout(()=>ov.remove(),200); };
    const ov=h('div',{class:'mz-as',onclick:e=>{ if(e.target===ov) close(); }},
      h('div',{class:'mz-ap'},h('div',{class:'hd'},h('i',{html:IC.file}),h('div',{},h('b',{},a.n),h('small',{},a.s))),
        h('pre',{},nText(n)),
        h('div',{class:'bt'},h('button',{onclick:close},'닫기'),h('button',{class:'pr'},'저장'))));
    pg.append(ov); requestAnimationFrame(()=>ov.classList.add('on')); }
  function noticeDetail(id){
    const ord=nSorted(), i=ord.findIndex(x=>x.id===id), n=ord[i];
    if(!n){ nv={m:'l'}; return noticeList(); }
    if(!NR[n.id]){ NR[n.id]=1; nSave(); }
    const pv=ord[i-1], nx=ord[i+1];
    const nb=(lab,x)=>h('button',{class:'mz-npn'+(x?'':' off'),onclick:()=>{ if(x){ nv={m:'d',id:x.id}; show(); } }},h('small',{},lab),h('b',{},x?x.title:'없음'));
    return h('div',{class:'mz-nw'},nBar('공지사항',()=>{ nv={m:'l'}; show(); }),
      h('div',{class:'mz-dt'},
        h('div',{class:'hd'},n.must?h('span',{class:'mz-pn',html:IC.pin+'<em>중요 공지</em>'}):null,h('span',{class:'mz-tag'+(n.must?' mu':'')},n.tag),h('span',{class:'mz-tag gr'},n.cat)),
        h('h2',{},n.title),
        h('div',{class:'mz-dm'},h('div',{},h('span',{},'작성 부서'),h('b',{},n.dept)),h('div',{},h('span',{},'담당자'),h('b',{},n.wr)),h('div',{},h('span',{},'게시일'),h('b',{},n.date.replace(/-/g,'.'))),h('div',{},h('span',{},'조회수'),h('b',{},nViews(n)))),
        h('div',{class:'mz-bd'},...n.body.map(b=>b.k==='h'?h('h4',{},b.t):b.k==='l'?h('div',{class:'li'},b.t):h('p',{},b.t))),
        h('div',{class:'mz-at2'},h('b',{},'첨부파일 '+n.att.length+'개'),...(n.att.length?n.att.map(a=>h('button',{class:'af',onclick:()=>attPreview(n,a)},h('i',{html:IC.file}),h('span',{},a.n),h('small',{},a.s))):[h('p',{},'첨부파일이 없어요.')]))),
      h('div',{class:'mz-npw'},nb('이전 공지',pv),nb('다음 공지',nx)),
      h('button',{class:'mz-nlb',onclick:()=>{ nv={m:'l'}; show(); }},'목록으로'),h('div',{style:'height:24px'})); }
  /* ===== 사내 시설 예약 (데이터: D.shFac, 예약 내역: localStorage kyh_fac_t1) ===== */
  const FK='kyh_fac_t1'; let FD={rooms:[],cars:[]}; try{ const x=JSON.parse(localStorage.getItem(FK)||'null'); if(x&&Array.isArray(x.rooms)&&Array.isArray(x.cars)) FD=x; }catch(e){}
  const fSave=()=>{ try{ localStorage.setItem(FK,JSON.stringify(FD)); }catch(e){} };
  const FAC=()=>D.shFac||{rooms:[],cars:[],teams:[],sched:[]};
  const p2=n=>String(n).padStart(2,'0'), fm=m=>p2(Math.floor(m/60))+':'+p2(m%60);
  const dKey=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
  const DOWN=['일','월','화','수','목','금','토'];
  const dLab=k=>{ const d=new Date(k+'T00:00:00'); return (d.getMonth()+1)+'월 '+d.getDate()+'일 ('+DOWN[d.getDay()]+')'; };
  const fHash=s=>{ let x=7; for(const c of s) x=(x*31+c.charCodeAt(0))>>>0; return x; };
  const FCFG={room:{a:540,b:1140},car:{a:420,b:1260}};
  const fList=kind=>kind==='room'?FD.rooms:FD.cars;
  const fItems=kind=>kind==='room'?FAC().rooms:FAC().cars;
  const fFind=(kind,id)=>fItems(kind).find(x=>x.id===id);
  function seedBusy(kind,id,date){ const dow=new Date(date+'T00:00:00').getDay(), out=[], hs=fHash(kind+id+date), tm=FAC().teams.filter(x=>x!==E.dept), C=FCFG[kind];
    FAC().sched.forEach(x=>{ if(x.k===kind&&x.f===id&&dKey(new Date(+K.now()+x.d*86400000))===date) out.push({s:x.s,e:x.e,label:E.dept,mine:false,team:true,by:x.by,p:x.p,dest:x.dest}); });
    if(kind==='room'){ if(dow===0||dow===6) return out; const n=2+hs%3;
      for(let i=0;i<n;i++){ const s=C.a+30*((hs>>>(i*5))%16), e=s+30*(1+((hs>>>(i*5+2))%3)); if(e>C.b||out.some(b=>s<b.e&&e>b.s)) continue; out.push({s,e,label:tm[(hs>>>(i*3))%tm.length],mine:false,team:false}); } }
    else { const n=hs%3;
      for(let i=0;i<n;i++){ const s=C.a+30*((hs>>>(i*6))%20), e=s+60*(2+((hs>>>(i*6+3))%3)); if(e>C.b||out.some(b=>s<b.e&&e>b.s)) continue; out.push({s,e,label:tm[(hs>>>(i*3+1))%tm.length],mine:false,team:false}); } }
    return out; }
  const fBusy=(kind,id,date)=>seedBusy(kind,id,date).concat(fList(kind).filter(r=>r.fid===id&&r.date===date&&r.status!=='cancelled').map(r=>({s:r.s,e:r.e,label:'내 예약',mine:true,rid:r.id})));
  const fOver=(s,e,list)=>list.some(b=>s<b.e&&e>b.s);
  const fBase=r=>new Date(r.date+'T00:00:00').getTime();
  const rState=r=>{ if(r.status==='cancelled') return ['취소됨','x']; const t=+K.now(), b=fBase(r); return t>=b+r.e*60000?['이용 완료','d']:t>=b+r.s*60000?['이용 중','u']:['예약 완료','ok']; };
  const fNowMin=()=>{ const d=new Date(+K.now()); return d.getHours()*60+d.getMinutes(); };
  const fToday=()=>dKey(new Date(+K.now()));
  const fNowFree=(kind,id)=>{ const n=fNowMin(), C=FCFG[kind]; return n>=C.a&&n<C.b&&!fOver(n,n+1,fBusy(kind,id,fToday())); };
  const fOpen=kind=>{ const n=fNowMin(), C=FCFG[kind]; return n>=C.a&&n<C.b; };
  const fActive=()=>FD.rooms.concat(FD.cars).filter(r=>rState(r)[1]==='ok'||rState(r)[1]==='u');
  function fTeam(kind){ const out=[], t0=+K.now(); for(let i=0;i<16;i++){ const date=dKey(new Date(t0+i*86400000)), base=new Date(date+'T00:00:00').getTime();
      fItems(kind).forEach(f=>{ if(f.closed) return; seedBusy(kind,f.id,date).filter(b=>b.team&&base+b.e*60000>t0).forEach(b=>out.push({date,s:b.s,e:b.e,name:f.name,who:b.by+' · '+b.p,by:b.by,p:b.p,dest:b.dest,kind})); }); }
    fList(kind).filter(r=>r.status!=='cancelled'&&rState(r)[1]!=='d').forEach(r=>{ const f=fFind(kind,r.fid); out.push({date:r.date,s:r.s,e:r.e,name:f?f.name:'',who:'내 예약 · '+r.purpose,p:r.purpose,dest:r.dest,kind,mine:true}); });
    return out.sort((a,b)=>(a.date<b.date?-1:a.date>b.date?1:a.s-b.s)); }
  let fv=null;
  const fgo=o=>{ fv.push(o); show(); }; const fback=()=>{ fv.pop(); if(!fv.length) fv=null; show(); };
  const openFac=()=>{ tab='portal'; nv=null; av=null; fv=[{m:'home'}]; show(); };
  const ficon={ room:SV('<rect x="3.500" y="6" width="17" height="11" rx="2"/><path d="M8 20h8M12 17v3"/>',26,1.700), car:SV('<path d="M5 16V11l2-5h10l2 5v5M3 16h18M7.500 19.500a1.500 1.500 0 1 0 0-3 1.500 1.500 0 0 0 0 3zM16.500 19.500a1.500 1.500 0 1 0 0-3 1.500 1.500 0 0 0 0 3z"/>',26,1.700) };
  const roomArt=r=>r.img?'<img src="'+r.img+'" alt="" style="width:100%;height:100%;object-fit:cover;display:block">':'<svg viewBox="0 0 200 110" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="200" height="110" fill="#e8ecf6"/><rect x="0" y="86" width="200" height="24" fill="#d4dae9"/><rect x="62" y="14" width="76" height="40" rx="3" fill="#fff" stroke="#22346a" stroke-width="2"/><path d="M70 44l14-12 12 8 16-16 14 12" fill="none" stroke="#22346a" stroke-width="2"/><rect x="40" y="62" width="120" height="16" rx="6" fill="#22346a"/>'+[48,74,100,126,152].slice(0,Math.max(3,Math.min(5,Math.ceil(r.cap/4)))).map(x=>'<rect x="'+(x-6)+'" y="80" width="12" height="12" rx="3" fill="#7a89b8"/>').join('')+'</svg>';
  const carArt=c=>{ if(c.img) return '<img src="'+c.img+'" alt="" style="width:100%;height:100%;object-fit:cover;display:block">'; const van=/승합/.test(c.type), suv=/SUV/.test(c.type); const body=van?'<path d="M34 78V50q0-6 6-6h86q8 0 14 8l14 14v12z" fill="#fff" stroke="#22346a" stroke-width="2.500"/><path d="M44 52h30v16H44zM80 52h34v16H80zM120 52h12l12 16h-24z" fill="#cbd5ea"/>':suv?'<path d="M30 78V62q0-6 6-8l26-8q6-14 26-14h26q10 0 18 12l14 10q8 2 8 10v14z" fill="#fff" stroke="#22346a" stroke-width="2.500"/><path d="M70 46q6-8 16-8h20q8 0 14 8z" fill="#cbd5ea"/>':'<path d="M30 78V66q0-8 8-10l22-6 16-14h40l18 16 14 4q8 2 8 10v12z" fill="#fff" stroke="#22346a" stroke-width="2.500"/><path d="M78 52l12-10h32l14 12z" fill="#cbd5ea"/>';
    return '<svg viewBox="0 0 200 110" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="200" height="110" fill="'+c.tone+'"/><rect y="88" width="200" height="22" fill="#cfd5e3"/>'+body+'<circle cx="62" cy="80" r="11" fill="#22346a"/><circle cx="62" cy="80" r="4.500" fill="#cbd5ea"/><circle cx="146" cy="80" r="11" fill="#22346a"/><circle cx="146" cy="80" r="4.500" fill="#cbd5ea"/></svg>'; };
  const fConfirm=(pgEl,title,msg,okLabel,fn)=>{ const close=()=>{ ov.classList.remove('on'); setTimeout(()=>ov.remove(),200); };
    const ov=h('div',{class:'mz-as mz-cf',onclick:e=>{ if(e.target===ov) close(); }},h('div',{class:'mz-ap mz-cfp'},h('b',{class:'t'},title),h('p',{},msg),h('div',{class:'bt'},h('button',{onclick:close},'닫기'),h('button',{class:'pr dg',onclick:()=>{ close(); fn(); }},okLabel))));
    pgEl.append(ov); requestAnimationFrame(()=>ov.classList.add('on')); };
  function facView(){ const o=fv[fv.length-1]; return o.m==='home'?facHome():o.m==='list'?facList(o):o.m==='book'?facBook(o):facMine(o); }
  function facHome(){ const act=fActive().sort((a,b)=>fBase(a)+a.s*60000-fBase(b)-b.s*60000), nx=act[0];
    const TR=fTeam('room'), TC=fTeam('car'), nr=TR.length, nc=TC.length, TA=TR.concat(TC).sort((a,b)=>(a.date<b.date?-1:a.date>b.date?1:a.s-b.s)), tx=TA[0];
    const nm=r=>{ const k=r.kind||(FD.rooms.includes(r)?'room':'car'); const f=fFind(k,r.fid); return f?f.name:''; };
    const menu=(kind,t,sub,cnt)=>h('div',{class:'mz-fm',onclick:()=>fgo({m:'list',kind})},h('i',{html:ficon[kind]}),h('div',{},h('b',{},t),h('small',{},sub)),h('em',{},cnt));
    const ava=k=>fItems(k).filter(x=>!x.closed&&fNowFree(k,x.id)).length;
    return h('div',{class:'mz-nw'},nBar('사내 시설 예약',()=>{ fv=null; show(); }),
      h('div',{class:'mz-fs'},h('small',{},'예약 현황'),h('b',{},'내 팀 예약 '+(nr+nc)+'건'),h('span',{},'회의실 '+nr+'건 · 공용 차량 '+nc+'건'),
        h('div',{class:'nx'},tx?h('div',{},h('small',{},'가장 가까운 예약'),h('b',{},dLab(tx.date)+' '+fm(tx.s)+' ~ '+fm(tx.e)),h('span',{},tx.name+' · '+(tx.p||''))):h('div',{},h('small',{},'가장 가까운 예약'),h('b',{},'예정된 예약이 없어요')))),
      h('div',{class:'mz-fh'},'시설 예약'),
      h('div',{class:'mz-fml'},menu('room','회의실 예약','회의실 조회 · 시간 선택',(fOpen('room')?'지금 가능 '+ava('room')+'곳':'운영 시간 09:00~19:00')),menu('car','공용 차량 예약','차량 조회 · 일정 선택',(fOpen('car')?'지금 가능 '+ava('car')+'대':'운영 시간 07:00~21:00'))),
      h('div',{class:'mz-fh'},E.dept+' 예약 일정'),
      h('div',{class:'mz-fml'},...(()=>{ const L=fTeam('room').map(x=>Object.assign({tp:'회의실'},x)).concat(fTeam('car').map(x=>Object.assign({tp:'차량'},x))).sort((a,b)=>(a.date<b.date?-1:a.date>b.date?1:a.s-b.s)).slice(0,6);
        return L.length?L.map(x=>h('div',{class:'mz-fm sm tm'+(x.mine?' me':'')},h('div',{},h('b',{},x.name),h('small',{},dLab(x.date)+' '+fm(x.s)+' ~ '+fm(x.e)),h('small',{class:'rs'},x.p||'')),h('em',{},x.tp))):[h('div',{class:'mz-fm sm'},h('div',{},h('b',{},'예정된 팀 예약이 없어요')))]; })()),
      h('div',{class:'mz-fh'},'내 예약 내역'),
      h('div',{class:'mz-fml'},h('div',{class:'mz-fm sm',onclick:()=>fgo({m:'mine',kind:'room'})},h('div',{},h('b',{},'회의실 예약 내역'),h('small',{},'예약 확인 · 취소')),h('em',{},FD.rooms.length+'건 ›')),h('div',{class:'mz-fm sm',onclick:()=>fgo({m:'mine',kind:'car'})},h('div',{},h('b',{},'차량 예약 내역'),h('small',{},'예약 확인 · 취소')),h('em',{},FD.cars.length+'건 ›'))),h('div',{style:'height:24px'})); }
  function facList(o){ const room=o.kind==='room'; const items=fItems(o.kind);
    return h('div',{class:'mz-nw'},nBar(room?'회의실 예약':'공용 차량 예약',fback),
      h('div',{class:'mz-nh2'},h('b',{},room?'회의실 목록':'차량 목록'),h('small',{},'전체 '+items.length+(room?'곳':'대')+' · 선택하면 예약 현황을 볼 수 있어요')),
      h('div',{class:'mz-nl'},...items.map(x=>{ const bad=!!x.closed, free=!bad&&fNowFree(o.kind,x.id);
        return h('div',{class:'mz-fc'+(bad?' off':''),onclick:()=>{ if(!bad) fgo({m:'book',kind:o.kind,id:x.id,date:fToday(),sel:null,pax:1,purpose:'',dest:''}); }},
          h('div',{class:'art',html:room?roomArt(x):carArt(x)}),
          h('div',{class:'inf'},h('div',{class:'r1'},h('b',{},x.name),h('span',{class:'bg '+(bad?'no':free?'ok':'bz')},bad?'예약 불가':!fOpen(o.kind)?'운영 시간 외':free?'지금 사용 가능':'사용 중')),
            h('small',{},room?x.loc+' · 최대 '+x.cap+'명':x.plate+' · '+x.type+' · '+x.seats+'인승'),
            room?h('div',{class:'eq'},...x.eq.map(e=>h('span',{},e))):null,
            bad?h('small',{class:'wn'},x.closed):null)); })),h('div',{style:'height:24px'})); }
  function facBook(o){ const room=o.kind==='room', it=fFind(o.kind,o.id), C=FCFG[o.kind], cap=room?it.cap:it.seats;
    const slots=[]; for(let m=C.a;m<C.b;m+=30) slots.push(m);
    const dates=[]; for(let i=0;i<14;i++){ const d=new Date(+K.now()+i*86400000); dates.push(dKey(d)); }
    const wrap=h('div',{class:'mz-nw'}), strip=h('div',{class:'mz-fds'}), grid=h('div',{class:'mz-fg'}), sum=h('div',{class:'mz-fsum'}), err=h('div',{class:'mz-ferr'});
    const selS=h('select',{}), selE=h('select',{});
    const opt=(sel,vals)=>{ sel.innerHTML=''; vals.forEach(v=>sel.append(h('option',{value:v},fm(v)))); };
    opt(selS,slots); opt(selE,slots.map(m=>m+30));
    const past=m=>o.date===fToday()&&m<fNowMin();
    function paint(){ err.textContent='';
      strip.innerHTML=''; dates.forEach(k=>{ const d=new Date(k+'T00:00:00'); strip.append(h('button',{class:(o.date===k?'on':'')+(d.getDay()===0?' su':d.getDay()===6?' sa':''),onclick:()=>{ o.date=k; o.sel=null; paint(); }},h('small',{},DOWN[d.getDay()]),h('b',{},String(d.getDate())))); });
      const busy=fBusy(o.kind,o.id,o.date); grid.innerHTML='';
      slots.forEach(m=>{ const b=busy.find(x=>m>=x.s&&m<x.e), ps=past(m), sel=o.sel&&m>=o.sel[0]&&m<o.sel[1];
        grid.append(h('button',{class:'sl'+(b?(b.mine?' mine':b.team?' team':' busy'):ps?' ps':'')+(sel?' sel':''),disabled:!!(b||ps),onclick:()=>{ pick(m); }},h('b',{},fm(m)),h('small',{},b?(b.team?'우리 팀':b.label):ps?'지남':sel?'선택':'가능'))); });
      if(o.sel){ selS.value=o.sel[0]; selE.value=o.sel[1]; } 
      sum.innerHTML=''; sum.append(h('span',{},dLab(o.date)),h('b',{},o.sel?fm(o.sel[0])+' ~ '+fm(o.sel[1])+' ('+((o.sel[1]-o.sel[0])/60)+'시간)':'시간을 선택해 주세요')); }
    function pick(m){ if(!o.sel||o.sel[1]-o.sel[0]>=1e9||m<o.sel[0]||m>=o.sel[1]&&o.step===2||!o.step){ o.sel=[m,m+30]; o.step=1; }
      else { const s=o.sel[0]; if(m>=s){ const e=m+30; if(fOver(s,e,fBusy(o.kind,o.id,o.date))){ o.sel=[m,m+30]; } else o.sel=[s,e]; } else o.sel=[m,m+30]; o.step=1; }
      paint(); }
    selS.onchange=()=>{ const s=+selS.value; o.sel=[s,o.sel&&o.sel[1]>s?o.sel[1]:s+30]; paint(); };
    selE.onchange=()=>{ const e=+selE.value, s=o.sel?o.sel[0]:C.a; o.sel=[s,e]; paint(); if(e<=s) err.textContent='종료 시간은 시작 시간보다 늦어야 해요.'; };
    const purpose=h('input',{class:'fi',placeholder:room?'예) 주간 업무 회의':'예) 고객사 방문',value:o.purpose,oninput:e=>{ o.purpose=e.target.value; }});
    const dest=h('input',{class:'fi',placeholder:'예) 서울 마포구 고객사',value:o.dest,oninput:e=>{ o.dest=e.target.value; }});
    const paxEl=h('span',{class:'fpv'},String(o.pax));
    const stp=d=>()=>{ o.pax=Math.max(1,o.pax+d); paxEl.textContent=o.pax; };
    const submit=()=>{ err.textContent='';
      const bad=t=>{ err.textContent=t; err.scrollIntoView&&err.scrollIntoView({block:'center'}); };
      if(!o.sel) return bad('예약할 시간을 선택해 주세요.');
      const [s,e]=o.sel; if(e<=s) return bad((room?'종료':'반납')+' 시간은 '+(room?'시작':'출발')+' 시간보다 늦어야 해요.');
      if(!o.purpose.trim()) return bad((room?'회의':'이용')+' 목적을 입력해 주세요.');
      if(!room&&!o.dest.trim()) return bad('목적지를 입력해 주세요.');
      if(o.pax<1) return bad((room?'참석':'탑승')+' 인원을 입력해 주세요.');
      if(o.pax>cap) return bad((room?'최대 수용 인원':'최대 탑승 인원')+'('+cap+(room?'명':'인')+')을 초과할 수 없어요.');
      if(o.date===fToday()&&s<fNowMin()) return bad('이미 지난 시간은 예약할 수 없어요.');
      if(fOver(s,e,fBusy(o.kind,o.id,o.date))) return bad('이미 예약된 시간과 겹쳐요. 다른 시간을 선택해 주세요.');
      const r={id:o.kind[0]+Date.now(),kind:o.kind,fid:o.id,date:o.date,s,e,purpose:o.purpose.trim(),dest:room?'':o.dest.trim(),pax:o.pax,who:E.name,dept:E.dept||'',status:'reserved',created:+K.now()};
      fList(o.kind).push(r); fSave(); try{ const ff=fFind(o.kind,r.fid); K.logWork('fac',(room?'회의실':'공용 차량')+' 예약',E.name+' '+E.rank+' · '+(ff?ff.name:'')+' · '+dLab(r.date)+' '+fm(r.s)+'~'+fm(r.e)+' · 목적: '+r.purpose+(room?'':' · 목적지: '+r.dest)+' · '+r.pax+(room?'명':'인')); }catch(e){} o.sel=null; paint();
      const close=()=>{ ov.classList.remove('on'); setTimeout(()=>ov.remove(),200); };
      const ov=h('div',{class:'mz-as mz-cf on'},h('div',{class:'mz-ap mz-cfp'},h('div',{class:'ok',html:SV('<path d="M5 12.500l4.500 4.500L19 7.500"/>',30,2.600)}),h('b',{class:'t'},'예약이 완료되었어요'),
        h('p',{},it.name+(room?'':' ('+it.plate+')')+'\n'+dLab(r.date)+' '+fm(r.s)+' ~ '+fm(r.e)),
        h('div',{class:'bt'},h('button',{onclick:()=>{ close(); fv.pop(); fv.push({m:'mine',kind:o.kind}); show(); }},'내 예약 보기'),h('button',{class:'pr',onclick:()=>{ close(); fback(); }},'확인'))));
      wrap.append(ov); };
    wrap.append(nBar(it.name,fback),
      h('div',{class:'mz-fi'},h('div',{class:'art',html:room?roomArt(it):carArt(it)}),h('div',{class:'inf'},h('b',{},it.name),h('small',{},room?it.loc+' · 최대 '+it.cap+'명':it.plate+' · '+it.type+' · '+it.seats+'인승'),room?h('div',{class:'eq'},...it.eq.map(e=>h('span',{},e))):null)),
      h('div',{class:'mz-fh'},'날짜 선택'),strip,
      h('div',{class:'mz-fh'},'시간 선택'),h('div',{class:'mz-fleg'},h('span',{class:'a'},'가능'),h('span',{class:'b'},'예약됨'),h('span',{class:'c'},'내 예약'),h('span',{class:'t'},'우리 팀'),h('span',{class:'d'},'선택')),grid,
      h('div',{class:'mz-fh'},'예약 신청'),
      h('div',{class:'mz-ff'},sum,
        h('label',{},h('span',{},'예약자'),h('div',{class:'ro'},E.name+(E.dept?' · '+E.dept:''))),
        h('label',{},h('span',{},room?'시작 / 종료 시간':'출발 / 반납 예정 시간'),h('div',{class:'two'},selS,h('i',{},'~'),selE)),
        h('label',{},h('span',{},room?'회의 목적':'이용 목적'),purpose),
        room?null:h('label',{},h('span',{},'목적지'),dest),
        h('label',{},h('span',{},(room?'참석 인원':'탑승 인원')+' (최대 '+cap+(room?'명':'인')+')'),h('div',{class:'stp'},h('button',{onclick:stp(-1)},'−'),paxEl,h('button',{onclick:stp(1)},'+'))),
        err,h('button',{class:'mz-nlb mz-fbk',onclick:submit},room?'회의실 예약하기':'차량 예약하기')),
      h('div',{style:'height:30px'}));
    paint(); return wrap; }
  function facMine(o){ const room=o.kind==='room'; let seg='up';
    const wrap=h('div',{class:'mz-nw'}), list=h('div',{class:'mz-nl'}), chips=h('div',{class:'mz-nch'});
    function paint(){ chips.innerHTML=''; [['up','예정·진행'],['past','지난 내역·취소'],['team','우리 팀']].forEach(([k,t])=>chips.append(h('button',{class:seg===k?'on':'',onclick:()=>{ seg=k; paint(); }},t)));
      const all=fList(o.kind).slice().sort((a,b)=>(fBase(b)+b.s*60000)-(fBase(a)+a.s*60000));
      if(seg==='team'){ list.innerHTML=''; const T=fTeam(o.kind); if(!T.length){ list.append(h('div',{class:'mz-ne'},h('b',{},'예정된 팀 예약이 없어요'))); return; }
        T.forEach(x=>list.append(h('div',{class:'mz-nc mz-rc'},h('div',{class:'r1'},h('b',{class:'nm'},x.name),h('span',{style:'flex:1'}),h('span',{class:'bg '+(x.mine?'st-u':'st-ok')},x.mine?'내 예약':'팀 예약')),h('div',{class:'dl'},h('span',{},'날짜'),h('b',{},dLab(x.date))),h('div',{class:'dl'},h('span',{},'시간'),h('b',{},fm(x.s)+' ~ '+fm(x.e))),h('div',{class:'dl'},h('span',{},'목적'),h('b',{},x.p||(x.who||'').replace('내 예약 · ',''))),x.dest?h('div',{class:'dl'},h('span',{},'목적지'),h('b',{},x.dest)):null,h('div',{class:'dl'},h('span',{},'소속'),h('b',{},E.dept))))); return; }
      const rows=all.filter(r=>{ const s=rState(r)[1]; return seg==='up'?(s==='ok'||s==='u'):(s==='d'||s==='x'); });
      list.innerHTML=''; if(!rows.length){ list.append(h('div',{class:'mz-ne'},h('b',{},seg==='up'?'예정된 예약이 없어요':'지난 내역이 없어요'),h('p',{},room?'회의실 예약을 하면 이곳에서 확인할 수 있어요.':'차량 예약을 하면 이곳에서 확인할 수 있어요.'))); return; }
      rows.forEach(r=>{ const f=fFind(o.kind,r.fid)||{name:'(삭제된 시설)',plate:''}, st=rState(r);
        list.append(h('div',{class:'mz-nc mz-rc'},h('div',{class:'r1'},h('b',{class:'nm'},f.name+(room?'':' · '+f.plate)),h('span',{style:'flex:1'}),h('span',{class:'bg st-'+st[1]},st[0])),
          h('div',{class:'dl'},h('span',{},'날짜'),h('b',{},dLab(r.date))),h('div',{class:'dl'},h('span',{},'시간'),h('b',{},fm(r.s)+' ~ '+fm(r.e))),
          h('div',{class:'dl'},h('span',{},room?'회의 목적':'이용 목적'),h('b',{},r.purpose)),
          room?null:h('div',{class:'dl'},h('span',{},'목적지'),h('b',{},r.dest)),
          h('div',{class:'dl'},h('span',{},room?'참석 인원':'탑승 인원'),h('b',{},r.pax+(room?'명':'인'))),
          st[1]==='ok'?h('button',{class:'mz-cx',onclick:()=>fConfirm(wrap,'예약을 취소할까요?',f.name+'\n'+dLab(r.date)+' '+fm(r.s)+' ~ '+fm(r.e),'예약 취소',()=>{ r.status='cancelled'; fSave(); try{ const ff=fFind(r.kind||o.kind,r.fid); K.logWork('fac',(o.kind==='room'?'회의실':'공용 차량')+' 예약 취소',E.name+' · '+(ff?ff.name:'')+' · '+dLab(r.date)+' '+fm(r.s)+'~'+fm(r.e)+' · 목적: '+r.purpose); }catch(e){} paint(); K.toast('예약이 취소되었어요'); })},'예약 취소'):null)); }); }
    wrap.append(nBar(room?'회의실 예약 내역':'차량 예약 내역',fback),h('div',{class:'mz-nh2'},h('b',{},room?'회의실 예약 내역':'차량 예약 내역'),h('small',{},'전체 '+fList(o.kind).length+'건')),chips,list,h('div',{style:'height:24px'}));
    paint(); return wrap; }
  /* ===== 전자결재(결재함) ===== */
  const AK='kyh_apr_t1', AP=D.shApr, ME='강영현', MY_DEPT='대외협력 커뮤니케이션실';
  const pad2=n=>String(n).padStart(2,'0');
  const aStamp=()=>{ const d=new Date(K.now()); return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())+' '+pad2(d.getHours())+':'+pad2(d.getMinutes()); };
  const aShort=s=>s?s.slice(5,16).replace('-','.').replace(' ',' '):'';
  const aSeed=()=>{ const docs=JSON.parse(JSON.stringify(AP.docs)).map(d=>aNorm(d)); return { docs, arrived:false, seq:1110, noti:[] }; };
  function aNorm(d){ d.line=(d.line||[]).map(s=>({n:s[0],st:s[1],at:s[2],c:s[3],role:s[4]}));
    d.hist=[]; d.line.forEach(s=>{ if(s.st==='ok') d.hist.push({n:s.n,t:s.role==='기안'?'기안 상신':'승인',at:s.at||d.at,c:s.c}); else if(s.st==='no') d.hist.push({n:s.n,t:'반려',at:s.at,c:s.c}); });
    d.cm=[]; d.hold=false; return d; }
  let AD; try{ AD=JSON.parse((localStorage.getItem(AK)||'null')&&localStorage.getItem(AK).split('윤재호').join('유주희')); }catch(e){ AD=null; } if(!AD||!AD.docs) AD=aSeed();
  const aSave=()=>{ try{ localStorage.setItem(AK,JSON.stringify(AD)); }catch(e){} };
  const aPer=n=>AP.people[n]||{dept:'',rank:''};
  const aType=id=>AP.types.find(t=>t.id===id)||AP.types[0];
  const aCur=d=>d.st==='progress'?d.line.find(s=>s.st==='cur'):null;
  const aMyTurn=d=>{ const c=aCur(d); return !!c&&c.n===ME&&d.by!==ME; };
  const aInvolved=d=>d.by===ME||d.line.some(s=>s.n===ME);
  const aMyDone=d=>d.by!==ME&&d.line.some(s=>s.n===ME&&(s.st==='ok'||s.st==='no'));
  const aLists=()=>{ const ds=AD.docs, srt=a=>a.slice().sort((x,y)=>(y.at>x.at?1:y.at<x.at?-1:0));
    return { inbox:srt(ds.filter(aMyTurn)), sent:srt(ds.filter(d=>d.by===ME&&d.st!=='draft')), done:srt(ds.filter(d=>d.st!=='draft'&&aInvolved(d)&&(d.st==='done'||d.st==='rejected'||aMyDone(d)))), draft:srt(ds.filter(d=>d.st==='draft'&&d.by===ME)) }; };
  const aCnt=()=>{ const ds=AD.docs; return { wait:ds.filter(aMyTurn).length, prog:ds.filter(d=>d.by===ME&&d.st==='progress').length, done:ds.filter(d=>d.st==='done'&&aInvolved(d)).length, rej:ds.filter(d=>d.st==='rejected'&&aInvolved(d)).length }; };
  const aStatus=d=>d.st==='draft'?['임시 저장','d']:d.st==='done'?['결재 완료','ok']:d.st==='rejected'?['반려','x']:aMyTurn(d)?(d.hold?['보류 중','bz']:['결재 대기','u']):(d.hold?['보류 중','bz']:['결재 진행 중','bz']);
  const aWon=v=>{ const n=Number(String(v||'').replace(/[^0-9]/g,'')); return n?n.toLocaleString('ko-KR')+'원':''; };
  const aNote=(t,x)=>{ AD.noti=AD.noti||[]; AD.noti.unshift({t,x,at:aStamp()}); AD.noti=AD.noti.slice(0,30); };
  function aCalSync(){ const evs=K.state.events; AD.docs.forEach(d=>{ if(!d.cal||d.st==='rejected') return; const id='apr-'+d.id; if(evs.some(e=>e.id===id)) return; const f=d.f||{}, ds=f.date||f.from, de=f.to||f.date; if(!ds) return; const [y,m,dd]=ds.split('-').map(Number), [y2,m2,d2]=de.split('-').map(Number); const tp=d.type==='trip'||d.type==='leave'; evs.push({id,ts:+new Date(y,m-1,dd,tp?0:14,0),end:tp?+new Date(y2,m2-1,d2,23,59):+new Date(y,m-1,dd,16,0),title:(d.type==='trip'?'[출장] ':d.type==='leave'?'[휴가] ':'')+(f.name||f.purpose||d.title),place:f.place||'',color:'#22346a',allDay:tp}); }); }
  const aReg=d=>{ if(['event','trip','leave','press'].includes(d.type)&&(d.f.date||d.f.from)){ d.cal=true; aCalSync(); } };
  aCalSync();
  const aNotify=(d,res,who)=>{ if(d.by===ME){ K.banner({app:'shcard',title:'전자결재',text:'내 문서가 '+res+'되었어요 · '+d.title}); } else { K.toast(res==='결재 완료'?'결재가 완료되었어요 · '+d.by+' '+aPer(d.by).rank+'에게 알림 전달':d.by+' '+aPer(d.by).rank+'에게 '+res+' 알림이 전달되었어요'); } aNote(d.id,res); };
  const aLog=(l,d,x)=>{ try{ K.logWork('apr',l,d.id+' '+d.title+(x?' · '+x:'')); }catch(e){} };
  function aApprove(d,c){ const s=aCur(d); if(!s||s.n!==ME||d.by===ME) return false; const at=aStamp(); s.st='ok'; s.at=at; s.c=c||''; d.hold=false; d.hist.push({n:ME,t:'승인',at,c:c||''}); const nx=d.line.find(x=>x.st==='wait'); if(nx) nx.st='cur'; else { d.st='done'; } aReg(d); aSave(); aLog(d.st==='done'?'최종 승인(결재 완료)':'승인',d,'기안 '+d.by+(c?' · 의견: '+c:'')); if(d.st==='done') aNotify(d,'결재 완료'); else K.toast('승인했어요 · 다음 결재자 '+nx.n+' '+aPer(nx.n).rank+'에게 전달되었어요'); return true; }
  function aReject(d,c){ const s=aCur(d); if(!s||s.n!==ME||d.by===ME) return false; const at=aStamp(); s.st='no'; s.at=at; s.c=c; d.st='rejected'; d.hold=false; d.hist.push({n:ME,t:'반려',at,c}); aSave(); aLog('반려',d,'기안 '+d.by+' · 사유: '+c); aNotify(d,'반려'); return true; }
  function aHold(d,c){ const s=aCur(d); if(!s||s.n!==ME||d.by===ME) return false; d.hold=true; d.hist.push({n:ME,t:'보류',at:aStamp(),c}); aSave(); aLog('보류',d,'기안 '+d.by+' · 사유: '+c); K.toast('보류 처리했어요'); return true; }
  function aSim(){ let ch=false; AD.docs.forEach(d=>{ if(d.by!==ME||d.st!=='progress'||!d.simAt) return; for(let g=0;g<4;g++){ const s=aCur(d); if(!s||s.n===ME) break; const last=d.simLast||d.simAt; if(K.now()-last<20000) break; const at=aStamp(); s.st='ok'; s.at=at; s.c='검토 완료되었습니다. 승인합니다.'; d.hist.push({n:s.n,t:'승인',at,c:s.c}); d.simLast=K.now(); const nx=d.line.find(x=>x.st==='wait'); if(nx) nx.st='cur'; else { d.st='done'; aNotify(d,'결재 완료'); } ch=true; if(d.st==='done') break; } }); if(ch){ aSave(); if(av&&(av.m==='home'||av.m==='d')) show(); } }
  function aArrive(){ if(AD.arrived) return; AD.arrived=true; const a=JSON.parse(JSON.stringify(AP.arrive)); a.at=aStamp(); a.line[0].at=a.at; AD.docs.push(aNorm(a)); aSave(); aLog('결재 요청 도착',a,'기안 '+a.by); K.banner({app:'shcard',title:'전자결재 · 결재 요청',text:a.by+' '+aPer(a.by).rank+' · '+a.title,onTap:()=>{ K.openApp('shcard'); openApr(a.id); }}); if(av&&(av.m==='home')) show(); }
  let av=null, aTm=null, aTab='inbox';
  const openApr=id=>{ tab='portal'; nv=null; fv=null; av=id?{m:'d',id}:{m:'home'}; show(); if(!AD.arrived&&!aTm) aTm=setTimeout(()=>{ aTm=null; aArrive(); },12000); };
  setInterval(aSim,4000); aSim();
  const aBack=()=>{ if(av&&av.m!=='home'&&av.from!=='x'){ av={m:'home'}; } else av=null; show(); };
  const aModal=(pgEl,o,fn)=>{ const close=()=>{ ov.classList.remove('on'); setTimeout(()=>ov.remove(),200); }; let ta;
    const ov=h('div',{class:'mz-as mz-cf',onclick:e=>{ if(e.target===ov) close(); }},h('div',{class:'mz-ap mz-cfp'},h('b',{class:'t'},o.title),o.msg?h('p',{},o.msg):null,
      o.ph?(ta=h('textarea',{class:'mz-ar',placeholder:o.ph,rows:4})):null,h('div',{class:'mz-aer'}),
      h('div',{class:'bt'},h('button',{onclick:close},'닫기'),h('button',{class:'pr'+(o.dg?' dg':''),onclick:()=>{ const v=ta?ta.value.trim():''; if(o.req&&!v){ ov.querySelector('.mz-aer').textContent=o.req; return; } close(); fn(v); }},o.ok))));
    pgEl.append(ov); requestAnimationFrame(()=>ov.classList.add('on')); if(ta) setTimeout(()=>ta.focus(),250); };
  const aCard=d=>{ const st=aStatus(d), t=aType(d.type), c=aCur(d); const mine=d.by===ME;
    return h('div',{class:'mz-nc mz-ac',onclick:()=>{ av={m:'d',id:d.id}; show(); }},
      h('div',{class:'r1'},h('span',{class:'bg st-'+st[1]},st[0]),h('em',{class:'rdt',style:'margin-left:auto'},aShort(d.at))),
      h('p',{},d.title),
      h('div',{class:'mt'},h('span',{},t.n),h('span',{},'기안 '+d.by+' '+aPer(d.by).rank),h('span',{},d.id),
        (d.st==='progress'&&c&&!(c.n===ME&&!mine))?h('span',{},'현재 '+c.n+' '+aPer(c.n).rank+' 결재 대기'):null)); };
  function aniHome(){ const wrap=h('div',{class:'mz-nw'}), cn=aCnt(), L=aLists(); const tabs=[['inbox','받은 결재'],['sent','상신 문서'],['done','결재 완료'],['draft','임시 저장']];
    const sum=(k,lab,n,cls,tb)=>h('div',{class:'mz-asm '+cls,onclick:()=>{ aTab=tb; show(); }},h('b',{},String(n)),h('small',{},lab));
    const list=L[aTab];
    wrap.append(nBar('전자결재',()=>{ av=null; show(); }),
      h('div',{class:'mz-ahd'},h('div',{},h('b',{},ME+' '+aPer(ME).rank),h('small',{},'신현카드 · 대외협력커뮤니케이션실')),h('button',{class:'mz-anw',onclick:()=>{ av={m:'new',draft:null}; show(); }},'+ 새 문서')),
      h('div',{class:'mz-asg'},sum('w','결재 대기',cn.wait,'a1','inbox'),sum('p','결재 진행',cn.prog,'a2','sent'),sum('d','결재 완료',cn.done,'a3','done'),sum('r','반려 문서',cn.rej,'a4','sent')),
      h('div',{class:'mz-atb'},...tabs.map(t=>h('button',{class:aTab===t[0]?'on':'',onclick:()=>{ aTab=t[0]; show(); }},t[1],(t[0]==='inbox'||t[0]==='draft')&&L[t[0]].length?h('em',{},String(L[t[0]].length)):null))),
      h('div',{class:'mz-nl'},...(list.length?list.map(aCard):[h('div',{class:'mz-emp'},aTab==='inbox'?'결재할 문서가 없어요':aTab==='sent'?'상신한 문서가 없어요':aTab==='done'?'처리 완료된 문서가 없어요':'임시 저장된 문서가 없어요')])));
    return wrap; }
  function aniDetail(){ const d=AD.docs.find(x=>x.id===av.id); if(!d){ av={m:'home'}; return aniHome(); } const wrap=h('div',{class:'mz-nw'}), st=aStatus(d), t=aType(d.type), per=aPer(d.by);
    const row=(k,v)=>h('div',{class:'rw'},h('small',{},k),h('span',{},v));
    const tl=h('div',{class:'mz-atl'});
    const steps=d.st==='draft'?[{n:ME,st:'draft',role:'기안'}].concat((d.ap||[]).map(n=>({n,st:'wait',role:n===ME?'':(n==='유주희'?'결재':n==='정민석'?'최종':'합의')}))):d.line;
    steps.forEach((s,i)=>{ const lab=s.st==='ok'?(s.role==='기안'?'기안':'승인'):s.st==='no'?'반려':s.st==='cur'?(d.hold&&s.n===ME?'보류 중':'결재 대기'):s.st==='draft'?'작성 중':'예정';
      tl.append(h('div',{class:'ts '+s.st},h('i',{}),h('div',{},h('b',{},s.n+' '+aPer(s.n).rank),h('small',{},aPer(s.n).dept+' · '+(s.role||'결재')),h('span',{class:'bg '+(s.st==='ok'?'st-ok':s.st==='no'?'st-x':s.st==='cur'?'st-u':'st-d')},lab),s.at?h('small',{class:'at'},s.at):null,s.c?h('p',{},'“'+s.c+'”'):null))); });
    const fr=t.f.map(f=>{ let v=d.f[f[0]]; if(v==null||v==='') return null; if(f[2]==='n') v=aWon(v); return row(f[1],v); }).filter(Boolean);
    const hist=d.hist.concat((d.cm||[]).map(c=>({n:c.n,t:'의견',at:c.at,c:c.c}))).sort((a,b)=>(a.at>b.at?1:a.at<b.at?-1:0));
    wrap.append(nBar('결재 문서',()=>{ av={m:'home'}; show(); }),
      h('div',{class:'mz-ad'},
        h('div',{class:'r1'},h('span',{class:'bg st-'+st[1]},st[0]),h('em',{class:'rdt'},d.id)),
        h('h3',{},d.title),
        h('div',{class:'mz-agr'},row('문서 종류',t.n),row('작성자',d.by),row('작성 부서',per.dept),row('작성 직급',per.rank),row('작성 일시',d.at),row('문서 번호',d.id))),
      h('div',{class:'mz-fh'},'결재 진행 상황'),h('div',{class:'mz-ad'},tl),
      h('div',{class:'mz-fh'},'문서 본문'),
      h('div',{class:'mz-ad'},h('div',{class:'mz-agr'},row('기안 부서',per.dept),row('기안자',d.by+' '+per.rank),...fr,d.budget?row('관련 예산',aWon(d.budget)):null),d.body?h('div',{class:'mz-abd'},d.body):h('div',{class:'mz-emp',style:'padding:14px 0 4px'},'본문이 작성되지 않았어요')),
      h('div',{class:'mz-fh'},'첨부파일 '+(d.att.length||'')),
      h('div',{class:'mz-ad'},d.att.length?h('div',{},...d.att.map(a=>h('div',{class:'mz-aat'},h('i',{html:IC.clip}),h('span',{},a[0]),h('small',{},a[1])))):h('div',{class:'mz-emp',style:'padding:6px 0'},'첨부파일이 없어요')),
      h('div',{class:'mz-fh'},'결재 이력'),
      h('div',{class:'mz-ad'},hist.length?h('div',{},...hist.map(x=>h('div',{class:'mz-ahi'},h('div',{class:'l1'},h('b',{},x.n+' '+aPer(x.n).rank),h('em',{class:'tg '+(x.t==='반려'?'x':x.t==='보류'?'b':x.t==='의견'?'c':'o')},x.t),h('small',{},x.at)),h('small',{},aPer(x.n).dept),x.c?h('p',{},x.c):null))):h('div',{class:'mz-emp',style:'padding:6px 0'},'결재 이력이 없어요')),
      h('div',{style:'height:96px'}));
    const bar=h('div',{class:'mz-abr'});
    const done=()=>{ show(); };
    const cm=()=>aModal(wrap,{title:'의견 작성',msg:'결재 문서에 의견을 남겨요.',ph:'의견을 입력하세요',req:'의견 내용을 입력해 주세요.',ok:'등록'},v=>{ d.cm=d.cm||[]; d.cm.push({n:ME,at:aStamp(),c:v}); aSave(); aLog('의견 작성',d,v); K.toast('의견을 등록했어요'); done(); });
    if(aMyTurn(d)){ const chk=fn=>{ const cur=AD.docs.find(x=>x.id===d.id); if(!aMyTurn(cur)){ K.toast('이미 처리된 문서예요'); done(); return; } fn(cur); };
      bar.append(h('button',{class:'ap',onclick:()=>aModal(wrap,{title:'결재를 승인할까요?',msg:d.title+(aCur(d)&&d.line.some(s=>s.st==='wait')?'\n승인 후 다음 결재자에게 전달됩니다.':'\n최종 승인으로 결재가 완료됩니다.'),ph:'승인 의견 (선택)',ok:'승인'},v=>chk(c=>{ aApprove(c,v); done(); }))},'승인'),
        h('button',{class:'rj',onclick:()=>aModal(wrap,{title:'결재를 반려할까요?',msg:'반려 사유는 기안자에게 전달됩니다.',ph:'반려 사유를 입력하세요 (필수)',req:'반려 사유를 입력해 주세요.',ok:'반려',dg:1},v=>chk(c=>{ aReject(c,v); done(); }))},'반려'),
        h('button',{onclick:()=>aModal(wrap,{title:'보류 처리',msg:'보류 사유 또는 검토 의견을 남겨요.\n문서는 받은 결재에 그대로 남아요.',ph:'보류 사유 / 검토 의견 (필수)',req:'보류 사유를 입력해 주세요.',ok:'보류'},v=>chk(c=>{ aHold(c,v); done(); }))},'보류'),
        h('button',{onclick:cm},'의견 작성')); }
    else if(d.st==='draft'){ bar.append(h('button',{class:'ap',onclick:()=>{ av={m:'new',draft:d.id}; show(); }},'수정 · 상신'),h('button',{class:'rj',onclick:()=>aModal(wrap,{title:'임시 저장 문서를 삭제할까요?',msg:d.title,ok:'삭제',dg:1},()=>{ AD.docs=AD.docs.filter(x=>x.id!==d.id); aSave(); K.toast('문서를 삭제했어요'); av={m:'home'}; show(); })},'삭제')); }
    else { if(d.st==='rejected'&&d.by===ME) bar.append(h('button',{class:'ap',onclick:()=>{ av={m:'new',draft:null,redo:d.id}; show(); }},'재기안')); bar.append(h('button',{onclick:cm},'의견 작성')); }
    wrap.append(bar); return wrap; }
  function aniNew(){ const old=av.draft?AD.docs.find(x=>x.id===av.draft):null, rd=av.redo?AD.docs.find(x=>x.id===av.redo):null, src=old||rd||null;
    const S={ type:src?src.type:'gen', title:src?(rd?'[재기안] ':'')+src.title.replace(/^\[재기안\] /,'').replace(/ \(작성 중\)$/,''):'', body:src?src.body:'', budget:src?src.budget:'', f:Object.assign({},src?src.f:{}), att:src?src.att.slice():[], ap:src?(src.ap||src.line.slice(1).map(s=>s.n)):['유주희'] };
    if(rd) S.ap=rd.line.slice(1).map(s=>s.n);
    const wrap=h('div',{class:'mz-nw'}), fw=h('div',{class:'mz-afw'}), err=h('div',{class:'mz-aerr'});
    const inp=(lab,el,req)=>h('label',{class:'mz-afg'},h('small',{},lab,req?h('i',{},' *'):null),el);
    const tsel=h('select',{class:'mz-ain',onchange:e=>{ S.type=e.target.value; S.f={}; draw(); }},...AP.types.map(t=>h('option',{value:t.id,selected:t.id===S.type},t.n)));
    const ti=h('input',{class:'mz-ain',value:S.title,placeholder:'문서 제목을 입력하세요',oninput:e=>S.title=e.target.value});
    const bd=h('textarea',{class:'mz-ain',rows:6,placeholder:'문서 본문을 입력하세요',oninput:e=>S.body=e.target.value}); bd.value=S.body;
    const bu=h('input',{class:'mz-ain',inputmode:'numeric',placeholder:'0',value:S.budget?Number(S.budget).toLocaleString('ko-KR'):'',oninput:e=>{ const n=e.target.value.replace(/[^0-9]/g,''); S.budget=n; e.target.value=n?Number(n).toLocaleString('ko-KR'):''; }});
    const fl=h('input',{type:'file',multiple:true,style:'display:none',onchange:e=>{ [...e.target.files].forEach(f=>S.att.push([f.name,f.size>1048576?(f.size/1048576).toFixed(1)+'MB':Math.max(1,Math.round(f.size/1024))+'KB'])); e.target.value=''; drawAtt(); }});
    const attw=h('div',{});
    const drawAtt=()=>{ attw.innerHTML=''; S.att.forEach((a,i)=>attw.append(h('div',{class:'mz-aat'},h('i',{html:IC.clip}),h('span',{},a[0]),h('small',{},a[1]),h('button',{class:'x',onclick:()=>{ S.att.splice(i,1); drawAtt(); }},'×')))); attw.append(h('button',{class:'mz-aadd',onclick:()=>fl.click()},'+ 파일 첨부')); };
    const apw=h('div',{class:'mz-aap'});
    const drawAp=()=>{ apw.innerHTML=''; const opts=[['백지훈','합의','준법감시팀 과장'],['이서연','합의','재무팀 과장'],['유주희','결재','대외협력 커뮤니케이션실 실장'],['정민석','최종','경영지원본부 상무']];
      opts.forEach(o=>{ const on=S.ap.includes(o[0]), lock=o[0]==='유주희'; apw.append(h('div',{class:'mz-aop'+(on?' on':''),onclick:()=>{ if(lock) return; S.ap=on?S.ap.filter(x=>x!==o[0]):S.ap.concat(o[0]); drawAp(); }},h('i',{}),h('div',{},h('b',{},o[0]+' '+aPer(o[0]).rank),h('small',{},o[2]+' · '+o[1]+(lock?' (필수)':''))))); });
      apw.append(h('small',{class:'mz-ahint'},'결재 순서: '+ME+' 과장(기안) → '+ordered().join(' → '))); };
    const ORD=['백지훈','이서연','유주희','정민석']; const ordered=()=>ORD.filter(n=>S.ap.includes(n));
    function draw(){ fw.innerHTML=''; const t=aType(S.type);
      fw.append(inp('문서 종류',tsel,1),inp('문서 제목',ti,1),
        h('div',{class:'mz-a2'},inp('기안 부서',h('input',{class:'mz-ain',value:MY_DEPT,readonly:true})),inp('기안자',h('input',{class:'mz-ain',value:ME+' '+aPer(ME).rank,readonly:true}))),
        inp('작성 날짜',h('input',{class:'mz-ain',value:aStamp().slice(0,10),readonly:true})),
        h('div',{class:'mz-fh',style:'margin:14px 0 6px'},t.n+' 항목'));
      t.f.forEach(f=>{ let el; const key=f[0];
        if(f[2]==='a') el=h('textarea',{class:'mz-ain',rows:3,oninput:e=>S.f[key]=e.target.value}), el.value=S.f[key]||'';
        else if(f[2]==='s') el=h('select',{class:'mz-ain',onchange:e=>S.f[key]=e.target.value},h('option',{value:''},'선택'),...f[4].map(o=>h('option',{value:o,selected:S.f[key]===o},o)));
        else if(f[2]==='d') el=h('input',{class:'mz-ain',type:'date',value:S.f[key]||'',oninput:e=>S.f[key]=e.target.value});
        else if(f[2]==='n') el=h('input',{class:'mz-ain',inputmode:'numeric',value:S.f[key]?Number(S.f[key]).toLocaleString('ko-KR'):'',oninput:e=>{ const n=e.target.value.replace(/[^0-9]/g,''); S.f[key]=n; e.target.value=n?Number(n).toLocaleString('ko-KR'):''; }});
        else el=h('input',{class:'mz-ain',value:S.f[key]||'',oninput:e=>S.f[key]=e.target.value});
        fw.append(inp(f[1],el,f[3])); });
      fw.append(inp('문서 본문',bd,1),inp('관련 예산(원)',bu),h('div',{class:'mz-afg'},h('small',{},'첨부파일'),attw,fl),h('div',{class:'mz-afg'},h('small',{},'결재선'),apw)); drawAtt(); drawAp(); }
    const missing=()=>{ const m=[]; const t=aType(S.type); if(!S.title.trim()) m.push('문서 제목'); t.f.forEach(f=>{ if(f[3]&&!String(S.f[f[0]]||'').trim()) m.push(f[1]); }); if(!S.body.trim()) m.push('문서 본문'); if(!S.ap.includes('유주희')) m.push('결재선'); if(S.type==='trip'||S.type==='leave'){ if(S.f.from&&S.f.to&&S.f.to<S.f.from) m.push('기간(종료일이 시작일보다 빠름)'); } return m; };
    const build=()=>({ type:S.type, title:S.title.trim(), by:ME, at:aStamp(), budget:S.budget||'', f:Object.assign({},S.f), body:S.body.trim(), att:S.att.slice(), ap:ordered() });
    const saveDraft=()=>{ if(!S.title.trim()){ err.textContent='임시 저장하려면 문서 제목을 입력해 주세요.'; K.toast('문서 제목을 입력해 주세요'); return; } const b=build(); b.st='draft'; b.line=[]; b.hist=[]; b.cm=[]; b.hold=false;
      if(old){ Object.assign(old,b); b.id=old.id; } else { const n=AD.docs.filter(x=>x.st==='draft').length+1; b.id='SHC-2026-D'+pad2(n+Math.floor((Date.now()/1000)%97)+1); while(AD.docs.some(x=>x.id===b.id)) b.id+='x'; AD.docs.push(b); }
      aSave(); aLog('임시 저장',b,aType(b.type).n); K.toast('임시 저장되었어요'); aTab='draft'; av={m:'home'}; show(); };
    const submit=()=>{ const m=missing(); if(m.length){ err.textContent='필수 항목을 확인해 주세요: '+m.join(', '); err.scrollIntoView({block:'center'}); K.toast('필수 항목이 누락되었어요'); return; }
      aModal(wrap,{title:'결재를 상신할까요?',msg:'상신 후에는 수정할 수 없어요.\n결재선: '+ordered().join(' → '),ok:'상신'},()=>{ const b=build(); b.id='SHC-2026-'+(AD.seq=(AD.seq||1110)+1); b.st='progress'; const at=b.at;
        b.line=[{n:ME,st:'ok',at,c:'',role:'기안'}].concat(ordered().map((n,i)=>({n,st:i===0?'cur':'wait',at:'',c:'',role:n==='유주희'?'결재':n==='정민석'?'최종':'합의'})));
        b.hist=[{n:ME,t:'기안 상신',at,c:''}]; b.cm=[]; b.hold=false; b.simAt=K.now(); delete b.ap;
        if(old) AD.docs=AD.docs.filter(x=>x.id!==old.id); AD.docs.push(b); aReg(b); aSave(); aLog('결재 상신',b,aType(b.type).n+' · 결재선: '+ordered().join(' → ')+(b.budget?' · 예산 '+aWon(b.budget):'')); K.toast('상신되었어요 · '+b.id); aTab='sent'; av={m:'d',id:b.id}; show(); }); };
    const cancel=()=>{ const dirty=S.title.trim()||S.body.trim()||Object.keys(S.f).length||S.att.length; if(!dirty){ av=old?{m:'d',id:old.id}:{m:'home'}; show(); return; } aModal(wrap,{title:'작성을 취소할까요?',msg:'입력한 내용은 저장되지 않아요.',ok:'작성 취소',dg:1},()=>{ K.toast('작성을 취소했어요'); av=old?{m:'d',id:old.id}:{m:'home'}; show(); }); };
    wrap.append(nBar('새 결재 문서',cancel),fw,err,h('div',{class:'mz-abr'},h('button',{onclick:saveDraft},'임시 저장'),h('button',{class:'ap',onclick:submit},'결재 상신'),h('button',{class:'rj',onclick:cancel},'작성 취소')),h('div',{style:'height:84px'}));
    draw(); return wrap; }
  function aprView(){ return av.m==='d'?aniDetail():av.m==='new'?aniNew():aniHome(); }
  function portalView(){
    const tile=m=>h('div',{class:'mz-tl'+(m.wide?' wide':''),onclick:()=>m.ic==='auth'?openAuth():m.ic==='ntc'?openBoard():m.ic==='fac'?openFac():K.toast('서비스 준비 중이에요')},m.badge?h('em',{},m.badge):null,h('i',{html:PI[m.ic]}),h('b',{},m.t),h('small',{},m.s));
    return h('div',{class:'mz-pv'},
      h('div',{class:'mz-wl'},E.portal.hello,h('br'),E.portal.hello2,h('br'),h('small',{},E.portal.sub)),
      h('div',{class:'mz-gd'},...E.portal.menu.map(m=>tile(m.ic==='ntc'&&nUnread()?Object.assign({},m,{badge:String(nUnread()),s:'읽지 않은 공지 '+nUnread()+'건'}):m))),
      h('div',{class:'mz-nt'},h('div',{class:'mz-nh'},h('b',{},'최근 공지'),h('span',{onclick:()=>openBoard()},'전체보기 ›')),
        ...nSorted().slice(0,3).map(n=>h('div',{class:'mz-ni',onclick:()=>openBoard(n.id)},h('span',{class:'mz-tag'+(n.must?' mu':'')},n.tag),h('p',{},n.title),h('small',{},n.date.replace(/-/g,'.'))))));
  }
  function show(){ stop(); body.innerHTML=''; body.scrollTop=0; body.classList.toggle('plain',tab==='portal'); body.append(tab==='home'?homeView():tab==='card'?cardView():(nv?noticeView():fv?facView():av?aprView():portalView())); drawTabs(); }
  show();
  return ()=>stop();
}};

/* 음악 앱: 플레이리스트 한 줄만 보여요 (눌러도 아무 일도 없음) */
K.apps.music = { mount(root,p,ctl){
  ctl.bar(false);
  const pg=K.page(); pg.classList.add('mus1'); root.append(pg);
  const row=h('div',{class:'mus1row',onclick:()=>window.open('https://youtube.com/playlist?list=PLcMQLdafLLnQ&si=95jBczSUaMjh0HLO','_blank','noopener')},
    h('span',{class:'st'},'★'),
    h('div',{class:'cv'}),
    h('div',{class:'tt'},(D.playlist&&D.playlist.name)||'박성진 꺼'),
    h('span',{class:'ch',html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6b6b70" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>'}));
  const COV=[['#3a3f5c','#8a93c9'],['#5c3a3a','#d99a8a'],['#2f4f4a','#7fc2b4'],['#4f4a2f','#d6c77f'],['#4a2f5c','#b88ad9'],['#2f3f5c','#7fa6d9'],['#5c2f4a','#d97fb0']];
  const trk=(D.playlist&&D.playlist.tracks)||[];
  const list=h('div',{class:'mus1list'},...trk.map((t,i)=>{ const c=COV[(i*3+1)%COV.length]; return h('div',{class:'mus1tr',onclick:()=>openPlayer(i)},h('div',{class:'cv2',style:t.cv?`background:#222 url(${t.cv}) center/cover no-repeat`:`background:linear-gradient(145deg,${c[0]},${c[1]})`,html:t.cv?'':'<svg viewBox="0 0 24 24" width="26" height="26" fill="rgba(255,255,255,.85)"><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.600"/><circle cx="17" cy="16" r="2.600"/></svg>'}),h('div',{class:'ti'},h('b',{},t.t),h('small',{},t.a)),h('span',{class:'mo',html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="#8e8e93"><circle cx="5" cy="12" r="1.800"/><circle cx="12" cy="12" r="1.800"/><circle cx="19" cy="12" r="1.800"/></svg>'})); }),
    h('div',{class:'mus1ft'},trk.length+'곡'),h('div',{style:'height:130px'}));
  pg.append(padTop(),h('div',{class:'scroll'},row,list));
  // 하단 재생 바
  const PL='<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M7 4.500v15l13-7.500z"/></svg>', PA='<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M6.500 4.500h4v15h-4zM13.500 4.500h4v15h-4z"/></svg>';
  const FW='<svg viewBox="0 0 24 24" width="30" height="30" fill="#fff"><path d="M4 5.500v13l8-6.500zM12.500 5.500v13l8-6.500z"/></svg>';
  const NP=K._np||(K._np={ i:Math.max(0,K.allTracks.findIndex(t=>/그날의 우리의 색/.test(t.t))), s:48, playing:true });   // 음악 앱 하단 재생바 전용 상태 (홈 위젯과 별개)
  const pp=h('button',{class:'pp',onclick:()=>{ NP.playing=!NP.playing; upd(); }});
  const cvE=h('div',{class:'cv'}), ttE=h('b',{}), arE=h('small',{}), el=h('span',{}), rm=h('span',{}), fill=h('i',{});
  const bar=h('div',{class:'mus1bar big'},h('div',{class:'r1'},cvE,h('div',{class:'tt'},ttE,arE),pp,h('button',{class:'ff',html:FW,onclick:()=>{ NP.i=(NP.i+1)%K.allTracks.length; NP.s=0; upd(); }})),h('div',{class:'r2'},el,h('div',{class:'pb'},fill),rm));
  function upd(){ const t=K.allTracks[NP.i]||{}, d=K.dur(t), p=Math.min(100,NP.s/d*100); cvE.style.background='#222 url('+(t.cv||'photos/music-cover.jpg')+') center/cover no-repeat'; ttE.textContent=t.t||''; arE.textContent=t.a||''; pp.innerHTML=NP.playing?PA:PL; fill.style.width=p+'%'; el.textContent=K.mmss(d*p/100); rm.textContent='-'+K.mmss(d-d*p/100); }
  upd(); const iv=setInterval(()=>{ if(!bar.isConnected){ clearInterval(iv); return; } if(NP.playing){ NP.s+=1; if(NP.s>=K.dur(K.allTracks[NP.i])) NP.s=0; } upd(); },1000);
  /* 하단 재생바는 표시하지 않아요 (pg.append(bar) 를 다시 넣으면 나타남) */
  /* 곡을 누르면 가사만 보여요 (재생은 안 됨). 가사는 앨범 사진과 같은 이름의 txt 파일(예: photos/music/gidae.txt)에서 읽어와요.
     txt 안에서 줄 앞에 [분:초] 를 붙이면 그 시간에 맞춰 줄이 켜지고, 없으면 가사 전체가 그대로 보여요. */
  function openPlayer(idx){ const t0=K.allTracks[idx]||{};
    const parse=txt=>String(txt||'').split('\n').map(l=>{ const m=l.match(/^\s*\[(\d+):(\d\d)\]\s*(.*)$/); return m?{s:(+m[1])*60+(+m[2]),t:m[3]}:{s:null,t:l.trim()}; });
    const lyr=h('div',{class:'mpl'},h('div',{class:'mpe'},'가사를 불러오는 중…'));
    const cover=t0.cv||'photos/music-cover.jpg';
    const bgE=h('div',{class:'mpbg',style:'background-image:url('+cover+')'});
    const mini=h('div',{class:'mpmini'},h('div',{class:'mpc',style:'background:#222 url('+cover+') center/cover no-repeat'}),h('div',{class:'mpt'},h('b',{},t0.t||''),h('small',{},t0.a||'')));
    const ov=h('div',{class:'mpov'},bgE,
      h('div',{class:'mptop'},h('button',{class:'mpx',onclick:()=>{ ov.classList.remove('on'); setTimeout(()=>ov.remove(),300); },html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'}),h('span',{},'가사')),
      mini,lyr);
    const show=lines=>{ lyr.innerHTML=''; const L=lines.filter((x,i,arr)=>x.t!==''||(i>0&&i<arr.length-1&&arr[i-1].t!=='')); if(!L.some(x=>x.t)){ lyr.append(h('div',{class:'mpe'},'가사가 아직 등록되지 않았어요')); return; } L.forEach(x=>lyr.append(h('p',{class:x.t?'':'gap'},x.t))); };
    const src=t0.lyrics?null:t0.lx||(cover.replace(/\.[^.\/]+$/,'')+'.txt');
    if(t0.lyrics) show(parse(t0.lyrics)); else fetch(src,{cache:'no-cache'}).then(r=>r.ok?r.text():'').then(tx=>{ if(!tx||/^\s*<(!doctype|html)/i.test(tx)) show([]); else show(parse(tx.replace(/^﻿/,''))); }).catch(()=>show([]));
    pg.append(ov); requestAnimationFrame(()=>ov.classList.add('on')); }
}};

/* =================== 메일 (보기 전용, 암호로 잠김) =================== */
K.apps.mail = { mount(root,p,ctl){
  ctl.bar(false);
  const nav=K.makeNav(root); const pg=K.page(); pg.classList.add('mailp'); nav.push(pg);
  const S2=(d,w=1.9)=>`<svg viewBox="0 0 32 32" fill="none" stroke="#3d8bf2" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const INBOX='<path d="M3.500 17l4-9.500A2 2 0 0 1 9.300 6h13.400a2 2 0 0 1 1.800 1.500l4 9.500v6a2.500 2.500 0 0 1-2.500 2.500h-19A2.500 2.500 0 0 1 3.500 23z"/><path d="M3.500 17h7.500a5 5 0 0 0 10 0h7.500"/>';
  const STACK='<path d="M6.500 5.500h19M4.500 10h23"/><path d="M3.500 18l3.500-6.500A2 2 0 0 1 8.800 10.500h14.400a2 2 0 0 1 1.800 1L28.500 18v6.500a2.500 2.500 0 0 1-2.500 2.500H6a2.500 2.500 0 0 1-2.500-2.500z"/><path d="M3.500 18h7.500a5 5 0 0 0 10 0h7.500"/>';
  const TOP=[['모든 받은 편지함',STACK],['Gmail',INBOX],[D.settings.mailAccount||'',INBOX]];
  const ROWS=[
    ['받은 편지함',INBOX],
    ['임시 저장','<path d="M8 3.500h10l7 7V26a2.500 2.500 0 0 1-2.500 2.500h-14.500A2.500 2.500 0 0 1 5.500 26V6A2.500 2.500 0 0 1 8 3.500z"/><path d="M18 3.500v7h7"/>'],
    ['보낸 편지함','<path d="M28 4L14 18M28 4l-9 24-5-10-10-5z"/>'],
    ['정크','<path d="M3.500 6.500h25v5h-25zM5.500 11.500V24a2.500 2.500 0 0 0 2.500 2.500h16a2.500 2.500 0 0 0 2.500-2.500V11.500"/><path d="M12.500 15.500l7 7M19.500 15.500l-7 7"/>'],
    ['휴지통','<path d="M5 8h22M12 8V5h8v3M8 8l1.500 19h13L24 8M13 13v9M19 13v9"/>'],
    ['모든 메일','<path d="M3.500 6.500h25v5h-25zM5.500 11.500V25a2 2 0 0 0 2 2h17a2 2 0 0 0 2-2V11.500"/><path d="M12.500 17h7"/>']
  ];
  const chev='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  const down='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3d8bf2" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l7 7 7-7"/></svg>';
  const right='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3d8bf2" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  const rows=(list,open)=>h('div',{class:'mx-card'},...list.map(([name,icon])=>h('div',{class:'mx-row',onclick:open&&open[name]||null},h('span',{class:'mx-i',html:S2(icon)}),h('div',{class:'mx-b'},h('span',{class:'mx-n'},name),h('span',{class:'mx-c',html:chev})))));
  const bk='<svg viewBox="0 0 12 20" width="12" height="20"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICN=(d)=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const COMPOSE=ICN('<path d="M12 5H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-5"/><path d="M17.500 3.500l3 3L11 16l-4 1 1-4z"/>');
  const sentList=()=>D.sentMails||[];
  const readSet=()=>{ try{ return JSON.parse(localStorage.getItem('kyh_mail_read')||'[]'); }catch(e){ return []; } };
  const markRead=i=>{ try{ const a=readSet(); if(!a.includes(i)){ a.push(i); localStorage.setItem('kyh_mail_read',JSON.stringify(a)); } }catch(e){} };
  const pDetail=(m)=>{
    const pg2=K.page(); pg2.classList.add('mailp');
    const ini=[...m.from].slice(-2).join('');
    const ar=h('i',{html:chev}); const tt=h('em',{class:'mx-nm'},m.to,h('s',{},' ('+m.toAddr+')'));
    pg2.append(padTop(),
      h('div',{class:'mx-top two'},h('button',{class:'mx-pill',onclick:()=>nav.pop(),html:bk}),h('div',{class:'mx-pill ud',html:ICN('<path d="M6 15l6-6 6 6"/>')+ICN('<path d="M6 9l6 6 6-6"/>')})),
      h('div',{class:'scroll mx-sc mx-dt'},
        h('div',{class:'mx-from'},h('div',{class:'mx-av'},ini),h('div',{class:'mx-ft'},h('b',{},m.from),h('span',{class:'mx-to',onclick:()=>{ tt.classList.toggle('open'); ar.classList.toggle('open'); }},'받는 사람: ',tt,ar)),h('small',{},m.full)),
        ...(m.readAt?[h('div',{class:'mx-rd'},h('span',{html:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#3d8bf2" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13l4.500 4.500L14 9M10 15.500l1.500 2L21 7"/></svg>'}),h('b',{},m.to+'님이 읽음'),h('small',{},m.readAt))]:[]),
        h('div',{class:'mx-sub'},m.subject),
        h('div',{class:'mx-body'},m.body),
        h('div',{style:'height:160px'})),
      h('div',{class:'mx-tool'},h('div',{class:'mx-pill3',html:ICN('<rect x="3.500" y="4" width="17" height="5" rx="1.200"/><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4"/>')+ICN('<path d="M3.500 7.500a2 2 0 0 1 2-2h4l2 2.500h7a2 2 0 0 1 2 2v7.500a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>')+ICN('<path d="M9.500 7L4 12.500 9.500 18M4 12.500h9a7 7 0 0 1 7 7"/>')}),h('div',{class:'mx-fab r',html:COMPOSE})),
      h('div',{class:'mx-new'},'새로운 메시지'));
    nav.push(pg2);
  };
  const pSent=(title='보낸 편지함',src=sentList)=>{
    const pg2=K.page(); pg2.classList.add('mailp');
    const BLD='<svg viewBox="0 0 24 24" width="30" height="30" fill="#fff"><path d="M4 21V9l6-3v15zM11 21V3l9 3v15zM6 11h2v2H6zm0 4h2v2H6zm7-6h2v2h-2zm4 0h2v2h-2zm-4 4h2v2h-2zm4 0h2v2h-2z"/></svg>';
    const list=src();
    pg2.append(padTop(),
      h('div',{class:'mx-top two'},h('button',{class:'mx-pill',onclick:()=>nav.pop(),html:bk}),h('button',{class:'mx-edit'},'선택')),
      h('div',{class:'scroll mx-sc'},
        h('div',{class:'mx-h'},h('b',{},title),h('small',{},D.settings.mailAccount||'')),
        h('div',{class:'mx-hair'}),
        ...list.map((m,mi)=>{ const dot=h('i',{class:'mx-dot'}); const isUn=()=>m.unread&&!readSet().includes(mi); if(!isUn()) dot.style.visibility='hidden'; return h('div',{class:'mx-mail',onclick:()=>{ if(isUn()){ markRead(mi); dot.style.visibility='hidden'; } pDetail(m); }},dot,h('div',{class:'mx-ava',html:BLD}),h('div',{class:'mx-mt'},h('div',{class:'l1'},h('b',{},m.to),h('small',{},m.readAt?h('span',{class:'mx-rd1',html:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#3d8bf2" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13l4.500 4.500L14 9M10 15.500l1.500 2L21 7"/></svg>'}):'',m.date)),h('div',{class:'l2'},m.subject),h('div',{class:'l3'},m.body.replace(/\n+/g,' ')))); }),
        h('div',{style:'height:160px'})),
      h('div',{class:'mx-tool'},h('div',{class:'mx-fab l',html:ICN('<path d="M4 7h16M7 12h10M10 17h4"/>')}),h('div',{class:'mx-search'},h('span',{html:ICN('<circle cx="11" cy="11" r="6.500"/><path d="M16 16l4 4"/>')}),h('em',{},'검색'),h('span',{html:ICN('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21"/>')})),h('div',{class:'mx-fab r',html:COMPOSE})),
      h('div',{class:'mx-new'},'새로운 메시지'));
    nav.push(pg2);
  };
  const arw=h('span',{class:'mx-ar',html:down}); const fold=rows(ROWS,{'보낸 편지함':()=>pSent()});
  const sc=h('div',{class:'scroll mx-sc'},
    h('div',{class:'mx-h'},h('b',{},'메일상자'),h('small',{},'지금 업데이트됨')),
    rows(TOP),
    h('div',{class:'mx-acc gm'},h('span',{},'Gmail'),h('span',{html:right})),
    h('div',{class:'mx-acc tgl',onclick:()=>{ fold.classList.toggle('shut'); arw.classList.toggle('shut'); }},h('span',{},D.settings.mailAccount||''),arw),
    fold,
    h('div',{style:'height:150px'}));
  pg.append(padTop(),
    h('div',{class:'mx-top'},h('button',{class:'mx-edit'},'편집')),
    sc,
    h('div',{class:'mx-fab',html:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-5"/><path d="M17.500 3.500l3 3L11 16l-4 1 1-4z"/></svg>'}),
    h('div',{class:'mx-new'},'새로운 메시지'));
}};
})();


/* =================== 마포한강래미안 (아파트 주민 앱 · 세대원 모드) =================== */
K.apps.mapo = { mount(root,p,ctl){
  ctl.bar(true);
  const pg=K.page(); pg.classList.add('mp'); root.append(pg);
  const S=(d,w=22,c='currentColor',sw=1.8,f='none')=>`<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="${f}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const LEAF=(w,c)=>`<svg viewBox="0 0 64 64" width="${w}" height="${w}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M32 56V30"/><path d="M32 34C18 34 10 24 12 10c14-1 22 7 20 24z"/><path d="M32 28c0-12 7-19 20-19 1 13-6 21-20 19z"/></svg>`;
  const LK='<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const SKY=(id)=>`<svg viewBox="0 0 360 160" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs><linearGradient id="sk${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ec3e0"/><stop offset=".62" stop-color="#e7ddd0"/></linearGradient><linearGradient id="rv${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c2d2"/><stop offset="1" stop-color="#7f9db1"/></linearGradient></defs>
    <rect width="360" height="160" fill="url(#sk${id})"/><ellipse cx="70" cy="30" rx="60" ry="9" fill="#fff" opacity=".45"/><ellipse cx="270" cy="22" rx="50" ry="7" fill="#fff" opacity=".4"/>
    <g fill="#d9d6d2"><rect x="30" y="62" width="30" height="62"/><rect x="66" y="40" width="34" height="84"/><rect x="108" y="54" width="30" height="70"/><rect x="146" y="30" width="38" height="94"/><rect x="192" y="56" width="30" height="68"/><rect x="228" y="46" width="34" height="78"/><rect x="270" y="68" width="28" height="56"/></g>
    <g fill="#bdb9b5" opacity=".8"><rect x="66" y="40" width="6" height="84"/><rect x="146" y="30" width="7" height="94"/><rect x="228" y="46" width="6" height="78"/><rect x="30" y="62" width="5" height="62"/><rect x="108" y="54" width="5" height="70"/></g>
    <g fill="#8a98a6" opacity=".55">${[...Array(8)].map((_,r)=>`<rect x="152" y="${38+r*10}" width="26" height="3"/><rect x="72" y="${48+r*9}" width="22" height="3"/><rect x="234" y="${54+r*8}" width="22" height="3"/>`).join('')}</g>
    <path d="M0 124C60 118 120 120 190 123 260 126 320 119 360 122V160H0z" fill="#6f9a6b" opacity=".85"/><rect y="132" width="360" height="28" fill="url(#rv${id})"/>
    <path d="M200 118h160" stroke="#6b7480" stroke-width="3"/><g stroke="#6b7480" stroke-width="2"><path d="M228 118v14M262 118v14M296 118v14M330 118v14"/></g>
    <g fill="#4f7d52"><circle cx="14" cy="124" r="14"/><circle cx="40" cy="128" r="11"/><circle cx="330" cy="126" r="12"/></g></svg>`;
  const nav={home:['마포한강래미안',0],comm:['커뮤니티 예약',1],svc:['생활서비스',0],my:['마이페이지',0],car:['차량 관리',1,'svc'],notice:['공지사항',1,'home'],fee:['관리비 조회/납부',1,'home']};
  const tabOf={home:'home',comm:'comm',svc:'svc',my:'my',car:'svc',notice:'home',fee:'home'};
  const TABS=[['home','홈',S('<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',24)],['comm','커뮤니티',S('<path d="M5 5h14v10H9l-4 4z"/>',24)],['svc','생활서비스',S('<rect x="4" y="4" width="6.500" height="6.500" rx="1.500"/><rect x="13.500" y="4" width="6.500" height="6.500" rx="1.500"/><rect x="4" y="13.500" width="6.500" height="6.500" rx="1.500"/><circle cx="16.700" cy="16.700" r="3.300"/>',24)],['my','마이페이지',S('<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>',24)]];
  const tile=(go,t,body,x='')=>`<button class="mp-tl ${x}" ${go==='dead'?'data-dead':'data-go="'+go+'"'}><b>${t}</b>${body}</button>`;
  const days=[['일',7],['월',8],['화',9],['수',10],['목',11],['금',12],['토',13]];
  const slots=['06:00','07:00','08:00','09:00','10:00','11:00','12:00','14:00','16:00','18:00','19:00','20:00'];
  const full={'09:00':1,'12:00':1};
  const OUT=(K.state&&K.state.mapoOut)||"";
  const HTML=`
  <header class="mp-hd"><div class="pad-top"></div>
    <div class="mp-hr"><button class="mp-l" id="mp-l"></button><b class="mp-tt" id="mp-tt">마포한강래미안</b><button class="mp-bell" data-toast="새 알림이 없어요">${S('<path d="M6 9a6 6 0 1 1 12 0c0 6 2.500 7.500 2.500 7.500h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/>',22,'#2b3a47')}</button></div>
  </header>
  <main class="mp-bd">
   <section class="mp-pg on" id="mp-home">
     <div class="mp-wl"><small>Welcome,</small><b>105동 1704호</b></div>
     <div class="mp-hero"><img src="photos/mapo-hero.jpg" alt=""></div>
     <div class="mp-tg2">
       ${tile('fee','관리비 조회/납부','<span class="am">284,500<small>원</small></span>','wide')}
       ${tile('dead','커뮤니티 예약','<span class="ic">'+S('<rect x="3" y="6" width="18" height="11" rx="3"/><path d="M3 12h18M7 17v2.500M17 17v2.500"/>',46,'#8a9aa8',1.5)+'</span>')}
       ${tile('notice','단지 공지사항','<span class="ls"><i>산책로 정비 안내</i><i>주차장 보수 공사</i><i>105동 소독 안내</i></span>')}
       ${tile('svc','택배 도착','<span class="ls"><i>택배 도착 : 1건</i></span>')}
       ${tile('dead','인근 편의시설','<span class="ic">'+S('<path d="M4 20V10l8-5 8 5v10z"/><path d="M9 20v-6h6v6"/>',46,'#8a9aa8',1.5)+'</span>')}
     </div>
     <div class="mp-card mp-park-c"><div class="mp-h"><span>등록 차량 실시간 주차 현황</span><u>실시간 연동</u></div>
       ${OUT?'<div class="mp-park"><div class="mp-pl">776더</div><div><b>BMW X7 (세대주)</b><small>출차 완료<br>(정문 출구)</small></div><time>오늘 '+OUT+' 출차</time></div></div>':'<div class="mp-park"><div class="mp-pl">776더</div><div><b>BMW X7 (세대주)</b><small>지하 2층 주차중<br>(A구역 14번)</small></div><time>어제 19:20 입차</time></div></div>'}
   </section>

   <section class="mp-pg" id="mp-comm">
     <div class="mp-fgrid" id="mp-fgrid">
       <button class="mp-fb on" data-fac="Gym"><b>Gym</b><small>피트니스 센터</small></button>
       <button class="mp-fb" data-fac="골프 연습장"><b>골프 연습장</b><small>실내 골프연습장</small></button>
       <button class="mp-fb" data-fac="독서실"><b>독서실</b><small>입주민 독서실</small></button>
       <button class="mp-fb" data-fac="게스트하우스"><b>게스트하우스</b><small>이번 주 예약마감</small></button>
     </div>
     <div class="mp-card mp-cal"><div class="mp-cm"><span>‹</span><b>2026년 6월</b><span>›</span></div>
       <div class="mp-wk" id="mp-wk">${days.map((d,i)=>`<button data-day="${d[1]}" class="${d[1]==10?'on':''}"><small>${d[0]}</small><b>${d[1]}</b></button>`).join('')}</div>
       <div class="mp-sl" id="mp-sl">${slots.map(t=>`<button data-slot="${t}" ${full[t]?'disabled':''}>${t}</button>`).join('')}</div>
       <div class="mp-selt" id="mp-selt">시간을 선택해 주세요</div>
       <button class="mp-rsv" id="mp-rsv">예약하기</button></div>
   </section>

   <section class="mp-pg" id="mp-svc">
     <div class="mp-ls2">
       <button data-go="car"><span>${S('<path d="M5 16V12l1.600-4.200A2 2 0 0 1 8.500 6.500h7a2 2 0 0 1 1.900 1.300L19 12v4"/><path d="M3.500 12h17v4.500h-17z"/>',22)}</span>차량 관리 (디지털 정기권)<i>›</i></button>
       <button class="mp-lk2" data-vis><span>${S('<path d="M3 12l2-4h9l2 4"/><circle cx="7" cy="14" r="2"/><circle cx="14" cy="14" r="2"/>',22)}</span>방문 차량 관리<em>${LK}</em></button>
       <button data-go="fee"><span>${S('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',22)}</span>관리비 조회/납부<i>›</i></button>
       <button data-go="notice"><span>${S('<path d="M4 11v3a1 1 0 0 0 1 1h2l5 4V6L7 10H5a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6"/>',22)}</span>공지사항 / 주민 투표·설문<i>›</i></button>
       <button data-dead><span>${S('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',22)}</span>커뮤니티 시설 예약<i>›</i></button>
       <button data-dead><span>${S('<path d="M4 20V10l8-5 8 5v10z"/><path d="M9 20v-6h6v6"/>',22)}</span>인근 편의시설<i>›</i></button>
       <button data-toast="보관 중인 택배가 1건 있어요"><span>${S('<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>',22)}</span>택배 조회<i>›</i></button>
     </div>
   </section>

   <section class="mp-pg" id="mp-my">
     <div class="mp-card"><div class="mp-li"><span>동 · 호수</span><b>마포한강래미안 105동 1704호</b></div><div class="mp-li"><span>이용자 구분</span><b>세대원</b></div><div class="mp-li"><span>등록 차량</span><b>BMW X7 (776더 0116)</b></div></div>
     <div class="mp-lockn"><span style="display:flex;width:15px">${LK}</span>차량 추가·삭제, 정기권 변경은 세대주만 할 수 있어요</div>
   </section>

   <section class="mp-pg" id="mp-car">
     <div class="mp-sub" data-sub="car"><button class="lock" data-vis>방문차량 관리<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></button><button class="on" data-st="pass">디지털 정기권</button><button data-st="log">입출차 내역</button></div>
     <div class="mp-st-pg on" id="mp-st-pass">
       <div class="mp-pass"><div class="h"><b>PARKING PASS</b><span>정기권 사용 중</span></div><div class="mp-plate">776더 0116</div><div class="car"><b>BMW X7</b>세대주 명의</div>
         <div class="rw"><div><span>동 · 호수</span><b>105동 1704호</b></div><div><span>등록 일자</span><b>2022.09.06.</b></div><div><span>주차 구역</span><b>지하 1~3층 입주민</b></div><div><span>등록 구분</span><b>세대주 차량</b></div></div></div>
       <div class="mp-btns"><button class="mp-bt" disabled>차량 추가</button><button class="mp-bt" disabled>차량 삭제</button><button class="mp-bt w" disabled>정기권 변경</button></div>
       <div class="mp-lockn"><span style="display:flex;width:15px">${LK}</span>세대주만 변경 가능한 항목입니다</div>
     </div>
     <div class="mp-st-pg" id="mp-st-log" style="display:none">
       ${OUT?'<div class="mp-vi"><div class="t1"><span class="mp-st n">출차</span><small style="margin:0">오늘 '+OUT+'</small></div><b class="pl">776더 0116</b><p>BMW X7 · 정문 출구</p></div>':''}
       <div class="mp-vi"><div class="t1"><span class="mp-st b">입차</span><small style="margin:0">11.08. 19:20</small></div><b class="pl">776더 0116</b><p>BMW X7 · 지하 2층 A구역 14번</p></div>
       <div class="mp-vi"><div class="t1"><span class="mp-st n">출차</span><small style="margin:0">11.08. 08:12</small></div><b class="pl">776더 0116</b><p>BMW X7 · 정문 출구</p></div>
       <div class="mp-vi"><div class="t1"><span class="mp-st b">입차</span><small style="margin:0">11.06. 18:58</small></div><b class="pl">776더 0116</b><p>BMW X7 · 지하 2층 A구역 14번</p></div>
       <div class="mp-vi"><div class="t1"><span class="mp-st n">출차</span><small style="margin:0">11.06. 17:30</small></div><b class="pl">776더 0116</b><p>BMW X7 · 정문 출구</p></div>
       <div class="mp-vi"><div class="t1"><span class="mp-st b">입차</span><small style="margin:0">11.05. 14:08</small></div><b class="pl">776더 0116</b><p>BMW X7 · 지하 2층 A구역 14번</p></div>
     </div>
   </section>

   <section class="mp-pg" id="mp-notice">
     <div class="mp-sub" data-sub="nt"><button class="on" data-st="all">전체 공지</button><button data-st="vote">주민 투표/설문</button></div>
     <div class="mp-st-pg on" id="mp-st-all">
       <div class="mp-nt"><div class="t1"><span class="mp-tgb">관리사무소</span><time>2026.06.08</time></div><b>2026년 상반기 단지 내 조경 보완 및 산책로 정비 안내</b><p>입주민 여러분 안녕하십니까. 쾌적한 주거환경 조성을 위해 단지 내 산책로 주변 수목 보완 식재 및 조명 시설 개선 공사를 시행합니다.</p></div>
       <div class="mp-nt"><div class="t1"><span class="mp-tgb b">공지사항</span><time>2026.06.03</time></div><b>지하주차장 바닥 에폭시 보수 공사 일정 안내</b><p>지하 2층 구역별 순차적 보수 공사가 진행되오니 해당 구역 주차를 삼가 주시기 바랍니다.</p></div>
       <div class="mp-nt"><div class="t1"><span class="mp-tgb y">소독</span><time>2026.06.02</time></div><b>105동 소독 안내</b><p>105동 공용부 정기 소독이 진행됩니다. 세대 내 소독 신청은 관리사무소로 문의해 주세요.</p></div>
     </div>
     <div class="mp-st-pg" id="mp-st-vote" style="display:none">
       <div class="mp-nt"><div class="t1"><span class="mp-tgb y">진행중</span><time>마감 D-3</time></div><b>2026년 상반기 단지 내 조경 보완 및 산책로 정비 안건 투표</b><p>주민 여러분의 소중한 한 표로 래미안의 가치를 높여주세요.</p>
         <div class="mp-opts done" id="mp-vopts"><button class="sel" data-vote="찬성">찬성</button><button data-vote="반대">반대</button><button data-vote="기권">기권</button></div><div class="mp-vres" id="mp-vres">"찬성"으로 투표했어요. 참여해 주셔서 감사합니다.</div></div>
     </div>
   </section>

   <section class="mp-pg" id="mp-fee">
     <div class="mp-fee"><div class="mp-row"><div><div class="ym">2026년 5월 청구분</div><div class="big">284,500원</div></div><span class="bd">납부 전</span></div><div class="dt"><span>청구일: 2026.06.10</span><span>납기일: 2026.06.25</span></div></div>
     <div class="mp-card"><div class="mp-h" style="font-size:14px">항목별 상세 내역</div>
       <div class="mp-li"><span>공용관리비 (청소, 경비, 소독 등)</span><b>112,000원</b></div><div class="mp-li"><span>개인사용 (전기요금)</span><b>75,400원</b></div><div class="mp-li"><span>개인사용 (수도요금)</span><b>32,100원</b></div><div class="mp-li"><span>난방 및 온수요금</span><b>65,000원</b></div></div>
     <button class="mp-cta" data-toast="관리비 납부는 세대주만 할 수 있어요">신용카드 간편결제 / 가상계좌 납부</button>
   </section>
  </main>
  <nav class="mp-tabs">${TABS.map((t,i)=>`<button class="mp-tab${i?'':' on'}" ${t[0]==='comm'?'data-dead':'data-go="'+t[0]+'"'}>${t[2]}${t[1]}</button>`).join('')}</nav>
  <div class="mp-toast" id="mp-toast"></div>
  <div class="mp-splash" id="mp-splash"><b>마포한강래미안</b></div>`;
  pg.innerHTML=HTML;
  const Q=s=>pg.querySelector(s), QA=s=>[...pg.querySelectorAll(s)];
  let tt; const toast=m=>{ const t=Q('#mp-toast'); t.textContent=m; t.classList.add('on'); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove('on'),1800); };
  let cur='home', backTo='home';
  const go=n=>{ setTimeout(()=>lockLog(),0); if(nav[n][1]&&!nav[cur][1]) backTo=cur; cur=n; QA('.mp-pg').forEach(e=>e.classList.toggle('on',e.id==='mp-'+n)); QA('.mp-tab').forEach(e=>e.classList.toggle('on',e.dataset.go===tabOf[n]));
    const d=nav[n]; Q('#mp-tt').textContent=d[0]; const l=Q('#mp-l'); l.innerHTML=d[1]?S('<path d="M15 5l-7 7 7 7"/>',24,'#2b3a47',2):LEAF(30,'#3a9b84'); l.dataset.back=d[1]?backTo:''; Q('.mp-bd').scrollTop=0; };
  const lockLog=()=>{ const bd=Q('.mp-bd'), lg=Q('#mp-st-log'); const on=cur==='car'&&lg&&lg.style.display!=='none'; bd.style.overflowY=on?'hidden':''; if(on) bd.scrollTop=0; };
  go('home');
  let sel=null;
  const sp=Q('#mp-splash'); setTimeout(()=>sp.classList.add('out'),1500); setTimeout(()=>sp.remove(),2200);
  pg.addEventListener('click',e=>{
    if(e.target.closest('[data-dead]')){ e.preventDefault(); e.stopPropagation(); return; }
    if(e.target.closest('[data-vis]')){ toast('방문차량 관리는 이용할 수 없어요'); return; }
    if(e.target.closest('.mp-bt')){ toast('세대주만 변경 가능한 항목입니다'); return; }
    const lb=e.target.closest('#mp-l'); if(lb){ if(lb.dataset.back) go(lb.dataset.back); return; }
    const fb=e.target.closest('[data-fac]'); if(fb){ QA('.mp-fb').forEach(b=>b.classList.toggle('on',b===fb)); if(fb.dataset.fac==='게스트하우스') toast('게스트하우스는 이번 주 예약이 마감됐어요'); return; }
    const dy=e.target.closest('[data-day]'); if(dy){ QA('#mp-wk button').forEach(b=>b.classList.toggle('on',b===dy)); return; }
    const sl=e.target.closest('[data-slot]'); if(sl&&!sl.disabled){ sel=sl.dataset.slot; QA('#mp-sl button').forEach(b=>b.classList.toggle('on',b===sl)); Q('#mp-selt').textContent='선택한 시간: '+sel; return; }
    if(e.target.closest('#mp-rsv')){ if(!sel){ toast('시간을 먼저 선택해 주세요'); return; } toast('예약이 완료되었어요 ('+sel+')'); return; }
    const st=e.target.closest('[data-st]'); if(st){ const bar=st.parentNode; bar.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===st)); const sec=bar.closest('.mp-pg'); sec.querySelectorAll('.mp-st-pg').forEach(x=>{ x.style.display=x.id==='mp-st-'+st.dataset.st?'':'none'; }); lockLog(); return; }
    const vt=e.target.closest('[data-vote]'); if(vt){ if(Q('#mp-vopts').classList.contains('done')) return; Q('#mp-vopts').classList.add('done'); vt.classList.add('sel'); Q('#mp-vres').textContent='"'+vt.dataset.vote+'"으로 투표했어요. 참여해 주셔서 감사합니다.'; return; }
    const g=e.target.closest('[data-go]'); if(g){ go(g.dataset.go); return; }
    const t=e.target.closest('[data-toast]'); if(t) toast(t.dataset.toast);
  },true);
}};

/* =================== 인스타그램 (풀 버전: 스토리 · 피드 · 댓글 · 릴스 · 검색 · 프로필) =================== */
K.apps.instagram = { mount(root,p,ctl){
  ctl.bar(true);
  const h=K.h, S=()=>K.state;
  const st=()=>{ const s=S(); s.ig2=s.ig2||{likes:{},saved:{},cm:{},bio:'기록하는 중',follow:{},seen:{}}; return s.ig2; };
  const ME=(K.D.instagram&&K.D.instagram.handle)||'brian.kang';
  const G=[['#ff9a8b','#ff6a88'],['#a18cd1','#fbc2eb'],['#84fab0','#8fd3f4'],['#fccb90','#d57eeb'],['#f6d365','#fda085'],['#89f7fe','#66a6ff'],['#fbc2eb','#a6c1ee'],['#cfd9df','#7f8fa6']];
  const ACC={'han.river.daily':['🌇',0],'mapo.cafe.log':['☕',4],'book.nook':['📚',1],'run.with.sun':['🏃',2],'jeongyu_books':['📖',6],'seoul.night.walk':['🌃',5],'geumho_atelier':['💍',3]};
  const POSTS=[
    {id:'p1',u:'han.river.daily',e:'🌇',g:G[0],t:'퇴근길 한강. 오늘 하늘 색이 정말 예뻤다',l:1284,ago:'2시간 전',c:[['mapo.cafe.log','색감 진짜 좋다'],['run.with.sun','여기 어디예요?']]},
    {id:'p2',u:'mapo.cafe.log',e:'☕',g:G[4],t:'신메뉴 크림 라떼. 망원동 골목 안쪽에 있어요',l:642,ago:'5시간 전',c:[['book.nook','주말에 가봐야지']]},
    {id:'p3',u:'jeongyu_books',e:'📖',g:G[6],t:'이번 주 신간 소개. 책장 한 칸이 더 필요해지는 계절입니다',l:2310,ago:'어제',c:[['book.nook','표지가 너무 예뻐요'],['han.river.daily','읽고 싶어요']]},
    {id:'p4',u:'run.with.sun',e:'🏃',g:G[2],t:'새벽 러닝 10km 완료. 강바람이 시원했어요',l:389,ago:'어제',c:[]},
    {id:'p5',u:'seoul.night.walk',e:'🌃',g:G[5],t:'야경 산책 코스 추천. 다리 위 조명이 켜지는 시간이 제일 좋아요',l:907,ago:'2일 전',c:[['han.river.daily','여기 가봐야겠다']]},
    {id:'p6',u:'book.nook',e:'📚',g:G[1],t:'올해 읽은 책 정리하다가 발견한 인생 문장',l:455,ago:'3일 전',c:[]}
  ];
  const MINE=[{id:'m1',u:ME,img:'photos/ig-p3.jpg',e:'',g:G[7],t:'#Iwillbeback👍',l:48,ago:'2011년 9월 28일',c:[]},{id:'m2',u:ME,img:'photos/ig-p2.jpg',e:'',g:G[7],t:'#morning..',l:36,ago:'2010년 10월 16일',c:[]},{id:'m3',u:ME,img:'photos/ig-profile.jpg',e:'',g:G[7],t:'#myselfie😛 #mybirthday🎂',l:46,ago:'2009년 12월 19일',c:[]}];
  const REELS=[{id:'r1',u:'han.river.daily',e:'🌉',g:G[5],t:'한강 다리 위 노을 타임랩스',l:5821},{id:'r2',u:'mapo.cafe.log',e:'🧋',g:G[4],t:'라떼아트 만드는 과정',l:3310},{id:'r3',u:'run.with.sun',e:'👟',g:G[2],t:'러닝 초보 첫 달 기록',l:1204},{id:'r4',u:'jeongyu_books',e:'📘',g:G[6],t:'북 트레일러 공개',l:9042}];
  const STORY=['han.river.daily','mapo.cafe.log','book.nook','run.with.sun','jeongyu_books','seoul.night.walk'];
  const mineList=()=>[...S().igPosts.map((x,i)=>({id:'u'+i,u:ME,img:x.img,e:'',g:G[7],t:x.text||'',l:x.likes||0,ago:'방금',c:[]})),...MINE];
  const DMS=[['geumho_atelier','뭐야????','15:18',[['me','반지 하나 맞추고 싶습니다. 예쁘고 섬세하고 미감이 좋은 사람한테 선물할 건데요. 아주 아주 비싸도 좋으니까 그 사람 마음에 들었으면 좋겠습니다.','2025년 11월 20일','14:32'],['them','뭐야????','2025년 11월 20일','15:18']]]];
  const feedList=()=>[...mineList().filter(x=>x.id[0]==='u'),...POSTS];
  const pg=K.page(); pg.classList.add('ig2'); root.append(pg);
  let tab='me', q='';
  const ic={
    home:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#111" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7.500L21 11v9.500h-6.500v-6h-5v6H3z"/></svg>',
    reel:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#111" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.500" y="3.500" width="17" height="17" rx="4.500"/><path d="M3.500 9h17M9 3.500l3 5.500M15 3.500l3 5.500"/><path d="M10.500 12.500v4.500l4-2.250z" fill="#111"/></svg>',
    search:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#111" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M16.500 16.500 21 21"/></svg>',
    me:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#111" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.500 4-6.500 8-6.500s7 2 8 6.500"/></svg>',
    heart:(on)=>`<svg viewBox="0 0 24 24" width="26" height="26" fill="${on?'#ff3040':'none'}" stroke="${on?'#ff3040':'currentColor'}" stroke-width="1.9" stroke-linejoin="round"><path d="M12 20.500S3.500 15 3.500 9A4.500 4.500 0 0 1 12 7a4.500 4.500 0 0 1 8.500 2c0 6-8.500 11.500-8.500 11.500z"/></svg>`,
    cm:'<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M20.500 11.500a8.500 8.500 0 0 1-12.600 7.400L3.500 20.500l1.500-4.300A8.500 8.500 0 1 1 20.500 11.500z"/></svg>',
    send:'<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M21 3 10 14M21 3l-6.500 18-4.500-7-7-4.500z"/></svg>',
    mark:(on)=>`<svg viewBox="0 0 24 24" width="25" height="25" fill="${on?'currentColor':'none'}" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M6 3.500h12v17l-6-4.500-6 4.500z"/></svg>`,
    plus:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#111" stroke-width="1.9" stroke-linecap="round"><rect x="3.500" y="3.500" width="17" height="17" rx="5"/><path d="M12 8v8M8 12h8"/></svg>'
  };
  const av=(u,sz=32)=>{ if(u===ME) return h('i',{class:'ig2-av',style:`width:${sz}px;height:${sz}px;background:#e9ebee;overflow:hidden`,html:'<svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="9.300" r="4.200" fill="#c3c8cf"/><path d="M3 26c0-6 4-9.500 9-9.500s9 3.500 9 9.500z" fill="#c3c8cf"/></svg>'}); if(u==='geumho_atelier') return h('i',{class:'ig2-av',style:`width:${sz}px;height:${sz}px;background:#f6f1e6 url(photos/ig-geumho.jpg) center/cover no-repeat`}); const a=ACC[u]; const g=a?G[a[1]]:G[7]; return h('i',{class:'ig2-av',style:`width:${sz}px;height:${sz}px;background:linear-gradient(145deg,${g[0]},${g[1]});font-size:${Math.round(sz*.5)}px`},a?a[0]:(u===ME?'🙂':'👤')); };
  const art=(po,cls='ig2-art')=>{ const d=h('div',{class:cls}); if(po.img) d.style.backgroundImage=`url(${po.img})`; else { d.style.background=`linear-gradient(145deg,${po.g[0]},${po.g[1]})`; d.append(h('span',{},po.e)); } return d; };
  const lk=po=>!!st().likes[po.id], lc=po=>po.l+(lk(po)?1:0);
  const cmts=po=>[...(po.c||[]),...(st().cm[po.id]||[])];
  const num=n=>n>=10000?(n/10000).toFixed(1)+'만':n.toLocaleString('ko-KR');

  /* ----- 오버레이 (스토리 / 댓글 / 게시물 보기) ----- */
  const ov=h('div',{class:'ig2-ov'}); pg.append(ov);
  const closeOv=()=>{ clearTimeout(ov._t); ov.className='ig2-ov'; ov.innerHTML=''; };
  const openStory=i0=>{
    let i=i0; const next=()=>{ if(i>=STORY.length-1){ closeOv(); return; } i++; show(); }, prev=()=>{ if(i>0) i--; show(); };
    const show=()=>{ clearTimeout(ov._t); const u=STORY[i], a=ACC[u]; st().seen[u]=1; ov.className='ig2-ov on dark'; ov.innerHTML='';
      const bg=h('div',{class:'ig2-sv',style:`background:linear-gradient(160deg,${G[a[1]][0]},${G[a[1]][1]})`},h('span',{},a[0]));
      const bars=h('div',{class:'ig2-bars'},STORY.map((_,k)=>h('i',{class:k<i?'full':k===i?'run':''},h('b'))));
      bg.append(bars,h('div',{class:'ig2-sh'},av(u,30),h('b',{},u),h('em',{},'방금'),h('button',{onclick:e=>{e.stopPropagation();closeOv();render();}},'✕')),
        h('div',{class:'ig2-tap l',onclick:prev}),h('div',{class:'ig2-tap r',onclick:next}));
      ov.append(bg); ov._t=setTimeout(next,4000); };
    show();
  };
  const openComments=po=>{ return; /* 댓글 창은 열리지 않아요 */
    const draw=()=>{ ov.className='ig2-ov on sheet'; ov.innerHTML='';
      const list=h('div',{class:'ig2-cl'}, cmts(po).length?cmts(po).map(c=>h('div',{class:'ig2-c'},av(c[0],30),h('div',{},h('b',{},c[0]+' '),c[1]))):h('div',{class:'ig2-emp'},'아직 댓글이 없어요. 첫 댓글을 남겨보세요.'));
      const inp=h('input',{placeholder:ME+'(으)로 댓글 달기...'});
      const post=()=>{ const v=inp.value.trim(); if(!v) return; (st().cm[po.id]=st().cm[po.id]||[]).push([ME,v]); K.save(); draw(); render(true); };
      inp.onkeydown=e=>{ if(e.key==='Enter') post(); };
      ov.append(h('div',{class:'ig2-bk',onclick:()=>{closeOv();}}),h('div',{class:'ig2-sp'},h('div',{class:'ig2-gr'}),h('div',{class:'ig2-sth'},'댓글'),list,h('div',{class:'ig2-ci'},av(ME,30),inp,h('button',{onclick:post},'게시'))));
      list.scrollTop=list.scrollHeight; };
    draw();
  };
  const openPost=po=>{ ov.className='ig2-ov on full'; ov.innerHTML=''; const sc=h('div',{class:'ig2-fs'}); ov.append(h('div',{class:'ig2-fh'},h('button',{onclick:closeOv},'‹'),h('b',{},'게시물')),sc); sc.append(card(po,true),h('div',{class:'homebar-pad'})); };

  const DDATE={'mapo.cafe.log':'2026년 6월 8일','book.nook':'2026년 6월 7일','han.river.daily':'2026년 6월 6일','jeongyu_books':'2026년 6월 1일'};
  const todayK=()=>{ const t=new Date(); return t.getFullYear()+'년 '+(t.getMonth()+1)+'월 '+t.getDate()+'일'; };
  const openChat=d=>{ ov.className='ig2-ov on full'; ov.innerHTML=''; const msgs=(st().dm=st().dm||{}); const L=msgs[d[0]]=msgs[d[0]]||d[3].map(x=>[x[0],x[1],x[2]||DDATE[d[0]],x[3]]);
    const IC=(p,w=26)=>`<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="#111" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
    const list=h('div',{class:'ig2-ml'});
    const draw=()=>{ list.innerHTML=''; let ld=''; L.forEach((m,k)=>{ const dt=m[2]||DDATE[d[0]]; if(dt!==ld){ list.append(h('div',{class:'ig2-dt'},dt+(m[3]?' '+m[3]:''))); ld=dt; } else if(m[3]) list.append(h('div',{class:'ig2-dt sm'},m[3]));
        if(m[0]==='me') list.append(h('div',{class:'ig2-mb me'},m[1]));
        else { const nx=L[k+1]; const last=!nx||nx[0]==='me'||(nx[2]||DDATE[d[0]])!==dt; list.append(h('div',{class:'ig2-mr'},last?av(d[0],34):h('i',{class:'sp'}),h('div',{class:'ig2-mb th'},m[1]))); } });
      list.scrollTop=list.scrollHeight; };
    const inp=h('input',{placeholder:'메시지 보내기...',readonly:'readonly',onfocus:e=>e.target.blur()}); const ic1=h('div',{class:'ic',html:IC('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>')+IC('<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="M4 17l5-5 4 4 3-3 4 4"/>')+IC('<path d="M20 12a8 8 0 1 1-8-8h5a3 3 0 0 1 3 3z"/><path d="M20 12c-4 0-8 0-8 8"/>')+IC('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>')});
    const sb=h('button',{class:'sd',style:'display:none',onclick:()=>send()},'전송');
    const send=()=>{ return; const v=inp.value.trim(); if(!v) return; L.push(['me',v,todayK()]); inp.value=''; ic1.style.display=''; sb.style.display='none'; K.save(); draw(); };
    inp.onkeydown=e=>{ if(e.key==='Enter') send(); };
    inp.oninput=()=>{ const on=!!inp.value.trim(); ic1.style.display=on?'none':''; sb.style.display=on?'':'none'; };
    ov.append(h('div',{class:'ig2-fh dm2'},h('button',{class:'cb',onclick:()=>{closeOv();},html:IC('<path d="M15 5l-7 7 7 7"/>',24)}),av(d[0],44),h('div',{class:'nm'},h('b',{},d[0]),h('span',{html:IC('<path d="M9 6l6 6-6 6"/>',15)})),h('span',{class:'sp'}),h('button',{class:'cb',html:IC('<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>',24)}),h('button',{class:'cb',html:IC('<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10l5-3v10l-5-3z"/>',24)})),list,
      h('div',{class:'ig2-mi2'},h('button',{class:'cam',html:'<svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M8 5l1.200-2h5.600L16 5h2a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z"/><circle cx="12" cy="12.500" r="3.800" fill="#4c5ef7"/><circle cx="12" cy="12.500" r="2.200" fill="#fff"/></svg>'}),inp,ic1,sb));
    draw(); };
  /* ----- 피드 카드 ----- */
  const card=(po,inPopup)=>{
    const wrap=h('div',{class:'ig2-post'});
    const draw=()=>{ wrap.innerHTML='';
      const img=art(po); let last=0;
      img.onclick=()=>{ const n=Date.now(); if(n-last<350){ st().likes[po.id]=1; K.save(); const hh=h('div',{class:'ig2-big'},'♥'); img.append(hh); setTimeout(()=>hh.remove(),700); draw(); } last=n; };
      const likeB=h('button',{class:lk(po)?'on':'',onclick:()=>{ if(lk(po)) delete st().likes[po.id]; else st().likes[po.id]=1; K.save(); draw(); }},h('i',{html:ic.heart(lk(po))}));
      const mk=h('button',{onclick:()=>{ if(st().saved[po.id]) delete st().saved[po.id]; else st().saved[po.id]=1; K.save(); draw(); }},h('i',{html:ic.mark(!!st().saved[po.id])}));
      const cp=h('div',{class:'ig2-cp'},h('b',{},po.u+' '),po.t); const cs=cmts(po);
      wrap.append(h('div',{class:'ig2-ph'},av(po.u),h('b',{},po.u),h('span',{class:'dots'},'···')),img,
        h('div',{class:'ig2-ac'},likeB,h('button',{onclick:()=>openComments(po)},h('i',{html:ic.cm})),h('button',{onclick:()=>(()=>{})('공유는 준비 중이에요')},h('i',{html:ic.send})),h('span',{class:'sp'}),mk),
        h('div',{class:'ig2-lk'},'좋아요 '+lc(po).toLocaleString('ko-KR')+'개'),cp,
        cs.length?h('button',{class:'ig2-vc',onclick:()=>openComments(po)},'댓글 '+cs.length+'개 모두 보기'):h('button',{class:'ig2-vc',onclick:()=>openComments(po)},'댓글 달기...'),
        h('div',{class:'ig2-ago'},po.ago)); };
    draw(); return wrap;
  };

  /* ----- 탭 화면 ----- */
  const upload=()=>{ if(K.RO) return; K.pickFiles(async fs=>{ const u=await K.resizeToDataURL(fs[0],900); if(!u) return; K.prompt('문구 입력','',v=>{ S().igPosts.unshift({user:ME,text:v,img:u,likes:0}); K.save(); (()=>{})('게시물을 공유했어요'); render(); },{ok:'공유'}); },false); };
  const views={
    home(){ const bd=h('div',{class:'ig2-sc'});
      bd.append(h('div',{class:'ig2-stories'},h('div',{class:'ig2-st',onclick:upload},h('i',{class:'me'},av(ME,60),h('u',{},'+')),h('span',{},'내 스토리')),STORY.map((u,i)=>h('div',{class:'ig2-st',onclick:()=>openStory(i)},h('i',{class:st().seen[u]?'seen':'ring'},av(u,60)),h('span',{},u.split(/[._]/)[0])))));
      feedList().forEach(po=>bd.append(card(po))); bd.append(h('div',{class:'homebar-pad'}),h('div',{style:'height:100px'})); return [h('div',{class:'ig2-hd'},h('b',{class:'logo'},'Instagram'),h('span',{class:'r'},h('button',{onclick:upload},h('i',{html:ic.plus})),h('button',{onclick:()=>(()=>{})('알림이 없어요')},h('i',{html:ic.heart(false).replace(/#111/g,'#111')})),h('button',{onclick:()=>(()=>{})('DM은 준비 중이에요')},h('i',{html:ic.send.replace('currentColor','#111')})))),bd]; },
    reel(){ const bd=h('div',{class:'ig2-reels'});
      REELS.forEach(r=>{ const d=h('div',{class:'ig2-reel',style:`background:linear-gradient(160deg,${r.g[0]},${r.g[1]})`},h('span',{class:'ge'},r.e));
        const draw=()=>{ [...d.querySelectorAll('.rs,.rc')].forEach(x=>x.remove());
          d.append(h('div',{class:'rs'},h('button',{class:lk(r)?'on':'',onclick:()=>{ if(lk(r)) delete st().likes[r.id]; else st().likes[r.id]=1; K.save(); draw(); }},h('i',{html:ic.heart(lk(r)).replace('currentColor','#fff')}),h('em',{},num(lc(r)))),h('button',{onclick:()=>openComments(r)},h('i',{html:ic.cm.replace('currentColor','#fff')}),h('em',{},String(cmts(r).length))),h('button',{onclick:()=>(()=>{})('공유는 준비 중이에요')},h('i',{html:ic.send.replace('currentColor','#fff')}))),
            h('div',{class:'rc'},h('div',{class:'ru'},av(r.u,30),h('b',{},r.u),h('button',{onclick:e=>{ const f=st().follow; f[r.u]=!f[r.u]; K.save(); e.target.textContent=f[r.u]?'팔로잉':'팔로우'; }},st().follow[r.u]?'팔로잉':'팔로우')),h('div',{class:'rt'},r.t))); };
        draw(); bd.append(d); });
      return [h('div',{class:'ig2-hd over'},h('b',{},'릴스')),bd]; },
    search(){ const bd=h('div',{class:'ig2-sc'}); const inp=h('input',{placeholder:'검색',value:q});
      const grid=h('div',{class:'ig2-grid'}); const all=[...POSTS,...REELS.map(r=>({...r,ago:'',c:[]})),...mineList()];
      const fill=()=>{ grid.innerHTML=''; const k=q.trim().toLowerCase(); all.filter(x=>!k||x.u.toLowerCase().includes(k)||(x.t||'').toLowerCase().includes(k)).forEach(po=>{ const c=art(po,'ig2-cell'); c.onclick=()=>openPost(po.id[0]==='r'?{...po,ago:'',c:[]}:po); grid.append(c); }); if(!grid.children.length) grid.append(h('div',{class:'ig2-emp'},'검색 결과가 없어요')); };
      inp.oninput=()=>{ q=inp.value; fill(); }; fill();
      bd.append(h('div',{class:'ig2-sb'},h('div',{},h('i',{html:ic.search.replace('26','16').replace('26','16').replace('#111','#8e8e93')}),inp)),grid,h('div',{class:'homebar-pad'}),h('div',{style:'height:100px'})); return [h('div',{class:'ig2-hd'},h('b',{},'검색')),bd]; },
    dm(){ const bd=h('div',{class:'ig2-sc'});
      bd.append(h('div',{class:'ig2-sb'},h('div',{},h('i',{html:ic.search.replace('26','16').replace('26','16').replace('#111','#8e8e93')}),h('input',{placeholder:'검색'}))),h('div',{class:'ig2-dh'},'메시지'));
      DMS.forEach(d=>{ const L=(st().dm&&st().dm[d[0]])||d[3]; const last=L[L.length-1]; bd.append(h('div',{class:'ig2-dr',onclick:()=>openChat(d)},av(d[0],54),h('div',{class:'t'},h('b',{},d[0]),h('span',{},(last[0]==='me'?'나: ':'')+last[1]+' · '+d[2])))); });
      bd.append(h('div',{class:'homebar-pad'}),h('div',{style:'height:100px'}));
      return [h('div',{class:'ig2-hd pf'},h('button',{html:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#111" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',onclick:()=>{ tab='me'; closeOv(); render(); }}),h('div',{class:'hn'},h('b',{},ME),h('span',{html:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>'})),h('button',{html:'<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h8M16 4l4 4-11 11H5v-4z"/></svg>'})),bd]; },
    me(){ const bd=h('div',{class:'ig2-sc'}); const mine=mineList(), n=mine.length;
      const A=h('div',{class:'ig2-pa'},h('div',{class:'bub'},'친구에게 질문을 던져보세...'),av(ME,88));
      bd.append(h('div',{class:'ig2-pf'},h('div',{class:'row'},A,h('div',{class:'rt'},h('div',{class:'nm'},'Brian Kang'),h('div',{class:'stat'},h('div',{},h('b',{},String(n)),'게시물'),h('div',{},h('b',{},'312'),'팔로워'),h('div',{},h('b',{},'287'),'팔로잉')))),
        
        h('div',{class:'btns'},h('button',{onclick:()=>{ if(K.RO) return; K.prompt('이름 편집','Brian Kang',()=>{},{}); }},'프로필 편집'),h('button',{onclick:()=>(()=>{})('프로필 링크를 복사했어요')},'프로필 공유'),h('button',{onclick:()=>(()=>{})('친구 추가는 준비 중이에요'),html:'<svg viewBox="0 0 24 24" width="20" height="20" fill="#111"><circle cx="10" cy="8" r="3.800"/><path d="M3 20c.6-4 3.300-6 7-6s6.400 2 7 6z"/><path d="M19 6v6M16 9h6" stroke="#111" stroke-width="2" stroke-linecap="round"/></svg>'})),
        ),
        h('div',{class:'ig2-ptab'},h('i',{class:'on',html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="#111"><rect x="3" y="3" width="4.500" height="4.500" rx=".8"/><rect x="9.800" y="3" width="4.500" height="4.500" rx=".8"/><rect x="16.500" y="3" width="4.500" height="4.500" rx=".8"/><rect x="3" y="9.800" width="4.500" height="4.500" rx=".8"/><rect x="9.800" y="9.800" width="4.500" height="4.500" rx=".8"/><rect x="16.500" y="9.800" width="4.500" height="4.500" rx=".8"/><rect x="3" y="16.500" width="4.500" height="4.500" rx=".8"/><rect x="9.800" y="16.500" width="4.500" height="4.500" rx=".8"/><rect x="16.500" y="16.500" width="4.500" height="4.500" rx=".8"/></svg>'}),h('i',{html:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#555" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="10" r="3"/><path d="M6.500 18c.8-2.600 2.800-4 5.500-4s4.700 1.400 5.500 4"/></svg>'})),
        (()=>{ const g=h('div',{class:'ig2-grid'}); mine.forEach(po=>{ const c=art(po,'ig2-cell'); c.onclick=()=>openPost(po); g.append(c); }); return g; })(),h('div',{class:'homebar-pad'}),h('div',{style:'height:100px'}));
      return [h('div',{class:'ig2-hd pf'},h('button',{onclick:upload,html:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>'}),h('div',{class:'hn'},h('b',{},ME),h('span',{html:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>'}),h('i',{class:'rd'})),h('button',{onclick:()=>(()=>{})('메뉴는 준비 중이에요'),html:'<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#111" stroke-width="2.200" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'})),bd]; }
  };
  const bar=()=>h('div',{class:'ig2-tb'},[['home',ic.home],['reel',ic.reel],['dm',ic.send.replace('currentColor','#111').replace('25','26').replace('25','26')],['search',ic.search],['me',null]].map(([k,i])=>h('button',{class:tab===k?'on':'',onclick:()=>{ if(k!=='me'&&k!=='dm') return; if(tab!==k){ tab=k; closeOv(); render(); } }},k==='me'?h('i',{class:'mea'},av(ME,28)):h('i',{html:i}))));
  function render(keepScroll){
    const sc0=pg.querySelector('.ig2-sc')?pg.querySelector('.ig2-sc').scrollTop:0;
    [...pg.children].forEach(c=>{ if(c!==ov) c.remove(); });
    pg.insertBefore(h('div',{class:'pad-top'}),ov);
    views[tab]().forEach(x=>pg.insertBefore(x,ov)); pg.insertBefore(bar(),ov);
    if(keepScroll){ const s=pg.querySelector('.ig2-sc'); if(s) s.scrollTop=sc0; }
    pg.classList.toggle('reeltab',tab==='reel');
  }
  render();
}};
