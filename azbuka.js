/* azbuka.js — the Cyrillic alphabet trainer (letters, drills, reading, sprint) */
/* ================= DATA ================= */
// group: free = same shape+sound as Latin, trap = Latin-looking but different, new = unfamiliar shape
const L = [
 {u:"А",l:"а",lat:"a",name:"а",sound:"ah",eng:"a in father, always short and open",group:"free",w:["адреса","adresa","address"]},
 {u:"Б",l:"б",lat:"b",name:"бе",sound:"b",eng:"b in bed",group:"new",hook:"Not the Latin B — that shape is В and says <b>v</b>. Б has the flag folded over to the left.",w:["брат","brat","brother"]},
 {u:"В",l:"в",lat:"v",name:"ве",sound:"v",eng:"v in very",group:"trap",hook:"Looks like <b>B</b>, says <b>v</b>. Think of <b>В</b>ино — wine, not <i>bino</i>.",w:["вода","voda","water"]},
 {u:"Г",l:"г",lat:"g",name:"ге",sound:"g",eng:"g in go — never the g in gem",group:"new",hook:"A gallows or a table with one leg. Always hard: <b>Г</b>рад = grad, never <i>jrad</i>.",w:["град","grad","city"]},
 {u:"Д",l:"д",lat:"d",name:"де",sound:"d",eng:"d in dog",group:"new",hook:"A little house with two feet. In italic it collapses to something like a Latin <i>g</i>.",w:["дан","dan","day"]},
 {u:"Ђ",l:"ђ",lat:"đ",name:"ђе",sound:"dj",eng:"soft j — the d in British duty, halfway to jeans",group:"new",hook:"Ћ with a belly. The soft pair to Ћ, voiced like <b>Ђ</b>орђе (Djordje).",w:["ђак","đak","pupil"]},
 {u:"Е",l:"е",lat:"e",name:"е",sound:"eh",eng:"e in bed — never ee",group:"free",w:["евро","evro","euro"]},
 {u:"Ж",l:"ж",lat:"ž",name:"же",sound:"zh",eng:"s in measure",group:"new",hook:"A beetle, or a mirrored K on both sides. Buzzy: <b>ж</b>ена = zhena.",w:["жена","žena","woman"]},
 {u:"З",l:"з",lat:"z",name:"зе",sound:"z",eng:"z in zoo",group:"new",hook:"It is a handwritten 3 — and 3 rhymes with z's job here. Not an E.",w:["зима","zima","winter"]},
 {u:"И",l:"и",lat:"i",name:"и",sound:"ee",eng:"i in machine",group:"new",hook:"A backwards N that says <b>ee</b>. The tilted bar climbs toward the ee sound.",w:["има","ima","there is"]},
 {u:"Ј",l:"ј",lat:"j",name:"јот",sound:"y",eng:"y in yes",group:"trap",hook:"Latin J shape, German J sound: <b>Ј</b>угославија = Yugoslavia.",w:["јуче","juče","yesterday"]},
 {u:"К",l:"к",lat:"k",name:"ка",sound:"k",eng:"k in kite",group:"free",w:["кафа","kafa","coffee"]},
 {u:"Л",l:"л",lat:"l",name:"ел",sound:"l",eng:"l in look",group:"new",hook:"A little tent or an upside-down V with a foot. Not an A — it has no crossbar.",w:["лепо","lepo","nice"]},
 {u:"Љ",l:"љ",lat:"lj",name:"ље",sound:"ly",eng:"lli in million",group:"new",hook:"Л tied to a soft sign — one letter, one soft sound. <b>Љ</b>убав = lyubav, love.",w:["љубав","ljubav","love"]},
 {u:"М",l:"м",lat:"m",name:"ем",sound:"m",eng:"m in map",group:"free",w:["мајка","majka","mother"]},
 {u:"Н",l:"н",lat:"n",name:"ен",sound:"n",eng:"n in no",group:"trap",hook:"Looks like <b>H</b>, says <b>n</b>. <b>Н</b>ови Сад is Novi Sad, not Howi Sad.",w:["ноћ","noć","night"]},
 {u:"Њ",l:"њ",lat:"nj",name:"ње",sound:"ny",eng:"ny in canyon",group:"new",hook:"Н tied to a soft sign, same trick as Љ. Ко<b>њ</b> = konj, horse.",w:["књига","knjiga","book"]},
 {u:"О",l:"о",lat:"o",name:"о",sound:"oh",eng:"o in more, short and round",group:"free",w:["око","oko","eye"]},
 {u:"П",l:"п",lat:"p",name:"пе",sound:"p",eng:"p in pen",group:"new",hook:"A doorway or the Greek pi. Not an N and not an R — <b>П</b>иво = pivo, beer.",w:["пиво","pivo","beer"]},
 {u:"Р",l:"р",lat:"r",name:"ер",sound:"r",eng:"a tapped, rolled r as in Spanish pero",group:"trap",hook:"Looks like <b>P</b>, says <b>r</b>. The big one: <b>Р</b>ека = reka, river.",w:["река","reka","river"]},
 {u:"С",l:"с",lat:"s",name:"ес",sound:"s",eng:"s in sun — never the c in city or cat",group:"trap",hook:"Looks like <b>C</b>, says <b>s</b> always. <b>С</b>рбија = Srbija.",w:["срце","srce","heart"]},
 {u:"Т",l:"т",lat:"t",name:"те",sound:"t",eng:"t in top",group:"free",w:["тата","tata","dad"]},
 {u:"Ћ",l:"ћ",lat:"ć",name:"ће",sound:"tch",eng:"soft ch — the t in tune, lighter than Ч",group:"new",hook:"A t with a hat. Soft twin of Ч, and the voiceless partner of Ђ.",w:["кућа","kuća","house"]},
 {u:"У",l:"у",lat:"u",name:"у",sound:"oo",eng:"oo in boot",group:"trap",hook:"Looks like <b>Y</b>, says <b>oo</b>. <b>У</b>лаз = ulaz, entrance.",w:["улица","ulica","street"]},
 {u:"Ф",l:"ф",lat:"f",name:"еф",sound:"f",eng:"f in fun",group:"new",hook:"Greek phi — a circle skewered on a stick. Rare in native words.",w:["фотографија","fotografija","photograph"]},
 {u:"Х",l:"х",lat:"h",name:"ха",sound:"h",eng:"h in hat, breathier — like Scottish loch",group:"trap",hook:"Looks like <b>X</b>, says <b>h</b>. <b>Х</b>вала = hvala, thank you.",w:["хлеб","hleb","bread"]},
 {u:"Ц",l:"ц",lat:"c",name:"це",sound:"ts",eng:"ts in cats",group:"new",hook:"A U with a tail. Never a k or s sound — always <b>ts</b>.",w:["цвеће","cveće","flowers"]},
 {u:"Ч",l:"ч",lat:"č",name:"че",sound:"ch",eng:"ch in church, hard",group:"new",hook:"A wine glass. The hard ch; Ћ is the soft one.",w:["чај","čaj","tea"]},
 {u:"Џ",l:"џ",lat:"dž",name:"џе",sound:"j",eng:"j in judge",group:"new",hook:"Ц with the tail moved to the middle. Voiced partner of Ч.",w:["џеп","džep","pocket"]},
 {u:"Ш",l:"ш",lat:"š",name:"ша",sound:"sh",eng:"sh in shoe",group:"new",hook:"Three prongs, like a shhh-ing hand. <b>Ш</b>ума = shuma, forest.",w:["шума","šuma","forest"]}
];
const ITALIC_SHIFT="бгдпт";

