// The side studies use the silhouette of the US-market body style in this collection.
// The two glass heights at the B-pillar and the sloping leading edge are independent.
const ref=(label,url)=>({label,url});
export const references={
  g500:ref('Mercedes-Benz Classic · 2002 G500 front door','https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/body--front-door'),
  f350:ref('LMC Truck · 1992–96 F-Series vent window','https://www.lmctruck.com/door-components%2Fvent-window%2Ffd-1992-96-vent-window-and-components'),
  bmw325ci:ref('BMW illustrated catalog · 2003 325Ci coupe window lift','https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/vehicle_trim/door_window_lifting_mechanism.html'),
  c63:ref('Mercedes-Benz Classic · W204 window carrier','https://classicparts.mbusa.com/oem-parts/mercedes-benz-window-regulator-2127201679'),
  hrv:ref('Honda illustrated catalog · 2026 HR-V front door glass and regulator','https://www.hondapartsnow.com/parts-list/2026-honda-hr_v--5_door_lx_2wd-cvt/body_air_conditioning/front_door_glass_regulator.html'),
  porsche993cab:ref('Porsche PET · 993, illustrations 804-20, 804-30 and 807-11','https://porschecarshistory.com/wp-content/old/manuals/E/E_993_KATALOG.pdf'),
  porsche992scab:ref('Porsche Aftersales · 992 window lift and motor','https://static.nhtsa.gov/odi/tsbs/2025/MC-11015113-0001.pdf'),
  hrvRear:ref('Honda illustrated catalog · HR-V rear door glass','https://www.hondapartsnow.com/parts-list/2026-honda-hr_v--5_door_ex_l_awd-cvt/body_air_conditioning/rear_door_glass_regulator.html'),
  fordLift:ref('Dorman · F-Series regulator with electric motor','https://www.dormanproducts.com/p-27204-741-674.aspx'),
  fordGate:ref('LMC Truck · 1987–96 tailgate, latches, rods and cables','https://www.lmctruck.com/1987-96-tailgate-assembly'),
  hondaGate:ref('Honda illustrated catalog · HR-V tailgate','https://www.hondapartsnow.com/parts-list/2026-honda-hr_v--5_door_lx_2wd-cvt/body_air_conditioning/tailgate.html'),
  gGate:ref('Mercedes-Benz Classic · 2002 G500 back door','https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/body--back-door'),
  bmwLid:ref('BMW ETK · E46 coupe bodywork diagrams','https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/bodywork/trunk_lid_closing_system.html'),
  benzLid:ref('Mercedes-Benz · 2014 C63 trunk lid and latch','https://mbparts.mbusa.com/v-2014-mercedes-benz-c63-amg--base--6-3l-v8-gas/trunk-lid--trunk-lid-push-button-lock-trunk-lid-detachable-parts'),
  latch:ref('NHTSA · latch, rotor, pawl and striker definitions','https://www.nhtsa.gov/sites/nhtsa.gov/files/documents/tp-201-02b_tag.pdf')
};
// Outline vertices are [fraction along the door, height above the sill].
// Radii, hardware internals and thicknesses are schematic.
const profiles={
  g500:{name:'W463',length:1.00,belt:.77, lift:'cable',rails:1,paint:'#758075',style:'utility',
    pane:[[.055,.77],[.18,1.43],[.97,1.43],[.97,.77]],rearPane:[[.06,.77],[.06,1.43],[.94,1.43],[.94,.77]],
    rearLength:.90,note:'The exposed hinge barrels and upright framed window follow the early W463 door.'},
  f350:{name:'F-350 regular cab',length:1.26,belt:.73,lift:'sector',paint:'#8196a3',style:'pickup',
    pane:[[.065,.73],[.30,1.285],[.86,1.285],[.96,.73]],vent:true,
    note:'The vent pane at the leading edge has its own pivot. Only the wide glass behind the divider travels with the regulator. This section shows the optional power lift.'},
  bmw325ci:{name:'E46 coupe',length:1.55,belt:.65,lift:'cable',rails:2,paint:'#8292a5',style:'coupe',frameless:true,
    pane:[[.03,.65],[.31,1.01],[.75,1.043],[.87,1.032],[.962,.66]],
    note:'The long frameless coupe glass rises from two guided lifting points. The upper glass edge seals against the body.'},
  c63:{name:'W204 sedan',length:1.14,belt:.71,lift:'cable',rails:2,paint:'#7c8790',style:'sedan',carrier:true,
    pane:[[.04,.71],[.41,1.04],[.945,1.068],[.96,.718]],rearPane:[[.042,.71],[.042,1.062],[.50,1.04],[.92,.86],[.98,.724]],
    rearLength:.97,note:'The regulator and its mounting hardware sit on the door module carrier inside the W204 steel shell.'},
  hrv:{name:'HR-V',length:1.12,belt:.74,lift:'cable',rails:1,paint:'#8b9b96',style:'crossover',
    pane:[[.052,.74],[.42,1.115],[.95,1.14],[.952,.75]],rearPane:[[.042,.74],[.042,1.12],[.71,1.084],[.936,.865],[.96,.766]],
    rearLength:1.02,note:'The glass rides in the front and rear channels. A single central regulator rail carries the lift carriage.'},
  porsche993cab:{name:'993 Cabriolet',length:1.30,belt:.61,lift:'cross',paint:'#a38b75',style:'classic',frameless:true,vent:true,
    pane:[[.025,.61],[.34,.986],[.69,1.018],[.924,.991],[.988,.63]],
    note:'A fixed triangular quarter light and a frameless moving pane share the top of the door. A cross-arm lift supports the wide Cabriolet glass.'},
  porsche992scab:{name:'992 Carrera S Cabriolet',length:1.43,belt:.70,lift:'cable',rails:2,paint:'#818d9e',style:'modern',frameless:true,
    pane:[[.018,.7],[.35,1.085],[.69,1.108],[.90,1.061],[.981,.737]],
    note:'The door has a flush exterior handle and frameless glass. The electric regulator and drive motor are separate catalog assemblies.'}
};
export function doorProfile(vehicle,rear=false){
  const p=profiles[vehicle];
  if(!p||rear&&!p.rearPane)return null;
  return {...p,vehicle,rear,source:vehicle==='hrv'&&rear?references.hrvRear:references[vehicle],length:rear?p.rearLength:p.length,pane:rear?p.rearPane:p.pane};
}
