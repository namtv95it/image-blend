/**
 * core.js – Shared State, DOM refs, Recording Mode, Tab Switcher, Settings, PhaseBar
 */
'use strict';

/**
 * MarbleBlend v4 â€“ Multi-Step Sequential Blend
 *
 * FLOW:
 *   User sets: Character + N steps (each step: emoji + result image)
 *   On Blend:
 *     Step 1: Character + Emoji1 â†’ blend animation â†’ show Result1 â†’ pause 2-3s
 *     Step 2: Result1 + Emoji2  â†’ blend animation â†’ show Result2 â†’ pause 2-3s
 *     ...
 *     Done when all steps completed.
 */

'use strict';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
let activeTab = 'blend';

const S = {
  charImg: null,          // áº¢nh nhÃ¢n váº­t gá»‘c
  steps: [],            // Array of { emojiImg, resultImg } (up to 4)
  stepCount: 1,             // Current number of blend steps rendered
  style: 'swirl',
  animId: null,
  running: false,
  time: 0,
  chainIdx: 0,             // current step index being blended
  chainPrev: null,          // Image used as "character" in current chain step
  lastResultImg: null,      // Last completed result image object
  headerTimer: null,        // Timer for delayed mobile header reveal
  _escHandler: null,        // Keydown handler for ESC to exit recording mode
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ DOM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const canvas = document.getElementById('blend-canvas');
const ctx = canvas.getContext('2d');
const theater = document.getElementById('theater');
const fly1 = document.getElementById('fly-1');
const fly2 = document.getElementById('fly-2');
const flyImg1 = document.getElementById('fly-img-1');
const flyImg2 = document.getElementById('fly-img-2');
const resultWrap = document.getElementById('result-reveal');
const resultImg = document.getElementById('result-img');
const bgCharWrap = document.getElementById('bg-char-wrap');
const bgCharImg = document.getElementById('bg-char-img');
const toastEl = document.getElementById('toast');
const stepLabelOv = document.getElementById('step-label-overlay');
const emojiHeaderEl = document.getElementById('emoji-header-inner');
const emojiPlaceholder = document.getElementById('emoji-header-placeholder');
const phaseBar = document.getElementById('phase-bar');

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ CANVAS SIZE HELPER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
// Always use offsetWidth/offsetHeight (pre-CSS-transform DOM size)
// getBoundingClientRect() returns post-transform size which is wrong in recording mode
function syncCanvasSize() {
  const w = theater.offsetWidth;
  const h = theater.offsetHeight;
  if (w > 0 && h > 0) {
    canvas.width = w;
    canvas.height = h;
  }
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ CHARACTER UPLOAD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function pickFile(n) {
  document.getElementById(`file-${n}`).click();
}

const charInput = document.getElementById('file-1');
const charCard = document.getElementById('card-1');

charInput.addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) loadCharSlot(f);
});

charCard.addEventListener('dragover', e => { e.preventDefault(); charCard.classList.add('drag-over'); });
charCard.addEventListener('dragleave', () => charCard.classList.remove('drag-over'));
charCard.addEventListener('drop', e => {
  e.preventDefault();
  charCard.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f?.type.startsWith('image/')) loadCharSlot(f);
});

function loadCharSlot(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      S.charImg = img;
      document.getElementById('body-1').style.display = 'none';
      const pv = document.getElementById('prev-1');
      pv.style.display = 'flex';
      document.getElementById('pimg-1').src = ev.target.result;
      // Show in theater background immediately
      bgCharImg.src = ev.target.result;
      bgCharWrap.classList.add('show');
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function clearSlot(n) {
  if (n === 1) {
    S.charImg = null;
    document.getElementById('body-1').style.display = 'flex';
    document.getElementById('prev-1').style.display = 'none';
    document.getElementById('file-1').value = '';
    bgCharWrap.classList.remove('show');
    bgCharImg.src = '';
    resetAll();
  }
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ TOAST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2800);
}



