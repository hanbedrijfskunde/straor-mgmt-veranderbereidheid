/* ===========================================================
   9%-Kloof-Simulatie — Slide-deck navigatie
   Vanilla JS, geen externe dependencies.

   Functies:
   - Keyboard nav: ←/→/Space/PgUp/PgDn/Home/End/F/P/Esc/0-9
   - Click-half: linker-helft = vorige, rechter-helft = volgende
   - URL-hash sync: slides.html#slide-3 opent direct slide 3
   - Slide-teller + progress-bar updates
   - Fullscreen toggle via Fullscreen API
   =========================================================== */

(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  if (!total) return;

  const counter = document.getElementById('slide-counter');
  const progress = document.getElementById('slide-progress');
  const fullscreenBtn = document.getElementById('btn-fullscreen');

  let current = 0;

  /* ----------- Display ----------- */

  function showSlide(index) {
    if (index < 0) index = 0;
    if (index >= total) index = total - 1;
    current = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
    });

    if (counter) {
      counter.textContent = (current + 1) + ' / ' + total;
    }

    if (progress) {
      const pct = ((current + 1) / total) * 100;
      progress.style.width = pct + '%';
    }

    // Sync URL hash without triggering hashchange listener
    const newHash = '#slide-' + (current + 1);
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }
  }

  function next() { showSlide(current + 1); }
  function prev() { showSlide(current - 1); }
  function first() { showSlide(0); }
  function last() { showSlide(total - 1); }

  /* ----------- Hash routing ----------- */

  function slideFromHash() {
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    if (!match) return 0;
    const n = parseInt(match[1], 10);
    if (isNaN(n) || n < 1 || n > total) return 0;
    return n - 1;
  }

  window.addEventListener('hashchange', () => {
    showSlide(slideFromHash());
  });

  /* ----------- Keyboard ----------- */

  function handleKey(e) {
    // Ignore when user is typing in an input
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        next();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prev();
        break;
      case 'Home':
        e.preventDefault();
        first();
        break;
      case 'End':
        e.preventDefault();
        last();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        window.print();
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          // Browser handles exiting fullscreen
          return;
        }
        e.preventDefault();
        window.location.href = 'index.html';
        break;
      default:
        // 1–9 jumps to that slide (10 is keyboard 0)
        if (/^[1-9]$/.test(e.key)) {
          e.preventDefault();
          const idx = parseInt(e.key, 10) - 1;
          if (idx < total) showSlide(idx);
        } else if (e.key === '0') {
          e.preventDefault();
          if (total >= 10) showSlide(9);
        }
        break;
    }
  }

  document.addEventListener('keydown', handleKey);

  /* ----------- Click-half navigation ----------- */

  const deck = document.querySelector('.slide-deck');
  if (deck) {
    deck.addEventListener('click', (e) => {
      // Don't capture clicks on buttons or links inside slides
      const closestInteractive = e.target.closest('a, button, .slide-chrome');
      if (closestInteractive) return;

      const x = e.clientX;
      const half = window.innerWidth / 2;
      if (x < half) prev();
      else next();
    });
  }

  /* ----------- Fullscreen ----------- */

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      const target = document.documentElement;
      if (target.requestFullscreen) {
        target.requestFullscreen().catch(() => {
          /* User-gesture rejection — ignore silently */
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }

  /* ----------- Initial render ----------- */

  showSlide(slideFromHash());
})();
