function outputAlgs () {
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
        s += "<div id='itemTd" + i + "' " + dblclick  + " onclick='itemClicked(" + i + ")' class='" + (sel ? "itemSel" : "itemUnsel") + " borderedContainer' title='" + algsInfo[i]["name"] + "'>" +
            `<img oncontextmenu='return false;' class='caseImage' id='sel${i}' src='${blobUrls[i]}' ></div>`;
        console.log(blobUrls);
        console.log("this is s");
        console.log(s);
    }
    s = "<div class='colFlex' style='width: fit-content'> <div class='borderedContainer " + (allSelected ? "itemSel" : "itemUnsel") + " pad groupNameDiv'" + s;
    s += "</div></div>";
    return s;
}