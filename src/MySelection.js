function outputAlgs(k) {
    var s = "";
   // var indeces = algsGroups[groupname];

   /* s += " onclick='selectCaseGroup(\"" + "place holder"
        + "\")'><b>" + "place holder" + "</b></div>";
    s += "<div class='rowFlex' style='flex-wrap: wrap'>"; */  //this is the head of the group it's in
    var allSelected = false;
  //  for (var j = 0; j < indeces.length; j++) {
       // var i = indeces[j]; // case number
       // k is now i 
        var sel = (selCases.indexOf(k) != -1);
        var dblclick = isMobile() ? ` ontouchstart='touchstart(event, () => {console.log("test"); showHint(null, ${k})})' ontouchend='touchend(${k})' ` : "ondblclick='showHint(this, " + k + ")'";
        allSelected &= sel;
        s += "<div id='itemTd" + k + "' " + dblclick  + " onclick='itemClicked(" + k + ")' class='" + (sel ? "itemSel" : "itemUnsel") + " borderedContainer' title='" + algsInformation[k]["name"] + "'>" +
            `<img oncontextmenu='return false;' class='caseImage' id='sel${k}' src='${blobUrls[k]}' ></div>`;
        console.log(blobUrls);
        console.log("this is s");
        console.log(s);
   // }
    s = "<div class='colFlex' style='width: fit-content'> <div class='borderedContainer itemUnsel'" + s;
    s += "</div></div>";
    console.log("from outputAlgs");
    console.log(s);
    document.getElementById("cases_selection").innerHTML += s;
    selCases = [];
    return s;
}

function initSelection() {
    console.log("GENNING BUTTONS");

    const container = document.querySelector(".borderedContainer");

    const addGroupContainer = document.createElement('div');
    addGroupContainer.id = "addGroupContainer";
    addGroupContainer.classList = "settingsEntry";

    const createGroupName = document.createElement('input');
    createGroupName.type = 'text';
    createGroupName.id = 'createGroupName';
    addGroupContainer.appendChild(createGroupName);
    createGroupName.placeholder = "Group Name";

    const addCasesToGroup = document.createElement('button');
    addCasesToGroup.classList = "abutton";
    addCasesToGroup.innerText = "Sel";
    addCasesToGroup.id = 'actg';
    addCasesToGroup.onclick = createGroup;
    addGroupContainer.appendChild(addCasesToGroup);
//groups^        
//SETS
    const addSetContainer = document.createElement('div');
    addSetContainer.id = "addSetContainer";
    addSetContainer.classList = "settingsEntry";

    const createSetName = document.createElement('input');
    createSetName.type = 'text';
    createSetName.id = 'createSetName';
    addSetContainer.appendChild(createSetName);
    createSetName.placeholder = "Set Name";

    const addGroupsToSet = document.createElement('button');
    addGroupsToSet.classList = "abutton";
    addGroupsToSet.innerText = "Sel";
    addGroupsToSet.id = 'agts';
    addGroupsToSet.onclick = createSet;
    addSetContainer.appendChild(addGroupsToSet);

    // Insert above #cases_selection
    const casesSelection = document.getElementById("cases_selection");
    if (casesSelection && casesSelection.parentNode) {
        casesSelection.parentNode.insertBefore(addGroupContainer, casesSelection);
        casesSelection.parentNode.insertBefore(addSetContainer, casesSelection);
    } else {
        console.warn("#cases_selection not found, appending to container instead.");
        container.appendChild(addGroupContainer);
    }

    const setSelectorContainer = document.createElement('div');
    setSelectorContainer.id = "setSelectorContainer";
    setSelectorContainer.className = "rowFlex setSel";
    casesSelection.parentNode.insertBefore(setSelectorContainer, casesSelection);

    const allSelContainer = document.createElement('div');
    allSelContainer.id = "allSelContainer";
    allSelContainer.className = "rowFlex";
    casesSelection.parentNode.insertBefore(allSelContainer, setSelectorContainer);
    const allSel = document.createElement('div');
    allSel.id = "allSel";
    allSel.className = "borderedContainer pad itemUnsel allSel";
    allSel.innerHTML = "<b>" + "All" + " (<span id='allSelDisplay'>0</span>/" + customNumCases + ")</b>";
    allSel.onclick = () => selectAllCases();
    allSelContainer.appendChild(allSel);

    const downloadButton = document.createElement('button');
    downloadButton.id = "dlbtn";
    downloadButton.textContent = "Download sheet"
    downloadButton.onclick = () => exportXLSX();
    document.getElementById("progress").parentElement.appendChild(downloadButton);

    const fileNameBox = document.createElement('input');
    fileNameBox.id = "fileNameEntry";
    fileNameBox.placeholder = "File Name";
    document.getElementById("progress").parentElement.appendChild(fileNameBox);

    const allDeleteButton = document.createElement('button');
    allDeleteButton.id = "deleteAllBtn";
    allDeleteButton.textContent = "Delete All Cases";
    allDeleteButton.onclick = () => {
        if (confirm("Are you sure you want to delete all cases? This cannot be undone.")) {
            document.getElementById("cases_selection").innerHTML = "";
            selCases = [];
            algsGroups = {};
            algsets = {};
            selectedAlgSets = {};
            customNumCases = 0;
            document.getElementById("csvUploader").value = ""; // Clear the file input
            document.getElementById("fileNameEntry").value = "";
            document.getElementById("progress").textContent = "Progress: ";
            document.getElementById("allSelContainer").remove();
            document.getElementById("addGroupContainer").remove();
            document.getElementById("addSetContainer").remove();
            document.getElementById("setSelectorContainer").remove();            
            document.querySelector(".input-box").remove(); // Remove the file input box
            main();
        }
    };
    document.getElementById("progress").parentElement.appendChild(allDeleteButton);

    const saveButton = document.createElement('button');
    saveButton.id = "saveBtn";
    saveButton.textContent = "Save";
    saveButton.onclick = () => {
        save();
        alert("Selection saved successfully!");
    };
    document.getElementById("progress").parentElement.appendChild(saveButton);
    return;
}


