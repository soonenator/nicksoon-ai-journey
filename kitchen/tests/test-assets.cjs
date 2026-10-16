const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('recipes.js','utf8'),ctx);vm.runInNewContext(fs.readFileSync('images.js','utf8'),ctx);
const recipes=ctx.window.RECIPE_DATA.recipes,images=ctx.window.RECIPE_IMAGES;
assert.equal(Object.keys(images).length,45);
for(const [id,image] of Object.entries(images)){
 const recipe=recipes.find(r=>r.id===id);assert(recipe&&!recipe.cooked,id);assert.equal(image.sourceUrl,recipe.instagramUrl);assert.equal(image.sitePath,`assets/recipes/${id}.webp`);assert(image.alt&&image.creator&&image.attribution&&image.imageType);assert(image.width>0&&image.height>0);assert(fs.existsSync(image.sitePath));assert.deepEqual(Object.keys(image).sort(),['sitePath','creator','sourceUrl','alt','imageType','attribution','checkedAt','width','height'].sort());
 const bytes=fs.readFileSync(image.sitePath);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
}
assert(images[ctx.window.RECIPE_IMAGE_HERO]);assert(recipes.filter(r=>r.cooked).every(r=>!images[r.id]));
assert(fs.readFileSync('styles.css','utf8').includes("font-display:swap"));assert(fs.existsSync('assets/fonts/OFL.txt'));
console.log('Assets: 45 exact source/recipe mappings and local WebP files verified; four personal placeholders; font license and hero present.');
