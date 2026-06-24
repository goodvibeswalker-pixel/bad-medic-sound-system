const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  menuButton.querySelector('.sr-only').textContent = open ? 'メニューを閉じる' : 'メニューを開く';
}

menuButton.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
document.getElementById('year').textContent = new Date().getFullYear();

const anthemAudio = document.getElementById('anthem-audio');
const anthemToggle = document.querySelector('.anthem-toggle');
const anthemProgress = document.getElementById('anthem-progress');
const anthemCurrent = document.getElementById('anthem-current');
const anthemDuration = document.getElementById('anthem-duration');
const anthemMute = document.querySelector('.anthem-mute');

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function setAnthemPlaying(playing) {
  document.querySelector('.anthem-player')?.classList.toggle('is-playing', playing);
  anthemToggle?.setAttribute('aria-label', playing ? 'Anthemを一時停止' : 'Anthemを再生');
  const symbol = anthemToggle?.querySelector('.play-symbol');
  const label = anthemToggle?.querySelector('.play-label');
  if (symbol) symbol.textContent = playing ? 'Ⅱ' : '▶';
  if (label) label.textContent = playing ? 'PAUSE' : 'LISTEN';
}

if (anthemAudio && anthemToggle && anthemProgress) {
  anthemToggle.addEventListener('click', async () => {
    if (anthemAudio.paused) {
      try { await anthemAudio.play(); } catch { setAnthemPlaying(false); }
    } else {
      anthemAudio.pause();
    }
  });

  anthemAudio.addEventListener('play', () => setAnthemPlaying(true));
  anthemAudio.addEventListener('pause', () => setAnthemPlaying(false));
  anthemAudio.addEventListener('loadedmetadata', () => {
    anthemDuration.textContent = formatTime(anthemAudio.duration);
  });
  anthemAudio.addEventListener('timeupdate', () => {
    anthemCurrent.textContent = formatTime(anthemAudio.currentTime);
    anthemProgress.value = anthemAudio.duration ? (anthemAudio.currentTime / anthemAudio.duration) * 100 : 0;
  });
  anthemAudio.addEventListener('ended', () => {
    anthemAudio.currentTime = 0;
    setAnthemPlaying(false);
  });
  anthemProgress.addEventListener('input', () => {
    if (anthemAudio.duration) anthemAudio.currentTime = (Number(anthemProgress.value) / 100) * anthemAudio.duration;
  });
  anthemMute?.addEventListener('click', () => {
    anthemAudio.muted = !anthemAudio.muted;
    anthemMute.textContent = anthemAudio.muted ? 'MUTE' : 'VOL';
    anthemMute.setAttribute('aria-label', anthemAudio.muted ? 'ミュートを解除' : '音声をミュート');
  });
}
