
import os, sys, logging, types, inspect, traceback, logging, re, json, base64
from time import time

# import RPC annotation
from wslink import register as exportRpc

# import paraview modules.
import paraview

from paraview import simple, servermanager
from paraview.web import protocols as pv_protocols

# Needed for:
#    vtkSMPVRepresentationProxy
#    vtkSMTransferFunctionProxy
#    vtkSMTransferFunctionManager
from vtk.vtkPVServerManagerRendering import vtkSMPVRepresentationProxy, vtkSMTransferFunctionProxy, vtkSMTransferFunctionManager

# Needed for:
#    vtkSMProxyManager
from vtk.vtkPVServerManagerCore import vtkSMProxyManager

# Needed for:
#    vtkDataObject
from vtk.vtkCommonDataModel import vtkDataObject

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
# Configuration management
#
# =============================================================================

class LightVizConfig(pv_protocols.ParaViewWebProtocol):
    def __init__(self, config, defaultProfile):
        self.config = config
        self.defaultProfile = defaultProfile

    @exportRpc("light.viz.configuration.get")
    def getDefaultProfile(self):
        return [self.config, self.defaultProfile]

# =============================================================================

def simpleColorBy(rep=None, value=None):
    """Set scalar color. This will automatically setup the color maps and others
    necessary state for the representations. 'rep' must be the display
    properties proxy i.e. the value returned by GetDisplayProperties() function.
    If none is provided the display properties for the active source will be
    used, if possible."""
    rep = rep if rep else simple.GetDisplayProperties()
    if not rep:
        raise ValueError ("No display properties can be determined.")

    association = rep.ColorArrayName.GetAssociation()
    arrayname = rep.ColorArrayName.GetArrayName()
    component = None
    if value == None:
        rep.SetScalarColoring(None, servermanager.GetAssociationFromString(association))
        return
    if not isinstance(value, tuple) and not isinstance(value, list):
        value = (value,)
    if len(value) == 1:
        arrayname = value[0]
    elif len(value) >= 2:
        association = value[0]
        arrayname = value[1]
    if len(value) == 3:
        # component name provided
        componentName = value[2]
        if componentName == "Magnitude":
          component = -1
        else:
          if association == "POINTS":
            array = rep.Input.PointData.GetArray(arrayname)
          if association == "CELLS":
            array = rep.Input.CellData.GetArray(arrayname)
          if array:
            # looking for corresponding component name
            for i in range(0, array.GetNumberOfComponents()):
              if componentName == array.GetComponentName(i):
                component = i
                break
              # none have been found, try to use the name as an int
              if i ==  array.GetNumberOfComponents() - 1:
                try:
                  component = int(componentName)
                except ValueError:
                  pass
    if component is None:
      rep.SetScalarColoring(arrayname, servermanager.GetAssociationFromString(association))
    else:
      rep.SetScalarColoring(arrayname, servermanager.GetAssociationFromString(association), component)
    # rep.RescaleTransferFunctionToDataRange()


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
        self.reader = None
        self.context = None
        self.extractBlocks = None
        self.datasets = []
        self.activeMeta = None
        self.colormaps = {}
        self.foreground = [ 1, 1, 1]
        self.background = [ 0, 0, 0]
        self.colorBy = ('__SOLID__', '__SOLID__')
        self.dataListeners = []
        self.view = simple.GetRenderView()
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

    @exportRpc("light.viz.dataset.list")
    def listDatasets(self):
        self.datasets = []
        self.datasetMap = {}
        for filePath in os.listdir(self.basedir):
            indexPath = os.path.join(self.basedir, filePath, 'index.json')
            if os.path.exists(indexPath):
                with open(indexPath, 'r') as fd:
                    metadata = json.loads(fd.read())
                    self.datasets.append(metadata)
                    self.datasetMap[metadata['name']] = { 'path':  os.path.dirname(indexPath), 'meta': metadata }
        return self.datasets

    @exportRpc("light.viz.dataset.thumbnail")
    def getThumbnails(self, datasetName):
        thumbnails = []
        info = self.datasetMap[datasetName]
        oldVersion = servermanager.vtkSMProxyManager.GetVersionMinor() < 2 and servermanager.vtkSMProxyManager.GetVersionMajor() < 6
        if info:
            basePath = info['path']
            for fileName in info['meta']['thumbnails']:
                if oldVersion:
                  with open(os.path.join(basePath, fileName), 'rb') as image:
                    thumbnails.append('data:image/%s;base64,%s' % (fileName.split('.')[-1], base64.b64encode(image.read())))
                else:
                  thumbnails.append('/ds/%s/%s' % (datasetName, fileName))

        return thumbnails

    @exportRpc("light.viz.dataset.thumbnail.save")
    def saveThumbnail(self):
        if self.view:
            size = [x for x in self.view.ViewSize.GetData()]
            self.view.ViewSize = [400, 400]
            basePath = self.datasetMap[self.activeMeta['name']]['path']
            numThumbnails = len(self.activeMeta['thumbnails'])
            filename = "thumbnail%d.jpg" % (numThumbnails + 1,)
            filepath = os.path.join(basePath, filename)
            simple.SaveScreenshot(filepath,self.view)
            self.activeMeta['thumbnails'].append(filename)
            indexPath = os.path.join(self.basedir, basePath, 'index.json')
            with open(indexPath, 'w') as fd:
                fd.write(json.dumps(self.activeMeta, indent=4, separators=(',', ': ')))
            self.view.ViewSize = size

    @exportRpc("light.viz.dataset.load")
    def loadDataset(self, datasetName):
        if self.dataset:
            if self.activeMeta is self.datasetMap[datasetName]['meta']:
                return self.activeMeta
            simple.Delete(self.reader)
            if self.extractBlocks:
                simple.Delete(self.extractBlocks)
            self.dataset = None
            self.datasetRep = None
            self.view = None

        if self.context:
          simple.Delete(self.reader)
          self.context = None
          self.contextRep = None

        self.activeMeta = self.datasetMap[datasetName]['meta']


        if 'context' in self.activeMeta['data']:
          self.context = simple.OpenDataFile(os.path.join(self.datasetMap[datasetName]['path'], self.activeMeta['data']['context']))
          self.contextRep = simple.Show(self.context)

        filesToLoad = []
        if type(self.activeMeta['data']['file']) is list:
          for fileName in self.activeMeta['data']['file']:
            filesToLoad.append(os.path.join(self.datasetMap[datasetName]['path'], fileName))
        else:
          filesToLoad.append(os.path.join(self.datasetMap[datasetName]['path'], self.activeMeta['data']['file']))

        self.reader = simple.OpenDataFile(filesToLoad)
        # Have to do this to force the reader to execute and get the data information
        readerRep = simple.Show(self.reader)
        readerRep.Visibility = 0
        if self.reader.GetDataInformation().DataInformation.GetCompositeDataInformation().GetDataIsComposite() == 1:
            self.extractBlocks = simple.ExtractBlock(Input = self.reader)
            self.dataset = self.extractBlocks
            blocks = self.getBlockStructure()
            while len(blocks[-1]['children']) > 0:
                blocks = blocks[-1]['children']
            self.extractBlocks.BlockIndices = [ x + 1 for x in range(blocks[-1]['flatindex'])]
        else:
            self.dataset = self.reader
        self.datasetRep = simple.Show(self.dataset)
        self.datasetRep.Representation = 'Surface'
        self.datasetRep.Visibility = 1
        self.colorBy = ('__SOLID__', '__SOLID__')
        self.updateColorBy(self.colorBy[1], self.colorBy[0])
        self.view = simple.Render()
        self.view.Background = self.background

        # reset the camera
        simple.ResetCamera(self.view)
        self.view.CenterOfRotation = self.view.CameraFocalPoint
        simple.Render(self.view)

        self.getApplication().InvokeEvent('PushRender')
        self.anim = simple.GetAnimationScene()

        # Notify listeners
        for l in self.dataListeners:
            l.dataChanged()

        # When loading new dataset, rescale colormaps to full range by default
        for array in self.activeMeta['data']['arrays']:
            arrRange = array['range']
            arrName = array['name']
            self.setColormapRange(arrName, arrRange)

        simple.Render(self.view)
        self.getApplication().InvokeEvent('PushRender')

        return self.activeMeta

    @exportRpc("light.viz.dataset.setblock.visibility")
    def setBlockVisibility(self, visible):
        # 0 block is always presumed to be needed since everything is under it
        if self.extractBlocks is None:
            return
        self.extractBlocks.BlockIndices = visible
        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.dataset.getblockstructure")
    def getBlockStructure(self):
        dataInfo = self.reader.GetDataInformation().DataInformation.GetCompositeDataInformation()
        if dataInfo.GetDataIsComposite() == 0:
            return []
        index = 0;
        def processInfo(info, index):
            output = []
            if info.GetNumberOfChildren() == 0:
                return output, index
            for i in xrange(info.GetNumberOfChildren()):
                name = info.GetName(i)
                childOutput = []
                index += 1
                myIndex = index
                if info.GetDataInformation(i) is not None:
                    childInfo = info.GetDataInformation(i).GetCompositeDataInformation()
                    childOutput, index = processInfo(childInfo, index)
                output.append({'name': name, 'children': childOutput, 'flatindex': myIndex})
            return output, index
        a, index = processInfo(dataInfo, index)
        return a

    def checkArrayInMap(self, array):
        if array not in self.colormaps:
            self.colormaps[array] = { 'preset': 'Cool to Warm', 'range': [0, 1] }

    @exportRpc("light.viz.colormap.setpreset")
    def setColormapPreset(self, array, presetName):
        if (array is None):
            return
        self.checkArrayInMap(array)
        self.colormaps[array]['preset'] = presetName
        rtDataLUT = simple.GetColorTransferFunction(array);
        rtDataLUT.ApplyPreset(presetName, True)
        simple.Render()
        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.colormap.setrange")
    def setColormapRange(self, array, newRange):
        if (array is None):
            return
        self.checkArrayInMap(array)
        self.colormaps[array]['range'] = newRange
        rtDataLUT = simple.GetColorTransferFunction(array)
        rtDataLUT.RescaleTransferFunction(newRange[0], newRange[1])
        opacityLUT = simple.GetOpacityTransferFunction(array)
        opacityLUT.RescaleTransferFunction(newRange[0], newRange[1])
        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.colormap.rescale.todatarange")
    def setColormapRangeToDataRange(self, array):
        if (array is None):
            return
        self.checkArrayInMap(array)
        rtDataLUT = simple.GetColorTransferFunction(array)
        self.datasetRep.RescaleTransferFunctionToDataRange(False)
        self.colormaps[array]['range'] = [rtDataLUT.RGBPoints[0], rtDataLUT.RGBPoints[-4]]
        rtDataOpacityTF = simple.GetOpacityTransferFunction(array)
        rtDataOpacityTF.RescaleTransferFunction(self.colormaps[array]['range'])

        self.getApplication().InvokeEvent('PushRender')

        return self.colormaps[array]['range']

    @exportRpc("light.viz.colormap.get")
    def getColorMap(self, array):
        if (array is None):
            return { 'preset': 'Cool to Warm', 'range': [0, 1] }
        self.checkArrayInMap(array)
        return self.colormaps[array]

    @exportRpc("light.viz.opacitymap.set")
    def setOpacityMap(self, array, controlPoints):
        if (array is None):
            return
        points = []
        r = self.colormaps[array]['range']
        for p in controlPoints:
            points.append(p["x"] * (r[1] - r[0]) + r[0])
            points.append(p["y"])
            points.append(0.5)
            points.append(0.0)
        rtDataLUT = simple.GetOpacityTransferFunction(array);
        rtDataLUT.Points = points

        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.opacitymap.get")
    def getOpacityMap(self, array):
        if (array is None):
            return
        points = []
        rtDataLUT = simple.GetOpacityTransferFunction(array);
        r = self.colormaps[array]['range']
        for i in xrange(len(rtDataLUT.Points) / 4):
            points.append((rtDataLUT.Points[i * 4] - r[0]) / (r[1] - r[0]))
            points.append(rtDataLUT.Points[i * 4 + 1])
        return points

    @exportRpc("light.viz.foreground.color")
    def setForegroundColor(self, foreground):
        self.foreground = [ float(x) for x in foreground.split(' ')]
        for obs in self.dataListeners:
            obs.setForegroundColor(self.foreground)
        if self.datasetRep:
            self.datasetRep.DiffuseColor = self.foreground
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.background.color")
    def setBackgroundColor(self, background):
        self.background = [ float(x) for x in background.split(' ')]
        if self.view:
            self.view.Background = self.background
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.dataset.getstate")
    def getState(self):
        tmp = {
                "opacity": self.datasetRep.Opacity,
                "representation": self.datasetRep.Representation,
                "color": self.colorBy,
                "enabled": self.datasetRep.Visibility == 1,
            }

        if not isinstance(tmp["enabled"], bool):
            tmp["enabled"] = tmp["enabled"][0]

        return tmp

    @exportRpc("light.viz.dataset.opacity")
    def updateOpacity(self, opacity):
        if self.datasetRep:
            self.datasetRep.Opacity = opacity
            self.getApplication().InvokeEvent('PushRender')

        return opacity

    @exportRpc("light.viz.dataset.time")
    def updateTime(self, timeIdx):
        if len(self.anim.TimeKeeper.TimestepValues) > 0:
            self.anim.TimeKeeper.Time = self.anim.TimeKeeper.TimestepValues[timeIdx]
            self.getApplication().InvokeEvent('PushRender')

        return self.anim.TimeKeeper.Time

    @exportRpc("light.viz.dataset.representation")
    def updateRepresentation(self, mode):
        if self.datasetRep:
            self.datasetRep.Representation = mode
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.dataset.color")
    def updateColorBy(self, field, location):
        self.colorBy = (location, field)
        if field == '__SOLID__':
            self.datasetRep.ColorArrayName = ''
        else:
            # Select data array
            simpleColorBy(self.datasetRep, (location, field))
            lutProxy = self.datasetRep.LookupTable
            pwfProxy = self.datasetRep.ScalarOpacityFunction
            for array in self.activeMeta['data']['arrays']:
                if array['name'] == field and array['location'] == location:
                    if lutProxy:
                      vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, array['range'][0], array['range'][1], False)
                    if pwfProxy:
                      vtkSMTransferFunctionProxy.RescaleTransferFunction(pwfProxy.SMProxy, array['range'][0], array['range'][1], False)

        simple.Render()
        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.dataset.enable")
    def enableDataset(self, enable):
        self.datasetRep.Visibility = 1 if enable else 0
        simple.Render()
        self.getApplication().InvokeEvent('PushRender')

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
        self.box = None
        self.boxRepr = None
        self.reprMode = 'Surface'
        self.colorBy = ('__SOLID__', '__SOLID__')
        dataset_manager.addListener(self)

    def dataChanged(self):
        self.updateRepresentation('Surface')
        self.updateColorBy('__SOLID__', '__SOLID__')
        if self.clipX:
            self.clipX.Input = self.ds.getInput()
            bounds = self.ds.activeMeta['data']['bounds']
            self.updatePosition((bounds[1] + bounds[0])/2.0,
                                (bounds[3] + bounds[2])/2.0,
                                (bounds[5] + bounds[4])/2.0)
            self.updateInsideOut(False, False, False)
        if self.representation:
            self.representation.Visibility = 0

    def setForegroundColor(self, foreground):
        if self.representation:
            self.representation.DiffuseColor = foreground

    @exportRpc("light.viz.clip.box.position")
    def updatePositionForBox(self, x, y, z):
        newClipCenter = [x, y, z]
        boundsPoint = [self.ds.activeMeta['data']['bounds'][2 * i] for i in range(3)]
        if not self.clipX.InsideOut:
            boundsPoint[0] = self.ds.activeMeta['data']['bounds'][1]
        if not self.clipY.InsideOut:
            boundsPoint[1] = self.ds.activeMeta['data']['bounds'][3]
        if not self.clipZ.InsideOut:
            boundsPoint[2] = self.ds.activeMeta['data']['bounds'][5]
        if self.box:
            self.box.Center = [(newClipCenter[i] + boundsPoint[i]) * 0.5 for i in range(3)]
            self.box.XLength = abs(boundsPoint[0] - newClipCenter[0])
            self.box.YLength = abs(boundsPoint[1] - newClipCenter[1])
            self.box.ZLength = abs(boundsPoint[2] - newClipCenter[2])

        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.clip.box.show")
    def showBox(self, enable):
        if enable and self.ds.getInput():
            bounds = self.ds.activeMeta['data']['bounds']
            if not self.box:
                self.box = simple.Box()
                self.updatePositionForBox((bounds[1] + bounds[0])/2.0,
                                          (bounds[3] + bounds[2])/2.0,
                                          (bounds[5] + bounds[4])/2.0)
                self.boxRepr = simple.Show(Input=self.box)
                self.boxRepr.Representation = 'Outline'
                self.boxRepr.DiffuseColor = [1, 0, 0]
            self.boxRepr.Visibility = 1
        elif (not enable) and self.boxRepr:
            self.boxRepr.Visibility = 0

        self.getApplication().InvokeEvent('PushRender')


    @exportRpc("light.viz.clip.getstate")
    def getState(self):
        ret = {
            "representation": self.reprMode,
            "color": self.colorBy,
            "enabled": False,
            "xPosition": 0,
            "yPosition": 0,
            "zPosition": 0,
            "xInsideOut": False,
            "yInsideOut": False,
            "zInsideOut": False,
        }
        if self.representation:
            ret["enabled"] = self.representation.Visibility == 1,
        if self.clipX:
            ret["xPosition"] = self.clipX.ClipType.Origin[0]
            ret["yPosition"] = self.clipY.ClipType.Origin[1]
            ret["zPosition"] = self.clipZ.ClipType.Origin[2]
            ret["xInsideOut"] = self.clipX.InsideOut == 1
            ret["yInsideOut"] = self.clipY.InsideOut == 1
            ret["zInsideOut"] = self.clipZ.InsideOut == 1

        if not isinstance(ret["enabled"], bool):
            ret["enabled"] = ret["enabled"][0]

        return ret

    @exportRpc("light.viz.clip.position")
    def updatePosition(self, x, y, z):
        if self.clipX:
            self.clipX.ClipType.Origin = [float(x), 0.0, 0.0]
        if self.clipY:
            self.clipY.ClipType.Origin = [0.0, float(y), 0.0]
        if self.clipZ:
            self.clipZ.ClipType.Origin = [0.0, 0.0, float(z)]

        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.clip.insideout")
    def updateInsideOut(self, x, y, z):
        if self.clipX:
            self.clipX.InsideOut = 1 if x else 0
        if self.clipY:
            self.clipY.InsideOut = 1 if y else 0
        if self.clipZ:
            self.clipZ.InsideOut = 1 if z else 0

        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.clip.representation")
    def updateRepresentation(self, mode):
        self.reprMode = mode
        if self.representation:
            self.representation.Representation = mode
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.clip.color")
    def updateColorBy(self, field, location):
        self.colorBy = (location, field)
        if self.representation:
            if field == '__SOLID__':
                self.representation.ColorArrayName = ''
            else:
                simpleColorBy(self.representation, (location, field))
                lutProxy = self.representation.LookupTable
                pwfProxy = self.representation.ScalarOpacityFunction
                for array in self.ds.activeMeta['data']['arrays']:
                    if array['name'] == field and array['location'] == location:
                        vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, array['range'][0], array['range'][1], False)
                        if pwfProxy:
                          vtkSMTransferFunctionProxy.RescaleTransferFunction(pwfProxy.SMProxy, array['range'][0], array['range'][1], False)


            simple.Render()
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.clip.enable")
    def enableClip(self, enable):
        if enable and self.ds.getInput():
            if not self.clipX:
                bounds = self.ds.activeMeta['data']['bounds']
                center = [(bounds[i*2] + bounds[i*2+1])*0.5 for i in range(3)]
                self.clipX = simple.Clip(Input=self.ds.getInput())
                self.clipY = simple.Clip(Input=self.clipX)
                self.clipZ = simple.Clip(Input=self.clipY)

                self.clipX.ClipType.Origin = center
                self.clipX.ClipType.Normal = [1, 0, 0]
                self.clipY.ClipType.Origin = center
                self.clipY.ClipType.Normal = [0, 1, 0]
                self.clipZ.ClipType.Origin = center
                self.clipZ.ClipType.Normal = [0, 0, 1]
            else:
                self.clipX.Input = self.ds.getInput()

            if not self.representation:
                self.representation = simple.Show(self.clipZ)
                self.representation.Representation = self.reprMode
                self.representation.DiffuseColor = self.ds.foreground
                self.updateColorBy(self.colorBy[1], self.colorBy[0])

            self.representation.Visibility = 1

        if not enable and self.representation:
            self.representation.Visibility = 0

        simple.Render()
        self.getApplication().InvokeEvent('PushRender')

    def getOutput(self):
        if not self.clipX:
            bounds = self.ds.activeMeta['data']['bounds']
            center = [(bounds[i*2] + bounds[i*2+1])*0.5 for i in range(3)]
            self.clipX = simple.Clip(Input=self.ds.getInput())
            self.clipY = simple.Clip(Input=self.clipX)
            self.clipZ = simple.Clip(Input=self.clipY)

            self.clipX.ClipType.Origin = center
            self.clipX.ClipType.Normal = [1, 0, 0]
            self.clipY.ClipType.Origin = center
            self.clipY.ClipType.Normal = [0, 1, 0]
            self.clipZ.ClipType.Origin = center
            self.clipZ.ClipType.Normal = [0, 0, 1]

        return self.clipZ



