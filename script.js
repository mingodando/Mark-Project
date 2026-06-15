// ============================================
//  TAB SWITCHING
// ============================================
const tabs = document.querySelectorAll('.gtab');
const slideshows = document.querySelectorAll('.slideshow');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active from all tabs + slideshows
    tabs.forEach(t => t.classList.remove('active'));
    slideshows.forEach(s => s.classList.remove('active'));

    // Activate clicked tab
    tab.classList.add('active');

    // Activate matching slideshow
    const groupId = 'group-' + tab.dataset.group;
    const target = document.getElementById(groupId);
    if (target) target.classList.add('active');

    // Reset that slideshow to slide 0
    resetSlideshow(target);
  });
});

// ============================================
//  SLIDESHOW ENGINE
// ============================================
const AUTOPLAY_MS = 4000; // change this to speed up / slow down

// Store state per slideshow
const state = new Map();

function initSlideshow(show) {
  // Teachers section has no slides, skip
  if (show.classList.contains('teachers-group')) return;

  const track   = show.querySelector('.slides-track');
  const slides  = show.querySelectorAll('.slide');
  const dotsEl  = show.querySelector('.dots');
  const fill    = show.querySelector('.progress-fill');
  const prevBtn = show.querySelector('.prev');
  const nextBtn = show.querySelector('.next');

  if (!slides.length) return;

  // Build dots
  dotsEl.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(show, i));
    dotsEl.appendChild(dot);
  });

  // Arrow listeners
  prevBtn.addEventListener('click', () => goTo(show, getIdx(show) - 1));
  nextBtn.addEventListener('click', () => goTo(show, getIdx(show) + 1));

  // Save state
  state.set(show, { idx: 0, timer: null, raf: null, start: null });

  // Start if this is the active one
  if (show.classList.contains('active')) startAuto(show);
}

function getIdx(show) {
  return state.get(show)?.idx ?? 0;
}

function goTo(show, idx) {
  const slides  = show.querySelectorAll('.slide');
  const dots    = show.querySelectorAll('.dot');
  const track   = show.querySelector('.slides-track');
  const total   = slides.length;

  // Wrap around
  idx = ((idx % total) + total) % total;

  // Move track
  track.style.transform = `translateX(-${idx * 100}%)`;

  // Update dots
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));

  // Save index
  const s = state.get(show);
  if (s) s.idx = idx;

  // Restart auto-play
  stopAuto(show);
  startAuto(show);
}

function startAuto(show) {
  const s = state.get(show);
  if (!s) return;

  stopAuto(show); // clear any existing

  const fill = show.querySelector('.progress-fill');
  fill.style.width = '0%';

  s.start = performance.now();

  function tick(now) {
    const elapsed = now - s.start;
    const pct = Math.min(100, (elapsed / AUTOPLAY_MS) * 100);
    fill.style.width = pct + '%';

    if (elapsed >= AUTOPLAY_MS) {
      goTo(show, getIdx(show) + 1);
    } else {
      s.raf = requestAnimationFrame(tick);
    }
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

// ============================================
//  INIT ALL SLIDESHOWS ON PAGE LOAD
// ============================================
document.querySelectorAll('.slideshow').forEach(initSlideshow);
