// js/modules/suggestions.js
const Suggestions = (function() {
    // --- MODULE STATE ---
    let currentCard = 0;
    let selectedIcon = 'link'; // Default icon
    let forUs = true;
    let activeFilter = null;

    const icons = {
        movie: { emoji: '🎬', label: 'Movie' },
        music: { emoji: '🎵', label: 'Music' },
        youtube: { emoji: '📺', label: 'YouTube' },
        book: { emoji: '📚', label: 'Book' },
        link: { emoji: '🔗', label: 'Link' }
    };

    // --- RENDER FUNCTIONS ---

    /**
     * Main function to render the entire suggestions component.
     * This is the primary entry point called by other modules.
     */
    function show() {
        const container = document.querySelector('.container');
        // This HTML structure is designed for the new mobile and desktop CSS
        container.innerHTML = `
            <div class="card wide-card" id="suggestionsSection">
                <button class="back-button" onclick="App.showMainMenu()">← Back to Main Menu</button>
                <h2>📬 Suggestions Box</h2>
                
                <div class="suggestions-container">
                    <div class="suggestion-tabs">
                        <button class="tab-btn" onclick="Suggestions.goToCard(0)">For Saleen</button>
                        <button class="tab-btn" onclick="Suggestions.goToCard(1)">For Emran</button>
                        <button class="tab-btn" onclick="Suggestions.goToCard(2)">For Us 💕</button>
                    </div>

                    <div class="cards-wrapper" id="cardsWrapper">
                        ${renderCards()}
                    </div>
                    
                    <div class="suggestion-input-area">
                        <div class="suggestion-options">
                            <div class="icon-selector">
                                ${Object.entries(icons).map(([key, icon]) => `
                                    <button class="icon-btn" data-icon="${key}" 
                                            onclick="Suggestions.selectIcon('${key}')"
                                            title="${icon.label}">
                                        ${icon.emoji}
                                    </button>
                                `).join('')}
                            </div>
                            
                            <!-- Unified toggle button for both web and mobile -->
                            <button class="for-us-toggle-btn ${forUs ? 'active' : ''}" onclick="Suggestions.toggleForUs()">
                                For Us 💕
                            </button>
                        </div>
                        <div class="input-row">
                            <input type="text" id="suggestionInput" 
                                   placeholder="Add a movie, song, link..." 
                                   oninput="Suggestions.handleInput()"
                                   onkeypress="Suggestions.handleEnter(event)" />
                            <button onclick="Suggestions.addSuggestion()" id="addBtn" disabled>Add</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Set initial state correctly after rendering
        selectIcon(selectedIcon);
        goToCard(currentCard);
    }

    /**
     * Renders the HTML for the three suggestion cards.
     */
    function renderCards() {
        const suggestions = AppState.get('suggestions') || { forSaleen: [], forEmran: [], forUs: [] };
        const cards = [
            { title: 'For Saleen', data: suggestions.forSaleen, key: 'forSaleen' },
            { title: 'For Emran', data: suggestions.forEmran, key: 'forEmran' },
            { title: 'For Us 💕', data: suggestions.forUs, key: 'forUs' }
        ];
        
        return cards.map((card) => `
            <div class="suggestion-card" data-key="${card.key}">
                <div class="card-header">
                    <div class="filter-row">
                        <span class="filter-label">Filter:</span>
                        ${Object.entries(icons).map(([key, icon]) => `
                            <button class="filter-btn" data-icon="${key}" onclick="Suggestions.setFilter('${key}')" title="${icon.label}">
                                ${icon.emoji}
                            </button>
                        `).join('')}
                        ${activeFilter ? `<button class="clear-filter-btn" onclick="Suggestions.clearFilter()">Clear</button>` : ''}
                    </div>
                </div>
                <div class="suggestions-list" id="list-${card.key}">
                    ${renderSuggestions(card.data, card.key)}
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Renders the individual suggestion items for a given list.
     */
    function renderSuggestions(suggestions, cardKey) {
        if (!suggestions || suggestions.length === 0) {
            return '<p class="empty-message">No suggestions yet! Add one below 👇</p>';
        }
        
        const filtered = activeFilter ? suggestions.filter(s => s.type === activeFilter) : suggestions;
        
        if (filtered.length === 0) {
            return `<p class="empty-message">No suggestions match the '${icons[activeFilter].label}' filter.</p>`;
        }

        const sorted = [...filtered].sort((a, b) => a.completed - b.completed);
        
        return sorted.map(suggestion => getSuggestionHTML(suggestion, cardKey)).join('');
    }

    /**
     * Generates the HTML for a single suggestion item.
     */
    function getSuggestionHTML(suggestion, cardKey) {
        return `
            <div class="suggestion-item ${suggestion.completed ? 'completed' : ''}" data-id="${suggestion.id}">
                <input type="checkbox" id="check-${suggestion.id}" ${suggestion.completed ? 'checked' : ''} onchange="Suggestions.toggleComplete('${cardKey}', ${suggestion.id})">
                <label for="check-${suggestion.id}">
                    <span class="suggestion-icon">${icons[suggestion.type]?.emoji || '🔗'}</span>
                    ${suggestion.isLink ? 
                        `<a href="${suggestion.content}" target="_blank" rel="noopener noreferrer" class="suggestion-link">${suggestion.content}</a>` : 
                        `<span class="suggestion-text">${suggestion.content}</span>`
                    }
                </label>
                <span class="suggestion-date">${suggestion.date}</span>
            </div>
        `;
    }

    // --- UI & EVENT HANDLERS ---

    function goToCard(index) {
        currentCard = index;
        const wrapper = document.getElementById('cardsWrapper');
        if (wrapper) {
            wrapper.style.transition = 'transform 0.3s ease';
            wrapper.style.transform = `translateX(-${currentCard * 100 / 3}%)`;
        }
        
        document.querySelectorAll('.suggestion-tabs .tab-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === currentCard);
        });
    }

    function handleInput() {
        const input = document.getElementById('suggestionInput');
        document.getElementById('addBtn').disabled = !input.value.trim();
        if (isValidUrl(input.value.trim())) {
            selectIcon('link');
        }
    }
    
    function handleEnter(event) {
        if (event.key === 'Enter' && !document.getElementById('addBtn').disabled) {
            addSuggestion();
        }
    }

    function selectIcon(icon) {
        selectedIcon = icon;
        document.querySelectorAll('.icon-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.icon === icon);
        });
    }
    
    /**
     * Toggles the 'forUs' state and updates the UI of the button.
     * Replaces the old checkbox logic.
     */
    function toggleForUs() {
        forUs = !forUs;
        const btn = document.querySelector('.for-us-toggle-btn');
        if (btn) {
            btn.classList.toggle('active', forUs);
        }
    }

    // --- LOGIC & DATA MANIPULATION ---

    function isValidUrl(string) {
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return urlRegex.test(string);
    }
    
    function addSuggestion() {
        const input = document.getElementById('suggestionInput');
        const content = input.value.trim();
        if (!content) return;
        
        const currentUser = App.getCurrentUser();
        const suggestion = {
            id: Date.now(), type: selectedIcon, content,
            isLink: isValidUrl(content), completed: false,
            date: new Date().toLocaleDateString(), from: currentUser
        };
        
        const targetCard = forUs ? 'forUs' : (currentUser === 'Saleen' ? 'forEmran' : 'forSaleen');
        
        const suggestions = AppState.get('suggestions') || { forSaleen: [], forEmran: [], forUs: [] };
        suggestions[targetCard].push(suggestion);
        AppState.set('suggestions', suggestions);
        
        const listElement = document.getElementById(`list-${targetCard}`);
        const emptyMessage = listElement.querySelector('.empty-message');
        if (emptyMessage) emptyMessage.remove();
        listElement.insertAdjacentHTML('beforeend', getSuggestionHTML(suggestion, targetCard));
        
        input.value = '';
        handleInput();
        Utils.notify(`Suggestion added! ${icons[suggestion.type].emoji}`, 'success');
    }
    
    function toggleComplete(cardKey, suggestionId) {
        const suggestions = AppState.get('suggestions');
        const suggestion = suggestions[cardKey].find(s => s.id === suggestionId);
        
        if (suggestion) {
            suggestion.completed = !suggestion.completed;
            AppState.set('suggestions', suggestions);

            const itemElement = document.querySelector(`.suggestion-item[data-id="${suggestionId}"]`);
            if (itemElement) {
                itemElement.classList.toggle('completed', suggestion.completed);
                if (suggestion.completed) itemElement.parentElement.appendChild(itemElement);
            }
        }
    }
    
    function setFilter(type) {
        activeFilter = activeFilter === type ? null : type;
        const wrapper = document.getElementById('cardsWrapper');
        if (wrapper) {
            wrapper.innerHTML = renderCards();
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.icon === activeFilter);
            });
        }
    }
    
    function clearFilter() {
        setFilter(null);
    }
    
    // --- PUBLIC API ---
    // These are the only functions accessible from other modules.
    return {
        show,
        goToCard,
        handleInput,
        handleEnter,
        selectIcon,
        toggleForUs, // New internal function exposed for the onclick event
        addSuggestion,
        toggleComplete,
        setFilter,
        clearFilter
    };
})();