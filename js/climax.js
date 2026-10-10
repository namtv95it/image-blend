/**
 * climax.js – Cứu Hero 22s Tab: Climax automation, Split battle, HP bars, Aura FX, KO banner
 */

/* â”€â”€ RUN SCRIPT: SPLIT BATTLE & REVENGE CLIMAX â”€â”€ */
function runClimaxAutomation() {
  resetClimaxAutomation();
  CLIMAX.running = true;
  document.body.classList.add('climax-active-mode');

  // Enter mobile/desktop recording view
  if (window.innerWidth < 1024) {
    openMobileTheater();
  } else {
    enterRecordingMode();
  }

  const climaxOverlay = document.getElementById('climax-theater-overlay');
  if (climaxOverlay) climaxOverlay.classList.add('show');

  const heroNameInput = document.getElementById('climax-hero-name-input');
  const heroLvInput   = document.getElementById('climax-hero-lv-input');
  const oppNameInput  = document.getElementById('climax-opp-name-input');
  const oppLvInput    = document.getElementById('climax-opp-lv-input');
  const line1Input    = document.getElementById('climax-cta-line1-input');
  const line2Input    = document.getElementById('climax-cta-line2-input');

  const heroName = (heroNameInput?.value.trim() || 'POMNI').toUpperCase();
  const heroLv   = heroLvInput?.value.trim()   || 'Lv 20';
  const oppName  = (oppNameInput?.value.trim()  || 'JAX').toUpperCase();
  const oppLv    = oppLvInput?.value.trim()    || 'Lv 67';
  const ctaLine1 = line1Input?.value.trim() || `${heroName} NEEDS POWER!`;
  const ctaLine2 = line2Input?.value.trim() || 'LIKE & SUBSCRIBE TO SAVE HER!';

  document.getElementById('climax-hero-name-display').textContent = heroName;
  document.getElementById('climax-hero-lv-display').textContent   = heroLv;
  document.getElementById('climax-opp-name-display').textContent  = oppName;
  document.getElementById('climax-opp-lv-display').textContent    = oppLv;
  document.getElementById('climax-cta-text-line1').textContent   = ctaLine1;
  document.getElementById('climax-cta-text-line2').textContent   = ctaLine2;

  const bgWrap       = document.getElementById('climax-bg-wrap');
  const oppWrap      = document.getElementById('climax-opponent-wrap');
  const heroWrap     = document.getElementById('climax-hero-wrap');
  const splitDivider = document.getElementById('climax-split-divider');
  const clashFx      = document.getElementById('climax-clash-fx');
  const bgImgEl      = document.getElementById('climax-bg-img');
  const oppImgEl     = document.getElementById('climax-opponent-img');
  const heroImgEl    = document.getElementById('climax-hero-img');

  const warningEl    = document.getElementById('climax-error-warning');
  const ctaOverlay   = document.getElementById('climax-cta-overlay');
  const countdown    = document.getElementById('climax-countdown-box');
  const hpFill       = document.getElementById('climax-hp-fill');
  const oppHpFill    = document.getElementById('climax-opp-hp-fill');
  const powerFill    = document.getElementById('climax-power-fill');
  const powerPct     = document.getElementById('climax-power-pct');
  const flashFx      = document.getElementById('climax-flash-fx');
  const auraFx       = document.getElementById('climax-aura-fx');
  const finishBanner = document.getElementById('climax-finish-banner');

  // Set images (User uploaded or Demo Fallback)
  const heroNormalSrc = CLIMAX.heroNormalImg ? CLIMAX.heroNormalImg.src : (CLIMAX.heroWeakImg ? CLIMAX.heroWeakImg.src : getClimaxFallbackImg('hero-normal'));
  const heroWeakSrc   = CLIMAX.heroWeakImg   ? CLIMAX.heroWeakImg.src   : (CLIMAX.heroNormalImg ? CLIMAX.heroNormalImg.src : getClimaxFallbackImg('hero-weak'));
  const heroStrongSrc = CLIMAX.heroStrongImg ? CLIMAX.heroStrongImg.src : (CLIMAX.heroWeakImg   ? CLIMAX.heroWeakImg.src   : getClimaxFallbackImg('hero-strong'));
  const opponentSrc   = CLIMAX.opponentImg   ? CLIMAX.opponentImg.src   : getClimaxFallbackImg('opponent');

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

  if (oppImgEl)  oppImgEl.src  = opponentSrc;
  if (heroImgEl) heroImgEl.src = heroNormalSrc;

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // GIAI ÄOáº N 1 (GiÃ¢y 0 - 3s): MÃ n hÃ¬nh ban Ä‘áº§u KHÃ”NG CÃ“ nhÃ¢n váº­t nÃ o.
  // 1. Pomni xuáº¥t hiá»‡n di chuyá»ƒn tá»« ngoÃ i bÃªn trÃ¡i vÃ o.
  // 2. Jax xuáº¥t hiá»‡n di chuyá»ƒn tá»« ngoÃ i bÃªn pháº£i vÃ o (sau 1.2s).
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (splitDivider) splitDivider.classList.add('show');
  if (heroWrap) heroWrap.classList.add('enter-left');
  playSfxSwoosh(true);

  CLIMAX.timers.push(setTimeout(() => {
    if (!CLIMAX.running) return;
    if (oppWrap) oppWrap.classList.add('enter-right', 'entered');
    playSfxSwoosh(true);
  }, 1200));

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // GIAI ÄOáº N 2 (GiÃ¢y 3.5 - 7s): Giao chiáº¿n dá»¯ dá»™i (Háº¥t va cháº¡m, tia lá»­a nháº¥p nhÃ¡y ðŸ’¥)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  CLIMAX.timers.push(setTimeout(() => {
    if (!CLIMAX.running) return;

    if (heroWrap) {
      heroWrap.classList.remove('enter-left');
      heroWrap.classList.add('clash-left');
    }
    if (oppWrap) {
      oppWrap.classList.remove('enter-right');
      oppWrap.classList.add('clash-right');
    }
    if (clashFx) clashFx.classList.add('active');

    playSfxImpact();
  }, 3500));

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // GIAI ÄOáº N 3 (GiÃ¢y 7 - 10s): Pomni thua cuá»™c náº±m run ráº©y & HP tá»¥t cáº¡n, Cáº£nh bÃ¡o nguy cáº¥p
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  CLIMAX.timers.push(setTimeout(() => {
    if (!CLIMAX.running) return;

    if (clashFx)  clashFx.classList.remove('active');
    if (oppWrap)  oppWrap.classList.remove('clash-right');

    // Chuyá»ƒn sang áº£nh Pomni Tháº¥t báº¡i / Thua cuá»™c
    if (heroImgEl && heroWeakSrc) heroImgEl.src = heroWeakSrc;

    if (heroWrap) {
      heroWrap.classList.remove('clash-left');
      heroWrap.classList.add('weak');
    }

    // Pomni HP Bar drops to 8%
    if (hpFill) hpFill.style.width = '8%';

    // Chá»‰ tá»‘i 1 ná»­a mÃ n hÃ¬nh phÃ­a bÃªn Pomni (BÃªn TrÃ¡i) khi Pomni bá»‹ thua gá»¥c
    const darkenLeft = document.getElementById('climax-darken-left');
    if (darkenLeft) darkenLeft.classList.add('show');

    playClimaxWarningSound();
  }, 7000));

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // GIAI ÄOáº N 4 (GiÃ¢y 10 - 15s): Äáº¿m ngÆ°á»£c 5s & KÃªu gá»i Like/Sub tiáº¿p sá»©c
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  CLIMAX.timers.push(setTimeout(() => {
    if (!CLIMAX.running) return;

    if (warningEl)  warningEl.classList.remove('show');
    if (ctaOverlay) ctaOverlay.classList.add('show');

    let sec = 5;
    if (countdown) countdown.textContent = sec;

    const countInterval = setInterval(() => {
      if (!CLIMAX.running) {
        clearInterval(countInterval);
        return;
      }
      sec--;
      if (sec >= 0) {
        if (countdown) countdown.textContent = sec;
        const pct = Math.round(((5 - sec) / 5) * 100);
        if (powerFill) powerFill.style.width = pct + '%';
        if (powerPct)  powerPct.textContent  = pct + '%';
        playClimaxBeepSound(sec);
      }
      if (sec <= 0) {
        clearInterval(countInterval);
      }
    }, 1000);
  }, 10000));

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // GIAI ÄOáº N 5 (GiÃ¢y 15 - 18s): Gá»“ng nháº­n sá»©c máº¡nh kiá»ƒu Songoku & Level tÄƒng tá»« level hiá»‡n táº¡i lÃªn 999
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  CLIMAX.timers.push(setTimeout(() => {
    if (!CLIMAX.running) return;

    if (ctaOverlay) ctaOverlay.classList.remove('show');

    // Táº¯t tá»‘i bÃªn trÃ¡i cá»§a Hero
    const darkenLeft  = document.getElementById('climax-darken-left');
    const darkenRight = document.getElementById('climax-darken-right');
    if (darkenLeft) darkenLeft.classList.remove('show');

    // 1. Pomni vÃ o tÆ° tháº¿ Gá»“ng nháº­n sá»©c máº¡nh (Super Saiyan Charge)
    if (heroWrap) {
      heroWrap.classList.remove('weak');
      heroWrap.classList.add('charging-saiyan');
    }
    if (auraFx) auraFx.classList.add('show');

    // 2. Chá»¯ Level bÃ¹ng ná»• hiá»‡u á»©ng Ã¡nh sÃ¡ng
    const heroLvDisplay = document.getElementById('climax-hero-lv-display');
    if (heroLvDisplay) heroLvDisplay.classList.add('lv-power-burst');

    // TÄƒng Level liÃªn tá»¥c tá»« Level hiá»‡n táº¡i -> Level 999
    const startLvNum = parseInt((heroLv || '').replace(/\D/g, '')) || 20;
    const targetLvNum = 999;
    const chargeDuration = 2500; // 2.5 giÃ¢y gá»“ng nháº­n nÄƒng lÆ°á»£ng
    const startTime = Date.now();

    playClimaxChargingSound(2.5);

    const lvInterval = setInterval(() => {
      if (!CLIMAX.running) {
        clearInterval(lvInterval);
        return;
      }
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / chargeDuration);
      
      // ÄÆ°á»ng cong tÄƒng tá»‘c Level
      const currentLv = Math.floor(startLvNum + (targetLvNum - startLvNum) * Math.pow(progress, 2.2));
      
      if (heroLvDisplay) heroLvDisplay.textContent = 'Lv ' + currentLv;

      // Há»“i láº¡i thanh mÃ¡u cá»§a Hero
      if (hpFill) {
        const recoverPct = Math.min(100, Math.floor(8 + progress * 92));
        hpFill.style.width = recoverPct + '%';
      }

      if (progress >= 1) {
        clearInterval(lvInterval);
        if (heroLvDisplay) heroLvDisplay.textContent = 'Lv 999';
        if (hpFill) hpFill.style.width = '100%';
      }
    }, 30);

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // GIAI ÄOáº N 5.5 (Sau khi Ä‘áº¡t Lv 999): BÃ¹ng ná»• chiÃªu thá»©c ÄÃNH BAY Jax & MÃ¡u Jax vá» 0
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    CLIMAX.timers.push(setTimeout(() => {
      if (!CLIMAX.running) return;

      // Pomni Ä‘á»•i sang dáº¡ng Thá»©c tá»‰nh (Awaken Form)
      if (heroWrap) {
        heroWrap.classList.remove('charging-saiyan');
        heroWrap.classList.add('awaken');
      }
      if (heroImgEl && heroStrongSrc) heroImgEl.src = heroStrongSrc;

      // Chá»›p sÃ¡ng ná»• tung cá»±c Ä‘áº¡i + Rung cháº¥n
      if (flashFx) {
        flashFx.classList.add('active');
        setTimeout(() => flashFx.classList.remove('active'), 350);
      }
      if (climaxOverlay) climaxOverlay.classList.add('shake');
      playClimaxExplosionSound();

      // MÃ¡u cá»§a Jax bá»‹ bÃ¹ng ná»• tá»¥t vá» 0%, tá»‘i bÃªn Jax vÃ  Jax bá»‹ Ä‘Ã¡nh bay ra ngoÃ i
      if (darkenRight) darkenRight.classList.add('show');
      if (oppHpFill)   oppHpFill.style.width = '0%';
      if (oppWrap)     oppWrap.classList.add('blow-away');
    }, 2600));

  }, 15000));

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // GIAI ÄOáº N 6 (GiÃ¢y 21 - 25s): MÃ n Äƒn má»«ng chiáº¿n tháº¯ng rá»±c rá»¡ (Victory KO Celebration)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  CLIMAX.timers.push(setTimeout(() => {
    if (!CLIMAX.running) return;

    if (finishBanner) {
      finishBanner.querySelector('.finish-title').textContent = 'VICTORY KO!';
      finishBanner.querySelector('.finish-sub').textContent   = `${heroName} DEFEATED ${oppName}! ðŸ†`;
      finishBanner.classList.add('show');
    }
    playSfxReveal();
  }, 21000));
}

