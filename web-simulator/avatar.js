const Avatar = (() => {
    let _config = {};
    let _fallbackTimeout = null;
    let _pending = false;
    let _onDoneCallback = null;

    const ready = fetch('avatar.json')
        .then(r => r.json())
        .then(cfg => {
            Object.assign(_config, cfg);
        });

    // CWASA's own 'animidle' event fires once the avatar truly finishes
    // playing (all <hns_sign> blocks in the file, not just the first one),
    // which is a much more reliable "done" signal than guessing a fixed
    // duration — important for multi-sign files where a short guess would
    // restart the loop mid-animation.
    CWASA.addHook('animidle', () => {
        if (!_pending) return;
        _pending = false;
        clearTimeout(_fallbackTimeout);
        const cb = _onDoneCallback;
        _onDoneCallback = null;
        if (cb) cb();
    });

    function _waitForDone(onDone) {
        _pending = true;
        _onDoneCallback = onDone || null;
        clearTimeout(_fallbackTimeout);
        // Safety net in case 'animidle' never fires for some reason.
        _fallbackTimeout = setTimeout(() => {
            if (!_pending) return;
            _pending = false;
            const cb = _onDoneCallback;
            _onDoneCallback = null;
            if (cb) cb();
        }, (_config.signDuration || 1000) * 6);
    }

    function signSiGML(sigml, callbacks = {}) {
        if (!sigml) {
            if (callbacks.onError) callbacks.onError('no sigml provided');
            return;
        }
        CWASA.playSiGMLText(sigml);
        if (callbacks.onSign) callbacks.onSign();
        _waitForDone(callbacks.onDone);
    }

    function playURL(url, callbacks = {}) {
        if (!url) {
            if (callbacks.onError) callbacks.onError('no animation url provided');
            return;
        }
        CWASA.playSiGMLURL(new URL(url, window.location.href).href);
        if (callbacks.onSign) callbacks.onSign();
        _waitForDone(callbacks.onDone);
    }

    function stop() {
        _pending = false;
        _onDoneCallback = null;
        clearTimeout(_fallbackTimeout);
        CWASA.stopSiGML();
    }

    return {
        ready,
        signSiGML,
        playURL,
        stop,
        get config() { return _config; },
    };
})();
