/* =========================================================================
   NECRO TEST - check the summoning rules really hold
   =========================================================================
   Run it with Node:

       node tools/necro-test.js

   The Necrobatcer (src/systems/necro.js) has two rules that are not about
   how the game FEELS, they are about the game not falling over:

     * a bat can only ever be raised ONCE
     * a Necrobatcer can never raise another Necrobatcer

   Break either one and a single grave becomes an endless army, which would
   not show up as a crash - it would show up as Lewis wondering why he always
   wins. So they get checked here instead of hoped about.

   This file also checks the POOLING reset, because units are recycled: a
   brand new Scout must never inherit "already raised" from whatever bat used
   its object last.

   It is a TESTING TOOL ONLY. The game never loads it.
   ========================================================================= */

var path = require('path');
var root = path.join(__dirname, '..');

global.window = {};
require(path.join(root, 'data/config.js'));
require(path.join(root, 'data/units.js'));
require(path.join(root, 'src/systems/necro.js'));

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

/* A stand-in unit, just the fields the summoning rules touch. */
function fakeUnit(unitKey, x) {
  var u = { unitKey: unitKey, stats: W.UNITS[unitKey], x: x };
  u.team = u.stats.enemy ? 'enemy' : 'player';
  W.Necro.resetUnit(u);
  return u;
}

/* A stand-in world that can create units. */
function fakeWorld() {
  var world = { graves: [], spawned: [] };
  world.spawn = function (unitKey, x) {
    var u = fakeUnit(unitKey, x);
    world.spawned.push(u);
    return u;
  };
  return world;
}

console.log('');
console.log('  WHO LEAVES A GRAVE');

var world = fakeWorld();

W.Necro.recordDeath(fakeUnit('scoutBat', 500), world);
check('a fallen Scout Bat leaves a grave', world.graves.length, 1);
check('the grave is where it fell', world.graves[0].x, 500);

W.Necro.recordDeath(fakeUnit('mosquito', 400), world);
check('a dead mosquito leaves NO grave (bugs stay dead)', world.graves.length, 1);

W.Necro.recordDeath(fakeUnit('necroBat', 300), world);
check('a fallen Necrobatcer leaves NO grave (rule 2)', world.graves.length, 1);

var alreadyRaised = fakeUnit('scoutBat', 200);
alreadyRaised.wasRaised = true;
W.Necro.recordDeath(alreadyRaised, world);
check('a bat on its second life leaves NO grave (rule 1)', world.graves.length, 1);

console.log('');
console.log('  RAISING');

world = fakeWorld();
var necro = fakeUnit('necroBat', 500);
var summon = W.UNITS.necroBat.summon;

check('a new Necrobatcer is not ready instantly', necro.summonTimer, summon.interval);

// Nothing has died yet, so waiting out the timer must raise nothing.
W.Necro.update(necro, summon.interval, world);
check('with no graves it raises nobody', world.spawned.length, 0);

W.Necro.recordDeath(fakeUnit('scoutBat', 520), world);
var raised = W.Necro.update(necro, 0.016, world);
check('it raises the fallen Scout', raised === null ? 'nothing' : raised.unitKey, 'scoutBat');
check('the grave is used up', world.graves.length, 0);
check('it comes back at ' + (summon.hpFactor * 100) + '% health',
  raised.hp, W.UNITS.scoutBat.hp * summon.hpFactor);
check('the raised bat is flagged as a second life', raised.wasRaised, true);
check('raising resets the timer', necro.summonTimer, summon.interval);

// THE BIG ONE: the raised bat dies again. It must not come back twice.
W.Necro.recordDeath(raised, world);
check('the raised bat leaves NO second grave', world.graves.length, 0);

console.log('');
console.log('  OUT OF REACH');

world = fakeWorld();
necro = fakeUnit('necroBat', 100);
necro.summonTimer = 0;
world.graves.push({ unitKey: 'scoutBat', x: 100 + summon.range + 50 });
W.Necro.update(necro, 0.016, world);
check('a grave beyond summon.range is left alone', world.spawned.length, 0);

world.graves.push({ unitKey: 'scoutBat', x: 100 + summon.range - 10 });
W.Necro.update(necro, 0.016, world);
check('a grave just inside the range is raised', world.spawned.length, 1);

console.log('');
console.log('  ONE CHARGE ONLY');

world = fakeWorld();
necro = fakeUnit('necroBat', 500);

// Wait ten times as long as it needs, with nothing to raise.
W.Necro.update(necro, summon.interval * 10, world);

// Now three bats fall at once. A banked-up Necrobatcer would raise all three.
world.graves.push({ unitKey: 'scoutBat', x: 500 });
world.graves.push({ unitKey: 'scoutBat', x: 505 });
world.graves.push({ unitKey: 'scoutBat', x: 510 });

W.Necro.update(necro, 0.016, world);
W.Necro.update(necro, 0.016, world);
W.Necro.update(necro, 0.016, world);
check('waiting a long time does not bank up extra raises', world.spawned.length, 1);

console.log('');
console.log('  POOLING (units get recycled)');

var recycled = fakeUnit('scoutBat', 0);
recycled.wasRaised = true;              // pretend it was a raised bat last life
W.Necro.resetUnit(recycled);            // what spawn() does for every new bat
check('a reused object forgets it was raised', recycled.wasRaised, false);

world = fakeWorld();
W.Necro.recordDeath(recycled, world);
check('so the recycled bat leaves a grave normally', world.graves.length, 1);

console.log('');
console.log('  THE GRAVEYARD CAP');

world = fakeWorld();
var i;
for (i = 0; i < W.CONFIG.combat.maxGraves + 15; i++) {
  W.Necro.recordDeath(fakeUnit('scoutBat', i), world);
}
check('the graveyard stops at CONFIG.combat.maxGraves',
  world.graves.length, W.CONFIG.combat.maxGraves);
check('it is the OLDEST grave that gets forgotten', world.graves[0].x, 15);

console.log('');
console.log('  ' + passed + ' passed, ' + failed + ' failed');
console.log('');

process.exit(failed === 0 ? 0 : 1);
