/* =========================================================================
   ROSTER TEST - beat a cave, earn a bat; and squads send out a group
   =========================================================================
   Run it with Node:

       node tools/roster-test.js

   Two things arrived together on 2026-10-12 and both are easy to break
   without anything crashing:

     * THE UNLOCK CHAIN (src/systems/caves.js). Each cave's bats are worked
       out from cave 1's starting list plus every  unlocks:  line before it.
       Get it wrong and a bat quietly turns up a cave early, or never.
     * SQUADS (src/systems/squad.js). One tap of a squad button must send
       out the whole group, in the game and in the balance sim alike. The Bat
       Bros were the squad until 2026-10-17, when they became ONE unit with
       both brothers in its picture; the squad rule is now tested on a
       stand-in, so it still works for the next squad somebody invents.

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
require(path.join(root, 'src/systems/team.js'));

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
check('caves 4-9 each earn one of Jeff\'s six new bats, in order',
  caves.slice(3, 9).map(W.Caves.earnedBy).join(','),
  'cheerBat,bombBat,skeletonBat,engineerBat,frostBat,rabiesBat');
check('so the Final Stadium offers all eleven', W.LEVELS[caves[9]].playerUnits.length, 11);

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

// The Locker (2026-10-12): you take CONFIG.team.size bats in, and that many
// buttons must fit across the bottom of the screen.
var b = W.CONFIG.buttons;
var fit = Math.floor((W.CONFIG.screen.width - b.startX + b.gap) / (b.width + b.gap));
check('a full team fits on the button row (' + W.CONFIG.team.size + ' of ' + fit + ')',
  W.CONFIG.team.size <= fit, true);

check('the bat new in cave 2 is the Archer', W.Caves.newBatIn(caves[1]), 'archerBat');
check('cave 1 has no NEW! bat', W.Caves.newBatIn(caves[0]), null);

var practice = W.Caves.practice();
check('a practice level keeps its own bats (the Graveyard)',
  practice.every(function (k) { return W.Caves.earnedBy(k) === null; }), true);

console.log('');
console.log('  THE LOCKER - TEAMS OF ' + W.CONFIG.team.size);

check('caves 1 and 2 need no Locker - nothing to choose',
  W.Team.needsLocker(caves[0]) || W.Team.needsLocker(caves[1]), false);
check('cave 3 does', W.Team.needsLocker(caves[2]), true);
check('the Graveyard (practice) does not', W.Team.needsLocker('graveyard'), false);
check('with no saved team, the Locker opens with the NEW bat in it',
  W.Team.defaultFor('pyramid', null).indexOf('necroBat'), 0);
check('...and a full team', W.Team.defaultFor('pyramid', null).length, W.CONFIG.team.size);
check('a saved team is kept', W.Team.defaultFor('finalStadium', ['frostBat', 'archerBat', 'bombBat']).join(','),
  'frostBat,archerBat,bombBat');
check('a saved bat this cave does not have yet is dropped',
  W.Team.defaultFor('pyramid', ['frostBat', 'archerBat']).indexOf('frostBat'), -1);
check('a team of four is not allowed', W.Team.isValid(['scoutBat', 'bruteBat', 'archerBat', 'batBros'], 'pyramid'), false);
check('the same bat twice is not allowed', W.Team.isValid(['scoutBat', 'scoutBat'], 'pyramid'), false);
check('a bat you have not earned is not allowed', W.Team.isValid(['rabiesBat'], 'pyramid'), false);
check('one bat on its own is allowed', W.Team.isValid(['archerBat'], 'pyramid'), true);

console.log('');
console.log('  THE BAT BROS - one unit, two Scouts\' worth (2026-10-17)');

var bros = W.UNITS.batBros;
var scout = W.UNITS.scoutBat;
check('one tap sends one unit: the Bros themselves', W.Squad.membersOf('batBros').join(','), 'batBros');
check('with twice a Scout\'s health', bros.hp, scout.hp * 2);
check('and twice its bite', bros.attack, scout.attack * 2);
check('on a Scout\'s timing', bros.attackInterval, scout.attackInterval);
check('at a Scout\'s speed and reach', [bros.speed, bros.range].join(','), [scout.speed, scout.range].join(','));
check('for 55 energy (Jeff, 2026-10-12)', bros.cost, 55);
check('drawn once on its button - the picture has both brothers in it', W.Squad.portraitCount('batBros'), 1);

console.log('');
console.log('  SQUADS - tested on a stand-in, since no bat is one today');

check('a plain bat is a squad of one: itself', W.Squad.membersOf('archerBat').join(','), 'archerBat');

W.UNITS.testPair = { name: 'Test Pair', sprite: 'scoutBat', squad: { unit: 'scoutBat', count: 2 } };

var members = W.Squad.membersOf('testPair');
check('one tap sends the whole squad', members.join(','), 'scoutBat,scoutBat');

var spawned = [];
var count = W.Squad.deploy('testPair', 200, function (key, x) { spawned.push({ key: key, x: x }); });
check('deploy() reports how many it sent', count, 2);
check('the first one comes out of the door', spawned[0].x, 200);
check('the second just behind it, not on top of it',
  spawned[1].x, 200 - W.CONFIG.squad.spacing);
check('a squad showing its member\'s picture draws it once per member', W.Squad.portraitCount('testPair'), 2);

W.UNITS.testPair.sprite = 'batBros';
check('...and a squad with a picture of its own draws it once', W.Squad.portraitCount('testPair'), 1);

delete W.UNITS.testPair;

console.log('');
console.log('  HOW MANY AT ONCE - the Archer\'s limit of 5 (Lewis, 2026-10-21)');

function fakeUnit(key, extra) {
  return Object.assign({ unitKey: key, team: 'player', active: true, isDying: false }, extra || {});
}
var lane = [];
var a;
for (a = 0; a < 4; a++) { lane.push(fakeUnit('archerBat')); }
check('the Archer has a limit of 5', W.UNITS.archerBat.maxAlive, 5);
check('4 Archers on the lane: you may send another', W.Squad.atLimit('archerBat', lane), false);
lane.push(fakeUnit('archerBat'));
check('5 Archers on the lane: you may not', W.Squad.atLimit('archerBat', lane), true);
lane[0].isDying = true;
check('...until one of them is dying', W.Squad.atLimit('archerBat', lane), false);
lane.push(fakeUnit('scoutBat'), fakeUnit('scoutBat'), fakeUnit('mosquito', { team: 'enemy' }));
check('other bats and bugs are not counted', W.Squad.aliveCount('archerBat', lane), 4);
check('a bat with no limit never hits one', W.Squad.atLimit('scoutBat', lane.concat(lane, lane)), false);

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