# =============================================================================
#
# Contours management
#
# =============================================================================

class LightVizContour(pv_protocols.ParaViewWebProtocol):

    def __init__(self, dataset_manager, clip):
        super(LightVizContour, self).__init__()
        self.ds = dataset_manager
        self.clip = clip
        self.contour = None
        self.contourByField = None
        self.representation = None
        self.reprMode = 'Surface'
        self.colorBy = ('__SOLID__', '__SOLID__')
        self.useClippedInput = False
        dataset_manager.addListener(self)

    def dataChanged(self):
        self.updateRepresentation('Surface')
        self.updateColorBy(self.ds.activeMeta["data"]["arrays"][0]["name"], self.ds.activeMeta["data"]["arrays"][0]["location"])
        if self.contour:
            self.contour.Input = self.ds.getInput()
            self.contour.Isosurfaces = [ sum(self.ds.activeMeta["data"]["arrays"][0]["range"]) * 0.5, ]
            self.representation.Visibility = 0

    def setForegroundColor(self, foreground):
        if self.representation:
            self.representation.DiffuseColor = foreground
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.contour.useclipped")
    def setUseClipped(self, useClipped):
        if self.contour:
            if not self.useClippedInput and useClipped:
                self.contour.Input = self.clip.getOutput()
            elif self.useClippedInput and not useClipped:
                self.contour.Input = self.ds.getInput()
        self.useClippedInput = useClipped
        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.contour.getstate")
    def getState(self):
        ret = {
            "representation": "Surface",
            "color": self.colorBy,
            "enabled": False,
            "field": '',
            "use_clipped": self.useClippedInput,
            "values": [],
        }
        if self.contour:
            ret["representation"] = self.representation.Representation
            ret["color"] = self.colorBy
            ret["enabled"] = self.representation.Visibility == 1,
            ret["field"] = self.contour.ContourBy[1]
            ret["values"] = [i for i in self.contour.Isosurfaces]


        if not isinstance(ret["enabled"], bool):
            ret["enabled"] = ret["enabled"][0]

        return ret

    @exportRpc("light.viz.contour.values")
    def updateValues(self, values):
        if self.contour:
            self.contour.Isosurfaces = values
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.contour.by")
    def updateContourBy(self, field):
        if self.contour:
            self.contourByField = None
            self.contour.ContourBy = field
            self.getApplication().InvokeEvent('PushRender')
        else:
          self.contourByField = field

    @exportRpc("light.viz.contour.representation")
    def updateRepresentation(self, mode):
        self.reprMode = mode
        if self.representation:
            self.representation.Representation = mode
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.contour.color")
    def updateColorBy(self, field, location):
        self.colorBy = (location, field)
        if self.representation:
            if field == '__SOLID__':
                self.representation.ColorArrayName = ''
            else:
                simpleColorBy(self.representation, (location, field))
                lutProxy = self.representation.LookupTable
                for array in self.ds.activeMeta['data']['arrays']:
                    if array['name'] == field and array['location'] == location:
                        vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, array['range'][0], array['range'][1], False)

            simple.Render()
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.contour.enable")
    def enableContour(self, enable):
        if enable and self.ds.getInput():
            inpt = self.ds.getInput() if not self.useClippedInput else self.clip.getOutput()
            if not self.contour:
                self.contour = simple.Contour(Input=inpt, ComputeScalars=1, ComputeNormals=1)
                self.representation = simple.Show(self.contour)
                self.representation.Representation = self.reprMode
                self.representation.DiffuseColor = self.ds.foreground
                self.updateColorBy(self.colorBy[1], self.colorBy[0])
                if self.contourByField:
                  self.updateContourBy(self.contourByField)
            else:
                self.contour.Input = inpt

            self.representation.Visibility = 1

        if not enable and self.representation:
            self.representation.Visibility = 0

        simple.Render()
        self.getApplication().InvokeEvent('PushRender')

