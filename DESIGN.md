# Battle Bats — Game Design Document

> A 2D lane auto-battler, built together by Jeff & Lewis.
> **Status:** Living document — v0.3, updated 2026-09-19. Homework Rounds 1 and
> 2 are both shipped: **all ten caves of Palopa exist**, along with the Archer
> Bat, the Cow Killer Bee, and grave markers.
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
| **Necrobatcer** | 60 | 4.0s | 70 | 4 | 1.2s | **3.3** | **200** | 70 |
| **Archer Bat** | 45 | 3.0s | 24 | 22 | 1.1s | **20.0** | **240** | 75 |

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
- the Necrobatcer raises one grave every **5 seconds**, within **460px** (320
  until B24 raised it);
- the raised bat returns at **60% health**, standing **where it died** — so it
  skips the long walk from your base. That is the real power.

Two rules are in the code rather than the data, because they stop the game
breaking instead of tuning how it feels: **a bat can only ever be raised once**,
and **a Necrobatcer can never raise another Necrobatcer**. Either one missing
turns a single grave into an endless army. Both are checked by
`node tools/necro-test.js`.

**It is built and playable now**, but **not in Level 1** — see §7 for why.

**DECIDED (2026-09-19) — B24: it raises only Lewis's own bats, and reaches
further.** Dead bugs stay dead. Summon range **320 → 460**, which Lewis asked
for specifically — that is most of the way across the lane, so a Necrobatcer
standing safely behind the line can still reach the front of it.

**CHANGED (2026-09-20) — it casts from the back: attack reach 60 → 200.** Jeff:
*"the Necrobatcer should have more of a range attack as a summoner, similar to
the Archer Bat."*

That fixed a genuine incoherence in the bat. Its **summon** reach was already
460, but its **attack** reach was 60 — and a unit walks forward until something
is inside its *attack* range, so the summoner was marching into the exact scrum
it was supposed to be standing behind. The bat wanted to hang back and its own
numbers dragged it forward.

Measured, in a real battle played as a summoner build: across 138 samples it now
averages **174px** from the nearest bug, ranging 106–448, and was **never once**
inside the old 60px reach. Lined up against a single target, the four bats stop
at 39 / 46 / **199** / 240 — the Necrobatcer now shares a back line with the
Archer instead of dying next to the Scouts.

**200, not the Archer's 240**, because being the longest reach in Palopa is the
Archer's identity (B9) and the boss fight turns on it.

**Its damage did not change.** 3.3 dps, a quarter of a Scout's. Standing safely
is the reward; this bat still wins battles by raising the dead, not by shooting.

**DECIDED (2026-09-19) — B9 = A: the fourth bat is the ARCHER BAT.** The first
bat that does not walk into the fight. Reach **240** against a Scout's 40, and
24 hp, so it is lethal from a distance and instant confetti up close.

Its whole power was one number — `src/systems/combat.js` already honoured any
reach — so this was measured before it was promised rather than after.

**Its damage had to be fixed twice, and the reason is worth keeping.** At 14
attack it did **0.28 damage per energy spent** against a Scout Bat's 0.53: less
than half the damage for nearly double the price. That is not "expensive but
safe", it is just a bad bat, and the balance sim showed the whole army getting
*weaker* whenever the button was offered. At 22 the shape is right:

| | per bat | per energy |
|---|---|---|
| **Scout Bat** | 13.3 dps | **0.53** |
| **Archer Bat** | **20.0 dps** | 0.44 |

Stronger per bat, weaker per coin — you are paying a premium for a bat nothing
can reach.

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

