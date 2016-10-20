import equals from 'mout/src/array/equals';

import {
  getOpacityMap,
  updateOpacityMap,
} from '../../client';

let arrayData = {};
const toNotify = {};

function updateOpacityPoints(name, points) {
  if (!arrayData[name] || !equals(arrayData[name], points)) {
    arrayData[name] = points;
    if (toNotify[name] && toNotify[name].length > 0) {
      toNotify[name].forEach(obs => obs.opacityPointsUpdated(name, points));
    }
  }
}

function convertAndUpdateOpacityPoints(name, points) {
  if (!points) {
    return;
  }
  const pts = [];
  for (let i = 0; i < points.length - 1; i += 2) {
    pts.push({ x: points[i], y: points[i + 1] });
  }
  updateOpacityPoints(name, pts);
}

export function setOpacityPoints(name, points) {
  updateOpacityPoints(name, points);
  updateOpacityMap(name, points);
}

export function updateArrayRange(name, range) {
  if (toNotify[name] && toNotify[name].length > 0) {
    toNotify[name].forEach(obs => obs.arrayRangeUpdated(name, range));
  }
}

export function initializeArrayOpacities(arrays) {
  arrayData = {};
  arrays.forEach((arr, idx) => {
    arrayData[arr.name] = [];
    toNotify[arr.name] = [];
    getOpacityMap(arr.name, convertAndUpdateOpacityPoints.bind(undefined, arr.name));
  });
}

export function getOpacityPoints(name) {
  return arrayData[name];
}

export function addOpacityMapObserver(name, obs) {
  if (name) {
    if (!toNotify[name]) {
      toNotify[name] = [];
    }
    toNotify[name].push(obs);
  }
}

export function removeOpacityMapObserver(name, obs) {
  if (name) {
    toNotify[name] = toNotify[name].filter(obj => (obj === obs));
  }
}

export default {
  setOpacityPoints,
  updateArrayRange,
  initializeArrayOpacities,
  getOpacityPoints,
  addOpacityMapObserver,
  removeOpacityMapObserver,
};
