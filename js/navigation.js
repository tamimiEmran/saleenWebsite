// Final fixed navigation functions
function showMainMenu() {
    document.querySelectorAll('.card').forEach(card => card.classList.add('hidden'));
    document.getElementById('mainMenu').classList.remove('hidden');
}

function showArticles() {
    document.querySelectorAll('.card').forEach(card => card.classList.add('hidden'));
    document.getElementById('articlesSection').classList.remove('hidden');
    renderConceptSuggestions();
    displayArticles();
}

function showConfessionGame() {
    document.querySelectorAll('.card').forEach(card => card.classList.add('hidden'));
    const confessionSection = document.getElementById('confessionSection');
    confessionSection.classList.remove('hidden');
    confessionSection.style.display = 'flex';
    updateProbability();
}

function showGrievanceGame() {
    console.log('Showing grievance game...');
    
    // Hide all cards
    document.querySelectorAll('.card').forEach(card => card.classList.add('hidden'));
    
    // Show grievance section
    const grievanceSection = document.getElementById('grievanceSection');
    grievanceSection.classList.remove('hidden');
    
    // Set proper display and layout
    grievanceSection.style.display = 'flex';
    grievanceSection.style.flexDirection = 'column';
    grievanceSection.style.padding = '20px';
    
    // Reset form
    const form = document.getElementById('grievanceForm');
    if (form) {
        form.reset();
    }
    
    console.log('Grievance section visible, height:', grievanceSection.offsetHeight);
}