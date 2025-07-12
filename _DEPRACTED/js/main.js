// Main initialization file
// This file should be loaded last to ensure all other functions are available

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Our Special Place app initialized! 💕');
    
    // You can add any initialization code here
    // For example, loading saved data from localStorage in the future
});

// In main.js after DOM loaded
document.querySelectorAll('#mainMenu button').forEach(btn => {
    btn.disabled = true;
});

// After successful load
document.querySelectorAll('#mainMenu button').forEach(btn => {
    btn.disabled = false;
});