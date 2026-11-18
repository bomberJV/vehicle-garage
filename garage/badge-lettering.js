// Chrome badge lettering drawn as thin rods on a body surface. Each glyph is
// a set of strokes in a unit cell (cap height 1, lowercase x-height .55);
// letter shapes are simplified and read as badges only at viewing distance.
const arc=(cx,cy,rx,ry,from,to,n=10)=>Array.from({length:n+1},(_,i)=>{
  const a=(from+(to-from)*i/n)*Math.PI/180;return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)];
});
const glyphs={
  ' ':{w:.35,s:[]},
  '-':{w:.42,s:[[[.04,.32],[.34,.32]]]},
  'V':{w:.66,s:[[[0,1],[.31,0],[.62,1]]]},
  '8':{w:.6,s:[arc(.29,.76,.2,.24,-90,270,14),arc(.29,.26,.25,.26,90,450,14)]},
  '0':{w:.62,s:[arc(.29,.5,.27,.5,0,360,18)]},
  '5':{w:.58,s:[[[.5,1],[.08,1],[.04,.56],...arc(.27,.31,.25,.31,120,-160,10).slice(1)]]},
  'S':{w:.58,s:[[[.52,.86],[.40,.97],[.24,1],[.08,.93],[.04,.78],[.12,.62],[.44,.44],[.54,.28],[.48,.08],[.30,0],[.12,.03],[.02,.14]]]},
  'L':{w:.5,s:[[[0,1],[0,0],[.46,0]]]},
  'G':{w:.68,s:[[...arc(.32,.5,.32,.5,40,330,14),[.62,.45],[.36,.45]]]},
  'M':{w:.78,s:[[[0,0],[0,1],[.37,.4],[.74,1],[.74,0]]]},
  'B':{w:.6,s:[[[0,0],[0,1],[.3,1],...arc(.3,.77,.2,.23,90,-90,8).slice(1),[0,.54]],[[.3,.54],...arc(.3,.27,.25,.27,90,-90,8).slice(1),[0,0]]]},
  'e':{w:.52,s:[[[.04,.29],[.46,.29],...arc(.25,.29,.21,.26,0,180,8).slice(1),...arc(.25,.27,.21,.27,180,320,6).slice(1)]]},
  'r':{w:.38,s:[[[0,0],[0,.55]],[[0,.32],...arc(.22,.32,.22,.23,180,90,5).slice(1),[.34,.55]]]},
  'c':{w:.48,s:[arc(.25,.275,.22,.275,40,320,12)]},
  'd':{w:.56,s:[[[.48,0],[.48,1]],arc(.25,.275,.23,.275,0,360,14)]},
  's':{w:.46,s:[[[.42,.47],[.3,.55],[.12,.53],[.05,.42],[.12,.32],[.34,.24],[.42,.13],[.35,.02],[.16,0],[.03,.07]]]},
  'n':{w:.52,s:[[[0,0],[0,.55]],[[0,.36],...arc(.22,.32,.22,.23,180,0,8).slice(1),[.44,0]]]},
  'z':{w:.46,s:[[[.03,.55],[.42,.55],[.03,0],[.43,0]]]},
};
// Lay out text along a surface: `place(u,v)` maps badge coordinates in metres
// (u along the text, v up) to a world point standing proud of the panel.
export function drawLettering(r,text,height,place,{radius=height*.075,color='#e3e7e6',tracking=.12}={}){
  let pen=0;
  for(const ch of text){
    const g=glyphs[ch];if(!g)throw new Error('No badge glyph for '+ch);
    for(const stroke of g.s)for(let i=1;i<stroke.length;i++){
      const [a,b]=[stroke[i-1],stroke[i]].map(([u,v])=>place((pen+u)*height,v*height));
      r.rod(a,b,radius,color,6);
    }
    pen+=g.w+tracking;
  }
  return pen*height;
}
export function letteringWidth(text,height,tracking=.12){
  return [...text].reduce((w,ch)=>w+glyphs[ch].w+tracking,0)*height;
}
