// Articles functionality
function renderConceptSuggestions() {
    const conceptSuggestions = document.getElementById('conceptSuggestions');
    
    // Create the concept tags
    const tagsHtml = concepts.map(concept => {
        const isSelected = selectedConcepts.includes(concept);
        return `<div class="tag ${isSelected ? 'selected' : ''}" data-concept="${concept}" onclick="toggleConcept('${concept.replace(/'/g, "\\'")}')">${concept}</div>`;
    }).join('');
    
    conceptSuggestions.innerHTML = `
        <h3>💡 Concept Suggestions</h3>
        <p>Select multiple topics to write about! Click to add to your selection.</p>
        <div class="suggestion-tags">
            ${tagsHtml}
        </div>
        <div class="selected-concepts" id="selectedConcepts" style="margin-top: 15px;">
            <p><strong>Selected concepts:</strong> <span id="selectedList">None selected</span></p>
        </div>
        <div style="margin-top: 15px;">
            <button onclick="window.addNewConcept()" style="background: linear-gradient(45deg, #4ecdc4, #44a08d); color: white; font-weight: bold;">➕ Add New Concept</button>
            <button onclick="useSelectedConcepts()" style="background: linear-gradient(45deg, #ff6b6b, #ee5a6f); color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">✍️ Write with Selected</button>
        </div>
    `;
    
    updateSelectedDisplay();
}

// Make addNewConcept a global function
window.addNewConcept = function() {
    console.log('Add new concept button clicked!'); // Debug log
    
    showCustomPrompt('Enter a new concept to add to the permanent list:', function(newConcept) {
        if (newConcept && newConcept.trim()) {
            const trimmedConcept = newConcept.trim();
            if (!concepts.includes(trimmedConcept)) {
                concepts.push(trimmedConcept);
                alert('"' + trimmedConcept + '" has been added to your concept list! 🎉');
                // Clear selections and refresh the concept suggestions display
                selectedConcepts = [];
                renderConceptSuggestions();
                
                // CRITICAL: Auto-save after adding concept
                if (typeof autoSaveToNAS === 'function') {
                    console.log('autoSaveToNAS exists, calling it now...');
                    autoSaveToNAS();
                } else {
                    console.log('autoSaveToNAS is not a function!', typeof autoSaveToNAS);
                }
            } else {
                alert('This concept already exists in your list! 📝');
            }
        }
    });
}

function toggleConcept(concept) {
    const index = selectedConcepts.indexOf(concept);
    const tag = document.querySelector(`[data-concept="${concept}"]`);
    
    if (!tag) return; // Safety check
    
    if (index > -1) {
        // Remove from selection
        selectedConcepts.splice(index, 1);
        tag.classList.remove('selected');
    } else {
        // Add to selection
        selectedConcepts.push(concept);
        tag.classList.add('selected');
    }
    
    updateSelectedDisplay();
}

function updateSelectedDisplay() {
    const selectedList = document.getElementById('selectedList');
    if (selectedConcepts.length === 0) {
        selectedList.textContent = 'None selected';
        selectedList.style.color = '#666';
    } else {
        selectedList.textContent = selectedConcepts.join(', ');
        selectedList.style.color = '#667eea';
        selectedList.style.fontWeight = 'bold';
    }
}

function useSelectedConcepts() {
    if (selectedConcepts.length === 0) {
        alert('Please select at least one concept first! 💡');
        return;
    }
    
    const conceptText = selectedConcepts.join(', ');
    document.getElementById('articleConcept').value = conceptText;
    showNewArticle();
}

function generateRandomConcept() {
    // Pick a random concept
    const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];
    
    // Toggle it (select/deselect)
    toggleConcept(randomConcept);
}

function showNewArticle() {
    document.getElementById('newArticleForm').classList.remove('hidden');
    document.getElementById('articlesList').classList.add('hidden');
    document.getElementById('conceptSuggestions').classList.add('hidden');
    // Also hide the article action buttons
    const buttons = document.querySelectorAll('#articlesSection > button');
    buttons.forEach(btn => btn.style.display = 'none');
}

function hideNewArticle() {
    document.getElementById('newArticleForm').classList.add('hidden');
    document.getElementById('articlesList').classList.remove('hidden');
    document.getElementById('conceptSuggestions').classList.remove('hidden');
    // Show the article action buttons again
    const buttons = document.querySelectorAll('#articlesSection > button');
    buttons.forEach(btn => btn.style.display = 'inline-block');
}

function saveArticle() {
    const title = document.getElementById('articleTitle').value;
    const concept = document.getElementById('articleConcept').value;
    const content = document.getElementById('articleContent').value;

    if (title && content) {
        const article = {
            id: Date.now(),
            title,
            concept,
            content,
            date: new Date().toLocaleDateString(),
            notes: []
        };
        articles.push(article);
        
        // Clear form
        document.getElementById('articleTitle').value = '';
        document.getElementById('articleConcept').value = '';
        document.getElementById('articleContent').value = '';
        
        // Clear selected concepts
        selectedConcepts = [];
        
        hideNewArticle();
        displayArticles();
        renderConceptSuggestions();
        alert('Article saved! 📝✨');
        
        // CRITICAL: Auto-save after adding article
        if (typeof autoSaveToNAS === 'function') {
            autoSaveToNAS();
        }
    } else {
        alert('Please fill in at least the title and content!');
    }
}

