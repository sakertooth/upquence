import * as Constants from "./constants.js"

export class SessionData {
    constructor() {
        this.pattern = [];
        this.timeSigNumerator = Constants.DEFAULT_TIME_SIG_NUMERATOR;
        this.timeSigDenominator = Constants.DEFAULT_TIME_SIG_DENOMINATOR;
        this.beatsPerMinute = Constants.DEFAULT_BEATS_PER_MINUTE;
    }

    get stepsPerBeat() {
        return Constants.PATTERN_STEP_RESOLUTION / this.timeSigDenominator;
    }

    get numSteps() {
        return Math.floor(this.timeSigNumerator * stepsPerBeatFor(this.timeSigDenominator));
    }
}