#!/usr/bin/env node

/**
 * Fix D3 Chunk Loading Issues
 * This script cleans up problematic chunk files related to D3 libraries
 * that might be causing timeout errors.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to check
const CACHE_DIRS = [
  '.next/cache/webpack',
  '.next/static/chunks'
];

// Problematic chunk patterns
const PROBLEMATIC_PATTERNS = [
  'd3-sankey',
  'defaultVendors-_app-pages-browser_node_modules_d3',
  'd3-libs',
  'visualizations'
];

console.log('🧹 Starting D3 chunk fix process...');

// 1. First check if the .next directory exists
if (!fs.existsSync(path.join(process.cwd(), '.next'))) {
  console.log('❌ No .next directory found. Please run the build first.');
  process.exit(1);
}

// 2. Check each cache directory
let totalRemoved = 0;

for (const cacheDir of CACHE_DIRS) {
  const dirPath = path.join(process.cwd(), cacheDir);
  
  if (!fs.existsSync(dirPath)) {
    console.log(`📂 Directory ${cacheDir} not found, skipping...`);
    continue;
  }
  
  console.log(`🔍 Checking ${cacheDir}...`);
  
  try {
    // Read all files in the directory (and subdirectories recursively)
    const getAllFiles = (dirPath, arrayOfFiles = []) => {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
          arrayOfFiles.push(fullPath);
        }
      });
      
      return arrayOfFiles;
    };
    
    const allFiles = getAllFiles(dirPath);
    let removed = 0;
    
    // Check each file for problematic patterns
    allFiles.forEach(file => {
      const filename = path.basename(file);
      
      // Check if the file matches any problematic pattern
      if (PROBLEMATIC_PATTERNS.some(pattern => filename.includes(pattern))) {
        console.log(`🗑️  Removing problematic file: ${file}`);
        fs.unlinkSync(file);
        removed++;
        totalRemoved++;
      }
    });
    
    console.log(`✅ Removed ${removed} problematic files from ${cacheDir}`);
  } catch (err) {
    console.error(`❌ Error processing ${cacheDir}:`, err.message);
  }
}

console.log(`\n🧹 Clean-up complete! Removed ${totalRemoved} problematic files.`);

// 3. Clear React cache in node_modules/.cache
try {
  const reactCacheDir = path.join(process.cwd(), 'node_modules/.cache/react');
  if (fs.existsSync(reactCacheDir)) {
    console.log('🧹 Clearing React cache...');
    fs.rmSync(reactCacheDir, { recursive: true, force: true });
    console.log('✅ React cache cleared.');
  }
} catch (err) {
  console.log('⚠️ Could not clear React cache:', err.message);
}

// 4. Suggest next steps
console.log('\n📋 Next steps:');
console.log('1. Run the development server with:');
console.log('   npm run dev:clean');
console.log('\nOr run the build process with:');
console.log('   npm run build:optimized');
console.log('\nIf you still encounter issues, try:');
console.log('   npm run clean:deep');
console.log('   npm install');
console.log('   npm run dev:fast');

// Make the script executable
try {
  execSync('chmod +x ' + path.join(process.cwd(), 'scripts/fix-d3-chunks.js'));
} catch (err) {
  // Ignore chmod errors on Windows
}

console.log('\n✨ Fix script complete!'); 