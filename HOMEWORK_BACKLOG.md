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

> **Rounds 1, 2 and 3 are DONE.** Lewis has answered **21 of the 30** questions,
> and everything answerable has been built: ten caves, four bats, a boss, grave
> markers, three more bugs, and potions and fruit. Logged as decisions 4–25 in
> `DECISIONS.md`.
>
> **🟡 On the plate now (Round 4) — three, and one is drawing:**
>
> | | # | Question | Why it's here |
> |---|---|---|---|
> | 🦂 | **B28** | Is "Desert Scorpion" the right name? | His B26 bug and the old Scorpion now have near-identical names for very different animals |
> | 🎰 | **B29** | How do you *get* potions and fruit? | **The last thing blocking the casino.** They work; only earning them is missing |
> | 🎨 | **B30** | Draw the three new bugs | All three are still coloured blobs |
> | 🎨 | **B4** | Draw the Archer Bat | 3 of 4 bats are drawn; the Archer is the last |
> | 🎨 | **B3/B4** | Draw the old bugs and the Bee | Still coloured blobs |
>
> **The bottleneck is still art, not design.** Nothing in M3 waits on Dad.
>
> Written out in full in `HOMEWORK.md` — go there to answer them.

---|---|---|---|
> | 🔥 | **B17** | Name the caves (~10) | Blocking — cave 2 can't be built unnamed |
> | 🔥 | **B11** | What makes cave 2 different? | Blocking — and the Spider is built and unused |
> | 🔥 | **B9** | A long-range bat? | Blocking-ish — fixes the 100%-or-0% ending, and Dad measured that it needs **no new code** |
> | 😄 | **B8** | Is there a boss? | Fun, and mostly just numbers |
> | 😄 | **B24** | Can the Necrobatcer raise bugs? | Quick, and it's about his own invention |
> | 😄 | **B16** | What happens when a bat dies? | M3 — and a grave marker would make B5 visible (see B25) |
> | 🎰 | **B22** | Casino: shop or gamble? | Not urgent, but **all of M4 is blocked on it** |
> | 🎰 | **B23** | How many colour tiers? | Pairs with B22 |
>
> Plus two **drawing jobs**, not questions: redraw the bats to the new B4 brief,
> and draw the Mosquito, Spider and Scorpion.
>
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
he played at the time — so **no second difficulty change was made**. The fix is
live as of 2026-09-19 12:22 UTC, so the next word on difficulty is his.
→ `DESIGN.md` §3

### ✅ B9. PICK ONE: Should a bat attack from far away? *(ANSWERED & BUILT 2026-09-19 — A, the Archer Bat)*

Right now **every** bat has to walk into the fight, and that creates a problem
Dad measured while building Level 1: your base almost always ends a battle at
**100% or 0%**, never in between. Whoever wins the front line takes everything,
so there is no way to turn around a fight you are losing.

A bat that can hit *past* the front line is still the only idea on the table
that changes that. It was option A in B5; Lewis invented the Necrobatcer
instead, which **reinforces** the front line rather than reaching over it — so
the problem is untouched and this question is now the fourth-bat question.

**Measured 2026-09-19: this needs NO new code.** Reach is one number in
`data/units.js`, and `Combat.isInReach` already honours any value. A probe bat
with `range: 250` was confirmed to reach a target at 320px that a Scout (range
40) cannot, to stop at exactly 250px, and to win Level 1 alone in 80.3s —
hitting the enemy base from range at 24.8s. **One caveat from the same probe:**
offered *alongside* Scouts it was never affordable, because Scout spam consumes
the entire income. A fourth bat has to be worth choosing *instead of* Scouts.

- [ ] **A) Yes — make it the fourth bat.** Tiny health so it pops if reached.
- [ ] **B) Yes, but later** — finish the caves first.
- [ ] **C) No** — everyone brawls up close, and the all-or-nothing ending stays.

**Lewis picks:** _(open)_ — **and if A, what is it called?**

### ✅ B10. PICK ONE: How many levels? *(ANSWERED 2026-09-19 — C, ten or more)*
Full text in `HOMEWORK.md`. → `DESIGN.md` §7

### ✅ B11. What makes each cave different? *(ANSWERED & BUILT 2026-09-19)*

A new cave shouldn't just be "the same but more" — that gets noticed instantly.
Pick the **one thing** that changes:

