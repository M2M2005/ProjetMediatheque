# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a library management system (Médiathèque) built as a JavaScript university project focusing on AJAX implementation. The application manages library members (adhérents), books (livres), and loans (emprunts) with real-time UI updates.

## Key Technologies

- **Frontend**: HTML5, CSS3, JavaScript with custom reactive library
- **Backend**: PHP (MVC architecture)
- **Database**: MySQL/MariaDB
- **Architecture**: AJAX-based single page application with reactive UI

## Database Configuration

Database credentials are configured in `src/php/Model/Conf.php`. The database schema is defined in `src/mediatheque.sql` with three tables:
- `adherent` (members)
- `livre` (books)
- `emprunt` (loans)

## Development Commands

Since this is a vanilla PHP/JavaScript project without package managers:
- **Setup database**: Import `src/mediatheque.sql` into your MySQL database
- **Run locally**: Deploy files to a web server with PHP support (e.g., in `public_html` directory)
- **Database config**: Update credentials in `src/php/Model/Conf.php`

## Project Structure

The application follows an MVC pattern:
- **Controllers** (`src/php/Controller/`): Handle HTTP requests and responses
  - `ControllerAdherent.php`: Member management
  - `ControllerLivre.php`: Book management (includes custom `readAllDisponible` action)
  - `ControllerEmprunt.php`: Loan management
- **Models** (`src/php/Model/`): Database interactions
- **Frontend** (`src/`):
  - `mediatheque.html`: Main entry point
  - `js/script.js`: Application logic using reactive library
  - `js/reactiveMinified.js`: Custom reactive framework for automatic UI updates

## API Endpoints

All controllers support these actions via GET parameters:
- `?action=readAll`: Get all records (JSON)
- `?action=create`: Create new record (POST data required)
- `?action=delete&id=X`: Delete record by ID

Additional custom actions:
- `ControllerLivre.php?action=readAllDisponible`: Get available books
- `ControllerLivre.php?action=select&id=X`: Get specific book details

## Key Implementation Notes

- The reactive library (`reactiveMinified.js`) automatically updates the UI when the `mediatheque` object changes
- All database modifications should trigger a complete UI refresh via the reactive system
- Use `fetch()` for AJAX requests (both `then()` and `async/await` syntaxes are required per project specs)
- Frontend event handlers are defined globally in `script.js` (e.g., `deleteAdherent`, `preterLivre`)