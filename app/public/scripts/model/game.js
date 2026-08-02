export const PATTERN_STEP_RESOLUTION = 16;
export const DEFAULT_TIME_SIG_NUMERATOR = 4;
export const DEFAULT_TIME_SIG_DENOMINATOR = 4;
export const DEFAULT_BEATS_PER_MINUTE = 140;

export let session = {
    pattern: [],
    timeSigNumerator: DEFAULT_TIME_SIG_NUMERATOR,
    timeSigDenominator: DEFAULT_TIME_SIG_DENOMINATOR,
    beatsPerMinute: DEFAULT_BEATS_PER_MINUTE
}

let trackPlayers = [];

let metronomePlaying = false;
let metronomePlayer = null;

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
        const step = currentStep();

        // Play tracks once you reach any active steps
        for (let track of session.pattern) {
            if (track.steps[step]) {
                const player = trackPlayers.find(p => p.url === track.url);
                player.obj.start(time);
            }
        }

        // Start playback of metronome if on a new beat
        if (metronomePlaying && step % stepsPerBeat() == 0) {
            metronomePlayer.start();
        }
    }, `${PATTERN_STEP_RESOLUTION}n`);
}

export function stepsPerBeat() {
    return PATTERN_STEP_RESOLUTION / session.timeSigNumerator;
}

export function numSteps() {
    return session.timeSigNumerator * stepsPerBeat();
}

export function currentStep() {
    const ticksPerStep = Tone.Transport.PPQ / stepsPerBeat();
    return Math.floor(Tone.Transport.ticks / ticksPerStep);
}

export function toggleMetronomePlayback() {
    metronomePlaying = !metronomePlaying;
    return metronomePlaying;
}
