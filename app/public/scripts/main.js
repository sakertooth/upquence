import * as Game from "./game.js"
import * as Sequencer from "./view/sequencer.js"
import * as Toolbar from "./view/toolbar.js"

await Game.init();
Sequencer.render();
Toolbar.update(Game.session.sandboxData);