<template>
  <n-form ref="formRef" :model="siteinfo">
    <n-divider title-placement="left"> 前台关于信息展示 </n-divider>
    <n-grid x-gap="12" :cols="3">
      <n-gi>
        <n-form-item label="姓名">
          <n-input v-model:value="siteinfo.owner.name" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="公司名称">
          <n-input v-model:value="siteinfo.owner.company" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="学校">
          <n-input v-model:value="siteinfo.owner.school" />
        </n-form-item>
      </n-gi>
      <n-gi span="2">
        <n-form-item label="爱好">
          <n-input v-model:value="siteinfo.owner.habit" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="联系方式">
          <n-input v-model:value="siteinfo.owner.contact" />
        </n-form-item>
      </n-gi>
      <n-gi span="3">
        <n-form-item label="自我介绍">
          <n-input
            v-model:value="siteinfo.owner.introduction"
            type="textarea"
          />
        </n-form-item>
      </n-gi>
      <n-gi
        v-for="(skill, index) in Object.keys(siteinfo.owner.skills)"
        :key="index"
      >
        <n-form-item :label="skill">
          <n-slider v-model:value="siteinfo.owner.skills[skill]"></n-slider>
        </n-form-item>
      </n-gi>
      <n-gi span="3">
        <n-button type="primary" @click="update"> 修改 </n-button>
      </n-gi>
    </n-grid>
  </n-form>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue"
import { getSiteInformation, updateSiteInformation } from '@/api'
import { useMessage } from 'naive-ui'
const message = useMessage()
const siteinfo = ref({
  sitename: "",
  owner: {
    name: "",
    company: "",
    school: "",
    habit: "",
    introduction: "",
    skills: {
      Vue: 80,
      React: 80,
      HTML: 70,
      CSS: 85,
      JavaScript: 100
    },
    contact: ""
  }
})
const formRef = ref(null)

function update () {
  updateSiteInformation(siteinfo.value).then(res => {
    message.success('更新成功')
  })
}

onMounted(() => {
  getSiteInformation().then(res => {
    siteinfo.value = res.data
  })
})
</script>

<style lang="scss">
</style>