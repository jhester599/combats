# Homework Backlog — Lewis's Question Bank 🎒

Every creative-director decision for the whole game, in one place, sorted by
**when we actually need the answer**.

## How this file works

- **This file is the pantry; `HOMEWORK.md` is the plate.** Before a build
  session, Dad moves the next few questions whose milestone is coming up onto
  the plate. Lewis answers whenever he likes.
- When Lewis answers, run the **decision loop** in `DECISIONS.md`: log it,
  update `DESIGN.md`, tick it here (🔲 → ✅), commit.
- **"Needed by"** is the real deadline — the thing that can't be built without
  it. **anytime** means pure flavour, no rush.
- Two kinds of question:
  - **PICK ONE** — choose a letter. "Something else" is always allowed.
  - **INVENT** — make it up. These are the Lewis specials. 🎨
- Numbers (B1, B2…) never change, even when questions move between files. They
  are how `DESIGN.md` §13 points at things.

> **Round 1 is DONE — 2026-09-19.** Lewis answered all eight (B1, B2, B3, B5,
> B7, B10, B13) and re-answered B4. Logged as decisions 4–14 in `DECISIONS.md`.
>
> **On the plate for Round 2:** **B17** (name ~10 caves), **B11** (what makes
> cave 2 different), **B22** (casino: shop or gamble?), **B23** (how many colour
> tiers), **B24** (can the Necrobatcer raise bugs?), plus **redrawing the bats**
> and the three bugs for B4/B3.
> They're written out in full in `HOMEWORK.md` — go there to answer them.

---

## 🎨 Identity — what this game *is*

### ✅ B1. INVENT: Why are the bats fighting? *(ANSWERED 2026-09-19)*
**They're hunting their food** — the enemies are things bats eat.
→ `DESIGN.md` §1, §10

### ✅ B2. INVENT: The world's name, and what the first place looks like *(ANSWERED 2026-09-19)*
**Palopa.** First place: **The Cave**, and it's **wet**. Level 1 is renamed in
the game; the wet look still needs art (M3). → `DESIGN.md` §1

### ✅ B3. INVENT: Who is the enemy? *(ANSWERED 2026-09-19)*
**Mosquito, Scorpion, Spider.** All three are in `data/units.js`; the Spider is
deliberately not in Level 1's waves. **Still open: what they look like** — they
are coloured blobs, which is the rest of B4. → `DESIGN.md` §4

---

## 🦇 M2 — More bats, more levels

### ✅ B5. PICK ONE: What is the third bat? *(ANSWERED & BUILT 2026-09-19)*
**E — invent one: the NECROBATCER.** A summoner that raises your dead bats where
they fell. Built; rules in `src/systems/necro.js`, checked by
`tools/necro-test.js`. Playable in the `graveyard` test level — deliberately
**not** in Level 1 (it rewards hoarding, which Level 1 punishes).
→ `DESIGN.md` §3

### ✅ B7. PICK ONE: How strict should saving up be? *(ANSWERED 2026-09-19)*
**A — keep it strict.** Economy unchanged. Lewis's note that "level 1 is too
difficult" was the D8 cooldown bug, which was fixed but not yet live on the site
he played — so **no second difficulty change was made**. → `DESIGN.md` §3

### 🔲 B9. PICK ONE: Should a bat attack from far away? *(needed by M2)*

Right now **every** bat has to walk into the fight, and that creates a problem
Dad measured while building Level 1: your base almost always ends a battle at
**100% or 0%**, never in between. Whoever wins the front line takes everything.

A bat that can hit *past* the front line is the main thing that would change
that — it's why the Sniper is option A in B5.

- [ ] **A) Yes — make the third bat the Sniper.** *(Same as picking A in B5.)*
- [ ] **B) Yes, but later** — keep the third bat simple, add a sniper as the
  fourth.
- [ ] **C) No** — everyone brawls up close. Simpler and keeps the game honest.

**Lewis picks:** _(open)_

### ✅ B10. PICK ONE: How many levels? *(ANSWERED 2026-09-19 — C, ten or more)*
Full text in `HOMEWORK.md`. → `DESIGN.md` §7

### 🔲 B11. INVENT: What makes Level 2 different from Level 1? *(needed by M2)*

A new level shouldn't just be "the same but more." Pick a twist — or invent one:

- A **new enemy** that does something the others don't.
- **Less energy**, so every deploy really counts.
- A **swarm** level: loads of weak enemies, all at once.
- A **race**: the enemy base is weak, but so is yours — whoever's fastest wins.
- A **new place** with its own look *(ties into B2)*.

