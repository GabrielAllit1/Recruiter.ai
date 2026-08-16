const $ = (id) => document.getElementById(id);
let state = { rawText:'', profile:null, jobs:[] };

const SKILLS = ['python','javascript','typescript','react','node','sql','excel','power bi','tableau','aws','azure','gcp','docker','kubernetes','ci/cd','git','linux','windows','customer service','sales','management','leadership','project management','operations','safety','compliance','training','documentation','data analysis','machine learning','ai','llm','automation','gis','lidar','photogrammetry','drone','uas','construction','procore','healthcare','nursing','medical','patient care','education','teaching','curriculum','research','writing','marketing','seo','accounting','finance','payroll','hr','forklift','welding','plumbing','electrical','hvac','warehouse','janitorial','custodial','security','inventory','logistics'];
const INDUSTRIES = ['technology','software','ai','healthcare','medicine','education','construction','renewable energy','government','public sector','finance','accounting','retail','warehouse','logistics','manufacturing','skilled trades','security','research','marketing','media','hospitality'];
const TITLE_PATTERNS = [
  ['AI Engineer',['ai','llm','machine learning','python']],['Python Developer',['python','software','automation']],['Automation Specialist',['automation','workflow','python']],['Solutions Consultant',['stakeholder','customer','solution','documentation']],['Project Manager',['project management','stakeholder','schedule']],['Operations Manager',['operations','safety','compliance']],['GIS Specialist',['gis','lidar','photogrammetry','geospatial']],['UAS Specialist',['uas','drone','part 107']],['Data Analyst',['data analysis','sql','excel','power bi']],['Software Developer',['javascript','react','node','git']],['Healthcare Assistant',['patient care','medical','healthcare']],['Teacher / Trainer',['education','teaching','training','curriculum']],['Administrative Assistant',['administrative','scheduling','office']],['Warehouse Associate',['warehouse','inventory','forklift']],['Maintenance Technician',['maintenance','hvac','electrical','plumbing']],['Custodian / Janitor',['janitorial','custodial','cleaning']],['Security Officer',['security','surveillance','access control']],['Customer Support Specialist',['customer service','support','crm']]
];
function setStatus(msg){ $('fileStatus').textContent = msg; }
function setResultStatus(msg){ $('resultStatus').textContent = msg; }
function switchView(id){ document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); $(id).classList.add('active'); document.querySelectorAll('.step').forEach(b=>b.classList.toggle('active', b.dataset.view===id)); }
function cleanText(t){ return (t||'').replace(/\u0000/g,' ').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,' ').replace(/[ \t]{2,}/g,' ').replace(/\n{3,}/g,'\n\n').trim(); }
function isUsableText(t){ const c=cleanText(t); const words=(c.match(/[A-Za-z]{2,}/g)||[]).length; return c.length>180 && words>35 && !c.includes('%PDF'); }
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function normalize(s){ return String(s||'').toLowerCase(); }
async function readFile(file){
  const name=file.name.toLowerCase();
  if(name.endsWith('.pdf')) throw new Error('PDF import is disabled. Please upload DOCX/TXT or paste clean resume text.');
  setStatus(`Reading ${file.name}...`);
  try{
    if(name.endsWith('.txt')||name.endsWith('.md')||name.endsWith('.rtf')) return await file.text();
    if(name.endsWith('.docx')) return await readDocx(file);
    return await file.text();
  }catch(e){ console.error(e); throw new Error('Could not read this file. Try DOCX, TXT, current-tab extraction, or paste the resume text.'); }
}
async function inflate(bytes){
  for(const mode of ['deflate','deflate-raw']){
    try{
      const ds = new DecompressionStream(mode);
      const writer = ds.writable.getWriter();
      writer.write(bytes); writer.close();
      const ab = await new Response(ds.readable).arrayBuffer();
      return new Uint8Array(ab);
    }catch(e){}
  }
  return null;
}
function bytesToLatin1(bytes){ let out=''; const chunk=0x8000; for(let i=0;i<bytes.length;i+=chunk) out+=String.fromCharCode(...bytes.slice(i,i+chunk)); return out; }
async function readDocx(file){
  const bytes=new Uint8Array(await file.arrayBuffer()); const files=await unzipDocx(bytes); const doc=files['word/document.xml'];
  if(!doc) throw new Error('Could not find resume text in this DOCX. Try paste text.');
  return doc.replace(/<w:tab\/>/g,'\t').replace(/<w:br\/>/g,'\n').replace(/<\/w:p>/g,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'");
}
function u16(b,i){return b[i]|(b[i+1]<<8)} function u32(b,i){return (b[i]|(b[i+1]<<8)|(b[i+2]<<16)|(b[i+3]<<24))>>>0}
async function unzipDocx(bytes){
  const out={}; let i=0;
  while(i<bytes.length-30){
    if(u32(bytes,i)!==0x04034b50){i++; continue}
    const method=u16(bytes,i+8), comp=u32(bytes,i+18), nlen=u16(bytes,i+26), xlen=u16(bytes,i+28);
    const name=bytesToLatin1(bytes.slice(i+30,i+30+nlen)); const dataStart=i+30+nlen+xlen; const data=bytes.slice(dataStart,dataStart+comp);
    let contentBytes=null;
    if(method===0) contentBytes=data; else if(method===8) contentBytes=await inflate(data);
    if(contentBytes) out[name]=new TextDecoder('utf-8').decode(contentBytes);
    i=dataStart+comp;
  }
  return out;
}
function analyze(text){
  text=cleanText(text); const low=text.toLowerCase();
  const email=(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)||[])[0]||'';
  const lines=text.split(/\n/).map(x=>x.trim()).filter(Boolean);
  let name=lines.find(l=>/^[A-Z][A-Za-z.'-]+\s+[A-Z][A-Za-z.'-]+/.test(l) && !/@|http|linkedin/i.test(l))||'Candidate';
  name=name.replace(/\s{2,}/g,' ').slice(0,48);
  const skills=SKILLS.filter(s=>low.includes(s));
  const industries=INDUSTRIES.filter(s=>low.includes(s));
  const titles=TITLE_PATTERNS.map(([title,keys])=>[title, keys.filter(k=>low.includes(k)).length]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x[0]);
  if(!titles.length) titles.push('Operations Support','Administrative Support','Customer Support Specialist');
  const level = low.includes('founder')||low.includes('senior')||low.includes('manager')||low.includes('lead') ? 'Senior' : (low.includes('associate')||low.includes('assistant')?'Entry/Mid':'Mid-level');
  const yearsGuess = /20\d{2}\s*[–-]\s*(present|current|2026)/i.test(text) ? '5+ years' : level;
  const salary = level==='Senior'?'$95k–$150k':level==='Mid-level'?'$55k–$105k':'$35k–$75k';
  const headline = titles[0] + (skills.slice(0,2).length ? ` · ${skills.slice(0,2).join(' · ')}` : '');
  return {name,email,headline,skills,industries,titles,level,yearsGuess,salary,raw:text};
}
function chipList(el, arr){ el.innerHTML=(arr.length?arr:['None found yet']).map(x=>`<span class="chip">${escapeHtml(x)}</span>`).join(''); }
function renderProfile(){ const p=state.profile; if(!p)return; $('candidateName').textContent=p.name; $('candidateHeadline').textContent=p.headline; $('levelOut').textContent=p.level; $('yearsOut').textContent=p.yearsGuess; $('salaryOut').textContent=p.salary; $('fitOut').textContent=p.titles[0]||'General'; chipList($('titlesOut'),p.titles); chipList($('skillsOut'),p.skills.slice(0,30)); chipList($('industriesOut'),p.industries.slice(0,12)); $('jobTitleHead').textContent=`Jobs for ${p.titles[0]||'you'}`; $('targetTitle').value=p.titles[0]||''; }
function buildSearchTerms(){ const p=state.profile; const title=$('targetTitle').value.trim() || p?.titles?.[0] || 'jobs'; const loc=$('locationInput').value.trim()||'remote'; const extra=$('extraInput').value.trim(); const skills=(p?.skills||[]).slice(0,5).join(' '); return {title,loc,extra,skills,q:[title,skills,extra,loc].filter(Boolean).join(' ')}; }
function ageDays(dateStr){ if(!dateStr)return 999; const d=new Date(dateStr); if(Number.isNaN(+d))return 999; return Math.max(0, Math.round((Date.now()-d.getTime())/86400000)); }
function parseSalary(text){ const m=String(text||'').match(/\$?\d{2,3}[,kK]?\s*(?:-|–|to)\s*\$?\d{2,3}[,kK]?/); return m?m[0]:''; }
function matchScore(job){
  const p=state.profile; const txt=normalize([job.title,job.company,job.description,job.tags?.join(' ')].join(' '));
  let score=45; for(const t of (p?.titles||[])){ if(txt.includes(t.toLowerCase().split('/')[0].trim())) score+=16; }
  for(const s of (p?.skills||[])){ if(txt.includes(s)) score+=4; }
  if(txt.includes('remote') && normalize($('locationInput').value).includes('remote')) score+=8;
  return Math.max(35, Math.min(98, score));
}
function ghostScore(job){
  const txt=normalize([job.title,job.company,job.description].join(' ')); const days=ageDays(job.date);
  let g=18; if(days>3)g+=8; if(days>7)g+=12; if(days>30)g+=25; if(!job.salary)g+=12; if(txt.includes('evergreen')||txt.includes('talent pool'))g+=22; if(txt.includes('confidential'))g+=10; if(txt.includes('reposted'))g+=16; if(txt.length<220)g+=8; if(txt.includes('urgent')||txt.includes('actively hiring'))g-=5;
  return Math.max(5, Math.min(95,g));
}
function freshnessLabel(date){ const d=ageDays(date); if(d===0)return 'Today'; if(d===1)return '1 day ago'; if(d<31)return `${d} days ago`; return '30+ days ago'; }
function passesFreshness(job){ const max=Number($('freshness').value||3); return ageDays(job.date)<=max; }
function workplaceStars(company){ let seed=0; for(const c of company) seed=(seed+c.charCodeAt(0))%100; return (3.6+(seed%12)/10).toFixed(1); }
async function fetchRemoteOK(q){
  const res=await fetch('https://remoteok.com/api',{headers:{'Accept':'application/json'}}); const data=await res.json();
  return (Array.isArray(data)?data.slice(1):[]).map(j=>({source:'RemoteOK',title:j.position||j.title||'Untitled role',company:j.company||'Unknown company',location:j.location||'Remote',date:j.date||j.created_at,description:(j.description||j.tags?.join(' ')||'').replace(/<[^>]+>/g,' ').slice(0,900),url:j.url||`https://remoteok.com/remote-jobs/${j.id}`,salary:j.salary_min&&j.salary_max?`$${j.salary_min}–$${j.salary_max}`:parseSalary(j.description),tags:j.tags||[]}));
}
async function fetchArbeitnow(q){
  const res=await fetch('https://www.arbeitnow.com/api/job-board-api'); const data=await res.json();
  return (data.data||[]).map(j=>({source:'Arbeitnow',title:j.title||'Untitled role',company:j.company_name||'Unknown company',location:(j.location||'').replace(/\s+/g,' ')||'Not listed',date:j.created_at?new Date(j.created_at*1000).toISOString():j.created_at,description:(j.description||'').replace(/<[^>]+>/g,' ').slice(0,900),url:j.url,salary:parseSalary(j.description),tags:j.tags||[]}));
}
function scoreAndFilter(raw){
  const {q,title,loc}=buildSearchTerms(); const qWords=normalize([title,...(state.profile?.skills||[]).slice(0,8)].join(' ')).split(/\W+/).filter(x=>x.length>2);
  const locLow=normalize(loc); const wantsRemote=locLow.includes('remote');
  const seen=new Set();
  return raw.map(j=>{j.match=matchScore(j); j.ghost=ghostScore(j); j.stars=workplaceStars(j.company); return j;})
    .filter(j=>{ const key=(j.title+'|'+j.company+'|'+j.url).toLowerCase(); if(seen.has(key))return false; seen.add(key); const txt=normalize([j.title,j.company,j.location,j.description,j.tags?.join(' ')].join(' ')); const hasTerm=qWords.some(w=>txt.includes(w)); const hasLoc=wantsRemote?txt.includes('remote')||normalize(j.location).includes('remote'):true; return hasTerm && hasLoc && passesFreshness(j); })
    .sort((a,b)=>(b.match-a.match)||(a.ghost-b.ghost)).slice(0,25);
}
async function searchJobs(){
  if(!state.profile){ setResultStatus('Import resume and build profile first.'); return; }
  setResultStatus('Searching exact job postings...'); $('jobResults').innerHTML='';
  const all=[]; const errors=[];
  for(const fn of [fetchRemoteOK,fetchArbeitnow]){ try{ all.push(...await fn(buildSearchTerms().q)); }catch(e){ errors.push(e.message); console.warn(e); } }
  state.jobs=scoreAndFilter(all);
  if(!state.jobs.length){ setResultStatus('No exact API results matched this freshness/location. Try Past week/month or broaden the target title.'); renderFallbackSearchLinks(); return; }
  setResultStatus(`${state.jobs.length} exact job postings found. Click any card or Apply to open the posting.`); renderJobs();
}
function renderFallbackSearchLinks(){
  const {q}=buildSearchTerms(); const urls=['linkedin.com/jobs','indeed.com','ziprecruiter.com','greenhouse.io','lever.co'].map(site=>({source:'Google exact-job search',title:`Search ${site}`,company:site,location:$('locationInput').value,date:new Date().toISOString(),description:'Fallback search link because live job APIs did not return enough exact matches for your filters.',url:'https://www.google.com/search?q='+encodeURIComponent(`site:${site} ${q} posted apply`),salary:'',tags:[],match:50,ghost:50,stars:'—'})); state.jobs=urls; renderJobs(); }
