// script.js

let interval;
let startTime;
let elapsedTime = 0; // in milliseconds
let isRunning = false;

const timeDisplay = document.getElementById('time');
const costDisplay = document.getElementById('cost');
const personenInput = document.getElementById('personen');
const stundenlohnInput = document.getElementById('stundenlohn');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

// Format time into hh:mm:ss
function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Calculate cost based on elapsed time, number of people, and hourly wage
function calculateCost(ms) {
    let hours = ms / 3600000;
    let personen = parseInt(personenInput.value) || 1;
    let stundenlohn = parseFloat(stundenlohnInput.value) || 0;
    
    return (hours * personen * stundenlohn).toFixed(2);
}

// Start the timer
startButton.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        
        interval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            timeDisplay.textContent = formatTime(elapsedTime);
            costDisplay.textContent = calculateCost(elapsedTime);
        }, 100);
    }
});

// Stop the timer
stopButton.addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        clearInterval(interval);
    }
});
