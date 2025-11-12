/* ============ mood palette ============ */
const palette = {
  bad:   { bg:'#FA897B', line:'#FA897B', label:'غاضب',   file:'images/Angry.png'    },
  sad:   { bg:'#FFDD94', line:'#D9A83A', label:'حزين',   file:'images/Sad.png'      },
  meh:   { bg:'#FFDD94', line:'#D8B85D', label:'قلق',    file:'images/worried.png'  },
  ok:    { bg:'#D0E6A5', line:'#C1D88F', label:'لا بأس', file:'images/Ok.png'       },
  good:  { bg:'#86E3CE', line:'#86E3CE', label:'سعيد',   file:'images/veryHabby.png'},
  great: { bg:'#CCABD8', line:'#B892CC', label:'تعبان',  file:'images/Tired.png'    }
};

/* map Arabic label → palette key (supports old saved values too) */
function moodKeyFromLabel(s = "") {
  if (!s) return "ok";
  if (s.includes("غاضب")) return "bad";
  if (s.includes("حزين")) return "sad";
  if (s.includes("قلق"))  return "meh";
  if (s.includes("لا") && s.includes("بأس")) return "ok";
  if (s.includes("سعيد")) return "good";
  if (s.includes("تعب"))  return "great";
  return "ok";
}

/* ============ helpers & store ============ */
const AR_DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

function isoLocal(d = new Date()){
  const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return `${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,"0")}-${String(dd.getDate()).padStart(2,"0")}`;
}

const store = {
  get(){ try{ return JSON.parse(localStorage.getItem("journalData") || "{}"); } catch{ return {}; }},
  set(d){ localStorage.setItem("journalData", JSON.stringify(d)); }
};

