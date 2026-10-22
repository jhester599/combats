/* =========================================================================
   TEAM - which bats you take into a cave (the Locker, 2026-10-12)
   =========================================================================
   "pick a team of 3, you will choose from a 'locker' between levels on what
    you want the team to be for the next level"  - Jeff

   By the Final Stadium you have earned eleven bats, and you take THREE of
   them in. Choosing which three is the decision; the Locker
   (src/scenes/LockerScene.js) is where you make it.

   This file is the rules, kept away from the screen so the battle, the
   Locker, the balance sim and the tests all agree:

     * your POOL for a cave is every bat earned before it - its playerUnits,
       worked out in src/systems/caves.js;
     * a TEAM is 1 to CONFIG.team.size different bats from that pool;
     * when there is nothing to choose (the pool is no bigger than a team, as
       in caves 1 and 2, or a practice level) there is no Locker at all - you
       just get all of them.

   ------------------- THE TEAM THE LOCKER STARTS WITH -------------------
   The last team you picked (saved by src/systems/progress.js), minus any bat
   this cave does not have. Any empty places are filled with the bat that is
   NEW in this cave first - so you get to try it - and then your bats in the
   order you earned them. You can change all of it; this is just where the
   Locker opens.
   ========================================================================= */

window.Team = {};

window.Team.size = function () {
  return window.CONFIG.team.size;
};

/* Every bat you could take into this cave: the cave's own, plus any casino
   bats you have bought or won (src/systems/casino.js). A practice level keeps
   to its own list. */
window.Team.poolFor = function (levelKey) {
  var level = window.LEVELS[levelKey];
  var pool = level.playerUnits.slice();

  if (!level.practice && window.Casino) {
    window.Casino.ownedCasinoBats().forEach(function (key) {
      if (pool.indexOf(key) === -1) { pool.push(key); }
    });
  }

  return pool;
};

/* Is there anything to choose? If not, the Locker is skipped. */
window.Team.needsLocker = function (levelKey) {
  return window.Team.poolFor(levelKey).length > window.Team.size();
};

/* Is this a team you are allowed to take into this cave? */
window.Team.isValid = function (team, levelKey) {
  var pool = window.Team.poolFor(levelKey);

  if (!team || !team.length || team.length > window.Team.size()) {
    return false;
  }

  return team.every(function (key, index) {
    return pool.indexOf(key) !== -1 && team.indexOf(key) === index;
  });
};

/* -------------------------------------------------------------------------
   The team the Locker opens with - see the note at the top.
   'saved' is the last team picked, or null.
   ------------------------------------------------------------------------- */
window.Team.defaultFor = function (levelKey, saved) {
  var pool = window.Team.poolFor(levelKey);
  var size = window.Team.size();

  if (pool.length <= size) {
    return pool;                  // nothing to choose: take everyone
  }

  var team = (saved || []).filter(function (key, index, list) {
    return pool.indexOf(key) !== -1 && list.indexOf(key) === index;
  }).slice(0, size);

  var newBat = window.Caves.newBatIn(levelKey);
  var fillOrder = (newBat ? [newBat] : []).concat(pool);

  fillOrder.forEach(function (key) {
    if (team.length < size && team.indexOf(key) === -1) {
      team.push(key);
    }
  });

  return team;
};

/* -------------------------------------------------------------------------
   Go and play a cave: through the Locker if there is a choice to make,
   straight into battle if not. The menu and the victory screen both use
   this, so they can never disagree about when the Locker appears.
   ------------------------------------------------------------------------- */
window.Team.startCave = function (scene, levelKey) {
  if (window.Team.needsLocker(levelKey)) {
    scene.scene.start('LockerScene', { levelKey: levelKey });
    return;
  }

  scene.scene.start('BattleScene', {
    levelKey: levelKey,
    team: window.Team.poolFor(levelKey)
  });
};
