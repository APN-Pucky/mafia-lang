(function () {
    const CATEGORY_ORDER = ['roles', 'information', 'actions', 'strategy'];

    let currentGesture = null;
    let playToken = 0;
    let playState = 'idle'; // idle | playing
    let currentSpeed = 1;
    let activeCategory = 'all';
    let searchTerm = '';

    let nativeSpeedUp, nativeSpeedDown, nativeSpeedReset;
    const els = {};

    function cacheEls() {
        nativeSpeedUp = document.querySelector('.bttnSpeedUp.av0');
        nativeSpeedDown = document.querySelector('.bttnSpeedDown.av0');
        nativeSpeedReset = document.querySelector('.bttnSpeedReset.av0');

        els.searchInput = document.getElementById('search-input');
        els.categoryList = document.getElementById('category-list');
        els.gestureList = document.getElementById('gesture-list');
        els.gestureName = document.getElementById('gesture-name');
        els.gestureDesc = document.getElementById('gesture-desc');
        els.playBtn = document.getElementById('btn-play');
        els.pauseBtn = document.getElementById('btn-pause');
        els.replayBtn = document.getElementById('btn-replay');
        els.resetBtn = document.getElementById('btn-reset');
        els.speedBtns = Array.from(document.querySelectorAll('.speed-btn'));
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

    function setPlayState(state) {
        playState = state;
        const hasAnim = !!(currentGesture && currentGesture.animation);
        els.playBtn.disabled = !hasAnim || state === 'playing';
        els.pauseBtn.disabled = !hasAnim || state !== 'playing';
        els.replayBtn.disabled = !hasAnim;
        els.resetBtn.disabled = !hasAnim || state === 'idle';
    }

    // Plays the current gesture's animation from the start. Gestures with
    // genuine continuous/repeating motion (flagged `loop: true` in
    // gestures.json) are auto-replayed; a static held pose is played once
    // and left alone instead of flickering back through neutral for no
    // benefit, since there's no motion left to keep demonstrating.
    //
    // CWASA plays a SiGML document as an atomic unit and doesn't expose a
    // true mid-animation pause/seek, so "Pause"/"Reset" below just stop
    // playback outright rather than freeze a frame — the same constraint
    // noted in Kozha's own CWASA-based player.
    function playCurrent() {
        const token = ++playToken;
        const g = currentGesture;
        if (!g || !g.animation) return;

        function step() {
            if (token !== playToken) return;
            Avatar.playURL(g.animation, {
                onSign: () => setPlayState('playing'),
                onDone: () => {
                    if (token !== playToken) return;
                    if (g.loop) { step(); return; }
                    setPlayState('idle');
                },
            });
        }
        step();
    }

    function pauseCurrent() {
        playToken++; // stop any pending loop continuation
        Avatar.stop();
        setPlayState('idle');
    }

    function replayCurrent() {
        if (!currentGesture || !currentGesture.animation) return;
        Avatar.stop();
        playCurrent();
    }

    function resetAvatar() {
        playToken++;
        Avatar.stop();
        setPlayState('idle');
    }

    function setSpeed(mult) {
        currentSpeed = mult;
        nativeSpeedReset.click();
        if (mult === 0.5) {
            for (let i = 0; i < 5; i++) nativeSpeedDown.click();
        } else if (mult === 1.5) {
            for (let i = 0; i < 3; i++) nativeSpeedUp.click();
        }
        els.speedBtns.forEach(b => b.classList.toggle('active', Number(b.dataset.speed) === mult));
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
        renderCategoryChips();
        renderLists();
        renderDetail();
        setPlayState(playState);
        highlightLangButtons();
    }

    function wireEvents() {
        els.playBtn.addEventListener('click', playCurrent);
        els.pauseBtn.addEventListener('click', pauseCurrent);
        els.replayBtn.addEventListener('click', replayCurrent);
        els.resetBtn.addEventListener('click', resetAvatar);
        els.speedBtns.forEach(b => b.addEventListener('click', () => setSpeed(Number(b.dataset.speed))));
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
        setSpeed(currentSpeed);
        renderAll();
        handleHash();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
