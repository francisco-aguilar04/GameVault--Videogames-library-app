var wishlistModal;

async function loadWishlist() {
    var response;
    var items;

    await loadMaps();

    response = await fetch("/wishlist");
    items = await response.json();

    renderWishlistGrid(items);
}

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
            pill.className = "badge rounded-pill bg-opacity-75 me-1 mb-1 " + platformBadgeClass(name);
            pill.textContent = name;
            pillsEl.appendChild(pill);
        }
    });

    return clone;
}

async function openWishlistModal(id) {
    var response;
    var item;
    var platformEntries;
    var genreEntries;
    var platformsSelect;
    var genresSelect;
    var i;
    var pid;
    var gid;
    var opt;
    var gopt;

    await loadMaps();

    response = await fetch("/wishlist/" + id);
    item = await response.json();

    document.getElementById("wishlist-edit-id").value = item.id;
    document.getElementById("wishlist-edit-title").value = item.title;
    document.getElementById("wishlist-edit-year").value = item.release_year || "";
    document.getElementById("wishlist-edit-photo").value = item.photo_url || "";
    document.getElementById("wishlist-edit-notes").value = item.notes || "";

    platformEntries = Object.entries(platformMap).sort(function (a, b) {
        return a[1].localeCompare(b[1]);
    });

    platformsSelect = document.getElementById("wishlist-edit-platforms");
    platformsSelect.innerHTML = "";
    for (i = 0; i < platformEntries.length; i++) {
        pid = platformEntries[i][0];
        opt = document.createElement("option");
        opt.value = pid;
        opt.textContent = platformEntries[i][1];
        if (item.platform_ids && item.platform_ids.indexOf(parseInt(pid, 10)) !== -1) {
            opt.selected = true;
        }
        platformsSelect.appendChild(opt);
    }

    genreEntries = Object.entries(genreMap).sort(function (a, b) {
        return a[1].localeCompare(b[1]);
    });

    genresSelect = document.getElementById("wishlist-edit-genres");
    genresSelect.innerHTML = "";
    for (i = 0; i < genreEntries.length; i++) {
        gid = genreEntries[i][0];
        gopt = document.createElement("option");
        gopt.value = gid;
        gopt.textContent = genreEntries[i][1];
        if (item.genre_ids && item.genre_ids.indexOf(parseInt(gid, 10)) !== -1) {
            gopt.selected = true;
        }
        genresSelect.appendChild(gopt);
    }

    if (!wishlistModal) {
        wishlistModal = new bootstrap.Modal(document.getElementById("wishlist-modal"));
    }
    wishlistModal.show();
}

async function handleWishlistSave() {
    var id;
    var platformsSelect;
    var genresSelect;
    var platformIds;
    var genreIds;
    var i;
    var payload;
    var response;

    id = document.getElementById("wishlist-edit-id").value;

    platformsSelect = document.getElementById("wishlist-edit-platforms");
    platformIds = [];
    for (i = 0; i < platformsSelect.selectedOptions.length; i++) {
        platformIds.push(parseInt(platformsSelect.selectedOptions[i].value, 10));
    }

    genresSelect = document.getElementById("wishlist-edit-genres");
    genreIds = [];
    for (i = 0; i < genresSelect.selectedOptions.length; i++) {
        genreIds.push(parseInt(genresSelect.selectedOptions[i].value, 10));
    }

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

document.getElementById("wishlist-save-btn").addEventListener("click", handleWishlistSave);
document.getElementById("wishlist-delete-btn").addEventListener("click", handleWishlistDelete);
document.getElementById("wishlist-move-btn").addEventListener("click", handleMoveToLibrary);

loadHeader();
loadWishlist();