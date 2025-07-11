# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

This is a password-protected personal web application built with vanilla HTML, CSS, and JavaScript. The application consists of two main interactive features:

1. **Article Collection System**: Users can write and manage philosophical articles about various concepts
2. **Confession Roulette Game**: A gambling-style game where users type confessions that may or may not be "sent" based on probability

## Architecture

### Frontend Structure
- **index.html**: Main HTML file with all UI components
- **styles.css**: All styling for the application
- **js/**: JavaScript modules organized by functionality
  - `main.js`: Application initialization
  - `auth.js`: Password authentication (password: "saleen")
  - `navigation.js`: Page navigation between sections
  - `data.js`: Global data storage and sample data
  - `articles.js`: Article creation, editing, and concept management
  - `confessions.js`: Confession roulette game logic
  - `storage.js`: NAS data persistence and sync
  - `utils.js`: Helper functions for modals and utilities

### Backend Components
- **save-to-nas.php**: PHP script that handles GET/POST requests for data persistence
- **app_data.json**: JSON file containing all application data (articles, confessions, points, concepts)

## Data Flow

The application uses a hybrid storage approach:
1. **In-memory storage**: All data is stored in JavaScript variables during runtime
2. **NAS persistence**: Data is automatically saved to `app_data.json` via PHP backend
3. **Auto-sync**: Changes trigger automatic saves to prevent data loss

Key data structures:
- `articles[]`: Array of article objects with id, title, concept, content, date
- `confessionHistory[]`: Array of sent confessions with metadata
- `pointsAccumulated`: Integer tracking gambling points
- `concepts[]`: Array of concept strings for article topics

## Development Commands

This is a static web application with no build process. For development:

```bash
# Start local PHP server (if testing NAS features)
php -S localhost:8000

# Or serve static files with any web server
python -m http.server 8000
```

## Key Features

### Authentication System
- Simple password protection (hardcoded in `auth.js`)
- Password: "saleen"
- No session management or secure authentication

### Article System
- Create articles with title, concept, and content
- Select from predefined concepts or add new ones
- Edit existing articles with change tracking
- Concept suggestions and combinations

### Confession Roulette
- Probability-based gambling game (10%-50% send chance)
- Points system: lower probability = fewer points when safe
- Confession history tracking (only sent confessions are saved)
- Visual feedback with animations

### NAS Integration
- Automatic data synchronization with Synology NAS
- Real-time notifications for save/load operations
- Data loss prevention mechanisms
- Debug mode for troubleshooting storage issues

## File Dependencies

JavaScript files must be loaded in this order (as defined in index.html):
1. `data.js` - Global variables and sample data
2. `storage.js` - NAS storage functions
3. `utils.js` - Helper functions
4. `auth.js` - Authentication
5. `navigation.js` - Page navigation
6. `articles.js` - Article functionality
7. `confessions.js` - Confession game
8. `main.js` - Application initialization

## Important Notes

- The application contains personal content and should be treated as private
- No external dependencies or frameworks are used
- All styling is done with vanilla CSS including gradients and animations
- The PHP backend requires write permissions to save `app_data.json`
- Debug mode can be enabled by setting `window.NAS_DEBUG = true` in storage.js