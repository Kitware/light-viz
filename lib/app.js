import React                            from 'react';
import { render }                       from 'react-dom';
import { Router, Route, Link }          from 'react-router';
import { ListDatasets, ViewDataset }    from './pages';

import vtkWebClientFactory from 'tonic-io/lib/VtkWeb/client/pvw/ClientFactory';
import VtkWebSmartConnect  from 'tonic-io/lib/VtkWeb/SmartConnect';

// Load CSS
require('font-awesome/css/font-awesome.css');
require('normalize.css');
require('./style.css');

var connection = null,
    client = null;

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
    connection = conn;
    client = vtkWebClientFactory(conn, [ 'MouseHandler', 'ViewPort' ]);
    render(routes, container);
}

// Exposed method
export {
    connection,
    client
}

export function connect(config={}) {
    let smartConnect = new VtkWebSmartConnect(config);
    smartConnect.onConnectionReady(start);
    smartConnect.connect();
};