/* â”€â”€ Web Audio Synth Sounds for Climax Mode â”€â”€ */
function playClimaxWarningSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

function playClimaxBeepSound(sec) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const freq = sec === 0 ? 1200 : (600 + (5 - sec) * 100);
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

function playClimaxExplosionSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {}
}

function playClimaxChargingSound(durationSec) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + (durationSec || 2.5));
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + (durationSec || 2.5) * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (durationSec || 2.5));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (durationSec || 2.5));
  } catch (e) {}
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   BLEND + MODULE (MULTI-STREAM INDEPENDENT FUSION BLEND)
   Má»—i luá»“ng: { charImg, emojiImg, resultImg }
   Hiá»‡u á»©ng blend: Fusion. KhÃ´ng dÃ¹ng hiá»‡u á»©ng xuáº¥t hiá»‡n káº¿t quáº£ (none).
   Chuyá»ƒn luá»“ng: Giá»¯ káº¿t quáº£ ~2.5s rá»“i chuyá»ƒn mÆ°á»£t sang luá»“ng káº¿ tiáº¿p.
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const BP = {
  streams: [
    { charImg: null, emojiImg: null, resultImg: null }
  ],
  running: false,
  streamIdx: 0,
  timer: null
};

function syncBpVal(type) {
  if (type === 'swirl') {
    const el = document.getElementById('sl-bp-swirl');
    const val = document.getElementById('val-bp-swirl');
    if (el && val) val.textContent = el.value;
  } else if (type === 'speed') {
    const el = document.getElementById('sl-bp-speed');
    const val = document.getElementById('val-bp-speed');
    if (el && val) val.textContent = el.value;
  }
}

