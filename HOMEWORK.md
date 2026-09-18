# Homework for Lewis — Round 1 🦇

> **You're the creative director.** That means the *look*, the *feel*, and the
> *what-even-is-this* calls are yours. Dad builds whatever you decide.
>
> **How to answer:** just tell Dad. "B1 = the bats are guarding their cave,
> B5 = a sniper bat called Zap." You don't have to do them all at once, and you
> don't have to pick from the options — **"something else"** is always allowed
> and usually better.

---

## 🎮 First, go play it

**https://jhester599.github.io/combats/**

Play Level 1 two ways before you answer anything:

1. **Tap Scout Bat every single time the button lights up.** You should win in
   about a minute.
2. **Now play again and be stingy** — wait, save your energy, only send a few.
   You should lose.

That difference *is* the game right now. Everything below is about making it
more than that.

**While you play, notice:** you can barely ever afford the Brute Bat if you keep
tapping Scout. Is that annoying, or is that a good decision to have to make?
That's question **B7**.

---

## 🟡 Round 1 — eight questions

**This round:** B1, B2, B3, ~~B4~~ ✅, B5, B7, B10, B13.
*(The numbers aren't 1-8 because they come from the full question bank in
`HOMEWORK_BACKLOG.md` — these are just the eight that matter first.)*

Four are **PICK ONE** (choose a letter). Four are **INVENT** (make something
up — these are the fun ones).

---

### 🔲 B1. INVENT: Why are the bats fighting? 🦇 *(anytime — but it colours everything)*

Right now there's no reason. Bats just walk right and hit things. A reason makes
the enemy, the levels, and the ending all easier to invent.

Some starting points, but **make up your own if you'd rather**:

- The bats are **defending their cave** from something that moved in.
- The bats are **taking something back** that was stolen.
- The bats are **exploring** and the caves keep fighting back.
- It's a **sport** — two teams, and this is just the match.

**Lewis's answer:** _(open)_

---

### 🔲 B2. INVENT: Where does this happen, and what's it called? 🗺️ *(needed by M3 — the background art)*

Level 1 is called "First Cave," which Dad made up as a placeholder. What's the
whole **world** called, and what does this first place look like?

Think about what you'd *see* behind the bats: dripping cave walls? A night sky
with a moon? Glowing mushrooms? A creepy castle?

**The world is called:** _(open)_
**The first place is called:** _(open)_
**It looks like:** _(open)_

---

### 🔲 B3. INVENT: Who is the enemy? 👹 *(needed by M2 — we're adding more of them)*

The two enemies are called **Cave Critter** and **Cave Bruiser**. Both names are
placeholders and both are currently orange and red blobs.

- What **are** they?
- What are they called?
- Is there one **boss** in charge of them? *(If you want a boss, say so — that
  becomes question B8 and we'll build it.)*

**Lewis's answer:** _(open)_

---

### ✅ B4. INVENT: What do our bats actually look like? 🎨 *(player bats DONE 2026-09-18)*

> 🎉 **You did this one — in PixelLab!** The **Scout Bat** in blue flight
> goggles and the **Brute Bat** in its cape are **in the game now**. Go look:
> https://jhester599.github.io/combats/
>
> You drew them both at 64×64 and we made the Scout smaller *in the game*
> (`scale: 0.75`) and the Brute bigger (`scale: 1.05`) — so you never have to
> worry about size when you draw, just change one number afterwards.
>
> **Still to do for this question:** the two enemies are still boring orange and
> red blobs. They need your treatment next — that's tied to **B3** (who the
> enemy actually *is*).
>
> **And a new question came out of it — B21:** your bats have *one pose*, so
> they slide along without flapping. Do you want to make walk / attack / death
> frames in PixelLab, or leave them as one pose for now? *(In
> `HOMEWORK_BACKLOG.md`.)*

<details>
<summary>The original question</summary>


Right now the game **draws its own bats** — round body, flappy wings, two white
eyes. They're fine, but they're not *designed*.

Tell Dad the vibe:

