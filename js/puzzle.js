/**
 * puzzle.js – Puzzle Game Tab: Image upload, Shape selection, Color pickers, Animation
 */

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   TAB 4: PUZZLE GAME MODULE  (powered by headbreaker)
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PUZZLE = {
  mainImg:        null,
  activeVariantIdx: null,   // which top variant is in the center hole
  hbCanvas:       null,     // headbreaker Canvas instance
  centerImgEl:    null,     // plain <img> of the center tile (for variants)
  boardSize:      340,      // px â€” headbreaker canvas size
};

// â”€â”€ Init file listener â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function initPuzzleModule() {
  const input = document.getElementById('file-puzzle-main');
  if (input) {
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          PUZZLE.mainImg = img;
          updatePuzzleSlotPreview(ev.target.result);
          renderPuzzleGame();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }
})();

function updatePuzzleSlotPreview(src) {
  const body = document.getElementById('body-puzzle-main');
  const prev = document.getElementById('prev-puzzle-main');
  const pimg = document.getElementById('pimg-puzzle-main');
  if (body) body.style.display = 'none';
  if (prev) prev.style.display = 'block';
  if (pimg) pimg.src = src;
}

function clearPuzzleSlot() {
  PUZZLE.mainImg = null;
  PUZZLE.activeVariantIdx = null;
  if (PUZZLE.hbCanvas) { try { PUZZLE.hbCanvas.destroy(); } catch(e){} PUZZLE.hbCanvas = null; }
  const body = document.getElementById('body-puzzle-main');
  const prev = document.getElementById('prev-puzzle-main');
  const pimg = document.getElementById('pimg-puzzle-main');
  if (body) body.style.display = 'flex';
  if (prev) prev.style.display = 'none';
  if (pimg) pimg.src = '';
  renderPuzzleGame();
}

// â”€â”€ Main render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderPuzzleGame() {
  const puzzleOverlay = document.getElementById('puzzle-theater-overlay');
  if (puzzleOverlay) puzzleOverlay.classList.add('show');

  const topRow = document.getElementById('puzzle-top-row');
  const boardContainer = document.getElementById('custom-puzzle-board');
  if (!topRow || !boardContainer) return;

  topRow.innerHTML = '';
  boardContainer.innerHTML = '';

  if (!PUZZLE.mainImg) {
    boardContainer.innerHTML = '<div style="color:#94a3b8;font-size:0.9rem;text-align:center;padding:60px 10px;grid-column:span 3;">Vui lÃ²ng táº£i 1 hÃ¬nh áº£nh á»Ÿ cá»™t bÃªn trÃ¡i Ä‘á»ƒ báº¯t Ä‘áº§u Game Xáº¿p HÃ¬nh ðŸ§©</div>';
    return;
  }

  // â”€â”€ Prepare source image cropped to square â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const src = PUZZLE.mainImg;
  const BS = 360; // 360x360 board pixel canvas size
  const srcW = src.naturalWidth  || src.width  || 360;
  const srcH = src.naturalHeight || src.height || 360;
  const cropSize = Math.min(srcW, srcH);
  const sx = (srcW - cropSize) / 2;
  const sy = (srcH - cropSize) / 2;

  // Offscreen master canvas (360x360)
  const masterCvs = document.createElement('canvas');
  masterCvs.width  = BS;
  masterCvs.height = BS;
  const mCtx = masterCvs.getContext('2d');
  mCtx.drawImage(src, sx, sy, cropSize, cropSize, 0, 0, BS, BS);
  PUZZLE.masterCvs = masterCvs;

  // Render 3x3 custom puzzle board
  buildCustomPuzzleBoard(boardContainer, masterCvs);

  // Render 3 top-row variant cards
  buildTopVariants(masterCvs);
}

