// ─── Speed Category Configuration ────────────────────────────────────────────
// Edit these thresholds (in real milliseconds) to taste
const SPEED_THRESHOLDS = {
    fast:   3000,   // avg < 3.00s  → Fast
    medium: 6000,   // avg < 6.00s  → Medium
                    // avg >= 6.00s → Slow
};

// Group names that will appear as group bars in the selection grid
const SPEED_GROUP_NAMES = {
    fast:        "⚡ Fast",
    medium:      "🟠 Medium",
    slow:        "🔴 Slow",
    unclassified: "❓ Unclassified",
};

// Colours for the group bars (background)
const SPEED_GROUP_COLORS = {
    fast:         "#1b5e20",
    medium:       "#e65100",
    slow:         "#b71c1c",
    unclassified: "#424242",
};
// ─────────────────────────────────────────────────────────────────────────────

// Track which speed-category group containers exist in the DOM
const _speedGroupsCreated = new Set();

// Track which category each case is currently in so we only move when it changes
const _caseCategoryCache = {};

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the true average solve time in milliseconds for a given case.
 * r["ms"] = timeStringToMseconds(timeStr) * 10
 * timeStringToMseconds returns hundredths of a second (e.g. 1.91s → 191)
 * So r["ms"] = 1910 for a 1.91s solve. Divide by 10 to get real ms.
 */
function getCaseTrueAvgMs(caseNum) {
    const solves = window.timesArray.filter(r => r["case"] === caseNum);
    if (solves.length === 0) return null;
    return solves.reduce((sum, r) => sum + r["ms"], 0) / solves.length / 10;
}

/** Returns "fast" | "medium" | "slow" | "unclassified" */
function getCaseCategory(caseNum) {
    const avgMs = getCaseTrueAvgMs(caseNum);
    if (avgMs === null) return "unclassified";
    if (avgMs < SPEED_THRESHOLDS.fast)   return "fast";
    if (avgMs < SPEED_THRESHOLDS.medium) return "medium";
    return "slow";
}

// ─── Speed group DOM management ───────────────────────────────────────────────

/**
 * Ensures a speed-category group container exists in #cases_selection.
 * Mirrors the structure created by createGroup() in MySelection.js:
 *   #groupContainer{name} > #groupBar{name} + #casesContainer{name}
 */
function ensureSpeedGroupExists(category) {
    const groupName = SPEED_GROUP_NAMES[category];
    if (_speedGroupsCreated.has(groupName)) return;

    const casesSelection = document.getElementById("cases_selection");
    if (!casesSelection) return;

    // Group wrapper
    const groupContainer = document.createElement("div");
    groupContainer.className = "groupContainer";
    groupContainer.id = "groupContainer" + groupName;

    // Group bar — clicking it calls selectCaseGroup() just like normal groups
    const groupBar = document.createElement("div");
    groupBar.className = "borderedContainer itemUnsel pad groupNameDiv groupBar";
    groupBar.id = "groupBar" + groupName;
    groupBar.style.backgroundColor = SPEED_GROUP_COLORS[category];
    groupBar.style.color = "white";
    groupBar.style.borderColor = SPEED_GROUP_COLORS[category];
    groupBar.onclick = () => selectCaseGroup(groupName);
    groupBar.innerHTML = `<b>${groupName} (<span id="speedGroupCount_${category}">0</span> cases)</b>`;

    // Cases row inside the group
    const casesContainer = document.createElement("div");
    casesContainer.id = "casesContainer" + groupName;
    casesContainer.className = "rowFlex";
    casesContainer.style.flexWrap = "wrap";

    groupContainer.appendChild(groupBar);
    groupContainer.appendChild(casesContainer);

    // Insert speed groups at the top of cases_selection, in order: fast, medium, slow, unclassified
    const order = ["fast", "medium", "slow", "unclassified"];
    const myOrder = order.indexOf(category);

    // Find the first existing speed group that should come after this one
    let insertBefore = null;
    for (let i = myOrder + 1; i < order.length; i++) {
        const laterName = SPEED_GROUP_NAMES[order[i]];
        const laterEl = document.getElementById("groupContainer" + laterName);
        if (laterEl) { insertBefore = laterEl; break; }
    }

    // Insert before that element, or at the top if none found
    if (insertBefore) {
        casesSelection.insertBefore(groupContainer, insertBefore);
    } else {
        casesSelection.insertBefore(groupContainer, casesSelection.firstChild);
    }

    // Register in algsGroups so selectCaseGroup() can find the cases
    if (typeof algsGroups !== "undefined") {
        algsGroups[groupName] = algsGroups[groupName] || [];
    }

    _speedGroupsCreated.add(groupName);
}

