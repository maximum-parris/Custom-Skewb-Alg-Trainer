let workerOutput;
var scramblesMap = {};
let g = "#59A14F";
let w = "#fafafa";
let o = "#F28E2B";
let y = "#ffcf3d";
let r = "#fa2e2e";
let b = "#4264fa";
const isMove = /^[rRbB]/; //else it's a rotation.
var baseSvgCode = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100.0 60.05675960631075\"><style>polygon { stroke: black; stroke-width: 0.5px; stroke-linejoin: round;}</style>"
var skewbStickers = [
  ["u1", "u2", "u3", "u4", "u5"],
  ["l1", "l2", "l3", "l4", "l5"],
  ["f1", "f2", "f3", "f4", "f5"],
  ["r1", "r2", "r3", "r4", "r5"],
  ["b1", "b2", "b3", "b4", "b5"]
//  ["d1", "d2", "d3", "d4", "d5"] 6 face currently not supported
  ];
let faces = ["u", "l", "f", "r", "b"]; //same here
const stickerPoints = {
  // U face
  u1: '38.75 21.87 61.25 21.87 61.25 10.62 38.75 10.62',
  u2: '38.75 10.62 27.50 16.25 38.75 21.87',
  u3: '61.25 10.62 50.00 5.00 38.75 10.62',
  u4: '61.25 21.87 72.50 16.25 61.25 10.62',
  u5: '38.75 21.87 50.00 27.50 61.25 21.87',
  
  // L face
  l1: '38.75 21.87 50.00 41.28 38.75 49.43 27.50 30.03',
  l2: '27.50 16.25 38.75 21.87 27.50 30.03',
  l3: '38.75 21.87 50.00 27.50 50.00 41.28',
  l4: '50.00 41.28 38.75 49.43 50.00 55.06',
  l5: '27.50 30.03 27.50 43.81 38.75 49.43',
  
  // F face
  f1: '61.25 21.87 72.50 30.03 61.25 49.43 50.00 41.28',
  f2: '50.00 27.50 61.25 21.87 50.00 41.28',
  f3: '61.25 21.87 72.50 16.25 72.50 30.03',
  f4: '72.50 30.03 61.25 49.43 72.50 43.81',
  f5: '50.00 41.28 50.00 55.06 61.25 49.43',
  
  // R face
  r1: '83.75 10.62 95.00 18.78 83.75 38.18 72.50 30.03',
  r2: '72.50 16.25 83.75 10.62 72.50 30.03',
  r3: '83.75 10.62 95.00 5.00 95.00 18.78',
  r4: '95.00 18.78 83.75 38.18 95.00 32.56',
  r5: '72.50 30.03 83.75 38.18 72.50 43.81',
  
  // B face
  b1: '16.25 10.62 27.50 30.03 16.25 38.18 5.00 18.78',
  b2: '5.00 5.00 16.25 10.62 5.00 18.78',
  b3: '16.25 10.62 27.50 16.25 27.50 30.03',
  b4: '27.50 30.03 16.25 38.18 27.50 43.81',
  b5: '5.00 18.78 5.00 32.56 16.25 38.18'
};


function processAlgSet(csvArr) {
  let invArr = [];
  csvArr.forEach(Case => {
    invArr.push(flipAlg(Case.a));
  });
  console.log(invArr);
  getScrambles(invArr);
  getColourArr(invArr); //gens colourArr + svgs + urls
}

