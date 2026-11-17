import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {VEHICLES} from '../garage/catalog.js';
import {accessoriesFor} from '../garage/accessory-catalog.js';
import {getComponent,getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {getVehicleReferences} from '../garage/reference-ledger.js';
import {vehiclePriorities} from '../garage/priority-vehicles.js';
import {requestSections} from '../garage/priority-requests.js';
import {matches,statusValue} from '../garage/priority-board.js';

const items=requestSections.flatMap(s=>s.items);
const base='https://offline.example/extracted/garage/priorities.html';
const directory=new URL('../garage/',import.meta.url);

test('every vehicle has a variant-specific next check, the first reference from the ledger and three real destinations',()=>{
  assert.deepEqual(vehiclePriorities.map(v=>v.id).sort(),Object.keys(VEHICLES).sort());
  assert.equal(vehiclePriorities.length,39);
  for(const id of ['porsche993cab','porsche992scab']){
    const v=vehiclePriorities.find(row=>row.id===id);
    assert(v.evidence.some(row=>row.label.includes('Cabriolet outline')));
  }
  assert.equal(vehiclePriorities.find(row=>row.id==='g500').evidence.length,5);
  assert.equal(new Set(vehiclePriorities.map(v=>v.next)).size,vehiclePriorities.length);
  for(const v of vehiclePriorities){
    assert.equal(v.name,VEHICLES[v.id].name);
    assert.equal(v.year,VEHICLES[v.id].year);
    assert.equal(v.status,'partial');
    assert.deepEqual(v.source,getVehicleReferences(v.id)[0]);
    assert(v.source.scope&&v.source.variant);
    const urls=v.links.map(l=>new URL(l.url,base));
    assert(urls.every(url=>url.pathname==='/extracted/garage/index.html'&&url.searchParams.get('vehicle')===v.id),v.id);
    assert.deepEqual(urls.map(url=>url.searchParams.get('tool')),[null,'systems','references']);
    assert(urls.every(url=>url.hash==='#workbench'));
    assert(getDetail(v.id,urls[0].searchParams.get('open')),v.id);
  }
});

test('each request has a distinct heading and an ordered, reachable destination in the portable project',()=>{
  assert.equal(new Set(items.map(r=>r.id)).size,items.length);
  assert.equal(new Set(items.map(r=>r.title)).size,items.length);
  assert.deepEqual(new Set(items.map(r=>r.status)),new Set(['shipped','partial','open']));
  const names=new Set(requestSections.map(s=>s.name));
  assert.equal(names.size,requestSections.length);
  for(const item of [...items,...vehiclePriorities]){
    for(const l of item.links){
      assert(l.label);
      const url=new URL(l.url,base);
      if(url.host!=='offline.example'){
        assert.equal(url.protocol,'https:');
        continue;
      }
      if(url.pathname.endsWith('priorities.html')){assert.equal(url.hash,'#vehicles');continue;}
      assert.equal(url.hash,'#workbench');
      assert.equal(url.pathname,'/extracted/garage/index.html');
      if(!url.search)continue;
      const id=url.searchParams.get('vehicle');
      assert(Object.hasOwn(VEHICLES,id));
      const group=url.searchParams.get('assembly'),part=url.searchParams.get('open');
      if(!group){
        const selected=url.searchParams.get('part');
        if(selected)assert(getComponent(id,selected),id+' / '+selected);
        else assert(['systems','references','customize'].includes(url.searchParams.get('tool')));
        continue;
      }
      const assembly=getAssembly(id,group);
      assert(assembly&&(!part||assembly.parts.some(p=>p.id===part)),id+' / '+part);
    }
  }
  assert(items.some(r=>r.links.some(l=>l.url.includes('/papers/dark-matter-2026/'))));
  assert(items.some(r=>r.links.some(l=>l.url.includes('/play/medical/'))));
});

test('search combines status, source scope and punctuation-insensitive terms across fields',()=>{
  const bmw=vehiclePriorities.find(v=>v.id==='bmw325ci');
  const porsche=vehiclePriorities.find(v=>v.id==='porsche993cab');
  const requested=items.find(r=>r.id==='porsche-pair');
  assert(matches(bmw,'BMW coupé e46','partial'));
  assert(matches(requested,'crankshaft manual 2023','partial'));
  assert(matches(porsche,'crankcase Porsche','all'));
  assert(!matches(requested,'crankshaft','shipped'));
  assert(!matches(porsche,'unobtainiumxyz','all'));
  assert.equal(statusValue('unexpected'),'all');
  assert.equal(statusValue('__proto__'),'all');
});

test('the Garage links to priorities and board sections and controls are accessible without remote assets',()=>{
  const workbench=readFileSync(new URL('index.html',directory),'utf8');
  const page=readFileSync(new URL('priorities.html',directory),'utf8');
  assert.match(workbench,/<header>[\s\S]*?href="\.\/priorities.html"[\s\S]*?<\/header>/);
  for(const id of ['requests','vehicles','priority-query','priority-status','board-count'])assert(page.includes('id="'+id+'"'));
  for(const id of ['priority-query','priority-status'])assert(page.includes('for="'+id+'"'));
  assert.match(page,/id="board-count" aria-live="polite"/);
  for(const file of ['priority-board.css','priority-board.js'])assert(page.includes('"./'+file+'"'));
  assert.match(page,/href="\.\/index.html#workbench"/);
});

test('each equipment priority opens an option offered on that vehicle',()=>{
  const applications={
    'brush-guards':[['g500','brush-guards']],
    'rear-ladders':[['g500','ladders'],['porsche993cab','roof-racks']],
    'raised-intakes':[['g500','raised-intakes']],
    'driving-lights':[['g500','auxiliary-lighting'],['porsche993cab','headlights']],
    'police-lights':[['g500','display-lighting']]
  };
  for(const [request,options] of Object.entries(applications)){
    const links=items.find(item=>item.id===request).links.map(link=>new URL(link.url,base).searchParams);
    assert.deepEqual(links.map(q=>[q.get('vehicle'),q.get('equipment')]),options);
    for(const query of links){
      assert.equal(query.get('tool'),'customize');
      assert.equal(query.get('section'),'equipment');
      assert(accessoriesFor(query.get('vehicle')).some(p=>p.kind.toLowerCase().replace(/ /g,'-')===query.get('equipment')));
    }
  }
  const porsches=['porsche993cab','porsche992scab'];
  for(const [id,vehicles] of [['lift-kits',['g500','porsche992scab']],['put-top-up',porsches],['complete-boxer',porsches]]){
    const queries=items.find(item=>item.id===id).links.map(link=>new URL(link.url,base).searchParams);
    assert.deepEqual(queries.map(query=>query.get('vehicle')),vehicles);
    assert(queries.every(query=>id==='complete-boxer'?query.get('assembly')==='engine':query.get('tool')==='customize'));
  }
});
