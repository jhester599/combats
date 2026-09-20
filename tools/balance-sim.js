/* =========================================================================
   BALANCE SIM - play a whole level in a fraction of a second
   =========================================================================
   Run it with Node (no browser, no graphics):

       node tools/balance-sim.js
       node tools/balance-sim.js level1
       node tools/balance-sim.js level1 --reaction 0.3

   It plays the level using the same data/ and src/systems/ files the real
   game uses and tells you whether the level is winnable and how long it takes.

   Why this exists: changing a number in data/units.js and then playing a
   90-second battle to find out what happened is slow. This answers the
   question instantly, so Lewis can tune, run, tune, run.

   ------------------- IT PRETENDS TO BE A PERSON -------------------
   This tool used to play with a thumb that was PERFECT: it tapped on the exact
   1/60th of a second each button lit up. That made it lie. It said Level 1 was
   a WIN at 67.6s, and then Lewis played the level the way the homework told him
   to and LOST - because a real thumb lands a third of a second late, and back
   then that cost 13% of his army.

   So now the pretend player has a REACTION TIME, and the default report plays
   the level at several of them. A level is only really balanced if it holds up
   across the whole band, not just at a robot's zero.

   ------------------- AND SOME CAVES ARE A COIN FLIP -------------------
   The Desert Scorpion (homework B26) gambles on every attack, so a cave that
   contains one does not have a single answer any more - it has a spread. One
   lucky run proves nothing at all.

   So the dice are SEEDED (same seed, same battle, every time), and a cave with
   any gambling bug in it gets played on twenty different seeds. What matters
   there is not "did it win" but "did it win EVERY time": a cave that beats a
   nine-year-old one run in five is not hard, it is unfair.

   It is a TESTING TOOL ONLY. The game itself never loads this file, and the
   game runs perfectly without it.
   ========================================================================= */

var path = require('path');
var root = path.join(__dirname, '..');

// The game files expect a browser 'window'. Node does not have one, so we
// make an empty object and let each file hang its part off it, exactly like
// the browser does.
//
// Reuse one if a caller already made it: another script (necro-test.js, or a
// throwaway experiment) may have loaded the data files and set up its own
// units before requiring this. Overwriting it would silently throw that away.
global.window = global.window || {};

require(path.join(root, 'data/config.js'));
require(path.join(root, 'data/units.js'));
require(path.join(root, 'data/levels.js'));
require(path.join(root, 'data/items.js'));
require(path.join(root, 'src/systems/economy.js'));
require(path.join(root, 'src/systems/pool.js'));
require(path.join(root, 'src/systems/combat.js'));
require(path.join(root, 'src/systems/spawner.js'));
require(path.join(root, 'src/systems/necro.js'));
require(path.join(root, 'src/systems/sting.js'));
require(path.join(root, 'src/systems/items.js'));

var W = global.window;

/* -------------------------------------------------------------------------
   A unit with no pictures. It copies the real unit's behaviour exactly, but
   skips everything to do with drawing.
   ------------------------------------------------------------------------- */
function SimUnit() {
  this.active = false;
}

SimUnit.prototype.spawn = function (unitKey, startX) {
  this.unitKey = unitKey;
  this.stats = W.UNITS[unitKey];
  this.team = this.stats.enemy ? 'enemy' : 'player';
  this.direction = this.stats.enemy ? -1 : 1;
  this.x = startX;
  this.hp = this.stats.hp;
  this.attackTimer = 0;
  this.isDying = false;
  this.active = true;

  // Same pooled-state reset as the real Unit does. Without this the sim would
  // quietly disagree with the game about who can be raised.
  W.Necro.resetUnit(this);

  var death = this.stats.anims.death;
  this.deathDuration = (death.end - death.start + 1) / death.frameRate;
};

