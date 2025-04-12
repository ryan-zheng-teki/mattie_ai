/**
 * 椭圆比值问题可视化的步骤函数
 * 这些函数逐步绘制元素。
 */

// 检查先决条件并在需要时调用前置步骤的辅助函数
function ensurePrerequisites(requiredStep, currentStepFunction) {
    if (currentActiveStep < requiredStep) {
        console.warn(`步骤 ${requiredStep} 的先决条件未满足于 ${currentStepFunction}。绘制先决条件。`);
        // 为所需步骤查找函数并非动画调用
        const prerequisiteFunctionName = `drawStep${requiredStep}`;
        if (typeof window[prerequisiteFunctionName] === 'function') {
            window[prerequisiteFunctionName](false); // 无动画绘制先决条件
        } else {
            console.error(`错误：找不到先决条件函数 ${prerequisiteFunctionName}。`);
            return false; // 表示失败
        }
    }
    // 另外检查先决条件步骤的核心元素是否实际存在
    const prerequisiteKeys = stepElementKeys[requiredStep];
    if (prerequisiteKeys && prerequisiteKeys.length > 0) {
        const firstKey = prerequisiteKeys[0]; // 检查关键元素的存在
        if (!elements[firstKey]) {
             console.error(`错误：即使在绘制后，步骤 ${requiredStep} 的先决条件元素似乎丢失。`);
             // 尝试再次绘制？或抛出错误？为了稳健性，让我们尝试再次绘制。
             const prerequisiteFunctionName = `drawStep${requiredStep}`;
             if (typeof window[prerequisiteFunctionName] === 'function') {
                 window[prerequisiteFunctionName](false); 
                 if (!elements[firstKey]) return false; // 再次失败
             } else {
                 return false;
             }
        }
    }
    return true; // 先决条件满足
}

