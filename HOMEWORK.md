# Homework for Lewis — Round 1 🦇

> **You're the creative director.** That means the *look*, the *feel*, and the
> *what-even-is-this* calls are yours. Dad builds whatever you decide.
>
> **How to answer:** just tell Dad. "B1 = the bats are guarding their cave,
> B5 = a sniper bat called Zap." You don't have to do them all at once, and you
> don't have to pick from the options — **"something else"** is always allowed
> and usually better.

---

## 🐛 If you played it and LOST — that was our bug, not you

**Lewis, you did it exactly right.** You only sent a Scout Bat when the button
was ready, which is precisely what this page told you to do, and you still lost.
That was **the game's fault**, and it is fixed now.

Here is what was actually wrong, because it's a good one:

- You could **afford** a Scout Bat every **1.9 seconds**.
- But the button made you **wait 2.0 seconds** between bats.
- The wait was longer than the money — by **0.08 of a second**.

That tiny gap meant the button sat there lit up, *waiting for your thumb*. And
every little bit of time before you tapped was a bat you never got back. Being a
third of a second late — which is just being a person — cost you **13% of your
whole army**, and 13% was exactly the difference between winning and losing.

Worse: Dad's testing robot tapped on the *exact* 1/60th of a second the button
lit up, so **it** won every time and reported the level was fine. It was
measuring a robot, not a boy. The robot now has a reaction time.

**The fix:** the Scout Bat's cooldown went from 2.0s to **1.4s**, so now your
*energy* is what slows you down, not the clock — and a slow tap just banks the
energy instead of throwing a bat away. You get half a second of "late" free on
every single tap.

**Now go and win it.** Same link, and it should take you about a minute.

---

## 🎮 First, go play it

**https://jhester599.github.io/combats/**

Play Level 1 two ways before you answer anything:

1. **Tap Scout Bat every single time the button lights up.** You should win in
   **56–60 seconds**. (If you don't, tell Dad — that's a bug, not you.)
2. **Now play again and be stingy** — wait, save your energy, only send a few.
   You should lose.

That difference *is* the game right now. Everything below is about making it
more than that.

**While you play, notice:** you can barely ever afford the Brute Bat if you keep
tapping Scout. Is that annoying, or is that a good decision to have to make?
That's question **B7**.

---

## 🏆 Round 1 — ALL DONE (2026-09-19)

**You answered every single one: B1, B2, B3, B4, B5, B7, B10, B13.** Plus you
changed your mind about B4, which is allowed and which is exactly what a
creative director is for.

Everything is written into `DECISIONS.md` and `DESIGN.md`, and **two of your
answers are already in the game**:

| Your answer | What happened |
|---|---|
| **B2** — the world is Palopa, the first place is The Cave | Level 1 is now called **The Cave** |
| **B3** — the enemies are mosquitos, scorpions, spiders | The orange blob is a **Mosquito**, the red blob is a **Scorpion**, and a **Spider** now exists too |
| **B5** — the Necrobatcer | **Built. You can play it right now** — see B5 below 💀 |
| **B7** — keep it strict | Nothing loosened. But read B7 below about "too difficult" |
| **B1, B10, B13** | Written down and shaping what gets built next |
| **B4** — the new bat look | **Needs you in PixelLab again** — see B4 below 🎨 |

Your answers are kept below, with what each one did.

---

### ✅ B1. INVENT: Why are the bats fighting? 🦇 *(ANSWERED 2026-09-19)*

> 🧇 **Your answer: the bats are fighting their FOOD.** "The enemies of the
> bats are things that they eat. Mosquitos, scorpions, spiders."
>
> This is a really good one, and here's why: it means the game never has to
> explain itself. Nobody has to be evil. The cave keeps sending more bugs
> because **that is what a cave full of bugs does.** And anything creepy you
> feel like drawing can be in the next cave, because bats eat all of it.

Right now there's no reason. Bats just walk right and hit things. A reason makes
the enemy, the levels, and the ending all easier to invent.

Some starting points, but **make up your own if you'd rather**:

- The bats are **defending their cave** from something that moved in.
- The bats are **taking something back** that was stolen.
- The bats are **exploring** and the caves keep fighting back.
- It's a **sport** — two teams, and this is just the match.

**Lewis's answer:** ✅ **None of the above** — the bats are hunting their food.
*(Told you "something else" is usually better.)*

