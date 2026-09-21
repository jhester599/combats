/* =========================================================================
   BASE - the building each side is trying to destroy
   =========================================================================
   Your base sits on the left, the enemy base on the right.
   Destroy theirs to WIN. Lose yours and you LOSE.

   A base is deliberately simple: it has HP, a position, and it can take
   damage. That is enough for the combat system to treat it like any other
   target.

   All positions, sizes and colours come from data/config.js.
   The HP comes from the level (data/levels.js).
   ========================================================================= */

window.Base = function (scene, team, maxHp) {
  var cfg = window.CONFIG;

  this.scene = scene;
  this.team = team;                 // 'player' or 'enemy'
  this.maxHp = maxHp;
  this.hp = maxHp;

  var isPlayer = (team === 'player');

  this.x = isPlayer ? cfg.bases.playerX : cfg.bases.enemyX;

  // The "face" is the side that gets attacked - the side facing the battle.
  // Player base is attacked on its right, enemy base on its left.
  this.faceX = isPlayer
    ? this.x + cfg.bases.faceInset
    : this.x - cfg.bases.faceInset;

  // Where this base's units pop out.
  this.spawnX = isPlayer
    ? this.x + cfg.bases.spawnOffset
    : this.x - cfg.bases.spawnOffset;

  this.build();
};

/* -------------------------------------------------------------------------
   Draw the building and its health bar (placeholder art: simple blocks).
   ------------------------------------------------------------------------- */
window.Base.prototype.build = function () {
  var cfg = window.CONFIG;
  var color = (this.team === 'player') ? cfg.bases.playerColor : cfg.bases.enemyColor;

  var bodyY = cfg.lane.y - (cfg.bases.height / 2);

  // Main tower.
  this.body = this.scene.add.rectangle(
    this.x, bodyY, cfg.bases.width, cfg.bases.height, color
  );
  this.body.setStrokeStyle(3, cfg.bases.roofColor);

  // A little roof so it reads as a building and not just a box.
  this.roof = this.scene.add.rectangle(
    this.x,
    bodyY - (cfg.bases.height / 2) - 10,
    cfg.bases.width + 18,
    20,
    cfg.bases.roofColor
  );

  // Health bar, floating above the tower.
  var barY = bodyY + cfg.healthBar.baseOffsetY;

  this.barBack = this.scene.add.rectangle(
    this.x, barY, cfg.healthBar.baseWidth, cfg.healthBar.baseHeight,
    cfg.healthBar.backColor, cfg.healthBar.backAlpha
  );

  this.barFill = this.scene.add.rectangle(
    this.x - (cfg.healthBar.baseWidth / 2), barY,
    cfg.healthBar.baseWidth, cfg.healthBar.baseHeight,
    cfg.healthBar.fillColorHigh
  );

  // Anchor the fill on its LEFT edge so shrinking it drains right-to-left.
  this.barFill.setOrigin(0, 0.5);

  this.hpText = this.scene.add.text(this.x, barY - 20, '', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '14px',
    color: cfg.text.color
  }).setOrigin(0.5);

  // This one mattered most: over Dream Land's clouds it was white on white and
  // could not be read at all. The scene owns the styling so the HUD matches.
  if (this.scene.makeReadable) {
    this.scene.makeReadable(this.hpText);
  }

  this.refresh();
};

/* -------------------------------------------------------------------------
   Take a hit. Called by the combat system.
   ------------------------------------------------------------------------- */
window.Base.prototype.takeDamage = function (amount) {
  this.hp -= amount;

  if (this.hp < 0) {
    this.hp = 0;
  }
};

/* Is this base destroyed? */
window.Base.prototype.isDestroyed = function () {
  return this.hp <= 0;
};

/* -------------------------------------------------------------------------
   Update the drawing to match the numbers. Called after each simulation step.
   ------------------------------------------------------------------------- */
window.Base.prototype.refresh = function () {
  var cfg = window.CONFIG;
  var ratio = this.hp / this.maxHp;

  if (ratio < 0) {
    ratio = 0;
  }

  this.barFill.width = cfg.healthBar.baseWidth * ratio;

  this.barFill.fillColor = (ratio <= cfg.healthBar.lowThreshold)
    ? cfg.healthBar.fillColorLow
    : cfg.healthBar.fillColorHigh;

  this.hpText.setText(Math.ceil(this.hp) + ' / ' + this.maxHp);

  // When the base is dead, make it look wrecked.
  this.body.setAlpha(this.isDestroyed() ? 0.3 : 1);
};
