/* =========================================================================
   MENU SCENE - title screen and cave picker
   =========================================================================
   Shows the title, a button for every cave in data/levels.js, any practice
   levels underneath, and a credits panel (which is where our art licences get
   shown - some licences require that we credit the artist inside the game, not
   just in a file).

   It used to be a single Start button wired to src/main.js's STARTING_LEVEL,
   which meant only one level was ever reachable and the game had no way out of
   it. The list comes from src/systems/caves.js, so adding a level block to
   data/levels.js is still the only step needed to add a level.
   ========================================================================= */

window.MenuScene = function () {
  Phaser.Scene.call(this, { key: 'MenuScene' });
};

window.MenuScene.prototype = Object.create(Phaser.Scene.prototype);
window.MenuScene.prototype.constructor = window.MenuScene;

/* ------------------------------------------------------------------------- */
window.MenuScene.prototype.create = function () {
  var cfg = window.CONFIG;
  var centreX = cfg.screen.width / 2;

  this.drawBackdrop();

  // "ComBats" - the capital B is the whole joke, so this one is NOT all-caps.
  this.add.text(centreX, 120, 'ComBats', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '64px',
    color: '#ffd24a'
  }).setOrigin(0.5);

  // The world's name, from Lewis's homework answer B2.
  this.add.text(centreX, 176, 'PALOPA', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '20px',
    color: '#b9a9e8'
  }).setOrigin(0.5);

  this.buildCavePicker();
  this.buildPracticeRow();

  this.makeButton(centreX, 470, 150, 38, 'Credits', function () {
    this.toggleCredits();
  }.bind(this));

  this.buildCredits();
};

/* -------------------------------------------------------------------------
   One button per cave, laid out in rows so ten of them still fit.
   ------------------------------------------------------------------------- */
window.MenuScene.prototype.buildCavePicker = function () {
  var cfg = window.CONFIG;
  var m = cfg.menu;
  var caves = window.Caves.all();
  var self = this;

  var beaten = window.Progress.beatenCount();

  this.add.text(cfg.screen.width / 2, m.caveRowY - 48,
    'Choose a cave  -  ' + beaten + ' of ' + caves.length + ' beaten', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '16px',
      color: '#8f82b8'
    }).setOrigin(0.5);

  caves.forEach(function (key, index) {
    var row = Math.floor(index / m.cavesPerRow);
    var column = index % m.cavesPerRow;

    // How many buttons are on THIS row, so a short last row stays centred.
    var onThisRow = Math.min(m.cavesPerRow, caves.length - (row * m.cavesPerRow));
    var rowWidth = (onThisRow * m.caveWidth) + ((onThisRow - 1) * m.caveGap);
    var startX = (cfg.screen.width - rowWidth) / 2;

    var x = startX + (column * (m.caveWidth + m.caveGap)) + (m.caveWidth / 2);
    var y = m.caveRowY + (row * (m.caveHeight + m.caveGap));

    // Locked caves are drawn, but dark and unclickable. B12: you unlock a cave
    // by beating the one before it.
    if (!window.Progress.isUnlocked(key)) {
      self.makeLockedButton(x, y, m.caveWidth, m.caveHeight, window.Caves.label(key));
      return;
    }

    var label = window.Caves.label(key);

    // A tick on the ones already done, so the map shows where you are.
    if (window.Progress.hasBeaten(key)) {
      label = label + '  \u2713';
    }

    self.makeButton(x, y, m.caveWidth, m.caveHeight, label, function () {
      self.scene.start('BattleScene', { levelKey: key });
    });
  });
};

/* -------------------------------------------------------------------------
   A cave you cannot play yet. Deliberately still VISIBLE: seeing that Crystal
   Falls is next, and that there are ten of these, is most of what a map is for.
   It just does not respond to a tap.
   ------------------------------------------------------------------------- */
window.MenuScene.prototype.makeLockedButton = function (x, y, w, h, label) {
  var cfg = window.CONFIG;
  var m = cfg.menu;

  var box = this.add.rectangle(x, y, w, h, m.lockedColor);
  box.setStrokeStyle(2, cfg.buttons.borderColor, m.lockedBorderAlpha);

  var text = this.add.text(x, y, '\U0001f512 ' + label, {
    fontFamily: cfg.text.fontFamily,
    fontSize: '15px',
    color: cfg.text.color,
    align: 'center',
    wordWrap: { width: w - 16 }
  }).setOrigin(0.5).setAlpha(m.lockedTextAlpha);

  if (text.width > w - 12) {
    text.setScale((w - 12) / text.width);
  }

  return { box: box, text: text };
};

/* -------------------------------------------------------------------------
   Practice levels, kept visually apart from the caves so they do not look
   like part of the story. Nothing is drawn at all if there are none.
   ------------------------------------------------------------------------- */
window.MenuScene.prototype.buildPracticeRow = function () {
  var cfg = window.CONFIG;
  var m = cfg.menu;
  var levels = window.Caves.practice();
  var self = this;

  if (!levels.length) {
    return;
  }

  this.add.text(cfg.screen.width / 2, m.practiceY - 34,
    'Just for practice - not part of Palopa', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '14px',
      color: '#6f6496'
    }).setOrigin(0.5);

  var totalWidth = (levels.length * m.practiceWidth) + ((levels.length - 1) * m.caveGap);
  var startX = (cfg.screen.width - totalWidth) / 2;

  levels.forEach(function (key, index) {
    var x = startX + (index * (m.practiceWidth + m.caveGap)) + (m.practiceWidth / 2);

    self.makeButton(x, m.practiceY, m.practiceWidth, m.practiceHeight,
      window.LEVELS[key].name, function () {
        self.scene.start('BattleScene', { levelKey: key });
      });
  });
};

