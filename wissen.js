(()=>{'use strict';
const docs=window.AKTIEN_WISSEN||[];const $=id=>document.getElementById(id);
let mode='toc',selected=null,ready=false;
const favKey='aktien-cockpit-wissen-favoriten-v1';
let favorites=[];try{const a=JSON.parse(localStorage.getItem(favKey)||'[]');if(Array.isArray(a))favorites=a.filter(Number.isInteger)}catch{}
const norm=s=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function getItems(){const q=norm($('wissenSearch').value.trim());let arr=mode==='fav'?docs.filter(d=>favorites.includes(d.id)):docs;
if(q){const words=q.split(/\s+/);arr=docs.filter(d=>words.every(w=>norm(d.title+' '+d.chapter+' '+d.text).includes(w)));arr.sort((a,b)=>Number(norm(b.title).includes(q))-Number(norm(a.title).includes(q)));}
return arr}
function list(){const items=getItems(),query=$('wissenSearch').value.trim();$('wissenCount').textContent=`${items.length} von ${docs.length} Artikeln · ${favorites.length} Favoriten`;
const frag=document.createDocumentFragment();
if(mode==='toc'&&!query){const groups=new Map();items.forEach(d=>{const chapter=d.chapter||'Weitere Themen';if(!groups.has(chapter))groups.set(chapter,[]);groups.get(chapter).push(d)});
for(const [chapter,arr] of groups){const fold=document.createElement('details');fold.className='fold';const sum=document.createElement('summary');sum.textContent=`${chapter} (${arr.length})`;fold.appendChild(sum);const body=document.createElement('div');body.className='fold-body';arr.forEach(d=>{const b=document.createElement('button');b.textContent=(favorites.includes(d.id)?'★ ':'')+d.title;b.className=d.id===selected?'selected':'';b.onclick=()=>show(d.id);body.appendChild(b)});fold.appendChild(body);frag.appendChild(fold)}}
else items.forEach(d=>{const b=document.createElement('button');b.textContent=(favorites.includes(d.id)?'★ ':'')+d.title;b.className=d.id===selected?'selected':'';b.onclick=()=>show(d.id);frag.appendChild(b)});
$('wissenList').replaceChildren(frag)}
function show(id){const d=docs.find(x=>x.id===id);if(!d)return;selected=id;list();const a=$('wissenArticle');a.innerHTML='<h3>'+esc(d.title)+'</h3><p class="source">Aus deinem Aktienhandbuch · '+esc(d.chapter)+'</p><div class="buttons"><button id="wissenStar">'+(favorites.includes(id)?'★ Aus Favoriten entfernen':'☆ Zu Favoriten hinzufügen')+'</button><button id="wissenBack">Zum Inhaltsverzeichnis</button></div><div class="wissen-content">'+d.html+'</div><h4>Verwandte Themen</h4><div class="wissen-links" id="wissenLinks"></div>';
$('wissenStar').onclick=()=>{favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];try{localStorage.setItem(favKey,JSON.stringify(favorites))}catch{}show(id)};
$('wissenBack').onclick=()=>{mode='toc';$('wissenSearch').value='';list()};
const words=norm(d.title).split(/[^\p{L}\p{N}]+/u).filter(w=>w.length>=4);const links=docs.filter(x=>x.id!==id&& (x.chapter===d.chapter||words.some(w=>norm(x.title).includes(w)))).slice(0,10);
links.forEach(x=>{const b=document.createElement('button');b.textContent=x.title;b.onclick=()=>show(x.id);$('wissenLinks').appendChild(b)});
if(window.innerWidth<650)a.scrollIntoView({behavior:'smooth',block:'start'});
}
window.initWissen=()=>{if(!ready){ready=true;$('wissenSearch').addEventListener('input',list);[['wissenToc','toc'],['wissenFav','fav']].forEach(([id,m])=>$(id).onclick=()=>{mode=m;$('wissenSearch').value='';list()});}list();if(selected===null&&docs.length)show(docs[0].id)};
})();
