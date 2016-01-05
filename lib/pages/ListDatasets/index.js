import React            from 'react';
import lightVizClient   from '../../client';
import ThumbnailList    from './ThumbnailList';

require('./style.css')

export default React.createClass({

    displayName: 'ListDatasets',

    getInitialState() {
        return {
            datasets: [],
        };
    },

    componentDidMount() {
       this.refresh();
    },

    refresh() {
        lightVizClient.listDatasets( datasets => this.setState({ datasets }) );
    },

    render() {
        return (<div className="DatasetList">
                  <div className="DatasetList_TitleBar">
                    <div className="DatasetList__TitleLeft">
                      LightViz Datasets
                    </div>
                    <div className="DatasetList__TitleRight">
                      <i className="fa fa-refresh" onClick={ this.refresh }></i>
                    </div>
                  </div>
                  <div className="DatasetList_Content">
                    <ThumbnailList list={ this.state.datasets }/>
                  </div>
                </div>);
    },
});