/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ TAB SWITCHER CONTROLLER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function switchTab(tabName) {
  activeTab = tabName;

  // Toggle active button
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    // Scroll active tab smoothly into view if tab bar overflows
    activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  // Toggle left tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = 'none';
  });
  const targetContent = document.getElementById(`tab-content-${tabName}`);
  if (targetContent) targetContent.style.display = 'flex';

  // Toggle right sidebar contents
  document.querySelectorAll('.right-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  const targetRightContent = document.getElementById(`right-tab-content-${tabName}`);
  if (targetRightContent) targetRightContent.style.display = 'flex';

  // Specific tab initializations
  const flOverlay = document.getElementById('flashlight-theater-overlay');
  if (flOverlay) {
    if (tabName === 'flashlight') {
      renderFlashlightTab();
    } else {
      flOverlay.classList.remove('show');
      document.getElementById('theater')?.classList.remove('fl-theater-full');
    }
  }

  const puzzleOverlay = document.getElementById('puzzle-theater-overlay');
  if (puzzleOverlay) {
    if (tabName === 'puzzle') {
      puzzleOverlay.classList.add('show');
    } else {
      puzzleOverlay.classList.remove('show');
    }
  }

  const climaxOverlay = document.getElementById('climax-theater-overlay');
  if (climaxOverlay) {
    if (tabName === 'climax') {
      climaxOverlay.classList.add('show');
      document.body.classList.add('climax-active-mode');
      renderClimaxPreview();
    } else {
      climaxOverlay.classList.remove('show');
      document.body.classList.remove('climax-active-mode');
    }
  }

  const smOverlay = document.getElementById('shadowmatch-theater-overlay');
  if (smOverlay) {
    if (tabName === 'shadowmatch') {
      renderShadowMatchTab();
    } else {
      smOverlay.classList.remove('show');
    }
  }

  // Toggle Emoji Header Bar visibility (Show in Blend, Blend+ & Pokemon)
  const emojiHeaderBar = document.getElementById('emoji-header-bar');
  if (emojiHeaderBar) {
    emojiHeaderBar.style.display = '';
    if (tabName === 'battle' || tabName === 'flashlight' || tabName === 'puzzle' || tabName === 'climax' || tabName === 'shadowmatch') {
      emojiHeaderBar.classList.add('hidden');
    } else {
      emojiHeaderBar.classList.remove('hidden');
    }
  }

  if (tabName === 'blendplus') {
    renderBpTable();
    updateBpPreview();
    refreshEmojiHeader();
  } else if (tabName !== 'puzzle' && tabName !== 'flashlight' && tabName !== 'climax' && tabName !== 'shadowmatch') {
    resetAll();
    refreshEmojiHeader();
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CLIMAX AUTOMATION MODULE (SPLIT DUEL & REVENGE CLIMAX)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CLIMAX = {
  heroNormalImg: null,
  heroWeakImg: null,
  heroStrongImg: null,
  opponentImg: null,
  bgImg: null,
  bgStyle: 'solid-red',
  heroName: 'POMNI',
  running: false,
  timers: []
};

function pickClimaxFile(slot) {
  document.getElementById(`file-climax-${slot}`).click();
}

(function initClimaxListeners() {
  ['hero-normal', 'hero-weak', 'hero-strong', 'opponent', 'bg'].forEach(slot => {
    const input = document.getElementById(`file-climax-${slot}`);
    if (input) {
      input.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) loadClimaxSlot(slot, file);
      });
    }
  });
})();

function loadClimaxSlot(slot, file) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      if (slot === 'hero-normal') CLIMAX.heroNormalImg = img;
      if (slot === 'hero-weak')   CLIMAX.heroWeakImg   = img;
      if (slot === 'hero-strong') CLIMAX.heroStrongImg = img;
      if (slot === 'opponent')    CLIMAX.opponentImg    = img;
      if (slot === 'bg')          CLIMAX.bgImg          = img;

      document.getElementById(`body-climax-${slot}`).style.display = 'none';
      const pv = document.getElementById(`prev-climax-${slot}`);
      if (pv) pv.style.display = 'flex';
      document.getElementById(`pimg-climax-${slot}`).src = ev.target.result;

      renderClimaxPreview();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function clearClimaxSlot(slot) {
  if (slot === 'hero-normal') CLIMAX.heroNormalImg = null;
  if (slot === 'hero-weak')   CLIMAX.heroWeakImg   = null;
  if (slot === 'hero-strong') CLIMAX.heroStrongImg = null;
  if (slot === 'opponent')    CLIMAX.opponentImg    = null;
  if (slot === 'bg')          CLIMAX.bgImg          = null;

  document.getElementById(`body-climax-${slot}`).style.display = 'flex';
  const pv = document.getElementById(`prev-climax-${slot}`);
  if (pv) pv.style.display = 'none';
  document.getElementById(`file-climax-${slot}`).value = '';

  renderClimaxPreview();
}

