/* =========================================================================
   COMBATS - ALL THE UNITS
   =========================================================================
   This is THE most important file for balancing the game. Every bat and
   every monster is described here as a simple list of numbers.

   FOR LEWIS: change any number below, save the file, refresh the browser.
   That's it. No other step. If you make the Scout Bat cost 1 energy you can
   spam a hundred of them - try it, it's funny.

   ------------------- WHAT EACH NUMBER MEANS -------------------
   name           the words shown on the deploy button
   cost           energy you pay to send this unit out
   cooldown       seconds you must wait before sending ANOTHER of this unit
   hp             hit points - how much damage it can take before dying
   attack         damage each hit does
   attackInterval seconds between hits (SMALLER = attacks faster)
   range          how far away (in pixels) it can hit from
   speed          pixels it walks per second
   color          the colour of the placeholder art (ignored once real art exists)
   enemy          true = belongs to the bad guys, false/missing = your team
   sprite         which picture sheet to use
   scale          how big to draw it. 1 = the picture's real size, 0.5 = half.
                  This is how two units drawn at the same size in the art tool
                  end up looking big and small in the game.
   anims          which picture frames to use for each animation

   DAMAGE PER SECOND (DPS) = attack / attackInterval
     Scout Bat: 8 / 0.6  = 13.3 dps   (fast little pokes)
     Brute Bat: 30 / 1.4 = 21.4 dps   (slow heavy thumps)

   ------------------- HOW TO ADD A BRAND NEW UNIT -------------------
   1. Copy one whole block below (from  myUnit: {  to  },  ).
   2. Give it a new key (the word before the ":"), like  ninjaBat:
   3. Change the numbers and the name and the color.
   4. Open data/levels.js and add your new key to that level's "playerUnits"
      list so a button shows up for it.
   ========================================================================= */

