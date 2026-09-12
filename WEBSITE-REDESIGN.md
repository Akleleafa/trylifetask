# Website scroll redesign — v10, 10 September 2026

Local preview: http://127.0.0.1:4175/?v=10

Changes:
- Recropped the actual Quick Overview recording to include the entire existing phone outline and bottom navigation. Removed the second CSS frame. Source: D:/Lifetask/tmp/cofounder-app-restart/chat-162-raw.mp4, crop 690:1350:194:548, starting at 0.7 seconds.
- Desktop Discovery-to-map scene gathers chapter illustrations into the map with scroll-controlled translation, line drawing, then a separate map reveal. Mobile uses a straightforward unpinned map layout. Reduced motion and the footer pause control show the finished map.
- Personality is visible directly. Standalone traits remain, with optional deeper reading.
- Skills use visible Strong, Developing and Emerging columns with two contextual examples each; cards enter as the board scrolls into view. No accordion needed to understand the board.
- Removed course tabs. Native curriculum SVG animation and real app listening recording appear in consecutive sections. Corrected listening poster to match the transcript video. Loops run only while visible.
- All sample reviews are visible, shortened and still labelled sample copy. No real-person photos paired with fictional testimonials.
- Inspiration section uses licensed portraits of Robert Greene and Bill Gurley, shorter paraphrases, original reading links and visible expandable photo credits. Graham Weaver retained as a compact reading item; no portrait used without established licensing.
- Approved painted hero, journal prompts, chapter artwork, traits, course gallery and main app links retained.

Portrait sources:
- https://commons.wikimedia.org/wiki/File:Robert_Greene_B%26W.jpg — Author Robert Greene, CC BY-SA 2.0. Display crop/grayscale adaptation retains that license.
- https://commons.wikimedia.org/wiki/File:Bill_Gurley,_2013.jpg — TechCrunch / Dan Taylor, CC BY 2.0. Display crop/grayscale.
- No endorsements implied. Portrait credits and license links included in page.

Validation:
- JavaScript syntax checked.
- Local asset reference check: no missing assets; no course tab controls; no replay or enlarge controls; four main app links.
- Browser inspected at default desktop viewport and 390px mobile: chapter assembly, finished map/personality, skills board, inspiration portraits, complete recorded chat phone, course result and automatic loop.
- No horizontal overflow at inspected sizes. Videos reported readyState 4 and no media error. All hash links resolve.
- This is a local preview; no production deployment.

Rebuild staging: D:/Lifetask/tmp/website-rebuild-v10/build.cjs (reads v9 snapshot, scroll.css and scroll.js). Asset references to product-v8 are original app-exported SVGs, not outdated app UI screenshots.

Performance pass (v10-smooth):
- Scroll effects share one passive requestAnimationFrame scheduler. Geometry is cached and refreshed by ResizeObserver, window resize and font readiness. No getBoundingClientRect calls during ordinary scrolling.
- Settled scenes skip repeated DOM writes. Layer promotion limited to the active map scene.
- Curriculum stage classes update only at stage changes; heading text updates only when a character changes; only the active connector updates each frame. Completed curriculum hold sleeps on a cancellable timer rather than running a continuous frame loop.
- Videos have preload=none and deferred sources, prepared near their section and paused when out of view, tab hidden or motion paused. Images decode asynchronously; portraits and gallery lazy-load.
- Full fonts converted losslessly to WOFF2, ~959 KB to ~331 KB (65% smaller); font-display:swap. Portrait assets ~1,305 KB to ~59 KB (95.5% smaller).
- Cached geometry and animation state tests passed in check-motion.cjs, including all four stages, ready hold, loop restart, pause cancellation, no unchanged heading writes, no per-scroll layout measurements, no settled offscreen writes, and mobile map fallback.
- JavaScript syntax and local file reference checks passed.
- Earlier layout inspection covered desktop, 390px and 320px. Final runtime FPS measurement could not be completed: both browser and computer-use tools failed with 'failed to write kernel assets: The system cannot find the path specified. (os error 3)'. Do not claim measured 60fps or physical low-end-device verification.
- Rebuild: node build.cjs then node optimize.cjs; compression assets already generated. Browser cache version: 10-smooth.
