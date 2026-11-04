 'use strict';
const $=id=>document.getElementById(id), K='aktien-cockpit-4-1', CK='aktien-cockpit-capital-4-4';
const base=[['name','Aktienname','text','Unternehmen oder Aktie'],['price','Aktueller Kurs (€)','number','Aktueller Kurs in Euro'],['pe','KGV','number','Kurs-Gewinn-Verhältnis, auch negativ möglich'],['sma50','SMA 50 (€)','number','Einfacher Durchschnitt der letzten 50 Handelstage'],['sma200','SMA 200 (€)','number','Einfacher Durchschnitt der letzten 200 Handelstage'],['rsi','RSI (14)','number','Unter 30 häufig überverkauft, über 70 häufig überkauft']];
const growth=[['yearOld','Vorjahr','number','Vorletztes abgeschlossenes Geschäftsjahr'],['yearNew','Letztes Geschäftsjahr','number','Letztes abgeschlossenes Geschäftsjahr'],['salesOld','Umsatz Vorjahr (Mio. €)','number','Jahresumsatz'],['salesNew','Umsatz aktuell (Mio. €)','number','Jahresumsatz'],['profitOld','Nettoergebnis Vorjahr (Mio. €)','number','Verluste negativ eingeben'],['profitNew','Nettoergebnis aktuell (Mio. €)','number','Verluste negativ eingeben']];
const extra=[['ev','EV/EBITDA','number','Unternehmenswert geteilt durch EBITDA'],['margin','Operative Marge TTM (%)','number','Operative Marge'],['debtRatio','Verschuldung/Eigenkapital (%)','number','Schulden im Verhältnis zum Eigenkapital'],['fcf','Levered Free Cashflow (Mio. €)','number','Nach Schuldendienst verfügbarer Cashflow'],['fcfYear','FCF-Geschäftsjahr','number','Zugehöriges Geschäftsjahr'],['roe','ROE (%)','number','Eigenkapitalrendite'],['netDebt','Nettoverschuldung (Mio. €)','number','Negative Werte bedeuten Nettoliquidität'],['netDebtDate','Nettoverschuldung Stichtag','text','Datum'],['target','Ø Analysten-Kursziel (€)','number','Unverbindliches Kursziel'],['targetDate','Kursziel-Stand','text','Datum']];
const personal=[['quality','Geschäftsmodell','select','Subjektive Einschätzung'],['outlook','Zukunftsaussichten','select','Subjektive Einschätzung'],['risk','Anlagerisiko','select','Geringes, mittleres oder hohes Risiko']];
const trade=[['buyPrice','Einstiegskurs (€)','number','Wenn leer, gilt der aktuelle Kurs'],['budget','Budget (€)','number','Inklusive Kaufgebühr'],['shares','Stückzahl','number','Ganze Aktien, hat Vorrang vor Budget'],['buyFee','Kaufgebühr (€)','number','Standard 1 €'],['sellFee','Verkaufsgebühr (€)','number','Standard 1 €'],['taxRate','Steuer gesamt (%)','number','Typisch 26,375 % ohne Kirchensteuer'],['allowance','Verfügbarer Freibetrag (€)','number','Nur noch verfügbarer Betrag'],['customPct','Eigene Kursänderung (%)','number','Auch negative Prozentwerte']];
const stops=[['stopPct','Stop-Loss Abstand (%)','number','Abstand vom Einstieg'],['stopEuro','Stop-Loss Abstand (€ je Aktie)','number','Hat Vorrang vor Prozent'],['highest','Höchster Kurs (€)','number','Für Trailing-Stop'],['trailPct','Trailing-Abstand (%)','number','Vom bisherigen Höchstkurs'],['trailEuro','Trailing-Abstand (€ je Aktie)','number','Hat Vorrang vor Prozent'],['desiredNet','Nettogewinn absichern (€)','number','Gewünschter Gesamtgewinn nach Gebühren und geschätzten Steuern; negative Werte möglich']];
const all=[...base,...growth,...extra,...personal,...trade,...stops];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function parse(v){if(v==null||String(v).trim()==='')return null;let s=String(v).trim().replace(/\s/g,'');if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');const n=Number(s);return Number.isFinite(n)?n:null}
const fmt=(n,d=2)=>n==null||!Number.isFinite(n)?'–':n.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
const sign=(n,d=2)=>n==null?'–':(n>0?'+':'')+fmt(n,d);
const money=n=>fmt(n)+' €';
function fields(id,defs){$(id).innerHTML=defs.map(([key,label,type,tip])=>`<div class="field"><label for="${key}">${esc(label)} <button class="info" type="button" data-tip="${esc(tip)}" data-title="${esc(label)}">i</button></label>${type==='select'?`<select id="${key}">${key==='risk'?'<option value="">Nicht bewertet</option><option value="good">Geringes Risiko</option><option value="neutral">Mittleres Risiko</option><option value="bad">Hohes Risiko</option>':'<option value="">Nicht bewertet</option><option value="good">Gut</option><option value="neutral">Mittel</option><option value="bad">Schwach</option>'}</select>`:`<input id="${key}" type="${type==='number'?'text':'text'}" ${type==='number'?'inputmode="text"':''} autocomplete="off">${type==="number"?`<button type="button" class="minus-btn" data-minus-for="${key}" aria-label="Vorzeichen wechseln">±</button>`:""}`}</div>`).join('')}
for(const [id,defs] of [['baseFields',base],['growthFields',growth],['extraFields',extra],['personalFields',personal],['tradeFields',trade],['stopFields',stops]])fields(id,defs);
let entries=[],bookings=[],actualTotal=null,editId=null,bookEdit=null;
function get(){const d={};for(const [id,,type] of all)d[id]=type==='number'?parse($(id).value):$(id).value.trim();d.notes=$('notes').value;return d}
function set(d){for(const [id] of all)$(id).value=d[id]??'';$('notes').value=d.notes??'';render()}
function metric(k,v,cls=''){return `<div class="metric"><small>${esc(k)}</small><strong class="${cls}">${esc(v)}</strong></div>`}
function growthPct(a,b){if(a==null||b==null)return null;if(a<0&&b>=0)return 'Turnaround';if(a>=0&&b<0)return 'Verlustphase';if(a<=0||b<0)return 'Nicht vergleichbar';return (b-a)/Math.abs(a)*100}
function evaluate(d){let tech=[],fund=[],pers=[],reasons=[];
if(d.price>0&&d.sma50>0){const p=(d.price/d.sma50-1)*100;tech.push(p>=0?(p>12?.35:.8):p>=-5?.55:.2);reasons.push(`SMA 50: ${sign(d.price-d.sma50)} € (${sign(p)} %) Abstand`)}
if(d.price>0&&d.sma200>0){const p=(d.price/d.sma200-1)*100;tech.push(p>=0?.85:.25);reasons.push(`SMA 200: ${sign(d.price-d.sma200)} € (${sign(p)} %) Abstand`)}
if(d.rsi!=null&&d.rsi>=0&&d.rsi<=100){tech.push(d.rsi>75?.2:d.rsi>=65?.45:d.rsi>=40?.75:d.rsi>=30?.6:.35);reasons.push(`RSI ${fmt(d.rsi,1)}`)}
if(d.pe!=null)fund.push(d.pe<=0?.15:d.pe<8?.7:d.pe<20?.8:d.pe<35?.55:.25);
if(d.ev!=null)fund.push(d.ev<=0?.15:d.ev<6?.75:d.ev<12?.65:.35);
if(d.margin!=null)fund.push(d.margin<0?.15:d.margin<5?.4:d.margin<15?.7:.85);
if(d.debtRatio!=null)fund.push(d.debtRatio<0?.5:d.debtRatio<60?.8:d.debtRatio<150?.55:.3);
if(d.fcf!=null)fund.push(d.fcf>0?.7:d.fcf<0?.25:.5);
if(d.roe!=null)fund.push(d.roe<0?.15:d.roe<8?.45:d.roe<25?.8:.65);
if(d.netDebt!=null)fund.push(d.netDebt<0?.8:.5);
const sg=growthPct(d.salesOld,d.salesNew),pg=growthPct(d.profitOld,d.profitNew);
for(const g of [sg,pg])if(typeof g==='number')fund.push(g<0?.25:g<5?.55:g<20?.75:.85);
if(pg==='Turnaround')fund.push(.65);if(pg==='Verlustphase')fund.push(.1);
for(const k of ['quality','outlook','risk'])if(d[k])pers.push(({good:.85,neutral:.5,bad:.2})[d[k]]??.5);
const groups=[[tech,.45],[fund,.4],[pers,.15]].filter(([a])=>a.length);
const score=groups.length?Math.round(100*groups.reduce((s,[a,w])=>s+w*a.reduce((x,y)=>x+y,0)/a.length,0)/groups.reduce((s,[a,w])=>s+w,0)):null;
const covered=[...base.slice(1),...growth.slice(2),...extra.filter(x=>!['fcfYear','netDebtDate','targetDate'].includes(x[0]))].filter(([k])=>d[k]!=null&&d[k]!=='').length;
return {score,covered,reliability:covered>=10?'höher':covered>=6?'mittel':'gering',sg,pg,reasons}}
function calc(d){const buy=d.buyPrice>0?d.buyPrice:d.price>0?d.price:null,fb=Math.max(0,d.buyFee??1),fs=Math.max(0,d.sellFee??1);
const qty=d.shares!=null?Math.max(0,Math.floor(d.shares)):buy>0&&d.budget!=null?Math.max(0,Math.floor((d.budget-fb)/buy)):0;
const rate=Math.min(100,Math.max(0,d.taxRate??26.375))/100,allow=Math.max(0,d.allowance??0);
const invested=buy!=null?qty*buy+fb:null;
function netAt(price){if(!qty||buy==null)return null;const pre=qty*price-qty*buy-fb-fs;return pre-Math.max(0,pre-allow)*rate}
function targetForNet(wanted){if(!qty||buy==null)return null;const gross=wanted>=allow?allow+(wanted-allow)/(1-rate):wanted;return (qty*buy+fb+fs+gross)/qty}
return {buy,qty,fb,fs,rate,allow,invested,netAt,targetForNet}}
function renderCalc(){const d=get(),c=calc(d),goals=[5,10,15,18,20];if(d.customPct!=null&&!goals.includes(d.customPct))goals.push(d.customPct);goals.sort((a,b)=>a-b);
$('profitRows').innerHTML=goals.map(p=>{if(!c.buy||!c.qty)return `<tr><td>${sign(p,1)} %</td><td colspan="4">Einstieg und Budget oder Stückzahl eingeben</td></tr>`;
const target=c.buy*(1+p/100),gross=(target-c.buy)*c.qty,net=c.netAt(target);
return `<tr><td>${sign(p,1)} %</td><td>${money(target)}</td><td>${sign(target-c.buy,3)} €</td><td class="${gross<0?'bad':'good'}">${sign(gross)} €</td><td class="${net<0?'bad':'good'}">${sign(net)} €</td></tr>`}).join('');
$('tradeSummary').innerHTML=metric('Stückzahl',String(c.qty))+metric('Kaufkosten',money(c.invested))+metric('Budgetrest',d.budget!=null&&c.invested!=null?money(d.budget-c.invested):'–')+metric('Steuerannahme',fmt(c.rate*100,3)+' %');
let fixed=null,trail=null;
if(c.buy!=null){if(d.stopEuro!=null)fixed=c.buy-d.stopEuro;else if(d.stopPct!=null)fixed=c.buy*(1-d.stopPct/100);
const high=d.highest>0?d.highest:c.buy;if(d.trailEuro!=null)trail=high-d.trailEuro;else if(d.trailPct!=null)trail=high*(1-d.trailPct/100)}
const desired=d.desiredNet!=null?c.targetForNet(d.desiredNet):null;
$('stopSummary').innerHTML=metric('Fester Stopkurs',fixed==null?'–':money(fixed))+metric('Trailing-Stopkurs',trail==null?'–':money(trail))+metric('Stop für Nettogewinn',desired==null?'–':money(desired))+metric('Netto bei Trailing-Stop',trail==null?'–':money(c.netAt(trail)));
}
function render(){const d=get(),e=evaluate(d),m=[];
for(const [key,label] of [['sma50','Abstand SMA 50'],['sma200','Abstand SMA 200']])if(d.price!=null&&d[key]>0){const diff=d.price-d[key];m.push(metric(label,`${sign(diff)} € · ${sign(diff/d[key]*100)} %`,diff>=0?'good':'bad'))}
m.push(metric('RSI (14)',fmt(d.rsi,1),d.rsi>=70?'warn':''));
m.push(metric('Umsatzwachstum',typeof e.sg==='number'?sign(e.sg)+' %':e.sg||'–'));
m.push(metric('Gewinnentwicklung',typeof e.pg==='number'?sign(e.pg)+' %':e.pg||'–'));
if(d.price>0&&d.target!=null)m.push(metric('Kursziel-Potenzial',sign((d.target/d.price-1)*100)+' %'));
m.push(metric('Orientierungs-Score',e.score==null?'–':e.score+'/100'));
m.push(metric('Anlagerisiko',({good:'Gering',neutral:'Mittel',bad:'Hoch'})[d.risk]||'Nicht bewertet'));
$('metrics').innerHTML=m.join('');
$('coverage').textContent=`${e.covered} Kennzahlen vorhanden · Datensicherheit: ${e.reliability}. Ranking berücksichtigt nur vorhandene Werte.`;
let note=e.reasons.join(' · ')||'Für eine technische Einschätzung Kurs, SMA 50, SMA 200 und RSI ergänzen.';
if(d.price>0&&d.sma50>0&&d.price>d.sma50&&d.rsi>=65)note+=' · Dip: Rücksetzer Richtung SMA 50 beobachten.';
if(d.price>0&&d.sma50>0&&d.price<d.sma50)note+=' · Unter SMA 50: Stabilisierung abwarten.';
if(d.price>0&&d.sma200>0&&d.price<d.sma200)note+=' · Unter SMA 200: Langfristiger Trend möglicherweise schwach.';
$('interpret').textContent=note+' Keine Kaufempfehlung.';renderCalc()}
function saveState(){try{localStorage.setItem(K,JSON.stringify(entries));localStorage.setItem(CK,JSON.stringify({bookings,actualTotal}));return true}catch(e){alert('Speichern fehlgeschlagen. Bitte Speicherplatz und Browser-Einstellungen prüfen.');return false}}
function load(){try{const e=JSON.parse(localStorage.getItem(K)||'[]');entries=Array.isArray(e)?e:[]}catch{entries=[]}
try{const c=JSON.parse(localStorage.getItem(CK)||'{}');bookings=Array.isArray(c.bookings)?c.bookings:[];actualTotal=typeof c.actualTotal==='number'?c.actualTotal:null}catch{bookings=[];actualTotal=null}}
function reset(){editId=null;for(const [id] of all)$(id).value='';$('notes').value='';$('buyFee').value='1';$('sellFee').value='1';$('taxRate').value='26,375';$('saveBtn').textContent='In Watchlist speichern';$('saveStatus').textContent='';render()}
function tab(t){for(const id of ['analyze','watch','capital'])$(id).classList.toggle('hidden',id!==t);document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));if(t==='watch')renderWatch();if(t==='capital')renderCapital()}
function renderWatch(){$('count').textContent=entries.length;const sorted=entries.map(x=>({...x,e:evaluate(x.data)})).sort((a,b)=>(b.e.score??-1)-(a.e.score??-1));
$('watchItems').innerHTML=sorted.length?sorted.map((x,i)=>`<div class="item"><div><strong>${i+1}. ${esc(x.data.name||'Ohne Namen')}</strong><div class="muted">Score ${x.e.score??'–'}/100 · ${x.e.covered} Kennzahlen · Datensicherheit ${x.e.reliability}</div><div class="muted">Kurs ${x.data.price==null?'–':money(x.data.price)} · ${esc(x.updated||'')}</div></div><div class="buttons"><button data-edit="${esc(x.id)}">Bearbeiten</button><button class="danger" data-delete="${esc(x.id)}">Löschen</button></div></div>`).join(''):'<p class="muted">Noch keine Aktien gespeichert.</p>'}
function totals(){let deposits=0,withdrawals=0,profits=0,interest=0;for(const b of bookings){const v=b.amount;switch(b.type){case'deposit':deposits+=v;break;case'withdrawal':withdrawals+=v;break;case'profit':profits+=v;break;case'interest':interest+=v;break}}
return {deposits,withdrawals,profits,interest,total:deposits-withdrawals+profits+interest}}
function renderCapital(){const t=totals();$('capitalMetrics').innerHTML=metric('Einzahlungen',money(t.deposits))+metric('Auszahlungen',money(t.withdrawals))+metric('Gewinne / Verluste netto',sign(t.profits)+' €',t.profits<0?'bad':'good')+metric('Zinsen netto',sign(t.interest)+' €',t.interest<0?'bad':'good')+metric('Gesamtkapital rechnerisch',money(t.total))+metric('Ergebnis netto',sign(t.profits+t.interest)+' €',t.profits+t.interest<0?'bad':'good')+metric('Einfache Rendite',t.deposits-t.withdrawals>0?sign((t.profits+t.interest)/(t.deposits-t.withdrawals)*100)+' %':'–');
$('capitalExplain').textContent='Gesamtkapital = Einzahlungen − Auszahlungen + realisierte Nettoergebnisse + Nettozinsen. Keine zeitgewichtete Rendite. Bei Gewinn-/Verlustbuchungen nur den Gewinnanteil erfassen, nicht den gesamten Verkaufserlös.';
$('actualTotal').value=actualTotal??'';
$('actualMetrics').innerHTML=metric('Aktueller Gesamtwert',actualTotal==null?'–':money(actualTotal))+metric('Differenz zum rechnerischen Kapital',actualTotal==null?'–':sign(actualTotal-t.total)+' €',actualTotal!=null&&actualTotal-t.total<0?'bad':'good');
const names={deposit:'Einzahlung',withdrawal:'Auszahlung',profit:'Gewinn / Verlust netto',interest:'Zinsen netto'};
$('bookings').innerHTML=bookings.length?[...bookings].sort((a,b)=>b.date.localeCompare(a.date)).map(b=>`<div class="item"><div><strong>${esc(b.date)} · ${esc(names[b.type])}</strong><div class="${b.amount<0?'bad':'good'}">${sign(b.amount)} €</div><div class="muted">${esc(b.note||'')}</div></div><div class="buttons"><button data-book-edit="${esc(b.id)}">Bearbeiten</button><button class="danger" data-book-del="${esc(b.id)}">Löschen</button></div></div>`).join(''):'<p class="muted">Noch keine Buchungen.</p>'}
function bookReset(){bookEdit=null;$('bookingType').value='deposit';$('bookingAmount').value='';$('bookingDate').value=new Date().toLocaleDateString('en-CA');$('bookingNote').value='';$('bookingSave').textContent='Buchung speichern'}
function exportAll(){const data={format:'aktien-cockpit',version:'4.4',exportedAt:new Date().toISOString(),entries,capital:{bookings,actualTotal}};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='aktien_cockpit_4_4_backup.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
function validEntries(a){return Array.isArray(a)&&a.length<=10000&&a.every(x=>x&&typeof x.id==='string'&&x.id.length<200&&x.data&&typeof x.data==='object'&&!Array.isArray(x.data))}
function validCapital(c){return c&&Array.isArray(c.bookings)&&c.bookings.length<=50000&&c.bookings.every(b=>b&&typeof b.id==='string'&&['deposit','withdrawal','profit','interest'].includes(b.type)&&typeof b.amount==='number'&&Number.isFinite(b.amount)&&typeof b.date==='string')&&(c.actualTotal==null||typeof c.actualTotal==='number'&&Number.isFinite(c.actualTotal))}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const el=$(b.dataset.toggle);el.classList.toggle('hidden');b.textContent=el.classList.contains('hidden')?'Öffnen ▾':'Schließen ▴'});
document.addEventListener('click',e=>{const b=e.target.closest('[data-minus-for]');if(!b)return;const input=$(b.dataset.minusFor);if(!input)return;const value=input.value.trim();input.value=value.startsWith('-')?value.slice(1):'-'+value;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-tip]');if(b){$('helpTitle').textContent=b.dataset.title;$('helpText').textContent=b.dataset.tip;$('help').showModal()}});
$('analyze').addEventListener('input',render);$('analyze').addEventListener('change',render);
$('newBtn').onclick=()=>{reset();tab('analyze');scrollTo(0,0)};
$('clearBtn').onclick=reset;
$('saveBtn').onclick=()=>{const d=get();if(!d.name){alert('Bitte Aktiennamen eingeben.');return}const updated=new Date().toLocaleString('de-DE');
if(editId){const e=entries.find(x=>x.id===editId);if(e){e.data=d;e.updated=updated}}else{editId=crypto.randomUUID();entries.push({id:editId,data:d,updated})}
if(saveState()){$('saveBtn').textContent='Änderungen speichern';$('saveStatus').textContent='✓ Lokal gespeichert';renderWatch()}};
$('watchItems').onclick=e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');
if(edit){const x=entries.find(x=>x.id===edit.dataset.edit);if(!x)return;editId=x.id;set(x.data);$('saveBtn').textContent='Änderungen speichern';$('details').classList.remove('hidden');$('personal').classList.remove('hidden');tab('analyze');scrollTo(0,0)}
if(del){const x=entries.find(x=>x.id===del.dataset.delete);if(x&&confirm('Aktie wirklich löschen?')){entries=entries.filter(y=>y.id!==x.id);if(editId===x.id)reset();saveState();renderWatch()}}};
$('exportBtn').onclick=exportAll;$('capitalExport').onclick=exportAll;
$('importFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>20*1024*1024)throw Error('Datei zu groß');const data=JSON.parse(await file.text());
if(!validEntries(data.entries))throw Error('Ungültige Watchlist');if(data.capital&&!validCapital(data.capital))throw Error('Ungültige Kapitalbuchungen');
if(!confirm('Import ersetzt die vorhandene Watchlist'+(data.capital?' und Kapitalbuchungen':'')+'. Vorher Backup exportieren! Fortfahren?'))return;
const oldEntries=entries,oldBookings=bookings,oldActual=actualTotal;
entries=data.entries;if(data.capital){bookings=data.capital.bookings;actualTotal=data.capital.actualTotal??null}
if(!saveState()){entries=oldEntries;bookings=oldBookings;actualTotal=oldActual;throw Error('Lokales Speichern fehlgeschlagen')}
renderWatch();renderCapital();alert('Import erfolgreich. '+entries.length+' Aktien geladen.')}catch(err){alert('Import fehlgeschlagen: '+err.message)}finally{e.target.value=''}};
$('bookingSave').onclick=()=>{const amount=parse($('bookingAmount').value),date=$('bookingDate').value,type=$('bookingType').value;
if(amount==null||!date){alert('Bitte gültigen Betrag und Datum eingeben.');return}
const b={id:bookEdit||crypto.randomUUID(),date,type,amount,note:$('bookingNote').value.trim()};
if(bookEdit){const i=bookings.findIndex(x=>x.id===bookEdit);if(i>=0)bookings[i]=b;else bookings.push(b)}else bookings.push(b);
if(saveState()){bookReset();renderCapital()}};
$('bookingReset').onclick=bookReset;
$('bookings').onclick=e=>{const ed=e.target.closest('[data-book-edit]'),del=e.target.closest('[data-book-del]');
if(ed){const b=bookings.find(x=>x.id===ed.dataset.bookEdit);if(!b)return;bookEdit=b.id;$('bookingType').value=b.type;$('bookingAmount').value=String(b.amount).replace('.',',');$('bookingDate').value=b.date;$('bookingNote').value=b.note||'';$('bookingSave').textContent='Änderungen speichern';$('bookingAmount').focus()}
if(del){const b=bookings.find(x=>x.id===del.dataset.bookDel);if(b&&confirm('Buchung wirklich löschen?')){bookings=bookings.filter(x=>x.id!==b.id);saveState();renderCapital()}}};
$('actualSave').onclick=()=>{const v=parse($('actualTotal').value);if($('actualTotal').value.trim()&&v==null){alert('Ungültiger Kontowert');return}actualTotal=v;if(saveState())renderCapital()};
load();reset();bookReset();renderWatch();renderCapital();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
