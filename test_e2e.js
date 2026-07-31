// Full end-to-end test with the new domain and CDN
// Run after rebuild to verify the complete pipeline works

const provider = require('./providers/moviesda.js');

async function testMovie(title, year, tmdbId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${title} (${year}) - TMDB: ${tmdbId}`);
  console.log('='.repeat(60));
  
  const start = Date.now();
  try {
    const streams = await provider.getStreams(tmdbId, 'movie', null, null);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    
    if (streams && streams.length > 0) {
      console.log(`✅ SUCCESS: Found ${streams.length} stream(s) in ${elapsed}s`);
      streams.slice(0, 3).forEach(s => {
        console.log(`  - ${s.title || s.name}`);
        console.log(`    URL: ${(s.url || '').slice(0, 80)}...`);
      });
    } else {
      console.log(`❌ FAIL: No streams found in ${elapsed}s`);
    }
  } catch(e) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.error(`❌ ERROR after ${elapsed}s: ${e.message}`);
    console.error(e.stack?.split('\n').slice(1,4).join('\n'));
  }
}

(async () => {
  // Correct TMDB IDs (verified via API)
  await testMovie('Minnale', '2001', '47938');   // TMDB: 47938
  await testMovie('Muthu', '1995', '66247');      // TMDB: 66247
})();
