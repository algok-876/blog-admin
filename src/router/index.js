import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Users from "../pages/Users.vue";
import Login from "../pages/Login.vue";
import Articles from "../pages/Articles.vue";
import Admins from "../pages/Admins.vue";
import Comments from "../pages/Comments.vue";
import Publish from "../pages/Publish.vue";
import Tags from "../pages/Tags.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
      children: [
        {
          // 管理员用户
          path: "admins",
          name: "Amdins",
          component: Admins,
        },
        {
          // 前台用户
          path: "users",
          name: "Users",
          component: Users,
        },
        {
          path: "articles",
          name: "Articles",
          component: Articles,
        },
        {
          path: "tags",
          name: "Tags",
          component: Tags,
        },
        {
          path: "comments",
          name: "Comments",
          component: Comments,
        },
        {
          path: "publish",
          name: "Publish",
          component: Publish,
        },
      ],
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
  ],
});

export default router;
