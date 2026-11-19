import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {chassisPackSources,studies as chassisStudies} from '../garage/g500-pack-chassis.js';
import {bodyPackPlates,studies as bodyStudies} from '../garage/g500-pack-body.js';
import {electricalPackSources,studies as electricalStudies} from '../garage/g500-pack-electrical.js';

// The chassis, body and electrical study packs model the 2002 G500 (463.249). A parts plate
// from a later model year stays only when its label says so: it names its own year and
// either what the 2002 plate or a part page shows, or that 2002 fitment is unconfirmed.
const packs={
  'g500-pack-chassis.js':chassisPackSources,
  'g500-pack-body.js':bodyPackPlates,
  'g500-pack-electrical.js':electricalPackSources
};
const plateYear=/(\d{4})-mercedes[_-]benz-g500/;

test('every later-year G500 plate in the chassis, body and electrical packs says why it stays',()=>{
  let later=0;
  const wrong=[];
  for(const [file,sources] of Object.entries(packs)){
    for(const [key,source] of Object.entries(sources)){
      const year=source.url.match(plateYear)?.[1];
      if(!year||year==='2002')continue;
      later++;
      const ok=source.label.includes(year+' G500')&&/later-year/.test(source.label)&&(source.label.includes('2002')||/unconfirmed/.test(source.label));
      if(!ok)wrong.push(file+' '+key+': '+source.label);
    }
    // No later-year G500 plate link sits in the file outside the exported sources.
    const text=readFileSync(new URL('../garage/'+file,import.meta.url),'utf8');
    const inText=[...text.matchAll(/(\d{4})-mercedes[_-]benz-g500/g)].filter(m=>m[1]!=='2002').length;
    const inSources=Object.values(sources).filter(s=>(s.url.match(plateYear)?.[1]??'2002')!=='2002').length;
    assert.equal(inText,inSources,file+': every later-year plate link is an exported source');
  }
  assert.deepEqual(wrong,[]);
  assert.equal(later,21);
});

test('the frame, front-brake and door-glass sources now cite the 2002 G500 plates',()=>{
  const giant='https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/';
  assert.equal(chassisPackSources.framePlate.url,giant+'body-hardware/frame-components');
  assert.equal(chassisPackSources.framePlate.label,'MB Parts Giant · 2002 G500 frame and components diagram');
  assert.equal(chassisPackSources.frontBrakePlate.url,giant+'brakes/front-brakes');
  assert.equal(chassisPackSources.frontBrakePlate.label,'MB Parts Giant · 2002 G500 front brakes diagram');
  assert.equal(bodyPackPlates.doorGlass.url,giant+'body-hardware/glass-door');
  assert.equal(bodyPackPlates.doorGlass.label,'MB Parts Giant · 2002 G500 front and rear door glass and hardware diagrams');
});

test('the switched sources still carry the same parts',()=>{
  const using=(studies,source)=>studies.flatMap(s=>s.groups[0].parts.filter(p=>(p.source||s.source)===source).map(p=>p.id));
  assert.equal(using(chassisStudies,chassisPackSources.framePlate).length,24);
  assert.equal(using(chassisStudies,chassisPackSources.frontBrakePlate).length,5);
  assert.equal(using(bodyStudies,bodyPackPlates.doorGlass).length,5);
  // Later-year plates whose parts the 2002 plates only partly list keep their link.
  assert.equal(using(chassisStudies,chassisPackSources.parkingPlate).length,3);
  assert.match(chassisPackSources.parkingPlate.label,/463-420-05-84.*463-420-06-84-9045 is unconfirmed for 2002/);
  assert.match(chassisPackSources.rearBrakePlate.label,/123-420-50-28-64 and 123-420-65-28-64, which are unconfirmed for 2002/);
  assert.equal(using(electricalStudies,electricalPackSources.ignitionLock).length,3);
});
