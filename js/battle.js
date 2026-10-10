/**
 * battle.js – Solo Battle Tab: Hero slots, Opponent table, HP bars, Battle sequence
 */

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ BATTLE SOLO MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const B = {
  jesus1Img: null,   // Jesus 1 (Hands down)
  jesus2Img: null,   // Jesus 2 (Hand raised)
  jesus3Img: null,   // Jesus 3 (Victory)
  victoryBgImg: null,// Victory Background Scene
  slashImg: null,    // Slash PNG FX
  bgStyle: 'solid-red', // Default Background Color Style
  opponents: [],     // Array of Image objects
  scenes: [],        // Array of Image objects
  oppNames: [],      // Array of Opponent Name strings
  running: false,
  timer: null,
  stepIdx: 0
};

function updateBattleBgStyle(styleVal) {
  B.bgStyle = styleVal;
  const sel1 = document.getElementById('battle-bg-style-select');
  const sel2 = document.getElementById('right-battle-bg-style-select');
  if (sel1) sel1.value = styleVal;
  if (sel2) sel2.value = styleVal;
  renderBattleTable();
}

function pickBattleFile(type) {
  const el = document.getElementById(`file-${type}`);
  if (el) el.click();
}

function clearBattleSlot(type) {
  if (type === 'jesus-1') B.jesus1Img = null;
  else if (type === 'jesus-2') B.jesus2Img = null;
  else if (type === 'jesus-3') B.jesus3Img = null;
  else if (type === 'victory-bg') B.victoryBgImg = null;
  else if (type === 'slash-fx') B.slashImg = null;

  const fileInput = document.getElementById(`file-${type}`);
  if (fileInput) fileInput.value = '';
  const body = document.getElementById(`body-${type}`);
  const prev = document.getElementById(`prev-${type}`);
  if (body) body.style.display = 'flex';
  if (prev) prev.style.display = 'none';
}

function initBattleModule() {
  // Bind Jesus, Victory BG & Slash file inputs
  ['jesus-1', 'jesus-2', 'jesus-3', 'victory-bg', 'slash-fx'].forEach(type => {
    const input = document.getElementById(`file-${type}`);
    if (!input) return;
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          if (type === 'jesus-1') B.jesus1Img = img;
          else if (type === 'jesus-2') B.jesus2Img = img;
          else if (type === 'jesus-3') B.jesus3Img = img;
          else if (type === 'victory-bg') B.victoryBgImg = img;
          else if (type === 'slash-fx') B.slashImg = img;

          const pimg = document.getElementById(`pimg-${type}`);
          const body = document.getElementById(`body-${type}`);
          const prev = document.getElementById(`prev-${type}`);
          if (pimg) pimg.src = img.src;
          if (body) body.style.display = 'none';
          if (prev) prev.style.display = 'block';
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  });

  // Bind Add Buttons
  const btnOpp = document.getElementById('battle-add-opponents');
  if (btnOpp) btnOpp.onclick = () => document.getElementById('battle-opponents-input')?.click();
  const btnScene = document.getElementById('battle-add-scenes');
  if (btnScene) btnScene.onclick = () => document.getElementById('battle-scenes-input')?.click();

  // Multi file inputs
  const oppInput = document.getElementById('battle-opponents-input');
  if (oppInput) {
    oppInput.addEventListener('change', e => {
      const files = Array.from(e.target.files);
      if (!files.length) return;
      let loaded = 0;
      files.forEach(f => {
        const r = new FileReader();
        r.onload = ev => {
          const img = new Image();
          img.onload = () => {
            B.opponents.push(img);
            loaded++;
            if (loaded === files.length) renderBattleTable();
          };
          img.src = ev.target.result;
        };
        r.readAsDataURL(f);
      });
      oppInput.value = '';
    });
  }

  const sceneInput = document.getElementById('battle-scenes-input');
  if (sceneInput) {
    sceneInput.addEventListener('change', e => {
      const files = Array.from(e.target.files);
      if (!files.length) return;
      let loaded = 0;
      files.forEach(f => {
        const r = new FileReader();
        r.onload = ev => {
          const img = new Image();
          img.onload = () => {
            B.scenes.push(img);
            loaded++;
            if (loaded === files.length) renderBattleTable();
          };
          img.src = ev.target.result;
        };
        r.readAsDataURL(f);
      });
      sceneInput.value = '';
    });
  }

  renderBattleTable();
}

