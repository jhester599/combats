/* =========================================================================
   BATTLE SCENE - the actual game
   =========================================================================
   This scene wires all the pieces together:

     economy.js  -> energy that refills over time
     spawner.js  -> enemy waves on a schedule
     combat.js   -> who hits what
     pool.js     -> reuse unit objects instead of making new ones
     unit.js     -> one bat
     base.js     -> the two buildings

   THE IMPORTANT IDEA: FIXED TIMESTEP
   ----------------------------------
   Phaser calls update() as often as the screen can draw - 60 times a second
   on a laptop, 120 on a fancy phone, 20 on a slow one. If we moved bats by
   "however long the last frame took", the game would literally play
   differently on different devices.

   So instead we save up the leftover time and run the game brain in exact
   1/60th-of-a-second slices. Drawing still happens as fast as the device
   likes, but the SIMULATION is identical everywhere.
   ========================================================================= */

window.BattleScene = function () {
  Phaser.Scene.call(this, { key: 'BattleScene' });
};

window.BattleScene.prototype = Object.create(Phaser.Scene.prototype);
window.BattleScene.prototype.constructor = window.BattleScene;

/* ------------------------------------------------------------------------- */
window.BattleScene.prototype.init = function (data) {
  this.levelKey = (data && data.levelKey) ? data.levelKey : window.STARTING_LEVEL;
  this.level = window.LEVELS[this.levelKey];

  // Leftover time waiting to be turned into simulation steps.
  this.accumulator = 0;

  this.battleOver = false;
  this.playerWon = false;
};

/* ------------------------------------------------------------------------- */
window.BattleScene.prototype.create = function () {
  var self = this;

  this.drawBackground();

  // --- the two buildings ---
  this.playerBase = new window.Base(this, 'player', this.level.playerBaseHp);
  this.enemyBase = new window.Base(this, 'enemy', this.level.enemyBaseHp);

  // --- systems, all fed from the level data ---
  this.economy = new window.Economy(
    this.level.startEnergy,
    this.level.energyPerSecond,
    this.level.maxEnergy
  );

  this.spawner = new window.Spawner(this.level);

  // THE POOLING HOOK: every unit in the game is born here and only here.
  this.unitPool = new window.Pool(function () {
    return new window.Unit(self);
  });

  // What the combat system looks at each step.
  this.world = {
    units: this.unitPool.active,
    playerBase: this.playerBase,
    enemyBase: this.enemyBase,

    // Where your fallen bats are buried, for the Necrobatcer to raise.
    // src/systems/necro.js fills this and empties it.
    graves: [],

    // How anything in the world creates a new unit. The Necrobatcer needs it
    // to bring a bat back, and handing it over like this keeps the summoning
    // rules free of any knowledge of Phaser or of this scene.
    spawn: function (unitKey, x) {
      return self.spawnUnit(unitKey, x);
    }
  };

  // --- cooldown timers, one per deployable unit ---
  this.cooldowns = {};

  var i;

  for (i = 0; i < this.level.playerUnits.length; i++) {
    this.cooldowns[this.level.playerUnits[i]] = 0;
  }

  this.buildGraveMarkers();
  this.buildEnergyBar();
  this.buildDeployButtons();
  this.buildResultPanel();

  this.add.text(window.CONFIG.screen.width / 2, 22, this.level.name, {
    fontFamily: window.CONFIG.text.fontFamily,
    fontSize: '18px',
    color: '#b9a9e8'
  }).setOrigin(0.5, 0);
};

/* -------------------------------------------------------------------------
   The lane and the sky. Placeholder art: flat colours.
   TODO: swap the ground rectangle for a real background image from
         /assets/bg once we pick one.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.drawBackground = function () {
  var cfg = window.CONFIG;

  this.add.rectangle(
    cfg.screen.width / 2, cfg.screen.height / 2,
    cfg.screen.width, cfg.screen.height,
    0x241a47
  );

  // The floor the units walk on.
  this.add.rectangle(
    cfg.screen.width / 2,
    cfg.lane.y + (cfg.lane.groundHeight / 2),
    cfg.screen.width,
    cfg.lane.groundHeight,
    cfg.lane.groundColor
  );

  // A bright line marking the exact lane the units stand on.
  this.add.rectangle(
    cfg.screen.width / 2, cfg.lane.y, cfg.screen.width, 3, cfg.lane.edgeColor
  );
};

/* =========================================================================
   THE MAIN LOOP
   ========================================================================= */