const SETS={
 signs:[["ИЗЛАЗ","izlaz","exit"],["УЛАЗ","ulaz","entrance"],["ОТВОРЕНО","otvoreno","open"],["ЗАТВОРЕНО","zatvoreno","closed"],["ПЕКАРА","pekara","bakery"],["АПОТЕКА","apoteka","pharmacy"],["ПОШТА","pošta","post office"],["БАНКА","banka","bank"],["ПИЈАЦА","pijaca","market"],["СТАНИЦА","stanica","station"],["АЕРОДРОМ","aerodrom","airport"],["ТОАЛЕТ","toalet","toilet"],["ЗАБРАЊЕНО","zabranjeno","forbidden"],["ПАРКИНГ","parking","parking"],["БОЛНИЦА","bolnica","hospital"],["ПОЛИЦИЈА","policija","police"],["РЕСТОРАН","restoran","restaurant"],["КЊИЖАРА","knjižara","bookshop"],["МЕЊАЧНИЦА","menjačnica","currency exchange"],["ПРОДАВНИЦА","prodavnica","shop"]],
 words:[["хвала","hvala","thank you"],["здраво","zdravo","hello"],["молим","molim","please"],["вода","voda","water"],["кафа","kafa","coffee"],["пиво","pivo","beer"],["хлеб","hleb","bread"],["сир","sir","cheese"],["месо","meso","meat"],["риба","riba","fish"],["јабука","jabuka","apple"],["новац","novac","money"],["карта","karta","ticket"],["воз","voz","train"],["аутобус","autobus","bus"],["улица","ulica","street"],["кућа","kuća","house"],["пријатељ","prijatelj","friend"],["љубав","ljubav","love"],["срце","srce","heart"],["сунце","sunce","sun"],["месец","mesec","month, moon"],["планина","planina","mountain"],["ђубре","đubre","rubbish"],["џемпер","džemper","jumper"],["чаша","čaša","glass"],["шећер","šećer","sugar"],["цвеће","cveće","flowers"],["жена","žena","woman"],["човек","čovek","man"],["Београд","Beograd","Belgrade"],["Србија","Srbija","Serbia"],["Нови Сад","Novi Sad","Novi Sad"]],
 phrases:[["Добро јутро","Dobro jutro","Good morning"],["Добар дан","Dobar dan","Good day"],["Лаку ноћ","Laku noć","Good night"],["Довиђења","Doviđenja","Goodbye"],["Како сте?","Kako ste?","How are you?"],["Колико кошта?","Koliko košta?","How much does it cost?"],["Не разумем","Ne razumem","I don't understand"],["Говорите ли енглески?","Govorite li engleski?","Do you speak English?"],["Извините, молим вас","Izvinite, molim vas","Excuse me, please"],["Где је станица?","Gde je stanica?","Where is the station?"],["Једно пиво, молим","Jedno pivo, molim","One beer, please"],["Хвала лепо","Hvala lepo","Thank you kindly"],["Живели!","Živeli!","Cheers!"],["Драго ми је","Drago mi je","Pleased to meet you"],["Молим вас, рачун","Molim vas, račun","The bill, please"]]
};

