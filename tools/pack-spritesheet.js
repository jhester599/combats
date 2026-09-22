#!/usr/bin/env node
/* =========================================================================
   pack-spritesheet.js - turn a folder of animation frames into one sprite
                         sheet the game can use
   =========================================================================
   Art tools (PixelLab, Aseprite, itch.io packs...) hand you frames in all
   sorts of shapes. ComBats wants ONE png per unit: every frame in a
   single row, left to right, all the same size, in this order:

       idle ... walk ... attack ... death

   This tool does that, and then prints the exact block of numbers to paste
   into data/units.js so the frames line up.

   It has NO dependencies - nothing to install. Just Node.

   ----------------------------------------------------------------- USAGE
     node tools/pack-spritesheet.js <folder> [options]

     --out <path>    where to write the png
                     (default: assets/sprites/<folder name>.png)
     --key <name>    the unit key in data/units.js (default: folder name)
     --order <list>  which animations, in order
                     (default: idle,walk,attack,death)
     --frame <size>  the size of ONE frame, e.g. --frame 64 or --frame 48x64.
                     Use this when an animation is a single image holding a
                     GRID of frames (PixelLab exports a 4x4 grid of 64x64
                     frames as one 256x256 png). Frames are read left to
                     right, then top to bottom.
     --pad           if frames are different sizes, grow them all to the
                     biggest instead of stopping with an error. Frames are
                     centred left-to-right and sat on the BOTTOM edge, because
                     that is where the game plants a bat's feet.
     --force         overwrite the output file if it already exists

   -------------------------------------------------- WHAT IT LOOKS FOR
   Either a subfolder per animation:

       my-bat/idle/0.png  my-bat/idle/1.png  my-bat/walk/0.png  ...

   or flat files whose names start with the animation:

       my-bat/idle_01.png  my-bat/walk-3.png  my-bat/attack1.png  ...

   or one wide strip per animation, which gets sliced into squares:

       my-bat/walk.png     (a 192x48 image = four 48x48 frames)

   or one GRID per animation, with --frame telling it the cell size:

       my-bat/walk.png     (a 256x256 image + --frame 64 = sixteen frames)
   ========================================================================= */

var fs = require('fs');
var path = require('path');
var png = require('./png.js');

var ANIM_DEFAULTS = {
  idle:   { frameRate: 4,  repeat: -1 },
  walk:   { frameRate: 10, repeat: -1 },
  attack: { frameRate: 12, repeat: 0 },
  death:  { frameRate: 9,  repeat: 0 }
};

/* ---------------------------------------------------------------- options */

function parseArgs(argv) {
  var opts = { order: ['idle', 'walk', 'attack', 'death'], pad: false, force: false };
  var rest = [];
  var i;

  for (i = 0; i < argv.length; i++) {
    if (argv[i] === '--pad') {
      opts.pad = true;
    } else if (argv[i] === '--force') {
      opts.force = true;
    } else if (argv[i] === '--out') {
      opts.out = argv[++i];
    } else if (argv[i] === '--key') {
      opts.key = argv[++i];
    } else if (argv[i] === '--frame') {
      opts.frame = parseFrameSize(argv[++i]);
    } else if (argv[i] === '--order') {
      opts.order = argv[++i].split(',').map(function (s) { return s.trim(); });
    } else if (argv[i].charAt(0) === '-') {
      throw new Error('Unknown option: ' + argv[i]);
    } else {
      rest.push(argv[i]);
    }
  }

  opts.input = rest[0];
  return opts;
}

/* "64" or "48x64" -> { width, height } */
function parseFrameSize(text) {
  var m = /^(\d+)(?:[xX](\d+))?$/.exec(String(text || '').trim());

  if (!m) {
    throw new Error('--frame wants a size like 64 or 48x64, not "' + text + '"');
  }

  var w = parseInt(m[1], 10);
  var h = m[2] ? parseInt(m[2], 10) : w;

  if (w < 1 || h < 1) {
    throw new Error('--frame size must be at least 1x1');
  }

  return { width: w, height: h };
}