// 步骤 1：绘制坐标系和椭圆 C 和 E
function drawStep1(withAnimation = true) {
  // 幂等性检查：如果步骤 1 的元素已经存在，什么都不做。
  if (elements.xAxis && elements.ellipseC && elements.ellipseE) {
    console.log("步骤 1 的元素已存在。跳过绘制。");
    if (withAnimation) {
      showStepExplanation("步骤 1：绘制坐标系和两个椭圆 C 和 E", 0.1);
    }
    return;
  }
  
  console.log(`执行步骤 1 (动画：${withAnimation})`);
  
  if (withAnimation) {
    showStepExplanation("步骤 1：绘制坐标系和两个椭圆 C 和 E");
  }
  
  // 绘制坐标系（x 和 y 轴）
  const xAxis = new Konva.Line({
    points: [0, config.origin.y, stage.width(), config.origin.y],
    stroke: config.colors.axes,
    strokeWidth: config.styles.axisWidth,
    visible: false
  });
  
  const yAxis = new Konva.Line({
    points: [config.origin.x, 0, config.origin.x, stage.height()],
    stroke: config.colors.axes,
    strokeWidth: config.styles.axisWidth,
    visible: false
  });
  
  // 添加 x 和 y 轴标签
  const xLabel = new Konva.Text({
    x: stage.width() - 20,
    y: config.origin.y + 10,
    text: 'x',
    fontSize: config.styles.labelFontSize,
    fontStyle: 'italic',
    fill: config.colors.labels,
    visible: false
  });
  
  const yLabel = new Konva.Text({
    x: config.origin.x - 20,
    y: 10,
    text: 'y',
    fontSize: config.styles.labelFontSize,
    fontStyle: 'italic',
    fill: config.colors.labels,
    visible: false
  });
  
  // 添加原点和标签
  const { point: pointO, text: textO } = createPointWithLabel(
    config.origin,
    'O',
    config.colors.pointO,
    -20, // X 偏移
    10    // Y 偏移
  );
  
  // 创建椭圆 C
  const ellipseC = new Konva.Ellipse({
    x: config.origin.x,
    y: config.origin.y,
    radiusX: config.ellipseC.a * config.scale,
    radiusY: config.ellipseC.b * config.scale,
    stroke: config.colors.ellipseC,
    strokeWidth: config.styles.ellipseWidth,
    dash: config.styles.ellipseDashC,
    visible: false
  });
  
  // 创建椭圆 E
  const ellipseE = new Konva.Ellipse({
    x: config.origin.x,
    y: config.origin.y,
    radiusX: config.ellipseE.a * config.scale,
    radiusY: config.ellipseE.b * config.scale,
    stroke: config.colors.ellipseE,
    strokeWidth: config.styles.ellipseWidth,
    dash: config.styles.ellipseDashE,
    visible: false
  });
  
  // 创建椭圆标签
  const labelC = new Konva.Text({
    x: config.origin.x + config.ellipseC.a * config.scale + 5,
    y: config.origin.y,
    text: 'C: x²/4 + y² = 1',
    fontSize: config.styles.labelFontSize - 2,
    fill: config.colors.ellipseC,
    visible: false
  });
  
  const labelE = new Konva.Text({
    x: config.origin.x + config.ellipseE.a * config.scale + 5,
    y: config.origin.y - 20,
    text: 'E: x²/16 + y²/4 = 1',
    fontSize: config.styles.labelFontSize - 2,
    fill: config.colors.ellipseE,
    visible: false
  });
  
  // 添加关于椭圆的额外解释
  const ellipsesExplanation = new Konva.Text({
    x: config.origin.x,
    y: config.origin.y + config.ellipseE.b * config.scale + 30,
    text: '注意：椭圆 E 的 x 和 y 尺寸均是椭圆 C 的两倍',
    fontSize: config.styles.labelFontSize - 2,
    fill: '#333',
    align: 'center',
    width: 300,
    visible: false,
    opacity: 0
  });
  ellipsesExplanation.offsetX(ellipsesExplanation.width() / 2);
  
  // 将元素添加到图层
  layer.add(xAxis, yAxis, xLabel, yLabel, ellipseC, ellipseE, labelC, labelE, ellipsesExplanation);
  
  // 存储引用
  elements.xAxis = xAxis;
  elements.yAxis = yAxis;
  elements.xLabel = xLabel;
  elements.yLabel = yLabel;
  elements.pointO = pointO;
  elements.textO = textO;
  elements.ellipseC = ellipseC;
  elements.ellipseE = ellipseE;
  elements.labelC = labelC;
  elements.labelE = labelE;
  elements.ellipsesExplanation = ellipsesExplanation;
  
  if (withAnimation) {
    // 动画显示坐标轴
    xAxis.visible(true);
    yAxis.visible(true);
    
    const axisTimeline = gsap.timeline();
    
    axisTimeline
      .fromTo(xAxis, { opacity: 0 }, { opacity: 1, duration: config.animDuration * 0.4 })
      .fromTo(yAxis, { opacity: 0 }, { opacity: 1, duration: config.animDuration * 0.4 }, "-=0.2")
      .to(xLabel, { visible: true, opacity: 1, duration: config.animDuration * 0.3 })
      .to(yLabel, { visible: true, opacity: 1, duration: config.animDuration * 0.3 }, "-=0.1")
      .then(() => {
        // 动画显示原点
        animatePointAppearing(pointO, textO, config.animDuration * 0.4)
          .then(() => {
            // 动画显示椭圆
            animateEllipseDrawing(ellipseC, config.animDuration * 0.6)
              .then(() => {
                labelC.visible(true);
                gsap.to(labelC, { opacity: 1, duration: config.animDuration * 0.3 });
                
                // 椭圆 C 之后显示椭圆 E
                animateEllipseDrawing(ellipseE, config.animDuration * 0.6, config.animDuration * 0.1)
                  .then(() => {
                    labelE.visible(true);
                    gsap.to(labelE, { opacity: 1, duration: config.animDuration * 0.3 });
                    
                    // 显示额外的解释
                    ellipsesExplanation.visible(true);
                    gsap.to(ellipsesExplanation, { 
                      opacity: 1, 
                      duration: config.animDuration * 0.5,
                      delay: config.animDuration * 0.3
                    });
                  });
              });
          });
      });
  } else {
    // 无动画：仅使所有元素可见
    [xAxis, yAxis, xLabel, yLabel, pointO, textO, ellipseC, ellipseE, labelC, labelE, ellipsesExplanation].forEach(el => {
      el.visible(true);
      el.opacity(1);
    });
    layer.batchDraw();
  }
}

