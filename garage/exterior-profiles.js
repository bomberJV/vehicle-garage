// Source coordinates stay in their original image plane, with y increasing down.
// Porsche’s rescue sheets show the raised fabric top. The BMW studio
// photograph faces right. Registration preserves the vertical axis for both views.
export const exteriorProfiles={
  g500:{
    label:'Overlay the long G500 workshop drawing',
    legend:'Gold line · Mercedes-Benz long G500, drawing P00.10-2351-50, page 25. Both axle centers register the later body elevation to the 2002 US model. The hood mounting height follows the modeled US grille.',
    front:[310,820],rear:[733,820],
    curves:[[[222,706.5],[240,700],[265,696],[300,693],[330,691.5],[365,690],[397,687.5]],
      [[410,678],[426,650],[440,625],[450,607],[465,591],[480,588],[510,585.5],[550,583.5],[600,582.5],[650,583],[700,583.5],[760,584.5],[800,586],[812,587],[822,591]]]
  },
  sl550:{
    label:'Overlay the R231 workshop drawing',
    legend:'Gold line · Mercedes-Benz R231 service introduction, drawing P00.10-5105-00, printed page 20. The wheel centers align the SL 500 drawing with the US SL550.',
    front:[297.7,565.4],rear:[620.3,565.7],
    curves:[[[181,518],[190,514],[210,508],[235,504],[260,500],[285,498],[311,495],[340,493],[360,491],[377,489],[397,480],[417,469],[437,459],[457,450],[478,444],[500,442],[520,442],[540,443],[560,445],[580,449],[600,455],[620,463],[640,473],[655,478],[680,481],[700,483],[720,485],[732,487]]]
  },
  porsche993cab:{
    label:'Overlay the 993 Cabriolet drawing',
    legend:'Gold line · Porsche Classic side elevation, page 32. Registered at the wheel centers.',
    front:[284.8,923.2],rear:[656.9,923.2],
    curves:[[[135,895],[159,878],[183,864],[195,855],[219,849],[255,844],[279,842],[315,835],[351,829],[363,827],[399,802],[435,776],[447,767],[471,763],[507,762],[543,763],[579,766],[615,772],[627,776],[663,794],[699,812],[735,828],[771,845],[795,859],[807,868],[819,883]]]
  },
  porsche996cab:{
    label:'Overlay the 996 Cabriolet drawing',
    legend:'Gold line · Porsche Classic 996 Cabriolet side elevation, page 36, read from the sheet’s vector paths. Registered at the wheel centers.',
    front:[180.95,575.2],rear:[414.85,575.2],
    curves:[[[81.2,555.8],[84.3,552.7],[86.5,551.0],[91.3,547.8],[94.9,545.9],[100.3,543.3],[107.3,540.4],[115.0,537.4],[122.8,534.5],[130.2,532.3],[136.5,528.9],[138.0,527.9],[140.5,526.8],[152.4,524.3],[166.7,522.3],[182.1,521.0],[197.3,520.1],[211.0,519.6],[216.2,518.4],[233.1,508.0],[248.5,499.0],[261.9,491.6],[281.5,481.2],[289.2,478.3],[296.6,476.8],[304.0,475.9],[311.1,475.4],[323.5,475.1],[329.8,475.2],[346.3,475.8],[361.5,476.6],[393.6,481.7],[444.8,503.9],[469.1,515.5],[496.4,521.7],[503.1,526.2],[506.6,529.9],[506.8,532.8],[508.5,535.4],[511.0,539.4],[513.9,542.3],[516.0,545.0],[516.7,546.5]]]
  },
  porsche992scab:{
    label:'Overlay the 992 Cabriolet drawing',
    legend:'Gold line · Porsche 992 Cabriolet side elevation, page 86. Registered at the wheel centers.',
    front:[168.4,570.075],rear:[421.789,570.835],
    curves:[[[67,548.8],[83,539.5],[107,529],[115,525.5],[123,520.8],[139,517.2],[163,514.8],[187,511],[203,510.5],[227,497.5],[251,485.5],[275,474.5],[291,470.8],[315,468.8],[331,468.8],[355,470.2],[379,473.5],[403,478.5],[427,485],[451,492.5],[467,495.8],[483,501.2],[499,508.5],[515,516.2],[523,526]]]
  },
  bmws1000rr:{
    label:'Mark the BMW studio-photo landmarks',
    legend:'Gold diamonds · nose, roundel, screen, tank, tail, belly pan and front fender in the Racing Red side photograph. Registered at the wheel centers.',
    front:[1013,596],rear:[194,580],
    points:[[1078,379],[949,376],[882,88],[601,192],[126,187],[848,677],[1089,436]]
  }
};

export function registeredProfilePoint([u,v],profile,wheels){
  const a=wheels.front||wheels['front-left'], b=wheels.rear||wheels['rear-left'];
  const [u0,v0]=profile.front,[u1,v1]=profile.rear;
  // A 2D similarity transform aligns both axle points using one isotropic scale.
  const forward=Math.sign(u1-u0),du=Math.abs(u1-u0),dv=v0-v1;
  const dx=b[0]-a[0],dz=b[2]-a[2],den=du*du+dv*dv;
  const k=(dx*du+dz*dv)/den,s=(dz*du-dx*dv)/den;
  const along=forward*(u-u0),up=v0-v;
  return [a[0]+k*along-s*up,0,a[2]+s*along+k*up];
}

// Cut the side projection with a vertical line at each sampled drawing station.
// This measures the visible upper outline, including any standard fitted trim.
export function upperOutlineGap(profile,wheels,faces){
  if(!profile?.curves)return null;
  const stations=profile.curves.flat().map(point=>{
    const [x,,z]=registeredProfilePoint(point,profile,wheels);
    return {x,z,top:-Infinity};
  });
  function intersect(a,b){
    const span=b[0]-a[0];
    if(Math.abs(span)<1e-9)return;
    const low=Math.min(a[0],b[0]),high=Math.max(a[0],b[0]);
    for(const station of stations){
      if(station.x<low||station.x>high)continue;
      const z=a[2]+(b[2]-a[2])*(station.x-a[0])/span;
      station.top=Math.max(station.top,z);
    }
  }
  for(const {points,triangles} of faces){
    if(triangles){
      // Batches can hold disconnected triangles. Joining their vertex arrays
      // end-to-end introduces edges across empty space in the measured outline.
      for(let i=0;i<triangles.length;i+=3){
        const a=points[triangles[i]],b=points[triangles[i+1]],c=points[triangles[i+2]];
        intersect(a,b);intersect(b,c);intersect(c,a);
      }
    }else{
      for(let i=0;i<points.length;i++)intersect(points[i],points[(i+1)%points.length]);
    }
  }
  const gaps=stations.filter(s=>Number.isFinite(s.top)).map(s=>Math.abs(s.top-s.z)*1000).sort((a,b)=>a-b);
  const count=gaps.length;
  if(!count)return null;
  const median=(gaps[Math.floor((count-1)/2)]+gaps[Math.floor(count/2)])/2;
  return {count,median:Math.round(median),maximum:Math.round(gaps.at(-1))};
}
