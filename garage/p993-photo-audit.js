// Photo audit of the 1998 US 911 Carrera Cabriolet (993), hub #232.
//
// Three side-on references were measured on 2026-11-18. Heights and lengths
// in the photographs are taken against local scales, not one picture-wide
// scale: both photographs show the tyres about 7% smaller than the wheelbase
// implies, a wide-angle effect.
// - Wheel-arch heights are ratios to the tyre radius at the same wheel.
// - Positions along the car are fractions of the wheelbase.
// - Heights on the door use the wheelbase scale.
// tests/garage-p993-photo-audit.test.mjs checks the model against them.
export const photoReferences={
  bat98:{label:'Bring a Trailer · 1998 Carrera Cabriolet, Arctic Silver, left side, camera at belt height (the model’s photo reference)',url:'https://bringatrailer.com/listing/1998-porsche-911-carrera-cabriolet-48/'},
  bat96:{label:'Bring a Trailer · 1996 Carrera Cabriolet, Polar Silver, right side',url:'https://bringatrailer.com/listing/1996-porsche-911-carrera-cabriolet-17/'},
  rescue:{label:'Porsche Classic rescue sheet · 993 Cabriolet side view (orthographic drawing, PDF p. 32)',url:'https://files.porsche.com/f/332100/e5c1d1c36c/rescue-data-sheets-classic.pdf#page=32'}
};
// Each landmark lists one value per reference. x is metres in model
// coordinates (front axle −1.160, rear axle 1.112); heights are metres above
// the ground.
export const photoLandmarks={
  frontArch:{what:'Front wheel-arch lip apex above the wheel centre, in tyre radii',values:{bat98:1.276,bat96:1.31,rescue:1.19},slack:.02},
  rearArch:{what:'Rear wheel-arch lip apex above the wheel centre, in tyre radii',values:{bat98:1.19,bat96:1.19,rescue:1.14},slack:.02},
  belt:{what:'Door top (belt) above the ground at mid-door',values:{bat98:.842,bat96:.844,rescue:.839},slack:.02},
  doorFront:{what:'Front shut line of the door',values:{bat98:-.640,rescue:-.635},slack:.025},
  doorRear:{what:'Rear shut line of the door',values:{bat98:.540,rescue:.562},slack:.025},
  handle:{what:'Centre of the door pull handle',values:{bat98:.387,bat96:.392,rescue:.394},slack:.02}
};
// Findings from the audit and what was done with each.
export const photoFindings=[
  {item:'Wheel arches',found:'The arch lips sat 38 mm above the tyres front and rear. Both photographs show about 85 mm at the front and 55 mm at the rear. The rescue sheet shows the same front-high rake with smaller drawn tyres.',action:'Raised the arch apex by 46 mm at the front and 16 mm at the rear. The opening keeps its width.'},
  {item:'Door handle',found:'The handle centre was 35 mm ahead of its position in all three references.',action:'Moved it back to 145 mm ahead of the rear shut line.'},
  {item:'Rear lid',found:'In elevated renders the grille and the brake-light bridge rise above the deck line. Low photographs hide the lid top. The rear three-quarter photographs show the same fixed bridge across the front of the louvred grille.',action:'Kept as modelled.'},
  {item:'Dimensions',found:'The model’s 4,260 mm length and 1,315 mm closed-roof height are the North American figures. The European 4,245 and 1,300 mm figures are 15 mm smaller.',action:'The dimensions test now checks the US figures exactly.'},
  {item:'Wheels',found:'Both photographed cars run optional 17-inch Cup II wheels.',action:'Kept the standard 16-inch Cup design wheels and tyres from Porsche TI 4/4440.'}
];
export const referenceRange=key=>{const v=Object.values(photoLandmarks[key].values),s=photoLandmarks[key].slack;return [Math.min(...v)-s,Math.max(...v)+s];};
