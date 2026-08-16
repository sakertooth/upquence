import * as Events from "./events.js"
import * as Constants from "./constants.js"
import * as Session from "./session.js"

const Mode = Object.freeze({
    Sandbox: "sandbox",
    Play: "play"
});

// TODO: Ongoing refactor
class Game {
    #sandboxData;
    #playData;
    #levelData;
    #mode;
    #playback;

    constructor() {
        this.#sandboxData = new Session.SessionData();
        this.#playData = new Session.SessionData();
        this.#levelData = new Session.SessionData();
        this.#mode = Mode.Sandbox;

        this.#playback = {
            currentStep: 0,
            players: {
                sandbox: [],
                play: [],
            },
            metronomePlayer: new Tone.Player({ url: "../sounds/metronome.mp3" }).toDestination(),
            metronomePlaying: false,
        };

        // Start game loop, set time signature and BPM, etc
        Tone.Transport.timeSignature = [this.#currentData.timeSigNumerator, this.#currentData.timeSignatureDenominator];
        Tone.Transport.bpm.value = this.#currentData.beatsPerMinute;
        Tone.Transport.loop = true;
        Tone.Transport.setLoopPoints(0, "1m");

        // Start schedule
        Tone.scheduleRepeat((time) => this.#renderStep, `${Constants.PATTERN_STEP_RESOLUTION}n`);
    }

    startPlayback() {
        Tone.start().then(() => Tone.Transport.start());
    }

    stopPlayback() {
        this.#playback.currentStep = 0;
        Tone.Transport.stop();
    }

    pausePlayback() {
        Tone.Transport.pause();
    }

    toggleMetronomePlayback() {
        this.#playback.metronomePlaying = !this.#playback.metronomePlaying;
    }

    addTrack(name, url) {
        this.#currentData.addTrack(name, url);
    }

    get timeSignatureNumerator() {
        return this.#currentData.timeSigNumerator;
    }

    get timeSignatureDenominator() {
        return this.#currentData.timeSigDenominator;
    }

    set timeSignatureNumerator(numerator) {
        this.#currentData.timeSigNumerator = numerator;
        Events.on("timesigchanged", numerator, this.#currentData.timeSigDenominator);
    }

    set timeSignatureDenominator(denominator) {
        this.#currentData.timeSigDenominator = denominator;
        Events.on("timesigchanged", this.#currentData.timeSigNumerator, denominator);
    }

    get stepsPerBeat() {
        return this.#currentData.stepsPerBeat;
    }

    get numSteps() {
        return this.#currentData.numSteps;
    }

    get beatsPerMinute() {
        return this.#currentData.beatsPerMinute;
    }

    set beatsPerMinute(beatsPerMinute) {
        this.#currentData.beatsPerMinute = beatsPerMinute;
        Tone.Transport.bpm.value = beatsPerMinute;
        Events.on("bpmchanged", beatsPerMinute);
    }

    get mode() {
        return this.#mode;
    }

    set mode(mode) {
        this.mode = mode;
        Events.on("modechanged", this.#currentData, mode);
    }

    get #currentData() {
        switch (this.#mode) {
            case Mode.Sandbox:
                return this.#sandboxData;
            case Mode.Play:
                return this.#playData;
        }
    }

    get #currentPlayers() {
        switch (this.#mode) {
            case Mode.Sandbox:
                return this.#playback.players.sandbox;
            case Mode.Play:
                return this.#playback.players.play;
        }
    }

    #renderStep(time) {
        for (let track of this.#currentData.pattern) {
            if (track.steps[step]) {
                const player = this.#currentPlayers.find(p => p.url === track.url);
                player.obj.start(time);
            }
        }

        this.#playback.currentStep = (this.#playback.currentStep + 1) % this.numSteps;
    }

    toJSON() {
        return JSON.stringify(this.sandboxData);
    }
}

export let session = {
    data: {
        pattern: [],
        timeSigNumerator: Constants.DEFAULT_TIME_SIG_NUMERATOR,
        timeSigDenominator: Constants.DEFAULT_TIME_SIG_DENOMINATOR,
        beatsPerMinute: Constants.DEFAULT_BEATS_PER_MINUTE
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
            steps: Array(numSteps()).fill(false),
            vol: Constants.DEFAULT_TRACK_VOLUME,
            pan: Constants.DEFAULT_TRACK_PAN
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

    }, `${Constants.PATTERN_STEP_RESOLUTION}n`);

