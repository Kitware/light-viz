title: ParaView LightViz
---

The ParaView LightViz is a Web application that aims to enable scientific visualization on the Web using a ParaView backend for data processing and rendering.

If you encounter any problems when using ParaView LightViz, you can find the solutions in [Troubleshooting](troubleshooting.html) or ask me on [GitHub](https://github.com/kitware/light-viz/issues) or [Mailing list](http://www.paraview.org/mailman/listinfo/paraview). If you can't find the answer, please report it on GitHub.

## What is ParaView LightViz?

ParaView LightViz is a standalone application that leverage ParaView capabilities on the backend to produce interactive visualizations over the Web. The LightViz application can be used locally as a command line tool or remotely when properly deployed.

The ParaViewWeb LightViz aims to provides a simple and customizable visualization application for your browser.

## Installation

It only takes few minutes to set up ParaView LightViz. If you encounter a problem and can't find the solution here, please [submit a GitHub issue](https://github.com/kitware/light-viz/issues).

ParaView LightViz require ParaView 5.2+ which can be downloaded [here](http://www.paraview.org/download/) which also bundle the ParaView LightViz application along.

Although using ParaView LightViz from the command line via [Node](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) could be easier for trying it out.

In order to install and execute the LightViz application on your system from your command line environment, just run the following commands assuming [Node](https://nodejs.org/en/) is available on your system:

```sh
$ npm install -g light-viz
$ LightViz

  Usage: LightViz [options]

  Options:

    -h, --help                   output usage information
    -V, --version                output the version number
    -p, --port [8080]            Start web server with given port
    -d, --data [directory]       Data directory to serve
    -s, --server-only            Do not open the web browser
    
    --paraview [path]            Provide the ParaView root path to use
    --offscreen                  Use flag to specify that ParaView should be used in Offscreen mode
    
    --data-analysis              Inspect data directory and compute metadata
    
    --config [path]              Provide a Lightviz config file to use
    --profile [profile]          Specify which profile from the config file to use
    
    --add-dataset [path]         Specify a dataset to add to the given data directory.  Requires the description and data flags
    --description [description]  Specify the description for the dataset being added
    --autoApply                  Optional for use with --add-dataset.  Specifies that apply/reset buttons are not needed with the dataset

```

Once you've added your dataset(s) to your LightViz data directory using the `--add-dataset` option, you will be able to open it/them with a command line similar to the one below. 

```sh
$ LightViz --paraview /Applications/paraview.app --data ~/LightViz-database
```

### Requirements

LightViz as opposed to other visualization tools requires to pre-process your data so it can make smarter choice via the user interface.

You can learn more how to get started with the [setup guide](setup.html).
Then once you have some dataset, you can learn more on how to use the application via our [user's guide](userguide.html).
