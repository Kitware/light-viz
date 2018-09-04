export default {
  name: 'Slice',
  icon: 'texture',
  label: 'Slice',
  showInMenu(selectedSourceIds) {
    return selectedSourceIds.length === 1;
  },
};
