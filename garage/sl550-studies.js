import {slSeatStudies} from './sl550-seats.js';
import {slRoofStudies} from './sl550-roof.js';
import {slCabinStudies} from './sl550-cabin.js';
import {slPowerStudies} from './sl550-power.js';
import {slParkingStudy,slRearCameraStudy} from './sl550-assist.js';
import {slHeadlampStudy} from './sl550-lamp-optics.js';
const studies={'lights.headlamps':slHeadlampStudy,'sl-assist.rearview':slRearCameraStudy,'sl-assist.parking':slParkingStudy,...slSeatStudies,...slRoofStudies,...slCabinStudies,...slPowerStudies};
export const getSLStudy=(vehicle,part)=>vehicle==='sl550'&&Object.hasOwn(studies,part)?studies[part]:null;