// 步骤 2：在椭圆 C 上选择点 P
function drawStep2(withAnimation = true) {
  // 先决条件检查
  if (!ensurePrerequisites(1, 'drawStep2')) return;
  
  // 幂等性检查
  if (elements.pointP && elements.textP) {
    console.log("步骤 2 的元素已存在。跳过绘制。");
    if (withAnimation) {
      showStepExplanation("步骤 2：在椭圆 C 上选择点 P", 0.1);
    }
    return;
  }
  console.log(`执行步骤 2 (动画：${withAnimation})`);
  
  if (withAnimation) {
    showStepExplanation("步骤 2：在椭圆 C 上选择点 P");
  }
  
  // 根据配置的角度计算点 P 的初始位置
  const angle = config.initialAngle;
  const px = config.origin.x + config.scale * config.ellipseC.a * Math.cos(angle);
  const py = config.origin.y - config.scale * config.ellipseC.b * Math.sin(angle);
  
  // 用点 P 的位置更新配置
  config.pointP = { x: px, y: py };
  
  // 创建点 P 及其标签
  const { point: pointP, text: textP } = createPointWithLabel(
    config.pointP,
    'P',
    config.colors.pointP
  );
  
  // 为点 P 添加解释
  const pointPExplanation = new Konva.Text({
    x: px + 25,
    y: py - 40,
    text: 'P 是椭圆 C 上的任意点\nP = (2cos(θ), sin(θ))',
    fontSize: 14,
    fill: config.colors.pointP,
    visible: false,
    opacity: 0
  });
  layer.add(pointPExplanation);
  
  // 存储引用
  elements.pointP = pointP;
  elements.textP = textP;
  elements.pointPExplanation = pointPExplanation;
  
  if (withAnimation) {
    // 沿椭圆动画"选择"点 P
    // 创建一个沿椭圆 C 移动的临时指示器
    const indicator = new Konva.Circle({
      x: config.origin.x + config.scale * config.ellipseC.a,
      y: config.origin.y,
      radius: config.styles.pointRadius + 2,
      stroke: config.colors.pointP,
      strokeWidth: 2,
      dash: [3, 3],
      opacity: 0.8
    });
    layer.add(indicator);
    
    // 动画指示器沿椭圆部分移动，最后停在 P 处
    gsap.to({}, {
      duration: config.animDuration * 1.2,
      onUpdate: function() {
        const progress = this.progress();
        // 从 0 移动到所需角度
        const currentAngle = progress * angle;
        const x = config.origin.x + config.scale * config.ellipseC.a * Math.cos(currentAngle);
        const y = config.origin.y - config.scale * config.ellipseC.b * Math.sin(currentAngle);
        indicator.x(x);
        indicator.y(y);
        layer.batchDraw();
      },
      onComplete: () => {
        // 淡出指示器
        gsap.to(indicator, {
          opacity: 0,
          duration: config.animDuration * 0.3,
          onComplete: () => {
            indicator.destroy();
            // 在选定位置动画显示点 P
            animatePointAppearing(pointP, textP, config.animDuration * 0.4)
              .then(() => {
                // 显示解释
                pointPExplanation.visible(true);
                gsap.to(pointPExplanation, { 
                  opacity: 1, 
                  duration: config.animDuration * 0.5 
                });
              });
          }
        });
      }
    });
  } else {
    // 无动画：使元素可见
    pointP.visible(true).opacity(1);
    textP.visible(true).opacity(1);
    pointPExplanation.visible(true).opacity(1);
    layer.batchDraw();
  }
}

