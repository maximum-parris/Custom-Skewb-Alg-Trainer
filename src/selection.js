var selCases = [];
var selectionPresets = {
    "Default": {
        "selCases": [],
        "selectedAlgSets": {}
    }
}
Object.assign(selectionPresets['Default']['selCases'], selCases);
Object.assign(selectionPresets['Default']['selectedAlgSets'], selectedAlgSets);
function getAlgsetIds(algset) {
    var algsetIds = []
    for (const group of algsets[algset]) {
        algsetIds = algsetIds.concat(algsGroups[group]);
    }
    return algsetIds;
}

//HERE IS ANOTHER TIMING ISSUE
function getAllValidGroups() {
    if (algsets){ //to only run after creating algsets
        var valid = [];
        for (const [algset, groups] of Object.entries(algsets)) {
            if (selectedAlgSets[algset]) {
                valid = valid.concat(groups);
            }
        }
        return valid;
    }
}
//THIS ONE TOO
function getAllValid() {
    if (algsGroups){
        var valid = [];
        var validGroups = getAllValidGroups();
        for (const group of validGroups) {
            valid = valid.concat(algsGroups[group]);
        }
        return valid;
    }
}

function countAlgsetSelected(algset) {
    var algsetIds = getAlgsetIds(algset);
    var selectedCount = 0;
    for (const idx of algsetIds) {
        selectedCount += selCases.includes(idx);
    }
    return selectedCount;
}

function isAlgsetAllSelected(algset) {
    var algsetIds = getAlgsetIds(algset);
    var selectedCount = 0;
    for (const idx of algsetIds) {
        selectedCount += selCases.includes(idx);
    }
    var allSelected = selectedCount == algsetIds.length;
    return allSelected;
}

/*
    THIS PART IS BEING MODIFIED
*/
function updateTitle() {
    var algs = getAllValid().length;
    var allSelector = document.getElementById('allSelector');
    if (selCases.length == algs) {
        //allSelector.className = 'borderedContainer itemSel pad';
        allSelector.classList.remove("itemUnsel");
        allSelector.classList.add("itemSel");
    } else {
        //allSelector.className = 'borderedContainer itemUnsel pad';
        allSelector.classList.remove("itemSel");
        allSelector.classList.add("itemUnsel");
    }
    for (const [algset, isShown] of Object.entries(selectedAlgSets)) {
        if (isShown && Object.keys(selectedAlgSets).length > 1) {
            document.getElementById(`${algset}Selector`).className = `borderedContainer ${isAlgsetAllSelected(algset) ? "itemSel" : "itemUnsel"} pad`
            document.getElementById(`${algset}csi`).innerText = countAlgsetSelected(algset);
        }
    }
    document.getElementById("csi").innerHTML = selCases.length;
}

function itemClicked(i) {
    if (window.scramblesMap[i] == null) {
        console.error("is null");
        return;
    }

    var index = selCases.indexOf(i);
    var wasSelected = (index != -1);
    if (wasSelected)
        selCases.splice(index, 1);
    else
        selCases.push(i);
    var element = document.getElementById("itemTd" + i);
    element.className = (wasSelected ? "itemUnsel" : "itemSel") + " borderedContainer";
    //var groupElement = element.parentElement.previousElementSibling;
    /* console.log("this is groupElement");
    console.log(groupElement);
    //var groupWasSelected = groupElement.classList[1] == 'itemSel';
    var groupWasSelected = groupElement.classList.contains('itemSel'); //probabaly safer
    if (groupWasSelected && wasSelected) {
        groupElement.className = 'borderedContainer itemUnsel pad groupNameDiv';
    }
    if (!groupWasSelected && !wasSelected) {
        var groupElements = element.parentElement.childNodes;
        var selectedCount = 0;
        for (var i = 0; i < groupElements.length; i++) {
            selectedCount += groupElements[i].classList.contains('itemSel');
        }
        if (selectedCount == groupElements.length) {
            groupElement.className = 'borderedContainer itemSel pad groupNameDiv';
        }
    } */
    if (document.getElementById("groupBar" + algsInformation[i]["group"])) {
        var groupElement = document.getElementById("groupBar" + algsInformation[i]["group"]);
        //var groupWasSelected = groupElement.classList[1] == 'itemSel';
        var groupWasSelected = groupElement.classList.contains('itemSel'); //probabaly safer
        if (groupWasSelected && wasSelected) {
        // groupElement.className = 'borderedContainer itemUnsel pad groupNameDiv';
            groupElement.classList.remove("itemSel");
            groupElement.classList.add("itemUnsel");
        }
        if (!groupWasSelected && !wasSelected) {
            var groupElements = element.parentElement.childNodes;
            var selectedCount = 0;
            for (var i = 0; i < groupElements.length; i++) {
                selectedCount += groupElements[i].classList.contains('itemSel');
            }
            if (selectedCount == groupElements.length) {
                //groupElement.className = 'borderedContainer itemSel pad groupNameDiv';
                groupElement.classList.remove("itemUnsel");
                groupElement.classList.add("itemSel");
            }
        }
    }
    saveSelection();
   // updateTitle();
}