window.BattleScene.prototype.update = function (time, delta) {
  var cfg = window.CONFIG;

  // Phaser hands us milliseconds; the rest of the game thinks in seconds.
  var frameSeconds = delta / 1000;

  // If the tab was in the background, delta can be enormous. Throw the extra
  // away, otherwise we would try to simulate minutes of game in one frame and
  // the browser would lock up (the "spiral of death").
  if (frameSeconds > cfg.sim.maxCatchUpSeconds) {
    frameSeconds = cfg.sim.maxCatchUpSeconds;
  }

  this.accumulator += frameSeconds;

  var step = 1 / cfg.sim.stepsPerSecond;

  // Run as many whole steps as we have saved up time for.
  while (this.accumulator >= step) {
    this.stepSimulation(step);
    this.accumulator -= step;
  }

  // Drawing happens once per frame, after the brain has caught up.
  this.syncView();
};

/* -------------------------------------------------------------------------
   ONE slice of game brain. dt is always exactly 1/60 of a second.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.stepSimulation = function (dt) {
  if (this.battleOver) {
    return;
  }

  this.economy.update(dt);
  this.tickCooldowns(dt);

  // Enemy waves.
  var self = this;

  this.spawner.update(dt, function (unitKey) {
    self.spawnUnit(unitKey, self.enemyBase.spawnX);
  });

  // Every unit thinks.
  var units = this.unitPool.active;
  var i;

  for (i = 0; i < units.length; i++) {
    units[i].update(dt, this.world);
  }

  this.reclaimDeadUnits();
  this.checkWinOrLose();
};

/* Count down every deploy button's cooldown. */
window.BattleScene.prototype.tickCooldowns = function (dt) {
  var keys = Object.keys(this.cooldowns);
  var i;

  for (i = 0; i < keys.length; i++) {
    if (this.cooldowns[keys[i]] > 0) {
      this.cooldowns[keys[i]] -= dt;

      if (this.cooldowns[keys[i]] < 0) {
        this.cooldowns[keys[i]] = 0;
      }
    }
  }
};

/* -------------------------------------------------------------------------
   Units that have finished their death animation go back in the pool so the
   next bat can reuse the object.
   Walking the list backwards means removing items cannot make us skip one.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.reclaimDeadUnits = function () {
  var units = this.unitPool.active;
  var i;

  for (i = units.length - 1; i >= 0; i--) {
    if (!units[i].active) {
      units[i].deactivate();
      this.unitPool.release(units[i]);
    }
  }
};

/* ------------------------------------------------------------------------- */
window.BattleScene.prototype.checkWinOrLose = function () {
  if (this.enemyBase.isDestroyed()) {
    this.endBattle(true);
  } else if (this.playerBase.isDestroyed()) {
    this.endBattle(false);
  }
};

/* -------------------------------------------------------------------------
   What the panel says. Winning the last cave that exists is a different
   message from winning one with another cave after it - telling the player
   "that is all of Palopa so far" is better than leaving them tapping RETRY
   wondering where cave 2 is.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.resultMessage = function (playerWon) {
  if (!playerWon) {
    return 'Your base fell. Try different bats!';
  }

  var nextKey = window.Caves.next(this.levelKey);

  if (nextKey) {
    return 'The cave is yours - ' + window.LEVELS[nextKey].name + ' is unlocked!';
  }

  if (window.LEVELS[this.levelKey].practice) {
    return 'Nice practice. Pick a real cave from the menu!';
  }

  // Last cave in data/levels.js. More are coming: homework B11 and B17.
  return 'The cave is yours - and that is all of Palopa so far!';
};

/* =========================================================================
   SPAWNING
   ========================================================================= */
window.BattleScene.prototype.spawnUnit = function (unitKey, startX) {
  var unit = this.unitPool.obtain();   // reused if one is free
  unit.spawn(unitKey, startX);
  return unit;
};

