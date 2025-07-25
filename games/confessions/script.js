var Confessions = (function() {
    let probability = 30;
    let currentConfession = '';

    function show() {
        updateProbability();
        checkInput();
    }

    function updateProbability() {
        probability = document.getElementById('probabilitySlider').value;
        document.getElementById('probabilityValue').textContent = probability + '%';
    }

    function setStarter(text) {
        document.getElementById('confessionInput').value = text;
        document.getElementById('confessionInput').focus();
        checkInput();
    }

    function checkInput() {
        const confessionText = document.getElementById('confessionInput').value.trim();
        document.getElementById('spinButton').disabled = !confessionText;
    }

    function spin() {
        const confessionText = document.getElementById('confessionInput').value.trim();
        if (!confessionText) return;

        currentConfession = confessionText;
        document.getElementById('confessionInput').value = '';
        document.getElementById('spinButton').disabled = true;

        const isSent = Math.random() * 100 < probability;
        showSpinAnimation(isSent);
    }

    function showSpinAnimation(isSent) {
        const resultOverlay = document.getElementById('resultOverlay');
        const resultContent = document.getElementById('resultContent');

        resultContent.innerHTML = `<div class="result-icon">⏳</div><h3>Pulling the trigger...</h3>`;
        resultContent.className = 'result-content'; // Reset classes
        resultOverlay.classList.remove('hidden');

        setTimeout(() => {
            if (isSent) {
                AppState.confessions.add({
                    confession: currentConfession,
                    sent: true,
                    probability: probability,
                    date: new Date().toLocaleString()
                });
            } else {
                const points = probability / 10;
                AppState.confessions.addPoints(points);
            }
            showResult(isSent);
        }, 1200); // Suspense delay
    }

    function showResult(isSent) {
        const resultContent = document.getElementById('resultContent');
        if (isSent) {
            resultContent.className = 'result-content sent';
            resultContent.innerHTML = `
                <div class="result-icon">💥</div>
                <h3>BANG!</h3>
                <p>Your confession has been sent.</p>
                <p class="result-quote">"${currentConfession}"</p>`;
        } else {
            const pointsEarned = probability / 10;
            const totalPoints = AppState.get('pointsAccumulated');
            resultContent.className = 'result-content discarded';
            resultContent.innerHTML = `
                <div class="result-icon">✓</div>
                <h3>*CLICK*</h3>
                <p>Your secret is safe and discarded.</p>
                <div class="result-points">
                    <p>+${pointsEarned} Points!</p>
                    <small>Total: ${totalPoints} Points</small>
                </div>`;
        }
    }

    function hideResult() {
        document.getElementById('resultOverlay').classList.add('hidden');
    }

    function showHistory() {
        const modal = document.getElementById('confessionHistoryModal');
        const listEl = document.getElementById('confessionHistoryList');
        const sentConfessions = AppState.confessions.getSent();
        const points = AppState.get('pointsAccumulated');

        let historyHTML = `<div class="history-points">🏆 Total Points: ${points}</div>`;
        if (sentConfessions.length > 0) {
            historyHTML += sentConfessions.map(item => `
                <div class="history-item sent">
                    <p>"${item.confession}"</p>
                    <div class="history-item-prob">Risk: ${item.probability}% on ${item.date}</div>
                </div>`).reverse().join('');
        } else {
            historyHTML += '<p style="text-align:center; color:#666;">No confessions sent yet. 🤐</p>';
        }
        
        listEl.innerHTML = historyHTML;
        modal.classList.remove('hidden');
    }

    function hideHistory() {
        document.getElementById('confessionHistoryModal').classList.add('hidden');
    }

    // Public API - expose new hideResult function
    return {
        show, updateProbability, setStarter, checkInput, spin, 
        showHistory, hideHistory, hideResult
    };
})();
