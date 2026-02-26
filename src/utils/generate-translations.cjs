const https = require('https');
const fs = require('fs');
const path = require('path');

const localesDir = path.join(process.cwd(), 'src', 'locales');
const enJson = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

const langs = ['ar', 'zh-CN', 'de', 'pt', 'hi'];

function fetchTranslationBatch(texts, targetLang) {
    return new Promise((resolve) => {
        // We pack multiple texts into one request by separating them with a unique sequence like |||
        const combined = texts.join(' ||| ');
        // We also protect {{...}} from translation
        let safeText = combined.replace(/\{\{([^}]+)\}\}/g, '__$1__');

        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(safeText)}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    let translated = parsed[0].map(item => item[0]).join('');

                    // Restore variables
                    translated = translated.replace(/__([^_]+)__/g, '{{$1}}');
                    // In Arabic or Chinese, spaces might be added around variables, clean them up
                    translated = translated.replace(/\{\{ /g, '{{').replace(/ \}\}/g, '}}');

                    const results = translated.split('|||').map(s => s.trim());
                    // If split length doesn't match due to Google removing |||, fallback
                    if (results.length !== texts.length) {
                        resolve(texts); // fallback to original texts if broken
                    } else {
                        resolve(results);
                    }
                } catch (e) {
                    resolve(texts);
                }
            });
        }).on('error', () => {
            resolve(texts);
        });
    });
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Flat structure representation to batch
function flattenObject(obj, prefix = '') {
    let result = {};
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(result, flattenObject(obj[key], prefix + key + '.'));
        } else if (typeof obj[key] === 'string') {
            result[prefix + key] = obj[key];
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
    const keys = Object.keys(flatEn);
    const values = keys.map(k => flatEn[k]);

    // Batch values (up to 20 at a time to stay under URL size limits)
    const BATCH_SIZE = 20;

    for (const lang of langs) {
        console.log(`Translating to ${lang}...`);
        const translatedValues = [];

        for (let i = 0; i < values.length; i += BATCH_SIZE) {
            const batch = values.slice(i, i + BATCH_SIZE);
            const stringBatch = batch.filter(v => typeof v === 'string');

            if (stringBatch.length > 0) {
                const results = await fetchTranslationBatch(stringBatch, lang);

                let resultIdx = 0;
                for (const v of batch) {
                    if (typeof v === 'string') {
                        translatedValues.push(results[resultIdx] || v); // fallback
                        resultIdx++;
                    } else {
                        translatedValues.push(v);
                    }
                }
            } else {
                translatedValues.push(...batch);
            }

            await delay(100); // polite delay
        }

        let translatedFlat = {};
        for (let i = 0; i < keys.length; i++) {
            translatedFlat[keys[i]] = translatedValues[i];
        }

        const translatedObj = unflattenObject(translatedFlat);
        const filename = lang === 'zh-CN' ? 'zh.json' : `${lang}.json`;
        fs.writeFileSync(path.join(localesDir, filename), JSON.stringify(translatedObj, null, 4));
        console.log(`Saved ${filename}`);
    }
    console.log("Translation complete!");
}

main();
