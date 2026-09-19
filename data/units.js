/* =========================================================================
   BATTLE BATS - ALL THE UNITS
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
    scale: 0.75,           // <-- TRY ME: makes the Scout look small and nippy

    // REAL ART from PixelLab, packed by tools/pack-spritesheet.js.
    // The sheet is one pose + a 16-frame walk cycle = 17 frames.
    //
    // Two animations share frame 0 on purpose: there is no attack or death art
    // yet, so both fall back to the standing pose. When Lewis draws them, put
    // the new frames in assets/sprites/source/scoutBat/, re-run the packer, and
    // paste the block it prints over this one.
    anims: {
      frameWidth: 64,
      frameHeight: 64,
      idle:   { start: 0, end:  0, frameRate: 1,  repeat: -1 },  // -1 = loop forever
      walk:   { start: 1, end: 16, frameRate: 16, repeat: -1 },  // <-- TRY ME: flap speed
      attack: { start: 0, end:  0, frameRate: 1,  repeat: 0  },  // no attack art yet
      // No death art either. With one frame, frameRate only sets how long the
      // fade-out lasts: 1 frame / 2 per second = half a second.
      death:  { start: 0, end:  0, frameRate: 2,  repeat: 0  }
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
    scale: 1.05,           // <-- TRY ME: makes the Brute loom over the Scout

    // REAL ART from PixelLab - still a single pose, so the Brute does not flap
    // yet. Give it a walk grid like the Scout's and it will.
    anims: {
      frameWidth: 64,
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
    range: 60,             // hangs back a little further than the others
    speed: 70,
    color: '#8f7fd6',      // placeholder art until Lewis draws it
    sprite: 'necroBat',
    scale: 0.9,

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

    anims: {
      frameWidth: 48,
      frameHeight: 48,
      idle:   { start: 0,  end: 1,  frameRate: 3,  repeat: -1 },
      walk:   { start: 2,  end: 5,  frameRate: 8,  repeat: -1 },
      attack: { start: 6,  end: 8,  frameRate: 10, repeat: 0  },
      death:  { start: 9,  end: 12, frameRate: 8,  repeat: 0  }
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
    color: '#7ce0a8',      // placeholder art until Lewis draws it
    sprite: 'archerBat',
    scale: 0.8,

    anims: {
      frameWidth: 48,
      frameHeight: 48,
      idle:   { start: 0,  end: 1,  frameRate: 4,  repeat: -1 },
      walk:   { start: 2,  end: 5,  frameRate: 10, repeat: -1 },
      attack: { start: 6,  end: 8,  frameRate: 12, repeat: 0  },
      death:  { start: 9,  end: 12, frameRate: 9,  repeat: 0  }
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
    color: '#a8c88a',      // placeholder: pale insect green
    sprite: 'mosquito',
    scale: 1,              // still placeholder art, drawn at its natural size
    anims: {
      frameWidth: 48,
      frameHeight: 48,
      idle:   { start: 0,  end: 1,  frameRate: 4,  repeat: -1 },
      walk:   { start: 2,  end: 5,  frameRate: 10, repeat: -1 },
      attack: { start: 6,  end: 8,  frameRate: 12, repeat: 0  },
      death:  { start: 9,  end: 12, frameRate: 9,  repeat: 0  }
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
    color: '#c8873f',      // placeholder: sandy brown
    sprite: 'scorpion',
    scale: 1,              // still placeholder art, drawn at its natural size
    anims: {
      frameWidth: 64,
      frameHeight: 64,
      idle:   { start: 0,  end: 1,  frameRate: 3,  repeat: -1 },
      walk:   { start: 2,  end: 5,  frameRate: 7,  repeat: -1 },
      attack: { start: 6,  end: 8,  frameRate: 9,  repeat: 0  },
      death:  { start: 9,  end: 12, frameRate: 7,  repeat: 0  }
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

     The Archer Bat can - range 240 out-reaches the stinger's 130. That is not
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
    color: '#e8c33f',      // placeholder: queen-bee yellow
    sprite: 'cowKillerBee',
    scale: 1.6,            // <-- looms over everything else on the screen
    anims: {
      frameWidth: 64,
      frameHeight: 64,
      idle:   { start: 0,  end: 1,  frameRate: 2,  repeat: -1 },
      walk:   { start: 2,  end: 5,  frameRate: 5,  repeat: -1 },
      attack: { start: 6,  end: 8,  frameRate: 7,  repeat: 0  },
      death:  { start: 9,  end: 12, frameRate: 5,  repeat: 0  }
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
    color: '#7a5f8f',      // placeholder: dusty purple
    sprite: 'spider',
    scale: 1,
    anims: {
      frameWidth: 48,
      frameHeight: 48,
      idle:   { start: 0,  end: 1,  frameRate: 4,  repeat: -1 },
      walk:   { start: 2,  end: 5,  frameRate: 9,  repeat: -1 },
      attack: { start: 6,  end: 8,  frameRate: 11, repeat: 0  },
      death:  { start: 9,  end: 12, frameRate: 8,  repeat: 0  }
    }
  }
};
