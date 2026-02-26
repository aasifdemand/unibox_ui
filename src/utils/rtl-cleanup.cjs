const fs = require('fs');
const path = require('path');

// Fix double-prefix artifacts like rtl:ltr: or ltr:rtl: introduced by re-running the script
// on files that already had ltr:/rtl: prefixes

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
    if (fs.existsSync(dir)) files = files.concat(walk(dir));
});

let changedFilesCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    // Fix rtl:ltr:something → ltr:something (the rtl: part makes no sense wrapping ltr:)
    content = content.replace(/\brtl:ltr:([a-zA-Z0-9\[\]\-./]+)/g, 'ltr:$1');
    // Fix ltr:rtl:something → rtl:something
    content = content.replace(/\bltr:rtl:([a-zA-Z0-9\[\]\-./]+)/g, 'rtl:$1');

    // Fix redundant duplicates e.g. "ltr:ml-4 rtl:mr-4 ltr:ml-4" (keep first occurrence pair)
    // This is harder to fix generally; just fix the obvious double-prefix pattern above

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changedFilesCount++;
        console.log('Cleaned: ' + file.replace(process.cwd(), ''));
    }
});

console.log('Total files cleaned: ' + changedFilesCount);
