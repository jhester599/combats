# 🦇 ComBats

*Com**Bats**. Combat, with bats. Lewis named it, and the repository had
quietly been called `combats` the whole time anyway.*

A 2D lane auto-battler for the browser, in the style of *The Battle Cats*.
Send bats down a lane, they fight on their own, smash the enemy base.

Made by **Jeff** (code) and **Lewis** (creative director — units, stats, levels).

### ▶ [Play it in your browser](https://jhester599.github.io/combats/)

### 📱 On a phone or tablet

Open the link above and **turn the phone sideways**. For the best fit, install
it so it opens full screen like an app, with no browser bars:

- **iPhone / iPad (Safari):** Share → **Add to Home Screen**
- **Android (Chrome):** ⋮ menu → **Add to Home screen** (or **Install app**)

Not installed? Android phones and iPads also get a **Full screen** button on the
title screen. iPhones don't allow that from a web page, so installing is the
way there.

Every button reaches a little past its edges for fingers (`src/systems/touch.js`),
and the game keeps clear of the notch and the home bar.

---

## Run it on your own machine

The game needs to be served over `http://`, not opened as a `file://` path —
browsers block scripts from loading that way. Any tiny static server works:

```bash
# from the project folder
python3 -m http.server 8000
```

Then open **http://localhost:8000** in your browser.

That's it. There is **nothing to install and nothing to build** — no npm, no
webpack, no TypeScript. The game is plain JavaScript files and a copy of the
Phaser engine, loaded by `<script>` tags in `index.html`.

> Node is used for one optional testing tool (`tools/balance-sim.js`). The game
> itself never needs it.

---

## Which version am I playing?

The title screen shows a small version number in the bottom-right corner, e.g.
**v1.05**. The number after the dot is the last pull request merged into the
game, so v1.05 is everything up to PR #5. It lives in one line in
`data/config.js` (`version:`); bump it in each PR.

---

## Design docs

ComBats is designed the same way Fakeamon Spark is — Lewis makes the
creative calls, and there's a paper trail so nothing gets lost between sessions:

| File | What it's for |
|---|---|
| **[`DESIGN.md`](DESIGN.md)** | The living design document. What the game *is*, what's decided, what's still open. |
| **[`HOMEWORK.md`](HOMEWORK.md)** | 🦇 **Lewis's current questions — Round 4.** Start here. |
| **[`HOMEWORK_BACKLOG.md`](HOMEWORK_BACKLOG.md)** | Every question for the whole game, sorted by when we need it. |
| **[`DECISIONS.md`](DECISIONS.md)** | The decision loop, and the log of what's been settled and why. |

**Lewis answers → Dad tells Claude → the loop in `DECISIONS.md` folds it into
the design and builds it.**

---

## FOR LEWIS 🎨

**You do not need to touch any code.** Everything you can change lives in the
`data/` folder in three files. Change a number, **save the file, refresh the
browser** — that's the whole loop.

Look for `<-- TRY ME` comments. Those are the fun ones.

### Change what a bat is like → `data/units.js`

Find the bat you want to change and edit its numbers:

```js
scoutBat: {
  name: "Scout Bat",     // the words on the button
  cost: 25,              // energy it costs to send out
  cooldown: 1.4,         // seconds before you can send another one
  hp: 40,                // how much damage it can take
  attack: 8,             // damage per hit
  attackInterval: 0.6,   // seconds between hits (SMALLER = faster)
  range: 40,             // how far away it can hit from
  speed: 90,             // how fast it walks
  color: '#6fd3ff',      // its colour - try '#ff00ff'!
}
```

Fun things to try:
- Make `cost: 5` and spam a hundred Scout Bats. 😄
- Make `speed: 300` — they sprint across the screen.
- Make `hp: 2000` on the Brute Bat and watch it tank everything.

**How strong is a bat, really?** Damage per second = `attack ÷ attackInterval`.
The Scout Bat is `8 ÷ 0.6` = **13.3 damage per second**. If you double `attack`
you double its damage; if you *halve* `attackInterval` you also double it.

### Add a brand new bat

1. Copy a whole bat block in `data/units.js` (from `scoutBat: {` to `},`).
2. Rename it, e.g. `ninjaBat:`.
3. Change the numbers, the `name` and the `color`.
4. Set `sprite: 'ninjaBat'` to match the new name.
5. Decide which cave **earns** it. In `data/levels.js`, give that cave the line
   `unlocks: 'ninjaBat',` — beat that cave and the Ninja Bat gets a button in
   every cave after it.