SimUnit.prototype.update = function (dt, world) {
  if (!this.active) { return; }

  if (this.isDying) {
    this.dyingTimer -= dt;
    if (this.dyingTimer <= 0) {
      W.Necro.recordDeath(this, world);   // leave a grave where it fell
      this.active = false;
    }
    return;
  }

  W.Necro.update(this, dt, world);        // Necrobatcers raise a fallen friend

  var target = W.Combat.findTarget(this, world);

  if (target) {
    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      this.attackTimer = this.stats.attackInterval;

      // Exactly the same one line the real game runs (src/entities/unit.js).
      // Potions and stings are inside it, so the sim cannot disagree with the
      // browser about them - which is the whole point of DECISIONS.md D11.
      var hit = W.Combat.strike(this, target, world);

      if (hit.instantKill) { world.stings.kills++; }
      if (hit.backfire) { world.stings.backfires++; }
    }
  } else if (!W.Combat.isBlockedByFriend(this, world)) {
    this.x += this.stats.speed * this.direction * dt;
  }
};

SimUnit.prototype.takeDamage = function (amount) {
  if (this.isDying) { return; }
  this.hp -= amount;
  if (this.hp <= 0) {
    this.hp = 0;
    this.isDying = true;
    this.dyingTimer = this.deathDuration;
  }
};

/* A base with no pictures. */
function SimBase(team, maxHp) {
  var c = W.CONFIG.bases;
  this.team = team;
  this.maxHp = maxHp;
  this.hp = maxHp;

  var isPlayer = (team === 'player');
  this.x = isPlayer ? c.playerX : c.enemyX;
  this.faceX = isPlayer ? this.x + c.faceInset : this.x - c.faceInset;
  this.spawnX = isPlayer ? this.x + c.spawnOffset : this.x - c.spawnOffset;
}

SimBase.prototype.takeDamage = function (amount) {
  this.hp -= amount;
  if (this.hp < 0) { this.hp = 0; }
};

/* -------------------------------------------------------------------------
   Play one whole battle and report what happened.

   options:
     reaction    seconds between a button lighting up and the tap landing.
                 0 = a robot. 0.3 is about right for a person who is paying
                 attention. 8 = a person deliberately hoarding energy.
     use         which of the level's buttons this player actually presses
                 (default: all of them)
     prefer      WHICH bat gets the money when several are affordable:
                   'cheapest' (default) - spends on the cheap bat the moment it
                      can, so the wallet never fills. With a 25-energy Scout in
                      the list this is a Scout-spammer and nothing else.
                   'priciest' - puts the money into the best bat it can afford,
                      so Brutes and Archers actually get sent.
                 This matters more than it sounds. Measuring only 'cheapest'
                 says "attentive play loses" about any cave that punishes a
                 stream of 40hp Scouts, when what loses is the SPAMMING, not
                 the attention. Caves 2-10 were nearly tuned against that
                 mistake - see DECISIONS.md D22.
     seed        the dice for the Desert Scorpion's sting (src/systems/sting.js).
                 DEFAULTS TO 1, not to real randomness: a measuring tool whose
                 answer changes every run cannot be used to tune anything. Pass
                 different seeds to see the spread, which is what the report's
                 COIN FLIP section does.
     maxSeconds  give up and call it a stalemate after this long
   ------------------------------------------------------------------------- */
