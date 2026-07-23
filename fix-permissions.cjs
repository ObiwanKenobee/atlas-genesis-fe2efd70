
const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.resolve(__dirname, 'node_modules');

// Function to recursively change permissions
function changePermissions(dir, mode) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      changePermissions(fullPath, mode);
    }
    
    fs.chmodSync(fullPath, mode);
  });
  
  fs.chmodSync(dir, mode);
}

try {
  // Change owner of node_modules to current user
  const { uid, gid } = process.getuid ? { uid: process.getuid(), gid: process.getgid() } : { uid: -1, gid: -1 };
  
  if (uid !== -1 && gid !== -1) {
    changePermissions(nodeModulesPath, '755');
    
    // Try to install dependencies again
    const { execSync } = require('child_process');
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully');
    
    // Try to build the project
    console.log('Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Project built successfully');
  } else {
    console.error('Unable to get user/group IDs');
  }
} catch (error) {
  console.error('Error:', error.message);
  if (error.stderr) {
    console.error('Stderr:', error.stderr);
  }
}