A button for it appears automatically. No code changes needed.

### Beat a cave, earn a bat

You start with two bats, and every cave you beat early on gives you another:

| Beat... | ...and you earn | so from then on you have |
|---|---|---|
| *(start)* | Scout Bat, Brute Bat | 2 bats |
| 1. The Cave | **Archer Bat** | 3 |
| 2. Crystal Falls | **Bat Bros** | 4 |
| 3. Dream Land | **Necrobatcer** | 5 |
| 4. Pyramid | **Cheer Bat** — every other bat hits harder | 6 |
| 5. Sahara-hara Desert | **Bomb Bat** — one bomb on their tower, comes home a Scout | 7 |
| 6. Wait Um | **Skeleton Bat** — raised bats come back at full health | 8 |
| 7. Scarred Woods | **Engineer Bat** — energy fills faster | 9 |
| 8. Abyss of Darkness | **Frost Bat** — freezes bugs it touches | 10 |
| 9. Forgotten Oasis | **Rabies Bat** — eats everything near a random spot | 11 |

The first time you win one of those caves the victory screen says **NEW BAT
EARNED**, and the new bat wears a **NEW!** tag. The chain is worked out in
`src/systems/caves.js`, so caves 2–10 never list their own bats.

**Bat Bros** is **two Scouts' worth in one bat** for 55 energy: twice a Scout's
health and bite, at a Scout's speed, drawn as both brothers wing to wing. (Until
2026-10-17 it sent out two separate Scouts; the `squad` rule that did that is
still in `src/systems/squad.js` for the next squad.)

### The Locker — pick a team of three

You only take **three** bats into a cave. Before any cave where you have more
than three, the **Locker** opens: tap bats to put them in your team, then
**FIGHT!**. It remembers your last team. Change `team: { size: 3 }` in
`data/config.js` to take more.

### The ten caves of Palopa

Named by Lewis (homework B17), each built around **one** thing that makes it
different (B11), and every one measured with the balance sim:

| # | Cave | What makes it different |
|---|---|---|
| 1 | The Cave | the tutorial: keep spending, hoarding loses. **Eased 2026-09-19** |
| 2 | Crystal Falls | a new bug — the Spider arrives |
| 3 | Dream Land | no warm-up: bugs from second one |
| 4 | Pyramid | a tougher fortress |
| 5 | Sahara-hara Desert | less energy |
| 6 | Wait Um | the longest siege in the game |
| 7 | Scarred Woods | no warm-up, and spider country |
| 8 | Abyss of Darkness | two levers at once |
| 9 | Forgotten Oasis | scorpions, and lots of them |
| 10 | Final Stadium | the boss — the **Cow Killer Bee** |

Plus **The Graveyard**, a practice level for trying the Necrobatcer out.

**Caves unlock as you beat them** — cave 1 is open, and each win opens the next
one. Locked caves are still shown on the title screen so you can see what is
coming. Progress is saved in the browser (`src/systems/progress.js`); there is a
two-tap **Reset progress** inside the Credits panel if you want to start over or
test the locking.

### Add a whole new cave → `data/levels.js`

Copy the `level1` block, rename the key, change the numbers. **That is the only
step** — the title screen builds its cave list from this file, so a button for
it appears by itself, in the position you wrote it, and the cave before it gains
a **NEXT CAVE** button on its victory screen.

Add `practice: true` to a level and it is treated as a place to try things out
rather than a cave: listed separately on the menu, left out of the numbering,
and not held to the balance verdict (see the sim section below).

### Add a new enemy wave → `data/levels.js`

Add one line to the level's `waves` list:

```js
{ time: 30, enemy: 'mosquito', count: 3, gap: 0.7 },
```

- `time` — seconds after the battle starts
- `enemy` — any unit from `units.js` that has `enemy: true`
- `count` — how many to send
- `gap` — seconds between each one (leave it out and they all arrive at once)

You can write the waves in any order — the game sorts them by time for you.

### Make the game easier or harder

In `data/levels.js`:

| Want this | Change this |
|---|---|
| Win faster | Lower `enemyBaseHp` |
| Survive longer | Raise `playerBaseHp` |
| More bats, faster | Raise `energyPerSecond` |
| A harder fight | Add more waves, or raise `count` |

### Test a level without playing it for 90 seconds

