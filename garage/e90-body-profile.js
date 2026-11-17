// 2008 BMW 328xi sedan (E90, pre-LCI) side elevation and glass outlines.
//
// Frame as for the E46: x forward is negative from the middle of the 2,760-mm
// wheelbase (axles at x = ±1.38), y left is negative, z up with tyre contact at
// z = .040. Overall 4,526 × 1,817 × 1,421 mm (BMW NA and Edmunds 328xi sedan
// data). The heights below were read from the reference photographs listed in
// bmw-references.md (NHTSA's 2006 US 325i and two near-side views of pre- and
// post-facelift E90 sedans, which share the sedan body side) and scaled to those
// overall dimensions; they are estimates, not factory surface data.
//
// stations: [x, half-width at the shoulder, height of the top edge (hood shut line
// ahead of the screen, belt along the doors, deck edge behind the backlight)].
export const e90BodyProfile={
  stations:[[-2.07,.800,.845],[-1.99,.865,.855],[-1.80,.895,.875],[-1.58,.905,.893],[-1.38,.9085,.905],[-1.10,.904,.935],
    [-.93,.901,.956],[-.50,.899,.985],[0,.899,1.000],[.50,.901,1.015],[1.00,.905,1.030],[1.38,.9085,1.045],
    [1.62,.902,1.056],[1.78,.893,1.086],[1.98,.875,1.078],[2.12,.840,1.062],[2.25,.790,1.040]],
  wind:[[-.930,.975],[-.120,1.369]],
  roof:[[-.120,1.369],[0,1.389],[.200,1.402],[.450,1.408],[.700,1.405],[.900,1.395],[1.050,1.377],[1.120,1.363]],
  rear:[[1.120,1.363],[1.760,1.104]],
  // Front door glass: belt at the mirror sail, up the A-pillar, along the roof
  // rail to the B-pillar and back down to the belt.
  frontWindow:[[-.800,.985],[-.560,1.115],[-.320,1.248],[-.110,1.322],[.100,1.342],[.330,1.348],[.345,1.004]],
  rearWindow:[[.415,1.006],[.415,1.346],[.620,1.344],[.820,1.330],[.930,1.300],[.930,1.024]],
  // Fixed quarter light behind the rear door, ending in the Hofmeister kink.
  quarter:[[.965,1.026],[.965,1.292],[1.045,1.262],[1.130,1.214],[1.195,1.150],[1.212,1.092],[1.188,1.042]],
  // Front-door leading edge, B-post seam and rear-door trailing edge at the belt.
  door:[-.870,.375,1.005]
};
