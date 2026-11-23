(() => {
  'use strict';

  const tc = document.getElementById('tc');
  const TAPE_SECONDS = 197;
  let shown = -1;
  let queued = false;
  let max = 1;
  const measure = () => { max = Math.max(1, document.documentElement.scrollHeight - innerHeight); };
  const tick = () => {
    queued = false;
    const t = Math.round((scrollY / max) * TAPE_SECONDS);
    if (t === shown) return;
    shown = t;
    tc.textContent = `0:${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  };
  if (tc) {
    measure();
    addEventListener('resize', measure);
    addEventListener('load', measure);
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(tick); } }, { passive: true });
    tick();
  }

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('cut');
        io.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('main > .fr').forEach((el) => io.observe(el));
  }

  document.querySelectorAll('.trk[data-spotify]').forEach((el) => {
    el.querySelector('a').addEventListener('click', (ev) => {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button) return;
      ev.preventDefault();
      const player = document.createElement('iframe');
      player.src = `https://open.spotify.com/embed/track/${el.dataset.spotify}?theme=0`;
      player.title = `spotify player: ${el.dataset.title}`;
      player.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      el.replaceChildren(player);
    });
  });

  document.querySelectorAll('[data-embargo]').forEach((el) => {
    const [y, m, d] = el.dataset.embargo.split('-').map(Number);
    if (Date.now() < Date.UTC(y, m - 1, d + 1)) return;
    el.classList.add('is-lifted');
    const text = el.querySelector('[data-embargo-text]');
    if (text) text.textContent = ` embargo was due to end ${el.dataset.embargo}. check the repo.`;
    const art = el.querySelector('svg[role="img"]');
    if (art) art.setAttribute('aria-label', 'zephyr kite logo, tape off');
  });
})();
