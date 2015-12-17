
import os, sys, logging, types, inspect, traceback, logging, re, json
from time import time

# import RPC annotation
from autobahn.wamp import register as exportRpc

# import paraview modules.
import paraview

from paraview import simple, servermanager
from paraview.web import protocols as pv_protocols

# Needed for:
#    vtkSMPVRepresentationProxy
#    vtkSMTransferFunctionProxy
#    vtkSMTransferFunctionManager
from vtkPVServerManagerRenderingPython import *

# Needed for:
#    vtkSMProxyManager
from vtkPVServerManagerCorePython import *

# Needed for:
#    vtkDataObject
from vtkCommonDataModelPython import *

# =============================================================================
#
# Viewport Size
#
# =============================================================================

class LightVizViewportSize(pv_protocols.ParaViewWebProtocol):

    # RpcName: mouseInteraction => viewport.mouse.interaction
    @exportRpc("light.viz.viewport.size")
    def updateSize(self, viewId, width, height):
        view = self.getView(viewId)
        view.ViewSize = [ width, height ]
