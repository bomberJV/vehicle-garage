# The Garage

A land, air and sea inspection workbench by Brandon Frank Han-Chween Huang. The workbench uses HTML, CSS, ES modules and an original 3D renderer with GPU and software depth buffers. The downloadable edition includes its on-device neural narrator. No API key is required.

## Detailed engine bays

The engine inspector divides each configured engine into systems and individual component types. Select a system to open its parts, select a component to highlight it, and follow its connection buttons to related parts. The engine-specific lists distinguish the M113 twin-spark SOHC V8, M54 Double VANOS inline-six, M156 DOHC V8, and US HR-V transverse four-cylinder/CVT. Cylinder, cam, valve and plug counts are encoded and tested. Location descriptions, quantities and source diagrams accompany the geometry. Individual-component isolation and expanded system views use the same meshes as the whole bay. The Ford engine remains unassigned until its actual configuration is known.

## Assembly inspection

Click a surface to select the part in place. The camera eases toward it. On the 2002 G500, 2003 325Ci, C63, HR-V and both 911 Cabriolets, the engine stays installed behind the solid exterior. Turn on See through body to inspect it through the panels. The workbench remembers this choice separately for each vehicle. Use the sidebar to choose an assembly or open a study. Deselect or Escape clears the selection. Return view restores the framing. Drag a part in either the assembled or the expanded view, or use the four move buttons. Drag the background to orbit. Return part retraces the selected piece’s movements. Return all restores the pieces in reverse order. Expand starts at Compact, 18% of full separation. Move the Part separation slider between 5% and Full to change the spacing. Reassemble retraces the route. The camera keeps its angle when you change assemblies.

Double-click or double-tap a part to inspect it. The equivalent Open button appears beside the selected component when a deeper study is available. The path above the parts list takes you back through the levels. A copied address reopens the same study. Play motion runs supported mechanisms, including the HR-V belt variator and the moving piston and rod. Speaker buttons beside explanations read them aloud.

The 911 family has a Year and trim selector for the 1998 Carrera Cabriolet and 2023 Carrera S Cabriolet. Each keeps its own build and link. The full collection and the vehicle type menu each include All. Select All in the environment row to restore the whole collection, or use the type menu to show every vehicle in the current environment.

The G500 layout follows the Mercedes-Benz references in `assemblies.js`, including rigid axles, a separate frame and coil springs. Other vehicles use the architecture and limits described in that same file. The drawing is a simplified inspection schematic, not manufacturer CAD or a repair procedure.

## Customizing the G500 and the 911 Cabriolets

Open **Customize → Accessories** to fit a brush guard, ladder, raised intake, auxiliary lamps or a red-and-blue display. **Fitment and sources** opens the drawings and supplier information for that choice. Fitted equipment appears in **Inspect → Installed accessories**. The G500’s listed equipment can go on the shopping list. Design mock-ups stay with the saved model and carry no purchase price.

The **Suspension lift** selector sits above the accessory cards. Use **Factory height** to return to stock. Both 911s have **Top up** and **Top down** controls. The 2023 model also lets you compare its optional front-axle lift with a four-wheel height study. Saved builds and exported JSON retain these settings.

Open a Porsche engine to see the complete flat-six. **Fit engine in view** centers and enlarges it while keeping your viewing angle. **Show engine cutaway** removes the near bank to expose the crankshaft. **Show complete engine** restores the removed bank.

## 2014 Mercedes-Benz SL550

Under **Customize → Roadster comfort**, choose the driver or passenger to set AIRSCARF, seat heating, ventilation and the backrest massage program independently. **Inside AIRSCARF** opens the blower, heater, duct and head-restraint outlet. In the massage view, choose **Play motion** to follow the pressure wave. **Top up** and **Top down** move the windows, luggage lid and hardtop through the folding sequence.

The US Sport Wheel and Driver Assistance packages, Active Body Control, MAGIC SKY CONTROL and BeoSound equipment describe a representative build. The **References** tab links the equipment chart, dimensioned R231 drawings and parts plates. Concealed routes and travel between published roof positions are reconstructed.

## Finding a mechanism

The **Systems** tab lists every assembly and links directly to the available component studies. The [project priorities](priorities.html) list the source and remaining work for each model. Use **Find a component in this vehicle** to jump from a whole vehicle to a hinge pin, fan, cylinder or carpet edge. A chevron in the parts list marks components that open another level. Cross-section lets you choose an axis, move the cut and inspect either side. On an animated view the cycle slider holds the mechanism at any point in its travel.

The 1998 and 2023 Porsche Cabriolets have different spoiler assemblies. The 993 moves its grille with the spoiler. The 992 raises a painted blade behind the engine grating. Civil aircraft have distinct propeller and turbofan studies. Each marine exhibit has an explorable propulsion system. The Saturn V stack leads to Endeavour’s crew compartment, while the lunar module has its own cabin and environmental equipment. Sources are attached to the applicable components.

## What works

