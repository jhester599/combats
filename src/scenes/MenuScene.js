/* =========================================================================
   MENU SCENE - title screen
   =========================================================================
   Shows the title, a Start button, and a credits panel (which is where our
   art licences get shown - some licences require that we credit the artist
   inside the game, not just in a file).
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

  this.add.text(centreX, 120, 'BATTLE BATS', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '64px',
    color: '#ffd24a'
  }).setOrigin(0.5);

  var level = window.LEVELS[window.STARTING_LEVEL];

  this.add.text(centreX, 182, 'Level 1 - ' + level.name, {
    fontFamily: cfg.text.fontFamily,
    fontSize: '20px',
    color: '#b9a9e8'
  }).setOrigin(0.5);

  this.makeButton(centreX, 280, 260, 64, 'START BATTLE', function () {
    this.scene.start('BattleScene', { levelKey: window.STARTING_LEVEL });
  }.bind(this));

  this.makeButton(centreX, 362, 180, 46, 'Credits', function () {
    this.toggleCredits();
  }.bind(this));

  this.add.text(centreX, 470,
    'Tap or click a bat button to send it out. Destroy the red base!', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '15px',
      color: '#8f82b8'
    }).setOrigin(0.5);

  this.buildCredits();
};

/* A few decorative bats drifting behind the title. */
window.MenuScene.prototype.drawBackdrop = function () {
  var cfg = window.CONFIG;

  this.add.rectangle(
    cfg.screen.width / 2, cfg.screen.height / 2,
    cfg.screen.width, cfg.screen.height,
    0x241a47
  );

  var keys = ['scoutBat', 'bruteBat', 'critter'];
  var i;
  var bat;

  for (i = 0; i < 9; i++) {
    bat = this.add.sprite(
      60 + (i * 105),
      380 + (Math.sin(i) * 40),
      window.UNITS[keys[i % keys.length]].sprite
    );

    bat.setAlpha(0.22);
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

  var text = this.add.text(x, y, label, {
    fontFamily: cfg.text.fontFamily,
    fontSize: (h > 50) ? '24px' : '18px',
    color: cfg.text.color
  }).setOrigin(0.5);

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

  var panel = this.add.rectangle(centreX, centreY, 620, 400, 0x120c24, 0.96);
  panel.setStrokeStyle(2, 0xffd24a, 0.8);

  var text = this.add.text(centreX, centreY, lines.join('\n'), {
    fontFamily: cfg.text.fontFamily,
    fontSize: '16px',
    color: cfg.text.color,
    align: 'center'
  }).setOrigin(0.5);

  this.creditsGroup = [panel, text];

  panel.setInteractive();
  panel.on('pointerdown', function () {
    this.toggleCredits();
  }.bind(this));

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
  this.setCreditsVisible(!this.creditsVisible);
};
