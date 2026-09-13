'use strict';
document.documentElement.classList.add('js');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),motionButton=document.querySelector('.motion-toggle');let paused=reduced.matches;
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav-links');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');}});
const reveals=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');reveals.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(e=>reveals.observe(e));
function syncVideo(){}
// Timelines stop entirely offscreen; return a delay when the image is static.
const timelines=[];const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
class Timeline{
 constructor(element,duration,render,still){Object.assign(this,{element,duration,render,still,time:0,last:0,frame:0,timer:0,visible:false});timelines.push(this);this.observer=new IntersectionObserver(e=>{const entry=e[e.length-1],available=innerHeight-document.querySelector('.site-header').offsetHeight;this.visible=entry.isIntersecting&&(element.matches('.process-scene,.course-studio')?(entry.intersectionRatio>=.6||entry.intersectionRect.height>=Math.min(available,entry.boundingClientRect.height)*.7):entry.intersectionRatio>=.2);this.sync();},{threshold:Array.from({length:21},(_,i)=>i/20)});this.observer.observe(element);render(paused?still:0);}
 sync(){this.element.classList.toggle('is-paused',paused||!this.visible||document.hidden);if(paused||!this.visible||document.hidden){if(this.timer&&this.waitStarted){this.time+=Math.min(this.waitDelay,performance.now()-this.waitStarted);this.waitStarted=0;}cancelAnimationFrame(this.frame);clearTimeout(this.timer);this.frame=this.timer=0;this.last=0;if(paused)this.render(this.still);return;}if(!this.frame&&!this.timer){this.last=0;this.frame=requestAnimationFrame(t=>this.tick(t));}}
 tick(now){this.frame=0;if(!this.visible||paused||document.hidden)return;if(this.last)this.time+=Math.min(now-this.last,100);this.last=now;if(this.time>=this.duration){this.time%=this.duration;this.element.dataset.loops=String(Number(this.element.dataset.loops||0)+1);}const idle=this.render(this.time);if(idle>100){this.last=0;this.waitStarted=performance.now();this.waitDelay=idle;this.timer=setTimeout(()=>{this.timer=0;this.waitStarted=0;this.time+=idle;this.sync();},idle);}else this.frame=requestAnimationFrame(t=>this.tick(t));}
}
const studio=document.querySelector('.course-studio'),studioHeading=studio.querySelector('.studio-heading'),studioTrack=studio.querySelector('.studio-course-track');let studioScroll=0,practiceScroll=0,practicePromptScroll=0,studioPrevious='' ;
function measureStudio(){studioScroll=Math.max(0,studioTrack.querySelector('h5').offsetTop-12);const body=studio.querySelector('.practice-body'),track=studio.querySelector('.practice-body-track');practiceScroll=Math.max(0,track.scrollHeight-body.clientHeight);if(!studio.classList.contains("practice-explained"))practicePromptScroll=practiceScroll;}
const vectorLayouts=new WeakMap();
// Follow short spoken phrases, as in the app, while preserving the transcript text.
document.querySelectorAll('.vector-words .transcript-sentence').forEach(sentence=>{
 const words=sentence.textContent.match(/\S+\s*/g)||[];if(words.length<=12)return;
 const count=Math.ceil(words.length/12),size=Math.ceil(words.length/count),fragment=document.createDocumentFragment();
 for(let i=0;i<words.length;i+=size){const phrase=document.createElement('span');phrase.className='transcript-sentence';phrase.textContent=words.slice(i,i+size).join('');fragment.append(phrase);}sentence.replaceWith(fragment);
});
function measureVector(player){
 const track=player.querySelector('.vector-words'),clip=player.querySelector('.vector-transcript');
 let end=0;const sentences=[...track.querySelectorAll('.transcript-sentence')].map(el=>{const start=end;end+=el.textContent.trim().split(/\s+/).length/2.4*1000;return{el,start,end,top:el.offsetTop}});
 const layout={track,sentences,readingBand:parseFloat(getComputedStyle(track).paddingTop)||36,index:vectorLayouts.get(player)?.index??-1,max:Math.max(0,track.scrollHeight-clip.clientHeight),elapsed:player.querySelector('.elapsed'),progress:player.querySelector('.vector-progress i')};vectorLayouts.set(player,layout);return layout;
}
function paintVector(player,t,intro=false){
 const layout=vectorLayouts.get(player)||measureVector(player),{sentences,track}=layout;
 const found=sentences.findIndex(s=>s.end>t),index=found<0?sentences.length-1:found,current=sentences[index];
 if(layout.index!==index){if(sentences[layout.index])sentences[layout.index].el.classList.remove('spoken');current.el.classList.add('spoken');layout.index=index;}
 // Derive every transition from the previous settled phrase position. There is
 // no competing manual scroll offset that can snap backwards at a boundary.
 const target=Math.min(layout.max,Math.max(0,current.top-layout.readingBand));
 const previous=index?Math.min(layout.max,Math.max(0,sentences[index-1].top-layout.readingBand)):0;
 const duration=Math.min(current.end-current.start,Math.max(500,Math.min(900,Math.abs(target-previous)*5.5)));
 const scroll=previous+(target-previous)*ease((t-current.start)/duration);
 track.style.transform=`translate3d(0,${-scroll}px,0)`;player.style.setProperty("--transcript-top-fade",Math.min(12,scroll)+"px");
 const seconds=Math.floor(t/1000);layout.elapsed.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');layout.progress.style.transform=`scaleX(${Math.min(1,t/(Number(player.dataset.durationSeconds||720)*1000))})`;
}
document.querySelectorAll('.vector-player').forEach(player=>{new ResizeObserver(()=>{measureVector(player)}).observe(player);document.fonts.ready.then(()=>measureVector(player));});