```bash
node tools/balance-sim.js level1
node tools/balance-sim.js graveyard
```

This plays the whole level instantly and tells you whether it can be won, how
long it takes, and whether your base survives. Great for checking a level after
you change a lot of numbers.

**It plays as a *person*, not as a robot** — it runs the level at a range of
reaction times (0s to 1.0s) and at the end prints a **VERDICT**. Read that, and
ignore the `0s (robot)` row: tuning against a perfect thumb is what made Level 1
unwinnable once (see `DECISIONS.md` D8–D10).

It also checks one rule automatically: a cheap bat you're meant to spam must be
limited by **money**, not by its cooldown. If a cooldown is longer than the time
it takes to afford the bat, the button sits lit waiting for your thumb and every
late tap is a bat you never get.

**On a cave that offers the Necrobatcer, it plays a SUMMONER BUILD too** — a
Scout-spammer who also sends summoners. That row exists because neither of the
two spending policies ever bought the bat: the cheapest-first player always takes
the 25-energy Scout and the priciest-first always takes the 90-energy Brute, so
the 60-energy Necrobatcer fell down the crack between them and every cave
reported `0.00 bats raised`. Its balance had never actually been measured (D47).

**On a cave with a gambling bug in it, it plays 20 different battles.** The
Desert Scorpion can kill a bat outright on any hit, so one run proves nothing —
the report gains a `THE COIN FLIP` section and the cave has to win **all
twenty**. A cave lost to bad luck isn't a hard cave, it's an unfair one.

The dice are **seeded**, so the same seed always gives the same battle. A
measuring tool whose answer changes every run can't tune anything.

A cave that offers the **Bat Bros** gets one more pretend player, who reaches
for that button first — two Scouts' worth in one tap makes this the fastest
army there is. And a cave with a **boss** in it
(`boss: true` in `data/units.js`) is checked for whether the boss actually
turns up before the cave is won.

### Check the rules still hold

```bash
node tools/necro-test.js    # 20 checks - the Necrobatcer's summoning
node tools/sting-test.js    # 27 checks - the Desert Scorpion's gamble
node tools/items-test.js    # 37 checks - potions and fruit
node tools/roster-test.js   # 34 checks - which cave earns which bat, the Locker, the Bat Bros
node tools/powers-test.js   # 38 checks - Cheer, Bomb, Skeleton, Engineer, Frost, Rabies
```

Each covers the rules that stop the game quietly breaking, rather than the ones
that tune how it feels:

- **necro** — a raised bat can never be raised again, a Necrobatcer can't raise
  another Necrobatcer, and a recycled unit object forgets it was raised. Get any
  wrong and one grave becomes an endless army: no crash, just a game you can't
  lose.
- **sting** — a sting can *never* instantly kill a base (one roll must not
  decide a cave), it can't finish something already dying, and `killChance: 0.2`
  really does mean 20%. That last one matters because every balance measurement
  is taken with these dice.
- **items** — three potions give ten weakened seconds and not thirty, a potion
  never weakens your own bats, fruit can't overheal, and nothing writes on the
  shared stats object in `data/units.js`.
- **roster** — cave 1 starts you with Scout + Brute, caves 1–3 earn the Archer,
  Bat Bros and Necrobatcer in that order, every cave has exactly the bats earned
  before it, no cave has more bats than fit on the button row, the Bat Bros are
  exactly two Scouts' worth, and a squad tap sends its whole group.

### Add a cave painting

```bash
node tools/import-background.js some-picture.webp --cave pyramid
```

Resizes the picture, re-encodes it, saves it as `assets/bg/pyramid.webp` and
prints the block to paste into `data/backgrounds.js`.

The one number that matters is **`ground`** — where in the picture the bats
should stand, as a fraction of its height. Every painting puts its ground
somewhere different; the game slides the picture until that line meets
`CONFIG.lane.y`. The tool guesses it, and the guess is *often wrong by enough to
see*, so play the cave and nudge the number (bigger = bats stand lower down the
picture).

Unlike every other tool here it needs a browser, because decoding a painted
image without an image library isn't sensible. That's fine — it's a one-off
import step, and the **game** still depends on nothing.

### Check the documentation is still true

```bash
node tools/doc-check.js
```

The documents in this repo are not decoration — `DESIGN.md` and `DECISIONS.md`
are the shared memory between Jeff, Lewis and whoever picks this up next. But
they *quote the data*: fortress sizes, bat stats, which bug lives where. Change a
number in `data/` and a sentence somewhere becomes a lie, silently, with nothing
failing.