//end of issues

function selectAllNone() {
    var validAlgs = getAllValid();
    var algs = validAlgs.length;
    var allSelected = selCases.length == algs;
    if (!allSelected) {
        selCases = [];
        for (const i of validAlgs)
            selCases.push(i);
    } else {
        selCases = [];
    }
    //renderSelection();
    saveSelection();
    resize();
}

/// \returns true if at least one case selected in group groupName
function areAllSelected(groupName) {
    var indeces = algsGroups[groupName];
    for (var i in indeces) {
        if (selCases.indexOf(indeces[i]) == -1)
            return false;
    }
    return true;
}

// select or deselect all cases in the group
function selectCaseGroup(name) {
    var allSelected = areAllSelected(name);
    var indeces = algsGroups[name];
    var firstChild = document.getElementById(`itemTd${indeces[0]}`);
    var elements = firstChild.parentElement.childNodes;
    var groupNameDiv = firstChild.parentElement.previousSibling;
    for (var i = 0; i < indeces.length; i++) {
        var j = selCases.indexOf(indeces[i]);
        if (allSelected && j != -1) { // need to delete
            selCases.splice(j, 1);
            elements[i].className = 'itemUnsel borderedContainer';
        }
        if (!allSelected && j == -1) { // need to add
            selCases.push(indeces[i]);
            elements[i].className = 'itemSel borderedContainer';
        }
    }
    if (allSelected) {
        //groupNameDiv.className = 'borderedContainer itemUnsel pad groupNameDiv';
        groupNameDiv.classList.remove("itemSel");
        groupNameDiv.classList.add("itemUnsel");
    } else {
        //groupNameDiv.className = 'borderedContainer itemSel pad groupNameDiv'
        groupNameDiv.classList.remove("itemUnsel");
        groupNameDiv.classList.add("itemSel");
    }
    saveSelection();
    //updateTitle();
}

var touchholdtimer;
var touchduration = 1000; //length of time we want the user to touch before we do something

function touchstart(e, func) {
    // e.preventDefault();
    if (!touchholdtimer) {
        touchholdtimer = setTimeout(func, touchduration);
    }
}

function touchend(i) {
    //stops short touches from firing the event
    if (touchholdtimer) {
        clearTimeout(touchholdtimer);
        // itemClicked(i);
        touchholdtimer = null;
    }
}

function makeDivNormal(groupname) {
    var s = "";
    var indeces = algsGroups[groupname];

    s += " onclick='selectCaseGroup(\"" + groupname
        + "\")'><b>" + groupname + "</b></div>";
    s += "<div class='rowFlex' style='flex-wrap: wrap'>";
    var allSelected = true;
    for (var j = 0; j < indeces.length; j++) {
        var i = indeces[j]; // case number
        var sel = (selCases.indexOf(i) != -1);
        var dblclick = isMobile() ? ` ontouchstart='touchstart(event, () => {console.log("test"); showHint(null, ${i})})' ontouchend='touchend(${i})' ` : "ondblclick='showHint(this, " + i + ")'";
        allSelected &= sel;
        s += "<div id='itemTd" + i + "' " + dblclick  + " onclick='itemClicked(" + i + ")' class='" + (sel ? "itemSel" : "itemUnsel") + " borderedContainer' title='" + algsInformation[i]["name"] + "'>" +
            `<img oncontextmenu='return false;' class='caseImage' id='sel${i}' src='${blobUrls[i]}' ></div>`;
       /* console.log(blobUrls);
        console.log("this is s");
        console.log(s); */
    }
    s = "<div class='colFlex' style='width: fit-content'> <div class='borderedContainer " + (allSelected ? "itemSel" : "itemUnsel") + " pad groupNameDiv'" + s;
    s += "</div></div>";
    return s;
}

function ensureSelectionMatchesShown() {
    var algs = getAllValid();
    var newSelected = selCases.filter((value) => { return algs.includes(value); })
    selCases = newSelected;
}



/* function selectAlgset(algset) {
    var algsetIds = getAlgsetIds(algset);

    var selectedCount = 0;
    for (const idx of algsetIds) {
        selectedCount += selCases.includes(idx);
    }
    var allSelected = selectedCount == algsetIds.length;
    for (const i of algsetIds) {
        var j = selCases.indexOf(i);
        if (allSelected && j != -1) { // need to delete
            selCases.splice(j, 1);
        }
        if (!allSelected && j == -1) { // need to add
            selCases.push(i);
        }
    }
    selectedAlgSets[algset] = selectedCount != 0 | !selectedAlgSets[algset];
    //renderSelection();
    saveSelection();
    //resize();
} */

