// ============================================
// بطل جدول الضرب - تطبيق البطل محمود
// ============================================

// State
const state = {
  heroName: localStorage.getItem('hero_name') || 'محمود',
  heroNick: localStorage.getItem('hero_nick') || 'حودة',
  stars: parseInt(localStorage.getItem('mahmoud_stars') || '0', 10),
  currentTable: 2,
  quizTable: 'all',
  quizQuestions: [],
  quizIndex: 0,
  quizScore: 0,
  streak: 0,
  raceMahmoudPos: 0,
  raceRivalPos: 0,
  raceInterval: null,
  raceCurrentQuestion: null,
  isPlayingAll: false,
  audioUnlocked: false,
};

// ============================================
// تحديث اسم البطل في الواجهة
// ============================================
function updateHeroNameUI() {
  const name = state.heroName || 'محمود';
  const nick = state.heroNick || 'حودة';

  // شاشة البداية (Splash)
  const splashTitle = document.querySelector('.splash-title');
  if (splashTitle) splashTitle.innerHTML = `أهلاً يا بطلنا<br>${name}! 🌟`;

  // هيدر التطبيق
  const headerName = document.querySelector('.user-name');
  if (headerName) headerName.textContent = `${name} البطل 🌟`;

  // حارة السباق
  const laneLabel = document.querySelector('.lane-label');
  if (laneLabel) laneLabel.textContent = `بطلنا ${name} 🦸‍♂️`;

  // شهادة التقدير
  const certName = document.querySelector('.cert-student-name');
  if (certName) certName.textContent = `${name} البطل (${nick}) 🌟`;
}

// ============================================
// AUDIO UNLOCK SPLASH
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('audio-splash');
  const mainApp = document.getElementById('main-app');
  const startBtn = document.getElementById('splash-start-btn');

  // تحديث الاسم أول ما الصفحة تفتح
  updateHeroNameUI();

  startBtn.addEventListener('click', () => {
    try {
      getAudioCtx();
      playSound('tap');
    } catch (e) {}

    // فتح المتصفح للصوت
    try {
      if ('speechSynthesis' in window) {
        const unlockUtter = new SpeechSynthesisUtterance(' ');
        unlockUtter.volume = 0.01;
        unlockUtter.lang = 'ar';
        window.speechSynthesis.speak(unlockUtter);
      }
    } catch (e) {}

    // إخفاء الـ Splash وإظهار التطبيق بسلاسة
    splash.style.opacity = '0';
    splash.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      splash.style.display = 'none';
      mainApp.style.display = 'flex';
      mainApp.style.flexDirection = 'column';
      mainApp.style.minHeight = '100vh';
    }, 300);

    // تشغيل التطبيق
    initApp();
  });
});

// Egyptian dialect numbers mapping
// nameA = العدد الأول (بالألف واللام): "التلاتة في..."
const egyptianNames = {
  1: 'الواحد', 2: 'التنين', 3: 'التلاتة', 4: 'الأربعة', 5: 'الخمسة',
  6: 'الستة', 7: 'السبعة', 8: 'التمنية', 9: 'التسعة', 10: 'العشرة',
  11: 'الحداشر', 12: 'الاتناشر'
};

// nameB = العدد التاني (بدون ألف ولام): "في تلاتة بـ..."
const egyptianNamesNoAl = {
  1: 'واحد', 2: 'تنين', 3: 'تلاتة', 4: 'أربعة', 5: 'خمسة',
  6: 'ستة', 7: 'سبعة', 8: 'تمنية', 9: 'تسعة', 10: 'عشرة',
  11: 'حداشر', 12: 'اتناشر'
};