Lewis added: *"but level 1 is too difficult currently."* That was the **cooldown
bug** (`DECISIONS.md` D8), which was fixed the same day but had not yet reached
the live site he was playing — so he judged the broken build. **The fix went
live on 2026-09-19 at 12:22 UTC** (merge `f8f87d3`, Pages deploy run #7), and on
that build attentive tapping wins Level 1 in 56–60 seconds.

**UPDATED 2026-09-19 — he played the fixed version, said it was still too hard,
and he was right.** The measurements agreed with him: cave 1 was the **only**
cave in Palopa that a 1.0s-late thumb lost, while all nine others survived a
3.0s thumb. The tutorial was the hardest thing in the game.

The cause is structural: **cave 1 is the only cave where you have two bats.**
Caves 2–10 are gentler because the Archer and the Necrobatcer carry them, and
cave 1 was being asked to match that with Scouts alone.

| | was | now |
|---|---|---|
| Starting energy | 40 | **70** |
| Fortress | 4000 | **3800** |
| Your base | 1000 | **1400** |
| Bugs | 30 | **26** |
| **Income** | **13/s** | **13/s — unchanged** |

**The income is deliberately untouched.** "More energy per second" was exactly
option B in B7, and Lewis turned it down for "keep it strict". So the tight
economy stays, hoarding still loses outright, and `teachesSpending` still holds.
It now wins at 49–58s attentively and survives a **4-second** thumb.

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

**DECIDED (2026-09-19) — B8 = A: one big boss, the COW KILLER BEE.** "A queen
bee with a very long stinger." — Lewis. She appears **once in the whole game**,
in the last wave of cave 10, the Final Stadium.

| Boss | HP | Attack | Interval | **DPS** | Range | Speed |
|---|---|---|---|---|---|---|
| **Cow Killer Bee** | 2400 | 55 | 1.8s | **30.6** | **130** | 26 |

**The long stinger is the fight.** Taken literally, the stinger is *reach*: 130
against a Scout Bat's 40 and a Brute's 46. So she kills your entire front line
without any of it ever touching her. Only the **Archer Bat**, at 240, both
out-reaches her and hits hard enough for it to matter — the Necrobatcer's 200
keeps it safe from the stinger too, but at 3.3 dps it would need twelve minutes
alone. In practice the Archer is still the answer, and it out-reaches
her — Lewis's two answers this round turned out to be the lock and the key, which
was luck rather than planning but is exactly how it should read.

She is not a wall you must solve, though: a Scout swarm can still grind her down
by attrition. Measured, a Brute-heavy army takes about **210 seconds** to beat
cave 10 because its bats die without landing a hit, against 66–73s for a mixed
one. **The boss punishes pure melee without ever making the cave impossible** —
which matters when the player is nine years old.

**DECIDED (2026-09-20) — B26: three more bugs, one per cave that asked for
one.** Lewis was asked only for a name and whether each was "small and fast or
big and slow". He gave that, and then gave one of them a **power** — which makes
the Desert Scorpion the second special ability in the game, after the
Necrobatcer's summon.

| Enemy | Where | HP | Attack | Interval | **DPS** | Range | Speed |
|---|---|---|---|---|---|---|---|
| **Desert Scorpion** | Sahara-hara, Forgotten Oasis | 120 | 12 | 1.0s | **12.0** | 42 | **78** |
| **Evil Butterfly** | Dream Land | 190 | 9 | 1.3s | **6.9** | 40 | **0** |
| **Lightning Bug** | Abyss of Darkness | 45 | 5 | 1.1s | **4.5** | 36 | 26 |

### The Desert Scorpion — every attack is a coin flip

> *"desert has scorpions (fast, every attack has a chance to kill you or kill
> itself)"* — Lewis

Each swing rolls twice: a **20%** chance to kill whatever it hit **outright**,
whatever that thing's health, and a **30%** chance to kill **itself**. Bursting
is the likelier of the two on purpose, so the sting usually costs the scorpion
its life — each one expects to take about two-thirds of a bat with it.

