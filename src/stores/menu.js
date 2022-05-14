import { defineStore } from "pinia"

export const useMenuStore = defineStore({
  id: "menu",
  state: () => ({
    menuItemKey: 'dashboard-manage'
  }),
  actions: {
    setMenuItemKey (key) {
      this.menuItemKey = key
    }
  }
})
