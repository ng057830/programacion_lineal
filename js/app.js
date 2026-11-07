// Application Logic for Programación Lineal - Problema del Vivero
// Antigravity Enhanced Edition

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  init3DPlot();
  init2DCanvas();
  initSimulator();
  initLevelSweep();
});

// ==========================================
// 1. TABS SYSTEM
// ==========================================
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // Re-trigger layout for canvas & plotly
      if (targetId === 'tab-3d') {
        const plotContainer = document.getElementById('plot-3d-container');
        if (window.Plotly && plotContainer) {
          Plotly.Plots.resize(plotContainer);
        }
      } else if (targetId === 'tab-2d') {
        draw2D();
      }
    });
  });
}

// ==========================================
// 2. 3D VISUALIZATION (PLOTLY)
// ==========================================
const vertices = [
  { name: 'O', x: 0,   y: 0,   z: 0 },
  { name: 'A', x: 0,   y: 300, z: 18000 },
  { name: 'B', x: 200, y: 180, z: 20800 }, // Optimal
  { name: 'C', x: 300, y: 60,  z: 18600 }
];

function init3DPlot() {
  const container = document.getElementById('plot-3d-container');
  if (!container || !window.Plotly) return;

  // Vertices for 2D Base in z=0
  const base_x = [0, 0, 200, 300];
  const base_y = [0, 300, 180, 60];
  const base_z = [0, 0, 0, 0];

  // Vertices for Roof in z=50x + 60y
  const roof_x = [0, 0, 200, 300];
  const roof_y = [0, 300, 180, 60];
  const roof_z = [0, 18000, 20800, 18600];

  // Triangles for base and roof (0-1-2 and 0-2-3)
  const i_quad = [0, 0];
  const j_quad = [1, 2];
  const k_quad = [2, 3];

  // Traces for Scene 1 (Base Factible en z=0)
  const traceBaseMesh1 = {
    type: 'mesh3d',
    x: base_x, y: base_y, z: base_z,
    i: i_quad, j: j_quad, k: k_quad,
    color: '#38bdf8',
    opacity: 0.65,
    flatshading: true,
    lighting: { ambient: 0.8, diffuse: 0.8 },
    hoverinfo: 'skip',
    scene: 'scene'
  };

  const traceBasePerimeter1 = {
    type: 'scatter3d',
    x: [0, 0, 200, 300, 0],
    y: [0, 300, 180, 60, 0],
    z: [0, 0, 0, 0, 0],
    mode: 'lines',
    line: { color: '#0284c7', width: 6 },
    hoverinfo: 'skip',
    scene: 'scene'
  };

  const traceBaseMarkers1 = {
    type: 'scatter3d',
    x: base_x, y: base_y, z: base_z,
    mode: 'markers+text',
    text: ['O(0,0)', 'A(0,300)', 'B(200,180)', 'C(300,60)'],
    textposition: 'top center',
    textfont: { family: 'Inter, sans-serif', size: 12, color: '#0f172a' },
    marker: { color: '#0369a1', size: 6 },
    customdata: [
      'O(0, 0) · Beneficio: 0 €',
      'A(0, 300) · Beneficio: 18.000 €',
      'B(200, 180) · Beneficio: 20.800 € (MÁXIMO)',
      'C(300, 60) · Beneficio: 18.600 €'
    ],
    hovertemplate: '<b>%{text}</b><br>%{customdata}<extra></extra>',
    scene: 'scene'
  };

  // Traces for Scene 2 (Prisma Truncado)
  // Base ghost
  const traceBaseGhost2 = {
    type: 'mesh3d',
    x: base_x, y: base_y, z: base_z,
    i: i_quad, j: j_quad, k: k_quad,
    color: '#94a3b8',
    opacity: 0.25,
    hoverinfo: 'skip',
    scene: 'scene2'
  };

  // Base outline
  const traceBasePerimeter2 = {
    type: 'scatter3d',
    x: [0, 0, 200, 300, 0],
    y: [0, 300, 180, 60, 0],
    z: [0, 0, 0, 0, 0],
    mode: 'lines',
    line: { color: '#64748b', dash: 'dash', width: 4 },
    hoverinfo: 'skip',
    scene: 'scene2'
  };

  // 4 Vertical Lateral Walls
  // Wall 1: O -> A
  const wall1 = {
    type: 'mesh3d',
    x: [0, 0, 0, 0],
    y: [0, 300, 300, 0],
    z: [0, 0, 18000, 0],
    i: [0, 0], j: [1, 2], k: [2, 3],
    color: '#06b6d4',
    opacity: 0.25,
    lighting: { ambient: 0.7, diffuse: 0.8 },
    hoverinfo: 'skip',
    scene: 'scene2'
  };

  // Wall 2: A -> B
  const wall2 = {
    type: 'mesh3d',
    x: [0, 200, 200, 0],
    y: [300, 180, 180, 300],
    z: [0, 0, 20800, 18000],
    i: [0, 0], j: [1, 2], k: [2, 3],
    color: '#06b6d4',
    opacity: 0.25,
    lighting: { ambient: 0.7, diffuse: 0.8 },
    hoverinfo: 'skip',
    scene: 'scene2'
  };

  // Wall 3: B -> C
  const wall3 = {
    type: 'mesh3d',
    x: [200, 300, 300, 200],
    y: [180, 60, 60, 180],
    z: [0, 0, 18600, 20800],
    i: [0, 0], j: [1, 2], k: [2, 3],
    color: '#06b6d4',
    opacity: 0.25,
    lighting: { ambient: 0.7, diffuse: 0.8 },
    hoverinfo: 'skip',
    scene: 'scene2'
  };

  // Wall 4: C -> O
  const wall4 = {
    type: 'mesh3d',
    x: [300, 0, 0, 300],
    y: [60, 0, 0, 60],
    z: [0, 0, 0, 18600],
    i: [0, 0], j: [1, 2], k: [2, 3],
    color: '#06b6d4',
    opacity: 0.25,
    lighting: { ambient: 0.7, diffuse: 0.8 },
    hoverinfo: 'skip',
    scene: 'scene2'
  };

  // Vertical Ribs (Columns at vertices)
  const ribs = {
    type: 'scatter3d',
    x: [0, 0, null, 0, 0, null, 200, 200, null, 300, 300],
    y: [0, 0, null, 300, 300, null, 180, 180, null, 60, 60],
    z: [0, 0, null, 0, 18000, null, 0, 20800, null, 0, 18600],
    mode: 'lines',
    line: { color: '#0891b2', width: 4 },
    hoverinfo: 'skip',
    scene: 'scene2'
  };

  // Roof Surface (z = 50x + 60y)
  const roofMesh = {
    type: 'mesh3d',
    x: roof_x, y: roof_y, z: roof_z,
    i: i_quad, j: j_quad, k: k_quad,
    intensity: roof_z,
    colorscale: [
      [0, '#38bdf8'],
      [0.5, '#f59e0b'],
      [1, '#10b981']
    ],
    showscale: false,
    opacity: 0.9,
    flatshading: true,
    lighting: { ambient: 0.85, diffuse: 0.8 },
    hoverinfo: 'skip',
    scene: 'scene2'
  };

  // Roof Perimeter Line
  const roofPerimeter = {
    type: 'scatter3d',
    x: [0, 0, 200, 300, 0],
    y: [0, 300, 180, 60, 0],
    z: [0, 18000, 20800, 18600, 0],
    mode: 'lines',
    line: { color: '#047857', width: 6 },
    hoverinfo: 'skip',
    scene: 'scene2'
  };

  // Roof Markers
  const roofMarkers = {
    type: 'scatter3d',
    x: roof_x, y: roof_y, z: roof_z,
    mode: 'markers+text',
    text: ["O'(0,0,0)", "A'(0,300,18k)", "B'(200,180,20.8k)", "C'(300,60,18.6k)"],
    textposition: 'top center',
    textfont: { family: 'Inter, sans-serif', size: 12, color: '#0f172a' },
    marker: {
      color: ['#0284c7', '#0891b2', '#10b981', '#f59e0b'],
      size: [6, 7, 10, 7]
    },
    customdata: [
      'Beneficio: 0 €',
      'Beneficio: 18.000 €',
      'Beneficio: 20.800 € ★ MÁXIMO GLOBAL',
      'Beneficio: 18.600 €'
    ],
    hovertemplate: '<b>%{text}</b><br>%{customdata}<extra></extra>',
    scene: 'scene2'
  };

  // Highlight Drop-down Beacon for Optimal Vertex B'
  const optimalBeacon = {
    type: 'scatter3d',
    x: [200, 200],
    y: [180, 180],
    z: [0, 20800],
    mode: 'lines+markers',
    line: { color: '#10b981', width: 7, dash: 'solid' },
    marker: { color: '#10b981', size: [8, 12] },
    hoverinfo: 'skip',
    scene: 'scene2'
  };

  const data = [
    traceBaseMesh1, traceBasePerimeter1, traceBaseMarkers1,
    traceBaseGhost2, traceBasePerimeter2,
    wall1, wall2, wall3, wall4, ribs,
    roofMesh, roofPerimeter, roofMarkers, optimalBeacon
  ];

  const axisConfig = (titleText) => ({
    title: { text: titleText, font: { family: 'Inter', size: 12, color: '#1e293b' } },
    backgroundcolor: '#f8fafc',
    gridcolor: '#e2e8f0',
    showbackground: true,
    zerolinecolor: '#94a3b8',
    tickfont: { family: 'Inter', size: 10, color: '#64748b' }
  });

  const layout = {
    autosize: true,
    height: 650,
    margin: { l: 0, r: 0, t: 50, b: 0 },
    paper_bgcolor: '#ffffff',
    showlegend: false,
    scene: {
      domain: { x: [0.0, 0.48], y: [0.0, 1.0] },
      xaxis: { ...axisConfig('Producto A (x) [m³]'), range: [-20, 360] },
      yaxis: { ...axisConfig('Producto B (y) [m³]'), range: [-20, 340] },
      zaxis: { ...axisConfig('Plano Suelo z = 0'), range: [0, 22000] },
      aspectratio: { x: 1, y: 1, z: 0.75 },
      camera: { eye: { x: 1.6, y: -1.7, z: 1.3 } }
    },
    scene2: {
      domain: { x: [0.52, 1.0], y: [0.0, 1.0] },
      xaxis: { ...axisConfig('Producto A (x) [m³]'), range: [-20, 360] },
      yaxis: { ...axisConfig('Producto B (y) [m³]'), range: [-20, 340] },
      zaxis: { ...axisConfig('Beneficio B(x,y) [€]'), range: [0, 22000] },
      aspectratio: { x: 1, y: 1, z: 0.75 },
      camera: { eye: { x: 1.6, y: -1.7, z: 1.3 } }
    },
    annotations: [
      {
        text: '<b>1 · Región Factible en Suelo (z = 0)</b>',
        showarrow: false,
        x: 0.24, y: 1.0,
        xref: 'paper', yref: 'paper',
        xanchor: 'center', yanchor: 'bottom',
        font: { family: 'Inter', size: 15, color: '#1e3a8a' }
      },
      {
        text: '<b>2 · Prisma Truncado por Techo z = 50x + 60y</b>',
        showarrow: false,
        x: 0.76, y: 1.0,
        xref: 'paper', yref: 'paper',
        xanchor: 'center', yanchor: 'bottom',
        font: { family: 'Inter', size: 15, color: '#065f46' }
      }
    ]
  };

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso3d', 'select3d'],
    toImageButtonOptions: {
      format: 'png',
      filename: 'prisma_programacion_lineal_vivero',
      height: 900,
      width: 1600
    }
  };

  Plotly.newPlot(container, data, layout, config);

  // Quick Camera Presets
  const btnIso = document.getElementById('btn-cam-iso');
  const btnTop = document.getElementById('btn-cam-top');
  const btnFront = document.getElementById('btn-cam-front');

  if (btnIso) {
    btnIso.addEventListener('click', () => {
      Plotly.relayout(container, {
        'scene.camera': { eye: { x: 1.6, y: -1.7, z: 1.3 } },
        'scene2.camera': { eye: { x: 1.6, y: -1.7, z: 1.3 } }
      });
    });
  }

  if (btnTop) {
    btnTop.addEventListener('click', () => {
      Plotly.relayout(container, {
        'scene.camera': { eye: { x: 0, y: 0, z: 2.2 }, up: { x: 0, y: 1, z: 0 } },
        'scene2.camera': { eye: { x: 0, y: 0, z: 2.2 }, up: { x: 0, y: 1, z: 0 } }
      });
    });
  }

  if (btnFront) {
    btnFront.addEventListener('click', () => {
      Plotly.relayout(container, {
        'scene.camera': { eye: { x: 0, y: -2.3, z: 0.2 }, up: { x: 0, y: 0, z: 1 } },
        'scene2.camera': { eye: { x: 0, y: -2.3, z: 0.2 }, up: { x: 0, y: 0, z: 1 } }
      });
    });
  }

  window.addEventListener('resize', () => {
    Plotly.Plots.resize(container);
  });
}

