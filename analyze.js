// Function to change the greeting based on the time




// analyze js
/* ===================== لوحة الألوان والملفات ===================== */
const palette = {
  bad:   { bg:'#FA897B', line:'#FA897B', label:'غاضب',     file:'/images/Angry.png'   },
  sad:   { bg:'#FFDD94', line:'#D9A83A', label:'حزين',    file:'/images/Sad.png'   },
  meh:   { bg:'#FFDD94', line:'#D8B85D', label:'قلق',   file:'/images/worried.png'   },
  ok:    { bg:'#D0E6A5', line:'#C1D88F', label:'لا بأس',  file:'/images/Ok.png'    },
  good:  { bg:'#86E3CE', line:'#86E3CE', label:'سعيد',     file:'/images/veryHabby.png'  },
  great: { bg:'#CCABD8', line:'#B892CC', label:'متعب',   file:'/images/Tired.png' }
};
const DAYS = ['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'];

/* ===================== أسابيع تجريبية (عدّليها) ===================== */
const weeks = [
  {
    name: 'الأسبوع ١',
    days: [
      { day:'الإثنين',  value:38,  mood:'meh'   },
      { day:'الثلاثاء', value:52,  mood:'ok'    },
      { day:'الأربعاء', value:15,  mood:'sad'   },
      { day:'الخميس',   value:56,  mood:'good'  },
      { day:'الجمعة',   value:82,  mood:'great' },
      { day:'السبت',    value:null, mood:null   },
      { day:'الأحد',    value:null, mood:null   },
    ]
  },
  {
    name: 'الأسبوع ٢',
    days: [
      { day:'الإثنين',  value:22,  mood:'sad'   },
      { day:'الثلاثاء', value:35,  mood:'meh'   },
      { day:'الأربعاء', value:48,  mood:'ok'    },
      { day:'الخميس',   value:66,  mood:'good'  },
      { day:'الجمعة',   value:78,  mood:'great' },
      { day:'السبت',    value:60,  mood:'good'  },
      { day:'الأحد',    value:40,  mood:'meh'   },
    ]
  },
  {
    name: 'الأسبوع ٣',
    days: [
      { day:'الإثنين',  value:70,  mood:'good'  },
      { day:'الثلاثاء', value:62,  mood:'ok'    },
      { day:'الأربعاء', value:55,  mood:'ok'    },
      { day:'الخميس',   value:30,  mood:'meh'   },
      { day:'الجمعة',   value:20,  mood:'sad'   },
      { day:'السبت',    value:45,  mood:'meh'   },
      { day:'الأحد',    value:80,  mood:'great' },
    ]
  }
];

/* ===================== مراجع DOM ===================== */
const svg = document.getElementById('chart');
const gridG = document.getElementById('grid');
const pathMain = document.getElementById('main-path');
const pathGhost = document.getElementById('ghost-path');
const pointsG = document.getElementById('points');
const daysRow = document.getElementById('days');
const weekSelect = document.getElementById('weekSelect');
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');
const sub = document.getElementById('sub');
const tooltip = document.getElementById('tooltip');
const card = document.getElementById('card');
const recoGrid = document.getElementById('recoGrid');

const W = 640, H = 320, PADX = 26, PADY = 30;

/* ===================== بناء ثابت ===================== */
(function buildStatic(){
  for (let i=0;i<5;i++){
    const y = PADY + ((H - 2*PADY) / (5-1))*i;
    const ln = document.createElementNS('http://www.w3.org/2000/svg','line');
    ln.setAttribute('x1', 14);
    ln.setAttribute('x2', W-14);
    ln.setAttribute('y1', y);
    ln.setAttribute('y2', y);
    gridG.appendChild(ln);
  }
  daysRow.innerHTML = DAYS.map(d=>`<div class="day">${d}</div>`).join('');
  weekSelect.innerHTML = weeks.map((w,i)=>`<option value="${i}">${w.name}</option>`).join('');
})();

/* ===================== مساعدين ===================== */
function toXY(list){
  const xStep = (W - 2*PADX) / (list.length-1);
  return list.map((d,i)=>{
    const x = PADX + i*xStep;
    const y = (H-PADY) - (((typeof d.value==='number'? d.value : 50)/100)*(H-2*PADY));
    return {...d, x, y};
  });
}
function catmullRom2bezier(pts){
  const p = pts.filter(o=>typeof o.value==='number');
  if (p.length<2) return '';
  const segs = [];
  for (let i=0;i<p.length;i++){
    const p0 = p[i-1] || p[i];
    const p1 = p[i];
    const p2 = p[i+1] || p[i];
    const p3 = p[i+2] || p[i+1] || p[i];
    if(i===0) segs.push(`M ${p1.x},${p1.y}`);
    const c1x = p1.x + (p2.x - p0.x)/6;
    const c1y = p1.y + (p2.y - p0.y)/6;
    const c2x = p2.x - (p3.x - p1.x)/6;
    const c2y = p2.y - (p3.y - p1.y)/6;
    segs.push(`C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`);
  }
  return segs.join(' ');
}
function animatePathDraw(pathEl){
  const len = pathEl.getTotalLength();
  pathEl.style.transition = 'none';
  pathEl.style.strokeDasharray = String(len);
  pathEl.style.strokeDashoffset = String(len);
  pathEl.getBoundingClientRect();
  pathEl.style.transition = 'stroke-dashoffset 600ms ease';
  pathEl.style.strokeDashoffset = '0';
}

