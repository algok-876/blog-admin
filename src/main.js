import { createApp } from 'vue'
import store from './stores'
import App from './App.vue'
import router from './router'
import naive from './naive-ui'
// 编辑器样式
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

const app = createApp(App)
app.use(router)
app.use(store)
app.use(naive)
app.component('mavonEditor', mavonEditor)

app.mount('#app')
