<template>
  <div class="patent-detail-container">
    <el-card shadow="hover">
      <h1>{{ patent.invention_title }}</h1>
      <el-descriptions border column="2" class="patent-detail">
        <el-descriptions-item label="申请号">{{ patent.application_number }}</el-descriptions-item>
        <el-descriptions-item label="公开号">{{ patent.publication_number }}</el-descriptions-item>
        <el-descriptions-item label="申请日期">{{ patent.application_date }}</el-descriptions-item>
        <el-descriptions-item label="公开日期">{{ patent.publication_date }}</el-descriptions-item>
        <el-descriptions-item label="法律状态">{{ patent.legal_status }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ patent.applicant_name }}</el-descriptions-item>
        <el-descriptions-item label="发明人">{{ patent.inventor_name }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ patent.applicant_address }}</el-descriptions-item>
        <el-descriptions-item label="代理公司">{{ patent.agency }}</el-descriptions-item>
        <el-descriptions-item label="代理人">{{ patent.agent }}</el-descriptions-item>
        <el-descriptions-item label="IPC号">{{ patent.classification_number }}</el-descriptions-item>
        <el-descriptions-item label="优先权号">{{ patent.priority_number }}</el-descriptions-item>
      </el-descriptions>
      <div class="abstract">
        <h3>摘要</h3>
        <p>{{ patent.abstract }}</p>
      </div>
      <div class="radar-chart-container">
        <h3>价值评估雷达图 (总分: {{ valueAssessment.total_value }})</h3>
        <canvas id="totalValueChart"></canvas>
      </div>
      <div class="radar-chart-row">
        <div class="radar-chart">
          <h3>法律价值雷达图 (分数: {{ valueAssessment.legal_value }})</h3>
          <canvas id="legalValueChart"></canvas>
        </div>
        <div class="radar-chart">
          <h3>技术价值雷达图 (分数: {{ valueAssessment.technical_value }})</h3>
          <canvas id="technicalValueChart"></canvas>
        </div>
        <div class="radar-chart">
          <h3>经济价值雷达图 (分数: {{ valueAssessment.economic_value }})</h3>
          <canvas id="economicValueChart"></canvas>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'PatentDetail',
  data() {
    return {
      patent: {}, // 用于存储专利详细信息
      valueAssessment: {}, // 存储价值评估信息
      loading: true,
      error: null,
      totalScore: 0, // 存储总价值评估分数
      indicatorLabels: {
        legal_indicators: {
          patent_validity: '专利有效性',
          family_situation: '同族专利情况',
          reexamination_invalid: '复审无效情况',
          non_avoidability: '不可规避性',
          claim_reasonableness: '权利要求合理性',
          claim_type: '权利要求类型',
          dependency: '依赖度',
        },
        technical_indicators: {
          problem_importance: '技术问题重要性',
          originality: '技术原创性',
          technical_effect: '技术效果',
          citation: '引用情况',
          alternative_solutions: '替代技术方案数量',
          technical_domains: '技术领域数量',
          technical_scope: '技术领域范围',
          dependency_degree: '配套技术依存度',
          development_stage: '技术发展阶段',
          lifecycle: '技术生命周期',
        },
        economic_indicators: {
          remaining_life: '剩余经济寿命',
          defensiveness: '防御性',
          control_power: '控制力',
          competitor_situation: '竞争对手情况',
          sales_revenue: '销售收益',
          market_share: '市场占有率',
          policy_adaptability: '政策适应性',
          transfer_licensing: '转让许可情况',
          financing_insurance: '融资保险情况',
          litigation_arbitration: '诉讼仲裁情况',
        },
      },
    };
  },
  async created() {
    const { application_number } = this.$route.params;
    try {
      const patentResponse = await axios.get(
        `http://10.131.3.253:8000/patent_detail?application_number=${application_number}`
      );
      this.patent = patentResponse.data;

      const valueResponse = await axios.get(
        `http://10.131.3.253:8000/value_assessment?application_number=${application_number}`
      );
      this.valueAssessment = valueResponse.data;

      // 计算总分
      this.totalScore =
        this.valueAssessment.legal_value +
        this.valueAssessment.technical_value +
        this.valueAssessment.economic_value;

      this.renderRadarCharts();
    } catch (err) {
      this.error = '无法获取专利详情或价值评估信息';
      console.error(err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    getTranslatedLabels(indicators, type) {
      return Object.keys(indicators).map((key) => this.indicatorLabels[type][key]);
    },
    renderRadarCharts() {
      if (!this.valueAssessment) return;

      const totalCtx = document.getElementById('totalValueChart').getContext('2d');
      new Chart(totalCtx, {
        type: 'radar',
        data: {
          labels: ['技术价值', '经济价值', '法律价值'],
          datasets: [
            {
              label: '价值评估',
              data: [
                this.valueAssessment.technical_value,
                this.valueAssessment.economic_value,
                this.valueAssessment.legal_value,
              ],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            r: {
              beginAtZero: true,
              suggestedMax: 1,
            },
          },
        },
      });

      const legalCtx = document.getElementById('legalValueChart').getContext('2d');
      new Chart(legalCtx, {
        type: 'radar',
        data: {
          labels: this.getTranslatedLabels(this.valueAssessment.legal_indicators, 'legal_indicators'),
          datasets: [
            {
              label: '法律价值指标',
              data: Object.values(this.valueAssessment.legal_indicators),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            r: {
              beginAtZero: true,
              suggestedMax: 1,
            },
          },
        },
      });

      const technicalCtx = document.getElementById('technicalValueChart').getContext('2d');
      new Chart(technicalCtx, {
        type: 'radar',
        data: {
          labels: this.getTranslatedLabels(this.valueAssessment.technical_indicators, 'technical_indicators'),
          datasets: [
            {
              label: '技术价值指标',
              data: Object.values(this.valueAssessment.technical_indicators),
              backgroundColor: 'rgba(255, 205, 86, 0.2)',
              borderColor: 'rgba(255, 205, 86, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            r: {
              beginAtZero: true,
              suggestedMax: 1,
            },
          },
        },
      });

      const economicCtx = document.getElementById('economicValueChart').getContext('2d');
      new Chart(economicCtx, {
        type: 'radar',
        data: {
          labels: this.getTranslatedLabels(this.valueAssessment.economic_indicators, 'economic_indicators'),
          datasets: [
            {
              label: '经济价值指标',
              data: Object.values(this.valueAssessment.economic_indicators),
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            r: {
              beginAtZero: true,
              suggestedMax: 1,
            },
          },
        },
      });
    },
  },
};
</script>

<style scoped>
.patent-detail-container {
  padding: 20px;
}
.abstract {
  margin-top: 20px;
}
.radar-chart-container {
  margin-top: 30px;
  text-align: center;
}
.radar-chart-row {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.radar-chart {
  flex: 1;
  text-align: center;
  margin: 0 10px;
}
canvas {
  max-width: 300px;
  margin: 0 auto;
}
</style>
