import Clip from '../panels/Clip';
import Contour from '../panels/Contour';
import Dataset from '../panels/Dataset';
import MultiSlice from '../panels/MultiSlice';
import Slice from '../panels/Slice';
import Streamline from '../panels/Streamline';
import Volume from '../panels/Volume';
import Threshold from '../panels/Threshold';

import ClipImage from '../../svg/Clip.svg';
import ContourImage from '../../svg/Contour.svg';
import DatasetImage from '../../svg/DataSet.svg';
import MultiSliceImage from '../../svg/SliceParallel.svg';
import SliceImage from '../../svg/SliceOrthogonal.svg';
import StreamlineImage from '../../svg/StreamLines.svg';
import VolumeImage from '../../svg/Volume.svg';
import ThresholdImage from '../../svg/Threshold.svg';

export default [
  {
    name: 'dataset',
    icon: DatasetImage,
    component: Dataset,
  },
  {
    name: 'clip',
    icon: ClipImage,
    component: Clip,
  },
  {
    name: 'contour',
    icon: ContourImage,
    component: Contour,
  },
  {
    name: 'slice',
    icon: SliceImage,
    component: Slice,
  },
  {
    name: 'mslice',
    icon: MultiSliceImage,
    component: MultiSlice,
  },
  {
    name: 'streamline',
    icon: StreamlineImage,
    component: Streamline,
  },
  {
    name: 'volume',
    icon: VolumeImage,
    component: Volume,
  },
  {
    name: 'threshold',
    icon: ThresholdImage,
    component: Threshold,
  },
];