- **Cute** (big eyes, round, friendly) or **cool** (spiky, fierce, armoured)?
- What **colour** is each bat? *(You can change these yourself right now —
  `color` in `data/units.js`. Try it!)*
- Does the Scout Bat look **small and fast**? Does the Brute look **heavy**?

**Lewis's answer:** ✅ Goggled Scout Bat + caped Brute Bat, made in PixelLab.
</details>

---

### 🔲 B5. PICK ONE: What is the third bat? 🦇 *(needed by M2 — this is the big one)*

Two bats isn't enough for real choices. The third one should do something the
others **can't**. Pick the job, and Dad will find the numbers:

- [ ] **A) The Sniper.** Attacks from *way* far away (range 250 instead of 40),
  but very little HP. It stands safely behind your other bats and plicks away.
  **Why it matters:** right now every bat has to walk into the fight. A sniper
  is the first bat that *doesn't* — and Dad thinks this would change the game the
  most. *(This is also question B9.)*
- [ ] **B) The Wall.** Enormous HP, almost no damage, very cheap. It doesn't kill
  anything — it just stands there and *absorbs* hits while your Scouts work.
- [ ] **C) The Swarm.** One tap sends **three** tiny bats at once. Each is weak
  and dies fast, but they arrive together.
- [ ] **D) The Speedster.** Extremely fast, runs right past the fight to smack the
  enemy base, but folds instantly if anything catches it.
- [ ] **E) Something else** — invent it! Tell Dad what it *does* and he'll work
  out the numbers.

**Lewis picks:** _(open)_

---

### 🔲 B7. PICK ONE: Should saving up for the big bat be this strict? 💰 *(needed by M2)*

You noticed it while playing: tap Scout constantly and you can *never* afford a
Brute. You have to choose.

- [ ] **A) Keep it strict.** Choosing is the whole game. If you want the big
  bat, stop tapping the small one.
- [ ] **B) Loosen it a bit.** More energy per second, so you can mostly spam
  Scouts *and* occasionally afford a Brute.
- [ ] **C) Make the big bat cheaper** so it shows up more often.

**Lewis picks:** _(open)_

---

### 🔲 B10. PICK ONE: How many levels should the game have? 🗺️ *(needed by M2)*

Honest trade-off — Dad has to balance every one of these, and Level 1 took a
lot of testing:

- [ ] **A) 3 levels.** Short and definitely finished. Each one can be great.
- [ ] **B) 5 levels.** A proper little game with a real difficulty curve.
  *(Dad's suggestion.)*
- [ ] **C) 10 levels.** A big adventure — but some will be weaker, and it'll take
  much longer before it's done.

**Lewis picks:** _(open)_

---

### 🔲 B13. PICK ONE: Does the game remember what you've done? 💾 *(needed by M4)*

- [ ] **A) Yes — it remembers which levels you've beaten**, so you come back and
  carry on.
- [ ] **B) Yes, and you unlock bats by winning.** Beat level 2, get a new bat.
  *(More work, but it gives you a reason to keep going. This is also question
  B12.)*
- [ ] **C) No — every visit starts fresh.** Simplest, and fine for a short game.

**Lewis picks:** _(open)_

---

## 🛠️ Things you can change RIGHT NOW without asking anyone

Open `data/units.js`, change a number, save, refresh the browser. That's it.

| Try this | What happens |
|---|---|
| Scout Bat `cost: 25` → `5` | You can spam a *hundred* Scout Bats 😄 |
| Scout Bat `color: '#6fd3ff'` → `'#ff00ff'` | Hot pink bats |
| Brute Bat `hp: 220` → `2000` | One Brute tanks the entire level |
| Any bat `speed: 90` → `300` | They sprint across the screen |
| In `data/levels.js`: `energyPerSecond: 13` → `40` | You're rich, the game gets silly |

**Want to check if a level is still beatable after your changes?** Run this and
it plays the whole thing instantly:

```
node tools/balance-sim.js level1
```

**If you break something,** nothing is lost — Dad can undo any change.

---

## ✅ Answered so far

Nothing yet — this is Round 1! Answers get recorded in `DECISIONS.md`.