---

### ✅ B2. INVENT: Where does this happen, and what's it called? 🗺️ *(ANSWERED 2026-09-19)*

> 🌍 **The world is called PALOPA.** The first place is **The Cave**, and it
> looks like **a wet cave**.
>
> **Already in the game:** the placeholder name "First Cave" is gone — look at
> the top of the screen when you play and it says **The Cave**.
>
> The *wet* part is art (dripping walls, puddles, shine) so it comes with the
> background job in M3.

Level 1 is called "First Cave," which Dad made up as a placeholder. What's the
whole **world** called, and what does this first place look like?

Think about what you'd *see* behind the bats: dripping cave walls? A night sky
with a moon? Glowing mushrooms? A creepy castle?

**The world is called:** ✅ **Palopa**
**The first place is called:** ✅ **The Cave**
**It looks like:** ✅ **a wet cave**

---

### ✅ B3. INVENT: Who is the enemy? 👹 *(ANSWERED 2026-09-19)*

> 🦗 **Mosquitos, scorpions and spiders** — the things bats eat.
>
> **Already in the game.** Dad matched your three creatures to how the enemies
> already *behaved*, rather than making up new ones:
>
> | Was called | Is now | Because |
> |---|---|---|
> | Cave Critter | **Mosquito** | small, fast, dies instantly — it was already a mosquito |
> | Cave Bruiser | **Scorpion** | armoured, slow, hits like a hammer |
> | *(new!)* | **Spider** | right in between the other two |
>
> Their numbers didn't change at all, so Level 1 plays exactly the same — the
> bugs just have proper names now.
>
> **The Spider is not in Level 1 on purpose.** Level 1 is carefully measured
> and a brand new enemy would wreck that. It's ready for the next cave.
>
> **Still to do:** they're all still blobs. What does a Palopa mosquito actually
> *look* like? That's the rest of B4.

<details>
<summary>The original question</summary>

The two enemies are called **Cave Critter** and **Cave Bruiser**. Both names are
placeholders and both are currently orange and red blobs.

