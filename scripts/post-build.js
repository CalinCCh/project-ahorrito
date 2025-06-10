const fs = require('fs');
const path = require('path');

// Post-build script to handle missing client reference manifests
const nextServerPath = '.next/server';

if (fs.existsSync(nextServerPath)) {
  const createMissingFiles = (dir) => {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        const subDir = path.join(dir, item.name);
        
        // Check if this is a route group directory
        if (item.name.startsWith('(') && item.name.endsWith(')')) {
          const manifestPath = path.join(subDir, 'page_client-reference-manifest.js');
          
          if (!fs.existsSync(manifestPath)) {
            console.log(`Creating missing manifest: ${manifestPath}`);
            fs.writeFileSync(manifestPath, 'module.exports = {};');
          }
        }
        
        createMissingFiles(subDir);
      }
    }
  };
  
  createMissingFiles(path.join(nextServerPath, 'app'));
  console.log('Post-build script completed successfully');
} else {
  console.log('No .next/server directory found, skipping post-build');
}
