var MAX_VISIBLE_GENRES = 2;
var platformMap = {};
var genreMap = {};
var mapsLoaded = false;

//For pagination
var PAGE_SIZE = 30;
var currentPage = 1;
var fullGamesList = [];

var currentGames = [];
var sortAscending = true;

var ratingSortAscending = true;

async function loadMaps() {
	var platformsResponse;
	var platformsList;
	var genresResponse;
	var genresList;

	if (mapsLoaded) return;

	platformsResponse = await fetch("/platforms");
	platformsList = await platformsResponse.json();

	genresResponse = await fetch("/genres");
	genresList = await genresResponse.json();

	if (platformsList) {
		platformsList.forEach(function (p) {
			platformMap[p.id] = p.name;
		});
	}

	if (genresList) {
		genresList.forEach(function (g) {
			genreMap[g.id] = g.name;
		});
	}

	mapsLoaded = true;
}

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

function handleTitleSearch() {

	var inputEl = document.getElementById("title-search");
	var title = inputEl.value.trim();

	filterGamesByTitle(title);
}

document.getElementById("title-search").addEventListener("keydown", function (e) {
	if (e.key === "Enter") {
		handleTitleSearch();
	}
});

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

function toggleSort() {
	sortAscending = !sortAscending;

	var iconEl = document.querySelector("#sort-toggle i");
	iconEl.className = sortAscending ? "bi bi-arrow-down" : "bi bi-arrow-up";

	renderGames(sortGames(currentGames), platformMap, genreMap);
}

function sortGames(games) {
	var sorted = games.slice();

	sorted.sort(function (a, b) {
		var comparison = a.title.localeCompare(b.title);
		return sortAscending ? comparison : -comparison;
	});

	return sorted;
}

function toggleRatingSort() {
	ratingSortAscending = !ratingSortAscending;

	var buttonEl = document.getElementById("rating-sort-toggle");
	var iconEl = buttonEl.querySelector("i");
	iconEl.className = ratingSortAscending ? "bi bi-arrow-up" : "bi bi-arrow-down";

	renderGames(sortGamesByRating(currentGames), platformMap, genreMap);
}

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

//Header

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

// Gamecards building

function renderGames(games, pMap, gMap) {
	fullGamesList = games || [];
	platformMap = pMap;
	genreMap = gMap;
	currentPage = 1;
	renderGamesPage();
}

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

function renderPaginationControls() {
	var paginationEl = document.getElementById("pagination");
	var totalPages = Math.ceil(fullGamesList.length / PAGE_SIZE);
	var i;
	var html = "";

	if (totalPages <= 1) {
		paginationEl.innerHTML = "";
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

function goToPage(page) {
	var totalPages = Math.ceil(fullGamesList.length / PAGE_SIZE);

	if (page < 1 || page > totalPages) {
		return;
	}

	currentPage = page;
	renderGamesPage();
	window.scrollTo({ top: 0, behavior: "smooth" });
}

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
	clone = template.content.cloneNode(true);

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

	yearEl = clone.querySelector(".game-year");
	hasYear = !!game.release_year;
	yearEl.textContent = game.release_year || "";
	yearEl.style.display = hasYear ? "inline" : "none";

	genresEl = clone.querySelector(".game-genres");
	genresEl.innerHTML = "";

	hasGenres = appendGenreBadges(genresEl, game.genre_ids, genreMap);

	separatorEl = clone.querySelector(".game-separator");
	separatorEl.style.display = (hasYear && hasGenres) ? "inline" : "none";

	clone.querySelector(".game-stars").innerHTML = buildStars(game.rating);

	pillsEl = clone.querySelector(".game-pills");
	pillsEl.innerHTML = "";

	(game.platform_ids || []).forEach(function (id) {
		var name;
		var pill;

		name = platformMap[id];

		if (name) {
			pill = document.createElement("span");
			pill.className = "badge bg-opacity-75 me-1 " + platformBadgeClass(name);
			pill.textContent = name;
			pillsEl.appendChild(pill);
		}
	});

	return clone;
}

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

function statusBadgeClass(status) {
	var classes;

	classes = {
		pendiente: "bg-secondary",
		jugando: "bg-primary",
		completado: "bg-success"
	};

	return classes[status] || "bg-secondary";
}

function statusLabel(status) {
	var labels;

	labels = {
		pendiente: "Sin jugar",
		jugando: "Jugando",
		completado: "Completado"
	};

	return labels[status] || status;
}

function truncateTitle(title, maxLength) {

	if (title.length <= maxLength) {
		return title;
	}

	return title.slice(0, maxLength - 1) + "…";
}

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

function getCheckedIds(namePrefix) {
	var ids = [];
	document.querySelectorAll('input[name="' + namePrefix + '"]:checked').forEach(function (cb) {
		ids.push(parseInt(cb.value, 10));
	});
	return ids;
}

document.addEventListener("DOMContentLoaded", async function () {
	try {

		await loadMaps();

		populatePlatformFilter();

		populateGenreFilter();

	} catch (error) {
		console.error("Error al inicializar la página:", error);
	}
});

loadHeader();
loadGames();