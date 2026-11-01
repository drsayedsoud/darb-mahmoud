// ============================================
// بطل جدول الضرب - تطبيق البطل محمود
// ============================================

// State
const state = {
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
};

// Egyptian dialect numbers mapping
const egyptianNames = {
  1: 'الواحد', 2: 'التنين', 3: 'التلاتة', 4: 'الأربعة', 5: 'الخمسة',
  6: 'الستة', 7: 'السبعة', 8: 'التمنية', 9: 'التسعة', 10: 'العشرة',
  11: 'الحداشر', 12: 'الاتناشر'
};

const egyptianResults = {
  1: 'بواحد', 2: 'باتنين', 3: 'بتلاتة', 4: 'بأربعة', 5: 'بخمسة',
  6: 'بستة', 7: 'بسبعة', 8: 'بتمنية', 9: 'بتسعة', 10: 'بعشرة',
  11: 'بحداشر', 12: 'باتناشر', 14: 'باربعتاشر', 15: 'بخمسطاشر',
  16: 'بستاشر', 18: 'بتمناشر', 20: 'بعشرين', 21: 'بواحد وعشرين',
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
  const nameB = egyptianNames[b] || b;
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
// Web Audio Synthesizer (No external files needed)
// ============================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'win') {
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.25, now + idx * 0.12);
        g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
        o.start(now + idx * 0.12);
        o.stop(now + idx * 0.12 + 0.35);
      });
    } else if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {
    console.log("Audio not allowed yet", e);
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

// Speech synthesis (Web Speech API)
function speakEgyptian(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-EG';
  utterance.rate = 0.95;
  utterance.pitch = 1.1; // Cheerful friendly tone for kids
  window.speechSynthesis.speak(utterance);
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
      state.currentTable = i;
      document.querySelectorAll('.table-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderTableRows(i);
    });
    chipsContainer.appendChild(chip);
  }

  renderTableRows(state.currentTable);

  document.getElementById('btn-play-all').addEventListener('click', () => {
    playSound('tap');
    playAllTableRows(state.currentTable);
  });
}

function renderTableRows(tableNum) {
  document.getElementById('current-table-title').textContent = `جدول ضرب ${tableNum}`;
  const container = document.getElementById('table-rows-container');
  container.innerHTML = '';

  for (let i = 1; i <= 12; i++) {
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
      speakEgyptian(rhyme);
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

  for (let i = 1; i <= 12; i++) {
    const row = document.getElementById(`row-${tableNum}-${i}`);
    if (row) {
      highlightRow(row);
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    const rhyme = getEgyptianRhyme(tableNum, i);
    speakEgyptian(rhyme);
    await new Promise(r => setTimeout(r, 2200));
  }

  state.isPlayingAll = false;
  // Final praise for finishing the table!
  const finishPraise = "الله عليك يا حودة يا بطل، خلصت الجدول كله!";
  speakEgyptian(finishPraise);
  fireConfetti();
  addStars(10);
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
  document.getElementById('question-rhyme').textContent = `"${egyptianNames[q.a] || q.a} في ${egyptianNames[q.b] || q.b} بكام يا بطل؟"`;

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

    const praise = cheersGood[Math.floor(Math.random() * cheersGood.length)];
    balloonEmoji.textContent = '👏';
    balloonMsg.textContent = praise;
    balloon.classList.remove('wrong');
    balloon.classList.add('show');
    speakEgyptian(praise.replace(/[^\u0621-\u064A\s]/g, ''));
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

    const retryMsg = cheersRetry[Math.floor(Math.random() * cheersRetry.length)];
    balloonEmoji.textContent = '💡';
    balloonMsg.textContent = retryMsg;
    balloon.classList.add('show', 'wrong');
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
    speakEgyptian("عاش يا حودة يا أسطورة، رفعت راسنا يا بطل!");
  } else {
    title.textContent = "بطل ومحاولة رائعة يا حودة! 👏";
    desc.textContent = "كل مرة بتلعب فيها بتكسب سرعة أكتر، جرب كمان جولة!";
    speakEgyptian("بطل ومحاولة جميلة يا حودة، يالا نجرب كمان جولة!");
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
          speakEgyptian("مبروك يا حودة كسبت السباق ببراعة!");
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
// SERVICE WORKER REGISTRATION (Offline support)
// ============================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}

// Initial Launch
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('total-stars').textContent = state.stars;
  initLearnSection();
  initQuizSection();
  initCertificate();
});
