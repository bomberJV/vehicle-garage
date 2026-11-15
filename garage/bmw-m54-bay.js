// E46 325Ci US M54B25. Local -X faces the radiator; -Y faces the intake
// side of the head. The stations describe the installed layout, not service dimensions.
const black='#30363b',dark='#262c30',metal='#9ba4a5',rubber='#3f464a';
const m54book='https://bmwtuning.co/wp-content/uploads/2023/08/BMW-M54-Training-Doc.pdf#page=';
export const m54References={
 intake:{label:'BMW Technical Training ST036 · resonance intake, pp. 41–43',url:m54book+'41'},
 disa:{label:'BMW Technical Training ST036 · resonance flap and vacuum unit, p. 42',url:m54book+'42'},
 vanos:{label:'BMW Technical Training ST036 · double VANOS, pp. 32–33',url:m54book+'32'},
 vent:{label:'BMW 325Ci M54 · crankcase ventilation and oil separator plate',url:'https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/engine/crankcase_ventilation.html'},
 drain:{label:'BMW Service Information B11 08 03 · M54 separator and dipstick guide',url:'https://www.australiancar.reviews/_pdfs/BMW_M54engine_ServiceBulletin-110803.pdf'},
 photo:{label:'2003 US 325Ci · original-owner engine-bay photograph, February 2025',url:'https://bringatrailer.com/wp-content/uploads/2025/02/2003_bmw_325ci-coupe_img_1089-77883.jpeg?w=1200'}
};
function cover(t,x0,x1,y0,y1,z,height,round=.026){
 const outline=[[x0+round,y0],[x1-round,y0],[x1,y0+round],[x1,y1-round],[x1-round,y1],[x0+round,y1],[x0,y1-round],[x0,y0+round]];
 const lower=outline.map(([x,y])=>[x,y,z]),upper=outline.map(([x,y])=>[x,y,z+height]);
 t.poly(upper,black);t.poly(lower,dark);
 for(let i=0;i<8;i++)t.poly([upper[i],upper[(i+1)%8],lower[(i+1)%8],lower[i]],i%2?rubber:dark);
}
export function m54Dress(tag,t,xs){
 tag('valve-cover',()=>{
  cover(t,-.486,.492,-.135,.151,.540,.065);
  for(const y of [-.048,-.030,-.012])t.box(-.428,y,.605,.437,y+.006,.608,'#a6aeaf');
  t.cyl([-.379,.077,.604],[-.379,.077,.628],.044,black,16);
  t.box(-.409,.069,.626,-.349,.083,.634,dark);
 });
 tag('intake',()=>{
  cover(t,-.443,.447,-.355,-.198,.328,.099);
  for(const x of xs)t.route([[x,-.267,.387],[x,-.238,.469],[x,-.158,.483],[x,-.113,.407]],.036,black,12);
  // The second decorative cover follows the rail and manifold; the ignition
  // cover and service oil cap remain on the other side of the engine.
  cover(t,-.398,.453,-.302,-.175,.489,.031,.025);
  for(const y of [-.234,-.215,-.196])t.box(-.334,y,.520,.391,y+.006,.523,'#a5abad');
 });
 tag('airbox',()=>{
  cover(t,-.589,-.294,-.573,-.332,.236,.192,.030);
  for(let x=-.550;x<-.307;x+=.030)t.box(x,-.547,.428,x+.006,-.354,.435,'#424a4e');
  const throat=[-.613,-.012,.405],end=[-.578,-.369,.381];
  // Flattened fresh-air snorkel crosses behind the kidney grille.
  const stations=[throat,[-.613,-.221,.417],end];
  for(let i=1;i<stations.length;i++){
   const a=stations[i-1],b=stations[i];
   const ring=p=>[[-.038,-.021],[.038,-.021],[.038,.021],[-.038,.021]].map(([dx,dz])=>[p[0]+dx,p[1],p[2]+dz]);
   const aa=ring(a),bb=ring(b);for(let j=0;j<4;j++)t.poly([aa[j],bb[j],bb[(j+1)%4],aa[(j+1)%4]],black);
  }
 });
 const mafStart=[-.301,-.465,.362],mafEnd=[-.194,-.465,.362],socket=[.031,-.402,.297];
 tag('maf',()=>{
  t.tube(mafStart,mafEnd,.058,.052,black,16);
  t.box(-.277,-.449,.409,-.233,-.411,.432,dark);
 });
 tag('intake-duct',()=>{
  const turn=[-.085,-.468,.344];
  t.route([mafEnd,turn,[.024,-.447,.309],socket],.051,rubber,14);
  for(let i=0;i<7;i++){
   const frac=i/7,at=f=>mafEnd.map((v,k)=>v+f*(turn[k]-v));
   t.cyl(at(frac),at(frac+.046),.0545,dark,14,false);
  }
  t.route([[-.076,-.464,.349],[-.016,-.421,.378],[.045,-.355,.375]],.019,rubber,10);
 });
 tag('throttle',()=>{
  t.tube(socket,[.031,-.340,.297],.053,.045,metal,18);
  t.box(-.018,-.392,.255,.036,-.351,.285,black);
  t.cyl([-.012,-.369,.297],[.073,-.369,.297],.0035,'#b19a78',6);
  t.route([[.031,-.343,.297],[.031,-.302,.327],[.031,-.276,.365]],.051,black,12);
 });
 tag('disa',()=>{
  cover(t,-.060,.133,-.385,-.346,.359,.092,.016);
  t.cyl([.112,-.381,.408],[.112,-.422,.408],.041,black,16);
  t.cyl([.112,-.422,.408],[.112,-.427,.408],.030,dark,16);
  t.box(-.033,-.347,.381,.083,-.284,.426,rubber);
  t.box(.008,-.378,.451,.059,-.352,.472,black);
 });
 tag('ccv',()=>{
  t.cyl([.092,-.239,.184],[.092,-.239,.265],.039,black,14);
  t.cyl([.092,-.239,.255],[.092,-.239,.272],.044,dark,16);
  t.cyl([.092,-.239,.162],[.092,-.239,.184],.021,dark,12);
  // Separate functional connections: cover vapor, regulated gas to manifold
  // distribution piece, and collected oil to the side port of the guide tube.
  t.route([[-.395,-.122,.568],[-.405,-.175,.491],[-.331,-.200,.304],[-.059,-.248,.246],[.09,-.239,.237]],.011,rubber,8);
  t.route([[.087,-.244,.267],[.046,-.258,.328],[.161,-.260,.402],[.165,-.242,.477]],.012,rubber,8);
  t.route([[.092,-.239,.161],[.054,-.249,.104],[-.128,-.259,.073],[-.219,-.282,.073]],.0085,rubber,8);
 });
 tag('dipstick-guide',()=>{
  t.route([[-.229,-.196,-.178],[-.219,-.282,.073],[-.260,-.326,.204],[-.299,-.355,.440]],.008,metal,10);
  t.cyl([-.299,-.355,.431],[-.30,-.355,.456],.013,dark,10);
  const loop=Array.from({length:13},(_,i)=>{const a=i*Math.PI/6;return[-.300+.015*Math.cos(a),-.355,.470+.015*Math.sin(a)];});
  t.route(loop,.0037,'#b44e33',7);
 });
 tag('vanos',()=>{
  t.box(-.546,-.110,.439,-.476,.112,.537,'#a3aaa9');
  for(const s of [-1,1]){
   const y=s*.065;
   t.cyl([-.573,y,.495],[-.484,y,.495],.055,metal,16);
   t.cyl([-.579,y,.495],[-.573,y,.495],.043,'#b7bcbb',14);
   t.cyl([-.512,s*.090,.502],[-.512,s*.157,.502],.023,'#849094',12);
   t.cyl([-.512,s*.155,.502],[-.512,s*.185,.502],.017,black,10);
  }
 });
 tag('exhaust-manifold',()=>{
  // Two three-cylinder collector groups on the exhaust side. Their bright
  // folded shields are prominent in the engine-bay photograph.
  for(const group of [xs.slice(0,3),xs.slice(3)]){
   const collector=group[1]+.027;
   for(const x of group)t.route([[x,.135,.393],[x,.227,.355],[collector,.280,.229]],.026,'#937e69',10);
   t.route([[collector,.280,.229],[collector+.04,.286,.146],[collector+.10,.274,.097]],.045,'#756f68',12);
   const x0=group[0]-.048,x1=group.at(-1)+.051;
   for(let i=0;i<9;i++){
    const a=x0+(x1-x0)*i/9,b=x0+(x1-x0)*(i+1)/9,point=(x,k)=>{
     const u=(x-x0)/(x1-x0);
     return [x,.147+k*.112,.422-.044*k+.008*Math.cos(u*6*Math.PI)];
    };
    t.poly([point(a,0),point(b,0),point(b,.5),point(a,.5)],'#a3a399');
    t.poly([point(a,.5),point(b,.5),point(b,1),point(a,1)],'#8d918c');
   }
  }
 });
 tag('coolant-reservoir',()=>{
  cover(t,-.686,-.561,-.636,-.549,.205,.222,.012);
  t.cyl([-.643,-.594,.424],[-.643,-.594,.451],.033,dark,14);
  t.route([[-.6,-.557,.224],[-.661,-.506,.207],[-.759,-.467,.169]],.015,rubber,8);
 });
}
