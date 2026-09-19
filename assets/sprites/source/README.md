# Source art

The **original exports** from the art tool, kept so a sprite sheet can be
rebuilt later — for instance when attack or death frames arrive and a unit
needs re-packing.

One folder per unit, one file per animation:

```
scoutBat/idle_01.png   150x64   a single pose
bruteBat/idle_01.png   132x64   a single pose
necroBat/idle_01.png   100x64   a single pose
```

Frames are **wide, not square**, since Lewis's 2026-09-19 bats are drawn with
their wings out. They share a 64px height so every bat stands on the same
baseline; the width follows each drawing's own shape.

`_superseded-2026-09-18/` holds the first design (goggles and cape). The packer
only looks inside the folder you point it at, so it is never read.

## Rebuilding a sheet

```bash
node tools/pack-spritesheet.js assets/sprites/source/scoutBat \
  --order idle --key scoutBat --force
```

`--frame 64` tells the packer that a single image is a **grid** of 64x64
frames, read left-to-right then top-to-bottom. `--order` lists only the
animations that actually exist. The packer then prints the `anims` block to
paste into `data/units.js`.

**Facing:** the current bats are drawn **front-on and symmetrical**, so
mirroring them does nothing and the east-facing rule does not bite. Anything
drawn in profile still needs to face **east (right)** - the game flips enemies
automatically.

Credit every file in `../../../ASSETS.md`.
