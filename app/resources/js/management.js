// Renders the HTML form used to add a new platform.
function renderAddPlatformForm() {
    var container = document.getElementById("add-platform-form");

    container.innerHTML = `
        <form id="platform-form" class="d-flex gap-2" style="max-width: 600px;">
            <input type="text" id="platform-name-input" class="form-control flex-grow-1" placeholder="Nombre de la plataforma" required maxlength="100">
            <input type="color" id="platform-color-input" class="form-control form-control-color" value="#6c757d" title="Color de la etiqueta">
            <button type="submit" class="btn btn-primary">Añadir</button>
        </form>
        <p id="platform-form-message" class="mt-2 mb-0 small"></p>
    `;

    document.getElementById("platform-form").addEventListener("submit", handleAddPlatform);
}

// Handles the submission of the new platform form.
// Prevents page reload, sends the POST request, and refreshes the platform list on success.
async function handleAddPlatform(event) {
    var nameInput;
    var name;
    var messageEl;
    var response;
    var result;

    event.preventDefault(); // Stop form from reloading the page

    nameInput = document.getElementById("platform-name-input");
    name = nameInput.value.trim();
    messageEl = document.getElementById("platform-form-message");

    if (!name) {
        return;
    }

    try {
        response = await fetch("/platforms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, color: document.getElementById("platform-color-input").value })
        });

        if (!response.ok) {
            throw new Error("Error al crear la plataforma");
        }

        result = await response.json();

        // Show success message and clear the input field
        messageEl.className = "mt-2 mb-0 small text-success";
        messageEl.textContent = "Plataforma \"" + result.name + "\" añadida correctamente.";
        nameInput.value = "";

        // Refresh the table to show the newly added platform
        renderPlatformsTable();

    } catch (err) {
        console.error(err);
        messageEl.className = "mt-2 mb-0 small text-danger";
        messageEl.textContent = "No se pudo añadir la plataforma.";
    }
}

// Fetches available platforms and genres from the API, then renders
// the form to add a new game, generating the checkboxes dynamically.
async function renderAddGameForm() {
    var container = document.getElementById("add-game-form");
    var platformsResponse;
    var genresResponse;
    var platformsList;
    var genresList;
    var platformOptions;
    var genreOptions;
    var currentYear;
    var i;

    // Fetch dependencies needed for the checkboxes
    platformsResponse = await fetch("/platforms");
    platformsList = await platformsResponse.json();

    genresResponse = await fetch("/genres");
    genresList = await genresResponse.json();

    currentYear = new Date().getFullYear();

    platformOptions = platformsList ? buildCheckboxListHTML("game-platform", platformsList, []) : "";
    genreOptions = genresList ? buildCheckboxListHTML("game-genre", genresList, []) : "";

    container.innerHTML = `
        <form id="game-form">
            <div class="row mb-2">
                <div class="col-4">
                    <label class="form-label small">Título</label>
                    <input type="text" id="game-title-input" class="form-control" required maxlength="255">
                </div>

                <div class="col-2">
                    <label class="form-label small">Estado</label>
                    <select id="game-status-input" class="form-select">
                        <option value="pendiente">Pendiente</option>
                        <option value="jugando">Jugando</option>
                        <option value="completado">Completado</option>
                    </select>
                </div>

                <div class="col-1">
                    <label class="form-label small">Año</label>
                    <input type="number" id="game-year-input" class="form-control" min="1950" max="${currentYear}">
                </div>
            
                <div class="col-1">
                    <label class="form-label small">Rating</label>
                    <input type="number" id="game-rating-input" class="form-control" min="0" max="5" step="0.5">
                </div>

                <div class="col-8 mt-3">
                    <label class="form-label small">URL de la foto</label>
                    <input type="url" id="game-photo-input" class="form-control" placeholder="https://...">
                </div>
            
                <div class="row my-3">
                    <div class="col-4 text-light">
                        <label class="form-label small">Plataformas <span>(Ctrl/Cmd)</span></label>
                        ${platformOptions}
                    </div>

                    <div class="col-4 text-light">
                        <label class="form-label small">Géneros <span>(Ctrl/Cmd)</span></label>
                        ${genreOptions}
                    </div>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Añadir juego</button>
        </form>
        <p id="game-form-message" class="mt-2 mb-0 small"></p>
    `;

    document.getElementById("game-form").addEventListener("submit", handleAddGame);
}

