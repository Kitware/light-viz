## LightViz Dependency Status

### Introduction

This page is a helper to the developers to see which dependencies are out of date

### Dependencies  [![Dependency Status](https://img.shields.io/david/kitware/light-viz.svg)](https://david-dm.org/kitware/light-viz)

Package name  | NPM Version                                           | Version
------------- | ----------------------------------------------------- | ----------
commander     | ![npm version](https://badge.fury.io/js/commander.svg)| 2.9.0
open          | ![npm version](https://badge.fury.io/js/open.svg)     | 0.0.5
shelljs       | ![npm version](https://badge.fury.io/js/shelljs.svg)  | 0.7.0

### Dev Dependencies [![devDependency Status](https://david-dm.org/kitware/light-viz/dev-status.svg)](https://david-dm.org/kitware/light-viz#info=devDependencies)

Package name | NPM Version                                               | Version
-------------| --------------------------------------------------------- | ----------
paraviewweb  | ![npm version](https://badge.fury.io/js/paraviewweb.svg)  | 1.13.0
font-awesome | ![npm version](https://badge.fury.io/js/font-awesome.svg) | 4.6.3
mout         | ![npm version](https://badge.fury.io/js/mout.svg)         | 1.0.0
normalize.css| ![npm version](https://badge.fury.io/js/normalize.css.svg)| 4.1.1
react        | ![npm version](https://badge.fury.io/js/react.svg)        | 15.2.1
react-dom    | ![npm version](https://badge.fury.io/js/react-dom.svg)    | 15.2.1
react-router | ![npm version](https://badge.fury.io/js/react-router.svg) | 2.6.0
history      | ![npm version](https://badge.fury.io/js/history.svg)      | 2.1.2
ws*          | ![npm version](https://badge.fury.io/js/ws.svg)           | 0.8.1
gl-matrix    | ![npm version](https://badge.fury.io/js/gl-matrix.svg)    | 2.3.2
hammerjs     | ![npm version](https://badge.fury.io/js/hammerjs.svg)     | 2.0.6
monologue.js | ![npm version](https://badge.fury.io/js/monologue.js.svg) | 0.3.5
kw-web-suite | ![npm version](https://badge.fury.io/js/kw-web-suite.svg) | 2.0.1
kw-doc       | ![npm version](https://badge.fury.io/js/kw-doc.svg)       | 1.0.13

*: ws 0.8.1 has known security issues, but only when used on the server side.  We are using client-side websockets via autobahn.  Client-side websockets were removed in ws 1.0.0, so we have to pin to this older version.
