import {g500WindowStudy} from './g500-window-lifter.js';
import {doorProfile,references} from './door-profiles.js';
import {doorSection,trimStudy,carpetStudy} from './door-section.js';
import {hingeStudy,latchStudy,regulatorStudy} from './door-hardware.js';
import {g500BonnetStudy} from './g500-bonnet.js';
import {cargoSection} from './door-closures.js';

const doors={
  'body.door':['left',false],'body.front-right':['right',false],
  'body.rear-door':['left',true],'body.rear-left':['left',true],'body.rear-right':['right',true],
  'shell.left-door':['left',false],'shell.right-door':['right',false]
};
export function getDoorDetail(vehicle,id){
  if(vehicle==='g500'&&id==='body.hood')return g500BonnetStudy;
  const p=doorProfile(vehicle);if(!p||!id)return null;
  const side=doors[id];
  if(side){
    const shape=doorProfile(vehicle,side[1]);return shape?doorSection(shape,side[0]):null;
  }
  if(id==='body.tailgate'||id==='body.deck'||(vehicle==='g500'&&id==='body.spare'))return cargoSection(vehicle);
  const [parent,child]=id.split('.');
  if(parent==='closure-'+vehicle){
    if(child==='hinge'&&vehicle==='g500')return hingeStudy(references.gGate);
    if(child==='latch'&&vehicle!=='f350'){
      const closure=cargoSection(vehicle);
      return closure?latchStudy(closure.source):null;
    }
  }
  if(!parent.startsWith('door-'+vehicle+'-'))return null;
  const shape=doorProfile(vehicle,parent.includes('-rear-'));
  if(!shape)return null;
  if(child==='latch')return latchStudy(shape.source);
  if(child==='hinge')return hingeStudy(shape.source);
  if(child==='regulator')return vehicle==='g500'?g500WindowStudy(shape.rear,parent.endsWith('-right')?'right':'left'):regulatorStudy(shape);
  if(child==='carpet'&&shape.style==='classic')return carpetStudy(shape,parent);
  if(child==='trim')return trimStudy(shape,parent);
  return null;
}

// Body glass shares a material tag but belongs to its actual movable mounting panel.
const glassPanels={
  'front-door-left':'body.door','front-door-right':'body.front-right',
  'rear-door-left':'body.rear-door','rear-door-right':'body.rear-right',
  'driver-door':'body.door','passenger-door':'body.front-right',
  'left-front':'body.door','right-front':'body.front-right',
  'left-rear':'body.rear-left','right-rear':'body.rear-right',
  'cargo-door':'body.tailgate','hatch':'body.deck'
};
export function doorForGlazing(part,instance){
  return part==='body.glass'&&Object.hasOwn(glassPanels,instance)?glassPanels[instance]:part;
}
