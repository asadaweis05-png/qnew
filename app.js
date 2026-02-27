// ===== theqnew — Enhanced JavaScript =====

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initNavbar();
    initMobileNav();
    initStars();
    initParticles();
    initSmoothScroll();
    initNewsletter();
    initBackToTop();
    initTiltCards();
    initCountUp();
    initMagneticButtons();
    initTypewriter();
    initHeroParallax();
    initActiveNavHighlight();
    initModals();
    initCardInteractions();
    initToastSystem();
    loadAdminData();
    initSupabaseAuth();
});

// ===== SCROLL REVEAL (Intersection Observer) =====
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Stagger siblings in grids
                const parent = entry.target.parentElement;
                const siblings = parent ? Array.from(parent.querySelectorAll(':scope > .reveal, :scope > .reveal-left, :scope > .reveal-right, :scope > .reveal-scale')) : [];
                const index = siblings.indexOf(entry.target);
                const delay = index >= 0 ? index * 120 : 0;

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

// ===== NAVBAR SCROLL EFFECT =====
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let ticking = false;
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                if (scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }

                lastScrollY = scrollY;
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ===== MOBILE NAVIGATION =====
function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('mobileOverlay');

    if (!hamburger || !overlay) return;

    hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.toggle('active');
        overlay.classList.toggle('active', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close on link click
    overlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            hamburger.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ===== STAR RATINGS =====
function initStars() {
    document.querySelectorAll('.stars[data-rating]').forEach(container => {
        const rating = parseFloat(container.dataset.rating);
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.3;
        const totalStars = 5;

        let html = '';
        for (let i = 0; i < totalStars; i++) {
            if (i < fullStars) {
                html += '<span class="star">★</span>';
            } else if (i === fullStars && hasHalf) {
                html += '<span class="star">★</span>';
            } else {
                html += '<span class="star empty">★</span>';
            }
        }
        container.innerHTML = html;
    });
}

// ===== FLOATING PARTICLES IN HERO =====
function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    const count = window.innerWidth < 768 ? 12 : 25;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('hero-particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        const size = 2 + Math.random() * 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDuration = `${6 + Math.random() * 10}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.opacity = `${0.1 + Math.random() * 0.4}`;
        container.appendChild(particle);
    }
}

// ===== SMOOTH SCROLL FOR NAV LINKS =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== NEWSLETTER FORM =====
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('emailInput');
        const btn = form.querySelector('.btn-subscribe');

        // Animate success
        btn.classList.add('success');
        btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;">✓ Subscribed!</span>';
        input.value = '';
        input.disabled = true;

        // Confetti burst
        createConfetti(btn);

        setTimeout(() => {
            btn.classList.remove('success');
            btn.textContent = 'Subscribe';
            input.disabled = false;
        }, 3500);
    });
}

