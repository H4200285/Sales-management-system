/*
  SALESBYTE SERVER  (Google Apps Script)
  ---------------------------------------------------------------
  1. Open a new Google Sheet. Menu: Extensions > Apps Script.
  2. Delete everything in the editor and paste this whole file.
  3. Change ADMIN_PASSWORD below to your own strong password.
  4. Click Deploy > New deployment > type: Web app.
       Execute as: Me
       Who has access: Anyone
     Click Deploy and allow access when Google asks.
  5. Copy the Web app URL (ends with /exec). Put it in config.js.
  After any later change to this file: Deploy > Manage deployments > edit > New version.
*/
var ADMIN_ID = 'admin';
var ADMIN_PASSWORD = 'CHANGE_ME';

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

/* ===== Google Sheet storage and web entry points ===== */
var SB_COLS={
  users:['id','pass','name','role','stations','active','created','su'],
  shops:['id','name','owner','phone','rw','address','landmark','locality','lat','lng','station','del','u','su'],
  visits:['id','date','shopId','station','uid','uname','st','qty','disc','delivery','remarks','ts','del','u','su'],
  cfg:['id','value','su']
};
function sbSheet_(name){
  var ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName(name),cols=SB_COLS[name];
  if(!sh){
    sh=ss.insertSheet(name);
    sh.getRange(1,1,sh.getMaxRows(),cols.length).setNumberFormat('@');
    sh.getRange(1,1,1,cols.length).setValues([cols]);
    sh.setFrozenRows(1);
  }
  return sh;
}
function sbStore_(){
  return {
    all:function(name){
      var sh=sbSheet_(name),cols=SB_COLS[name],n=sh.getLastRow();
      if(n<2)return [];
      return sh.getRange(2,1,n-1,cols.length).getValues().map(function(r){
        var o={};cols.forEach(function(c,i){o[c]=r[i]==null?'':String(r[i]);});return o;
      });
    },
    put:function(name,objs){
      if(!objs.length)return;
      var sh=sbSheet_(name),cols=SB_COLS[name],n=sh.getLastRow(),idx={},add=[];
      if(n>=2)sh.getRange(2,1,n-1,1).getValues().forEach(function(r,i){idx[String(r[0])]=i+2;});
      objs.forEach(function(o){
        var row=cols.map(function(c){return o[c]==null?'':String(o[c]);});
        if(idx[o.id])sh.getRange(idx[o.id],1,1,cols.length).setValues([row]);else add.push(row);
      });
      if(add.length){
        var start=sh.getLastRow()+1,need=start+add.length-1;
        if(sh.getMaxRows()<need)sh.insertRowsAfter(sh.getMaxRows(),need-sh.getMaxRows()+200);
        sh.getRange(start,1,add.length,cols.length).setNumberFormat('@').setValues(add);
      }
    }
  };
}
function sbSecret_(){
  var p=PropertiesService.getScriptProperties(),s=p.getProperty('SB_SECRET');
  if(!s){s=Utilities.getUuid()+Utilities.getUuid();p.setProperty('SB_SECRET',s);}
  return s;
}
function sbEnv_(){
  var secret=sbSecret_();
  return {
    store:sbStore_(),
    now:function(){return Date.now();},
    adminId:ADMIN_ID,adminPass:ADMIN_PASSWORD,
    hash:function(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8).map(function(b){return ('0'+(b&0xff).toString(16)).slice(-2);}).join('');},
    sign:function(s){return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s,secret));},
    uuid:function(){return Utilities.getUuid();},
    sleep:function(ms){Utilities.sleep(ms);}
  };
}
function doPost(e){
  var lock=LockService.getScriptLock(),res;
  try{
    lock.waitLock(25000);
    res=sbHandle(JSON.parse(e.postData.contents),sbEnv_());
  }catch(err){
    res={ok:false,msg:'Server busy or bad request: '+String(err&&err.message||err)};
  }finally{
    try{lock.releaseLock();}catch(x){}
  }
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}
function doGet(){
  return ContentService.createTextOutput('Salesbyte server is running.').setMimeType(ContentService.MimeType.TEXT);
}
