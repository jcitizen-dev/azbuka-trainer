/* game.js — Padež Challenge, Vocab Quiz and the app shell.
 * Reads VOCAB from vocab.js and drives the alphabet app through window.AZ.
 */
(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const el=(t,c,h)=>{const n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n;};
const rnd=a=>a[Math.random()*a.length|0];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]));

/* ================================ CASES ================================ */
const CASES=[
 {k:"nominative", sr:"Nominativ",   en:"Nominative",   q:"ko? šta?",        use:"The subject — who or what is doing something."},
 {k:"genitive",   sr:"Genitiv",     en:"Genitive",     q:"koga? čega?",     use:"Possession, absence, quantity, and after od, iz, do, bez, pored, blizu, tokom."},
 {k:"dative",     sr:"Dativ",       en:"Dative",       q:"kome? čemu?",     use:"The recipient — who you give, write or say something to. Also after prema, ka."},
 {k:"accusative", sr:"Akuzativ",    en:"Accusative",   q:"koga? šta?",      use:"The direct object, and movement into somewhere: u, na, kroz, za."},
 {k:"vocative",   sr:"Vokativ",     en:"Vocative",     q:"—",               use:"Calling or addressing someone directly."},
 {k:"instrumental",sr:"Instrumental",en:"Instrumental",q:"s kim? čime?",    use:"The tool you use, or the company you keep: sa, s."},
 {k:"locative",   sr:"Lokativ",     en:"Locative",     q:"o kome? o čemu? gde?", use:"Where something is, or the topic you are talking about: u, na, o, po."}
];
const CASE_BY_KEY={}; CASES.forEach(c=>CASE_BY_KEY[c.k]=c);
// accept either language, plus the short forms people actually type
const CASE_ALIASES={};
CASES.forEach(c=>{
  [c.sr,c.en,c.k,c.sr.slice(0,3),c.en.slice(0,3)].forEach(a=>CASE_ALIASES[a.toLowerCase()]=c.k);
});
["gen","dat","akuz","acc","nom","vok","voc","instr","lok","loc"].forEach(a=>{
  const hit=CASES.find(c=>c.k.startsWith(a)||c.sr.toLowerCase().startsWith(a));
  if(hit)CASE_ALIASES[a]=hit.k;
});

/* ============================ VOCAB INDEXES ============================ */
const BY_WORD={}; VOCAB.forEach(v=>BY_WORD[v.word]=v);
const NOUNS=VOCAB.filter(v=>v.type==="noun"&&v.practice!==false);
const QUIZZABLE=VOCAB.filter(v=>v.practice!==false&&v.en&&v.type!=="unclear");
const has=(w,t)=>(BY_WORD[w]&&(BY_WORD[w].tags||[]).includes(t));
const pool=t=>NOUNS.filter(n=>(n.tags||[]).includes(t));
const words=list=>list.map(w=>BY_WORD[w]).filter(Boolean);

// Sentence frames use hand-picked pools so every generated sentence is natural.
const POOLS={
  uPlace:  words(["zemlja","selo","zgrada","država","prodavnica","pozorište","kuhinja","kupatilo",
                  "trpezarija","vešernica","dvorište","hram","inostranstvo","dom"]),
  naPlace: words(["posao","žurka","sajam","izložba","planina","terasa","igralište","letovalište",
                  "takmičenje","odmor"]),
  dwelling:words(["zemlja","selo","zgrada","država","inostranstvo","ulica","kuhinja"]),
  workplace:words(["prodavnica","pozorište","kuhinja","železnica","trpezarija","inostranstvo","zgrada"]),
  origin:  words(["zemlja","država","selo","inostranstvo","prodavnica","kuhinja","pozorište"]),
  through: words(["zemlja","država","selo","ulica","planina","svet","dvorište"]),
  person:  pool("person"),
  animal:  pool("animal"),
  buyable: NOUNS.filter(n=>(n.tags||[]).some(t=>["clothing","food","thing"].includes(t))),
  concrete:NOUNS.filter(n=>(n.tags||[]).some(t=>["thing","clothing","food","animal","place"].includes(t))),
  any:     NOUNS.filter(n=>n.number!=="plural")
};

const FRAMES=[
 {s:"Idem u ___.",          c:"accusative",  p:"uPlace",   why:"Akuzativ — <b>u</b> + accusative for movement into a place."},
 {s:"Idem na ___.",         c:"accusative",  p:"naPlace",  why:"Akuzativ — <b>na</b> + accusative for movement onto or to an event."},
 {s:"Živim u ___.",         c:"locative",    p:"dwelling", why:"Lokativ — <b>u</b> + locative for where you are, with no movement."},
 {s:"Radim u ___.",         c:"locative",    p:"workplace",why:"Lokativ — a static location takes the locative."},
 {s:"Bio sam na ___.",      c:"locative",    p:"naPlace",  why:"Lokativ — <b>na</b> + locative once you are already there."},
 {s:"Pričam o ___.",        c:"locative",    p:"any",      why:"Lokativ — <b>o</b> (about) always takes the locative."},
 {s:"Nemam ___.",           c:"genitive",    p:"concrete", why:"Genitiv — a negated verb takes the genitive instead of the accusative."},
 {s:"Ovo je od ___.",       c:"genitive",    p:"any",      why:"Genitiv — <b>od</b> always takes the genitive."},
 {s:"Dolazim iz ___.",      c:"genitive",    p:"origin",   why:"Genitiv — <b>iz</b> (out of, from) takes the genitive."},
 {s:"Blizu ___ je park.",   c:"genitive",    p:"uPlace",   why:"Genitiv — <b>blizu</b> governs the genitive."},
 {s:"Bojim se ___.",        c:"genitive",    p:"animal",   why:"Genitiv — <b>bojati se</b> (to be afraid of) takes the genitive."},
 {s:"Vidim ___.",           c:"accusative",  p:"concrete", why:"Akuzativ — the direct object of a transitive verb."},
 {s:"Kupujem ___.",         c:"accusative",  p:"buyable",  why:"Akuzativ — the direct object of <b>kupovati</b>."},
 {s:"Putujem kroz ___.",    c:"accusative",  p:"through",  why:"Akuzativ — <b>kroz</b> always takes the accusative."},
 {s:"Idem sa ___.",         c:"instrumental",p:"person",   why:"Instrumental — <b>sa</b> + instrumental for the company you keep."},
 {s:"Pišem ___ pismo.",     c:"dative",      p:"person",   why:"Dativ — the person who receives something."},
 {s:"Zdravo, ___!",         c:"vocative",    p:"person",   why:"Vokativ — you are addressing the person directly."},
 {s:"Ovo je ___.",          c:"nominative",  p:"any",      why:"Nominativ — the plain dictionary form after <b>je</b>."}
];

