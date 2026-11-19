'use strict';
/* Salesbyte - visit plan, order booking (cartons + boxes), DSR Excel/PDF */
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const GROUPS={M:'MATCH DIVISION',O:'OLL CLEAN',X:'OTHER PRODUCTS'};
const GORDER=['M','O','X'];
const DEF_PRODUCTS=[
  {id:'sh',name:'Super Hockey',g:'M'},{id:'ch',name:'Classic Hockey',g:'M'},{id:'fl',name:'Flame',g:'M'},
  {id:'g60',name:'60gm',g:'O'},{id:'g90',name:'90gm',g:'O'},{id:'g155',name:'155gm',g:'O'},{id:'g255',name:'255gm',g:'O'},
  {id:'g290',name:'290gm',g:'O'},{id:'ml20',name:'20ml',g:'O'},{id:'ml275',name:'275ml',g:'O'},{id:'ml475',name:'475ml',g:'O'}
].map(p=>Object.assign({bpc:20,rate:0,on:true},p));
const DEF_SET={name:'',station:'',zone:'',area:'',dsrNo:'',discPct:1.5,targets:{op:60,cp:70,cc:5,sk:3,dc:25}};
const LK='salesbyte.v1',OLDK='orderbooking.v1';
const CFG=window.SALESBYTE||{};
const SAMPLE=[{"n":"Zain Nafees K S","rw":"W.S","a":"Daal Bazaar","q":{"g155":8,"g290":2},"d":true,"v":""},{"n":"Mohsin Hassan K S","rw":"W.S","a":"Daal Bazaar","q":{"g155":10,"g255":10,"g290":10,"ml275":1,"ml475":1},"d":true,"v":""},{"n":"Gulzar Sheikh K S","rw":"R","a":"Daal Bazaar","q":{"sh":1,"g155":1},"d":false,"v":""},{"n":"Abdul Waheed K S","rw":"W.S","a":"Daal Bazaar","q":{"sh":5,"g155":10},"d":true,"v":""},{"n":"Gulshan K S","rw":"R","a":"Daal Bazaar","q":{"g155":2},"d":false,"v":""},{"n":"Haji Yousaf K S","rw":"W.S","a":"Daal Bazaar","q":{"g155":18,"g255":1,"g290":1},"d":true,"v":"2026-10-25"},{"n":"Ahmad K S","rw":"R","a":"Daal Bazaar","q":{"sh":1},"d":false,"v":""},{"n":"Irfan K S","rw":"R","a":"Daal Bazaar","q":{"sh":1},"d":false,"v":""},{"n":"Khurram Shehzad K S","rw":"R","a":"Daal Bazaar","q":{"g155":2},"d":false,"v":""},{"n":"Arif K S (Faizan)","rw":"W.S","a":"Daal Bazaar","q":{"g155":10},"d":true,"v":"2026-11-01"},{"n":"Sheih Arshad K S","rw":"W.S","a":"Daal Bazaar","q":{"sh":5},"d":false,"v":""},{"n":"Abdul Rasheed K S","rw":"R","a":"Daal Bazaar","q":{"g155":2},"d":false,"v":""},{"n":"Sohail K S","rw":"W.S","a":"Daal Bazaar","q":{"g155":10},"d":true,"v":""},{"n":"A D K S","rw":"R","a":"Faisal Bazaar","q":{"g155":1},"d":false,"v":""},{"n":"Maqsood K S","rw":"W.S","a":"Faisal Bazaar","q":{"g155":8,"g255":1,"g290":1},"d":true,"v":""},{"n":"Saif Ullah K S","rw":"R","a":"Faisal Bazaar","q":{"g155":1},"d":false,"v":""},{"n":"Haji Sohail K S","rw":"R","a":"Faisal Bazaar","q":{"g155":2},"d":false,"v":""},{"n":"Sheikh Imran K S","rw":"R","a":"Faisal Bazaar","q":{"g155":1},"d":false,"v":""},{"n":"M Shareef K S","rw":"R","a":"Faisal Bazaar","q":{"g155":1},"d":false,"v":""},{"n":"Khalid K S","rw":"W.S","a":"Vanike Chowk","q":{"g290":10},"d":true,"v":""},{"n":"Shangrilla K S","rw":"R","a":"Vanike Chowk","q":{"g155":1,"g290":1},"d":false,"v":""},{"n":"Nanha K S","rw":"R","a":"Ali Pur Road","q":{"g155":1},"d":false,"v":""}];

const IC={
 home:'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
 ops:'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z',
 plan:'M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 0a1 1 0 110 2 1 1 0 010-2zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
 gps:'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
 more:'M6 10a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4zm-6 0a2 2 0 100 4 2 2 0 000-4z',
 back:'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
 phone:'M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z',
 pin:'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z',
 plus:'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
 chart:'M3.5 18.5l6-6 4 4L22 6.92 20.59 5.5l-7.09 8-4-4L2 17z',
 trophy:'M19 5h-2V3H7v2H5a2 2 0 00-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5 5 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5 5 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7a2 2 0 00-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
 list:'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z',
 store:'M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z',
 box:'M20 2H4a1 1 0 00-1 1v4h18V3a1 1 0 00-1-1zM4 9v12a1 1 0 001 1h14a1 1 0 001-1V9H4zm11 5H9v-2h6v2z',
 edit:'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
 down:'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
 cog:'M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7 7 0 00-1.62-.94l-.36-2.54a.5.5 0 00-.5-.42h-3.84a.5.5 0 00-.5.42l-.36 2.54a7 7 0 00-1.62.94l-2.39-.96a.5.5 0 00-.6.22L2.71 8.84a.5.5 0 00.12.64l2.03 1.58a7.07 7.07 0 000 1.88l-2.03 1.58a.5.5 0 00-.12.64l1.92 3.32a.5.5 0 00.6.22l2.39-.96c.5.38 1.04.7 1.62.94l.36 2.54a.5.5 0 00.5.42h3.84a.5.5 0 00.5-.42l.36-2.54c.58-.24 1.12-.56 1.62-.94l2.39.96a.5.5 0 00.6-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z',
 info:'M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
 save:'M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zm-5 16a3 3 0 110-6 3 3 0 010 6zm3-10H5V5h10v4z',
 cloud:'M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z',
 users:'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
 logout:'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4a2 2 0 00-2 2v14a2 2 0 002 2h8v-2H4V5z',
 refresh:'M17.65 6.35A7.958 7.958 0 0012 4a8 8 0 108 8h-2a6 6 0 11-1.76-4.24L13 11h7V4l-2.35 2.35z',
 copy:'M16 1H4a2 2 0 00-2 2v14h2V3h12V1zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z',
 key:'M12.65 10A5.99 5.99 0 007 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 005.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
 share:'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z'
};
const ic=(n,s)=>'<svg class="ic" width="'+(s||22)+'" height="'+(s||22)+'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="'+IC[n]+'"/></svg>';

const $=(s,r)=>(r||document).querySelector(s);
const p2=n=>String(n).padStart(2,'0');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const clone=x=>JSON.parse(JSON.stringify(x));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function todayStr(){const d=new Date();return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());}
function pd(s){const a=String(s).split('-').map(Number);return {y:a[0],m:a[1],d:a[2]};}
function fmtLong(s){const p=pd(s);return p.d+' '+MONTHS[p.m-1]+' '+p.y;}
function fmtShort(s){const p=pd(s);return p.d+' '+MONTHS[p.m-1].slice(0,3)+' '+p.y;}
function addDays(s,n){const p=pd(s);const d=new Date(p.y,p.m-1,p.d+n);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());}
function daysBetween(a,b){const x=pd(a),y=pd(b);return Math.round((new Date(y.y,y.m-1,y.d)-new Date(x.y,x.m-1,x.d))/864e5);}
function dow(s){const p=pd(s);return DOW[new Date(p.y,p.m-1,p.d).getDay()];}
function fmtC(n){n=Math.round((Number(n)||0)*100)/100;return n%1?n.toFixed(2):String(n);}
function fmt1(n){return (Math.round((Number(n)||0)*10)/10).toFixed(1);}
function fmtMoney(n){return Math.round(n).toLocaleString('en-US');}

/* ---------- data ---------- */
function norm(j){
  j.settings=Object.assign(clone(DEF_SET),j.settings||{});
  j.settings.targets=Object.assign(clone(DEF_SET.targets),j.settings.targets||{});
  if(!Array.isArray(j.products)||!j.products.length)j.products=clone(DEF_PRODUCTS);
  j.products=j.products.map(p=>Object.assign({bpc:20,rate:0,on:true,g:'X'},p));
  j.sync=Object.assign({token:'',user:null,lastPull:0,lastPush:0,at:0,uid:''},j.sync||{});
  j.tomb=Object.assign({v:[],s:[]},j.tomb||{});
  j.pref=Object.assign({station:''},j.pref||{});
  j.prodU=j.prodU||0;j.prodSu=j.prodSu||0;j.extraSt=j.extraSt||[];j.srv=j.srv||'';
  j.orders=(j.orders||[]).map(o=>{
    const q={};
    for(const k in (o.qty||{})){const v=o.qty[k];
      if(v&&typeof v==='object'){const c=+v.c||0,b=+v.b||0;if(c||b)q[k]={c,b};}
      else if(+v>0)q[k]={c:+v,b:0};}
    return Object.assign({station:'',uid:'',uname:''},o,{qty:q,st:o.st||'P',u:o.u||o.ts||1});
  });
  j.shops=(j.shops||[]).map(s=>Object.assign({owner:'',phone:'',landmark:'',locality:'',lat:null,lng:null,station:''},s,{u:s.u||1}));
  return j;
}
function load(){
  let j=null;
  try{j=JSON.parse(localStorage.getItem(LK)||'null');}catch(e){}
  if(!j){try{j=JSON.parse(localStorage.getItem(OLDK)||'null');}catch(e){}}
  if(!j||!Array.isArray(j.shops))j={shops:[],orders:[],settings:{},products:null};
  return norm(j);
}
let DB=load();
function save(){try{localStorage.setItem(LK,JSON.stringify(DB));}catch(e){toast('Storage full or blocked');}}
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{t.hidden=true;},2800);}
function ask(msg,fn,label){
  ST.modalFn=fn;const m=$('#modal');
  m.innerHTML='<div class="mbox" role="dialog" aria-modal="true"><div class="ttl">'+esc(msg)+'</div><div class="two"><button class="btn" data-act="mNo">Cancel</button><button class="btn p" data-act="mYes">'+esc(label||'Yes')+'</button></div></div>';
  m.hidden=false;
}

const ST={screen:'home',root:'home',stack:[],date:todayStr(),planDate:todayStr(),dday:todayStr(),q:'',tab:'a',htab:'today',shop:null,draft:null,prod:null,modalFn:null,
  login:{id:'',pass:'',url:''},err:'',busy:false,users:null,ufrm:null,cred:null,dsrStation:'',dsrUser:''};
function go(screen){ST.stack.push(ST.screen);ST.screen=screen;render();window.scrollTo(0,0);}
function back(){ST.screen=ST.stack.pop()||ST.root;render();window.scrollTo(0,0);}
function tab(screen){ST.stack=[];ST.screen=screen;ST.root=screen;ST.q='';ST.tab='a';render();window.scrollTo(0,0);}

const shopById=id=>DB.shops.find(s=>s.id===id);
const prodById=id=>DB.products.find(p=>p.id===id);
const visitsOn=d=>DB.orders.filter(o=>o.date===d).sort((a,b)=>(a.ts||0)-(b.ts||0));
const visitOf=(shopId,d)=>DB.orders.find(o=>o.shopId===shopId&&o.date===d);
const isProd=o=>o.st==='P';
function ctn(o,p){const v=o.qty[p.id];if(!v)return 0;return (v.c||0)+(v.b||0)/(p.bpc||20);}
function orderCtn(o){return DB.products.reduce((s,p)=>s+ctn(o,p),0);}
function orderValue(o){return DB.products.reduce((s,p)=>s+ctn(o,p)*(Number(p.rate)||0),0);}
function stats(list){
  const prod=list.filter(isProd);
  const sku=prod.reduce((s,o)=>s+Object.keys(o.qty).length,0);
  return {total:list.length,prod:prod.length,np:list.length-prod.length,
    ctns:prod.reduce((s,o)=>s+orderCtn(o),0),sku,skuPerCall:prod.length?sku/prod.length:0,
    value:prod.reduce((s,o)=>s+orderValue(o),0),pct:list.length?prod.length/list.length*100:0};
}
function cellText(v){
  if(!v)return '';
  if(v.c&&v.b)return v.c+' + '+v.b+' Box';
  if(v.b)return v.b+' Box';
  return v.c?String(v.c):'';
}
function remarksOf(o){
  const a=[];
  if(o.st==='N')a.push('Non Productive');
  if(o.delivery)a.push('Delivery: '+fmtShort(o.delivery));
  if(o.disc)a.push('Discount '+(DB.settings.discPct||1.5)+'%');
  if(o.remarks)a.push(o.remarks);
  return a.join(', ');
}
function lastVisit(shopId,before){
  let d='';for(const o of DB.orders)if(o.shopId===shopId&&o.date<before&&o.date>d)d=o.date;
  if(!d)return 'No previous visit';
  const n=daysBetween(d,before);return 'Last visit: '+(n===1?'yesterday':n+' days ago');
}
const hasRates=()=>DB.products.some(p=>Number(p.rate)>0);

function scoring(){
  const mo=todayStr().slice(0,7);const vs=DB.orders.filter(o=>o.date.slice(0,7)===mo);
  const st=stats(vs);const prodShops=new Set(vs.filter(isProd).map(o=>o.shopId)).size;
  const days=new Set(vs.map(o=>o.date)).size;const T=DB.settings.targets;
  const items=[
    {name:'Outlet Productivity',icon:'store',c:'var(--blue)',unit:'%',t:+T.op,a:DB.shops.length?prodShops/DB.shops.length*100:0},
    {name:'Call Productivity',icon:'phone',c:'var(--red)',unit:'%',t:+T.cp,a:st.pct},
    {name:'Cartons Per Call',icon:'box',c:'var(--green)',unit:'',t:+T.cc,a:st.prod?st.ctns/st.prod:0},
    {name:'SKU Per Call',icon:'list',c:'var(--orange)',unit:'',t:+T.sk,a:st.skuPerCall},
    {name:'Daily Calls',icon:'pin',c:'var(--purple)',unit:'',t:+T.dc,a:days?st.total/days:0}];
  let pts=0;items.forEach(i=>{i.w=20;i.pts=i.t>0?Math.min(i.w,i.a/i.t*i.w):0;pts+=i.pts;});
  return {items,pts,pct:Math.round(pts)};
}

