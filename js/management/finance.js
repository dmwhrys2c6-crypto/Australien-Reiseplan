(function(root) {
'use strict';
let mode='person';
const colors=['#247a80','#7485a8','#b28664','#809660','#a57f99','#6179aa','#9b9590'];
const divisor=()=>mode==='person'?4:1;
const amount=value=>(Number(value)||0)/divisor();
function toggle(){return `<div class="finance-mode glass-dock glass-card" role="group" aria-label="Kostenansicht">${[['person','Pro Person (1/4)'],['group','Gesamtkosten (4 Personen)']].map(([key,label])=>`<button type="button" class="glass-pill" data-finance-mode="${key}" aria-pressed="${mode===key}">${label}</button>`).join('')}</div>`;}
function donut(summary) {
 const U=root.ManagementUI,e=root.TripModel.escape;
 const total=summary.categories.reduce((sum,c)=>sum+c.amount,0);
 let offset=0;
 const segments=summary.categories.map((c,i)=>{
  const percent=total?c.amount/total*100:0;
  const svg=percent?`<circle cx="60" cy="60" r="45" pathLength="100" fill="none" stroke="${colors[i]}" stroke-width="15" stroke-dasharray="${percent} ${100-percent}" stroke-dashoffset="${-offset}" transform="rotate(-90 60 60)"/>`:'';
  offset+=percent;return svg;
 }).join('');
 return `<div class="finance-breakdown"><svg class="finance-donut" viewBox="0 0 120 120" role="img" aria-label="Ausgabenverteilung: ${e(U.money(amount(total),summary.currency))}. Beträge und Anteile stehen in der Legende."><circle cx="60" cy="60" r="45" fill="none" stroke="var(--glass-divider)" stroke-width="15"/>${segments}<text x="60" y="58" text-anchor="middle" class="finance-donut-value">${e(U.money(amount(total),summary.currency))}</text><text x="60" y="70" text-anchor="middle" class="finance-donut-caption">${mode==='person'?'pro Person':'4 Personen'}</text></svg><ul class="finance-legend">${summary.categories.map((c,i)=>`<li><span class="finance-color" style="--segment-color:${colors[i]}" aria-hidden="true"></span><span>${e(root.ManagementModel.CATEGORIES[c.category])}<small>${total?(c.amount/total*100).toLocaleString('de-AT',{maximumFractionDigits:1}):'0'} %</small></span><strong>${e(U.money(amount(c.amount),summary.currency))}</strong></li>`).join('')}</ul></div>${total?'':'<p>Noch keine bezahlten Ausgaben in dieser Währung.</p>'}`;
}
function render(repo,expenses) {
 const U=root.ManagementUI,e=root.TripModel.escape,s=repo.summary();
 const pct=s.totalBudget?Math.round(s.spent/s.totalBudget*100):0;
 return `<div class="manage-summary">${[['Gesamtbudget',s.totalBudget],['Ausgegeben',s.spent],['Verbleibend',s.remaining]].map(([label,value])=>`<div class="manage-summary-card glass-card"><span>${label}</span><strong>${e(U.money(amount(value),s.currency))}</strong><small>${mode==='person'?'pro Person':'für 4 Personen'}</small></div>`).join('')}</div><div class="manage-finance-grid"><section class="manage-budget glass-card"><div class="glass-section-heading"><h3>Dein Budget</h3>${U.action('Budget bearbeiten','budget')}</div><strong>${e(U.money(amount(s.spent),s.currency))} <span>/ ${e(U.money(amount(s.totalBudget),s.currency))}</span></strong><div class="glass-progress" role="progressbar" aria-label="Verwendetes Budget" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100,pct)}" aria-valuetext="${pct} Prozent verwendet"><span style="width:${Math.min(100,pct)}%"></span></div><p>${s.totalBudget?pct+' % verwendet':'Lege dein Reisebudget fest.'}${s.pending?' · '+e(U.money(amount(s.pending),s.currency))+' offen':''}</p><p>${mode==='person'?'Alle angezeigten Kosten sind durch vier geteilt.':'Alle angezeigten Kosten gelten für die gesamte Reisegruppe.'}</p>${s.excluded?`<p>${s.excluded} Ausgabe(n) in anderen Währungen separat gelistet. Keine automatische Umrechnung.</p>`:''}</section><section class="manage-categories glass-card"><h3>Wofür du Geld ausgibst</h3>${donut(s)}</section></div><div class="glass-section-heading"><h3>Deine Ausgaben</h3>${U.action('+ Ausgabe hinzufügen','create','expense','','trip-primary-button')}</div>`;
}
root.FinanceView={divisor,amount,toggle,render,setMode(value){if(!['person','group'].includes(value))return;mode=value;},getMode:()=>mode};
}(window));
