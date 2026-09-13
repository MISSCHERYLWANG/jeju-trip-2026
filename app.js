
const DATA=window.TRIP_DATA, DAYS=DATA.days, PREP=DATA.prep, SHOPS=DATA.shops, GIFTS=DATA.gifts, SOURCES=DATA.sources;
let di=Number(localStorage.getItem('jeju-day')||0), map=null, marks=[], line=null, deferredInstall=null;
const STORE='jeju-v5', $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

function nav(q){return 'https://map.naver.com/p/search/'+encodeURIComponent(q)}
function goog(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q+' Jeju, South Korea')}
function route(stops){
  const names=stops.map(x=>typeof x==='string'?x:(x.name||x.kr));
  if(names.length<2)return goog(names[0]||'Jeju');
  return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(names[0]+' Jeju')+
    '&destination='+encodeURIComponent(names[names.length-1]+' Jeju')+
    (names.length>2?'&waypoints='+encodeURIComponent(names.slice(1,-1).map(x=>x+' Jeju').join('|')):'')+'&travelmode=driving';
}
function saved(k,d={}){try{return JSON.parse(localStorage.getItem(STORE+'-'+k)||JSON.stringify(d))}catch{return d}}
function put(k,v){localStorage.setItem(STORE+'-'+k,JSON.stringify(v))}
function showSection(id){$$('.section').forEach(x=>x.classList.toggle('active',x.id===id));$$('[data-sec]').forEach(x=>x.classList.toggle('active',x.dataset.sec===id));window.scrollTo({top:0,behavior:'smooth'});if(id==='days')setTimeout(()=>{if(map){map.invalidateSize();renderMap()}},100)}
$$('[data-sec]').forEach(b=>b.addEventListener('click',()=>showSection(b.dataset.sec)));

function todayIndex(){const d=new Date(),s=new Date(2026,8,24),diff=Math.floor((d-s)/86400000);return diff>=0&&diff<4?diff:0}
function renderDayStrip(){
  const b=$('#daystrip');b.innerHTML='';
  DAYS.forEach((d,i)=>{const x=document.createElement('button');x.className='daybtn'+(i===di?' active':'');x.textContent=`Day ${i+1} · ${d.date} ${d.line}`;x.onclick=()=>{di=i;localStorage.setItem('jeju-day',di);renderDay();window.scrollTo({top:0,behavior:'smooth'})};b.appendChild(x)})
}
function ensureMap(){
  if(map)return true;if(!window.L){$('#map').innerHTML='<div class="mapfallback">地图脚本未加载。下面的 Naver / Google 导航仍可用。</div>';return false}
  try{map=L.map('map',{scrollWheelZoom:true,zoomControl:false}).setView([33.4,126.55],10);L.control.zoom({position:'bottomright'}).addTo(map);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);return true}catch(e){$('#map').innerHTML='<div class="mapfallback">地图加载失败，但外部导航按钮仍可用。</div>';return false}
}
function renderMap(){
  if(!ensureMap())return;marks.forEach(m=>map.removeLayer(m));marks=[];if(line)map.removeLayer(line);
  const d=DAYS[di],coords={'Diamond Hotel':[33.4889189,126.4922938],'Hamdeok Beach':[33.54323,126.66986],'Seongsan Ilchulbong':[33.458111,126.941516],'Seopjikoji':[33.42404,126.93073],'Jusangjeolli Cliff':[33.23695,126.42496],'Seogwipo Old Town':[33.248,126.563],'Cheonjiyeon Waterfall':[33.24693,126.55453],'Seogwipo Maeil Olle Market':[33.24861,126.56431],'Jeju Dream Tower':[33.485279,126.481461],'Shilla Duty Free Jeju':[33.4867,126.4870],"O'Sulloc Tea Museum":[33.3059,126.2895],'Hyeopjae Beach':[33.39511,126.24028],'Handam Coastal Trail':[33.459229,126.310609],'Jeju Five-Day Market':[33.496927,126.475802],'Dongmun Market':[33.5116,126.5260],'Chilseong-ro':[33.5128,126.5250],'Yongduam Rock':[33.5161,126.5110]};
  const stops=(d.routeStops||[]).map(n=>[n,...(coords[n]||[])]).filter(x=>x.length===3);if(!stops.length)return;
  const ll=stops.map(x=>[x[1],x[2]]);line=L.polyline(ll,{color:d.color,weight:5,dashArray:'10 8'}).addTo(map);
  stops.forEach((s,i)=>{const ic=L.divIcon({className:'',html:`<div class="mapdot" style="background:${d.color}">${i+1}</div>`,iconSize:[32,32],iconAnchor:[16,16]});marks.push(L.marker([s[1],s[2]],{icon:ic}).addTo(map).bindPopup(`<b>${s[0]}</b><div class="stop-actions"><a target="_blank" rel="noopener" href="${nav(s[0])}">Naver</a><a target="_blank" rel="noopener" href="${goog(s[0])}">Google</a></div>`))});
  map.fitBounds(ll,{padding:[28,28],maxZoom:12});setTimeout(()=>map.invalidateSize(),50)
}
function renderDay(){
  const d=DAYS[di];document.documentElement.style.setProperty('--accent',d.color);renderDayStrip();
  $('#daytitle').textContent=`${d.date} ${d.dow} · ${d.line}｜${d.title}`;$('#daysummary').textContent=d.summary;$('#transport').textContent=d.transport;
  $('#weather').innerHTML='<b>天气：</b>'+d.weather;$('#strategy').textContent=d.strategy||'';$('#planB').innerHTML='<b>Plan B：</b>'+(d.planB||'根据天气灵活调整');
  $('#meals').innerHTML=`<div class="meal"><b>🥣 早餐</b>${d.meals.breakfast}</div><div class="meal"><b>🍱 午餐</b>${d.meals.lunch}</div><div class="meal"><b>🍖 晚餐</b>${d.meals.dinner}</div>`;
  const checks=saved('checks',{});$('#timeline').innerHTML=d.schedule.map((x,i)=>{const key=`d${di}-${i}`,done=!!checks[key];return `<div class="trow ${done?'done':''}"><div class="time">${x[0]}</div><div class="event"><div class="eventhead"><b>${x[1]}</b><label class="arrived"><input type="checkbox" data-arrive="${key}" ${done?'checked':''}> 已完成</label></div>${x[2]}<span class="tag">${x[3]}</span><div class="stop-actions"><a target="_blank" rel="noopener" href="${nav(x[1])}">Naver</a><a target="_blank" rel="noopener" href="${goog(x[1])}">Google</a></div></div></div>`}).join('');
  $$('[data-arrive]').forEach(c=>c.onchange=()=>{const s=saved('checks',{});s[c.dataset.arrive]=c.checked;put('checks',s);renderDay()});
  $('#restaurants').innerHTML=d.restaurants.map(r=>`<div class="rest"><b>${r.name}</b><small>${r.kr}</small><small>${r.why}</small><div class="stop-actions"><a target="_blank" rel="noopener" href="${nav(r.kr)}">Naver</a><a target="_blank" rel="noopener" href="${goog(r.kr)}">Google</a></div></div>`).join('');
  $('#dayShopping').innerHTML=d.shopping.map(x=>`<span class="pill">${x}</span>`).join('');$('#routeBtn').href=route(d.routeStops||[]);
  renderMap();renderProgress()
}
function renderProgress(){const checks=saved('checks',{}),d=DAYS[di],total=d.schedule.length,done=d.schedule.filter((_,i)=>checks[`d${di}-${i}`]).length,pct=total?Math.round(done/total*100):0;$('#progress').innerHTML=`<div class="progressline"><div style="width:${pct}%"></div></div><span>${done}/${total} 项已完成 · ${pct}%</span>`}

