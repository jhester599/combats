/* =========================================================================
   LOCKER SCENE - pick your team before a cave (Jeff, 2026-10-12)
   =========================================================================
   "pick a team of 3, you will choose from a 'locker' between levels on what
    you want the team to be for the next level"

   Across the top: your team, CONFIG.team.size places. Underneath: every bat
   you have earned so far. Tap a bat to put it in your team; tap it again (or
   tap its place in the team) to take it out. FIGHT! goes into the cave.

   The rules - which bats you may take, and the team the Locker opens with -
   are src/systems/team.js. This file only draws them and takes the taps.
   The team you pick is remembered (src/systems/progress.js), so next time
   the Locker opens with it.

   It is only shown when there is a choice to make. Caves 1 and 2 give you
   three bats or fewer, so they go straight into battle (Team.startCave).
   ========================================================================= */

window.LockerScene = function () {
  Phaser.Scene.call(this, { key: 'LockerScene' });
};

window.LockerScene.prototype = Object.create(Phaser.Scene.prototype);
window.LockerScene.prototype.constructor = window.LockerScene;

window.LockerScene.prototype.init = function (data) {
  this.levelKey = (data && data.levelKey) ? data.levelKey : window.STARTING_LEVEL;
  this.pool = window.Team.poolFor(this.levelKey);
  this.team = window.Team.defaultFor(this.levelKey, window.Progress.lastTeam());
  this.newBat = window.Caves.newBatIn(this.levelKey);
};

/* ------------------------------------------------------------------------- */
window.LockerScene.prototype.create = function () {
  var cfg = window.CONFIG;
  var centreX = cfg.screen.width / 2;
  var self = this;

  this.add.rectangle(centreX, cfg.screen.height / 2,
    cfg.screen.width, cfg.screen.height, 0x241a47);

  this.add.text(centreX, 34, 'THE LOCKER', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '30px',
    color: '#ffd24a'
  }).setOrigin(0.5);

  this.add.text(centreX, 68,
    'Pick ' + window.Team.size() + ' bats for ' + window.Caves.label(this.levelKey), {
      fontFamily: cfg.text.fontFamily,
      fontSize: '16px',
      color: '#b9a9e8'
    }).setOrigin(0.5);

  this.buildSlots();
  this.buildCards();

  // One line about whichever bat was tapped last.
  this.infoText = this.add.text(centreX, 424, '', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '15px',
    color: '#ffffff',
    align: 'center',
    wordWrap: { width: cfg.screen.width - 80 }
  }).setOrigin(0.5);

  this.backButton = this.makeButton(110, 492, 150, 50, 'BACK', function () {
    self.scene.start('MenuScene');
  });

  this.fightButton = this.makeButton(cfg.screen.width - 130, 492, 190, 54, 'FIGHT!', function () {
    self.fight();
  });

  this.describe(this.newBat || this.team[0]);
  this.refresh();
};

/* -------------------------------------------------------------------------
   The team places across the top. Tapping a filled one takes that bat out.
   ------------------------------------------------------------------------- */
window.LockerScene.prototype.buildSlots = function () {
  var cfg = window.CONFIG;
  var l = cfg.locker;
  var size = window.Team.size();
  var rowWidth = (size * l.slotWidth) + ((size - 1) * l.slotGap);
  var startX = (cfg.screen.width - rowWidth) / 2;
  var self = this;
  var i;

  this.slots = [];

  for (i = 0; i < size; i++) {
    (function (index) {
      var x = startX + (index * (l.slotWidth + l.slotGap)) + (l.slotWidth / 2);
      var box = self.add.rectangle(x, l.slotY, l.slotWidth, l.slotHeight, l.emptySlotColor);
      box.setStrokeStyle(2, 0xffd24a, 0.7);
      box.setInteractive({ useHandCursor: true });
      window.Touch.pad(box, l.slotGap / 2);

      var portrait = self.add.sprite(x, l.slotY + 12, '__DEFAULT').setOrigin(0.5, 1);
      var label = self.add.text(x, l.slotY + 26, '', {
        fontFamily: cfg.text.fontFamily,
        fontSize: '14px',
        color: cfg.text.color
      }).setOrigin(0.5);

      box.on('pointerdown', function () {
        if (self.team[index]) {
          self.toggle(self.team[index]);
        }
      });

      self.slots.push({ box: box, portrait: portrait, label: label });
    })(i);
  }
};

/* -------------------------------------------------------------------------
   One card per bat you have earned, in the order you earned them.
   ------------------------------------------------------------------------- */
