// Authentication functions
function login() {
    const password = document.getElementById('passwordInput').value;
    // Simple password check - you can change this
    if ( password === 'saleen') {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
    } else {
        alert('bad giiirrlll >:< ');
    }
}

// Allow Enter key for login
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});