/* -------------------------------------------------------------------------
   Called when the player taps a deploy button.
   Checks the price and the cooldown, then sends the bat out.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.deploy = function (unitKey) {
  if (this.battleOver) {
    return false;
  }

  if (!this.canDeploy(unitKey)) {
    return false;
  }

  var stats = window.UNITS[unitKey];

  this.economy.spend(stats.cost);
  this.cooldowns[unitKey] = stats.cooldown;

  this.spawnUnit(unitKey, this.playerBase.spawnX);

  return true;
};

/* Is this button usable right now? */
window.BattleScene.prototype.canDeploy = function (unitKey) {
  if (this.cooldowns[unitKey] > 0) {
    return false;
  }

  return this.economy.canAfford(window.UNITS[unitKey].cost);
};

/* =========================================================================
   USER INTERFACE
   ========================================================================= */
window.BattleScene.prototype.buildEnergyBar = function () {
  var cfg = window.CONFIG;
  var bar = cfg.energyBar;

  this.add.rectangle(
    bar.x, bar.y, bar.width, bar.height, bar.backColor, bar.backAlpha
  ).setOrigin(0, 0);

  this.energyFill = this.add.rectangle(
    bar.x, bar.y, bar.width, bar.height, bar.fillColor
  ).setOrigin(0, 0);

  var border = this.add.rectangle(
    bar.x, bar.y, bar.width, bar.height
  ).setOrigin(0, 0);

  border.setStrokeStyle(2, bar.borderColor, bar.borderAlpha);
  border.setFillStyle();

  // Sits beside the bar (not on it) so it is readable when energy is low.
  this.energyText = this.add.text(
    bar.x + bar.width + bar.labelGap, bar.y + (bar.height / 2), '', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '16px',
      color: '#ffd24a'
    }).setOrigin(0, 0.5);
};

/* -------------------------------------------------------------------------
   One button per unit listed in the level's "playerUnits".
   Add a unit key there and a button appears automatically - no code changes.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.buildDeployButtons = function () {
  var cfg = window.CONFIG;

  this.buttons = [];

  var i;

  for (i = 0; i < this.level.playerUnits.length; i++) {
    this.buttons.push(this.makeDeployButton(this.level.playerUnits[i], i));
  }
};

/* ------------------------------------------------------------------------- */
window.BattleScene.prototype.makeDeployButton = function (unitKey, index) {
  var cfg = window.CONFIG;
  var b = cfg.buttons;
  var stats = window.UNITS[unitKey];

  var x = b.startX + (index * (b.width + b.gap));
  var y = b.y;

  var box = this.add.rectangle(x, y, b.width, b.height, b.readyColor).setOrigin(0, 0);
  box.setStrokeStyle(2, b.borderColor, b.borderAlpha);

  // setInteractive() handles mouse clicks AND finger taps - same events.
  box.setInteractive({ useHandCursor: true });

  // A little portrait of the bat so you can tell the buttons apart at a glance.
  var portrait = this.add.sprite(x + 34, y + (b.height / 2) + 12, stats.sprite);
  portrait.setOrigin(0.5, 1);
  // Multiplying by the unit's own scale keeps the buttons telling the same
  // story as the battlefield: the Scout's picture is smaller than the Brute's.
  portrait.setScale(b.portraitScale * window.Unit.scaleOf(stats));
  portrait.play(unitKey + '_idle');

  var nameText = this.add.text(x + 62, y + 14, stats.name, {
    fontFamily: cfg.text.fontFamily,
    fontSize: '15px',
    color: cfg.text.color
  });

  var costText = this.add.text(x + 62, y + 38, stats.cost + ' energy', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '14px',
    color: '#ffd24a'
  });

  // The cooldown shade: covers the whole button, then shrinks away as the
  // cooldown runs down. Anchored at the top so it empties upwards.
  var shade = this.add.rectangle(
    x, y, b.width, b.height, b.cooldownOverlayColor, b.cooldownOverlayAlpha
  ).setOrigin(0, 0);

  // The seconds-remaining number sits on the right so it never lands on top
  // of the unit's name or cost.
  var shadeText = this.add.text(x + b.width - 14, y + (b.height / 2), '', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '26px',
    color: '#ffffff'
  }).setOrigin(1, 0.5);

  var self = this;

  box.on('pointerdown', function () {
    if (self.canDeploy(unitKey)) {
      box.fillColor = b.pressedColor;
      self.deploy(unitKey);
    }
  });

  return {
    unitKey: unitKey,
    box: box,
    portrait: portrait,
    nameText: nameText,
    costText: costText,
    shade: shade,
    shadeText: shadeText
  };
};

/* =========================================================================
   DRAWING - copy the simulation numbers onto the screen
   ========================================================================= */
