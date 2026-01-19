const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Ensure dist-electron exists
const outDir = path.join(__dirname, '../dist-electron');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function buildElectron() {
  console.log('Building Electron Main Process...');
  try {
    // Build Main
    await esbuild.build({
      entryPoints: [path.join(__dirname, '../src/main/main.ts')],
      bundle: true,
      platform: 'node',
      outfile: path.join(outDir, 'main.cjs'),
      external: ['electron', 'electron-squirrel-startup'],
      format: 'cjs',
    });

    // Build Preload
    await esbuild.build({
      entryPoints: [path.join(__dirname, '../src/main/preload.ts')],
      bundle: true,
      platform: 'node',
      outfile: path.join(outDir, 'preload.cjs'),
      external: ['electron'],
      format: 'cjs',
    });

    console.log('Electron build completed successfully.');
  } catch (error) {
    console.error('Electron build failed:', error);
    process.exit(1);
  }
}

buildElectron();