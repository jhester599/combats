/* =========================================================================
   UNIT - one bat (or one monster)
   =========================================================================
   A unit is built entirely from a definition in data/units.js. This file
   contains NO stats and, since 2026-10-12, NO behaviour either: what a unit
   DOES each step is src/systems/brain.js, shared with the balance sim. This
   file is the drawing - a sprite and a health bar that follow the numbers.

   Units are POOLED (see src/systems/pool.js): when one dies its object is
   reused for the next unit instead of being thrown away. That is why the
   drawing is built once in the constructor and only *reconfigured* in
   spawn().
   ========================================================================= */

window.Unit = function (scene) {
  this.scene = scene;

  // --- simulation state (the numbers the game brain uses) ---
  this.unitKey = null;
  this.stats = null;
  this.team = 'player';
  this.direction = 1;       // +1 walks right, -1 walks left
  this.x = 0;
  this.hp = 0;
  this.attackTimer = 0;
  this.isDying = false;
  this.dyingTimer = 0;
  this.active = false;      // false = finished, ready to be pooled

  this.currentAnim = null;  // so we do not restart an animation every frame

  this.buildView();
};

/* -------------------------------------------------------------------------
   How big to draw this unit.

   Two numbers multiplied: the unit's OWN scale from data/units.js, which says
   how big it is relative to everything else, and CONFIG.units.sizeBoost, which
   zooms the whole cast at once. Keeping them separate means the size of the
   game can be changed without disturbing a single one of the relationships
   between units, each of which was set by eye against the real artwork.

   Note for anyone changing this: BattleScene.portraitScaleFor() uses this as a
   RATIO between units, so the boost cancels out there and the deploy-button
   portraits are not affected. That is intended - they fit a fixed box.
   ------------------------------------------------------------------------- */
window.Unit.scaleOf = function (stats) {
  var own = (stats.scale === undefined) ? 1 : stats.scale;

  return own * window.CONFIG.units.sizeBoost;
};

/* -------------------------------------------------------------------------
   Build the on-screen parts ONCE. A container keeps the sprite and the
   health bar glued together so we only have to move one thing.
   ------------------------------------------------------------------------- */
window.Unit.prototype.buildView = function () {
  var cfg = window.CONFIG;

  this.sprite = this.scene.add.sprite(0, 0, '__DEFAULT');
  this.sprite.setOrigin(0.5, 1);   // feet at the bottom, standing on the lane

  // The bars get their real height in spawn(), once we know how big this
  // particular bat is drawn.
  this.barBack = this.scene.add.rectangle(
    0, 0,
    cfg.healthBar.unitWidth, cfg.healthBar.unitHeight,
    cfg.healthBar.backColor, cfg.healthBar.backAlpha
  );

  this.barFill = this.scene.add.rectangle(
    -cfg.healthBar.unitWidth / 2, 0,
    cfg.healthBar.unitWidth, cfg.healthBar.unitHeight,
    cfg.healthBar.fillColorHigh
  );
  this.barFill.setOrigin(0, 0.5);   // drain from the right

  this.view = this.scene.add.container(0, 0, [this.sprite, this.barBack, this.barFill]);
  this.view.setVisible(false);
};

/* -------------------------------------------------------------------------
   Wake this unit up as a brand new bat/monster.
   unitKey is a key from data/units.js, e.g. 'scoutBat'.
   ------------------------------------------------------------------------- */
window.Unit.prototype.spawn = function (unitKey, startX) {
  var cfg = window.CONFIG;

  this.unitKey = unitKey;

  // Your bats fight with their UPGRADED numbers, if the casino has upgraded
  // them - a copy, never the shared original (src/systems/casino.js).
  this.stats = window.Casino.statsFor(unitKey);

  // And wear their colour from the ladder (CONFIG.upgradeTiers): the whole
  // point of drawing them black and white. null = plain, as drawn.
  this.upgradeTint = this.stats.enemy ? null : window.Casino.tintFor(unitKey);

  this.team = this.stats.enemy ? 'enemy' : 'player';
  this.direction = this.stats.enemy ? -1 : 1;

  this.x = startX;
  this.currentAnim = null;

  // Health, timers and every power's state (graves, freezing, flying...).
  // Units are pooled, so ALL of it is reset for every new bat, in one place.
  window.Brain.reset(this);

  this.sprite.setAlpha(1);
  this.paintTint();

  // How big to draw it. Two units can be the same size in the art tool and
  // still look big and small in the game - that is what "scale" is for.
  var scale = window.Unit.scaleOf(this.stats);
  this.sprite.setScale(scale);

  // Float the health bar just above this bat's head. The sprite is drawn with
  // its feet at 0 and grows upwards, so the top of it is minus its height.
  var barY = -(this.stats.anims.frameHeight * scale) - cfg.healthBar.unitBarGap;
  this.barBack.y = barY;
  this.barFill.y = barY;
  this.sprite.setTexture(this.stats.sprite, this.stats.anims.idle.start);

  // A tiny offset so a pile of units reads as a crowd, not one blob.
  // These only move the PICTURE - this.x (what the fight uses) is untouched.
  this.laneOffset = (Math.random() - 0.5) * 2 * cfg.lane.stackJitter;
  this.drawOffsetX = (Math.random() - 0.5) * 2 * cfg.lane.stackJitterX;

  this.setBarsVisible(true);
  this.view.setVisible(true);
  this.playAnim('walk');
  this.refresh();
};

