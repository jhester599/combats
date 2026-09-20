/* =========================================================================
   DOC CHECK - is the documentation still TRUE?
   =========================================================================
   Run it with Node:

       node tools/doc-check.js

   This project's documents are not decoration. DESIGN.md and DECISIONS.md are
   the shared memory between a dad, a nine-year-old and whoever picks the code up
   next, and a number that is quietly wrong in them is worse than no number at
   all - it gets believed.

   The trouble is that the docs quote the data: fortress sizes, bat stats, which
   bug lives where. Change a number in data/ and a sentence somewhere becomes a
   lie, silently, with nothing failing.

   So this reads the REAL data files and checks the documents against them.

   What it checks:
     1. every unit's stats row in DESIGN.md matches data/units.js
     2. every cave's fortress and base HP quoted anywhere matches data/levels.js
     3. every .js file in the project is mentioned in README.md's file map
     4. index.html actually loads every data/ and src/ file that exists
     5. the homework question numbers have no gaps
     6. every [TO DECIDE] marker in DESIGN.md is also open in its §13 index

   It found two real mistakes the day it was written: a fortress that had been
   changed to 1500 while the cave table still said 2100, and a claim that the
   Scout Bat had a walk cycle months after the redraw removed it.

   It is a TESTING TOOL ONLY. The game never loads it.
   ========================================================================= */

var path = require('path');
var fs = require('fs');
var root = path.join(__dirname, '..');

global.window = {};
require(path.join(root, 'data/config.js'));
require(path.join(root, 'data/units.js'));
require(path.join(root, 'data/levels.js'));
require(path.join(root, 'data/items.js'));
require(path.join(root, 'src/systems/caves.js'));

var W = global.window;

var DOCS = ['DESIGN.md', 'DECISIONS.md', 'README.md', 'HOMEWORK.md',
  'HOMEWORK_BACKLOG.md', 'ASSETS.md'];

var docs = {};
DOCS.forEach(function (f) { docs[f] = fs.readFileSync(path.join(root, f), 'utf8'); });

var problems = [];

function flag(where, what) {
  problems.push({ where: where, what: what });
}

function escapeForRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* Every markdown row in 'text' whose first cell is exactly this bolded name. */
function rowsNaming(text, name) {
  var re = new RegExp('\\|\\s*\\*\\*' + escapeForRegex(name) + '\\*\\*\\s*\\|([^\\n]*)', 'g');
  var rows = [];
  var m;

  while ((m = re.exec(text)) !== null) { rows.push(m[1]); }

  return rows;
}

/* The plain numbers in one markdown row. */
function numbersIn(row) {
  return row.split('|')
    .map(function (c) { return c.trim().replace(/\*\*/g, ''); })
    .filter(function (c) { return /^\d+(\.\d+)?s?$/.test(c); })
    .map(parseFloat);
}

/* --- 1. unit stats ---------------------------------------------------- */
Object.keys(W.UNITS).forEach(function (key) {
  var unit = W.UNITS[key];

  // A unit's name turns up in prose tables too ("Cave Critter | Mosquito |
  // small, quick..."), so the stats row is the one carrying the most numbers.
  var best = null;
  var mostNumbers = [];

  rowsNaming(docs['DESIGN.md'], unit.name).forEach(function (row) {
    var nums = numbersIn(row);
    if (nums.length > mostNumbers.length) { mostNumbers = nums; best = row; }
  });

  if (!best) {
    flag('DESIGN.md', 'no stats row at all for ' + unit.name);
    return;
  }

  [['hp', unit.hp], ['attack', unit.attack], ['range', unit.range], ['speed', unit.speed]]
    .forEach(function (pair) {
      if (mostNumbers.indexOf(pair[1]) === -1) {
        flag('DESIGN.md', unit.name + ': ' + pair[0] + ' should be ' + pair[1] +
          '  (row reads:' + best.replace(/\s+/g, ' ').replace(/\s*$/, '') + ')');
      }
    });
});

/* --- 2. cave HP quoted in any document -------------------------------- */
W.Caves.all().forEach(function (key) {
  var level = W.LEVELS[key];

  DOCS.forEach(function (f) {
    rowsNaming(docs[f], level.name).forEach(function (row) {
      // Only rows that quote a big number are making a claim about HP.
      var big = (row.match(/\b\d{4}\b/g) || []).map(Number);

      if (!big.length) { return; }

      if (big.indexOf(level.enemyBaseHp) === -1 && big.indexOf(level.playerBaseHp) === -1) {
        flag(f, level.name + ': quotes ' + big.join('/') + ' but the fortress is ' +
          level.enemyBaseHp + ' and the base is ' + level.playerBaseHp);
      }
    });
  });
});

/* --- 3. README's file map --------------------------------------------- */
var CODE_DIRS = ['data', 'src/systems', 'src/scenes', 'src/entities', 'tools'];

CODE_DIRS.forEach(function (dir) {
  fs.readdirSync(path.join(root, dir))
    .filter(function (f) { return f.endsWith('.js'); })
    .forEach(function (f) {
      if (docs['README.md'].indexOf(f) === -1) {
        flag('README.md', 'never mentions ' + dir + '/' + f);
      }
    });
});

/* --- 4. index.html loads everything ----------------------------------- */
var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

CODE_DIRS.filter(function (d) { return d !== 'tools'; }).forEach(function (dir) {
  fs.readdirSync(path.join(root, dir))
    .filter(function (f) { return f.endsWith('.js'); })
    .forEach(function (f) {
      if (html.indexOf(dir + '/' + f) === -1) {
        flag('index.html', 'does NOT load ' + dir + '/' + f + ' - the game will not see it');
      }
    });
});

/* --- 5. no gaps in the question numbering ----------------------------- */
var seen = {};

DOCS.forEach(function (f) {
  (docs[f].match(/\bB\d+\b/g) || []).forEach(function (q) { seen[q] = true; });
});

var highest = Object.keys(seen).reduce(function (most, q) {
  return Math.max(most, parseInt(q.slice(1), 10));
}, 0);

var i;
for (i = 1; i <= highest; i++) {
  if (!seen['B' + i]) {
    flag('homework', 'B' + i + ' is never mentioned anywhere, but B' + highest + ' exists');
  }
}

/* --- 6. open questions appear in the §13 index ------------------------ */
var openInIndex = {};

(docs['DESIGN.md'].match(/^\| B\d+ \|[^\n]*$/gm) || []).forEach(function (row) {
  var q = (row.match(/B\d+/) || [])[0];

  // 🔲 = untouched, ⚠️ = answered but the work is not finished. Both are open.
  if (q && (/🔲/.test(row) || /⚠️/.test(row))) { openInIndex[q] = true; }
});

(docs['DESIGN.md'].match(/\[TO DECIDE\][^\n]*\*\(B\d+/g) || []).forEach(function (marker) {
  var q = (marker.match(/B\d+/) || [])[0];

  if (q && !openInIndex[q]) {
    flag('DESIGN.md', q + ' is marked [TO DECIDE] in the body, but §13 does not list it as open');
  }
});

/* --- report ------------------------------------------------------------ */
console.log('');

if (!problems.length) {
  console.log('  DOC CHECK: every number the documents quote matches the data.');
  console.log('');
  process.exit(0);
}

console.log('  DOC CHECK - ' + problems.length + ' thing(s) have drifted:');
console.log('');

problems.forEach(function (p) {
  console.log('  [' + p.where + ']  ' + p.what);
});

console.log('');
process.exit(1);