// â”€â”€ Draw non-square custom tile shape path â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function drawCustomTilePath(ctx, w, h) {
  const shape = document.getElementById('puzzle-shape-select')?.value || 'notched';

  if (shape === 'heart') {
    const cx = w / 2;
    const topY = h * 0.28;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.bezierCurveTo(cx - w * 0.45, topY - h * 0.32, cx - w * 0.55, topY + h * 0.4, cx, h - 2);
    ctx.bezierCurveTo(cx + w * 0.55, topY + h * 0.4, cx + w * 0.45, topY - h * 0.32, cx, topY);
    ctx.closePath();
  } else if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 2, 0, Math.PI * 2);
    ctx.closePath();
  } else if (shape === 'trapezoid') {
    const inset = 16;
    const r = 8;
    ctx.beginPath();
    ctx.moveTo(inset + r, 4);
    ctx.lineTo(w - inset - r, 4);
    ctx.quadraticCurveTo(w - inset, 4, w - inset + r / 2, 4 + r);
    ctx.lineTo(w - 4, h - 4 - r);
    ctx.quadraticCurveTo(w - 4, h - 4, w - 4 - r, h - 4);
    ctx.lineTo(4 + r, h - 4);
    ctx.quadraticCurveTo(4, h - 4, 4, h - 4 - r);
    ctx.lineTo(inset - r / 2, 4 + r);
    ctx.quadraticCurveTo(inset, 4, inset + r, 4);
    ctx.closePath();
  } else if (shape === 'hexagon') {
    const cx = w / 2, cy = h / 2, rad = Math.min(w, h) / 2 - 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + rad * Math.cos(angle);
      const y = cy + rad * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (shape === 'diamond') {
    const cx = w / 2, cy = h / 2;
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(w - 4, cy);
    ctx.lineTo(cx, h - 4);
    ctx.lineTo(4, cy);
    ctx.closePath();
  } else if (shape === 'squircle') {
    const r = 18;
    ctx.beginPath();
    ctx.moveTo(4 + r, 4);
    ctx.lineTo(w - 4 - r, 4);
    ctx.quadraticCurveTo(w - 4, 4, w - 4, 4 + r);
    ctx.lineTo(w - 4, h - 4 - r);
    ctx.quadraticCurveTo(w - 4, h - 4, w - 4 - r, h - 4);
    ctx.lineTo(4 + r, h - 4);
    ctx.quadraticCurveTo(4, h - 4, 4, h - 4 - r);
    ctx.lineTo(4, 4 + r);
    ctx.quadraticCurveTo(4, 4, 4 + r, 4);
    ctx.closePath();
  } else {
    // Default notched shield
    const r = 14;      // Corner rounding radius
    const indent = 10; // Notched side inset
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w - indent, r);
    ctx.lineTo(w, h / 2 - 8);
    ctx.bezierCurveTo(w + 5, h / 2, w + 5, h / 2, w, h / 2 + 8);
    ctx.lineTo(w - indent, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, indent, h - r);
    ctx.lineTo(0, h / 2 + 8);
    ctx.bezierCurveTo(-5, h / 2, -5, h / 2, 0, h / 2 - 8);
    ctx.lineTo(indent, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
  }
}

function renderClippedTileCanvas(sourceCvs, srcX, srcY, srcSize, targetSize, hexColor = null) {
  const cvs = document.createElement('canvas');
  cvs.width  = targetSize;
  cvs.height = targetSize;
  const ctx  = cvs.getContext('2d');

  ctx.save();
  // Clip to custom non-square shape
  drawCustomTilePath(ctx, targetSize, targetSize);
  ctx.clip();

  // Draw corresponding slice of source image
  ctx.drawImage(sourceCvs, srcX, srcY, srcSize, srcSize, 0, 0, targetSize, targetSize);

  // Optional color tint overlay
  if (hexColor !== null) {
    applyVariantTint(ctx, cvs, hexColor);
  }

  // Draw smooth border outline along the custom shape
  ctx.restore();
  ctx.save();
  drawCustomTilePath(ctx, targetSize, targetSize);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth   = 2.5;
  ctx.stroke();
  ctx.restore();

  return cvs;
}