/* ================= STATE ================= */
const KEY="azbuka.v1";
const byU={}; L.forEach(x=>byU[x.u]=x);
const CONFUSE={"В":["Б","Р","Н"],"Н":["В","И","П"],"Р":["П","Г","В"],"С":["Ц","Е","О"],
 "У":["Ч","Ц","Х"],"Х":["Ж","К","Ч"],"Ј":["И","Љ","Ћ"],"Ћ":["Ђ","Ч","Џ"],"Ђ":["Ћ","Џ","Ч"],
 "Ч":["Ћ","Џ","Ц"],"Џ":["Ц","Ч","Ш"],"Ц":["Џ","Ч","С"],"Љ":["Њ","Л","Ђ"],"Њ":["Љ","Н","И"],
 "Ш":["Ц","Ж","Ч"],"Ж":["Ш","Х","Ч"],"И":["Н","Л","П"],"Б":["В","Ђ","Р"],
 "Г":["Т","П","Р"],"Д":["Л","Б","Ђ"],"Л":["Д","И","Њ"],"П":["Н","Г","И"],"З":["Е","С","Ж"]};
Object.keys(CONFUSE).forEach(k=>CONFUSE[k]=CONFUSE[k].filter(x=>byU[x]));

function blank(){const st={};L.forEach(x=>st[x.u]={n:0,c:0,run:0,ms:0});
  return{st,words:0,best:0,day:"",days:0,total:0,hits:0};}
