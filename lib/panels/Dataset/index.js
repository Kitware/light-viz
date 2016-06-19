import DoubleSliderElement from 'paraviewweb/src/React/Widgets/DoubleSliderWidget';
import React from 'react';
import AbstractPanel from '../AbstractPanel';

import {
  updateDatasetOpacity,
  updateBlockVisibility,
  getState,
  getBlockStructure,
}
from '../../client';

import style from 'LightVizStyle/DatasetPanel.mcss';

const blockVisibilityIcons = [style.blockIsHiddenIcon, style.blockIsShownIcon, style.blockIsPartiallyHiddenIcon];

export default React.createClass({

  displayName: 'DatasetPanel',

  propTypes: {
    dataset: React.PropTypes.object,
    hideAdditionalControls: React.PropTypes.bool,
  },

  getInitialState() {
    this.oldOpacity = 1;
    return {
      opacity: 1,
      blocks: [],
      collapsed: [true],
      showBlock: [true],
    };
  },

  componentWillMount() {
    getBlockStructure(this.updateBlockStructure);
  },

  componentDidMount() {
    getState('dataset', this, this.refs.modulePanel);
  },

  onApply() {
    updateDatasetOpacity(this.state.opacity);
    this.oldOpacity = this.state.opacity;
  },

  onReset() {
    this.setState({
      opacity: this.oldOpacity,
    });
  },

  getBlockVisibilityState(index) {
    if (this.state.showBlock[index]) {
      return 1;
    }
    let child = index === 0 ? 1 : this.blockParents.indexOf(index);
    while (child !== -1) {
      const childVisible = this.getBlockVisibilityState(child);
      if (childVisible > 0) {
        return 2;
      }
      child = this.blockParents.indexOf(index, child + 1);
    }
    return 0;
  },

  createBlocksTree(block, index) {
    const collapseIcon = block.children.length > 0 ? (
      this.state.collapsed[block.flatindex] ?
      style.blockIsCollapsedIcon : style.blockIsExpandedIcon) : style.blockHasNoChildrenIcon;
    const cName = this.state.collapsed[block.flatindex] ? style.childBlocksDivCollapsed
                                                        : style.childBlocksDiv;
    const visibilityState = this.getBlockVisibilityState(block.flatindex);
    return (
      <div className={cName} key={index}>
        <span className={style.blockSpan}>
          <label data-flatindex={block.flatindex} onClick={this.toggleCollapsed}>
            <i className={collapseIcon} />
            {block.name}
          </label>
          <span
            className={style.selectAction}
            data-flatindex={block.flatindex}
            onClick={this.toggleBlockShown}
          >
            <i
              className={blockVisibilityIcons[visibilityState]}
            />
          </span>
        </span>
        {block.children.length > 0 ? block.children.map(this.createBlocksTree) : null}
      </div>
    );
  },

  needsApply() {
    return this.state.opacity === this.oldOpacity;
  },

  updateState(newState) {
    this.setState({
      opacity: newState.opacity,
    });
  },

  updateOpacity(name, value) {
    this.setState({
      opacity: value,
    });
    if (this.props.dataset.autoApply) {
      updateDatasetOpacity(value);
    }
  },

  updateBlockStructure(structure) {
    const showBlock = [];
    const collapsed = [];
    const parentBlock = [];
    if (structure.length > 0) {
      let last = structure[structure.length - 1];
      while (last.children.length > 0) {
        last = last.children[last.children.length - 1];
      }
      for (let i = 0; i <= last.flatindex; i += 1) {
        collapsed.push(true);
        showBlock.push(true);
        parentBlock.push(0);
      }
      const toProcess = [{
        flatindex: 0,
        children: structure,
      }];
      while (toProcess.length > 0) {
        const b = toProcess.pop();
        for (let i = 0; i < b.children.length; ++i) {
          parentBlock[b.children[i].flatindex] = b.flatindex;
          if (b.children[i].children.length > 0) {
            toProcess.push(b.children[i]);
          }
        }
      }
    }
    this.blockParents = parentBlock;
    this.setState({
      blocks: structure,
      collapsed,
      showBlock,
    });
  },

  toggleCollapsed(e) {
    let container = e.target;
    while (container.dataset.flatindex === undefined) {
      container = container.parentNode;
    }
    const index = container.dataset.flatindex;
    const collapsed = [];
    for (let i = 0; i < this.state.collapsed.length; ++i) {
      collapsed.push(this.state.collapsed[i]);
    }
    collapsed[index] = !collapsed[index];
    this.setState({
      collapsed,
    });
  },

  recursiveSetVisibility(visible, index, visibility) {
    if (visible[index] === visibility) {
      return;
    }
    visible[index] = visibility;
    let child = index === 0 ? 1 : this.blockParents.indexOf(index);
    while (child !== -1) {
      this.recursiveSetVisibility(visible, child, visibility);
      child = this.blockParents.indexOf(index, child + 1);
    }
  },

  toggleBlockShown(e) {
    let container = e.target;
    while (container.dataset.flatindex === undefined) {
      container = container.parentNode;
    }
    const index = parseInt(container.dataset.flatindex, 10);
    const showBlock = [];
    for (let i = 0; i < this.state.showBlock.length; ++i) {
      showBlock.push(this.state.showBlock[i]);
    }
    const shown = showBlock[index];
    // Handle the block and its children's visibility
    this.recursiveSetVisibility(showBlock, index, !shown);

    // Handle the blocks parents' visibility
    if (shown) {
      // If hiding the block, hide its direct parents (but their
      // other children may still be shown).
      let idx = this.blockParents[index];
      while (shown && showBlock[idx]) {
        showBlock[idx] = false;
        idx = this.blockParents[idx];
      }
    } else {
      // If showing the block and all other children of the same
      // parent are shown, mark the parent as shown.
      let pidx = this.blockParents[index]; // parent index
      let showParent = true;
      while (showParent && !showBlock[pidx]) {
        let idx = pidx === 0 ? 1 : this.blockParents.indexOf(pidx);
        while (idx !== -1) {
          showParent = showParent && showBlock[idx];
          idx = this.blockParents.indexOf(pidx, idx + 1);
        }
        if (showParent) {
          showBlock[pidx] = true;
          pidx = pidx === 0 ? -1 : this.blockParents[pidx];
          if (pidx === -1) {
            showParent = false;
          }
        }
      }
    }

    this.setState({
      showBlock,
    });
    const blocks = [];
    for (let i = 0; i < showBlock.length; ++i) {
      if (showBlock[i]) {
        blocks.push(i);
      }
    }
    updateBlockVisibility(blocks);
  },

  render() {
    return (
      <AbstractPanel
        ref="modulePanel"
        name="dataset"
        dataset={this.props.dataset}
        hideAllButVisibility={this.props.hideAdditionalControls}
        hideInputSelection
        moduleName="Dataset"
        onApply={this.onApply}
        onReset={this.onReset}
        needsApply={this.state.opacity !== this.oldOpacity}
        enabledDefault
      >
        <div className={style.contents}>
          <i className={style.opacityIcon} />
          <DoubleSliderElement
            min="0"
            max="1"
            value={this.state.opacity}
            onChange={this.updateOpacity}
          />
        </div>
        <div
          style={{ marginLeft: '-5px' }}
          className={this.state.collapsed[0] ? style.childBlocksDivCollapsed
                                             : style.childBlocksDiv}
        >
          <span className={style.blockSpan}>
            <label data-flatindex={0} onClick={this.toggleCollapsed}>
              <i
                className={this.state.collapsed[0] ? style.blockIsCollapsedIcon :
                                                     style.blockIsExpandedIcon}
              />
              Blocks
            </label>
            <span
              className={style.selectAction}
              data-flatindex={0}
              onClick={this.toggleBlockShown}
            >
              <i
                className={blockVisibilityIcons[this.getBlockVisibilityState(0)]}
              />
            </span>
          </span>
          {
            this.state.blocks.map(this.createBlocksTree)
          }
        </div>
      </AbstractPanel>
    );
  },
});
