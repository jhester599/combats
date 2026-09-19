# Homework for Lewis — Round 2 🦇

> **You're the creative director.** That means the *look*, the *feel*, and the
> *what-even-is-this* calls are yours. Dad builds whatever you decide.
>
> **How to answer:** just tell Dad. "B17 — cave 2 is called The Drip. B9 = A and
> it's called Zap." You don't have to do them all at once, and you don't have to
> pick from the options — **"something else"** is always allowed and usually
> better. (You proved that last time: the Necrobatcer beat all four of Dad's
> ideas.)

---

## 🎉 First — go and play it, because three things changed

**https://jhester599.github.io/combats/**

| What's new | Go and look |
|---|---|
| **Level 1 is winnable now.** The bug you found is fixed and **live**. | Tap Scout Bat every time it lights up → you should win in **about a minute**. |
| **Level 1 is called The Cave**, in the world of **Palopa**. | It says so at the top of the screen. |
| **The blobs have names.** The orange one is a **Mosquito**, the red one is a **Scorpion**. | They still look like blobs. That's your next drawing job. 🎨 |

**And your Necrobatcer is built.** It isn't on the website yet because it needs
a level of its own — ask Dad to run it on his computer and you can play it in
about ten seconds. It raises your dead bats *where they fell*, right in the
middle of the fight.

<details>
<summary>🐛 The story of the 0.08-second bug you found (worth a read)</summary>

You tapped Scout Bat every time the button lit up — exactly what this page told
you to do — and you lost. That was **the game's fault**, not yours.

- You could **afford** a Scout Bat every **1.9 seconds**.
- But the button made you **wait 2.0 seconds**.
- The wait was longer than the money — by **0.08 of a second**.

So the button sat there lit up, *waiting for your thumb*, and every little bit
of time before you tapped was a bat you never got back. Being a third of a
second late — which is just being a person — cost you **13% of your whole
army**. And 13% was exactly the difference between winning and losing.

The really bad part: Dad's testing robot tapped on the *exact* 1/60th of a
second the button lit up. So **it** won every time and kept reporting the level
was fine. It was measuring a robot, not a boy.

**Both are fixed.** The Scout's cooldown is 1.4 seconds, so now your *energy*
slows you down instead of the clock — a slow tap just banks the energy. And the
robot has a reaction time now, so it can't lie to us again.

It's logged as decisions **D8, D9 and D10** in `DECISIONS.md`. Finding it
counts. 🦇

</details>

---

## 🟡 Round 2 — eight questions, in the order that helps most

Dad has sorted these so the **top three unblock today**. If you only feel like
answering three, answer those three.

---

# 🔥 These three unblock today

---

### 🔲 B17. INVENT: Name the caves 🗺️ *(blocking — Dad can't build cave 2 without this)*

You picked **ten or more caves**, so Dad needs names. He has one: **The Cave**.
That leaves about nine. 😄

**They don't all have to be caves!** Palopa can have anywhere a bug would live:

- somewhere **wet** — a drip, a well, a puddle, a drain
- somewhere **high** — a roof, a belfry, a chimney
- somewhere **horrible** — a bin, a compost heap, a drain pipe
- somewhere that sounds **scary** — The Deep, The Long Dark, The Nest

**You don't have to do all nine now.** Even just cave 2 and cave 3 lets Dad
start building.

**Cave 1 is called:** The Cave ✅
**Cave 2 is called:** _(open)_
**Cave 3 is called:** _(open)_
**…and after that:** _(open)_

---

### 🔲 B11. PICK ONE (or invent): What makes cave 2 *different*? 🕸️ *(blocking)*

If cave 2 is "the same but more bugs", it's boring, and you'll notice straight
away. So pick the **one thing** that changes:

- [ ] **A) A new bug.** ⭐ *Dad's suggestion, because it's already built* — the
  **Spider** exists in the game right now and has never once appeared. It's
  tougher than a Mosquito and faster than a Scorpion. Cave 2 could be where you
  meet it.
- [ ] **B) Less energy.** You get money more slowly, so you have to be fussier
  about what you send. Harder in a *thinking* way, not a *faster* way.
- [ ] **C) A tougher fortress.** The enemy base has way more health, so it's a
  longer siege. Harder in a *patience* way.
- [ ] **D) No warm-up.** Cave 1 gives you a few gentle seconds at the start.
  Cave 2 throws bugs at you from second one.
- [ ] **E) Something else** — tell Dad and he'll work out the numbers.

**Lewis picks:** _(open)_

---

### 🔲 B9. PICK ONE: A bat that attacks from FAR away? 🎯 *(blocking — and Dad has already tested it)*

**This is the most important question on the page,** because it fixes something
broken about how battles *feel*.

**The problem:** right now a battle almost always ends with your base at **100%
or 0%** — never in between. Whoever wins the scrap in the middle takes
everything. There's no "phew, that was close". Every one of your bats has to
walk *into* the fight, so there's no way to change a fight you're losing.