function updateClimaxBgStyle(styleVal) {
  CLIMAX.bgStyle = styleVal;
  const bgWrap = document.getElementById('climax-bg-wrap');
  if (bgWrap) {
    bgWrap.className = 'climax-bg-wrap ' + styleVal;
  }
}

function updateClimaxHeroName(val) {
  CLIMAX.heroName = (val.trim() || 'POMNI').toUpperCase();
  const nameDisplay = document.getElementById('climax-hero-name-display');
  if (nameDisplay) nameDisplay.textContent = CLIMAX.heroName;

  // Auto suggest CTA line 1 if empty or default
  const line1Input = document.getElementById('climax-cta-line1-input');
  if (line1Input) {
    line1Input.value = `${CLIMAX.heroName} NEEDS POWER!`;
  }
}

function getClimaxFallbackImg(type) {
  if (type === 'bg') {
    return '';
  }
  if (type === 'hero-normal') {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><g transform="translate(200, 260)"><circle cx="0" cy="-70" r="65" fill="%233b82f6"/><path d="M-50,60 C-50,-10 50,-10 50,60 Z" fill="%232563eb"/><circle cx="-22" cy="-80" r="8" fill="%23ffffff"/><circle cx="22" cy="-80" r="8" fill="%23ffffff"/><circle cx="-22" cy="-80" r="4" fill="%23000"/><circle cx="22" cy="-80" r="4" fill="%23000"/><path d="M-25,-45 Q0,-30 25,-45" stroke="%23ffffff" stroke-width="5" fill="none"/><text x="0" y="-150" font-family="sans-serif" font-size="28" font-weight="900" fill="%2360a5fa" text-anchor="middle">ðŸ˜€ HERO NORMAL</text></g></svg>';
  }
  if (type === 'hero-weak') {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><g transform="translate(200, 260)"><circle cx="0" cy="-70" r="65" fill="%23f43f5e"/><path d="M-50,60 C-50,-10 50,-10 50,60 Z" fill="%23e11d48"/><circle cx="-22" cy="-80" r="8" fill="%23ffffff"/><circle cx="22" cy="-80" r="8" fill="%23ffffff"/><circle cx="-22" cy="-78" r="4" fill="%23000"/><circle cx="22" cy="-78" r="4" fill="%23000"/><path d="M-25,-45 Q0,-65 25,-45" stroke="%23ffffff" stroke-width="5" fill="none"/><text x="0" y="-150" font-family="sans-serif" font-size="28" font-weight="900" fill="%23fef08a" text-anchor="middle">âš¡ HERO WEAK</text></g></svg>';
  }
  if (type === 'hero-strong') {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><g transform="translate(200, 260)"><circle cx="0" cy="-70" r="75" fill="%23a855f7"/><path d="M-60,70 C-60,-20 60,-20 60,70 Z" fill="%239333ea"/><circle cx="-24" cy="-82" r="12" fill="%23fef08a"/><circle cx="24" cy="-82" r="12" fill="%23fef08a"/><circle cx="-24" cy="-82" r="6" fill="%23dc2626"/><circle cx="24" cy="-82" r="6" fill="%23dc2626"/><path d="M-30,-45 Q0,-25 30,-45" stroke="%23fef08a" stroke-width="6" fill="none"/><text x="0" y="-160" font-family="sans-serif" font-size="32" font-weight="900" fill="%23ef4444" text-anchor="middle">ðŸ”¥ SUPER HERO</text></g></svg>';
  }
  if (type === 'opponent') {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><g transform="translate(200, 200)"><polygon points="0,-110 35,-35 110,0 35,35 0,110 -35,35 -110,0 -35,-35" fill="%23dc2626"/><circle cx="0" cy="0" r="50" fill="%230f172a"/><circle cx="-16" cy="-12" r="8" fill="%23fbbf24"/><circle cx="16" cy="-12" r="8" fill="%23fbbf24"/><text x="0" y="-130" font-family="sans-serif" font-size="26" font-weight="900" fill="%23fca5a5" text-anchor="middle">ðŸ˜ˆ JAX BOSS</text></g></svg>';
  }
  return '';
}

