// Global variable to keep track of the Bootstrap modal instance for the wishlist
var wishlistModal;

// Fetches all wishlist items from the API, ensuring maps and filters are loaded first,
// then stores the items locally and renders the sorted wishlist grid.
async function loadWishlist() {
    var response;
    var items;

    await loadMaps();
    await populateWishlistFilters();

    response = await fetch("/wishlist");
    items = await response.json();

    currentWishlistItems = items;
    renderWishlistGrid(sortWishlist(currentWishlistItems));
}

// Renders the wishlist items into the grid container.
// Displays a fallback message if the wishlist is empty.
function renderWishlistGrid(items) {
    var gridEl = document.getElementById("wishlist-grid");

    if (!items || items.length === 0) {
        gridEl.innerHTML = '<p class="text-secondary">Tu wishlist está vacía.</p>';
        return;
    }

    gridEl.innerHTML = "";
    items.forEach(function (item) {
        gridEl.appendChild(buildWishlistCard(item));
    });
}

// Builds an individual wishlist card element using an HTML template,
// filling in cover images, titles, release years, genre badges, and platform pills.
function buildWishlistCard(item) {
    var template = document.getElementById("wishlist-card-template");
    var clone = template.content.cloneNode(true);

    var cardEl = clone.querySelector(".wishlist-card");
    cardEl.style.cursor = "pointer";
    cardEl.addEventListener("click", function () {
        openWishlistModal(item.id);
    });

    var img = clone.querySelector(".wishlist-cover");
    img.src = item.photo_url || "https://placehold.co/300x400?text=Sin+portada";
    img.alt = item.title;

    clone.querySelector(".wishlist-title").textContent = truncateTitle(item.title, 41);

    var yearEl = clone.querySelector(".wishlist-year");
    var hasYear = !!item.release_year;
    yearEl.textContent = item.release_year || "";
    yearEl.style.display = hasYear ? "inline" : "none";

    var genresEl = clone.querySelector(".wishlist-genres");
    var hasGenres = appendGenreBadges(genresEl, item.genre_ids, genreMap);

    var separatorEl = clone.querySelector(".wishlist-separator");
    separatorEl.style.display = (hasYear && hasGenres) ? "inline" : "none";

    var pillsEl = clone.querySelector(".wishlist-pills");
    (item.platform_ids || []).forEach(function (id) {
        var name = platformMap[id];
        if (name) {
            var pill = document.createElement("span");
            pill.className = "badge rounded-pill me-1 mb-1";
            pill.style.backgroundColor = platformColorMap[id] || "#6c757d";
            pill.textContent = name;
            pillsEl.appendChild(pill);
        }
    });

    return clone;
}

// Fetches full details for a specific wishlist item and populates the edit modal fields,
// initializing the modal instance if it does not yet exist.
async function openWishlistModal(id) {
    var response;
    var item;
    var platformItems;
    var genreItems;

    await loadMaps();

    response = await fetch("/wishlist/" + id);
    item = await response.json();

    document.getElementById("wishlist-edit-id").value = item.id;
    document.getElementById("wishlist-edit-title").value = item.title;
    document.getElementById("wishlist-edit-year").value = item.release_year || "";
    document.getElementById("wishlist-edit-photo").value = item.photo_url || "";
    document.getElementById("wishlist-edit-notes").value = item.notes || "";
    document.getElementById("wishlist-edit-hero-img").src = item.photo_url || "https://placehold.co/600x200?text=Sin+portada";

    platformItems = Object.entries(platformMap).map(function (entry) {
        return { id: parseInt(entry[0], 10), name: entry[1] };
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });

    document.getElementById("wishlist-edit-platforms").innerHTML =
        buildCheckboxListHTML("wishlist-edit-platform", platformItems, item.platform_ids || []);

    genreItems = Object.entries(genreMap).map(function (entry) {
        return { id: parseInt(entry[0], 10), name: entry[1] };
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });

    document.getElementById("wishlist-edit-genres").innerHTML =
        buildCheckboxListHTML("wishlist-edit-genre", genreItems, item.genre_ids || []);

    if (!wishlistModal) {
        wishlistModal = new bootstrap.Modal(document.getElementById("wishlist-modal"));
    }
    wishlistModal.show();
}

// Collects updated data from the wishlist modal form, sends a PUT request to the API,
// hides the modal, and refreshes the wishlist view.
async function handleWishlistSave() {
    var id;
    var platformIds;
    var genreIds;
    var payload;
    var response;

    id = document.getElementById("wishlist-edit-id").value;

    platformIds = getCheckedIds("wishlist-edit-platform");
    genreIds = getCheckedIds("wishlist-edit-genre");

    payload = {
        title: document.getElementById("wishlist-edit-title").value.trim(),
        platform_ids: platformIds,
        genre_ids: genreIds,
        notes: document.getElementById("wishlist-edit-notes").value.trim()
    };

    if (document.getElementById("wishlist-edit-year").value) {
        payload.release_year = parseInt(document.getElementById("wishlist-edit-year").value, 10);
    }
    if (document.getElementById("wishlist-edit-photo").value.trim()) {
        payload.photo_url = document.getElementById("wishlist-edit-photo").value.trim();
    }

    try {
        response = await fetch("/wishlist/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Error al guardar");
        }

        wishlistModal.hide();
        loadWishlist();

    } catch (err) {
        console.error(err);
        alert("No se pudo guardar.");
    }
}