let S=load();
function load(){try{const r=JSON.parse(localStorage.getItem(KEY));if(!r||!r.st)return blank();
  const b=blank();L.forEach(x=>{if(r.st[x.u])b.st[x.u]=r.st[x.u]});
  return Object.assign(b,{words:r.words|0,best:r.best||0,day:r.day||"",days:r.days|0,total:r.total|0,hits:r.hits|0});
  }catch(e){return blank()}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function today(){return new Date().toISOString().slice(0,10)}
function touchDay(){const t=today();if(S.day===t)return;
  const y=new Date(Date.now()-864e5).toISOString().slice(0,10);
  S.days = (S.day===y)?S.days+1:1; S.day=t; save();}
function level(u){const s=S.st[u];if(!s||!s.n)return 0;
  const acc=s.c/s.n, fast=s.ms&&s.ms<2200;
  let lv=Math.min(5,s.run);
  if(acc<.7)lv=Math.min(lv,2);
  if(lv>=4&&!fast)lv=4;
  return lv;}
function fluency(){
  const know=L.reduce((a,x)=>a+level(x.u)/5,0)/L.length;
  const pace=Math.min(1,S.best/60);
  return Math.round((know*.75+pace*.25)*100);}

/* ================= HELPERS ================= */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function fold(s){return s.toLowerCase().replace(/đ/g,"dj").replace(/ž/g,"z").replace(/š/g,"s")
  .replace(/č/g,"c").replace(/ć/g,"c").replace(/[^a-z]/g,"");}
function translit(s){let o="";for(const ch of s){const up=ch.toUpperCase();
  const e=byU[up]; if(!e){o+=ch;continue;} o+= (ch===up? e.lat.charAt(0).toUpperCase()+e.lat.slice(1) : e.lat);}
  return o;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function pickLetter(){
  const w=L.map(x=>({x,w:Math.pow(6-level(x.u),2)+1}));
  const tot=w.reduce((a,b)=>a+b.w,0); let r=Math.random()*tot;
  for(const it of w){r-=it.w;if(r<=0)return it.x} return L[0];}
function distractors(e,n){
  const pool=[...(CONFUSE[e.u]||[])].map(u=>byU[u]);
  shuffle(pool);
  const out=pool.slice(0,n);
  const rest=shuffle(L.filter(x=>x!==e&&!out.includes(x)));
  while(out.length<n)out.push(rest.pop());
  return out;}
function record(u,ok,ms,cap){
  const s=S.st[u]; s.n++; S.total++;
  if(ok){s.c++;S.hits++;
    if(!cap||s.run<cap)s.run++;
    if(!cap)s.ms=s.ms?Math.round(s.ms*.7+ms*.3):ms;
  }else{s.run=0}
  touchDay(); save();}
let voice=null;
function say(text){
  if(!("speechSynthesis" in window))return;
  const vs=speechSynthesis.getVoices();
  voice=vs.find(v=>/^(sr|hr|bs|sh)/i.test(v.lang))||voice;
  const u=new SpeechSynthesisUtterance(text);
  u.lang=voice?voice.lang:"sr-RS"; if(voice)u.voice=voice; u.rate=.85;
  speechSynthesis.cancel(); speechSynthesis.speak(u);}
if("speechSynthesis" in window)speechSynthesis.onvoiceschanged=()=>{};

/* ================= LEARN ================= */
function cell(e){
  const lv=level(e.u);
  return '<button class="cell '+e.group+'" data-u="'+e.u+'" aria-label="'+e.u+', '+e.sound+'">'+
    '<span class="gl">'+e.u+e.l+'</span><span class="tr">'+e.lat+'</span>'+
    '<span class="bar" style="width:'+(lv/5*100)+'%"></span></button>';}
function paintLearn(){
  $("#g-free").innerHTML=L.filter(x=>x.group==="free").map(cell).join("");
  $("#g-trap").innerHTML=L.filter(x=>x.group==="trap").map(cell).join("");
  $("#g-new").innerHTML=L.filter(x=>x.group==="new").map(cell).join("");
  $("#g-all").innerHTML=L.map(cell).join("");}
document.addEventListener("click",ev=>{
  const c=ev.target.closest(".cell"); if(!c)return; openSheet(byU[c.dataset.u]);});
function openSheet(e){
  const ital = ITALIC_SHIFT.includes(e.l) ? '<span class="ital">'+e.l+'</span>' : '';
  $("#sheetInner").innerHTML='<div class="grip"></div>'+
   '<div class="bigrow"><span class="caps">'+e.u+'</span><span class="lc">'+e.l+'</span>'+ital+
   '<button class="saybtn" data-say="'+e.w[0]+'">▶ Hear it</button></div>'+
   '<div class="latinline"><span>writes as</span><b>'+e.lat+'</b></div>'+
   '<dl class="deftable"><dt>Sound</dt><dd>'+e.sound+'</dd>'+
   '<dt>As in</dt><dd>'+e.eng+'</dd><dt>Letter name</dt><dd>'+e.name+'</dd>'+
   '<dt>Strength</dt><dd>'+["not started","shaky","learning","getting there","nearly automatic","automatic"][level(e.u)]+'</dd></dl>'+
   (e.hook?'<div class="hook">'+e.hook+'</div>':'')+
   '<div class="exword"><span class="cy">'+e.w[0]+'</span><span class="rom">'+e.w[1]+'</span><span class="en">'+e.w[2]+'</span></div>'+
   (ital?'<p class="note">In italic and handwriting this letter changes shape — the third form above is what you meet in print italics.</p>':'')+
   '<button class="btn ghost" id="sheetClose" style="margin-top:18px">Close</button>';
  $("#sheet").classList.add("on");}
$("#sheet").addEventListener("click",ev=>{
  const b=ev.target.closest("[data-say]");
  if(b){say(b.dataset.say);return;}
  if(ev.target.closest("#sheetClose")){$("#sheet").classList.remove("on");return;}
  if(ev.target.id==="sheet")$("#sheet").classList.remove("on");});
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#sheet").classList.remove("on")});

/* ================= DRILL ================= */
let dDir="c2l", dCur=null, dT0=0, dLock=false, dRun=0, dN=0, dOK=0, dMs=[];
function newDrill(){
  dLock=false; $("#d-feedback").innerHTML="";
  const e=pickLetter(); dCur=e;
  const dir = dDir==="mix" ? (Math.random()<.5?"c2l":"l2c") : dDir;
  const opts=shuffle([e,...distractors(e,3)]);
  const P=$("#d-prompt");
  if(dir==="c2l"){
    $("#d-label").textContent="Which sound?";
    P.className="prompt"; P.textContent=e.u+" "+e.l;
    $("#d-sub").textContent="";
    $("#d-opts").innerHTML=opts.map(o=>'<button class="opt tr" data-u="'+o.u+'">'+o.lat+'<div style="font-size:11px;font-family:Golos Text,sans-serif;color:var(--muted);font-weight:400;margin-top:2px">'+o.sound+'</div></button>').join("");
  }else{
    $("#d-label").textContent="Which letter?";
    P.className="prompt mono"; P.textContent=e.lat;
    $("#d-sub").textContent="sounds like “"+e.sound+"”";
    $("#d-opts").innerHTML=opts.map(o=>'<button class="opt cy" data-u="'+o.u+'">'+o.u+" "+o.l+'</button>').join("");
  }
  dT0=performance.now();}
$("#d-opts").addEventListener("click",ev=>{
  const b=ev.target.closest(".opt"); if(!b||dLock)return; dLock=true;
  const ms=performance.now()-dT0, ok=b.dataset.u===dCur.u;
  record(dCur.u,ok,ms); dN++;
  if(ok){dOK++;dRun++;dMs.push(ms);if(dMs.length>10)dMs.shift();
    b.classList.add("right");
    $("#d-feedback").innerHTML='<span class="ok">'+dCur.u+' = '+dCur.lat+'</span> · '+(ms/1000).toFixed(1)+'s';
  }else{
    dRun=0; b.classList.add("wrong");
    $$("#d-opts .opt").forEach(o=>{if(o.dataset.u===dCur.u)o.classList.add("right")});
    $("#d-feedback").innerHTML='<span class="no">'+dCur.u+dCur.l+' is '+dCur.lat+'</span> — '+dCur.eng;
  }
  $$("#d-opts .opt").forEach(o=>o.disabled=true);
  updDrill();
  setTimeout(newDrill, ok?620:2900);});
function updDrill(){
  $("#d-run").textContent=dRun;
  $("#d-acc").textContent=dN?Math.round(dOK/dN*100)+"%":"—";
  $("#d-ms").textContent=dMs.length?(dMs.reduce((a,b)=>a+b,0)/dMs.length/1000).toFixed(1)+"s":"—";}
$$(".segmented [data-dir]").forEach(b=>b.addEventListener("click",()=>{
  $$(".segmented [data-dir]").forEach(x=>x.setAttribute("aria-pressed",x===b));
  dDir=b.dataset.dir; newDrill();}));

/* ================= READ ================= */
let rSet="signs", rCur=null, rShown=false;
function newRead(){
  rShown=false;
  const pool=SETS[rSet];
  let pick=pool[Math.random()*pool.length|0];
  if(rCur&&pool.length>1){let g=0;while(pick[0]===rCur[0]&&g++<6)pick=pool[Math.random()*pool.length|0];}
  rCur=pick;
  const w=$("#r-word"); w.textContent=pick[0];
  w.className="readword"+(pick[0].length>10?" long":"");
  $("#r-meta").textContent="Read it aloud, then type it in Latin letters";
  $("#r-answer").textContent=""; $("#r-gloss").textContent=""; $("#r-trace").innerHTML="";
  $("#r-input").value=""; $("#r-next").textContent="Check";}
function revealRead(scored){
  if(rShown)return; rShown=true;
  $("#r-answer").textContent=rCur[1];
  $("#r-gloss").textContent=rCur[2];
  $("#r-trace").innerHTML=[...rCur[0]].filter(c=>byU[c.toUpperCase()])
    .map(c=>{const e=byU[c.toUpperCase()];return '<span><b>'+c+'</b> '+e.lat+'</span>'}).join("");
  $("#r-next").textContent="Next";
  if(scored){
    S.words++; [...rCur[0]].forEach(c=>{const e=byU[c.toUpperCase()];if(e)record(e.u,true,0,3)});
    save();
  }
  say(rCur[0]);}
$("#r-next").addEventListener("click",()=>{
  if(rShown){newRead();return;}
  const typed=$("#r-input").value.trim();
  if(!typed){revealRead(false);$("#r-meta").textContent="Answer shown — no credit this time";return;}
  const ok=fold(typed)===fold(rCur[1]);
  $("#r-meta").innerHTML = ok
    ? '<span style="color:var(--good);font-weight:600">Correct — you read it.</span>'
    : '<span style="color:var(--bad);font-weight:600">Not quite. You wrote “'+typed.replace(/[<>&]/g,"")+'”.</span>';
  revealRead(ok);});
$("#r-reveal").addEventListener("click",()=>{revealRead(false);$("#r-meta").textContent="Answer shown — no credit this time";});
$("#r-input").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("#r-next").click()}});
$$(".segmented [data-set]").forEach(b=>b.addEventListener("click",()=>{
  $$(".segmented [data-set]").forEach(x=>x.setAttribute("aria-pressed",x===b));
  rSet=b.dataset.set; rCur=null; newRead();}));

