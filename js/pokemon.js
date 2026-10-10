/**
 * pokemon.js – Pokemon Fusion Tab: Upload, Table, Swirl blend, Card overlay, Fan-out end screen
 */

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ POKEMON FUSION SYSTEM (MULTI-STEP) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const P = {
  charImg: null,
  monsterImages: [],  // Pokemon monsters in order
  cardImages: [],     // Result cards in order
  running: false,
  stepIdx: 0,
  pokeTimer: null
};

// Pick single character file
function pickPokeCharFile() {
  document.getElementById('poke-file-char').click();
}

const pokeCharInput = document.getElementById('poke-file-char');
if (pokeCharInput) {
  pokeCharInput.addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) loadPokeCharSlot(f);
  });
}

function loadPokeCharSlot(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      P.charImg = img;
      document.getElementById('poke-body-char').style.display = 'none';
      const pv = document.getElementById('poke-prev-char');
      pv.style.display = 'flex';
      document.getElementById('poke-pimg-char').src = ev.target.result;

      if (activeTab === 'pokemon') {
        bgCharImg.src = ev.target.result;
        bgCharWrap.classList.add('show');
      }
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function clearPokeCharSlot() {
  P.charImg = null;
  document.getElementById('poke-body-char').style.display = 'flex';
  document.getElementById('poke-prev-char').style.display = 'none';
  document.getElementById('poke-file-char').value = '';
  bgCharWrap.classList.remove('show');
  bgCharImg.src = '';
}

// Multi-file loaders for Pokemon tab
(function initPokeTableListeners() {
  ['monster', 'card'].forEach(type => {
    const input = document.getElementById(`poke-${type}-multi-input`);
    if (input) {
      input.addEventListener('change', e => {
        loadPokeFilesIntoGallery(type, e.target.files);
        e.target.value = '';
      });
    }
  });

  const addMonster = document.getElementById('poke-bt-add-monster');
  const addCard = document.getElementById('poke-bt-add-card');
  if (addMonster) addMonster.addEventListener('click', () => document.getElementById('poke-monster-multi-input').click());
  if (addCard) addCard.addEventListener('click', () => document.getElementById('poke-card-multi-input').click());
})();

function loadPokeFilesIntoGallery(type, files) {
  const list = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (!list.length) return;

  let loadedCount = 0;
  list.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        if (type === 'monster') P.monsterImages.push(img);
        else P.cardImages.push(img);
        loadedCount++;
        if (loadedCount === list.length) {
          renderPokeBlendTable();
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function clearPokeStepSlot(ev, idx, type) {
  if (ev) ev.stopPropagation();
  if (type === 'monster') P.monsterImages.splice(idx, 1);
  else P.cardImages.splice(idx, 1);
  renderPokeBlendTable();
}

function renderPokeBlendTable() {
  const tbody = document.getElementById('poke-blend-table-body');
  const emptyHint = document.getElementById('poke-bt-empty-hint');
  const stepsCount = document.getElementById('poke-steps-count');
  if (!tbody) return;

  const total = Math.max(P.monsterImages.length, P.cardImages.length);
  if (stepsCount) stepsCount.textContent = total ? `(${total} cáº·p)` : '';
  if (emptyHint) emptyHint.style.display = total === 0 ? 'flex' : 'none';

  tbody.innerHTML = '';
  refreshEmojiHeader();

  for (let i = 0; i < total; i++) {
    const row = document.createElement('div');
    row.className = 'bt-row';
    row.id = `poke-bt-row-${i}`;

    // Column 1: Pokemon Monster
    const mImg = P.monsterImages[i];
    const colMonster = document.createElement('div');
    colMonster.className = 'bt-cell bt-cell-emoji';
    if (mImg) {
      const wrap = document.createElement('div');
      wrap.className = 'bt-img-wrap bt-emoji-wrap';
      wrap.title = 'KÃ©o Ä‘á»ƒ Ä‘á»•i thá»© tá»±';
      const img = document.createElement('img');
      img.src = mImg.src;
      img.draggable = false;
      const badge = document.createElement('span');
      badge.className = 'bt-img-badge';
      badge.textContent = i + 1;
      const del = document.createElement('button');
      del.className = 'bt-img-del';
      del.type = 'button';
      del.title = 'XÃ³a áº£nh nÃ y';
      del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      del.addEventListener('mousedown', e => e.stopPropagation());
      del.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        P.monsterImages.splice(i, 1);
        renderPokeBlendTable();
      });
      wrap.appendChild(img);
      wrap.appendChild(badge);
      wrap.appendChild(del);
      colMonster.appendChild(wrap);
      attachColDrag(wrap, 'poke-monster', i, colMonster, P.monsterImages, renderPokeBlendTable);
    } else {
      colMonster.innerHTML = `
        <div class="bt-slot-empty" onclick="document.getElementById('poke-monster-multi-input').click()">
          <i class="fa-solid fa-plus"></i><span>Pokemon</span>
        </div>
      `;
      attachCellDropTarget(colMonster, 'poke-monster', i, P.monsterImages, renderPokeBlendTable);
    }

    // Column 2: FX indicator
    const colFx = document.createElement('div');
    colFx.className = 'bt-cell bt-cell-fx';
    colFx.innerHTML = `<span class="bt-fx-tag">âš¡ Fusion</span>`;

    // Column 3: Pokemon Result Card
    const cImg = P.cardImages[i];
    const colCard = document.createElement('div');
    colCard.className = 'bt-cell bt-cell-result';
    if (cImg) {
      const wrap = document.createElement('div');
      wrap.className = 'bt-img-wrap bt-result-wrap';
      wrap.title = 'KÃ©o Ä‘á»ƒ Ä‘á»•i thá»© tá»±';
      const img = document.createElement('img');
      img.src = cImg.src;
      img.draggable = false;
      const badge = document.createElement('span');
      badge.className = 'bt-img-badge';
      badge.textContent = i + 1;
      const del = document.createElement('button');
      del.className = 'bt-img-del';
      del.type = 'button';
      del.title = 'XÃ³a áº£nh nÃ y';
      del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      del.addEventListener('mousedown', e => e.stopPropagation());
      del.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        P.cardImages.splice(i, 1);
        renderPokeBlendTable();
      });
      wrap.appendChild(img);
      wrap.appendChild(badge);
      wrap.appendChild(del);
      colCard.appendChild(wrap);
      attachColDrag(wrap, 'poke-card', i, colCard, P.cardImages, renderPokeBlendTable);
    } else {
      colCard.innerHTML = `
        <div class="bt-slot-empty" onclick="document.getElementById('poke-card-multi-input').click()">
          <i class="fa-solid fa-plus"></i><span>Tháº» káº¿t quáº£</span>
        </div>
      `;
      attachCellDropTarget(colCard, 'poke-card', i, P.cardImages, renderPokeBlendTable);
    }

    row.appendChild(colMonster);
    row.appendChild(colFx);
    row.appendChild(colCard);
    tbody.appendChild(row);
  }
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ RUN MULTI-STEP POKEMON BLEND â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function runPokeBlend() {
  const count = Math.min(P.monsterImages.length, P.cardImages.length);
  if (!P.charImg || count === 0) {
    toast('Vui lÃ²ng táº£i: 1. áº¢nh nhÃ¢n váº­t gá»‘c vÃ  Ã­t nháº¥t 1 cáº·p (Pokemon + Tháº» káº¿t quáº£)! âš¡');
    return;
  }
  if (P.running) return;
  P.running = true;

  // Enter recording mode (rotate view landscape for short video recording)
  enterRecordingMode();

  // Keep emoji header & hide previous overlays
  const emojiHeaderBar = document.getElementById('emoji-header-bar');
  if (emojiHeaderBar) emojiHeaderBar.classList.remove('hidden');
  const pokeOverlay = document.getElementById('poke-card-overlay');
  if (pokeOverlay) pokeOverlay.classList.remove('show');
  const pokeFanOverlay = document.getElementById('poke-fan-screen-overlay');
  if (pokeFanOverlay) pokeFanOverlay.classList.remove('show');

  P.stepIdx = 0;
  startPokeStepSequence(0);
}

