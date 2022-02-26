import axios from "axios";
// import store from '../store'
import { getToken } from "../utils/auth";

const service = axios.create({
  baseURL: "http://localhost:3000/api/v1/admin",
  timeout: 5000,
});

service.interceptors.request.use(
  (config) => {
    // 获取token
    const token = getToken();
    if (token) {
      config.headers["authorization"] = "bearer " + token;
    }
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code != 200) {
      return Promise.reject(new Error(res.message || "Error"));
    } else {
      return res;
    }
  },
  (error) => {
    const {
      response: { data: res },
    } = error;
    // console.log("接口信息报错", error);
    // console.dir(error)
    if (res.code == 50346) {
      // 缺少权限
      window.$message.error("您缺少权限");
    } else {
      if (error.config.url !== '/user/info') {
        window.$message.error(res.message);
      }
    }
    return Promise.reject(error);
  }
);

export default service;