function renderStudio(t){
 const loopTime=t,reset=loopTime>=39500?ease((loopTime-39500)/650):1-ease(loopTime/650),restarting=loopTime>=40150||loopTime<700;
 studio.classList.toggle('studio-restarting',restarting);if(loopTime>=40150)t=0;
 const phase=t<5200?'compose':t<9900?'building':t<13400?'review':t<18000?'curriculum':t<28000?'listening':'practice';
 studio.style.setProperty('--studio-reset',reset);studio.dataset.phase=phase;
 const titles={compose:'What would you like to learn?',building:'Researching your topic.',review:'Your course is ready.',curriculum:'Your course is ready.',listening:'Listen and follow along.',practice:'Put it into practice.'};
 const buildIndex=Math.min(2,Math.max(0,Math.floor((t-5200)/1550)));
 if(phase==='building'){titles.building=['Researching your topic.','Structuring your lessons.','Planning your practice.'][buildIndex];studio.querySelector('.research-status').textContent=['Researching clear communication','Planning 15 lessons, from preparation to delivery','Planning 7 practice checkpoints'][buildIndex];}
 const text='I want to communicate clearly in meetings and everyday conversations at work.';
 studio.querySelector('.studio-typed').textContent=text.slice(0,Math.max(0,Math.floor((t-900)/(2400/text.length))));
 studio.style.setProperty('--research',clamp((t-5200)/4300));studio.classList.toggle('studio-pressed',t>=4800&&t<5200);
 if(studioPrevious!==titles[phase]){studioHeading.textContent=titles[phase];studioPrevious=titles[phase];}
 const scrolling=phase==='curriculum'?ease((t-14400)/2050):phase==='listening'||phase==='practice'?1:0;
 studioTrack.style.transform=`translate3d(0,${-studioScroll*scrolling}px,0)`;studio.querySelector('.opening-lesson').classList.toggle('studio-tapped',t>17200&&t<18000);
 paintVector(studio.querySelector('.vector-player'),Math.max(0,t-18600));
 const selected=t>=31800,checking=t>=33800&&t<34700,explained=t>=34700;
 studio.classList.toggle('practice-selected',selected);studio.classList.toggle('practice-check-pressed',t>=33400&&t<33800);studio.classList.toggle('practice-checking',checking);studio.classList.toggle('practice-explained',explained);
 studio.querySelector('.practice-check-label').textContent=checking?'Checking…':'Check answer';
 const answerState=explained?'verified':checking?'checking':selected?'selected':'unselected';if(studio.dataset.answerState!==answerState){studio.dataset.answerState=answerState;measureStudio();}
 studio.querySelector('.practice-body-track').style.transform=`translate3d(0,${-(practicePromptScroll*ease((t-30300)/1300)+(practiceScroll-practicePromptScroll)*ease((t-35100)/1200))}px,0)`;
 return 0;
}
measureStudio();new ResizeObserver(measureStudio).observe(studio);document.fonts.ready.then(measureStudio);const studioTimeline=new Timeline(studio,40400,renderStudio,24100);

