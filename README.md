# GameVault - Personal Video Game Library Manager

GameVault is a web application designed to catalog and manage a personal video game library. Unlike a price comparator, it focuses on organizing the games you own: tracking their status, rating them, associating them with multiple platforms and genres, and keeping a separate wishlist for the games you don't own yet. It also includes visual statistics, CSV import/export, and a management panel to keep the catalog data (platforms and genres) under control.

## Screenshots

| Library | Edit modal |
| --- | --- |
| ![Library view](./screenshots/GV-Library.png) | ![Edit game modal](./screenshots/GV-Edit.png) |

| Statistics | Management |
| --- | --- |
| ![Statistics page](./screenshots/GV-Stats.png) | ![Management panel](./screenshots/GV-Management.png) |

## Index

- [Features](#features)
    - [Library](#library)
    - [Wishlist](#wishlist)
    - [Statistics](#statistics)
    - [Management](#management)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Configuration and Persistence](#configuration-and-persistence)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Running Instructions](#running-instructions)
- [API Routes](#api-routes)
- [Author](#author)

## Features

### Library

- Full CRUD for games: title, status (pending / playing / completed), rating (0 to 5 stars in 0.5 steps), review, release year and cover photo URL.
- Many-to-many relationships: a single game can be associated with several platforms and several genres at once.
- Search bar by title, with live filtering.
- Filters by status, platform and genre, combinable with search.
- Sorting alphabetically (A-Z / Z-A) and by rating.
- Client-side pagination (30 results per page).
- Detail/edit modal opened directly from each game card, with tabs for editing data and writing a personal review.
- Platform badges rendered with a custom color chosen per platform, instead of a fixed palette.

### Wishlist

- Independent list of games you don't own yet, with the same data richness as the library (photo, release year, platforms, genres, notes).
- Search, filter by platform/genre, and alphabetical sorting, same as the library.
- One-click "Move to library" action: converts a wishlist entry into a real game, carrying over its title, photo, release year, platforms and genres, and removes it from the wishlist.

### Statistics

- Summary cards: total games, completed, playing, pending, average rating and top genre.
- Horizontal bar chart with the rating distribution (1 to 5 stars).
- Podium-style visualization for the most-played platforms and genres.

### Management

- Accordion-based panel to add and edit platforms and genres (including their badge color), add games and wishlist items, and export/import data.
- CSV export for both the library and the wishlist, including all fields (title, status, rating, year, photo, review/notes, platforms, genres).
- CSV import that fully replaces the current library or wishlist, validating the file header before processing it to avoid mixing up the two formats.

## Technologies Used

| Category | Technology |
| --- | --- |
| Language | [Go](https://go.dev/) |
| Web Framework | [Gin](https://gin-gonic.com/) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| Database Driver | [pgx (v5)](https://github.com/jackc/pgx) |
| Frontend | HTML5, vanilla JavaScript |
| CSS Framework | [Bootstrap 5](https://getbootstrap.com/) |
| Icons | [Bootstrap Icons](https://icons.getbootstrap.com/) |
| Charts | Custom HTML/CSS bar charts |

## Project Structure

```
app/
├── main/
│   ├── handlers/          # HTTP handlers (Gin)
│   ├── service/           # Business logic orchestrating repositories
│   ├── repository/        # SQL queries against PostgreSQL
│   └── models/            # Data structs shared across layers
├── db/
│   ├── database.go        # Connection pool setup
│   └── db.sql             # Full database schema
├── resources/
│   ├── index.html          # Library page
│   ├── stats.html          # Statistics page
│   ├── management.html     # Management panel
│   ├── wishlist.html       # Wishlist page
│   ├── partials/           # Shared header/navigation
│   ├── css/                 # Stylesheets
│   └── js/                  # Frontend logic
├── main.go                 # Entry point: router and route registration
└── postgres.env             # Local database connection string (not versioned)
```

## Configuration and Persistence

The database connection string is read from an environment variable:

```
DATABASE_URL=postgres://user:password@localhost:5432/gamevault
```

It is loaded from a `postgres.env` file at startup. If the file or the variable is missing, the server falls back to a default local connection string and keeps running, reporting the database as disconnected through the `/health` endpoint rather than crashing.

> **Security note:** `postgres.env` contains real credentials and must never be committed. Make sure your `.gitignore` excludes it explicitly (a rule like `.env*` does **not** match a file named `postgres.env`).

The schema (tables, foreign keys and constraints) lives in [`db/db.sql`](./db/db.sql) and must be executed once against a fresh PostgreSQL database before running the app for the first time.

## Getting Started

### Prerequisites

- [Go 1.26](https://go.dev/dl/) or higher.
- [PostgreSQL](https://www.postgresql.org/download/) running locally (or reachable), with a database created for the project.

### Running Instructions

**1. Clone the repository**

```bash
git clone <repository-url>
cd gamevault-app/app
```

**2. Set up the database**

Create the database and run the schema:

```bash
psql -d gamevault -f db/db.sql
```

**3. Configure the connection**

Create a `postgres.env` file in the `app/` directory:

```
DATABASE_URL=postgres://your_user:your_password@localhost:5432/gamevault
```

**4. Install dependencies and run**

```bash
go mod download
go run main.go
```

**5. Access the application**

[http://localhost:9000](http://localhost:9000)

## API Routes

| Route | Method | Description |
| --- | --- | --- |
| `/` | GET | Library page (static) |
| `/platforms` | GET / POST | List / create platforms |
| `/platforms/:id` | GET / PUT / DELETE | Read / update / delete a platform |
| `/genres` | GET / POST | List / create genres |
| `/genres/:id` | GET / PUT / DELETE | Read / update / delete a genre |
| `/games` | GET / POST | List / create games |
| `/games/id/:id` | GET | Get a single game |
| `/games/:id` | PUT / DELETE | Update / delete a game |
| `/games/filter/status/:status` | GET | Filter games by status |
| `/games/filter/title/:title` | GET | Search games by title |
| `/games/filter/platform/:platformId` | GET | Filter games by platform |
| `/games/filter/genre/:genreId` | GET | Filter games by genre |
| `/wishlist` | GET / POST | List / create wishlist items |
| `/wishlist/:id` | GET / PUT / DELETE | Read / update / delete a wishlist item |
| `/wishlist/:id/move-to-library` | POST | Move a wishlist item into the library |
| `/wishlist/filter/title/:title` | GET | Search wishlist by title |
| `/wishlist/filter/platform/:platformId` | GET | Filter wishlist by platform |
| `/wishlist/filter/genre/:genreId` | GET | Filter wishlist by genre |
| `/stats` | GET | Summary statistics |
| `/stats/rating-distribution` | GET | Rating distribution |
| `/stats/top-platforms` | GET | Most-used platforms |
| `/stats/top-genres` | GET | Most-used genres |
| `/export/csv` | GET | Export the library as CSV |
| `/export/wishlist-csv` | GET | Export the wishlist as CSV |
| `/import/csv` | POST | Replace the library from a CSV file |
| `/import/wishlist-csv` | POST | Replace the wishlist from a CSV file |
| `/health` | GET | Server and database health check |

## Author

**Francisco Aguilar**
[GitHub: @francisco-aguilar04](https://github.com/francisco-aguilar04)