// ==========================================
// 3. 2D INTERACTIVE CANVAS & LEVEL CURVES
// ==========================================
let canvas, ctx;
let currentBenefitLevel = 20800; // Optimal default
let simX = 200, simY = 180;
let isSweeping = false;
let sweepInterval = null;

function init2DCanvas() {
  canvas = document.getElementById('canvas2d');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  // Handle high-dpi display
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    draw2D();
  });

  // Canvas interaction (click to test point)
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const pt = canvasToModel(clickX, clickY);
    if (pt.x >= 0 && pt.x <= 400 && pt.y >= 0 && pt.y <= 400) {
      updateSimulatorValues(Math.round(pt.x), Math.round(pt.y));
    }
  });

  draw2D();
}

function resizeCanvas() {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 650;
  canvas.width = width * dpr;
  canvas.height = width * dpr; // 1:1 aspect
  ctx.scale(dpr, dpr);
}

// Model coordinates range: x: [-30, 420], y: [-30, 420]
const MODEL_MIN_X = -30, MODEL_MAX_X = 420;
const MODEL_MIN_Y = -30, MODEL_MAX_Y = 420;

function modelToCanvas(x, y) {
  const w = canvas.clientWidth || 650;
  const h = canvas.clientHeight || 650;
  const cx = ((x - MODEL_MIN_X) / (MODEL_MAX_X - MODEL_MIN_X)) * w;
  const cy = h - (((y - MODEL_MIN_Y) / (MODEL_MAX_Y - MODEL_MIN_Y)) * h);
  return { x: cx, y: cy };
}

