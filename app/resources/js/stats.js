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

loadHeader();
loadStats();