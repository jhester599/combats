/* =========================================================================
   RABIES - the Rabies Bat's one big bite (2026-10-12)
   =========================================================================
   "Rabies Bat (walks into a random place of the map, then consumes everything
    within a certain distance, both bats and enemy)"  - Jeff
   And asked what happens to the bat itself: "Used up, one big bite."

   Three stages, numbers in the "rabies" block of data/units.js:

     GOING    it walks to a random spot on the lane, picked the moment it is
              sent out. It walks straight past bats and bugs without stopping
              or fighting - but it CAN be hit, and if it dies on the way it
              bites nobody.
     WIND-UP  it stops and shakes for  windup  seconds. You can see it coming;
              so can your own bats, who are standing right next to it.
     BITE     everything within  radius  pixels - bats AND bugs - is eaten,
              and so is the Rabies Bat.

   ------------------- THE RULES THAT ARE NOT NUMBERS -------------------
     * Something EATEN leaves no grave. The Necrobatcer cannot raise it.
     * Buildings are never eaten. One bat must not decide a cave in one go,
       the same rule the Desert Scorpion's sting obeys.
     * A BOSS is too big to swallow: it takes  bossDamage  instead. Otherwise
       one 1-in-a-hundred tap deletes the Cow Killer Bee, and the whole Final
       Stadium - the fight the Archer was invented for - is skipped.
     * Anything flying (a Bomb Bat on its run) is out of reach.

   The random spot uses the same dice as the Desert Scorpion (Sting.roll), so
   the balance sim can seed it and get the same battle every time.
   ========================================================================= */

window.Rabies = {};

window.Rabies.isRabid = function (stats) {
  return !!(stats && stats.rabies);
};

window.Rabies.resetUnit = function (unit) {
  unit.rabiesStage = window.Rabies.isRabid(unit.stats) ? 'going' : null;
  unit.rabiesSpot = null;          // picked on its first step, when the lane is known
  unit.rabiesTimer = 0;
};

/* Somewhere on the lane between your door and theirs. */
window.Rabies.pickSpot = function (rabies, world) {
  var near = world.playerBase.spawnX + rabies.minFromHome;
  var far = world.enemyBase.faceX - rabies.minFromEnemy;

  return near + (window.Sting.roll() * Math.max(0, far - near));
};

/* -------------------------------------------------------------------------
   Called by the brain every step. Returns true if this is a Rabies Bat, so
   the brain leaves walking and fighting alone.
   ------------------------------------------------------------------------- */
window.Rabies.step = function (unit, dt, world) {
  if (!unit.rabiesStage) {
    return false;
  }

  var rabies = unit.stats.rabies;

  if (unit.rabiesSpot === null) {
    unit.rabiesSpot = window.Rabies.pickSpot(rabies, world);
  }

  if (unit.rabiesStage === 'going') {
    unit.x += unit.stats.speed * dt;
    unit.show('walk');

    if (unit.x >= unit.rabiesSpot) {
      unit.x = unit.rabiesSpot;
      unit.rabiesStage = 'windup';
      unit.rabiesTimer = rabies.windup;
      window.Brain.report(world, 'rabiesWindup', { unit: unit });
    }

    return true;
  }

  // WIND-UP, then the bite.
  unit.rabiesTimer -= dt;
  unit.show('idle');

  if (unit.rabiesTimer <= 0) {
    window.Rabies.bite(unit, world);
  }

  return true;
};

/* Eat everything in reach, then be eaten too. Returns how many were eaten. */
window.Rabies.bite = function (unit, world) {
  var rabies = unit.stats.rabies;
  var eaten = { player: 0, enemy: 0 };
  var units = world.units.slice();      // things die while we walk the list
  var i;
  var u;

  for (i = 0; i < units.length; i++) {
    u = units[i];

    if (u === unit || !u.active || u.isDying || u.untargetable) {
      continue;
    }

    if (Math.abs(u.x - unit.x) > rabies.radius) {
      continue;
    }

    if (u.stats.boss) {
      window.Combat.applyDamage(u, rabies.bossDamage);
      continue;
    }

    u.consumed = true;
    u.takeDamage(u.hp);
    eaten[u.team]++;
  }

  window.Brain.report(world, 'rabies', { unit: unit, eaten: eaten });

  unit.rabiesStage = null;
  unit.consumed = true;
  unit.takeDamage(unit.hp);

  return eaten;
};
