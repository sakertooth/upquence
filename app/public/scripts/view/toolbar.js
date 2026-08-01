import * as GameModel from "../model/game.js"

const PLAY_BUTTON_ICON_PATH = "M3 2l11 6-11 6V2z";
const PAUSE_BUTTON_ICON_PATH = "M3 2h3.5v12H3V2zm6.5 0H13v12H9.5V2z";

const playButton = document.getElementById("play-button");
const playIconPath = document.querySelector("#play-icon path");
const stopButton = document.getElementById("stop-button");

const timeSigNumerator = document.getElementById("top-fraction");
const timeSigDenominator = document.getElementById("bottom-fraction");
const timeSigNumeratorSlider = document.getElementById("numeratorSlider");
const timeSigDenominatorSlider = document.getElementById("denominatorSlider");

const bpm = document.getElementById("bpm");

const metronomeButton = document.getElementById("metronome-button");
const metronomePlayer = new Tone.Player({url: "../sounds/metronome.mp3"}).toDestination();
let metronomeLoopID = -1;

export function init() {
    playButton.addEventListener("click", async () => {
        if (Tone.Transport.state === "stopped" || Tone.Transport.state === "paused") {
            Tone.Transport.start();
            playIconPath.setAttribute("d", PAUSE_BUTTON_ICON_PATH);
        }
        else {
            Tone.Transport.pause();
            playIconPath.setAttribute("d", PLAY_BUTTON_ICON_PATH);
        }
    });

    stopButton.addEventListener("click", () => {
        if (Tone.Transport.state === "stopped") {
            return;
        }

        Tone.Transport.stop();
        playIconPath.setAttribute("d", PLAY_BUTTON_ICON_PATH);
    });

    timeSigNumerator.textContent = GameModel.session.timeSigNumerator;
    timeSigDenominator.textContent = GameModel.session.timeSigDenominator;
    timeSigNumeratorSlider.value = GameModel.session.timeSigNumerator;
    timeSigDenominatorSlider.value = GameModel.session.timeSigDenominator;

    timeSigNumeratorSlider.addEventListener("input", () => {
        let numerator = Number(timeSigNumeratorSlider.value);
        timeSigNumerator.textContent = numerator;
        GameModel.session.timeSigNumerator = numerator;
    });

    timeSigDenominatorSlider.addEventListener("input", () => {
        let denominator = Number(timeSigDenominatorSlider.value);
        timeSigDenominator.textContent = denominator;
        GameModel.session.timeSigDenominator = denominator;
    });

    bpm.textContent = Tone.Transport.bpm.value + "bpm";

    metronomeButton.addEventListener("click", () => {
        if (metronomeLoopID === -1) {
            metronomeLoopID = setInterval(() => {
                metronomePlayer.start();
            }, (60 / Tone.Transport.bpm.value) * 1000);
        } else {
            clearInterval(metronomeLoopID);
            metronomeLoopID = -1
        }
    });

    document.addEventListener("keyup", (e) => {
        if (e.code === "Space") {
            playButton.click();
        }
    });
}