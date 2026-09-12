/* Small, dependency-free interactions. The page remains readable without JavaScript. */
document.documentElement.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav-links');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.nav')) closeMenu();
});
window.matchMedia('(min-width: 601px)').addEventListener('change', closeMenu);

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .09 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

document.querySelectorAll('.waveform').forEach(wave => {
  [9,18,12,24,16,21,11,25,15,20,10,17].forEach((height, index) => {
    const bar = document.createElement('i');
    bar.style.setProperty('--h', height + 'px');
    bar.style.setProperty('--delay', -(index * .17) + 's');
    wave.appendChild(bar);
  });
});

const motionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('in-view',entry.isIntersecting)),{threshold:.15});document.querySelectorAll('.motion-zone').forEach(e=>motionObserver.observe(e));
const quoteTrack = document.querySelector('.quote-track');
const quotes = [...document.querySelectorAll('.quote-card')];
const quoteViewport = document.querySelector('.quote-viewport');
let quoteIndex = 0;
function showQuote(index) {
  quoteIndex = (index + quotes.length) % quotes.length;
  const active = quotes[quoteIndex];
  const offset = quoteViewport.clientWidth / 2 - active.offsetLeft - active.offsetWidth / 2;
  quoteTrack.style.transform = `translateX(${offset}px)`;
  quotes.forEach((quote, i) => {
    quote.classList.toggle('is-active', quoteIndex === i);
    quote.setAttribute('aria-hidden', String(quoteIndex !== i));
  });
  document.querySelector('.quote-count').textContent = `0${quoteIndex + 1} / 0${quotes.length}`;
}
document.querySelector('.quote-prev').addEventListener('click', () => showQuote(quoteIndex - 1));
document.querySelector('.quote-next').addEventListener('click', () => showQuote(quoteIndex + 1));
let pointerStart = null;
quoteViewport.addEventListener('pointerdown', event => { if (event.isPrimary) pointerStart = {x:event.clientX,y:event.clientY}; });
quoteViewport.addEventListener('pointerup', event => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) showQuote(quoteIndex + (dx < 0 ? 1 : -1));
  pointerStart = null;
});
quoteViewport.addEventListener('pointercancel', () => { pointerStart = null; });
new ResizeObserver(() => showQuote(quoteIndex)).observe(quoteViewport);
document.fonts.ready.then(() => showQuote(quoteIndex));
showQuote(0);

const galleryMotion = document.querySelector('.gallery-motion');
galleryMotion.addEventListener('click', () => {
  const isPaused = galleryMotion.getAttribute('aria-pressed') !== 'true';
  galleryMotion.setAttribute('aria-pressed', String(isPaused));
  galleryMotion.textContent = isPaused ? 'Play animation' : 'Pause animation';
  galleryMotion.closest('.final-cta').classList.toggle('gallery-paused', isPaused);
});
