// Every Porsche catalogue row the garage holds for the 992.1, one per line:
//   code | diagram title | url | part name · number
//   node tests/p992-catalogue-rows.mjs | grep -i 'oil filter'
import {p992PackStudies} from '../garage/p992-packs.js';
import {p992CatalogStudies} from '../garage/porsche992-catalog-studies.js';
export const catalogueStudies=[...p992CatalogStudies,...p992PackStudies].filter(s=>s.catalogue);
export const catalogueRows=()=>catalogueStudies.flatMap(s=>s.groups.flatMap(g=>g.parts.map(p=>({code:s.catalogue.code,title:s.catalogue.title,url:s.catalogue.url,name:p.name,number:p.name.split(' · ').pop().trim()}))));
if(import.meta.url===`file://${process.argv[1]}`)for(const r of catalogueRows())console.log([r.code,r.title,r.url,r.name].join(' | '));