const egyptianResults = {
  1: 'بواحد', 2: 'باتنين', 3: 'بتلاتة', 4: 'بأربعة', 5: 'بخمسة',
  6: 'بستة', 7: 'بسبعة', 8: 'بتمنية', 9: 'بتسعة', 10: 'بعشرة',
  11: 'بحداشر', 12: 'باتناشر', 14: 'باربعتاشر', 15: 'بخمسطاشر',
  16: 'بستاشر', 18: 'بتمنتاشر', 20: 'بعشرين', 21: 'بواحد وعشرين',
  22: 'باتنين وعشرين', 24: 'باربعة وعشرين', 25: 'بخمسة وعشرين',
  27: 'بسبعة وعشرين', 28: 'بتمنية وعشرين', 30: 'بتلاتين',
  32: 'باتنين وتلاتين', 33: 'بتلاتة وتلاتين', 35: 'بخمسة وتلاتين',
  36: 'بستة وتلاتين', 40: 'باربعين', 42: 'باتنين واربعين',
  44: 'باربعة واربعين', 45: 'بخمسة واربعين', 48: 'بتمنية واربعين',
  49: 'بتسعة واربعين', 50: 'بخمسين', 54: 'باربعة وخمسين',
  55: 'بخمسة وخمسين', 56: 'بستة وخمسين', 60: 'بستين',
  63: 'بتلاتة وستين', 64: 'باربعة وستين', 66: 'بستة وستين',
  70: 'بسبعين', 72: 'باتنين وسبعين', 77: 'بسبعة وسبعين',
  80: 'بتمنين', 81: 'بواحد وتمنين', 84: 'باربعة وتمنين',
  88: 'بتمنية وتمنين', 90: 'بتسعين', 96: 'بستة وتسعين',
  99: 'بتسعة وتسعين', 100: 'بمية', 108: 'بمية وتمانية',
  110: 'بمية وعشرة', 120: 'بمية وعشرين', 121: 'بمية وواحد وعشرين',
  132: 'بمية واتنين وتلاتين', 144: 'بمية واربعة واربعين'
};

function getEgyptianRhyme(a, b) {
  const nameA = egyptianNames[a] || a;
  // العدد التاني بدون ألف ولام: "في تلاتة" مش "في التلاتة"
  const nameB = egyptianNamesNoAl[b] || b;
  const prod = a * b;
  const res = egyptianResults[prod] || ('بـ ' + prod);
  return `${nameA} في ${nameB} ${res}`;
}

// Egyptian Praise phrases for Mahmoud
const cheersGood = [
  "عاش يا حودة يا بطل! 👏",
  "الله عليك يا نجم النجوم! 🌟",
  "وحش الرياضيات يا محمود! 🦁",
  "تسلم إيدك يا حودة.. ولا غلطة! 🚀",
  "إيه الشطارة دي كلها يا بطل! 🥇",
  "جدع يا محمود يا فنان! 🎨",
  "يا واد يا لعيب يا حودة! ⚽"
];

const cheersRetry = [
  "ولا يهمك يا حودة، فكر فيها تاني! 💪",
  "قريبة أهو يا بطل.. ركز شوية! ✨",
  "التكرار بيعلم الأبطال يا محمود! 🎯",
  "هاتها المرة دي يا حودة، انت قدها! 🔥"
];

// ============================================
// Web Audio Synthesizer
// ============================================

// لازم الـ AudioContext يتعمل بعد أول لمسة من المستخدم على الموبايل
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    if (type === 'correct') {
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.25);
      });
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'win') {
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, now + idx * 0.13);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.13 + 0.3);
        osc.start(now + idx * 0.13);
        osc.stop(now + idx * 0.13 + 0.35);
      });
    } else if (type === 'tap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 400;
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {
    console.warn('Audio error:', e);
  }
}

// Haptic feedback for mobile
function haptic(type) {
  if (!navigator.vibrate) return;
  if (type === 'success') {
    navigator.vibrate([60, 40, 60]);
  } else if (type === 'error') {
    navigator.vibrate([120]);
  } else {
    navigator.vibrate(40);
  }
}

// ============================================
// نظام الصوت المعتمد لتطبيق محمود (كما في تطبيق Kids)
// 1. تشغيل الملف الصوتي المباشر MP3 (يعمل 100% وبدون نت)
// 2. إذا لم يتوفر ملف، نطق أونلاين بسياسة no-referrer (Google TTS)
// 3. دعم SpeechSynthesis كخيار إضافي
// ============================================

