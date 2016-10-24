let connection = null;
let client = null;
let session = null;
let datasets = [];
let activeDataset = null;
let structure = [];
let busy = 0;
let lastDS = null;

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

export function isBusy() {
  return busy;
}

function onError(name, error) {
  busy -= 1;
  console.log(`Error in ${name}`);
  console.log(error);
}

function onReady() {
  busy -= 1;
}

function call(method, args) {
  busy += 1;
  return session.call(method, args);
}

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------

export function getConfiguration(callback) {
  call('light.viz.configuration.get', []).then(
      (output) => {
        callback(output[0], output[1]);
      },
      onError.bind(undefined, 'light.viz.configuration.get'));
}
// ----------------------------------------------------------------------------
// ColorMap
// ----------------------------------------------------------------------------

export function listColorMapImages(callback) {
  client.ColorManager.listColorMapImages().then((presets) => { callback(presets); });
}
// ----------------------------------------------------------------------------
// Dataset
// ----------------------------------------------------------------------------

export function addThumbnail(imageElem) {
  const dsName = imageElem.dataset.name;
  call('light.viz.dataset.thumbnail', [dsName]).then(
    (thumbnails) => {
      onReady();
      while (thumbnails.length) {
        const l = thumbnails.length;
        imageElem.dataset[`src-${l}`] = thumbnails.pop();
      }
      const index = parseInt(imageElem.dataset.index, 10) + 1;
      imageElem.src = imageElem.dataset[`src-${index}`];
    },
    (e) => {
      console.log('thumbnails error:', dsName);
    }
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
  if (activeDataset !== dsName || !lastDS) {
    activeDataset = dsName;
    call('light.viz.dataset.load', [activeDataset])
      .then((ds) => {
        onReady();
        lastDS = ds;
        callback(ds);
      }, onError.bind(undefined, 'light.viz.dataset.load'));
  } else {
    activeDataset = dsName;
    callback(lastDS);
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

export function updateClipBoxPosition({
  xPosition, yPosition, zPosition,
}) {
  call('light.viz.clip.box.position', [xPosition, yPosition, zPosition])
    .then(onReady, onError.bind(undefined, 'light.viz.clip.box.position'));
}

export function enableClipBox(show) {
  call('light.viz.clip.box.show', [show])
    .then(onReady, onError.bind(undefined, 'light.viz.clip.box.show'));
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

export function showStreamlineSeed(enableSeed) {
  call('light.viz.streamline.seed.show', [enableSeed])
    .then(onReady, onError.bind(undefined, 'light.viz.streamline.seed.show'));
}

export function updateStreamlineSeed(position, radius) {
  call('light.viz.streamline.seed.update', [position, radius])
    .then(onReady, onError.bind(undefined, 'light.viz.streamline.seed.update'));
}

// ----------------------------------------------------------------------------
// Threshold
// ----------------------------------------------------------------------------

export function updateThresholdRange(min, max) {
  call('light.viz.threshold.range', [min, max])
    .then(onReady, onError.bind(undefined, 'light.viz.threshold.range'));
}

export function updateThresholdBy(name) {
  call('light.viz.threshold.by', [name])
    .then(onReady, onError.bind(undefined, 'light.viz.threshold.by'));
}
// ----------------------------------------------------------------------------
// color map
// ----------------------------------------------------------------------------

export function setColorMapPreset(arrayName, preset) {
  call('light.viz.colormap.setpreset', [arrayName, preset])
    .then(onReady(), onError.bind(undefined, 'light.viz.colormap.setpreset'));
}

export function setColorMapRange(arrayName, range) {
  call('light.viz.colormap.setrange', [arrayName, range])
    .then(onReady(), onError.bind(undefined, 'light.viz.colormap.setrange'));
}

export function setColorMapRangeToDataRange(arrayName, callback) {
  call('light.viz.colormap.rescale.todatarange', [arrayName])
    .then((result) => {
      callback(result);
    }, onError.bind(undefined, 'light.viz.colormap.rescale.todatarange'));
}

export function updateOpacityMap(arrayName, controlPoints) {
  call('light.viz.opacitymap.set', [arrayName, controlPoints])
    .then(onReady(), onError.bind(undefined, 'light.viz.opacitymap.set'));
}

export function getColorMap(arrayName, callback) {
  call('light.viz.colormap.get', [arrayName])
    .then((result) => {
      callback(result.preset, result.range);
    }, onError.bind(undefined, 'light.viz.colormap.get'));
}

export function getOpacityMap(arrayName, callback) {
  call('light.viz.opacitymap.get', [arrayName])
    .then((points) => {
      callback(points);
    }, onError.bind(undefined, 'light.viz.opacitymap.get'));
}

// ----------------------------------------------------------------------------
// Generics
// ----------------------------------------------------------------------------

export function updateColor(type, field, location) {
  const name = 'light.viz.TYPE.color'.replace(/TYPE/, type);
  call(name, [field, location])
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
      widgets.forEach((w) => {
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
