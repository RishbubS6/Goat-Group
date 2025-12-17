---
layout: opencs
title: Calculator
permalink: /calculator/
---
<!-- 
Hack 0: Right justify result
Hack 1: Test conditions on small, big, and decimal numbers, report on findings. Fix issues.
Hack 2: Add the common math operation that is missing from calculator
Hack 3: Implement 1 number operation (ie SQRT) 
-->

<!-- 
HTML implementation of the calculator. 
-->

<!-- 
    Style and Action are aligned with HRML class definitions
    style.css contains majority of style definition (number, operation, clear, and equals)
    - The div calculator-container sets 4 elements to a row
    Background is credited to Vanta JS and is implemented at bottom of this page
-->
<style>
  .calculator-output {
    /*
      calulator output
      top bar shows the results of the calculator;
      result to take up the entirety of the first row;
      span defines 4 columns and 1 row
    */
    grid-column: span 4;
    grid-row: span 1;
  
    border-radius: 10px;
    padding: 0.25em;
    font-size: 20px;
    border: 5px solid black;
  
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0.6em;
    text-align: right;
  }
  canvas {
    filter: none;
  }
</style>

<!-- Add a container for the animation -->
<div id="animation">
  <div class="calculator-container">
      <!--result-->
      <div class="calculator-output" id="output">0</div>
      <!--row 1-->
      <div class="calculator-number">1</div>
      <div class="calculator-number">2</div>
      <div class="calculator-number">3</div>
      <div class="calculator-operation">+</div>
      <!--row 2-->
      <div class="calculator-number">4</div>
      <div class="calculator-number">5</div>
      <div class="calculator-number">6</div>
      <div class="calculator-operation">-</div>
      <!--row 3-->
      <div class="calculator-number">7</div>
      <div class="calculator-number">8</div>
      <div class="calculator-number">9</div>
      <div class="calculator-operation">*</div>
      <!--row 4-->
      <div class="calculator-clear">A/C</div>
      <div class="calculator-number">0</div>
      <div class="calculator-number">.</div>
      <div class="calculator-equals">=</div>
  </div>
</div>

<!-- extra operations: modulus and unary ops: sqrt, square, cube, factorial -->
<div style="text-align:center; margin-top:10px; display:flex; gap:8px; justify-content:center;">
  <button id="modBtn" class="calculator-operation">%</button>
  <button id="sqrtBtn" class="calculator-unary">√</button>
  <button id="squareBtn" class="calculator-unary">x²</button>
  <button id="cubeBtn" class="calculator-unary">x³</button>
  <button id="factBtn" class="calculator-unary">!</button>
</div>

<!-- JavaScript (JS) implementation of the calculator. -->
<script>
// initialize important variables to manage calculations
var firstNumber = null;
var operator = null;
var nextReady = true;
// build objects containing key elements
const output = document.getElementById("output");
const numbers = document.querySelectorAll(".calculator-number");
const operations = document.querySelectorAll(".calculator-operation");
const clear = document.querySelectorAll(".calculator-clear");
const equals = document.querySelectorAll(".calculator-equals");

// Number buttons listener
numbers.forEach(button => {
  button.addEventListener("click", function() {
    number(button.textContent);
  });
});

// Number action
function number (value) { // function to input numbers into the calculator
    if (value != ".") {
        if (nextReady == true) { // nextReady is used to tell the computer when the user is going to input a completely new number
            output.innerHTML = value;
            if (value != "0") { // if statement to ensure that there are no multiple leading zeroes
                nextReady = false;
            }
        } else {
            output.innerHTML = output.innerHTML + value; // concatenation is used to add the numbers to the end of the input
        }
    } else { // special case for adding a decimal; can't have two decimals
        if (output.innerHTML.indexOf(".") == -1) {
            output.innerHTML = output.innerHTML + value;
            nextReady = false;
        }
    }
}

// Operation buttons listener (binary ops)
operations.forEach(button => {
  button.addEventListener("click", function() {
    operation(button.textContent);
  });
});

// Modulus button (added)
const modBtn = document.getElementById('modBtn');
if (modBtn) modBtn.addEventListener('click', () => operation('%'));

// Unary sqrt
const sqrtBtn = document.getElementById('sqrtBtn');
if (sqrtBtn) sqrtBtn.addEventListener('click', () => {
  // apply sqrt to current displayed value
  const cur = parseFloat(output.innerHTML);
  if (!Number.isFinite(cur) || cur < 0) {
    output.innerHTML = 'Error';
    nextReady = true;
    return;
  }
  const res = Math.sqrt(cur);
  output.innerHTML = formatNumber(res);
  nextReady = true;
});

