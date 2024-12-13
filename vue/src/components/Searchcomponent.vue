<template>
  <!-- 使用 flex 布局调整 -->
  <div class="search-container">
    <!-- 左侧搜索栏 -->
    <div :class="['left-container', searchPerformed ? 'search-performed-left-container' : '']">
      <el-card shadow="hover" class="left-card">
        <h1>专利搜索</h1>
        <el-form @submit.native.prevent="performSearch" :model="form">
          <!-- 搜索关键词 -->
          <el-form-item label="搜索关键词">
            <el-input v-model="form.user_input" placeholder="输入搜索关键词"></el-input>
          </el-form-item>

          <!-- 字段特定查询 -->
          <el-form-item label="字段特定查询">
            <el-select v-model="field_specific_query_field" placeholder="选择字段">
              <el-option
                v-for="field in searchFields"
                :key="field.value"
                :label="field.label"
                :value="field.value"
              ></el-option>
            </el-select>
            <el-input
              v-model="field_specific_query_value"
              placeholder="字段值"
              style="margin-top: 10px;"
            ></el-input>
            <el-button type="primary" @click="addFieldSpecificQuery" style="margin-top: 10px;">
              添加字段查询
            </el-button>
          </el-form-item>

          <!-- 显示已添加的字段特定查询 -->
        <el-form-item v-if="Object.keys(field_specific_query).length > 0" label="已添加的查询字段">
          <el-tag
            v-for="(value, key) in field_specific_query"
            :key="key"
            closable
            @close="removeFieldSpecificQuery(key)"
            style="margin-bottom: 5px;"
          >
            {{ searchFields.find(field => field.value === key)?.label }}: {{ value }}
          </el-tag>
        </el-form-item>

          <!-- 启用通配符搜索 -->
          <el-form-item>
            <el-checkbox v-model="form.enable_wildcard">启用通配符搜索</el-checkbox>
          </el-form-item>

          <!-- 启用模糊搜索 -->
          <el-form-item>
            <el-checkbox v-model="form.enable_fuzzy">启用模糊搜索</el-checkbox>
          </el-form-item>

          <!-- 日期范围选择器 -->
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="form.date_range"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange"
            ></el-date-picker>
          </el-form-item>

          <!-- 近邻距离 -->
          <el-form-item label="近邻距离">
            <el-input-number v-model="form.proximity_distance" :min="1"></el-input-number>
          </el-form-item>

          <!-- 排序字段 -->
          <!--el-form-item label="排序字段"-->
            <!--el-input v-model="form.sort_by" placeholder="输入排序字段"></el-input>
          <!--/el-form-item-->

          <!-- 分页 -->
          <el-form-item label="分页">
            <el-input-number v-model="form.page" :min="1" label="页码"></el-input-number>
            <el-input-number v-model="form.page_size" :min="1" label="每页数量"></el-input-number>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="performSearch">搜索</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 右侧搜索结果 -->
    <div class="right-container">
      <el-card shadow="hover" class="right-card">
        <!-- 加载指示器 -->
        <div v-if="loading">
          <el-loading text="加载中..."></el-loading>
        </div>
        <!-- 错误信息 -->
        <div v-else-if="error">
          <el-alert :title="error" type="error" show-icon></el-alert>
        </div>
        <!-- 搜索结果 -->
        <div v-else-if="results.length">
          <h2>搜索结果：</h2>
          <el-table :data="results" style="width: 100%">

<!-- 申请号 -->
<el-table-column prop="application_number" label="申请号">
  <template #default="scope">
    <span>{{ scope.row.application_number }}</span>
  </template>
</el-table-column>

<!-- 发明名称 -->
<el-table-column prop="invention_title" label="专利名称" width="400">
  <template #default="scope">
    <span
      @click="redirectToPatentPage(scope.row.application_number)"
      style="cursor: pointer; color: #409EFF; text-decoration: underline;"
    >
      {{ scope.row.invention_title }}
    </span>
  </template>
</el-table-column>

<!-- 申请日期 -->
<el-table-column prop="application_date" label="申请日期">
  <template #default="scope">
    <span>{{ scope.row.application_date }}</span>
  </template>
</el-table-column>

<!-- 公开号 -->
<el-table-column prop="publication_number" label="公开号">
  <template #default="scope">
    <span>{{ scope.row.publication_number }}</span>
  </template>
</el-table-column>

<!-- 公开日期 -->
<el-table-column prop="publication_date" label="公开日期">
    <template #default="scope">
      <span>{{ scope.row.publication_date }}</span>
    </template>
</el-table-column>

<!-- 法律状态 -->
<el-table-column prop="legal_status" label="法律状态">
      <template #default="scope">
        <span>{{ scope.row.legal_status }}</span>
      </template>
</el-table-column>


<!-- 申请人名称 -->
<el-table-column prop="applicant_name" label="申请人名称">
  <template #default="scope">
    <span v-html="scope.row.applicant_name"></span>
  </template>
</el-table-column>

<!-- 发明人 -->
<el-table-column prop="inventor_name" label="发明人">
  <template #default="scope">
    <span v-html="scope.row.inventor_name"></span>
  </template>
</el-table-column>

<el-table-column prop="value_assessment" label="价值评估">
<template #default="scope">
  <span>--</span> <!-- 使用占位符 "--" 预留出位置，以后可以用实际数据填充 -->
</template>
</el-table-column>

