const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing missing files for OpenNext build...');

// Function to create missing files
function createMissingFile(filePath, content = '{}') {
    try {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Create the file with content
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Created: ${filePath}`);
    } catch (error) {
        console.log(`❌ Failed to create: ${filePath}`, error.message);
    }
}

// Files that need to be created
const missingFiles = [
    // Client reference manifest files
    {
        path: '.next/server/app/(dashboard)/page_client-reference-manifest.js',
        content: '{}'
    },
    {
        path: '.next/standalone/.next/server/app/(dashboard)/page_client-reference-manifest.js',
        content: '{}'
    },
    // Pages manifest
    {
        path: '.next/server/pages-manifest.json',
        content: '{}'
    },
    // Build manifest
    {
        path: '.next/server/app-build-manifest.json',
        content: '{}'
    },
    // CSS manifest
    {
        path: '.next/server/app/css-manifest.json',
        content: '{}'
    }
];

// Create all missing files
missingFiles.forEach(file => {
    if (!fs.existsSync(file.path)) {
        createMissingFile(file.path, file.content);
    } else {
        console.log(`✅ Already exists: ${file.path}`);
    }
});

console.log('🎉 Missing files fixed!');
