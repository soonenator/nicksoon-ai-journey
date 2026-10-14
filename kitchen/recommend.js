(function (root) {
  'use strict';
  const normalize = value => String(value || '').toLowerCase().replace(/chicken breast|chicken thigh/g, 'chicken').replace(/pork belly/g, 'pork').trim();
  const tags = recipe => new Set([...(recipe.ingredients || []), ...(recipe.categoryTags || [])].map(normalize));
  const overlap = (a, b) => [...a].filter(value => b.has(value));
  const lowSignal = new Set(['soy sauce', 'sugar', 'garlic', 'onion', 'butter', 'egg', 'green onion']);
  function rank(recipe, context) {
    let score = 0;
    const reasons = [];
    const own = tags(recipe);
    const current = context.current;
    if (current) {
      const shared = overlap(own, tags(current)).filter(t => !lowSignal.has(t));
      if (context.mode === 'pairing') {
        const sameRole = recipe.role === current.role;
        score += sameRole ? -15 : 20;
        if (current.role === 'main' && recipe.role === 'side') score += 25;
        if (recipe.categoryTags.includes('Vegetables') && !current.categoryTags.includes('Vegetables')) score += 8;
        if (shared.length) score += 3;
        reasons.push(recipe.role === 'side' ? 'A side to round out your meal' : 'A main to go with your side');
      } else {
        score += shared.length * 9;
        if (recipe.role === current.role) score += 7;
        reasons.push(shared.length ? `Similar ingredients: ${shared.slice(0, 2).join(', ')}` : 'Another idea for your next meal');
      }
    }
    const likedRecipes = context.recipes.filter(r => context.liked.has(r.id));
    let bestMatch = null;
    let bestShared = 0;
    for (const liked of likedRecipes) {
      if (liked.id === recipe.id) continue;
      const common = overlap(own, tags(liked)).reduce((sum, tag) => sum + (lowSignal.has(tag) ? .25 : 1), 0);
      if (common > bestShared) { bestShared = common; bestMatch = liked; }
    }
    if (bestMatch && bestShared >= 1) {
      score += Math.min(bestShared, 6) * 4;
      if (!current) reasons.push(`Because you like ${bestMatch.title}`);
    }
    const base = ['rice', 'noodles', 'chicken', 'pork', 'tofu', 'fish/seafood'];
    score += overlap(own, new Set(base)).length * 2;
    if (recipe.tools.includes('Pressure cooker')) score += 4;
    if (recipe.tools.includes('Rice cooker')) score += 3;
    if (recipe.lowEffort) score += 3;
    if (context.liked.has(recipe.id)) score += 4;
    if (context.queued.has(recipe.id)) score += 6;
    if (!context.cooked.has(recipe.id)) score += 1;
    if (recipe.incomplete) score -= 30;
    if (context.ingredients.size) score += overlap(own, context.ingredients).length * 5;
    if (!reasons.length) reasons.push(recipe.lowEffort ? 'A lower-effort idea for your rotation' : recipe.tools.includes('Pressure cooker') ? 'Put the Instant Pot to work' : own.has('rice') ? 'A familiar rice-based comfort meal' : 'Saved inspiration worth a look');
    return {recipe, score, reason:reasons[0]};
  }
  function filterAndRank(recipes, state) {
    const current = recipes.find(r => r.id === state.currentId);
    const context = {...state, current, recipes};
    const terms = normalize(state.query).split(/\s+/).filter(Boolean);
    return recipes.filter(recipe => {
      if (recipe.id === state.currentId) return false;
      if (state.view === 'liked' && !state.liked.has(recipe.id)) return false;
      if (state.view === 'queue' && !state.queued.has(recipe.id)) return false;
      if (state.view === 'cooked' && !state.cooked.has(recipe.id)) return false;
      if (state.time && (!recipe.timeMinutes || recipe.timeMinutes > state.time)) return false;
      if (state.tool && !recipe.tools.includes(state.tool)) return false;
      if (state.easy && !recipe.lowEffort) return false;
      if (state.ingredients.size && !overlap(tags(recipe), state.ingredients).length) return false;
      const haystack = normalize([recipe.title,recipe.summary,recipe.creator,...recipe.ingredients,...recipe.tools,...recipe.categoryTags].join(' '));
      if (!terms.every(t => haystack.includes(t))) return false;
      if (current && state.mode === 'pairing') {
        if (current.role === 'main' && recipe.role !== 'side') return false;
        if (current.role === 'side' && recipe.role !== 'main') return false;
        if (!['main','side'].includes(current.role)) return false;
      }
      return true;
    }).map(r => rank(r, context)).sort((a,b) => {
      if (state.sort === 'title') return a.recipe.title.localeCompare(b.recipe.title);
      if (state.sort === 'quickest') return (a.recipe.timeMinutes || Infinity) - (b.recipe.timeMinutes || Infinity) || a.recipe.title.localeCompare(b.recipe.title);
      return b.score - a.score || a.recipe.title.localeCompare(b.recipe.title);
    });
  }
  const api = {normalize,tags,rank,filterAndRank};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.KitchenRecommendations = api;
})(typeof window !== 'undefined' ? window : globalThis);