/* ---------- small graphics ---------- */
function donut(p,t){
  const r=40,c=2*Math.PI*r,f=t?p/t:0;
  return '<svg class="donut" viewBox="0 0 100 100" role="img" aria-label="Productive '+p+' of '+t+'"><circle class="dtrack" cx="50" cy="50" r="'+r+'"/><circle class="dfill" cx="50" cy="50" r="'+r+'" stroke-dasharray="'+(c*f)+' '+c+'" transform="rotate(-90 50 50)"/><text class="dtext" x="50" y="55">'+p+' / '+t+'</text></svg>';
}
function chartSvg(vals,labels){
  const W=320,H=160,pl=14,pr=14,pt=24,pb=26,n=vals.length,max=Math.max(1,...vals);
  const x=i=>pl+(W-pl-pr)*(n===1?.5:i/(n-1)),y=v=>pt+(H-pt-pb)*(1-v/max);
  let s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Cartons per day"><line class="cg" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+(H-pb)+'" y2="'+(H-pb)+'"/>';
  s+='<polyline class="cl" points="'+vals.map((v,i)=>x(i).toFixed(1)+','+y(v).toFixed(1)).join(' ')+'"/>';
  vals.forEach((v,i)=>{s+='<circle class="cd" cx="'+x(i).toFixed(1)+'" cy="'+y(v).toFixed(1)+'" r="4"/><text class="cv" x="'+x(i).toFixed(1)+'" y="'+(y(v)-9).toFixed(1)+'">'+fmtC(v)+'</text><text class="ct" x="'+x(i).toFixed(1)+'" y="'+(H-8)+'">'+esc(labels[i])+'</text>';});
  return s+'</svg>';
}

/* ===== Salesbyte server core: same code runs in Google Apps Script and in the in-app demo ===== */
function sbN(x){x=Number(x);return isFinite(x)?x:0;}
function sbSt(r){return String(r.stations||'').split(',').map(function(s){return s.trim();}).filter(Boolean);}
function sbCan(au,st){return au.role==='admin'||au.stations.indexOf('*')>=0||(!!st&&au.stations.indexOf(st)>=0);}
function sbIndex(rows){var m={};rows.forEach(function(r){m[r.id]=r;});return m;}
function sbMakePass(pw,env){var salt=String(env.uuid()).replace(/-/g,'').slice(0,8);return salt+'$'+env.hash(salt+':'+pw);}

function sbHandle(req,env){
  try{
    var a=req&&req.action;
    if(a==='ping')return {ok:true,v:2};
    if(a==='login')return sbLogin(req,env);
    var au=sbAuth(req.token,env);
    if(!au)return {ok:false,code:'auth',msg:'Session expired. Please sign in again.'};
    if(a==='pull')return sbPull(req,env,au);
    if(a==='push')return sbPush(req,env,au);
    if(au.role!=='admin')return {ok:false,msg:'Admin only'};
    if(a==='users')return sbUsers(env);
    if(a==='saveUser')return sbSaveUser(req,env);
    return {ok:false,msg:'Unknown action'};
  }catch(e){return {ok:false,msg:String(e&&e.message||e)};}
}

function sbLogin(req,env){
  var id=String(req.id||'').trim().toLowerCase(),pass=String(req.pass||''),user=null,i,r;
  if(id===String(env.adminId).toLowerCase()){
    if(env.adminPass==='CHANGE_ME')return {ok:false,msg:'Set ADMIN_PASSWORD in the server script first.'};
    if(pass===env.adminPass)user={id:id,name:'Admin',role:'admin',stations:['*']};
  }else{
    var rows=env.store.all('users');
    for(i=0;i<rows.length;i++){
      r=rows[i];
      if(String(r.id).toLowerCase()===id&&r.active!=='0'){
        var p=String(r.pass).split('$');
        if(p.length===2&&env.hash(p[0]+':'+pass)===p[1])user={id:r.id,name:r.name,role:'user',stations:sbSt(r)};
      }
    }
  }
  if(!user){env.sleep(700);return {ok:false,msg:'Wrong ID or password'};}
  var body=user.id+':'+user.role+':'+(env.now()+30*86400000);
  return {ok:true,token:body+'~'+env.sign(body),user:user};
}

function sbAuth(token,env){
  if(!token)return null;
  token=String(token);
  var i=token.lastIndexOf('~');if(i<0)return null;
  var body=token.slice(0,i),sig=token.slice(i+1);
  if(env.sign(body)!==sig)return null;
  var p=body.split(':');
  if(p.length!==3||Number(p[2])<env.now())return null;
  if(p[1]==='admin'){
    if(p[0]!==String(env.adminId).toLowerCase())return null;
    return {id:p[0],role:'admin',name:'Admin',stations:['*']};
  }
  var rows=env.store.all('users');
  for(var k=0;k<rows.length;k++){
    var r=rows[k];
    if(String(r.id).toLowerCase()===p[0]&&r.active!=='0')return {id:r.id,role:'user',name:r.name,stations:sbSt(r)};
  }
  return null;
}

function sbOutShop(r){
  return {id:r.id,name:r.name,owner:r.owner,phone:r.phone,rw:r.rw||'R',address:r.address,landmark:r.landmark,locality:r.locality,
    lat:r.lat===''?null:Number(r.lat),lng:r.lng===''?null:Number(r.lng),station:r.station,del:r.del==='1',u:sbN(r.u),su:sbN(r.su)};
}
function sbOutVisit(r){
  var q={};try{q=JSON.parse(r.qty||'{}');}catch(e){}
  return {id:r.id,date:r.date,shopId:r.shopId,station:r.station,uid:r.uid,uname:r.uname,st:r.st==='N'?'N':'P',qty:q,disc:r.disc==='1',
    delivery:r.delivery,remarks:r.remarks,ts:sbN(r.ts),del:r.del==='1',u:sbN(r.u),su:sbN(r.su)};
}
function sbRowShop(s,t){
  return {id:String(s.id),name:String(s.name||''),owner:String(s.owner||''),phone:String(s.phone||''),rw:s.rw==='W.S'?'W.S':'R',
    address:String(s.address||''),landmark:String(s.landmark||''),locality:String(s.locality||''),
    lat:s.lat==null||s.lat===''?'':String(s.lat),lng:s.lng==null||s.lng===''?'':String(s.lng),station:String(s.station||''),
    del:'0',u:String(sbN(s.u)),su:String(t)};
}
function sbRowVisit(v,t,uid,uname){
  return {id:String(v.id),date:String(v.date||''),shopId:String(v.shopId||''),station:String(v.station||''),uid:String(uid),uname:String(uname),
    st:v.st==='N'?'N':'P',qty:JSON.stringify(v.qty||{}),disc:v.disc?'1':'0',delivery:String(v.delivery||''),remarks:String(v.remarks||''),
    ts:String(sbN(v.ts)),del:'0',u:String(sbN(v.u)),su:String(t)};
}

function sbPull(req,env,au){
  var since=sbN(req.since),t0=env.now();
  var shops=env.store.all('shops').filter(function(r){return sbN(r.su)>=since&&(au.role==='admin'||sbCan(au,r.station));});
  var visits=env.store.all('visits').filter(function(r){return sbN(r.su)>=since&&(au.role==='admin'||r.uid===au.id);});
  var pr=null,cfg=env.store.all('cfg');
  for(var i=0;i<cfg.length;i++)if(cfg[i].id==='products')pr=cfg[i];
  var prods=null;
  if(pr&&sbN(pr.su)>sbN(req.prodSu)){try{prods=JSON.parse(pr.value);}catch(e){}}
  return {ok:true,t:t0,shops:shops.map(sbOutShop),visits:visits.map(sbOutVisit),products:prods,prodSu:pr?sbN(pr.su):0,stations:au.stations};
}

function sbPush(req,env,au){
  var t=env.now(),rejected=0;
  var curShops=sbIndex(env.store.all('shops')),curVisits=sbIndex(env.store.all('visits'));
  var wShops=[],wVisits=[],i,s,v,ex,d;
  var inShops=req.shops||[],inVisits=req.visits||[],dS=req.delShops||[],dV=req.delVisits||[];
  for(i=0;i<inShops.length;i++){
    s=inShops[i];if(!s||!s.id)continue;
    ex=curShops[s.id];
    if(!sbCan(au,s.station)||(ex&&au.role!=='admin'&&!sbCan(au,ex.station))){rejected++;continue;}
    if(ex&&sbN(ex.u)>sbN(s.u))continue;
    wShops.push(sbRowShop(s,t));
  }
  for(i=0;i<inVisits.length;i++){
    v=inVisits[i];if(!v||!v.id)continue;
    ex=curVisits[v.id];
    if(!sbCan(au,v.station)||(ex&&au.role!=='admin'&&ex.uid!==au.id)){rejected++;continue;}
    if(ex&&sbN(ex.u)>sbN(v.u))continue;
    var uid=au.role==='admin'?(v.uid||au.id):au.id;
    var uname=au.role==='admin'?(v.uname||au.name):au.name;
    wVisits.push(sbRowVisit(v,t,uid,uname));
  }
  for(i=0;i<dV.length;i++){
    d=dV[i];ex=d&&curVisits[d.id];
    if(!ex||(au.role!=='admin'&&ex.uid!==au.id)||sbN(ex.u)>sbN(d.u))continue;
    ex=Object.assign({},ex,{del:'1',u:String(sbN(d.u)),su:String(t)});
    wVisits=wVisits.filter(function(r){return r.id!==ex.id;});wVisits.push(ex);
  }
  if(au.role==='admin'){
    for(i=0;i<dS.length;i++){
      d=dS[i];ex=d&&curShops[d.id];
      if(!ex||sbN(ex.u)>sbN(d.u))continue;
      ex=Object.assign({},ex,{del:'1',u:String(sbN(d.u)),su:String(t)});
      wShops=wShops.filter(function(r){return r.id!==ex.id;});wShops.push(ex);
    }
    if(req.products)env.store.put('cfg',[{id:'products',value:JSON.stringify(req.products),su:String(t)}]);
  }
  env.store.put('shops',wShops);
  env.store.put('visits',wVisits);
  return {ok:true,t:t,saved:{shops:wShops.length,visits:wVisits.length},rejected:rejected};
}

function sbOutUser(r){return {id:r.id,name:r.name,stations:sbSt(r),active:r.active!=='0',created:sbN(r.created)};}
function sbUsers(env){
  return {ok:true,users:env.store.all('users').map(sbOutUser)};
}
function sbSaveUser(req,env){
  var id=String(req.id||'').trim().toLowerCase();
  if(!/^[a-z0-9._-]{3,20}$/.test(id))return {ok:false,msg:'ID must be 3 to 20 characters: a-z, 0-9, dot, dash or underscore'};
  if(id===String(env.adminId).toLowerCase())return {ok:false,msg:'This ID is reserved'};
  var name=String(req.name||'').trim();
  if(!name)return {ok:false,msg:'Enter the name'};
  var rows=env.store.all('users'),ex=null;
  rows.forEach(function(r){if(String(r.id).toLowerCase()===id)ex=r;});
  var pw=String(req.password||'');
  if(req.isNew){
    if(ex)return {ok:false,msg:'This ID already exists'};
    if(pw.length<4)return {ok:false,msg:'Password must be at least 4 characters'};
  }else if(!ex)return {ok:false,msg:'User not found'};
  var st=(req.stations||[]).map(function(s){return String(s).replace(/,/g,' ').trim();}).filter(Boolean);
  if(!st.length)return {ok:false,msg:'Select at least one station'};
  var t=env.now();
  var row={id:id,pass:pw?sbMakePass(pw,env):ex.pass,name:name,role:'user',stations:st.join(','),active:req.active===false?'0':'1',created:ex?ex.created:String(t),su:String(t)};
  env.store.put('users',[row]);
  return {ok:true,user:sbOutUser(row)};
}

