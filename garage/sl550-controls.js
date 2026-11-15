const levels=['Off','Low','Medium','High'];
const programs={'off':'Off','slow-gentle':'Slow and gentle','slow-vigorous':'Slow and vigorous','fast-gentle':'Fast and gentle','fast-vigorous':'Fast and vigorous'};
const fields=[['airscarf','AIRSCARF neck warmer'],['massage','Backrest massage'],['heat','Seat heating'],['vent','Seat ventilation']];

export const slControlPhrases=[...fields.map(([,label])=>label),...levels,...Object.values(programs)];

function seat(raw){
  const level=key=>[1,2,3].includes(Number(raw?.[key]))?Number(raw[key]):0;
  return {airscarf:level('airscarf'),heat:level('heat'),vent:level('vent'),massage:typeof raw?.massage==='string'&&Object.hasOwn(programs,raw.massage)?raw.massage:'off'};
}
export function slOptions(raw){
  return {slComfort:{driver:seat(raw.slComfort?.driver),passenger:seat(raw.slComfort?.passenger)},
    slGlass:raw.slGlass==='clear'?'clear':'dark',slWindstop:raw.slWindstop===true};
}
export function slComfortSummary(build,side){
  const value=build.slComfort[side];
  return fields.map(([id,label])=>label+' '+(id==='massage'?programs[value[id]]:levels[value[id]]).toLowerCase()).join(', ');
}
export function bindSLControls(read,apply,inspect){
  const byId=id=>document.getElementById(id),panel=byId('sl-comfort'),side=byId('sl-seat-side');
  const inputs={};
  for(const [id,label] of fields){
    const wrap=document.createElement('label');wrap.textContent=label;
    const select=document.createElement('select');select.id='sl-'+id;
    for(const [value,name] of Object.entries(id==='massage'?programs:levels))select.add(new Option(name,value));
    select.addEventListener('change',()=>{
      const b=read(),which=side.value;
      apply({slComfort:{...b.slComfort,[which]:{...b.slComfort[which],[id]:id==='massage'?select.value:Number(select.value)}}});
    });
    inputs[id]=select;wrap.append(select);byId('sl-seat-controls').append(wrap);
  }
  const glass=byId('sl-glass'),wind=byId('sl-windstop');
  glass.onchange=()=>apply({slGlass:glass.value});
  wind.onchange=()=>apply({slWindstop:wind.checked});
  for(const button of panel.querySelectorAll('[data-sl-study]')){
    button.addEventListener('click',()=>inspect('seats',button.dataset.slStudy,side.value));
  }
  function render(){
    const b=read();panel.hidden=b.vehicle!=='sl550';
    if(panel.hidden)return;
    const selected=b.slComfort[side.value];
    for(const [id,input] of Object.entries(inputs))input.value=String(selected[id]);
    glass.value=b.slGlass;wind.checked=b.slWindstop;wind.disabled=b.roofPosition==='up';
  }
  side.onchange=render;
  return render;
}
