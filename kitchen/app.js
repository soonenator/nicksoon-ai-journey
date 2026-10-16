(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeUrl = value => {try {const url = new URL(value); return url.protocol === 'https:' ? url.href : '';} catch {return '';}};
  const data = window.RECIPE_DATA;
  const recipes = data.recipes;
  const engine = window.KitchenRecommendations;
  const STORAGE_KEY = 'nicks-kitchen.v1';
  const knownIds = new Set(recipes.map(r=>r.id));
  let stored = {}, storageWorks = true;
  try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch { storageWorks = false; }
  const validSet = value => new Set(Array.isArray(value) ? value.filter(id=>knownIds.has(id)) : []);
  const initialCooked = recipes.filter(r=>r.cooked).map(r=>r.id);
  const state = {query:'',view:'all',time:0,tool:'',ingredients:new Set(),easy:false,currentId:'',mode:'similar',sort:'recommended',liked:validSet(stored.liked),queued:validSet(stored.queued),cooked:validSet([...initialCooked,...(Array.isArray(stored.cooked)?stored.cooked:[])])};
  let currentResults = [], pickIndex = 0, detailId = null, lastFocused = null, toastTimer;
  function save() {
    try {localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,liked:[...state.liked],queued:[...state.queued],cooked:[...state.cooked]}));} catch {storageWorks=false;}
    if (!storageWorks) $('storage-note').textContent = 'Browser storage is unavailable. Marks last for this visit; download a backup to keep them.';
  }
  function toast(text) {$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
  function recipeImage(recipe) {
    const entry=window.RECIPE_IMAGES?.[recipe.id];
    return entry && /^assets\/recipes\/[A-Za-z0-9_-]+\.webp$/.test(entry.sitePath) && safeUrl(entry.sourceUrl) && safeUrl(entry.sourceUrl) === safeUrl(recipe.instagramUrl) && !recipe.cooked ? entry : null;
  }
  function foodArt(recipe, context='card') {
    const photo=recipeImage(recipe),card=context==='card';
    const placeholder=`<div class="photo-placeholder"><svg viewBox="0 0 90 65" aria-hidden="true"><path d="M10 43h70M17 43a28 28 0 0 1 56 0M42 12h6M45 12v4M14 51h62"/><path d="m66 10 6-6m2 14 9-2"/></svg><strong>${recipe.cooked?'From your kitchen':'Recipe photo'}</strong><span>${recipe.cooked?'No photo saved for this version':'Photo not available yet'}</span></div>`;
    const image=photo?`<img class="recipe-photo" src="${esc(photo.sitePath)}" alt="${esc(photo.alt||recipe.title+' from '+photo.creator)}" width="${Number(photo.width)||720}" height="${Number(photo.height)||900}" loading="${card?'lazy':'eager'}" decoding="async">`:'';
    const visual=card?`<button class="photo-open" data-open="${esc(recipe.id)}" aria-label="Open ${esc(recipe.title)}">${placeholder}${image}</button>`:placeholder+image;
    return `<div class="recipe-media ${photo?'has-photo':''}">${visual}${photo?`<a class="photo-credit" href="${esc(safeUrl(photo.sourceUrl))}" target="_blank" rel="noopener noreferrer" aria-label="Photo source: ${esc(photo.creator)} on Instagram">${esc(photo.attribution||'Photo: '+photo.creator)} ↗</a>`:''}</div>`;
  }
  document.addEventListener('error',event=>{
    if(!event.target.matches?.('.recipe-photo'))return;
    const media=event.target.closest('.recipe-media');
    event.target.hidden=true;media?.classList.remove('has-photo');
    const label=media?.querySelector('.photo-placeholder span');
    if(label)label.textContent='Photo unavailable · original post linked below';
  },true);
  const timeText = recipe => recipe.timeMinutes ? `${recipe.timeKind==='source'?'':'~'}${recipe.timeMinutes} min` : 'Time not recorded';
  const toolName = tool => tool==='Pressure cooker'?'Instant Pot / pressure cooker':tool;
  function card(item,index) {
    const r=item.recipe,liked=state.liked.has(r.id),queued=state.queued.has(r.id),cooked=state.cooked.has(r.id);
    const source=safeUrl(r.instagramUrl);
    const status=r.cooked?'Cooked before':cooked?'Marked cooked':'Saved inspiration';
    return `<article class="recipe-card" data-recipe="${esc(r.id)}"><div class="card-visual palette-${index%6}">${foodArt(r)}<span class="card-category">${esc(r.categoryTags[0]||'Recipe idea')}</span><button class="heart-button ${liked?'is-liked':''}" data-like="${esc(r.id)}" aria-label="${liked?'Unlike':'Like'} ${esc(r.title)}" aria-pressed="${liked}">${liked?'♥':'♡'}</button></div><div class="card-body"><p class="card-meta"><span class="status-dot ${cooked?'cooked':''}"></span>${status}<span aria-hidden="true">·</span>${esc(timeText(r))}</p><h3 class="card-title"><button class="title-button" data-open="${esc(r.id)}">${esc(r.title)}</button></h3><p class="card-summary">${esc(r.summary)}</p><div class="card-tags">${r.ingredients.filter(x=>!['soy sauce','sugar','butter','garlic'].includes(x)).slice(0,3).map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="card-bottom">${source?`<a class="source-link" href="${esc(source)}" target="_blank" rel="noopener noreferrer" aria-label="Original Instagram video for ${esc(r.title)}">↗ Original video</a>`:`<button class="source-link plain-button" data-open="${esc(r.id)}">See cooking notes ↗</button>`}<button class="queue-button ${queued?'queued':''}" data-queue="${esc(r.id)}" aria-label="${queued?'Remove':'Add'} ${esc(r.title)} ${queued?'from':'to'} try next" aria-pressed="${queued}">${queued?'✓ Saved':'+ Try next'}</button></div></div><p class="match-reason">${esc(item.reason)}</p></article>`;
  }
  function render() {
    const focused=document.activeElement;
    const focusKey=['like','queue','view'].find(key=>focused?.dataset?.[key]);
    const focusValue=focusKey?focused.dataset[focusKey]:null;
    currentResults=engine.filterAndRank(recipes,state);
    $('recipe-grid').innerHTML=currentResults.map(card).join('');
    const current=recipes.find(r=>r.id===state.currentId);
    $('result-count').textContent=`${currentResults.length} ${currentResults.length===1?'recipe':'recipes'}${current?` ${state.mode==='pairing'?'to pair with':'inspired by'} ${current.title}`:' in your recipe box'}`;
    const empty=!currentResults.length;$('empty-state').hidden=!empty;
    $('empty-title').textContent=state.view==='liked'?'Your favorites start with a heart.':state.view==='queue'?'Make a little list for later.':current&&state.mode==='pairing'?'No pairing in the box just yet.':'Nothing quite matches yet.';
    $('empty-description').textContent=state.view==='liked'?'Tap a heart on a recipe you like. Your suggestions will use those tastes.':state.view==='queue'?'Tap “Try next” on any recipe to keep it here for your next kitchen adventure.':current&&!['main','side'].includes(current.role)&&state.mode==='pairing'?'The pairing tool works with mains and sides. Try “Something similar” for drinks, desserts, and snacks.':'Try a different ingredient or loosen a filter. Untimed recipes don’t appear under a time limit.';
    $('all-count').textContent=recipes.length;$('liked-count').textContent=state.liked.size;$('queue-count').textContent=state.queued.size;$('cooked-count').textContent=state.cooked.size;
    $('personal-liked').textContent=state.liked.size;$('personal-queued').textContent=state.queued.size;$('personal-cooked').textContent=state.cooked.size;
    document.querySelectorAll('[data-view]').forEach(button=>{const active=button.dataset.view===state.view;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active);});
    document.querySelectorAll('[data-ingredient]').forEach(button=>{const active=state.ingredients.has(button.dataset.ingredient);button.classList.toggle('active',active);button.setAttribute('aria-pressed',active);});
    const filterCount=Number(!!state.query)+Number(!!state.time)+Number(!!state.tool)+Number(state.easy)+state.ingredients.size;
    $('filter-count').textContent=filterCount?`(${filterCount})`:'';
    if(focusKey&&!focused.isConnected){const target=document.querySelector(`[data-${focusKey}="${CSS.escape(focusValue)}"]`);target?.focus({preventScroll:true});}
  }
  function reset() {Object.assign(state,{query:'',view:'all',time:0,tool:'',easy:false,currentId:'',mode:'similar',sort:'recommended'});state.ingredients.clear();$('search').value='';$('time-filter').value='0';$('tool-filter').value='';$('easy-filter').checked=false;$('current-meal').value='';$('match-mode').value='similar';$('sort').value='recommended';pickIndex=0;render();}
  function toggle(kind,id) {
    const set=state[kind];if(!knownIds.has(id))return;
    if(kind==='cooked'&&recipes.find(r=>r.id===id).cooked){toast('This recipe was already confirmed cooked.');return;}
    set.has(id)?set.delete(id):set.add(id);save();render();
    if(detailId===id){renderDetail(recipes.find(r=>r.id===id));const action=kind==='liked'?'like':kind==='queued'?'queue':'cooked';$('recipe-dialog').querySelector(`[data-${action}="${CSS.escape(id)}"]`)?.focus({preventScroll:true});}
    toast(kind==='liked'?(set.has(id)?'Liked. Your suggestions will take the hint.':'Removed from your likes.'):kind==='queued'?(set.has(id)?'Saved for your next kitchen adventure.':'Removed from your try-next list.'):(set.has(id)?'Marked as cooked.':'Cooked mark removed.'));
  }
  function renderDetail(r,picked=false) {
    const liked=state.liked.has(r.id),queued=state.queued.has(r.id),cooked=state.cooked.has(r.id);
    const source=safeUrl(r.instagramUrl),recipeSource=safeUrl(r.recipeUrl);
    $('recipe-detail').innerHTML=`<div class="detail-hero">${foodArt(r,'detail')}</div><div class="detail-content"><p class="eyebrow">${picked?'YOUR NEXT GOOD MEAL':r.cooked?'FROM YOUR OWN ROTATION':'FROM THE RECIPE BOX'}</p><h2 id="dialog-title">${esc(r.title)}</h2><p class="detail-summary">${esc(r.summary)}</p><div class="detail-tags"><span>${r.cooked?'Cooked before':cooked?'Marked cooked on this device':'Saved inspiration · not confirmed cooked'}</span><span>${esc(timeText(r))}${r.timeKind==='estimate'?' · planning estimate':''}</span>${r.lowEffort?'<span>Lower-effort idea</span>':''}</div>${r.timeNote?`<p class="detail-note">${esc(r.timeNote)}</p>`:''}<h3>What’s in the mix</h3><div class="detail-chips">${r.ingredients.map(t=>`<span>${esc(t)}</span>`).join('')}</div><p class="detail-note">Search tags, not a complete ingredient list or allergy guide. Check the original recipe for quantities, all ingredients, and instructions.</p><h3>Tools to have handy</h3><div class="detail-chips">${r.tools.length?r.tools.map(t=>`<span>${esc(toolName(t))}</span>`).join(''):'<span>No special tool tagged</span>'}</div>${r.notes?.length?`<h3>${r.sourceType==='personal-adaptation'||r.sourceType==='cooked-staple'?'Your cooking notes':'A note before you cook'}</h3><div class="personal-note">${r.notes.map(n=>esc(n)).join('\n\n')}</div>`:''}<div class="detail-actions"><button class="button light" data-like="${esc(r.id)}" aria-pressed="${liked}">${liked?'♥ Liked':'♡ Like this'}</button><button class="button light" data-queue="${esc(r.id)}" aria-pressed="${queued}">${queued?'✓ In try next':'+ Save for next'}</button><button class="button light" data-cooked="${esc(r.id)}" aria-pressed="${cooked}" ${r.cooked?'disabled':''}>${cooked?'✓ Cooked before':'I cooked this'}</button></div><div class="detail-links">${source?`<a class="button primary" href="${esc(source)}" target="_blank" rel="noopener noreferrer">Watch original video ↗</a>`:''}${recipeSource?`<a class="button light" href="${esc(recipeSource)}" target="_blank" rel="noopener noreferrer">${esc(r.recipeUrlLabel||'Original recipe')} ↗</a>`:''}${(r.additionalSources||[]).filter(s=>safeUrl(s.url)).map(s=>`<a class="text-link" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}${!source&&!recipeSource?'<p class="detail-note">No matching original link was saved for this meal. These are your cooking notes, rather than a full recipe.</p>':''}</div>${source?`<p class="source-credit">${esc(r.creator)} · Instagram may ask you to sign in. The recipe caption and video are on the same original post.</p>`:''}<p class="source-credit">${esc(r.sourceStatus||'')}${recipeImage(r)?' · Image from the linked original Instagram post; it shows the creator’s recipe.':' · No photo is saved for this version.'}</p>${picked?'<button class="text-link" id="pick-again">Another idea, please ↻</button>':''}</div>`;
  }
  function openRecipe(id,picked=false) {const recipe=recipes.find(r=>r.id===id);if(!recipe)return;detailId=id;if(!$('recipe-dialog').open)lastFocused=document.activeElement;renderDetail(recipe,picked);if(!$('recipe-dialog').open)$('recipe-dialog').showModal();$('recipe-dialog').scrollTop=0;}
  function pick() {
    const contextual=state.currentId&&state.mode==='pairing';
    const choices=currentResults.filter(x=>contextual?true:x.recipe.role==='main').filter(x=>!x.recipe.incomplete);
    if(!choices.length){toast('No dinner matches these filters. Try a reset or a different ingredient.');$('recipe-box').scrollIntoView({behavior:'smooth'});return;}
    const pool=choices.slice(0,12);openRecipe(pool[pickIndex%pool.length].recipe.id,true);pickIndex++;
  }
  function info(type) {
    $('info-body').innerHTML=type==='data'?`<p>This box brings together ${data.savedRecipeCount} saved Instagram recipes and ${recipes.filter(r=>r.cooked).length} meals cooked before. A saved post is inspiration, not a rating or proof that you cooked it.</p><p>The original videos and recipe captions stay with their creators. Food photos and video stills are from the linked original Instagram posts, with creator credits. Personal versions without a photo use a placeholder. This site contains brief summaries, search tags, and recipe-specific cooking adjustments.</p><p>Recurring ingredients and tools reflect cooking history. Library counts show how many recipes carry each tag, not how often you use an ingredient or tool. Tags aren’t full shopping lists.</p><p>Unrecorded timings are left unknown or clearly labeled as planning estimates. Estimates can vary with prep, equipment, portions and marination. Follow the source before cooking.</p><p>The recipe collection and imported cooking notes are public. New likes, try-next saves and cooked marks live only in this browser. There’s no account, automatic sync, analytics, AI call, or live pantry connection.</p><p>Collection prepared ${esc(data.updatedAt)}. Opening an original link takes you to that creator’s site.</p>`:'<p>Suggestions use simple matching in this browser. No ChatGPT, AI service, API key, or paid model is involved.</p><ul><li>Start with familiar rice-based meals, saucy dishes, and pressure-cooker or rice-cooker options.</li><li>Like recipes to boost other dishes with similar ingredients and categories.</li><li>Select a current dish for similar ideas, or to pair a main with a side.</li><li>Time, tool, ingredient and effort filters narrow the list first. Ingredient filters match at least one selected tag.</li><li>“Pick my dinner” cycles through the best matching mains. It skips desserts, drinks, snacks and incomplete recipes.</li></ul><p>All matching is deterministic. “For you” is a useful starting point, not a promise that a recipe will suit your tastes or dietary needs.</p>';
    lastFocused=document.activeElement;$('info-dialog').showModal();
  }
  function initKitchen() {
    const count=field=>{const values=new Map();recipes.forEach(r=>[...new Set(r[field])].forEach(t=>values.set(t,(values.get(t)||0)+1)));return [...values].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));};
    const ingredients=count('ingredients'),tools=count('tools');
    $('ingredient-stats').innerHTML=ingredients.slice(0,6).map(([name,total])=>`<button class="stat-row" data-kitchen-ingredient="${esc(engine.normalize(name))}"><span>${esc(name)}</span><progress class="stat-bar" max="${ingredients[0][1]}" value="${total}" aria-label="${total} recipes"></progress><span class="stat-count">${total} recipes</span></button>`).join('');
    $('tool-stats').innerHTML=tools.slice(0,8).map(([name,total])=>`<button class="tool-stat" data-kitchen-tool="${esc(name)}">${esc(name==='Pressure cooker'?'Instant Pot':name)}<span>${total}</span></button>`).join('');
    $('tool-filter').innerHTML='<option value="">Any kitchen tool</option>'+tools.map(([name])=>`<option value="${esc(name)}">${esc(toolName(name))}</option>`).join('');
    const common=['rice','chicken','pork','tofu','egg','spinach','zucchini','carrot','udon','beef','cabbage','mushroom'];
    $('ingredient-chips').innerHTML=common.map(name=>`<button class="chip" data-ingredient="${name}" aria-pressed="false">${name}</button>`).join('');
    const profile=data.profile||{};
    const recurring=profile.recurringIngredients?.map(x=>esc(x.name)).join(', ');
    const used=profile.usedTools?.map(x=>esc(x.displayName||x.name)).join(', ');
    if(recurring)$('ingredient-stats').insertAdjacentHTML('beforebegin',`<p class="confirmed-habit"><strong>In your cooking:</strong> ${recurring}<br><span>Below: occurrences in saved recipes</span></p>`);
    if(used)$('tool-stats').insertAdjacentHTML('beforebegin',`<p class="confirmed-habit"><strong>You’ve used:</strong> ${used}<br><span>Below: tools tagged in saved recipes</span></p>`);
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.open)openRecipe(b.dataset.open);
    else if(b.dataset.like)toggle('liked',b.dataset.like);
    else if(b.dataset.queue)toggle('queued',b.dataset.queue);
    else if(b.dataset.cooked)toggle('cooked',b.dataset.cooked);
    else if(b.dataset.view){state.view=b.dataset.view;render();}
    else if(b.dataset.ingredient){const i=b.dataset.ingredient;state.ingredients.has(i)?state.ingredients.delete(i):state.ingredients.add(i);pickIndex=0;render();}
    else if(b.dataset.kitchenIngredient){reset();state.ingredients.add(b.dataset.kitchenIngredient);render();$('recipe-box').scrollIntoView({behavior:'smooth'});}
    else if(b.dataset.kitchenTool){reset();state.tool=b.dataset.kitchenTool;$('tool-filter').value=state.tool;render();$('recipe-box').scrollIntoView({behavior:'smooth'});}
    else if(b.id==='pick-again')pick();
  });
  const bind=(id,event,key,convert=x=>x)=>$(id).addEventListener(event,e=>{state[key]=convert(e.target.type==='checkbox'?e.target.checked:e.target.value);pickIndex=0;render();});
  bind('search','input','query');bind('time-filter','change','time',Number);bind('tool-filter','change','tool');bind('easy-filter','change','easy');bind('current-meal','change','currentId');bind('match-mode','change','mode');bind('sort','change','sort');
  $('clear-filters').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);$('hero-pick').addEventListener('click',pick);$('pick-button').addEventListener('click',pick);
  $('close-recipe').addEventListener('click',()=>$('recipe-dialog').close());$('close-info').addEventListener('click',()=>$('info-dialog').close());
  for(const id of ['recipe-dialog','info-dialog']){$(id).addEventListener('click',e=>{if(e.target===$(id)){const rect=$(id).getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)$(id).close();}});$(id).addEventListener('close',()=>{if(id==='recipe-dialog')detailId=null;if(lastFocused?.isConnected)lastFocused.focus();});}
  $('how-it-works').addEventListener('click',()=>info('how'));$('about-data').addEventListener('click',()=>info('data'));
  $('export-preferences').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({site:"Nick's Kitchen",exportedAt:new Date().toISOString(),liked:[...state.liked],tryNext:[...state.queued],cooked:[...state.cooked],recipes:recipes.filter(r=>state.liked.has(r.id)||state.queued.has(r.id)||state.cooked.has(r.id)).map(r=>({id:r.id,title:r.title,source:r.instagramUrl||null}))},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='nicks-kitchen-marks.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your recipe marks have been downloaded.');});
  $('current-meal').innerHTML='<option value="">Choose your current dish</option>'+recipes.slice().sort((a,b)=>a.title.localeCompare(b.title)).map(r=>`<option value="${esc(r.id)}">${esc(r.title)}</option>`).join('');
  $('total-recipes').textContent=recipes.length;$('total-sources').textContent=new Set(recipes.map(r=>r.instagramUrl).filter(Boolean)).size;
  if(matchMedia('(max-width:760px)').matches)$('filter-details').open=false;
  const featured=recipes.find(r=>r.id===window.RECIPE_IMAGE_HERO && recipeImage(r))||recipes.find(r=>recipeImage(r));
  if(featured)$('hero-image').innerHTML=foodArt(featured,'hero');
  initKitchen();save();render();
  if(location.hash.startsWith('#recipe-'))openRecipe(decodeURIComponent(location.hash.slice(8)));
})();