- [ ] **A) A new bug.** ⭐ The **Spider** is already built and has never appeared
  in a level: tougher than a Mosquito, faster than a Scorpion. Cheapest good
  answer on the list.
- [ ] **B) Less energy** — harder in a thinking way, not a faster way.
- [ ] **C) A tougher fortress** — a longer siege.
- [ ] **D) No warm-up** — bugs from second one, no gentle opening.
- [ ] **E) Something else** — Dad works out the numbers.

**Lewis's answer:** _(open)_
→ `DESIGN.md` §7

### ✅ B17. INVENT: Name the caves *(ANSWERED & BUILT 2026-09-19 — all ten)*

Cave 1 is **The Cave** (B2). B10 asked for **ten or more**, so about nine names
are missing — and a name is usually where a cave's *idea* comes from, so this
question tends to answer B11 for free.

They need not all be caves: Palopa can hold anywhere a bug lives — somewhere
wet (a drip, a well, a drain), high (a roof, a belfry), horrible (a bin, a
compost heap), or just ominous (The Deep, The Nest).

Naming only caves 2 and 3 is enough to unblock building.

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

### ✅ B16. PICK ONE: What happens when a bat dies? *(ANSWERED & BUILT 2026-09-19 — D, grave markers)*

Right now it just fades out. Options:

- [ ] **A) Keep the fade.** Calm, and stays readable when 20 bats are fighting.
- [ ] **B) A little puff of dust.**
- [ ] **C) A tiny ghost floats up.** 👻
- [ ] **D) It topples over** and lies there a moment.
- [ ] **E) Something else.**

**Worth raising with him:** a **grave marker** left on the ground would make the
Necrobatcer's invisible rule visible — the game already records exactly where
every bat fell (`world.graves` in `src/systems/necro.js`), so the data is there
and it is a drawing job plus a few lines, not a new mechanic. Filed as B25.

**Lewis picks:** _(open)_
→ `DESIGN.md` §9

### ✅ B25. Should graves be visible on the ground? *(ANSWERED BY B16 2026-09-19 — yes, built)*

The Necrobatcer can only raise a bat within 320px of itself, and only bats that
have actually fallen — but none of that is on screen, so it reads as luck.

- [ ] **A) Yes, show a grave marker** where each bat fell, and clear it when the
  bat is raised. Makes the summoner something you can *aim*.
- [ ] **B) Yes, and show the Necrobatcer's reach too** — a faint ring around it.
  Clearest, but more clutter.
- [ ] **C) No** — keep the battlefield clean; a surprise resurrection is nicer.

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

### ✅ B22. Is the casino a shop, or a gamble? *(ANSWERED 2026-09-19 — both, with goods in between)*

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

### ✅ B23. How many upgrade colours, really? *(ANSWERED 2026-09-19 — B, four)*

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

### ✅ B24. Can the Necrobatcer raise the bugs too? *(ANSWERED 2026-09-19 — A, bats only, longer reach)*

Right now it only raises **your** bats. Dead mosquitos stay dead.

- [ ] **A) Only your own bats.** *(How it works today.)* Simple, and it keeps
  the Necrobatcer feeling like it's on your side.
- [ ] **B) Bugs as well** — raise a dead scorpion and it fights **for you**.
  Creepier, and much more powerful, so it would need a price rise.
- [ ] **C) Bugs only** — a completely different bat that eats the graveyard.

**Lewis picks:** _(open)_ → `DESIGN.md` §3

### ✅ B8. PICK ONE: Is there a boss? *(ANSWERED & BUILT 2026-09-19 — A, the Cow Killer Bee)*

- [ ] **A) One big boss at the end of the game.**
- [ ] **B) A boss at the end of every few levels.**
- [ ] **C) No bosses** — the enemy base is the challenge.

**If yes — what is it, and what's it called?** _(open)_ → `DESIGN.md` §4

### ✅ B26. INVENT: Name the new bugs of the later caves *(ANSWERED 2026-09-20 — all three built)*

**Lewis's answer:** the **Desert Scorpion** (Sahara-hara + Forgotten Oasis) —
*"fast, every attack has a chance to kill you or kill itself"*; the **Evil
Butterfly** (Dream Land) — *"don't really move, they hover like a wall to
protect the tower"*; the **Lightning Bug** (Abyss of Darkness) — *"slow and
weak"*.