function renderClimaxPreview() {
  const bgWrap        = document.getElementById('climax-bg-wrap');
  const bgImgEl       = document.getElementById('climax-bg-img');
  const opponentImgEl = document.getElementById('climax-opponent-img');
  const heroImgEl     = document.getElementById('climax-hero-img');
  const nameDisplay   = document.getElementById('climax-hero-name-display');

  if (bgWrap) {
    if (CLIMAX.bgImg) {
      bgWrap.style.background = 'none';
      if (bgImgEl) {
        bgImgEl.src = CLIMAX.bgImg.src;
        bgImgEl.style.display = 'block';
      }
    } else {
      if (bgImgEl) bgImgEl.style.display = 'none';
      bgWrap.className = 'climax-bg-wrap ' + (CLIMAX.bgStyle || 'solid-red');
    }
  }

  const heroNormalSrc = CLIMAX.heroNormalImg ? CLIMAX.heroNormalImg.src : (CLIMAX.heroWeakImg ? CLIMAX.heroWeakImg.src : getClimaxFallbackImg('hero-normal'));
  if (opponentImgEl) opponentImgEl.src = CLIMAX.opponentImg ? CLIMAX.opponentImg.src : getClimaxFallbackImg('opponent');
  if (heroImgEl)     heroImgEl.src     = heroNormalSrc;
  if (nameDisplay)   nameDisplay.textContent = CLIMAX.heroName;
}

function clearClimaxTimers() {
  CLIMAX.timers.forEach(t => clearTimeout(t));
  CLIMAX.timers = [];
}

function resetClimaxAutomation() {
  CLIMAX.running = false;
  clearClimaxTimers();

  document.body.classList.remove('climax-active-mode');

  const overlay      = document.getElementById('climax-theater-overlay');
  const bgWrap       = document.getElementById('climax-bg-wrap');
  const oppWrap      = document.getElementById('climax-opponent-wrap');
  const heroWrap     = document.getElementById('climax-hero-wrap');
  const splitDivider = document.getElementById('climax-split-divider');
  const clashFx      = document.getElementById('climax-clash-fx');
  const warningEl    = document.getElementById('climax-error-warning');
  const ctaOverlay   = document.getElementById('climax-cta-overlay');
  const hpFill       = document.getElementById('climax-hp-fill');
  const oppHpFill    = document.getElementById('climax-opp-hp-fill');
  const powerFill    = document.getElementById('climax-power-fill');
  const flashFx      = document.getElementById('climax-flash-fx');
  const auraFx       = document.getElementById('climax-aura-fx');
  const finishBanner = document.getElementById('climax-finish-banner');

  const darkenLeft   = document.getElementById('climax-darken-left');
  const darkenRight  = document.getElementById('climax-darken-right');

  if (overlay)      overlay.classList.remove('shake');
  if (bgWrap)       bgWrap.classList.remove('darkened');
  if (darkenLeft)   darkenLeft.classList.remove('show');
  if (darkenRight)  darkenRight.classList.remove('show');
  if (splitDivider) splitDivider.classList.remove('show');
  if (clashFx)      clashFx.classList.remove('active');
  if (oppWrap)      oppWrap.classList.remove('enter-right', 'clash-right', 'blow-away', 'entered');
  if (heroWrap)     heroWrap.classList.remove('enter-left', 'clash-left', 'weak', 'awaken', 'charging-saiyan');
  if (warningEl)    warningEl.classList.remove('show');
  if (ctaOverlay)   ctaOverlay.classList.remove('show');
  if (flashFx)      flashFx.classList.remove('active');
  if (auraFx)       auraFx.classList.remove('show');
  if (finishBanner) finishBanner.classList.remove('show');
  if (hpFill)       hpFill.style.width = '100%';
  if (oppHpFill)    oppHpFill.style.width = '100%';
  if (powerFill)    powerFill.style.width = '0%';

  renderClimaxPreview();
}

