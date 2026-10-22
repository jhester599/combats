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

   ------------------- MADE COOLER (2026-10-22) -------------------
   Lewis wanted the title screen "to look much cooler", and picked these:

     1. A LIVING BACKDROP - the paintings of the caves you have reached, one
        after another, drifting slowly sideways behind everything.
     2. BATS FLYING ACROSS - the bats you have earned, at different heights and
        speeds, sometimes chased by a mosquito. Tap one and it does a flip.
     3. THE TITLE ARRIVES - the logo drops in and bounces (once per visit), then
        floats, with sparkles on the letters.
     4. CAVE BUTTONS ARE PICTURES - a little piece of each cave's painting. Gold
        border and a tick when beaten, a pulsing glow on the next one, dark with
        a padlock when locked.
     5. YOUR BAT LINEUP - every bat in the game along the bottom: yours in
        colour (upgrade colours too), the rest as black silhouettes with a "?".
        Tap one to find out where it comes from.
     7. LEWIS'S LOGO - assets/ui/logo.webp, instead of typed words.

   (6, a drawn MAP of Palopa instead of buttons, is parked for later.)

   Every number - how long a painting stays, how often a bat flies over - is
   in CONFIG.menu in data/config.js. The pieces are drawn back to front:
   painting, flying bats, then everything you can tap.
   ========================================================================= */

window.MenuScene = function () {
  Phaser.Scene.call(this, { key: 'MenuScene' });
};

window.MenuScene.prototype = Object.create(Phaser.Scene.prototype);
window.MenuScene.prototype.constructor = window.MenuScene;

/* ------------------------------------------------------------------------- */
/* The painting the title screen opens on has to be loaded before it can be
   shown; the rest load in the background once the screen is up. */
window.MenuScene.prototype.preload = function () {
  var key = this.slideKeys()[0];

  if (key && !this.textures.exists('bg_' + key)) {
    this.load.image('bg_' + key, 'assets/bg/' + window.BACKGROUNDS[key].file);
  }
};

window.MenuScene.prototype.create = function () {
  var cfg = window.CONFIG;
  var centreX = cfg.screen.width / 2;

  this.buildBackdrop();          // 1
  this.buildFlyers();            // 2
  this.buildLogo();              // 3 and 7

  this.buildCavePicker();        // 4
  this.buildPracticeRow();

  this.makeButton(centreX, cfg.menu.buttonsY, 150, 38, 'Credits', function () {
    this.toggleCredits();
  }.bind(this));

  this.buildCasinoButton();

  this.buildFullscreenButton();

  this.buildLineup();            // 5

  this.buildCredits();

  // Which build this is (CONFIG.version), tucked in the top-right corner so
  // it is there when you look for it and invisible when you don't.
  this.add.text(cfg.screen.width - 10, 8, cfg.version, {
    fontFamily: cfg.text.fontFamily,
    fontSize: '12px',
    color: '#8f82b8'
  }).setOrigin(1, 0);
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

  // The world's name, from Lewis's homework answer B2 - the logo has the
  // game's name now, so Palopa joins this line.
  this.add.text(cfg.screen.width / 2, m.caveRowY - 46,
    'PALOPA  -  choose a cave  -  ' + beaten + ' of ' + caves.length + ' beaten', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '16px',
      color: '#d8cbff',
      stroke: '#120c24',
      strokeThickness: 4
    }).setOrigin(0.5);

  // The first cave you have not beaten yet glows: that is where to go next.
  var nextKey = caves.filter(function (key) {
    return window.Progress.isUnlocked(key) && !window.Progress.hasBeaten(key);
  })[0];

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
    var state = !window.Progress.isUnlocked(key) ? 'locked'
      : window.Progress.hasBeaten(key) ? 'beaten'
        : (key === nextKey) ? 'next' : 'open';

    self.makeCaveButton(x, y, key, state);
  });
};

/* -------------------------------------------------------------------------
   4. A CAVE BUTTON IS A PICTURE of the cave - a strip of its painting,
   assets/bg/thumbs/<cave>.webp - with its name over the top.

     beaten  gold border and a gold tick
     next    a gold glow that pulses: this is where to go
     open    a plain border
     locked  darkened, with a padlock, and does nothing when tapped. Still
             SHOWN on purpose: seeing what is ahead is half of what a map is for.
   ------------------------------------------------------------------------- */
