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

// 804-000: the door shell with its hinges, catch, striker and lock. 2023 page.
const doorShell={id:'door-shell',code:'804-000',title:'Door shell, hinges and door lock',year:'2023 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2023_(992-1)/PartDiagrams/804-000/Door_shell',
 rows:[['1','992831051FYGRV','Door shell, left, primed'],['1','992831052FYGRV','Door shell, right, primed'],
  ['2','992831403A','Hinge half, A-pillar upper, left'],['2','992831404A','Hinge half, A-pillar upper, right'],
  ['3','992831405A','Hinge half, A-pillar lower, left'],['3','992831406A','Hinge half, A-pillar lower, right'],
  ['4','992831401','Hinge half, door shell upper, left'],['4','992831402','Hinge half, door shell upper, right'],
  ['5','992831411A','Hinge half, door shell lower, left'],['5','992831412A','Hinge half, door shell lower, right'],
  ['6','N 90930503','Multi-point socket head bolt M8x24 with collar'],['7','PAF008485','Hexagon flange screw M6x12'],
  ['8','PAF009189','Socket head bolt M10x33'],['9','992837249','Door catch'],
  ['10','WHT003237','Hexagon socket flat head bolt M6x12'],['11','WHT003497','Hexagon socket oval head bolt M8x23'],
  ['12','992837923','Seal, door catch'],['13','9A783703300','Door striker'],
  ['14','N 91017402','Countersunk multi-point socket head bolt M8x22'],
  ['15','PAB837015C','Door lock, passenger side (as the catalogue labels it)'],['15','PAB837016C',"Door lock, driver's side (as the catalogue labels it)"],
  ['16','WHT003688','Fillister head bolt M8x16'],['17','95853111100','Cover cap'],['18','N 01508210','Hexagon collar nut M6'],
  ['19','N 01021813','Hexagon bolt M6x25'],['20','WHT002684',"Locating bolt M4x28, driver's door"],
  ['21','992839983','Cover, door lock inner, left'],['21','992839984','Cover, door lock inner, right'],
  ['22','992837017','Bowden cable'],
  ['23','992837915A','Cover, door inner panel, window regulator, left'],['23','992837916A','Cover, door inner panel, window regulator, right'],
  ['24','992837997','Cover, door inner panel, loudspeaker'],['25','992867159','Bracket for door trim'],
  ['26','N 90944604','Oval hexagon socket head bolt M5x12'],
  ['27','992837841A','Cushioned side protection, left'],['27','992837842','Cushioned side protection, right'],['28','992867075','Bracket']]};

// 804-200: outer handles (keyless entry and Keyless-Go versions), lock covers,
// mounting bars and lock cylinder. Left-hand-drive (US) rows only.
const doorHandles={id:'door-handles',code:'804-200',title:'Door handles, outer',year:'2023 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2023_(992-1)/PartDiagrams/804-200/Door_handles',
 rows:[['1','992837205J G2X','Outer door handle, left, primed, keyless entry'],['1','992837206J G2X','Outer door handle, right, primed, keyless entry'],
  ['2','992837205D G2X','Outer door handle, left, primed, Keyless-Go'],['2','992837206D G2X','Outer door handle, right, primed, Keyless-Go'],
  ['3','992837973',"Cover, door lock, left (driver's side), left-hand drive"],['3','992839160','Cover, door lock, right (passenger side), left-hand drive'],
  ['4','WHT002684',"Locating bolt M4x28, driver's door"],['5','992837017','Bowden cable'],
  ['6','992837885AY',"Handle mounting bar, left (driver's side), keyless entry"],['6','992837885 Y',"Handle mounting bar, left (driver's side), Keyless-Go"],
  ['6','992837886F','Handle mounting bar, right (passenger side), keyless entry'],['6','992837886D','Handle mounting bar, right (passenger side), Keyless-Go'],
  ['7','992837217 Y','Lock cylinder, left, coded to the vehicle'],['8','N 0124341','Retaining washer, lock cylinder'],
  ['9','992837360','Securing element M5'],['10','992898511','Repair set, fixing adapter']]};

