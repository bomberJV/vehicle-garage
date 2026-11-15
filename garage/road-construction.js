// Material-section studies use exaggerated layer thickness so thin layers can be picked.
function entry(id,name,description,source,group,parts) {
  const pieces=parts.map(([key,name,description,offset,draw])=>({id:group+'.'+key,name,description,offset,draw}));
  return {id,name,description,source,groups:[{id:group,name,description,parts:pieces}],
    draw(r){for(const p of pieces)r.tag(p.id,()=>p.draw(r));}};
}

const fullTurn=2*Math.PI;
function annularSection(r,inner,outer,halfWidth,color){
  const steps=52,end=fullTurn*.78;
  const point=(radius,y,a)=>[Math.sin(a)*radius,y,1.1+Math.cos(a)*radius];
  for(let i=0;i<steps;i++){
    const a=end*i/steps,b=end*(i+1)/steps;
    for(const y of [-halfWidth,halfWidth])
      r.polygon([point(inner,y,a),point(outer,y,a),point(outer,y,b),point(inner,y,b)],color);
    for(const radius of [inner,outer])
      r.polygon([point(radius,-halfWidth,a),point(radius,halfWidth,a),point(radius,halfWidth,b),point(radius,-halfWidth,b)],color);
  }
  for(const a of [0,end])
    r.polygon([point(inner,-halfWidth,a),point(outer,-halfWidth,a),point(outer,halfWidth,a),point(inner,halfWidth,a)],color);
}

const tire=entry('road-tire-section','Radial tire cross-section',
  'A slice through the crown exposes the layers under the tread. The bead anchors the casing at the rim. Layer thicknesses are enlarged here.',
  {label:'Michelin · tire construction glossary',url:'https://www.michelinman.com/auto/assistance/glossary'},'tire-section',[
    ['tread','Tread rubber','The outer rubber and its grooves form the contact surface.',[0,-.9,0],r=>{
      annularSection(r,1.00,1.095,.335,'#495157');
      for(let i=0;i<37;i++){const a=fullTurn*.78*i/37;const x=Math.sin(a)*1.098,z=1.1+Math.cos(a)*1.098;
        for(const s of [-1,1])r.rod([x,-s*.01,z],[x+.024*Math.cos(a),s*.29,z-.024*Math.sin(a)],.011,'#293237',5);}
    }],
    ['belts','Reinforcing belts','Crossed cord layers stiffen the crown and spread the load under the tread.',[0,-.38,0],r=>{
      annularSection(r,.945,.997,.319,'#a79b79');
      for(let i=0;i<50;i++){const a=fullTurn*.77*i/50;for(const s of [-1,1]){
        const b=a+.04*s;r.rod([Math.sin(a),-.29,1.1+Math.cos(a)],[Math.sin(b),.29,1.1+Math.cos(b)],.006,'#c3beb0',4);}}
    }],
    ['casing','Carcass and sidewalls','The cord-reinforced casing runs from bead to bead and flexes as the tire rolls.',[0,.18,0],r=>{
      annularSection(r,.896,.942,.302,'#8d8179');
      for(const s of [-1,1])for(let i=0;i<54;i++){const a=fullTurn*.78*i/54,b=fullTurn*.78*(i+1)/54,p=(rad,y,t)=>[Math.sin(t)*rad,s*y,1.1+Math.cos(t)*rad];r.polygon([p(.65,.235,a),p(.905,.305,a),p(.905,.305,b),p(.65,.235,b)],'#586369');}
    }],
    ['liner','Inner liner','An air-retaining layer covers the inside of a tubeless tire.',[0,.72,0],r=>annularSection(r,.865,.892,.28,'#565c58')],
    ['beads','Bead bundles','The high-strength wire bundles at the two inner edges meet the rim.',[0,1.2,0],r=>{
      for(const s of [-1,1])for(let i=0;i<48;i++){const a=fullTurn*.78*i/48,b=fullTurn*.78*(i+1)/48;
        r.rod([Math.sin(a)*.64,s*.235,1.1+Math.cos(a)*.64],[Math.sin(b)*.64,s*.235,1.1+Math.cos(b)*.64],.027,'#a59a83',8);}
    }]
  ]);

function curvedGlass(r,size,shift,thickness,color){
  const point=(u,v,d)=>[(u*.32+.19*(1-v*v)+shift+d)*size,v*(1.03-u*.15)*size,(u*.57+.76)*size];
  const cells=18;
  for(let i=0;i<cells;i++){
    const a=-1+2*i/cells,b=-1+2*(i+1)/cells;
    for(const d of [0,thickness])r.polygon([point(-1,a,d),point(-1,b,d),point(1,b,d),point(1,a,d)],color);
    for(const u of [-1,1])r.polygon([point(u,a,0),point(u,b,0),point(u,b,thickness),point(u,a,thickness)],'#a5bcb9');
  }
  for(const v of [-1,1])r.polygon([point(-1,v,0),point(1,v,0),point(1,v,thickness),point(-1,v,thickness)],color);
}
const windshield=entry('windshield-section','Laminated windshield',
  'The windshield is a curved sandwich. The polymer bonded between two glass sheets holds fragments together if the glass cracks. Expand it to see the interlayer.',
  {label:'Saint-Gobain Sekurit · automotive glazing',url:'https://www.saint-gobain-sekurit.com/sites/hps-mac3-sekurit-sekurit/files/2021-03/Infographic_Automotive%20glass.pdf'},'laminate',[
    ['outer','Outer glass','The outer ply faces the weather and matches the curve of the inner ply.',[-.65,0,0],r=>curvedGlass(r,1,-.049,.046,'#8cb3bf')],
    ['interlayer','PVB interlayer','Polyvinyl butyral bonds the glass plies together. Its thickness is exaggerated in this section.',[0,0,.14],r=>curvedGlass(r,1,0,.019,'#c6be85')],
    ['inner','Inner glass','This ply forms the cabin side of the windshield.',[.65,0,0],r=>curvedGlass(r,1,.022,.046,'#a9c6c9')]
  ]);

export function getRoadConstruction(vehicle,id){
  if(!['hrv','f350','c63','bmw325ci','g500','porsche993cab','porsche992scab'].includes(vehicle))return null;
  if(id==='wheels.tire'||id==='running.tires')return tire;
  if(id==='body.windshield'||id==='cabin.windshield')return windshield;
  // The generic glazing button covers multiple panes. The detail explicitly illustrates the front windshield.
  if(id==='body.glass'&&vehicle!=='g500')return windshield;
  return null;
}
