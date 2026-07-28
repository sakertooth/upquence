import * as Game from "./model/game.js"
import * as Sequencer from "./view/sequencer.js"
import * as Toolbar from "./view/toolbar.js"
import * as Transport from "./transport.js"

(async () => {
    await Game.init();
    Sequencer.init();
    Toolbar.init();
    Transport.init();
}
)();
