const Avatar = (() => {
    let _config = {};
    let _playingTimeout = null;
    let _stopRequested = false;

    const ready = fetch('avatar.json')
        .then(r => r.json())
        .then(cfg => {
            Object.assign(_config, cfg);
        });

    function signSiGML(sigml, callbacks = {}) {
        _stopRequested = false;
        if (!sigml) {
            if (callbacks.onError) callbacks.onError('no sigml provided');
            return;
        }
        CWASA.playSiGMLText(sigml);
        if (callbacks.onSign) callbacks.onSign();
        _playingTimeout = setTimeout(() => {
            if (!_stopRequested && callbacks.onDone) callbacks.onDone();
        }, _config.signDuration || 1000);
    }

    function playURL(url, callbacks = {}) {
        _stopRequested = false;
        if (!url) {
            if (callbacks.onError) callbacks.onError('no animation url provided');
            return;
        }
        CWASA.playSiGMLURL(new URL(url, window.location.href).href);
        if (callbacks.onSign) callbacks.onSign();
        _playingTimeout = setTimeout(() => {
            if (!_stopRequested && callbacks.onDone) callbacks.onDone();
        }, _config.signDuration || 1000);
    }

    function stop() {
        _stopRequested = true;
        clearTimeout(_playingTimeout);
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