# =============================================================================
#
# Slice management
#
# =============================================================================

class LightVizSlice(pv_protocols.ParaViewWebProtocol):

    def __init__(self, dataset_manager, clip):
        super(LightVizSlice, self).__init__()
        self.ds = dataset_manager
        self.clip = clip
        self.sliceX = None
        self.sliceY = None
        self.sliceZ = None
        self.representationX = None
        self.representationY = None
        self.representationZ = None
        self.center = None
        self.visible = [1, 1, 1]
        self.enabled = False
        self.reprMode = 'Surface'
        self.colorBy = ('__SOLID__', '__SOLID__')
        self.useClippedInput = False
        dataset_manager.addListener(self)

    def dataChanged(self):
        self.updateRepresentation('Surface')
        self.updateColorBy('__SOLID__', '__SOLID__')
        if self.sliceX:
            bounds = self.ds.activeMeta['data']['bounds']
            center = [(bounds[i*2] + bounds[i*2+1])*0.5 for i in range(3)]
            self.sliceX.Input = self.ds.getInput()
            self.sliceY.Input = self.ds.getInput()
            self.sliceZ.Input = self.ds.getInput()
            self.updatePosition(center[0], center[1], center[2])
            self.representationX.Representation = 'Surface'
            self.representationY.Representation = 'Surface'
            self.representationZ.Representation = 'Surface'
            self.representationX.Visibility = 0
            self.representationY.Visibility = 0
            self.representationZ.Visibility = 0
            self.enabled = False

    def setForegroundColor(self, foreground):
        if self.representationX:
            self.representationX.DiffuseColor = foreground
            self.representationY.DiffuseColor = foreground
            self.representationZ.DiffuseColor = foreground

    @exportRpc("light.viz.slice.useclipped")
    def setUseClipped(self, useClipped):
        if self.sliceX:
            if not self.useClippedInput and useClipped:
                for slice in [self.sliceX, self.sliceY, self.sliceZ]:
                    slice.Input = self.clip.getOutput()
            elif self.useClippedInput and not useClipped:
                for slice in [self.sliceX, self.sliceY, self.sliceZ]:
                    slice.Input = self.ds.getInput()
        self.useClippedInput = useClipped
        self.getApplication().InvokeEvent('PushRender')


    @exportRpc("light.viz.slice.getstate")
    def getState(self):
        ret = {
            "representation": self.reprMode,
            "color": self.colorBy,
            "enabled": self.enabled,
            "xPosition": 0,
            "yPosition": 0,
            "zPosition": 0,
            "xVisible": self.visible[0] == 1,
            "yVisible": self.visible[1] == 1,
            "zVisible": self.visible[2] == 1,
            "use_clipped": self.useClippedInput,
        }
        if self.center:
            ret['xPosition'] = self.center[0]
            ret['yPosition'] = self.center[1]
            ret['zPosition'] = self.center[2]

        if not isinstance(ret["enabled"], bool):
            ret["enabled"] = ret["enabled"][0]

        return ret

    @exportRpc("light.viz.slice.position")
    def updatePosition(self, x, y, z):
        self.center = [x, y, z]
        if self.sliceX:
            self.sliceX.SliceType.Origin = self.center
        if self.sliceY:
            self.sliceY.SliceType.Origin = self.center
        if self.sliceZ:
            self.sliceZ.SliceType.Origin = self.center
        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.slice.visibility")
    def updateVisibility(self, x, y, z):
        self.visible = [ 1 if x else 0, 1 if y else 0, 1 if z else 0]
        if self.representationX:
            self.representationX.Visibility = self.visible[0] and self.enabled
        if self.representationY:
            self.representationY.Visibility = self.visible[1] and self.enabled
        if self.representationZ:
            self.representationZ.Visibility = self.visible[2] and self.enabled
        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.slice.representation")
    def updateRepresentation(self, mode):
        self.reprMode = mode
        if self.representationX:
            self.representationX.Representation = mode
            self.representationY.Representation = mode
            self.representationZ.Representation = mode
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.slice.color")
    def updateColorBy(self, field, location):
        self.colorBy = (location, field)
        if self.representationX:
            if field == '__SOLID__':
                self.representationX.ColorArrayName = ''
                self.representationY.ColorArrayName = ''
                self.representationZ.ColorArrayName = ''
            else:
                simpleColorBy(self.representationX, self.colorBy)
                simpleColorBy(self.representationY, self.colorBy)
                simpleColorBy(self.representationZ, self.colorBy)
                # Update data array range
                for rep in [self.representationX, self.representationY, self.representationZ]:
                  lutProxy = rep.LookupTable
                  for array in self.ds.activeMeta['data']['arrays']:
                      if array['name'] == field and array['location'] == location:
                          vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, array['range'][0], array['range'][1], False)

            simple.Render()
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.slice.enable")
    def enableSlice(self, enable):
        if enable and self.ds.getInput():
            inpt = self.ds.getInput() if not self.useClippedInput else self.clip.getOutput()
            if not self.sliceX:
                bounds = self.ds.activeMeta['data']['bounds']
                center = self.center
                if center is None:
                    center = [(bounds[i*2] + bounds[i*2+1])*0.5 for i in range(3)]
                self.sliceX = simple.Slice(Input=inpt)
                self.sliceY = simple.Slice(Input=inpt)
                self.sliceZ = simple.Slice(Input=inpt)

                self.sliceX.SliceType.Origin = center
                self.sliceX.SliceType.Normal = [1, 0, 0]
                self.sliceY.SliceType.Origin = center
                self.sliceY.SliceType.Normal = [0, 1, 0]
                self.sliceZ.SliceType.Origin = center
                self.sliceZ.SliceType.Normal = [0, 0, 1]

                self.representationX = simple.Show(self.sliceX)
                self.representationY = simple.Show(self.sliceY)
                self.representationZ = simple.Show(self.sliceZ)

                self.representationX.DiffuseColor = self.ds.foreground
                self.representationY.DiffuseColor = self.ds.foreground
                self.representationZ.DiffuseColor = self.ds.foreground

                self.updateRepresentation(self.reprMode)
                self.updateColorBy(self.colorBy[1], self.colorBy[0])
            else:
                self.sliceX.Input = inpt
                self.sliceY.Input = inpt
                self.sliceZ.Input = inpt
            self.representationX.Visibility = self.visible[0]
            self.representationY.Visibility = self.visible[1]
            self.representationZ.Visibility = self.visible[2]

        if not enable and self.representationX:
            self.representationX.Visibility = 0
            self.representationY.Visibility = 0
            self.representationZ.Visibility = 0

        self.enabled = enable
        simple.Render()
        self.getApplication().InvokeEvent('PushRender')

