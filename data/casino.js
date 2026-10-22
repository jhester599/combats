/* =========================================================================
   COMBATS - SUNS AND THE CASINO (milestone M4, built 2026-10-21)
   =========================================================================
   Lewis designed this over four homework answers:

     B13  "you earn money ('suns') for beating a cave. The suns can be saved
           and spent in the casino to upgrade your bats or buy other things"
     B22  "At the casino you exchange suns for blood, potions, fruits that you
           can trade or gamble for upgrades"
     B27  potions and fruit are things you USE in a battle; blood is just money
     B29  (Jeff, 2026-10-21) "you buy/gamble for potions and fruit at the
           casino, with suns"

     Jeff, 2026-10-21: "we are going to make new bat types that you can only
           buy/gamble at the casino. the currency for bats is blood, which you
           exchange for using suns. there will be several potential new bats
           at the casino"

   So:

     beat a cave  ->  SUNS  ->  the casino  ->  buy POTIONS and FRUIT
                                            ->  or GAMBLE for them
                                            ->  swap for BLOOD  ->  buy a CASINO BAT
                                                                ->  or GAMBLE for one
                                                                ->  UPGRADE a bat

   Every number below is a first guess, marked TRY ME. The rules that use them
   are in src/systems/casino.js; the screen is src/scenes/CasinoScene.js.
   ========================================================================= */

window.CASINO = {

  /* --- SUNS: what a win pays --------------------------------------------
     A FIRST win pays more the further into Palopa the cave is - cave 1 pays
     firstWinBase + firstWinPerCave, cave 10 pays firstWinBase + 10 x that.
     Winning a cave AGAIN still pays something, so a stuck player can always
     earn a potion by replaying an easy cave. Losing pays nothing. */
  firstWinBase: 20,        // <-- TRY ME
  firstWinPerCave: 10,     // <-- TRY ME: cave 1 = 30 suns, cave 10 = 120
  replayWin: 10,           // <-- TRY ME: every win after the first

  /* --- THE SHOP: what things cost, in suns ------------------------------ */
  prices: {
    potion: 20,            // <-- TRY ME
    fruit: 15              // <-- TRY ME
  },

  /* --- BLOOD: what a sun is worth -------------------------------------
     Jeff, 2026-10-22: "1 sun buys 5 blood". The casino offers a swap of
     each size in swapSizes, so nobody has to tap 20 times to swap 20 suns. */
  bloodPerSun: 5,
  swapSizes: [1, 10],      // suns per tap, one button each

  /* --- THE GAMBLE: one spin, for potions and fruit ----------------------
     Pay spinCost suns and the wheel picks ONE of the prizes below. "weight"
     is how likely it is compared with the others - a prize with weight 20
     comes up twice as often as one with weight 10.

     THE FAIRNESS RULE: a spin can only ever cost you the spin. You never lose
     potions, fruit, blood or anything you already own (B22: a bad gamble costs
     you stuff, never your progress).

     On average a spin is worth a little LESS than the suns it costs if you
     had spent them in the shop (about 86p in the pound) - that is what makes
     it a gamble and not a better shop. The jackpot is why you would. */
  spinCost: 15,            // <-- TRY ME
  prizes: [
    { name: 'Nothing!',        potion: 0, fruit: 0, weight: 45 },
    { name: '1 fruit',         potion: 0, fruit: 1, weight: 25 },
    { name: '1 potion',        potion: 1, fruit: 0, weight: 17 },
    { name: '2 fruit',         potion: 0, fruit: 2, weight: 7 },
    { name: '2 potions',       potion: 2, fruit: 0, weight: 4 },
    { name: 'JACKPOT! 3 + 3',  potion: 3, fruit: 3, weight: 2 }
  ],

  /* --- THE BAG -----------------------------------------------------------
     Potions and fruit you own are saved, and come with you into every cave.
     You take at most this many of EACH into one battle, so the caves stay
     about strategy rather than whoever hoarded most - the rest stay in the
     bag. Whatever you use in a battle is gone. */
  maxPerBattle: 3,         // <-- TRY ME

  /* --- CASINO BATS: bats you can only get here, for blood -------------
     A casino bat is an ordinary bat in data/units.js with a  casinoPrice  -
     the blood it costs on the shelf. That is the whole difference: it never
     comes from beating a cave, and once you own it, it is in your Locker for
     every cave from then on.

     Or gamble for one: a BAT SPIN costs batSpin.cost blood and wins one of the
     casino bats you do not own yet, picked at random, batSpin.winChance of the
     time. Otherwise it wins nothing - and, like every spin, costs only the
     spin. You cannot bat-spin once you own them all.

     Price casino bats in blood at 5 a sun: 250 blood is 50 suns. */
  batSpin: {
    cost: 150,             // <-- TRY ME: blood per bat spin (30 suns' worth)
    winChance: 0.25        // <-- TRY ME: 1 spin in 4 wins a bat
  },

  /* --- UPGRADES: a bat's colour, bought with blood ----------------------
     The ladder itself (Plain, Violet, Blue, Yellow, Red) is upgradeTiers in
     data/config.js. Each kind of bat climbs it SEPARATELY. upgradeCost[n] is
     the blood for step n (the first is Plain -> Violet).

     Each step makes that kind of bat tougher AND hit harder by statBoost, so
     a Red bat has (1 + 4 x 0.15) = 1.6 times the health and attack it
     started with. Bats whose attack is 0 (Cheer, Engineer, Bomb, Rabies) get
     the health. */
  upgradeCost: [100, 200, 350, 550],   // <-- TRY ME: 1200 blood (240 suns) from Plain to Red
  statBoost: 0.15                   // <-- TRY ME: +15% health and attack a step
};
