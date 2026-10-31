# ComBats — Roadmap 🗺️

Ideas we **like** but haven't built yet, kept here so they aren't lost between
play-testing sessions. Nothing here is decided until it moves into `DESIGN.md`
and gets a row in `DECISIONS.md`. The questions Lewis needs to answer first are
in `HOMEWORK.md` (B32–B37).

*Started 2026-10-22, after Lewis asked for the title screen and casino to "look
much cooler". The title-screen half of that is built (D84); this is the rest.*

---

## 🎰 Making the casino cooler

Today the casino is three columns of buttons on a flat purple screen, and a spin
is a line of text. Ideas, roughly from biggest difference to smallest:

| # | Idea | What it would be | Needs |
|---|---|---|---|
| C1 | **A real slot machine** | The spin becomes three spinning reels of ☀ / potion / fruit / skull symbols, a lever to pull, chasing lights round the edge, and a coin shower on a jackpot. | Code only (Lewis's symbols later, B34) |
| C2 | **A neon sign** | "THE CASINO" in glowing letters with a couple of flickering bulbs, and a light-bulb border round the screen. | Code only |
| C3 | **Numbers that move** | Suns count down when you spend; a bought potion flies into your bag; blood drips into its counter. | Code only |
| C4 | **Casino bats in the spotlight** | Each casino bat on a pedestal under a spotlight; ones you don't own are a silhouette. The bat spin becomes a curtain that opens on a *"Who's that bat?"* reveal. | Code only |
| C5 | **The paint shop** | An upgrade dunks the bat in a paint bucket and it comes out in its new colour, with a sparkle. Shows the next colour before you pay. | Code only |
| C6 | **Rooms instead of columns** | Tabs for the **Shop**, the **Slots**, the **Bat Den** and the **Paint Shop**, so each gets the whole screen instead of a crowded third of it. | Code only |
| C7 | **A dealer bat** | A host in a top hat and bow tie who talks in speech bubbles — *"Not enough suns, kid!"* — instead of the line of text at the bottom. | Lewis draws it (B33) |
| C8 | **Little icons** | A sun, a blood drop, a potion and a fruit, instead of words, everywhere the game shows money or items. | Lewis draws them (B34) |
| C9 | **More casino bats** | Jeff: *"there will be several potential new bats at the casino."* The Ghost Bat is the first (D82). Adding one is a block in `data/units.js` with a `casinoPrice`. | Lewis invents them (B35) |

**Suggested first casino PR:** C1, C2, C3 and C5 — they need no new art and they
change how the casino *feels* the most. C7 and C8 drop in whenever Lewis's
drawings arrive.

### Rules the cooler casino keeps

These are about fairness, not looks, so they hold whatever the screen does:

- **Honest odds.** No fake near-misses on the reels (stopping one symbol short
  of a jackpot on purpose), and the machine shows its prize odds. The wheel's
  odds are already written in `data/casino.js`.
- **A spin only ever costs the spin.** Nothing you already own is ever bet
  (B22). Animations change how a result is *shown*, never what it is.
- **The result is decided first, then animated.** The reels land on what
  `Casino.spin()` already picked, so the slot machine can never disagree with
  the rules or the tests (`tools/casino-test.js`).

---

## 🏞️ Title screen — what's left

Ideas 1–5 and 7 are built (D84). Parked:

| # | Idea | What it would be | Needs |
|---|---|---|---|
| T6 | **A map of Palopa** | A drawn map with the ten caves joined by a path, and your bats walking along it to the next cave — instead of two rows of buttons. The biggest upgrade, and the most work. | Lewis draws the map (B36) |

---

## 🔐 The Vault

*Jeff, 2026-10-31: "we are thinking on adding something to combats called the
vault. When you beat 5 maps you get a prize the first prize is 50 blood."*

| What's settled | |
|---|---|
| **What fills it** | **Every cave win, replays too** (Jeff, 2026-10-31). Graveyard practice wins don't count, the same as they pay no suns. |
| **When it opens** | Every **5 wins**. Then it starts filling again, so it keeps paying after cave 10. |
| **The first prize** | **50 blood.** |
| **The prizes after that** | **Not decided yet** — Lewis's question, **B37** in `HOMEWORK.md`. |

**How big is 50 blood?** 1 sun buys 5 blood, so it is **10 suns' worth** —
about one replay of cave 1, or a third of a Violet upgrade (100 blood). Five
wins already pay at least 50 suns, so the first prize is a nice bonus on top, not
a new way to get rich. Bigger later prizes are fine; the numbers to beat are a
Ghost Bat (300 blood) and Plain → Red (1200 blood).

**Ideas for what it could look like** (code only, no art needed to start): a
round vault door on the title screen or in the casino with **five lights** that
fill one per win; on the fifth, the wheel spins, the door swings open and the
prize drips into the blood counter.

**To build it** (small): a `vaultWins` count in the save (`src/systems/progress.js`),
the prize list in `data/casino.js` as a TRY ME number, one call in the win
code next to where suns are paid, and checks in `tools/casino-test.js`.

---

## 🔊 Sound — for every screen

Still open as **B15**. Music, a *"cha-ching"* when you buy, reels clicking, a
jackpot fanfare, a squeak when you tap a flying bat on the title screen. Sound
would lift every screen more than any single picture would.

---

## How something leaves this file

1. Lewis answers its question in `HOMEWORK.md` (or Jeff says "build it").
2. It's built in a PR, play-tested, and merged.
3. Its row here is deleted, and it gets a decision in `DECISIONS.md`.
