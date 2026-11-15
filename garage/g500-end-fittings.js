import {lampOutline,lampWall,G500_FRONT} from './g500-lamps.js';

// World coordinates of the 2002 US front and rear bumper faces.
const front=G500_FRONT-.116,rear=2.225;
function insetPanel(r,map,outer,inner,lip,well,trim,shade){
  lampWall(r,map,outer,0,inner,lip,trim);
  lampWall(r,map,inner,lip,inner,well,shade);
  r.polygon(inner.map(([u,v])=>map(u,v,well)),shade,false);
}
export function drawHeadlampWasher(r,side){
  r.tag('lighting.washer',()=>r.instance(side<0?'Left nozzle':'Right nozzle',()=>{
    const map=(u,v,d)=>[G500_FRONT-.041-d,side*.674+u,.802+v];
    const foot=lampOutline(.075,.035,.010),cap=lampOutline(.058,.024,.009);
    lampWall(r,map,foot,-.012,cap,.008,'#596062');
    r.polygon(cap.map(([u,v])=>map(u,v,.008)),'#4a5252',false);
    // The fitted jet is aimed up from below the glass.
    r.rod(map(0,0,.008),map(0,.008,.014),.007,'#728085',10);
    const tip=lampOutline(.011,.006,.002);
    r.polygon(tip.map(([u,v])=>map(u,.009+v,.0145)),'#343a3a',false);
  }));
}
export function drawParkingPilot(r,side){
  const y=side*(.674-.048),z=1.001-.061;
  r.tag('lighting.parking-'+(side<0?'left':'right'),()=>{
    const at=(t,rad,depth)=>[G500_FRONT-depth,y+Math.cos(t)*rad,z+Math.sin(t)*rad];
    for(let i=0;i<16;i++){
      const a=i*Math.PI/8,b=(i+1)*Math.PI/8;
      // A small off-axis pilot near the base of the silvered headlamp bowl.
      r.polygon([at(a,.015,.043),at(b,.015,.043),at(b,.009,.048),at(a,.009,.048)],'#687578',false);
      r.polygon([at(a,.009,.048),at(b,.009,.048),at(b,.006,.052),at(a,.006,.052)],r.lights?'#ede6c8':'#a6aca2',false);
    }
    r.discX(G500_FRONT-.052,y,z,.006,r.lights?'#f9efc7':'#bfc5b9',14);
  });
}
export function drawFrontBumperFittings(r){
  const map=(u,v,d)=>[front-d,u,.546+v];
  // Shallow black insert with a perforated face in the painted bumper.
  const outer=lampOutline(.786,.102,.021),inner=lampOutline(.763,.086,.015);
  insetPanel(r,map,outer,inner,.007,.002,'#414849','#232a2b');
  for(const u of [-.304,-.154,0,.154,.304]){
    const depth=.005;
    r.polygon([map(u-.004,-.037,depth),map(u+.004,-.037,depth),map(u+.004,.038,depth),map(u-.004,.038,depth)],'#474f50',false);
  }
  for(const v of [-.020,.008,.032]){
    const span=v>.02?.366:.374;
    r.polygon([map(-span,v-.003,.009),map(span,v-.003,.009),map(span,v+.003,.011),map(-span,v+.003,.011)],'#5a6261',false);
  }
  // Separate US-size empty plate carrier. The paint remains visible between
  // this panel and the fog lamp trims on either side.
  const plateMap=(u,v,d)=>[front-.020-d,u,.606+v],edge=lampOutline(.329,.171,.012),rim=lampOutline(.311,.152,.009);
  lampWall(r,plateMap,edge,-.005,edge,.003,'#3d4040');
  lampWall(r,plateMap,edge,.003,rim,.005,'#525757');
  r.polygon(rim.map(([u,v])=>plateMap(u,v,.005)),'#383e3e',false);
  for(const u of [-.090,.09])for(const v of [-.058,.058]){
    r.discX(front-.026,u,.606+v,.004,'#79807d',10);
  }
}
export function drawRearPlatePanel(r){
  const map=(u,v,d)=>[rear+d,u,.553+v];
  const outer=lampOutline(.788,.182,.020),inner=lampOutline(.730,.146,.019);
  // Recessed surround, radiused face, and a smaller US 12-by-6 silhouette.
  insetPanel(r,map,outer,inner,.015,.004,'#444d4b','#363d3d');
  const plate=lampOutline(.309,.150,.010);
  r.polygon(plate.map(([u,v])=>map(u,v,.007)),'#a5ada7',false);
  for(const u of [-.089,.089])r.discX(rear+.008,u,.603,.004,'#626967',10);
  // The two small housings above the plate illuminate it from the top edge.
  for(const sign of [-1,1]){
    const p=(u,v,d)=>map(sign*.106+u,.085+v,d);
    const body=lampOutline(.073,.027,.004),face=lampOutline(.067,.020,.003);
    lampWall(r,p,body,.001,face,.026,'#445050');
    r.polygon(face.map(([u,v])=>p(u,v,.026)),'#535b58',false);
    r.polygon([p(-.025,-.010,.008),p(.025,-.010,.008),p(.025,-.010,.023),p(-.025,-.010,.023)],'#adc2b5',false);
  }
}
