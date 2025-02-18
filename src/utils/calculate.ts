// 依數據範圍計算 Y 軸的步進值(stepSize)。
export function calculateStepSize(data: number[]): number {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;
  return range <= 7.5 ? 2.5 : 5; // 若數據範圍小於或等於 7.5，返回 2.5；否則返回 5。
}
