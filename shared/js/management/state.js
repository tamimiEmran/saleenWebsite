// js/modules/state.js
const AppState = (function() {
    // Private state
    let state = {
        articles: [],
        confessionHistory: [],
        concepts: [
            "symbols",
            "metaphors", 
            "narratives",
            "marriage as codependency",
            "emotional disregulation",
            "Life as simulation"
        ],
        pointsAccumulated: 0,
        selectedConcepts: [],
        dataLoaded: false,
        isLoading: false,
        currentConfession: '',
        probability: 30
    };
    
    // Listeners for state changes
    const listeners = {};
    
    // Public API
    return {
        // Get state value
        get(key) {
            return state[key];
        },
        
        // Set state value
        set(key, value) {
            state[key] = value;
            this.notify(key, value);
        },
        
        // Update state (merge)
        update(updates) {
            Object.assign(state, updates);
            Object.keys(updates).forEach(key => {
                this.notify(key, updates[key]);
            });
        },
        
        // Subscribe to state changes
        subscribe(key, callback) {
            if (!listeners[key]) {
                listeners[key] = [];
            }
            listeners[key].push(callback);
            
            // Return unsubscribe function
            return () => {
                const index = listeners[key].indexOf(callback);
                if (index > -1) {
                    listeners[key].splice(index, 1);
                }
            };
        },
        
        // Notify listeners
        notify(key, value) {
            if (listeners[key]) {
                listeners[key].forEach(callback => callback(value));
            }
            
            // Also notify wildcard listeners
            if (listeners['*']) {
                listeners['*'].forEach(callback => callback(key, value));
            }
        },
        
        // Get full state snapshot
        getSnapshot() {
            return JSON.parse(JSON.stringify(state));
        },
        
        // Article operations
        articles: {
            getAll() {
                return state.articles;
            },
            
            getById(id) {
                return state.articles.find(a => a.id === id);
            },
            
            add(article) {
                state.articles.push(article);
                AppState.notify('articles', state.articles);
            },
            
            update(id, updates) {
                const article = state.articles.find(a => a.id === id);
                if (article) {
                    Object.assign(article, updates);
                    article.lastEdited = new Date().toLocaleDateString();
                    AppState.notify('articles', state.articles);
                }
            }
        },
        
        // Confession operations
        confessions: {
            getAll() {
                return state.confessionHistory;
            },
            
            getSent() {
                return state.confessionHistory.filter(c => c.sent);
            },
            
            add(confession) {
                state.confessionHistory.unshift(confession);
                AppState.notify('confessionHistory', state.confessionHistory);
            },
            
            addPoints(points) {
                state.pointsAccumulated += points;
                AppState.notify('pointsAccumulated', state.pointsAccumulated);
            }
        },
        
        // Concept operations
        concepts: {
            getAll() {
                return state.concepts;
            },
            
            getSelected() {
                return state.selectedConcepts;
            },
            
            add(concept) {
                if (!state.concepts.includes(concept)) {
                    state.concepts.push(concept);
                    AppState.notify('concepts', state.concepts);
                }
            },
            
            toggleSelection(concept) {
                const index = state.selectedConcepts.indexOf(concept);
                if (index > -1) {
                    state.selectedConcepts.splice(index, 1);
                } else {
                    state.selectedConcepts.push(concept);
                }
                AppState.notify('selectedConcepts', state.selectedConcepts);
            },
            
            clearSelection() {
                state.selectedConcepts = [];
                AppState.notify('selectedConcepts', state.selectedConcepts);
            }
        }
    };
})();