window.LockerScene.prototype.buildCards = function () {
  var cfg = window.CONFIG;
  var l = cfg.locker;
  var self = this;

  this.cards = [];

  this.pool.forEach(function (key, index) {
    var stats = window.UNITS[key];
    var row = Math.floor(index / l.cardsPerRow);
    var column = index % l.cardsPerRow;
    var onThisRow = Math.min(l.cardsPerRow, self.pool.length - (row * l.cardsPerRow));
    var rowWidth = (onThisRow * l.cardWidth) + ((onThisRow - 1) * l.cardGap);
    var x = ((cfg.screen.width - rowWidth) / 2) + (column * (l.cardWidth + l.cardGap)) +
      (l.cardWidth / 2);
    var y = l.gridY + (row * (l.cardHeight + l.cardGap));

    var box = self.add.rectangle(x, y, l.cardWidth, l.cardHeight, cfg.buttons.readyColor);
    box.setStrokeStyle(2, cfg.buttons.borderColor, cfg.buttons.borderAlpha);
    box.setInteractive({ useHandCursor: true });
    window.Touch.pad(box, l.cardGap / 2);

    self.drawPortrait(key, x, y + 4);

    self.add.text(x, y + 18, stats.name, {
      fontFamily: cfg.text.fontFamily,
      fontSize: '13px',
      color: cfg.text.color
    }).setOrigin(0.5);

    self.add.text(x, y + 35, stats.cost + ' energy', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '12px',
      color: '#ffd24a'
    }).setOrigin(0.5);

    if (key === self.newBat) {
      self.add.text(x + (l.cardWidth / 2) - 5, y - (l.cardHeight / 2) + 4, 'NEW!', {
        fontFamily: cfg.text.fontFamily,
        fontSize: '12px',
        color: '#ffd24a'
      }).setOrigin(1, 0);
    }

    // A tick in the corner when this bat is in the team.
    var tick = self.add.text(x - (l.cardWidth / 2) + 6, y - (l.cardHeight / 2) + 3, '✓', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '16px',
      color: '#9ff0b0'
    });

    box.on('pointerdown', function () {
      self.describe(key);
      self.toggle(key);
    });

    self.cards.push({ key: key, box: box, tick: tick });
  });
};

/* A bat's little picture, sized like a deploy button's - one per member for a
   squad that uses its member's picture (Squad.portraitCount). */
window.LockerScene.prototype.drawPortrait = function (key, x, y) {
  var b = window.CONFIG.buttons;
  var stats = window.UNITS[key];
  var members = window.Squad.portraitCount(key);
  var fit = Math.min(b.portraitMaxWidth / stats.anims.frameWidth,
    b.portraitMaxHeight / stats.anims.frameHeight);
  var shrink = (members > 1) ? b.squadPortraitShrink : 1;
  var m;

  for (m = members - 1; m >= 0; m--) {
    var offset = (members > 1) ? (m - ((members - 1) / 2)) * b.squadPortraitSpread : 0;
    var picture = this.add.sprite(x - offset, y - (m * 3), stats.sprite).setOrigin(0.5, 1);
    picture.setScale(fit * shrink);
    picture.play(key + '_idle');
  }
};

/* -------------------------------------------------------------------------
   In or out. A full team ignores a new bat and says why, rather than
   silently swapping one out - a nine-year-old should never wonder where his
   Archer went.
   ------------------------------------------------------------------------- */
window.LockerScene.prototype.toggle = function (key) {
  var at = this.team.indexOf(key);

  if (at !== -1) {
    this.team.splice(at, 1);
  } else if (this.team.length < window.Team.size()) {
    this.team.push(key);
  } else {
    this.infoText.setText('Your team is full - tap a bat in it to take it out first.');
    this.infoText.setColor('#ff9f9f');
    return;
  }

  this.refresh();
};

window.LockerScene.prototype.describe = function (key) {
  if (!key) {
    return;
  }

  var stats = window.UNITS[key];
  this.infoText.setColor('#ffffff');
  this.infoText.setText(stats.name + ':  ' + (stats.blurb || ''));
};

/* Redraw the team places, the ticks and the FIGHT button. */
window.LockerScene.prototype.refresh = function () {
  var cfg = window.CONFIG;
  var l = cfg.locker;
  var b = cfg.buttons;
  var self = this;

  this.slots.forEach(function (slot, index) {
    var key = self.team[index];

    if (!key) {
      slot.box.fillColor = l.emptySlotColor;
      slot.portrait.setVisible(false);
      slot.label.setText('empty');
      slot.label.setAlpha(0.4);
      return;
    }

    var stats = window.UNITS[key];
    slot.box.fillColor = l.pickedColor;
    slot.portrait.setTexture(stats.sprite);
    slot.portrait.play(key + '_idle');
    slot.portrait.setScale(Math.min(b.portraitMaxWidth / stats.anims.frameWidth,
      b.portraitMaxHeight / stats.anims.frameHeight));
    slot.portrait.setVisible(true);
    slot.label.setText(stats.name);
    slot.label.setAlpha(1);
  });

  this.cards.forEach(function (card) {
    var picked = self.team.indexOf(card.key) !== -1;
    card.box.fillColor = picked ? l.pickedColor : b.readyColor;
    card.tick.setVisible(picked);
  });

  // FIGHT! only lights up for a team you are allowed to take in.
  var ready = window.Team.isValid(this.team, this.levelKey);
  this.fightButton.box.fillColor = ready ? 0x3d7a4f : b.unaffordableColor;
  this.fightButton.text.setAlpha(ready ? 1 : b.disabledTextAlpha);
};

window.LockerScene.prototype.fight = function () {
  if (!window.Team.isValid(this.team, this.levelKey)) {
    this.infoText.setText('Pick at least one bat first!');
    this.infoText.setColor('#ff9f9f');
    return;
  }

  window.Progress.saveTeam(this.team);
  this.scene.start('BattleScene', { levelKey: this.levelKey, team: this.team.slice() });
};

window.LockerScene.prototype.makeButton = function (x, y, w, h, label, onClick) {
  var cfg = window.CONFIG;

  var box = this.add.rectangle(x, y, w, h, cfg.buttons.readyColor);
  box.setStrokeStyle(2, cfg.buttons.borderColor, cfg.buttons.borderAlpha);
  box.setInteractive({ useHandCursor: true });
  window.Touch.pad(box, cfg.touch.freePad);

  var text = this.add.text(x, y, label, {
    fontFamily: cfg.text.fontFamily,
    fontSize: '20px',
    color: cfg.text.color
  }).setOrigin(0.5);

  box.on('pointerup', onClick);

  return { box: box, text: text };
};
