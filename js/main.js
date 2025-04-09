
/* ---------- Translations ---------- */
const translations = {
    en: {
        heading: "Psychic Layer Cleansing Calculator",
        tempLabel: "Choose your water temperature",
        chooseLayers: "Choose number of layers you want to clean",
        timeDuration: "Duration of standing in the water",
        minutes: "min",
        timerButtonStart: "Start Timer",
        waterTemperatureLabel: "Water temperature",
        totalTimeLabel: "Total time",
        layersCleanedLabel: "Layers cleaned",
        timerPause: "Pause timer",
        timerResume: "Resume timer",
        timerReset: "Cancel"
    },
    uk: {
        heading: "Калькулятор очищення психічних шарів",
        tempLabel: "Виберіть температуру води",
        chooseLayers: "Виберіть кількість шарів, які потрібно очистити",
        timeDuration: "Тривалість стояння у воді",
        minutes: "хв",
        timerButtonStart: "Запустити таймер",
        waterTemperatureLabel: "Температура води",
        totalTimeLabel: "Загальний час",
        layersCleanedLabel: "Шарів очищено",
        timerPause: "Пауза",
        timerResume: "Продовжити",
        timerReset: "Скинути"
    },
    ru: {
        heading: "Калькулятор очищения психических слоёв",
        tempLabel: "Виберите температуру воды",
        chooseLayers: "Выберите количество слоев, которые вы хотите очистить",
        timeDuration: "Продолжительность нахождения в воде",
        minutes: "мин",
        timerButtonStart: "Запустить таймер",
        waterTemperatureLabel: "Температура воды",
        totalTimeLabel: "Общее время",
        layersCleanedLabel: "Слоев очищено",
        timerPause: "Пауза",
        timerResume: "Продолжить",
        timerReset: "Сбросить"
    }
};
let currentLang = "en";
function updateTranslations() {
    document.getElementById("headingText").textContent = translations[currentLang].heading;
    document.getElementById("tempLabelContent").textContent = translations[currentLang].tempLabel;
    document.getElementById("chooseLayers").textContent = translations[currentLang].chooseLayers;
    document.getElementById("timeDuration").textContent = translations[currentLang].timeDuration;
    document.getElementById("minutes").textContent = translations[currentLang].minutes;
    document.getElementById("startTimerLabel").textContent = translations[currentLang].timerButtonStart;
    document.getElementById("waterTemperatureLabel").textContent = translations[currentLang].waterTemperatureLabel;
    document.getElementById("totalTimeLabel").textContent = translations[currentLang].totalTimeLabel;
    document.getElementById("resetButton").textContent = translations[currentLang].timerReset;
    document.getElementById("layersCleanedLabel").textContent = translations[currentLang].layersCleanedLabel;
    if (paused) {
        document.getElementById("pauseResumeButtonLabel").textContent = translations[currentLang].timerResume;
    } else {
        document.getElementById("pauseResumeButtonLabel").textContent = translations[currentLang].timerPause;
    }
    updateTime();
}
document.getElementById("langSelect").addEventListener("change", function () {
    currentLang = this.value;
    updateTranslations();
});

/* ---------- Temp ---------- */
function toCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
}
function toFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

/* ---------- Interpolation points ---------- */
const dataPoints = [
    { temp: 0, time: 1.3 },
    { temp: 8, time: 2.5 },
    { temp: 10, time: 2.8 },
    { temp: 12, time: 3.2 },
    { temp: 14, time: 3.6 },
    { temp: 16, time: 4.2 },
    { temp: 18, time: 5.0 },
    { temp: 19, time: 5.4 },
    { temp: 20, time: 6.0 },
    { temp: 21, time: 6.6 },
    { temp: 22, time: 7.5 },
    { temp: 23, time: 8.8 },
    { temp: 40, time: 30.9 }
];
function interpolateTime(temp) {
    if (temp <= dataPoints[0].temp) return dataPoints[0].time;
    if (temp >= dataPoints[dataPoints.length - 1].temp) return dataPoints[dataPoints.length - 1].time;
    for (let i = 0; i < dataPoints.length - 1; i++) {
        const t1 = dataPoints[i].temp, t2 = dataPoints[i + 1].temp;
        const time1 = dataPoints[i].time, time2 = dataPoints[i + 1].time;
        if (temp >= t1 && temp <= t2) {
            return time1 + ((temp - t1) * (time2 - time1)) / (t2 - t1);
        }
    }
}