function playLevel(levelKey, options) {
  // Old callers passed a plain number of seconds here. Still works.
  if (typeof options === 'number') { options = { maxSeconds: options }; }
  options = options || {};

  // Seeded by default - see 'seed' above.
  W.Sting.useSeed(options.seed === undefined ? 1 : options.seed);

  var level = W.LEVELS[levelKey];
  var use = options.use || level.playerUnits;
  var reaction = options.reaction || 0;
  var maxSeconds = options.maxSeconds || 300;

  // The order we consider the buttons in IS the spending policy: whichever we
  // look at first gets the energy. Priciest-first means a full wallet buys a
  // Brute instead of being nibbled away by Scouts.
  var order = use.slice();
  var reserve = 0;

  if (options.prefer === 'priciest') {
    order.sort(function (a, b) { return W.UNITS[b].cost - W.UNITS[a].cost; });

    // Sorting alone changes nothing, because at a sharp reaction time the
    // wallet never holds two bats' worth at once - the Scout is affordable the
    // instant the energy lands, so it is the only thing ever considered.
    //
    // A person who is spending WELL withholds: they leave enough in the bank to
    // field the big bat when its cooldown ends, instead of dribbling it away on
    // cheap ones. That is what this reserve is, and it is the difference
    // between modelling a Scout-spammer and modelling a player.
    reserve = order.reduce(function (most, k) {
      return Math.max(most, W.UNITS[k].cost);
    }, 0);
  }

  var economy = new W.Economy(level.startEnergy, level.energyPerSecond, level.maxEnergy);
  var spawner = new W.Spawner(level);
  var pool = new W.Pool(function () { return new SimUnit(); });

  var playerBase = new SimBase('player', level.playerBaseHp);
  var enemyBase = new SimBase('enemy', level.enemyBaseHp);
  var world = {
    units: pool.active,
    playerBase: playerBase,
    enemyBase: enemyBase,
    graves: [],

    // Potions and fruit (homework B27). The pretend player does NOT use them -
    // see the note by the COIN FLIP report below - so this is the level's
    // starting stock sitting untouched. It is here so the weakened-damage path
    // in Combat.strike is the same code the browser runs.
    items: W.Items.createState(level),

    // Sim-only bookkeeping, so a gambling cave can be measured rather than
    // guessed at.
    stings: { kills: 0, backfires: 0 },

    // Only the summoning system uses world.spawn, so counting calls here is
    // an exact count of how many bats got raised from the dead.
    spawn: function (unitKey, x) {
      var u = pool.obtain();
      u.spawn(unitKey, x);
      raisedCount++;
      return u;
    }
  };

  var raisedCount = 0;

  var cooldowns = {};
  var litSince = {};   // when each button BECAME tappable (null = it is dark)
  var sent = {};
  use.forEach(function (k) { cooldowns[k] = 0; litSince[k] = null; sent[k] = 0; });

  var dt = 1 / W.CONFIG.sim.stepsPerSecond;
  var t = 0;
  var peakUnits = 0;
  var firstBaseHit = null;
  var wastedEnergy = 0;   // energy that hit the cap and spilled on the floor

  while (t < maxSeconds) {
    var before = economy.energy;
    economy.update(dt);
    W.Items.update(dt, world);
    wastedEnergy += (before + level.energyPerSecond * dt) - economy.energy;

    use.forEach(function (k) {
      if (cooldowns[k] > 0) {
        cooldowns[k] -= dt;
        if (cooldowns[k] < 0) { cooldowns[k] = 0; }
      }
    });

    // The player. A button is "lit" when it is affordable AND off cooldown -
    // exactly what BattleScene.canDeploy() checks. Our pretend thumb lands
    // 'reaction' seconds after that, which is the whole point of this tool.
    // We walk the buttons in spending-policy order (see 'prefer' above).
    order.forEach(function (k) {
      var lit = (cooldowns[k] <= 0 && economy.canAfford(W.UNITS[k].cost));

      if (!lit) {
        litSince[k] = null;
        return;
      }

      if (litSince[k] === null) { litSince[k] = t; }

      if (t - litSince[k] >= reaction) {
        // Keeping the reserve: only buy a cheap bat while still leaving enough
        // banked for the dearest one. The dearest bat itself is never withheld.
        var cost = W.UNITS[k].cost;

        if (reserve > 0 && cost < reserve && (economy.energy - cost) < reserve) {
          return;
        }

        economy.spend(W.UNITS[k].cost);
        cooldowns[k] = W.UNITS[k].cooldown;
        litSince[k] = null;
        sent[k]++;
        pool.obtain().spawn(k, playerBase.spawnX);
      }
    });

    spawner.update(dt, function (key) {
      pool.obtain().spawn(key, enemyBase.spawnX);
    });

    var i;
    for (i = 0; i < pool.active.length; i++) { pool.active[i].update(dt, world); }
    for (i = pool.active.length - 1; i >= 0; i--) {
      if (!pool.active[i].active) { pool.release(pool.active[i]); }
    }

    if (pool.active.length > peakUnits) { peakUnits = pool.active.length; }
    if (firstBaseHit === null && enemyBase.hp < enemyBase.maxHp) { firstBaseHit = t; }

    t += dt;

    if (enemyBase.hp <= 0) {
      return result('WIN', t);
    }
    if (playerBase.hp <= 0) {
      return result('LOSE', t);
    }
  }

  return result('STALEMATE', t);

  function result(outcome, seconds) {
    return {
      outcome: outcome,
      reaction: reaction,
      seconds: +seconds.toFixed(1),
      playerBaseHp: Math.ceil(playerBase.hp),
      playerBasePct: Math.round((playerBase.hp / playerBase.maxHp) * 100),
      enemyBaseHp: Math.ceil(enemyBase.hp),
      enemyBasePct: Math.round((enemyBase.hp / enemyBase.maxHp) * 100),
      peakUnits: peakUnits,
      sent: sent,
      raised: raisedCount,
      stingKills: world.stings.kills,
      stingBackfires: world.stings.backfires,
      wastedEnergy: Math.round(wastedEnergy),
      firstBaseHitAt: firstBaseHit === null ? null : +firstBaseHit.toFixed(1),
      wavesUnspawned: spawner.schedule.length - spawner.nextIndex,
      unitObjectsMade: pool.size()
    };
  }
}

