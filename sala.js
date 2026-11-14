(() => {
'use strict';
const $=id=>document.getElementById(id), money=new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'});
const tables=[{id:1,seats:2},{id:2,seats:4},{id:3,seats:2},{id:4,seats:4},{id:5,seats:6},{id:6,seats:8}];
let selected='r2',view=location.hash==='#ordini'?'ordini':'sala',timer;
function read(key){try{return JSON.parse(sessionStorage.getItem(key)||'null')}catch{return null}}
function initial(){return {bookings:[{id:'r1',name:'Cliente demo A',time:'19:00',guests:2,table:1,status:'arrived'},{id:'r2',name:'Cliente demo B',time:'19:30',guests:4,table:null,status:'pending'},{id:'r3',name:'Cliente demo C',time:'20:00',guests:2,table:3,status:'booked'},{id:'r4',name:'Cliente demo D',time:'20:00',guests:4,table:null,status:'pending'}],orders:[{id:'o1',name:'Asporto demo A',time:'19:30',items:2,total:26,status:'new'},{id:'o2',name:'Asporto demo B',time:'19:45',items:3,total:34,status:'preparing'},{id:'o3',name:'Asporto demo C',time:'20:00',items:2,total:21,status:'ready'}],lastBooking:null,lastOrder:null}}
let state=read('chef-dashboard-demo')||initial();
let booking=read('chef-booking-demo');const order=read('chef-order-demo');
if(booking && JSON.stringify(booking)!==state.lastBooking){state.bookings=state.bookings.filter(b=>b.id!=='from-site');state.bookings.push({id:'from-site',name:'Dal sito · Cliente demo',time:booking.time,guests:booking.guests,table:null,status:'pending'});state.lastBooking=JSON.stringify(booking);selected='from-site'}
if(order && JSON.stringify(order)!==state.lastOrder){state.orders=state.orders.filter(o=>o.id!=='from-site');state.orders.push({id:'from-site',name:'Dal sito · Asporto demo',time:order.time,items:order.items,total:order.total,status:'new'});state.lastOrder=JSON.stringify(order)}
function save(){try{sessionStorage.setItem('chef-dashboard-demo',JSON.stringify(state))}catch{}}
function node(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n}
function notify(text){$('dashboard-toast').textContent=text;$('dashboard-toast').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('dashboard-toast').hidden=true,3000)}
function current(){return state.bookings.find(b=>b.id===selected)}
function owner(table){return state.bookings.find(b=>b.table===table&&b.status!=='completed')}
function render(){
 save();
 const active=state.bookings.filter(b=>b.status!=='completed');
 $('stat-bookings').textContent=active.length;$('stat-guests').textContent=active.reduce((sum,b)=>sum+b.guests,0);$('stat-pending').textContent=active.filter(b=>!b.table).length;
 $('stat-occupied').replaceChildren(document.createTextNode(active.filter(b=>b.status==='arrived').length),node('em','', '/6'));
 $('demo-day').textContent=booking?.day?'Turno di prova · '+new Date(booking.day+'T12:00:00').toLocaleDateString('it-IT',{day:'numeric',month:'long'}):'Turno di esempio · cena';
 const labels={pending:'Da assegnare',booked:'Prenotato',arrived:'Arrivato',completed:'Concluso'};
 const rows=[...state.bookings].sort((a,b)=>a.time.localeCompare(b.time)).map(b=>{
  const row=node('button','booking-row'+(b.id===selected?' active':''));row.type='button';row.dataset.booking=b.id;row.setAttribute('aria-pressed',String(b.id===selected));
  const info=node('span');info.append(node('strong','',b.name),node('small','',`${b.guests} persone${b.table?' · Tavolo '+String(b.table).padStart(2,'0'):''}`));
  row.append(node('span','time',b.time),info,node('span','status '+b.status,labels[b.status]));return row;
 });$('booking-list').replaceChildren(...rows);
 const chosen=current();
 $('floor').replaceChildren(...tables.map(t=>{
  const occupancy=owner(t.id),button=node('button','table'+(occupancy?' '+occupancy.status:'')+(chosen?.table===t.id?' selected-table':''));button.type='button';button.dataset.table=String(t.id);
  const incompatible=chosen && t.seats<chosen.guests;
  button.disabled=!chosen||chosen.status==='arrived'||chosen.status==='completed'||incompatible||Boolean(occupancy&&occupancy.id!==chosen.id);
  const stateLabel=occupancy?(occupancy.status==='arrived'?'occupato':'prenotato'):'libero';button.setAttribute('aria-label',`Tavolo ${t.id}, ${t.seats} posti, ${stateLabel}${incompatible?', troppo piccolo per questa prenotazione':''}`);
  button.append(node('b','',String(t.id).padStart(2,'0')),node('span','',t.seats+' posti'));return button;
 }));
 if(chosen){$('selection-title').textContent=chosen.name;$('selection-detail').textContent=`${chosen.time} · ${chosen.guests} persone · ${chosen.status==='completed'?'Servizio concluso':chosen.table?'Tavolo '+String(chosen.table).padStart(2,'0'):'Scegli un tavolo libero nella sala'}`}
 $('arrive').hidden=chosen?.status==='arrived'||chosen?.status==='completed';$('arrive').disabled=!chosen?.table;
 $('unassign').hidden=chosen?.status==='arrived'||chosen?.status==='completed';$('unassign').disabled=!chosen?.table;
 $('complete').hidden=chosen?.status!=='arrived';
 renderOrders();renderView();
}
function renderView(){document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view))});$('view-sala').hidden=view!=='sala';$('view-ordini').hidden=view!=='ordini';$('page-title').textContent=view==='sala'?'Prenotazioni e tavoli':'Ordini da asporto';document.querySelector('.demo-guidance').hidden=view!=='sala'}
function renderOrders(){
 $('sidebar-orders').textContent=state.orders.filter(o=>o.status!=='collected').length;
 const columns=[['new','Da preparare','Inizia preparazione'],['preparing','In preparazione','Segna pronto'],['ready','Pronti al ritiro','Segna ritirato']];
 $('order-board').replaceChildren(...columns.map(([status,title,action])=>{
 const col=node('section','order-column'),list=state.orders.filter(o=>o.status===status),heading=node('h2','',title);heading.append(node('span','',list.length));col.append(heading);
 list.forEach(o=>{const card=node('article','order-card');card.append(node('small','','RITIRO'),node('div','order-time',o.time),node('h3','',o.name),node('p','',`${o.items} prodotti · ${money.format(o.total)} di prova`));const button=node('button','primary',action+' →');button.type='button';button.dataset.order=o.id;card.append(button);col.append(card)});
 if(!list.length)col.append(node('p','order-empty','Nessun ordine in questa fase'));return col;
 }));
}
document.addEventListener('click',e=>{
 const target=e.target instanceof Element?e.target:null;if(!target)return;
 const bookingButton=target.closest('[data-booking]');if(bookingButton){selected=bookingButton.dataset.booking;render();return}
 const tableButton=target.closest('[data-table]');if(tableButton&&!tableButton.disabled){const b=current(),id=Number(tableButton.dataset.table);if(!b)return;b.table=id;b.status='booked';render();notify('Tavolo '+String(id).padStart(2,'0')+' assegnato alla prenotazione di prova');return}
 const nav=target.closest('[data-view]');if(nav){view=nav.dataset.view;history.replaceState(null,'',view==='ordini'?'#ordini':'#sala');renderView();return}
 const ob=target.closest('[data-order]');if(ob){const o=state.orders.find(o=>o.id===ob.dataset.order);if(!o)return;const next={new:'preparing',preparing:'ready',ready:'collected'};o.status=next[o.status];render();notify(o.status==='collected'?'Ritiro registrato nella demo':o.status==='ready'?'Ordine di prova pronto al ritiro':'Preparazione avviata nella demo');return}
});
$('arrive').addEventListener('click',()=>{const b=current();if(!b?.table||b.status==='completed')return;b.status='arrived';render();notify('Arrivo registrato. Il tavolo è ora occupato nella demo.')});
$('complete').addEventListener('click',()=>{const b=current();if(!b||b.status!=='arrived')return;b.status='completed';b.table=null;render();notify('Servizio concluso. Il tavolo torna libero.')});
$('unassign').addEventListener('click',()=>{const b=current();if(!b||b.status==='arrived'||b.status==='completed')return;b.table=null;b.status='pending';render();notify('Puoi assegnare un altro tavolo.')});
$('add-booking').addEventListener('click',()=>{const n=state.bookings.length+1;if(n>12){notify('Per continuare puoi ricominciare la prova.');return}const id='demo-'+Date.now();state.bookings.push({id,name:'Nuovo cliente demo',time:'20:30',guests:2,table:null,status:'pending'});selected=id;render();document.querySelector('[data-booking="'+id+'"]').scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});notify('Nuova prenotazione di prova: scegli un tavolo.')});
$('reset-dashboard').addEventListener('click',()=>{state=initial();booking=null;selected='r2';try{sessionStorage.removeItem('chef-booking-demo');sessionStorage.removeItem('chef-order-demo')}catch{}render();notify('La dashboard è tornata ai dati di esempio.')});
render();
})();
