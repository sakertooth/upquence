export const dialog = document.querySelector("#info-dialog");
const closeButton = dialog.querySelector("#close-button");

closeButton.addEventListener("click", () => {
    dialog.close();
});