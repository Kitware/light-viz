import React from 'react';
import TogglePanel from '../TogglePanel';

import { setForegroundColor, setBackgroundColor } from '../../client';

import style from 'LightVizStyle/ForegroundBackgroundWidget.mcss';

const colors = [
  {
    label: 'White',
    pvcolor: '1 1 1',
    pvbgcolor: '0 0 0',
    cssColor: [255, 255, 255],
    cssBGColor: [0, 0, 0],
  },
  {
    label: 'Red',
    pvcolor: '.8 .2 .2',
    pvbgcolor: '.3 .3 .3',
    cssColor: [204, 51, 51],
    cssBGColor: [77, 77, 77],
  },
  {
    label: 'Green',
    pvcolor: '.2 .8 .2',
    pvbgcolor: '.4 .2 .2',
    cssColor: [51, 204, 51],
    cssBGColor: [102, 51, 51],
  },
];

export default React.createClass({
  displayName: 'ForegroundBackground',

  propTypes: {
    className: React.PropTypes.string,
    freePanels: React.PropTypes.array,
    location: React.PropTypes.object,
  },

  getDefaultProps() {
    return {};
  },

  getInitialState() {
    return {
      foreground: [255, 255, 255],
      background: [0, 0, 0],
      activeIndex: 0,
    };
  },

  updateForeground(e) {
    const idx = e.target.dataset.index;
    const scheme = colors[idx];
    setForegroundColor(scheme.pvcolor);
    setBackgroundColor(scheme.pvbgcolor);
    this.setState({
      foreground: scheme.cssColor,
      activeIndex: idx,
      background: scheme.cssBGColor,
    });
  },

  render() {
    const fg = this.state.foreground.join(',');
    const bg = this.state.background.join(',');
    const grad = `radial-gradient(rgb(${fg}) 30%, rgb(${bg}) 45%)`;
    return (
      <div>
        <TogglePanel
          anchor={['bottom', 'right']}
          className={this.props.className}
          divStyle={{ background: grad }}
          independentVisibilityPanels={this.props.freePanels}
          location={this.props.location}
          position={['top-shift', 'right']}
          size={{ button: ['2em', '2em'], panel: [null] }}
          panelId="fgbg"
        >
          <div className={style.contents}>
            {colors.map((c, idx) => {
              const myfg = c.cssColor.join(',');
              const mybg = c.cssBGColor.join(',');
              const mygradient = `radial-gradient(rgb(${myfg}) 30%, rgb(${mybg}) 45%)`;
              return (
                <div
                  className={style.option}
                  key={c.label}
                  style={{ background: mygradient }}
                  data-index={idx}
                  onClick={this.updateForeground}
                />
              );
            }, this)}
          </div>
        </TogglePanel>
      </div>
    );
  },
});
