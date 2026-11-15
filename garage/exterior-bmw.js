import {coachwork} from './exterior-coachwork.js';
import {e46BodyProfile,finishE46Body} from './bmw-e46-body.js';
import {drawBmwEndFittings} from './bmw-end-fittings.js';

export function buildBmwExterior(r,paint){
  coachwork(r,e46BodyProfile,paint);
  finishE46Body(r,paint);
  drawBmwEndFittings(r,paint);
}
