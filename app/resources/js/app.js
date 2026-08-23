var MAX_VISIBLE_GENRES = 2;
var platformMap = {};
var genreMap = {};
var mapsLoaded = false;

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
	iconEl.className = ratingSortAscending ? "bi bi-arrow-down" : "bi bi-arrow-up";

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

function renderGames(games, platformMap, genreMap) {
	var gridEl;

	gridEl = document.getElementById("games-grid");

	if (!games || games.length === 0) {
		gridEl.innerHTML = '<p class="text-secondary">No se encontraron juegos en esta sección.</p>';
		return;
	}

	gridEl.innerHTML = "";

	games.forEach(function (game) {
		gridEl.appendChild(buildGameCard(game, platformMap, genreMap));
	});
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

document.addEventListener("DOMContentLoaded", async function () {
	try {

		await loadMaps();

		populatePlatformFilter();

	} catch (error) {
		console.error("Error al inicializar la página:", error);
	}
});

loadHeader();
loadGames();