export function validateUpload(file) {
    const upquenceObjects = ["pattern", "timeSigNumerator", "timeSigDenominator", "beatsPerMinute"];
    for (let [index, object] of upquenceObjects.entries()) {
        if (!Object.hasOwn(file, object)) {
            return false;
        } else if (index > 0) {
            if (!Number.isFinite(file[object])) {
                return false;
            }
        } else if (index == 0) {
            if (!Array.isArray(file[object])) {
                return false;
            }
        }
    }
    return true;
}