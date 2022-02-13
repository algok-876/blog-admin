import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Users from "@/pages/Users.vue";
import Login from "@/pages/Login.vue";
import Articles from "@/pages/Articles.vue";
import ArticleUpdata from "@/pages/ArticleUpdata.vue";
import Admins from "@/pages/Admins.vue";
import Comments from "@/pages/Comments.vue";
import Publish from "@/pages/Publish.vue";
import Tags from "@/pages/Tags.vue";
import store from "@/stores";
import { getTitle } from "@/utils/auth.js";
import { useUserStore } from "@/stores/user";
const userStore = useUserStore(store);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
      redirect: {
        name: "Amdins",
      },
      children: [
        {
          // 管理员用户
          path: "admins",
          name: "Amdins",
          component: Admins,
          meta: {
            title: "管理员用户",
          },
        },
        {
          // 前台用户
          path: "users",
          name: "Users",
          component: Users,
          meta: {
            title: "前台用户",
          },
        },
        {
          path: "articles",
          name: "Articles",
          component: Articles,
          meta: {
            title: "文章管理",
          },
        },
        {
          path: "article/:id",
          name: "articleUpdata",
          component: ArticleUpdata,
          meta: {
            title: "修改文章",
          },
        },
        {
          path: "tags",
          name: "Tags",
          component: Tags,
          meta: {
            title: "标签管理",
          },
        },
        {
          path: "comments",
          name: "Comments",
          component: Comments,
          meta: {
            title: "评论管理",
          },
        },
        {
          path: "publish",
          name: "Publish",
          component: Publish,
          meta: {
            title: "发布文章",
          },
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

let autoLogined = false;

router.beforeEach(async (to, from, next) => {
  // 尝试自动登录
  if (!autoLogined) {
    try {
      const res = await userStore.autoLogin();
      if (res) {
        // 自动登录成功
        window.$message.success("自动登录成功");
      }
    } catch (err) {
      console.log("自动登录失败", err);
    } finally {
      // 已经尝试过自动登录了
      autoLogined = true;
    }
  }
  if (to.name !== "Login" && !userStore.$state.isLogin) {
    // 还未登录
    next({
      name: "Login",
      query: {
        redirect: to.fullPath,
      },
    });
    window.$message.warning("您还未登录");
    return;
  }
  if (to.name === "Login" && userStore.$state.isLogin) {
    // 已经登录过了
    next("/");
    window.$message.warning("您已经登录过了");
    return;
  }

  // 修改网站标题
  let title = to.meta.title ? `${to.meta.title} - ${getTitle()}` : getTitle();
  document.title = title;
  next();
});

export default router;
