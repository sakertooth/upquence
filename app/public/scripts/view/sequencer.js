import * as GameModel from "../model/game.js"

const sequencer = document.getElementById("sequencer");

export function init() {
    render();
    GameModel.onTimeSignatureChange(render);
}

function render() {
    sequencer.innerHTML = "";
    GameModel.session.pattern.forEach((track, trackIndex) => {
        const trackRow = document.createElement("div");
        trackRow.className = "track";

        const trackHeader = document.createElement("div");
        trackHeader.className = "track-header";
        trackHeader.innerHTML = `<span class="track-name">${track.name}</span>`;

        const stepContainer = document.createElement("div");
        stepContainer.className = "step-container";

        for (let stepIndex = 0; stepIndex < GameModel.numSteps(); ++stepIndex) {
            const step = document.createElement("div");
            step.className = "step";

            if (track.steps[stepIndex]) {
                step.classList.add("active");
            }

            step.addEventListener("click", () => {
                track.steps[stepIndex] = !track.steps[stepIndex];
                step.classList.toggle("active");
            });

            stepContainer.appendChild(step);
        }

        trackRow.appendChild(trackHeader);
        trackRow.appendChild(stepContainer);
        sequencer.appendChild(trackRow);
    });

    requestAnimationFrame(update);
}

function update() {
    const currentStep = GameModel.currentStep();
    const stepContainer = sequencer.querySelectorAll(".step-container");

    stepContainer.forEach(container => {
        const stepCells = container.querySelectorAll(".step");
        stepCells.forEach((cell, index) => {
            cell.classList.toggle("highlighted", Tone.Transport.state !== "stopped" && index === currentStep);
        });
    });

    requestAnimationFrame(update);
}
