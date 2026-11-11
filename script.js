document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. SCROLL PROGRESS BAR
    // =========================================================
    const progressBar = document.getElementById('progress-bar');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
    });

    // =========================================================
    // 2. ARTIFICIAL NEURON CANVAS - firing activation pulses
    // =========================================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const showNeuronCanvas = window.getComputedStyle(canvas).display !== 'none';

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    if (showNeuronCanvas) {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    const neuronColors = {
        node: 'rgba(67, 217, 255, ',
        line: 'rgba(67, 217, 255, ',
        cyan: 'rgba(67, 217, 255, ',
        green: 'rgba(78, 230, 176, ',
        amber: 'rgba(246, 180, 75, ',
        red: 'rgba(255, 107, 107, ',
    };

    const neuronNodes = [
        { x: 0.61, y: 0.26 }, { x: 0.62, y: 0.42 }, { x: 0.60, y: 0.60 }, { x: 0.63, y: 0.76 },
        { x: 0.72, y: 0.18 }, { x: 0.74, y: 0.34 }, { x: 0.73, y: 0.50 }, { x: 0.75, y: 0.66 }, { x: 0.72, y: 0.82 },
        { x: 0.83, y: 0.24 }, { x: 0.85, y: 0.42 }, { x: 0.82, y: 0.58 }, { x: 0.86, y: 0.74 },
        { x: 0.94, y: 0.18 }, { x: 0.96, y: 0.36 }, { x: 0.93, y: 0.54 }, { x: 0.97, y: 0.72 }, { x: 0.92, y: 0.88 },
        { x: 0.54, y: 0.52 }, { x: 0.66, y: 0.88 }, { x: 0.79, y: 0.10 }, { x: 0.99, y: 0.48 },
    ];

    const neuronEdges = [
        [18, 0], [18, 1], [18, 2], [18, 3],
        [0, 4], [0, 5], [0, 6], [1, 5], [1, 6], [1, 7], [2, 6], [2, 7], [2, 8], [3, 7], [3, 8], [3, 19],
        [4, 9], [4, 10], [5, 9], [5, 10], [5, 11], [6, 10], [6, 11], [6, 12], [7, 11], [7, 12], [8, 12], [8, 16],
        [9, 13], [9, 14], [10, 14], [10, 15], [11, 15], [11, 16], [12, 16], [12, 17],
        [20, 9], [19, 17], [7, 15], [2, 11], [6, 14], [21, 15],
    ];

    const pulses = [
        { edge: 0, color: 'cyan', speed: 0.00011, delay: 0.00 },
        { edge: 7, color: 'cyan', speed: 0.00010, delay: 0.18 },
        { edge: 18, color: 'green', speed: 0.000085, delay: 0.34 },
        { edge: 28, color: 'amber', speed: 0.000075, delay: 0.52 },
        { edge: 35, color: 'cyan', speed: 0.00009, delay: 0.66 },
        { edge: 40, color: 'green', speed: 0.00008, delay: 0.78 },
        { edge: 31, color: 'red', speed: 0.000055, delay: 0.90 },
    ];

    function viewportPoint(node) {
        return {
            x: node.x * window.innerWidth,
            y: node.y * window.innerHeight,
        };
    }

    function drawSoftLine(a, b, alpha, width = 0.75) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        const cpOffset = (b.x - a.x) * 0.28;
        ctx.bezierCurveTo(a.x + cpOffset, a.y - 18, b.x - cpOffset, b.y + 18, b.x, b.y);
        ctx.strokeStyle = neuronColors.line + alpha + ')';
        ctx.lineWidth = width;
        ctx.stroke();
    }

    function cubicPoint(a, b, t) {
        const cpOffset = (b.x - a.x) * 0.28;
        const c = { x: a.x + cpOffset, y: a.y - 18 };
        const d = { x: b.x - cpOffset, y: b.y + 18 };
        const mt = 1 - t;

        return {
            x: mt ** 3 * a.x + 3 * mt ** 2 * t * c.x + 3 * mt * t ** 2 * d.x + t ** 3 * b.x,
            y: mt ** 3 * a.y + 3 * mt ** 2 * t * c.y + 3 * mt * t ** 2 * d.y + t ** 3 * b.y,
        };
    }

    function drawNeuronField(time = 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const points = neuronNodes.map(viewportPoint);
        const slowGlow = reduceMotion ? 0.45 : (Math.sin(time * 0.00055) + 1) * 0.5;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        neuronEdges.forEach(([from, to], i) => {
            const alpha = 0.035 + ((i % 5) * 0.008) + slowGlow * 0.02;
            drawSoftLine(points[from], points[to], alpha);
        });

        pulses.forEach((pulse) => {
            const [from, to] = neuronEdges[pulse.edge];
            const localT = reduceMotion ? pulse.delay : ((time * pulse.speed + pulse.delay) % 1);
            const point = cubicPoint(points[from], points[to], localT);
            const color = neuronColors[pulse.color];
            const radius = pulse.color === 'red' ? 2.4 : 3.2;

            const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 7);
            gradient.addColorStop(0, color + '0.78)');
            gradient.addColorStop(0.25, color + '0.32)');
            gradient.addColorStop(1, color + '0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius * 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = color + '0.95)';
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fill();
        });

        points.forEach((point, i) => {
            let color = neuronColors.node;
            let alpha = 0.22;
            let radius = 2.1;

            if ([2, 6, 11].includes(i)) {
                color = neuronColors.green;
                alpha = 0.48 + slowGlow * 0.18;
                radius = 2.7;
            } else if ([15, 16].includes(i)) {
                color = neuronColors.amber;
                alpha = 0.50;
                radius = 2.5;
            } else if (i === 12) {
                color = neuronColors.red;
                alpha = 0.34;
                radius = 2.1;
            }

            ctx.fillStyle = color + alpha + ')';
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    function animateNeuronField(time) {
        drawNeuronField(time);
        requestAnimationFrame(animateNeuronField);
    }

    if (showNeuronCanvas) {
        if (reduceMotion) {
            drawNeuronField();
        } else {
            requestAnimationFrame(animateNeuronField);
        }
    }

    // =========================================================
    // 3. TYPING ANIMATION — shell prompt style
    // =========================================================
    const phrases = [
        'PhD Scholar @ IIT Madras',
        'RL × Neuroscience Researcher',
        'Designing Brain-Inspired AI',
        'Closed-Loop Therapeutic Systems',
        'Parkinson\'s · Glucose · NeuroAI',
    ];
    const typingEl = document.querySelector('.typing-text');
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingDelay = 100;

    function type() {
        const current = phrases[phraseIdx];
        if (isDeleting) {
            typingEl.textContent = current.slice(0, charIdx--);
            typingDelay = 45;
        } else {
            typingEl.textContent = current.slice(0, charIdx++);
            typingDelay = 90;
        }

        if (!isDeleting && charIdx > current.length) {
            isDeleting = true;
            typingDelay = 1800; // pause at end
        } else if (isDeleting && charIdx < 0) {
            isDeleting = false;
            charIdx = 0;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            typingDelay = 300;
        }
        setTimeout(type, typingDelay);
    }
    if (typingEl) setTimeout(type, 1000);

    // =========================================================
    // 4. SCROLL REVEAL — sections
    // =========================================================
    const sectionObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.07 });

    document.querySelectorAll('section').forEach(section => {
        sectionObserver.observe(section);
    });

    // Hero visible immediately
    const hero = document.querySelector('.hero');
    if (hero) setTimeout(() => hero.classList.add('visible'), 60);

    // =========================================================
    // 5. STAGGERED CARD ENTRANCE
    // =========================================================
    const cardObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const delay = Number(card.dataset.stagger || 0);
                setTimeout(() => {
                    card.classList.add('card-visible');
                    card.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms, background 0.35s, border-color 0.35s, box-shadow 0.35s`;
                }, 0);
                obs.unobserve(card);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glass-card').forEach((card, i) => {
        card.dataset.stagger = (i % 4) * 90;
        cardObserver.observe(card);
    });

    // =========================================================
    // 6. CARD MOUSE GLOW
    // =========================================================
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    // =========================================================
    // 7. ACTIVE NAV HIGHLIGHT
    // =========================================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const isActive = link.getAttribute('href') === `#${id}`;
                    link.classList.toggle('active', isActive);
                    if (isActive) link.setAttribute('aria-current', 'location');
                    else link.removeAttribute('aria-current');
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => navObserver.observe(s));

    // =========================================================
    // 8. TERMINAL BOOT SEQUENCE (subtle)
    // =========================================================
    const terminalBody = document.querySelector('.terminal-body');
    if (terminalBody) {
        terminalBody.style.opacity = '0';
        terminalBody.style.transition = 'opacity 0.6s ease';
        setTimeout(() => {
            terminalBody.style.opacity = '1';
        }, 900);
    }

    // =========================================================
    // 9. SKILL ITEMS — stagger hover reveal
    // =========================================================
    document.querySelectorAll('.skill-item').forEach((item, i) => {
        item.style.transitionDelay = `${i * 20}ms`;
    });

});

// BibTeX toggles and copy buttons on publication entries.
document.querySelectorAll('.pub-cite-toggle').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
    });
});
document.querySelectorAll('.pub-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
        const text = btn.parentElement.querySelector('code').textContent;
        try {
            await navigator.clipboard.writeText(text);
            btn.textContent = 'Copied';
        } catch {
            const range = document.createRange();
            range.selectNodeContents(btn.parentElement.querySelector('code'));
            const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
            btn.textContent = 'Selected — press ⌘C';
        }
        setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
    });
});