function canvasToModel(cx, cy) {
  const w = canvas.clientWidth || 650;
  const h = canvas.clientHeight || 650;
  const x = MODEL_MIN_X + (cx / w) * (MODEL_MAX_X - MODEL_MIN_X);
  const y = MODEL_MIN_Y + ((h - cy) / h) * (MODEL_MAX_Y - MODEL_MIN_Y);
  return { x, y };
}

function draw2D() {
  if (!ctx || !canvas) return;
  const w = canvas.clientWidth || 650;
  const h = canvas.clientHeight || 650;

  ctx.clearRect(0, 0, w, h);

  // 1. Subtle grid lines
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for (let grid = 50; grid <= 400; grid += 50) {
    const p1 = modelToCanvas(grid, MODEL_MIN_Y);
    const p2 = modelToCanvas(grid, MODEL_MAX_Y);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    const q1 = modelToCanvas(MODEL_MIN_X, grid);
    const q2 = modelToCanvas(MODEL_MAX_X, grid);
    ctx.beginPath();
    ctx.moveTo(q1.x, q1.y);
    ctx.lineTo(q2.x, q2.y);
    ctx.stroke();
  }

  // 2. Axes
  const o = modelToCanvas(0, 0);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;

  // X axis
  ctx.beginPath();
  ctx.moveTo(modelToCanvas(MODEL_MIN_X, 0).x, o.y);
  ctx.lineTo(modelToCanvas(MODEL_MAX_X, 0).x, o.y);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(o.x, modelToCanvas(0, MODEL_MIN_Y).y);
  ctx.lineTo(o.x, modelToCanvas(0, MODEL_MAX_Y).y);
  ctx.stroke();

  // Ticks & labels
  ctx.fillStyle = '#64748b';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  for (let t = 100; t <= 400; t += 100) {
    const ptX = modelToCanvas(t, 0);
    ctx.fillText(t, ptX.x, ptX.y + 16);
    
    const ptY = modelToCanvas(0, t);
    ctx.textAlign = 'right';
    ctx.fillText(t, ptY.x - 8, ptY.y + 4);
    ctx.textAlign = 'center';
  }

  // Axes labels
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Sustrato A (x)', w - 10, o.y - 10);
  ctx.textAlign = 'left';
  ctx.fillText('Sustrato B (y)', o.x + 10, 20);

  // 3. Feasible Region Polygon: O(0,0) -> A(0,300) -> B(200,180) -> C(300,60)
  const poly = [
    modelToCanvas(0, 0),
    modelToCanvas(0, 300),
    modelToCanvas(200, 180),
    modelToCanvas(300, 60)
  ];

  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) {
    ctx.lineTo(poly[i].x, poly[i].y);
  }
  ctx.closePath();

  // Region Fill
  const gradient = ctx.createLinearGradient(poly[0].x, poly[0].y, poly[2].x, poly[2].y);
  gradient.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.4)');
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 4. Boundary Lines (Extended)
  // L1: 6x + 5y = 2100 -> y = (2100 - 6x)/5
  drawLine(
    modelToCanvas(0, 420),
    modelToCanvas(350, 0),
    '#2563eb', 1.8, 'L1: 6x + 5y = 2100 (Tierra)'
  );

  // L2: 3x + 5y = 1500 -> y = (1500 - 3x)/5
  drawLine(
    modelToCanvas(0, 300),
    modelToCanvas(500, 0),
    '#7c3aed', 1.8, 'L2: 3x + 5y = 1500 (Horas)'
  );

  // L3: x - 5y = 0 -> y = x / 5
  drawLine(
    modelToCanvas(0, 0),
    modelToCanvas(400, 80),
    '#d97706', 1.8, 'L3: x = 5y'
  );

  // 5. Isobenefit line: 50x + 60y = currentBenefitLevel
  // y = (currentBenefitLevel - 50x) / 60
  const k = currentBenefitLevel;
  const x_start = 0;
  const y_start = k / 60;
  const x_end = k / 50;
  const y_end = 0;

  const ptStart = modelToCanvas(x_start, y_start);
  const ptEnd = modelToCanvas(x_end, y_end);

  ctx.save();
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(ptStart.x, ptStart.y);
  ctx.lineTo(ptEnd.x, ptEnd.y);
  ctx.stroke();
  ctx.restore();

  // Isobenefit label
  const midX = (ptStart.x + ptEnd.x) / 2;
  const midY = (ptStart.y + ptEnd.y) / 2;
  if (midX >= 10 && midX <= w - 60 && midY >= 20 && midY <= h - 20) {
    ctx.fillStyle = '#db2777';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`Beneficio = ${k.toLocaleString()} €`, midX + 10, midY - 6);
  }

  // 6. Draw Vertices
  vertices.forEach(v => {
    const pt = modelToCanvas(v.x, v.y);
    const isOptimal = v.name === 'B';

    // Outer glow for optimal
    if (isOptimal) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, isOptimal ? 7 : 5, 0, Math.PI * 2);
    ctx.fillStyle = isOptimal ? '#059669' : '#1e293b';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text Label
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = isOptimal ? '#065f46' : '#0f172a';
    ctx.textAlign = v.x === 0 ? 'left' : 'center';
    const offsetX = v.x === 0 ? 12 : 0;
    const offsetY = v.y === 0 ? -10 : -12;
    ctx.fillText(`${v.name}(${v.x}, ${v.y})`, pt.x + offsetX, pt.y + offsetY);
  });

  // 7. Draw Current Simulator Point (if within range)
  const simPt = modelToCanvas(simX, simY);
  const feasible = checkFeasibility(simX, simY);

  ctx.beginPath();
  ctx.arc(simPt.x, simPt.y, 9, 0, Math.PI * 2);
  ctx.fillStyle = feasible.isFeasible ? '#10b981' : '#ef4444';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = feasible.isFeasible ? '#047857' : '#b91c1c';
  ctx.textAlign = 'left';
  ctx.fillText(`P(${simX}, ${simY})`, simPt.x + 12, simPt.y + 4);
}

