// js/modules/confessions.js
const Confessions = (function() {
    let probability = 30;
    let currentConfession = '';
    
    function show() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="card" id="confessionSection" style="max-width: 800px; height: 90vh; display: flex; flex-direction: column; padding: 20px; position: relative;">
                <button class="back-button" onclick="Navigation.show('menu')">← Back to Main Menu</button>
                
                <!-- History Button in top right -->
                <button onclick="Confessions.showHistory()" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(45deg, #764ba2, #667eea);
                    padding: 10px 20px;
                    font-size: 14px;
                    border-radius: 10px;
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.3s, box-shadow 0.3s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.2)';" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    📜 History
                </button>
                
                <h2 style="text-align: center;">Confession Roulette 🎭</h2>
                
                <div style="flex: 1; display: flex; gap: 30px; margin: 20px 0; min-height: 0;">
                    <!-- Vertical Slider Section -->
                    <div style="display: flex; flex-direction: column; align-items: center; padding: 20px; background: rgba(102, 126, 234, 0.1); border-radius: 15px; width: 150px;">
                        <label style="font-weight: bold; margin-bottom: 20px; text-align: center; font-size: 16px;">Send<br/>Probability</label>
                        
                        <div style="position: relative; height: 300px; width: 80px; display: flex; align-items: center; justify-content: center;">
                            <!-- Custom slider track -->
                            <div style="position: absolute; width: 12px; height: 100%; background: linear-gradient(to top, #4ecdc4, #667eea, #ff6b6b); border-radius: 6px; box-shadow: inset 0 0 5px rgba(0,0,0,0.2);"></div>
                            
                            <!-- The actual range input -->
                            <input type="range" id="probabilitySlider" 
                                   min="10" max="50" step="10" value="30"
                                   oninput="Confessions.updateProbability()" 
                                   style="
                                       position: absolute;
                                       width: 300px;
                                       height: 40px;
                                       -webkit-appearance: none;
                                       background: transparent;
                                       outline: none;
                                       transform: rotate(-90deg);
                                       transform-origin: center;
                                       cursor: pointer;
                                       margin: 0;
                                       padding: 0;
                                   " />
                        </div>
                        
                        <div id="probabilityValue" style="font-size: 36px; font-weight: bold; color: #667eea; margin-top: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">30%</div>
                        
                        <p style="font-size: 12px; color: #666; text-align: center; margin-top: 15px;">Lower = Safer but lower points <br/> Higher = Riskier but higher points <br/> 10% is 1 point and 50% is 5 points etc</p>
                    </div>
                    
                    <!-- Main Content Area -->
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <!-- Result Message Area -->
                        <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                            <div id="resultMessage" class="result-message hidden" style="margin: 20px; max-width: 500px;"></div>
                        </div>
                        
                        <!-- Suggestions Area -->
                        <div style="background: rgba(102, 126, 234, 0.05); border-radius: 15px; padding: 15px; margin-bottom: 20px;">
                            <p style="font-size: 14px; color: #666; margin-bottom: 10px; text-align: center;">type a confession and shoot, depending on fate it's either saved or lost. <br/> If your secret is discarded you get a point. You can exchange points for favours from me (im trying to fuel your gambling addiction). <br/> Some examples are:</p>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                                <button onclick="Confessions.setStarter('One of the lines I hid from you is...')" 
                                        style="font-size: 14px; padding: 8px 16px; background: white; color: #667eea; border: 1px solid #667eea;">
                                    One of the lines I hid from you is...
                                </button>
                                <button onclick="Confessions.setStarter('I\\'ve never told you that...')" 
                                        style="font-size: 14px; padding: 8px 16px; background: white; color: #667eea; border: 1px solid #667eea;">
                                    I've never told you that...
                                </button>
                                <button onclick="Confessions.setStarter('My most embarrassing moment was...')" 
                                        style="font-size: 14px; padding: 8px 16px; background: white; color: #667eea; border: 1px solid #667eea;">
                                    My most embarrassing moment was...
                                </button>
                            </div>
                        </div>
                        
                        <!-- Message Bar -->
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="text" id="confessionInput" 
                                   placeholder="Type your confession ..." 
                                   style="flex: 1; padding: 15px; border: 2px solid #ddd; border-radius: 10px; font-size: 16px;"
                                   onkeypress="Confessions.handleEnter(event)"
                                   oninput="Confessions.checkInput()" />
                            <button onclick="Confessions.spin()" id="spinButton" 
                                    style="background: linear-gradient(45deg, #ff6b6b, #ee5a6f); padding: 15px 30px; font-size: 18px; font-weight: bold;" 
                                    disabled>
                                🔫 Shoot!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- History Modal (hidden by default) -->
            <div id="confessionHistoryModal" class="modal-overlay hidden">
                <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
                    <h3 style="color: #667eea; margin-bottom: 20px;">📜 Confession History</h3>
                    <div id="confessionHistoryList">
                        <!-- Will be populated by JavaScript -->
                    </div>
                    <div class="modal-buttons">
                        <button onclick="Confessions.hideHistory()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        updateProbability();
    }
    
    function updateProbability() {
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
    
    function setStarter(text) {
        document.getElementById('confessionInput').value = text;
        document.getElementById('confessionInput').focus();
        checkInput();
    }
    
    function handleEnter(event) {
        if (event.key === 'Enter' && !document.getElementById('spinButton').disabled) {
            spin();
        }
    }
    
    function checkInput() {
        const confessionText = document.getElementById('confessionInput').value.trim();
        document.getElementById('spinButton').disabled = !confessionText;
    }
    
    function spin() {
        const confessionText = document.getElementById('confessionInput').value.trim();
        if (!confessionText) return;
        
        currentConfession = confessionText;
        const resultMessage = document.getElementById('resultMessage');
        
        // Clear the input
        document.getElementById('confessionInput').value = '';
        document.getElementById('spinButton').disabled = true;
        
        // Determine the result first
        const isSent = Math.random() * 100 < probability;
        
        // Show spinning animation
        showSpinAnimation(isSent);
    }
    
    function showSpinAnimation(isSent) {
        const resultMessage = document.getElementById('resultMessage');
        
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
                
                // Handle result
                if (isSent) {
                    // Save to history
                    AppState.confessions.add({
                        confession: currentConfession,
                        sent: true,
                        probability: probability,
                        date: new Date().toLocaleString()
                    });
                } else {
                    // Add points
                    const points = calculatePoints(parseInt(probability));
                    AppState.confessions.addPoints(points);
                }
                
                // Show final result
                setTimeout(() => showResult(isSent), 300);
            }
        }, 150);
    }
    
    function calculatePoints(probability) {
        return probability / 10;
    }
    
    function showResult(isSent) {
        const resultMessage = document.getElementById('resultMessage');
        
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
            const totalPoints = AppState.get('pointsAccumulated');
            
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
                        <p style="font-size: 14px;">Total Points: ${totalPoints}</p>
                    </div>
                </div>
            `;
            resultMessage.className = 'result-message discarded';
            resultMessage.style.background = '#4ecdc4';
        }
    }
    
    function showHistory() {
        const modal = document.getElementById('confessionHistoryModal');
        const historyList = document.getElementById('confessionHistoryList');
        const sentConfessions = AppState.confessions.getSent();
        const points = AppState.get('pointsAccumulated');
        
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
                🏆 Points Accumulated: ${points}
            </div>
        `;
        
        if (sentConfessions.length === 0) {
            historyHTML += '<p style="text-align: center; color: #666;">No confessions have been sent yet! 🤐</p>';
        } else {
            historyHTML += sentConfessions.map(item => `
                <div style="
                    background: rgba(255, 107, 107, 0.1);
                    border-left: 4px solid #ff6b6b;
                    padding: 15px;
                    margin-bottom: 10px;
                    border-radius: 8px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <span style="font-weight: bold; color: #ff6b6b;">💌 SENT</span>
                        <small style="color: #666;">${item.date}</small>
                    </div>
                    <p style="font-style: italic; margin: 0;">"${item.confession}"</p>
                    <small style="color: #666;">Sent at ${item.probability}% probability</small>
                </div>
            `).join('');
        }
        
        historyList.innerHTML = historyHTML;
        modal.classList.remove('hidden');
    }
    
    function hideHistory() {
        document.getElementById('confessionHistoryModal').classList.add('hidden');
    }
    
    // Public API
    return {
        show,
        updateProbability,
        setStarter,
        handleEnter,
        checkInput,
        spin,
        showHistory,
        hideHistory
    };
})();