function startPokeStepSequence(stepIdx) {
  const totalSteps = Math.min(P.monsterImages.length, P.cardImages.length);
  if (stepIdx >= totalSteps) {
    // All steps done -> Show card fan-out deck end screen!
    updateEmojiHeaderState(-1);
    showPokeCardFanOutScreen();
    return;
  }

  P.stepIdx = stepIdx;
  updateEmojiHeaderState(stepIdx);
  const currentMonster = P.monsterImages[stepIdx];
  const currentCard = P.cardImages[stepIdx];

  // 1. Display background character full-frame with Zoom-in animation
  bgCharImg.src = P.charImg.src;
  bgCharWrap.classList.remove('show', 'zoom-in');
  void bgCharWrap.offsetWidth; // force reflow
  bgCharWrap.classList.add('show', 'zoom-in');

  // Wait 6s on step 0 (for browser full-screen banner to fade away) and 1.8s on subsequent steps
  const initialDelay = (stepIdx === 0) ? 6000 : 1800;
  P.pokeTimer = setTimeout(() => {
    if (!P.running) return;

    fly2.style.opacity = '1';
    flyImg2.src = currentMonster.src;
    playSfxSwoosh(true);

    const directions = ['bottom', 'top', 'left', 'right'];
    currentDir = directions[Math.floor(Math.random() * directions.length)];

    setFlyStyle(fly2, { top: 'auto', bottom: 'auto', left: 'auto', right: 'auto', transform: 'none' });

    const doPokeCollisionFlash = () => {
      const flash = document.createElement('div');
      flash.style.cssText = [
        'position:absolute', 'inset:0', 'z-index:20',
        'background:radial-gradient(ellipse 80% 60% at 50% 50%,',
        '  rgba(255,255,255,1) 0%, rgba(255,240,255,.8) 40%, transparent 80%)',
        'border-radius:inherit', 'pointer-events:none',
        'animation:flashOut .55s ease forwards',
      ].join(';');

      if (!document.getElementById('flash-kf')) {
        const st = document.createElement('style');
        st.id = 'flash-kf';
        st.textContent = '@keyframes flashOut{0%{opacity:1}100%{opacity:0}}';
        document.head.appendChild(st);
      }

      theater.appendChild(flash);

      S._currentCharImg = P.charImg;
      S._currentResultImg = currentCard;
      S._currentStepStyle = 'fusion';

      syncCanvasSize();
      renderFrame(0);

      bgCharWrap.classList.remove('show');
      canvas.classList.add('visible');
      startPokeSwirlLoop(() => {
        setTimeout(() => flash.remove(), 400);
        fly2.style.animation = '';
        fly2.style.opacity = '0';
        fly2.style.zIndex = '';
        fly2.style.transition = '';

        revealSinglePokeCardStep(currentCard, stepIdx, () => {
          startPokeStepSequence(stepIdx + 1);
        });
      });

      const baseTr = (currentDir === 'left' || currentDir === 'right') ? 'translateY(-50%)' : 'translateX(-50%)';
      let st = document.getElementById('fusion-absorb-kf');
      if (!st) {
        st = document.createElement('style');
        st.id = 'fusion-absorb-kf';
        document.head.appendChild(st);
      }
      st.textContent = `
        @keyframes fusionAbsorb {
          0%   { opacity: 1;   transform: ${baseTr} scale(1)    rotate(0deg);   filter: blur(0px); }
          30%  { opacity: 0.95; transform: ${baseTr} scale(1.1)  rotate(240deg); filter: blur(0px); }
          100% { opacity: 0;   transform: ${baseTr} scale(0.05) rotate(720deg); filter: blur(8px); }
        }
      `;

      fly2.style.zIndex = '15';
      fly2.style.transition = 'none';
      fly2.style.animation = 'fusionAbsorb 0.7s cubic-bezier(.4,0,.2,1) forwards';

      setTimeout(() => {
        fly2.style.animation = '';
        fly2.style.opacity = '0';
        fly2.style.zIndex = '';
        fly2.style.transition = '';
      }, 710);

      setTimeout(() => flash.remove(), 580);
    };

    if (currentDir === 'bottom') {
      setFlyStyle(fly2, { left: '50%', transform: 'translateX(-50%)', bottom: '-60%' });
      animateDir(fly2, 'bottom', -60, 38, 750, () => setTimeout(doPokeCollisionFlash, 150));
    } else if (currentDir === 'top') {
      setFlyStyle(fly2, { left: '50%', transform: 'translateX(-50%)', top: '-60%' });
      animateDir(fly2, 'top', -60, 38, 750, () => setTimeout(doPokeCollisionFlash, 150));
    } else if (currentDir === 'left') {
      setFlyStyle(fly2, { top: '50%', transform: 'translateY(-50%)', left: '-60%' });
      animateDir(fly2, 'left', -60, 22.5, 750, () => setTimeout(doPokeCollisionFlash, 150));
    } else if (currentDir === 'right') {
      setFlyStyle(fly2, { top: '50%', transform: 'translateY(-50%)', right: '-60%' });
      animateDir(fly2, 'right', -60, 22.5, 750, () => setTimeout(doPokeCollisionFlash, 150));
    }
  }, initialDelay);
}

