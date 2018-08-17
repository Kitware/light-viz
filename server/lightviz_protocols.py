
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
    @exportRpc("light.viz.proxy.name")
    def getProxyName(self, pid):
      proxy = self.mapIdToProxy(pid)
      return {
        'id': pid,
        'group': proxy.GetXMLGroup(),
        'name': proxy.GetXMLName(),
        'label': proxy.GetXMLLabel(),
      }
