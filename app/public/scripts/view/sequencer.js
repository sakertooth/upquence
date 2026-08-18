import * as Events from "../events.js"
import * as Game from "../game.js"
import * as Constants from "../constants.js"
import * as Toast from "../view/toast.js"

const sequencer = document.getElementById("sequencer");

const addTrackButton = document.getElementById("add-track-button");
const addTrackFileInput = document.getElementById("add-track-file-input");

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

        const trackAudioIndex = trackIndex;
        Game.changeVolume(trackAudioIndex, trackVolumeSlider.defaultValue);

        trackVolumeSlider.addEventListener("input", () => {
            Game.changeVolume(trackAudioIndex, Number.parseFloat(trackVolumeSlider.value));
            trackVolumeDisplay.textContent = trackVolumeSlider.value + "dB";
        });

        const trackPanInput = document.createElement("input");
        trackPanInput.className = "sequencer-track-slider";
        trackPanInput.type = "range";
        trackPanInput.min = Constants.MIN_TRACK_PANNING;
        trackPanInput.defaultValue = Constants.DEFAULT_TRACK_PANNING;
        trackPanInput.max = Constants.MAX_TRACK_PANNING;
        trackPanInput.step = Constants.DEFAULT_TRACK_PANNING_STEP;

        const trackPanDisplay = document.createElement("div");
        trackPanDisplay.className = "sequencer-track-audio-display";
        trackPanDisplay.textContent = trackPanInput.value;

        trackPanInput.addEventListener("input", () => {
            Game.changePanning(trackAudioIndex, Number.parseFloat(trackPanInput.value));
            trackPanDisplay.textContent = trackPanInput.value;
        });

        trackRow.appendChild(trackHeader);
        trackRow.appendChild(stepContainer);
        trackRow.appendChild(trackVolumeSlider);
        trackRow.appendChild(trackVolumeDisplay);
        trackRow.appendChild(trackPanInput);
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
    await Game.addTrack(file.name, URL.createObjectURL(file));
});