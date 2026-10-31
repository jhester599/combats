/* =========================================================================
   CASINO SCENE - where suns get spent (milestone M4, built 2026-10-21)
   =========================================================================
   Lewis's casino (homework B13, B22, B27) and Jeff's B29 and casino bats.
   Three columns:

     SHOP (suns)          CASINO BATS (blood)      UPGRADES (blood)
     buy a potion          bats you can only get   each bat you own climbs
     buy a fruit           here, and a bat spin    the colour ladder
     swap suns for blood   to win one
     spin for potions
       and fruit

   This screen only DRAWS things and passes taps on. Every rule - prices, the
   gamble, what you can afford - is in src/systems/casino.js, and the numbers
   are in data/casino.js. After each tap the screen simply redraws itself, so
   what it shows is always exactly what is saved.
   ========================================================================= */

window.CasinoScene = function () {
  Phaser.Scene.call(this, { key: 'CasinoScene' });
};

window.CasinoScene.prototype = Object.create(Phaser.Scene.prototype);
window.CasinoScene.prototype.constructor = window.CasinoScene;

/* data.message: what the last tap did, shown along the bottom.
   data.then: where you were going, when the casino is a stop BETWEEN ROUNDS
   (Casino.betweenRounds) - { levelKey, team } - or null from the title screen.
   data.batsBefore: casino bats owned on the way in, kept across redraws. */
window.CasinoScene.prototype.init = function (data) {
  this.then = (data && data.then) || null;
  this.batsBefore = (data && typeof data.batsBefore === 'number') ? data.batsBefore
    : window.Progress.load().casinoBats.length;
  this.message = (data && data.message) ||
    (this.then ? 'Spend your suns before the next battle - or carry on.'
      : 'Win caves to earn suns, then spend them here.');
  this.messageColor = (data && data.messageColor) || '#b9a9e8';
};

window.CasinoScene.prototype.create = function () {
  var cfg = window.CONFIG;
  var c = window.CASINO;
  var state = window.Progress.load();
  var self = this;

  this.add.rectangle(cfg.screen.width / 2, cfg.screen.height / 2,
    cfg.screen.width, cfg.screen.height, 0x1d1438);

  this.add.text(cfg.screen.width / 2, 34, 'THE CASINO', {
    fontFamily: cfg.text.fontFamily, fontSize: '34px', color: '#ffd24a'
  }).setOrigin(0.5);

  // What you have, always in view.
  this.add.text(cfg.screen.width / 2, 74,
    '☀ ' + state.suns + ' suns      ' + state.blood + ' blood      ' +
    state.bag.potion + ' potions      ' + state.bag.fruit + ' fruit      ' +
    'vault ' + window.Casino.vaultProgress().wins + '/' + window.Casino.vaultProgress().of, {
      fontFamily: cfg.text.fontFamily, fontSize: '19px', color: '#ffffff'
    }).setOrigin(0.5);

  this.buildShop(30, c);
  this.buildBatShelf(345, c);
  this.buildUpgrades(640);

  // Between rounds the bottom row is MENU, the message, and a big button on
  // to the battle you were heading for. From the title screen it is BACK.
  var messageX = this.then ? 410 : (cfg.screen.width / 2) + 60;
  this.add.text(messageX, 512, this.message, {
    fontFamily: cfg.text.fontFamily, fontSize: '17px', color: this.messageColor,
    align: 'center', wordWrap: { width: this.then ? 420 : 700 }
  }).setOrigin(0.5);

  this.makeButton(70, 512, 110, 44, this.then ? 'MENU' : 'BACK', function () {
    self.scene.start('MenuScene');
  });

  if (this.then) {
    var verb = this.then.team ? 'TRY AGAIN: ' : 'ON TO ';
    var go = this.makeButton(800, 510, 300, 50, verb + window.LEVELS[this.then.levelKey].name + '  \u25B6',
      function () {
        window.Casino.carryOn(self, self.then, self.batsBefore);
      }, 0x2e7d4f);
    if (go.text.width > 284) {
      go.text.setScale(284 / go.text.width);
    }
  }
};

/* Redraw with a message about what just happened. */
window.CasinoScene.prototype.say = function (message, good) {
  this.scene.restart({
    message: message,
    messageColor: good ? '#7ee08f' : '#ff9a8a',
    then: this.then,
    batsBefore: this.batsBefore
  });
};

