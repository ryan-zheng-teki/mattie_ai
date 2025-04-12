/**
 * 椭圆比值问题的数学解决方案
 */

// 显示数学解释面板的函数
function showMathematicalExplanation() {
  const mathPanel = document.getElementById('math-explanation');
  if (mathPanel) {
    mathPanel.classList.add('visible');
  }
}

// 隐藏数学解释面板的函数
function hideMathematicalExplanation() {
  const mathPanel = document.getElementById('math-explanation');
  if (mathPanel) {
    mathPanel.classList.remove('visible');
  }
}

// 初始化数学解释面板的函数
function initMathExplanation() {
  const closeButton = document.getElementById('close-math-panel');
  const showMathButton = document.getElementById('show-math-button');
  
  if (closeButton) {
    closeButton.addEventListener('click', hideMathematicalExplanation);
  }
  
  if (showMathButton) {
    showMathButton.addEventListener('click', showMathematicalExplanation);
  }
  
  // 准备内容
  const mathContent = document.getElementById('math-content');
  if (mathContent) {
    mathContent.innerHTML = `
      <div class="math-step">
        <h4>步骤 1：参数表示</h4>
        <p>首先，让我们用参数方程表示椭圆上的点：</p>
        <p class="math">椭圆 C: x = 2cos(θ), y = sin(θ)</p>
        <p class="math">椭圆 E: x = 4cos(φ), y = 2sin(φ)</p>
        <p>其中 θ 和 φ 是参数。</p>
      </div>
      
      <div class="math-step">
        <h4>步骤 2：椭圆 C 上的点 P</h4>
        <p>设 P 是椭圆 C 上参数为 θ 的点：</p>
        <p class="math">P = (2cos(θ), sin(θ))</p>
        <p>我们可以验证该点满足椭圆 C 的方程：</p>
        <p class="math">(2cos(θ))²/4 + (sin(θ))² = cos²(θ) + sin²(θ) = 1</p>
      </div>
      
      <div class="math-step">
        <h4>步骤 3：射线 OP 方程</h4>
        <p>从原点 O 经过点 P 的射线可以参数化为：</p>
        <p class="math">r(t) = t · (2cos(θ), sin(θ)) 其中 t > 0</p>
        <p>其中 t 是正实数。注意当 t = 1 时得到点 P。</p>
      </div>
      
      <div class="math-step">
        <h4>步骤 4：求与椭圆 E 的交点</h4>
        <p>要找到射线 OP 与椭圆 E 的交点（点 Q），我们将射线方程代入椭圆 E 的方程：</p>
        <p class="math">(2t·cos(θ))²/16 + (t·sin(θ))²/4 = 1</p>
        <p>化简：</p>
        <p class="math">t²·cos²(θ)/4 + t²·sin²(θ)/4 = 1</p>
        <p class="math">t²/4 · (cos²(θ) + sin²(θ)) = 1</p>
        <p>由于 cos²(θ) + sin²(θ) = 1，我们得到：</p>
        <p class="math">t²/4 = 1</p>
        <p class="math">t² = 4</p>
        <p class="math">t = 2 (因为 t > 0)</p>
      </div>
      
      <div class="math-step">
        <h4>步骤 5：计算点 Q</h4>
        <p>在射线方程中使用 t = 2：</p>
        <p class="math">Q = r(2) = 2 · (2cos(θ), sin(θ)) = (4cos(θ), 2sin(θ))</p>
        <p>我们可以验证 Q 在椭圆 E 上：</p>
        <p class="math">(4cos(θ))²/16 + (2sin(θ))²/4 = cos²(θ) + sin²(θ) = 1</p>
      </div>
      
      <div class="math-step">
        <h4>步骤 6：计算比值 |OQ|/|OP|</h4>
        <p>现在我们可以计算比值 |OQ|/|OP|：</p>
        <p class="math">|OP| = √((2cos(θ))² + (sin(θ))²)</p>
        <p class="math">|OQ| = √((4cos(θ))² + (2sin(θ))²)</p>
        <p class="math">|OQ| = √(16cos²(θ) + 4sin²(θ))</p>
        <p class="math">|OQ| = 2·√(4cos²(θ) + sin²(θ))</p>
        <p class="math">|OQ|/|OP| = 2·√(4cos²(θ) + sin²(θ))/√(4cos²(θ) + sin²(θ)) = 2</p>
      </div>
      
      <div class="math-step">
        <h4>步骤 7：关键洞察</h4>
        <p>本质上的洞察是 Q = 2P（沿射线 OP 的方向）。这意味着：</p>
        <p class="math">对于椭圆 C 上的任意点 P，点 Q = 2P 总是位于椭圆 E 上。</p>
        <p>这解释了为什么比值 |OQ|/|OP| = 2 是恒定的，不论 P 在椭圆 C 上的位置如何。</p>
      </div>
      
      <div class="math-step">
        <h4>步骤 8：直观解释</h4>
        <p>您可以在交互式可视化的第 5 步中拖动点 P 来验证这一点。当 P 沿椭圆 C 移动时，Q 沿椭圆 E 移动，比值 |OQ|/|OP| 始终保持为 2。</p>
        <p>这种关系存在是因为椭圆 E 是椭圆 C 相对于原点的放大版本，放大比例为 2。</p>
      </div>
    `;
  }
}

// 当 DOM 加载完成时初始化
document.addEventListener('DOMContentLoaded', initMathExplanation);
