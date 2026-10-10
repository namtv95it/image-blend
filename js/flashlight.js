/**
 * flashlight.js – Soi Đèn Tab: Image upload, Beam settings, Animation (circle/cone beam)
 */

(function initBigPencilCursor() {
  let pencilEl = document.getElementById('big-pencil-cursor');
  if (!pencilEl) {
    pencilEl = document.createElement('div');
    pencilEl.id = 'big-pencil-cursor';
    pencilEl.className = 'big-pencil-cursor';
    pencilEl.innerHTML = `
      <svg width="192" height="192" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.862 2.487a1.75 1.75 0 012.474 2.474L8.35 15.947l-3.864.966.966-3.864L16.862 2.487z" fill="#f59e0b" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14.387 4.962l2.474 2.474" stroke="#0f172a" stroke-width="1.8"/>
        <path d="M4.486 16.913l.966-3.864 2.898 2.898-3.864.966z" fill="#38bdf8"/>
      </svg>
    `;
    document.body.appendChild(pencilEl);
  }

  const updatePos = (e) => {
    // Only show big pencil follower when hovering/dragging on PUZZLE tab
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
    if (activeTab !== 'puzzle') {
      pencilEl.classList.remove('active');
      return;
    }

    const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    if (x || y) {
      pencilEl.style.left = x + 'px';
      pencilEl.style.top  = y + 'px';
      pencilEl.classList.add('active');
    }
  };

  document.addEventListener('mousemove', updatePos, { passive: true });
  document.addEventListener('dragover',  updatePos, { passive: true });
  document.addEventListener('dragstart', (e) => {
    updatePos(e);
    pencilEl.classList.add('grabbing');
  }, { passive: true });
  document.addEventListener('dragend', () => {
    pencilEl.classList.remove('grabbing');
  }, { passive: true });
  document.addEventListener('drop', (e) => {
    updatePos(e);
    pencilEl.classList.remove('grabbing');
  }, { passive: true });
  document.addEventListener('mouseleave', () => {
    pencilEl.classList.remove('active');
  });
})();

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FLASHLIGHT / SOI ÄÃˆN MODULE
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FLASHLIGHT = {
  img1: null,
  img2: null,
  radius: 200,
  handSize: 44,
  imgScale: 100,
  imgOffsetY: 0,
  mode: 'circle', // 'circle' | 'horizontal'
  beamAngle: -135
};

function updateFlashlightMode(val) {
  FLASHLIGHT.mode = val || 'circle';
  renderFlashlightTab();
}

function updateFlashlightHandSize(val, fromInput) {
  const size = Math.max(10, parseInt(val) || 44);
  FLASHLIGHT.handSize = size;
  const valEl = document.getElementById('fl-hand-val');
  if (valEl && !fromInput) valEl.value = size;
  const rangeEl = document.getElementById('fl-hand-range');
  if (rangeEl) rangeEl.value = size;
  const cur = document.getElementById('fl-custom-cursor');
  if (cur) cur.style.fontSize = size + 'px';
}

function updateFlashlightImgScale(val, fromInput) {
  const scaleVal = Math.max(10, parseInt(val) || 100);
  FLASHLIGHT.imgScale = scaleVal;
  const valEl = document.getElementById('fl-img-scale-val');
  if (valEl && !fromInput) valEl.value = scaleVal;
  const rangeEl = document.getElementById('fl-img-scale-range');
  if (rangeEl) rangeEl.value = scaleVal;
  renderFlashlightTab();
}

function updateFlashlightImgOffsetY(val, fromInput) {
  const offsetVal = parseInt(val) || 0;
  FLASHLIGHT.imgOffsetY = offsetVal;
  const valEl = document.getElementById('fl-img-offsety-val');
  if (valEl && !fromInput) valEl.value = offsetVal;
  const rangeEl = document.getElementById('fl-img-offsety-range');
  if (rangeEl) rangeEl.value = offsetVal;
  renderFlashlightTab();
}

function updateFlashlightRadius(val, fromInput) {
  FLASHLIGHT.radius = Math.max(1, parseInt(val) || 65);
  const valEl = document.getElementById('fl-radius-val');
  if (valEl && !fromInput) valEl.value = FLASHLIGHT.radius;
  const rangeEl = document.getElementById('fl-radius-range');
  if (rangeEl) rangeEl.value = FLASHLIGHT.radius;
  renderFlashlightTab();
}