function displayArticles() {
    // Show concept suggestions and action buttons again
    document.getElementById('conceptSuggestions').classList.remove('hidden');
    const buttons = document.querySelectorAll('#articlesSection > button');
    buttons.forEach(btn => btn.style.display = 'inline-block');
    
    const articlesList = document.getElementById('articlesList');
    if (articles.length === 0) {
        articlesList.innerHTML = '<p style="text-align: center; color: #666;">No articles yet. Start writing your first one! ✍️</p>';
        return;
    }

    articlesList.innerHTML = articles.map(article => `
        <div class="article-card">
            <h3>${article.title}</h3>
            <p><strong>Concept:</strong> ${article.concept}</p>
            <p><strong>Date:</strong> ${article.date}</p>
            ${article.lastEdited ? `<p><strong>Last Edited:</strong> ${article.lastEdited}</p>` : ''}
            <p>${article.content.substring(0, 150)}${article.content.length > 150 ? '...' : ''}</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="viewFullArticle(${article.id})">📖 Read Full Article</button>
                <button onclick="editArticle(${article.id})" style="background: linear-gradient(45deg, #ffecd2, #fcb69f);">✏️ Edit</button>
            </div>
        </div>
    `).join('');
}

function viewFullArticle(id) {
    const article = articles.find(a => a.id === id);
    if (article) {
        showFullArticleView(article);
    }
}

function showFullArticleView(article) {
    const articlesList = document.getElementById('articlesList');
    
    // Hide concept suggestions and action buttons
    document.getElementById('conceptSuggestions').classList.add('hidden');
    const buttons = document.querySelectorAll('#articlesSection > button');
    buttons.forEach(btn => btn.style.display = 'none');
    
    articlesList.innerHTML = `
        <div class="full-article-view">
            <button onclick="displayArticles()" class="back-button">← Back to Articles</button>
            
            <div class="article-header">
                <h2>${article.title}</h2>
                <p><strong>Concept:</strong> ${article.concept}</p>
                <p><strong>Date:</strong> ${article.date}</p>
                ${article.lastEdited ? `<p><strong>Last Edited:</strong> ${article.lastEdited}</p>` : ''}
            </div>
            
            <div class="article-content" id="fullArticleContent">
                ${article.content}
            </div>
            
            <div class="article-actions">
                <button onclick="editArticle(${article.id})" class="edit-btn">✏️ Edit Article</button>
            </div>
        </div>
    `;
}

function editArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    
    const articlesList = document.getElementById('articlesList');
    
    // Hide concept suggestions and action buttons
    document.getElementById('conceptSuggestions').classList.add('hidden');
    const buttons = document.querySelectorAll('#articlesSection > button');
    buttons.forEach(btn => btn.style.display = 'none');
    
    articlesList.innerHTML = `
        <div class="full-article-view">
            <button onclick="showFullArticleView(${JSON.stringify(article).replace(/"/g, '&quot;')})" class="back-button">← Back to Article View</button>
            
            <div class="edit-article-form">
                <h3>✏️ Edit Article</h3>
                <input type="text" id="editTitle" value="${article.title.replace(/"/g, '&quot;')}" placeholder="Article Title" />
                <input type="text" id="editConcept" value="${article.concept.replace(/"/g, '&quot;')}" placeholder="Concept/Topic" />
                <textarea id="editContent" placeholder="Article content...">${article.content}</textarea>
                
                <div class="edit-actions">
                    <button onclick="saveEditedArticle(${article.id})" class="save-btn">💾 Save Changes</button>
                    <button onclick="cancelEdit(${article.id})" class="cancel-btn">❌ Cancel</button>
                </div>
            </div>
            
            <div class="article-actions">
                <p style="color: #666; font-style: italic;">💡 Tip: You can edit the title, concept, and content. Changes will update the keywords automatically!</p>
            </div>
        </div>
    `;
}

function saveEditedArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    
    const newTitle = document.getElementById('editTitle').value;
    const newConcept = document.getElementById('editConcept').value;
    const newContent = document.getElementById('editContent').value;
    
    if (!newTitle || !newContent) {
        alert('Please fill in at least the title and content!');
        return;
    }
    
    // Update the article
    article.title = newTitle;
    article.concept = newConcept;
    article.content = newContent;
    article.lastEdited = new Date().toLocaleDateString();
    
    // Show success message and return to article view
    alert('Article updated successfully! ✨');
    showFullArticleView(article);
    
    // CRITICAL: Auto-save after editing article
    if (typeof autoSaveToNAS === 'function') {
        autoSaveToNAS();
    }
}

function cancelEdit(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (article) {
        showFullArticleView(article);
    } else {
        displayArticles();
    }
}