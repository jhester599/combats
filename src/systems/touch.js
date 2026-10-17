/* =========================================================================
   TOUCH - buttons a finger can actually hit (2026-10-17)
   =========================================================================
   On a computer a mouse pointer is one pixel. On a phone a fingertip is about
   44 of the phone's own pixels across, and ComBats is shrunk to fit the
   screen: on a small iPhone held sideways the whole 960x540 game is drawn
   about 570 pixels wide. A cave button 52 tall becomes 31 on the glass, and a
   finger that lands just under it does nothing at all.

   So buttons get a TAP AREA bigger than their picture. Nothing looks any
   different; the space around a button just counts as the button too.

   How much bigger: never more than HALF the gap to the next button, so two
   tap areas never overlap and a tap always means the button nearest it. The
   numbers live in CONFIG.touch (data/config.js).
   ========================================================================= */

window.Touch = {};

/* -------------------------------------------------------------------------
   Grow an interactive object's tap area by padX on the left and right and
   padY above and below. Call it after setInteractive().

   The tap area is in the object's own pixels, measured from its top-left
   corner whatever its origin, so the same rectangle works for a button drawn
   from its centre and one drawn from its corner.
   ------------------------------------------------------------------------- */
window.Touch.pad = function (gameObject, padX, padY) {
  if (padY === undefined) {
    padY = padX;
  }

  gameObject.input.hitArea = new Phaser.Geom.Rectangle(
    -padX, -padY,
    gameObject.width + (padX * 2),
    gameObject.height + (padY * 2)
  );
  gameObject.input.hitAreaCallback = Phaser.Geom.Rectangle.Contains;

  return gameObject;
};
