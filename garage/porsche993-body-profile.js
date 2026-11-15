// MY1998 Carrera Cabriolet, narrow body. Wheelbase-scaled side and plan on
// Porsche's 993 Cabriolet rescue drawing (PDF page 32).
// https://files.porsche.com/f/332100/e5c1d1c36c/rescue-data-sheets-classic.pdf#page=32
// The drawing supplies exterior contours. Transverse curvature and the lower
// bumper returns are fitted to photographs of the US Carrera Cabriolet.
// https://bringatrailer.com/listing/1998-porsche-911-carrera-cabriolet-48/
// Twin oval US Carrera outlets. The pipe must meet the local curved apron;
// using the centreline bumper length here leaves both tips floating aft of it.
export const classicTailpipe = {y:.571,z:.247};
export function classicTailpipeEnd(){
  const end=classicStations.at(-1)[0],{y,z}=classicTailpipe;
  const face=sweepClassicBody({stations:classicStations,width:1.735},end,y,z);
  return face-.137*unit((.42-z)/.25)**1.4;
}
export const classicSpoiler = {front:1.370,rear:1.834,grilleFront:1.393,grilleRear:1.77};

export const classicStations = [
  // Unwrapped longitudinal station, half-width, shoulder crest, deck centre (m).
  [-2.103,.711,.525,.481], [-2.04,.723,.578,.512], [-1.975,.735,.621,.541],
  [-1.88,.751,.660,.582], [-1.76,.770,.723,.639], [-1.65,.788,.762,.688],
  [-1.48,.812,.789,.736], [-1.31,.827,.812,.767], [-1.16,.842,.824,.791],
  [-.97,.832,.832,.847], [-.77,.812,.849,.893], [-.62,.797,.855,.923],
  [-.38,.798,.852,.849], [.04,.798,.851,.844], [.48,.800,.85,.842],
  [.63,.828,.854,.855], [.78,.857,.862,.891], [.96,.86774,.871,.954],
  [1.112,.8670,.875,.995], [1.27,.862,.876,1.020], [1.37,.855,.869,.987], [1.48,.841,.852,.944],
  [1.58,.825,.830,.894], [1.75,.786,.788,.839], [1.91,.750,.747,.772],
  [2.035,.724,.682,.703], [2.157,.700,.623,.637]
];

const unit = value => Math.min(1,Math.max(0,value));
export function sweepClassicBody(car,x,y,z) {
  const front = car.stations[0][0], rear = car.stations.at(-1)[0];
  const nose = unit(1-(x-front)/.70), tail = unit(1-(rear-x)/.61);
  const u = Math.abs(2*y/car.width), u2=u*u, u5=u2*u2*u;
  // A broad centre transitions into much tighter corner radii at either end.
  // The rear reflector sits above the proud impact bumper.
  const tailRise=unit((z-.505)/.132);
  return x + nose*nose*(.157*u2+.292*u5)
           - tail*tail*(.087*u2+.432*u5+.12*unit((u-.65)/.17)**2+.105*tailRise*tailRise);
}

export function classicGrilleSpan(x) {
  const t=unit((x-classicSpoiler.grilleFront)/(classicSpoiler.grilleRear-classicSpoiler.grilleFront));
  return .487*(.92+.08*Math.sin(Math.PI*t));
}

// X of each bonnet rib across the plan. The front edge bows forward by
// roughly 25 mm at its rounded outer corners.
export const classicBonnetStart = -1.949;
export const classicDoor = [-.638, .531];
export const classicDoorHem = .29;
export function classicBonnetRib(x,y) {
  const t=unit(1-Math.abs(x-classicBonnetStart)/.154), u=Math.abs(y)/.384;
  return x-.045*t*t*unit(u)**2;
}

export function classicBonnetWidth(x) {
  // Lower bonnet corners and cowl corners, measured in the plan drawing.
  const t=unit((x+1.957)/1.34);
  return .384+.229*t-.015*t*(1-t);
}

// A door on the 993 stops above the sill and its bottom trails considerably
// forward of the latch. Both sides of a panel joint get the same station warp.
export function classicDoorRib(car,x,t) {
  const [a,b]=car.door;
  const influence=(edge,span)=>{const u=unit(1-Math.abs(x-edge)/span);return u*u*(3-2*u);};
  const lift=unit((t-classicDoorHem)/(1-classicDoorHem));
  return x-.022*influence(a,.12)*Math.sin(lift*Math.PI)
          -.14*influence(b,.25)*(1-lift)**1.8;
}

export function classicSillHeight(x) {
  // The rear valance rolls upward away from the sill visible between the axles.
  return .155+.052*unit((x-1.51)/.60)**1.4;
}

// Stock bumper has one radiused central mouth. Its outboard underside has
// a row of diagonal slots on each side.
export function classicLowerBands(t) {
  const round=unit((t-.615)/.115);
  const arc=1-Math.sqrt(Math.max(0,1-round*round));
  return [.167+.032*t*t,.208+.028*t*t,.228+.02*t,
          .247+.017*t+.034*arc,.348+.01*t-.035*arc,.398+.008*t];
}

export function drawClassicCornerVents(r,car,sidePoint,wheelCut,top,station) {
  for(const side of [-1,1]){
    for(let i=0;i<7;i++){
      const x=-1.986+.032*i, z=.225+.007*i/6;
      const corner=(xx,zz)=>{
        const hi=top(car,xx,.958*station(car,xx)[0])[2],lo=wheelCut(car,xx);
        const p=sidePoint(car,xx,unit((zz-lo)/(hi-lo)),side);
        p[1]+=side*.0025;
        return p;
      };
      r.polygon([corner(x,z),corner(x+.013,z),corner(x+.042,z-.041),corner(x+.030,z-.041)],'#42464a',false);
    }
  }
}

// The luggage lid dishes between the fender crowns. Its clearances close at
// the nose and cowl. The rescue plan sets the joint location at every station.
export function classicBonnetValley(x,y){
  if(x<=classicBonnetStart||x>=-.62)return 0;
  const length=(x-classicBonnetStart)/(-.62-classicBonnetStart),edge=classicBonnetWidth(x);
  return -.034*Math.sin(Math.PI*length)**.72*Math.exp(-(((Math.abs(y)-edge+.045)/.145)**2));
}

// Cross sections of the elastomer bumper covers, from period US car photos.
// Keep the recorded foremost and rearmost points on the crown, then roll the
// cover inward at both ends before it meets the separate lamps and valance.
export function classicBumperInset(front,z,y){
  const shoulder=front?.410:.482,low=unit((shoulder-z)/(front?.219:.250));
  const upper=unit((z-shoulder)/(front?.120:.102));
  const inset=front?.084*low**1.38+.018*upper**1.5:.137*unit((.42-z)/.25)**1.4+.017*upper**1.6;
  if(front)return inset;
  const edge=unit((.30-Math.abs(y))/.09);
  const vertical=unit((z-.276)/.045)*unit((.469-z)/.030);
  return inset+.036*edge*vertical;
}