function createGroup(preGroupName = null){
    console.log("creating groups");
    let customGroupName = "";
    if (quickGenBool) {customGroupName = preGroupName} else {customGroupName = document.getElementById("createGroupName").value};
    if (!customGroupName) {return};

    let selCasesArr = []; //these are the cases that are selected

    const groupContainer = document.createElement("div"); //contains group bar and cases;
    groupContainer.className = "groupContainer";
    groupContainer.id = "groupContainer" + customGroupName;
    document.getElementById("cases_selection").appendChild(groupContainer);

    let groupBar = document.createElement('div'); //creates group bar
    let deleteGroupIcon = document.createElement('span');
    deleteGroupIcon.className = "material-symbols-outlined deleteButton"
    deleteGroupIcon.innerHTML = "delete";
    deleteGroupIcon.onclick = (e) => { // prevent triggering groupBar onclick
        e.stopPropagation(); 
        deleteGroup(customGroupName);
    };
    groupBar.className = "borderedContainer itemUnsel pad groupNameDiv groupBar";
    groupBar.onclick = () => selectCaseGroup(customGroupName);

    groupBar.id = "groupBar" + customGroupName;
    groupBar.innerText = customGroupName;
    groupContainer.appendChild(groupBar);
    groupBar.appendChild(deleteGroupIcon);

    let casesContainer = document.createElement('div');
    casesContainer.id = "casesContainer";
    casesContainer.classList = "rowFlex";
    groupContainer.appendChild(casesContainer);

    if (!quickGenBool) {
        console.log("YESSSSSS I SHOULD BE HERE");
        for (i = 1; i <= Object.keys(algsInformation).length; i++){
            let caseToCheck = document.getElementById("itemTd" + i);
            if (caseToCheck.classList.contains("itemSel")){ //gets cases

                caseToCheck.className = 'borderedContainer itemUnsel pad'; //unselect after adding to group
                var index = selCases.indexOf(i);
                selCases.splice(index, 1);

                let caseElement = document.getElementById("itemTd" + i); //the case itself
                let wrapper = caseElement.parentElement; //this gives the weird spacing issue
                caseElement.classList.remove("pad");
                casesContainer.appendChild(caseElement); 
                
                selCasesArr.push(i);
                algsGroups[customGroupName] = selCasesArr; //enter into algsGroups
                algsInformation[i].group = customGroupName; //enter into algsinfo

                wrapper.remove();

                //itemClicked(i); //to make sure it's not buggy
            }
        }
    } else {
        for (let selectedCase of algsGroups[preGroupName]) {
            let caseToCheck = document.getElementById("itemTd" + selectedCase);
            let wrapper = caseToCheck.parentElement; //this gives the weird spacing issue
            caseToCheck.classList.remove("pad");
            casesContainer.appendChild(caseToCheck); 

            wrapper.remove();
        }
    }
    createGroupName.value = "";
    return;
}

