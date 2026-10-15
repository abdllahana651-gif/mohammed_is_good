// صفحة المشاريع — تُحمَّل بعد سكربت index.html
const PT=['فيلا','شقة','دوبلكس','تاون هاوس','عمارة','أرض'],PS=['قيد الإنشاء','جاهز','مباع بالكامل','متوقف'];
let PR=[],PF={},PLL=null,PSet=null;
document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"><style>.map{height:260px;border-radius:10px;border:1px solid #dbe4f0;margin-top:8px;isolation:isolate}</style>');
{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';document.head.appendChild(s)}

// ---- الصفحة والقائمة ----
const CP=document.querySelector('main .page'),PP=document.createElement('div');PP.className='page hide';CP.after(PP);
PP.innerHTML=`<div class="bar"><h1>المشاريع</h1><button class="btn f" id="pfBtn">⏷ تصفية</button>
<button class="btn" id="pimBtn">استيراد</button><input type="file" id="pimF" class="hide" accept=".xlsx,.xlsm,.xlsb,.xltx">
<button class="btn" id="pexBtn">تصدير</button><input id="pq" placeholder="البحث باسم المشروع"><button class="btn p" id="paddBtn">＋ اضافة مشروع</button></div>
<div class="filters hide" id="pfPan"><select id="pfC"></select><select id="pfT"></select><select id="pfS"></select>
<select id="pfA"><option value="">آخر نشاط (الكل)</option><option value="7">آخر 7 ايام</option><option value="30">آخر 30 يوم</option><option value="180">آخر 6 اشهر</option><option value="365">آخر سنة</option><option value="c">مخصص</option></select>
<input type="date" id="pfD" class="hide"><button class="btn p hide" id="pfOk">موافق</button>
<select id="pfO"><option value="">الترتيب (الأحدث نشاطاً)</option><option value="asc">متوسط التقييم: من الأقل للأعلى</option><option value="desc">متوسط التقييم: من الأعلى للأقل</option></select>
<input type="number" id="pfR" min="0" max="5" step="0.1" placeholder="تصفية بمتوسط التقييم" style="width:190px"></div>
<div class="tw"><table><thead><tr><th>المشروع</th><th>النوع</th><th>الحالة</th><th>الأسعار</th><th>تاريخ الاضافة</th><th>اخر نشاط</th><th>خيارات</th></tr></thead><tbody id="ptb"></tbody></table></div>`;
$('sub').innerHTML='<a id="nC" class="on">العملاء</a>';
document.head.insertAdjacentHTML('beforeend','<style>#sub2 a{margin-right:16px}#mg2{margin-top:10px}</style>');
$('sub').insertAdjacentHTML('afterend','<a id="mg2" class="grp"><span>إدارة المشاريع</span><span id="ar2">⌄</span></a><div id="sub2"><a id="nP">المشاريع</a></div>');
<a id="adminNotifBtn" onclick="openAdminNotifModal()" style="cursor:pointer;padding-right:15px;color:#2563eb;font-size:13px;">📢 إرسال إشعار للموظفين</a>
$('mg2').onclick=()=>{const o=$('sub2').classList.toggle('hide');$('ar2').textContent=o?'‹':'⌄'};
function Pgo(p){CP.classList.toggle('hide',!!p);PP.classList.toggle('hide',!p);$('nC').classList.toggle('on',!p);$('nP').classList.toggle('on',!!p);if(p)Pload();else load()}
$('nC').onclick=()=>Pgo(0);$('nP').onclick=()=>Pgo(1);
$('pfT').innerHTML=opts(PT,'','النوع');$('pfS').innerHTML=opts(PS,'','الحالة');
const {error}=await sb.from('clients').update({owner_id:to,last_activity:new Date().toISOString()}).eq('id',id);if(error)return alert(error.message);
async function Pfetch(){
 const {data,error}=await sb.from('projects').select('*').order('last_activity',{ascending:false});if(error)return alert(error.message);PR=data;
 const {data:rt}=await sb.from('project_notes').select('project_id,rating');const m={};
 (rt||[]).forEach(r=>{if(r.rating)(m[r.project_id]=m[r.project_id]||[]).push(r.rating)});
 PR.forEach(p=>{const a=m[p.id];p.avg=a?a.reduce((x,y)=>x+y,0)/a.length:null});
}
async function Pload(){await Pfetch();$('pfC').innerHTML=opts([...new Set(PR.map(p=>p.city).filter(Boolean))],'','المدينة');$('pfC').value=PF.c||'';Pdraw()}
const Ppr=p=>p.price_min||p.price_max?Number(p.price_min||0).toLocaleString('en')+' - '+Number(p.price_max||0).toLocaleString('en'):'-';
function Pdraw(){
 const q=$('pq').value.trim().toLowerCase();
 const l=PR.filter(p=>{
  if(q&&!p.name.toLowerCase().includes(q))return false;
  if(PF.c&&p.city!==PF.c)return false;if(PF.t&&p.type!==PF.t)return false;if(PF.s&&p.status!==PF.s)return false;if(PF.r===0){if(p.avg!=null)return false}else if(PF.r!=null&&!(p.avg!=null&&p.avg>=PF.r))return false;
  const t=new Date(p.last_activity);
  if(PF.days&&t<Date.now()-PF.days*864e5)return false;
  if(PF.day&&t.toLocaleDateString('en-CA')!==PF.day)return false;
  return true});
  if(PF.o)l.sort((a,b)=>a.avg==null?(b.avg==null?0:1):b.avg==null?-1:PF.o==='asc'?a.avg-b.avg:b.avg-a.avg);
 $('ptb').innerHTML=l.map(p=>`<tr><td><div class="cl"><div class="av" style="background:#bbf7d0">${e(p.name.slice(0,2))}</div><div>${e(p.name)} ${p.lat?`<a href="#" onclick="Pshow('${p.id}');return false" title="عرض على الخريطة">📍</a>`:''}<small style="direction:rtl">${e(p.city)} - ${e(p.district)}</small></div></div></td>
 <td><b>${e(p.type)}</b></td><td><b>${e(p.status)}</b></td><td><b>${Ppr(p)}</b></td><td><b>${fd(p.created_at)}</b></td><td><b>${fd(p.last_activity)}</b></td>
 <td><div class="mn"><button class="btn" onclick="Pmnu(event,'${p.id}')">⋮</button></div></td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:#94a3b8">لا توجد مشاريع</td></tr>';
}
function Pmnu(ev,id){
 document.querySelectorAll('.mn>div').forEach(x=>x.remove());const d=document.createElement('div');
 d.innerHTML=`<button class="btn" onclick="Pview('${id}')">👁 عرض</button><button class="btn" onclick="Pform('${id}')">✎ تعديل</button><button class="btn d" onclick="Pdel('${id}')">🗑 حذف</button>`;
 ev.currentTarget.parentNode.appendChild(d);ev.stopPropagation();
}
$('pq').oninput=Pdraw;
$('pfBtn').onclick=()=>{const h=$('pfPan').classList.toggle('hide');if(h){PF={};$('pfC').value=$('pfT').value=$('pfS').value=$('pfA').value=$('pfD').value=$('pfR').value=$('pfO').value='';$('pfD').classList.add('hide');$('pfOk').classList.add('hide');Pdraw()}};
$('pfC').onchange=()=>{PF.c=$('pfC').value;Pdraw()};$('pfT').onchange=()=>{PF.t=$('pfT').value;Pdraw()};$('pfS').onchange=()=>{PF.s=$('pfS').value;Pdraw()};
$('pfA').onchange=()=>{const v=$('pfA').value,c=v==='c';$('pfD').classList.toggle('hide',!c);$('pfOk').classList.toggle('hide',!c);PF.days=c?0:+v;PF.day='';if(!c)Pdraw()};
$('pfOk').onclick=()=>{PF.day=$('pfD').value;Pdraw()};
$('pfR').oninput=()=>{const v=parseFloat($('pfR').value);if(!isNaN(v)&&(v>5||v<0))$('pfR').value=Math.min(5,Math.max(0,v));PF.r=isNaN(v)?null:Math.min(5,Math.max(0,v));Pdraw()};
$('pfR').oninput=()=>{const v=parseFloat($('pfR').value);if(!isNaN(v)&&(v>5||v<0))$('pfR').value=Math.min(5,Math.max(0,v));PF.r=isNaN(v)?null:Math.min(5,Math.max(0,v));Pdraw()};
$('pfO').onchange=()=>{PF.o=$('pfO').value;Pdraw()};
// ---- الخريطة ----
function PMap(id,lat,lng,edit){
 const m=L.map(id).setView([lat||21.54,lng||39.17],lat?15:9);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(m);let mk;
 const set=(a,b,z)=>{if(mk)mk.setLatLng([a,b]);else{mk=L.marker([a,b],{draggable:edit}).addTo(m);if(edit)mk.on('dragend',()=>{const p=mk.getLatLng();PLL=[p.lat,p.lng]})}
  if(edit)PLL=[a,b];if(z)m.setView([a,b],15)};
 if(lat)set(lat,lng);if(edit)m.on('click',ev=>set(ev.latlng.lat,ev.latlng.lng));
 set.view=(a,b)=>m.setView([a,b],14);setTimeout(()=>m.invalidateSize(),200);return set;
}
async function Psearch(){
 const q=$('pQ2').value.trim();if(!q||!PSet)return;
 const m=q.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)||q.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)||q.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
 if(m)return PSet(+m[1],+m[2],1);
 try{const r=await(await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q))).json();
  if(!r.length)return alert('ما لقيت الموقع، جرّب المدينة والحي، أو اضغط على الخريطة مباشرة');
  PSet(+r[0].lat,+r[0].lon,1)}catch(x){alert('تعذر البحث، اضغط على الخريطة مباشرة')}
}

function Pshow(id){
 const p=PR.find(x=>x.id===id);
 show(`<h3>📍 ${e(p.name)}</h3><p>${e(p.city)} - ${e(p.district)}</p><div id="sm" class="map" style="height:380px"></div>
 <div style="margin-top:14px"><a class="btn p" style="text-decoration:none" target="_blank" href="https://www.google.com/maps?q=${p.lat},${p.lng}">فتح في خرائط قوقل</a> <button class="btn" onclick="closeM()">إغلاق</button></div>`);
 if(window.L)PMap('sm',p.lat,p.lng,false);
}
async function Pauto(){
 if(PLL||!PSet)return;const q=[$('pCi').value,$('pD').value].map(x=>x.trim()).filter(Boolean).join(' ');if(!q)return;
 try{const r=await(await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q))).json();if(r.length&&!PLL)PSet.view(+r[0].lat,+r[0].lon)}catch(x){}
}
// ---- الإضافة والتعديل ----
$('paddBtn').onclick=()=>Pform();
const Plg=(id,a,d)=>sb.from('project_log').insert({project_id:id,action:a,details:d,author:me.full_name});
function Pform(id){
 const p=PR.find(x=>x.id===id)||{owner_id:me.id};PLL=p.lat?[p.lat,p.lng]:null;
 show(`<h3>${id?'تعديل مشروع':'اضافة مشروع'}</h3><div class="g2">
 <div><label>اسم المشروع</label><input id="pN" value="${e(p.name)}"></div>
 <div><label>المطوّر (اختياري)</label><input id="pDev" value="${e(p.developer)}"></div>
 <div><label>المدينة</label><input id="pCi" value="${e(p.city)}" onchange="Pauto()"></div>
 <div><label>الحي</label><input id="pD" value="${e(p.district)}" onchange="Pauto()"></div>
 <div><label>النوع</label><select id="pT">${opts(PT,p.type,'')}</select></div>
 <div><label>الحالة</label><select id="pSt">${opts(PS,p.status,'')}</select></div>
 <div><label>تاريخ المشروع (التسليم)</label><input type="date" id="pDl" value="${e(p.delivery_date)}"></div>
 <div><label>المسؤول</label><select id="pO">${users.map(u=>`<option value="${u.id}" ${u.id===p.owner_id?'selected':''}>${e(u.full_name)}</option>`).join('')}</select></div>
 <div><label>السعر من (اختياري)</label><input type="number" id="pMn" min="0" value="${e(p.price_min)}"></div>
 <div><label>السعر إلى (اختياري)</label><input type="number" id="pMx" min="0" value="${e(p.price_max)}"></div></div>
 <label>الوصف</label><textarea id="pDs" rows="3">${e(p.description)}</textarea>
 <label>الموقع على الخريطة (اختياري)</label>
 <div style="display:flex;gap:8px"><input id="pQ2" placeholder="ابحث بالحي أو الصق رابط خرائط قوقل، أو اضغط على الخريطة"><button class="btn" onclick="Psearch()">بحث</button></div>
 <div id="fm" class="map"></div>
 <div style="margin-top:16px"><button class="btn p" onclick="Psave('${id||''}')">💾 حفظ</button> <button class="btn lnk" onclick="closeM()" style="color:#334155">الغاء</button></div>`);
 PSet=window.L?PMap('fm',p.lat,p.lng,true):null;if(!p.lat)Pauto();
}
async function Psave(id){
 const g=k=>$(k).value.trim();
 const v={name:g('pN'),city:g('pCi'),district:g('pD'),type:$('pT').value,status:$('pSt').value,developer:g('pDev')||null,delivery_date:$('pDl').value,owner_id:$('pO').value,
  description:g('pDs'),price_min:g('pMn')?+g('pMn'):null,price_max:g('pMx')?+g('pMx'):null,lat:PLL?PLL[0]:null,lng:PLL?PLL[1]:null,last_activity:new Date().toISOString()};
 const er=[];
 if(v.name.length<2)er.push('• اكتب اسم المشروع');if(!v.city)er.push('• اكتب المدينة');if(!v.district)er.push('• اكتب الحي');
 if(!v.type)er.push('• اختر النوع');if(!v.status)er.push('• اختر الحالة');if(!v.delivery_date)er.push('• اختر تاريخ المشروع');
 if(!v.owner_id)er.push('• اختر المسؤول');if(v.description.length<5)er.push('• اكتب الوصف');
 if(v.price_min!=null&&v.price_max!=null&&v.price_min>v.price_max)er.push('• السعر من أكبر من السعر إلى');
 if(er.length)return alert('لا يمكن الحفظ:\n'+er.join('\n'));
 if(id){
  const o=PR.find(x=>x.id===id),L2={name:'الاسم',city:'المدينة',district:'الحي',type:'النوع',status:'الحالة',developer:'المطور',delivery_date:'تاريخ التسليم',owner_id:'المسؤول',description:'الوصف',price_min:'السعر من',price_max:'السعر إلى'};
  const ch=Object.keys(L2).filter(k=>String(o[k]??'')!==String(v[k]??'')).map(k=>k==='owner_id'?`${L2[k]}: ${name(o[k])} ← ${name(v[k])}`:`${L2[k]}: "${o[k]??''}" ← "${v[k]??''}"`);
  if(o.lat!==v.lat||o.lng!==v.lng)ch.push('الموقع على الخريطة');
  const {error}=await sb.from('projects').update(v).eq('id',id);if(error)return alert(error.message);
  if(ch.length)await Plg(id,'تعديل بيانات',ch.join(' | '));
 }else{
  const {data,error}=await sb.from('projects').insert(v).select().single();if(error)return alert(error.message);
  await Plg(data.id,'إضافة مشروع','تمت إضافة المشروع');
 }
 closeM();Pload();
}
async function Pdel(id){if(!confirm('حذف المشروع نهائياً؟'))return;await sb.from('projects').delete().eq('id',id);Pload()}

// ---- العرض ----
async function Pview(id){
 const p=PR.find(x=>x.id===id);
 const [{data:n},{data:g},{data:cl}]=await Promise.all([sb.from('project_notes').select('*').eq('project_id',id).order('created_at',{ascending:false}),
  sb.from('project_log').select('*').eq('project_id',id).order('created_at',{ascending:false}),
  sb.from('client_projects').select('clients(id,name,phone)').eq('project_id',id)]);
 const ow=users.find(x=>x.id===p.owner_id)||{};
 show(`<h3>${e(p.name)}</h3>
 <p>${e(p.city)} - ${e(p.district)} | النوع: <b>${e(p.type)}</b> | الحالة: <b>${e(p.status)}</b> | المطوّر: <b>${e(p.developer||'-')}</b><br>
 التسليم: <b>${e(p.delivery_date)}</b> | الأسعار: <b>${Ppr(p)}</b> | المسؤول: <b style="color:${e(ow.name_color||'inherit')}">${e(ow.full_name||'-')}</b></p>
 <div class="it">${e(p.description)}</div>
 ${p.lat?`<div id="vm" class="map"></div><p><a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" class="btn p" style="text-decoration:none">📍 فتح في خرائط قوقل</a></p>`:'<p style="color:#94a3b8">لم يتم تحديد موقع على الخريطة</p>'}
 <h4>العملاء المهتمون (${(cl||[]).length})</h4>
 ${(cl||[]).filter(x=>x.clients).map(x=>`<div class="it">${e(x.clients.name)} <small style="direction:ltr;display:inline-block">${e(x.clients.phone)}</small></div>`).join('')||'<p style="color:#94a3b8">لا يوجد</p>'}
 <h4>الملاحظات</h4>
 <div class="g2"><div><textarea id="pnB" rows="2" placeholder="اكتب ملاحظة"></textarea></div>
 <div><select id="pnR"><option value="5">⭐⭐⭐⭐⭐ ممتاز</option><option value="4">⭐⭐⭐⭐ جيد جداً</option><option value="3">⭐⭐⭐ جيد</option><option value="2">⭐⭐ ضعيف</option><option value="1">⭐ سيء</option></select>
 <button class="btn p" style="margin-top:8px" onclick="PaddNote('${id}')">إضافة ملاحظة</button></div></div>
 ${(n||[]).map(x=>`<div class="it"><span class="st">${'★'.repeat(x.rating||0)}${'☆'.repeat(5-(x.rating||0))}</span> ${e(x.body)}<br><small>${e(x.author)} • ${fdt(x.created_at)}</small></div>`).join('')}
<div class="it" style="display:inline-block;padding:6px 12px">متوسط التقييم: <b class="st">${n&&n.length?(n.reduce((s,x)=>s+(x.rating||0),0)/n.length).toFixed(1)+' ★':'لا يوجد'}</b>${n&&n.length?` <small>(${n.length} تقييم)</small>`:''}</div>
<h4>سجل التغييرات</h4>
 ${(g||[]).map(x=>`<div class="it"><b>${e(x.action)}</b>: ${e(x.details)}<br><small>${e(x.author)} • ${fdt(x.created_at)}</small></div>`).join('')}
 <button class="btn" onclick="closeM()" style="margin-top:12px">إغلاق</button>`);
 if(p.lat&&window.L)PMap('vm',p.lat,p.lng,false);
}
async function PaddNote(id){
 const b=$('pnB').value.trim();if(!b)return;
 await sb.from('project_notes').insert({project_id:id,body:b,rating:+$('pnR').value,author:me.full_name});
 await Plg(id,'إضافة ملاحظة',b.slice(0,80));
 await sb.from('projects').update({last_activity:new Date().toISOString()}).eq('id',id);
 await Pfetch();Pdraw();Pview(id);
}

// ---- مشاريع العميل (من قائمة خيارات العميل) ----
function mnu(ev,id){
 document.querySelectorAll('.mn>div').forEach(x=>x.remove());const d=document.createElement('div');
 d.innerHTML=`<button class="btn" onclick="view('${id}')">👁 عرض</button><button class="btn" onclick="(window.openform||window.openForm)('${id}')">✎ تعديل</button><button class="btn" onclick="Pcl('${id}')">🏗 المشاريع</button><button class="btn" onclick="Ptr('${id}')">🔁 نقل</button><button class="btn d" onclick="del('${id}')">🗑 حذف</button>`;
 ev.currentTarget.parentNode.appendChild(d);ev.stopPropagation();
}
async function Pcl(cid){
 await Pfetch();const c=rows.find(x=>x.id===cid);
 const {data}=await sb.from('client_projects').select('project_id').eq('client_id',cid);
 const ids=(data||[]).map(x=>x.project_id),mine=PR.filter(p=>ids.includes(p.id)),rest=PR.filter(p=>!ids.includes(p.id));
 show(`<h3>مشاريع العميل: ${e(c.name)}</h3>
 ${mine.map(p=>`<div class="it" style="display:flex;justify-content:space-between;align-items:center"><span><b>${e(p.name)}</b> <small>${e(p.city)} - ${e(p.district)} • ${e(p.type)} • ${e(p.status)}</small></span><button class="btn d" onclick="Punlink('${cid}','${p.id}')">إزالة</button></div>`).join('')||'<p style="color:#94a3b8">لا توجد مشاريع مرتبطة بهذا العميل</p>'}
 <label>إضافة مشروع للعميل</label>
 ${rest.length?`<div style="display:flex;gap:8px"><select id="pcS">${rest.map(p=>`<option value="${p.id}">${e(p.name)} - ${e(p.city)}</option>`).join('')}</select><button class="btn p" onclick="Plink('${cid}')">إضافة</button></div>`:'<p style="color:#94a3b8">لا توجد مشاريع أخرى (أضف مشاريع من صفحة المشاريع)</p>'}
 <button class="btn" onclick="closeM()" style="margin-top:14px">إغلاق</button>`);
}
async function Plink(cid){
 const pid=$('pcS').value,p=PR.find(x=>x.id===pid);
 const {error}=await sb.from('client_projects').insert({client_id:cid,project_id:pid});if(error)return alert(error.message);
 await lg(cid,'ربط مشروع',p.name);await sb.from('clients').update({last_activity:new Date().toISOString()}).eq('id',cid);
 await load();Pcl(cid);
}
async function Punlink(cid,pid){
 const p=PR.find(x=>x.id===pid);await sb.from('client_projects').delete().eq('client_id',cid).eq('project_id',pid);
 await lg(cid,'إزالة مشروع',p.name);await sb.from('clients').update({last_activity:new Date().toISOString()}).eq('id',cid);
 await load();Pcl(cid);
}

// ---- تصدير / استيراد ----
$('pexBtn').onclick=()=>{
 const d=PR.map(p=>({'الاسم':p.name,'المدينة':p.city,'الحي':p.district,'النوع':p.type,'الحالة':p.status,'المطور':p.developer,'تاريخ التسليم':p.delivery_date,'السعر من':p.price_min,'السعر إلى':p.price_max,'الوصف':p.description,'المسؤول':name(p.owner_id),'تاريخ الإضافة':fdt(p.created_at),'آخر نشاط':fdt(p.last_activity)}));
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(d),'المشاريع');XLSX.writeFile(wb,'projects.xlsx');
};
$('pimBtn').onclick=()=>show(`<h3>استيراد مشاريع من ملف Excel</h3>
<p>الانواع المقبولة: xlsx وxlsm وxlsb وxltx. يقرأ <b>أول ورقة</b> فقط، وأول صف لازم يكون عناوين الأعمدة مكتوبة بالضبط كما في الجدول.</p>
<div style="overflow:auto"><table style="min-width:0;background:#fff"><tr><th>العمود</th><th>مطلوب</th><th>نوع القيمة</th></tr>
<tr><td><b>الاسم</b></td><td>نعم</td><td>نص من حرفين أو أكثر</td></tr>
<tr><td><b>المدينة</b></td><td>نعم</td><td>نص</td></tr><tr><td><b>الحي</b></td><td>نعم</td><td>نص</td></tr>
<tr><td><b>النوع</b></td><td>نعم</td><td>${PT.map(e).join('، ')}</td></tr>
<tr><td><b>الحالة</b></td><td>نعم</td><td>${PS.map(e).join('، ')}</td></tr>
<tr><td><b>تاريخ التسليم</b></td><td>نعم</td><td>بهذه النوعية فقط: 2026-12-31</td></tr>
<tr><td><b>الوصف</b></td><td>نعم</td><td>نص (5 أحرف فأكثر)</td></tr>
<tr><td><b>المطور</b></td><td>لا</td><td>نص</td></tr><tr><td><b>السعر من / السعر إلى</b></td><td>لا</td><td>أرقام فقط</td></tr></table></div>
<div class="it">• أي عمود ثاني في الملف يتم <b>تجاهله</b>، والمسؤول يصير أنت.</div>
<div class="it">• العناوين وقيم <b>النوع والحالة</b> لازم تطابق النص <b>100%</b> حرفاً بحرف، مثل الفرق بين <b>أحمد</b> و<b>احمد</b>.</div>
<div class="it">• اجعل عمود التاريخ بنوع <b>نص (Text)</b> في Excel حتى لا يغيّر شكله.</div>
<div class="it">• المشروع المكرر (نفس الاسم والمدينة والحي) والصفوف الغلط تُتجاهل وتظهر لك أرقامها بعد الاستيراد.</div>
<div style="margin-top:16px"><button class="btn p" onclick="closeM();$('pimF').click()">📂 اختيار الملف</button> <button class="btn lnk" onclick="closeM()" style="color:#334155">الغاء</button></div>`);
$('pimF').onchange=async ev=>{
 const f=ev.target.files[0];if(!f)return;
 try{
  const wb=XLSX.read(await f.arrayBuffer());const js=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{raw:false});
  await Pfetch();const key=(a,b,c)=>[a,b,c].map(x=>String(x).trim().toLowerCase()).join('|');
  const have=new Set(PR.map(p=>key(p.name,p.city,p.district))),ok=[],bad=[];
  js.forEach((r,i)=>{
   const g=k=>String(r[k]??'').trim(),er=[],mn=g('السعر من').replace(/,/g,''),mx=g('السعر إلى').replace(/,/g,'');
   if(g('الاسم').length<2)er.push('الاسم');if(!g('المدينة'))er.push('المدينة');if(!g('الحي'))er.push('الحي');
   if(!PT.includes(g('النوع')))er.push('النوع');if(!PS.includes(g('الحالة')))er.push('الحالة');
   if(!/^\d{4}-\d{2}-\d{2}$/.test(g('تاريخ التسليم'))||isNaN(new Date(g('تاريخ التسليم'))))er.push('تاريخ التسليم');
   if(g('الوصف').length<5)er.push('الوصف');if((mn&&isNaN(mn))||(mx&&isNaN(mx)))er.push('السعر');
   const k=key(g('الاسم'),g('المدينة'),g('الحي'));if(!er.length&&have.has(k))er.push('مكرر');
   if(er.length)bad.push('صف '+(i+2)+': '+er.join('، '));
   else{have.add(k);ok.push({name:g('الاسم'),city:g('المدينة'),district:g('الحي'),type:g('النوع'),status:g('الحالة'),developer:g('المطور')||null,delivery_date:g('تاريخ التسليم'),description:g('الوصف'),price_min:mn?+mn:null,price_max:mx?+mx:null,owner_id:me.id})}
  });
  if(ok.length){const {error}=await sb.from('projects').insert(ok);if(error)throw error}
  alert('تمت إضافة '+ok.length+' مشروع'+(bad.length?'\nتم تجاهل '+bad.length+' صف فيها أخطاء:\n'+bad.slice(0,15).join('\n'):''));
  Pload();
 }catch(x){alert('خطأ في الملف: '+(x.message||x))}
 ev.target.value='';
};
function Ptr(id){
 const c=rows.find(x=>x.id===id),o=users.filter(u=>u.id!==me.id);
 show(`<h3>نقل العميل: ${e(c.name)}</h3><p>بعد النقل ما يظهر العميل عندك، ويصير عند الموظف الجديد.</p>
 ${o.length?`<label>نقل إلى</label><select id="tS">${o.map(u=>`<option value="${u.id}">${e(u.full_name)}</option>`).join('')}</select>
 <div style="margin-top:16px"><button class="btn p" onclick="PtrOk('${id}')">نقل</button> <button class="btn lnk" onclick="closeM()" style="color:#334155">الغاء</button></div>`:'<p style="color:#dc2626">لا يوجد موظف آخر مسجل.</p><button class="btn" onclick="closeM()">إغلاق</button>'}`);
}
function PtrOk(id){
 const to=$('tS').value;if(!confirm('نقل العميل إلى '+name(to)+'؟'))return;
 (async()=>{
  
  if(error)return alert(error.message);
  await lg(id,'نقل عميل',name(me.id)+' ← '+name(to));
  closeM();load();
 })();
}
// ---- نظام الإشعارات ----
async function loadNotifications() {
  if (!me) return;
  const { data, error } = await sb.from('notifications')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${me.id}`)
    .order('created_at', { ascending: false });
  
  if (error) return;
  
  const unread = (data || []).filter(n => !n.is_read);
  const badge = $('notifBadge');
  if (unread.length > 0) {
    badge.textContent = unread.length;
    badge.classList.remove('hide');
  } else {
    badge.classList.add('hide');
  }

  const list = $('notifList');
  if (!data || data.length === 0) {
    list.innerHTML = '<p style="color:#94a3b8;text-align:center;margin:10px 0;">لا توجد إشعارات</p>';
    return;
  }

  list.innerHTML = data.map(n => `
    <div style="background:${n.is_read ? '#f8fafc' : '#eff6ff'};border:1px solid #e5eaf2;border-radius:8px;padding:8px;cursor:pointer;" onclick="markRead('${n.id}')">
      <div style="font-weight:700;font-size:13px;margin-bottom:2px;">${e(n.title)}</div>
      <div style="font-size:12px;color:#334155;">${e(n.body)}</div>
      <small style="color:#64748b;font-size:10px;display:block;margin-top:4px;">${fdt(n.created_at)}</small>
    </div>
  `).join('');
}

async function markRead(id) {
  await sb.from('notifications').update({ is_read: true }).eq('id', id);
  loadNotifications();
}

async function markAllRead() {
  if (!me) return;
  await sb.from('notifications').update({ is_read: true }).or(`user_id.is.null,user_id.eq.${me.id}`);
  loadNotifications();
}

document.addEventListener('DOMContentLoaded', () => {
  const notifBtn = $('notifBtn');
  const notifMenu = $('notifMenu');
  if (notifBtn && notifMenu) {
    notifBtn.onclick = ev => {
      ev.stopPropagation();
      notifMenu.classList.toggle('hide');
      if (!notifMenu.classList.contains('hide')) loadNotifications();
    };
    notifMenu.onclick = ev => ev.stopPropagation();
  }
});

setInterval(loadNotifications, 30000);
// ---- وظائف إرسال الإشعارات والتذكيرات ----

async function sendAdminNotification(title, body) {
  const { error } = await sb.from('notifications').insert({
    user_id: null,
    title: title,
    body: body,
    is_read: false
  });
  if (error) {
    alert('خطأ في إرسال الإشعار: ' + error.message);
  } else {
    alert('تم إرسال الإشعار بنجاح لجميع الموظفين');
  }
}

function openAdminNotifModal() {
  show(`
    <h3>إرسال إشعار لجميع الموظفين</h3>
    <label>عنوان الإشعار</label>
    <input id="adNotifTitle" placeholder="مثال: تنبيه هام">
    <label>محتوى الرسالة</label>
    <textarea id="adNotifBody" rows="4" placeholder="اكتب تفاصيل الإشعار هنا..."></textarea>
    <div style="margin-top:16px">
      <button class="btn p" onclick="submitAdminNotif()">إرسال للجميع</button>
      <button class="btn lnk" onclick="closeM()" style="color:#334155">إلغاء</button>
    </div>
  `);
}

async function submitAdminNotif() {
  const title = $('adNotifTitle').value.trim();
  const body = $('adNotifBody').value.trim();
  if (!title || !body) return alert('الرجاء كتابة العنوان والمحتوى');
  await sendAdminNotification(title, body);
  closeM();
}
