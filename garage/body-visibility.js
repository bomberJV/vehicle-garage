export const seeThroughCars=new Set(['g500','bmw325ci','bmw328xi','sl550','hrv','hrvlx','c63','f350','porsche993cab','porsche992scab','porsche996cab']);

const cabinParts=new Set(['body.front-seats','body.rear-seats','body.rear-bench','body.dashboard','body.console',
  'body.cabin-trim','body.rearview-mirror','body.instrument-panel','body.cluster-trim','body.grab-handle','body.steering-wheel',
  'body.center-console','body.selector-lever','body.console-lid','body.console-trim-plate','body.shift-panel','body.shift-knob',
  'body.glove-box','body.glove-box-lock-cap','body.glove-box-lamp','body.lower-cover-left','body.lower-cover-right','body.column-cover','body.dash-speakers','body.dash-speaker-covers',
  'body.rear-bench-back-left','body.rear-bench-back-right','body.rear-bench-cushion-left','body.rear-bench-cushion-right',
  'body.rear-bench-pad-left','body.rear-bench-pad-right','body.rear-bench-headrests',
  ...['front-belt-retractor-left','front-belt-retractor-right','belt-adjusters-front','belt-adjust-covers','belt-lower-covers','front-belt-buckles',
   'rear-belt-left','rear-belt-right','belt-adjusters-rear','rear-belt-bracket-left','rear-belt-bracket-right','rear-belt-buckles','rear-center-belt',
   'driver-airbag','clockspring','passenger-airbag','headlamp-switch','combination-switch','cruise-switch','door-jamb-switches','back-door-jamb-switch'].map(k=>'body.'+k)]);
const slRoofSkin=new Set(['roof.windshield','roof.sky-glass','roof.rear-glass','roof.pillars','roof.door-glass','roof.quarter-glass']);
export function bodyVisibility(faces,selection){
  return faces.map(face=>{
    const id=face.part||'';
    const skin=id.startsWith('shell.')&&id!=='shell.spoiler-drive'
      ||id.startsWith('body.')&&!cabinParts.has(id)&&face.rigid?.name!=='passenger-compartment'
      ||slRoofSkin.has(id)||id==='cabin.windshield'||id==='cabin.top'||id==='roof.panel'||id==='roof.glass'||id==='roof.fabric'||id==='roof.rear-window'||id==='roof.compartment-lid'
      ||id.startsWith('lighting.')||id.startsWith('lights.');
    if(!skin)return face;
    // Inner hardware is picked through the pale shell. A highlighted panel
    // can still be inspected or moved directly from the component list.
    return {...face,ghostShell:true,opacity:Math.min(face.opacity??1,face.highlighted ? .35 : .12),
      pickThrough:!(face.highlighted&&id===selection)};
  });
}
