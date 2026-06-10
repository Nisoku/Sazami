const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.resolve(ROOT, 'dist');
const DEMO_DIST = path.resolve(__dirname, '..', '..', 'Demo', 'dist');

function copyDist() {
  try {
    if (fs.existsSync(DEMO_DIST)) {
      fs.rmSync(DEMO_DIST, { recursive: true, force: true });
    }
    fs.cpSync(DIST, DEMO_DIST, { recursive: true });
    console.log(`[${new Date().toLocaleTimeString()}] Copied dist → Demo/dist`);
  } catch (err) {
    console.error('Copy failed:', err.message);
  }
}

let buildProcess = null;
let watchTimer = null;
let watchReady = false;

function startBuild() {
  // Kill previous build if running
  if (buildProcess) {
    buildProcess.kill();
    buildProcess = null;
  }

  buildProcess = spawn('npx', ['vite', 'build', '--watch'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  buildProcess.stdout.on('data', (data) => {
    const text = data.toString();
    process.stdout.write(`[vite] ${text}`);
    // When vite reports a completed build, trigger copy
    if (text.includes('built in') || text.includes('modules transformed')) {
      if (watchReady) {
        // Debounce — wait for file writes to settle
        clearTimeout(watchTimer);
        watchTimer = setTimeout(() => {
          // Wait for the output files to exist
          setTimeout(copyDist, 200);
        }, 500);
      }
    }
  });

  buildProcess.stderr.on('data', (data) => {
    process.stderr.write(`[vite] ${data}`);
  });

  buildProcess.on('exit', (code) => {
    console.log(`vite exited (code ${code})`);
    buildProcess = null;
  });
}

async function main() {
  console.log('Building for demo…');

  // First do a full build synchronously
  console.log('Running initial build…');
  const initial = spawn('npx', ['vite', 'build'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  initial.stdout.pipe(process.stdout);
  initial.stderr.pipe(process.stderr);

  await new Promise((resolve, reject) => {
    initial.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Initial build failed (code ${code})`));
    });
  });

  // Copy the initial build
  copyDist();
  watchReady = true;

  // Now start the watch mode build
  console.log('\nWatching for changes…');
  startBuild();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down…');
    if (buildProcess) buildProcess.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    if (buildProcess) buildProcess.kill();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
