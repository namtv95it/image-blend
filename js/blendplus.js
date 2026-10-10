/**
 * blendplus.js – Blend+ Tab: Multi-stream blend, Column upload, Sequential fusion
 */

/* â”€â”€ RUN BLEND + FLOW â”€â”€ */
function runBlendPlus() {
  if (BP.running) {
    resetAll();
    return;
  }

  // Validate streams: only consider fully filled streams
  const validStreams = BP.streams.filter(s => s.charImg && s.emojiImg && s.resultImg);
  if (validStreams.length === 0) {
    toast('Cáº§n Ã­t nháº¥t 1 luá»“ng cÃ³ Ä‘á»§: NhÃ¢n váº­t + Emoji + áº¢nh má»›i! âœ¨');
    return;
  }

  BP.running = true;
  BP.streamIdx = 0;

  const btn = document.getElementById('btn-bp-blend');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-square"></i> Dá»«ng Blend +';

  const finalGridWrap = document.getElementById('final-grid-wrap');
  if (finalGridWrap) finalGridWrap.classList.remove('show');

  const emojiHeaderBar = document.getElementById('emoji-header-bar');
  if (emojiHeaderBar) emojiHeaderBar.classList.remove('hidden');

  buildPhaseBar(validStreams.length);

  // Desktop recording mode or mobile theater
  if (window.innerWidth < 1024) {
    openMobileTheater();
    startBpStreamSequence(validStreams, 0);
  } else {
    enterRecordingMode();
    setTimeout(() => {
      if (BP.running) startBpStreamSequence(validStreams, 0);
    }, 1200);
  }
}

function startBpStreamSequence(validStreams, sIdx) {
  if (!BP.running) return;
  if (sIdx >= validStreams.length) {
    finishBlendPlus();
    return;
  }

  const stream = validStreams[sIdx];
  BP.streamIdx = sIdx;

  // Highlight active row in UI
  document.querySelectorAll('.bp-stream-row').forEach((row, i) => {
    row.classList.remove('active-blend', 'done-blend');
    if (BP.streams[i] === stream) {
      row.classList.add('active-blend');
    } else if (BP.streams[i] && validStreams.indexOf(BP.streams[i]) >= 0 && validStreams.indexOf(BP.streams[i]) < sIdx) {
      row.classList.add('done-blend');
    }
  });

  setPhase(sIdx, validStreams.length);
  updateEmojiHeaderState(sIdx);

  syncCanvasSize();
  resultWrap.classList.remove('show', 'reveal-eraser', 'reveal-classic');
  canvas.classList.remove('visible');
  canvas.style.opacity = '';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const resBadge = document.getElementById('result-badge');
  if (resBadge) resBadge.classList.remove('show');

  // Set theater layers for this stream
  bgCharImg.src = stream.charImg.src;
  bgCharWrap.classList.add('show');

  flyImg1.src = stream.charImg.src;
  flyImg2.src = stream.emojiImg.src;

  setFlyStyle(fly1, { top: '-60%', left: '50%', transform: 'translateX(-50%)', opacity: '0', bottom: 'auto', right: 'auto' });
  setFlyStyle(fly2, { bottom: '-60%', left: '50%', transform: 'translateX(-50%)', opacity: '0', top: 'auto', right: 'auto' });

  // Store runtime refs
  S._currentCharImg = stream.charImg;
  S._currentEmojiImg = stream.emojiImg;
  S._currentResultImg = stream.resultImg;
  S._currentStepStyle = 'fusion';

  // áº¢nh Ä‘áº§u tiÃªn (nhÃ¢n váº­t) xuáº¥t hiá»‡n, Ä‘á»£i khoáº£ng 2s (tÃ¹y chá»‰nh) thÃ¬ má»›i tá»›i lÆ°á»£t emoji bay vÃ o
  const charWaitSec = parseFloat(document.getElementById('bp-char-wait-sec')?.value || '2.0');
  const charWaitMs = Math.max(300, charWaitSec * 1000);

  BP.timer = setTimeout(() => {
    if (!BP.running) return;
    phaseBpFlyEmoji(validStreams, sIdx);
  }, charWaitMs);
}

