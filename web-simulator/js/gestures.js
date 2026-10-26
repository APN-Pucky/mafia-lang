const Gestures = (() => {
    let all = [];
    let byIdMap = {};

    const ready = fetch('gestures/gestures.json')
        .then(r => r.json())
        .then(data => {
            all = data;
            byIdMap = Object.fromEntries(data.map(g => [g.id, g]));
        });

    function byId(id) {
        return byIdMap[id];
    }

    function byCategory(category) {
        return all.filter(g => g.category === category);
    }

    return {
        ready,
        get all() { return all; },
        byId,
        byCategory,
    };
})();
