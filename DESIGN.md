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

**DECIDED (2026-09-19) — B1: the bats are fighting their FOOD.** "The enemies
of the bats are things that they eat. Mosquitos, scorpions, spiders." — Lewis.

This is a hunt, not a war. It reframes everything cheaply and well: there is no
grudge to explain, the enemy can be any creepy-crawly Lewis feels like drawing,
and "the cave keeps sending more" needs no justification because that is simply
what a cave full of bugs does.

**DECIDED (2026-09-19) — B2: the world is called PALOPA.** The first place in it
is **The Cave**, and it looks like *a wet cave*. — Lewis

Level 1 is renamed from the placeholder "First Cave" to **The Cave** in
`data/levels.js`. The dripping-wet look is art, so it waits for M3 — see §9.

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
| **Necrobatcer** | 60 | 4.0s | 70 | 4 | 1.2s | **3.3** | 60 | 70 |

`DPS = attack ÷ attackInterval`.

**DECIDED (2026-09-18) — the two bats are a tank/damage trade-off, measured per
energy spent**, not just "one is better":

- **Scout Bat** — **0.53 DPS per energy**, 1.6 HP per energy. Cheap damage that
  dies fast.
- **Brute Bat** — 0.24 DPS per energy, **2.4 HP per energy**. Expensive meat
  that soaks hits while Scouts do the killing.

That's the whole strategy at Milestone 1: Scouts kill, Brutes survive.

**DECIDED (2026-09-19) — B5: the third bat is the NECROBATCER.** Lewis picked
option E, invent one: "the 'grave bat' or 'necrobatcer', summoner similar to a
necromancer, that can summon dead bats back to the life to continue fighting."

Its fighting is deliberately pathetic — a quarter of a Scout's damage. What it
does instead:

- every one of **your** bats that dies leaves a **grave where it fell**;
- the Necrobatcer raises one grave every **5 seconds**, within **320px**;
- the raised bat returns at **60% health**, standing **where it died** — so it
  skips the long walk from your base. That is the real power.

Two rules are in the code rather than the data, because they stop the game
breaking instead of tuning how it feels: **a bat can only ever be raised once**,
and **a Necrobatcer can never raise another Necrobatcer**. Either one missing
turns a single grave into an endless army. Both are checked by
`node tools/necro-test.js`.

**It is built and playable now**, but **not in Level 1** — see §7 for why.

**DECIDED (2026-09-19) — B6 follows from B5: yes, bats get special powers.**
Lewis's choice of a summoner settles this by implication, since a summoner
cannot exist as numbers alone. The pattern each power follows is now set:
numbers in `data/units.js`, rules in `src/systems/`, two lines of wiring in
`src/entities/unit.js` **and** in `tools/balance-sim.js`.

That last part matters: a power written inside `unit.js` would be invisible to
the balance sim, which would then report balance for a game nobody plays. That
exact mistake already cost us a broken level (see `DECISIONS.md` D10).

### A known weakness to fix, not ignore

At 13 energy/second, spamming Scouts eats **all of it**: a Scout costs 25, so
you can afford one every 1.92s, and that is now also how often you actually get
one (§5). A Brute costs 90. So if you tap Scout every time it's ready, you can
**never** afford a Brute — you have to deliberately *stop* tapping to
save up. That's a real decision, but it means a player who just mashes one
button never meets the second bat at all.

**DECIDED (2026-09-19) — B7 = A, keep it strict.** "Choosing is the whole
game." — Lewis. So the economy does **not** loosen: `energyPerSecond` stays 13
and the Brute stays 90. Spamming Scouts still eats your whole income, and you
still have to deliberately stop tapping to afford anything bigger.

Lewis added: *"but level 1 is too difficult currently."* That was almost
certainly the **cooldown bug** (`DECISIONS.md` D8), which was fixed the same
week but had not yet reached the live site he was playing. On the fixed build,
attentive tapping wins Level 1 in 56–60 seconds. **No further difficulty change
has been made** — doing both would overshoot, and it would undo the "keep it
strict" half of Lewis's own answer. If it still feels hard after he plays the
fixed version, that is a fresh measurement, not a guess.