window.BattleScene.prototype.syncView = function () {
  var units = this.unitPool.active;
  var i;

  for (i = 0; i < units.length; i++) {
    units[i].refresh();
  }

  this.playerBase.refresh();
  this.enemyBase.refresh();

  this.syncEnergyBar();
  this.syncButtons();
  this.syncGraves();
};

/* -------------------------------------------------------------------------
   GRAVE MARKERS (homework B16). One headstone per fallen bat, at the spot it
   fell, cleared the moment a Necrobatcer raises it.

   The stones are POOLED like everything else in this game: a fixed set is
   built once and shown or hidden, so a long battle never piles up objects.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.buildGraveMarkers = function () {
  var g = window.CONFIG.graveMarker;
  var i;

  this.graveMarkers = [];

  for (i = 0; i < g.maxDrawn; i++) {
    // A headstone: an upright slab with a paler crossbar across it.
    var stone = this.add.rectangle(0, 0, g.width, g.height, g.color, g.alpha);
    var bar = this.add.rectangle(0, 0, g.width + 4, 2, g.crossColor, g.alpha);

    stone.setVisible(false);
    bar.setVisible(false);

    this.graveMarkers.push({ stone: stone, bar: bar });
  }
};

window.BattleScene.prototype.syncGraves = function () {
  if (!this.graveMarkers) {
    return;
  }

  var cfg = window.CONFIG;
  var g = cfg.graveMarker;
  var graves = this.world.graves;
  var i;

  for (i = 0; i < this.graveMarkers.length; i++) {
    var marker = this.graveMarkers[i];
    var grave = graves[i];

    if (!grave) {
      marker.stone.setVisible(false);
      marker.bar.setVisible(false);
      continue;
    }

    var y = cfg.lane.y + g.yOffset;

    marker.stone.setPosition(grave.x, y - (g.height / 2));
    marker.bar.setPosition(grave.x, y - (g.height * 0.62));

    // Behind the bats, so a pile of fighting units still reads clearly.
    marker.stone.setDepth(cfg.lane.y - 40);
    marker.bar.setDepth(cfg.lane.y - 40);

    marker.stone.setVisible(true);
    marker.bar.setVisible(true);
  }
};

window.BattleScene.prototype.syncEnergyBar = function () {
  var bar = window.CONFIG.energyBar;

  this.energyFill.width = bar.width * this.economy.fillRatio();

  this.energyText.setText(
    Math.floor(this.economy.energy) + ' / ' + this.economy.maxEnergy
  );
};

window.BattleScene.prototype.syncButtons = function () {
  var b = window.CONFIG.buttons;
  var i;
  var button;
  var remaining;
  var stats;
  var affordable;

  for (i = 0; i < this.buttons.length; i++) {
    button = this.buttons[i];
    stats = window.UNITS[button.unitKey];
    remaining = this.cooldowns[button.unitKey];
    affordable = this.economy.canAfford(stats.cost);

    // --- cooldown shade ---
    if (remaining > 0) {
      button.shade.setVisible(true);
      button.shade.height = b.height * (remaining / stats.cooldown);
      button.shadeText.setText(Math.ceil(remaining));
      button.shadeText.setVisible(true);
    } else {
      button.shade.setVisible(false);
      button.shadeText.setVisible(false);
    }

    // --- can we afford it? ---
    button.box.fillColor = affordable ? b.readyColor : b.unaffordableColor;

    var usable = affordable && remaining <= 0;

    button.costText.setAlpha(usable ? 1 : b.disabledTextAlpha);
    button.nameText.setAlpha(usable ? 1 : b.disabledTextAlpha);
    button.portrait.setAlpha(usable ? 1 : b.disabledTextAlpha);
  }
};

/* =========================================================================
   WIN / LOSE
   ========================================================================= */
