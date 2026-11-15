// Component elevations for functional diagrams. Positions are diagram coordinates.
import {cyl,sleeve,turn,x,y,z} from './mechanism-shapes.js';
const caseColor='#879a99',edge='#455d61',silver='#bdc9bd',brass='#d1ad6d',green='#83a999';
function box(r,a,b,color){r.box(...a,...b,color);}
function line(r,a,b,rad,color){r.rod(a,b,rad,color,8);}
function ringCase(r,c,axis,len,rad){cyl(r,c,axis,-len/2,len/2,rad,caseColor,18);for(const s of [-1,1])sleeve(r,c,axis,s*len*.43-.01,s*len*.43+.01,rad*1.05,rad*.85,silver,18);}
export function symbol(r,type,c){
 const [X,Y,Z]=c,p=(a,b,d)=>[X+a,Y+b,Z+d],block=(a,b,col)=>box(r,p(...a),p(...b),col);
 switch(type){
 case 'tank':
   block([-.25,-.12,-.12],[.25,.12,.12],green);for(const k of [-.15,.15])block([k-.013,-.13,-.125],[k+.013,.13,.125],edge);
   cyl(r,p(.12,0,.12),z,0,.035,.044,brass);break;
 case 'battery':
   block([-.19,-.12,-.12],[.19,.12,.09],edge);block([-.2,-.13,.09],[.20,.13,.13],caseColor);
   for(const k of [-1,1])cyl(r,p(k*.125,0,.13),z,0,.04,.026,k>0?brass:silver);break;
 case 'selector':
   ringCase(r,c,z,.12,.135);line(r,p(0,0,.08),p(.115,0,.18),.022,brass);
   for(const k of [-1,1])cyl(r,c,y,k*.12,k*.18,.033,silver);break;
 case 'pump':case 'generator':
   ringCase(r,c,x,.31,type==='pump'?.12:.145);cyl(r,c,x,-.205,-.155,.037,brass);
   for(const k of [-1,1])block([k*.09-.025,-.13,-.15],[k*.09+.025,.13,-.11],edge);
   if(type==='pump'){cyl(r,p(.09,0,.095),z,0,.065,.035,silver);}break;
 case 'screen':
   block([-.21,-.038,-.14],[.21,.038,.14],edge);
   block([-.175,.039,-.105],[.175,.044,.106],'#4c8590');
   for(let i=0;i<3;i++)block([-.146,.045,-.061+.036*i],[.11-i*.058,.049,-.052+.036*i],'#a7d3c2');break;
 case 'array':
   block([-.245,-.13,-.025],[.245,.13,0],silver);
   for(let a=0;a<4;a++)for(let b=0;b<3;b++)block([-.235+a*.12,-.12+b*.08,0],[-.121+a*.12,-.046+b*.08,.012],'#53658a');
   break;
 case 'disc':case 'pads':
   if(type==='disc')sleeve(r,c,y,-.028,.028,.19,.075,silver,28);
   else for(const s of [-1,1])turn(r,p(0,s*.073,0),y,[[-.018,.106],[-.018,.185],[.018,.185],[.018,.106]],brass,{start:.40,sweep:1.62,n:12});
   break;
 case 'spring':
   for(let i=0;i<40;i++){const pos=i=>p((i/40-.5)*.3,.06*Math.cos(i*Math.PI/5),.06*Math.sin(i*Math.PI/5));line(r,pos(i),pos(i+1),.011,silver);}break;
 case 'filter':
   ringCase(r,c,z,.27,.10);for(let i=0;i<10;i++){const t=i*Math.PI/5;line(r,p(.103*Math.cos(t),.103*Math.sin(t),-.09),p(.103*Math.cos(t),.103*Math.sin(t),.09),.005,silver);}break;
 case 'bus':
   for(const k of [-1,1])block([-.19,k*.07-.024,-.022],[.19,k*.07+.024,.022],brass);
   for(const k of [-1,0,1])for(const side of [-1,1])cyl(r,p(k*.13,side*.07,.022),z,0,.021,.017,edge,6);break;
 case 'breaker':
   block([-.12,-.08,-.07],[.12,.08,.07],edge);
   for(const k of [-1,1]){block([k*.14-.022,-.025,-.028],[k*.14+.022,.025,.012],brass);}
   line(r,p(-.045,0,.074),p(.065,0,.132),.018,silver);break;
 case 'rail':
   cyl(r,c,x,-.231,.231,.051,caseColor,16);
   for(const k of [-1,0,1]){cyl(r,p(k*.13,0,.05),z,0,.053,.027,brass,8);}
   break;
 case 'sealedBattery':
   block([-.215,-.115,-.125],[.215,.115,.098],edge);
   block([-.228,-.125,.098],[.228,.125,.126],caseColor);
   for(const a of [-1,1])for(const b of [-1,1])cyl(r,p(a*.18,b*.09,.126),z,0,.014,.014,silver,6);
   cyl(r,p(.107,.13,0),y,-.02,.053,.031,brass,12);break;
 case 'pipe':case 'duct':
   {const radius=type==='duct'?.075:.028;
   line(r,p(-.19,0,-.053),p(-.02,0,-.053),radius,caseColor);
   line(r,p(-.02,0,-.053),p(.08,0,.055),radius,caseColor);
   line(r,p(.08,0,.055),p(.18,0,.055),radius,caseColor);
   for(const [a,h] of [[-.19,-.053],[.18,.055]])sleeve(r,p(a,0,h),x,-.013,.013,radius*1.18,radius*.68,silver,14);
   }break;
 case 'blower':
   block([-.16,-.11,-.13],[.18,.11,.13],caseColor);
   sleeve(r,p(-.168,0,0),x,-.022,0,.105,.071,edge,18);
   block([.03,-.091,.13],[.16,.091,.195],silver);
   for(const k of [-1,0,1])line(r,p(-.194,k*.033,-.062),p(-.194,k*.033,.062),.007,silver);
   break;
 case 'furnace':
   block([-.16,-.142,-.14],[.15,.14,.14],edge);
   sleeve(r,p(-.171,0,0),x,-.016,.018,.113,.081,'#af8564',20);
   cyl(r,p(-.178,0,0),x,-.003,.004,.079,'#664b3b',20);break;
 case 'lamp':
   turn(r,c,x,[[-.14,.095],[-.09,.098],[.073,.053],[.12,.048],[.12,0]],caseColor,{n:18});
   cyl(r,p(-.14,0,0),x,-.009,0,.087,'#c6d8c9',18);
   line(r,p(.024,0,-.038),p(.07,0,-.14),.016,edge);break;
 case 'camera':
   ringCase(r,c,x,.23,.089);sleeve(r,p(-.14,0,0),x,-.032,.02,.087,.053,edge,18);
   cyl(r,p(-.15,0,0),x,-.008,.002,.055,'#4c7381',16);
   block([-.056,-.065,-.152],[.087,.065,-.076],silver);break;
 case 'connector':
   block([-.14,-.075,-.085],[.14,.075,.084],caseColor);
   sleeve(r,p(-.147,0,0),x,-.025,.007,.067,.047,edge,16);
   for(const k of [-1,0,1])cyl(r,p(-.165,k*.021,0),x,-.011,.013,.006,brass,6);
   break;
 case 'fairing':
   turn(r,c,z,[[-.16,.15],[-.105,.175],[.07,.175],[.18,.112],[.225,.014]],silver,{start:.46,sweep:4.71,n:18});
   block([-.045,-.039,-.085],[.045,.039,.041],brass);break;
 case 'ring':sleeve(r,c,x,-.13,.13,.14,.094,silver);break;
 case 'heat':
   ringCase(r,c,x,.31,.10);for(let i=0;i<7;i++)sleeve(r,c,x,-.14+i*.045,-.125+i*.045,.157,.094,edge,18);break;
 case 'link':
   line(r,p(-.16,0,-.09),p(.16,0,.09),.029,silver);for(const s of [-1,1])sleeve(r,p(s*.16,0,s*.09),y,-.035,.035,.05,.025,edge,14);break;
 case 'nozzle':
   turn(r,c,x,[[-.16,.06],[-.12,.10],[.03,.07],[.15,.038],[.15,.019]],brass,{n:18});break;
 case 'bucket':
   turn(r,c,y,[[-.13,.16],[-.13,.19],[.13,.19],[.13,.16]],caseColor,{n:18,start:0,sweep:Math.PI});
   for(const s of [-1,1])cyl(r,c,y,s*.14,s*.19,.031,brass);break;
 default:
   block([-.17,-.09,-.105],[.17,.09,.105],edge);
   for(let i=0;i<5;i++)block([-.14+i*.06,-.09,.105],[-.13+i*.06,.09,.12],silver);
   block([-.1,-.116,-.054],[.1,-.09,.012],brass);
 }
}
