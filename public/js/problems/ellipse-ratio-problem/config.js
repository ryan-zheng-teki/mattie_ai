/**
 * 椭圆比值问题可视化的配置
 */
const config = {
  // 这些将在创建舞台后初始化
  stageWidth: 0,
  stageHeight: 0,
  origin: { x: 0, y: 0 }, // 将设置为舞台中心
  scale: 0, // 每单位像素数，将根据舞台大小设置
  
  // 椭圆参数
  ellipseC: {
    a: 2, // 半长轴 (√4 = 2)
    b: 1, // 半短轴
    equation: "x²/4 + y² = 1"
  },
  
  ellipseE: {
    a: 4, // 半长轴 (√16 = 4)
    b: 2, // 半短轴 (√4 = 2)
    equation: "x²/16 + y²/4 = 1"
  },
  
  // 将被计算的点
  pointP: { x: 0, y: 0 }, // 将动态设置
  pointQ: { x: 0, y: 0 }, // 将动态设置
  
  // P 初始位置的固定角度（可更改）
  initialAngle: Math.PI/4, // 45 度
  
  // 颜色
  colors: {
    axes: '#333',
    grid: '#e0e0e0',
    ellipseC: '#3f51b5', // 靛蓝色
    ellipseE: '#e91e63', // 粉色
    pointO: '#212121', // 近黑色
    pointP: '#4caf50', // 绿色
    pointQ: '#ff9800', // 橙色
    rayOP: '#673ab7', // 深紫色
    rayOQ: '#00bcd4', // 青色（rayOP 的延续）
    labels: '#555',
    ratioHighlight: '#f44336', // 红色
    background: ['#f9f9ff', '#eef5ff']
  },

  // 增强样式属性
  styles: {
    axisWidth: 2,
    ellipseWidth: 2.5,
    ellipseDashC: [], // 实线
    ellipseDashE: [], // 实线
    rayWidth: 2,
    pointRadius: 6,
    labelFontSize: 16,
    gridSpacing: 20,
    axisOffset: 10, // 坐标轴标签偏移距离
    tickSize: 5 // 坐标轴刻度大小
  },

  // 动画设置
  animDuration: 0.8, // 绘制动画的持续时间（秒）
  autoModeStepDelay: 2500, // 自动模式步骤之间的延迟（毫秒）

  // 增强缓动选项
  easing: {
    draw: "power2.out",
    appear: "back.out(1.7)",
    move: "elastic.out(1, 0.75)"
  }
};
