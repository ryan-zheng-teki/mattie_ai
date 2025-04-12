/**
 * 椭圆比值问题可视化的交互功能
 */

// 使点 P 沿椭圆 C 可拖动
function makePointPDraggable() {
  if (!elements.pointP || isDraggable) return;
  
  isDraggable = true;
  
  // 使 P 可拖动
  elements.pointP.draggable(true);
  
  // 添加点可拖动的视觉提示
  elements.pointP.on('mouseover', function() {
    document.body.style.cursor = 'pointer';
    this.strokeEnabled(true);
    this.stroke('#fff');
    this.strokeWidth(2);
    this.scale({ x: 1.2, y: 1.2 });
    layer.batchDraw();
  });
  
  elements.pointP.on('mouseout', function() {
    document.body.style.cursor = 'default';
    this.strokeEnabled(false);
    this.scale({ x: 1, y: 1 });
    layer.batchDraw();
  });
  
  // 当 P 被拖动时更新构造
  let dragThrottleTimeout = null;
  
  elements.pointP.on('dragmove', function() {
    // 清除任何现有超时
    if (dragThrottleTimeout) clearTimeout(dragThrottleTimeout);
    
    // 设置新的超时以更新构造
    dragThrottleTimeout = setTimeout(() => {
      // 将 P 限制在椭圆 C 上
      constrainPointToEllipseC(this);
      
      // 更新射线和点 Q
      updateRayOPAndPointQ();
      
      // 更新比值显示
      updateRatioDisplay();
      
      layer.batchDraw();
    }, 10); // 10ms 节流以获得流畅的性能
  });
  
  // 添加拖动帮助指示器
  const dragHelp = new Konva.Text({
    x: 20,
    y: 60,
    text: "沿椭圆 C 拖动点 P 以查看恒定比值",
    fontSize: 16,
    fill: '#777',
    padding: 10,
    background: '#f0f0f0',
    cornerRadius: 5,
    shadowColor: '#000',
    shadowBlur: 3,
    shadowOffset: { x: 1, y: 1 },
    shadowOpacity: 0.2
  });
  layer.add(dragHelp);
  elements.dragHelp = dragHelp;
  
  // 在 P 上显示简短动画以指示其可拖动
  gsap.to(elements.pointP, {
    scaleX: 1.3,
    scaleY: 1.3,
    duration: 0.5,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut"
  });
  
  layer.batchDraw();
}

// 限制点 P 始终保持在椭圆 C 上
function constrainPointToEllipseC(pointObject) {
  // 获取相对于原点的当前位置
  const ox = config.origin.x;
  const oy = config.origin.y;
  const px = pointObject.x();
  const py = pointObject.y();
  
  // 计算从中心到当前位置的角度
  let angle = Math.atan2(-(py - oy), px - ox); // 由于画布 y 是倒置的，y 为负数
  
  // 计算椭圆 C 上的受限位置
  const x = ox + config.scale * config.ellipseC.a * Math.cos(angle);
  const y = oy - config.scale * config.ellipseC.b * Math.sin(angle);
  
  // 更新点位置
  pointObject.x(x);
  pointObject.y(y);
  
  // 更新文本标签位置
  if (elements.textP) {
    elements.textP.x(x + 10);
    elements.textP.y(y - 20);
  }
  
  // 更新配置点
  config.pointP = { x, y };
  
  return { x, y, angle };
}

// 更新射线 OP 并计算点 Q
function updateRayOPAndPointQ() {
  const ox = config.origin.x;
  const oy = config.origin.y;
  const px = config.pointP.x;
  const py = config.pointP.y;
  
  // 计算射线向量
  const rayVector = { x: px - ox, y: py - oy };
  
  // 计算点 Q（沿射线正好是两倍远）
  const qx = ox + 2 * rayVector.x;
  const qy = oy + 2 * rayVector.y;
  
  // 更新配置点 Q
  config.pointQ = { x: qx, y: qy };
  
  // 如果存在，更新视觉元素
  if (elements.rayOP) {
    // 为了视觉清晰，将射线稍微延伸超过 Q
    const extendedQx = ox + 2.5 * rayVector.x;
    const extendedQy = oy + 2.5 * rayVector.y;
    elements.rayOP.points([ox, oy, extendedQx, extendedQy]);
  }
  
  if (elements.pointQ) {
    elements.pointQ.x(qx);
    elements.pointQ.y(qy);
  }
  
  if (elements.textQ) {
    elements.textQ.x(qx + 10);
    elements.textQ.y(qy - 20);
  }
}

// 用当前值更新比值显示
function updateRatioDisplay() {
  const ox = config.origin.x;
  const oy = config.origin.y;
  const px = config.pointP.x;
  const py = config.pointP.y;
  const qx = config.pointQ.x;
  const qy = config.pointQ.y;
  
  // 计算距离
  const distOP = Math.sqrt(Math.pow(px - ox, 2) + Math.pow(py - oy, 2));
  const distOQ = Math.sqrt(Math.pow(qx - ox, 2) + Math.pow(qy - oy, 2));
  
  // 计算比值
  const ratio = distOQ / distOP;
  
  // 更新 HTML 显示
  const ratioDisplay = document.getElementById('ratio-display');
  const ratioValue = document.getElementById('ratio-value');
  
  if (ratioDisplay && ratioValue) {
    ratioValue.textContent = ratio.toFixed(2);
    ratioDisplay.style.display = 'block';
  }
}

// 切换交互性 - 启用/禁用拖动模式
function toggleInteractivity(forceState) {
  if (forceState === false || isDraggable) {
    // 禁用拖动模式
    isDraggable = false;
    
    if (elements.pointP) {
      elements.pointP.draggable(false);
      // 移除事件监听器（可选 - 如果导致问题）
      elements.pointP.off('mouseover');
      elements.pointP.off('mouseout');
      elements.pointP.off('dragmove');
    }
    
    // 移除拖动帮助
    if (elements.dragHelp) {
      elements.dragHelp.destroy();
      elements.dragHelp = null;
    }
  } else {
    // 如果我们在步骤 5（需要先完成前面的步骤），则启用拖动模式
    if (currentActiveStep >= 3 && elements.pointP) {
      makePointPDraggable();
    }
  }
  
  layer.batchDraw();
}
