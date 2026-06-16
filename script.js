// ============================================
//  TAB SWITCHING
// ============================================
const tabs = document.querySelectorAll('.gtab');
const slideshows = document.querySelectorAll('.slideshow');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    slideshows.forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById('group-' + tab.dataset.group);
    if (target) target.classList.add('active');
    resetSlideshow(target);
  });
});

// ============================================
//  SLIDESHOW ENGINE
// ============================================
const AUTOPLAY_MS = 4000;
const state = new Map();

function initSlideshow(show) {
  if (show.classList.contains('teachers-group')) return;

  const slides  = show.querySelectorAll('.slide');
  const dotsEl  = show.querySelector('.dots');
  const prevBtn = show.querySelector('.prev');
  const nextBtn = show.querySelector('.next');

  if (!slides.length) return;

  const groupName = show.id.replace('group-', '');
  const tabEl = document.querySelector(`.gtab[data-group="${groupName}"]`);
  const tabLabel = tabEl ? tabEl.textContent.trim() : '';

  slides.forEach((slide, i) => {
    const img  = slide.querySelector('img');
    const wrap = slide.querySelector('.photo-wrap');
    if (!img || !wrap) return;

    // Blurred bg
    if (!wrap.querySelector('.photo-bg')) {
      const bg = document.createElement('div');
      bg.className = 'photo-bg';
      const apply = () => { bg.style.backgroundImage = `url('${img.src}')`; };
      if (img.complete && img.naturalWidth > 0) apply();
      else img.addEventListener('load', apply);
      wrap.insertBefore(bg, wrap.firstChild);
    }

    // Badges
    if (!wrap.querySelector('.slide-badge')) {
      const bl = document.createElement('div');
      bl.className = 'slide-badge left';
      bl.textContent = tabLabel;
      wrap.appendChild(bl);

      const br = document.createElement('div');
      br.className = 'slide-badge right';
      br.textContent = `${i + 1} / ${slides.length}`;
      wrap.appendChild(br);
    }
  });

  // Dots
  dotsEl.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(show, i));
    dotsEl.appendChild(dot);
  });

  prevBtn.addEventListener('click', () => goTo(show, getIdx(show) - 1));
  nextBtn.addEventListener('click', () => goTo(show, getIdx(show) + 1));

  state.set(show, { idx: 0, raf: null, start: null });
  if (show.classList.contains('active')) startAuto(show);
}

function getIdx(show) { return state.get(show)?.idx ?? 0; }

function goTo(show, idx) {
  const slides = show.querySelectorAll('.slide');
  const dots   = show.querySelectorAll('.dot');
  const track  = show.querySelector('.slides-track');
  const total  = slides.length;

  idx = ((idx % total) + total) % total;
  track.style.transform = `translateX(-${idx * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));

  const s = state.get(show);
  if (s) s.idx = idx;
  stopAuto(show);
  startAuto(show);
}

function startAuto(show) {
  const s = state.get(show);
  if (!s) return;
  stopAuto(show);
  const fill = show.querySelector('.progress-fill');
  fill.style.width = '0%';
  s.start = performance.now();
  function tick(now) {
    const elapsed = now - s.start;
    fill.style.width = Math.min(100, (elapsed / AUTOPLAY_MS) * 100) + '%';
    if (elapsed >= AUTOPLAY_MS) goTo(show, getIdx(show) + 1);
    else s.raf = requestAnimationFrame(tick);
  }
  s.raf = requestAnimationFrame(tick);
}

function stopAuto(show) {
  const s = state.get(show);
  if (!s) return;
  if (s.raf) cancelAnimationFrame(s.raf);
  s.raf = null;
}

function resetSlideshow(show) {
  if (!show || show.classList.contains('teachers-group')) return;
  const s = state.get(show);
  if (!s) { initSlideshow(show); return; }
  goTo(show, 0);
}

document.querySelectorAll('.slideshow').forEach(initSlideshow);