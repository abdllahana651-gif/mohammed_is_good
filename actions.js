// actions.js — أزرار الإجراءات + التأكيد + تذكيرات المتابعة + عداد الإشعارات (يُحمَّل بعد projects.js)
document.head.insertAdjacentHTML('beforeend','<style>.ab{width:34px;height:34px;border:0;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;margin:0 3px}.ab:hover{filter:brightness(.95)}.ab.b{background:#dbeafe;color:#1e3a8a}.ab.r{background:#fee2e2;color:#991b1b}.ab.y{background:#fef9c3;color:#854d0e}.ab.g{background:#dcfce7;color:#166534}.ab.v{background:#ede9fe;color:#5b21b6}.ab.o{background:#ffedd5;color:#9a3412}.cd{width:46px;height:46px;border:2px solid transparent;border-radius:10px;background:#fff;font-size:16px;cursor:pointer}.cd:disabled{color:#cbd5e1;background:#f8fafc;cursor:default}.cd.t{border-color:#93c5fd}.cd.y{background:#facc15;color:#713f12;font-weight:700}.cd.s{box-shadow:0 0 0 3px #2563eb}</style>');
const S=p=>`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const IC={
 wa:S('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
 del:S('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>'),
 rem:S('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>'),
 tr:S('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'),
 ed:S('<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>'),
 pj:S('<path d="M2 21V10l6 4v-4l6 4V5h8v16H2z"/><path d="M6 18h2M11 18h2M16 18h2"/>')};

// ---- جدول العملاء: عمود الإجراءات ----
{const th=$('tb').closest('table').querySelectorAll('th');th[6].remove();th[5].textContent='الإجراءات'}
const _draw=draw;
draw=function(){_draw();Cact()};
$('q').oninput=()=>draw();
function Cact(){
 document.querySelectorAll('#tb tr').forEach(tr=>{
  const t=tr.querySelectorAll('td');
  if(t.length===1){t[0].colSpan=6;return}
  const m=t[6]&&t[6].innerHTML.match(/mnu\(event,'([^']+)'/);if(!m)return;const id=m[1];
  t[6].remove();t[0].style.cursor='pointer';t[0].title='عرض';t[0].onclick=()=>view(id);
  const B=(k,c,tt)=>`<button class="ab ${c}" title="${tt}" onclick="Ca('${k}','${id}')">${IC[k]}</button>`;
  t[5].innerHTML=B('wa','b','تواصل')+B('del','r','حذف')+B('rem','y','تذكير متابعة')+B('tr','g','نقل العميل')+B('ed','v','تعديل')+B('pj','o','مشاريع العميل');
 });
}
function Cf(fn){
 const d=document.createElement('div');d.className='md';d.style.zIndex=40;d.style.alignItems='center';
 d.innerHTML='<div style="width:380px;text-align:center"><h3 style="margin:0 0 18px">هل أنت متأكد من الرغبة في إجراء هذا؟</h3><button class="btn p" style="margin:0 6px">موافقة</button><button class="btn d" style="margin:0 6px">رفض</button></div>';
 const [y,n]=d.querySelectorAll('button');y.onclick=()=>{d.remove();fn()};n.onclick=()=>d.remove();
 document.body.appendChild(d);
}
function Ca(k,id){Cf(()=>{const c=rows.find(x=>x.id===id);
 if(k==='wa')wa(c.phone);else if(k==='del')delNow(id);else if(k==='rem')Rem(id);else if(k==='tr')Ptr(id);
 else if(k==='ed')(window.openform||window.openForm)(id);else Pcl(id)})}
async function delNow(id){const {error}=await sb.from('clients').delete().eq('id',id);if(error)return alert(error.message);load()}

// ---- تذكيرات المتابعة ----
const p2=n=>String(n).padStart(2,'0'),AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const dk=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const MN=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
let RS={};
const Rmsg=(t,bad)=>{const x=$('rMsg');if(x){x.textContent=t;x.style.color=bad?'#dc2626':'#16a34a'}};
async function Rfetch(){
 const {data}=await sb.from('reminders').select('*').eq('client_id',RS.cid).eq('user_id',me.id).eq('done',false);
 RS.map={};(data||[]).forEach(r=>{const d=new Date(r.remind_at);RS.map[dk(d)]={id:r.id,h:d.getHours(),mi:d.getMinutes()}});
}
async function Rem(cid){const n=new Date();RS={cid,y:n.getFullYear(),m:n.getMonth(),sel:'',map:{},h:9,mi:0,ap:'ص'};await Rfetch();Rdraw()}
function Rset(){RS.h=+$('rH').value;RS.mi=+$('rM').value;RS.ap=$('rA').value}
function Rdraw(){
 const {y,m}=RS,td=dk(new Date()),f=new Date(y,m,1).getDay(),dn=new Date(y,m+1,0).getDate();let g='';
 for(let i=0;i<f;i++)g+='<span></span>';
 for(let d=1;d<=dn;d++){const k=y+'-'+p2(m+1)+'-'+p2(d);
  g+=`<button class="cd${k===td?' t':''}${RS.map[k]?' y':''}${k===RS.sel?' s':''}" ${k<td?'disabled':''} onclick="Rpick('${k}')">${AR(d)}</button>`}
 const c=rows.find(x=>x.id===RS.cid)||{name:''},cy=new Date().getFullYear();
 const sel=(id,a,v)=>`<select id="${id}" onchange="Rset()">${a.map(x=>`<option value="${x[0]}" ${x[0]==v?'selected':''}>${x[1]}</option>`).join('')}</select>`;
 const H=[...Array(12)].map((_,i)=>[i+1,AR(i+1)]),M=[...Array(60)].map((_,i)=>[i,AR(p2(i))]);
 show(`<h3>🔔 تذكير متابعة: ${e(c.name)}</h3><div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
 <div style="min-width:130px"><label>الساعة</label>${sel('rH',H,RS.h)}<label>الدقائق</label>${sel('rM',M,RS.mi)}<label>ص / م</label>${sel('rA',[['ص','ص'],['م','م']],RS.ap)}</div>
 <div style="flex:1;min-width:340px"><div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
  <select id="rMo" onchange="Rnav()">${MN.map((x,i)=>`<option value="${i}" ${i==m?'selected':''}>${x}</option>`).join('')}</select>
  <select id="rYe" onchange="Rnav()">${[0,1,2,3].map(i=>cy+i).map(x=>`<option value="${x}" ${x==y?'selected':''}>${AR(x)}</option>`).join('')}</select>
  <button class="btn" onclick="Rmv(-1)">↑</button><button class="btn" onclick="Rmv(1)">↓</button></div>
 <div style="display:grid;grid-template-columns:repeat(7,46px);gap:4px;justify-content:center;text-align:center">${'ح ن ث ر خ ج س'.split(' ').map(x=>`<b style="color:#64748b">${x}</b>`).join('')}${g}</div>
 <div style="display:flex;justify-content:space-between;margin-top:10px"><button class="lnk" onclick="Rtoday()">اليوم</button><button class="lnk" onclick="Rclear()">محو</button></div></div></div>
 <p id="rMsg" style="min-height:22px"></p><div><button class="btn p" onclick="Rsave()">حفظ</button> <button class="btn" onclick="closeM()">إغلاق</button></div>`);
}
function Rgo(y,m){const n=new Date(),cy=n.getFullYear();if(y<cy||(y===cy&&m<n.getMonth())){y=cy;m=n.getMonth()}if(y>cy+3){y=cy+3;m=11}RS.y=y;RS.m=m;Rdraw()}
function Rnav(){Rset();Rgo(+$('rYe').value,+$('rMo').value)}
function Rmv(d){Rset();const x=new Date(RS.y,RS.m+d,1);Rgo(x.getFullYear(),x.getMonth())}
function Rpick(k){Rset();RS.sel=k;const o=RS.map[k];if(o){RS.h=o.h%12||12;RS.mi=o.mi;RS.ap=o.h>=12?'م':'ص'}Rdraw()}
function Rtoday(){Rset();const n=new Date();RS.y=n.getFullYear();RS.m=n.getMonth();RS.sel=dk(n);Rdraw()}
async function Rclear(){
 const o=RS.map[RS.sel];Rset();if(o)await sb.from('reminders').delete().eq('id',o.id);
 RS.sel='';await Rfetch();Rdraw();Rmsg(o?'تم حذف التذكير':'')}
async function Rsave(){
 Rset();if(!RS.sel)return Rmsg('اختر يوماً أولاً',1);
 const [y,m,d]=RS.sel.split('-').map(Number);let h=RS.h%12;if(RS.ap==='م')h+=12;
 const at=new Date(y,m-1,d,h,RS.mi);if(at<=new Date())return Rmsg('اختر وقتاً في المستقبل',1);
 const old=RS.map[RS.sel];if(old)await sb.from('reminders').delete().eq('id',old.id);
 const {error}=await sb.from('reminders').insert({client_id:RS.cid,user_id:me.id,remind_at:at.toISOString()});
 if(error)return Rmsg(error.message,1);
 await Rfetch();Rdraw();Rmsg('✓ تم الحفظ');
}

// ---- الإشعارات: العداد من مصدر واحد + التذكيرات المستحقة (تظهر لصاحبها فقط) ----
let NCACHE=[];
function nBadge(){const k=NCACHE.filter(n=>!n.own&&!NMY.has(n.id)).length,b=$('notifBadge');b.textContent=k;b.classList.toggle('hide',!k)}
async function loadNotifications(force){
 if(typeof me==='undefined'||!me||!me.id)return;
 const lim=me.notif_limit||50;
 const [{data,error},{data:rm}]=await Promise.all([
  sb.from('notifications').select('*').or(`user_id.is.null,user_id.eq.${me.id}`).order('created_at',{ascending:false}).limit(lim),
  sb.from('reminders').select('id,remind_at,done,clients(name,phone)').eq('user_id',me.id).lte('remind_at',new Date().toISOString()).order('remind_at',{ascending:false}).limit(lim)]);
 if(error)return;
 const cnt={},ids=(data||[]).map(n=>n.id);
 if(ids.length){const {data:rd}=await sb.from('notification_reads').select('notification_id,user_id').in('notification_id',ids);
  (rd||[]).forEach(r=>{cnt[r.notification_id]=(cnt[r.notification_id]||0)+1;if(r.user_id===me.id)NMY.add(r.notification_id)})}
 const L=(data||[]).map(n=>({...n,t:n.created_at,own:n.sender_id===me.id,cnt:cnt[n.id]||0}));
 (rm||[]).forEach(r=>{const id='r_'+r.id;if(r.done)NMY.add(id);const c=r.clients||{};
  L.push({id,rem:1,t:r.remind_at,own:false,title:'🔔 تذكير متابعة',body:'تواصل مع العميل: '+(c.name||'-')+' — '+(c.phone||'')})});
 L.sort((a,b)=>new Date(b.t)-new Date(a.t));NCACHE=L.slice(0,lim);nBadge();
 if(nOpen()&&!force)return;
 nStop();
 $('nList').innerHTML=NCACHE.length?NCACHE.map(n=>`<div class="it" ${n.own?'':`data-id="${n.id}"`} style="margin:0;background:${NMY.has(n.id)||n.own?'#f8fafc':'#eff6ff'}">
  ${n.own?`<button class="lnk" style="float:left;color:#e11d48" onclick="nDel('${n.id}')">✕</button>`:''}
  <div style="font-weight:700;font-size:13px">${e(n.title)}</div><div style="font-size:12px">${e(n.body)}</div>
  <small>${fdt(n.t)}${n.rem?'':` • قرأها: <b id="nc_${n.id}">${n.cnt}</b>`}</small>
  ${n.own?'':`<span id="nr_${n.id}" style="color:#16a34a;font-weight:700;font-size:12px;float:left">${NMY.has(n.id)?'✓ مقروء':''}</span>`}</div>`).join(''):'<p style="color:#94a3b8;text-align:center">لا توجد إشعارات</p>';
 nWatch();
}
async function nRead(id){
 delete NTM[id];if(NMY.has(id))return;NMY.add(id);
 const res=id.startsWith('r_')?await sb.from('reminders').update({done:true}).eq('id',id.slice(2)):await sb.from('notification_reads').insert({notification_id:id,user_id:me.id});
 const error=res.error;if(error&&error.code!=='23505'){NMY.delete(id);return}
 const c=$('nc_'+id),r=$('nr_'+id),el=document.querySelector(`#nList [data-id="${id}"]`);
 if(c&&!error)c.textContent=+c.textContent+1;if(r)r.textContent='✓ مقروء';if(el)el.style.background='#f8fafc';
 nBadge();
}
