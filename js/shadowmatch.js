/**
 * shadowmatch.js – Ghép Bóng Tab: Image upload, Shadow canvas, Draggable cards, Animation
 */

function updateShadowMatchHandSize(val, fromInput) {
  const size = Math.max(10, parseInt(val) || 44);
  SHADOWMATCH.handSize = size;
  const valEl = document.getElementById('sm-hand-val');
  if (valEl && !fromInput) valEl.value = size;
  const rangeEl = document.getElementById('sm-hand-range');
  if (rangeEl) rangeEl.value = size;
  const cur = document.getElementById('sm-custom-cursor');
  if (cur) cur.style.fontSize = size + 'px';
}

function updateShadowMatchImgScale(val, fromInput) {
  const scaleVal = Math.max(10, parseInt(val) || 100);
  SHADOWMATCH.imgScale = scaleVal;
  const valEl = document.getElementById('sm-img-scale-val');
  if (valEl && !fromInput) valEl.value = scaleVal;
  const rangeEl = document.getElementById('sm-img-scale-range');
  if (rangeEl) rangeEl.value = scaleVal;
  renderShadowMatchTab();
}

function updateShadowMatchImgOffsetY(val, fromInput) {
  const offsetVal = parseInt(val) || 0;
  SHADOWMATCH.imgOffsetY = offsetVal;
  const valEl = document.getElementById('sm-img-offsety-val');
  if (valEl && !fromInput) valEl.value = offsetVal;
  const rangeEl = document.getElementById('sm-img-offsety-range');
  if (rangeEl) rangeEl.value = offsetVal;
  renderShadowMatchTab();
}

function updateShadowMatchTarget(val) {
  SHADOWMATCH.shadowIndex = parseInt(val) || 0;
  renderShadowMatchTab();
}

// Persistence for Shadow Match settings
const SM_SETTINGS_KEY = 'shadowMatchSettings';

function saveShadowMatchSettings() {
  try {
    localStorage.setItem(SM_SETTINGS_KEY, JSON.stringify({
      shadowIndex: SHADOWMATCH.shadowIndex,
      handSize: SHADOWMATCH.handSize || 44,
      imgScale: SHADOWMATCH.imgScale || 100,
      imgOffsetY: SHADOWMATCH.imgOffsetY || 0
    }));
  } catch (e) { }
}

(function initShadowMatchSettingsPersistence() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(SM_SETTINGS_KEY) || 'null'); } catch (e) { }

  if (saved) {
    if (saved.shadowIndex !== undefined) SHADOWMATCH.shadowIndex = saved.shadowIndex;
    if (saved.handSize) SHADOWMATCH.handSize = saved.handSize;
    if (saved.imgScale !== undefined) SHADOWMATCH.imgScale = saved.imgScale;
    if (saved.imgOffsetY !== undefined) SHADOWMATCH.imgOffsetY = saved.imgOffsetY;
  }

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('sm-shadow-select', SHADOWMATCH.shadowIndex);
  set('sm-hand-val', SHADOWMATCH.handSize || 44);
  set('sm-hand-range', SHADOWMATCH.handSize || 44);
  set('sm-img-scale-val', SHADOWMATCH.imgScale || 100);
  set('sm-img-scale-range', SHADOWMATCH.imgScale || 100);
  set('sm-img-offsety-val', SHADOWMATCH.imgOffsetY || 0);
  set('sm-img-offsety-range', SHADOWMATCH.imgOffsetY || 0);

  ['sm-shadow-select', 'sm-hand-val', 'sm-hand-range', 'sm-img-scale-val', 'sm-img-scale-range', 'sm-img-offsety-val', 'sm-img-offsety-range'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => setTimeout(saveShadowMatchSettings, 0));
    el.addEventListener('change', () => setTimeout(saveShadowMatchSettings, 0));
  });
})();