function updateBeamAngle(val) {
  FLASHLIGHT.beamAngle = parseInt(val) || 0;
  const valEl = document.getElementById('fl-beam-angle-val');
  if (valEl) valEl.textContent = FLASHLIGHT.beamAngle + 'Â°';
  renderFlashlightTab();
}

// â”€â”€ LÆ°u / táº£i cÃ i Ä‘áº·t Soi ÄÃ¨n báº±ng localStorage â”€â”€
const FL_SETTINGS_KEY = 'flashlightSettings';

function saveFlashlightSettings() {
  try {
    localStorage.setItem(FL_SETTINGS_KEY, JSON.stringify({
      mode: FLASHLIGHT.mode,
      radius: FLASHLIGHT.radius,
      handSize: FLASHLIGHT.handSize || 44,
      imgScale: FLASHLIGHT.imgScale || 100,
      imgOffsetY: FLASHLIGHT.imgOffsetY || 0
    }));
  } catch (e) { /* storage unavailable */ }
}

(function initFlashlightSettingsPersistence() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(FL_SETTINGS_KEY) || 'null'); } catch (e) { }

  if (saved) {
    if (saved.mode) FLASHLIGHT.mode = saved.mode;
    if (saved.radius) FLASHLIGHT.radius = saved.radius;
    if (saved.handSize) FLASHLIGHT.handSize = saved.handSize;
    if (saved.imgScale !== undefined) FLASHLIGHT.imgScale = saved.imgScale;
    if (saved.imgOffsetY !== undefined) FLASHLIGHT.imgOffsetY = saved.imgOffsetY;
  }

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('fl-mode-select', FLASHLIGHT.mode);
  set('fl-radius-val', FLASHLIGHT.radius);
  set('fl-radius-range', FLASHLIGHT.radius);
  set('fl-hand-val', FLASHLIGHT.handSize || 44);
  set('fl-hand-range', FLASHLIGHT.handSize || 44);
  set('fl-img-scale-val', FLASHLIGHT.imgScale || 100);
  set('fl-img-scale-range', FLASHLIGHT.imgScale || 100);
  set('fl-img-offsety-val', FLASHLIGHT.imgOffsetY || 0);
  set('fl-img-offsety-range', FLASHLIGHT.imgOffsetY || 0);

  // LÆ°u má»—i khi ngÆ°á»i dÃ¹ng chá»‰nh báº¥t ká»³ cÃ i Ä‘áº·t nÃ o
  ['fl-mode-select', 'fl-radius-val', 'fl-radius-range', 'fl-hand-val', 'fl-hand-range', 'fl-img-scale-val', 'fl-img-scale-range', 'fl-img-offsety-val', 'fl-img-offsety-range'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => setTimeout(saveFlashlightSettings, 0));
    el.addEventListener('change', () => setTimeout(saveFlashlightSettings, 0));
  });
})();


// Init file listeners for Flashlight tab (Supports selecting 2 images at once)
(function initFlashlightModule() {
  const multiInput = document.getElementById('file-fl-multi');

  if (multiInput) {
    multiInput.addEventListener('change', e => {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      if (files.length === 0) return;

      loadFlashlightImage(1, files[0]);
      e.target.value = '';
    });
  }
})();

function loadFlashlightImage(slot, file) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      if (slot === 1) FLASHLIGHT.img1 = img;
      if (slot === 2) FLASHLIGHT.img2 = img;
      updateFlashlightMultiPreview();
      renderFlashlightTab();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function updateFlashlightMultiPreview() {
  const body = document.getElementById('body-fl-multi');
  const prev = document.getElementById('prev-fl-multi');
  const pimg1 = document.getElementById('pimg-fl-1');
  const pimg2 = document.getElementById('pimg-fl-2');

  if (FLASHLIGHT.img1) {
    if (body) body.style.display = 'none';
    if (prev) prev.style.display = 'block';
    if (pimg1) pimg1.src = FLASHLIGHT.img1.src;
  } else {
    if (body) body.style.display = 'flex';
    if (prev) prev.style.display = 'none';
  }
}

function clearFlashlightMulti() {
  FLASHLIGHT.img1 = null;
  FLASHLIGHT.img2 = null;
  updateFlashlightMultiPreview();
  renderFlashlightTab();
}