/* -------------------------------------------------------------------------
   SHOP - suns for potions, fruit and blood, and the spin
   ------------------------------------------------------------------------- */
window.CasinoScene.prototype.buildShop = function (left, c) {
  var self = this;
  var w = 285;
  var x = left + (w / 2);

  this.heading(x, 106, 'SHOP', 'pay with suns');

  this.makeButton(x, 166, w, 46, 'Buy a potion - ' + c.prices.potion + ' ☀', function () {
    if (window.Casino.buy('potion')) {
      self.say('A potion! It weakens the bugs for ' + window.ITEMS.potion.seconds + 's in a battle.', true);
    } else {
      self.say('Not enough suns for a potion - win a cave!', false);
    }
  });

  this.makeButton(x, 222, w, 46, 'Buy a fruit - ' + c.prices.fruit + ' ☀', function () {
    if (window.Casino.buy('fruit')) {
      self.say('A fruit! It heals your tower a little in a battle.', true);
    } else {
      self.say('Not enough suns for a fruit - win a cave!', false);
    }
  });

  // One swap button per size, side by side: "5 blood - 1 sun", "50 blood - 10".
  var swapW = (w - ((c.swapSizes.length - 1) * 8)) / c.swapSizes.length;
  c.swapSizes.forEach(function (suns, i) {
    var blood = suns * c.bloodPerSun;
    self.makeButton(left + (swapW / 2) + (i * (swapW + 8)), 278, swapW, 46,
      blood + ' blood - ' + suns + ' ☀', function () {
        if (window.Casino.tradeForBlood(suns)) {
          self.say('+' + blood + ' blood. Spend it on bats and upgrades.', true);
        } else {
          self.say('Not enough suns to swap for ' + blood + ' blood.', false);
        }
      });
  });

  this.makeButton(x, 352, w, 62, 'SPIN for potions\nand fruit - ' + c.spinCost + ' ☀', function () {
    var prize = window.Casino.spin(Math.random);
    if (!prize) {
      self.say('Not enough suns to spin.', false);
    } else if (!prize.potion && !prize.fruit) {
      self.say('The wheel says... nothing this time!', false);
    } else {
      self.say('The wheel says... ' + prize.name + '!', true);
    }
  }, 0x5a2a6e);

  this.add.text(x, 402, 'Up to ' + c.maxPerBattle + ' of each come into every battle.', {
    fontFamily: window.CONFIG.text.fontFamily, fontSize: '13px', color: '#8f82b8'
  }).setOrigin(0.5, 0);
};

/* -------------------------------------------------------------------------
   CASINO BATS - only sold here, for blood
   ------------------------------------------------------------------------- */
window.CasinoScene.prototype.buildBatShelf = function (left, c) {
  var self = this;
  var cfg = window.CONFIG;
  var w = 270;
  var x = left + (w / 2);
  var bats = window.Casino.casinoBats();

  this.heading(x, 106, 'CASINO BATS', 'pay with blood');

  if (!bats.length) {
    this.add.text(x, 230, 'New bats you can only\nget at the casino\nare coming soon!', {
      fontFamily: cfg.text.fontFamily, fontSize: '17px', color: '#b9a9e8', align: 'center'
    }).setOrigin(0.5);
    return;
  }

  // One row per casino bat: picture, name, and its price or OWNED.
  bats.slice(0, 4).forEach(function (key, i) {
    var stats = window.UNITS[key];
    var owned = window.Casino.ownsBat(key);
    var y = 160 + (i * 52);
    var label = owned ? stats.name + '  -  OWNED' : stats.name + '  -  ' + stats.casinoPrice + ' blood';

    var button = self.makeButton(x, y, w, 46, '', function () {
      if (owned) {
        self.say('You already have the ' + stats.name + '.', false);
      } else if (window.Casino.buyBat(key)) {
        self.say('The ' + stats.name + ' is yours! It is in your Locker now.', true);
      } else {
        self.say('Not enough blood for the ' + stats.name + '.', false);
      }
    });
    button.text.setText(label).setFontSize(15).setX(x + 20);
    self.portrait(key, left + 30, y + 18, 40, 36);
  });

  var left2 = window.Casino.unownedCasinoBats().length;
  this.makeButton(x, 384, w, 52,
    left2 ? 'BAT SPIN - ' + c.batSpin.cost + ' blood' : 'You own every casino bat!', function () {
      var result = window.Casino.spinForBat(Math.random);
      if (!result) {
        self.say(left2 ? 'Not enough blood for a bat spin.' : 'There is no bat left to win!', false);
      } else if (result.won) {
        self.say('YOU WON THE ' + window.UNITS[result.won].name.toUpperCase() + '!', true);
      } else {
        self.say('No bat this time...', false);
      }
    }, 0x5a2a6e);
};

