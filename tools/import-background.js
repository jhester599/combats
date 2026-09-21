#!/usr/bin/env node
/* =========================================================================
   import-background.js - put a cave painting into the game
   =========================================================================
   Takes a picture somebody drew, makes it the right size for the game, works
   out WHERE ITS GROUND IS, and writes it into assets/bg/.

     node tools/import-background.js <picture> --cave <caveKey>

   Options:
     --cave <key>    which cave it belongs to. Must match a key in
                     data/levels.js, e.g. pyramid, saharaDesert, level1
     --ground <n>    where the bats stand, as a fraction of the picture's
                     height. Leave it out and the tool guesses, then you nudge
                     the number in data/backgrounds.js until it looks right
     --width <px>    the widest the saved picture will be (default 1280). The
                     game is only 960 across, so 1280 is crisp with room spare
     --quality <n>   webp quality 0-1 (default 0.85)
     --force         overwrite an existing picture for that cave

   ------------------- WHY THIS NEEDS A BROWSER -------------------
   Unlike every other tool here, this one is NOT dependency-free: it drives a
   headless Chromium to decode and re-encode the picture, because reading a
   painted webp without an image library is not a sensible thing to write by
   hand. It looks for Playwright's Chromium, or whatever CHROME_PATH points at.

   That is fine, because this is a one-off import step. The GAME still depends
   on nothing at all, which is the rule that actually matters.

   ------------------- THE GUESS, AND WHY YOU CHECK IT -------------------
   Every one of these paintings has a flat surface to stand on and a cliff
   falling away below it. The tool looks for the sharpest place where the
   picture gets darker going down, which is usually that edge.

   It is a GUESS and it is wrong often enough to matter - on one picture it
   found the back of the floor and on another the front lip, which are a
   hundred pixels apart. Always look at the cave afterwards and nudge
   data/backgrounds.js until the bats' feet are planted.
   ========================================================================= */

var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..');

/* ------------------------------------------------------------------ args */
var args = process.argv.slice(2);
var source = null;
var cave = null;
var ground = null;
var maxWidth = 1280;
var quality = 0.85;
var force = false;
var i;

for (i = 0; i < args.length; i++) {
  if (args[i] === '--cave') { cave = args[++i]; }
  else if (args[i] === '--ground') { ground = parseFloat(args[++i]); }
  else if (args[i] === '--width') { maxWidth = parseInt(args[++i], 10); }
  else if (args[i] === '--quality') { quality = parseFloat(args[++i]); }
  else if (args[i] === '--force') { force = true; }
  else if (!source) { source = args[i]; }
}

if (!source || !cave) {
  console.error('Usage: node tools/import-background.js <picture> --cave <caveKey>');
  process.exit(1);
}

if (!fs.existsSync(source)) {
  console.error('No such picture: ' + source);
  process.exit(1);
}

/* The cave has to be real, or the picture would never be shown. */
global.window = {};
require(path.join(root, 'data/config.js'));
require(path.join(root, 'data/levels.js'));

if (!global.window.LEVELS[cave]) {
  console.error('No cave called "' + cave + '" in data/levels.js.');
  console.error('Caves: ' + Object.keys(global.window.LEVELS).join(', '));
  process.exit(1);
}

var destination = path.join(root, 'assets/bg', cave + '.webp');

if (fs.existsSync(destination) && !force) {
  console.error(cave + ' already has a picture. Pass --force to replace it.');
  process.exit(1);
}

/* ------------------------------------------------------------ the browser */
function findChromium() {
  if (process.env.CHROME_PATH) { return process.env.CHROME_PATH; }

  var guesses = [
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'
  ];
  var base = '/opt/pw-browsers';

  if (fs.existsSync(base)) {
    fs.readdirSync(base).filter(function (d) { return d.indexOf('chromium') === 0; })
      .forEach(function (d) { guesses.push(path.join(base, d, 'chrome-linux/chrome')); });
  }

  return guesses.filter(function (g) { return fs.existsSync(g); })[0] || null;
}

function findPlaywright() {
  try { return require('playwright'); } catch (e) { /* keep looking */ }

  var scratch = process.env.SP ? path.join(process.env.SP, 'node_modules/playwright') : null;

  if (scratch && fs.existsSync(scratch)) { return require(scratch); }

  return null;
}

var playwright = findPlaywright();
var chromePath = findChromium();