/* ================= SPRINT ================= */
let sOn=false,sLeft=60,sScore=0,sTimer=null,sCur=null,sT0=0;
function sprintQ(){
  const e=pickLetter(); sCur=e; sT0=performance.now();
  $("#s-label").textContent="Which sound?";
  $("#s-prompt").textContent=e.u+" "+e.l;
  $("#s-sub").textContent="";
  $("#s-opts").innerHTML=shuffle([e,...distractors(e,3)])
    .map(o=>'<button class="opt tr" data-u="'+o.u+'">'+o.lat+'</button>').join("");}
$("#s-opts").addEventListener("click",ev=>{
  const b=ev.target.closest(".opt"); if(!b||!sOn)return;
  const ok=b.dataset.u===sCur.u;
  record(sCur.u,ok,performance.now()-sT0);
  if(ok){sScore++}else{
    b.classList.add("wrong");
    $$("#s-opts .opt").forEach(o=>{if(o.dataset.u===sCur.u)o.classList.add("right")});}
  $("#s-score").textContent=sScore;
  if(ok)sprintQ(); else{$$("#s-opts .opt").forEach(o=>o.disabled=true);setTimeout(()=>{if(sOn)sprintQ()},900);}});
$("#s-start").addEventListener("click",()=>{
  if(sOn){endSprint();return;}
  sOn=true; sLeft=60; sScore=0;
  $("#s-score").textContent="0"; $("#s-start").textContent="Stop early";
  $("#s-start").classList.add("ghost");
  sprintQ();
  sTimer=setInterval(()=>{
    sLeft--; $("#s-time").textContent=sLeft;
    if(sLeft<=0)endSprint(true);},1000);});
