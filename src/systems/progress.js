/* =========================================================================
   PROGRESS - which caves you have beaten, remembered between visits
   =========================================================================
   Lewis decided both halves of this in his homework:

     B13 = B - "yes it remembers" (and you earn suns, which is still to come)
     B12 = A - you unlock bats, and caves, by winning

   So: cave 1 is always open, and every other cave opens when the one before it
   is beaten. The Graveyard is a practice ground rather than part of Palopa, so
   it is always open.

   ------------------- WHERE IT IS KEPT -------------------
   In the browser's localStorage, under one key. That means it is remembered per
   browser on that one device - there is no account and nothing leaves the
   machine. Clearing your browser data clears your progress, which is the right
   trade for a game with no login.

   EVERY read and write is wrapped in try/catch. localStorage throws rather than
   returning null in a private window, and a game that crashes on the title
   screen because storage is blocked would be far worse than a game that simply
   forgets. If it is unavailable we fall back to remembering for this visit
   only, and the game plays normally.

   ------------------- WHAT IS NOT HERE YET -------------------
   Suns, the casino, goods and bat upgrades (B13, B22, B27, milestone M4). This
   file deliberately stores only the list of caves beaten, so adding those later
   means adding fields, not rewriting this.
   ========================================================================= */

window.Progress = {};

window.Progress.STORAGE_KEY = 'battleBats.progress.v1';

/* What we keep. Kept flat and boring on purpose - it has to survive being
   loaded by a future version of the game. */
window.Progress.blank = function () {
  return { beaten: [] };
};

/* In-memory copy, so a blocked localStorage still works for this visit. */
window.Progress.state = null;

/* -------------------------------------------------------------------------
   Read what is saved. Anything unreadable or corrupt is treated as a fresh
   start rather than an error - the worst case must be a forgotten game, never
   a broken one.
   ------------------------------------------------------------------------- */
window.Progress.load = function () {
  if (window.Progress.state) {
    return window.Progress.state;
  }

  var state = window.Progress.blank();

  try {
    var raw = window.localStorage.getItem(window.Progress.STORAGE_KEY);

    if (raw) {
      var parsed = JSON.parse(raw);

      // Only trust it if it is the shape we expect.
      if (parsed && Object.prototype.toString.call(parsed.beaten) === '[object Array]') {
        state.beaten = parsed.beaten.filter(function (key) {
          return typeof key === 'string';
        });
      }
    }
  } catch (err) {
    // Blocked, full, private window, or corrupt. Carry on with a blank one.
  }

  window.Progress.state = state;
  return state;
};

/* Write it back. Failing to save is not worth interrupting a game over. */
window.Progress.save = function () {
  try {
    window.localStorage.setItem(
      window.Progress.STORAGE_KEY,
      JSON.stringify(window.Progress.load())
    );
  } catch (err) {
    // Out of space or blocked. The in-memory copy still holds for this visit.
  }
};

/* -------------------------------------------------------------------------
   Record a win. Called by BattleScene the moment a cave is beaten.
   ------------------------------------------------------------------------- */
window.Progress.markBeaten = function (levelKey) {
  var state = window.Progress.load();

  if (state.beaten.indexOf(levelKey) === -1) {
    state.beaten.push(levelKey);
    window.Progress.save();
  }
};

window.Progress.hasBeaten = function (levelKey) {
  return window.Progress.load().beaten.indexOf(levelKey) !== -1;
};

/* -------------------------------------------------------------------------
   Is this level playable yet?

   A practice level always is. Cave 1 always is. Any other cave needs the cave
   BEFORE it in data/levels.js to have been beaten.

   Note it asks about the previous cave rather than counting how many you have
   beaten, so beating caves out of order (say, from a link) cannot leave a hole
   in the middle of the map.
   ------------------------------------------------------------------------- */
window.Progress.isUnlocked = function (levelKey) {
  if (window.LEVELS[levelKey] && window.LEVELS[levelKey].practice) {
    return true;
  }

  var caves = window.Caves.all();
  var index = caves.indexOf(levelKey);

  if (index <= 0) {
    return true;      // cave 1, or something that is not a cave at all
  }

  return window.Progress.hasBeaten(caves[index - 1]);
};

/* Which cave does this one need first? Null if it needs nothing.
   Used for the "beat X first" message on a locked button. */
window.Progress.requires = function (levelKey) {
  var caves = window.Caves.all();
  var index = caves.indexOf(levelKey);

  if (index <= 0) {
    return null;
  }

  return caves[index - 1];
};

/* How far through Palopa you are. */
window.Progress.beatenCount = function () {
  return window.Caves.all().filter(window.Progress.hasBeaten).length;
};

/* Wipe it. Offered in the Credits panel so a cave can be replayed from the
   start, and so Dad can test the locking without clearing his whole browser. */
window.Progress.reset = function () {
  window.Progress.state = window.Progress.blank();

  try {
    window.localStorage.removeItem(window.Progress.STORAGE_KEY);
  } catch (err) {
    // Nothing to do - the in-memory copy is already blank.
  }
};
