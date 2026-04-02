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
    reviews: 'reviews',
    lessons: 'course_lessons'
};

// We will hold local copies of data for fast rendering
let adminData = {
    courses: [],
    articles: [],
    reviews: [],
    currentLessons: []
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
    if (document.getElementById('stat-courses')) document.getElementById('stat-courses').textContent = `${adminData.courses.length} Courses`;
    if (document.getElementById('stat-articles')) document.getElementById('stat-articles').textContent = `${adminData.articles.length} Articles`;
    if (document.getElementById('stat-reviews')) document.getElementById('stat-reviews').textContent = `${adminData.reviews.length} Reviews`;
}

function createEmptyState(message) {
    return `<div class="admin-empty">${message}</div>`;
}

// Render Courses
function renderCourses() {
    const list = document.getElementById('courses-list');
    if (!list) return;
    const courses = adminData.courses;

    if (courses.length === 0) {
        list.innerHTML = createEmptyState('No courses added yet.');
        return;
    }

    list.innerHTML = courses.map(course => `
        <div class="admin-item-card">
            <img src="${course.thumbnail_url || course.thumbnailUrl}" alt="${course.title}" class="admin-item-img">
            <h4 class="admin-item-title">${course.title}</h4>
            <p class="admin-item-desc">${course.desc}</p>
            <div class="admin-item-meta">
                <span>⭐ ${course.rating}</span>
                <span>${course.lessons}</span>
            </div>
            <div class="admin-item-actions">
                <button class="btn-icon btn-edit" onclick="editCourse('${course.id}')">Edit</button>
                <button class="btn-icon btn-lessons-manage" onclick="openLessonsModal('${course.id}')">Lessons</button>
                <button class="btn-icon btn-delete" onclick="deleteItem('${TABLE_NAMES.courses}', 'courses', '${course.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Render Articles
function renderArticles() {
    const list = document.getElementById('articles-list');
    if (!list) return;
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
    if (!list) return;
    const reviews = adminData.reviews;

    if (reviews.length === 0) {
        list.innerHTML = createEmptyState('No reviews added yet.');
        return;
    }

    list.innerHTML = reviews.map(review => `
        <div class="admin-item-card">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: ${review.color || '#3b82f6'}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 1.2rem; margin-bottom: 8px;">
                ${(review.tool || 'T').charAt(0).toUpperCase()}
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
        const btn = document.getElementById(`${type}-cancel`);
        if (btn) btn.addEventListener('click', () => resetForm(type));
    };

    setupCancel('course');
    setupCancel('article');
    setupCancel('review');

    const courseForm = document.getElementById('course-form');
    if (courseForm) courseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('course-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            const id = document.getElementById('course-id').value;
            const yt_url = document.getElementById('course-yt-url').value;
            const video_id = extractYouTubeId(yt_url);

            if (!video_id) {
                showToast('Invalid main video URL', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = id ? 'Update Course' : 'Save Course';
                return;
            }

            // Gather Lessons from Builder
            const lessonRows = document.querySelectorAll('.lesson-row');
            const lessonsToSave = [];
            let isValid = true;

            lessonRows.forEach((row, index) => {
                const title = row.querySelector('.lesson-row-title').value;
                const url = row.querySelector('.lesson-row-url').value;
                const vId = extractYouTubeId(url);
                
                if (!title || !vId) {
                    isValid = false;
                    row.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                } else {
                    row.style.borderColor = 'var(--admin-border)';
                    lessonsToSave.push({ title, video_id: vId, order_index: index });
                }
            });

            if (!isValid) {
                showToast('Please fix invalid lessons (red borders)', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Course & Lessons';
                return;
            }

            const courseData = {
                yt_url,
                video_id,
                thumbnail_url: `https://img.youtube.com/vi/${video_id}/hqdefault.jpg`,
                title: document.getElementById('course-title').value,
                lessons: `${lessonsToSave.length} Lessons`,
                rating: document.getElementById('course-rating').value,
                desc: document.getElementById('course-desc').value
            };

            // 1. Save Course
            let courseId = id;
            if (id) {
                const { error } = await supabaseClient.from(TABLE_NAMES.courses).update(courseData).eq('id', id);
                if (error) throw error;
            } else {
                const { data, error } = await supabaseClient.from(TABLE_NAMES.courses).insert([courseData]).select();
                if (error) throw error;
                courseId = data[0].id;
            }

            // 2. Clear and Save Lessons (Simpler for consistency)
            await supabaseClient.from(TABLE_NAMES.lessons).delete().eq('course_id', courseId);
            if (lessonsToSave.length > 0) {
                const lessonsWithId = lessonsToSave.map(l => ({ ...l, course_id: courseId }));
                const { error: lError } = await supabaseClient.from(TABLE_NAMES.lessons).insert(lessonsWithId);
                if (lError) throw lError;
            }

            showToast(id ? 'Course updated' : 'Course created successfully', 'success');
            resetForm('course');
            await fetchData(TABLE_NAMES.courses, 'courses');
            renderCourses();
        } catch (error) {
            console.error(error);
            showToast('Error saving project', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Course & Lessons';
        }
    });

    // Article Form
    const articleForm = document.getElementById('article-form');
    if (articleForm) articleForm.addEventListener('submit', async (e) => {
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
                summary: document.getElementById('article-summary').value
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
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) reviewForm.addEventListener('submit', async (e) => {
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
                desc: document.getElementById('review-desc').value
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

// --- LESSON BUILDER LOGIC ---

window.addLessonRow = function (data = { title: '', video_id: '' }) {
    const list = document.getElementById('dynamic-lessons-list');
    const hint = document.getElementById('no-lessons-hint');
    if (hint) hint.style.display = 'none';

    const urlValue = data.video_id ? `https://www.youtube.com/watch?v=${data.video_id}` : '';
    
    const row = document.createElement('div');
    row.className = 'lesson-row';
    row.style = `
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 12px;
        background: rgba(255,255,255,0.02);
        padding: 12px;
        border-radius: 10px;
        border: 1px solid var(--admin-border);
        animation: fadeIn 0.3s ease;
    `;
    
    row.innerHTML = `
        <input type="text" placeholder="Lesson Title" class="lesson-row-title" value="${data.title}" required style="padding: 10px; font-size: 0.9rem;">
        <input type="url" placeholder="YouTube URL" class="lesson-row-url" value="${urlValue}" required style="padding: 10px; font-size: 0.9rem;">
        <button type="button" class="btn-icon btn-delete" onclick="removeLessonRow(this)" style="width: 40px; height: 40px;">
            &times;
        </button>
    `;
    
    list.appendChild(row);
};

window.removeLessonRow = function (btn) {
    const row = btn.parentElement;
    row.style.opacity = '0';
    row.style.transform = 'scale(0.9)';
    setTimeout(() => {
        row.remove();
        const list = document.getElementById('dynamic-lessons-list');
        const hint = document.getElementById('no-lessons-hint');
        if (list.children.length === 0 && hint) hint.style.display = 'block';
    }, 200);
};

// Side effect: Automatically Sync Course Lessons Count
async function updateCourseLessonsCount(courseId) {
    try {
        const { count, error } = await supabaseClient
            .from(TABLE_NAMES.lessons)
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId);

        if (error) throw error;

        const countText = `${count} Lessons`;
        const { error: updateError } = await supabaseClient
            .from(TABLE_NAMES.courses)
            .update({ lessons: countText })
            .eq('id', courseId);

        if (updateError) throw updateError;
        
        // Refresh local course data
        await fetchData(TABLE_NAMES.courses, 'courses');
        renderCourses();
    } catch (e) {
        console.error('Error updating course count:', e);
    }
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

// --- LESSONS MANAGEMENT ---

window.openLessonsModal = async function (courseId) {
    const course = adminData.courses.find(c => c.id === courseId);
    if (!course) return;

    document.getElementById('lesson-course-id').value = courseId;
    document.getElementById('lessons-modal-title').textContent = `Lessons for: ${course.title}`;
    document.getElementById('lessons-modal').classList.add('active');

    await fetchLessons(courseId);
};

window.closeLessonsModal = function () {
    document.getElementById('lessons-modal').classList.remove('active');
    resetLessonForm();
};

async function fetchLessons(courseId) {
    const listContainer = document.getElementById('lessons-list');
    listContainer.innerHTML = '<div class="admin-empty">Loading lessons...</div>';

    try {
        const { data, error } = await supabaseClient
            .from(TABLE_NAMES.lessons)
            .select('*')
            .eq('course_id', courseId)
            .order('order_index', { ascending: true });

        if (error) throw error;
        adminData.currentLessons = data || [];
        renderLessons();
    } catch (error) {
        console.error(error);
        showToast('Error fetching lessons', 'error');
    }
}

function renderLessons() {
    const listContainer = document.getElementById('lessons-list');
    const lessons = adminData.currentLessons;

    if (lessons.length === 0) {
        listContainer.innerHTML = createEmptyState('No lessons added for this course.');
        return;
    }

    listContainer.innerHTML = lessons.map(lesson => `
        <div class="lesson-item">
            <div class="lesson-info">
                <span class="lesson-title">${lesson.title}</span>
                <span class="lesson-meta">Video ID: ${lesson.video_id}</span>
            </div>
            <div class="lesson-actions">
                <button class="btn-lesson-sm btn-edit" onclick="editLesson('${lesson.id}')">Edit</button>
                <button class="btn-lesson-sm btn-delete" onclick="deleteLesson('${lesson.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

window.editLesson = function (id) {
    const lesson = adminData.currentLessons.find(l => l.id === id);
    if (!lesson) return;

    document.getElementById('lesson-id').value = lesson.id;
    document.getElementById('lesson-title').value = lesson.title;
    document.getElementById('lesson-yt-url').value = `https://www.youtube.com/watch?v=${lesson.video_id}`;

    document.getElementById('lesson-submit').textContent = 'Update Lesson';
    document.getElementById('lesson-cancel-edit').style.display = 'block';
};

window.deleteLesson = async function (id) {
    if (!confirm('Delete this lesson?')) return;

    const courseId = document.getElementById('lesson-course-id').value;
    try {
        const { error } = await supabaseClient.from(TABLE_NAMES.lessons).delete().eq('id', id);
        if (error) throw error;
        showToast('Lesson deleted', 'info');
        await fetchLessons(courseId);
        await updateCourseLessonsCount(courseId);
    } catch (error) {
        console.error(error);
        showToast('Error deleting lesson', 'error');
    }
};

window.resetLessonForm = function () {
    document.getElementById('lesson-form').reset();
    document.getElementById('lesson-id').value = '';
    document.getElementById('lesson-submit').textContent = 'Save Lesson';
    document.getElementById('lesson-cancel-edit').style.display = 'none';
};

// --- BULK IMPORT & SEEDING ---

window.handleBulkImport = async function () {
    const input = document.getElementById('bulk-lessons-input').value;
    const courseId = document.getElementById('lesson-course-id').value;

    if (!input.trim()) {
        showToast('Please enter some lessons first', 'error');
        return;
    }

    const lines = input.split('\n').filter(l => l.trim().includes('|'));
    if (lines.length === 0) {
        showToast('Invalid format. Use: Title | URL', 'error');
        return;
    }

    showToast(`Importing ${lines.length} lessons...`, 'info');

    const lessonsToInsert = lines.map((line, index) => {
        const [title, url] = line.split('|').map(s => s.trim());
        const videoId = extractYouTubeId(url);
        if (!videoId) return null;
        return {
            course_id: courseId,
            title,
            video_id: videoId,
            order_index: adminData.currentLessons.length + index
        };
    }).filter(l => l !== null);

    try {
        const { error } = await supabaseClient.from(TABLE_NAMES.lessons).insert(lessonsToInsert);
        if (error) throw error;
        
        showToast(`Successfully imported ${lessonsToInsert.length} lessons`, 'success');
        document.getElementById('bulk-lessons-input').value = '';
        await fetchLessons(courseId);
        await updateCourseLessonsCount(courseId);
    } catch (error) {
        console.error(error);
        showToast('Error during bulk import', 'error');
    }
};

window.seedCommonLessons = function () {
    const seeds = [
        "Lesson 1: Introduction to AI | https://www.youtube.com/watch?v=ad79nYk2kEg",
        "Lesson 2: What is Prompt Engineering? | https://www.youtube.com/watch?v=RPmshfF9f30",
        "Lesson 3: Advanced ChatGPT Techniques | https://www.youtube.com/watch?v=0e3G69vsczQ",
        "Lesson 4: How Large Language Models Work | https://www.youtube.com/watch?v=5sLYAQS9sWQ",
        "Lesson 5: AI Ethics and Responsibilities | https://www.youtube.com/watch?v=geSAsrX9f_s",
        "Lesson 6: Building AI Agents with Python | https://www.youtube.com/watch?v=Zp_Wun-R3y4",
        "Lesson 7: The Future of Generative AI | https://www.youtube.com/watch?v=Xv9L6qj7m6o"
    ];
    document.getElementById('bulk-lessons-input').value = seeds.join('\n');
    showToast('AI Lessons seeded. Click "Import" to save them.', 'info');
};

// --- EDITING LOGIC ---

window.editCourse = async function (id) {
    const course = adminData.courses.find(c => c.id === id);
    if (!course) return;

    // Reset and Populate Basics
    resetForm('course');
    document.getElementById('course-id').value = course.id;
    document.getElementById('course-yt-url').value = course.yt_url;
    document.getElementById('course-title').value = course.title;
    document.getElementById('course-rating').value = course.rating;
    document.getElementById('course-desc').value = course.desc;

    // Fetch and Populate Lessons in Builder
    const list = document.getElementById('dynamic-lessons-list');
    list.innerHTML = ''; // Clear
    
    try {
        const { data: lessons, error } = await supabaseClient
            .from(TABLE_NAMES.lessons)
            .select('*')
            .eq('course_id', id)
            .order('order_index', { ascending: true });
        
        if (!error && lessons) {
            lessons.forEach(l => addLessonRow(l));
        }
    } catch (e) {
        console.error('Error loading lessons for edit:', e);
    }

    document.getElementById('course-submit').textContent = 'Update Course & Lessons';
    const cancelBtn = document.getElementById('course-cancel');
    if (cancelBtn) cancelBtn.style.display = 'block';

    // Switch to tab
    const tabBtn = document.querySelector('[data-tab="courses-tab"]');
    if (tabBtn) tabBtn.click();
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
    const cancelBtn = document.getElementById('article-cancel');
    if (cancelBtn) cancelBtn.style.display = 'block';

    const tabBtn = document.querySelector('[data-tab="articles-tab"]');
    if (tabBtn) tabBtn.click();
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
    const cancelBtn = document.getElementById('review-cancel');
    if (cancelBtn) cancelBtn.style.display = 'block';

    const tabBtn = document.querySelector('[data-tab="reviews-tab"]');
    if (tabBtn) tabBtn.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function resetForm(type) {
    const form = document.getElementById(`${type}-form`);
    if (form) form.reset();
    const idField = document.getElementById(`${type}-id`);
    if (idField) idField.value = '';
    const submitBtn = document.getElementById(`${type}-submit`);
    if (submitBtn) submitBtn.textContent = (type === 'course') ? 'Save Course & Lessons' : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const cancelBtn = document.getElementById(`${type}-cancel`);
    if (cancelBtn) cancelBtn.style.display = 'none';

    if (type === 'course') {
        const list = document.getElementById('dynamic-lessons-list');
        if (list) list.innerHTML = '';
        const hint = document.getElementById('no-lessons-hint');
        if (hint) hint.style.display = 'block';
    }
}

// --- UTILS ---

function extractYouTubeId(url) {
    if (!url) return false;
    // Enhanced regex for multiple YT formats
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[7].length === 11) {
        return match[7];
    }
    
    // Fallback for short links / shorts
    const shortsReg = /\/shorts\/([a-zA-Z0-9_-]{11})/;
    const shortsMatch = url.match(shortsReg);
    if (shortsMatch) return shortsMatch[1];
    
    return false;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) {
        const div = document.createElement('div');
        div.id = 'toast-container';
        div.className = 'toast-container';
        document.body.appendChild(div);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-text">${message}</span>
    `;

    const toastContainer = document.getElementById('toast-container');
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
