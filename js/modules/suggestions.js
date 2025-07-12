// js/modules/suggestions.js
const Suggestions = (function() {
    let currentCard = 0;
    let selectedIcon = null;
    let forUs = true;
    let activeFilter = null;
    
    const icons = {
        movie: { emoji: '🎬', label: 'Movie' },
        music: { emoji: '🎵', label: 'Music' },
        youtube: { emoji: '📺', label: 'YouTube' },
        book: { emoji: '📚', label: 'Book' },
        link: { emoji: '🔗', label: 'Link' }
    };
    
    function show() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="card wide-card" id="suggestionsSection">
                <button class="back-button" onclick="Navigation.show('menu')">← Back to Main Menu</button>
                <h2>📬 Suggestions Box</h2>
                
                <div class="suggestions-container">
                    <div class="cards-wrapper" id="cardsWrapper">
                        ${renderCards()}
                    </div>
                    
                    <div class="navigation-dots">
                        <span class="dot active" onclick="Suggestions.goToCard(0)"></span>
                        <span class="dot" onclick="Suggestions.goToCard(1)"></span>
                        <span class="dot" onclick="Suggestions.goToCard(2)"></span>
                    </div>
                    
                    <div class="suggestion-input-area">
                        <div class="icon-selector">
                            ${Object.entries(icons).map(([key, icon]) => `
                                <button class="icon-btn" data-icon="${key}" 
                                        onclick="Suggestions.selectIcon('${key}')"
                                        title="${icon.label}">
                                    ${icon.emoji}
                                </button>
                            `).join('')}
                            <button class="for-us-toggle ${forUs ? 'active' : ''}" 
                                    onclick="Suggestions.toggleForUs()"
                                    title="For both of us">
                                💕
                            </button>
                        </div>
                        <div class="input-row">
                            <input type="text" id="suggestionInput" 
                                   placeholder="Add a suggestion..." 
                                   onkeypress="Suggestions.handleEnter(event)"
                                   oninput="Suggestions.checkCanAdd()" />
                            <button onclick="Suggestions.addSuggestion()" 
                                    id="addBtn" disabled>
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        setupSwipeGestures();
        updateView();
    }
    
    function renderCards() {
        const currentUser = Navigation.getCurrentUser();
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
                        <span class="filter-label">Filter by:</span>
                        ${Object.entries(icons).map(([key, icon]) => `
                            <button class="filter-btn ${activeFilter === key ? 'active' : ''}" 
                                    onclick="Suggestions.setFilter('${key}')"
                                    title="${icon.label}">
                                ${icon.emoji}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="suggestions-list">
                    ${renderSuggestions(card.data, card.key)}
                </div>
            </div>
        `).join('');
    }
    
    function renderSuggestions(suggestions, cardKey) {
        if (!suggestions || suggestions.length === 0) {
            return '<p class="empty-message">No suggestions yet! Add one below 👇</p>';
        }
        
        // Filter suggestions if needed
        let filtered = suggestions;
        if (activeFilter) {
            filtered = suggestions.filter(s => s.type === activeFilter);
        }
        
        // Sort by completed status
        const sorted = [...filtered].sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });
        
        return sorted.map(suggestion => `
            <div class="suggestion-item ${suggestion.completed ? 'completed' : ''}">
                <input type="checkbox" 
                       id="check-${suggestion.id}"
                       ${suggestion.completed ? 'checked' : ''}
                       onchange="Suggestions.toggleComplete('${cardKey}', ${suggestion.id})" />
                <label for="check-${suggestion.id}">
                    <span class="suggestion-icon">${icons[suggestion.type].emoji}</span>
                    ${suggestion.isLink ? 
                        `<a href="${suggestion.content}" target="_blank" class="suggestion-link">${suggestion.content}</a>` : 
                        `<span class="suggestion-text">${suggestion.content}</span>`
                    }
                </label>
                <span class="suggestion-date">${suggestion.date}</span>
            </div>
        `).join('');
    }
    
    function setupSwipeGestures() {
        const wrapper = document.getElementById('cardsWrapper');
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        // Touch events
        wrapper.addEventListener('touchstart', handleStart, { passive: true });
        wrapper.addEventListener('touchmove', handleMove, { passive: true });
        wrapper.addEventListener('touchend', handleEnd);
        
        // Mouse events for desktop
        wrapper.addEventListener('mousedown', handleStart);
        wrapper.addEventListener('mousemove', handleMove);
        wrapper.addEventListener('mouseup', handleEnd);
        wrapper.addEventListener('mouseleave', handleEnd);
        
        function handleStart(e) {
            isDragging = true;
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            wrapper.style.transition = 'none';
        }
        
        function handleMove(e) {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const diff = currentX - startX;
            // Fixed: Use 33.333 instead of 100 for the calculation
            const offset = -(currentCard * 33.333) + (diff / wrapper.offsetWidth * 33.333);
            wrapper.style.transform = `translateX(${offset}%)`;
        }
        
        function handleEnd() {
            if (!isDragging) return;
            isDragging = false;
            
            const diff = currentX - startX;
            // Use the container width (not wrapper width) for threshold
            const containerWidth = wrapper.parentElement.offsetWidth;
            const threshold = containerWidth * 0.2; // 20% of container width
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0 && currentCard > 0) {
                    currentCard--;
                } else if (diff < 0 && currentCard < 2) {
                    currentCard++;
                }
            }
            
            updateView();
        }
    }

        
    
    function goToCard(index) {
        currentCard = index;
        updateView();
    }
    function updateView() {
        const wrapper = document.getElementById('cardsWrapper');
        if (wrapper) {
            wrapper.style.transition = 'transform 0.3s ease';
            wrapper.style.transform = `translateX(-${currentCard * 33.333}%)`;
        }
        
        // Update dots
        document.querySelectorAll('.navigation-dots .dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentCard);
        });
    }
    function selectIcon(icon) {
        selectedIcon = icon;
        document.querySelectorAll('.icon-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.icon === icon);
        });
        checkCanAdd();
    }
    
    function toggleForUs() {
        forUs = !forUs;
        const btn = document.querySelector('.for-us-toggle');
        if (btn) btn.classList.toggle('active', forUs);
    }
    
    function checkCanAdd() {
        const input = document.getElementById('suggestionInput');
        const btn = document.getElementById('addBtn');
        if (input && btn) {
            btn.disabled = !selectedIcon || !input.value.trim();
        }
    }
    
    function handleEnter(event) {
        if (event.key === 'Enter' && !document.getElementById('addBtn').disabled) {
            addSuggestion();
        }
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    function addSuggestion() {
        const input = document.getElementById('suggestionInput');
        const content = input.value.trim();
        
        if (!content || !selectedIcon) return;
        
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
        
        // Determine which card to add to
        let targetCard;
        if (forUs) {
            targetCard = 'forUs';
        } else {
            targetCard = currentUser === 'Saleen' ? 'forEmran' : 'forSaleen';
        }
        
        // Add to state
        const suggestions = AppState.get('suggestions') || { forSaleen: [], forEmran: [], forUs: [] };
        suggestions[targetCard].push(suggestion);
        AppState.set('suggestions', suggestions);
        
        // Clear input
        input.value = '';
        selectedIcon = null;
        document.querySelectorAll('.icon-btn').forEach(btn => btn.classList.remove('selected'));
        checkCanAdd();
        
        // Refresh view
        show();
        goToCard(targetCard === 'forSaleen' ? 0 : targetCard === 'forEmran' ? 1 : 2);
        
        Utils.notify(`Suggestion added! ${icons[suggestion.type].emoji}`, 'success');
    }
    
    function toggleComplete(cardKey, suggestionId) {
        const suggestions = AppState.get('suggestions') || { forSaleen: [], forEmran: [], forUs: [] };
        const suggestion = suggestions[cardKey].find(s => s.id === suggestionId);
        
        if (suggestion) {
            suggestion.completed = !suggestion.completed;
            AppState.set('suggestions', suggestions);
            
            // Refresh the current card
            const wrapper = document.getElementById('cardsWrapper');
            if (wrapper) {
                wrapper.innerHTML = renderCards();
                updateView();
            }
        }
    }
    
    function setFilter(type) {
        activeFilter = activeFilter === type ? null : type;
        show();
        goToCard(currentCard);
    }
    
    function clearFilter() {
        activeFilter = null;
        show();
        goToCard(currentCard);
    }
    
    // Public API
    return {
        show,
        goToCard,
        selectIcon,
        toggleForUs,
        handleEnter,
        checkCanAdd,
        addSuggestion,
        toggleComplete,
        setFilter,
        clearFilter
    };
})();