# =============================================================================
#
# Multi-Slice management
#
# =============================================================================

class LightVizMultiSlice(pv_protocols.ParaViewWebProtocol):

    def __init__(self, dataset_manager, clip):
        super(LightVizMultiSlice, self).__init__()
        self.ds = dataset_manager
        self.clip = clip
        self.slice = None
        self.representation = None
        self.normal = 0
        self.slicePositions = []
        self.reprMode = "Surface"
        self.colorBy = ('__SOLID__', '__SOLID__')
        self.useClippedInput = False
        dataset_manager.addListener(self)

    def dataChanged(self):
        self.updateRepresentation('Surface')
        self.updateColorBy(self.ds.activeMeta["data"]["arrays"][0]["name"], self.ds.activeMeta["data"]["arrays"][0]["location"])
        bounds = self.ds.activeMeta['data']['bounds']
        center = [(bounds[i*2] + bounds[i*2+1])*0.5 for i in range(3)]
        self.updateNormal(0)
        self.updateSlicePositions([center[0]])
        if self.slice:
            self.slice.Input = self.ds.getInput()
            self.representation.Visibility = 0

    def setForegroundColor(self, foreground):
        if self.representation:
            self.representation.DiffuseColor = foreground

    @exportRpc("light.viz.mslice.useclipped")
    def setUseClipped(self, useClipped):
        if self.slice:
            if not self.useClippedInput and useClipped:
                self.slice.Input = self.clip.getOutput()
            elif self.useClippedInput and not useClipped:
                self.slice.Input = self.ds.getInput()
        self.useClippedInput = useClipped
        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.mslice.getstate")
    def getState(self):
        ret = {
            'enabled': False,
            'representation': self.reprMode,
            'color': self.colorBy,
            'positions': self.slicePositions,
            'normal': str(self.normal),
            "use_clipped": self.useClippedInput,
        }
        if self.representation:
            ret["enabled"] = True if self.representation.Visibility else False
        return ret


    @exportRpc("light.viz.mslice.normal")
    def updateNormal(self, normalAxis):
        self.normal = int(normalAxis)
        if self.slice:
            normal = [0, 0, 0]
            normal[self.normal] = 1
            self.slice.SliceType.Normal = normal
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.mslice.positions")
    def updateSlicePositions(self, positions):
        self.slicePositions = positions;
        if self.slice:
            self.slice.SliceOffsetValues = positions
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.mslice.representation")
    def updateRepresentation(self, mode):
        self.reprMode = mode
        if self.representation:
            self.representation.Representation = mode
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.mslice.color")
    def updateColorBy(self, field, location):
        self.colorBy = (location, field)
        if self.representation:
            if field == '__SOLID__':
                self.representation.ColorArrayName = ''
            else:
                simpleColorBy(self.representation, self.colorBy)
                # Update data array range
                lutProxy = self.representation.LookupTable
                for array in self.ds.activeMeta['data']['arrays']:
                    if array['name'] == field and array['location'] == location:
                        vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, array['range'][0], array['range'][1], False)

            simple.Render()
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.mslice.enable")
    def enableSlice(self, enable):
        if enable and self.ds.getInput():
            inpt = self.ds.getInput() if not self.useClippedInput else self.clip.getOutput()
            if not self.slice:
                self.slice = simple.Slice(Input=inpt)
                normal = [0, 0, 0]
                normal[self.normal] = 1
                self.slice.SliceType.Normal = normal
                self.slice.SliceOffsetValues = self.slicePositions
                self.representation = simple.Show(self.slice)
                self.representation.Representation = self.reprMode
                self.representation.DiffuseColor = self.ds.foreground
                self.updateColorBy(self.colorBy[1], self.colorBy[0])
            else:
                self.slice.Input = inpt
            self.representation.Visibility = 1

        if not enable and self.representation:
            self.representation.Visibility = 0

        simple.Render()
        self.getApplication().InvokeEvent('PushRender')

