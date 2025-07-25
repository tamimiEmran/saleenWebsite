var Articles = (function() {
    let currentView = 'list';
    let currentArticle = null;
    
    function show() { showList(); }
    
    function showList() {
        currentView = 'list';
        ['articlesListView'].forEach(id => document.getElementById(id).classList.remove('hidden'));
        ['articleFormView', 'singleArticleView'].forEach(id => document.getElementById(id).classList.add('hidden'));

        const articles = AppState.articles.getAll();
        const listEl = document.getElementById('articlesList');
        listEl.innerHTML = articles.length 
            ? articles.map(renderArticleCard).join('') 
            : '<p class="no-articles-msg">No articles yet. Start by writing your first one! ✍️</p>';
    }
    
    function renderArticleCard(article) {
        const preview = article.content.substring(0, 150) + (article.content.length > 150 ? '...' : '');
        return `
            <div class="article-card" onclick="Articles.viewArticle(${article.id})">
                <h3>${article.title}</h3>
                <p><strong>Concept:</strong> ${article.concept || 'N/A'}</p>
                <p class="content-preview">${preview}</p>
                <div class="article-card-actions">
                    <button onclick="event.stopPropagation(); Articles.editArticle(${article.id})">✏️ Edit</button>
                </div>
            </div>`;
    }
    
    function showForm(article = null) {
        currentView = 'form';
        currentArticle = article;
        ['articleFormView'].forEach(id => document.getElementById(id).classList.remove('hidden'));
        ['articlesListView', 'singleArticleView'].forEach(id => document.getElementById(id).classList.add('hidden'));
        
        document.getElementById('formTitle').textContent = article ? '✏️ Edit Article' : '✍️ Write New Article';
        document.getElementById('articleTitle').value = article ? article.title : '';
        document.getElementById('articleConcept').value = article ? article.concept : '';
        document.getElementById('articleContent').value = article ? article.content : '';
        
        renderConceptHelper();
        document.getElementById('articleTitle').focus();
    }
    
    function saveArticle() {
        const title = document.getElementById('articleTitle').value.trim();
        const conceptInput = document.getElementById('articleConcept').value.trim();
        const content = document.getElementById('articleContent').value.trim();
        
        if (!title || !content) {
            Utils.notify('Please fill in both the title and content fields.', 'warning');
            return;
        }

        // Auto-add new concepts from the input field to the main list
        const conceptsInInput = conceptInput.split(',').map(c => c.trim()).filter(Boolean);
        conceptsInInput.forEach(c => AppState.concepts.add(c));
        
        if (currentArticle) {
            AppState.articles.update(currentArticle.id, { title, concept: conceptInput, content });
            Utils.notify('Article updated successfully! ✨', 'success');
        } else {
            AppState.articles.add({ id: Date.now(), title, concept: conceptInput, content, date: new Date().toLocaleDateString() });
            Utils.notify('Article saved! 📝✨', 'success');
        }
        
        showList();
    }

    function viewArticle(id) {
        const article = AppState.articles.getById(id);
        if (!article) return;

        currentView = 'view';
        currentArticle = article;
        ['singleArticleView'].forEach(id => document.getElementById(id).classList.remove('hidden'));
        ['articlesListView', 'articleFormView'].forEach(id => document.getElementById(id).classList.add('hidden'));

        document.getElementById('viewTitle').textContent = article.title;
        document.getElementById('viewConcept').textContent = article.concept || 'N/A';
        document.getElementById('viewDate').textContent = article.date;
        
        const lastEditedRow = document.getElementById('lastEditedRow');
        lastEditedRow.classList.toggle('hidden', !article.lastEdited);
        if (article.lastEdited) {
            document.getElementById('viewLastEdited').textContent = article.lastEdited;
        }
        
        document.getElementById('viewContent').innerHTML = article.content.split('\n').map(p => `<p>${p}</p>`).join('');
    }
    
    function editArticle(id) {
        const articleId = id != null ? id : (currentArticle ? currentArticle.id : null);
        if (articleId) {
            const article = AppState.articles.getById(articleId);
            if (article) showForm(article);
        }
    }

    // --- Concept Helper Functions ---

    function renderConceptHelper() {
        const allConcepts = AppState.concepts.getAll();
        const conceptInput = document.getElementById('articleConcept').value;
        const selectedConcepts = conceptInput.toLowerCase().split(',').map(c => c.trim());
        
        const tagsEl = document.getElementById('conceptTags');
        tagsEl.innerHTML = allConcepts.map(c => {
            const isSelected = selectedConcepts.includes(c.toLowerCase());
            return `<div class="tag ${isSelected ? 'selected' : ''}" onclick="Articles.toggleConcept('${c.replace(/'/g, "\\'")}')">${c}</div>`;
        }).join('');
    }

    function toggleConcept(concept) {
        const conceptInput = document.getElementById('articleConcept');
        let concepts = conceptInput.value.split(',').map(c => c.trim()).filter(Boolean);
        const conceptLower = concept.toLowerCase();
        const index = concepts.map(c => c.toLowerCase()).indexOf(conceptLower);

        if (index > -1) {
            concepts.splice(index, 1); // Remove it
        } else {
            concepts.push(concept); // Add it
        }
        
        conceptInput.value = concepts.join(', ');
        renderConceptHelper();
    }

    async function addNewConcept() {
        const newConcept = await Utils.showModal('Enter a new concept:', 'e.g., Philosophy');
        if (newConcept && newConcept.trim()) {
            const trimmed = newConcept.trim();
            AppState.concepts.add(trimmed);
            Utils.notify(`"${trimmed}" has been added to your concepts! 🎉`, 'success');
            toggleConcept(trimmed); // Add the new concept to the input
            renderConceptHelper();
        }
    }

    function randomConcept() {
        const allConcepts = AppState.concepts.getAll();
        if (allConcepts.length === 0) {
            Utils.notify("No concepts available to choose from. Add one first!", "warning");
            return;
        }
        const random = allConcepts[Math.floor(Math.random() * allConcepts.length)];
        toggleConcept(random);
    }
    
    // Public API
    return {
        show, showList, showForm, saveArticle, viewArticle, editArticle,
        renderConceptHelper, toggleConcept, addNewConcept, randomConcept
    };
})();