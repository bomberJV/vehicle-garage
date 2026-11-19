// Switches from the 2002 G500 switches diagram (cluster, steering column and
// door jambs). Placement is estimated around the modeled dash, column and pillars.
import {cyl,x} from './mechanism-shapes.js';
export const navRef={label:'MB Parts Giant · 2002 G500 navigation system diagram',url:'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/electrical/navigation-system'};
export const switchRef={label:'MB Parts Giant · 2002 G500 switches diagram',url:'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/electrical/switches'};
const black='#24292a',knob='#3a4042',chrome='#aab1b2';
export function drawG500Switches(r){
  r.tag('body.headlamp-switch',()=>{cyl(r,[0,-.650,1.225],x,-.452,-.438,.022,knob,16);cyl(r,[0,-.650,1.225],x,-.438,-.432,.012,chrome,12);});
  r.tag('body.combination-switch',()=>{
    r.box(-.392,-.470,1.170,-.360,-.450,1.205,black);
    r.rod([-.372,-.470,1.192],[-.352,-.600,1.182],.007,black,6);
  });
  r.tag('body.cruise-switch',()=>r.rod([-.378,-.452,1.222],[-.362,-.545,1.232],.005,black,6));
  for(const s of [-1,1])for(const [px,place] of [[.222,'front'],[1.095,'rear']])
    r.tag('body.door-jamb-switches',()=>r.instance(place+'-'+(s<0?'left':'right'),()=>cyl(r,[0,s*.835,.930],x,px,px+.014,.008,black,10)));
  // GPS antenna for COMAND navigation, behind the left headlamp under its bezel.
  r.tag('body.gps-antenna',()=>{r.box(-2.072,-.700,.735,-2.040,-.630,.755,black);r.box(-2.040,-.672,.738,-2.020,-.658,.752,'#30373a');});
  r.tag('body.back-door-jamb-switch',()=>cyl(r,[0,.480,1.000],x,2.060,2.074,.008,black,10));
}
export const g500SwitchParts=[
  ['headlamp-switch','Headlamp switch · 463-545-00-04','The rotary light switch sits in the dash to the left of the steering column.'],
  ['combination-switch','Combination switch · 203-545-00-10','The turn-signal, high-beam and wiper stalk on the left of the column.'],
  ['cruise-switch','Cruise-control switch · 203-545-13-24','The short cruise lever above the combination stalk.'],
  ['door-jamb-switches','Door jamb switches · 005-820-76-10','A plunger switch on each B- and C-pillar tells the electronics when a side door opens.'],
  ['gps-antenna','Navigation GPS antenna · 463-827-01-01','The COMAND GPS antenna sits behind the left headlamp, under its bezel.'],
  ['back-door-jamb-switch','Cargo-door jamb switch · 201-820-21-10','A plunger switch on the rear jamb signals the cargo door.']
];