/* ===================== تحليل الأسبوع ===================== */
function summarizeWeek(week){
  const vals = week.days.filter(d=>typeof d.value==='number').map(d=>d.value);
  const avg = vals.reduce((a,b)=>a+b,0) / (vals.length || 1);
  const first = week.days.find(d=>typeof d.value==='number')?.value ?? avg;
  const last  = [...week.days].reverse().find(d=>typeof d.value==='number')?.value ?? avg;
  const trend = last - first;

  let bucket = 'meh';
  if (avg < 20) bucket = 'bad';
  else if (avg < 35) bucket = 'sad';
  else if (avg < 50) bucket = 'meh';
  else if (avg < 65) bucket = 'ok';
  else if (avg < 80) bucket = 'good';
  else bucket = 'great';

  return {avg, trend, bucket};
}

/* مكتبة توصيات عربية */
const RECO_LIBRARY = {
  bad: [
    { title:'تهدئة سريعة (5 خطوات)', desc:'تمرين تأريض وتنفس لخفض التوتر فورًا.', bg:'var(--peach)', emoji:'🫶' },
    { title:'اكلمي شخص تثقين به',     desc:'نموذج بسيط لبدء محادثة دعم.',        bg:'var(--yellow)', emoji:'📞' },
    { title:'مصادر مساعدة عاجلة',      desc:'عند الشعور بالإرهاق الشديد.',        bg:'var(--purple)', emoji:'🆘' }
  ],
  sad: [
    { title:'لطف مع الذات',            desc:'كوني رحيمة بنفسك اليوم.',             bg:'var(--yellow)', emoji:'💛' },
    { title:'حركة لطيفة',              desc:'مشي 10 دقائق + إطالات خفيفة.',        bg:'var(--mint)',   emoji:'🚶‍♀️' },
    { title:'اكتبي مشاعرك',            desc:'كتابة تعبيريّة لدقيقتين.',            bg:'var(--green)',  emoji:'📝' }
  ],
  meh: [
    { title:'لما الشغل يسبب ضغط',      desc:'خطة صغيرة لتقليل الذروات.',          bg:'var(--yellow)', emoji:'💻' },
    { title:'أوقفي جلد الذات',         desc:'إعادة صياغة الصوت الداخلي.',          bg:'var(--purple)', emoji:'🔍' },
    { title:'تنفّس صندوقي دقيقتين',    desc:'تمرين بسيط لتحسين التركيز.',          bg:'var(--mint)',   emoji:'🌿' }
  ],
  ok: [
    { title:'استمري على الزخم',        desc:'خطوة صغيرة لنجاح الغد.',              bg:'var(--green)',  emoji:'✅' },
    { title:'مذكرة امتنان',            desc:'اكتبي 3 أشياء تقدّرينها.',            bg:'var(--yellow)', emoji:'✨' },
    { title:'فحص الطاقة',              desc:'نوم/ماء — تذكير مصغّر.',              bg:'var(--mint)',   emoji:'💧' }
  ],
  good: [
    { title:'تعزيز الثقة',             desc:'دوّني لماذا سار اليوم جيدًا.',        bg:'var(--purple)', emoji:'🌱' },
    { title:'هدية لنفسك',              desc:'رتّبي مكافأة صغيرة.',                 bg:'var(--green)',  emoji:'🎁' },
    { title:'انشري لطفًا',             desc:'تصرف بسيط يرفع المزاج.',              bg:'var(--yellow)', emoji:'😊' }
  ],
  great: [
    { title:'احتفلي بالإنجازات',       desc:'ثبّتي العادة التي نجحت.',              bg:'var(--mint)',   emoji:'🎉' },
    { title:'تحدٍ لطيف',               desc:'اختاري هدفًا ممتعًا هذا الأسبوع.',     bg:'var(--purple)', emoji:'🏅' },
    { title:'امتنان للآخرين',          desc:'أرسلي رسالة تقدير.',                   bg:'var(--green)',  emoji:'💌' }
  ]
};

