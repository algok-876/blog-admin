<template>
  <n-space vertical>
    <n-button type="info" @click="showCreateModal"> 添加分类 </n-button>
    <n-data-table
      :columns="tableColumns"
      :data="categoryData"
      :single-line="false"
    />
  </n-space>

  <n-modal
    v-model:show="showModal"
    :mask-closable="false"
    :style="{ width: '600px' }"
    preset="card"
    :title="isAdd ? '添加分类' : '修改分类'"
  >
    <n-form
      ref="formRef"
      :label-width="50"
      :model="categoryInfo"
      :rules="rules"
      label-placement="left"
      label-align="left"
    >
      <n-form-item label="名称" path="name">
        <n-input v-model:value="categoryInfo.name" placeholder="输入分类名称" />
      </n-form-item>
      <n-upload
        :default-upload="false"
        @update:file-list="uploadChange"
        :max="1"
        list-type="image"
        :file-list="fileList"
      >
        <n-button>上传封面</n-button>
      </n-upload>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button type="warning" @click="showModal = false">取消</n-button>
        <n-button type="success" @click="onPositiveClick">确认</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import {
  categoryList,
  updateCategory,
  deleteCategory,
  createCategory
} from '@/api'
import { ref, h } from 'vue'
import { computed, onMounted, reactive } from '@vue/runtime-core'
import { NButton, NPopconfirm, NSpace, useMessage } from 'naive-ui'
import { clearForm } from '@/utils/form'

const categoryData = ref([]) // 分类数据
const formRef = ref(null)
const message = useMessage()
const fileList = ref([])
const coverFile = computed(() => {
  if (fileList.value[0]) {
    return fileList.value[0].file
  }
  return ''
})

const rules = {
  name: [
    {
      required: true,
      trigger: ["input", "blur"],
      message: '请输入名称'
    }
  ]
}
// 表格数据
const createColums = ({ onDeleteCategorySignle }) => {
  return [
    {
      title: '名称',
      width: 300,
      key: 'name'
    },
    {
      title: '封面',
      key: 'cover',
      render (row) {
        if (row.cover) {
          return h(
            'img',
            {
              src: row.cover,
              style: {
                width: '300px',
                height: '120px',
                objectFit: 'cover'
              }
            }
          )
        } else {
          return '暂无封面'
        }
      }
    },
    {
      title: '操作',
      key: 'operation',
      width: 200,
      render (row) {
        return h(
          NSpace,
          {
          },
          {
            default: () => {
              return [
                h(
                  NButton,
                  {
                    type: 'success',
                    onClick: () => showUpdateModal(row)
                  },
                  { default: () => '修改' }
                ),
                h(
                  NPopconfirm,
                  {
                    onPositiveClick: () => onDeleteCategorySignle(row._id),
                    positiveText: '确认',
                    negativeText: '取消'
                  },
                  {
                    trigger: () => h(
                      NButton,
                      {
                        type: 'warning'
                      },
                      { default: () => '删除' }
                    ),
                    default: () => '确认是否删除此分类'
                  }
                ),

              ]
            }
          }
        )
      }
    }
  ]
}

const showModal = ref(false)  // 控制模态框显示与否
const categoryInfo = reactive({
  name: '',
  coverList: ref([])
})
const isAdd = ref(null)

function showCreateModal () {
  console.log(categoryInfo.coverList)
  clearForm(categoryInfo)
  isAdd.value = true
  showModal.value = true
}

function showUpdateModal (row) {
  clearForm(categoryInfo)
  isAdd.value = false
  showModal.value = true
  categoryInfo._id = row._id
  categoryInfo.name = row.name
}

// 点击model确认按钮
function onPositiveClick () {
  formRef.value.validate(async (err) => {
    if (err) return
    let result = null
    if (isAdd.value) {
      result = await createCategory(categoryInfo.name, coverFile.value)
      categoryData.value.push(categoryInfo)
    } else {
      result = await updateCategory(categoryInfo._id, categoryInfo.name, coverFile.value)
    }
    loadCategory()
    message.success(result.message)
    showModal.value = false
    clearForm(categoryInfo, formRef)
  })
}

// 单个删除分类
async function onDeleteCategorySignle (id) {
  const result = await deleteCategory([id])
  categoryData.value = categoryData.value.filter(v => v._id !== id)
  message.success(result.message)
}

// 表格配置项
const tableColumns = createColums({
  onDeleteCategorySignle,
  showUpdateModal
})

function uploadChange (files) {
  fileList.value = files
}

// 加载分类信息
async function loadCategory () {
  categoryData.value = (await categoryList()).data
}

onMounted(async () => {
  // 分类信息列表
  loadCategory()
})
</script>

<style>
</style>