/* -------------------------------------------------------------------------
   THE TAP-ECONOMY CHECK - the thing that would have caught the Level 1 bug
   before anybody played it.

   For every bat you can deploy, compare two numbers:

     how long until you can AFFORD another   =  cost / energyPerSecond
     how long until the COOLDOWN lets you    =  cooldown

   Whichever is BIGGER is what actually limits you. If it is the cooldown,
   the button sits there lit and idle waiting for your thumb, and every
   fraction of a second you are late is a bat that is gone for good. If it is
   the money, being late costs you nothing at all - the energy just banks up.

   Cheap bats you are meant to spam should be limited by MONEY.
   ------------------------------------------------------------------------- */
function checkTapEconomy(levelKey) {
  var level = W.LEVELS[levelKey];

  return level.playerUnits.map(function (k) {
    var stats = W.UNITS[k];
    var affordEvery = stats.cost / level.energyPerSecond;
    var limitedBy = (stats.cooldown > affordEvery) ? 'cooldown' : 'money';

    return {
      unitKey: k,
      name: stats.name,
      cooldown: stats.cooldown,
      affordEvery: +affordEvery.toFixed(2),
      limitedBy: limitedBy,

      // How much lateness the banked energy absorbs for free. Negative means
      // every single millisecond of lateness costs you a bat.
      freeSlack: +(affordEvery - stats.cooldown).toFixed(2),

      // A bat you send every couple of seconds is one you are meant to spam.
      spammable: stats.cost <= level.maxEnergy / 4
    };
  });
}

/* -------------------------------------------------------------------------
   Command-line part. This only runs when you type  node tools/balance-sim.js
   - if another script requires this file, it just gets the functions.
   ------------------------------------------------------------------------- */

module.exports = { playLevel: playLevel, checkTapEconomy: checkTapEconomy };

if (require.main !== module) {
  return;
}

var args = process.argv.slice(2);
var levelKey = 'level1';
var oneReaction = null;
var i;

for (i = 0; i < args.length; i++) {
  if (args[i] === '--reaction' || args[i] === '-r') {
    oneReaction = parseFloat(args[i + 1]);
    i++;
  } else {
    levelKey = args[i];
  }
}

