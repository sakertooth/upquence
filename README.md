# upquence

Upquence is a game using a music sequencer to reproduce given sequences heard via audio.
There will be two game modes supported: “Sandbox” and “Play”.

The sandbox mode allows players to freely make sequences, while the play mode is where they can play for individual levels. They can also upload their own files in this mode to make sequences using their own sounds. They can also play their own sequences.

In contrast, the play mode gamifies the sandbox mode. For each level, an audio track is played. The player’s task is to recreate the audio heard using the sequencer provided. Upon submission of their sequence, the user will receive points for how accurate their sequence is. The user will need to receive points passed a predefined threshold to move on to the next level. Multiple submissions do not accumulate points. The levels will progress in difficulty over time, with different challenges being introduced in each upcoming level.

# Guide
Run the server using `npm run start`.

# Data Layout

```js
{
    { id: "example_kick", name: "Kick", url: ...., steps: [...] },
    { id: "example_snare", name: "Snare", url: ..., steps: [...] },
    { id: "example_shaker", name: "Shaker", url: ..., steps: [...] },
    { id: "example_tom", name: "Tom", url: ..., steps: [...] },
    timeSigNumerator: 4,
    timeSigDenominator: 4,
    beatsPerMinute: 140
}
```

Each sequence contains a list of tracks. Each track has a `id`, `name`, `url`, and `steps`. The `id` uniquely identifies the track, `name` provides the display name of a track, `url` stores the path to the audio file that is associated with the track, and `steps` stores the steps. The values in `steps` for each track consist of `true` and `false` values for if that step is activated or not. The number of steps for each track is based on the time signature of the session.

`timeSigNumerator` and `timeSigDenominator` specify the time signature, and `beatsPerMinute` specifies the tempo of the session in BPM.
