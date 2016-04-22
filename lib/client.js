let connection = null;
let client = null;
let session = null;
let datasets = [];
let activeDataset = null;
let structure = [];
let busy = 0;

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

function onError(name, error) {
  busy--;
  console.log(`Error in ${name}`);
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
  const dsName = imageElem.dataset.name;
  call('light.viz.dataset.thumbnail', [dsName]).then(
    thumbnails => {
      onReady();
      while (thumbnails.length) {
        const l = thumbnails.length;
        imageElem.dataset[`src-${l}`] = thumbnails.pop();
      }
      const index = parseInt(imageElem.dataset.index, 10) + 1;
      imageElem.src = imageElem.dataset[`src-${index}`];
    }, (e) =>
      console.log('thumbnails error:', dsName)
    );
}

export function saveThumbnail() {
  call('light.viz.dataset.thumbnail.save', [])
    .then(onReady(), onError.bind(undefined, 'light.viz.dataset.thumbnail.save'));
}

export function getBlockStructure(callback) {
  call('light.viz.dataset.getblockstructure')
    .then((list) => {
      structure = list;
      onReady();
      callback(structure);
    }, onError.bind(undefined, 'light.viz.dataset.getblockstructure'));
}

export function setColorMap(colorMap) {
  call('light.viz.dataset.colormap.set', [colorMap])
    .then(onReady(), onError.bind(undefined, 'light.viz.dataset.colormap.set'));
}

export function updateOpacityMap(controlPoints) {
  call('light.viz.opacitymap.set', [controlPoints])
    .then(onReady(), onError.bind(undefined, 'light.viz.opacitymap.set'));
}

export function setForegroundColor(color) {
  call('light.viz.foreground.color', [color])
    .then(onReady(), onError.bind(undefined, 'light.viz.foreground.color'));
}

export function setBackgroundColor(color) {
  call('light.viz.background.color', [color])
    .then(onReady(), onError.bind(undefined, 'light.viz.background.color'));
}

export function resetCamera() {
  call('viewport.camera.reset', [-1])
    .then(onReady, onError.bind(undefined, 'light.viz.camera.reset'));
}

export function listDatasets(callback) {
  call('light.viz.dataset.list', [])
    .then(
      (list) => {
        datasets = list;
        onReady();
        callback(datasets);
      },
      onError.bind(undefined, 'light.viz.dataset.list'));
}

export function updateDatasetOpacity(opacity) {
  call('light.viz.dataset.opacity', [opacity])
    .then(onReady(), onError.bind(undefined, 'light.viz.dataset.opacity'));
}

export function updateBlockVisibility(blockVisibilities) {
  call('light.viz.dataset.setblock.visibility', [blockVisibilities])
    .then(onReady(), onError.bind(undefined, 'light.viz.dataset.setblock.visibility'));
}

export function loadDataset(dsName, callback) {
  if (activeDataset !== dsName) {
    activeDataset = dsName;
    call('light.viz.dataset.load', [activeDataset])
      .then(ds => {
        onReady();
        callback(ds);
      }, onError.bind(undefined, 'light.viz.dataset.load'));
  }
}

export function updateTime(timeIdx) {
  call('light.viz.dataset.time', [timeIdx])
    .then(onReady, onError.bind(undefined, 'light.viz.dataset.time'));
}

// ----------------------------------------------------------------------------
// Clip
// ----------------------------------------------------------------------------

export function updateClipPosition({
  xPosition, yPosition, zPosition,
}) {
  call('light.viz.clip.position', [xPosition, yPosition, zPosition])
    .then(onReady, onError.bind(undefined, 'light.viz.clip.position'));
}

export function updateClipInsideOut(x, y, z) {
  call('light.viz.clip.insideout', [x, y, z])
    .then(onReady, onError.bind(undefined, 'light.viz.clip.insideout'));
}

// ----------------------------------------------------------------------------
// Contours
// ----------------------------------------------------------------------------

export function updateContourValues(values) {
  call('light.viz.contour.values', [values])
    .then(onReady, onError.bind(undefined, 'light.viz.contour.values'));
}

export function updateContourBy(field) {
  call('light.viz.contour.by', [field])
    .then(onReady, onError.bind(undefined, 'light.viz.contour.by'));
}

// ----------------------------------------------------------------------------
// Slices
// ----------------------------------------------------------------------------

export function updateSlicePosition({
  xPosition, yPosition, zPosition,
}) {
  call('light.viz.slice.position', [xPosition, yPosition, zPosition])
    .then(onReady, onError.bind(undefined, 'light.viz.slice.position'));
}

export function updateSlicesVisible(x, y, z) {
  call('light.viz.slice.visibility', [x, y, z])
    .then(onReady, onError.bind(undefined, 'light.viz.slice.visibility'));
}

// ----------------------------------------------------------------------------
// Multi-Slice
// ----------------------------------------------------------------------------

export function updateMultiSliceValues(positions) {
  call('light.viz.mslice.positions', [positions])
    .then(onReady, onError.bind(undefined, 'light.viz.mslice.positions'));
}

export function updateMultiSliceAxis(axis) {
  call('light.viz.mslice.normal', [axis])
    .then(onReady, onError.bind(undefined, 'light.viz.mslice.normal'));
}

// ----------------------------------------------------------------------------
// Streamline
// ----------------------------------------------------------------------------

export function updateStreamlineSeedPoint({
  xPosition, yPosition, zPosition,
}) {
  call('light.viz.streamline.position', [xPosition, yPosition, zPosition])
    .then(onReady, onError.bind(undefined, 'light.viz.streamline.position'));
}

export function updateStreamlineVector(vector) {
  call('light.viz.streamline.vector', [vector])
    .then(onReady, onError.bind(undefined, 'light.viz.streamline.vector'));
}

export function updateStreamlineSeedRadius(radius) {
  call('light.viz.streamline.radius', [radius])
    .then(onReady, onError.bind(undefined, 'light.viz.streamline.radius'));
}

export function updateStreamlineNumPoints(numPoints) {
  call('light.viz.streamline.numpoints', [numPoints])
    .then(onReady, onError.bind(undefined, 'light.viz.streamline.numpoints'));
}

// ----------------------------------------------------------------------------
// Generics
// ----------------------------------------------------------------------------

export function updateColor(type, field) {
  const name = 'light.viz.TYPE.color'.replace(/TYPE/, type);
  call(name, [field])
    .then(onReady, onError.bind(undefined, name));
}

export function enable(type, enabled) {
  const name = 'light.viz.TYPE.enable'.replace(/TYPE/, type);
  call(name, [enabled])
    .then(onReady, onError.bind(undefined, name));
}

export function getState(type, ...widgets) {
  const name = 'light.viz.TYPE.getstate'.replace(/TYPE/, type);
  call(name)
    .then((state) => {
      widgets.forEach(w => {
        if (w.updateState) {
          w.updateState(state);
        } else {
          w.setState(state);
        }
      });
    }, onError.bind(undefined, name));
}

export function updateUseClip(type, useClip) {
  const name = 'light.viz.TYPE.useclipped'.replace(/TYPE/, type);
  call(name, [useClip])
    .then(onReady, onError.bind(undefined, name));
}

// ----------------------------------------------------------------------------

export function updateRepresentation(type, mode) {
  const name = 'light.viz.TYPE.representation'.replace(/TYPE/, type);
  call(name, [mode])
    .then(onReady, onError.bind(undefined, name));
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
};
