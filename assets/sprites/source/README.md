# Source art

The **original exports** from the art tool, kept so a sprite sheet can be
rebuilt later — for instance when attack or death frames arrive and a unit
needs re-packing.

One folder per unit, one file per animation:

```
scoutBat/idle.png    64x64    a single pose
scoutBat/walk.png    256x256  a 4x4 grid of 64x64 frames (16 frames)
bruteBat/idle.png    64x64    a single pose
```

## Rebuilding a sheet

```bash
node tools/pack-spritesheet.js assets/sprites/source/scoutBat \
  --frame 64 --order idle,walk --key scoutBat --force
```

`--frame 64` tells the packer that a single image is a **grid** of 64x64
frames, read left-to-right then top-to-bottom. `--order` lists only the
animations that actually exist. The packer then prints the `anims` block to
paste into `data/units.js`.

Everything must face **east (right)**. The game flips enemies automatically.

Credit every file in `../../../ASSETS.md`.
