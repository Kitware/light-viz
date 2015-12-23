
import os, sys, logging, types, inspect, traceback, logging, re, json, base64
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

# class LightVizViewportSize(pv_protocols.ParaViewWebProtocol):

#     # RpcName: mouseInteraction => viewport.mouse.interaction
#     @exportRpc("light.viz.viewport.size")
#     def updateSize(self, viewId, width, height):
#         view = self.getView(viewId)
#         view.ViewSize = [ width, height ]



class LightVizDatasets(pv_protocols.ParaViewWebProtocol):

    def __init__(self, data_directory):
        super(LightVizDatasets, self).__init__()
        self.basedir = data_directory
        self.datasetMap = {}
        self.dataset = None
        self.datasets = []
        self.activeMeta = None
        for filePath in os.listdir(self.basedir):
            indexPath = os.path.join(self.basedir, filePath, 'index.json')
            if os.path.exists(indexPath):
                with open(indexPath, 'r') as fd:
                    metadata = json.loads(fd.read())
                    self.datasets.append(metadata)
                    self.datasetMap[metadata['name']] = { 'path':  os.path.dirname(indexPath), 'meta': metadata }

    # RpcName: mouseInteraction => viewport.mouse.interaction
    @exportRpc("light.viz.dataset.list")
    def listDatasets(self):
        return self.datasets

    @exportRpc("light.viz.dataset.thumbnail")
    def getThumbnails(self, datasetName):
        thumbnails = []
        info = self.datasetMap[datasetName]
        if info:
            basePath = info['path']
            for fileName in info['meta']['thumbnails']:
                with open(os.path.join(basePath, fileName), 'rb') as image:
                    thumbnails.append('data:image/%s;base64,%s' % (fileName.split('.')[-1], base64.b64encode(image.read())))

        return thumbnails

    @exportRpc("light.viz.dataset.load")
    def loadDataset(self, datasetName):
        if self.dataset:
            simple.Delete(self.dataset)
            self.dataset = None
            self.datasetRep = None

        self.activeMeta = self.datasetMap[datasetName]['meta']
        self.dataset = simple.OpenDataFile(os.path.join(self.datasetMap[datasetName]['path'], self.activeMeta['data']['file']))
        self.datasetRep = simple.Show(self.dataset)
        simple.Render()
        self.anim = simple.GetAnimationScene()
        return self.datasetMap[datasetName]['meta']

    @exportRpc("light.viz.dataset.opacity")
    def updateOpacity(self, opacity):
        if self.datasetRep:
            self.datasetRep.Opacity = opacity
        return opacity

    @exportRpc("light.viz.dataset.time")
    def updateTime(self, timeIdx):
        self.anim.TimeKeeper.Time = self.anim.TimeKeeper.TimestepValues[timeIdx]
        return self.anim.TimeKeeper.Time

    @exportRpc("light.viz.dataset.color")
    def updateColorBy(self, field):
        if field == '__SOLID':
            self.datasetRep.ColorArrayName = ''
        else:
            # Select data array
            vtkSMPVRepresentationProxy.SetScalarColoring(self.datasetRep.SMProxy, field, vtkDataObject.POINT)
            lutProxy = simple.GetColorTransferFunction(field)
            for array in self.activeMeta['data']['arrays']:
                if array['name'] == field:
                    vtkSMTransferFunctionProxy.RescaleTransferFunction(lut, array['range'][0], array['range'][1], False)

        simple.Render()
