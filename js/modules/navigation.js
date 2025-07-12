// js/modules/navigation.js
const Navigation = (function() {
    let currentView = 'login';
    let currentUser = 'Saleen'; // Default user
    
    function showView(viewName) {
        currentView = viewName;
        const container = document.querySelector('.container');
        
        // Hide all views
        container.querySelectorAll('.card').forEach(card => {
            card.classList.add('hidden');
        });
        
        switch(viewName) {
            case 'login':
                Auth.showLogin();
                break;
            case 'menu':
                showMainMenu();
                break;
            case 'articles':
                Articles.show();
                break;
            case 'confessions':
                Confessions.show();
                break;
            case 'suggestions':
                Suggestions.show();
                break;
        }
    }
    
    function showMainMenu() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="card" id="mainMenu">
                <h1>HAVE FUNNNNN</h1>
                <div class="nav-buttons">
                    <button onclick="Navigation.show('articles')">📝 Our Article Collection</button>
                    <button onclick="Navigation.show('confessions')">🎲 Confession Roulette</button>
                    <button onclick="Navigation.show('suggestions')">📬 Suggestions Box</button>
                </div>
                
                <!-- Settings Icon at bottom -->
                <div style="
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                ">
                    <button onclick="Navigation.toggleSettings()" 
                            id="settingsToggle"
                            style="
                                background: none;
                                border: none;
                                cursor: pointer;
                                padding: 8px;
                                border-radius: 8px;
                                transition: background 0.2s;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            "
                            onmouseover="this.style.background='rgba(0,0,0,0.05)'"
                            onmouseout="this.style.background='none'">
                        <span style="font-size: 24px;">⚙️</span>
                    </button>
                    
                    <!-- Settings Dropdown (opens upward) -->
                    <div id="settingsDropdown" 
                         style="
                             display: none;
                             position: absolute;
                             bottom: 50px;
                             left: 50%;
                             transform: translateX(-50%);
                             background: white;
                             border-radius: 10px;
                             box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                             padding: 10px;
                             min-width: 200px;
                             z-index: 100;
                         ">
                        <button onclick="Storage.testConnection(); Navigation.toggleSettings();" 
                                style="
                                    background: #17a2b8;
                                    font-size: 13px;
                                    padding: 10px 15px;
                                    margin-bottom: 8px;
                                    width: 100%;
                                    text-align: left;
                                ">
                            🔧 Test NAS Connection
                        </button>
                        <button onclick="Navigation.showDataInfo(); Navigation.toggleSettings();" 
                                style="
                                    background: #28a745;
                                    font-size: 13px;
                                    padding: 10px 15px;
                                    margin-bottom: 8px;
                                    width: 100%;
                                    text-align: left;
                                ">
                            📊 Data Info
                        </button>
                        <hr style="margin: 10px 0; border: none; border-top: 1px solid #eee;">
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 10px 15px;
                            background: rgba(0,0,0,0.02);
                            border-radius: 8px;
                        ">
                            <span style="font-size: 13px; font-weight: bold;">User:</span>
                            <div style="position: relative;">
                                <button onclick="Navigation.toggleUser()" 
                                        id="userSwitch"
                                        style="
                                            background: linear-gradient(45deg, #667eea, #764ba2);
                                            border: none;
                                            border-radius: 20px;
                                            padding: 6px;
                                            width: 100px;
                                            height: 34px;
                                            cursor: pointer;
                                            position: relative;
                                            transition: background 0.3s;
                                            overflow: hidden;
                                        ">
                                    <div id="switchSlider" style="
                                        background: white;
                                        width: 26px;
                                        height: 26px;
                                        border-radius: 50%;
                                        position: absolute;
                                        top: 3px;
                                        left: 3px;
                                        transition: transform 0.3s;
                                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                    "></div>
                                    <span id="userName" style="
                                        position: absolute;
                                        left: 35px;
                                        top: 50%;
                                        transform: translateY(-50%);
                                        color: white;
                                        font-size: 12px;
                                        font-weight: bold;
                                    ">Saleen</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add click outside to close dropdown
        document.addEventListener('click', handleClickOutside);
    }
    
    function handleClickOutside(event) {
        const dropdown = document.getElementById('settingsDropdown');
        const toggle = document.getElementById('settingsToggle');
        
        if (dropdown && toggle && !toggle.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    }
    
    function toggleSettings() {
        const dropdown = document.getElementById('settingsDropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
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
            • Current User: ${currentUser}
        `, 'info', 8000);
    }
    
    function toggleUser() {
        const slider = document.getElementById('switchSlider');
        const userName = document.getElementById('userName');
        const userSwitch = document.getElementById('userSwitch');
        
        if (currentUser === 'Saleen') {
            currentUser = 'Emran';
            slider.style.transform = 'translateX(68px)';
            userName.textContent = 'Emran';
            userName.style.left = '8px';
            userSwitch.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a6f)';
            
            Utils.notify('Switched to Emran! 👤', 'info');
        } else {
            currentUser = 'Saleen';
            slider.style.transform = 'translateX(0)';
            userName.textContent = 'Saleen';
            userName.style.left = '35px';
            userSwitch.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
            
            Utils.notify('Switched to Saleen! 👤', 'info');
        }
        
        // You can add different behaviors for each user here
        // For example, different themes, preferences, etc.
    }
    
    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            showView('login');
        }
    }
    
    // Public API
    return {
        show: showView,
        logout,
        toggleSettings,
        showDataInfo,
        toggleUser,
        getCurrentView: () => currentView,
        getCurrentUser: () => currentUser
    };
})();