export const PATTERN_STEP_RESOLUTION = 16;

export let session = {
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

export function numSteps() {
    return session.timeSigNumerator * (PATTERN_STEP_RESOLUTION / session.timeSigDenominator);
}
