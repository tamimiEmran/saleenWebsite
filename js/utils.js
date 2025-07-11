// Utility functions for modals
function showCustomPrompt(message, callback) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'customModal';
    
    // Create modal content
    const modalHtml = `
        <div class="modal-content">
            <h3>${message}</h3>
            <input type="text" class="modal-input" id="modalInput" placeholder="Enter concept name..." />
            <div class="modal-buttons">
                <button onclick="closeModal(false)">Cancel</button>
                <button onclick="closeModal(true)" style="background: linear-gradient(45deg, #4ecdc4, #44a08d);">Add Concept</button>
            </div>
        </div>
    `;
    
    overlay.innerHTML = modalHtml;
    document.body.appendChild(overlay);
    
    // Focus on input
    setTimeout(() => {
        const input = document.getElementById('modalInput');
        input.focus();
        
        // Allow Enter key to submit
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                closeModal(true);
            }
        });
    }, 100);
    
    // Store callback globally
    window.modalCallback = callback;
}

window.closeModal = function(submit) {
    const modal = document.getElementById('customModal');
    const input = document.getElementById('modalInput');
    
    if (submit && window.modalCallback) {
        window.modalCallback(input.value);
    }
    
    if (modal) {
        modal.remove();
    }
    window.modalCallback = null;
}

// Keyword extraction functions
function extractKeywords(content) {
    // Simple keyword extraction - looks for important words
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
    
    const words = content.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word));
    
    // Count frequency and return top keywords
    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([word]) => word);
}