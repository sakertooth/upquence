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

let playbackState = {
    currentStep: 0,
    players: [],
    metronomePlaying: false,
    metronomePlayer: null
}

let eventListeners = {
    onTimeSignatureChange: []
}

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
    playbackState.players = session.pattern.map(track => ({
        id: track.id,
        url: track.url,
        obj: new Tone.Player(track.url).toDestination()
    }));

    // Add metronome player
    playbackState.metronomePlayer = new Tone.Player({ url: "../sounds/metronome.mp3" }).toDestination();

    // Start game loop, set time signature and BPM, etc
    Tone.Transport.timeSignature = [session.timeSigNumerator, session.timeSigDenominator];
    Tone.Transport.bpm.value = session.beatsPerMinute;
    Tone.Transport.loop = true;
    Tone.Transport.setLoopPoints(0, "1m");
    Tone.Transport.scheduleRepeat((time) => renderLoop(time, playbackState), `${PATTERN_STEP_RESOLUTION}n`);
}

function renderLoop(time, state) {
    // Play tracks once you reach any active steps
    for (let track of session.pattern) {
        if (track.steps[state.currentStep]) {
            const player = state.players.find(p => p.url === track.url);
            player.obj.start(time);
        }
    }

    // Start playback of metronome if on a new beat
    if (state.metronomePlaying && state.currentStep % stepsPerBeat() == 0) {
        state.metronomePlayer.start(time);
    }

    state.currentStep = (state.currentStep + 1) % numSteps();
}

export function stepsPerBeat() {
    return PATTERN_STEP_RESOLUTION / session.timeSigDenominator;
}

export function numSteps() {
    return Math.floor(session.timeSigNumerator * stepsPerBeat());
}

export function currentStep() {
    return playbackState.currentStep;
}

export function startPlayback() {
    Tone.Transport.start();
}

export function pausePlayback() {
    Tone.Transport.pause();
}

export function stopPlayback() {
    playbackState.currentStep = 0;
    Tone.Transport.stop();
}

export function toggleMetronomePlayback() {
    playbackState.metronomePlaying = !playbackState.metronomePlaying;
    return playbackState.metronomePlaying;
}

export function setTimeSignature(numerator, denominator) {
    session.timeSigNumerator = numerator;
    session.timeSigDenominator = denominator;
    Tone.Transport.timeSignature = [session.timeSigNumerator, session.timeSigDenominator];
    Tone.Transport.setLoopPoints(0, "1m");

    for (let event of eventListeners.onTimeSignatureChange) {
        event(numerator, denominator);
    }
}

export function setBeatsPerMinute(bpm) {
    session.beatsPerMinute = bpm;
    Tone.Transport.bpm.value = bpm;
}

export function setTimeSignatureNumerator(numerator) {
    setTimeSignature(numerator, session.timeSigDenominator);
}

export function setTimeSignatureDenominator(denominator) {
    setTimeSignature(session.timeSigNumerator, denominator);
}

export function onTimeSignatureChange(callback) {
    eventListeners.onTimeSignatureChange.push(callback);
}

export function loadLevel(level) {
    // TODO: Implement
}