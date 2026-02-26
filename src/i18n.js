import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import frTranslation from './locales/fr.json';
import arTranslation from './locales/ar.json';
import zhTranslation from './locales/zh.json';
import deTranslation from './locales/de.json';
import ptTranslation from './locales/pt.json';
import hiTranslation from './locales/hi.json';
import urTranslation from './locales/ur.json';

const resources = {
    en: { translation: enTranslation },
    es: { translation: esTranslation },
    fr: { translation: frTranslation },
    ar: { translation: arTranslation },
    zh: { translation: zhTranslation },
    de: { translation: deTranslation },
    pt: { translation: ptTranslation },
    hi: { translation: hiTranslation },
    ur: { translation: urTranslation },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('i18nextLng') || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

// Handle RTL support dynamically based on the active language
document.documentElement.dir = i18n.dir();

i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = i18n.dir(lng);
});

export default i18n;
