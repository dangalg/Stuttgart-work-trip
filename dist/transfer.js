/* Private device backup; no network requests or external dependencies. */
(()=>{
'use strict';
const KEYS=['stuttgart-show-2026-v1','stuttgart-show-2026-activities-v1'];
const BACKUP='stuttgart-show-2026-transfer-backup-v1',JOURNAL='stuttgart-show-2026-transfer-journal-v1';
const MAX=5*1024*1024,FORMAT='stuttgart-show-planner-backup';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function safeTree(v,depth=0){if(depth>30)throw Error('The file is too deeply nested.');if(v&&typeof v==='object')for(const k of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(k))throw Error('The file contains an unsafe field.');safeTree(v[k],depth+1)}}
function validate(data){
 if(!object(data)||data.format!==FORMAT||data.version!==1||!object(data.state)||!Array.isArray(data.activities))throw Error('Choose a Stuttgart plan backup, version 1.');
 safeTree(data);if(Object.keys(data.state).length>10000||data.activities.length>10000)throw Error('The file contains too many activities.');
 const days=['','sunday','monday','tuesday','wednesday','thursday'];
 function fields(v){if(!object(v))throw Error('Invalid saved entry.');if('tags' in v&&(!Array.isArray(v.tags)||v.tags.some(t=>typeof t!=='string')))throw Error('Invalid category field.');for(const k of ['fair','booth'])if(k in v&&typeof v[k]!=='string')throw Error('Invalid '+k+' field.');for(const k of ['note','time','day','displayName','location','detail'])if(k in v&&typeof v[k]!=='string')throw Error('Invalid '+k+' field.');if('day'in v&&!days.includes(v.day))throw Error('Invalid date.');if('time'in v&&v.time!==''&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time))throw Error('Invalid time.');}
 Object.values(data.state).forEach(fields);const ids=new Set();
 for(const a of data.activities){fields(a);if(typeof a.id!=='string'||!a.id.startsWith('activity:')||a.id.length>200||ids.has(a.id)||a.custom!==true||typeof a.name!=='string'||!a.name.trim())throw Error('Invalid or duplicate custom activity.');ids.add(a.id)}
 return data;
}
function parse(text){if(typeof text!=='string'||new Blob([text]).size>MAX)throw Error('Choose a backup smaller than 5 MB.');let d;try{d=JSON.parse(text)}catch{throw Error('The selected file is not valid JSON.')}return validate(d)}
function readRaw(){return KEYS.map(k=>localStorage.getItem(k))}
function restore(raw){KEYS.forEach((k,i)=>raw[i]===null?localStorage.removeItem(k):localStorage.setItem(k,raw[i]))}
function envelope(raw=readRaw()){return validate({format:FORMAT,version:1,exportedAt:new Date().toISOString(),sourceOrigin:location.origin,state:JSON.parse(raw[0]||'{}'),activities:JSON.parse(raw[1]||'[]')})}
function recover(){const j=localStorage.getItem(JOURNAL);if(!j)return;const raw=JSON.parse(j);if(!Array.isArray(raw)||raw.length!==2||raw.some(v=>v!==null&&typeof v!=='string'))throw Error('The interrupted import backup is invalid.');restore(raw);localStorage.removeItem(JOURNAL)}
let recoveryError;try{recover()}catch(e){recoveryError=e}
function apply(data){if(recoveryError)throw Error('An interrupted import could not be restored. Download your plan and check browser storage first.');validate(data);const raw=readRaw();localStorage.setItem(BACKUP,JSON.stringify(envelope(raw)));localStorage.setItem(JOURNAL,JSON.stringify(raw));try{localStorage.setItem(KEYS[0],JSON.stringify(data.state));localStorage.setItem(KEYS[1],JSON.stringify(data.activities));localStorage.removeItem(JOURNAL)}catch(e){try{restore(raw);localStorage.removeItem(JOURNAL)}catch{throw Error('Storage failed. Your original plan backup is retained; reload to restore it.')}throw Error('Import could not be saved. Your original plan has been restored.')}}
function download(data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='stuttgart-plan-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
const status=document.querySelector('#transferStatus'),previous=document.querySelector('#exportPrevious');let pending=null;
function message(s){status.textContent=s}
previous.hidden=!localStorage.getItem(BACKUP);
if(recoveryError)message('An interrupted import could not be restored. Do not import again until browser storage is available.');
document.querySelector('#exportPlan').onclick=()=>{try{download(envelope());message('Plan downloaded. Keep this private backup in Files.')}catch(e){message(e.message)}};
previous.onclick=()=>{try{download(parse(localStorage.getItem(BACKUP)));message('Previous plan downloaded.')}catch(e){message(e.message)}};
const input=document.querySelector('#importPlan'),dialog=document.querySelector('#importDialog');
input.onchange=async()=>{const file=input.files[0];input.value='';if(!file)return;pending=null;try{if(file.size>MAX)throw Error('Choose a backup smaller than 5 MB.');pending=parse(await file.text());document.querySelector('#importPreview').textContent=Object.keys(pending.state).length+' saved exhibitor entries and '+pending.activities.length+' personal activities. Review the source file before replacing your plan.';dialog.showModal()}catch(e){message(e.message)}};
function cancel(){pending=null;dialog.close();input.focus();message('Import canceled. Your plan is unchanged.')}
document.querySelector('#cancelImport').onclick=cancel;dialog.addEventListener('cancel',e=>{e.preventDefault();cancel()});
document.querySelector('#importForm').onsubmit=e=>{e.preventDefault();if(!pending)return;try{apply(pending);pending=null;dialog.close();location.reload()}catch(err){message(err.message);pending=null;dialog.close();previous.hidden=!localStorage.getItem(BACKUP)}};
window.StuttgartTransfer={parse,validate,apply,envelope,recover,keys:KEYS,backupKey:BACKUP,journalKey:JOURNAL};
})();
