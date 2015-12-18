import createFactory from 'tonic-io/lib/VtkWeb/client/pvw';
import SmartConnect  from 'tonic-io/lib/VtkWeb/SmartConnect';
import * as React    from 'react';
import * as ReactDOM from 'react-dom';

// Load CSS
require('font-awesome/css/font-awesome.css');
require('normalize.css');
require('./style.css');

// Global variables
var smartConnect = null,
    component = null,
    client = null,
    container = document.querySelector('.pvw-container'),
    Layout = require('./ui/layout.js');

// Handle connection
function initializeApp(connection) {
    try {
        client = createFactory(connection, [ 'MouseHandler', 'ViewPort', 'ViewPortImageDelivery' ]);
        component = ReactDOM.render(
            React.createElement(
                Layout,
                { client, connection }),
            container);
    } catch(e){
        console.log(e);
    }
}

// Exposed method
export function connect(config={}) {
    smartConnect = new SmartConnect(config);
    smartConnect.onConnectionReady(initializeApp);
    smartConnect.connect();
}