Its ordinary numbers are deliberately modest (12 dps is below a Spider's 13).
You are not meant to fear its bite, you are meant to fear its luck.

**What it does to your army is the interesting part.** An instant kill does not
care whether it landed on a 40hp Scout or a 220hp Brute Bat, so the desert is
the one place in Palopa where putting all your energy into one expensive bat is
a bad idea, and a crowd of cheap ones is the safer answer. A cave that changes
which army is *correct* is a cave with an identity.

Three rules live in `src/systems/sting.js` rather than in the data, because they
keep it fair rather than tune it: **a sting can never instantly kill a base**
(one roll must not decide a cave), it cannot finish off something already dying,
and the backfire is rolled on every attack — even against a building, so a
scorpion that bursts while chewing your fortress has done you a favour.

### The Evil Butterfly — a bug that does not walk

> *"Dream Land has evil butterfly (don't really move, they hover like a wall to
> protect the tower)"* — Lewis

The whole thing is **one number: `speed: 0`**. Enemies spawn just in front of
their own tower, so a butterfly that never advances *is* a door across it. While
one is alive your melee bats stop at **it** and physically cannot reach the
building behind.

Measured in a real browser: a Brute Bat walked to x=790, spent **nine seconds**
chewing one butterfly with the tower taking **zero** damage, then stepped
forward to x=802 and started on the building. That is Lewis's description
working exactly as written.

Dream Land's fortress came **down** from 2100 to 1500 when they arrived — the
butterflies are part of the tower's defence now, so the tower needs less of its
own. Without that, adding 950hp of wall would have quietly undone D29.

### The Lightning Bug — slow, weak, and still worth 14 seconds

> *"abyss of darkness has lightning bugs (slow and weak)"* — Lewis

No power, because he did not ask for one. A lightning bug is a firefly, so in
the cave with no light these are the only things you can see: they are the
brightest colour of any bug in Palopa.

They are the gentlest bug in the game, so the Abyss gets **more** of them rather
than nastier ones — and measured, the twenty of them make that cave take **71
seconds instead of 57**. They manage it without ever piling up: at 45 health
they die about as fast as they arrive, and rarely are more than three alive at
once. So what they really are is **900 extra health fed to your front line in a
trickle**, which is precisely what a slow weak bug should be.

It is a finer edge than it looks — making each swarm four bigger lost **all 80**
test runs.

**`[TO DECIDE]` — is "Desert Scorpion" the right name?** *(B28, new)* — Lewis
said "the desert has scorpions", but Palopa already had a Scorpion, and his is a
different animal: fast and gambling where the old one is slow and armoured. They
are both in the game under two names that sound like the same creature.

**`[TO DECIDE]` — what do the three new bugs look like?** *(B30, new)* — all
three are still art the game draws itself, in placeholder colours: desert sand,
dream magenta and firefly yellow-green.

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

**DECIDED (2026-09-19) — B9 = A: the Archer Bat, reach 240.** See §3.
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

- **A level needs to be pickable. ✅ DONE 2026-09-19.** `STARTING_LEVEL` in
  `src/main.js` was the only way to choose a level, so the game was a dead end:
  you beat The Cave, and RETRY sent you back to The Cave while MENU led to a
  Start button that also launched The Cave. The Graveyard existed in the data
  and could not be reached at all without editing code.

  The title screen now lists **every level in `data/levels.js`** — caves
  numbered, practice levels shown separately — and the victory panel offers
  **NEXT CAVE** when there is one. `src/systems/caves.js` is the single place
  that answers "what exists and what is next", so the menu and the victory
  screen cannot disagree.

  **Nothing is locked and nothing is saved.** Every cave is pickable. Locking,
  remembering what you beat, and earning suns are B12/B13 (M4) — this change
  only stops the game being a loop.
- **Levels have to get cheaper to make.** Each one is measured, and Level 1 took
  a lot of testing. `tools/balance-sim.js` is what makes ten caves realistic
  instead of exhausting: it plays a whole cave in a fraction of a second and
  says whether it holds up for a person.

### The Graveyard — a test level, not a cave

There is a second entry in `data/levels.js` called `graveyard`. It is **not**
one of the caves of Palopa and has no story: it exists so Lewis can play with
the Necrobatcer today, because the bat is built but is deliberately kept out of
Level 1. **Pick it from the title screen** — it appears under "just for
practice", below the caves. (Editing `STARTING_LEVEL` is no longer needed.)