/* ---------- team: login, sync, users, dashboard ---------- */
const SYNC={busy:false,err:'',soon:null};
function srvUrl(){return CFG.server||DB.srv||'';}
const serverOn=()=>!!srvUrl();
const me=()=>DB.sync.user;
const isAdmin=()=>!serverOn()||!!(me()&&me().role==='admin');
const teamAdmin=()=>serverOn()&&isAdmin();
const loggedIn=()=>!serverOn()||!!(DB.sync.token&&DB.sync.user);
const myId=()=>serverOn()?((me()&&me().id)||'local'):'local';
const myName=()=>(isAdmin()&&DB.settings.name)||(me()&&me().name)||DB.settings.name||'';
function allStations(){
  const s=new Set();DB.shops.forEach(x=>{if(x.station)s.add(x.station);});
  (DB.extraSt||[]).forEach(x=>s.add(x));
  if(me()&&me().stations)me().stations.forEach(x=>{if(x!=='*')s.add(x);});
  return Array.from(s).sort((a,b)=>a.localeCompare(b));
}
function myStations(){
  if(isAdmin())return allStations();
  const st=(me()&&me().stations)||[];
  return st.indexOf('*')>=0?allStations():st.slice().sort((a,b)=>a.localeCompare(b));
}
function curStation(){
  const ms=myStations();let c=DB.pref.station||'';
  if(c&&ms.indexOf(c)<0)c='';
  if(!c&&!isAdmin()&&ms.length)c=ms[0];
  return c;
}
const shopsFor=stn=>stn?DB.shops.filter(s=>s.station===stn):DB.shops;
function agoText(ms){const m=Math.floor(ms/60000);if(m<1)return 'just now';if(m<60)return m+' min ago';const h=Math.floor(m/60);return h<24?h+' h ago':Math.floor(h/24)+' d ago';}
function tombV(id){DB.tomb.v.push({id,u:Date.now()});}
function tombS(id){DB.tomb.s.push({id,u:Date.now()});}
const dirty=x=>(x.u||0)>(x._s||0);
function pendingCount(){
  return DB.shops.filter(dirty).length+DB.orders.filter(dirty).length+DB.tomb.v.length+DB.tomb.s.length+((teamAdmin()&&(DB.prodU||0)>(DB.prodPushed||0))?1:0);
}
const pubShop=s=>({id:s.id,name:s.name,owner:s.owner,phone:s.phone,rw:s.rw,address:s.address,landmark:s.landmark,locality:s.locality,lat:s.lat,lng:s.lng,station:s.station,u:s.u});
const pubVisit=o=>({id:o.id,date:o.date,shopId:o.shopId,station:o.station,uid:o.uid,uname:o.uname,st:o.st,qty:o.qty,disc:o.disc,delivery:o.delivery,remarks:o.remarks,ts:o.ts,u:o.u});
const inShop=r=>({id:r.id,name:r.name||'',owner:r.owner||'',phone:r.phone||'',rw:r.rw||'R',address:r.address||'',landmark:r.landmark||'',locality:r.locality||'',lat:r.lat==null?null:r.lat,lng:r.lng==null?null:r.lng,station:r.station||'',u:r.u||1,_s:r.u||1});
const inVisit=r=>({id:r.id,date:r.date,shopId:r.shopId,station:r.station||'',uid:r.uid||'',uname:r.uname||'',st:r.st==='N'?'N':'P',qty:r.qty||{},disc:!!r.disc,delivery:r.delivery||'',remarks:r.remarks||'',ts:r.ts||0,u:r.u||1,_s:r.u||1});

/* demo cloud: runs the same server code inside this browser, for testing without Google */
const DEMO_K='salesbyte.demo.v1';
function demoHash(s){let a=0x811c9dc5,b=0x01000193;for(let i=0;i<s.length;i++){a^=s.charCodeAt(i);a=Math.imul(a,16777619)>>>0;b=(Math.imul(b^a,2246822519)+i)>>>0;}return a.toString(16)+b.toString(16);}
function demoCall(body){
  let D=null;try{D=JSON.parse(localStorage.getItem(DEMO_K)||'null');}catch(e){}
  if(!D)D={users:[],shops:[],visits:[],cfg:[]};
  const store={
    all:n=>D[n].map(r=>Object.assign({},r)),
    put:(n,objs)=>{objs.forEach(o=>{const row={};Object.keys(o).forEach(k=>{row[k]=o[k]==null?'':String(o[k]);});const i=D[n].findIndex(r=>r.id===row.id);if(i>=0)D[n][i]=row;else D[n].push(row);});}
  };
  const env={store,now:()=>Date.now(),adminId:'admin',adminPass:'admin123',hash:demoHash,sign:s=>demoHash('k:'+s),uuid:()=>uid()+uid(),sleep:()=>{}};
  const res=sbHandle(body,env);
  try{localStorage.setItem(DEMO_K,JSON.stringify(D));}catch(e){return {ok:false,msg:'Demo storage is blocked in this browser'};}
  return res;
}
async function api(action,payload){
  const body=Object.assign({action,token:DB.sync.token||''},payload||{});
  let j;
  if(srvUrl()==='demo')j=demoCall(JSON.parse(JSON.stringify(body)));
  else{
    const r=await fetch(srvUrl(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
    if(!r.ok)throw new Error('Server error '+r.status);
    j=await r.json();
  }
  if(j&&j.ok===false&&j.code==='auth'&&action!=='login'){DB.sync.token='';save();render();}
  return j;
}

/* login / logout */
function adoptLocal(){
  /* first admin login on a phone that already has local data: give it a station and owner so it can upload */
  const stn=DB.settings.station||'Main',now=Date.now();
  DB.shops.forEach(s=>{if(!s.station){s.station=stn;s.u=now;}});
  DB.orders.forEach(o=>{
    if(!o.station){const sh=shopById(o.shopId);o.station=(sh&&sh.station)||stn;o.u=now;}
    if(!o.uid){o.uid=myId();o.uname=myName()||'Admin';o.u=now;}
  });
}
async function doLogin(){
  const L=ST.login,id=(L.id||'').trim().toLowerCase(),pass=L.pass||'';
  if(!CFG.server){const u=(L.url||DB.srv||'').trim();if(!u){ST.err='Enter the server link';render();return;}DB.srv=u;}
  if(!id||!pass){ST.err='Enter your ID and password';render();return;}
  ST.busy=true;ST.err='';render();
  try{
    const j=await api('login',{id,pass});
    if(!j.ok)throw new Error(j.msg||'Could not sign in');
    const prev=DB.sync.uid;
    if((prev&&prev!==j.user.id)||(!prev&&j.user.role!=='admin')){
      DB.shops=[];DB.orders=[];DB.tomb={v:[],s:[]};DB.sync.lastPull=0;DB.prodPushed=0;DB.prodSu=0;DB.pref.station='';DB.extraSt=[];
    }
    DB.sync.token=j.token;DB.sync.user=j.user;DB.sync.uid=j.user.id;
    if(j.user.role==='admin'&&!prev)adoptLocal();
    ST.login.pass='';ST.busy=false;save();
    ST.stack=[];ST.screen='home';ST.root='home';render();
    syncNow(true);
  }catch(e){ST.busy=false;ST.err=String(e.message||e);render();}
}
function doLogout(){DB.sync.token='';DB.sync.user=null;save();ST.stack=[];ST.screen='home';ST.root='home';ST.err='';render();}

/* sync: upload my changes, then download everyone else's */
function mergePull(p){
  const sm=new Map(DB.shops.map(s=>[s.id,s]));
  for(const r of (p.shops||[])){
    const ex=sm.get(r.id);
    if(r.del){if(ex&&(ex.u||0)<=r.u)DB.shops=DB.shops.filter(x=>x.id!==r.id);continue;}
    if(ex&&(ex.u||0)>r.u)continue;
    if(ex)Object.assign(ex,inShop(r));else DB.shops.push(inShop(r));
  }
  const vm=new Map(DB.orders.map(o=>[o.id,o]));
  for(const r of (p.visits||[])){
    const ex=vm.get(r.id);
    if(r.del){if(ex&&(ex.u||0)<=r.u)DB.orders=DB.orders.filter(x=>x.id!==r.id);continue;}
    if(ex&&(ex.u||0)>r.u)continue;
    if(ex)Object.assign(ex,inVisit(r));else DB.orders.push(inVisit(r));
  }
  if(p.products&&p.products.length&&(!isAdmin()||(DB.prodU||0)===0)){
    DB.products=p.products.map(x=>Object.assign({bpc:20,rate:0,on:true,g:'X'},x));DB.prodSu=p.prodSu||0;
  }
}
async function syncNow(manual){
  if(!serverOn()||!loggedIn()||SYNC.busy)return;
  SYNC.busy=true;SYNC.err='';
  try{
    const sentS=DB.shops.filter(dirty),sentV=DB.orders.filter(dirty),sentU=new Map();
    sentS.concat(sentV).forEach(x=>sentU.set(x.id,x.u));
    const pay={shops:sentS.map(pubShop),visits:sentV.map(pubVisit),delShops:DB.tomb.s.slice(),delVisits:DB.tomb.v.slice()};
    const prodU=DB.prodU||0;
    if(teamAdmin()&&prodU>(DB.prodPushed||0))pay.products=DB.products;
    if(pay.shops.length||pay.visits.length||pay.delShops.length||pay.delVisits.length||pay.products){
      const r=await api('push',pay);
      if(!r.ok)throw new Error(r.msg||'Upload failed');
      sentS.concat(sentV).forEach(x=>{if(x.u===sentU.get(x.id))x._s=x.u;});
      if(pay.products)DB.prodPushed=prodU;
      DB.tomb.v=DB.tomb.v.filter(x=>!pay.delVisits.some(y=>y.id===x.id&&y.u===x.u));
      DB.tomb.s=DB.tomb.s.filter(x=>!pay.delShops.some(y=>y.id===x.id&&y.u===x.u));
      if(r.rejected)SYNC.err=r.rejected+' change(s) were not accepted for your stations';
    }
    const p=await api('pull',{since:DB.sync.lastPull||0,prodSu:DB.prodSu||0});
    if(!p.ok)throw new Error(p.msg||'Download failed');
    if(!isAdmin()&&p.stations)DB.sync.user.stations=p.stations;
    mergePull(p);DB.sync.lastPull=p.t;DB.sync.at=Date.now();save();
    if(manual&&!SYNC.err)toast('Synced');
  }catch(e){
    SYNC.err=(e&&e.message==='Failed to fetch')?'No internet. Changes are saved on this phone and will upload later.':String(e&&e.message||e);
    if(manual)toast(SYNC.err);
  }
  SYNC.busy=false;syncRender();
}
function syncRender(){
  const a=document.activeElement;
  if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
  if(['order','shopForm','prodForm','userForm','cred'].indexOf(ST.screen)>=0)return;
  render();
}
function syncSoon(){if(!serverOn()||!loggedIn())return;clearTimeout(SYNC.soon);SYNC.soon=setTimeout(()=>syncNow(false),1200);}
function initSync(){
  if(!serverOn())return;
  window.addEventListener('online',()=>syncNow(false));
  setInterval(()=>{if(document.visibilityState==='visible'&&loggedIn())syncNow(false);},45000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&loggedIn())syncNow(false);});
  if(loggedIn())syncNow(false);
}
function syncBtn(){
  if(!serverOn())return '';
  const p=pendingCount();
  return '<button class="hb" data-act="sync" aria-label="Sync now">'+ic('refresh',22)+(p?'<span class="dot">'+p+'</span>':'')+'</button>';
}
function syncLine(){
  if(!serverOn())return '';
  const pend=pendingCount(),at=DB.sync.at;
  const title=SYNC.busy?'Syncing...':(SYNC.err?'Sync problem':(at?'Synced '+agoText(Date.now()-at):'Not synced yet'));
  const sub=SYNC.err?SYNC.err:(pend?pend+' change'+(pend>1?'s':'')+' waiting to upload':'Everything is up to date');
  return '<div class="card row"><span class="chip-ic" style="--c:var(--'+(SYNC.err?'red':'green')+')">'+ic('cloud',22)+'</span><div class="grow"><div class="ttl">'+esc(title)+'</div><div class="mut sm">'+esc(sub)+'</div></div><button class="btn sm" data-act="sync">Sync now</button></div>';
}