function renderJobs(){
  const box=$('jobResults');
  box.innerHTML=state.jobs.map((j,idx)=>{ const risk=j.ghost>60?'High':j.ghost>35?'Medium':'Low'; const cls=j.ghost>60?'bad':j.ghost>35?'warn':'good'; return `<div class="job" data-idx="${idx}"><div class="job-top"><div><h3>${escapeHtml(j.title)}</h3><div class="company">${escapeHtml(j.company)} · ${escapeHtml(j.source)} · ${escapeHtml(j.location||'')}</div></div><strong>${escapeHtml(j.stars)}★</strong></div><div class="badges"><span class="badge good">${j.match}% Match</span><span class="badge ${cls}">${risk} Ghost Score (${j.ghost}/100)</span><span class="badge">${escapeHtml(freshnessLabel(j.date))}</span>${j.salary?`<span class="badge good">${escapeHtml(j.salary)}</span>`:''}</div><p><b>Exact posting date:</b> ${escapeHtml(j.date?new Date(j.date).toLocaleDateString():'Not listed')}.</p><p>${escapeHtml((j.description||'').slice(0,240))}${j.description&&j.description.length>240?'…':''}</p><p><b>Resume keywords to consider:</b> ${resumeKeywordsFor(j).map(escapeHtml).join(', ')||'None obvious'}.</p><div class="job-actions"><button class="apply" data-idx="${idx}">Apply</button><button class="reviews" data-company="${escapeHtml(j.company)}">Reviews</button></div></div>`; }).join('');
  box.querySelectorAll('.job,.apply').forEach(el=>el.addEventListener('click',e=>{ const idx=e.currentTarget.dataset.idx ?? e.currentTarget.closest('.job')?.dataset.idx; if(idx!==undefined) chrome.tabs.create({url:state.jobs[idx].url}); }));
  box.querySelectorAll('.reviews').forEach(el=>el.addEventListener('click',e=>{ e.stopPropagation(); chrome.tabs.create({url:'https://www.google.com/search?q='+encodeURIComponent(`${e.currentTarget.dataset.company} employee reviews Glassdoor Indeed Comparably`) }); }));
}
function resumeKeywordsFor(j){ const txt=normalize([j.title,j.description,j.tags?.join(' ')].join(' ')); return SKILLS.filter(s=>txt.includes(s) && !(state.profile?.skills||[]).includes(s)).slice(0,8); }
function exportTxt(){ const body=state.jobs.map(j=>`${j.title}\n${j.company} · ${j.source}\nPosted: ${j.date||'not listed'}\nMatch: ${j.match}%\nGhost score: ${j.ghost}/100\nURL: ${j.url}\n`).join('\n---\n'); const blob=new Blob([body],{type:'text/plain'}); const url=URL.createObjectURL(blob); chrome.tabs.create({url}); }
async function extractCurrentTab(){
  try{ const [tab]=await chrome.tabs.query({active:true,currentWindow:true}); const res=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>document.body.innerText}); const text=cleanText(res?.[0]?.result||''); if(text.length<120){setStatus('Could not read enough visible page text.');return;} $('resumeText').value=text; state.rawText=text; setStatus('Visible profile/page text extracted. Click Build Candidate Profile.'); }catch(e){ console.error(e); setStatus('Extraction failed. Make sure the page is open and visible.'); }
}
function sample(){ return `Gabriel Allit\nAI Engineer | Applied AI | Python | Enterprise & Construction Systems\nApplied AI Engineer with experience developing, testing, and operationalizing AI solutions. Skills: Python, machine learning, LLM integration, agentic workflows, automation, computer vision, geospatial analytics, GIS, LiDAR, photogrammetry, Procore, technical documentation, stakeholder communication, project management, safety, compliance. Experience includes founder, applied AI engineer, UAS commercial pilot, GIS automation, operations, construction, renewable energy, data analysis, and documentation.`; }
$('importBtn').onclick=()=>$('fileInput').click();
$('fileInput').onchange=async(e)=>{ const file=e.target.files[0]; if(!file)return; try{ const text=await readFile(file); $('resumeText').value=cleanText(text); state.rawText=$('resumeText').value; setStatus(`Extracted ${state.rawText.length.toLocaleString()} characters from ${file.name}.`); }catch(err){ setStatus(err.message); } };
$('linkedinBtn').onclick=extractCurrentTab; $('sampleBtn').onclick=()=>{$('resumeText').value=sample();setStatus('Sample loaded.');}; $('clearTextBtn').onclick=()=>{$('resumeText').value='';setStatus('Cleared.');};
$('analyzeBtn').onclick=()=>{ const text=$('resumeText').value; if(!isUsableText(text)){setStatus('Resume text is empty or not readable. Use DOCX, TXT, paste, or current-tab extraction.');return;} state.profile=analyze(text); chrome.storage.local.set({profile:state.profile}); renderProfile(); switchView('profileView'); };
$('findJobsBtn').onclick=()=>{switchView('jobsView'); searchJobs();}; $('refreshJobsBtn').onclick=searchJobs;
$('copySearchBtn').onclick=()=>navigator.clipboard.writeText(buildSearchTerms().q); $('exportBtn').onclick=exportTxt;
$('resetBtn').onclick=()=>{ chrome.storage.local.clear(); location.reload(); };
document.querySelectorAll('.step').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
chrome.storage.local.get(['profile'],res=>{ if(res.profile){state.profile=res.profile; renderProfile();} });
