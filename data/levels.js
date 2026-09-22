/* =========================================================================
   COMBATS - ALL THE LEVELS
   =========================================================================
   A level says: how tough the two bases are, how fast your energy fills up,
   which bats you are allowed to use, and exactly when the enemies come out.

   FOR LEWIS: this is where you design the actual challenge. Adding a wave is
   a one-line job - see "HOW TO ADD A WAVE" below.

   ------------------- FORTRESSES WERE HALVED, 2026-09-19 -------------------
   Every cave's enemyBaseHp was cut in half. Measured before the change: 72% of
   all playing time across the ten caves was spent chewing a fortress, because
   your bats reach it at 11-23s and then hammer a wall for another 35-50s. The
   endgame was longer than the fight.

   Halving takes 10-15 seconds off every cave and changes nothing else: all ten
   still pass, cave 1 still punishes hoarding, and the Cow Killer Bee still
   lands well before the Final Stadium ends. The caves keep their relative
   sizes, so "Wait Um is the longest siege" and "Pyramid has a tough fortress"
   are both still true.

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
   practice        OPTIONAL. true = this is a try-things-out level, not a real
                   cave. tools/balance-sim.js then stops failing it for letting
                   a hoarder win, because being generous is the whole point of
                   a practice level. Leave it out for a real cave.
   startItems      OPTIONAL. potions and fruit you begin the battle holding
                   (homework B27), e.g.  startItems: { potion: 3, fruit: 3 }
                   Eventually these come from the casino and your saved bag;
                   until that exists, a level can hand them to you. THE TEN
                   CAVES DELIBERATELY HAVE NONE - see the note in the Graveyard
                   at the bottom of this file.
   teachesSpending OPTIONAL. true = a hoarder must LOSE this level outright.
                   Only cave 1 sets it. From cave 2 on you have the Archer and
                   the Necrobatcer, and playing patiently becomes a real (but
                   slower) way to win; every cave still has to reward spending,
                   which the sim checks everywhere by comparing the times.

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
    //
    // ------------------- MADE EASIER 2026-09-19 -------------------
    // Lewis said twice that this cave was too hard, and he was right - the
    // measurements agreed with him. It was the ONLY cave in Palopa that a
    // 1.0s-late thumb lost; every one of the other nine survived a 3.0s thumb.
    // The tutorial was the hardest thing in the game.
    //
    // The reason is that this is the only cave where you have just TWO bats.
    // Caves 2-10 are gentler because the Archer and the Necrobatcer do the
    // work for you, and cave 1 was being asked to match that with Scouts.
    //
    // What did NOT change: energyPerSecond is still 13. Lewis was offered
    // exactly that lever in homework B7 ("more energy per second") and turned
    // it down in favour of "keep it strict", so the tight economy stays.
    // Hoarding still loses, which is this cave's whole lesson.
    playerBaseHp: 1400,    // <-- TRY ME: make it 200 for a scary hard game
    enemyBaseHp: 1900,     // <-- TRY ME: drop it to 400 for a quick win

    // The biggest single thing that made this cave fair. An opening buffer
    // lets the front line get established, and once it holds, it holds - so
    // 70 turns "loses if you are a second late" into "wins even if you are
    // four seconds late". 40 was not enough to survive learning the game.
    startEnergy: 70,
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

    // The one cave that must teach "keep spending, hoarding loses". From cave 2
    // on you have the Archer and the Necrobatcer, and patient play becomes a
    // real alternative route (slower, but real). Here it must simply fail.
    // tools/balance-sim.js enforces this only where the flag is set.
    teachesSpending: true,

    // 30 enemies, getting nastier as the clock runs. The late waves are there
    // to punish you for dawdling - win quickly and you never even meet them.
    //
    // NOTE: these numbers are MEASURED (DECISIONS.md D8). If you change them,
    // run  node tools/balance-sim.js  and check the VERDICT still passes.
    // Spiders exist in data/units.js but are deliberately not in this level.
    // 26 bugs, down from 30 - the later waves each lost one, so the cave still
    // builds but the back half no longer piles on faster than two bats can
    // answer.
    waves: [
      // --- Warm up: a couple of mosquitos drift over. ---
      { time: 3,  enemy: 'mosquito', count: 2, gap: 0.8 },
      { time: 10, enemy: 'mosquito', count: 2, gap: 0.6 },

      // --- First scorpion. Have a Brute Bat ready, or a lot of Scouts. ---
      { time: 17, enemy: 'scorpion', count: 1 },
      { time: 20, enemy: 'mosquito', count: 2, gap: 0.5 },

      // --- It gets busy. ---
      { time: 27, enemy: 'scorpion', count: 1 },
      { time: 32, enemy: 'mosquito', count: 2, gap: 0.5 },

      // --- Two scorpions at once. ---
      { time: 40, enemy: 'scorpion', count: 2, gap: 1.0 },
      { time: 46, enemy: 'mosquito', count: 3, gap: 0.4 },

      { time: 54, enemy: 'scorpion', count: 2, gap: 0.8 },
      { time: 60, enemy: 'mosquito', count: 3, gap: 0.4 },

      // --- Final push. Survive this and the cave is yours. ---
      { time: 68, enemy: 'scorpion', count: 2, gap: 0.8 },
      { time: 76, enemy: 'mosquito', count: 4, gap: 0.3 }
    ]
  },


  /* =======================================================================
     CAVE 2 - CRYSTAL FALLS            lever: A NEW BUG (the Spider)
     =======================================================================
     Lewis's B11: "each cave gets tougher, new bugs are introduced but not
     every level has a new bug. some have less energy or tougher fortress or
     no warm up."

     So each cave below leans on ONE of those, named at the top. This one is
     where the Spider finally appears - it has existed in data/units.js since
     Round 1 and has never been in a level.

     It is also where the ARCHER BAT arrives. Until progress saving exists
     (homework B12/B13) a cave's playerUnits list is how a new bat gets
     introduced, so the bats arrive cave by cave the way winning would unlock
     them.
     ======================================================================= */
  crystalFalls: {
    name: 'Crystal Falls',
    playerBaseHp: 1000,
    enemyBaseHp: 2100,
    startEnergy: 40,
    energyPerSecond: 13,
    maxEnergy: 300,
    playerUnits: ['scoutBat', 'bruteBat', 'archerBat'],
    waves: [
      { time: 3,  enemy: 'mosquito', count: 2, gap: 0.8 },
      { time: 11, enemy: 'spider',   count: 2, gap: 0.9 },
      { time: 19, enemy: 'scorpion', count: 1 },
      { time: 24, enemy: 'mosquito', count: 3, gap: 0.5 },
      { time: 32, enemy: 'spider',   count: 3, gap: 0.7 },
      { time: 41, enemy: 'scorpion', count: 2, gap: 1.0 },
      { time: 49, enemy: 'mosquito', count: 4, gap: 0.4 },
      { time: 57, enemy: 'spider',   count: 3, gap: 0.6 },
      { time: 66, enemy: 'scorpion', count: 2, gap: 0.8 },
      { time: 74, enemy: 'mosquito', count: 5, gap: 0.3 }
    ]
  },

  /* =======================================================================
     CAVE 3 - DREAM LAND       lever: NO WARM-UP, AND A WALL OF BUTTERFLIES
     =======================================================================
     Every other cave gives you a few gentle seconds. This one does not: bugs
     arrive at second one, before you have banked anything. You start with
     more energy to make that survivable rather than unfair.

     ------------------- THE EVIL BUTTERFLIES (homework B26) -------------------
     "Dream Land has evil butterfly (don't really move, they hover like a wall
      to protect the tower)"   - Lewis

     They have speed 0, so they stay exactly where they spawn - which is right
     in front of the enemy tower. That turns them into a living door: while a
     butterfly is alive your melee bats stop at IT and physically cannot reach
     the building behind it.

     THE FORTRESS SHRANK BECAUSE OF THEM: 2100 -> 1500. The butterflies are part
     of the tower's defence now, so the tower itself does not need to be as
     thick - and D29 (fortresses halved, because 72% of playing time was spent
     chewing them) would have been undone by simply adding 950hp of wall on top.

     The second wall at 46s is the clever bit, and it is Lewis's idea working:
     you break through, you start on the tower, and then a new door grows in
     front of you while the late waves catch up from behind.
     ======================================================================= */
  dreamLand: {
    name: 'Dream Land',
    playerBaseHp: 1000,
    enemyBaseHp: 1500,     // <-- lowered from 2100: the butterflies are the rest
    startEnergy: 75,       // <-- the compensation for having no warm-up
    energyPerSecond: 13,
    maxEnergy: 300,
    playerUnits: ['scoutBat', 'bruteBat', 'archerBat'],
    waves: [
      { time: 1,  enemy: 'mosquito',      count: 3, gap: 0.5 },   // straight in
      { time: 8,  enemy: 'spider',        count: 2, gap: 0.7 },
      { time: 15, enemy: 'mosquito',      count: 3, gap: 0.5 },

      // The first door, timed to be standing by the time your bats arrive.
      { time: 20, enemy: 'evilButterfly', count: 2, gap: 1.0 },

      { time: 26, enemy: 'scorpion',      count: 1 },
      { time: 32, enemy: 'spider',        count: 3, gap: 0.6 },
      // The door grows back, just as you were getting somewhere. MEASURED at
      // 46s first and moved to 38s: a won battle here finishes at 45-52s, so
      // the second wall was arriving after most players had already won and
      // half of Lewis's idea was never being seen.
      { time: 38, enemy: 'evilButterfly', count: 3, gap: 1.2 },

      { time: 46, enemy: 'mosquito',      count: 4, gap: 0.4 },
      { time: 54, enemy: 'scorpion',      count: 2, gap: 0.9 },
      { time: 62, enemy: 'spider',        count: 4, gap: 0.5 },
      { time: 71, enemy: 'mosquito',      count: 5, gap: 0.3 },
      { time: 80, enemy: 'scorpion',      count: 2, gap: 0.8 }
    ]
  },

  /* =======================================================================
     CAVE 4 - PYRAMID                  lever: A TOUGHER FORTRESS
     =======================================================================
     Half again as much fortress to chew through, so this one is a siege. It is
     also where the NECROBATCER arrives - a long cave is exactly where raising
     your fallen bats pays off.
     ======================================================================= */
  pyramid: {
    name: 'Pyramid',
    playerBaseHp: 1100,
    enemyBaseHp: 2800,     // <-- the lever. Cave 1's is 1900.
    startEnergy: 50,

    // MEASURED, and the interesting one: at 14 the attentive band ran 65-104s
    // and the slow turtle finished within a second of it, so spending barely
    // paid. Raising the income to 15 tightened the band to 61-70s and put the
    // turtle 31 seconds behind. A siege still has to reward pressing on.
    energyPerSecond: 15,
    maxEnergy: 320,
    playerUnits: ['scoutBat', 'bruteBat', 'archerBat', 'necroBat'],
    waves: [
      { time: 4,  enemy: 'mosquito', count: 3, gap: 0.7 },
      { time: 13, enemy: 'spider',   count: 2, gap: 0.8 },
      { time: 21, enemy: 'scorpion', count: 2, gap: 1.2 },
      { time: 30, enemy: 'mosquito', count: 4, gap: 0.5 },
      { time: 39, enemy: 'spider',   count: 3, gap: 0.7 },
      { time: 48, enemy: 'scorpion', count: 2, gap: 1.0 },
      { time: 57, enemy: 'mosquito', count: 5, gap: 0.4 },
      { time: 66, enemy: 'spider',   count: 4, gap: 0.6 },
      { time: 76, enemy: 'scorpion', count: 3, gap: 0.9 },
      { time: 86, enemy: 'mosquito', count: 5, gap: 0.3 },
      { time: 95, enemy: 'spider',   count: 4, gap: 0.5 }
    ]
  },

  /* =======================================================================
     CAVE 5 - SAHARA-HARA DESERT   lever: LESS ENERGY, AND THE GAMBLING STING
     =======================================================================
     The income drops, so every bat you send is a choice you feel. Harder in a
     thinking way rather than a faster way - which is Lewis's B7 answer ("keep
     it strict") turned into a whole cave.

     ------------------- THE DESERT SCORPION (homework B26) -------------------
     "desert has scorpions (fast, every attack has a chance to kill you or kill
      itself)"   - Lewis

     This is the first of the two desert caves, so this is where the gamble
     arrives. Note what it does to a POOR cave in particular: when you can only
     afford one bat at a time, losing one to a sting hurts much more than it
     would in a rich cave. The two levers push the same way.

     Some of the plain Scorpions became Desert Scorpions rather than being added
     to. A Desert Scorpion is actually the WEAKER bug on paper (12 dps against
     17.3, and 90 health against 190), so the swap trades raw pressure for luck
     instead of piling both on - which is what kept this cave winnable.
     ======================================================================= */
  saharaDesert: {
    name: 'Sahara-hara Desert',
    playerBaseHp: 1100,
    enemyBaseHp: 2300,
    // MEASURED: eps 10 with 45 starting energy was unwinnable past a 0.4s
    // thumb. 11 with 60 keeps the cave clearly poorer than cave 1's 13 while
    // staying beatable - the lever survives, the cave works.
    startEnergy: 60,
    energyPerSecond: 11,   // <-- the lever. Cave 1's is 13.
    maxEnergy: 300,
    playerUnits: ['scoutBat', 'bruteBat', 'archerBat', 'necroBat'],
    waves: [
      { time: 4,  enemy: 'mosquito',       count: 2, gap: 0.8 },
      { time: 13, enemy: 'spider',         count: 2, gap: 0.9 },

      // The first sting in the game. One, on its own, so it is possible to
      // watch what it does. It arrives at 18s rather than later because a fast
      // battle used to be OVER before the second wave of them ever spawned.
      { time: 18, enemy: 'desertScorpion', count: 1 },

      { time: 25, enemy: 'mosquito',       count: 3, gap: 0.6 },
      { time: 31, enemy: 'desertScorpion', count: 2, gap: 1.1 },
      { time: 38, enemy: 'spider',         count: 2, gap: 0.8 },
      { time: 47, enemy: 'desertScorpion', count: 2, gap: 1.1 },
      { time: 57, enemy: 'mosquito',       count: 4, gap: 0.5 },
      { time: 62, enemy: 'desertScorpion', count: 2, gap: 1.0 },
      { time: 70, enemy: 'spider',         count: 3, gap: 0.7 },
      { time: 78, enemy: 'scorpion',       count: 2, gap: 0.9 }
    ]
  },

  /* =======================================================================
     CAVE 6 - WAIT UM                  lever: THE LONGEST SIEGE
     =======================================================================
     The name earns the cave: the biggest fortress in Palopa so far, and bugs
     that keep coming the whole way. Nothing clever, just endurance.
     ======================================================================= */
  waitUm: {
    name: 'Wait Um',
    playerBaseHp: 1200,
    enemyBaseHp: 3800,     // <-- the lever, and the biggest number in the game
    startEnergy: 55,
    energyPerSecond: 15,
    maxEnergy: 340,
    playerUnits: ['scoutBat', 'bruteBat', 'archerBat', 'necroBat'],
    waves: [
      { time: 4,   enemy: 'mosquito', count: 3, gap: 0.7 },
      { time: 14,  enemy: 'spider',   count: 3, gap: 0.8 },
      { time: 24,  enemy: 'scorpion', count: 2, gap: 1.1 },
      { time: 35,  enemy: 'mosquito', count: 4, gap: 0.5 },
      { time: 46,  enemy: 'spider',   count: 3, gap: 0.7 },
      { time: 57,  enemy: 'scorpion', count: 2, gap: 1.0 },
      { time: 68,  enemy: 'mosquito', count: 5, gap: 0.4 },
      { time: 79,  enemy: 'spider',   count: 4, gap: 0.6 },
      { time: 90,  enemy: 'scorpion', count: 3, gap: 0.9 },
      { time: 102, enemy: 'mosquito', count: 5, gap: 0.4 },
      { time: 113, enemy: 'spider',   count: 4, gap: 0.6 },
      { time: 124, enemy: 'scorpion', count: 3, gap: 0.8 }
    ]
  },

  /* =======================================================================
     CAVE 7 - SCARRED WOODS            lever: NO WARM-UP, AND SPIDER COUNTRY
     =======================================================================
     Straight in like Dream Land, but the bugs are mostly Spiders this time -
     tougher than a Mosquito and quicker than a Scorpion, so the front line
     never settles.
     ======================================================================= */
  scarredWoods: {
    name: 'Scarred Woods',
    playerBaseHp: 1200,
    enemyBaseHp: 2200,
    // MEASURED, twice. 80 lost at a 0.4s thumb; 95 fixed that but a player who
    // saved for Brute Bats still lost outright, because Brutes walk at 45px/s
    // and the spiders are already on top of you. 140 is a big purse, which
    // suits a cave whose whole idea is that you arrive with no time to prepare.
    startEnergy: 140,
    energyPerSecond: 14,
    maxEnergy: 320,
    playerUnits: ['scoutBat', 'bruteBat', 'archerBat', 'necroBat'],
    waves: [
      { time: 1,  enemy: 'spider',   count: 2, gap: 0.6 },   // straight in
      { time: 9,  enemy: 'spider',   count: 3, gap: 0.7 },
      { time: 18, enemy: 'scorpion', count: 1 },
      { time: 24, enemy: 'spider',   count: 4, gap: 0.6 },
      { time: 34, enemy: 'mosquito', count: 4, gap: 0.4 },
      { time: 43, enemy: 'spider',   count: 4, gap: 0.6 },
      { time: 53, enemy: 'scorpion', count: 2, gap: 1.0 },
      { time: 63, enemy: 'spider',   count: 5, gap: 0.5 },
      { time: 74, enemy: 'scorpion', count: 2, gap: 0.8 },
      { time: 84, enemy: 'spider',   count: 5, gap: 0.5 }
    ]
  },

  /* =======================================================================
     CAVE 8 - ABYSS OF DARKNESS        lever: LESS ENERGY *AND* A BIG FORTRESS
     =======================================================================
     The first cave to stack two levers. Poor income and a lot of fortress, so
     you cannot spend your way out of trouble.

     ------------------- THE LIGHTNING BUGS (homework B26) -------------------
     "abyss of darkness has lightning bugs (slow and weak)"   - Lewis

     A lightning bug is a firefly, so in the cave with no light these are the
     only things you can see down there. They are the brightest colour in
     Palopa, which is a nice joke on the cave's name and cost nothing.

     Slow and weak means they are the gentlest bug in the game, so they arrive
     in SWARMS rather than being made nasty. What they cost you is TIME, and it
     is measured: the twenty fireflies make this cave take 71s instead of 57s.

     They manage that without ever piling up - at 45 health they die almost as
     fast as they arrive, and rarely are more than three alive at once. So they
     are really 900 extra health fed to your front line in a trickle, which is
     exactly what a slow weak bug should be, and it suits this cave's identity
     ("you cannot spend your way out of trouble") better than another heavy bug.

     It is a fine edge, though: making each swarm four bigger lost ALL 80 test
     runs. This is the one cave whose first draft lost at every reaction time.
     ======================================================================= */
  abyssOfDarkness: {
    name: 'Abyss of Darkness',
    playerBaseHp: 1200,
    enemyBaseHp: 2800,     // <-- lever one
    startEnergy: 70,
    energyPerSecond: 12,   // <-- lever two
    maxEnergy: 320,
    playerUnits: ['scoutBat', 'bruteBat', 'archerBat', 'necroBat'],

    // MEASURED, and this one needed a rethink rather than a nudge: the first
    // draft was spider-and-scorpion the whole way down and lost at EVERY
    // reaction time, including a perfect one. No amount of extra energy fixed
    // it, because the problem was the bugs' damage, not the player's wallet.
    // Rebuilt as steady pressure - the identity is "you cannot spend your way
    // out of trouble", which wants relentless, not spiky.
    // MEASURED, and the swarms were moved FORWARD. The first draft put them at
    // 12s, 34s, 58s and 86s, but a won battle here ends at about 45s - so two of
    // the four swarms were arriving after the cave was already over, and the
    // fireflies peaked at three on the lane. Lewis's bug was barely in his game.
    // At 12s, 24s and 36s a player meets three swarms in every battle, and the
    // one at 62s is still there to punish dawdling.
    waves: [
      { time: 5,  enemy: 'mosquito',     count: 3, gap: 0.6 },
      { time: 12, enemy: 'lightningBug', count: 4, gap: 0.4 },   // the first swarm
      { time: 20, enemy: 'spider',       count: 2, gap: 0.8 },
      { time: 24, enemy: 'lightningBug', count: 5, gap: 0.4 },
      { time: 31, enemy: 'scorpion',     count: 1 },
      { time: 36, enemy: 'lightningBug', count: 5, gap: 0.4 },
      { time: 44, enemy: 'mosquito',     count: 4, gap: 0.5 },
      { time: 52, enemy: 'spider',       count: 3, gap: 0.7 },
      { time: 62, enemy: 'lightningBug', count: 6, gap: 0.3 },
      { time: 70, enemy: 'scorpion',     count: 2, gap: 1.1 },
      { time: 80, enemy: 'mosquito',     count: 4, gap: 0.5 },
      { time: 90, enemy: 'spider',       count: 3, gap: 0.7 },
      { time: 100, enemy: 'scorpion',    count: 2, gap: 0.9 }
    ]
  },

  /* =======================================================================
     CAVE 9 - FORGOTTEN OASIS      lever: SCORPIONS, BOTH KINDS, LOTS OF THEM
     =======================================================================
     The last cave before the boss, and the heaviest bugs in the game so far.
     Scorpions out-range a Scout Bat, so this is where the Archer stops being
     a luxury - good practice for what is waiting in the Final Stadium.

     The second desert cave, so the Desert Scorpion (homework B26) is back, and
     here it comes mixed in with the plain armoured kind. The two read very
     differently once you have met both: the slow one you can plan around, the
     fast one is a dice roll that can take your Brute Bat with it.
     ======================================================================= */
  forgottenOasis: {
    name: 'Forgotten Oasis',
    playerBaseHp: 1300,
    enemyBaseHp: 2800,
    startEnergy: 60,
    energyPerSecond: 13,
    maxEnergy: 340,
    playerUnits: ['scoutBat', 'bruteBat', 'archerBat', 'necroBat'],
    // MEASURED, and this cave was the one thing today's work genuinely broke.
    // The first attempt ADDED Desert Scorpions on top of the plain ones, and the
    // cave went from 0 losses in 160 runs to 52 - all of them suffered by the
    // player who saves up for Brute Bats. Of course: this is already the cave
    // whose whole identity is "scorpions, and lots of them", and an instant kill
    // does not care that the bat it landed on cost 90 energy.
    //
    // The fix was to CONVERT rather than add - the same ten-ish scorpions, split
    // between the two kinds. And the measurement had a surprise in it: swapping
    // MORE plain Scorpions for the gambling kind made the cave SAFER, not
    // riskier. A Desert Scorpion is the weaker bug on paper (12 dps and 120
    // health against 17.3 and 190), so what was really beating the Brute player
    // here was ordinary armoured-scorpion damage, never the sting. The cave now
    // feels more dangerous and is measurably kinder: 0 losses in 160 runs, with
    // about 1.8 bats stung dead per battle.
    waves: [
      { time: 4,  enemy: 'scorpion',       count: 1 },
      { time: 12, enemy: 'mosquito',       count: 3, gap: 0.6 },
      { time: 21, enemy: 'desertScorpion', count: 2, gap: 1.1 },
      { time: 32, enemy: 'spider',         count: 3, gap: 0.7 },
      { time: 42, enemy: 'scorpion',       count: 2, gap: 1.0 },
      { time: 54, enemy: 'mosquito',       count: 5, gap: 0.4 },
      { time: 64, enemy: 'desertScorpion', count: 3, gap: 0.9 },
      { time: 76, enemy: 'spider',         count: 4, gap: 0.6 },
      { time: 87, enemy: 'desertScorpion', count: 2, gap: 0.8 }
    ]
  },

  /* =======================================================================
     CAVE 10 - FINAL STADIUM           lever: THE BOSS
     =======================================================================
     The end of Palopa, and the only place the COW KILLER BEE appears
     (homework B8). Its stinger reaches 130px, which is further than any melee
     bat of yours can hit back from - so Scouts and Brutes feed it.

     The Archer Bat reaches 240px. That is the fight.

     The fortress behind it is deliberately the SMALLEST of the late caves:
     the boss is the challenge here, not the wall. Beat the bee and the wall
     falls quickly, which is what an ending should feel like.
     ======================================================================= */
  finalStadium: {
    name: 'Final Stadium',
    playerBaseHp: 1400,

    // MEASURED, and the first draft had a real bug in it: the fortress was
    // 3400 and the bee arrived at 58s, but the cave was already WON by 44-52s.
    // The boss of the whole game was never even meeting the player. A fortress
    // this size has to outlast her entrance, not fall before it.
    enemyBaseHp: 2500,

    // MEASURED: at 90 a player saving for Brute Bats lost at a 0.5s thumb, and
    // losing the last cave of the game to a knife-edge is a rotten ending. 130
    // makes it winnable however you play - though a Brute-heavy army still
    // takes about 210s to grind her down, because Brutes reach 46px and her
    // stinger reaches 130, so they die without ever touching her. The boss
    // punishes pure melee without ever making it impossible.
    startEnergy: 130,
    energyPerSecond: 16,
    maxEnergy: 400,
    playerUnits: ['scoutBat', 'bruteBat', 'archerBat', 'necroBat'],
    waves: [
      { time: 4,  enemy: 'mosquito', count: 3, gap: 0.6 },
      { time: 13, enemy: 'spider',   count: 3, gap: 0.7 },
      { time: 23, enemy: 'scorpion', count: 2, gap: 1.1 },
      { time: 34, enemy: 'spider',   count: 4, gap: 0.6 },

      // Her majesty, at 40s - early enough that she is genuinely in the fight
      // rather than a wave you outran. One of her, and she is the last thing
      // in the game.
      { time: 40, enemy: 'cowKillerBee', count: 1 },

      // Her retinue, so she is never fought in a clean duel.
      { time: 50, enemy: 'scorpion', count: 3, gap: 1.0 },
      { time: 62, enemy: 'mosquito', count: 5, gap: 0.4 },
      { time: 74, enemy: 'spider',   count: 4, gap: 0.6 },
      { time: 86, enemy: 'scorpion', count: 3, gap: 0.9 }
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

    // This is a PRACTICE level, not a cave. It tells tools/balance-sim.js not
    // to complain that a hoarder can win here: hoarding is *supposed* to work
    // on a level built for trying the Necrobatcer out, and a tool that cries
    // wolf is a tool people stop reading.
    practice: true,

    playerBaseHp: 1200,
    enemyBaseHp: 2600,

    startEnergy: 120,      // enough for a Necrobatcer on the first tap
    energyPerSecond: 18,   // roomier than Level 1 - this level is for playing
    maxEnergy: 300,

    playerUnits: ['scoutBat', 'bruteBat', 'necroBat'],

    // ------------------- POTIONS AND FRUIT (homework B27) -------------------
    // "you can use potions during a battle to make the opponent weaker. fruit
    //  can heal your tower, but only slightly."   - Lewis
    //
    // This is the ONLY level in the game that hands them out, and the ten real
    // caves deliberately have none. Two reasons:
    //
    //   1. You are supposed to EARN them at the casino, which does not exist yet
    //      (milestone M4). Sprinkling free ones through Palopa would quietly
    //      answer a question nobody has asked - how many do you get, and for
    //      what? That is Lewis's to decide, not Dad's to assume.
    //   2. Every one of the ten caves is measured WITHOUT them, so an item is
    //      always a bonus and never a requirement. A cave that needs a potion is
    //      a cave you can arrive at unable to win.
    //
    // So this practice level is where Lewis actually plays with them today -
    // exactly the trick that let him use the Necrobatcer the day it was built
    // (DECISIONS.md D14).
    startItems: { potion: 3, fruit: 3 },

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
