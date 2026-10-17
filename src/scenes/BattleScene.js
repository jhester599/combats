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

  // The bats you brought, picked in the Locker (src/systems/team.js). Arriving
  // without a valid team - straight from a link, say - gets the team the
  // Locker would have opened with.
  this.team = (data && window.Team.isValid(data.team, this.levelKey))
    ? data.team.slice()
    : window.Team.defaultFor(this.levelKey, window.Progress.lastTeam());

  // Leftover time waiting to be turned into simulation steps.
  this.accumulator = 0;

  this.battleOver = false;
  this.playerWon = false;
  this.earnedBat = null;      // the bat this win just earned, if any
};

/* -------------------------------------------------------------------------
   Load this cave's painting, and ONLY this cave's.

   The ten backgrounds come to about 1.2MB between them, which is a lot to make
   somebody download on a phone to play one cave. Loading here instead of in
   BootScene means a battle fetches the one picture it needs (~50-170KB) and the
   browser caches it, so the second visit is instant.

   Phaser skips a key it has already loaded, so replaying a cave costs nothing.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.preload = function () {
  var bg = window.BACKGROUNDS ? window.BACKGROUNDS[this.levelKey] : null;

  if (!bg || this.textures.exists(this.backgroundKey())) {
    return;
  }

  this.load.image(this.backgroundKey(), 'assets/bg/' + bg.file);
};

/* The texture name for a cave's painting. */
window.BattleScene.prototype.backgroundKey = function () {
  return 'bg_' + this.levelKey;
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
    },

    // Something worth shouting about happened (a sting, a bomb, a big bite).
    // src/systems/brain.js and the power files call this; the balance sim
    // has its own version that counts instead of shouting.
    report: function (kind, details) {
      self.reportEvent(kind, details);
    }
  };

  // --- cooldown timers, one per deployable unit ---
  this.cooldowns = {};

  var i;

  for (i = 0; i < this.team.length; i++) {
    this.cooldowns[this.team[i]] = 0;
  }

  this.buildGraveMarkers();
  this.buildFloatingTexts();
  this.buildEnergyBar();
  this.buildDeployButtons();
  this.buildItemButtons();
  this.buildResultPanel();

  this.makeReadable(
    this.add.text(window.CONFIG.screen.width / 2, 22, this.level.name, {
      fontFamily: window.CONFIG.text.fontFamily,
      fontSize: '18px',
      color: '#d8cbff'
    }).setOrigin(0.5, 0)
  );
};

