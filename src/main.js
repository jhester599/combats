/* =========================================================================
   BATTLE BATS - START HERE
   =========================================================================
   This file turns the engine on. It is the last script index.html loads, so
   by the time it runs every other file has already put its part on the
   'window' object.

   No bundler, no build step, no npm. Just script tags in order.
   ========================================================================= */

/* Which level the Start button plays.
   FOR LEWIS: after you add 'level2' to data/levels.js, change this to
   'level2' to jump straight into it. */
window.STARTING_LEVEL = 'level1';

window.GAME_CONFIG = {
  type: Phaser.AUTO,                     // WebGL if the device can, Canvas if not
  width: window.CONFIG.screen.width,
  height: window.CONFIG.screen.height,
  backgroundColor: window.CONFIG.screen.backgroundColor,
  parent: 'game',                        // the <div id="game"> in index.html

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
