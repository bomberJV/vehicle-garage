import {drawSLMovingAccess} from './sl550-access.js';
import {drawSLExterior,drawSLDeck,slExteriorGroup} from './sl550-exterior.js';
import {drawSLSeats,slSeatGroup} from './sl550-seats.js';
import {drawSLRoof,slRoofGroup} from './sl550-roof.js';
import {drawSLCabin,slCabinGroups} from './sl550-cabin.js';
import {drawSLPower,slPowerGroups} from './sl550-power.js';
import {slAssistGroup,drawSLAssist,drawSLRearCamera} from './sl550-assist.js';
import {slSpecifications} from './sl550-sources.js';

const brochure='https://ragtop.org/mbbrochures/2014/usa/2014-SL-Class.pdf';
const partsBase='https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-7l-v8-gas/';
const brochureRef={label:'Mercedes-Benz USA · 2014 SL-Class',url:brochure+'#page=24'};

function roofPosition(r){return r.slRoofFraction??(r.build?.roofPosition==='up'?0:1);}
export const sl550={
  id:'sl550',name:'Mercedes-Benz SL550',short:'SL550 · R231',year:2014,domain:'Land',type:'Cars',
  length:4.61264,
  detail:'Warm air leaves a vent just below each head restraint. Inside the same seat, air chambers change the shape of the backrest for massage. Open either system to follow it through the seat.',
  source:brochureRef,photoReference:{label:'Mercedes-Benz · original R231 photographs and body outline',url:'https://rk.mb-qr.com/en/231/'},
  specs:slSpecifications,
  parts:[
    {name:'SL550 passenger seat components',seller:'Mercedes-Benz Classic Parts',url:'https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-6l-v8-gas/body--passenger-seat-components',description:'Compare the backrest, head restraint and cushion diagrams for the equipped seat.'},
    {name:'2014 SL550 parts catalog',seller:'Mercedes-Benz Classic Parts',url:partsBase,description:'Look up the roof, climate and powertrain components by VIN and equipment code.'}
  ],
  groups:[...slExteriorGroup,slSeatGroup,slRoofGroup,...slCabinGroups,...slPowerGroups,slAssistGroup],
  draw(r,paint,finish){
    const t=roofPosition(r);
    drawSLExterior(r,paint,finish,t);drawSLPower(r);drawSLCabin(r,t);drawSLSeats(r);drawSLAssist(r,paint,t);drawSLRoof(r,paint,t);
  },
  movingRoofParts:new Set(['access.trunk','access.handle','sl-assist.rearview','shell.trunklid','lights.high-stop',...slRoofGroup.parts.map(p=>p.id)]),
  drawMovingRoof(r,paint){const t=roofPosition(r);drawSLDeck(r,paint,t);drawSLMovingAccess(r,t);drawSLRearCamera(r,t);drawSLRoof(r,paint,t);}
};