if (!W.LEVELS[levelKey]) {
  console.error('No such level: ' + levelKey);
  console.error('Levels in data/levels.js: ' + Object.keys(W.LEVELS).join(', '));
  process.exit(1);
}

var level = W.LEVELS[levelKey];

console.log('');
console.log('  Level: ' + levelKey + '  (' + level.name + ')');

/* --- part 1: the tap-economy check ------------------------------------- */
console.log('');
console.log('  WHAT LIMITS YOUR TAPPING');
console.log('  ' + pad('bat', 14) + pad('cooldown', 11) + pad('afford every', 15) +
  pad('limited by', 13) + 'lateness you get away with');

var trouble = [];

checkTapEconomy(levelKey).forEach(function (c) {
  var slack = (c.freeSlack > 0) ? ('up to ' + c.freeSlack + 's per tap, free') : 'NONE - every late tap is a lost bat';

  console.log('  ' + pad(c.name, 14) + pad(c.cooldown + 's', 11) + pad(c.affordEvery + 's', 15) +
    pad(c.limitedBy.toUpperCase(), 13) + slack);

  if (c.limitedBy === 'cooldown' && c.spammable) { trouble.push(c); }
});

if (trouble.length) {
  console.log('');
  trouble.forEach(function (c) {
    console.log('  !! ' + c.name + ' is a cheap bat limited by its COOLDOWN, not by money.');
    console.log('     You can afford one every ' + c.affordEvery + 's but may only send one every ' +
      c.cooldown + 's,');
    console.log('     so the button waits, lit, for your thumb - and a person is always a bit late.');
    console.log('     FIX: lower its cooldown below ' + c.affordEvery + 's, or raise its cost.');
  });
}

/* --- part 2: the same level played by people of different sharpness ---- */
var band = (oneReaction !== null) ? [oneReaction] : [0, 0.2, 0.3, 0.4, 0.5, 0.7, 1.0];

console.log('');
console.log('  PLAYED BY A PERSON (tapping every button the moment it lights up, so the');
console.log('  cheap bat soaks up the money - in practice a Scout-spammer)');
console.log('  ' + pad('reaction', 11) + pad('outcome', 12) + pad('length', 10) +
  pad('your base', 12) + pad('enemy base', 12) + 'bats sent');

var runs = band.map(function (r) {
  var res = playLevel(levelKey, { reaction: r, maxSeconds: 400 });
  console.log('  ' + pad(r === 0 ? '0s (robot)' : r + 's', 11) + pad(res.outcome, 12) +
    pad(res.seconds + 's', 10) + pad(res.playerBasePct + '%', 12) +
    pad(res.enemyBasePct + '%', 12) + describeSent(res.sent) +
    (res.raised ? '  (+' + res.raised + ' raised)' : ''));
  return res;
});

/* --- the same band, but spending the money differently ------------------ */
console.log('');
console.log('  THE SAME PLAYER, SPENDING WELL (saving up for the dearest bat instead');
console.log('  of dribbling it away on the cheap one)');
console.log('  ' + pad('reaction', 11) + pad('outcome', 12) + pad('length', 10) + 'bats sent');

var wellRuns = band.map(function (r) {
  var res = playLevel(levelKey, { reaction: r, prefer: 'priciest', maxSeconds: 400 });
  console.log('  ' + pad(r === 0 ? '0s (robot)' : r + 's', 11) + pad(res.outcome, 12) +
    pad(res.seconds + 's', 10) + describeSent(res.sent) +
    (res.raised ? '  (+' + res.raised + ' raised)' : ''));
  return res;
});

/* --- part 3: the hoarder, who is supposed to lose --------------------- */
console.log('');
console.log('  PLAYED BY A HOARDER (saving energy instead of spending it)');
console.log('  ' + pad('waits', 11) + pad('outcome', 12) + pad('length', 10) +
  pad('your base', 12) + pad('energy wasted', 15) + 'bats sent');

