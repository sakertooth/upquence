import * as Game from "./model/game.js"
import * as Sequencer from "./view/sequencer.js"
import * as Toolbar from "./view/toolbar.js"

(async () => {
    await Game.init();
    Sequencer.init();
    Toolbar.init();
}
)();