// Reads the "add game" form and sends a POST request.
// Only includes optional fields (year, rating, photo) if the user provided them.
async function handleAddGame(event) {
    var titleInput;
    var statusInput;
    var yearInput;
    var ratingInput;
    var photoInput;
    var messageEl;
    var response;
    var result;
    var platformIds;
    var genreIds;
    var payload;
    var i;

    event.preventDefault();

    titleInput = document.getElementById("game-title-input");
    statusInput = document.getElementById("game-status-input");
    yearInput = document.getElementById("game-year-input");
    ratingInput = document.getElementById("game-rating-input");
    photoInput = document.getElementById("game-photo-input");
    messageEl = document.getElementById("game-form-message");

    platformIds = getCheckedIds("game-platform");
    genreIds = getCheckedIds("game-genre");

    // Base payload with required fields
    payload = {
        title: titleInput.value.trim(),
        status: statusInput.value,
        platform_ids: platformIds,
        genre_ids: genreIds
    };

    // Attach optional fields only if they have a value to avoid inserting null/empty strings
    if (yearInput.value) {
        payload.release_year = parseInt(yearInput.value, 10);
    }
    if (ratingInput.value) {
        payload.rating = parseFloat(ratingInput.value);
    }
    if (photoInput.value.trim()) {
        payload.photo_url = photoInput.value.trim();
    }

    try {
        response = await fetch("/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Error al crear el juego");
        }

        result = await response.json();

        messageEl.className = "mt-2 mb-0 small text-success";
        messageEl.textContent = "Juego \"" + result.title + "\" añadido correctamente.";

        // Clear the entire form after successful submission
        document.getElementById("game-form").reset();

    } catch (err) {
        console.error(err);
        messageEl.className = "mt-2 mb-0 small text-danger";
        messageEl.textContent = "No se pudo añadir el juego.";
    }
}

// Fetches platforms and renders them in a 4-column grid.
// Each cell includes inline editing (name/color) and deletion controls.
async function renderPlatformsTable() {
    var container = document.getElementById("platforms-table");
    var response;
    var platformsList;
    var html;
    var i;
    var j;

    response = await fetch("/platforms");
    platformsList = await response.json();

    if (!platformsList || platformsList.length === 0) {
        container.innerHTML = '<p class="text-secondary small">No hay plataformas todavía.</p>';
        return;
    }

    // Start a table with spaced cells for styling
    html = `<table class="table table-sm align-middle table-borderless rounded-table w-75" style="border-collapse: separate; border-spacing: 12px 12px;">`;

    // Loop through the list, creating a new row every 4 items
    for (i = 0; i < platformsList.length; i += 4) {
        html += `<tr>`;

        for (j = i; j < i + 4 && j < platformsList.length; j++) {
            html += `
            <td class="p-0" data-id="${platformsList[j].id}">
                <div class="input-group input-group-sm w-100">
                    <input type="color" class="form-control form-control-color platform-color-input" value="${platformsList[j].color}">
                    <input type="text" class="form-control platform-name-input" value="${platformsList[j].name}" maxlength="100">
                    <button class="btn btn-success platform-save-btn" type="button" title="Guardar"><i class="bi bi-check"></i></button>
                    <button class="btn btn-danger platform-delete-btn me-5" type="button" title="Borrar"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        `;
        }

        html += `</tr>`;
    }
    html += `</table>`;

    container.innerHTML = html;

    // Attach event listeners to the dynamically created inline buttons
    container.querySelectorAll(".platform-save-btn").forEach(function (btn) {
        btn.addEventListener("click", handlePlatformSave);
    });

    container.querySelectorAll(".platform-delete-btn").forEach(function (btn) {
        btn.addEventListener("click", handlePlatformDelete);
    });
}

