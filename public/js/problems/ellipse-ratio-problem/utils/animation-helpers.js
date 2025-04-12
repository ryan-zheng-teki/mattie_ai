/**
 * 椭圆比值问题可视化的动画辅助函数
 */

// 在一个函数中创建带标签的点
function createPointWithLabel(point, label, color, labelOffsetX = 10, labelOffsetY = -20) {
  const pointObj = new Konva.Circle({
    x: point.x,
    y: point.y,
    radius: config.styles.pointRadius,
    fill: color,
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0
  });
  
  const textObj = new Konva.Text({
    x: point.x + labelOffsetX,
    y: point.y + labelOffsetY,
    text: label,
    fontSize: config.styles.labelFontSize,
    fontStyle: 'bold',
    fill: config.colors.labels,
    visible: false
  });
  
  layer.add(pointObj, textObj);
  
  return { point: pointObj, text: textObj };
}

// 动画绘制椭圆
function animateEllipseDrawing(ellipse, duration = config.animDuration, delay = 0) {
  return new Promise((resolve) => {
    ellipse.visible(true);
    ellipse.opacity(0);
    
    gsap.to(ellipse, {
      opacity: 1,
      duration: duration,
      delay: delay,
      ease: config.easing.draw,
      onComplete: () => {
        resolve(ellipse);
      }
    });
  });
}

// 动画显示带标签的点
function animatePointAppearing(pointObj, textObj, duration = config.animDuration * 0.3, delay = 0) {
  return new Promise((resolve) => {
    gsap.to(pointObj, {
      visible: true,
      duration: 0,
      delay: delay,
      onComplete: () => {
        gsap.from(pointObj, {
          scaleX: 0,
          scaleY: 0,
          opacity: 0,
          duration: duration,
          ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(textObj, { 
              visible: true, 
              opacity: 1, 
              duration: duration * 0.5,
              onComplete: resolve
            });
          }
        });
      }
    });
  });
}

// 动画从起点到终点绘制线段
function animateDrawLine(line, duration = config.animDuration, delay = 0) {
  return new Promise((resolve) => {
    const points = line.points();
    const startX = points[0];
    const startY = points[1]; 
    const endX = points[2];
    const endY = points[3];
    
    // 重置到起始位置
    line.points([startX, startY, startX, startY]);
    line.visible(true);
    
    // 动画绘制
    gsap.to({}, {
      duration: duration,
      delay: delay,
      onUpdate: function() {
        const progress = this.progress();
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        line.points([startX, startY, currentX, currentY]);
        layer.batchDraw();
      },
      ease: config.easing.draw,
      onComplete: () => {
        // 确保最终位置精确
        line.points([startX, startY, endX, endY]);
        layer.batchDraw();
        resolve(line);
      }
    });
  });
}

// 用动画显示步骤解释文本
function showStepExplanation(text, duration = 0.3) {
  if (elements.stepExplanation) {
    gsap.to(elements.stepExplanation, {
      opacity: 0,
      duration: duration,
      onComplete: () => {
        elements.stepExplanation.text(text);
        gsap.to(elements.stepExplanation, {
          opacity: 1,
          duration: duration
        });
      }
    });
  } else {
    elements.stepExplanation = new Konva.Text({
      x: 20,
      y: 20,
      text: text,
      fontSize: 16,
      fill: '#333',
      padding: 5,
      background: '#f0f0f0',
      cornerRadius: 3,
      opacity: 0
    });
    layer.add(elements.stepExplanation);
    gsap.to(elements.stepExplanation, {
      opacity: 1,
      duration: duration * 2
    });
  }
}

