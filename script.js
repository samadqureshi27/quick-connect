// ==================== THEME TOGGLE ====================
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');

// Dark mode is default
if (savedTheme === 'light') {
    document.documentElement.removeAttribute('data-theme');
} else {
    document.documentElement.setAttribute('data-theme', 'dark');
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    if (next === 'light') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    localStorage.setItem('theme', next);
});

// ==================== PARTICLES BACKGROUND ====================
// Optimized: fewer particles, skip sqrt, fully pause when tab hidden, cap at 25
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d', { alpha: true });
let particles = [];
let animFrameId = null;
let isTabVisible = true;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticles() {
    particles = [];
    const count = Math.min(25, Math.floor(window.innerWidth / 50));
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.4 + 0.1
        });
    }
}

function drawParticles() {
    if (!isTabVisible) return; // fully stop — don't schedule when hidden

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const len = particles.length;
    const connDistSq = 14400; // 120^2, avoids sqrt
    const w = canvas.width;
    const h = canvas.height;

    for (let i = 0; i < len; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 6.2832);
        ctx.fillStyle = `rgba(0, 201, 106, ${p.opacity})`;
        ctx.fill();

        for (let j = i + 1; j < len; j++) {
            const dx = p.x - particles[j].x;
            const dy = p.y - particles[j].y;
            const distSq = dx * dx + dy * dy;
            if (distSq < connDistSq) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(0, 201, 106, ${0.04 * (1 - distSq / connDistSq)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    animFrameId = requestAnimationFrame(drawParticles);
}

// Fully pause/resume particles on tab visibility
document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible && !animFrameId) {
        animFrameId = requestAnimationFrame(drawParticles);
    } else if (!isTabVisible && animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
});

// Debounced resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resizeCanvas(); createParticles(); }, 250);
}, { passive: true });

resizeCanvas();
createParticles();
animFrameId = requestAnimationFrame(drawParticles);

// ==================== CUSTOM CURSOR ====================
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

if (window.matchMedia('(pointer: fine)').matches && cursor && cursorFollower) {
    let cx = 0, cy = 0;
    let fcx = 0, fcy = 0;
    let cursorRAF = null;

    document.addEventListener('mousemove', (e) => {
        cx = e.clientX;
        cy = e.clientY;
        if (!cursorRAF) {
            cursorRAF = requestAnimationFrame(updateCursor);
        }
    }, { passive: true });

    function updateCursor() {
        fcx += (cx - fcx) * 0.15;
        fcy += (cy - fcy) * 0.15;

        cursor.style.transform = `translate3d(${cx - 4}px, ${cy - 4}px, 0)`;
        cursorFollower.style.transform = `translate3d(${fcx - 18}px, ${fcy - 18}px, 0)`;

        cursorRAF = requestAnimationFrame(updateCursor);
    }

    cursorRAF = requestAnimationFrame(updateCursor);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(cursorRAF);
            cursorRAF = null;
        } else {
            cursorRAF = requestAnimationFrame(updateCursor);
        }
    });

    document.querySelectorAll('a, button, .magnetic').forEach(el => {
        el.addEventListener('mouseenter', () => cursorFollower.classList.add('hover'), { passive: true });
        el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hover'), { passive: true });
    });
}

// ==================== CALL BANNER HEIGHT SYNC ====================
const callBanner = document.getElementById('callBanner');

function syncBannerHeight() {
    if (callBanner && !callBanner.classList.contains('hidden')) {
        document.documentElement.style.setProperty('--banner-height', callBanner.offsetHeight + 'px');
    }
}

setTimeout(syncBannerHeight, 1700);
window.addEventListener('resize', () => {
    if (!callBanner.classList.contains('hidden')) syncBannerHeight();
}, { passive: true });


// ==================== HEADER SCROLL EFFECT ====================
const header = document.getElementById('header');
let scrollTicking = false;

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(() => {
            header.classList.toggle('scrolled', window.pageYOffset > 10);
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}, { passive: true });


// ==================== COUNTER ANIMATION ====================
const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
    for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
            const el = entries[i].target;
            const target = parseInt(el.dataset.target);
            const duration = 1500;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const progress = Math.min((currentTime - startTime) / duration, 1);
                const t = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                el.textContent = progress < 1 ? Math.floor(t * target) : target;
                if (progress < 1) requestAnimationFrame(updateCounter);
            }

            requestAnimationFrame(updateCounter);
            counterObserver.unobserve(el);
        }
    }
}, { threshold: 0.5 });

statNumbers.forEach(el => counterObserver.observe(el));

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ==================== MAGNETIC BUTTON EFFECT ====================
if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(btn => {
        let magneticRAF = null;

        btn.addEventListener('mousemove', (e) => {
            if (magneticRAF) return;
            magneticRAF = requestAnimationFrame(() => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
                magneticRAF = null;
            });
        }, { passive: true });

        btn.addEventListener('mouseleave', () => {
            if (magneticRAF) { cancelAnimationFrame(magneticRAF); magneticRAF = null; }
            btn.style.transform = '';
        }, { passive: true });
    });
}

// ==================== TILT EFFECT ON HERO CARD ====================
const heroCard = document.querySelector('.hero-card');
if (heroCard && window.matchMedia('(pointer: fine)').matches) {
    let tiltRAF = null;

    heroCard.addEventListener('mousemove', (e) => {
        if (tiltRAF) return;
        tiltRAF = requestAnimationFrame(() => {
            const rect = heroCard.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            heroCard.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
            tiltRAF = null;
        });
    }, { passive: true });

    heroCard.addEventListener('mouseleave', () => {
        if (tiltRAF) { cancelAnimationFrame(tiltRAF); tiltRAF = null; }
        heroCard.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
        heroCard.style.transition = 'transform 0.4s ease';
        setTimeout(() => heroCard.style.transition = '', 400);
    }, { passive: true });
}
