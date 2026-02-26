/**
 * generate-pwa-icons.cjs
 * 
 * Generates all required PWA icon sizes from a source PNG.
 * 
 * Usage: node generate-pwa-icons.cjs
 * Requirements: npm install -D sharp
 */

const fs = require('fs');
const path = require('path');

const sharp = require('sharp');

const SOURCE = path.join(__dirname, 'pwa-icon-source.png'); // place your 512x512 source here
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
    if (!fs.existsSync(SOURCE)) {
        console.error('❌ Source file not found: pwa-icon-source.png');
        console.log('Place your 512x512 icon as src/utils/pwa-icon-source.png and re-run.');
        process.exit(1);
    }

    for (const size of SIZES) {
        const outPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
        await sharp(SOURCE)
            .resize(size, size)
            .png()
            .toFile(outPath);
        console.log(`✓ Generated icon-${size}x${size}.png`);
    }

    // Also copy 192 as apple-touch-icon
    await sharp(SOURCE)
        .resize(180, 180)
        .png()
        .toFile(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');

    console.log('\nAll PWA icons generated in /public/icons/');
}

generateIcons().catch(console.error);