/* -------------------------------------------------------------------------
   Make a piece of text readable wherever it lands.

   Before the cave paintings arrived, every number on screen sat on the same
   flat purple, so plain white was fine. Now the same white text can land on a
   bright sky or a bank of cloud and simply vanish - in Dream Land the fortress
   health readouts became white-on-white and could not be read at all.

   A dark outline fixes every case at once. It costs nothing on the dark caves.
   The bases call this through their scene, so buildings and HUD match.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.makeReadable = function (textObject) {
  var t = window.CONFIG.text;

  textObject.setStroke(t.outlineColor, t.outlineThickness);
  textObject.setShadow(0, 2, t.shadowColor, t.shadowBlur, false, true);

  return textObject;
};

/* -------------------------------------------------------------------------
   THE CAVE ITSELF.

   If this cave has a painting (data/backgrounds.js) it is drawn here, slid up
   or down so the picture's own ground line lands exactly on CONFIG.lane.y -
   which is the line the bats walk along. That is the whole trick: every
   painting puts its ground in a different place, and one number per picture
   reconciles them.

   A cave with no painting falls back to the flat purple the game shipped with,
   so a missing file is a plain-looking cave rather than a broken one.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.drawBackground = function () {
  var bg = window.BACKGROUNDS ? window.BACKGROUNDS[this.levelKey] : null;

  if (bg && this.textures.exists(this.backgroundKey())) {
    this.drawPaintedBackground(bg);
    return;
  }

  this.drawFlatBackground();
};

/* The original look: flat colours. Still used by any cave without a painting. */
window.BattleScene.prototype.drawFlatBackground = function () {
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

/* ------------------------------------------------------------------------- */
window.BattleScene.prototype.drawPaintedBackground = function (bg) {
  var cfg = window.CONFIG;
  var key = this.backgroundKey();

  // The game is PIXEL ART, so Phaser is told globally not to smooth anything -
  // which is right for a 64px bat and quite wrong for a painting, where it
  // makes every edge crunchy. Paintings are switched back to smooth scaling.
  var texture = this.textures.get(key);

  if (texture && texture.setFilter && Phaser.Textures.FilterMode) {
    texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
  }

  var source = this.textures.get(key).getSourceImage();
  var drawWidth = cfg.screen.width;
  var drawHeight = source.height * (drawWidth / source.width);

  // Slide the picture so ITS ground sits on OUR lane.
  var top = cfg.lane.y - (drawHeight * bg.ground);

  // The paintings are wider than the screen's shape, so scaled to fill the
  // width they leave a strip bare at the top or the bottom. Fill those with the
  // picture's own edge colours rather than cropping somebody's artwork.
  //
  // THE DEPTHS MATTER, and getting them wrong is invisible until you look: a
  // Phaser object added without a depth sits at 0, so the first version of this
  // put the painting at -1000 and then drew these two fills straight over the
  // top of it. The cave rendered as a flat navy rectangle and nothing errored.
  // Everything here is stacked explicitly, well below the units at ~340-365.
  var floor = this.add.rectangle(
    cfg.screen.width / 2, cfg.screen.height / 2,
    cfg.screen.width, cfg.screen.height,
    bg.floorColor
  );
  floor.setDepth(-1002);

  if (top > 0) {
    var sky = this.add.rectangle(
      cfg.screen.width / 2, top / 2, cfg.screen.width, top, bg.skyColor
    );
    sky.setDepth(-1001);
  }

  var image = this.add.image(0, top, key).setOrigin(0, 0);
  image.setDisplaySize(drawWidth, drawHeight);
  image.setDepth(-1000);
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

  // An Engineer Bat speeds your income up (src/systems/engineer.js) - the
  // same line the balance sim runs.
  this.economy.energyPerSecond =
    this.level.energyPerSecond * window.Engineer.incomeFactor(this.world);
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

  // Usually one bat. The Bat Bros button sends two - see src/systems/squad.js.
  var self = this;

  window.Squad.deploy(unitKey, this.playerBase.spawnX, function (memberKey, x) {
    self.spawnUnit(memberKey, x);
  });

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
  this.energyText = this.makeReadable(this.add.text(
    bar.x + bar.width + bar.labelGap, bar.y + (bar.height / 2), '', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '16px',
      color: '#ffd24a'
    }).setOrigin(0, 0.5));
};

