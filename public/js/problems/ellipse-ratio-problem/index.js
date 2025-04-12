/**
 * 椭圆比值问题可视化
 *
 * 这个可视化演示了对于椭圆 C 上的任意点 P，
 * 如果射线 OP 与椭圆 E 在点 Q 相交，比值 |OQ|/|OP| = 2。
 */

// --- 全局变量 ---
let stage, layer, backgroundLayer, gridLayer;
let elements = {}; // 存储 Konva 对象: { key: KonvaNode }
let currentActiveStep = 0; // 跟踪当前显示的最高步骤
let isDraggable = false; // 控制点可拖动性的标志
let isAutoModeActive = false; // 自动模式状态标志
let autoModeTimeoutId = null; // 自动模式步骤推进的超时 ID
let currentAutoStep = 0; // 自动模式中的当前步骤索引

// 步骤编号到它们引入的元素键的映射
const stepElementKeys = {
  1: ['xAxis', 'yAxis', 'xLabel', 'yLabel', 'pointO', 'textO', 'ellipseC', 'ellipseE', 'labelC', 'labelE', 'ellipsesExplanation'],
  2: ['pointP', 'textP', 'pointPExplanation'],
  3: ['rayOP', 'pointQ', 'textQ', 'rayExplanation', 'pointQExplanation'],
  4: ['algebraicExplanation'], // 比值计算添加代数解释
  5: ['dragHelp', 'finalExplanation'] // 拖动模式添加 dragHelp 和最终解释
  // 注意：临时动画元素未在此列出，因为它们会自行销毁。
  // 注意：'stepExplanation' 单独管理。
};

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', () => {
  initKonva();
  initEventListeners();

  // 绘制初始状态
  gridLayer.draw();
  backgroundLayer.draw();
  layer.draw();

  // 加载后短暂延迟自动显示步骤 1
  setTimeout(() => {
    // 仅在自动模式尚未开始时导航
    if (!isAutoModeActive) {
      navigateToStep(1);
      updateStepUI(1);
    }
  }, 500);
});

// 初始化 Konva 舞台和图层
function initKonva() {
  const stageContainer = document.getElementById('konva-stage-container');
  const stageWidth = stageContainer.clientWidth;
  const stageHeight = stageContainer.clientHeight;

  stage = new Konva.Stage({
    container: 'konva-stage-container',
    width: stageWidth,
    height: stageHeight,
  });

  // 将尺寸保存到配置中
  config.stageWidth = stageWidth;
  config.stageHeight = stageHeight;

  // 创建图层
  layer = new Konva.Layer();
  backgroundLayer = new Konva.Layer();
  gridLayer = new Konva.Layer(); // 用于坐标网格

  // 按顺序将图层添加到舞台
  stage.add(backgroundLayer);
  stage.add(gridLayer); // 网格位于主图层下方
  stage.add(layer);    // 主内容图层

  // 创建渐变背景
  const backgroundRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: stageWidth,
    height: stageHeight,
    fillLinearGradient: {
      start: { x: 0, y: 0 },
      end: { x: stageWidth, y: stageHeight },
      colorStops: [0, config.colors.background[0], 1, config.colors.background[1]]
    },
    listening: false // 背景不应捕获事件
  });
  backgroundLayer.add(backgroundRect);

  // 将原点设置为舞台中心
  config.origin = {
    x: stageWidth / 2,
    y: stageHeight / 2
  };

  // 根据舞台大小计算适当的缩放
  // 我们希望较大的椭圆（E）舒适地适应舞台
  const maxRadius = Math.min(stageWidth, stageHeight) / 2 * 0.8; // 较小尺寸的一半的 80%
  const largestSemiAxis = Math.max(config.ellipseE.a, config.ellipseE.b);
  config.scale = maxRadius / largestSemiAxis;

  // 创建具有适当间距的坐标网格
  createCoordinateGrid();
}

