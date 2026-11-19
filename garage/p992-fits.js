// Collects the 992 fit packs: installed parts drawn onto the car. Each pack lives in
// its own file so packs can be built in parallel without touching shared files.
import * as engine from './p992-fit-engine.js';
import * as exhaust from './p992-fit-exhaust.js';
import * as front_axle from './p992-fit-front-axle.js';
import * as rear_axle from './p992-fit-rear-axle.js';
import * as body from './p992-fit-body.js';
import * as interior from './p992-fit-interior.js';
import * as electrics from './p992-fit-electrics.js';
import * as wipers_lamps from './p992-fit-wipers-lamps.js';
import * as doors from './p992-fit-doors.js';
import * as climate from './p992-fit-climate.js';
import {p992PackStudies} from './p992-packs.js';
import {p992CatalogStudies} from './porsche992-catalog-studies.js';

export const p992Fits={'engine':engine,'exhaust':exhaust,'front-axle':front_axle,'rear-axle':rear_axle,'body':body,'interior':interior,'electrics':electrics,'wipers-lamps':wipers_lamps,'doors':doors,'climate':climate};
export const fitGroups=Object.values(p992Fits).flatMap(p=>p.groups);
export const fitLines=Object.values(p992Fits).flatMap(p=>p.lines);
export const fitMounts=Object.values(p992Fits).flatMap(p=>p.mounts);
const catalogue=[...p992CatalogStudies,...p992PackStudies].filter(s=>s.catalogue);
export const numberOf=name=>name.split(' · ').pop().trim();
// The catalogue study that lists a fitted part's number on its cited page, so a
// click on the installed part opens the diagram it came from.
const byPart=new Map(fitGroups.flatMap(g=>g.parts).map(p=>[p.id,catalogue.find(s=>s.catalogue.url===p.source?.url&&s.groups.some(g=>g.parts.some(q=>numberOf(q.name)===numberOf(p.name))))]));
export function fitDetail(id){return byPart.get(id)||null;}
