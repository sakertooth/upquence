// The note value for one step (e.g., 16 means one step is 16th note long)
const PATTERN_STEP_RESOLUTION = 16;

// The default number of beats per measure (e.g., a value of 4 means 4 beats in one measure)
const DEFAULT_TIME_SIG_NUMERATOR = 4;

// The default note value for a single beat (e.g., a value of 4 means each beat is a quarter note)
const DEFAULT_TIME_SIG_DENOMINATOR = 4;

// The default number of beats per minute (e.g., a value of 140 means there are 140 beats that happen in one minute)
const DEFAULT_BEATS_PER_MINUTE = 140;

export let playbackSession = null;

let metronomePlaying = false;
let metronomePlayer = null;

let eventListeners = {
    onTimeSignatureChange: []
}

export async function init() {
    playbackSession = createSession();

    // Load default drum kit
    const soundCatalogResponse = await fetch("/sounds/catalog.json");
    const soundCatalogBody = await soundCatalogResponse.json();
    const defaultDrumkit = soundCatalogBody.drumkits.find(drumkit => drumkit.name === soundCatalogBody["default-drumkit"]);

    for (let soundID of defaultDrumkit.sounds) {
        const sound = soundCatalogBody.sounds.find(sound => sound.id === soundID);

        playbackSession.data.pattern = [...playbackSession.data.pattern, {
            name: sound.name,
            url: sound.url,
            steps: Array(PATTERN_STEP_RESOLUTION).fill(false)
        }]
    }

    // Create player objects for each track
    playbackSession.state.players = playbackSession.data.pattern.map(track => ({
        id: track.id,
        url: track.url,
        obj: new Tone.Player(track.url).toDestination()
    }));

    // Add metronome player
    metronomePlayer = new Tone.Player({ url: "../sounds/metronome.mp3" }).toDestination();

    // Start game loop, set time signature and BPM, etc
    Tone.Transport.timeSignature = [playbackSession.data.timeSigNumerator, playbackSession.data.timeSigDenominator];
    Tone.Transport.bpm.value = playbackSession.data.beatsPerMinute;
    Tone.Transport.loop = true;
    Tone.Transport.setLoopPoints(0, "1m");
    Tone.Transport.scheduleRepeat((time) => {
        renderLoop(time, playbackSession);

        if (metronomePlaying && playbackSession.state.currentStep % stepsPerBeat() == 0) {
            metronomePlayer.start(time);
        }
    }, `${PATTERN_STEP_RESOLUTION}n`);
}

function renderLoop(time, session) {
    // Play tracks once you reach any active steps
    for (let track of session.data.pattern) {
        if (track.steps[session.state.currentStep]) {
            const player = session.state.players.find(p => p.url === track.url);
            player.obj.start(time);
        }
    }

    session.state.currentStep = (session.state.currentStep + 1) % numSteps();
}

function createSession() {
    return {
        data: {
            pattern: [],
            timeSigNumerator: DEFAULT_TIME_SIG_NUMERATOR,
            timeSigDenominator: DEFAULT_TIME_SIG_DENOMINATOR,
            beatsPerMinute: DEFAULT_BEATS_PER_MINUTE
        },
        state: {
            currentStep: 0,
            players: [],
            playing: false
        }
    };
}

export function stepsPerBeat() {
    return PATTERN_STEP_RESOLUTION / playbackSession.data.timeSigDenominator;
}

export function numSteps() {
    return Math.floor(playbackSession.data.timeSigNumerator * stepsPerBeat());
}

export function currentStep() {
    return playbackSession.state.currentStep;
}

export function startPlayback() {
    Tone.Transport.start();
}

export function pausePlayback() {
    Tone.Transport.pause();
}

export function stopPlayback() {
    playbackSession.state.currentStep = 0;
    Tone.Transport.stop();
}

export function toggleMetronomePlayback() {
    metronomePlaying = !metronomePlaying;
    return metronomePlaying;
}

export function setTimeSignature(numerator, denominator) {
    playbackSession.data.timeSigNumerator = numerator;
    playbackSession.data.timeSigDenominator = denominator;
    Tone.Transport.timeSignature = [playbackSession.data.timeSigNumerator, playbackSession.data.timeSigDenominator];
    Tone.Transport.setLoopPoints(0, "1m");

    for (let event of eventListeners.onTimeSignatureChange) {
        event(numerator, denominator);
    }
}

export function setBeatsPerMinute(bpm) {
    playbackSession.data.beatsPerMinute = bpm;
    Tone.Transport.bpm.value = bpm;
}

export function setTimeSignatureNumerator(numerator) {
    setTimeSignature(numerator, playbackSession.data.timeSigDenominator);
}

export function setTimeSignatureDenominator(denominator) {
    setTimeSignature(playbackSession.data.timeSigNumerator, denominator);
}

export function addEventListener(event, callback) {
    eventListeners[event].push(callback);
}

export function changeVolume(trackID, volume){
    playbackState.players[trackID].obj.volume.value = volume;
}

export function loadLevel(level) {
    // TODO: Implement
}