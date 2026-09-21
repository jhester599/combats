# Cave backgrounds

One painting per cave, named after its **cave key** in `data/levels.js` —
`crystalFalls.webp` is the background for `crystalFalls`.

Saved as **.webp** because these are detailed paintings: the same picture as a
PNG is several times the size, and every browser has decoded webp for years.
1280px wide, which is comfortably more than the game's 960 so it stays crisp.

## Adding one

```
node tools/import-background.js <picture> --cave <caveKey>
```

It resizes, re-encodes, saves it here, and prints the block to paste into
`data/backgrounds.js`.

## The number that matters

`ground` in `data/backgrounds.js` says where in the picture the bats stand, as a
fraction of its height. Every painting puts its ground somewhere different; the
game slides the picture until that line meets `CONFIG.lane.y`.

**The importer's guess is often wrong by enough to see.** Play the cave and
look at the bats' feet:

- floating above the ground → make `ground` **bigger**
- sunk into the ground → make `ground` **smaller**

About 0.01 is six pixels on screen.

## Housekeeping

A cave with no picture here falls back to the flat purple, so a missing file is
a plain-looking cave rather than a broken one.

Record every asset in `ASSETS.md` with its author and licence before committing.
Keep the full-resolution originals somewhere safe outside the repo — what is
stored here is resized for the game and cannot be scaled back up.
