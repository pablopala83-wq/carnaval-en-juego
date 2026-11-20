const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname,pool=JSON.parse(fs.readFileSync(root+'/community-examples.json'));
const elements=new Map();function el(s){if(!elements.has(s))elements.set(s,{innerHTML:'',hidden:false,classList:{toggle(n,v){if(n==='hidden')el(s).hidden=v}},scrollIntoView(){}});return elements.get(s)}
let real=0,invalid=false,rejectRequest=false;
const ctx=vm.createContext({window:{},document:{querySelector:el,addEventListener(){},visibilityState:'visible'},setInterval(){},Date,Number,Math,Error,Promise,Set,session:null,stateUserId:null,state:{categories:pool.ensembles.map((e,i)=>({id:e.category,name:e.category}))},ui:{screen:'fallos',fallosTab:'community',fallosCat:'all',hinchadaCat:'all'},esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;'),falloScore:n=>n.toFixed(2),showScreen(){},renderFallos(){},fetch:async()=>({ok:true,json:async()=>pool}),request:async()=>{if(rejectRequest)throw Error('offline');return {campaign:pool.campaign,new_real_fallos:real,remaining_examples:invalid?200:Math.max(0,200-Math.floor(real/2))}}});
vm.runInContext(fs.readFileSync(root+'/community-demo.js','utf8'),ctx);const demo=ctx.window.CEJDemo;
(async()=>{
 assert.equal(pool.examples.length,200);assert.equal(new Set(pool.examples.map(x=>x.id)).size,200);assert(pool.examples.every(x=>x.is_example&&x.id.startsWith('ejemplo-')&&x.score>=1&&x.score<=10));assert.equal(pool.ensembles.length,39);
 for(const [n,remaining]of [[0,200],[1,200],[2,199],[3,199],[20,190],[200,100],[398,1],[399,1],[400,0],[1000,0]])assert.equal(demo.activeExamples(pool,n).length,remaining);
 assert.throws(()=>demo.activeExamples(pool,-1));assert.throws(()=>demo.activeExamples(pool,1.5));
 const first=demo.activeExamples(pool,0),next=demo.activeExamples(pool,2);assert(!next.some(x=>x.id===first[0].id));assert(next.every(x=>first.includes(x)));
 assert.equal(demo.rowsFor(pool,first,'fallos',null).reduce((n,e)=>n+e.count,0),200);assert.equal(demo.rowsFor(pool,first,'hinchada',null).reduce((n,e)=>n+e.count,0),200);
 for(const category of Object.keys(pool.category_example_budgets))assert.equal(demo.rowsFor(pool,first,'fallos',category).reduce((n,e)=>n+e.count,0),pool.category_example_budgets[category]);
 const named=n=>pool.ensembles.find(e=>e.name===n);assert(named('Patos Cabreros').example_support>named('La Justa').example_support);assert(named('Asaltantes con Patente').example_votes>named('La Justa').example_votes);assert(named('Yambo Kenia').example_support>named('La Nueva Escuela').example_support);
 ctx.session={user:{id:'qa-user'}};ctx.stateUserId='qa-user';await demo.refresh(true);assert.match(el('#demoFallos').innerHTML,/200 de 200 ejemplos activos/);assert.match(el('#demoHinchada').innerHTML,/apoyos simulados/);assert.match(el('#demoFallos').innerHTML,/No evalúan actuaciones reales/);
 real=2;await demo.refresh(true);assert.match(el('#demoFallos').innerHTML,/199 de 200/);
 real=4;invalid=true;await demo.refresh(true);assert.match(el('#demoFallos').innerHTML,/199 de 200/);assert.match(el('#demoFallos').innerHTML,/última cantidad confirmada/);
 invalid=false;real=400;await demo.refresh(true);assert(el('#demoFallos').hidden);assert.equal(el('#demoFallos').innerHTML,'');assert.equal(el('#demoHinchada').innerHTML,'');assert.equal(el('#homeDemo').innerHTML,'');demo.reset();
 const before=fs.readFileSync(root+'/index.html','utf8');for(const [,code]of before.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(code);
 console.log('PASS: 200 marked examples/39 ensembles; history-weighted counts; independent invented scores; retirement 0/1/2/3/20/200/398/399/400/1000; same subset across category filters; bad/offline counter cannot reset to 200; all examples hide at 400; real ranking inputs stay separate.');
})().catch(e=>{console.error(e);process.exit(1)});
