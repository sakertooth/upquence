import * as Events from "../events.js"
import * as Game from "../game.js"
import * as Constants from "../constants.js"
import * as Toast from "../view/toast.js"
import * as SaveSessionDialog from "../dialogs/save-session-dialog.js"

const sequencer = document.getElementById("sequencer");

const addTrackButton = document.getElementById("add-track-button");
const addTrackFileInput = document.getElementById("add-track-file-input");

const loadButton = document.querySelector("#sequencer-menu #load-button");
const saveButton = document.querySelector("#sequencer-menu #save-button");
const sequenceIdBox = document.querySelector("#sequencer-menu #sequence-id-input");

const saveDialog = document.querySelector("#save-dialog");

export let trackVolDisplays = [];
export let trackPanDisplays = [];

Events.on("onTimeSignatureChange", render);
Events.on("onDataUploaded", render);
Events.on("trackAdded", render);
Events.on("modeChanged", render);

export function render() {
    trackVolDisplays.length = 0;
    trackPanDisplays.length = 0;
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

        const trackVolumeSlider = document.createElement("input");
        trackVolumeSlider.className = "sequencer-track-slider";
        trackVolumeSlider.type = "range";
        trackVolumeSlider.min = Constants.MIN_TRACK_VOLUME;
        trackVolumeSlider.defaultValue = Constants.DEFAULT_TRACK_VOLUME;
        trackVolumeSlider.max = Constants.MAX_TRACK_VOLUME;
        trackVolumeSlider.step = Constants.DEFAULT_TRACK_VOLUME_STEP;

        const trackVolumeDisplay = document.createElement("div");
        trackVolumeDisplay.className = "sequencer-track-audio-display";
        trackVolumeDisplay.textContent = trackVolumeSlider.value + "dB";
        trackVolDisplays.push(trackVolumeDisplay);

        const trackAudioIndex = trackIndex;
        Game.changeVolume(trackAudioIndex, trackVolumeSlider.defaultValue);

        trackVolumeSlider.addEventListener("input", () => {
            Game.changeVolume(trackAudioIndex, Number.parseFloat(trackVolumeSlider.value));
            trackVolumeDisplay.textContent = trackVolumeSlider.value + "dB";
        });

        const trackPanKnob = document.createElement("div");
        trackPanKnob.className = "sequencer-track-knob";

        const trackPanKnobIndicator = document.createElement("div");
        trackPanKnobIndicator.className = "sequencer-track-knob-indicator";

        const minPan = Constants.MIN_TRACK_PANNING;
        const maxPan = Constants.MAX_TRACK_PANNING;
        const panStep = Constants.DEFAULT_TRACK_PANNING_STEP;
        const defaultPan = Constants.DEFAULT_TRACK_PANNING;

        const trackPanDisplay = document.createElement("div");
        trackPanDisplay.className = "sequencer-track-audio-display";
        trackPanDisplay.textContent = defaultPan;
        trackPanDisplays.push(trackPanDisplay);
        
        updatePan(defaultPan);
        function updatePan(value) {
            value = Math.max(minPan, Math.min(maxPan, value));
            value = Math.round(value * 10) / 10;
            Game.changePanning(trackAudioIndex, value);
            trackPanDisplay.textContent = value;

            const normalized = (value - minPan) / (maxPan - minPan);
            const angle = -135 + normalized * 270;
            trackPanKnobIndicator.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        }

        let dragging = false;
        let startY = 0;
        let startValue = 0;
        trackPanKnob.addEventListener("pointerdown", (event) => {
            dragging = true;
            startY = event.clientY;
            startValue = defaultPan;

            trackPanKnob.setPointerCapture(event.pointerId);
            trackPanKnob.classList.add("dragging");
        });

        trackPanKnob.addEventListener("pointermove", (event) => {
            if (!dragging) {
                return;
            }
            const sensitivity = (maxPan - minPan) / 100;
            const delta = startY - event.clientY;
            updatePan(startValue + delta * sensitivity);
        });

        trackPanKnob.addEventListener("pointerup", (event) => {
            dragging = false;
            trackPanKnob.releasePointerCapture(event.pointerId);
            trackPanKnob.classList.remove("dragging");
        });

        trackPanKnob.addEventListener("pointercancel", () => {
            dragging = false;
            trackPanKnob.classList.remove("dragging");
        });

        trackPanKnob.appendChild(trackPanKnobIndicator);
        trackRow.appendChild(trackHeader);
        trackRow.appendChild(stepContainer);
        trackRow.appendChild(trackVolumeSlider);
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
    Game.setData(session);
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