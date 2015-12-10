## LightViz ##

### Goal ###

Provide a tailored user interface for Scientific Visualization using ParaViewWeb as backend.

## Installation

```
$ npm install -g light-viz
```

After installing the package you will get one executable **LightViz** with
the following set of options.

```
$ LightViz

  Usage: LightViz [options]

  Options:

    -h, --help                output usage information
    -V, --version             output the version number
    -p, --port [3000]         Start web server with given port
    -d, --data [directory]    Data directory to serve
    -s, --server-only         Do not open the web browser

    --paraview [path]         Provide the ParaView root path to use

    --data-analysis           Inspect data directory and compute metadata
```

## Development

```sh
$ git clone https://github.com/Kitware/tonic.git
$ cd tonic
$ npm install
$ cd tonic-applications/light-viz
```

## Documentation

See the [documentation](https://kitware.github.io/light-viz) for a
getting started guide, advanced documentation, and API descriptions.

#### Licensing

**light-viz** aka LightViz is licensed under [BSD Clause 3](LICENSE).

#### Getting Involved

Fork our repository and do great things. At [Kitware](http://www.kitware.com),
we've been contributing to open-source software for 15 years and counting, and
want to make **arctic-viewer** useful to as many people as possible.