# =============================================================================
#
# Streamline management
#
# =============================================================================

class LightVizStreamline(pv_protocols.ParaViewWebProtocol):

    def __init__(self, dataset_manager):
        super(LightVizStreamline, self).__init__()
        self.ds = dataset_manager
        self.streamline = None
        self.tube = None
        self.seed = None
        self.seedRep = None
        self.position = [ 0.0, 0.0, 0.0 ]
        self.representation = None
        self.reprMode = 'Surface'
        self.colorBy = ('__SOLID__', '__SOLID__')
        self.vector = None
        self.numPoints = 50
        self.radius = 1.0
        dataset_manager.addListener(self)

    def dataChanged(self):
        bounds = self.ds.activeMeta['data']['bounds']
        length = [bounds[i*2+1] - bounds[i*2] for i in range(3)]
        self.updateRepresentation('Surface')
        self.updateColorBy('__SOLID__', '__SOLID__')
        self.vector = None
        self.updateRadius(min(length) / 8.0)
        self.updatePosition((bounds[1] + bounds[0])/2.0,
                            (bounds[3] + bounds[2])/2.0,
                            (bounds[5] + bounds[4])/2.0)
        for array in self.ds.activeMeta['data']['arrays']:
            if array['dimension'] == 3:
                self.vector = array['name']
                break
        if self.streamline:
            self.streamline.Input = self.ds.getInput()
        if self.representation:
            self.representation.Visibility = 0

    def setForegroundColor(self, foreground):
        if self.representation:
            self.representation.DiffuseColor = foreground

    @exportRpc("light.viz.streamline.getstate")
    def getState(self):
        ret = {
            "representation": self.reprMode,
            "color": self.colorBy,
            "enabled": False,
            "xPosition": self.position[0],
            "yPosition": self.position[1],
            "zPosition": self.position[2],
            "vector": self.vector,
            "numPoints": self.numPoints,
            "radius": self.radius,
        }
        if self.representation:
            ret["enabled"] = self.representation.Visibility == 1,

        if not isinstance(ret["enabled"], bool):
            ret["enabled"] = ret["enabled"][0]

        return ret

    @exportRpc("light.viz.streamline.position")
    def updatePosition(self, x, y, z):
        self.position = [x, y, z]
        if self.streamline:
            self.seed.Center = self.position
            self.streamline.SeedType.Center = self.position
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.streamline.vector")
    def updateVector(self, vectorName):
        self.vector = vectorName
        if self.streamline:
            self.streamline.Vectors = ['POINTS', self.vector]
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.streamline.numpoints")
    def updateNumPoints(self, num):
        self.numPoints = int(num)
        if self.streamline:
            self.streamline.SeedType.NumberOfPoints = self.numPoints
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.streamline.radius")
    def updateRadius(self, rad):
        self.radius = float(rad)
        if self.streamline:
            self.seed.Radius = self.radius
            self.streamline.SeedType.Radius = self.radius
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.streamline.representation")
    def updateRepresentation(self, mode):
        self.reprMode = mode
        if self.representation:
            self.representation.Representation = mode
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.streamline.color")
    def updateColorBy(self, field, location):
        self.colorBy = (location, field)
        if self.representation:
            if field == '__SOLID__':
                self.representation.ColorArrayName = ''
            else:
                simpleColorBy(self.representation, self.colorBy)
                # Update data array range
                lutProxy = self.representation.LookupTable
                for array in self.ds.activeMeta['data']['arrays']:
                    if array['name'] == field and array['location'] == location:
                        vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, array['range'][0], array['range'][1], False)

            simple.Render()
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.streamline.enable")
    def enableStreamline(self, enable):
        if enable and self.ds.getInput():
            if not self.streamline:
                bounds = self.ds.activeMeta['data']['bounds']
                length = [bounds[i*2+1] - bounds[i*2] for i in range(3)]
                self.streamline = simple.StreamTracer(Input=self.ds.getInput(), SeedType='Point Source')
                self.streamline.Vectors = ['POINTS', self.vector]
                self.streamline.MaximumStreamlineLength = 2 * max(length)

                self.streamline.SeedType.Center = self.position
                self.streamline.SeedType.Radius = self.radius
                self.streamline.SeedType.NumberOfPoints = self.numPoints

                if not self.seed:
                  self.seed = simple.Sphere()
                  self.seed.Center = self.position
                  self.seed.Radius = self.radius
                  self.seedRep = simple.Show(Input=self.seed)
                  self.seedRep.Representation = 'Wireframe'
                  self.seedRep.DiffuseColor = [1, 1, 1]
                  self.seedRep.Visibility = 0

                self.tube = simple.Tube(Input=self.streamline)
                self.tube.Capping = 1
                self.tube.Radius = min(length) / 100.0

            else:
                self.streamline.Input = self.ds.getInput()

            if not self.representation:
                self.representation = simple.Show(self.tube)
                self.representation.Representation = self.reprMode
                self.representation.DiffuseColor = self.ds.foreground
                self.updateColorBy(self.colorBy[1], self.colorBy[0])

            self.representation.Visibility = 1

        if not enable and self.representation:
            self.representation.Visibility = 0

        simple.Render()
        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.streamline.seed.show")
    def showSeed(self, enable):
        if enable and self.ds.getInput():
            self.seedRep.Visibility = 1
        elif (not enable) and self.seedRep:
            self.seedRep.Visibility = 0

        self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.streamline.seed.update")
    def updateSeed(self, position, radius):
      if self.seed:
        self.seed.Center = position
        self.seed.Radius = radius
        self.getApplication().InvokeEvent('PushRender')

