# Battle Bats — Game Design Document

> A 2D lane auto-battler, built together by Jeff & Lewis.
> **Status:** Living document — v0.1, written 2026-09-18 after Milestone 1 shipped.
>
> **`[TO DECIDE]`** = an open question waiting on Lewis (see `HOMEWORK.md`).
> **`DECIDED (date):`** = settled, and the reason is written down.
> **(proposed)** = a starting point we expect to tune after playing.

---

## 1. Vision

Battle Bats is a lane auto-battler in the spirit of *The Battle Cats*. You send
bats down a single lane. They walk, fight, and die on their own — you never
steer them. Your only real decisions are **which bat to send** and **when**.

**Design pillars:**

1. **Deploy and forget.** The fun is choosing, not driving. No unit control.
2. **Readable in five seconds.** A glance should tell you who's winning.
3. **Every number is Lewis's to change.** Nothing that affects how the game
   plays is buried in code.
4. **Small and finishable.** A short game we actually complete beats a big one
   we abandon.

**`[TO DECIDE]` — the story: why are bats fighting at all?** *(B1)*
**`[TO DECIDE]` — the world: where does this happen, and what's it called?** *(B2)*

---

## 2. Core Gameplay Loop

```
Energy refills over time
        │
        ▼
  Tap a bat button  ──▶  bat walks right  ──▶  meets an enemy  ──▶  they fight
        ▲                                                              │
        └──────────── survivors keep walking ◀─────────────────────────┘
                                   │
                                   ▼
                        reach the enemy base → smash it → WIN
```

Meanwhile the enemy base is sending its own units left on a fixed schedule. If
they reach **your** base and smash it, you lose.

---

## 3. The Bats (your units)

Every bat is a row of numbers in `data/units.js`. Nothing else defines it.

| Bat | Cost | Cooldown | HP | Attack | Interval | **DPS** | Range | Speed |
|---|---|---|---|---|---|---|---|---|
| **Scout Bat** | 25 | 1.4s | 40 | 8 | 0.6s | **13.3** | 40 | 90 |
| **Brute Bat** | 90 | 6.0s | 220 | 30 | 1.4s | **21.4** | 46 | 45 |

`DPS = attack ÷ attackInterval`.

**DECIDED (2026-09-18) — the two bats are a tank/damage trade-off, measured per
energy spent**, not just "one is better":

- **Scout Bat** — **0.53 DPS per energy**, 1.6 HP per energy. Cheap damage that
  dies fast.
- **Brute Bat** — 0.24 DPS per energy, **2.4 HP per energy**. Expensive meat
  that soaks hits while Scouts do the killing.

That's the whole strategy at Milestone 1: Scouts kill, Brutes survive.

**`[TO DECIDE]` — what is the third bat, and what makes it different?** *(B5)*
**`[TO DECIDE]` — do bats get special powers, or only stats?** *(B6)*

### A known weakness to fix, not ignore

At 13 energy/second, spamming Scouts eats **all of it**: a Scout costs 25, so
you can afford one every 1.92s, and that is now also how often you actually get
one (§5). A Brute costs 90. So if you tap Scout every time it's ready, you can
**never** afford a Brute — you have to deliberately *stop* tapping to
save up. That's a real decision, but it means a player who just mashes one
button never meets the second bat at all.

**`[TO DECIDE]` — should saving up for a big bat feel this strict?** *(B7)*

---

## 4. The Enemy

Enemies use the exact same schema as your bats, with `enemy: true`. They cost
nothing — the level spawns them for free on a timer.

| Enemy | HP | Attack | Interval | **DPS** | Range | Speed |
|---|---|---|---|---|---|---|
| **Cave Critter** | 55 | 7 | 0.8s | **8.8** | 38 | 62 |
| **Cave Bruiser** | 190 | 26 | 1.5s | **17.3** | 44 | 38 |

Both names and looks are **placeholders**.

