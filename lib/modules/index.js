import Clip from '../panels/Clip';
import Contour from '../panels/Contour';
import Dataset from '../panels/Dataset';
import Slice from '../panels/Slice';
import MultiSlice from '../panels/MultiSlice';
import Streamline from '../panels/Streamline';
import Volume from '../panels/Volume';

export default [{
  name: 'dataset',
  icon: require('./dataset.png'),
  component: Dataset,
}, {
  name: 'clip',
  icon: require('./clip.png'),
  component: Clip,
}, {
  name: 'contour',
  icon: require('./contour.png'),
  component: Contour,
}, {
  name: 'slice',
  icon: require('./oslice.png'),
  component: Slice,
}, {
  name: 'mslice',
  icon: require('./pslice.png'),
  component: MultiSlice,
}, {
  name: 'streamline',
  icon: require('./streamline.png'),
  component: Streamline,
}, {
  name: 'volume',
  icon: require('./volume.png'),
  component: Volume,
}];