/* ---------- Interface elemets ---------- */
const tempInput = document.getElementById('tempInput');
const tempNumber = document.getElementById('tempNumber');
const tempUnit = document.getElementById('tempUnit');
const layersTabs = document.getElementById('layersTabs');
const temperaturesTabs = document.getElementById('temperaturesTabs');
const timeDuration = document.getElementById('timeDuration');
const timeOutput = document.getElementById('timeOutput');
const startTimerButton = document.getElementById('startTimerButton');
const startTimerLabel = document.getElementById('startTimerLabel');
const pauseResumeButton = document.getElementById('pauseResumeButton');
const pauseResumeButtonLabel = document.getElementById('pauseResumeButtonLabel');
const resumeIcon = document.getElementById('resumeIcon');
const pauseIcon = document.getElementById('pauseIcon');
const resetButton = document.getElementById('resetButton');
const firstScreen = document.getElementById('firstScreen');
const secondScreen = document.getElementById('secondScreen');
const waterTemperatureValue = document.getElementById('waterTemperatureValue');
const totalTimeValue = document.getElementById('totalTimeValue');
const layersCleanedLabel = document.getElementById('layersCleanedLabel');
const layersCleaned = document.getElementById('layersCleaned');

/* ---------- Circular timer (SVG) ---------- */
const circularTimerSVG = document.getElementById('circularTimerSVG');
const circularProgress = document.getElementById('circularProgress');
const circularElapsedTime = document.getElementById('circularElapsedTime');

/* ---------- Circle params ---------- */
const circleRadius = 145;
const circleCircumference = 2 * Math.PI * circleRadius;

/* ---------- Main variables ---------- */
let internalTempC = 22.0;
let selectedLayers = 1;
let timerInterval = null;
let timerStart = null;
let totalTimerSeconds = 0;
let layerThresholds = [];
let triggeredLayers = [];
let paused = false;
let elapsedBeforePause = 0;

/* ---------- Sounds ---------- */
const layerSound = new Audio('./assets/sounds/layer-sound.mp3');
const finalSound = new Audio('./assets/sounds/final-sound.mp3');
let cleanedLayersCounter = 0

function playLayerSound() {
    try {
        layerSound.currentTime = 0;
        layerSound.play();
    } catch (e) {
        console.warn(e)
    }
    updateCleanedCounter();
    updateCleanedLayers();
}

function playFinalSound() {
    try {
        finalSound.currentTime = 0;
        finalSound.play();
    } catch (e) {
        console.warn(e)
    }
    updateCleanedCounter();
    updateCleanedLayers();
    pauseResumeButton.classList.add('hidden');
}

/* ---------- Controls ---------- */
function disableControls() {
    tempInput.disabled = true;
    tempNumber.disabled = true;
    tempUnit.disabled = true;
    document.querySelectorAll("#layersTabs .tab").forEach(tab => tab.classList.add("disabled"));
    document.querySelectorAll("#temperaturesTabs .tab").forEach(tab => tab.classList.add("disabled"));
}
function enableControls() {
    tempInput.disabled = false;
    tempNumber.disabled = false;
    tempUnit.disabled = false;
    document.querySelectorAll("#layersTabs .tab").forEach(tab => tab.classList.remove("disabled"));
    document.querySelectorAll("#temperaturesTabs .tab").forEach(tab => tab.classList.remove("disabled"));
}

/* ---------- Time formatting ---------- */
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const remainder = totalSeconds % 3600;
    const minutes = Math.floor(remainder / 60);
    const seconds = remainder % 60;
    if (hours > 0) {
        return hours.toString().padStart(2, '0') + ":" +
            minutes.toString().padStart(2, '0') + ":" +
            seconds.toString().padStart(2, '0');
    } else {
        return minutes.toString().padStart(2, '0') + ":" +
            seconds.toString().padStart(2, '0');
    }
}
function updateTime() {
    const tpl = interpolateTime(internalTempC);
    const totalTime = tpl * selectedLayers;
    const totalSeconds = Math.round(totalTime * 60);
    timeOutput.textContent = formatTime(totalSeconds);
    totalTimeValue.textContent = formatTime(totalSeconds);
}