// ===== CONFETTI EFFECT =====
function createConfetti(origin) {
    const colors = ['#00e5ff', '#0070f3', '#10b981', '#f59e0b', '#f1f5f9'];
    const rect = origin.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: ${4 + Math.random() * 6}px;
            height: ${4 + Math.random() * 6}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 9999;
            opacity: 1;
        `;
        document.body.appendChild(confetti);

        const angle = (Math.random() * 360) * (Math.PI / 180);
        const velocity = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 50;

        confetti.animate([
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty + 100}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: 800 + Math.random() * 600,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }).onfinish = () => confetti.remove();
    }
}

// ===== BACK TO TOP BUTTON =====
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== TILT EFFECT ON CARDS =====
function initTiltCards() {
    if (window.innerWidth < 768) return; // No tilt on mobile

    const cards = document.querySelectorAll('.course-card, .review-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;

            requestAnimationFrame(() => {
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ===== COUNT-UP ANIMATION =====
function initCountUp() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.dataset.count);
                const suffix = el.dataset.suffix || '';
                const duration = 2000;
                const start = performance.now();

                function update(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                    const current = target * eased;

                    el.textContent = (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    }
                }

                requestAnimationFrame(update);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

// ===== MAGNETIC BUTTONS =====
function initMagneticButtons() {
    if (window.innerWidth < 768) return;

    const buttons = document.querySelectorAll('.btn-primary, .btn-signup, .btn-subscribe');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// ===== TYPEWRITER FOR HERO BADGE =====
function initTypewriter() {
    const badge = document.querySelector('.hero-badge');
    if (!badge) return;

    const text = badge.textContent;
    badge.textContent = '';
    badge.style.borderRight = '2px solid var(--accent)';
    badge.style.animation = 'typing-cursor 0.7s step-end infinite';

    let i = 0;
    function type() {
        if (i < text.length) {
            badge.textContent += text.charAt(i);
            i++;
            setTimeout(type, 60 + Math.random() * 40);
        } else {
            // Remove cursor after typing complete
            setTimeout(() => {
                badge.style.borderRight = 'none';
                badge.style.animation = 'borderGlow 3s ease-in-out infinite';
            }, 1000);
        }
    }

    // Delay typewriter until badge is visible
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            setTimeout(type, 400);
            observer.unobserve(badge);
        }
    });
    observer.observe(badge);
}

// ===== MOUSE PARALLAX ON HERO (subtle) =====
function initHeroParallax() {
    const hero = document.getElementById('hero');
    if (!hero || window.innerWidth < 768) return;

    const glow = hero.querySelector('.hero-glow');
    const particles = hero.querySelector('.hero-particles');
    if (!glow) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        requestAnimationFrame(() => {
            glow.style.transform = `translate(calc(-50% + ${x * 60}px), ${y * 40}px)`;
            if (particles) {
                particles.style.transform = `translate(${x * 15}px, ${y * 10}px)`;
            }
        });
    });
}

// ===== ACTIVE NAV LINK HIGHLIGHTING =====
function initActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px'
    });

    sections.forEach(section => observer.observe(section));
}

// ===== RIPPLE EFFECT ON BUTTONS =====
document.addEventListener('click', (e) => {
    const target = e.target.closest('.btn-primary, .btn-review, .btn-subscribe, .btn-signup');
    if (!target) return;

    const ripple = document.createElement('span');
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        background: rgba(255,255,255,0.3);
        border-radius: 50%;
        transform: scale(0);
        pointer-events: none;
    `;

    target.style.position = 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(ripple);

    ripple.animate([
        { transform: 'scale(0)', opacity: 0.5 },
        { transform: 'scale(1)', opacity: 0 }
    ], { duration: 600, easing: 'ease-out' }).onfinish = () => ripple.remove();
});

// ===== LOGIN / SIGN UP MODALS =====
function initModals() {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);

    // Login Modal HTML
    const loginModal = document.createElement('div');
    loginModal.className = 'modal';
    loginModal.id = 'loginModal';
    loginModal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" aria-label="Close">&times;</button>
            <h2 class="modal-title">Welcome Back</h2>
            <p class="modal-subtitle">Log in to your theqnew account</p>
            <form class="modal-form" id="loginForm">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" placeholder="you@example.com" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" placeholder="Enter your password" required>
                </div>
                <button type="submit" class="btn-modal-submit">Login</button>
            </form>
            <p class="modal-footer-text">Don't have an account? <a href="#" class="modal-switch" data-target="signupModal">Sign Up</a></p>
        </div>
    `;
    document.body.appendChild(loginModal);

    // Sign Up Modal HTML
    const signupModal = document.createElement('div');
    signupModal.className = 'modal';
    signupModal.id = 'signupModal';
    signupModal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" aria-label="Close">&times;</button>
            <h2 class="modal-title">Create Account</h2>
            <p class="modal-subtitle">Join theqnew and start learning</p>
            <form class="modal-form" id="signupForm">
                <div class="form-group">
                    <label for="signupName">Full Name</label>
                    <input type="text" id="signupName" placeholder="Your full name" required>
                </div>
                <div class="form-group">
                    <label for="signupEmail">Email</label>
                    <input type="email" id="signupEmail" placeholder="you@example.com" required>
                </div>
                <div class="form-group">
                    <label for="signupPassword">Password</label>
                    <input type="password" id="signupPassword" placeholder="Create a password" required minlength="6">
                </div>
                <button type="submit" class="btn-modal-submit">Create Account</button>
            </form>
            <p class="modal-footer-text">Already have an account? <a href="#" class="modal-switch" data-target="loginModal">Login</a></p>
        </div>
    `;
    document.body.appendChild(signupModal);

    // Wire up Login buttons
    document.querySelectorAll('.btn-login').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('loginModal');
        });
    });

    // Wire up Sign Up buttons
    document.querySelectorAll('.btn-signup').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('signupModal');
        });
    });

    // Mobile overlay Login/Sign Up
    const mobileOverlay = document.getElementById('mobileOverlay');
    if (mobileOverlay) {
        mobileOverlay.querySelectorAll('.mobile-cta').forEach(cta => {
            cta.addEventListener('click', (e) => {
                e.preventDefault();
                // Close mobile nav
                const hamburger = document.getElementById('hamburger');
                if (hamburger) hamburger.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';

                // Determine which modal
                const text = cta.textContent.trim().toLowerCase();
                if (text === 'login') {
                    openModal('loginModal');
                } else {
                    openModal('signupModal');
                }
            });
        });
    }

    // Modal switch links
    document.querySelectorAll('.modal-switch').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;
            closeAllModals();
            setTimeout(() => openModal(target), 200);
        });
    });

    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Close on backdrop click
    backdrop.addEventListener('click', closeAllModals);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.btn-modal-submit');
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        btn.textContent = 'Logging in...';
        btn.disabled = true;

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            closeAllModals();
            showToast('✓ Logged in successfully! Welcome back.', 'success');
            e.target.reset();
        } catch (error) {
            console.error(error);
            showToast(error.message || 'Error logging in', 'error');
        } finally {
            btn.textContent = 'Login';
            btn.disabled = false;
        }
    });

    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.btn-modal-submit');
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        btn.textContent = 'Creating account...';
        btn.disabled = true;

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) throw error;

            closeAllModals();
            showToast('✓ Account created! You are now logged in.', 'success');
            e.target.reset();
        } catch (error) {
            console.error(error);
            showToast(error.message || 'Error signing up', 'error');
        } finally {
            btn.textContent = 'Create Account';
            btn.disabled = false;
        }
    });
}

