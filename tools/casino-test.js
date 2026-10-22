/* =========================================================================
   CASINO TEST - check suns, blood, the bag and upgrades behave themselves
   =========================================================================
   Run it with Node:

       node tools/casino-test.js

   The casino (src/systems/casino.js, milestone M4) handles things the player
   has SAVED UP, so its rules are about never cheating anybody:

     * YOU CAN NEVER GO BELOW ZERO. Anything you cannot afford does not happen
       at all - it must not take your suns and then fail.
     * A SPIN ONLY EVER COSTS THE SPIN. Nothing you already own is ever lost.
     * AN UPGRADE NEVER WRITES ON data/units.js. Every bat of a kind shares one
       stats object, so editing it would leak into the next battle, the
       balance sim, and every bug that reads the same object.
     * THE BAG IS SPENT ONLY IN REAL CAVES, and only up to maxPerBattle at once.
     * A SAVE IS NEVER TRUSTED. A broken or edited save must load as something
       sensible, never as a million suns or a bat that does not exist.

   The spins are tested with a fixed list of "random" numbers, so a spin can
   be checked rather than hoped about. It is a TESTING TOOL ONLY.
   ========================================================================= */

var path = require('path');
var root = path.join(__dirname, '..');

global.window = {};
require(path.join(root, 'data/config.js'));
require(path.join(root, 'data/units.js'));
require(path.join(root, 'data/levels.js'));
require(path.join(root, 'data/items.js'));
require(path.join(root, 'data/casino.js'));
require(path.join(root, 'src/systems/caves.js'));
require(path.join(root, 'src/systems/team.js'));
require(path.join(root, 'src/systems/progress.js'));
require(path.join(root, 'src/systems/items.js'));
require(path.join(root, 'src/systems/casino.js'));

var W = global.window;
var C = W.CASINO;

/* A pretend localStorage, so saving and loading can be tested in Node. */
var stored = {};
W.localStorage = {
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(stored, k) ? stored[k] : null; },
  setItem: function (k, v) { stored[k] = String(v); },
  removeItem: function (k) { delete stored[k]; }
};

var passed = 0;
var failed = 0;

function check(what, got, want) {
  if (got === want) {
    passed++;
    console.log('  ok    ' + what);
  } else {
    failed++;
    console.log('  FAIL  ' + what + '  (got ' + got + ', wanted ' + want + ')');
  }
}

/* Start again from nothing, with this much money. */
function fresh(suns, blood) {
  stored = {};
  W.Progress.reset();
  var s = W.Progress.load();
  s.suns = suns || 0;
  s.blood = blood || 0;
  return s;
}

/* Load what was saved, as if the page had just been opened again. */
function reopen() {
  W.Progress.state = null;
  return W.Progress.load();
}

/* A roll() that hands out these numbers in turn. */
function rolls(list) {
  var i = 0;
  return function () { return list[i++]; };
}

var caves = W.Caves.all();
var practiceKey = W.Caves.practice()[0];

/* ------------------------------------------------------------------------- */
console.log('\nSUNS FOR A WIN');

check('first win of cave 1 pays base + 1 step', W.Casino.winReward(caves[0], true),
  C.firstWinBase + C.firstWinPerCave);
check('first win of the last cave pays the most', W.Casino.winReward(caves[caves.length - 1], true),
  C.firstWinBase + (C.firstWinPerCave * caves.length));
check('a replay of cave 4 pays its replay rate', W.Casino.winReward(caves[3], false),
  C.replayWinBase + (4 * C.replayWinPerCave));
check('every cave pays more than the one before, first time AND again (Jeff, 2026-10-22)',
  caves.every(function (k, i) {
    return i === 0 || (W.Casino.winReward(k, true) > W.Casino.winReward(caves[i - 1], true) &&
      W.Casino.winReward(k, false) > W.Casino.winReward(caves[i - 1], false));
  }), true);
check('a replay always pays less than a first win', caves.every(function (k) {
  return W.Casino.winReward(k, false) < W.Casino.winReward(k, true);
}), true);
check('practice pays nothing', W.Casino.winReward(practiceKey, true), 0);