/* views: login, account, station picker */
function vLogin(){
  const L=ST.login;
  return '<div class="login"><div class="logo big">S</div><h1>Salesbyte</h1><div class="mut" style="margin-bottom:14px">Sign in to continue</div>'+
  (!CFG.server?'<div class="fld"><label for="l-url">Server link</label><input class="in" id="l-url" data-l="url" autocapitalize="off" value="'+esc(L.url||DB.srv||'')+'" placeholder="https://script.google.com/macros/s/.../exec"></div>':'')+
  '<div class="fld"><label for="l-id">User ID</label><input class="in" id="l-id" data-l="id" autocapitalize="off" autocomplete="username" value="'+esc(L.id||'')+'"></div>'+
  '<div class="fld"><label for="l-pass">Password</label><input class="in" id="l-pass" type="password" data-l="pass" autocomplete="current-password" value="'+esc(L.pass||'')+'"></div>'+
  (ST.err?'<div class="note" role="alert" style="margin:0 0 10px">'+esc(ST.err)+'</div>':'')+
  '<button class="btn p full" data-act="login"'+(ST.busy?' disabled':'')+'>'+(ST.busy?'Signing in...':'Sign in')+'</button>'+
  (srvUrl()==='demo'?'<div class="mut sm" style="margin-top:12px">Demo cloud. Admin: admin / admin123. Data stays in this browser only.</div>':'')+'</div>';
}
function stationBar(){
  if(!serverOn()&&!allStations().length)return '';
  const ms=myStations(),cur=curStation();
  const opts=(isAdmin()?'<option value="">All stations</option>':'')+ms.map(x=>'<option value="'+esc(x)+'"'+(x===cur?' selected':'')+'>'+esc(x)+'</option>').join('');
  return '<div class="fld"><label for="stn">Station</label><select class="in" id="stn" data-f="station">'+opts+'</select></div>';
}
function stField(s){
  const ms=myStations();
  if(serverOn()&&!isAdmin())return '<div class="fld"><label for="s-station">Station</label><select class="in" id="s-station" data-s="station">'+ms.map(x=>'<option value="'+esc(x)+'"'+(x===s.station?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select></div>';
  return '<div class="fld"><label for="s-station">Station'+(serverOn()?'':' (optional)')+'</label><input class="in" id="s-station" data-s="station" list="stlist" value="'+esc(s.station||'')+'" placeholder="e.g. Sheikhupura"><datalist id="stlist">'+allStations().map(x=>'<option value="'+esc(x)+'">').join('')+'</datalist></div>';
}
function acctCard(){
  if(!serverOn())return '<div class="card row"><span class="chip-ic" style="--c:var(--blue)">'+ic('cloud',22)+'</span><div class="grow"><div class="ttl">Team sync is off</div><div class="mut">Put the server link in config.js so other people can book from their phones.</div></div></div>';
  const u=me()||{};
  return '<div class="card"><div class="row"><div class="avatar" style="width:44px;height:44px;font-size:16px">'+esc((u.name||'?')[0].toUpperCase())+'</div><div class="grow"><div class="ttl">'+esc(u.name||'')+' <span class="badge">'+(u.role==='admin'?'Admin':'Booker')+'</span></div><div class="mut">ID: '+esc(u.id||'')+(u.role==='admin'?'':' · '+esc((u.stations||[]).join(', ')))+'</div></div>'+
   '<button class="btn sm d" data-act="logout">'+ic('logout',18)+' Sign out</button></div></div>'+syncLine();
}
const teamMi=()=>teamAdmin()?'<button class="mi" data-act="openUsers"><span class="chip-ic" style="--c:var(--blue)">'+ic('users',22)+'</span><span class="grow"><span class="ttl">Team</span><br><span class="mut">Create IDs and passwords</span></span></button>':'';
function opsExtra(){
  return (teamAdmin()?'<button class="tile" data-act="openUsers"><span class="chip-ic" style="--c:var(--blue)">'+ic('users',26)+'</span>Team<small>IDs and stations</small></button>':'')+
   (serverOn()?'<button class="tile" data-act="sync"><span class="chip-ic" style="--c:var(--green)">'+ic('cloud',26)+'</span>Sync<small>'+(pendingCount()?pendingCount()+' waiting':'Up to date')+'</small></button>':'');
}

/* admin dashboard (home) */
function dashBody(){
  const d=ST.dday,vs=visitsOn(d),t=stats(vs),groups=new Map();
  vs.forEach(o=>{const k=o.station||(shopById(o.shopId)||{}).station||'No station';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o);});
  allStations().forEach(k=>{if(!groups.has(k))groups.set(k,[]);});
  const keys=Array.from(groups.keys()).sort((a,b)=>groups.get(b).length-groups.get(a).length||a.localeCompare(b));
  const bookers=new Set(vs.map(o=>o.uid)).size;
  let h=syncLine()+'<div class="sec" style="margin-top:4px">Team · '+fmtLong(d)+'</div>'+
   '<div class="two" style="margin-bottom:10px"><input class="in" type="date" data-f="dday" value="'+esc(d)+'" aria-label="Date"><button class="btn" data-act="dtoday">Today</button></div>'+
   '<div class="kpis"><div class="kpi"><b>'+t.total+'</b><span>Total Visits</span></div><div class="kpi" style="--c:var(--green)"><b>'+t.prod+'</b><span>Productive</span></div><div class="kpi" style="--c:var(--orange)"><b>'+t.np+'</b><span>Non Productive</span></div>'+
   '<div class="kpi"><b>'+fmtC(t.ctns)+'</b><span>Cartons</span></div><div class="kpi" style="--c:var(--green)"><b>'+Math.round(t.pct)+'%</b><span>Productivity</span></div><div class="kpi" style="--c:var(--purple)"><b>'+bookers+'</b><span>Bookers</span></div></div>'+
   (hasRates()?'<div class="card" style="margin-top:10px"><div class="row"><div class="grow mut">Booking value</div><b>Rs '+fmtMoney(t.value)+'</b></div></div>':'')+
   '<div class="sec">Station wise</div>';
  if(!keys.length)h+='<div class="empty">No stations yet. Add stores with a station, or create a team member.</div>';
  h+=keys.map(k=>{
    const L=groups.get(k),s=stats(L),total=shopsFor(k).length,seen=new Set(L.map(o=>o.shopId)).size,bm=new Map();
    L.forEach(o=>{const n=o.uname||o.uid||'?';if(!bm.has(n))bm.set(n,[]);bm.get(n).push(o);});
    return '<div class="card"><div class="row"><div class="grow"><div class="ttl">'+esc(k)+'</div><div class="mut sm">'+seen+' of '+total+' stores visited</div></div><span class="badge '+(s.total?'g':'')+'">'+s.prod+' / '+s.total+'</span></div>'+
     '<div class="cm"><div><span>Productive</span><b>'+s.prod+'</b></div><div><span>Non Productive</span><b>'+s.np+'</b></div><div><span>Cartons</span><b>'+fmtC(s.ctns)+'</b></div></div>'+
     (bm.size?'<div style="margin-top:8px">'+Array.from(bm.entries()).map(e=>{const x=stats(e[1]);return '<div class="dayrow" style="grid-template-columns:1fr auto auto"><span class="ttl">'+esc(e[0])+'</span><span class="mut">'+x.prod+'/'+x.total+' calls</span><b>'+fmtC(x.ctns)+' ctn</b></div>';}).join('')+'</div>':'<div class="mut sm" style="margin-top:8px">No bookings yet</div>')+
     (L.length?'<button class="btn sm full" style="margin-top:8px" data-act="dashDsr" data-st="'+esc(k==='No station'?'':k)+'">Open DSR</button>':'')+'</div>';
  }).join('');
  return h;
}

/* DSR filters */
function dsrVisits(date){return visitsOn(date).filter(o=>(!ST.dsrStation||o.station===ST.dsrStation)&&(!ST.dsrUser||o.uid===ST.dsrUser));}
function hdrName(){
  if(teamAdmin()&&ST.dsrUser){const v=DB.orders.find(o=>o.uid===ST.dsrUser);return v?v.uname:ST.dsrUser;}
  return myName();
}
function hdrStation(date){
  const st=Array.from(new Set(dsrVisits(date).map(o=>o.station).filter(Boolean)));
  return ST.dsrStation||st.join(', ')||DB.settings.station||'';
}
const dsrSuffix=()=>ST.dsrStation?'_'+ST.dsrStation.replace(/[^A-Za-z0-9]+/g,''):'';
function dsrFilters(){
  if(!serverOn()&&!allStations().length)return '';
  let h='<div class="two"><div class="fld"><label for="dsrst">Station</label><select class="in" id="dsrst" data-f="dsrst"><option value="">All stations</option>'+
    myStations().map(x=>'<option value="'+esc(x)+'"'+(x===ST.dsrStation?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select></div>';
  if(teamAdmin()){
    const m=new Map();DB.orders.forEach(o=>{if(o.uid)m.set(o.uid,o.uname||o.uid);});
    h+='<div class="fld"><label for="dsrus">Booker</label><select class="in" id="dsrus" data-f="dsrus"><option value="">All bookers</option>'+Array.from(m.entries()).map(e=>'<option value="'+esc(e[0])+'"'+(e[0]===ST.dsrUser?' selected':'')+'>'+esc(e[1])+'</option>').join('')+'</select></div>';
  }else h+='<div></div>';
  return h+'</div>';
}

/* team management (admin) */
const SLUG=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,12);
function genPass(){
  const a='abcdefghjkmnpqrstuvwxyz23456789',r=new Uint32Array(7);let s='';
  if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(r);else for(let i=0;i<7;i++)r[i]=Math.floor(Math.random()*4e9);
  for(let i=0;i<7;i++)s+=a[r[i]%a.length];
  return s;
}
async function loadUsers(){
  try{
    const r=await api('users',{});
    if(r.ok){ST.users=r.users;const s=new Set();r.users.forEach(u=>u.stations.forEach(x=>{if(x!=='*')s.add(x);}));DB.extraSt=Array.from(s);save();}
    else toast(r.msg||'Could not load team');
  }catch(e){ST.users=ST.users||[];toast('No connection. Team list needs internet.');}
  if(ST.screen==='users')render();
}
function vUsers(){
  const L=ST.users;
  return hdr('Team',{back:true,sub:L?L.length+' people':'Loading...'})+'<div class="body">'+
  (L===null?'<div class="empty">Loading...</div>':(L.length?L.map(u=>'<div class="card row" data-act="editUser" data-id="'+esc(u.id)+'" style="cursor:pointer"><div class="avatar" style="width:44px;height:44px;font-size:16px">'+esc((u.name||'?')[0].toUpperCase())+'</div><div class="grow"><div class="ttl">'+esc(u.name)+'</div><div class="mut">ID: '+esc(u.id)+'</div><div class="chips">'+u.stations.map(s=>'<i>'+esc(s==='*'?'All stations':s)+'</i>').join('')+'</div></div>'+(u.active?'<span class="badge g">Active</span>':'<span class="badge n">Off</span>')+'</div>').join(''):'<div class="empty">No team members yet. Tap + to create an ID and password.</div>'))+'</div>'+
  '<button class="fab" data-act="addUser" aria-label="Add team member">'+ic('plus',28)+'</button>';
}
function vUserForm(){
  const f=ST.ufrm,sts=Array.from(new Set(allStations().concat(f.stations))).sort((a,b)=>a.localeCompare(b));
  return hdr(f.isNew?'New Team Member':'Edit Team Member',{back:true})+'<div class="body">'+
  '<div class="fld"><label for="u-name">Name</label><input class="in" id="u-name" data-u="name" value="'+esc(f.name)+'" placeholder="Full name"></div>'+
  '<div class="fld"><label for="u-id">User ID</label><input class="in" id="u-id" data-u="id" autocapitalize="off" value="'+esc(f.id)+'" placeholder="'+(f.isNew?'leave empty to use the name':'')+'"'+(f.isNew?'':' readonly')+'></div>'+
  '<div class="fld"><label for="u-password">'+(f.isNew?'Password':'New password (leave empty to keep)')+'</label><div class="row"><input class="in" id="u-password" data-u="password" autocapitalize="off" value="'+esc(f.password)+'"><button class="btn" data-act="genPass" aria-label="Generate password">'+ic('key',20)+'</button></div></div>'+
  '<div class="sec">Stations this person can book</div>'+
  '<label class="card row" style="gap:10px"><input type="checkbox" data-u="all" '+(f.all?'checked':'')+' style="width:22px;height:22px"><span class="grow ttl">All stations</span></label>'+
  (f.all?'':sts.map(s=>'<label class="card row" style="gap:10px"><input type="checkbox" data-ust="'+esc(s)+'" '+(f.stations.indexOf(s)>=0?'checked':'')+' style="width:22px;height:22px"><span class="grow ttl">'+esc(s)+'</span></label>').join('')+
   '<div class="row" style="margin-bottom:12px"><input class="in" id="u-newSt" data-u="newSt" value="'+esc(f.newSt)+'" placeholder="Add a new station"><button class="btn" data-act="addSt">Add</button></div>')+
  '<label class="card row" style="gap:10px"><input type="checkbox" data-u="active" '+(f.active?'checked':'')+' style="width:22px;height:22px"><span class="grow ttl">Active (can sign in)</span></label>'+
  '<button class="btn p full" data-act="saveUser"'+(ST.busy?' disabled':'')+'>'+ic('save',20)+' '+(f.isNew?'Create ID':'Save')+'</button></div>';
}
async function saveUser(){
  const f=ST.ufrm,name=(f.name||'').trim(),id=((f.id||'').trim()||SLUG(name)).toLowerCase();
  const st=f.all?['*']:f.stations.slice();
  if(!name){toast('Enter the name');return;}
  ST.busy=true;
  try{
    const r=await api('saveUser',{id,name,password:f.password,stations:st,active:f.active,isNew:f.isNew});
    ST.busy=false;
    if(!r.ok){toast(r.msg||'Could not save');render();return;}
    if(f.password){ST.cred={id,name,pass:f.password};ST.screen='cred';render();}
    else{toast('Saved');back();}
    loadUsers();
  }catch(e){ST.busy=false;toast('No connection. Try again with internet.');render();}
}
const appLink=()=>location.origin+location.pathname.replace(/index\.html$/,'');
const credText=()=>'Salesbyte login\nLink: '+appLink()+'\nID: '+ST.cred.id+'\nPassword: '+ST.cred.pass;
function vCred(){
  const c=ST.cred;
  return hdr('Login details',{back:true})+'<div class="body"><div class="card"><div class="ttl" style="margin-bottom:8px">Send these to '+esc(c.name)+'</div>'+
  '<div class="mut">Link</div><div class="ttl" style="margin-bottom:8px">'+esc(appLink())+'</div><div class="mut">User ID</div><div class="ttl" style="font-size:20px;margin-bottom:8px">'+esc(c.id)+'</div><div class="mut">Password</div><div class="ttl" style="font-size:20px">'+esc(c.pass)+'</div></div>'+
  '<div class="note" style="margin-bottom:12px">This password is shown only now. If it is lost, open the person and set a new one.</div>'+
  '<div class="two"><button class="btn p" data-act="copyCred">'+ic('copy',20)+' Copy</button><a class="btn p" data-act="noop" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(credText())+'">'+ic('share',20)+' WhatsApp</a></div>'+
  '<div style="height:10px"></div><button class="btn full" data-act="back">Done</button></div>';
}
async function copyText(t){
  try{await navigator.clipboard.writeText(t);toast('Copied');}
  catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('Copied');}catch(x){toast('Could not copy');}a.remove();}
}
function backupData(){const b=JSON.parse(JSON.stringify(DB));b.sync={token:'',user:null,lastPull:0,lastPush:0,at:0,uid:''};b.srv='';return b;}


/* ---------- views ---------- */
function hdr(title,o){
  o=o||{};
  return '<header class="hdr">'+(o.back?'<button class="hb" data-act="back" aria-label="Back">'+ic('back',26)+'</button>':'<span class="hb"></span>')+
  '<div class="ht">'+(o.brand?'<div class="brand"><span class="logo">S</span>'+esc(title)+'</div>':'<h1>'+esc(title)+'</h1>')+(o.sub?'<small>'+esc(o.sub)+'</small>':'')+'</div>'+(o.right||'<span class="hb"></span>')+'</header>';
}
function dayLabel(d){const n=daysBetween(d,todayStr());return n===0?'Today':n===1?'Yesterday':dow(d)+' '+pd(d).d;}

