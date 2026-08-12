import * as Events from "../events.js"
import * as Game from "../game.js"

const sequencer = document.getElementById("sequencer");

Events.on("onInitialized", render);
Events.on("onTimeSignatureChange", render);
Events.on("onDataUploaded", render);

function render() {
    sequencer.innerHTML = "";
    Game.session.data.pattern.forEach((track, trackIndex) => {
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
        trackVolumeSlider.min = -40;
        trackVolumeSlider.defaultValue = Game.setDefaultTrackVolume();
        trackVolumeSlider.max = 40;

        const trackVolumeDisplay = document.createElement("div");
        trackVolumeDisplay.className = "sequencer-track-audio-display";
        trackVolumeDisplay.textContent = trackVolumeSlider.value + "dB";

        const trackAudioIndex = trackIndex;
        Game.changeVolume(trackAudioIndex, trackVolumeSlider.defaultValue);

        trackVolumeSlider.addEventListener("input", () => {
            Game.changeVolume(trackAudioIndex, trackVolumeSlider.value);
            trackVolumeDisplay.textContent = trackVolumeSlider.value + "dB";
        });

        const trackPanInput = document.createElement("input");
        trackPanInput.className = "sequencer-track-slider";
        trackPanInput.type = "range";
        trackPanInput.min = -1;
        trackPanInput.defaultValue = Game.setDefaultTrackPan();
        trackPanInput.max = 1;
        trackPanInput.step = 0.1;

        const trackPanDisplay = document.createElement("div");
        trackPanDisplay.className = "sequencer-track-audio-display";
        trackPanDisplay.textContent = trackPanInput.value;

        trackPanInput.addEventListener("input", () => {
            Game.changePanning(trackAudioIndex, trackPanInput.value);
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
