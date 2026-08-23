export function createKnob(value, min, max, step) {
    let dragging = false;
    let startY = 0;
    let startValue = value;

    const knob = document.createElement("div");
    knob.value = value;
    knob.className = "sequencer-track-knob";

    const indicator = document.createElement("div");
    indicator.className = "sequencer-track-knob-indicator";

    knob.addEventListener("pointerdown", (event) => {
        dragging = true;
        startY = event.clientY;
        startValue = knob.value;

        knob.setPointerCapture(event.pointerId);
        knob.classList.add("dragging");
    });

    knob.addEventListener("pointermove", (event) => {
        if (!dragging) {
            return;
        }

        const sensitivity = (max - min) / 100;
        const delta = startY - event.clientY;
        const value = Math.round(Math.max(min, Math.min(max, startValue + delta * sensitivity)) * 10) / 10;

        const normalized = (value - min) / (max - min);
        const angle = -135 + normalized * 270;

        indicator.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        knob.value = value;
        knob.dispatchEvent(new Event("input"));
    });

    knob.addEventListener("pointerup", (event) => {
        dragging = false;
        knob.releasePointerCapture(event.pointerId);
        knob.classList.remove("dragging");
    });

    knob.addEventListener("pointercancel", () => {
        dragging = false;
        knob.classList.remove("dragging");
    });

    knob.appendChild(indicator);

    return knob;
}
