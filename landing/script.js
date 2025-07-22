// shared/js/app.js - Main Application Controller with Game Loading
// Expose App globally so inline event handlers can access it
var App = (function() {
    let currentGame = null;
    let loadedGames = new Set();
    let gameModules = {};
    
    // Game configuration
    const GAMES = {
        articles: {
            path: './games/articles/',
            files: ['index.html', 'style.css', 'script.js'],
            module: 'Articles'
        },
        confessions: {
            path: './games/confessions/',
            files: ['index.html', 'style.css', 'script.js'],
            module: 'Confessions'
        },
        suggestions: {
            path: './games/suggestions/',
            files: ['index.html', 'style.css', 'script.js'],
            module: 'Suggestions'
        },
        grievances: {
            path: './games/grievances/',
            files: ['index.html', 'style.css', 'script.js'],
            module: 'Grievances'
        }
    };

    async function init() {
        console.log('🚀 Initializing app...');
        
        try {
            // 1. Initialize core modules first (in dependency order)
            await initializeCoreModules();
            
            // 2. Load data from storage
            await Storage.load();
            console.log('✅ Data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            Utils.notify('Using local data', 'warning');
        }
        
        // 3. Setup global event delegation
        setupEventDelegation();
        
        // 4. Setup keyboard shortcuts
        setupKeyboardShortcuts();
        
        // 5. Setup click-outside handler for dropdowns
        setupClickOutside();
        
        // 6. Show login screen (after all modules are ready)
        showLoginView();
        
        console.log('✅ App initialized successfully');
    }


    async function initializeCoreModules() {
        console.log('🔧 Initializing core modules...');

        // Verify core modules exist (these are defined using const, not on window)
        const missing = [];
        if (typeof AppState === 'undefined') missing.push('AppState');
        if (typeof Utils === 'undefined') missing.push('Utils');
        if (typeof Storage === 'undefined') missing.push('Storage');
        if (typeof Auth === 'undefined') missing.push('Auth');

        if (missing.length) {
            throw new Error(`Required module(s) missing: ${missing.join(', ')}`);
        }

        // Initialize modules in dependency order
        try {
            if (typeof Auth.init === 'function') {
                Auth.init();
            } else {
                console.warn('⚠️ Auth module missing init method');
            }

            console.log('✅ Core modules initialized');
        } catch (error) {
            console.error('❌ Failed to initialize core modules:', error);
            throw error;
        }
    }
    function setupEventDelegation() {
        const appContainer = document.getElementById('appContainer');
        
        // Handle all clicks through delegation
        appContainer.addEventListener('click', async (e) => {
            // Support clicks on child elements by finding the closest ancestor
            // with a data-action attribute
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl) return;

            const action = actionEl.dataset.action;
            const target = actionEl.dataset.target;
            
            switch (action) {
                case 'login':
                    handleLogin();
                    break;
                    
                case 'navigate':
                    if (target) {
                        await loadGame(target);
                    }
                    break;
                    
                case 'back-to-menu':
                    showMainMenu();
                    break;
                    
                case 'toggle-settings':
                    toggleSettings();
                    break;
                    
                case 'test-connection':
                    Storage.testConnection();
                    break;
                    
                case 'show-data-info':
                    showDataInfo();
                    break;
                    
                case 'toggle-user':
                    toggleUser();
                    break;
                    
                case 'modal-cancel':
                    closeModal(null);
                    break;
                    
                case 'modal-confirm':
                    confirmModal();
                    break;
            }
        });

        // Handle form submissions
        appContainer.addEventListener('submit', (e) => {
            e.preventDefault();
            const formAction = e.target.dataset.action;
            
            if (formAction === 'login') {
                handleLogin();
            }
        });

        // Handle Enter key on password input
        appContainer.addEventListener('keypress', (e) => {
            if (e.target.id === 'passwordInput' && e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                Storage.save();
            }
            
            // Escape to go back
            if (e.key === 'Escape') {
                const currentView = getCurrentView();
                if (currentView === 'game') {
                    showMainMenu();
                } else if (currentView === 'menu') {
                    // Close settings if open
                    const dropdown = document.getElementById('settingsDropdown');
                    if (dropdown && !dropdown.classList.contains('hidden')) {
                        dropdown.classList.add('hidden');
                    }
                }
            }
        });
    }

    function setupClickOutside() {
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('settingsDropdown');
            const toggle = document.getElementById('settingsToggle');
            
            if (dropdown && toggle && 
                !toggle.contains(e.target) && 
                !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    // ===================================
    // VIEW MANAGEMENT
    // ===================================

    function showView(viewName) {
        console.log(`🔄 Switching to view: ${viewName}`);
        
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });
        
        // Show target view
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('active');
        }
    }

    function getCurrentView() {
        const activeView = document.querySelector('.view.active');
        if (!activeView) return null;
        
        return activeView.id.replace('View', '');
    }

    function showMainMenu() {
        // Cleanup current game if any
        if (currentGame) {
            cleanupGame(currentGame);
            currentGame = null;
        }
        
        showView('menu');
    }

    // ===================================
    // GAME LOADING SYSTEM
    // ===================================

    async function loadGame(gameName) {
        if (!GAMES[gameName]) {
            console.error(`❌ Unknown game: ${gameName}`);
            Utils.notify('Game not found', 'error');
            return;
        }

        try {
            console.log(`🎮 Loading game: ${gameName}`);
            Utils.notify('Loading game...', 'info', 2000);

            // Cleanup previous game
            if (currentGame && currentGame !== gameName) {
                cleanupGame(currentGame);
            }

            const game = GAMES[gameName];

            // Always reload the HTML to reset the game view
            if (game.files.includes('index.html')) {
                await loadGameHTML(game.path, gameName);
            }

            // Only load JS and CSS once
            if (!loadedGames.has(gameName)) {
                const promises = [];
                if (game.files.includes('style.css')) {
                    promises.push(loadGameCSS(game.path, gameName));
                }
                if (game.files.includes('script.js')) {
                    promises.push(loadGameJS(game.path, gameName));
                }
                await Promise.all(promises);
                loadedGames.add(gameName);
            }

            // Show game view
            showView('game');
            
            // Initialize game module
            await initializeGame(gameName);
            
            currentGame = gameName;
            console.log(`✅ Game loaded: ${gameName}`);
            
        } catch (error) {
            console.error(`❌ Failed to load game ${gameName}:`, error);
            Utils.notify(`Failed to load game: ${error.message}`, 'error');
            showMainMenu();
        }
    }


    async function loadGameHTML(basePath, gameName) {
        try {
            const response = await fetch(`${basePath}index.html`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            
            // Store HTML content for this game
            const gameContent = document.getElementById('gameContent');
            gameContent.innerHTML = html;
            
            console.log(`✅ Loaded HTML for ${gameName}`);
        } catch (error) {
            console.error(`❌ Failed to load HTML for ${gameName}:`, error);
            throw new Error(`HTML loading failed: ${error.message}`);
        }
    }

    async function loadGameCSS(basePath, gameName) {
        try {
            // Check if CSS is already loaded
            if (document.querySelector(`link[data-game="${gameName}"]`)) {
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${basePath}style.css`;
            link.dataset.game = gameName;
            
            // Wait for CSS to load
            await new Promise((resolve, reject) => {
                link.onload = resolve;
                link.onerror = () => reject(new Error('CSS failed to load'));
                document.head.appendChild(link);
            });
            
            console.log(`✅ Loaded CSS for ${gameName}`);
        } catch (error) {
            console.error(`❌ Failed to load CSS for ${gameName}:`, error);
            throw new Error(`CSS loading failed: ${error.message}`);
        }
    }

    async function loadGameJS(basePath, gameName) {
        try {
            // Check if JS is already loaded
            if (document.querySelector(`script[data-game="${gameName}"]`)) {
                return;
            }

            const script = document.createElement('script');
            script.src = `${basePath}script.js`;
            script.dataset.game = gameName;
            
            // Wait for script to load
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = () => reject(new Error('Script failed to load'));
                document.head.appendChild(script);
            });
            
            console.log(`✅ Loaded JS for ${gameName}`);
        } catch (error) {
            console.error(`❌ Failed to load JS for ${gameName}:`, error);
            throw new Error(`JS loading failed: ${error.message}`);
        }
    }

    async function initializeGame(gameName) {
        const game = GAMES[gameName];
        const moduleExists = window[game.module] && typeof window[game.module].show === 'function';
        
        if (moduleExists) {
            // Store reference to game module
            gameModules[gameName] = window[game.module];
            
            // Initialize the game
            window[game.module].show();
            console.log(`✅ Initialized ${game.module} module`);
        } else {
            console.warn(`⚠️ Game module ${game.module} not found or missing show() method`);
        }
    }

    function cleanupGame(gameName) {
        // Clear game content
        const gameContent = document.getElementById('gameContent');
        if (gameContent) {
            gameContent.innerHTML = '';
        }

        // Call cleanup method if game module has one
        if (gameModules[gameName] && typeof gameModules[gameName].cleanup === 'function') {
            gameModules[gameName].cleanup();
        }

        console.log(`🧹 Cleaned up game: ${gameName}`);
    }

    // ===================================
    // AUTH & USER MANAGEMENT
    // ===================================

    function handleLogin() {
        // Delegate to Auth module
        const loginSuccess = Auth.login();
        
        if (loginSuccess) {
            // Navigate to main menu on successful login
            showView('menu');
        }
        // Auth module handles error feedback
    }

    function showLoginView() {
        showView('login');
        
        // Prepare login UI
        if (Auth && typeof Auth.prepareLoginView === 'function') {
            Auth.prepareLoginView();
        }
    }

    function toggleSettings() {
        const dropdown = document.getElementById('settingsDropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    function toggleUser() {
        const slider = document.getElementById('switchSlider');
        const userName = document.getElementById('userName');
        const userButton = document.getElementById('userSwitchButton');
        const currentUser = userButton.dataset.currentUser;
        
        if (currentUser === 'Saleen') {
            userButton.dataset.currentUser = 'Emran';
            userName.textContent = 'Emran';
            Utils.notify('Switched to Emran! 👤', 'info');
        } else {
            userButton.dataset.currentUser = 'Saleen';
            userName.textContent = 'Saleen';
            Utils.notify('Switched to Saleen! 👤', 'info');
        }
        
        // Close settings dropdown
        const dropdown = document.getElementById('settingsDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }

    function showDataInfo() {
        const articles = AppState.get('articles').length;
        const confessions = AppState.get('confessionHistory').filter(c => c.sent).length;
        const points = AppState.get('pointsAccumulated');
        const concepts = AppState.get('concepts').length;
        const suggestions = AppState.get('suggestions');
        const totalSuggestions = suggestions ? 
            (suggestions.forSaleen?.length || 0) + 
            (suggestions.forEmran?.length || 0) + 
            (suggestions.forUs?.length || 0) : 0;
        
        Utils.notify(`
            📊 Data Statistics:<br>
            • Articles: ${articles}<br>
            • Confessions sent: ${confessions}<br>
            • Points: ${points}<br>
            • Concepts: ${concepts}<br>
            • Suggestions: ${totalSuggestions}<br>
            • Current User: ${document.getElementById('userSwitchButton').dataset.currentUser}
        `, 'info', 8000);
        
        // Close settings dropdown
        const dropdown = document.getElementById('settingsDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }

    // ===================================
    // MODAL MANAGEMENT
    // ===================================

    let currentModalResolve = null;

    function closeModal(value) {
        const modalContainer = document.getElementById('modalContainer');
        if (modalContainer.firstChild) {
            modalContainer.removeChild(modalContainer.firstChild);
        }
        
        if (currentModalResolve) {
            currentModalResolve(value);
            currentModalResolve = null;
        }
    }

    function confirmModal() {
        const modalInput = document.querySelector('.modal-input');
        const value = modalInput ? modalInput.value : '';
        closeModal(value);
    }

    // ===================================
    // PUBLIC API
    // ===================================

    return {
        init,
        loadGame,
        showMainMenu,
        getCurrentView,
        getCurrentGame: () => currentGame,
        getCurrentUser: () => document.getElementById('userSwitchButton')?.dataset.currentUser || 'Saleen'
    };
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});