So this reads the real data files and checks the prose against them — unit stats,
cave HP, the README's own file map, that `index.html` loads every file that
exists, that the homework numbering has no gaps, and that every `[TO DECIDE]`
marker is also listed as open in `DESIGN.md` §13.

It earned its keep the day it was written by finding a fortress documented as
2100 that had been 1500 for hours, and a claim that the Scout Bat had a walk
cycle long after the redraw removed it.

---

## How the game works (for Jeff, or a curious Lewis)

```
index.html          loads the engine, then the data, then the code
manifest.webmanifest  lets a phone install it: name, icon, full screen, sideways
vendor/             Phaser 4.2.1, committed so we never depend on the internet
data/               EVERY tuning number lives here
  config.js           screen, lane, bars, buttons, timing
  units.js            all unit stats (yours and the enemy's)
  levels.js           base HP, economy, and the wave schedule
  items.js            potions, fruit and blood (the casino goods)
  backgrounds.js      each cave's painting, and where its ground line is
src/
  main.js             starts Phaser, lists the scenes
  scenes/
    BootScene.js      draws the placeholder art, builds the animations
    MenuScene.js      title, Start button, credits
    LockerScene.js    pick your team of three before a cave
    BattleScene.js    the battle, the UI, win/lose
  systems/
    economy.js        energy goes up, spending takes it down
    spawner.js        turns a wave list into timed spawns
    combat.js         who can reach what, and damage
    pool.js           reuses unit objects instead of making new ones
    necro.js          the Necrobatcer's summoning: graves, and raising them
    sting.js          the Desert Scorpion's gamble, and its seeded dice
    items.js          potions and fruit: what they do and what they refuse
    caves.js          what caves exist, which one comes next, which bats each has
    squad.js          one button, several bats (no bat uses it today)
    brain.js          what every unit does each step - shared by game AND sim
    cheer.js          the Cheer Bat's attack boost
    bomb.js           the Bomb Bat's flight, bomb and trip home
    frost.js          the Frost Bat's freeze
    rabies.js         the Rabies Bat's walk and big bite
    engineer.js       the Engineer Bat's faster energy
    team.js           the Locker's rules: which teams you may take in
    progress.js       which caves you have beaten, saved in localStorage
    touch.js          bigger tap areas for fingers on phones and tablets
  entities/
    unit.js           one bat: walk, fight, die
    base.js           a building with HP
tools/
  balance-sim.js      plays a level with no graphics (testing only)
  necro-test.js       checks the summoning rules hold (testing only)
  sting-test.js       checks the gambling rules hold (testing only)
  items-test.js       checks the item rules hold (testing only)
  roster-test.js      checks which cave earns which bat, the Locker, the Bat Bros (testing only)
  powers-test.js      checks each of the six new bats' powers (testing only)
  doc-check.js        checks the DOCUMENTS still match the data (testing only)
  import-background.js  puts a cave painting into assets/bg (needs a browser)
  pack-spritesheet.js turns a folder of frames into one sprite sheet
  png.js              reads/writes PNG files, used by the packer
assets/
  sprites/            the bats, and the sprite sheets they are packed into
  bg/                 one painting per cave, named after its cave key
  bases/              the two fortresses
```

### The rules this project sticks to

- **Zero build step.** No bundler, no npm install, no TypeScript, no ES
  modules. Plain `<script>` tags and globals on `window`.
- **Phaser is vendored.** `vendor/phaser.min.js` is committed. Nothing is
  fetched from a CDN at run time.
- **No physics engine.** The lane is one dimension, so "how far away is that?"
  is a subtraction (`src/systems/combat.js`). Arcade/Matter would be overkill.
- **No gameplay numbers in code.** If a number decides how the game *plays*, it
  belongs in `data/`. Systems and entities read it; they never hardcode it.
- **A special power lives in `src/systems/`, never in `unit.js`.** There are two
  so far — `necro.js` and `sting.js` — and both are run by the real game *and*
  by `tools/balance-sim.js`, which keeps its own copy of the unit brain. A power
  written inside `unit.js` would be invisible to the sim, and the sim would then
  cheerfully report balance for a game nobody plays. Every hit in the game goes
  through one function, `Combat.strike()`, for the same reason.
- **Small, readable functions**, so a kid can follow along.