function startPokeSwirlLoop(onDone) {
  S.time = 0;
  let elapsed = 0;
  const totalMs = 1000; // 1.0s fast swirl fusion
  const speed = 5.0;    // Dynamic spin speed

  function loop() {
    if (!P.running) return;
    const progress = Math.min(1, elapsed / totalMs);
    renderFrame(progress);
    S.time += speed * 0.14;
    elapsed += 16 * (speed / 3.5);
    if (elapsed < totalMs) {
      S.animId = requestAnimationFrame(loop);
    } else {
      onDone();
    }
  }
  S.animId = requestAnimationFrame(loop);
}

function revealSinglePokeCardStep(cardImgObj, stepIdx = 0, onNext) {
  canvas.classList.remove('visible');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Hide background character image to reveal clean grid background
  bgCharWrap.classList.remove('show', 'zoom-in');

  const pokeOverlay = document.getElementById('poke-card-overlay');
  const pokeShell = document.getElementById('poke-card-shell');
  const artImg = document.getElementById('poke-card-art-img');
  const questionDisp = document.getElementById('poke-card-question-display');

  if (questionDisp) questionDisp.classList.remove('show');
  if (pokeShell) pokeShell.classList.remove('shrink-hide');

  if (artImg) artImg.src = cardImgObj.src;

  playSfxReveal();
  if (pokeOverlay) pokeOverlay.classList.add('show');

  // Pause on single card for 4.0 seconds (extended preview), then shrink card to center & fade out
  setTimeout(() => {
    if (!P.running) return;

    if (pokeShell) pokeShell.classList.add('shrink-hide');

    setTimeout(() => {
      if (pokeOverlay) pokeOverlay.classList.remove('show');
      if (pokeShell) pokeShell.classList.remove('shrink-hide');
      onNext();
    }, 600);
  }, 4000);
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ POKEMON CARD FAN-OUT END SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function showPokeCardFanOutScreen() {
  const pokeFanOverlay = document.getElementById('poke-fan-screen-overlay');
  const cardsContainer = document.getElementById('poke-fan-cards-container');
  const questionDisp = document.getElementById('poke-fan-question-display');
  if (!pokeFanOverlay || !cardsContainer) return;

  cardsContainer.innerHTML = '';
  if (questionDisp) questionDisp.classList.remove('show');

  const total = P.cardImages.length;
  // Calculate fan angles & horizontal offsets
  // Example for N cards: spread angles from -25deg to +25deg
  const startAngle = total > 1 ? -22 : 0;
  const angleStep = total > 1 ? (44 / (total - 1)) : 0;
  const startX = total > 1 ? -60 : 0;
  const xStep = total > 1 ? (120 / (total - 1)) : 0;

  P.cardImages.forEach((cImg, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'fan-card-item';
    cardEl.style.zIndex = idx + 1;

    const img = document.createElement('img');
    img.src = cImg.src;
    img.alt = `Card Fan ${idx + 1}`;
    cardEl.appendChild(img);

    cardsContainer.appendChild(cardEl);

    // Apply fan out transform after DOM append
    const rot = startAngle + idx * angleStep;
    const tx = startX + idx * xStep;
    const ty = (total > 1) ? Math.abs(idx - (total - 1) / 2) * 8 : 0;

    setTimeout(() => {
      cardEl.style.transform = `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg)`;
    }, 100 + idx * 120);
  });

  // Set question box text
  const questionRaw = document.getElementById('poke-question-input')?.value || 'HOW MUCH POWER DOES THIS POKEMON CARD DESERVE?\nLET ME KNOW IN THE COMMENTS!';
  if (questionDisp) {
    const lines = questionRaw.split('\n').map(l => l.trim().toUpperCase()).filter(l => l.length > 0);
    questionDisp.innerHTML = lines.join('<br/>');
  }

  playSfxReveal();
  pokeFanOverlay.classList.add('show');

  // Reveal interactive question box 2 seconds after card fan out display
  setTimeout(() => {
    if (questionDisp) {
      questionDisp.classList.add('show');
      playSfxBadgePop(0);
    }
    P.running = false;
  }, 2000);
}

