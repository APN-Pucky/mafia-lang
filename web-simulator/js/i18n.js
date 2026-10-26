const I18N = (() => {
    const SUPPORTED = ['en', 'uk', 'ru', 'de'];
    const STORAGE_KEY = 'mafia-signs-lang';
    const cache = {};
    const listeners = [];

    let current = null;
    let dict = {};

    function safeGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }

    function safeSet(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }

    function detectDefault() {
        const stored = safeGet(STORAGE_KEY);
        if (stored && SUPPORTED.includes(stored)) return stored;
        const langs = navigator.languages && navigator.languages.length
            ? navigator.languages
            : [navigator.language || 'en'];
        for (const lang of langs) {
            const short = lang.slice(0, 2).toLowerCase();
            if (SUPPORTED.includes(short)) return short;
        }
        return 'en';
    }

    async function load(lang) {
        if (cache[lang]) return cache[lang];
        const resp = await fetch(`i18n/${lang}.json`);
        const data = await resp.json();
        cache[lang] = data;
        return data;
    }

    function t(key) {
        return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
    }

    function apply(root = document) {
        root.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.getAttribute('data-i18n'));
        });
        root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
        });
        root.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
        });
        document.documentElement.lang = current;
    }

    async function setLanguage(lang) {
        if (!SUPPORTED.includes(lang)) lang = 'en';
        dict = await load(lang);
        current = lang;
        safeSet(STORAGE_KEY, lang);
        apply();
        listeners.forEach(fn => fn(lang));
    }

    function onChange(fn) {
        listeners.push(fn);
    }

    const ready = setLanguage(detectDefault());

    return {
        SUPPORTED,
        ready,
        t,
        apply,
        setLanguage,
        onChange,
        get current() { return current; },
    };
})();
