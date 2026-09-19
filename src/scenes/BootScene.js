/* =========================================================================
   BOOT SCENE - gets everything ready, then hands over to the menu
   =========================================================================
   Two jobs:

   1. Load any real art files that exist in /assets. (Right now there are
      none, so this finishes instantly - that is fine and expected.)

   2. DRAW THE PLACEHOLDER ART. Until we have real bat drawings, the game
      paints its own sprite sheets at start-up, using the exact frame layout
      each unit asks for in data/units.js.

      This matters: the placeholder is a REAL sprite sheet with real
      animations, so swapping in a downloaded sprite sheet later is just
      "load the file instead of drawing it" - nothing else changes.
   ========================================================================= */

window.BootScene = function () {
  Phaser.Scene.call(this, { key: 'BootScene' });
};

window.BootScene.prototype = Object.create(Phaser.Scene.prototype);
window.BootScene.prototype.constructor = window.BootScene;

/* ------------------------------------------------------------------------- */
window.BootScene.prototype.preload = function () {
  this.showLoadingBar();

  /* REAL ART.
     One line per unit that has a real picture. Any unit NOT listed here gets
     placeholder art drawn for it in create() instead - that happens
     automatically, there is no list to keep in step.

     The frame size must match that unit's anims.frameWidth/frameHeight in
     data/units.js. tools/pack-spritesheet.js prints the exact line to paste.
     Remember to credit every picture in ASSETS.md. */

  this.load.spritesheet('scoutBat', 'assets/sprites/scoutBat.png', {
    frameWidth: 150, frameHeight: 64
  });

  this.load.spritesheet('bruteBat', 'assets/sprites/bruteBat.png', {
    frameWidth: 132, frameHeight: 64
  });

  this.load.spritesheet('necroBat', 'assets/sprites/necroBat.png', {
    frameWidth: 100, frameHeight: 64
  });
};

/* -------------------------------------------------------------------------
   A simple loading bar. It appears even when there is nothing to load, so we
   can see that the engine started up correctly.
   ------------------------------------------------------------------------- */
window.BootScene.prototype.showLoadingBar = function () {
  var cfg = window.CONFIG;
  var centreX = cfg.screen.width / 2;
  var centreY = cfg.screen.height / 2;

  this.add.text(centreX, centreY - 50, 'BATTLE BATS', {
    fontFamily: cfg.text.fontFamily,
    fontSize: '34px',
    color: '#ffd24a'
  }).setOrigin(0.5);

  var barWidth = 320;

  this.add.rectangle(centreX, centreY + 20, barWidth, 22, 0x000000, 0.5);

  var fill = this.add.rectangle(
    centreX - (barWidth / 2), centreY + 20, 1, 22, 0xffd24a
  ).setOrigin(0, 0.5);

  this.load.on('progress', function (value) {
    fill.width = barWidth * value;
  });

  this.loadingFill = fill;
  this.loadingBarWidth = barWidth;
};

/* ------------------------------------------------------------------------- */
window.BootScene.prototype.create = function () {
  // Draw a placeholder sheet for every unit that does not already have art.
  var unitKeys = Object.keys(window.UNITS);
  var i;
  var def;

  for (i = 0; i < unitKeys.length; i++) {
    def = window.UNITS[unitKeys[i]];

    if (!this.textures.exists(def.sprite)) {
      this.drawPlaceholderSheet(def);
    }
  }

  // Now build the animations. This reads straight from data/units.js, so
  // changing a frameRate there changes the game with no code edits.
  for (i = 0; i < unitKeys.length; i++) {
    this.createAnimations(unitKeys[i], window.UNITS[unitKeys[i]]);
  }

  if (this.loadingFill) {
    this.loadingFill.width = this.loadingBarWidth;
  }

  this.scene.start('MenuScene');
};

/* -------------------------------------------------------------------------
   Turn one unit's "anims" block into real Phaser animations.
   Every animation is named  unitKey + '_' + animName,  e.g. 'scoutBat_walk'.
   ------------------------------------------------------------------------- */
window.BootScene.prototype.createAnimations = function (unitKey, def) {
  var animNames = ['idle', 'walk', 'attack', 'death'];
  var i;
  var name;
  var layout;

  for (i = 0; i < animNames.length; i++) {
    name = animNames[i];
    layout = def.anims[name];

    if (!layout) {
      continue;
    }

    this.anims.create({
      key: unitKey + '_' + name,
      frames: this.anims.generateFrameNumbers(def.sprite, {
        start: layout.start,
        end: layout.end
      }),
      frameRate: layout.frameRate,
      repeat: layout.repeat
    });
  }
};

/* =========================================================================
   PLACEHOLDER SPRITE SHEET PAINTER
   =========================================================================
   Draws a horizontal strip of frames onto a canvas, then slices it into
   numbered frames exactly like a downloaded sprite sheet.

   The shape is a simple bat: a round body, two flapping wings, two eyes.
   Attack frames lunge forward and show a fang. Death frames topple over.
   ========================================================================= */
window.BootScene.prototype.drawPlaceholderSheet = function (def) {
  var art = window.CONFIG.placeholderArt;
  var layout = def.anims;

  var frameWidth = layout.frameWidth;
  var frameHeight = layout.frameHeight;

  // The sheet must be long enough for the highest frame number any of the
  // animations asks for.
  var totalFrames = this.countFrames(layout);

  var texture = this.textures.createCanvas(
    def.sprite, frameWidth * totalFrames, frameHeight
  );
  var ctx = texture.getContext();

  var i;

  for (i = 0; i < totalFrames; i++) {
    ctx.save();
    ctx.translate(i * frameWidth, 0);

    this.drawOneFrame(ctx, def, art, i, frameWidth, frameHeight);

    ctx.restore();
  }

  // Slice the strip into numbered frames: 0, 1, 2, ...
  for (i = 0; i < totalFrames; i++) {
    texture.add(i, 0, i * frameWidth, 0, frameWidth, frameHeight);
  }

  texture.refresh();   // push the drawing to the graphics card
};

