import {buildE90Shell,ghPoint90} from './e90-sedan-shell.js';
import {buildE90Ends} from './e90-sedan-ends.js';
import {drawBmwSeatsAndDash} from './bmw-cabin-closures.js';

// 2008 BMW 328xi sedan (E90 pre-LCI): the lofted body and its nose and tail
// fittings, the shared BMW seats and dashboard, and the parked wipers.
export function buildE90Exterior(r,paint){
  buildE90Shell(r,paint);
  buildE90Ends(r,paint);
  drawBmwSeatsAndDash(r);
  r.tag('body.wipers',()=>{
    // Two parked blades at the base of the screen, driver's blade ahead.
    for(const [y0,y1,x0] of [[-.62,.04,-.905],[.06,.66,-.915]]){
      const a=[x0,y0,.982],b=[x0+.03,y1,.990];
      r.rod(a,b,.007,'#1b2023',8);
      r.rod([x0+.004,y0+.10*Math.sign(y1-y0),.978],[x0+.024,y0+.30,.986],.009,'#22282b',8);
    }
  });
  void ghPoint90;
}