It is generous on purpose (120 starting energy, 18/sec) so that summoning is
easy to see rather than something to budget for. Measured: a win in 41–55s
across the whole reaction band, raising 7–9 bats from the dead per playthrough.

It carries **`practice: true`**, which tells `tools/balance-sim.js` not to fail
it for letting a hoarder win. Hoarding is *supposed* to work on a level built
for experimenting, and a tool that cries wolf is a tool people stop reading —
which is how the original Level 1 bug survived in the first place. A real cave
omits the flag and is held to the full verdict.

**DECIDED (2026-09-19) — B17: the ten caves of Palopa, and B11: what makes each
one different.** Lewis named all ten and said *"each cave gets tougher, new bugs
are introduced but not every level has a new bug. some have less energy or
tougher fortress or no warm up."*

So each cave leans on **one named lever**, which keeps the difference legible
instead of mushy. All ten are built, and every number below is measured:

| # | Cave | Its lever | Fortress | Income | Bats |
|---|---|---|---|---|---|
| 1 | **The Cave** | the tutorial: keep spending | 1900 | 13/s | Scout, Brute |
| 2 | **Crystal Falls** | a new bug — the **Spider** arrives | 2100 | 13/s | + Archer |
| 3 | **Dream Land** | no warm-up, **and the Evil Butterfly wall** | **1500** | 13/s | + Archer |
| 4 | **Pyramid** | a **tougher fortress** | 2800 | 15/s | + Necrobatcer |
| 5 | **Sahara-hara Desert** | less energy, **and the Desert Scorpion** | 2300 | 11/s | all four |
| 6 | **Wait Um** | the **longest siege** in the game | 3800 | 15/s | all four |
| 7 | **Scarred Woods** | no warm-up, and **spider country** | 2200 | 14/s | all four |
| 8 | **Abyss of Darkness** | two levers, **plus Lightning Bug swarms** | 2800 | 12/s | all four |
| 9 | **Forgotten Oasis** | **both kinds of scorpion**, and lots of them | 2800 | 13/s | all four |
| 10 | **Final Stadium** | the **boss** | 2500 | 16/s | all four |