function drawLine(p1, p2, color, width, label) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

// Level curve sweep slider
function initLevelSweep() {
  const slider = document.getElementById('level-slider');
  const badge = document.getElementById('level-val-badge');
  const btnSweep = document.getElementById('btn-sweep-play');

  if (!slider) return;

  slider.addEventListener('input', (e) => {
    currentBenefitLevel = parseInt(e.target.value, 10);
    badge.textContent = `${currentBenefitLevel.toLocaleString()} €`;
    draw2D();
  });

  if (btnSweep) {
    btnSweep.addEventListener('click', () => {
      if (isSweeping) {
        clearInterval(sweepInterval);
        isSweeping = false;
        btnSweep.innerHTML = '▶ Reproducir Barrido de Nivel';
      } else {
        isSweeping = true;
        btnSweep.innerHTML = '⏸ Pausar';
        slider.value = 0;
        currentBenefitLevel = 0;

        sweepInterval = setInterval(() => {
          if (currentBenefitLevel >= 23000) {
            clearInterval(sweepInterval);
            isSweeping = false;
            btnSweep.innerHTML = '▶ Reproducir Barrido de Nivel';
            return;
          }
          currentBenefitLevel += 400;
          slider.value = currentBenefitLevel;
          badge.textContent = `${currentBenefitLevel.toLocaleString()} €`;
          draw2D();
        }, 40);
      }
    });
  }
}

