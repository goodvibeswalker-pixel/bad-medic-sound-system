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

const datedEventCards = document.querySelectorAll('.event-card[data-event-date]');
const eventEmpty = document.querySelector('.event-empty');
const regionButtons = document.querySelectorAll('.region-filter');

function filterEvents(region = 'all') {
  let visibleEventCount = 0;

  datedEventCards.forEach((card) => {
    const matchesRegion = region === 'all' || card.dataset.region === region;
    const isPast = card.dataset.isPast === 'true';
    const shouldShow = matchesRegion && !isPast;
    card.hidden = !shouldShow;
    if (shouldShow) visibleEventCount += 1;
  });

  if (eventEmpty) eventEmpty.hidden = visibleEventCount > 0;
}

if (datedEventCards.length) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  datedEventCards.forEach((card) => {
    const eventDate = new Date(`${card.dataset.eventDate}T00:00:00`);
    const isPast = Number.isFinite(eventDate.getTime()) && eventDate < today;
    card.dataset.isPast = String(isPast);
  });

  filterEvents('all');
}

regionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const region = button.dataset.region || 'all';
    regionButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    filterEvents(region);
  });
});

const eventRequestForm = document.getElementById('event-request-form');
const eventRequestNote = document.getElementById('event-request-note');
const eventDmLink = document.getElementById('event-dm-link');
const eventMailAddress = 'goodvibeswaalker@gmail.com';

function getFormValue(formData, key) {
  return String(formData.get(key) || '').trim();
}

function buildEventRequestMessage() {
  if (!eventRequestForm) return { subject: '', body: '' };
  const formData = new FormData(eventRequestForm);
  const eventName = getFormValue(formData, 'eventName');
  const eventDate = getFormValue(formData, 'eventDate');
  const eventRegion = getFormValue(formData, 'eventRegion');
  const eventArea = getFormValue(formData, 'eventArea');
  const eventVenue = getFormValue(formData, 'eventVenue');
  const eventTime = getFormValue(formData, 'eventTime');
  const eventLineup = getFormValue(formData, 'eventLineup');
  const eventTicket = getFormValue(formData, 'eventTicket');
  const eventContact = getFormValue(formData, 'eventContact');
  const eventDetails = getFormValue(formData, 'eventDetails');

  const subject = `イベント掲載依頼：${eventName || '名称未入力'}`;
  const body = [
    'BAD MEDIC SOUND SYSTEM イベント掲載依頼',
    '',
    `イベント名：${eventName}`,
    `開催日：${eventDate}`,
    `地域：${eventRegion}`,
    `都道府県・市区町村：${eventArea}`,
    `会場名：${eventVenue}`,
    `開催時間：${eventTime}`,
    `出演者・サウンド：`,
    eventLineup,
    '',
    `料金・チケット：${eventTicket}`,
    `問い合わせ先 / SNS：${eventContact}`,
    '',
    '詳細・メッセージ：',
    eventDetails,
    '',
    '※フライヤー画像がある場合は、このメールに添付してください。',
    '※掲載対象は本日以降に開催されるイベントのみです。'
  ].join('\n');

  return { subject, body };
}

eventRequestForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const { subject, body } = buildEventRequestMessage();
  const mailto = `mailto:${eventMailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  if (eventRequestNote) eventRequestNote.textContent = 'メール作成画面を開きました。フライヤーがある場合は添付して送信してください。';
});

eventDmLink?.addEventListener('click', async () => {
  const { body } = buildEventRequestMessage();
  if (!body.trim()) return;

  try {
    await navigator.clipboard.writeText(body);
    if (eventRequestNote) eventRequestNote.textContent = '入力内容をコピーしました。Instagram DMに貼り付けて送信してください。';
  } catch {
    if (eventRequestNote) eventRequestNote.textContent = 'Instagram DMを開きます。入力内容をコピーしてDMに貼り付けてください。';
  }
});

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
  const startAnthem = async () => {
    if (!anthemAudio.paused) return true;
    try {
      await anthemAudio.play();
      return true;
    } catch {
      setAnthemPlaying(false);
      return false;
    }
  };

  // 音声付き自動再生を試み、ブラウザに制限された場合は最初の操作で再生する。
  startAnthem().then((started) => {
    if (started) return;

    const startOnFirstInteraction = async (event) => {
      if (event.target.closest?.('.anthem-toggle, .anthem-mute, #anthem-progress')) return;
      if (await startAnthem()) {
        document.removeEventListener('click', startOnFirstInteraction);
        document.removeEventListener('touchend', startOnFirstInteraction);
      }
    };

    document.addEventListener('click', startOnFirstInteraction);
    document.addEventListener('touchend', startOnFirstInteraction);
  });

  anthemToggle.addEventListener('click', async () => {
    if (anthemAudio.paused) {
      await startAnthem();
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

const teeOrderForm = document.getElementById('tee-order-form');
const teeQtyInputs = document.querySelectorAll('.tee-qty');
const teeOrderSummary = document.getElementById('tee-order-summary');
const copyOrderButton = document.getElementById('copy-order');
const teeOrderLink = document.getElementById('tee-order-link');
const teeUnitPrice = 4000;

function formatYen(amount) {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

function getTeeOrderText() {
  const selected = Array.from(teeQtyInputs)
    .map((input) => ({ size: input.name, quantity: Math.max(0, Number(input.value) || 0) }))
    .filter((item) => item.quantity > 0);

  if (!selected.length) return '';

  const lines = selected.map((item) => `${item.size}: ${item.quantity}枚`);
  const total = selected.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = total * teeUnitPrice;
  return `BAD MEDIC LOGO TEE 注文希望\n${lines.join('\n')}\n合計枚数: ${total}枚\n商品合計: ${formatYen(subtotal)}\n送料: 別途`;
}

function updateTeeOrder() {
  const orderText = getTeeOrderText();
  if (!teeOrderSummary || !teeOrderLink) return;

  teeOrderSummary.textContent = orderText || 'サイズと枚数を選択してください。';
  teeOrderLink.classList.toggle('is-disabled', !orderText);
  teeOrderLink.setAttribute('aria-disabled', String(!orderText));
}

if (teeOrderForm && teeQtyInputs.length) {
  teeQtyInputs.forEach((input) => {
    input.addEventListener('input', () => {
      const value = Math.max(0, Math.min(20, Number(input.value) || 0));
      input.value = String(value);
      updateTeeOrder();
    });
  });

  copyOrderButton?.addEventListener('click', async () => {
    const orderText = getTeeOrderText();
    if (!orderText) {
      teeOrderSummary.textContent = '先にサイズと枚数を選択してください。';
      return;
    }

    try {
      await navigator.clipboard.writeText(orderText);
      teeOrderSummary.textContent = `${orderText}\n\nコピーしました。Instagram DMに貼り付けて送信してください。`;
    } catch {
      teeOrderSummary.textContent = `${orderText}\n\nこの内容をコピーしてInstagram DMへ送信してください。`;
    }
  });

  teeOrderLink?.addEventListener('click', (event) => {
    if (!getTeeOrderText()) {
      event.preventDefault();
      teeOrderSummary.textContent = '先にサイズと枚数を選択してください。';
    }
  });

  updateTeeOrder();
}
