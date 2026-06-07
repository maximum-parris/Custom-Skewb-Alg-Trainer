// ─── Speed Category Configuration ───────────────────────────────────────────
const SPEED_THRESHOLDS = {
    fast:   3000,   // avg ms < 3000 → Fast (green)
    medium: 6000,   // avg ms < 6000 → Medium (orange)
    // anything above → Slow (red)
};

const SPEED_CATEGORY_STYLE = {
    fast:        { label: "F", color: "#2e7d32" },   // green
    medium:      { label: "M", color: "#e65100" },   // orange
    slow:        { label: "S", color: "#b71c1c" },   // red
    unclassified:{ label: "",  color: "transparent" },
};
// ─────────────────────────────────────────────────────────────────────────────

/** Returns "fast" | "medium" | "slow" | "unclassified" for a given case number */
function getCaseCategory(caseNum) {
    const solves = window.timesArray.filter(r => r["case"] === caseNum);
    if (solves.length === 0) return "unclassified";

    // r["ms"] is stored as ms*10 in makeResultInstance — divide back to get true ms
    const avgMs = solves.reduce((sum, r) => sum + r["ms"], 0) / solves.length / 10;

    if (avgMs < SPEED_THRESHOLDS.fast)   return "fast";
    if (avgMs < SPEED_THRESHOLDS.medium) return "medium";
    return "slow";
}

/** Returns the true average ms for a case (correcting for the *10 storage factor) */
function getCaseTrueAvgMs(caseNum) {
    const solves = window.timesArray.filter(r => r["case"] === caseNum);
    if (solves.length === 0) return null;
    return solves.reduce((sum, r) => sum + r["ms"], 0) / solves.length / 10;
}

/** Renders or updates the speed badge on a case's grid tile */
function updateCaseBadge(caseNum) {
    const tile = document.getElementById("itemTd" + caseNum);
    if (!tile) return;

    const category = getCaseCategory(caseNum);
    const { label, color } = SPEED_CATEGORY_STYLE[category];

    tile.style.position = "relative";

    const badgeId = "speedBadge" + caseNum;
    let badge = document.getElementById(badgeId);

    if (!badge) {
        badge = document.createElement("div");
        badge.id = badgeId;
        badge.style.cssText = `
            position: absolute;
            bottom: 3px;
            right: 3px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            font-size: 8px;
            font-weight: bold;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            z-index: 10;
            box-shadow: 0 1px 3px rgba(0,0,0,0.5);
        `;
        tile.appendChild(badge);
    }

    badge.style.backgroundColor = color;
    badge.textContent = label;

    const avgMs = getCaseTrueAvgMs(caseNum);
    badge.title = avgMs !== null
        ? `${category.charAt(0).toUpperCase() + category.slice(1)} (avg: ${msToHumanReadable(avgMs * 10)})`
        : "Unclassified";
}

/** Re-renders all badges — call after renderSelection() so tiles exist in the DOM */
function updateAllBadges() {
    const seen = {};
    for (const r of window.timesArray) {
        seen[r["case"]] = true;
    }
    for (const caseNum of Object.keys(seen)) {
        updateCaseBadge(parseInt(caseNum));
    }
}

// ─── Category Filter Bar ─────────────────────────────────────────────────────

/** Selects (or deselects if all already selected) cases matching a given category */
function selectByCategory(category) {
    const matchingCases = getAllValid().filter(c => getCaseCategory(c) === category);
    if (matchingCases.length === 0) return;

    const allAlreadySelected = matchingCases.every(c => selCases.includes(c));

    for (const c of matchingCases) {
        const j = selCases.indexOf(c);
        if (allAlreadySelected && j !== -1) {
            selCases.splice(j, 1);
        } else if (!allAlreadySelected && j === -1) {
            selCases.push(c);
        }
    }

    saveSelection();

    // Update tile visual state
    for (const c of matchingCases) {
        const tile = document.getElementById("itemTd" + c);
        if (tile) {
            tile.className = (selCases.includes(c) ? "itemSel" : "itemUnsel") + " borderedContainer";
        }
    }

    updateAllBadges();
    renderCategoryFilterBar();
}

/** Renders the category filter bar above the case grid */
function renderCategoryFilterBar() {
    const existing = document.getElementById("categoryFilterBar");
    if (existing) existing.remove();

    const bar = document.createElement("div");
    bar.id = "categoryFilterBar";
    bar.style.cssText = "display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;";

    const categories = ["fast", "medium", "slow", "unclassified"];
    for (const cat of categories) {
        const { color } = SPEED_CATEGORY_STYLE[cat];
        const matchingCases = getAllValid().filter(c => getCaseCategory(c) === cat);
        if (matchingCases.length === 0) continue;

        const allSelected = matchingCases.every(c => selCases.includes(c));
        const label = cat.charAt(0).toUpperCase() + cat.slice(1);

        const btn = document.createElement("button");
        btn.textContent = `${label} (${matchingCases.length})`;
        btn.style.cssText = `
            background: ${cat === "unclassified" ? "#555" : color};
            color: white;
            border: 2px solid ${allSelected ? "white" : "transparent"};
            border-radius: 6px;
            padding: 4px 10px;
            cursor: pointer;
            font-weight: bold;
            opacity: ${allSelected ? "1" : "0.75"};
            transition: opacity 0.15s, border 0.15s;
        `;
        btn.title = `${allSelected ? "Deselect" : "Select"} all ${label} cases`;
        btn.onclick = () => selectByCategory(cat);
        bar.appendChild(btn);
    }

    const container = document.getElementById("cases_selection");
    if (container) container.insertBefore(bar, container.firstChild);
}

// ─── Hook into existing code ─────────────────────────────────────────────────

// Store references to the originals before patching
const _originalAppendStats = window.appendStats || appendStats;
const _originalRenderSelection = window.renderSelection || renderSelection;

window.appendStats = function () {
    _originalAppendStats();
    updateCaseBadge(window.lastCase);
    renderCategoryFilterBar();
};

window.renderSelection = function () {
    _originalRenderSelection();
    updateAllBadges();
    renderCategoryFilterBar();
};
