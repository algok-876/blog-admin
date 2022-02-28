import { defineStore } from "pinia";
import service from "@/api/service";
import { updateUserInfo, updateUserAvatar } from '@/api'

export const useUserStore = defineStore({
  id: "user",
  state: () => ({
    isLogin: false,
    token: "",
    userInfo: null,
  }),
  getters: {},
  actions: {
    // 获取用户信息
    async getUserInfo() {
      const userInfo = await service.get("/user/info");
      this.userInfo = userInfo.data;
      console.log(this.userInfo);
      return Promise.resolve(userInfo);
    },
    // 用户登录
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
    // 用户修改用户名
    async updateUsername(username) {
      return new Promise(async (resolve, reject) => {
        try {
          const result = await updateUserInfo(username)
          this.userInfo.username = username
          resolve(result)
        } catch (err) {
          reject(err)
        }
      })
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
    // 用户更新头像
    async modifyAvatar(avatar) {
      const result = await updateUserAvatar(avatar)
      this.userInfo.avatar = result.data.url
      Promise.resolve(result)
    }
  },
});