// One cached-geometry scroll pass for the connected Discovery and final gallery.
const stops=[...document.querySelectorAll('.discovery-stop')],rail=document.querySelector('.discovery-stops'),map=document.querySelector('.discovery-map'),gallery=document.querySelector('.course-abundance'),rows=[gallery.querySelector('.row-0'),gallery.querySelector('.row-1')];let geometry,measure=true,scrollFrame=0,lastPath='',lastMap='',lastCurrent=-1;
function paintScroll(){scrollFrame=0;if(document.hidden)return;if(measure){const y=scrollY,m=map.getBoundingClientRect(),g=gallery.getBoundingClientRect();geometry={centers:stops.map(s=>{const r=s.getBoundingClientRect();return r.top+y+r.height/2;}),map:m.top+y,gallery:g.top+y,galleryHeight:g.height};measure=false;}const headerHeight=document.querySelector(".site-header").offsetHeight,anchor=scrollY+headerHeight+(innerHeight-headerHeight)*.5,c=geometry.centers,p=paused?1:clamp((anchor-c[0])/(c.at(-1)-c[0])),current=paused?5:Math.max(0,c.filter(x=>x<=anchor).length-1),mp=paused?1:clamp((anchor-geometry.map+80)/300);if(p.toFixed(4)!==lastPath){rail.style.setProperty('--path-progress',p);lastPath=p.toFixed(4);}if(current!==lastCurrent){stops.forEach((s,i)=>{s.classList.toggle('is-reached',i<=current);s.classList.toggle('is-current',i===current);});lastCurrent=current;}if(mp.toFixed(4)!==lastMap){map.style.setProperty('--map-progress',mp);lastMap=mp.toFixed(4);}if(!paused&&scrollY+innerHeight>geometry.gallery&&scrollY<geometry.gallery+geometry.galleryHeight){const offset=Math.max(-40,Math.min(40,(scrollY+innerHeight/2-geometry.gallery)*.04));rows[0].style.translate=offset+'px 0';rows[1].style.translate=-offset+'px 0';}}
function queueScroll(){if(!scrollFrame&&!document.hidden)scrollFrame=requestAnimationFrame(paintScroll);}function refreshLayout(){measure=true;measureStudio();queueScroll();positionReview();}window.addEventListener('scroll',queueScroll,{passive:true});window.addEventListener('resize',refreshLayout,{passive:true});document.fonts.ready.then(refreshLayout);queueScroll();
const reviewPanels=[...document.querySelectorAll('.review-panel')],reviewTrack=document.querySelector('.review-track'),reviewCount=document.querySelector('.review-count');let reviewIndex=Math.floor(reviewPanels.length/2),reviewVisible=false,reviewTimer=0;
function positionReview(){reviewTrack.style.setProperty('--review-index',reviewIndex);reviewPanels.forEach((p,i)=>{p.classList.toggle('is-current',i===reviewIndex);p.setAttribute('aria-hidden',String(i!==reviewIndex));});reviewCount.textContent=(reviewIndex+1)+' of '+reviewPanels.length;}
function scheduleReview(){clearTimeout(reviewTimer);if(reviewVisible&&!paused&&!document.hidden)reviewTimer=setTimeout(()=>{reviewTrack.classList.add('has-moved');reviewIndex=(reviewIndex+1)%reviewPanels.length;positionReview();scheduleReview();},11000);}
function changeReview(delta){reviewTrack.classList.add('has-moved');reviewIndex=(reviewIndex+delta+reviewPanels.length)%reviewPanels.length;positionReview();scheduleReview();}document.querySelector('.review-prev').addEventListener('click',()=>changeReview(-1));document.querySelector('.review-next').addEventListener('click',()=>changeReview(1));new IntersectionObserver(e=>{reviewVisible=e[0].isIntersecting;scheduleReview();},{threshold:.25}).observe(document.querySelector('.review-section'));positionReview();
function syncMotion(){document.body.classList.toggle('is-motion-paused',paused);motionButton.textContent=paused?'Resume motion':'Pause motion';motionButton.setAttribute('aria-pressed',String(paused));timelines.forEach(t=>t.sync());syncVideo();scheduleReview();queueScroll();}
motionButton.addEventListener('click',()=>{paused=!paused;syncMotion();});reduced.addEventListener('change',()=>{paused=reduced.matches;syncMotion();});document.addEventListener('visibilitychange',syncMotion);syncMotion();

