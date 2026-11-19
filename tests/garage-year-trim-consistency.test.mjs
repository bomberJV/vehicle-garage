import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {getAssemblies} from '../garage/assemblies.js';
import {getServiceStudy} from '../garage/road-service-studies.js';
import {roadSystems} from '../garage/road-service-data.js';
import {wheelOptions} from '../garage/wheel-designs.js';
import {VEHICLES} from '../garage/catalog.js';
import {GarageRenderer} from '../garage/render.js';
import {voiceKey} from '../shared/narration-voice.js';

const bank=JSON.parse(readFileSync(new URL('../shared/listening/garage.json',import.meta.url)));
function strings(value,out=[]){
  if(typeof value==='string')out.push(value);
  else if(Array.isArray(value))value.forEach(v=>strings(v,out));
  else if(value&&typeof value==='object')for(const v of Object.values(value))if(typeof v!=='function')strings(v,out);
  return out;
}

test('the HR-V LX never describes itself as the EX-L',()=>{
  const lines=strings(getAssemblies('hrvlx'));
  const wrong=lines.filter(line=>/\bEX-L\b/.test(line)&&!/shares the EX-L|EX-L AWD parts|LX, Sport|LX and Sport|Sport \/ EX-L/.test(line));
  assert.deepEqual(wrong,[]);
  for(const line of lines.filter(l=>/This LX has AWD|The LX has a fixed roof|HR-V LX has Real Time AWD/.test(l)))assert(bank[voiceKey(line)],line);
  assert.equal(lines.filter(l=>/This LX has AWD|The LX has a fixed roof|HR-V LX has Real Time AWD/.test(l)).length,3);
  assert.match(VEHICLES.hrvlx.source,/hondainfocenter\.com\/2026\//);
});

test('the 1999 Carrera Cabriolet roof is moved by hydraulic cylinders, not the 993 flexible shafts',()=>{
  const roof=getAssemblies('porsche996cab').find(group=>group.id==='roof');
  assert.match(roof.description,/electrohydraulic/);
  const drive=roof.parts.find(part=>part.id==='roof.drive');
  assert.equal(drive.name,'Left and right hydraulic cylinders');
  assert.doesNotMatch(drive.description,/flexible shafts|811-35/);
  const study=getServiceStudy('porsche996cab',roadSystems.porsche996cab,'roof.drive');
  assert.equal(study.name,'Cabriolet roof lift cylinder');
  assert.match(study.description,/^The 996 has one hydraulic cylinder on each side/);
  for(const line of [roof.description,drive.description,study.description])assert(bank[voiceKey(line)],line);
  // The 993 keeps its electric drive; the 992.1 text is unchanged.
  assert.match(getAssemblies('porsche993cab').find(g=>g.id==='roof').parts.find(p=>p.id==='roof.drive').name,/Electric drive/);
  assert.match(getServiceStudy('porsche992scab',roadSystems.porsche992scab,'roof.drive').description,/^The 992\.1 has one hydraulic cylinder/);
  for(const roofPosition of ['up','down']){
    const faces=GarageRenderer.assembledFaces({vehicle:'porsche996cab',parts:[],roofPosition,paint:'silver'}).filter(f=>f.part==='roof.drive');
    assert(faces.length>0);
    // No centre motor: every drive face sits out at one side, inside the body.
    for(const f of faces)for(const p of f.points)assert(Math.abs(p[1])>.45&&Math.abs(p[1])<.70,String(p));
  }
});

test('the 2008 328xi standard wheel uses BMW’s name for Style 156',()=>{
  const [stock]=wheelOptions('bmw328xi');
  assert.equal(stock.name,'Double Spoke 156');
  assert(bank[voiceKey(stock.name)]);
});
