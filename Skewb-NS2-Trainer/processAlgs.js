let workerOutput;
var scramblesMap = {};

function processAlgSet(csvArr) {
    let invArr = [];
    csvArr.forEach(Case => {
        invArr.push(flipAlg(Case.a));
    });
    console.log(invArr);
    getScrambles(invArr);
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
  console.log(numScrambleMapEntries);
  let FPNscr = [];
  numScrambleMapEntries++;
  input.forEach(scr => {
    scr = scr.replace(/[rlbB]/g, c => ({r:'R',l:'L',b:'B',B:'U'})[c]); //goes from rlbB gen to RLUB gen
    FPNscr.push(scr);
  })
  scramblesMap[numScrambleMapEntries] = FPNscr;
  console.log(scramblesMap);
}