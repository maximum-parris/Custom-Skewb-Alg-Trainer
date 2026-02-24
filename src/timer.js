var allowStartingTimer;
var timesArray = JSON.parse(loadLocal(timesArrayKey, "[]"));
if (timesArray == null) // todo fix when figure out why JSON.parse("[]") returns 0
    timesArray = [];
var lastScramble = "";
var lastCase = 0;
var hintCase = 0;
var customAlgs = {};

// New variables for Learn mode
var wrongCases = [];           // Cases marked as wrong that need practice
var currentMode = 'train';     // 'train', 'recap', or 'learn'
var currentLearnCase = null;   // Track current case in learn mode to know if it was solved correctly

/// invokes generateScramble() and sets scramble string
function showScramble() {
    window.allowStartingTimer = false;
    var s;
    if (selCases.length == 0) {
        s = "click \"select cases\" above and pick some olls to practice";
        document.getElementById("selInfo").innerHTML = "";
    }
    else {
        s = generateScramble();
        window.allowStartingTimer = true;
    }
    var onclickS = `onclick='showHint(this, ${window.lastCase})'`;
    document.getElementById("scramble").innerHTML = `<span ${onclickS}> ${s} </span><span class='inlineButton' style='font-size: 1em !important;' ${onclickS}>?</span>`;
}

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function confirmUnsel(i) {
    if (confirm("Do you want to unselect case " + algsInformation[i]['name'] + "?")) {
        var index = selCases.indexOf(i);
        if (index != -1)
            selCases.splice(index, 1);
        else
            document.getElementById("last_scramble").firstChild.innerHTML = "Case already removed!";
        document.getElementById("last_scramble").firstChild.innerHTML = "Removed case " + algsInformation[i]['name'] + "!";
    }
}

function displayPracticeInfo() {
    var caseCount = selCases.length;
    var s = "";
    
    if (currentMode == 'learn') {
        s += "<b><a onclick='stopLearnMode()'>Stop Learning</a> " + wrongCases.length + " Wrong Cases</b>";
    } else if (recapArray.length > 0) {
        s += "<b>Recap " + recapArray.length + " Cases</b>";
    } else {
        s += "<b>Train " + caseCount + " Cases</b>";
        if (wrongCases.length > 0) {
            s += " | <a onclick='startLearnMode()'>Learn " + wrongCases.length + " Wrong</a> | <a onclick='clearWrongCases()'>Clear</a>";
        }
    }

    document.getElementById("selInfo").innerHTML = s;
}

