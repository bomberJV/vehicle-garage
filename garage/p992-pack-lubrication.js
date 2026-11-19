// 992 study pack: lubrication.
// Scope: Lubrication: oil pump, oil filter and housing, oil cooler, oil pan/sump, oil lines, oil level and pressure sensors, oil filler and dipstick.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-lubrication-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
import {catalogueStudy,catalogueShapes as s} from './porsche992-catalog-studies.js';
import {cyl,gear,sleeve,metal,steel,dark,y,z} from './mechanism-shapes.js';

export const hooks=["992caseright.wall", "992caseright.deck", "992caseright.webs", "992caseleft.deck", "992caseleft.webs", "ringpack.oil", "992casebolt.shaft", "992casebolt.washer", "992casebolt.threads"];

const at=(c,d)=>c.map((v,i)=>v+d[i]);
// Representative shapes for rows whose names the default classifier cannot place.
const sprocket=(r,c)=>gear(r,c,y,-.01,.01,.06,.06,24,steel);
const canister=(r,c)=>{cyl(r,at(c,[0,0,-.05]),z,0,.1,.04,dark,18);sleeve(r,at(c,[0,0,.05]),z,0,.012,.04,.02,metal,18);};
const element=(r,c)=>sleeve(r,at(c,[0,0,-.05]),z,0,.1,.04,.018,'#d8cfa8',24);
const bottle=(r,c)=>{cyl(r,at(c,[0,0,-.06]),z,0,.1,.035,'#c9c3b4',14);cyl(r,at(c,[0,0,.04]),z,0,.025,.014,'#d33a2c',10);};

// Eurospares copy of the Porsche catalogue: 2023 (992-1) diagram 104-000, oil pump.
const pump={id:'oil-pump',code:'104-000',title:'Oil pump',year:'2023 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2023_(992-1)/PartDiagrams/104-000/oil_pump',
  rows:[
    ['1','0PB115103E','Oil pump'],
    ['2','0PB115189','Seal for oil pump'],
    ['3','0PB115131','Seal for oil pump'],
    ['4','PAF008269','O-ring 28.0x3.0'],
    ['5','0PB115137','Seal ring'],
    ['6','0PB109570','Oil pump drive sprocket',sprocket],
    ['7','N 90365901','Oval hexagon socket head bolt M8x22'],
    ['8','0PB115169C','Oil suction pipe',s.hose],
    ['9','0PB115703','Oil pipe from the oil pump to the engine case',s.hose],
    ['10','PAF008271','O-ring 20.0x3.0'],
    ['11','PAF008137','Hexagon head bolt M6x80'],
    ['12','PAF008128','Hexagon head bolt M6x30'],
    ['13','9A700812500','Hexagon head bolt M6x16'],
    ['14','0PB115393C','Control valve, oil pump'],
    ['15','0PB115047','Securing clip for the oil pump solenoid valve',s.bracket],
    ['18','0PB115347','Seal for oil pump'],
  ]};

// Eurospares copy of the Porsche catalogue: 2020 (992-1) diagram 104-050, oil sump.
const sump={id:'oil-sump',code:'104-050',title:'Oil sump',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/104-050/OIL_PAN',
  rows:[
    ['1','0PB115814C','Oil sump, upper part',s.housing],
    ['2','0PB115808C','Oil sump, lower part, with gasket',s.housing],
    ['3','PAF10413408','Oval-head screw M6x25'],
    ['4','0PB115476C','Gasket for oil sump upper part'],
    ['5','0PB115685C','Gasket for oil sump lower part'],
    ['6','0PB115111C','Return seal'],
    ['7','0PB115625A','Seal ring, oil sump'],
    ['8','PAF008640','O-ring 10.0x3.5'],
    ['9','95810380100','Closure cap, oil sump'],
    ['10','95860616011','Oil level sensor'],
    ['11','PAF10413408','Oval-head screw M6x25'],
    ['12','0PB115821A','Heat insulation, left',s.panel],
    ['13','0PB115822A','Heat insulation, right',s.panel],
    ['14','N 90824902','Oval-head panel screw M5x14'],
    ['15','00004330501','Grease for oil sump gaskets, 50 g'],
  ]};

// Eurospares copy of the Porsche catalogue: 2019 (992-1) diagram 104-100, oil filter.
// Rows marked "D 09.07.2019 onward" are the later parts; the engine oils are the
// 0W-40 refills listed on the same page.
const filter={id:'oil-filter',code:'104-100',title:'Oil filter',year:'2019 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992/2019/PartDiagrams/104-100/OIL_FILTER',
  rows:[
    ['1','0PB115401G','Oil-conducting housing, complete'],
    ['2','PAF008131','Hexagon head bolt BM6x45'],
    ['3','PAF008134','Hexagon head bolt BM6x70'],
    ['4','0PB115466','Oil filter element',element],
    ['5','0PB115403','Oil filter',canister],
    ['6','9A711549900','Seal ring 91.0x4.0'],
    ['9','0PB115441','Gasket, heat exchanger'],
    ['10','PAF008086','O-ring 18.5x4.0'],
    ['11','PAF008085','O-ring 21.0x4.0'],
    ['12','PAF008087','O-ring 11.0x4.0'],
    ['13','0PB115427','Seal ring'],
    ['14','PAF008088','O-ring 20.0x4.0'],
    ['15','0PB115301A','Oil filler tube',s.hose],
    ['16','9A700826800','O-ring 34.52x3.53'],
    ['17','0PB115641','Bracket, oil filler tube'],
    ['18','N 90627102','Speed nut, self-locking M6'],
    ['19','PAF00835800','Oval-head screw M6x18'],
    ['20','9P1115423B','Sealing cap'],
    ['21','992115310A','Engine oil filler hose'],
    ['22','N 91108701','Hexagon bolt with internal Torx M6x25'],
    ['24','0PB115099B','Oil separator',s.housing],
    ['25','PAF008126','Hexagon head bolt BM6x20'],
    ['26','0PB906054','Oil temperature and oil pressure sender'],
    ['29','00004321093','Engine oil Mobil 1 0W-40, 1 litre',bottle],
    ['29','00004321106','Engine oil Mobil 1 0W-40, 1 US quart',bottle],
  ]};

export const studies=[pump,sump,filter].map(d=>catalogueStudy(d,'p992-lubrication-'));
// The pump hangs from the main-bearing webs, the sump closes the case's lower
// joint flange, and the oil-conducting housing with its filter sits on top of the case.
export const views=new Map([
  ['992caseright.webs',studies[0]],
  ['992caseright.wall',studies[1]],
  ['992caseleft.deck',studies[2]],
]);
