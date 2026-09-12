/* Only one walkthrough auto-plays at a time. Every film also has explicit controls. */
(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const players=[...document.querySelectorAll('[data-walkthrough]')].map(el=>({el,video:el.querySelector('video'),userPaused:false,manual:false,ended:false,token:0}));
 const dialog=document.querySelector('.film-dialog'),dialogVideo=dialog.querySelector('video');let expanded=null,chosen=null;
 function loaded(p){if(!p.video.getAttribute('src')){p.video.src=p.video.dataset.src;p.video.load()}}
 function controls(p){const playing=!p.video.paused&&!p.video.ended;const title=window.walkthroughData[p.el.dataset.walkthrough][0];const b=p.el.querySelector('.film-control');b.textContent=p.video.ended?'Replay':playing?'Pause':'Play';b.setAttribute('aria-label',`${b.textContent} ${title} walkthrough`);p.el.querySelector('.film-seek').value=p.video.duration?100*p.video.currentTime/p.video.duration:0}
 function start(p){loaded(p);if(p.video.paused)p.video.play().catch(()=>controls(p))}
 function sync(){
  if(document.hidden||dialog.open){players.forEach(p=>p.video.pause());return}
  const available=players.filter(p=>{const r=p.el.querySelector('.walkthrough-screen').getBoundingClientRect();return r.bottom>innerHeight*.2&&r.top<innerHeight*.78});
  const next=available.sort((a,b)=>{const center=p=>{const r=p.el.querySelector('.walkthrough-screen').getBoundingClientRect();return Math.abs((r.top+r.bottom)/2-innerHeight/2)};return center(a)-center(b)})[0];
  chosen=next;players.forEach(p=>{if(p===next&&!p.userPaused&&!p.ended&&(!reduce.matches||p.manual))start(p);else p.video.pause()});
 }
 function bind(p){['play','pause','ended','timeupdate','loadedmetadata'].forEach(evt=>p.video.addEventListener(evt,()=>{if(evt==='ended')p.ended=true;controls(p)}));p.video.addEventListener('error',()=>{p.el.classList.add('film-error');p.el.querySelector('.walkthrough-description').textContent='The walkthrough couldn’t load. You can still explore this feature in LifeTask.'})}
 async function select(p,id,focus=false){
  if(id===p.el.dataset.walkthrough&&!p.el.classList.contains('film-error'))return;const token=++p.token;const old=p.video;old.pause();p.el.dataset.walkthrough=id;p.el.classList.remove('film-error');p.el.setAttribute('aria-busy','true');
  p.el.querySelectorAll('[role="tab"]').forEach(b=>{const on=b.dataset.story===id;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;if(on&&focus)b.focus()});
  p.el.querySelector('[role="tabpanel"]').setAttribute('aria-labelledby','tab-'+id);
  p.el.querySelector('.walkthrough-description').textContent=window.walkthroughData[id][1];
  const next=document.createElement('video');next.muted=true;next.playsInline=true;next.preload='auto';next.poster=`assets/walkthrough-${id}-v3.png`;next.src=`assets/walkthrough-${id}-v3.mp4`;next.setAttribute('aria-label',window.walkthroughData[id][0]+' illustrated walkthrough');next.className='film-enter';p.el.querySelector('.walkthrough-screen').append(next);
  const ready=await new Promise(resolve=>{const timer=setTimeout(()=>resolve(false),12000);const finish=value=>{clearTimeout(timer);resolve(value)};next.addEventListener('loadeddata',()=>finish(true),{once:true});next.addEventListener('error',()=>finish(false),{once:true})});
  if(token!==p.token){next.remove();return}p.el.removeAttribute('aria-busy');
  if(!ready){next.remove();p.el.classList.add('film-error');p.userPaused=true;p.el.querySelector('.walkthrough-description').textContent='This walkthrough couldn’t load. Select this tab to try again, or choose another preview.';return}
  p.video=next;p.userPaused=false;p.manual=false;p.ended=false;bind(p);requestAnimationFrame(()=>{next.classList.remove('film-enter');old.classList.add('film-exit')});setTimeout(()=>old.remove(),450);
  p.el.querySelector('.film-expand').setAttribute('aria-label','Enlarge '+window.walkthroughData[id][0]+' walkthrough');controls(p);sync();
 }
 players.forEach(p=>{
  bind(p);p.el.querySelector('.film-control').addEventListener('click',()=>{if(p.el.hasAttribute('aria-busy'))return;if(p.el.classList.contains('film-error')&&p.el.querySelector('[role="tab"]')){select(p,p.el.dataset.walkthrough);return}if(p.video.paused){players.forEach(other=>{if(other!==p)other.video.pause()});p.userPaused=false;p.manual=true;p.ended=false;if(p.video.ended)p.video.currentTime=0;start(p)}else{p.userPaused=true;p.video.pause()}});
  p.el.querySelector('.film-seek').addEventListener('input',e=>{loaded(p);if(Number.isFinite(p.video.duration))p.video.currentTime=p.video.duration*Number(e.target.value)/100});
  p.el.querySelectorAll('[role="tab"]').forEach((b,i,all)=>{b.addEventListener('click',()=>select(p,b.dataset.story));b.addEventListener('keydown',e=>{let index;if(e.key==='ArrowRight')index=(i+1)%all.length;if(e.key==='ArrowLeft')index=(i+all.length-1)%all.length;if(e.key==='Home')index=0;if(e.key==='End')index=all.length-1;if(index!==undefined){e.preventDefault();select(p,all[index].dataset.story,true)}})});
  p.el.querySelector('.film-expand').addEventListener('click',()=>{loaded(p);expanded={p,wasPlaying:!p.video.paused};players.forEach(o=>o.video.pause());dialogVideo.src=p.video.currentSrc||p.video.src;dialogVideo.poster=p.video.poster;dialogVideo.setAttribute('aria-label',p.video.getAttribute('aria-label'));dialogVideo.addEventListener('loadedmetadata',()=>{dialogVideo.currentTime=p.video.currentTime;if(expanded?.wasPlaying)dialogVideo.play().catch(()=>{})},{once:true});dialog.showModal();document.body.classList.add('film-modal-open')});
 });
 dialog.querySelector('.film-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});dialog.addEventListener('close',()=>{dialogVideo.pause();document.body.classList.remove('film-modal-open');if(expanded){const {p,wasPlaying}=expanded;p.video.currentTime=dialogVideo.currentTime;p.userPaused=!wasPlaying;p.ended=p.video.ended;p.el.querySelector('.film-expand').focus();expanded=null}dialogVideo.removeAttribute('src');dialogVideo.load();sync()});
 let scheduled=false;addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync()})}},{passive:true});addEventListener('resize',sync);document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);sync();
 const hero=document.querySelector('.hero-art'),button=hero.querySelector('.opening-toggle');
 let heroPaused=reduce.matches;function heroState(){hero.classList.toggle('opening-paused',heroPaused||document.hidden);button.textContent=heroPaused?'Play':'Pause';button.setAttribute('aria-label',(heroPaused?'Play':'Pause')+' introduction animation')}
 button.addEventListener('click',()=>{heroPaused=!heroPaused;heroState()});reduce.addEventListener('change',()=>{heroPaused=reduce.matches;heroState()});document.addEventListener('visibilitychange',heroState);new IntersectionObserver(entries=>hero.classList.toggle('opening-offscreen',!entries[0].isIntersecting)).observe(hero);heroState();
})();
