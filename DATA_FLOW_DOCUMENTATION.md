# Data Flow Documentation
## Saleen Website Application

### Overview
This document details the complete data flow from user interactions to server persistence and back, including all components involved in the process.

---

## Architecture Overview

```
User Interface → AppState (Central Store) → Storage Module → PHP Backend → JSON File → NAS Storage
     ↑                                                                                      ↓
     ←─────────────────── Notifications & UI Updates ←─────────────────────────────────────
```

---

## Components & Responsibilities

### 1. **User Interface Modules**
- **Articles.js**: Article creation, editing, concept management
- **Confessions.js**: Anonymous confession submission with probability logic
- **Suggestions.js**: Multi-user suggestion system with categorization
- **Grievances.js**: Issue tracking with severity levels
- **Navigation.js**: Route management and user switching

### 2. **State Management**
- **AppState.js**: Central reactive state store with subscription system
- **Utils.js**: Notification system and UI helpers

### 3. **Data Persistence**
- **Storage.js**: Client-side storage orchestration with auto-save
- **save-to-nas.php**: Server-side PHP script for file operations
- **app_data.json**: Persistent data file on NAS

---

## Detailed Data Flow

### **User Action → State Update Flow**

#### Step 1: User Interaction
```javascript
// Example: User adds a grievance
User fills form → clicks "Add Grievance" → Grievances.addGrievance()
```

#### Step 2: Data Validation & Processing
```javascript
function addGrievance() {
    const details = document.getElementById('grievanceDetails').value.trim();
    const severityValue = document.getElementById('grievanceSeverity').value;
    const severities = ['', 'Low', 'Medium', 'High', 'Critical'];
    const severity = severities[severityValue];
    
    if (!details) {
        Utils.notify('Please enter grievance details.', 'warning');
        return;
    }
    
    // Create data object
    const grievanceData = {
        details,
        severity,
        date: new Date().toLocaleDateString(),
        clickCount: 0
    };
}
```

#### Step 3: State Update
```javascript
// Get current state
const grievances = AppState.get('grievances') || [];

// Add new data
grievances.push(grievanceData);

// Update state (triggers subscribers)
AppState.set('grievances', grievances);
```

#### Step 4: State Change Propagation
```javascript
// AppState.js - Subscription system
set(key, value) {
    state[key] = value;
    this.notify(key, value);  // Notifies all subscribers
}

notify(key, value) {
    if (listeners[key]) {
        listeners[key].forEach(callback => callback(value));
    }
    
    // Also notify wildcard listeners
    if (listeners['*']) {
        listeners['*'].forEach(callback => callback(key, value));
    }
}
```

#### Step 5: Auto-Save Trigger
```javascript
// Storage.js - Auto-save subscription
AppState.subscribe('*', () => {
    if (AppState.get('dataLoaded')) {
        autoSave();  // Debounced save after 3 seconds
    }
});

function autoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        save();  // Triggers server communication
    }, 3000);
}
```

### **Client → Server Communication Flow**

#### Step 6: Data Serialization
```javascript
async function save() {
    const dataToSave = {
        articles: AppState.get('articles'),
        confessionHistory: AppState.get('confessionHistory'),
        pointsAccumulated: AppState.get('pointsAccumulated'),
        concepts: AppState.get('concepts'),
        grievances: AppState.get('grievances'),
        suggestions: AppState.get('suggestions'),
        lastSaved: new Date().toISOString()
    };
    
    // HTTP POST to PHP backend
    const response = await fetch('./save-to-nas.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
    });
}
```

#### Step 7: Server Processing
```php
// save-to-nas.php
case 'POST':
    // Receive JSON data
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Add server metadata
    $input['lastSaved'] = date('c');
    $input['savedBy'] = 'Synology NAS';
    
    // Write to file system
    $jsonString = json_encode($input, JSON_PRETTY_PRINT);
    
    if (file_put_contents($dataFile, $jsonString) !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'Data saved successfully to NAS',
            'timestamp' => date('c'),
            'fileSize' => strlen($jsonString),
            'filePath' => $dataFile
        ]);
    }
```

#### Step 8: File System Persistence
```
Data Flow: JSON → app_data.json → Synology NAS Storage
Location: /path/to/website/app_data.json
Format: Pretty-printed JSON with metadata
```

### **Server → Client Data Loading Flow**

#### Step 9: Application Initialization
```javascript
// app.js - App startup
async function init() {
    try {
        await Storage.load();  // Load data from server
    } catch (error) {
        console.error('Failed to load data:', error);
        Utils.notify('Using local data', 'warning');
    }
    
    Navigation.show('login');
}
```

