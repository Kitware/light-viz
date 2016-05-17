import React from 'react';
import { render } from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import { ListDatasets, ViewSelector } from './pages';
import lightVizClient from './client';

import ParaViewWebClient from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient';
import ParaViewWebSmartConnect from 'paraviewweb/src/IO/WebSocket/SmartConnect';

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
const container = document.querySelector('.react-container');

// Server ready - Initilize client application
function start(conn) {
  const client = ParaViewWebClient.createClient(conn, [
    'FileListing',
    'MouseHandler',
    'ProxyManager',
    'TimeHandler',
    'ViewPort',
  ]);
  lightVizClient.setup(conn, client);
  render(routes, container);
}

export function connect(config = {}) {
  const smartConnect = new ParaViewWebSmartConnect(config);
  smartConnect.onConnectionReady(start);
  smartConnect.connect();
}
