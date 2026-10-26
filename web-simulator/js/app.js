(function () {
    const CATEGORY_ORDER = ['roles', 'information', 'actions', 'strategy'];

    let currentGesture = null;
    let playToken = 0;
    let activeCategory = 'all';
    let searchTerm = '';

    const els = {};

    function cacheEls() {
        els.searchInput = document.getElementById('search-input');
        els.categoryList = document.getElementById('category-list');
        els.gestureList = document.getElementById('gesture-list');
        els.gestureName = document.getElementById('gesture-name');
        els.gestureDesc = document.getElementById('gesture-desc');
        els.langBtns = Array.from(document.querySelectorAll('.lang-btn'));
    }

    function matchesSearch(g) {
        if (!searchTerm) return true;
        const name = I18N.t(`gestures.${g.id}.name`).toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || g.id.includes(searchTerm.toLowerCase());
    }

    function makeListItem(g) {
        const btn = document.createElement('button');
        btn.className = 'gesture-item';
        btn.dataset.id = g.id;
        btn.type = 'button';
        btn.textContent = I18N.t(`gestures.${g.id}.name`);
        if (!g.animation) btn.classList.add('no-animation');
        btn.addEventListener('click', () => selectGesture(g.id, { updateHash: true }));
        return btn;
    }

    function renderLists() {
        els.gestureList.innerHTML = '';

        const filtered = Gestures.all.filter(g =>
            (activeCategory === 'all' || g.category === activeCategory) && matchesSearch(g)
        );

        if (filtered.length === 0) {
            const p = document.createElement('p');
            p.className = 'empty-note';
            p.textContent = I18N.t('ui.noResults');
            els.gestureList.appendChild(p);
        } else {
            filtered.forEach(g => els.gestureList.appendChild(makeListItem(g)));
        }

        highlightSelected();
    }

    function highlightSelected() {
        document.querySelectorAll('.gesture-item').forEach(el => {
            el.classList.toggle('selected', !!currentGesture && el.dataset.id === currentGesture.id);
        });
    }

    function renderCategoryChips() {
        els.categoryList.innerHTML = '';
        const chips = [{ id: 'all', key: null }].concat(
            CATEGORY_ORDER.map(c => ({ id: c, key: `categories.${c}` }))
        );
        chips.forEach(c => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'category-chip';
            btn.textContent = c.key ? I18N.t(c.key) : I18N.t('ui.categoriesLabel');
            btn.classList.toggle('active', activeCategory === c.id);
            btn.addEventListener('click', () => {
                activeCategory = c.id;
                renderCategoryChips();
                renderLists();
            });
            els.categoryList.appendChild(btn);
        });
    }

    function renderDetail() {
        if (!currentGesture) {
            els.gestureName.textContent = '';
            els.gestureDesc.textContent = I18N.t('ui.selectPrompt');
            return;
        }

        const g = currentGesture;
        els.gestureName.textContent = I18N.t(`gestures.${g.id}.name`);
        let desc = I18N.t(`gestures.${g.id}.description`);
        if (!g.animation) desc += ' ' + I18N.t('ui.noAnimation');
        els.gestureDesc.textContent = desc;
    }

    // Plays the gesture's animation on a loop until a different gesture is
    // selected (playToken changes), so the avatar is always demonstrating
    // whatever is currently selected without any manual playback controls.
    function loopCurrent() {
        const token = ++playToken;
        const g = currentGesture;
        if (!g || !g.animation) return;

        function step() {
            if (token !== playToken) return;
            Avatar.playURL(g.animation, {
                onDone: () => { if (token === playToken) step(); },
            });
        }
        step();
    }

    function selectGesture(id, { updateHash = false } = {}) {
        const g = Gestures.byId(id);
        if (!g) return;
        playToken++; // invalidate any in-flight loop
        Avatar.stop();
        currentGesture = g;
        renderDetail();
        highlightSelected();
        loopCurrent();
        if (updateHash) {
            location.hash = `#/gesture/${id}`;
        }
    }

    function highlightLangButtons() {
        els.langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === I18N.current));
    }

    function handleHash() {
        const m = location.hash.match(/^#\/gesture\/([\w-]+)$/);
        if (m && Gestures.byId(m[1])) {
            selectGesture(m[1]);
        }
    }

    function renderAll() {
        renderCategoryChips();
        renderLists();
        renderDetail();
        highlightLangButtons();
    }

    function wireEvents() {
        els.searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.trim();
            renderLists();
        });
        els.langBtns.forEach(b => {
            b.addEventListener('click', () => I18N.setLanguage(b.dataset.lang));
        });
        window.addEventListener('hashchange', handleHash);
        I18N.onChange(renderAll);
    }

    async function init() {
        cacheEls();
        await Promise.all([I18N.ready, Gestures.ready, Avatar.ready]);
        wireEvents();
        renderAll();
        handleHash();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