function createSet(preSetName = null){
    let customSetName = ""
    if (quickGenBool) {customSetName = preSetName} else {customSetName = createSetName.value};
    let selGroupsArr = [];
    let setAlgCount = 0;

    const setContainer = document.createElement('div');
    setContainer.className = "setContainer";
    setContainer.id = "setContainer" + customSetName;
    document.getElementById("cases_selection").appendChild(setContainer);

    const setBar = document.createElement('div');
    setBar.className = "borderedContainer pad setBar";
    setBar.id = "setBar" + customSetName;
    setBar.innerText = customSetName;
    let deleteSetIcon = document.createElement('span');
    deleteSetIcon.className = "material-symbols-outlined deleteButton"
    deleteSetIcon.innerHTML = "delete";
    deleteSetIcon.onclick = (e) => {
        e.stopPropagation(); 
        deleteSet(customSetName);
    };
    setBar.appendChild(deleteSetIcon);
    setContainer.appendChild(setBar);

    if (!quickGenBool) {    
        console.log("YESSSSSS I SHOULD BE HERE");
        for (i = 1; i <= Object.keys(algsGroups).length; i++) {
            let groupBarEl = document.getElementById("groupBar" + Object.keys(algsGroups)[i - 1]);
            if (groupBarEl.classList.contains("itemSel")){
                let selectedGroupName = Object.keys(algsGroups)[i - 1];
                selGroupsArr.push(selectedGroupName); //preparing the algsets for algsets object

                groupBarEl.className = "borderedContainer itemUnsel pad groupNameDiv groupBar" //to unselect bar

                let selectedGroupContainerId = "groupContainer" + selectedGroupName;
                setContainer.appendChild(document.getElementById(selectedGroupContainerId));

                for (selectedCase of algsGroups[selectedGroupName]) {
                    let selectedEl = document.getElementById("itemTd" + selectedCase);
                    if(selectedEl.classList.contains("itemSel")){
                        selectedEl.classList.remove("itemSel");
                        selectedEl.classList.add("itemUnsel"); //unselect individual cases after moving
                    }
                    algsInformation[selectedCase]["algset"] = customSetName;
                }

                for (j = 1; j <= algsGroups[selectedGroupName].length; j++){
                    let CaseNumber = algsGroups[selectedGroupName][j];
                    var index = selCases.indexOf(CaseNumber);
                    selCases.splice(index, 1);
                    setAlgCount++;
                } //removes cases after selecting

                algsets[customSetName] = selGroupsArr;
                selectedAlgSets[customSetName] = false;
            }
        }
    } else {
        for (let currentGroup of algsets[customSetName]) {
            let selectedGroupContainerId = "groupContainer" + currentGroup;
            setContainer.appendChild(document.getElementById(selectedGroupContainerId));

            for (j = 1; j <= algsGroups[currentGroup].length; j++){
                    setAlgCount++;
                } //removes cases after selecting
        }
        selectedAlgSets[customSetName] = false;
    }
    let selectSet = document.createElement('div');
    selectSet.id = customSetName + "selector";
    selectSet.className = "borderedContainer itemUnsel pad";
    selectSet.onclick = () => selectAlgset(customSetName, setAlgCount);
    selectSet.innerHTML = "<b>" + customSetName + " (<span id='" + customSetName + "csi'>0</span>/" + setAlgCount + ")</b>"; // so this should look like "NS2 (0/131)"
    document.getElementById("setSelectorContainer").appendChild(selectSet);
    createSetName.value = "";
    return;
}

