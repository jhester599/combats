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

     { time: 30, enemy: 'mosquito', count: 3, gap: 0.7 },

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
    // Named by Lewis (homework B2): the world is PALOPA and this is The Cave.
    name: 'The Cave',

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
    // Max 4 fit on screen nicely.
    //
    // The NECROBATCER IS DELIBERATELY NOT HERE, even though it is built and
    // ready. Level 1 teaches one thing - keep spending, hoarding loses - and
    // the Necrobatcer teaches the opposite, because saving up for one and
    // recycling your dead is a patient way to play. With it on this level the
    // balance sim showed a hoarder WINNING at 150s, which would throw away
    // the lesson (and Lewis's own B7 answer: keep it strict).
    //
    // Play with it in the 'graveyard' test level below instead.
    playerUnits: ['scoutBat', 'bruteBat'],

    // 30 enemies, getting nastier as the clock runs. The late waves are there
    // to punish you for dawdling - win quickly and you never even meet them.
    //
    // NOTE: these numbers are MEASURED (DECISIONS.md D8). If you change them,
    // run  node tools/balance-sim.js  and check the VERDICT still passes.
    // Spiders exist in data/units.js but are deliberately not in this level.
    waves: [
      // --- Warm up: a couple of mosquitos drift over. ---
      { time: 3,  enemy: 'mosquito', count: 2, gap: 0.8 },
      { time: 10, enemy: 'mosquito', count: 2, gap: 0.6 },

      // --- First scorpion. Have a Brute Bat ready, or a lot of Scouts. ---
      { time: 17, enemy: 'scorpion', count: 1 },
      { time: 20, enemy: 'mosquito', count: 2, gap: 0.5 },

      // --- It gets busy. ---
      { time: 27, enemy: 'scorpion', count: 1 },
      { time: 32, enemy: 'mosquito', count: 3, gap: 0.5 },

      // --- Two scorpions at once. ---
      { time: 40, enemy: 'scorpion', count: 2, gap: 1.0 },
      { time: 46, enemy: 'mosquito', count: 4, gap: 0.4 },

      { time: 54, enemy: 'scorpion', count: 2, gap: 0.8 },
      { time: 60, enemy: 'mosquito', count: 4, gap: 0.4 },

      // --- Final push. Survive this and the cave is yours. ---
      { time: 68, enemy: 'scorpion', count: 2, gap: 0.8 },
      { time: 76, enemy: 'mosquito', count: 5, gap: 0.3 }
    ]
  },

  /* =======================================================================
     THE GRAVEYARD - a TRY-IT-OUT level for the Necrobatcer
     =======================================================================
     This is NOT one of the real caves of Palopa and it has no story. It is a
     practice ground so Lewis can actually play with his new bat today, while
     the real Level 2 waits on homework B11 (what makes Level 2 different?)
     and B17 (what are the caves called?).

     TO PLAY IT: open src/main.js and change

         window.STARTING_LEVEL = 'level1';
     to
         window.STARTING_LEVEL = 'graveyard';

     then refresh the browser. Change it back to 'level1' afterwards.

     It is set up so that summoning is easy to SEE: you start with enough
     energy for a Necrobatcer immediately, the income is generous so you can
     experiment instead of budgeting, and there are enough enemies that your
     bats really do die and leave graves to raise.
     ======================================================================= */
  graveyard: {
    name: 'The Graveyard (test level)',

    playerBaseHp: 1200,
    enemyBaseHp: 2600,

    startEnergy: 120,      // enough for a Necrobatcer on the first tap
    energyPerSecond: 18,   // roomier than Level 1 - this level is for playing
    maxEnergy: 300,

    playerUnits: ['scoutBat', 'bruteBat', 'necroBat'],

    // Steady pressure rather than a difficulty curve: your bats need to keep
    // dying for there to be anything to raise.
    waves: [
      { time: 2,  enemy: 'mosquito', count: 3, gap: 0.6 },
      { time: 12, enemy: 'scorpion', count: 1 },
      { time: 16, enemy: 'spider',   count: 2, gap: 0.8 },
      { time: 24, enemy: 'mosquito', count: 4, gap: 0.5 },
      { time: 32, enemy: 'scorpion', count: 2, gap: 1.0 },
      { time: 40, enemy: 'spider',   count: 3, gap: 0.7 },
      { time: 50, enemy: 'mosquito', count: 5, gap: 0.4 },
      { time: 58, enemy: 'scorpion', count: 2, gap: 0.8 },
      { time: 66, enemy: 'spider',   count: 3, gap: 0.6 }
    ]
  }

  /* TODO for Lewis - level ideas:
     - 'Bat Cave Boss': one single wave with a bossBat at time 5
     - 'Rush Hour': energyPerSecond 20 and a mosquito every 2 seconds
     - 'Last Stand': playerBaseHp 150, enemyBaseHp 1500
  */
};
