# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a vanilla JavaScript web application with no build system. Development involves:

- **Local Server**: Use any HTTP server (e.g., `python -m http.server 8000` or VS Code Live Server)
- **No Build Process**: Files are served directly - edit and refresh browser
- **No Package Manager**: Pure vanilla JS, no npm/yarn dependencies
- **Testing**: Manual testing in browser - no automated test framework

## Architecture Overview

This is a modular vanilla JavaScript single-page application with the following architecture:

### Core Architecture Pattern
- **Module Pattern**: Each feature is an IIFE (Immediately Invoked Function Expression) module
- **Global State Management**: Centralized state via `AppState` module with subscription system
- **Event-Driven**: Modules communicate through state changes and notifications
- **No Framework**: Pure vanilla JS with manual DOM manipulation

### Module Loading Order (Critical)
The HTML loads modules in specific order due to dependencies:
1. **Core**: `state.js`, `utils.js`, `storage.js` 
2. **Features**: `auth.js`, `navigation.js`, `articles.js`, `confessions.js`, `suggestions.js`
3. **App**: `app.js` (initialization)

### Key Modules

**State Management (`js/modules/state.js`)**:
- Central state store with subscription system
- Specialized nested APIs for articles, confessions, concepts
- Reactive updates notify all subscribers

**Storage (`js/modules/storage.js`)**:
- Auto-save to NAS via PHP backend every 3 seconds after changes
- Graceful fallback to local operation if NAS unavailable
- Load/save through `./save-to-nas.php` endpoint

**Navigation (`js/modules/navigation.js`)**:
- View routing between login, menu, articles, confessions, suggestions
- User switching between "Saleen" and "Emran" 
- Settings dropdown with connection testing and data info

### Data Structure
**Storage Format** (`app_data.json`):
```json
{
  "articles": [{"id": number, "title": string, "concept": string, "content": string, "date": string, "notes": array}],
  "confessionHistory": [{"confession": string, "sent": boolean, "probability": string, "date": string}],
  "pointsAccumulated": number,
  "concepts": [strings],
  "lastSaved": ISO_date,
  "savedBy": "Synology NAS"
}
```

### Backend Integration
- **PHP Backend**: `save-to-nas.php` handles GET/POST for data persistence
- **NAS Storage**: Synology NAS with PHP support for file operations
- **Connection Testing**: Built-in diagnostics for PHP/server issues

### Development Notes
- **File Structure**: Flat structure with `js/modules/` for organization
- **No Transpilation**: ES5 compatible code, no modern JS features requiring compilation
- **Keyboard Shortcuts**: Ctrl/Cmd+S saves, Escape returns to menu
- **User Context**: App supports dual users (Saleen/Emran) with shared data but different contexts

### Common Debugging
- Check browser console for PHP connection issues
- Use "Test NAS Connection" in settings menu
- Storage module has extensive logging for debugging PHP/NAS issues
- All modules expose their APIs globally for console debugging