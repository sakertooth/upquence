import * as Game from "../game.js"
import * as Toast from "../view/toast.js"
import { audioBufferToWav } from "../util.js"

export const dialog = document.getElementById("export-dialog");

const form = dialog.querySelector("form");
const filenameControl = dialog.querySelector("#filename");
const startButton = dialog.querySelector("#start-button");
const cancelButton = dialog.querySelector("#cancel-button");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const buffer = await Game.startExport(Game.session.data);
    const wav = audioBufferToWav(buffer);
    const wavBlob = new Blob([wav], {
        type: "audio/wav"
    });

    const url = URL.createObjectURL(wavBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenameControl.value}.wav`;
    link.click();
    URL.revokeObjectURL(url);

    dialog.close();
    Toast.showToast("Pattern successfully exported!");
});

cancelButton.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.close();
});