/* eslint-disable arrow-body-style */
export default function createMethods(session) {
  return {
    getCamera: (viewId = '-1') => {
      return session.call('paraview.lite.camera.get', [viewId]);
    },
  };
}
