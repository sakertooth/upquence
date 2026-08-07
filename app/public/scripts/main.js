import * as Game from "./game.js"
import * as Sequencer from "./view/sequencer.js"
import * as Toolbar from "./view/toolbar.js"

(async () => {
    await Game.init();
    Sequencer.init();
    Toolbar.init();
}
)();