/* ============================== PROGRESS ============================== */
const KEY="padez.v1";
function blank(){return{xp:0,n:0,c:0,streak:0,best:0,srs:{},badges:[],pat:{},seen:{},due:[],vq:{n:0,c:0,streak:0}};}
let P=load();
function load(){try{const r=JSON.parse(localStorage.getItem(KEY));if(!r)return blank();
  return Object.assign(blank(),r,{srs:r.srs||{},pat:r.pat||{},seen:r.seen||{},due:r.due||[],vq:r.vq||{n:0,c:0,streak:0}});
  }catch(e){return blank()}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}}
const srsKey=(w,c)=>w+"|"+c;
function srs(w,c){const k=srsKey(w,c);return P.srs[k]||(P.srs[k]={n:0,c:0,run:0});}
const level=()=>Math.floor(P.xp/100)+1;
const levelPct=()=>P.xp%100;
const accuracy=()=>P.n?Math.round(P.c/P.n*100):null;
const mastered=(w,c)=>{const s=P.srs[srsKey(w,c)];return s&&s.run>=3;};

const BADGES=[
 {id:"prvi",   em:"🌱", nm:"Prvi koraci",  test:()=>P.c>=10,  hint:"10 correct answers"},
 {id:"hot",    em:"🔥", nm:"Hot Streak",   test:()=>P.best>=10,hint:"10 in a row"},
 {id:"vatra",  em:"🎆", nm:"Vatromet",     test:()=>P.best>=25,hint:"25 in a row"},
 {id:"stotka", em:"💯", nm:"Stotka",       test:()=>P.c>=100, hint:"100 correct answers"},
 {id:"tacan",  em:"🎯", nm:"Precizan",     test:()=>P.n>=50&&P.c/P.n>=.9, hint:"90% over 50 questions"},
 {id:"recnik", em:"📖", nm:"Rečnik",       test:()=>Object.keys(P.seen).length>=75, hint:"75 different words"},
 {id:"sedam",  em:"🏛", nm:"Svih sedam",   test:()=>CASES.every(c=>caseCorrect(c.k)>=5), hint:"5 right in every case"},
 {id:"master", em:"👑", nm:"Padež Master", test:()=>CASES.every(c=>caseCorrect(c.k)>=15), hint:"15 right in every case"}
];
function caseCorrect(ck){let n=0;for(const k in P.srs){if(k.endsWith("|"+ck))n+=P.srs[k].c;}return n;}
function checkBadges(){
  const fresh=[];
  BADGES.forEach(b=>{if(!P.badges.includes(b.id)&&b.test()){P.badges.push(b.id);fresh.push(b)}});
  return fresh;
}

/* ============================== SCORING ============================== */
function score(ok,word,caseKey){
  P.n++;
  if(word)P.seen[word]=1;
  if(ok){
    P.c++; P.streak++; if(P.streak>P.best)P.best=P.streak;
    P.xp+=10+(P.streak%5===0?5:0);
  }else{ P.streak=0; }
  if(word&&caseKey){
    const s=srs(word,caseKey); s.n++;
    if(ok){s.c++;s.run++; queueHit(word,caseKey);} else {s.run=0; queueMiss(word,caseKey);}
    recent.push(srsKey(word,caseKey));
    if(recent.length>3)recent.shift();
  }
  save();
  paintMeters();
  return checkBadges();
}
function paintMeters(){
  const lv=level();
  if($("#xp-level"))$("#xp-level").textContent="Level "+lv;
  if($("#xp-text"))$("#xp-text").textContent=levelPct()+" / 100 XP";
  if($("#xp-fill"))$("#xp-fill").style.width=levelPct()+"%";
  if($("#ch-streak"))$("#ch-streak").innerHTML="🔥 <b>"+P.streak+"</b>";
  if($("#ch-acc"))$("#ch-acc").innerHTML="🎯 <b>"+(accuracy()===null?"—":accuracy()+"%")+"</b>";
  if($("#ch-count"))$("#ch-count").innerHTML="📚 <b>"+Object.keys(P.seen).length+"</b>";
  if($("#vq-streak"))$("#vq-streak").innerHTML="🔥 <b>"+P.vq.streak+"</b>";
  if($("#vq-acc"))$("#vq-acc").innerHTML="🎯 <b>"+(P.vq.n?Math.round(P.vq.c/P.vq.n*100)+"%":"—")+"</b>";
  const st=$("#statsBtn");
  if(st)st.textContent = P.streak>0 ? "🔥 "+P.streak : (level()>1?"Level "+level():"stats");
}

