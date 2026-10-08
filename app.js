(() => {
  'use strict';
  const data = window.ARCADE_DATA;
  const $ = id => document.getElementById(id);
  const state = { month: 'all', topic: 'all', type: 'all', query: '', view: 'grid' };
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shortDate = date => new Intl.DateTimeFormat('en', {month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
  const longDate = date => new Intl.DateTimeFormat('en', {year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
  let returnFocus = null;
  function selectEntries(s = state) {
    const query = s.query.trim().toLocaleLowerCase();
    return data.entries.filter(e => (s.month === 'all' || e.date.startsWith(s.month)) && (s.topic === 'all' || e.themes.includes(s.topic)) && (s.type === 'all' || e.type === s.type) && (!query || [e.title,e.description,e.format,e.status,e.type,...e.themes].join(' ').toLocaleLowerCase().includes(query))).sort((a,b) => s.view === 'timeline' ? a.date.localeCompare(b.date) || a.number.localeCompare(b.number) : b.date.localeCompare(a.date) || b.number.localeCompare(a.number));
  }
  function card(e) {
    const image = e.id === 'porygongpt';
    return `<article class="entry-card ${e.type==='Project'?'project':''}" aria-labelledby="title-${esc(e.id)}"><div class="card-top ${image?'has-image':''}"><span class="card-number" aria-hidden="true">${esc(e.number)}</span><span class="card-format">${esc(e.format)}</span>${image?'<img class="card-top-image" src="assets/companion.png" width="155" height="162" alt="" loading="lazy">':''}</div><div class="card-body"><div class="card-kicker"><span class="entry-type">${esc(e.type)}</span><time datetime="${esc(e.date)}">${shortDate(e.date)}</time></div><h3 id="title-${esc(e.id)}">${esc(e.title)}</h3><p class="card-description">${esc(e.description)}</p><div class="card-status ${e.publicUrl?'public-status':''}"><span class="status-mark" aria-hidden="true"></span>${esc(e.status)}</div></div><button class="open-entry" type="button" data-open="${esc(e.id)}" aria-label="View details: ${esc(e.title)}">View entry <span aria-hidden="true">+</span></button></article>`;
  }
  function renderMonths() {
    $('month-nav').innerHTML = [{id:'all',label:'All year'},...data.months].map(m => {const count=data.entries.filter(e=>m.id==='all'||e.date.startsWith(m.id)).length;return `<button type="button" class="month-button" data-month="${m.id}" aria-pressed="${state.month===m.id}" aria-label="${esc(m.label)}, ${count} entries">${m.id==='all'?'ALL YEAR':esc(m.label.slice(0,3).toUpperCase())}<span class="month-total">${count}</span></button>`;}).join('');
  }
  function render() {
    const entries = selectEntries();
    const filtered = state.month!=='all'||state.topic!=='all'||state.type!=='all'||state.query.trim();
    $('results-count').textContent = `${entries.length} of ${data.entries.length} entries${state.month!=='all'?' · '+data.months.find(m=>m.id===state.month).label:''}`;
    $('clear-filters').hidden = !filtered;
    $('empty-state').hidden = !!entries.length;
    $('results').className = state.view==='grid'?'card-grid':'timeline-results';
    $('sort-caption').textContent = state.view==='grid'?'NEWEST FIRST':'JANUARY TO OCTOBER';
    $('grid-view').setAttribute('aria-pressed',String(state.view==='grid'));
    $('timeline-view').setAttribute('aria-pressed',String(state.view==='timeline'));
    if(state.view==='grid') $('results').innerHTML=entries.map(card).join('');
    else $('results').innerHTML=data.months.map(m=>{const group=entries.filter(e=>e.date.startsWith(m.id));return group.length?`<section class="timeline-section" aria-labelledby="month-${m.id}"><header class="timeline-label"><h3 id="month-${m.id}">${esc(m.label)}</h3><p>${group.length} ${group.length===1?'ENTRY':'ENTRIES'} / 2026</p></header><div class="timeline-cards">${group.map(card).join('')}</div></section>`:'';}).join('');
    document.querySelectorAll('[data-month]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.month===state.month)));
  }
  function resetFilters(){state.month='all';state.topic='all';state.type='all';state.query='';$('search').value='';$('topic').value='all';$('type').value='all';render();}
  function openEntry(id, updateHash=true) {
    const e = data.entries.find(entry=>entry.id===id);
    if(!e) return;
    returnFocus=document.activeElement;
    $('dialog-content').innerHTML=`<p class="detail-kicker">ENTRY ${esc(e.number)} / ${esc(e.format)}</p><h2 class="detail-title" id="detail-title">${esc(e.title)}</h2><p class="detail-description">${esc(e.description)}</p>${id==='porygongpt'?'<img class="detail-image" src="assets/companion.png" alt="Black-and-red low-poly companion artwork" width="1184" height="1280">':''}<dl class="detail-meta"><div><dt>${esc(e.dateLabel)}</dt><dd>${longDate(e.date)}</dd></div><div><dt>Status</dt><dd>${esc(e.status)}</dd></div></dl><div class="detail-context"><h3>About this entry</h3><p>${esc(e.detail)}</p></div><div class="detail-tags">${e.themes.map(t=>`<span class="detail-tag">${esc(t)}</span>`).join('')}</div>${e.publicUrl?`<a class="detail-link" href="${esc(e.publicUrl)}" target="_blank" rel="noopener noreferrer">${esc(e.linkLabel)}<span class="sr-only"> (opens a new tab)</span></a>`:'<p class="detail-no-link">This collection includes a summary; no public demo or download is linked.</p>'}`;
    if(!$('entry-dialog').open) $('entry-dialog').showModal();
    if(updateHash) history.replaceState(null,'','#entry-'+encodeURIComponent(id));
    $('close-dialog').focus();
  }
  function closeEntry(){if($('entry-dialog').open)$('entry-dialog').close();}
  document.addEventListener('click',event=>{const opener=event.target.closest('[data-open]');if(opener)openEntry(opener.dataset.open);const month=event.target.closest('[data-month]');if(month){state.month=month.dataset.month;render();}});
  $('month-nav').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const buttons=[...$('month-nav').querySelectorAll('button')];const current=buttons.indexOf(document.activeElement);if(current<0)return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(current+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();buttons[next].click();});
  $('search').addEventListener('input',event=>{state.query=event.target.value;render();});
  $('topic').addEventListener('change',event=>{state.topic=event.target.value;render();});
  $('type').addEventListener('change',event=>{state.type=event.target.value;render();});
  $('grid-view').addEventListener('click',()=>{state.view='grid';render();});
  $('timeline-view').addEventListener('click',()=>{state.view='timeline';render();});
  $('clear-filters').addEventListener('click',resetFilters);
  $('empty-reset').addEventListener('click',()=>{resetFilters();$('search').focus();});
  $('close-dialog').addEventListener('click',closeEntry);
  $('entry-dialog').addEventListener('click',event=>{if(event.target===$('entry-dialog')){const r=$('entry-dialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeEntry();}});
  $('entry-dialog').addEventListener('close',()=>{if(location.hash.startsWith('#entry-'))history.replaceState(null,'','#collection');if(returnFocus&&document.contains(returnFocus))returnFocus.focus();});
  $('total-count').textContent=data.entries.length;
  $('project-count').textContent=data.entries.filter(e=>e.type==='Project').length;
  renderMonths();render();
  if(location.hash.startsWith('#entry-'))openEntry(decodeURIComponent(location.hash.slice(7)),false);
  window.Arcade={selectEntries,state,resetFilters,openEntry,closeEntry};
})();
