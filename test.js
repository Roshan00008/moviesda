const { getStreams } = require('./providers/moviesda.js');

async function testMovie(tmdbId, label) {
    console.log(`\n======================================================`);
    console.log(`🔍 Testing Stream Resolution for: ${label} (TMDB ID: ${tmdbId})`);
    console.log(`======================================================`);
    
    try {
        const startTime = Date.now();
        const streams = await getStreams(tmdbId, 'movie');
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        console.log(`⏱️ Resolution took: ${duration}s`);
        console.log(`📊 Found ${streams.length} stream(s):`);
        
        if (streams.length === 0) {
            console.log(`❌ No streams found.`);
        } else {
            streams.forEach((stream, idx) => {
                console.log(`\n[Stream #${idx + 1}]`);
                console.log(`  Title:   ${stream.title}`);
                console.log(`  Quality: ${stream.quality}`);
                console.log(`  URL:     ${stream.url}`);
                console.log(`  Headers: ${JSON.stringify(stream.headers)}`);
            });
        }
    } catch (e) {
        console.error(`❌ Test failed with error:`, e);
    }
}

async function runTests() {
    // Test 1: Muthu (1995) - TMDB: 66247 (Should be found via Method 2: A-Z index!)
    await testMovie('66247', 'Muthu (1995)');
    
    // Test 2: Minnale (2001) - TMDB: 47938 (Should be found via Method 2: A-Z index!)
    await testMovie('47938', 'Minnale (2001)');
}

runTests();
