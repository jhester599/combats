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

    // Potions and fruit for this battle (homework B27). The stock comes from
    // the level for now; it will come from the casino and your saved bag once
    // those exist. src/systems/items.js owns everything about them.
    items: window.Items.createState(this.level),

    // src/systems/items.js refuses to spend an item after the battle ends, so
    // it needs to be able to see that from the world.
    battleOver: false,

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
  this.buildFloatingTexts();
  this.buildEnergyBar();
  this.buildDeployButtons();
  this.buildItemButtons();
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

  // Drawing happens once per frame, after the brain has caught up. The frame
  // length goes with it because the floating messages fade in real time rather
  // than in simulation steps - they are decoration, not part of the game.
  this.syncView(frameSeconds);
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

  // Counts the potion down. Worth noting it is here and not inside the unit
  // loop: a potion is one thing happening to the whole battle, not something
  // each bug carries.
  window.Items.update(dt, this.world);

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
/* -------------------------------------------------------------------------
   How big to draw one bat's picture on its deploy button.

   Fit it inside CONFIG.buttons.portraitMaxWidth/Height first, so no drawing
   can ever overflow its button however wide the art is, then nudge it by how
   big that bat is in the game so the buttons still hint at which is the heavy.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.portraitScaleFor = function (stats) {
  var b = window.CONFIG.buttons;

  var fit = Math.min(
    b.portraitMaxWidth / stats.anims.frameWidth,
    b.portraitMaxHeight / stats.anims.frameHeight
  );

  // The biggest bat on THIS level's button row is the yardstick.
  var biggest = this.level.playerUnits.reduce(function (most, key) {
    return Math.max(most, window.Unit.scaleOf(window.UNITS[key]));
  }, 0);

  var story = 1 - b.portraitSizeStory +
    (b.portraitSizeStory * (window.Unit.scaleOf(stats) / biggest));

  return fit * story;
};

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
  portrait.setScale(this.portraitScaleFor(stats));
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
window.BattleScene.prototype.syncView = function (frameSeconds) {
  var units = this.unitPool.active;
  var i;

  for (i = 0; i < units.length; i++) {
    units[i].refresh();
  }

  this.playerBase.refresh();
  this.enemyBase.refresh();

  this.syncEnergyBar();
  this.syncButtons();
  this.syncItemButtons();
  this.syncGraves();
  this.syncFloatingTexts(frameSeconds || 0);
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
   ITEM BUTTONS  (homework B27)
   =========================================================================
   Potions and fruit. A button is built only for an item you are actually
   CARRYING at the start of the battle, so the ten caves - which start with
   nothing until the casino exists - show no item buttons at all.

   That is deliberate. A row of permanently empty buttons in every cave would
   advertise something the game cannot yet give, and the Graveyard practice
   level is where these are meant to be played with today.
   ========================================================================= */
window.BattleScene.prototype.buildItemButtons = function () {
  var self = this;

  this.itemButtons = [];

  window.Items.battleItems().forEach(function (key) {
    // Nothing in the bag at the start means no button all battle.
    if (window.Items.stockOf(key, self.world) <= 0) {
      return;
    }

    self.itemButtons.push(self.makeItemButton(key, self.itemButtons.length));
  });

  this.buildWeakenLabel();
};

window.BattleScene.prototype.makeItemButton = function (itemKey, index) {
  var cfg = window.CONFIG;
  var b = cfg.itemButtons;
  var def = window.ITEMS[itemKey];

  var x = b.startX + (index * (b.width + b.gap));
  var y = b.y;

  var box = this.add.rectangle(x, y, b.width, b.height, b.readyColor).setOrigin(0, 0);
  box.setStrokeStyle(2, cfg.buttons.borderColor, cfg.buttons.borderAlpha);
  box.setInteractive({ useHandCursor: true });

  var icon = this.makeItemIcon(itemKey, x + (b.width / 2), y + 26);

  var nameText = this.add.text(x + (b.width / 2), y + 44, def.name, {
    fontFamily: cfg.text.fontFamily,
    fontSize: '13px',
    color: cfg.text.color
  }).setOrigin(0.5, 0);

  var countText = this.add.text(x + (b.width / 2), y + 58, '', {
    fontFamily: cfg.text.fontFamily,
    fontSize: b.countFontSize,
    color: '#ffd24a'
  }).setOrigin(0.5, 0);

  var self = this;

  box.on('pointerdown', function () {
    self.useItem(itemKey);
  });

  return {
    itemKey: itemKey,
    box: box,
    icon: icon,
    nameText: nameText,
    countText: countText
  };
};

