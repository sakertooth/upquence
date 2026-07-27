import * as GameModel from "./model/game.js"

function runSchedule(time) {
    const stepsPerBeat = GameModel.PATTERN_STEP_RESOLUTION / GameModel.session.timeSigDenominator;
    const ticksPerStep = Tone.Transport.PPQ / stepsPerBeat;
    const currentStep = Math.floor(Tone.Transport.ticks / ticksPerStep);
    const stepContainer = document.querySelectorAll("#sequencer .step-container");

    stepContainer.forEach(container => {
        const stepCells = container.querySelectorAll(".step");
        stepCells.forEach((cell, index) => {
            cell.classList.toggle("highlighted", index === currentStep);
        });
    });
}

export function init() {
    for (let track of GameModel.session.pattern) {
        track.steps = Array(GameModel.numSteps()).fill(false);
    }

    Tone.Transport.timeSignature = [GameModel.session.timeSigNumerator, GameModel.session.timeSigDenominator];
    Tone.Transport.bpm.value = GameModel.session.beatsPerMinute;
    Tone.Transport.loop = true;
    Tone.Transport.setLoopPoints(0, "1m");
    Tone.Transport.scheduleRepeat(runSchedule, "16n");
}
