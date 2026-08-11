import * as Game from "../game.js"
import * as Toast from "../view/toast.js"

export const dialog = document.getElementById("play-level-dialog");
const select = dialog.querySelector("#selected-level");
const description = dialog.querySelector("#description");
const playButton = dialog.querySelector("#play-button");
const closeButton = dialog.querySelector("#close-button");

let levels = [];
let selectedLevel = {};

export async function populate() {
    try {
        const response = await fetch("/api/levels");
        const body = await response.json();
        levels = body.levels;

        select.replaceChildren();
        for (const level of body.levels) {
            const option = document.createElement("option");
            option.value = level.id;
            option.textContent = level.title;
            select.appendChild(option);
        }
    }
    catch (e) {
        console.log("Error: ", e);
    }

    selectedLevel = levels.find(lvl => String(lvl.id) === select.value);
}

playButton.addEventListener("click", async (e) => {
    e.preventDefault();
    dialog.close();
    await Game.loadLevel(selectedLevel);
    Toast.showToast(`Playing level: ${selectedLevel.title} (check the description for more info)`);
});

closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.close();
});

select.addEventListener("change", () => {
    selectedLevel = levels.find(lvl => String(lvl.id) === select.value);
    description.textContent = level?.description ?? "";
});