---

## 4. The Enemy

Enemies use the exact same schema as your bats, with `enemy: true`. They cost
nothing — the level spawns them for free on a timer.

**DECIDED (2026-09-19) — B3: the enemies are the things bats EAT.** "Mosquitos,
scorpions, spiders." — Lewis. The placeholder names are gone:

| Was | Is now | Why this one |
|---|---|---|
| Cave Critter | **Mosquito** | small, quick, dies instantly — already a mosquito |
| Cave Bruiser | **Scorpion** | armoured, slow, hits like a hammer |
| *(new)* | **Spider** | sits between the two: tougher than a mosquito, quicker than a scorpion |

| Enemy | HP | Attack | Interval | **DPS** | Range | Speed |
|---|---|---|---|---|---|---|
| **Mosquito** | 55 | 7 | 0.8s | **8.8** | 38 | 62 |
| **Spider** | 110 | 13 | 1.0s | **13.0** | 40 | 50 |
| **Scorpion** | 190 | 26 | 1.5s | **17.3** | 44 | 38 |

The Mosquito and Scorpion kept their old numbers exactly, so Level 1's measured
balance is untouched — only their names and placeholder colours changed. The
**Spider is deliberately not in Level 1's waves** for the same reason; it is
ready for Level 2.

All three are still art the game draws itself. What they actually *look* like is
the open half of B4 — see §9.

**`[TO DECIDE]` — is there a boss?** *(B8)* — still open, and now easier to
answer: a boss would be the biggest thing in the cave.

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

A wave is one line: `{ time: 40, enemy: 'scorpion', count: 2, gap: 1.0 }` —
*at 40 seconds, send 2 Scorpions, one second apart.* Waves can be written in any
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

**DECIDED (2026-09-19) — B10 = C: ten or more caves.** "10 or more caves,
should have a ton." — Lewis. He was told plainly that this is the most work and
that some caves will be weaker than others, and he picked it anyway, so that is
the plan.

What it changes, beyond just writing more levels:

- **A level needs to be pickable.** With ten caves, `STARTING_LEVEL` in
  `src/main.js` stops being good enough — there has to be a map or a list. That
  lands with the progression work in §8 (B13).
- **Levels have to get cheaper to make.** Each one is measured, and Level 1 took
  a lot of testing. `tools/balance-sim.js` is what makes ten caves realistic
  instead of exhausting: it plays a whole cave in a fraction of a second and
  says whether it holds up for a person.

### The Graveyard — a test level, not a cave

There is a second entry in `data/levels.js` called `graveyard`. It is **not**
one of the caves of Palopa and has no story: it exists so Lewis can play with
the Necrobatcer today, because the bat is built but is deliberately kept out of
Level 1. Switch `STARTING_LEVEL` in `src/main.js` to `'graveyard'` to play it.

It is generous on purpose (120 starting energy, 18/sec) so that summoning is
easy to see rather than something to budget for. Measured: a win in 41–55s
across the whole reaction band, raising 7–9 bats from the dead per playthrough.

**`[TO DECIDE]` — what makes level 2 different from level 1?** *(B11)*
**`[TO DECIDE]` — what are the caves called?** *(B17)* — both still open, and
both now needed, since B10 asks for ten of them.

---

## 8. Progression & Unlocks

Nothing is saved yet. Every visit starts fresh at Level 1.

**DECIDED (2026-09-19) — B13 = B: the game remembers, and you earn SUNS.**
"Yes it remembers and you earn money ('suns') for beating a cave. The suns can
be saved and spent in the casino to upgrade your bats or buy other things that
you need later in the game." — Lewis

So M4 is now three connected things:

1. **Saving.** Which caves you have beaten, how many suns you hold, and what
   each bat has been upgraded to.
