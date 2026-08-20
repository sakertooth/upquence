export const dialog = document.querySelector("#save-session-dialog");

const sequenceID = dialog.querySelector("#sequence-id");
const copyToClipboardButton = dialog.querySelector("#copy-to-clipboard-button");
const closeButton = dialog.querySelector("#close-button");

copyToClipboardButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(sequenceID.textContent);
});

closeButton.addEventListener("click", () => {
    dialog.close();
});

export function setID(id) {
    sequenceID.textContent = id;
}