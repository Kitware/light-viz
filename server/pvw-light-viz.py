r"""
    This module is a ParaViewWeb server application.
    The following command line illustrates how to use it::

        $ pvpython -dr .../pvw-light-viz.py --data-dir /.../path-to-your-data-directory

        --data-dir
             Path used to list that directory on the server and let the client choose a
             file to load.  You may also specify multiple directories, each with a name
             that should be displayed as the top-level name of the directory in the UI.
             If this parameter takes the form: "name1=path1|name2=path2|...",
             then we will treat this as the case where multiple data directories are
             required.  In this case, each top-level directory will be given the name
             associated with the directory in the argument.

        --load-file try to load the file relative to data-dir if any.

        --ds-host None
             Host name where pvserver has been started

        --ds-port 11111
              Port number to use to connect to pvserver

        --rs-host None
              Host name where renderserver has been started

        --rs-port 22222
              Port number to use to connect to the renderserver

        --exclude-regex "[0-9]+\\."
              Regular expression used to filter out files in directory/file listing.

        --group-regex "^\\.|~$|^\\$"
              Regular expression used to group files into a single loadable entity.

        --plugins
            Colon-separated (':') list of fully qualified path names to plugin objects
            to load.

        --color-palette-file
            File to load to define a set of color maps.  File format is the same as
            for ParaViews 'ColorMaps.xml' configuration file.

        --proxies
            Path to a file with json text containing sources, filters and readers
            allowed to be used by ParaViewWeb.

        --no-auto-readers
            If provided, disallows the use of readers not specifically mentioned in
            the above proxies configuration file.  Do not provide this option if you
            want paraview.simple to try and figure out the appropriate reader for
            files you try to open.

        --reverse-connect-port
            If supplied, a reverse connection will be established on the given port.
            This option is useful when running in mpi mode and you want pvservers to
            connect to this pvpython application.

        --save-data-dir
            Server directory under which all data will be saved.  Data, state, and
            screenshots can be saved to relative paths under this directory.

    Any ParaViewWeb executable script comes with a set of standard arguments that can be overriden if need be::

        --port 8080
             Port number on which the HTTP server will listen.

        --content /path-to-web-content/
             Directory that you want to serve as static web content.
             By default, this variable is empty which means that we rely on another
             server to deliver the static content and the current process only
             focuses on the WebSocket connectivity of clients.

        --authKey vtkweb-secret
             Secret key that should be provided by the client to allow it to make
             any WebSocket communication. The client will assume if none is given
             that the server expects "vtkweb-secret" as secret key.

"""

# import to process args
import os

# import paraview modules.
from paraview.web import wamp      as pv_wamp
from paraview.web import protocols as pv_protocols

import light_viz_protocols as lv_protocols

# import RPC annotation
from autobahn.wamp import register as exportRpc

from paraview import simple
from vtk.web import server

try:
    import argparse
except ImportError:
    # since  Python 2.6 and earlier don't have argparse, we simply provide
    # the source for the same as _argparse and we use it instead.
    from vtk.util import _argparse as argparse

# =============================================================================
# Create custom Pipeline Manager class to handle clients requests
# =============================================================================

class LightVizServer(pv_wamp.PVServerProtocol):

    dataDir = os.getcwd()
    authKey = "vtkweb-secret"
    dsHost = None
    dsPort = 11111
    rsHost = None
    rsPort = 11111
    rcPort = -1
    fileToLoad = None
    groupRegex = "[0-9]+\\."
    excludeRegex = "^\\.|~$|^\\$"
    plugins = None
    filterFile = None
    colorPalette = None
    proxies = None
    allReaders = True
    saveDataDir = os.getcwd()

    @staticmethod
    def add_arguments(parser):
        parser.add_argument("--data", default=os.getcwd(), help="path to data directory to list", dest="data")

    @staticmethod
    def configure(args):
        LightVizServer.authKey = args.authKey
        LightVizServer.data    = args.data

    def initialize(self):
        # Bring used components
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebFileListing(LightVizServer.data, "Home", LightVizServer.excludeRegex, LightVizServer.groupRegex))
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebMouseHandler())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPort())

        # self.registerVtkWebProtocol(lv_protocols.LightVizViewportSize())
        datasetManager = lv_protocols.LightVizDatasets(LightVizServer.data)
        clipManager = lv_protocols.LightVizClip(datasetManager)
        self.registerVtkWebProtocol(datasetManager)
        self.registerVtkWebProtocol(clipManager)
        self.registerVtkWebProtocol(lv_protocols.LightVizContour(datasetManager, clipManager))
        self.registerVtkWebProtocol(lv_protocols.LightVizSlice(datasetManager, clipManager))
        self.registerVtkWebProtocol(lv_protocols.LightVizMultiSlice(datasetManager, clipManager))

        # Update authentication key to use
        self.updateSecret(LightVizServer.authKey)

        # Disable interactor-based render calls
        simple.GetRenderView().EnableRenderOnInteraction = 0
        simple.GetRenderView().Background = [0,0,0]
        simple.GetRenderView().Background2 = [0,0,0]

# =============================================================================
# Main: Parse args and start server
# =============================================================================

if __name__ == "__main__":
    # Create argument parser
    parser = argparse.ArgumentParser(description="LightViz")

    # Add arguments
    server.add_arguments(parser)
    LightVizServer.add_arguments(parser)
    args = parser.parse_args()
    LightVizServer.configure(args)

    # Start server
    server.start_webserver(options=args, protocol=LightVizServer)
