async function loadGames() {
	var gamesResponse;
	var platformsResponse;
	var games;
	var platformsList;
	var platformMap = {};

	gamesResponse = await fetch("/games");
	games = await gamesResponse.json();

	platformsResponse = await fetch("/platforms");
	platformsList = await platformsResponse.json();

	if (platformsList) {
		platformsList.forEach(function (p) {
			platformMap[p.id] = p.name;
		});
	}

	renderGames(games, platformMap);
}

function renderGames(games, platformMap) {
	var gridEl = document.getElementById("games-grid");

	if (!games || games.length === 0) {
		gridEl.innerHTML = '<p class="text-secondary">Todavía no hay juegos en tu biblioteca.</p>';
		return;
	}

	gridEl.innerHTML = "";
	games.forEach(function (game) {
		gridEl.appendChild(buildGameCard(game, platformMap));
	});
}

function buildGameCard(game, platformMap) {
	var template = document.getElementById("game-card-template");
	var clone = template.content.cloneNode(true);

	var img = clone.querySelector(".game-cover");
	img.src = game.photo_url || "https://placehold.co/300x400?text=Sin+portada";
	img.alt = game.title;

	var statusEl = clone.querySelector(".game-status");
	statusEl.textContent = statusLabel(game.status);
	statusEl.classList.add(statusBadgeClass(game.status));

	clone.querySelector(".game-title").textContent = game.title;
	clone.querySelector(".game-year").textContent = game.release_year || "Año desconocido";
	clone.querySelector(".game-stars").innerHTML = buildStars(game.rating);

	var pillsEl = clone.querySelector(".game-pills");
	(game.platform_ids || []).forEach(function (id) {
		var name = platformMap[id];
		if (name) {
			var pill = document.createElement("span");
			pill.className = "badge bg-primary bg-opacity-50 me-1";
			pill.textContent = name;
			pillsEl.appendChild(pill);
		}
	});

	return clone;
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

loadGames();