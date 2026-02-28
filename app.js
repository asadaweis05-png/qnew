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
    initWaitlistForm();
});

// Global state for courses
let allCourses = [];

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
    if (!navbar) return;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
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

    overlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
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

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#' || href.startsWith('#modal')) return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
                const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== NEWSLETTER =====
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('emailInput');
        const btn = form.querySelector('.btn-subscribe');

        btn.classList.add('success');
        btn.innerHTML = '✓ Subscribed!';
        input.value = '';
        input.disabled = true;

        setTimeout(() => {
            btn.classList.remove('success');
            btn.textContent = 'Subscribe';
            input.disabled = false;
        }, 3500);
    });
}

// ===== MODALS =====
function initModals() {
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
    // Stop video if it's playing
    const player = document.getElementById('mainVideoPlayer');
    if (player) player.src = '';
}

// ===== CARD INTERACTIONS =====
function initCardInteractions() {
    // Other interactions can go here
}

// ===== TOAST SYSTEM =====
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
    toast.className = `toast toast-${type} visible`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===== LOAD ADMIN DATA =====
async function loadAdminData() {
    try {
        // 1. Courses
        const { data: courses, error: errCourses } = await supabaseClient.from('courses').select('*').order('created_at', { ascending: false });
        if (errCourses) throw errCourses;
        allCourses = courses || [];

        const coursesGrid = document.querySelector('.courses-grid');
        if (coursesGrid && allCourses.length > 0) {
            let coursesHTML = '';
            allCourses.forEach(course => {
                coursesHTML += `
                <div class="course-card reveal" onclick="openWaitlistModal('${course.id}')" style="cursor:pointer;">
                    <span class="course-badge">Course</span>
                    <div class="course-img-wrap">
                        <img src="${course.thumbnail_url || course.thumbnailUrl}" alt="${course.title}" loading="lazy">
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
                </div>
            `;
            });
            coursesGrid.insertAdjacentHTML('afterbegin', coursesHTML);
        }

        // 2. Articles 
        const { data: articles } = await supabaseClient.from('articles').select('*').order('created_at', { ascending: false });
        const newsSidebar = document.querySelector('.news-sidebar');
        if (newsSidebar && articles && articles.length > 0) {
            let articlesHTML = '';
            articles.forEach(article => {
                articlesHTML += `
                <article class="news-item reveal-right">
                    <img src="${article.image}" alt="${article.title}">
                    <div class="news-item-body">
                        <span class="news-tag-sm">${article.tag}</span>
                        <h4>${article.title}</h4>
                        <p style="font-size:0.8rem;color:var(--text-secondary);">${article.summary}</p>
                    </div>
                </article>
                `;
            });
            newsSidebar.insertAdjacentHTML('afterbegin', articlesHTML);
        }

        // 3. Reviews
        const { data: reviews } = await supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });
        const reviewsGrid = document.querySelector('.reviews-grid');
        if (reviewsGrid && reviews && reviews.length > 0) {
            let reviewsHTML = '';
            reviews.forEach(review => {
                reviewsHTML += `
                <div class="review-card reveal-scale">
                    <h3 class="review-tool-name">${review.tool}</h3>
                    <div class="review-rating"><div class="stars" data-rating="${review.rating}"></div></div>
                    <p class="review-desc">${review.desc}</p>
                    <a href="${review.link}" target="_blank" class="btn-review">Visit Site</a>
                </div>
                `;
            });
            reviewsGrid.insertAdjacentHTML('afterbegin', reviewsHTML);
        }

        setTimeout(() => {
            initStars();
            initScrollReveal();
        }, 100);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// ===== WAITLIST LOGIC =====
window.openWaitlistModal = function (courseId) {
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    const modal = document.getElementById('courseWaitlistModal');
    const titleEl = document.getElementById('waitlistCourseTitle');
    const idInput = document.getElementById('waitlistCourseId');

    titleEl.textContent = course.title;
    idInput.value = courseId;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

function initWaitlistForm() {
    const form = document.getElementById('waitlistForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('waitlistSubmit');
        const courseId = document.getElementById('waitlistCourseId').value;
        const name = document.getElementById('waitlistName').value;
        const email = document.getElementById('waitlistEmail').value;

        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Diridda... / Sending...';

        try {
            const { error } = await supabaseClient
                .from('course_waitlist')
                .insert([{ course_id: courseId, name: name, email: email }]);

            if (error) throw error;

            showToast('Waad ku mahadsantahay! Email ayaa laguugu soo diri doonaa.', 'success');
            closeAllModals();
            form.reset();
        } catch (err) {
            console.error(err);
            showToast('Khalad ayaa dhacay. Fadlan markale isku day.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.querySelector('span').textContent = 'Ku soo biir / Join Waitlist';
        }
    });
}

// ===== COURSE PLAYER LOGIC (Reserved for later) =====
window.openCoursePlayer = async function (courseId) {
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    const modal = document.getElementById('coursePlayerModal');
    const playlistContainer = document.getElementById('lessonPlaylist');
    const courseTitleEl = document.getElementById('currentCourseTitle');

    courseTitleEl.textContent = course.title;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    playlistContainer.innerHTML = '<div class="loader-small">Loading lessons...</div>';

    try {
        const { data: lessons, error } = await supabaseClient
            .from('course_lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order_index', { ascending: true });

        if (error) throw error;

        if (!lessons || lessons.length === 0) {
            playlistContainer.innerHTML = `
                <div class="playlist-item active" onclick="playLesson('${course.video_id}', 'Introduction')">
                    <span class="playlist-item-num">1</span>
                    <span class="playlist-item-title">Main Introduction</span>
                </div>
            `;
            playLesson(course.video_id, 'Introduction');
        } else {
            playlistContainer.innerHTML = lessons.map((lesson, index) => `
                <div class="playlist-item ${index === 0 ? 'active' : ''}" onclick="playLesson('${lesson.video_id}', '${lesson.title}', this)">
                    <span class="playlist-item-num">${index + 1}</span>
                    <span class="playlist-item-title">${lesson.title}</span>
                </div>
            `).join('');
            playLesson(lessons[0].video_id, lessons[0].title);
        }
    } catch (error) {
        console.error(error);
        showToast('Error loading lessons', 'error');
    }
};

window.playLesson = function (videoId, title, element) {
    const player = document.getElementById('mainVideoPlayer');
    const titleEl = document.getElementById('currentLessonTitle');

    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    titleEl.textContent = title;

    if (element) {
        document.querySelectorAll('.playlist-item').forEach(item => item.classList.remove('active'));
        element.classList.add('active');
    }
};

// Utils & Extras...
function initBackToTop() { }
function initTiltCards() { }
function initCountUp() { }
function initMagneticButtons() { }
function initTypewriter() { }
function initHeroParallax() { }
function initActiveNavHighlight() { }
function initSupabaseAuth() { }