// ===== SUPABASE AUTH LISTENER =====
function initSupabaseAuth() {
    const adminEmail = 'asadaweis05@gmail.com';

    const navAdminLink = document.getElementById('navAdminLink');
    const mobileAdminLink = document.getElementById('mobileAdminLink');

    const navLoginBtn = document.getElementById('navLoginBtn');
    const navSignupBtn = document.getElementById('navSignupBtn');
    const navLogoutBtn = document.getElementById('navLogoutBtn');

    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileSignupBtn = document.getElementById('mobileSignupBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    const toggleAuthUI = (user) => {
        if (user) {
            // Logged in
            if (navLoginBtn) navLoginBtn.style.display = 'none';
            if (navSignupBtn) navSignupBtn.style.display = 'none';
            if (navLogoutBtn) navLogoutBtn.style.display = 'inline-flex';

            if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
            if (mobileSignupBtn) mobileSignupBtn.style.display = 'none';
            if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'block';

            // Check admin
            if (user.email === adminEmail) {
                if (navAdminLink) navAdminLink.style.display = 'inline-block';
                if (mobileAdminLink) mobileAdminLink.style.display = 'block';
            } else {
                if (navAdminLink) navAdminLink.style.display = 'none';
                if (mobileAdminLink) mobileAdminLink.style.display = 'none';
            }
        } else {
            // Logged out
            if (navLoginBtn) navLoginBtn.style.display = 'inline-flex';
            if (navSignupBtn) navSignupBtn.style.display = 'inline-flex';
            if (navLogoutBtn) navLogoutBtn.style.display = 'none';

            if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
            if (mobileSignupBtn) mobileSignupBtn.style.display = 'block';
            if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';

            if (navAdminLink) navAdminLink.style.display = 'none';
            if (mobileAdminLink) mobileAdminLink.style.display = 'none';
        }
    };

    // Initial session check
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        toggleAuthUI(session?.user);
    });

    // Listen for auth changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        toggleAuthUI(session?.user);
    });

    // Wire up logouts
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await supabaseClient.auth.signOut();
            showToast('Logged out successfully', 'info');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (navLogoutBtn) navLogoutBtn.addEventListener('click', handleLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
}

function openModal(id) {
    const modal = document.getElementById(id);
    const backdrop = document.querySelector('.modal-backdrop');
    if (!modal || !backdrop) return;

    backdrop.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 300);
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== CARD INTERACTIONS =====
function initCardInteractions() {
    // Course cards — show toast on click
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.course-title')?.textContent || 'Course';
            showToast(`Opening "${title}"... Course content coming soon!`, 'info');
        });
    });

    // News articles
    document.querySelectorAll('.news-featured, .news-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            if (e.target.closest('a')) return; // Let real links work
            const title = item.querySelector('h3, h4')?.textContent || 'Article';
            showToast(`Opening "${title}"... Full articles coming soon!`, 'info');
        });
    });

    // Read more links
    document.querySelectorAll('.read-more').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Full article coming soon! Stay tuned.', 'info');
        });
    });

    // View All Courses
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('More courses coming soon! Subscribe for updates.', 'info');
        });
    });

    // Review & Compare buttons
    document.querySelectorAll('.btn-review').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const toolName = btn.closest('.review-card')?.querySelector('.review-tool-name')?.textContent || 'Tool';
            showToast(`Full review for ${toolName} coming soon!`, 'info');
        });
    });

    document.querySelectorAll('.btn-compare').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const toolName = btn.closest('.review-card')?.querySelector('.review-tool-name')?.textContent || 'Tool';
            showToast(`Compare feature for ${toolName} coming soon!`, 'info');
        });
    });

    // Footer links
    document.querySelectorAll('.footer-col a, .footer-social a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('This link will be available soon!', 'info');
        });
    });
}

