function outputAlgs (k) {
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
    s = "<div class='colFlex' style='width: fit-content'> <div class='borderedContainer " + (allSelected ? "itemSel" : "itemUnsel") + " pad groupNameDiv'" + s;
    s += "</div></div>";
    console.log("from outputAlgs");
    console.log(s);
    document.getElementById("cases_selection").innerHTML += s;
    return s;
}

function initSelection (){
    console.log("GENNING BUTTONS");
    const container = document.querySelector(".borderedContainer");
    const addGroupContatiner = document.createElement('div');

    const createGroupName = document.createElement('input');
    createGroupName.type = 'text';
    createGroupName.id = 'createGroupName';
    addGroupContatiner.appendChild(createGroupName);

    const addCasesToGroup = document.createElement('button');
    addCasesToGroup.innerText = "add cases to group";
    addCasesToGroup.id = 'actg';
    addCasesToGroup.onclick = createGroup();
    addGroupContatiner.appendChild(addCasesToGroup);
    container.insertBefore(addGroupContatiner, document.getElementById("cases_selection"));
    return;
}

function createGroup(){
    console.log("creating groups");
    return 1;
}