**`[TO DECIDE]` — who or what is the enemy, really?** *(B3)*
**`[TO DECIDE]` — is there a boss?** *(B8)*

---

## 5. Energy & Deploying

- Energy starts at a level's `startEnergy` and refills at `energyPerSecond`,
  capped at `maxEnergy`.
- Deploying costs that bat's `cost` **and** starts that bat's own `cooldown`.
  Each bat's cooldown is separate.
- A button is dead (dimmed, unclickable) if you can't afford it **or** it's
  cooling down. The dark shade over a button drains away as it becomes ready.

**⚠️ SUPERSEDED (2026-09-18) — "cooldowns, not money, are the usual limit" on
how fast you can spam the cheap bat.** It sounded tidy. It made Level 1
unwinnable for an actual child. Replaced by the rule below.

**DECIDED (2026-09-19) — for a cheap bat you are meant to spam, MONEY is the
limit and never the cooldown:**

```
a spammable bat's cooldown  <  its cost ÷ the level's energyPerSecond
```

Why this matters far more than it looks. When the **cooldown** is the limit, the
button sits there lit, waiting for your thumb — and every fraction of a second
you are late is a bat you never get back. Nobody is frame-perfect, and a 0.3s
delay cost **13% of a whole army**. When **money** is the limit, a late tap just
banks the energy and costs you nothing.

The Scout was cost 25, cooldown 2.0s, at 13 energy/sec: 1.92s to afford one,
2.0s before you were allowed one. The cooldown won by **0.08 seconds** — and
that was enough to make Level 1 unwinnable for a person, while a balance sim
that tapped perfectly kept reporting a comfortable win. The Scout's cooldown is
now **1.4s**, which leaves 0.52s of lateness free on every single tap.

**`[TO DECIDE]` — a 2× fast-forward button?** *(B20)*

---

## 6. Combat Rules

The lane is one dimension, so all of this is subtraction — there is no physics
engine (see §12).

1. A bat walks forward until something it can attack is **in front of it and
   within its `range`**.
2. It attacks the **nearest** such thing, hitting once every `attackInterval`.
3. The enemy **base** is a valid target too, so a bat that walks past everyone
   starts chewing the building.
4. At 0 HP a unit plays its death animation, then its object goes back in the
   pool to be reused.

### DECIDED (2026-09-18) — bats swarm; they do not queue

We built a tidy "stand in line" rule first and **removed it as the default.**
Here's why, because it's not obvious:

> The bat at the front stops as soon as the enemy is at the very *edge* of its
> range. So **any** gap you leave behind it puts the next bat *out* of range.
> With spacing turned on, a ten-bat army did the damage of **one bat**, and
> battles became an endless grind.

So bats pile onto the same target and **all of them attack**. The knob still
exists — `CONFIG.combat.personalSpace`, set to `0` — and the trade-off is
written next to it. Set it to `26` to see the grind for yourself.

To keep a pile readable, each bat is nudged a few pixels when it's **drawn**
(`stackJitter` / `stackJitterX`). That's cosmetic only — the fight always uses
the bat's true position.

### A structural fact worth knowing before designing levels

**Your base ends a battle at 100% or at 0%, almost never in between.** In a
single lane with no ranged units, whoever wins the front line takes
*everything* — either nothing reaches your base, or a wave of survivors reaches
it and nothing can stop them. Making your base tougher does **not** create a
middle ground; we tested it.

The two things that *would* change this are a **ranged bat** that can hit past
the front line, and a **second lane**.

**`[TO DECIDE]` — add a bat that attacks from far away?** *(B9)*
**`[TO DECIDE]` — a second lane, later?** *(B14)*

---

## 7. Levels & Waves

A level lives in `data/levels.js` and holds: both base HPs, the economy
settings, which bats you're allowed, and the enemy spawn schedule.

A wave is one line: `{ time: 40, enemy: 'bruiser', count: 2, gap: 1.0 }` —
*at 40 seconds, send 2 Bruisers, one second apart.* Waves can be written in any
order; the game sorts them by time.

