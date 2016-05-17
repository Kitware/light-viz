import { getConfiguration } from './client';

let config =
  { profiles: { default: { modules_included: [null], modules_excluded: [], viewType: 1 } } };
let configLoaded = false;
let activeProfile = 'default';

const observers = [];

function setConfiguration(configuration, profile) {
  config = configuration;
  activeProfile = profile;
  observers.forEach(obs => obs.configUpdated());
}

export function getActiveProfile() {
  let selected = config.profiles[activeProfile];
  if (!selected) {
    selected = { modules_included: [], modules_excluded: [], viewType: 1 };
  }
  return selected;
}

export function addConfigObserver(obs) {
  observers.push(obs);
}

export function loadConfiguration() {
  if (configLoaded) {
    return;
  }
  configLoaded = true;
  getConfiguration(setConfiguration);
}
