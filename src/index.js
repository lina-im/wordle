import { realDictionary } from './output.js';
const dictionary = realDictionary;
const state = {
    //wordle word
    secret: dictionary[Math.floor(Math.random() * dictionary.length)],
    grid: Array(6)
        .fill()
        .map(() => Array(5).fill("")),
    currentRow: 0,
    currentCol: 0,
};

function drawGrid (container) {
    const grid = document.createElement("div");
    grid.className = "grid";
    //rows
    for (let i = 0; i < 6; i++){
        //columns
        for (let j = 0; j < 5; j++) {
            drawBox(grid, i, j);
        }
    }
    container.appendChild(grid);
}

function updateGrid() {
    for (let i = 0; i < state.grid.length; i++) {
        for (let j = 0; j < state.grid[i].length; j++) {
            const box = document.getElementById(`box${i}${j}`);
            box.textContent = state.grid[i][j];
        }
    }
}

//container stores the letters, row/col = position, letter is displayed
function drawBox(container, row, col, letter = "") { 
    const box = document.createElement("div");
    //apply styles from CSS to box
    box.className = "box";
    box.id = `box${row}${col}`;
    //display empty or letter to box
    box.textContent = letter;
    container.appendChild(box);
    return box;
}

function registerKeyBoardEvents() {
    document.body.onkeydown = (e) => {
        if (state.currentRow >=6) return;
        const key = e.key;
        if (key === "Enter"){
            if (state.currentCol === 5) {
                const word = getCurrentWord();
                if (isWordValid(word)) {
                    revealWord(word);
                    state.currentRow++;
                    state.currentCol = 0;
                } 
                else {
                    alert("Not a valid word.");
                }
            }
        }
        if (key === "Backspace"){
            removeLetter();
        }
        //prevent spacebar from having any action
        else if (key === " "){
            e.preventDefault();
        }
        else if (isLetter(key)){
            addLetter(key);
        }
        updateGrid();
    }
    //source
    //https://www.queryselectorall.com/buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const letter = button.textContent;
            //close popup
            if (button.id === "play") {
                closePopup();  
                return; 
            }

            if (button.id === "backspace") {
                removeLetter();
            }
            else if (button.id === "enter") {
                if (state.currentCol === 5) {
                    const word = getCurrentWord();
                    if (isWordValid(word)) {
                        revealWord(word);
                        state.currentRow++;
                        state.currentCol = 0;
                    } 
                    else {
                        alert("Not a valid word.");
                    }
                }
            }
            else {
                addLetter(letter);
            }
            updateGrid();
            })
        })
}

function getCurrentWord() {
    return state.grid[state.currentRow].reduce((prev, curr) => prev + curr);
}

function isWordValid(word){
    return dictionary.includes(word);
}

function revealWord(guess){
    const row = state.currentRow; 
    //500 ms
    const animation_duration = 500;
    //get box associated with each letter and letter itself
    for (let i = 0; i < 5; i++){
        const box = document.getElementById(`box${row}${i}`);
        const letter = box.textContent;
        
        setTimeout(() => {
            //check if letter matches wordle letter
            if (letter === state.secret[i]){
                //shown as green (right)
                box.classList.add('right');
            } 
            //if secret word contains letter in diff position...
            else if (state.secret.includes(letter)){
                //shown as red (wrong)
                box.classList.add('wrong');
            }
            else {
                //if no letter is contained in the box
                box.classList.add("empty");
                
                const button = document.querySelector(`button[data-letter='${letter}']`);
                if (button) {
                    button.disabled = true;
                    button.style.backgroundColor = 'var(--empty)'; // Optional: Customize disabled button style
                    button.style.cursor = 'not-allowed';
                }
            }
        }, ((i+1)*animation_duration)/2);

        box.classList.add("animated");
        box.style.animationDelay = `${(i*animation_duration) / 2}ms`;
    }

    const isWinner = state.secret === guess;
    const isGameOver = state.currentRow === 5;

    setTimeout(() => {
        if (isWinner) {
            alert("Congratulations!");
            location.reload();
        }
        else if (isGameOver) {
            alert(`Better luck next time! The word was ${state.secret}.`);
            location.reload();
        }
    }, 3*animation_duration);
}

//check is the letter is 1 letter and between a-z
function isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
}

function addLetter(letter) {
    //check if button is disabled 
    const button = document.querySelector(`button[data-letter='${letter}']`);
    if (button && button.disabled) {
        return; 
    }
    //check if current row has any space left
    if (state.currentCol === 5) return;
    state.grid[state.currentRow][state.currentCol] = letter;
    //increase column number by 1
    state.currentCol++;
}

function removeLetter(){
    //check if there is any letter to remove
    if (state.currentCol === 0) return;
    //otherwise, replace the box with empty string
    state.grid[state.currentRow][state.currentCol - 1] = "";
    state.currentCol--;
}

function closePopup() {
    const popupBox = document.getElementById('popupBox');
    const playButton = document.getElementById('play');
    popupBox.style.display = 'none'; 
    playButton.style.display = 'none';
}

document.getElementById('play').addEventListener('click', function (e) {
    closePopup();  
})

//main function
function startup() { 
    const game = document.getElementById("game");
    drawGrid(game);
    registerKeyBoardEvents();
    openPopup();
}

startup();
