/* =========================================================================
   CASINO - the rules for suns, blood, the bag and bat upgrades (M4)
   =========================================================================
   The numbers are in data/casino.js; what you own is kept by
   src/systems/progress.js. This file is every rule that changes what you own,
   so the casino screen (src/scenes/CasinoScene.js) and the battle only ever
   call these, and tools/casino-test.js can check every one without a screen.

   ------------------- THE RULES THAT ARE NOT NUMBERS -------------------
     * YOU CAN NEVER GO BELOW ZERO. Anything you cannot afford simply does not
       happen, and says so - it never takes what you have and fails.
     * A SPIN ONLY EVER COSTS THE SPIN. You never lose anything you already
       own in the gamble (B22).
     * AN UPGRADE NEVER TOUCHES data/units.js. Every bat of a kind shares one
       stats object, so an upgrade makes a COPY with the boosted numbers -
       otherwise one upgrade would leak into the balance sim, the next battle
       and every enemy that reads the same object.
     * THE BAG IS ONLY SPENT IN A REAL CAVE. A practice level hands out its
       own items (startItems) and never touches your bag.
   ========================================================================= */

window.Casino = {};

function casinoState() {
  return window.Progress.load();
}

/* -------------------------------------------------------------------------
   SUNS FOR A WIN
   ------------------------------------------------------------------------- */
window.Casino.winReward = function (levelKey, firstWin) {
  var c = window.CASINO;
  var level = window.LEVELS[levelKey];

  if (!level || level.practice) {
    return 0;                       // practice is practice
  }

  if (!firstWin) {
    return c.replayWin;
  }

  return c.firstWinBase + (c.firstWinPerCave * window.Caves.numberOf(levelKey));
};

/* Pay out a win. Returns how many suns it was, for the victory screen. */
window.Casino.awardWin = function (levelKey, firstWin) {
  var suns = window.Casino.winReward(levelKey, firstWin);

  if (suns > 0) {
    casinoState().suns += suns;
    window.Progress.save();
  }

  return suns;
};

/* -------------------------------------------------------------------------
   THE SHOP
   ------------------------------------------------------------------------- */
window.Casino.priceOf = function (itemKey) {
  return window.CASINO.prices[itemKey];
};

/* Buy one potion or fruit. True if it worked, false if you cannot afford it. */
window.Casino.buy = function (itemKey) {
  var state = casinoState();
  var price = window.Casino.priceOf(itemKey);

  if (price === undefined || state.suns < price) {
    return false;
  }

  state.suns -= price;
  state.bag[itemKey] = (state.bag[itemKey] || 0) + 1;
  window.Progress.save();
  return true;
};

/* Swap one bundle of suns for blood. */
window.Casino.tradeForBlood = function () {
  var state = casinoState();
  var trade = window.CASINO.bloodTrade;

  if (state.suns < trade.suns) {
    return false;
  }

  state.suns -= trade.suns;
  state.blood += trade.blood;
  window.Progress.save();
  return true;
};

/* -------------------------------------------------------------------------
   THE GAMBLE
   'roll' is a function giving a number from 0 up to (not including) 1. The
   game passes Math.random; the tests pass a fixed sequence, so a spin can be
   checked rather than hoped about.

   Returns the prize (from data/casino.js), or null if you could not afford
   the spin - in which case nothing at all has changed.
   ------------------------------------------------------------------------- */
window.Casino.pickPrize = function (roll) {
  var prizes = window.CASINO.prizes;
  var total = prizes.reduce(function (sum, p) { return sum + p.weight; }, 0);
  var r = roll() * total;
  var i;

  for (i = 0; i < prizes.length; i++) {
    r -= prizes[i].weight;
    if (r < 0) {
      return prizes[i];
    }
  }

  return prizes[prizes.length - 1];   // only reached if roll() returned 1
};

window.Casino.spin = function (roll) {
  var state = casinoState();
  var cost = window.CASINO.spinCost;

  if (state.suns < cost) {
    return null;
  }

  state.suns -= cost;

  var prize = window.Casino.pickPrize(roll || Math.random);
  state.bag.potion += prize.potion;
  state.bag.fruit += prize.fruit;
  window.Progress.save();
  return prize;
};

/* -------------------------------------------------------------------------
   CASINO BATS - bats with a casinoPrice in data/units.js, sold for blood
   ------------------------------------------------------------------------- */
window.Casino.casinoBats = function () {
  return Object.keys(window.UNITS).filter(function (key) {
    return !window.UNITS[key].enemy && !!window.UNITS[key].casinoPrice;
  });
};

window.Casino.ownedCasinoBats = function () {
  return casinoState().casinoBats.slice();
};

window.Casino.ownsBat = function (unitKey) {
  return window.Casino.ownedBats().indexOf(unitKey) !== -1;
};

/* The casino bats still to get. */
window.Casino.unownedCasinoBats = function () {
  var owned = casinoState().casinoBats;
  return window.Casino.casinoBats().filter(function (key) { return owned.indexOf(key) === -1; });
};

