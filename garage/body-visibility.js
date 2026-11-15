export const seeThroughCars=new Set(['g500','bmw325ci','sl550','hrv','c63','porsche993cab','porsche992scab']);

const cabinParts=new Set(['body.front-seats','body.rear-seats','body.rear-bench','body.dashboard','body.console',
  'body.cabin-trim','body.rearview-mirror']);
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
