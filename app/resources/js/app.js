var MAX_VISIBLE_GENRES = 2;

async function loadGames() {
	var gamesResponse;
	var platformsResponse;
	var genresResponse;
	var games;
	var platformsList;
	var genresList;
	var platformMap = {};
	var genreMap = {};

	gamesResponse = await fetch("/games");
	games = await gamesResponse.json();

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

	renderGames(games, platformMap, genreMap);
}

function renderGames(games, platformMap, genreMap) {
	var gridEl = document.getElementById("games-grid");

	if (!games || games.length === 0) {
		gridEl.innerHTML = '<p class="text-secondary">Todavía no hay juegos en tu biblioteca.</p>';
		return;
	}

	gridEl.innerHTML = "";
	games.forEach(function (game) {
		gridEl.appendChild(buildGameCard(game, platformMap, genreMap));
	});
}

function buildGameCard(game, platformMap, genreMap) {
	var template = document.getElementById("game-card-template");
	var clone = template.content.cloneNode(true);

	var img = clone.querySelector(".game-cover");
	img.src = game.photo_url || "https://placehold.co/300x400?text=Sin+portada";
	img.alt = game.title;

	var statusEl = clone.querySelector(".game-status");
	statusEl.textContent = statusLabel(game.status);
	statusEl.classList.add(statusBadgeClass(game.status));

	clone.querySelector(".game-title").textContent = truncateTitle(game.title, 41);

	var yearEl = clone.querySelector(".game-year");
	var hasYear = !!game.release_year;
	yearEl.textContent = game.release_year || "";
	yearEl.style.display = hasYear ? "inline" : "none";

	var genresEl = clone.querySelector(".game-genres");
	var hasGenres = appendGenreBadges(genresEl, game.genre_ids, genreMap);

	var separatorEl = clone.querySelector(".game-separator");
	separatorEl.style.display = (hasYear && hasGenres) ? "inline" : "none";

	clone.querySelector(".game-stars").innerHTML = buildStars(game.rating);

	var pillsEl = clone.querySelector(".game-pills");
	(game.platform_ids || []).forEach(function (id) {
		var name = platformMap[id];
		if (name) {
			var pill = document.createElement("span");
			pill.className = "badge bg-opacity-75 me-1 " + platformBadgeClass(name);
			pill.textContent = name;
			pillsEl.appendChild(pill);
		}
	});

	return clone;
}

function appendGenreBadges(container, genreIds, genreMap) {
	var ids = genreIds || [];
	var names = [];
	var i;

	for (i = 0; i < ids.length; i++) {
		var name = genreMap[ids[i]];
		if (name) {
			names.push(name);
		}
	}

	var visibleCount = Math.min(names.length, MAX_VISIBLE_GENRES);
	var hiddenCount = names.length - visibleCount;

	for (i = 0; i < visibleCount; i++) {
		var badge = document.createElement("span");
		badge.className = "text-secondary small";
		badge.textContent = names[i];
		container.appendChild(badge);
	}

	if (hiddenCount > 0) {
		var extra = document.createElement("span");
		extra.className = "text-secondary small";
		extra.textContent = "+" + hiddenCount;
		container.appendChild(extra);
	}

	return names.length > 0;
}

function buildStars(rating) {
	var value = rating || 0;
	var html = "";
	var i;

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
	var classes = {
		pendiente: "bg-secondary",
		jugando: "bg-primary",
		completado: "bg-success"
	};
	return classes[status] || "bg-secondary";
}

function statusLabel(status) {
	var labels = {
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
	var lower = name.toLowerCase();

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

loadGames();