// Handles inline updating of a platform.
// Finds the closest table cell to extract the ID and new input values.
async function handlePlatformSave(event) {
    var cell = event.target.closest("td");
    var id = cell.getAttribute("data-id");
    var nameInput = cell.querySelector(".platform-name-input");
    var colorInput = cell.querySelector(".platform-color-input");
    var newName = nameInput.value.trim();
    var newColor = colorInput.value;

    if (!newName) return;
    if (!confirm('¿Cambiar el nombre a "' + newName + '"?')) return;

    try {
        var response = await fetch("/platforms/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName, color: newColor })
        });
        if (!response.ok) throw new Error("Error al actualizar");
    } catch (err) {
        console.error(err);
        alert("No se pudo actualizar la plataforma.");
    }
}

// Deletes a platform after user confirmation.
// Note: Backend should block deletion if the platform is tied to existing games.
async function handlePlatformDelete(event) {
    var cell;
    var id;
    var response;

    cell = event.target.closest("td");
    id = cell.getAttribute("data-id");

    if (!confirm("¿Borrar esta plataforma? Solo se puede si no tiene juegos asociados.")) {
        return;
    }

    try {
        response = await fetch("/platforms/" + id, { method: "DELETE" });

        if (!response.ok) {
            throw new Error("Error al borrar");
        }

        renderPlatformsTable(); // Refresh UI

    } catch (err) {
        console.error(err);
        alert("No se pudo borrar (puede que tenga juegos asociados).");
    }
}

// Renders a simple inline form for creating a new genre.
function renderAddGenreForm() {
    var container = document.getElementById("add-genre-form");

    container.innerHTML =
        '<form id="genre-form" class="d-flex gap-2" style="max-width: 600px;">' +
        '<input type="text" id="genre-name-input" class="form-control" placeholder="Nombre del género" required maxlength="100">' +
        '<button type="submit" class="btn btn-primary">Añadir</button>' +
        '</form>' +
        '<p id="genre-form-message" class="mt-2 mb-0 small"></p>';

    document.getElementById("genre-form").addEventListener("submit", handleAddGenre);
}

// Handles submitting the new genre form, similar to handleAddPlatform.
async function handleAddGenre(event) {
    var nameInput;
    var name;
    var messageEl;
    var response;
    var result;

    event.preventDefault();

    nameInput = document.getElementById("genre-name-input");
    name = nameInput.value.trim();
    messageEl = document.getElementById("genre-form-message");

    if (!name) {
        return;
    }

    try {
        response = await fetch("/genres", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name })
        });

        if (!response.ok) {
            throw new Error("Error al crear el género");
        }

        result = await response.json();

        messageEl.className = "mt-2 mb-0 small text-success";
        messageEl.textContent = "Género \"" + result.name + "\" añadido correctamente.";
        nameInput.value = "";

        renderGenresTable();

    } catch (err) {
        console.error(err);
        messageEl.className = "mt-2 mb-0 small text-danger";
        messageEl.textContent = "No se pudo añadir el género.";
    }
}

// Fetches genres and renders them in a 4-column grid, matching the style of platforms.
async function renderGenresTable() {
    var container = document.getElementById("genres-table");
    var response;
    var genresList;
    var html;
    var i;
    var j;

    response = await fetch("/genres");
    genresList = await response.json();

    if (!genresList || genresList.length === 0) {
        container.innerHTML = '<p class="text-secondary small">No hay géneros todavía.</p>';
        return;
    }

    html = `<table class="table table-sm align-middle table-borderless rounded-table w-75" style="border-collapse: separate; border-spacing: 12px 12px;">`;

    for (i = 0; i < genresList.length; i += 4) {
        html += `<tr>`;

        for (j = i; j < i + 4 && j < genresList.length; j++) {
            html += `
            <td class="p-0" data-id="${genresList[j].id}">
                <div class="input-group input-group-sm w-100">
                    <input type="text" class="form-control genre-name-input" value="${genresList[j].name}" maxlength="100">
                    <button class="btn btn-success genre-save-btn" type="button" title="Guardar"><i class="bi bi-check"></i></button>
                    <button class="btn btn-danger genre-delete-btn me-5" type="button" title="Borrar"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        `;
        }

        html += `</tr>`;
    }
    html += `</table>`;

    container.innerHTML = html;

    container.querySelectorAll(".genre-save-btn").forEach(function (btn) {
        btn.addEventListener("click", handleGenreSave);
    });

    container.querySelectorAll(".genre-delete-btn").forEach(function (btn) {
        btn.addEventListener("click", handleGenreDelete);
    });
}