#### Step 10: Data Retrieval
```javascript
// Storage.js - Load from server
async function load() {
    const response = await fetch('./save-to-nas.php');  // GET request
    const text = await response.text();
    
    // Parse server response
    const result = JSON.parse(text);
    
    if (result.success && result.data) {
        // Update AppState with server data
        AppState.update({
            articles: result.data.articles || [],
            confessionHistory: result.data.confessionHistory || [],
            pointsAccumulated: result.data.pointsAccumulated || 0,
            concepts: result.data.concepts || AppState.get('concepts'),
            grievances: result.data.grievances || [],
            suggestions: result.data.suggestions || { forSaleen: [], forEmran: [], forUs: [] },
            dataLoaded: true
        });
    }
}
```

#### Step 11: Server Data Retrieval
```php
// save-to-nas.php - GET handler
case 'GET':
    if (file_exists($dataFile)) {
        $data = file_get_contents($dataFile);
        $jsonData = json_decode($data, true);
        
        echo json_encode([
            'success' => true,
            'data' => $jsonData
        ]);
    } else {
        // Return default structure if file doesn't exist
        echo json_encode([
            'success' => true,
            'data' => [
                'articles' => [],
                'confessionHistory' => [],
                'pointsAccumulated' => 0,
                'concepts' => [...],
                'grievances' => [],
                'suggestions' => { forSaleen: [], forEmran: [], forUs: [] }
            ]
        ]);
    }
```

#### Step 12: UI Synchronization
```javascript
// AppState.js - State updates trigger UI refresh
AppState.update(serverData);
// ↓ Triggers all subscribed UI components to re-render
// ↓ Each module updates its displayed content automatically
```

---

## Data Structure Schema

### **Complete Application State**
```json
{
  "articles": [
    {
      "id": 1234567890,
      "title": "Article Title",
      "concept": "Topic/Concept",
      "content": "Article content...",
      "date": "MM/DD/YYYY",
      "notes": [],
      "lastEdited": "MM/DD/YYYY"
    }
  ],
  "confessionHistory": [
    {
      "confession": "Confession text",
      "sent": true,
      "probability": "50",
      "date": "MM/DD/YYYY, HH:MM:SS AM/PM"
    }
  ],
  "grievances": [
    {
      "details": "Grievance description",
      "severity": "Medium",
      "date": "MM/DD/YYYY",
      "clickCount": 0
    }
  ],
  "suggestions": {
    "forSaleen": [
      {
        "id": 1234567890,
        "type": "movie",
        "content": "Movie title or URL",
        "isLink": false,
        "completed": false,
        "date": "MM/DD/YYYY",
        "from": "Emran"
      }
    ],
    "forEmran": [...],
    "forUs": [...]
  },
  "pointsAccumulated": 10,
  "concepts": ["concept1", "concept2", ...],
  "lastSaved": "2025-07-12T10:30:00.000Z",
  "savedBy": "Synology NAS"
}
```

---

## Error Handling & Resilience

### **Connection Failure Handling**
```javascript
// Storage.js - Graceful degradation
try {
    await save();
} catch (error) {
    Utils.notify(`Save failed: ${error.message}`, 'error');
    // App continues to work with local state
    // Auto-save will retry on next state change
}
```

### **PHP/Server Error Detection**
```javascript
// Storage.js - Server health checking
if (text.includes('<?php') || text.includes('<!DOCTYPE')) {
    throw new Error('PHP not configured correctly');
}

// Connection testing available in settings
async function testConnection() {
    // Comprehensive diagnostics for PHP/NAS issues
    // Reports specific error types to user
}
```

### **Data Consistency**
- **Auto-save**: 3-second debounce prevents excessive server calls
- **State synchronization**: All UI updates go through AppState
- **Optimistic updates**: UI updates immediately, with server sync in background
- **Fallback data**: Default data structure provided if server unavailable

---

## Performance Considerations

### **Efficient Data Flow**
- **Debounced saves**: Multiple rapid changes batched into single save
- **Selective updates**: Only changed data triggers re-renders
- **Local-first**: UI responds immediately to user actions
- **Background sync**: Server communication doesn't block UI

### **Memory Management**
- **Event cleanup**: Proper unsubscribe mechanisms for state listeners
- **DOM efficiency**: Targeted updates instead of full page re-renders
- **Minimal state**: Only essential data kept in memory

---

## Security Considerations

### **Input Validation**
- **Client-side**: Form validation and sanitization
- **Server-side**: JSON validation and file system protections
- **XSS Prevention**: Proper HTML escaping in dynamic content

### **File Access Control**
- **Restricted paths**: PHP script only accesses designated data file
- **CORS headers**: Proper cross-origin resource sharing configuration
- **Error message sanitization**: No sensitive information in error responses

---

## Monitoring & Debugging

### **Built-in Diagnostics**
- **Connection testing**: Available in settings menu
- **Console logging**: Detailed logs for development
- **User notifications**: Real-time feedback for all operations
- **Data statistics**: Available in settings dropdown

### **Debug Information**
```javascript
// Available in browser console
AppState.getSnapshot()  // Current complete state
Storage.testConnection()  // Server connectivity test
// All modules exposed globally for debugging
```

This data flow ensures reliable, efficient, and user-friendly data persistence across the entire application lifecycle.