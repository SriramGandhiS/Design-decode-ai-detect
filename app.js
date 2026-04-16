document.addEventListener('DOMContentLoaded', () => {
    // --- BASIC SYSTEM CHECKS ---
    const hasGSAP = typeof gsap !== 'undefined';
    if (!hasGSAP) console.warn("Design Decode: GSAP not found.");

    // --- NAVIGATION & REDIRECT HANDLERS ---
    const hiveScanBtn = document.getElementById('hive-scan-btn');
    const deepScanBtn = document.getElementById('deep-scan-btn');
    const navUploadBtn = document.getElementById('nav-upload-btn');

    const openHive = () => window.open('https://hivemoderation.com/ai-generated-content-detection', '_blank');
    const openAIorNot = () => window.open('https://www.aiornot.com/', '_blank');

    if (hiveScanBtn) hiveScanBtn.addEventListener('click', openHive);
    if (deepScanBtn) deepScanBtn.addEventListener('click', openAIorNot);
    if (navUploadBtn) navUploadBtn.addEventListener('click', openHive);

    // --- GLOBAL STATE ---
    const mouseState = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const oglMouse = (typeof ogl !== 'undefined') ? new ogl.Vec3() : null;

    // --- TARGET CURSOR MODULE ---
    const cursorWrapper = document.getElementById('target-cursor');
    const cursorDot = document.querySelector('.target-cursor-dot');
    const cursorCorners = document.querySelectorAll('.target-cursor-corner');
    const spotlightCanvas = document.getElementById('spotlight-canvas');
    const sCtx = spotlightCanvas ? spotlightCanvas.getContext('2d') : null;

    let targetSelector = '.cursor-target, a, button, input';
    let spinTl = null;
    let activeStrength = { val: 0 };
    let targetCornerPositions = null;
    let activeTarget = null;
    const constants = { borderWidth: 3, cornerSize: 12 };

    function initCursor() {
        if (!cursorWrapper || !hasGSAP) return;
        document.body.style.cursor = 'none';
        gsap.set(cursorWrapper, { xPercent: -50, yPercent: -50, x: mouseState.x, y: mouseState.y });
        spinTl = gsap.to(cursorWrapper, { rotation: '+=360', duration: 2, ease: 'none', repeat: -1 });
        setupSpotlight();
    }

    function setupSpotlight() {
        if (!spotlightCanvas) return;
        const resize = () => {
            spotlightCanvas.width = window.innerWidth;
            spotlightCanvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    function onTick() {
        if (!targetCornerPositions || !cursorWrapper || !hasGSAP) return;
        const strength = activeStrength.val;
        if (strength === 0) return;
        const cursorX = gsap.getProperty(cursorWrapper, 'x');
        const cursorY = gsap.getProperty(cursorWrapper, 'y');
        cursorCorners.forEach((corner, i) => {
            const currentX = gsap.getProperty(corner, 'x');
            const currentY = gsap.getProperty(corner, 'y');
            const targetX = targetCornerPositions[i].x - cursorX;
            const targetY = targetCornerPositions[i].y - cursorY;
            const finalX = currentX + (targetX - currentX) * strength;
            const finalY = currentY + (targetY - currentY) * strength;
            gsap.set(corner, { x: finalX, y: finalY });
        });
    }

    // --- CONSOLIDATED MOUSE HANDLER ---
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        mouseState.x = x;
        mouseState.y = y;

        // 1. Update OGL Mouse
        if (oglMouse) {
            oglMouse.set((x / window.innerWidth) * 2 - 1, (y / window.innerHeight) * -2 + 1, 0);
        }

        // 2. Update Interactive Eyes
        updateEyes(x, y);

        // 3. Move Target Cursor
        if (cursorWrapper && hasGSAP) {
            gsap.to(cursorWrapper, { x, y, duration: 0.1, ease: 'power3.out' });
        }

        // 4. Update Spotlight
        if (sCtx) {
            sCtx.clearRect(0, 0, spotlightCanvas.width, spotlightCanvas.height);
            sCtx.fillStyle = 'rgba(10, 5, 8, 0.96)';
            sCtx.fillRect(0, 0, spotlightCanvas.width, spotlightCanvas.height);
            sCtx.globalCompositeOperation = 'destination-out';
            const gradient = sCtx.createRadialGradient(x, y, 0, x, y, 180);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            sCtx.fillStyle = gradient;
            sCtx.beginPath();
            sCtx.arc(x, y, 180, 0, Math.PI * 2);
            sCtx.fill();
            sCtx.globalCompositeOperation = 'source-over';
        }
    });

    // --- TARGETING LOGIC (HOVER) ---
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest(targetSelector);
        if (!target || activeTarget === target) return;
        activeTarget = target;
        document.body.classList.add('cursor-hover');
        if (spinTl) spinTl.pause();
        if (hasGSAP) gsap.to(cursorWrapper, { rotation: 0, duration: 0.2 });
        const rect = target.getBoundingClientRect();
        const { borderWidth, cornerSize } = constants;
        targetCornerPositions = [
            { x: rect.left - borderWidth, y: rect.top - borderWidth },
            { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
            { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
            { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
        ];
        if (hasGSAP) {
            gsap.ticker.add(onTick);
            gsap.to(activeStrength, { val: 1, duration: 0.2, ease: 'power2.out' });
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest(targetSelector);
        if (!target || target !== activeTarget) return;
        activeTarget = null;
        document.body.classList.remove('cursor-hover');
        if (hasGSAP) {
            gsap.ticker.remove(onTick);
            gsap.set(activeStrength, { val: 0 });
            if (spinTl) spinTl.resume();
            const cornerSize = constants.cornerSize;
            const positions = [
                { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
                { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
                { x: cornerSize * 0.5, y: cornerSize * 0.5 },
                { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
            ];
            cursorCorners.forEach((corner, i) => {
                gsap.to(corner, { x: positions[i].x, y: positions[i].y, duration: 0.3, ease: 'power3.out' });
            });
        }
    });

    document.addEventListener('mousedown', () => {
        if (hasGSAP) {
            gsap.to(cursorDot, { scale: 0.7, duration: 0.2 });
            gsap.to(cursorWrapper, { scale: 0.9, duration: 0.2 });
        }
    });
    document.addEventListener('mouseup', () => {
        if (hasGSAP) {
            gsap.to(cursorDot, { scale: 1, duration: 0.2 });
            gsap.to(cursorWrapper, { scale: 1, duration: 0.2 });
        }
    });

    // --- HIGH-END OGL RIBBONS LOGIC ---
    const ribbonContainer = document.getElementById('ribbons-container');
    const isMobile = window.innerWidth <= 768;
    if (ribbonContainer && typeof ogl !== 'undefined' && !isMobile) {
        const { Renderer, Transform, Color, Polyline } = ogl;
        const colors = ['#ffffff', '#e91e63']; 
        const baseSpring = 0.035;
        const baseFriction = 0.85;
        const baseThickness = 28;
        const offsetFactor = 0.04;
        const pointCount = 55;
        const renderer = new Renderer({ dpr: window.devicePixelRatio || 2, alpha: true });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.canvas.style.display = 'block';
        gl.canvas.style.width = '100%';
        gl.canvas.style.height = '100%';
        ribbonContainer.appendChild(gl.canvas);
        const scene = new Transform();
        const lines = [];
        const vertex = `precision highp float;attribute vec3 position;attribute vec3 next;attribute vec3 prev;attribute vec2 uv;attribute float side;uniform vec2 uResolution;uniform float uThickness;varying vec2 vUV;vec4 getPosition(){vec4 current=vec4(position,1.0);vec2 aspect=vec2(uResolution.x/uResolution.y,1.0);vec2 nextScreen=next.xy*aspect;vec2 prevScreen=prev.xy*aspect;vec2 tangent=normalize(nextScreen-prevScreen);vec2 normal=vec2(-tangent.y,tangent.x);normal/=aspect;normal*=mix(1.0,0.1,pow(abs(uv.y-0.5)*2.0,2.0));normal*=uThickness*0.001;current.xy-=normal*side;return current;}void main(){vUV=uv;gl_Position=getPosition();}`;
        const fragment = `precision highp float;uniform vec3 uColor;varying vec2 vUV;void main(){float fade=1.0-smoothstep(0.0,1.0,vUV.y);gl_FragColor=vec4(uColor,fade*0.8);}`;
        function resizeRibbons() { renderer.setSize(ribbonContainer.clientWidth, ribbonContainer.clientHeight); lines.forEach(l => l.polyline.resize()); }
        window.addEventListener('resize', resizeRibbons);
        colors.forEach((color, index) => {
            const points = []; for (let i = 0; i < pointCount; i++) points.push(new ogl.Vec3());
            const polyline = new Polyline(gl, { points, vertex, fragment, uniforms: { uColor: { value: new Color(color) }, uThickness: { value: baseThickness }, uResolution: { value: new ogl.Vec2(window.innerWidth, window.innerHeight) } } });
            polyline.mesh.setParent(scene);
            lines.push({ spring: baseSpring, friction: baseFriction, mouseOffset: new ogl.Vec3((index - (colors.length - 1) / 2) * offsetFactor, 0, 0), points, polyline, mouseVelocity: new ogl.Vec3() });
        });
        resizeRibbons();
        function updateOGL() {
            requestAnimationFrame(updateOGL);
            lines.forEach(line => {
                if (!oglMouse) return;
                const tmp = new ogl.Vec3().copy(oglMouse).add(line.mouseOffset).sub(line.points[0]).multiply(line.spring);
                line.mouseVelocity.add(tmp).multiply(line.friction);
                line.points[0].add(line.mouseVelocity);
                for (let i = 1; i < line.points.length; i++) line.points[i].lerp(line.points[i - 1], 0.85);
                line.polyline.updateGeometry();
            });
            renderer.render({ scene });
        }
        updateOGL();
    }

    // --- TACTICAL EYE TRACKING ---
    const pupils = document.querySelectorAll('.pupil');
    function updateEyes(mouseX, mouseY) {
        pupils.forEach(pupil => {
            const rect = pupil.parentElement.getBoundingClientRect();
            const eyeX = rect.left + rect.width / 2;
            const eyeY = rect.top + rect.height / 2;
            const dx = mouseX - eyeX; const dy = mouseY - eyeY;
            const angle = Math.atan2(dy, dx); const maxMove = 22; 
            const pupilX = Math.cos(angle) * maxMove; const pupilY = Math.sin(angle) * maxMove;
            pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        });
    }

    // --- COUNTDOWN TIMER ---
    const targetDate = new Date("April 17, 2026 10:35:00").getTime();
    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate - now;
        const timerContainer = document.querySelector('.minimal-timer');
        if (diff <= 0) { clearInterval(timerInterval); if (timerContainer) timerContainer.innerHTML = "<h3 style='color: var(--magenta); font-size: 2rem;'>COMPETITION ENDED</h3>"; return; }
        const timeUnits = { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) };
        Object.keys(timeUnits).forEach(u => { const el = document.getElementById(u); if (el) el.innerText = timeUnits[u].toString().padStart(2, '0'); });
    }
    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    // --- HINDRANCE WHEEL MODULE ---
    const NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const COL = { 
        1:'red', 2:'black', 3:'red', 4:'black', 5:'red', 6:'black', 7:'red', 8:'black', 9:'red', 
        10:'black', 11:'red', 12:'black', 13:'red', 14:'black', 15:'red'
    };
    const NAMES = {
        1: "Sing any one tamil song",
        2: "Talk any one rajini dialogue (loudly)",
        3: "Emotion switch acting (eg: tell I lost my phone with smiling face)",
        4: "Face anyone straight to straight and ask them only question",
        5: "Robot walk in the middle of the participants",
        6: "Wrong answer only with any of your choice person",
        7: "Say alphabet backwards",
        8: "Salute and say any dialogue",
        9: "Say a sentence like a news reporter",
        10: "Fake cry in front of participants for 30s",
        11: "Balance book on head",
        12: "Walk backward and introduce yourself",
        13: "Blame any one participant without reason",
        14: "Act and teach a concept like your favourite staff",
        15: "Slow motion fight scene with a friend"
    };

    const canvas = document.getElementById('wheel');
    const wheelCtx = canvas ? canvas.getContext('2d') : null;
    const spinBtn = document.getElementById('spinBtn');
    const wheelWrap = document.getElementById('wheelWrap');
    const ballEl = document.getElementById('ballEl');

    let wheelAngle = 0, spinning = false;

    function drawWheel(a) {
        if (!wheelCtx) return;
        const W = canvas.width, cx = W/2, cy = W/2, r = W/2 - 2, N = NUMS.length, STEP = (Math.PI*2)/N;
        wheelCtx.clearRect(0,0,W,W);
        for(let i=0;i<N;i++) {
            const sa=a+i*STEP-STEP/2, ea=sa+STEP, col=COL[NUMS[i]];
            wheelCtx.beginPath(); wheelCtx.moveTo(cx,cy); wheelCtx.arc(cx,cy,r,sa,ea); wheelCtx.closePath();
            const gx=cx+Math.cos(sa+STEP/2)*r*0.5, gy=cy+Math.sin(sa+STEP/2)*r*0.5;
            const g=wheelCtx.createRadialGradient(gx,gy,0,cx,cy,r);
            if(col==='red'){ g.addColorStop(0,'#e83030'); g.addColorStop(1,'#6a0000'); }
            else if(col==='black'){ g.addColorStop(0,'#444'); g.addColorStop(1,'#0a0a0a'); }
            else { g.addColorStop(0,'#22b822'); g.addColorStop(1,'#003a00'); }
            wheelCtx.fillStyle=g; wheelCtx.fill();
            wheelCtx.strokeStyle='rgba(255,255,255,0.1)'; wheelCtx.stroke();
        }
        for(let i=0;i<N;i++) {
            const ma=a+i*STEP; const tx=cx+Math.cos(ma)*r*0.75, ty=cy+Math.sin(ma)*r*0.75;
            wheelCtx.save(); wheelCtx.translate(tx,ty); wheelCtx.rotate(ma+Math.PI/2);
            wheelCtx.font='bold 10px Inter'; wheelCtx.textAlign='center'; wheelCtx.fillStyle='#fff';
            wheelCtx.fillText(NUMS[i],0,0); wheelCtx.restore();
        }
    }

    function initWheel() {
        if (!wheelWrap) return;
        const size = wheelWrap.offsetWidth;
        canvas.width = size; canvas.height = size;
        drawWheel(wheelAngle);
        checkSpinLock();
    }

    function checkSpinLock() {
        // Unlimited spins enabled - we no longer hide the active wheel.
        const history = JSON.parse(localStorage.getItem('hindrance_history') || '[]');
        if (history.length > 0) {
            const h = history[0];
            const livePanel = document.getElementById('live-result-panel');
            if (livePanel) {
                livePanel.classList.remove('hidden');
                document.getElementById('resVal').innerText = h.name;
            }
        }
    }

    let availableHindrances = [];

    function shuffleHindrances() {
        availableHindrances = [...Array(NUMS.length).keys()];
        for (let i = availableHindrances.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableHindrances[i], availableHindrances[j]] = [availableHindrances[j], availableHindrances[i]];
        }
    }

    window.spinWheel = () => {
        if (spinning) return;
        spinning = true; spinBtn.disabled = true;

        if (availableHindrances.length === 0) shuffleHindrances();
        const targetIdx = availableHindrances.pop();
        const targetAngle = (targetIdx / NUMS.length) * (Math.PI * 2);

        const FRAMES = 300; let f = 0;
        const startAngle = wheelAngle;
        const totalRotation = 10 * Math.PI + targetAngle; // 5 full spins + target

        const loop = () => {
            f++; const p = f/FRAMES; const ease = 1 - Math.pow(1-p, 4);
            wheelAngle = startAngle + totalRotation * ease;
            drawWheel(wheelAngle);
            if (f < FRAMES) requestAnimationFrame(loop);
            else { 
                const num = NUMS[targetIdx];
                const h = { num, name: NAMES[num], timestamp: Date.now() };
                
                // Update History
                const history = JSON.parse(localStorage.getItem('hindrance_history') || '[]');
                history.unshift(h);
                localStorage.setItem('hindrance_history', JSON.stringify(history.slice(0, 50)));

                // Update UI Result Panel
                const livePanel = document.getElementById('live-result-panel');
                if (livePanel) {
                    livePanel.classList.remove('hidden');
                    document.getElementById('resVal').innerText = h.name;
                }

                spinning = false;
                spinBtn.disabled = false;
                spinBtn.innerText = "◈ SPIN AGAIN ◈";
            }
        };
        loop();
    }

    if (spinBtn) spinBtn.addEventListener('click', window.spinWheel);

    // --- ADMIN UNLOCK LOGIC ---
    const adminUnlockBtn = document.getElementById('admin-unlock-btn');
    const adminAuthPanel = document.getElementById('admin-auth-panel');
    const adminKeyInput = document.getElementById('admin-key-input');
    const adminKeySubmit = document.getElementById('admin-key-submit');

    if (adminUnlockBtn) adminUnlockBtn.addEventListener('click', () => adminAuthPanel.classList.toggle('hidden'));
    if (adminKeySubmit) adminKeySubmit.addEventListener('click', () => {
        if (adminKeyInput.value === 'psnapsna') {
            localStorage.removeItem('hindrance');
            location.reload();
        } else {
            alert('Invalid Key');
        }
    });

    // --- INITIALIZE ALL ---
    initCursor();
    initWheel();
    console.log("Design Decode: System Ready.");
});
