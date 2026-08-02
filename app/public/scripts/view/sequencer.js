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
        trackRow.className = "sequencer-track";

        const trackHeader = document.createElement("div");
        trackHeader.className = "sequencer-track-header";
        trackHeader.innerHTML = `<span class="sequencer-track-name">${track.name}</span>`;

        const stepContainer = document.createElement("div");
        stepContainer.className = "sequencer-step-grid";

        for (let stepIndex = 0; stepIndex < GameModel.numSteps(); ++stepIndex) {
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

        trackRow.appendChild(trackHeader);
        trackRow.appendChild(stepContainer);
        sequencer.appendChild(trackRow);
    });

    requestAnimationFrame(update);
}

function update() {
    const currentStep = GameModel.currentStep();
    const stepContainer = sequencer.querySelectorAll(".sequencer-step-grid");

    stepContainer.forEach(container => {
        const stepCells = container.querySelectorAll(".sequencer-step");
        stepCells.forEach((cell, index) => {
            cell.classList.toggle("highlighted", Tone.Transport.state !== "stopped" && index === currentStep);
        });
    });

    requestAnimationFrame(update);
}
