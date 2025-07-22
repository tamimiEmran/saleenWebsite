// js/modules/grievances.js
var Grievances = (function() {
    function show() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="card wide-card" id="grievancesSection">
                <button class="back-button" onclick="App.showMainMenu()">← Back to Main Menu</button>
                <h2>📋 How did I upset you? :( </h2>
                
                <div class="grievance-form">
                    
                    <textarea id="grievanceDetails" placeholder="فضفضيلي" rows="3"></textarea>
                    <div style="margin: 15px 0;">
                        <label for="grievanceSeverity" style="display: block; margin-bottom: 10px; font-weight: bold;">
                            How much did I fuck up? 
                        </label>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 18px; color: #666;">
                            <span>بسيطة بس صحصح</span>
                            <span>حلعن ربكك</span>
                        </div>
                        <input type="range" id="grievanceSeverity" min="1" max="4" value="2" 
                               oninput="Grievances.updateSeverityLabel(this.value)"
                               style="width: 100%; height: 8px; border-radius: 5px; background: linear-gradient(to right, #4caf50, #ff9800, #f44336, #9c27b0); outline: none;">
                    </div>
                    <button onclick="Grievances.addGrievance()">Add Grievance</button>
                </div>
                
                <div id="grievanceHistory" style="margin-top: 30px;">
                    <h3>Current Grievances</h3>
                    <div id="grievanceList">
                        ${renderGrievances()}
                    </div>
                </div>
            </div>
        `;
        
        updateHistoryVisibility();
    }
    
    function renderGrievances() {
        const grievances = AppState.get('grievances') || [];
        
        if (grievances.length === 0) {
            return '<p style="text-align: center; color: #666;">No grievances recorded. Hopefully it stays that way! 😊</p>';
        }
        
        return grievances.map((entry, idx) => `
            <div class="grievance-card" style="
                background: #f9f9f9;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 10px;
                border-left: 4px solid ${getSeverityColor(entry.severity)};
            ">
                <p style="margin-bottom: 10px; font-weight: bold;">${entry.details}</p>
                <small style="color: #666;">Severity: ${entry.severity} • ${entry.date}</small>
                <div style="margin-top: 10px;">
                    <button onclick="Grievances.resolveGrievance(${idx})" style="
                        padding: 8px 12px;
                        background: ${entry.clickCount === 0 ? '#4caf50' : '#ff9800'};
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">
                        ${entry.clickCount === 0 ? 'Resolved?' : 'Confirm Resolved'}
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    function getSeverityColor(severity) {
        switch (severity) {
            case 'Low': return '#4caf50';
            case 'Medium': return '#ff9800';
            case 'High': return '#f44336';
            case 'Critical': return '#9c27b0';
            default: return '#757575';
        }
    }
    
    function updateHistoryVisibility() {
        const grievances = AppState.get('grievances') || [];
        const historyEl = document.getElementById('grievanceHistory');
        if (historyEl) {
            historyEl.style.display = grievances.length > 0 ? 'block' : 'none';
        }
    }
    
    function updateSeverityLabel(value) {
        const severities = ['', 'Low', 'Medium', 'High', 'Critical'];
        const label = document.getElementById('severityLabel');
        if (label) {
            label.textContent = severities[value];
        }
    }
    
    function addGrievance() {
        const details = document.getElementById('grievanceDetails').value.trim();
        const severityValue = document.getElementById('grievanceSeverity').value;
        const severities = ['', 'Low', 'Medium', 'High', 'Critical'];
        const severity = severities[severityValue];
        
        if (!details) {
            Utils.notify('Please enter grievance details.', 'warning');
            return;
        }
        
        const grievances = AppState.get('grievances') || [];
        grievances.push({
            details,
            severity,
            date: new Date().toLocaleDateString(),
            clickCount: 0
        });
        
        AppState.set('grievances', grievances);
        
        // Refresh view
        show();
        
        Utils.notify('Grievance added to tracker', 'success');
    }
    
    function resolveGrievance(index) {
        const grievances = AppState.get('grievances') || [];
        const grievance = grievances[index];
        
        if (!grievance) return;
        
        grievance.clickCount = (grievance.clickCount || 0) + 1;
        
        if (grievance.clickCount >= 2) {
            grievances.splice(index, 1);
            Utils.notify('Grievance resolved and removed! 🎉', 'success');
        } else {
            Utils.notify('Click once more to confirm resolution', 'info');
        }
        
        AppState.set('grievances', grievances);
        show();
    }
    
    // Public API
    return {
        show,
        addGrievance,
        resolveGrievance,
        updateSeverityLabel
    };
})();