He was asked for a name and a size and gave a **power** as well, so the Desert
Scorpion is the second special ability in the game after the Necrobatcer's. All
three are in their caves. → `DESIGN.md` §4, decision 24.

Raised **B28** (the name clashes with the existing Scorpion) and **B30** (they
are all still placeholder blobs).

### ✅ B27. INVENT: What do blood, potions and fruits DO? *(ANSWERED 2026-09-20 — both built)*

**Lewis's answer:** *"potions and fruit are different, they are not just
currency. you can use potions during a battle to make the opponent weaker. fruit
can heal your tower, but only slightly. blood is just currency."*

He rejected the framing and was right to: two of the three goods became **battle
actions** rather than things you trade, which is the first thing in this game a
player can tap other than "send another bat". Both are built and playable on the
Graveyard level. → `DESIGN.md` §8, decision 25.

Raised **B29** — the goods work, but there is still no way to *earn* them, which
is the last thing blocking the casino.

### 🔲 B28. DECIDE: Is "Desert Scorpion" the right name? *(quick — ON THE PLATE)*

Lewis said *"desert has scorpions"*, but Palopa already had a **Scorpion** — the
slow armoured one that has been in every cave since the start. His is a
different animal: fast (78 against 38), weaker (120 health against 190), and it
gambles on every hit.

Two bugs are now in the game under names that sound like the same creature. The
placeholder is **Desert Scorpion**, which works but is plain, and this is a
naming question, which makes it his.

Options offered: leave it; a name about the sting (*Deathstalker*, *Last
Sting*); a name about the gamble (*Coin-flip Scorpion*); or something that is
not a scorpion at all.

**Lewis's answer:** _(open)_ → `DESIGN.md` §4

### 🔲 B29. DECIDE: How do you GET potions and fruit? *(needed by M4 — ON THE PLATE, BLOCKING)*

B27 is built: potions weaken the bugs for ten seconds, fruit heals the tower
slightly. What does not exist is any way to **earn** them, so they currently
live only on the Graveyard practice level, which hands out three of each.

Four things Dad will not guess, because they are the economy and the economy is
Lewis's:

1. **How many per cave won** — a fixed few, or bought at the casino with suns?
2. **Do they carry between battles**, or does each cave start fresh?
3. **Are they what you bet in the gamble?** B22's whole charm was that a bad
   gamble costs you *stuff* rather than progress.
4. **Is one of them rare** — fruit only from a boss, say?

**Lewis's answer:** _(open)_ → `DESIGN.md` §8

### 🔲 B30. DRAW: The three new bugs *(needed by M3 — ON THE PLATE)*

All three of B26's bugs are still shapes the game paints itself, told apart only
by colour: desert sand, dream magenta, firefly yellow-green.

They are bugs rather than bats, so the "big circle, wings, ears, no legs" brief
does not apply — they can look like whatever he thinks they look like. 64×64,
facing east, black and white so the colour ladder can tint them.

**Lewis's answer:** _(open)_ → `DESIGN.md` §9

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

**Round 2, 2026-09-19 — all eight, and everything buildable got built.**

| # | Answer | Built? |
|---|---|---|
| B17 | **All ten cave names**, The Cave → Final Stadium | ✅ all ten caves exist |
| B11 | Each cave tougher, **one lever each**; new bugs sometimes | ✅ built (bugs → B26) |
| B9 | **A** — the **Archer Bat**, reach 240 | ✅ built |
| B8 | **A** — one boss, the **Cow Killer Bee** | ✅ built, cave 10 |
| B24 | **A** — bats only, and reach **320 → 460** | ✅ done |
| B16 | **D** — **grave markers** *(also settles B25)* | ✅ built |
| B22 | Casino: suns → **blood/potions/fruits** → trade or gamble | 🔲 needs B27 |
| B23 | **B** — four colours | ✅ in the data |

**Round 3, 2026-09-20 — both, and both got built the same day.**

| # | Answer | Built? |
|---|---|---|
| B26 | **Desert Scorpion** (fast, gambling sting), **Evil Butterfly** (never moves), **Lightning Bug** (slow and weak) | ✅ all three, in their caves |
| B27 | Potion **weakens the bugs mid-battle**; fruit **heals the tower slightly**; blood is **just currency** | ✅ built, playable on the Graveyard |

**Earlier, 2026-09-18:** B4 (the first answer, now superseded), B21 (Scout walk
cycle). Full reasoning for every one is in `DECISIONS.md`.
