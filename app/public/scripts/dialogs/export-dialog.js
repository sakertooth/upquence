import * as Game from "../game.js"
import * as Toast from "../view/toast.js"

export const dialog = document.getElementById("export-dialog");

const form = dialog.querySelector("form");
const startButton = dialog.querySelector("#start-button");
const cancelButton = dialog.querySelector("#cancel-button");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const buffer = await Game.startExport(Game.session.data);
    console.log(buffer);

    dialog.close();
    Toast.showToast("Pattern successfully exported!");
});

cancelButton.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.close();
});