import * as Events from "../events.js"
import * as Game from "../game.js"
import * as Constants from "../constants.js"
import * as Toast from "../view/toast.js"
import * as Knob from "../view/knob.js"
import * as SaveSessionDialog from "../dialogs/save-session-dialog.js"

const sequencer = document.getElementById("sequencer");

const addTrackButton = document.getElementById("add-track-button");
const addTrackFileInput = document.getElementById("add-track-file-input");

const loadButton = document.querySelector("#sequencer-menu #load-button");
const saveButton = document.querySelector("#sequencer-menu #save-button");
const sequenceIdBox = document.querySelector("#sequencer-menu #sequence-id-input");

const saveDialog = document.querySelector("#save-dialog");

Events.on("onTimeSignatureChange", render);
Events.on("onDataUploaded", render);
Events.on("trackAdded", render);
Events.on("modeChanged", render);

export function render() {
    sequencer.innerHTML = "";

    Game.currentData().pattern.forEach((track, trackIndex) => {
        const trackRow = document.createElement("div");
        trackRow.className = "sequencer-track";

        const trackHeader = document.createElement("div");
        trackHeader.className = "sequencer-track-header";
        trackHeader.innerHTML = `<span class="sequencer-track-name">${track.name}</span>`;

        const stepContainer = document.createElement("div");
        stepContainer.className = "sequencer-step-grid";

        for (let stepIndex = 0; stepIndex < Game.numSteps(); ++stepIndex) {
            const step = document.createElement("div");
            step.className = "sequencer-step";

            if (stepIndex % Game.stepsPerBeat() == 0) {
                step.classList.add("start");
            }

            if (track.steps[stepIndex]) {
                step.classList.add("active");
            }

            step.addEventListener("click", () => {
                track.steps[stepIndex] = !track.steps[stepIndex];
                step.classList.toggle("active");
            });

            stepContainer.appendChild(step);
        }

        const trackVolumeKnob = Knob.createKnob(track.vol, Constants.MIN_TRACK_VOLUME, Constants.MAX_TRACK_VOLUME, Constants.DEFAULT_TRACK_VOLUME_STEP);
        const trackVolumeDisplay = document.createElement("div");
        trackVolumeDisplay.className = "sequencer-track-audio-display";
        trackVolumeDisplay.textContent = trackVolumeKnob.value + "dB";

        trackVolumeKnob.addEventListener("input", () => {
            Game.changeVolume(trackIndex, trackVolumeKnob.value);
            trackVolumeDisplay.textContent = trackVolumeKnob.value + "dB";
        });

        const trackPanDisplay = document.createElement("div");
        trackPanDisplay.className = "sequencer-track-audio-display";
        trackPanDisplay.textContent = track.pan;

        const trackPanKnob = Knob.createKnob(track.pan, Constants.MIN_TRACK_PAN, Constants.MAX_TRACK_PAN, Constants.DEFAULT_TRACK_PAN_STEP);
        trackPanKnob.addEventListener("input", (event) => {
            Game.changePan(trackIndex, trackPanKnob.value);
            trackPanDisplay.textContent = trackPanKnob.value;
        });

        trackRow.appendChild(trackHeader);
        trackRow.appendChild(stepContainer);
        trackRow.appendChild(trackVolumeKnob);
        trackRow.appendChild(trackVolumeDisplay);
        trackRow.appendChild(trackPanKnob);
        trackRow.appendChild(trackPanDisplay);
        sequencer.appendChild(trackRow);
    });

    requestAnimationFrame(update);
}

function update() {
    const currentStep = Game.currentStep();
    const stepContainer = sequencer.querySelectorAll(".sequencer-step-grid");

    stepContainer.forEach(container => {
        const stepCells = container.querySelectorAll(".sequencer-step");
        stepCells.forEach((cell, index) => {
            cell.classList.toggle("highlighted", Tone.Transport.state !== "stopped" && index === currentStep);
        });
    });

    requestAnimationFrame(update);
}

addTrackButton.addEventListener("click", (e) => {
    if (Game.session.currentMode !== Game.Mode.Sandbox) {
        Toast.showToast("You can only do this action in sandbox mode!")
        return;
    }

    e.preventDefault();
    addTrackFileInput.click();
});

addTrackFileInput.addEventListener("change", async () => {
    if (addTrackFileInput.files.length === 0) {
        return;
    }

    if (Game.session.currentMode !== Game.Mode.Sandbox) {
        Toast.showToast("You can only do this action in sandbox mode!");
        return;
    }

    const file = addTrackFileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/sounds", {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        Toast.showToast("Failed to upload sound!");
        return;
    }

    const sound = await response.json();
    await Game.addTrack(sound);
});

loadButton.addEventListener("click", async () => {
    const id = sequenceIdBox.value;
    const response = await fetch(`/api/sessions/${id}`);

    if (!response.ok) {
        Toast.showToast(`Failed to load session ${id}!`);
        return;
    }

    const session = await response.json();
    Game.loadSandboxData(session);
    Toast.showToast(`Loaded session ${id}!`);
});

saveButton.addEventListener("click", async () => {
    const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(Game.session.sandboxData)
    });

    if (!response.ok) {
        Toast.showToast(`Failed to save this session!`);
        return;
    }

    const json = await response.json();
    SaveSessionDialog.setID(json.id);
    SaveSessionDialog.dialog.showModal();
});