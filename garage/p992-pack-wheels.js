// 992 study pack: wheels.
// Scope: Wheels, tyres and hubs: wheel bolts, centre caps, TPMS sensors, wheel bearings and hubs.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-wheels-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
//
// Wheel numbers are the base numbers without the colour code the catalogue appends
// (8Z8, JE1, OB5, OC6 and so on); where a row lists a superseding number, the newest is kept.
import {catalogueStudy} from './porsche992-catalog-studies.js';
export const hooks=["running.rims", "tire-section.tread", "tire-section.belts", "tire-section.casing", "tire-section.liner", "tire-section.beads"];

const es=(year,code,slug)=>`https://www.eurospares.co.uk/Porsche/992/${year}/PartDiagrams/${code}/${slug}`;
const P='p992-wheels-';

const wheels={id:'alloy-wheels',code:'601-000',title:'Alloy wheels',year:'2024 (992-1)',url:es('2024_(992-1)','601-000','Alloy_wheel'),
 rows:[
  ['1','992601025','Alloy wheel 8.5Jx19 ET52, front, summer and winter'],
  ['1','992601025A','Alloy wheel 11.5Jx20 ET67, rear, summer'],
  ['1','992601025B','Alloy wheel 11Jx20 ET66, rear, winter'],
  ['2','992601025DD','Alloy wheel 8.5Jx20 ET53, front, summer and winter'],
  ['2','992601025DE','Alloy wheel 11.5Jx21 ET67, rear, summer'],
  ['2','992601025E','Alloy wheel 11Jx21 ET66, rear, winter'],
  ['3','992601025BB','Alloy wheel 8.5Jx20 ET50, front, summer, from 15.06.2020'],
  ['3','992601025G','Alloy wheel 11.5Jx21 ET67, rear, summer'],
  ['4','992601025DG','Alloy wheel 8.5Jx20 ET50, front, summer, titanium'],
  ['4','992601025DH','Alloy wheel 11.5Jx21 ET67, rear, titanium'],
  ['5','992601025BE','Alloy wheel 8.5Jx20 ET50, front, from 15.06.2020'],
  ['5','992601025L','Alloy wheel 11.5Jx21 ET67, rear'],
 ]};

const wheels20={id:'alloy-wheels-titanium',code:'601-005',title:'Alloy wheels, 20/21-inch titanium (P46L)',year:'2022 (992-1)',url:es('2022_(992-1)','601-005','Alloy_wheel'),
 rows:[
  ['1','992601025BD','Alloy wheel 8.5Jx20 ET50, front, summer, titanium'],
  ['1','992601025N','Alloy wheel 11.5Jx21 ET67, rear, summer, titanium'],
  ['1','992601025Q','Alloy wheel 11Jx21 ET66, rear, winter, titanium'],
 ]};

const wheels19={id:'alloy-wheels-19-20',code:'601-015',title:'Alloy wheels, 19/20-inch (P58T)',year:'2024 (992-1)',url:es('2024_(992-1)','601-015','Alloy_wheel'),
 rows:[
  ['1','992601025EP','Alloy wheel 8Jx19 ET38, front, summer and winter'],
  ['1','992601025EQ','Alloy wheel 11.5Jx20 ET63, rear, summer'],
  ['1','992601025BH','Alloy wheel 11.5Jx20 ET68, rear, winter'],
 ]};

const parts={id:'wheel-parts',code:'601-030',title:'Wheel individual parts: bolts, balance weights, spare wheel and tyre sealant',year:'2020 (992-1)',url:es('2020_(992-1)','601-030','SINGLE_PARTS'),
 rows:[
  ['1','WHT010063','Wheel bolt M14x1.5x44, 17 mm across flats'],
  ['2','WHT010065A','Wheel bolt set M14x1.5x44, anti-theft'],
  ['3','PAB601178','Self-adhesive balance weight, 5 g'],
  ['3','9A760117900','Self-adhesive balance weight, 10 g'],
  ['3','PAB601181','Self-adhesive balance weight, 15 g'],
  ['3','PAB601182','Self-adhesive balance weight, 20 g'],
  ['3','PAB601183','Self-adhesive balance weight, 25 g'],
  ['3','9A760118400','Self-adhesive balance weight, 30 g'],
  ['3','PAB601185','Self-adhesive balance weight, 35 g'],
  ['3','PAB601186','Self-adhesive balance weight, 40 g'],
  ['3','PAB601187','Self-adhesive balance weight, 45 g'],
  ['3','PAB601188','Self-adhesive balance weight, 50 g'],
  ['3','9A760118900','Self-adhesive balance weight, 55 g'],
  ['3','PAB601190','Self-adhesive balance weight, 60 g'],
  ['4','9P1012615C','Tyre inflation compressor'],
  ['5','958012619','Tyre sealant'],
  ['6','992601010A','Space-saving spare wheel, red'],
  ['7','992601324A','Summer radial tyre for the spare wheel'],
 ]};