**A bat that shoots over the top of the fight is the only idea that fixes it.**

**Dad tested this already, and it needs no new code at all** — how far a bat can
reach is just one number. He tried a bat with reach **250** instead of the
Scout's **40**:

- ✅ it worked first time, no code written
- ✅ it won Level 1 in 80 seconds
- ✅ it started hitting the enemy fortress **from a distance**, 24 seconds in
- ⚠️ but when he gave it to you *alongside* Scout Bats, he could **never afford
  a single one** — because spamming Scouts eats all your money. So it has to be
  worth *choosing instead of* Scouts.

- [ ] **A) Yes — the fourth bat is a long-range one.** ⭐ Dad's suggestion.
  Tiny health, so if anything reaches it, it pops. **What's it called?**
- [ ] **B) Yes, but not yet** — finish the caves first, add it later.
- [ ] **C) No** — three bats is enough. *(Then the 100%-or-0% thing stays.)*

**Lewis picks:** _(open)_
**If A, its name is:** _(open)_

---

# 😄 These three are quick, and Dad can build them today too

---

### 🔲 B8. PICK ONE + INVENT: Is there a boss? 👑

Now the enemies are *bugs*, a boss is easy to picture: the biggest, oldest,
nastiest thing in the cave.

- [ ] **A) One big boss, right at the very end of the game.**
- [ ] **B) A boss every few caves.** More bosses, more work, but you get one
  sooner.
- [ ] **C) No bosses** — the fortress is the challenge.

**Good news:** a boss is *mostly just numbers* (huge health, big hit, appears in
the last wave), so Dad can build one the same day you ask.

**If yes — what IS it, and what's it called?** A queen? A spider the size of the
whole screen? Something with too many legs?

**Lewis's answer:** _(open)_

---

### 🔲 B24. PICK ONE: Can the Necrobatcer raise BUGS too? 💀

Right now your Necrobatcer only raises **your** bats. Dead bugs stay dead.

- [ ] **A) Only your own bats.** *(How it works today.)* Simple, and it keeps
  your summoner feeling like it's on your side.
- [ ] **B) Bugs as well** — raise a dead Scorpion and it fights **for you**.
  Much creepier, and *much* stronger, so it'd have to cost more.
- [ ] **C) Bugs only** — a totally different bat that eats the graveyard.

**Lewis picks:** _(open)_

---

### 🔲 B16. PICK ONE: What happens when a bat dies? 💀 *(needed by M3)*

Right now a dying bat just quietly fades out. It's a bit flat for something you
should *feel*.

- [ ] **A) A puff of dust.**
- [ ] **B) A little ghost bat flutters up** and disappears. 👻
- [ ] **C) It topples over** and lies there a moment.
- [ ] **D) Something else.**

**💡 One idea worth hearing, because of *your* bat:** what if a dead bat left a
little **grave marker** on the ground — so you could actually *see* the spots
your Necrobatcer is able to raise? The game already keeps track of exactly where
every bat fell. It'd turn an invisible rule into something you can look at and
plan around.

**Lewis picks:** _(open)_

---

# 🎰 These two aren't urgent — but nothing in the casino can be built until you answer

---

### 🔲 B22. PICK ONE: Is the casino a SHOP, or a GAMBLE? 🎰 *(needed by M4)*

You invented the casino: suns get spent there to upgrade your bats. But
"casino" can mean two really different things, and Dad has to know which.

- [ ] **A) A shop with price tags.** A violet Scout Bat costs 50 suns, always.
  You know exactly what you're saving up *for*.
- [ ] **B) A real gamble.** Pay 10 suns for a spin and you *might* get an
  upgrade. Exciting — but it means sometimes paying and getting **nothing at
  all**, which can feel pretty mean in a game you're playing for fun.
- [ ] **C) Both** — a shop for the upgrades, and a machine you can gamble spare
  suns on if you feel lucky.

**Lewis picks:** _(open)_

---

### 🔲 B23. PICK ONE: How many upgrade colours, really? 🌈 *(needed by M4)*

You said the bats climb the rainbow **backwards** as you upgrade them, and that
you might "simplify down a bit". So:

| Tier | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| | Plain | Violet | Indigo | Blue | Green | Yellow | Orange | **Red** |

- [ ] **A) All seven.** A long ladder with loads to aim for — but seven prices
  for *every* bat is a lot for Dad to balance.
- [ ] **B) Four.** Violet, Blue, Yellow, Red. Same idea, a quarter of the work.
- [ ] **C) Three.** Plain → Blue → Red. Dead easy to read at a glance.

**Also:** does each bat level up **on its own**, or do all your bats go up
**together**?

**Lewis picks:** _(open)_

---

## 🎨 Your drawing jobs (not questions — just things to make)

### 1. Redraw the bats ⭐ *the big one*

Your new design replaced the goggles and the cape, so the game is still showing
the **old** bats. When you're next in PixelLab:

