/* =========================================================================
   FROST - the Frost Bat freezes bugs (2026-10-12)
   =========================================================================
   "Frost Bat (freezes the enemy when they touch for x seconds, will need to
    tune x)"  - Jeff

   Contact works BOTH ways, because that is what "touch" means:
     * a Frost Bat's own hit freezes the bug it hits;
     * a bug that hits a Frost Bat is frozen for touching it.

   A frozen bug cannot walk and cannot swing. It can still be hit - that is
   the point. x is  freezeSeconds  in the Frost Bat's "frost" block in
   data/units.js, the number Jeff said would need tuning.

   ------------------- THE RULE THAT IS NOT A NUMBER -------------------
   After a bug thaws it cannot be frozen again for  thawSeconds . Without
   that, two Frost Bats taking turns freeze anything for ever - the Cow Killer
   Bee included - and a cave's boss turns into a punching bag. The gap is
   when the bug gets its swing in.

   Only bugs are frozen. A Frost Bat never freezes your own bats, and it never
   freezes a building.
   ========================================================================= */

window.Frost = {};

window.Frost.isFreezer = function (stats) {
  return !!(stats && stats.frost);
};

/* Units are pooled - a fresh bug must not arrive still frozen. */
window.Frost.resetUnit = function (unit) {
  unit.frozenTimer = 0;
  unit.thawTimer = 0;      // can't be frozen again until this runs out
  unit.thawLength = 0;
};

window.Frost.isFrozen = function (unit) {
  return unit.frozenTimer > 0;
};

/* -------------------------------------------------------------------------
   Called by the brain every step. Returns true while the unit is frozen,
   which tells the brain to skip its turn.
   ------------------------------------------------------------------------- */
window.Frost.tick = function (unit, dt) {
  if (unit.thawTimer > 0) {
    unit.thawTimer -= dt;
  }

  if (unit.frozenTimer <= 0) {
    return false;
  }

  unit.frozenTimer -= dt;

  if (unit.frozenTimer <= 0) {
    unit.frozenTimer = 0;
    unit.thawTimer = unit.thawLength;
  }

  return true;
};

/* Try to freeze one unit. Returns true if it froze. */
window.Frost.freeze = function (victim, frost, world) {
  if (!victim || victim.isDying || victim.team !== 'enemy') {
    return false;
  }

  if (victim.frozenTimer > 0 || victim.thawTimer > 0) {
    return false;          // already frozen, or still thawing out
  }

  victim.frozenTimer = frost.freezeSeconds;
  victim.thawLength = frost.thawSeconds;

  window.Brain.report(world, 'freeze', { unit: victim });
  return true;
};

/* -------------------------------------------------------------------------
   Called by Combat.strike() after every hit, for the game and the sim alike.
   ------------------------------------------------------------------------- */
window.Frost.afterHit = function (attacker, target, world) {
  if (!window.Sting.isUnit(target)) {
    return;                // buildings do not freeze
  }

  // A Frost Bat hit something.
  if (window.Frost.isFreezer(attacker.stats)) {
    window.Frost.freeze(target, attacker.stats.frost, world);
  }

  // Something hit a Frost Bat - and touched it.
  if (window.Frost.isFreezer(target.stats)) {
    window.Frost.freeze(attacker, target.stats.frost, world);
  }
};