function renderBattleTable() {
  const tbody = document.getElementById('battle-table-body');
  const countEl = document.getElementById('battle-steps-count');
  if (!tbody) return;

  const total = B.opponents.length;
  if (countEl) countEl.textContent = total > 0 ? `(${total} Ä‘á»‘i thá»§)` : '';
  tbody.innerHTML = '';

  if (total === 0) {
    tbody.innerHTML = `
      <div class="bt-empty-state" style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 0.82rem;">
        <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.4rem; display: block; margin-bottom: 6px;"></i>
        <span>Táº£i lÃªn cÃ¡c Ä‘á»‘i thá»§ Ä‘á»ƒ báº¯t Ä‘áº§u battle! (Ná»n cáº£nh tÃ¹y chá»n, náº¿u thiáº¿u sáº½ tá»± Ä‘á»™ng dÃ¹ng MÃ u Ná»n)</span>
      </div>
    `;
    return;
  }

  for (let i = 0; i < total; i++) {
    const oppImgObj = B.opponents[i];
    const sceneImgObj = B.scenes[i];

    const row = document.createElement('div');
    row.className = 'bt-row';

    // Col 1: Opponent Image
    const colOpp = document.createElement('div');
    colOpp.className = 'bt-col bt-col-monster';
    if (oppImgObj) {
      const wrap = document.createElement('div');
      wrap.className = 'bt-img-wrap';
      const img = document.createElement('img');
      img.src = oppImgObj.src;
      const badge = document.createElement('div');
      badge.className = 'bt-img-badge';
      badge.textContent = `VS #${i + 1}`;
      const del = document.createElement('button');
      del.className = 'bt-img-del';
      del.type = 'button';
      del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      del.onclick = e => {
        e.stopPropagation();
        B.opponents.splice(i, 1);
        B.oppNames.splice(i, 1);
        renderBattleTable();
      };
      wrap.appendChild(img);
      wrap.appendChild(badge);
      wrap.appendChild(del);
      colOpp.appendChild(wrap);
      attachColDrag(wrap, 'battle-opp', i, colOpp, B.opponents, renderBattleTable);
    } else {
      colOpp.innerHTML = `
        <div class="bt-slot-empty" onclick="document.getElementById('battle-opponents-input').click()">
          <i class="fa-solid fa-plus"></i><span>Äá»‘i thá»§ ${i + 1}</span>
        </div>
      `;
      attachCellDropTarget(colOpp, 'battle-opp', i, B.opponents, renderBattleTable);
    }

    // Col 2: Opponent Name Input Field
    const colFx = document.createElement('div');
    colFx.className = 'bt-col bt-col-fx';
    colFx.style.padding = '0 4px';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'ctrl-input';
    nameInput.style.cssText = 'font-size:0.72rem; padding:4px 6px; text-align:center; font-weight:700; width:100%;';
    nameInput.placeholder = `Äá»‘i thá»§ ${i + 1}`;
    nameInput.value = B.oppNames[i] || '';
    nameInput.oninput = (e) => { B.oppNames[i] = e.target.value; };
    colFx.appendChild(nameInput);

    // Col 3: Background Scene Image (or Default Color Fallback Slot)
    const colScene = document.createElement('div');
    colScene.className = 'bt-col bt-col-card';
    if (sceneImgObj) {
      const wrap = document.createElement('div');
      wrap.className = 'bt-img-wrap';
      const img = document.createElement('img');
      img.src = sceneImgObj.src;
      const badge = document.createElement('div');
      badge.className = 'bt-img-badge';
      badge.textContent = `Cáº£nh #${i + 1}`;
      const del = document.createElement('button');
      del.className = 'bt-img-del';
      del.type = 'button';
      del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      del.onclick = e => {
        e.stopPropagation();
        B.scenes.splice(i, 1);
        renderBattleTable();
      };
      wrap.appendChild(img);
      wrap.appendChild(badge);
      wrap.appendChild(del);
      colScene.appendChild(wrap);
      attachColDrag(wrap, 'battle-scene', i, colScene, B.scenes, renderBattleTable);
    } else {
      colScene.innerHTML = `
        <div class="bt-slot-empty color-fallback" onclick="document.getElementById('battle-scenes-input').click()" title="Äang dÃ¹ng MÃ u Ná»n (Báº¥m Ä‘á»ƒ chá»n áº£nh ná»n riÃªng)">
          <i class="fa-solid fa-palette"></i><span>DÃ¹ng MÃ u Ná»n</span>
        </div>
      `;
      attachCellDropTarget(colScene, 'battle-scene', i, B.scenes, renderBattleTable);
    }

    row.appendChild(colOpp);
    row.appendChild(colFx);
    row.appendChild(colScene);
    tbody.appendChild(row);
  }
}

