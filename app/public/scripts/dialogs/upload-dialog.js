import * as Game from "../game.js";
import * as Toast from "../view/toast.js";
import * as Sequencer from "../view/sequencer.js";
import * as Toolbar from "../view/toolbar.js";

export const dialog = document.getElementById("upload-dialog");

const form = dialog.querySelector("form");
const uploadFile = dialog.querySelector("#file-input");
const submitUploadButton = dialog.querySelector("#submit-upload-button");
const cancelButton = dialog.querySelector("#cancel-button");

function isUpquenceFile(file){
    const upquenceObjects = ["pattern", "timeSigNumerator", "timeSigDenominator", "beatsPerMinute"];

    for (let [index, object] of upquenceObjects.entries()){
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

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (uploadFile.files.length === 0) {
        alert("Select a file to upload!");
        return;
    }

    const fileDescription = uploadFile.files[0];
    if (fileDescription.type !== "application/json"){
        alert("Invalid file type!");
        return;
    }

    const file = JSON.parse(await fileDescription.text());
    console.log(file);

    if (!isUpquenceFile(file)){
        alert("Invalid file!");
        return;
    }

    Game.setSession(file);
    Sequencer.init();
    Toolbar.init();

    Toast.showToast("File Uploaded!");
    dialog.close();
});

cancelButton.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.close();
});