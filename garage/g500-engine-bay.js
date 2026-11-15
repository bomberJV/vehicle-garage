import {drawG500OilElement,oilAxis,oilCenter} from './g500-filter-geometry.js';
// M113.962 installation. -X is the grille, +X the bellhousing and
// -Y the left (US driver) bank. Dimensions are fitted to the bay photograph.
const plastic='#303438',dark='#242a2c',rubber='#383d40',metal='#879091';
const stations=[[-.445,.151,.728],[-.39,.184,.763],[-.21,.202,.779],[.02,.187,.789],[.27,.174,.778],[.406,.151,.747]];
const crown=(x,w,h,u)=>[x,u*w,h-.031*u*u];
function cleanerSurface(t,rows){
  for(let i=1;i<rows.length;i++){
    const a=rows[i-1],b=rows[i];
    const bands=[-1,-.67,-.18,.18,.67,1];
    for(let j=1;j<bands.length;j++){
      const u=bands[j-1],v=bands[j];
      const mat=Math.abs(u+v)<.02?'#424648':plastic;
      t.poly([crown(...a,u),crown(...a,v),crown(...b,v),crown(...b,u)],mat);
    }
    for(const side of [-1,1]){
      const c=crown(...a,side),d=crown(...b,side);
      t.poly([c,d,[d[0],d[1],d[2]-.069],[c[0],c[1],c[2]-.069]],dark);
    }
  }
  for(const row of [rows[0],rows.at(-1)]){
    const top=[-1,-.67,-.18,.18,.67,1].map(u=>crown(...row,u));
    t.poly([...top,...top.slice().reverse().map(([x,y,z])=>[x,y,z-.069])],dark);
  }
}
export function g500Induction(tag,t){
  tag('airbox',()=>{
    // The two filter pods sit along the sides of one lift-off cleaner assembly.
    // Their common trim has a broad, rounded nose and a narrow bright spine.
    for(const side of [-1,1]){
      // The driver's front corner is recessed around the service oil filler.
      const nose=side<0?-.259:-.369;
      const pod=[[nose,.103,.661],[nose+.079,.111,.690],[.09,.115,.713],[.33,.112,.708],[.398,.086,.674]];
      const surf=(row,u)=>[row[0],side*(.257+row[1]*u),row[2]-.014*u*u];
      for(let i=1;i<pod.length;i++){
        const ends=[pod[i-1],pod[i]];
        for(const u of [-1,0])t.poly([surf(ends[0],u),surf(ends[0],u+1),surf(ends[1],u+1),surf(ends[1],u)],u<0?dark:'#353b3e');
        for(const u of [-1,1]){
          const [a,b]=ends.map(row=>surf(row,u));
          t.poly([a,b,[b[0],b[1],b[2]-.063],[a[0],a[1],a[2]-.063]],dark);
        }
      }
      for(const row of [pod[0],pod.at(-1)]){
        const [a,b]=[-1,1].map(u=>surf(row,u));
        t.poly([a,b,[b[0],b[1],b[2]-.063],[a[0],a[1],a[2]-.063]],dark);
      }
    }
    cleanerSurface(t,stations);
    for(let i=2;i<stations.length;i++){
      const a=stations[i-1],b=stations[i],pt=(row,side)=>[row[0],side*.019,row[2]+.001];
      t.poly([pt(a,-1),pt(b,-1),pt(b,1),pt(a,1)],'#a9aeaa');
    }
    for(let i=2;i<stations.length-1;i++)for(const sign of [-1,1]){
      const [x,w,h]=stations[i],p=crown(x,w,h,sign*.18),q=crown(x-.039,w,h,sign*.99);
      t.poly([p,q,[q[0]+.004,q[1],q[2]+.001],[p[0]+.004,p[1],p[2]+.001]],'#515557');
    }

    // Circular star badge on the detachable face of the cover. Follow the
    // rise of the cover at the badge so the emblem cannot cut into its skin.
    const zAt=x=>.763+(x+.39)*(.779-.763)/.18+.002;
    const badge=(a,r)=>{const x=-.307+r*Math.cos(a),y=r*Math.sin(a);return [x,y,zAt(x)-.031*(y/.194)**2];};
    const n=36;
    for(let i=0;i<n;i++){
      const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;
      t.poly([badge(a,.046),badge(b,.046),badge(b,.0415),badge(a,.0415)],'#a8adaa');
    }
    for(let i=0;i<3;i++){
      const a=i*2*Math.PI/3;
      t.poly([badge(a,0),badge(a-Math.PI/2,.0048),badge(a,.042),badge(a+Math.PI/2,.0048)],'#b6bbb8');
    }
  });
  tag('intake-duct',()=>{
    for(const s of [-1,1]){
      const a=[-.713,s*.544,.499],b=[-.559,s*.448,.603],c=[-.424,s*.330,.638],d=[-.325,s*.274,.648];
      const inlet=[-.827,s*.574,.494];
      t.tube(inlet,a,.064,.051,dark,12);
      t.route([a,b,c,d],.058,rubber,14);
      for(let i=0;i<7;i++){
        const v=i/7,at=f=>a.map((p,k)=>p+(b[k]-p)*f);
        t.cyl(at(v),at(v+.040),.063,dark,14,false);
      }
      t.route([[.355,s*.259,.644],[.382,s*.134,.649],[.404,0,.638]],.042,dark,12);
    }
  });
  tag('maf',()=>{
    t.tube([.390,0,.633],[.496,0,.633],.055,.046,dark,16);
    t.box(.419,-.044,.670,.478,-.007,.699,plastic);
  });
  tag('throttle',()=>{
    // The meter's outlet turns down into the rear-facing throttle bore.
    t.route([[.495,0,.633],[.526,0,.614],[.525,0,.574],[.497,0,.551]],.047,rubber,12);
    t.tube([.425,0,.551],[.501,0,.551],.057,.046,metal,18);
    t.box(.430,-.095,.527,.488,-.051,.573,plastic);
    t.cyl([.456,-.044,.551],[.456,.044,.551],.004,'#b09f7e',6);
  });
}
export function g500Ignition(r,tag,t,cells){
  // The boot and porcelain share an endpoint, so neither lead can terminate
  // in free space when the coil or the two matching plugs are isolated.
  const plug=(x,s,k)=>[x+k*.031,s*.446,.368];
  tag('coils',()=>{
    for(const {x,side:s,index} of cells)r.instance(s+'-'+index,()=>{
      t.box(x-.041,s*.429-.036,.548,x+.042,s*.429+.036,.598,plastic);
      t.box(x-.026,s*.429-.031,.598,x+.027,s*.429+.031,.607,'#646668');
      for(const k of [-1,1]){
        const end=plug(x,s,k),knee=[x+k*.033,s*.480,.413],start=[x+k*.018,s*.455,.559];
        t.cyl(start,[x+k*.022,s*.475,.539],.013,dark,8);
        const bend=[x+k*.035,s*.498,.496];
        t.cyl(start,bend,.006,rubber,6,false);t.cyl(bend,knee,.006,rubber,6,false);
        t.cyl(knee,end,.012,'#666b69',8,false);
      }
    });
  });
  tag('spark-plugs',()=>{
    for(const {x,side:s,index} of cells)for(const k of [-1,1])r.instance(s+'-'+index+'-'+(k>0?1:0),()=>{
      const end=plug(x,s,k),mid=[end[0],s*.416,.340],tip=[end[0],s*.405,.330];
      t.cyl(mid,end,.007,'#d5d8cb',8);t.cyl(tip,mid,.005,'#ab9472',6);
    });
  });
}
export function g500FluidAccess(tag,t){
  tag('oil-filter',()=>{
    drawG500OilElement(t,oilCenter,oilAxis);
    t.cyl([-.411,-.258,.300],[-.419,-.274,.453],.051,metal,16);
    t.cyl([-.419,-.274,.453],[-.421,-.277,.492],.056,plastic,14);
    t.cyl([-.421,-.277,.492],[-.422,-.278,.500],.037,dark,12);
  });
  tag('oil-fill',()=>{
    t.cyl([-.321,-.307,.540],[-.321,-.307,.661],.022,plastic,12);
    t.cyl([-.321,-.307,.661],[-.321,-.307,.677],.035,dark,16);
    t.box(-.343,-.312,.677,-.299,-.302,.683,'#737774');
  });
  tag('oil-dipstick',()=>{
    t.route([[-.152,.186,.071],[-.304,.277,.194],[-.424,.326,.366],[-.475,.353,.461]],.006,metal,8);
    const ring=Array.from({length:13},(_,i)=>{
      const a=2*Math.PI*i/12;return [-.477+.022*Math.cos(a),.352,.486+.019*Math.sin(a)];
    });
    t.route(ring,.004,'#d5a837',8);
  });
}
export function g500ExpansionTank(t){
    // Inner right fender. Dark upper tank and translucent lower body hang
    // beside the engine, with the filler near the aft end.
    const rows=[[.108,.052],[.142,.074],[.353,.074],[.399,.057]];
    const shape=(row,sign,z)=>[row[0],.632+sign*row[1],z];
    for(let i=1;i<rows.length;i++){
      for(const [lo,hi,color] of [[.322,.404,'#b1bbb0'],[.404,.523,'#474d4c']])
        for(const s of [-1,1])t.poly([shape(rows[i-1],s,lo),shape(rows[i],s,lo),shape(rows[i],s,hi),shape(rows[i-1],s,hi)],color);
      t.poly([shape(rows[i-1],-1,.523),shape(rows[i-1],1,.523),shape(rows[i],1,.523),shape(rows[i],-1,.523)],'#525753');
    }
    for(const row of [rows[0],rows.at(-1)])for(const [lo,hi,color] of [[.322,.404,'#b1bbb0'],[.404,.523,'#474d4c']]){
      t.poly([shape(row,-1,lo),shape(row,1,lo),shape(row,1,hi),shape(row,-1,hi)],color);
    }
    // Side lug bears on the adjacent fender mounting point.
    t.box(.22,.698,.363,.25,.739,.376,dark);
    t.cyl([.34,.635,.520],[.34,.635,.547],.037,dark,16);
}
