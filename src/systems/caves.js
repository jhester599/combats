/* =========================================================================
   CAVES - what caves exist, and which one comes next
   =========================================================================
   The game used to know about exactly one level, because src/main.js named it
   in STARTING_LEVEL and nothing else ever asked. That made the game a loop:
   you beat The Cave, and RETRY sent you back to The Cave while MENU sent you
   to a Start button that also launched The Cave. A level that existed in the
   data but was not named in main.js - the Graveyard - could not be reached at
   all without editing code.

   This file is the one place that answers "what is there, and what is next",
   so the menu and the victory screen can agree.

   ------------------- THE ORDER OF THE CAVES -------------------
   It is simply the order the levels are written in data/levels.js. Add a new
   level block to that file and it appears in the menu, in that position, with
   no other step - which is the promise data/levels.js already makes.

   A level marked  practice: true  is NOT a cave. It is a place to try things
   out, so it is kept out of the numbering and out of "next cave", and the menu
   shows it separately. Today that is the Graveyard, which exists so Lewis can
   play the Necrobatcer.

   ------------------- WHICH BATS EACH CAVE GIVES YOU -------------------
   Beat a cave, earn a bat (homework B12 = A, "you unlock bats by winning").
   Cave 1 lists the bats you start with in its  playerUnits , and a cave that
   hands out a bat says so with one line:

       unlocks: 'archerBat',      // beat this cave and the Archer joins you

   Every later cave then gets the starting bats plus everything earned before
   it, in the order you earned them - worked out here, once, when the game
   loads. So adding a bat for cave 4 is one  unlocks  line on cave 4, and caves
   5-10 all pick it up by themselves.

   It goes by a cave's PLACE rather than by your saved progress, and that is
   the same thing: a cave only opens once every cave before it is beaten (see
   src/systems/progress.js), so by the time you can play cave 5 you have
   earned exactly the bats caves 1-4 give out. Going by place keeps every cave
   the same for every player, which is what lets tools/balance-sim.js measure
   it. It also means going back to The Cave later puts you back down to two
   bats - it is still the tutorial.

   A practice level (the Graveyard) is not part of the chain. It keeps the
   playerUnits it lists, because a practice level is for trying one thing out.

   Remembering what you have beaten lives in src/systems/progress.js; earning
   suns and spending them is still homework (milestone M4).
   ========================================================================= */

window.Caves = {};

/* Every real cave, in the order they appear in data/levels.js. */
window.Caves.all = function () {
  return Object.keys(window.LEVELS).filter(function (key) {
    return !window.LEVELS[key].practice;
  });
};

/* Every practice level - somewhere to try a bat out, not a cave. */
window.Caves.practice = function () {
  return Object.keys(window.LEVELS).filter(function (key) {
    return !!window.LEVELS[key].practice;
  });
};

/* Which cave number is this? 1-based, or null if it is not a cave at all. */
window.Caves.numberOf = function (levelKey) {
  var index = window.Caves.all().indexOf(levelKey);
  return (index === -1) ? null : index + 1;
};

/* -------------------------------------------------------------------------
   The key of the cave after this one, or null if there isn't one.

   null is the honest answer in two different situations, and the victory
   screen says something different for each:
     * you just beat the last cave that exists
     * you just beat a practice level, which has no "next"
   ------------------------------------------------------------------------- */
window.Caves.next = function (levelKey) {
  var caves = window.Caves.all();
  var index = caves.indexOf(levelKey);

  if (index === -1 || index === caves.length - 1) {
    return null;
  }

  return caves[index + 1];
};

/* "Cave 1 - The Cave", or just the name for a practice level. */
window.Caves.label = function (levelKey) {
  var number = window.Caves.numberOf(levelKey);
  var name = window.LEVELS[levelKey].name;

  return (number === null) ? name : (number + '. ' + name);
};

/* -------------------------------------------------------------------------
   The bat you EARN by beating this cave, or null if it gives none.
   ------------------------------------------------------------------------- */
window.Caves.earnedBy = function (levelKey) {
  var level = window.LEVELS[levelKey];

  if (!level || level.practice || !level.unlocks) {
    return null;
  }

  return level.unlocks;
};

/* The bat that is new in this cave - the one the cave before it gave you.
   The battle screen puts a NEW! tag on its button. */
window.Caves.newBatIn = function (levelKey) {
  var caves = window.Caves.all();
  var index = caves.indexOf(levelKey);

  return (index <= 0) ? null : window.Caves.earnedBy(caves[index - 1]);
};

/* -------------------------------------------------------------------------
   Give every cave its bats: cave 1's own list, then each cave inherits the
   one before it plus whatever that cave hands out.

   Runs once, as soon as this file loads, and writes the answer into each
   cave's  playerUnits  - so the battle screen and the balance sim, which
   both read playerUnits, need to know nothing about unlocking.

   A cave AFTER the first that writes its own playerUnits keeps them, and the
   chain carries on from there. That is an escape hatch for an odd cave, not
   the normal way: leave them out and the cave gets what you have earned.
   ------------------------------------------------------------------------- */
window.Caves.fillRosters = function () {
  var bats = [];

  window.Caves.all().forEach(function (key) {
    var level = window.LEVELS[key];

    if (level.playerUnits) {
      bats = level.playerUnits.slice();
    } else {
      level.playerUnits = bats.slice();
    }

    if (level.unlocks && bats.indexOf(level.unlocks) === -1) {
      bats.push(level.unlocks);
    }
  });
};

window.Caves.fillRosters();