function runBattleSolo() {
  const total = B.opponents.length;
  if (!B.jesus1Img || !B.jesus2Img || !B.jesus3Img) {
    toast('Vui lÃ²ng táº£i Ä‘á»§ 3 tráº¡ng thÃ¡i cá»§a nhÃ¢n váº­t chÃ­nh (1. Háº¡ tay, 2. Vung tay, 3. Tháº¯ng)! âš”ï¸');
    return;
  }
  if (total === 0) {
    toast('Vui lÃ²ng táº£i lÃªn Ã­t nháº¥t 1 Ä‘á»‘i thá»§! âš¡');
    return;
  }
  if (B.running) return;
  B.running = true;

  enterRecordingMode();

  const battleOverlay = document.getElementById('battle-theater-overlay');
  if (battleOverlay) battleOverlay.classList.add('show');
  const victoryOverlay = document.getElementById('battle-victory-overlay');
  if (victoryOverlay) victoryOverlay.classList.remove('show');

  const jesusWrap = document.getElementById('battle-jesus-wrap');
  if (jesusWrap) jesusWrap.style.display = 'flex';
  const healthUi = document.getElementById('battle-health-ui');
  if (healthUi) healthUi.style.display = 'flex';

  const emojiHeaderBar = document.getElementById('emoji-header-bar');
  if (emojiHeaderBar) emojiHeaderBar.classList.add('hidden');

  B.stepIdx = 0;
  startBattleStepSequence(0);
}

function startBattleStepSequence(stepIdx) {
  const total = B.opponents.length;
  if (stepIdx >= total) {
    // All opponents defeated! Show Victory screen!
    showBattleVictoryScreen();
    return;
  }

  B.stepIdx = stepIdx;
  const currentOpp = B.opponents[stepIdx];
  const currentScene = B.scenes[stepIdx];

  const bgImg = document.getElementById('battle-bg-img');
  const bgWrap = document.getElementById('battle-bg-wrap');
  const oppImg = document.getElementById('battle-opponent-img');
  const oppWrap = document.getElementById('battle-opponent-wrap');
  const jesusImg = document.getElementById('battle-jesus-img');
  const jesusWrap = document.getElementById('battle-jesus-wrap');
  const slashWrap = document.getElementById('battle-slash-wrap');
  const slashImg = document.getElementById('battle-slash-img');
  const monsterHpBar = document.getElementById('monster-hp-bar');
  const jesusHpBar = document.getElementById('jesus-hp-bar');

  // Update Health Bar Names dynamically from user inputs
  const heroName = document.getElementById('battle-hero-name')?.value?.trim() || 'JESUS';
  const jesusHpName = document.getElementById('battle-jesus-hp-name');
  if (jesusHpName) jesusHpName.textContent = heroName.toUpperCase();

  const rawOppName = B.oppNames[stepIdx];
  const oppName = (rawOppName && rawOppName.trim()) ? rawOppName.trim() : `MONSTER #${stepIdx + 1}`;
  const monsterHpName = document.getElementById('battle-monster-hp-name');
  if (monsterHpName) monsterHpName.textContent = oppName.toUpperCase();

  // Reset states & Apply Background Scene Image OR Selected Background Color
  if (bgWrap) {
    if (currentScene) {
      bgWrap.style.background = 'none';
      if (bgImg) {
        bgImg.src = currentScene.src;
        bgImg.style.display = 'block';
      }
    } else {
      if (bgImg) bgImg.style.display = 'none';
      bgWrap.className = 'battle-bg-wrap ' + (B.bgStyle || 'solid-red');
    }
    bgWrap.classList.remove('grayscale');
  }

  if (oppImg && currentOpp) oppImg.src = currentOpp.src;
  if (oppWrap) {
    oppWrap.classList.remove('grayscale', 'hit', 'slide-in');
    void oppWrap.offsetWidth; // force reflow
    oppWrap.classList.add('slide-in');
  }

  if (jesusImg) jesusImg.src = B.jesus1Img.src;
  if (jesusWrap) jesusWrap.classList.remove('attack');

  if (slashWrap) slashWrap.classList.remove('show');
  if (slashImg) {
    if (B.slashImg) {
      slashImg.src = B.slashImg.src;
    } else {
      slashImg.src = 'mong-vuot.png';
    }
  }

  if (monsterHpBar) monsterHpBar.style.width = '100%';
  if (jesusHpBar) jesusHpBar.style.width = '100%';

  // Step delay: Wait 2.0s after opponent slide in before hero attacks
  B.timer = setTimeout(() => {
    if (!B.running) return;

    // 1. Hero switches to Image 2 (Hand raised / vung tay) & attacks
    if (jesusImg) jesusImg.src = B.jesus2Img.src;
    if (jesusWrap) jesusWrap.classList.add('attack');

    // 2. Show Slash FX PNG over opponent
    if (slashWrap) {
      slashWrap.classList.add('show');
      playSfxSlash();
    }

    // 3. After 220ms: Opponent turns GRAYSCALE + Monster HP drops to 0!
    setTimeout(() => {
      if (!B.running) return;

      if (oppWrap) oppWrap.classList.add('grayscale', 'hit');
      if (bgWrap) bgWrap.classList.add('grayscale');
      if (monsterHpBar) monsterHpBar.style.width = '0%';

      // Hide slash FX and remove attack class so sway animation resumes
      setTimeout(() => {
        if (slashWrap) slashWrap.classList.remove('show');
        if (jesusWrap) jesusWrap.classList.remove('attack');
      }, 450);

      // Pause extended duration while opponent is defeated, then move to next opponent
      const stepDurationSec = parseFloat(document.getElementById('battle-step-sec')?.value || 4.0);
      B.timer = setTimeout(() => {
        if (!B.running) return;
        startBattleStepSequence(stepIdx + 1);
      }, stepDurationSec * 1000);
    }, 220);

  }, 2000);
}