**Lewis's answer:** _(open)_
→ `DESIGN.md` §7

### 🔲 B17. INVENT: Name the levels *(needed by M2)*

"First Cave" is a placeholder. Once B10 decides how many levels there are, they
all need names — and a name is usually where a level's *idea* comes from.

**Lewis's answer:** _(open)_
→ `DESIGN.md` §7

---

## 🎨 M3 — Look & sound

### ✅ B4. INVENT: What do the bats look like? *(player bats answered 2026-09-18)*
Lewis made the **Scout Bat** (blue flight goggles) and **Brute Bat** (cape) in
PixelLab; both are in the game. **Still open for the enemies** — see B3.
→ `DESIGN.md` §9, `DECISIONS.md` #1

### ✅ B21. Animate the bats *(Scout walk done 2026-09-18 — A)*

Lewis picked **A** and made the Scout Bat a **16-frame walk cycle** in PixelLab.
It flaps across the lane now.

**What's left, in the order that would help most:**

- [ ] **A walk cycle for the Brute Bat** — it still slides along stiffly next to
  the flapping Scout, which looks odd.
- [ ] **Attack frames** for both — right now a swing looks exactly like standing
  still, which makes fights hard to read.
- [ ] **Death frames** for both — dying is just a fade at the moment.

Export each as its own grid, drop it in `assets/sprites/source/<unit>/`, and
re-run the packer (command in the README there).
→ `DESIGN.md` §9, `DECISIONS.md` #3

### 🔲 B15. PICK ONE: Music and sound effects *(needed by M3)*

- [ ] **A) Both** — background music plus sounds for hits, deploys, and bases
  breaking.
- [ ] **B) Sound effects only.** Music gets repetitive fast in a short game.
- [ ] **C) Neither for now.** Silence, and we revisit later.

**Which sounds matter most to you?** (deploying a bat / a hit landing / a bat
dying / the base breaking / winning) _(open)_
→ `DESIGN.md` §9

### 🔲 B16. PICK ONE: What happens when a bat dies? *(needed by M3)*

Right now it fades out and tips over. Options:

- [ ] **A) Keep the fade.** Calm, and stays readable when 20 bats are fighting.
- [ ] **B) A little puff of smoke.**
- [ ] **C) A tiny ghost floats up.** 👻
- [ ] **D) A dramatic squeak and a spin.**

**Lewis picks:** _(open)_
→ `DESIGN.md` §9

### 🔲 B18. INVENT: What does the enemy base look like when it breaks? *(anytime)*

It currently just fades to 30% and sits there. This is the **winning moment** of
every level — it should feel good. What happens?

**Lewis's answer:** _(open)_
→ `DESIGN.md` §9

---

## 💾 M4 — Progression

### ✅ B12. PICK ONE: How do you get new bats? *(ANSWERED by B13, 2026-09-19)*

- [x] **A) Win levels to unlock them.** ✅ The B13 option Lewis picked says
  "you unlock bats by winning", so this came with it.
- [ ] **B) Buy them** with coins earned from battles.
- [ ] **C) You have them all from the start.**

→ `DESIGN.md` §8

### ✅ B13. PICK ONE: Does progress save? *(ANSWERED 2026-09-19)*
**B, plus more:** it remembers, you earn **suns** for beating a cave, and suns
are spent in **the casino** on upgrades and other things. Answers B12 and B19 as
a side effect. Blocked on **B22** before anything can be built.
→ `DESIGN.md` §8

### ✅ B19. PICK ONE: Can you upgrade a bat? *(ANSWERED by B4 + B13, 2026-09-19)*

- [x] **A) Yes** — spend **suns** in the casino. ✅ And an upgrade **shows as a
  colour**: a bat climbs the rainbow backwards, Violet → … → Red.
- [ ] **B) No** — new bats are the only progression.

→ `DESIGN.md` §8, §9

### 🔲 B22. PICK ONE: Is the casino a shop, or a gamble? *(needed by M4 — NEW, on the plate)*

Lewis invented the casino in B13: suns get spent there to upgrade bats. But
"casino" can mean two very different things, and they are different games.

- [ ] **A) A shop with price tags.** A violet Scout Bat costs 50 suns. You
  always know what you're getting, and you can save towards exactly the thing
  you want.
