// US 2014 SL550 steering, axle links and engine mounts. Axles at x = ±1.2925 m.
// The R231 front axle is a double-wishbone layout with the ABC strut forked to
// the lower wishbone; the rear is a five-link axle on a separate carrier. The
// parts catalogue groups below name the fitted components. Link pivot points,
// section sizes and bracket shapes are illustrative, placed clear of the
// modelled struts, exhaust, driveshafts and engine.
import {pipe,barrel} from './road-primitives.js';

const catalog='https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-7l-v8-gas/';
const source=what=>({label:'Mercedes-Benz USA · 2014 SL550 parts catalog, '+what+' (look up by VIN)',url:catalog});
const refs={
  steering:source('steering gear and column'),
  front:source('front axle, control arms and steering knuckles'),
  rear:source('rear axle carrier, links and wheel carriers'),
  mounts:source('engine mounts and front axle carrier')
};
const front=-1.2925,rear=1.2925,sides=[-1,1];
const steel='#5d676b',black='#2c3134',alloy='#9aa3a6',rubber='#33383a',forged='#7c8689';
const group=(id,name,description,parts)=>({id,name,description,internal:true,
  parts:parts.map(([key,name,description,offset,ref,draw])=>({id:id+'.'+key,name,description,offset,source:refs[ref],draw}))});

