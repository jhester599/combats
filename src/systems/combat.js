/* =========================================================================
   COMBAT - who can hit what, and how hard
   =========================================================================
   The whole battle happens along ONE horizontal line, so "how far away is
   that thing" is just a subtraction. No physics engine needed.

   Rules:
     * A unit only attacks things IN FRONT of it (plus a tiny bit behind, so
       units standing shoulder to shoulder still fight - CONFIG.combat.rearReach).
     * It picks the NEAREST thing it can reach.
     * The enemy base counts as a target too.

   All the tuning numbers come from data/config.js and data/units.js.
   ========================================================================= */

window.Combat = {};

/* -------------------------------------------------------------------------
   Is 'targetX' something that 'unit' is allowed to attack right now?
   ------------------------------------------------------------------------- */
window.Combat.isInReach = function (unit, targetX) {
  var gap = targetX - unit.x;

  // Which way is this unit facing? +1 = walking right, -1 = walking left.
  // Multiplying by the direction turns "to my right" into "in front of me"
  // for both teams, so we only need one rule instead of two.
  var forwardGap = gap * unit.direction;

  // Behind me by more than the little rear allowance? Ignore it.
  if (forwardGap < -window.CONFIG.combat.rearReach) {
    return false;
  }

  // Too far in front? Ignore it.
  if (forwardGap > unit.stats.range) {
    return false;
  }

  return true;
};

/* -------------------------------------------------------------------------
   Find the nearest thing this unit should be hitting.
   Returns a unit, or a base, or null if there is nothing to fight.

   'world' is an object with:  units (array), playerBase, enemyBase
   ------------------------------------------------------------------------- */
window.Combat.findTarget = function (unit, world) {
  var best = null;
  var bestDistance = Infinity;

  var i;
  var other;
  var distance;

  for (i = 0; i < world.units.length; i++) {
    other = world.units[i];

    // Skip my own team, and skip anything already playing its death animation.
    if (other.team === unit.team || other.isDying) {
      continue;
    }

    if (!window.Combat.isInReach(unit, other.x)) {
      continue;
    }

    distance = Math.abs(other.x - unit.x);

    if (distance < bestDistance) {
      bestDistance = distance;
      best = other;
    }
  }

  // The enemy's base is a target as well. Units check it too, so a bat that
  // walks past everybody will start chewing on the building.
  var base = (unit.team === 'player') ? world.enemyBase : world.playerBase;

  if (base.hp > 0 && window.Combat.isInReach(unit, base.faceX)) {
    distance = Math.abs(base.faceX - unit.x);

    if (distance < bestDistance) {
      best = base;
    }
  }

  return best;
};

/* -------------------------------------------------------------------------
   Is there a friendly unit standing right in front of me?

   Without this, everybody walks into the same spot and the army looks like
   one squashed blob. With it, units queue up behind each other and you get a
   proper battle line - exactly like the front line in The Battle Cats.

   How close is "right in front" is CONFIG.combat.personalSpace.
   ------------------------------------------------------------------------- */
window.Combat.isBlockedByFriend = function (unit, world) {
  var space = window.CONFIG.combat.personalSpace;

  if (space <= 0) {
    return false;     // the feature is switched off in config
  }

  var i;
  var other;
  var forwardGap;

  for (i = 0; i < world.units.length; i++) {
    other = world.units[i];

    // Only friends block us, and only ones that are still standing.
    if (other === unit || other.team !== unit.team || other.isDying) {
      continue;
    }

    forwardGap = (other.x - unit.x) * unit.direction;

    // Strictly in FRONT (> 0) and too close. Using "> 0" means two units in
    // exactly the same spot never block each other, so they can never both
    // freeze waiting for the other one.
    if (forwardGap > 0 && forwardGap < space) {
      return true;
    }
  }

  return false;
};

/* -------------------------------------------------------------------------
   Deal damage. Works on both units and bases because both have takeDamage().
   ------------------------------------------------------------------------- */
window.Combat.applyDamage = function (target, amount) {
  if (!target || target.hp <= 0) {
    return;
  }

  target.takeDamage(amount);
};

/* -------------------------------------------------------------------------
   ONE SWING - and the ONLY place in the game where damage is worked out.

   Three things can change what a swing does, and they all meet here:

     * the attacker's plain  attack  number            (data/units.js)
     * a POTION, if the attacker is a bug and one is running (src/systems/items.js)
     * a STING, if the attacker gambles on every hit     (src/systems/sting.js)

   It matters that this is one function rather than a few lines repeated in
   src/entities/unit.js and again in tools/balance-sim.js. Those two files each
   have their own copy of the unit brain, and every rule written twice is a rule
   that will eventually disagree with itself - which is exactly how this project
   lost a level once (DECISIONS.md D10, D11). Both call this.

   Returns what happened, so the screen can shout about it:
     { damage, instantKill, backfire }
   ------------------------------------------------------------------------- */
window.Combat.strike = function (unit, target, world) {
  var sting = window.Sting.resolve(unit, target);

  var damage = unit.stats.attack * window.Items.attackFactorFor(unit, world);

  if (sting.instantKill) {
    // Whatever health is left, however much that is. An instant kill ignores
    // health entirely - which is why src/systems/sting.js forbids it against a
    // base, where one roll would otherwise decide a whole cave.
    damage = target.hp;
  }

  window.Combat.applyDamage(target, damage);

  if (sting.backfire) {
    // It killed itself doing that. Straight through takeDamage() so it dies
    // exactly like anything else does - death animation, grave, the lot.
    unit.takeDamage(unit.hp);
  }

  return { damage: damage, instantKill: sting.instantKill, backfire: sting.backfire };
};
