import 'normalize.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { HashRouter as Router, Route, withRouter } from 'react-router-dom';

import { createClient } from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient';
import ProgressLoaderWidget from 'paraviewweb/src/React/Widgets/ProgressLoaderWidget';

import SmartConnect from 'wslink/src/SmartConnect';

import { ListDatasets, ViewSelector } from './pages';
import { setup } from './client';

const container = document.querySelector('.light-viz-container');

function loading(message = 'Loading ParaView...') {
  ReactDOM.unmountComponentAtNode(container);
  ReactDOM.render(<ProgressLoaderWidget message={message} />, container);
}

function triggerError(sConnect, message = 'Server disconnected') {
  loading(message);
}

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
  ReactDOM.unmountComponentAtNode(container);
  ReactDOM.render(routes, container);
}

export function connect(config = {}) {
  loading();
  const smartConnect = SmartConnect.newInstance({ config });
  smartConnect.onConnectionReady(start);
  smartConnect.onConnectionError(triggerError);
  smartConnect.onConnectionClose(triggerError);
  smartConnect.connect();
}

export default {
  connect,
};