- What **are** they?
- What are they called?
- Is there one **boss** in charge of them? *(If you want a boss, say so — that
  becomes question B8 and we'll build it.)*

**Lewis's answer:** ✅ Mosquitos, scorpions and spiders — the things bats eat.
*(The boss part is still open: that's B8.)*
</details>

---

### ✅ B4. INVENT: What do our bats actually look like? 🎨 *(CHANGED 2026-09-19)*

> 🎨 **You changed your mind, and that's allowed.** The goggles and the cape
> are out. The new answer:
>
> > "The bats are not realistic, they look **hand-drawn**. **Large circles**,
> > with **wings, ears, and a mouth. No legs. Black and white** for level 1
> > bats, then as you buy upgrades to level up your bats, they change colour,
> > **backwards rainbow** (VIBGYOR)."
>
> **🖍️ YOUR NEXT JOB — redraw them in PixelLab:**
>
> - hand-drawn looking, **not** realistic
> - a **big circle** for the body
> - **wings, ears, a mouth**
> - **no legs**
> - **black and white** — no colour at all
> - 64×64, facing **east** (to the right), same as before
>
> The goggled Scout and caped Brute stay in the game meanwhile, so nothing is
> broken — they're just placeholders again until you draw the new ones.
>
> **✨ The clever bit about black and white.** Because your drawing has no
> colour, the *game* can paint it any colour it likes. So you draw each bat
> **once** and the game makes all eight versions:
>
> | Tier 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
> |---|---|---|---|---|---|---|---|
> | Plain | Violet | Indigo | Blue | Green | Yellow | Orange | **Red** |
>
> **You don't have to draw eight Scout Bats.** Black-and-white wasn't just a
> look, it was a genuinely smart call. The ladder is saved in `data/config.js`
> and switches on when the casino exists (B13).
>
> **Two new questions came out of this one** — **B23** (do you really want all
> seven colours, or fewer?) and the old **B21** about walk/attack/death frames,
> which starts over now that the bats are being redrawn.

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

### ✅ B5. PICK ONE: What is the third bat? 🦇 *(ANSWERED & BUILT 2026-09-19)*

> 💀 **You picked E — invent one — and invented the NECROBATCER.** "A summoner,
> similar to a necromancer, that can summon dead bats back to life to continue
> fighting."
>
> **IT IS BUILT. It works. Go and use it.**
>
> | | |
> |---|---|
> | Costs | 60 energy |
> | Health | 70 (a bit tougher than a Scout) |
> | Fighting | **rubbish on purpose** — a quarter of a Scout's damage |
> | Its power | every **5 seconds**, it raises one of your dead bats |
> | Where | **exactly where that bat died**, not back at your base |
> | How healthy | 60% health |
>
> **The best part is the "where".** A raised bat doesn't have to walk all the
> way across the screen again — it stands straight back up in the middle of the
> fight. That's what makes the Necrobatcer worth 60 energy when it can barely
> punch.
>
> **🕹️ TO PLAY WITH IT RIGHT NOW:** open `src/main.js` and change
>
> ```js
> window.STARTING_LEVEL = 'level1';     // change this
> window.STARTING_LEVEL = 'graveyard';  // to this
> ```
>
> then refresh. **The Graveyard** is a practice level Dad made just for your new
> bat — lots of energy, lots of bugs, so you can watch bats climb back out of
> their graves. Change it back to `'level1'` when you're done.
>
> **Two rules Dad had to add, or the game breaks:**
> 1. a bat can only be raised **once** — otherwise one grave makes an endless
>    army and you can never lose
> 2. a Necrobatcer can't raise **another Necrobatcer** — same runaway
>
> **Why it's not in Level 1 yet:** Dad tested it there and a player who saved up
> and played *slowly* started **winning** — which is the exact opposite of what
> Level 1 is meant to teach, and the opposite of your own B7 answer. Your bat
> rewards patience; Level 1 punishes it. So it goes in the next cave instead.
>
> **New question — B24:** should the Necrobatcer be able to raise the *bugs*
> too? Right now it only raises your own bats.

<details>
<summary>The original question</summary>

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

**Lewis picks:** ✅ **E — the Necrobatcer.**
</details>

---

### ✅ B7. PICK ONE: Should saving up for the big bat be this strict? 💰 *(ANSWERED 2026-09-19)*

> 💰 **You picked A — keep it strict.** "Choosing is the whole game."
>
> So **nothing was loosened**: still 13 energy a second, the Brute still costs
> 90, and spamming Scouts still eats everything.
>
> **About "but level 1 is too difficult currently" — read this bit.**
>
> You were right, and it wasn't your fault: that was the **cooldown bug** at the
> top of this page. But here's the thing — **the fix wasn't on the website yet
> when you played.** It was finished, but it was sitting on a side branch
> waiting to be put live. So you were still playing the broken version.
>
> On the fixed one, tapping Scout every time it lights up wins The Cave in
> **56–60 seconds**.
>
> So Dad **deliberately did not make it easier a second time.** Making it easier
> *and* fixing the bug would have overshot — and it would have undone the "keep
> it strict" half of your own answer. **Play the fixed version first.** If it
> still feels too hard then, say so and Dad will measure it properly.
>
> - [x] **A) Keep it strict.** ✅

---

### ✅ B10. PICK ONE: How many levels should the game have? 🗺️ *(ANSWERED 2026-09-19)*

> 🗺️ **You picked C — ten or more caves.** "Should have a ton."
>
> You were told straight out that this is the most work and that some caves
> won't be as good as others, and you picked it anyway. So that's the plan.
>
> Two things it changes:
>
> - **There has to be a way to pick a cave.** Right now the game just starts
>   Level 1. Ten caves needs a map or a list — which fits neatly with B13,
>   because that's also where remembering which ones you've beaten lives.
> - **Dad needs about ten cave names from you** — that's question **B17**, and
>   it just became important.
>
> Below is the original question, for the record.

Honest trade-off — Dad has to balance every one of these, and Level 1 took a
lot of testing:

- [ ] **A) 3 levels.** Short and definitely finished. Each one can be great.
- [ ] **B) 5 levels.** A proper little game with a real difficulty curve.
  *(Dad's suggestion.)*
- [ ] **C) 10 levels.** A big adventure — but some will be weaker, and it'll take
  much longer before it's done.

**Lewis picks:** ✅ **C — ten or more.**

---

### ✅ B13. PICK ONE: Does the game remember what you've done? 💾 *(ANSWERED 2026-09-19)*