### Two details worth knowing

**Fixed timestep.** Phaser draws as fast as your device can — 60fps on a
laptop, 120 on a fancy phone, 20 on an old one. If bats moved by "however long
the last frame took", the game would play differently on different devices. So
`BattleScene.update()` saves up elapsed time and runs the game brain in exact
1/60th-second slices. It also throws away anything beyond
`CONFIG.sim.maxCatchUpSeconds`, so coming back to a backgrounded tab can't make
the browser try to simulate ten minutes in one frame.

**Pooling is already wired in.** Every unit is created through
`src/systems/pool.js`. When a bat finishes its death animation the object goes
back in the pool and the next bat reuses it, instead of being thrown away for
the browser to clean up later (which shows up as stutter on phones). A whole
battle only ever creates about 20 unit objects.

### Adding real art

When you have sprites — from PixelLab, Aseprite, an asset pack, anywhere — the
game wants **one PNG per unit**: every frame in a single row, all the same size,
in the order `idle`, `walk`, `attack`, `death`, drawn **facing right** (enemies
are flipped automatically in code).

Art tools rarely export it that way, so there's a packer:

```bash
node tools/pack-spritesheet.js path/to/frames --key scoutBat
```

It accepts frames as a subfolder per animation, as flat files named
`walk_01.png`, or as one wide strip per animation — all three give the same
result. It writes `assets/sprites/<key>.png` and then prints the exact
`anims` block to paste into `data/units.js` and the exact `this.load.spritesheet`
line for `BootScene.preload()`.

It also checks the things that go wrong: frames of differing sizes (it stops and
tells you, or `--pad` grows them all, bottom-aligned so feet stay put), blank
frames, and art that leaves so much empty space the bat will look tiny in game.

Like `balance-sim.js`, it's a developer tool — it needs nothing installed, and
the game itself never loads it. **Record anything you add in `ASSETS.md`.**

### Placeholder art

There are no art files yet. `BootScene` *draws* a sprite sheet for each unit at
start-up — a real sheet with real idle/walk/attack/death animations, sliced
into numbered frames exactly like a downloaded one.

That means swapping in real art is a small change: add the file to
`assets/sprites/`, load it in `BootScene.preload()`, and the placeholder for
that unit is skipped automatically (it only draws units that don't already have
a texture). The frame layout is per-unit data in `units.js`, so a different
sheet just means different numbers. **Record every new asset in `ASSETS.md`.**

---

## Play it online (GitHub Pages)

**Live site:** https://jhester599.github.io/combats/

The site is served straight from the `main` branch — GitHub Pages is set to
**Deploy from a branch** (`main`, `/ (root)`). Because ComBats is plain
static files with no build step, there is nothing to compile: **push to `main`
and the site updates by itself** a minute or so later.

You can watch a deploy land in the repo's **Actions** tab, as a run named
*pages build and deployment*.

### Settings behind it (already done, for reference)

- **Settings → Pages → Build and deployment → Source:** *Deploy from a branch*
- **Branch:** `main`, folder `/ (root)`
- The repo must stay **public** for Pages on a free GitHub account.

The empty `.nojekyll` file in the root matters in this mode: serving a branch
directly runs the files through Jekyll first, and `.nojekyll` turns that off so
every file is published exactly as committed.

> Fakeamon Spark publishes a different way — a GitHub Actions workflow
> (`.github/workflows/deploy-pages.yml`) that uploads the site on each push.
> Both end up in the same place. Branch deploy is the simpler of the two and
> needs no workflow file at all, which is why this repo uses it. Switching to
> the Actions style later just means changing the Source setting to *GitHub
> Actions* and adding the workflow back.

## Ideas for later

Written up as `TODO` comments in the code, where the work would actually go:

- **Special powers** — a bat that explodes when it dies, or heals its friends
  (`src/entities/unit.js`)
- **A boss bat** — huge HP, its own health bar across the top
- **A second lane** — an upper lane bats can fly along
- **Unlockable bats** — save which ones you've earned in `localStorage`
- **Real art and sound** — see `ASSETS.md` for licence-checked candidates
- **A texture atlas** — once there are lots of units on screen, putting every
  frame in one image lets the renderer draw them in a single batch

---

## Licence

The game's code is ours. Phaser is MIT (see `vendor/PHASER-LICENSE.md`).
Art licences and credits are tracked in [`ASSETS.md`](ASSETS.md).