const caps={id:'hub-caps',code:'601-040',title:'Hub caps',year:'2021 (992-1)',url:es('2021_(992-1)','601-040','Hub_cap'),
 rows:[
  ['1','9A760115100','Hub cap, concave, multi-coloured Porsche crest'],
  ['1','9P1601147A','Hub cap, concave, single-colour Porsche crest'],
  ['1','9P1601147F','Hub cap, concave, coloured'],
  ['1','9P1601149A','Hub cap, convex, multi-coloured Porsche crest'],
  ['1','7P5601151','Hub cap, convex, multi-coloured'],
 ]};

const tpms={id:'tyre-pressure',code:'601-050',title:'Tyre pressure control system',year:'2021 (992-1)',url:es('2021_(992-1)','601-050','tyre_pressure_control_system'),
 rows:[
  ['1','PAB907275','Tyre pressure sensor, 433 MHz'],
  ['1','PAB907275A','Tyre pressure sensor, 315 MHz'],
  ['2','9P1601361F','Tyre valve, silver (type 1)'],
  ['2','9P1601361G','Tyre valve, black (type 2)'],
  ['3','N 90872901','Valve cap for the silver valve'],
  ['3','WHT006913','Valve cap for the black valve'],
  ['4','PAF009379','Hexagon socket head bolt, self-locking'],
  ['5','992907273D','Tyre pressure control unit, 433 MHz'],
  ['5','992907273E','Tyre pressure control unit, 315 MHz'],
  ['6','992907297B','Tyre pressure control unit bracket'],
 ]};

const frontHub={id:'front-wheel-hub',code:'401-005',title:'Front wheel carrier, wheel hub and wheel bearing',year:'2020 (992-1)',url:es('2020_(992-1)','401-005','WHEEL_CARRIER'),
 rows:[
  ['1','9P1407621B','Angular ball bearing, front wheel'],
  ['2','992407245AY','Front wheel carrier (swivel mounting), left'],
  ['2','992407246AY','Front wheel carrier (swivel mounting), right'],
  ['3','9P1407123','Retaining bolt, rear-wheel drive'],
  ['6','9P1407115','Spacer plate'],
  ['7','N 10806301','Hexagon collar bolt M8x35, wheel hub plate'],
  ['8','992927807','Wheel speed sensor'],
  ['9','N 10546403','Hexagon socket head bolt M6x16, speed sensor'],
  ['10','9P1407581A','Front wheel hub'],
  ['11','WHT007021','Self-locking hexagon nut M22x1.5 with washer'],
  ['12','PAF008742','Hexagon head bolt M12x1.5x70'],
  ['13','992611845','Brake line bracket, front left'],
  ['13','992611846','Brake line bracket, front right'],
  ['14','PAF100829','Hexagon head bolt (combi) M6x16'],
  ['15','PAF909664','Self-locking hexagon collar nut M12x1.5'],
 ]};

const rearHub={id:'rear-wheel-hub',code:'501-000',title:'Rear wheel carrier and wheel hub',year:'2020 (992-1)',url:es('2020_(992-1)','501-000','REAR_AXLE'),
 rows:[
  ['1','992505051BY','Rear wheel carrier, left'],
  ['1','992505052BY','Rear wheel carrier, right'],
  ['3','WHT004835','Ball screw M12x1.25x45'],
  ['4','992501651C','Rear wheel hub, bolted wheels'],
  ['5','WHT007021','Self-locking hexagon nut M22x1.5 with washer'],
  ['6','992927807','Wheel speed sensor'],
  ['7','N 10546403','Hexagon socket head bolt M6x16'],
  ['8','992971005','Cable holder, left'],
  ['8','992971006','Cable holder, right'],
  ['9','PAF100829','Hexagon head bolt (combi) M6x16'],
 ]};

// The front hub diagram (401-005) is built by the front-axle pack.
const ds=[wheels,wheels20,wheels19,parts,caps,tpms,rearHub];
export const studies=ds.map(d=>catalogueStudy(d,P));
const by=Object.fromEntries(ds.map((d,i)=>[d.id,studies[i]]));
const w=`${P}alloy-wheels.`;
export const views=new Map([
  ['running.rims',by['alloy-wheels']],
  ['tire-section.beads',by['tyre-pressure']],
  ['tire-section.liner',by['wheel-parts']],
  [w+'r1-992601025a',by['rear-wheel-hub']],
  [w+'r2-992601025dd',by['hub-caps']],
  [w+'r4-992601025dg',by['alloy-wheels-titanium']],
  [w+'r5-992601025be',by['alloy-wheels-19-20']],
]);
