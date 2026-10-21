/* =========================================================================
   SQUAD - one button, several bats (the Bat Bros, 2026-10-12)
   =========================================================================
   Most buttons send out one bat: tap Scout Bat, get a Scout Bat. A unit with
   a "squad" block in data/units.js sends out a little group of OTHER units
   instead:

       batBros: { cost: 35, squad: { unit: 'scoutBat', count: 2 }, ... }

   tap Bat Bros, pay 35, get two real Scout Bats.

   WHY THIS IS ITS OWN FILE. The game (src/scenes/BattleScene.js) and the
   balance sim (tools/balance-sim.js) each have their own "a button was
   tapped" code. If only the game knew about squads, the sim would think a
   Bat Bros tap sent out one bat and report balance for a game nobody plays -
   the exact mistake DECISIONS.md D11 exists to prevent. So both of them ask
   this file what to spawn, and neither knows the rule itself.
   ========================================================================= */

window.Squad = {};

/* -------------------------------------------------------------------------
   Which units one tap of this button sends out, as a list of unit keys.
   A plain bat is a squad of one: itself.
   ------------------------------------------------------------------------- */
window.Squad.membersOf = function (unitKey) {
  var squad = window.UNITS[unitKey].squad;

  if (!squad) {
    return [unitKey];
  }

  var members = [];
  var n;

  for (n = 0; n < squad.count; n++) {
    members.push(squad.unit);
  }

  return members;
};

/* -------------------------------------------------------------------------
   How many copies of the picture a button or Locker card draws.

   A squad shown with its MEMBER'S picture draws one per member, overlapped,
   so the button itself says "you get more than one". A squad with a picture
   of its own (the Bat Bros, 2026-10-17: both brothers in one drawing) already
   shows everybody, so it is drawn once.
   ------------------------------------------------------------------------- */
window.Squad.portraitCount = function (unitKey) {
  var stats = window.UNITS[unitKey];

  if (stats.squad && stats.sprite !== window.UNITS[stats.squad.unit].sprite) {
    return 1;
  }

  return window.Squad.membersOf(unitKey).length;
};

/* -------------------------------------------------------------------------
   HOW MANY AT ONCE (2026-10-21). A bat with  maxAlive  in data/units.js can
   only have that many of itself on the lane at a time - Lewis: "the archer
   bat [should] have a limit of 5 at once". Its button goes dark at the limit
   and lights again when one falls.

   Counted: your living bats of that kind, including any a Necrobatcer raised
   (they are on the lane like any other). A dying one no longer counts. The
   limit stops YOU sending another; it does not stop a Necrobatcer raising
   one, which is rare enough not to matter.

   'units' is the list of everything on the lane - the game and the balance
   sim each pass their own, so both play by exactly the same rule.
   ------------------------------------------------------------------------- */
window.Squad.aliveCount = function (unitKey, units) {
  var n = 0;
  var i;

  for (i = 0; i < units.length; i++) {
    if (units[i].active && !units[i].isDying && units[i].team === 'player' &&
        units[i].unitKey === unitKey) {
      n++;
    }
  }

  return n;
};

window.Squad.atLimit = function (unitKey, units) {
  var limit = window.UNITS[unitKey].maxAlive;
  return !!limit && window.Squad.aliveCount(unitKey, units) >= limit;
};

/* -------------------------------------------------------------------------
   Send out everyone one tap pays for.

   spawnFunction(memberKey, x) does the actual spawning - the game passes one
   that makes a drawn Unit, the sim passes one that makes a SimUnit.

   The first bat comes out at the base's door and each brother after it a
   little further back, so they walk out as a pair instead of stacked into
   one drawing. Your bats walk right, so "back" is to the left.
   ------------------------------------------------------------------------- */
window.Squad.deploy = function (unitKey, spawnX, spawnFunction) {
  var members = window.Squad.membersOf(unitKey);
  var spacing = window.CONFIG.squad.spacing;
  var i;

  for (i = 0; i < members.length; i++) {
    spawnFunction(members[i], spawnX - (i * spacing));
  }

  return members.length;
};
