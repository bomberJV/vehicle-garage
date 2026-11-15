// Mercedes R231 launch brochure, printed p. 40, shows the two swept aluminium
// cheeks, triangular opening, rounded dark cap and recessed tweeter.
// Bang & Olufsen specifies the 19 mm diaphragm. Other dimensions are estimated.
import {part, study, tint, turn} from './mechanism-shapes.js';

const up=[0,0,1], origin=[0,0,0], tau=2*Math.PI;
export const lensPhoto={
  label:'Mercedes-Benz · R231 Acoustic Lens close-up, p. 40',
  url:'https://www.car-mbenz.com/content/media_library/retailer/product/pc/all-class-brochures/SL-Class_R231_0613.pdf#page=42'
};

function bezel(r,c){
  turn(r,c,up,[[-.006,.014],[-.006,.021],[.001,.025],[.003,.024],[.003,.013],[0,.013]],
    '#9fa5a7',{n:24});
}
function tweeter(r,c){
  turn(r,c,up,[[-.017,0],[-.017,.006],[-.010,.008],[-.004,.0105],[.002,.0105],[.003,.0095]],
    '#505355',{n:16});
  turn(r,c,up,[[.003,.0095],[.004,.0088],[.0051,.0065],[.0061,.004],[.0064,0]],'#3b3e40',{n:18});
}
function light(r,c){
  turn(r,c,up,[[.0035,.0105],[.0035,.0128],[.0045,.0128],[.0047,.0105]],'#d5edf1',{n:24});
}
function horn(r,c){
  // Looking into the lens from either seat, the triangular aperture narrows
  // towards the cap. Its two polished flanks curve aft around the tweeter.
  function vertex(t,a,inset=0){
    return [c[0]+(.028-.008*t-inset)*Math.cos(a),c[1]+(.031-.010*t-inset)*Math.sin(a),c[2]+.005+.021*t];
  }
  for(let layer=0;layer<3;layer++){
    const lo=layer/3,hi=(layer+1)/3;
    const atAngle=(t,i)=>(1.22-1.02*t)+(tau-2*(1.22-1.02*t))*i/22;
    for(let i=0;i<22;i++){
      const low=atAngle(lo,i),nextLow=atAngle(lo,i+1),high=atAngle(hi,i),nextHigh=atAngle(hi,i+1);
      r.polygon([vertex(lo,low),vertex(lo,nextLow),vertex(hi,nextHigh),vertex(hi,high)],
        tint('#a5a9a9',.85+.14*Math.cos(low-1.3)),false);
      if(!layer)r.polygon([vertex(0,low),vertex(0,nextLow),vertex(0,nextLow,.002),vertex(0,low,.002)],'#51585a',false);
    }
    for(const edge of [0,22]){
      const low=atAngle(lo,edge),high=atAngle(hi,edge);
      r.polygon([vertex(lo,low,.002),vertex(lo,low),vertex(hi,high),vertex(hi,high,.002)],'#e1e1dc',false);
    }
  }
  turn(r,c,up,[[.013,0],[.014,.0033],[.018,.0085],[.023,.0158],[.026,.0185]],'#bdc6c7',{n:22});
}
function cap(r,c){
  turn(r,c,up,[[.026,0],[.026,.019],[.027,.021],[.030,.0206],[.032,.0174],[.033,.011],[.0332,0]],'#474a4e',{n:22});
}

// The fascia bends in two directions. The stamped seat follows it, while the
// optical stack stays level. Otherwise the forward edge floats above the dash.
export function mountedLens(r,side,dashHeight){
  const x=-.532,y=side*.624;
  const c=[x,y,dashHeight(x,y)+.007];
  const ring=(a,upper)=>{
    const xx=x+.0243*Math.cos(a),yy=y+.0243*Math.sin(a);
    return [xx,yy,upper?c[2]+.001:dashHeight(xx,yy)-.0006];
  };
  for(let i=0;i<24;i++){
    const a=tau*i/24,b=tau*(i+1)/24;
    r.polygon([ring(a,false),ring(b,false),ring(b,true),ring(a,true)],'#686e70',false);
  }
  for(const draw of [bezel,tweeter,light,horn,cap])draw(r,c);
}

export const acousticLensStudy=study('slacousticlens','Acoustic Lens tweeter',
  'At each dash corner a 19 mm tweeter fires upward into the lens. The contour sends high frequencies across a 180-degree horizontal arc.',lensPhoto,[
    part('bezel','Dashboard mounting ring','The circular trim ring seats the unit in the padded dash.',[0,0,-.036],r=>bezel(r,origin)),
    part('driver','19 mm neodymium tweeter','The small dome radiates into the underside of the reflector.',[0,-.038,-.013],r=>tweeter(r,origin)),
    part('light','LED light guide','The light guide traces the mouth of the tweeter. A light sensor beneath the interior mirror regulates the illumination.',[0,.038,-.003],r=>light(r,origin)),
    part('reflector','Acoustic reflector and side cheeks','The reflector turns the wave outward. The flared aluminium shell leaves an opening facing the cabin.',[.042,0,.022],r=>horn(r,origin)),
    part('cap','Dark upper cap','A rounded cap closes the top of the aluminium lens.',[0,0,.047],r=>cap(r,origin))
  ]);
// Open the study looking into the aperture from the passenger compartment.
acousticLensStudy.viewAngle=[1.37,.19];
