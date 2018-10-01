/* eslint-disable arrow-body-style */
export default function createMethods(session) {
  return {
    getProxyName: (id = '-1') => {
      return session.call('paraview.lite.proxy.name', [id]);
    },
  };
}
