# Data Storage Documentation

This document provides comprehensive documentation for the data storage and synchronization system used in this web application.

## Overview

The application uses a hybrid storage approach that combines in-memory JavaScript variables with persistent storage on a Synology NAS. Data flows between three main components:

1. **js/data.js** - Global data variables and initialization
2. **js/storage.js** - NAS synchronization and data persistence logic  
3. **save-to-nas.php** - Backend API for reading/writing data files

## Module: js/data.js

### Purpose
Defines global variables that store all application data during runtime. Acts as the single source of truth for the application state.

### Global Variables

```javascript
let articles = [];              // Array of article objects
let currentConfession = '';     // Currently entered confession text
let probability = 30;           // Confession roulette probability (10-50%)
let confessionHistory = [];     // Array of sent confessions
let concepts = [];              // Array of concept strings for articles
let selectedConcepts = [];      // Currently selected concepts for new articles
```

### Data Structures

#### Article Object
```javascript
{
    id: 1748150543217,           // Timestamp-based unique ID
    title: "Article Title",      // User-provided title
    concept: "Philosophy",       // Associated concept(s)
    content: "Article text...",  // Full article content
    date: "5/25/2025",          // Creation date (MM/DD/YYYY)
    lastEdited: "5/26/2025",    // Last edit date (optional)
    notes: []                    // Array of notes (currently unused)
}
```

#### Confession History Object
```javascript
{
    confession: "Secret text...",           // The confession text
    sent: true,                            // Whether it was "sent" (saved)
    probability: "50",                     // Probability used (as string)
    date: "5/27/2025, 2:38:01 PM"        // Timestamp of submission
}
```

### Sample Data
- **confessions[]**: Array of 24 sample confession templates
- **concepts[]**: Default concept suggestions including "symbols", "metaphors", "narratives", etc.

## Module: js/storage.js

### Purpose
Handles all data persistence operations between the frontend and NAS storage. Includes comprehensive error handling, data loss prevention, and debug capabilities.

### Key Features

#### Data Loss Prevention
- **Load-before-save**: Prevents saving until data is loaded from NAS
- **Empty data warnings**: Alerts when saving empty data that previously contained items
- **Concurrent operation protection**: Prevents multiple simultaneous load/save operations
- **Initial state tracking**: Compares current data with loaded state to detect changes

#### Debug System
```javascript
window.NAS_DEBUG = true;  // Enable debug mode
```
- Detailed console logging for all operations
- Visual notifications with debug info
- Connection testing utilities
- State tracking and validation

### Core Functions

#### `loadFromNAS()`
```javascript
async function loadFromNAS()
```
- **Purpose**: Loads data from NAS and populates global variables
- **Returns**: `true` if successful, `false` if failed
- **Side effects**: 
  - Sets `dataLoaded = true` on success
  - Updates all global data variables
  - Stores `initialDataState` for comparison
  - Shows loading notifications

#### `saveToNAS()`
```javascript
async function saveToNAS()
```
- **Purpose**: Saves current global data to NAS
- **Returns**: `true` if successful, `false` if failed
- **Safety checks**:
  - Verifies data is loaded before saving
  - Warns about empty data overwrites
  - Prevents concurrent operations
- **Data sent**: All global variables plus `lastClientSave` timestamp

#### `autoSaveToNAS()`
```javascript
function autoSaveToNAS()
```
- **Purpose**: Debounced auto-save trigger (3-second delay)
- **Usage**: Called after any data modification
- **Safety**: Only saves if `dataLoaded = true`

#### `checkPHPFile()`
```javascript
async function checkPHPFile()
```
- **Purpose**: Validates PHP backend accessibility and functionality
- **Checks**:
  - PHP file exists and is executable
  - Returns valid JSON (not HTML error pages)
  - PHP is enabled on the server
- **Returns**: `true` if PHP backend is working

### State Management

#### Critical Variables
```javascript
let dataLoaded = false;      // Whether data has been loaded from NAS
let isLoading = false;       // Whether a load operation is in progress
let initialDataState = null; // JSON string of initial loaded data
```

#### Operation Overrides
The storage module overrides key user operations to ensure data safety:

- **Article operations**: `saveArticle()`, `saveEditedArticle()`
- **Confession operations**: `spinRoulette()`
- **Concept operations**: `addNewConcept()`

Each override adds safety checks and auto-save triggers.

### Notification System

