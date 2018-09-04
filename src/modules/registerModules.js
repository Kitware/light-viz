import { Mutations } from 'pvw-lightviz/src/stores/types';

import Sources from 'pvw-lightviz/src/modules/Sources';
import sourcesModule from 'pvw-lightviz/src/modules/Sources/module';

import Files from 'pvw-lightviz/src/modules/Files';
import filesModule from 'pvw-lightviz/src/modules/Files/module';

import Sphere from 'pvw-lightviz/src/modules/Sphere';
import sphereModule from 'pvw-lightviz/src/modules/Sphere/module';

import Cone from 'pvw-lightviz/src/modules/Cone';
import coneModule from 'pvw-lightviz/src/modules/Cone/module';

import Clip from 'pvw-lightviz/src/modules/Clip';
import clipModule from 'pvw-lightviz/src/modules/Clip/module';

import Slice from 'pvw-lightviz/src/modules/Slice';
import sliceModule from 'pvw-lightviz/src/modules/Slice/module';

import Contour from 'pvw-lightviz/src/modules/Contour';
import contourModule from 'pvw-lightviz/src/modules/Contour/module';

import DefaultComponent from 'pvw-lightviz/src/modules/Default';
import defaultModule from 'pvw-lightviz/src/modules/Default/module';

export default function registerModules(store) {
  // --------------------------------------------------------------------------
  // Widget registering
  // --------------------------------------------------------------------------

  store.commit(
    Mutations.MODULES_ADD,
    Object.assign({}, sourcesModule, { component: Sources })
  );
  store.commit(
    Mutations.MODULES_ADD,
    Object.assign({}, filesModule, { component: Files })
  );
  store.commit(
    Mutations.MODULES_ADD,
    Object.assign({}, sphereModule, { component: Sphere })
  );
  store.commit(
    Mutations.MODULES_ADD,
    Object.assign({}, coneModule, { component: Cone })
  );
  store.commit(
    Mutations.MODULES_ADD,
    Object.assign({}, clipModule, { component: Clip })
  );
  store.commit(
    Mutations.MODULES_ADD,
    Object.assign({}, sliceModule, { component: Slice })
  );
  store.commit(
    Mutations.MODULES_ADD,
    Object.assign({}, contourModule, { component: Contour })
  );

  // --------------------------------------------------------------------------
  // Proxy to UI mapping
  // --------------------------------------------------------------------------

  store.commit(Mutations.PROXY_MODULE_BIND, {
    name: 'SphereSource',
    module: 'Sphere',
  });

  store.commit(Mutations.PROXY_MODULE_BIND, {
    name: 'ConeSource',
    module: 'Cone',
  });

  store.commit(Mutations.PROXY_MODULE_BIND, {
    name: 'Clip',
    module: 'Clip',
  });

  store.commit(Mutations.PROXY_MODULE_BIND, {
    name: 'Cut',
    module: 'Slice',
  });
  store.commit(Mutations.PROXY_MODULE_BIND, {
    name: 'Contour',
    module: 'Contour',
  });

  // --------------------------------------------------------------------------
  // Fallback mapping
  // --------------------------------------------------------------------------

  store.commit(
    Mutations.MODULES_ADD,
    Object.assign({}, defaultModule, {
      component: DefaultComponent,
      name: 'default',
    })
  );

  // --------------------------------------------------------------------------

  store.commit(Mutations.PROXY_MODULE_BIND, {
    name: 'default',
    module: 'default',
  });
}
