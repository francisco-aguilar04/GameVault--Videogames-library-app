function renderAddPlatformForm() {
    var container = document.getElementById("add-platform-form");

    container.innerHTML = `
        <form id="platform-form" class="d-flex gap-2" style="max-width: 600px;">
            <input type="text" id="platform-name-input" class="form-control flex-grow-1" placeholder="Nombre de la plataforma" required maxlength="100">
            <button type="submit" class="btn btn-primary">Añadir</button>
        </form>
        <p id="platform-form-message" class="mt-2 mb-0 small"></p>
    `;

    document.getElementById("platform-form").addEventListener("submit", handleAddPlatform);
}

async function handleAddPlatform(event) {
    var nameInput;
    var name;
    var messageEl;
    var response;
    var result;

    event.preventDefault();

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
            body: JSON.stringify({ name: name })
        });

        if (!response.ok) {
            throw new Error("Error al crear la plataforma");
        }

        result = await response.json();

        messageEl.className = "mt-2 mb-0 small text-success";
        messageEl.textContent = "Plataforma \"" + result.name + "\" añadida correctamente.";
        nameInput.value = "";

        renderPlatformsTable();

    } catch (err) {
        console.error(err);
        messageEl.className = "mt-2 mb-0 small text-danger";
        messageEl.textContent = "No se pudo añadir la plataforma.";
    }
}

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

    platformsResponse = await fetch("/platforms");
    platformsList = await platformsResponse.json();

    genresResponse = await fetch("/genres");
    genresList = await genresResponse.json();

    currentYear = new Date().getFullYear();

    platformOptions = "";
    if (platformsList) {
        for (i = 0; i < platformsList.length; i++) {
            platformOptions += '<option value="' + platformsList[i].id + '">' + platformsList[i].name + '</option>';
        }
    }

    genreOptions = "";
    if (genresList) {
        for (i = 0; i < genresList.length; i++) {
            genreOptions += '<option value="' + genresList[i].id + '">' + genresList[i].name + '</option>';
        }
    }

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

                    <div class="col-4">
                        <label class="form-label small">Plataformas <span>(Ctrl/Cmd)</span></label>
                        <select id="game-platforms-input" class="form-select" multiple size="4">${platformOptions}</select>
                    </div>

                    <div class="col-4">
                        <label class="form-label small">Géneros <span>(Ctrl/Cmd)</span></label>
                        <select id="game-genres-input" class="form-select" multiple size="4">${genreOptions}</select>
                    </div>

                </div>
            </div>
            <button type="submit" class="btn btn-primary">Añadir juego</button>
        </form>
        <p id="game-form-message" class="mt-2 mb-0 small"></p>
    `;

    document.getElementById("game-form").addEventListener("submit", handleAddGame);
}

async function handleAddGame(event) {
    var titleInput;
    var statusInput;
    var yearInput;
    var ratingInput;
    var photoInput;
    var platformsSelect;
    var genresSelect;
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
    platformsSelect = document.getElementById("game-platforms-input");
    genresSelect = document.getElementById("game-genres-input");
    messageEl = document.getElementById("game-form-message");

    platformIds = [];
    for (i = 0; i < platformsSelect.selectedOptions.length; i++) {
        platformIds.push(parseInt(platformsSelect.selectedOptions[i].value, 10));
    }

    genreIds = [];
    for (i = 0; i < genresSelect.selectedOptions.length; i++) {
        genreIds.push(parseInt(genresSelect.selectedOptions[i].value, 10));
    }

    payload = {
        title: titleInput.value.trim(),
        status: statusInput.value,
        platform_ids: platformIds,
        genre_ids: genreIds
    };

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
        document.getElementById("game-form").reset();

    } catch (err) {
        console.error(err);
        messageEl.className = "mt-2 mb-0 small text-danger";
        messageEl.textContent = "No se pudo añadir el juego.";
    }
}

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

    html = `<table class="table table-sm align-middle table-borderless rounded-table w-75" style="border-collapse: separate; border-spacing: 12px 12px;">`;

    for (i = 0; i < platformsList.length; i += 4) {
        html += `<tr>`;

        for (j = i; j < i + 4 && j < platformsList.length; j++) {
            html += `
			<td class="p-0" data-id="${platformsList[j].id}">
				<div class="input-group input-group-sm w-100">
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

    container.querySelectorAll(".platform-save-btn").forEach(function (btn) {
        btn.addEventListener("click", handlePlatformSave);
    });

    container.querySelectorAll(".platform-delete-btn").forEach(function (btn) {
        btn.addEventListener("click", handlePlatformDelete);
    });
}

async function handlePlatformSave(event) {
    var cell;
    var id;
    var input;
    var newName;
    var response;

    cell = event.target.closest("td");
    id = cell.getAttribute("data-id");
    input = cell.querySelector(".platform-name-input");
    newName = input.value.trim();

    if (!newName) {
        return;
    }

    if (!confirm('¿Cambiar el nombre a "' + newName + '"?')) {
        return;
    }

    try {
        response = await fetch("/platforms/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName })
        });

        if (!response.ok) {
            throw new Error("Error al actualizar");
        }

    } catch (err) {
        console.error(err);
        alert("No se pudo actualizar la plataforma.");
    }
}

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

        renderPlatformsTable();

    } catch (err) {
        console.error(err);
        alert("No se pudo borrar (puede que tenga juegos asociados).");
    }
}

document.getElementById("export-csv-btn").addEventListener("click", function () {
    window.location.href = "/export/csv";
});

loadHeader();
renderAddGameForm();
renderAddPlatformForm();
renderPlatformsTable();