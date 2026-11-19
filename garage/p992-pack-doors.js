// 992 study pack: doors.
// Scope: Doors, windows and mirrors: door shells, locks and latches, handles, window regulators and motors, door glass and seals (Cabriolet), exterior mirrors, door panels.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-doors-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["door-porsche992scab-front-left.skin", "door-porsche992scab-front-left.frame", "door-porsche992scab-front-left.glass", "door-porsche992scab-front-left.seals", "door-porsche992scab-front-left.impact", "door-porsche992scab-front-left.outer-handle", "door-porsche992scab-front-left.check", "door-porsche992scab-front-left.barrier", "door-porsche992scab-front-left.inner-handle", "door-porsche992scab-front-left.speaker", "door-latch.plate", "door-latch.fork", "door-latch.pawl", "door-latch.striker", "door-latch.release", "door-latch.lock", "door-hinge.pillar", "door-hinge.door", "door-hinge.pin", "regulator-porsche992scab.glass", "regulator-porsche992scab.motor", "regulator-porsche992scab.track", "regulator-porsche992scab.carriage", "laminate.outer", "laminate.interlayer", "laminate.inner", "door-porsche992scab-front-right.skin", "door-porsche992scab-front-right.frame", "door-porsche992scab-front-right.glass", "door-porsche992scab-front-right.seals", "door-porsche992scab-front-right.impact", "door-porsche992scab-front-right.outer-handle", "door-porsche992scab-front-right.check", "door-porsche992scab-front-right.barrier", "door-porsche992scab-front-right.inner-handle", "door-porsche992scab-front-right.speaker"];
import {catalogueStudy} from './porsche992-catalog-studies.js';

// 805-020 is the powered rear side (quarter) window of the Cabriolet, not the
// door glass. It opens from the window regulator motor, the closest hook.
const sideWindow={id:'side-window-cabriolet',code:'805-020',title:'Rear side window and regulator, Cabriolet',year:'2023 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2023_(992-1)/PartDiagrams/805-020/Side_window_Cabriolet',
 rows:[['1','992845041C','Rear side window, left'],['1','992845042C','Rear side window, right'],
  ['2','992839399C','Side window regulator with motor, left'],['2','992839400C','Side window regulator with motor, right'],
  ['3','992837341','Cover, window regulator, left'],['3','992837342','Cover, window regulator, right'],
  ['4','9P1837359A','Securing element, side window'],['5','N 10515101','Bung, window regulator'],['6','9P1898010','Set of spacers']]};

export const studies=[catalogueStudy(sideWindow,'p992-doors-')];
export const views=new Map([['regulator-porsche992scab.motor',studies[0]]]);
