<template>
  <Line
    v-if="chartDataReady"
    :options="chartOptions"
    :data="chartData"
    aria-label="Current Weather Line Chart"
    width="1500"
  />
</template>

<script setup lang="ts">
import { toRefs, computed } from 'vue';
import { useCurrentWeather } from '@/store/currentWeather';
import { calculateStepSize } from '@/utils/calculate';
import { Line } from 'vue-chartjs';
import i18n from '@/utils/vue-i18n';
const { t } = i18n.global;
const currentStore = useCurrentWeather();
const { currentChartData } = toRefs(currentStore);

// (在渲染組件前) 檢查currentChartData是否已定義並包含有效數據
const chartDataReady = computed(() => {
  return currentChartData.value.date && currentChartData.value.date.length > 0;
});

// 快取所有Y軸數據
const chartYAxisData = computed(() => [
  ...currentChartData.value.temp,
  ...currentChartData.value.apparentTemp,
]);

// Chart data of current weather forecast
const chartData = computed(() => ({
  labels: currentChartData.value.date,
  datasets: [
    {
      label: t('temp'),
      data: currentChartData.value.temp,
      backgroundColor: '#a5f3fc',
      borderColor: '#a5f3fc',
      hoverRadius: 6,
      cubicInterpolationMode: 'monotone' as const,
      tension: 0.4,
      datalabels: {
        color: '#fff',
        align: 'end' as const,
        anchor: 'start' as const,
        font: {
          weight: 'bold' as const,
        },
      },
    },
    {
      label: t('apparentTemp'),
      data: currentChartData.value.apparentTemp,
      backgroundColor: '#fb923c',
      borderColor: '#fb923c',
      hoverRadius: 6,
      cubicInterpolationMode: 'monotone' as const,
      tension: 0.4,
      datalabels: {
        color: '#fff',
        align: 'end' as const,
        anchor: 'start' as const,
        font: {
          weight: 'bold' as const,
        },
      },
    },
  ],
}));
// Chart options
const chartOptions = computed(() => {
  const yAxisData = chartYAxisData.value;
  const stepSize = calculateStepSize(yAxisData); // 動態計算 Y 軸 stepSize

  return {
    responsive: false, // set false to enable overflow canvas with scrollbar
    maintainAspectRatio: false,
    plugins: {
      legend: {
        align: 'start' as const,
        labels: {
          boxWidth: 24,
          boxHeight: 10,
          color: '#fff',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#3f3f46',
        },
        ticks: {
          color: '#d4d4d4',
          autoSkip: false, // Disable automatic skipping
          maxRotation: 0, // Disable rotation
        },
      },
      y: {
        grid: {
          color: '#3f3f46',
        },
        ticks: {
          color: '#d4d4d4',
          stepSize: stepSize, // 動態設定 stepSize
        },
        suggestedMin: yAxisData.length ? Math.min(...yAxisData) : 5, // Y 軸最小值
        suggestedMax: yAxisData.length ? Math.max(...yAxisData) : 20, // Y 軸最大值
      },
    },
  };
});
</script>