// 用视觉指示器动画显示比值计算
function animateRatioCalculation(pointO, pointP, pointQ, duration = config.animDuration) {
  return new Promise((resolve) => {
    // 创建长度的临时指示器
    const distOP = distance(pointO, pointP);
    const distOQ = distance(pointO, pointQ);
    const ratio = distOQ / distOP;
    
    // 创建 OP 线段并动画显示测量
    const lineOP = new Konva.Line({
      points: [pointO.x, pointO.y, pointP.x, pointP.y],
      stroke: config.colors.rayOP,
      strokeWidth: 3,
      dash: [5, 2],
      opacity: 0
    });
    layer.add(lineOP);
    
    // 创建 OQ 线段并动画显示测量
    const lineOQ = new Konva.Line({
      points: [pointO.x, pointO.y, pointQ.x, pointQ.y],
      stroke: config.colors.rayOQ,
      strokeWidth: 3,
      dash: [5, 2],
      opacity: 0
    });
    layer.add(lineOQ);
    
    // 创建距离的文本标签
    const opText = new Konva.Text({
      x: (pointO.x + pointP.x) / 2 + 15,
      y: (pointO.y + pointP.y) / 2 - 10,
      text: `|OP| = ${distOP.toFixed(2)}`,
      fontSize: 14,
      fill: config.colors.rayOP,
      background: 'rgba(255,255,255,0.7)',
      padding: 3,
      opacity: 0
    });
    
    const oqText = new Konva.Text({
      x: (pointO.x + pointQ.x) / 2 + 15,
      y: (pointO.y + pointQ.y) / 2 - 10,
      text: `|OQ| = ${distOQ.toFixed(2)}`,
      fontSize: 14,
      fill: config.colors.rayOQ,
      background: 'rgba(255,255,255,0.7)',
      padding: 3,
      opacity: 0
    });
    
    // 创建额外文本以强调关系
    const relationText = new Konva.Text({
      x: (pointO.x + pointQ.x) / 2 + 50,
      y: (pointO.y + pointQ.y) / 2 + 20,
      text: `|OQ| = 2 · |OP|`,
      fontSize: 16,
      fontStyle: 'bold',
      fill: config.colors.ratioHighlight,
      background: 'rgba(255,255,255,0.8)',
      padding: 5,
      opacity: 0
    });
    
    const ratioText = new Konva.Text({
      x: stage.width() / 2,
      y: 60,
      text: `|OQ| / |OP| = ${ratio.toFixed(2)}`,
      fontSize: 18,
      fontStyle: 'bold',
      fill: config.colors.ratioHighlight,
      align: 'center',
      padding: 5,
      background: 'rgba(255,255,255,0.8)',
      cornerRadius: 5,
      opacity: 0
    });
    ratioText.offsetX(ratioText.width() / 2); // 水平居中
    
    layer.add(opText, oqText, relationText, ratioText);
    
    // 按顺序动画显示测量线和文本
    gsap.timeline()
      .to(lineOP, { opacity: 1, duration: duration * 0.3 })
      .to(opText, { opacity: 1, duration: duration * 0.3 })
      .to(lineOQ, { opacity: 1, duration: duration * 0.3 })
      .to(oqText, { opacity: 1, duration: duration * 0.3 })
      .to(relationText, { opacity: 1, duration: duration * 0.3 })
      .to(ratioText, { 
        opacity: 1, 
        duration: duration * 0.5,
        onComplete: () => {
          // 脉动比值文本以强调
          gsap.to(ratioText, {
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 0.5,
            repeat: 1,
            yoyo: true,
            onComplete: () => {
              // 更新 HTML 比值显示
              const ratioDisplay = document.getElementById('ratio-display');
              const ratioValue = document.getElementById('ratio-value');
              
              if (ratioDisplay && ratioValue) {
                ratioValue.textContent = ratio.toFixed(2);
                ratioDisplay.style.display = 'block';
                ratioDisplay.classList.add('highlight');
                
                // 片刻后移除高亮
                setTimeout(() => {
                  ratioDisplay.classList.remove('highlight');
                }, 1000);
              }
              
              // 延迟后清理临时视觉元素
              setTimeout(() => {
                gsap.to([lineOP, lineOQ, opText, oqText, relationText, ratioText], {
                  opacity: 0,
                  duration: duration * 0.3,
                  onComplete: () => {
                    lineOP.destroy();
                    lineOQ.destroy();
                    opText.destroy();
                    oqText.destroy();
                    relationText.destroy();
                    ratioText.destroy();
                    layer.batchDraw();
                    resolve(ratio);
                  }
                });
              }, 3000); // 显示 3 秒
            }
          });
        }
      });
  });
}

// 显示数学公式或注释
function showMathAnnotation(text, position, duration = 0.5, delay = 0) {
  return new Promise((resolve) => {
    const annotation = new Konva.Text({
      x: position.x,
      y: position.y,
      text: text,
      fontSize: 18,
      fontStyle: 'bold',
      fill: '#333',
      padding: 8,
      background: 'rgba(255, 255, 255, 0.8)',
      cornerRadius: 5,
      shadowColor: 'black',
      shadowBlur: 4,
      shadowOffset: { x: 1, y: 1 },
      shadowOpacity: 0.2,
      opacity: 0
    });
    
    // 文本居中
    annotation.offsetX(annotation.width() / 2);
    
    layer.add(annotation);
    
    gsap.to(annotation, {
      opacity: 1,
      y: position.y - 10, // 轻微上浮动画
      duration: duration,
      delay: delay,
      ease: "power2.out",
      onComplete: () => resolve(annotation)
    });
    
    return annotation;
  });
}

