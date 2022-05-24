<template>
  <n-form :label-width="80" :rules="rules" ref="formRef" :model="articleInfo">
    <n-form-item>
      <div class="btn-area">
        <n-button-group>
          <n-button @click="handleValidateClick" type="primary" size="large">
            <n-space align="center">
              <n-icon size="20">
                <cloud-upload-outline />
              </n-icon>
              {{ btnText }}
            </n-space>
          </n-button>
          <n-button
            @click="saveToDrafts"
            type="warning"
            style="margin-right: 24px"
            v-if="!isDraftEdit && !isArticleEdit"
            size="large"
          >
            <n-space align="center">
              <n-icon size="20">
                <save-outline />
              </n-icon>
              存为草稿
            </n-space>
          </n-button>
          <n-button
            @click="updateDrafts"
            type="warning"
            style="margin-right: 24px"
            v-if="isDraftEdit"
            size="large"
          >
            <n-space align="center">
              <n-icon size="20">
                <save-outline />
              </n-icon>
              继续保存至草稿
            </n-space>
          </n-button>
          <n-button @click="resetForm" type="warning" size="large"
            >清空</n-button
          >
        </n-button-group>
        <div class="auto-save" v-show="lastSaveTime">
          <span>上次保存于 {{ lastSaveTime }}</span>
        </div>
      </div>
    </n-form-item>
    <n-grid x-gap="24" :cols="3">
      <n-gi :span="3">
        <n-form-item label="标题" path="title">
          <n-input
            v-model:value="articleInfo.title"
            placeholder="输入文章标题"
          ></n-input>
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="分类" path="category">
          <n-select
            v-model:value="articleInfo.category"
            :options="categoryOptions"
            placeholder="请选择分类"
          ></n-select>
        </n-form-item>
      </n-gi>
      <n-gi span="2">
        <n-form-item label="标签" path="tags">
          <n-select
            v-model:value="articleInfo.tags"
            multiple
            :options="tagOptions"
            placeholder="请选择标签"
          ></n-select>
        </n-form-item>
      </n-gi>
    </n-grid>
    <n-form-item label="摘要" path="description">
      <n-input
        v-model:value="articleInfo.description"
        type="textarea"
        placeholder="文章摘要或文章简介"
      />
    </n-form-item>
    <n-form-item label="内容" path="content">
      <mavonEditor
        class="md-editor"
        ref="editorRef"
        v-model="articleInfo.mdContent"
        @imgAdd="editorImgAdd"
        @imgDel="editorImgDel"
      ></mavonEditor>
    </n-form-item>
  </n-form>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
  computed,
  watch,
} from "vue"
import {
  SaveOutline,
  CloudUploadOutline
} from "@vicons/ionicons5"
// 获取接口数据的方法
import {
  getTags,
  getArticleDetail,
  updateArticle,
  createArticle,
  uploadEditorImg,
  deleteEditorImg,
  createArticleDraft, // 创建草稿
  getArticleDraftDetail, // 获取草稿详情
  updateArticleDraft, // 更新草稿
  delArticleDraft, // 删除草稿
  categoryList
} from "@/api/index"
import { extractMarkdownImages, compareUnusedImage } from "@/utils/tool"
import { storeToRefs } from "pinia"
import { useUserStore } from "@/stores/user"
import { useMessage } from "naive-ui"
import { useRoute, useRouter } from "vue-router"

// 路由对象
const route = useRoute()
const router = useRouter()

// 用户全局状态数据
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const message = useMessage()
const formRef = ref(null)
const editorRef = ref(null)
// 当前模式 1->修改文章  2->编辑草稿
const isPublish = ref(route.query.mode ? false : true)
const isArticleEdit = ref(route.query.mode == 1)
const isDraftEdit = ref(route.query.mode == 2)
let id = route.params.id // 当前文章或草稿 id
let userLeaving = true // 用户手动离开->true  通过编程导航离开->false

// 按钮文本
const btnText = computed(() => {
  if (isPublish.value) return "发布此文章"
  if (isArticleEdit.value) return "更新此文章"
  if (isDraftEdit.value) return "发布此草稿"
})

// 模式 参数变化时进行初始化
watch(
  () => route.query.mode, // 监听路由参数mode的变化
  (newVal, oldVal) => {
    // 自动保存
    if (userLeaving) saveAuto()
    newVal == 1 ? (isArticleEdit.value = true) : (isArticleEdit.value = false)
    newVal == 2 ? (isDraftEdit.value = true) : (isDraftEdit.value = false)
    newVal ? (isPublish.value = false) : (isPublish.value = true)
    resetForm()
    id = route.params.id
  }
)

async function editorImgAdd (pos, $file) {
  // 第一步.将图片上传到服务器.
  let formdata = new FormData()
  formdata.append("editor", $file)
  try {
    let res = await uploadEditorImg(formdata)
    editorRef.value.$img2Url(pos, res.data.url)
  } catch (error) {
    editorRef.value.$img2Url(pos, "")
    window.$message.error("上传失败")
  }
}
async function editorImgDel (filename) {
  if (isArticleEdit.value) return
  let res = await deleteEditorImg({ imgs: filename[0] })
  console.log(res)
  if (res.code === "200") {
    message.success("删除成功")
  }
}

// 本地文章数据
let articleInfo = reactive({
  title: "",
  mdContent: "",
  tags: [],
  category: "",
  description: "",
  content_img: "",
})