/* The bat's upgrade colour, or none for a plain one. */
window.Unit.prototype.paintTint = function () {
  if (this.upgradeTint !== null && this.upgradeTint !== undefined) {
    this.sprite.setTint(this.upgradeTint);
  } else {
    this.sprite.clearTint();
  }
};

/* -------------------------------------------------------------------------
   Called once per fixed simulation step. The thinking is shared with the
   balance sim, so it lives in src/systems/brain.js.
   ------------------------------------------------------------------------- */
window.Unit.prototype.update = function (dt, world) {
  window.Brain.step(this, dt, world);
};

window.Unit.prototype.takeDamage = function (amount) {
  window.Brain.takeDamage(this, amount);
};

/* -------------------------------------------------------------------------
   The brain telling the drawing what happened.

   show(): 'restart' replays an animation from the start (every swing).
   'unlessSwinging' is for the pause between swings - go idle, but do not cut
   a swing short that is still playing.
   ------------------------------------------------------------------------- */
window.Unit.prototype.show = function (animName, restart, unlessSwinging) {
  if (this.isDying && animName !== 'death') {
    return;               // never let anything wipe out the death animation
  }

  if (unlessSwinging && this.currentAnim === 'attack') {
    return;
  }

  this.playAnim(animName, restart);
};

/* Begin the death animation. The brain has already stopped the unit. */
window.Unit.prototype.onStartDying = function () {
  this.setBarsVisible(false);
  this.playAnim('death', true);
};

/* -------------------------------------------------------------------------
   Play an animation, but do not restart it if it is already running
   (otherwise it would be stuck on frame 1 forever).
   ------------------------------------------------------------------------- */
window.Unit.prototype.playAnim = function (animName, forceRestart) {
  if (!forceRestart && this.currentAnim === animName) {
    return;
  }

  this.currentAnim = animName;
  this.sprite.play(this.unitKey + '_' + animName, false);
};

window.Unit.prototype.setBarsVisible = function (visible) {
  this.barBack.setVisible(visible);
  this.barFill.setVisible(visible);
};

/* -------------------------------------------------------------------------
   Copy the simulation numbers onto the drawing. Called after each step.
   ------------------------------------------------------------------------- */
window.Unit.prototype.refresh = function () {
  var cfg = window.CONFIG;

  // Note the drawing offsets: the simulation uses this.x, the picture is
  // nudged a few pixels so overlapping units stay readable. A Bomb Bat on its
  // run is drawn up in the air, over everyone's heads.
  var lift = this.flying ? cfg.units.flyHeight : 0;
  this.view.setPosition(this.x + this.drawOffsetX, cfg.lane.y + this.laneOffset - lift);

  // Face the way it is going. Bugs walk left, so they are mirrored; a Bomb Bat
  // flying home turns round.
  this.sprite.setFlipX(this.direction < 0);

  // Frozen bugs go icy blue (homework-free: Jeff's Frost Bat, 2026-10-12).
  if (window.Frost.isFrozen(this)) {
    this.sprite.setTint(cfg.units.frozenTint);
  } else {
    this.paintTint();
  }

  // Units nearer the front of the screen draw on top. Keeps the pile readable.
  this.view.setDepth(cfg.lane.y + this.laneOffset);

  if (this.isDying) {
    // Fade out as the death animation plays.
    var remaining = this.dyingTimer / this.deathDuration;
    this.sprite.setAlpha(remaining < 0 ? 0 : remaining);
    return;
  }

  var ratio = this.hp / this.stats.hp;

  // An untouched bat does not need a bar - it just adds clutter to a big pile.
  var showBar = !(cfg.healthBar.hideUnitBarWhenFull && ratio >= 1);
  this.setBarsVisible(showBar);

  if (!showBar) {
    return;
  }

  this.barFill.width = cfg.healthBar.unitWidth * ratio;

  this.barFill.fillColor = (ratio <= cfg.healthBar.lowThreshold)
    ? cfg.healthBar.fillColorLow
    : cfg.healthBar.fillColorHigh;
};

/* -------------------------------------------------------------------------
   Hide the unit and park it. Called when the pool takes it back.
   ------------------------------------------------------------------------- */
window.Unit.prototype.deactivate = function () {
  this.active = false;
  this.view.setVisible(false);
  this.sprite.stop();
  this.currentAnim = null;
};

/* THE SPECIAL POWERS ARE NOT WRITTEN IN THIS FILE. Each is a rules file in
   src/systems/ and a block of numbers in data/units.js, and
   src/systems/brain.js decides when to ask it - see the list at the top of
   that file. The balance sim runs the same brain, so a new power needs no
   wiring here or in tools/balance-sim.js at all. */
