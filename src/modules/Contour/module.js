export default {
  name: 'Contour',
  icon: 'fingerprint',
  label: 'Contour',
  showInMenu(selectedSourceIds) {
    // FIXME need pointData as well
    return selectedSourceIds.length === 1;
  },
};
