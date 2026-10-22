/* =========================================================================
   POWERS TEST - do the six new bats really do what Jeff asked?
   =========================================================================
   Run it with Node:

       node tools/powers-test.js

   Each of the bats from caves 4-9 has a power, and a power that quietly does
   nothing does not crash - it just makes a bat that is worse than it looks.
   So each one is set up here in a tiny battle and checked, using the SAME
   brain (src/systems/brain.js) the game and the balance sim both run.

     Cheer     every other bat hits harder - but not bugs, and two don't stack
     Bomb      flies untouchable, one bomb, comes home as a Scout
     Skeleton  raised bats come back at full health
     Engineer  energy fills faster - and two don't stack
     Frost     a touch freezes a bug, both ways round, and it can't be chained
     Rabies    walks to a spot, eats everything near it, and is used up

   It is a TESTING TOOL ONLY. The game never loads it.
   ========================================================================= */

var path = require('path');
var sim = require(path.join(__dirname, 'balance-sim.js'));
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

function near(a, b) { return Math.abs(a - b) < 1e-6; }

/* A small battle: two buildings, a pool of units, graves, and a report log. */
function makeWorld() {
  var pool = new W.Pool(function () { return new sim.SimUnit(); });
  var world = {
    units: pool.active,
    playerBase: new sim.SimBase('player', 5000),
    enemyBase: new sim.SimBase('enemy', 5000),
    graves: [],
    items: W.Items.createState({}),
    reports: [],
    spawn: function (key, x) {
      var u = pool.obtain();
      u.spawn(key, x);
      return u;
    },
    report: function (kind, details) { world.reports.push(kind); }
  };
  world.step = function (seconds) {
    var dt = 1 / W.CONFIG.sim.stepsPerSecond;
    var t;
    var i;
    for (t = 0; t < seconds; t += dt) {
      for (i = 0; i < pool.active.length; i++) { pool.active[i].update(dt, world); }
      for (i = pool.active.length - 1; i >= 0; i--) {
        if (!pool.active[i].active) { pool.release(pool.active[i]); }
      }
    }
  };
  world.count = function (key) {
    return pool.active.filter(function (u) { return u.unitKey === key && !u.isDying; }).length;
  };
  return world;
}

/* --------------------------------------------------------------------- */
console.log('');
console.log('  CHEER BAT');

var world = makeWorld();
var scout = world.spawn('scoutBat', 400);
var bug = world.spawn('mosquito', 410);
var hit = W.Combat.strike(scout, bug, world);
check('a Scout hits for 8 with nobody cheering', hit.damage, 8);

var cheer = world.spawn('cheerBat', 300);
hit = W.Combat.strike(scout, bug, world);
check('...and for 8 x 1.3 with a Cheer Bat alive',
  near(hit.damage, 8 * (1 + W.UNITS.cheerBat.cheer.attackBonus)), true);

world.spawn('cheerBat', 290);
hit = W.Combat.strike(scout, bug, world);
check('two Cheer Bats do NOT stack', near(hit.damage, 8 * (1 + W.UNITS.cheerBat.cheer.attackBonus)), true);

hit = W.Combat.strike(bug, scout, world);
check('a cheer never boosts the bugs', hit.damage, W.UNITS.mosquito.attack);

world = makeWorld();
cheer = world.spawn('cheerBat', 300);
cheer.takeDamage(cheer.hp);
scout = world.spawn('scoutBat', 400);
bug = world.spawn('mosquito', 410);
check('a dying Cheer Bat cheers nobody', W.Combat.strike(scout, bug, world).damage, 8);

/* --------------------------------------------------------------------- */
console.log('');
console.log('  BOMB BAT');

world = makeWorld();
var bomber = world.spawn('bombBat', world.playerBase.spawnX);
world.spawn('scorpion', 500);            // a bug in the way, which it ignores
world.spawn('scorpion', 520);
var before = world.enemyBase.hp;

world.step(3);
check('it flies: no bug can target it', W.Combat.findTarget(world.units[1], world) !== bomber, true);
check('and it is drawn in the air', bomber.flying, true);

world.step(12);
check('its ONE bomb hits the tower for bomb.damage',
  before - world.enemyBase.hp, W.UNITS.bombBat.bomb.damage);
check('exactly one bomb was dropped',
  world.reports.filter(function (r) { return r === 'bomb'; }).length, 1);

world.step(20);
check('it came home and became a Scout', world.reports.indexOf('landed') !== -1, true);
check('so the Bomb Bat is gone', world.count('bombBat'), 0);
check('no second bomb ever falls', before - world.enemyBase.hp >= W.UNITS.bombBat.bomb.damage &&
  world.reports.filter(function (r) { return r === 'bomb'; }).length === 1, true);
check('and the Bomb Bat itself left no grave (the Scout it became may have)',
  world.graves.filter(function (g) { return g.unitKey === 'bombBat'; }).length, 0);

/* --------------------------------------------------------------------- */
console.log('');
console.log('  SKELETON BAT');

