import React from 'react';
import TogglePanel from '../TogglePanel';

import style from 'LightVizStyle/ColorMapWidget.mcss';

const colorMaps = [ { name: 'Cool to Warm', label: 'Cool to Warm', icon: require('./coolToWarm.png') },
                    { name: 'Viridis (matplotlib)', label: 'Viridis', icon: require('./viridis.png')},
                    { name: 'Black-Body Radiation', label: 'Blackbody', icon: require('./blackbody.png')} ];

export default React.createClass({

    displayName: 'ColorMap',

    propTypes: {
        location: React.PropTypes.object,
        onChange: React.PropTypes.func,
    },

    getDefaultProps() {
        return {
            onChange: null,
        };
    },

    getInitialState() {
      return {
          value: colorMaps[0],
      };
    },

    updateColorMap(event) {
        var colorMap, i;
        for (i = 0; i < colorMaps.length; ++i) {
            if (colorMaps[i].label === event.target.alt) {
                colorMap = colorMaps[i];
            }
        }
        if(this.props.onChange) {
            this.props.onChange(colorMap.name);
        }
        this.setState({value: colorMap});
    },

    render() {
        return <TogglePanel anchor={['bottom', 'right']}
                             icon={ this.state.value.icon }
                             independentVisibilityPanels={['time','colormap']}
                             location={this.props.location}
                             position={['top-shift','right']}
                             size={{'button': ['4em', '2em'], 'panel': [null]}}
                             panelId='colormap'>
                    <div className={style.panel}>
                    {
                      colorMaps.map(cmap => {
                        return <div className={style.line} key={ cmap.name }>
                                 <img className={style.image}
                                      src={ cmap.icon }
                                      onClick={ this.updateColorMap }
                                      alt={ cmap.label }/>
                               </div>;
                      })
                    }
                    </div>
               </TogglePanel>;
    },
});