// File listener for Shadow Match
(function initShadowMatchModule() {
  const multiInput = document.getElementById('file-sm-multi');
  if (multiInput) {
    multiInput.addEventListener('change', e => {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      if (files.length === 0) return;

      SHADOWMATCH.images = [];
      let loaded = 0;
      files.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = ev => {
          const img = new Image();
          img.onload = () => {
            SHADOWMATCH.images[idx] = img;
            loaded++;
            updateShadowMatchPreviewList();
            renderShadowMatchTab();
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    });
  }

  // Global spacebar listener to reset dropped cards back to original positions
  window.addEventListener('keydown', e => {
    if (e.code === 'Space' && activeTab === 'shadowmatch') {
      e.preventDefault();
      resetShadowMatchPositions();
    }
  });
})();

function updateShadowMatchPreviewList() {
  const body = document.getElementById('body-sm-multi');
  const prev = document.getElementById('prev-sm-multi');
  const listEl = document.getElementById('sm-preview-list');

  if (SHADOWMATCH.images && SHADOWMATCH.images.length > 0) {
    if (body) body.style.display = 'none';
    if (prev) prev.style.display = 'block';
    if (listEl) {
      listEl.innerHTML = '';
      SHADOWMATCH.images.forEach((img, idx) => {
        if (!img) return;
        const item = document.createElement('div');
        item.style.cssText = 'position:relative;width:60px;height:70px;border-radius:8px;overflow:hidden;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;';
        
        const previewImg = document.createElement('img');
        previewImg.src = img.src;
        previewImg.style.cssText = 'width:100%;height:50px;object-fit:contain;';

        const label = document.createElement('span');
        label.textContent = `${idx + 1}. ` + (idx === SHADOWMATCH.shadowIndex ? 'BÃ³ng' : `áº¢nh ${idx + 1}`);
        label.style.cssText = 'font-size:0.6rem;color:#fff;background:rgba(0,0,0,0.7);width:100%;text-align:center;padding:1px 0;';

        item.appendChild(previewImg);
        item.appendChild(label);
        listEl.appendChild(item);
      });
    }
  } else {
    if (body) body.style.display = 'flex';
    if (prev) prev.style.display = 'none';
  }
}

function clearShadowMatchImages() {
  SHADOWMATCH.images = [];
  updateShadowMatchPreviewList();
  renderShadowMatchTab();
}

function resetShadowMatchPositions() {
  SHADOWMATCH.activeCardEl = null;
  SHADOWMATCH.cardState.forEach(cs => {
    cs.isDropped = false;
  });
  renderShadowMatchTab();
}

function renderShadowMatchTab() {
  const smOverlay = document.getElementById('shadowmatch-theater-overlay');
  const emojiHeader = document.getElementById('emoji-header-bar');

  if (smOverlay && activeTab === 'shadowmatch') {
    smOverlay.classList.add('show');
    if (emojiHeader) emojiHeader.classList.add('hidden');
  }

  // 1. Render blackout silhouette canvas on stage
  renderShadowMatchStage();
}

function renderShadowMatchStage() {
  const shadowCvs = document.getElementById('sm-shadow-canvas');
  const stageEl   = document.getElementById('sm-stage');
  const dragCont  = document.getElementById('sm-drag-container');
  if (!shadowCvs || !stageEl || !dragCont) return;

  const W = 1080, H = 1920;
  const shadowIdx = SHADOWMATCH.shadowIndex || 0;
  const shadowImg = SHADOWMATCH.images[shadowIdx];

  const scaleFactor = (SHADOWMATCH.imgScale || 100) / 100;
  const offsetY = SHADOWMATCH.imgOffsetY || 0;

  // Render silhouette blackout canvas
  const sCtx = shadowCvs.getContext('2d');
  sCtx.imageSmoothingEnabled = true;
  sCtx.imageSmoothingQuality = 'high';
  sCtx.clearRect(0, 0, W, H);

  if (shadowImg && shadowImg.complete && shadowImg.naturalWidth) {
    sCtx.save();
    drawScaledFit(sCtx, shadowImg, W, H, scaleFactor, offsetY);
    sCtx.globalCompositeOperation = 'source-in';
    sCtx.fillStyle = '#000000';
    sCtx.fillRect(0, 0, W, H);
    sCtx.restore();
  }

  // Build top draggable cards inside dragCont
  renderShadowMatchDraggableCards(stageEl, dragCont, W, H, scaleFactor, offsetY);
  setupShadowMatchCursor(stageEl);
}

// Compute bounding box for scaled fit image on target W, H
function getScaledFitBounds(img, targetW, targetH, customScale = 1, offsetY = 0) {
  const srcW = img.naturalWidth || img.width || targetW;
  const srcH = img.naturalHeight || img.height || targetH;
  const baseScale = Math.min(targetW / srcW, targetH / srcH);
  const finalScale = baseScale * customScale;
  const renderW = srcW * finalScale;
  const renderH = srcH * finalScale;
  const dx = (targetW - renderW) / 2;
  const dy = (targetH - renderH) / 2 + offsetY;
  return { dx, dy, renderW, renderH };
}

function renderShadowMatchDraggableCards(stageEl, dragCont, W, H, scaleFactor, offsetY) {
  dragCont.innerHTML = '';
  if (!SHADOWMATCH.images || SHADOWMATCH.images.length === 0) return;

  const stageRect = stageEl.getBoundingClientRect();
  const isRotated = document.body.classList.contains('recording-mode');
  const stageW = isRotated ? (stageRect.height || 640) : (stageRect.width || 360);
  const stageH = isRotated ? (stageRect.width || 360) : (stageRect.height || 640);

  // Calculate shadow silhouette target bounding box in stage CSS pixels
  const shadowIdx = SHADOWMATCH.shadowIndex || 0;
  const shadowImg = SHADOWMATCH.images[shadowIdx];
  let shadowBounds = { dx: 0, dy: (H - H * scaleFactor) / 2 + offsetY, renderW: W * scaleFactor, renderH: H * scaleFactor };
  if (shadowImg && shadowImg.naturalWidth) {
    shadowBounds = getScaledFitBounds(shadowImg, W, H, scaleFactor, offsetY);
  }

  // Convert canvas pixel bounds to stage CSS pixel bounds
  const cvsToCssX = stageW / W;
  const cvsToCssY = stageH / H;

  const targetCssX = shadowBounds.dx * cvsToCssX;
  const targetCssY = shadowBounds.dy * cvsToCssY;
  const targetCssW = shadowBounds.renderW * cvsToCssX;
  const targetCssH = shadowBounds.renderH * cvsToCssY;

  // Available images to display in top row
  const nonShadowImages = SHADOWMATCH.images;
  const totalCards = nonShadowImages.length;
  if (totalCards === 0) return;

  const topRowPadding = 15;
  const topRowHeight = stageH * 0.22;
  const cardW = (stageW - topRowPadding * (totalCards + 1)) / totalCards;
  const cardH = topRowHeight;

  nonShadowImages.forEach((img, idx) => {
    if (!img) return;

    if (!SHADOWMATCH.cardState[idx]) {
      SHADOWMATCH.cardState[idx] = { isDropped: false, dropTop: 0, dropLeft: 0 };
    }
    const state = SHADOWMATCH.cardState[idx];

    const cardEl = document.createElement('div');
    cardEl.className = 'sm-draggable-card';
    cardEl.dataset.cardIdx = idx;

    const imgEl = document.createElement('img');
    imgEl.src = img.src;
    cardEl.appendChild(imgEl);

    // Initial position in top row
    const origLeft = topRowPadding + idx * (cardW + topRowPadding);
    const origTop = 15;

    if (state.isDropped) {
      cardEl.classList.add('dropped');
      const curW = state.dropW !== undefined ? state.dropW : targetCssW;
      const curH = state.dropH !== undefined ? state.dropH : targetCssH;
      cardEl.style.width = curW + 'px';
      cardEl.style.height = curH + 'px';
      cardEl.style.left = (state.dropLeft !== undefined ? state.dropLeft : targetCssX) + 'px';
      cardEl.style.top = (state.dropTop !== undefined ? state.dropTop : targetCssY) + 'px';

      // Create 4 corner resize handles
      ['tl', 'tr', 'bl', 'br'].forEach(corner => {
        const handle = document.createElement('div');
        handle.className = `sm-resize-handle ${corner}`;
        handle.dataset.corner = corner;
        cardEl.appendChild(handle);
        makeHandleResizable(handle, cardEl, idx, stageEl, corner);
      });
    } else {
      cardEl.classList.remove('dropped');
      cardEl.style.width = cardW + 'px';
      cardEl.style.height = cardH + 'px';
      cardEl.style.left = origLeft + 'px';
      cardEl.style.top = origTop + 'px';
    }

    // Attach Pointer Drag events for each card
    makeCardDraggable(cardEl, idx, stageEl, targetCssW, targetCssH, origLeft, origTop);

    dragCont.appendChild(cardEl);
  });
}

function makeHandleResizable(handle, cardEl, cardIdx, stageEl, corner) {
  let isResizing = false;
  let startX = 0, startY = 0;
  let startWidth = 0, startHeight = 0;
  let startLeft = 0, startTop = 0;

  const getStageCssPos = (e) => {
    const rect = stageEl.getBoundingClientRect();
    const isRotated = document.body.classList.contains('recording-mode');
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0));
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0));
    if (isRotated) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return {
        stageCssX: -(clientY - centerY) + rect.height / 2,
        stageCssY: (clientX - centerX) + rect.width / 2
      };
    } else {
      return {
        stageCssX: clientX - rect.left,
        stageCssY: clientY - rect.top
      };
    }
  };

  const onPointerMove = (e) => {
    if (!isResizing) return;
    const { stageCssX, stageCssY } = getStageCssPos(e);
    let deltaX = stageCssX - startX;
    let deltaY = stageCssY - startY;

    let newW = startWidth;
    let newH = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    const aspect = startWidth / startHeight || 1;

    if (corner === 'br') {
      newW = Math.max(30, startWidth + deltaX);
      newH = newW / aspect;
    } else if (corner === 'bl') {
      newW = Math.max(30, startWidth - deltaX);
      newH = newW / aspect;
      newLeft = startLeft + (startWidth - newW);
    } else if (corner === 'tr') {
      newW = Math.max(30, startWidth + deltaX);
      newH = newW / aspect;
      newTop = startTop + (startHeight - newH);
    } else if (corner === 'tl') {
      newW = Math.max(30, startWidth - deltaX);
      newH = newW / aspect;
      newLeft = startLeft + (startWidth - newW);
      newTop = startTop + (startHeight - newH);
    }

    cardEl.style.width = newW + 'px';
    cardEl.style.height = newH + 'px';
    cardEl.style.left = newLeft + 'px';
    cardEl.style.top = newTop + 'px';

    SHADOWMATCH.cardState[cardIdx].dropW = newW;
    SHADOWMATCH.cardState[cardIdx].dropH = newH;
    SHADOWMATCH.cardState[cardIdx].dropLeft = newLeft;
    SHADOWMATCH.cardState[cardIdx].dropTop = newTop;
  };

  const onPointerUp = (e) => {
    if (!isResizing) return;
    isResizing = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('touchend', onPointerUp);
  };

  const onPointerDown = (e) => {
    e.stopPropagation();
    isResizing = true;

    const { stageCssX, stageCssY } = getStageCssPos(e);
    startX = stageCssX;
    startY = stageCssY;
    startWidth = parseFloat(cardEl.style.width) || cardEl.offsetWidth;
    startHeight = parseFloat(cardEl.style.height) || cardEl.offsetHeight;
    startLeft = parseFloat(cardEl.style.left) || 0;
    startTop = parseFloat(cardEl.style.top) || 0;

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  };

  handle.addEventListener('pointerdown', onPointerDown);
  handle.addEventListener('touchstart', onPointerDown, { passive: false });
}

