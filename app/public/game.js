let game = {
    pattern: [
        { trackID: 0, name: "Kick", steps: [] },
        { trackID: 1, name: "Snare", steps: [] },
        { trackID: 2, name: "Hat", steps: [] },
        { trackID: 3, name: "Tom", steps: [] }
    ],
    timeSigNumerator: 4,
    timeSigDenominator: 4,
    beatsPerMinute: 140
}

function calculateNumSteps() {
    const patternStepResolution = 16;
    return game.timeSigNumerator * (patternStepResolution / game.timeSigDenominator);
}

function renderSequencer() {
    const container = document.getElementById("sequencer");
    container.innerHTML = "";

    game.pattern.forEach((track, trackIndex) => {
        const trackRow = document.createElement("div");
        trackRow.className = "track";

        const trackHeader = document.createElement("div");
        trackHeader.className = "track-header";
        trackHeader.innerHTML = `<span class="track-name">${track.name}</span>`;

        const stepContainer = document.createElement("div");
        stepContainer.className = "step-container";

        const numSteps = calculateNumSteps();
        for (let stepIndex = 0; stepIndex < numSteps; ++stepIndex) {
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
        container.appendChild(trackRow);
    });
}

const patternStepResolution = 16;
const numSteps = calculateNumSteps();

for (let track of game.pattern) {
    track.steps = Array(numSteps).fill(false);
}

renderSequencer();
