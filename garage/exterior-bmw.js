import {e46BodyProfile,finishE46Body} from './bmw-e46-body.js';
import {buildE46Shell} from './e46-coupe-shell.js';
import {buildE46Ends} from './e46-coupe-ends.js';

// The E46 coupé has its own lofted body (e46-coupe-shell.js) and lamp and bumper
// fittings (e46-coupe-ends.js); the cabin, wipers and inner panels are shared
// with the earlier build.
export function buildBmwExterior(r,paint){
  buildE46Shell(r,paint);
  buildE46Ends(r,paint);
  e46BodyProfile.drawCabin(r);
  e46BodyProfile.fixedWipers(r);
  finishE46Body(r,paint);
}