// 创建带刻度的坐标网格
function createCoordinateGrid() {
  const stageWidth = config.stageWidth;
  const stageHeight = config.stageHeight;
  const origin = config.origin;
  const gridSpacing = config.styles.gridSpacing;
  
  // 计算网格边界（显示多少单位）
  const unitsPerGrid = 0.5; // 每条网格线表示 0.5 个单位
  const gridLinesX = Math.ceil(stageWidth / gridSpacing);
  const gridLinesY = Math.ceil(stageHeight / gridSpacing);
  
  // 绘制垂直网格线
  for (let i = -gridLinesX; i <= gridLinesX; i++) {
    const x = origin.x + i * gridSpacing;
    if (x < 0 || x > stageWidth) continue;
    
    const opacity = i % 2 === 0 ? 0.3 : 0.1; // 整数单位的线条更强
    
    const line = new Konva.Line({
      points: [x, 0, x, stageHeight],
      stroke: config.colors.grid,
      strokeWidth: i % 2 === 0 ? 1 : 0.5,
      opacity: opacity,
      listening: false
    });
    gridLayer.add(line);
    
    // 为整数值添加坐标标签（跳过 0）
    if (i % 2 === 0 && i !== 0) {
      const unitValue = (i / 2).toString();
      const label = new Konva.Text({
        x: x - 5,
        y: origin.y + 5,
        text: unitValue,
        fontSize: 10,
        fill: config.colors.labels,
        opacity: 0.6,
        listening: false
      });
      gridLayer.add(label);
    }
  }
  
  // 绘制水平网格线
  for (let i = -gridLinesY; i <= gridLinesY; i++) {
    const y = origin.y + i * gridSpacing;
    if (y < 0 || y > stageHeight) continue;
    
    const opacity = i % 2 === 0 ? 0.3 : 0.1; // 整数单位的线条更强
    
    const line = new Konva.Line({
      points: [0, y, stageWidth, y],
      stroke: config.colors.grid,
      strokeWidth: i % 2 === 0 ? 1 : 0.5,
      opacity: opacity,
      listening: false
    });
    gridLayer.add(line);
    
    // 为整数值添加坐标标签（跳过 0）
    if (i % 2 === 0 && i !== 0) {
      const unitValue = (-i / 2).toString(); // 负数因为画布中 y 是倒置的
      const label = new Konva.Text({
        x: origin.x + 5,
        y: y - 7,
        text: unitValue,
        fontSize: 10,
        fill: config.colors.labels,
        opacity: 0.6,
        listening: false
      });
      gridLayer.add(label);
    }
  }
}

// 设置事件监听器
function initEventListeners() {
  const stepsList = document.getElementById('steps-list');
  const autoModeButton = document.getElementById('auto-mode-button');

  stepsList.addEventListener('click', (event) => {
    const targetLi = event.target.closest('li');
    if (!targetLi) return;

    const stepAttr = targetLi.getAttribute('data-step');

    // 任何手动交互都应停止自动模式
    stopAutoMode();

    if (stepAttr === 'clear') {
      clearCanvas(); // clearCanvas 也会调用 stopAutoMode
      updateStepUI(0); // 在 UI 中停用所有步骤
      console.log("触发清除操作");
      
      // 同时隐藏比值显示
      const ratioDisplay = document.getElementById('ratio-display');
      if (ratioDisplay) {
        ratioDisplay.style.display = 'none';
      }
    } else if (stepAttr) {
      const stepNum = parseInt(stepAttr, 10);
      if (!isNaN(stepNum)) {
        console.log(`导航到步骤: ${stepNum}`);
        toggleInteractivity(false); // 确保关闭特定步骤的交互性
        navigateToStep(stepNum);
        updateStepUI(stepNum);
      }
    }
  });

  // 自动模式按钮监听器
  if (autoModeButton) {
    autoModeButton.addEventListener('click', () => {
      if (isAutoModeActive) {
        stopAutoMode();
      } else {
        startAutoMode();
      }
    });
  } else {
    console.error("未找到自动模式按钮！");
  }

  // 添加键盘快捷键
  document.addEventListener('keydown', (e) => {
    // 数字 1-5 触发步骤
    if (e.key >= '1' && e.key <= '5') {
       e.preventDefault(); // 防止数字的默认浏览器操作
       stopAutoMode(); // 手动交互时停止自动模式
       const stepNum = parseInt(e.key);
       console.log(`导航到步骤: ${stepNum} (键盘)`);
       toggleInteractivity(false); // 更改步骤时禁用交互性
       navigateToStep(stepNum);
       updateStepUI(stepNum);
    }

    // 'C' 键清除
    if (e.key === 'c' || e.key === 'C') {
       e.preventDefault();
       stopAutoMode(); // 停止自动模式
       console.log("触发清除操作 (键盘)");
       clearCanvas();
       updateStepUI(0); // 在 UI 中停用所有步骤
       
       // 同时隐藏比值显示
       const ratioDisplay = document.getElementById('ratio-display');
       if (ratioDisplay) {
         ratioDisplay.style.display = 'none';
       }
    }
    
    // 'D' 键切换拖动模式（在步骤 5 中）
    if (e.key === 'd' || e.key === 'D') {
       e.preventDefault();
       if (currentActiveStep >= 5) { // 仅在步骤 5 中
         console.log("触发切换拖动模式 (键盘)");
         toggleInteractivity(); // 切换当前状态
       }
    }
  });

  // 防抖动的调整大小处理程序
  let resizeTimeout;
  window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
          console.log("调整舞台大小...");
          stopAutoMode(); // 调整大小时停止自动模式

          const stageContainer = document.getElementById('konva-stage-container');
          const newWidth = stageContainer.clientWidth;
          const newHeight = stageContainer.clientHeight;

          // 更新舞台尺寸
          stage.width(newWidth);
          stage.height(newHeight);
          
          // 更新配置
          config.stageWidth = newWidth;
          config.stageHeight = newHeight;
          
          // 更新原点为舞台中心
          config.origin = {
            x: newWidth / 2,
            y: newHeight / 2
          };
          
          // 重新计算缩放
          const maxRadius = Math.min(newWidth, newHeight) / 2 * 0.8;
          const largestSemiAxis = Math.max(config.ellipseE.a, config.ellipseE.b);
          config.scale = maxRadius / largestSemiAxis;

          // 更新背景
          backgroundLayer.destroyChildren();
          const backgroundRect = new Konva.Rect({
            x: 0,
            y: 0,
            width: newWidth,
            height: newHeight,
            fillLinearGradient: {
              start: { x: 0, y: 0 },
              end: { x: newWidth, y: newHeight },
              colorStops: [0, config.colors.background[0], 1, config.colors.background[1]]
            },
            listening: false
          });
          backgroundLayer.add(backgroundRect);
          
          // 重新生成网格
          gridLayer.destroyChildren();
          createCoordinateGrid();

          // 调整大小后重新渲染当前步骤
          const stepToRestore = currentActiveStep;
          clearCanvas(); // 清除旧元素
          navigateToStep(stepToRestore); // 使用新尺寸重新绘制当前步骤

          // 重绘图层
          backgroundLayer.batchDraw();
          gridLayer.batchDraw();
          layer.batchDraw();
      }, 250); // 防抖动调整大小事件
  });
}