// 步骤 3：绘制射线 OP 并找出与椭圆 E 的交点 Q
function drawStep3(withAnimation = true) {
  // 先决条件检查
  if (!ensurePrerequisites(2, 'drawStep3')) return;
  
  // 幂等性检查
  if (elements.rayOP && elements.pointQ) {
    console.log("步骤 3 的元素已存在。跳过绘制。");
    if (withAnimation) {
      showStepExplanation("步骤 3：绘制射线 OP 并找出其与椭圆 E 的交点 Q", 0.1);
    }
    return;
  }
  console.log(`执行步骤 3 (动画：${withAnimation})`);
  
  if (withAnimation) {
    showStepExplanation("步骤 3：绘制射线 OP 并找出其与椭圆 E 的交点 Q");
  }
  
  // 获取坐标
  const ox = config.origin.x;
  const oy = config.origin.y;
  const px = config.pointP.x;
  const py = config.pointP.y;
  
  // 计算射线向量
  const rayVector = { x: px - ox, y: py - oy };
  
  // 计算点 Q（沿射线正好是 O 到 P 距离的两倍）
  const qx = ox + 2 * rayVector.x;
  const qy = oy + 2 * rayVector.y;
  
  // 更新配置中的点 Q
  config.pointQ = { x: qx, y: qy };
  
  // 为了视觉清晰，将射线稍微延伸超过 Q
  const extendedQx = ox + 2.5 * rayVector.x;
  const extendedQy = oy + 2.5 * rayVector.y;
  
  // 创建延伸到 Q 及其之外的射线 OP
  const rayOP = new Konva.Line({
    points: [ox, oy, extendedQx, extendedQy],
    stroke: config.colors.rayOP,
    strokeWidth: config.styles.rayWidth,
    visible: false
  });
  
  // 创建点 Q 及其标签
  const { point: pointQ, text: textQ } = createPointWithLabel(
    config.pointQ,
    'Q',
    config.colors.pointQ
  );
  
  // 为射线 OP 和点 Q 添加解释
  const rayExplanation = new Konva.Text({
    x: (ox + px) / 2 + 20,
    y: (oy + py) / 2 - 30,
    text: '射线 OP',
    fontSize: 14,
    fill: config.colors.rayOP,
    visible: false,
    opacity: 0
  });
  
  const pointQExplanation = new Konva.Text({
    x: qx + 25,
    y: qy - 40,
    text: 'Q 是射线 OP 与椭圆 E 的交点\nQ = (4cos(θ), 2sin(θ)) = 2P',
    fontSize: 14,
    fill: config.colors.pointQ,
    visible: false,
    opacity: 0
  });
  
  // 将元素添加到图层
  layer.add(rayOP, rayExplanation, pointQExplanation);
  
  // 存储引用
  elements.rayOP = rayOP;
  elements.pointQ = pointQ;
  elements.textQ = textQ;
  elements.rayExplanation = rayExplanation;
  elements.pointQExplanation = pointQExplanation;
  
  if (withAnimation) {
    // 动画绘制射线
    animateDrawLine(rayOP, config.animDuration * 0.7)
      .then(() => {
        // 显示射线解释
        rayExplanation.visible(true);
        gsap.to(rayExplanation, { 
          opacity: 1, 
          duration: config.animDuration * 0.3 
        });
        
        // 射线绘制后，动画显示点 Q
        animatePointAppearing(pointQ, textQ, config.animDuration * 0.4, 0.1)
          .then(() => {
            // 显示点 Q 解释
            pointQExplanation.visible(true);
            gsap.to(pointQExplanation, { 
              opacity: 1, 
              duration: config.animDuration * 0.5 
            });
          });
      });
  } else {
    // 无动画：使元素可见
    rayOP.visible(true).opacity(1);
    pointQ.visible(true).opacity(1);
    textQ.visible(true).opacity(1);
    rayExplanation.visible(true).opacity(1);
    pointQExplanation.visible(true).opacity(1);
    layer.batchDraw();
  }
}