let fallbackAudio = null;
let referrerMeta = null;

function setReferrerPolicy(policy) {
  try {
    if (!referrerMeta) {
      referrerMeta = document.createElement('meta');
      referrerMeta.name = 'referrer';
      document.head.appendChild(referrerMeta);
    }
    referrerMeta.content = policy;
  } catch (e) {}
  let done = false;
  return () => {
    if (done) return;
    done = true;
    try {
      referrerMeta.content = 'strict-origin-when-cross-origin';
    } catch (e) {}
  };
}

function hasArabicVoice() {
  try {
    return (
      ('speechSynthesis' in window) &&
      (window.speechSynthesis.getVoices() || []).some(v => /^ar/i.test(v.lang))
    );
  } catch (e) {
    return false;
  }
}

function stopAllSpeech() {
  if (fallbackAudio) {
    try {
      fallbackAudio.pause();
      fallbackAudio.currentTime = 0;
    } catch (e) {}
    fallbackAudio = null;
  }
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

// نطق أونلاين بنفس طريقة تطبيق Kids بدقة
function speakOnline(text) {
  stopAllSpeech();
  const clean = String(text || '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/[^\p{L}\p{N}\p{M}\s?!.,]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean || !navigator.onLine) return Promise.resolve(false);

  const chunks = [];
  let cur = '';
  clean.split(/\s+/).forEach(w => {
    if ((cur + ' ' + w).trim().length > 180) {
      chunks.push(cur.trim());
      cur = w;
    } else {
      cur = cur + ' ' + w;
    }
  });
  if (cur.trim()) chunks.push(cur.trim());

  const token = (fallbackAudio = new Audio());
  return chunks.reduce(
    (p, c) =>
      p.then(ok =>
        ok === false
          ? false
          : new Promise(res => {
              if (fallbackAudio !== token) return res(false);
              const restore = setReferrerPolicy('no-referrer');
              token.onloadstart = restore;
              token.src =
                'https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=' +
                encodeURIComponent(c);
              token.onended = () => {
                restore();
                res(true);
              };
              token.onerror = () => {
                restore();
                res(false);
              };
              token.play().catch(() => {
                restore();
                res(false);
              });
            })
      ),
    Promise.resolve(true)
  );
}

// دالة نطق النغمة لمسألة معينة (a × b)
async function speakRhyme(a, b) {
  stopAllSpeech();

  // 1. جرب الملف المحلي أولاً (سريع جداً ومضمون للأندرويد)
  const localOk = await new Promise(resolve => {
    const audio = (fallbackAudio = new Audio(`audio/${a}_${b}.mp3`));
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);
    audio.play().then(() => {}).catch(() => resolve(false));
  });

  if (localOk) return true;

  // 2. إذا تعذر الملف المحلي، استخدم speakOnline بنفس طريقة Kids
  const rhyme = getEgyptianRhyme(a, b);
  if (navigator.onLine) {
    const onlineOk = await speakOnline(rhyme);
    if (onlineOk) return true;
  }

  // 3. البديل الأخير speechSynthesis
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) return resolve(false);
    const u = new SpeechSynthesisUtterance(rhyme);
    u.lang = 'ar-EG';
    u.rate = 0.9;
    const v = window.speechSynthesis.getVoices().find(x => /^ar/i.test(x.lang));
    if (v) u.voice = v;
    u.onended = () => resolve(true);
    u.onerror = () => resolve(false);
    window.speechSynthesis.speak(u);
  });
}

// دالة نطق العبارات التشجيعية لمحمود
async function speakCheer(text, audioKey) {
  stopAllSpeech();

  if (audioKey) {
    const localOk = await new Promise(resolve => {
      const audio = (fallbackAudio = new Audio(`audio/${audioKey}.mp3`));
      audio.onended = () => resolve(true);
      audio.onerror = () => resolve(false);
      audio.play().then(() => {}).catch(() => resolve(false));
    });
    if (localOk) return true;
  }

  if (navigator.onLine) {
    const onlineOk = await speakOnline(text);
    if (onlineOk) return true;
  }

  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) return resolve(false);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-EG';
    u.rate = 0.9;
    const v = window.speechSynthesis.getVoices().find(x => /^ar/i.test(x.lang));
    if (v) u.voice = v;
    u.onended = () => resolve(true);
    u.onerror = () => resolve(false);
    window.speechSynthesis.speak(u);
  });
}

