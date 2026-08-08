import * as Game from "../game.js"

const sequencer = document.getElementById("sequencer");

export function init() {
    render();
    Game.onTimeSignatureChange(render);
}

function render() {
    sequencer.innerHTML = "";
    Game.playbackSession.pattern.forEach((track, trackIndex) => {
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
        trackVolumeSlider.className = "sequencer-track-volume-slider";
        trackVolumeSlider.type = "range";
        trackVolumeSlider.min = -40;
        trackVolumeSlider.defaultValue = 5;
        trackVolumeSlider.max = 40;

        const trackVolume = document.createElement("div");
        trackVolume.className = "sequencer-track-volume-display";
        trackVolume.textContent = trackVolumeSlider.value + "dB";

        const trackVolumeIndex = trackIndex;
        Game.changeVolume(trackVolumeIndex, trackVolumeSlider.defaultValue);

        trackVolumeSlider.addEventListener("input", () => {
            Game.changeVolume(trackVolumeIndex, trackVolumeSlider.value);
            
            trackVolume.textContent = trackVolumeSlider.value + "dB";
        });

        const trackPanning = document.createElement("div");
        trackPanning.className = "track-panning-knob";

        trackRow.appendChild(trackHeader);
        trackRow.appendChild(stepContainer);
        trackRow.appendChild(trackVolumeSlider);
        trackRow.appendChild(trackVolume);
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