function makeCardDraggable(cardEl, cardIdx, stageEl, targetCssW, targetCssH, origLeft, origTop) {
  const getStageCssPos = (e) => {
    const rect = stageEl.getBoundingClientRect();
    const isRotated = document.body.classList.contains('recording-mode');
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0));
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0));
    if (isRotated) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return {
        stageCssX: -(clientY - centerY) + rect.height / 2,
        stageCssY: (clientX - centerX) + rect.width / 2
      };
    } else {
      return {
        stageCssX: clientX - rect.left,
        stageCssY: clientY - rect.top
      };
    }
  };

  const onPointerMove = (e) => {
    if (!SHADOWMATCH.activeCardEl || SHADOWMATCH.activeCardEl !== cardEl) return;
    const { stageCssX, stageCssY } = getStageCssPos(e);
    cardEl.style.left = (stageCssX - targetCssW / 2) + 'px';
    cardEl.style.top = (stageCssY - targetCssH / 2) + 'px';
  };

  const onPointerDown = (e) => {
    e.stopPropagation();

    // If this card is ALREADY active (being moved), click again to DROP it at current location
    if (SHADOWMATCH.activeCardEl === cardEl) {
      SHADOWMATCH.activeCardEl = null;
      cardEl.style.zIndex = '5';
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);

      const currentTop = parseFloat(cardEl.style.top) || 0;
      const currentLeft = parseFloat(cardEl.style.left) || 0;

      if (currentTop > 30) {
        SHADOWMATCH.cardState[cardIdx] = {
          isDropped: true,
          dropLeft: currentLeft,
          dropTop: currentTop
        };
      } else {
        SHADOWMATCH.cardState[cardIdx] = { isDropped: false };
        renderShadowMatchTab();
      }
      return;
    }

    // Release any previous active card if another one was selected
    if (SHADOWMATCH.activeCardEl && SHADOWMATCH.activeCardEl !== cardEl) {
      SHADOWMATCH.activeCardEl.style.zIndex = '5';
      SHADOWMATCH.activeCardEl = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
    }

    // ACTIVATE THIS CARD: Pick up and follow cursor immediately
    SHADOWMATCH.activeCardEl = cardEl;
    cardEl.style.zIndex = '100';

    const state = SHADOWMATCH.cardState[cardIdx];
    state.isDropped = true;
    cardEl.style.width = targetCssW + 'px';
    cardEl.style.height = targetCssH + 'px';

    const { stageCssX, stageCssY } = getStageCssPos(e);
    cardEl.style.left = (stageCssX - targetCssW / 2) + 'px';
    cardEl.style.top = (stageCssY - targetCssH / 2) + 'px';

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
  };

  cardEl.addEventListener('pointerdown', onPointerDown);
  cardEl.addEventListener('touchstart', onPointerDown, { passive: false });
}