/** Updates the count shown in the speed group bar label */
function updateSpeedGroupCount(category) {
    const el = document.getElementById("speedGroupCount_" + category);
    if (!el) return;
    const groupName = SPEED_GROUP_NAMES[category];
    const count = (algsGroups[groupName] || []).length;
    el.textContent = count;

    // Also update the groupBar selected/unselected state to match selectCaseGroup expectations
    const groupBar = document.getElementById("groupBar" + groupName);
    if (!groupBar) return;
    const cases = algsGroups[groupName] || [];
    const allSel = cases.length > 0 && cases.every(c => selCases.includes(c));
    groupBar.classList.toggle("itemSel", allSel);
    groupBar.classList.toggle("itemUnsel", !allSel);
}

/**
 * Moves a case tile into the correct speed group container.
 * Removes it from its previous speed group's algsGroups entry first.
 * Does nothing if the category hasn't changed since last move.
 */
function moveCaseToSpeedGroup(caseNum) {
    const category = getCaseCategory(caseNum);
    const groupName = SPEED_GROUP_NAMES[category];

    // Nothing to do if already in the right group
    if (_caseCategoryCache[caseNum] === category) return;
    const prevCategory = _caseCategoryCache[caseNum];
    _caseCategoryCache[caseNum] = category;

    // Remove from previous speed group's algsGroups entry
    if (prevCategory !== undefined) {
        const prevGroupName = SPEED_GROUP_NAMES[prevCategory];
        if (algsGroups[prevGroupName]) {
            const idx = algsGroups[prevGroupName].indexOf(caseNum);
            if (idx !== -1) algsGroups[prevGroupName].splice(idx, 1);
        }
        updateSpeedGroupCount(prevCategory);
    }

    // Ensure the destination group exists in the DOM
    ensureSpeedGroupExists(category);

    // Add to the new group's algsGroups entry
    if (!algsGroups[groupName]) algsGroups[groupName] = [];
    if (!algsGroups[groupName].includes(caseNum)) {
        algsGroups[groupName].push(caseNum);
    }

    // Move the DOM tile element
    const tile = document.getElementById("itemTd" + caseNum);
    const destContainer = document.getElementById("casesContainer" + groupName);
    if (tile && destContainer) {
        // Unwrap from its colFlex wrapper if it has one (from makeDivNormal)
        const wrapper = tile.parentElement;
        destContainer.appendChild(tile);
        if (wrapper && wrapper !== destContainer && wrapper.children.length === 0) {
            wrapper.remove();
        }
    }

    // Update algsInformation so displayStats() shows the right group
    if (typeof algsInformation !== "undefined" && algsInformation[caseNum]) {
        algsInformation[caseNum].group = groupName;
    }

    updateSpeedGroupCount(category);

    // Remove the group container if it's now empty (except for unclassified which we keep)
    if (prevCategory !== undefined && prevCategory !== "unclassified") {
        const prevGroupName = SPEED_GROUP_NAMES[prevCategory];
        const prevContainer = document.getElementById("groupContainer" + prevGroupName);
        const prevCasesContainer = document.getElementById("casesContainer" + prevGroupName);
        if (prevContainer && prevCasesContainer && prevCasesContainer.children.length === 0) {
            prevContainer.remove();
            _speedGroupsCreated.delete(prevGroupName);
        }
    }
}

/** Re-evaluates every case that has at least one solve and moves it if needed */
function recomputeAllCategories() {
    const seen = new Set(window.timesArray.map(r => r["case"]));
    for (const caseNum of seen) {
        moveCaseToSpeedGroup(caseNum);
    }
}

// ─── Hook into existing code ──────────────────────────────────────────────────

// appendStats is defined in timer.js and called from timerStop()
// We patch it after it's defined. Make sure categorisation.js loads after timer.js.
const _cat_originalAppendStats = window.appendStats || appendStats;
const _cat_originalCheckPostRender = window.checkPostRender || checkPostRender;

window.appendStats = function () {
    _cat_originalAppendStats();
    moveCaseToSpeedGroup(window.lastCase);
};

window.checkPostRender = function () {
    _cat_originalCheckPostRender();
    recomputeAllCategories();
};
