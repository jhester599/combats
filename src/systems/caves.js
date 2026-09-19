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

   ------------------- WHAT THIS IS NOT -------------------
   There is no unlocking and nothing is saved: every cave can be picked from
   the menu. Remembering what you have beaten, earning suns and spending them
   is homework B12/B13 (milestone M4), and inventing what a cave *is* needs
   B11 and B17. This file only stops the game being a dead end.
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
