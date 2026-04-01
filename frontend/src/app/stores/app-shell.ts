import { defineStore } from 'pinia';

export const useAppShellStore = defineStore('app-shell', {
  state: () => ({
    mobileNavigationOpen: false,
  }),
  actions: {
    closeNavigation() {
      this.mobileNavigationOpen = false;
    },
    openNavigation() {
      this.mobileNavigationOpen = true;
    },
    toggleNavigation() {
      this.mobileNavigationOpen = !this.mobileNavigationOpen;
    },
  },
});