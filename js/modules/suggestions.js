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
     */
    function show() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="card wide-card" id="suggestionsSection">
                <button class="back-button" onclick="Navigation.show('menu')">← Back to Main Menu</button>
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
                        <div class="input-row">
                            <input type="text" id="suggestionInput" 
                                   placeholder="Add a movie, song, link..." 
                                   oninput="Suggestions.handleInput()"
                                   onkeypress="Suggestions.handleEnter(event)" />
                            <button onclick="Suggestions.addSuggestion()" id="addBtn" disabled>Add</button>
                        </div>
                        <div class="suggestion-options">
                            <div class="icon-selector">
                                ${Object.entries(icons).map(([key, icon]) => `
                                    <button class="icon-btn ${key === selectedIcon ? 'selected' : ''}" data-icon="${key}" 
                                            onclick="Suggestions.selectIcon('${key}')"
                                            title="${icon.label}">
                                        ${icon.emoji}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="for-us-toggle-container">
                                <input type="checkbox" id="forUsCheck" onchange="Suggestions.updateForUsState()" ${forUs ? 'checked' : ''}>
                                <label for="forUsCheck">For Us 💕</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        updateView();
    }

    /**
     * Renders the HTML for the three suggestion cards (Saleen, Emran, Us).
     */
    function renderCards() {
        const suggestions = AppState.get('suggestions') || { forSaleen: [], forEmran: [], forUs: [] };
        
        const cards = [
            { title: 'For Saleen', data: suggestions.forSaleen, key: 'forSaleen' },
            { title: 'For Emran', data: suggestions.forEmran, key: 'forEmran' },
            { title: 'For Us 💕', data: suggestions.forUs, key: 'forUs' }
        ];
        
        return cards.map((card, index) => `
            <div class="suggestion-card" data-index="${index}">
                <div class="card-header">
                    <h3>${card.title}</h3>
                    <div class="filter-row">
                        <span class="filter-label">Filter:</span>
                        ${Object.entries(icons).map(([key, icon]) => `
                            <button class="filter-btn" data-icon="${key}" 
                                    onclick="Suggestions.setFilter('${key}')"
                                    title="${icon.label}">
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
                <input type="checkbox" 
                       id="check-${suggestion.id}"
                       ${suggestion.completed ? 'checked' : ''}
                       onchange="Suggestions.toggleComplete('${cardKey}', ${suggestion.id})" />
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

    /**
     * Switches the visible card and updates tab UI.
     */
    function goToCard(index) {
        currentCard = index;
        updateView();
    }

    /**
     * Updates the view to show the current card and active tab.
     */
    function updateView() {
        const wrapper = document.getElementById('cardsWrapper');
        if (wrapper) {
            wrapper.style.transition = 'transform 0.3s ease';
            wrapper.style.transform = `translateX(-${currentCard * 33.333}%)`;
        }
        
        document.querySelectorAll('.suggestion-tabs .tab-btn').forEach((btn, index) => {
            btn.classList.toggle('active', index === currentCard);
        });

        // Ensure filter buttons reflect the active state
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.icon === activeFilter);
        });
    }

    /**
     * Handles user input in the suggestion field for automatic icon detection.
     */
    function handleInput() {
        const input = document.getElementById('suggestionInput');
        const canAdd = input.value.trim().length > 0;
        document.getElementById('addBtn').disabled = !canAdd;

        // Auto-detect URL and select link icon
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
    
    function updateForUsState() {
        forUs = document.getElementById('forUsCheck').checked;
    }

    // --- LOGIC & DATA MANIPULATION ---

    function isValidUrl(string) {
        // A simple regex is often sufficient and more forgiving than the URL constructor for user input.
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return urlRegex.test(string);
    }
    
    /**
     * Adds a new suggestion without a full page reload.
     */
    function addSuggestion() {
        const input = document.getElementById('suggestionInput');
        const content = input.value.trim();
        if (!content) return;
        
        const currentUser = Navigation.getCurrentUser();
        const suggestion = {
            id: Date.now(),
            type: selectedIcon,
            content: content,
            isLink: isValidUrl(content),
            completed: false,
            date: new Date().toLocaleDateString(),
            from: currentUser
        };
        
        const targetCard = forUs ? 'forUs' : (currentUser === 'Saleen' ? 'forEmran' : 'forSaleen');
        
        const suggestions = AppState.get('suggestions') || { forSaleen: [], forEmran: [], forUs: [] };
        suggestions[targetCard].push(suggestion);
        AppState.set('suggestions', suggestions);
        
        // --- Dynamic UI Update (No Reload) ---
        const listElement = document.getElementById(`list-${targetCard}`);
        const emptyMessage = listElement.querySelector('.empty-message');
        if (emptyMessage) emptyMessage.remove(); // Remove 'empty' message if it exists

        const newItemHTML = getSuggestionHTML(suggestion, targetCard);
        listElement.insertAdjacentHTML('beforeend', newItemHTML);
        
        // --- Cleanup and Feedback ---
        input.value = '';
        handleInput(); // Resets button state
        Utils.notify(`Suggestion added! ${icons[suggestion.type].emoji}`, 'success');
    }
    
    /**
     * Toggles a suggestion's completed state without a full page reload.
     */
    function toggleComplete(cardKey, suggestionId) {
        const suggestions = AppState.get('suggestions');
        const suggestion = suggestions[cardKey].find(s => s.id === suggestionId);
        
        if (suggestion) {
            suggestion.completed = !suggestion.completed;
            AppState.set('suggestions', suggestions);

            // --- Dynamic UI Update (No Reload) ---
            const itemElement = document.querySelector(`.suggestion-item[data-id="${suggestionId}"]`);
            if (itemElement) {
                itemElement.classList.toggle('completed', suggestion.completed);
                // Move to end of list if completed
                if (suggestion.completed) {
                    itemElement.parentElement.appendChild(itemElement);
                }
            }
        }
    }
    
    /**
     * Sets or toggles a global filter and refreshes the card lists.
     */
    function setFilter(type) {
        activeFilter = activeFilter === type ? null : type;
        // A targeted re-render is better than a full 'show()' call
        const wrapper = document.getElementById('cardsWrapper');
        if (wrapper) {
            wrapper.innerHTML = renderCards();
            updateView(); // Re-apply active states
        }
    }
    
    function clearFilter() {
        setFilter(null); // Calling setFilter with null clears it
    }
    
    // --- PUBLIC API ---
    return {
        show,
        goToCard,
        handleInput,
        handleEnter,
        selectIcon,
        updateForUsState,
        addSuggestion,
        toggleComplete,
        setFilter,
        clearFilter
    };
})();