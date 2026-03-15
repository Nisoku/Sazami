const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'dist');
const destDir = path.join(__dirname, '..', 'Demo', 'dist');

try {
  // Remove existing Demo/dist
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
    console.log('Removed existing Demo/dist');
  }
  
  // Copy dist to Demo
  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log('Copied dist to Demo/dist');
} catch (err) {
  console.error('Error building demo:', err);
  process.exit(1);
}