function vHome(){
  const s=DB.settings,t=stats(visitsOn(todayStr())),sc=scoring();
  const ini=(myName()||'Salesbyte').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  let h=hdr('Salesbyte',{brand:true,right:syncBtn()})+
  '<div class="prof"><div class="prof-top"><div class="avatar">'+esc(ini)+'</div><div class="grow"><div class="pname">'+esc(myName()||'Set your name in More > Settings')+'</div><div class="mut">'+esc([s.station,s.zone,s.area].filter(Boolean).join(' · ')||fmtLong(todayStr()))+'</div></div></div>'+
  '<div><div class="pbar"><i style="width:'+Math.min(100,sc.pct)+'%"></i></div><div class="prow"><span>Monthly score</span><b>'+sc.pct+'%</b></div></div></div>'+
  '<div class="tabs3">'+[['today','chart'],['score','trophy'],['trend','list']].map(x=>'<button data-act="htab" data-t="'+x[0]+'" class="'+(ST.htab===x[0]?'on':'')+'" aria-label="'+x[0]+'">'+ic(x[1],24)+'</button>').join('')+'</div><div class="body">';
  if(ST.htab==='today'&&teamAdmin()){
    h+=dashBody();
  }else if(ST.htab==='today'){
    h+=syncLine()+'<div class="sec" style="margin-top:4px">Today · '+fmtLong(todayStr())+'</div><div class="kpis">'+
      '<div class="kpi"><b>'+t.total+'</b><span>Total Calls</span></div>'+
      '<div class="kpi" style="--c:var(--green)"><b>'+t.prod+'</b><span>Productive</span></div>'+
      '<div class="kpi" style="--c:var(--orange)"><b>'+t.np+'</b><span>Un Productive</span></div>'+
      '<div class="kpi" style="--c:var(--purple)"><b>'+fmt1(t.skuPerCall)+'</b><span>SKU / Call</span></div>'+
      '<div class="kpi"><b>'+fmtC(t.ctns)+'</b><span>Cartons</span></div>'+
      '<div class="kpi" style="--c:var(--green)"><b>'+Math.round(t.pct)+'%</b><span>Productivity</span></div></div>'+
      (hasRates()?'<div class="card" style="margin-top:10px"><div class="row"><div class="grow mut">Booking value today</div><b>Rs '+fmtMoney(t.value)+'</b></div></div>':'')+
      '<div class="sec">Visit Productivity</div><div class="card">'+donut(t.prod,t.total)+'<div class="mut" style="text-align:center;margin-top:6px">Productive calls out of total visits</div></div>'+
      '<button class="btn p full" data-act="tab" data-t="plan">'+ic('plan',20)+' Start Visit Plan</button>';
  }else if(ST.htab==='score'){
    h+='<div class="sec" style="margin-top:4px">Scoring Criteria (This Month)</div>'+sc.items.map(i=>
      '<div class="crit"><div class="row"><span class="chip-ic" style="--c:'+i.c+'">'+ic(i.icon,22)+'</span><div class="grow ttl">'+esc(i.name)+'</div><div class="mut" style="text-align:right">Weightage<br><b>'+i.w+'</b></div></div>'+
      '<div class="cm"><div><span>Target</span><b>'+fmt1(i.t)+i.unit+'</b></div><div><span>Achievement</span><b>'+fmt1(i.a)+i.unit+'</b></div><div><span>Points</span><b>'+fmt1(i.pts)+'</b></div></div></div>').join('')+
      '<div class="card row"><div class="grow ttl">Total points</div><b style="font-size:20px;color:var(--blue)">'+fmt1(sc.pts)+' / 100</b></div>';
  }else{
    const days=[];for(let i=6;i>=0;i--)days.push(addDays(todayStr(),-i));
    const ss=days.map(d=>stats(visitsOn(d)));
    h+='<div class="sec" style="margin-top:4px">Average SKU / Call</div><div class="card">'+
      days.slice().reverse().slice(0,6).map(d=>{const x=ss[days.indexOf(d)];return '<div class="dayrow"><span>'+esc(dayLabel(d))+'</span><div class="dbar"><i style="width:'+Math.min(100,x.skuPerCall/8*100)+'%"></i></div><b>'+fmt1(x.skuPerCall)+'</b></div>';}).join('')+'</div>'+
      '<div class="sec">Sales Trend (Cartons)</div><div class="card">'+chartSvg(ss.map(x=>x.ctns),days.map(d=>pd(d).d))+'</div>';
  }
  return h+'</div>';
}

function vPlan(){
  if(serverOn()&&!isAdmin()&&!myStations().length)return hdr('Visit Plan',{right:syncBtn()})+'<div class="body">'+syncLine()+'<div class="empty">No station is assigned to your account yet. Please ask the admin.</div></div>';
  const d=ST.planDate,stn=curStation(),vs=visitsOn(d).filter(o=>!stn||(o.station||'')===stn),t=stats(vs),vmap=new Map(vs.map(o=>[o.shopId,o]));
  const q=ST.q.trim().toLowerCase();
  let list=shopsFor(stn).filter(s=>!q||(s.name+' '+s.address+' '+s.owner).toLowerCase().includes(q));
  if(ST.tab==='p')list=list.filter(s=>vmap.get(s.id)&&vmap.get(s.id).st==='P');
  else if(ST.tab==='n')list=list.filter(s=>vmap.get(s.id)&&vmap.get(s.id).st==='N');
  list.sort((a,b)=>a.name.localeCompare(b.name));
  const rows=list.map(s=>{
    const v=vmap.get(s.id);
    const status=v?(v.st==='P'?'<span class="badge g">Productive · '+fmtC(orderCtn(v))+' ctn</span>':'<span class="badge n">Non Productive</span>'):'<span class="mut sm">'+esc(lastVisit(s.id,d))+'</span>';
    const pin=(s.lat!=null&&s.lng!=null)?'<a class="rb" data-act="noop" target="_blank" rel="noopener" href="https://www.google.com/maps?q='+s.lat+','+s.lng+'" aria-label="Open map">'+ic('pin',20)+'</a>':'<button class="rb off" data-act="needGps" aria-label="No GPS">'+ic('pin',20)+'</button>';
    const call=s.phone?'<a class="rb" data-act="noop" href="tel:'+esc(s.phone)+'" aria-label="Call">'+ic('phone',20)+'</a>':'<button class="rb off" data-act="needPhone" aria-label="No phone">'+ic('phone',20)+'</button>';
    return '<div class="srow" data-act="book" data-id="'+s.id+'"><div class="sav">'+esc((s.name||'?')[0].toUpperCase())+'</div><div class="grow"><div class="ttl">'+esc(s.name)+' <span class="badge '+(s.rw==='R'?'':'w')+'">'+esc(s.rw)+'</span></div><div class="mut">'+esc(s.address||'-')+'</div><div style="margin-top:3px">'+status+'</div></div>'+pin+call+'</div>';
  }).join('');
  return hdr('Visit Plan',{sub:(stn?stn+' · ':'')+(d===todayStr()?'Today · ':'')+fmtLong(d),right:syncBtn()})+
  '<div class="strip"><div><small>Productive Calls</small><b>'+t.prod+' / '+t.total+'</b></div><div><small>Non Productive</small><b>'+t.np+'</b></div><div><small>Cartons</small><b>'+fmtC(t.ctns)+'</b></div></div>'+
  '<div class="ptabs">'+[['a','All ('+shopsFor(stn).length+')'],['p','Productive ('+t.prod+')'],['n','Non-Productive ('+t.np+')']].map(x=>'<button data-act="ptab" data-t="'+x[0]+'" class="'+(ST.tab===x[0]?'on':'')+'">'+x[1]+'</button>').join('')+'</div>'+
  '<div class="body">'+syncLine()+stationBar()+'<div class="two"><input class="search" data-f="q" placeholder="Search store" value="'+esc(ST.q)+'" aria-label="Search store"><input class="search" type="date" data-f="pdate" value="'+esc(d)+'" aria-label="Visit date"></div>'+
  (rows||'<div class="empty">'+(shopsFor(stn).length?'No stores here.':'No stores in this station yet. Tap + to add one.')+'</div>')+'</div>'+
  '<button class="fab" data-act="addShop" aria-label="Add store">'+ic('plus',28)+'</button>';
}

function vGeo(){
  const q=ST.q.trim().toLowerCase();
  const list=DB.shops.filter(s=>!q||(s.name+' '+s.address).toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name));
  const tagged=DB.shops.filter(s=>s.lat!=null).length;
  return hdr('Geo Tagging',{sub:tagged+' of '+DB.shops.length+' stores tagged'})+'<div class="body"><input class="search" data-f="q" placeholder="Search store" value="'+esc(ST.q)+'" aria-label="Search store">'+
  (list.length?list.map(s=>'<div class="card"><div class="row"><div class="grow"><div class="ttl">'+esc(s.name)+'</div><div class="mut">'+esc(s.address||'-')+'</div><div class="mut sm">'+(s.lat!=null?'GPS: '+Number(s.lat).toFixed(5)+', '+Number(s.lng).toFixed(5):'Not tagged')+'</div></div>'+
    '<button class="btn sm" data-act="tagShop" data-id="'+s.id+'">'+ic('gps',18)+' '+(s.lat!=null?'Update':'Tag')+'</button><button class="btn sm" data-act="editShop" data-id="'+s.id+'" aria-label="Edit">'+ic('edit',18)+'</button></div></div>').join(''):'<div class="empty">No stores yet. Tap + to add one.</div>')+'</div>'+
  '<button class="fab" data-act="addShop" aria-label="Add store">'+ic('plus',28)+'</button>';
}
function vShopForm(){
  const s=ST.shop;
  const f=(k,l,ph,type)=>'<div class="fld"><label for="s-'+k+'">'+l+'</label><input class="in" id="s-'+k+'" data-s="'+k+'" '+(type?'type="'+type+'" inputmode="tel" ':'')+'value="'+esc(s[k])+'" placeholder="'+ph+'"></div>';
  return hdr(s.id?'Edit Store':'Add New Store',{back:true})+'<div class="body">'+
  f('name','Store Name','Please type')+f('owner','Owner Name','Please type')+f('phone','Owner Phone Number','03xx xxxxxxx','tel')+
  '<div class="fld"><label>R / W</label><div class="seg"><button data-act="rw" data-v="R" class="'+(s.rw==='R'?'on':'')+'">R · Retail</button><button data-act="rw" data-v="W.S" class="'+(s.rw==='W.S'?'on':'')+'">W.S · Wholesale</button></div></div>'+
  stField(s)+f('address','Store Address','e.g. Daal Bazaar')+f('landmark','Landmark','Please type')+f('locality','Locality','Please type')+
  '<div class="fld"><label>Store Location</label><div class="card row"><div class="grow mut" id="gpsTxt">'+(s.lat!=null?'GPS: '+Number(s.lat).toFixed(5)+', '+Number(s.lng).toFixed(5):'Not tagged')+'</div><button class="btn sm" data-act="gps">'+ic('gps',18)+' Update GPS</button></div></div>'+
  '<button class="btn p full" data-act="saveShop">'+ic('save',20)+' Save Store</button>'+(s.id&&isAdmin()?'<div style="height:10px"></div><button class="btn d full" data-act="delShop">Delete Store</button>':'')+'</div>';
}

function stepBox(p,k,label,v){
  return '<div class="qb"><label for="q-'+p.id+'-'+k+'">'+label+'</label><div class="step"><button data-act="dec" data-id="'+p.id+'" data-k="'+k+'" aria-label="Less '+label+'">−</button>'+
  '<input id="q-'+p.id+'-'+k+'" type="number" inputmode="numeric" min="0" data-q="'+p.id+'" data-k="'+k+'" class="'+(v?'has':'')+'" value="'+(v||'')+'" placeholder="0"><button data-act="inc" data-id="'+p.id+'" data-k="'+k+'" aria-label="More '+label+'">+</button></div></div>';
}
function hint(p,v){const c=v?(v.c||0)+(v.b||0)/(p.bpc||20):0;return (p.bpc||20)+' box = 1 ctn'+(c?' · '+fmtC(c)+' ctn':'');}
function vOrder(){
  const d=ST.draft,sh=shopById(d.shopId)||{name:'Store',rw:'',address:''};
  const list=DB.products.filter(p=>p.on||d.qty[p.id]);
  let body='';
  GORDER.forEach(g=>{
    const ps=list.filter(p=>p.g===g);if(!ps.length)return;
    body+='<div class="sec">'+GROUPS[g]+'</div>'+ps.map(p=>{const v=d.qty[p.id]||{c:0,b:0};
      return '<div class="pcard"><div class="row"><div class="grow pn">'+esc(p.name)+'</div><div class="mut sm" id="h-'+p.id+'">'+hint(p,d.qty[p.id])+'</div></div><div class="pq">'+stepBox(p,'c','Carton',v.c)+stepBox(p,'b','Box',v.b)+'</div></div>';}).join('');
  });
  if(!list.length)body='<div class="empty">No products yet. Add products from More > Products.</div>';
  return hdr(sh.name,{back:true,sub:(sh.rw?sh.rw+' · ':'')+(sh.address||'')})+'<div class="body">'+
  '<div class="fld"><label for="d-date">Visit date</label><input class="in" id="d-date" type="date" data-d="date" value="'+esc(d.date)+'"></div>'+body+
  '<div class="sec">Remarks</div><label class="card row" style="gap:10px"><input type="checkbox" data-d="disc" '+(d.disc?'checked':'')+' style="width:22px;height:22px"><span class="grow ttl">Discount '+esc(DB.settings.discPct||1.5)+'%</span></label>'+
  '<div class="fld"><label for="d-delivery">Delivery date (optional)</label><input class="in" id="d-delivery" type="date" data-d="delivery" value="'+esc(d.delivery||'')+'"></div>'+
  '<div class="fld"><label for="d-remarks">Remarks</label><textarea class="in" id="d-remarks" data-d="remarks" placeholder="Remarks">'+esc(d.remarks||'')+'</textarea></div>'+
  (d.id?'<button class="btn d full" data-act="delVisit">Delete this visit</button>':'')+'<div style="height:90px"></div></div>'+
  '<div class="bar"><div class="in2"><div class="grow mut sm">Total cartons<br><b id="tot">'+fmtC(orderCtn(d))+'</b></div><button class="btn o" data-act="nonProd">Non Productive</button><button class="btn p" data-act="saveOrder">Save Order</button></div></div>';
}