function flipAlg(alg){
    let input = alg.trim();

    if (!isValidAlg(input)) {
      alert("Invalid algorithm, please correct alg" + alg);
      return null;
    }

    let flipped_alg = input.split(/\s+/).reverse();
    return(primeFlipper(flipped_alg).trim());
    }

    function isValidAlg(algString) {
        const validMoves = /^[rRbBlLfFxyz]('?|2)?$/;
        const moves = algString.trim().split(/\s+/);

        for (let move of moves) {
          if (!validMoves.test(move)) {
            return false;
          }
        }
        return true;
    }

  function primeFlipper(flipped_string) {
    for (let i = 0; i < flipped_string.length; i++) {
      let move = flipped_string[i];
      if (move.length > 1) {
        if (move[1] !== "2") {
          flipped_string[i] = move[0];
        }
      } else {
        flipped_string[i] = move + "'";
      }
    }
    return flipped_string.join(" ");
  }


function getScrambles (invArr){
  let numCases = 0;
  let numSolutions = 0;
  let scrambleList = [];
  work = new Worker("worker.js");
  let solvestring = "[";
  for (i=0; i<invArr.length; i++) {
    invArr[i].replace(/\b(x2|x'|x|y2|y'|y)\b/g, '').replace(/\s+/g, ' ').trim(); //removes x and y rotations withing alg     
    if (i != invArr.length - 1) {
    solvestring += invArr[i] + ", ";
    } else {
      solvestring += invArr[i];
    }
  }
  solvestring += "]";
  console.log("getting scrambles " + solvestring);

  let subgroupData = [{subgroup: 'r l b B z', prune: '6', search: '5'}];
  let sortData = [{type: 'priority', pieces: ''}];
  /*console.log({puzzle: "l: (UFL-1 DFR-1 DBL-1) (DLF+1) (L F D)\nL: (URF-1 DLF-1 ULB-1) (UFL+1) (U F L)\nr: (DFR-1 UBR-1 DBL-1) (DRB+1) (R B D)\nR: (URF-1 ULB-1 DRB-1) (UBR+1) (R U B)\nb: (ULB-1 DLF-1 DRB-1) (DBL+1) (L D B)\nB: (UBR-1 UFL-1 DBL-1) (ULB+1) (U L B)\nF: (UFL-1 UBR-1 DFR-1) (URF+1) (F U R) \nf: (URF-1 DRB-1 DLF-1) (DFR+1) (F R D)\nS: (URF-1) (UFL+1) (ULB+1) (UBR-1) (R U) (F B)\nH: (URF+1) (UFL-1) (ULB-1) (UBR+1) (R U) (F B)\ns: (UBR-1) (ULB+1) (DRB-1) (DBL+1) (U D) (R B)\nh: (UBR+1) (ULB-1) (DRB+1) (DBL-1) (U D) (R B)      \nx: (F U B D) (URF+1 UBR-1 DRB+1 DFR-1) (UFL-1 ULB+1 DBL-1 DLF+1)\ny: (F L B R) (URF UFL ULB UBR) (DFR DLF DBL DRB)\nz: (U R D L) (URF-1 DFR+1 DLF-1 UFL+1) (UBR+1 DRB-1 DBL+1 ULB-1)\nvUperm: (U B D)\nhUperm: (U R D)", 
                  ignore: "",
                  solve: solvestring, //scram area 
                  preAdjust: "z",
                  postAdjust: "z",
                  subgroups: subgroupData,
                  sorting: sortData,
                  esq: "",
                  rankesq: "z_:30",
                  showPost: false}); */

  work.postMessage({puzzle: "l: (UFL-1 DFR-1 DBL-1) (DLF+1) (L F D)\nL: (URF-1 DLF-1 ULB-1) (UFL+1) (U F L)\nr: (DFR-1 UBR-1 DBL-1) (DRB+1) (R B D)\nR: (URF-1 ULB-1 DRB-1) (UBR+1) (R U B)\nb: (ULB-1 DLF-1 DRB-1) (DBL+1) (L D B)\nB: (UBR-1 UFL-1 DBL-1) (ULB+1) (U L B)\nF: (UFL-1 UBR-1 DFR-1) (URF+1) (F U R) \nf: (URF-1 DRB-1 DLF-1) (DFR+1) (F R D)\nS: (URF-1) (UFL+1) (ULB+1) (UBR-1) (R U) (F B)\nH: (URF+1) (UFL-1) (ULB-1) (UBR+1) (R U) (F B)\ns: (UBR-1) (ULB+1) (DRB-1) (DBL+1) (U D) (R B)\nh: (UBR+1) (ULB-1) (DRB+1) (DBL-1) (U D) (R B)      \nx: (F U B D) (URF+1 UBR-1 DRB+1 DFR-1) (UFL-1 ULB+1 DBL-1 DLF+1)\ny: (F L B R) (URF UFL ULB UBR) (DFR DLF DBL DRB)\nz: (U R D L) (URF-1 DFR+1 DLF-1 UFL+1) (UBR+1 DRB-1 DBL+1 ULB-1)\nvUperm: (U B D)\nhUperm: (U R D)", 
                  ignore: "",
                  solve: solvestring, //scram area 
                  preAdjust: "z",
                  postAdjust: "z",
                  subgroups: subgroupData,
                  sorting: sortData,
                  esq: "",
                  rankesq: "z_:30",
                  showPost: false});


  work.onmessage = function(event) {
               // console.log("got event " + event.data.type);
                if (event.data.type === "stop") {
                  console.log(scrambleList);
                  work.terminate();
                  return;
                } else if (event.data.type === "scrambles") { //added, called when 20 scrambles are ready.
                  workerOutput = event.data.value;
                  console.log("worker output: ");
                  console.log(workerOutput);
                  createScramblesMap(workerOutput);
                } else if (event.data.type === "depthUpdate") {
                    
                } else if (event.data.type === "solution") {
                 /* if(numSolutions <= 20){
                    let solution = event.data.value;
                    //console.log(solution);
                    //console.log(typeof solution);
                    if (!solution.includes("z")) {
                      numSolutions++;
                      scrambleList.push(solution);
                    } else {
                      console.log("this scramble has a z")
                    }
                  } */
                } else if (event.data.type === "set-depth") {
                    depth = event.data.value;
                } else if (event.data.type === "next-state") {
                   /* if (event.data.value.index > 1) {
                      numSolutions = 0;
                    }
                    numSolutions = 0;
                    caseNum = event.data.value.num; */
                } else if (event.data.type === "num-states") {
                    numCases = event.data.value;
                } else if (event.data.type === "moveWeights") {
                    moveWeights = event.data.value;
                } else if (event.data.type === "debug") {
                    debugVars.push(event.data.value);
                }
            }
  return scrambleList;
}

//input -> ["scr1", "scr2"...]
let numScrambleMapEntries = 0;
function createScramblesMap (input) {
  //console.log(numScrambleMapEntries);
  let FPNscr = [];
  numScrambleMapEntries++;
  input.forEach(scr => {
    scr = scr.replace(/[rlbB]/g, c => ({r:'R',l:'L',b:'B',B:'U'})[c]); //goes from rlbB gen to RLUB gen
    FPNscr.push(scr);
  })
  scramblesMap[numScrambleMapEntries] = FPNscr;
  //console.log(scramblesMap);
}

function getColourArr (invArr, k) {
  let finColourArr; //so doMove doesn't run a billion times;
  for (k = 0; k < invArr.length; k++) {
    let invAlg = invArr[k];
    console.log(invAlg);
    colourArr = [
    { u1: g, u2: g, u3: g, u4: g, u5: g },
    { l1: w, l2: w, l3: w, l4: w, l5: w },
    { f1: o, f2: o, f3: o, f4: o, f5: o },
    { r1: y, r2: y, r3: y, r4: y, r5: y },
    { b1: r, b2: r, b3: r, b4: r, b5: r },
    { d1: b, d2: b, d3: b, d4: b, d5: b }
    ];
    invAlg = invAlg.replace(/[’‘]/g, "'");
    let algByMove = invAlg.split(" ");
    // console.log(algByMove);
    algByMove.forEach((move) => {
      let multiplier = getMultiplier(move);
      finColourArr = doMove(move, multiplier);
    });
    generateSVG(finColourArr, k); //k is the Nth case
  }
  
}

function getMultiplier(move) {
  let multiplier;
  if (isMove.test(move)) {
    // console.log(move);
    // console.log(typeof move);
    // console.log("in yay");
    if (move.substring(1, 2) == "'") {
      // console.log("yay");
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

function doMove(move, multiplier) {
  let turn = move.charAt(0);
  let temp;
  for (i = 0; i < multiplier; i++) {
    if (turn == "r") {
      temp = colourArr[2].f5;
      colourArr[2].f5 = colourArr[5].d4;
      colourArr[5].d4 = colourArr[3].r2;
      colourArr[3].r2 = temp;

      temp = colourArr[5].d2;
      colourArr[5].d2 = colourArr[3].r4;
      colourArr[3].r4 = colourArr[2].f3;
      colourArr[2].f3 = temp;

      temp = colourArr[1].l4;
      colourArr[1].l4 = colourArr[4].b5;
      colourArr[4].b5 = colourArr[0].u4;
      colourArr[0].u4 = temp;

      temp = colourArr[2].f1;
      colourArr[2].f1 = colourArr[5].d1;
      colourArr[5].d1 = colourArr[3].r1;
      colourArr[3].r1 = temp;

      temp = colourArr[2].f4;
      colourArr[2].f4 = colourArr[5].d3;
      colourArr[5].d3 = colourArr[3].r5;
      colourArr[3].r5 = temp;
      
    } else if (turn == "R") {
      temp = colourArr[2].f2;
      colourArr[2].f2 = colourArr[3].r5;
      colourArr[3].r5 = colourArr[0].u3;
      colourArr[0].u3 = temp;

      temp = colourArr[0].u5;
      colourArr[0].u5 = colourArr[2].f4;
      colourArr[2].f4 = colourArr[3].r3;
      colourArr[3].r3 = temp;

      temp = colourArr[1].l3;
      colourArr[1].l3 = colourArr[5].d3;
      colourArr[5].d3 = colourArr[4].b2;
      colourArr[4].b2 = temp;

      temp = colourArr[0].u1;
      colourArr[0].u1 = colourArr[2].f1;
      colourArr[2].f1 = colourArr[3].r1;
      colourArr[3].r1 = temp;

      temp = colourArr[2].f3;
      colourArr[2].f3 = colourArr[3].r2;
      colourArr[3].r2 = colourArr[0].u4;
      colourArr[0].u4 = temp;
    } else if (turn == "b") {
      temp = colourArr[0].u3;
      colourArr[0].u3 = colourArr[2].f4;
      colourArr[2].f4 = colourArr[1].l5;
      colourArr[1].l5 = temp;

      temp = colourArr[3].r3;
      colourArr[3].r3 = colourArr[5].d3;
      colourArr[5].d3 = colourArr[4].b4;
      colourArr[4].b4 = temp;

      temp = colourArr[4].b2;
      colourArr[4].b2 = colourArr[3].r5;
      colourArr[3].r5 = colourArr[5].d5;
      colourArr[5].d5 = temp;

      temp = colourArr[4].b1;
      colourArr[4].b1 = colourArr[3].r1;
      colourArr[3].r1 = colourArr[5].d1;
      colourArr[5].d1 = temp;

      temp = colourArr[3].r4;
      colourArr[3].r4 = colourArr[5].d4;
      colourArr[5].d4 = colourArr[4].b5;
      colourArr[4].b5 = temp;
    } else if (turn == "B") {
      temp = colourArr[0].u4;
      colourArr[0].u4 = colourArr[3].r4;
      colourArr[3].r4 = colourArr[4].b3;
      colourArr[4].b3 = temp;

      temp = colourArr[3].r2;
      colourArr[3].r2 = colourArr[4].b5;
      colourArr[4].b5 = colourArr[0].u2;
      colourArr[0].u2 = temp;

      temp = colourArr[2].f3;
      colourArr[2].f3 = colourArr[5].d4;
      colourArr[5].d4 = colourArr[1].l2;
      colourArr[1].l2 = temp;

      temp = colourArr[0].u1;
      colourArr[0].u1 = colourArr[3].r1;
      colourArr[3].r1 = colourArr[4].b1;
      colourArr[4].b1 = temp;

      temp = colourArr[0].u3;
      colourArr[0].u3 = colourArr[3].r3;
      colourArr[3].r3 = colourArr[4].b2;
      colourArr[4].b2 = temp;
    } else if (turn == "z") {
      temp = colourArr[0].u1;
      colourArr[0].u1 = colourArr[4].b1;
      colourArr[4].b1 = colourArr[5].d1;
      colourArr[5].d1 = colourArr[2].f1;
      colourArr[2].f1 = temp;

      temp = colourArr[0].u2;
      colourArr[0].u2 = colourArr[4].b4;
      colourArr[4].b4 = colourArr[5].d2;
      colourArr[5].d2 = colourArr[2].f2;
      colourArr[2].f2 = temp;

      temp = colourArr[0].u5;
      colourArr[0].u5 = colourArr[4].b3;
      colourArr[4].b3 = colourArr[5].d5;
      colourArr[5].d5 = colourArr[2].f5;
      colourArr[2].f5 = temp;

      temp = colourArr[1].l2;
      colourArr[1].l2 = colourArr[1].l5;
      colourArr[1].l5 = colourArr[1].l4;
      colourArr[1].l4 = colourArr[1].l3;
      colourArr[1].l3 = temp;

      temp = colourArr[0].u3;
      colourArr[0].u3 = colourArr[4].b5;
      colourArr[4].b5 = colourArr[5].d3;
      colourArr[5].d3 = colourArr[2].f3;
      colourArr[2].f3 = temp;

      temp = colourArr[0].u4;
      colourArr[0].u4 = colourArr[4].b2;
      colourArr[4].b2 = colourArr[5].d4;
      colourArr[5].d4 = colourArr[2].f4;
      colourArr[2].f4 = temp;

      temp = colourArr[3].r2;
      colourArr[3].r2 = colourArr[3].r3;
      colourArr[3].r3 = colourArr[3].r4;
      colourArr[3].r4 = colourArr[3].r5;
      colourArr[3].r5 = temp;
    } else if (turn == "y") {
      temp = colourArr[3].r1;
      colourArr[3].r1 = colourArr[4].b1;
      colourArr[4].b1 = colourArr[1].l1;
      colourArr[1].l1 = colourArr[2].f1;
      colourArr[2].f1 = temp;

      temp = colourArr[3].r2;
      colourArr[3].r2 = colourArr[4].b2;
      colourArr[4].b2 = colourArr[1].l2;
      colourArr[1].l2 = colourArr[2].f2;
      colourArr[2].f2 = temp;

      temp = colourArr[3].r3;
      colourArr[3].r3 = colourArr[4].b3;
      colourArr[4].b3 = colourArr[1].l3;
      colourArr[1].l3 = colourArr[2].f3;
      colourArr[2].f3 = temp;

      temp = colourArr[3].r4;
      colourArr[3].r4 = colourArr[4].b4;
      colourArr[4].b4 = colourArr[1].l4;
      colourArr[1].l4 = colourArr[2].f4;
      colourArr[2].f4 = temp;

      temp = colourArr[3].r5;
      colourArr[3].r5 = colourArr[4].b5;
      colourArr[4].b5 = colourArr[1].l5;
      colourArr[1].l5 = colourArr[2].f5;
      colourArr[2].f5 = temp;

      // Rotate U face clockwise
      temp = colourArr[0].u3;
      colourArr[0].u3 = colourArr[0].u2;
      colourArr[0].u2 = colourArr[0].u5;
      colourArr[0].u5 = colourArr[0].u4;
      colourArr[0].u4 = temp;

      // Rotate D face counterclockwise
      temp = colourArr[5].d2;
      colourArr[5].d2 = colourArr[5].d3;
      colourArr[5].d3 = colourArr[5].d4;
      colourArr[5].d4 = colourArr[5].d5;
      colourArr[5].d5 = temp;
    } else if (turn == "x") {
      temp = colourArr[2].f2;
      colourArr[2].f2 = colourArr[2].f5;
      colourArr[2].f5 = colourArr[2].f4;
      colourArr[2].f4 = colourArr[2].f3;
      colourArr[2].f3 = temp;

      temp = colourArr[4].b2;
      colourArr[4].b2 = colourArr[4].b3;
      colourArr[4].b3 = colourArr[4].b4;
      colourArr[4].b4 = colourArr[4].b5;
      colourArr[4].b5 = temp;

      temp = colourArr[0].u1;
      colourArr[0].u1 = colourArr[1].l1;
      colourArr[1].l1 = colourArr[5].d1;
      colourArr[5].d1 = colourArr[3].r1;
      colourArr[3].r1 = temp;

      temp = colourArr[0].u2;
      colourArr[0].u2 = colourArr[1].l5;
      colourArr[1].l5 = colourArr[5].d4;
      colourArr[5].d4 = colourArr[3].r3;
      colourArr[3].r3 = temp;

      temp = colourArr[0].u3;
      colourArr[0].u3 = colourArr[1].l2;
      colourArr[1].l2 = colourArr[5].d5;
      colourArr[5].d5 = colourArr[3].r4;
      colourArr[3].r4 = temp;

      temp = colourArr[0].u4;
      colourArr[0].u4 = colourArr[1].l3;
      colourArr[1].l3 = colourArr[5].d2;
      colourArr[5].d2 = colourArr[3].r5;
      colourArr[3].r5 = temp;

      temp = colourArr[0].u5;
      colourArr[0].u5 = colourArr[1].l4;
      colourArr[1].l4 = colourArr[5].d3;
      colourArr[5].d3 = colourArr[3].r2;
      colourArr[3].r2 = temp;
    }
  }
  console.log(colourArr);
  return colourArr;
}

function generateSVG (colourArr, k) {  
  let svg = baseSvgCode;
  for (let j = 0; j < faces.length; j++) { //for the face "r"
    for (let i = 1; i <= 5; i++) { //for the specific sticked "1"
      let face = faces[j];
      let sticker = face + i;
      let svgPosition = stickerPoints[sticker];
      let color = colourArr[j][sticker];
      svg += `<polygon id="${sticker}" fill="${color}" points="${svgPosition}"/>\n`;
    }
  }
  svg += "</svg>";
  blob = new Blob([svg], {type: 'image/svg+xml'});
  url = URL.createObjectURL(blob);
  blobUrls[k + 1] = url;
  console.log(blobUrls);
  renderSelection();
  outputAlgs();
}