fresh();
var paid = W.Casino.awardWin(caves[0], true);
check('awardWin says what it paid', paid, C.firstWinBase + C.firstWinPerCave);
check('...and it is in the wallet', W.Progress.load().suns, paid);
check('...and it is saved', reopen().suns, paid);
check('practice adds nothing to the wallet', (W.Casino.awardWin(practiceKey, true), W.Progress.load().suns), paid);

/* ------------------------------------------------------------------------- */
console.log('\nTHE CASINO OPENS AT THE FIRST SUN');

// A pretend scene that just remembers where it was sent.
function fakeScene() {
  var f = { went: null };
  f.scene = { start: function (key, data) { f.went = { key: key, data: data }; } };
  return f;
}

fresh();
check('a brand-new player has no casino', W.Casino.isOpen(), false);
var trip = fakeScene();
W.Casino.betweenRounds(trip, caves[0]);
check('...so NEXT CAVE goes straight on, not to the casino', trip.went.key !== 'CasinoScene', true);
W.Casino.awardWin(practiceKey, true);
check('practice earns no suns, so it opens nothing', W.Casino.isOpen(), false);
W.Casino.awardWin(caves[0], true);
check('the first win opens it', W.Casino.isOpen(), true);
W.Progress.load().suns = 0;
check('...and spending every sun does not close it again', W.Casino.isOpen(), true);
check('...which is remembered', reopen().sunsEarned > 0, true);

trip = fakeScene();
W.Casino.betweenRounds(trip, caves[1]);
check('once open, NEXT CAVE stops at the casino', trip.went.key, 'CasinoScene');
check('...remembering where you were going', trip.went.data.then.levelKey, caves[1]);
check('...with no team, so it carries on the usual way', trip.went.data.then.team, null);

var retryTeam = W.LEVELS[caves[0]].playerUnits.slice(0, W.Team.size());
trip = fakeScene();
W.Casino.betweenRounds(trip, caves[0], retryTeam);
check('RETRY stops at the casino too', trip.went.key, 'CasinoScene');
var onward = fakeScene();
W.Casino.carryOn(onward, trip.went.data.then, W.Progress.load().casinoBats.length);
check('...and carries on straight into the same battle', onward.went.key, 'BattleScene');
check('...with the same team', onward.went.data.team.join(), retryTeam.join());

check('a save from before this keeps its casino open if it has suns',
  (stored = {}, stored[W.Progress.STORAGE_KEY] = JSON.stringify({ beaten: [], suns: 7 }), reopen().sunsEarned), 7);

/* ------------------------------------------------------------------------- */
console.log('\nTHE SHOP');

fresh(C.prices.potion);
check('can buy a potion with exactly enough', W.Casino.buy('potion'), true);
check('...the suns are spent', W.Progress.load().suns, 0);
check('...the potion is in the bag', W.Progress.load().bag.potion, 1);
check('cannot buy a fruit with no suns', W.Casino.buy('fruit'), false);
check('...nothing went below zero', W.Progress.load().suns, 0);
check('...and no fruit appeared', W.Progress.load().bag.fruit, 0);
check('cannot buy something that is not for sale', (fresh(999), W.Casino.buy('dragon')), false);
check('...and it cost nothing', W.Progress.load().suns, 999);

check('1 sun buys 5 blood (Jeff, 2026-10-22)', C.bloodPerSun, 5);
fresh(11);
check('swap 10 suns for blood', W.Casino.tradeForBlood(10), true);
check('...blood went up by 10 suns\' worth', W.Progress.load().blood, 10 * C.bloodPerSun);
check('...suns went down', W.Progress.load().suns, 1);
check('cannot swap 10 with only 1 left', W.Casino.tradeForBlood(10), false);
check('...nothing changed', W.Progress.load().suns + '/' + W.Progress.load().blood,
  '1/' + (10 * C.bloodPerSun));
check('can swap the last single sun', W.Casino.tradeForBlood(1), true);
check('...and that is 5 more blood', W.Progress.load().blood, 11 * C.bloodPerSun);
check('cannot swap 0, half or minus suns',
  [0, 0.5, -3, 'x'].some(function (n) { return (W.Progress.load().suns = 5, W.Casino.tradeForBlood(n)); }), false);
