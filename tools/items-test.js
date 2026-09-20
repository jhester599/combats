/* =========================================================================
   ITEMS TEST - check potions and fruit behave themselves
   =========================================================================
   Run it with Node:

       node tools/items-test.js

   Potions and fruit (src/systems/items.js, homework B27) have rules that are
   not about how the game FEELS, they are about the game staying fair and not
   quietly breaking:

     * A POTION SETS THE TIMER, IT DOES NOT ADD TO IT. Three potions must give
       ten weakened seconds, not thirty - otherwise a player who saved up six of
       them could switch a whole cave off.
     * A POTION WEAKENS THE BUGS ONLY. Your own bats must never be softened by
       your own potion.
     * IT MUST NOT WRITE ON A UNIT'S STATS. Every bug of one kind SHARES one
       stats object out of data/units.js, so weakening "the scorpions" by editing
       that object would weaken every scorpion in the game for ever, including
       in the next battle. The multiplier has to be worked out at the moment of
       the hit.
     * FRUIT CANNOT OVERHEAL, and cannot be thrown at a full tower.
     * NOTHING CAN BE SPENT once the battle is over, or when you have none left.

   It is a TESTING TOOL ONLY. The game never loads it.
   ========================================================================= */

var path = require('path');
var root = path.join(__dirname, '..');

global.window = {};
require(path.join(root, 'data/config.js'));
require(path.join(root, 'data/units.js'));
require(path.join(root, 'data/items.js'));
require(path.join(root, 'src/systems/sting.js'));
require(path.join(root, 'src/systems/items.js'));
require(path.join(root, 'src/systems/combat.js'));

var W = global.window;

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

function fakeBase(hp, maxHp) {
  return {
    hp: hp,
    maxHp: maxHp,
    takeDamage: function (amount) { this.hp -= amount; if (this.hp < 0) { this.hp = 0; } }
  };
}

/* A world with whatever starting stock the test wants. */
function fakeWorld(startItems, baseHp, baseMaxHp) {
  return {
    items: W.Items.createState({ startItems: startItems }),
    playerBase: fakeBase(baseHp === undefined ? 1000 : baseHp, baseMaxHp || 1000),
    battleOver: false
  };
}

function fakeBug(attack) {
  return { team: 'enemy', hp: 55, stats: { attack: attack },
    takeDamage: function (a) { this.hp -= a; } };
}

function fakeBat(attack) {
  return { team: 'player', hp: 40, stats: { attack: attack },
    takeDamage: function (a) { this.hp -= a; } };
}

function fakeTarget(hp) {
  return { team: 'player', hp: hp, isDying: false, stats: { name: 'thing', hp: hp },
    takeDamage: function (a) { this.hp -= a; if (this.hp <= 0) { this.hp = 0; this.isDying = true; } } };
}

var potion = W.ITEMS.potion;
var fruit = W.ITEMS.fruit;

console.log('');
console.log('  WHAT YOU START WITH');

var world = fakeWorld({ potion: 2, fruit: 1 });
check('the level\'s potions are in the bag', W.Items.stockOf('potion', world), 2);
check('the level\'s fruit is in the bag', W.Items.stockOf('fruit', world), 1);
check('a level that gives nothing leaves you empty',
  W.Items.stockOf('potion', fakeWorld({})), 0);
check('BLOOD is never carried into a battle - it is only money',
  W.Items.createState({ startItems: { blood: 9 } }).stock.blood, undefined);
check('and blood gets no battle button',
  W.Items.battleItems().indexOf('blood'), -1);
check('potions and fruit both do', W.Items.battleItems().join(','), 'potion,fruit');

console.log('');
console.log('  A POTION WEAKENS THE BUGS');

world = fakeWorld({ potion: 3 });
check('before drinking one, nothing is weakened', W.Items.isWeakened(world), false);
check('a bug hits at full strength', W.Items.attackFactorFor(fakeBug(20), world), 1);

W.Items.use('potion', world);
check('drinking one weakens the bugs', W.Items.isWeakened(world), true);
check('it costs you one potion', W.Items.stockOf('potion', world), 2);
check('a bug now hits for the potion\'s fraction',
  W.Items.attackFactorFor(fakeBug(20), world), potion.damageFactor);
check('but YOUR bats are not weakened by your own potion',
  W.Items.attackFactorFor(fakeBat(20), world), 1);

console.log('');
console.log('  THE DAMAGE THAT LANDS IS REALLY SMALLER');

