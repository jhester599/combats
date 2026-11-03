/* =========================================================================
   SLOT SCENE - the casino's slot machine, with BATS on the reels (2026-11-02)
   =========================================================================
   Roadmap idea C1, and Jeff: "on the reels we should include the different
   bats (instead of fruit, 7, etc.)".

   Three reels of bats, a lever, chasing lights round the machine, and a
   table of what each line pays. THREE OF A BAT IN A ROW wins that bat's
   prize - which bat pays what is the  reel:  on each prize in
   data/casino.js.

   ------------------- THE RULES IT KEEPS (ROADMAP.md) -------------------
     * THE RESULT IS DECIDED FIRST, THEN ANIMATED. Pulling the lever calls
       Casino.spin(), which takes the suns and pays the prize at once; the
       reels are then made to land on it (Casino.reelsFor). The machine can
       never disagree with the rules, and leaving mid-spin loses nothing.
     * HONEST ODDS. The paytable shows every prize's real chance, worked out
       from the weights in data/casino.js. A losing line is any line that is
       not three of a kind, all equally likely - no near-miss on purpose.
     * A SPIN ONLY EVER COSTS THE SPIN, exactly as before.

   This screen only draws. The rules are src/systems/casino.js.
   ========================================================================= */

window.SlotScene = function () {
  Phaser.Scene.call(this, { key: 'SlotScene' });
};

window.SlotScene.prototype = Object.create(Phaser.Scene.prototype);
window.SlotScene.prototype.constructor = window.SlotScene;

/* Where the machine sits. The reel windows are dark so the white bats show. */
var SLOT = {
  centreX: 500,
  top: 100, bottom: 382, width: 440,     // the cabinet
  windowY: 245, windowW: 120, windowH: 150, reelGap: 135,
  spacing: 84,                           // from one bat to the next on a reel
  batW: 100, batH: 60,                   // the box each bat is fitted inside
  leverX: 760,
  cabinetColor: 0x5a2a6e,
  windowColor: 0x120c24,
  bulbOn: 0xffd24a, bulbOff: 0x6b4a2a
};

/* data: what CasinoScene passes - { then, batsBefore } - so the way back
   carries on to the battle you were heading for. */
window.SlotScene.prototype.init = function (data) {
  this.then = (data && data.then) || null;
  this.batsBefore = data ? data.batsBefore : undefined;
  this.spinning = false;
  this.reels = [];
};

window.SlotScene.prototype.create = function () {
  var cfg = window.CONFIG;
  var self = this;

  this.add.rectangle(cfg.screen.width / 2, cfg.screen.height / 2,
    cfg.screen.width, cfg.screen.height, 0x1d1438);

  this.add.text(cfg.screen.width / 2, 30, 'THE SLOTS', {
    fontFamily: cfg.text.fontFamily, fontSize: '32px', color: '#ffd24a'
  }).setOrigin(0.5).setDepth(5);

  this.moneyText = this.add.text(cfg.screen.width / 2, 68, '', {
    fontFamily: cfg.text.fontFamily, fontSize: '18px', color: '#ffffff'
  }).setOrigin(0.5).setDepth(5);
  this.showMoney();

  this.buildPaytable();
  this.buildMachine();
  this.buildLever();

  this.spinButton = this.makeButton(SLOT.centreX, 428, 270, 52,
    'SPIN  -  ' + window.CASINO.spinCost + ' ☀', function () { self.pull(); }, 0x5a2a6e);

  this.makeButton(80, 512, 140, 44, '◀ CASINO', function () { self.leave(); });

  this.messageText = this.add.text(560, 512, 'Pull the lever! Three of a bat in a row wins.', {
    fontFamily: cfg.text.fontFamily, fontSize: '17px', color: '#b9a9e8', align: 'center',
    wordWrap: { width: 700 }
  }).setOrigin(0.5).setDepth(5);

  // The chasing lights: every third bulb lit, stepping round.
  this.lightStep = 0;
  this.lightTimer = this.time.addEvent({
    delay: 160, loop: true, callback: function () { self.stepLights(); }
  });
};

/* -------------------------------------------------------------------------
   THE PAYTABLE - every line that wins, and how likely it really is
   ------------------------------------------------------------------------- */
