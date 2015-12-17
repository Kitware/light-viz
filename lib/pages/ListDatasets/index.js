import * as React from 'react';
import { Link }   from 'react-router';

export default React.createClass({

    displayName: 'ListDatasets',

    render() {
        return (<ul>
                    <li><Link to="/view/aaa/color:ccc/0">Dataset A</Link></li>
                    <li><Link to="/view/aab/color:ccc/0">Dataset B</Link></li>
                </ul>);
    }
});
