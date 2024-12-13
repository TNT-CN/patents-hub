<template>
  <div id="app">
    <!-- 路由视图，用于加载路由对应的组件 -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* 全局样式 */
html, body {
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5; /* 全局背景色 */
  box-sizing: border-box;
  overflow-x: hidden; /* 防止水平滚动 */
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