/* A few decorative bats drifting behind the title. */
window.MenuScene.prototype.drawBackdrop = function () {
  var cfg = window.CONFIG;

  this.add.rectangle(
    cfg.screen.width / 2, cfg.screen.height / 2,
    cfg.screen.width, cfg.screen.height,
    0x241a47
  );

  var keys = ['scoutBat', 'bruteBat', 'mosquito'];
  var i;
  var bat;

  for (i = 0; i < 9; i++) {
    bat = this.add.sprite(
      60 + (i * 105),
      380 + (Math.sin(i) * 40),
      window.UNITS[keys[i % keys.length]].sprite
    );

    bat.setAlpha(0.22);
    bat.setScale(window.Unit.scaleOf(window.UNITS[keys[i % keys.length]]));
    bat.play(keys[i % keys.length] + '_walk');

    // Gentle bobbing, using Phaser's built-in tween engine.
    this.tweens.add({
      targets: bat,
      y: bat.y - 22,
      duration: 1400 + (i * 120),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
};

/* -------------------------------------------------------------------------
   A reusable button that works with BOTH mouse and touch.
   Phaser's pointer events cover both, so there is nothing extra to do.
   ------------------------------------------------------------------------- */
window.MenuScene.prototype.makeButton = function (x, y, w, h, label, onClick) {
  var cfg = window.CONFIG;

  var box = this.add.rectangle(x, y, w, h, cfg.buttons.readyColor);
  box.setStrokeStyle(2, cfg.buttons.borderColor, cfg.buttons.borderAlpha);
  box.setInteractive({ useHandCursor: true });

  // Long cave names have to fit inside the button, so the text shrinks with it
  // rather than spilling over the edges.
  var fontSize = (h > 50) ? 18 : 15;

  var text = this.add.text(x, y, label, {
    fontFamily: cfg.text.fontFamily,
    fontSize: fontSize + 'px',
    color: cfg.text.color,
    align: 'center',
    wordWrap: { width: w - 16 }
  }).setOrigin(0.5);

  // If it still overflows (a very long name), scale the whole label down.
  if (text.width > w - 12) {
    text.setScale((w - 12) / text.width);
  }

  box.on('pointerdown', function () {
    box.fillColor = cfg.buttons.pressedColor;
  });

  box.on('pointerup', function () {
    box.fillColor = cfg.buttons.readyColor;
    onClick();
  });

  box.on('pointerout', function () {
    box.fillColor = cfg.buttons.readyColor;
  });

  return { box: box, text: text };
};

/* -------------------------------------------------------------------------
   Credits panel. Keep this in step with ASSETS.md.
   ------------------------------------------------------------------------- */
window.MenuScene.prototype.buildCredits = function () {
  var cfg = window.CONFIG;
  var centreX = cfg.screen.width / 2;
  var centreY = cfg.screen.height / 2;

  var lines = [
    'CREDITS',
    '',
    'Game by Jeff and Lewis',
    '',
    'Engine: Phaser 4.2.1 - MIT licence',
    'phaser.io',
    '',
    'Art: placeholder shapes drawn by the game itself.',
    'Real art credits will be listed here and in ASSETS.md.',
    '',
    'Tap anywhere to close'
  ];

  // Somewhere out of the way to wipe your progress, so a cave can be replayed
  // from the beginning - and so the locking can be tested without clearing the
  // whole browser. Deliberately NOT on the title screen itself, where it would
  // be one mis-tap away from undoing everything.
  var resetLabel = this.add.text(centreX, centreY + 165,
    'Reset progress (tap twice)', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '14px',
      color: '#e0808f'
    }).setOrigin(0.5);

  resetLabel.setInteractive({ useHandCursor: true });
  resetLabel.armed = false;

  resetLabel.on('pointerdown', function () {
    if (!resetLabel.armed) {
      resetLabel.armed = true;
      resetLabel.setText('Really? Tap again to wipe it');
      return;
    }

    window.Progress.reset();
    resetLabel.setText('Progress wiped - back to cave 1');
    resetLabel.armed = false;
  });

  var panel = this.add.rectangle(centreX, centreY, 620, 400, 0x120c24, 0.96);
  panel.setStrokeStyle(2, 0xffd24a, 0.8);

  var text = this.add.text(centreX, centreY, lines.join('\n'), {
    fontFamily: cfg.text.fontFamily,
    fontSize: '16px',
    color: cfg.text.color,
    align: 'center'
  }).setOrigin(0.5);

  this.creditsGroup = [panel, text, resetLabel];

  panel.setInteractive();
  panel.on('pointerdown', function () {
    this.toggleCredits();
  }.bind(this));

  // The reset label has to sit ABOVE the panel or the panel's close-on-tap
  // swallows it, and closing the credits must re-draw the menu so a wipe shows
  // up straight away.
  resetLabel.setDepth(1001);

  this.setCreditsVisible(false);
};

window.MenuScene.prototype.setCreditsVisible = function (visible) {
  var i;

  for (i = 0; i < this.creditsGroup.length; i++) {
    this.creditsGroup[i].setVisible(visible);
    this.creditsGroup[i].setDepth(1000);
  }

  this.creditsVisible = visible;
};

window.MenuScene.prototype.toggleCredits = function () {
  var closing = this.creditsVisible;

  this.setCreditsVisible(!this.creditsVisible);

  // Rebuild the menu on close, so a progress wipe is visible immediately
  // instead of next time the game starts.
  if (closing) {
    this.scene.restart();
  }
};
