import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

// The 2002 G500 (463.249, M113.962) engine, cooling and drivetrain study packs may cite a
// later-year G500 parts plate only when its label names that year and says what is known
// for 2002: either which 2002 plate lists the same numbers, or that 2002 fitment is unconfirmed.
const dir=new URL('../garage/',import.meta.url);
const laterYear=/(?:[/']|oem-)(200[3-9])-mercedes_benz-g500|v-(200[3-9])-mercedes-benz-g500/;
const packs={
  engine:'enginePackSources',
  cooling:'coolingPackSources',
  drivetrain:'drivetrainPackSources'
};

const sourcesOf=async pack=>{
  const m=await import(`../garage/g500-pack-${pack}.js`);
  const all=new Set(Object.values(m[packs[pack]]));
  for(const s of m.studies){
    all.add(s.source);
    for(const p of s.parts??s.groups.flatMap(g=>g.parts))if(p.source)all.add(p.source);
  }
  for(const c of m.claims)all.add(c.source);
  return {m,sources:[...all].filter(Boolean)};
};

test('every later-year G500 plate in the engine, cooling and drivetrain packs says what is known for 2002',async()=>{
  for(const pack of Object.keys(packs)){
    const {sources}=await sourcesOf(pack);
    const later=sources.filter(s=>laterYear.test(s.url));
    const text=readFileSync(new URL(`g500-pack-${pack}.js`,dir),'utf8');
    const inText=[...text.matchAll(new RegExp(laterYear.source,'g'))].length;
    assert.equal(later.length,inText,`${pack}: every later-year plate URL in the file is a pack source`);
    for(const s of later){
      const year=s.url.match(laterYear).slice(1).find(Boolean);
      assert(s.label.includes(`${year} G500`),`${pack}: label names ${year}: ${s.label}`);
      assert.match(s.label,/later-year plate/,`${pack}: ${s.label}`);
      assert.match(s.label,/2002|unconfirmed/,`${pack}: ${s.label}`);
    }
  }
});

test('plates whose 2002 version lists the same numbers now cite the 2002 plate',async()=>{
  const plate2002=/^https:\/\/www\.mbpartsgiant\.com\/parts-list\/2002-mercedes_benz-g500\//;
  const {m:engine}=await sourcesOf('engine');
  const {m:cooling}=await sourcesOf('cooling');
  const {m:drivetrain}=await sourcesOf('drivetrain');
  const switched={
    ignition:[engine.enginePackSources.ignition,'electrical/ignition-system'],
    intake:[engine.enginePackSources.intake,'air-fuel-delivery/air-intake'],
    senders:[engine.enginePackSources.senders,'electrical/senders'],
    supportPlate:[cooling.coolingPackSources.supportPlate,'body-hardware/radiator-support'],
    waterPump2004:[cooling.coolingPackSources.waterPump2004,'belts-cooling/water-pump'],
    radiator2004:[cooling.coolingPackSources.radiator2004,'belts-cooling/radiator-components'],
    frontAxle:[drivetrain.drivetrainPackSources.frontAxle,'driveline-axles/front-axle-shafts-differential']
  };
  for(const [key,[source,group]] of Object.entries(switched)){
    assert.match(source.url,plate2002,key);
    assert(source.url.endsWith(group),key);
    assert.match(source.label,/^MB Parts Giant · 2002 G500 /,key);
  }
  // The claims and parts that relied on the later-year plates still point at the same objects.
  const ids=(claims,source)=>claims.filter(c=>c.source===source).flatMap(c=>c.ids);
  assert(ids(engine.claims,switched.ignition[0]).includes('g500-ignition.coils'));
  assert(ids(engine.claims,switched.intake[0]).includes('g500-intake-air.maf'));
  assert(ids(engine.claims,switched.senders[0]).includes('g500-engine-sensors.oil-level-sensor'));
  assert(ids(cooling.claims,switched.supportPlate[0]).includes('g500-radiator-mounts.upper-tie-bar'));
  assert(ids(cooling.claims,switched.waterPump2004[0]).includes('g500-coolant-pump-parts.gasket'));
  assert(ids(drivetrain.claims,switched.frontAxle[0]).includes('g500-front-axle-parts.companion-flange'));
});

test('later-year plates name the parts whose 2002 fitment differs or is unconfirmed',async()=>{
  const {m:engine}=await sourcesOf('engine');
  const {m:cooling}=await sourcesOf('cooling');
  const e=engine.enginePackSources,c=cooling.coolingPackSources;
  assert.match(e.belts.label,/belt 011-997-97-92 and no idler bolt/);
  assert.match(e.ignition06.label,/lists no spark plug/);
  assert.match(e.intake06.label,/does not list housing 112-140-02-18/);
  assert.match(e.throttle.label,/not gasket 305-997-03-45, whose 2002 fitment is unconfirmed/);
  assert.match(c.radiatorPlate.label,/not side seals 463-987-11-51 and 463-987-12-51/);
  assert.match(c.transCooler2004.label,/not pipes 463-270-03-96 and 463-500-26-72-64/);
  assert.match(c.transCooler2007.label,/lists 220-270-02-96 but not 463-270-02-96 or 463-270-00-96/);
});
