const https = require('https');
const fs = require('fs');
const path = require('path');

// Fills in ONLY the keys that are missing from each locale file
// Does NOT overwrite existing translated keys, UNLESS they have broken placeholders

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
    { code: 'it', file: 'it.json' },
    { code: 'ja', file: 'ja.json' },
    { code: 'ru', file: 'ru.json' },
    { code: 'ko', file: 'ko.json' },
    { code: 'tr', file: 'tr.json' },
    { code: 'nl', file: 'nl.json' },
    { code: 'fa', file: 'fa.json' },
    { code: 'he', file: 'he.json' },
    { code: 'vi', file: 'vi.json' },
    { code: 'id', file: 'id.json' },
    { code: 'th', file: 'th.json' },
    { code: 'pl', file: 'pl.json' },
];

function fetchTranslationBatch(texts, targetLang) {
    return new Promise((resolve) => {
        const batchMap = {};
        let index = 0;

        // Better placeholder protection: use [V0], [V1], etc.
        const processedTexts = texts.map(text => {
            const variables = [];
            const protectedText = text.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
                const marker = `[V${variables.length}]`;
                variables.push(p1);
                return marker;
            });
            batchMap[index] = variables;
            index++;
            return protectedText;
        });

        const combined = processedTexts.join(' ||| ');
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(combined)}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    let translated = parsed[0].map(item => item[0]).join('');

                    const results = translated.split('|||').map((s, i) => {
                        let text = s.trim();
                        // Restore variables
                        const vars = batchMap[i];
                        if (vars) {
                            vars.forEach((v, vIdx) => {
                                // Google sometimes adds spaces inside brackets like [ V0 ]
                                const regex = new RegExp(`\\[\\s*V${vIdx}\\s*\\]`, 'g');
                                text = text.replace(regex, `{{${v}}}`);
                            });
                        }
                        return text;
                    });

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

function hasBrokenPlaceholders(translated, source) {
    if (typeof source !== 'string') return false;
    const sourceMatches = source.match(/\{\{([^}]+)\}\}/g) || [];
    const translatedMatches = translated.match(/\{\{([^}]+)\}\}/g) || [];

    if (sourceMatches.length !== translatedMatches.length) return true;

    // Check if keys match exactly
    for (let i = 0; i < sourceMatches.length; i++) {
        if (!translated.includes(sourceMatches[i])) return true;
    }
    return false;
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
        } else {
            console.log(`  ! ${file} does not exist, skipping...`);
            continue;
        }

        // Find keys that are missing OR have broken placeholders
        const missingKeys = Object.keys(flatEn).filter(k => {
            const existingVal = existing[k];
            const enVal = flatEn[k];

            if (existingVal === undefined || existingVal === enVal) return true;

            // Critical check: are placeholders broken?
            if (hasBrokenPlaceholders(existingVal, enVal)) {
                return true;
            }

            return false;
        });

        if (missingKeys.length === 0) {
            console.log(`  ✓ ${file} is already up to date`);
            continue;
        }

        console.log(`  Translating/Fixing ${missingKeys.length} keys to ${code}...`);

        const missingValues = missingKeys.map(k => flatEn[k]);
        const BATCH_SIZE = 15; // Slightly smaller batch for safety
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

            process.stdout.write(`  ${Math.min(i + BATCH_SIZE, missingValues.length)}/${missingValues.length} keys processed...\r`);
            await delay(150);
        }

        // Merge newly translated missing keys into existing
        const merged = { ...flatEn, ...existing };
        for (let i = 0; i < missingKeys.length; i++) {
            merged[missingKeys[i]] = translatedValues[i];
        }

        const translatedObj = unflattenObject(merged);
        fs.writeFileSync(filePath, JSON.stringify(translatedObj, null, 4));
        console.log(`\n  ✓ Saved ${file} (${missingKeys.length} keys updated)`);
    }

    console.log('\nAll translations complete!');
}

main();
