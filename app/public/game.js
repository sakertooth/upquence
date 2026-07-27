const PATTERN_STEP_RESOLUTION = 16;
const PLAY_BUTTON_ICON_PATH = "M3 2l11 6-11 6V2z";
const PAUSE_BUTTON_ICON_PATH = "M3 2h3.5v12H3V2zm6.5 0H13v12H9.5V2z";

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

let context = {
    playing: false
}

function calculateNumSteps() {
    return game.timeSigNumerator * (PATTERN_STEP_RESOLUTION / game.timeSigDenominator);
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

const numSteps = calculateNumSteps();
for (let track of game.pattern) {
    track.steps = Array(numSteps).fill(false);
}

renderSequencer();

let playButton = document.getElementById("play-button");
let playIconPath = document.querySelector("#play-icon path");

playButton.addEventListener("click", () => {
    context.playing = !context.playing;
    if (context.playing) {
        playIconPath.setAttribute("d", PLAY_BUTTON_ICON_PATH);
    }
    else {
        playIconPath.setAttribute("d", PAUSE_BUTTON_ICON_PATH);
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
        playButton.click();
    }
});
