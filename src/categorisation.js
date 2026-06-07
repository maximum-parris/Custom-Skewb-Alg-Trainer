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

const _speedGroupsCreated = new Set();
const _caseCategoryCache = {};

function getCaseTrueAvgMs(caseNum) {
    const solves = window.timesArray.filter(r => r["case"] === caseNum);
    if (solves.length === 0) return null;
    return solves.reduce((sum, r) => sum + r["ms"], 0) / solves.length / 10;
}

function getCaseCategory(caseNum) {
    const avgMs = getCaseTrueAvgMs(caseNum);
    if (avgMs === null) return "unclassified";
    if (avgMs < SPEED_THRESHOLDS.fast)   return "fast";
    if (avgMs < SPEED_THRESHOLDS.medium) return "medium";
    return "slow";
}

function ensureSpeedGroupExists(category) {
    const groupName = SPEED_GROUP_NAMES[category];
    if (_speedGroupsCreated.has(groupName)) return;

    const casesSelection = document.getElementById("cases_selection");
    if (!casesSelection) return;

    const groupContainer = document.createElement("div");
    groupContainer.className = "groupContainer";
    groupContainer.id = "groupContainer" + groupName;

    const groupBar = document.createElement("div");
    groupBar.className = "borderedContainer itemUnsel pad groupNameDiv groupBar";
    groupBar.id = "groupBar" + groupName;
    groupBar.style.backgroundColor = SPEED_GROUP_COLORS[category];
    groupBar.style.color = "white";
    groupBar.style.borderColor = SPEED_GROUP_COLORS[category];
    groupBar.innerHTML = `<b>${groupName} (<span id="speedGroupCount_${category}">0</span> cases)</b>`;

    // Inline selection handler — avoids calling selectCaseGroup from selection.js
    // which expects a different DOM structure
    (function(gName, gBar) {
        gBar.onclick = function() {
            const cases = algsGroups[gName] || [];
            const allSelected = cases.length > 0 && cases.every(c => selCases.includes(c));
            cases.forEach(c => {
                const tile = document.getElementById("itemTd" + c);
                const j = selCases.indexOf(c);
                if (allSelected && j !== -1) {
                    selCases.splice(j, 1);
                    if (tile) tile.className = "itemUnsel borderedContainer";
                } else if (!allSelected && j === -1) {
                    selCases.push(c);
                    if (tile) tile.className = "itemSel borderedContainer";
                }
            });
            gBar.classList.toggle("itemSel", !allSelected);
            gBar.classList.toggle("itemUnsel", allSelected);
            saveSelection();
        };
    })(groupName, groupBar);

    const casesContainer = document.createElement("div");
    casesContainer.id = "casesContainer" + groupName;
    casesContainer.className = "rowFlex";
    casesContainer.style.flexWrap = "wrap";

    groupContainer.appendChild(groupBar);
    groupContainer.appendChild(casesContainer);

    // Insert in order: fast, medium, slow, unclassified — at top of cases_selection
    const order = ["fast", "medium", "slow", "unclassified"];
    const myOrder = order.indexOf(category);
    let insertBefore = null;
    for (let i = myOrder + 1; i < order.length; i++) {
        const laterEl = document.getElementById("groupContainer" + SPEED_GROUP_NAMES[order[i]]);
        if (laterEl) { insertBefore = laterEl; break; }
    }
    if (insertBefore) {
        casesSelection.insertBefore(groupContainer, insertBefore);
    } else {
        casesSelection.insertBefore(groupContainer, casesSelection.firstChild);
    }

    if (typeof algsGroups !== "undefined") {
        algsGroups[groupName] = algsGroups[groupName] || [];
    }

    _speedGroupsCreated.add(groupName);
}

function updateSpeedGroupCount(category) {
    const el = document.getElementById("speedGroupCount_" + category);
    if (!el) return;
    const groupName = SPEED_GROUP_NAMES[category];
    el.textContent = (algsGroups[groupName] || []).length;
}

function moveCaseToSpeedGroup(caseNum) {
    const category = getCaseCategory(caseNum);
    const groupName = SPEED_GROUP_NAMES[category];

    if (_caseCategoryCache[caseNum] === category) return;
    const prevCategory = _caseCategoryCache[caseNum];
    _caseCategoryCache[caseNum] = category;

    // Remove from previous speed group
    if (prevCategory !== undefined) {
        const prevGroupName = SPEED_GROUP_NAMES[prevCategory];
        if (algsGroups[prevGroupName]) {
            const idx = algsGroups[prevGroupName].indexOf(caseNum);
            if (idx !== -1) algsGroups[prevGroupName].splice(idx, 1);
        }
        updateSpeedGroupCount(prevCategory);
    }

    ensureSpeedGroupExists(category);

    if (!algsGroups[groupName]) algsGroups[groupName] = [];
    if (!algsGroups[groupName].includes(caseNum)) {
        algsGroups[groupName].push(caseNum);
    }

    // Move the tile into the speed group container
    const tile = document.getElementById("itemTd" + caseNum);
    const destContainer = document.getElementById("casesContainer" + groupName);
    if (tile && destContainer) {
        const wrapper = tile.parentElement;
        destContainer.appendChild(tile);
        if (wrapper && wrapper !== destContainer && wrapper.children.length === 0) {
            wrapper.remove();
        }
    }

    if (typeof algsInformation !== "undefined" && algsInformation[caseNum]) {
        algsInformation[caseNum].group = groupName;
    }

    updateSpeedGroupCount(category);
}

function recomputeAllCategories() {
    const seen = new Set(window.timesArray.map(r => r["case"]));
    for (const caseNum of seen) {
        moveCaseToSpeedGroup(caseNum);
    }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

const _cat_originalAppendStats = window.appendStats || appendStats;
window.appendStats = function() {
    _cat_originalAppendStats();
    moveCaseToSpeedGroup(window.lastCase);
};

const _cat_originalCheckPostRender = window.checkPostRender || checkPostRender;
window.checkPostRender = function() {
    _cat_originalCheckPostRender();
    recomputeAllCategories();
};
