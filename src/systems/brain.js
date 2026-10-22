/* =========================================================================
   BRAIN - what every bat and bug does, once per simulation step
   =========================================================================
   walk forward  ->  something in reach?  ->  stop and hit it
   out of health ->  count down the death  ->  leave a grave  ->  go back in the pool

   ------------------- WHY THIS IS ONE FILE (2026-10-12) -------------------
   This used to be written TWICE: once in src/entities/unit.js for the game,
   and again in tools/balance-sim.js for the headless tester. Every power then
   needed "two lines of wiring in each", and every rule written twice is a rule
   that will one day disagree with itself - which is exactly how this project
   lost a level once (DECISIONS.md D10, D11).

   Six new bats arrived at once, and five of them change how a unit MOVES or
   ACTS, not just how hard it hits: one flies, one walks to a random spot, one
   freezes things, one stays at home. Writing all of that twice was not going
   to stay true. So the brain moved here, and both of those files now call it.

   ------------------- WHAT A UNIT OBJECT MUST HAVE -------------------
   The brain works on ANY object with the fields below - the drawn Unit in the
   game and the invisible SimUnit in the tester are both just that:

       unitKey, stats, team, direction, x, hp, attackTimer,
       isDying, dyingTimer, deathDuration, active

   and two methods, which is how the brain tells the drawing what happened.
   The sim's versions do nothing.

       unit.show(animName, restart)   play idle / walk / attack / death
       unit.onStartDying()            hide the health bar, that kind of thing

   Things worth shouting about on screen (a sting, a bomb, a big bite) are
   passed to  world.report(kind, details) , if the world has one. The game
   turns them into floating words; the sim counts them.

   ------------------- WHERE THE POWERS ARE -------------------
   Not here. Each one is its own file in src/systems/, with its numbers in
   data/units.js. This file only decides WHEN to ask each of them:

       necro.js     the Necrobatcer raising the dead (and the Skeleton's boost)
       sting.js     the Desert Scorpion's gamble        (inside Combat.strike)
       cheer.js     the Cheer Bat's attack boost        (inside Combat.strike)
       frost.js     the Frost Bat's freeze
       bomb.js      the Bomb Bat's flight
       rabies.js    the Rabies Bat's big bite
       engineer.js  the Engineer Bat's extra energy     (asked by the battle,
                                                          not by a unit)
       ghost.js     the Ghost Bat's ghosts, and their shared health
   ========================================================================= */

window.Brain = {};

/* -------------------------------------------------------------------------
   Everything a unit carries from one life to the next MUST be reset here.
   Units are pooled, so an object that was a Bomb Bat a moment ago can come
   back as a Scout - and must not still think it is flying.
   ------------------------------------------------------------------------- */
window.Brain.reset = function (unit) {
  unit.hp = unit.stats.hp;
  unit.attackTimer = 0;          // ready to swing the moment it meets someone
  unit.isDying = false;
  unit.dyingTimer = 0;
  unit.active = true;
  unit.consumed = false;         // eaten by a Rabies Bat: no grave

  var death = unit.stats.anims.death;
  unit.deathDuration = (death.end - death.start + 1) / death.frameRate;

  window.Necro.resetUnit(unit);
  window.Frost.resetUnit(unit);
  window.Bomb.resetUnit(unit);
  window.Rabies.resetUnit(unit);
  window.Ghost.resetUnit(unit);
};

/* -------------------------------------------------------------------------
   One step of thinking. dt is a small slice of a second.
   ------------------------------------------------------------------------- */
window.Brain.step = function (unit, dt, world) {
  if (!unit.active) {
    return;
  }

  // Already dying? Just count down the death, then bow out.
  if (unit.isDying) {
    unit.dyingTimer -= dt;

    if (unit.dyingTimer <= 0) {
      // Leave a grave BEFORE going inactive, while x is still the spot where
      // it fell. Something a Rabies Bat ATE leaves nothing to raise.
      if (!unit.consumed) {
        window.Necro.recordDeath(unit, world);
      }

      unit.active = false;       // the battle pools it next sweep
    }

    return;
  }

  // Frozen solid: no walking, no swinging, nothing - until it thaws.
  if (window.Frost.tick(unit, dt)) {
    unit.show('idle');
    return;
  }

  // Bats that do not walk-and-fight like everyone else. Each returns true if
  // it took care of this unit for this step.
  if (window.Bomb.step(unit, dt, world)) {
    return;
  }

  if (window.Rabies.step(unit, dt, world)) {
    return;
  }

  // A Ghost Bat sends out ghosts; a ghost whose Ghost Bat is gone fades.
  if (window.Ghost.step(unit, dt, world)) {
    return;
  }

  // A Necrobatcer raises a fallen friend. Every other unit ignores this.
  var raised = window.Necro.update(unit, dt, world);

  if (raised) {
    // No summon animation is drawn yet, so the attack pose is the "casting"
    // move (homework B21 territory).
    unit.show('attack', true);
    window.Brain.report(world, 'raised', { unit: raised });
  }

  var target = window.Combat.findTarget(unit, world);

  if (target) {
    window.Brain.fight(unit, dt, target, world);
  } else {
    window.Brain.walk(unit, dt, world);
  }
};

/* Walk forward, unless a friend is already standing in the way. */
window.Brain.walk = function (unit, dt, world) {
  if (window.Combat.isBlockedByFriend(unit, world)) {
    unit.show('idle');           // wait our turn instead of walking into a back
    return;
  }

  unit.x += unit.stats.speed * unit.direction * dt;
  unit.show('walk');
};

/* Stand still and hit the target on our own attack interval. */
window.Brain.fight = function (unit, dt, target, world) {
  unit.attackTimer -= dt;

  if (unit.attackTimer <= 0) {
    unit.attackTimer = unit.stats.attackInterval;

    // The swing animation starts BEFORE the hit is worked out, and that order
    // matters: a Desert Scorpion's sting can kill the scorpion itself, and
    // dying sets the death animation - so playing the swing afterwards would
    // wipe it out and leave a dead bug lunging for ever.
    unit.show('attack', true);

    // ONE place works out damage, for the game and the balance sim alike.
    var hit = window.Combat.strike(unit, target, world);

    if (hit.instantKill || hit.backfire) {
      window.Brain.report(world, 'sting', { unit: unit, target: target, hit: hit });
    }
  } else if (!unit.isDying) {
    unit.show('idle', false, true);   // between swings; leaves a swing playing
  }
};

/* -------------------------------------------------------------------------
   Take a hit. Both the Unit and the SimUnit hand their takeDamage() here.
   ------------------------------------------------------------------------- */
window.Brain.takeDamage = function (unit, amount) {
  if (unit.isDying) {
    return;
  }

  // A ghost has no health of its own: the hit lands on its Ghost Bat.
  if (window.Ghost.takeHit(unit, amount)) {
    return;
  }

  unit.hp -= amount;

  if (unit.hp <= 0) {
    unit.hp = 0;
    window.Brain.startDying(unit);
  }
};

window.Brain.startDying = function (unit) {
  unit.isDying = true;
  unit.dyingTimer = unit.deathDuration;
  unit.onStartDying();
};

/* -------------------------------------------------------------------------
   Gone instantly, with no death to play and no grave: what happens to a Bomb
   Bat when it turns into a Scout at your door.
   ------------------------------------------------------------------------- */
window.Brain.vanish = function (unit) {
  unit.active = false;
};

/* Tell the world something worth shouting about, if it is listening. */
window.Brain.report = function (world, kind, details) {
  if (world && world.report) {
    world.report(kind, details);
  }
};
