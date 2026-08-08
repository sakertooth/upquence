// The note value for one step (e.g., 16 means one step is 16th note long)
const PATTERN_STEP_RESOLUTION = 16;

// The default number of beats per measure (e.g., a value of 4 means 4 beats in one measure)
const DEFAULT_TIME_SIG_NUMERATOR = 4;

// The default note value for a single beat (e.g., a value of 4 means each beat is a quarter note)
const DEFAULT_TIME_SIG_DENOMINATOR = 4;

// The default number of beats per minute (e.g., a value of 140 means there are 140 beats that happen in one minute)
const DEFAULT_BEATS_PER_MINUTE = 140;

export let session = {
    data: {
        pattern: [],
        timeSigNumerator: DEFAULT_TIME_SIG_NUMERATOR,
        timeSigDenominator: DEFAULT_TIME_SIG_DENOMINATOR,
        beatsPerMinute: DEFAULT_BEATS_PER_MINUTE
    },
    levelData: {
        pattern: [],
        timeSigNumerator: DEFAULT_TIME_SIG_NUMERATOR,
        timeSigDenominator: DEFAULT_TIME_SIG_DENOMINATOR,
        beatsPerMinute: DEFAULT_BEATS_PER_MINUTE
    },
    state: {
        currentStep: 0,
        trackPlayers: [],
        metronomePlayer: false,
        metronomePlaying: false,
        playingLevel: false,
        levelBuffer: null
    },
    eventListeners: {
        onTimeSignatureChange: []
    }
}

export async function init() {
    // Load default drum kit
    const soundCatalogResponse = await fetch("/sounds/catalog.json");
    const soundCatalogBody = await soundCatalogResponse.json();
    const defaultDrumkit = soundCatalogBody.drumkits.find(drumkit => drumkit.name === soundCatalogBody["default-drumkit"]);

    for (let soundID of defaultDrumkit.sounds) {
        const sound = soundCatalogBody.sounds.find(sound => sound.id === soundID);

        session.data.pattern = [...session.data.pattern, {
            name: sound.name,
            url: sound.url,
            steps: Array(PATTERN_STEP_RESOLUTION).fill(false)
        }]
    }

    // Create player objects for each track
    session.state.trackPlayers = session.data.pattern.map(track => ({
        id: track.id,
        url: track.url,
        obj: new Tone.Player(track.url).toDestination()
    }));

    // Add metronome player
    session.state.metronomePlayer = new Tone.Player({ url: "../sounds/metronome.mp3" }).toDestination();

    // Start game loop, set time signature and BPM, etc
    Tone.Transport.timeSignature = [session.data.timeSigNumerator, session.data.timeSigDenominator];
    Tone.Transport.bpm.value = session.data.beatsPerMinute;
    Tone.Transport.loop = true;
    Tone.Transport.setLoopPoints(0, "1m");
    Tone.Transport.scheduleRepeat((time) => renderLoop(time), `${PATTERN_STEP_RESOLUTION}n`);
}

function renderLoop(time) {
    // Play tracks once you reach any active steps
    for (let track of session.data.pattern) {
        if (track.steps[session.state.currentStep]) {
            const player = session.state.trackPlayers.find(p => p.url === track.url);
            player.obj.start(time);
        }
    }

    // Play metronome on each new beat
    if (session.state.metronomePlaying && session.state.currentStep % stepsPerBeat() == 0) {
        session.state.metronomePlayer.start(time);
    }

    session.state.currentStep = (session.state.currentStep + 1) % numSteps();
}

export function stepsPerBeat() {
    return PATTERN_STEP_RESOLUTION / session.data.timeSigDenominator;
}

export function numSteps() {
    return Math.floor(session.data.timeSigNumerator * stepsPerBeat());
}

export function currentStep() {
    return session.state.currentStep;
}

export function startPlayback() {
    Tone.Transport.start();
}

export function pausePlayback() {
    Tone.Transport.pause();
}

export function stopPlayback() {
    session.state.currentStep = 0;
    Tone.Transport.stop();
}

export function toggleMetronomePlayback() {
    session.state.metronomePlaying = !session.state.metronomePlaying;
    return session.state.metronomePlaying;
}

export function setTimeSignature(numerator, denominator) {
    session.data.timeSigNumerator = numerator;
    session.data.timeSigDenominator = denominator;
    Tone.Transport.timeSignature = [session.data.timeSigNumerator, session.data.timeSigDenominator];
    Tone.Transport.setLoopPoints(0, "1m");

    for (let event of session.eventListeners.onTimeSignatureChange) {
        event(numerator, denominator);
    }
}

export function setBeatsPerMinute(bpm) {
    session.data.beatsPerMinute = bpm;
    Tone.Transport.bpm.value = bpm;
}

export function setTimeSignatureNumerator(numerator) {
    setTimeSignature(numerator, session.data.timeSigDenominator);
}

export function setTimeSignatureDenominator(denominator) {
    setTimeSignature(session.data.timeSigNumerator, denominator);
}

export function addEventListener(event, callback) {
    session.eventListeners[event].push(callback);
}

export function changeVolume(trackID, volume) {
    session.state.trackPlayers[trackID].obj.volume.value = volume;
}

export function loadLevel(level) {
    // TODO: Implement
}