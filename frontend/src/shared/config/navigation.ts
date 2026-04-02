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
    icon: 'train',
    to: '/train',
    label: 'Train',
  },
  {
    icon: 'settings',
    to: '/settings',
    label: 'Settings',
  },
  {
    icon: 'logs',
    to: '/logs',
    label: 'Logs',
  },
];
