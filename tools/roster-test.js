/* =========================================================================
   ROSTER TEST - beat a cave, earn a bat; and the Bat Bros really are two
   =========================================================================
   Run it with Node:

       node tools/roster-test.js

   Two things arrived together on 2026-10-12 and both are easy to break
   without anything crashing:

     * THE UNLOCK CHAIN (src/systems/caves.js). Each cave's bats are worked
       out from cave 1's starting list plus every  unlocks:  line before it.
       Get it wrong and a bat quietly turns up a cave early, or never.
     * SQUADS (src/systems/squad.js). One Bat Bros tap must send TWO Scout
       Bats, in the game and in the balance sim alike.

   It also pins the order Jeff asked for, so changing it is a decision
   somebody makes on purpose rather than an accident:

     cave 1: Scout + Brute.  Beat it -> Archer.  Beat cave 2 -> Bat Bros.
     Beat cave 3 -> Necrobatcer.

   It is a TESTING TOOL ONLY. The game never loads it.
   ========================================================================= */

var path = require('path');
var root = path.join(__dirname, '..');

global.window = {};
require(path.join(root, 'data/config.js'));
require(path.join(root, 'data/units.js'));
require(path.join(root, 'data/levels.js'));
require(path.join(root, 'src/systems/squad.js'));
require(path.join(root, 'src/systems/caves.js'));

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

var caves = W.Caves.all();

console.log('');
console.log('  THE ORDER JEFF ASKED FOR');

check('cave 1 starts you with Scout + Brute',
  W.LEVELS[caves[0]].playerUnits.join(','), 'scoutBat,bruteBat');
check('beating cave 1 earns the Archer', W.Caves.earnedBy(caves[0]), 'archerBat');
check('beating cave 2 earns the Bat Bros', W.Caves.earnedBy(caves[1]), 'batBros');
check('beating cave 3 earns the Necrobatcer', W.Caves.earnedBy(caves[2]), 'necroBat');
check('so cave 4 has all five, in the order you earned them',
  W.LEVELS[caves[3]].playerUnits.join(','),
  'scoutBat,bruteBat,archerBat,batBros,necroBat');

console.log('');
console.log('  THE CHAIN HOLDS FOR EVERY CAVE');

var i;
var brokenChain = 0;
var earlyBat = 0;

for (i = 1; i < caves.length; i++) {
  var before = W.LEVELS[caves[i - 1]];
  var expected = before.playerUnits.slice();

  if (before.unlocks && expected.indexOf(before.unlocks) === -1) {
    expected.push(before.unlocks);
  }

  if (W.LEVELS[caves[i]].playerUnits.join(',') !== expected.join(',')) { brokenChain++; }

  // A bat must not be handed out by a cave whose own buttons already have it.
  var own = W.LEVELS[caves[i]];
  if (own.unlocks && own.playerUnits.indexOf(own.unlocks) !== -1) { earlyBat++; }
}

check('every cave = the cave before it + what that cave gave you', brokenChain, 0);
check('no cave gives you a bat you already had', earlyBat, 0);

var badUnlocks = caves.filter(function (k) {
  var u = W.LEVELS[k].unlocks;
  return u && (!W.UNITS[u] || W.UNITS[u].enemy);
});
check('every unlocks: names one of YOUR bats in data/units.js', badUnlocks.join(','), '');

// 24 + 5 x 168 + 4 x 18 = 936 of the 960-pixel screen. A sixth will not fit
// without a new idea (picking a team before a cave, like The Battle Cats).
var b = W.CONFIG.buttons;
var fit = Math.floor((W.CONFIG.screen.width - b.startX + b.gap) / (b.width + b.gap));
var tooMany = caves.filter(function (k) { return W.LEVELS[k].playerUnits.length > fit; });
check('no cave has more bats than fit on the button row (' + fit + ')', tooMany.join(','), '');

check('the bat new in cave 2 is the Archer', W.Caves.newBatIn(caves[1]), 'archerBat');
check('cave 1 has no NEW! bat', W.Caves.newBatIn(caves[0]), null);

var practice = W.Caves.practice();
check('a practice level keeps its own bats (the Graveyard)',
  practice.every(function (k) { return W.Caves.earnedBy(k) === null; }), true);

console.log('');
console.log('  THE BAT BROS');

var members = W.Squad.membersOf('batBros');
check('one tap sends two bats', members.length, 2);
check('and both of them are Scout Bats', members.join(','), 'scoutBat,scoutBat');
check('for 35 energy', W.UNITS.batBros.cost, 35);
check('a plain bat is a squad of one: itself', W.Squad.membersOf('archerBat').join(','), 'archerBat');

var spawned = [];
var count = W.Squad.deploy('batBros', 200, function (key, x) { spawned.push({ key: key, x: x }); });
check('deploy() reports how many it sent', count, 2);
check('the first brother comes out of the door', spawned[0].x, 200);
check('the second just behind him, not on top of him',
  spawned[1].x, 200 - W.CONFIG.squad.spacing);

// A squad must be made of real, non-squad player bats - a squad of squads
// would multiply every tap, and an enemy in it would fight for the bugs.
var badSquads = Object.keys(W.UNITS).filter(function (k) {
  var squad = W.UNITS[k].squad;
  if (!squad) { return false; }
  var member = W.UNITS[squad.unit];
  return !member || member.enemy || member.squad || !(squad.count >= 1);
});
check('every squad is made of ordinary bats of yours', badSquads.join(','), '');

// The Scout rule (DECISIONS.md D9): a cheap bat must be limited by money, not
// the clock. The RICHEST cave that offers it is the hard case, because more
// income means you can afford one sooner.
var quickestAfford = caves.filter(function (k) {
  return W.LEVELS[k].playerUnits.indexOf('batBros') !== -1;
}).reduce(function (least, k) {
  return Math.min(least, W.UNITS.batBros.cost / W.LEVELS[k].energyPerSecond);
}, Infinity);
check('Bat Bros cooldown is below what it takes to afford one, in every cave (D9)',
  W.UNITS.batBros.cooldown < quickestAfford, true);

console.log('');
console.log('  ' + passed + ' passed, ' + failed + ' failed');
console.log('');

process.exit(failed === 0 ? 0 : 1);