check('...and none of that made blood', W.Progress.load().blood, 11 * C.bloodPerSun);
check('every swap button is a whole number of suns',
  C.swapSizes.every(function (n) { return n > 0 && n === Math.floor(n); }), true);

/* ------------------------------------------------------------------------- */
console.log('\nTHE GAMBLE');

check('roll 0 is the first prize', W.Casino.pickPrize(rolls([0])).name, C.prizes[0].name);
check('roll just under 1 is the last prize (the jackpot)', W.Casino.pickPrize(rolls([0.9999])).name,
  C.prizes[C.prizes.length - 1].name);
check('roll of exactly 1 still lands on a prize', !!W.Casino.pickPrize(rolls([1])), true);

// Every prize comes up as often as its weight says, over an even sweep of rolls.
var total = C.prizes.reduce(function (sum, p) { return sum + p.weight; }, 0);
var counts = {};
var n;
for (n = 0; n < total * 100; n++) {
  var prize = W.Casino.pickPrize(rolls([(n + 0.5) / (total * 100)]));
  counts[prize.name] = (counts[prize.name] || 0) + 1;
}
C.prizes.forEach(function (p) {
  check('"' + p.name + '" comes up ' + p.weight + ' times in ' + total, counts[p.name], p.weight * 100);
});

// The fairness rule: a spin is worth a little less than the shop, never more.
var worth = C.prizes.reduce(function (sum, p) {
  return sum + (p.weight / total) * ((p.potion * C.prices.potion) + (p.fruit * C.prices.fruit));
}, 0);
check('a spin is worth less than it costs (so it is a gamble, not a better shop)', worth < C.spinCost, true);
check('...but not a rip-off (over 70% back on average)', worth > C.spinCost * 0.7, true);

var s = fresh(C.spinCost);
s.bag.potion = 2;
var jackpot = W.Casino.spin(rolls([0.9999]));
check('a spin pays its prize', jackpot.name, C.prizes[C.prizes.length - 1].name);
check('...into the bag, on top of what was there', W.Progress.load().bag.potion, 2 + jackpot.potion);
check('...and costs the spin', W.Progress.load().suns, 0);
check('cannot spin without the suns', W.Casino.spin(rolls([0.9999])), null);
check('...and the bag is untouched', W.Progress.load().bag.potion, 2 + jackpot.potion);

s = fresh(C.spinCost);
s.bag.fruit = 4;
W.Casino.spin(rolls([0]));
check('losing a spin keeps what you already had', W.Progress.load().bag.fruit, 4);

/* ------------------------------------------------------------------------- */
console.log('\nCASINO BATS');

// No casino bats are drawn yet, so borrow two stand-ins for the test.
check('a casino bat is never a bug', W.Casino.casinoBats().every(function (k) { return !W.UNITS[k].enemy; }), true);
var realBats = W.Casino.casinoBats().length;
W.UNITS.testLuckyBat = Object.assign({}, W.UNITS[W.LEVELS[caves[0]].playerUnits[0]],
  { name: 'Lucky Bat', casinoPrice: 50 });
W.UNITS.testDiceBat = Object.assign({}, W.UNITS.testLuckyBat, { name: 'Dice Bat', casinoPrice: 80 });
check('the shelf finds the stand-ins', W.Casino.casinoBats().length, realBats + 2);

fresh(0, 49);
check('cannot buy a bat one blood short', W.Casino.buyBat('testLuckyBat'), false);
check('...and the blood is all still there', W.Progress.load().blood, 49);
W.Progress.load().blood = 50;
check('can buy with exactly enough', W.Casino.buyBat('testLuckyBat'), true);
check('...it is owned', W.Casino.ownsBat('testLuckyBat'), true);
check('...it is saved', reopen().casinoBats.join(), 'testLuckyBat');
var afterBuy = fakeScene();
W.Casino.carryOn(afterBuy, { levelKey: caves[0], team: W.LEVELS[caves[0]].playerUnits.slice(0, W.Team.size()) }, 0);
check('a RETRY after buying a casino bat goes in with it (or via the Locker to pick it)',
  afterBuy.went.key === 'LockerScene' || afterBuy.went.data.team.indexOf('testLuckyBat') !== -1, true);