#### `showNASNotification(message, type, debugData)`
- **Types**: 'success', 'error', 'info', 'warning'
- **Features**:
  - Color-coded notifications
  - Auto-dismissal after 6 seconds
  - Click-to-view debug info in debug mode
  - Fixed positioning with slide animations

### Testing and Debugging

#### `testNASConnection()`
```javascript
window.testNASConnection()
```
- **Purpose**: Comprehensive connection testing
- **Tests**:
  1. PHP file accessibility
  2. Response parsing
  3. Save functionality
- **Output**: Detailed console logs and notifications

## Module: save-to-nas.php

### Purpose
Backend API that handles data persistence to the NAS filesystem. Provides RESTful endpoints for reading and writing application data.

### API Endpoints

#### GET Request - Load Data
```php
GET ./save-to-nas.php
```
**Response Format**:
```json
{
    "success": true,
    "data": {
        "articles": [...],
        "confessionHistory": [...],
        "pointsAccumulated": 0,
        "concepts": [...],
        "lastSaved": "2025-05-27T14:38:06+03:00",
        "savedBy": "Synology NAS"
    },
    "message": "Data loaded successfully"
}
```

**Default Response** (if file doesn't exist):
```json
{
    "success": true,
    "data": {
        "articles": [],
        "confessionHistory": [],
        "pointsAccumulated": 0,
        "concepts": ["symbols", "metaphors", "narratives", ...]
    },
    "message": "defaults"
}
```

#### POST Request - Save Data
```php
POST ./save-to-nas.php
Content-Type: application/json

{
    "articles": [...],
    "confessionHistory": [...],
    "pointsAccumulated": 0,
    "concepts": [...],
    "lastClientSave": "2025-05-27T11:38:04.931Z"
}
```

**Response Format**:
```json
{
    "success": true,
    "message": "Data saved successfully to NAS",
    "timestamp": "2025-05-27T14:38:06+03:00",
    "fileSize": 2048,
    "filePath": "/path/to/app_data.json"
}
```

### Data Processing

#### Automatic Metadata Addition
On POST requests, the script automatically adds:
- `lastSaved`: Server timestamp in ISO format
- `savedBy`: "Synology NAS" identifier

#### File Operations
- **Target file**: `app_data.json` in same directory as PHP script
- **Format**: Pretty-printed JSON with 4-space indentation
- **Permissions**: Requires write access to directory

### Error Handling

#### Common Error Responses
```json
{
    "success": false,
    "error": "Invalid JSON data received"
}
```

```json
{
    "success": false,
    "error": "Failed to write to data file. Check permissions."
}
```

#### CORS Configuration
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

### Security Considerations
- No authentication or authorization
- Accepts requests from any origin (CORS *)
- Direct file system access
- No input validation beyond JSON parsing

## Data Flow Architecture

### Application Startup
1. **DOM Ready**: `storage.js` initializes
2. **Load Data**: `loadFromNAS()` called automatically
3. **State Update**: Global variables populated
4. **UI Render**: Components render with loaded data
5. **Ready State**: `dataLoaded = true`, app ready for user interaction

### User Actions
1. **User Interaction**: Article creation, confession submission, etc.
2. **Data Modification**: Global variables updated
3. **Auto-Save Trigger**: `autoSaveToNAS()` called with 3-second delay
4. **Backend Sync**: Data sent to PHP script
5. **File Update**: `app_data.json` updated on NAS
6. **Confirmation**: User notification of save status

### Error Recovery
1. **Load Failure**: App continues with default data, warns user
2. **Save Failure**: User notified, data remains in memory
3. **Connection Loss**: Operations continue locally, sync resumes when available
4. **Data Corruption**: Load fails, defaults used, user alerted

## File Structure

```
/mnt/m/website/saleena/
├── app_data.json           # Persistent data file
├── save-to-nas.php         # Backend API
├── js/
│   ├── data.js            # Global data variables
│   ├── storage.js         # NAS synchronization
│   └── [other modules]
└── index.html             # Frontend entry point
```

## Best Practices

### For Development
1. Enable debug mode: `window.NAS_DEBUG = true`
2. Use `testNASConnection()` to verify setup
3. Monitor console for detailed operation logs
4. Test with network disconnection scenarios

### For Production
1. Disable debug mode: `window.NAS_DEBUG = false`
2. Ensure PHP write permissions on NAS
3. Regular backup of `app_data.json`
4. Monitor storage notifications for errors

### Data Safety
1. Always load data before making changes
2. Use auto-save wrappers for all operations
3. Validate data integrity after major changes
4. Keep backups of `app_data.json` before updates