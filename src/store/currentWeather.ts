import { defineStore } from 'pinia';
import type { CurrentChartData, CurrentElements } from '@/types';
import axios from 'axios';
import { format } from 'date-fns';

// 工具函數：簡化日期與時間
const simplifyDateTime = (dateTime: string) => ({
  time: dateTime.split('T')[1].slice(0, 2),
  date: dateTime.split('T')[0].split('-').slice(1).join('/'),
});

// 工具函數：過濾日期陣列
const filterForecastDates = (dateArr: string[][]) => {
  return dateArr.reduce((result: string[][], date: string[], index: number) => {
    if (index === 0 || date[0] === '00') {
      result.push(date); // 保留完整陣列
    } else {
      result.push([date[0]]); // 僅保留時間部分
    }
    return result;
  }, []);
};

export const useCurrentWeather = defineStore('currentWeather', {
  state: () => ({
    currentData: {} as CurrentElements, // 即時天氣預報面板
    currentChartData: {} as CurrentChartData, // 72小時預報折線圖數據 72 hour Chart data
  }),
  actions: {
    async fetchWeather(city: string, region: string, dataId: string[]) {
      try {
        // 串接臺灣各縣市鄉鎮未來3天天氣預報API
        const response = await axios.get(
          `https://opendata.cwa.gov.tw/api/v1/rest/datastore/${dataId[0]}?`,
          {
            params: {
              Authorization: import.meta.env.VITE_API,
              LocationName: region,
              ElementName:
                '溫度,相對濕度,體感溫度,舒適度指數,風速,3小時降雨機率,天氣現象',
              timeFrom: format(new Date(), "yyyy-MM-dd'T'HH:00:00"),
            },
          }
        );

        // 由API獲取的指定天氣因子資料存進 weatherElements
        const weatherElements =
          response.data.records.Locations[0].Location[0].WeatherElement;

        if (weatherElements) {
          // 通用函數，用來提取即時天氣元素數值
          const extractData = (source: any, index: number, key: string) => {
            return source[index].Time[0].ElementValue[0][key];
          };

          this.currentData = {
            cityName: city,
            regionName: region,
            pop: extractData(weatherElements, 5, 'ProbabilityOfPrecipitation'), // 3小時降雨機率
            temp: extractData(weatherElements, 0, 'Temperature'), //溫度
            rh: extractData(weatherElements, 1, 'RelativeHumidity'), // 相對濕度
            wx: extractData(weatherElements, 6, 'Weather'), // 天氣現象
            ci: extractData(weatherElements, 3, 'ComfortIndexDescription'), // 舒適度指數, 舒適度文字描述
            ws: extractData(weatherElements, 4, 'WindSpeed'), // 風速 (公尺/秒)
          };

          // 72小時預報折線圖數據 (前36小時區間，由原逐3小時預報調整為逐時預報)
          // 即時取得資料集:溫度、體感溫度各48筆
          // 從溫度資料集提取簡化的日期時間
          const tempForecasts = weatherElements[0].Time.slice(0, 47);
          const apparentTempForecasts = weatherElements[2].Time.slice(0, 47);
          const shortenedDateArr = tempForecasts.map((el: any) =>
            Object.values(simplifyDateTime(el.DataTime))
          );

          this.currentChartData = {
            date: filterForecastDates(shortenedDateArr),
            temp: tempForecasts.map(
              (el: any) => el.ElementValue[0].Temperature
            ),
            apparentTemp: apparentTempForecasts.map(
              (el: any) => el.ElementValue[0].ApparentTemperature
            ),
          };
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
});