function deleteGroup(groupName){ //as the name suggests it removes the group bar and cases
    if(confirm("Are you sure you want to remove this group?")){
        let groupContainerToDelete = document.getElementById("groupContainer" + groupName);

        for (let caseNumber of algsGroups[groupName]) { //put cases back into unsorted area
            let caseElement = document.getElementById("itemTd" + caseNumber);
            console.log(caseElement.className);
            caseElement.className = "itemUnsel borderedContainer";
            console.log(caseElement.className);
            let wrapper = document.createElement("div");
            wrapper.className = "colFlex"; 
            wrapper.style.width = "fit-content";
            wrapper.appendChild(caseElement); //put it back cuz I'm dumb

            console.log("in for loop");
            let firstElement = document.getElementById("cases_selection").firstChild;
            console.log("this is wrapper");
            console.log(wrapper);
            document.getElementById("cases_selection").insertBefore(wrapper, firstElement);

            for (j = 1; j <= algsGroups[groupName].length; j++){
                    let CaseNumberFor = algsGroups[groupName][j];
                    var index = selCases.indexOf(CaseNumberFor);
                    selCases.splice(index, 1);
                } //removes cases after selecting
        }

        groupContainerToDelete.remove();
    }
}

function deleteSet (setName){
    if(confirm("Are you sure you want to remove this set?")){
        let setBarToDelete = document.getElementById("setBar" + setName);
        let containerToDelete = document.getElementById("setContainer" + setName);
        let setSelectorToDelete = document.getElementById(setName + "selector");

        let childrenArr = Array.from(containerToDelete.children);
        for (let containedGroup of childrenArr){
            console.log("checking " + containedGroup);
            if (containedGroup !== setBarToDelete) {//avoids the problem of moving setBar too
                console.log("deleting " + containedGroup);
                document.getElementById("cases_selection").appendChild(containedGroup);
            }
        }
        setSelectorToDelete.remove()
        setBarToDelete.remove();
        containerToDelete.remove();
    }
}

function selectAlgset(algset, algCount) {
    let setSelButton = document.getElementById(algset + "selector");
    if (setSelButton.classList.contains("itemSel")) {
        setSelButton.classList.remove("itemSel");
        setSelButton.classList.add("itemUnsel"); //unselect
        setSelButton.querySelector("span").textContent = "0";

        for (let group of algsets[algset]) {
            let groupBar = document.getElementById("groupBar" + group);
            if (groupBar.classList.contains("itemSel")) {
                groupBar.click();
            }
        } //selects cases and shows them
    } else {
        setSelButton.classList.remove("itemUnsel");
        setSelButton.classList.add("itemSel"); //select
        setSelButton.querySelector("span").textContent = algCount;

        for (let group of algsets[algset]) {
            let groupBar = document.getElementById("groupBar" + group);
            if (groupBar.classList.contains("itemUnsel")) {
                groupBar.click();
            }
        } //selects cases and shows them
    }
    var algsetIds = getAlgsetIds(algset);
    var selectedCount = 0;
    for (const idx of algsetIds) {
        selectedCount += selCases.includes(idx);
    }
    var allSelected = selectedCount == algsetIds.length;
    selectedAlgSets[algset] = selectedCount != 0 | !selectedAlgSets[algset];
    saveSelection();
    
    
}

