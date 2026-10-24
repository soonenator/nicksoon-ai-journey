const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8'),js=fs.readFileSync('game.js','utf8');
const local=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m=>m[1]).filter(p=>!p.startsWith('http')&&p!=='./');
const art=[...js.split('const artReady')[0].matchAll(/(?:hero|atlas|arena|body|hangar|foundry):'([^']+)'/g)].map(m=>'assets/'+m[1]+'.png');
const base='https://example.github.io/example-repo/jedi-survival/';
for(const path of [...local,...art]){assert(!path.startsWith('/'),'Root-relative path: '+path);assert(fs.existsSync(path),'Missing asset: '+path);assert(new URL(path,base).pathname.startsWith('/example-repo/jedi-survival/'),'Subpath escape: '+path)}
for(const path of ['index.html','game.js','style.css','README.md','CREDITS.md']){const t=fs.readFileSync(path,'utf8');assert(!/appgprj_|git\.chatgpt-team\.site|sylar0706\.chatgpt\.site|\/workspace\//.test(t),'Private hosting value in '+path)}
console.log('PASS: assets exist, resolve beneath a Pages subpath and contain no private hosting identifiers.');
