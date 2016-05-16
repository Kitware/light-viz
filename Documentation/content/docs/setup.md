Getting Started
---------------

Install Lightviz with `npm install light-viz`.  This should give you the LightViz executable.

The LightViz executable needs ParaView 5.0.0 or greater build with paraviewweb enabled installed on your computer.  The ParaView binaries have paraviewweb enabled, so you can use these rather than building ParaView yourself.  If the location of the pvpython executable is not in you PATH environment variable, you will need to add the `--paraview ROOT` flag with the path to the root of your ParaView installation (the root is two levels up from the pvpython executable so pvpython should be located at ROOT/bin/pvpython).

The next thing that LightViz expects is a data directory.  This will have subfolders that contain different datasets and an index.json file that describes the dataset to LightViz.  Specify the data directory with the `-d DATA_DIR` command line flag.

## TODO: Add directions about import data script after writing import data script

Run `LightViz --paraview ROOT -d DATA_DIR` and LightViz will open a web browser pointed at the locally served paraviewweb content.  If you want to suppress the automatic opening of the web browser, you can add the `-s` flag.