// 步骤 4：计算并显示比值 |OQ|/|OP|
function drawStep4(withAnimation = true) {
  // 先决条件检查
  if (!ensurePrerequisites(3, 'drawStep4')) return;
  
  // 幂等性检查 - 使用比值显示而非特定元素
  const ratioDisplay = document.getElementById('ratio-display');
  if (ratioDisplay && ratioDisplay.style.display === 'block') {
    console.log("步骤 4 的元素已存在。跳过绘制。");
    if (withAnimation) {
      showStepExplanation("步骤 4：计算并显示比值 |OQ|/|OP|", 0.1);
    }
    return;
  }
  console.log(`执行步骤 4 (动画：${withAnimation})`);
  
  if (withAnimation) {
    showStepExplanation("步骤 4：计算并显示比值 |OQ|/|OP|");
  }
  
  // 获取坐标
  const ox = config.origin.x;
  const oy = config.origin.y;
  const px = config.pointP.x;
  const py = config.pointP.y;
  const qx = config.pointQ.x;
  const qy = config.pointQ.y;
  
  // 添加代数计算的解释
  const algebraicExplanation = new Konva.Text({
    x: config.origin.x,
    y: config.origin.y - config.ellipseE.b * config.scale - 80,
    text: '对于椭圆 C 上的任意点 P，射线 OP 与椭圆 E 相交于点 Q，\n其中 Q = 2P',
    fontSize: 16,
    fontStyle: 'bold',
    fill: config.colors.ratioHighlight,
    align: 'center',
    width: 400,
    visible: false,
    opacity: 0
  });
  algebraicExplanation.offsetX(algebraicExplanation.width() / 2);
  layer.add(algebraicExplanation);
  elements.algebraicExplanation = algebraicExplanation;
  
  if (withAnimation) {
    // 用视觉指示器动画显示计算
    animateRatioCalculation(
      { x: ox, y: oy }, // 点 O
      { x: px, y: py }, // 点 P
      { x: qx, y: qy }  // 点 Q
    ).then(() => {
      // 显示代数解释
      algebraicExplanation.visible(true);
      gsap.to(algebraicExplanation, { 
        opacity: 1, 
        duration: config.animDuration * 0.5 
      });
    });
  } else {
    // 不使用动画仅显示比值
    const distOP = Math.sqrt(Math.pow(px - ox, 2) + Math.pow(py - oy, 2));
    const distOQ = Math.sqrt(Math.pow(qx - ox, 2) + Math.pow(qy - oy, 2));
    const ratio = distOQ / distOP;
    
    // 更新 HTML 显示
    const ratioDisplay = document.getElementById('ratio-display');
    const ratioValue = document.getElementById('ratio-value');
    
    if (ratioDisplay && ratioValue) {
      ratioValue.textContent = ratio.toFixed(2);
      ratioDisplay.style.display = 'block';
    }
    
    // 显示代数解释
    algebraicExplanation.visible(true).opacity(1);
    layer.batchDraw();
  }
}

// 步骤 5：证明比值 |OQ|/|OP| = 2 是恒定的
function drawStep5(withAnimation = true) {
  // 先决条件检查
  if (!ensurePrerequisites(4, 'drawStep5')) return;
  
  console.log(`执行步骤 5 (动画：${withAnimation})`);
  
  if (withAnimation) {
    showStepExplanation("步骤 5：证明无论点 P 在椭圆 C 上的位置如何，比值 |OQ|/|OP| = 2 始终恒定");
  }
  
  // 添加最终数学解释
  const finalExplanation = new Konva.Text({
    x: config.origin.x,
    y: config.stageHeight - 50,
    text: '这个恒定的比值 2 出现是因为椭圆 E 在两个维度上相对于原点 O\n正好是椭圆 C 的两倍大小。',
    fontSize: 16,
    fontStyle: 'bold',
    fill: '#333',
    align: 'center',
    width: 500,
    visible: false,
    opacity: 0
  });
  finalExplanation.offsetX(finalExplanation.width() / 2);
  layer.add(finalExplanation);
  elements.finalExplanation = finalExplanation;
  
  // 如果将用动画证明替换，暂时隐藏比值显示
  if (withAnimation) {
    const ratioDisplay = document.getElementById('ratio-display');
    if (ratioDisplay) {
      // 演示后将再次显示
      ratioDisplay.style.display = 'none';
    }
    
    // 动画演示该比值是恒定的
    demonstrateConstantRatio(config.animDuration)
      .then(() => {
        // 显示最终解释
        finalExplanation.visible(true);
        gsap.to(finalExplanation, { 
          opacity: 1, 
          duration: config.animDuration * 0.5 
        });
        
        // 演示后，启用点 P 的拖动
        makePointPDraggable();
        
        // 再次显示比值显示
        if (ratioDisplay) {
          ratioDisplay.style.display = 'block';
        }
      });
  } else {
    // 无动画：仅使点 P 可拖动
    finalExplanation.visible(true).opacity(1);
    makePointPDraggable();
    layer.batchDraw();
  }
}