function generateScramble() {
    if (window.lastScramble != "")
        document.getElementById("last_scramble").innerHTML = `<span>Last scramble: ${window.lastScramble}` +
            ` <span onclick='showHint(this,${lastCase})' class='caseNameStats'>(${algsInformation[lastCase]["name"]})</span></span><span class='material-symbols-outlined inlineButton' onclick='confirmUnsel(${lastCase})'>close</span>`;
    
    displayPracticeInfo();
    
    // get random case
    var caseNum = 0;
    
    if (currentMode == 'learn' && wrongCases.length > 0) {
        // LEARN MODE: Practice wrong cases
        caseNum = randomElement(wrongCases);
        // Store current learn case to track if solved correctly
        currentLearnCase = caseNum;
        // Don't remove from wrongCases yet - only remove when solved correctly
    }
    else if (recapArray.length > 0) {
        // RECAP MODE: Go through each case once
        currentMode = 'recap';
        caseNum = randomElement(recapArray);
        // Remove it from recap array
        const index = recapArray.indexOf(caseNum);
        recapArray.splice(index, 1);
        
        // If recap is finished, go to learn mode if there are wrong cases, otherwise train
        if (recapArray.length == 0) {
            if (wrongCases.length > 0) {
                currentMode = 'learn';
            } else {
                currentMode = 'train';
            }
        }
    } else {
        // TRAIN MODE: Random cases forever
        currentMode = 'train';
        
        if (currentSettings['weightedChoice']) {
            var selCasesCounts = []; // count how often each case has appeared already
            for (var i = 0; i < selCases.length; i++) {
                var count = 0;
                var currentCase = selCases[i];
                for (var j = 0; j < window.timesArray.length; j++) {
                    if (window.timesArray[j]["case"] == currentCase)
                        count += 1;
                }
                selCasesCounts.push(count);
            }

            var expectedCount = 0; // calculate how often each case "should have" appeared
            for (var i = 0; i < selCasesCounts.length; i++) {
                expectedCount += selCasesCounts[i];
            }
            var expectedCount = expectedCount / selCases.length;

            var selCaseWeights = []; // calculate the weights with which the next case is to be chosen. weights are arranged cumulatively
            for (var i = 0; i < selCasesCounts.length; i++) {
                if (i == 0)
                    selCaseWeights.push(3.5 ** (- (selCasesCounts[i] - expectedCount)));
                else
                    selCaseWeights.push(selCaseWeights[i - 1] + 3.5 ** (- (selCasesCounts[i] - expectedCount)));
            }
            caseNum = weightedRandomElement(selCases, selCaseWeights)
        }
        else { // random choice of next case
            caseNum = randomElement(selCases);
        }
    }
    
    var alg = randomElement(window.scramblesMap[caseNum]);
    var preMove = randomElement(preMoves);
    if (preMove != "") preMove += " ";
    var postMove = randomElement(postMoves);
    if (postMove != "") postMove = " " + postMove;
    var preRotation = randomElement(preRotations);
    if (preRotation != "") preRotation += " ";
    var postRotation = randomElement(postRotations);
    if (postRotation != "") postRotation += " ";
    var finalAlg = preRotation + preMove + alg + postMove + postRotation;

    window.lastScramble = finalAlg;
    window.lastCase = caseNum;

    return finalAlg;
}

/*        TIMER        */

var startMilliseconds, stopMiliseconds; // date and time when timer was started
var allowed = true; // allowed var is for preventing auto-repeat when you hold a button
var running = false; var waiting = false;
var timer = null;
var timerActivatingButton = 32; // 17 for ctrl
var timeout;

// Track if current solve was marked as wrong
var currentSolveMarkedWrong = false;

function msToHumanReadable(duration) {
    if (!Number.isFinite(duration))
        return "-";
    var milliseconds = parseInt((duration % 1000) / 10)
        , seconds = parseInt((duration / 1000) % 60)
        , minutes = parseInt((duration / (1000 * 60)) % 60)
        , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10 && (minutes > 0 || hours > 0)) ? "0" + seconds : seconds;
    milliseconds = (milliseconds < 10) ? "0" + milliseconds : milliseconds;

    hoursString = (hours == 0) ? "" : hours + ":";
    minutesString = (minutes == 0) ? "" : minutes + ":";

    return hoursString + minutesString + seconds + "." + milliseconds;
}

function displayTime() {
    if (running) {
        var d = new Date();
        var diff = d.getTime() - window.startMilliseconds;
        if (diff >= 0)
            timer.innerHTML = msToHumanReadable(diff);
    }
}

function handleTouchEnd() {
    if (!window.allowStartingTimer)
        return; // preventing auto-repeat
    if (!running && !waiting) {
        timerStart();
    }
    else {
        timerAfterStop();
    }
}

function handleTouchStart() {
    if (running)
        timerStop();
    else {
        timerSetReady(); // set green back
    }
}

function timerStop() {
    waiting = true;
    running = false;
    clearTimeout(timeout);

    var d = new Date();
    stopMiliseconds = d.getTime();
    timer.innerHTML = msToHumanReadable(stopMiliseconds - startMilliseconds);
    timer.style.color = "#850000";

    appendStats();
    
    // If in learn mode and the solve wasn't marked wrong, consider it correct
    if (currentMode == 'learn' && !currentSolveMarkedWrong && currentLearnCase) {
        markCurrentCaseCorrect();
    }
    
    showScramble();
    
    // Reset flags for next solve
    currentSolveMarkedWrong = false;
    currentLearnCase = null;
}

