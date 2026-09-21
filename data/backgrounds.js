/* =========================================================================
   BATTLE BATS - THE CAVE BACKGROUNDS
   =========================================================================
   One painting per cave, and the one number that matters for each: WHERE THE
   GROUND IS.

   ------------------- WHY "ground" EXISTS -------------------
   Every one of these paintings has a flat surface the bats are meant to stand
   on, and it is in a different place in each picture - a stone floor here, a
   shelf of cloud there, a strip of desert somewhere else.

   The game, meanwhile, walks its bats along one fixed line: CONFIG.lane.y.

   So each picture says where its own ground is, as a FRACTION of its height
   (0 = the very top, 1 = the very bottom), and the game slides the painting up
   or down until that line meets the lane. Change the number, refresh, and the
   whole picture moves.

   FOR LEWIS: if a cave's bats look like they are floating above the ground or
   sunk into it, this is the number to nudge.
       BIGGER  (0.78 -> 0.82) = the bats stand LOWER down the picture
       SMALLER (0.78 -> 0.74) = the bats stand HIGHER up the picture
   Move it by about 0.01 at a time; that is roughly six pixels on screen.

   ------------------- THE OTHER TWO NUMBERS -------------------
   The paintings are much wider than they are tall (about 2.25 to 1), and the
   game's screen is 960x540 (1.78 to 1). So when a painting is scaled to fill
   the width, it does NOT reach the top and bottom of the screen.

   Rather than crop the art - which would throw away the edges of a picture
   somebody drew - the game fills the leftover strips with a flat colour taken
   from the painting's own top and bottom edges. On the dark caves the join is
   invisible. Those two colours are  skyColor  and  floorColor,  and they were
   measured from each painting rather than guessed.

   ------------------- ADDING ONE -------------------
   1. Put the picture in  assets/bg/<caveKey>.webp
   2. Add a line below with the same cave key as  data/levels.js  uses.
   3. Guess a ground of about 0.78, refresh, and nudge it.

   A cave with no entry here simply gets the old flat purple, so the game never
   breaks for want of a painting.
   ========================================================================= */

window.BACKGROUNDS = {

  crystalFalls: {
    file: 'crystalFalls.webp',
    ground: 0.800,        // the wet paved floor at the foot of the falls
    skyColor: 0x486f9d,
    floorColor: 0x171831
  },

  dreamLand: {
    file: 'dreamLand.webp',
    ground: 0.810,        // the shelf of cloud the castles sit above
    skyColor: 0x69a1fa,
    floorColor: 0xa8b6eb
  },

  abyssOfDarkness: {
    file: 'abyssOfDarkness.webp',
    // The darkest painting in the game, and the only one where the ground is a
    // thin rubble strip rather than a broad floor - hence the tighter number.
    ground: 0.745,
    skyColor: 0x08060c,
    floorColor: 0x050509
  },

  forgottenOasis: {
    file: 'forgottenOasis.webp',
    ground: 0.780,        // the sand in front of the glowing pool
    skyColor: 0x19252f,
    floorColor: 0x2c2a2e
  },

  finalStadium: {
    file: 'finalStadium.webp',
    ground: 0.780,        // the dirt floor of the arena, under the eclipse
    skyColor: 0x261321,
    floorColor: 0x0f0d10
  },

  /* ------------------- THE SECOND FIVE, 2026-09-21 -------------------
     These all sat at 0.780 once they were checked in the game. That is not
     laziness - the five were drawn to one composition, with the walkable
     surface in the same place each time, so they genuinely share a number.
     The first five did not, and range from 0.745 to 0.810. */

  level1: {
    file: 'level1.webp',
    // The Cave, and Lewis's B2 answer finally has a picture: a real cave, lit
    // only by the crystals growing out of its walls.
    ground: 0.780,
    skyColor: 0x13152b,
    floorColor: 0x0f1020
  },

  pyramid: {
    file: 'pyramid.webp',
    ground: 0.780,
    skyColor: 0x5479ac,
    floorColor: 0x805636
  },

  saharaDesert: {
    file: 'saharaDesert.webp',
    ground: 0.780,
    skyColor: 0x946897,
    floorColor: 0x995223
  },

  scarredWoods: {
    file: 'scarredWoods.webp',
    ground: 0.780,
    skyColor: 0x1a2c42,
    floorColor: 0x151b18
  },

  waitUm: {
    file: 'waitUm.webp',
    // The best joke in the whole game: "Wait Um" is a sky full of QUESTION
    // MARKS. Nobody briefed that - it came back from the name itself.
    ground: 0.780,
    skyColor: 0x5496f1,
    floorColor: 0xaabdf3
  }

  /* All ten caves of Palopa now have a painting. The Graveyard is a practice
     level rather than a real cave and falls back to the flat purple, which
     suits it - it is a workshop, not a place. */
};