function makeAlgsetTitle(algset, enabled) {
    // var width = Math.max((95 / Object.keys(algsets).length), 20) + "%";
    return `<div id='${algset}Selector' class='borderedContainer\
     ${(enabled ? "itemSel" : "itemUnsel")} pad' 
     style='width: 7em; opacity: ${enabled ? 1.0 : 0.5}' 
     onclick='selectAlgset("${algset}")'><b>${algset} 
     (<span id='${algset}csi'>${enabled ? "0" : "-"}</span>/${getAlgsetIds(algset).length})</b></div>`;
}

function addPreset(name_) {
    var name = name_;
    if (name_ === null) {
        name = document.getElementById('newPresetInput').value;
    }
    if (name === '') {
        alert('Your preset must have a name.')
        return;
    }
    if (selectionPresets[name] != null) {
        addPreset(name + '1');
        return;
    }
    selectionPresets[name] = {
        'selCases': [],
        'selectedAlgSets': {}
    };
    Object.assign(selectionPresets[name]['selCases'], selCases);
    Object.assign(selectionPresets[name]['selectedAlgSets'], selectedAlgSets);
    localStorage.setItem(selectionArrayKey + 'Presets', JSON.stringify(selectionPresets));
    renderPresets();
}

function updatePreset(name) {
    selectionPresets[name] = {
        'selCases': [],
        'selectedAlgSets': {}
    };
    Object.assign(selectionPresets[name]['selCases'], selCases);
    Object.assign(selectionPresets[name]['selectedAlgSets'], selectedAlgSets);
    localStorage.setItem(selectionArrayKey + 'Presets', JSON.stringify(selectionPresets));
}

function deletePreset(name) {
    delete selectionPresets[name];
    localStorage.setItem(selectionArrayKey + 'Presets', JSON.stringify(selectionPresets));
    renderPresets();
}

function usePreset(name) {
    selCases = [...selectionPresets[name]['selCases']];
    Object.assign(selectedAlgSets, selectionPresets[name]['selectedAlgSets']);
    //renderSelection();
}


function renderPresets() {
    var previousText = '';
    try {
        previousText = document.getElementById('newPresetInput').value;
    } catch(e) {}
    var s = "";
    for (const [name, preset] of Object.entries(selectionPresets)) {
        s += `<div class='settingsEntry'><span>${name}</span><div class='plusMinus'>\
        <span onclick='deletePreset("${name}")' class='abutton'>Del</span>\
        <span onclick='updatePreset("${name}")' class='abutton'>Set</span>\
        <span onclick='usePreset("${name}")' class='abutton'>Use</span></span></div></div>`;
    }
    s += `<div class='settingsEntry'><input type='text' id='newPresetInput' value='${previousText}' style='width: 100%' placeholder='New Preset'/><span class='abutton' onclick='addPreset(null)'>Add</span></div>`;
    document.getElementById('presetsSettings').innerHTML = s;
}


/// iterates the scramblesMap and highlights HTML elements according to the selection
function renderSelection() {
    var groups = getAllValidGroups();
    var algs = getAllValid().length;
    var s = "";
    s += `<div id='allSelector' class='borderedContainer  ${(selCases.length == algs ? "itemSel" : "itemUnsel")} pad' onclick='selectAllNone()'><b>All Cases (<span id='csi'></span>/${algs})</b></div>`;
    if (Object.keys(selectedAlgSets).length > 1) {
        s += "<div class='rowFlex' style='flex-wrap: wrap;'>"
        for (const [algset, isShown] of Object.entries(selectedAlgSets)) {
            s += makeAlgsetTitle(algset, isShown);
        }
        s += "</div>"
    }

    for (const [algset, isShown] of Object.entries(selectedAlgSets)) {
        if (isShown) {
            if (Object.keys(selectedAlgSets).length > 1) {
                s += `<div class="borderedContainer pad" style='background-color: var(--backgroundDarker); color: var(--text);'><b>${algset}</b></div>`
            }
            for (const key of algsets[algset]) {
                s += makeDivNormal(key)
            }
        }
    }

    document.getElementById("cases_selection").innerHTML = s;
    ensureSelectionMatchesShown();
    //updateTitle();
    //renderPresets();
}


function saveSelection() {
    localStorage.setItem(selectionArrayKey, JSON.stringify(selCases));
    //localStorage.setItem(selectionArrayKey + "AlgSets", JSON.stringify(selectedAlgSets));
}

function loadSelection() {
    var cases = loadLocal(selectionArrayKey);
    if (cases != null)
        selCases = JSON.parse(cases);
    var loadedAlgSets = loadLocal(selectionArrayKey + "AlgSets");
    if (loadedAlgSets != null) 
        selectedAlgSets = JSON.parse(loadedAlgSets);
    var preset = localStorage.getItem(selectionArrayKey + 'Presets')
    if (preset != null) {
        selectionPresets = JSON.parse(preset);
    }
}
