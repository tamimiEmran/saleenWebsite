// Navigation functions
function showMainMenu() {
    document.querySelectorAll('.card').forEach(card => card.classList.add('hidden'));
    // Also hide the confession section by setting display to none
    const confessionSection = document.getElementById('confessionSection');
    if (confessionSection) {
        confessionSection.style.display = 'none';
    }
    document.getElementById('mainMenu').classList.remove('hidden');
}

function showArticles() {
    document.querySelectorAll('.card').forEach(card => card.classList.add('hidden'));
    document.getElementById('articlesSection').classList.remove('hidden');
    renderConceptSuggestions();
    displayArticles();
}

function showConfessionGame() {
    // Hide all cards except the confession section
    document.querySelectorAll('.card').forEach(card => {
        if (card.id !== 'confessionSection') {
            card.classList.add('hidden');
        }
    });
    const confessionSection = document.getElementById('confessionSection');
    confessionSection.classList.remove('hidden');
    confessionSection.style.display = 'flex'; // Explicitly set display to flex
    
    // Initialize the probability display
    updateProbability();
    }

function showGrievanceGame() {
    // Hide all other sections
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('hidden');
        // Also ensure display is set to none for other sections
        if (card.id !== 'grievanceSection') {
            card.style.display = 'none';
        }
    });
    
    // Show grievance section
    const section = document.getElementById('grievanceSection');
    section.classList.remove('hidden');
    section.style.display = 'flex';
    
    // Ensure the form is visible and reset
    const form = document.getElementById('grievanceForm');
    if (form) {
        form.style.display = 'flex';
        form.reset(); // Clear any previous entries
    }
}