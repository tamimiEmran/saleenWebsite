// js/modules/grievances.js
var Grievances = (function() {
    function show() {
        const list = document.getElementById("grievanceList");
        if(list) list.innerHTML = renderGrievances();
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
