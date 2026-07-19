/* ============================================================
   KONFIGURASI — edit bagian ini sesuai kebutuhanmu
   ============================================================ */
const BIRTH_DATE = { day: 21, month: 12, year: 2006 }; // ulang tahun Bintang Eka

// Isi 3 baris di bawah ini SETELAH kamu buat akun gratis di https://www.emailjs.com
// supaya pesan balasan dari halaman terakhir terkirim ke email kamu.
// Kalau dibiarkan kosong, pesan tetap tersimpan lokal & bisa dilihat lewat admin.html
// (hanya di HP/browser yang sama tempat dia menulis).
const EMAILJS_PUBLIC_KEY  = ""; // contoh: "AbCdEfGhIjKlMnOp"
const EMAILJS_SERVICE_ID  = ""; // contoh: "service_xxxxxxx"
const EMAILJS_TEMPLATE_ID = ""; // contoh: "template_xxxxxxx"

/* ============================================================
   GERBANG MASUK + LOADING BAR + AUDIO
   ============================================================ */
const gate = document.getElementById('gate');
const gateProgress = document.getElementById('gateProgress');
const enterBtn = document.getElementById('enterBtn');
const site = document.getElementById('site');
const bgAudio = document.getElementById('bgAudio');
const muteBtn = document.getElementById('muteBtn');

let progress = 0;
const loadTimer = setInterval(() => {
  progress += Math.random() * 12 + 4;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loadTimer);
    enterBtn.disabled = false;
    enterBtn.textContent = 'KETUK UNTUK MEMBUKA';
  }
  gateProgress.style.width = progress + '%';
}, 180);

enterBtn.addEventListener('click', () => {
  if (enterBtn.disabled) return;
  bgAudio.volume = 0.55;
  bgAudio.play().catch(() => { /* browser tetap butuh interaksi user, ini sudah interaksi */ });
  gate.classList.add('hidden');
  site.classList.add('show');
});

let muted = false;
muteBtn.addEventListener('click', () => {
  muted = !muted;
  bgAudio.muted = muted;
  muteBtn.classList.toggle('muted', muted);
  muteBtn.textContent = muted ? '✕' : '♪';
});

/* ============================================================
   HITUNG UMUR OTOMATIS DARI TANGGAL LAHIR
   ============================================================ */
function getUpcomingAge() {
  const now = new Date();
  const thisYearBday = new Date(now.getFullYear(), BIRTH_DATE.month - 1, BIRTH_DATE.day);
  let age = now.getFullYear() - BIRTH_DATE.year;
  if (now < thisYearBday) age -= 0; // sebelum ulang tahun tahun ini, ini usia yang akan dirayakan
  else age += 1;
  return age;
}
const AGE = getUpcomingAge();

/* ============================================================
   GAMBAR LILIN SESUAI UMUR
   ============================================================ */
const candlesGroup = document.getElementById('candles');
const totalCandles = Math.min(Math.max(AGE, 1), 24); // batasi max 24 biar tidak penuh
const spacing = 130 / (totalCandles + 1);
for (let i = 0; i < totalCandles; i++) {
  const x = 95 + spacing * (i + 1);
  const ns = 'http://www.w3.org/2000/svg';
  const wick = document.createElementNS(ns, 'rect');
  wick.setAttribute('x', x - 1.5);
  wick.setAttribute('y', 90);
  wick.setAttribute('width', 3);
  wick.setAttribute('height', 25);
  wick.setAttribute('fill', 'currentColor');
  candlesGroup.appendChild(wick);

  const flame = document.createElementNS(ns, 'path');
  flame.setAttribute('class', 'candle-flame');
  flame.setAttribute('d', `M${x} 78 C ${x-5} 84, ${x-5} 90, ${x} 90 C ${x+5} 90, ${x+5} 84, ${x} 78 Z`);
  flame.setAttribute('fill', 'currentColor');
  flame.dataset.flame = 'true';
  candlesGroup.appendChild(flame);
}

/* ============================================================
   TIUP LILIN — via mic (deteksi tiupan) ATAU tekan & tahan tombol
   ============================================================ */
const blowBtn = document.getElementById('blowBtn');
const wishReveal = document.getElementById('wishReveal');
const wishAge = document.getElementById('wishAge');
const smokeLayer = document.getElementById('smokeLayer');
const cakeHint = document.getElementById('cakeHint');
wishAge.textContent = `Selamat ulang tahun yang ke-${AGE}!`;

