import * as GameModel from "../model/game.js"
import * as Toast from "./toast.js"
import * as AddLevelDialog from "../dialogs/add-level-dialog.js";
import * as PlayLevelDialog from "../dialogs/play-level-dialog.js";

const PLAY_BUTTON_ICON_PATH = "M3 2l11 6-11 6V2z";
const PAUSE_BUTTON_ICON_PATH = "M3 2h3.5v12H3V2zm6.5 0H13v12H9.5V2z";

const playButton = document.getElementById("play-button");
const playIconPath = document.querySelector("#play-icon path");
const stopButton = document.getElementById("stop-button");

const timeSigNumerator = document.getElementById("time-signature-numerator");
const timeSigDenominator = document.getElementById("time-signature-denominator");

const bpmSlider = document.getElementById("bpm-slider");
const bpmDisplay = document.getElementById("bpm-display");

const metronomeButton = document.getElementById("metronome-button");

const exportButton = document.getElementById("export-button");
const exportStartButton = document.getElementById("export-button");
const exportCancelButton = document.getElementById("export-cancel-button");
const exportDialog = document.getElementById("export-dialog");

const addLevelButton = document.getElementById("add-level-button");
const playLevelButton = document.getElementById("play-level-button");

// Disable focus for all toolbar controls
document.querySelectorAll(".toolbar .control").forEach(control => {
  control.addEventListener("click", () => control.blur());
});

export function init() {
    timeSigNumerator.value = GameModel.session.timeSigNumerator;
    timeSigDenominator.value = GameModel.session.timeSigDenominator;
    bpmDisplay.textContent = `${GameModel.session.beatsPerMinute} BPM`;

    playButton.addEventListener("click", async () => {
        if (Tone.Transport.state === "stopped" || Tone.Transport.state === "paused") {
            GameModel.startPlayback();
            playIconPath.setAttribute("d", PAUSE_BUTTON_ICON_PATH);
        }
        else {
            GameModel.pausePlayback();
            playIconPath.setAttribute("d", PLAY_BUTTON_ICON_PATH);
        }
    });

    stopButton.addEventListener("click", () => {
        if (Tone.Transport.state === "stopped") {
            return;
        }

        GameModel.stopPlayback();
        playIconPath.setAttribute("d", PLAY_BUTTON_ICON_PATH);
    });

    bpmSlider.addEventListener("input", () => {
        GameModel.setBeatsPerMinute(parseInt(bpmSlider.value));
        bpmDisplay.textContent = `${bpmSlider.value} BPM`;
    });

    timeSigNumerator.addEventListener("change", () => {
        GameModel.setTimeSignatureNumerator(parseInt(timeSigNumerator.value));
    });

    timeSigDenominator.addEventListener("change", () => {
        GameModel.setTimeSignatureDenominator(parseInt(timeSigDenominator.value));
    });

    metronomeButton.addEventListener("click", (e) => {
        GameModel.toggleMetronomePlayback();
        metronomeButton.classList.toggle("active");
    });

    metronomeButton.addEventListener("mousedown", (e) => {
        e.preventDefault();
    });

    timeSigNumerator.addEventListener("keypress", (e) => {
        e.preventDefault();
    });

    timeSigDenominator.addEventListener("keypress", (e) => {
        e.preventDefault();
    });

    exportButton.addEventListener("click", () => {
        exportDialog.showModal();
    });

    exportCancelButton.addEventListener("click", () => {
        exportDialog.close();
    });

    addLevelButton.addEventListener("click", () => {
        AddLevelDialog.dialog.showModal();
    });

    playLevelButton.addEventListener("click", async () => {
        await PlayLevelDialog.populate();
        PlayLevelDialog.dialog.showModal();
    });

    document.addEventListener("keyup", (e) => {
        if (e.code === "Space") {
            playButton.click();
        }
    });
}