var Grievances = (function() {

    function show() {
        renderGrievances();
        updateHistoryVisibility();
        // Set initial severity label on load
        updateSeverityLabel(document.getElementById('grievanceSeverity').value);
        // Set initial button state
        checkInputs(); 
    }

    function renderGrievances() {
        const grievances = AppState.get('grievances') || [];
        const listEl = document.getElementById("grievanceList");

        if (!listEl) return;

        if (grievances.length === 0) {
            listEl.innerHTML = '<p style="text-align: center; color: #666;">No grievances recorded. Phew! 😊</p>';
            return;
        }

        listEl.innerHTML = grievances.map((entry, idx) => {
            const isConfirming = entry.clickCount > 0;
            const severityClass = `severity-${entry.severity.toLowerCase()}`;
            
            return `
                <div class="grievance-card ${severityClass}">
                    <p class="grievance-details">${entry.details}</p>
                    <small class="grievance-meta">Severity: ${entry.severity} • ${entry.date}</small>
                    <div class="grievance-actions">
                        <button type="button" class="resolve-btn ${isConfirming ? 'confirm' : ''}" onclick="Grievances.resolveGrievance(${idx})">
                            ${isConfirming ? 'Confirm Resolution' : 'Mark as Resolved'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function updateHistoryVisibility() {
        const grievances = AppState.get('grievances') || [];
        const historyEl = document.getElementById('grievanceHistory');
        if (historyEl) {
            historyEl.style.display = grievances.length > 0 ? 'block' : 'none';
        }
    }

    function updateSeverityLabel(value) {
        // Map slider value (1-4) to text labels
        const severities = ['Low', 'Medium', 'High', 'Critical'];
        const label = document.getElementById('severityLabel');
        if (label) {
            // value is 1-based, array is 0-based
            label.textContent = severities[value - 1];
        }
    }
    
    // --- MODIFICATION STARTS HERE ---

    function checkInputs() {
        const details = document.getElementById('grievanceDetails').value.trim();
        const addButton = document.querySelector('.add-grievance-btn');
        if (addButton) {
            // Disable the button if the details text is empty
            addButton.disabled = !details;
        }
    }

    // --- MODIFICATION ENDS HERE ---

    function addGrievance() {
        const details = document.getElementById('grievanceDetails').value.trim();
        const severityValue = document.getElementById('grievanceSeverity').value;
        const severities = ['Low', 'Medium', 'High', 'Critical'];
        const severity = severities[severityValue - 1]; // Adjust for 0-based array

        if (!details) {
            // This check is still useful as a fallback, though the button should be disabled.
            Utils.notify('Please describe the grievance.', 'warning');
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
        
        // Clear input and refresh the view
        document.getElementById('grievanceDetails').value = '';
        show();
        
        Utils.notify('Grievance has been recorded.', 'success');
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
            Utils.notify('Are you sure? Click again to confirm.', 'info');
        }

        AppState.set('grievances', grievances);
        show(); // Re-render the list
    }

    // --- MODIFICATION STARTS HERE ---
    // Expose the new function to the public API
    return {
        show,
        addGrievance,
        resolveGrievance,
        updateSeverityLabel,
        checkInputs 
    };
    // --- MODIFICATION ENDS HERE ---
})();
