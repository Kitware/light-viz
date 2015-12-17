# LightViz urls

/                                    => List datasets
/:datasetId/:field/:timeIdx          => View dataset at time index with given field
/:datasetId/:field/:timeIdx/slice    => Slice control panel
/:datasetId/:field/:timeIdx/contour  => Contours control panel
/:datasetId/:field/:timeIdx/clip     => Clip control panel
/:datasetId/:field/:timeIdx/opacity  => Mesh opacity control panel

/:datasetId/:field/:timeIdx/bg       => Color management

## Options lists

=> :datasetId
 - ec56ft536 Unique identifier specified inside the json metadata

=> :field
 - color:ccc
 - field:Temperature
 - field:Pressure

=> :timeIdx
 - [0-9]+ for first timestep
 - _ for no timeserie available

## Query states

### Slice

 /.../slice?isModified=true&x=0.545&y=0.1:0.2:0.3&...

 - isModified: Need apply
 - x/y/z: Slices positions

### Contour

 /.../contour?values=0.3:0.4:0.5&isModified=true&contourBy=Temperature

 - isModified: Need apply
 - values: Scalars value to contour by
 - contourBy: Field to contour by

### Clip

 /.../clip?

 - isModified: Need apply
 - position: Clip positions
 - xIn/xOut
 - yIn/yOut
 - zIn/zOut

### Opacity

/.../opacity?value=99

- isModified: Need apply
- value: 0 to 100


======

How to define pipeline ordering???
=> ?pipeline=clip+contour+slice