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
| All unit sprites (Scout Bat, Brute Bat, Cave Critter, Cave Bruiser) | *placeholder — drawn by the game itself* | n/a | Generated at start-up in `src/scenes/BootScene.js`. Not a file, not downloaded. |
| Backgrounds, bases, UI panels | *placeholder — plain coloured rectangles* | n/a | Drawn by Phaser at run time. |

There are **no third-party art files in this repo yet.** The `assets/` folders
are empty and waiting.

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
