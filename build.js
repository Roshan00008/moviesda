#!/usr/bin/env node

/**
 * esbuild script for compiling Nuvio providers.
 * Bundles multi-file providers in src/ into providers/ and transpiles async/await
 * to ES2016 generator functions (required for Hermes JS engine).
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const outDir = path.join(__dirname, 'providers');

// Nuvio app provides these modules natively - do not bundle them
const EXTERNAL_MODULES = [
    'cheerio-without-node-native',
    'react-native-cheerio',
    'cheerio',
    'crypto-js',
    'axios'
];

async function buildProvider(providerName, options = {}) {
    const entryPoint = path.join(srcDir, providerName, 'index.js');
    const outFile = path.join(outDir, `${providerName}.js`);

    if (!fs.existsSync(entryPoint)) {
        console.warn(`⚠️  Skipping ${providerName}: entrypoint not found at ${entryPoint}`);
        return false;
    }

    try {
        await esbuild.build({
            entryPoints: [entryPoint],
            bundle: true,
            outfile: outFile,
            format: 'cjs',              // CommonJS for Nuvio exports
            platform: 'neutral',
            target: 'es2016',           // Transpile async/await to generators for Hermes
            minify: options.minify || false,
            sourcemap: false,
            external: EXTERNAL_MODULES,
            banner: {
                js: `/**\n * Moviesda Nuvio Addon - Compiled\n * Generated: ${new Date().toISOString()}\n */`
            },
            logLevel: 'warning'
        });

        const stats = fs.statSync(outFile);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`✅ Compiled: providers/${providerName}.js (${sizeKB} KB)`);
        return true;
    } catch (err) {
        console.error(`❌ Failed to compile ${providerName}:`, err.message);
        return false;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const shouldMinify = args.includes('--minify');

    // Discover folders in src/
    if (!fs.existsSync(srcDir)) {
        console.error('❌ src/ folder not found.');
        process.exit(1);
    }

    const providers = fs.readdirSync(srcDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('_'))
        .map(d => d.name);

    if (providers.length === 0) {
        console.log('No providers found in src/. Create a directory under src/<name>/');
        return;
    }

    console.log(`\n📦 Compiling ${providers.length} provider(s)...`);

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    let success = 0;
    for (const provider of providers) {
        const ok = await buildProvider(provider, { minify: shouldMinify });
        if (ok) success++;
    }

    console.log(`✨ Compilation finished! ${success} succeeded.\n`);
}

main().catch(err => {
    console.error('Build crashed:', err);
    process.exit(1);
});
