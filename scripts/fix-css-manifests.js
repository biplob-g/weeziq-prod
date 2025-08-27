const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing CSS manifest files in OpenNext build...');

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

// Check what CSS files actually exist
const cssFilesDir = '.open-next/assets/_next/static/css';
let actualCssFiles = [];
if (fs.existsSync(cssFilesDir)) {
    actualCssFiles = fs.readdirSync(cssFilesDir)
        .filter(file => file.endsWith('.css'))
        .map(file => `/_next/static/css/${file}`);
}

console.log('📁 Found CSS files:', actualCssFiles);

// Create a more comprehensive CSS manifest structure that OpenNext expects
const cssManifestContent = {
    "entryCSSFiles": actualCssFiles,
    "cssFiles": actualCssFiles.reduce((acc, file) => {
        acc[file] = file;
        return acc;
    }, {}),
    "cssModules": {}
};

const appBuildManifestContent = {
    "entryCSSFiles": actualCssFiles,
    "pages": {
        "/": {
            "entryCSSFiles": actualCssFiles
        },
        "/blog": {
            "entryCSSFiles": actualCssFiles
        },
        "/privacy-policy": {
            "entryCSSFiles": actualCssFiles
        }
    },
    "cssFiles": actualCssFiles.reduce((acc, file) => {
        acc[file] = file;
        return acc;
    }, {}),
    "cssModules": {}
};

const buildManifestContent = {
    "entryCSSFiles": actualCssFiles,
    "pages": {
        "/": {
            "entryCSSFiles": actualCssFiles
        },
        "/blog": {
            "entryCSSFiles": actualCssFiles
        },
        "/privacy-policy": {
            "entryCSSFiles": actualCssFiles
        }
    },
    "cssFiles": actualCssFiles.reduce((acc, file) => {
        acc[file] = file;
        return acc;
    }, {}),
    "cssModules": {}
};

// All possible manifest locations that OpenNext might look for
const allManifestLocations = [
    // OpenNext server function manifests
    '.open-next/server-functions/default/.next/server/app/css-manifest.json',
    '.open-next/server-functions/default/.next/server/app/css-build-manifest.json',
    '.open-next/server-functions/default/.next/server/app/css-entry-files.json',
    '.open-next/server-functions/default/.next/server/app/app-build-manifest.json',
    '.open-next/server-functions/default/.next/server/build-manifest.json',
    '.open-next/server-functions/default/.next/server/css-manifest.json',

    // Main .next directory manifests
    '.next/server/app/css-manifest.json',
    '.next/server/app/css-build-manifest.json',
    '.next/server/app/css-entry-files.json',
    '.next/server/app/app-build-manifest.json',
    '.next/server/build-manifest.json',
    '.next/server/css-manifest.json',

    // Root level manifests
    '.open-next/server-functions/default/.next/css-manifest.json',
    '.next/css-manifest.json'
];

// Create all manifest files with appropriate content
allManifestLocations.forEach(filePath => {
    let content;

    if (filePath.includes('build-manifest.json')) {
        content = buildManifestContent;
    } else if (filePath.includes('app-build-manifest.json')) {
        content = appBuildManifestContent;
    } else {
        content = cssManifestContent;
    }

    createMissingFile(filePath, JSON.stringify(content, null, 2));
});

// Also create a pages-manifest.json if it doesn't exist
const pagesManifestPath = '.open-next/server-functions/default/.next/server/pages-manifest.json';
if (!fs.existsSync(pagesManifestPath)) {
    const pagesManifestContent = {
        "/": ".next/server/app/page.js",
        "/blog": ".next/server/app/blog/page.js",
        "/privacy-policy": ".next/server/app/privacy-policy/page.js"
    };
    createMissingFile(pagesManifestPath, JSON.stringify(pagesManifestContent, null, 2));
}

console.log('🎉 CSS manifest files fixed!');
