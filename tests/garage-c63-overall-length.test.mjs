import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {measureStockMesh} from '../garage/factory-dimensions.js';
import {C63_AXLES,C63_WHEELBASE} from '../garage/c63-wheel-specs.js';

// Mercedes-Benz USA, C63 AMG sedan: 186.0 in (4,724 mm) overall length in the
// 2012 C-Class sedan technical data and the 2014 C-Class brochure, on a
// 108.9 in (2,766 mm) wheelbase. 185.3 in (4,707 mm) is the C63 coupe's length.
const LENGTH_MM=186.0*25.4;
const faces=GarageRenderer.assembledFaces({vehicle:'c63',parts:[],roofPosition:'up',paint:'silver'});
const m=measureStockMesh('c63',faces);

test('C63 sedan overall length is within 3 mm of the US 186.0 in',()=>{
 const mm=m.meters.length*1000;
 assert(Math.abs(mm-LENGTH_MM)<=3,`length ${mm.toFixed(1)} mm, published ${LENGTH_MM.toFixed(1)} mm`);
});

test('C63 length change leaves the wheelbase, axles and tracks alone',()=>{
 assert.equal(m.mm.wheelbase,2766);
 assert(Math.abs(C63_WHEELBASE-2.766)<1e-12);
 assert.deepEqual([...C63_AXLES],[-1.38,1.386]);
 assert.equal(m.mm.frontTrack,1570);
 assert.equal(m.mm.rearTrack,1524);
});

test('C63 nose and tail extremes: apron intake grille ahead, diffuser fins behind',()=>{
 // The rebuilt front is unchanged: its foremost point is the intake grille, 10 mm off the apron.
 assert(Math.abs(m.min[0]-(-2.2797))<.0005,`nose at ${m.min[0].toFixed(4)}`);
 // The fins stand 10 mm off the diffuser, just past its 8 mm chrome edge.
 const fins=faces.filter(f=>f.part==='body.structure'&&f.color==='#24292c'&&f.points.every(p=>p[0]>2.3&&p[2]>.29&&p[2]<.45));
 assert(fins.length>0,'no diffuser fin faces');
 const finX=Math.max(...fins.flatMap(f=>f.points.map(p=>p[0])));
 assert(Math.abs(m.max[0]-finX)<1e-9,`tail ${m.max[0].toFixed(4)} is not the fins (${finX.toFixed(4)})`);
 const edge=faces.filter(f=>f.part==='body.structure'&&f.color==='#aab2b5'&&f.points.every(p=>p[0]>2.3));
 const edgeX=Math.max(...edge.flatMap(f=>f.points.map(p=>p[0])));
 assert(finX-edgeX>0&&finX-edgeX<.004,`fins ${((finX-edgeX)*1000).toFixed(1)} mm past the chrome edge`);
});
