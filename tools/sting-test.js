/* =========================================================================
   STING TEST - check the gambling rules really hold
   =========================================================================
   Run it with Node:

       node tools/sting-test.js

   The Desert Scorpion (src/systems/sting.js, homework B26) kills a bat
   outright on some attacks and kills itself on others. Three of its rules are
   not about how the game FEELS - they are about the game being fair:

     * a sting can NEVER instantly kill a BASE. An instant kill ignores health,
       so a sting that counted against a fortress would mean a whole cave could
       be decided by one roll, however well it was played.
     * a sting cannot finish off something that is already dying.
     * the DICE THEMSELVES must be right. A killChance of 0.2 has to mean 20%
       and not 2% or 40%, or every balance measurement taken with this tool is
       worthless - and this project has already been burnt twice by a measuring
       tool that quietly lied (DECISIONS.md D10, D22).

   It also checks the SEEDED dice, because the balance sim depends on the same
   seed giving the same battle every time.

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

/* Within a whisker of the number we wanted? Used for the dice, where the
   answer is a rate rather than a yes or no. */
function checkNear(what, got, want, tolerance) {
  if (Math.abs(got - want) <= tolerance) {
    passed++;
    console.log('  ok    ' + what + '  (' + got.toFixed(4) + ')');
  } else {
    failed++;
    console.log('  FAIL  ' + what + '  (got ' + got.toFixed(4) + ', wanted ' +
      want + ' +/- ' + tolerance + ')');
  }
}

/* A stand-in gambling bug with whatever odds the test wants. */
function fakeStinger(killChance, backfireChance) {
  return {
    unitKey: 'desertScorpion',
    team: 'enemy',
    hp: 120,
    stats: { attack: 12, sting: { killChance: killChance, backfireChance: backfireChance } },
    takeDamage: function (amount) { this.hp -= amount; if (this.hp < 0) { this.hp = 0; } }
  };
}

/* A stand-in bat. Having 'stats' is what makes it a unit rather than a base. */
function fakeBat(hp) {
  return {
    team: 'player',
    hp: hp,
    isDying: false,
    stats: { name: 'Scout Bat', hp: hp },
    takeDamage: function (amount) {
      this.hp -= amount;
      if (this.hp <= 0) { this.hp = 0; this.isDying = true; }
    }
  };
}

/* A stand-in fortress. No 'stats', which is how the rules tell a building
   from a bat without either of them knowing about stings. */
function fakeBase(hp) {
  return {
    hp: hp,
    maxHp: hp,
    takeDamage: function (amount) { this.hp -= amount; if (this.hp < 0) { this.hp = 0; } }
  };
}

function fakeWorld() {
  return { items: W.Items.createState({}), playerBase: fakeBase(1000) };
}

console.log('');
console.log('  THE DICE SAY WHAT THEY MEAN');

[0.05, 0.2, 0.5, 0.8].forEach(function (rate) {
  W.Sting.useSeed(9);

  var bug = fakeStinger(rate, rate);
  var kills = 0;
  var bursts = 0;
  var rounds = 40000;
  var i;

  for (i = 0; i < rounds; i++) {
    var outcome = W.Sting.resolve(bug, fakeBat(50));
    if (outcome.instantKill) { kills++; }
    if (outcome.backfire) { bursts++; }
  }

  checkNear('killChance ' + rate + ' really kills that often', kills / rounds, rate, 0.01);
  checkNear('backfireChance ' + rate + ' really backfires that often', bursts / rounds, rate, 0.01);
});

console.log('');
console.log('  A STING CAN NEVER INSTANTLY KILL A BASE');

W.Sting.useSeed(3);

var certainKiller = fakeStinger(1.0, 0);   // 100% - it would kill anything it can
var baseEverKilled = false;
var i;

for (i = 0; i < 2000; i++) {
  if (W.Sting.resolve(certainKiller, fakeBase(1000)).instantKill) { baseEverKilled = true; }
}
check('even at killChance 1.0, a fortress is never stung dead', baseEverKilled, false);