// Square, Cube, Factorial handlers
const squareBtn = document.getElementById('squareBtn');
if (squareBtn) squareBtn.addEventListener('click', () => {
  const cur = parseFloat(output.innerHTML);
  if (!Number.isFinite(cur)) { output.innerHTML = 'Error'; nextReady = true; return; }
  const res = cur * cur;
  output.innerHTML = formatNumber(res);
  nextReady = true;
});

const cubeBtn = document.getElementById('cubeBtn');
if (cubeBtn) cubeBtn.addEventListener('click', () => {
  const cur = parseFloat(output.innerHTML);
  if (!Number.isFinite(cur)) { output.innerHTML = 'Error'; nextReady = true; return; }
  const res = cur * cur * cur;
  output.innerHTML = formatNumber(res);
  nextReady = true;
});

const factBtn = document.getElementById('factBtn');
if (factBtn) factBtn.addEventListener('click', () => {
  const cur = parseFloat(output.innerHTML);
  // factorial only for non-negative integers and reasonably small
  if (!Number.isFinite(cur) || cur < 0 || Math.floor(cur) !== cur) { output.innerHTML = 'Error'; nextReady = true; return; }
  const n = Math.floor(cur);
  if (n > 20) { output.innerHTML = 'Error'; nextReady = true; return; }
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  output.innerHTML = formatNumber(f);
  nextReady = true;
});

// Operator action
function operation (choice) { // function to input operations into the calculator
  if (firstNumber == null) { // once the operation is chosen, the displayed number is stored into the variable firstNumber
    firstNumber = parseFloat(output.innerHTML);
    nextReady = true;
    operator = choice;
    return; // exits function
  }
  // occurs if there is already a number stored in the calculator
  firstNumber = calculate(firstNumber, parseFloat(output.innerHTML)); 
  operator = choice;
  output.innerHTML = formatNumber(firstNumber);
  nextReady = true;
}

// Calculator
function calculate (first, second) { // function to calculate the result of the equation
  let result = 0;
  switch (operator) {
    case "+":
      result = first + second;
      break;
    case "-":
      result = first - second;
      break;
    case "*":
      result = first * second;
      break;
    case "/":
      // handle divide by zero
      if (second === 0) return NaN;
      result = first / second;
      break;
    case "%":
      // modulus
      if (second === 0) return NaN;
      result = first % second;
      break;
    default: 
      result = second;
      break;
  }
  return result;
}

// Equals button listener
equals.forEach(button => {
  button.addEventListener("click", function() {
    equal();
  });
});

// Equal action
function equal () { // function used when the equals button is clicked; calculates equation and displays it
  firstNumber = calculate(firstNumber, parseFloat(output.innerHTML));
  output.innerHTML = formatNumber(firstNumber);
  nextReady = true;
}

// Clear button listener
clear.forEach(button => {
  button.addEventListener("click", function() {
    clearCalc();
  });
});

// A/C action
function clearCalc () { // clears calculator
    firstNumber = null;
    output.innerHTML = "0";
    nextReady = true;
}

// format number for display: handle large/small magnitudes and trim trailing zeros
function formatNumber(n) {
  if (!Number.isFinite(n)) return 'Error';
  // limit precision
  const abs = Math.abs(n);
  if ((abs !== 0 && abs < 1e-6) || abs >= 1e12) {
    return n.toExponential(6);
  }
  // show up to 10 decimal places, trim trailing zeros
  let s = (+n.toFixed(10)).toString();
  return s;
}
</script>

<!-- 
Vanta animations just for fun, load JS onto the page
-->
<script src="{{site.baseurl}}/assets/js/three.r119.min.js"></script>
<script src="{{site.baseurl}}/assets/js/vanta.halo.min.js"></script>
<script src="{{site.baseurl}}/assets/js/vanta.birds.min.js"></script>
<script src="{{site.baseurl}}/assets/js/vanta.net.min.js"></script>
<script src="{{site.baseurl}}/assets/js/vanta.rings.min.js"></script>

<script>
// setup vanta scripts as functions
var vantaInstances = {
  halo: VANTA.HALO,
  birds: VANTA.BIRDS,
  net: VANTA.NET,
  rings: VANTA.RINGS
};

// obtain a random vanta function
var vantaInstance = vantaInstances[Object.keys(vantaInstances)[Math.floor(Math.random() * Object.keys(vantaInstances).length)]];

// run the animation
vantaInstance({
  el: "#animation",
  mouseControls: true,
  touchControls: true,
  gyroControls: false
});
</script>
