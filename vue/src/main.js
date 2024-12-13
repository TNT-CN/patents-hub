import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';

// 引入 Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// 引入 Vue Router
import router from './router'; // 确保您将路由配置文件命名为 `router.js` 并放置在 `src` 目录下

const app = createApp(App);

// 使用 Element Plus
app.use(ElementPlus);

// 使用 Vue Router
app.use(router);

// 挂载应用到 #app
app.mount('#app');