var hoarders = [8, 14].map(function (patience) {
  var res = playLevel(levelKey, { reaction: patience, maxSeconds: 300 });
  console.log('  ' + pad(patience + 's', 11) + pad(res.outcome, 12) + pad(res.seconds + 's', 10) +
    pad(res.playerBasePct + '%', 12) + pad(res.wastedEnergy + '', 15) + describeSent(res.sent));
  return res;
});

/* --- part 3b: the coin flip, for caves with a gambling bug ------------- */
/* Which bugs in this level's waves gamble on every hit? */
function gamblingBugsIn(lvl) {
  var seen = {};

  (lvl.waves || []).forEach(function (wave) {
    if (W.Sting.hasSting(W.UNITS[wave.enemy])) { seen[wave.enemy] = true; }
  });

  return Object.keys(seen);
}

var gamblers = gamblingBugsIn(level);
var seedRuns = [];

if (gamblers.length) {
  console.log('');
  console.log('  THE COIN FLIP - this cave contains ' +
    gamblers.map(function (k) { return W.UNITS[k].name; }).join(', ') + ',');
  console.log('  which gambles on every attack. Same cave, same 0.3s thumb, 20 different');
  console.log('  rolls of the dice. A cave has to win ALL of them, not most.');
  console.log('  ' + pad('spending', 16) + pad('won', 10) + pad('quickest', 12) +
    pad('slowest', 12) + 'bats stung dead / scorpions burst');

  ['cheapest', 'priciest'].forEach(function (policy) {
    var wins = 0;
    var times = [];
    var kills = 0;
    var backfires = 0;
    var s;

    for (s = 1; s <= 20; s++) {
      var res = playLevel(levelKey, {
        reaction: 0.3, prefer: policy, seed: s, maxSeconds: 400
      });

      seedRuns.push(res);

      if (res.outcome === 'WIN') { wins++; times.push(res.seconds); }
      kills += res.stingKills;
      backfires += res.stingBackfires;
    }

    console.log('  ' + pad(policy, 16) + pad(wins + '/20', 10) +
      pad(times.length ? Math.min.apply(null, times) + 's' : '-', 12) +
      pad(times.length ? Math.max.apply(null, times) + 's' : '-', 12) +
      (kills / 20).toFixed(1) + ' / ' + (backfires / 20).toFixed(1) + ' per battle');
  });
}

/* --- part 4: the verdict ---------------------------------------------- */
var attentive = runs.filter(function (r) { return r.reaction > 0 && r.reaction <= 0.5; });
var attentiveWins = attentive.length > 0 && attentive.every(function (r) { return r.outcome === 'WIN'; });
var hoarderWins = hoarders.some(function (r) { return r.outcome === 'WIN'; });

var firstLoss = null;
runs.forEach(function (r) {
  if (firstLoss === null && r.outcome !== 'WIN') { firstLoss = r.reaction; }
});

var lengths = attentive.filter(function (r) { return r.outcome === 'WIN'; })
  .map(function (r) { return r.seconds; });

var wellAttentive = wellRuns.filter(function (r) { return r.reaction > 0 && r.reaction <= 0.5; });
var wellWins = wellAttentive.length > 0 && wellAttentive.every(function (r) { return r.outcome === 'WIN'; });

console.log('');
console.log('  VERDICT');
console.log('  ' + (wellWins ? '[ok]  ' : '[BAD] ') +
  'Spending well (saving for the dear bat) ' + (wellWins ? 'also WINS' : 'LOSES') +
  ' - a cave should not demand one exact way of playing');
console.log('  ' + (attentiveWins ? '[ok]  ' : '[BAD] ') +
  'Tapping attentively (0.2s - 0.5s late) ' + (attentiveWins ? 'WINS' : 'DOES NOT always win') +
  (lengths.length ? ', taking ' + Math.min.apply(null, lengths) + '-' + Math.max.apply(null, lengths) + 's' : ''));
