async function loadStats() {
    var response;
    var stats;

    response = await fetch("/stats");
    stats = await response.json();

    renderStats(stats);
}

function renderStats(stats) {
    document.querySelector(".stat-total").textContent = stats.total_games;
    document.querySelector(".stat-completed").textContent = stats.completed;
    document.querySelector(".stat-playing").textContent = stats.playing;
    document.querySelector(".stat-pending").textContent = stats.pending;

    var averageEl = document.querySelector(".stat-average");
    averageEl.textContent = stats.average_rating !== null
        ? stats.average_rating.toFixed(1)
        : "—";

    var genreEl = document.querySelector(".stat-top-genre");
    genreEl.textContent = stats.top_genre !== null ? stats.top_genre : "—";
}

async function loadRatingChart() {
    var response;
    var distribution;

    response = await fetch("/stats/rating-distribution");
    distribution = await response.json();

    renderRatingChart(distribution);
}

function renderRatingChart(distribution) {
    var container = document.getElementById("rating-bars");
    var labels = ["5", "4", "3", "2", "1"];
    var maxCount = 0;
    var i;

    for (i = 0; i < labels.length; i++) {
        var count = distribution[labels[i]] || 0;
        if (count > maxCount) {
            maxCount = count;
        }
    }

    container.innerHTML = "";

    for (i = 0; i < labels.length; i++) {
        var count = distribution[labels[i]] || 0;
        var percent = maxCount > 0 ? (count / maxCount) * 100 : 0;

        var row = document.createElement("div");
        row.className = "d-flex align-items-center gap-2 mb-2";

        var label = document.createElement("span");
        label.className = "rating-bar-label";
        label.textContent = "★ " + labels[i];

        var track = document.createElement("div");
        track.className = "rating-bar-track flex-grow-1";

        var fill = document.createElement("div");
        fill.className = "rating-bar-fill";
        fill.style.width = percent + "%";
        track.appendChild(fill);

        var countEl = document.createElement("span");
        countEl.className = "rating-bar-count";
        countEl.textContent = count;

        row.appendChild(label);
        row.appendChild(track);
        row.appendChild(countEl);
        container.appendChild(row);
    }
}

async function loadPodiums() {
    var platformsResponse;
    var genresResponse;
    var topPlatforms;
    var topGenres;

    platformsResponse = await fetch("/stats/top-platforms");
    topPlatforms = await platformsResponse.json();

    genresResponse = await fetch("/stats/top-genres");
    topGenres = await genresResponse.json();

    renderPodium("platform-podium", topPlatforms);
    renderPodium("genre-podium", topGenres);
}

function renderPodium(containerId, items) {
    var container = document.getElementById(containerId);
    var ranks = ["rank-1", "rank-2", "rank-3"];
    var i;

    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML = '<p class="text-secondary">Sin datos todavía.</p>';
        return;
    }

    for (i = 0; i < items.length && i < 3; i++) {
        var step = document.createElement("div");
        step.className = "podium-step " + ranks[i];

        var name = document.createElement("p");
        name.className = "podium-name";
        name.textContent = items[i].name;

        var count = document.createElement("p");
        count.className = "podium-count";
        count.textContent = items[i].count;

        var bar = document.createElement("div");
        bar.className = "podium-bar " + ranks[i];
        bar.textContent = (i + 1) + "º";

        step.appendChild(name);
        step.appendChild(count);
        step.appendChild(bar);
        container.appendChild(step);
    }
}

loadHeader();
loadStats();
loadRatingChart();
loadPodiums();