const fs = require('fs');
const path = require('path');

const dirsToScan = [
    path.join(process.cwd(), 'src', 'routes', 'dashboard'),
    path.join(process.cwd(), 'src', 'components'),
    path.join(process.cwd(), 'src', 'modals'),
    path.join(process.cwd(), 'src', 'layouts'),
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

let files = [];
dirsToScan.forEach(dir => {
    if (fs.existsSync(dir)) {
        files = files.concat(walk(dir));
    }
});

let changedFilesCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    // Reverse margin logical → physical
    content = content.replace(/\b(-?)ms-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1ml-$2');
    content = content.replace(/\b(-?)me-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1mr-$2');

    // Reverse padding logical → physical
    content = content.replace(/\b(-?)ps-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1pl-$2');
    content = content.replace(/\b(-?)pe-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1pr-$2');

    // Reverse position logical → physical
    content = content.replace(/\b(-?)start-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1left-$2');
    content = content.replace(/\b(-?)end-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1right-$2');

    // Reverse border logical → physical
    content = content.replace(/\bborder-s(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'border-l$1');
    content = content.replace(/\bborder-e(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'border-r$1');

    // Reverse text alignment
    content = content.replace(/\btext-start\b/g, 'text-left');
    content = content.replace(/\btext-end\b/g, 'text-right');

    // Reverse rounded logical → physical
    content = content.replace(/\brounded-s(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-l$1');
    content = content.replace(/\brounded-e(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-r$1');
    content = content.replace(/\brounded-ss(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-tl$1');
    content = content.replace(/\brounded-se(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-tr$1');
    content = content.replace(/\brounded-es(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-bl$1');
    content = content.replace(/\brounded-ee(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-br$1');

    // Reverse origin logical → physical
    content = content.replace(/\borigin-top-start\b/g, 'origin-top-left');
    content = content.replace(/\borigin-top-end\b/g, 'origin-top-right');
    content = content.replace(/\borigin-bottom-start\b/g, 'origin-bottom-left');
    content = content.replace(/\borigin-bottom-end\b/g, 'origin-bottom-right');
    content = content.replace(/\borigin-start\b/g, 'origin-left');
    content = content.replace(/\borigin-end\b/g, 'origin-right');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changedFilesCount++;
        console.log('Restored: ' + file.replace(process.cwd(), ''));
    }
});

console.log('Total files restored: ' + changedFilesCount);