const firstLook=document.querySelector('.first-look');new IntersectionObserver(e=>firstLook.classList.toggle('in-view',e[0].isIntersecting),{threshold:.15}).observe(firstLook);

// Short, once-per-visit assembly makes the actual outputs legible, without constant movement.
const assemblyObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('factors-ready');assemblyObserver.unobserve(e.target);}}),{threshold:.3});
const factorContainer=document.querySelector('.assembled-map');factorContainer.querySelectorAll('.map-pillars p').forEach((e,i)=>e.style.setProperty('--assemble-delay',(650+i*160)+'ms'));assemblyObserver.observe(factorContainer);
const traitObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('trait-ready');traitObserver.unobserve(e.target);}}),{threshold:1});document.querySelectorAll('.moving-trait').forEach(e=>traitObserver.observe(e));



// A single skill surface expands into the course at measured layout coordinates.
const processOpening=document.querySelector('.process-opening'),processScene=processOpening.querySelector('.process-scene'),openingCourseScroll=processOpening.querySelector('.opening-course-scroll');let openingCourseDistance=0,openingCourseEnd=0;

// Read the destination's resolved layout only when geometry changes. The moving
// surface must share every font and box dimension with the card it hands off to.
function syncHypothesisLayout(target,preview){
 // The destination is the sole content source. Editing its copy or artwork
 // cannot leave an obsolete description in the moving surface.
 if(preview.dataset.sourceMarkup!==target.innerHTML){preview.replaceChildren(...[...target.childNodes].map(n=>n.cloneNode(true)));preview.dataset.sourceMarkup=target.innerHTML;}
 const properties=['box-sizing','display','flex-direction','align-items','justify-content','flex-grow','flex-shrink','flex-basis','gap','width','height','min-width','min-height','max-width','max-height','padding','margin','font-family','font-size','font-weight','font-style','line-height','letter-spacing','color','text-align','border-width','border-style','border-color','border-radius','background-color','box-shadow'];
 const source=[target,...target.querySelectorAll('*')],copies=[preview,...preview.querySelectorAll('*')];
 source.forEach((element,i)=>{if(element instanceof SVGElement&&element.tagName.toLowerCase()!=='svg')return;const style=getComputedStyle(element);for(const property of properties)copies[i].style.setProperty(property,style.getPropertyValue(property));});
}