function showBattleVictoryScreen() {
  const victoryOverlay = document.getElementById('battle-victory-overlay');
  const victoryImg = document.getElementById('battle-victory-img');
  const victoryBgImg = document.getElementById('battle-victory-bg-img');
  const victoryBgWrap = document.getElementById('battle-victory-bg-wrap');
  const jesusWrap = document.getElementById('battle-jesus-wrap');
  const slashWrap = document.getElementById('battle-slash-wrap');
  const healthUi = document.getElementById('battle-health-ui');

  if (healthUi) healthUi.style.display = 'none';
  if (jesusWrap) jesusWrap.style.display = 'none';
  if (slashWrap) slashWrap.classList.remove('show');

  // Set Victory Main Character image (Jesus 3)
  if (victoryImg && B.jesus3Img) {
    victoryImg.src = B.jesus3Img.src;
  }

  // Set Victory Background Scene image OR Background Color Style
  if (B.victoryBgImg) {
    if (victoryBgWrap) victoryBgWrap.style.background = 'none';
    if (victoryBgImg) {
      victoryBgImg.src = B.victoryBgImg.src;
      victoryBgImg.style.display = 'block';
    }
  } else if (B.scenes.length > 0 && B.scenes[B.scenes.length - 1]) {
    if (victoryBgWrap) victoryBgWrap.style.background = 'none';
    if (victoryBgImg) {
      victoryBgImg.src = B.scenes[B.scenes.length - 1].src;
      victoryBgImg.style.display = 'block';
    }
  } else {
    if (victoryBgImg) victoryBgImg.style.display = 'none';
    if (victoryBgWrap) victoryBgWrap.className = 'battle-victory-bg-wrap ' + (B.bgStyle || 'solid-red');
  }

  if (victoryOverlay) {
    victoryOverlay.classList.add('show');
    playSfxReveal();
  }
  B.running = false;
}

function resetBattleSolo() {
  if (B.timer) {
    clearTimeout(B.timer);
    B.timer = null;
  }
  B.running = false;

  const battleOverlay = document.getElementById('battle-theater-overlay');
  if (battleOverlay) battleOverlay.classList.remove('show');
  const victoryOverlay = document.getElementById('battle-victory-overlay');
  if (victoryOverlay) victoryOverlay.classList.remove('show');

  const jesusWrap = document.getElementById('battle-jesus-wrap');
  if (jesusWrap) jesusWrap.style.display = 'flex';
  const healthUi = document.getElementById('battle-health-ui');
  if (healthUi) healthUi.style.display = 'flex';

  exitRecordingMode();
}

function playSfxSlash() {
  if (!document.getElementById('battle-sound-enable')?.checked) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.18);
  } catch (e) {}
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
initBattleModule();

