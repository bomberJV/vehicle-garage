const pet='https://files.porsche.com/f/332100/cfbfd366e3/kat017-e-911-98-katalog.pdf';
const sheet=(label,page)=>({label:'Porsche Classic · '+label,url:pet+'#page='+page});
export const refs={
 engineFilter:sheet('right-hand crankcase and engine oil filter, 101-10',38),
 intake:sheet('VarioRam distributor, actuators and flap, 107-12',94),pump:sheet('oil pump, 104-00',66),tank:sheet('oil tank and lines, 104-01',68),
 thermostat:sheet('filter and thermostat, 104-03',72),oilCooler:sheet('oil cooler and lines, 104-05',74),
 exchanger:sheet('Carrera heat exchangers, 202-05',136),heatValve:sheet('heating air supply, 202-20',146),
 cabin:sheet('heater and air conditioner, 813-05',572),compressor:sheet('compressor and clutch, 813-15',577),
 frontLines:sheet('front refrigerant circuit, 813-25',581),rearLines:sheet('rear refrigerant circuit, 813-30',584),
 condenser:sheet('front condenser and blower, 813-45',589),fog:sheet('headlamps and fog lamps, 905-00',647),
 cabinDucts:sheet('heating air guides and outlets, 813-00',568),
 blower:{label:'Bergvill F/X · 993 rear auxiliary and front cabin blowers',url:'https://www.bergvillfx.no/categories/964993-test-av-ventilasjon'},
 training:{label:'Porsche Service Training · 993 dry-sump lubrication',url:'https://data.club911.net/divers/964tech/964doc.pdf#page=65'}
};