function endSprint(full){
  clearInterval(sTimer); sOn=false;
  const pace=sScore; // correct letters recognised in 60 seconds
  if(full&&pace>S.best){S.best=pace}
  save();
  $("#s-time").textContent="60";
  $("#s-label").textContent="Time";
  $("#s-prompt").textContent=sScore;
  $("#s-sub").innerHTML= full
    ? ("letters in a minute · "+(pace>=60?"faster than one a second — that is automatic":Math.round(pace/60*100)+"% of the way to one a second"))
    : "stopped early · only a full minute counts for your record";
  $("#s-opts").innerHTML="";
  $("#s-start").textContent="Run it again"; $("#s-start").classList.remove("ghost");
  $("#s-best").textContent=S.best?S.best:"—";
  paintProg(); paintLearn();}

/* ================= PROGRESS ================= */
function heatColor(lv){
  if(lv===0)return "var(--surface)";
  return "color-mix(in srgb, var(--brand) "+(lv*17)+"%, var(--brand-soft))";}
function paintProg(){
  const f=fluency();
  $("#p-pct").textContent=f+"%";
  $("#p-arc").style.strokeDashoffset=264-264*f/100;
  $("#p-lbl").textContent = f<15?"Reading fluency · just starting"
    : f<40?"Reading fluency · shapes are landing"
    : f<70?"Reading fluency · you can decode most things"
    : f<92?"Reading fluency · close to effortless"
    : "Reading fluency · you read it like English";
  $("#p-mastered").textContent=L.filter(x=>level(x.u)>=4).length+"/30";
  $("#p-words").textContent=S.words;
  $("#p-pace").textContent=S.best||"—";
  $("#p-heat").innerHTML=L.map(e=>{const lv=level(e.u);
    return '<div class="hcell" style="background:'+heatColor(lv)+';'+(lv>=4?'border-color:var(--brand);color:var(--bg)':'')+'">'+
      e.u+'<small>'+e.lat+'</small></div>';}).join("");
  const weak=[...L].sort((a,b)=>level(a.u)-level(b.u)||(S.st[b.u].n-S.st[a.u].n)).slice(0,5);
  $("#p-weak").innerHTML=weak.map(cell).join("");
  const chip=$("#streakChip"); // header chip belongs to the shell now; may be absent
  if(chip)chip.textContent = S.days>1 ? S.days+"-day streak" : (S.total? "day 1" : "start today");}
$("#p-reset").addEventListener("click",()=>{
  if(!confirm("Erase every letter score, streak and sprint record on this device?"))return;
  S=blank(); save(); paintLearn(); paintProg(); updDrill();});

/* ================= EXPORTS ================= */
// game.js owns the shell: it calls these when the Ћирилица tab or one of its
// sub-modes becomes visible, and reads AZ.fluency() for the shared dashboard.
window.AZ = {
  paintLearn, paintProg, newDrill, newRead, updDrill, endSprint, fluency, say, translit,
  get state(){ return S; },
  get running(){ return sOn; },
  get hasDrill(){ return !!dCur; },
  get hasRead(){ return !!rCur; },
  init(){ paintLearn(); paintProg(); newDrill(); newRead(); updDrill();
          $("#s-best").textContent = S.best || "—"; }
};
