import React                          from 'react';
import { render }                     from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import { ListDatasets, ViewDataset }  from './pages';
import lightVizClient                 from './client';

import vtkWebClientFactory from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient';
import VtkWebSmartConnect  from 'paraviewweb/src/IO/WebSocket/SmartConnect';

// Load CSS
require('normalize.css');

// Setup application and pages
const
    routes = <Router history={hashHistory} >
                <Route path="/" component={ListDatasets}/>
                <Route path="/list" component={ListDatasets}/>
                <Route path="/view/:datasetId" component={ViewDataset}>
                    <Route path=":timeIdx" component={ViewDataset}/>
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