- Orbit, elevation, zoom, and assembly inspection across the collection. The G500, F-350 XLT, C63 AMG, HR-V, 325Ci, two 911 Cabriolets and S 1000 RR also have road-vehicle build sheets.
- Seven paint presets, a full RGB picker, hex entry and named colors saved in this browser. The Customize tab previews sourced wheel faces and compatible accessories on the cars, pickup and S 1000 RR. Choosing a replacement wheel adds a set to the build sheet for a quote. References identifies the evidence behind each vehicle, from museum photographs to factory exploded plates and public 3D assets.
- Pointer/touch dragging, keyboard views, clickable part hotspots, explicit viewpoint buttons, and optional rotation.
- Curated parts and services link to the relevant supplier. Each entry identifies whether the link is a product page, vehicle search, catalog or request for a quote.
- Vehicle-specific product filtering; mutually exclusive tire sets; prices multiplied by explicit quantities.
- Dated source-price snapshots and user-entered **full-line totals**, with unpriced lines explicitly excluded and labeled incomplete. Separate labor/other and paint/wrap allowances.
- Vehicle-specific workbenches, four saved builds for comparison, notes, JSON import/export, text shopping lists and concept PNG downloads.
- Responsive layout, reduced-motion-friendly defaults, keyboard controls, bounded imports, validated state and browser-local persistence.

## Narration

The speaker beside a passage reads it with Bruno, an American male neural voice. Frequently used labels and introductions play immediately. On its first uncached passage, the browser loads the voice model and generates the audio on the device. Click the speaker again to stop. The standalone download includes the voice model, runtime and phonemizer. A browser with WebAssembly and module workers can read new passages offline from a local HTTP server.

## Run

Serve the extracted project root with `python3 -m http.server 8000`, then open `/garage/`. The source bundle includes the shared styles. ES modules require HTTP; do not open HTML using `file://`.

Run the included tests with `node --test tests/garage*.test.mjs`. They cover cost multiplication, quote replacement, explicitly missing prices, exclusive tire choices, vehicle compatibility filtering, import validation and bounded state, round trips, and export provenance. The repository-wide test file additionally uses the original Site-relative module paths before packaging.

## The drawing is a concept

The models are original low-polygon procedural illustrations, not licensed manufacturer CAD. Their numeric mesh dimensions are drawing parameters and are **not a verified vehicle specification database**. Do not use the geometry for clearance, wheel fitment, installation, structural loads or mechanical engineering. No lift kit, wheel offset or performance tuning is prescribed. Color/finish previews do not silently add products or prices.

The Ford illustration assumes a regular cab and long bed. Engine, tire dimensions, single/dual rear wheels and other configuration details have not been supplied, so exact fitment-dependent purchases remain sourcing tasks. The drawing shows a single-rear-wheel truck; it does not assert the user's eventual truck configuration.

## Supplier data

See [SOURCES.md](SOURCES.md). Prices are USD snapshots from primary retailer/manufacturer sources consulted on November 13, 2026; indexed pages can themselves have older crawl dates. This is not an automatically refreshed price, availability or fitment feed. Every price can be replaced by a user's own complete-line quote. Opening the supplier is necessary to check current price and stock.

A listed part is not a completed VIN compatibility check. The G500 rack has a documented sunroof tilt/vent restriction. C63 oil-filter fitment is explicitly VIN-specific on the retailer's page. A four-tire set does not include a spare. Taxes, shipping, fitting, engine oil and other unlisted materials are not included unless entered into an allowance.

Nothing is purchased by this app. External links open supplier pages; no affiliate tracking is added. No location, VIN, personal data or browsing activity is sent to a backend. LocalStorage is browser-local, not cloud sync. Export JSON for a portable backup.

## Files

- `catalog.js`: vehicle concepts, curated part catalog and traceable URLs.
- `model.js`: pure validated state and accounting functions.
- `render.js`: original low-polygon geometry and Canvas projection.
- `app.js`: interaction, safe DOM construction, saved plans and file exports.
- `app.css` / `index.html`: responsive interface.
- `SOURCES.md`: evidence and pricing scope.
- [`NEW-VEHICLE.md`](NEW-VEHICLE.md): the procedure for adding any vehicle, from the variant decision to release. Current plans: [2026 X3 30 xDrive](bmw-x3-g45-plan.md), [2018 X1 xDrive28i](bmw-x1-f48-plan.md).

No redistribution license has been selected for the application source. The shared font retains its existing license.

## Land, air and sea collections

Use the environment buttons and vehicle type menu to browse models. The selected vehicle has a shareable URL. The top camera shows deck arrangements, wings and open cockpits. Model notes identify the configuration and link to museum, manufacturer or operator records. Dates on historic exhibits can refer to a mission, a vessel or a preserved example, as identified in its notes.

The 911 Cabriolets and S 1000 RR have build sheets and supplier catalogs alongside the original road vehicles. Flight, maritime and tracked exhibits support orbit, selection, expansion and isolation. Aircraft outlines, hull fittings and spacecraft stages are modeled for visual inspection.