// --- 自动模式功能 ---

function startAutoMode() {
  if (isAutoModeActive) return; // 已在运行

  console.log("启动自动模式...");
  
  // 首先更新 UI
  const autoModeButton = document.getElementById('auto-mode-button');
  if (autoModeButton) {
    autoModeButton.textContent = "停止自动演示";
    autoModeButton.classList.add('stop');
  }
  
  // 同时隐藏比值显示
  const ratioDisplay = document.getElementById('ratio-display');
  if (ratioDisplay) {
    ratioDisplay.style.display = 'none';
  }

  // 重要：清除画布而不停止自动模式
  clearCanvasForAutoMode();
  
  // 清除后，启用自动模式
  isAutoModeActive = true;
  isDraggable = false;
  
  // 从步骤 1 开始
  currentAutoStep = 1;
  
  // 立即开始执行序列
  console.log("自动模式：从步骤 1 开始执行");
  executeAutoStep();
}

// 新功能：清除画布而不停止自动模式
function clearCanvasForAutoMode() {
  console.log("为自动模式清除画布");
  
  // 停止任何运行中的动画
  gsap.killTweensOf(layer.getChildren());
  
  // 从图层中移除所有形状
  layer.destroyChildren();
  
  // 清除引用并重置计数器
  elements = {};
  currentActiveStep = 0;
  
  // 重绘
  layer.batchDraw();
}

function stopAutoMode() {
  if (!isAutoModeActive) return; // 未运行

  console.log("停止自动模式。");
  isAutoModeActive = false;
  
  // 清除任何待处理的超时
  if (autoModeTimeoutId) {
    clearTimeout(autoModeTimeoutId);
    autoModeTimeoutId = null;
  }
  currentAutoStep = 0; // 重置步骤计数器

  // 更新按钮状态
  const autoModeButton = document.getElementById('auto-mode-button');
  if (autoModeButton) {
    autoModeButton.textContent = "开始自动演示";
    autoModeButton.classList.remove('stop');
  }
}

function executeAutoStep() {
  // 再次检查活动状态
  if (!isAutoModeActive) {
    console.warn("执行过程中自动模式被停用");
    return;
  }

  const totalSteps = 5;
  if (currentAutoStep > totalSteps) {
    console.log("自动模式完成。");
    stopAutoMode();
    return;
  }

  console.log(`自动模式：执行步骤 ${currentAutoStep}`);
  
  // 绘制当前步骤
  navigateToStep(currentAutoStep);
  updateStepUI(currentAutoStep);
  
  // 清除任何现有超时
  if (autoModeTimeoutId) {
    clearTimeout(autoModeTimeoutId);
  }
  
  // 安排下一步并进行安全检查
  autoModeTimeoutId = setTimeout(() => {
    if (isAutoModeActive) { // 在超时期间再次检查模式是否被停止
      console.log(`自动模式：前进到步骤 ${currentAutoStep + 1}`);
      currentAutoStep++;
      executeAutoStep();
    }
  }, config.autoModeStepDelay || 2500); // 提供备用延迟值
}