window.MenuScene.prototype.makeCaveButton = function (x, y, key, state) {
  var cfg = window.CONFIG;
  var m = cfg.menu;
  var w = m.caveWidth;
  var h = m.caveHeight;
  var self = this;
  var locked = (state === 'locked');
  var gold = (state === 'beaten' || state === 'next');

  // The pulsing glow goes BEHIND the picture, a little bigger than it.
  if (state === 'next') {
    var glow = this.add.rectangle(x, y, w + 10, h + 10, 0xffd24a, 0.6);
    this.tweens.add({
      targets: glow, alpha: 0.12, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
  }

  var picture = this.textures.exists('thumb_' + key)
    ? this.add.image(x, y, 'thumb_' + key).setDisplaySize(w, h)
    : this.add.rectangle(x, y, w, h, cfg.buttons.readyColor);

  if (locked && picture.setTint) {
    picture.setTint(0x55506a);             // dark, as if the lights are off
  }

  // A dark wash over the painting so the white name always reads.
  this.add.rectangle(x, y, w, h, 0x120c24, locked ? 0.55 : 0.3);

  var border = this.add.rectangle(x, y, w, h);
  border.setStrokeStyle(gold ? 3 : 2, gold ? 0xffd24a : cfg.buttons.borderColor,
    locked ? m.lockedBorderAlpha : 0.95);

  var text = this.add.text(x, y, (locked ? '\u{1F512} ' : '') + window.Caves.label(key), {
    fontFamily: cfg.text.fontFamily,
    fontSize: '15px',
    color: '#ffffff',
    align: 'center',
    stroke: '#120c24',
    strokeThickness: 4,
    wordWrap: { width: w - 14 }
  }).setOrigin(0.5);

  if (text.width > w - 10) {
    text.setScale((w - 10) / text.width);
  }

  if (locked) {
    text.setAlpha(0.6);
    return;
  }

  if (state === 'beaten') {
    this.add.text(x + (w / 2) - 4, y - (h / 2) + 1, '\u2713', {
      fontFamily: cfg.text.fontFamily, fontSize: '16px', color: '#ffd24a',
      stroke: '#120c24', strokeThickness: 4
    }).setOrigin(1, 0);
  }

  picture.setInteractive({ useHandCursor: true });
  window.Touch.pad(picture, m.caveGap / 2);

  var lit = function () {
    if (picture.clearTint) { picture.clearTint(); }
  };

  picture.on('pointerdown', function () {
    if (picture.setTint) { picture.setTint(0xb0a8c8); }
  });
  picture.on('pointerout', lit);
  picture.on('pointerup', function () {
    lit();
    // Through the Locker if you have more bats than fit in a team.
    window.Team.startCave(self, key);
  });
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

  this.add.text(cfg.screen.width / 2, m.practiceY - 32,
    'Just for practice - not part of Palopa', {
      fontFamily: cfg.text.fontFamily,
      fontSize: '14px',
      color: '#b9a9e8',
      stroke: '#120c24',
      strokeThickness: 4
    }).setOrigin(0.5);

  var totalWidth = (levels.length * m.practiceWidth) + ((levels.length - 1) * m.caveGap);
  var startX = (cfg.screen.width - totalWidth) / 2;

  levels.forEach(function (key, index) {
    var x = startX + (index * (m.practiceWidth + m.caveGap)) + (m.practiceWidth / 2);

    self.makeButton(x, m.practiceY, m.practiceWidth, m.practiceHeight,
      window.LEVELS[key].name, function () {
        window.Team.startCave(self, key);
      }, m.caveGap / 2);
  });
};

/* =========================================================================
   1. THE LIVING BACKDROP
   The paintings of the caves you have reached, one after another, each
   drifting slowly sideways and fading into the next. It opens on the furthest
   cave you have got to, so the title screen shows how far into Palopa you are -
   and a new player, who has only reached The Cave, just sees The Cave.
   ========================================================================= */

/* The caves to show, furthest-reached first. */
window.MenuScene.prototype.slideKeys = function () {
  var keys = window.Caves.all().filter(function (key) {
    return window.Progress.isUnlocked(key) && window.BACKGROUNDS && window.BACKGROUNDS[key];
  });

  return keys.reverse();
};

window.MenuScene.prototype.buildBackdrop = function () {
  var cfg = window.CONFIG;
  var m = cfg.menu;
  var self = this;

  // Something behind the paintings, for the moment before the first loads.
  this.add.rectangle(cfg.screen.width / 2, cfg.screen.height / 2,
    cfg.screen.width, cfg.screen.height, 0x241a47).setDepth(-30);

  this.slides = this.slideKeys();
  this.slideIndex = 0;
  this.slideImage = null;

  // The dark wash that keeps every button readable over a bright painting.
  this.add.rectangle(cfg.screen.width / 2, cfg.screen.height / 2,
    cfg.screen.width, cfg.screen.height, 0x150d2e, m.backdropDim).setDepth(-20);

  this.showSlide(true);

  // Fetch the other paintings quietly, now the screen is up. A battle uses the
  // same names (bg_<cave>), so these are not downloaded twice.
  this.slides.forEach(function (key) {
    if (!self.textures.exists('bg_' + key)) {
      self.load.image('bg_' + key, 'assets/bg/' + window.BACKGROUNDS[key].file);
    }
  });
  this.load.start();

  if (this.slides.length > 1) {
    this.time.addEvent({
      delay: m.slideSeconds * 1000,
      loop: true,
      callback: function () { self.showSlide(false); }
    });
  }
};

/* Put up the next painting: scaled to cover the screen, then drifting across
   the part that is wider than the screen while it is shown. */
window.MenuScene.prototype.showSlide = function (first) {
  var cfg = window.CONFIG;
  var m = cfg.menu;

  if (!this.slides.length) {
    return;
  }

  // Skip any painting still downloading; it gets its turn next time round.
  var tries = 0;
  var key = this.slides[this.slideIndex % this.slides.length];
  while (!this.textures.exists('bg_' + key) && tries < this.slides.length) {
    this.slideIndex += 1;
    key = this.slides[this.slideIndex % this.slides.length];
    tries += 1;
  }

  if (!this.textures.exists('bg_' + key)) {
    return;
  }

  var image = this.add.image(0, cfg.screen.height / 2, 'bg_' + key).setOrigin(0, 0.5).setDepth(-25);
  var scale = Math.max(cfg.screen.width / image.width, cfg.screen.height / image.height);
  image.setScale(scale);

  // Drift one way, then the other way on the next painting.
  var spare = (image.width * scale) - cfg.screen.width;
  var leftward = (this.slideIndex % 2 === 0);
  image.x = leftward ? 0 : -spare;

  var showFor = (m.slideSeconds + m.slideFade) * 1000;
  this.tweens.add({ targets: image, x: leftward ? -spare : 0, duration: showFor, ease: 'Linear' });

  // Fade the new one in over the old, then throw the old one away.
  var old = this.slideImage;
  this.slideImage = image;
  this.slideIndex += 1;

  if (first) {
    return;
  }

  image.setAlpha(0);
  this.tweens.add({
    targets: image,
    alpha: 1,
    duration: m.slideFade * 1000,
    onComplete: function () {
      if (old) { old.destroy(); }
    }
  });
};

/* =========================================================================
   2. BATS FLYING ACROSS
   Only bats you have EARNED (or bought), so the sky over the title screen
   fills up as you play. They fly behind everything you can tap.
   ========================================================================= */
window.MenuScene.prototype.buildFlyers = function () {
  var m = window.CONFIG.menu;
  var self = this;

  this.flyers = [];
  this.flyerKeys = window.Casino.ownedBats().filter(function (key) {
    return window.UNITS[key] && !window.UNITS[key].summonOnly;
  });

  // Two already on their way, so the screen is never empty when it opens.
  this.spawnFlyer(true);
  this.spawnFlyer(true);

  this.time.addEvent({
    delay: m.flyerEvery * 1000,
    loop: true,
    callback: function () { self.spawnFlyer(false); }
  });
};

window.MenuScene.prototype.spawnFlyer = function (midway) {
  var cfg = window.CONFIG;
  var m = cfg.menu;
  var self = this;

  if (!this.flyerKeys.length || this.flyers.length >= m.flyerMost) {
    return;
  }

  var key = Phaser.Utils.Array.GetRandom(this.flyerKeys);
  var dir = (Math.random() < 0.5) ? 1 : -1;
  var y = Phaser.Math.Between(40, cfg.screen.height - 70);
  var x = midway ? Phaser.Math.Between(120, cfg.screen.width - 120)
    : (dir > 0 ? -60 : cfg.screen.width + 60);

  var bat = this.makeFlyer(key, x, y, dir, Phaser.Math.FloatBetween(0.6, 0.85));
  bat.speed = Phaser.Math.Between(55, 115);
  this.flyers.push(bat);

  // Tap it and it does a flip - which is all a bat on a title screen needs.
  bat.setInteractive({ useHandCursor: true });
  bat.on('pointerdown', function () {
    if (bat.flipping) { return; }
    bat.flipping = true;
    self.tweens.add({
      targets: bat,
      angle: bat.angle + (360 * bat.dir),
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: function () { bat.flipping = false; }
    });
  });

  // Sometimes it is being chased.
  if (Math.random() < m.chaseChance && window.UNITS.mosquito) {
    var bug = this.makeFlyer('mosquito', x - (70 * dir), y + 6, dir, 0.7);
    bug.speed = bat.speed;
    bug.wobble = 9;
    this.flyers.push(bug);
  }
};

/* One picture that flies: bobbing up and down as it goes. */
window.MenuScene.prototype.makeFlyer = function (key, x, y, dir, size) {
  var stats = window.UNITS[key];
  var sprite = this.add.sprite(x, y, stats.sprite).setDepth(-10);

  sprite.setScale(window.Unit.scaleOf(stats) * size);
  sprite.play(key + '_walk');
  sprite.setFlipX(dir < 0);
  sprite.setAlpha(0.95);

  if (!stats.enemy) {
    window.Casino.paintPortrait(sprite, key);      // its upgrade colour
  }

  sprite.dir = dir;
  sprite.baseY = y;
  sprite.phase = Math.random() * Math.PI * 2;
  sprite.wobble = 14;
  return sprite;
};

/* Move the flyers along, and let any that are off the screen go. */
window.MenuScene.prototype.update = function (time, delta) {
  var cfg = window.CONFIG;
  var dt = delta / 1000;
  var i;
  var f;

  if (!this.flyers) {
    return;
  }

  for (i = this.flyers.length - 1; i >= 0; i--) {
    f = this.flyers[i];
    f.x += f.speed * f.dir * dt;
    f.y = f.baseY + (Math.sin((time / 400) + f.phase) * f.wobble);

    if (f.x < -120 || f.x > cfg.screen.width + 120) {
      f.destroy();
      this.flyers.splice(i, 1);
    }
  }
};

/* =========================================================================
   3 and 7. LEWIS'S LOGO, ARRIVING
   It drops in and bounces the first time the title screen appears (not every
   time you come back from a battle - that would get old fast), then floats
   gently, with little sparkles twinkling on the letters.
   ========================================================================= */
window.MenuScene.prototype.buildLogo = function () {
  var cfg = window.CONFIG;
  var m = cfg.menu;
  var self = this;
  var centreX = cfg.screen.width / 2;

  if (!this.textures.exists('logo')) {
    // No logo file: the old typed title, so the game still says its name.
    this.add.text(centreX, m.logoY, 'ComBats', {
      fontFamily: cfg.text.fontFamily, fontSize: '64px', color: '#ffd24a'
    }).setOrigin(0.5);
    return;
  }

  var logo = this.add.image(centreX, m.logoY, 'logo');
  this.logo = logo;

  var float = function () {
    self.tweens.add({
      targets: logo, y: m.logoY - 5, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
  };

  if (window.MenuScene.logoHasDropped) {
    float();
  } else {
    window.MenuScene.logoHasDropped = true;
    logo.y = -logo.height;
    this.tweens.add({
      targets: logo, y: m.logoY, duration: 1100, ease: 'Bounce.easeOut', onComplete: float
    });
  }

  this.makeSparkleTexture();
  this.time.addEvent({
    delay: m.sparkleEvery * 1000,
    loop: true,
    callback: function () { self.sparkle(); }
  });
};

/* A little four-pointed star, drawn once and reused. */
window.MenuScene.prototype.makeSparkleTexture = function () {
  if (this.textures.exists('sparkle')) {
    return;
  }

  var g = this.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffffff, 1);
  g.fillTriangle(12, 0, 15, 12, 9, 12);
  g.fillTriangle(12, 24, 15, 12, 9, 12);
  g.fillTriangle(0, 12, 12, 9, 12, 15);
  g.fillTriangle(24, 12, 12, 9, 12, 15);
  g.fillCircle(12, 12, 3);
  g.generateTexture('sparkle', 24, 24);
  g.destroy();
};

/* Twinkle once, somewhere on the letters (a spot of the logo that is solid,
   in its middle band - not out in the sky above it). */
window.MenuScene.prototype.sparkle = function () {
  var logo = this.logo;
  var tries;
  var px;
  var py;

  if (!logo) {
    return;
  }

  for (tries = 0; tries < 25; tries++) {
    px = Phaser.Math.Between(0, logo.width - 1);
    py = Phaser.Math.Between(Math.round(logo.height * 0.3), Math.round(logo.height * 0.72));

    if (this.textures.getPixelAlpha(px, py, 'logo') > 200) {
      break;
    }
  }

  if (tries === 25) {
    return;
  }

  var star = this.add.image(logo.x - (logo.width / 2) + px, logo.y - (logo.height / 2) + py, 'sparkle');
  star.setBlendMode(Phaser.BlendModes.ADD).setScale(0).setTint(0xfff2b0);

  this.tweens.add({
    targets: star,
    scale: Phaser.Math.FloatBetween(0.6, 1.0),
    angle: 90,
    duration: 350,
    yoyo: true,
    ease: 'Sine.easeOut',
    onComplete: function () { star.destroy(); }
  });
};

/* =========================================================================
   5. YOUR BAT LINEUP
   Every bat in the game, standing along the bottom in the order you meet
   them, casino bats last. Yours are in colour (and in their upgrade colour);
   the rest are black silhouettes with a "?" - something to want. Tap one to
   see its name, or where to get it.
   ========================================================================= */
window.MenuScene.prototype.lineupKeys = function () {
  var keys = window.LEVELS[window.Caves.all()[0]].playerUnits.slice();

  window.Caves.all().forEach(function (key) {
    var earned = window.Caves.earnedBy(key);
    if (earned && keys.indexOf(earned) === -1) {
      keys.push(earned);
    }
  });

  window.Casino.casinoBats().forEach(function (key) {
    if (keys.indexOf(key) === -1) {
      keys.push(key);
    }
  });

  return keys;
};

/* Where this bat comes from, for a tap on its silhouette. */
window.MenuScene.prototype.lineupHint = function (key) {
  var stats = window.UNITS[key];
  var tiers = window.CONFIG.upgradeTiers;

  if (window.Casino.ownedBats().indexOf(key) !== -1) {
    var tier = window.Casino.tierOf(key);
    return stats.name + (tier > 0 ? '  -  ' + tiers[tier].name : '');
  }

  if (stats.casinoPrice) {
    return '???  -  find it at the Casino';
  }

  var from = window.Caves.all().filter(function (cave) {
    return window.Caves.earnedBy(cave) === key;
  })[0];

  return from ? '???  -  beat ' + window.LEVELS[from].name + ' to earn it' : '???';
};

window.MenuScene.prototype.buildLineup = function () {
  var cfg = window.CONFIG;
  var m = cfg.menu;
  var self = this;
  var keys = this.lineupKeys();
  var owned = window.Casino.ownedBats();
  var slot = cfg.screen.width / keys.length;

  var hint = this.add.text(cfg.screen.width / 2, m.lineupY - m.lineupHeight - 2, '', {
    fontFamily: cfg.text.fontFamily, fontSize: '14px', color: '#ffffff',
    stroke: '#120c24', strokeThickness: 4
  }).setOrigin(0.5, 1).setDepth(5);
  var hintTimer = null;

  keys.forEach(function (key, i) {
    var stats = window.UNITS[key];
    var x = (i + 0.5) * slot;
    var have = owned.indexOf(key) !== -1;
    var fit = Math.min((slot - 8) / stats.anims.frameWidth, m.lineupHeight / stats.anims.frameHeight);

    var bat = self.add.sprite(x, m.lineupY, stats.sprite).setOrigin(0.5, 1).setScale(fit);
    bat.play(key + '_idle');

    if (have) {
      window.Casino.paintPortrait(bat, key);
      // A little hop now and then, each bat on its own beat.
      self.tweens.add({
        targets: bat, y: m.lineupY - 4, duration: 600 + (i * 37), yoyo: true,
        repeat: -1, repeatDelay: 1200 + (i * 211), ease: 'Sine.easeInOut'
      });
    } else {
      bat.setTint(0x000000).setTintMode(Phaser.TintModes.FILL).setAlpha(0.85);
      self.add.text(x, m.lineupY - (m.lineupHeight / 2), '?', {
        fontFamily: cfg.text.fontFamily, fontSize: '18px', color: '#b9a9e8'
      }).setOrigin(0.5);
    }

    bat.setInteractive({ useHandCursor: true });
    window.Touch.pad(bat, 4);
    bat.on('pointerup', function () {
      hint.setText(self.lineupHint(key)).setX(Phaser.Math.Clamp(x, 130, cfg.screen.width - 130));
      if (hintTimer) { hintTimer.remove(); }
      hintTimer = self.time.delayedCall(2200, function () { hint.setText(''); });
    });
  });
};

/* -------------------------------------------------------------------------
   A reusable button that works with BOTH mouse and touch.
   Phaser's pointer events cover both, so there is nothing extra to do.
   ------------------------------------------------------------------------- */
window.MenuScene.prototype.makeButton = function (x, y, w, h, label, onClick, pad) {
  var cfg = window.CONFIG;

  var box = this.add.rectangle(x, y, w, h, cfg.buttons.readyColor);
  box.setStrokeStyle(2, cfg.buttons.borderColor, cfg.buttons.borderAlpha);
  box.setInteractive({ useHandCursor: true });

  // A bigger target for a finger (src/systems/touch.js). Buttons packed in a
  // grid pass their own, smaller, pad so neighbours never overlap.
  window.Touch.pad(box, pad === undefined ? cfg.touch.freePad : pad);

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
   THE CASINO (milestone M4), and how many suns you have to spend there.
   Only there once you have earned your first sun (Casino.isOpen).
   ------------------------------------------------------------------------- */
window.MenuScene.prototype.buildCasinoButton = function () {
  var cfg = window.CONFIG;
  var self = this;

  if (!window.Casino.isOpen()) {
    return;
  }

  this.makeButton(690, cfg.menu.buttonsY, 150, 38, 'Casino', function () {
    self.scene.start('CasinoScene');
  });

  this.add.text(690, cfg.menu.buttonsY + 21, '\u2600 ' + window.Progress.load().suns + ' suns', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '14px',
    color: '#ffd24a',
    stroke: '#120c24',
    strokeThickness: 4
  }).setOrigin(0.5, 0);
};

/* -------------------------------------------------------------------------
   FULL SCREEN, for phones and tablets that allow it (2026-10-17).

   A phone's browser keeps its address bar and buttons on screen, and held
   sideways those can take a third of the height. Android phones and iPads let
   a page go full screen from a tap; iPhones do not, so there the button is
   simply not drawn - "Add to Home Screen" is the way to play full screen
   there (see manifest.webmanifest and the apple-* lines in index.html).

   Not drawn either when ComBats is already running as an installed app, which
   is full screen already.
   ------------------------------------------------------------------------- */
window.MenuScene.prototype.buildFullscreenButton = function () {
  var self = this;
  var installed = false;

  try {
    installed = window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
  } catch (err) {
    installed = false;
  }

  if (!this.sys.game.device.fullscreen.available || installed) {
    return;
  }

  var button = this.makeButton(100, window.CONFIG.menu.buttonsY, 160, 38,
    this.scale.isFullscreen ? 'Exit full screen' : 'Full screen', function () {
      // Phaser needs this to run from a tap (pointerup), which makeButton's
      // onClick does - browsers refuse full screen that nobody asked for.
      if (self.scale.isFullscreen) {
        self.scale.stopFullscreen();
        button.text.setText('Full screen');
        return;
      }

      self.scale.startFullscreen();
      button.text.setText('Exit full screen');

      // And hold it sideways, where the phone allows that (Android does once
      // the page is full screen; others quietly refuse, which is fine).
      try {
        if (window.screen.orientation && window.screen.orientation.lock) {
          window.screen.orientation.lock('landscape').catch(function () {});
        }
      } catch (err) {
        // Not allowed here. The "turn your phone sideways" screen still works.
      }
    });
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
    'Art: the bats, the bugs and the logo',
    'drawn by Lewis and Jeff.',
    'Every picture is listed in ASSETS.md.',
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
  // The words are small, so the tap area is generous - wide enough for the
  // longer "Really? ..." wording it changes to.
  window.Touch.pad(resetLabel, 60, cfg.touch.freePad);
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

  // ...except the reset words, which must sit ABOVE the panel (see above) -
  // giving them the panel's depth hid them behind it.
  this.creditsGroup[2].setDepth(1001);

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
