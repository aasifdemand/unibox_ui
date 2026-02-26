const https = require('https');
const fs = require('fs');
const path = require('path');

// Fills in ONLY the keys that are missing from each locale file
// Does NOT overwrite existing translated keys

const localesDir = path.join(process.cwd(), 'src', 'locales');
const enJson = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

const langs = [
    { code: 'ar', file: 'ar.json' },
    { code: 'zh-CN', file: 'zh.json' },
    { code: 'de', file: 'de.json' },
    { code: 'pt', file: 'pt.json' },
    { code: 'hi', file: 'hi.json' },
    { code: 'es', file: 'es.json' },
    { code: 'fr', file: 'fr.json' },
    { code: 'ur', file: 'ur.json' },
];

function fetchTranslationBatch(texts, targetLang) {
    return new Promise((resolve) => {
        const combined = texts.join(' ||| ');
        let safeText = combined.replace(/\{\{([^}]+)\}\}/g, '__$1__');
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(safeText)}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    let translated = parsed[0].map(item => item[0]).join('');
                    translated = translated.replace(/__([^_]+)__/g, '{{$1}}');
                    translated = translated.replace(/\{\{ /g, '{{').replace(/ \}\}/g, '}}');
                    const results = translated.split('|||').map(s => s.trim());
                    if (results.length !== texts.length) resolve(texts);
                    else resolve(results);
                } catch (e) {
                    resolve(texts);
                }
            });
        }).on('error', () => resolve(texts));
    });
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function flattenObject(obj, prefix = '') {
    let result = {};
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(result, flattenObject(obj[key], prefix + key + '.'));
        } else {
            result[prefix + key] = obj[key];
        }
    }
    return result;
}

function unflattenObject(flat) {
    let result = {};
    for (let key of Object.keys(flat)) {
        let parts = key.split('.');
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = flat[key];
    }
    return result;
}

async function main() {
    const flatEn = flattenObject(enJson);

    for (const { code, file } of langs) {
        console.log(`\nProcessing ${file}...`);
        const filePath = path.join(localesDir, file);

        // Load existing translations or empty object
        let existing = {};
        if (fs.existsSync(filePath)) {
            existing = flattenObject(JSON.parse(fs.readFileSync(filePath, 'utf8')));
        }

        // Find keys that are missing or still have the English value unchanged
        const missingKeys = Object.keys(flatEn).filter(k => {
            const existingVal = existing[k];
            const enVal = flatEn[k];
            // Missing entirely, or hasn't changed from English
            return existingVal === undefined || existingVal === enVal;
        });

        if (missingKeys.length === 0) {
            console.log(`  ✓ ${file} is already up to date`);
            continue;
        }

        console.log(`  Translating ${missingKeys.length} missing keys to ${code}...`);

        const missingValues = missingKeys.map(k => flatEn[k]);
        const BATCH_SIZE = 20;
        const translatedValues = [];

        for (let i = 0; i < missingValues.length; i += BATCH_SIZE) {
            const batch = missingValues.slice(i, i + BATCH_SIZE);
            const stringBatch = batch.filter(v => typeof v === 'string');

            if (stringBatch.length > 0) {
                const results = await fetchTranslationBatch(stringBatch, code);
                let resultIdx = 0;
                for (const v of batch) {
                    if (typeof v === 'string') {
                        translatedValues.push(results[resultIdx] || v);
                        resultIdx++;
                    } else {
                        translatedValues.push(v);
                    }
                }
            } else {
                translatedValues.push(...batch);
            }

            process.stdout.write(`  ${Math.min(i + BATCH_SIZE, missingValues.length)}/${missingValues.length} keys translated...\r`);
            await delay(120);
        }

        // Merge newly translated missing keys into existing
        const merged = { ...flatEn, ...existing }; // Start with all English keys as fallback
        for (let i = 0; i < missingKeys.length; i++) {
            merged[missingKeys[i]] = translatedValues[i];
        }

        const translatedObj = unflattenObject(merged);
        fs.writeFileSync(filePath, JSON.stringify(translatedObj, null, 4));
        console.log(`\n  ✓ Saved ${file} (${missingKeys.length} new keys translated)`);
    }

    console.log('\nAll translations complete!');
}

main();
