/* eslint-disable arrow-body-style */
export default function createMethods(session) {
  return {
    getProxyName: (id = '-1') => {
      return session.call('light.viz.proxy.name', [id]);
    },
  };
}
