// Earlier checks that remain applicable to the stock 2002 US configuration.
const catalog='https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/';
const roof={label:'Mercedes-Benz Classic · 2002 G500 roof plates',url:catalog+'body--sunroof'};
const tank={label:'Mercedes-Benz Classic · 2002 G500 fuel system',url:catalog+'fuel-system--fuel-system-components'};
export default [
 {ids:['roof.cassette','roof.lift','roof.panel','g500-roof-cassette.frame','g500-roof-cassette.rail-left','g500-roof-cassette.rail-right',
 'g500-roof-cassette.sliders','g500-roof-cassette.panel','g500-roof-cassette.seal','g500-roof-cassette.drip-rail','g500-roof-tilt.rails','g500-roof-tilt.jaws','g500-roof-tilt.supports','g500-roof-tilt.panel','g500-roof-tilt.seal','g500-roof-tilt.drip-rail'],
  kind:'diagram',source:roof,fact:'The frame plate distinguishes the panel and seal, handed guides, guide jaws, supports and rear drip rail. Those relationships are represented in the cassette.',
  need:'Measure the rail sections, cam slots and closed-panel clearances on the fitted cassette.'},
 {ids:['roof.cable','roof.drainage','roof.sunshade','g500-roof-cassette.drains','g500-roof-cassette.sunshade','g500-roof-drive.cable','g500-roof-drive.tube'],
  kind:'diagram',source:roof,fact:'The second roof plate identifies the inner shade and slide rails, drive cable and guide, and drain hoses and clips.',
  need:'Trace the hidden cable and drain paths and measure the shade travel in a long-wheelbase body.'},
 {ids:['electrical.battery'],kind:'diagram',source:{label:'Mercedes-Benz · W463 five-door rescue sheet',url:'https://rk.mb-qr.com/en/463/'},
  fact:'The post-December-2000 battery location in the rescue drawing agrees with the 2002 manual. The battery sits below the rear cup holder.',
  need:'Check the fitted battery case, tray, terminals and cable dimensions.'},
 {ids:['electrical.dashboard','electrical.footwell','electrical.tunnel','electrical.battery-box'],kind:'diagram',
  source:{label:'2002 G500 manual · fuses and relays',url:'https://www.manualowl.com/am/Mercedes/2002-G-Class/Manual/1379?page=300'},
  fact:'The manual locates fuse access at the driver’s dashboard end, passenger footwell, passenger side of the tunnel and battery box.',
  need:'Measure the mounting brackets, carrier angles and socket pattern of the fitted fuse panel.'},
 {ids:['fuel.tank','fuel.shield','g500-fuel-tank.vessel','g500-fuel-tank.sender','g500-fuel-tank.sender-seal','g500-fuel-tank.straps','g500-fuel-tank.sleeves','g500-fuel-tank.shield','g500-fuel-delivery.pump','g500-fuel-delivery.clamp','g500-fuel-delivery.cushion'],
  kind:'diagram',source:tank,fact:'The 2002 fuel-system plate establishes the separate shield and paired supports, tank-top sender, and external delivery pump with its cushion and clamp.',
  need:'Measure the fitted tank section, bracket offsets and sealing interfaces under the rear of the vehicle.'}
];
