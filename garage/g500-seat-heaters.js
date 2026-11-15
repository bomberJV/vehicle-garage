import {add,box,line,copper,black,rubber} from './g500-comfort-parts.js';

export function heaterPad(r,c,back=false,key='carrier',s=1){
 const at=(u,v,h)=>add(c,back?[.23*v*s-h*s,u*s,v*s]:[v*s,u*s,h*s]);
 const w=.130,length=back?.208:.161;
 if(key==='carrier'||key==='cover'){
  const dh=key==='carrier'?-.0016:.005,col=key==='carrier'?'#8c8680':'#534e4a';
  const p=[[-w*.84,-length],[w*.84,-length],[w,-length*.80],[w,length*.8],[w*.8,length],[-w*.8,length],[-w,length*.8],[-w,-length*.8]];
  r.polygon(p.map(([u,v])=>at(u,v,dh)),col,false);
 }else if(key==='trace'){
  const pts=[];for(let j=0;j<9;j++){const v=-length*.77+1.54*length*j/8,sign=j%2?-1:1;
   pts.push(at(-sign*w*.77,v,0),at(sign*w*.77,v,0));}
  line(r,pts,.0019*s,copper,5);
 }else{
  const a=at(.090,length*.80,0),b=at(.110,length*.98,-.010);
  line(r,[a,b,at(.103,length+.029,-.021)],.0024*s,rubber,6);
  box(r,at(.103,length+.030,-.021),[.018*s,.014*s,.009*s],black);
 }
}

export function frontHeaterCenter(back,cy){
 return back?[.061,cy,1.067]:[-.16,cy,.813];
}
export function drawHeaterMat(r,c,back){
 for(const key of ['carrier','trace','connector'])heaterPad(r,c,back,key);
}
