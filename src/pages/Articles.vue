<template>
  <n-space justify="end" style="margin-bottom: 15px" class="header">
    <n-date-picker
      type="datetimerange"
      clearable
      :default-time="['00:00:00', '23:59:59']"
      @update:value="changeDate"
    />
  </n-space>
  <div class="article-list">
    <n-data-table :columns="columns" :data="articleList" :bordered="false" />
    <n-space :style="{ marginTop: '10px' }" justify="center">
      <n-pagination
        v-model:page="page"
        :page-count="pageCount"
        @update:page="changePage"
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
    <div class="detail-content" v-html="detailData.content"></div>
  </n-modal>
</template>

<script setup>
import { onMounted, ref, h } from "vue";
import { getArticles, delArticle } from "@/api/index.js";
import { NTag, NButton } from "naive-ui";
import { dateToString, handleDetailTime } from "@/utils/tool.js";
import { useRouter } from "vue-router";
const router = useRouter();
let articleList = ref([]);
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
      render(row) {
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
        );
      },
    },
    {
      title: "作者",
      key: "author.username",
    },
    {
      title: "日期",
      key: "update_at",
      render(row) {
        return dateToString(row.update_at);
      },
    },
    {
      title: "操作",
      key: "actions",
      render(row, index) {
        return [
          h(
            NButton,
            {
              onClick: () => onDetail(row),
              type: "primary",
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
              type: "error",
              style: {
                marginRight: "3px",
              },
            },
            {
              default: () => "删除",
            }
          ),
        ];
      },
    },
  ];
};
const onDetail = function (row) {
  detailData.value = row;
  showModal.value = true;
};
const onUpdata = function (row) {
  router.push({ name: "articleUpdata", params: { id: row._id } });
};
const onDelete = async function (row, index) {
  window.$dialog.warning({
    title: "警告",
    content: "你确定？",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      let result = await delArticle(row._id);
      if (result.code === "200") {
        articleList.value.splice(index, 1);
        window.$message.success("成功删除");
      }
    },
    onNegativeClick: () => {
      window.$message.error("已取消");
    },
  });
};
const columns = createColumns({
  onDetail,
  onUpdata,
  onDelete,
});
// 分页
const page = ref(1);
const pageCount = ref(0);
function changePage(nowPage) {
  initArticleList(nowPage, stateTime.value, endTime.value);
}
async function initArticleList(page = 1, stateTime = 0, endTime = Date.now()) {
  let result = await getArticles(page, stateTime, endTime);
  articleList.value = result.data;
  pageCount.value = result.pageCount;
}
// 浏览新闻详情
const showModal = ref(false);
const detailData = ref({});
const stateTime = ref(0);
const endTime = ref(Date.now());
// 筛选时间内容
function changeDate(time) {
  if (time) {
    stateTime.value = time[0];
    endTime.value = time[1];
  } else {
    stateTime.value = 0;
    endTime.value = Date.now();
  }
  page.value = 1;
  initArticleList(1, stateTime.value, endTime.value);
}
onMounted(() => {
  initArticleList();
});
</script>

<style  lang="scss" scoped>
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