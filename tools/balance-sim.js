/* =========================================================================
   BALANCE SIM - play a whole level in a fraction of a second
   =========================================================================
   Run it with Node (no browser, no graphics):

       node tools/balance-sim.js
       node tools/balance-sim.js level1

   It plays the level using the same data/ and src/systems/ files the real
   game uses, with a simple "send out whatever I can afford" player, and
   tells you whether the level is winnable and how long it takes.

   Why this exists: changing a number in data/units.js and then playing a
   90-second battle to find out what happened is slow. This answers the
   question instantly, so Lewis can tune, run, tune, run.

   It is a TESTING TOOL ONLY. The game itself never loads this file, and the
   game runs perfectly without it.
   ========================================================================= */

var path = require('path');
var root = path.join(__dirname, '..');

// The game files expect a browser 'window'. Node does not have one, so we
// make an empty object and let each file hang its part off it, exactly like
// the browser does.
global.window = {};

require(path.join(root, 'data/config.js'));
require(path.join(root, 'data/units.js'));
require(path.join(root, 'data/levels.js'));
require(path.join(root, 'src/systems/economy.js'));
require(path.join(root, 'src/systems/pool.js'));
require(path.join(root, 'src/systems/combat.js'));
require(path.join(root, 'src/systems/spawner.js'));

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

  var death = this.stats.anims.death;
  this.deathDuration = (death.end - death.start + 1) / death.frameRate;
};

SimUnit.prototype.update = function (dt, world) {
  if (!this.active) { return; }

  if (this.isDying) {
    this.dyingTimer -= dt;
    if (this.dyingTimer <= 0) { this.active = false; }
    return;
  }

  var target = W.Combat.findTarget(this, world);

  if (target) {
    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      W.Combat.applyDamage(target, this.stats.attack);
      this.attackTimer = this.stats.attackInterval;
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
   ------------------------------------------------------------------------- */
function playLevel(levelKey, maxSeconds) {
  var level = W.LEVELS[levelKey];
  var economy = new W.Economy(level.startEnergy, level.energyPerSecond, level.maxEnergy);
  var spawner = new W.Spawner(level);
  var pool = new W.Pool(function () { return new SimUnit(); });

  var playerBase = new SimBase('player', level.playerBaseHp);
  var enemyBase = new SimBase('enemy', level.enemyBaseHp);
  var world = { units: pool.active, playerBase: playerBase, enemyBase: enemyBase };

  var cooldowns = {};
  level.playerUnits.forEach(function (k) { cooldowns[k] = 0; });

  var dt = 1 / W.CONFIG.sim.stepsPerSecond;
  var t = 0;
  var peakUnits = 0;
  var firstBaseHit = null;

  while (t < maxSeconds) {
    economy.update(dt);

    level.playerUnits.forEach(function (k) {
      if (cooldowns[k] > 0) {
        cooldowns[k] -= dt;
        if (cooldowns[k] < 0) { cooldowns[k] = 0; }
      }
    });

    // The simple player: send out anything affordable and off cooldown.
    level.playerUnits.forEach(function (k) {
      if (cooldowns[k] <= 0 && economy.canAfford(W.UNITS[k].cost)) {
        economy.spend(W.UNITS[k].cost);
        cooldowns[k] = W.UNITS[k].cooldown;
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
      return result('WIN', t, playerBase, enemyBase, peakUnits, firstBaseHit, spawner, pool);
    }
    if (playerBase.hp <= 0) {
      return result('LOSE', t, playerBase, enemyBase, peakUnits, firstBaseHit, spawner, pool);
    }
  }

  return result('STALEMATE', t, playerBase, enemyBase, peakUnits, firstBaseHit, spawner, pool);
}

function result(outcome, t, pBase, eBase, peak, firstHit, spawner, pool) {
  return {
    outcome: outcome,
    seconds: +t.toFixed(1),
    playerBaseHp: Math.ceil(pBase.hp),
    playerBasePct: Math.round((pBase.hp / pBase.maxHp) * 100),
    enemyBaseHp: Math.ceil(eBase.hp),
    enemyBasePct: Math.round((eBase.hp / eBase.maxHp) * 100),
    peakUnits: peak,
    firstBaseHitAt: firstHit === null ? null : +firstHit.toFixed(1),
    wavesUnspawned: spawner.schedule.length - spawner.nextIndex,
    unitObjectsMade: pool.size()
  };
}

/* -------------------------------------------------------------------------
   Command-line part. This only runs when you type  node tools/balance-sim.js
   - if another script requires this file, it just gets playLevel() to call.
   ------------------------------------------------------------------------- */

module.exports = { playLevel: playLevel };

if (require.main !== module) {
  return;
}

var levelKey = process.argv[2] || 'level1';

if (!W.LEVELS[levelKey]) {
  console.error('No such level: ' + levelKey);
  console.error('Levels in data/levels.js: ' + Object.keys(W.LEVELS).join(', '));
  process.exit(1);
}

var r = playLevel(levelKey, 300);

console.log('');
console.log('  Level:            ' + levelKey + '  (' + W.LEVELS[levelKey].name + ')');
console.log('  Outcome:          ' + r.outcome);
console.log('  Battle length:    ' + r.seconds + 's');
console.log('  Your base left:   ' + r.playerBaseHp + '  (' + r.playerBasePct + '%)');
console.log('  Enemy base left:  ' + r.enemyBaseHp + '  (' + r.enemyBasePct + '%)');
console.log('  First hit on enemy base at: ' + (r.firstBaseHitAt === null ? 'never' : r.firstBaseHitAt + 's'));
console.log('  Waves never spawned: ' + r.wavesUnspawned);
console.log('  Most units at once:  ' + r.peakUnits);
console.log('');
console.log('  A good level 1 should be a WIN, take 60-100s, use nearly every');
console.log('  wave, and leave your base damaged but standing (roughly 30-80%).');
console.log('');
