/* =========================================================================
   BOMB - the Bomb Bat's one-way bombing run, and its trip home (2026-10-12)
   =========================================================================
   "Bomb Bat (flies over the other bats, can drop 1 bomb on the enemy tower,
    then returns to your tower and transforms into a scout bat. only has one
    bomb)"  - Jeff

   Three stages, all in the "bomb" block of data/units.js:

     OUT    it flies right, over everyone. Nothing can hit it and it hits
            nothing. It does not stop for bats or bugs.
     DROP   at the enemy tower it drops its one bomb (bomb.damage).
     HOME   it flies back to your tower, still out of reach, and the moment it
            gets there it becomes a brand new Scout Bat (bomb.becomes) that
            walks out like any other.

   ------------------- THE RULES THAT ARE NOT NUMBERS -------------------
     * One bomb, ever. It is a stage, not a timer, so there is no way to drop
       a second one.
     * While it is flying it is UNTARGETABLE and blocks nobody: Combat skips
       anything with  untargetable  set.
     * It turns into a Scout by vanishing and spawning a fresh one - no death,
       no grave. (The Scout it becomes is an ordinary Scout: it leaves a grave
       when it falls, like any other.)
   ========================================================================= */

window.Bomb = {};

window.Bomb.isBomber = function (stats) {
  return !!(stats && stats.bomb);
};

window.Bomb.resetUnit = function (unit) {
  var bomber = window.Bomb.isBomber(unit.stats);

  unit.bombStage = bomber ? 'out' : null;
  unit.untargetable = bomber;      // nothing can touch it while it flies
  unit.flying = bomber;            // drawn higher up - see src/entities/unit.js
};

/* -------------------------------------------------------------------------
   Called by the brain every step. Returns true if this unit is a Bomb Bat on
   its run, so the brain leaves walking and fighting alone.
   ------------------------------------------------------------------------- */
window.Bomb.step = function (unit, dt, world) {
  if (!unit.bombStage) {
    return false;
  }

  var bomb = unit.stats.bomb;
  var move = unit.stats.speed * dt;

  if (unit.bombStage === 'out') {
    unit.direction = 1;
    unit.x += move;
    unit.show('walk');

    if (unit.x >= world.enemyBase.faceX - bomb.dropReach) {
      window.Combat.applyDamage(world.enemyBase, bomb.damage);
      window.Brain.report(world, 'bomb', { unit: unit, damage: bomb.damage });

      unit.bombStage = 'home';
      unit.direction = -1;         // turn round
    }

    return true;
  }

  // HOME: fly back, and become a Scout at the door.
  unit.x -= move;
  unit.show('walk');

  if (unit.x <= world.playerBase.spawnX) {
    var x = world.playerBase.spawnX;

    window.Brain.vanish(unit);
    world.spawn(bomb.becomes, x);
    window.Brain.report(world, 'landed', { unitKey: bomb.becomes, x: x });
  }

  return true;
};
