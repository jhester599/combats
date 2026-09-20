/* =========================================================================
   BATTLE BATS - THE CASINO GOODS
   =========================================================================
   Lewis's homework B22 invented a two-step economy, and B27 gave each of the
   three goods a different job:

     "potions and fruit are different, they are not just currency. you can use
      potions during a battle to make the opponent weaker. fruit can heal your
      tower, but only slightly. blood is just currency."   - Lewis

   So:

     beat a cave  ->  SUNS  ->  at the casino  ->  BLOOD / POTIONS / FRUIT
                                                        |
                                         trade them  or  gamble them
                                                        |
                                                    UPGRADE a bat's colour

   BLOOD is money and nothing else. POTIONS and FRUIT are things you carry into
   a battle and spend there, which makes them the first decision in this game
   that is not "which bat next".

   ------------------- WHAT EACH NUMBER MEANS -------------------
   name            the words on the item button
   battleUse       'weakenEnemies' or 'healBase'. Missing = no use in a battle.
   currencyOnly    true = this is money. It never appears on a battle button.
   color           the colour of the little icon drawn on its button

   potion.seconds        how long the bugs stay weakened
   potion.damageFactor   what their damage is multiplied by while it lasts
   fruit.healFraction    how much of your tower's FULL health one fruit gives
                         back. A fraction, not a flat number, so one fruit is
                         worth the same "slightly" in every cave.

   FOR LEWIS: change any number here, save, refresh. Try potion.seconds: 60 to
   see what a cave feels like with the bugs permanently soft.
   ========================================================================= */

window.ITEMS = {

  potion: {
    name: 'Potion',
    battleUse: 'weakenEnemies',
    color: 0x66e0b8,       // bottle green

    // <-- TRY ME: 0.1 makes the bugs almost harmless for ten seconds
    seconds: 10,
    damageFactor: 0.5,     // every bug hits for HALF while the potion lasts

    // What the floating message says when you drink one.
    shout: 'BUGS WEAKENED!'
  },

  fruit: {
    name: 'Fruit',
    battleUse: 'healBase',
    color: 0xf2607a,       // berry red

    // "but only slightly" - Lewis was specific, so this is deliberately small.
    // 8% of a 1400hp tower is 112 health: it undoes a bad moment, it does not
    // undo a bad battle.
    healFraction: 0.08,

    shout: 'TOWER HEALED'
  },

  blood: {
    name: 'Blood',

    // "blood is just currency" - so it has no battleUse and gets no button.
    // It is listed here anyway so the casino (milestone M4) has all three
    // goods in one place, and so nobody later assumes it does something.
    currencyOnly: true,
    color: 0xc0392b
  }
};
