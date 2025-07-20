// js/modules/auth.js
const Auth = (function() {
    const PASSWORD = 'saleen';
    
    function showLogin() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="card" id="loginPage">
                <h1>Enjoy ! </h1>
                <div class="login-form">
                    <input type="password" id="passwordInput" placeholder="Enter our secret password..." />
                    <button onclick="Auth.login()">Our Secret Password</button>
                </div>
                <p style="color: #666; font-style: italic;">I really hope you like it ! and more "games" to come! ✨</p>
            </div>
        `;
        
        // Allow Enter key for login
        const passwordInput = document.getElementById('passwordInput');
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                Auth.login();
            }
        });
        
        passwordInput.focus();
    }
    
    function login() {
        const password = document.getElementById('passwordInput').value;
        if (password === PASSWORD) {
            Navigation.show('menu');
            Utils.notify('Welcome! 💕', 'success');
        } else {
            Utils.notify('bad giiirrlll >:< ', 'error');
            document.getElementById('passwordInput').value = '';
            document.getElementById('passwordInput').focus();
        }
    }
    
    // Public API
    return {
        showLogin,
        login
    };
})();