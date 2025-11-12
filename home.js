// Function to change the greeting based on the time
function setGreeting() {
    const greetingElement = document.getElementById('greeting');
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 18) {
        greetingElement.textContent = "صباح الخير";
    } else {
        greetingElement.textContent = "مساء الخير";
    }
}

// Call the function to set the greeting on page load
setGreeting();// Array of positive quotes
const quotes = [
  "كل يوم هو فرصة جديدة لبداية أفضل.",
  "الإيجابية هي مفتاح الحياة.",
  "كن التغيير الذي تريد أن تراه في العالم.",
  "الأحلام الكبيرة تبدأ بخطوات صغيرة.",
  "لا تستسلم، النجاح قريب جدًا.",
  "ثقة الإنسان في نفسه هي أول خطوة نحو النجاح.",
  "التحديات تصنع الأبطال.",
  "كلما كنت أكثر صبرًا، كلما كانت النتائج أفضل.",
  "كل يوم هو فرصة جديدة للتعلم والنمو.",
  "لا تقارن نفسك بالآخرين، كل واحد منا يسير في طريقه الخاص.",
  "الحياة رحلة، استمتع بكل لحظة.",
  "لا يوجد مستحيل، فقط افعلها.",
  "النجاح لا يأتي بالأحلام، بل بالعمل الجاد.",
  "السعادة تبدأ في داخلنا.",
  "الشجاعة ليست غياب الخوف، بل القدرة على التغلب عليه.",
  "الإيجابية ليست مجرد شعار، بل أسلوب حياة.",
  "الوقت هو أثمن ما نملك، استخدمه بحكمة.",
  "الأشياء العظيمة تأتي من الأشياء الصغيرة.",
  "ابحث عن الأشياء التي تحبها، واتبع شغفك.",
  "النجاح هو الانتقال من فشل إلى فشل دون فقدان الحماس.",
  "أنت من يصنع فرصك، لا تنتظرها.",
  "النجاح ليس نهاية الطريق، بل البداية.",
  "التفاؤل هو الإيمان الذي يؤدي إلى الإنجاز.",
  "لا تتردد في التغيير، فالتغيير هو الطريق الوحيد للنمو.",
  "لكل مشكلة حل، فقط ابحث عنه.",
  "كن أفضل نسخة من نفسك.",
  "الحياة قصيرة، لذلك ابتسم لكل لحظة.",
  "النجاح هو نتيجة الإصرار والمثابرة.",
  "كل لحظة جديدة هي فرصة جديدة لتكون أفضل.",
  "لا شيء مستحيل، طالما أنك تؤمن بنفسك.",
  "في كل تحدي، يوجد فرصة للتعلم والنمو.",
  "كل يوم هو بداية جديدة لتغيير حياتك.",
  "الإيجابية تجلب السعادة والتوفيق.",
  "ابحث دائمًا عن الفرص في كل مشكلة.",
  "إذا كنت لا تستطيع الطيران، فامشِ. إذا كنت لا تستطيع المشي، فازحف. ولكن لا تتوقف أبدًا.",
  "كل شيء يبدأ بفكرة.",
  "الحياة تحتاج إلى الصبر والمثابرة.",
  "إذا أردت أن تتفوق، يجب أن تعمل بجد.",
  "العقل البشري هو أقوى أداة لتحقيق النجاح.",
  "كن فخورًا بما أنجزته، ولكن لا تتوقف عن السعي للأفضل.",
  "التغيير يبدأ من داخلك.",
  "استمر في التقدم، فكل خطوة تقربك من هدفك.",
  "أنت قادر على تجاوز أي صعوبة تواجهها.",
  "إذا كان لديك حلم، فابدأ العمل عليه اليوم.",
  "الأفكار الإيجابية هي أساس النجاح.",
  "السعادة ليست وجهة، بل طريقة حياة.",
  "النجاح ليس عن ما تحققه، بل عن ما تصبح عليه.",
  "المستقبل ينتظرك، لا تخشى المضي قدمًا.",
  "التعلم لا يتوقف أبدًا.",
  "العقل هو مصدر قوتك، استخدمه بحكمة."
];

// Function to display a new quote every 24 hours
function showRandomQuote() {
  const quoteElement = document.getElementById('quote-display');
  const lastUpdate = localStorage.getItem('lastQuoteUpdate'); // الحصول على تاريخ آخر تحديث

  // إذا مر 24 ساعة أو أكثر، نقوم بتغيير الاقتباس
  const now = new Date().getTime();
  if (!lastUpdate || now - lastUpdate > 86400000) { // 86400000 ms = 24 hours
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];
    quoteElement.textContent = selectedQuote; // عرض الاقتباس الجديد
    localStorage.setItem('lastQuoteUpdate', now); // حفظ الوقت الذي تم فيه التغيير
    localStorage.setItem('savedQuote', selectedQuote); // حفظ الاقتباس الحالي
  } else {
    // إذا لم تمر 24 ساعة، عرض الاقتباس القديم
    const savedQuote = localStorage.getItem('savedQuote');
    quoteElement.textContent = savedQuote || 'Loading quote...'; // عرض آخر اقتباس تم حفظه
  }
}

// Display a random quote initially
showRandomQuote();

// Store the current quote in localStorage
function saveCurrentQuote() {
  const currentQuote = document.getElementById('quote-display').textContent;
  localStorage.setItem('savedQuote', currentQuote);
}

// Call this to save the quote when needed, e.g., before closing or refreshing the page
window.addEventListener('beforeunload', saveCurrentQuote);

// فحص الـ `localStorage` ومعرفة الوقت الذي تم فيه التحديث
console.log("Last quote update:", localStorage.getItem('lastQuoteUpdate'));

