/* =========================================================================
   COMBATS - START HERE
   =========================================================================
   This file turns the engine on. It is the last script index.html loads, so
   by the time it runs every other file has already put its part on the
   'window' object.

   No bundler, no build step, no npm. Just script tags in order.
   ========================================================================= */

/* Which level the game drops you into if it is ever asked to start a battle
   without saying which one.

   You no longer have to edit this to play a different level: the title screen
   lists every level in data/levels.js and you pick one. Add a level block to
   that file and a button for it appears by itself. */
window.STARTING_LEVEL = 'level1';

window.GAME_CONFIG = {
  type: Phaser.AUTO,                     // WebGL if the device can, Canvas if not
  width: window.CONFIG.screen.width,
  height: window.CONFIG.screen.height,
  backgroundColor: window.CONFIG.screen.backgroundColor,
  parent: 'game',                        // the <div id="game"> in index.html

  render: {
    // Keeps our pixel-art bats crisp instead of blurry when they are scaled.
    pixelArt: window.CONFIG.screen.pixelArt
  },

  scale: {
    // Shrink or grow the whole game to fit the window, keeping it the right
    // shape, and centre it. This is what makes it work on a phone.
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  input: {
    activePointers: 3    // allow a few fingers at once on a touchscreen
  },

  // Deliberately NO physics engine. Lane combat is just comparing positions
  // along one line, which src/systems/combat.js does with subtraction.

  scene: [
    window.BootScene,     // makes the art, then ->
    window.MenuScene,     // title screen, then ->
    window.BattleScene    // the game
  ]
};

window.game = new Phaser.Game(window.GAME_CONFIG);
