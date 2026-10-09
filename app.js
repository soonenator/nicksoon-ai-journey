(() => {
  'use strict';
  const data = window.ARCADE_DATA;
  const $ = id => document.getElementById(id);
  const state = { month: 'all', topic: 'all', type: 'all', query: '', view: 'grid' };
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shortDate = date => new Intl.DateTimeFormat('en', {month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
  const longDate = date => new Intl.DateTimeFormat('en', {year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
  let returnFocus = null;
  let activeEntry = null;
  let activeArtifact = 0;
  let lastNonEntryHash = location.hash.startsWith('#entry-') ? '#collection' : location.hash || '#collection';
  const localFile = value => typeof value === 'string' && /^assets\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..');
  const safeUrl = value => localFile(value) || /^https:\/\/[^\s"<>]+$/.test(value || '');
  function entryArtifacts(e) {
    const items = (window.ARCADE_ARTIFACTS?.[e.id] || []).filter(a => ['image','html','pdf','link'].includes(a.kind) && safeUrl(a.src) && (!a.preview || localFile(a.preview)));
    if (e.publicUrl && safeUrl(e.publicUrl) && !items.some(a => a.src === e.publicUrl)) items.push({kind:'link', title:e.linkLabel || 'Open website', src:e.publicUrl, caption:e.publicUrl.includes('github.com/') ? 'Public source repository. A live demo is not available here.' : 'This separate hosted site opens in a new tab.'});
    return items;
  }
  function selectEntries(s = state) {
    const query = s.query.trim().toLocaleLowerCase();
    return data.entries.filter(e => (s.month === 'all' || e.date.startsWith(s.month)) && (s.topic === 'all' || e.themes.includes(s.topic)) && (s.type === 'all' || e.type === s.type) && (!query || [e.title,e.description,e.format,e.status,e.type,...e.themes].join(' ').toLocaleLowerCase().includes(query))).sort((a,b) => s.view === 'timeline' ? a.date.localeCompare(b.date) || a.number.localeCompare(b.number) : b.date.localeCompare(a.date) || b.number.localeCompare(a.number));
  }
  function card(e) {
    const artifacts = entryArtifacts(e);
    const preview = artifacts.map(a => a.preview || (a.kind === 'image' ? a.src : null)).find(Boolean);
    const visual = artifacts.some(a => a.kind !== 'link' || a.preview || !a.src.includes('github.com/'));
    const action = visual ? 'View the work' : artifacts.length ? 'View source' : 'Read the story';
    return `<article class="entry-card ${e.type==='Project'?'project':''}" aria-labelledby="title-${esc(e.id)}"><div class="card-top ${preview?'has-preview':''}">${preview?`<img class="card-preview-image" src="${esc(preview)}" alt="" loading="lazy"><span class="card-preview-badge">PREVIEW AVAILABLE</span>`:`<span class="card-number" aria-hidden="true">${esc(e.number)}</span><span class="card-format">${esc(e.format)}</span>`}</div><div class="card-body"><div class="card-kicker"><span class="entry-type">${esc(e.type)}</span><time datetime="${esc(e.date)}">${shortDate(e.date)}</time></div><h3 id="title-${esc(e.id)}">${esc(e.title)}</h3><p class="card-description">${esc(e.description)}</p><div class="card-status ${artifacts.length?'public-status':''}"><span class="status-mark" aria-hidden="true"></span>${esc(e.status)}</div></div><button class="open-entry" type="button" data-open="${esc(e.id)}" aria-label="${action}: ${esc(e.title)}">${action} <span aria-hidden="true">↗</span></button></article>`;
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
  function artifactPanel(e, selected = 0, interactive = false) {
    const items = entryArtifacts(e);
    if (!items.length) {
      const isArtifact = e.type === 'Project' || e.type === 'Saved artifact';
      return `<section class="artifact-unavailable"><h3>${isArtifact ? 'Original artifact not yet available' : 'A note from the journey'}</h3><p>${isArtifact ? 'The original work has not been added to this public collection. You can read its story below.' : 'This entry records a conversation or draft. There is no separate finished artifact to open.'}</p></section>`;
    }
    const a = items[selected] || items[0];
    const preview = a.preview || (a.kind === 'image' ? a.src : null);
    const canEmbed = a.kind === 'html' && localFile(a.src);
    const kindLabel = a.label || {image:'ORIGINAL ARTWORK',html:'INTERACTIVE ARCHIVE',pdf:'DOCUMENT PREVIEW',link:a.src.includes('github.com/')?'SOURCE REPOSITORY':'PUBLIC WEBSITE'}[a.kind];
    const sourceOnly = a.kind === 'link' && a.src.includes('github.com/') && !preview;
    const openLabel = a.kind === 'html' ? 'Open full screen' : a.kind === 'pdf' ? 'Open PDF' : a.kind === 'image' ? 'Open full-size image' : a.title || 'Open website';
    const tabs = items.length > 1 ? `<div class="artifact-tabs" role="group" aria-label="Choose an artifact">${items.map((item,i) => `<button type="button" data-artifact="${i}" aria-pressed="${i===selected}" aria-controls="artifact-display">${esc(item.title)}</button>`).join('')}</div>` : '';
    const display = canEmbed && (interactive || !preview)
      ? `<iframe class="artifact-frame" src="${esc(a.src)}" title="${esc(a.title)} interactive preview" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe>`
      : preview ? `<a class="artifact-image-link" href="${esc(preview)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(a.title)} image at full size (new tab)"><img class="artifact-image" src="${esc(preview)}" alt="${esc(a.alt || a.title)}"></a>`
      : `<div class="artifact-link-preview"><span aria-hidden="true">↗</span><h4>${esc(a.title)}</h4><p>${sourceOnly ? 'Source code only. A visual demo has not been added yet.' : a.kind==='link' ? 'Open the original in a new tab.' : 'Open the original file to view this work.'}</p></div>`;
    return `<section class="artifact-section" aria-labelledby="artifact-heading"><div class="artifact-heading"><h3 id="artifact-heading">${sourceOnly ? 'Explore the source' : 'See the work'}</h3><span>${kindLabel}</span></div>${tabs}<div id="artifact-display" class="artifact-display">${display}</div><p id="artifact-error" class="artifact-error" hidden>The preview could not load. Use the open button below to view the original.</p><div class="artifact-caption" aria-live="polite"><p>${esc(a.caption || a.title)}</p>${canEmbed ? '<p class="artifact-hint">Saved prototype. Open full screen for more room and working source links.</p>' : ''}</div><div class="artifact-actions">${canEmbed && preview ? `<button class="detail-link" type="button" data-interactive="${interactive?'off':'on'}">${interactive?'Back to preview':'Try it here'}</button>` : ''}<a class="detail-link ${canEmbed?'secondary-link':''}" href="${esc(a.src)}" target="_blank" rel="noopener noreferrer">${esc(openLabel)} <span aria-hidden="true">↗</span><span class="sr-only"> (opens a new tab)</span></a>${a.download && localFile(a.src) ? `<a class="detail-link secondary-link" href="${esc(a.src)}" download>Download ${a.kind==='pdf'?'PDF':a.kind==='image'?'image':'file'}</a>` : ''}</div></section>`;
  }
  function renderArtifact(selected = 0, interactive = false) {
    const e = data.entries.find(entry => entry.id === activeEntry);
    if (!e) return;
    const items = entryArtifacts(e);
    if (!Number.isInteger(selected) || selected < 0 || selected >= items.length) return;
    activeArtifact = selected;
    $('artifact-viewer').innerHTML = artifactPanel(e, selected, interactive);
  }
  function openEntry(id, updateHash=true) {
    const e = data.entries.find(entry=>entry.id===id);
    if(!e) return;
    if (!$('entry-dialog').open) returnFocus=document.activeElement;
    if (!location.hash.startsWith('#entry-')) lastNonEntryHash = location.hash || '#collection';
    activeEntry = id;
    activeArtifact = 0;
    $('dialog-content').innerHTML=`<p class="detail-kicker">ENTRY ${esc(e.number)} / ${esc(e.format)}</p><h2 class="detail-title" id="detail-title">${esc(e.title)}</h2><p class="detail-description">${esc(e.description)}</p><div id="artifact-viewer">${artifactPanel(e)}</div><dl class="detail-meta"><div><dt>${esc(e.dateLabel)}</dt><dd>${longDate(e.date)}</dd></div><div><dt>Status</dt><dd>${esc(e.status)}</dd></div></dl><div class="detail-context"><h3>About this entry</h3><p>${esc(e.detail)}</p></div><div class="detail-tags">${e.themes.map(t=>`<span class="detail-tag">${esc(t)}</span>`).join('')}</div>`;
    if(!$('entry-dialog').open) $('entry-dialog').showModal();
    $('entry-dialog').scrollTop = 0;
    const nextHash = '#entry-'+encodeURIComponent(id);
    if(updateHash && location.hash !== nextHash) history.pushState(null,'',nextHash);
    $('close-dialog').focus();
  }
  function closeEntry(){if($('entry-dialog').open)$('entry-dialog').close();}
  function syncEntryHash() {
    if (!location.hash.startsWith('#entry-')) { closeEntry(); return; }
    let id;
    try { id = decodeURIComponent(location.hash.slice(7)); } catch { return; }
    if (activeEntry !== id || !$('entry-dialog').open) openEntry(id, false);
  }
  document.addEventListener('click',event=>{
    const opener=event.target.closest('[data-open]');
    if(opener)openEntry(opener.dataset.open);
    const month=event.target.closest('[data-month]');
    if(month){state.month=month.dataset.month;render();}
    const artifact=event.target.closest('[data-artifact]');
    if(artifact){renderArtifact(Number(artifact.dataset.artifact));document.querySelector(`[data-artifact="${activeArtifact}"]`)?.focus();}
    const interactive=event.target.closest('[data-interactive]');
    if(interactive){renderArtifact(activeArtifact,interactive.dataset.interactive==='on');document.querySelector('[data-interactive]')?.focus();}
  });
  document.addEventListener('error',event=>{if(event.target.classList?.contains('artifact-image'))$('artifact-error').hidden=false;},true);
  window.addEventListener('popstate',syncEntryHash);
  window.addEventListener('hashchange',syncEntryHash);
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
  $('entry-dialog').addEventListener('close',()=>{if(location.hash.startsWith('#entry-'))history.replaceState(null,'',lastNonEntryHash);activeEntry=null;$('dialog-content').innerHTML='';if(returnFocus&&document.contains(returnFocus))returnFocus.focus();});
  $('total-count').textContent=data.entries.length;
  $('project-count').textContent=data.entries.filter(e=>e.type==='Project').length;
  renderMonths();render();
  syncEntryHash();
  window.Arcade={selectEntries,state,resetFilters,openEntry,closeEntry,entryArtifacts};
})();
