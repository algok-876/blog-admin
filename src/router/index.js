import { createRouter, createWebHistory } from "vue-router";
import Users from "@/pages/Users.vue";
import Login from "@/pages/Login.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Articles from "@/pages/Articles.vue";
import Admins from "@/pages/Admins.vue";
import Comments from "@/pages/Comments.vue";
import Publish from "@/pages/Publish.vue";
import Tags from "@/pages/Tags.vue";
import Layout from "@/pages/Layout.vue";
import Roles from "@/pages/Roles.vue";
import store from "@/stores";
import { getTitle } from "@/utils/auth.js";
import { useUserStore } from "@/stores/user";
import { hasRole } from "@/utils/auth";
const userStore = useUserStore(store);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Layout",
      component: Layout,
      redirect: {
        name: "Dashboard",
      },
      children: [
        {
          // 管理员用户
          path: "admins",
          name: "Amdins",
          component: Admins,
          meta: {
            title: "管理员用户",
            roles: ["super_admin"],
          },
        },
        {
          // 前台用户
          path: "users",
          name: "Users",
          component: Users,
          meta: {
            title: "前台用户",
            roles: ["super_admin"],
          },
        },
        {
          // 仪表盘
          path: "dashboard",
          name: "Dashboard",
          component: Dashboard,
          meta: {
            title: "仪表盘"
          },
        },
        {
          path: "articles",
          name: "Articles",
          component: Articles,
          meta: {
            title: "文章管理",
            roles: ["super_admin", "editor", "auditor"],
          },
        },
        {
          path: "article/update/:id",
          name: "ArticleUpdata",
          component: Publish,
          meta: {
            title: "修改文章信息",
            roles: ["super_admin", "editor"],
          },
        },
        {
          path: "tags",
          name: "Tags",
          component: Tags,
          meta: {
            title: "标签管理",
            roles: ["super_admin", "editor"],
          },
        },
        {
          path: "comments",
          name: "Comments",
          component: Comments,
          meta: {
            title: "评论管理",
            roles: ["super_admin", "editor", "auditor"],
          },
        },
        {
          path: "publish",
          name: "Publish",
          component: Publish,
          meta: {
            title: "发布文章",
            roles: ["super_admin", "editor"],
          },
        },
        {
          path: "roles",
          name: "Roles",
          component: Roles,
          meta: {
            title: "角色管理",
            roles: ["super_admin"],
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
  if (to.name !== "Login" && !userStore.isLogin) {
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
  if (to.name === "Login" && userStore.isLogin) {
    // 已经登录过了
    next({
      name: from.name,
    });
    window.$message.warning("您已经登录过了");
    return;
  }

  if (userStore.isLogin && userStore.userInfo) {
    console.log(123);
    // 用户角色信息
    const userRoles = userStore.userInfo.roles;
    if (to.meta.roles && !hasRole(userRoles, to.meta.roles)) {
      // 用户不具备某一路由的访问权限
      next({
        name: from.name,
      });
      window.$message.warning("你没有访问此页面的权限");
      return;
    }
  }

  // 修改网站标题
  let title = to.meta.title ? `${to.meta.title} - ${getTitle()}` : getTitle();
  document.title = title;
  next();
});

export default router;
