import fs from 'fs';

const files = [
    'c:/Users/Aasif/Desktop/unibox_ui/src/locales/es.json',
    'c:/Users/Aasif/Desktop/unibox_ui/src/locales/fr.json'
];

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let data = JSON.parse(content);

        // Merge sender and template from root to modals
        if (data.sender) {
            data.modals.sender = data.sender;
            delete data.sender;
        }
        if (data.template) {
            data.modals.template = data.template;
            delete data.template;
        }

        fs.writeFileSync(file, JSON.stringify(data, null, 4));
        console.log(`Successfully updated ${file}`);
    } catch (e) {
        console.error(`Error processing ${file}:`, e);
    }
});