- [ ] **B) A real gamble.** Pay 10 suns for a spin and you *might* get an
  upgrade. Exciting — but it means sometimes paying and getting **nothing**,
  which can feel mean in a game you're playing for fun.
- [ ] **C) Both** — a shop for upgrades, and a separate machine you can gamble
  spare suns on for fun.

**Lewis picks:** _(open)_ → `DESIGN.md` §8

### 🔲 B23. PICK ONE: How many upgrade colours, really? *(needed by M4 — NEW)*

B4 says a bat climbs the rainbow backwards as you upgrade it: Violet, Indigo,
Blue, Green, Yellow, Orange, Red. Lewis said "we may simplify down a bit", so:

- [ ] **A) All seven.** A long ladder, lots to aim for — but seven prices per
  bat to work out, times however many bats.
- [ ] **B) Four.** Violet, Blue, Yellow, Red. Same idea, a quarter of the work.
- [ ] **C) Three.** Plain → Blue → Red. Very easy to read at a glance.

Also worth deciding: does each bat level up **separately**, or do all your bats
go up together?

**Lewis picks:** _(open)_ → `DESIGN.md` §9

---

## 🐉 M5 — Depth

### ✅ B6. PICK ONE: Do bats get special powers? *(ANSWERED by B5, 2026-09-19)*

- [x] **A) Yes.** ✅ Answered by picking a **summoner** in B5 — a bat that raises
  the dead cannot be built out of numbers alone. The Necrobatcer's summon is the
  game's first special power, and it set the pattern for the next one: numbers in
  `data/units.js`, rules in `src/systems/`, wired into **both**
  `src/entities/unit.js` and `tools/balance-sim.js`.
- [ ] **B) No** — keep it pure.

→ `DESIGN.md` §3

### 🔲 B24. PICK ONE: Can the Necrobatcer raise the bugs too? *(anytime — NEW)*

Right now it only raises **your** bats. Dead mosquitos stay dead.

- [ ] **A) Only your own bats.** *(How it works today.)* Simple, and it keeps
  the Necrobatcer feeling like it's on your side.
- [ ] **B) Bugs as well** — raise a dead scorpion and it fights **for you**.
  Creepier, and much more powerful, so it would need a price rise.
- [ ] **C) Bugs only** — a completely different bat that eats the graveyard.

**Lewis picks:** _(open)_ → `DESIGN.md` §3

### 🔲 B8. PICK ONE: Is there a boss? *(needed by M5 — see also B3)*

- [ ] **A) One big boss at the end of the game.**
- [ ] **B) A boss at the end of every few levels.**
- [ ] **C) No bosses** — the enemy base is the challenge.

**If yes — what is it, and what's it called?** _(open)_ → `DESIGN.md` §4

### 🔲 B14. PICK ONE: A second lane? *(needed by M5)*

One lane means one fight. Two lanes would mean splitting your bats and
defending two places at once — a real strategy change, and a big build.

- [ ] **A) Yes, two lanes** — an upper one bats fly along.
- [ ] **B) No** — one lane, done well.

**Lewis picks:** _(open)_ → `DESIGN.md` §6

### 🔲 B20. PICK ONE: A fast-forward button? *(anytime)*

*The Battle Cats* has a 2× speed button, because waiting for slow bats to walk
gets dull once you know you've won.

- [ ] **A) Yes, a 2× button.**
- [ ] **B) No** — keep the screen simple.

**Lewis picks:** _(open)_ → `DESIGN.md` §5

---

## ✅ Answered

**Round 1, 2026-09-19 — all eight, plus a change of mind.**

| # | Answer |
|---|---|
| B1 | The bats are hunting their food |
| B2 | The world is **Palopa**; first place **The Cave**, wet |
| B3 | **Mosquito, Scorpion, Spider** — the things bats eat |
| B4 | ⚠️ **Re-answered:** hand-drawn black-and-white circles, colour ladder for upgrades |
| B5 | **E — the Necrobatcer.** Built |
| B6 | Yes, powers *(by implication of B5)* |
| B7 | **A** — keep it strict |
| B10 | **C** — ten or more caves |
| B12 | **A** — unlock by winning *(by implication of B13)* |
| B13 | **B** — saves, plus suns and the casino |
| B19 | **A** — yes, and an upgrade shows as a colour *(by implication)* |

**Earlier, 2026-09-18:** B4 (the first answer, now superseded), B21 (Scout walk
cycle). Full reasoning for every one is in `DECISIONS.md`.
