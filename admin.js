/* ===== ADMIN DASHBOARD LOGIC ===== */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initData();
    renderAll();
    initForms();
});

// --- STATE & SUPABASE ---

const TABLE_NAMES = {
    courses: 'courses',
    articles: 'articles',
    reviews: 'reviews'
};

// We will hold local copies of data for fast rendering
let adminData = {
    courses: [],
    articles: [],
    reviews: []
};

async function initData() {
    try {
        await Promise.all([
            fetchData(TABLE_NAMES.courses, 'courses'),
            fetchData(TABLE_NAMES.articles, 'articles'),
            fetchData(TABLE_NAMES.reviews, 'reviews')
        ]);
        renderAll();
    } catch (error) {
        console.error('Error initializing data:', error);
        showToast('Error loading data from database', 'error');
    }
}

async function fetchData(table, stateKey) {
    const { data, error } = await supabaseClient
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    adminData[stateKey] = data || [];
}

// --- LOGOUT LOGIC ---
const logoutBtn = document.getElementById('adminLogoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await supabaseClient.auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error logging out:', error);
            showToast('Failed to log out', 'error');
        }
    });
}

// --- TAB NAVIGATION ---

function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const panels = document.querySelectorAll('.admin-panel');
    const pageTitle = document.getElementById('admin-page-title');

    const titles = {
        'courses-tab': 'Manage Courses',
        'articles-tab': 'Manage Articles',
        'reviews-tab': 'Manage Reviews'
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Add to clicked
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
            pageTitle.textContent = titles[targetId];
        });
    });
}

// --- RENDER LOGIC ---

function renderAll() {
    renderCourses();
    renderArticles();
    renderReviews();
    updateStats();
}

function updateStats() {
    document.getElementById('stat-courses').textContent = `${adminData.courses.length} Courses`;
    document.getElementById('stat-articles').textContent = `${adminData.articles.length} Articles`;
    document.getElementById('stat-reviews').textContent = `${adminData.reviews.length} Reviews`;
}

function createEmptyState(message) {
    return `<div class="admin-empty">${message}</div>`;
}

// Render Courses
function renderCourses() {
    const list = document.getElementById('courses-list');
    const courses = adminData.courses;

    if (courses.length === 0) {
        list.innerHTML = createEmptyState('No courses added yet.');
        return;
    }

    list.innerHTML = courses.map(course => `
        <div class="admin-item-card">
            <img src="${course.thumbnailUrl}" alt="${course.title}" class="admin-item-img">
            <h4 class="admin-item-title">${course.title}</h4>
            <p class="admin-item-desc">${course.desc}</p>
            <div class="admin-item-meta">
                <span>⭐ ${course.rating}</span>
                <span>${course.lessons}</span>
            </div>
            <div class="admin-item-actions">
                <button class="btn-icon btn-edit" onclick="editCourse('${course.id}')">Edit</button>
                <button class="btn-icon btn-delete" onclick="deleteItem('${TABLE_NAMES.courses}', 'courses', '${course.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Render Articles
function renderArticles() {
    const list = document.getElementById('articles-list');
    const articles = adminData.articles;

    if (articles.length === 0) {
        list.innerHTML = createEmptyState('No articles added yet.');
        return;
    }

    list.innerHTML = articles.map(article => `
        <div class="admin-item-card">
            <img src="${article.image}" alt="${article.title}" class="admin-item-img">
            <h4 class="admin-item-title">${article.title}</h4>
            <p class="admin-item-desc">${article.summary}</p>
            <div class="admin-item-meta">
                <span class="news-tag-sm">${article.tag}</span>
            </div>
            <div class="admin-item-actions">
                <button class="btn-icon btn-edit" onclick="editArticle('${article.id}')">Edit</button>
                <button class="btn-icon btn-delete" onclick="deleteItem('${TABLE_NAMES.articles}', 'articles', '${article.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Render Reviews
function renderReviews() {
    const list = document.getElementById('reviews-list');
    const reviews = adminData.reviews;

    if (reviews.length === 0) {
        list.innerHTML = createEmptyState('No reviews added yet.');
        return;
    }

    list.innerHTML = reviews.map(review => `
        <div class="admin-item-card">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: ${review.color}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 1.2rem; margin-bottom: 8px;">
                ${review.tool.charAt(0).toUpperCase()}
            </div>
            <h4 class="admin-item-title">${review.tool}</h4>
            <p class="admin-item-desc">${review.desc}</p>
            <div class="admin-item-meta">
                <span>⭐ ${review.rating}/5</span>
            </div>
            <div class="admin-item-actions">
                <button class="btn-icon btn-edit" onclick="editReview('${review.id}')">Edit</button>
                <button class="btn-icon btn-delete" onclick="deleteItem('${TABLE_NAMES.reviews}', 'reviews', '${review.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// --- FORM HANDLING ---

function initForms() {
    // Shared reset logic
    const setupCancel = (type) => {
        document.getElementById(`${type}-cancel`).addEventListener('click', () => {
            resetForm(type);
        });
    };

    setupCancel('course');
    setupCancel('article');
    setupCancel('review');

    // Course Form
    document.getElementById('course-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('course-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            const id = document.getElementById('course-id').value;
            const yt_url = document.getElementById('course-yt-url').value;
            const video_id = extractYouTubeId(yt_url);

            if (!video_id) {
                showToast('Invalid YouTube URL', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = id ? 'Update Course' : 'Add Course';
                return;
            }

            const courseData = {
                yt_url,
                video_id,
                thumbnail_url: `https://img.youtube.com/vi/${video_id}/hqdefault.jpg`,
                title: document.getElementById('course-title').value,
                lessons: document.getElementById('course-lessons').value,
                rating: document.getElementById('course-rating').value,
                desc: document.getElementById('course-desc').value
            };

            await saveItem(TABLE_NAMES.courses, 'courses', courseData, id);
            resetForm('course');
        } catch (error) {
            console.error(error);
            showToast('Error saving course', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Course';
        }
    });

    // Article Form
    document.getElementById('article-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('article-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            const id = document.getElementById('article-id').value;
            const articleData = {
                title: document.getElementById('article-title').value,
                tag: document.getElementById('article-tag').value,
                image: document.getElementById('article-image').value,
            };

            await saveItem(TABLE_NAMES.articles, 'articles', articleData, id);
            resetForm('article');
        } catch (error) {
            console.error(error);
            showToast('Error saving article', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Article';
        }
    });

    // Review Form
    document.getElementById('review-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('review-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            const id = document.getElementById('review-id').value;
            const reviewData = {
                tool: document.getElementById('review-tool').value,
                rating: document.getElementById('review-rating').value,
                color: document.getElementById('review-color').value,
                link: document.getElementById('review-link').value,
            };

            await saveItem(TABLE_NAMES.reviews, 'reviews', reviewData, id);
            resetForm('review');
        } catch (error) {
            console.error(error);
            showToast('Error saving review', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Review';
        }
    });
}

