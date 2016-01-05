import React            from 'react';
import ReactDOM         from 'react-dom';
import { Link }         from 'react-router';
import lightVizClient   from '../../client';

export default React.createClass({

    displayName: 'ThumbnailList',

    componentDidUpdate() {
        /* Load thumbnails */
        const images = ReactDOM.findDOMNode(this).querySelectorAll('img');
        let count = images.length;
        while(count--) {
            lightVizClient.addThumbnail(images[count]);
        }
    },

    render() {
        return (<div className="ThumbnailList">
                  { this.props.list.map(function(ds) {
                    return <Link to={"/view/" + ds.name} >
                             <img className="ThumbnailList_Thumbnail" data-name={ds.name}/>
                             <div className="ThumbnailList_Legend">
                               <span className="ThumbnailList__Name">{ds.name}</span> ({ ds.size })
                             </div>
                           </Link>;
                  })}
                </div>);
    },
});
