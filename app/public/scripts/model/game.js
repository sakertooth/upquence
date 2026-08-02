// The note value for one step (e.g., 16 means one step is 16th note long)
const PATTERN_STEP_RESOLUTION = 16;

// The default number of beats per measure (e.g., a value of 4 means 4 beats in one measure)
const DEFAULT_TIME_SIG_NUMERATOR = 4;

// The default note value for a single beat (e.g., a value of 4 means each beat is a quarter note)
const DEFAULT_TIME_SIG_DENOMINATOR = 4;

// The default number of beats per minute (e.g., a value of 140 means there are 140 beats that happen in one minute)
const DEFAULT_BEATS_PER_MINUTE = 140;

export let session = {
    pattern: [],
    timeSigNumerator: DEFAULT_TIME_SIG_NUMERATOR,
    timeSigDenominator: DEFAULT_TIME_SIG_DENOMINATOR,
    beatsPerMinute: DEFAULT_BEATS_PER_MINUTE
}

let trackPlayers = [];
let metronomePlaying = false;
let metronomePlayer = null;
let stepIndex = 0;
let timeSignatureChangeEvents = []

export async function init() {
    // Load default drum kit
    const soundCatalogResponse = await fetch("/sounds/catalog.json");
    const soundCatalogBody = await soundCatalogResponse.json();
    const defaultDrumkit = soundCatalogBody.drumkits.find(drumkit => drumkit.name === soundCatalogBody["default-drumkit"]);

    for (let soundID of defaultDrumkit.sounds) {
        const sound = soundCatalogBody.sounds.find(sound => sound.id === soundID);

        session.pattern = [...session.pattern,
        {
            name: sound.name,
            url: sound.url,
            steps: Array(PATTERN_STEP_RESOLUTION).fill(false)
        }]
    }

    // Create player objects for each track
    trackPlayers = session.pattern.map(track => ({
        id: track.id,
        url: track.url,
        obj: new Tone.Player(track.url).toDestination()
    }));

    // Add metronome player
    metronomePlayer = new Tone.Player({ url: "../sounds/metronome.mp3" }).toDestination();

    // Start game loop, set time signature and BPM, etc
    Tone.Transport.timeSignature = [session.timeSigNumerator, session.timeSigDenominator];
    Tone.Transport.bpm.value = session.beatsPerMinute;
    Tone.Transport.loop = true;
    Tone.Transport.setLoopPoints(0, "1m");
    Tone.Transport.scheduleRepeat((time) => {
        // Play tracks once you reach any active steps
        for (let track of session.pattern) {
            if (track.steps[stepIndex]) {
                const player = trackPlayers.find(p => p.url === track.url);
                player.obj.start(time);
            }
        }

        // Start playback of metronome if on a new beat
        if (metronomePlaying && stepIndex % stepsPerBeat() == 0) {
            metronomePlayer.start(time);
        }

        stepIndex = (stepIndex + 1) % numSteps();
    }, `${PATTERN_STEP_RESOLUTION}n`);
}

export function stepsPerBeat() {
    return PATTERN_STEP_RESOLUTION / session.timeSigDenominator;
}

export function numSteps() {
    return Math.floor(session.timeSigNumerator * stepsPerBeat());
}

export function currentStep() {
    return stepIndex;
}

export function toggleMetronomePlayback() {
    metronomePlaying = !metronomePlaying;
    return metronomePlaying;
}

export function setTimeSignature(numerator, denominator) {
    session.timeSigNumerator = numerator;
    session.timeSigDenominator = denominator;
    Tone.Transport.timeSignature = [session.timeSigNumerator, session.timeSigDenominator];
    Tone.Transport.setLoopPoints(0, "1m");

    for (let event of timeSignatureChangeEvents) {
        event(numerator, denominator);
    }
}

export function setTimeSignatureNumerator(numerator) {
    setTimeSignature(numerator, session.timeSigDenominator);
}

export function setTimeSignatureDenominator(denominator) {
    setTimeSignature(session.timeSigNumerator, denominator);
}

export function onTimeSignatureChange(callback) {
    timeSignatureChangeEvents.push(callback);
}