/* ============================ ANSWER CHECK ============================ */
const FOLD={"č":"c","ć":"c","š":"s","ž":"z","đ":"dj"};
function fold(s){return String(s).toLowerCase().replace(/[čćšžđ]/g,c=>FOLD[c]);}
function norm(s){
  return String(s).toLowerCase().trim()
    .replace(/[.,!?;:"'`]/g,"").replace(/\s+/g," ");
}
function forms(v,ck){const f=v.cases[ck];return Array.isArray(f)?f:[f];}
function judge(input,v,ck){
  const given=norm(input);
  if(!given)return{state:"empty"};
  const want=forms(v,ck).map(norm);
  if(want.includes(given))return{state:"right"};
  if(want.map(fold).includes(fold(given)))return{state:"right",diacritics:true};
  // did they give a real form of this word, just the wrong case?
  for(const c of CASES){
    if(c.k===ck)continue;
    if(forms(v,c.k).map(norm).map(fold).includes(fold(given)))return{state:"wrong",gave:c};
  }
  return{state:"wrong"};
}

/* ============================ EXPLANATIONS ============================ */
function patternKey(v,ck){return v.gender+"|"+(v.animacy==="animate"?"anim":"inan")+"|"+ck;}
function explain(v,ck){
  const g=v.gender, a=v.animacy==="animate", w=v.word;
  const femA=g==="feminine"&&w.endsWith("a");
  const femI=g==="feminine"&&!w.endsWith("a");
  if(v.number==="plural")return "This noun exists only in the plural, so its cases are plural forms.";
  switch(ck){
    case "nominative": return "The nominative is the dictionary form — nothing changes.";
    case "genitive":
      if(femA)return "Feminine nouns in <b>-a</b> take <b>-e</b> in the genitive singular.";
      if(femI)return "Feminine i-stem nouns take <b>-i</b> in the genitive.";
      if(g==="neuter")return "Neuter nouns take <b>-a</b> in the genitive singular.";
      return "Masculine nouns take <b>-a</b> in the genitive singular.";
    case "dative": case "locative":
      if(femA)return "Feminine nouns in <b>-a</b> take <b>-i</b>, and a final <b>k, g, h</b> softens to <b>c, z, s</b> (reka → reci).";
      if(femI)return "Feminine i-stem nouns take <b>-i</b> here, same as the genitive.";
      return "Masculine and neuter nouns take <b>-u</b> in the dative and locative.";
    case "accusative":
      if(femA)return "Feminine nouns in <b>-a</b> take <b>-u</b> in the accusative.";
      if(femI)return "Feminine i-stem nouns are unchanged in the accusative.";
      if(g==="neuter")return "Neuter nouns are unchanged in the accusative.";
      return a? "Masculine <b>animate</b> nouns borrow the genitive form in the accusative."
              : "Masculine <b>inanimate</b> nouns are unchanged in the accusative.";
    case "vocative":
      if(femA)return w.endsWith("ica")? "Feminine nouns in <b>-ica</b> take <b>-e</b> in the vocative."
                                      : "Feminine nouns in <b>-a</b> take <b>-o</b> in the vocative.";
      if(femI)return "Feminine i-stem nouns take <b>-i</b> in the vocative.";
      if(g==="neuter")return "Neuter nouns keep the nominative form in the vocative.";
      return "Masculine nouns take <b>-e</b>, or <b>-u</b> after a soft consonant; <b>k, g, h</b> palatalize (vojnik → vojniče).";
    case "instrumental":
      if(femA)return "Feminine nouns in <b>-a</b> take <b>-om</b> in the instrumental.";
      if(femI)return "Feminine i-stem nouns take <b>-ju</b> (or plain <b>-i</b>): ljubav → ljubavlju.";
      return "Masculine and neuter take <b>-om</b>, or <b>-em</b> after a soft consonant (pisac → piscem).";
  }
  return "";
}

/* ========================= QUESTION GENERATION ========================= */
function weight(v,ck){
  const s=P.srs[srsKey(v.word,ck)];
  const wrong = s ? Math.max(0,s.n-s.c) : 0;
  let w;
  if(!s)              w = 2;                      // new material
  else if(s.run>=3)   w = 0.35;                   // solid — keep it ticking over
  else if(wrong)      w = 5 + 3*wrong;            // missed: outranks everything else
  else                w = 1.2;                    // seen, right, not solid yet
  if(ck==="nominative")w*=0.4;                                  // too easy to be worth much
  if(ck==="vocative"&&!(v.tags||[]).some(t=>t==="person"||t==="animal"))w*=0.5;
  return w;
}
let recent=[], reviewMode=false, reviewCleared=false;
function queueMiss(w,ck){
  const k=srsKey(w,ck);
  P.due=P.due.filter(x=>x!==k); P.due.push(k);
  if(P.due.length>40)P.due.shift();
  save();
}
function queueHit(w,ck){
  const k=srsKey(w,ck), s=srs(w,ck);
  if(!P.due.includes(k))return;
  P.due=P.due.filter(x=>x!==k);
  if(s.run<2)P.due.push(k);                       // right once is not learned yet
  save();
}
function fromQueue(){
  // drawn at random, never in queue order, so a second pass through your
  // mistakes is not the same run of questions again
  const valid=P.due.filter(k=>{
    const w=k.split("|")[0];
    return BY_WORD[w]&&BY_WORD[w].cases;
  });
  // keep the last few off the table so a short queue does not loop on itself
  let eligible=valid.filter(k=>!recent.includes(k));
  if(!eligible.length)eligible=valid.filter(k=>k!==recent[recent.length-1]);
  if(!eligible.length)eligible=valid;
  if(!eligible.length)return null;
  const [w,ck]=rnd(eligible).split("|");
  return {v:BY_WORD[w],ck};
}
function pickPair(list){
  if(!list){
    // review mode drills only your misses; otherwise they resurface ~1 turn in 3
    if(reviewMode){
      const q=fromQueue();
      if(q)return q;
      reviewMode=false; reviewCleared=true;   // announced once the next card renders
    }else if(P.due.length&&Math.random()<0.34){
      const q=fromQueue(); if(q)return q;
    }
  }
  const src=list||NOUNS, cand=[];
  let total=0;
  src.forEach(v=>CASES.forEach(c=>{const w=weight(v,c.k);total+=w;cand.push([v,c.k,w])}));
  let r=Math.random()*total;
  for(const [v,ck,w] of cand){ r-=w; if(r<=0)return {v,ck}; }
  return {v:rnd(src),ck:rnd(CASES).k};
}
function distinctForms(v){
  const seen={},out=[];
  CASES.forEach(c=>{const f=forms(v,c.k)[0];if(!seen[f]){seen[f]=c.k;out.push([f,c.k])}});
  return out;
}
function formDistractors(v,ck,n){
  const right=forms(v,ck)[0];
  const others=distinctForms(v).filter(([f])=>f!==right).map(([f])=>f);
  shuffle(others);
  const out=others.slice(0,n);
  if(out.length<n){                       // fall back to another noun of the same gender
    const sib=NOUNS.filter(x=>x!==v&&x.gender===v.gender);
    while(out.length<n&&sib.length){
      const f=forms(rnd(sib),ck)[0];
      if(f!==right&&!out.includes(f))out.push(f);
    }
  }
  return out;
}
function uniqueCaseForm(v){
  // a form that belongs to exactly one case, so "which case is this?" has one answer
  const count={};
  CASES.forEach(c=>{const f=forms(v,c.k)[0];count[f]=(count[f]||0)+1});
  const ok=CASES.filter(c=>count[forms(v,c.k)[0]]===1&&c.k!=="nominative");
  return ok.length?rnd(ok).k:null;
}
function vocabPair(){
  const v=rnd(QUIZZABLE.filter(x=>x.en&&x.en.length<40));
  const wrong=shuffle(QUIZZABLE.filter(x=>x!==v&&x.en&&x.type===v.type)).slice(0,2);
  while(wrong.length<2){const c=rnd(QUIZZABLE);if(c!==v&&!wrong.includes(c))wrong.push(c)}
  return {v,wrong};
}

function makeQuestion(lvl){
  const kinds =
    lvl===1 ? ["form-mc","form-mc","which-case"] :
    lvl===2 ? ["form-type"] :
    lvl===3 ? ["context"] :
    lvl===4 ? ["form-type","context"] :
              ["form-mc","form-type","context","which-case","vocab-sr-en","vocab-en-sr"];
  const kind=rnd(kinds);
  const serbianOnly = lvl===4;

  if(kind==="vocab-sr-en"||kind==="vocab-en-sr"){
    const {v,wrong}=vocabPair();
    const opts=shuffle([v,...wrong]);
    return {kind,v,serbianOnly,
      tag: kind==="vocab-sr-en"?"What does it mean?":"Which word is it?",
      word: kind==="vocab-sr-en"?v.word:v.en,
      ask:"",
      options: opts.map(o=>({text: kind==="vocab-sr-en"?o.en:o.word, ok:o===v, serif:kind==="vocab-en-sr"}))};
  }
  if(kind==="which-case"){
    const v=rnd(NOUNS), ck=uniqueCaseForm(v);
    if(!ck)return makeQuestion(lvl);
    const form=forms(v,ck)[0];
    const frame=FRAMES.filter(f=>f.c===ck&&POOLS[f.p].includes(v))[0];
    const opts=shuffle([CASE_BY_KEY[ck],...shuffle(CASES.filter(c=>c.k!==ck)).slice(0,2)]);
    return {kind,v,ck,serbianOnly,tag:"Which case?",
      word: frame? frame.s.replace("___","<em>"+form+"</em>") : form,
      small: !!frame,
      ask: serbianOnly? "Koji je ovo padež?" : "Which case is this form?",
      gloss: serbianOnly?"":v.word+" — "+v.en,
      options: opts.map(c=>({text:c.sr+(c.sr===c.en?"":"<small> · "+c.en+"</small>"), ok:c.k===ck}))};
  }
  const {v,ck}=pickPair();
  const cs=CASE_BY_KEY[ck];
  const repeat=P.due.includes(srsKey(v.word,ck));
  if(kind==="context"){
    const frames=FRAMES.filter(f=>POOLS[f.p].includes(v));
    if(!frames.length)return makeQuestion(lvl);
    const f=rnd(frames);
    return {kind:"context",v,ck:f.c,frame:f,serbianOnly,repeat,tag:CASE_BY_KEY[f.c].sr,
      word:f.s.replace("___",'<em class="blank">______</em>'), small:true,
      ask: serbianOnly? "Reč: "+v.word : "Put <b>"+v.word+"</b> into the blank.",
      gloss: serbianOnly? "" : v.en, typed:true};
  }
  if(kind==="form-mc"){
    const right=forms(v,ck)[0];
    const opts=shuffle([{text:right,ok:true},...formDistractors(v,ck,3).map(f=>({text:f,ok:false}))]);
    return {kind,v,ck,serbianOnly,repeat,tag:cs.sr,word:v.word,
      ask: serbianOnly? cs.sr+" od <b>"+v.word+"</b>?" : "Which one is the "+cs.en.toLowerCase()+"?",
      gloss: serbianOnly?"":v.en, options:opts.map(o=>({text:o.text,ok:o.ok,serif:true}))};
  }
  return {kind:"form-type",v,ck,serbianOnly,repeat,tag:cs.sr,word:v.word,
    ask: serbianOnly? "Napiši "+cs.sr.toLowerCase()+"." : "What is the "+cs.en.toLowerCase()+" of “"+v.word+"”?",
    gloss: serbianOnly?"":v.en, typed:true};
}

/* ============================== PLAY MODE ============================== */
const LEVELS=[
 {n:1,name:"Recognition"},{n:2,name:"Fill in"},{n:3,name:"Context"},
 {n:4,name:"Serbian only"},{n:5,name:"Mixed"}
];
let lvl=+(localStorage.getItem("padez.level")||1), Q=null, locked=false;

function paintLevels(){
  const box=$("#pd-levels"); box.innerHTML="";
  LEVELS.forEach(L=>{
    const b=el("button","lvl","<b>"+L.n+"</b>"+L.name);
    b.setAttribute("aria-pressed",L.n===lvl);
    b.addEventListener("click",()=>{lvl=L.n;localStorage.setItem("padez.level",lvl);paintLevels();nextQuestion()});
    box.appendChild(b);
  });
}
function nextQuestion(){
  locked=false;
  Q=makeQuestion(lvl);
  $("#pd-card").classList.remove("right");
  $("#pd-tag").textContent=(Q.repeat?"↻ ":"")+Q.tag;
  $("#pd-word").innerHTML=Q.word;
  $("#pd-word").className="qword"+(Q.small?" sm":"");
  $("#pd-ask").innerHTML=Q.ask||"";
  $("#pd-gloss").textContent=Q.gloss||"";
  $("#pd-feedback").innerHTML = reviewCleared
    ? '<span class="ok">✓ Review cleared.</span><span class="why">Back to the full mix.</span>' : "";
  reviewCleared=false;
  $("#pd-pattern").hidden=true;
  const say=$("#pd-say"); say.hidden=!(Q.kind==="vocab-sr-en"||Q.kind==="which-case"||Q.kind==="form-mc");
  if(Q.options){
    $("#pd-form").hidden=true;
    $("#pd-opts").innerHTML=Q.options.map((o,i)=>
      '<button class="opt'+(o.serif?" serif":"")+'" data-i="'+i+'">'+o.text+'</button>').join("");
  }else{
    $("#pd-opts").innerHTML="";
    $("#pd-form").hidden=false;
    $("#pd-input").value="";
    $("#pd-input").placeholder=Q.serbianOnly?"odgovor":"type the form";
  }
}
function celebrate(){
  const box=$("#burst"); box.innerHTML="";
  const colors=["var(--red)","var(--blue)","var(--gold)","var(--brand)"];
  for(let i=0;i<18;i++){
    const bit=el("i");
    bit.style.left=(20+Math.random()*60)+"%";
    bit.style.top=(28+Math.random()*10)+"%";
    bit.style.background=colors[i%colors.length];
    bit.style.animationDelay=(Math.random()*.18)+"s";
    box.appendChild(bit);
  }
  setTimeout(()=>box.innerHTML="",1400);
}
function badgeToast(list){
  if(!list.length)return "";
  return list.map(b=>'<div class="why">🏅 Badge unlocked — <b>'+b.em+" "+b.nm+"</b></div>").join("");
}
function coach(v,ck){
  const key=patternKey(v,ck);
  P.pat[key]=(P.pat[key]||0)+1; save();
  if(P.pat[key]<3||P.pat[key]%3)return;
  const same=NOUNS.filter(x=>patternKey(x,ck)===key&&x!==v).slice(0,2);
  const box=$("#pd-pattern");
  const label=(v.gender==="masculine"?"Masculine":v.gender==="feminine"?"Feminine":"Neuter")+
    (v.gender==="masculine"?(v.animacy==="animate"?" animate":" inanimate"):"")+" · "+CASE_BY_KEY[ck].sr;
  box.innerHTML='<h4>You keep slipping here — '+label+'</h4>'+explain(v,ck)+
    same.map(x=>'<span class="ex"><b>'+x.word+'</b> → '+forms(x,ck)[0]+'</span>').join("");
  box.hidden=false;
}
function answerTyped(text){
  if(locked||!Q)return;
  const res=judge(text,Q.v,Q.ck);
  if(res.state==="empty")return;
  locked=true;
  const right=forms(Q.v,Q.ck)[0];
  const alt=forms(Q.v,Q.ck).slice(1);
  const fresh=score(res.state==="right",Q.v.word,Q.ck);
  const fb=$("#pd-feedback");
  if(res.state==="right"){
    $("#pd-card").classList.add("right"); celebrate();
    fb.innerHTML='<span class="ok">✅ Bravo!</span> <span class="form">'+Q.v.word+" → "+right+"</span>"+
      (res.diacritics?'<span class="why">Watch the diacritics — it is written <b>'+right+"</b>.</span>":"")+
      (alt.length?'<span class="why">Also correct: '+alt.join(", ")+"</span>":"")+
      (Q.frame?'<span class="why">'+Q.frame.why+"</span>":"")+badgeToast(fresh);
    setTimeout(nextQuestion,1250);
  }else{
    fb.innerHTML='<span class="no">❌ Not quite.</span> <span class="form">'+right+"</span>"+
      (res.gave?'<span class="why">You gave the '+res.gave.en.toLowerCase()+".</span>":"")+
      '<span class="why">'+explain(Q.v,Q.ck)+"</span>"+
      (Q.frame?'<span class="why">'+Q.frame.why+"</span>":"");
    coach(Q.v,Q.ck);
    setTimeout(nextQuestion,3400);
  }
}
$("#pd-opts").addEventListener("click",e=>{
  const b=e.target.closest(".opt"); if(!b||locked)return;
  locked=true;
  const o=Q.options[+b.dataset.i], ok=o.ok;
  const fresh=score(ok,Q.v.word,Q.ck||null);
  $$("#pd-opts .opt").forEach((x,i)=>{
    if(Q.options[i].ok)x.classList.add("right");
    else if(x===b)x.classList.add("wrong"); else x.classList.add("dim");
    x.disabled=true;
  });
  const fb=$("#pd-feedback");
  if(ok){
    celebrate();
    const line = Q.ck? Q.v.word+" → "+forms(Q.v,Q.ck)[0]+" · "+CASE_BY_KEY[Q.ck].sr : Q.v.word+" = "+Q.v.en;
    fb.innerHTML='<span class="ok">✅ Bravo!</span> <span class="form">'+line+"</span>"+badgeToast(fresh);
    setTimeout(nextQuestion,1150);
  }else{
    const right=Q.options.find(x=>x.ok).text.replace(/<[^>]+>/g,"");
    fb.innerHTML='<span class="no">❌ Not quite.</span> <span class="form">'+right+"</span>"+
      (Q.ck?'<span class="why">'+explain(Q.v,Q.ck)+"</span>":"");
    if(Q.ck&&Q.kind!=="which-case")coach(Q.v,Q.ck);
    setTimeout(nextQuestion,3000);
  }
});
$("#pd-form").addEventListener("submit",e=>{e.preventDefault();answerTyped($("#pd-input").value);});
$("#pd-say").addEventListener("click",()=>{
  const w=Q&&(Q.kind==="which-case"?$("#pd-word").textContent:Q.v.word);
  if(w&&window.AZ)AZ.say(w);
});

/* =============================== TUTOR =============================== */
let T=null, tLocked=false;
function tSay(html,cls){
  const log=$("#tt-log");
  log.appendChild(el("div","bubble "+(cls||"t"),html));
  while(log.children.length>14)log.removeChild(log.firstChild);
  log.scrollIntoView({block:"end",behavior:"smooth"});
}
function tAsk(){
  const {v,ck}=pickPair(); T={v,ck};
  tSay('Give me the <b>'+CASE_BY_KEY[ck].sr+'</b> of <span class="q">'+v.word+"</span>");
}
function tAnswer(text){
  if(!T)return tAsk();
  const raw=norm(text);
  if(raw==="skip"||raw==="?"){
    tSay('The '+CASE_BY_KEY[T.ck].en.toLowerCase()+' is <b>'+forms(T.v,T.ck)[0]+"</b>.");
    return tAsk();
  }
  const res=judge(text,T.v,T.ck), right=forms(T.v,T.ck)[0];
  score(res.state==="right",T.v.word,T.ck);
  if(res.state==="right"){
    tSay('<span class="ok">✅ Exactly!</span> '+T.v.word+" → <b>"+right+"</b>."+
      (res.diacritics?" (mind the diacritics)":""));
  }else{
    tSay('<span class="no">❌ Almost.</span> The '+CASE_BY_KEY[T.ck].en.toLowerCase()+
      " is <b>"+right+"</b>.<br>"+explain(T.v,T.ck));
  }
  tAsk();
}
$("#tt-form").addEventListener("submit",e=>{
  e.preventDefault();
  const val=$("#tt-input").value.trim();
  if(!val)return;
  tSay(esc(val),"me"); $("#tt-input").value="";
  setTimeout(()=>tAnswer(val),260);
});

/* ============================= VOCAB QUIZ ============================= */
let VQ=null, vqLocked=false;
function nextVocab(){
  vqLocked=false;
  const {v,wrong}=vocabPair(); VQ=v;
  $("#vq-tag").textContent="What does it mean?";
  $("#vq-word").textContent=v.word;
  $("#vq-feedback").innerHTML="";
  const opts=shuffle([v,...wrong]);
  $("#vq-opts").innerHTML=opts.map((o,i)=>
    '<button class="opt" data-ok="'+(o===v)+'">'+String.fromCharCode(65+i)+". "+esc(o.en)+"</button>").join("");
}
$("#vq-opts").addEventListener("click",e=>{
  const b=e.target.closest(".opt"); if(!b||vqLocked)return;
  vqLocked=true;
  const ok=b.dataset.ok==="true";
  P.vq.n++; if(ok){P.vq.c++;P.vq.streak++;P.xp+=5}else{P.vq.streak=0}
  P.seen[VQ.word]=1; save(); paintMeters();
  $$("#vq-opts .opt").forEach(x=>{
    if(x.dataset.ok==="true")x.classList.add("right");
    else if(x===b)x.classList.add("wrong"); else x.classList.add("dim");
    x.disabled=true;
  });
  $("#vq-feedback").innerHTML = ok
    ? '<span class="ok">🎉 Correct!</span>'
    : '<span class="no">❌ Not quite.</span> <span class="form">'+VQ.word+" = "+esc(VQ.en)+"</span>";
  if(ok)celebrate();
  setTimeout(nextVocab, ok?900:2200);
});
$("#vq-say").addEventListener("click",()=>{if(VQ&&window.AZ)AZ.say(VQ.word)});

/* ============================ WORD BROWSER ============================ */
const FILTERS=[["all","All"],["noun","Nouns"],["verb","Verbs"],["adjective","Adjectives"],
               ["phrase","Phrases"],["other","Other"],["flag","Notes"]];
let wbFilter="all";
function paintFilters(){
  $("#wb-filters").innerHTML=FILTERS.map(([k,n])=>
    '<button data-f="'+k+'" aria-pressed="'+(k===wbFilter)+'">'+n+"</button>").join("");
}
function wbMatch(v,q){
  if(wbFilter==="flag"&&!v.flag&&!v.note)return false;
  if(wbFilter==="other"&&["noun","verb","adjective","phrase"].includes(v.type))return false;
  if(!["all","flag","other"].includes(wbFilter)&&v.type!==wbFilter)return false;
  if(!q)return true;
  const hay=(v.word+" "+v.en+" "+(v.supplied||[]).join(" ")).toLowerCase();
  return hay.includes(q);
}
function paintWords(){
  const q=norm($("#wb-search").value);
  const list=VOCAB.filter(v=>wbMatch(v,q));
  $("#wb-count").textContent=list.length+" of "+VOCAB.length+" words";
  $("#wb-list").innerHTML=list.slice(0,300).map(v=>{
    const g=v.type==="noun"?v.gender[0]:"";
    const tag=v.type==="noun"
      ? '<span class="badge '+g+'">'+g+"</span>"
      : '<span class="badge">'+v.type.slice(0,4)+"</span>";
    return '<button class="werow" data-w="'+esc(v.word)+'">'+tag+
      '<span class="sr">'+esc(v.word)+"</span>"+
      (v.flag?'<span class="warn">⚑</span>':"")+
      '<span class="en">'+esc(v.en)+"</span></button>";
  }).join("");
}
$("#wb-search").addEventListener("input",paintWords);
$("#wb-filters").addEventListener("click",e=>{
  const b=e.target.closest("[data-f]"); if(!b)return;
  wbFilter=b.dataset.f; paintFilters(); paintWords();
});
$("#wb-list").addEventListener("click",e=>{
  const b=e.target.closest(".werow"); if(!b)return;
  openWord(BY_WORD[b.dataset.w]);
});
function openWord(v){
  if(!v)return;
  let body='<div class="grip"></div><div class="bigrow"><span class="caps" style="font-size:38px">'+
    esc(v.word)+'</span><button class="saybtn" data-say="'+esc(v.word)+'">▶ Hear it</button></div>'+
    '<div class="latinline"><span>'+v.type+(v.type==="noun"?" · "+v.gender+" · "+v.animacy:"")+
    '</span></div><p class="lede" style="margin:10px 0 0">'+esc(v.en)+"</p>";
  if(v.cases){
    body+='<table class="decl">'+CASES.map(c=>{
      const f=forms(v,c.k), m=mastered(v.word,c.k);
      return "<tr><th>"+c.sr+"</th><td>"+esc(f[0])+
        (f.length>1?'<small>or '+esc(f.slice(1).join(", "))+"</small>":"")+
        (m?'<small>✓ solid</small>':"")+"</td></tr>";
    }).join("")+"</table>";
    if(v.plural)body+='<p class="note">Nominative plural: <b>'+esc(v.plural)+"</b></p>";
  }
  if(v.forms)body+='<table class="decl">'+Object.entries(v.forms).map(([k,f])=>
    "<tr><th>"+k+"</th><td>"+esc(f)+"</td></tr>").join("")+"</table>";
  if(v.aspect)body+='<p class="note">Aspect: '+v.aspect+"</p>";
  if((v.supplied||[]).some(s=>s!==v.word))
    body+='<p class="note">In your list as: '+v.supplied.map(esc).join(", ")+"</p>";
  if(v.note)body+='<p class="note">'+v.note+"</p>";
  if(v.flag)body+='<div class="flagnote"><b>⚑ Flagged.</b> '+esc(v.flag)+"</div>";
  body+='<button class="btn ghost" id="sheetClose" style="margin-top:18px">Close</button>';
  $("#sheetInner").innerHTML=body;
  $("#sheet").classList.add("on");
}

/* ============================== CHARTS ============================== */
const CHARTS={
 nominative:  [["-I; -Ø","-A; -A","-O / -E; -O / -E"],["-I; -I","-E; -E","-A; -A"]],
 genitive:    [["-OG; -A / -EG; -A","-E; -E","-OG; -A / -EG; -A"],["-IH; -A","-IH; -A","-IH; -A"]],
 dative:      [["-OM; -U / -EM; -U","-OJ; -I","-OM; -U"],["-IM; -IMA","-IM; -IMA","-IM; -IMA"]],
 accusative:  [["inan = nom · anim = gen","-U; -U","= nominative"],["-E; -E","-E; -E","-A; -A"]],
 vocative:    [["-E / -U; -E / -U","-O; -O (-E after -ICA)","= nominative"],["= nominative pl","= nominative pl","= nominative pl"]],
 instrumental:[["-IM; -OM / -EM","-OM; -OM","-IM; -OM / -EM"],["-IM; -IMA","-IM; -IMA","-IM; -IMA"]],
 locative:    [["-OM; -U","-OJ; -I","-OM; -U"],["-IM; -IMA","-IM; -IMA","-IM; -IMA"]]
};
const CHART_EG={
 nominative:"zid · kuća · selo",
 genitive:"zid → zida · kuća → kuće · selo → sela",
 dative:"zid → zidu · kuća → kući · selo → selu",
 accusative:"zid → zid · pisac → pisca · kuća → kuću",
 vocative:"vojnik → vojniče · učiteljica → učiteljice · selo → selo",
 instrumental:"zid → zidom · kuća → kućom · pisac → piscem",
 locative:"zid → zidu · kuća → kući · selo → selu"
};
function paintCharts(){
  $("#ch-charts").innerHTML=CASES.map(c=>{
    const [sg,pl]=CHARTS[c.k];
    const sub=(c.sr===c.en?"":c.en)+(c.q!=="—"?(c.sr===c.en?"":" · ")+c.q:"");
    return '<div class="chart"><h3>'+c.sr+"<span>"+sub+"</span></h3>"+
      '<p class="use">'+c.use+"</p>"+
      '<div style="overflow-x:auto"><table><thead><tr><th></th><th>masculine</th><th>feminine</th><th>neuter</th></tr></thead>'+
      "<tbody><tr><th>singular</th>"+sg.map(x=>"<td>"+x+"</td>").join("")+"</tr>"+
      "<tr><th>plural</th>"+pl.map(x=>"<td>"+x+"</td>").join("")+"</tr></tbody></table></div>"+
      '<span class="eg">'+CHART_EG[c.k]+"</span></div>";
  }).join("");
}

/* =============================== STATS =============================== */
function hardest(n){
  return Object.entries(P.srs)
    .map(([k,s])=>({k,s,bad:s.n-s.c}))
    .filter(x=>x.bad>0&&x.s.run<3)
    .sort((a,b)=>b.bad-a.bad||b.s.n-a.s.n)
    .slice(0,n)
    .map(x=>{const [w,c]=x.k.split("|");return{w,c,bad:x.bad}});
}
function openStats(){
  const acc=accuracy(), az=window.AZ?AZ.fluency():0;
  const hard=hardest(6);
  const casesRow=CASES.map(c=>{
    const n=caseCorrect(c.k), got=n>=15;
    return '<div class="stat" style="'+(got?"border-color:var(--brand)":"")+'"><b>'+n+
      "</b><span>"+c.sr.slice(0,3)+"</span></div>";
  }).join("");
  $("#statsInner").innerHTML='<div class="grip"></div>'+
    '<h2 style="margin-bottom:12px">Your progress</h2>'+
    '<div class="xpwrap"><div class="xprow"><span>Level '+level()+"</span><span>"+P.xp+
      ' XP total</span></div><div class="xpbar"><i style="width:'+levelPct()+'%"></i></div></div>'+
    '<div class="stats"><div class="stat"><b>🔥 '+P.streak+"</b><span>Streak</span></div>"+
      '<div class="stat"><b>'+(acc===null?"—":acc+"%")+"</b><span>Accuracy</span></div>"+
      '<div class="stat"><b>'+P.best+"</b><span>Best streak</span></div></div>"+
    '<div class="stats" style="margin-top:8px"><div class="stat"><b>'+Object.keys(P.seen).length+
      "</b><span>Words</span></div>"+
      '<div class="stat"><b>'+P.n+"</b><span>Questions</span></div>"+
      '<div class="stat"><b>'+az+"%</b><span>Cyrillic</span></div></div>"+
    '<div class="eyebrow">Correct answers by case</div><div class="stats" style="grid-template-columns:repeat(4,1fr)">'+
      casesRow+"</div>"+
    (P.due.length?'<button class="btn" id="drillMisses" style="margin-top:16px">↻ Drill my mistakes ('+
      P.due.length+')</button>':"")+
    (hard.length?'<div class="eyebrow">Needs review</div><div class="wordlist">'+
      hard.map(h=>'<button class="werow" data-w="'+esc(h.w)+'"><span class="badge">'+
        CASE_BY_KEY[h.c].sr.slice(0,3)+'</span><span class="sr">'+esc(h.w)+
        '</span><span class="en">'+h.bad+" missed</span></button>").join("")+"</div>":"")+
    '<div class="eyebrow">Badges</div><div class="badges">'+
      BADGES.map(b=>'<div class="badge-card'+(P.badges.includes(b.id)?" got":"")+'">'+
        '<span class="em">'+b.em+'</span><span class="nm">'+b.nm+"</span></div>").join("")+"</div>"+
    '<p class="note">Badges you have not earned yet show what unlocks them: '+
      BADGES.filter(b=>!P.badges.includes(b.id)).slice(0,2).map(b=>b.nm+" — "+b.hint).join("; ")+".</p>"+
    '<button class="btn ghost" id="statsClose" style="margin-top:18px">Close</button>'+
    '<button class="danger" id="pd-reset">Reset case &amp; vocab progress</button>';
  $("#stats").classList.add("on");
}
$("#stats").addEventListener("click",e=>{
  if(e.target.id==="stats"||e.target.closest("#statsClose")){$("#stats").classList.remove("on");return;}
  const w=e.target.closest(".werow");
  if(w){$("#stats").classList.remove("on");openWord(BY_WORD[w.dataset.w]);return;}
  if(e.target.closest("#drillMisses")){
    $("#stats").classList.remove("on");
    reviewMode=true;
    showTab("padez");
    showView($("#tab-padez"),"play");
    nextQuestion();
    return;
  }
  if(e.target.closest("#pd-reset")){
    if(!confirm("Erase case and vocabulary progress on this device? The Cyrillic side is kept."))return;
    P=blank(); save(); paintMeters(); openStats();
  }
});
$("#statsBtn").addEventListener("click",openStats);

/* =========================== SPEECH INPUT =========================== */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function wireMic(btn,input,onDone){
  if(!SR)return;
  btn.hidden=false;
  let rec=null,busy=false;
  btn.addEventListener("click",()=>{
    if(busy&&rec){rec.stop();return;}
    rec=new SR(); rec.lang="sr-RS"; rec.interimResults=false; rec.maxAlternatives=3;
    busy=true; btn.textContent="🎙 Listening…";
    rec.onresult=ev=>{
      const heard=[...ev.results[0]].map(r=>r.transcript.trim());
      input.value=heard[0];
      if(onDone)onDone(heard);
    };
    rec.onerror=()=>{btn.textContent="🎙 Speak";busy=false;};
    rec.onend=()=>{btn.textContent="🎙 Speak";busy=false;};
    rec.start();
  });
}
// Speech recognition can return several guesses; accept any that is a legitimate
// form for the case being asked, but never a form of a different case.
function bestHeard(list,v,ck){
  for(const h of list){ if(judge(h,v,ck).state==="right")return h; }
  return list[0];
}
wireMic($("#pd-mic"),$("#pd-input"),heard=>{
  if(Q&&Q.typed)answerTyped(bestHeard(heard,Q.v,Q.ck));
});
wireMic($("#tt-mic"),$("#tt-input"),heard=>{
  if(!T)return;
  const pick=bestHeard(heard,T.v,T.ck);
  tSay(esc(pick),"me"); $("#tt-input").value="";
  setTimeout(()=>tAnswer(pick),260);
});

/* ============================== SHELL ============================== */
const TAB_NAMES={azbuka:"Ћирилица",padez:"Падежи",vocab:"Vocab"};
function showTab(t){
  $$(".tab").forEach(s=>s.classList.toggle("on",s.id==="tab-"+t));
  $$("nav button").forEach(b=>b.setAttribute("aria-current",b.dataset.tab===t?"page":"false"));
  $("#tabName").textContent=TAB_NAMES[t];
  window.scrollTo(0,0);
  if(t==="azbuka"&&window.AZ)AZ.paintLearn();
  if(t!=="azbuka"&&window.AZ&&AZ.running)AZ.endSprint();
  localStorage.setItem("padez.tab",t);
}
$$("nav button").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.tab)));

