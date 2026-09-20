/* =========================================================================
   STING - the attack that is a gamble
   =========================================================================
   Lewis's homework B26 asked for a bug for the desert caves, and what he
   described is the first thing in this game that is not simply a number:

     "desert has scorpions (fast, every attack has a chance to kill you or
      kill itself)"   - Lewis

   So every single swing is a coin flip with two faces:

     * it might KILL whatever it hit outright, whatever that thing's health
     * it might kill ITSELF instead

   The numbers are in the unit's "sting" block in data/units.js, same as every
   other number in the game. The rules are here.

   ------------------- WHY THIS LIVES IN src/systems/ -------------------
   Same reason as src/systems/necro.js: both the real game
   (src/entities/unit.js) and the headless balance sim (tools/balance-sim.js)
   run this exact file, so a sting behaves identically in a browser and in the
   tester. A power written inside unit.js would be invisible to the sim, and
   the sim would report balance for a game nobody plays - see DECISIONS.md D11.

   ------------------- THE RULES THAT ARE NOT NUMBERS -------------------
   These are here rather than in data/units.js because they stop the game
   being unfair or broken, rather than tune how it feels:

     * A STING CAN NEVER INSTANTLY KILL A BASE. An instant kill ignores
       health, so a sting that counted against a fortress would mean every
       cave could be lost - or won - on one unlucky roll, however well it was
       played. A base can only ever be worn down by ordinary damage.
     * A sting cannot finish off something that is already dying, or one
       scorpion's lucky roll would be spent on a bat that is already gone.
     * The backfire is rolled on EVERY attack, including attacks on a base.
       Lewis said "every attack", and it cuts both ways: a scorpion that
       bursts while chewing on your fortress has done you a favour.
   ========================================================================= */

window.Sting = {};

/* -------------------------------------------------------------------------
   THE DICE, and why they are not simply Math.random().

   The game itself wants real randomness. The balance sim does NOT: a verdict
   that comes out differently every run cannot be used to tune anything, and
   this project has twice been bitten by a measuring tool that quietly lied
   (DECISIONS.md D10 and D22). So the dice can be SEEDED, and the sim seeds
   them - then "Sahara-hara at a 0.3s thumb with seed 7" is a repeatable fact
   that either passes or fails.

   The sim also plays every sting level on MANY seeds, because once a cave
   contains a coin flip, "is it winnable" stops being one answer and becomes
   "how often". A single lucky run is not a measurement.
   ------------------------------------------------------------------------- */
window.Sting.roll = function () {
  return Math.random();
};

/* Swap in a repeatable stream of numbers. Call with no argument to go back to
   real randomness (which is what the browser game always uses). */
window.Sting.useSeed = function (seed) {
  if (seed === undefined || seed === null) {
    window.Sting.roll = function () { return Math.random(); };
    return;
  }

  // mulberry32: tiny, fast, and good enough for a game about bats. The point
  // is only that the same seed always gives the same battle.
  var state = seed >>> 0;

  window.Sting.roll = function () {
    state = (state + 0x6D2B79F5) >>> 0;

    var t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t = t ^ (t + Math.imul(t ^ (t >>> 7), t | 61));

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* Does this unit definition gamble on every attack? */
window.Sting.hasSting = function (stats) {
  return !!(stats && stats.sting);
};

/* A base has no "stats"; every unit does. That one difference is how we tell
   a bat from a building without either of them having to know about stings. */
window.Sting.isUnit = function (target) {
  return !!(target && target.stats);
};

/* -------------------------------------------------------------------------
   Roll the dice for one attack.

   It does NOT apply anything - it only decides what happens, so the caller
   (window.Combat.strike) stays the single place that deals damage. Returns:

     { instantKill: bool, backfire: bool }
   ------------------------------------------------------------------------- */
window.Sting.resolve = function (unit, target) {
  var outcome = { instantKill: false, backfire: false };

  if (!window.Sting.hasSting(unit.stats)) {
    return outcome;
  }

  var sting = unit.stats.sting;

  // Rule: units only, and never something already on its way out.
  var canBeStung = window.Sting.isUnit(target) && !target.isDying;

  if (canBeStung && window.Sting.roll() < sting.killChance) {
    outcome.instantKill = true;
  }

  // Rolled on every attack, whatever was hit - Lewis said "every attack".
  if (window.Sting.roll() < sting.backfireChance) {
    outcome.backfire = true;
  }

  return outcome;
};
