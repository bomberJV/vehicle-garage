# 2002 G500 roof review

Reviewed 14 November 2026. This is a reconstruction from parts drawings and operating descriptions, not factory CAD or a service-adjustment model.

## Evidence actually inspected

- [Mercedes-Benz Classic USA, 2002 G500 sunroof catalog](https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/body--sunroof). Checked the model-year selection and component list. The frame plate distinguishes handed rails (25), guide supports/jaws (12), guide shoes, panel (20), perimeter seal (21), side brackets/covers (29–30), drip rail (31), and its separate lips/seals (32–33). Generic catalog descriptions sometimes include other chassis; those descriptions do not establish a material or dimension for this vehicle.
- Visually inspected the two 2002 model-year OEM exploded drawings reproduced by the [parts-catalog mirror](https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/body-hardware/sunroof): [frame and components plate](https://www.mbpartsgiant.com/resources/encry/diagram/motor/2025/medium/2357994a249d8419befd6cdc2ec8d13a.png) and [sunshade and motor plate](https://www.mbpartsgiant.com/resources/encry/diagram/motor/2025/medium/a0b84c0a07a832bcd403f52428f8f6d9.png). The latter shows an inner sunshade (4), upper/lower handed slide rails (5–6), cable guide and cable (8–9), drain hoses (10), and distinct front/rear clips (11–12). The diagrams establish topology and separate parts, not dimensions.
- Read the 2002 operator's manual, printed [p. 154](https://www.manualsdir.com/manuals/118401/mercedes-benz-2002-g-class-2002-g-500-g-class-2002-owners-manual.html?page=157). It specifies separate commands to slide open/closed and raise/lower the rear. Read printed [p. 346](https://www.manualsdir.com/manuals/118401/mercedes-benz-2002-g-class-2002-g-500-g-class-2002-owners-manual.html?page=349): the emergency roof drive is behind cargo-area trim. These manual pages were inspected as text; their background drawings were not used to infer geometry.

## Changes justified by the drawings

- Added separate guide jaws, panel side supports, seal, rear drip rail and its two lips, inner sunshade with upper/lower rails, drain connection tails, and wind-deflector levers and springs. These are individually selectable in the cutaway. Deflector arms pivot without changing length.
- Added a separate rear-lift view. The front pivot remains fixed while the rear rises; the panel and seal rotate as one rigid shape. The supports can be opened from the installed roof or the sliding cutaway.
- Corrected the sliding sequence to lower the panel from its seal before moving aft, then raise the deflector after the leading edge clears. The reverse sequence closes it.
- Aligned the installed panel with the exterior opening at z = 2.017 m. The model's tire contact plane is z = 0.040 m, so this corresponds to the 1.977 m stock overall height used by the exterior agent. Shifted cassette supports and the upper cable route with the roof; retained the cargo motor's cabin mount.

## Remaining limits

The 0.78 m illustrative travel, 0.038 m lowering, and 0.085 rad rear-lift angle are not sourced service settings. Exact cam-slot profiles, shoe engagement clearances and synchronized cable geometry are not reconstructed. The parts drawing's callout-5 levers are adjacent to the wind deflector and are not treated as proof of the panel's rear-lift cam design. The sunshade is parked partly aft in section; its independent motion is not simulated. Four drain tails are shown at the cassette; their hidden routes and body outlets are omitted. No sealed-motor internals, unsourced gear tooth counts, water-flow simulation, or manufacturing tolerances are claimed.

## Verification

`node --test tests/garage-g500-service.test.mjs tests/garage-g500-roof.test.mjs` checks independent component tags, finite geometry, release-before-slide sequence, closing position, installed roof height, stationary tilt pivot, and rigid panel dimensions throughout the lift.
