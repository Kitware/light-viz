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
        parser.add_argument("--data-dir", default=os.getcwd(), help="path to data directory to list, or else multiple directories given as 'name1=path1|name2=path2|...'", dest="path")
        parser.add_argument("--load-file", default=None, help="File to load if any based on data-dir base path", dest="file")
        parser.add_argument("--color-palette-file", default=None, help="File to load to define a set of color map", dest="palettes")
        parser.add_argument("--ds-host", default=None, help="Hostname to connect to for DataServer", dest="dsHost")
        parser.add_argument("--ds-port", default=11111, type=int, help="Port number to connect to for DataServer", dest="dsPort")
        parser.add_argument("--rs-host", default=None, help="Hostname to connect to for RenderServer", dest="rsHost")
        parser.add_argument("--rs-port", default=11111, type=int, help="Port number to connect to for RenderServer", dest="rsPort")
        parser.add_argument("--reverse-connect-port", default=-1, type=int, help="If supplied, a reverse connection will be established on the given port", dest="reverseConnectPort")
        parser.add_argument("--exclude-regex", default="^\\.|~$|^\\$", help="Regular expression for file filtering", dest="exclude")
        parser.add_argument("--group-regex", default="[0-9]+\\.", help="Regular expression for grouping files", dest="group")
        parser.add_argument("--plugins", default="", help="List of fully qualified path names to plugin objects to load", dest="plugins")
        parser.add_argument("--proxies", default=None, help="Path to a file with json text containing filters to load", dest="proxies")
        parser.add_argument("--no-auto-readers", help="If provided, disables ability to use non-configured readers", action="store_true", dest="no_auto_readers")
        parser.add_argument("--save-data-dir", default='', help="Server directory under which all data will be saved", dest="saveDataDir")

    @staticmethod
    def configure(args):
        LightVizServer.authKey         = args.authKey
        LightVizServer.dataDir         = args.path
        LightVizServer.dsHost          = args.dsHost
        LightVizServer.dsPort          = args.dsPort
        LightVizServer.rsHost          = args.rsHost
        LightVizServer.rsPort          = args.rsPort
        LightVizServer.rcPort          = args.reverseConnectPort
        LightVizServer.excludeRegex    = args.exclude
        LightVizServer.groupRegex      = args.group
        LightVizServer.plugins         = args.plugins
        LightVizServer.proxies         = args.proxies
        LightVizServer.colorPalette    = args.palettes
        LightVizServer.allReaders      = not args.no_auto_readers

        # If no save directory is provided, default it to the data directory
        if args.saveDataDir == '':
            LightVizServer.saveDataDir = LightVizServer.dataDir
        else:
            LightVizServer.saveDataDir = args.saveDataDir

        if args.file:
            LightVizServer.fileToLoad  = os.path.join(args.path, args.file)

    def initialize(self):
        # Bring used components
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebStartupRemoteConnection(LightVizServer.dsHost, LightVizServer.dsPort, LightVizServer.rsHost, LightVizServer.rsPort, LightVizServer.rcPort))
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebStartupPluginLoader(LightVizServer.plugins))
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebFileListing(LightVizServer.dataDir, "Home", LightVizServer.excludeRegex, LightVizServer.groupRegex))
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebProxyManager(allowedProxiesFile=LightVizServer.proxies, baseDir=LightVizServer.dataDir, fileToLoad=LightVizServer.fileToLoad, allowUnconfiguredReaders=LightVizServer.allReaders))
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebColorManager(pathToColorMaps=LightVizServer.colorPalette))
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebMouseHandler())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPort())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPortImageDelivery())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPortGeometryDelivery())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebTimeHandler())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebSelectionHandler())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebWidgetManager())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebKeyValuePairStore())
        self.registerVtkWebProtocol(pv_protocols.ParaViewWebSaveData(baseSavePath=LightVizServer.saveDataDir))

        # Update authentication key to use
        self.updateSecret(LightVizServer.authKey)

        # Disable interactor-based render calls
        simple.GetRenderView().EnableRenderOnInteraction = 0

        simple.Cone()
        simple.Show()
        simple.Render()

# =============================================================================
# Main: Parse args and start server
# =============================================================================

if __name__ == "__main__":
    # Create argument parser
    parser = argparse.ArgumentParser(description="ParaView Web Visualizer")

    # Add arguments
    server.add_arguments(parser)
    LightVizServer.add_arguments(parser)
    args = parser.parse_args()
    LightVizServer.configure(args)

    # Start server
    server.start_webserver(options=args, protocol=LightVizServer)
