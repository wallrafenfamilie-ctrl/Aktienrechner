(()=>{'use strict';
const docs=window.AKTIEN_WISSEN||[];const $=id=>document.getElementById(id);
const readingKey='aktien-cockpit-wissen-leseposition-v1';
let remembered=null;try{remembered=JSON.parse(localStorage.getItem(readingKey)||'null')}catch{}
let mode='toc',selected=Number.isInteger(remembered?.id)?remembered.id:null,ready=false;
let openChapter=typeof remembered?.chapter==='string'?remembered.chapter:null;
let openLetter=typeof remembered?.letter==='string'?remembered.letter:null;
function remember(){try{localStorage.setItem(readingKey,JSON.stringify({id:selected,chapter:openChapter,letter:openLetter}))}catch{}}
function setOpen(chapter,lexLetter){openChapter=chapter;openLetter=lexLetter||null;remember()}

const LEX='Wörterbuch & Kennzahlen-Lexikon';
const isLex=d=>String(d.chapter||'').startsWith(LEX);
const letter=d=>{const m=String(d.chapter||'').match(/·\s*([A-Z])\s*$/);return m?m[1]:(String(d.title||'').charAt(0).toUpperCase())};
const favKey='aktien-cockpit-wissen-favoriten-v2';
let favorites=[];try{const a=JSON.parse(localStorage.getItem(favKey)||'[]');if(Array.isArray(a))favorites=a.filter(Number.isInteger)}catch{}
const norm=s=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function getItems(){const q=norm($('wissenSearch').value.trim());let arr=mode==='fav'?docs.filter(d=>favorites.includes(d.id)):docs;
if(q){const words=q.split(/\s+/);arr=docs.filter(d=>words.every(w=>norm(d.title+' '+d.chapter+' '+d.text).includes(w)));arr.sort((a,b)=>Number(norm(b.title).includes(q))-Number(norm(a.title).includes(q)));}
return arr}
function closeOtherGroups(active){document.querySelectorAll('#wissenList > details.fold').forEach(el=>{if(el!==active)el.open=false})}
function list(){const items=getItems(),query=$('wissenSearch').value.trim();$('wissenCount').textContent=`${items.length} von ${docs.length} Artikeln · ${favorites.length} Favoriten`;
const frag=document.createDocumentFragment();
if(mode==='toc'&&!query){const groups=new Map();items.forEach(d=>{const chapter=d.chapter||'Weitere Themen';if(!groups.has(chapter))groups.set(chapter,[]);groups.get(chapter).push(d)});
const addButton=(body,d)=>{const b=document.createElement('button');b.textContent=(favorites.includes(d.id)?'★ ':'')+d.title;b.className=d.id===selected?'selected':'';b.onclick=()=>show(d.id);body.appendChild(b)};
let lexDone=false;
for(const [chapter,arr] of groups){
if(chapter.startsWith(LEX)){
 if(lexDone)continue;lexDone=true;
 const all=items.filter(isLex);const outer=document.createElement('details');outer.className='fold';outer.open=openChapter===LEX;outer.addEventListener('toggle',()=>{if(outer.open&&openChapter!==LEX){setOpen(LEX,openLetter);closeOtherGroups(outer)}else if(!outer.open&&openChapter===LEX){setOpen(null,null)}});
 const header=document.createElement('summary');header.textContent=`${LEX} (${all.length})`;outer.appendChild(header);
 const letters=document.createElement('div');letters.className='fold-body lex-letters';
 const byLetter=new Map();all.forEach(d=>{const k=letter(d);if(!byLetter.has(k))byLetter.set(k,[]);byLetter.get(k).push(d)});
 for(const [k,docsInLetter] of [...byLetter].sort((a,b)=>a[0].localeCompare(b[0],'de'))){const fold=document.createElement('details');fold.className='fold lex-letter';fold.open=openChapter===LEX&&openLetter===k;fold.addEventListener('toggle',()=>{if(fold.open&&openLetter!==k){setOpen(LEX,k);outer.open=true;closeOtherGroups(outer);letters.querySelectorAll('details.lex-letter').forEach(el=>{if(el!==fold)el.open=false})}else if(!fold.open&&openLetter===k){openLetter=null;remember()}});const sum=document.createElement('summary');sum.textContent=`${k} (${docsInLetter.length})`;fold.appendChild(sum);const body=document.createElement('div');body.className='fold-body';docsInLetter.sort((a,b)=>a.title.localeCompare(b.title,'de')).forEach(d=>addButton(body,d));fold.appendChild(body);letters.appendChild(fold)}
 outer.appendChild(letters);frag.appendChild(outer);continue;
}
const fold=document.createElement('details');fold.className='fold';fold.open=openChapter===chapter;fold.addEventListener('toggle',()=>{if(fold.open&&openChapter!==chapter){setOpen(chapter,null);closeOtherGroups(fold)}else if(!fold.open&&openChapter===chapter){setOpen(null,null)}});const sum=document.createElement('summary');sum.textContent=`${chapter} (${arr.length})`;fold.appendChild(sum);const body=document.createElement('div');body.className='fold-body';arr.forEach(d=>addButton(body,d));fold.appendChild(body);frag.appendChild(fold)}}
else items.forEach(d=>{const b=document.createElement('button');b.textContent=(favorites.includes(d.id)?'★ ':'')+d.title;b.className=d.id===selected?'selected':'';b.onclick=()=>show(d.id);frag.appendChild(b)});
$('wissenList').replaceChildren(frag)}
function show(id){const d=docs.find(x=>x.id===id);if(!d)return;selected=id;setOpen(isLex(d)?LEX:(d.chapter||'Weitere Themen'),isLex(d)?letter(d):null);list();const a=$('wissenArticle');a.innerHTML='<h3>'+esc(d.title)+'</h3><p class="source">Aus deinem Aktienhandbuch · '+esc(d.chapter)+'</p><div class="buttons"><button id="wissenStar">'+(favorites.includes(id)?'★ Aus Favoriten entfernen':'☆ Zu Favoriten hinzufügen')+'</button><button id="wissenBack">Zum Inhaltsverzeichnis</button></div><div class="buttons wissen-pager"><button id="wissenPrev">← Zurück</button><span id="wissenProgress"></span><button id="wissenNext">Weiter →</button></div><div class="wissen-content">'+d.html+'</div><h4>Verwandte Themen</h4><div class="wissen-links" id="wissenLinks"></div>';
const order=docs;const idx=order.findIndex(x=>x.id===id);
const prev=$('wissenPrev'),next=$('wissenNext');
prev.disabled=idx<=0;next.disabled=idx<0||idx>=order.length-1;
$('wissenProgress').textContent=`${idx+1} / ${order.length}`;
prev.onclick=()=>{if(idx>0)show(order[idx-1].id)};
next.onclick=()=>{if(idx<order.length-1)show(order[idx+1].id)};
$('wissenStar').onclick=()=>{favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];try{localStorage.setItem(favKey,JSON.stringify(favorites))}catch{}show(id)};
$('wissenBack').onclick=()=>{mode='toc';$('wissenSearch').value='';list()};
// Tap a handbook image to view it at full size, including the candlestick chart.
a.querySelectorAll('.wissen-content img').forEach(img=>{img.setAttribute('title','Antippen zum Vergrößern');img.setAttribute('tabindex','0');img.setAttribute('role','button');img.classList.add('wissen-zoomable');const zoom=()=>{const dlg=document.createElement('dialog');dlg.className='wissen-image-dialog';const close=document.createElement('button');close.type='button';close.textContent='✕ Schließen';close.onclick=()=>dlg.close();const pic=document.createElement('img');pic.src=img.src;pic.alt=img.alt||d.title;dlg.append(close,pic);document.body.appendChild(dlg);dlg.addEventListener('close',()=>dlg.remove());dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});dlg.showModal()};img.addEventListener('click',zoom);img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();zoom()}})});
const words=norm(d.title).split(/[^\p{L}\p{N}]+/u).filter(w=>w.length>=4);const links=docs.filter(x=>x.id!==id&& (x.chapter===d.chapter||words.some(w=>norm(x.title).includes(w)))).slice(0,10);
links.forEach(x=>{const b=document.createElement('button');b.textContent=x.title;b.onclick=()=>show(x.id);$('wissenLinks').appendChild(b)});
if(window.innerWidth<650)a.scrollIntoView({behavior:'smooth',block:'start'});
}
window.initWissen=()=>{if(!ready){ready=true;$('wissenSearch').addEventListener('input',list);[['wissenToc','toc'],['wissenFav','fav']].forEach(([id,m])=>$(id).onclick=()=>{mode=m;$('wissenSearch').value='';list()});}if(!document.querySelector('#wissenList > *'))list();if(docs.length&&!document.querySelector('#wissenArticle .wissen-content'))show(docs.some(d=>d.id===selected)?selected:docs[0].id)};
})();