/* Is SPENDING rewarded? This is the check that matters on every cave.

   From cave 2 on, the player has the Archer (safe behind the line) and the
   Necrobatcer (recycles the dead), and a patient turtle becomes a real way to
   win. That is those bats doing their job, not a broken cave - so demanding
   that a hoarder always LOSE would be the wrong test, and quietly dropping
   the test would be worse.

   What has to stay true is that pressing on is the FASTER route. If turtling
   ever finishes sooner than attentive play, the cave is rewarding hoarding and
   Lewis's B7 answer ("keep it strict") has been thrown away. */
var slowestAttentive = lengths.length ? Math.max.apply(null, lengths) : Infinity;

var patientButFaster = hoarders.filter(function (r) {
  return r.outcome === 'WIN' && r.seconds <= slowestAttentive;
});

if (level.practice) {
  console.log('  [--]  Hoarding ' + (hoarderWins ? 'also wins' : 'loses') +
    ', which does not matter: this level is marked practice: true');
} else if (patientButFaster.length) {
  console.log('  [BAD] Playing PATIENTLY is as fast or faster than spending - this cave');
  console.log('        rewards hoarding, which is the opposite of the intended economy');
} else if (hoarderWins) {
  console.log('  [ok]  Patient play can also win, but it is slower - spending still pays');
} else {
  console.log('  [ok]  Hoarding loses outright');
}

/* A gambling cave has to win on every roll of the dice, not most of them. */
if (seedRuns.length) {
  var seedLosses = seedRuns.filter(function (r) { return r.outcome !== 'WIN'; }).length;

  console.log('  ' + (seedLosses === 0 ? '[ok]  ' : '[BAD] ') +
    'The gambling bug: won ' + (seedRuns.length - seedLosses) + ' of ' + seedRuns.length +
    ' rolls of the dice' +
    (seedLosses === 0 ? '' : ' - a cave lost to bad luck is not a hard cave, it is an unfair one'));
}

/* And the tutorial's own, stricter promise, only where a level claims it. */
if (level.teachesSpending) {
  console.log('  ' + (hoarderWins ? '[BAD] ' : '[ok]  ') +
    'teachesSpending: a hoarder must lose outright here, and ' +
    (hoarderWins ? 'DOES NOT' : 'does'));
}
if (oneReaction !== null) {
  // Only one reaction time was played, so we cannot say anything about the band.
  console.log('  [--]  Only ' + oneReaction + 's was tested. Run without --reaction for the whole band.');
} else if (firstLoss === null) {
  console.log('  [ok]  Holds up even at 1.0s late - a very relaxed thumb still wins');
} else {
  console.log('  ' + (firstLoss > 0.5 ? '[ok]  ' : '[BAD] ') +
    'Starts losing once you are ' + firstLoss + 's late');
}
console.log('');
if (level.practice) {
  console.log('  This is a PRACTICE level (practice: true), so it only has to be winnable');
  console.log('  and fun to experiment on. It is not measured for a lesson.');
} else {
  console.log('  A good cave wins across the whole 0.2s - 0.5s band in about 50-100s, and');
  console.log('  is quicker to win by spending than by hoarding. Do NOT tune against the');
  console.log('  0s robot row: no child has a 0s thumb, and tuning to it broke cave 1 once.');
}
console.log('');
console.log('  (Note: in a one-lane game the ending is nearly all-or-nothing. Win and the');
console.log('  fight is happening at THEIR base, so yours finishes near 100%. There is no');
console.log('  reliable "squeaked home on 40% health" setting to aim for.)');
console.log('');

function describeSent(sent) {
  return Object.keys(sent).map(function (k) {
    return W.UNITS[k].name.replace(' Bat', '') + ' ' + sent[k];
  }).join(', ');
}

function pad(s, n) {
  s = String(s);
  while (s.length < n) { s += ' '; }
  return s;
}