/* How many frames does this unit's sheet need? */
window.BootScene.prototype.countFrames = function (layout) {
  var animNames = ['idle', 'walk', 'attack', 'death'];
  var highest = 0;
  var i;

  for (i = 0; i < animNames.length; i++) {
    if (layout[animNames[i]] && layout[animNames[i]].end > highest) {
      highest = layout[animNames[i]].end;
    }
  }

  return highest + 1;
};

/* Which animation does frame number 'index' belong to, and how far through
   that animation is it (0 to 1)? */
window.BootScene.prototype.describeFrame = function (layout, index) {
  var animNames = ['idle', 'walk', 'attack', 'death'];
  var i;
  var a;
  var span;

  for (i = 0; i < animNames.length; i++) {
    a = layout[animNames[i]];

    if (a && index >= a.start && index <= a.end) {
      span = a.end - a.start;

      return {
        name: animNames[i],
        progress: (span === 0) ? 0 : (index - a.start) / span
      };
    }
  }

  return { name: 'idle', progress: 0 };
};

/* ------------------------------------------------------------------------- */
window.BootScene.prototype.drawOneFrame = function (ctx, def, art, index, w, h) {
  var info = this.describeFrame(def.anims, index);

  var centreX = w / 2;
  var groundY = h - 4;           // the feet line
  var bodyRadius = w * 0.22;   // bigger = chunkier bat, fills more of the frame

  var lift = 0;        // bob up and down
  var lunge = 0;       // shove forward when attacking
  var tilt = 0;        // fall over when dying
  var alpha = 1;
  var flap = 0.5;      // 0 = wings down, 1 = wings up

  if (info.name === 'idle') {
    flap = 0.35 + (0.2 * info.progress);
    lift = 2 * info.progress;

  } else if (info.name === 'walk') {
    // A full flap cycle across the walk frames.
    flap = 0.5 + (0.5 * Math.sin(info.progress * Math.PI * 2));
    lift = 4 * Math.sin(info.progress * Math.PI * 2);

  } else if (info.name === 'attack') {
    // Wind up, then strike.
    lunge = (info.progress < 0.5)
      ? -w * 0.06 * (info.progress * 2)
      : w * 0.16 * ((info.progress - 0.5) * 2);
    flap = 0.9;
    lift = 3;

  } else if (info.name === 'death') {
    tilt = info.progress * (Math.PI / 2);
    lift = -info.progress * (h * 0.18);
    alpha = 1 - (info.progress * 0.55);
    flap = 0.1;
  }

  ctx.globalAlpha = alpha;
  ctx.translate(centreX + lunge, groundY - bodyRadius - 6 - lift);
  ctx.rotate(tilt);

  this.drawWings(ctx, def, art, bodyRadius, flap);
  this.drawBody(ctx, def, art, bodyRadius);
  this.drawFace(ctx, art, bodyRadius, info.name);

  ctx.globalAlpha = 1;
};

/* Two triangle wings that flap. */
window.BootScene.prototype.drawWings = function (ctx, def, art, r, flap) {
  var spread = r * 2.0;
  var wingTop = -r * (0.4 + flap * 1.3);
  var wingBottom = r * (1.1 - flap * 0.8);
  var side;
  var s;

  ctx.globalAlpha = ctx.globalAlpha * art.wingAlpha;
  ctx.fillStyle = def.color;
  ctx.strokeStyle = art.outlineColor;
  ctx.lineWidth = 2;

  for (side = 0; side < 2; side++) {
    s = (side === 0) ? -1 : 1;

    ctx.beginPath();
    ctx.moveTo(s * r * 0.5, -r * 0.1);
    ctx.lineTo(s * spread, wingTop);
    ctx.lineTo(s * spread * 0.8, wingBottom);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.globalAlpha = ctx.globalAlpha / art.wingAlpha;
};

/* The round body plus two ears. */
window.BootScene.prototype.drawBody = function (ctx, def, art, r) {
  ctx.fillStyle = def.color;
  ctx.strokeStyle = art.outlineColor;
  ctx.lineWidth = 2;

  // Ears.
  var side;
  var s;

  for (side = 0; side < 2; side++) {
    s = (side === 0) ? -1 : 1;

    ctx.beginPath();
    ctx.moveTo(s * r * 0.55, -r * 0.55);
    ctx.lineTo(s * r * 0.85, -r * 1.7);
    ctx.lineTo(s * r * 0.1, -r * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Body.
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
};

/* Eyes, and a fang while attacking. */
window.BootScene.prototype.drawFace = function (ctx, art, r, animName) {
  var side;
  var s;

  for (side = 0; side < 2; side++) {
    s = (side === 0) ? -1 : 1;

    ctx.fillStyle = art.eyeColor;
    ctx.beginPath();
    ctx.arc(s * r * 0.36, -r * 0.18, r * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = art.pupilColor;
    ctx.beginPath();
    ctx.arc(s * r * 0.42, -r * 0.18, r * 0.11, 0, Math.PI * 2);
    ctx.fill();
  }

  if (animName === 'attack') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, r * 0.25);
    ctx.lineTo(r * 0.18, r * 0.25);
    ctx.lineTo(0, r * 0.72);
    ctx.closePath();
    ctx.fill();
  }
};
