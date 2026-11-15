// Studio environment for curved automotive clear coat. The reflected ray moves
// across a bright ceiling, a darker wall below its edge and the neutral floor.
// Sample it once per shared normal in either depth renderer.
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const band=(x,center,width)=>Math.exp(-(((x-center)/width)**2));
export function studioPaintReflection(base,normal,view,alloy=false){
  const dot=normal[0]*view[0]+normal[1]*view[1]+normal[2]*view[2];
  const facing=Math.abs(dot),side=dot<0?-1:1;
  const rx=2*facing*normal[0]*side-view[0];
  const ry=2*facing*normal[1]*side-view[1];
  const rz=2*facing*normal[2]*side-view[2];
  const ceiling=clamp((rz+.06)/.47);
  const strip=band(rz,.17+.06*rx,.24)*(.73+.27*Math.abs(ry));
  const floor=clamp((-rz-.24)/.67);
  const darkWall=band(rz,-.17,.24);
  const grazing=(1-clamp(facing))**4;
  const illumination=.87+.14*ceiling-.17*darkWall+.07*floor+.06*strip;
  const reflected=.025+.10*ceiling+.19*strip+.18*grazing;
  const amount=clamp(reflected*(alloy?1.33:1),0,.76);
  const sky=[218,230,241],ground=[175,159,144];
  return base.map((value,i)=>{
    const environment=sky[i]+(ground[i]-sky[i])*floor;
    return Math.round(clamp(value*illumination*(1-amount)+environment*amount,0,255));
  });
}

const normals=new WeakMap();
function planeNormal(points){
  let normal=normals.get(points);
  if(!normal){
    const [a,b,c]=points,ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2];
    const vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,length=Math.hypot(nx,ny,nz)||1;
    normal=[nx/length,ny/length,nz/length];normals.set(points,normal);
  }
  return normal;
}
const panes=new Set(['cabin.windshield','roof.windshield','roof.door-glass','roof.quarter-glass','roof.rear-glass','roof.sky-glass']);
export function studioSurfaceFinish(face,base,view){
  if(face.part==='running.rims'){
    // Recessed stock barrels are dark. A strong ceiling reflection belongs on
    // the machined spoke faces, not on the surfaces seen through their gaps.
    if(Math.max(...base)<122)return base;
    return studioPaintReflection(base,planeNormal(face.points),view,true);
  }
  if(panes.has(face.part)&&face.opacity<1){
    const n=planeNormal(face.points);
    const facing=Math.abs(n[0]*view[0]+n[1]*view[1]+n[2]*view[2]);
    // The laminated panel retains its authored transmission in both tint
    // states. Grazing glass catches the cool ceiling around the cabin.
    const amount=.07+.49*(1-clamp(facing))**3;
    return base.map((v,i)=>Math.round(v+([198,220,231][i]-v)*amount));
  }
  return base;
}

// Axle centers and half tracks in the three stock meshes, in meters.
const footprints={
  sl550:{axles:[[-1.2925,.8],[1.2925,.802]],length:2.52,width:1.09},
  porsche993cab:{axles:[[-1.16,.7025],[1.112,.722]],length:2.23,width:.95},
  porsche992scab:{axles:[[-1.2,.795],[1.25,.778]],length:2.47,width:1.04}
};
export const hasStudioFinish=vehicle=>Object.hasOwn(footprints,vehicle);
export function drawStudioContactShadow(ctx,project,z,vehicle){
  const car=footprints[vehicle];
  // Derive the footprint from the same camera as the chassis. In an end-on
  // view the contact patches follow the track width; in profile the wheelbase.
  const origin=project([0,0,z]),x=project([1,0,z]),y=project([0,1,z]);
  const xx=x.x-origin.x,xy=x.y-origin.y,yx=y.x-origin.x,yy=y.y-origin.y;
  function footprint(cx,cy,length,width,opacity){
    const p=project([cx,cy,z]);
    let bx=xx*length,by=xy*length,sx=yx*width,sy=yy*width;
    // At an exactly horizontal viewing angle keep a soft screen-space contact
    // a few pixels deep; the mathematical projection of the floor is a line.
    if(Math.abs(bx*sy-by*sx)<2*Math.max(1,Math.abs(bx),Math.abs(sx))){
      if(Math.abs(bx)>Math.abs(sx))sy=2;else by=2;
    }
    ctx.save();ctx.transform(bx,by,sx,sy,p.x,p.y);
    const g=ctx.createRadialGradient(0,0,0,0,0,1);
    g.addColorStop(0,'rgba(0,0,0,'+opacity+')');
    g.addColorStop(.55,'rgba(0,0,0,'+opacity*.75+')');g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  footprint(.04,0,car.length,car.width,.58);
  for(const [x,track] of car.axles)for(const y of [-track,track])footprint(x,y,.31,.215,.75);
}
