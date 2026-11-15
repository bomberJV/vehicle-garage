// Display geometry in model units. Each shell station is [height, radius].
export const TAU = 2 * Math.PI;
export const shellWhite = '#e5e3d4', dark = '#2f3337', metal = '#a1a7a6';
export function tone(hex, amount) {
  return '#' + [1, 3, 5].map(i => Math.min(255, Math.round(parseInt(hex.slice(i, i+2),16) * amount)).toString(16).padStart(2,'0')).join('');
}
export function radial(x,y,z,radius,angle) {
  return [x + radius*Math.cos(angle), y + radius*Math.sin(angle), z];
}
export function section(r,x,y,stations,color,options={}) {
  const {from=0,to=TAU,steps=32,caps=false,pattern} = options;
  for (let i=0;i<steps;i++) {
    const a=from+(to-from)*i/steps, b=from+(to-from)*(i+1)/steps;
    for (let j=0;j<stations.length-1;j++) {
      const [z0,r0]=stations[j], [z1,r1]=stations[j+1];
      const rgb=pattern?.((a+b)/2,(z0+z1)/2) || color;
      const light=.84+.12*Math.cos((a+b)/2-.65)+(r0-r1)*.09;
      const points=[radial(x,y,z0,r0,a),radial(x,y,z0,r0,b),radial(x,y,z1,r1,b),radial(x,y,z1,r1,a)];
      r.polygon(r0===0?[points[0],points[2],points[3]]:r1===0?points.slice(0,3):points,tone(rgb,light),false);
    }
  }
  if(caps && to-from>TAU-.00001) {
    for(const [index,dir] of [[0,1],[stations.length-1,-1]]) {
      const [z,rad]=stations[index];
      if(rad>0) r.polygon(Array.from({length:steps},(_,i)=>radial(x,y,z+dir*.00015,rad,from+i*(to-from)/steps)),tone(color,.72),false);
    }
  }
}
export function band(r,x,y,z0,z1,radius,color) {
  section(r,x,y,[[z0,radius],[z1,radius]],color);
}
export function bell(r,x,y,z,radius,height,steps=20) {
  section(r,x,y,[[z,radius],[z+height*.5,radius*.70],[z+height,radius*.31]],'#798084',{steps});
  section(r,x,y,[[z,radius*.94],[z+height*.8,radius*.35]],'#34383a',{steps});
  section(r,x,y,[[z,radius*.94],[z,radius]],'#999e9f',{steps});
}
export function fin(r,x,y,angle,outline,color,thickness=.012) {
  const along=[Math.cos(angle),Math.sin(angle)], across=[-along[1],along[0]];
  const point=(d,z,t)=>[x+along[0]*d+across[0]*t,y+along[1]*d+across[1]*t,z];
  const sides=[-thickness/2,thickness/2].map(t=>outline.map(([d,z])=>point(d,z,t)));
  sides.forEach((side,i)=>r.polygon(side,tone(color,i?1:.78),false));
  sides[0].forEach((a,i)=>{const j=(i+1)%outline.length;r.polygon([a,sides[0][j],sides[1][j],sides[1][i]],tone(color,.68),false);});
}
export function panel(r,points,color) {r.polygon(points,color,false);}
export function loops(r,points,radius,color,closed=true) {
  points.forEach((p,i)=>{if(i+1<points.length||closed)r.rod(p,points[(i+1)%points.length],radius,color,6);});
}
export function cylinders(r,x,y,z0,z1,radius,color) {
  section(r,x,y,[[z0,radius],[z1,radius]],color,{caps:true});
}
export function part(id,name,description,offset,draw){return {id,name,description,offset,draw};}
export function group(id,name,description,parts){return {id,name,description,parts};}
export function exhibit(fields,groups) {
  return {...fields,groups:groups.map(g=>({...g,parts:g.parts.map(({id,name,description,offset})=>({id:g.id+'.'+id,name,description,offset}))})),
    draw(r,phase=0){for(const g of groups)for(const p of g.parts)r.tag(g.id+'.'+p.id,()=>p.draw(r,phase));}};
}
