// Global state shared by the whole page.
var MAX_VISIBLE_GENRES = 2; // Max number of genres shown before collapsing into "+N"
var platformMap = {};       // platform id -> platform name
var genreMap = {};          // genre id -> genre name
var platformColorMap = {};  // platform id -> hex color for its badge
var mapsLoaded = false;     // avoids re-fetching platforms/genres more than once

// Pagination state
var PAGE_SIZE = 30;
var currentPage = 1;
var fullGamesList = []; // all games currently loaded (before slicing into pages)

var currentGames = [];      // last game list fetched (used as the base for sorting)
var sortAscending = true;   // title sort direction
var ratingSortAscending = true; // rating sort direction

// Fetches platforms and genres once, and stores them in the maps above
// so we don't hit the API again every time we need a name or color.
async function loadMaps() {
	var platformsResponse;
	var platformsList;
	var genresResponse;
	var genresList;

	if (mapsLoaded) return; // already loaded, nothing to do

	platformsResponse = await fetch("/platforms");
	platformsList = await platformsResponse.json();

	genresResponse = await fetch("/genres");
	genresList = await genresResponse.json();

	if (platformsList) {
		platformsList.forEach(function (p) {
			platformMap[p.id] = p.name;
			platformColorMap[p.id] = p.color;
		});
	}

	if (genresList) {
		genresList.forEach(function (g) {
			genreMap[g.id] = g.name;
		});
	}

	mapsLoaded = true;
}

// Loads the full game list and renders it. This is the entry point
// called when the library page first loads.
async function loadGames() {
	var gamesResponse;
	var games;

	await loadMaps();

	gamesResponse = await fetch("/games");
	games = await gamesResponse.json();

	currentGames = games;
	renderGames(sortGames(currentGames), platformMap, genreMap);
}

// Filters

// Re-fetches games filtered by status ("todos" or empty means "no filter").
async function filterGamesByStatus(status) {
	var endpoint;
	var response;
	var games;
	var gridEl;

	await loadMaps();

	endpoint = (status === 'todos' || !status) ? "/games" : "/games/status/" + status;

	try {
		response = await fetch(endpoint);

		if (!response.ok) {
			throw new Error("Error en la respuesta del servidor");
		}

		games = await response.json();

		currentGames = games;
		renderGames(sortGames(currentGames), platformMap, genreMap);

	} catch (err) {
		console.error(err);

		gridEl = document.getElementById("games-grid");

		gridEl.innerHTML = '<p class="text-danger">Error al cargar los juegos filtrados.</p>';
	}
}

// Same idea as above, but searching by (partial) title.
async function filterGamesByTitle(title) {
	var endpoint;
	var response;
	var games;
	var gridEl;

	await loadMaps();

	endpoint = title ? "/games/title/" + encodeURIComponent(title) : "/games";

	try {
		response = await fetch(endpoint);

		if (!response.ok) {
			throw new Error("Error en la respuesta del servidor");
		}

		games = await response.json();

		currentGames = games;
		renderGames(sortGames(currentGames), platformMap, genreMap);

	} catch (err) {
		console.error(err);

		gridEl = document.getElementById("games-grid");

		gridEl.innerHTML = '<p class="text-danger">Error al cargar los juegos filtrados.</p>';
	}
}

// Reads the search box and triggers the title filter.
function handleTitleSearch() {

	var inputEl = document.getElementById("title-search");
	var title = inputEl.value.trim();

	filterGamesByTitle(title);
}

// Lets the user press Enter instead of clicking the search button.
document.getElementById("title-search").addEventListener("keydown", function (e) {
	if (e.key === "Enter") {
		handleTitleSearch();
	}
});

// Same filtering pattern as status/title, but by platform id.
async function filterGamesByPlatform(platformId) {
	var endpoint;
	var response;
	var games;
	var gridEl;

	await loadMaps();

	endpoint = platformId ? "/games/platform/" + platformId : "/games";

	try {
		response = await fetch(endpoint);

		if (!response.ok) {
			throw new Error("Error en la respuesta del servidor");
		}

		games = await response.json();

		currentGames = games;
		renderGames(sortGames(currentGames), platformMap, genreMap);

	} catch (err) {
		console.error(err);

		gridEl = document.getElementById("games-grid");

		gridEl.innerHTML = '<p class="text-danger">Error al cargar los juegos filtrados.</p>';
	}
}

