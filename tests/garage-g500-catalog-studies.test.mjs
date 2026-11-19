import test from 'node:test';
import assert from 'node:assert/strict';
import {getDetail} from '../garage/detail-catalog.js';
import {g500CatalogStudies} from '../garage/g500-catalog-studies.js';
import {g500Geometry} from '../garage/g500-geometry-register.js';

const opens={'powertrain.transmission':'g500-transmission','drivetrain.gearbox':'g500-transmission','g500-transmission.gearsets':'planetary','hvac.case':'g500-hvac-module','powertrain.sump':'g500-oil-pan','powertrain.valve-cover':'g500-valve-covers','powertrain.oil-dipstick':'g500-dipstick','powertrain.oil-fill':'g500-oil-filler','g500-fuel-tank.vessel':'g500-tank-fittings','g500-fuel-delivery.pump':'g500-pump-fittings','g500-brake-hydraulics.cylinder':'g500-brake-service','g500-abs-electrical.block':'g500-abs-mounting','g500-front-diff.pinion':'g500-front-pinion','g500-front-diff.carrier':'g500-front-housing'};

test('catalog studies open from their installed or nested parts',()=>{
  for(const [part,id] of Object.entries(opens))assert.equal(getDetail('g500',part)?.id,id,part);
});

test('every catalog-study part is numbered, sourced, drawn and registered with a claim',()=>{
  const g=g500Geometry();let total=0;
  for(const s of g500CatalogStudies){
    const faces={};let cur=null;
    s.draw({tag(id,f){cur=id;f();cur=null;},polygon(){faces[cur]=(faces[cur]||0)+1;},box(){faces[cur]=(faces[cur]||0)+6;}},0);
    for(const p of s.groups[0].parts){
      total++;
      assert.match(p.name,/\d{3}-\d{3}-\d{2}-\d{2}/,p.id);
      assert(faces[p.id]>0,p.id+' draws nothing');
      const row=g.parts.get(p.id);assert(row&&row.claims.length,p.id);
      assert.match((p.source||s.source).url,/mbpartsgiant\.com\/parts-list\/200[28]-mercedes_benz-g500\//,p.id);
    }
  }
  assert(total>=70);
});

test('catalog studies skip parts the register already models',()=>{
  const names=g500CatalogStudies.flatMap(s=>s.groups[0].parts.map(p=>p.name)).join(' ');
  for(const dup of ['463-470-08-01','000-470-78-94','002-477-30-01','463-542-08-17','163-542-05-18','006-430-01-01','005-430-09-30','004-431-49-12','463-545-23-32','209-830-01-62','203-830-01-61','203-820-25-14','230-830-01-84','000-980-19-02','463-330-00-54'])assert(!names.includes(dup),dup);
});

test('the G500 transmission study replaces the shared bench only on the G500',()=>{
  assert.equal(getDetail('c63','powertrain.transmission').id,'planetary');
  const t=getDetail('g500','powertrain.transmission');
  assert(t.componentIndex.has('g500-transmission.converter'));
  assert.equal(getDetail('g500','g500-transmission.gearsets').id,'planetary');
  const g=g500Geometry();for(const id of ['planetary.sun','planetary.carrier'])assert(g.parts.has(id),id);
});