window.BattleScene.prototype.buildResultPanel = function () {
  var cfg = window.CONFIG;
  var centreX = cfg.screen.width / 2;
  var centreY = cfg.screen.height / 2;

  var panel = this.add.rectangle(centreX, centreY, 520, 280, 0x120c24, 0.96);
  panel.setStrokeStyle(3, 0xffd24a, 0.9);

  var title = this.add.text(centreX, centreY - 70, '', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '46px',
    color: '#ffd24a'
  }).setOrigin(0.5);

  var subtitle = this.add.text(centreX, centreY - 12, '', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '17px',
    color: '#ffffff'
  }).setOrigin(0.5);

  var self = this;

  // Three buttons get BUILT, but only some are shown - see showResultPanel().
  // NEXT CAVE only appears when there actually is one, so the game never
  // offers a door that leads nowhere.
  var next = this.makePanelButton('NEXT CAVE', function () {
    var nextKey = window.Caves.next(self.levelKey);

    // Winning recorded this cave a moment ago, so the next one is unlocked by
    // the time this button can be pressed. Checked anyway rather than assumed.
    if (nextKey && window.Progress.isUnlocked(nextKey)) {
      self.scene.start('BattleScene', { levelKey: nextKey });
    }
  });

  var retry = this.makePanelButton('RETRY', function () {
    self.scene.restart({ levelKey: self.levelKey });
  });

  var menu = this.makePanelButton('MENU', function () {
    self.scene.start('MenuScene');
  });

  this.resultPanel = {
    panel: panel,
    title: title,
    subtitle: subtitle,
    next: next,
    retry: retry,
    menu: menu
  };

  this.showResultPanel(false);
};

/* -------------------------------------------------------------------------
   One button for the result panel. It is positioned later, in
   layoutResultButtons(), because how many are on screen decides where they go.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.makePanelButton = function (label, onClick) {
  var cfg = window.CONFIG;

  var box = this.add.rectangle(0, 0, 160, 56, 0x3a2c66);
  box.setStrokeStyle(2, 0xffffff, 0.5);
  box.setInteractive({ useHandCursor: true });

  var text = this.add.text(0, 0, label, {
    fontFamily: cfg.text.fontFamily,
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  box.on('pointerdown', onClick);

  return { box: box, text: text, width: 160 };
};

/* -------------------------------------------------------------------------
   Space the visible buttons evenly across the panel, so two buttons sit where
   two buttons look right and three do too.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.layoutResultButtons = function (buttons) {
  var cfg = window.CONFIG;
  var centreX = cfg.screen.width / 2;
  var y = (cfg.screen.height / 2) + 70;
  var gap = 16;

  var total = buttons.reduce(function (sum, b) { return sum + b.width; }, 0) +
    (gap * (buttons.length - 1));

  var x = centreX - (total / 2);
  var i;

  for (i = 0; i < buttons.length; i++) {
    buttons[i].box.setPosition(x + (buttons[i].width / 2), y);
    buttons[i].text.setPosition(x + (buttons[i].width / 2), y);
    x += buttons[i].width + gap;
  }
};

window.BattleScene.prototype.showResultPanel = function (visible) {
  var r = this.resultPanel;

  // Offer the next cave only after a WIN, and only if one exists.
  var nextKey = window.Caves.next(this.levelKey);
  var offerNext = visible && this.playerWon && !!nextKey;

  var shown = offerNext ? [r.next, r.retry, r.menu] : [r.retry, r.menu];

  this.layoutResultButtons(shown);

  var always = [r.panel, r.title, r.subtitle];
  var i;

  for (i = 0; i < always.length; i++) {
    always[i].setVisible(visible);
    always[i].setDepth(2000);
  }

  [r.next, r.retry, r.menu].forEach(function (button) {
    var on = visible && (shown.indexOf(button) !== -1);
    button.box.setVisible(on);
    button.text.setVisible(on);
    button.box.setDepth(2000);
    button.text.setDepth(2000);
  });
};

/* ------------------------------------------------------------------------- */
window.BattleScene.prototype.endBattle = function (playerWon) {
  if (this.battleOver) {
    return;
  }

  this.battleOver = true;
  this.playerWon = playerWon;

  // Remember it, which is what unlocks the next cave (homework B12/B13).
  // Practice levels are not part of Palopa, so they unlock nothing.
  if (playerWon && !this.level.practice) {
    window.Progress.markBeaten(this.levelKey);
  }

  this.resultPanel.title.setText(playerWon ? 'VICTORY!' : 'DEFEAT');
  this.resultPanel.subtitle.setText(this.resultMessage(playerWon));

  this.showResultPanel(true);
};

/* TODO for Lewis, once this all feels good:
     - a second lane (an upper lane the bats can fly along)
     - a boss bat with a big health bar at the top of the screen
     - remember which levels you have beaten, using localStorage
*/
