'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {propose, readData, listRepos} = require('../scripts/discover-public-projects.cjs');
const data = readData(fs.readFileSync(require('node:path').join(__dirname,'../data.js'),'utf8'));
const repo = (overrides = {}) => ({id:1001,name:'new-experiment',html_url:'https://github.com/soonenator/new-experiment',owner:{login:'soonenator'},private:false,visibility:'public',fork:false,archived:false,disabled:false,topics:['ai-journey'],...overrides});
test('Opt-in public sources preserve baseline, use discovery date, and are idempotent',()=>{
  const result=propose(data,{},[repo(),repo()], '2027-01-03');
  assert.equal(result.added.length,1);
  assert.deepEqual(result.data.entries.slice(0,data.entries.length),data.entries);
  assert.equal(result.data.entries.at(-1).date,'2027-01-03');
  assert.equal(result.data.months.at(-1).id,'2027-01');
  assert.deepEqual(propose(result.data,{},[repo({name:'renamed',html_url:'https://github.com/soonenator/renamed'})],'2027-01-04').data,result.data);
  assert.equal(data.entries.some(e=>e.id==='github-1001'),false);
});
test('Reject private, unknown visibility, untagged, forked, archived, disabled, foreign and ignored repos',()=>{
  for(const override of [{private:true},{visibility:'private'},{visibility:undefined},{topics:[]},{fork:true},{archived:true},{disabled:true},{owner:{login:'someone-else'}}]) assert.equal(propose(data,{},[repo(override)],'2026-11-04').added.length,0);
  assert.equal(propose(data,{},[repo()],'2026-11-04',{owner:'soonenator',topic:'ai-journey',ignoredRepositoryIds:[1001]}).added.length,0);
});
test('Existing URLs and legacy project names do not create duplicate cards',()=>{
  for(const name of ['Nicks-Kitchen','Brunch-Menu-Shortlist','Jedi-Survival','Pkmncenter']) {
    const artifacts={'existing':[{src:'https://github.com/soonenator/Pkmncenter/'}]};
    assert.equal(propose(data,artifacts,[repo({name,html_url:`https://github.com/soonenator/${name}`})],'2026-11-04').added.length,0);
  }
});
test('Reject forged URLs; never import remote descriptions or executable metadata',()=>{
  assert.throws(()=>propose(data,{},[repo({html_url:'https://example.com/private'})],'2026-11-04'));
  const result=propose(data,{},[repo({description:'CONFIDENTIAL',homepage:'https://example.com/private'})],'2026-11-04');
  assert(!JSON.stringify(result).includes('CONFIDENTIAL'));assert(!JSON.stringify(result).includes('example.com'));
});
test('Public-only API pagination and failure handling',async()=>{
  let calls=0;
  const repos=await listRepos(async(url,options)=>{
    calls++;assert(url.startsWith('https://api.github.com/users/soonenator/repos?'));
    assert.equal(options.headers.Authorization,undefined);
    return {ok:true,json:async()=>calls===1?Array.from({length:100},()=>repo()):[repo()]};
  });
  assert.equal(calls,2);assert.equal(repos.length,101);
  await assert.rejects(listRepos(async()=>({ok:false,status:403})),/HTTP 403/);
});
