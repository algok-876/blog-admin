import { h } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BookOutline as BookIcon,
  BookmarksOutline,
  PeopleOutline,
  SendOutline,
  AtSharp,
  PersonCircleOutline,
  BarChart,
  FileTrayStackedOutline,
  BuildOutline,
  FileTrayFullOutline
} from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
function renderIcon (icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}
const menuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/dashboard'
        },
        { default: () => '仪表盘' }
      ),
    key: 'dashboard-manage',
    icon: renderIcon(BarChart)
  },
  {
    label: '用户管理',
    key: 'user-manage',
    icon: renderIcon(PeopleOutline),
    children: [
      {
        label: () =>
          h(
            RouterLink,
            {
              to: 'admins'
            },
            { default: () => '后台用户' }
          ),
        key: 'user-manage-1'
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: 'users'
            },
            { default: () => '前台用户' }
          ),
        key: 'user-manage-2'
      }
    ]
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/roles'
        },
        { default: () => '角色管理' }
      ),
    key: 'role-manage',
    icon: renderIcon(PersonCircleOutline)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/articles'
        },
        { default: () => '文章管理' }
      ),
    key: 'article-manage',
    icon: renderIcon(BookIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/tags'
        },
        { default: () => '标签管理' }
      ),
    key: 'tag-manage',
    icon: renderIcon(BookmarksOutline)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/category'
        },
        { default: () => '分类管理' }
      ),
    key: 'category-manage',
    icon: renderIcon(FileTrayFullOutline)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/publish'
        },
        { default: () => '发表文章' }
      ),
    key: 'publish-article',
    icon: renderIcon(SendOutline)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/drafts'
        },
        { default: () => '草稿箱' }
      ),
    key: 'drafts-acticle',
    icon: renderIcon(FileTrayStackedOutline)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/comments'
        },
        { default: () => '评论管理' }
      ),
    key: 'comment-manage',
    icon: renderIcon(AtSharp)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/site-about'
        },
        { default: () => '网站关于' }
      ),
    key: 'site-about',
    icon: renderIcon(BuildOutline)
  }
]

export default menuOptions
