import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {shellPackPlates,studies as shellStudies,claims as shellClaims} from '../garage/g500-pack-shell.js';
import {trimPackPlates,studies as trimStudies,claims as trimClaims} from '../garage/g500-pack-trim.js';

// The shell and trim study packs model the 2002 G500 (463.249). A parts plate from a later
// model year stays only when its label says so: it names its own year and either what a 2002
// plate or part page shows, or that 2002 fitment is unconfirmed.
const packs={
  'g500-pack-shell.js':shellPackPlates,
  'g500-pack-trim.js':trimPackPlates
};
const plateYear=/(\d{4})-mercedes[_-]benz-g500/;
const plate2002='https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/';

test('every later-year G500 plate in the shell and trim packs says why it stays',()=>{
  let later=0;
  const wrong=[];
  for(const [file,plates] of Object.entries(packs)){
    for(const [key,source] of Object.entries(plates)){
      const year=source.url.match(plateYear)?.[1];
      assert(year,file+' '+key+': plate URL names a model year');
      if(year==='2002')continue;
      later++;
      const ok=source.label.includes(year+' G500')&&/later-year plate/.test(source.label)&&(/2002/.test(source.label)||/unconfirmed/.test(source.label));
      if(!ok)wrong.push(file+' '+key+': '+source.label);
    }
    // No hard-coded later-year G500 plate link sits in the file outside the plate helper.
    const text=readFileSync(new URL('../garage/'+file,import.meta.url),'utf8');
    assert.equal([...text.matchAll(/(200[3-9])-mercedes[_-]benz-g500/g)].length,0,file+': later-year links come only from the plate table');
  }
  assert.deepEqual(wrong,[]);
  assert.equal(later,13);
});

test('plates whose 2002 version lists the pack’s numbers now cite the 2002 plate',()=>{
  const switched=[
    [shellPackPlates.rearBody,'body-hardware/rear-body','rear body'],
    [shellPackPlates.quarterInner,'body-hardware/inner-structure-quarter-panel','quarter panel inner structure'],
    [shellPackPlates.fuelDoor,'body-hardware/fuel-door','fuel door'],
    [shellPackPlates.frame,'body-hardware/frame-components','frame and components'],
    [trimPackPlates.ducts,'body-hardware/ducts','ducts'],
    [trimPackPlates.tracks,'body-hardware/tracks-components','seat tracks and components'],
    [trimPackPlates.fuel,'air-fuel-delivery/fuel-supply','fuel supply']
  ];
  for(const [source,path,label] of switched){
    assert.equal(source.url,plate2002+path);
    assert(source.label.startsWith('MB Parts Giant · 2002 G500 '+label+' diagram'),source.label);
  }
  // The two 2002 plates that leave out one part the study cites say so.
  assert.match(shellPackPlates.frame.label,/does not list engine under cover 463-520-05-42, so its 2002 fitment is unconfirmed/);
  assert.match(trimPackPlates.ducts.label,/does not list footwell ducts 463-831-80-45 and 463-831-79-45, so their 2002 fitment is unconfirmed/);
});

test('the switched plates still carry the same parts, and their facts name 2002',()=>{
  const using=(studies,source)=>studies.flatMap(s=>s.groups[0].parts.filter(p=>(p.source||s.source)===source).map(p=>p.id));
  const counts=[
    [shellStudies,shellPackPlates.rearBody,8],[shellStudies,shellPackPlates.quarterInner,5],[shellStudies,shellPackPlates.fuelDoor,9],
    [shellStudies,shellPackPlates.frame,8],[trimStudies,trimPackPlates.ducts,17],[trimStudies,trimPackPlates.tracks,9],[trimStudies,trimPackPlates.fuel,10]
  ];
  for(const [studies,source,n] of counts)assert.equal(using(studies,source).length,n,source.label);
  // The claim from the study whose default source is this plate.
  const factOf=(claims,source)=>{const s=[...shellStudies,...trimStudies].find(s=>s.source===source);return claims.find(c=>c.source===source&&c.ids[0].startsWith(s.id+'.')).fact;};
  assert.match(factOf(shellClaims,shellPackPlates.rearBody),/^The 2002 G500 rear body diagram lists/);
  assert.match(factOf(shellClaims,shellPackPlates.quarterInner),/^The 2002 G500 quarter panel inner structure diagram lists/);
  assert.match(factOf(shellClaims,shellPackPlates.fuelDoor),/^The 2002 G500 fuel door diagram lists/);
  assert.match(factOf(shellClaims,shellPackPlates.frame),/^The 2002 G500 frame and components diagram lists .* The 2003 G500 splash shields diagram lists/);
  assert.match(factOf(trimClaims,trimPackPlates.ducts),/^The 2002 G500 ducts diagram lists .* The 2003 G500 ignition lock and lower dash diagram lists/);
  assert.match(factOf(trimClaims,trimPackPlates.tracks),/^The 2002 G500 seat tracks and components diagram lists/);
  assert.match(factOf(trimClaims,trimPackPlates.fuel),/^The 2002 G500 fuel supply diagram lists/);
  // Facts about plates that stay on 2003 keep their year.
  assert.match(factOf(shellClaims,shellPackPlates.roof),/^The 2003 G500 roof and components diagram lists/);
  assert.match(factOf(trimClaims,trimPackPlates.wheelTrim),/^The 2003 G500 steering wheel and trim diagram lists/);
});

test('later-year trim plates name the part pages that give 2002 fitment',()=>{
  assert.match(trimPackPlates.wheelTrim.label,/ring 463-461-00-65, lock sensor 002-542-19-18 and horn button 463-821-01-51 2002–2003 G500 fitment/);
  assert.match(trimPackPlates.column.label,/upper cover 203-462-07-23-9B51 2002–2003 and lower cover 203-460-01-95-9B51 2002–2005 G500 fitment/);
  assert.match(trimPackPlates.wheel.label,/shroud 000-462-17-23-9B51 2002–2005 G500 fitment/);
  assert.match(trimPackPlates.dashLower.label,/cylinder 210-689-00-01 2002 G500 fitment/);
});