window.SlotScene.prototype.buildPaytable = function () {
  var cfg = window.CONFIG;
  var self = this;
  var left = 14;
  var rowH = 42;
  var y = 150;

  this.add.text(left + 128, 108, 'PAYS', {
    fontFamily: cfg.text.fontFamily, fontSize: '20px', color: '#ffd24a'
  }).setOrigin(0.5);
  this.add.text(left + 128, 126, 'three in a row  -  and the real odds', {
    fontFamily: cfg.text.fontFamily, fontSize: '11px', color: '#8f82b8'
  }).setOrigin(0.5);

  // Best prize at the top, like a real machine.
  window.CASINO.prizes.slice().reverse().forEach(function (prize) {
    var chance = window.Casino.prizeChance(prize) + '%';
    var words;

    if (prize.reel) {
      [0, 1, 2].forEach(function (i) {
        self.reelBat(prize.reel, left + 20 + (i * 38), y, 37, 30);
      });
      words = prize.name.replace('JACKPOT! ', 'JACKPOT\n');
    } else {
      words = 'anything else: nothing';
    }

    self.add.text(prize.reel ? left + 134 : left + 4, y, words, {
      fontFamily: cfg.text.fontFamily, fontSize: '13px',
      color: prize.reel ? '#ffffff' : '#8f82b8'
    }).setOrigin(0, 0.5);

    self.add.text(left + 254, y, chance, {
      fontFamily: cfg.text.fontFamily, fontSize: '14px', color: '#ffd24a'
    }).setOrigin(1, 0.5);

    y += rowH;
  });
};

/* -------------------------------------------------------------------------
   THE MACHINE - a cabinet with three dark windows and a light-bulb border.

   There are no masks: each reel is a long strip of bats that slides DOWN
   behind its window, and the cabinet is drawn in front of the strip above
   and below the window, so only the window shows. update() hides any bat
   that is wholly outside its window, so nothing peeks past the cabinet.
   ------------------------------------------------------------------------- */
window.SlotScene.prototype.buildMachine = function () {
  var cfg = window.CONFIG;
  var self = this;
  var cx = SLOT.centreX;
  var height = SLOT.bottom - SLOT.top;
  var midY = SLOT.top + (height / 2);
  var winTop = SLOT.windowY - (SLOT.windowH / 2);
  var winBottom = SLOT.windowY + (SLOT.windowH / 2);
  var first = window.Casino.reelsFor({ reel: null }, Math.random);
  var i;

  this.add.rectangle(cx, midY, SLOT.width, height, SLOT.cabinetColor).setDepth(0);

  for (i = 0; i < 3; i++) {
    var x = cx + ((i - 1) * SLOT.reelGap);
    this.add.rectangle(x, SLOT.windowY, SLOT.windowW, SLOT.windowH, SLOT.windowColor).setDepth(0);

    // In front of the strip: the cabinet above and below this window.
    this.add.rectangle(x, (SLOT.top + winTop) / 2, SLOT.windowW + 4, winTop - SLOT.top,
      SLOT.cabinetColor).setDepth(2);
    this.add.rectangle(x, (winBottom + SLOT.bottom) / 2, SLOT.windowW + 4, SLOT.bottom - winBottom,
      SLOT.cabinetColor).setDepth(2);

    var frame = this.add.rectangle(x, SLOT.windowY, SLOT.windowW, SLOT.windowH);
    frame.setStrokeStyle(3, 0xffd24a, 0.9).setDepth(3);

    var strip = this.add.container(x, SLOT.windowY).setDepth(1);
    this.reels.push({ strip: strip, x: x });
    this.fillStrip(this.reels[i], [first[i]]);
  }

  // The cabinet's edge, its name, and the payline arrows.
  this.add.rectangle(cx, midY, SLOT.width, height).setStrokeStyle(4, 0xffd24a, 1).setDepth(3);
  this.add.text(cx, SLOT.top + 32, '★  BAT SLOTS  ★', {
    fontFamily: cfg.text.fontFamily, fontSize: '24px', color: '#ffd24a',
    stroke: '#2a0f33', strokeThickness: 4
  }).setOrigin(0.5).setDepth(4);
  this.add.text(cx - (SLOT.width / 2) + 14, SLOT.windowY, '▶', {
    fontFamily: cfg.text.fontFamily, fontSize: '20px', color: '#ffd24a'
  }).setOrigin(0.5).setDepth(4);
  this.add.text(cx + (SLOT.width / 2) - 14, SLOT.windowY, '◀', {
    fontFamily: cfg.text.fontFamily, fontSize: '20px', color: '#ffd24a'
  }).setOrigin(0.5).setDepth(4);

  // Bulbs all the way round, for the chasing lights.
  this.bulbs = [];
  var left = cx - (SLOT.width / 2);
  var right = cx + (SLOT.width / 2);
  var step = 28;
  var x2;
  var y2;
  for (x2 = left; x2 < right; x2 += step) { this.bulbs.push([x2, SLOT.top]); }
  for (y2 = SLOT.top; y2 < SLOT.bottom; y2 += step) { this.bulbs.push([right, y2]); }
  for (x2 = right; x2 > left; x2 -= step) { this.bulbs.push([x2, SLOT.bottom]); }
  for (y2 = SLOT.bottom; y2 > SLOT.top; y2 -= step) { this.bulbs.push([left, y2]); }
  this.bulbs = this.bulbs.map(function (at) {
    return self.add.circle(at[0], at[1], 5, SLOT.bulbOff).setDepth(4);
  });
};