function updateFlashlightRadius(val, fromInput) {
  FLASHLIGHT.radius = Math.max(1, parseInt(val) || 65);
  const valEl = document.getElementById('fl-radius-val');
  if (valEl && !fromInput) valEl.value = FLASHLIGHT.radius;
  const rangeEl = document.getElementById('fl-radius-range');
  if (rangeEl) rangeEl.value = FLASHLIGHT.radius;

  const ring = document.getElementById('fl-beam-ring');
  if (ring) {
    const d = FLASHLIGHT.radius * 2;
    ring.style.width  = d + 'px';
    ring.style.height = d + 'px';
  }
}

function renderFlashlightTab() {
  const flOverlay = document.getElementById('flashlight-theater-overlay');
  const emojiHeader = document.getElementById('emoji-header-bar');

  if (flOverlay && activeTab === 'flashlight') {
    flOverlay.classList.add('show');
    if (emojiHeader) emojiHeader.classList.add('hidden');
  }

  // Update dynamic badges emoji text
  const e1Val = document.getElementById('fl-emoji-1-input')?.value || 'ðŸ’™';
  const e2Val = document.getElementById('fl-emoji-2-input')?.value || 'â¤ï¸';
  const badge1El = document.getElementById('fl-badge-emoji-1');
  const badge2El = document.getElementById('fl-badge-emoji-2');
  if (badge1El) badge1El.textContent = e1Val;
  if (badge2El) badge2El.textContent = e2Val;

  // 1. Draw top row 2 cards (Image 1 and Image 2)
  renderTopFlashlightCards();

  // 2. Render bottom main stage (color image + black mask overlay)
  renderFlashlightStage();
}

function renderTopFlashlightCards() {
  const cvs1 = document.getElementById('fl-cvs-top-1');
  const cvs2 = document.getElementById('fl-cvs-top-2');

  if (cvs1) {
    const ctx = cvs1.getContext('2d');
    ctx.clearRect(0, 0, 150, 150);
    if (FLASHLIGHT.img1 && FLASHLIGHT.img1.complete && FLASHLIGHT.img1.naturalWidth) {
      drawScaledFit(ctx, FLASHLIGHT.img1, 150, 150);
    }
  }

  if (cvs2) {
    const ctx = cvs2.getContext('2d');
    ctx.clearRect(0, 0, 150, 150);
    if (FLASHLIGHT.img2 && FLASHLIGHT.img2.complete && FLASHLIGHT.img2.naturalWidth) {
      drawScaledFit(ctx, FLASHLIGHT.img2, 150, 150);
    }
  }
}

function drawScaledFit(ctx, img, targetW, targetH, customScale = 1, offsetY = 0) {
  const srcW = img.naturalWidth  || img.width  || targetW;
  const srcH = img.naturalHeight || img.height || targetH;
  const baseScale = Math.min(targetW / srcW, targetH / srcH);
  const finalScale = baseScale * customScale;
  const renderW = srcW * finalScale;
  const renderH = srcH * finalScale;
  const dx = (targetW - renderW) / 2;
  const dy = (targetH - renderH) / 2 + offsetY;
  ctx.drawImage(img, 0, 0, srcW, srcH, dx, dy, renderW, renderH);
}

function renderFlashlightStage() {
  const colorCvs = document.getElementById('fl-color-canvas');
  const maskCvs  = document.getElementById('fl-mask-canvas');
  const stageEl  = document.getElementById('flashlight-bottom-stage');
  if (!colorCvs || !maskCvs || !stageEl) return;

  const W = 1080, H = 1920;
  const targetSel = document.getElementById('fl-target-select')?.value || '1';
  const targetImg = (targetSel === '1') ? FLASHLIGHT.img1 : FLASHLIGHT.img2;

  const scaleFactor = (FLASHLIGHT.imgScale || 100) / 100;
  const offsetY = FLASHLIGHT.imgOffsetY || 0;

  // 1. Render color canvas (bottom layer)
  const cCtx = colorCvs.getContext('2d');
  cCtx.imageSmoothingEnabled = true;
  cCtx.imageSmoothingQuality = 'high';
  cCtx.clearRect(0, 0, W, H);
  if (targetImg && targetImg.complete && targetImg.naturalWidth) {
    drawScaledFit(cCtx, targetImg, W, H, scaleFactor, offsetY);
  }

  // 2. Render pitch-black mask canvas (top layer)
  resetFlashlightMaskCanvas(maskCvs, targetImg, W, H);

  // 3. Attach mousemove / touchmove listeners for spotlight reveal
  setupFlashlightSpotlightEvents(stageEl, maskCvs, colorCvs, W, H);
}

