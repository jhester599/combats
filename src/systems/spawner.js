/* =========================================================================
   SPAWNER - sends the enemy waves out on schedule
   =========================================================================
   It reads the "waves" list from a level (data/levels.js) and turns it into
   a simple ordered to-do list of single spawns, like:

       at 10.0s -> mosquito
       at 10.8s -> mosquito
       at 20.0s -> scorpion

   Then every simulation step it asks "is it time for the next one yet?".

   Flattening the waves up front means the tricky part (a wave of 3 with a
   0.8s gap) is solved ONCE here instead of every frame.
   ========================================================================= */

window.Spawner = function (level) {
  this.elapsed = 0;       // seconds since the battle started
  this.nextIndex = 0;     // which entry of the to-do list is up next

  this.schedule = window.Spawner.buildSchedule(level);
};

/* -------------------------------------------------------------------------
   Turn the level's wave list into a flat, time-sorted list of single spawns.
   ------------------------------------------------------------------------- */
window.Spawner.buildSchedule = function (level) {
  var schedule = [];
  var w;
  var wave;
  var n;
  var gap;

  for (w = 0; w < level.waves.length; w++) {
    wave = level.waves[w];

    // 'gap' is optional in the level data. No gap = they all arrive together.
    gap = wave.gap || 0;

    for (n = 0; n < wave.count; n++) {
      schedule.push({
        time: wave.time + (n * gap),
        unitKey: wave.enemy
      });
    }
  }

  // Sort by time so Lewis can write the waves in any order he likes.
  schedule.sort(function (a, b) {
    return a.time - b.time;
  });

  return schedule;
};

/* -------------------------------------------------------------------------
   Called once per simulation step.
   'spawnFunction' is called with a unit key for each enemy that is due.
   ------------------------------------------------------------------------- */
window.Spawner.prototype.update = function (dt, spawnFunction) {
  this.elapsed += dt;

  // A "while" (not an "if") because several enemies can be due in the same
  // step, for instance a wave with gap: 0.
  while (this.nextIndex < this.schedule.length &&
         this.schedule[this.nextIndex].time <= this.elapsed) {

    spawnFunction(this.schedule[this.nextIndex].unitKey);
    this.nextIndex++;
  }
};
