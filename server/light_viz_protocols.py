
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

# =============================================================================
#
# Dataset management
#
# =============================================================================

class LightVizDatasets(pv_protocols.ParaViewWebProtocol):

    def __init__(self, data_directory):
        super(LightVizDatasets, self).__init__()
        self.basedir = data_directory
        self.datasetMap = {}
        self.dataset = None
        self.datasets = []
        self.activeMeta = None
        self.dataListeners = []
        for filePath in os.listdir(self.basedir):
            indexPath = os.path.join(self.basedir, filePath, 'index.json')
            if os.path.exists(indexPath):
                with open(indexPath, 'r') as fd:
                    metadata = json.loads(fd.read())
                    self.datasets.append(metadata)
                    self.datasetMap[metadata['name']] = { 'path':  os.path.dirname(indexPath), 'meta': metadata }


    def addListener(self, dataChangedInstance):
        self.dataListeners.append(dataChangedInstance)

    def getInput(self):
        return self.dataset

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

        # Notify listeners
        for l in self.dataListeners:
            l.dataChanged()

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

    @exportRpc("light.viz.dataset.representation")
    def updateRepresentation(self, mode):
        if self.datasetRep:
            self.datasetRep.Representation = mode

    @exportRpc("light.viz.dataset.color")
    def updateColorBy(self, field):
        if field == '__SOLID':
            self.datasetRep.ColorArrayName = ''
        else:
            # Select data array
            vtkSMPVRepresentationProxy.SetScalarColoring(self.datasetRep.SMProxy, field, vtkDataObject.POINT)
            lutProxy = self.datasetRep.LookupTable
            # lutProxy = simple.GetColorTransferFunction(field)
            for array in self.activeMeta['data']['arrays']:
                if array['name'] == field:
                    vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, array['range'][0], array['range'][1], False)

        simple.Render()

# =============================================================================
#
# Clip management
#
# =============================================================================

class LightVizClip(pv_protocols.ParaViewWebProtocol):

    def __init__(self, dataset_manager):
        super(LightVizClip, self).__init__()
        self.ds = dataset_manager
        self.clipX = None
        self.clipY = None
        self.clipZ = None
        self.representation = None
        dataset_manager.addListener(self)

    def dataChanged(self):
        if self.clipX:
            self.clipX.Input = self.ds.getInput()
            self.updatePosition(50, 50, 50)
            self.updateInsideOut(False, False, False)
            self.representation.Representation = 'Surface'
            self.representation.ColorArrayName = ''
            self.representation.Visibility = 0

    @exportRpc("light.viz.clip.position")
    def updatePosition(self, x, y, z):
        # bounds = self.ds.activeMeta['data']['bounds']
        # if self.clipX:
        #     self.clipX.ClipType.Origin = [float(x)/100.0*(bounds[1]-bounds[0]) + bounds[0], 0, 0]
        # if self.clipY:
        #     self.clipY.ClipType.Origin = [0, float(y)/100.0*(bounds[3]-bounds[2]) + bounds[2], 0]
        # if self.clipZ:
        #     self.clipZ.ClipType.Origin = [0, 0, float(z)/100.0*(bounds[5]-bounds[4]) + bounds[4]]
        if self.clipX:
            self.clipX.ClipType.Origin = [float(x), 0.0, 0.0]
        if self.clipY:
            self.clipY.ClipType.Origin = [0.0, float(y), 0.0]
        if self.clipZ:
            self.clipZ.ClipType.Origin = [0.0, 0.0, float(z)]

    @exportRpc("light.viz.clip.insideout")
    def updateInsideOut(self, x, y, z):
        if self.clipX:
            self.clipX.InsideOut = 1 if x else 0
        if self.clipY:
            self.clipY.InsideOut = 1 if y else 0
        if self.clipZ:
            self.clipZ.InsideOut = 1 if z else 0

    @exportRpc("light.viz.clip.representation")
    def updateRepresentation(self, mode):
        if self.representation:
            self.representation.Representation = mode

    @exportRpc("light.viz.clip.color")
    def updateColorBy(self, field):
        if self.representation:
            if field == '__SOLID':
                self.representation.ColorArrayName = ''
            else:
                # Select data array
                vtkSMPVRepresentationProxy.SetScalarColoring(self.representation.SMProxy, field, vtkDataObject.POINT)
                lutProxy = self.representation.LookupTable
                # lutProxy = simple.GetColorTransferFunction(field)
                for array in self.ds.activeMeta['data']['arrays']:
                    if array['name'] == field:
                        vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, array['range'][0], array['range'][1], False)

            simple.Render()

    @exportRpc("light.viz.clip.enable")
    def enableClip(self, enable):
        if enable and self.ds.getInput():
            if not self.clipX:
                bounds = self.ds.activeMeta['data']['bounds']
                center = [(bounds[i*2] + bounds[i*2+1])*.05 for i in range(3)]
                self.clipX = simple.Clip(Input=self.ds.getInput())
                self.clipY = simple.Clip(Input=self.clipX)
                self.clipZ = simple.Clip(Input=self.clipY)

                self.clipX.ClipType.Origin = center
                self.clipX.ClipType.Normal = [1, 0, 0]
                self.clipY.ClipType.Origin = center
                self.clipY.ClipType.Normal = [0, 1, 0]
                self.clipZ.ClipType.Origin = center
                self.clipZ.ClipType.Normal = [0, 0, 1]

                self.representation = simple.Show(self.clipZ)
            else:
                self.clipX.Input = self.ds.getInput()

            self.representation.Visibility = 1

        if not enable and self.representation:
            self.representation.Visibility = 0

        simple.Render()

# =============================================================================
#
# Contours management
#
# =============================================================================

class LightVizContour(pv_protocols.ParaViewWebProtocol):

    def __init__(self, dataset_manager):
        super(LightVizContour, self).__init__()
        self.ds = dataset_manager
        self.contour = None
        self.representation = None
        dataset_manager.addListener(self)

    def dataChanged(self):
        if self.contour:
            self.contour.Input = self.ds.getInput()
            self.representation.Visibility = 0

    @exportRpc("light.viz.contour.values")
    def updateValues(self, values):
        if self.contour:
            self.contour.Isosurfaces = values

    @exportRpc("light.viz.contour.by")
    def updateContourBy(self, field):
        if self.contour:
            self.contour.ContourBy = field

    @exportRpc("light.viz.contour.representation")
    def updateRepresentation(self, mode):
        if self.representation:
            self.representation.Representation = mode

    @exportRpc("light.viz.contour.color")
    def updateColorBy(self, field):
        if self.representation:
            if field == '__SOLID':
                self.representation.ColorArrayName = ''
            else:
                # Select data array
                vtkSMPVRepresentationProxy.SetScalarColoring(self.representation.SMProxy, field, vtkDataObject.POINT)
                lutProxy = self.representation.LookupTable
                # lutProxy = simple.GetColorTransferFunction(field)
                for array in self.ds.activeMeta['data']['arrays']:
                    if array['name'] == field:
                        vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, array['range'][0], array['range'][1], False)

            simple.Render()

    @exportRpc("light.viz.contour.enable")
    def enableContour(self, enable):
        if enable and self.ds.getInput():
            if not self.contour:
                bounds = self.ds.activeMeta['data']['bounds']
                self.contour = simple.Contour(Input=self.ds.getInput(), ComputeScalars=1, ComputeNormals=1)
                self.representation = simple.Show(self.contour)
            else:
                self.contour.Input = self.ds.getInput()

            self.representation.Visibility = 1

        if not enable and self.representation:
            self.representation.Visibility = 0

        simple.Render()
