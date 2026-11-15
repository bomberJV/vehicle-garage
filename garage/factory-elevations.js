import {exteriorProfiles,registeredProfilePoint,upperOutlineGap} from './exterior-profiles.js';
import {GarageRenderer} from './render.js';
import {DEFAULT_BUILD} from './model.js';
import {softwareDepthRender} from './surface-materials.js';
import {dimensionStudies,measureStockMesh,coupeProfileStations} from './factory-dimensions.js';

const format=n=>n.toLocaleString('en-US');
const $=id=>document.getElementById(id);

// An elevation is a perpendicular projection of the same faces used on the workbench.
// It has a separate stock build so opening a drawing never changes a saved setup or pose.
function drawElevation(canvas,faces,study,view,definition,profile){
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const {min,max,ground,wheels,meters,longitudinal}=study,side=view==='side',front=view==='front';
  const horizontal=side?p=>p[0]:front?p=>-p[1]:p=>p[1];
  const display=meters=>definition.unit==='in'?(meters/.0254).toFixed(1)+' in':format(Math.round(meters*1000))+' mm';
  const span=side?meters.length:meters.width,mid=side?(longitudinal.min[0]+longitudinal.max[0])/2:(front?-1:1)*(min[1]+max[1])/2;
  const scale=Math.min((w-108)/span,(h-115)/(max[2]-ground));
  const x=u=>w/2+(u-mid)*scale,base=h-67;
  const project=p=>({x:x(horizontal(p)),y:base-(p[2]-ground)*scale,depth:side?-p[1]:front?-p[0]:p[0]});
  ctx.fillStyle='#192320';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#4c5a52';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(25,base);ctx.lineTo(w-25,base);ctx.stroke();
  softwareDepthRender({faces,ctx,canvas},w,h,project);
  function dimension(a,b,y,label){
    const left=Math.min(a,b),right=Math.max(a,b);
    ctx.strokeStyle='#a4bbad';ctx.lineWidth=1.5;ctx.beginPath();
    ctx.moveTo(left,y);ctx.lineTo(right,y);
    for(const end of [left,right]){ctx.moveTo(end,y-6);ctx.lineTo(end,y+6);}
    ctx.stroke();
    ctx.font='500 18px system-ui, sans-serif';ctx.textBaseline='middle';ctx.textAlign='center';
    const labelWidth=ctx.measureText(label).width+15;
    ctx.fillStyle='#192320';ctx.fillRect((left+right-labelWidth)/2,y-11,labelWidth,22);
    ctx.fillStyle='#e4eddf';ctx.fillText(label,(left+right)/2,y);
  }
  if(side && profile){
    const locate=point=>project(registeredProfilePoint(point,profile,wheels));
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
    for(const line of profile.curves||[]){
      ctx.beginPath();line.forEach((pt,i)=>{const p=locate(pt);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});
      ctx.strokeStyle='#362d1e';ctx.lineWidth=3.7;ctx.stroke();
      ctx.strokeStyle='#f6c75d';ctx.lineWidth=1.9;ctx.stroke();
    }
    const dots=profile==='coupe'?coupeProfileStations.map(([station,height])=>project([station,0,ground+height])):(profile.points||[]).map(locate);
    for(const p of dots){
      ctx.beginPath();ctx.moveTo(p.x,p.y-5);ctx.lineTo(p.x+5,p.y);ctx.lineTo(p.x,p.y+5);ctx.lineTo(p.x-5,p.y);ctx.closePath();
      ctx.fillStyle='#f6c75d';ctx.strokeStyle='#3a3223';ctx.fill();ctx.stroke();
    }
    ctx.restore();
  }
  dimension(x(mid-span/2),x(mid+span/2),22,display(span));
  // The vertical span starts at the bottom of the modeled tread.
  const rail=x(mid+span/2)+29,roof=base-(max[2]-ground)*scale,midZ=(roof+base)/2;
  ctx.save();ctx.strokeStyle='#a4bbad';ctx.lineWidth=1.5;ctx.beginPath();
  ctx.moveTo(rail,roof);ctx.lineTo(rail,base);
  for(const y of [roof,base]){ctx.moveTo(rail-5,y);ctx.lineTo(rail+5,y);}
  ctx.stroke();ctx.translate(rail,midZ);ctx.rotate(-Math.PI/2);
  const heightLabel=display(meters.height);
  const heightLabelWidth=ctx.measureText(heightLabel).width+14;
  ctx.fillStyle='#192320';ctx.fillRect(-heightLabelWidth/2,-11,heightLabelWidth,22);
  ctx.fillStyle='#e4eddf';ctx.fillText(heightLabel,0,0);ctx.restore();
  const axle=front?'front':'rear';
  if(!side&&wheels.front)return;
  const centers=side?[wheels.front||wheels['front-left'],wheels.rear||wheels['rear-left']]:[wheels[axle+'-left'],wheels[axle+'-right']];
  const positions=centers.map(p=>x(horizontal(p)));
  ctx.save();ctx.setLineDash([3,5]);ctx.strokeStyle='#9fbaaaa0';ctx.beginPath();
  for(const u of positions){ctx.moveTo(u,project(centers[0]).y);ctx.lineTo(u,base+32);}
  ctx.stroke();ctx.restore();
  const name=side?'Wheelbase':front?'Front track':'Rear track';
  const value=side?meters.wheelbase:front?meters.frontTrack:meters.rearTrack;
  dimension(...positions,base+33,name+'  '+display(value));
}
export function enableFactoryElevations(selectedVehicle){
  const dialog=$('factory-drawing'),canvas=$('factory-elevation'),marks=$('profile-markers');
  let stock,study,gap,loadedVehicle,view='side';
  function showView(next){
    const definition=dimensionStudies[loadedVehicle];
    view=next;
    for(const b of dialog.querySelectorAll('[data-elevation]'))b.setAttribute('aria-pressed',String(b.dataset.elevation===view));
    const profile=exteriorProfiles[loadedVehicle]||(loadedVehicle==='bmw325ci'?'coupe':null);
    const offered=Boolean(profile)&&view==='side';
    $('profile-controls').hidden=!offered;
    $('profile-label').textContent=profile?.label||'Mark five approximate points from the coupé drawing';
    const legend=$('profile-legend');
    legend.hidden=!(offered&&marks.checked&&profile.legend);
    if(!legend.hidden){
      const measurement=gap?' Across '+gap.count+' sampled positions, the median vertical gap is '+gap.median+' mm and the largest is '+gap.maximum+' mm.':'';
      legend.textContent=profile.legend+measurement;
    }
    canvas.setAttribute('aria-label','Stock '+definition.short+' '+view+' elevation with measured dimensions. Values are listed in the table.');
    drawElevation(canvas,stock,study,view,definition,marks.checked&&profile);
  }
  function open(){
    const id=selectedVehicle(),definition=dimensionStudies[id];
    if(dialog.open||!definition)return;
    if(loadedVehicle!==id){
      stock=GarageRenderer.assembledFaces({...DEFAULT_BUILD,vehicle:id,roofPosition:'up',paint:id==='bmws1000rr'?'#c5222c':'silver',finish:id==='bmws1000rr'?'black':'silver',parts:[]});
      study=measureStockMesh(id,stock);
      gap=upperOutlineGap(exteriorProfiles[id],study.wheels,stock);
      loadedVehicle=id;view='side';
      $('factory-variant').textContent=definition.name;
      $('factory-make').textContent=definition.make;
      $('factory-caption').textContent=definition.unit==='in'?'Dimensions in inches':'Dimensions in millimeters';
      $('factory-note').textContent=definition.note;
      $('factory-sources').replaceChildren(...definition.sources.map(ref=>{
        const a=document.createElement('a');a.textContent=ref.label+' ↗';a.href=ref.url;
        a.target='_blank';a.rel='noopener noreferrer';return a;
      }));
      $('factory-measurements').replaceChildren();
      for(const [key,label,value] of definition.rows){
        const row=$('factory-measurements').insertRow(),heading=document.createElement('th');
        heading.scope='row';heading.textContent=label;row.append(heading);
        row.insertCell().textContent=definition.unit==='in'?value.toFixed(1):format(value);
        row.insertCell().textContent=definition.unit==='in'?(study.meters[key]/.0254).toFixed(1):format(study.mm[key]);
      }
    }
    marks.checked=new URL(location.href).searchParams.get('profile')==='1';
    dialog.showModal();showView(view);
    const url=new URL(location.href);url.searchParams.set('drawing','dimensions');history.replaceState(null,'',url);
  }
  dialog.addEventListener('close',()=>{
    const url=new URL(location.href);url.searchParams.delete('drawing');url.searchParams.delete('profile');history.replaceState(null,'',url);
  });
  marks.addEventListener('change',()=>{
    const url=new URL(location.href);
    if(marks.checked)url.searchParams.set('profile','1');else url.searchParams.delete('profile');
    history.replaceState(null,'',url);showView(view);
  });
  for(const button of dialog.querySelectorAll('[data-elevation]'))button.addEventListener('click',()=>showView(button.dataset.elevation));
  for(const id of ['factory-drawing-open','factory-drawing-tab-open'])$(id).addEventListener('click',open);
  return open;
}