function vOrders(){
  const vs=visitsOn(ST.date),t=stats(vs);
  return hdr('Orders',{back:ST.stack.length>0,sub:t.total+' visits · '+fmtC(t.ctns)+' cartons'})+'<div class="body"><div class="fld"><label for="od">Date</label><input class="in" id="od" type="date" data-f="date" value="'+esc(ST.date)+'"></div>'+
  (vs.length?vs.map(o=>{const sh=shopById(o.shopId)||{name:'(deleted store)',address:'',rw:''};const r=remarksOf(o);
    return '<div class="card" data-act="editVisit" data-id="'+o.id+'" style="cursor:pointer"><div class="row"><div class="grow"><div class="ttl">'+esc(sh.name)+' <span class="badge '+(sh.rw==='R'?'':'w')+'">'+esc(sh.rw)+'</span></div><div class="mut">'+esc(sh.address||'-')+'</div></div>'+(o.st==='P'?'<b>'+fmtC(orderCtn(o))+' ctn</b>':'<span class="badge n">Non Productive</span>')+'</div>'+
    '<div class="chips">'+DB.products.filter(p=>o.qty[p.id]).map(p=>'<i>'+esc(p.name)+': <b>'+esc(cellText(o.qty[p.id]))+'</b></i>').join('')+'</div>'+(r?'<span class="note">'+esc(r)+'</span>':'')+'</div>';}).join(''):'<div class="empty">No visits on this date.</div>')+'</div>';
}

/* ---------- DSR data ---------- */
function colsFor(date){
  const used=new Set();dsrVisits(date).forEach(o=>Object.keys(o.qty).forEach(k=>used.add(k)));
  const act=DB.products.filter(p=>p.on||used.has(p.id));const out=[];
  GORDER.forEach(g=>act.filter(p=>p.g===g).forEach(p=>out.push(p)));return out;
}
function dsrData(date){
  const vs=dsrVisits(date),order=[],m=new Map();
  for(const o of vs){const sh=shopById(o.shopId)||{name:'(deleted store)',address:'',rw:'',phone:''};const a=(sh.address||'').trim();
    if(!m.has(a)){m.set(a,[]);order.push(a);}m.get(a).push({o,sh});}
  const rows=[];
  for(const a of order)for(const x of m.get(a))rows.push({shop:x.sh.name,rw:x.sh.rw,addr:(x.sh.address||'')+(x.sh.phone?' / '+x.sh.phone:''),cells:x.o.qty,st:x.o.st,remarks:remarksOf(x.o),o:x.o});
  const cols=colsFor(date);
  const sums=cols.map(p=>rows.reduce((s,r)=>s+(r.st==='P'?ctn(r.o,p):0),0));
  return {cols,rows,sums,total:sums.reduce((a,b)=>a+b,0),stat:stats(vs)};
}
function vDsr(){
  const D=dsrData(ST.date),n=Math.max(25,D.rows.length);let body='';
  for(let i=0;i<n;i++){const r=D.rows[i];
    body+='<tr><td><b>'+(i+1)+'</b></td><td class="l">'+esc(r?r.shop:'')+'</td><td>'+esc(r?r.rw:'')+'</td><td class="l">'+esc(r?r.addr:'')+'</td>'+D.cols.map(p=>'<td>'+esc(r?cellText(r.cells[p.id]):'')+'</td>').join('')+'<td class="l">'+esc(r?r.remarks:'')+'</td></tr>';}
  return hdr('DSR Report',{back:ST.stack.length>0,sub:D.stat.total+' visits'})+'<div class="body">'+
  '<div class="fld"><label for="dd">Date</label><input class="in" id="dd" type="date" data-f="date" value="'+esc(ST.date)+'"></div>'+dsrFilters()+
  '<div class="kpis" style="margin-bottom:12px"><div class="kpi"><b>'+D.stat.total+'</b><span>Total Visits</span></div><div class="kpi" style="--c:var(--green)"><b>'+D.stat.prod+'</b><span>Productive</span></div><div class="kpi" style="--c:var(--orange)"><b>'+D.stat.np+'</b><span>Non Productive</span></div></div>'+
  '<div class="two"><button class="btn p" data-act="xlsx">'+ic('down',20)+' Excel</button><button class="btn p" data-act="pdf">'+ic('down',20)+' PDF</button></div><div style="height:8px"></div><button class="btn full" data-act="share">Share Excel</button><div style="height:12px"></div>'+
  '<div class="scroll"><table class="dsr"><thead><tr><th>#</th><th>Name shop keepers</th><th>R/W</th><th>Address/Phone No.</th>'+D.cols.map(p=>'<th>'+esc(p.name)+'</th>').join('')+'<th>Remarks</th></tr></thead><tbody>'+body+
  '<tr class="sum"><td colspan="4" class="l">Sales (Cartons):</td>'+D.sums.map(v=>'<td>'+(v?fmtC(v):'')+'</td>').join('')+'<td class="l">Total: '+fmtC(D.total)+' Ctn</td></tr>'+
  '<tr class="sum"><td colspan="4" class="l">Total Visits: '+D.stat.total+'</td><td colspan="'+(D.cols.length+1)+'" class="l">Productive: '+D.stat.prod+' &nbsp;|&nbsp; Non Productive: '+D.stat.np+' &nbsp;|&nbsp; Productivity: '+Math.round(D.stat.pct)+'%</td></tr></tbody></table></div></div>';
}

function vOps(){
  const t=stats(visitsOn(todayStr()));
  return hdr('Operations')+'<div class="body"><div class="tiles">'+
  '<button class="tile" data-act="tab" data-t="plan"><span class="chip-ic" style="--c:var(--blue)">'+ic('plan',26)+'</span>Book Order<small>'+t.total+' visits today</small></button>'+
  '<button class="tile" data-act="go" data-s="orders"><span class="chip-ic" style="--c:var(--green)">'+ic('list',26)+'</span>Orders<small>Day wise</small></button>'+
  '<button class="tile" data-act="go" data-s="dsr"><span class="chip-ic" style="--c:var(--orange)">'+ic('chart',26)+'</span>DSR Report<small>Excel / PDF</small></button>'+
  '<button class="tile" data-act="go" data-s="products"><span class="chip-ic" style="--c:var(--purple)">'+ic('box',26)+'</span>Products<small>'+DB.products.filter(p=>p.on).length+' active</small></button>'+
  '<button class="tile" data-act="tab" data-t="geo"><span class="chip-ic" style="--c:var(--red)">'+ic('gps',26)+'</span>Stores<small>'+DB.shops.length+' stores</small></button>'+
  '<button class="tile" data-act="addShop"><span class="chip-ic" style="--c:var(--blue)">'+ic('plus',26)+'</span>Add Store<small>New outlet</small></button>'+opsExtra()+'</div></div>';
}

function vProducts(){
  let h=hdr('Products',{back:ST.stack.length>0,sub:DB.products.length+' products'})+'<div class="body">';
  GORDER.forEach(g=>{
    const ps=DB.products.filter(p=>p.g===g);if(!ps.length)return;
    h+='<div class="sec">'+GROUPS[g]+'</div>'+ps.map(p=>'<div class="card row" '+(isAdmin()?'data-act="editProd" ':'')+'data-id="'+p.id+'" style="cursor:pointer"><span class="chip-ic" style="--c:var(--blue)">'+ic('box',22)+'</span><div class="grow"><div class="ttl">'+esc(p.name)+'</div><div class="mut">'+p.bpc+' box = 1 carton'+(Number(p.rate)>0?' · Rs '+fmtMoney(p.rate)+' / ctn':'')+'</div></div>'+(p.on?'<span class="badge g">Active</span>':'<span class="badge n">Off</span>')+'</div>').join('');
  });
  return h+'</div>'+(isAdmin()?'<button class="fab" data-act="addProd" aria-label="Add product">'+ic('plus',28)+'</button>':'');
}
function vProdForm(){
  const p=ST.prod;
  return hdr(p.id?'Edit Product':'Add Product',{back:true})+'<div class="body">'+
  '<div class="fld"><label for="p-name">Product name</label><input class="in" id="p-name" data-p="name" value="'+esc(p.name)+'" placeholder="e.g. Super Hockey 2"></div>'+
  '<div class="fld"><label>Section in DSR</label><div class="seg">'+GORDER.map(g=>'<button data-act="pg" data-v="'+g+'" class="'+(p.g===g?'on':'')+'">'+(g==='M'?'Match':g==='O'?'Oll Clean':'Other')+'</button>').join('')+'</div></div>'+
  '<div class="fld"><label for="p-bpc">Boxes in 1 carton</label><input class="in" id="p-bpc" type="number" inputmode="numeric" min="1" data-p="bpc" value="'+esc(p.bpc)+'"></div>'+
  '<div class="fld"><label for="p-rate">Rate per carton (optional)</label><input class="in" id="p-rate" type="number" inputmode="decimal" min="0" data-p="rate" value="'+(Number(p.rate)>0?esc(p.rate):'')+'" placeholder="0"></div>'+
  '<label class="card row" style="gap:10px"><input type="checkbox" data-p="on" '+(p.on?'checked':'')+' style="width:22px;height:22px"><span class="grow ttl">Active (show in order entry and DSR)</span></label>'+
  '<button class="btn p full" data-act="saveProd">'+ic('save',20)+' Save Product</button>'+(p.id?'<div style="height:10px"></div><button class="btn d full" data-act="delProd">Delete Product</button>':'')+'</div>';
}

function vMore(){
  const mi=(s,i,t,sub,c)=>'<button class="mi" data-act="go" data-s="'+s+'"><span class="chip-ic" style="--c:'+c+'">'+ic(i,22)+'</span><span class="grow"><span class="ttl">'+t+'</span><br><span class="mut">'+sub+'</span></span></button>';
  return hdr('More')+'<div class="body">'+acctCard()+'<div class="menu">'+
  mi('products','box','Products',DB.products.length+' products',  'var(--purple)')+mi('settings','cog','Settings','Name, DSR header, targets','var(--blue)')+mi('orders','list','Orders','Day wise visits','var(--green)')+mi('dsr','chart','DSR Report','Excel and PDF','var(--orange)')+teamMi()+'</div>'+
  '<div class="sec">Backup</div><div class="two"><button class="btn" data-act="backup">Download backup</button><button class="btn" data-act="restore">Restore backup</button></div><input type="file" id="rf" accept=".json,application/json" hidden>'+
  (isAdmin()?'<div class="sec">Test data</div><button class="btn full" data-act="sample">Load sample data (19 Oct 2026)</button><div class="mut" style="margin-top:6px">Adds sample stores and visits, including boxes and Non Productive examples, to test Excel and PDF.</div>':'')+
  '<div class="sec">About</div><div class="card row"><span class="logo">S</span><div class="grow"><div class="ttl">Salesbyte</div><div class="mut">Visit plan, order booking and DSR. Data stays on this phone.</div></div></div></div>';
}
function vSettings(){
  const s=DB.settings,T=s.targets;
  const f=(k,l,ph)=>'<div class="fld"><label for="st-'+k+'">'+l+'</label><input class="in" id="st-'+k+'" data-st="'+k+'" value="'+esc(s[k])+'" placeholder="'+ph+'"></div>';
  const tg=(k,l)=>'<div class="fld"><label for="tg-'+k+'">'+l+'</label><input class="in" id="tg-'+k+'" type="number" inputmode="decimal" data-tg="'+k+'" value="'+esc(T[k])+'"></div>';
  return hdr('Settings',{back:true,sub:'DSR header and targets'})+'<div class="body">'+f('name','Name','Your name')+f('station','Station','Sheikhupura')+f('zone','Zone','Sheikhupura')+f('area','Area / Sales Person','Main Market')+f('dsrNo','DSR No.','')+f('discPct','Discount %','1.5')+
  '<div class="sec">Monthly targets</div><div class="two">'+tg('op','Outlet productivity %')+tg('cp','Call productivity %')+tg('cc','Cartons per call')+tg('sk','SKU per call')+tg('dc','Daily calls')+'</div></div>';
}

function render(){
  if(!loggedIn()){$('#app').innerHTML=vLogin();$('#nav').innerHTML='';return;}
  const sc=ST.screen;let h='';
  if(sc==='home')h=vHome();else if(sc==='plan')h=vPlan();else if(sc==='geo')h=vGeo();else if(sc==='more')h=vMore();else if(sc==='ops')h=vOps();
  else if(sc==='shopForm')h=vShopForm();else if(sc==='order')h=vOrder();else if(sc==='orders')h=vOrders();else if(sc==='dsr')h=vDsr();
  else if(sc==='products')h=vProducts();else if(sc==='prodForm')h=vProdForm();else if(sc==='settings')h=vSettings();
  else if(sc==='users')h=vUsers();else if(sc==='userForm')h=vUserForm();else if(sc==='cred')h=vCred();
  $('#app').innerHTML=h;
  $('#nav').innerHTML=[['home','home',(serverOn()&&isAdmin())?'Dashboard':'Home'],['ops','ops','Operations'],['plan','plan','Visit Plan'],['geo','gps','Geo Tagging'],['more','more','More']]
   .map(x=>'<button data-act="tab" data-t="'+x[0]+'" class="'+(ST.root===x[0]?'on':'')+(x[0]==='plan'?' mid':'')+'">'+(x[0]==='plan'?'<span>'+ic(x[1],26)+'</span>':ic(x[1],24))+x[2]+'</button>').join('');
}

