# Assets & Credits

Every asset in Battle Bats is listed here with its author, licence and a link.
This file is the project's record of what we are allowed to use and what we
have to say thank you for.

**Keep this file up to date.** Some licences (anything CC BY or CC BY-SA)
*legally require* us to credit the artist. When you add an asset, add a row
here in the same commit, and also add the artist to the Credits panel on the
title screen (`src/scenes/MenuScene.js`, in `buildCredits`).

---

## Code / engine

| Thing | Author | Licence | Where it came from |
|---|---|---|---|
| Phaser 4.2.1 (`vendor/phaser.min.js`) | Richard Davey / Phaser Studio Inc. | MIT | https://phaser.io — installed from the npm package `phaser@4.2.1`. Full licence text kept alongside it in `vendor/PHASER-LICENSE.md`. |

Phaser is **vendored** — the file is committed to this repo. The game never
loads anything from a CDN at run time, so it works offline and cannot break
because someone else's server went down.

---

## Art

| Thing | Author | Licence | Where it came from |
|---|---|---|---|
| Enemy sprites (Mosquito, Spider, Scorpion) and the Necrobatcer | *placeholder — drawn by the game itself* | n/a | Generated at start-up in `src/scenes/BootScene.js`. Not a file, not downloaded. |
| Backgrounds, bases, UI panels | *placeholder — plain coloured rectangles* | n/a | Drawn by Phaser at run time. |

There are **no third-party art files in this repo yet.** The `assets/` folders
are empty and waiting.

### AI-generated art (PixelLab)

We have a **PixelLab** account for this project. Sprites made there go in the
table above like anything else, with one extra column's worth of care:

- Put **"PixelLab (AI-generated)"** as the author, and note **which account**
  made it and **roughly when**.
- **Check your PixelLab plan's terms** for what you own and whether commercial
  use is allowed, and write the answer here once so nobody has to re-check.
  AI-generated art is not automatically CC0 — the terms are set by the service,
  not by a public licence.
- Keep the **prompt** next to the entry if it's worth regenerating later.

Sprites are brought into the game with `tools/pack-spritesheet.js` (see
README). Nothing calls PixelLab at play time — the game only ever loads a
committed PNG.

| Sprite | Made by | Terms | When |
|---|---|---|---|
| `assets/sprites/scoutBat.png` — Scout Bat (goggles): 1 pose + 16-frame walk | Lewis, via PixelLab (AI-generated) | ⚠️ **see note below** | 2026-09-18 |
| `assets/sprites/bruteBat.png` — Brute Bat (cape): 1 pose | Lewis, via PixelLab (AI-generated) | ⚠️ **see note below** | 2026-09-18 |

The **original exports** are kept in `assets/sprites/source/` so a sheet can be
rebuilt when more frames arrive — see the README there for the exact command.
The files in `assets/sprites/` are built from those by
`tools/pack-spritesheet.js`; don't hand-edit them.

All art faces **east (right)**; the game mirrors enemies itself. Units are
drawn at different sizes through each one's `scale` in `data/units.js`
(Scout 0.75, Brute 1.05, Necrobatcer 0.9), not by resizing the files — so
everything can be drawn at a convenient 64×64.

**Still missing:** attack and death frames for both bats, and a walk cycle for
the Brute. Until those exist, those animations fall back to the standing pose.

⚠️ **Still to confirm:** what Jeff's PixelLab plan says about ownership and
commercial use. Write the answer here once so nobody has to look it up again.

---

## 🎨 THE CURRENT DRAWING BRIEF (Lewis, homework B4, 2026-09-19)

**Lewis changed the bats' design on 2026-09-19.** The goggled Scout and the
caped Brute above are now **placeholders again** — they stay in the game so
nothing is broken, but they no longer match the design.

What to draw in PixelLab:

| | |
|---|---|
| Style | **Hand-drawn looking. Not realistic.** |
| Body | **A large circle** |
| Has | **Wings, ears, a mouth** |
| Does not have | **Legs** |
| Colour | **Black and white only** |
| Size | 64×64 |
| Facing | **East (right)** — the game mirrors enemies itself |

### Why black and white is the important part

A white or grey drawing can be **tinted** any colour by the engine at run time.
So each bat is drawn **once** and the game produces every colour of it.

That matters because Lewis's other B4 decision is a colour ladder: a bat starts
plain and climbs the rainbow **backwards** as it is upgraded — Violet, Indigo,
Blue, Green, Yellow, Orange, **Red** at the top. Eight appearances per bat.

**Do not draw eight versions of anything.** Draw one, in black and white, and
let `CONFIG.upgradeTiers` in `data/config.js` do the rest. (Not wired up yet —
it switches on with the casino, homework B13.)

One thing to watch when drawing: a tint **multiplies** colour in, so pure black
pixels stay black whatever tint is applied, and white pixels take the tint most
strongly. Outlines in black and bodies in white/light grey will colour up best.

---

### Art we plan to use (researched, licences checked)

Nothing below is in the repo yet. When one of these is added, move it up into
the table above and fill in the details.

| Candidate | Author | Licence | Obligation | Link |
|---|---|---|---|---|
| "Animated Rat and Bat" (has idle / gesture / walk / attack / death) | Calciumtrice | CC BY 3.0 | **Must credit the artist** | https://opengameart.org/content/animated-rat-and-bat |
| UI packs, backgrounds, particles, sound effects | Kenney | CC0 | None — public domain | https://kenney.nl/assets |

**Required credit line if we use the Calciumtrice bat:**

> Animated Rat and Bat by Calciumtrice, usable under Creative Commons
> Attribution 3.0 license.

### What the licences mean, in plain words

- **CC0** — public domain. Use it for anything, no credit needed. (Kenney.)
  Still list it here so we remember where it came from.
- **CC BY** — free to use, but you **must name the artist** somewhere players
  can see. (Calciumtrice.)
- **CC BY-SA** — name the artist **and** any art you make *out of* their art
  has to be shared under the same licence. Adds strings; prefer CC0 or CC BY
  unless the art is worth it. (Most Tuxemon and LPC art is CC BY-SA.)
- **MIT** — the code licence Phaser uses. Keep the licence file with it.

These obligations apply to the **art**, not to our game's code.

> ⚠️ Check the licence box on the individual asset page, not just the
> collection it sits in. Packs advertised as "CC0" sometimes contain a few
> items that are actually CC BY.

---

## Audio

Nothing yet. Audio will use Phaser's built-in WebAudio — no extra library.
When sounds are added, list them here.
