// js/modules/articles.js
var Articles = (function() {
    let currentView = 'list';
    let currentArticle = null;
    
    function show() {
        showList();
    }
    
    function showList() {
        currentView = 'list';
        document.getElementById('articlesListView').classList.remove('hidden');
        document.getElementById('articleFormView').classList.add('hidden');
        document.getElementById('singleArticleView').classList.add('hidden');

        renderConceptSelector();

        const articles = AppState.articles.getAll();
        const listEl = document.getElementById('articlesList');
        if (listEl) {
            listEl.innerHTML = articles.length
                ? articles.map(renderArticleCard).join('')
                : '<p class="no-articles-msg">No articles yet. Start writing your first one! ✍️</p>';
        }
    }
    
    function renderConceptSelector() {
        const concepts = AppState.concepts.getAll();
        const selected = AppState.concepts.getSelected();

        const tagsEl = document.getElementById('conceptTags');
        if (tagsEl) {
            tagsEl.innerHTML = concepts.map(c => `
                <button class="concept-chip ${selected.includes(c) ? 'selected' : ''}"
                        onclick="Articles.toggleConcept('${c.replace(/'/g, "\\'")}')"
                        aria-pressed="${selected.includes(c)}">
                    ${c}
                </button>
            `).join('');
        }

        const selectedList = document.getElementById('selectedList');
        if (selectedList) {
            selectedList.textContent = selected.length ? selected.join(', ') : 'None selected';
        }
    }

    function updateSelectedList() {
        const selected = AppState.concepts.getSelected();
        const selectedList = document.getElementById('selectedList');
        if (selectedList) {
            selectedList.textContent = selected.length ? selected.join(', ') : 'None selected';
        }
    }
    
    function renderArticleCard(article) {
        return `
            <div class="article-card">
                <h3>${article.title}</h3>
                <p><strong>Concept:</strong> ${article.concept}</p>
                <p><strong>Date:</strong> ${article.date}</p>
                ${article.lastEdited ? `<p><strong>Last Edited:</strong> ${article.lastEdited}</p>` : ''}
                <p>${article.content.substring(0, 150)}${article.content.length > 150 ? '...' : ''}</p>
                <div class="article-card-actions">
                    <button onclick="Articles.viewArticle(${article.id})" class="btn btn-primary">📖 Read Full Article</button>
                    <button onclick="Articles.editArticle(${article.id})" class="btn btn-secondary edit-article-btn">✏️ Edit</button>
                </div>
            </div>
        `;
    }
    
    function showForm(article = null) {
        currentView = 'form';
        currentArticle = article;
        document.getElementById('articlesListView').classList.add('hidden');
        document.getElementById('articleFormView').classList.remove('hidden');
        document.getElementById('singleArticleView').classList.add('hidden');

        const selected = AppState.concepts.getSelected();

        document.getElementById('formTitle').textContent = article ? '✏️ Edit Article' : '✍️ Write New Article';
        document.getElementById('articleTitle').value = article ? article.title : '';
        document.getElementById('articleConcept').value = article ? article.concept : selected.join(', ');
        document.getElementById('articleContent').value = article ? article.content : '';
    }
    
    function saveArticle() {
        const title = document.getElementById('articleTitle').value;
        const concept = document.getElementById('articleConcept').value;
        const content = document.getElementById('articleContent').value;
        
        if (!title || !content) {
            Utils.notify('Please fill in at least the title and content!', 'warning');
            return;
        }
        
        if (currentArticle) {
            // Update existing
            AppState.articles.update(currentArticle.id, { title, concept, content });
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

        document.getElementById('articlesListView').classList.add('hidden');
        document.getElementById('articleFormView').classList.add('hidden');
        document.getElementById('singleArticleView').classList.remove('hidden');

        document.getElementById('viewTitle').textContent = article.title;
        document.getElementById('viewConcept').textContent = article.concept;
        document.getElementById('viewDate').textContent = article.date;

        const lastEditedRow = document.getElementById('lastEditedRow');
        if (article.lastEdited) {
            lastEditedRow.classList.remove('hidden');
            document.getElementById('viewLastEdited').textContent = article.lastEdited;
        } else {
            lastEditedRow.classList.add('hidden');
        }

        document.getElementById('viewContent').innerHTML = article.content.split('\n').map(p => `<p>${p}</p>`).join('');
    }
    
    function editArticle(id) {
        const articleId = id != null ? id : (currentArticle ? currentArticle.id : null);
        const article = AppState.articles.getById(articleId);
        if (article) {
            showForm(article);
        }
    }
    
    function toggleConcept(concept) {
        AppState.concepts.toggleSelection(concept);
        const chips = document.querySelectorAll('.concept-chip');
        chips.forEach(chip => {
            if (chip.textContent.trim() === concept) {
                const selected = chip.classList.toggle('selected');
                chip.setAttribute('aria-pressed', selected);
            }
        });
        updateSelectedList();
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