let blown = false;

function extinguishCandles() {
  if (blown) return;
  blown = true;
  document.querySelectorAll('[data-flame]').forEach(f => f.classList.add('out'));
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('div');
    s.className = 'smoke';
    s.style.left = (30 + Math.random() * 40) + '%';
    s.style.animationDelay = (Math.random() * 0.4) + 's';
    smokeLayer.appendChild(s);
  }
  blowBtn.textContent = 'LILIN SUDAH TERTIUP ✓';
  blowBtn.classList.add('done');
  cakeHint.textContent = 'Permohonanmu sudah dikirim ke langit ✨';
  setTimeout(() => wishReveal.classList.add('show'), 400);
}

// Tekan & tahan
let holdTimer = null;
function startHold() {
  if (blown) return;
  holdTimer = setTimeout(extinguishCandles, 900);
}
function cancelHold() { clearTimeout(holdTimer); }
blowBtn.addEventListener('mousedown', startHold);
blowBtn.addEventListener('touchstart', startHold, { passive: true });
blowBtn.addEventListener('mouseup', cancelHold);
blowBtn.addEventListener('mouseleave', cancelHold);
blowBtn.addEventListener('touchend', cancelHold);

// Deteksi tiupan lewat microphone (opsional, fallback diam-diam kalau gagal/ditolak)
async function setupMicBlow() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    function check() {
      if (blown) return;
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      if (avg > 55) extinguishCandles();
      requestAnimationFrame(check);
    }
    check();
  } catch (e) {
    // mic tidak diizinkan / tidak tersedia — tombol tekan & tahan tetap berfungsi
  }
}
setupMicBlow();

/* ============================================================
   HALAMAN BELAKANG — form balasan
   ============================================================ */
const forgiveBtns = document.querySelectorAll('.forgive-btn');
let forgiveValue = '';
forgiveBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    forgiveBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    forgiveValue = btn.dataset.value;
  });
});

const replyForm = document.getElementById('replyForm');
const replyStatus = document.getElementById('replyStatus');

replyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const wishText = document.getElementById('wishSelf').value.trim();
  if (!forgiveValue) {
    replyStatus.textContent = 'Pilih dulu salah satu jawaban ya 🙂';
    return;
  }
  if (!wishText) return;

  const payload = {
    forgive: forgiveValue,
    message: wishText,
    time: new Date().toLocaleString('id-ID')
  };

  // simpan cadangan lokal (bisa dilihat lewat admin.html di perangkat yang sama)
  const saved = JSON.parse(localStorage.getItem('bintang_eka_messages') || '[]');
  saved.push(payload);
  localStorage.setItem('bintang_eka_messages', JSON.stringify(saved));

  replyStatus.textContent = 'Mengirim...';
  const submitBtn = replyForm.querySelector('.submit-btn');
  submitBtn.disabled = true;

  // simpan ke Firestore (kalau sudah dikonfigurasi) supaya bisa
  // dibaca dari admin.html di HP manapun
  if (typeof FIREBASE_ENABLED !== 'undefined' && FIREBASE_ENABLED) {
    try {
      const db = getFirestore();
      await db.collection('messages').add({
        forgive: payload.forgive,
        message: payload.message,
        time: payload.time,
        created: window.firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      // gagal simpan ke cloud, tetap lanjut, sudah ada cadangan lokal di atas
    }
  }

  if (EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
    try {
      await loadEmailJs();
      emailjs.init(EMAILJS_PUBLIC_KEY);
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        forgive: payload.forgive,
        message: payload.message,
        time: payload.time
      });
      replyStatus.textContent = 'Terkirim. Terima kasih sudah menulis ini untukku 🤍';
    } catch (err) {
      replyStatus.textContent = 'Tersimpan di perangkat ini (pengiriman email gagal).';
    }
  } else {
    replyStatus.textContent = 'Tersimpan. Terima kasih sudah menulis ini untukku 🤍';
  }
  submitBtn.disabled = false;
  replyForm.reset();
  forgiveBtns.forEach(b => b.classList.remove('active'));
  forgiveValue = '';
});

function loadEmailJs() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
