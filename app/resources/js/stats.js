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

loadHeader();
loadStats();
loadRatingChart();