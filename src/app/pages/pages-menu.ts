import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Issue Table',
    icon: 'layers-outline',
    link: '/pages/tables/issue',
  },
  {
    title: 'Create Issue',
    icon: 'plus-outline',
    link: '/pages/tables/create-issue',
  },
  {
    title: 'Report Issue',
    icon: 'activity-outline',
    link: '/pages/tables/report',
  },
  {
    title: 'SETTINGS',
    group: true,
  },
  {
    title: 'System Config',
    icon: 'settings-outline',
    link: '/pages/tables/config',
  }
];
