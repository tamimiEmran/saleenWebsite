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

// Fixed showGrievanceGame function to add to navigation.js

function showGrievanceGame() {
    console.log('Showing grievance game...');
    
    // Hide all cards first
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('hidden');
        card.style.display = 'none'; // Ensure they're truly hidden
    });
    
    // Show grievance section
    const grievanceSection = document.getElementById('grievanceSection');
    if (!grievanceSection) {
        console.error('Grievance section not found!');
        return;
    }
    
    // Remove hidden class and set display
    grievanceSection.classList.remove('hidden');
    grievanceSection.style.display = 'block'; // Use block instead of flex
    
    // Reset form if it exists
    const form = document.getElementById('grievanceForm');
    if (form) {
        form.reset();
    }
    
    console.log('Grievance section should now be visible');
}