2. **Suns.** The reward for beating a cave. A second currency to `energy`, which
   is spent *inside* a battle — suns are spent *between* battles.
3. **The casino.** Where suns are spent: bat upgrades, and "other things you
   need later".

**DECIDED (2026-09-19) — B12 = A, by implication:** the option Lewis picked in
B13 says "you unlock bats by winning", so bats come from beating caves.

**DECIDED (2026-09-19) — B19 = A, by implication:** both B4 and B13 have Lewis
spending suns to upgrade bats, so upgrading is in. **An upgrade shows as a
colour** — the backwards-rainbow ladder in §9.

**`[TO DECIDE]` — is the casino a shop or a gamble?** *(B22, new)* — "casino"
could mean fixed prices, or paying suns for a *chance* at an upgrade. Those are
different games and different builds, so it is Lewis's call, not a guess.

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

**DECIDED (2026-09-19) — B4 REPLACES the 2026-09-18 answer.** Lewis changed his
mind about what the bats look like, which is entirely his call. The old answer
(a Scout in flight goggles, a Brute in a cape) is **superseded**:

> "Using PixelLab, the bats are not realistic, they look hand-drawn. Large
> circles, with wings, ears, and a mouth. No legs. Black and white for level 1
> bats, then as you buy upgrades to level up your bats, they change color,
> backwards rainbow (VIBGYOR, although we may simplify down a bit)." — Lewis

**The drawing brief**, for when Lewis is next in PixelLab: hand-drawn, not
realistic. A **large circle** for the body. **Wings, ears, a mouth. No legs.**
**Black and white.** 64×64, facing east. Full details in `ASSETS.md`.

**The colour ladder.** A bat starts plain black-and-white and climbs the rainbow
*backwards* as it is upgraded:

| Tier | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| | Plain | Violet | Indigo | Blue | Green | Yellow | Orange | Red |

Red is the top. The ladder is in `data/config.js` as `upgradeTiers`. It is
**not wired up** — there is nothing to spend upgrades on until the suns and the
casino exist (B13, M4).

**Why black-and-white art is a genuinely good call:** a white drawing can be
**tinted** any colour by the engine. So Lewis draws each bat **once** and the
game produces all eight versions of it. Nobody draws eight Scout Bats.

**`[TO DECIDE]` — how many colour tiers, really?** *(B23, new)* — Lewis said
VIBGYOR "although we may simplify down a bit". Seven upgrades per bat is a lot
of casino prices to balance.

**`[TO DECIDE]` — what should the *enemies* look like?** *(B4, and B3 says what
they are: a mosquito, a spider and a scorpion)*
**`[TO DECIDE]` — do the bats get animation frames, or stay as one pose?** *(B21)*
**`[TO DECIDE]` — music and sound effects?** *(B15)*
**`[TO DECIDE]` — what happens visually when a bat dies?** *(B16)*
**`[TO DECIDE]` — what does the enemy base do when it breaks?** *(B18)*

---

## 10. Story & Win Condition

**Right now:** destroy the enemy base to win; lose yours and it's over. A panel
says VICTORY or DEFEAT with a Retry button.

**DECIDED (2026-09-19) — the spine, from B1, B2 and B3.** The world is
**Palopa**. The bats are **hunting**: the enemies are the things they eat —
mosquitos, spiders, scorpions. The first place is **The Cave**, and it is wet.

That is a deliberately small story, and it is the right size for this game. It
explains the endless waves (a cave is full of bugs), it needs no villain, and it
puts no ceiling on what Lewis can invent next — any crawling thing can be in the
next cave.

What it does **not** yet answer: whether the hunt builds to anything. That is
B8 (a boss) and B18 (what the last moment looks like).

---

## 11. Roadmap

