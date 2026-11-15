// The control labels are inside buttons or sliders; one adjacent speaker can
// explain a group without nesting interactive elements.
export const garageControlHelp={
  'mechanism-controls':'Play motion runs the mechanism. Use the cycle position slider to move through it one step at a time.',
  'section-tools':'Choose the cut direction and move the slider to see inside. Reverse cut shows the opposite side. Show whole section restores the full view.'
};

// Normalization is shared by the player and the recording generator.
export const voiceWords = text => (text.normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/(\d),(?=\d{3}(?:\D|$))/g,'$1').replace(/\$([0-9.]+)/g,'$1 dollars ').replace(/%/g,' percent ').replace(/±/g,' plus or minus ').replace(/(\d)[–−](?=\d)/g,'$1 to ').replace(/[−-](?=\d)/g,' minus ').match(/[\p{L}\p{N}]+(?:['.][\p{L}\p{N}]+)*/gu)||[]);
export const voiceKey = text => voiceWords(text).join(' ');

export function spokenText(text) {
  // Normalize Unicode subscripts before matching formulas. Use a complete
  // chemical or engine designation before its shorter component terms.
  return text.normalize('NFKC')
    .replace(/\bCO2\b/g,'carbon dioxide').replace(/\bO2\b/g,'oxygen')
    .replace(/\bLiOH\b/g,'lithium hydroxide').replace(/\bH2O\b/g,'water')
    .replace(/\bH2\b/g,'hydrogen').replace(/\bH0\b/g,'H naught')
    .replace(/\bWinGD\b/g,'Winterthur Gas and Diesel').replace(/\bX92[-‑]B\b/g,'X ninety two B')
    .replace(/\bGE\b/g,'G E').replace(/\bCF6[-‑]80C2\b/g,'C F six eighty C two').replace(/\bCF6\b/g,'C F six')
    .replace(/\b992\.1\b/g,'nine ninety two point one').replace(/\b992\b/g,'nine ninety two')
    .replace(/\bS[-‑]IVB\b/g,'S four B').replace(/\bS[-‑]II\b/g,'S two').replace(/\bS[-‑]IC\b/g,'S one C')
    .replace(/\bCVT\b/g,'C V T').replace(/\bECU\b/g,'E C U')
    .replace(/\bMAF\b/g,'mass airflow').replace(/\bDOHC\b/g,'double overhead cam')
    .replace(/\bSOHC\b/g,'single overhead cam').replace(/\bHR[-‑]V\b/g,'H R V')
    .replace(/\bBMW\b/g,'B M W').replace(/\bG500\b/g,'G five hundred')
    .replace(/\b325Ci\b/gi,'three twenty five C I').replace(/\b911\b/g,'nine eleven')
    .replace(/\b993\b/g,'nine ninety three').replace(/\bV8\b/gi,'V eight')
    .replace(/\bAI\b/g,'A I').replace(/\bML\b/g,'M L').replace(/\bAUROC\b/g,'A U R O C')
    .replace(/\bRMSE\b/g,'R M S E')
    .replace(/\bSaturn V\b/g,'Saturn Five').replace(/\bAtlas V\b/g,'Atlas Five')
    .replace(/↗|↓|↑/g,' ').replace(/&/g,' and ').replace(/\s+/g,' ').trim();
}

// Only use a voice the device identifies as local. Speech never leaves the site and device.
export function localNarrator(voices) {
  const names=[/\bguy\b/i,/\bdavid\b/i,/\bmark\b/i,/\bevan\b/i,/\bjoey\b/i,/\bnathan\b/i,/\balex\b/i,/\btom\b/i,/\baaron\b/i,/\bjoel\b/i,/\bav[a-z]* andrew\b|\bandrew\b/i,/\bmale\b/i];
  const ranked=voices.filter(v=>v.localService===true && /^en[-_]US(?:$|[-_])/i.test(v.lang))
    .map(v=>({v,rank:names.findIndex(re=>re.test(v.name))})).filter(x=>x.rank>=0);
  ranked.sort((a,b)=>a.rank-b.rank);
  return ranked[0]?.v || null;
}

export function phraseIndex(entries) {
  const root=new Map();
  for(const [phrase,range] of entries) {
    let branch=root;
    for(const token of voiceWords(phrase)) {
      if(!branch.has(token))branch.set(token,new Map());
      branch=branch.get(token);
    }
    branch.set(null,range);
  }
  return root;
}

function numericWords(token) {
  if(!/^\d{1,7}(?:\.\d{1,8})?$/.test(token))return null;
  const [integer,decimal]=token.split('.');
  const small='zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
  const tens='zero ten twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
  function whole(n) {
    if(n<20)return [small[n]];
    if(n<100)return [tens[Math.floor(n/10)],...(n%10?[small[n%10]]:[])];
    const size=n>=1e6?1e6:n>=1e3?1e3:100;
    return [...whole(Math.floor(n/size)),size===1e6?'million':size===1e3?'thousand':'hundred',...(n%size?whole(n%size):[])];
  }
  return [...whole(Number(integer)),...(decimal?['point',...Array.from(decimal,d=>small[Number(d)])]:[])];
}

// Longest recorded phrase first. Report a missing phrase before playing any part of it.
export function recordedRanges(text,index) {
  const words=voiceWords(text),ranges=[];
  for(let i=0;i<words.length;) {
    let branch=index,end=i,range=null;
    for(let j=i;j<words.length && branch.has(words[j]);j++) {
      branch=branch.get(words[j]);if(branch.has(null)){range=branch.get(null);end=j+1;}
    }
    if(!range){
      const digits=numericWords(words[i]);
      if(!digits)return null;
      for(const word of digits){const clip=index.get(word)?.get(null);if(!clip)return null;ranges.push(clip);}
      i++;continue;
    }
    ranges.push(range);i=end;
  }
  return ranges;
}