// ==========================================
// 4. SIMULATOR & CONSTRAINT EVALUATOR
// ==========================================
function initSimulator() {
  const sliderX = document.getElementById('sim-slider-x');
  const sliderY = document.getElementById('sim-slider-y');
  const inputX = document.getElementById('sim-num-x');
  const inputY = document.getElementById('sim-num-y');

  if (!sliderX || !sliderY) return;

  const updateFromSliders = () => {
    updateSimulatorValues(parseInt(sliderX.value, 10), parseInt(sliderY.value, 10));
  };

  sliderX.addEventListener('input', updateFromSliders);
  sliderY.addEventListener('input', updateFromSliders);

  inputX.addEventListener('change', () => {
    let val = Math.max(0, Math.min(350, parseInt(inputX.value, 10) || 0));
    updateSimulatorValues(val, simY);
  });

  inputY.addEventListener('change', () => {
    let val = Math.max(0, Math.min(350, parseInt(inputY.value, 10) || 0));
    updateSimulatorValues(simX, val);
  });

  // Quick jump vertex buttons
  document.querySelectorAll('.btn-jump-vertex').forEach(btn => {
    btn.addEventListener('click', () => {
      const vx = parseInt(btn.dataset.x, 10);
      const vy = parseInt(btn.dataset.y, 10);
      updateSimulatorValues(vx, vy);
    });
  });

  // Initial calculation
  updateSimulatorValues(200, 180);
}