const windowRegulator={id:'window-regulator',code:'804-300',title:'Door window regulator',year:'2023 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2023_(992-1)/PartDiagrams/804-300/Window_regulator',
 rows:[['1','992837461','Window regulator without motor, left'],['1','992837462','Window regulator without motor, right'],
  ['2','971959802','Window regulator motor, left'],['2','971959801','Window regulator motor, right'],
  ['3','9P1837259','Threaded hook'],['3','9P1837359','Threaded hook, door window'],
  ['4','PAF015082','Hexagon collar nut M6'],['5','95553369100','Oval head panel screw, window regulator']]};

// 805-010: the Cabriolet door glass from model year 2021 on (PK8K).
const doorWindow={id:'door-window',code:'805-010',title:'Door window glass, Cabriolet',year:'2021 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2021_(992-1)/PartDiagrams/805-010/Door_window',
 rows:[['1','992845019E','Door window glass, left, Cabriolet'],['1','992845020E','Door window glass, right, Cabriolet'],
  ['2','9P1837359','Threaded hook, door window']]};

// 804-150: the Cabriolet door seals and mouldings. Targa and aluminium-package rows are left out.
const doorSeals={id:'door-seals-cabriolet',code:'804-150',title:'Door seals and mouldings, Cabriolet',year:'2019 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/804-150/DOOR_SEAL',
 rows:[['1','992837639E','Door seal, outer, left'],['1','992837640E','Door seal, outer, right'],
  ['2','992831703K','Door seal, inner, left'],['2','992831704H','Door seal, inner, right'],
  ['3','992837625D','Door seal, outer, left, Cabriolet'],['3','992837626C','Door seal, outer, right, Cabriolet'],
  ['4','992837479C','Window aperture seal, rear, left'],['4','992837480C','Window aperture seal, rear, right'],
  ['5','992837307A OK1','Cover, window guide, left, matt black'],['5','992837308A OK1','Cover, window guide, right, matt black'],
  ['6','PAF107012','Hexagon socket oval head collared screw 4x16'],
  ['7','992853327A','Decorative moulding'],['7','992853328A','Decorative moulding'],
  ['8','PAF008800','Pop rivet A4.0x7.9'],['9','992845121D','Seal, A-pillar'],
  ['10','N 91074201','Hexagon socket head bolt M5x16'],['11','PAF908146','Riveted cap nut M5'],
  ['12','95853743740','Adhesive tape, door shell'],['12','V04015800B','Adhesive tape 40x12000, door shell'],
  ['13','PAF009298','Bung'],['14','992837391A','Window guide, left'],['14','992837392A','Window guide, right'],
  ['16','N 10456201','Socket head bolt M6x25, multi-point']]};

const panelFasteners={id:'door-panel-fasteners',code:'808-900',title:'Door panel fasteners and inner handles',year:'2020 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/808-900/DOOR_PANEL',
 rows:[['1','992837019B','Inner door handle, left'],['1','992837020B','Inner door handle, right'],
  ['2','992867729','Bracket, rebound strap, left'],['2','992867730','Bracket, rebound strap, right'],
  ['3','992867735','Securing bracket, left'],['3','992867736','Securing bracket, right'],
  ['4','95B867084A','Stop buffer, distance piece'],['5','N 90824902','Oval head panel screw 5x14'],
  ['6','N 90953004','Oval hexagon socket head bolt M5x14'],['7','992867633A','Door panel clip'],
  ['8','992868537A','Cover, door panel, left'],['8','992868538A','Cover, door panel, right'],['9','PAF909757','Round head screw M5x16']]};

// 808-910: door panel covers, black versions only.
const panelAccessories={id:'door-panel-accessories',code:'808-910',title:'Door panel accessories',year:'2023 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2023_(992-1)/PartDiagrams/808-910/door_panel_Accessories',
 rows:[['1','992868441B 5Q0','Cover, left, black'],['1','992868442B5Q0','Cover, right, black'],
  ['2','992868537A 5Q0','Cover, door panel, left, black'],['2','992868538A 5Q0','Cover, door panel, right, black'],
  ['3','992868355 6N3','Switch mounting adapter, passenger door, matt black'],['4','PAA945699','Bose lettering, self-adhesive']]};