function resetFlashlightMaskCanvas(maskCvs, targetImg, W, H) {
  const mCtx = maskCvs.getContext('2d');
  mCtx.imageSmoothingEnabled = true;
  mCtx.imageSmoothingQuality = 'high';
  mCtx.globalCompositeOperation = 'source-over';
  mCtx.clearRect(0, 0, W, H);

  if (targetImg && targetImg.complete && targetImg.naturalWidth) {
    const scaleFactor = (FLASHLIGHT.imgScale || 100) / 100;
    const offsetY = FLASHLIGHT.imgOffsetY || 0;
    // Fill mask strictly matching character's outline/silhouette (Alpha channel)
    mCtx.save();
    drawScaledFit(mCtx, targetImg, W, H, scaleFactor, offsetY);
    mCtx.globalCompositeOperation = 'source-in';
    mCtx.fillStyle = '#000000';
    mCtx.fillRect(0, 0, W, H);
    mCtx.restore();
  }
}

function setupFlashlightSpotlightEvents(stageEl, maskCvs, colorCvs, W, H) {
  const mCtx = maskCvs.getContext('2d');

  let isDragging = false;

  // Helper function to render torch light beam at specified CSS position (cssX, cssY)
  const renderTorchAtCSSPos = (cssX, cssY) => {
    const targetSel = document.getElementById('fl-target-select')?.value || '1';
    const targetImg = (targetSel === '1') ? FLASHLIGHT.img1 : FLASHLIGHT.img2;

    const isRotated = document.body.classList.contains('recording-mode');
    const rect = maskCvs.getBoundingClientRect();

    const scaleX = maskCvs.width / (isRotated ? (rect.height || 1) : (rect.width || 1));
    const scaleY = maskCvs.height / (isRotated ? (rect.width || 1) : (rect.height || 1));

    const x = cssX * scaleX;
    const y = cssY * scaleY;

    // Reset mask to black so unlit areas stay pitch black
    resetFlashlightMaskCanvas(maskCvs, targetImg, W, H);

    const rCSS = FLASHLIGHT.radius;
    const scaleCanvasRatio = maskCvs.width / (isRotated ? rect.height : rect.width);
    const rCanvas = rCSS * scaleCanvasRatio;

    mCtx.save();

    if (FLASHLIGHT.mode === 'horizontal') {
      // Mode 2: Angled Cone Spotlight Beam (Chiáº¿u chÃ©o gÃ³c nÃ³n theo FLASHLIGHT.beamAngle riÃªng)
      const beamRadAngle = (FLASHLIGHT.beamAngle || -135) * Math.PI / 180;

      const torchHeadX = x;
      const torchHeadY = y;

      const rStart = Math.max(12, rCanvas);
      const rEnd = rCanvas * 1.3; // gáº§n nhÆ° song song, ná»Ÿ nháº¹
      const beamLength = Math.max(W, H) * 1.5;

      const endX = torchHeadX + Math.cos(beamRadAngle) * beamLength;
      const endY = torchHeadY + Math.sin(beamRadAngle) * beamLength;

      const perpX = -Math.sin(beamRadAngle);
      const perpY = Math.cos(beamRadAngle);

      const p1x = torchHeadX + perpX * rStart;
      const p1y = torchHeadY + perpY * rStart;
      const p2x = torchHeadX - perpX * rStart;
      const p2y = torchHeadY - perpY * rStart;

      const p3x = endX - perpX * rEnd;
      const p3y = endY - perpY * rEnd;
      const p4x = endX + perpX * rEnd;
      const p4y = endY + perpY * rEnd;

      const coneGrad = mCtx.createLinearGradient(torchHeadX, torchHeadY, endX, endY);
      coneGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      coneGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.9)');
      coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      mCtx.globalCompositeOperation = 'destination-out';
      mCtx.fillStyle = coneGrad;

      mCtx.beginPath();
      mCtx.moveTo(p1x, p1y);
      mCtx.lineTo(p4x, p4y);
      mCtx.lineTo(p3x, p3y);
      mCtx.lineTo(p2x, p2y);
      mCtx.closePath();
      mCtx.fill();

      // Soft circular tip glow
      const tipGrad = mCtx.createRadialGradient(torchHeadX, torchHeadY, 0, torchHeadX, torchHeadY, rStart);
      tipGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      tipGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      mCtx.fillStyle = tipGrad;
      mCtx.beginPath();
      mCtx.arc(torchHeadX, torchHeadY, rStart, 0, Math.PI * 2);
      mCtx.fill();
    } else {
      // Mode 1: Circle Spotlight (viá»n trÃ²n rÃµ nÃ©t, khÃ´ng nhÃ²e)
      mCtx.globalCompositeOperation = 'destination-out';
      mCtx.fillStyle = '#000000';
      mCtx.beginPath();
      mCtx.arc(x, y, rCanvas, 0, Math.PI * 2);
      mCtx.fill();
    }

    mCtx.restore();
  };

  // Convert raw pointer screen coordinates to local CSS coordinates inside stage
  const getStageLocalCSS = (e) => {
    const rect = maskCvs.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0));
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0));

    const isRotated = document.body.classList.contains('recording-mode');
    if (isRotated) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const unRotatedX = -(clientY - centerY);
      const unRotatedY = clientX - centerX;
      return {
        cssX: unRotatedX + rect.height / 2,
        cssY: unRotatedY + rect.width / 2
      };
    } else {
      return {
        cssX: clientX - rect.left,
        cssY: clientY - rect.top
      };
    }
  };

  // Custom cursor living INSIDE the stage so it rotates together with the landscape theater
  let cursorEl = stageEl.querySelector('#fl-custom-cursor');
  if (!cursorEl) {
    cursorEl = document.createElement('div');
    cursorEl.id = 'fl-custom-cursor';
    cursorEl.textContent = '\uD83D\uDC46';
    cursorEl.style.cssText = 'position:absolute;left:0;top:0;line-height:1;pointer-events:none;z-index:10;display:none;transform:translate(-50%,-8%);filter:drop-shadow(0 2px 4px rgba(0,0,0,.5));';
    stageEl.appendChild(cursorEl);
  }
  stageEl.style.cursor = 'none';
  stageEl.querySelectorAll('canvas').forEach(c => { c.style.cursor = 'none'; });

  const moveCursor = (e) => {
    cursorEl.style.fontSize = (FLASHLIGHT.handSize || 44) + 'px';
    const { cssX, cssY } = getStageLocalCSS(e);
    const isRotated = document.body.classList.contains('recording-mode');
    const rect = maskCvs.getBoundingClientRect();
    const s = (isRotated ? rect.height : rect.width) / (maskCvs.offsetWidth || 1) || 1;
    cursorEl.style.left = (cssX / s) + 'px';
    cursorEl.style.top = (cssY / s) + 'px';
    cursorEl.style.display = 'block';
  };
  if (!stageEl.dataset.flCursorBound) {
    stageEl.dataset.flCursorBound = '1';
    stageEl.addEventListener('pointermove', moveCursor);
    stageEl.addEventListener('pointerdown', moveCursor);
    stageEl.addEventListener('pointerleave', () => { cursorEl.style.display = 'none'; });
  }

  // Drag / Touch Handlers
  const onPointerDown = (e) => {
    isDragging = true;
    if (e.cancelable) e.preventDefault();
    const { cssX, cssY } = getStageLocalCSS(e);
    renderTorchAtCSSPos(cssX, cssY);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    const { cssX, cssY } = getStageLocalCSS(e);
    renderTorchAtCSSPos(cssX, cssY);
  };

  const onPointerUp = () => {
    isDragging = false;
  };

  stageEl.addEventListener('pointerdown', onPointerDown, { passive: false });
  stageEl.addEventListener('touchstart', onPointerDown, { passive: false });
  stageEl.addEventListener('mousedown', onPointerDown);

  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('mousemove', onPointerMove);

  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('touchend', onPointerUp);
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('touchcancel', onPointerUp);

  // Initial center position setup
  renderTorchAtCSSPos(540, 960);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SHADOW MATCH / GHÃ‰P BÃ“NG MODULE
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SHADOWMATCH = {
  images: [], // array of HTMLImageElement (up to 3)
  shadowIndex: 0, // index of the silhouette image (0, 1 or 2)
  handSize: 44,
  imgScale: 100,
  imgOffsetY: 0,
  cardState: [] // { index, origSlot, top, left, width, height, scaleRatio, isDropped, dropTop, dropLeft, isDragging }
};

