const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASELINE_FILE = 'baseline.json';

function getFileHash(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    } catch (error) {
        return null;
    }
}

function scanDirectory(directory) {
    let fileHashes = {};
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fileHashes = { ...fileHashes, ...scanDirectory(fullPath) };
        } else {
            const hash = getFileHash(fullPath);
            if (hash) fileHashes[fullPath] = hash;
        }
    }
    return fileHashes;
}

function createBaseline(directory) {
    const hashes = scanDirectory(directory);
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(hashes, null, 2));
    console.log(`Baseline created with ${Object.keys(hashes).length} files.`);
}

function verifyIntegrity(directory) {
    if (!fs.existsSync(BASELINE_FILE)) {
        console.log("No baseline found. Create a baseline first.");
        return;
    }

    const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
    const currentHashes = scanDirectory(directory);

    const added = Object.keys(currentHashes).filter(f => !baseline[f]);
    const deleted = Object.keys(baseline).filter(f => !currentHashes[f]);
    const modified = Object.keys(currentHashes).filter(f => baseline[f] && currentHashes[f] !== baseline[f]);

    console.log("Added files:", added);
    console.log("Deleted files:", deleted);
    console.log("Modified files:", modified);
}

const targetDir = './test_folder';
//createBaseline(targetDir);
verifyIntegrity(targetDir);