// Wheel carriers: the hub bearing housing sits just inside the brake disc, and
// two forged arms run up and down from it, clear of the ABC strut, which stands
// inboard of the carrier and bolts to the lower link.
function upright(r,axle,s,top,{steer=false,lean=.075}={}){
  barrel(r,[axle,s*.772,.33],[axle,s*.792,.33],.060,forged,16);
  pipe(r,[[axle,s*.765,.19],[axle+lean,s*.772,.33],...top.map(([dx,y,z])=>[axle+dx,s*y,z])],.016,forged,9);
  barrel(r,[axle,s*.765,.19],[axle,s*.745,.19],.022,steel,9);
  if(steer)pipe(r,[[axle+.02,s*.770,.22],[axle-.08,s*.755,.218],[axle-.145,s*.725,.22]],.015,forged,8);
}
const frontAxle=[
  ['carrier','Front axle carrier','Two cross members run beneath the oil pan between the wheelhouses. The lower wishbones and steering gear bolt to it.',[0,0,-.14],'mounts',r=>{
    for(const dx of [-.18,.22])barrel(r,[front+dx,-.52,.165],[front+dx,.52,.165],.026,steel,10);
    for(const s of sides){
      pipe(r,[[front-.18,s*.52,.165],[front-.02,s*.53,.172],[front+.22,s*.52,.165]],.024,steel,8);
      for(const dx of [-.18,.22])barrel(r,[front+dx,s*.52,.165],[front+dx,s*.52,.235],.022,steel,8);
    }
  }],
  ['lower-arms','Front lower wishbones','Each forged wishbone pivots on two rubber bushings and carries the ball joint at the foot of the wheel carrier. The ABC strut fork bolts onto it.',[0,.18,-.10],'front',r=>{
    for(const s of sides){
      const ball=[front,s*.745,.190];
      pipe(r,[[front-.18,s*.47,.205],[front-.10,s*.60,.200],ball],.017,forged,8);
      pipe(r,[[front+.22,s*.47,.205],[front+.10,s*.62,.205],ball],.017,forged,8);
      for(const dx of [-.18,.22])barrel(r,[front+dx-.03,s*.47,.205],[front+dx+.03,s*.47,.205],.026,rubber,12);
    }
  }],
  ['upper-arms','Front upper wishbones','The upper wishbone sits behind the strut, with both bushings on the body behind the hydraulic tank and its ball joint high inside the rim.',[0,.16,.14],'front',r=>{
    for(const s of sides){
      const ball=[front+.10,s*.69,.48];
      for(const dx of [.19,.30]){
        barrel(r,[front+dx,s*.52,.48],ball,.013,alloy,8);
        barrel(r,[front+dx-.022,s*.52,.48],[front+dx+.022,s*.52,.48],.020,rubber,10);
      }
    }
  }],
  ['knuckles','Front steering knuckles and hubs','The knuckle carries the wheel bearing and both ball joints. Its forward arm takes the tie rod.',[0,.24,0],'front',r=>{for(const s of sides){upright(r,front,s,[[.10,.71,.48]],{steer:true});barrel(r,[front+.10,s*.71,.48],[front+.10,s*.69,.48],.019,steel,9);}}]
];
const steering=[
  ['rack','Direct-Steer rack and electric assist','The rack sits low ahead of the front axle, beneath the cooling pack and accessory drive. Its variable tooth pitch quickens the ratio as the wheel turns.',[-.14,0,-.08],'steering',r=>{
    barrel(r,[-1.56,-.39,.19],[-1.56,.39,.19],.030,'#7a8386',14);
    barrel(r,[-1.56,-.33,.19],[-1.56,-.20,.19],.046,'#4f585b',14);
    barrel(r,[-1.56,-.17,.19],[-1.56,-.08,.19],.040,black,12);
    for(const s of sides)barrel(r,[-1.56,s*.39,.19],[-1.56,s*.45,.19],.036,rubber,12);
  }],
  ['tie-rods','Tie rods and ends','Each tie rod links the rack to the forward arm of the steering knuckle.',[-.08,.20,0],'steering',r=>{
    for(const s of sides)pipe(r,[[-1.56,s*.45,.19],[-1.50,s*.60,.20],[front-.145,s*.725,.22]],.010,steel,7);
  }],
  ['shaft','Steering intermediate shaft','Universal joints carry the shaft from the column down past the left cylinder head and strut, below the ABC pressure lines, to the pinion.',[0,-.18,.05],'steering',r=>{
    const path=[[-1.56,-.28,.21],[-1.52,-.36,.25],[-1.30,-.53,.28],[-1.12,-.53,.32],[-.98,-.44,.43],[-.84,-.38,.62],[-.70,-.38,.68],[-.43,-.43,.70]];
    pipe(r,path,.012,steel,8);
    for(const p of [path[1],path[3]])barrel(r,[p[0]-.02,p[1],p[2]],[p[0]+.02,p[1],p[2]],.022,alloy,10);
  }]
];
const rearAxle=[
  ['carrier','Rear axle carrier','The carrier frames the differential above the exhaust, ahead of the rear silencers. The five links of each side pivot on it.',[0,0,-.12],'rear',r=>{
    barrel(r,[1.00,-.45,.44],[1.00,.45,.44],.026,steel,10);
    barrel(r,[1.45,-.45,.46],[1.45,.45,.46],.026,steel,10);
    for(const s of sides){
      barrel(r,[1.00,s*.45,.44],[1.45,s*.45,.46],.024,steel,10);
      for(const x of [1.00,1.45])barrel(r,[x,s*.45,.46],[x,s*.45,.52],.020,rubber,10);
      for(const x of [1.12,1.18])barrel(r,[x,s*.45,.44],[x,s*.45,x<1.15?.30:.25],.014,steel,8);
      barrel(r,[1.45,s*.42,.46],[1.44,s*.42,.50],.014,steel,8);
    }
  }],
  ['links','Five-link rear suspension','Two upper links, a camber link, the spring link carrying the ABC strut and a toe link locate each rear wheel carrier.',[0,.20,-.04],'rear',r=>{
    for(const s of sides){
      const links=[
        [[1.08,s*.45,.47],[1.21,s*.745,.50]],
        [[1.44,s*.45,.47],[1.39,s*.745,.50]],
        [[1.12,s*.45,.30],[1.25,s*.755,.215]],
        [[1.18,s*.45,.25],[rear,s*.745,.19]],
        [[1.44,s*.42,.50],[1.36,s*.755,.24]]
      ];
      for(const [a,b] of links){barrel(r,a,b,.012,forged,8);barrel(r,[a[0]-.018,a[1],a[2]],[a[0]+.018,a[1],a[2]],.018,rubber,10);}
    }
  }],
  ['carriers','Rear wheel carriers and hubs','Each carrier holds the wheel bearing for the driven hub and the five link joints.',[0,.24,0],'rear',r=>{for(const s of sides)upright(r,rear,s,[[-.03,.75,.47],[-.08,.745,.50],[.10,.745,.50]],{lean:-.075});}]
];
const mounts=[
  ['engine','Engine mounts','Two hydraulic mounts carry the M278 on the front axle carrier, one under each bank.',[0,0,-.10],'mounts',r=>{
    for(const s of sides){
      r.box(-1.15,s*.13-.02,.30,-1.09,s*.13+.02,.36,forged);
      barrel(r,[-1.12,s*.17,.31],[-1.12,s*.22,.24],.028,rubber,12);
      r.box(-1.15,s*.20-.025,.19,-1.09,s*.24+.025,.235,steel);
    }
  }]
];
export const slChassisGroups=[
  group('sl-steer','Steering','Follow the column through two universal joints to the rack ahead of the front axle, and out along the tie rods to each knuckle.',steering),
  group('sl-front','Front axle','Double wishbones locate each front wheel. The ABC strut forks to the lower wishbone; the axle carrier also takes the engine mounts.',[...frontAxle,...mounts]),
  group('sl-rear','Rear axle','Five links locate each rear wheel carrier on a separate axle carrier around the differential.',rearAxle)
];
export function drawSLChassis(r){
  for(const g of slChassisGroups)for(const p of g.parts)r.tag(p.id,()=>p.draw(r));
}