| Milestone | What it adds | Status |
|---|---|---|
| **M1 — First playable** | One lane, two bats, two enemies, energy + cooldowns, bases, win/lose, Retry, placeholder art | ✅ **Done 2026-09-18** |
| **M2 — Content** | **Ten or more caves** (B10 = C), a difficulty curve, a way to pick a cave | 🔜 Next — third bat ✅ built, enemies ✅ named; still needs **B11**, **B17** |
| **M3 — Look & feel** | Hand-drawn black-and-white bats, the three bugs, a wet-cave background, sound | Needs the **B4 redraw**, B15, B16 |
| **M4 — Progression** | Saved progress, **suns**, **the casino**, bat upgrades shown as colours | Scoped by B13/B12/B19 ✅; needs **B22** (shop or gamble?) |
| **M5 — Depth** | A boss, maybe a second lane. *Special powers arrived early* — the Necrobatcer's summon is the first one | Needs B8, B14 |

Order is a plan, not a promise — if Lewis most wants a boss, we build the boss.

**Round 1 of the homework moved four of these.** The third bat is built, the
enemies have names and a reason to exist, the world has a name, and M4 has a
shape. The two things now blocking M2 are both Lewis's: **what makes the next
cave different (B11)** and **what the caves are called (B17)** — and B10 means
he needs about ten of those names.

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
| B1 | Why are the bats fighting? | §1, §10 | ✅ **answered** — they are hunting their food |
| B2 | The world's name and look | §1 | ✅ **answered** — Palopa; The Cave; wet |
| B3 | Who is the enemy? | §4 | ✅ **answered** — mosquito, spider, scorpion |
| B4 | What things look like | §9 | ⚠️ **re-answered** — hand-drawn, B&W + colour tiers. **Needs redrawing** |
| B5 | The third bat | §3 | ✅ **answered & built** — the Necrobatcer |
| B6 | Special powers, or stats only? | §3 | ✅ **answered by B5** — yes, powers |
| B7 | How strict should saving up be? | §3 | ✅ **answered** — A, keep it strict |
| B8 | Is there a boss? | §4 | 🔲 M5 |
| B9 | A long-range bat? | §6 | 🔲 M2 — **still the open problem**, see below |
| B10 | How many levels? | §7 | ✅ **answered** — C, ten or more caves |
| B11 | What makes the next cave different? | §7 | 🔲 **M2 — now blocking** |
| B12 | How do you unlock bats? | §8 | ✅ **answered by B13** — by winning caves |
| B13 | Does progress save? | §8 | ✅ **answered** — B: saves, plus suns and the casino |
| B14 | A second lane? | §6 | 🔲 M5 |
| B15 | Music and sound | §9 | 🔲 M3 |
| B16 | What a bat's death looks like | §9 | 🔲 M3 |
| B17 | Cave names | §7 | 🔲 **M2 — now blocking, and B10 wants ~10** |
| B18 | The base-breaking moment | §9 | 🔲 anytime |
| B19 | Can you upgrade a bat? | §8 | ✅ **answered by B4 + B13** — yes, shown as colour |
| B20 | A fast-forward button? | §5 | 🔲 anytime |
| B21 | Animate the bats, or leave them as one pose? | §9 | ⚠️ Scout walks, but the **B4 redraw resets this** |
| B22 | Is the casino a shop or a gamble? | §8 | 🔲 **new**, M4 |
| B23 | How many colour tiers, really? | §9 | 🔲 **new**, M4 |
| B24 | Can the Necrobatcer raise the bugs too? | §3 | 🔲 **new**, anytime |

### Still unsolved: the all-or-nothing ending (B9)

A battle almost always ends with your base at **100% or 0%**, never in between,
because whoever wins the front line takes everything. B9 exists to fix that, and
the Necrobatcer does **not** fix it — it reinforces the front line rather than
reaching past it, so the runaway is unchanged. A bat that can hit *over* the
front line, like the Sniper in B5's option A, is still the main idea on the
table. Worth putting back on Lewis's plate as a fourth bat.

Questions live in `HOMEWORK_BACKLOG.md`; the current round is on Lewis's plate
in `HOMEWORK.md`; answers get recorded through the loop in `DECISIONS.md`.