// ===== TOAST NOTIFICATION SYSTEM =====
function initToastSystem() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toastContainer';
    document.body.appendChild(container);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('visible'));

    // Close on click
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
    });

    // Auto dismiss
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// ===== LOAD ADMIN DATA =====
async function loadAdminData() {
    try {
        // 1. Courses
        const { data: courses, error: errCourses } = await supabaseClient.from('courses').select('*').order('created_at', { ascending: false });
        if (errCourses) throw errCourses;
        const coursesGrid = document.querySelector('.courses-grid');
        if (coursesGrid && courses && courses.length > 0) {
            let coursesHTML = '';
            courses.forEach(course => {
                coursesHTML += `
                <div class="course-card reveal" style="position:relative;">
                    <span class="course-badge" style="background:var(--accent);color:#000;top:10px;right:10px;z-index:2;position:absolute;">New</span>
                    <a href="${course.yt_url}" target="_blank" style="display:block;">
                        <div class="course-img-wrap">
                            <img src="${course.thumbnail_url}" alt="${course.title}" loading="lazy">
                        </div>
                        <div class="course-body">
                            <h3 class="course-title">${course.title}</h3>
                            <p class="course-desc">${course.desc}</p>
                            <div class="course-meta">
                                <div class="course-rating">
                                    <div class="stars" data-rating="${course.rating}"></div>
                                    <span class="rating-num">${course.rating}</span>
                                </div>
                                <span class="course-students">${course.lessons}</span>
                            </div>
                        </div>
                    </a>
                </div>
            `;
            });
            // Prepend to grid
            coursesGrid.insertAdjacentHTML('afterbegin', coursesHTML);
        }

        // 2. Articles
        const { data: articles, error: errArticles } = await supabaseClient.from('articles').select('*').order('created_at', { ascending: false });
        if (errArticles) throw errArticles;
        const newsSidebar = document.querySelector('.news-sidebar');
        if (newsSidebar && articles && articles.length > 0) {
            let articlesHTML = '';
            articles.forEach(article => {
                articlesHTML += `
                <article class="news-item reveal-right">
                    <img src="${article.image}" alt="${article.title}" loading="lazy">
                    <div class="news-item-body">
                        <span class="news-tag-sm">${article.tag}</span>
                        <h4>${article.title}</h4>
                        <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px;">${article.summary}</p>
                    </div>
                </article>
            `;
            });
            newsSidebar.insertAdjacentHTML('afterbegin', articlesHTML);
        }

        // 3. Reviews
        const { data: reviews, error: errReviews } = await supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });
        if (errReviews) throw errReviews;
        const reviewsGrid = document.querySelector('.reviews-grid');
        if (reviewsGrid && reviews && reviews.length > 0) {
            let reviewsHTML = '';
            reviews.forEach(review => {
                reviewsHTML += `
                <div class="review-card reveal-scale">
                    <div class="review-icon">
                        <div class="tool-logo" style="background:${review.color}; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:1.5rem; text-transform:uppercase;">
                            ${review.tool.charAt(0)}
                        </div>
                    </div>
                    <h3 class="review-tool-name">${review.tool}</h3>
                    <div class="review-rating">
                        <div class="stars" data-rating="${review.rating}"></div>
                        <span class="rating-num">${review.rating}/5</span>
                    </div>
                    <p class="review-desc">${review.desc}</p>
                    <div class="review-actions">
                        <a href="${review.link}" target="_blank" class="btn-review">Visit Site</a>
                    </div>
                </div>
            `;
            });
            reviewsGrid.insertAdjacentHTML('afterbegin', reviewsHTML);
        }

        // Re-init stars and reveal animations for dynamically added elements
        setTimeout(() => {
            initStars();
            initScrollReveal();
        }, 100);
    } catch (error) {
        console.error('Error fetching admin data from Supabase:', error);
    }
}
