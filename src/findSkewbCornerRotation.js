/* let inputDiv = document.getElementById("input");
let outputDiv = document.getElementById("output"); */
var pos; //the position in speffz scheme
var ori; //how many cw twists neede to orient the corner

let rotationsObject = {
    "0": ["y'", "y2", "y", "", "x2 y", "x2", "x2 y'", "z2"],
    "1": ["z", "x' y'", "z' y2", "x y", "z'", "x' y", "z y2", "x y'"],
    "2": ["x y2", "z y", "x'", "z' y'", "x", "z' y", "x' y2", "z y'"]
} //sorted by orientation of corner

/*
function manageInput() {
    let input = inputDiv.value;
    startTracingProcess(input);
} */

function startTracingProcess(input) {
    pos = 4;
    ori = 0;
    //UFR oriented basically;

    let inputStr = input.trim();
    let algByMove = inputStr.split(" ");
    algByMove.forEach((move) => {
        let multiplier = getMultiplierFSCR(move);
        doMoveFSCR(move, multiplier);
    });
    let res = outputFSCR(pos, ori);
    return res;
}

function getMultiplierFSCR(move) {
    let multiplier;
    if (isMove.test(move)) {
        if (move.substring(1, 2) == "'") {
            multiplier = 2;
        } else {
            multiplier = 1;
        }
    } else {
        if (move.substring(1, 2) == "'") {
            multiplier = 3;
        } else if (move.substring(1, 2) == "2") {
            multiplier = 2;
        } else {
            multiplier = 1;
        }
    }
    return multiplier;
}

function doMoveFSCR(move, multiplier) {
    let turn = move.charAt(0);
    for (i = 0; i < multiplier; i++) {
        if (turn == "r") {
            if (pos == 3) {
                pos = 7;
                ori++;
            } else if (pos == 7) {
                pos = 5;
                ori++;
            } else if (pos == 5) {
                pos = 3;
                ori++;
            } else if (pos == 6) {
                ori--;
            }
        } else if (turn == "R") {
            if (pos == 4) {
                pos = 2;
                ori++;
            } else if (pos == 2) {
                pos = 6;
                ori++;
            } else if (pos == 6) {
                pos = 4;
                ori++;
            } else if (pos == 3) {
                ori--;
            }
        } else if (turn == "b") {
            if (pos == 2) {
                pos = 8;
                ori++;
            } else if (pos == 8) {
                pos = 6;
                ori++;
            } else if (pos == 6) {
                pos = 2;
                ori++;
            } else if (pos == 7) {
                ori--;
            }
        } else if (turn == "B") {
            if (pos == 3) {
                pos = 1;
                ori++;
            } else if (pos == 1) {
                pos = 7;
                ori++;
            } else if (pos == 7) {
                pos = 3;
                ori++;
            } else if (pos == 2) {
                ori--;
            }
        } else if (turn == "z") {
            if (pos == 1) {
                pos = 4;
                ori += 2;
            } else if (pos == 2) {
                pos = 3;
                ori++;
            } else if (pos == 3) {
                pos = 6;
                ori += 2;
            } else if (pos == 4) {
                pos = 5;
                ori++;
            } else if (pos == 5) {
                pos = 8;
                ori += 2;
            } else if (pos == 6) {
                pos = 7;
                ori++
            } else if (pos == 7) {
                pos = 2;
                ori += 2
            } else if (pos == 8) {
                pos = 1;
                ori++
            }
        }
    }
    return (pos, ori);
}

function outputFSCR(pos, ori) {
    ori = ori % 3; //mod 3
   // outputDiv.innerText = rotationsObject[ori][pos - 1];
    return rotationsObject[ori][pos - 1];
}