/* "walk2.png" must come before "walk10.png", so compare digits as numbers. */
function naturalCompare(a, b) {
  var re = /(\d+)|(\D+)/g;
  var ax = String(a).match(re) || [];
  var bx = String(b).match(re) || [];
  var i;

  for (i = 0; i < Math.max(ax.length, bx.length); i++) {
    if (ax[i] === undefined) { return -1; }
    if (bx[i] === undefined) { return 1; }

    var an = parseInt(ax[i], 10);
    var bn = parseInt(bx[i], 10);

    if (!isNaN(an) && !isNaN(bn)) {
      if (an !== bn) { return an - bn; }
    } else if (ax[i] !== bx[i]) {
      return ax[i] < bx[i] ? -1 : 1;
    }
  }

  return 0;
}

function isPng(name) {
  return /\.png$/i.test(name);
}

/* ------------------------------------------------------- finding the frames */

function findFrameFiles(dir, animName) {
  var sub = path.join(dir, animName);

  // Shape 1: a subfolder named after the animation.
  if (fs.existsSync(sub) && fs.statSync(sub).isDirectory()) {
    return fs.readdirSync(sub).filter(isPng).sort(naturalCompare)
      .map(function (f) { return path.join(sub, f); });
  }

  // Shape 2 & 3: flat files whose name starts with the animation name.
  return fs.readdirSync(dir).filter(function (f) {
    if (!isPng(f)) { return false; }
    var base = path.basename(f, path.extname(f)).toLowerCase();
    // "walk", "walk1", "walk_01", "walk-3" - but NOT "walkers"
    return base === animName || new RegExp('^' + animName + '[^a-z]').test(base);
  }).sort(naturalCompare).map(function (f) { return path.join(dir, f); });
}

/* Cut a single image into a grid of cells, left to right then top to bottom. */
function sliceGrid(img, frame, label, animName) {
  if (img.width % frame.width !== 0 || img.height % frame.height !== 0) {
    throw new Error(
      label + ' is ' + img.width + 'x' + img.height + ', which does not divide\n' +
      '  evenly into ' + frame.width + 'x' + frame.height + ' frames.\n' +
      '  Check the --frame size matches what the art tool exported.'
    );
  }

  var cols = img.width / frame.width;
  var rows = img.height / frame.height;
  var out = [];
  var r;
  var c;

  for (r = 0; r < rows; r++) {
    for (c = 0; c < cols; c++) {
      out.push({
        file: label + ' [row ' + r + ', col ' + c + ']',
        image: png.crop(img, c * frame.width, r * frame.height, frame.width, frame.height)
      });
    }
  }

  console.log('  ' + animName + ': sliced ' + label + ' into a ' + cols + 'x' + rows +
              ' grid = ' + out.length + ' frames');

  return out;
}

/* Load files for one animation, slicing a strip or grid if that is what it is. */
function loadFrames(files, animName, frame) {
  var images = files.map(function (f) {
    try {
      return { file: f, image: png.decode(fs.readFileSync(f)) };
    } catch (e) {
      throw new Error('Could not read ' + f + '\n  ' + e.message);
    }
  });

  // One file plus an explicit --frame size means it is a grid (or a strip -
  // a strip is just a grid one row tall).
  if (images.length === 1 && frame) {
    return sliceGrid(images[0].image, frame,
                     path.basename(images[0].file), animName);
  }

  // No --frame given: one file much wider than tall, by a whole number of
  // squares, is a strip of square frames.
  if (images.length === 1) {
    var img = images[0].image;

    if (img.width > img.height && img.width % img.height === 0) {
      var count = img.width / img.height;
      var out = [];
      var i;

      for (i = 0; i < count; i++) {
        out.push({
          file: images[0].file + ' [frame ' + i + ']',
          image: png.crop(img, i * img.height, 0, img.height, img.height)
        });
      }

      console.log('  ' + animName + ': sliced ' + path.basename(images[0].file) +
                  ' into ' + count + ' square frames');
      return out;
    }
  }

  return images;
}

/* ------------------------------------------------------------------ sizing */

function measure(all) {
  var maxW = 0;
  var maxH = 0;
  var sizes = {};

  all.forEach(function (f) {
    maxW = Math.max(maxW, f.image.width);
    maxH = Math.max(maxH, f.image.height);
    sizes[f.image.width + 'x' + f.image.height] = true;
  });

  return { width: maxW, height: maxH, distinct: Object.keys(sizes) };
}

