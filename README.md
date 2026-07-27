# upquence

Upquence is a game using a music sequencer to reproduce given sequences heard via audio.
There will be two game modes supported: “Sandbox” and “Play”.

The sandbox mode allows players to freely make sequences, while the play mode is where they can play for individual levels. They can also upload their own files in this mode to make sequences using their own sounds. They can also play their own sequences.

In contrast, the play mode gamifies the sandbox mode. For each level, an audio track is played. The player’s task is to recreate the audio heard using the sequencer provided. Upon submission of their sequence, the user will receive points for how accurate their sequence is. The user will need to receive points passed a predefined threshold to move on to the next level. Multiple submissions do not accumulate points. The levels will progress in difficulty over time, with different challenges being introduced in each upcoming level.

# Guide
Run the server using `npm run start`.

# Data Layout

Sequence:
```js
{
    { trackID: 0, name: 'Kick', steps: [...] },
    { trackID: 1, name: 'Snare', steps: [...] },
    { trackID: 2, name: 'Shaker', steps: [...] },
    { trackID: 3, name: 'Tom', steps: [...] }
}
```

Each sequence contains a list of tracks. Each track has an `trackID`, as well as a `name` and the activated number of `steps`. Each track in a sequence is required to have the same number of `steps`. The values in `steps` for each track consist of `true` and `false` values for if that step is activated or not. In the case of a track having the incorrect number of steps, the step value is treated as `false` or ignored.