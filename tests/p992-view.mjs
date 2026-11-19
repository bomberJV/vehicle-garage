// Orthographic views of the installed 992 mesh, for checking where parts sit.
//   node tests/p992-view.mjs <part-prefix> [out.png] [--hide=shell,roof,cabin] [--box=x0,x1,y0,y1,z0,z1]
// Writes a PNG with top, left-side and front views. Parts whose id starts with the
// prefix are drawn in red over everything; the rest are drawn in their own colours
// (faded). --hide drops whole systems so inner parts can be seen. --box crops to a
// region of the car, in metres (x forward negative, y left negative, z up).
import {writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {GarageRenderer} from '../garage/render.js';
import {normalizedLift} from '../garage/lift-options.js';

const args=process.argv.slice(2),flags=Object.fromEntries(args.filter(a=>a.startsWith('--')).map(a=>a.slice(2).split('=')));
const [prefix='',out='/tmp/p992-view.png']=args.filter(a=>!a.startsWith('--'));
const hide=new Set((flags.hide||'').split(',').filter(Boolean));
const vehicle='porsche992scab';
const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,parts:[],paint:'olive',finish:'silver',lift:normalizedLift(vehicle,{})},inspection:{},isolate:false,progress:0,lights:true,schematic:true,partPositions:new Map()});
r.buildMesh();
const hit=f=>prefix&&f.part?.startsWith(prefix);
let faces=r.faces.filter(f=>f.part&&!hide.has(f.part.split('.')[0])||hit(f));
let bounds=[-2.4,2.4,-1.05,1.05,-.05,1.4];
if(flags.box){bounds=flags.box.split(',').map(Number);faces=faces.filter(f=>f.points.some(([x,y,z])=>x>=bounds[0]&&x<=bounds[1]&&y>=bounds[2]&&y<=bounds[3]&&z>=bounds[4]&&z<=bounds[5]));}
const [x0,x1,y0,y1,z0,z1]=bounds,S=Math.min(900/(x1-x0),900/(y1-y0+z1-z0)),pad=20;
// view: [horizontal axis, vertical axis (down), depth axis (toward the eye is drawn last)]
const views=[
  {name:'top (front left, left side up)',h:p=>p[0]-x0,v:p=>p[1]-y0,d:p=>p[2],w:x1-x0,ht:y1-y0},
  {name:'left side (front left)',h:p=>p[0]-x0,v:p=>z1-p[2],d:p=>-p[1],w:x1-x0,ht:z1-z0},
  {name:'front (car left on the left)',h:p=>p[1]-y0,v:p=>z1-p[2],d:p=>-p[0],w:y1-y0,ht:z1-z0},
];
let svg='',oy=pad;const W=Math.max(...views.map(v=>v.w))*S+2*pad;
for(const view of views){
  svg+=`<text x="${pad}" y="${oy+12}" font-size="13" font-family="sans-serif">${view.name}${prefix?' · red: '+prefix:''}</text>`;oy+=18;
  const sorted=[...faces].sort((a,b)=>(hit(a)-hit(b))||(Math.max(...a.points.map(view.d))-Math.max(...b.points.map(view.d))));
  for(const f of sorted){
    const pts=f.points.map(p=>`${(pad+view.h(p)*S).toFixed(1)},${(oy+view.v(p)*S).toFixed(1)}`).join(' ');
    svg+=hit(f)?`<polygon points="${pts}" fill="#e0261b" stroke="#7a0d07" stroke-width=".4"/>`:`<polygon points="${pts}" fill="${f.color||'#999'}" fill-opacity=".55"/>`;
  }
  for(let g=Math.ceil(view===views[2]?y0*2:x0*2)/2;g<=(view===views[2]?y1:x1);g+=.5)svg+=`<line x1="${pad+(g-(view===views[2]?y0:x0))*S}" y1="${oy}" x2="${pad+(g-(view===views[2]?y0:x0))*S}" y2="${oy+view.ht*S}" stroke="#4a8" stroke-width=".5" stroke-dasharray="3 3"/><text x="${pad+(g-(view===views[2]?y0:x0))*S+2}" y="${oy+view.ht*S-2}" font-size="9" fill="#4a8">${g.toFixed(1)}</text>`;
  oy+=view.ht*S+pad;
}
writeFileSync('/tmp/p992-view.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${oy}" style="background:#fff"><rect width="100%" height="100%" fill="#fff"/>${svg}</svg>`);
execFileSync('rsvg-convert',['/tmp/p992-view.svg','-o',out]);
console.log(out,faces.filter(hit).length,'highlighted faces');
