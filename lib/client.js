var connection = null,
    client = null,
    session = null,
    datasets = [],
    activeDataset = null,
    busy = 0;

function setup(conn, clt) {
    connection = conn;
    client = clt;
    session = client.session;
}

function getConnection() {
    return connection;
}

function getClient() {
    return client;
}

function onError(error) {
    busy--;
    console.log(error);
}

function onReady() {
    busy--;
}

function call(method, args) {
    busy++;
    return session.call(method, args);
}

function listDatasets(callback) {
    call('light.viz.dataset.list', [])
        .then(
            (list) => {
                datasets = list;
                onReady();
                callback(datasets);
            },
            onError);
}

function updateDatasetOpacity(opacity) {
    call('light.viz.dataset.opacity', [opacity])
        .then(onReady(), onError);
}

function loadDataset(dsName, callback) {
    if(activeDataset !== dsName) {
        activeDataset = dsName;
        call('light.viz.dataset.load', [activeDataset])
            .then( ds => {
                onReady();
                callback(ds);
            }, onError);
    }
}

function updateTime(timeIdx) {
    call('light.viz.dataset.time', [timeIdx])
        .then( onReady, onError);
}

function updateColor(field) {
    call('light.viz.dataset.color', [field])
        .then( onReady, onError);
}

export default {
    setup,
    getConnection,
    listDatasets,
    updateDatasetOpacity,
    loadDataset,
    getClient,
    updateTime,
    updateColor,
}
