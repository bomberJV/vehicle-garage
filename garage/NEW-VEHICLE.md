# Adding a vehicle to the garage

This is the standing procedure for every new vehicle. It turns "build me this car" into a sequence of decisions, references, geometry and checks that each have a definite finish. The per-vehicle plans ([2025 X3 30 xDrive](bmw-x3-g45-plan.md), [2018 X1 xDrive28i](bmw-x1-f48-plan.md)) apply it to a specific car.

The rule behind every step: **a shape or a number enters the model only with a named source, and every source-backed number is checked against the mesh by a test.** Where a source does not exist, the geometry is labelled an estimate and says what it was estimated from.

---

## The ten phases

| # | Phase | Output | Done when |
|---|---|---|---|
| 0 | Pin the exact variant | `vehicle-decisions.js` entry | One market, model year, trim, drivetrain, engine code, wheel package and body-affecting options are fixed, each with a source |
| 1 | Reference pack | `<make>-<chassis>-references.md`, `reference-ledger.js` entry | Every reference class below is either filled or marked unavailable |
| 2 | Datum and hard numbers | `catalog.js`, `factory-dimensions.js` study, dimensions test | The span checks close and the stock mesh measures within tolerance |
| 3 | Body | `<chassis>-body-profile.js`, `-shell.js`, `-ends.js`, `exterior-profiles.js` overlay | Overlay residuals and section checks pass; shut lines match the parts plates |
| 4 | Closures and glazing | `door-profiles.js`, closure modules, `body-visibility.js` | Every opening panel moves on its real hinge axis; glass follows the published outlines |
| 5 | Running gear | wheel specs, `wheel-designs.js`, suspension/steering/brake parts in `assemblies.js` | Wheel centres, track and tyre radius match the decided wheel package |
| 6 | Powertrain | `engine-data.js`, engine geometry, driveline modules | Cylinder, cam, valve and plug counts are encoded and tested; driveline route matches the underbody reference |
| 7 | Vehicle systems | fuel, exhaust, cooling, electrical, climate, cabin, safety, assistance | Each system in the checklist below has its components placed, sourced and selectable |
| 8 | Studies, catalog and accessories | drill-down studies, `catalog.js` lines, `accessory-catalog.js` | Each catalog line has a part number, exact fitment and a source; accessories suit this vehicle |
| 9 | Board, review and release | `priority-*.js` entries, hub issue, release to `brandon-studio` | Hub checklist is ticked with verification links; the drawing check is recorded |

Phases 3–8 can overlap once phase 2 is done. Phase 2 cannot be skipped: every later module hangs off its datum.

---

## Phase 0 · Pin the exact variant

A model name is not a specification. The X3 alone has four engines, three wheel packages and two bumper designs in one model year. Write the decision before drawing anything, in the same shape as the existing entries in `vehicle-decisions.js`:

- **Market and model year.** US unless stated. Mid-cycle changes (BMW calls them LCI) change lamps, bumpers and grilles; check which side of the change the model year falls on.
- **Trim, engine code and drivetrain.** Use the manufacturer's own name. Record the engine code (for example B48, B46, N52) and the type code where a parts catalogue gives one.
- **Body-affecting options.** Anything that changes the silhouette or a panel: sport or M packages (bumpers, sills), wheel package, roof rails, panoramic roof, lighting package, trailer hitch, ride height or adaptive suspension.
- **Wheel package.** Rim diameter, width, offset and tyre size. Track widths change with the wheel, so the dimension study must use the track published for the chosen wheel.