/* -------------------------------------------------------------------------
   A little drawing for each item, made of plain shapes - the same
   "the game paints its own art" approach as the placeholder bats and the
   grave markers. Returns every piece, so they can be faded together.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.makeItemIcon = function (itemKey, centreX, centreY) {
  var size = window.CONFIG.itemButtons.iconSize;
  var color = window.ITEMS[itemKey].color;
  var parts = [];

  if (itemKey === 'potion') {
    // A bottle: a round-ish body with a narrow neck and a cork.
    parts.push(this.add.rectangle(centreX, centreY + 3, size * 0.8, size * 0.66, color));
    parts.push(this.add.rectangle(centreX, centreY - 8, size * 0.32, size * 0.34, color));
    parts.push(this.add.rectangle(centreX, centreY - 13, size * 0.44, size * 0.16, 0xd9c48a));

  } else if (itemKey === 'fruit') {
    // A berry with a stalk and a leaf.
    parts.push(this.add.circle(centreX, centreY + 3, size * 0.4, color));
    parts.push(this.add.rectangle(centreX, centreY - 10, size * 0.12, size * 0.3, 0x6b4a2a));
    parts.push(this.add.rectangle(centreX + 6, centreY - 11, size * 0.34, size * 0.14, 0x62c46a));

  } else {
    parts.push(this.add.circle(centreX, centreY, size * 0.4, color));
  }

  return parts;
};

/* -------------------------------------------------------------------------
   The player tapped an item. src/systems/items.js decides whether it is
   allowed and what it does; this only reports it on screen.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.useItem = function (itemKey) {
  var outcome = window.Items.use(itemKey, this.world);

  if (!outcome) {
    return false;     // none left, nothing to heal, or the battle is over
  }

  var f = window.CONFIG.floatingText;

  // Over your own tower, because that is what both items are about: one heals
  // it, the other takes the pressure off it.
  this.floatText(this.playerBase.x, outcome.shout, f.itemColor);

  return true;
};

window.BattleScene.prototype.syncItemButtons = function () {
  if (!this.itemButtons) {
    return;
  }

  var b = window.CONFIG.itemButtons;
  var self = this;

  this.itemButtons.forEach(function (button) {
    var count = window.Items.stockOf(button.itemKey, self.world);
    var usable = window.Items.canUse(button.itemKey, self.world);

    button.countText.setText('x' + count);
    button.box.fillColor = usable ? b.readyColor : b.emptyColor;

    var alpha = usable ? 1 : window.CONFIG.buttons.disabledTextAlpha;

    button.nameText.setAlpha(alpha);
    button.countText.setAlpha(alpha);
    button.icon.forEach(function (part) { part.setAlpha(alpha); });
  });

  this.syncWeakenLabel();
};

/* -------------------------------------------------------------------------
   While a potion is running, say so and count it down. Without this the only
   sign would be the bugs quietly doing less damage, which is invisible.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.buildWeakenLabel = function () {
  var cfg = window.CONFIG;
  var bar = cfg.energyBar;

  this.weakenLabel = this.add.text(bar.x, bar.y + bar.height + 10, '', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '15px',
    color: cfg.floatingText.itemColor
  }).setOrigin(0, 0);
};

window.BattleScene.prototype.syncWeakenLabel = function () {
  if (!this.weakenLabel) {
    return;
  }

  if (!window.Items.isWeakened(this.world)) {
    this.weakenLabel.setText('');
    return;
  }

  var left = Math.ceil(window.Items.weakenRemaining(this.world));
  var percent = Math.round((1 - window.ITEMS.potion.damageFactor) * 100);

  this.weakenLabel.setText('Bugs hitting ' + percent + '% softer - ' + left + 's');
};

/* =========================================================================
   FLOATING MESSAGES - so a coin flip does not look like a glitch
   =========================================================================
   The Desert Scorpion (homework B26) can kill a bat outright on any hit, and
   can die doing it. Without a word on the screen, a Brute Bat you just paid 90
   energy for would simply disappear at full health, which reads as the game
   being broken rather than as the gamble Lewis designed.

   POOLED like the grave markers: a fixed set, shown and hidden, never piling
   up. They fade in REAL time rather than simulation steps, because they are
   decoration - nothing about the fight depends on them.
   ========================================================================= */