world = fakeWorld({ potion: 1 });
var bug = fakeBug(20);
var target = fakeTarget(500);

W.Sting.useSeed(1);
W.Combat.strike(bug, target, world);
check('at full strength a 20-damage bug takes off 20', target.hp, 480);

W.Items.use('potion', world);
W.Combat.strike(bug, target, world);
check('weakened, the same bug takes off half that',
  target.hp, 480 - (20 * potion.damageFactor));

console.log('');
console.log('  AND IT NEVER WRITES ON THE SHARED STATS');

check('the bug definition in data/units.js is untouched', bug.stats.attack, 20);
check('the real Scorpion\'s attack is still its own number',
  W.UNITS.scorpion.attack, 26);

console.log('');
console.log('  A POTION SETS THE CLOCK, IT DOES NOT STACK');

world = fakeWorld({ potion: 3 });
W.Items.use('potion', world);
W.Items.use('potion', world);
W.Items.use('potion', world);
check('three potions still give one potion\'s worth of time',
  world.items.weakenTimer, potion.seconds);
check('and all three are gone from the bag', W.Items.stockOf('potion', world), 0);

console.log('');
console.log('  THE POTION RUNS OUT');

world = fakeWorld({ potion: 1 });
W.Items.use('potion', world);
W.Items.update(potion.seconds - 0.5, world);
check('just before time, the bugs are still weak', W.Items.isWeakened(world), true);
W.Items.update(1, world);
check('after that, they are back to full strength', W.Items.isWeakened(world), false);
check('and the timer never goes negative', world.items.weakenTimer, 0);
check('a bug hits at full strength again',
  W.Items.attackFactorFor(fakeBug(20), world), 1);

console.log('');
console.log('  FRUIT HEALS YOUR TOWER, SLIGHTLY');

world = fakeWorld({ fruit: 2 }, 500, 1000);
var outcome = W.Items.use('fruit', world);
check('it gives back the fruit\'s fraction of the tower\'s FULL health',
  world.playerBase.hp, 500 + (1000 * fruit.healFraction));
check('and says how much it healed', outcome.healed, 1000 * fruit.healFraction);
check('"only slightly" really is slight - under a fifth of the tower',
  fruit.healFraction < 0.2, true);

console.log('');
console.log('  FRUIT CANNOT OVERHEAL OR BE WASTED');

world = fakeWorld({ fruit: 2 }, 1000, 1000);
check('a full tower refuses the fruit', W.Items.canUse('fruit', world), false);
check('so tapping it does nothing at all', W.Items.use('fruit', world), null);
check('and the fruit is still in the bag', W.Items.stockOf('fruit', world), 2);

world = fakeWorld({ fruit: 1 }, 999, 1000);
W.Items.use('fruit', world);
check('a nearly-full tower is healed to exactly full, never past it',
  world.playerBase.hp, 1000);

console.log('');
console.log('  WHEN AN ITEM CANNOT BE USED');

world = fakeWorld({ potion: 0 });
check('no potions left means the button does nothing',
  W.Items.canUse('potion', world), false);
check('and using one returns nothing', W.Items.use('potion', world), null);

world = fakeWorld({ potion: 1 });
world.battleOver = true;
check('a finished battle takes no more potions',
  W.Items.canUse('potion', world), false);
check('so the potion survives to the next battle',
  W.Items.stockOf('potion', world), 1);

check('blood can never be "used" even if something asks',
  W.Items.canUse('blood', fakeWorld({ blood: 5 })), false);
check('nor can a made-up item', W.Items.canUse('sausage', fakeWorld({})), false);

console.log('');
console.log('  THE TEN CAVES DELIBERATELY HAVE NO ITEMS');
console.log('  (they are measured without them, so an item is always a bonus,');
console.log('   never something you can arrive at a cave unable to win without)');

require(path.join(root, 'data/levels.js'));
require(path.join(root, 'src/systems/caves.js'));

var cavesWithItems = W.Caves.all().filter(function (key) {
  return !!W.LEVELS[key].startItems;
});
check('no real cave hands out items yet', cavesWithItems.join(','), '');
check('and the practice level does, so Lewis can try them today',
  !!W.LEVELS.graveyard.startItems, true);

console.log('');
console.log('  ' + passed + ' passed, ' + failed + ' failed');
console.log('');

process.exit(failed === 0 ? 0 : 1);