if (!playwright || !chromePath) {
  console.error('');
  console.error('  This tool needs Playwright and a Chromium to decode the picture.');
  console.error('  playwright: ' + (playwright ? 'found' : 'NOT FOUND'));
  console.error('  chromium:   ' + (chromePath || 'NOT FOUND'));
  console.error('');
  console.error('  Set CHROME_PATH, or npm i playwright somewhere on the require path.');
  process.exit(1);
}

/* ------------------------------------------------------------------- run */
(async function () {
  var browser = await playwright.chromium.launch({ executablePath: chromePath });
  var page = await browser.newPage();

  var type = path.extname(source).slice(1).toLowerCase();
  if (type === 'jpg') { type = 'jpeg'; }

  var b64 = fs.readFileSync(source).toString('base64');

  var result = await page.evaluate(async function (a) {
    var data = a[0], mime = a[1], maxW = a[2], q = a[3], wantGround = a[4];

    var img = new Image();
    img.src = 'data:image/' + mime + ';base64,' + data;
    await img.decode();

    var w = Math.min(maxW, img.naturalWidth);
    var h = Math.round(img.naturalHeight * w / img.naturalWidth);

    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);

    function averageStrip(y0, height) {
      var d = ctx.getImageData(0, y0, w, height).data;
      var r = 0, g = 0, b = 0, n = 0, i;
      for (i = 0; i < d.length; i += 16) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
      return [r / n, g / n, b / n].map(function (v) {
        return Math.round(v).toString(16).padStart(2, '0');
      }).join('');
    }

    /* Guess the ground: the sharpest darkening in the lower half, which is
       usually where the walkable surface gives way to the cliff below it. */
    var guess = wantGround;

    if (guess === null) {
      var rows = [];
      var y, x, sum, idx;

      for (y = 0; y < h; y++) {
        sum = 0;
        var line = ctx.getImageData(0, y, w, 1).data;
        for (x = 0; x < line.length; x += 16) {
          sum += 0.2126 * line[x] + 0.7152 * line[x + 1] + 0.0722 * line[x + 2];
        }
        rows.push(sum / Math.ceil(line.length / 16));
      }

      var span = Math.max(3, Math.round(h * 0.012));
      var best = -1, bestDrop = 0;

      for (y = Math.floor(h * 0.45); y < Math.floor(h * 0.92) - span; y++) {
        var above = 0, below = 0, k;
        for (k = 1; k <= span; k++) { above += rows[y - k] || 0; below += rows[y + k] || 0; }
        var drop = (above - below) / span;
        if (drop > bestDrop) { bestDrop = drop; best = y; }
      }

      guess = best > 0 ? +(best / h).toFixed(3) : 0.78;
    }

    return {
      width: w, height: h,
      sourceWidth: img.naturalWidth, sourceHeight: img.naturalHeight,
      ground: guess,
      skyColor: averageStrip(0, 8),
      floorColor: averageStrip(h - 8, 8),
      data: c.toDataURL('image/webp', q)
    };
  }, [b64, type, maxWidth, quality, ground]);

  await browser.close();

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, Buffer.from(result.data.split(',')[1], 'base64'));

  var kb = Math.round(fs.statSync(destination).size / 1024);

  console.log('');
  console.log('  ' + path.basename(source) + '  ' + result.sourceWidth + 'x' + result.sourceHeight +
    '  ->  assets/bg/' + cave + '.webp  ' + result.width + 'x' + result.height + '  (' + kb + 'KB)');
  console.log('');
  console.log('  Paste this into data/backgrounds.js:');
  console.log('');
  console.log('  ' + cave + ': {');
  console.log('    file: \'' + cave + '.webp\',');
  console.log('    ground: ' + result.ground.toFixed(3) + ',' +
    (ground === null ? '        // GUESSED - check it and nudge' : ''));
  console.log('    skyColor: 0x' + result.skyColor + ',');
  console.log('    floorColor: 0x' + result.floorColor);
  console.log('  },');
  console.log('');

  if (ground === null) {
    console.log('  Now PLAY that cave and look at the bats\' feet.');
    console.log('    feet floating above the ground?  make ground BIGGER');
    console.log('    feet sunk into the ground?       make ground SMALLER');
    console.log('  About 0.01 is six pixels on screen.');
    console.log('');
  }
}());
