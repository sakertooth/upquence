import * as Game from "../game.js"
import * as Toast from "../view/toast.js"

export const dialog = document.getElementById("add-level-dialog");

const form = dialog.querySelector("form");
const addButton = dialog.querySelector("#add-button");
const closeButton = dialog.querySelector("#close-button");
const titleControl = dialog.querySelector("#title");
const descriptionControl = dialog.querySelector("#description");
const pointsRequiredControl = dialog.querySelector("#points-required");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        const response = await fetch("/api/levels/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                level: Game.session.data,
                title: titleControl.value,
                description: descriptionControl.value,
                pointsRequired: pointsRequiredControl.value
            }),
        });

        if (response.status === 200) {
            const body = await response.json();
            Toast.showToast(body.message);
        }

    } catch (e) {
        console.log("Error: ", e);
    }

    dialog.close();
});

closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.close();
});