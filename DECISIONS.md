# Battle Bats — Decision Log & Loop 📓

This is where **Lewis's creative-director decisions become official.** When he
answers homework, we run the loop below so the answer actually lands in the
game instead of getting lost between sessions.

---

## 🔁 The Decision Loop

```
Lewis answers homework  →  tells Dad his picks  →  Claude records them here
        │                                                    │
        │                                    updates DESIGN.md (clears [TO DECIDE])
        │                                                    │
        └──────────── ticks the question, commits ───────────┘
```

**To run the loop, just tell Claude the picks**, for example:

> "Lewis decided: B5 = A, the sniper bat, and he wants it called Zap.
>  B10 = B, five levels. B1 — the bats are guarding their cave from robots."

Claude then, for each decision:

1. **Logs it** in the table below — number, what was decided, why, date.
2. **Updates `DESIGN.md`** — finds the matching `[TO DECIDE]` (use §13's index)
   and replaces it with the decision, tagged **`DECIDED (date):`**.
3. **Ticks the question** in `HOMEWORK.md` and `HOMEWORK_BACKLOG.md` (🔲 → ✅).
4. **Builds it, if it's buildable** — a stats-only decision like a new bat is
   often just a block in `data/units.js` and can ship the same day.
5. **Commits** with a plain message, e.g. `decide: third bat is a sniper`.

**Small rule:** if a pick is unclear, or clashes with something already
decided, Claude **asks first**. We don't guess on Lewis's behalf.

**Second small rule:** a decision can be *changed later*. If something turns out
not to be fun when we play it, we supersede it — log the new one and mark the
old row ⚠️ with a pointer. Nothing here is permanent.

---

## 📋 Decisions Made

*Round 1 answered — 2026-09-19. Lewis answered all eight questions on the plate
and changed one earlier answer.*

| # | Question | Decision | Why | Date |
|---|---|---|---|---|
| 1 | **B4** (part) — what the player bats look like | ⚠️ **Superseded by 7.** Scout Bat = small brown bat in blue flight goggles. Brute Bat = heavier bat in a cape. | Lewis changed his mind on 2026-09-19 — entirely his call. The goggled and caped sprites are still in the game as placeholders until he draws the new ones. | 2026-09-18 |
| 3 | **B21** (part) — animate the bats? | **Yes.** Scout Bat has a **16-frame walk cycle**; Brute still one pose. Attack/death not drawn yet, so they reuse the standing pose. | Lewis made the frames in PixelLab. Packed with `tools/pack-spritesheet.js --frame 64`. | 2026-09-18 |
| 2b | Which way the art faces | **Everything is drawn facing east (right).** The first two sprites faced west and were re-exported mirrored. | The game flips enemies itself, so one rule covers both sides. Recorded in `assets/sprites/source/README.md`. | 2026-09-18 |
| 2 | Sizing two same-size sprites | Both art files are **64×64**; the size difference is done in game with a per-unit **`scale`** (Scout 0.75, Brute 1.05) | Lewis draws everything at one convenient size and we tune how big it looks without re-exporting. One number in `data/units.js`. | 2026-09-18 |
| 4 | **B1** — why are the bats fighting? | **They are hunting their food.** "The enemies of the bats are things that they eat. Mosquitos, scorpions, spiders." | A hunt needs no villain and no grudge, explains endless waves (a cave is full of bugs), and puts no ceiling on what can be in the next cave. `DESIGN.md` §1, §10 | 2026-09-19 |
| 5 | **B2** — the world and the first place | World = **Palopa**. First place = **The Cave**. It looks like **a wet cave**. | Level 1 renamed from the placeholder "First Cave" to **The Cave** in `data/levels.js`. The wet look is art, so it waits for M3. `DESIGN.md` §1 | 2026-09-19 |
| 6 | **B3** — who is the enemy? | **Mosquito**, **Scorpion**, **Spider.** Cave Critter → Mosquito, Cave Bruiser → Scorpion, and a Spider added in between. | Mapped by temperament, not invented: the Critter was already a mosquito (fast, frail) and the Bruiser a scorpion (armoured, slow, heavy hit). **Both kept their exact numbers**, so Level 1's measured balance is untouched. `DESIGN.md` §4 | 2026-09-19 |
| 7 | **B4** — what the bats look like (**replaces 1**) | **Hand-drawn, not realistic. A large circle, wings, ears, a mouth, no legs. Black and white**, then up a **backwards rainbow** (Violet→Indigo→Blue→Green→Yellow→Orange→Red) as you upgrade. | Lewis's call, and B&W turns out to be a *good engineering* call too: a white drawing can be tinted, so he draws each bat **once** and the game makes all eight colours. Ladder parked in `data/config.js` as `upgradeTiers`, not wired until M4. Brief in `ASSETS.md`. | 2026-09-19 |
| 8 | **B5** — the third bat | **E, invent one: the NECROBATCER** — a summoner that raises your dead bats to keep fighting. Cost 60, 70hp, a feeble 3.3 dps; raises one grave every 5s within 320px, at 60% health, **where the bat fell**. | Lewis's own invention over the four offered. Built and playable today. Rules in `src/systems/necro.js`, checked by `tools/necro-test.js` (20 checks). `DESIGN.md` §3 | 2026-09-19 |
| 9 | **B6** — special powers? | **Yes**, by implication of 8. | A summoner cannot exist as numbers alone, so choosing one settles B6. Not a guess — a consequence. `DESIGN.md` §3 | 2026-09-19 |
| 10 | **B7** — how strict is saving up? | **A, keep it strict.** "Choosing is the whole game." Economy unchanged: 13 energy/sec, Brute stays 90. | Lewis also wrote *"but level 1 is too difficult currently"* — which was the D8 cooldown bug, fixed but **not yet live on the site he was playing at the time**. No second difficulty change made: doing both would overshoot and undo his own "keep it strict". The fix went live 2026-09-19 12:22 UTC, so the next word on difficulty is his. `DESIGN.md` §3 | 2026-09-19 |
| 11 | **B10** — how many levels? | **C, ten or more caves.** "Should have a ton." | He was told plainly this is the most work and that some caves will be weaker, and picked it anyway. Means a cave has to be **pickable** (`STARTING_LEVEL` won't do), and makes `balance-sim.js` essential rather than nice. `DESIGN.md` §7 | 2026-09-19 |
| 12 | **B13** — does progress save? | **B, and more.** It remembers beaten caves, you earn **suns** for winning one, and suns are spent in **the casino** on bat upgrades and "other things you need later". | Turns M4 into three connected pieces: saving, a between-battles currency, and a shop. `DESIGN.md` §8 | 2026-09-19 |
| 13 | **B12** — how do you get new bats? | **A, by winning caves**, by implication of 12. | The B13 option Lewis picked says "you unlock bats by winning". `DESIGN.md` §8 | 2026-09-19 |
| 14 | **B19** — can you upgrade a bat? | **A, yes** — and an upgrade **shows as a colour**, by implication of 7 + 12. | Both answers have him spending suns to upgrade bats, and 7 says what an upgrade looks like. `DESIGN.md` §8, §9 | 2026-09-19 |
| 15 | **B17** — name the caves | **All ten, in order:** The Cave, Crystal Falls, Dream Land, Pyramid, Sahara-hara Desert, Wait Um, Scarred Woods, Abyss of Darkness, Forgotten Oasis, Final Stadium | Every one is built and on the title screen. The names drove the designs: "Wait Um" became the longest siege in the game, "Final Stadium" the boss arena. `DESIGN.md` §7 | 2026-09-19 |
| 16 | **B11** — what makes each cave different? | **"Each cave gets tougher, new bugs are introduced but not every level has a new bug. Some have less energy or tougher fortress or no warm up."** | Built as **one named lever per cave** so the difference is legible rather than mushy: a new bug (2), no warm-up (3, 7), a tougher fortress (4, 6), less energy (5), two levers at once (8), heavy bugs (9), the boss (10). `DESIGN.md` §7 | 2026-09-19 |
| 17 | **B9** — a long-range bat? | **A, yes: the ARCHER BAT.** Cost 45, 24hp, 20 dps, **reach 240** against a Scout's 40 | The first bat that does not walk into the fight, and the answer to the 100%-or-0% ending Dad had measured twice. Needed no new code - reach was always one number. `DESIGN.md` §3 | 2026-09-19 |
| 18 | **B8** — is there a boss? | **A, one big boss: the COW KILLER BEE**, "a queen bee with a very long stinger". 2400hp, 30 dps, **reach 130**, only in the last wave of cave 10 | The long stinger is taken literally, so she out-reaches every melee bat: Scouts and Brutes die without touching her. Only the Archer out-reaches her. `DESIGN.md` §4 | 2026-09-19 |
| 19 | **B24** — can the Necrobatcer raise bugs? | **A, only his own bats** - and **raise from further away**: summon range **320 → 460** | Lewis asked for the reach specifically. 460 is most of the way across the lane, so a Necrobatcer safely behind the line can still reach the front of it. `DESIGN.md` §3 | 2026-09-19 |
| 20 | **B16** — what happens when a bat dies? | **D, the graveyard idea: a grave marker on the ground**, cleared when the bat is raised | Also settles **B25**. The best of the options because it makes an invisible rule visible: you can now see where your Necrobatcer can reach, and aim it. The positions were already tracked. `DESIGN.md` §9 | 2026-09-19 |
| 21 | **B22** — casino: shop or gamble? | **Neither, exactly — a two-step economy.** "At the casino you exchange suns for blood, potions, fruits that you can trade or gamble for upgrades." | He invented past the question, which is his job. Suns buy **goods**; goods are then **traded or gambled** for upgrades. So both of Dad's options exist, with an item layer between. Raises B27. `DESIGN.md` §8 | 2026-09-19 |
| 23 | **B4** — the redraw, delivered | **Scout Bat, Brute Bat and Necrobatcer drawn and in the game.** Big circle bodies, wings, ears, mouths, no legs, black and white - exactly the brief he set | The goggled/caped pair are superseded and moved to `assets/sprites/source/_superseded-2026-09-18/`. The Necrobatcer is a bat **skull with a flaming staff**, which is a better idea than anything Dad would have specified. `ASSETS.md` | 2026-09-19 |
| 22 | **B23** — how many colour tiers? | **B, four:** Plain → Violet → Blue → Yellow → Red | Seven upgrades per bat would have been seven prices to balance for every bat. Four keeps the backwards rainbow reading the same way. In `data/config.js` as `upgradeTiers` | 2026-09-19 |
| 24 | **B26** — name the new bugs | **Three, one per cave he was asked about.** **Desert Scorpion** (Sahara-hara + Forgotten Oasis): *"fast, every attack has a chance to kill you or kill itself"*. **Evil Butterfly** (Dream Land): *"don't really move, they hover like a wall to protect the tower"*. **Lightning Bug** (Abyss of Darkness): *"slow and weak"* | All three built. He was asked only for a name and "small and fast or big and slow", and gave a **new power** as well — the gambling sting is the second special ability in the game after the Necrobatcer's. The butterfly is the cleverest of the three: "a bug that does not walk" is one number (`speed: 0`) and it genuinely changes how a cave is played. `DESIGN.md` §4 | 2026-09-20 |
| 25 | **B27** — what do blood, potions and fruit DO? | **Potions and fruit are not currency.** A **potion** is used *during a battle* to make the bugs weaker. **Fruit** heals your tower, *"but only slightly"*. **Blood** is just currency | He rejected the framing of the question, correctly: Dad had offered three flavours of "thing you trade", and Lewis made two of them **battle actions** instead. That is a bigger idea — it gives a player something to do with a tap other than send another bat. Both are built and playable today on the Graveyard level. `DESIGN.md` §8 | 2026-09-20 |

---

## 🔧 Decisions Dad already made (so Lewis knows what's assumed)

These were settled while building Milestone 1. **Any of them can be overruled**
— they're starting points, not rules.

| # | What | Decision | Why | Date |
|---|---|---|---|---|
| D1 | Engine | Phaser 4.2.1, vendored, no build step | Same setup as Fakeamon Spark; open it and it runs | 2026-09-18 |
| D2 | Unit control | You never steer a bat — deploy and forget | It's what makes it *this* genre | 2026-09-18 |
| D3 | Do bats queue or swarm? | **Swarm** — they pile on and all attack | With any spacing, only the front bat is in range, so a 10-bat army did the damage of 1. `DESIGN.md` §6 | 2026-09-18 |
| D4 | Level 1's lesson | ⚠️ **Superseded by D8.** Keep spending; hoarding loses | Right lesson, wrong measurement: "active play wins at ~68s" was measured with a sim that tapped perfectly. A real thumb lost. | 2026-09-18 |
| D5 | Enemy base HP | 4000 vs your 1000 | It's a fortress you're besieging, not a duel | 2026-09-18 |
| D6 | Art | Placeholder art the game draws itself | Real sprite sheets drop in as a data change, so art isn't blocking | 2026-09-18 |
| D7 | Where numbers live | All gameplay numbers in `data/`, never in code | So Lewis can change anything without touching code | 2026-09-18 |
| D8 | Level 1's lesson, re-measured | Keep spending; hoarding loses. **Attentive tapping wins in 56–60s** and still wins with a relaxed 0.7s thumb; hoarding still loses | Lewis and Dad played it as the homework instructed and **lost**. Scout cooldown 2.0s → **1.4s**. Verified in the sim across 0–1.0s reaction *and* in a real browser | 2026-09-19 |
| D9 | What limits spamming a cheap bat | **Money, never the cooldown.** A spammable bat's `cooldown` must be **below** `cost ÷ energyPerSecond` | When the cooldown is the limit, the button waits lit for your thumb and every fraction of a second you are late is a bat you never get. When money is the limit, a late tap just banks the energy. Overturns the old §5 rule | 2026-09-19 |
| D10 | The balance sim plays like a person | It has a **reaction time** and reports the whole 0–1.0s band, warns when D9 is violated, and fails a level that only wins at 0s | The old sim tapped on the exact 1/60th of a second and called an unwinnable level a win. A tool that measures a robot is worse than no tool | 2026-09-19 |
| D11 | Where a special power's rules live | **In `src/systems/`, never in `src/entities/unit.js`** — and wired into `tools/balance-sim.js` in the same commit | The sim has its own copy of the unit brain. A power written only in `unit.js` would be invisible to it, so the sim would report balance for a game nobody plays — exactly the D10 mistake, one layer down | 2026-09-19 |
| D12 | The Necrobatcer is **not** in Level 1 | Level 1 keeps its two buttons. The new bat lives in a `graveyard` test level instead | Measured, not assumed: with the Necrobatcer on Level 1 the sim showed a **hoarder winning at 150s**. Level 1 exists to teach "keep spending"; a bat whose whole identity is "patience pays" teaches the opposite, and would have quietly undone Lewis's own B7 = A | 2026-09-19 |
| D13 | The Spider is not in Level 1's waves | It exists in `data/units.js`, ready for the next cave | Level 1's numbers are measured (D8). Dropping a brand new enemy into it would throw that away for no gain | 2026-09-19 |
| D14 | A `graveyard` test level | A generous, story-free practice level so Lewis can play with the Necrobatcer **today** | The bat is his and he should get to use it. Inventing a real Level 2 instead would mean guessing B11 and B17 on his behalf, which the loop forbids | 2026-09-19 |
| D15 | Graves are capped | `CONFIG.combat.maxGraves: 40`; past that the oldest is forgotten | Every fallen bat leaves a grave, so the list would grow for ever in a long battle — and this game is deliberately careful never to pile up objects. Reads as a rule too: a bat that fell ages ago is long gone | 2026-09-19 |
| D16 | Shipped to the live site | Round 1's work merged to `main` as `f8f87d3`; Pages deploy run #7 succeeded 2026-09-19 12:22 UTC | The fix is only real when Lewis can play it. Worth recording because the gap between "fixed" and "live" is exactly what made his B7 answer look like a difficulty complaint | 2026-09-19 |
| D17 | A level can declare `practice: true` | `graveyard` carries it; `tools/balance-sim.js` then stops failing it for letting a hoarder win | The sim was reporting `[BAD] Hoarding ALSO WINS` on a level deliberately built to be generous. A tool that cries wolf is a tool people stop reading — which is how the D8 bug survived. Real caves omit the flag and face the full verdict | 2026-09-19 |
| D19 | The title screen lists every level | A cave picker built from `data/levels.js`, plus **NEXT CAVE** on the victory panel. Order = the order levels are written in `levels.js`; `practice: true` levels are listed apart and kept out of the numbering | Jeff hit it: after beating Level 1 the game was a **loop** — RETRY replayed it, MENU led to a Start button that replayed it, and the Graveyard was unreachable without editing `main.js`. `src/systems/caves.js` is now the one place that answers "what exists, what is next" so the menu and victory screen cannot disagree | 2026-09-19 |
| D21 | How new bats arrive | Cave by cave, through each level's `playerUnits`: Archer from cave 2, Necrobatcer from cave 4 | B12 said bats unlock by winning, but unlocking needs saved progress (M4). A level's bat list gets the same *feeling* today with no guesswork, and becomes the unlock table later | 2026-09-19 |
| D22 | The sim models **two** spending policies | `prefer: 'cheapest'` (spams the cheap bat) and `prefer: 'priciest'` (saves for the dear one). A cave must be winnable **both** ways | This nearly caused a bad build. The old player deployed anything affordable in list order, so the 25-energy Scout always drank the wallet first - "attentive play" was really *Scout-spam-only*. Raising cave 2's bugs by 25% made the sim report that fast play LOST while dawdling WON, which is nonsense: what loses is the spamming, not the attention. Same class of mistake as D10, one layer down | 2026-09-19 |
| D23 | What the sim can and cannot prove | It proves a cave is **winnable, robustly, more than one way**. It does **not** prove how hard a cave *feels* | Both player models are extremes - one spams the cheapest bat, one hoards for the dearest - and neither composes an army the way a person does. A model that plays *well* is an AI problem, not a balance problem. So the curve is designed from rising pressure (total HP 6730 → 11370 across the ten) and **needs Lewis to play it** to confirm | 2026-09-19 |
| D24 | Only cave 1 must punish hoarding | `teachesSpending: true` on cave 1; every other cave must merely make spending the **faster** route | From cave 2 the player has the Archer (safe behind the line) and the Necrobatcer (recycles the dead), and patient play becomes a real, slower way to win. That is those bats working, not a broken cave. Demanding a hoarder always lose would be the wrong test; silently dropping the test would be worse | 2026-09-19 |
| D25 | The Archer's damage, 14 → 22 | 20.0 dps: stronger than a Scout per bat, still weaker per energy | At 14 it did 0.28 damage per energy against a Scout's 0.53 - less than half, for nearly double the price. Not "expensive but safe", just bad: the sim showed the whole army getting *weaker* whenever the button was offered | 2026-09-19 |
| D33 | The sprite frames are **wide**, not square | 150×64, 132×64, 100×64, sharing a 64px baseline. Scales dropped to match: Scout 0.75→0.55, Brute 1.05→0.8, Necrobatcer 0.9→0.7 | A bat with its wings out is a wide thing, and squeezing it into 64×64 would have squashed it. Sharing the height keeps every bat standing on the same line; the width follows each drawing. The lower scales keep them taking up about the same room on screen as before | 2026-09-19 |
| D34 | Button portraits fit a **box** | `CONFIG.buttons.portraitMaxWidth/Height`, plus `portraitSizeStory` for how much of the size difference survives | The old sizing multiplied a fixed scale by the unit's own, which assumed square art. With the new frames the Brute's portrait came out **74px wide on a 168px button**, spilling off its left edge and under the label. Fitting a box cannot overflow whatever shape the art is | 2026-09-19 |
| D35 | The white insides are the point | The drawings are 66-70% light pixels inside black outlines | Measured while importing them. It is what makes B23's colour ladder possible: a tint multiplies, so light areas take the colour and outlines stay black. Worth knowing before anyone "tidies up" the art by filling it in | 2026-09-19 |
| D29 | **Fortresses halved** | Every cave's `enemyBaseHp` cut by half: 3800→1900 through 7600→3800 | Jeff: the endgame dragged. Measured, and he was right by a wide margin - **72% of all playing time across the ten caves was spent chewing a fortress.** Your bats reach it at 11-23s and then hammer a wall for another 35-50s. Halving takes 10-15s off every cave. Relative sizes kept, so "Wait Um is the longest siege" is still true | 2026-09-19 |
| D30 | **Caves lock until you beat the one before** | New `src/systems/progress.js`, saved in `localStorage`. Cave 1 always open; every other cave needs its predecessor beaten. The Graveyard is practice, so always open | Building B12 (= A, unlock by winning) and B13 (= B, the game remembers), which Lewis decided in Round 1. Supersedes D20. Locked caves are still **drawn** - seeing that there are ten, and which is next, is most of what a map is for | 2026-09-19 |
| D31 | Storage failure must never break the game | Every `localStorage` read and write in `progress.js` is wrapped in try/catch, and corrupt data is treated as a fresh start | `localStorage` **throws** rather than returning null in a private window, and can be blocked or full. A game that dies on the title screen because storage is unavailable is far worse than one that forgets your progress | 2026-09-19 |
| D32 | Progress can be wiped, but not easily | A "Reset progress" line inside the **Credits** panel, needing **two** taps | A cave should be replayable from scratch, and the locking has to be testable without clearing a whole browser. Putting it on the title screen would leave it one mis-tap from undoing everything a nine-year-old had done | 2026-09-19 |
| D27 | **Cave 1 made easier** | Starting energy **40 → 70**, fortress **4000 → 3800**, your base **1000 → 1400**, and **30 → 26** bugs. `energyPerSecond` untouched at 13 | Lewis said twice it was too hard and the measurements agreed: it was the **only** cave a 1.0s-late thumb lost, while all nine others survived 3.0s. The tutorial was the hardest thing in the game, because it is the only cave with two bats - caves 2-10 are gentler because the Archer and Necrobatcer carry them. Now survives a 4.0s thumb, and hoarding still loses so `teachesSpending` holds | 2026-09-19 |
| D28 | Starting energy is the forgiveness lever, not base HP | For cave 1, `startEnergy` 60 → 70 flipped it from losing at 1.0s to winning past 4.0s. Raising `playerBaseHp` changed **nothing** | Measured across the whole sweep. The fight is all-or-nothing: you either hold the front line or the base dies whatever its HP, so base HP never gets chipped gradually. An opening buffer, by contrast, lets the line get established - and once it holds, it holds. Base HP was still raised to 1400 as insurance for a *human* who panics and recovers, which the sim's player cannot do | 2026-09-19 |
| D26 | The boss must actually be met | Cave 10's fortress 3400 → 5000 and the bee moved from 58s to 40s | First draft was won at 44-52s while she arrived at 58s, so the boss of the whole game never met the player once | 2026-09-19 |
| D20 | No locking and no saving, yet | ⚠️ **Superseded by D30.** Every cave pickable from the menu | Correct while B12/B13 were unbuilt; Jeff asked for the locking on 2026-09-19 and Lewis had already decided both halves of it | 2026-09-19 |
| D36 | The Desert Scorpion is a **new bug**, not a change to the old one | `desertScorpion` added; the plain `Scorpion` is untouched | Lewis said "desert has scorpions", and a Scorpion already existed — but his is *fast* and gambles, where the old one is slow and armoured. They are plainly different animals. Editing the existing one would also have re-balanced all ten caves at a stroke, throwing away measurements going back to D8. **Worth confirming the name with Lewis**, since two things in his game are now called some kind of scorpion | 2026-09-20 |
| D37 | A sting can **never** instantly kill a base | Enforced in `src/systems/sting.js`, not in `data/units.js`, and tested at `killChance: 1.0` | An instant kill ignores health. If one counted against a fortress, a cave could be won or lost on a single roll however well it was played. This is a fairness rule, so it is code, not a number anyone can tune | 2026-09-20 |
| D38 | The sim's dice are **seeded**, and gambling caves are played on **20 seeds** | `Sting.useSeed()`; `playLevel` defaults to seed 1; the report gains a COIN FLIP section | Once a cave contains a coin flip, "is it winnable" stops being one answer and becomes *how often*. A measuring tool whose verdict changes every run cannot tune anything — the same class of mistake as D10 and D22, for the third time. A cave must now win on **every** roll: one lost to bad luck is not a hard cave, it is an unfair one | 2026-09-20 |
| D39 | **More rolls, not luckier ones** | `killChance` 0.08 → **0.20** (not 0.30), health 90 → 120, and more Desert Scorpions per desert cave | 0.08 was invisible: measured, each scorpion landed **exactly 1.0 attacks** before a Scout swarm killed it, so the signature power fired once every ten battles. But 0.30 was measured too and **rejected** — it lost 4–8 runs in 80, because an instant kill has no counterplay and a bad streak deletes the front line. Many small rolls give the same average with a far thinner unlucky tail, which is what "fair" means for something random | 2026-09-20 |
| D40 | Forgotten Oasis **converts** scorpions rather than adding them | Plain Scorpions swapped for Desert ones, ~10 in total, not 14 | Adding them took the cave from 0 losses in 160 runs to **52** — all suffered by the player who saves for Brute Bats. The surprise on fixing it: swapping *more* plain Scorpions for gambling ones made the cave **safer**, because a Desert Scorpion is the weaker bug on paper (12 dps / 120hp against 17.3 / 190). What was beating that player was ordinary scorpion damage, never the sting | 2026-09-20 |
| D41 | The ten caves carry **no items**; only the practice level does | `startItems` on `graveyard` only | Two reasons. You are meant to **earn** them at the casino, and deciding how many you get and for what is Lewis's job, not an assumption to sneak in. And every cave is measured **without** them, so an item is always a bonus and never a requirement — a cave that needs a potion is a cave you can arrive at unable to win. Same trick as D14: the thing is real, only the way you acquire it is stubbed | 2026-09-20 |
| D42 | One function works out **every** hit | `window.Combat.strike()` — attack number, potion weakening and sting all meet there | `src/entities/unit.js` and `tools/balance-sim.js` each have their own copy of the unit brain. Every rule written in both is a rule that will eventually disagree with itself, which is D10 and D11 exactly. Two powers now ride on this one line, and the sim gets them for free | 2026-09-20 |
| D43 | A potion **sets** its timer, it never stacks | `src/systems/items.js`, with a test | Three potions give ten weakened seconds, not thirty. Otherwise a player who hoarded six could switch a whole cave off — and the caves are balanced on the assumption that items only ever help a bit | 2026-09-20 |
| D44 | A wave that arrives after the battle ends is not a wave | Dream Land's second butterfly wall 46s → 38s; the Abyss's firefly swarms moved to 12/24/36s | Caught in a real browser, not in the sim: a won battle finishes at 45–52s, so half of each new bug's appearances were scheduled into a cave that was already over. The Abyss peaked at **three** fireflies on the lane and two of its four swarms never spawned. Late waves are still there to punish dawdling — but a brand new bug has to be **met** | 2026-09-20 |
| D45 | Floating messages, and why a random power needs them | `reportSting()` and `floatText()` in `BattleScene`, pooled like the grave markers | A Brute Bat you paid 90 energy for vanishing at full health reads as the game being broken, not as the gamble Lewis designed. Same reasoning as D30's grave markers: the rule was invisible, so it looked like luck. Two messages in one spot printed over each other as gibberish, so they stack | 2026-09-20 |
| D18 | `balance-sim.js` no longer clobbers `global.window` | `global.window = global.window \|\| {}` | It exports `playLevel` for other scripts to use, then overwrote the `window` any caller had already built — so reusing it as a library silently discarded your setup. Found while probing the B9 long-range question | 2026-09-19 |

---

## 🗂️ Question Index — where each answer lands

| # | Question | Lands in `DESIGN.md` | Status |
|---|---|---|---|
| B1 | Why are the bats fighting? | §1 Vision, §10 Story | ✅ Answered — they hunt their food |
| B2 | The world's name & look | §1 Vision | ✅ Answered — Palopa / The Cave |
| B3 | Who is the enemy? | §4 The Enemy | ✅ Answered — mosquito, spider, scorpion |
| B4 | What things look like | §9 Look & Sound | ✅ **3 of 4 bats drawn & in the game**; Archer + bugs open |
| B5 | The third bat | §3 The Bats | ✅ Answered **& built** — the Necrobatcer |
| B6 | Special powers? | §3 The Bats | ✅ Answered by B5 — yes |
| B7 | How strict is saving up? | §3 The Bats | ✅ Answered — A, keep it strict |
| B8 | Is there a boss? | §4 The Enemy | ✅ Answered **& built** — the Cow Killer Bee |
| B9 | A long-range bat? | §6 Combat Rules | ✅ Answered **& built** — the Archer Bat |
| B10 | How many levels? | §7 Levels & Waves | ✅ Answered — C, ten or more |
| B11 | What makes each cave different? | §7 Levels & Waves | ✅ Answered **& built** — one lever per cave |
| B12 | How you unlock bats | §8 Progression | ✅ Answered by B13, **caves now built** — by winning |
| B13 | Does progress save? | §8 Progression | ✅ Answered; **saving built** — suns/casino still to come |
| B14 | A second lane? | §6 Combat Rules | 🔲 Open (M5) |
| B15 | Music & sound | §9 Look & Sound | 🔲 Open (M3) |
| B16 | What a bat's death looks like | §9 Look & Sound | ✅ Answered **& built** — grave markers |
| B17 | Cave names | §7 Levels & Waves | ✅ Answered **& built** — all ten |
| B18 | The base-breaking moment | §9 Look & Sound | 🔲 Open (anytime) |
| B19 | Can you upgrade a bat? | §8 Progression | ✅ Answered by B4 + B13 — yes, as colour |
| B20 | A fast-forward button? | §5 Energy & Deploying | 🔲 Open (anytime) |
| B21 | Animate the bats, or one pose? | §9 Look & Sound | ⚠️ Scout walks, but the B4 redraw resets this |
| B22 | Casino: shop or gamble? | §8 Progression | ✅ Answered — suns → goods → trade or gamble |
| B23 | How many colour tiers, really? | §9 Look & Sound | ✅ Answered — B, four |
| B24 | Can the Necrobatcer raise bugs too? | §3 The Bats | ✅ Answered — A, bats only, longer reach |
| B25 | Should graves show on the ground? | §9 Look & Sound | ✅ Answered by B16 — yes, built |
| B26 | Name the new bugs for the later caves | §4 The Enemy | ✅ Answered **& built** — three, all in their caves |
| B27 | What do blood, potions and fruits DO? | §8 Progression | ✅ Answered **& built** — potion + fruit are battle actions |
| B28 | Is "Desert Scorpion" the right name? | §4 The Enemy | 🔲 **New** — on the plate |
| B29 | How do you *get* potions and fruit? | §8 Progression | 🔲 **New** — blocks the casino |
| B30 | What do the three new bugs look like? | §9 Look & Sound | 🔲 **New** — on the plate |
