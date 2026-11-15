import {section,part,source} from './section-primitives.js';

const tau=2*Math.PI;
const configurations={
 cf6:{id:'cf6-80c2',name:'GE CF6-80C2',fan:.660,hp:14,lpTurbine:5,fanColor:'#899398',coreColor:'#738086',
   source:source('GE Aerospace · CF6-80C2 cutaway and applications','https://www.geaerospace.com/sites/default/files/datasheet-CF6-80C2.pdf')},
 pearl:{id:'pearl-700',name:'Rolls-Royce Pearl 700',fan:.603,hp:10,lpTurbine:4,fanColor:'#9da7af',coreColor:'#7c8c90',
   source:source('Rolls-Royce · Pearl 700 fan, core and turbine','https://www.rolls-royce.com/products-and-services/civil-aerospace/business-aviation/pearl-700.aspx')}
};
const at=(x,r,angle)=>[x,r*Math.cos(angle),r*Math.sin(angle)];
function shade(color,d){
 return '#'+[1,3,5].map(i=>Math.min(255,Math.round(parseInt(color.slice(i,i+2),16)*d)).toString(16).padStart(2,'0')).join('');
}
function surface(r,profile,color,start=0,end=tau,n=36){
 for(let j=1;j<profile.length;j++)for(let k=0;k<n;k++){
   const a=start+(end-start)*k/n,b=start+(end-start)*(k+1)/n;
   const [x1,r1]=profile[j-1],[x2,r2]=profile[j];
   r.polygon([at(x1,r1,a),at(x2,r2,a),at(x2,r2,b),at(x1,r1,b)],shade(color,.85+.13*Math.sin((a+b)/2)+.06*Math.cos((a+b)/2)),false);
 }
}
function sweptBlade(r,x,root,radius,axial,twist,width,angle,color){
 const span=[0,.30,.66,.90,1];
 const point=(s,edge,back)=>{
   const rad=root+(radius-root)*s;
   const chord=(.57+.49*Math.sin(s*2.2))*width;
   const turn=angle+twist*s*s+edge*chord;
   return at(x+axial*(.25*s*s-edge*(1-.45*s))+(back?axial*.067:0),rad,turn);
 };
 for(let j=1;j<span.length;j++){
   const a=span[j-1],b=span[j];
   r.polygon([point(a,-1,false),point(b,-1,false),point(b,.02,false),point(a,.02,false)],shade(color,.91+.09*b),false);
   r.polygon([point(a,.02,false),point(b,.02,false),point(b,1,true),point(a,1,true)],shade(color,.70+.10*b),false);
 }
}
function fanRows(r,x,c,phase,individual=false,scale=1){
 const radius=c.fan*scale,root=radius*.23;
 // Blade sampling is simplified for legibility. One marked blade follows the fan through a revolution.
 const count=22;
 for(let i=0;i<count;i++){
   const draw=()=>sweptBlade(r,x,root,radius,.057*scale,c===configurations.pearl?.32:.215,.095,phase*tau+i*tau/count,i===0?'#c6ab74':c.fanColor);
   if(individual)r.instance('Fan blade '+(i+1),draw);else draw();
 }
}
function compressor(r,x0,x1,rA,rB,rows,phase,color){
 const step=(x1-x0)/rows;
 for(let j=0;j<rows;j++){
  const t=(j+.5)/rows,x=x0+step*(j+.5),outer=rA+(rB-rA)*t,hub=outer*(.47+.27*t);
  surface(r,[[x-step*.41,hub],[x-step*.41,hub*1.018],[x+step*.41,hub*1.018],[x+step*.41,hub]],color,0,tau,18);
  for(let k=0;k<12;k++){
    const a=phase*tau+(k+.4*j)*tau/12;
    const leading=at(x-.29*step,hub,a-.05),outer1=at(x-.33*step,outer,a+.005);
    const outer2=at(x+.31*step,outer,a+.192),trailing=at(x+.31*step,hub,a+.225);
    r.polygon([leading,outer1,outer2,trailing],shade(color,.80+(.15*Math.sin(a)+.055*Math.cos(a))),false);
  }
 }
}
function shaft(r,x1,x2,radius,phase,color){
 surface(r,[[x1,0],[x1,radius],[x2,radius],[x2,0]],color,0,tau,20);
 r.rod(at(x1,radius,phase*tau),at(x2,radius,phase*tau),radius*.22,'#cfb87a',8);
}
function annulus(r,x,inner,outer,color){
 surface(r,[[x,inner],[x,outer]],color,0,tau,44);
}
function cutCowl(r,profile,casing){
 const start=.80,end=4.84,thickness=.026;
 surface(r,profile,casing,start,end,34);
 const inner=profile.map(([x,radius])=>[x,radius-thickness]);
 surface(r,inner,'#626e75',start,end,34);
 for(const angle of [start,end])for(let j=1;j<profile.length;j++){
   r.polygon([at(profile[j-1][0],profile[j-1][1],angle),at(profile[j][0],profile[j][1],angle),
              at(inner[j][0],inner[j][1],angle),at(inner[j-1][0],inner[j-1][1],angle)],'#a9abad',false);
 }
}
function fanStudy(c){
 const rFan=c.fan,scale=1.17/rFan;
 const view=section(c.id+'-fan',c.name+' fan rotor',
   'Look through the inlet at the swept fan blades. Each model blade can be selected on the rotor. The center cone and disk spin with the fan. The slim surrounding inlet ring stays still. The blade count is illustrative.',c.source,[
    part('blades','Fan blades','Air accelerates through the blade row. A colored blade lets you follow the rotation. Click any blade to select it.',[0,.57,.69],(r,phase)=>fanRows(r,0,c,phase,true,scale)),
    part('disk','Fan disk','The circular rotor carries every blade root around the same shaft.',[.39,.05,-.33],(r,phase)=>{
      shaft(r,.055,.174,.285,phase,'#78868c');
      annulus(r,.043,.10,.285,'#9ba9aa');
    }),
    part('spinner','Fan spinner','The cone directs air around the center of the rotor and into the roots of the blades.',[-.48,.06,.49],(r,phase)=>{
      surface(r,[[-.395,.015],[-.285,.114],[-.142,.215],[.026,.262]],'#747f81');
      r.rod(at(-.285,.114,phase*tau),at(-.143,.214,phase*tau+.33),.012,'#d5c8a9',7);
    }),
    part('case','Fan case and inlet edge','The case is fixed to the engine. A small radial gap separates the stationary ring from the tips of the rotating blades.',[.16,-.68,.32],r=>{
      surface(r,[[-.077,1.22],[-.13,1.195],[-.11,1.178],[.091,1.178],[.091,1.218]],'#a6b1b4',0,tau,56);
    })
  ]);
 view.viewAngle=[-1.20,.19];view.animated=true;view.motionDescription='The spinner, fan disk and blades rotate together. The surrounding ring stays in place.';
 return view;
}
function engine(c){
 const pearl=c===configurations.pearl, fan=c.fan;
 const study=section(c.id,c.name+' turbofan',
  (pearl?'The G800 carries two Pearl 700 engines.':'This 747-400 is shown with the GE CF6-80C2, one of the engine families offered on the passenger aircraft.')+
  ' The fan sends air down two paths. The outer stream travels around the core. The inner stream passes through the compressors, combustor and turbines. The near side of the nacelle is cut away.',c.source,[
  part('nacelle','Inlet lip and bypass duct','The inlet surrounds the fan. Beyond it, the space between the outer nacelle and core casing carries the bypass stream.',[.04,-.45,.84],r=>{
    cutCowl(r,[[-1.41,fan*1.017],[-1.45,fan*1.07],[-1.41,fan*1.115],[-1.18,fan*1.13],[-.81,fan*1.08],[-.19,fan*.99],[.27,fan*.84]],'#b9c4c8');
  }),
  part('fan','Fan rotor','The fan turns at low-spool speed. Open the fan to inspect and move an individual blade, disk or spinner.',[-.76,0,.38],(r,phase)=>{
    fanRows(r,-1.13,c,phase);
    surface(r,[[-1.38,.009],[-1.31,.076],[-1.14,fan*.245],[-1.072,fan*.245]],'#768185');
  }),
  part('case','Core casing','The cut edge of the core case shows the changing diameter between the compressors and the turbines. It stays fixed while the spools revolve inside.',[.09,-.55,.48],r=>{
    cutCowl(r,[[-.96,.364],[-.59,.317],[-.38,.288],[.10,.253],[.37,.285],[.53,.281],[.64,.27],[1.13,.356]],'#88969a');
  }),
  part('booster','Front compressor','A smaller row of low-pressure compressor blades behind the fan feeds the engine core.',[-.43,.36,-.23],(r,phase)=>compressor(r,-.93,-.54,.340,.285,pearl?2:4,phase,c.coreColor)),
  part('hp-compressor',pearl?'Ten-stage high-pressure compressor':'Fourteen-stage high-pressure compressor',
    (pearl?'The Pearl 700 uses ten high-pressure stages. Six use integral titanium blisks.':'The CF6-80C2 high-pressure compressor has fourteen stages.')+' The rows get smaller as the air becomes denser.',
    [-.28,.41,.58],(r,phase)=>compressor(r,-.50,.082,.269,.192,c.hp,phase*2,'#a1b3b9')),
  part('burner','Annular combustor','The combustor is a stationary ring around the shafts. Hot gas leaves the chamber toward the high-pressure turbine.',[.11,-.39,-.58],r=>{
    cutCowl(r,[[.109,.209],[.149,.256],[.240,.273],[.382,.267],[.465,.219]],'#a77e63');
    surface(r,[[.11,.116],[.219,.131],[.46,.145]],'#8e7667',.79,4.84,30);
    for(let j=0;j<8;j++){const a=.84+j*.5;r.rod(at(.141,.235,a),at(.372,.244,a),.009,'#c09b74',7);}
  }),
  part('hp-turbine','Two-stage high-pressure turbine','Two hot-section turbine stages drive the high-pressure compressor through its hollow shaft.',[.43,.49,.49],(r,phase)=>compressor(r,.49,.638,.235,.252,2,phase*2,'#af987c')),
  part('lp-turbine',pearl?'Four-stage low-pressure turbine':'Five-stage low-pressure turbine',
    (pearl?'Four':'Five')+' stages behind the high-pressure turbine drive the fan through the longer shaft. The blade height increases toward the exhaust.',[.61,.17,-.35],(r,phase)=>compressor(r,.681,1.115,.245,.345,c.lpTurbine,phase,'#9b8974')),
  part('lp-shaft','Low-pressure shaft','The long inner shaft connects the rear turbine to the front fan and booster. It passes through the hollow shaft of the high-pressure spool.',[-.32,.15,-.79],(r,phase)=>shaft(r,-1.13,1.095,.043,phase,'#89979c')),
  part('hp-shaft','High-pressure shaft','The short concentric shaft links the high-pressure turbine to the compressor. The marker makes its separate rotation visible.',[.29,-.48,-.31],(r,phase)=>{
    surface(r,[[-.50,.050],[-.50,.080],[.64,.080],[.64,.050]],'#697980',.84,5.82,24);
    // Retain a side cut on this shaft to expose the inner one. The moving
    // end ring provides the visual cue for the high spool's rotation.
    annulus(r,.65,.05,.08,'#87969c');
    r.rod(at(.652,.05,phase*2*tau),at(.652,.08,phase*2*tau),.005,'#dac188',7);
  }),
  part('exhaust','Core exhaust cone','A tapering tail cone provides the inside boundary of the core exhaust passage.',[.81,0,.19],r=>{
    surface(r,[[1.108,.19],[1.24,.159],[1.37,.082],[1.46,.008]],'#717a7f');
  })
 ]);
 study.animated=true;study.viewAngle=[-.59,.20];study.motionDescription='Follow the marked fan blade and the two shaft markers. The low and high spools rotate independently inside fixed cases. The animation uses illustrative speeds and sampled blades.';
 return study;
}
export const cf6=engine(configurations.cf6),pearl700=engine(configurations.pearl);
export const cf6Fan=fanStudy(configurations.cf6),pearlFan=fanStudy(configurations.pearl);