W.Progress.load().blood = 500;
check('cannot buy the same bat twice', W.Casino.buyBat('testLuckyBat'), false);
check('cannot buy a bat that is not a casino bat', W.Casino.buyBat(W.LEVELS[caves[0]].playerUnits[0]), false);
check('cannot buy a bug', W.Casino.buyBat('scorpion'), false);
check('...none of that cost anything', W.Progress.load().blood, 500);

check('an owned casino bat is in every cave\'s Locker pool',
  caves.every(function (k) { return W.Team.poolFor(k).indexOf('testLuckyBat') !== -1; }), true);
check('...but not in a practice level', W.Team.poolFor(practiceKey).indexOf('testLuckyBat'), -1);
check('an unowned one is not', W.Team.poolFor(caves[0]).indexOf('testDiceBat'), -1);

fresh(0, C.batSpin.cost * 2);
var miss = W.Casino.spinForBat(rolls([C.batSpin.winChance + 0.01]));
check('a missed bat spin wins nothing', miss.won, null);
check('...and costs the spin', W.Progress.load().blood, C.batSpin.cost);
var hit = W.Casino.spinForBat(rolls([0, 0.99]));
check('a winning bat spin wins one you do not own', hit.won, 'testDiceBat');
check('...it is yours', W.Casino.ownsBat('testDiceBat'), true);
check('cannot bat-spin without the blood', W.Casino.spinForBat(rolls([0, 0])), null);

W.Progress.load().blood = 999;
W.Progress.load().casinoBats = W.Casino.casinoBats();
check('cannot bat-spin when you own them all', W.Casino.spinForBat(rolls([0, 0])), null);
check('...and it cost nothing', W.Progress.load().blood, 999);

/* ------------------------------------------------------------------------- */
console.log('\nUPGRADES');

var starter = W.LEVELS[caves[0]].playerUnits[0];
var lateBat = W.Caves.earnedBy(caves[caves.length - 2]);
var starterStats = W.UNITS[starter];
var hpBefore = starterStats.hp;
var attackBefore = starterStats.attack;

fresh(0, 0);
check('a new bat is Plain', W.Casino.tierOf(starter), 0);
check('a Plain bat fights with the shared stats', W.Casino.statsFor(starter), starterStats);
check('...and has no tint', W.Casino.tintFor(starter), null);
check('the first step costs upgradeCost[0]', W.Casino.nextUpgradeCost(starter), C.upgradeCost[0]);
check('cannot upgrade without the blood', W.Casino.upgrade(starter), false);

W.Progress.load().blood = 10000;
if (lateBat) {
  check('cannot upgrade a bat you have not earned yet', W.Casino.upgrade(lateBat), false);
}
check('cannot upgrade a bug', W.Casino.upgrade('scorpion'), false);
check('...none of that cost anything', W.Progress.load().blood, 10000);

check('upgrade a starting bat', W.Casino.upgrade(starter), true);
check('...it is Violet', W.CONFIG.upgradeTiers[W.Casino.tierOf(starter)].name, 'Violet');
check('...it cost upgradeCost[0]', W.Progress.load().blood, 10000 - C.upgradeCost[0]);
check('...it has the Violet tint', W.Casino.tintFor(starter), W.CONFIG.upgradeTiers[1].tint);
check('...it is saved', reopen().upgrades[starter], 1);

var boosted = W.Casino.statsFor(starter);
check('an upgraded bat fights with a COPY', boosted !== starterStats, true);
check('...with more health', boosted.hp, Math.round(hpBefore * (1 + C.statBoost)));
check('...and data/units.js is untouched (hp)', starterStats.hp, hpBefore);
check('...and data/units.js is untouched (attack)', starterStats.attack, attackBefore);
check('the copy is made once, not once per bat', W.Casino.statsFor(starter), boosted);

while (W.Casino.nextUpgradeCost(starter) !== null) {
  W.Casino.upgrade(starter);
}
check('climbs all the way to Red', W.CONFIG.upgradeTiers[W.Casino.tierOf(starter)].name, 'Red');
check('...for every step of upgradeCost', W.Progress.load().blood, 10000 - C.upgradeCost.reduce(function (a, b) { return a + b; }, 0));
check('...a Red bat has 1 + 4 steps of health', W.Casino.statsFor(starter).hp,
  Math.round(hpBefore * (1 + (4 * C.statBoost))));
