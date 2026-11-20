/* Isolated examples: never passed to Fallo Confiable, saved votes or real Hinchada. */
(() => {
  'use strict';
  let pool=null,progress=null,status='idle',epoch=0,lastAttempt=0;
  const roots=()=>({home:document.querySelector('#homeDemo'),fallos:document.querySelector('#demoFallos'),hinchada:document.querySelector('#demoHinchada')});
  function activeExamples(data,count){
    if(!Number.isSafeInteger(count)||count<0)throw Error('Invalid real count');
    return data.examples.slice(Math.min(data.total_examples,Math.floor(count/data.real_per_example)));
  }
  function rowsFor(data,examples,kind,category){
    return data.ensembles.filter(e=>!category||e.category===category).map(e=>{
      const selected=examples.filter(x=>(kind==='hinchada'?x.primary_slug:x.ensemble_slug)===e.slug);
      return {...e,count:selected.length,average:selected.length?selected.reduce((n,x)=>n+x.score,0)/selected.length:null,examples:selected};
    }).filter(e=>e.count).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'es'));
  }
  function render(){
    const r=roots();if(!r.home||!r.fallos||!r.hinchada)return;
    if(!pool||!progress){
      r.home.innerHTML=status==='error'?'<p class="tiny-muted">Los ejemplos no están disponibles en este momento.</p>':'';
      r.fallos.innerHTML=r.hinchada.innerHTML='';return;
    }
    const active=activeExamples(pool,progress.new_real_fallos);
    for(const root of Object.values(r))root.classList.toggle('hidden',!active.length);
    if(!active.length){for(const root of Object.values(r))root.innerHTML='';return}
    const intro=`<span class="badge warn">Datos de ejemplo · Simulados</span><h2>Así se ve la comunidad</h2><p>Puntajes y apoyos inventados para conocer la app. No evalúan actuaciones reales ni representan usuarios o hinchas reales.</p><p class="demo-progress" role="status">${active.length} de 200 ejemplos activos · ${progress.new_real_fallos} Fallos reales nuevos. Se retira 1 ejemplo por cada 2 reales.</p>${status==='error'?'<p class="warning-inline">No pudimos actualizar el contador. Se muestra la última cantidad confirmada.</p>':''}`;
    const note='<p class="tiny-muted">La distribución de cantidades se inspira en trayectoria y resultados previos; no es una medición de popularidad. Los puntajes son inventados y no cuentan para Fallo Confiable.</p><details class="demo-method"><summary>Criterio y fuentes de los ejemplos</summary><p>'+esc(pool.method)+'</p><a href="/DEMO_COMMUNITY.md" target="_blank" rel="noopener">Ver metodología</a></details>';
    r.home.innerHTML=`<div class="demo-panel">${intro}<button type="button" class="border-btn" id="openDemoCommunity">Ver comunidad de ejemplo</button></div>`;
    const btn=document.querySelector('#openDemoCommunity');if(btn)btn.onclick=()=>{ui.fallosTab='community';showScreen('fallos');renderFallos();r.fallos.scrollIntoView({behavior:'smooth',block:'start'})};
    for(const kind of ['fallos','hinchada']){
      const root=r[kind],catId=kind==='fallos'?ui.fallosCat:ui.hinchadaCat;
      const category=catId==='all'?null:state.categories.find(c=>c.id===catId)?.name;
      const groups=rowsFor(pool,active,kind,category);
      root.classList.toggle('hidden',!active.length||(kind==='fallos'&&ui.fallosTab!=='community'));
      root.innerHTML=`<section class="demo-panel" aria-label="${kind==='fallos'?'Fallos de ejemplo':'Hinchada de ejemplo'}">${intro}<h3>${kind==='fallos'?'Puntajes de demostración':'Hinchada de demostración'}</h3>${note}<div class="demo-grid">${groups.map(e=>`<article class="demo-result"><span class="demo-label">SIMULADO</span><h4>${esc(e.name)}</h4><p class="list-meta">${esc(e.category==='Comparsas'?'Lubolos':e.category)}</p><strong class="demo-number">${e.count}</strong><span>${kind==='fallos'?' votos de ejemplo':' apoyos simulados'}</span>${kind==='fallos'?`<p>Promedio de ejemplo: <strong>${falloScore(e.average)}</strong></p><details><summary>Ver los puntajes de ejemplo</summary><ul>${e.examples.map(x=>`<li>${esc(x.id)} · ${falloScore(x.score)}</li>`).join('')}</ul></details>`:''}</article>`).join('')}</div>${!groups.length?'<p>No quedan ejemplos en esta categoría.</p>':''}</section>`;
    }
  }
  async function refresh(force=false){
    if(!session?.user||stateUserId!==session.user.id||status==='loading'||(!force&&Date.now()-lastAttempt<60000))return;
    const current=epoch,user=session.user.id;lastAttempt=Date.now();status='loading';
    try{
      const [data,result]=await Promise.all([pool?Promise.resolve(pool):fetch('/community-examples.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Examples unavailable');return r.json()}),request('/rest/v1/rpc/get_demo_community_progress',{method:'POST',body:'{}'})]);
      if(current!==epoch||session?.user?.id!==user)return;
      if(data.campaign!=='carnaval-2027-examples-v1'||data.examples.length!==200||data.real_per_example!==2||result?.campaign!==data.campaign||!Number.isSafeInteger(result.new_real_fallos)||result.new_real_fallos<0||result.remaining_examples!==Math.max(0,200-Math.floor(result.new_real_fallos/2)))throw Error('Invalid demo progress');
      pool=data;progress=result;status='ready';
    }catch{if(current!==epoch||session?.user?.id!==user)return;status='error'}
    render();
  }
  function reset(){epoch++;progress=null;status='idle';lastAttempt=0;for(const root of Object.values(roots()))if(root)root.innerHTML=''}
  window.CEJDemo={render,refresh,reset,activeExamples,rowsFor};
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
  setInterval(()=>{if(document.visibilityState==='visible'&&['inicio','fallos','hinchada'].includes(ui.screen))refresh()},60000);
  render();refresh();
})();