function measureProcess(){const m=processOpening.querySelector('.process-map'),c=processOpening.querySelector('.process-destination'),a=processOpening.querySelector('.map-skill-anchor'),v=processOpening.querySelector('.opening-course-viewport'),canvas=processOpening.querySelector('.process-canvas'),heading=processOpening.querySelector('.opening-curriculum-heading'),mobile=innerWidth<=700;
if(mobile){const stageHeight=Math.ceil(Math.max(m.offsetHeight+40,c.offsetHeight+48));processOpening.style.setProperty('--mobile-scene-height',stageHeight+'px');}
const fromX=canvas.clientWidth/2+(mobile?4:30)-m.offsetWidth/2+a.offsetLeft,toX=canvas.clientWidth/2+(parseFloat(getComputedStyle(c).getPropertyValue('--course-shift'))||(mobile?5:235))-c.offsetWidth/2;
for(const[k,n]of Object.entries({'from-x':fromX,'from-y':m.offsetTop+a.offsetTop,'from-w':a.offsetWidth,'from-h':a.offsetHeight,'to-x':toX,'to-y':c.offsetTop,'to-w':c.offsetWidth,'to-h':c.offsetHeight}))processOpening.style.setProperty('--m-'+k,n+'px');
const thought=processOpening.querySelector('.memory-thought'),outline=thought.querySelector('.memory-underline'),wq=thought.offsetWidth+18,hq=thought.offsetHeight+18,dq=`M12 ${hq-7} Q${wq/2} ${hq+1} ${wq-12} ${hq-7} Q${wq+1} ${hq-10} ${wq-6} 13 Q${wq-8} 3 ${wq-19} 6 Q${wq/2} 1 15 6 Q4 7 6 19 L7 ${hq-14}`;outline.setAttribute('viewBox',`0 0 ${wq} ${hq}`);outline.querySelector('path').setAttribute('d',dq);thought.style.setProperty('--memory-outline-path',`path("${dq}")`);
const saved=['--p-map','--p-learn','--p-open'].map(k=>[k,processOpening.style.getPropertyValue(k)]);processOpening.style.setProperty('--p-open',1);processOpening.style.setProperty('--p-map',0);processOpening.style.setProperty('--p-learn',0);const cr=canvas.getBoundingClientRect(),scale=cr.width/parseFloat(getComputedStyle(canvas).width),qr=thought.getBoundingClientRect();const from={x:(qr.left-cr.left)/scale-6,y:(qr.top-cr.top)/scale-6,w:qr.width/scale+12,h:qr.height/scale+12};processOpening.style.setProperty('--p-map',1);const hypothesis=m.querySelector('.hypothesis-core');syncHypothesisLayout(hypothesis,processOpening.querySelector('.transfer-hypothesis'));const tr=hypothesis.getBoundingClientRect();const target={x:(tr.left-cr.left)/scale,y:(tr.top-cr.top)/scale,w:tr.width/scale,h:tr.height/scale};for(const[k,n]of Object.entries({fx:from.x,fy:from.y,fw:from.w,fh:from.h,tx:target.x,ty:target.y,tw:target.w,th:target.h}))processOpening.style.setProperty('--n-'+k,n+'px');processOpening.style.setProperty('--n-ratio',from.w/target.w);saved.forEach(([k,val])=>processOpening.style.setProperty(k,val));
const cover=openingCourseScroll.querySelector('.opening-course-cover'),pad=parseFloat(getComputedStyle(openingCourseScroll).paddingLeft);processOpening.style.setProperty('--m-cover-w',cover.offsetWidth+'px');processOpening.style.setProperty('--m-cover-h',cover.offsetHeight+'px');processOpening.style.setProperty('--m-pad',pad+'px');const coverRect=cover.getBoundingClientRect(),scrollRect=openingCourseScroll.getBoundingClientRect(),coverScale=coverRect.width/cover.offsetWidth;processOpening.style.setProperty('--m-cover-x',(coverRect.left-scrollRect.left)/coverScale+'px');processOpening.style.setProperty('--m-cover-y',(coverRect.top-scrollRect.top)/coverScale+'px');
openingCourseEnd=Math.max(0,openingCourseScroll.scrollHeight-v.clientHeight);openingCourseDistance=Math.max(0,Math.min(heading.offsetTop-20,openingCourseScroll.scrollHeight-v.clientHeight));
const svg=m.querySelector('.hypothesis-branches'),w=svg.clientWidth,h=svg.clientHeight,panels=m.querySelector('.hypothesis-factors'),left=panels.children[0],right=panels.children[1],x1=left.offsetLeft+left.offsetWidth/2-parseFloat(getComputedStyle(m).paddingLeft),x2=right.offsetLeft+right.offsetWidth/2-parseFloat(getComputedStyle(m).paddingLeft);
svg.querySelector('.branch-stem').setAttribute('d',`M${w/2} 0V10`);svg.querySelector('.branch-pillar').setAttribute('d',`M${w/2} 10C${w/2} 23 ${x1} 15 ${x1} ${h}`);svg.querySelector('.branch-friction').setAttribute('d',`M${w/2} 10C${w/2} 23 ${x2} 15 ${x2} ${h}`);svg.querySelectorAll('path').forEach(p=>p.setAttribute('pathLength','1'));
}
function renderProcessBase(t){const transfer=ease((t-2600)/1750),core=t>=4350?1:0;const map=ease((t-3200)/850),learn=ease((t-8900)/1900),morph=ease((t-8900)/2100),course=ease((t-11000)/500),reset=ease((t-17200)/600);
for(const[k,n]of Object.entries({open:ease(t/700),map,learn,core,transfer,'transfer-visible':ease((t-2600)/160)*(1-core),'transfer-text':ease((transfer-.3)/.5),'transfer-arc':Math.sin(Math.PI*transfer),'memory-leaves':ease((t-2600)/220),ink:ease((t-750)/1500),branch:ease((t-4350)/650),trait:ease((t-5800)/900),reset,skill:ease((t-7100)/600),morph,course,preview:ease((morph-.32)/.4),art:ease((morph-.05)/.9),'skill-face':1-ease((morph-.15)/.38)}))processOpening.style.setProperty('--p-'+k,n);
processOpening.classList.toggle('is-course-ready',t>=11000);processOpening.classList.toggle('has-pillar',t>=4750);processOpening.classList.toggle('has-friction',t>=5100);const scroll=openingCourseDistance*ease((t-11900)/1000);openingCourseScroll.style.transform='translate3d(0,'+(-scroll)+'px,0)';processOpening.style.setProperty('--course-scroll',scroll+'px');processOpening.dataset.phase=t<3300?'memory':t<9700?'map':'learning';if(t>13900&&t<16200)return 16200-t;return 0;
}
function renderProcess(t){t=t<=2600?t:Math.max(2600,t-2400);renderProcessBase(t);const enter=ease((t-13800)/600);processOpening.style.setProperty('--intro-listen',enter);paintVector(processOpening.querySelector('.vector-player'),Math.max(0,t-14400),true);processOpening.querySelector('.opening-lesson').classList.toggle('intro-tapped',t>13300&&t<14000);return t>16200&&t<17000?17000-t:0;}
let processMeasureFrame=0;function scheduleProcessMeasurement(){if(processMeasureFrame)return;processMeasureFrame=requestAnimationFrame(()=>{processMeasureFrame=0;measureProcess();});}const processResizeObserver=new ResizeObserver(scheduleProcessMeasurement);[processScene,processOpening.querySelector(".process-map"),openingCourseScroll].forEach(element=>processResizeObserver.observe(element));measureProcess();document.fonts.ready.then(scheduleProcessMeasurement);new Timeline(processScene,20600,renderProcess,18300);





