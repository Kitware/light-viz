# import RPC annotation
from wslink import register as exportRpc

from paraview import simple, servermanager
from paraview.web import protocols as pv_protocols


# =============================================================================
#
# Proxy Type
#
# =============================================================================

class ProxyName(pv_protocols.ParaViewWebProtocol):
    @exportRpc("paraview.lite.proxy.name")
    def getProxyName(self, pid):
      proxy = self.mapIdToProxy(pid)
      return {
        'id': pid,
        'group': proxy.GetXMLGroup(),
        'name': proxy.GetXMLName(),
        'label': proxy.GetXMLLabel(),
      }


class Camera(pv_protocols.ParaViewWebProtocol):
    @exportRpc("paraview.lite.camera.get")
    def getCamera(self, viewId):
      view = self.getView(viewId)
      bounds = [-1, 1, -1, 1, -1, 1]

      if view and view.GetClientSideView().GetClassName() == 'vtkPVRenderView':
        rr = view.GetClientSideView().GetRenderer()
        bounds = rr.ComputeVisiblePropBounds()

      return {
        'id': viewId,
        'bounds': bounds,
        'position': tuple(view.CameraPosition),
        'viewUp': tuple(view.CameraViewUp),
        'focalPoint': tuple(view.CameraFocalPoint),
        'centerOfRotation': tuple(view.CenterOfRotation),
      }
