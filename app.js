document.addEventListener('DOMContentLoaded', () => {
    // --- NAVIGATION & REDIRECT HANDLERS ---
    const hiveScanBtn = document.getElementById('hive-scan-btn');
    const deepScanBtn = document.getElementById('deep-scan-btn');
    const navUploadBtn = document.getElementById('nav-upload-btn');

    const openHive = () => window.open('https://hivemoderation.com/ai-generated-content-detection', '_blank');
    const openAIorNot = () => window.open('https://www.aiornot.com/', '_blank');

    if (hiveScanBtn) hiveScanBtn.addEventListener('click', openHive);
    if (deepScanBtn) deepScanBtn.addEventListener('click', openAIorNot);
    if (navUploadBtn) navUploadBtn.addEventListener('click', openHive);

    // --- HIGH-END OGL RIBBONS LOGIC ---
    const ribbonContainer = document.getElementById('ribbons-container');
    const isMobile = window.innerWidth <= 768;

    if (ribbonContainer && typeof ogl !== 'undefined' && !isMobile) {
        const { Renderer, Transform, Vec3, Color, Polyline } = ogl;
        // ... (rest of OGL initialization stays same)

        const colors = ['#ffffff', '#e91e63']; 
        const baseSpring = 0.035;
        const baseFriction = 0.85;
        const baseThickness = 28;
        const offsetFactor = 0.04;
        const maxAge = 600;
        const pointCount = 55;
        const speedMultiplier = 0.6;

        const renderer = new Renderer({ dpr: window.devicePixelRatio || 2, alpha: true });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);

        renderer.gl.canvas.style.display = 'block';
        renderer.gl.canvas.style.width = '100%';
        renderer.gl.canvas.style.height = '100%';
        ribbonContainer.appendChild(gl.canvas);

        const scene = new Transform();
        const lines = [];

        const vertex = `
            precision highp float;
            attribute vec3 position;
            attribute vec3 next;
            attribute vec3 prev;
            attribute vec2 uv;
            attribute float side;
            uniform vec2 uResolution;
            uniform float uThickness;
            varying vec2 vUV;
            vec4 getPosition() {
                vec4 current = vec4(position, 1.0);
                vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
                vec2 nextScreen = next.xy * aspect;
                vec2 prevScreen = prev.xy * aspect;
                vec2 tangent = normalize(nextScreen - prevScreen);
                vec2 normal = vec2(-tangent.y, tangent.x);
                normal /= aspect;
                normal *= mix(1.0, 0.1, pow(abs(uv.y - 0.5) * 2.0, 2.0));
                normal *= uThickness * 0.001; 
                current.xy -= normal * side;
                return current;
            }
            void main() {
                vUV = uv;
                gl_Position = getPosition();
            }
        `;

        const fragment = `
            precision highp float;
            uniform vec3 uColor;
            varying vec2 vUV;
            void main() {
                float fade = 1.0 - smoothstep(0.0, 1.0, vUV.y);
                gl_FragColor = vec4(uColor, fade * 0.8);
            }
        `;

        function resize() {
            const width = ribbonContainer.clientWidth;
            const height = ribbonContainer.clientHeight;
            renderer.setSize(width, height);
            lines.forEach(line => line.polyline.resize());
        }
        window.addEventListener('resize', resize);

        const mouse = new Vec3();
        document.addEventListener('mousemove', (e) => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            mouse.set((e.clientX / width) * 2 - 1, (e.clientY / height) * -2 + 1, 0);
        });

        colors.forEach((color, index) => {
            const spring = baseSpring;
            const friction = baseFriction;
            const thickness = baseThickness;
            const mouseOffset = new Vec3((index - (colors.length - 1) / 2) * offsetFactor, 0, 0);

            const points = [];
            for (let i = 0; i < pointCount; i++) points.push(new Vec3());

            const polyline = new Polyline(gl, {
                points,
                vertex,
                fragment,
                uniforms: {
                    uColor: { value: new Color(color) },
                    uThickness: { value: thickness },
                    uResolution: { value: new ogl.Vec2(window.innerWidth, window.innerHeight) }
                }
            });

            polyline.mesh.setParent(scene);
            lines.push({ spring, friction, mouseOffset, points, polyline, mouseVelocity: new Vec3() });
        });

        resize();

        let lastTime = performance.now();
        function update() {
            requestAnimationFrame(update);
            const currentTime = performance.now();
            const dt = currentTime - lastTime;
            lastTime = currentTime;

            lines.forEach(line => {
                const tmp = new Vec3().copy(mouse).add(line.mouseOffset).sub(line.points[0]).multiply(line.spring);
                line.mouseVelocity.add(tmp).multiply(line.friction);
                line.points[0].add(line.mouseVelocity);

                for (let i = 1; i < line.points.length; i++) {
                    line.points[i].lerp(line.points[i - 1], 0.85); // Smooth organic follow
                }
                line.polyline.updateGeometry();
            });

            renderer.render({ scene });
        }
        update();
    }

    // --- TACTICAL EYE TRACKING LOGIC ---
    const pupils = document.querySelectorAll('.pupil');
    function updateEyes(mouseX, mouseY) {
        pupils.forEach(pupil => {
            const rect = pupil.parentElement.getBoundingClientRect();
            const eyeX = rect.left + rect.width / 2;
            const eyeY = rect.top + rect.height / 2;
            const dx = mouseX - eyeX;
            const dy = mouseY - eyeY;
            const angle = Math.atan2(dy, dx);
            const maxMove = 22; 
            const pupilX = Math.cos(angle) * maxMove;
            const pupilY = Math.sin(angle) * maxMove;
            pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        });
    }

    document.addEventListener('mousemove', (e) => {
        updateEyes(e.clientX, e.clientY);
    });

    // --- COUNTDOWN TIMER LOGIC ---
    const targetDate = new Date("April 17, 2026 10:35:00").getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        const timerContainer = document.querySelector('.minimal-timer');

        if (difference <= 0) {
            clearInterval(timerInterval);
            if (timerContainer) timerContainer.innerHTML = "<h3 style='color: var(--magenta); font-family: var(--font-head); font-size: 2rem;'>COMPETITION ENDED</h3>";
            return;
        }

        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minsEl = document.getElementById('minutes');
        const secsEl = document.getElementById('seconds');

        if (daysEl) daysEl.textContent = d.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = h.toString().padStart(2, '0');
        if (minsEl) minsEl.textContent = m.toString().padStart(2, '0');
        if (secsEl) secsEl.textContent = s.toString().padStart(2, '0');
    }

    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    // --- HINDRANCE WHEEL LOGIC ---
    const NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const COL = {
        1:'red', 2:'black', 3:'red', 4:'black', 5:'red', 6:'black',
        7:'red', 8:'black', 9:'red', 10:'black', 11:'green', 12:'green'
    };
    const NAMES = {
        1: "Blindfold Designing (5 mins)",
        2: "Bitter Gourd Shot 😆",
        3: "Loud Music Distraction",
        4: "Solve ONLY hardest problem",
        5: "Remove Lead Designer (Switch roles)",
        6: "Mouse/Keyboard Swap",
        7: "Reset Canvas to Boilerplate",
        8: "Wear Chunky Gloves",
        9: "Dramatic Dialogue before Save 🎭",
        10: "Sunglasses + Extreme Brightness",
        11: "🟡 Golden Pass: Transfer Hindrance",
        12: "Lucky Retry (Better luck next time)"
    };

    const canvas = document.getElementById('wheel');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const spinBtn = document.getElementById('spinBtn');
    const wheelWrap = document.getElementById('wheelWrap');
    const ballEl = document.getElementById('ballEl');
    const resVal = document.getElementById('resVal');
    const livePanel = document.getElementById('live-result-panel');
    const activeState = document.getElementById('wheel-active-state');
    const lockedState = document.getElementById('wheel-locked-state');

    let angle = 0, spinning = false;
    const N = NUMS.length;
    const STEP = (Math.PI * 2) / N;

    const adminUnlockBtn = document.getElementById('admin-unlock-btn');

    function checkSpinStatus() {
        const saved = localStorage.getItem('design_decode_hindrance');
        if (saved && lockedState) {
            const data = JSON.parse(saved);
            activeState.classList.add('hidden');
            lockedState.classList.remove('hidden');
            document.getElementById('locked-value-text').textContent = data.name;
            document.getElementById('locked-result-title').textContent = `Result: ${data.num}`;
        }
    }

    if (adminUnlockBtn) {
        const authPanel = document.getElementById('admin-auth-panel');
        const keyInput = document.getElementById('admin-key-input');
        const keySubmit = document.getElementById('admin-key-submit');

        adminUnlockBtn.addEventListener('click', () => {
            if (authPanel) {
                authPanel.classList.toggle('hidden');
                adminUnlockBtn.textContent = authPanel.classList.contains('hidden') ? '◈ Request Admin Unlock ◈' : '◈ Close Admin Panel ◈';
                if (!authPanel.classList.contains('hidden')) {
                    keyInput.focus();
                }
            }
        });

        if (keySubmit) {
            keySubmit.addEventListener('click', () => {
                const key = keyInput.value.trim();
                if (key === "psnapsna") {
                    localStorage.removeItem('design_decode_hindrance');
                    location.reload(); 
                } else {
                    alert("❌ INVALID KEY\n\nPlease check the contact details above for help.");
                    keyInput.value = '';
                }
            });

            // Allow "Enter" key to submit
            keyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') keySubmit.click();
            });
        }
    }

    function resizeWheel() {
        if (!wheelWrap || !canvas) return;
        const size = wheelWrap.offsetWidth;
        const cSize = Math.round(size * 0.84);
        canvas.width = cSize; canvas.height = cSize;
        drawWheel(angle);
    }

    function drawWheel(a) {
        if (!ctx) return;
        const W = canvas.width, cx = W/2, cy = W/2, r = W/2 - 2;
        ctx.clearRect(0,0,W,W);

        for (let i = 0; i < N; i++) {
            const sa = a + i*STEP - STEP/2, ea = sa + STEP;
            const num = NUMS[i], col = COL[num];
            ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,sa,ea); ctx.closePath();
            
            const g = ctx.createRadialGradient(cx,cy,0,cx,cy,r);
            if (col==='red') { g.addColorStop(0,'#e91e63'); g.addColorStop(1,'#8e1b3e'); }
            else if (col==='black') { g.addColorStop(0,'#444'); g.addColorStop(1,'#1a050f'); }
            else { g.addColorStop(0,'#2ecc71'); g.addColorStop(1,'#27ae60'); }
            
            ctx.fillStyle = g; ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();
        }

        // Numbers
        for (let i = 0; i < N; i++) {
            const ma = a + i*STEP;
            const tx = cx + Math.cos(ma)*r*0.75, ty = cy + Math.sin(ma)*r*0.75;
            ctx.save(); ctx.translate(tx,ty); ctx.rotate(ma + Math.PI/2);
            ctx.font = 'bold 12px Outfit,sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText(NUMS[i],0,0); ctx.restore();
        }
    }

    function updateBall(bA, bR) {
        if (!ballEl) return;
        const size = wheelWrap.offsetWidth;
        const cx = size/2, cy = size/2;
        const x = cx + Math.cos(bA)*bR - 6;
        const y = cy + Math.sin(bA)*bR - 6;
        ballEl.style.left = x+'px'; ballEl.style.top = y+'px';
    }

    async function spinWheel() {
        if (spinning) return;
        spinning = true;
        spinBtn.disabled = true;
        spinBtn.textContent = '◈ SPINNING... ◈';

        const target = Math.floor(Math.random()*N);
        const size = wheelWrap.offsetWidth;
        let ballR = size * 0.43;
        let ballA = Math.random()*Math.PI*2;
        
        ballEl.style.display = 'block';

        let v = 0.15 + Math.random()*0.05;
        let bv = -(0.18 + Math.random()*0.05);
        let f = 0;
        const FRAMES = 240;

        function tick() {
            f++;
            const p = f / FRAMES;
            const ease = p < 0.6 ? 1 : 1 - Math.pow((p-0.6)/0.4, 2);
            angle += v * ease;
            ballA += bv * ease;
            
            if (p > 0.6) {
                ballR = (size * 0.43) - (size * 0.15) * Math.pow((p-0.6)/0.4, 2);
            }

            drawWheel(angle);
            updateBall(ballA, ballR);

            if (f < FRAMES) {
                requestAnimationFrame(tick);
            } else {
                finalizeSpin(target);
            }
        }
        requestAnimationFrame(tick);
    }

    function finalizeSpin(target) {
        const num = NUMS[target];
        const hindrance = NAMES[num];
        
        if (resVal && livePanel) {
            resVal.textContent = hindrance;
            livePanel.classList.remove('hidden');
        }

        // Save to localStorage
        localStorage.setItem('design_decode_hindrance', JSON.stringify({
            num: num,
            name: hindrance
        }));

        setTimeout(() => {
            checkSpinStatus();
        }, 2500);
    }

    if (spinBtn) spinBtn.addEventListener('click', spinWheel);
    
    window.addEventListener('resize', resizeWheel);
    
    // Init
    checkSpinStatus();
    resizeWheel();

    console.log("Design Decode: Hindrance Wheel & Redirect Hub Active.");
});