// 编辑器中的图片
let stateImgs = ref([])
let contentImgs = ref([])
const rules = {
  title: {
    required: true,
    message: "请输入标题",
    trigger: "blur",
  },
  mdContent: {
    required: true,
    message: "请输入内容",
    trigger: "blur",
  },
  tag_id: {
    required: true,
    message: "请选择标签",
    trigger: "blur",
  },
}

// 重置表单
function resetForm () {
  Object.keys(articleInfo).forEach((key) => (articleInfo[key] = ""))
  formRef.value.restoreValidation()
}

// 返回到文章列表页
function back () {
  userLeaving = false
  router.push({
    name: "Articles",
  })
}

// 处理表单提交
function handleValidateClick () {
  articleInfo.title = articleInfo.title.trim()
  articleInfo.mdContent = articleInfo.mdContent.trim()
  formRef.value.validate(async (errors) => {
    if (errors) return
    let res = null
    contentImgs.value = extractMarkdownImages(articleInfo.mdContent)
    if (contentImgs.value.length !== 0) {
      articleInfo.content_img = contentImgs.value.join(",")
    } else {
      articleInfo.content_img = ""
    }

    // 文章编辑模式下 调用修改文章信息接口
    if (isArticleEdit.value && articleInfo._id) {
      res = await updateArticle(id, {
        ...articleInfo,
        content: editorRef.value.d_render,
      })
      message.success("更新成功")
      back()
      return
    }

    // 自动保存已生效，当前编辑的是草稿，调用更新接口将草稿变成文章
    if ((isPublish.value || isDraftEdit.value) && articleInfo._id) {
      articleInfo.is_draft = false
      res = await updateArticleDraft(articleInfo._id, articleInfo)
      message.success('成功发布')
    } else {
      // 自动保存还未生效，直接新建一篇文章
      res = await createArticle({
        ...articleInfo,
        author_id: userInfo.value._id,
        content: editorRef.value.d_render,
      })
    }

    back()
    resetForm()
  })
}

// 获取文章标签列表
let tagOptions = ref([])
async function initTagOptions () {
  const tags = await getTags()
  tagOptions.value = tags.data.map(item => ({
    label: item.name,
    value: item._id,
  }))
}
// 获取分类列表数据
let categoryOptions = ref([])
async function initCategoryOptions () {
  const result = await categoryList()
  categoryOptions.value = result.data.map(item => ({
    label: item.name,
    value: item._id,
  }))
}

// 初始化表单
async function initForm () {
  if (isPublish.value) return
  const id = route.params.id
  let res = null
  res = await getArticleDetail(id)
  // 复制对应的字段
  Object.keys(res.data).forEach((key) => {
    articleInfo[key] = res.data[key]
  })
  articleInfo.tags = articleInfo.tags.map(v => v._id)
  articleInfo.category = articleInfo.category._id
  stateImgs.value = res.data.content_img.split(",")
}

// 新建草稿
async function saveToDrafts () {
  if (articleInfo.title && articleInfo.tag_id) {
    articleInfo.content_img = extractMarkdownImages(articleInfo.mdContent).join(
      ","
    )
    const res = await createArticleDraft({
      ...articleInfo,
      author_id: userInfo.value._id,
      content: editorRef.value.d_render,
    })
    // 赋值_id属性，方便自动保存
    articleInfo._id = res.data.create_id
  }
}

// 更新草稿
async function updateDrafts () {
  contentImgs.value = extractMarkdownImages(articleInfo.mdContent)
  articleInfo.content_img = contentImgs.value.join(",")
  await updateArticleDraft(articleInfo._id, {
    ...articleInfo,
    author_id: userInfo.value._id,
    content: editorRef.value.d_render,
  })
}

// 删除没有保存到文章中的残余图片
async function delUseless () {
  let imgs = []
  // 筛选出没用的图片
  if (!isArticleEdit.value) return
  if (isPublish.value) {
    // 在编辑模式下
    imgs = compareUnusedImage(stateImgs.value, contentImgs.value)
  } else {
    contentImgs.value = extractMarkdownImages(articleInfo.mdContent)
    imgs = compareUnusedImage(contentImgs.value, stateImgs.value)
  }
  console.log("删除", imgs)
  if (imgs.length !== 0) {
    imgs = imgs.join(",")
    await deleteEditorImg({ imgs })
  }
}

// 根据不同的模式保存文章或草稿
async function saveAuto () {
  // 修改文章模式，保存文章
  if (isArticleEdit.value) {
    await updateArticle(articleInfo._id, {
      ...articleInfo,
      content: editorRef.value.d_render,
    })
    return
  }
  // 不存在_id属性，自动保存时需要新建草稿，否则直接保存草稿
  if (articleInfo._id) {
    updateDrafts()
  } else {
    saveToDrafts()
  }
}

// 自动保存功能
const lastSaveTime = ref(null)
const autoSaveTimer = setInterval(async () => {
  await saveAuto()
  const now = new Date()
  lastSaveTime.value = `${now.getHours()}:${now.getMinutes()}`
}, 1000 * 60 * 3) // 每三分钟自动保存一次

onMounted(() => {
  initTagOptions()
  initCategoryOptions()
  initForm()
})

onBeforeUnmount(() => {
  // delUseless()
  if (userLeaving && isPublish.value) {
    saveAuto()
  }
  clearInterval(autoSaveTimer)
});
</script>

<style  lang="scss" scoped>
.md-editor {
  width: 100%;
  height: 420px;
}
.btn-area {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  .auto-save {
    color: #ccc;
  }
}
</style>