const sectionLinks=[...nav.querySelectorAll('a[href^="#"]')];let navFrame=0;function markNavigation(){navFrame=0;const y=scrollY+innerHeight*.35;let current=null;for(const a of sectionLinks){const el=document.querySelector(a.getAttribute('href'));if(el&&el.getBoundingClientRect().top+scrollY<=y&&(!current||el.offsetTop>current.top))current={link:a,top:el.offsetTop};}sectionLinks.forEach(a=>{if(current&&a===current.link)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}window.addEventListener('scroll',()=>{if(!navFrame)navFrame=requestAnimationFrame(markNavigation)},{passive:true});markNavigation();
function measureDetailMap(){const svg=document.querySelector('.map-connectors'),cols=[...document.querySelectorAll('.map-pillars>div')],r=svg.getBoundingClientRect();if(!r.width)return;svg.setAttribute('viewBox',`0 0 ${r.width} 54`);svg.setAttribute('preserveAspectRatio','none');cols.forEach((col,i)=>{const b=col.getBoundingClientRect(),x=b.left+b.width/2-r.left;svg.children[i].setAttribute('d',`M${r.width/2} 0V10C${r.width/2} 30 ${x} 20 ${x} 54`);});}new ResizeObserver(measureDetailMap).observe(document.querySelector('.map-pillars'));document.fonts.ready.then(measureDetailMap);measureDetailMap();




// Optional compact presentations preserve all content and support touch and keyboard.
for(const [selector,kind,label] of [['.expert-grid','perspective','Perspectives on finding your work']]){
 const track=document.querySelector(selector),controls=document.querySelector(`[data-carousel="${kind}"]`);
 if(!track||!controls)continue;
 const items=[...track.children],prev=controls.querySelector('[data-prev]'),next=controls.querySelector('[data-next]'),count=controls.querySelector('[data-count]');let frame=0;
 track.tabIndex=0;track.setAttribute('aria-label',label);
 const update=()=>{frame=0;const end=Math.max(0,track.scrollWidth-track.clientWidth),origin=items[0].offsetLeft;let i=items.reduce((best,item,index)=>Math.abs(item.offsetLeft-origin-track.scrollLeft)<Math.abs(items[best].offsetLeft-origin-track.scrollLeft)?index:best,0);if(track.scrollLeft>=end-2&&end>0)i=items.length-1;prev.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft>=end-2;count.textContent=`${i+1} / ${items.length}`;};
 const move=direction=>{const end=Math.max(0,track.scrollWidth-track.clientWidth),step=items[1].offsetLeft-items[0].offsetLeft;track.scrollTo({left:Math.max(0,Math.min(end,track.scrollLeft+step*direction)),behavior:reduced.matches?'auto':'smooth'});};
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
 track.addEventListener('keydown',event=>{if(track.scrollWidth<=track.clientWidth)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
 new ResizeObserver(()=>{if(!frame)frame=requestAnimationFrame(update);}).observe(track);update();
}


// Re-measure document anchors when the opening scene or wrapped copy changes height.
const discoveryLayoutObserver=new ResizeObserver(()=>{measure=true;queueScroll();});
[processScene,document.querySelector('.past-feature'),document.querySelector('.site-header')].forEach(e=>discoveryLayoutObserver.observe(e));
