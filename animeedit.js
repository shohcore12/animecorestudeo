
const EDITS = [
  { title: "Qorong'u Qasos",     file: "6999063_0.mp4"  },
  { title: "So'nggi Zarba",      file: "0df7cc0d9d0b382acfd9803a33ea8010c5974209c9823d8a597cfd9187b473de.mp4"  },
  { title: "Yovuz Tabassum",     file: "video_2026-07-13_13-11-24.mp4" },
  { title: "Kulrang Osmon",      file: "5677325973_1_tiktok_69873c330668f2_47850060.mp4" },
  { title: "Yirtqich Instinkt",  file: "1429821924_1_tiktok_69882b4f3ecdd0_69013838.mp4" },
  { title: "Vayronagar Kuch",    file: "1995422243_1_tiktok_6977a4f242aae8_95040125.mp4" },
  { title: "Qonli Marosim",      file: "451990937_1_tiktok_69689ceb56d6d5_47861941.mp4" },
  { title: "Tund Uyg'onish",     file: "1615906393_1_tiktok_69688338a8eca4_81533184.mp4" },
  { title: "Halok Bo'lgan Umid", file: "162683317_1_tiktok_69671ff9508e72_05886723.mp4" },
  { title: "Zulmat Farzandi",    file: "8452142751.mp4" },
  { title: "So'nggi Nafas",      file: "SaveVid_Net_AQO8XKi9vaDwQvyHATVu_45w5J40ys2AVMH4hsj_3bHmsEXMqTj.mp4" },
  { title: "Abadiy Jang",        file: "AQPLM_Wf_xEKb7kQGHg5qDgY288RdfVFMk_ENezrILkzWBCfpYvpEv2ltA4hjzu.mp4" },
];

const intro         = document.getElementById('intro');
const mainSite       = document.getElementById('mainSite');
const introVideo     = document.getElementById('introVideo');
const startOverlay   = document.getElementById('startOverlay');
const startBtn       = document.getElementById('startBtn');
const skipBtn        = document.getElementById('skipBtn');
const progressBar    = document.getElementById('progressBar');
const introNote      = document.getElementById('introNote');

let introEnded = false;

function goToSite(){
  if (introEnded) return;
  introEnded = true;
  intro.classList.add('hidden');
  introVideo.pause();
  setTimeout(() => {
    intro.style.display = 'none';
    mainSite.classList.add('show');
  }, 480);
}

startBtn.addEventListener('click', () => {
  startOverlay.classList.add('hidden');
  introVideo.muted = false;
  introVideo.volume = 1;
  introVideo.currentTime = 0;
  const p = introVideo.play();
  if (p !== undefined) {
    p.catch(() => {
      introNote.textContent = "Video topilmadi — videos/intro.mp4 ni qo'ying.";
      setTimeout(goToSite, 1800);
    });
  }
});

introVideo.addEventListener('ended', goToSite);

introVideo.addEventListener('timeupdate', () => {
  if (introVideo.duration) {
    progressBar.style.width = (introVideo.currentTime / introVideo.duration * 100) + '%';
  }
});


introVideo.addEventListener('error', () => {
  if (!startOverlay.classList.contains('hidden')) return; 
});

skipBtn.addEventListener('click', goToSite);

const gallery      = document.getElementById('gallery');
const noResults    = document.getElementById('noResults');
const searchInput  = document.getElementById('searchInput');
const visibleCount = document.getElementById('visibleCount');

const modalBackdrop    = document.getElementById('modalBackdrop');
const modalVideo       = document.getElementById('modalVideo');
const modalVideoWrap   = document.getElementById('modalVideoWrap');
const modalTitle       = document.getElementById('modalTitle');
const modalEp          = document.getElementById('modalEp');
const modalMissingName = document.getElementById('modalMissingName');
const modalClose       = document.getElementById('modalClose');
const tgHeaderBtn      = document.getElementById('tgHeaderBtn');

const playIcon = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
const muteIcon = '<svg viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0014 8v8a4.5 4.5 0 002.5-4zM3 9v6h4l5 5V4L7 9H3zm14.5-3.5-1.4 1.4A6.98 6.98 0 0119 12a6.98 6.98 0 01-2.9 5.1l1.4 1.4A8.98 8.98 0 0021 12a8.98 8.98 0 00-3.5-6.5z"/></svg>';

function buildCards(){
  EDITS.forEach((edit, i) => {
    const num = String(i + 1).padStart(2, '0');
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.title = edit.title.toLowerCase();

    card.innerHTML = `
      <video class="card-video" muted loop playsinline preload="metadata">
        <source src="${edit.file}" type="video/mp4">
      </video>
      <div class="placeholder-art">
        <div class="placeholder-glyph">EC</div>
        <div class="placeholder-num">EDIT #${num}</div>
      </div>
      <div class="card-scrim"></div>
      <div class="muted-badge">${muteIcon}</div>
      <div class="play-badge">${playIcon}</div>
      <div class="card-info">
        <div class="ep">Edit #${num}</div>
        <h3>${edit.title}</h3>
      </div>
    `;

    const video = card.querySelector('.card-video');
    video.addEventListener('error', () => card.classList.add('video-missing'));
    video.play().catch(() => {});
    card.addEventListener('click', () => openModal(edit, num));

    gallery.insertBefore(card, noResults);
  });
}

function openModal(edit, num){
  modalTitle.textContent = edit.title;
  modalEp.textContent = 'EDIT #' + num;
  modalMissingName.textContent = edit.file;

  modalVideoWrap.classList.remove('video-missing');
  modalVideo.muted = false;
  modalVideo.src = edit.file;
  modalVideo.currentTime = 0;
  modalVideo.play().catch(() => {});

  modalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(){
  modalBackdrop.classList.remove('open');
  document.body.style.overflow = '';
  modalVideo.pause();
  modalVideo.removeAttribute('src');
  modalVideo.load();
}
modalVideo.addEventListener('error', () => modalVideoWrap.classList.add('video-missing'));
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('.card').forEach(card => {
    const match = card.dataset.title.includes(q);
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  noResults.classList.toggle('show', visible === 0);
  visibleCount.textContent = visible;
});

const TELEGRAM_LINK = "index.html";
tgHeaderBtn.addEventListener('click', (e) => {
  e.preventDefault();
  window.open(TELEGRAM_LINK, "_blank");
});

buildCards();
visibleCount.textContent = EDITS.length;