export interface NavigationItem {
  icon: string;
  label: string;
  to: string;
}

export const navigationItems: NavigationItem[] = [
  {
    icon: 'image',
    to: '/matches',
    label: 'Matches',
  },
  {
    icon: 'camera',
    to: '/cameras',
    label: 'Cameras',
  },
  {
    icon: 'settings',
    to: '/settings',
    label: 'Settings',
  },
];