### Level 1 — "First Cave" *(placeholder name)*

| Setting | Value |
|---|---|
| Your base HP | 1000 |
| Enemy base HP | 4000 |
| Energy | 40 to start, +13/sec, cap 300 |
| Your bats | Scout, Brute |
| Enemies | 30 across 12 waves, last at 76s |

**DECIDED (2026-09-19) — Level 1 is tuned to teach one lesson: keep spending.**
Measured with `tools/balance-sim.js` — which now plays like a person, not a
robot — and each row confirmed by playing the real game in a real browser:

- Tapping attentively (0.2–0.5s after the button lights) → **win in 56–60s**.
  Still a win with a relaxed 0.7s thumb, at 77s.
- Sitting on your energy → **you lose**, every time.
- Brutes only → you still win, but it takes 106 seconds.

**Never tune this level against a perfect thumb again.** The first version was
measured at 0s reaction, reported "win at 68s", and the first people who played
it exactly as the homework instructed **lost**. The sim now reports the whole
0s–1.0s band and fails a level that only wins at 0s.

**The enemy base is deliberately huge (4000 vs your 1000).** It's a fortress, not
a fair fight — it's the thing you're besieging, and it should take a real push.

**`[TO DECIDE]` — how many levels should the game have?** *(B10)*
**`[TO DECIDE]` — what makes level 2 different from level 1?** *(B11)*
**`[TO DECIDE]` — what are the levels called?** *(B17)*

---

## 8. Progression & Unlocks

Nothing is saved yet. Every visit starts fresh at Level 1.

**`[TO DECIDE]` — how do you get new bats?** *(B12)*
**`[TO DECIDE]` — does the game remember what you've beaten?** *(B13)*
**`[TO DECIDE]` — can you upgrade a bat?** *(B19)*

---

## 9. Look & Sound

**DECIDED (2026-09-18) — the player bats have real art.** Lewis made both in
PixelLab: the **Scout Bat** is a small brown bat in blue flight goggles, the
**Brute Bat** a heavier one in a cape. They are one 64×64 pose each, drawn at
different sizes in game through each unit's `scale` (Scout 0.75, Brute 1.05) —
so "make them both 64×64 and size them in the game" is now the pipeline.

**DECIDED (2026-09-18) — the bats face east, and the Scout flaps.** The first
pair were drawn facing *west* while walking east, so Lewis re-exported them
mirrored; **all art faces east from now on** and the game mirrors enemies
itself. He also made the Scout a **16-frame walk cycle**, so it now flaps
across the lane.

**Still to draw:** a walk cycle for the **Brute** (it still slides along
without flapping), and **attack and death** frames for both — those currently
fall back to the standing pose, so a swing looks like standing still and dying
is just a fade. *(See B21.)*

**The enemies are still placeholder** — flat orange and red shapes, and they
look it next to the real bats. *(B3 decides what they should be.)*

**How placeholder art works,** for the units that still use it: at startup the
game paints a sprite sheet — a round body, flapping wings, two eyes — with real
**idle / walk / attack / death** frames, sliced exactly like a downloaded sheet.

That's deliberate: swapping in real art means adding a file and one load line.
The frame layout is per-unit data, so a different sheet is just different
numbers. Any unit that has real art skips the placeholder automatically.