/* -------------------------------------------------------------------------
   UPGRADES - each bat you own, on Lewis's colour ladder
   ------------------------------------------------------------------------- */
window.CasinoScene.prototype.buildUpgrades = function (left) {
  var self = this;
  var cfg = window.CONFIG;
  var tiers = cfg.upgradeTiers;
  var colW = 150;
  var rowH = 50;

  this.heading(left + colW, 106, 'UPGRADES', 'pay with blood');

  window.Casino.ownedBats().slice(0, 14).forEach(function (key, i) {
    var stats = window.UNITS[key];
    var tier = window.Casino.tierOf(key);
    var cost = window.Casino.nextUpgradeCost(key);
    var x = left + (colW / 2) + ((i % 2) * colW);
    var y = 160 + (Math.floor(i / 2) * rowH);

    var nextLabel = (cost === null) ? 'TOP - ' + tiers[tier].name
      : tiers[tier + 1].name + ' for ' + cost + ' blood';

    var button = self.makeButton(x, y, colW - 6, rowH - 6, '', function () {
      if (cost === null) {
        self.say('The ' + stats.name + ' is already ' + tiers[tier].name + ' - the top!', false);
      } else if (window.Casino.upgrade(key)) {
        self.say('The ' + stats.name + ' is now ' + tiers[tier + 1].name + ' - tougher and stronger!', true);
      } else {
        self.say('Not enough blood to upgrade the ' + stats.name + '.', false);
      }
    }, 0x2c2152, 3);

    button.text.setText(stats.name + '\n' + nextLabel).setFontSize(11).setX(x + 18);
    self.portrait(key, x - (colW / 2) + 22, y + 15, 30, 28);
  });
};

/* -------------------------------------------------------------------------
   Small pieces
   ------------------------------------------------------------------------- */
window.CasinoScene.prototype.heading = function (x, y, title, sub) {
  var cfg = window.CONFIG;
  this.add.text(x, y, title, {
    fontFamily: cfg.text.fontFamily, fontSize: '20px', color: '#ffd24a'
  }).setOrigin(0.5);
  this.add.text(x, y + 18, sub, {
    fontFamily: cfg.text.fontFamily, fontSize: '12px', color: '#8f82b8'
  }).setOrigin(0.5);
};

/* A bat's picture, in its upgrade colour, fitted inside maxW x maxH. */
window.CasinoScene.prototype.portrait = function (key, x, y, maxW, maxH) {
  var stats = window.UNITS[key];
  var picture = this.add.sprite(x, y, stats.sprite).setOrigin(0.5, 1);
  picture.setScale(Math.min(maxW / stats.anims.frameWidth, maxH / stats.anims.frameHeight));
  picture.play(key + '_idle');

  return window.Casino.paintPortrait(picture, key);
};

/* A button; pad = how far its tap area reaches past it (src/systems/touch.js). */
window.CasinoScene.prototype.makeButton = function (x, y, w, h, label, onClick, fill, pad) {
  var cfg = window.CONFIG;
  var colour = fill || cfg.buttons.readyColor;

  var box = this.add.rectangle(x, y, w, h, colour);
  box.setStrokeStyle(2, cfg.buttons.borderColor, cfg.buttons.borderAlpha);
  box.setInteractive({ useHandCursor: true });
  window.Touch.pad(box, pad === undefined ? 5 : pad);

  var text = this.add.text(x, y, label, {
    fontFamily: cfg.text.fontFamily, fontSize: '17px', color: cfg.text.color, align: 'center'
  }).setOrigin(0.5);

  box.on('pointerdown', function () { box.fillColor = cfg.buttons.pressedColor; });
  box.on('pointerout', function () { box.fillColor = colour; });
  box.on('pointerup', function () {
    box.fillColor = colour;
    onClick();
  });

  return { box: box, text: text };
};
