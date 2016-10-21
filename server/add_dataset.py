import os
import json
import shutil

from paraview import simple

def humanReadableSize(size):
    suffixes = ['', 'K', 'M', 'G', 'T', 'P'] # We don't support data files in exobytes
    count = 0
    remaining = size
    while remaining > 1024:
        remaining = remaining / 1024
        count += 1
    return '%d%s' % (remaining, suffixes[count])

def getArrayInformation(array, location):
    rangeComponent = 0
    if array.GetNumberOfComponents() > 1:
        rangeComponent = -1
    result = {
        'name': array.GetName(),
        'label': array.GetName(),
        'dimension': array.GetNumberOfComponents(),
        'range': [ x for x in array.GetRange(rangeComponent)],
        'location': location,
    }
    return result

def updateArrayBoundsForTimestep(array, arrayInfoMap):
    info = arrayInfoMap[array.GetName()]
    rangeComponent = 0
    if array.GetNumberOfComponents() > 1:
        rangeComponent = -1
    newRange = array.GetRange(rangeComponent)
    info['range'] = [ min(newRange[0], info['range'][0]),
                      max(newRange[1], info['range'][1])]

def loadArrayData(data, location, arrayMap):
    for i in range(data.GetNumberOfArrays()):
        array = data.GetArray(i)
        if array:
            if array.GetName() in arrayMap:
                updateArrayBoundsForTimestep(array, arrayMap)
            else:
                arrayMap[array.GetName()] = getArrayInformation(array, location)

def loadArrayDataMultiBlock(dataset, pointArrayMap, cellArrayMap):
    if dataset is None:
        return
    if dataset.GetClassName() == "vtkMultiBlockDataSet":
        for i in range(dataset.GetNumberOfBlocks()):
            loadArrayDataMultiBlock(dataset.GetBlock(i), pointArrayMap, cellArrayMap)
    else:
        loadArrayData(dataset.GetPointData(), 'POINTS', pointArrayMap)
        loadArrayData(dataset.GetCellData(), 'CELLS', cellArrayMap)

def unionBounds(b1, b2):
    if b1 is None:
        return b2
    if b2 is None:
        return b1
    return [min(b1[0], b2[0]), max(b1[1], b2[1]),
            min(b1[2], b2[2]), max(b1[3], b2[3]),
            min(b1[4], b2[4]), max(b1[5], b2[5])]

def getBounds(ds):
    if ds is None:
        return None
    bounds = None
    if ds.GetClassName() == "vtkMultiBlockDataSet":
        for i in range(ds.GetNumberOfBlocks()):
            if bounds is None:
                bounds = getBounds(ds.GetBlock(i))
            else:
                bounds = unionBounds(bounds, getBounds(ds.GetBlock(i)))
    else:
        bounds = ds.GetBounds()
    return bounds

def importDataset(dataDir, datafile, description, autoApply=True):
    if not os.path.exists(datafile):
        print "Data file \"%s\" does not exist" % datafile
        return
    basename = os.path.basename(datafile)
    filedir = os.path.join(dataDir, basename)
    os.mkdir(filedir)
    shutil.copyfile(datafile, os.path.join(filedir, basename))
    result = {
        'name': basename,
        'size': humanReadableSize(os.path.getsize(datafile)),
        'description': description,
        'thumbnails': [],
        'autoApply': autoApply,
        'data': {
            'file': basename,
            'bounds': None,
            'arrays': [],
            'time': [],
        },
    }
    reader = simple.OpenDataFile(datafile)
    rep = simple.Show(reader)
    rep.Visibility = 1
    view = simple.Render()
    view.ViewSize = [400, 400]

    ds = reader.GetClientSideObject().GetOutputDataObject(0)
    pointArrayMap = {}
    cellArrayMap = {}
    loadArrayDataMultiBlock(ds, pointArrayMap, cellArrayMap)
    bounds = getBounds(ds)

    if 'TimestepValues' in reader.ListProperties() and len(reader.TimestepValues) > 0:
        for idx in range(len(reader.TimestepValues)):
            t = reader.TimestepValues[idx]
            result['data']['time'].append({ 'idx': idx, 'value': t })
            reader.UpdatePipeline(t)
            ds = reader.GetClientSideObject().GetOutputDataObject(0)
            loadArrayDataMultiBlock(ds, pointArrayMap, cellArrayMap)
            newBounds = getBounds(ds)
            bounds = unionBounds(bounds, newBounds)

    result['data']['arrays'] = pointArrayMap.values() + cellArrayMap.values()
    result['data']['bounds'] = bounds

    tnpath = os.path.join(filedir, 'thumbnail0.png')
    simple.SaveScreenshot(tnpath, view)
    result['thumbnails'].append('thumbnail0.png')

    with open(os.path.join(filedir, 'index.json'), 'w') as fp:
        json.dump(result, fp)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='A script to import data files into lightviz')
    parser.add_argument('--data-dir', help='Lightviz data directory to import to', dest='dataDir', required=True)
    parser.add_argument('--file', help='file to import', dest='file', required=True)
    parser.add_argument('--description', help='description of the dataset', dest='description', required=True)
    parser.add_argument('--autoApply', action='store_true', default=False, help='Add this option to enable automatic Apply calls for the dataset', dest='autoApply')
    args = parser.parse_args()
    importDataset(args.dataDir, args.file, args.description, args.autoApply)
