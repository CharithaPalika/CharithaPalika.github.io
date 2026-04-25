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
    // 2. PARTICLE CANVAS — floating neuron-like dots
    // =========================================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const COLORS = [
        'rgba(192, 132, 252, ',   // violet
        'rgba(244, 114, 182, ',   // rose
        'rgba(103, 232, 249, ',   // mint
    ];

    const particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.2 + 0.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.45 + 0.1,
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
        twinkleSpeed: Math.random() * 0.02 + 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;
        particles.forEach(p => {
            // Twinkle alpha
            const twinkle = Math.sin(frame * p.twinkleSpeed + p.twinkleOffset) * 0.15;
            const a = Math.max(0.05, p.alpha + twinkle);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + a + ')';
            ctx.fill();

            // Move
            p.x += p.dx;
            p.y += p.dy;

            // Wrap around
            if (p.x < -5) p.x = canvas.width + 5;
            if (p.x > canvas.width + 5) p.x = -5;
            if (p.y < -5) p.y = canvas.height + 5;
            if (p.y > canvas.height + 5) p.y = -5;
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // =========================================================
    // 3. TYPING ANIMATION
    // =========================================================
    const phrases = [
        'PhD Scholar @ IIT Madras',
        'RL × Neuroscience Researcher',
        'Designing Brain-Inspired AI',
        'Closed-Loop Therapeutic Systems',
    ];
    const typingEl = document.querySelector('.typing-text');
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingDelay = 120;

    function type() {
        const current = phrases[phraseIdx];
        if (isDeleting) {
            typingEl.textContent = current.slice(0, charIdx--);
            typingDelay = 55;
        } else {
            typingEl.textContent = current.slice(0, charIdx++);
            typingDelay = 110;
        }

        if (!isDeleting && charIdx > current.length) {
            isDeleting = true;
            typingDelay = 1600; // pause at end
        } else if (isDeleting && charIdx < 0) {
            isDeleting = false;
            charIdx = 0;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            typingDelay = 350;
        }
        setTimeout(type, typingDelay);
    }
    setTimeout(type, 800);

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
    }, { threshold: 0.08 });

    document.querySelectorAll('section').forEach(section => {
        sectionObserver.observe(section);
    });

    // Make hero visible immediately
    const hero = document.querySelector('.hero');
    if (hero) setTimeout(() => hero.classList.add('visible'), 80);

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
                    card.style.transition = `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms, background 0.4s, border-color 0.4s, box-shadow 0.4s`;
                }, 0);
                obs.unobserve(card);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glass-card').forEach((card, i) => {
        card.dataset.stagger = (i % 4) * 100; // stagger by column position
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
});
