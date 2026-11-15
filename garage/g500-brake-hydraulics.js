import {cyl} from './mechanism-shapes.js';

// Stock bulkhead unit shared by the engine-bay and brake assembly views.
export function drawG500BrakeHydraulics(r){
  const c=[-.93,-.53,1.015],x=[1,0,0],z=[0,0,1];
  cyl(r,c,x,-.038,.058,.122,'#373e42',16);
  cyl(r,c,x,-.207,-.036,.037,'#92999b',12);
  r.box(-1.12,-.575,1.057,-.979,-.489,1.111,'#c8c9b6');
  cyl(r,[-1.077,-.533,1.11],z,0,.017,.027,'#292e31',12);
}
