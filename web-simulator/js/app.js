(function () {
    let currentGesture = null;
    let playToken = 0;
    let searchTerm = '';

    const els = {};

    function cacheEls() {
        els.searchInput = document.getElementById('search-input');
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

        const filtered = Gestures.all.filter(matchesSearch);
        // Natural/numeric-aware sort by display name — besides reading
        // alphabetically, this keeps e.g. "Kick Out Player 2" before
        // "Kick Out Player 10" (not string order), and as a side effect
        // clusters "Kick Out Player *" right next to "Kill Player *".
        filtered.sort((a, b) =>
            I18N.t(`gestures.${a.id}.name`).localeCompare(I18N.t(`gestures.${b.id}.name`), undefined, { numeric: true, sensitivity: 'base' })
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

    // Plays the current gesture's animation from the start. Gestures with
    // genuine continuous/repeating motion (flagged `loop: true` in
    // gestures.json) are auto-replayed; a static held pose is played once
    // and left alone instead of flickering back through neutral for no
    // benefit, since there's no motion left to keep demonstrating.
    function playCurrent() {
        const token = ++playToken;
        const g = currentGesture;
        if (!g || !g.animation) return;

        function step() {
            if (token !== playToken) return;
            Avatar.playURL(g.animation, {
                onDone: () => {
                    if (token !== playToken) return;
                    if (g.loop) step();
                },
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
        playCurrent();
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
