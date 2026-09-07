var editModal; // Bootstrap modal instance, created once and reused

// Opens the edit modal for a given game: fetches its full data,
// fills the hero header and the form fields, and shows the modal.
async function openEditModal(gameId) {
    var gameResponse;
    var game;
    var platformItems;
    var genreItems;

    await loadMaps();

    gameResponse = await fetch("/games/" + gameId);
    game = await gameResponse.json();

    populateHero(game);

    // Fill the plain form fields with the game's current values.
    document.getElementById("edit-game-id").value = game.id;
    document.getElementById("edit-title-input").value = game.title;
    document.getElementById("edit-status-input").value = game.status;
    document.getElementById("edit-year-input").value = game.release_year || "";
    document.getElementById("edit-rating-input").value = game.rating || "";
    document.getElementById("edit-photo-input").value = game.photo_url || "";
    document.getElementById("edit-form-message").textContent = "";
    document.getElementById("edit-review-input").value = game.review || "";

    // Build the platform checkbox list, sorted alphabetically,
    // pre-checking the ones this game already has.
    platformItems = Object.entries(platformMap).map(function (entry) {
        return { id: parseInt(entry[0], 10), name: entry[1] };
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });

    document.getElementById("edit-platforms-input").innerHTML =
        buildCheckboxListHTML("edit-game-platform", platformItems, game.platform_ids || []);

    // Same for genres.
    genreItems = Object.entries(genreMap).map(function (entry) {
        return { id: parseInt(entry[0], 10), name: entry[1] };
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });

    document.getElementById("edit-genres-input").innerHTML =
        buildCheckboxListHTML("edit-game-genre", genreItems, game.genre_ids || []);

    // Create the modal only the first time; reuse it afterwards.
    if (!editModal) {
        editModal = new bootstrap.Modal(document.getElementById("edit-game-modal"));
    }
    editModal.show();
}

// Reads the form, sends the updated game to the API, and closes
// the modal + refreshes the game list on success.
async function handleSaveEdit() {
    var id;
    var platformIds;
    var genreIds;
    var payload;
    var response;
    var messageEl;

    id = document.getElementById("edit-game-id").value;
    messageEl = document.getElementById("edit-form-message");

    platformIds = getCheckedIds("edit-game-platform");
    genreIds = getCheckedIds("edit-game-genre");

    payload = {
        title: document.getElementById("edit-title-input").value.trim(),
        status: document.getElementById("edit-status-input").value,
        platform_ids: platformIds,
        genre_ids: genreIds,
        // review is always sent, even empty, so clearing it in the
        // textarea actually clears it in the database too.
        review: document.getElementById("edit-review-input").value.trim()
    };

    // These fields are optional: only send them if the user filled them in,
    // so an empty field doesn't overwrite existing data with nothing.
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
        loadGames(); // refresh the library so the change shows up

    } catch (err) {
        console.error(err);
        messageEl.className = "small text-danger";
        messageEl.textContent = "No se pudo guardar el juego.";
    }
}

// Deletes the game currently open in the modal, after confirmation.
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

// Fills the big header at the top of the modal (cover photo, status,
// title, genres/year line, rating and platform badges) from the game data.
function populateHero(game) {
    var heroImg;
    var heroStatus;
    var heroMeta;
    var heroTitle;
    var heroRating;
    var heroPlatforms;
    var genreNames;
    var metaText;

    heroImg = document.getElementById("edit-hero-img");
    heroImg.src = game.photo_url || "https://placehold.co/800x400?text=Sin+portada";

    heroStatus = document.getElementById("edit-hero-status");
    heroStatus.textContent = statusLabel(game.status);
    heroStatus.className = "badge " + statusBadgeClass(game.status);

    // Build the "Genre1, Genre2 · Year" line, only including the
    // parts that actually exist (a game might have no genres or no year).
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

    // One colored badge per platform, same colors as the library cards.
    heroPlatforms = document.getElementById("edit-hero-platforms");
    heroPlatforms.innerHTML = "";
    (game.platform_ids || []).forEach(function (id) {
        var name = platformMap[id];
        if (name) {
            var pill = document.createElement("span");
            pill.className = "badge";
            pill.style.backgroundColor = platformColorMap[id] || "#6c757d";
            pill.textContent = name;
            heroPlatforms.appendChild(pill);
        }
    });
}

// Wire up the modal's buttons once, when the script loads.
document.getElementById("edit-save-btn").addEventListener("click", handleSaveEdit);
document.getElementById("edit-delete-btn").addEventListener("click", handleDeleteFromModal);