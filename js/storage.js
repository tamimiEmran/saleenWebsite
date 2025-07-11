// Enhanced NAS storage with debugging and data loss prevention
const API_URL = './save-to-nas.php';

// Add debug mode flag
window.NAS_DEBUG = true; // Set to false in production

// CRITICAL: Add a flag to track if data has been loaded
let dataLoaded = false;
let isLoading = false;

// Store initial state to detect changes
let initialDataState = null;

// Enhanced notification system with debug info
function showNASNotification(message, type = 'success', debugData = null) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = colors[type];
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '1000';
    notification.style.fontSize = '14px';
    notification.style.fontWeight = 'bold';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform 0.3s ease';
    notification.style.maxWidth = '320px';
    notification.style.border = '1px solid rgba(255,255,255,0.2)';
    notification.innerHTML = message;
    
    // Add debug info if available and debug mode is on
    if (window.NAS_DEBUG && debugData) {
        notification.style.cursor = 'pointer';
        notification.onclick = () => {
            console.log('NAS Debug Info:', debugData);
            alert('Debug info logged to console. Check browser console for details.');
        };
        notification.innerHTML += '<br><small style="opacity: 0.8;">Click for debug info</small>';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 6000); // Increased duration for debug mode
}

// Enhanced PHP check with detailed debugging
async function checkPHPFile() {
    try {
        const response = await fetch(API_URL);
        const text = await response.text();
        
        console.log('PHP Check - Raw response:', text);
        
        // Check if we got HTML (error page) instead of JSON
        if (text.startsWith('<!DOCTYPE') || text.includes('<html>')) {
            console.error('PHP file not found or not working. Got HTML instead of JSON.');
            showNASNotification('❌ PHP file missing or server error', 'error');
            return false;
        }
        
        // Check if we got the raw PHP code (PHP not executing)
        if (text.includes('<?php') || text.includes('header(')) {
            console.error('PHP not executing. Check if PHP is enabled on your NAS.');
            showNASNotification('❌ PHP not enabled on NAS', 'error');
            return false;
        }
        
        // Try to parse as JSON
        try {
            const data = JSON.parse(text);
            console.log('PHP Check - Parsed data:', data);
            
            return true;
        } catch (e) {
            console.error('PHP returned invalid JSON:', text);
            showNASNotification('❌ PHP error: ' + text.substring(0, 100), 'error');
            return false;
        }
    } catch (error) {
        console.error('Cannot reach PHP file:', error);
        showNASNotification('❌ Cannot reach save-to-nas.php', 'error');
        return false;
    }
}

// Enhanced load function with better error handling
async function loadFromNAS() {
    // Prevent concurrent loads
    if (isLoading) {
        console.warn('Load already in progress, skipping...');
        return false;
    }
    
    isLoading = true;
    
    try {
        showNASNotification('🔄 Checking NAS connection...', 'info');
        
        const phpWorking = await checkPHPFile();
        if (!phpWorking) {
            isLoading = false;
            return false;
        }
        
        showNASNotification('📥 Loading from NAS...', 'info');
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            showNASNotification(`❌ Server error: ${response.status}`, 'error');
            isLoading = false;
            return false;
        }
        
        const text = await response.text();
        const result = JSON.parse(text);
        
        if (result.success) {
            // CRITICAL: Only update if we have valid data
            if (result.data) {
                // Store the initial state for comparison
                initialDataState = JSON.stringify({
                    articles: result.data.articles || [],
                    confessionHistory: result.data.confessionHistory || [],
                    pointsAccumulated: result.data.pointsAccumulated || 0,
                    concepts: result.data.concepts || []
                });
                
                // Update global variables with loaded data
                articles = result.data.articles || [];
                confessionHistory = result.data.confessionHistory || [];
                pointsAccumulated = result.data.pointsAccumulated || 0;
                concepts = result.data.concepts || [
                    "symbols", "metaphors", "narratives", 
                    "marriage as codependency", "emotional disregulation", 
                    "Life as simulation"
                ];
                
                // CRITICAL: Mark data as loaded
                dataLoaded = true;
                
                const message = result.message || 'Data loaded from NAS!';
                showNASNotification(`✅ ${message}`, 'success', result.debug);
                
                console.log('Data successfully loaded:', {
                    articles: articles.length,
                    confessions: confessionHistory.length,
                    points: pointsAccumulated,
                    concepts: concepts.length
                });
                
                isLoading = false;
                return true;
            } else {
                console.error('No data in response');
                showNASNotification('❌ No data found in response', 'error');
                isLoading = false;
                return false;
            }
        } else {
            console.error('Failed to load:', result);
            showNASNotification(`❌ ${result.error}`, 'error', result.debug);
            isLoading = false;
            return false;
        }
    } catch (error) {
        console.error('Error loading from NAS:', error);
        showNASNotification(`❌ Error: ${error.message}`, 'error');
        isLoading = false;
        return false;
    }
}