window.Casino.buyBat = function (unitKey) {
  var state = casinoState();
  var stats = window.UNITS[unitKey];

  if (!stats || !stats.casinoPrice || state.casinoBats.indexOf(unitKey) !== -1 ||
      state.blood < stats.casinoPrice) {
    return false;
  }

  state.blood -= stats.casinoPrice;
  state.casinoBats.push(unitKey);
  window.Progress.save();
  return true;
};

/* -------------------------------------------------------------------------
   A BAT SPIN. Returns { won: 'unitKey' } or { won: null } for nothing, or
   null if it could not be spun at all (not enough blood, or you already own
   every casino bat) - in which case nothing has changed. 'roll' as for spin().
   ------------------------------------------------------------------------- */
window.Casino.spinForBat = function (roll) {
  var state = casinoState();
  var spin = window.CASINO.batSpin;
  var left = window.Casino.unownedCasinoBats();
  roll = roll || Math.random;

  if (!left.length || state.blood < spin.cost) {
    return null;
  }

  state.blood -= spin.cost;

  var won = null;
  if (roll() < spin.winChance) {
    won = left[Math.floor(roll() * left.length)];
    state.casinoBats.push(won);
  }

  window.Progress.save();
  return { won: won };
};

/* -------------------------------------------------------------------------
   UPGRADES - a bat's place on the colour ladder (CONFIG.upgradeTiers)
   ------------------------------------------------------------------------- */

/* The bats you own: the ones you started with, one for each cave beaten, and
   every casino bat you have bought or won. */
window.Casino.ownedBats = function () {
  var owned = window.LEVELS[window.Caves.all()[0]].playerUnits.slice();

  window.Caves.all().forEach(function (key) {
    var earned = window.Caves.earnedBy(key);
    if (earned && window.Progress.hasBeaten(key) && owned.indexOf(earned) === -1) {
      owned.push(earned);
    }
  });

  return owned.concat(casinoState().casinoBats.filter(function (key) {
    return owned.indexOf(key) === -1;
  }));
};

window.Casino.tierOf = function (unitKey) {
  return casinoState().upgrades[unitKey] || 0;
};

window.Casino.topTier = function () {
  return window.CONFIG.upgradeTiers.length - 1;
};

/* Blood for this bat's NEXT step, or null if it is already Red. */
window.Casino.nextUpgradeCost = function (unitKey) {
  var tier = window.Casino.tierOf(unitKey);
  return tier >= window.Casino.topTier() ? null : window.CASINO.upgradeCost[tier];
};

window.Casino.upgrade = function (unitKey) {
  var state = casinoState();
  var cost = window.Casino.nextUpgradeCost(unitKey);

  if (cost === null || state.blood < cost ||
      window.Casino.ownedBats().indexOf(unitKey) === -1) {
    return false;
  }

  state.blood -= cost;
  state.upgrades[unitKey] = window.Casino.tierOf(unitKey) + 1;
  window.Progress.save();
  return true;
};

/* How much stronger a bat on this step is: 1 = as drawn, 1.6 = Red. */
window.Casino.boostFor = function (tier) {
  return 1 + (tier * window.CASINO.statBoost);
};

/* -------------------------------------------------------------------------
   The stats a bat of this kind fights with in the GAME, upgrades included.
   A copy for an upgraded bat (see the rules at the top), the shared original
   for a plain one or a bug. Copies are remembered, so a battle makes each one
   once, not once per bat.
   ------------------------------------------------------------------------- */
var upgradedCache = {};

window.Casino.statsFor = function (unitKey) {
  var base = window.UNITS[unitKey];
  var tier = base.enemy ? 0 : window.Casino.tierOf(unitKey);

  if (tier === 0) {
    return base;
  }

  var cacheKey = unitKey + ':' + tier;
  if (!upgradedCache[cacheKey]) {
    var boost = window.Casino.boostFor(tier);
    var copy = Object.assign({}, base);
    copy.hp = Math.round(base.hp * boost);
    copy.attack = Math.round(base.attack * boost * 10) / 10;
    upgradedCache[cacheKey] = copy;
  }

  return upgradedCache[cacheKey];
};

/* The colour to tint this bat with, or null for plain (as drawn). */
window.Casino.tintFor = function (unitKey) {
  var tier = window.Casino.tierOf(unitKey);
  return tier > 0 ? window.CONFIG.upgradeTiers[tier].tint : null;
};

/* -------------------------------------------------------------------------
   THE BAG IN A BATTLE
   What you carry into this level: a practice level's own handout, or up to
   maxPerBattle of each from your bag.
   ------------------------------------------------------------------------- */
window.Casino.carriedInto = function (level) {
  if (level && level.startItems) {
    return null;                    // Items uses the level's own handout
  }

  var bag = casinoState().bag;
  var most = window.CASINO.maxPerBattle;
  return { potion: Math.min(bag.potion, most), fruit: Math.min(bag.fruit, most) };
};

/* One was used in a battle: it is gone from the bag too (real caves only). */
window.Casino.usedFromBag = function (itemKey, level) {
  if (level && level.startItems) {
    return;
  }

  var bag = casinoState().bag;
  if (bag[itemKey] > 0) {
    bag[itemKey] -= 1;
    window.Progress.save();
  }
};