/* Grow a frame to the sheet size: centred across, sitting on the bottom. */
function padFrame(image, width, height) {
  var out = png.blank(width, height);
  png.blit(out, image, Math.floor((width - image.width) / 2), height - image.height);
  return out;
}

/* -------------------------------------------------------------------- main */

function main() {
  var opts;

  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    fail(e.message);
  }

  if (!opts.input) {
    // Print the usage block from the comment at the top of this file,
    // keeping its shape (strip the leading "   " the comment adds, no more).
    console.log(fs.readFileSync(__filename, 'utf8')
      .split('USAGE')[1].split('*/')[0]
      .replace(/^ {3}/gm, '')
      .replace(/^-+\n/gm, ''));
    process.exit(1);
  }

  if (!fs.existsSync(opts.input) || !fs.statSync(opts.input).isDirectory()) {
    fail('No such folder: ' + opts.input);
  }

  var name = opts.key || path.basename(path.resolve(opts.input));
  var outPath = opts.out || path.join('assets', 'sprites', name + '.png');

  if (fs.existsSync(outPath) && !opts.force) {
    fail('Output already exists: ' + outPath + '\n  Use --force to overwrite it.');
  }

  console.log('\nReading frames from ' + opts.input);

  // --- gather every animation's frames -----------------------------------
  var groups = [];
  var missing = [];

  opts.order.forEach(function (animName) {
    var files = findFrameFiles(opts.input, animName);

    if (files.length === 0) {
      missing.push(animName);
      return;
    }

    groups.push({ name: animName, frames: loadFrames(files, animName, opts.frame) });
  });

  if (missing.length > 0) {
    fail('Found no frames for: ' + missing.join(', ') + '\n' +
         '  Looked in ' + opts.input + ' for a subfolder per animation, or\n' +
         '  files named like "' + missing[0] + '1.png".\n' +
         describeFolder(opts.input) +
         '  If this animation genuinely does not exist, list only the ones you\n' +
         '  have, e.g.  --order ' +
         opts.order.filter(function (a) { return missing.indexOf(a) === -1; }).join(','));
  }

  var all = [];
  groups.forEach(function (g) { all = all.concat(g.frames); });

  // --- check they are all the same size ----------------------------------
  var size = measure(all);

  if (size.distinct.length > 1) {
    if (!opts.pad) {
      fail('The frames are not all the same size: ' + size.distinct.join(', ') + '\n' +
           '  A sprite sheet needs one size for every frame.\n' +
           '  Re-export them at one size, or run again with --pad to grow them\n' +
           '  all to ' + size.width + 'x' + size.height + ' (centred, sitting on the bottom).');
    }

    console.log('  --pad: growing every frame to ' + size.width + 'x' + size.height);

    all.forEach(function (f) {
      if (f.image.width !== size.width || f.image.height !== size.height) {
        f.image = padFrame(f.image, size.width, size.height);
      }
    });
  }

  // --- warn about anything that looks wrong ------------------------------
  var warnings = [];

  all.forEach(function (f) {
    if (!png.opaqueBounds(f.image)) {
      warnings.push('completely blank: ' + f.file);
    }
  });

  var bounds = contentBounds(all);

  if (bounds) {
    var slackX = size.width - bounds.width;
    var slackY = size.height - bounds.height;

    if (slackX > size.width * 0.4 || slackY > size.height * 0.4) {
      warnings.push('lots of empty space around the art (the drawing only fills ' +
                    bounds.width + 'x' + bounds.height + ' of ' +
                    size.width + 'x' + size.height + '). The bats will look small ' +
                    'in game - consider cropping tighter on export.');
    }
  }

  // --- build the sheet ---------------------------------------------------
  var sheet = png.blank(size.width * all.length, size.height);

  all.forEach(function (f, i) {
    png.blit(sheet, f.image, i * size.width, 0);
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, png.encode(sheet));

  report(outPath, sheet, size, groups, all, name, warnings);
}