function updateSimulatorValues(x, y) {
  simX = x;
  simY = y;

  const sliderX = document.getElementById('sim-slider-x');
  const sliderY = document.getElementById('sim-slider-y');
  const inputX = document.getElementById('sim-num-x');
  const inputY = document.getElementById('sim-num-y');

  if (sliderX) sliderX.value = x;
  if (sliderY) sliderY.value = y;
  if (inputX) inputX.value = x;
  if (inputY) inputY.value = y;

  // Evaluate
  const result = checkFeasibility(x, y);
  const profit = 50 * x + 60 * y;
  const optimalProfit = 20800;
  const profitPct = ((profit / optimalProfit) * 100).toFixed(1);

  // Update UI Elements
  // Profit
  const profitEl = document.getElementById('profit-amount-val');
  if (profitEl) {
    profitEl.textContent = `${profit.toLocaleString()} €`;
  }

  const formulaEl = document.getElementById('profit-formula-val');
  if (formulaEl) {
    formulaEl.textContent = `50 · (${x}) + 60 · (${y}) = ${profit.toLocaleString()} € (${profitPct}% del óptimo)`;
  }

  // Status Box
  const statusBox = document.getElementById('sim-status-box');
  const statusTitle = document.getElementById('sim-status-title');
  const statusDesc = document.getElementById('sim-status-desc');

  if (statusBox && statusTitle && statusDesc) {
    if (result.isFeasible) {
      statusBox.className = 'status-box feasible';
      statusTitle.textContent = 'Punto Factible ✅';
      if (x === 200 && y === 180) {
        statusDesc.textContent = '¡Estás exactamente en el vértice óptimo B(200, 180) con el beneficio máximo absoluto de 20.800 €!';
      } else {
        statusDesc.textContent = 'Cumple todas las restricciones de tierra vegetal, horas laborales y proporción de sustratos.';
      }
    } else {
      statusBox.className = 'status-box infeasible';
      statusTitle.textContent = 'Punto No Factible ❌';
      statusDesc.textContent = `Viola las siguientes restricciones: ${result.violations.join(', ')}.`;
    }
  }

  // Update Progress Meters
  // Meter 1: Tierra vegetal (60x + 50y <= 21000)
  updateMeter(
    'meter-tierra-val', 'bar-tierra-fill',
    result.tierra, 21000, 'kg'
  );

  // Meter 2: Horas trabajo (30x + 50y <= 15000)
  updateMeter(
    'meter-horas-val', 'bar-horas-fill',
    result.horas, 15000, 'h'
  );

  // Meter 3: Proporción (x <= 5y -> x - 5y <= 0)
  const propDiff = x - 5 * y;
  const propValEl = document.getElementById('meter-prop-val');
  const propBarEl = document.getElementById('bar-prop-fill');
  if (propValEl && propBarEl) {
    propValEl.textContent = `${x} m³ vs máx ${5 * y} m³ (${propDiff <= 0 ? 'Cumple' : 'Excede'})`;
    const pct = y === 0 ? (x === 0 ? 0 : 100) : Math.min(100, (x / (5 * y)) * 100);
    propBarEl.style.width = `${pct}%`;
    propBarEl.className = 'progress-bar-fill ' + (x <= 5 * y ? 'safe' : 'over');
  }

  // Redraw 2D
  draw2D();
}