// Enhanced save function with data loss prevention
async function saveToNAS() {
    // CRITICAL: Don't save if data hasn't been loaded yet
    if (!dataLoaded) {
        console.error('PREVENTED DATA LOSS: Attempted to save before data was loaded!');
        showNASNotification('⚠️ Waiting for data to load before saving...', 'warning');
        
        // Try to load data first
        const loaded = await loadFromNAS();
        if (!loaded) {
            showNASNotification('❌ Cannot save - data not loaded', 'error');
            return false;
        }
    }
    
    // Check if we're in the middle of loading
    if (isLoading) {
        console.warn('Cannot save while loading is in progress');
        showNASNotification('⚠️ Wait for loading to complete...', 'warning');
        return false;
    }
    
    try {
        showNASNotification('💾 Saving to NAS...', 'info');
        
        const dataToSave = {
            articles,
            confessionHistory,
            pointsAccumulated,
            concepts,
            // Add timestamp for tracking
            lastClientSave: new Date().toISOString()
        };
        
        // Safety check: warn if saving empty data when we previously had data
        if (initialDataState) {
            const initial = JSON.parse(initialDataState);
            if (initial.articles.length > 0 && articles.length === 0) {
                console.warn('WARNING: About to save empty articles when previous data had articles!');
                const confirmSave = confirm('Warning: You are about to save empty articles data. This might overwrite existing articles. Continue?');
                if (!confirmSave) {
                    showNASNotification('❌ Save cancelled to prevent data loss', 'warning');
                    return false;
                }
            }
        }
        
        console.log('Saving data:', {
            articles: dataToSave.articles.length,
            confessions: dataToSave.confessionHistory.length,
            points: dataToSave.pointsAccumulated,
            concepts: dataToSave.concepts.length
        });
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSave)
        });
        
        const text = await response.text();
        console.log('Save response:', text);
        
        const result = JSON.parse(text);
        
        if (result.success) {
            const sizeKB = Math.round(result.fileSize/1024);
            showNASNotification(
                `✅ Saved!`, 
                'success', 
                result.debug
            );
            
            // Update initial state after successful save
            initialDataState = JSON.stringify({
                articles, confessionHistory, pointsAccumulated, concepts
            });
            
            return true;
        } else {
            console.error('Save failed:', result);
            showNASNotification(`❌ Save failed: ${result.error}`, 'error', result.debug);
            return false;
        }
    } catch (error) {
        console.error('Error saving to NAS:', error);
        showNASNotification(`❌ Save error: ${error.message}`, 'error');
        return false;
    }
}

// Auto-save function with safety checks
let saveTimeout;
function autoSaveToNAS() {
    // Don't auto-save if data hasn't been loaded
    if (!dataLoaded) {
        console.warn('Auto-save skipped - data not loaded yet');
        return;
    }
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        const success = await saveToNAS();
        if (!success && window.NAS_DEBUG) {
            console.warn('Auto-save failed. Check debug info above.');
        }
    }, 3000);
}

// Safe wrapper for article operations
const safeArticleOperation = (operation) => {
    if (!dataLoaded) {
        showNASNotification('⚠️ Please wait for data to load...', 'warning');
        return false;
    }
    operation();
    autoSaveToNAS();
    return true;
};

// Safe wrapper for confession operations
const safeConfessionOperation = (operation) => {
    if (!dataLoaded) {
        showNASNotification('⚠️ Please wait for data to load...', 'warning');
        return false;
    }
    operation();
    autoSaveToNAS();
    return true;
};

// Override the save article function with safety check
const originalSaveArticle = window.saveArticle;
window.saveArticle = function() {
    safeArticleOperation(() => {
        originalSaveArticle();
        autoSaveToNAS(); // Ensure save happens after adding article
    });
};

// Override the spin roulette function with safety check and auto-save
const originalSpinRoulette = window.spinRoulette;
window.spinRoulette = function() {
    if (!dataLoaded) {
        showNASNotification('⚠️ Please wait for data to load...', 'warning');
        return;
    }
    
    // Store original spinRoulette to intercept the save
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
                
                // CRITICAL: Save after adding confession
                autoSaveToNAS();
            } else {
                // Add points when confession is discarded
                const points = calculatePoints(parseInt(probability));
                pointsAccumulated += points;
                
                // CRITICAL: Save after updating points
                autoSaveToNAS();
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
};