function renderPrep(){
  let idx=0;const sp=saved('prep',{});$('#prepList').innerHTML=PREP.map(p=>`<div class="prep-step"><h3>${p.when}</h3>${p.items.map(it=>{const id=idx++;return `<label class="check"><input type="checkbox" data-check="${id}" ${sp[id]?'checked':''}><span>${it}</span></label>`}).join('')}</div>`).join('');
  $$('[data-check]').forEach(c=>c.onchange=()=>{const s=saved('prep',{});s[c.dataset.check]=c.checked;put('prep',s)})
}
$('#resetPrep').onclick=()=>{localStorage.removeItem(STORE+'-prep');renderPrep()}

function renderFood(){$('#foodAll').innerHTML=DAYS.map((d,i)=>`<div class="card" style="border-left:5px solid ${d.color}"><h3>Day ${i+1} · ${d.date} ${d.line}</h3><div class="meals"><div class="meal"><b>早餐</b>${d.meals.breakfast}</div><div class="meal"><b>午餐</b>${d.meals.lunch}</div><div class="meal"><b>晚餐</b>${d.meals.dinner}</div></div></div>`).join('')}
function renderShops(){
  $('#shops').innerHTML=SHOPS.map(s=>`<div class="shop"><h3>${s.name}</h3><div class="best">${s.best}</div><small>${s.hours}</small><p>${s.note}</p><div class="actions"><a class="btn" target="_blank" rel="noopener" href="${nav(s.kr)}">Naver</a><a class="btn" target="_blank" rel="noopener" href="${goog(s.kr)}">Google</a></div></div>`).join('');
  $('#gifts').innerHTML=GIFTS.map(x=>`<span class="pill">${x}</span>`).join('');
  const s=saved('shopping',{});$('#shoppingChecklist').innerHTML=(DATA.shoppingChecklist||[]).map((c,ci)=>`<div class="shopcheck"><h3>${c.category}</h3>${c.items.map((it,ii)=>{const k=`${ci}-${ii}`;return `<label class="check"><input type="checkbox" data-shop="${k}" ${s[k]?'checked':''}><span>${it}</span></label>`}).join('')}</div>`).join('');
  $$('[data-shop]').forEach(c=>c.onchange=()=>{const x=saved('shopping',{});x[c.dataset.shop]=c.checked;put('shopping',x)})
}
function renderToday(){
  const real=todayIndex(),d=DAYS[real];$('#todayCard').innerHTML=`<div class="todaybig">Day ${real+1} · ${d.date}</div><b>${d.title}</b><p>${d.summary}</p><button class="primary" id="todayGo">打开今天行程</button>`;$('#todayGo').onclick=()=>{di=real;localStorage.setItem('jeju-day',di);showSection('days');renderDay()}
}
function renderTravelers(){
  $('#travelers').innerHTML=DATA.travelers.map(t=>`<div class="traveler"><div class="travelername">${t.name}</div><div><b>抵达</b> ${t.arrival}</div><div><b>返程</b> ${t.departure}</div><p>${t.note}</p></div>`).join('');
}
function renderBudget(){
  const b=saved('budget',{transport:0,food:0,tickets:0,shopping:0,other:0}),labels={transport:'交通',food:'餐饮',tickets:'门票/体验',shopping:'购物',other:'其他'},total=Object.values(b).reduce((a,v)=>a+Number(v||0),0),limit=DATA.app.budgetDefault;
  $('#budget').innerHTML=`<div class="budgettotal"><b>₩${total.toLocaleString()}</b><span>/ ₩${limit.toLocaleString()}</span></div>${Object.entries(labels).map(([k,l])=>`<label class="budgetrow"><span>${l}</span><input inputmode="numeric" type="number" min="0" value="${b[k]||0}" data-budget="${k}"></label>`).join('')}<button class="secondary" id="clearBudget">清空预算</button>`;
  $$('[data-budget]').forEach(i=>i.onchange=()=>{const s=saved('budget',{});s[i.dataset.budget]=Number(i.value||0);put('budget',s);renderBudget()});$('#clearBudget').onclick=()=>{localStorage.removeItem(STORE+'-budget');renderBudget()}
}
async function loadWeather(){
  const box=$('#liveWeather');if(!box)return;box.innerHTML='<span class="muted">正在获取济州市天气…</span>';
  try{
    const u=`https://api.open-meteo.com/v1/forecast?latitude=${DATA.weather.lat}&longitude=${DATA.weather.lon}&current=temperature_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FSeoul&forecast_days=4`;
    const j=await fetch(u).then(r=>r.json()),c=j.current;
    const code=c.weather_code, map={0:'☀️ 晴',1:'🌤️ 基本晴朗',2:'⛅ 局部多云',3:'☁️ 阴',45:'🌫️ 雾',48:'🌫️ 雾',51:'🌦️ 小毛毛雨',53:'🌦️ 毛毛雨',55:'🌧️ 毛毛雨',61:'🌧️ 小雨',63:'🌧️ 中雨',65:'🌧️ 大雨',80:'🌦️ 阵雨',81:'🌧️ 阵雨',82:'🌧️ 强阵雨',95:'⛈️ 雷雨',96:'⛈️ 雷雨',99:'⛈️ 雷雨'};
    box.innerHTML=`<div class="weatherlive"><div class="weatherbig">${map[code]||'🌤️ 天气'} <b>${Math.round(c.temperature_2m)}°C</b></div><div>体感 ${Math.round(c.apparent_temperature)}°C · 风 ${Math.round(c.wind_speed_10m)} km/h · 降水 ${c.precipitation} mm</div></div>`;
    const daily=j.daily;$('#weatherForecast').innerHTML=daily.time.map((date,i)=>`<div class="forecast"><b>${date.slice(5).replace('-','/')}</b><span>${map[daily.weather_code[i]]||'天气'}</span><span>${Math.round(daily.temperature_2m_min[i])}–${Math.round(daily.temperature_2m_max[i])}°C</span><span>降水概率 ${daily.precipitation_probability_max[i]}%</span><span>最大风 ${Math.round(daily.wind_speed_10m_max[i])} km/h</span></div>`).join('');
  }catch(e){box.innerHTML='<span class="muted">天气服务暂时不可用。请以韩国气象厅/景区官方通知为准。</span>'}
}
function renderShare(){
  $('#shareBtn').onclick=async()=>{const url=location.href,txt='济州岛旅行 2026｜9/24–9/27';try{if(navigator.share)await navigator.share({title:txt,text:'我们这次的济州岛旅行计划',url});else{await navigator.clipboard.writeText(url);$('#shareStatus').textContent='链接已复制，可以发给朋友。'}}catch(e){}};
}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;const b=$('#installBtn');if(b)b.hidden=false});
$('#installBtn')?.addEventListener('click',async()=>{if(!deferredInstall)return;deferredInstall.prompt();deferredInstall=null});
$('#refreshWeather')?.addEventListener('click',loadWeather);

$('#sourceList').innerHTML=SOURCES.map(s=>`<a target="_blank" rel="noopener" href="${s[1]}">↗ ${s[0]}</a>`).join('');
renderPrep();renderFood();renderShops();renderToday();renderBudget();renderTravelers();renderShare();renderDay();loadWeather();
if(new URLSearchParams(location.search).has('today')){$('#quickToday')?.click()}
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
