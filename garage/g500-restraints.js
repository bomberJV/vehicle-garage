// Seat belts and airbags from the 2002 G500 restraint-system diagrams.
// Placement is estimated around the modeled pillars, seats and steering column.
const giant='https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/electrical/';
export const restraintRefs={
  front:{label:'MB Parts Giant · 2002 G500 front seat belts diagram',url:giant+'front-seat-belts'},
  rear:{label:'MB Parts Giant · 2002 G500 rear seat belts diagram',url:giant+'rear-seat-belts'},
  airbag:{label:'MB Parts Giant · 2002 G500 air bag components diagram',url:giant+'air-bag-components'}
};
const black='#24292a',webbing='#2f3436',trim='#3d4244',metal='#9aa1a2';
const span=(s,a,b)=>[Math.min(s*a,s*b),Math.max(s*a,s*b)];
const sides=[-1,1],hand=s=>s<0?'left':'right';

function retractor(r,s,x0,x1,z0,z1){const [y0,y1]=span(s,.784,.812);r.box(x0,y0,z0,x1,y1,z1,black);}
function strap(r,points,s){
  // Webbing is a thin flat band; draw it as a narrow rod chain.
  for(let i=1;i<points.length;i++)r.rod(points[i-1].map((v,k)=>k===1?s*v:v),points[i].map((v,k)=>k===1?s*v:v),.006,webbing,4);
}
function rail(r,s,x0,x1,z0,z1,y0=.795,y1=.812){const [a,b]=span(s,y0,y1);r.box(x0,a,z0,x1,b,z1,metal);}
function cover(r,s,x0,x1,z0,z1,y0,y1){const [a,b]=span(s,y0,y1);r.box(x0,a,z0,x1,b,z1,trim);}

export function drawG500Restraints(r){
  // Front: retractor low on each B-pillar, webbing up to the height adjuster.
  for(const s of sides){
    r.tag('body.front-belt-retractor-'+hand(s),()=>{
      retractor(r,s,.212,.256,.722,.860);
      strap(r,[[.234,.808,.860],[.232,.808,1.400]],s);
    });
    r.tag('body.belt-adjusters-front',()=>r.instance(hand(s),()=>rail(r,s,.220,.248,1.360,1.500)));
    r.tag('body.belt-adjust-covers',()=>r.instance('front-'+hand(s),()=>cover(r,s,.210,.258,1.340,1.520,.782,.795)));
    r.tag('body.belt-lower-covers',()=>r.instance('front-'+hand(s),()=>cover(r,s,.206,.262,.712,.880,.760,.770)));
    r.tag('body.front-belt-buckles',()=>r.instance(hand(s),()=>{
      const [y0,y1]=span(s,.150,.170);
      r.box(.125,y0,.900,.160,y1,.968,black);
      r.rod([.142,s*.166,.900],[.150,s*.176,.860],.005,metal,6);
    }));
  }
  // Rear: retractor behind each outer backrest, adjuster on the C-pillar,
  // floor anchor bracket on the sill and shared buckles at the cushion seams.
  for(const s of sides){
    r.tag('body.rear-belt-'+hand(s),()=>{
      const [y0,y1]=span(s,.740,.800);
      r.box(1.170,y0,.960,1.230,y1,1.100,black);
      strap(r,[[1.200,.790,1.100],[1.100,.805,1.400]],s);
    });
    r.tag('body.belt-adjusters-rear',()=>r.instance(hand(s),()=>rail(r,s,1.086,1.112,1.350,1.490,.800,.818)));
    r.tag('body.belt-adjust-covers',()=>r.instance('rear-'+hand(s),()=>cover(r,s,1.080,1.118,1.330,1.510,.788,.800)));
    r.tag('body.belt-lower-covers',()=>r.instance('rear-'+hand(s),()=>cover(r,s,1.165,1.235,.950,1.110,.730,.740)));
    r.tag('body.rear-belt-bracket-'+hand(s),()=>{const [y0,y1]=span(s,.675,.720);r.box(.940,y0,.712,.975,y1,.720,metal);});
  }
  r.tag('body.rear-belt-buckles',()=>{for(const y of [-.220,.222])r.instance(y<0?'left-seam':'right-seam',()=>r.box(.955,y-.010,.852,.985,y+.010,.915,black));});
  // Center belt: guide on top of the wide left backrest, webbing down its face.
  r.tag('body.rear-center-belt',()=>{
    r.box(1.100,.030,1.335,1.150,.090,1.372,black);
    strap(r,[[1.105,.060,1.335],[.975,.060,.880]],1);
  });
  // Airbags and clockspring at the wheel and under the passenger pad.
  r.tag('body.driver-airbag',()=>r.rod([-.330,-.410,1.219],[-.316,-.410,1.225],.052,black,14));
  r.tag('body.clockspring',()=>r.rod([-.356,-.410,1.207],[-.342,-.410,1.213],.050,'#30373a',14));
  r.tag('body.passenger-airbag',()=>r.box(-.565,.270,1.236,-.490,.465,1.276,'#30373a'));
}

export const g500RestraintParts=[
  ['front-belt-retractor-left','Front belt retractor, driver · 463-860-19-00','The retractor sits low on the left B-pillar; its webbing runs up the pillar to the height adjuster.','front'],
  ['front-belt-retractor-right','Front belt retractor, passenger · 463-860-20-00','The retractor sits low on the right B-pillar; its webbing runs up the pillar to the height adjuster.','front'],
  ['belt-adjusters-front','Front belt height adjusters · 000-860-00-88','A rail on each B-pillar carries the upper belt guide at the chosen height.','front'],
  ['belt-adjust-covers','Belt adjuster covers · 463-868-00-92','Trim covers close the height-adjuster rails on the B- and C-pillars.','front'],
  ['belt-lower-covers','Belt lower covers · 463-868-02-39','Trim covers close the belt retractors at the pillars.','front'],
  ['front-belt-buckles','Front belt buckles · 203-860-19-69','Each buckle stands between its seat and the console.','front'],
  ['rear-belt-left','Rear outer belt assembly, left · 463-860-21-00','The left rear retractor sits behind the backrest with its webbing running up to the C-pillar guide.','rear'],
  ['rear-belt-right','Rear outer belt assembly, right · 463-860-22-00','The right rear retractor sits behind the backrest with its webbing running up to the C-pillar guide.','rear'],
  ['belt-adjusters-rear','Rear belt height adjusters · 463-860-01-88','A rail on each C-pillar carries the rear upper belt guide.','rear'],
  ['rear-belt-bracket-left','Rear belt anchor bracket, left · 463-860-01-31','The lower anchor bracket sits on the left sill beside the cushion.','rear'],
  ['rear-belt-bracket-right','Rear belt anchor bracket, right · 463-860-02-31','The lower anchor bracket sits on the right sill beside the cushion.','rear'],
  ['rear-belt-buckles','Rear belt buckles · 463-860-04-69','Buckles stand at the cushion seams between the rear places.','rear'],
  ['rear-center-belt','Rear center belt · 463-860-30-85','The middle-place belt runs from a guide on top of the wide left backrest down its face.','rear'],
  ['driver-airbag','Driver airbag module · 463-460-09-98','The sealed module fills the steering-wheel hub behind the padded cover.','airbag'],
  ['clockspring','Steering-wheel clockspring · 463-460-00-49','The clockspring sits behind the hub and carries the airbag and button circuits across the turning joint.','airbag'],
  ['passenger-airbag','Passenger airbag module · 463-860-02-05','The module sits under the passenger side of the instrument-panel pad, above the glove box.','airbag']
];