// 导航到特定步骤的可视化函数
function navigateToStep(targetStep) {
  // 如果目标无效或已在该步骤，则不导航
  if (targetStep === currentActiveStep && targetStep !== 0) {
     console.log(`已在步骤 ${targetStep}`);
     return;
  }

  // 停止任何正在进行的动画
  gsap.killTweensOf(layer.getChildren());

  // 处理向后导航：从当前步骤向下清除到目标 + 1
  if (targetStep < currentActiveStep) {
    console.log(`从 ${currentActiveStep} 向后移动到 ${targetStep}`);
    for (let i = currentActiveStep; i > targetStep; i--) {
      clearElementsForStep(i);
    }
    
    // 在步骤 4 之前向后移动时隐藏比值显示
    if (targetStep < 4) {
      const ratioDisplay = document.getElementById('ratio-display');
      if (ratioDisplay) {
        ratioDisplay.style.display = 'none';
      }
    }
  }
  // 处理向前导航：从当前 + 1 向上绘制到目标
  else if (targetStep > currentActiveStep) {
    console.log(`从 ${currentActiveStep} 向前移动到 ${targetStep}`);
    // 在自动模式下始终使用动画
    const animateFinalStep = isAutoModeActive || true;

    for (let i = currentActiveStep + 1; i <= targetStep; i++) {
      const animate = (i === targetStep) && animateFinalStep;
      console.log(`绘制步骤 ${i} (动画: ${animate})`);
      
      // 动态调用正确的 drawStep 函数
      const drawFunctionName = `drawStep${i}`;
      if (typeof window[drawFunctionName] === 'function') {
         window[drawFunctionName](animate);
      } else {
         console.error(`错误：未找到函数 ${drawFunctionName}。`);
      }
    }
  } else if (targetStep === 0 && currentActiveStep > 0) {
      // 处理清除（目标步骤 0 从非零状态）
      console.log(`从步骤 ${currentActiveStep} 清除`);
      for (let i = currentActiveStep; i > 0; i--) {
          clearElementsForStep(i);
      }
      
      // 隐藏比值显示
      const ratioDisplay = document.getElementById('ratio-display');
      if (ratioDisplay) {
        ratioDisplay.style.display = 'none';
      }
  }

  // 更新当前步骤跟踪器
  currentActiveStep = targetStep;

  // 确保绘制最终状态
  layer.batchDraw();
}

// 清除与特定步骤号关联的元素
function clearElementsForStep(stepNum) {
  if (!stepElementKeys[stepNum]) {
    console.warn(`未为步骤 ${stepNum} 定义元素键`);
    return;
  }

  console.log(`清除步骤 ${stepNum} 的元素`);
  const keysToClear = stepElementKeys[stepNum];
  let clearedCount = 0;

  keysToClear.forEach(key => {
    if (elements[key]) {
      // 处理元素可能是数组的情况
      if (Array.isArray(elements[key])) {
         elements[key].forEach(el => { 
           if(el && typeof el.destroy === 'function') {
             console.log(`销毁数组元素 ${key}`);
             el.destroy(); 
           }
         });
      } else if (elements[key] instanceof Konva.Node) {
         console.log(`销毁 Konva 节点 ${key}`);
         elements[key].destroy(); // 销毁 Konva 节点
      } else {
         console.warn(`元素 ${key} 既不是数组也不是 Konva 节点。类型: ${typeof elements[key]}`);
      }
      delete elements[key]; // 从我们的跟踪器中移除引用
      clearedCount++;
    } else {
      console.warn(`在清除步骤 ${stepNum} 时未在元素映射中找到元素 ${key}`);
    }
  });

  // 如果存在此步骤的步骤解释文本，也清除它
  if (elements.stepExplanation) {
      elements.stepExplanation.destroy();
      delete elements.stepExplanation;
  }

  console.log(`为步骤 ${stepNum} 清除了 ${clearedCount} 个元素组/元素。`);
  // 清除后需要重绘
  layer.batchDraw();
}

// 更新步骤列表 UI 中的活动状态
function updateStepUI(activeStep) {
  const stepsList = document.getElementById('steps-list');
  const stepItems = stepsList.querySelectorAll('li[data-step]');

  stepItems.forEach(item => {
    const stepAttr = item.getAttribute('data-step');
    // 使用 == 进行字符串/数字比较灵活性
    if (stepAttr == activeStep) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// 清除画布函数 - 重置所有内容
function clearCanvas() {
  console.log("完全清除画布。");
  stopAutoMode(); // 清除时确保自动模式已停止

  gsap.killTweensOf(layer.getChildren()); // 停止任何运行中的动画
  layer.destroyChildren(); // 从主图层移除所有形状
  elements = {}; // 清除引用
  currentActiveStep = 0; // 重置步骤计数器
  
  // 重置交互性状态
  isDraggable = false;

  // 隐藏比值显示
  const ratioDisplay = document.getElementById('ratio-display');
  if (ratioDisplay) {
    ratioDisplay.style.display = 'none';
  }

  layer.batchDraw();
}
