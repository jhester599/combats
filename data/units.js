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
    cooldown: 2.0,         // seconds before you can send another Scout Bat
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

  /* TODO for Lewis - fun bats to invent later:
     - sniperBat:  huge range (like 250) but very low hp
     - healerBat:  needs a new "heal" power in the code, ask Dad
     - bossBat:    hp 2000, attack 120, and make it the last wave of a level
     - ghostBat:   walks past enemies without fighting until it reaches the base
  */

  /* =====================================================================
     THE ENEMY
     Exactly the same list of numbers, just with  enemy: true
     ===================================================================== */

  critter: {
    name: 'Cave Critter',
    enemy: true,           // <-- this is what makes it a bad guy
    cost: 0,               // enemies are spawned by the level, not bought
    cooldown: 0,
    hp: 55,
    attack: 7,
    attackInterval: 0.8,
    range: 38,
    speed: 62,
    color: '#ff9d5c',
    sprite: 'critter',
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

  bruiser: {
    name: 'Cave Bruiser',
    enemy: true,
    cost: 0,
    cooldown: 0,
    hp: 190,
    attack: 26,
    attackInterval: 1.5,
    range: 44,
    speed: 38,
    color: '#e8574d',
    sprite: 'bruiser',
    scale: 1,              // still placeholder art, drawn at its natural size
    anims: {
      frameWidth: 64,
      frameHeight: 64,
      idle:   { start: 0,  end: 1,  frameRate: 3,  repeat: -1 },
      walk:   { start: 2,  end: 5,  frameRate: 7,  repeat: -1 },
      attack: { start: 6,  end: 8,  frameRate: 9,  repeat: 0  },
      death:  { start: 9,  end: 12, frameRate: 7,  repeat: 0  }
    }
  }
};
