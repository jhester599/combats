/* =========================================================================
   BATTLE BATS - GLOBAL CONFIG
   =========================================================================
   Every "how the game feels" number that is NOT about a single unit or a
   single level lives in this file.

   Rule for this project: code NEVER hardcodes gameplay numbers. If you find
   a number you want to tune, it belongs here (or in units.js / levels.js).

   FOR LEWIS: the fun things to try in here are marked with  <-- TRY ME
   ========================================================================= */

window.CONFIG = {

  /* ---------------------------------------------------------------------
     SCREEN
     The game is drawn at this size, then scaled to fit any phone or laptop
     screen. Think of it as the size of the "stage".
     --------------------------------------------------------------------- */
  screen: {
    width: 960,
    height: 540,
    backgroundColor: '#150f2b',  // the colour behind everything

    // Our bats are PIXEL ART. Without this the browser smooths them when they
    // are scaled and they go blurry; with it, every pixel stays a crisp square.
    pixelArt: true
  },

  /* ---------------------------------------------------------------------
     SIMULATION (the "brain" of the game)
     The game thinks in fixed little time slices so it behaves EXACTLY the
     same on a fast gaming PC and on an old phone.
     --------------------------------------------------------------------- */
  sim: {
    // How many times per second the game brain updates. 60 is a good number.
    stepsPerSecond: 60,

    // If you switch to another browser tab, time keeps passing but the game
    // is frozen. When you come back we must NOT try to catch up on all of it,
    // or the game would freeze solid ("spiral of death").
    // So we throw away anything longer than this many seconds.
    maxCatchUpSeconds: 0.25
  },

  /* ---------------------------------------------------------------------
     THE LANE
     Battle Bats happens on one horizontal line. Everything walks along it.
     --------------------------------------------------------------------- */
  lane: {
    y: 352,              // how far DOWN the screen the lane sits
    groundHeight: 96,    // thickness of the floor strip we draw
    groundColor: 0x2c1d4d,
    edgeColor: 0x4a3080,

    // When lots of bats pile onto the same enemy they end up at almost the
    // same spot. These scatter each bat a few pixels when it is DRAWN, so a
    // pile reads as a crowd instead of one blurry blob.
    //
    // IMPORTANT: this is PURELY VISUAL. The fight itself still uses the unit's
    // real position, so scattering never changes who can hit what.
    stackJitter: 13,     // up and down
    stackJitterX: 20     // left and right   <-- TRY ME: 0 for a neat single file
  },

  /* ---------------------------------------------------------------------
     BASES
     Player base on the LEFT, enemy base on the RIGHT.
     (HP for each base is set per level, over in levels.js)
     --------------------------------------------------------------------- */
  bases: {
    playerX: 78,         // centre of the player base
    enemyX: 882,         // centre of the enemy base
    width: 74,
    height: 150,
    playerColor: 0x3f6fd8,
    enemyColor: 0xc4453f,
    roofColor: 0x1d1338,

    // Where new units pop out (measured from the centre of their own base).
    spawnOffset: 46,

    // The "face" of a base is the side that gets attacked. Units stop this
    // far in from the base centre.
    faceInset: 34
  },

  /* ---------------------------------------------------------------------
     COMBAT RULES
     --------------------------------------------------------------------- */
  combat: {
    // A bat only attacks things IN FRONT of it. This little number lets it
    // also hit something just barely behind it, so units that are shoulder
    // to shoulder still fight instead of awkwardly ignoring each other.
    rearReach: 12,

    // How much elbow room a unit gives the friend in front of it.
    //
    // IMPORTANT TRADE-OFF (worth understanding before you change this):
    // The bat at the front stops as soon as the enemy is at the very edge of
    // its range. So ANY spacing bigger than 0 puts the bats behind it out of
    // range, and only the front bat can actually fight. Your whole army ends
    // up doing the damage of one bat, and battles turn into a long grind.
    //
    // 0  = a proper swarm: everyone piles in and ALL of them attack.
    //      This is how The Battle Cats feels, and it is the default.
    // 26 = a tidy single-file queue, but only the front bat fights.
    //      <-- TRY ME: set this to 26 and watch how much slower a battle is.
    personalSpace: 0,

    // How many graves a Necrobatcer can choose from (src/systems/necro.js).
    // Every bat of yours that dies leaves one, so in a long battle the list
    // would grow for ever - and this game is careful never to pile up objects
    // (see the pool). Past this many, the OLDEST grave is forgotten.
    //
    // It reads as a rule too: a bat that fell ages ago is long gone.
    maxGraves: 40        // <-- TRY ME: 3 and only the freshly fallen come back
  },

  /* ---------------------------------------------------------------------
     BAT UPGRADE COLOURS  (Lewis's homework answer B4, 2026-09-19)
     ---------------------------------------------------------------------
     "Black and white for level 1 bats, then as you buy upgrades to level up
      your bats, they change color, backwards rainbow (VIBGYOR)."  - Lewis

     So a bat starts as Lewis drew it - plain black and white - and climbs the
     rainbow BACKWARDS as it is upgraded. Red is the top of the ladder.

     SIMPLIFIED to four steps by homework B23 = B (2026-09-19). Lewis had said
     he might "simplify down a bit", and seven upgrades per bat would have been
     seven prices to balance for every bat in the game. Violet, Blue, Yellow,
     Red keeps the rainbow reading the same way with a quarter of the work.

     THE CLEVER BIT, and the reason black-and-white art is a good call: a
     white drawing can be TINTED any colour by the engine. So Lewis draws each
     bat exactly ONCE, and the game makes all eight versions of it. Nobody has
     to draw eight Scout Bats.

     NOT WIRED UP YET. There is nothing to spend upgrades on until the suns
     and the casino exist (homework B13, milestone M4). This is the agreed
     ladder, parked here so it is decided rather than remembered.
     --------------------------------------------------------------------- */
  upgradeTiers: [
    { name: 'Plain',  tint: 0xffffff },   // as drawn: black and white
    { name: 'Violet', tint: 0x9d5cf6 },
    { name: 'Blue',   tint: 0x2f8ff0 },
    { name: 'Yellow', tint: 0xf2d02a },
    { name: 'Red',    tint: 0xe03028 }    // the top of the ladder
  ],

  /* ---------------------------------------------------------------------
     HEALTH BARS (the little green/red bars above everyone)
     --------------------------------------------------------------------- */
  healthBar: {
    unitWidth: 34,
    unitHeight: 5,

    // How far above the TOP OF THE BAT its bar floats. The game works out each
    // bat's height itself (frame size x its scale), so a big bat's bar sits
    // higher than a small one's automatically - change a unit's scale and the
    // bar follows it.
    unitBarGap: 8,
    baseWidth: 88,
    baseHeight: 12,
    baseOffsetY: -104,
    backColor: 0x000000,
    backAlpha: 0.55,
    fillColorHigh: 0x5fe07a,   // healthy
    fillColorLow: 0xe05f5f,    // nearly dead
    lowThreshold: 0.35,        // below 35% HP the bar turns red

    // Hide a unit's bar until it has actually been hit. In a big pile of bats
    // this cuts a lot of clutter - you only see bars on the ones in trouble.
    // (Bases always show their bar, because that is how you win or lose.)
    hideUnitBarWhenFull: true   // <-- TRY ME: false to always show every bar
  },

  /* ---------------------------------------------------------------------
     ENERGY BAR (top-left) - the money you spend on bats
     --------------------------------------------------------------------- */
  energyBar: {
    x: 24,
    y: 22,
    width: 300,
    height: 28,
    backColor: 0x000000,
    backAlpha: 0.5,
    fillColor: 0xffd24a,
    borderColor: 0xffffff,
    borderAlpha: 0.35,

    // The number is drawn to the RIGHT of the bar, so it stays readable even
    // when the bar is nearly empty.
    labelGap: 12
  },

  /* ---------------------------------------------------------------------
     DEPLOY BUTTONS (the bottom bar you tap to send out bats)
     --------------------------------------------------------------------- */
  buttons: {
    // Keep  y + height  under screen.height (540) or the row gets cut off.
    y: 456,              // how far down the screen the row of buttons sits
    width: 168,
    height: 76,
    gap: 18,             // space between buttons
    startX: 24,          // left edge of the first button

    readyColor: 0x3a2c66,       // you can afford it and it is off cooldown
    unaffordableColor: 0x2a2440, // not enough energy
    pressedColor: 0x5a4790,
    borderColor: 0xffffff,
    borderAlpha: 0.5,

    cooldownOverlayColor: 0x000000,
    cooldownOverlayAlpha: 0.62,
    disabledTextAlpha: 0.45,

    // How big the little bat picture on each button is. This gets multiplied
    // by the unit's own "scale" from units.js, so a Scout Bat's portrait is
    // smaller than a Brute Bat's - same as on the battlefield.
    portraitScale: 0.7
  },

  /* ---------------------------------------------------------------------
     GRAVE MARKERS  (Lewis's homework answer B16 = D, 2026-09-19)
     ---------------------------------------------------------------------
     A little headstone is left where each of your bats falls, and it vanishes
     when a Necrobatcer raises it.

     Lewis chose this over a puff of dust or a ghost, and it is the better
     answer for a reason worth writing down: the Necrobatcer's rules were
     completely invisible. It can only raise a bat that really fell, and only
     one within summon.range of itself - so a resurrection looked like luck.
     Now the graves are on the ground, so a player can SEE where the summoner
     can reach and aim it. It turns a hidden rule into a decision.

     The positions were already being tracked (world.graves in
     src/systems/necro.js), so this draws what the game always knew.
     --------------------------------------------------------------------- */
  graveMarker: {
    width: 7,
    height: 11,
    color: 0xcfc6e6,
    alpha: 0.72,
    crossColor: 0x8a7fb0,
    yOffset: -6,          // how far above the lane line the stone sits
    maxDrawn: 40          // never draw more stones than CONFIG.combat.maxGraves
  },

  /* ---------------------------------------------------------------------
     THE MENU'S CAVE PICKER
     The title screen lists every cave in data/levels.js so they can all be
     reached. B10 asked for ten or more, so the list is a grid rather than a
     column - ten buttons stacked vertically would not fit on the screen.
     --------------------------------------------------------------------- */
  menu: {
    caveWidth: 150,
    caveHeight: 52,
    caveGap: 14,
    cavesPerRow: 5,        // 5 across x 2 rows holds the ten caves of B10
    caveRowY: 268,         // top row's centre line
    practiceY: 400,        // the "just for practice" row sits below the caves
    practiceWidth: 250,
    practiceHeight: 44
  },

  /* ---------------------------------------------------------------------
     TEXT STYLE
     --------------------------------------------------------------------- */
  text: {
    fontFamily: 'Verdana, Geneva, sans-serif',
    color: '#ffffff'
  },

  /* ---------------------------------------------------------------------
     PLACEHOLDER ART
     Until we drop in real drawings, the game paints its own simple bats.
     These colours are per-unit (see units.js), but the shape settings live
     here.
     --------------------------------------------------------------------- */
  placeholderArt: {
    outlineColor: '#120c24',
    eyeColor: '#ffffff',
    pupilColor: '#221133',
    wingAlpha: 0.9
  }

  /* TODO (fun later): add a "screenShake" block here and shake the camera
     when a base takes damage. */
};
