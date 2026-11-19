# Plan · 2018 BMW X1 xDrive28i (F48)

Built with the [new-vehicle procedure](NEW-VEHICLE.md). Status: **planning**. Nothing below is modelled yet.

## Phase 0 · Proposed decision

| Item | Proposed | Basis |
|---|---|---|
| Market and year | US, model year 2018 | Requested |
| Model | X1 xDrive28i, chassis F48, pre-facelift | The 2018 US X1 came as the front-drive sDrive28i or the all-wheel-drive xDrive28i ([BMW US technical data](https://press.bmwgroup.com/usa/article/attachment/T0220582EN_US/391953)). The facelifted F48 arrived for model year 2020, so 2018 is the original body |
| Engine | B46A20O0, 1,998 cc four-cylinder turbo, transverse, 228 hp at 5,000–6,000 rpm, 258 lb-ft at 1,450–4,500 rpm, bore × stroke 82 × 94.6 mm, compression 10.2:1 | BMW US technical data |
| Gearbox | Aisin 8-speed automatic. Ratios 5.250 / 3.029 / 1.950 / 1.457 / 1.221 / 1.000 / 0.809 / 0.673, reverse 4.015, final drive 3.2 | BMW US technical data |
| Drive | xDrive: front-wheel-drive based, with a transfer case at the gearbox feeding a propeller shaft to a rear axle drive | BMW's [F48 Powertrain training manual (ST1508)](https://archive.org/download/BMWTechnicalTrainingDocuments/ST1508%20F48%20Complete%20Vehicle/03_F48%20Powertrain.pdf); F48 transfer-case seal [27108681581](https://www.bimmerworld.com/Driveline-Shifter/Differentials-Accessories/Rear-Output-Seal-Kit-for-Transfer-Case-F44-F48-F39-U11-U10.html); F48 xDrive28i rear axle drive [33108692602, superseded by 33109470035](https://www.bmwpartsdeal.com/oem-2019-bmw-x1-differential.html) |
| Wheels | 7.5J × 18 alloys, 225/50 R18 95V all-season | BMW US technical data |
| Steering | Electric, overall ratio 16:1 | BMW US technical data |
| Body package | **Decide: standard or M Sport.** Confirm which lines the 2018 US car offered before tracing bumpers | |
| Lighting | **Decide.** IIHS rates the 2018 X1 with LED projector low and high beams on cars with the Premium and Driver Assistance Plus packages, so the headlamp type depends on options | [IIHS 2018 X1](https://www.iihs.org/ratings/vehicle/bmw/x1-4-door-suv/2018) |
| Other options | **Decide:** panoramic roof, roof rails, trailer hitch | |

**Recommendation:** xDrive28i rather than sDrive28i. It is the car NHTSA crash-tested head-on (so the photographs match it), and its transfer case, propeller shaft and rear axle drive give the most systems to explore. Keep the stock 18-inch wheel as default.

## Phase 2 · Hard numbers

From the [BMW US technical data](https://press.bmwgroup.com/usa/article/attachment/T0220582EN_US/391953) unless noted.

| Span | Value |
|---|---|
| Length | 175.4 in (4,455 mm) |
| Width without mirrors | 71.7 in (1,821 mm) |
| Width with mirrors | 81.1 in (2,060 mm) |
| Height | 62.9 in (1,598 mm); BMW's [F48 introduction training manual](https://archive.org/download/BMWTechnicalTrainingDocuments/ST1508%20F48%20Complete%20Vehicle/01_F48%20Introduction.pdf) also gives 1,598 mm |
| Wheelbase | 105.1 in (2,670 mm) |
| Front / rear overhang | 33.8 / 36.5 in (859 / 927 mm) |
| Track, front / rear | 61.5 / 61.6 in (1,562 / 1,565 mm) |
| Ground clearance | 7.2 in (183 mm) |
| Turning circle | 37.4 ft |
| Kerb weight | 3,697 lb (xDrive28i) |
| Drag | Cx 0.32, frontal area 2.46 m² |

**Closure check:** 33.8 + 105.1 + 36.5 = 175.4 in. The overhangs close with the published length.

**Conflicts to resolve before modelling:**

- **Length.** The US figure is 4,455 mm; European sources give about 4,439–4,440 mm. A difference of this size usually comes from US bumpers or number-plate mounting. Use the US figure for the US car, and check which bumper the rescue sheet shows.
- **Height.** BMW gives 1,598 mm; other sources list 1,612–1,613 mm. Find out whether the larger figure includes roof rails or the aerial before setting the roof line.

**Wheel radius:** (18 × 25.4 / 2 + 225 × 0.50) / 1000 = 0.3411 m.

**Frame:** axles at x = ∓1.335 m; stock tyre contact z = 0.040.

## Phase 1 · Reference pack

| Class | Reference | Use |
|---|---|---|
| Orthographic outline | BMW F48 rescue sheet from BMW's rescue portal ([aos.bmwgroup.com/service](https://aos.bmwgroup.com/service), per BMW's [emergency response guide](https://www.bmw.ca/content/dam/bmw/marketCA/bmw_ca/2026-rescue-cards/Response_guide_for_emergency_crews_1.7_en_GB-1.pdf.coredownload.pdf)); **locate and record its document code** | Side and plan silhouettes, reinforcement zones, battery, tank |
| Factory dimension drawing | F48 introduction training manual: outer-dimension drawing and silhouette comparison with the E84 | Second orthographic reference; confirms height and proportions |
| Test-programme photographs | NHTSA NCAP: [frontal report, 2018 X1 xDrive28i, M20184100](https://nrd-static.nhtsa.dot.gov/reports/vehdb/v10000/v10100/v10174R001.pdf); [side MDB report, 2018 X1 sDrive28i, M20184102](https://nrd-static.nhtsa.dot.gov/reports/vehdb/v10000/v10100/v10176R001.pdf) | Pre-test photographs of US production cars of the exact model year; the side-test car is front-drive but has the same body |
| Technical training | BMW ST1508 F48 manuals: Introduction, Powertrain, General Vehicle Electronics | Layout of the transverse powertrain, xDrive, electrical system |
| Parts plates | BMW parts catalogue (dealer mirrors) for the 2018 F48 xDrive28i | Panel splits, hinges, latches, component names and numbers |
| Safety | [Euro NCAP X1/X2, 2015](https://www.euroncap.com/nl/results/bmw/x1-/-x2/30140): the X1 has a pop-up bonnet raised by actuators when bumper sensors detect a pedestrian | **Confirm US fitment** before modelling the actuators |
| Owner photographs | Wikimedia Commons and original-owner listings of 2016–2019 US X1s | Lamp graphics, grille, badges. **Reject 2020–2022 facelift photographs** |

## Phase 3 · Body: what to get right

- **Proportions:** 2,670 mm wheelbase on a front-drive base, so expect a shorter front axle-to-windscreen distance than on the rear-drive BMWs in the garage. Register at the wheel centres and let the rescue sheet and training drawing set the windscreen position.
- **Pre-facelift details:** kidney grille, headlamps, front bumper intakes and tail lamps of the 2016–2019 car.
- **Glasshouse:** front door, rear door and quarter glass outlines; Hofmeister kink; D-pillar.
- **Bumpers:** traced for the decided package only.
- **Sections:** at least ten, checked against the 1,821 mm width and the plan view.
- **Panels:** bumper covers, wings, bonnet, four doors, tailgate, sills, roof, panoramic roof if chosen.

## Systems to add

| Group | Components to place first | Source to use |
|---|---|---|
| Engine | B46 block, head, valvetrain, timing chain, turbocharger, intake, charge-air cooler, injectors, oil system, mounted transversely | Shared four-cylinder module (below); ST1508 manuals |
| Driveline | Aisin 8-speed, transfer case, propeller shaft, rear axle drive with its coupling, four half-shafts | ST1508 Powertrain manual; parts plates; NCAP underbody photographs |
| Axles, steering, brakes | Front and rear axles, anti-roll bars, subframes, electric steering rack (16:1), discs and calipers | Parts plates |
| Fuel and exhaust | Tank (16.1 gal), pump, lines, canister, catalytic converter, silencers, tailpipes | BMW US data; parts plates |
| Thermal | Radiator, charge-air cooling, fan, pumps | Parts plates |
| Electrical | 12 V battery (80 Ah), power distribution, control units, harness trunks | BMW US data; ST1508 General Vehicle Electronics |
| Climate | Heater, evaporator, blower, compressor, condenser | Parts plates |
| Cabin | Dashboard and central display, seats, trim, cargo floor | Owner photographs; parts plates |
| Safety | Airbags, belt tensioners, pop-up bonnet if US-fitted | Rescue sheet; Euro NCAP |
| Driver assistance | Windscreen camera and sensors for the decided packages | Parts plates |

## Studies

1. xDrive on a front-drive car: how the transfer case and rear axle drive send torque rearward when needed.
2. Aisin 8-speed in a transverse installation, with the gear ratios above.
3. B46 valvetrain and VANOS (shared with the X3).

## Shared work with the X3

The X1's B46 and the X3's B48 share the 82 × 94.6 mm bore and stroke and the same four-cylinder architecture. Build one four-cylinder engine module with two installations:

| | 2018 X1 xDrive28i | 2026 X3 30 xDrive |
|---|---|---|
| Orientation | Transverse | Longitudinal |
| Gearbox | Aisin 8-speed | 8-speed automatic |
| All-wheel drive | Transfer case and rear axle drive on a front-drive base | xDrive transfer case on a rear-drive base |
| Hybrid | None | 48 V belt starter-generator |

This halves the engine work and gives the garage a direct comparison of the two xDrive layouts.

## Catalog and accessories

Oil filter, air filter and 225/50 R18 tyres. BMW genuine roof bars, floor liners, cargo liner and period-correct optional wheels. Each line needs a part number, the exact model and year it fits, and a source.

## Open decisions for Brandon

1. xDrive28i (recommended) or sDrive28i?
2. Standard body or M Sport?
3. LED headlamps, panoramic roof, roof rails, hitch: fitted or not?
