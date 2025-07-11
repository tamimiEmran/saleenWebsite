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

        grievances.push(entry);
        form.reset();
        alert('Grievance submitted\u2014thank you!');

        if (typeof autoSaveToNAS === 'function') {
            autoSaveToNAS();
        }
    });
});