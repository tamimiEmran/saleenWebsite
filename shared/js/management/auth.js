// shared/js/management/auth.js - Refactored for static HTML
const Auth = (function() {
    const PASSWORD = 'saleen';
    let isInitialized = false;
    
    // Initialize auth module - called once when app starts
    function init() {
        if (isInitialized) {
            console.warn('Auth module already initialized');
            return;
        }
        
        console.log('🔐 Initializing Auth module...');
        
        // Setup any auth-specific event listeners if needed
        setupAuthEventListeners();
        
        isInitialized = true;
        console.log('✅ Auth module initialized');
    }
    
    function setupAuthEventListeners() {
        // Any auth-specific event setup can go here
        // Most events are now handled by app.js event delegation
        
        // Example: Auto-focus password input when login view is shown
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            // Focus when login view becomes active
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const loginView = document.getElementById('loginView');
                        if (loginView && loginView.classList.contains('active')) {
                            setTimeout(() => passwordInput.focus(), 100);
                        }
                    }
                });
            });
            
            const loginView = document.getElementById('loginView');
            if (loginView) {
                observer.observe(loginView, { attributes: true });
            }
        }
    }
    
    // Main login function - called by app.js event delegation
    function login() {
        if (!isInitialized) {
            console.error('❌ Auth module not initialized');
            Utils.notify('Authentication system not ready', 'error');
            return false;
        }
        
        const passwordInput = document.getElementById('passwordInput');
        
        if (!passwordInput) {
            console.error('❌ Password input not found');
            Utils.notify('Login form not found', 'error');
            return false;
        }
        
        const password = passwordInput.value.trim();
        
        if (!password) {
            Utils.notify('Please enter a password', 'warning');
            passwordInput.focus();
            return false;
        }
        
        if (password === PASSWORD) {
            // Clear password field
            passwordInput.value = '';
            
            // Success feedback
            Utils.notify('Welcome! 💕', 'success');
            
            console.log('✅ Login successful');
            return true;
        } else {
            // Clear password field
            passwordInput.value = '';
            
            // Error feedback
            Utils.notify('bad giiirrlll >:< ', 'error');
            
            // Refocus for retry
            setTimeout(() => passwordInput.focus(), 100);
            
            console.log('❌ Login failed - incorrect password');
            return false;
        }
    }
    
    // Check if user is currently authenticated
    function isAuthenticated() {
        // In this simple app, we consider user authenticated if they're not on login view
        const loginView = document.getElementById('loginView');
        return loginView ? !loginView.classList.contains('active') : false;
    }
    
    // Logout function
    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            console.log('🔓 User logged out');
            Utils.notify('Logged out successfully', 'info');
            return true;
        }
        return false;
    }
    
    // Get current authentication state
    function getAuthState() {
        return {
            isAuthenticated: isAuthenticated(),
            initialized: isInitialized
        };
    }
    
    // Prepare login view (called when showing login)
    function prepareLoginView() {
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            passwordInput.value = '';
            setTimeout(() => passwordInput.focus(), 100);
        }
    }
    
    // Public API
    return {
        init,           // Initialize the auth module
        login,          // Handle login attempt
        logout,         // Handle logout
        isAuthenticated,// Check auth status
        getAuthState,   // Get full auth state
        prepareLoginView // Prepare login UI
    };
})();