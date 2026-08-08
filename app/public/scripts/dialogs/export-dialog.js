import * as Game from "../game.js"

export const dialog = document.getElementById("export-dialog");

const form = dialog.querySelector("form");
const startButton = dialog.querySelector("#start-button");
const cancelButton = dialog.querySelector("#cancel-button");

form.addEventListener("submit", () => {
    // TODO: Export
});

cancelButton.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.close();
});