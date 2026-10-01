(function(root) {
'use strict';
const form=document.getElementById('memory-upload-form');if(!form)return;
const input=document.getElementById('memory-files'),drop=document.getElementById('memory-drop'),status=document.getElementById('memory-status'),grid=document.getElementById('memory-grid'),button=document.getElementById('memory-save');
let repo,selection=[],entries=[],busy=false,objectUrls=[];
const escape=value=>root.TripModel.escape(String(value??''));
function message(text,error=false){status.textContent=text;status.classList.toggle('has-error',error);}
function render(){objectUrls.forEach(url=>URL.revokeObjectURL(url));objectUrls=[];grid.innerHTML=entries.length?entries.map(entry=>{
 let url=entry.url||'';if(entry.blob){url=URL.createObjectURL(entry.blob);objectUrls.push(url);}
 const safe=/^(https?:|blob:)/.test(url);
 return `<article class="memory-card glass-card">${safe?`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="Foto öffnen: ${escape(entry.location||'Tag '+entry.day)}"><img src="${escape(url)}" alt="${escape(entry.location||entry.name||'Reiseerinnerung')}" loading="lazy"></a>`:'<div class="memory-placeholder" aria-label="Übernommener Tagebucheintrag"><i class="fa-solid fa-book-open" aria-hidden="true"></i></div>'}<div class="memory-copy"><span class="glass-pill">Tag ${escape(entry.day)}</span>${entry.location?`<h3>${escape(entry.location)}</h3>`:''}<p>${escape(entry.note)}</p>${(entry.legacyUrls||[]).slice(1).map((link,i)=>`<a href="${escape(link)}" target="_blank" rel="noopener noreferrer" class="glass-pill">Weiteres Foto ${i+2}</a>`).join('')}</div></article>`;
 }).join(''):'<p class="glass-empty">Noch keine Fotos. Halte euren ersten Reisemoment fest.</p>';
}
function select(files){if(busy)return;selection=[];const next=Array.from(files);if(next.length>10){message('Bitte höchstens 10 Fotos auf einmal auswählen.',true);return;}if(next.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>20*1024*1024)){message('Bitte JPG, PNG oder WebP bis 20 MB pro Foto auswählen.',true);return;}selection=next;message(next.length?next.length+' Foto(s) ausgewählt.':'Noch kein Foto ausgewählt.');}
async function compress(file){
 const url=URL.createObjectURL(file);
 try{const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Das Foto „'+file.name+'“ kann nicht gelesen werden.'));img.src=url;});
 const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const context=canvas.getContext('2d');if(!context)throw new Error('Die Bildverarbeitung ist nicht verfügbar.');context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.85));if(!blob)throw new Error('Das Foto konnte nicht verarbeitet werden.');return {blob,name:file.name};
 }finally{URL.revokeObjectURL(url);}
}
input.addEventListener('change',()=>select(input.files));
for(const name of ['dragenter','dragover'])drop.addEventListener(name,event=>{event.preventDefault();drop.classList.add('is-dragging');});
drop.addEventListener('dragleave',()=>drop.classList.remove('is-dragging'));
drop.addEventListener('drop',event=>{event.preventDefault();drop.classList.remove('is-dragging');select(event.dataTransfer?.files||[]);});
form.addEventListener('submit',async event=>{event.preventDefault();if(busy||!repo)return;busy=true;form.setAttribute('aria-busy','true');form.querySelectorAll('input,select,textarea,button').forEach(el=>el.disabled=true);message('Fotos werden verarbeitet und gespeichert …');try{
 const data=root.JournalRepository.validate({day:document.getElementById('memory-day').value,location:document.getElementById('memory-location').value,note:document.getElementById('memory-note').value});
 const photos=[];for(const file of selection)photos.push(await compress(file));
 const added=await repo.add(data,photos);entries=[...added,...entries];render();form.reset();selection=[];message(added.length+' Foto(s) gespeichert.');
 }catch(error){message(error.name==='QuotaExceededError'?'Der lokale Fotospeicher ist voll. Deine Auswahl bleibt erhalten.':error.message,true);}finally{busy=false;form.removeAttribute('aria-busy');form.querySelectorAll('input,select,textarea,button').forEach(el=>el.disabled=false);button.disabled=!repo;}
});
root.JournalUpload={render,selectDay(day){const value=Math.min(20,Math.max(0,Number(day)||0));document.getElementById('memory-day').value=String(value);},searchIndex(){return entries.map(entry=>({id:entry.id,cat:'journal',catLabel:'Erinnerung',title:entry.location||'Tag '+entry.day,subtitle:entry.note,keywords:entry.note,icon:'fa-image',action:()=>{root.showView('erlebnisse');root.switchExpTab('journal');document.getElementById('memory-grid').scrollIntoView({block:'start'});}}));}};
function initialize(){button.disabled=true;return root.JournalRepository.open().then(async repository=>{repo=repository;entries=await repo.list();render();button.disabled=false;message('Fotos werden auf diesem Gerät gespeichert.');root.buildGlobalSearchIndex?.();}).catch(error=>message(error.message,true));}
initialize();
root.addEventListener('pagehide',()=>{objectUrls.forEach(url=>URL.revokeObjectURL(url));repo?.close();});
root.addEventListener('pageshow',event=>{if(event.persisted)initialize();});
}(window));
