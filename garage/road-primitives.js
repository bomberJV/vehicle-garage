// Small closed or annular meshes shared by the road models. The wheel axis is Y.
const TAU = Math.PI * 2;
export function tint(hex, amount) {
  const rgb = [1, 3, 5].map(i => Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(i, i+2),16)*amount))));
  return '#' + rgb.map(c=>c.toString(16).padStart(2,'0')).join('');
}
export function strip(r, a, b, color) {
  for(let i=0;i<a.length-1;i++) r.polygon([a[i],a[i+1],b[i+1],b[i]],color,false);
}
export function pipe(r, points, radius, color, sides=10) {
  for(let i=1;i<points.length;i++) r.rod(points[i-1],points[i],radius,color,sides);
}
export function ellipse(r, origin, u, v, outer, inner, color, n=32) {
  const point=(i,s)=>origin.map((x,j)=>x+s*(u[j]*Math.cos(i*TAU/n)+v[j]*Math.sin(i*TAU/n)));
  for(let i=0;i<n;i++) {
    const face=inner===0?[origin,point(i,outer),point(i+1,outer)]:[point(i,inner),point(i,outer),point(i+1,outer),point(i+1,inner)];
    r.polygon(face,color,false);
  }
}
export function barrel(r, a,b,radius,color,n=14) {
  r.rod(a,b,radius,color,n);
  const v=b.map((p,i)=>p-a[i]),length=Math.hypot(...v);
  if(!length)return;
  const unit=v.map(x=>x/length),ref=Math.abs(unit[2])<.85?[0,0,1]:[0,1,0];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const raw=cross(unit,ref),u=raw.map(x=>x/Math.hypot(...raw)),w=cross(unit,u);
  for(const cap of [a,b])r.polygon(Array.from({length:n},(_,i)=>cap.map((x,j)=>x+radius*(u[j]*Math.cos(i*TAU/n)+w[j]*Math.sin(i*TAU/n)))),color,false);
}
export function ellipsoid(r, [x,y,z], [rx,ry,rz], color, n=18,m=10) {
  const point=(i,j)=>{const a=i*TAU/n,b=j*Math.PI/m-Math.PI/2;return [x+rx*Math.cos(a)*Math.cos(b),y+ry*Math.sin(a)*Math.cos(b),z+rz*Math.sin(b)];};
  for(let j=0;j<m;j++)for(let i=0;i<n;i++) {
    const pts=j===0?[point(i,j),point(i+1,j+1),point(i,j+1)]:j===m-1?[point(i,j),point(i+1,j),point(i+1,j+1)]:[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)];
    r.polygon(pts,tint(color,.76+.23*(j+1)/m+.08*Math.sin(i*TAU/n)),false);
  }
}
// Rounded tread shoulders and open alloy centers. Every material occupies its own surface.
export function wheel(r,options) {
  const axle=options.rear?'rear':'front';
  const label=options.moto?axle:axle+'-'+(options.side<0?'left':'right');
  r.instance(label,()=>wheelMesh(r,options));
}
function wheelMesh(r,{x,y,z,radius,width,rim,brakeRim=rim,side=1,moto=false,rear=false,modern=false,finish='#c0c9d1',tags,drawRim,drawBrake}) {
  const N=36;
  const ring=(dy,rad)=>Array.from({length:N+1},(_,i)=>[x+rad*Math.cos(i*TAU/N),y+dy,z+rad*Math.sin(i*TAU/N)]);
  const bead=moto?(width<.15?.04445:.0762)/width:0;
  const section=drawRim&&!moto?[[-.50,rim/radius],[-.49,.95],[-.39,1],[.39,1],[.49,.95],[.50,rim/radius]]:moto?[[-bead,(rim+.002)/radius],[-.50,.74],[-.48,.81],[-.38,.91],[-.2,.978],[0,1],[.2,.978],[.38,.91],[.48,.81],[.50,.74],[bead,(rim+.002)/radius]]:
    [[-.50,rim/radius],[-.504,.87],[-.48,.966],[-.38,1],[-.15,1],[.15,1],[.38,1],[.48,.966],[.504,.87],[.50,rim/radius]];
  r.tag(tags.tire,()=>{
    if(drawRim&&!moto){
      // A radial tire's sidewall bulges past the rim flange and catches a soft
      // sheen at its widest point, then rolls over a darker shoulder.
      const k=rim/radius,at=t=>k+(.95-k)*t;
      // The nominal section width is measured across the bulge.
      const side=[[-.455,at(0),'#1e2124'],[-.485,at(.22),'#262a2e'],[-.50,at(.5),'#30343a'],[-.493,at(.78),'#2a2e33'],[-.475,.95,'#22252a'],[-.44,.985,'#1f2226'],[-.38,1,'#1d2024']];
      const rows=[...side,...side.slice().reverse().map(([dy,rad,c])=>[-dy,rad,c])];
      // Each band is one indexed mesh, which keeps the scene's face count low.
      for(let i=1;i<rows.length;i++){
        const a=ring(rows[i-1][0]*width,rows[i-1][1]*radius),b=ring(rows[i][0]*width,rows[i][1]*radius),points=[],triangles=[];
        for(let j=0;j<=N;j++){points.push(a[j],b[j]);if(j){const q=j*2;triangles.push(q-2,q-1,q+1,q-2,q+1,q);}}
        r.polygon(points,rows[i-1][1]>rows[i][1]?rows[i][2]:rows[i-1][2],false);
        if(r.faces?.length)r.faces.at(-1).triangles=triangles;
      }
      return;
    }
    for(let i=1;i<section.length;i++)strip(r,ring(section[i-1][0]*width,section[i-1][1]*radius),ring(section[i][0]*width,section[i][1]*radius),i%2?'#272a2e':'#22252a');
  });
  r.tag(tags.rim,()=>{
    if(drawRim){drawRim(r,{x,y,z,rim,width,side,finish});return;}
    for(const s of (moto?[-1,1]:[side])) {
      const lip=y+s*width*.505,face=y+s*width*(moto?.27:.44),hub=y+s*width*.30;
      r.ringY(x,lip,z,rim,rim*.915,tint(finish,1.15),N);
      r.tubeY(x,y-s*width*.27,lip,z,rim*.915,'#535d64',N);
      const spoke=(angle,rad,shift,dy)=>[x+rad*Math.cos(angle+shift),dy,z+rad*Math.sin(angle+shift)];
      for(let j=0;j<5;j++){
        const a=j*TAU/5;
        for(const branch of (modern||moto?[-1,1]:[0])){
          const lean=branch*.155,base=branch*.065;
          const h0=spoke(a,rim*.20,base-.23,hub), h1=spoke(a,rim*.20,base+.23,hub);
          const m0=spoke(a,rim*.58,lean-.09,face),m1=spoke(a,rim*.58,lean+.09,face);
          const o0=spoke(a,rim*.93,lean*1.5-.065,lip-s*.003),o1=spoke(a,rim*.93,lean*1.5+.065,lip-s*.003);
          r.polygon([h0,h1,m1,m0],tint(finish,.78),false);r.polygon([m0,m1,o1,o0],tint(finish,1.04),false);
        }
      }
      r.ringY(x,hub+s*.003,z,rim*.23,0,'#68727a',24);
      if(!moto)for(let j=0;j<5;j++){const a=j*TAU/5;r.ringY(x+.032*Math.cos(a),hub+s*.006,z+.032*Math.sin(a),.006,0,'#30343c',8);}
    }
  });
  r.tag(tags.brake,()=>{
    if(drawBrake){drawBrake(r,{x,y,z,width,rear,side});return;}
    for(const s of (moto&&!rear?[-1,1]:[side])){
      const plane=y+s*width*(moto?.52:.18),disc=brakeRim*(rear?.68:.79);
      r.ringY(x,plane,z,disc,disc*.60,'#a7afb1',32);
      r.ringY(x,plane-s*.008,z,disc,disc*.60,'#77818a',32);
      for(let i=0;i<6;i++){const a=i*TAU/6;r.rod([x,y,z],[x+disc*.65*Math.cos(a),plane,z+disc*.65*Math.sin(a)],.009,'#757577',6);}
      const p=[x+disc*.82,plane,z+.055];r.box(p[0]-.028,plane-.02,p[2]-.052,p[0]+.029,plane+.02,p[2]+.052,modern?'#9f272e':'#444b52');
    }
  });
}