/* And the damage that DOES reach a base is the ordinary attack, not its health. */
W.Sting.useSeed(3);
var fortress = fakeBase(1000);
var world = fakeWorld();
W.Combat.strike(certainKiller, fortress, world);
check('a stung fortress takes only ordinary damage', fortress.hp, 1000 - 12);

console.log('');
console.log('  A STING CANNOT FINISH OFF SOMETHING ALREADY DYING');

W.Sting.useSeed(4);
var dyingBat = fakeBat(50);
dyingBat.isDying = true;
var dyingEverKilled = false;

for (i = 0; i < 2000; i++) {
  if (W.Sting.resolve(certainKiller, dyingBat).instantKill) { dyingEverKilled = true; }
}
check('even at killChance 1.0, a dying bat is not stung again', dyingEverKilled, false);

console.log('');
console.log('  WHAT AN INSTANT KILL ACTUALLY DOES');

W.Sting.useSeed(5);
var bigBat = fakeBat(220);          // a Brute Bat, at full health
var hit = W.Combat.strike(certainKiller, bigBat, fakeWorld());
check('a full-health Brute Bat dies from one sting', bigBat.hp, 0);
check('and the game knows it was a sting, not ordinary damage', hit.instantKill, true);
check('the damage dealt was the whole 220, not the scorpion\'s 12', hit.damage, 220);

console.log('');
console.log('  A BACKFIRE KILLS THE SCORPION');

W.Sting.useSeed(6);
var suicidal = fakeStinger(0, 1.0);   // never kills you, always kills itself
var victim = fakeBat(40);
var backfireHit = W.Combat.strike(suicidal, victim, fakeWorld());
check('the scorpion is dead', suicidal.hp, 0);
check('the game knows it backfired', backfireHit.backfire, true);
check('and the bat it hit still took the ordinary damage', victim.hp, 40 - 12);

console.log('');
console.log('  A BAT WITHOUT A STING IS UNAFFECTED');

var plainBug = { team: 'enemy', hp: 55, stats: { attack: 7 },
  takeDamage: function (a) { this.hp -= a; } };
var plainOutcome = W.Sting.resolve(plainBug, fakeBat(40));
check('no sting block means no instant kill', plainOutcome.instantKill, false);
check('no sting block means no backfire', plainOutcome.backfire, false);

var plainTarget = fakeBat(40);
W.Combat.strike(plainBug, plainTarget, fakeWorld());
check('and it deals exactly its ordinary damage', plainTarget.hp, 40 - 7);

console.log('');
console.log('  THE SEEDED DICE (the balance sim depends on this)');

W.Sting.useSeed(11);
var runA = [W.Sting.roll(), W.Sting.roll(), W.Sting.roll(), W.Sting.roll()];
W.Sting.useSeed(11);
var runB = [W.Sting.roll(), W.Sting.roll(), W.Sting.roll(), W.Sting.roll()];
W.Sting.useSeed(12);
var runC = [W.Sting.roll(), W.Sting.roll(), W.Sting.roll(), W.Sting.roll()];

check('the same seed gives the same battle', runA.join(','), runB.join(','));
check('a different seed gives a different battle', runA.join(',') === runC.join(','), false);

W.Sting.useSeed(7);
var inRange = true;
for (i = 0; i < 50000; i++) {
  var r = W.Sting.roll();
  if (r < 0 || r >= 1) { inRange = false; }
}
check('every roll lands between 0 and 1', inRange, true);

console.log('');
console.log('  THE REAL DESERT SCORPION, AS SHIPPED');

var real = W.UNITS.desertScorpion.sting;
check('it gambles at all', W.Sting.hasSting(W.UNITS.desertScorpion), true);
check('bursting is likelier than killing, so the sting costs it its life',
  real.backfireChance > real.killChance, true);
check('the plain Scorpion does NOT gamble', W.Sting.hasSting(W.UNITS.scorpion), false);
check('and neither does any of your bats',
  ['scoutBat', 'bruteBat', 'necroBat', 'archerBat'].some(function (k) {
    return W.Sting.hasSting(W.UNITS[k]);
  }), false);

console.log('');
console.log('  ' + passed + ' passed, ' + failed + ' failed');
console.log('');

process.exit(failed === 0 ? 0 : 1);