/* ---------- Slider/number sync ---------- */
function onTempInputChange(newVal) {
    if (tempUnit.value === 'F') {
        internalTempC = toCelsius(newVal);
    } else {
        internalTempC = newVal;
    }
    updateDisplays();
    updateTime();
    updateSlider();
    updateSummary();
}
function updateDisplays() {
    if (tempUnit.value === 'C') {
        tempInput.min = 0;
        tempInput.max = 40;
        const displayVal = parseFloat(internalTempC.toFixed(1));
        tempInput.value = displayVal;
        tempNumber.value = displayVal;
    } else {
        tempInput.min = toFahrenheit(0);
        tempInput.max = toFahrenheit(40);
        const displayVal = parseFloat(toFahrenheit(internalTempC).toFixed(1));
        tempInput.value = displayVal;
        tempNumber.value = displayVal;
    }
}
function updateSlider() {
    let value = (tempInput.value - tempInput.min) / (tempInput.max - tempInput.min) * 100;
    tempInput.style.background = `linear-gradient(to right, var(--gray-100) ${value}%, var(--gray-200) ${value}%)`;
}
function updateSummary() {
    const celsius = parseFloat(internalTempC.toFixed(1));
    const fahrenheit = parseFloat(toFahrenheit(internalTempC).toFixed(1))

    waterTemperatureValue.innerHTML = `<b>${celsius}</b> °C / <b>${fahrenheit}</b> °F`
}

/* ---------- Event listeners ---------- */
tempInput.addEventListener('input', () => {
    const val = parseFloat(tempInput.value || 0.0);
    onTempInputChange(val);
});
tempNumber.addEventListener('input', () => {
    const val = parseFloat(tempNumber.value || 0.0);

    onTempInputChange(val);
});
layersTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
        const tabs = document.querySelectorAll("#layersTabs .tab");
        tabs.forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        selectedLayers = parseInt(e.target.getAttribute('data-layers'));
        animateTabBackground('layersTabs', e.target.getAttribute('data-transform'))
        updateTime();
        updateCleanedLayers();
    }
});
temperaturesTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
        const tabs = document.querySelectorAll("#temperaturesTabs .tab");
        tabs.forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        tempUnit.value = e.target.getAttribute('data-layers');
        animateTabBackground('temperaturesTabs', e.target.getAttribute('data-transform'))
        updateDisplays();
        updateTime();
    }
});

/* ---------- Animations ---------- */
function animateTabBackground(tabID, transform) {
    const tabBg = document.querySelectorAll("#" + tabID + " .tab-bg")[0];
    const tabBgElement = tabBg.children[0]
    tabBg.setAttribute('style', 'transform: translate(' + transform + '%)');
    tabBgElement.classList.add('scale-9', 'b-r-20');
    setTimeout(() => {
        tabBgElement.classList.remove('scale-9', 'b-r-20');
    }, 100)
}

/* ---------- Circular markers ---------- */
function createCircularLayerMarkers() {
    const paths = []

    for (let i = 0; i < circularTimerSVG.childNodes.length; i++) {
        if (circularTimerSVG.childNodes[i].nodeName === 'path') {
            paths.push(circularTimerSVG.childNodes[i])
            circularTimerSVG.childNodes[i].setAttribute('stroke', '#E4E4E4');
            circularTimerSVG.childNodes[i].setAttribute('stroke-width', '1.8');
        }
    }

    const step = paths.length / selectedLayers;

    for (let i = 0; i < paths.length; i++) {
        const index = Math.round(i * step);

        if (index < paths.length) {
            paths[index].setAttribute('stroke', 'var(--gray-100)');
            paths[index].setAttribute('stroke-width', '4');
        }
    }
}

function resetCleanedCounter() {
    cleanedLayersCounter = 0;
    updateCleanedLayers();
}

function updateCleanedCounter() {
    cleanedLayersCounter += 1
}

function updateCleanedLayers() {
    layersCleaned.textContent = `${cleanedLayersCounter} / ${selectedLayers}`
}