> 💾 **You picked B, and then added a whole lot more:** the game remembers,
> you earn **suns** for beating a cave, and suns get saved and spent in **the
> casino** to upgrade your bats or buy other things you need later.
>
> That's three things, and together they're the biggest job on the list:
>
> 1. **Remembering** — which caves you've beaten, how many suns you have, and
>    what colour each of your bats has got to
> 2. **Suns** — a second kind of money. Energy is spent *inside* a fight; suns
>    are spent *between* fights
> 3. **The casino** — where the suns go
>
> And it links straight to your B4 answer: **an upgrade is what turns a bat from
> black-and-white to violet, then indigo, then blue…** So the colours aren't
> decoration — they're the scoreboard. That's a really tidy idea. 🌞
>
> **New question — B22, and Dad needs it before building any of this:** is the
> casino a **shop** (a violet Scout costs 50 suns, always) or a **gamble** (pay
> 10 suns, *maybe* get an upgrade)? A real casino is a gamble — but that means
> sometimes paying and getting nothing. Which did you mean?
>
> Below is the original question, for the record.

- [ ] **A) Yes — it remembers which levels you've beaten**, so you come back and
  carry on.
- [ ] **B) Yes, and you unlock bats by winning.** Beat level 2, get a new bat.
  *(More work, but it gives you a reason to keep going. This is also question
  B12.)*
- [ ] **C) No — every visit starts fresh.** Simplest, and fine for a short game.

**Lewis picks:** ✅ **B — plus suns and the casino.**

---

## 🛠️ Things you can change RIGHT NOW without asking anyone

Open `data/units.js`, change a number, save, refresh the browser. That's it.

| Try this | What happens |
|---|---|
| Scout Bat `cost: 25` → `5` | You can spam a *hundred* Scout Bats 😄 |
| Scout Bat `color: '#6fd3ff'` → `'#ff00ff'` | Hot pink bats |
| Necrobatcer `summon.interval: 5.0` → `1.0` | The dead never stay dead 💀 |
| Necrobatcer `summon.hpFactor: 0.6` → `1.0` | Raised bats come back at **full** health |
| In `data/config.js`: `maxGraves: 40` → `3` | Only the freshly fallen can be raised |
| Brute Bat `hp: 220` → `2000` | One Brute tanks the entire level |
| Any bat `speed: 90` → `300` | They sprint across the screen |
| In `data/levels.js`: `energyPerSecond: 13` → `40` | You're rich, the game gets silly |

**Want to check if a level is still beatable after your changes?** Run this and
it plays the whole thing instantly:

```
node tools/balance-sim.js level1
node tools/balance-sim.js graveyard
```

It plays the level as **several different people** — a robot with a perfect
thumb, someone sharp, someone relaxed — and as a hoarder who saves everything
up. Read the **VERDICT** at the bottom. Ignore the `0s (robot)` row: that row is
the one that fooled us.

**If you break something,** nothing is lost — Dad can undo any change.

---

## ✅ Answered so far

**Round 1: all eight, done.** 🎉 They're logged as decisions 4–14 in
`DECISIONS.md`, and the Level 1 bug you found by playing it is D8, D9 and D10.
Finding that counts too. 🦇

## 🎯 What Dad needs next (Round 2)

Nothing urgent — but these are what's actually blocking now:

| # | Question | Why it's blocking |
|---|---|---|
| **B17** | **Name about ten caves.** The Cave is #1. | B10 means there are ~10, and they all need names |
| **B11** | What makes cave #2 **different** from The Cave? | Otherwise it's the same fight twice |
| **B22** | Is the casino a **shop** or a **gamble**? | Nothing in M4 can be built until this is settled |
| **B4** | **Redraw the bats** in PixelLab — circles, wings, ears, mouth, no legs, black and white | The game is showing the old goggled ones |
| **B3/B4** | What do the **mosquito, spider and scorpion** look like? | They're still coloured blobs |
| **B23** | All seven upgrade colours, or fewer? | Seven per bat is a lot of prices to balance |
| **B24** | Can the Necrobatcer raise **bugs** too? | It only raises your own bats right now |

And one Dad would like an answer to eventually, **B9**: a battle almost always
ends with your base at 100% or 0%, never in between, because whoever wins the
middle takes everything. A bat that can shoot **over** the fight — like the
Sniper you didn't pick — is still the best idea anyone has for fixing that.
Maybe that's the fourth bat?