# =============================================================================
#
# Volume management
#
# =============================================================================

class LightVizVolume(pv_protocols.ParaViewWebProtocol):

    def __init__(self, dataset_manager, clip):
        super(LightVizVolume, self).__init__()
        self.ds = dataset_manager
        self.clip = clip
        self.passThrough = None
        self.representation = None
        self.colorBy = ('__SOLID__', '__SOLID__')
        self.useClippedInput = False
        dataset_manager.addListener(self)

    def dataChanged(self):
        self.updateColorBy(self.ds.activeMeta["data"]["arrays"][0]["name"], self.ds.activeMeta["data"]["arrays"][0]["location"])
        if self.passThrough:
            simple.Delete(self.passThrough)
            self.passThrough = None
            simple.Delete(self.representation)
            self.representation = None

    def setForegroundColor(self, foreground):
        pass

    @exportRpc("light.viz.volume.useclipped")
    def setUseClipped(self, useClipped):
        if self.useClippedInput != useClipped:
            self.useClippedInput = useClipped
            if self.passThrough:
                oldVisibility = self.representation.Visibility
                simple.Delete(self.representation);
                self.representation = None
                simple.Delete(self.passThrough);
                self.passThrough = None
                self.enableVolume(oldVisibility)


                self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.volume.getstate")
    def getState(self):
        ret = {
            'enabled': False,
            'color': self.colorBy,
            "use_clipped": self.useClippedInput,
        }
        if self.representation:
            ret["enabled"] = True if self.representation.Visibility else False
        return ret

    @exportRpc("light.viz.volume.representation")
    def updateRepresentation(self, mode):
        pass # It is a volume rendering, so that is the only valid representation

    @exportRpc("light.viz.volume.color")
    def updateColorBy(self, field, location):
        self.colorBy = (location, field)
        if self.representation:
            if field == '__SOLID__':
                self.representation.ColorArrayName = ''
            else:
                simpleColorBy(self.representation, self.colorBy)
                # Update data array range
                lutProxy = self.representation.LookupTable
                pwfProxy = self.representation.ScalarOpacityFunction
                for array in self.ds.activeMeta['data']['arrays']:
                    if array['name'] == field and array['location'] == location:
                        vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, array['range'][0], array['range'][1], False)
                        if pwfProxy:
                          vtkSMTransferFunctionProxy.RescaleTransferFunction(pwfProxy.SMProxy, array['range'][0], array['range'][1], False)

            simple.Render()
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.volume.enable")
    def enableVolume(self, enable):
        if enable and self.ds.getInput():
            inpt = self.ds.getInput() if not self.useClippedInput else self.clip.getOutput()
            if not self.passThrough:
                self.passThrough = simple.Calculator(Input=inpt)
            else:
                self.passThrough.Input = inpt
            if not self.representation:
                self.representation = simple.Show(self.passThrough)
                self.representation.Representation = 'Volume'
                self.updateColorBy(self.colorBy[1], self.colorBy[0])
            self.representation.Visibility = 1

        if not enable and self.representation:
            self.representation.Visibility = 0

        simple.Render()
        self.getApplication().InvokeEvent('PushRender')

