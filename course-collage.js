/* A small scroll-linked drift, with no continuous animation or hidden timer. */
(() => {
  const scene = document.querySelector('.course-collage');
  if (!scene) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let frame = 0;
  function paint() {
    frame = 0;
    const stopped = preference.matches || (typeof paused !== 'undefined' && paused);
    const rect = scene.getBoundingClientRect();
    const progress = stopped ? 0 : Math.max(-1, Math.min(1,
      (innerHeight / 2 - (rect.top + rect.height / 2)) / (innerHeight / 2 + rect.height / 2)));
    scene.style.setProperty('--cc-drift', `${(progress * 22).toFixed(2)}px`);
    scene.style.setProperty('--cc-phone-drift', `${(-progress * 8).toFixed(2)}px`);
  }
  function schedule() {
    if (visible && !frame && !document.hidden) frame = requestAnimationFrame(paint);
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { rootMargin: '40px' }).observe(scene);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  preference.addEventListener('change', paint);
  document.querySelector('.motion-toggle')?.addEventListener('click', paint);
})();