If a decision depends on something only the owner knows (a real car's VIN, its packages), ask first; record the answer as the decision's basis.

---

## Phase 1 · Reference pack

Collect each class below. Record each source in the vehicle's references file with its page, date and what it establishes, in the style of [bmw-references.md](bmw-references.md).

| Class | What it gives the model | Where to look |
|---|---|---|
| Manufacturer technical data | Length, widths with and without mirrors, height, wheelbase, tracks, overhangs, ground clearance, tyres, engine data | Manufacturer press kit technical-data sheets, US owner's manual technical-data page |
| Orthographic outline | Side and plan silhouettes at true proportion | Rescue sheets (Euro NCAP rescue-sheet archive, manufacturer rescue portals), dimensioned press drawings, workshop introduction drawings |
| Parts plates | Which panels are separate pieces, where they join, hinge and latch positions, component names and part numbers | Manufacturer parts catalogues and dealer mirrors of them |
| Test-programme photographs | Near-orthographic side, front and rear photographs of a production car, plus underbody and engine bay | NHTSA NCAP test reports and their photo sets for the exact model year |
| Technical training documents | System architecture, component locations, wiring and drivetrain layouts | Manufacturer service-training manuals for the chassis code |
| Service bulletins and recalls | Real component routing (cables, lines, brackets) and part numbers | NHTSA recall and bulletin filings |
| Owner photographs | Details the drawings do not show: badge positions, lamp graphics, trim colour | Wikimedia Commons, auction listings of original cars |

Rules for references:

- **Same generation, same side of the facelift, same body.** A 2020 photo of a 2018 car's facelifted successor is a different car.
- **Renders are not references.** Manufacturer configurator and website images are often computer-generated; use them only for colour and options, never for shape.
- **When published numbers disagree, resolve the difference before modelling** (different wheels, roof rails, antenna, unladen versus kerb). Record which figure was used and why.

---

## Phase 2 · Datum and hard numbers

### The frame

Use the frame the BMWs already use (`e90-body-profile.js`, `e46-coupe-shell.js`):

- origin at the middle of the wheelbase on the centreline;
- **x forward is negative**, so the axles sit at x = ∓wheelbase/2;
- **y left is negative**;
- **z up**, with the stock tyre contact at **z = 0.040**.

All coordinates are metres. Wheel radius comes from the tyre size: `(rim inches × 25.4 / 2 + section mm × aspect) / 1000`, as recorded for the G500 in [SOURCES.md](SOURCES.md).

### Close the numbers before using them

Check that the published spans agree with each other. Front overhang + wheelbase + rear overhang must equal overall length; a published height must sit plausibly above the tyre radius and ground clearance. A disagreement means one figure belongs to a different variant.

### Encode and test

1. Add the vehicle to `catalog.js` with length, width, height, wheelbase, tyre and rim radius, the source and a photo reference.
2. Add a study to `factory-dimensions.js` listing every published span, with sources.
3. Add a dimensions test that measures the stock mesh and compares it with the study. **Tolerance:** overall spans within ±5 mm of the published figure (the source's own rounding sets the floor; a figure published to 0.1 in carries ±1.3 mm); wheel centres exact.

Every later module reads its axle positions, track and wheel radius from these values rather than repeating them.

---

## Phase 3 · Body

The body is what people judge first. Accuracy comes from building it in layers, each tested against its own source.

### 3.1 Side elevation (the profile)

Create `<chassis>-body-profile.js` in the format of `e90-body-profile.js`:

- **stations:** `[x, half-width at shoulder, height of the top edge]` from nose to tail. Use at least 15 stations, closer together where the profile changes fast: nose, wheel arches, A-pillar foot, tail.
- **wind, roof, rear:** windscreen line, roof line and backlight/tailgate line.
- **window outlines:** each side-glass opening (front door, rear door, quarter light) as a polygon, including the Hofmeister kink on BMWs.
- **door:** leading and trailing shut lines at the belt.

Trace the rescue sheet or press drawing side view. **Register at the two wheel centres**, not the bumpers: wheel centres are unambiguous on every drawing and photograph, and the wheelbase is the most precisely published dimension. Scale = published wheelbase ÷ wheel-centre distance in the image. Where the rescue sheet is a vector PDF, read the wheel centres from its vectors: the 996 was registered at K = 2,350 mm ÷ (414.85 − 180.95) pt on page 36.

**Start from the closest existing body.** SUVs and crossovers start from the HR-V's `exterior-coachwork.js` hooks (`sideSection`, `capFollowsSide`, `hoodLaneTint`); BMW saloons and coupés start from the E46/E90 loft (`e46-coupe-shell.js`, `e90-sedan-shell.js`).

### 3.1a Photographs: two perspective errors

The garage renders orthographically; photographs are perspective. Two errors have already cost a rebuild:

- **Side photographs shrink the centre plane.** Calibrated on the wheel plane, the roof, nose tip and tail tip sit farther from the camera and read short: the C63's length read 4.48 m against 4,707 mm. Take overhangs and roof height from the published figures, and use side photographs for the shape between them.
- **Head-on photographs scaled by body width overstate the nose** by about 8 %, because the nose is nearer the camera than the widest point. Scale nose features from something on the nose: a US number plate is 12 in (0.305 m) wide.

Prefer the straightest views (NHTSA pre-test photographs are close to square-on). View photographs in the browser; do not store them in the repository.

### 3.2 Plan view and sections

- Trace the plan (top) view for the half-width at each station, the bumper corner radii and the tumblehome of the glasshouse.
- Check at least **10 transverse sections** through the 3D shell (nose, front axle, A-pillar foot, B-pillar, C-pillar, rear axle, tail and between). Each should match the plan half-width at the shoulder and the published width at the widest point. The 992 Cabriolet body used this method.

### 3.3 Overlay

Add the traced curve to `exterior-profiles.js`, registered at the wheel centres, so the workbench can lay the drawing's gold line over the mesh. **Pass condition**, set by what the 996 reached: plan outline within 10 mm everywhere except mirrors and handles; side upper outline median ≤ 10 mm and maximum ≤ 25 mm. Record each exception (line weight, an option the drawing shows) in the legend.

### 3.4 Panels and shut lines

Use the parts plates to split the shell into the real separate panels: bumper covers, wings, bonnet, doors, tailgate or boot lid, sills, roof, and any grille or trim inserts. Shut lines are placed from photographs and must fall on panel boundaries the parts plates confirm. Nothing joins where the car has no seam, and every real seam is present.

### 3.5 Ends and details

`<chassis>-ends.js` carries lamps, grille, intakes, bumper inserts, plate recess, badges and exhausts. These usually come from photographs, so record them as photo estimates (as `bmw-references.md` does for the E46) and name the photographs.

### Feature lines to capture on every car

Wheel-arch shape and its lip; the shoulder (character) line and where it fades; the belt line; the daylight-opening outline including pillar thicknesses; the windscreen rake and A-pillar foot position; the roof crown and its fall to the tailgate; bumper split lines; lamp outlines and how they wrap; the grille opening; the sill line and ground clearance at the sill.

### Body gate

The body is done when: the dimension test passes; the overlay passes; the section checks pass; every panel boundary has a parts-plate source; and `vehicle-drawing-checks.js` has an entry naming the reference, the locator (page and view) and one observable result.

**Overlap survey.** From the first installed systems onward, keep an overlap survey for the vehicle (`tests/<vehicle>-overlap-survey.mjs` with a baseline, as for the G500 and 993). Every crossing pair is either intended (assembly, mount, terminal) or an error, and the survey must stay at **0 errors**.

**Face budgets.** Stay inside the existing budgets: about 22,000 faces in the overview and 10,000 in the engine bay.

---

## Phase 4 · Closures and glazing

- Every opening part moves on its real hinge axis: front and rear doors, bonnet (and active bonnet lift, where fitted), tailgate, fuel flap, charging flap, roof panels.
- Door glass, mirrors and handles move with their door; record what moves with what, as `bmw-references.md` does for the E46.
- Window regulators, latches, check straps and seals come from the parts plates (`door-profiles.js` records the regulator source per vehicle).
- Add the vehicle to `body-visibility.js` so **See through body** works.

---

## Phase 5 · Running gear

- Wheel specs module with the stock wheel (rim width, diameter, offset, tyre) and period-correct optional wheels as selectable options, stock as default.
- Suspension: front and rear axle type, springs, dampers, anti-roll bars, subframes, control arms, hubs and bearings.
- Steering: rack type and assist, column, tie rods.
- Brakes: discs, calipers, pads, parking brake type, lines.
- Record track, wheel radius, rotor radii and caliper count in `road-service-data.js`.

---

## Phase 6 · Powertrain

- `engine-data.js` entry with layout, orientation, cylinders, cam count, valves and plugs per cylinder, and sources. These counts are tested.
- Engine geometry placed on the same crank-axis datum as the gearbox bellhousing (the M54 installation does this).
- Transmission, transfer case or power take-off, propeller shafts, final drives and half-shafts, routed against an underbody photograph.
- Engine mounts, intake, charge air, turbocharger, exhaust manifold.

---

## Phase 7 · Vehicle systems checklist

Each system gets its components placed, named, sourced and selectable. The G500 hub issues use the same groups.

| Group | Systems |
|---|---|
| Body and structure | Body-in-white, crash structures, subframes, underbody panels, sealing, sound insulation |
| Closures and glazing | Doors, bonnet, tailgate, flaps, glass, mirrors, roof systems |
| Lighting | Headlamps, daytime lights, indicators, tail lamps, fog, reversing, number plate, interior |
| Engine | Block, head, valvetrain, timing, lubrication, intake, charge air, ignition, injection |
| Driveline | Gearbox, transfer case or angle drive, shafts, final drives, half-shafts |
| Axles, steering and brakes | Suspension, steering, brakes, wheels and tyres |
| Fuel and exhaust | Tank, pump, lines, evaporative system, catalytic converters, particulate filter, silencers, tailpipes |
| Thermal | Radiators, charge-air cooling, fans, pumps, thermostat, transmission cooling |
| Electrical networks | Batteries, high-current paths, fuses, control units, main harness routes, 48 V or high-voltage systems where fitted |
| Climate | Heater, air conditioning circuit, blower, ducts |
| Cabin and equipment | Seats, dashboard, displays, controls, trim, carpets, cargo area |
| Safety | Airbags, belt tensioners, active bonnet, pedestrian protection |
| Driver assistance | Radar, cameras, ultrasonic sensors and their mounting points |

**Depth:** choose components that teach something about the car, as the G500 work does. Do not pad with generic fasteners. A component earns its place if it has a function a visitor can learn, a real location and a source.

---

## Phase 8 · Studies, catalog and accessories

- **Drill-down studies** for each mechanism that defines the car: its engine's distinctive systems, its drivetrain coupling, anything that moves. Studies reuse the installed meshes.
- **Service catalog:** oil filter, air filter, tyres and similar, each with part number, exact fitment and source. Unpriced lines stay explicitly unpriced.
- **Accessories:** follow the garage rule in the priority hub: things owners of *this* vehicle actually fit, from factory and period catalogues or the established aftermarket, each with part number, exact model and year, and source. Nothing carried over because it suited another car.

---

## Phase 9 · Board, review and release

1. Add the vehicle to `fleet.js` (`ROAD_TYPES`), `priority-vehicles.js`, `priority-review-tracks.js`, `priority-vehicle-assignments.js` and `reference-ledger.js`.
2. Run `node --test tests/*.test.mjs` from the repository root.
3. Open the workbench and check: orbit, expansion, isolation, See through body, Find a component, every closure, every study, every theme.
4. Record the review in the vehicle's hub issue with links to the PR and the verification.
5. Release to `brandon-studio`, following the release procedure in the site project's garage status notes (three-way merge, voice bank merged key by key, downloads rebuilt).

Reserve the hub issue before starting by pushing `priorities/claims/<issue>.json` to the `priority-hub` branch; delete it when done.

---

## Repository touch points

Adding the 2026 HR-V LX touched these files. A new car will touch most of them.

| Area | Files |
|---|---|
| Identity and decisions | `catalog.js`, `fleet.js`, `vehicle-decisions.js`, `vehicle-variants.js` (trim variants only), `collection-filter.js`, `model.js` (presets) |
| Body | `<chassis>-body-profile.js`, `<chassis>-shell.js`, `<chassis>-ends.js`, `exterior-profiles.js`, `exterior-alloys.js`, `body-visibility.js`, `door-profiles.js`, `render.js` |
| Dimensions and checks | `factory-dimensions.js`, `factory-elevations.js`, `vehicle-drawing-checks.js` |
| Systems | `assemblies.js`, `engine-data.js`, `engine-geometry.js`, `piston-study.js`, `installed-part.js`, `road-construction.js`, `road-mechanisms.js`, `road-service-data.js`, `system-index.js` |
| Wheels and accessories | `wheel-designs.js`, `<chassis>-wheel-specs.js`, `accessory-catalog.js`, `accessory-geometry.js` |
| Board | `priority-vehicles.js`, `priority-review-tracks.js`, `priority-vehicle-assignments.js`, `reference-ledger.js` |
| Tests | a dimensions test, a body/closures test, a running-gear test, plus the shared `vehicle-drawing-checks`, `garage-year-matched-sources`, `garage-year-trim-consistency`, `garage-drilldown` and `garage-parts-shelf` tests |

---

## What this does not claim

The meshes stay original explanatory geometry, not manufacturer CAD. The procedure makes them as close to the published evidence as that evidence allows, and makes every remaining estimate visible.
