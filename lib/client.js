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


// ----------------------------------------------------------------------------
// Dataset
// ----------------------------------------------------------------------------

function addThumbnail(imageElem) {
    if(imageElem.dataset.name) {
        const dsName = imageElem.dataset.name;
        imageElem.dataset.name = null;
        call('light.viz.dataset.thumbnail', [dsName]).then(
            thumbnails => {
                console.log(thumbnails);
                onReady();
                while(thumbnails.length) {
                    imageElem.dataset['src-' + thumbnails.length] = thumbnails.pop();
                }
                imageElem.src = imageElem.dataset['src-1'];
            },
            onError);
    }

}

function resetCamera() {
    call('viewport.camera.reset', [ -1 ]).then( onReady, onError);
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

// ----------------------------------------------------------------------------
// Clip
// ----------------------------------------------------------------------------

function updateClipPosition({xPosition, yPosition, zPosition}) {
    call('light.viz.clip.position', [xPosition, yPosition, zPosition])
        .then( onReady, onError);
}

function updateClipInsideOut(x,y,z) {
    call('light.viz.clip.insideout', [x,y,z])
        .then( onReady, onError);
}


function updateClipColor(field) {
    call('light.viz.clip.color', [field])
        .then( onReady, onError);
}


function enableClip(enable) {
    call('light.viz.clip.enable', [enable])
        .then( onReady, onError);
}

// ----------------------------------------------------------------------------

function updateRepresentation(type, mode) {
    call('light.viz.TYPE.representation'.replace(/TYPE/, type), [mode])
        .then( onReady, onError);
}

export default {
    addThumbnail,
    enableClip,
    getClient,
    getConnection,
    listDatasets,
    loadDataset,
    resetCamera,
    setup,
    updateClipColor,
    updateClipInsideOut,
    updateClipPosition,
    updateColor,
    updateDatasetOpacity,
    updateRepresentation,
    updateTime,
}