/* -------------------------------------------------------------------------
   One button per bat in the team you brought (picked in the Locker).
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.buildDeployButtons = function () {
  var cfg = window.CONFIG;

  this.buttons = [];

  var i;

  for (i = 0; i < this.team.length; i++) {
    this.buttons.push(this.makeDeployButton(this.team[i], i));
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

  // The biggest bat on THIS button row is the yardstick.
  var biggest = this.team.reduce(function (most, key) {
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
  //
  // A squad button using its member's picture draws one bat per member,
  // overlapped and a bit smaller, so the button itself says "you get more than
  // one". The brother behind is drawn first so the front one sits on top of
  // him. A squad with its own picture is drawn once (Squad.portraitCount).
  var members = window.Squad.portraitCount(unitKey);
  var portraits = [];
  var spread = b.squadPortraitSpread;
  var shrink = (members > 1) ? b.squadPortraitShrink : 1;
  var m;

  // A pair sits 2px left of a lone bat's spot, so the front brother stays
  // clear of the name and cost.
  var centre = x + ((members > 1) ? 32 : 34);

  for (m = members - 1; m >= 0; m--) {
    var offset = (members > 1) ? (m - ((members - 1) / 2)) * spread : 0;
    var picture = this.add.sprite(
      centre - offset, y + (b.height / 2) + 12 - (m * 3), stats.sprite
    );
    picture.setOrigin(0.5, 1);
    picture.setScale(this.portraitScaleFor(stats) * shrink);
    picture.play(unitKey + '_idle');
    portraits.push(picture);
  }

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

  // NEW! on the bat you just earned, in the first cave you can use it.
  if (window.Caves.newBatIn(this.levelKey) === unitKey) {
    this.add.text(x + b.width - 6, y + 5, 'NEW!', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '12px',
      color: '#ffd24a'
    }).setOrigin(1, 0);
  }

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
    portraits: portraits,
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
    button.portraits.forEach(function (picture) {
      picture.setAlpha(usable ? 1 : b.disabledTextAlpha);
    });
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

  this.weakenLabel = this.makeReadable(
    this.add.text(bar.x, bar.y + bar.height + 10, '', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '15px',
      color: cfg.floatingText.itemColor
    }).setOrigin(0, 0)
  );
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
    var text = this.makeReadable(this.add.text(0, 0, '', {
      fontFamily: cfg.text.fontFamily,
      fontSize: f.fontSize,
      color: '#ffffff'
    }).setOrigin(0.5, 1));

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
   Something happened that is baffling without words: a random sting, a bomb
   from the sky, a bat eating everyone round it. Everything reaches here
   through world.report(), from src/systems/.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.reportEvent = function (kind, d) {
  var f = window.CONFIG.floatingText;

  if (kind === 'sting') {
    if (d.hit.instantKill) {
      // Named, so it is obvious WHICH of your bats you just lost.
      this.floatText(d.target.x, d.target.stats.name + ' STUNG!', f.stungColor);
    }

    if (d.hit.backfire) {
      this.floatText(d.unit.x, 'it stung itself!', f.burstColor);
    }
  } else if (kind === 'bomb') {
    this.dropBomb(d.unit, d.damage);
  } else if (kind === 'landed') {
    this.floatText(d.x, 'back as a Scout!', f.friendColor);
  } else if (kind === 'freeze') {
    this.floatText(d.unit.x, 'FROZEN', f.frostColor);
  } else if (kind === 'rabiesWindup') {
    this.floatText(d.unit.x, 'GRRRR...', f.stungColor);
  } else if (kind === 'rabies') {
    this.floatText(d.unit.x,
      'CHOMP! ' + d.eaten.enemy + ' bugs, ' + d.eaten.player + ' bats', f.stungColor);
  }
};

/* -------------------------------------------------------------------------
   THE BOMB BAT LETS GO. A picture of its bomb falls from where it was holding
   it onto their tower, and says BOOM when it lands.

   DECORATION ONLY. The damage was done the moment the bomb was let go
   (src/systems/bomb.js), exactly as before the picture existed, so the fight
   and the balance sim are untouched. Their health bar drops about half a
   second before the bomb gets there (DECISIONS.md D71).
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.dropBomb = function (bat, damage) {
  var cfg = window.CONFIG;
  var f = cfg.floatingText;
  var pic = bat.stats.bombPicture;
  var base = this.enemyBase;
  var self = this;

  if (!pic || !this.textures.exists(pic.sprite)) {
    this.floatText(base.faceX, 'BOOM! -' + damage, f.burstColor);
    return;
  }

  // Start exactly where the bomb in its hands was drawn, at the bat's size.
  var scale = window.Unit.scaleOf(bat.stats);
  var bomb = this.add.image(bat.view.x + (pic.x * scale), bat.view.y + (pic.y * scale),
    pic.sprite);
  bomb.setOrigin(pic.originX, pic.originY);
  bomb.setScale(scale);
  bomb.setDepth(1400);      // over the bats, under the floating words (1500)

  // Land a little way into the tower, about a third of the way up it.
  var landX = base.faceX + 24;
  var landY = cfg.lane.y - ((cfg.lane.y - base.topY) * 0.35);

  this.tweens.add({ targets: bomb, x: landX, duration: cfg.units.bombFallSeconds * 1000 });
  this.tweens.add({
    targets: bomb,
    y: landY,
    angle: 40,
    ease: 'Quad.easeIn',    // falls faster and faster
    duration: cfg.units.bombFallSeconds * 1000,
    onComplete: function () {
      bomb.destroy();
      self.cameras.main.shake(180, 0.006);
      self.floatText(base.faceX, 'BOOM! -' + damage, f.burstColor);
    }
  });
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

  // "NEW BAT EARNED: Bat Bros!" - only ever filled in on the first win of a
  // cave that hands out a bat. A picture of the bat sits to its left.
  var earnedText = this.add.text(centreX + 22, centreY + 24, '', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '19px',
    color: '#ffd24a'
  }).setOrigin(0.5);

  var earnedPicture = this.add.sprite(centreX, centreY + 36, '__DEFAULT');
  earnedPicture.setOrigin(0.5, 1);

  var self = this;

  // Three buttons get BUILT, but only some are shown - see showResultPanel().
  // NEXT CAVE only appears when there actually is one, so the game never
  // offers a door that leads nowhere.
  var next = this.makePanelButton('NEXT CAVE', function () {
    var nextKey = window.Caves.next(self.levelKey);

    // Winning recorded this cave a moment ago, so the next one is unlocked by
    // the time this button can be pressed. Checked anyway rather than assumed.
    // Via the Locker, where you can fit your new bat into the team.
    if (nextKey && window.Progress.isUnlocked(nextKey)) {
      window.Team.startCave(self, nextKey);
    }
  });

  // Same cave, same team - straight back in.
  var retry = this.makePanelButton('RETRY', function () {
    self.scene.restart({ levelKey: self.levelKey, team: self.team });
  });

  var menu = this.makePanelButton('MENU', function () {
    self.scene.start('MenuScene');
  });

  this.resultPanel = {
    panel: panel,
    title: title,
    subtitle: subtitle,
    earnedText: earnedText,
    earnedPicture: earnedPicture,
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

  // The earned-bat line only shows when showEarnedBat() has filled it in.
  var earned = visible && !!this.earnedBat;
  r.earnedText.setVisible(earned).setDepth(2000);
  r.earnedPicture.setVisible(earned).setDepth(2000);

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
  //
  // Asked BEFORE marking it beaten: a bat is only announced as new the first
  // time you win the cave that gives it. Win it again and it is old news.
  var firstWin = playerWon && !this.level.practice &&
    !window.Progress.hasBeaten(this.levelKey);

  if (playerWon && !this.level.practice) {
    window.Progress.markBeaten(this.levelKey);
  }

  this.earnedBat = firstWin ? window.Caves.earnedBy(this.levelKey) : null;

  this.resultPanel.title.setText(playerWon ? 'VICTORY!' : 'DEFEAT');
  this.resultPanel.subtitle.setText(this.resultMessage(playerWon));
  this.showEarnedBat(this.earnedBat);

  this.showResultPanel(true);
};

/* -------------------------------------------------------------------------
   Beat a cave, earn a bat. Puts "NEW BAT EARNED: Archer Bat!" on the victory
   panel with a picture of the bat beside it. Which bat each cave gives is the
   unlocks: line in data/levels.js.
   ------------------------------------------------------------------------- */
window.BattleScene.prototype.showEarnedBat = function (unitKey) {
  var r = this.resultPanel;

  if (!unitKey) {
    return;
  }

  var stats = window.UNITS[unitKey];
  r.earnedText.setText('NEW BAT EARNED: ' + stats.name + '!');

  // Stand the picture just left of the words, sized like a deploy button's.
  r.earnedPicture.setTexture(stats.sprite);
  r.earnedPicture.play(unitKey + '_idle');
  r.earnedPicture.setScale(Math.min(
    window.CONFIG.buttons.portraitMaxWidth / stats.anims.frameWidth,
    window.CONFIG.buttons.portraitMaxHeight / stats.anims.frameHeight
  ));
  r.earnedPicture.x = r.earnedText.x - (r.earnedText.width / 2) - 32;
};

/* TODO for Lewis, once this all feels good:
     - a second lane (an upper lane the bats can fly along)
     - a boss bat with a big health bar at the top of the screen
     - remember which levels you have beaten, using localStorage
*/