// 809-500: the exterior mirrors. Primed housings and left-hand-drive rows;
// the US glass is flat on the left and convex with the inscription on the right.
const mirror={id:'exterior-mirror',code:'809-500',title:'Exterior mirror',year:'2024 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2024_(992-1)/PartDiagrams/809-500/Exterior_mirror',
 rows:[['1','992857527F G2X','Exterior mirror housing, left, primed'],['1','992857528F G2X','Exterior mirror housing, right, primed'],
  ['2','992857109C G2X','Trim for mirror housing, left, primed'],['2','992857110C G2X','Trim for mirror housing, right, primed'],
  ['3','992857577C G2X','Mirror foot cover, left, primed'],['3','992857578C G2X','Mirror foot cover, right, primed'],
  ['4','992857537ADG2X','Lower cover cap, left, primed, adjustable mirrors'],['4','992857538ADG2X','Lower cover cap, right, primed, adjustable mirrors'],
  ['4','992857537AFG2X','Lower cover cap, left, primed, power-folding mirrors'],['4','992857538AFG2X','Lower cover cap, right, primed, power-folding mirrors'],
  ['4','992857537AHG2X','Lower cover cap, left, primed, side cameras'],['4','992857538AHG2X','Lower cover cap, right, primed, side cameras'],
  ['5','992857521','Mirror glass, flat, left, dimming interior mirror'],['5','992857521C','Mirror glass, flat, left, auto-dimming interior mirror'],
  ['5','992857521F','Mirror glass, flat, left, lane change assist'],['5','992857521J','Mirror glass, flat, left, auto-dimming and lane change assist'],
  ['6','992857522A','Mirror glass, convex, right, US inscription'],['6','992857522D','Mirror glass, convex, right, US inscription, auto-dimming interior mirror'],
  ['6','992857522J','Mirror glass, convex, right, US inscription, lane change assist'],['6','992857522M','Mirror glass, convex, right, US inscription, auto-dimming and lane change assist'],
  ['7','992857411D',"Mirror base, left (driver's side), adjustable"],['7','992857412D','Mirror base, right (passenger side), adjustable'],
  ['7','992857411F',"Mirror base, left (driver's side), power-folding"],['7','992857412F','Mirror base, right (passenger side), power-folding'],
  ['11','992097022A','Special screw set, exterior mirror'],
  ['12','992857117','Camera bracket, lower, left mirror'],['12','992857118','Camera bracket, lower, right mirror'],
  ['13','992857155A','Camera bracket, upper, mirror'],['14','95898054600','Camera, side camera system'],
  ['15','992949133A','Peripheral light, left mirror'],['15','992949134A','Peripheral light, right mirror'],
  ['16','992857555','Gap sealing, left mirror'],['16','992857556','Gap sealing, right mirror'],
  ['17','992857679','Underlay, left mirror'],['17','992857680','Underlay, right mirror'],
  ['18','N 91259501','Socket head collared bolt M8x32, multi-point'],
  ['19','95853743740','Adhesive tape, door shell'],['19','V04015800B','Adhesive tape 40x12000, door shell'],
  ['20','958959578A','Mirror adjuster unit with memory function']]};

export const studies=[catalogueStudy(sideWindow,'p992-doors-'),catalogueStudy(doorShell,'p992-doors-'),catalogueStudy(doorHandles,'p992-doors-'),
 catalogueStudy(windowRegulator,'p992-doors-'),catalogueStudy(doorWindow,'p992-doors-'),catalogueStudy(doorSeals,'p992-doors-'),
 catalogueStudy(panelFasteners,'p992-doors-'),catalogueStudy(panelAccessories,'p992-doors-'),catalogueStudy(mirror,'p992-doors-')];
const [side,shell,handles,regulator,glass,seals,fasteners,accessories,mirrors]=studies;
export const views=new Map([
 ['regulator-porsche992scab.motor',side],
 ['door-porsche992scab-front-left.skin',shell],
 ['door-porsche992scab-front-left.outer-handle',handles],
 ['regulator-porsche992scab.track',regulator],
 ['door-porsche992scab-front-left.glass',glass],
 ['door-porsche992scab-front-left.seals',seals],
 ['door-porsche992scab-front-left.inner-handle',fasteners],
 // Nested: the door panel cover opens the panel accessories; the door shell opens the mirror bolted to it.
 ['p992-doors-door-panel-fasteners.r8-992868537a',accessories],
 ['p992-doors-door-shell.r1-992831051fygrv',mirrors],
]);
