document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('grievanceForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const entry = {
            title: document.getElementById('grievanceTitle').value.trim(),
            details: document.getElementById('grievanceDetails').value.trim(),
            mood: document.getElementById('grievanceMood').value,
            severity: document.getElementById('grievanceSeverity').value,
            date: new Date().toLocaleString()
        };

        if (!entry.title || !entry.details) {
            alert('Please fill out both title and details.');
            return;
        }

        // Add the grievance to the array
        grievances.push(entry);
        
        // Show success message
        alert('Grievance submitted—thank you! 💌');
        
        // Reset the form
        form.reset();
        
        // Auto-save to NAS
        if (typeof autoSaveToNAS === 'function') {
            autoSaveToNAS();
        }
        
        // Optional: Go back to main menu after submission
        // Uncomment the line below if you want to return to main menu
        // showMainMenu();
    });
});