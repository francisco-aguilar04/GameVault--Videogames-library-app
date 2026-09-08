// Fetches general dashboard statistics from the API and triggers the UI update.
async function loadStats() {
    var response;
    var stats;

    response = await fetch("/stats");
    stats = await response.json();

    renderStats(stats);
}

// Populates the summary cards on the dashboard with the fetched data.
function renderStats(stats) {
    document.querySelector(".stat-total").textContent = stats.total_games;
    document.querySelector(".stat-completed").textContent = stats.completed;
    document.querySelector(".stat-playing").textContent = stats.playing;
    document.querySelector(".stat-pending").textContent = stats.pending;

    // Formats the average rating to exactly 1 decimal place (e.g., "4.2").
    // If there are no rated games (null), it displays an em dash ("—").
    var averageEl = document.querySelector(".stat-average");
    averageEl.textContent = stats.average_rating !== null
        ? stats.average_rating.toFixed(1)
        : "—";

    var genreEl = document.querySelector(".stat-top-genre");
    genreEl.textContent = stats.top_genre !== null ? stats.top_genre : "—";
}

// Fetches the distribution of ratings (how many games have 5 stars, 4 stars, etc.)
async function loadRatingChart() {
    var response;
    var distribution;

    response = await fetch("/stats/rating-distribution");
    distribution = await response.json();

    renderRatingChart(distribution);
}

// Generates a custom horizontal bar chart dynamically using pure DOM elements.
function renderRatingChart(distribution) {
    var container = document.getElementById("rating-bars");
    var labels = ["5", "4", "3", "2", "1"]; // Order matters: descending for the UI
    var maxCount = 0;
    var i;

    // First pass: find the maximum count among all ratings.
    // This is necessary to calculate proportional widths (the highest bar will be 100% wide).
    for (i = 0; i < labels.length; i++) {
        var count = distribution[labels[i]] || 0;
        if (count > maxCount) {
            maxCount = count;
        }
    }

    container.innerHTML = ""; // Clear any existing chart data

    // Second pass: create the visual bars.
    for (i = 0; i < labels.length; i++) {
        var count = distribution[labels[i]] || 0;

        // Calculate width as a percentage of the maximum count to scale bars correctly.
        var percent = maxCount > 0 ? (count / maxCount) * 100 : 0;

        // Build the row container
        var row = document.createElement("div");
        row.className = "d-flex align-items-center gap-2 mb-2";

        // Build the label (e.g., "★ 5")
        var label = document.createElement("span");
        label.className = "rating-bar-label";
        label.textContent = "★ " + labels[i];

        // Build the track (the background of the bar)
        var track = document.createElement("div");
        track.className = "rating-bar-track flex-grow-1";

        // Build the fill (the colored part of the bar that represents the data)
        var fill = document.createElement("div");
        fill.className = "rating-bar-fill";
        fill.style.width = percent + "%";
        track.appendChild(fill);

        // Build the count number at the end of the bar
        var countEl = document.createElement("span");
        countEl.className = "rating-bar-count";
        countEl.textContent = count;

        // Assemble the row and append it to the container
        row.appendChild(label);
        row.appendChild(track);
        row.appendChild(countEl);
        container.appendChild(row);
    }
}

// Fetches the top 3 platforms and genres concurrently to display on the podiums.
async function loadPodiums() {
    var platformsResponse;
    var genresResponse;
    var topPlatforms;
    var topGenres;

    platformsResponse = await fetch("/stats/top-platforms");
    topPlatforms = await platformsResponse.json();

    genresResponse = await fetch("/stats/top-genres");
    topGenres = await genresResponse.json();

    // Reuses the same rendering logic for both podiums
    renderPodium("platform-podium", topPlatforms);
    renderPodium("genre-podium", topGenres);
}

// Builds a visual "Top 3" podium. 
// Can be used for any list of items that have a 'name' and 'count' property.
function renderPodium(containerId, items) {
    var container = document.getElementById(containerId);
    var ranks = ["rank-1", "rank-2", "rank-3"]; // CSS classes for specific styling per rank
    var i;

    container.innerHTML = "";

    // Graceful fallback if there is no data to display
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="text-secondary">Sin datos todavía.</p>';
        return;
    }

    // Iterate up to a maximum of 3 items
    for (i = 0; i < items.length && i < 3; i++) {
        var step = document.createElement("div");
        step.className = "podium-step " + ranks[i]; // Applies specific CSS based on 1st, 2nd, or 3rd place

        var name = document.createElement("p");
        name.className = "podium-name";
        name.textContent = items[i].name;

        var count = document.createElement("p");
        count.className = "podium-count";
        count.textContent = items[i].count;

        var bar = document.createElement("div");
        bar.className = "podium-bar " + ranks[i];
        bar.textContent = (i + 1) + "º"; // Adds "1º", "2º", "3º" labels

        // Assemble the podium step
        step.appendChild(name);
        step.appendChild(count);
        step.appendChild(bar);
        container.appendChild(step);
    }
}

// Initialize the dashboard components when the script loads.
loadHeader();
loadStats();
loadRatingChart();
loadPodiums();