// Handles inline updating of a genre name.
async function handleGenreSave(event) {
    var cell;
    var id;
    var input;
    var newName;
    var response;

    cell = event.target.closest("td");
    id = cell.getAttribute("data-id");
    input = cell.querySelector(".genre-name-input");
    newName = input.value.trim();

    if (!newName) {
        return;
    }

    if (!confirm('¿Cambiar el nombre a "' + newName + '"?')) {
        return;
    }

    try {
        response = await fetch("/genres/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName })
        });

        if (!response.ok) {
            throw new Error("Error al actualizar");
        }

    } catch (err) {
        console.error(err);
        alert("No se pudo actualizar el género.");
    }
}

// Deletes a genre after confirmation, failing if tied to existing games.
async function handleGenreDelete(event) {
    var cell;
    var id;
    var response;

    cell = event.target.closest("td");
    id = cell.getAttribute("data-id");

    if (!confirm("¿Borrar este género? Solo se puede si no tiene juegos asociados.")) {
        return;
    }

    try {
        response = await fetch("/genres/" + id, { method: "DELETE" });

        if (!response.ok) {
            throw new Error("Error al borrar");
        }

        renderGenresTable();

    } catch (err) {
        console.error(err);
        alert("No se pudo borrar (puede que tenga juegos asociados).");
    }
}

// Renders the form for adding an item to the wishlist.
// Shares similarities with the main game form but includes a "Notes" field.
async function renderAddWishlistForm() {
    var container = document.getElementById("add-wishlist-form");
    var platformsResponse;
    var genresResponse;
    var platformsList;
    var genresList;
    var platformOptions;
    var genreOptions;
    var currentYear;
    var i;

    platformsResponse = await fetch("/platforms");
    platformsList = await platformsResponse.json();

    genresResponse = await fetch("/genres");
    genresList = await genresResponse.json();

    currentYear = new Date().getFullYear();

    platformOptions = platformsList ? buildCheckboxListHTML("wishlist-platform", platformsList, []) : "";
    genreOptions = genresList ? buildCheckboxListHTML("wishlist-genre", genresList, []) : "";

    container.innerHTML = `
        <form id="wishlist-form">
            <div class="row mb-2">
                <div class="col-4">
                    <label class="form-label small">Título</label>
                    <input type="text" id="wishlist-title-input" class="form-control" required maxlength="255">
                </div>
                <div class="col-1">
                    <label class="form-label small">Año</label>
                    <input type="number" id="wishlist-year-input" class="form-control" min="1950" max="${currentYear}">
                </div>
                <div class="col-8">
                    <label class="form-label small">URL de la foto</label>
                    <input type="url" id="wishlist-photo-input" class="form-control">
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-4 text-light">
                    <label class="form-label small">Plataformas <span>(Ctrl/Cmd)</span></label>
                    ${platformOptions}
                </div>
                <div class="col-4 text-light">
                    <label class="form-label small">Géneros <span>(Ctrl/Cmd)</span></label>
                    ${genreOptions}
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-8">
                    <label class="form-label small">Notas</label>
                    <textarea id="wishlist-notes-input" class="form-control" rows="2"></textarea>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Añadir a wishlist</button>
        </form>
        <p id="wishlist-form-message" class="mt-2 mb-0 small"></p>
    `;

    document.getElementById("wishlist-form").addEventListener("submit", handleAddWishlistItem);
}

