const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('recipes.js','utf8'),sandbox);
const recipes=sandbox.window.RECIPE_DATA.recipes;
const engine=require('../recommend.js');
const state=()=>({query:'',view:'all',time:0,tool:'',ingredients:new Set(),easy:false,currentId:'',mode:'similar',sort:'recommended',liked:new Set(),queued:new Set(),cooked:new Set(recipes.filter(r=>r.cooked).map(r=>r.id))});
let s=state();let result=engine.filterAndRank(recipes,s);assert.equal(result.length,49);assert.deepEqual(result.map(x=>x.recipe.id),engine.filterAndRank(recipes,s).map(x=>x.recipe.id));
s.time=30;assert(engine.filterAndRank(recipes,s).every(x=>x.recipe.timeMinutes&&x.recipe.timeMinutes<=30));assert(!engine.filterAndRank(recipes,s).some(x=>x.recipe.id==='DTvJjt9ispt'));
s=state();s.tool='Rice cooker';assert(engine.filterAndRank(recipes,s).length>0);assert(engine.filterAndRank(recipes,s).every(x=>x.recipe.tools.includes('Rice cooker')));
s=state();s.ingredients.add('chicken');assert(engine.filterAndRank(recipes,s).some(x=>x.recipe.id==='adapted-oyakodon-chicken-breast'));
s=state();s.currentId='adapted-instant-pot-kakuni';s.mode='pairing';result=engine.filterAndRank(recipes,s);assert(result.length>0);assert(result.every(x=>x.recipe.role==='side'));assert(!result.some(x=>x.recipe.id===s.currentId));
s=state();s.liked.add('DdNuXB6hCYY');assert(engine.filterAndRank(recipes,s).some(x=>x.reason.includes('Because you like')));
s=state();s.view='liked';assert.equal(engine.filterAndRank(recipes,s).length,0);s.liked.add('DdNuXB6hCYY');assert.equal(engine.filterAndRank(recipes,s).length,1);
s=state();s.query='nonsense xyz';assert.equal(engine.filterAndRank(recipes,s).length,0);
for(const r of recipes){assert(r.id&&r.title&&r.summary);assert.equal(r.favorite,false);for(const key of ['instagramUrl','recipeUrl'])if(r[key])assert.match(r[key],/^https:\/\/www\.instagram\.com\/reel\/[\w-]+\/$/);assert(['main','side','drink','dessert','snack'].includes(r.role));}
assert.equal(new Set(recipes.map(r=>r.id)).size,recipes.length);
console.log('Engine: 18 filter, ranking, source and data assertions passed.');