// Fills the platform <select> with one <option> per known platform.
function populatePlatformFilter() {

	var selectEl = document.getElementById("platform-filter");
	var id;

	for (id in platformMap) {

		var option = document.createElement("option");

		option.value = id;
		option.textContent = platformMap[id];
		selectEl.appendChild(option);
	}
}

// Same as above, but for genres, sorted alphabetically first.
function populateGenreFilter() {
	var selectEl = document.getElementById("genre-filter");
	var genreEntries = Object.entries(genreMap).sort(function (a, b) {
		return a[1].localeCompare(b[1]);
	});

	genreEntries.forEach(function (entry) {
		var option = document.createElement("option");
		option.value = entry[0];
		option.textContent = entry[1];
		selectEl.appendChild(option);
	});
}

// Same filtering pattern as status/title/platform, but by genre id.
async function filterGamesByGenre(genreId) {
	var endpoint;
	var response;
	var games;
	var gridEl;

	await loadMaps();

	endpoint = genreId ? "/games/genre/" + genreId : "/games";

	try {
		response = await fetch(endpoint);

		if (!response.ok) {
			throw new Error("Error en la respuesta del servidor");
		}

		games = await response.json();

		currentGames = games;
		renderGames(sortGames(currentGames), platformMap, genreMap);

	} catch (err) {
		console.error(err);

		gridEl = document.getElementById("games-grid");

		gridEl.innerHTML = '<p class="text-danger">Error al cargar los juegos filtrados.</p>';
	}
}

// Flips the A-Z / Z-A sort direction and re-renders with the same data.
function toggleSort() {
	sortAscending = !sortAscending;

	var iconEl = document.querySelector("#sort-toggle i");
	iconEl.className = sortAscending ? "bi bi-arrow-down" : "bi bi-arrow-up";

	renderGames(sortGames(currentGames), platformMap, genreMap);
}

// Returns a new sorted copy of the games array (never mutates the original).
function sortGames(games) {
	var sorted = games.slice();

	sorted.sort(function (a, b) {
		var comparison = a.title.localeCompare(b.title);
		return sortAscending ? comparison : -comparison;
	});

	return sorted;
}

// Flips the rating sort direction and re-renders.
function toggleRatingSort() {
	ratingSortAscending = !ratingSortAscending;

	var buttonEl = document.getElementById("rating-sort-toggle");
	var iconEl = buttonEl.querySelector("i");
	iconEl.className = ratingSortAscending ? "bi bi-arrow-up" : "bi bi-arrow-down";

	renderGames(sortGamesByRating(currentGames), platformMap, genreMap);
}

// Same as sortGames, but by rating instead of title.
// Games without a rating (null) are treated as -1 so they always
// end up at one end of the list, never mixed randomly with rated ones.
function sortGamesByRating(games) {
	var sorted = games.slice();

	sorted.sort(function (a, b) {
		var ratingA = a.rating === null ? -1 : a.rating;
		var ratingB = b.rating === null ? -1 : b.rating;
		var comparison = ratingA - ratingB;
		return ratingSortAscending ? comparison : -comparison;
	});

	return sorted;
}

// Header

// Loads the shared header/nav bar from its own HTML file and injects it,
// so every page shows the same header without copy-pasting the markup.
async function loadHeader() {
	var response;
	var html;
	var placeholder;

	response = await fetch("/resources/partials/header.html");
	html = await response.text();

	placeholder = document.getElementById("header-placeholder");
	placeholder.innerHTML = html;

	markActiveLink();
}

// Highlights the nav link matching the current page URL.
function markActiveLink() {
	var links = document.querySelectorAll("nav .nav-link");
	var currentPath = window.location.pathname;
	var i;

	for (i = 0; i < links.length; i++) {
		if (links[i].getAttribute("href") === currentPath) {
			links[i].classList.add("fw-bold", "text-decoration-underline");
		}
	}
}

// Game cards building

// Entry point called every time we get a new list of games to show
// (initial load, filter, search...). Stores the list and resets to page 1.
function renderGames(games, pMap, gMap) {
	fullGamesList = games || [];
	platformMap = pMap;
	genreMap = gMap;
	currentPage = 1;
	renderGamesPage();
}

// Renders only the current page's slice of fullGamesList as cards.
function renderGamesPage() {
	var gridEl = document.getElementById("games-grid");
	var start;
	var pageItems;

	if (!fullGamesList || fullGamesList.length === 0) {
		gridEl.innerHTML = '<p class="text-secondary">Todavía no hay juegos en tu biblioteca.</p>';
		document.getElementById("pagination").innerHTML = "";
		return;
	}

	start = (currentPage - 1) * PAGE_SIZE;
	pageItems = fullGamesList.slice(start, start + PAGE_SIZE);

	gridEl.innerHTML = "";
	pageItems.forEach(function (game) {
		gridEl.appendChild(buildGameCard(game, platformMap, genreMap));
	});

	renderPaginationControls();
}