/* ---------- actions ---------- */
function startVisit(shopId){
  const ex=visitOf(shopId,ST.planDate);
  ST.draft=ex?clone(ex):{id:'',shopId,date:ST.planDate,qty:{},st:'P',disc:false,delivery:'',remarks:''};
  go('order');
}
function setQty(pid,k,v,fromInput){
  v=Math.max(0,Math.floor(Number(v)||0));
  const q=ST.draft.qty;const cur=q[pid]||{c:0,b:0};cur[k]=v;
  if(!cur.c&&!cur.b)delete q[pid];else q[pid]=cur;
  const i=$('#q-'+pid+'-'+k);if(i){if(!fromInput)i.value=v||'';i.classList.toggle('has',v>0);}
  const p=prodById(pid),hh=$('#h-'+pid);if(hh&&p)hh.textContent=hint(p,q[pid]);
  const tt=$('#tot');if(tt)tt.textContent=fmtC(orderCtn(ST.draft));
}
function upsertVisit(d){
  const shp=shopById(d.shopId);d.station=(shp&&shp.station)||d.station||curStation()||'';
  if(!d.uid){d.uid=myId();d.uname=myName();}
  d.u=Date.now();
  if(d.id){const i=DB.orders.findIndex(o=>o.id===d.id);if(i>=0)DB.orders[i]=d;else DB.orders.push(d);}
  else{d.id=uid();d.ts=Date.now();DB.orders.push(d);}
  save();syncSoon();ST.planDate=d.date;ST.date=d.date;ST.stack=[];ST.screen='plan';ST.root='plan';ST.tab='a';ST.q='';render();window.scrollTo(0,0);
}
function getGps(done){
  if(!navigator.geolocation){toast('GPS is not available here');return;}
  toast('Getting location...');
  navigator.geolocation.getCurrentPosition(p=>done(+p.coords.latitude.toFixed(6),+p.coords.longitude.toFixed(6)),()=>toast('Could not get GPS. Allow location and try again.'),{enableHighAccuracy:true,timeout:15000,maximumAge:0});
}

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]');if(!t)return;const a=t.dataset.act;
  if(a==='noop')return;
  if(a==='mNo'){$('#modal').hidden=true;ST.modalFn=null;}
  else if(a==='mYes'){$('#modal').hidden=true;const f=ST.modalFn;ST.modalFn=null;if(f)f();}
  else if(a==='back')back();
  else if(a==='tab')tab(t.dataset.t);
  else if(a==='go')go(t.dataset.s);
  else if(a==='htab'){ST.htab=t.dataset.t;render();}
  else if(a==='ptab'){ST.tab=t.dataset.t;render();}
  else if(a==='needGps')toast('This store has no GPS yet. Tag it from Geo Tagging.');
  else if(a==='needPhone')toast('No phone number saved for this store.');
  else if(a==='addShop'){ST.shop={id:'',name:'',owner:'',phone:'',rw:'R',address:'',landmark:'',locality:'',lat:null,lng:null,station:curStation()};go('shopForm');}
  else if(a==='editShop'){ST.shop=Object.assign({},shopById(t.dataset.id));go('shopForm');}
  else if(a==='rw'){ST.shop.rw=t.dataset.v;render();}
  else if(a==='gps'){getGps((la,ln)=>{ST.shop.lat=la;ST.shop.lng=ln;const g=$('#gpsTxt');if(g)g.textContent='GPS: '+la.toFixed(5)+', '+ln.toFixed(5);toast('Location updated');});}
  else if(a==='tagShop'){const s=shopById(t.dataset.id);getGps((la,ln)=>{s.lat=la;s.lng=ln;s.u=Date.now();save();syncSoon();toast('Location saved');render();});}
  else if(a==='saveShop'){
    const s=ST.shop;s.name=s.name.trim();if(!s.name){toast('Enter store name');return;}
    s.station=(s.station||'').trim();if(serverOn()&&!s.station){toast('Select the station');return;}
    s.u=Date.now();
    if(s.id){const i=DB.shops.findIndex(x=>x.id===s.id);DB.shops[i]=s;}else{s.id=uid();DB.shops.push(s);}
    save();syncSoon();toast('Store saved');back();
  }
  else if(a==='delShop'){
    if(DB.orders.some(o=>o.shopId===ST.shop.id)){toast('This store has visits, cannot delete');return;}
    ask('Delete this store?',()=>{tombS(ST.shop.id);DB.shops=DB.shops.filter(x=>x.id!==ST.shop.id);save();syncSoon();back();},'Delete');
  }
  else if(a==='book')startVisit(t.dataset.id);
  else if(a==='inc'){const q=ST.draft.qty[t.dataset.id];setQty(t.dataset.id,t.dataset.k,((q&&q[t.dataset.k])||0)+1);}
  else if(a==='dec'){const q=ST.draft.qty[t.dataset.id];setQty(t.dataset.id,t.dataset.k,((q&&q[t.dataset.k])||0)-1);}
  else if(a==='saveOrder'){
    const d=ST.draft;if(orderCtn(d)<=0){toast('Enter at least one carton or box, or tap Non Productive');return;}
    d.st='P';upsertVisit(d);toast('Order saved');
  }
  else if(a==='nonProd'){
    const d=ST.draft;const doIt=()=>{d.st='N';d.qty={};upsertVisit(d);toast('Marked Non Productive');};
    if(orderCtn(d)>0)ask('Quantities entered for this store will be removed. Mark as Non Productive?',doIt,'Mark'); else doIt();
  }
  else if(a==='editVisit'){const o=DB.orders.find(x=>x.id===t.dataset.id);if(o){ST.planDate=o.date;ST.draft=clone(o);go('order');}}
  else if(a==='delVisit')ask('Delete this visit?',()=>{tombV(ST.draft.id);DB.orders=DB.orders.filter(o=>o.id!==ST.draft.id);save();syncSoon();ST.stack=[];ST.screen='plan';ST.root='plan';render();toast('Visit deleted');},'Delete');
  else if(a==='addProd'){ST.prod={id:'',name:'',g:'X',bpc:20,rate:0,on:true};go('prodForm');}
  else if(a==='editProd'){ST.prod=Object.assign({},prodById(t.dataset.id));go('prodForm');}
  else if(a==='pg'){ST.prod.g=t.dataset.v;render();}
  else if(a==='saveProd'){
    const p=ST.prod;p.name=p.name.trim();p.bpc=Math.floor(Number(p.bpc))||0;p.rate=Number(p.rate)||0;
    if(!p.name){toast('Enter product name');return;}if(p.bpc<1){toast('Boxes in 1 carton must be 1 or more');return;}
    if(p.id){const i=DB.products.findIndex(x=>x.id===p.id);DB.products[i]=p;}else{p.id='p'+uid();DB.products.push(p);}
    DB.prodU=Date.now();save();syncSoon();toast('Product saved');back();
  }
  else if(a==='delProd'){
    if(DB.orders.some(o=>o.qty[ST.prod.id])){toast('Used in orders. Turn off Active instead.');return;}
    ask('Delete this product?',()=>{DB.products=DB.products.filter(x=>x.id!==ST.prod.id);DB.prodU=Date.now();save();syncSoon();back();},'Delete');
  }
  else if(a==='login')doLogin();
  else if(a==='logout')ask('Sign out of this phone?',doLogout,'Sign out');
  else if(a==='sync')syncNow(true);
  else if(a==='dtoday'){ST.dday=todayStr();render();}
  else if(a==='dashDsr'){ST.dsrStation=t.dataset.st||'';ST.dsrUser='';ST.date=ST.dday;go('dsr');}
  else if(a==='openUsers'){ST.users=null;go('users');loadUsers();}
  else if(a==='addUser'){ST.ufrm={isNew:true,id:'',name:'',password:genPass(),stations:[],all:false,active:true,newSt:''};go('userForm');}
  else if(a==='editUser'){const u=(ST.users||[]).find(x=>x.id===t.dataset.id);if(u){ST.ufrm={isNew:false,id:u.id,name:u.name,password:'',stations:u.stations.filter(x=>x!=='*'),all:u.stations.indexOf('*')>=0,active:u.active,newSt:''};go('userForm');}}
  else if(a==='genPass'){ST.ufrm.password=genPass();render();}
  else if(a==='addSt'){const v=(ST.ufrm.newSt||'').trim().replace(/,/g,' ');if(v&&ST.ufrm.stations.indexOf(v)<0)ST.ufrm.stations.push(v);ST.ufrm.newSt='';render();}
  else if(a==='saveUser')saveUser();
  else if(a==='copyCred')copyText(credText());
  else if(a==='xlsx')downloadXlsx(false);
  else if(a==='share')downloadXlsx(true);
  else if(a==='pdf')downloadPdf();
  else if(a==='sample')loadSample();
  else if(a==='backup')saveBlob(new Blob([JSON.stringify(backupData())],{type:'application/json'}),'Salesbyte_backup_'+todayStr()+'.json');
  else if(a==='restore')$('#rf').click();
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.f==='q'){ST.q=t.value;const pos=t.selectionStart;render();const n=$('[data-f="q"]');if(n){n.focus();try{n.setSelectionRange(pos,pos);}catch(x){}}}
  else if(t.dataset.q)setQty(t.dataset.q,t.dataset.k,t.value,true);
  else if(t.dataset.s)ST.shop[t.dataset.s]=t.value;
  else if(t.dataset.p){const k=t.dataset.p;ST.prod[k]=t.type==='checkbox'?t.checked:t.value;}
  else if(t.dataset.st){DB.settings[t.dataset.st]=t.dataset.st==='discPct'?(Number(t.value)||0):t.value;save();}
  else if(t.dataset.tg){DB.settings.targets[t.dataset.tg]=Number(t.value)||0;save();}
  else if(t.dataset.d){const k=t.dataset.d;ST.draft[k]=t.type==='checkbox'?t.checked:t.value;}
  else if(t.dataset.l)ST.login[t.dataset.l]=t.value;
  else if(t.dataset.u){const k=t.dataset.u;ST.ufrm[k]=t.type==='checkbox'?t.checked:t.value;if(k==='all')render();}
  else if(t.dataset.ust){const st=t.dataset.ust,a=ST.ufrm.stations,i=a.indexOf(st);if(t.checked&&i<0)a.push(st);if(!t.checked&&i>=0)a.splice(i,1);}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.f==='date'){ST.date=t.value||todayStr();render();}
  else if(t.dataset.f==='pdate'){ST.planDate=t.value||todayStr();render();}
  else if(t.dataset.f==='station'){DB.pref.station=t.value;save();render();}
  else if(t.dataset.f==='dsrst'){ST.dsrStation=t.value;render();}
  else if(t.dataset.f==='dsrus'){ST.dsrUser=t.value;render();}
  else if(t.dataset.f==='dday'){ST.dday=t.value||todayStr();render();}
  else if(t.id==='rf'&&t.files[0]){
    const r=new FileReader();r.onload=()=>{try{const j=JSON.parse(r.result);if(!Array.isArray(j.shops)||!Array.isArray(j.orders))throw 0;
      ask('Replace current data with this backup?',()=>{const keep=DB.sync,ksrv=DB.srv;DB=norm(j);DB.sync=keep;DB.srv=ksrv;DB.sync.lastPull=0;DB.prodPushed=0;DB.shops.forEach(x=>{x._s=0;});DB.orders.forEach(x=>{x._s=0;});save();toast('Backup restored');render();},'Restore');}
      catch(x){toast('Invalid backup file');}};r.readAsText(t.files[0]);
  }
});

/* ---------- files ---------- */
async function saveBlob(blob,name){
  try{
    if(window.claude&&window.claude.use){
      const dl=await window.claude.use('downloads');
      if(dl){await dl.save({filename:name,data:blob});return 'saved';}
    }
  }catch(e){if(e&&e.code==='declined')return 'declined';}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
  return 'saved';
}
function fileStamp(date){const p=pd(date);return p.d+MONTHS[p.m-1].slice(0,3)+p.y;}
const NOTES=['① کتنے آرڈر لیے گئے۔','② کتنی نئی شاپس پر مال کیا گیا۔','③ اسٹاک پوزیشن خود چیک کرکے تحریر کریں۔','④ کتنے سپر اسٹور/ڈیپارٹمنٹل اسٹور وزٹ کیے۔'];

