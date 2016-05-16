import Clip from '../panels/Clip';
import Contour from '../panels/Contour';
import Dataset from '../panels/Dataset';
import Slice from '../panels/Slice';
import MultiSlice from '../panels/MultiSlice';
import Streamline from '../panels/Streamline';
import Volume from '../panels/Volume';

import ClipImage from './clip.png';
import ContourImage from './contour.png';
import DatasetImage from './dataset.png';
import SliceImage from './oslice.png';
import MultiSliceImage from './pslice.png';
import StreamlineImage from './streamline.png';
import VolumeImage from './volume.png';

export default [{
  name: 'dataset',
  icon: DatasetImage,
  component: Dataset,
}, {
  name: 'clip',
  icon: ClipImage,
  component: Clip,
}, {
  name: 'contour',
  icon: ContourImage,
  component: Contour,
}, {
  name: 'slice',
  icon: SliceImage,
  component: Slice,
}, {
  name: 'mslice',
  icon: MultiSliceImage,
  component: MultiSlice,
}, {
  name: 'streamline',
  icon: StreamlineImage,
  component: Streamline,
}, {
  name: 'volume',
  icon: VolumeImage,
  component: Volume,
}];
