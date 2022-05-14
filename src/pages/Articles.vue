<template>
  <n-space justify="left" style="margin-bottom: 15px" class="header">
    <n-grid x-gap="20" :cols="2">
      <n-gi>
        <n-input
          placeholder="搜索关键字"
          v-model:value="keyword"
          clearable
          @clear="clearKeyword"
          @keydown.enter="filterArticle"
        ></n-input>
      </n-gi>
      <n-gi>
        <n-date-picker
          start-placeholder="选择开始日期"
          end-placeholder="选择结束日期"
          type="datetimerange"
          clearable
          v-model:value="dateRange"
          :default-time="['00:00:00', '23:59:59']"
          @update:value="filterArticle"
        />
      </n-gi>
    </n-grid>
  </n-space>
  <div class="article-list">
    <n-data-table
      :columns="columns"
      :data="articleList"
      :single-line="false"
      :scroll-x="1700"
    />
    <n-space :style="{ marginTop: '10px' }" justify="left">
      <n-pagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :page-count="pageCount"
        show-size-picker
        :page-sizes="[5, 10, 15, 20]"
        @update:page="updatePage"
        @update:page-size="updatePageSize"
      />
    </n-space>
  </div>
  <n-modal
    class="detail-card"
    v-model:show="showModal"
    preset="card"
    style="max-width: 1200px"
    title="文章详情"
    size="huge"
    :bordered="false"
  >
    <h1 class="detail-title">{{ detailData.title }}</h1>
    <div class="detail-info-block">
      <div class="avatar">
        <n-avatar round size="medium" :src="detailData.author.avatar">{{
          detailData.author.username.substr(0, 1).toUpperCase()
        }}</n-avatar>
      </div>
      <div class="author-info-box">
        <div class="author-name">{{ detailData.author.username }}</div>
        <div class="meta-box">
          <time :datetime="detailData.create_at">{{
            handleDetailTime(detailData.create_at)
          }}</time>
        </div>
      </div>
    </div>
    <div class="detail-content markdown-body" v-html="detailData.content"></div>
  </n-modal>
</template>

<script setup>
import { onMounted, ref, h } from "vue"
import { getArticles, delArticle, updateArticleStatus } from "@/api/index.js"
import { NTag, NButton, NSwitch } from "naive-ui"
import { dateToString, handleDetailTime } from "@/utils/tool.js"
import { useRouter } from "vue-router"
const router = useRouter()
// 文章列表
let articleList = ref([])
const createColumns = ({ onDetail, onUpdata, onDelete }) => {
  return [
    {
      title: "标题",
      key: "title",
      mavWidth: 350,
      ellipsis: true,
    },
    {
      title: "摘要",
      key: "description",
    },
    {
      title: "标签",
      key: "tag.name",
      render (row) {
        return h(
          NTag,
          {
            style: {
              marginRight: "6px",
            },
            type: "info",
          },
          {
            default: () => row.tag.name,
          }
        )
      },
    },
    {
      title: "作者",
      key: "author.username",
    },
    {
      title: "创建日期",
      key: "create_at",
      sorter: {
        compare: (a, b) => new Date(a.create_at) - new Date(b.create_at),
        multiple: 1,
      },
      render (row) {
        return dateToString(row.create_at)
      },
    },
    {
      title: "最近更新日期",
      key: "update_at",
      sorter: {
        compare: (a, b) => new Date(a.update_at) - new Date(b.update_at),
        multiple: 2,
      },
      render (row) {
        return dateToString(row.update_at)
      },
    },
    {
      title: "文章状态",
      key: "status",
      fixed: "right",
      width: 100,
      render (row, index) {
        return h(
          NSwitch,
          {
            value: row.off === false,
            onUpdateValue: (value) => changeArticleStatus(row, value),
          },
          {
            unchecked: () => '下架',
            checked: () => '上架'
          }
        )
      }
    },
    {
      title: "操作",
      key: "actions",
      fixed: "right",
      width: 177,
      render (row, index) {
        return [
          h(
            NButton,
            {
              onClick: () => onDetail(row),
              type: "primary",
              size: "small",
              style: {
                marginRight: "3px",
              },
            },
            {
              default: () => "详情",
            }
          ),
          h(
            NButton,
            {
              onClick: () => onUpdata(row, index),
              type: "info",
              size: "small",
              style: {
                marginRight: "3px",
              },
            },
            {
              default: () => "修改",
            }
          ),
          h(
            NButton,
            {
              onClick: () => onDelete(row, index),
              type: "warning",
              size: "small",
              style: {
                marginRight: "3px",
              },
            },
            {
              default: () => "删除",
            }
          ),
        ]
      },
    },
  ]
}
const onDetail = function (row) {
  detailData.value = row
  showModal.value = true
}
const onUpdata = function (row) {
  router.push({
    name: "ArticleUpdata",
    params: { id: row._id },
    query: { mode: 1 },
  })
}
const onDelete = async function (row, index) {
  window.$dialog.warning({
    title: "确认删除",
    content: "请确认是否删除这条文章",
    positiveText: "删除",
    negativeText: "不确定",
    onPositiveClick: async () => {
      let result = await delArticle(row._id)
      if (result.code === "200") {
        filterArticle()
        window.$message.success("成功删除")
      }
    }
  })
}
const columns = createColumns({
  onDetail,
  onUpdata,
  onDelete,
})
// 分页
const page = ref(1)
const pageCount = ref(0)
const pageSize = ref(5)

// 获取文章数据
async function initArticleList (
  page = 1,
  limit = pageSize.value,
  startTime = 0,
  endTime = Date.now(),
  keyword
) {
  let result = await getArticles({
    page,
    startTime,
    endTime,
    keyword,
    limit,
  })
  articleList.value = result.data
  pageCount.value = result.pageCount
}

// page发生改变时调用
function updatePage () {
  const { startTime, endTime } = filterDate()
  initArticleList(
    page.value,
    pageSize.value,
    startTime,
    endTime,
    keyword.value
  )
}

function updatePageSize (size) {
  pageSize.value = size
  updatePage()
}

// 清除关键字
function clearKeyword () {
  keyword.value = ""
  filterArticle()
}

// 浏览文章详情
const showModal = ref(false)
const detailData = ref({})
const dateRange = ref(null)
const keyword = ref("")

// 获取时间关键字
function filterDate () {
  let startTime, endTime
  if (!dateRange.value) {
    startTime = 0
    endTime = Date.now()
  } else {
    startTime = dateRange.value[0]
    endTime = dateRange.value[1]
  }
  return { startTime, endTime }
}

// 根据日期或者关键字筛选文章数据
function filterArticle () {
  const { startTime, endTime } = filterDate()
  page.value = 1
  initArticleList(
    page.value,
    pageSize.value,
    startTime,
    endTime,
    keyword.value
  )
}

// 改变文章状态 下架或上架
function changeArticleStatus (row) {
  console.log(typeof row.off)
  updateArticleStatus(row._id, !row.off).then(res => {
    row.off = !row.off // 受控组件必须改变绑定的状态，UI才会变化
  })
}

onMounted(() => {
  initArticleList()
});
</script>

<style lang="scss" scoped>
.search-btn {
  cursor: pointer;
}
.detail-card {
  .detail-title {
    margin-bottom: 10px;
  }
  .detail-info-block {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .avatar {
      margin-right: 10px;
      .n-avatar {
        display: block;
      }
    }
    .author-info-box {
      .author-name {
        color: #000;
      }
    }
  }
}
</style>
