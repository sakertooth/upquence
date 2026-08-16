import * as Events from "../events.js"
import * as Game from "../game.js"
import * as Toast from "./toast.js"
import * as PlayLevelDialog from "../dialogs/play-level-dialog.js";
import * as ExportDialog from "../dialogs/export-dialog.js";
import { validateUpload } from "../util/validate-upload.js";

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
const exportDialog = document.getElementById("export-dialog");

const playLevelButton = document.getElementById("play-level-button");
const listenToLevelButton = document.getElementById("listen-to-level-button");
const submitPatternButton = document.getElementById("submit-pattern-button");
const levelDescriptionButton = document.getElementById("level-description-button");

const downloadButton = document.getElementById("download-button");
const uploadButton = document.getElementById("upload-button");
const uploadFileInput = document.getElementById("upload-file-input");

let descriptionOpened = false;

Events.on("onInitialized", update);
Events.on("onDataUploaded", update);

function update(data) {
    timeSigNumerator.value = data.timeSigNumerator;
    timeSigDenominator.value = data.timeSigDenominator;
    bpmSlider.value = data.beatsPerMinute;
    bpmDisplay.textContent = `${data.beatsPerMinute} BPM`;
}

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
    ExportDialog.dialog.showModal();
});

playLevelButton.addEventListener("click", async () => {
    await PlayLevelDialog.populate();
    PlayLevelDialog.dialog.showModal();
});

downloadButton.addEventListener("click", () => {
    const upquenceData = new Blob([JSON.stringify(Game.session.sandboxData)], { type: "application/json" });
    const downloadURL = URL.createObjectURL(upquenceData);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadURL;
    downloadLink.download = "upquence_sequencer_data";
    downloadLink.click();
    URL.revokeObjectURL(downloadURL);
});

uploadButton.addEventListener("click", (e) => {
    e.preventDefault();
    uploadFileInput.click();
});

uploadFileInput.addEventListener("change", async (e) => {
    if (uploadFileInput.files.length === 0) {
        return;
    }

    const file = uploadFileInput.files[0];
    try {
        const text = await file.text();
        const json = JSON.parse(text);
        if (!validateUpload(json)) {
            return;
        }

        Game.setData(json);
        Toast.showToast("New pattern loaded!");
    } catch (error) {
        Toast.showToast("Invalid pattern file!");
        console.log("Error: ", error);
    }

    uploadFileInput.value = "";
});

listenToLevelButton.addEventListener("click", () => {
    if (Game.session.levelData === null) { return; }
    Game.listenToLevel();
    Toast.showToast("Listen for the pattern...");
});

submitPatternButton.addEventListener("click", () => {
    const score = Game.gradeLevel();

    Toast.showToast(Object.hasOwn("invalid") ?
        "A problem occurred when calculating your score." :
        `You scored a ${score.grade}%, ${score.passed ? "you passed!" : "you failed!"}`);

    Game.unloadLevel();
});

const overlay = document.createElement("div");
overlay.className = "description-overlay";

levelDescriptionButton.addEventListener("click", () => {
    if (Game.session.levelData === null) {
        return;
    } else if (descriptionOpened === true) {
        descriptionOpened = false;
        overlay.remove();
        return;
    }
    descriptionOpened = true;

    overlay.textContent = Game.getLevelDescription();
    document.body.appendChild(overlay);
})

document.addEventListener("keydown", (e) => {
    if (e.code !== "Space") {
        return;
    }

    if (document.querySelector("dialog[open]")) {
        return;
    }

    const target = event.target;

    if (target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement) {
        return;
    }

    e.preventDefault();
    playButton.click();
});