// 用多个点演示恒定比值
function demonstrateConstantRatio(duration = config.animDuration) {
  return new Promise((resolve) => {
    // 为恒定比值创建视觉指示器
    const annotation = new Konva.Text({
      x: stage.width() / 2,
      y: 50,
      text: "对于椭圆 C 上的任意点 P，\n|OQ|/|OP| = 2",
      fontSize: 20,
      fontStyle: 'bold',
      fill: config.colors.ratioHighlight,
      align: 'center',
      padding: 10,
      background: 'rgba(255, 255, 255, 0.9)',
      cornerRadius: 8,
      shadowColor: 'black',
      shadowBlur: 6,
      shadowOffset: { x: 1, y: 1 },
      shadowOpacity: 0.3,
      opacity: 0
    });
    annotation.offsetX(annotation.width() / 2);
    
    // 创建解释为什么会出现这种情况的数学解释
    const mathExplanation = new Konva.Text({
      x: stage.width() / 2,
      y: 110,
      text: "这是因为：\n1. P 在椭圆 C 上的坐标为 (2cos(θ), sin(θ))\n2. 射线 OP 可以写为 t·(2cos(θ), sin(θ))，其中 t > 0\n3. 将其代入椭圆 E 的方程得到 t = 2\n4. 因此 Q = 2P = (4cos(θ), 2sin(θ))",
      fontSize: 16,
      fill: '#333',
      align: 'center',
      padding: 10,
      background: 'rgba(255, 255, 255, 0.9)',
      cornerRadius: 8,
      opacity: 0
    });
    mathExplanation.offsetX(mathExplanation.width() / 2);
    
    layer.add(annotation, mathExplanation);
    
    // 用动画显示注释
    gsap.to(annotation, {
      opacity: 1,
      duration: duration * 0.5,
      ease: "power2.out",
      onComplete: () => {
        // 显示数学解释
        gsap.to(mathExplanation, {
          opacity: 1,
          duration: duration * 0.5,
          ease: "power2.out"
        });
      }
    });
    
    // 创建角度数组以演示不同的点 P
    const angles = [0, Math.PI/6, Math.PI/3, Math.PI/2, 2*Math.PI/3, 5*Math.PI/6, Math.PI];
    let currentAngle = 0;
    
    // 创建沿椭圆 C 移动的圆形指示器
    const indicator = new Konva.Circle({
      x: 0,
      y: 0,
      radius: config.styles.pointRadius + 2,
      stroke: config.colors.pointP,
      strokeWidth: 2,
      dash: [3, 3],
      opacity: 0.8
    });
    layer.add(indicator);
    
    // 更新点 P 和相应点 Q 的函数
    function updatePoints(angle) {
      // 计算椭圆 C 上的点 P
      const px = config.origin.x + config.scale * config.ellipseC.a * Math.cos(angle);
      const py = config.origin.y - config.scale * config.ellipseC.b * Math.sin(angle);
      
      // 移动指示器以显示 P 的位置
      indicator.x(px);
      indicator.y(py);
      
      // 计算点 Q（从 O 到 P 的距离的两倍）
      const ox = config.origin.x;
      const oy = config.origin.y;
      const qx = ox + 2 * (px - ox);
      const qy = oy + 2 * (py - oy);
      
      // 创建临时射线指示器
      const ray = new Konva.Line({
        points: [ox, oy, qx, qy],
        stroke: config.colors.rayOP,
        strokeWidth: 1,
        dash: [4, 4],
        opacity: 0.6
      });
      layer.add(ray);
      
      // 创建临时点 Q 指示器
      const qIndicator = new Konva.Circle({
        x: qx,
        y: qy,
        radius: config.styles.pointRadius,
        fill: config.colors.pointQ,
        opacity: 0
      });
      layer.add(qIndicator);
      
      // 创建显示坐标的文本
      const coordsText = new Konva.Text({
        x: qx + 15,
        y: qy - 40,
        text: `P = (${(px-ox)/config.scale*2}, ${-(py-oy)/config.scale})\nQ = (${(qx-ox)/config.scale}, ${-(qy-oy)/config.scale}) = 2P`,
        fontSize: 12,
        fill: '#333',
        padding: 3,
        background: 'rgba(255,255,255,0.7)',
        opacity: 0
      });
      layer.add(coordsText);
      
      // 淡入临时元素
      gsap.to([ray, qIndicator, coordsText], {
        opacity: 0.8,
        duration: 0.3,
        onComplete: () => {
          // 简短延迟后淡出
          gsap.to([ray, qIndicator, coordsText], {
            opacity: 0,
            duration: 0.3,
            delay: 0.5,
            onComplete: () => {
              ray.destroy();
              qIndicator.destroy();
              coordsText.destroy();
              layer.batchDraw();
            }
          });
        }
      });
    }
    
    // 通过不同点动画指示器
    const animateNextPoint = () => {
      if (currentAngle >= angles.length) {
        // 动画系列完成
        gsap.to(indicator, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            indicator.destroy();
            layer.batchDraw();
            
            // 再次高亮结果文本
            const ratioDisplay = document.getElementById('ratio-display');
            if (ratioDisplay) {
              ratioDisplay.classList.add('highlight');
              setTimeout(() => {
                ratioDisplay.classList.remove('highlight');
              }, 1000);
            }
            
            // 延迟后清理并解决
            setTimeout(() => {
              gsap.to([annotation, mathExplanation], {
                opacity: 0,
                duration: duration * 0.3,
                onComplete: () => {
                  annotation.destroy();
                  mathExplanation.destroy();
                  resolve();
                }
              });
            }, 2000);
          }
        });
        return;
      }
      
      // 更新到下一个角度
      const angle = angles[currentAngle];
      updatePoints(angle);
      currentAngle++;
      
      // 安排下一次更新
      setTimeout(animateNextPoint, 1200);
    };
    
    // 注释出现后开始动画序列
    setTimeout(animateNextPoint, duration * 500);
  });
}