function selectAllCases() {
    let allSel = document.getElementById("allSel");
    if (allSel.classList.contains("itemUnsel")) {
        allSel.classList.remove("itemUnsel");
        allSel.classList.add("itemSel"); //select

        allSel.innerHTML = "<b>" + "All" + " (<span id='allSelDisplay'>" + customNumCases + "</span>/" + customNumCases + ")</b>";

        for (let CASE of Object.keys(algsInformation)) { //clicks elements
            let caseEl = document.getElementById("itemTd" + CASE);
            if (caseEl.classList.contains("itemUnsel")) {
                caseEl.click();
            }
        }
        for (let groupNAME of Object.keys(algsGroups)) { //clicks group
            let groupEl = document.getElementById("groupBar" + groupNAME);
            if (groupEl.classList.contains("itemUnsel")) {
                groupEl.click();
            }
        }
        for (let setNAME of Object.keys(algsets)) { //clicks sets
            let setEl = document.getElementById(setNAME + "selector");
            if (setEl.classList.contains("itemUnsel")) {
                setEl.click();
            }
        }
    } else {
        allSel.classList.remove("itemSel");
        allSel.classList.add("itemUnsel"); //unselect
        allSel.innerHTML = "<b>" + "All" + " (<span id='allSelDisplay'>0</span>/" + customNumCases + ")</b>";

        for (let CASE of Object.keys(algsInformation)) { //clicks elements
            let caseEl = document.getElementById("itemTd" + CASE);
            if (!caseEl.classList.contains("itemUnsel")) {
                caseEl.click();
            }
        }
        for (let groupNAME of Object.keys(algsGroups)) { //clicks group
            let groupEl = document.getElementById("groupBar" + groupNAME);
            if (!groupEl.classList.contains("itemUnsel")) {
                groupEl.click();
            }
        }
        for (let setNAME of Object.keys(algsets)) { //clicks sets
            let setEl = document.getElementById(setNAME + "selector");
            if (!setEl.classList.contains("itemUnsel")) {
                setEl.click();
            }
        }
    }
}

async function exportXLSX() {
    console.log("genning export");
    const workbook = new ExcelJS.Workbook();
    let fileName = document.getElementById("fileNameEntry").value;
    for (let set of Object.keys(algsets)){
        console.log("exporting set: " + set)
        groupCount = 0;
        const setSheet = workbook.addWorksheet(set);
        for (let group of (algsets[set])) {
            let caseCount = 2; //so it starts on column 2, 1 is group name
            setSheet.getCell(groupCount * 7 + 1, 1).value = group;
            setSheet.getCell(groupCount * 7 + 1, 1).font = { //make group name bigger
                name: 'Arial',      // font family
                size: 16,           // font size in points
                bold: true         // optional
            };
            setSheet.getColumn(1).width = 10;
            for (let caseID of algsGroups[group]) {
                let caseImage = document.getElementById("itemTd" + caseID).getElementsByTagName('img')[0].src;
                let caseName = algsInformation[caseID].name;
                let caseAlg = algsInformation[caseID].a[0];

                setSheet.getCell(groupCount * 7 + 2, caseCount).value = caseName;
                setSheet.getCell(groupCount * 7 + 3, caseCount).value = caseAlg;

                const response = await fetch(caseImage);
                const blob = await response.blob();

                // Convert SVG blob → string → PNG base64
                const svgString = await blob.text();
                const base64 = await svgToPngBase64(svgString, 156, 93.675);

                const imageId = workbook.addImage({
                    base64: base64,
                    extension: 'png',
                });

                setSheet.getColumn(caseCount).width = 25;
                setSheet.getRow(groupCount * 7 + 1).height = 90;

                setSheet.addImage(imageId, {
                    tl: { col: caseCount - 1, row: groupCount * 7 },
                    ext: { width: 156, height: 93.675},
                });

                caseCount++;
            }
            groupCount++;
        }
    }

    //const sheet = workbook.addWorksheet("Sheet1");

/*
    // 2) Write "hello world" to A1 (row 1, col 1)
    sheet.getCell(1, 1).value = "hello world";

    // Sheet 2
    const sheet2 = workbook.addWorksheet("Sheet2");
    sheet2.getCell(1, 1).value = "This is Sheet 2";
*/
    // 3) Generate bytes and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = URL.createObjectURL(blob); //does something lol
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName + ".xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

async function svgToPngBase64(svgString, width = 156, height = 93.675) {
  return new Promise((resolve, reject) => {
    // 1. Create an Image object
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // 2. Draw onto a canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // 3. Convert to base64 PNG
      const pngBase64 = canvas.toDataURL('image/png');
      URL.revokeObjectURL(url);
      resolve(pngBase64);
    };

    img.onerror = reject;
    img.src = url;
  });
}

function save () {
    var csv = "name, a, algset, group\n";
    Object.keys(algsInformation).forEach((num) => {  
        csv += algsInformation[num].name + ", " + algsInformation[num].a.join(" ") + ", " + algsInformation[num].algset + ", " + algsInformation[num].group + "\n";
    });  

    console.log(csv);

    var blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "selection.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
    console.log("Selection saved successfully!");

    algsInformation;
}