/* =========================================================================
   UNIT - one bat (or one monster)
   =========================================================================
   A unit is built entirely from a definition in data/units.js. This file
   contains NO stats at all - it just knows how to *behave*:

       walk forward  ->  something in range?  ->  stop and hit it
       out of health ->  play the death animation  ->  go back in the pool

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
   Build the on-screen parts ONCE. A container keeps the sprite and the
   health bar glued together so we only have to move one thing.
   ------------------------------------------------------------------------- */
window.Unit.prototype.buildView = function () {
  var cfg = window.CONFIG;

  this.sprite = this.scene.add.sprite(0, 0, '__DEFAULT');
  this.sprite.setOrigin(0.5, 1);   // feet at the bottom, standing on the lane

  this.barBack = this.scene.add.rectangle(
    0, cfg.healthBar.unitOffsetY,
    cfg.healthBar.unitWidth, cfg.healthBar.unitHeight,
    cfg.healthBar.backColor, cfg.healthBar.backAlpha
  );

  this.barFill = this.scene.add.rectangle(
    -cfg.healthBar.unitWidth / 2, cfg.healthBar.unitOffsetY,
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
  this.stats = window.UNITS[unitKey];

  this.team = this.stats.enemy ? 'enemy' : 'player';
  this.direction = this.stats.enemy ? -1 : 1;

  this.x = startX;
  this.hp = this.stats.hp;
  this.attackTimer = 0;       // ready to swing the moment it meets someone
  this.isDying = false;
  this.dyingTimer = 0;
  this.active = true;
  this.currentAnim = null;

  // How long the death animation lasts, worked out from the frame data so
  // nobody has to keep two numbers in sync.
  var death = this.stats.anims.death;
  this.deathDuration = (death.end - death.start + 1) / death.frameRate;

  // Enemies are the same drawing, just mirrored to face left.
  this.sprite.setFlipX(this.stats.enemy === true);
  this.sprite.setAlpha(1);
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

/* -------------------------------------------------------------------------
   THE BRAIN. Called once per fixed simulation step.
   ------------------------------------------------------------------------- */
window.Unit.prototype.update = function (dt, world) {
  if (!this.active) {
    return;
  }

  // Already dying? Just count down the death animation, then bow out.
  if (this.isDying) {
    this.dyingTimer -= dt;

    if (this.dyingTimer <= 0) {
      this.active = false;     // the battle scene will pool it next sweep
    }

    return;
  }

  var target = window.Combat.findTarget(this, world);

  if (target) {
    this.fight(dt, target);
  } else {
    this.walk(dt, world);
  }
};

/* Walk forward, unless a friend is already standing in the way. */
window.Unit.prototype.walk = function (dt, world) {
  if (window.Combat.isBlockedByFriend(this, world)) {
    // Wait our turn in the queue instead of walking into a friend's back.
    this.playAnim('idle');
    return;
  }

  this.x += this.stats.speed * this.direction * dt;
  this.playAnim('walk');
};

/* Stand still and hit the target on our own attack interval. */
window.Unit.prototype.fight = function (dt, target) {
  this.attackTimer -= dt;

  if (this.attackTimer <= 0) {
    window.Combat.applyDamage(target, this.stats.attack);

    this.attackTimer = this.stats.attackInterval;

    // 'true' here means "restart it", so every swing plays the full animation.
    this.playAnim('attack', true);
  } else if (this.currentAnim !== 'attack') {
    // Between swings, wait in the idle pose.
    this.playAnim('idle');
  }
};

/* -------------------------------------------------------------------------
   Take a hit. Called by the combat system.
   ------------------------------------------------------------------------- */
window.Unit.prototype.takeDamage = function (amount) {
  if (this.isDying) {
    return;
  }

  this.hp -= amount;

  if (this.hp <= 0) {
    this.hp = 0;
    this.startDying();
  }
};

/* Begin the death animation. The unit stops fighting immediately. */
window.Unit.prototype.startDying = function () {
  this.isDying = true;
  this.dyingTimer = this.deathDuration;

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
  // nudged a few pixels so overlapping units stay readable.
  this.view.setPosition(this.x + this.drawOffsetX, cfg.lane.y + this.laneOffset);

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

/* TODO for Lewis: special powers could live here, for example
     - if (this.stats.explodesOnDeath) { hurt everyone nearby }
     - if (this.stats.healsFriends)   { top up the bat in front }
   Add a flag in data/units.js, then check for it in update(). */
