import * as Game from "../game.js"
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

const downloadButton = document.getElementById("download-button");
const uploadButton = document.getElementById("upload-button");

export function init() {
    timeSigNumerator.value = Game.playbackSession.data.timeSigNumerator;
    timeSigDenominator.value = Game.playbackSession.data.timeSigDenominator;
    bpmDisplay.textContent = `${Game.playbackSession.data.beatsPerMinute} BPM`;

    playButton.addEventListener("click", async () => {
        if (Tone.Transport.state === "stopped" || Tone.Transport.state === "paused") {
            Game.startPlayback();
            playIconPath.setAttribute("d", PAUSE_BUTTON_ICON_PATH);
        }
        else {
            Game.pausePlayback();
            playIconPath.setAttribute("d", PLAY_BUTTON_ICON_PATH);
        }
    });

    stopButton.addEventListener("click", () => {
        if (Tone.Transport.state === "stopped") {
            return;
        }

        Game.stopPlayback();
        playIconPath.setAttribute("d", PLAY_BUTTON_ICON_PATH);
    });

    bpmSlider.addEventListener("input", () => {
        Game.setBeatsPerMinute(parseInt(bpmSlider.value));
        bpmDisplay.textContent = `${bpmSlider.value} BPM`;
    });

    timeSigNumerator.addEventListener("change", () => {
        Game.setTimeSignatureNumerator(parseInt(timeSigNumerator.value));
    });

    timeSigDenominator.addEventListener("change", () => {
        Game.setTimeSignatureDenominator(parseInt(timeSigDenominator.value));
    });

    metronomeButton.addEventListener("click", (e) => {
        Game.toggleMetronomePlayback();
        metronomeButton.classList.toggle("active");
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

    downloadButton.addEventListener("click", () => {
        const upquenceData = new Blob([JSON.stringify(Game.playbackSession.data)], { type: "application/json" });
        const downloadURL = URL.createObjectURL(upquenceData);
        const downloadLink = document.createElement("a");

        downloadLink.href = downloadURL;
        downloadLink.download = "upquence_sequencer_data";
        downloadLink.click();
        URL.revokeObjectURL(downloadURL);
    })

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            playButton.click();
        }
    });
}