// Update UI Stars
function addStars(num) {
  state.stars += num;
  localStorage.setItem('mahmoud_stars', state.stars);
  document.getElementById('total-stars').textContent = state.stars;
}

// ============================================
// TAB NAVIGATION
// ============================================
const navItems = document.querySelectorAll('.bottom-nav .nav-item');
const screens = document.querySelectorAll('.screen-section');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    playSound('tap');
    haptic('tap');
    stopYoutubeSong();
    stopAllSpeech();
    const tabId = item.getAttribute('data-tab');
    navItems.forEach(b => b.classList.remove('active'));
    screens.forEach(s => s.classList.remove('active'));

    item.classList.add('active');
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'tab-racing') {
      initRaceGame();
    }
  });
});

// ============================================
// أغاني جدول الضرب الحية للأطفال من اليوتيوب (جداول 1 إلى 4)
// ============================================
const YOUTUBE_TABLE_SONGS = {
  1: { start: 2, end: 27 },
  2: { start: 28, end: 57 },
  3: { start: 58, end: 91 },
  4: { start: 92, end: 128 },
};

let youtubeSongAudio = null;
let youtubeSongInterval = null;

function stopYoutubeSong() {
  if (youtubeSongAudio) {
    try {
      youtubeSongAudio.pause();
    } catch (e) {}
    youtubeSongAudio = null;
  }
  if (youtubeSongInterval) {
    clearInterval(youtubeSongInterval);
    youtubeSongInterval = null;
  }
  const btn = document.getElementById('btn-play-youtube-song');
  if (btn) {
    btn.classList.remove('playing');
    const lbl = document.getElementById('youtube-song-label');
    if (lbl) lbl.textContent = `أنشودة جدول ${state.currentTable} الحية للأطفال (يوتيوب) 🎵`;
  }
}

function toggleYoutubeTableSong(tableNum) {
  if (youtubeSongAudio) {
    stopYoutubeSong();
    return;
  }

  const segment = YOUTUBE_TABLE_SONGS[tableNum];
  if (!segment) return;

  stopAllSpeech();
  playSound('tap');
  haptic('tap');

  const btn = document.getElementById('btn-play-youtube-song');
  const lbl = document.getElementById('youtube-song-label');

  const audio = (youtubeSongAudio = new Audio('audio/song_1_to_4.mp4'));
  audio.currentTime = segment.start;

  if (btn) btn.classList.add('playing');
  if (lbl) lbl.textContent = `⏹️ إيقاف أنشودة جدول ${tableNum}`;

  audio.play().then(() => {
    youtubeSongInterval = setInterval(() => {
      if (!youtubeSongAudio || audio.currentTime >= segment.end) {
        stopYoutubeSong();
      }
    }, 200);
  }).catch(e => {
    console.warn('Playback error', e);
    stopYoutubeSong();
  });
}

