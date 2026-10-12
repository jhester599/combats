/* =========================================================================
   CHEER - the Cheer Bat makes every other bat hit harder (2026-10-12)
   =========================================================================
   "Cheer Bat (passive, improves attack power for all the other bats, but with
    very low HP)"  - Jeff

   While a Cheer Bat is alive, every OTHER bat of yours hits for more. The
   numbers are in its "cheer" block in data/units.js.

   ------------------- THE RULES THAT ARE NOT NUMBERS -------------------
     * It boosts YOUR bats only, never the bugs.
     * It does not boost itself, or another Cheer Bat - it is a cheerleader,
       not a fighter, and two cheerleaders cheering each other is a loop.
     * Two Cheer Bats do NOT stack. A cheer is a cheer: the second one is a
       spare in case the first gets swatted, which with its tiny health is
       likely. Stacking would make "send nothing but Cheer Bats and Scouts"
       an exponential army, and nothing in this game is allowed to snowball.

   It is asked from Combat.strike(), the one place damage is worked out, so
   the game and the balance sim cannot disagree about it (D11).
   ========================================================================= */

window.Cheer = {};

window.Cheer.isCheerleader = function (stats) {
  return !!(stats && stats.cheer);
};

/* The biggest boost any living Cheer Bat is giving right now, e.g. 0.3. */
window.Cheer.bonusIn = function (world) {
  var best = 0;
  var units = (world && world.units) || [];
  var i;
  var u;

  for (i = 0; i < units.length; i++) {
    u = units[i];

    if (u.active && !u.isDying && window.Cheer.isCheerleader(u.stats)) {
      best = Math.max(best, u.stats.cheer.attackBonus);
    }
  }

  return best;
};

/* What to multiply this unit's attack by. 1 = no change. */
window.Cheer.attackFactorFor = function (unit, world) {
  if (unit.team !== 'player' || window.Cheer.isCheerleader(unit.stats)) {
    return 1;
  }

  return 1 + window.Cheer.bonusIn(world);
};