/* One bat's picture for the reels or the paytable, fitted inside w x h - in
   its skin and upgrade colour, the same as everywhere else in the game. */
window.SlotScene.prototype.reelBat = function (unitKey, x, y, w, h) {
  var look = window.Casino.lookOf(unitKey);
  var picture = this.add.sprite(x, y, look.sprite, look.anims.idle.start);
  picture.setScale(Math.min(w / look.anims.frameWidth, h / look.anims.frameHeight));
  return window.Casino.paintPortrait(picture, unitKey);
};

/* Put a fresh strip of bats on a reel. 'line' is the bats from the BOTTOM of
   the strip up: line[0] sits in the window now, the last one is where it
   will stop. A random bat goes either side so the window never shows a gap. */
window.SlotScene.prototype.fillStrip = function (reel, line) {
  var bats = window.Casino.reelBats();
  var self = this;
  var any = function () { return bats[Math.floor(Math.random() * bats.length)]; };
  var all = [any()].concat(line, [any()]);

  reel.strip.removeAll(true);
  reel.strip.y = SLOT.windowY;

  all.forEach(function (key, k) {
    // k = 0 is the one just below the window, k = 1 is in the window.
    var bat = self.reelBat(key, 0, -(k - 1) * SLOT.spacing, SLOT.batW, SLOT.batH);
    bat.unitKey = key;
    reel.strip.add(bat);
  });
};

/* Only the bats at least partly inside a window are drawn. */
window.SlotScene.prototype.update = function () {
  var reach = (SLOT.windowH / 2) + (SLOT.batH / 2);

  this.reels.forEach(function (reel) {
    reel.strip.list.forEach(function (bat) {
      bat.setVisible(Math.abs(reel.strip.y + bat.y - SLOT.windowY) < reach);
    });
  });
};

/* -------------------------------------------------------------------------
   THE LEVER - pull it (or press SPIN)
   ------------------------------------------------------------------------- */
window.SlotScene.prototype.buildLever = function () {
  var self = this;
  var x = SLOT.leverX;
  var pivotY = SLOT.windowY + 20;

  this.add.rectangle(x - 24, pivotY, 26, 54, 0x3a1f48).setStrokeStyle(2, 0xffd24a, 0.8);
  this.leverStick = this.add.rectangle(x, pivotY, 10, 110, 0xc9c2d9).setOrigin(0.5, 1);
  this.leverKnob = this.add.circle(x, pivotY - 110, 17, 0xd8342c).setStrokeStyle(2, 0x5a0f0b);

  [this.leverStick, this.leverKnob].forEach(function (part) {
    part.setInteractive({ useHandCursor: true });
    window.Touch.pad(part, 10);
    part.on('pointerdown', function () { self.pull(); });
  });
};

window.SlotScene.prototype.pullLeverDown = function () {
  var pivotY = SLOT.windowY + 20;
  this.tweens.add({ targets: this.leverStick, scaleY: -0.7, duration: 160, yoyo: true, ease: 'Quad.easeIn' });
  this.tweens.add({ targets: this.leverKnob, y: pivotY + 77, duration: 160, yoyo: true, ease: 'Quad.easeIn' });
};

/* -------------------------------------------------------------------------
   A SPIN. The prize is decided and paid FIRST; the reels just show it.
   ------------------------------------------------------------------------- */
window.SlotScene.prototype.pull = function () {
  var self = this;
  var c = window.CASINO;

  if (this.spinning) {
    return;
  }

  var prize = window.Casino.spin(Math.random);
  if (!prize) {
    this.say('Not enough suns to spin - it costs ' + c.spinCost + ' ☀.', '#ff9a8a');
    return;
  }

  this.spinning = true;
  this.spinButton.text.setAlpha(0.45);
  this.say('Spinning...', '#b9a9e8');
  this.pullLeverDown();
  this.lightTimer.delay = 60;

  var line = window.Casino.reelsFor(prize, Math.random);
  var bats = window.Casino.reelBats();
  var stopped = 0;

  this.reels.forEach(function (reel, i) {
    // A long run of random bats, ending on this reel's part of the line.
    var run = 16 + (i * 6);
    var strip = [reel.strip.list[1] ? reel.strip.list[1].unitKey : bats[0]];
    var k;
    for (k = 0; k < run; k++) {
      strip.push(bats[Math.floor(Math.random() * bats.length)]);
    }
    strip.push(line[i]);

    self.fillStrip(reel, strip);

    self.tweens.add({
      targets: reel.strip,
      y: SLOT.windowY + ((strip.length - 1) * SLOT.spacing),
      duration: (c.slot.spinSeconds + (i * c.slot.stopGap)) * 1000,
      ease: 'Cubic.easeOut',
      onComplete: function () {
        // A little bump as it stops, then tidy the strip down to three bats.
        self.fillStrip(reel, [line[i]]);
        self.tweens.add({ targets: reel.strip, y: SLOT.windowY + 6, duration: 70, yoyo: true });
        stopped += 1;
        if (stopped === self.reels.length) {
          self.finish(prize, line);
        }
      }
    });
  });
};

