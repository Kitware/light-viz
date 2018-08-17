import SmartConnect from 'wslink/src/SmartConnect';

import ColorManager from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/ColorManager';
import FileListing from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/FileListing';
import KeyValuePairStore from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/KeyValuePairStore';
import MouseHandler from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/MouseHandler';
import ProgressUpdate from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/ProgressUpdate';
import ProxyManager from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/ProxyManager';
import SaveData from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/SaveData';
import TimeHandler from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/TimeHandler';
import ViewPort from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/ViewPort';
import ViewPortGeometryDelivery from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/ViewPortGeometryDelivery';
import ViewPortImageDelivery from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/ViewPortImageDelivery';
import VtkGeometryDelivery from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/VtkGeometryDelivery';
import VtkImageDelivery from 'paraviewweb/src/IO/WebSocket/ParaViewWebClient/VtkImageDelivery';

import ProxyName from 'pvw-lightviz/src/io/protocols/ProxyName';

const REMOTE_API = {
  ColorManager,
  FileListing,
  KeyValuePairStore,
  MouseHandler,
  ProgressUpdate,
  ProxyManager,
  SaveData,
  TimeHandler,
  ViewPort,
  ViewPortGeometryDelivery,
  ViewPortImageDelivery,
  VtkGeometryDelivery,
  VtkImageDelivery,
  // custom
  ProxyName,
};

export default class Client {
  constructor() {
    this.config = null;
    this.connection = null;
    this.remote = {};
  }

  isConnected() {
    return !!this.connection;
  }

  connect(config) {
    if (this.connection) {
      return Promise.reject(new Error('Need to disconnect before'));
    }
    console.log('connect config', config);
    return new Promise((resolve, reject) => {
      this.smartConnect = SmartConnect.newInstance({ config });
      this.smartConnect.onConnectionReady((connection) => {
        this.connection = connection;
        this.remote = {};
        const session = connection.getSession();

        // Link remote API
        Object.keys(REMOTE_API).forEach((name) => {
          this.remote[name] = REMOTE_API[name](session);
        });

        resolve(this);
      });
      this.smartConnect.onConnectionError((error) => {
        reject(error);
      });
      this.smartConnect.onConnectionClose((close) => {
        reject(close);
      });
      this.smartConnect.connect();
    });
  }

  disconnect(timeout = 60) {
    if (this.connection) {
      this.connection.destroy(timeout);
      this.connection = null;
    }
  }
}