function checkFeasibility(x, y) {
  const tierra = 60 * x + 50 * y;
  const horas = 30 * x + 50 * y;
  const violations = [];

  if (tierra > 21000) violations.push(`Tierra vegetal (${tierra} > 21.000)`);
  if (horas > 15000) violations.push(`Horas de trabajo (${horas} > 15.000)`);
  if (x > 5 * y) violations.push(`Proporción técnica (${x} > 5·${y}=${5*y})`);
  if (x < 0) violations.push('Producción A negativa (x < 0)');
  if (y < 0) violations.push('Producción B negativa (y < 0)');

  return {
    isFeasible: violations.length === 0,
    tierra,
    horas,
    violations
  };
}

function updateMeter(statId, fillId, current, max, unit) {
  const statEl = document.getElementById(statId);
  const fillEl = document.getElementById(fillId);
  if (!statEl || !fillEl) return;

  const pct = Math.min(100, (current / max) * 100);
  statEl.textContent = `${current.toLocaleString()} / ${max.toLocaleString()} ${unit} (${pct.toFixed(0)}%)`;
  fillEl.style.width = `${pct}%`;

  if (current <= max) {
    fillEl.className = 'progress-bar-fill ' + (pct > 90 ? 'warn' : 'safe');
  } else {
    fillEl.className = 'progress-bar-fill over';
  }
}