function timerSetReady() {
    waiting = false;
    timer.innerHTML = "0.00";
    timer.style.color = "#008500";
}

function timerStart() {
    var d = new Date();
    startMilliseconds = d.getTime();
    running = true;
    timeout = setInterval(displayTime, 10);
    timer.style.color = currentSettings['colors']['--text'];
}

function timerAfterStop() {
    timer.style.color = currentSettings['colors']['--text'];
}

// Mark current case as wrong (called by Shift key)
function markCurrentCaseWrong() {
    if (lastCase && !currentSolveMarkedWrong) {
        currentSolveMarkedWrong = true;
        
        // Only add if not already in wrongCases
        if (!wrongCases.includes(lastCase)) {
            wrongCases.push(lastCase);
            console.log(`Case ${lastCase} marked as wrong`);
            
            // Visual feedback
            const scrambleEl = document.getElementById("scramble");
            if (scrambleEl) {
                scrambleEl.style.backgroundColor = "#ffcccc";
                setTimeout(() => {
                    scrambleEl.style.backgroundColor = "";
                }, 500);
            }
        }
        
        displayPracticeInfo();
    }
}

// Mark current case as correct (removes from wrongCases in learn mode)
function markCurrentCaseCorrect() {
    if (currentMode == 'learn' && currentLearnCase) {
        const index = wrongCases.indexOf(currentLearnCase);
        if (index !== -1) {
            wrongCases.splice(index, 1);
            console.log(`Case ${currentLearnCase} solved correctly! Removed from wrong cases.`);
            
            // Visual feedback for correct solve
            const scrambleEl = document.getElementById("scramble");
            if (scrambleEl) {
                scrambleEl.style.backgroundColor = "#ccffcc";
                setTimeout(() => {
                    scrambleEl.style.backgroundColor = "";
                }, 500);
            }
        }
        
        // If all wrong cases are solved, go back to train mode
        if (wrongCases.length === 0) {
            currentMode = 'train';
            setTimeout(() => {
                alert("Great job! You've mastered all wrong cases!");
            }, 100);
        }
        
        displayPracticeInfo();
    }
}

// Start learning mode with all wrong cases
function startLearnMode() {
    if (wrongCases.length > 0) {
        currentMode = 'learn';
        showScramble(); // Generate first learn scramble
        displayPracticeInfo();
    }
}

// Stop learning mode and return to training
function stopLearnMode() {
    currentMode = 'train';
    showScramble();
    displayPracticeInfo();
}

// Clear all wrong cases
function clearWrongCases() {
    if (confirm("Clear all marked wrong cases?")) {
        wrongCases = [];
        if (currentMode == 'learn') {
            currentMode = 'train';
        }
        displayPracticeInfo();
    }
}

// http://stackoverflow.com/questions/1787322/htmlspecialchars-equivalent-in-javascript
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

// invoked right after the timer stopped
function appendStats() {
    window.timesArray.push(makeResultInstance());
    displayStats();
}

/// removes time from array and invokes displayStats()
function removeTime(i) {
    window.timesArray.splice(i, 1);
    displayStats();
}

function updateInstancesIndeces() {
    for (var i = 0; i < window.timesArray.length; i++)
        window.timesArray[i]["index"] = i;
}

/// requests confirmation and deletes result
function confirmRem(i) {
    var inst = window.timesArray[i];
    if (confirm("Are you sure you want to remove this time?\n\n" + inst["time"])) {
        removeTime(i);
        updateInstancesIndeces();
        renderTimeDetails(inst["case"]);
        displayStats();
    }
}

function confirmRemLast() {
    var i = window.timesArray.length;
    if (i != 0)
        confirmRem(i - 1);
}

