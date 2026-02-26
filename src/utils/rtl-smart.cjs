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

// Helper: replace a pattern with paired ltr:/rtl: variants, skipping already-prefixed occurrences
function pairReplace(content, pattern, ltrClass, rtlClass) {
    // Match the pattern only when NOT already preceded by ltr: or rtl:
    return content.replace(new RegExp(`(?<!(?:ltr|rtl):(?:[a-z-]+:)*)${pattern}`, 'g'), (match) => {
        return `ltr:${match} rtl:${rtlClass}`;
    });
}

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    // Skip already-processed files (check for ltr: prefix presence)
    // We still process but skip already-converted tokens

    // === MARGINS ===
    // ml-{n} → ltr:ml-{n} rtl:mr-{n}
    content = content.replace(/(?<![lr]tr:)(?<!\w)\bml-([a-zA-Z0-9\[\]\-.]+)\b/g, (match, val) => {
        return `ltr:ml-${val} rtl:mr-${val}`;
    });
    // mr-{n} → ltr:mr-{n} rtl:ml-{n}
    content = content.replace(/(?<![lr]tr:)(?<!\w)\bmr-([a-zA-Z0-9\[\]\-.]+)\b/g, (match, val) => {
        return `ltr:mr-${val} rtl:ml-${val}`;
    });

    // === PADDINGS ===
    // pl-{n} → ltr:pl-{n} rtl:pr-{n}
    content = content.replace(/(?<![lr]tr:)(?<!\w)\bpl-([a-zA-Z0-9\[\]\-.]+)\b/g, (match, val) => {
        return `ltr:pl-${val} rtl:pr-${val}`;
    });
    // pr-{n} → ltr:pr-{n} rtl:pl-{n}
    content = content.replace(/(?<![lr]tr:)(?<!\w)\bpr-([a-zA-Z0-9\[\]\-.]+)\b/g, (match, val) => {
        return `ltr:pr-${val} rtl:pl-${val}`;
    });

    // === TEXT ALIGNMENT ===
    content = content.replace(/(?<![lr]tr:)(?<!\w)\btext-left\b/g, 'ltr:text-left rtl:text-right');
    content = content.replace(/(?<![lr]tr:)(?<!\w)\btext-right\b/g, 'ltr:text-right rtl:text-left');

    // === BORDER SIDES ===
    // border-l or border-l-{size} or border-l-{color} 
    // But NOT border-left (full word). Only border-l followed by end-of-word or -suffix
    content = content.replace(/(?<![lr]tr:)(?<!\w)\bborder-l(-[a-zA-Z0-9\[\]\-.]+)?\b(?!eft)/g, (match, suffix) => {
        const suf = suffix || '';
        return `ltr:border-l${suf} rtl:border-r${suf}`;
    });
    content = content.replace(/(?<![lr]tr:)(?<!\w)\bborder-r(-[a-zA-Z0-9\[\]\-.]+)?\b(?!ight)/g, (match, suffix) => {
        const suf = suffix || '';
        return `ltr:border-r${suf} rtl:border-l${suf}`;
    });

    // === ROUNDED CORNERS ===
    content = content.replace(/(?<![lr]tr:)(?<!\w)\brounded-l(-[a-zA-Z0-9\[\]\-.]+)?\b/g, (match, suffix) => {
        const suf = suffix || '';
        return `ltr:rounded-l${suf} rtl:rounded-r${suf}`;
    });
    content = content.replace(/(?<![lr]tr:)(?<!\w)\brounded-r(-[a-zA-Z0-9\[\]\-.]+)?\b/g, (match, suffix) => {
        const suf = suffix || '';
        return `ltr:rounded-r${suf} rtl:rounded-l${suf}`;
    });
    content = content.replace(/(?<![lr]tr:)(?<!\w)\brounded-tl(-[a-zA-Z0-9\[\]\-.]+)?\b/g, (match, suffix) => {
        const suf = suffix || '';
        return `ltr:rounded-tl${suf} rtl:rounded-tr${suf}`;
    });
    content = content.replace(/(?<![lr]tr:)(?<!\w)\brounded-tr(-[a-zA-Z0-9\[\]\-.]+)?\b/g, (match, suffix) => {
        const suf = suffix || '';
        return `ltr:rounded-tr${suf} rtl:rounded-tl${suf}`;
    });
    content = content.replace(/(?<![lr]tr:)(?<!\w)\brounded-bl(-[a-zA-Z0-9\[\]\-.]+)?\b/g, (match, suffix) => {
        const suf = suffix || '';
        return `ltr:rounded-bl${suf} rtl:rounded-br${suf}`;
    });
    content = content.replace(/(?<![lr]tr:)(?<!\w)\brounded-br(-[a-zA-Z0-9\[\]\-.]+)?\b/g, (match, suffix) => {
        const suf = suffix || '';
        return `ltr:rounded-br${suf} rtl:rounded-bl${suf}`;
    });

    // === ABSOLUTE/FIXED POSITIONING ===
    // left-{n} → ltr:left-{n} rtl:right-{n}  (only pure positioning, not in color names)
    content = content.replace(/(?<![lr]tr:)(?<!\w)\bleft-([0-9\[\]\-.\/]+)\b/g, (match, val) => {
        return `ltr:left-${val} rtl:right-${val}`;
    });
    content = content.replace(/(?<![lr]tr:)(?<!\w)\bright-([0-9\[\]\-.\/]+)\b/g, (match, val) => {
        return `ltr:right-${val} rtl:left-${val}`;
    });

    // === TRANSLATE X (for slide animations like sidebars) ===
    content = content.replace(/(?<![lr]tr:)(?<!\w)\b-translate-x-full\b/g, 'ltr:-translate-x-full rtl:translate-x-full');
    content = content.replace(/(?<![lr]tr:)(?<!\w)\btranslate-x-full\b/g, 'ltr:translate-x-full rtl:-translate-x-full');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changedFilesCount++;
        console.log('RTL paired: ' + file.replace(process.cwd(), ''));
    }
});

console.log('\nTotal files updated: ' + changedFilesCount);