// Reads the wishlist form and sends a POST request.
// Only includes optional fields (year, photo, notes) if provided.
async function handleAddWishlistItem(event) {
    var titleInput;
    var yearInput;
    var photoInput;
    var notesInput;
    var messageEl;
    var platformIds;
    var genreIds;
    var payload;
    var response;

    event.preventDefault();

    titleInput = document.getElementById("wishlist-title-input");
    yearInput = document.getElementById("wishlist-year-input");
    photoInput = document.getElementById("wishlist-photo-input");
    notesInput = document.getElementById("wishlist-notes-input");
    messageEl = document.getElementById("wishlist-form-message");

    platformIds = getCheckedIds("wishlist-platform");
    genreIds = getCheckedIds("wishlist-genre");

    payload = {
        title: titleInput.value.trim(),
        platform_ids: platformIds,
        genre_ids: genreIds
    };

    if (yearInput.value) {
        payload.release_year = parseInt(yearInput.value, 10);
    }
    if (photoInput.value.trim()) {
        payload.photo_url = photoInput.value.trim();
    }
    if (notesInput.value.trim()) {
        payload.notes = notesInput.value.trim();
    }

    try {
        response = await fetch("/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Error al añadir");
        }

        messageEl.className = "mt-2 mb-0 small text-success";
        messageEl.textContent = "Añadido a la wishlist.";
        document.getElementById("wishlist-form").reset();

    } catch (err) {
        console.error(err);
        messageEl.className = "mt-2 mb-0 small text-danger";
        messageEl.textContent = "No se pudo añadir.";
    }
}

// Export logic: redirects the browser to the endpoints that download the files.
document.getElementById("export-csv-btn").addEventListener("click", function () {
    window.location.href = "/export/csv";
});

document.getElementById("export-wishlist-csv-btn").addEventListener("click", function () {
    window.location.href = "/export/wishlist-csv";
});

// Import logic for main library CSV.
// Uploads the file via FormData and warns the user that this action overrides data.
document.getElementById("import-csv-input").addEventListener("change", async function (event) {
    var file;
    var formData;
    var response;
    var result;

    file = event.target.files[0];
    if (!file) {
        return;
    }

    // Critical safety check before wiping the DB
    if (!confirm("Esto BORRARÁ tu biblioteca actual y la reemplazará por el contenido del CSV. ¿Continuar?")) {
        event.target.value = ""; // Reset input so user can select the same file again if they change their mind later
        return;
    }

    formData = new FormData();
    formData.append("file", file);

    try {
        response = await fetch("/import/csv", {
            method: "POST",
            body: formData // Content-Type is automatically set for multipart/form-data
        });

        if (!response.ok) {
            throw new Error("Error al importar");
        }

        result = await response.json();
        alert("Importados " + result.imported + " juegos correctamente.");

    } catch (err) {
        console.error(err);
        alert("No se pudo importar el CSV.");
    } finally {
        // Always reset the file input so the 'change' event works for subsequent uploads
        event.target.value = "";
    }
});

// Import logic for wishlist CSV (Functions identically to main library import).
document.getElementById("import-wishlist-csv-input").addEventListener("change", async function (event) {
    var file;
    var formData;
    var response;
    var result;

    file = event.target.files[0];
    if (!file) {
        return;
    }

    if (!confirm("Esto BORRARÁ tu wishlist actual y la reemplazará por el contenido del CSV. ¿Continuar?")) {
        event.target.value = "";
        return;
    }

    formData = new FormData();
    formData.append("file", file);

    try {
        response = await fetch("/import/wishlist-csv", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Error al importar");
        }

        result = await response.json();
        alert("Importados " + result.imported + " deseados correctamente.");

    } catch (err) {
        console.error(err);
        alert("No se pudo importar el CSV.");
    } finally {
        event.target.value = "";
    }
});

// Initialization: Call rendering functions when the script first loads
// to populate all forms and tables on the page.
loadHeader();
renderAddGameForm();
renderAddPlatformForm();
renderPlatformsTable();
renderAddGenreForm();
renderGenresTable();
renderAddWishlistForm();