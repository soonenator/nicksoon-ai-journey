'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const config = {owner: 'soonenator', topic: 'ai-journey', ignoredRepositoryIds: []};
const canonical = value => String(value || '').toLowerCase().replace(/[?#].*$/, '').replace(/\/+$/, '').replace(/\.git$/, '');
const titleKey = value => String(value).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '');
function readData(text) {
  const match = /^window\.ARCADE_DATA = ([\s\S]*);\s*$/.exec(text);
  if (!match) throw Error('Unexpected data.js format; refusing to rewrite');
  return JSON.parse(match[1]);
}
function propose(data, artifacts, repos, today, settings = config) {
  const next = structuredClone(data);
  const urls = new Set([...data.entries.map(e => e.publicUrl), ...Object.values(artifacts).flat().map(a => a.src)].filter(Boolean).map(canonical));
  const titles = new Set(data.entries.map(e => titleKey(e.title)));
  const ids = new Set(data.entries.map(e => e.id));
  const added = [];
  for (const repo of [...repos].sort((a,b) => a.id - b.id)) {
    if (repo.private !== false || repo.visibility !== 'public' || repo.fork || repo.archived || repo.disabled || repo.owner?.login?.toLowerCase() !== settings.owner || !repo.topics?.includes(settings.topic) || settings.ignoredRepositoryIds.includes(repo.id)) continue;
    if (!Number.isSafeInteger(repo.id) || repo.id <= 0 || !/^[A-Za-z0-9_.-]+$/.test(repo.name)) throw Error('Invalid repository metadata');
    const url = `https://github.com/${settings.owner}/${repo.name}`;
    if (canonical(repo.html_url) !== canonical(url)) throw Error('Unexpected public source URL');
    const id = `github-${repo.id}`;
    const title = repo.name.replace(/[-_]+/g, ' ');
    // Existing source links, renamed repos (numeric ID), and legacy title aliases.
    if (ids.has(id) || urls.has(canonical(url)) || titles.has(titleKey(title))) continue;
    const number = String(Math.max(...next.entries.map(e => Number(e.number))) + 1).padStart(3, '0');
    next.entries.push({id, date: today, title,
      description: 'A public AI-assisted project repository selected for this collection.',
      format: 'Source repository', themes: ['Making things'], type: 'Project', status: 'Public source repository',
      detail: 'Discovered through the owner’s ai-journey topic on a public GitHub repository. This date records discovery, not creation or first publication. Only the public source link is included; no source files, conversations, or unpublished artifacts were imported.',
      publicUrl: url, linkLabel: 'View public source', dateLabel: 'Public repository discovered', number});
    ids.add(id); urls.add(canonical(url)); titles.add(titleKey(title)); added.push(id);
  }
  if (added.length) {
    next.updated = today;
    const monthIds = [...new Set(next.entries.map(e => e.date.slice(0,7)))].sort();
    next.months = monthIds.map(id => ({id, label: new Intl.DateTimeFormat('en', {month:'long', timeZone:'UTC'}).format(new Date(`${id}-01T12:00:00Z`))}));
  }
  return {data: next, added};
}
async function listRepos(fetcher = fetch) {
  const repos = [];
  for (let page = 1; ; page++) {
    // Deliberately no Authorization header: this endpoint can see public metadata only.
    const response = await fetcher(`https://api.github.com/users/${config.owner}/repos?type=owner&per_page=100&page=${page}`, {
      headers: {Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'},
      redirect: 'error', signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) throw Error(`Public discovery failed: HTTP ${response.status}; no changes written`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw Error('Unexpected GitHub response');
    repos.push(...batch);
    if (batch.length < 100) return repos;
    if (page >= 100) throw Error('Pagination limit reached; no changes written');
  }
}
async function main() {
  const dataPath = path.join(root, 'data.js');
  const data = readData(fs.readFileSync(dataPath, 'utf8'));
  // Parse the existing data assignment as JSON; never execute remote code.
  const artifactText = fs.readFileSync(path.join(root, 'artifacts.js'), 'utf8');
  const artifacts = JSON.parse(artifactText.replace(/^window\.ARCADE_ARTIFACTS = /, '').replace(/;\s*$/, ''));
  const result = propose(data, artifacts, await listRepos(), new Date().toISOString().slice(0,10));
  if (!result.added.length) { console.log('No new opted-in public projects.'); return; }
  const branch = 'automation/public-projects-' + crypto.createHash('sha256').update(result.added.join(',')).digest('hex').slice(0,16);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `branch=${branch}\n`);
  if (process.argv.includes('--write')) fs.writeFileSync(dataPath, `window.ARCADE_DATA = ${JSON.stringify(result.data, null, 2)};\n`);
  console.log(`${result.added.length} public project(s) proposed${process.argv.includes('--write') ? '' : ' (dry run; use --write to apply locally)'}.`);
}
module.exports = {propose, readData, listRepos};
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