// ============================================
// SECTION 1: LEARN (النغمة المصرية)
// ============================================
function initLearnSection() {
  const chipsContainer = document.getElementById('table-chips');
  chipsContainer.innerHTML = '';

  for (let i = 1; i <= 12; i++) {
    const chip = document.createElement('button');
    chip.className = `table-chip ${i === state.currentTable ? 'active' : ''}`;
    chip.textContent = `جدول ${i}`;
    chip.addEventListener('click', () => {
      playSound('tap');
      haptic('tap');
      stopYoutubeSong();
      if (state.isPlayingAll) {
        state.isPlayingAll = false;
        stopAllSpeech();
        const playBtn = document.getElementById('btn-play-all');
        if (playBtn) playBtn.innerHTML = '<span>🔊 غنّي الجدول كله</span>';
      }
      state.currentTable = i;
      document.querySelectorAll('.table-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderTableRows(i);
    });
    chipsContainer.appendChild(chip);
  }

  renderTableRows(state.currentTable);

  const ytBtn = document.getElementById('btn-play-youtube-song');
  if (ytBtn) {
    ytBtn.addEventListener('click', () => {
      toggleYoutubeTableSong(state.currentTable);
    });
  }

  document.getElementById('btn-play-all').addEventListener('click', () => {
    playSound('tap');
    stopYoutubeSong();
    if (state.isPlayingAll) {
      state.isPlayingAll = false;
      stopAllSpeech();
      const playBtn = document.getElementById('btn-play-all');
      if (playBtn) playBtn.innerHTML = '<span>🔊 غنّي الجدول كله</span>';
      return;
    }
    playAllTableRows(state.currentTable);
  });
}

function renderTableRows(tableNum) {
  document.getElementById('current-table-title').textContent = `جدول ضرب ${tableNum}`;
  const container = document.getElementById('table-rows-container');
  container.innerHTML = '';

  // تفعيل أو إخفاء زر أغنية اليوتيوب للأطفال (متوفرة لجداول 1 إلى 4)
  const banner = document.getElementById('youtube-song-banner');
  if (banner) {
    if (YOUTUBE_TABLE_SONGS[tableNum]) {
      banner.style.display = 'block';
      const lbl = document.getElementById('youtube-song-label');
      if (lbl && !youtubeSongAudio) {
        lbl.textContent = `أنشودة جدول ${tableNum} الحية للأطفال (يوتيوب) 🎵`;
      }
    } else {
      banner.style.display = 'none';
    }
  }

  // يبدأ الجدول من نفس العدد (مثلاً جدول 5 يبدأ من 5×5، وجدول 7 من 7×7، وجدول 12 سطر واحد فقط 12×12)
  for (let i = tableNum; i <= 12; i++) {
    const rhyme = getEgyptianRhyme(tableNum, i);
    const row = document.createElement('div');
    row.className = 'table-row-item';
    row.id = `row-${tableNum}-${i}`;
    row.innerHTML = `
      <div class="row-math">${tableNum} × ${i} = <strong>${tableNum * i}</strong></div>
      <div class="row-egyptian">"${rhyme}"</div>
      <div class="row-speaker-icon">🔊</div>
    `;

    row.addEventListener('click', () => {
      playSound('tap');
      haptic('tap');
      highlightRow(row);
      speakRhyme(tableNum, i);
    });

    container.appendChild(row);
  }
}

function highlightRow(element) {
  document.querySelectorAll('.table-row-item').forEach(r => r.classList.remove('highlighted'));
  element.classList.add('highlighted');
  setTimeout(() => element.classList.remove('highlighted'), 1600);
}

async function playAllTableRows(tableNum) {
  if (state.isPlayingAll) return;
  state.isPlayingAll = true;
  const playBtn = document.getElementById('btn-play-all');
  if (playBtn) playBtn.innerHTML = '<span>⏹️ إيقاف</span>';

  // القراءة تبدأ من نفس العدد حتى 12
  for (let i = tableNum; i <= 12; i++) {
    if (!state.isPlayingAll || state.currentTable !== tableNum) break;

    const row = document.getElementById(`row-${tableNum}-${i}`);
    if (row) {
      highlightRow(row);
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    // نطق كل سطر وانتظار انتهائه تماماً قبل الانتقال للسطر التالي
    await speakRhyme(tableNum, i);
    if (!state.isPlayingAll || state.currentTable !== tableNum) break;
    // استراحة مريحة بين كل سطر والتاني
    await new Promise(r => setTimeout(r, 450));
  }

  if (state.isPlayingAll && state.currentTable === tableNum) {
    const finishPraise = "الله عليك يا حودة يا بطل، خلصت الجدول كله!";
    await speakCheer(finishPraise, 'finish');
    fireConfetti();
    addStars(10);
  }

  state.isPlayingAll = false;
  if (playBtn) playBtn.innerHTML = '<span>🔊 غنّي الجدول كله</span>';
}

// ============================================
// SECTION 2: QUIZ (تحدي الأبطال)
// ============================================
function initQuizSection() {
  const grid = document.getElementById('quiz-table-buttons');
  grid.innerHTML = '';

  // All tables cocktail button
  const allBtn = document.createElement('button');
  allBtn.className = 'quiz-opt-btn span-all active';
  allBtn.textContent = '🌟 كوكتيل كل الجداول (للمحترفين!)';
  allBtn.addEventListener('click', () => {
    playSound('tap');
    haptic('tap');
    document.querySelectorAll('.quiz-opt-btn').forEach(b => b.classList.remove('active'));
    allBtn.classList.add('active');
    state.quizTable = 'all';
  });
  grid.appendChild(allBtn);

  for (let i = 2; i <= 12; i++) {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn';
    btn.textContent = `جدول ${i}`;
    btn.addEventListener('click', () => {
      playSound('tap');
      haptic('tap');
      document.querySelectorAll('.quiz-opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.quizTable = i;
    });
    grid.appendChild(btn);
  }

  document.getElementById('btn-start-quiz').addEventListener('click', startQuiz);
  document.getElementById('btn-play-again').addEventListener('click', () => {
    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('quiz-setup').classList.remove('hidden');
  });
  document.getElementById('btn-go-racing').addEventListener('click', () => {
    document.querySelector('[data-tab="tab-racing"]').click();
  });
}

function startQuiz() {
  playSound('tap');
  haptic('tap');
  state.quizQuestions = generateQuestions(state.quizTable, 10);
  state.quizIndex = 0;
  state.quizScore = 0;
  state.streak = 0;

  document.getElementById('quiz-setup').classList.add('hidden');
  document.getElementById('quiz-results').classList.add('hidden');
  document.getElementById('quiz-game').classList.remove('hidden');

  showQuizQuestion();
}

function generateQuestions(table, count) {
  const list = [];
  for (let i = 0; i < count; i++) {
    let a, b;
    if (table === 'all') {
      a = Math.floor(Math.random() * 11) + 2; // 2..12
      b = Math.floor(Math.random() * 11) + 2;
    } else {
      a = parseInt(table, 10);
      b = Math.floor(Math.random() * 11) + 2;
    }
    const correct = a * b;

    // Generate 3 plausible fake answers
    const choices = new Set([correct]);
    while (choices.size < 4) {
      let offset = (Math.floor(Math.random() * 7) - 3) * (Math.random() > 0.5 ? a : b);
      if (offset === 0) offset = a;
      let fake = correct + offset;
      if (fake > 0 && fake !== correct) {
        choices.add(fake);
      } else {
        choices.add(correct + Math.floor(Math.random() * 10) + 1);
      }
    }

    list.push({
      a,
      b,
      correct,
      choices: Array.from(choices).sort(() => Math.random() - 0.5)
    });
  }
  return list;
}

function showQuizQuestion() {
  const q = state.quizQuestions[state.quizIndex];
  document.getElementById('quiz-question-counter').textContent = `سؤال ${state.quizIndex + 1} من 10`;
  document.getElementById('streak-count').textContent = state.streak;

  document.getElementById('num-a').textContent = q.a;
  document.getElementById('num-b').textContent = q.b;
  document.getElementById('question-rhyme').textContent = `"${egyptianNames[q.a] || q.a} في ${egyptianNamesNoAl[q.b] || q.b} بكام يا بطل؟"`;

  const balloon = document.getElementById('cheer-balloon');
  balloon.classList.remove('show', 'wrong');

  const choicesContainer = document.getElementById('quiz-choices');
  choicesContainer.innerHTML = '';

  q.choices.forEach(ans => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = ans;
    btn.addEventListener('click', () => handleChoice(btn, ans, q.correct));
    choicesContainer.appendChild(btn);
  });
}

function handleChoice(button, selected, correct) {
  const choicesContainer = document.getElementById('quiz-choices');
  const allBtns = choicesContainer.querySelectorAll('.choice-btn');
  allBtns.forEach(b => b.disabled = true);

  const balloon = document.getElementById('cheer-balloon');
  const balloonMsg = document.getElementById('cheer-message');
  const balloonEmoji = document.getElementById('cheer-emoji');

  if (selected === correct) {
    // Correct!
    button.classList.add('correct');
    playSound('correct');
    haptic('success');
    state.quizScore++;
    state.streak++;
    addStars(5);

    const randCheerNum = Math.floor(Math.random() * cheersGood.length);
    const praise = cheersGood[randCheerNum];
    balloonEmoji.textContent = '👏';
    balloonMsg.textContent = praise;
    balloon.classList.remove('wrong');
    balloon.classList.add('show');
    speakCheer(praise.replace(/[^\u0621-\u064A\s]/g, ''), 'c_' + (randCheerNum + 1));
  } else {
    // Incorrect
    button.classList.add('incorrect');
    playSound('wrong');
    haptic('error');
    state.streak = 0;

    // Highlight correct one
    allBtns.forEach(b => {
      if (parseInt(b.textContent, 10) === correct) {
        b.classList.add('correct');
      }
    });

    const randRetryNum = Math.floor(Math.random() * cheersRetry.length);
    const retryMsg = cheersRetry[randRetryNum];
    balloonEmoji.textContent = '💡';
    balloonMsg.textContent = retryMsg;
    balloon.classList.add('show', 'wrong');
    speakCheer(retryMsg.replace(/[^\u0621-\u064A\s]/g, ''), 'retry_' + (randRetryNum + 1));
  }

  setTimeout(() => {
    state.quizIndex++;
    if (state.quizIndex < state.quizQuestions.length) {
      showQuizQuestion();
    } else {
      endQuiz();
    }
  }, 1600);
}

function endQuiz() {
  document.getElementById('quiz-game').classList.add('hidden');
  const resultsBox = document.getElementById('quiz-results');
  resultsBox.classList.remove('hidden');

  const scoreText = `${state.quizScore} من 10`;
  document.getElementById('result-score').textContent = scoreText;

  const gainedStars = state.quizScore * 5;
  document.getElementById('result-stars').textContent = `+${gainedStars} ⭐`;

  const title = document.getElementById('result-title');
  const desc = document.getElementById('result-desc');

  if (state.quizScore >= 8) {
    title.textContent = "عاش يا حودة يا أسطورة! 🏆";
    desc.textContent = "مستوى استثنائي وعقلك شغال زي الصاروخ ما شاء الله!";
    playSound('win');
    fireConfetti();
    speakCheer("عاش يا حودة يا أسطورة، رفعت راسنا يا بطل!", 'c_1');
  } else {
    title.textContent = "بطل ومحاولة رائعة يا حودة! 👏";
    desc.textContent = "كل مرة بتلعب فيها بتكسب سرعة أكتر، جرب كمان جولة!";
    speakCheer("بطل ومحاولة جميلة يا حودة، يالا نجرب كمان جولة!", 'retry_1');
  }
}

// ============================================
// SECTION 3: RACING MINI-GAME (سباق الأبطال)
// ============================================
function initRaceGame() {
  state.raceMahmoudPos = 0;
  state.raceRivalPos = 0;
  updateRaceCarPositions();
  nextRaceQuestion();

  if (state.raceInterval) clearInterval(state.raceInterval);
  // Rival creeps forward slowly
  state.raceInterval = setInterval(() => {
    if (state.raceRivalPos < 85 && state.raceMahmoudPos < 85) {
      state.raceRivalPos += 2.5;
      updateRaceCarPositions();
    }
  }, 1200);
}

function updateRaceCarPositions() {
  const mCar = document.getElementById('mahmoud-car');
  const rCar = document.getElementById('rival-car');
  mCar.style.right = `${state.raceMahmoudPos}%`;
  rCar.style.right = `${state.raceRivalPos}%`;
}

function nextRaceQuestion() {
  const a = Math.floor(Math.random() * 9) + 3;
  const b = Math.floor(Math.random() * 9) + 3;
  const correct = a * b;

  document.getElementById('race-question-text').textContent = `${a} × ${b} = ؟`;

  const choices = new Set([correct]);
  while (choices.size < 4) {
    let fake = correct + (Math.floor(Math.random() * 5) - 2) * a;
    if (fake > 0 && fake !== correct) choices.add(fake);
    else choices.add(correct + Math.floor(Math.random() * 10) + 1);
  }

  const container = document.getElementById('race-options');
  container.innerHTML = '';

  Array.from(choices).sort(() => Math.random() - 0.5).forEach(ans => {
    const btn = document.createElement('button');
    btn.className = 'race-btn';
    btn.textContent = ans;
    btn.addEventListener('click', () => {
      if (ans === correct) {
        playSound('correct');
        haptic('success');
        state.raceMahmoudPos += 18;
        addStars(3);
        updateRaceCarPositions();

        if (state.raceMahmoudPos >= 85) {
          // Mahmoud Wins!
          clearInterval(state.raceInterval);
          playSound('win');
          fireConfetti();
          speakCheer("مبروك يا حودة كسبت السباق ببراعة!", "finish");
          setTimeout(() => {
            alert("🏎️🏆 عااااش يا حودة! كسبت الروبوت ووصلت لخط النهاية الأول!");
            initRaceGame();
          }, 400);
        } else {
          nextRaceQuestion();
        }
      } else {
        playSound('wrong');
        haptic('error');
        state.raceRivalPos += 8;
        updateRaceCarPositions();
      }
    });
    container.appendChild(btn);
  });
}

// ============================================
// SECTION 4: CERTIFICATE & PRINTING
// ============================================
function initCertificate() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const dateElem = document.getElementById('cert-today-date');
  if (dateElem) dateElem.textContent = dateStr;

  document.getElementById('btn-print-cert').addEventListener('click', () => {
    playSound('tap');
    fireConfetti();
    window.print();
  });
}

// ============================================
// CONFETTI CANNON (No external dependencies)
// ============================================
function fireConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.8) * 20,
      size: Math.random() * 9 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      opacity: 1
    });
  }

  let animFrame;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.55; // gravity
      p.rotation += p.vRot;
      p.opacity -= 0.012;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      animFrame = requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animFrame);
    }
  }

  update();
}