# =============================================================================
#
# Threshold management
#
# =============================================================================

class LightVizThreshold(pv_protocols.ParaViewWebProtocol):

    def __init__(self, dataset_manager, clip):
        super(LightVizThreshold, self).__init__()
        self.ds = dataset_manager
        self.clip = clip
        self.thresh = None
        self.representation = None
        self.colorBy = ('__SOLID__', '__SOLID__')
        self.useClippedInput = False
        self.rangeMin = 0
        self.rangeMax = 1
        self.thresholdBy = None
        dataset_manager.addListener(self)

    def dataChanged(self):
        self.rangeMin = self.ds.activeMeta['data']['arrays'][0]['range'][0]
        self.rangeMax = self.ds.activeMeta['data']['arrays'][0]['range'][1]
        self.thresholdBy = self.ds.activeMeta['data']['arrays'][0]['name']
        if self.thresh:
            simple.Delete(self.thresh)
            self.thresh = None
        if self.representation:
            simple.Delete(self.representation)
            self.representation = None
        self.updateColorBy('__SOLID__', '__SOLID__')

    def setForegroundColor(self, foreground):
        if self.representation:
            self.representation.DiffuseColor = foreground

    @exportRpc("light.viz.threshold.useclipped")
    def setUseClipped(self, useClipped):
        if self.useClippedInput != useClipped:
            self.useClippedInput = useClipped
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.threshold.getstate")
    def getState(self):
        ret = {
            'enabled': False,
            'color': self.colorBy,
            'rangeMin': self.rangeMin,
            'rangeMax': self.rangeMax,
            'thresholdBy': self.thresholdBy,
            'use_clipped': self.useClippedInput,
        }
        if self.representation:
            ret["enabled"] = True if self.representation.Visibility else False
        return ret

    @exportRpc("light.viz.threshold.representation")
    def updateRepresentation(self, mode):
        self.reprMode = mode
        if self.representation:
            self.representation.Representation = mode
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.threshold.range")
    def updateRange(self, rangeMin, rangeMax):
        self.rangeMin = rangeMin
        self.rangeMax = rangeMax
        if self.thresh:
            self.thresh.ThresholdRange = [self.rangeMin, self.rangeMax]
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.threshold.color")
    def updateColorBy(self, field, location):
        self.colorBy = (location, field)
        if self.representation:
            if field == '__SOLID__':
                self.representation.ColorArrayName = ''
            else:
                simpleColorBy(self.representation, self.colorBy)
                # Update data array range
                lutProxy = self.representation.LookupTable
                pwfProxy = self.representation.ScalarOpacityFunction
                for array in self.ds.activeMeta['data']['arrays']:
                    if array['name'] == field and array['location'] == location:
                        vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, array['range'][0], array['range'][1], False)
                        if pwfProxy:
                          vtkSMTransferFunctionProxy.RescaleTransferFunction(pwfProxy.SMProxy, array['range'][0], array['range'][1], False)

            simple.Render()
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.threshold.by")
    def updateThresholdBy(self, field):
        self.thresholdBy = field
        if self.thresh:
            self.thresh.Scalars = ['POINTS', field]
            # simple.SaveState('/tmp/myteststate.pvsm')
            self.getApplication().InvokeEvent('PushRender')

    @exportRpc("light.viz.threshold.enable")
    def enableThreshold(self, enable):
        if enable and self.ds.getInput():
            inpt = self.ds.getInput() if not self.useClippedInput else self.clip.getOutput()
            if not self.thresh:
                self.thresh = simple.Threshold(Input=inpt)
                self.thresh.ThresholdRange = [ self.rangeMin, self.rangeMax ]
                self.thresh.Scalars = ['POINTS', self.thresholdBy]
                self.representation = simple.Show(self.thresh)
            self.representation.Visibility = 1

        if not enable and self.representation:
            self.representation.Visibility = 0

        simple.Render()
        self.getApplication().InvokeEvent('PushRender')
