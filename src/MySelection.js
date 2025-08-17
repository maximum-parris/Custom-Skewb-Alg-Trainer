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
    if (!container) {
        console.error("No container found for .borderedContainer");
        return;
    }

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
    return;
}


function createGroup(){
    console.log("creating groups");
    let customGroupName = document.getElementById("createGroupName").value;
    if (!customGroupName) {return};
    console.log(algsInformation);

    let selCasesArr = []; //these are the cases that are selected

    const groupContainer = document.createElement("div"); //contains group bar and cases;
    groupContainer.className = "groupContainer";
    groupContainer.id = "groupContainer" + customGroupName;
   // document.getElementById("cases_selection").appendChild(groupContainer);
    document.getElementById("cases_selection").appendChild(groupContainer);

    let groupBar = document.createElement('div'); //creates group bar
    groupBar.className = "borderedContainer itemUnsel pad groupNameDiv groupBar";
    groupBar.onclick = () => selectCaseGroup(customGroupName);

    groupBar.id = "groupBar" + customGroupName;
    groupBar.innerText = customGroupName;
    groupContainer.appendChild(groupBar);

    let casesContainer = document.createElement('div');
    casesContainer.id = "casesContainer";
    casesContainer.classList = "rowFlex";
    groupContainer.appendChild(casesContainer);
    
    for (i = 1; i <= Object.keys(algsInformation).length; i++){
        console.log("getting case: " + i);
        console.log(customGroupName);
        let caseToCheck = document.getElementById("itemTd" + i);
        if (caseToCheck.classList.contains("itemSel")){ //gets cases

            caseToCheck.className = 'borderedContainer itemUnsel pad'; //unselect after adding to group
            var index = selCases.indexOf(i);
            selCases.splice(index, 1);

            console.log("case: " + i + " is selected");

            let caseElement = document.getElementById("itemTd" + i); //the case itself
            let wrapper = caseElement.parentElement; //this gives the weird spacing issue
            //casesContainer.appendChild(caseElement.parentElement); //add case  parent element because there's 3 layers of divs lol
            casesContainer.appendChild(caseElement); 
            
            selCasesArr.push(i);
            algsGroups[customGroupName] = selCasesArr; //enter into algsGroups
            algsInformation[i].group = customGroupName; //enter into algsinfo
            console.log(algsInformation);

            wrapper.remove();

            //itemClicked(i); //to make sure it's not buggy
        }
    }
    createGroupName.value = "";
    return;
}

function createSet(){
    let customSetName = createSetName.value;
    console.log(customSetName);
    let selGroupsArr = [];

    const setContainer = document.createElement('div');
    setContainer.className = "setContainer";
    setContainer.id = "setContainer" + customSetName;
    document.getElementById("cases_selection").appendChild(setContainer);

    const setBar = document.createElement('div');
    setBar.className = "borderedContainer pad setBar";
    setBar.id = "setBar" + customSetName;
    setBar.innerText = customSetName;
    setContainer.appendChild(setBar);

    for (i = 1; i <= Object.keys(algsGroups).length; i++) {
        console.log("checking group " + i);
        let groupBarEl = document.getElementById("groupBar" + Object.keys(algsGroups)[i - 1]);
        if (groupBarEl.classList.contains("itemSel")){
            console.log(Object.keys(algsGroups)[i - 1] + " is selected");
            let selectedGroupName = Object.keys(algsGroups)[i - 1]
            selGroupsArr.push(selectedGroupName); //preparing the algsets for algsets object

            groupBarEl.className = "borderedContainer itemUnsel pad groupNameDiv groupBar" //to unselect bar

            let selectedGroupContainerId = "groupContainer" + selectedGroupName;
            setContainer.appendChild(document.getElementById(selectedGroupContainerId));

            for (selectedCase of algsGroups[selectedGroupName]) {
                console.log(selectedCase);
                console.log(document.getElementById("itemTd" + selectedCase))
                let selectedEl = document.getElementById("itemTd" + selectedCase);
                if(selectedEl.classList.contains("itemSel")){
                    selectedEl.classList.remove("itemSel");
                    selectedEl.classList.add("itemUnsel"); //unselect individual cases after moving
                }
                algsInformation[selectedCase]["algset"] = customSetName;
                console.log(algsInformation);
            }

            algsets[customSetName] = selGroupsArr;
            console.log(algsets);
            
        }
    }
    createSetName.value = "";
    return;
}