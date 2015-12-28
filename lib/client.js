var connection = null,
    client = null,
    session = null,
    datasets = [],
    activeDataset = null,
    busy = 0;

export function setup(conn, clt) {
    connection = conn;
    client = clt;
    session = client.session;
}

export function getConnection() {
    return connection;
}

export function getClient() {
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

export function addThumbnail(imageElem) {
    if(imageElem.dataset.name) {
        const dsName = imageElem.dataset.name;
        imageElem.dataset.name = null;
        call('light.viz.dataset.thumbnail', [dsName]).then(
            thumbnails => {
                onReady();
                while(thumbnails.length) {
                    imageElem.dataset['src-' + thumbnails.length] = thumbnails.pop();
                }
                imageElem.src = imageElem.dataset['src-1'];
            },
            onError);
    }

}

export function resetCamera() {
    call('viewport.camera.reset', [ -1 ]).then( onReady, onError);
}

export function listDatasets(callback) {
    call('light.viz.dataset.list', [])
        .then(
            (list) => {
                datasets = list;
                onReady();
                callback(datasets);
            },
            onError);
}

export function updateDatasetOpacity(opacity) {
    call('light.viz.dataset.opacity', [opacity])
        .then(onReady(), onError);
}

export function loadDataset(dsName, callback) {
    if(activeDataset !== dsName) {
        activeDataset = dsName;
        call('light.viz.dataset.load', [activeDataset])
            .then( ds => {
                onReady();
                callback(ds);
            }, onError);
    }
}

export function updateTime(timeIdx) {
    call('light.viz.dataset.time', [timeIdx])
        .then( onReady, onError);
}

// ----------------------------------------------------------------------------
// Clip
// ----------------------------------------------------------------------------

export function updateClipPosition({xPosition, yPosition, zPosition}) {
    call('light.viz.clip.position', [xPosition, yPosition, zPosition])
        .then( onReady, onError);
}

export function updateClipInsideOut(x,y,z) {
    call('light.viz.clip.insideout', [x,y,z])
        .then( onReady, onError);
}

// ----------------------------------------------------------------------------
// Contours
// ----------------------------------------------------------------------------

export function updateContourValues(values) {
    call('light.viz.contour.values', [values])
        .then( onReady, onError);
}

export function updateContourBy(field) {
    call('light.viz.contour.by', [field])
        .then( onReady, onError);
}

// ----------------------------------------------------------------------------
// Slices
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// Generics
// ----------------------------------------------------------------------------

export function updateColor(type, field) {
    call('light.viz.TYPE.color'.replace(/TYPE/, type), [field])
        .then( onReady, onError);
}

export function enable(name, enabled) {
    call('light.viz.TYPE.enable'.replace(/TYPE/, name), [enabled])
        .then( onReady, onError);
}

// ----------------------------------------------------------------------------

export function updateRepresentation(type, mode) {
    call('light.viz.TYPE.representation'.replace(/TYPE/, type), [mode])
        .then( onReady, onError);
}

export default {
    addThumbnail,
    enable,
    getClient,
    getConnection,
    listDatasets,
    loadDataset,
    resetCamera,
    setup,
    updateClipInsideOut,
    updateClipPosition,
    updateColor,
    updateDatasetOpacity,
    updateRepresentation,
    updateTime,
}