function raiseOne(withSkeleton) {
  var w = makeWorld();
  var necro = w.spawn('necroBat', 300);
  necro.summonTimer = 0;
  if (withSkeleton) { w.spawn('skeletonBat', 200); }
  w.graves.push({ unitKey: 'bruteBat', x: 350 });
  W.Necro.update(necro, 1 / 60, w);
  var raised = w.units.filter(function (u) { return u.unitKey === 'bruteBat'; })[0];
  return raised.hp / raised.stats.hp;
}

check('without a Skeleton, a raised bat comes back at 60%', near(raiseOne(false), 0.6), true);
check('with a Skeleton alive, it comes back at FULL health', near(raiseOne(true), 1), true);

/* --------------------------------------------------------------------- */
console.log('');
console.log('  ENGINEER BAT');

world = makeWorld();
check('no Engineer: normal income', W.Engineer.incomeFactor(world), 1);
var eng = world.spawn('engineerBat', world.playerBase.spawnX);
check('one Engineer: +' + (W.UNITS.engineerBat.engineer.incomeBonus * 100) + '% income',
  near(W.Engineer.incomeFactor(world), 1 + W.UNITS.engineerBat.engineer.incomeBonus), true);
world.spawn('engineerBat', world.playerBase.spawnX);
check('two Engineers do NOT stack',
  near(W.Engineer.incomeFactor(world), 1 + W.UNITS.engineerBat.engineer.incomeBonus), true);
var x0 = eng.x;
world.step(5);
check('it stays at your door', eng.x, x0);

var level = { startEnergy: 0, energyPerSecond: 10, maxEnergy: 1000 };
var econ = new W.Economy(0, 10, 1000);
econ.energyPerSecond = level.energyPerSecond * W.Engineer.incomeFactor(world);
econ.update(1);
check('and a second of income really is bigger', near(econ.energy, 10 * (1 + W.UNITS.engineerBat.engineer.incomeBonus)), true);

/* --------------------------------------------------------------------- */
console.log('');
console.log('  FROST BAT');

var frostSecs = W.UNITS.frostBat.frost.freezeSeconds;

world = makeWorld();
var frost = world.spawn('frostBat', 400);
bug = world.spawn('mosquito', 420);
W.Combat.strike(frost, bug, world);
check('a Frost Bat\'s hit freezes the bug', W.Frost.isFrozen(bug), true);

var bugX = bug.x;
var hpBefore = frost.hp;
world.step(frostSecs * 0.8);
check('a frozen bug does not move', bug.x, bugX);
check('...and does not bite', frost.hp >= hpBefore - 1e-9 || frost.hp === hpBefore, true);

world = makeWorld();
frost = world.spawn('frostBat', 400);
bug = world.spawn('mosquito', 420);
W.Combat.strike(bug, frost, world);
check('a bug that hits a Frost Bat is frozen for touching it', W.Frost.isFrozen(bug), true);

world = makeWorld();
bug = world.spawn('mosquito', 420);
bug.frozenTimer = 0.01;
bug.thawLength = W.UNITS.frostBat.frost.thawSeconds;
world.step(0.05);
check('after thawing, a bug cannot be frozen again straight away',
  W.Frost.freeze(bug, W.UNITS.frostBat.frost, world), false);
world.step(W.UNITS.frostBat.frost.thawSeconds + 0.05);
check('...but can once the thaw has passed', W.Frost.freeze(bug, W.UNITS.frostBat.frost, world), true);

world = makeWorld();
frost = world.spawn('frostBat', 400);
scout = world.spawn('scoutBat', 410);
W.Frost.afterHit(frost, scout, world);
check('a Frost Bat never freezes your own bats', W.Frost.isFrozen(scout), false);
W.Combat.strike(frost, world.enemyBase, world);
check('...or a building', world.enemyBase.frozenTimer === undefined, true);

/* --------------------------------------------------------------------- */
console.log('');
console.log('  RABIES BAT');

W.Sting.useSeed(7);
world = makeWorld();
var rabid = world.spawn('rabiesBat', world.playerBase.spawnX);
world.step(1 / 60);
var spot = rabid.rabiesSpot;
check('it picks a spot on the lane between the two doors',
  spot > world.playerBase.spawnX && spot < world.enemyBase.faceX, true);

// Put bats and bugs right where it is going, and one far away.
var r = W.UNITS.rabiesBat.rabies.radius;
world.spawn('scorpion', spot + r - 5);
world.spawn('mosquito', spot - r + 5);
world.spawn('scoutBat', spot + 10);
var faraway = world.spawn('spider', spot + r * 4);
var boss = world.spawn('cowKillerBee', spot + 20);
var flyer = world.spawn('bombBat', spot);

// Pin everyone in place so only the Rabies Bat moves.
world.units.forEach(function (u) { if (u !== rabid) { u.frozenTimer = 999; } });
flyer.frozenTimer = 0; flyer.bombStage = null;   // a flyer that hovers right overhead

