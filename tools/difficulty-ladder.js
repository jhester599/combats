#!/usr/bin/env node
/* =========================================================================
   DIFFICULTY LADDER - does each cave get harder than the one before it?
   =========================================================================
   Run it with Node:

       node tools/difficulty-ladder.js

   Jeff, 2026-10-17: "make the first level easier, then ramp the difficulty
   through the levels. The first level should be easy."

   tools/balance-sim.js asks whether each cave is FAIR - can an attentive
   player win it, does every team have a chance, does the boss turn up. It
   never asked how HARD each cave is next to the others, and when somebody
   finally measured, the answer was lumpy: cave 3 was harder than caves 4 and
   5, cave 7 harder than caves 8 and 9, and cave 1 lost half its games for a
   new player.

   So this plays every cave with a BEGINNER (balance-sim's 'beginner' player):
   someone who does not watch the buttons, and every few seconds taps one bat
   they can afford, picked at random. It plays them tapping every 2, 3, 4, 5
   and 6 seconds, with every team the Locker allows and a few rolls of the
   dice, and reports how often they win. That one number is the cave's
   difficulty: 95% is a walk in the park, 20% is a real fight.

   What has to stay true (each is checked):
     * cave 1 is EASY - a beginner wins it at least 97% of the time. Jeff:
       "we want a beginner player to consistently win on level 1";
     * the first few caves climb GENTLY - each of caves 2-5 at most 6 points
       harder than the one before. Jeff: "we don't want the difficulty to
       increase too fast for the first several levels";
     * every cave is harder than the one before it - or within 3 points of
       it, because a few rolls of the dice wobble that much;
     * the last cave is still winnable by a beginner now and then.

   The lever that sets each cave's place on the ladder is its  waveStretch
   in data/levels.js (DECISIONS.md D76).

   It is a TESTING TOOL ONLY. The game never loads it.
   ========================================================================= */

var path = require('path');
var sim = require(path.join(__dirname, 'balance-sim.js'));
var W = global.window;

var TAP_EVERY = [2, 3, 4, 5, 6];   // seconds between a beginner's taps
var RUNS = 40;                     // games per tapping speed, per cave
var WOBBLE = 3;                    // points a cave may sit above the one before
var EASY = 97;                     // cave 1 must be at least this
var GENTLE_UNTIL = 5;              // caves 2..this climb gently...
var GENTLE_STEP = 6;               // ...at most this many points per cave
var NOT_HOPELESS = 5;              // the last cave must be at least this

function teamsOf(list, k) {
  if (k === 0) { return [[]]; }
  if (list.length < k) { return []; }
  var first = list[0];
  var rest = list.slice(1);
  return teamsOf(rest, k - 1).map(function (t) { return [first].concat(t); })
    .concat(teamsOf(rest, k));
}

/* How often a beginner wins this cave, 0-100. */
function beginnerWins(cave) {
  var teams = W.Team.needsLocker(cave)
    ? teamsOf(W.Team.poolFor(cave), W.Team.size())
    : [W.Team.poolFor(cave)];
  var won = 0;
  var played = 0;

  // Rolls of the dice per team: enough that every cave plays about RUNS games
  // at each speed. Cave 1 has ONE team, so it needs forty rolls; the Final
  // Stadium has 165 teams and one roll each is plenty. (Four rolls for cave 1
  // once read 100% when forty read 94%.)
  var seeds = [];
  var s;
  for (s = 1; s <= Math.max(1, Math.ceil(RUNS / teams.length)); s++) { seeds.push(s); }

  TAP_EVERY.forEach(function (every) {
    teams.forEach(function (team) {
      seeds.forEach(function (seed) {
        var r = sim.playLevel(cave, { prefer: 'beginner', tapEvery: every, seed: seed, use: team });
        played++;
        if (r.outcome === 'WIN') { won++; }
      });
    });
  });

  return Math.round((100 * won) / played);
}

var caves = W.Caves.all();
var problems = [];
var before = null;

console.log('');
console.log('  THE DIFFICULTY LADDER - how often a beginner wins each cave');
console.log('  (tapping a random bat every 2-6 seconds, every team the Locker allows)');
console.log('');

caves.forEach(function (cave, i) {
  var level = W.LEVELS[cave];
  var score = beginnerWins(cave);
  var bar = new Array(Math.round(score / 4) + 1).join('#');

  console.log('  ' + (i + 1 + '.').padEnd(4) + level.name.padEnd(22) +
    (score + '%').padStart(5) + '  ' + bar +
    '   (waveStretch ' + (level.waveStretch || 1) + ')');

  if (i === 0 && score < EASY) {
    problems.push(level.name + ' is the first cave and should be easy: a beginner wins only ' +
      score + '% (want ' + EASY + '%+)');
  }
  if (before !== null && i < GENTLE_UNTIL && score < before.score - GENTLE_STEP) {
    problems.push(level.name + ' (' + score + '%) is a big jump harder than ' + before.name +
      ' (' + before.score + '%) - caves 2-' + GENTLE_UNTIL + ' should climb at most ' +
      GENTLE_STEP + ' points each');
  }
  if (before !== null && score > before.score + WOBBLE) {
    problems.push(level.name + ' (' + score + '%) is EASIER than ' + before.name +
      ' before it (' + before.score + '%)');
  }
  if (i === caves.length - 1 && score < NOT_HOPELESS) {
    problems.push(level.name + ' is hopeless for a beginner: ' + score + '%');
  }

  before = { name: level.name, score: score };
});

console.log('');
if (problems.length) {
  problems.forEach(function (p) { console.log('  [BAD] ' + p); });
} else {
  console.log('  [ok]  Cave 1 is easy, the first caves climb gently, and every cave after it is harder.');
}
console.log('');

process.exit(problems.length ? 1 : 0);
