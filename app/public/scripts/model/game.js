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

export async function init() {
    const soundCatalogResponse = await fetch("/sounds/catalog.json");
    const soundCatalogBody = await soundCatalogResponse.json();

    const defaultDrumkit = soundCatalogBody.drumkits.find(drumkit => drumkit.name === soundCatalogBody["default-drumkit"]);
    for (let soundID of defaultDrumkit.sounds) {
        const sound = soundCatalogBody.sounds.find(sound => sound.id === soundID);

        session.pattern = [...session.pattern,
        {
            name: sound.name,
            steps: Array(PATTERN_STEP_RESOLUTION).fill(false)
        }]
    };
}

export function numSteps() {
    return session.timeSigNumerator * (PATTERN_STEP_RESOLUTION / session.timeSigDenominator);
}
