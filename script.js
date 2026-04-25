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
    // 2. HEX DIGIT FLOAT CANVAS — sparse coder particles
    // =========================================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Hex / binary / code chars
    const CODE_CHARS = '0123456789ABCDEFxf01{}[]<>=+-/*|&'.split('');
    const CHAR_COLORS = [
        'rgba(10, 132, 255, ',   // Apple blue
        'rgba(48, 209, 88, ',    // Apple green
        'rgba(100, 210, 255, ',  // Apple cyan
    ];

    const floaters = Array.from({ length: 38 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        char: CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
        color: CHAR_COLORS[Math.floor(Math.random() * CHAR_COLORS.length)],
        alpha: Math.random() * 0.12 + 0.03,
        size: Math.random() * 8 + 8,
        dx: (Math.random() - 0.5) * 0.18,
        dy: (Math.random() - 0.5) * 0.18,
        changeTimer: Math.floor(Math.random() * 200),
        changeInterval: Math.floor(Math.random() * 180 + 120),
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    function animateFloaters() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;

        floaters.forEach(p => {
            // Occasional char swap
            p.changeTimer++;
            if (p.changeTimer > p.changeInterval) {
                p.char = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
                p.changeTimer = 0;
            }

            // Twinkle
            const twinkle = Math.sin(frame * p.twinkleSpeed + p.twinkleOffset) * 0.04;
            const a = Math.max(0.02, p.alpha + twinkle);

            ctx.save();
            ctx.font = `${p.size}px 'JetBrains Mono', 'Fira Code', monospace`;
            ctx.fillStyle = p.color + a + ')';
            ctx.fillText(p.char, p.x, p.y);
            ctx.restore();

            // Drift
            p.x += p.dx;
            p.y += p.dy;

            // Wrap around
            if (p.x < -20) p.x = canvas.width + 20;
            if (p.x > canvas.width + 20) p.x = -20;
            if (p.y < -20) p.y = canvas.height + 20;
            if (p.y > canvas.height + 20) p.y = -20;
        });

        requestAnimationFrame(animateFloaters);
    }
    animateFloaters();

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
    setTimeout(type, 1000);

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
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
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