async function buildXlsx(date){
  if(!window.ExcelJS)throw new Error('Excel tool did not load. Check internet and reopen.');
  const D=dsrData(date),s=DB.settings,rows=D.rows;
  const cols=D.cols.slice();let pi=0;while(cols.length<6)cols.push({id:'__pad'+(pi++),name:'',g:'P'});
  const P=cols.length,T=5+P,n=Math.max(25,rows.length),r0=6;
  const wb=new ExcelJS.Workbook();
  const ws=wb.addWorksheet('DSR',{views:[{showGridLines:false}],pageSetup:{orientation:'landscape',paperSize:9,fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:.3,right:.3,top:.4,bottom:.4,header:.2,footer:.2}}});
  ws.getColumn(1).width=6;ws.getColumn(2).width=34;ws.getColumn(3).width=8;ws.getColumn(4).width=30;
  for(let i=0;i<P;i++)ws.getColumn(5+i).width=10;ws.getColumn(T).width=36;
  const thin={style:'thin',color:{argb:'FF000000'}},B={top:thin,left:thin,bottom:thin,right:thin};
  const DARK='FF404040',LIGHT='FFE4E4E4',WHITE='FFFFFFFF';
  const put=(r,c,val,o)=>{o=o||{};const x=ws.getCell(r,c);x.value=val;
    x.font={name:'Arial',size:o.sz||9,bold:!!o.b,color:{argb:o.color||'FF000000'}};
    x.alignment={horizontal:o.al||'center',vertical:'middle',wrapText:true,readingOrder:o.rtl?'rtl':undefined};
    if(o.fill)x.fill={type:'pattern',pattern:'solid',fgColor:{argb:o.fill}};
    if(o.fmt)x.numFmt=o.fmt;return x;};
  const mg=(r1,c1,r2,c2)=>{if(r1===r2&&c1===c2)return;ws.mergeCells(r1,c1,r2,c2);};
  const box=(r1,c1,r2,c2)=>{for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)ws.getCell(r,c).border=B;};
  const numFmt=v=>v%1?'0.00':'0';
  // header rows 1-2
  const titleEnd=4+Math.min(4,Math.max(3,Math.floor(P/2)));
  const nr=T-titleEnd,sEnd=titleEnd+Math.max(1,Math.round(nr*0.55));
  mg(1,1,1,3);put(1,1,'Name: '+hdrName(),{al:'left'});
  put(1,4,'Date: '+fmtLong(date),{al:'left'});
  mg(1,5,2,titleEnd);put(1,5,'D.S.R.',{b:true,sz:20,color:WHITE,fill:DARK});
  mg(1,titleEnd+1,1,sEnd);put(1,titleEnd+1,'Station: '+hdrStation(date),{al:'left'});
  mg(1,sEnd+1,1,T);put(1,sEnd+1,'Zone: '+(s.zone||''),{al:'left'});
  mg(2,1,2,4);put(2,1,'',{});
  mg(2,titleEnd+1,2,T-2);put(2,titleEnd+1,'Area / Sales Person: '+(s.area||''),{al:'left'});
  mg(2,T-1,2,T);put(2,T-1,'No.: '+(s.dsrNo||''),{al:'left'});
  box(1,1,2,T);
  // header rows 3-5
  mg(3,1,4,2);put(3,1,'Name shop keepers',{b:true,sz:11,color:WHITE,fill:DARK});
  mg(5,1,5,2);put(5,1,'Opening',{});
  mg(3,3,5,3);put(3,3,'R/W',{b:true,sz:11,color:WHITE,fill:DARK});
  mg(3,4,5,4);put(3,4,'Address/Phone No.',{b:true,sz:11,color:WHITE,fill:DARK});
  mg(3,T,5,T);put(3,T,'Remarks',{b:true,sz:11,color:WHITE,fill:DARK});
  let ci=0;
  while(ci<cols.length){
    const g=cols[ci].g;let cj=ci;while(cj+1<cols.length&&cols[cj+1].g===g)cj++;
    const c1=5+ci,c2=5+cj;
    if(g==='M'){mg(3,c1,3,c2);put(3,c1,'MATCH DIVISION',{b:true,sz:9,fill:LIGHT});mg(4,c1,4,c2);put(4,c1,'SALES & POSITION',{b:true,sz:7,fill:LIGHT});}
    else{mg(3,c1,4,c2);put(3,c1,g==='P'?'':GROUPS[g],{b:true,sz:10,color:WHITE,fill:DARK});}
    ci=cj+1;
  }
  cols.forEach((p,i)=>put(5,5+i,p.name,{b:true,sz:7,fill:p.g==='P'?DARK:LIGHT}));
  box(3,1,5,T);
  ws.getRow(1).height=22;ws.getRow(2).height=22;ws.getRow(3).height=18;ws.getRow(4).height=14;ws.getRow(5).height=28;
  // data
  for(let i=0;i<n;i++){
    const r=r0+i,x=rows[i];
    put(r,1,i+1,{b:true});put(r,2,x?x.shop:'',{});put(r,3,x?x.rw:'',{});put(r,4,x?x.addr:'',{});
    cols.forEach((p,k)=>{
      const v=x?x.cells[p.id]:null;
      if(v&&v.c&&!v.b)put(r,5+k,v.c,{fmt:'0'});else put(r,5+k,v?cellText(v):null,{});
    });
    put(r,T,x?x.remarks:'',{});
    ws.getRow(r).height=19;
  }
  box(r0,1,r0+n-1,T);
  // totals
  const rs=r0+n,rc=rs+1,rv=rc+1;
  mg(rs,1,rs,4);put(rs,1,'Sales (Cartons):',{b:true,al:'left',fill:LIGHT});
  cols.forEach((p,k)=>{const v=D.sums[k]||0;put(rs,5+k,v?Math.round(v*100)/100:null,{b:true,fill:LIGHT,fmt:numFmt(v)});});
  put(rs,T,'Total: '+fmtC(D.total)+' Ctn',{b:true,fill:LIGHT});
  mg(rc,1,rc,4);put(rc,1,'Closing:',{b:true,al:'left'});
  for(let c=5;c<=T;c++)put(rc,c,null,{});
  // visit summary
  const t=D.stat,a=Math.floor(P/3);
  mg(rv,1,rv,4);put(rv,1,'Visit Summary:',{b:true,al:'left',fill:LIGHT});
  const parts=[[5,4+a,'Total Visits: '+t.total],[5+a,4+2*a,'Productive: '+t.prod],[5+2*a,4+P,'Non Productive: '+t.np]];
  parts.forEach(x=>{mg(rv,x[0],rv,x[1]);put(rv,x[0],x[2],{b:true,fill:LIGHT});});
  put(rv,T,'Productivity: '+Math.round(t.pct)+'%  |  SKU/Call: '+fmt1(t.skuPerCall),{b:true,fill:LIGHT});
  box(rs,1,rv,T);
  ws.getRow(rs).height=20;ws.getRow(rc).height=24;ws.getRow(rv).height=22;
  // Urdu notes
  const rn=rv+2,half=4+Math.ceil(P/2);
  mg(rn,2,rn,4);put(rn,2,NOTES[3],{al:'right',rtl:true});
  mg(rn,5,rn,half);put(rn,5,NOTES[2],{al:'right',rtl:true});
  mg(rn,half+1,rn,4+P);put(rn,half+1,NOTES[1],{al:'right',rtl:true});
  put(rn,T,NOTES[0],{al:'right',rtl:true});
  ws.getRow(rn).height=24;
  return wb.xlsx.writeBuffer();
}
async function downloadXlsx(share){
  const date=ST.date;
  if(!dsrVisits(date).length){toast('No visits on this date');return;}
  try{
    const buf=await buildXlsx(date);
    const name='DSR_Orders_'+fileStamp(date)+dsrSuffix()+'.xlsx';
    const type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const blob=new Blob([buf],{type});
    if(share&&navigator.canShare){
      const f=new File([blob],name,{type});
      if(navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:name});return;}catch(e){if(e&&e.name==='AbortError')return;}}
    }
    const r=await saveBlob(blob,name);if(r==='saved')toast('Excel ready: '+name);
  }catch(e){toast(String(e.message||e));}
}

function buildPdf(date){
  if(!(window.jspdf&&window.jspdf.jsPDF))throw new Error('PDF tool did not load. Check internet and reopen.');
  const doc=new window.jspdf.jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  const D=dsrData(date),rows=D.rows,s=DB.settings,cols=D.cols,P=cols.length;
  const W=297,H=210,mx=10,tw=W-2*mx;
  const base=[8,44,11,36],baseSum=99,remMin=40;
  const pw=P?Math.min(14,(tw-baseSum-remMin)/P):12;
  const wd=base.concat(cols.map(()=>pw));wd.push(tw-wd.reduce((a,b)=>a+b,0));
  const xs=[];let ax=mx;for(const w of wd){xs.push(ax);ax+=w;}
  const LAST=wd.length-1,DARK=[64,64,64],LIGHT=[228,228,228],WH=[255,255,255];
  doc.setLineWidth(0.2);doc.setDrawColor(40);
  function box(x,y,w,h,fill){if(fill){doc.setFillColor(fill[0],fill[1],fill[2]);doc.rect(x,y,w,h,'FD');}else doc.rect(x,y,w,h,'S');}
  function put(t,x,y,w,h,o){
    o=o||{};box(x,y,w,h,o.fill);if(t===''||t==null)return;
    const sz=o.sz||7.5;doc.setFont('helvetica',o.b?'bold':'normal');doc.setFontSize(sz);
    const c=o.color||[0,0,0];doc.setTextColor(c[0],c[1],c[2]);
    const lines=doc.splitTextToSize(String(t),Math.max(4,w-1.6)).slice(0,o.max||2);
    const lh=sz*0.3528*1.15;let ty=y+(h-lines.length*lh)/2+lh*0.8;
    for(const ln of lines){if(o.al==='l')doc.text(ln,x+1.2,ty);else doc.text(ln,x+w/2,ty,{align:'center'});ty+=lh;}
  }
  const gh=5,bh=9,hh=gh+bh;
  function colHeader(y0){
    for(const l of [[0,'#'],[1,'Name shop keepers'],[2,'R/W'],[3,'Address/Phone No.'],[LAST,'Remarks']])put(l[1],xs[l[0]],y0,wd[l[0]],hh,{fill:DARK,color:WH,b:true,sz:7.5});
    let i=0;
    while(i<P){const g=cols[i].g;let j=i;while(j+1<P&&cols[j+1].g===g)j++;
      const x=xs[4+i],w=xs[4+j]+wd[4+j]-x;
      if(g==='M')put('MATCH DIVISION',x,y0,w,gh,{fill:LIGHT,b:true,sz:7});else put(GROUPS[g],x,y0,w,gh,{fill:DARK,color:WH,b:true,sz:7.5});
      i=j+1;}
    cols.forEach((p,k)=>put(p.name,xs[4+k],y0+gh,wd[4+k],bh,{fill:LIGHT,b:true,sz:5.8,max:3}));
    return y0+hh;
  }
  const hb=[['Name: '+hdrName(),70,'l'],['Date: '+fmtLong(date),50,'l'],['D.S.R.',57,'t'],['Station: '+hdrStation(date),50,'l'],['Zone: '+(s.zone||''),tw-227,'l']];
  let hx=mx;
  for(const b of hb){if(b[2]==='t')put(b[0],hx,10,b[1],16,{fill:DARK,color:WH,b:true,sz:18});else put(b[0],hx,10,b[1],8,{al:'l',sz:8.5});hx+=b[1];}
  put('Area / Sales Person: '+(s.area||''),mx,18,120,8,{al:'l',sz:8.5});
  put('No.: '+(s.dsrNo||''),mx+177,18,tw-177,8,{al:'l',sz:8.5});
  let y=colHeader(28);const rh=5.2,n=Math.max(25,rows.length);
  for(let i=0;i<n;i++){
    if(y+rh>H-30){doc.addPage();y=colHeader(10);}
    const r=rows[i];
    put(String(i+1),xs[0],y,wd[0],rh,{b:true,sz:7});
    put(r?r.shop:'',xs[1],y,wd[1],rh,{al:'l',sz:7,max:1});
    put(r?r.rw:'',xs[2],y,wd[2],rh,{sz:7});
    put(r?r.addr:'',xs[3],y,wd[3],rh,{al:'l',sz:7,max:1});
    cols.forEach((p,k)=>put(r?cellText(r.cells[p.id]):'',xs[4+k],y,wd[4+k],rh,{sz:6.4}));
    put(r?r.remarks:'',xs[LAST],y,wd[LAST],rh,{al:'l',sz:6.2,max:1});
    y+=rh;
  }
  if(y+30>H-6){doc.addPage();y=10;}
  const lw=wd[0]+wd[1]+wd[2]+wd[3];
  put('Sales (Cartons):',mx,y,lw,6,{al:'l',b:true,sz:8,fill:LIGHT});
  cols.forEach((p,k)=>put(D.sums[k]?fmtC(D.sums[k]):'',xs[4+k],y,wd[4+k],6,{b:true,sz:7.5,fill:LIGHT}));
  put('Total: '+fmtC(D.total)+' Ctn',xs[LAST],y,wd[LAST],6,{al:'l',b:true,sz:8,fill:LIGHT});y+=6;
  put('Closing:',mx,y,lw,6,{al:'l',b:true,sz:8});cols.forEach((p,k)=>put('',xs[4+k],y,wd[4+k],6));put('',xs[LAST],y,wd[LAST],6);y+=6;
  const t=D.stat;put('Visit Summary:',mx,y,lw,7,{al:'l',b:true,sz:8,fill:LIGHT});
  const sw=(xs[LAST]-xs[4])/3;
  [['Total Visits: '+t.total],['Productive: '+t.prod],['Non Productive: '+t.np]].forEach((x,i)=>put(x[0],xs[4]+sw*i,y,sw,7,{b:true,sz:8,fill:LIGHT}));
  put('Productivity: '+Math.round(t.pct)+'%  |  SKU/Call: '+fmt1(t.skuPerCall),xs[LAST],y,wd[LAST],7,{al:'l',b:true,sz:7,fill:LIGHT});y+=11;
  doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(90,90,90);
  doc.text('1) Orders taken        2) New shops opened        3) Check stock position yourself        4) Super / departmental stores visited',mx,Math.min(y,H-6));
  return doc;
}
async function downloadPdf(){
  const date=ST.date;
  if(!dsrVisits(date).length){toast('No visits on this date');return;}
  try{
    const doc=buildPdf(date);const name='DSR_Orders_'+fileStamp(date)+dsrSuffix()+'.pdf';
    const r=await saveBlob(doc.output('blob'),name);if(r==='saved')toast('PDF ready: '+name);
  }catch(e){toast(String(e.message||e));}
}

/* ---------- sample data ---------- */
function loadSample(){
  const s=DB.settings;
  if(!s.name)s.name='Hammad Asi';if(!s.station)s.station='Sheikhupura';if(!s.zone)s.zone='Sheikhupura';if(!s.area)s.area='Main Market';
  const D='2026-10-19';let added=0,i=0;
  const mkShop=(n,rw,a)=>{let sh=DB.shops.find(z=>z.name===n&&z.address===a);if(!sh){sh={id:uid(),name:n,owner:'',phone:'',landmark:'',locality:'',lat:null,lng:null,rw:rw==='R'?'R':'W.S',address:a,station:'Sheikhupura',u:Date.now()};DB.shops.push(sh);}return sh;};
  SAMPLE.forEach(x=>{
    const sh=mkShop(x.n,x.rw,x.a);
    if(!DB.orders.some(o=>o.shopId===sh.id&&o.date===D)){
      const q={};for(const k in x.q)q[k]={c:x.q[k],b:0};
      if(x.n==='Ahmad K S')q.sh={c:0,b:12};
      if(x.n==='Irfan K S')q.sh={c:1,b:10};
      DB.orders.push({id:uid(),shopId:sh.id,date:D,qty:q,st:'P',disc:!!x.d,delivery:x.v||'',remarks:'',ts:Date.now()+(i++),station:'Sheikhupura',uid:myId(),uname:myName()||'Admin',u:Date.now()});added++;
    }
  });
  [['Sample Store (Non Productive)','R','Faisal Bazaar'],['Sample Store 2 (Non Productive)','R','Vanike Chowk']].forEach(x=>{
    const sh=mkShop(x[0],x[1],x[2]);
    if(!DB.orders.some(o=>o.shopId===sh.id&&o.date===D)){DB.orders.push({id:uid(),shopId:sh.id,date:D,qty:{},st:'N',disc:false,delivery:'',remarks:'',ts:Date.now()+(i++),station:'Sheikhupura',uid:myId(),uname:myName()||'Admin',u:Date.now()});added++;}
  });
  save();syncSoon();ST.date=D;ST.planDate=D;toast(added?('Sample loaded: '+added+' visits (19 Oct 2026)'):'Sample already loaded');render();
}

render();initSync();
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){navigator.serviceWorker.register('sw.js').catch(()=>{});}
