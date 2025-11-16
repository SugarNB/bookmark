class BookmarkManager {
    constructor() {
        this.bookmarks = this.loadBookmarks();
        this.categories = this.loadCategories();
        this.init();
        this.loadDefaultBookmarks();
    }

    init() {
        this.bindEvents();
        this.renderCategories();
        this.applyTheme();
    }

    bindEvents() {
        document.getElementById('addBookmark').addEventListener('click', () => this.addBookmark());
        document.getElementById('addCategory').addEventListener('click', () => this.addCategory());
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // 回车键添加书签
        document.getElementById('bookmarkUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBookmark();
        });
    }

    loadDefaultBookmarks() {
        if (this.bookmarks.length === 0) {
            const defaultBookmarks = [
                { name: "GitHub", url: "https://github.com", category: "开发" },
                { name: "Stack Overflow", url: "https://stackoverflow.com", category: "开发" },
                { name: "MDN Web Docs", url: "https://developer.mozilla.org", category: "开发" },
                { name: "BBC News", url: "https://www.bbc.com/news", category: "新闻" },
                { name: "Reuters", url: "https://www.reuters.com", category: "新闻" },
                { name: "YouTube", url: "https://www.youtube.com", category: "视频" },
                { name: "Vimeo", url: "https://vimeo.com", category: "视频" },
                { name: "DeepSeek", url: "https://www.deepseek.com", category: "AI工具" },
                { name: "Hugging Face", url: "https://huggingface.co", category: "AI工具" },
                { name: "Google AI", url: "https://ai.google", category: "AI工具" },
                { name: "CSS-Tricks", url: "https://css-tricks.com", category: "设计" },
                { name: "Dribbble", url: "https://dribbble.com", category: "设计" }
            ];

            defaultBookmarks.forEach(bookmark => {
                if (!this.bookmarks.find(b => b.url === bookmark.url)) {
                    this.bookmarks.push({
                        id: this.generateId(),
                        name: bookmark.name,
                        url: bookmark.url,
                        category: bookmark.category
                    });
                }
            });

            const defaultCategories = ["开发", "新闻", "视频", "AI工具", "设计", "其他"];
            defaultCategories.forEach(cat => {
                if (!this.categories.includes(cat)) {
                    this.categories.push(cat);
                }
            });

            this.saveBookmarks();
            this.saveCategories();
            this.renderCategories();
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addBookmark() {
        const nameInput = document.getElementById('bookmarkName');
        const urlInput = document.getElementById('bookmarkUrl');
        const categorySelect = document.getElementById('bookmarkCategory');
        
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        const category = categorySelect.value;

        if (!name || !url) {
            alert('请输入书签名称和网址');
            return;
        }

        if (!this.isValidUrl(url)) {
            alert('请输入有效的网址（以 http:// 或 https:// 开头）');
            return;
        }

        const newBookmark = {
            id: this.generateId(),
            name,
            url: this.normalizeUrl(url),
            category
        };

        this.bookmarks.push(newBookmark);
        this.saveBookmarks();
        this.renderCategories();
        
        // 清空输入框
        nameInput.value = '';
        urlInput.value = '';
    }

    addCategory() {
        const newCategoryInput = document.getElementById('newCategory');
        const categoryName = newCategoryInput.value.trim();

        if (!categoryName) {
            alert('请输入分类名称');
            return;
        }

        if (this.categories.includes(categoryName)) {
            alert('该分类已存在');
            return;
        }

        this.categories.push(categoryName);
        this.saveCategories();
        this.renderCategorySelect();
        newCategoryInput.value = '';
    }

    deleteBookmark(id) {
        if (confirm('确定要删除这个书签吗？')) {
            this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
            this.saveBookmarks();
            this.renderCategories();
        }
    }

    deleteCategory(categoryName) {
        if (confirm(`确定要删除分类"${categoryName}"吗？该分类下的所有书签也将被删除。`)) {
            // 删除该分类下的所有书签
            this.bookmarks = this.bookmarks.filter(bookmark => bookmark.category !== categoryName);
            // 删除分类
            this.categories = this.categories.filter(cat => cat !== categoryName);
            
            this.saveBookmarks();
            this.saveCategories();
            this.renderCategories();
            this.renderCategorySelect();
        }
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    }

    renderCategories() {
        const container = document.getElementById('categoriesContainer');
        container.innerHTML = '';

        // 按分类分组书签
        const bookmarksByCategory = {};
        this.categories.forEach(category => {
            bookmarksByCategory[category] = this.bookmarks.filter(b => b.category === category);
        });

        // 渲染每个分类
        this.categories.forEach(category => {
            const categoryBookmarks = bookmarksByCategory[category];
            if (categoryBookmarks.length === 0) return;

            const categoryElement = document.createElement('div');
            categoryElement.className = 'category';
            categoryElement.innerHTML = `
                <div class="category-header">
                    <h3 class="category-title">${category}</h3>
                    <button class="delete-category-btn" onclick="bookmarkManager.deleteCategory('${category}')">
                        删除分类
                    </button>
                </div>
                <div class="bookmarks-grid" id="bookmarks-${category}"></div>
            `;

            container.appendChild(categoryElement);
            this.renderBookmarks(category);
        });

        this.renderCategorySelect();
    }

    renderBookmarks(category) {
        const container = document.getElementById(`bookmarks-${category}`);
        const categoryBookmarks = this.bookmarks.filter(b => b.category === category);

        container.innerHTML = categoryBookmarks.map(bookmark => `
            <div class="bookmark-card">
                <a href="${bookmark.url}" target="_blank" class="bookmark-link">
                    <div class="bookmark-name">${bookmark.name}</div>
                    <div class="bookmark-url">${bookmark.url}</div>
                </a>
                <button class="delete-btn" onclick="bookmarkManager.deleteBookmark('${bookmark.id}')">
                    删除
                </button>
            </div>
        `).join('');
    }

    renderCategorySelect() {
        const select = document.getElementById('bookmarkCategory');
        select.innerHTML = '<option value="">选择分类</option>' +
            this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // 数据持久化方法
    loadBookmarks() {
        const saved = localStorage.getItem('bookmarks');
        return saved ? JSON.parse(saved) : [];
    }

    saveBookmarks() {
        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    }

    loadCategories() {
        const saved = localStorage.getItem('categories');
        return saved ? JSON.parse(saved) : [];
    }

    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }
}

// 初始化书签管理器
const bookmarkManager = new BookmarkManager();