// Builds the "Previous / 1 2 3 / Next" pagination buttons.
function renderPaginationControls() {
	var paginationEl = document.getElementById("pagination");
	var totalPages = Math.ceil(fullGamesList.length / PAGE_SIZE);
	var i;
	var html = "";

	if (totalPages <= 1) {
		paginationEl.innerHTML = ""; // no pagination needed for a single page
		return;
	}

	html += '<li class="page-item' + (currentPage === 1 ? ' disabled' : '') + '">' +
		'<button class="page-link" onclick="goToPage(' + (currentPage - 1) + ')">Anterior</button></li>';

	for (i = 1; i <= totalPages; i++) {
		html += '<li class="page-item' + (i === currentPage ? ' active' : '') + '">' +
			'<button class="page-link" onclick="goToPage(' + i + ')">' + i + '</button></li>';
	}

	html += '<li class="page-item' + (currentPage === totalPages ? ' disabled' : '') + '">' +
		'<button class="page-link" onclick="goToPage(' + (currentPage + 1) + ')">Siguiente</button></li>';

	paginationEl.innerHTML = html;
}

// Switches to a given page number, if it's valid, and scrolls back to top.
function goToPage(page) {
	var totalPages = Math.ceil(fullGamesList.length / PAGE_SIZE);

	if (page < 1 || page > totalPages) {
		return; // ignore invalid page numbers
	}

	currentPage = page;
	renderGamesPage();
	window.scrollTo({ top: 0, behavior: "smooth" });
}

// Builds one game card from the <template>, filling in all its fields.
function buildGameCard(game, platformMap, genreMap) {
	var template;
	var clone;
	var img;
	var statusEl;
	var yearEl;
	var hasYear;
	var genresEl;
	var hasGenres;
	var separatorEl;
	var pillsEl;

	template = document.getElementById("game-card-template");
	clone = template.content.cloneNode(true); // fresh copy of the template markup

	// Clicking anywhere on the card opens the edit modal for this game.
	var cardEl = clone.querySelector(".card");
	cardEl.setAttribute("data-id", game.id);
	cardEl.style.cursor = "pointer";
	cardEl.addEventListener("click", function () {
		openEditModal(game.id);
	});

	img = clone.querySelector(".game-cover");
	img.src = game.photo_url || "https://placehold.co/300x400?text=Sin+portada";
	img.alt = game.title;

	statusEl = clone.querySelector(".game-status");
	statusEl.textContent = statusLabel(game.status);
	statusEl.classList.add(statusBadgeClass(game.status));

	clone.querySelector(".game-title").textContent = truncateTitle(game.title, 41);

	// Year is hidden completely (not just emptied) when the game has none,
	// so it doesn't leave a visual gap next to the genres.
	yearEl = clone.querySelector(".game-year");
	hasYear = !!game.release_year;
	yearEl.textContent = game.release_year || "";
	yearEl.style.display = hasYear ? "inline" : "none";

	genresEl = clone.querySelector(".game-genres");
	genresEl.innerHTML = "";

	hasGenres = appendGenreBadges(genresEl, game.genre_ids, genreMap);

	// The "•" separator between year and genres only shows when both exist.
	separatorEl = clone.querySelector(".game-separator");
	separatorEl.style.display = (hasYear && hasGenres) ? "inline" : "none";

	clone.querySelector(".game-stars").innerHTML = buildStars(game.rating);

	// One colored badge per platform the game is available on.
	pillsEl = clone.querySelector(".game-pills");
	pillsEl.innerHTML = "";

	(game.platform_ids || []).forEach(function (id) {
		var name;
		var pill;

		name = platformMap[id];

		if (name) {
			pill = document.createElement("span");
			pill.className = "badge me-1";
			pill.style.backgroundColor = platformColorMap[id] || "#6c757d"; // fallback gray
			pill.textContent = name;
			pillsEl.appendChild(pill);
		}
	});

	return clone;
}

