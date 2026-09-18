# 🦇 Battle Bats

A 2D lane auto-battler for the browser, in the style of *The Battle Cats*.
Send bats down a lane, they fight on their own, smash the enemy base.

Made by **Jeff** (code) and **Lewis** (creative director — units, stats, levels).

### ▶ [Play it in your browser](https://jhester599.github.io/combats/)

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

## Design docs

Battle Bats is designed the same way Fakeamon Spark is — Lewis makes the
creative calls, and there's a paper trail so nothing gets lost between sessions:

| File | What it's for |
|---|---|
| **[`DESIGN.md`](DESIGN.md)** | The living design document. What the game *is*, what's decided, what's still open. |
| **[`HOMEWORK.md`](HOMEWORK.md)** | 🦇 **Lewis's current questions.** Start here. |
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
  cooldown: 2.0,         // seconds before you can send another one
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
5. In `data/levels.js`, add `'ninjaBat'` to that level's `playerUnits` list.

A button for it appears automatically. No code changes needed.

### Add a new enemy wave → `data/levels.js`

Add one line to the level's `waves` list:

```js
{ time: 30, enemy: 'critter', count: 3, gap: 0.7 },
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
```

This plays the whole level instantly and tells you whether it can be won, how
long it takes, and whether your base survives. Great for checking a level after
you change a lot of numbers.

---

## How the game works (for Jeff, or a curious Lewis)

```
index.html          loads the engine, then the data, then the code
vendor/             Phaser 4.2.1, committed so we never depend on the internet
data/               EVERY tuning number lives here
  config.js           screen, lane, bars, buttons, timing
  units.js            all unit stats (yours and the enemy's)
  levels.js           base HP, economy, and the wave schedule
src/
  main.js             starts Phaser, lists the scenes
  scenes/
    BootScene.js      draws the placeholder art, builds the animations
    MenuScene.js      title, Start button, credits
    BattleScene.js    the battle, the UI, win/lose
  systems/
    economy.js        energy goes up, spending takes it down
    spawner.js        turns a wave list into timed spawns
    combat.js         who can reach what, and damage
    pool.js           reuses unit objects instead of making new ones
  entities/
    unit.js           one bat: walk, fight, die
    base.js           a building with HP
tools/
  balance-sim.js      plays a level with no graphics (testing only)
assets/             empty for now - real art goes here
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
**Deploy from a branch** (`main`, `/ (root)`). Because Battle Bats is plain
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