// Test NAS connection with detailed feedback
window.testNASConnection = async function() {
    console.log('=== Testing NAS Connection ===');
    console.log('Current state:', {
        dataLoaded,
        isLoading,
        articlesCount: articles.length,
        confessionsCount: confessionHistory.length
    });
    
    showNASNotification('🔄 Testing NAS connection...', 'info');
    
    try {
        // First test: Can we reach the PHP file?
        console.log('1. Testing PHP file accessibility...');
        const response = await fetch(API_URL);
        console.log('   Response status:', response.status);
        
        // Second test: Can we parse the response?
        console.log('2. Testing response parsing...');
        const text = await response.text();
        const data = JSON.parse(text);
        console.log('   Parsed data:', data);
        
        // Third test: Try to save
        console.log('3. Testing save functionality...');
        const testData = {
            test: true,
            timestamp: new Date().toISOString(),
            message: 'This is a test save from connection test'
        };
        
        const saveResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        
        const saveResult = await saveResponse.json();
        console.log('   Save result:', saveResult);
        
        if (saveResult.success) {
            showNASNotification('✅ NAS connection working perfectly!', 'success', saveResult.debug);
        } else {
            showNASNotification('⚠️ Connection OK but save failed', 'warning', saveResult.debug);
        }
        
    } catch (error) {
        console.error('Connection test failed:', error);
        showNASNotification('❌ Connection test failed', 'error');
    }
    
    console.log('=== End Connection Test ===');
}

// Initialize with better error handling
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing NAS storage system...');
    console.log('Debug mode:', window.NAS_DEBUG ? 'ON' : 'OFF');
    
    // CRITICAL: Set loading state
    dataLoaded = false;
    
    // Load from NAS
    const loaded = await loadFromNAS();
    
    if (!loaded) {
        console.warn('⚠️ Could not load from NAS. Using local defaults.');
        showNASNotification('⚠️ Using local data. Check NAS connection.', 'warning');
        
        // If we can't load, at least mark data as "loaded" with defaults
        // to allow the app to function
        dataLoaded = true;
    }
    
    // Create storage controls
    setTimeout(() => {
        if (!document.getElementById('mainMenu').classList.contains('hidden')) {
            createNASStorageControls();
        }
    }, 100);
});

// Keep all the other functions from the original...
// [Include all remaining functions like showNASDataInfo, createNASStorageControls, etc.]

// Override all save/edit operations to include safety checks
const originalSaveEditedArticle = window.saveEditedArticle;
window.saveEditedArticle = function(articleId) {
    safeArticleOperation(() => {
        originalSaveEditedArticle(articleId);
        autoSaveToNAS(); // Ensure save happens after edit
    });
};

// Override concept additions with proper save trigger
const originalAddNewConcept = window.addNewConcept;
window.addNewConcept = function() {
    if (!dataLoaded) {
        showNASNotification('⚠️ Please wait for data to load...', 'warning');
        return;
    }
    
    // Override the showCustomPrompt callback to include auto-save
    showCustomPrompt('Enter a new concept to add to the permanent list:', function(newConcept) {
        if (newConcept && newConcept.trim()) {
            const trimmedConcept = newConcept.trim();
            if (!concepts.includes(trimmedConcept)) {
                concepts.push(trimmedConcept);
                alert('"' + trimmedConcept + '" has been added to your concept list! 🎉');
                selectedConcepts = [];
                renderConceptSuggestions();
                
                // CRITICAL: Trigger auto-save after adding concept
                autoSaveToNAS();
            } else {
                alert('This concept already exists in your list! 📝');
            }
        }
    });
};

// Add a visual indicator when data is loading
function showLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'loadingIndicator';
    indicator.style.position = 'fixed';
    indicator.style.top = '50%';
    indicator.style.left = '50%';
    indicator.style.transform = 'translate(-50%, -50%)';
    indicator.style.background = 'rgba(255, 255, 255, 0.95)';
    indicator.style.padding = '30px';
    indicator.style.borderRadius = '15px';
    indicator.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    indicator.style.zIndex = '3000';
    indicator.innerHTML = `
        <h3 style="color: #667eea; margin-bottom: 15px;">Loading from NAS...</h3>
        <p style="color: #666;">Please wait while we load your data.</p>
    `;
    document.body.appendChild(indicator);
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Update the load function to show indicator
const originalLoadFromNAS = loadFromNAS;
loadFromNAS = async function() {
    showLoadingIndicator();
    const result = await originalLoadFromNAS();
    hideLoadingIndicator();
    return result;
};