/* Say what IS in the folder, so a missing-frames error is actually useful. */
function describeFolder(dir) {
  var entries = fs.readdirSync(dir);
  var folders = entries.filter(function (f) {
    return fs.statSync(path.join(dir, f)).isDirectory();
  });
  var pngs = entries.filter(isPng);

  var lines = [];

  if (folders.length > 0) {
    lines.push('  Subfolders there: ' + folders.join(', '));
  }

  if (pngs.length > 0) {
    lines.push('  .png files there: ' + pngs.slice(0, 8).join(', ') +
               (pngs.length > 8 ? ' (+' + (pngs.length - 8) + ' more)' : ''));
  }

  if (lines.length === 0) {
    lines.push('  That folder has no .png files and no subfolders at all.');
  }

  return lines.join('\n') + '\n';
}

function contentBounds(all) {
  var box = null;

  all.forEach(function (f) {
    var b = png.opaqueBounds(f.image);
    if (!b) { return; }

    if (!box) {
      box = { x: b.x, y: b.y, right: b.x + b.width, bottom: b.y + b.height };
    } else {
      box.x = Math.min(box.x, b.x);
      box.y = Math.min(box.y, b.y);
      box.right = Math.max(box.right, b.x + b.width);
      box.bottom = Math.max(box.bottom, b.y + b.height);
    }
  });

  if (!box) { return null; }

  return { x: box.x, y: box.y, width: box.right - box.x, height: box.bottom - box.y };
}

/* ------------------------------------------------------- the printed report */

function report(outPath, sheet, size, groups, all, name, warnings) {
  console.log('\nWrote ' + outPath);
  console.log('  ' + sheet.width + 'x' + sheet.height + ', ' + all.length +
              ' frames of ' + size.width + 'x' + size.height);

  var index = 0;
  var lines = [];

  groups.forEach(function (g) {
    var start = index;
    var end = index + g.frames.length - 1;
    index = end + 1;

    var d = ANIM_DEFAULTS[g.name] || { frameRate: 10, repeat: -1 };

    lines.push('      ' + (g.name + ':').padEnd(8) +
               '{ start: ' + String(start).padStart(2) +
               ', end: ' + String(end).padStart(2) +
               ', frameRate: ' + String(d.frameRate).padStart(2) +
               ', repeat: ' + String(d.repeat).padStart(2) + ' },');

    console.log('  ' + g.name.padEnd(7) + ' frames ' + start + '-' + end +
                '  (' + g.frames.length + ')');
  });

  // last line should not have a trailing comma
  lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');

  if (warnings.length > 0) {
    console.log('\nWorth a look:');
    warnings.forEach(function (w) { console.log('  ! ' + w); });
  }

  compareWithUnits(name, size);

  console.log('\n--- 1. paste this into data/units.js, replacing ' + name + "'s anims block ---\n");
  console.log('    anims: {');
  console.log('      frameWidth: ' + size.width + ',');
  console.log('      frameHeight: ' + size.height + ',');
  console.log(lines.join('\n'));
  console.log('    }');

  console.log('\n--- 2. add this to preload() in src/scenes/BootScene.js ---\n');
  console.log("    this.load.spritesheet('" + name + "', '" + outPath.split(path.sep).join('/') + "', {");
  console.log('      frameWidth: ' + size.width + ', frameHeight: ' + size.height);
  console.log('    });');

  console.log('\n--- 3. record it in ASSETS.md (author, licence, url) ---');
  console.log('\nThe placeholder art for ' + name + ' switches itself off once the');
  console.log('real texture loads. Refresh the browser and it is in the game.\n');
}

/* If the unit already exists, say what is changing. */
function compareWithUnits(name, size) {
  var unitsPath = path.join(__dirname, '..', 'data', 'units.js');

  if (!fs.existsSync(unitsPath)) { return; }

  try {
    global.window = {};
    require(unitsPath);

    var def = global.window.UNITS[name];

    if (!def) {
      console.log('\nNote: there is no unit called "' + name + '" in data/units.js yet.');
      console.log('  Add one (copy an existing block) with  sprite: \'' + name + '\'.');
      return;
    }

    var a = def.anims;

    if (a.frameWidth !== size.width || a.frameHeight !== size.height) {
      console.log('\nNote: ' + name + ' currently expects ' +
                  a.frameWidth + 'x' + a.frameHeight + ' frames, and this sheet is ' +
                  size.width + 'x' + size.height + '. The block below has the new size.');
    }
  } catch (e) {
    /* Reading units.js is a nicety - never let it break the pack. */
  }
}

function fail(message) {
  console.error('\nERROR: ' + message + '\n');
  process.exit(1);
}

main();