function phaseBpFlyEmoji(validStreams, sIdx) {
  if (!BP.running) return;
  fly2.style.opacity = '1';
  playSfxSwoosh(true);

  const directions = ['bottom', 'top', 'left', 'right'];
  currentDir = directions[Math.floor(Math.random() * directions.length)];

  setFlyStyle(fly2, { top: 'auto', bottom: 'auto', left: 'auto', right: 'auto', transform: 'none' });

  if (currentDir === 'bottom') {
    setFlyStyle(fly2, { left: '50%', transform: 'translateX(-50%)', bottom: '-60%' });
    animateDir(fly2, 'bottom', -60, 38, 750, () => setTimeout(() => phaseBpCollision(validStreams, sIdx), 150));
  } else if (currentDir === 'top') {
    setFlyStyle(fly2, { left: '50%', transform: 'translateX(-50%)', top: '-60%' });
    animateDir(fly2, 'top', -60, 38, 750, () => setTimeout(() => phaseBpCollision(validStreams, sIdx), 150));
  } else if (currentDir === 'left') {
    setFlyStyle(fly2, { top: '50%', transform: 'translateY(-50%)', left: '-60%' });
    animateDir(fly2, 'left', -60, 22.5, 750, () => setTimeout(() => phaseBpCollision(validStreams, sIdx), 150));
  } else if (currentDir === 'right') {
    setFlyStyle(fly2, { top: '50%', transform: 'translateY(-50%)', right: '-60%' });
    animateDir(fly2, 'right', -60, 22.5, 750, () => setTimeout(() => phaseBpCollision(validStreams, sIdx), 150));
  }
}

function phaseBpCollision(validStreams, sIdx) {
  if (!BP.running) return;

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

  syncCanvasSize();
  renderFrame(0);

  bgCharWrap.classList.remove('show');
  canvas.classList.add('visible');

  // Dynamic fusion absorb spin
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

  startBpSwirlLoop(() => {
    phaseBpShowResult(validStreams, sIdx);
  });
}

function startBpSwirlLoop(onDone) {
  S.time = 0;
  let elapsed = 0;
  const totalMs = 1600; // Fast smooth fusion vortex
  const speed = parseFloat(document.getElementById('sl-bp-speed')?.value || '7');
  const swirlVal = parseFloat(document.getElementById('sl-bp-swirl')?.value || '100') / 100;

  function loop() {
    if (!BP.running) return;
    const progress = Math.min(1, elapsed / totalMs);
    renderBpFrame(progress, swirlVal);
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

function renderBpFrame(progress, swirl) {
  const W = canvas.width, H = canvas.height;
  const offA = drawToOff(S._currentCharImg, W, H);
  const offB = drawToOff(S._currentResultImg, W, H);
  const pxA = offA.getImageData(0, 0, W, H).data;
  const pxB = offB.getImageData(0, 0, W, H).data;
  const out = ctx.createImageData(W, H);

  // Blend char -> result with Fusion effect
  fxFusion(pxA, pxB, out.data, W, H, S.time, progress, swirl);
  ctx.putImageData(out, 0, 0);
}

function phaseBpShowResult(validStreams, sIdx) {
  if (!BP.running) return;

  fly1.style.opacity = '0';
  fly2.style.opacity = '0';

  // Hiá»‡u á»©ng blend sá»­ dá»¥ng Fusion, khÃ´ng dÃ¹ng hiá»‡u á»©ng xuáº¥t hiá»‡n káº¿t quáº£ (none)
  resultWrap.classList.remove('reveal-eraser', 'reveal-classic');
  resultImg.src = S._currentResultImg.src;
  resultWrap.classList.add('show');

  canvas.classList.remove('visible');
  canvas.style.transition = '';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.opacity = '';

  playSfxReveal();

  const pauseSec = parseFloat(document.getElementById('bp-pause-sec')?.value || '2.5');
  const pauseMs = Math.max(500, pauseSec * 1000);

  // Giá»¯ káº¿t quáº£ trÃªn mÃ n hÃ¬nh theo thá»i gian cÃ i Ä‘áº·t (~2.5s) rá»“i chuyá»ƒn sang luá»“ng tiáº¿p theo
  BP.timer = setTimeout(() => {
    if (!BP.running) return;
    startBpStreamSequence(validStreams, sIdx + 1);
  }, pauseMs);
}

function finishBlendPlus() {
  BP.running = false;
  const btn = document.getElementById('btn-bp-blend');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Báº¯t Ä‘áº§u Blend +';

  document.querySelectorAll('.bp-stream-row').forEach(row => {
    row.classList.remove('active-blend');
    row.classList.add('done-blend');
  });

  setPhase(BP.streams.length, BP.streams.length);
  updateEmojiHeaderState(-1);
}
