'use strict';
document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const asset = name => `assets/premium-20260910/${name}`;
const imgSlide = (title, file) => ({title, file});
const filmSlide = (title, file) => ({title, file: `app-${file}.mp4`, poster: `app-${file}.webp`, video: true});
const features = {
  journal: { description: 'Start with a conversation. Keep a little space for your day. Explore the experiences that have shaped you.', slides: [filmSlide('A conversation to begin', 'conversation'), imgSlide('A little space for your day', 'mobile-journal-in-progress.webp'), imgSlide('The experiences that shaped you', 'mobile-discovery-in-progress.webp')] },
  map: { description: 'Connect the threads in your story. Explore a possible direction, then look closer at your personality and the ways you think, decide, and relate.', slides: [imgSlide('Your direction, taking shape', 'mobile-direction.webp'), imgSlide('Get to know your personality', 'mobile-personality.webp'), imgSlide('See your patterns more clearly', 'mobile-traits.webp')] },
  skills: { description: 'Recognize the skills you already bring. See what you’re developing, explore emerging abilities, and add skills you want to work on.', slides: [imgSlide('Build on what you already do well', 'mobile-skill-map.webp'), imgSlide('Give your developing skills a focus', 'mobile-skill-developing.webp'), imgSlide('Make room for new abilities', 'mobile-skill-emerging.webp')] }
};
const courseSlides = [imgSlide('A library that’s your own', 'mobile-learn.webp'), filmSlide('From an idea to a curriculum', 'create'), filmSlide('A closer look at the plan', 'curriculum'), filmSlide('Listen and follow along', 'listening')];
const courseCaptions = ['Your courses, with your progress in one place.', 'Watch the course plan take shape, then review it.', 'Explore the description, lessons, and practice sessions.', 'Follow the transcript as the lesson moves forward.'];
let feature = 'journal', featureIndex = 0, courseIndex = 0;
const videos = new Set();
const visibility = new IntersectionObserver(entries => entries.forEach(({target, isIntersecting}) => {
  target.dataset.visible = String(isIntersecting);
  if (isIntersecting && !reduceMotion.matches && target.dataset.userPaused !== 'true' && !document.hidden && !dialog.open) target.play().catch(() => {});
  else target.pause();
}), {threshold: .45});
function renderScreen(prefix, slide) {
  const holder = document.getElementById(`${prefix}-screen`);
  const old = holder.querySelector('video');
  if (old) { old.pause(); visibility.unobserve(old); videos.delete(old); old.removeAttribute('src'); old.load(); }
  holder.replaceChildren();
  const media = document.createElement(slide.video ? 'video' : 'img');
  media.src = asset(slide.file);
  if (slide.video) {
    media.muted = true; media.playsInline = true; media.loop = false; media.preload = 'metadata'; media.poster = asset(slide.poster);
    media.setAttribute('aria-label', slide.title); media.dataset.userPaused = String(reduceMotion.matches);
    videos.add(media); visibility.observe(media);
    media.addEventListener('play', () => { document.getElementById(`${prefix}-play`).textContent = 'Pause animation'; });
    media.addEventListener('pause', () => { document.getElementById(`${prefix}-play`).textContent = media.ended ? 'Replay animation' : 'Play animation'; });
    media.addEventListener('ended', () => { media.dataset.userPaused = 'true'; document.getElementById(`${prefix}-play`).textContent = 'Replay animation'; });
  } else { media.alt = slide.title; media.width = 1080; media.height = 2096; }
  holder.append(media);
  const play = document.getElementById(`${prefix}-play`); play.hidden = !slide.video; play.textContent = reduceMotion.matches ? 'Play animation' : 'Pause animation';
  document.getElementById(`${prefix}-slide-title`).textContent = slide.title;
}
function renderFeature() {
  const current = features[feature];
  document.querySelectorAll('[data-feature]').forEach(button => { const selected = button.dataset.feature === feature; button.setAttribute('aria-selected', selected); button.tabIndex = selected ? 0 : -1; });
  document.getElementById('feature-panel').setAttribute('aria-labelledby', `tab-${feature}`);
  document.getElementById('feature-description').textContent = current.description;
  const dots = document.getElementById('feature-dots'); dots.replaceChildren();
  current.slides.forEach((slide, index) => { const button = document.createElement('button'); button.setAttribute('aria-label', slide.title + (slide.video ? ' — animated' : '')); button.setAttribute('aria-current', String(index === featureIndex)); button.addEventListener('click', () => { featureIndex = index; renderFeature(); document.querySelectorAll('#feature-dots button')[index].focus({preventScroll:true}); }); dots.append(button); });
  renderScreen('feature', current.slides[featureIndex]);
}
function renderCourse() {
  document.querySelectorAll('[data-course]').forEach(button => { const selected = Number(button.dataset.course) === courseIndex; button.setAttribute('aria-selected', selected); button.tabIndex = selected ? 0 : -1; });
  document.getElementById('course-panel').setAttribute('aria-labelledby', `course-tab-${courseIndex}`);
  document.getElementById('course-caption').textContent = courseCaptions[courseIndex];
  renderScreen('course', courseSlides[courseIndex]);
}
document.querySelectorAll('[data-feature]').forEach(button => button.addEventListener('click', () => { feature = button.dataset.feature; featureIndex = 0; renderFeature(); }));
document.querySelectorAll('[data-go]').forEach(link => link.addEventListener('click', () => { feature = link.dataset.go; featureIndex = 0; renderFeature(); }));
document.querySelectorAll('[data-course]').forEach(button => button.addEventListener('click', () => { courseIndex = Number(button.dataset.course); renderCourse(); }));
document.getElementById('feature-prev').addEventListener('click', () => { featureIndex = (featureIndex + features[feature].slides.length - 1) % features[feature].slides.length; renderFeature(); });
document.getElementById('feature-next').addEventListener('click', () => { featureIndex = (featureIndex + 1) % features[feature].slides.length; renderFeature(); });
document.querySelectorAll('[role=tablist]').forEach(list => list.addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  const tabs = [...list.querySelectorAll('[role=tab]')], current = tabs.indexOf(document.activeElement);
  if (current < 0) return; event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  tabs[next].click(); tabs[next].focus();
}));
for (const prefix of ['feature', 'course']) document.getElementById(`${prefix}-play`).addEventListener('click', () => {
  const video = document.querySelector(`#${prefix}-screen video`); if (!video) return;
  if (video.paused) { video.dataset.userPaused = 'false'; if (video.ended) video.currentTime = 0; video.play().catch(() => {}); }
  else { video.dataset.userPaused = 'true'; video.pause(); }
});
const dialog = document.getElementById('preview-dialog');
let dialogTrigger = null;
function openDialog(title, content) {
  dialogTrigger = document.activeElement;
  videos.forEach(video => video.pause());
  document.getElementById('dialog-title').textContent = title;
  document.getElementById('dialog-body').replaceChildren(content);
  dialog.showModal(); document.body.style.overflow = 'hidden'; document.getElementById('dialog-close').focus();
}
document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { const video = dialog.querySelector('video'); if (video) {video.pause(); video.removeAttribute('src'); video.load();} document.body.style.overflow = ''; if (dialogTrigger?.isConnected) dialogTrigger.focus({preventScroll:true}); });
for (const prefix of ['feature','course']) document.getElementById(`${prefix}-expand`).addEventListener('click', () => {
  const slide = prefix === 'feature' ? features[feature].slides[featureIndex] : courseSlides[courseIndex];
  const media = document.createElement(slide.video ? 'video' : 'img'); media.src = asset(slide.file);
  if (slide.video) { media.controls = true; media.muted = true; media.playsInline = true; media.poster = asset(slide.poster); } else media.alt = slide.title;
  openDialog(slide.title, media); if (slide.video && !reduceMotion.matches) media.play().catch(() => {});
});
const courses = [
  ['Find a better fit','direction','person-environment-fit-theory-knight','Explore how your interests and strengths fit different kinds of work and environments.'],
  ['Make a decision with confidence','direction','decision-theory-applied-decision-making-reference','Understand tradeoffs, uncertainty, and how to make a considered choice.'],
  ['Get better at getting better','skills','expertise-development-deliberate-practice-reference','Learn how deliberate practice and useful feedback can help you develop a skill.'],
  ['Turn an idea into a beginning','change','entrepreneurship-effectuation-reference','Explore how to start with what you have and learn through small experiments.'],
  ['Choose goals you can stick with','change','goal-setting-self-concordant-goals-reference','Understand motivation and build goals you have your own reasons to pursue.'],
  ['Build belief through action','skills','self-efficacy-theory-reference','Explore how experience and achievable challenges can strengthen your confidence.'],
  ['Find your next direction','direction','vocational-psychology-career-development-reference','Explore your interests, working preferences, and possible directions for your career.'],
  ['Move through a life change','change','life-course-transition-psychology-reference','Understand transitions and find practical ways to adapt to a new chapter.'],
  ['Take the first small step','skills','behavioral-activation-self-regulation-reference','Explore the link between action, motivation, and the habits you build.']
];
function renderCatalog(filter = 'all') {
  const grid = document.getElementById('course-grid'); grid.replaceChildren();
  courses.filter(course => filter === 'all' || course[1] === filter).forEach(([title, category, file, description]) => {
    const button = document.createElement('button'); button.className = 'course-card';
    const cover = document.createElement('div'); cover.className = 'course-cover';
    const img = document.createElement('img'); img.src = asset(`onboarding-${file}.webp`); img.alt = ''; img.loading = 'lazy'; img.width = 1024; img.height = 1024;
    const arrow = document.createElement('span'); arrow.className = 'course-link'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true'); cover.append(img, arrow);
    const h = document.createElement('h3'); h.textContent = title;
    const p = document.createElement('p'); p.textContent = `${category === 'direction' ? 'Direction' : category === 'skills' ? 'Skill development' : 'Personal growth'} · Audio course`;
    button.append(cover,h,p);
    button.addEventListener('click', () => { const content = document.createElement('div'); const image = img.cloneNode(); image.className = 'catalog-dialog-cover'; const heading = document.createElement('h3'); heading.textContent = title; const body = document.createElement('p'); body.textContent = description; const note = document.createElement('p'); note.textContent = 'Explore this topic in the LifeTask course catalog.'; const link = document.createElement('a'); link.className = 'button'; link.href = 'https://app.trylifetask.com'; link.textContent = 'Explore in LifeTask ↗'; content.append(image,heading,body,note,link); openDialog('Explore a course topic',content); });
    grid.append(button);
  });
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed',String(item===button))); renderCatalog(button.dataset.filter); }));
const reveals = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); } }), {threshold:.12});
document.querySelectorAll('.reveal').forEach(element => reveals.observe(element));
document.addEventListener('visibilitychange', () => { if (document.hidden) videos.forEach(video => video.pause()); });
reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) videos.forEach(video => {video.dataset.userPaused='true'; video.pause();}); });
renderFeature(); renderCourse(); renderCatalog();
