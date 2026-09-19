/* =========================================================================
   NECRO - raising your fallen bats
   =========================================================================
   Lewis's third bat (homework B5) is the NECROBATCER: "a summoner, similar to
   a necromancer, that can summon dead bats back to life to continue
   fighting."

   This file is the RULES for that. The numbers are all in the Necrobatcer's
   "summon" block in data/units.js, same as every other number in the game.

   How it works:

     1. Every one of YOUR bats that dies leaves a GRAVE where it fell.
     2. A Necrobatcer raises one grave every  summon.interval  seconds, as
        long as the grave is within  summon.range  pixels of it.
     3. The raised bat comes back at  summon.hpFactor  of its full health,
        standing exactly where it died - so it skips the long walk from your
        base. That is the whole point of the bat.

   ------------------- THE TWO RULES THAT ARE NOT NUMBERS -------------------
   These live here rather than in data/units.js because they stop the game
   breaking, rather than tune how it feels. Changing them is a code decision,
   not a Lewis decision:

     * A bat can only ever be RAISED ONCE. Without this, one grave feeds an
       endless army: raise a bat, it dies, it leaves a grave, raise it again.
     * A Necrobatcer can never raise another Necrobatcer. Two summoners
       raising each other is the same runaway, just slower to notice.

   ------------------- WHY IT LIVES IN src/systems/ -------------------
   Both the real game (src/entities/unit.js) and the headless balance sim
   (tools/balance-sim.js) call into this file, so the summoning behaves
   IDENTICALLY in a browser and in the tester. If this logic were written
   inside unit.js, the sim would quietly not have it and would report balance
   for a game nobody plays. That mistake has already cost us one broken
   level - see DECISIONS.md D10.
   ========================================================================= */

window.Necro = {};

/* Does this unit definition have the summoning power at all? */
window.Necro.isSummoner = function (stats) {
  return !!(stats && stats.summon);
};

/* -------------------------------------------------------------------------
   Set up (or reset) a unit's summoning state.

   Units are POOLED, so a unit object gets reused over and over. Every one of
   these fields MUST be reset here, or a brand new bat inherits the state of
   whatever used the object last - for example a fresh Scout that thinks it
   has already been raised, and so never leaves a grave.
   ------------------------------------------------------------------------- */
window.Necro.resetUnit = function (unit) {
  unit.wasRaised = false;    // true = this bat is already a second life
  unit.summonTimer = window.Necro.isSummoner(unit.stats)
    ? unit.stats.summon.interval
    : 0;
};

/* -------------------------------------------------------------------------
   One of your bats has finished dying. Leave a grave where it fell.

   Called by both unit.js and the balance sim at the moment a unit goes
   inactive, which is while its x is still the place it died.
   ------------------------------------------------------------------------- */
window.Necro.recordDeath = function (unit, world) {
  if (!world || !world.graves) {
    return;               // this level/sim is not tracking graves
  }

  if (unit.team !== 'player') {
    return;               // only YOUR bats come back. Bugs stay dead.
  }

  if (unit.wasRaised) {
    return;               // rule 1: one life, one second life, no more
  }

  if (window.Necro.isSummoner(unit.stats)) {
    return;               // rule 2: no summoner raising a summoner
  }

  world.graves.push({ unitKey: unit.unitKey, x: unit.x });

  // Keep the graveyard from growing for ever in a long battle. Past the cap
  // the oldest grave is forgotten - a bat that fell ages ago is long gone.
  while (world.graves.length > window.CONFIG.combat.maxGraves) {
    world.graves.shift();
  }
};

/* -------------------------------------------------------------------------
   Which grave should this Necrobatcer reach for?
   Returns an INDEX into world.graves, or -1 for "nothing in reach".

   It picks the NEAREST one, and distance is measured in both directions:
   graves pile up at the front line, which is usually ahead of a Necrobatcer
   that is still walking out from base.
   ------------------------------------------------------------------------- */
window.Necro.nearestGraveIndex = function (unit, world, range) {
  var bestIndex = -1;
  var bestDistance = Infinity;
  var i;
  var distance;

  for (i = 0; i < world.graves.length; i++) {
    distance = Math.abs(world.graves[i].x - unit.x);

    if (distance > range) {
      continue;
    }

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  return bestIndex;
};

/* -------------------------------------------------------------------------
   Called once per simulation step for every unit.

   Returns the bat it raised, or null if it raised nothing this step. The
   caller uses that to play the summoning animation - the sim ignores it.
   ------------------------------------------------------------------------- */
window.Necro.update = function (unit, dt, world) {
  if (!window.Necro.isSummoner(unit.stats)) {
    return null;
  }

  if (!world || !world.graves || !world.spawn) {
    return null;          // nothing here can raise anything
  }

  var summon = unit.stats.summon;

  // Count down, but stop at zero instead of going negative. That means a
  // Necrobatcer holds exactly ONE charge: it can be ready and waiting for
  // someone to die, but it can never bank up three raises.
  if (unit.summonTimer > 0) {
    unit.summonTimer -= dt;
    return null;
  }

  var index = window.Necro.nearestGraveIndex(unit, world, summon.range);

  if (index === -1) {
    return null;          // ready, but nobody in reach to raise
  }

  var grave = world.graves[index];

  world.graves.splice(index, 1);     // a grave is used up when it is raised

  var raised = world.spawn(grave.unitKey, grave.x);

  if (!raised) {
    return null;
  }

  raised.wasRaised = true;
  raised.hp = raised.stats.hp * summon.hpFactor;

  if (raised.hp < 1) {
    raised.hp = 1;        // never raise something that is already dead
  }

  unit.summonTimer = summon.interval;

  return raised;
};
