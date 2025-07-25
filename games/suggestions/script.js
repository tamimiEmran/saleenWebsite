var Suggestions = (function() {
    let currentListKey = 'forSaleen';
    let selectedIcon = 'link';

    const icons = {
        movie: { emoji: '🎬', label: 'Movie' },
        music: { emoji: '🎵', label: 'Music' },
        youtube: { emoji: '📺', label: 'YouTube' },
        book: { emoji: '📚', label: 'Book' },
        link: { emoji: '🔗', label: 'Link' }
    };
    
    // --- MODIFICATION: Friendly names for UI updates ---
    const listNames = {
        forSaleen: 'For You',
        forEmran: 'For Me',
        forUs: 'For Us 💕'
    };

    function show() {
        renderAllLists();
        showList(currentListKey);
        selectIcon('link');
        checkInputs();
    }

    function renderAllLists() {
        const suggestions = AppState.get('suggestions') || { forSaleen: [], forEmran: [], forUs: [] };
        for (const key in suggestions) {
            renderList(key, suggestions[key]);
        }
    }

    function renderList(key, items) {
        const listEl = document.getElementById(`list-${key}`);
        if (!listEl) return;

        if (!items || items.length === 0) {
            listEl.innerHTML = '<p class="empty-message">No suggestions yet! Add one below 👇</p>';
            return;
        }

        const sorted = [...items].sort((a, b) => a.completed - b.completed);
        listEl.innerHTML = sorted.map(item => getSuggestionHTML(item, key)).join('');
    }

    function getSuggestionHTML(suggestion, cardKey) {
        const isCompleted = suggestion.completed ? 'completed' : '';
        const iconEmoji = icons[suggestion.type]?.emoji || '🔗';
        const contentHTML = suggestion.isLink 
            ? `<a href="${suggestion.content}" target="_blank" rel="noopener noreferrer" class="suggestion-link">${suggestion.content}</a>` 
            : `<span class="suggestion-text">${suggestion.content}</span>`;

        return `
            <div class="suggestion-item ${isCompleted}" data-id="${suggestion.id}">
                <input type="checkbox" id="check-${suggestion.id}" ${suggestion.completed ? 'checked' : ''} onchange="Suggestions.toggleComplete('${cardKey}', ${suggestion.id})">
                <label for="check-${suggestion.id}">
                    <span class="suggestion-icon">${iconEmoji}</span>
                    ${contentHTML}
                </label>
                <span class="suggestion-date">${suggestion.date}</span>
            </div>
        `;
    }

    function showList(key) {
        currentListKey = key;
        
        // Toggle which list is visible
        document.querySelectorAll('.suggestions-list').forEach(list => {
            list.classList.toggle('hidden', list.id !== `list-${key}`);
        });

        // Toggle the active state on the tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('onclick').includes(`'${key}'`));
        });
        
        // --- MODIFICATION STARTS HERE: Update UI for context ---
        const friendlyName = listNames[key] || 'a List';
        const inputEl = document.getElementById('suggestionInput');
        const addBtnEl = document.getElementById('addSuggestionBtn');

        if (inputEl) {
            inputEl.placeholder = `Add suggestion for '${friendlyName}'...`;
        }
        if (addBtnEl) {
            addBtnEl.textContent = `Add to ${friendlyName}`;
        }
        // --- MODIFICATION ENDS HERE ---
    }

    function checkInputs() {
        const input = document.getElementById('suggestionInput');
        const addBtn = document.getElementById('addSuggestionBtn');
        if (addBtn) {
            addBtn.disabled = !input.value.trim();
        }
    }

    function handleEnter(event) {
        if (event.key === 'Enter' && !document.getElementById('addSuggestionBtn').disabled) {
            addSuggestion();
        }
    }
    
    function selectIcon(icon) {
        selectedIcon = icon;
        document.querySelectorAll('.icon-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.icon === icon);
        });
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(string);
        }
    }
    
    function addSuggestion() {
        const input = document.getElementById('suggestionInput');
        const content = input.value.trim();
        if (!content) return;

        const suggestion = {
            id: Date.now(),
            type: isValidUrl(content) ? 'link' : selectedIcon,
            content,
            isLink: isValidUrl(content),
            completed: false,
            date: new Date().toLocaleDateString()
        };

        const suggestions = AppState.get('suggestions') || { forSaleen: [], forEmran: [], forUs: [] };
        suggestions[currentListKey].push(suggestion);
        AppState.set('suggestions', suggestions);
        
        renderList(currentListKey, suggestions[currentListKey]);
        
        input.value = '';
        checkInputs();
        selectIcon('link');
        Utils.notify(`Suggestion added! ${icons[suggestion.type].emoji}`, 'success');
    }
    
    function toggleComplete(cardKey, suggestionId) {
        const suggestions = AppState.get('suggestions');
        const cardSuggestions = suggestions[cardKey];
        const suggestion = cardSuggestions.find(s => s.id === suggestionId);
        
        if (suggestion) {
            suggestion.completed = !suggestion.completed;
            AppState.set('suggestions', suggestions);
            renderList(cardKey, cardSuggestions);
        }
    }
    
    return {
        show, showList, checkInputs, handleEnter, selectIcon, addSuggestion, toggleComplete
    };
})();