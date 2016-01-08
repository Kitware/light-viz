import Clip     from '../panels/Clip';
import Contour  from '../panels/Contour';
import Dataset  from '../panels/Dataset';
import Slice    from '../panels/Slice';
import MultiSlice    from '../panels/MultiSlice';

export default [
    { name: 'dataset',  icon: require('./dataset.png'), component: Dataset },
    { name: 'clip',     icon: require('./clip.png'),    component: Clip },
    { name: 'contour',  icon: require('./contour.png'), component: Contour },
    { name: 'slice',    icon: require('./oslice.png'),  component: Slice },
    { name: 'mslice',    icon: require('./pslice.png'),  component: MultiSlice },
];
