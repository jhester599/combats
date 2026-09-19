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
| 10 | **B7** — how strict is saving up? | **A, keep it strict.** "Choosing is the whole game." Economy unchanged: 13 energy/sec, Brute stays 90. | Lewis also wrote *"but level 1 is too difficult currently"* — which was the D8 cooldown bug, fixed but **not yet live on the site he was playing**. No second difficulty change made: doing both would overshoot and undo his own "keep it strict". `DESIGN.md` §3 | 2026-09-19 |
| 11 | **B10** — how many levels? | **C, ten or more caves.** "Should have a ton." | He was told plainly this is the most work and that some caves will be weaker, and picked it anyway. Means a cave has to be **pickable** (`STARTING_LEVEL` won't do), and makes `balance-sim.js` essential rather than nice. `DESIGN.md` §7 | 2026-09-19 |
| 12 | **B13** — does progress save? | **B, and more.** It remembers beaten caves, you earn **suns** for winning one, and suns are spent in **the casino** on bat upgrades and "other things you need later". | Turns M4 into three connected pieces: saving, a between-battles currency, and a shop. `DESIGN.md` §8 | 2026-09-19 |
| 13 | **B12** — how do you get new bats? | **A, by winning caves**, by implication of 12. | The B13 option Lewis picked says "you unlock bats by winning". `DESIGN.md` §8 | 2026-09-19 |
| 14 | **B19** — can you upgrade a bat? | **A, yes** — and an upgrade **shows as a colour**, by implication of 7 + 12. | Both answers have him spending suns to upgrade bats, and 7 says what an upgrade looks like. `DESIGN.md` §8, §9 | 2026-09-19 |

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

---

## 🗂️ Question Index — where each answer lands

| # | Question | Lands in `DESIGN.md` | Status |
|---|---|---|---|
| B1 | Why are the bats fighting? | §1 Vision, §10 Story | ✅ Answered — they hunt their food |
| B2 | The world's name & look | §1 Vision | ✅ Answered — Palopa / The Cave |
| B3 | Who is the enemy? | §4 The Enemy | ✅ Answered — mosquito, spider, scorpion |
| B4 | What things look like | §9 Look & Sound | ⚠️ Re-answered — hand-drawn B&W. **Needs redrawing** |
| B5 | The third bat | §3 The Bats | ✅ Answered **& built** — the Necrobatcer |
| B6 | Special powers? | §3 The Bats | ✅ Answered by B5 — yes |
| B7 | How strict is saving up? | §3 The Bats | ✅ Answered — A, keep it strict |
| B8 | Is there a boss? | §4 The Enemy | 🔲 Open (M5) |
| B9 | A long-range bat? | §6 Combat Rules | 🔲 Open (M2) — the all-or-nothing ending is still unsolved |
| B10 | How many levels? | §7 Levels & Waves | ✅ Answered — C, ten or more |
| B11 | What makes the next cave different? | §7 Levels & Waves | 🔲 **Now blocking M2** |
| B12 | How you unlock bats | §8 Progression | ✅ Answered by B13 — by winning |
| B13 | Does progress save? | §8 Progression | ✅ Answered — yes, + suns + casino |
| B14 | A second lane? | §6 Combat Rules | 🔲 Open (M5) |
| B15 | Music & sound | §9 Look & Sound | 🔲 Open (M3) |
| B16 | What a bat's death looks like | §9 Look & Sound | 🔲 Open (M3) |
| B17 | Cave names | §7 Levels & Waves | 🔲 **Now blocking M2** — and B10 wants ~10 |
| B18 | The base-breaking moment | §9 Look & Sound | 🔲 Open (anytime) |
| B19 | Can you upgrade a bat? | §8 Progression | ✅ Answered by B4 + B13 — yes, as colour |
| B20 | A fast-forward button? | §5 Energy & Deploying | 🔲 Open (anytime) |
| B21 | Animate the bats, or one pose? | §9 Look & Sound | ⚠️ Scout walks, but the B4 redraw resets this |
| B22 | Casino: shop or gamble? | §8 Progression | 🔲 **New** (M4) |
| B23 | How many colour tiers, really? | §9 Look & Sound | 🔲 **New** (M4) |
| B24 | Can the Necrobatcer raise bugs too? | §3 The Bats | 🔲 **New** (anytime) |