window.BattleScene.prototype.buildFloatingTexts = function () {
  var cfg = window.CONFIG;
  var f = cfg.floatingText;
  var i;

  this.floaters = [];

  for (i = 0; i < f.maxDrawn; i++) {
    var text = this.add.text(0, 0, '', {
      fontFamily: cfg.text.fontFamily,
      fontSize: f.fontSize,
      color: '#ffffff'
    }).setOrigin(0.5, 1);

    text.setVisible(false);
    text.setDepth(1500);      // above the bats, below the result panel (2000)

    this.floaters.push({ text: text, life: 0, x: 0, row: 0 });
  }
};

/* Show a message above the lane at this x. Silently does nothing if every
   floater is already busy - a dropped message is better than a stutter. */
window.BattleScene.prototype.floatText = function (x, message, color) {
  var f = window.CONFIG.floatingText;
  var i;

  // How many messages are already up near this spot? Each one lifts the next
  // a line higher, so two things happening at once stay readable instead of
  // printing over each other.
  var row = 0;

  for (i = 0; i < this.floaters.length; i++) {
    if (this.floaters[i].life > 0 &&
        Math.abs(this.floaters[i].x - x) < f.stackWithin) {
      row++;
    }
  }

  for (i = 0; i < this.floaters.length; i++) {
    if (this.floaters[i].life <= 0) {
      this.floaters[i].life = f.seconds;
      this.floaters[i].x = x;
      this.floaters[i].row = row;
      this.floaters[i].text.setText(message);
      this.floaters[i].text.setColor(color);
      this.floaters[i].text.setVisible(true);
      return;
    }
  }
};

window.BattleScene.prototype.syncFloatingTexts = function (frameSeconds) {
  if (!this.floaters) {
    return;
  }

  var cfg = window.CONFIG;
  var f = cfg.floatingText;
  var i;

  for (i = 0; i < this.floaters.length; i++) {
    var floater = this.floaters[i];

    if (floater.life <= 0) {
      continue;
    }

    floater.life -= frameSeconds;

    if (floater.life <= 0) {
      floater.text.setVisible(false);
      continue;
    }

    // 0 when it has just appeared, 1 when it is about to go.
    var gone = 1 - (floater.life / f.seconds);

    floater.text.setPosition(
      floater.x,
      cfg.lane.y + f.yOffset - (f.rise * gone) - (floater.row * f.stackGap)
    );
    floater.text.setAlpha(1 - (gone * gone));   // hangs, then fades quickly
  }
};

/* -------------------------------------------------------------------------
   A sting happened. Called from src/entities/unit.js whenever a gambling bug's
   attack came up heads or tails.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.reportSting = function (unit, target, hit) {
  var f = window.CONFIG.floatingText;

  if (hit.instantKill) {
    // Named, so it is obvious WHICH of your bats you just lost.
    this.floatText(target.x, target.stats.name + ' STUNG!', f.stungColor);
  }

  if (hit.backfire) {
    this.floatText(unit.x, 'it stung itself!', f.burstColor);
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
  this.world.battleOver = true;    // no spending items on a finished battle

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
