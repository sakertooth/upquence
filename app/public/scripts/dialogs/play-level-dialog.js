export const dialog = document.getElementById("play-level-dialog");
const selectedLevel = dialog.querySelector("#selected-level");
const description = dialog.querySelector("#description");
const playButton = dialog.querySelector("#play-button");
const closeButton = dialog.querySelector("#close-button");

let levels = []

export async function populate() {
    try {
        const response = await fetch("/api/levels");
        const body = await response.json();
        levels = body.levels;

        selectedLevel.replaceChildren();
        for (const level of body.levels) {
            const option = document.createElement("option");
            option.value = level.id;
            option.textContent = level.title;
            selectedLevel.appendChild(option);
        }
    }
    catch (e) {
        console.log("Error: ", e);
    }
}

playButton.addEventListener("click", (e) => {
    e.preventDefault();
});

closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.close();
});

selectedLevel.addEventListener("change", () => {
    const level = levels.find(lvl => String(lvl.id) === selectedLevel.value);
    description.textContent = level?.description ?? "";
});