function setupShadowMatchCursor(stageEl) {
  let cursorEl = stageEl.querySelector('#sm-custom-cursor');
  if (!cursorEl) {
    cursorEl = document.createElement('div');
    cursorEl.id = 'sm-custom-cursor';
    cursorEl.textContent = 'ðŸ‘†';
    cursorEl.style.cssText = 'position:absolute;left:0;top:0;line-height:1;pointer-events:none;z-index:200;display:none;transform:translate(-50%,-8%);filter:drop-shadow(0 2px 4px rgba(0,0,0,.5));';
    stageEl.appendChild(cursorEl);
  }
  stageEl.style.cursor = 'none';

  const moveCursor = (e) => {
    cursorEl.style.fontSize = (SHADOWMATCH.handSize || 44) + 'px';
    const rect = stageEl.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const isRotated = document.body.classList.contains('recording-mode');
    let cssX, cssY;
    if (isRotated) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const unRotatedX = -(clientY - centerY);
      const unRotatedY = clientX - centerX;
      cssX = unRotatedX + rect.height / 2;
      cssY = unRotatedY + rect.width / 2;
    } else {
      cssX = clientX - rect.left;
      cssY = clientY - rect.top;
    }

    cursorEl.style.left = cssX + 'px';
    cursorEl.style.top = cssY + 'px';
    cursorEl.style.display = 'block';
  };

  if (!stageEl.dataset.smCursorBound) {
    stageEl.dataset.smCursorBound = '1';
    stageEl.addEventListener('pointermove', moveCursor);
    stageEl.addEventListener('pointerdown', moveCursor);
    stageEl.addEventListener('pointerleave', () => { cursorEl.style.display = 'none'; });
  }
}