// Adds genre labels to a container, showing at most MAX_VISIBLE_GENRES
// and collapsing the rest into a "+N" badge. Returns true if it added
// at least one genre (used to decide whether to show the "•" separator).
function appendGenreBadges(container, genreIds, genreMap) {
	var ids;
	var names;
	var i;
	var name;
	var visibleCount;
	var hiddenCount;
	var badge;
	var extra;

	ids = genreIds || [];
	names = [];

	for (i = 0; i < ids.length; i++) {
		name = genreMap[ids[i]];

		if (name) {
			names.push(name);
		}
	}

	visibleCount = Math.min(names.length, MAX_VISIBLE_GENRES);
	hiddenCount = names.length - visibleCount;

	for (i = 0; i < visibleCount; i++) {
		badge = document.createElement("span");
		badge.className = "text-light text-opacity-50 small";
		badge.textContent = names[i];
		container.appendChild(badge);
	}

	if (hiddenCount > 0) {
		extra = document.createElement("span");
		extra.className = "text-light text-opacity-50 small";
		extra.textContent = "+" + hiddenCount;
		container.appendChild(extra);
	}

	return names.length > 0;
}

// Builds the star rating icons: full, half or empty, depending on the value.
function buildStars(rating) {
	var value;
	var html;
	var i;

	value = rating || 0;
	html = "";

	for (i = 1; i <= 5; i++) {

		if (value >= i) {
			html += '<i class="bi bi-star-fill"></i> ';
		} else if (value >= i - 0.5) {
			html += '<i class="bi bi-star-half"></i> ';
		} else {
			html += '<i class="bi bi-star"></i> ';
		}
	}

	return html;
}

// Maps a game status to its Bootstrap badge color class.
function statusBadgeClass(status) {
	var classes;

	classes = {
		pendiente: "bg-secondary",
		jugando: "bg-primary",
		completado: "bg-success"
	};

	return classes[status] || "bg-secondary";
}

// Maps a game status to the label shown to the user.
function statusLabel(status) {
	var labels;

	labels = {
		pendiente: "Sin jugar",
		jugando: "Jugando",
		completado: "Completado"
	};

	return labels[status] || status;
}

// Cuts a title down to maxLength characters, adding "…" if it was cut.
function truncateTitle(title, maxLength) {

	if (title.length <= maxLength) {
		return title;
	}

	return title.slice(0, maxLength - 1) + "…";
}

// Old way of picking a platform badge color by matching keywords in its name.
// No longer used now that platforms have a real color field (see platformColorMap),
// kept here in case it's useful again later.
function platformBadgeClass(name) {
	var lower;

	lower = name.toLowerCase();

	if (lower.indexOf("switch") !== -1 || lower.indexOf("nintendo") !== -1) {
		return "bg-danger";
	}

	if (lower.indexOf("xbox") !== -1) {
		return "bg-success";
	}

	if (lower.indexOf("ps") !== -1 || lower.indexOf("playstation") !== -1) {
		return "bg-primary";
	}

	if (lower.indexOf("pc") !== -1) {
		return "bg-secondary";
	}

	return "bg-dark";
}

// Builds a list of checkboxes (one per item), pre-checking the ones
// whose id is in selectedIds. Used for the platform/genre pickers
// in the add/edit game forms.
function buildCheckboxListHTML(namePrefix, items, selectedIds) {
	var html = '<div class="checklist-box">';
	var selected = selectedIds || [];
	var i;

	for (i = 0; i < items.length; i++) {
		var checked = selected.indexOf(items[i].id) !== -1 ? "checked" : "";
		html +=
			'<div class="form-check">' +
			'<input class="form-check-input" type="checkbox" value="' + items[i].id + '" ' +
			'id="' + namePrefix + '-' + items[i].id + '" name="' + namePrefix + '" ' + checked + '>' +
			'<label class="form-check-label" for="' + namePrefix + '-' + items[i].id + '">' + items[i].name + '</label>' +
			'</div>';
	}

	html += '</div>';
	return html;
}

// Reads all checked checkboxes with the given name and returns their
// values as an array of numbers. Used to collect selected platform/genre ids.
function getCheckedIds(namePrefix) {
	var ids = [];
	document.querySelectorAll('input[name="' + namePrefix + '"]:checked').forEach(function (cb) {
		ids.push(parseInt(cb.value, 10));
	});
	return ids;
}

// Runs once the page's HTML is ready: loads platforms/genres and
// fills the two filter dropdowns with them.
document.addEventListener("DOMContentLoaded", async function () {
	try {

		await loadMaps();

		populatePlatformFilter();

		populateGenreFilter();

	} catch (error) {
		console.error("Error al inicializar la página:", error);
	}
});

// Kicks off the page: load the shared header, then load and render the games.
loadHeader();
loadGames();