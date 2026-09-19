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
      range: 320,          // how far it can reach for a grave, in pixels
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

  /* TODO for Lewis - fun bats to invent later:
     - sniperBat:  huge range (like 250) but very low hp
     - healerBat:  needs a new "heal" power in the code, ask Dad
     - bossBat:    hp 2000, attack 120, and make it the last wave of a level
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