    Events.emit("onInitialized", session.data);
}

async function createTrackPlayers(pattern) {
    const players = pattern.map(track => {
        const trackPlayer = new Tone.Player(track.url);
        const trackPan = new Tone.PanVol(Constants.DEFAULT_TRACK_PANNING, console.DEFAULT_TRACK_VOLUME).toDestination();
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
    return Constants.PATTERN_STEP_RESOLUTION / denominator;
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
    const secondsPerBeat = 60 / data.beatsPerMinute;
    const duration = 4 * data.timeSigNumerator * secondsPerBeat;

    const buffer = await Tone.Offline(async ({ transport }) => {
        let currentStep = 0;
        let trackPlayers = await createTrackPlayers(data.pattern);

        transport.timeSignature = [data.timeSigNumerator, data.timeSigDenominator];
        transport.bpm.value = data.beatsPerMinute;

        transport.scheduleRepeat(time => {
            renderStep(time, data, trackPlayers, currentStep);
            currentStep = (currentStep + 1) % numStepsFor(data.timeSigNumerator, data.timeSigDenominator);
        }, `${Constants.PATTERN_STEP_RESOLUTION}n`);
        transport.start(0);
    }, duration);

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

export function getLevelDescription() {
    return session.level.description;
}

export function unloadLevel() {
    session.level = null;
    session.playback.levelPlayer = null;
}

export function listenToLevel() {
    session.playback.levelPlayer?.start();
}

export async function addTrack(name, url) {
    session.data.pattern = [...session.data.pattern, {
        name: name,
        url: url,
        steps: Array(numSteps()).fill(false),
        vol: Constants.DEFAULT_TRACK_VOLUME,
        pan: Constants.DEFAULT_TRACK_PAN
    }];

    session.playback.trackPlayers = await createTrackPlayers(session.data.pattern);
    Events.emit("trackAdded", name, url);
}

function gradeLevelFor(data, level) {
    if (data.pattern.length !== level.pattern.length) {
        return { invalid: true, message: "invalid number of tracks" };
    }

    const sameTracks = data.pattern.map((dataTrack, dataTrackIndex) => {
        const levelTrack = level.pattern[dataTrackIndex];
        return dataTrack.name === levelTrack.name && dataTrack.steps.length === levelTrack.steps.length;
    });

    if (!sameTracks.every(same => same)) {
        return { invalid: true, message: "tracks are not the same" };
    }

    const timeSigMatchingFactor = 0.3;
    const stepMatchingFactor = 0.5;
    const bpmMatchingFactor = 0.2;

    let stepScore = 0;
    let maxStepScore = 0;
    let bpmScore = 0;
    let timeSigScore = 0;

    for (let trackIndex = 0; trackIndex < level.pattern.length; ++trackIndex) {
        for (let stepIndex = 0; stepIndex < level.pattern[0].steps.length; ++stepIndex) {
            const levelTrack = level.pattern[trackIndex];
            const levelStep = levelTrack.steps[stepIndex];

            if (levelStep) {
                ++maxStepScore;

                const dataTrack = data.pattern[trackIndex];
                const dataStep = dataTrack.steps[stepIndex];
                if (dataStep) {
                    ++stepScore;
                }
            }
        }
    }

    if (data.beatsPerMinute === level.beatsPerMinute) {
        ++bpmScore;
    }

    if (data.timeSigNumerator === level.timeSigNumerator) {
        ++timeSigScore;
    }

    if (data.timeSigNumerator === level.timeSigDenominator) {
        ++timeSigScore;
    }

    const totalStepGrade = stepMatchingFactor * (stepScore / maxStepScore);
    const totalTimeSigGrade = timeSigMatchingFactor * (timeSigScore / 2);
    const totalBpmGrade = bpmMatchingFactor * bpmScore;
    const totalGrade = (totalStepGrade + totalTimeSigGrade + totalBpmGrade) * 100;

    return {
        grade: totalGrade.toFixed(2),
        passed: totalGrade >= session.level.pointsRequired
    };
}

export function gradeLevel() {
    return gradeLevelFor(session.data, session.level);
}