*(Dream Land's 1500 is the one cave that is not simply half its original: it came
down again from 2100 when the Evil Butterflies arrived in B26, because the
butterflies are part of that tower's defence now — see §4.)*

**DECIDED (2026-09-19) — every fortress was HALVED.** The endgame dragged, and
the measurement was blunt about why: **72% of all playing time across the ten
caves was spent chewing a fortress.** Bats reach it at 11–23s and then hammer a
wall for another 35–50 seconds. Halving takes 10–15 seconds off every cave and
changes nothing else — all ten still pass, cave 1 still punishes hoarding, and
the Cow Killer Bee still lands well before the Final Stadium ends. Relative
sizes are kept, so "Wait Um is the longest siege" and "Pyramid has a tough
fortress" both remain true.

**DECIDED (2026-09-19) — bats arrive cave by cave.** B12 said bats unlock by
winning, but unlocking needs saved progress (M4). A cave's `playerUnits` list
gives the same feeling today with no guesswork, and becomes the unlock table
later.

### What is measured, and what is not

Every cave is **winnable across the whole 0.2–0.5s reaction band, two very
different ways** — by spamming the cheapest bat *and* by saving up for the
dearest — and in every one of them **spending beats hoarding on the clock**.

What the sim cannot tell us is how hard a cave **feels**. Both of its player
models are extremes, and neither composes an army the way a person does, so the
rising difficulty is designed from rising pressure (total HP to chew through
climbs 6310 → 11375 across the ten) rather than proved. **That part needs
Lewis to play them.** See `DECISIONS.md` D23.

One thing the sim *can* show, and did: until 2026-09-19 **cave 1 was the only
cave that a slow thumb lost at all**, which made the tutorial the hardest cave
in the game. It has been eased (D27) and now, like the other nine, it holds up
past a 3-second reaction.

---

## 8. Progression & Unlocks

**BUILT 2026-09-19 — the caves lock, and progress is saved.** Cave 1 is always
open; every other cave opens when the one before it is beaten. The Graveyard is a
practice ground rather than part of Palopa, so it is always open.

Locked caves are still **drawn** on the title screen, dark and unclickable —
seeing that there are ten of them, and which one is next, is most of what a map
is for. Beaten caves get a tick, and the header counts them.

This is `src/systems/progress.js`, saved under one `localStorage` key. Three
things about it worth knowing:

- **It is per browser, per device.** No account, nothing leaves the machine, and
  clearing browser data clears progress. That is the right trade for a game with
  no login.
- **Every read and write is wrapped in try/catch, and corrupt data is treated as
  a fresh start.** `localStorage` *throws* rather than returning null in a
  private window, and can be blocked or full. A game that dies on the title
  screen because storage is unavailable would be far worse than one that forgets.
- **Progress can be wiped**, from a "Reset progress" line inside the Credits
  panel that needs two taps. A cave should be replayable, and the locking has to
  be testable — but not one mis-tap from undoing everything.

Only the list of beaten caves is stored. Suns, goods and bat upgrades are still
to come, so adding them later means adding fields rather than rewriting this.

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

**DECIDED (2026-09-19) — B22: the casino is a TWO-STEP economy**, which is not
either answer Dad offered. "At the casino you exchange suns for blood, potions,
fruits that you can trade or gamble for upgrades." — Lewis

So there are three currencies, not two:

```
beat a cave  ->  SUNS  ->  (at the casino)  ->  BLOOD / POTIONS / FRUIT
                                                      |
                                    trade them  or  gamble them
                                                      |
                                                  UPGRADES (a bat's colour)
```

Both of Dad's options survive — there is a shop *and* a gamble — with an item
layer between, so a bad gamble costs you goods rather than your progress. That
is a gentler shape than a straight slot machine, which matters in a game a child
plays.

**DECIDED (2026-09-20) — B27: potions and fruit are NOT currency.**

> *"potions and fruit are different, they are not just currency. you can use
> potions during a battle to make the opponent weaker. fruit can heal your
> tower, but only slightly. blood is just currency."* — Lewis

He rejected the shape of the question, and was right to. Dad had offered three
flavours of *thing you trade*; Lewis made two of them **battle actions**. That
is a bigger idea, because it gives the player something to do with a tap other
than send another bat — the first such thing in the game.

| Good | What it is | What it does |
|---|---|---|
| **Blood** | money | nothing else. It never comes into a battle |
| **Potion** | a battle action | for **10 seconds every bug hits for half** |
| **Fruit** | a battle action | heals your tower **8% of its full health** |

**BUILT 2026-09-20.** Both work, with their own buttons beside the bats. The
numbers are in `data/items.js`, the rules in `src/systems/items.js`.

Three rules live in the code rather than the data, because they stop the game
being broken rather than tune how it feels:

- **A potion sets its timer, it never adds to it.** Three potions give ten
  weakened seconds, not thirty — otherwise a player who hoarded six could switch
  a whole cave off.
- **A potion only ever weakens the bugs**, never your own bats, and it is worked
  out *at the moment of the hit*. Every bug of one kind shares a single stats
  object, so weakening "the scorpions" by editing that object would weaken every
  scorpion in the game for ever, including next battle.
- **Fruit cannot be thrown at a full tower**, and cannot overheal.

**Where they come from is still open.** The casino does not exist, so for now a
level can hand you a starting stock, and exactly one does: the **Graveyard**
practice level starts you with three of each so Lewis can play with his idea
today. This is the same trick as the Necrobatcer (D14) — the thing itself is
real and finished, only the way you *acquire* it is stubbed.

**The ten caves deliberately start with none**, and are measured without them,
so an item is always a bonus and never a requirement. A cave that needs a potion
is a cave you can arrive at unable to win.

Lewis's answer also narrows B22: "blood is just currency" means the trade-or-
gamble step buys **upgrades with blood**, while potions and fruit are things you
*spend in a fight*. So the casino has two kinds of output, not one.

**`[TO DECIDE]` — how do you actually GET potions and fruit?** *(B29, new)* —
how many does a cave's win buy, do they carry between battles, and can you lose
them in the gamble? This is the last thing blocking the casino.

---

## 9. Look & Sound

**BUILT (2026-09-21) — five caves have real paintings.** Crystal Falls, Dream
Land, Abyss of Darkness, Forgotten Oasis and the Final Stadium each have their
own artwork instead of the flat purple every cave shared. `data/backgrounds.js`
holds them; `assets/bg/` holds the pictures.

### The one number per painting: `ground`

Every painting has a flat surface the bats are meant to stand on, and it is
somewhere different in each — a wet stone floor in Crystal Falls, a shelf of
cloud in Dream Land, a strip of rubble in the Abyss. The game, meanwhile, walks
its bats along one fixed line, `CONFIG.lane.y`.

So each picture declares its own ground as a **fraction of its height**, and the
game slides the picture up or down until that line meets the lane. Bigger means
the bats stand lower down the picture; about 0.01 is six pixels on screen.

**Detecting it automatically was tried and abandoned.** The obvious approach —
find the sharpest darkening in the lower half — worked on the Abyss and then
found completely the wrong edge on Crystal Falls: the *back* of the stone floor
rather than its front lip, a hundred pixels out. `tools/import-background.js`
still prints a guess, because a guess to nudge beats a blank, but every cave is
checked by eye against the real game framing.

### Fitted, never cropped

The paintings are about 2.25:1 and the screen is 1.78:1, so something has to
give. Rather than crop — these compositions put their framing at the edges, so
cropping costs the best of them — the picture is scaled to the screen's width
and the strips left bare at top and bottom are filled with flat colour **taken
from the painting's own edges**. On the dark caves the join is invisible.

### What the paintings broke

Two things, both worth recording because neither failed loudly:

- **The layering.** The picture was put at depth −1000 to sit behind the bats,
  and then the two edge-fills were drawn at the default depth of 0, straight
  over the top of it. The cave rendered as a flat navy rectangle, no error, no
  warning. Everything is stacked explicitly now.
- **Text contrast.** Every number on screen used to sit on the same flat purple,
  so plain white was fine — an assumption nobody had written down. Over Dream
  Land's clouds the fortress health readouts became white on white and could not
  be read at all. All HUD text now carries a dark outline (`CONFIG.text`).

**`[TO DECIDE]` — the five caves still without a painting:** The Cave, Pyramid,
Sahara-hara Desert, Scarred Woods and Wait Um. They fall back to the flat purple
until their pictures land, so the game works either way.

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

**DELIVERED 2026-09-19 — three of the four bats are drawn and in the game:**
the **Scout Bat** (big eyes, big ears), the **Brute Bat** (scowling), and the
**Necrobatcer**, which Lewis drew as a **bat skull carrying a flaming staff** -
a better idea than anything the brief asked for. The **Archer Bat** and all the
bugs are still placeholder shapes.

Two things the import settled, both in `ASSETS.md` in full:

- **The frames are wide** (150×64, 132×64, 100×64), because a bat with its
  wings out is a wide thing. They share a 64px height so every bat stands on
  the same baseline, and each unit's `scale` came down to match.
- **They are 66–70% light pixels inside black outlines**, which is exactly what
  the colour ladder needs: a tint multiplies, so the light areas take the
  colour and the outlines stay black.

The bats are drawn **front-on and symmetrical**, so the old "everything faces
east" rule no longer bites - mirroring them changes nothing.

**The colour ladder.** A bat starts plain black-and-white and climbs the rainbow
*backwards* as it is upgraded:

**DECIDED (2026-09-19) — B23 = B: four steps, not seven.**

| Tier | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| | Plain | Violet | Blue | Yellow | Red |

Red is the top. Seven upgrades per bat would have meant seven prices to balance
for every bat in the game; four keeps the backwards rainbow reading the same way
for a quarter of the work. The ladder is in `data/config.js` as `upgradeTiers`.
It is **not wired up** — there is nothing to spend upgrades on until the suns
and the casino exist (B13, M4).

**Why black-and-white art is a genuinely good call:** a white drawing can be
**tinted** any colour by the engine. So Lewis draws each bat **once** and the
game produces every colour of it. Nobody draws five Scout Bats.

**`[TO DECIDE]` — what should the *enemies* look like?** *(B4, and B3 says what
they are: a mosquito, a spider and a scorpion)*
**`[TO DECIDE]` — do the bats get animation frames, or stay as one pose?** *(B21)*

The current state is worth stating exactly, because it is backwards. **The
placeholder blobs animate and Lewis's real drawings do not.** Every unit the
game paints itself — the Archer and all seven bugs — has a full 13-frame sheet
and visibly flaps, lunges when it attacks and topples over when it dies. The
three bats Lewis actually drew have a single pose each, so they slide across the
lane frozen.

That is because the Scout's 16-frame walk cycle belonged to the superseded
2026-09-18 design and did not survive the redraw. So the better art is the only
art that does not move.

Two different fixes, and they are not exclusive:

- **Lewis draws frames** — the real answer to B21. The machinery already reads
  whatever `data/units.js` declares, so it is waiting on drawings, not on code.
- **The game moves a single pose itself** — a bob while hovering, a lunge on the
  swing, a topple on death, applied to any sprite with only one frame. That needs
  no drawings at all and would un-freeze the three best-looking things in the
  game today.
**`[TO DECIDE]` — music and sound effects?** *(B15)*
**DECIDED (2026-09-19) — B16 = D: a bat leaves a GRAVE MARKER where it fell.**
A small headstone on the lane, cleared the instant a Necrobatcer raises it.

Lewis picked this over a puff of dust or a ghost, and it is the strongest of the
options for a reason worth recording: **the Necrobatcer's rules were completely
invisible.** It can only raise a bat that really fell, and only one within its
summon range — so a resurrection looked like luck. With the graves drawn, a
player can see where the summoner can reach and *aim* it. A hidden rule became a
decision.

It also settles **B25**, which asked exactly this. The positions were already
tracked in `world.graves`, so this draws what the game always knew. Settings live
in `CONFIG.graveMarker`; the stones are pooled like everything else.
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
| **M2 — Content** | **Ten caves** (B10 = C), a difficulty curve, a way to pick a cave | ✅ **Done 2026-09-19** — all ten built and measured, four bats, a boss, a cave picker |
| **M3 — Look & feel** | Hand-drawn black-and-white bats, the bugs, cave backgrounds, sound | 🟡 **Well under way.** 3 of 4 bats ✅, **5 of 10 cave paintings ✅**. Still needs the **Archer**, the **seven bugs** (B30), the **two fortresses**, five more caves, animation (B21) and sound (B15) |
| **M4 — Progression** | Saved progress, **suns**, **the casino**, goods, bat upgrades as colours | 🟡 **Started** — saved progress, cave unlocking, and potions/fruit ✅ built; suns, the casino and upgrades need **B29** |
| **M5 — Depth** | Maybe a second lane, more powers | Needs B14. *Both of its headline items arrived early* — the Necrobatcer's summon (B5) and the boss (B8) |

Order is a plan, not a promise — if Lewis most wants a boss, we build the boss.

**Two rounds of homework finished M2**, and a third filled the caves out. Palopa
has all ten of its caves, four bats, a boss, seven kinds of bug, a cave picker
and two usable items, and every cave is measured. Three rounds have answered
**21 of the 30** questions.

**The gap is art, not design**, and it is closing. **Five of the ten caves now
have real paintings** (§9), and three of the four bats are Lewis's drawings.
Still outstanding: the **Archer Bat and all seven bugs are coloured blobs**, the
**two fortresses are plain rectangles**, and five caves are still flat purple.

One thing is also exactly backwards: since the redraw, **the placeholder blobs
animate and Lewis's three real bats are frozen** — the good art is the only art
that does not move (see B21 in §9).

Almost nothing left in M3 is blocked on Dad. It is blocked on drawings.

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
| B8 | Is there a boss? | §4 | ✅ **answered & built** — the Cow Killer Bee |
| B9 | A long-range bat? | §6 | ✅ **answered & built** — the Archer Bat |
| B10 | How many levels? | §7 | ✅ **answered** — C, ten or more caves |
| B11 | What makes each cave different? | §7 | ✅ **answered & built** — one lever per cave |
| B12 | How do you unlock bats? | §8 | ✅ **answered by B13** — by winning caves |
| B13 | Does progress save? | §8 | ✅ **answered** — B: saves, plus suns and the casino |
| B14 | A second lane? | §6 | 🔲 M5 |
| B15 | Music and sound | §9 | 🔲 M3 |
| B16 | What a bat's death looks like | §9 | ✅ **answered & built** — grave markers |
| B17 | Cave names | §7 | ✅ **answered & built** — all ten |
| B18 | The base-breaking moment | §9 | 🔲 anytime |
| B19 | Can you upgrade a bat? | §8 | ✅ **answered by B4 + B13** — yes, shown as colour |
| B20 | A fast-forward button? | §5 | 🔲 anytime |
| B21 | Animate the bats, or leave them as one pose? | §9 | ⚠️ **nothing animates now** — the B4 redraw replaced the Scout's walk cycle with a single pose |
| B22 | Is the casino a shop or a gamble? | §8 | ✅ **answered** — both, with goods in between |
| B23 | How many colour tiers, really? | §9 | ✅ **answered** — four |
| B24 | Can the Necrobatcer raise the bugs too? | §3 | ✅ **answered** — bats only, longer reach |
| B25 | Should graves be visible on the ground? | §9 | ✅ **answered by B16** — yes, built |
| B26 | Name the new bugs of the later caves | §4 | ✅ **answered & built** — all three, in their caves |
| B27 | What do blood, potions and fruits do? | §8 | ✅ **answered & built** — potion + fruit are battle actions |
| B28 | Is "Desert Scorpion" the right name? | §4 | 🔲 **new — on the plate** |
| B29 | How do you *get* potions and fruit? | §8 | 🔲 **new — on the plate**, blocks M4 |
| B30 | What do the three new bugs look like? | §9 | 🔲 **new — on the plate** |

### Solved, mostly: the all-or-nothing ending (B9)

A battle almost always ends with your base at **100% or 0%**, never in between,
because whoever wins the front line takes everything. B9 exists to fix that, and
the Necrobatcer does **not** fix it — it reinforces the front line rather than
reaching past it, so the runaway is unchanged. A bat that can hit *over* the
front line was the only idea on the table, and Lewis took it: **the Archer Bat
is built** (B9 = A). Whether it actually makes endings feel closer is now a
question for playing, not measuring - the sim still reports 100% or 0% because
its two player models both fight to the death rather than retreating.

**Measured 2026-09-19 — it needs no new code.** `range` is one number and
`Combat.isInReach` already honours any value. A probe bat with `range: 250`
reached a target at 320px that a Scout (range 40) cannot, stopped at exactly
250px, and won Level 1 alone in 80.3s, first hitting the enemy base from range
at 24.8s. **The caveat matters as much as the result:** offered alongside
Scouts, it was never once affordable, because Scout spam consumes the entire
income. A fourth bat has to be worth choosing *instead of* Scouts — which is
B7 = A doing exactly what Lewis intended.

Questions live in `HOMEWORK_BACKLOG.md`; the current round is on Lewis's plate
in `HOMEWORK.md`; answers get recorded through the loop in `DECISIONS.md`.
