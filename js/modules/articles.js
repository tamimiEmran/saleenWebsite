// js/modules/articles.js
const Articles = (function() {
    let currentView = 'list';
    let currentArticle = null;
    
    function show() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="card wide-card" id="articlesSection">
                <button class="back-button" onclick="Navigation.show('menu')">← Back to Main Menu</button>
                <div id="articlesContent"></div>
            </div>
        `;
        
        showList();
    }
    
    function showList() {
        currentView = 'list';
        const content = document.getElementById('articlesContent');
        const articles = AppState.articles.getAll();
        
        content.innerHTML = `
            <h2>📝 Our Article Collection</h2>
            
            <div class="concept-suggestions" id="conceptSuggestions">
                ${renderConceptSelector()}
            </div>
            
            <button onclick="Articles.showForm()">✍️ Write New Article</button>
            <button onclick="Articles.randomConcept()">🎲 Random Concept</button>
            
            <div id="articlesList" class="articles-grid">
                ${articles.length ? articles.map(renderArticleCard).join('') : 
                  '<p style="text-align: center; color: #666;">No articles yet. Start writing your first one! ✍️</p>'}
            </div>
        `;
    }
    
    function renderConceptSelector() {
        const concepts = AppState.concepts.getAll();
        const selected = AppState.concepts.getSelected();
        
        return `
            <h3>💡 Concept Suggestions</h3>
            <p>Select multiple topics to write about! Click to add to your selection.</p>
            <div class="suggestion-tags">
                ${concepts.map(c => `
                    <div class="tag ${selected.includes(c) ? 'selected' : ''}" 
                         onclick="Articles.toggleConcept('${c.replace(/'/g, "\\'")}')">${c}</div>
                `).join('')}
            </div>
            <div class="selected-concepts">
                <p><strong>Selected concepts:</strong> 
                   <span id="selectedList">${selected.length ? selected.join(', ') : 'None selected'}</span>
                </p>
            </div>
            <div style="margin-top: 15px;">
                <button onclick="Articles.addNewConcept()" style="background: linear-gradient(45deg, #4ecdc4, #44a08d);">
                    ➕ Add New Concept
                </button>
                <button onclick="Articles.useSelected()" style="background: linear-gradient(45deg, #ff6b6b, #ee5a6f);">
                    ✍️ Write with Selected
                </button>
            </div>
        `;
    }
    
    function renderArticleCard(article) {
        return `
            <div class="article-card">
                <h3>${article.title}</h3>
                <p><strong>Concept:</strong> ${article.concept}</p>
                <p><strong>Date:</strong> ${article.date}</p>
                ${article.lastEdited ? `<p><strong>Last Edited:</strong> ${article.lastEdited}</p>` : ''}
                <p>${article.content.substring(0, 150)}${article.content.length > 150 ? '...' : ''}</p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="Articles.viewArticle(${article.id})">📖 Read Full Article</button>
                    <button onclick="Articles.editArticle(${article.id})" style="background: linear-gradient(45deg, #ffecd2, #fcb69f);">✏️ Edit</button>
                </div>
            </div>
        `;
    }
    
    function showForm(article = null) {
        currentView = 'form';
        currentArticle = article;
        const content = document.getElementById('articlesContent');
        const selected = AppState.concepts.getSelected();
        
        content.innerHTML = `
            <button onclick="Articles.showList()" class="back-button">← Back to Articles</button>
            
            <div class="article-form">
                <h3>${article ? '✏️ Edit Article' : '✍️ Write New Article'}</h3>
                <input type="text" id="articleTitle" placeholder="Article Title" 
                       value="${article ? article.title : ''}" />
                <input type="text" id="articleConcept" placeholder="Concept/Topic" 
                       value="${article ? article.concept : selected.join(', ')}" />
                <textarea id="articleContent" placeholder="Start writing your thoughts here...">${article ? article.content : ''}</textarea>
                <button onclick="Articles.saveArticle(${article ? article.id : null})">💾 ${article ? 'Save Changes' : 'Save Article'}</button>
                <button onclick="Articles.showList()" style="background: #6c757d;">Cancel</button>
            </div>
        `;
        
        // REMOVED THE THREE PROBLEMATIC LINES THAT WERE CAUSING THE ERROR
    }
    
    function saveArticle(id = null) {
        const title = document.getElementById('articleTitle').value;
        const concept = document.getElementById('articleConcept').value;
        const content = document.getElementById('articleContent').value;
        
        if (!title || !content) {
            Utils.notify('Please fill in at least the title and content!', 'warning');
            return;
        }
        
        if (id) {
            // Update existing
            AppState.articles.update(id, { title, concept, content });
            Utils.notify('Article updated successfully! ✨', 'success');
        } else {
            // Create new
            AppState.articles.add({
                id: Date.now(),
                title,
                concept,
                content,
                date: new Date().toLocaleDateString(),
                notes: []
            });
            Utils.notify('Article saved! 📝✨', 'success');
        }
        
        AppState.concepts.clearSelection();
        showList();
    }
    
    function viewArticle(id) {
        const article = AppState.articles.getById(id);
        if (!article) return;
        
        currentView = 'view';
        currentArticle = article;
        const content = document.getElementById('articlesContent');
        
        content.innerHTML = `
            <button onclick="Articles.showList()" class="back-button">← Back to Articles</button>
            
            <div class="article-header">
                <h2>${article.title}</h2>
                <p><strong>Concept:</strong> ${article.concept}</p>
                <p><strong>Date:</strong> ${article.date}</p>
                ${article.lastEdited ? `<p><strong>Last Edited:</strong> ${article.lastEdited}</p>` : ''}
            </div>
            
            <div class="article-content">
                ${article.content.split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>
            
            <div class="article-actions">
                <button onclick="Articles.editArticle(${article.id})" class="edit-btn">✏️ Edit Article</button>
            </div>
        `;
    }
    
    function editArticle(id) {
        const article = AppState.articles.getById(id);
        if (article) {
            showForm(article);
        }
    }
    
    function toggleConcept(concept) {
        AppState.concepts.toggleSelection(concept);
        showList();
    }
    
    function randomConcept() {
        const concepts = AppState.concepts.getAll();
        const random = concepts[Math.floor(Math.random() * concepts.length)];
        toggleConcept(random);
    }
    
    async function addNewConcept() {
        const newConcept = await Utils.showModal('Enter a new concept to add to the permanent list:', 'Enter concept name...');
        
        if (newConcept && newConcept.trim()) {
            const trimmed = newConcept.trim();
            AppState.concepts.add(trimmed);
            Utils.notify(`"${trimmed}" has been added to your concept list! 🎉`, 'success');
            showList();
        }
    }
    
    function useSelected() {
        const selected = AppState.concepts.getSelected();
        if (selected.length === 0) {
            Utils.notify('Please select at least one concept first! 💡', 'warning');
            return;
        }
        showForm();
    }
    
    // Public API
    return {
        show,
        showList,
        showForm,
        saveArticle,
        viewArticle,
        editArticle,
        toggleConcept,
        randomConcept,
        addNewConcept,
        useSelected
    };
})();