</el-table>
<!-- 分页控件 -->
      <el-pagination
          @current-change="handlePageChange"
          :current-page="form.page"
          :page-size="form.page_size"
          layout="total, prev, pager, next"
          :total="total_results"
          style="margin-top: 20px; text-align: right;"
        ></el-pagination>
        </div>
        <!-- 无结果提示 -->
        <div v-else>
          <el-empty description="未找到匹配的结果"></el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import dayjs from 'dayjs'

export default {
  name: 'Searchcomponent',
  data() {
    return {
      form: {
        user_input: '',
        enable_wildcard: false,
        enable_fuzzy: false,
        date_range: [],
        formatted_date_range: null, // 用于存储格式化后的日期范围
        proximity_distance: null,
        sort_by: '',
        page: 1,
        page_size: 10,
      },
      field_specific_query_field: '',
      field_specific_query_value: '',
      field_specific_query: {},
      searchFields: [
        { label: '发明名称', value: 'invention_title' },
        { label: '摘要', value: 'abstract' },
        { label: '申请人名称', value: 'applicant_name' },
        { label: '发明人名称', value: 'inventor_name' },
        { label: '申请号', value: 'application_number' },
        { label: '公开号', value: 'publication_number' },
        { label: '代理公司', value: 'agency' },
        { label: '代理人', value: 'agent' },
        { label: '申请地址', value: 'applicant_address' },
        { label: '价值评估', value: 'value_assessment' }, // 新增字段
        { label: '法律状态', value: 'legal_status' } // 新增字段
      ],
      results: [],
      total_results: 0, // 搜索结果总数
      loading: false,
      error: null,
      searchPerformed: false, // 搜索是否已执行
    }
  },
  methods: {
    addFieldSpecificQuery() {
      if (this.field_specific_query_field && this.field_specific_query_value) {
      this.field_specific_query[this.field_specific_query_field] = this.field_specific_query_value
      this.field_specific_query_field = ''
      this.field_specific_query_value = ''
      this.$message.success('字段查询已添加')
    } else {
      this.$message.warning('请填写字段名称和字段值')
    }
  },
  removeFieldSpecificQuery(key) {
      delete this.field_specific_query[key];
      this.$message.success('字段查询已删除');
  },
  handleDateRangeChange(dates) {
    if (dates && dates.length === 2) {
      // 使用 dayjs 将日期转换为 YYYYMMDD 格式
      this.form.formatted_date_range = {
        gte: dayjs(dates[0]).format('YYYYMMDD'),
        lte: dayjs(dates[1]).format('YYYYMMDD')
      };
    } else {
      this.form.formatted_date_range = null; // 如果日期未选择，重置为 null
    }
  },
    async performSearch() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('http://10.131.3.253:8000/search', {
          user_input: this.form.user_input,
          field_specific_query: this.field_specific_query,
          sort_by: this.form.sort_by,
          page: this.form.page,
          page_size: this.form.page_size,
          enable_wildcard: this.form.enable_wildcard,
          enable_fuzzy: this.form.enable_fuzzy,
          date_range: this.form.formatted_date_range, // 使用格式化后的日期范围
          proximity_distance: this.form.proximity_distance,
        })
        this.results = response.data.results;
        this.total_results = response.data.total;
        if (this.results.length === 0) {
          this.$message.info('未找到匹配的结果')
        }
        this.searchPerformed = true;
      } catch (error) {
        this.error = '获取结果时发生错误'
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    handlePageChange(newPage) {
    this.form.page = newPage
    this.performSearch()  // 当页码改变时重新进行搜索
    },

    // 跳转到专利详情页
    redirectToPatentPage(applicationNumber) {
     if (!applicationNumber) {
       this.$message.warning('申请号缺失，无法跳转');
       return;
     }
     const targetUrl = `http://10.131.3.253:3000/patents/${applicationNumber}`;
      window.open(targetUrl, '_blank'); // 在新标签页中打开
   },
  },
}
</script>

<style scoped>
.search-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: max; /* 整个布局的最大宽度 */
  margin: 0;          /* 去除自动居中，使父容器左对齐 */
  padding: 20px 0;    /* 保持上下的间距，减少左右空白 */
  box-sizing: border-box;
}

.left-container {
  flex: 1;               /* 左侧容器占据较小份额 */
  max-width: 40%;        /* 修改初始状态的左侧容器的最大宽度为 40%，让初始状态更宽 */
  margin-right: 10px;    /* 调整左右容器之间的间距为 15px */
  box-sizing: border-box;
}

.right-container {
  flex: 2;               /* 让右侧部分占据更多的空间 */
  max-width: 60%;
  box-sizing: border-box;
}

/* 搜索后状态的容器样式 */
.search-performed-left-container {
   flex: 1;
  max-width: 30%; /* 将左侧的最大宽度缩小到 30% */
  margin-right: 15px; /* 调整左右容器之间的间距 */
  box-sizing: border-box;

}

.search-performed-right-container {
  flex: 2;  /* 让右侧部分占据更多的空间 */
  max-width: 70%;
  box-sizing: border-box;

}

.left-card,
.right-card {
  width: 100%;
  box-sizing: border-box;
}

.el-form-item {
  margin-bottom: 15px;
}

.el-table {
  margin-top: 20px;
}

@media (max-width: 768px) {
  /* 针对移动端优化 */
  .search-container {
    flex-direction: column; /* 改为垂直布局 */
    padding: 10px;
  }
  .left-container,
  .right-container {
    max-width: 100%;
    margin-right: 0;
  }
}

</style>