function addBpStream() {
  BP.streams.push({ charImg: null, emojiImg: null, resultImg: null });
  renderBpTable();
  const tbody = document.getElementById('bp-table-body');
  if (tbody && tbody.lastElementChild) {
    tbody.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function removeBpStream(index) {
  if (BP.streams.length <= 1) {
    BP.streams = [{ charImg: null, emojiImg: null, resultImg: null }];
  } else {
    BP.streams.splice(index, 1);
  }
  renderBpTable();
  updateBpPreview();
}

function clearAllBpStreams() {
  BP.streams = [
    { charImg: null, emojiImg: null, resultImg: null }
  ];
  resetAll();
  renderBpTable();
  updateBpPreview();
}

// Táº£i nhiá»u áº£nh vÃ  Ä‘á»• láº§n lÆ°á»£t vÃ o táº¥t cáº£ cÃ¡c Ã´ trá»‘ng (NhÃ¢n váº­t -> Emoji -> áº¢nh má»›i) theo thá»© tá»±
function loadBpFilesIntoAllSlots(files) {
  const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0) return;

  let loaded = 0;
  const loadedImgs = [];

  imageFiles.forEach((file, fIdx) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        loadedImgs[fIdx] = img;
        loaded++;
        if (loaded === imageFiles.length) {
          // Duyá»‡t vÃ  Ä‘á»• vÃ o cÃ¡c Ã´ theo hÃ ng ngang: stream 0 (char -> emoji -> result), stream 1, ...
          let currentStreamIdx = 0;
          let currentSlotType = 'char'; // 'char' | 'emoji' | 'result'

          // TÃ¬m Ã´ trá»‘ng Ä‘áº§u tiÃªn Ä‘á»ƒ báº¯t Ä‘áº§u Ä‘á»•
          let foundStart = false;
          for (let s = 0; s < BP.streams.length; s++) {
            if (!BP.streams[s].charImg) {
              currentStreamIdx = s; currentSlotType = 'char'; foundStart = true; break;
            }
            if (!BP.streams[s].emojiImg) {
              currentStreamIdx = s; currentSlotType = 'emoji'; foundStart = true; break;
            }
            if (!BP.streams[s].resultImg) {
              currentStreamIdx = s; currentSlotType = 'result'; foundStart = true; break;
            }
          }
          if (!foundStart) {
            currentStreamIdx = BP.streams.length;
            currentSlotType = 'char';
          }

          loadedImgs.forEach(imageObj => {
            while (BP.streams.length <= currentStreamIdx) {
              BP.streams.push({ charImg: null, emojiImg: null, resultImg: null });
            }

            if (currentSlotType === 'char') {
              BP.streams[currentStreamIdx].charImg = imageObj;
              currentSlotType = 'emoji';
            } else if (currentSlotType === 'emoji') {
              BP.streams[currentStreamIdx].emojiImg = imageObj;
              currentSlotType = 'result';
            } else if (currentSlotType === 'result') {
              BP.streams[currentStreamIdx].resultImg = imageObj;
              currentSlotType = 'char';
              currentStreamIdx++;
            }
          });

          renderBpTable();
          updateBpPreview();
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function loadBpFilesIntoColumn(type, files) {
  const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0) return;

  let loaded = 0;
  const loadedImgs = [];

  imageFiles.forEach((file, fIdx) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        loadedImgs[fIdx] = img;
        loaded++;
        if (loaded === imageFiles.length) {
          // GÃ¡n láº§n lÆ°á»£t áº£nh vÃ o cÃ¡c stream tá»« stream Ä‘áº§u tiÃªn
          loadedImgs.forEach((imageObj, i) => {
            if (!BP.streams[i]) {
              BP.streams.push({ charImg: null, emojiImg: null, resultImg: null });
            }
            if (type === 'char')   BP.streams[i].charImg = imageObj;
            if (type === 'emoji')  BP.streams[i].emojiImg = imageObj;
            if (type === 'result') BP.streams[i].resultImg = imageObj;
          });
          renderBpTable();
          updateBpPreview();
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Global drag state for Blend + items (há»— trá»£ kÃ©o tháº£ giá»¯a báº¥t ká»³ Ã´/hÃ ng nÃ o)
const BP_DRAG = {
  type: null, // 'char' | 'emoji' | 'result'
  fromIdx: null
};

function attachBpColDrag(wrap, type, idx, cell) {
  wrap.draggable = true;

  wrap.addEventListener('dragstart', e => {
    e.stopPropagation();
    BP_DRAG.type = type;
    BP_DRAG.fromIdx = idx;
    wrap.classList.add('bt-col-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(new Image(), 0, 0);
  });

  wrap.addEventListener('dragend', e => {
    e.stopPropagation();
    wrap.classList.remove('bt-col-dragging');
    document.querySelectorAll('.bt-cell-over, .drag-over').forEach(c => c.classList.remove('bt-cell-over', 'drag-over'));
    BP_DRAG.type = null;
    BP_DRAG.fromIdx = null;
  });

  cell.addEventListener('dragover', e => {
    if (e.dataTransfer.types.includes('Files')) return;
    if (!BP_DRAG.type || (BP_DRAG.fromIdx === idx && BP_DRAG.type === type)) return;
    e.preventDefault();
    e.stopPropagation();
    document.querySelectorAll('.bt-cell-over, .drag-over').forEach(c => c.classList.remove('bt-cell-over', 'drag-over'));
    cell.classList.add('bt-cell-over');
    wrap.classList.add('drag-over');
  });

  cell.addEventListener('dragleave', e => {
    if (!cell.contains(e.relatedTarget)) {
      cell.classList.remove('bt-cell-over');
      wrap.classList.remove('drag-over');
    }
  });

  cell.addEventListener('drop', e => {
    if (e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    e.stopPropagation();
    cell.classList.remove('bt-cell-over');
    wrap.classList.remove('drag-over');
    const fromIdx = BP_DRAG.fromIdx;
    const fromType = BP_DRAG.type;
    if (!fromType || fromIdx === null || (fromIdx === idx && fromType === type)) return;

    // HoÃ¡n Ä‘á»•i áº£nh giá»¯a Ã´ nguá»“n (fromIdx, fromType) vÃ  Ã´ Ä‘Ã­ch (idx, type)
    const fromProp = fromType === 'char' ? 'charImg' : fromType === 'emoji' ? 'emojiImg' : 'resultImg';
    const targetProp = type === 'char' ? 'charImg' : type === 'emoji' ? 'emojiImg' : 'resultImg';

    const temp = BP.streams[fromIdx][fromProp];
    BP.streams[fromIdx][fromProp] = BP.streams[idx][targetProp];
    BP.streams[idx][targetProp] = temp;

    BP_DRAG.type = null;
    BP_DRAG.fromIdx = null;
    renderBpTable();
    updateBpPreview();
  });
}

function attachBpCellDropTarget(cell, type, idx) {
  cell.addEventListener('dragover', e => {
    if (e.dataTransfer.types.includes('Files')) return;
    if (!BP_DRAG.type || (BP_DRAG.fromIdx === idx && BP_DRAG.type === type)) return;
    e.preventDefault();
    e.stopPropagation();
    document.querySelectorAll('.bt-cell-over').forEach(c => c.classList.remove('bt-cell-over'));
    cell.classList.add('bt-cell-over');
  });

  cell.addEventListener('dragleave', e => {
    if (!cell.contains(e.relatedTarget)) cell.classList.remove('bt-cell-over');
  });

  cell.addEventListener('drop', e => {
    if (e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    e.stopPropagation();
    cell.classList.remove('bt-cell-over');
    const fromIdx = BP_DRAG.fromIdx;
    const fromType = BP_DRAG.type;
    if (!fromType || fromIdx === null || (fromIdx === idx && fromType === type)) return;

    const fromProp = fromType === 'char' ? 'charImg' : fromType === 'emoji' ? 'emojiImg' : 'resultImg';
    const targetProp = type === 'char' ? 'charImg' : type === 'emoji' ? 'emojiImg' : 'resultImg';

    const temp = BP.streams[fromIdx][fromProp];
    BP.streams[fromIdx][fromProp] = BP.streams[idx][targetProp];
    BP.streams[idx][targetProp] = temp;

    BP_DRAG.type = null;
    BP_DRAG.fromIdx = null;
    renderBpTable();
    updateBpPreview();
  });
}

function pickBpFile(streamIdx, type) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    if (files.length === 1) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          if (!BP.streams[streamIdx]) return;
          if (type === 'char')   BP.streams[streamIdx].charImg = img;
          if (type === 'emoji')  BP.streams[streamIdx].emojiImg = img;
          if (type === 'result') BP.streams[streamIdx].resultImg = img;
          renderBpTable();
          updateBpPreview();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(files[0]);
    } else {
      // Táº£i nhiá»u áº£nh: Ä‘á»• tiáº¿p ná»‘i vÃ o cÃ¡c Ã´ (tá»« Ã´ hiá»‡n táº¡i sang Ã´ tiáº¿p theo)
      let loaded = 0;
      const loadedImgs = [];
      files.forEach((file, fIdx) => {
        const reader = new FileReader();
        reader.onload = ev => {
          const img = new Image();
          img.onload = () => {
            loadedImgs[fIdx] = img;
            loaded++;
            if (loaded === files.length) {
              let curStream = streamIdx;
              let curSlot = type;
              loadedImgs.forEach(imageObj => {
                while (BP.streams.length <= curStream) {
                  BP.streams.push({ charImg: null, emojiImg: null, resultImg: null });
                }
                if (curSlot === 'char') {
                  BP.streams[curStream].charImg = imageObj;
                  curSlot = 'emoji';
                } else if (curSlot === 'emoji') {
                  BP.streams[curStream].emojiImg = imageObj;
                  curSlot = 'result';
                } else if (curSlot === 'result') {
                  BP.streams[curStream].resultImg = imageObj;
                  curSlot = 'char';
                  curStream++;
                }
              });
              renderBpTable();
              updateBpPreview();
            }
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
  };
  input.click();
}

function clearBpSlot(streamIdx, type) {
  if (!BP.streams[streamIdx]) return;
  if (type === 'char')   BP.streams[streamIdx].charImg = null;
  if (type === 'emoji')  BP.streams[streamIdx].emojiImg = null;
  if (type === 'result') BP.streams[streamIdx].resultImg = null;
  renderBpTable();
  updateBpPreview();
}

function renderBpTable() {
  const tbody = document.getElementById('bp-table-body');
  const countEl = document.getElementById('bp-streams-count');
  const emptyHint = document.getElementById('bp-empty-hint');
  if (!tbody) return;

  const total = BP.streams.length;
  if (countEl) countEl.textContent = total ? `(${total} luá»“ng)` : '';
  if (emptyHint) emptyHint.style.display = total === 0 ? 'flex' : 'none';

  tbody.innerHTML = '';

  BP.streams.forEach((stream, idx) => {
    const row = document.createElement('div');
    row.className = 'bp-stream-row';
    row.id = `bp-stream-row-${idx}`;

    // Col 1: Character
    const colChar = document.createElement('div');
    colChar.className = 'bp-cell bp-cell-char';
    if (stream.charImg) {
      const wrap = document.createElement('div');
      wrap.className = 'bp-img-wrap';
      wrap.title = 'KÃ©o Ä‘á»ƒ Ä‘á»•i vá»‹ trÃ­ sang báº¥t ká»³ Ã´/hÃ ng nÃ o';
      const img = document.createElement('img');
      img.src = stream.charImg.src;
      img.draggable = false;
      const badge = document.createElement('span');
      badge.className = 'bp-img-badge';
      badge.textContent = `L${idx + 1}`;
      const del = document.createElement('button');
      del.className = 'bt-img-del';
      del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      del.title = 'XÃ³a áº£nh nhÃ¢n váº­t';
      del.onclick = (e) => { e.stopPropagation(); clearBpSlot(idx, 'char'); };
      wrap.appendChild(img);
      wrap.appendChild(badge);
      wrap.appendChild(del);
      colChar.appendChild(wrap);
      attachBpColDrag(wrap, 'char', idx, colChar);
    } else {
      colChar.innerHTML = `
        <div class="bp-slot-empty" onclick="pickBpFile(${idx}, 'char')" title="Click chá»n 1 hoáº·c nhiá»u áº£nh">
          <i class="fa-solid fa-plus"></i><span>NhÃ¢n váº­t</span>
        </div>
      `;
      attachBpCellDropTarget(colChar, 'char', idx);
    }

    // Col 2: Emoji
    const colEmoji = document.createElement('div');
    colEmoji.className = 'bp-cell bp-cell-emoji';
    if (stream.emojiImg) {
      const wrap = document.createElement('div');
      wrap.className = 'bp-img-wrap';
      wrap.title = 'KÃ©o Ä‘á»ƒ Ä‘á»•i vá»‹ trÃ­ sang báº¥t ká»³ Ã´/hÃ ng nÃ o';
      const img = document.createElement('img');
      img.src = stream.emojiImg.src;
      img.draggable = false;
      const del = document.createElement('button');
      del.className = 'bt-img-del';
      del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      del.title = 'XÃ³a emoji';
      del.onclick = (e) => { e.stopPropagation(); clearBpSlot(idx, 'emoji'); };
      wrap.appendChild(img);
      wrap.appendChild(del);
      colEmoji.appendChild(wrap);
      attachBpColDrag(wrap, 'emoji', idx, colEmoji);
    } else {
      colEmoji.innerHTML = `
        <div class="bp-slot-empty" onclick="pickBpFile(${idx}, 'emoji')" title="Click chá»n 1 hoáº·c nhiá»u áº£nh">
          <i class="fa-solid fa-plus"></i><span>Emoji</span>
        </div>
      `;
      attachBpCellDropTarget(colEmoji, 'emoji', idx);
    }

    // Col 3: New Result Image
    const colResult = document.createElement('div');
    colResult.className = 'bp-cell bp-cell-result';
    if (stream.resultImg) {
      const wrap = document.createElement('div');
      wrap.className = 'bp-img-wrap bp-img-result';
      wrap.title = 'KÃ©o Ä‘á»ƒ Ä‘á»•i vá»‹ trÃ­ sang báº¥t ká»³ Ã´/hÃ ng nÃ o';
      const img = document.createElement('img');
      img.src = stream.resultImg.src;
      img.draggable = false;
      const del = document.createElement('button');
      del.className = 'bt-img-del';
      del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      del.title = 'XÃ³a áº£nh má»›i';
      del.onclick = (e) => { e.stopPropagation(); clearBpSlot(idx, 'result'); };
      wrap.appendChild(img);
      wrap.appendChild(del);
      colResult.appendChild(wrap);
      attachBpColDrag(wrap, 'result', idx, colResult);
    } else {
      colResult.innerHTML = `
        <div class="bp-slot-empty" onclick="pickBpFile(${idx}, 'result')" title="Click chá»n 1 hoáº·c nhiá»u áº£nh">
          <i class="fa-solid fa-plus"></i><span>áº¢nh má»›i</span>
        </div>
      `;
      attachBpCellDropTarget(colResult, 'result', idx);
    }

    // Col 4: Action (Delete stream row)
    const colAction = document.createElement('div');
    colAction.className = 'bp-cell bp-cell-action';
    colAction.innerHTML = `
      <button type="button" class="bp-del-btn" title="XÃ³a luá»“ng nÃ y" onclick="removeBpStream(${idx})">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;

    row.appendChild(colChar);
    row.appendChild(colEmoji);
    row.appendChild(colResult);
    row.appendChild(colAction);
    tbody.appendChild(row);
  });

  refreshEmojiHeader();
}

// Láº¯ng nghe sá»± kiá»‡n táº£i nhiá»u áº£nh tá»« cÃ¡c input áº©n cá»§a Blend +
(function initBpMultiInputs() {
  const allInput = document.getElementById('bp-all-multi-input');
  const charInput = document.getElementById('bp-char-multi-input');
  const emojiInput = document.getElementById('bp-emoji-multi-input');
  const resultInput = document.getElementById('bp-result-multi-input');

  if (allInput) {
    allInput.addEventListener('change', e => {
      loadBpFilesIntoAllSlots(e.target.files);
      e.target.value = '';
    });
  }
  if (charInput) {
    charInput.addEventListener('change', e => {
      loadBpFilesIntoColumn('char', e.target.files);
      e.target.value = '';
    });
  }
  if (emojiInput) {
    emojiInput.addEventListener('change', e => {
      loadBpFilesIntoColumn('emoji', e.target.files);
      e.target.value = '';
    });
  }
  if (resultInput) {
    resultInput.addEventListener('change', e => {
      loadBpFilesIntoColumn('result', e.target.files);
      e.target.value = '';
    });
  }

  const btnAll = document.getElementById('bp-btn-upload-all');
  const btnChar = document.getElementById('bp-btn-upload-chars');
  const btnEmoji = document.getElementById('bp-btn-upload-emojis');
  const btnResult = document.getElementById('bp-btn-upload-results');

  if (btnAll) btnAll.addEventListener('click', () => allInput?.click());
  if (btnChar) btnChar.addEventListener('click', () => charInput?.click());
  if (btnEmoji) btnEmoji.addEventListener('click', () => emojiInput?.click());
  if (btnResult) btnResult.addEventListener('click', () => resultInput?.click());
})();

function updateBpPreview() {
  if (activeTab !== 'blendplus' || BP.running) return;
  // If first stream has charImg, display as theater background
  const firstChar = BP.streams[0]?.charImg;
  if (firstChar) {
    bgCharImg.src = firstChar.src;
    bgCharWrap.classList.add('show');
  } else {
    bgCharWrap.classList.remove('show');
  }
  refreshEmojiHeader();
}

