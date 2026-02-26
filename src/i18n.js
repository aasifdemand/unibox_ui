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
import itTranslation from './locales/it.json';
import jaTranslation from './locales/ja.json';
import ruTranslation from './locales/ru.json';
import koTranslation from './locales/ko.json';
import trTranslation from './locales/tr.json';
import nlTranslation from './locales/nl.json';
import faTranslation from './locales/fa.json';
import heTranslation from './locales/he.json';
import viTranslation from './locales/vi.json';
import idTranslation from './locales/id.json';
import thTranslation from './locales/th.json';
import plTranslation from './locales/pl.json';

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
    it: { translation: itTranslation },
    ja: { translation: jaTranslation },
    ru: { translation: ruTranslation },
    ko: { translation: koTranslation },
    tr: { translation: trTranslation },
    nl: { translation: nlTranslation },
    fa: { translation: faTranslation },
    he: { translation: heTranslation },
    vi: { translation: viTranslation },
    id: { translation: idTranslation },
    th: { translation: thTranslation },
    pl: { translation: plTranslation },
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
