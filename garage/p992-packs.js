// Collects the 992 study packs. Each pack lives in its own file so packs can be
// built in parallel without touching shared files.
import * as brakes_front from './p992-pack-brakes-front.js';
import * as brakes_rear from './p992-pack-brakes-rear.js';
import * as brake_hydraulics from './p992-pack-brake-hydraulics.js';
import * as front_axle from './p992-pack-front-axle.js';
import * as rear_axle from './p992-pack-rear-axle.js';
import * as steering from './p992-pack-steering.js';
import * as wheels from './p992-pack-wheels.js';
import * as drivetrain from './p992-pack-drivetrain.js';
import * as exhaust from './p992-pack-exhaust.js';
import * as turbochargers from './p992-pack-turbochargers.js';
import * as intake from './p992-pack-intake.js';
import * as fuel from './p992-pack-fuel.js';
import * as cooling from './p992-pack-cooling.js';
import * as lubrication from './p992-pack-lubrication.js';
import * as crank_ignition from './p992-pack-crank-ignition.js';
import * as climate from './p992-pack-climate.js';
import * as electrics from './p992-pack-electrics.js';
import * as lighting from './p992-pack-lighting.js';
import * as doors from './p992-pack-doors.js';
import * as interior from './p992-pack-interior.js';
import * as body from './p992-pack-body.js';

export const p992Packs={'brakes-front':brakes_front,'brakes-rear':brakes_rear,'brake-hydraulics':brake_hydraulics,'front-axle':front_axle,'rear-axle':rear_axle,'steering':steering,'wheels':wheels,'drivetrain':drivetrain,'exhaust':exhaust,'turbochargers':turbochargers,'intake':intake,'fuel':fuel,'cooling':cooling,'lubrication':lubrication,'crank-ignition':crank_ignition,'climate':climate,'electrics':electrics,'lighting':lighting,'doors':doors,'interior':interior,'body':body};
export const p992PackStudies=Object.values(p992Packs).flatMap(p=>p.studies);
export function getP992PackStudy(vehicle,id){
  if(vehicle!=='porsche992scab')return null;
  for(const pack of Object.values(p992Packs)){const s=pack.views.get(id);if(s)return s;}
  return null;
}
