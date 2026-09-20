/* =========================================================================
   ITEMS - the things you carry into a battle and spend there
   =========================================================================
   Lewis's homework B27. The numbers are in data/items.js; these are the rules.

     POTION  makes every bug weaker for a while.
     FRUIT   heals your tower, slightly.
     BLOOD   is money, and does nothing in a battle.

   ------------------- WHERE THE STOCK COMES FROM -------------------
   Eventually, from the casino: you win a cave, you get suns, you swap them for
   goods, and you carry the goods into the next cave (milestone M4, homework
   B13's saving).

   None of that exists yet, so a level can hand you a starting stock with
   "startItems" in data/levels.js. That is exactly the trick that let Lewis
   play with the Necrobatcer the day it was built (DECISIONS.md D14): the thing
   itself is real and finished, and only the way you ACQUIRE it is stubbed. When
   the casino arrives, it fills this same stock from saved progress and nothing
   in this file changes.

   ------------------- THE RULES THAT ARE NOT NUMBERS -------------------
     * A POTION SETS THE TIMER, IT DOES NOT ADD TO IT. Drinking three in a row
       gives ten weakened seconds, not thirty. Otherwise a player who hoarded
       six potions could switch a whole cave off, and the caves are balanced
       assuming items are a help and never a requirement.
     * FRUIT CANNOT BE USED ON A FULL TOWER. There is nothing to heal, and a
       nine-year-old should not be able to throw a fruit away by mistyping a
       tap.
     * A BATTLE THAT IS OVER TAKES NO MORE ITEMS.
   ========================================================================= */

window.Items = {};

/* -------------------------------------------------------------------------
   The stock and the timers for one battle. Lives on the world object, so this
   file never needs to know about Phaser, the scene, or the balance sim.
   ------------------------------------------------------------------------- */
window.Items.createState = function (level) {
  var stock = {};
  var start = (level && level.startItems) ? level.startItems : {};

  Object.keys(window.ITEMS).forEach(function (key) {
    if (window.ITEMS[key].currencyOnly) {
      return;                       // money is not carried into a battle
    }

    stock[key] = start[key] || 0;
  });

  return {
    stock: stock,
    weakenTimer: 0        // seconds of "the bugs are weaker" left to run
  };
};

/* Which items could ever get a button on this level, in data/items.js order. */
window.Items.battleItems = function () {
  return Object.keys(window.ITEMS).filter(function (key) {
    return !!window.ITEMS[key].battleUse;
  });
};

/* -------------------------------------------------------------------------
   Count down the potion. Called once per simulation step.
   ------------------------------------------------------------------------- */
window.Items.update = function (dt, world) {
  if (!world || !world.items) {
    return;
  }

  if (world.items.weakenTimer > 0) {
    world.items.weakenTimer -= dt;

    if (world.items.weakenTimer < 0) {
      world.items.weakenTimer = 0;
    }
  }
};

/* Are the bugs currently weakened, and for how much longer? */
window.Items.isWeakened = function (world) {
  return !!(world && world.items && world.items.weakenTimer > 0);
};

window.Items.weakenRemaining = function (world) {
  return window.Items.isWeakened(world) ? world.items.weakenTimer : 0;
};

/* -------------------------------------------------------------------------
   What this unit's attack gets multiplied by right now.

   A potion weakens THE OPPONENT, so it only ever softens the enemy team. Your
   own bats are never affected by it.

   This is read at the moment of the hit, and never written into a unit's
   stats - every unit of the same kind SHARES one stats object from
   data/units.js, so changing a number on it would change it for the whole
   game, permanently, including the next battle.
   ------------------------------------------------------------------------- */
window.Items.attackFactorFor = function (unit, world) {
  if (unit.team !== 'enemy') {
    return 1;
  }

  if (!window.Items.isWeakened(world)) {
    return 1;
  }

  return window.ITEMS.potion.damageFactor;
};

/* How many of this item are left? */
window.Items.stockOf = function (key, world) {
  if (!world || !world.items || !world.items.stock) {
    return 0;
  }

  return world.items.stock[key] || 0;
};

/* -------------------------------------------------------------------------
   Can this item be used right this second?
   ------------------------------------------------------------------------- */
window.Items.canUse = function (key, world) {
  var def = window.ITEMS[key];

  if (!def || !def.battleUse) {
    return false;               // blood, or something that is not an item
  }

  if (window.Items.stockOf(key, world) <= 0) {
    return false;
  }

  if (world.battleOver) {
    return false;
  }

  // Rule: no throwing fruit at a tower that has not been hit.
  if (def.battleUse === 'healBase') {
    return world.playerBase.hp < world.playerBase.maxHp;
  }

  return true;
};

/* -------------------------------------------------------------------------
   Use one. Returns what happened so the screen can say so, or null if the
   item could not be used at all.

     { key, name, shout, healed }        healed = health actually given back
   ------------------------------------------------------------------------- */
window.Items.use = function (key, world) {
  if (!window.Items.canUse(key, world)) {
    return null;
  }

  var def = window.ITEMS[key];

  world.items.stock[key] -= 1;

  var outcome = { key: key, name: def.name, shout: def.shout, healed: 0 };

  if (def.battleUse === 'weakenEnemies') {
    // SET, never add - see the rules at the top of this file.
    world.items.weakenTimer = def.seconds;

  } else if (def.battleUse === 'healBase') {
    var base = world.playerBase;
    var wanted = base.maxHp * def.healFraction;
    var room = base.maxHp - base.hp;

    outcome.healed = Math.min(wanted, room);
    base.hp += outcome.healed;
  }

  return outcome;
};
