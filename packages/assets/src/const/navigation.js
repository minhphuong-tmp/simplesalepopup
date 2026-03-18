export const navigationLinks = [
  {
    label: 'Settings',
    destination: '/settings'
  }
].map(item => ({
  ...item,
  destination: '/embed' + item.destination
}));