Licence-checked candidates are recorded in `ASSETS.md` (Calciumtrice's animated
bat, CC BY; Kenney's UI packs, CC0). We also have a **PixelLab** account, so
Lewis can generate bats himself — `tools/pack-spritesheet.js` turns whatever an
art tool exports into the sheet the game wants, so **art is not blocking
anything**. The moment B4 is answered, sprites can go straight in.

There is **no sound at all** yet.

**`[TO DECIDE]` — what should the *enemies* look like?** *(B4, and B3 for what they are)*
**`[TO DECIDE]` — do the bats get animation frames, or stay as one pose?** *(B21)*
**`[TO DECIDE]` — music and sound effects?** *(B15)*
**`[TO DECIDE]` — what happens visually when a bat dies?** *(B16)*
**`[TO DECIDE]` — what does the enemy base do when it breaks?** *(B18)*

---

## 10. Story & Win Condition

**Right now:** destroy the enemy base to win; lose yours and it's over. A panel
says VICTORY or DEFEAT with a Retry button. There is no story.

**`[TO DECIDE]` — the whole story spine.** *(B1, B2, B3)*

---

## 11. Roadmap

| Milestone | What it adds | Status |
|---|---|---|
| **M1 — First playable** | One lane, two bats, two enemies, energy + cooldowns, bases, win/lose, Retry, placeholder art | ✅ **Done 2026-09-18** |
| **M2 — Content** | More bats, more enemies, several levels with a difficulty curve | 🔜 Next — needs B5, B10, B11 |
| **M3 — Look & feel** | Real sprites, a background, sound effects, music | Needs B4, B15, B16 |
| **M4 — Progression** | Unlocking bats, saved progress in `localStorage` | Needs B12, B13 |
| **M5 — Depth** | Special powers, a boss, maybe a second lane | Needs B6, B8, B14 |

Order is a plan, not a promise — if Lewis most wants a boss, we build the boss.

---

## 12. Technical Notes

Full detail is in `README.md`; the design-relevant parts:

- **Zero build step.** Plain `<script>` tags and globals. No bundler, no npm, no
  TypeScript. Open it and it runs.
- **Phaser 4.2.1, vendored** in `vendor/`. Nothing is fetched from the internet
  at play time.
- **No physics engine**, on purpose. Lane combat is distance comparisons.
- **Fixed timestep.** The simulation runs in exact 1/60s slices, so the game
  plays identically on a fast laptop and a slow phone. Drawing still happens as
  fast as the device likes.
- **Pooling from day one.** Units are recycled, not thrown away. A full battle
  allocates only ~21 unit objects.
- **Mouse and touch both work**; the game scales to fit, and asks you to turn a
  phone sideways.
- **`tools/balance-sim.js`** plays a whole level headlessly in a fraction of a
  second, using the same data files. It plays with a **reaction time** (0s to
  1.0s), so it measures what a person gets rather than what a robot gets, and it
  flags any cheap bat whose *cooldown* rather than its *price* is the thing
  limiting you. Use it after changing any number.

---

## 13. Open Questions — Quick Index

| # | Question | Lands in | Needed by |
|---|---|---|---|
| B1 | Why are the bats fighting? | §1, §10 | anytime |
| B2 | The world's name and look | §1 | M3 |
| B3 | Who is the enemy? | §4 | M2 |
| B4 | What things look like | §9 | ✅ player bats done; enemies open |
| B5 | The third bat | §3 | **M2 — next up** |
| B6 | Special powers, or stats only? | §3 | M5 |
| B7 | How strict should saving up be? | §3 | M2 |
| B8 | Is there a boss? | §4 | M5 |
| B9 | A long-range bat? | §6 | M2 |
| B10 | How many levels? | §7 | **M2 — next up** |
| B11 | What makes level 2 different? | §7 | **M2 — next up** |
| B12 | How do you unlock bats? | §8 | M4 |
| B13 | Does progress save? | §8 | M4 |
| B14 | A second lane? | §6 | M5 |
| B15 | Music and sound | §9 | M3 |
| B16 | What a bat's death looks like | §9 | M3 |
| B17 | Level names | §7 | M2 |
| B18 | The base-breaking moment | §9 | anytime |
| B19 | Can you upgrade a bat? | §8 | M4 |
| B20 | A fast-forward button? | §5 | anytime |
| B21 | Animate the bats, or leave them as one pose? | §9 | **M3 — next art job** |

Questions live in `HOMEWORK_BACKLOG.md`; the current round is on Lewis's plate
in `HOMEWORK.md`; answers get recorded through the loop in `DECISIONS.md`.
