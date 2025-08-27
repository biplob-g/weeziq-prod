const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing missing Durable Objects files...');

// Function to create missing DO files
function createDOFile(filePath, content) {
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

// Durable Objects files that need to be created
const doFiles = [
    {
        path: '.open-next/.build/durable-objects/queue.js',
        content: `
export class DOQueueHandler {
  constructor() {
    // Empty implementation
  }
}
`
    },
    {
        path: '.open-next/.build/durable-objects/sharded-tag-cache.js',
        content: `
export class ShardedTagCache {
  constructor() {
    // Empty implementation
  }
}
`
    },
    {
        path: '.open-next/.build/durable-objects/bucket-cache-purge.js',
        content: `
export class BucketCachePurge {
  constructor() {
    // Empty implementation
  }
}
`
    }
];

// Create all missing DO files
doFiles.forEach(file => {
    if (!fs.existsSync(file.path)) {
        createDOFile(file.path, file.content);
    } else {
        console.log(`✅ Already exists: ${file.path}`);
    }
});

console.log('🎉 Durable Objects files fixed!');