async function saveItem(tableName, stateKey, data, isEditId) {
    if (isEditId) {
        const { error } = await supabaseClient.from(tableName).update(data).eq('id', isEditId);
        if (error) throw error;
        showToast('Item updated successfully', 'success');
    } else {
        const { error } = await supabaseClient.from(tableName).insert([data]);
        if (error) throw error;
        showToast('Item added successfully', 'success');
    }

    // Refresh data from db to ensure it's in sync
    await fetchData(tableName, stateKey);
    renderAll();
}

window.deleteItem = async function (tableName, stateKey, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            const { error } = await supabaseClient.from(tableName).delete().eq('id', id);
            if (error) throw error;

            await fetchData(tableName, stateKey);
            renderAll();
            showToast('Item deleted', 'info');
        } catch (error) {
            console.error(error);
            showToast('Error deleting item', 'error');
        }
    }
};

// --- EDITING LOGIC ---

window.editCourse = function (id) {
    const course = adminData.courses.find(c => c.id === id);
    if (!course) return;

    document.getElementById('course-id').value = course.id;
    document.getElementById('course-yt-url').value = course.yt_url;
    document.getElementById('course-title').value = course.title;
    document.getElementById('course-lessons').value = course.lessons;
    document.getElementById('course-rating').value = course.rating;
    document.getElementById('course-desc').value = course.desc;

    document.getElementById('course-submit').textContent = 'Update Course';
    document.getElementById('course-cancel').style.display = 'block';

    // Switch to tab
    document.querySelector('[data-tab="courses-tab"]').click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.editArticle = function (id) {
    const article = adminData.articles.find(a => a.id === id);
    if (!article) return;

    document.getElementById('article-id').value = article.id;
    document.getElementById('article-title').value = article.title;
    document.getElementById('article-tag').value = article.tag;
    document.getElementById('article-image').value = article.image;
    document.getElementById('article-summary').value = article.summary;

    document.getElementById('article-submit').textContent = 'Update Article';
    document.getElementById('article-cancel').style.display = 'block';

    document.querySelector('[data-tab="articles-tab"]').click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.editReview = function (id) {
    const review = adminData.reviews.find(r => r.id === id);
    if (!review) return;

    document.getElementById('review-id').value = review.id;
    document.getElementById('review-tool').value = review.tool;
    document.getElementById('review-rating').value = review.rating;
    document.getElementById('review-color').value = review.color;
    document.getElementById('review-link').value = review.link;
    document.getElementById('review-desc').value = review.desc;

    document.getElementById('review-submit').textContent = 'Update Review';
    document.getElementById('review-cancel').style.display = 'block';

    document.querySelector('[data-tab="reviews-tab"]').click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function resetForm(type) {
    document.getElementById(`${type}-form`).reset();
    document.getElementById(`${type}-id`).value = '';
    document.getElementById(`${type}-submit`).textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    document.getElementById(`${type}-cancel`).style.display = 'none';
}

// --- UTILS ---

function extractYouTubeId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-text">${message}</span>
    `;

    // Basic toast CSS injection if not present in main css
    if (!document.getElementById('admin-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-toast-styles';
        style.textContent = `
            .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 12px; }
            .toast { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-radius: 8px; font-weight: 500; font-size: 0.95rem; animation: slideInRight 0.3s ease forwards; background: rgba(17, 24, 39, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5); color: #fff; }
            .toast-success { border-left: 4px solid #10b981; }
            .toast-error { border-left: 4px solid #ef4444; }
            .toast-info { border-left: 4px solid var(--accent); }
            @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes fadeOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
            .toast.fade-out { animation: fadeOutRight 0.3s ease forwards; }
        `;
        document.head.appendChild(style);
    }

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