function startShadowMatchAnimation() {
  if (!SHADOWMATCH.images || SHADOWMATCH.images.length === 0) return;

  if (window.innerWidth < 1024) {
    openMobileTheater();
  } else {
    enterRecordingMode();
  }

  renderShadowMatchTab();
  setTimeout(() => {
    renderShadowMatchTab();
  }, 50);
  setTimeout(() => {
    renderShadowMatchTab();
  }, 350);
}

// â”€â”€ Launch Flashlight Fullscreen Mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function startFlashlightAnimation() {
  if (!FLASHLIGHT.img1 && !FLASHLIGHT.img2) {
    toast('Vui lÃ²ng táº£i Ã­t nháº¥t 1 hÃ¬nh áº£nh trÆ°á»›c khi khá»Ÿi cháº¡y! ðŸ’¡');
    return;
  }

  // Enter landscape fullscreen theater mode
  if (window.innerWidth < 1024) {
    openMobileTheater();
  } else {
    enterRecordingMode();
  }

  // Re-render and reset mask canvas to pitch black
  renderFlashlightTab();
  toast('Di chuyá»ƒn chuá»™t vÃ o bá»©c áº£nh phÃ­a dÆ°á»›i Ä‘á»ƒ soi Ä‘Ã¨n pin! ðŸ’¡');
}