world.step(30);
check('it reached its spot and bit', world.reports.indexOf('rabies') !== -1, true);
check('the bugs in reach were eaten', world.count('scorpion') + world.count('mosquito'), 0);
check('YOUR bat in reach was eaten too', world.count('scoutBat'), 0);
check('the far-away spider was not', world.count('spider'), 1);
check('the Rabies Bat is used up', world.count('rabiesBat'), 0);
check('a boss is too big to swallow - it takes bossDamage',
  boss.hp, W.UNITS.cowKillerBee.hp - W.UNITS.rabiesBat.rabies.bossDamage);
check('anything flying is out of reach', flyer.isDying, false);
check('something eaten leaves no grave to raise', world.graves.length, 0);
check('and the buildings were untouched', world.enemyBase.hp + world.playerBase.hp, 10000);
W.Sting.useSeed(1);

/* --------------------------------------------------------------------- */
console.log('');
console.log('  GHOST BAT (the first casino bat, 2026-10-22)');

var G = W.UNITS.ghostBat.ghosts;
check('the Ghost Bat is a casino bat', W.UNITS.ghostBat.casinoPrice > 0, true);
check('...that never attacks', W.UNITS.ghostBat.attack, 0);
check('...and stands further back than anything reaches',
  Object.keys(W.UNITS).every(function (k) { return k === 'ghostBat' || W.UNITS[k].range < W.UNITS.ghostBat.range; }), true);
check('...with less health than a Necrobatcer', W.UNITS.ghostBat.hp < W.UNITS.necroBat.hp, true);
check('a ghost is never sold, earned or deployed', !!W.UNITS.ghost.summonOnly && !W.UNITS.ghost.casinoPrice, true);

world = makeWorld();
var gb = world.spawn('ghostBat', 100);
world.step(G.interval - 0.1);
check('no ghost before its first interval', world.count('ghost'), 0);
world.step(0.2);
check('one ghost after it', world.count('ghost'), 1);
check('...which is reported', world.reports.indexOf('ghost') !== -1, true);
world.step(G.interval * (G.maxAlive + 3));
check('never more than maxAlive ghosts at once', world.count('ghost'), G.maxAlive);

var ghost = world.units.filter(function (u) { return u.unitKey === 'ghost' && !u.isDying; })[0];
var gbHp = gb.hp;
ghost.takeDamage(10);
check('a hit on a ghost comes off the Ghost Bat, times damageShare', near(gb.hp, gbHp - 10 * G.damageShare), true);
check('...and the ghost is still standing', ghost.isDying, false);
check('...showing the Ghost Bat\'s health on its bar', near(W.Ghost.healthRatio(ghost), gb.hp / gb.stats.hp), true);

var scoutHits = 0;
var tough = makeWorld();
var gb2 = tough.spawn('ghostBat', 100);
tough.step(G.interval + 0.1);
var g2 = tough.units.filter(function (u) { return u.unitKey === 'ghost'; })[0];
while (!gb2.isDying && scoutHits < 1000) { g2.takeDamage(W.UNITS.scoutBat.attack); scoutHits++; }
check('a ghost takes more Scout hits than a whole Ghost Bat would',
  scoutHits > Math.ceil(W.UNITS.ghostBat.hp / W.UNITS.scoutBat.attack), true);

world = makeWorld();
gb = world.spawn('ghostBat', 100);
world.step(G.interval * 2 + 0.2);
var before = world.count('ghost');
gb.takeDamage(gb.hp);
world.step(1 / W.CONFIG.sim.stepsPerSecond);
check('when the Ghost Bat dies its ghosts fade with it', before > 0 && world.count('ghost') === 0, true);
world.step(3);
check('...and they leave no graves (nothing for a Necrobatcer to raise)',
  world.graves.filter(function (g) { return g.unitKey === 'ghost'; }).length, 0);

world = makeWorld();
gb = world.spawn('ghostBat', 100);
world.step(G.interval + 0.1);
ghost = world.units.filter(function (u) { return u.unitKey === 'ghost'; })[0];
gbHp = gb.hp;
ghost.takeDamage(ghost.hp);              // what an instant kill or a Rabies bite does
check('a hit that takes ALL the shared health destroys just that ghost', ghost.isDying, true);
check('...and the Ghost Bat is untouched', gb.hp, gbHp);

// Pooling: a ghost must not latch on to whatever reuses its Ghost Bat's object.
world = makeWorld();
gb = world.spawn('ghostBat', 100);
world.step(G.interval + 0.1);
ghost = world.units.filter(function (u) { return u.unitKey === 'ghost'; })[0];
gb.active = false;                       // as if it finished dying and was pooled...
gb.spawn('scoutBat', 50);                // ...and came straight back as a Scout
ghost.takeDamage(5);
check('a ghost never shares health with the Scout that reuses its Ghost Bat', gb.hp, W.UNITS.scoutBat.hp);
world.step(1 / W.CONFIG.sim.stepsPerSecond);
check('...it fades instead', ghost.isDying || !ghost.active, true);

console.log('');
console.log('  ' + passed + ' passed, ' + failed + ' failed');
console.log('');

process.exit(failed === 0 ? 0 : 1);