// â”€â”€ Build 3x3 Puzzle Board â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildCustomPuzzleBoard(container, masterCvs) {
  container.innerHTML = '';
  const BS = 360;
  const tileSize = 120; // 360 / 3
  const displayTileSize = 110;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const cell = document.createElement('div');
      cell.className = 'puzzle-tile-cell';
      cell.dataset.index = idx;

      if (idx === 4) {
        // Center cell (index 4) â€” missing slot / drop zone
        buildCenterSlotCell(cell, masterCvs, tileSize, displayTileSize);
      } else {
        // Surrounding 8 tiles
        const tileCvs = renderClippedTileCanvas(masterCvs, col * tileSize, row * tileSize, tileSize, displayTileSize);
        tileCvs.className = 'puzzle-tile-canvas';
        cell.appendChild(tileCvs);
      }

      container.appendChild(cell);
    }
  }
}

function buildCenterSlotCell(cell, masterCvs, tileSize, displayTileSize) {
  cell.id = 'puzzle-center-slot';
  const isFilled = (PUZZLE.activeVariantIdx !== null);
  const shape = document.getElementById('puzzle-shape-select')?.value || 'notched';
  let dropRadius = '14px';
  if (shape === 'circle') dropRadius = '50%';
  else if (shape === 'hexagon') dropRadius = '22%';
  else if (shape === 'heart') dropRadius = '35% 35% 50% 50%';

  if (!isFilled) {
    cell.innerHTML = `
      <div id="puzzle-drop-zone" style="
        width: 100%;
        height: 100%;
        border: 2px dashed rgba(99,102,241,0.6);
        border-radius: ${dropRadius};
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
      ">â“</div>
    `;
  } else {
    // Render filled center tile with selected variant color
    const rawColors = [
      document.getElementById('puzzle-color-1')?.value || '#22c55e',
      document.getElementById('puzzle-color-2')?.value || '#eab308',
      document.getElementById('puzzle-color-3')?.value || '#ec4899',
    ];
    const colorEnabled = [
      document.getElementById('puzzle-color-1-enable')?.checked !== false,
      document.getElementById('puzzle-color-2-enable')?.checked !== false,
      document.getElementById('puzzle-color-3-enable')?.checked !== false,
    ];
    const color = colorEnabled[PUZZLE.activeVariantIdx] ? rawColors[PUZZLE.activeVariantIdx] : null;

    cell.innerHTML = '';
    const tileCvs = renderClippedTileCanvas(masterCvs, 1 * tileSize, 1 * tileSize, tileSize, displayTileSize, color);
    tileCvs.className = 'puzzle-tile-canvas';
    tileCvs.style.cursor = 'pointer';
    cell.appendChild(tileCvs);
  }

  // Always accept drag & drop to replace current piece with new variant!
  cell.ondragover = e => e.preventDefault();
  cell.ondrop = e => {
    e.preventDefault();
    const vIdx = parseInt(e.dataTransfer.getData('text/plain'));
    if (!isNaN(vIdx)) swapCenterPuzzleVariant(vIdx);
  };
  cell.onclick = () => {
    const next = (PUZZLE.activeVariantIdx === null) ? 0 : (PUZZLE.activeVariantIdx + 1) % 3;
    swapCenterPuzzleVariant(next);
  };
}

// â”€â”€ Top Row Variant Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildTopVariants(masterCvs) {
  const topRow = document.getElementById('puzzle-top-row');
  if (!topRow || !masterCvs) return;
  topRow.innerHTML = '';

  const rawColors = [
    document.getElementById('puzzle-color-1')?.value || '#22c55e',
    document.getElementById('puzzle-color-2')?.value || '#eab308',
    document.getElementById('puzzle-color-3')?.value || '#ec4899',
  ];
  const colorEnabled = [
    document.getElementById('puzzle-color-1-enable')?.checked !== false,
    document.getElementById('puzzle-color-2-enable')?.checked !== false,
    document.getElementById('puzzle-color-3-enable')?.checked !== false,
  ];
  const colors = rawColors.map((c, i) => colorEnabled[i] ? c : null);
  const hearts = ['ðŸ’š', 'ðŸ’›', 'ðŸ’—'];

  const tileSize = 120; // center is at (120, 120) in 360x360 canvas

  for (let i = 0; i < 3; i++) {
    const isActive = (PUZZLE.activeVariantIdx === i);
    const card = document.createElement('div');
    card.className = 'puzzle-variant-card' + (isActive ? ' active' : '');
    card.style.opacity = isActive ? '0.45' : '1';
    card.draggable = true;

    // Render center tile with variant tint
    const cvs = renderClippedTileCanvas(masterCvs, 1 * tileSize, 1 * tileSize, tileSize, 86, colors[i]);

    const wrap = document.createElement('div');
    wrap.className = 'puzzle-piece-canvas-wrap';
    wrap.appendChild(cvs);

    const badge = document.createElement('div');
    badge.className = 'puzzle-heart-badge';
    badge.textContent = hearts[i];

    card.appendChild(wrap);
    card.appendChild(badge);

    card.addEventListener('dragstart', e => {
      PUZZLE.draggedVariantIdx = i;
      e.dataTransfer.setData('text/plain', i);
    });
    card.addEventListener('click', () => {
      swapCenterPuzzleVariant(i);
    });

    topRow.appendChild(card);
  }
}

