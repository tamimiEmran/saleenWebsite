// js/app.js
const App = (function() {
    async function init() {
        console.log('🚀 Initializing app...');
        
        // Load data from storage
        try {
            await Storage.load();
        } catch (error) {
            console.error('Failed to load data:', error);
            Utils.notify('Using local data', 'warning');
        }
        
        // Setup keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Show login screen
        Navigation.show('login');
    }
    
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                Storage.save();
            }
            
            // Escape to go back to menu (except from login)
            if (e.key === 'Escape') {
                const currentView = Navigation.getCurrentView();
                if (currentView !== 'login' && currentView !== 'menu') {
                    Navigation.show('menu');
                }
            }
        });
    }
    
    return {
        init
    };
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});