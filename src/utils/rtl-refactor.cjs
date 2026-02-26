const fs = require('fs');
const path = require('path');

const dirsToScan = [
    path.join(process.cwd(), 'src', 'routes', 'dashboard'),
    path.join(process.cwd(), 'src', 'components'),
    path.join(process.cwd(), 'src', 'modals')
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
    if (file.includes('dashboard.layout.jsx') || file.includes('sidebar.jsx') || file.includes('language-switcher.jsx')) {
        return;
    }

    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    content = content.replace(/\b(-?)ml-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1ms-$2');
    content = content.replace(/\b(-?)mr-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1me-$2');

    content = content.replace(/\b(-?)pl-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1ps-$2');
    content = content.replace(/\b(-?)pr-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1pe-$2');

    content = content.replace(/\b(-?)left-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1start-$2');
    content = content.replace(/\b(-?)right-([a-zA-Z0-9\[\]\-.]+)\b/g, '$1end-$2');

    content = content.replace(/\bborder-l(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'border-s$1');
    content = content.replace(/\bborder-r(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'border-e$1');

    content = content.replace(/\btext-left\b/g, 'text-start');
    content = content.replace(/\btext-right\b/g, 'text-end');

    content = content.replace(/\brounded-l(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-s$1');
    content = content.replace(/\brounded-r(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-e$1');
    content = content.replace(/\brounded-tl(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-ss$1');
    content = content.replace(/\brounded-tr(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-se$1');
    content = content.replace(/\brounded-bl(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-es$1');
    content = content.replace(/\brounded-br(-[a-zA-Z0-9\[\]\-.]+)?\b/g, 'rounded-ee$1');

    content = content.replace(/\borigin-top-left\b/g, 'origin-top-start');
    content = content.replace(/\borigin-top-right\b/g, 'origin-top-end');
    content = content.replace(/\borigin-bottom-left\b/g, 'origin-bottom-start');
    content = content.replace(/\borigin-bottom-right\b/g, 'origin-bottom-end');
    content = content.replace(/\borigin-left\b/g, 'origin-start');
    content = content.replace(/\borigin-right\b/g, 'origin-end');

    // Special exceptions for hardcoded translation interpolations
    // We already localized most things, but just in case

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changedFilesCount++;
        console.log('Updated: ' + file.replace(process.cwd(), ''));
    }
});

console.log('Total files updated: ' + changedFilesCount);