/// requests confirmation and empty times array (clear session)
function confirmClear() {
    if (confirm("Are you sure you want to clear session?")) {
        window.timesArray = [];
        document.getElementById('infoHeader').innerHTML = ('')
        displayStats();
    }
}

function saveAlgs() {
    return saveLocal(selectionArrayKey + "customAlgs", JSON.stringify(customAlgs));
}

function loadAlgs() {
    customAlgs = JSON.parse(loadLocal(selectionArrayKey + "customAlgs", '{}'));
    if (customAlgs == null)
        customAlgs = {};
    saveAlgs();
}

function editAlg() {
    var textArea = document.getElementById('algorithmsInput')
    if (textArea.disabled) {
        document.getElementById('algorithmsInput').disabled = false
        document.getElementById('editAlgButton').innerText = 'check'
        return
    }
    else {
        document.getElementById('algorithmsInput').disabled = true
        document.getElementById('editAlgButton').innerText = 'edit'
        var caseAlgsInfo = JSON.parse(JSON.stringify(algsInformation[hintCase]));
        caseAlgsInfo["a"] = textArea.value.split('\n').filter((line) => line.length > 0)
        customAlgs[hintCase] = caseAlgsInfo
        saveAlgs()
        return
    }
}

function renderHint(i) {
    document.getElementById('editAlgButton').innerText = "edit"
    document.getElementById("boxTitle").innerHTML = `${algsInformation[i]['name']}`;
    var longestAlgLength = 0;
    var currentAlgs = algsInformation[i]["a"]
    if (typeof currentAlgs === "string") {
        currentAlgs = currentAlgs.split(",");
    }
    if (currentAlgs.length === 1 && Array.isArray(currentAlgs[0])) {
        currentAlgs = currentAlgs[0];
    }
    if (i in customAlgs) {
        currentAlgs = customAlgs[i]["a"]
    }
    for (const alg of currentAlgs) {
        longestAlgLength = Math.max(longestAlgLength, alg.length)
    }
    let algsStr = `<div class='colFlex' style='width: 100%'>
    <label for='algorithmsInput'>Algorithms:</label>
    <textarea id='algorithmsInput' disabled rows='5' cols='30'>${currentAlgs.join("\n")}</textarea>
    </div>`;
    document.getElementById('prevButton').style.opacity = i == 1 ? 0 : 1;
    document.getElementById('nextButton').style.opacity = i == Object.keys(algsInformation).length ? 0 : 1;
    document.getElementById("boxalg").innerHTML = algsStr;
    document.getElementById("boxsetup").innerHTML = "Setup:<br/>" + scramblesMap[i][0];
    document.getElementById("boxImg").src = blobUrls[i];
}

function showHint(element, i) {
    renderHint(i);
    hintCase = i;
    
    // Mark this case as wrong when hint is requested
    if (!wrongCases.includes(i)) {
        wrongCases.push(i);
        console.log(`Case ${i} marked as wrong via hint`);
        displayPracticeInfo();
    }
    
    openDialog('hintWindow');
}

function previousCase() {
    hintCase = Math.max(hintCase - 1, 1);
    renderHint(hintCase);
}