function wordCount(t=""){ const m = t.trim().match(/\b[\p{L}\p{N}'’\-]+\b/gu); return m?m.length:0; }

/* ============ DOM ============ */
const note = document.getElementById("note");
const saveBtn = document.getElementById("save");
const clearBtn = document.getElementById("clearToday");
const showAllBtn = document.getElementById("showAll");
const entriesEl = document.getElementById("entries");
const allEntriesCard = document.getElementById("allEntries");
const curEl = document.getElementById("curStreak");
const bestEl = document.getElementById("bestStreak");

const ratingEl = document.getElementById("rating");
const ratingText = document.getElementById("ratingText");
const showAchvBtn = document.getElementById("showAchv");
const achvCard = document.getElementById("achievements");
const achvList = document.getElementById("achvList");

let selectedRating = 0;

/* ============ rating stars ============ */
if (ratingEl){
  const stars = [...ratingEl.querySelectorAll("button[data-v]")];
  const paint = (val)=>{
    selectedRating = val;
    stars.forEach(s => s.classList.toggle("active", Number(s.dataset.v) <= val));
    if (ratingText) ratingText.textContent = `قيّمي يومك: ${val}/5`;
  };
  stars.forEach(s=>{ s.addEventListener("click", ()=> paint(Number(s.dataset.v))); });
  paint(0); // init
}

/* ============ mood ============ */
function selectedMood(){
  const el = document.querySelector('input[name="mood"]:checked');
  const label = el ? el.value : "لا بأس";
  const key = moodKeyFromLabel(label);
  return { key, label, ...palette[key] };
}

/* ============ save / clear / toggle ============ */
if (saveBtn){
  saveBtn.onclick = () => {
    const text = (note?.value || "").trim();
    if (!text){ alert("اكتب مذكرتك أولاً ✍️"); return; }

    const db = store.get();
    const iso = isoLocal();

    const mood = selectedMood(); // {key,label,bg,line,file}

    db[iso] = {
      moodKey: mood.key,          // new: normalized key
      moodLabel: mood.label,      // new: Arabic label
      rating: selectedRating || 0,
      text,
      words: wordCount(text),
      savedAt: Date.now()
    };
    store.set(db);

    if (note) note.value = "";
    if (allEntriesCard) allEntriesCard.hidden = false;

    renderEntries();
    updateStreaks();
    renderAchievements();
  };
}

if (clearBtn){
  clearBtn.onclick = () => {
    const db = store.get();
    const iso = isoLocal();
    if (db[iso]){ delete db[iso]; store.set(db); }
    renderEntries();
    updateStreaks();
    renderAchievements();
  };
}

if (showAllBtn){
  showAllBtn.onclick = () => {
    allEntriesCard.hidden = !allEntriesCard.hidden;
    if (!allEntriesCard.hidden) renderEntries();
  };
}

if (showAchvBtn){
  showAchvBtn.onclick = () => {
    achvCard.hidden = !achvCard.hidden;
    if (!achvCard.hidden) renderAchievements();
  };
}

/* ============ entries list ============ */
function starsHtml(n=0){ return "★".repeat(n) + "☆".repeat(5-n); }

function renderEntries(){
  if (!entriesEl) return;
  const db = store.get();
  const keys = Object.keys(db).sort().reverse();

  if (!keys.length){
    entriesEl.innerHTML = "<em>لا توجد مذكرات محفوظة بعد.</em>";
    return;
  }

  entriesEl.innerHTML = keys.map(k=>{
    const e = db[k];
    const d = new Date(k + "T00:00:00");

    // support old entries that stored e.mood (string) only
    const key = e.moodKey || moodKeyFromLabel(e.mood || e.moodLabel || "");
    const p = palette[key] || {};

    const chip = `
      <span style="
        display:inline-flex;align-items:center;gap:8px;
        padding:6px 10px;border-radius:999px;font-weight:700;
        background:${p.bg || '#eee'}; color:#1A1D2E;
        border:2px solid ${p.line || 'transparent'};
        box-shadow:0 6px 16px rgba(0,0,0,.08);
      ">
        ${p.file ? `<img src="${p.file}" alt="${p.label || ''}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">` : ''}
        <span>${p.label || e.moodLabel || e.mood || ''}</span>
      </span>
    `.trim();

    return `
      <div class="entry">
        <div class="meta">
          <div>${AR_DAYS[d.getDay()]} • ${k}</div>
          <div>${chip}</div>
        </div>
        <small>${e.words || 0} كلمة</small>
        <div class="rating-row">${starsHtml(Number(e.rating||0))}</div>
        <div>${(e.text || "").replace(/\n/g,"<br>")}</div>
      </div>`;
  }).join("");
}

/* ============ streaks ============ */
function getCurrentStreak(db){
  let cur = 0;
  let d = new Date();
  while (true){
    const iso = isoLocal(d);
    if (db[iso]){ cur++; d.setDate(d.getDate()-1); } else break;
  }
  return cur;
}

function updateStreaks(){
  const db = store.get();
  let cur = getCurrentStreak(db);
  let best = 0, run = 0;
  let d = new Date();
  for (let i=0;i<366;i++){
    const iso = isoLocal(d);
    if (db[iso]){ run++; best = Math.max(best, run); }
    else { run = 0; }
    d.setDate(d.getDate()-1);
  }
  if (curEl) curEl.textContent = String(cur);
  if (bestEl) bestEl.textContent = String(best);
}

/* ============ achievements ============ */
function renderAchievements(){
  if (!achvList) return;
  const db = store.get();
  const total = Object.keys(db).length;
  const curStreak = getCurrentStreak(db);

  const items = [
    { id:"streak7",   emoji:"🥇", title:"كتبت 7 أيام متتالية!", goal:7,  progress:curStreak, unlocked: curStreak>=7 },
    { id:"entries50", emoji:"📘", title:"أكملت 50 مذكرة!",       goal:50, progress:total,     unlocked: total>=50 },
  ];

  achvList.innerHTML = items.map(it=>{
    const pct = Math.min(100, Math.round((Math.min(it.progress, it.goal)/it.goal)*100));
    const badgeClass = it.unlocked ? "badge-ok" : "badge-lock";
    const badgeText  = it.unlocked ? "تم الإنجاز" : "قيد التقدّم";
    return `
      <div class="achv-card" id="${it.id}">
        <div class="achv-head">
          <div class="achv-title">${it.emoji} ${it.title}</div>
          <span class="achv-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div>التقدّم: ${Math.min(it.progress,it.goal)} / ${it.goal}</div>
        <div class="achv-progress"><span style="width:${pct}%"></span></div>
      </div>`;
  }).join("");
}

/* ============ boot ============ */
renderEntries();
updateStreaks();
renderAchievements();
