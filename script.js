document.addEventListener('DOMContentLoaded', function() {
    populateTimeDropdown();
});

// Variables and event listeners for the original meeting tracker with a timer
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
const resetButton = document.getElementById('resetButton');

// Elements for the non-timer calculator
const calcAttendeesInput = document.getElementById('calc-attendees');
const calcHourlyWageInput = document.getElementById('calc-hourly-wage');
const calcTimeSelect = document.getElementById('calc-time');
const calcCostDisplay = document.getElementById('calc-cost');
const calculateButton = document.getElementById('calculateButton');
const resetCalcButton = document.getElementById('resetCalcButton');

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

// Populate time dropdown with values from 0 to 8 hours in 15-minute increments
function populateTimeDropdown() {
    for (let i = 0; i <= 8 * 4; i++) { // 4 increments per hour up to 8 hours
        let minutes = i * 15;
        let hours = Math.floor(minutes / 60);
        let remainingMinutes = minutes % 60;
        let timeString = `${hours}:${String(remainingMinutes).padStart(2, '0')}`;
        let option = document.createElement('option');
        option.value = minutes / 60; // value in hours
        option.textContent = timeString + " hours";
        calcTimeSelect.appendChild(option);
    }
}

// Calculate cost based on selected time, attendees, and hourly wage
function calculateMeetingCost() {
    let attendees = parseInt(calcAttendeesInput.value) || 1;
    let hourlyWage = parseFloat(calcHourlyWageInput.value) || 0;
    let timeInHours = parseFloat(calcTimeSelect.value) || 0;

    let totalCost = attendees * hourlyWage * timeInHours;
    calcCostDisplay.textContent = totalCost.toFixed(2);
}

// Reset the non-timer calculator fields
function resetCalculator() {
    calcAttendeesInput.value = 1;
    calcHourlyWageInput.value = 0;
    calcTimeSelect.value = 0;
    calcCostDisplay.textContent = "0.00";
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

// Reset the timer and cost
resetButton.addEventListener('click', () => {
    isRunning = false;
    clearInterval(interval);
    elapsedTime = 0;
    timeDisplay.textContent = "00:00:00";
    costDisplay.textContent = "0.00";
});

// Calculate cost without timer when the "Calculate Cost" button is clicked
calculateButton.addEventListener('click', calculateMeetingCost);

// Reset fields in the non-timer calculator when the "Reset" button is clicked
resetCalcButton.addEventListener('click', resetCalculator);