| | |
|---|---|
| Style | **Hand-drawn looking. Not realistic.** |
| Body | **A large circle** |
| Has | **Wings, ears, a mouth** |
| Does not have | **Legs** |
| Colour | **Black and white only** |
| Size | 64×64, facing **east** (to the right) |

**✨ And here's the clever thing about black and white:** the *game* can paint a
white drawing any colour it likes. So you draw each bat **once** and the game
makes all eight colours of it by itself.

**You do not have to draw eight Scout Bats.** Choosing black and white wasn't
just a look — it was a genuinely smart call that saved you about 80% of the
drawing. 👏

### 2. Draw the three bugs

**Mosquito** (small, fast, frail), **Spider** (in between), **Scorpion**
(armoured, slow, heavy). Same size and direction as the bats.

### 3. Later, if you fancy it

Walk / attack / death frames. Right now attacking and dying both just show the
standing pose, because that art doesn't exist yet. *(That's B21.)*

---

## 🛠️ Things you can change RIGHT NOW without asking anyone

Open `data/units.js`, change a number, save, refresh the browser. That's it.

| Try this | What happens |
|---|---|
| Scout Bat `cost: 25` → `5` | You can spam a *hundred* Scout Bats 😄 |
| Scout Bat `color: '#6fd3ff'` → `'#ff00ff'` | Hot pink bats |
| Any bat `range: 40` → `250` | It shoots from **miles** away *(this is B9!)* |
| Necrobatcer `summon.interval: 5.0` → `1.0` | The dead never stay dead 💀 |
| Necrobatcer `summon.hpFactor: 0.6` → `1.0` | Raised bats come back at **full** health |
| In `data/config.js`: `maxGraves: 40` → `3` | Only the freshly fallen can be raised |
| Brute Bat `hp: 220` → `2000` | One Brute tanks the entire cave |
| Any bat `speed: 90` → `300` | They sprint across the screen |
| In `data/levels.js`: `energyPerSecond: 13` → `40` | You're rich, the game gets silly |

**Want to check a cave is still beatable after your changes?**

```
node tools/balance-sim.js level1
node tools/balance-sim.js graveyard
```

It plays the whole cave instantly, as **several different people** — a robot
with a perfect thumb, someone sharp, someone relaxed — and as a hoarder who
saves everything up. Read the **VERDICT** at the bottom.

**Ignore the `0s (robot)` row.** That's the row that fooled us.

**If you break something,** nothing is lost — Dad can undo any change.

---

## ✅ Round 1 — everything you already decided

All eight answered on 2026-09-19, plus one change of mind. Logged as decisions
**4–14** in `DECISIONS.md`, with Dad's reasoning for each.

| # | Question | Your answer | Built? |
|---|---|---|---|
| **B1** | Why are the bats fighting? | They're **hunting their food** | ✅ in the design |
| **B2** | The world and the first place | **Palopa** / **The Cave** / wet | ✅ **live** |
| **B3** | Who is the enemy? | **Mosquito, Scorpion, Spider** | ✅ **live** (Spider waiting for cave 2) |
| **B4** | What the bats look like | ⚠️ **Changed** — hand-drawn B&W circles, colour ladder | 🎨 needs your redraw |
| **B5** | The third bat | **E — the NECROBATCER** 💀 | ✅ built & tested |
| **B6** | Special powers? | **Yes** *(came free with B5)* | ✅ built |
| **B7** | How strict is saving up? | **A — keep it strict** | ✅ nothing loosened |
| **B10** | How many caves? | **C — ten or more** | 🔜 needs B17 + B11 |
| **B12** | How do you get new bats? | **A — by winning caves** *(came free with B13)* | 🔜 M4 |
| **B13** | Does progress save? | **B — yes, plus suns and the casino** | 🔜 needs B22 |
| **B19** | Can you upgrade a bat? | **A — yes, and it shows as a colour** *(came free)* | 🔜 needs B23 |

**Three of those you answered without being asked** — B6, B12 and B19 came free,
because picking a summoner and inventing the casino settled them by accident.
That's what a good answer does. 🦇

<details>
<summary>Why your Necrobatcer isn't in Level 1</summary>

Dad put it in Level 1 first and tested it. A player who **saved up and played
slowly** started **winning** — which is the exact opposite of what Level 1 is
meant to teach, and the opposite of your own B7 answer ("keep it strict").

Your bat rewards *patience*. Level 1 punishes it. Both are right; they just
can't be in the same cave.

So it lives in a practice level called **The Graveyard** until the real cave 2
exists. Ask Dad to switch `STARTING_LEVEL` in `src/main.js` to `'graveyard'`.

Also, two rules Dad had to add or the game breaks:

1. a bat can only be raised **once** — otherwise one grave makes an endless army
   and you can never lose
2. a Necrobatcer can't raise **another Necrobatcer** — same problem, slower

</details>