// Deletes the current wishlist item after user confirmation.
async function handleWishlistDelete() {
    var id;
    var response;

    id = document.getElementById("wishlist-edit-id").value;

    if (!confirm("¿Quitar este juego de la wishlist?")) {
        return;
    }

    try {
        response = await fetch("/wishlist/" + id, { method: "DELETE" });

        if (!response.ok) {
            throw new Error("Error al borrar");
        }

        wishlistModal.hide();
        loadWishlist();

    } catch (err) {
        console.error(err);
        alert("No se pudo borrar.");
    }
}

// Moves a game from the wishlist to the main library via a POST request,
// then closes the modal and refreshes the list.
async function handleMoveToLibrary() {
    var id;
    var response;

    id = document.getElementById("wishlist-edit-id").value;

    if (!confirm("¿Mover este juego a tu biblioteca?")) {
        return;
    }

    try {
        response = await fetch("/wishlist/" + id + "/move-to-library", { method: "POST" });

        if (!response.ok) {
            throw new Error("Error al mover");
        }

        wishlistModal.hide();
        loadWishlist();

    } catch (err) {
        console.error(err);
        alert("No se pudo mover a la biblioteca.");
    }
}

// Filters the wishlist items based on an optional title search string.
async function filterWishlistByTitle(title) {
    var endpoint;
    var response;
    var items;

    await loadMaps();

    endpoint = title ? "/wishlist/title/" + encodeURIComponent(title) : "/wishlist";

    try {
        response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error("Error en la respuesta del servidor");
        }

        items = await response.json();

        currentWishlistItems = items;
        renderWishlistGrid(sortWishlist(currentWishlistItems));

    } catch (err) {
        console.error(err);
        document.getElementById("wishlist-grid").innerHTML = '<p class="text-danger">Error al buscar.</p>';
    }
}

// Reads the search input value and triggers the title-based filtering process.
function handleWishlistSearch() {
    var inputEl = document.getElementById("wishlist-search");
    var title = inputEl.value.trim();

    filterWishlistByTitle(title);
}

// Listens for the "Enter" key on the wishlist search input to execute searches instantly.
document.getElementById("wishlist-search").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        handleWishlistSearch();
    }
});

var wishlistSortAscending = true;
var currentWishlistItems = [];

// Populates the platform and genre dropdown filters alphabetically based on maps data.
async function populateWishlistFilters() {
    await loadMaps();

    var platformSelect = document.getElementById("wishlist-platform-filter");
    var platformEntries = Object.entries(platformMap).sort(function (a, b) {
        return a[1].localeCompare(b[1]);
    });
    platformEntries.forEach(function (entry) {
        var option = document.createElement("option");
        option.value = entry[0];
        option.textContent = entry[1];
        platformSelect.appendChild(option);
    });

    var genreSelect = document.getElementById("wishlist-genre-filter");
    var genreEntries = Object.entries(genreMap).sort(function (a, b) {
        return a[1].localeCompare(b[1]);
    });
    genreEntries.forEach(function (entry) {
        var option = document.createElement("option");
        option.value = entry[0];
        option.textContent = entry[1];
        genreSelect.appendChild(option);
    });
}

// Filters wishlist items by a specific platform ID.
async function filterWishlistByPlatform(platformId) {
    var endpoint = platformId ? "/wishlist/platform/" + platformId : "/wishlist";
    var response = await fetch(endpoint);
    var items = await response.json();

    currentWishlistItems = items;
    renderWishlistGrid(sortWishlist(currentWishlistItems));
}

// Filters wishlist items by a specific genre ID.
async function filterWishlistByGenre(genreId) {
    var endpoint = genreId ? "/wishlist/genre/" + genreId : "/wishlist";
    var response = await fetch(endpoint);
    var items = await response.json();

    currentWishlistItems = items;
    renderWishlistGrid(sortWishlist(currentWishlistItems));
}

// Toggles the sorting direction (ascending/descending) for the wishlist grid and updates UI icons.
function toggleWishlistSort() {
    wishlistSortAscending = !wishlistSortAscending;

    var buttonEl = document.getElementById("wishlist-sort-toggle");
    var iconEl = buttonEl.querySelector("i");
    iconEl.className = wishlistSortAscending ? "bi bi-arrow-down" : "bi bi-arrow-up";

    renderWishlistGrid(sortWishlist(currentWishlistItems));
}

// Sorts an array of wishlist items alphabetically by title based on current sort direction.
function sortWishlist(items) {
    var sorted = items.slice();

    sorted.sort(function (a, b) {
        var comparison = a.title.localeCompare(b.title);
        return wishlistSortAscending ? comparison : -comparison;
    });

    return sorted;
}

// Attach primary event listeners to modal buttons.
document.getElementById("wishlist-save-btn").addEventListener("click", handleWishlistSave);
document.getElementById("wishlist-delete-btn").addEventListener("click", handleWishlistDelete);
document.getElementById("wishlist-move-btn").addEventListener("click", handleMoveToLibrary);

// Initialize header and load wishlist data on startup.
loadHeader();
loadWishlist();