function downloadCustomAlgs() {
    const file = new File([JSON.stringify(customAlgs)], 'customAlgsExport.json', {
        type: 'application/json',
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(file)

    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

function uploadCustomAlgs() {
    var files = document.getElementById('uploadFile').files;
    console.log(files);
    if (files.length != 1) {
        return false;
    }

    var fr = new FileReader();

    fr.onload = function (e) {
        try {
            var result = JSON.parse(e.target.result)
            console.log(result)
            customAlgs = result
            renderHint(hintCase)
        } catch (e) {
            console.error(e);
        }
    }

    fr.readAsText(files.item(0));
}

function nextCase() {
    var length = Object.keys(algsInformation).length;
    hintCase = Math.min(hintCase + 1, length);
    renderHint(hintCase);
}

function showCaseTimeDetails(caseNum) {
    renderTimeDetails(caseNum);
    openDialog('caseTimeDetails');
}

/// fills resultInfo container with info about given result instance
/// displays averages etc.
/// fills "times" right panel with times and last result info
function displayStats() {
    saveLocal(timesArrayKey, JSON.stringify(window.timesArray));
    var len = window.timesArray.length;

    var el = document.getElementById("times");
    if (len == 0) {
        el.innerHTML = "";
        document.getElementById("infoHeader").innerHTML = '0';
        document.getElementById('numCases').innerText = '0';
        return;
    }

    // case-by-case
    var resultsByCase = {}; // [57: [...], 12: [...], ...];
    for (var i = 0; i < len; i++) {
        var currentCase = window.timesArray[i]["case"];
        if (resultsByCase[currentCase] == null)
            resultsByCase[currentCase] = [];
        resultsByCase[currentCase].push(window.timesArray[i]);
    }

    var keys = Object.keys(resultsByCase);
    keys.sort((n1, n2) => n1 - n2);

    var s = "";
    // allocate them inside times span
    for (var j = 0; j < keys.length; j++) {
        var case_ = keys[j];
        var timesString = "";
        var meanForCase = 0.0;
        var i = 0;
        for (; i < resultsByCase[case_].length; i++) {
            timesString += makeHtmlDisplayableTime(resultsByCase[case_][i]);
            if (i != resultsByCase[case_].length - 1)
                timesString += ", ";
            // avg
            meanForCase *= i / (i + 1);
            meanForCase += resultsByCase[case_][i]["ms"] / (i + 1);
        }
        
        // Add indicator if case is marked as wrong
        var wrongIndicator = wrongCases.includes(parseInt(case_)) ? ' ⚠️' : '';
        
        s += `<div class='timeEntry'><span class='caseNameStats' onclick='showHint(this, ${keys[j]})'>${algsInformation[case_]["algset"]} ${algsInformation[case_]["name"]}${wrongIndicator}</span>`
        s += ` <span class='caseNameStats' onclick=(showCaseTimeDetails(${case_}))>(#${resultsByCase[case_].length}, ⌀${msToHumanReadable(meanForCase)})</span></div>`;
    }
    el.innerHTML = s;

    document.getElementById("infoHeader").innerText = (len == 0 ? '' : len + ' ');
    document.getElementById('numCases').innerText = keys.length;
}

function makeResultInstance() {
    var currentTime = document.getElementById("timer").innerHTML;
    var details = window.lastScramble;
    var index = window.timesArray.length;

    return {
        "time": currentTime,
        "ms": timeStringToMseconds(currentTime) * 10, // *10 because current time 1.23 display only hundreths
        "details": details,
        "index": index,
        "case": window.lastCase
    };
}

// converts timestring to milliseconds (int)
// 1:06.15 -> 6615
function timeStringToMseconds(s) {
    if (s == "")
        return -1;
    var parts = s.split(":");
    var secs = parseFloat(parts[parts.length - 1]);
    if (parts.length > 1) // minutes
        secs += parseInt(parts[parts.length - 2]) * 60;
    if (parts.length > 2) // hrs
        secs += parseInt(parts[parts.length - 3]) * 3600;
    if (isNaN(secs))
        return -1;
    return Math.round(secs * 100);
}

// Add keyboard listener for Shift key
document.addEventListener("keydown", function (event) {
    if (event.key === "Shift") {
        markCurrentCaseWrong();
    }
});

// Initialize on page load
window.onload = function() {
    // Load wrong cases from localStorage if you want persistence
    var savedWrongCases = loadLocal('wrongCases', '[]');
    if (savedWrongCases) {
        try {
            wrongCases = JSON.parse(savedWrongCases);
        } catch (e) {
            wrongCases = [];
        }
    }
    
    // Save wrong cases when page unloads (optional)
    window.addEventListener('beforeunload', function() {
        saveLocal('wrongCases', JSON.stringify(wrongCases));
    });
};