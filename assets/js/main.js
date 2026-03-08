/**
 * PHÚC NHÃ KHANG — Main JavaScript
 * Pure vanilla JS for interactivity & scroll animations
 */

// ── Sticky header scroll class ───────────────────────────────
(function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 20);
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
})();

// ── Mobile hamburger menu ────────────────────────────────────
(function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMobile = document.querySelector('.nav-mobile');
  if (!hamburger || !navMobile) return;
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navMobile.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });
  // Close when a link is clicked
  navMobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMobile.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ── Highlight active nav link ────────────────────────────────
(function highlightNav() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href') || '';
    // Normalize: strip trailing slash and .html
    const normalHref = href.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const normalPath = path.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (normalHref === normalPath) a.classList.add('active');
  });
})();

// ── Scroll-based fade-up animation ──────────────────────────
(function initFadeUp() {
  const selector = '.fade-up';
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
            setTimeout(() => el.classList.add('visible'), delay * 1000);
            observer.unobserve(el);
          }
        });
      },
      { rootMargin: '-70px 0px', threshold: 0.01 }
    );
    elements.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    elements.forEach(el => el.classList.add('visible'));
  }
})();

// ── Product filter (san-pham.html) ──────────────────────────
(function initProductFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.product-detail-card');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.cat;
      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.category === cat;
        card.classList.toggle('show', match);
      });
    });
  });
  // Show all initially
  cards.forEach(c => c.classList.add('show'));
})();

// ── Contact form ─────────────────────────────────────────────
(function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form || !success) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    success.classList.add('show');
    form.reset();
    setTimeout(() => success.classList.remove('show'), 5000);
  });
})();

// ── Newsletter form (footer) ─────────────────────────────────
(function initNewsletter() {
  document.querySelectorAll('.footer-newsletter__form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        input.value = '';
        input.placeholder = 'Đã đăng ký thành công!';
        setTimeout(() => { input.placeholder = 'Email của bạn...'; }, 3000);
      }
    });
  });
})();

// ── Floating contact button toggle ──────────────────────────
(function initFloating() {
  const main  = document.querySelector('.floating-btn-main');
  const phone = document.querySelector('.floating-btn-phone');
  if (!main || !phone) return;
  phone.style.display = 'none';
  main.addEventListener('click', () => {
    const visible = phone.style.display !== 'none';
    phone.style.display = visible ? 'none' : 'flex';
  });
})();

// ── Promo Product Slider ─────────────────────────────────────
(function initPromoSlider() {
  const track    = document.getElementById('promoSliderTrack');
  const prevBtn  = document.getElementById('promoSliderPrev');
  const nextBtn  = document.getElementById('promoSliderNext');
  const dotsWrap = document.getElementById('promoSliderDots');
  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  const slides     = Array.from(track.querySelectorAll('.promo-slide'));
  const total      = slides.length;
  const INTERVAL   = 5000; // ms between auto-advances
  let current      = 0;
  let autoTimer    = null;
  let progressTimer = null;
  let progressEl   = null;
  let progressStart = null;
  let isPaused     = false;

  // Create progress bar
  progressEl = document.createElement('div');
  progressEl.className = 'promo-slider__progress';
  progressEl.style.width = '0%';
  track.closest('.promo-slider__wrapper').appendChild(progressEl);

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'promo-slider__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.setAttribute('aria-selected', String(i === 0));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function updateDots() {
    dotsWrap.querySelectorAll('.promo-slider__dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
  }

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
    resetProgress();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Progress bar animation
  function resetProgress() {
    cancelAnimationFrame(progressTimer);
    progressEl.style.transition = 'none';
    progressEl.style.width = '0%';
    if (!isPaused) startProgress();
  }

  function startProgress() {
    progressStart = performance.now();
    function tick(now) {
      const elapsed = now - progressStart;
      const pct = Math.min((elapsed / INTERVAL) * 100, 100);
      progressEl.style.width = pct + '%';
      if (pct < 100) {
        progressTimer = requestAnimationFrame(tick);
      } else {
        next();
      }
    }
    progressTimer = requestAnimationFrame(tick);
  }

  // Auto-play start
  startProgress();

  // Pause on hover / focus
  const wrapper = track.closest('.promo-slider__wrapper');
  wrapper.addEventListener('mouseenter', () => {
    isPaused = true;
    cancelAnimationFrame(progressTimer);
  });
  wrapper.addEventListener('mouseleave', () => {
    isPaused = false;
    progressStart = performance.now() - (parseFloat(progressEl.style.width) / 100 * INTERVAL);
    function tick(now) {
      const elapsed = now - progressStart;
      const pct = Math.min((elapsed / INTERVAL) * 100, 100);
      progressEl.style.width = pct + '%';
      if (pct < 100) { progressTimer = requestAnimationFrame(tick); }
      else { next(); }
    }
    progressTimer = requestAnimationFrame(tick);
  });

  prevBtn.addEventListener('click', () => { goTo(current - 1); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); });

  // Keyboard accessibility
  wrapper.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); }
    if (e.key === 'ArrowRight') { goTo(current + 1); }
  });

  // Touch / swipe support
  let touchStartX = 0;
  wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  wrapper.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  }, { passive: true });
})();
