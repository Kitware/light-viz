/* global document */
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';

import { createClient } from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient';
import ParaViewWebSmartConnect from 'paraviewweb/src/IO/WebSocket/SmartConnect';

import { ListDatasets, ViewSelector } from './pages';
import { setup } from './client';

// Load CSS
require('normalize.css');

// Setup application and pages
const routes = (
  <Router history={hashHistory} >
    <Route path="/" component={ListDatasets} />
    <Route path="/list" component={ListDatasets} />
    <Route path="/view/:datasetId" component={ViewSelector}>
      <Route path=":timeIdx" component={ViewSelector} />
    </Route>
  </Router>
);

// Server ready - Initilize client application
function start(conn) {
  const container = document.querySelector('.light-viz-container');
  const client = createClient(conn, [
    'ColorManager',
    'FileListing',
    'MouseHandler',
    'ProxyManager',
    'TimeHandler',
    'ViewPort',
  ]);
  setup(conn, client);
  render(routes, container);
}

export function connect(config = {}) {
  const smartConnect = new ParaViewWebSmartConnect(config);
  smartConnect.onConnectionReady(start);
  smartConnect.connect();
}

export default {
  connect,
};
