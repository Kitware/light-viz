import React                         from 'react';
import { render }                    from 'react-dom';
import { Router, Route }             from 'react-router';
import { ListDatasets, ViewDataset } from './pages';
import lightVizClient                from './client';

import vtkWebClientFactory from 'tonic-io/lib/VtkWeb/client/pvw/ClientFactory';
import VtkWebSmartConnect  from 'tonic-io/lib/VtkWeb/SmartConnect';

// Load CSS
require('font-awesome/css/font-awesome.css');
require('normalize.css');
require('./style.css');

// Setup application and pages
const
    routes = <Router>
                <Route path="/" component={ListDatasets}/>
                <Route path="/list" component={ListDatasets}/>
                <Route path="/view/:datasetId" component={ViewDataset}>
                    <Route path=":field" component={ViewDataset}/>
                    <Route path=":field/:timeIdx" component={ViewDataset}/>
                </Route>
             </Router>,
    container = document.querySelector('.react-container');

// Server ready - Initilize client application
function start(conn) {
    const client = vtkWebClientFactory(conn, [ 'MouseHandler', 'ViewPort' ]);
    lightVizClient.setup(conn, client);
    render(routes, container);
}

export function connect(config={}) {
    const smartConnect = new VtkWebSmartConnect(config);
    smartConnect.onConnectionReady(start);
    smartConnect.connect();
}