function applyVariantTint(ctx, cvs, hexColor) {
  if (!hexColor) return;

  ctx.save();
  // Blend mode 'color' changes hue while preserving 100% of light, shadow, and line details
  ctx.globalCompositeOperation = 'color';
  ctx.fillStyle = hexColor;
  ctx.globalAlpha = 0.45;
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  // Soft overlay boost for rich vibrant tone without washing out contrast
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = hexColor;
  ctx.globalAlpha = 0.20;
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  ctx.restore();
}

// â”€â”€ Swap Center Puzzle Variant â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function swapCenterPuzzleVariant(newIdx) {
  PUZZLE.activeVariantIdx = newIdx;
  playPuzzleDropSound();

  const centerCell = document.getElementById('puzzle-center-slot');
  if (centerCell && PUZZLE.masterCvs) {
    buildCenterSlotCell(centerCell, PUZZLE.masterCvs, 120, 110);
  }
  if (PUZZLE.masterCvs) {
    buildTopVariants(PUZZLE.masterCvs);
  }
}

function resetPuzzleGame() {
  PUZZLE.activeVariantIdx = null;
  const centerCell = document.getElementById('puzzle-center-slot');
  if (centerCell && PUZZLE.masterCvs) {
    buildCenterSlotCell(centerCell, PUZZLE.masterCvs, 120, 110);
  }
  if (PUZZLE.masterCvs) {
    buildTopVariants(PUZZLE.masterCvs);
  }
}

function playPuzzleDropSound() {
  if (!document.getElementById('puzzle-sound-enable')?.checked) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {}
}

function handlePuzzleColorToggle(changedIdx) {
  const cb1 = document.getElementById('puzzle-color-1-enable');
  const cb2 = document.getElementById('puzzle-color-2-enable');
  const cb3 = document.getElementById('puzzle-color-3-enable');
  const cbs = [cb1, cb2, cb3];

  if (cbs[changedIdx] && !cbs[changedIdx].checked) {
    // Exactly 1 piece un-tinted: check the other two
    cbs.forEach((cb, idx) => {
      if (idx !== changedIdx && cb) cb.checked = true;
    });
  } else if (cbs[changedIdx] && cbs[changedIdx].checked) {
    // If all 3 are checked, uncheck one of the others so exactly 1 remains un-tinted
    const uncheckedCount = cbs.filter(cb => cb && !cb.checked).length;
    if (uncheckedCount === 0) {
      const nextUncheck = (changedIdx + 1) % 3;
      if (cbs[nextUncheck]) cbs[nextUncheck].checked = false;
    }
  }
  renderPuzzleGame();
}

// â”€â”€ LANDSCAPE FULLSCREEN PUZZLE MODE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function startPuzzleAnimation() {
  if (!PUZZLE.mainImg) {
    toast('Vui lÃ²ng táº£i 1 hÃ¬nh áº£nh trÆ°á»›c khi khá»Ÿi cháº¡y! ðŸ§©');
    return;
  }

  // 1. Enter landscape fullscreen theater mode
  if (window.innerWidth < 1024) {
    openMobileTheater();
  } else {
    enterRecordingMode();
  }

  // Reset active piece so center slot is empty initially
  resetPuzzleGame();
}

// â”€â”€ DYNAMIC HUGE PENCIL CURSOR TRACKER (MOVE, DRAG, DROP) â”€â”€â”€â”€