function cardHTML(r){
  return `
    <article class="reco" role="listitem" style="background:${r.bg};">
      <div class="icon">${r.emoji}</div>
      <h3>${r.title}</h3>
      <p>${r.desc}</p>
      <span class="go" aria-hidden="true">↗</span>
    </article>
  `;
}
function renderRecommendations(weekIdx){
  const s = summarizeWeek(weeks[weekIdx]);
  const base = RECO_LIBRARY[s.bucket].slice(0,2);
  const trendReco = s.trend < -5
    ? { title:'هبوط ملحوظ بالمزاج', desc:'جربي إعادة ضبط لطيفة لغدٍ أفضل.', bg:'var(--peach)', emoji:'🧡' }
    : s.trend > 5
      ? { title:'منحنى صاعد! رائع',  desc:'كرّري ما نجح هذا الأسبوع.',            bg:'var(--green)', emoji:'📈' }
      : { title:'أسبوع مستقر',        desc:'تحسين 1% بتعديل صغير يكفي.',           bg:'var(--yellow)', emoji:'🪴' };
  const list = [...base, trendReco];
  recoGrid.innerHTML = list.map(cardHTML).join('');
}

/* ===================== رسم الشارت ===================== */
let current = 0;
function render(weekIndex){
  current = weekIndex;
  weekSelect.value = String(weekIndex);
  sub.textContent = weeks[weekIndex].name;

  const midMood = weeks[weekIndex].days.find(d=>typeof d.value==='number')?.mood || 'good';
  document.documentElement.style.setProperty('--mint', palette[midMood]?.line || '#86E3CE');

  const pts = toXY(weeks[weekIndex].days);
  pathMain.setAttribute('d', catmullRom2bezier(pts));
  animatePathDraw(pathMain);

  const ghostValues = [30,48,62,40,52,70,58];
  const xStep = (W - 2*PADX) / (pts.length-1);
  const gpts = ghostValues.map((v,i)=>({
    x: PADX + i*xStep,
    y: (H-PADY) - (v/100)*(H-2*PADY),
    value: v
  }));
  pathGhost.setAttribute('d', catmullRom2bezier(gpts));

  pointsG.innerHTML = '';
  const valid = pts.filter(p=>typeof p.value==='number');
  valid.forEach(p=>{
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS,'g');          // جروب خارجي للموقع
g.setAttribute('transform', `translate(${p.x},${p.y})`);

const inner = document.createElementNS(NS,'g');      // جروب داخلي للحركة
inner.setAttribute('class', 'bubble');

const moodInfo = palette[p.mood] || {bg:'#ccc', file:''};

const circle = document.createElementNS(NS,'circle');
circle.setAttribute('r', 22);
circle.setAttribute('fill', moodInfo.bg);
inner.appendChild(circle);

const img = document.createElementNS(NS,'image');
img.setAttributeNS('http://www.w3.org/1999/xlink','href', moodInfo.file);
img.setAttribute('x', -17);
img.setAttribute('y', -17);
img.setAttribute('width', 34);
img.setAttribute('height', 34);
img.setAttribute('preserveAspectRatio','xMidYMid meet');
inner.appendChild(img);

// events على الـ inner بدل g
inner.addEventListener('mouseenter', ()=>{
  tooltip.textContent = `${p.day} • ${palette[p.mood]?.label || 'غير محدد'} • ${p.value}`;
  tooltip.style.opacity = '1';
  tooltip.style.left = `${p.x}px`;
  tooltip.style.top  = `${p.y}px`;
  tooltip.style.transform = 'translate(-50%,-130%)';
});
inner.addEventListener('mouseleave', ()=>{
  tooltip.style.opacity = '0';
  tooltip.style.transform = 'translate(-50%,-120%)';
});

// ركّبي الداخلي داخل الخارجي ثم أضفيه لـ SVG
g.appendChild(inner);
pointsG.appendChild(g);

  });

  renderRecommendations(weekIndex);
}

/* ===================== تنقّل ===================== */
btnPrev.addEventListener('click', ()=> render((current-1+weeks.length)%weeks.length));
btnNext.addEventListener('click', ()=> render((current+1)%weeks.length));
weekSelect.addEventListener('change', e=> render(parseInt(e.target.value,10)));

/* أسهم لوحة المفاتيح (يمين = السابق، يسار = التالي في RTL) */
window.addEventListener('keydown', (e)=>{
  if(e.key==='ArrowRight') render((current-1+weeks.length)%weeks.length);
  if(e.key==='ArrowLeft')  render((current+1)%weeks.length);
});

/* سحب على البطاقة */
let startX=null;
card.addEventListener('pointerdown', e=> startX=e.clientX);
card.addEventListener('pointerup', e=>{
  if(startX===null) return;
  const dx = e.clientX - startX;
  if(Math.abs(dx)>40){
    if(dx>0) render((current-1+weeks.length)%weeks.length); // سحب يمين = السابق
    else     render((current+1)%weeks.length);              // سحب يسار = التالي
  }
  startX=null;
});

/* ===================== تشغيل أولي ===================== */
render(0);