var bloodAtRed = W.Progress.load().blood;
check('cannot go past Red', W.Casino.upgrade(starter), false);
check('...and that cost nothing', W.Progress.load().blood, bloodAtRed);
check('a bug is never boosted, even with a save that says so',
  (W.Progress.load().upgrades.scorpion = 4, W.Casino.statsFor('scorpion')), W.UNITS.scorpion);
check('upgradeCost has one price per step of the ladder', C.upgradeCost.length, W.CONFIG.upgradeTiers.length - 1);

/* ------------------------------------------------------------------------- */
console.log('\nTHE BAG IN A BATTLE');

var bag = fresh().bag;
bag.potion = 7;
bag.fruit = 1;
var carried = W.Casino.carriedInto(W.LEVELS[caves[0]]);
check('take at most maxPerBattle potions into a cave', carried.potion, C.maxPerBattle);
check('...and all the fruit if you have fewer', carried.fruit, 1);
check('a practice level uses its own handout', W.Casino.carriedInto(W.LEVELS[practiceKey]), null);

var battleItems = W.Items.createState(W.LEVELS[caves[0]], carried);
check('the battle starts holding what was carried', battleItems.stock.potion + '/' + battleItems.stock.fruit,
  C.maxPerBattle + '/1');
var practiceItems = W.Items.createState(W.LEVELS[practiceKey], W.Casino.carriedInto(W.LEVELS[practiceKey]));
check('practice starts with its own startItems', practiceItems.stock.potion, W.LEVELS[practiceKey].startItems.potion);

W.Casino.usedFromBag('potion', W.LEVELS[caves[0]]);
check('using a potion in a cave takes it from the bag', W.Progress.load().bag.potion, 6);
check('...and that is saved', reopen().bag.potion, 6);
W.Casino.usedFromBag('potion', W.LEVELS[practiceKey]);
check('using one in practice does not', W.Progress.load().bag.potion, 6);
W.Progress.load().bag.fruit = 0;
W.Casino.usedFromBag('fruit', W.LEVELS[caves[0]]);
check('the bag never goes below zero', W.Progress.load().bag.fruit, 0);

/* ------------------------------------------------------------------------- */
console.log('\nA SAVE IS NEVER TRUSTED');

function loadRaw(text) {
  stored = {};
  stored[W.Progress.STORAGE_KEY] = text;
  return reopen();
}

var old = loadRaw(JSON.stringify({ beaten: [caves[0]], team: [] }));
check('a save from before the casino starts with no suns', old.suns, 0);
check('...an empty bag', old.bag.potion + old.bag.fruit, 0);
check('...and keeps its beaten caves', old.beaten.join(), caves[0]);

var bad = loadRaw(JSON.stringify({
  beaten: [], suns: -50, blood: 'lots', bag: { potion: 2.7, fruit: Infinity },
  casinoBats: ['testLuckyBat', 'testLuckyBat', 'noSuchBat', starter, 7],
  upgrades: { scorpion: 3, noSuchBat: 2 }
}));
var upgradesBad = {};
upgradesBad[starter] = 99;
check('negative suns load as 0', bad.suns, 0);
check('words for blood load as 0', bad.blood, 0);
check('half a potion rounds down', bad.bag.potion, 2);
check('infinite fruit loads as 0', bad.bag.fruit, 0);
check('casino bats: only real ones, once each', bad.casinoBats.join(), 'testLuckyBat');
check('upgrades: never a bug, never a bat that does not exist', Object.keys(bad.upgrades).length, 0);
check('an upgrade past Red is clamped to Red',
  loadRaw(JSON.stringify({ beaten: [], upgrades: upgradesBad })).upgrades[starter], W.CONFIG.upgradeTiers.length - 1);
check('a save that is not JSON at all loads blank', loadRaw('{{{ not json').suns, 0);

/* Put things back - the stand-ins must not leak. */
delete W.UNITS.testLuckyBat;
delete W.UNITS.testDiceBat;

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed ? 1 : 0);
