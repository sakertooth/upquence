// The note value for one step (e.g., 16 means one step is 16th note long)
export const PATTERN_STEP_RESOLUTION = 16;

// The default number of beats per measure (e.g., a value of 4 means 4 beats in one measure)
export const DEFAULT_TIME_SIG_NUMERATOR = 4;

// The default note value for a single beat (e.g., a value of 4 means each beat is a quarter note)
export const DEFAULT_TIME_SIG_DENOMINATOR = 4;

// The default number of beats per minute (e.g., a value of 140 means there are 140 beats that happen in one minute)
export const DEFAULT_BEATS_PER_MINUTE = 140;

// The default volume of a track in decibles
// A positive value increases the track's volume, a negative value decreases it
export const DEFAULT_TRACK_VOLUME = 0;

// The default panning of a track
// A positive value moves the sound to the right, a negative value to the left
export const DEFAULT_TRACK_PAN = 0;

// The default step amount you can increase and decrease track volume
export const DEFAULT_TRACK_VOLUME_STEP = 1;

// The default step amount you can pan left and right
export const DEFAULT_TRACK_PAN_STEP = 0.1;

// The minimum volume of a track in decibles
export const MIN_TRACK_VOLUME = -6;

// The maximum volume of a track in decibles
export const MAX_TRACK_VOLUME = 6;

// The minimum panning of a track in decibles
export const MIN_TRACK_PAN = -1;

// The maximum panning of a track in decibles
export const MAX_TRACK_PAN = 1;
