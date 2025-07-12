// Confession Game functionality

// Calculate points based on probability
function calculatePoints(probability) {
    // 10% = 1 point, 20% = 2 points, ..., 50% = 5 points
    return probability / 10;
}

// Confession history functions
window.toggleConfessionHistory = function() {
    const modal = document.getElementById('confessionHistoryModal');
    if (modal.classList.contains('hidden')) {
        displayConfessionHistory();
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function displayConfessionHistory() {
    const historyList = document.getElementById('confessionHistoryList');
    
    // Add points display at the top
    let historyHTML = `
        <div style="
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        ">
            🏆 Points Accumulated: ${pointsAccumulated}
        </div>
    `;
    
    // Only show sent confessions
    const sentConfessions = confessionHistory.filter(item => item.sent);
    
    if (sentConfessions.length === 0) {
        historyHTML += '<p style="text-align: center; color: #666;">No confessions have been sent yet! 🤐</p>';
        historyList.innerHTML = historyHTML;
        return;
    }
    
    historyHTML += sentConfessions.map((item, index) => `
        <div style="
            background: rgba(255, 107, 107, 0.1);
            border-left: 4px solid #ff6b6b;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
        ">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #ff6b6b;">
                    💌 SENT
                </span>
                <small style="color: #666;">${item.date}</small>
            </div>
            <p style="font-style: italic; margin: 0;">"${item.confession}"</p>
            <small style="color: #666;">Sent at ${item.probability}% probability</small>
        </div>
    `).join('');
    
    historyList.innerHTML = historyHTML;
}

window.updateProbability = function() {
    probability = document.getElementById('probabilitySlider').value;
    document.getElementById('probabilityValue').textContent = probability + '%';
    
    // Update the color of the percentage based on risk level
    const percentageElement = document.getElementById('probabilityValue');
    if (probability >= 40) {
        percentageElement.style.color = '#ff6b6b'; // Red for high risk
    } else if (probability >= 30) {
        percentageElement.style.color = '#764ba2'; // Purple for medium risk
    } else {
        percentageElement.style.color = '#4ecdc4'; // Blue-green for low risk
    }
}

window.setConfessionStarter = function(starter) {
    document.getElementById('confessionInput').value = starter;
    document.getElementById('confessionInput').focus();
}

window.handleConfessionEnter = function(event) {
    if (event.key === 'Enter') {
        const confessionText = document.getElementById('confessionInput').value.trim();
        if (confessionText) {
            // Enable the shoot button when there's text
            document.getElementById('spinButton').disabled = false;
        }
    }
}

// Update the input handler to enable/disable shoot button
window.checkConfessionInput = function() {
    const confessionText = document.getElementById('confessionInput').value.trim();
    document.getElementById('spinButton').disabled = !confessionText;
}

window.spinRoulette = function() {
    const confessionText = document.getElementById('confessionInput').value.trim();
    if (!confessionText) return;
    
    currentConfession = confessionText;
    const resultMessage = document.getElementById('resultMessage');
    
    // Clear the input
    document.getElementById('confessionInput').value = '';
    document.getElementById('spinButton').disabled = true;
    
    // Determine the result first
    const isSent = Math.random() * 100 < probability;
    
    // Create flashing animation
    let flashCount = 0;
    const maxFlashes = 12;
    const colors = ['#ff6b6b', '#4ecdc4'];
    let currentColorIndex = 0;
    
    resultMessage.innerHTML = `
        <div style="text-align: center;">
            <p style="font-size: 20px; margin-bottom: 20px; color: #333;">🔫 Pulling the trigger...</p>
            <div id="flashingBox" style="
                width: 120px; 
                height: 120px; 
                margin: 0 auto;
                border-radius: 50%; 
                background: ${colors[0]};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 60px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                transition: background 0.1s;
            ">?</div>
        </div>
    `;
    resultMessage.className = 'result-message';
    resultMessage.classList.remove('hidden');
    resultMessage.style.background = 'white';
    resultMessage.style.color = '#333';
    
    // Flash between colors with decreasing speed
    const flashInterval = setInterval(() => {
        flashCount++;
        currentColorIndex = 1 - currentColorIndex;
        const flashingBox = document.getElementById('flashingBox');
        if (flashingBox) {
            flashingBox.style.background = colors[currentColorIndex];
            
            // Slow down the flashing as we approach the end
            if (flashCount >= maxFlashes - 3) {
                flashingBox.style.transition = 'background 0.3s';
            }
        }
        
        if (flashCount >= maxFlashes) {
            clearInterval(flashInterval);
            
            // Handle points and history
            if (isSent) {
                // Save to history ONLY if sent (permanent record!)
                confessionHistory.unshift({
                    confession: currentConfession,
                    sent: true,
                    probability: probability,
                    date: new Date().toLocaleString()
                });
                
                // CRITICAL: Auto-save after adding confession
                if (typeof autoSaveToNAS === 'function') {
                    autoSaveToNAS();
                }
            } else {
                // Add points when confession is discarded
                const points = calculatePoints(parseInt(probability));
                pointsAccumulated += points;
                
                // CRITICAL: Auto-save after updating points
                if (typeof autoSaveToNAS === 'function') {
                    autoSaveToNAS();
                }
            }
            
            // Show final result
            setTimeout(() => {
                if (isSent) {
                    resultMessage.innerHTML = `
                        <div style="text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 20px; animation: shake 0.5s;">💥</div>
                            <h3 style="margin-bottom: 15px;">BANG!</h3>
                            <h2 style="margin-bottom: 20px; font-size: 28px;">Your confession is sent!</h2>
                            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid rgba(255,255,255,0.5);">
                                <p style="font-style: italic; font-size: 18px;">"${currentConfession}"</p>
                            </div>
                            <p style="font-weight: bold;">💌 Your secret has been revealed!</p>
                        </div>
                        <style>
                            @keyframes shake {
                                0%, 100% { transform: translateX(0); }
                                25% { transform: translateX(-10px); }
                                75% { transform: translateX(10px); }
                            }
                        </style>
                    `;
                    resultMessage.className = 'result-message sent';
                    resultMessage.style.background = '#ff6b6b';
                } else {
                    const pointsEarned = calculatePoints(parseInt(probability));
                    resultMessage.innerHTML = `
                        <div style="text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 20px;">✓</div>
                            <h3 style="margin-bottom: 15px;">*CLICK* - Empty Chamber!</h3>
                            <h2 style="margin-bottom: 20px; font-size: 28px;">Your confession is safe and discarded!</h2>
                            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid rgba(255,255,255,0.5);">
                                <p style="font-style: italic; font-size: 18px;">"${currentConfession}"</p>
                            </div>
                            <p style="font-weight: bold;">🔒 Your secret remains hidden!</p>
                            <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px;">
                                <p style="font-size: 20px; font-weight: bold;">🏆 +${pointsEarned} Points!</p>
                                <p style="font-size: 14px;">Total Points: ${pointsAccumulated}</p>
                            </div>
                        </div>
                    `;
                    resultMessage.className = 'result-message discarded';
                    resultMessage.style.background = '#4ecdc4';
                }
            }, 300);
        }
    }, 150);
}