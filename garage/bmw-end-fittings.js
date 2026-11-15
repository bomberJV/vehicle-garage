import {e46BodyProfile} from './bmw-e46-body.js';
import {tint,panel,deckPanel} from './exterior-coachwork.js';
import {glazingFace} from './surface-materials.js';
import {reflectorBowl} from './road-lamp-optics.js';

const front=-2.168,rear=2.320,frontJoin=-2.064,rearJoin=2.216;
const trim='#273137',black='#1c252a',chrome='#c0c8c6';
const T=Math.PI*2;
const atSide=(r,s,fn)=>r.instance(s<0?'Driver side':'Passenger side',fn);
const quad=(r,a,b,c,d,color)=>r.polygon([a,b,c,d],color,false);
const rounded=(w,h,rad)=>{
  const points=[];
  for(const [x,z,start] of [[w/2-rad,h/2-rad,0],[-w/2+rad,h/2-rad,.25],[-w/2+rad,-h/2+rad,.5],[w/2-rad,-h/2+rad,.75]])
    for(let i=0;i<=4;i++){const a=T*(start+i/16);points.push([x+rad*Math.cos(a),z+rad*Math.sin(a)]);}
  return points;
};
function border(r,a,b,shade){
  for(let i=0;i<a.length;i++){const j=(i+1)%a.length;quad(r,a[i],a[j],b[j],b[i],typeof shade==='function'?shade(i):shade);}
}
function fasciaX(y,z,forward){
  const t=Math.min(1,Math.abs(y)/.806),radial=(forward?.102:.104)*t**3.4;
  const vertical=forward?Math.max(0,.522-z)*.225+Math.max(0,z-.578)*.13:Math.max(0,.535-z)*.21+Math.max(0,z-.57)*.09;
  const plateRelief=forward&&z>=.496?Math.max(0,1-Math.abs(y)/.32)*.011:0;
  return forward?front+radial+vertical+plateRelief:rear-radial-vertical;
}
function topNose(y){return front+.026+.113*(Math.abs(y)/.80)**2.65;}
function tailX(y){
  // Turn the rear lens around the quarter at its real sheet-metal boundary.
  // Sweeping it forward before it clears the terminal fender station pushes
  // a painted panel through the lens in three-quarter views.
  const bend=Math.min(1,Math.abs(y)/.779);
  return rear-.037-.063*bend**4.35;
}
function fascia(r,paint,forward){
  const top=forward?.619:.655,base=forward?.281:.299,skin=forward?frontJoin:rearJoin;
  const p=(y,z)=>[fasciaX(y,z,forward),y,z];
  const us=[0,.116,.242,.367,.473,.532,.647,.720,.759,.793,.806];
  const zs=forward?[base,.303,.321,.473,.496,.522,.578,top]:[base,.325,.366,.487,.535,.570,top];
  const factor=forward?[.67,.87,.96,1.03,1.07,1.04,.99]:[.58,.67,.92,1.04,1.07,.99];
  for(const s of [-1,1]){
    for(let i=1;i<us.length;i++){
      const a=us[i-1]*s,b=us[i]*s;
      for(let j=1;j<zs.length;j++){
        const lo=zs[j-1],hi=zs[j];
        // The center intake and corner fog/air openings are cut into the skin.
        if(forward&&lo===.321&&hi===.473&&(us[i]<=.473||(us[i-1]>=.532&&us[i]<=.759)))continue;
        quad(r,p(a,lo),p(b,lo),p(b,hi),p(a,hi),tint(paint,factor[j-1]*(1-.055*(us[i]/.81)**2)));
      }
      const lipY=y=>Math.abs(y)>.7?y*.966:y;
      quad(r,p(a,base),p(b,base),[skin,lipY(b),base+.017],[skin,lipY(a),base+.017],tint(paint,.58));
      const upper=y=>[forward?topNose(y):tailX(y),y*.972,top+.008];
      quad(r,p(a,top),p(b,top),upper(b),upper(a),tint(paint,1.06));
    }
    for(let j=1;j<zs.length;j++){
      const lo=zs[j-1],hi=zs[j];
      quad(r,p(s*.806,lo),[skin,s*(forward?.747:.762),lo],[skin,s*(forward?.747:.762),hi],p(s*.806,hi),tint(paint,.87));
    }
  }
}
function inlet(r,paint,side){
  const low=.321,high=.473,inner=side?.532:0,outer=side?.759:.473;
  const surf=(y,z,d=0)=>[fasciaX(y,z,true)+d,y,z];
  for(const s of side?[side]:[-1,1]){
    const edge0=inner*s,edge1=outer*s;
    const path=[[edge0,low],[edge1,low],[edge1,high],[edge0,high]],center=(edge0+edge1)/2;
    const scaled=(u,v)=>[!side&&u===0?0:center+(u-center)*.963,(low+high)/2+(v-(low+high)/2)*.88];
    const innerLoop=path.map(([u,v])=>scaled(u,v));
    for(let k=0;k<4;k++){
      const j=(k+1)%4;
      if(k===3&&!side)continue;
      quad(r,surf(...path[k]),surf(...path[j]),surf(...innerLoop[j],.008),surf(...innerLoop[k],.008),tint(paint,k===0?.7:1.03));
      quad(r,surf(...innerLoop[k],.008),surf(...innerLoop[j],.008),surf(...innerLoop[j],.053),surf(...innerLoop[k],.053),trim);
    }
    r.polygon(innerLoop.map(p=>surf(...p,.053)),black,false);
    if(!side){
      for(let j=0;j<3;j++){
        const z=.345+j*.050,y0=inner*s,y1=(outer-.012)*s;
        quad(r,surf(y0,z,.023),surf(y1,z,.023),surf(y1,z+.013,.020),surf(y0,z+.013,.020),j===1?'#828b89':'#626b6d');
        quad(r,surf(y0,z+.013,.020),surf(y1,z+.013,.020),surf(y1,z+.019,.031),surf(y0,z+.019,.031),'#a6aaa5');
      }
      for(const u of [.119,.244,.367])r.rod(surf(u*s,.335,.039),surf(u*s,.459,.039),.0034,'#535d5e',6);
    }
  }
}
function badge(r,point,radius){
  const ring=(u,v)=>Array.from({length:40},(_,i)=>point(radius*u*Math.cos(T*i/40),radius*u*Math.sin(T*i/40),v));
  r.polygon(ring(1,0),chrome,false);r.polygon(ring(.91,.0008),'#20282b',false);
  for(let k=0;k<4;k++)r.polygon([point(0,0,.0015),...Array.from({length:11},(_,i)=>{const a=T*(k+i/10)/4;return point(radius*.667*Math.cos(a),radius*.667*Math.sin(a),.0015);})],k%2?'#d5ded9':'#497d9c',false);
}
const kidneyShape=[[.030,.730],[.034,.786],[.047,.807],[.071,.818],[.212,.815],[.269,.809],[.293,.792],[.299,.759],[.289,.698],[.274,.662],[.249,.651],[.076,.651],[.051,.658],[.035,.682]];
function kidneys(r,paint){
  for(const s of [-1,1])atSide(r,s,()=>{
    const surface=(u,v,depth=0)=>[topNose(u)-depth,s*u,v];
    const inner=kidneyShape.map(([u,v])=>[.16+(u-.16)*.916,.736+(v-.736)*.881]);
    const outer=kidneyShape.map(p=>surface(...p,.003)),roll=kidneyShape.map(([u,v])=>surface(.16+(u-.16)*.981,.736+(v-.736)*.976,.008));
    border(r,outer,roll,tint(paint,.80));border(r,roll,inner.map(p=>surface(...p,.007)),i=>tint(chrome,i<5?1.12:.89));
    border(r,inner.map(p=>surface(...p,.007)),inner.map(p=>surface(...p,-.023)),trim);
    r.polygon(inner.map(p=>surface(...p,-.024)),black,false);
    for(let j=0;j<9;j++){
      const u=.061+j*.0254,lo=.662+(j===0||j===8?.016:.001),hi=.805-(j===8?.016:0);
      quad(r,surface(u,lo,-.009),surface(u+.005,lo,.001),surface(u+.010,hi,.001),surface(u+.005,hi,-.009),'#465155');
      quad(r,surface(u+.005,lo,.001),surface(u+.009,lo,-.007),surface(u+.014,hi,-.007),surface(u+.010,hi,.001),'#262f34');
    }
  });
}
// The bonnet folds down around the pair of grilles. Metal terminates at each
// aperture, exposing the recessed radiator when either insert is removed.
function deckHeight(x,u,hood){
  const stations=e46BodyProfile.stations;
  const upper=stations.findIndex(p=>p[0]>=x);
  const i=upper<0?stations.length-2:Math.max(0,upper-1);
  const a=stations[i],b=stations[i+1],t=(x-a[0])/(b[0]-a[0]),w=a[1]+t*(b[1]-a[1]),z=a[2]+t*(b[2]-a[2]);
  const frac=hood?e46BodyProfile.hoodFrac:.78,edge=w*frac-.008,u0=Math.abs(u),v=Math.min(1,u0/edge);
  // Match the piecewise-planar crown of the deck, including its .55 lane.
  if(u0>edge)return z+.016*(1-Math.min(1,(u0-edge)/(w-.032-edge)));
  const crown=v<.55?1-.55*v:1-.55**2-(v-.55)*1.55;
  return z+.016+.036*crown;
}
function hoodPress(r,paint){
  const outline=[[0,.644,.822],[.031,.647,.821],[.080,.649,.822],[.248,.647,.824],[.302,.659,.824],[.349,.692,.820]];
  const ordinates=(u,contour,closed)=>{
    const zs=[];
    for(let j=1;j<contour.length+(closed?1:0);j++){
      const a=contour[j-1],b=contour[j%contour.length];
      if(a[0]===b[0]||u<Math.min(a[0],b[0])-1e-10||u>Math.max(a[0],b[0])+1e-10)continue;
      const t=(u-a[0])/(b[0]-a[0]);
      zs.push(a[1]+(b[1]-a[1])*t);
    }
    return zs.length?[Math.min(...zs),Math.max(...zs)]:null;
  };
  const lower=outline.map(([u,lo])=>[u,lo]),upper=outline.map(([u,lo,hi])=>[u,hi]);
  const cuts=[...new Set([...outline,...kidneyShape].map(p=>p[0]))].sort((a,b)=>a-b);
  for(const s of [-1,1])for(let i=1;i<cuts.length;i++){
    const a=cuts[i-1],b=cuts[i],p=(u,z)=>[topNose(u)+.002,s*u,z];
    const az=ordinates(a,lower,false)[0],bz=ordinates(b,lower,false)[0],at=ordinates(a,upper,false)[0],bt=ordinates(b,upper,false)[0];
    const edge=u=>[frontJoin,u*s,deckHeight(frontJoin,u,true)];
    quad(r,p(a,at),p(b,bt),edge(b),edge(a),tint(paint,1.08));
    // Trim the paint to the actual kidney perimeter at every station. Straight
    // horizontal strips leave open triangular wedges around the lower corners.
    if(!ordinates((a+b)/2,kidneyShape,true)){quad(r,p(a,az),p(b,bz),p(b,bt),p(a,at),tint(paint,.96));continue;}
    const [al,ah]=ordinates(a,kidneyShape,true),[bl,bh]=ordinates(b,kidneyShape,true);
    quad(r,p(a,az),p(b,bz),p(b,bl),p(a,al),tint(paint,.92));
    quad(r,p(a,ah),p(b,bh),p(b,bt),p(a,at),tint(paint,1.02));
  }
  badge(r,(u,v,d)=>{const x=frontJoin+.058+v;return [x,u,deckHeight(x,u,true)+.0016+d];},.038);
}
const lightStations=[[.330,.704,.795],[.353,.675,.802],[.386,.650,.807],[.423,.639,.809],[.461,.639,.812],[.493,.648,.812],[.525,.669,.811],[.546,.679,.809],[.567,.669,.807],[.601,.647,.804],[.636,.643,.799],[.668,.650,.794],[.690,.662,.788],[.706,.673,.785]];
function mainLight(r,s){
  const p=(u,z,d=0)=>[topNose(u)-d,s*u,z];
  for(let i=1;i<lightStations.length;i++){
    const a=lightStations[i-1],b=lightStations[i];
    quad(r,p(a[0],a[1],-.002),p(b[0],b[1],-.002),p(b[0],b[2],-.002),p(a[0],a[2],-.002),black);
    quad(r,p(a[0],a[1],.019),p(b[0],b[1],.019),p(b[0],b[1]-.012,.013),p(a[0],a[1]-.012,.013),'#4c575a');
    quad(r,p(a[0],a[2],.015),p(b[0],b[2],.015),p(b[0],b[2]+.007,.002),p(a[0],a[2]+.007,.002),'#394247');
  }
  for(const [cy,cz,rad] of [[.447,.725,.077],[.626,.724,.072]]){
    const sample=(u,v,d)=>p(cy+u,cz+v,d);
    reflectorBowl(r,sample,rad,.000,.013,r.lights);
    // Fluted facets on the lower lip and a dark upper return break up the
    // mirror surface; neither is the illuminated ring of the later BMWs.
    const arc=(start,end,inside,outside,depth,shade)=>{
      for(let j=0;j<18;j++){
        const a=start+(end-start)*j/18,b=start+(end-start)*(j+1)/18;
        const at=(t,v)=>sample(Math.cos(t)*rad*v,Math.sin(t)*rad*v,depth);
        quad(r,at(a,inside),at(b,inside),at(b,outside),at(a,outside),shade(j));
      }
    };
    arc(.23,2.87,.85,.985,.0165,()=>r.lights?'#9b9e90':'#707a7a');
    arc(3.36,5.96,.69,.964,.0163,i=>i%3?'#bdc5c0':'#909b99');
    // The clear weather shield is common, while the bright reflector rims
    // retain their individual lower scallops. Neither is a luminous ring.
    const loop=(scale,d)=>Array.from({length:40},(_,i)=>sample(rad*scale*Math.cos(i*T/40),rad*scale*Math.sin(i*T/40),d));
    border(r,loop(1.04,.012),loop(.965,.016),i=>tint(chrome,.76+.20*Math.sin(i*T/40)));
    const base=loop(.181,.016);r.polygon(base,r.lights?'#c5c5ab':'#56646a',false);
    const disk=loop(.110,.017);r.polygon(disk,r.lights?'#eae7c6':'#ced0c4',false);
  }
  for(let i=1;i<lightStations.length;i++){
    const a=lightStations[i-1],b=lightStations[i];
    glazingFace(r,[p(a[0],a[1],.022),p(b[0],b[1],.022),p(b[0],b[2],.022),p(a[0],a[2],.022)],'#b9c8cc',.17);
  }
}
function frontCorner(r,s){
  const path=[[.710,.673,.783,-.005],[.749,.668,.777,.023],[.784,.666,.766,.069],[.813,.665,.749,.116],[.830,.665,.693,.144]];
  const at=(p,z,d)=>{
    const x=topNose(.707)+p[3]-d;
    const [a,b]=e46BodyProfile.stations, next=e46BodyProfile.stations[2];
    const lo=x<b[0]?a:b,hi=x<b[0]?b:next;
    const w=lo[1]+(hi[1]-lo[1])*(x-lo[0])/(hi[0]-lo[0]),h=lo[2]+(hi[2]-lo[2])*(x-lo[0])/(hi[0]-lo[0]);
    const shell=e46BodyProfile.sideSection(w,(z-e46BodyProfile.base)/(h-e46BodyProfile.base));
    return [x,s*Math.max(p[0]+.38*d,x>frontJoin?shell+.002+d*.13:0),z];
  };
  for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i];
    quad(r,at(a,a[1],.017),at(b,b[1],.017),at(b,b[2],.017),at(a,a[2],.017),i<3?'#bd842e':'#ae7228');
    const a0=a[1]+.007,b0=b[1]+.007,a1=a[2]-.008,b1=b[2]-.008;
    glazingFace(r,[at(a,a0,.019),at(b,b0,.019),at(b,b1,.019),at(a,a1,.019)],'#e9aa49',.51);
    for(let j=1;j<=3;j++){
      const t=j/4,m=a.map((v,k)=>v+(b[k]-v)*t);
      r.rod(at(m,m[1]+.009,.0205),at(m,m[2]-.011,.0205),.0013,'#d5973e',6);
    }
  }
}
function frontValance(r,paint){
  for(const s of [-1,1]){
    let prev=[0,.644,.822];
    for(const row of [[.031,.647,.821],[.080,.649,.822],[.248,.647,.824],[.302,.659,.824],[.330,.704,.795],...lightStations.slice(1),[.748,.658,.784],[.782,.653,.757]]){
      const [u,low,upper]=row,[old,lo,hi]=prev;
      const p=(a,z,d=0)=>[topNose(a)+d,s*a,z];
      const below=(u,z)=>u<.330?z-.0007:z-.010;
      quad(r,p(old,.618),p(u,.618),p(u,below(u,low)),p(old,below(old,lo)),tint(paint,1.004));
      if(old<.33){
        quad(r,p(old,below(old,lo)-.002,.009),p(u,below(u,low)-.002,.009),p(u,low+.012,.009),p(old,lo+.012,.009),trim);
      }
      if(old>=.33){
        quad(r,p(old,hi+.006),p(u,upper+.006),[frontJoin,s*Math.min(.715,u),deckHeight(frontJoin,Math.min(.715,u),true)],[frontJoin,s*Math.min(.715,old),deckHeight(frontJoin,Math.min(.715,old),true)],tint(paint,1.06));
      }
      prev=row;
    }
  }
}
function fog(r,s){
  const y=s*.644,z=.405,map=(u,v,d)=>[fasciaX(y+u,z+v,true)+.010-d,y+u,z+v];
  const ring=(scale,d)=>Array.from({length:36},(_,i)=>map(Math.cos(i*T/36)*scale,Math.sin(i*T/36)*scale,d));
  border(r,ring(.070,.0),ring(.053,.007),'#4b575c');
  border(r,ring(.053,.007),ring(.047,-.003),chrome);
  reflectorBowl(r,map,.045,-.004,.005,r.lights);
  glazingFace(r,ring(.048,.009),'#bbc9c9',.22);
  for(let i=0;i<3;i++){
    const a=i*T/3,dy=Math.cos(a)*.060,dz=Math.sin(a)*.060;
    r.polygon(rounded(.006,.006,.002).map(([u,v])=>map(u+dy,v+dz,.005)),trim,false);
  }
}
// Across the split the seam follows the slanted vertical edge of the trunk.
function lampWidth(u,z){
  const weight=Math.max(0,1-Math.abs(u-.5515)/.21);
  return u+.068*((z-.843)/.179)*weight;
}
function rearLamp(r,s,trunk){
  const inner=trunk?.310:.555,outer=trunk?.548:.779;
  // Inner light moves with the lid; the outer housing wraps around the fender.
  const width=outer-inner,at=(u,z,d)=>{z+=.126;u=lampWidth(u,z);return[tailX(u)+d,s*u,z];};
  const columns=trunk?[[0,.667,.732],[.22,.659,.754],[.70,.640,.777],[1,.627,.799]]:[[0,.627,.799],[.42,.627,.800],[.75,.632,.796],[.92,.638,.789],[1,.650,.777]];
  for(let i=1;i<columns.length;i++){
    const a=columns[i-1],b=columns[i],u=inner+width*a[0],v=inner+width*b[0];
    const point=(s0,k,t,d)=>at(k,s0[1]+(s0[2]-s0[1])*t,d);
    const bounds=trunk?[0,.11,.58,.92,1]:[0,.12,.61,.95,1];
    const colors=trunk?['#8c272c','#aa3135','#aebcb7','#77272d']:['#91262d','#aa2c33','#be8b43','#993d30'];
    for(let k=1;k<bounds.length;k++){
      const t=bounds[k-1],h=bounds[k],opt=colors[k-1];
      quad(r,point(a,u,t,.005),point(b,v,t,.005),point(b,v,h,.005),point(a,u,h,.005),opt);
      for(let j=1;j<4;j++){
        const f=t+(h-t)*j/4,cut=trunk&&k===3?'#798e89':!trunk&&k===3?'#a77236':'#8e272c';
        quad(r,point(a,u,f-.004,.006),point(b,v,f-.004,.006),point(b,v,f+.004,.006),point(a,u,f+.004,.006),cut);
      }
    }
    quad(r,at(u,a[1],.005),at(v,b[1],.005),at(v,b[1]-.005,-.008),at(u,a[1]-.005,-.008),trim);
    quad(r,at(u,a[2],.005),at(v,b[2],.005),at(v,b[2]+.004,-.007),at(u,a[2]+.004,-.007),trim);
  }
  if(trunk)return;
  // Rear quarters sweep forward in plan. The outer cheek bridges the aft
  // light face to the curved side, with a rising lower edge toward the wheel.
  const from=tailX(outer)+.005;
  const edge=[[from,outer,.776,.903],[2.191,.778,.775,.904],[2.169,.785,.777,.904],[2.125,.795,.789,.905],[2.089,.807,.809,.902],[2.060,.815,.831,.889],[2.045,.821,.851,.874]];
  for(let i=1;i<edge.length;i++)for(const [lo,hi,col] of [[0,.12,'#8b292d'],[.12,.61,'#ad2d33'],[.61,.95,'#c48a3b'],[.95,1,'#96392d']]){
    const point=(row,t)=>[row[0],s*row[1],row[2]+(row[3]-row[2])*t];
    quad(r,point(edge[i-1],lo),point(edge[i],lo),point(edge[i],hi),point(edge[i-1],hi),col);
  }
}
function rearSheet(r,paint){
  // Continuous flange below the plate recess; the folded trunk edge clears
  // the stationary bumper without a slot into the car.
  deckPanel(r,false,()=>{
    for(const side of [-1,1]){
      const p=(u,x,z)=>[x,side*u,z];
      quad(r,p(0,tailX(0)-.008,.669),p(.310,tailX(.310)-.008,.669),p(.310,tailX(.310)-.017,.657),p(0,tailX(0)-.017,.657),tint(paint,.75));
    }
  });
  for(const s of [-1,1]){
    const cols=[[0,.737,.927],[.310,.793,.858],[.362,.785,.880],[.477,.766,.903],[.548,.753,.925],[.555,.753,.925],[.649,.753,.926],[.723,.758,.922],[.761,.764,.915],[.779,.776,.903]];
    const p=(u,z,d=0)=>{u=lampWidth(u,z);return [tailX(u)+d,s*u,z];};
    const top=u=>1.004-.043*(u/.779)**2;
    for(let k=1;k<cols.length;k++){
      const a=cols[k-1],b=cols[k],central=k===1,seam=k===5;
      const draw=()=>{
        // The plate pressing is inset toward the front. The light apertures
        // continue through the sheet: the rubber returns form their edges.
        const depth=central?-.016:-.003;
        const lo=central?.669:.663;
        quad(r,p(a[0],lo,-.008),p(b[0],lo,-.008),p(b[0],b[1]-.006,depth),p(a[0],a[1]-.006,depth),tint(paint,.89));
        if(central||seam)quad(r,p(a[0],a[1]-.006,depth),p(b[0],b[1]-.006,depth),p(b[0],b[2]+.006,depth),p(a[0],a[2]+.006,depth),tint(paint,seam?.73:.89));
        else for(const j of [1,2]){
          const delta=j===1?-.006:.006;
          quad(r,p(a[0],a[j]+delta,depth),p(b[0],b[j]+delta,depth),p(b[0],b[j]+delta,-.040),p(a[0],a[j]+delta,-.040),trim);
        }
        quad(r,p(a[0],a[2]+.006,depth),p(b[0],b[2]+.006,depth),p(b[0],top(b[0]),-.005),p(a[0],top(a[0]),-.005),tint(paint,.94));
        const join=u=>{u=Math.min(.730,lampWidth(u,top(u)));return[rearJoin,s*u,deckHeight(rearJoin,u,false)];};
        quad(r,p(a[0],top(a[0]),-.005),p(b[0],top(b[0]),-.005),join(b[0]),join(a[0]),tint(paint,1.08));
      };
      if(k<=4)deckPanel(r,false,draw);else r.tag('body.structure',draw);
    }
  }
  deckPanel(r,false,()=>{
    const lip=rounded(.450,.041,.015),pad=rounded(.309,.147,.011);
    r.polygon(pad.map(([u,v])=>[tailX(u)-.009,u,.788+v]),'#a8aeaa',false);
    r.polygon(lip.map(([u,v])=>[tailX(u)+.002,u,.897+v]),tint(paint,.89),false);
    badge(r,(u,v,d)=>[tailX(u)+.003+d,u,.965+v],.031);
  });
}
export function drawBmwEndFittings(r,paint){
  r.rigid('front-bumper',[-.51,0,-.10],()=>r.tag('body.front-bumper',()=>{
    fascia(r,paint,true);
    // The molded license-plate pedestal leaves the horizontal intake open
    // below it. In a head-on view its lower return casts a narrow dark edge.
    const pedestal=rounded(.550,.117,.018);
    const rim=pedestal.map(([y,z])=>[front,y,z+.561]);
    const back=pedestal.map(([y,z])=>[fasciaX(y,z+.561,true)+.004,y*1.036,z+.559]);
    border(r,back,rim,tint(paint,.74));r.polygon(rim,tint(paint,.99),false);
    inlet(r,paint,0);inlet(r,paint,-1);inlet(r,paint,1);
    for(const s of [-1,1]){const f=(u,z)=>[fasciaX(s*u,z,true)-.0019,s*u,z];for(const [a,b] of [[.478,.62],[.62,.72],[.72,.79]])quad(r,f(a,.525),f(b,.525),f(b,.532),f(a,.532),tint(paint,.72));}
  }));
  r.rigid('rear-bumper',[.51,0,-.10],()=>r.tag('body.rear-bumper',()=>{
    fascia(r,paint,false);
    for(const s of [-1,1]){
      for(const [a,b] of [[0,.30],[.30,.54],[.54,.70]]){
        const f=(u,z)=>[fasciaX(s*u,z,false)+.003,s*u,z];
        for(let k=0;k<6;k++){
          const lo=a+(b-a)*k/6,hi=a+(b-a)*(k+1)/6;
          quad(r,f(lo,.370),f(hi,.370),f(hi,.389),f(lo,.389),tint(paint,.57));
        }
      }
    }
  }));
  r.tag('body.structure',()=>frontValance(r,paint));
  panel(r,'bonnet',[0,0,.71],'body.hood',()=>{hoodPress(r,paint);r.tag('body.kidneys',()=>kidneys(r,paint));});
  rearSheet(r,paint);
  for(const s of [-1,1])atSide(r,s,()=>{
    r.tag('lighting.headlamp',()=>mainLight(r,s));r.tag('lighting.indicator',()=>frontCorner(r,s));r.tag('lighting.fog',()=>fog(r,s));
    r.tag('lighting.repeater',()=>{
      const loop=rounded(.085,.025,.011),center=[-.927,s*.870,.781];
      r.polygon(loop.map(([u,v])=>[center[0]+u,s*(.871+v*.03),center[2]+v]),'#593e24',false);
      r.polygon(loop.map(([u,v])=>[center[0]+u*.91,s*(.875+v*.03),center[2]+v*.82]),'#d3984d',false);
    });
    r.tag('lighting.tail',()=>rearLamp(r,s,false));
    deckPanel(r,false,()=>r.tag('lighting.reverse',()=>rearLamp(r,s,true)));
  });
}