window.SlotScene.prototype.finish = function (prize, line) {
  var self = this;

  this.spinning = false;
  this.spinButton.text.setAlpha(1);
  this.lightTimer.delay = 160;
  this.showMoney();

  if (!prize.reel) {
    this.say('No line this time... (a spin only ever costs the spin)', '#ff9a8a');
    return;
  }

  var name = window.Casino.lookOf(line[0]).name;
  var jackpot = prize === window.CASINO.prizes[window.CASINO.prizes.length - 1];

  this.say((jackpot ? 'JACKPOT!!! ' : '') + 'Three ' + name + 's!  ' +
    this.prizeWords(prize) + ' in your bag.', '#7ee08f');

  // Flash every bulb, and the winning line.
  this.flashLights(jackpot ? 12 : 5);
  this.reels.forEach(function (reel) {
    var bat = reel.strip.list[1];
    self.tweens.add({ targets: bat, scale: bat.scale * 1.15, duration: 180, yoyo: true, repeat: 2 });
  });

  if (jackpot) {
    this.sunShower();
  }
};

window.SlotScene.prototype.prizeWords = function (prize) {
  var parts = [];
  if (prize.potion) { parts.push(prize.potion + (prize.potion === 1 ? ' potion' : ' potions')); }
  if (prize.fruit) { parts.push(prize.fruit + ' fruit'); }
  return parts.join(' and ');
};

/* -------------------------------------------------------------------------
   Lights and sparkle
   ------------------------------------------------------------------------- */
window.SlotScene.prototype.stepLights = function () {
  var step = this.lightStep;
  this.bulbs.forEach(function (bulb, i) {
    bulb.fillColor = ((i + step) % 3 === 0) ? SLOT.bulbOn : SLOT.bulbOff;
  });
  this.lightStep = (step + 1) % 3;
};

window.SlotScene.prototype.flashLights = function (times) {
  var self = this;
  this.lightTimer.paused = true;
  this.time.addEvent({
    delay: 120, repeat: (times * 2) - 1,
    callback: function () {
      var on = self.bulbs[0].fillColor !== SLOT.bulbOn;
      self.bulbs.forEach(function (bulb) { bulb.fillColor = on ? SLOT.bulbOn : SLOT.bulbOff; });
    }
  });
  this.time.delayedCall(times * 240 + 60, function () { self.lightTimer.paused = false; });
};

/* The jackpot: suns pour down the screen. */
window.SlotScene.prototype.sunShower = function () {
  var cfg = window.CONFIG;
  var self = this;
  var n;

  for (n = 0; n < 40; n++) {
    var sun = this.add.text(Phaser.Math.Between(20, cfg.screen.width - 20), -30 - (n * 12), '☀', {
      fontFamily: cfg.text.fontFamily, fontSize: Phaser.Math.Between(18, 34) + 'px', color: '#ffd24a'
    }).setOrigin(0.5).setDepth(10);

    self.tweens.add({
      targets: sun,
      y: cfg.screen.height + 40,
      angle: Phaser.Math.Between(-180, 180),
      duration: Phaser.Math.Between(1300, 2200),
      delay: n * 25,
      onComplete: function (tween, targets) { targets[0].destroy(); }
    });
  }
};

/* -------------------------------------------------------------------------
   Small pieces
   ------------------------------------------------------------------------- */
window.SlotScene.prototype.showMoney = function () {
  var state = window.Progress.load();
  this.moneyText.setText('☀ ' + state.suns + ' suns      ' +
    state.bag.potion + ' potions      ' + state.bag.fruit + ' fruit');
};

window.SlotScene.prototype.say = function (words, color) {
  this.messageText.setText(words).setColor(color);
};

/* Back to the casino, still on the way to the same battle. */
window.SlotScene.prototype.leave = function () {
  this.scene.start('CasinoScene', { then: this.then, batsBefore: this.batsBefore });
};

/* The casino's buttons, shared so the two screens match. */
window.SlotScene.prototype.makeButton = function () {
  var button = window.CasinoScene.prototype.makeButton.apply(this, arguments);
  button.box.setDepth(5);
  button.text.setDepth(6);
  return button;
};
