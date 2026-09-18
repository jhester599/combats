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

> **On the plate right now (Round 1):** B1, B2, B3, B5, B7, B10, B13.
> *(B4 ✅ answered 2026-09-18 — the player bats exist.)*
> They're written out in full in `HOMEWORK.md` — go there to answer them.

---

## 🎨 Identity — what this game *is*

### 🔲 B1. INVENT: Why are the bats fighting? *(anytime — on the plate)*
Full text in `HOMEWORK.md`. → `DESIGN.md` §1, §10

### 🔲 B2. INVENT: The world's name, and what the first place looks like *(needed by M3 — on the plate)*
Full text in `HOMEWORK.md`. → `DESIGN.md` §1

### 🔲 B3. INVENT: Who is the enemy? *(needed by M2 — on the plate)*
Full text in `HOMEWORK.md`. → `DESIGN.md` §4

---

## 🦇 M2 — More bats, more levels

### 🔲 B5. PICK ONE: What is the third bat? *(needed by M2 — on the plate)*
Sniper / Wall / Swarm / Speedster / invent one. Full text in `HOMEWORK.md`.
→ `DESIGN.md` §3

### 🔲 B7. PICK ONE: How strict should saving up be? *(needed by M2 — on the plate)*
Full text in `HOMEWORK.md`. → `DESIGN.md` §3

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

### 🔲 B10. PICK ONE: How many levels? *(needed by M2 — on the plate)*
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

### 🔲 B21. PICK ONE: Animate the bats, or leave them as one pose? *(next art job)*

Your bats are **one picture each**, so they slide along the lane without
flapping, and an attack looks the same as walking.

- [ ] **A) Make animation frames in PixelLab** — a few frames each for walk,
  attack and death. Best looking, most work. Drop them in a folder and
  `tools/pack-spritesheet.js` turns them into what the game needs.
- [ ] **B) Just a walk flap** — even 2 frames would make them feel alive.
  Much less work than all four actions.
- [ ] **C) Leave them still for now**, and Dad adds a little bob-and-lunge in
  code so they move a bit without any new art.

**Lewis picks:** _(open)_ → `DESIGN.md` §9

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

### 🔲 B12. PICK ONE: How do you get new bats? *(needed by M4)*

- [ ] **A) Win levels to unlock them.** Beat a level, get the next bat.
- [ ] **B) Buy them** with coins earned from battles.
- [ ] **C) You have them all from the start.** Simplest; no sense of reward.

**Lewis picks:** _(open)_ → `DESIGN.md` §8

### 🔲 B13. PICK ONE: Does progress save? *(needed by M4 — on the plate)*
Full text in `HOMEWORK.md`. → `DESIGN.md` §8

### 🔲 B19. PICK ONE: Can you upgrade a bat? *(needed by M4)*

- [ ] **A) Yes** — spend coins to make a bat tougher or hit harder.
- [ ] **B) No** — new bats are the only progression. Much simpler to balance.

**Lewis picks:** _(open)_ → `DESIGN.md` §8

---

## 🐉 M5 — Depth

### 🔲 B6. PICK ONE: Do bats get special powers? *(needed by M5)*

Today a bat is only its numbers. Powers would make them feel different:

- [ ] **A) Yes** — e.g. a bat that **explodes** when it dies, or **heals** the
  bat in front, or **freezes** what it hits.
- [ ] **B) No** — keep it pure. Numbers only, easy to understand and balance.

**If yes, which power sounds most fun?** _(open)_ → `DESIGN.md` §3

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

Nothing yet — Round 1 is the first. Answers land in `DECISIONS.md`.
