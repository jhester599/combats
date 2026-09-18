/* =========================================================================
   BATTLE BATS - ALL THE LEVELS
   =========================================================================
   A level says: how tough the two bases are, how fast your energy fills up,
   which bats you are allowed to use, and exactly when the enemies come out.

   FOR LEWIS: this is where you design the actual challenge. Adding a wave is
   a one-line job - see "HOW TO ADD A WAVE" below.

   ------------------- WHAT EACH NUMBER MEANS -------------------
   name            shown on screen at the start of the battle
   playerBaseHp    how much damage YOUR base can take before you lose
   enemyBaseHp     how much damage the ENEMY base can take before you win
   startEnergy     energy you begin with
   energyPerSecond how fast energy refills
   maxEnergy       the most energy you can hold at once
   playerUnits     which units from units.js get a deploy button, in order
                   (max 4 fit on screen nicely)
   waves           the enemy spawn schedule - see below

   ------------------- HOW TO ADD A WAVE -------------------
   Add one line to the "waves" list:

     { time: 30, enemy: 'critter', count: 3, gap: 0.7 },

   time   = seconds after the battle starts
   enemy  = any key from units.js that has  enemy: true
   count  = how many to send
   gap    = seconds between each one (leave it out and they all pop out
            at the same instant)

   The list does NOT have to be in time order - the game sorts it for you.

   ------------------- HOW TO ADD A WHOLE NEW LEVEL -------------------
   Copy the entire  level1: { ... },  block, rename it to  level2:, and
   change the numbers. Then in src/main.js set STARTING_LEVEL to 'level2'
   to play it.
   ========================================================================= */

window.LEVELS = {

  level1: {
    name: 'First Cave',

    // The enemy base is a big fortress - that is the point. It should take a
    // sustained push to knock down, not one lucky bat.
    playerBaseHp: 1000,    // <-- TRY ME: make it 200 for a scary hard game
    enemyBaseHp: 4000,     // <-- TRY ME: drop it to 800 for a quick win

    startEnergy: 40,
    // 13 per second is tuned so that spamming Scout Bats eats almost all your
    // income - so saving up for a Brute Bat is a real decision.
    energyPerSecond: 13,   // <-- TRY ME: 40 makes you rich and the game silly
    maxEnergy: 300,

    // Which bats you get buttons for. Must be keys from data/units.js.
    playerUnits: ['scoutBat', 'bruteBat'],

    // 30 enemies, getting nastier as the clock runs. The late waves are there
    // to punish you for dawdling - win quickly and you never even meet them.
    waves: [
      // --- Warm up: a couple of critters wander over. ---
      { time: 3,  enemy: 'critter', count: 2, gap: 0.8 },
      { time: 10, enemy: 'critter', count: 2, gap: 0.6 },

      // --- First big guy. Have a Brute Bat ready, or a lot of Scouts. ---
      { time: 17, enemy: 'bruiser', count: 1 },
      { time: 20, enemy: 'critter', count: 2, gap: 0.5 },

      // --- It gets busy. ---
      { time: 27, enemy: 'bruiser', count: 1 },
      { time: 32, enemy: 'critter', count: 3, gap: 0.5 },

      // --- Two big guys at once. ---
      { time: 40, enemy: 'bruiser', count: 2, gap: 1.0 },
      { time: 46, enemy: 'critter', count: 4, gap: 0.4 },

      { time: 54, enemy: 'bruiser', count: 2, gap: 0.8 },
      { time: 60, enemy: 'critter', count: 4, gap: 0.4 },

      // --- Final push. Survive this and the cave is yours. ---
      { time: 68, enemy: 'bruiser', count: 2, gap: 0.8 },
      { time: 76, enemy: 'critter', count: 5, gap: 0.3 }
    ]
  }

  /* TODO for Lewis - level ideas:
     - 'Bat Cave Boss': one single wave with a bossBat at time 5
     - 'Rush Hour': energyPerSecond 20 and a critter every 2 seconds
     - 'Last Stand': playerBaseHp 150, enemyBaseHp 1500
  */
};
