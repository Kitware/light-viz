import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, withRouter } from 'react-router-dom';

import { createClient } from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient';
import SmartConnect from 'wslink/src/SmartConnect';

import { ListDatasets, ViewSelector } from './pages';
import { setup } from './client';

// Load CSS
require('normalize.css');

// Setup application and pages
const routes = (
  <Router>
    <div>
      <Route exact path="/" component={withRouter(ListDatasets)} />
      <Route exact path="/list" component={withRouter(ListDatasets)} />
      <Route
        exact
        path="/view/:datasetId"
        component={withRouter(ViewSelector)}
      />
      <Route
        exact
        path="/view/:datasetId/:timeIdx"
        component={withRouter(ViewSelector)}
      />
    </div>
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
    'VtkImageDelivery',
  ]);
  setup(conn, client);
  render(routes, container);
}

export function connect(config = {}) {
  const smartConnect = SmartConnect.newInstance({ config });
  smartConnect.onConnectionReady(start);
  smartConnect.connect();
}

export default {
  connect,
};
