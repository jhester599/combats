/* =========================================================================
   ENGINEER - the Engineer Bat makes your energy fill faster (2026-10-12)
   =========================================================================
   "Engineer Bat (makes energy grow faster)"  - Jeff

   While an Engineer Bat is alive, your energy fills faster. It never walks
   into the fight: it has speed 0 in data/units.js, so it stays by your door
   and keeps working - until a bug gets that far and swats it.

   ------------------- THE RULES THAT ARE NOT NUMBERS -------------------
     * Two Engineer Bats do NOT stack. Income that buys more income is the one
       thing an economy game must never allow: it snowballs, and then every
       cave is won by whoever bought engineers first. The second one is a
       spare.
     * It only counts while it is alive and not dying.

   The battle asks this file every step, in src/scenes/BattleScene.js and in
   tools/balance-sim.js alike: income = the level's energyPerSecond x factor.
   ========================================================================= */

window.Engineer = {};

window.Engineer.isEngineer = function (stats) {
  return !!(stats && stats.engineer);
};

/* What to multiply the level's energyPerSecond by right now. 1 = no change. */
window.Engineer.incomeFactor = function (world) {
  var best = 0;
  var units = (world && world.units) || [];
  var i;
  var u;

  for (i = 0; i < units.length; i++) {
    u = units[i];

    if (u.active && !u.isDying && window.Engineer.isEngineer(u.stats)) {
      best = Math.max(best, u.stats.engineer.incomeBonus);
    }
  }

  return 1 + best;
};
