var editModal;

async function openEditModal(gameId) {
    var gameResponse;
    var game;
    var platformsSelect;
    var genresSelect;
    var id;
    var gid;
    var opt;
    var gopt;



    await loadMaps();

    gameResponse = await fetch("/games/" + gameId);
    game = await gameResponse.json();

    populateHero(game);

    document.getElementById("edit-game-id").value = game.id;
    document.getElementById("edit-title-input").value = game.title;
    document.getElementById("edit-status-input").value = game.status;
    document.getElementById("edit-year-input").value = game.release_year || "";
    document.getElementById("edit-rating-input").value = game.rating || "";
    document.getElementById("edit-photo-input").value = game.photo_url || "";
    document.getElementById("edit-form-message").textContent = "";
    document.getElementById("edit-review-input").value = game.review || "";

    platformsSelect = document.getElementById("edit-platforms-input");
    platformsSelect.innerHTML = "";
    for (id in platformMap) {
        opt = document.createElement("option");
        opt.value = id;
        opt.textContent = platformMap[id];
        if (game.platform_ids && game.platform_ids.indexOf(parseInt(id, 10)) !== -1) {
            opt.selected = true;
        }
        platformsSelect.appendChild(opt);
    }

    genresSelect = document.getElementById("edit-genres-input");
    genresSelect.innerHTML = "";
    for (gid in genreMap) {
        gopt = document.createElement("option");
        gopt.value = gid;
        gopt.textContent = genreMap[gid];
        if (game.genre_ids && game.genre_ids.indexOf(parseInt(gid, 10)) !== -1) {
            gopt.selected = true;
        }
        genresSelect.appendChild(gopt);
    }

    if (!editModal) {
        editModal = new bootstrap.Modal(document.getElementById("edit-game-modal"));
    }
    editModal.show();
}

async function handleSaveEdit() {
    var id;
    var platformsSelect;
    var genresSelect;
    var platformIds;
    var genreIds;
    var i;
    var payload;
    var response;
    var messageEl;

    id = document.getElementById("edit-game-id").value;
    messageEl = document.getElementById("edit-form-message");

    platformsSelect = document.getElementById("edit-platforms-input");
    platformIds = [];
    for (i = 0; i < platformsSelect.selectedOptions.length; i++) {
        platformIds.push(parseInt(platformsSelect.selectedOptions[i].value, 10));
    }

    genresSelect = document.getElementById("edit-genres-input");
    genreIds = [];
    for (i = 0; i < genresSelect.selectedOptions.length; i++) {
        genreIds.push(parseInt(genresSelect.selectedOptions[i].value, 10));
    }

    payload = {
        title: document.getElementById("edit-title-input").value.trim(),
        status: document.getElementById("edit-status-input").value,
        platform_ids: platformIds,
        genre_ids: genreIds
    };

    if (document.getElementById("edit-year-input").value) {
        payload.release_year = parseInt(document.getElementById("edit-year-input").value, 10);
    }
    if (document.getElementById("edit-rating-input").value) {
        payload.rating = parseFloat(document.getElementById("edit-rating-input").value);
    }
    if (document.getElementById("edit-photo-input").value.trim()) {
        payload.photo_url = document.getElementById("edit-photo-input").value.trim();
    }

    try {
        response = await fetch("/games/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Error al guardar");
        }

        editModal.hide();
        loadGames();

    } catch (err) {
        console.error(err);
        messageEl.className = "small text-danger";
        messageEl.textContent = "No se pudo guardar el juego.";
    }
}

async function handleDeleteFromModal() {
    var id;
    var response;

    id = document.getElementById("edit-game-id").value;

    if (!confirm("¿Borrar este juego? Esta acción no se puede deshacer.")) {
        return;
    }

    try {
        response = await fetch("/games/" + id, { method: "DELETE" });

        if (!response.ok) {
            throw new Error("Error al borrar");
        }

        editModal.hide();
        loadGames();

    } catch (err) {
        console.error(err);
        alert("No se pudo borrar el juego.");
    }
}

function populateHero(game) {
    var heroImg;
    var heroStatus;
    var heroMeta;
    var heroTitle;
    var heroRating;
    var heroPlatforms;
    var genreNames;
    var metaText;
    var i;

    heroImg = document.getElementById("edit-hero-img");
    heroImg.src = game.photo_url || "https://placehold.co/800x400?text=Sin+portada";

    heroStatus = document.getElementById("edit-hero-status");
    heroStatus.textContent = statusLabel(game.status);
    heroStatus.className = "badge " + statusBadgeClass(game.status);

    genreNames = [];
    (game.genre_ids || []).forEach(function (id) {
        if (genreMap[id]) {
            genreNames.push(genreMap[id]);
        }
    });

    metaText = genreNames.join(", ");
    if (game.release_year) {
        metaText = metaText ? metaText + " · " + game.release_year : String(game.release_year);
    }
    heroMeta = document.getElementById("edit-hero-meta");
    heroMeta.textContent = metaText;

    heroTitle = document.getElementById("edit-hero-title");
    heroTitle.textContent = game.title;

    heroRating = document.getElementById("edit-hero-rating");
    heroRating.textContent = (game.rating !== null ? game.rating : "—") + "/5";

    heroPlatforms = document.getElementById("edit-hero-platforms");
    heroPlatforms.innerHTML = "";
    (game.platform_ids || []).forEach(function (id) {
        var name = platformMap[id];
        if (name) {
            var pill = document.createElement("span");
            pill.className = "badge " + platformBadgeClass(name) + " bg-opacity-75";
            pill.textContent = name;
            heroPlatforms.appendChild(pill);
        }
    });
}

document.getElementById("edit-save-btn").addEventListener("click", handleSaveEdit);
document.getElementById("edit-delete-btn").addEventListener("click", handleDeleteFromModal);