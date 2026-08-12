import * as Events from "./events.js"

// The note value for one step (e.g., 16 means one step is 16th note long)
export const PATTERN_STEP_RESOLUTION = 16;

// The default number of beats per measure (e.g., a value of 4 means 4 beats in one measure)
export const DEFAULT_TIME_SIG_NUMERATOR = 4;

// The default note value for a single beat (e.g., a value of 4 means each beat is a quarter note)
export const DEFAULT_TIME_SIG_DENOMINATOR = 4;

// The default number of beats per minute (e.g., a value of 140 means there are 140 beats that happen in one minute)
export const DEFAULT_BEATS_PER_MINUTE = 140;

// The default volume at which each track will be set (e.g., a value of 5 means that the track is playing with a volume of 5 decibels)
export const DEFAULT_TRACK_VOLUME = 5;

// The default pan at which each track will be set (e,g,. a value of 0 means the pan is in the middle)
export const DEFAULT_TRACK_PAN = 0;


export let session = {
    data: {
        pattern: [],
        timeSigNumerator: DEFAULT_TIME_SIG_NUMERATOR,
        timeSigDenominator: DEFAULT_TIME_SIG_DENOMINATOR,
        beatsPerMinute: DEFAULT_BEATS_PER_MINUTE
    },
    playback: {
        currentStep: 0,
        trackPlayers: [],
        metronomePlayer: false,
        metronomePlaying: false,
        levelPlayer: null,
    },
    level: null
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
            steps: Array(PATTERN_STEP_RESOLUTION).fill(false),
            vol: DEFAULT_TRACK_VOLUME,
            pan: DEFAULT_TRACK_PAN
        }]
    }

    // Create player objects for each track
    session.playback.trackPlayers = await createTrackPlayers(session.data.pattern);

    // Add metronome player
    session.playback.metronomePlayer = new Tone.Player({ url: "../sounds/metronome.mp3" }).toDestination();

    // Start game loop, set time signature and BPM, etc
    Tone.Transport.timeSignature = [session.data.timeSigNumerator, session.data.timeSigDenominator];
    Tone.Transport.bpm.value = session.data.beatsPerMinute;
    Tone.Transport.loop = true;
    Tone.Transport.setLoopPoints(0, "1m");
    Tone.Transport.scheduleRepeat((time) => {
        renderStep(time, session.data, session.playback.trackPlayers, session.playback.currentStep);

        // Play metronome on each new beat
        if (session.playback.metronomePlaying && session.playback.currentStep % stepsPerBeat() == 0) {
            session.playback.metronomePlayer.start(time);
        }

        session.playback.currentStep = (session.playback.currentStep + 1) % numSteps();

    }, `${PATTERN_STEP_RESOLUTION}n`);

    Events.emit("onInitialized", session.data);
}

async function createTrackPlayers(pattern) {
    const players = pattern.map(track => {
        const trackPlayer = new Tone.Player(track.url);
        const trackPan = new Tone.PanVol(0, 0).toDestination();
        trackPlayer.connect(trackPan);

        return {
            url: track.url,
            obj: trackPlayer,
            pan: trackPan
        };
    });

    await Tone.loaded();
    return players;
}

function renderStep(time, data, players, step) {
    // Play tracks once you reach any active steps
    for (let track of data.pattern) {
        if (track.steps[step]) {
            const player = players.find(p => p.url === track.url);
            player.obj.start(time);
        }
    }
}

function stepsPerBeatFor(denominator) {
    return PATTERN_STEP_RESOLUTION / denominator;
}

function numStepsFor(numerator, denominator) {
    return Math.floor(numerator * stepsPerBeatFor(denominator));
}

export function stepsPerBeat() {
    return stepsPerBeatFor(session.data.timeSigDenominator);
}

export function numSteps() {
    return numStepsFor(session.data.timeSigNumerator, session.data.timeSigDenominator);
}

export function currentStep() {
    return session.playback.currentStep;
}

export function startPlayback() {
    Tone.start().then(() => Tone.Transport.start());
}

export function pausePlayback() {
    Tone.Transport.pause();
}

export function stopPlayback() {
    session.playback.currentStep = 0;
    Tone.Transport.stop();
}

export function toggleMetronomePlayback() {
    session.playback.metronomePlaying = !session.playback.metronomePlaying;
    return session.playback.metronomePlaying;
}

export function setTimeSignature(numerator, denominator) {
    session.data.timeSigNumerator = numerator;
    session.data.timeSigDenominator = denominator;
    Tone.Transport.timeSignature = [session.data.timeSigNumerator, session.data.timeSigDenominator];
    Tone.Transport.setLoopPoints(0, "1m");
    Events.emit("onTimeSignatureChange", numerator, denominator);
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

export function changeVolume(trackID, volume) {
    session.playback.trackPlayers[trackID].obj.volume.value = volume;
    session.data.pattern[trackID].vol = volume;
}

export function changePanning(trackID, pan) {
    session.playback.trackPlayers[trackID].pan.pan.value = pan;
    session.data.pattern[trackID].pan = pan;
}

export async function startExport(data) {
    const buffer = await Tone.Offline(async ({ transport }) => {
        let currentStep = 0;
        let trackPlayers = await createTrackPlayers(data.pattern);

        transport.timeSignature = [data.timeSigNumerator, data.timeSigDenominator];
        transport.bpm.value = data.beatsPerMinute;

        transport.scheduleRepeat(time => {
            renderStep(time, data, trackPlayers, currentStep);
            currentStep = (currentStep + 1) % numStepsFor(data.timeSigNumerator, data.timeSigDenominator);
        }, `${PATTERN_STEP_RESOLUTION}n`);
        transport.start(0);
    }, Tone.Time("4m").toSeconds());

    return buffer;
}

export function setData(data) {
    Tone.Transport.timeSignature = [data.timeSigNumerator, data.timeSigDenominator];
    Tone.Transport.bpm.value = data.beatsPerMinute;
    session.data = data;
    Events.emit("onDataUploaded", data);
}

export async function loadLevel(data) {
    session.level = data;

    const buffer = await startExport(data);
    session.playback.levelPlayer = new Tone.Player(buffer).toDestination();

    await Tone.loaded();
}

export function unloadLevel() {
    session.level = null;
    session.playback.levelPlayer = null;
}

export function listenToLevel() {
    session.playback.levelPlayer?.start();
}
