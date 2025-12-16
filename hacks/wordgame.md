---
layout: opencs
title: Word Game
permalink: /wordgame
---

<style>
    #wordCanvas { 
        border: 10px solid #000;
        display: block;
        margin-left: auto;
        margin-right: auto;
    }
    
    h2 {
        text-align: center;
        margin-top: 20px;
    }

    #options, #restart {
        margin-top: 20px;
        margin-bottom: 10px;
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        background-color: #007BFF;
        color: white;
        border-radius: 5px;
        cursor: pointer;
    }
</style>



<h2>Word Game</h2>
<p>Select a game mode (string length) from the options menu and try to type the prompt as quickly and accurately as possible!</p>

<div style="text-align: right;">
    <button id="restart">Restart</button>
    <button id="options">Options</button>
</div>

<p>WPM: <span class="wpm">0</span></p>
<p>Accuracy: <span class="accuracy">100%</span></p>

<canvas id="wordCanvas" width="800" height="200"></canvas>

<script>
    const wordCanvas = document.getElementById('wordCanvas');
    const wordCtx = wordCanvas.getContext('2d');
    const optionsButton = document.getElementById('options');
    const restartButton = document.getElementById('restart');

    let currentString = "";
    let userInput = "";
    let startTime = null;
    let finished = false;
    let mistakes = 0;
    let selectedString = "";

    const short_strings = [
        "The quick brown fox jumps over the lazy dog",
        "Pack my box with five dozen liquor jugs",
        "How quickly daft jumping zebras vex",
        "Jinxed wizards pluck ivy from the quilt",
        "Bright vixens jump, dozy fowl quack",
        "Sphinx of black quartz, judge my vow",
        "Two driven jocks help fax my big quiz",
        "Five quacking zephyrs jolt my wax bed",
        "The five boxing wizards jump quickly",
        "Jackdaws love my big sphinx of quartz"
    ];

    const medium_strings = [
        "Amazingly few discotheques provide jukeboxes",
        "Back in June we delivered oxygen equipment of the same size",
        "The public was amazed to view the quickness and dexterity of the juggler",
        "Jovial zanies quickly gave up their quest for the exotic fish",
        "The wizard quickly jinxed the gnomes before they vaporized",
        "All questions asked by five watched experts amaze the judge",
        "The job requires extra pluck and zeal from every young wage earner",
        "Crazy Frederick bought many very exquisite opal jewels",
        "We promptly judged antique ivory buckles for the next prize",
        "Sixty zippers were quickly picked from the woven jute bag"
    ];

    const long_strings = [
        "The wizard quickly jinxed the gnomes before they vaporized just beyond the village gates",
        "Heavy boxes perform quick waltzes and jigs while the young fox plays his fiddle nearby",
        "My faxed joke won a pager in the cable TV quiz show, making everyone in the room laugh",
        "Back in the quaint valley, jovial hikers mixed exotic fruit juice and warm bread by the campfire",
        "The public was amazed to view the quickness and dexterity of the juggler as he performed his tricks",
        "Amazingly few discotheques provide jukeboxes, making it hard for music lovers to enjoy their favorite tunes",
        "We promptly judged antique ivory buckles for the next prize in the competition, impressing all the judges",
        "Crazy Frederick bought many very exquisite opal jewels from the ancient market in the old town square",
        "Sixty zippers were quickly picked from the woven jute bag by the skilled tailor in the bustling city",
        "Back in June we delivered oxygen equipment of the same size and shape to all the hospitals in the region"
    ];

    function wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            if (wordCtx.measureText(currentLine + ' ' + word).width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    function drawUserText(prompt, input) {
        wordCtx.clearRect(0, 0, wordCanvas.width, wordCanvas.height);
        wordCtx.font = '24px Arial';
        wordCtx.textAlign = 'left';

        const maxWidth = wordCanvas.width - 20;
        const lineHeight = 30;
        const lines = wrapText(prompt, maxWidth);
        const startY = (wordCanvas.height - lines.length * lineHeight) / 2;

        lines.forEach((line, lineIndex) => {
            const lineY = startY + lineIndex * lineHeight;
            const lineX = (wordCanvas.width - wordCtx.measureText(line).width) / 2;

            wordCtx.fillStyle = '#dedede';
            wordCtx.fillText(line, lineX, lineY);

            let currentX = lineX;
            const startCharIndex = lines.slice(0, lineIndex).join(' ').length + (lineIndex > 0 ? 1 : 0);
            const endCharIndex = startCharIndex + line.length;

            for (let i = startCharIndex; i < Math.min(input.length, endCharIndex); i++) {
                const char = input[i];
                const promptChar = prompt[i];
                wordCtx.fillStyle = char === promptChar ? 'green' : 'red';
                wordCtx.fillText(char, currentX, lineY);
                currentX += wordCtx.measureText(promptChar).width;
            }

            // 🔵 Highlight current character position
            if (input.length < prompt.length) {
                const cursorIndex = input.length;
                if (cursorIndex >= startCharIndex && cursorIndex < endCharIndex) {
                    const cursorX =
                        lineX +
                        wordCtx.measureText(prompt.slice(startCharIndex, cursorIndex)).width;

                    wordCtx.strokeStyle = 'blue';
                    wordCtx.lineWidth = 2;
                    wordCtx.beginPath();
                    wordCtx.moveTo(cursorX, lineY + 5);
                    wordCtx.lineTo(
                        cursorX + wordCtx.measureText(prompt[cursorIndex]).width,
                        lineY + 5
                    );
                    wordCtx.stroke();
                }
            }
        });
    }

    function updateStats() {
        const totalTyped = userInput.length;
        const accuracy = totalTyped > 0
            ? Math.round(((totalTyped - mistakes) / totalTyped) * 100)
            : 100;

        document.querySelector('.accuracy').textContent = accuracy + '%';

        if (startTime) {
            const elapsed = (Date.now() - startTime) / 60000;
            const wpm = Math.round((selectedString.length / 5) / elapsed);
            document.querySelector('.wpm').textContent = isFinite(wpm) ? wpm : 0;
        }
    }

    function finishGame() {
        finished = true;
        updateStats();
        alert(`Finished! WPM: ${document.querySelector('.wpm').textContent}, Accuracy: ${document.querySelector('.accuracy').textContent}`);
    }

    function startGame() {
        if (!currentString) {
            alert("Please select a game mode.");
            return;
        }

        const pool = currentString === "short"
            ? short_strings
            : currentString === "medium"
            ? medium_strings
            : long_strings;

        selectedString = pool[Math.floor(Math.random() * pool.length)];
        userInput = "";
        mistakes = 0;
        finished = false;
        startTime = Date.now();

        drawUserText(selectedString, userInput);

        document.onkeydown = (e) => {
            if (finished) return;

            if (e.key.length === 1 && userInput.length < selectedString.length) {
                if (e.key !== selectedString[userInput.length]) mistakes++;
                userInput += e.key;
            } else if (e.key === "Backspace") {
                userInput = userInput.slice(0, -1);
            }

            drawUserText(selectedString, userInput);
            updateStats();

            if (userInput === selectedString) finishGame();
        };
    }

    restartButton.onclick = startGame;

    optionsButton.onclick = () => {
        const menu = document.createElement('div');
        Object.assign(menu.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            padding: '15px',
            border: '1px solid #ccc',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
        });

        ['short', 'medium', 'long'].forEach(type => {
            const btn = document.createElement('button');
            btn.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ' Strings';
            btn.style.display = 'block';
            btn.style.margin = '10px auto';
            btn.onclick = () => {
                currentString = type;
                startGame();
                document.body.removeChild(menu);
            };
            menu.appendChild(btn);
        });

        document.body.appendChild(menu);
    };
</script>




