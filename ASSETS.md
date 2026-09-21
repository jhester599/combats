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
| `assets/sprites/scoutBat.png` — Scout Bat: big eyes, big ears, 1 pose (150×64) | Lewis | ⚠️ **tool not recorded** | 2026-09-19 |
| `assets/sprites/bruteBat.png` — Brute Bat: the scowling one, 1 pose (132×64) | Lewis | ⚠️ **tool not recorded** | 2026-09-19 |
| `assets/sprites/necroBat.png` — Necrobatcer: a bat skull with a flaming staff, 1 pose (100×64) | Lewis | ⚠️ **tool not recorded** | 2026-09-19 |
| *(superseded)* Scout Bat in goggles, Brute Bat in a cape | Lewis, via PixelLab (AI-generated) | ⚠️ see note below | 2026-09-18 |

The 2026-09-18 pair were replaced by the redraw above (homework B4). Their
source exports are kept in `assets/sprites/source/_superseded-2026-09-18/`.

⚠️ **Which tool made the 2026-09-19 drawings has not been recorded.** The
2026-09-18 pair were PixelLab; these arrived as finished images, so the tool
and its terms still need writing down here the same way. Somebody who knows
should fill this in.

The **original exports** are kept in `assets/sprites/source/` so a sheet can be
rebuilt when more frames arrive — see the README there for the exact command.
The files in `assets/sprites/` are built from those by
`tools/pack-spritesheet.js`; don't hand-edit them.

**Facing: the 2026-09-19 bats are drawn FRONT-ON and symmetrical**, wings out
either side, so the "everything faces east" rule no longer bites - mirroring a
symmetrical drawing changes nothing, and the game's enemy flip is a harmless
no-op on them. Anything drawn in profile still needs to face east.

**The frames are wide now.** A bat with its wings out is a wide thing, so the
sheets are 150×64, 132×64 and 100×64 rather than square. Each unit's `scale` in
`data/units.js` came down to match (Scout 0.75→0.55, Brute 1.05→0.8,
Necrobatcer 0.9→0.7), so they take up about the same room on screen as the old
square drawings did.

**They are mostly WHITE inside a black outline** - measured at 66–70% light
pixels. That is what makes the colour ladder possible later: a tint multiplies,
so light areas take the colour and the outlines stay black.

**Still missing:** every bat is a SINGLE POSE. The Scout's old 16-frame walk
cycle belonged to the superseded drawing and did not survive the redraw, so
nothing flaps at the moment - idle, walk, attack and death all show the
standing pose. That is homework B21.

**Still to draw:** the **Archer Bat**, the three bugs and the **Cow Killer
Bee**. All are still placeholder shapes the game paints itself.

⚠️ **Still to confirm:** what Jeff's PixelLab plan says about ownership and
commercial use. Write the answer here once so nobody has to look it up again.

---

## ✅ THE DRAWING BRIEF (Lewis, homework B4) — three of four delivered

**Done 2026-09-19:** the **Scout Bat**, **Brute Bat** and **Necrobatcer** are
drawn to this brief and are in the game. The **Archer Bat** is still a
placeholder, and so are all the bugs.

### ✅ Cave backgrounds — five of ten, added 2026-09-21

| Cave | File | `ground` |
|---|---|---|
| Crystal Falls | `assets/bg/crystalFalls.webp` | 0.800 |
| Dream Land | `assets/bg/dreamLand.webp` | 0.810 |
| Abyss of Darkness | `assets/bg/abyssOfDarkness.webp` | 0.745 |
| Forgotten Oasis | `assets/bg/forgottenOasis.webp` | 0.780 |
| Final Stadium | `assets/bg/finalStadium.webp` | 0.780 |

All 1280×569 webp, 50–170KB each. `ground` is where in each picture the bats
stand — see `assets/bg/README.md`. **Still flat purple:** The Cave, Pyramid,
Sahara-hara Desert, Scarred Woods, Wait Um.

The full-resolution originals (1881×836) are **not** in the repo; what is stored
is resized for the game. Keep the originals somewhere safe.

### What is still a coloured blob the game paints itself

| | Unit | Placeholder colour | Homework |
|---|---|---|---|
| 🏹 | Archer Bat | mint green | B4 |
| 🦟 | Mosquito | pale insect green | B3/B4 |
| 🕷️ | Spider | dusty purple | B3/B4 |
| 🦂 | Scorpion | sandy brown | B3/B4 |
| 👑 | Cow Killer Bee | queen-bee yellow | B3/B4 |
| 🦂 | **Desert Scorpion** | bright desert sand | **B30** *(new)* |
| 🦋 | **Evil Butterfly** | dream magenta | **B30** *(new)* |
| ✨ | **Lightning Bug** | firefly yellow-green | **B30** *(new)* |

And two things that are not units at all, drawn as **plain rectangles**:

| | Thing | Drawn as | Size |
|---|---|---|---|
| 🏰 | Your fortress | a blue box with a slab on top | 74×150 (+92×20 roof) |
| 🏰 | The enemy fortress | the same box in red | 74×150 (+92×20 roof) |

These are the thing a player spends most of a battle attacking, and they look
especially out of place now the caves are painted.

The three new ones arrived with homework B26 on 2026-09-20. Note that the **bugs
are not bats**, so the "large circle, wings, ears, no legs" brief below does not
apply to them — they can look like whatever Lewis thinks they look like. Only
the size, the facing and the black-and-white rule carry over.

The brief, for whatever **bat** is drawn next:

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
plain and climbs the rainbow **backwards** as it is upgraded. **Homework B23 cut
this to four steps** — Plain → Violet → Blue → Yellow → **Red** — so it is
**five** appearances per bat, not the eight this page used to claim. Seven
upgrades per bat would have meant seven prices to balance for every bat in the
game.

**Do not draw five versions of anything.** Draw one, in black and white, and let
`CONFIG.upgradeTiers` in `data/config.js` do the rest. (Not wired up yet — it
switches on with the casino, homework B13.)

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
