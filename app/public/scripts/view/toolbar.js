const PLAY_BUTTON_ICON_PATH = "M3 2l11 6-11 6V2z";
const PAUSE_BUTTON_ICON_PATH = "M3 2h3.5v12H3V2zm6.5 0H13v12H9.5V2z";

const playButton = document.getElementById("play-button");
const playIconPath = document.querySelector("#play-icon path");
const stopButton = document.getElementById("stop-button");

export function init() {
    playButton.addEventListener("click", async () => {
        if (Tone.Transport.state === "stopped" || Tone.Transport.state === "paused") {
            Tone.Transport.start();
            playIconPath.setAttribute("d", PAUSE_BUTTON_ICON_PATH);
        }
        else {
            Tone.Transport.pause();
            playIconPath.setAttribute("d", PLAY_BUTTON_ICON_PATH);
        }
    });

    stopButton.addEventListener("click", () => {
        if (Tone.Transport.state === "stopped") {
            return;
        }

        Tone.Transport.stop();
        playIconPath.setAttribute("d", PLAY_BUTTON_ICON_PATH);
    });

    document.addEventListener("keyup", (e) => {
        if (e.code === "Space") {
            playButton.click();
        }
    });
}