// ============================================
// صفحة / مودال الإعدادات (لتعديل اسم البطل واللقب)
// ============================================
function initSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const btnOpen = document.getElementById('btn-open-settings');
  const btnClose = document.getElementById('btn-close-settings');
  const btnSave = document.getElementById('btn-save-settings');
  const inputName = document.getElementById('input-hero-name');
  const inputNick = document.getElementById('input-hero-nick');

  if (!modal || !btnOpen) return;

  btnOpen.addEventListener('click', () => {
    playSound('tap');
    haptic('tap');
    inputName.value = state.heroName;
    inputNick.value = state.heroNick;
    modal.classList.remove('hidden');
  });

  const closeModal = () => {
    playSound('tap');
    modal.classList.add('hidden');
  };

  if (btnClose) btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      playSound('correct');
      haptic('success');
      const newName = inputName.value.trim() || 'محمود';
      const newNick = inputNick.value.trim() || 'حودة';
      state.heroName = newName;
      state.heroNick = newNick;
      localStorage.setItem('hero_name', newName);
      localStorage.setItem('hero_nick', newNick);
      updateHeroNameUI();
      closeModal();
      fireConfetti();
    });
  }
}

// ============================================
// SERVICE WORKER REGISTRATION (Offline support)
// ============================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}

// ============================================
// initApp - يتشغل بعد ضغطة الـ splash
// ============================================
function initApp() {
  document.getElementById('total-stars').textContent = state.stars;
  updateHeroNameUI();
  initSettingsModal();
  initLearnSection();
  initQuizSection();
  initCertificate();
}
