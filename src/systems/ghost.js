/* =========================================================================
   GHOST - the Ghost Bat and its ghosts (the first casino bat, 2026-10-22)
   =========================================================================
   Jeff: "the first bat that is available at the casino will be the 'ghost
   bat'. it is similar to necrobatcer, but the summons are small ghosts who do
   little damage but they are difficult to kill because they share the life
   with the ghost bat. it is a passive bat, which stays at a long range from
   the enemies, it has a smaller amount of health, so staying back is
   important."

   How it works (the numbers are the Ghost Bat's "ghosts" block in
   data/units.js):

     1. A Ghost Bat never attacks. It hangs back at a long range and, every
        ghosts.interval seconds, sends out a small GHOST - up to
        ghosts.maxAlive of its own at once.
     2. A ghost has NO HEALTH OF ITS OWN. It shares the Ghost Bat's: a hit on
        a ghost comes off the Ghost Bat, times ghosts.damageShare. With a
        share under 1, a ghost soaks hits that would flatten a Scout - that is
        what makes them hard to kill. Its health bar shows the Ghost Bat's.
     3. So the way to get rid of the ghosts is to get to the Ghost Bat. When
        it dies, every one of its ghosts fades with it - which is why it has
        to stay back.

   ------------------- THE RULES THAT ARE NOT NUMBERS -------------------
     * ONE GHOST CAN NEVER BE ITS GHOST BAT'S DEATH. A hit that would take
       ALL the shared health at once - a Desert Scorpion's instant kill, a
       Rabies Bat's bite - destroys just that ghost instead. Otherwise a
       scorpion at the front could kill a Ghost Bat standing 220px away.
     * A GHOST LEAVES NO GRAVE. It was never alive, so a Necrobatcer cannot
       raise it (src/systems/necro.js asks noGrave).
     * A GHOST BELONGS TO ONE LIFE OF ONE GHOST BAT. Units are POOLED - the
       object that was a Ghost Bat can come back as a Scout - so a ghost
       remembers its Ghost Bat's lifeId as well as the object, and fades the
       moment the two stop matching. Otherwise a ghost could end up sharing
       the health of a Scout that happens to reuse the dead bat's object.

   Like every power, this runs in both the game and the balance sim, through
   src/systems/brain.js.
   ========================================================================= */

window.Ghost = {};

/* Every life gets its own number - see "one life of one Ghost Bat" above. */
var ghostLifeCounter = 0;

window.Ghost.isGhostBat = function (stats) {
  return !!(stats && stats.ghosts);
};

/* Units are pooled: everything here MUST be reset for every new unit. */
window.Ghost.resetUnit = function (unit) {
  ghostLifeCounter += 1;
  unit.lifeId = ghostLifeCounter;
  unit.lifeOwner = null;          // the Ghost Bat whose health this ghost shares
  unit.ownerLifeId = 0;
  unit.ghostTimer = window.Ghost.isGhostBat(unit.stats) ? unit.stats.ghosts.interval : 0;
  unit.ghostsSent = 0;            // a Ghost Bat: how many ghosts it has sent
  unit.look = 0;                  // a ghost: which of its drawings it wears
};

/* The Ghost Bat this ghost shares health with - or null if it is not a ghost,
   or its Ghost Bat is gone (dying, finished, or the object reused). */
window.Ghost.ownerOf = function (unit) {
  var owner = unit.lifeOwner;

  if (!owner || !owner.active || owner.isDying || owner.lifeId !== unit.ownerLifeId) {
    return null;
  }

  return owner;
};

/* How full this unit's health bar is, 0 to 1. A ghost shows its Ghost Bat's. */
window.Ghost.healthRatio = function (unit) {
  var owner = window.Ghost.ownerOf(unit);
  var who = owner || unit;
  return who.hp / who.stats.hp;
};

/* -------------------------------------------------------------------------
   A ghost has been hit. The hit comes off its Ghost Bat (times damageShare)
   instead. Returns true if it took care of the hit, false if this is not a
   ghost and the hit should land as normal.
   ------------------------------------------------------------------------- */
window.Ghost.takeHit = function (unit, amount) {
  if (!unit.lifeOwner) {
    return false;
  }

  var owner = window.Ghost.ownerOf(unit);

  if (!owner) {
    return true;                    // fading already; the step deals with it
  }

  if (amount >= unit.hp) {
    // Everything at once: just this ghost goes (see the rules at the top).
    unit.lifeOwner = null;
    unit.hp = 0;
    window.Brain.startDying(unit);
    return true;
  }

  owner.takeDamage(amount * owner.stats.ghosts.damageShare);
  return true;
};

/* A ghost's own hp is never worn down - hits go to its Ghost Bat. It is set
   to the whole shared pool at FULL health (the Ghost Bat's hp / damageShare,
   180 at the start) so that "is it still alive?" reads true, and so the only
   thing that can deal a ghost its hp in one go is an instant kill or a bite:
   no ordinary hit in Palopa comes close. Its bar shows the Ghost Bat's
   health instead (healthRatio). */
window.Ghost.fullPool = function (owner) {
  return owner.stats.hp / owner.stats.ghosts.damageShare;
};

/* How many of THIS Ghost Bat's ghosts are about right now. */
window.Ghost.countFor = function (ghostBat, world) {
  var units = world.units || [];
  var count = 0;
  var i;

  for (i = 0; i < units.length; i++) {
    if (units[i].active && !units[i].isDying && units[i].lifeOwner === ghostBat &&
        units[i].ownerLifeId === ghostBat.lifeId) {
      count++;
    }
  }

  return count;
};

/* -------------------------------------------------------------------------
   Once per step, for every unit. Returns true if it dealt with this unit for
   the whole step (a ghost fading away), false to carry on as normal.

   A Ghost Bat sends out a ghost when its timer is up and it has room for one.
   It never attacks - attack 0 in data/units.js - so the rest of its step is
   just standing at its long range, which the ordinary brain already does.
   ------------------------------------------------------------------------- */
window.Ghost.step = function (unit, dt, world) {
  // A ghost whose Ghost Bat has gone fades with it.
  if (unit.lifeOwner) {
    if (!window.Ghost.ownerOf(unit)) {
      unit.lifeOwner = null;
      unit.hp = 0;
      window.Brain.startDying(unit);
      return true;
    }

    return false;
  }

  if (!window.Ghost.isGhostBat(unit.stats) || !world || !world.spawn) {
    return false;
  }

  var g = unit.stats.ghosts;

  // Like the Necrobatcer, it holds at most ONE ghost ready - it does not bank
  // a pile of them while it already has a full set out.
  if (unit.ghostTimer > 0) {
    unit.ghostTimer -= dt;
    return false;
  }

  if (window.Ghost.countFor(unit, world) >= g.maxAlive) {
    return false;
  }

  // Out in front of it, so the new ghost starts heading the right way.
  var ghost = world.spawn(g.unitKey, unit.x + (g.spawnAhead * unit.direction));

  if (!ghost) {
    return false;
  }

  ghost.lifeOwner = unit;
  ghost.ownerLifeId = unit.lifeId;

  // Each new ghost wears the next drawing, round and round (data/units.js).
  ghost.look = unit.ghostsSent % (ghost.stats.looks || 1);
  unit.ghostsSent += 1;

  ghost.hp = window.Ghost.fullPool(unit);
  unit.ghostTimer = g.interval;

  unit.show('attack', true);       // no summoning pose drawn yet
  window.Brain.report(world, 'ghost', { unit: ghost, ghostBat: unit });
  return false;
};
