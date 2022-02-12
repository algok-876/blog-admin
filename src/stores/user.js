import { defineStore } from "pinia";
import service from "@/api/service";

export const useUserStore = defineStore({
  id: "user",
  state: () => ({
    isLogin: false,
    token: "",
    userInfo: null,
  }),
  getters: {},
  actions: {
    async getUserInfo() {
      const userInfo = await service.get("/user/info");
      this.userInfo = userInfo.data;
      console.log(this.userInfo)
      return Promise.resolve(userInfo);
    },
    async login(email, password) {
      const loginResult = await service.post("/user/login", {
        email,
        password,
      });
      if (loginResult.code == 200) {
        this.isLogin = true;
        this.token = loginResult.token;
        localStorage.setItem("token", this.token);
        await this.getUserInfo();
        return Promise.resolve(loginResult);
      } else {
        return Promise.reject();
      }
    },
    // 自动登录
    async autoLogin() {
      const userInfo = await this.getUserInfo();
      if (userInfo.code === 200) {
        // 能拿到用户信息表示上次已经登陆过了
        this.userInfo = userInfo.data;
        this.isLogin = true;
        this.token = localStorage.getItem("token");
        return Promise.resolve(true);
      }
    },
    // 用户退出登录
    logout() {
      this.userInfo = null;
      this.token = "";
      localStorage.removeItem("token");
      this.isLogin = false;
      window.$message.success("退出登录");
      return Promise.resolve();
    },
  },
});