function showView(section,v){
  [...section.querySelectorAll("main")].forEach(m=>m.classList.toggle("on",m.id==="v-"+v));
  [...section.querySelectorAll(".subnav button")].forEach(b=>
    b.setAttribute("aria-pressed",b.dataset.view===v));
  window.scrollTo(0,0);
  if(window.AZ){
    if(v==="learn")AZ.paintLearn();
    if(v==="drill"&&!AZ.hasDrill)AZ.newDrill();
    if(v==="read"&&!AZ.hasRead)AZ.newRead();
    if(v!=="sprint"&&AZ.running)AZ.endSprint();
  }
  if(v==="tutor"&&!$("#tt-log").children.length)tAsk();
  if(v==="browse")paintWords();
}
$$(".subnav").forEach(nav=>{
  const section=nav.closest(".tab");
  nav.addEventListener("click",e=>{
    const b=e.target.closest("[data-view]"); if(!b)return;
    showView(section,b.dataset.view);
  });
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){$("#stats").classList.remove("on");$("#sheet").classList.remove("on");}
});

/* =============================== INIT =============================== */
if(window.AZ)AZ.init();
paintLevels(); nextQuestion(); nextVocab(); paintFilters(); paintWords(); paintCharts(); paintMeters();
showTab(localStorage.getItem("padez.tab")||"azbuka");
})();