window.UNITS = {

  /* =====================================================================
     YOUR BATS
     ===================================================================== */

  scoutBat: {
    name: 'Scout Bat',
    cost: 25,              // <-- TRY ME: make it cheaper to spam more bats

    // THE SPAMMABLE-BAT RULE: keep this number BELOW  cost / energyPerSecond.
    //
    // At 25 energy and 13 energy per second it takes 1.92s to AFFORD a Scout,
    // so a 1.4s cooldown means the button is already lit and waiting by the
    // time you can pay for it. Money is the limit, not the clock.
    //
    // Why that matters: a person is never frame-perfect. When the COOLDOWN is
    // the limit - it used to be 2.0s here - every fraction of a second between
    // the button lighting up and your thumb landing is a bat you never get
    // back. A 0.3s delay cost 13% of your whole army, which was enough to LOSE
    // Level 1 while doing exactly what the homework said to do. When MONEY is
    // the limit, a slow tap just banks the energy and costs you nothing.
    //
    // Run  node tools/balance-sim.js  and it checks this rule for every bat.
    cooldown: 1.4,         // seconds before you can send another Scout Bat
    hp: 40,
    attack: 8,             // damage per hit
    attackInterval: 0.6,   // seconds between hits
    range: 40,             // pixels
    speed: 90,             // pixels per second
    color: '#6fd3ff',      // only used by placeholder art - this bat has real art now
    sprite: 'scoutBat',
    scale: 0.55,           // <-- TRY ME: makes the Scout look small and nippy

    // REAL ART - Lewis's 2026-09-19 redraw (homework B4): hand-drawn, a big
    // circle body, wings, ears, a mouth, no legs, black and white.
    //
    // The frames are WIDE now (150x64 rather than 64x64) because a bat with
    // its wings out is a wide thing. The scale above is lower to match, so it
    // takes up about the same room on screen as the old square drawing did.
    //
    // All four animations share frame 0: there is only a standing pose so far.
    // When Lewis draws walk/attack/death, drop the frames in
    // assets/sprites/source/scoutBat/, re-run tools/pack-spritesheet.js, and
    // paste the block it prints over this one.
    anims: {
      frameWidth: 150,
      frameHeight: 64,
      idle:   { start: 0, end: 0, frameRate: 1, repeat: -1 },  // -1 = loop forever
      walk:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      attack: { start: 0, end: 0, frameRate: 1, repeat: 0  },
      // With one frame, frameRate only sets how long the fade-out lasts:
      // 1 frame / 2 per second = half a second.
      death:  { start: 0, end: 0, frameRate: 2, repeat: 0  }
    }
  },

  bruteBat: {
    name: 'Brute Bat',
    cost: 90,
    cooldown: 6.0,
    hp: 220,
    attack: 30,
    attackInterval: 1.4,
    range: 46,
    speed: 45,
    color: '#b487ff',      // only used by placeholder art - this bat has real art now
    sprite: 'bruteBat',
    scale: 0.8,            // <-- TRY ME: makes the Brute loom over the Scout

    // REAL ART - Lewis's 2026-09-19 redraw (homework B4). The scowling one.
    // Single pose, so the Brute does not flap yet.
    anims: {
      frameWidth: 132,
      frameHeight: 64,
      idle:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      walk:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      attack: { start: 0, end: 0, frameRate: 1, repeat: 0  },
      death:  { start: 0, end: 0, frameRate: 2, repeat: 0  }
    }
  },

  /* =====================================================================
     THE NECROBATCER - Lewis's third bat (homework B5, 2026-09-19)
     =====================================================================
     "A summoner, similar to a necromancer, that can summon dead bats back
      to life to continue fighting."  - Lewis

     This is the first bat in the game with a POWER as well as numbers. It is
     a rubbish fighter on purpose: 3.3 dps, less than half a Scout's. What it
     does instead is raise your fallen bats, and it raises them WHERE THEY
     FELL - right at the front line - so they skip the long walk.

     The power's numbers live in the "summon" block below, same as everything
     else in this game. The rules it follows are in src/systems/necro.js.
     ===================================================================== */

  necroBat: {
    name: 'Necrobatcer',
    cost: 60,
    // Below cost / energyPerSecond (60 / 13 = 4.6s), so money is the limit
    // and being a slow tapper costs you nothing. See the Scout's note above.
    cooldown: 4.0,
    hp: 70,
    attack: 4,             // feeble on purpose - it is not here to fight
    attackInterval: 1.2,   // 3.3 dps, about a quarter of a Scout's

    // ------------------- IT CASTS FROM THE BACK (2026-09-20) -------------------
    // Jeff: "the necrobatcer should have more of a range attack as a summoner,
    // similar to the archer bat."
    //
    // He was fixing a real incoherence. This bat's SUMMON reach is 460 - most of
    // the lane - but its ATTACK reach used to be 60, barely more than a Scout's
    // 40. A unit walks forward until something is within its attack range, so
    // the old 60 marched the summoner right into the scrum it was supposed to be
    // standing behind. The bat wanted to hang back and its own numbers dragged
    // it forward.
    //
    // MEASURED: at 60 it stopped 59px from the nearest bug; at 200 it stops
    // 200px away - 141 pixels further back, in the same line as the Archer.
    //
    // WHY 200 AND NOT THE ARCHER'S 240. The Archer's whole identity (Lewis's B9)
    // is being the longest reach in Palopa, and the Cow Killer Bee's fight
    // depends on it. 200 is plainly the same kind of bat without taking the
    // Archer's crown.
    //
    // Its damage did NOT change. Being safe is the reward for standing back;
    // 3.3 dps is still a quarter of a Scout's, because this bat wins battles by
    // raising the dead and not by shooting anything.
    range: 200,            // <-- TRY ME: 40 and it walks into the fight and dies
    speed: 70,
    color: '#8f7fd6',      // only used by placeholder art - this bat has real art now
    sprite: 'necroBat',
    scale: 0.7,

    // ------------------- THE SUMMONING POWER -------------------
    // Every bat of yours that dies leaves a GRAVE where it fell. A
    // Necrobatcer raises one grave every "interval" seconds.
    summon: {
      interval: 5.0,       // <-- TRY ME: 1.0 and the dead never stay dead

      // Homework B24 (2026-09-19): Lewis kept it to his own bats only, and
      // asked for it to reach further. 320 -> 460, which is most of the way
      // across the lane (the two bases are about 800px apart), so a
      // Necrobatcer safely behind the line can still reach the front of it.
      range: 460,          // how far it can reach for a grave, in pixels
      hpFactor: 0.6        // a raised bat comes back with 60% of its health
      // Two rules are in the code, not here, because they stop the game
      // breaking rather than tune it:
      //   * a bat can only ever be raised ONCE (or one grave = infinite bats)
      //   * a Necrobatcer can never raise another Necrobatcer
    },

    // REAL ART - Lewis's 2026-09-19 drawing (homework B4): a bat SKULL with a
    // flaming staff, which is exactly right for something that raises the
    // dead. Single pose so far.
    anims: {
      frameWidth: 100,
      frameHeight: 64,
      idle:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      walk:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      attack: { start: 0, end: 0, frameRate: 1, repeat: 0  },
      death:  { start: 0, end: 0, frameRate: 2, repeat: 0  }
    }
  },

  /* =====================================================================
     THE ARCHER BAT - Lewis's fourth bat (homework B9 = A, 2026-09-19)
     =====================================================================
     The first bat that does NOT have to walk into the fight. It stops a long
     way back and shoots over the top of everyone.

     Why it exists, in Dad's words: a battle used to end with your base at
     100% or 0% and nothing in between, because whoever won the scrap in the
     middle took everything and no bat could reach past it. The Archer is the
     bat that can.

     The whole power is ONE NUMBER: range 240 instead of the Scout's 40.
     src/systems/combat.js already honoured any reach, so this needed no new
     code at all - which is why it was measured before it was promised.

     It is expensive and made of paper on purpose. Per energy spent it does
     LESS damage than a Scout; what you are paying for is a bat that keeps
     shooting because nothing can touch it. Let one get caught alone and it
     pops instantly.
     ===================================================================== */

  archerBat: {
    name: 'Archer Bat',
    cost: 45,
    // Below cost / energyPerSecond (45 / 13 = 3.46s), so money is the limit
    // and a slow tap costs nothing. See the Scout's note above.
    cooldown: 3.0,
    hp: 24,                // <-- paper. One scorpion sting and it is gone.

    // MEASURED, and this took a few goes. At attack 14 it was 12.7 dps, which
    // is 0.28 damage per energy spent against a Scout Bat's 0.53 - less than
    // half. A bat that costs nearly twice a Scout and does half the damage per
    // coin is not "expensive but safe", it is just bad, and the balance sim
    // showed the whole army getting weaker whenever the button was offered.
    //
    // At 22 it is the right shape instead: STRONGER than a Scout per bat
    // (20.0 dps against 13.3), still WEAKER per energy (0.44 against 0.53).
    // So you are paying a premium for a bat nothing can reach - which is the
    // trade it was invented to offer.
    attack: 22,
    attackInterval: 1.1,   // 20.0 dps
    range: 240,            // <-- THE WHOLE POINT. The Scout's is 40.
    speed: 75,
    color: '#7ce0a8',      // only used by placeholder art - this bat has real art now
    sprite: 'archerBat',

    // Drawn 64x38 on screen: between the Scout (83x35) and the Necrobatcer
    // (70x45), which is right for the bat with 24 health. It should not look
    // like a heavy.
    scale: 0.6,

    // REAL ART - Lewis's 2026-09-21 drawing, and the fourth and last bat. Drawn
    // to his own B4 brief - big round body, wings, ears, no legs, black and
    // white - and then given a BOW with an arrow already nocked, which nobody
    // asked for and is exactly how you read "the bat that shoots from 240px".
    //
    // ONE THING WORTH KNOWING BEFORE THE COLOUR LADDER IS WIRED UP: the source
    // is a fine line drawing at 1536px, and shrinking it to a 64-tall frame
    // blends those thin black lines into the white. Measured: 64.7% light
    // pixels in the original, 47% in the frame. The other three bats are 66-70%.
    //
    // That does not matter yet and matters later. A tint MULTIPLIES, so light
    // areas take the colour and grey ones come out muddy. If the Archer looks
    // dull next to the others once upgrades exist (B23), re-import it at a
    // 128-tall frame with scale 0.3 - same size on screen, 57% light. It was
    // measured at 64/128/192 and at today's size the three are
    // indistinguishable, so consistency won.
    anims: {
      frameWidth: 106,
      frameHeight: 64,
      idle:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      walk:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      attack: { start: 0, end: 0, frameRate: 1, repeat: 0  },
      death:  { start: 0, end: 0, frameRate: 2, repeat: 0  }
    }
  },

  /* TODO for Lewis - fun bats to invent later:
     - healerBat:  needs a new "heal" power in the code, ask Dad
     - ghostBat:   walks past enemies without fighting until it reaches the base
  */

  /* =====================================================================
     THE ENEMY - the things bats EAT (homework B1 + B3, 2026-09-19)
     =====================================================================
     "The enemies of the bats are things that they eat. Mosquitos,
      scorpions, spiders."  - Lewis

     Exactly the same list of numbers as your bats, just with  enemy: true

     All three are still PLACEHOLDER art, drawn by the game itself. The
     colours below are a guess at each bug until Lewis draws them.
     ===================================================================== */

  // The little one. Fast, annoying, dies easily - a mosquito.
  mosquito: {
    name: 'Mosquito',
    enemy: true,           // <-- this is what makes it a bad guy
    cost: 0,               // enemies are spawned by the level, not bought
    cooldown: 0,
    hp: 55,
    attack: 7,
    attackInterval: 0.8,
    range: 38,
    speed: 62,
    color: '#a8c88a',      // only used by placeholder art - this bug has real art now
    sprite: 'mosquito',
    scale: 0.72,           // drawn 65x46: smaller than a Scout Bat, as it should be

    // REAL ART - Lewis's 2026-09-22 drawing. All that proboscis and a mouthful
    // of teeth. Drawn in PROFILE facing west, then flipped at import so the
    // stored sprite faces east like everything else in the repo - the game
    // mirrors anything with enemy: true, which turns it back to face your bats.
    anims: {
      frameWidth: 90,
      frameHeight: 64,
      idle:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      walk:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      attack: { start: 0, end: 0, frameRate: 1, repeat: 0  },
      death:  { start: 0, end: 0, frameRate: 2, repeat: 0  }
    }
  },

  // The heavy one. Armoured, slow, hits like a hammer - a scorpion.
  scorpion: {
    name: 'Scorpion',
    enemy: true,
    cost: 0,
    cooldown: 0,
    hp: 190,
    attack: 26,
    attackInterval: 1.5,
    range: 44,
    speed: 38,
    color: '#c8873f',      // only used by placeholder art - this bug has real art now
    sprite: 'scorpion',
    scale: 0.91,           // drawn 84x58: bulkier than any of your bats but the Brute

    // REAL ART - Lewis's 2026-09-22 drawing: armour plating, spikes down the
    // tail and two enormous claws, which is exactly the "hits like a hammer"
    // this bug has always been in the numbers. Flipped at import to face east.
    anims: {
      frameWidth: 92,
      frameHeight: 64,
      idle:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      walk:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      attack: { start: 0, end: 0, frameRate: 1, repeat: 0  },
      death:  { start: 0, end: 0, frameRate: 2, repeat: 0  }
    }
  },

  /* =====================================================================
     THE COW KILLER BEE - the boss (homework B8 = A, 2026-09-19)
     =====================================================================
     "One big boss, 'cow killer bee', that looks like a queen bee with a very
      long stinger."  - Lewis

     One boss, at the very end of the game: the last wave of cave 10, the
     Final Stadium. Nothing else in Palopa comes close to it.

     THE LONG STINGER IS THE FIGHT. Taking Lewis's description literally, the
     stinger is REACH: range 130, against a Scout Bat's 40. So the boss stands
     back and kills your whole front line without ever being touched by it.
     Brute Bats and Scout Bats simply cannot answer that.

     The Archer Bat can - range 240 out-reaches the stinger's 130. (So does the
     Necrobatcer's 200, since 2026-09-20, but at 3.3 dps it would need twelve
     minutes on its own: standing safely out there is not the same as being able
     to kill her.) That is not
     a coincidence, it is the point: Lewis's two answers this round happen to
     be the lock and the key, so the boss is the fight his Archer was invented
     for. Measured: the Final Stadium is winnable with Archers and a grind
     without them.
     ===================================================================== */
  cowKillerBee: {
    name: 'Cow Killer Bee',
    enemy: true,
    cost: 0,
    cooldown: 0,
    hp: 2400,              // <-- TRY ME: the whole cave is balanced round this
    attack: 55,
    attackInterval: 1.8,   // 30.6 dps - three times a Scorpion's
    range: 130,            // <-- THE LONG STINGER. Out-reaches every melee bat.
    speed: 26,             // a queen does not hurry
    color: '#e8c33f',      // only used by placeholder art - the boss has real art now
    sprite: 'cowKillerBee',
    scale: 0.82,           // <-- drawn 161x105, and still looms over everything

    // REAL ART - Lewis's 2026-09-22 drawing, and he delivered on his own brief
    // exactly: a QUEEN (she is wearing a crown) with a VERY LONG STINGER. The
    // stinger is most of her length, which is the fight made visible - you can
    // see why a Scout Bat at reach 40 never touches her.
    //
    // HER FRAME IS 128 TALL, NOT 64. She is drawn 105px on screen, so a 64-tall
    // frame would have to be scaled UP and would come out soft. Every other
    // unit is 64 because every other unit is drawn smaller than that.
    anims: {
      frameWidth: 196,
      frameHeight: 128,
      idle:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      walk:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      attack: { start: 0, end: 0, frameRate: 1, repeat: 0  },
      death:  { start: 0, end: 0, frameRate: 2, repeat: 0  }
    }
  },

  /* The third thing bats eat. Sits in between the Mosquito and the Scorpion:
     tougher than a mosquito, quicker than a scorpion.

     It is deliberately NOT in Level 1's waves. Level 1 is measured and
     balanced (see DECISIONS.md D8) and dropping a new enemy into it would
     throw that away. The Spider is ready for Level 2.

     FOR LEWIS: to put spiders in a level, add a line to that level's waves in
     data/levels.js, e.g.   { time: 22, enemy: 'spider', count: 2, gap: 1.0 },
     then run  node tools/balance-sim.js  to see what it did. */
  spider: {
    name: 'Spider',
    enemy: true,
    cost: 0,
    cooldown: 0,
    hp: 110,
    attack: 13,
    attackInterval: 1.0,   // 13 dps - between the other two
    range: 40,
    speed: 50,
    color: '#7a5f8f',      // only used by placeholder art - this bug has real art now
    sprite: 'spider',

    // Drawn 80x50, which puts it between the Mosquito (65x46) and the Scorpion
    // (84x58) - exactly where its numbers sit. All those legs make it wide.
    scale: 0.78,

    // REAL ART - Lewis's 2026-09-22 drawing, and THE LAST ONE. Every unit in
    // the game is now his: eight bristled legs, a fat spiked abdomen and a
    // pair of fangs. Flipped at import to face east.
    anims: {
      frameWidth: 103,
      frameHeight: 64,
      idle:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      walk:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      attack: { start: 0, end: 0, frameRate: 1, repeat: 0  },
      death:  { start: 0, end: 0, frameRate: 2, repeat: 0  }
    }
  },

  /* =====================================================================
     THE LATER CAVES' BUGS  (homework B26, 2026-09-20)
     =====================================================================
     Lewis was asked to name a bug for the desert, one for Dream Land and one
     for the Abyss of Darkness, and to say whether each was small and fast or
     big and slow. He gave all three, and one of them turned out to need real
     code rather than just numbers.

     Each one only appears in the caves he put it in - see data/levels.js.
     All three are PLACEHOLDER art for now; the colours below are the only
     thing telling them apart until they get drawn.
     ===================================================================== */

  /* ---------------------------------------------------------------------
     THE DESERT SCORPION - Sahara-hara Desert and Forgotten Oasis
     ---------------------------------------------------------------------
     "desert has scorpions (fast, every attack has a chance to kill you or
      kill itself)"   - Lewis

     This is the SECOND thing in the game with a power instead of just numbers,
     and the first one that gambles. Its rules are in src/systems/sting.js.

     It is a different creature from the plain Scorpion above, which is slow and
     armoured and lives in every cave. This one is the opposite: quick, not very
     tough, and dangerous in a way that has nothing to do with its damage.

     WHY ITS ORDINARY NUMBERS ARE MODEST. An instant kill ignores health
     completely, so the sting is already the scary part. If it also hit hard and
     had a lot of health it would be three threats in one bug. 12 dps is less
     than a Spider's 13 - you are not meant to fear its bite, you are meant to
     fear its luck.

     WHAT IT DOES TO YOUR ARMY, which is the interesting bit: an instant kill
     does not care whether it lands on a 40hp Scout or a 220hp Brute Bat. So the
     desert is the one place in Palopa where putting all your energy into one
     expensive bat is a bad idea, and a crowd of cheap ones is the safer answer.
     A cave that changes which army is correct is a cave with an identity.

     FOR LEWIS: this one is worth opening tools/balance-sim.js for. Because the
     sting is a coin flip, the sim plays these caves on TWENTY different runs
     and tells you how many it won - one lucky battle proves nothing.
     --------------------------------------------------------------------- */
  desertScorpion: {
    name: 'Desert Scorpion',
    enemy: true,
    cost: 0,
    cooldown: 0,
    hp: 120,               // fragile next to the plain Scorpion's 190
    attack: 12,
    attackInterval: 1.0,   // 12 dps - deliberately less than a Spider's 13
    range: 42,
    speed: 78,             // <-- FAST, as Lewis asked. A Mosquito does 62.
    color: '#e8b44a',      // only used by placeholder art - this bug has real art now
    sprite: 'desertScorpion',

    // Drawn 73x52, against the plain Scorpion's 84x58. Deliberately the lighter
    // of the two: this one is the fast gambler (120 health, speed 78), that one
    // is the armoured hammer (190 health, speed 38). They should not read as the
    // same animal, which is also what homework B28 is about.
    scale: 0.81,

    // ------------------- THE GAMBLING STING -------------------
    // Rolled fresh on EVERY attack. Both can happen on the same swing: it
    // stings your bat dead and bursts doing it.
    // MEASURED, and the interesting lesson of this whole bug. The first draft
    // was killChance 0.08 with 90 health, and the sting was INVISIBLE: the sim
    // showed each scorpion landing exactly 1.0 attacks before a Scout swarm
    // killed it, so 8% of one swing meant one stung bat every ten battles. A
    // signature power nobody ever sees is not a power.
    //
    // The obvious fix - a much bigger killChance - was measured and REJECTED. At
    // 30% the desert caves started losing outright (4-8 losses in 80 runs),
    // because an instant kill has no counterplay: a run of bad luck deletes the
    // front line and there is nothing a player could have done differently.
    //
    // What worked was MORE ROLLS, NOT LUCKIER ONES: 20%, a bit more health so it
    // survives to swing more than once, and more scorpions in the two desert
    // caves. Same number of bats lost on average, far thinner unlucky tail -
    // which is what "fair" means for something random. The two desert caves now
    // win on every one of 160 rolls of the dice.
    sting: {
      // <-- TRY ME: 0.5 and the desert becomes a horror film
      killChance: 0.20,      // chance this hit kills the bat outright

      // Bigger than killChance on purpose, so the sting usually costs the
      // scorpion its own life. Each one expects to take about two-thirds of a
      // bat with it (0.20 / 0.30) before it bursts.
      backfireChance: 0.30   // chance it kills ITSELF instead
      // Three rules are in src/systems/sting.js rather than here, because they
      // stop the game being unfair rather than tune it:
      //   * a sting can NEVER instantly kill a base - one roll must not decide
      //     a whole cave
      //   * it cannot finish off something already dying
      //   * the backfire is rolled on every attack, even against a building
    },

    // REAL ART - Lewis's 2026-09-22 drawing. Spikier and hairier than the plain
    // Scorpion, with its fangs out and its tail already cocked - which suits the
    // bug whose whole idea is that every swing is a coin flip. Drawn in profile
    // facing west and flipped at import, like all the bugs.
    anims: {
      frameWidth: 90,
      frameHeight: 64,
      idle:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      walk:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      attack: { start: 0, end: 0, frameRate: 1, repeat: 0  },
      death:  { start: 0, end: 0, frameRate: 2, repeat: 0  }
    }
  },

  /* ---------------------------------------------------------------------
     THE EVIL BUTTERFLY - Dream Land
     ---------------------------------------------------------------------
     "Dream Land has evil butterfly (don't really move, they hover like a wall
      to protect the tower)"   - Lewis

     A bug that does not walk, which nothing else in the game does. The whole
     thing is ONE NUMBER: speed 0.

     That needed no new code at all, because a unit that never moves simply
     stays where it spawned - and enemies spawn just in front of the enemy
     tower. So a wave of butterflies appears as a living wall across the
     fortress door, exactly as Lewis described it, and your bats have to eat
     through them to reach the building.

     IT IS A SHIELD, NOT A KILLER. 6.9 dps is the feeblest attack of any bug in
     Palopa. What it costs you is TIME, and time is what the late waves are
     built to punish - so a butterfly wall hurts by letting the bugs behind you
     catch up.

     Dream Land's fortress was made smaller when these arrived (see
     data/levels.js). The butterflies are part of the tower's defence now, so
     the tower itself did not need to be as thick.
     --------------------------------------------------------------------- */
  evilButterfly: {
    name: 'Evil Butterfly',
    enemy: true,
    cost: 0,
    cooldown: 0,
    hp: 190,               // a wall's worth of health
    attack: 9,
    attackInterval: 1.3,   // 6.9 dps - the weakest attack in the game
    range: 40,
    speed: 0,              // <-- THE WHOLE POINT. It hovers and never advances.
    color: '#d98ae0',      // only used by placeholder art - this bug has real art now
    sprite: 'evilButterfly',
    scale: 1.03,           // drawn 84x66: the tallest ordinary bug, so the wall reads

    // REAL ART - Lewis's 2026-09-22 drawing, and the best joke in the set: the
    // wings have ANGRY EYES patterned into them, so the thing glares at you
    // twice over. Flipped at import to face east.
    anims: {
      frameWidth: 82,
      frameHeight: 64,
      idle:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      walk:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      attack: { start: 0, end: 0, frameRate: 1, repeat: 0  },
      death:  { start: 0, end: 0, frameRate: 2, repeat: 0  }
    }
  },

  /* ---------------------------------------------------------------------
     THE LIGHTNING BUG - Abyss of Darkness
     ---------------------------------------------------------------------
     "abyss of darkness has lightning bugs (slow and weak)"   - Lewis

     Slow and weak, and nothing else - no power, because Lewis did not ask for
     one. A lightning bug is a firefly, so in the cave with no light these are
     the only things you can see down there, which is a lovely idea and costs
     nothing to honour: they are the brightest colour of any bug in the game.

     Being slow AND weak makes them the gentlest bug in Palopa, so the Abyss
     gets MORE of them rather than tougher ones.

     MEASURED, because "they add atmosphere" is not a design: the twenty of them
     make the Abyss take 71s instead of 57s, a quarter longer. They do it purely
     by being in the way - at 45 health they die almost the moment they meet your
     front line, and never more than about three are alive at once, so what they
     really are is 900 extra health delivered in a steady trickle rather than a
     pile-up you can see.

     That is enough, and only just: making the swarms four bigger each lost ALL
     80 test runs. Slow and weak is a fine brief, but twenty small things still
     add up to a wall, and this cave was already the one whose first draft was
     unwinnable at every reaction time.
     --------------------------------------------------------------------- */
  lightningBug: {
    name: 'Lightning Bug',
    enemy: true,
    cost: 0,
    cooldown: 0,
    hp: 45,                // <-- WEAK. Dies to four Scout pokes.
    attack: 5,
    attackInterval: 1.1,   // 4.5 dps
    range: 36,
    speed: 26,             // <-- SLOW. The same crawl as the boss.
    color: '#d8f05a',      // only used by placeholder art - this bug has real art now
    sprite: 'lightningBug',
    scale: 0.59,           // drawn 56x38: the smallest thing in the game, as promised

    // REAL ART - Lewis's 2026-09-22 drawing. He gave it GLOWING antennae and a
    // GLOWING tail, drawn as little bursts of light - which is the one thing
    // that actually justifies putting fireflies in the cave with no light.
    anims: {
      frameWidth: 95,
      frameHeight: 64,
      idle:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      walk:   { start: 0, end: 0, frameRate: 1, repeat: -1 },
      attack: { start: 0, end: 0, frameRate: 1, repeat: 0  },
      death:  { start: 0, end: 0, frameRate: 2, repeat: 0  }
    }
  }
};