/* ---------- Timer ---------- */
function startTimer() {
    try {
        window.scrollTo(0, 0);
    } catch (e) {
        console.warn(e);
    }
    pauseResumeButton.classList.remove('hidden');
    resetCleanedCounter();
    firstScreen.classList.add('hide');
    secondScreen.classList.remove('hide');
    const tpl = interpolateTime(internalTempC);
    totalTimerSeconds = Math.round(tpl * selectedLayers * 60);

    disableControls();

    circularProgress.style.strokeDasharray = circleCircumference.toFixed(2);
    circularProgress.style.strokeDashoffset = circleCircumference.toFixed(2);
    createCircularLayerMarkers();

    circularElapsedTime.textContent = "00:00";

    paused = false;
    elapsedBeforePause = 0;
    timerStart = Date.now();

    timerInterval = setInterval(() => {
        let elapsed = paused
            ? elapsedBeforePause
            : ((Date.now() - timerStart) / 1000 + elapsedBeforePause);

        const fraction = Math.min(elapsed / totalTimerSeconds, 1);
        const offset = circleCircumference - fraction * circleCircumference;
        circularProgress.style.strokeDashoffset = Math.max(offset.toFixed(2), 20);

        circularElapsedTime.textContent = formatTime(Math.floor(elapsed));

        // Sounds
        layerThresholds.forEach((threshold, index) => {
            if (!triggeredLayers[index] && elapsed >= threshold) {
                triggeredLayers[index] = true;
                playLayerSound();
            }
        });

        if (elapsed >= totalTimerSeconds) {
            clearInterval(timerInterval);
            circularProgress.style.strokeDashoffset = "20";
            playFinalSound();
            enableControls();
        }
    }, 250);

    // Layer thresholds
    layerThresholds = [];
    triggeredLayers = [];
    for (let i = 1; i < selectedLayers; i++) {
        const threshold = i * totalTimerSeconds / selectedLayers;
        layerThresholds.push(threshold);
    }
}

/* ---------- Pause/Resume timer ---------- */
function pauseTimer() {
    paused = true;
    elapsedBeforePause += (Date.now() - timerStart) / 1000;
    clearInterval(timerInterval);
    pauseResumeButtonLabel.textContent = translations[currentLang].timerResume;
    pauseIcon.classList.add('hidden');
    resumeIcon.classList.remove('hidden');
}
function resumeTimer() {
    paused = false;
    timerStart = Date.now();
    pauseResumeButtonLabel.textContent = translations[currentLang].timerPause;
    resumeIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    timerInterval = setInterval(() => {
        let elapsed = paused
            ? elapsedBeforePause
            : ((Date.now() - timerStart) / 1000 + elapsedBeforePause);

        const fraction = Math.min(elapsed / totalTimerSeconds, 1);
        const offset = circleCircumference - fraction * circleCircumference;
        circularProgress.style.strokeDashoffset = Math.max(offset.toFixed(2), 20);

        circularElapsedTime.textContent = formatTime(Math.floor(elapsed));

        layerThresholds.forEach((threshold, index) => {
            if (!triggeredLayers[index] && elapsed >= threshold) {
                triggeredLayers[index] = true;
                playLayerSound();
            }
        });

        if (elapsed >= totalTimerSeconds) {
            clearInterval(timerInterval);
            circularProgress.style.strokeDashoffset = "20";
            playFinalSound();
            enableControls();
        }
    }, 250);
}

/* ---------- Reset ---------- */
function resetTimer() {
    resetCleanedCounter();
    resumeTimer();
    firstScreen.classList.remove('hide');
    secondScreen.classList.add('hide');
    clearInterval(timerInterval);
    paused = false;
    elapsedBeforePause = 0;
    enableControls();

    circularProgress.style.strokeDashoffset = circleCircumference.toFixed(2);
    circularElapsedTime.textContent = "00:00";
}

/* ---------- Timer buttons ---------- */
startTimerButton.addEventListener('click', startTimer);
pauseResumeButton.addEventListener('click', () => {
    if (!paused) {
        pauseTimer();
    } else {
        resumeTimer();
    }
});
resetButton.addEventListener('click', resetTimer);

/* ---------- Init ---------- */
updateDisplays();
updateTime();
updateTranslations();
updateSlider();
updateSummary();
updateCleanedLayers();