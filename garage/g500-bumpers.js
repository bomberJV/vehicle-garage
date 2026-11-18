// Bumper brackets and the catalog parts that make up both bumpers. Part
// numbers come from the 2002 G500 bumper diagrams; placement is estimated
// from the frame ends and the bumper backs.
const giant='https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/body-hardware/';
export const bumperRefs={
  front:{label:'MB Parts Giant · 2002 G500 front bumper and components diagram',url:giant+'bumper-components-front'},
  rear:{label:'MB Parts Giant · 2002 G500 rear bumper and components diagram',url:giant+'bumper-components-rear'}
};
const steel='#3a4041',dark='#24292a';
export function drawFrontBumperBrackets(r,back){
  for(const s of [-1,1])r.instance(s<0?'left':'right',()=>{
    const y=(a,b)=>[Math.min(s*a,s*b),Math.max(s*a,s*b)];
    const [p0,p1]=y(.536,.640),[a0,a1]=y(.536,.552);
    // Above the fog-lamp opening and clear of the coolers behind the bumper.
    r.box(back,p0,.603,back+.008,p1,.662,steel);
    r.box(back+.008,a0,.612,-1.990,a1,.650,steel);
  });
}
export function drawRearBumperBrackets(r,back){
  for(const s of [-1,1])r.tag('body.rear-bumper-bracket-'+(s<0?'left':'right'),()=>{
    const [y0,y1]=[Math.min(s*.460,s*.530),Math.max(s*.460,s*.530)];
    r.box(2.025,y0,.585,back,y1,.660,steel);
  });
  r.tag('body.rear-bumper-center-bracket',()=>r.box(2.025,-.080,.578,back,.080,.622,dark));
}
// [key, name, description, catalog side]
export const g500BumperParts=[
  ['front-bumper','Front bumper · 463-880-51-70','The painted steel bumper bar rolls in at the top and bottom lips. It carries the black perforated insert and the US plate carrier.','front'],
  ['front-bumper-cap-left','Front bumper end cap, left · 463-885-04-33','The left end cap wraps the bumper back toward the wheel arch.','front'],
  ['front-bumper-cap-right','Front bumper end cap, right · 463-885-05-33','The right end cap wraps the bumper back toward the wheel arch.','front'],
  ['front-bumper-brackets','Front bumper brackets · 463-881-21-14','One bracket on each side ties the bumper back to the outer face of the frame rail, just behind the front crossmember.','front'],
  ['rear-bumper','Rear bumper face bar · 463-880-04-71','The face bar spans the rear between the two outer ends. This is the version without PARKTRONIC holes.','rear'],
  ['rear-bumper-end-left','Rear bumper outer end, left · 463-880-07-71','The left outer end wraps the rear corner toward the wheel.','rear'],
  ['rear-bumper-end-right','Rear bumper outer end, right · 463-880-08-71','The right outer end wraps the rear corner toward the wheel.','rear'],
  ['rear-bumper-cap-left','Rear bumper end cap, left · 463-885-02-33','The left end cap closes the side end of the bumper.','rear'],
  ['rear-bumper-cap-right','Rear bumper end cap, right · 463-885-03-33','The right end cap closes the side end of the bumper.','rear'],
  ['rear-bumper-bracket-left','Rear bumper outer bracket, left · 463-885-43-14','The left outer bracket bolts the bumper to the end of the left frame rail.','rear'],
  ['rear-bumper-bracket-right','Rear bumper outer bracket, right · 463-885-44-14','The right outer bracket bolts the bumper to the end of the right frame rail.','rear'],
  ['rear-bumper-center-bracket','Rear bumper center bracket · 463-885-07-14','The center bracket supports the middle of the face bar from the rear crossmember.','rear'],
  ['rear-step-pad','Rear bumper step pads · 463-885-01-90','Black step pads sit on top of the bumper at each side of the cargo door.','rear'],
  ['rear-licence-bracket','Rear licence-plate bracket · 107-817-01-11','The plate bracket sits in the recessed panel in the rear body.','rear']
];
