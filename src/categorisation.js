// ─── Speed Category Configuration ────────────────────────────────────────────
const SPEED_THRESHOLDS = {
    fast:   3000,   // avg < 3.00s  → Fast
    medium: 6000,   // avg < 6.00s  → Medium
                    // avg >= 6.00s → Slow
};

const SPEED_GROUP_NAMES = {
    fast:         "⚡ Fast",
    medium:       "🟠 Medium",
    slow:         "🔴 Slow",
    unclassified: "❓ Unclassified",
};

const SPEED_GROUP_COLORS = {
    fast:         "#1b5e20",
    medium:       "#e65100",
    slow:         "#b71c1c",
    unclassified: "#424242",
};
// ─────────────────────────────────────────────────────────────────────────────

// Simple arrays of case IDs per category — no DOM groups needed
const speedCategories = {
    fast:         [],
    medium:       [],
    slow:         [],
    unclassified: [],
};

function getCaseTrueAvgMs(caseNum) {
    const solves = window.timesArray.filter(r => r["case"] === caseNum);
    if (solves.length === 0) return null;
    return solves.reduce((sum, r) => sum + r["ms"], 0) / solves.length;
}

function getCaseCategory(caseNum) {
    const avgMs = getCaseTrueAvgMs(caseNum);
    if (avgMs === null) return "unclassified";
    if (avgMs < SPEED_THRESHOLDS.fast)   return "fast";
    if (avgMs < SPEED_THRESHOLDS.medium) return "medium";
    return "slow";
}

function updateCaseCategory(caseNum) {
    // Remove from whichever category it's currently in
    for (const cat of Object.keys(speedCategories)) {
        const idx = speedCategories[cat].indexOf(caseNum);
        if (idx !== -1) speedCategories[cat].splice(idx, 1);
    }
    // Add to the correct one
    const category = getCaseCategory(caseNum);
    speedCategories[category].push(caseNum);
    updateFilterBar();
}

function recomputeAllCategories() {
    // Clear all
    for (const cat of Object.keys(speedCategories)) {
        speedCategories[cat] = [];
    }
    // Populate from timesArray
    const seen = new Set(window.timesArray.map(r => r["case"]));
    for (const caseNum of seen) {
        const category = getCaseCategory(caseNum);
        speedCategories[category].push(caseNum);
    }
    updateFilterBar();
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function selectSpeedCategory(category) {
    const ids = speedCategories[category];
    if (ids.length === 0) return;

    // If all already selected, deselect them; otherwise select them
    const allSelected = ids.every(c => selCases.includes(c));

    for (const c of ids) {
        const j = selCases.indexOf(c);
        if (allSelected && j !== -1) {
            selCases.splice(j, 1);
        } else if (!allSelected && j === -1) {
            selCases.push(c);
        }
        // Update tile appearance
        const tile = document.getElementById("itemTd" + c);
        if (tile) tile.className = (selCases.includes(c) ? "itemSel" : "itemUnsel") + " borderedContainer";
    }
    saveSelection();
    updateFilterBar();
}

function updateFilterBar() {
    const bar = document.getElementById("speedFilterBar");
    if (!bar) return;

    bar.innerHTML = "";
    for (const cat of ["fast", "medium", "slow", "unclassified"]) {
        const ids = speedCategories[cat];
        if (ids.length === 0) continue;

        const allSelected = ids.every(c => selCases.includes(c));
        const btn = document.createElement("div");
        btn.className = "borderedContainer pad " + (allSelected ? "itemSel" : "itemUnsel");
        btn.style.backgroundColor = SPEED_GROUP_COLORS[cat];
        btn.style.color = "white";
        btn.style.cursor = "pointer";
        btn.style.marginRight = "4px";
        btn.style.marginBottom = "4px";
        btn.innerHTML = `<b>${SPEED_GROUP_NAMES[cat]} (${ids.length})</b>`;
        btn.onclick = () => selectSpeedCategory(cat);
        bar.appendChild(btn);
    }
}

function createFilterBar() {
    if (document.getElementById("speedFilterBar")) return;

    const bar = document.createElement("div");
    bar.id = "speedFilterBar";
    bar.className = "rowFlex";
    bar.style.flexWrap = "wrap";
    bar.style.marginBottom = "8px";

    // Insert at the top of the selection area, above cases_selection
    const casesSelection = document.getElementById("cases_selection");
    if (casesSelection && casesSelection.parentNode) {
        casesSelection.parentNode.insertBefore(bar, casesSelection);
    }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

const _cat_originalAppendStats = window.appendStats || appendStats;
window.appendStats = function() {
    _cat_originalAppendStats();
    updateCaseCategory(window.lastCase);
};

const _cat_originalCheckPostRender = window.checkPostRender || checkPostRender;
window.checkPostRender = function() {
    _cat_originalCheckPostRender();
    createFilterBar();
    recomputeAllCategories();
};
