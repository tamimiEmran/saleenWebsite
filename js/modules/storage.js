// js/modules/storage.js
const Storage = (function() {
    const API_URL = './save-to-nas.php';
    let saveTimeout;
    let isSaving = false;
    
    // Subscribe to state changes for auto-save
    AppState.subscribe('*', () => {
        if (AppState.get('dataLoaded')) {
            autoSave();
        }
    });
    
    function showNotification(message, type = 'success') {
        Utils.notify(message, type);
    }
    
    async function checkConnection() {
        try {
            const response = await fetch(API_URL);
            const text = await response.text();
            
            if (text.includes('<?php') || text.includes('<!DOCTYPE')) {
                throw new Error('PHP not configured correctly');
            }
            
            const data = JSON.parse(text);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async function load() {
        if (AppState.get('isLoading')) {
            console.warn('Load already in progress');
            return false;
        }
        
        AppState.set('isLoading', true);
        
        try {
            // Silent loading - no notification
            const response = await fetch(API_URL);
            const text = await response.text();
            
            // Debug: Log what we received
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));
            console.log('First 200 chars of response:', text.substring(0, 200));
            
            // Check if we got HTML instead of JSON
            if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
                console.error('Got HTML instead of JSON. PHP file not found or not executing.');
                throw new Error('PHP file not found or not executing');
            }
            
            // Try to parse JSON
            const result = JSON.parse(text);
            
            if (result.success && result.data) {
                // Update state with loaded data
                AppState.update({
                    articles: result.data.articles || [],
                    confessionHistory: result.data.confessionHistory || [],
                    pointsAccumulated: result.data.pointsAccumulated || 0,
                    concepts: result.data.concepts || AppState.get('concepts'),
                    dataLoaded: true
                });
                
                // Success - no notification
                return true;
            } else {
                throw new Error(result.error || 'Failed to load data');
            }
        } catch (error) {
            showNotification(`Load failed: ${error.message}`, 'error');
            AppState.set('dataLoaded', true); // Allow app to work with defaults
            return false;
        } finally {
            AppState.set('isLoading', false);
        }
    }
    
    async function save() {
        if (!AppState.get('dataLoaded') || isSaving) {
            return false;
        }
        
        isSaving = true;
        
        try {
            const dataToSave = {
                articles: AppState.get('articles'),
                confessionHistory: AppState.get('confessionHistory'),
                pointsAccumulated: AppState.get('pointsAccumulated'),
                concepts: AppState.get('concepts'),
                lastSaved: new Date().toISOString()
            };
            
            console.log('Attempting to save to:', API_URL);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });
            
            const text = await response.text();
            
            // Debug: Log what we received
            console.log('Save response status:', response.status);
            console.log('Save response:', text.substring(0, 200));
            
            // Check if we got HTML instead of JSON
            if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
                console.error('Got HTML instead of JSON on save. PHP issue.');
                throw new Error('PHP file not executing properly');
            }
            
            const result = JSON.parse(text);
            
            if (result.success) {
                // Success - no notification
                return true;
            } else {
                throw new Error(result.error || 'Save failed');
            }
        } catch (error) {
            showNotification(`Save failed: ${error.message}`, 'error');
            return false;
        } finally {
            isSaving = false;
        }
    }
    
    function autoSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            save();
        }, 3000);
    }
    
    async function testConnection() {
        console.log('=== Testing NAS Connection ===');
        console.log('API URL:', API_URL);
        
        try {
            // Test 1: Basic fetch
            console.log('Test 1: Fetching PHP file...');
            const response = await fetch(API_URL);
            console.log('Response status:', response.status);
            console.log('Content-Type:', response.headers.get('content-type'));
            
            const text = await response.text();
            console.log('Response text (first 500 chars):', text.substring(0, 500));
            
            // Check what we got
            if (text.includes('<?php')) {
                console.error('ERROR: PHP code is being returned as text. PHP is not executing on your server.');
                showNotification('PHP is not enabled on your server!', 'error');
                return false;
            }
            
            if (text.startsWith('<!DOCTYPE') || text.includes('<html')) {
                console.error('ERROR: Getting HTML page. Possible issues:');
                console.error('1. Wrong file path (404 error)');
                console.error('2. Server error page');
                console.error('3. PHP error outputting HTML');
                showNotification('Cannot find PHP file or server error!', 'error');
                return false;
            }
            
            // Try to parse as JSON
            try {
                const data = JSON.parse(text);
                console.log('SUCCESS: Got valid JSON:', data);
                showNotification('PHP connection working!', 'success');
                return true;
            } catch (e) {
                console.error('ERROR: Invalid JSON:', e);
                console.error('Response was:', text);
                showNotification('PHP file returning invalid data!', 'error');
                return false;
            }
            
        } catch (error) {
            console.error('ERROR: Network or other error:', error);
            showNotification('Cannot connect to PHP file!', 'error');
            return false;
        }
    }
    
    // Public API
    return {
        checkConnection,
        load,
        save,
        autoSave,
        testConnection  // Add test function
    };
})();