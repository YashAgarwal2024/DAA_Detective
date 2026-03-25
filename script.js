// ===== STATE =====
const state = {
  solved: JSON.parse(localStorage.getItem('daa_solved') || '[]'),
  score: parseInt(localStorage.getItem('daa_score') || '0'),
  currentCase: 0,
  animRunning: false,
  speed: 400
};

const particleState = {
  canvas: null,
  ctx: null,
  particles: [],
  rafId: null,
  width: 0,
  height: 0,
  dpr: 1
};

function buildParticle() {
  const colorPool = [
    [245, 197, 24],
    [79, 195, 247],
    [232, 69, 60]
  ];
  const color = colorPool[Math.floor(Math.random() * colorPool.length)];
  return {
    x: Math.random() * particleState.width,
    y: Math.random() * particleState.height,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
    size: Math.random() * 2.4 + 0.8,
    alpha: Math.random() * 0.5 + 0.18,
    pulse: Math.random() * Math.PI * 2,
    color
  };
}

function resizeParticleCanvas() {
  if (!particleState.canvas || !particleState.ctx) return;
  const { canvas, ctx } = particleState;
  particleState.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  particleState.width = window.innerWidth;
  particleState.height = window.innerHeight;

  canvas.width = Math.floor(particleState.width * particleState.dpr);
  canvas.height = Math.floor(particleState.height * particleState.dpr);
  canvas.style.width = particleState.width + 'px';
  canvas.style.height = particleState.height + 'px';
  ctx.setTransform(particleState.dpr, 0, 0, particleState.dpr, 0, 0);

  const targetCount = Math.max(35, Math.min(95, Math.floor((particleState.width * particleState.height) / 16000)));
  if (particleState.particles.length > targetCount) {
    particleState.particles.length = targetCount;
  } else {
    while (particleState.particles.length < targetCount) {
      particleState.particles.push(buildParticle());
    }
  }
}

function animateParticles() {
  if (!particleState.ctx) return;
  const { ctx, width, height, particles } = particleState;
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.pulse += 0.02;

    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;

    const glow = (Math.sin(p.pulse) + 1) * 0.5;
    const alpha = Math.min(0.95, p.alpha + glow * 0.22);
    ctx.beginPath();
    ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha.toFixed(3)})`;
    ctx.arc(p.x, p.y, p.size + glow * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i++) {
    const a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 130) {
        const alpha = (1 - distance / 130) * 0.22;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(245, 197, 24, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  particleState.rafId = window.requestAnimationFrame(animateParticles);
}

function initParticleBackground() {
  particleState.canvas = document.getElementById('particle-bg');
  if (!particleState.canvas) return;
  particleState.ctx = particleState.canvas.getContext('2d');
  if (!particleState.ctx) return;

  resizeParticleCanvas();
  animateParticles();
  window.addEventListener('resize', resizeParticleCanvas);
}

const CASES = [
  {
    id: 1,
    title: "The Heist Escape",
    tag: "Greedy",
    tagClass: "greedy",
    algo: "Dijkstra's Shortest Path",
    difficulty: 2,
    points: 300,
    desc: "Simple case: The city has many possible roads, and the police must intercept the heist team quickly.<br/>If the police choose random roads, time is lost and the criminals can escape.<br/>What we use: <strong>Dijkstra</strong> to compute the shortest-risk route for the fastest interception.",
    complexity: { time: "O((V+E)logV)", space: "O(V)", paradigm: "Greedy" }
  },
  {
    id: 2,
    title: "The Evidence Vault",
    tag: "DP",
    tagClass: "dp",
    algo: "0/1 Knapsack (Dynamic Programming)",
    difficulty: 3,
    points: 400,
    desc: "Simple case: There are many evidence items, but the evidence bag has limited capacity.<br/>Everything cannot be collected, so a smart selection is required to maximize value.<br/>What we use: <strong>0/1 Knapsack DP</strong> to choose the best combination under the weight limit.",
    complexity: { time: "O(n×W)", space: "O(n×W)", paradigm: "Dynamic Programming" }
  },
  {
    id: 3,
    title: "The Suspect Lineup",
    tag: "D&C",
    tagClass: "dc",
    algo: "Merge Sort (Divide & Conquer)",
    difficulty: 2,
    points: 250,
    desc: "Simple case: Suspects are in random order, so threat levels are difficult to assess.<br/>The detective needs a sorted list from lower to higher threat to identify top suspects quickly.<br/>What we use: <strong>Merge Sort</strong> for fast and stable divide-and-conquer sorting.",
    complexity: { time: "O(n log n)", space: "O(n)", paradigm: "Divide & Conquer" }
  },
  {
    id: 4,
    title: "The Vault Lock",
    tag: "Backtrack",
    tagClass: "backtrack",
    algo: "Backtracking (N-Queens variant)",
    difficulty: 4,
    points: 500,
    desc: "Simple case: Guards must be placed on a vault grid without breaking conflict rules.<br/>If even one placement is invalid, the full arrangement fails.<br/>What we use: <strong>Backtracking (N-Queens)</strong> to test valid options, reject invalid ones, and reach a safe setup.",
    complexity: { time: "O(n!)", space: "O(n)", paradigm: "Backtracking" }
  },
  {
    id: 5,
    title: "The Crime Network",
    tag: "Graph",
    tagClass: "graph",
    algo: "BFS — Level Order Traversal",
    difficulty: 3,
    points: 350,
    desc: "Simple case: The crime network is layered, and the boss is not directly visible.<br/>Investigation must start from street-level contacts and move level by level upward.<br/>What we use: <strong>BFS</strong> because it explores nearest levels first and then deeper nodes.",
    complexity: { time: "O(V+E)", space: "O(V)", paradigm: "Graph Traversal" }
  },
  {
    id: 6,
    title: "The Gang Takedown",
    tag: "Graph",
    tagClass: "graph",
    algo: "Kruskal's MST Algorithm",
    difficulty: 4,
    points: 450,
    desc: "Simple case: The network must be controlled with minimum total connection cost.<br/>Extra links waste resources, and cycle edges do not add monitoring value.<br/>What we use: <strong>Kruskal MST</strong> with Union-Find to keep only the cheapest useful links.",
    complexity: { time: "O(E log E)", space: "O(V)", paradigm: "Greedy + Graph" }
  },
  {
    id: 7,
    title: "The City Patrol",
    tag: "B&B",
    tagClass: "bb",
    algo: "Branch & Bound (TSP)",
    difficulty: 5,
    points: 600,
    desc: "Simple case: The detective must visit all crime scenes and return to HQ with minimum travel distance.<br/>A brute-force search generates too many routes and becomes expensive.<br/>What we use: <strong>Branch & Bound</strong> to prune poor routes early and find the best route faster.",
    complexity: { time: "O(n²×2ⁿ)", space: "O(n×2ⁿ)", paradigm: "Branch & Bound" }
  },
  {
    id: 8,
    title: "The Encrypted Message",
    tag: "Greedy",
    tagClass: "greedy",
    algo: "Huffman Encoding",
    difficulty: 3,
    points: 380,
    desc: "Simple case: A criminal message must be encoded into a compact form for efficient transfer.<br/>Using equal bits per character makes the message unnecessarily long.<br/>What we use: <strong>Huffman Encoding</strong>, where frequent characters get shorter codes for better compression.",
    complexity: { time: "O(n log n)", space: "O(n)", paradigm: "Greedy" }
  },
  {
    id: 9,
    title: "The Maze Escape",
    tag: "Backtrack",
    tagClass: "backtrack",
    algo: "Rat in a Maze (Backtracking)",
    difficulty: 3,
    points: 350,
    desc: "Simple case: The suspect escaped through a maze, and no direct route is obvious.<br/>Many turns are dead ends, so wrong decisions require stepping back.<br/>What we use: <strong>Maze Backtracking</strong> to explore paths and return from blocked cells until an exit is found.",
    complexity: { time: "O(4ⁿ)", space: "O(n²)", paradigm: "Backtracking" }
  },
  {
    id: 10,
    title: "The Final Algorithm",
    tag: "D&C",
    tagClass: "dc",
    algo: "Quick Sort — Final Showdown",
    difficulty: 4,
    points: 500,
    desc: "Simple case: A large list of criminal records must be sorted quickly during active operations.<br/>A slow sort delays dispatch and weakens response time.<br/>What we use: <strong>Quick Sort</strong> with partitioning for strong average-case performance.",
    complexity: { time: "O(n log n) avg", space: "O(log n)", paradigm: "Divide & Conquer" }
  },
  {
    id: 11,
    title: "The Safe House Network",
    tag: "DP",
    tagClass: "dp",
    algo: "Floyd-Warshall All-Pairs Shortest Path",
    difficulty: 5,
    points: 600,
    desc: "Critical case: The criminal organization has multiple safe houses connected by secure routes with varying distances.<br/>The detective needs to know the shortest distance between any two safe houses to plan rapid raids and block escape routes.<br/>What we use: <strong>Floyd-Warshall Algorithm</strong> to compute all-pairs shortest paths in O(V³), enabling instant queries.",
    complexity: { time: "O(V³)", space: "O(V²)", paradigm: "Dynamic Programming" }
  },
  {
    id: 12,
    title: "The Pattern Detective",
    tag: "DP",
    tagClass: "dp",
    algo: "Longest Common Subsequence (LCS)",
    difficulty: 4,
    points: 480,
    desc: "Medium case: Two suspect behavior logs have been captured, but they are formatted differently.<br/>Finding common behavioral patterns can link the suspects and prove coordination.<br/>What we use: <strong>LCS Dynamic Programming</strong> to identify the longest matching sequence of actions shared by both suspects.",
    complexity: { time: "O(m×n)", space: "O(m×n)", paradigm: "Dynamic Programming" }
  },
  {
    id: 13,
    title: "The Investigation Timeline",
    tag: "Graph",
    tagClass: "graph",
    algo: "Topological Sort",
    difficulty: 4,
    points: 500,
    desc: "Complex case: Investigation steps have dependencies—some witnesses must be interviewed before interrogating suspects.<br/>Resources are limited, so the optimal sequence prevents wasted work and missed leads.<br/>What we use: <strong>Topological Sort</strong> to order investigation tasks respecting all dependencies in O(V+E).",
    complexity: { time: "O(V+E)", space: "O(V)", paradigm: "Graph Algorithm" }
  },
  {
    id: 14,
    title: "The Witness Finder",
    tag: "Search",
    tagClass: "search",
    algo: "Binary Search on Sorted Array",
    difficulty: 2,
    points: 350,
    desc: "Quick case: A sorted database of 1000 witness records exists, and a key testimony must be located instantly.<br/>Linear search wastes time; the detective must use the database structure efficiently.<br/>What we use: <strong>Binary Search</strong> to locate the target witness in O(log n) time.",
    complexity: { time: "O(log n)", space: "O(1)", paradigm: "Search & Divide & Conquer" }
  },
  {
    id: 15,
    title: "The Code Breaker",
    tag: "String",
    tagClass: "string",
    algo: "Rabin-Karp String Matching",
    difficulty: 5,
    points: 600,
    desc: "Expert case: A long intercepted message contains hidden patterns that link to criminal operations.<br/>Finding these patterns manually is impossible, but pattern-matching algorithms can scan efficiently.<br/>What we use: <strong>Rabin-Karp Algorithm</strong> with rolling hash to find all occurrences of a pattern in O(n+m) average time.",
    complexity: { time: "O(n+m)", space: "O(1)", paradigm: "String Matching" }
  }
];

const CASE_SUCCESS_MESSAGES = {
  1: 'Dijkstra run complete. The police route to intercept the heist is now optimized.',
  2: 'Knapsack DP complete. The evidence bag now contains the highest-value valid selection.',
  3: 'Merge Sort complete. The suspects are now correctly ordered by threat level.',
  4: 'Backtracking complete. A valid guard placement has been found under all constraints.',
  5: 'BFS complete. The investigation reached the mastermind through level-order traversal.',
  6: 'Kruskal complete. The minimum-cost monitoring structure has been built successfully.',
  7: 'Branch and Bound complete. The best round trip route has been identified efficiently.',
  8: 'Huffman complete. The message is encoded in a compact form with fewer bits.',
  9: 'Maze backtracking complete. A valid path to the exit has been confirmed.',
  10: 'Quick Sort complete. The large criminal record list is now sorted and ready for immediate action.',
  11: 'Floyd-Warshall complete. All-pairs shortest distances computed successfully—escape routes blocked.',
  12: 'LCS Pattern match complete. The behavioral sequence link between suspects is now confirmed.',
  13: 'Topological sort complete. Investigation tasks are now ordered by proper dependencies.',
  14: 'Binary search complete. The target witness record found instantly in the database.',
  15: 'Rabin-Karp complete. All pattern occurrences in the message identified successfully.'
};

const CASE_RUN_CONCLUSIONS = {
  1: 'Conclusion: Green highlighted path is the true shortest path from Bank to EXIT.',
  2: 'Conclusion: Selected highlighted items give maximum value under given bag capacity.',
  3: 'Conclusion: Final bar order proves divide-then-merge strategy sorted all suspects correctly.',
  4: 'Conclusion: One queen per row/col/diagonal achieved, so configuration is valid.',
  5: 'Conclusion: BFS reached boss through level order, showing shortest-level discovery.',
  6: 'Conclusion: Green MST edges are minimum needed links with lowest total cost.',
  7: 'Conclusion: Highlighted tour is minimum-distance full visit route and return path.',
  8: 'Conclusion: Frequent letters got shorter codes, so encoded message used fewer bits.',
  9: 'Conclusion: Green maze cells mark a valid path from start to exit.',
  10: 'Conclusion: All bars in order confirm records are fully sorted using partition steps.',
  11: 'Conclusion: Distance matrix complete—every safe house pair now has its shortest secure route.',
  12: 'Conclusion: Highlighted LCS sequence links both suspects through common behavioral patterns.',
  13: 'Conclusion: Task sequence respects all dependencies, preventing investigation dead ends.',
  14: 'Conclusion: Binary search found target witness at position N in O(log n) comparisons.',
  15: 'Conclusion: All pattern matches highlighted—hidden messages in cipher now fully exposed.'
};

// ===== RENDER HOME =====
function renderHome() {
  document.getElementById('solved-count').textContent = state.solved.length;
  document.getElementById('total-score').textContent = state.score;
  const totalCasesEl = document.getElementById('total-cases');
  if (totalCasesEl) totalCasesEl.textContent = CASES.length;
  const ranks = ['—','Rookie','Investigator','Detective','Senior Det.','Chief','ACP pradyuman','Dhurandhar'];
  document.getElementById('rank-display').textContent = ranks[Math.min(Math.floor(state.solved.length/2), 7)];

  const grid = document.getElementById('cases-grid');
  grid.innerHTML = CASES.map(c => {
    const isSolved = state.solved.includes(c.id);
    const dots = Array(5).fill(0).map((_,i) =>
      `<div class="diff-dot ${i < c.difficulty ? 'filled' : ''}"></div>`
    ).join('');
    return `
      <div class="case-card ${isSolved ? 'solved' : ''}" onclick="openCase(${c.id})">
        <div class="case-number">${String(c.id).padStart(2,'0')}</div>
        <div class="case-tag ${c.tagClass}">${c.tag}</div>
        <div class="case-title">${c.title}</div>
        <div class="case-algo">🔬 ${c.algo}</div>
        <div class="case-difficulty">${dots}</div>
        <div class="case-status">${isSolved ? '✓ SOLVED' : '● OPEN'}</div>
        <div style="margin-top:8px;font-size:11px;color:var(--accent)">+${c.points} pts</div>
      </div>
    `;
  }).join('');
}

// ===== NAVIGATION =====
function openCase(id) {
  state.currentCase = id;
  const c = CASES[id - 1];
  document.getElementById('home-screen').classList.remove('active');
  document.getElementById('case-screen').classList.add('active');
  document.getElementById('case-header-title').textContent = `Case #${id} — ${c.title}`;
  document.getElementById('live-score').textContent = state.score;
  renderCase(id);
  window.scrollTo(0,0);
}

function goHome() {
  state.animRunning = false;
  document.getElementById('case-screen').classList.remove('active');
  document.getElementById('home-screen').classList.add('active');
  renderHome();
}

function nextCase() {
  closeSuccess();
  const next = state.currentCase + 1;
  if (next <= CASES.length) openCase(next);
  else goHome();
}

function closeSuccess() {
  document.getElementById('success-overlay').classList.remove('show');
}

function solveCase(id, pts, msg) {
  if (!state.solved.includes(id)) {
    state.solved.push(id);
    state.score += pts;
    localStorage.setItem('daa_solved', JSON.stringify(state.solved));
    localStorage.setItem('daa_score', state.score);
    
    // Add green box styling immediately
    const caseBody = document.getElementById('case-body');
    if (caseBody) {
      caseBody.classList.add('solved');
    }
  }
  document.getElementById('live-score').textContent = state.score;
  const solveConclusion = CASE_RUN_CONCLUSIONS[id] ? ` ${CASE_RUN_CONCLUSIONS[id]}` : '';
  document.getElementById('success-msg').textContent = msg + solveConclusion;
  document.getElementById('success-score').textContent = `+${pts} pts`;
  document.getElementById('success-overlay').classList.add('show');
}

function attachSolveAction(caseId, solveBtnId) {
  const btn = document.getElementById(solveBtnId);
  if (!btn) return;
  const current = CASES[caseId - 1];
  const msg = CASE_SUCCESS_MESSAGES[caseId] || `${current.algo} complete.`;
  btn.onclick = () => solveCase(caseId, current.points, msg);
  btn.textContent = caseId === CASES.length ? '🏁 FINAL CASE SOLVED — Submit' : '🔓 Case Solved — Submit';
}

function logCaseConclusion(logId) {
  const text = CASE_RUN_CONCLUSIONS[state.currentCase];
  if (!text) return;
  log(logId, text, 'success');
}

// ===== CASE RENDERER =====
function renderCase(id) {
  const c = CASES[id-1];
  const body = document.getElementById('case-body');
  let solveBtnId = '';

  // Apply solved styling if case is already solved
  if (state.solved.includes(id)) {
    body.classList.add('solved');
  } else {
    body.classList.remove('solved');
  }

  const complexityHTML = `
    <div class="complexity-box">
      <div class="complexity-item">
        <div class="complexity-label">Time</div>
        <div class="complexity-value" style="font-size:16px">${c.complexity.time}</div>
      </div>
      <div class="complexity-item">
        <div class="complexity-label">Space</div>
        <div class="complexity-value" style="font-size:16px">${c.complexity.space}</div>
      </div>
      <div class="complexity-item">
        <div class="complexity-label">Paradigm</div>
        <div class="complexity-value" style="font-size:14px">${c.complexity.paradigm}</div>
      </div>
    </div>
  `;

  const introHTML = `<div class="case-intro">📁 <strong>CASE FILE #${c.id}:</strong> ${c.desc}</div>`;

  switch(id) {
    case 1: body.innerHTML = introHTML + complexityHTML + buildDijkstra(); solveBtnId = 'dijk-solve'; break;
    case 2: body.innerHTML = introHTML + complexityHTML + buildKnapsack(); solveBtnId = 'kp-solve'; break;
    case 3: body.innerHTML = introHTML + complexityHTML + buildMergeSort(); solveBtnId = 'ms-solve'; break;
    case 4: body.innerHTML = introHTML + complexityHTML + buildNQueens(); solveBtnId = 'nq-solve'; break;
    case 5: body.innerHTML = introHTML + complexityHTML + buildBFS(); solveBtnId = 'bfs-solve'; break;
    case 6: body.innerHTML = introHTML + complexityHTML + buildKruskal(); solveBtnId = 'kr-solve'; break;
    case 7: body.innerHTML = introHTML + complexityHTML + buildTSP(); solveBtnId = 'tsp-solve'; break;
    case 8: body.innerHTML = introHTML + complexityHTML + buildHuffman(); solveBtnId = 'huff-solve'; break;
    case 9: body.innerHTML = introHTML + complexityHTML + buildMaze(); solveBtnId = 'maze-solve'; break;
    case 10: body.innerHTML = introHTML + complexityHTML + buildQuickSort(); solveBtnId = 'qs-solve'; break;
    case 11: body.innerHTML = introHTML + complexityHTML + buildFloydWarshall(); solveBtnId = 'fw-solve'; break;
    case 12: body.innerHTML = introHTML + complexityHTML + buildLCS(); solveBtnId = 'lcs-solve'; break;
    case 13: body.innerHTML = introHTML + complexityHTML + buildTopoSort(); solveBtnId = 'topo-solve'; break;
    case 14: body.innerHTML = introHTML + complexityHTML + buildBinarySearch(); solveBtnId = 'bs-solve'; break;
    case 15: body.innerHTML = introHTML + complexityHTML + buildRabinKarp(); solveBtnId = 'rk-solve'; break;
  }

  setTimeout(() => attachSolveAction(id, solveBtnId), 0);
}

// ===== LOG HELPER =====
function log(id, msg, type='info') {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML += `<div class="log-line ${type}">> ${msg}</div>`;
  el.scrollTop = el.scrollHeight;
}

function clearLog(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// CASE 1 — DIJKSTRA
// ============================================================
function buildDijkstra() {
  return `
    <div class="viz-area">
      <div class="viz-title">🗺 City Graph — Weighted Roads</div>
      <svg class="graph-svg" id="dijkstra-svg" viewBox="0 0 700 280"></svg>
      <div style="margin-top:14px;font-size:12px;color:var(--muted)">
        <span style="color:var(--accent)">■</span> Current &nbsp;
        <span style="color:var(--green)">■</span> Visited &nbsp;
        <span style="color:var(--accent3)">■</span> Unvisited &nbsp;
        <span style="color:var(--accent2)">■</span> Start/End
      </div>
    </div>
    <div class="log-area" id="dijk-log"></div>
    <div class="controls">
      <button class="btn" onclick="generateDijkstraNewRoute()">🎲 New City Route</button>
      <button class="btn" onclick="runDijkstra()">▶ Run Dijkstra</button>
      <button class="btn danger" onclick="resetDijkstra()">↺ Reset</button>
    </div>
    <button class="solve-btn" id="dijk-solve" disabled onclick="solveCase(1,300,'Dijkstra found the optimal escape route! Greedy selection of minimum distance node at each step guarantees shortest path.')">🔓 Case Solved — Submit</button>
  `;
}

let dijkGraph = {
  nodes: [
    {id:'A',x:80,y:140,label:'Bank'},
    {id:'B',x:220,y:60,label:'North'},
    {id:'C',x:220,y:220,label:'South'},
    {id:'D',x:380,y:60,label:'East1'},
    {id:'E',x:380,y:220,label:'East2'},
    {id:'F',x:520,y:140,label:'Highway'},
    {id:'G',x:630,y:140,label:'EXIT'}
  ],
  edges: [
    {u:'A',v:'B',w:4},{u:'A',v:'C',w:2},
    {u:'B',v:'D',w:3},{u:'B',v:'E',w:8},
    {u:'C',v:'E',w:5},{u:'C',v:'D',w:9},
    {u:'D',v:'F',w:2},{u:'E',v:'F',w:4},
    {u:'F',v:'G',w:1},{u:'D',v:'G',w:8}
  ]
};

const dijkBaseEdges = dijkGraph.edges.map(e => ({ ...e }));

function generateDijkstraNewRoute() {
  const variedEdges = dijkBaseEdges.map(e => ({
    ...e,
    w: Math.max(1, e.w + (Math.floor(Math.random() * 5) - 2))
  }));

  dijkGraph = {
    ...dijkGraph,
    edges: variedEdges
  };

  clearLog('dijk-log');
  log('dijk-log', 'New city route generated with updated road risks.', 'info');
  initDijkstraSVG();
  const solveBtn = document.getElementById('dijk-solve');
  if (solveBtn) solveBtn.disabled = true;
}

function resetDijkstra() {
  state.animRunning = false;
  clearLog('dijk-log');
  initDijkstraSVG();
  document.getElementById('dijk-solve').disabled = true;
}

function initDijkstraSVG() {
  const svg = document.getElementById('dijkstra-svg');
  if (!svg) return;
  const g = dijkGraph;
  const nodeMap = {};
  g.nodes.forEach(n => nodeMap[n.id] = n);

  let html = '';
  // edges
  g.edges.forEach(e => {
    const u = nodeMap[e.u], v = nodeMap[e.v];
    const mx = (u.x+v.x)/2, my = (u.y+v.y)/2;
    html += `<line id="edge-${e.u}-${e.v}" class="edge" x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}"/>`;
    html += `<rect x="${mx-10}" y="${my-10}" width="20" height="16" fill="var(--bg)" rx="2"/>`;
    html += `<text x="${mx}" y="${my+3}" text-anchor="middle" font-size="11" fill="var(--accent)" font-family="Courier Prime">${e.w}</text>`;
  });
  // nodes
  g.nodes.forEach(n => {
    const color = n.id === 'A' ? 'var(--accent2)' : n.id === 'G' ? 'var(--green)' : 'var(--accent3)';
    html += `<g class="node" id="node-${n.id}">
      <circle cx="${n.x}" cy="${n.y}" r="22" fill="var(--card)" stroke="${color}" stroke-width="2"/>
      <text x="${n.x}" y="${n.y}-6" text-anchor="middle" dominant-baseline="middle" font-size="13" fill="${color}" font-family="Courier Prime" font-weight="bold" dy="0">${n.id}</text>
      <text x="${n.x}" y="${n.y+14}" text-anchor="middle" font-size="9" fill="var(--muted)" font-family="Courier Prime">${n.label}</text>
    </g>`;
  });
  svg.innerHTML = html;
}

async function runDijkstra() {
  if (state.animRunning) return;
  state.animRunning = true;
  clearLog('dijk-log');

  const g = dijkGraph;
  const nodeMap = {};
  g.nodes.forEach(n => nodeMap[n.id] = n);

  const dist = {}, prev = {}, visited = new Set();
  g.nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null; });
  dist['A'] = 0;

  const getMin = () => {
    let min = Infinity, u = null;
    for (const n of g.nodes) {
      if (!visited.has(n.id) && dist[n.id] < min) { min = dist[n.id]; u = n.id; }
    }
    return u;
  };

  log('dijk-log', 'Starting from Bank (A). Initial distances: all ∞ except A=0', 'info');
  await sleep(state.speed);

  while (true) {
    const u = getMin();
    if (!u) break;
    visited.add(u);

    const nodeEl = document.getElementById(`node-${u}`);
    if (nodeEl) nodeEl.querySelector('circle').style.fill = 'rgba(245,197,24,0.3)';
    log('dijk-log', `Visiting node ${u} — dist=${dist[u]}`, 'warning');
    await sleep(state.speed);

    const neighbors = g.edges.filter(e => e.u === u || e.v === u);
    for (const edge of neighbors) {
      const v = edge.u === u ? edge.v : edge.u;
      if (visited.has(v)) continue;
      const newDist = dist[u] + edge.w;
      const edgeEl = document.getElementById(`edge-${edge.u}-${edge.v}`);
      if (edgeEl) { edgeEl.style.stroke = 'var(--accent)'; edgeEl.style.strokeWidth = '3'; }
      await sleep(state.speed / 2);
      if (newDist < dist[v]) {
        dist[v] = newDist;
        prev[v] = u;
        log('dijk-log', `  Updated ${v}: new dist = ${newDist}`, 'info');
      }
      if (edgeEl) { edgeEl.style.stroke = 'var(--border)'; edgeEl.style.strokeWidth = '2'; }
    }

    if (nodeEl) nodeEl.querySelector('circle').style.fill = 'rgba(57,255,20,0.2)';
    if (u === 'G') break;
  }

  // trace path
  let path = [], cur = 'G';
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  log('dijk-log', `Optimal escape path: ${path.join(' → ')}`, 'success');
  log('dijk-log', `Minimum risk cost: ${dist['G']}`, 'success');

  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i], v = path[i+1];
    const eEl = document.getElementById(`edge-${u}-${v}`) || document.getElementById(`edge-${v}-${u}`);
    if (eEl) { eEl.style.stroke = 'var(--green)'; eEl.style.strokeWidth = '4'; }
    const nEl = document.getElementById(`node-${v}`);
    if (nEl) nEl.querySelector('circle').style.stroke = 'var(--green)';
    await sleep(300);
  }

  logCaseConclusion('dijk-log');

  state.animRunning = false;
  document.getElementById('dijk-solve').disabled = false;
}

// ============================================================
// CASE 2 — KNAPSACK DP
// ============================================================
let kpItems = [
  {name:'🔫',label:'Weapon',w:3,v:8},
  {name:'💊',label:'Drug',w:5,v:15},
  {name:'💰',label:'Cash',w:2,v:6},
  {name:'📱',label:'Phone',w:1,v:4},
  {name:'🗝',label:'Key',w:4,v:12},
  {name:'📁',label:'Files',w:6,v:18}
];

function buildKnapsack() {
  const items = kpItems;
  const capacity = 10;

  return `
    <div class="section-label">Evidence Items — Weight vs Value</div>
    <div class="items-grid" id="kp-items">
      ${items.map((it,i) => `
        <div class="item-card" id="kp-item-${i}">
          <div class="item-name">${it.name}</div>
          <div style="font-size:13px;margin-bottom:4px">${it.label}</div>
          <div class="item-stats">W:${it.w} V:${it.v}</div>
        </div>
      `).join('')}
    </div>
    <div class="slider-row">
      <span>Bag Capacity:</span>
      <input type="range" min="5" max="15" value="10" id="kp-cap"/>
      <span id="kp-cap-val">10</span>
    </div>
    <div class="viz-area">
      <div class="viz-title">📊 DP Table — Building Optimal Solution</div>
      <div id="kp-table-wrap" style="overflow-x:auto"></div>
    </div>
    <div class="log-area" id="kp-log"></div>
    <div class="controls">
      <button class="btn" onclick="generateKnapsackNewItems()">🎲 New Evidence Set</button>
      <button class="btn" onclick="runKnapsack()">▶ Run DP</button>
      <button class="btn danger" onclick="resetKnapsack()">↺ Reset</button>
    </div>
    <button class="solve-btn" id="kp-solve" disabled onclick="solveCase(2,400,'DP table filled! Optimal evidence collection maximized using 0/1 Knapsack — classic bottom-up Dynamic Programming.')">🔓 Case Solved — Submit</button>
  `;
}

function resetKnapsack() {
  clearLog('kp-log');
  document.getElementById('kp-table-wrap').innerHTML = '';
  document.getElementById('kp-solve').disabled = true;
  document.querySelectorAll('[id^=kp-item-]').forEach(el => el.classList.remove('selected'));
}

function generateKnapsackNewItems() {
  // Regenerate new random items
  const names = ['🔫','💊','💰','📱','🗝','📁','🗡','💎','📸','🔑'];
  const labels = ['Weapon','Drug','Cash','Phone','Key','Files','Sword','Diamond','Camera','Token'];
  
  const newItems = [];
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * 10);
    newItems.push({
      name: names[idx],
      label: labels[idx],
      w: Math.floor(Math.random() * 6) + 1,
      v: Math.floor(Math.random() * 15) + 5
    });
  }
  
  kpItems = newItems;
  renderCase(2);
}

document.addEventListener('change', e => {
  if (e.target.id === 'kp-cap') document.getElementById('kp-cap-val').textContent = e.target.value;
});

async function runKnapsack() {
  if (state.animRunning) return;
  state.animRunning = true;
  clearLog('kp-log');
  document.querySelectorAll('[id^=kp-item-]').forEach(el => el.classList.remove('selected'));

  const items = [
    {name:'Weapon',w:3,v:8},{name:'Drug',w:5,v:15},
    {name:'Cash',w:2,v:6},{name:'Phone',w:1,v:4},
    {name:'Key',w:4,v:12},{name:'Files',w:6,v:18}
  ];
  const W = parseInt(document.getElementById('kp-cap')?.value || 10);
  const n = items.length;
  const dp = Array(n+1).fill(null).map(() => Array(W+1).fill(0));

  log('kp-log', `Running 0/1 Knapsack with ${n} items, capacity=${W}`, 'info');

  // render table header
  const wrap = document.getElementById('kp-table-wrap');
  let tableHTML = '<table class="dp-table"><tr><th>Item\\ W</th>';
  for (let w = 0; w <= W; w++) tableHTML += `<th>${w}</th>`;
  tableHTML += '</tr>';
  for (let i = 0; i <= n; i++) {
    tableHTML += `<tr><th>${i===0?'—':items[i-1].name}</th>`;
    for (let w = 0; w <= W; w++) tableHTML += `<td id="dp-${i}-${w}">0</td>`;
    tableHTML += '</tr>';
  }
  tableHTML += '</table>';
  wrap.innerHTML = tableHTML;

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      const cell = document.getElementById(`dp-${i}-${w}`);
      if (cell) cell.classList.add('active');
      if (items[i-1].w <= w) {
        dp[i][w] = Math.max(dp[i-1][w], dp[i-1][w-items[i-1].w] + items[i-1].v);
      } else {
        dp[i][w] = dp[i-1][w];
      }
      if (cell) { cell.textContent = dp[i][w]; }
      await sleep(state.speed / 6);
      if (cell) cell.classList.remove('active');
      if (dp[i][w] > dp[i-1][w]) if (cell) cell.classList.add('done');
    }
    log('kp-log', `Processed item ${i} (${items[i-1].name}) — best so far: ${dp[i][W]}`, 'info');
  }

  // traceback
  let res = [], w = W, totalV = 0, totalW = 0;
  for (let i = n; i > 0 && w > 0; i--) {
    if (dp[i][w] !== dp[i-1][w]) {
      res.push(i-1);
      w -= items[i-1].w;
      totalV += items[i-1].v;
      totalW += items[i-1].w;
    }
  }

  res.forEach(i => {
    const el = document.getElementById(`kp-item-${i}`);
    if (el) el.classList.add('selected');
  });

  log('kp-log', `Optimal items: ${res.map(i=>items[i].name).join(', ')}`, 'success');
  log('kp-log', `Max Value: ${totalV} | Total Weight: ${totalW}/${W}`, 'success');
  logCaseConclusion('kp-log');

  state.animRunning = false;
  document.getElementById('kp-solve').disabled = false;
}

// ============================================================
// CASE 3 — MERGE SORT
// ============================================================
function buildMergeSort() {
  const arr = Array.from({length:14}, (_,i) => Math.floor(Math.random()*90)+10);
  return `
    <div class="viz-area">
      <div class="viz-title">👥 Suspect Threat Levels — Merge Sort</div>
      <div class="bars-container" id="ms-bars">
        ${arr.map((v,i) => `<div class="bar" id="ms-bar-${i}" style="height:${v*2}px" data-val="${v}">
          <div style="position:absolute;bottom:-20px;font-size:9px;color:var(--muted);width:100%;text-align:center">${v}</div>
        </div>`).join('')}
      </div>
      <div style="margin-top:30px;font-size:12px;color:var(--muted)">
        <span style="color:var(--accent)">■</span> Comparing &nbsp;
        <span style="color:var(--green)">■</span> Sorted &nbsp;
        <span style="color:var(--accent3)">■</span> Default
      </div>
    </div>
    <div class="log-area" id="ms-log"></div>
    <div class="controls">
      <button class="btn" onclick="resetMergeSort()">🎲 New Suspect List</button>
      <button class="btn" onclick="runMergeSort()">▶ Run Merge Sort</button>
      <button class="btn danger" onclick="resetMergeSort()">↺ Reset</button>
    </div>
    <div id="ms-steps" style="font-family:'Bebas Neue';font-size:13px;color:var(--muted);margin-bottom:16px">Comparisons: <span id="ms-comp">0</span> | Merges: <span id="ms-merge">0</span></div>
    <button class="solve-btn" id="ms-solve" disabled onclick="solveCase(3,250,'Merge Sort completed! Divide & Conquer splits the array recursively then merges sorted halves — guaranteed O(n log n).')">🔓 Case Solved — Submit</button>
  `;
}

let msArr = [], msComps = 0, msMerges = 0;

function resetMergeSort() {
  state.animRunning = false;
  msArr = Array.from({length:14}, () => Math.floor(Math.random()*90)+10);
  clearLog('ms-log');
  const container = document.getElementById('ms-bars');
  if (!container) return;
  container.innerHTML = msArr.map((v,i) =>
    `<div class="bar" id="ms-bar-${i}" style="height:${v*2}px" data-val="${v}">
      <div style="position:absolute;bottom:-20px;font-size:9px;color:var(--muted);width:100%;text-align:center">${v}</div>
    </div>`
  ).join('');
  document.getElementById('ms-solve').disabled = true;
  msComps = 0; msMerges = 0;
  if (document.getElementById('ms-comp')) document.getElementById('ms-comp').textContent = 0;
  if (document.getElementById('ms-merge')) document.getElementById('ms-merge').textContent = 0;
}

async function animateBar(idx, val, cls) {
  const bar = document.getElementById(`ms-bar-${idx}`);
  if (!bar) return;
  bar.style.height = val * 2 + 'px';
  bar.className = 'bar ' + cls;
  bar.querySelector('div').textContent = val;
}

async function mergeSortViz(arr, l, r) {
  if (l >= r) return;
  const mid = Math.floor((l+r)/2);
  log('ms-log', `Dividing [${l}..${r}] → [${l}..${mid}] and [${mid+1}..${r}]`, 'info');
  await sleep(state.speed);
  await mergeSortViz(arr, l, mid);
  await mergeSortViz(arr, mid+1, r);
  await mergeViz(arr, l, mid, r);
}

async function mergeViz(arr, l, mid, r) {
  msMerges++;
  if (document.getElementById('ms-merge')) document.getElementById('ms-merge').textContent = msMerges;
  const left = arr.slice(l, mid+1), right = arr.slice(mid+1, r+1);
  let i=0, j=0, k=l;
  log('ms-log', `Merging [${l}..${mid}] with [${mid+1}..${r}]`, 'warning');
  while (i < left.length && j < right.length) {
    msComps++;
    if (document.getElementById('ms-comp')) document.getElementById('ms-comp').textContent = msComps;
    await animateBar(k, 0, 'comparing');
    await sleep(state.speed / 2);
    if (left[i] <= right[j]) { arr[k] = left[i]; i++; }
    else { arr[k] = right[j]; j++; }
    await animateBar(k, arr[k], 'comparing');
    await sleep(state.speed / 2);
    k++;
  }
  while (i < left.length) { arr[k] = left[i]; await animateBar(k, arr[k], 'sorted'); i++; k++; await sleep(state.speed/3); }
  while (j < right.length) { arr[k] = right[j]; await animateBar(k, arr[k], 'sorted'); j++; k++; await sleep(state.speed/3); }
  for (let x = l; x <= r; x++) await animateBar(x, arr[x], 'sorted');
}

async function runMergeSort() {
  if (state.animRunning) return;
  state.animRunning = true;
  msArr = Array.from({length:14}, (_,i) => {
    const bar = document.getElementById(`ms-bar-${i}`);
    return bar ? parseInt(bar.dataset.val) : Math.floor(Math.random()*90)+10;
  });
  msComps = 0; msMerges = 0;
  log('ms-log', 'Starting Merge Sort — Divide & Conquer', 'info');
  await mergeSortViz(msArr, 0, msArr.length-1);
  log('ms-log', `Sorted! ${msComps} comparisons, ${msMerges} merges`, 'success');
  logCaseConclusion('ms-log');
  state.animRunning = false;
  document.getElementById('ms-solve').disabled = false;
}

// ============================================================
// CASE 4 — N-QUEENS BACKTRACKING
// ============================================================
function buildNQueens() {
  return `
    <div class="slider-row">
      <span>Board Size (N):</span>
      <input type="range" min="4" max="8" value="6" id="nq-n" oninput="document.getElementById('nq-n-val').textContent=this.value;resetNQueens()"/>
      <span id="nq-n-val">6</span>
    </div>
    <div class="viz-area" style="overflow:auto">
      <div class="viz-title">♛ Queens Placement — Backtracking</div>
      <div id="nq-board" style="display:inline-block"></div>
      <div style="margin-top:14px;font-size:12px;color:var(--muted)">
        <span style="color:var(--accent)">♛</span> Queen &nbsp;
        <span style="color:var(--accent2)">✗</span> Attack zone &nbsp;
        <span style="color:var(--green)">■</span> Safe
      </div>
    </div>
    <div class="log-area" id="nq-log"></div>
    <div id="nq-stats" style="font-family:'Bebas Neue';font-size:14px;color:var(--muted);margin-bottom:12px">
      Backtracks: <span id="nq-bt" style="color:var(--accent2)">0</span> | Solutions: <span id="nq-sol" style="color:var(--green)">0</span>
    </div>
    <div class="controls">
      <button class="btn" onclick="resetNQueens()">🎲 New Board Size</button>
      <button class="btn" onclick="runNQueens()">▶ Solve with Backtracking</button>
      <button class="btn danger" onclick="resetNQueens()">↺ Reset</button>
    </div>
    <button class="solve-btn" id="nq-solve" disabled onclick="solveCase(4,500,'Backtracking found all valid queen placements! The algorithm tried, failed, and backtracked — systematically exploring the solution space.')">🔓 Case Solved — Submit</button>
  `;
}

let nqBacktracks = 0, nqSolutions = 0;

function renderNQBoard(board, n, attacking=[]) {
  const div = document.getElementById('nq-board');
  if (!div) return;
  let html = `<div style="display:grid;grid-template-columns:repeat(${n},1fr);gap:2px">`;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const isQ = board[r] === c;
      const isAtk = attacking.some(([ar,ac]) => ar===r && ac===c);
      const bg = isQ ? 'rgba(245,197,24,0.3)' : isAtk ? 'rgba(232,69,60,0.2)' : ((r+c)%2===0 ? 'var(--bg3)' : 'var(--bg)');
      const border = isQ ? '1px solid var(--accent)' : '1px solid var(--border)';
      const content = isQ ? '<span style="color:var(--accent);font-size:20px">♛</span>' : isAtk ? '<span style="color:var(--accent2);font-size:12px">✗</span>' : '';
      html += `<div style="width:44px;height:44px;background:${bg};border:${border};display:flex;align-items:center;justify-content:center">${content}</div>`;
    }
  }
  html += '</div>';
  div.innerHTML = html;
}

function isSafeQ(board, row, col) {
  for (let r = 0; r < row; r++) {
    if (board[r] === col || Math.abs(board[r] - col) === Math.abs(r - row)) return false;
  }
  return true;
}

function resetNQueens() {
  state.animRunning = false;
  nqBacktracks = 0; nqSolutions = 0;
  clearLog('nq-log');
  const n = parseInt(document.getElementById('nq-n')?.value || 6);
  renderNQBoard(new Array(n).fill(-1), n);
  document.getElementById('nq-solve').disabled = true;
  if (document.getElementById('nq-bt')) document.getElementById('nq-bt').textContent = 0;
  if (document.getElementById('nq-sol')) document.getElementById('nq-sol').textContent = 0;
}

async function runNQueens() {
  if (state.animRunning) return;
  state.animRunning = true;
  nqBacktracks = 0; nqSolutions = 0;
  const n = parseInt(document.getElementById('nq-n')?.value || 6);
  const board = new Array(n).fill(-1);
  clearLog('nq-log');
  log('nq-log', `Starting N-Queens backtracking on ${n}×${n} board`, 'info');

  async function solve(row) {
    if (!state.animRunning) return false;
    if (row === n) {
      nqSolutions++;
      if (document.getElementById('nq-sol')) document.getElementById('nq-sol').textContent = nqSolutions;
      log('nq-log', `✓ Solution ${nqSolutions} found: [${board.join(',')}]`, 'success');
      renderNQBoard([...board], n);
      await sleep(state.speed * 2);
      return true;
    }
    for (let col = 0; col < n; col++) {
      if (isSafeQ(board, row, col)) {
        board[row] = col;
        renderNQBoard([...board], n);
        log('nq-log', `Placed queen at row ${row}, col ${col}`, 'info');
        await sleep(state.speed / 2);
        const found = await solve(row + 1);
        if (found && nqSolutions >= 1) return true;
      }
    }
    if (board[row] !== -1) {
      nqBacktracks++;
      if (document.getElementById('nq-bt')) document.getElementById('nq-bt').textContent = nqBacktracks;
      log('nq-log', `✗ Backtracking from row ${row}`, 'error');
      board[row] = -1;
      renderNQBoard([...board], n);
      await sleep(state.speed / 3);
    }
    return false;
  }

  await solve(0);
  log('nq-log', `Done! ${nqSolutions} solutions, ${nqBacktracks} backtracks`, 'success');
  logCaseConclusion('nq-log');
  state.animRunning = false;
  document.getElementById('nq-solve').disabled = false;
}

// ============================================================
// CASE 5 — BFS
// ============================================================
function buildBFS() {
  return `
    <div class="viz-area">
      <div class="viz-title">🕸 Criminal Network — BFS Traversal</div>
      <svg id="bfs-svg" class="graph-svg" viewBox="0 0 700 280"></svg>
      <div style="margin-top:12px;font-size:12px;color:var(--muted)">
        <span style="color:var(--accent2)">■</span> Boss &nbsp;
        <span style="color:var(--accent)">■</span> Current BFS &nbsp;
        <span style="color:var(--green)">■</span> Discovered &nbsp;
        <span style="color:var(--muted)">■</span> Undiscovered
      </div>
    </div>
    <div class="section-label" style="margin-top:12px">BFS Queue</div>
    <div class="queue-container" id="bfs-queue"></div>
    <div class="log-area" id="bfs-log"></div>
    <div class="controls">
      <button class="btn" onclick="generateNewBFSGraph(); initBFSSVG()">🎲 New Network</button>
      <button class="btn" onclick="runBFS()">▶ Run BFS</button>
      <button class="btn danger" onclick="resetBFS()">↺ Reset</button>
    </div>
    <button class="solve-btn" id="bfs-solve" disabled onclick="solveCase(5,350,'BFS discovered the crime boss! Level-by-level traversal guarantees shortest path from street criminal to mastermind.')">🔓 Case Solved — Submit</button>
  `;
}

const bfsGraph = {
  nodes: [
    {id:0,x:350,y:30,label:'BOSS',color:'var(--accent2)'},
    {id:1,x:200,y:100,label:'Lieut1',color:'var(--accent3)'},
    {id:2,x:500,y:100,label:'Lieut2',color:'var(--accent3)'},
    {id:3,x:100,y:190,label:'Crew1',color:'var(--muted)'},
    {id:4,x:250,y:190,label:'Crew2',color:'var(--muted)'},
    {id:5,x:420,y:190,label:'Crew3',color:'var(--muted)'},
    {id:6,x:580,y:190,label:'Crew4',color:'var(--muted)'},
    {id:7,x:50,y:265,label:'Street1',color:'var(--muted)'},
    {id:8,x:170,y:265,label:'Street2',color:'var(--muted)'},
    {id:9,x:310,y:265,label:'Street3',color:'var(--muted)'}
  ],
  edges: [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[3,7],[3,8],[4,8],[5,9]]
};

function generateNewBFSGraph() {
  // Generate new random network with boss at center and layers below
  const newNodes = [
    {id:0,x:350,y:30,label:'BOSS',color:'var(--accent2)'}
  ];
  
  // Layer 1: 2 lieutenants
  const lieuty1 = {id:1,x:200 + Math.random()*100 - 50,y:100 + Math.random()*30 - 15,label:'Lieut1',color:'var(--accent3)'};
  const lieuty2 = {id:2,x:500 + Math.random()*100 - 50,y:100 + Math.random()*30 - 15,label:'Lieut2',color:'var(--accent3)'};
  newNodes.push(lieuty1, lieuty2);
  
  // Layer 2: 4 crew members (random connections)
  const xPositions = [100, 250, 420, 580];
  for(let i = 0; i < 4; i++) {
    newNodes.push({
      id: i+3,
      x: xPositions[i] + Math.random()*60 - 30,
      y: 190 + Math.random()*40 - 20,
      label: `Crew${i+1}`,
      color: 'var(--muted)'
    });
  }
  
  // Layer 3: 3 street contacts
  for(let i = 0; i < 3; i++) {
    newNodes.push({
      id: i+7,
      x: 50 + i*130 + Math.random()*50 - 25,
      y: 265 + Math.random()*30 - 15,
      label: `Street${i+1}`,
      color: 'var(--muted)'
    });
  }
  
  // Generate new random edges (connected to boss and between levels)
  const newEdges = [[0,1],[0,2]]; // Boss connects to both lieutenants
  
  // Random crew connections to lieutenants
  if(Math.random() > 0.3) newEdges.push([1,3]);
  if(Math.random() > 0.3) newEdges.push([1,4]);
  if(Math.random() > 0.3) newEdges.push([2,5]);
  if(Math.random() > 0.3) newEdges.push([2,6]);
  
  // Random street connections
  if(Math.random() > 0.4) newEdges.push([3,7]);
  if(Math.random() > 0.4) newEdges.push([3,8]);
  if(Math.random() > 0.4) newEdges.push([4,8]);
  if(Math.random() > 0.4) newEdges.push([5,9]);
  if(Math.random() > 0.4) newEdges.push([6,9]);
  
  bfsGraph.nodes = newNodes;
  bfsGraph.edges = newEdges;
}

function initBFSSVG() {
  const svg = document.getElementById('bfs-svg');
  if (!svg) return;
  const g = bfsGraph;
  let html = '';
  g.edges.forEach(([u,v]) => {
    const nodeU = g.nodes[u], nodeV = g.nodes[v];
    if(nodeU && nodeV) {
      html += `<line id="bfs-edge-${u}-${v}" class="edge" x1="${nodeU.x}" y1="${nodeU.y}" x2="${nodeV.x}" y2="${nodeV.y}"/>`;
    }
  });
  g.nodes.forEach(n => {
    html += `<g class="node" id="bfs-node-${n.id}">
      <circle cx="${n.x}" cy="${n.y}" r="20" fill="var(--card)" stroke="${n.color}" stroke-width="2"/>
      <text x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="${n.color}" font-family="Courier Prime">${n.label}</text>
    </g>`;
  });
  svg.innerHTML = html;
}

function resetBFS() {
  state.animRunning = false;
  clearLog('bfs-log');
  document.getElementById('bfs-queue').innerHTML = '';
  initBFSSVG();
  document.getElementById('bfs-solve').disabled = true;
}

async function runBFS() {
  if (state.animRunning) return;
  state.animRunning = true;
  clearLog('bfs-log');
  log('bfs-log', 'Starting BFS from street-level criminal (node 7)', 'info');

  const g = bfsGraph;
  const visited = new Set();
  const queue = [7];
  visited.add(7);

  const queueEl = document.getElementById('bfs-queue');

  const updateQueueDisplay = (q) => {
    if (!queueEl) return;
    queueEl.innerHTML = q.map((id,i) =>
      `<div class="queue-item ${i===0?'front':i===q.length-1?'rear':''}">${g.nodes[id].label}</div>`
    ).join('');
  };

  updateQueueDisplay(queue);

  while (queue.length > 0 && state.animRunning) {
    const u = queue.shift();
    updateQueueDisplay(queue);

    const nodeEl = document.getElementById(`bfs-node-${u}`);
    if (nodeEl) nodeEl.querySelector('circle').style.fill = 'rgba(245,197,24,0.4)';
    log('bfs-log', `Dequeued: ${g.nodes[u].label} (Level ${u <= 0 ? 0 : u <= 2 ? 1 : u <= 6 ? 2 : 3})`, 'warning');
    await sleep(state.speed);

    if (u === 0) {
      if (nodeEl) nodeEl.querySelector('circle').style.fill = 'rgba(232,69,60,0.5)';
      log('bfs-log', '🎯 BOSS FOUND! BFS reached the mastermind!', 'success');
      break;
    }

    const neighbors = g.edges
      .filter(([a,b]) => a === u || b === u)
      .map(([a,b]) => a === u ? b : a)
      .filter(v => !visited.has(v));

    for (const v of neighbors) {
      visited.add(v);
      queue.push(v);
      const eEl = document.getElementById(`bfs-edge-${Math.min(u,v)}-${Math.max(u,v)}`) ||
                  document.getElementById(`bfs-edge-${u}-${v}`) ||
                  document.getElementById(`bfs-edge-${v}-${u}`);
      if (eEl) { eEl.style.stroke = 'var(--green)'; eEl.style.strokeWidth = '3'; }
      const vEl = document.getElementById(`bfs-node-${v}`);
      if (vEl) vEl.querySelector('circle').style.fill = 'rgba(57,255,20,0.2)';
      log('bfs-log', `  Discovered: ${g.nodes[v].label}`, 'info');
      await sleep(state.speed / 2);
    }

    if (nodeEl && u !== 0) nodeEl.querySelector('circle').style.fill = 'rgba(57,255,20,0.3)';
    updateQueueDisplay(queue);
  }

  logCaseConclusion('bfs-log');
  state.animRunning = false;
  document.getElementById('bfs-solve').disabled = false;
}

// ============================================================
// CASE 6 — KRUSKAL MST
// ============================================================
function buildKruskal() {
  return `
    <div class="viz-area">
      <div class="viz-title">🔗 Gang Network — Kruskal's MST</div>
      <svg id="kruskal-svg" class="graph-svg" viewBox="0 0 700 280"></svg>
      <div style="margin-top:12px;font-size:12px;color:var(--muted)">
        <span style="color:var(--green)">■</span> MST Edge (Cut this!) &nbsp;
        <span style="color:var(--accent2)">■</span> Rejected (cycle) &nbsp;
        <span style="color:var(--border)">■</span> Unprocessed
      </div>
    </div>
    <div class="log-area" id="kr-log"></div>
    <div class="controls">
      <button class="btn" onclick="generateNewKruskalGraph(); initKruskalSVG()">🎲 New Gang Network</button>
      <button class="btn" onclick="runKruskal()">▶ Run Kruskal's</button>
        <button class="btn danger" onclick="resetKruskal()">↺ Reset</button>
    </div>
    <div id="kr-result" style="font-family:'Courier Prime';font-size:14px;color:var(--muted);margin-bottom:16px"></div>
    <button class="solve-btn" id="kr-solve" disabled onclick="solveCase(6,450,'Kruskal built the MST! Minimum edges found using Union-Find to avoid cycles. Cut these to dismantle the network cheaply.')">🔓 Case Solved — Submit</button>
  `;
}

const krGraph = {
  nodes: [
    {id:0,x:100,y:140,label:'A'},
    {id:1,x:250,y:60,label:'B'},
    {id:2,x:400,y:60,label:'C'},
    {id:3,x:550,y:140,label:'D'},
    {id:4,x:400,y:220,label:'E'},
    {id:5,x:250,y:220,label:'F'}
  ],
  edges: [
    {u:0,v:1,w:6},{u:0,v:5,w:1},{u:1,v:5,w:2},{u:1,v:2,w:5},
    {u:2,v:3,w:5},{u:2,v:4,w:4},{u:3,v:4,w:2},{u:4,v:5,w:3},
    {u:1,v:4,w:8},{u:0,v:3,w:9}
  ]
};

function generateNewKruskalGraph() {
  // Generate new random graph
  const nodeLabels = ['A','B','C','D','E','F'];
  const positions = [
    {x:100,y:140},
    {x:250,y:60},
    {x:400,y:60},
    {x:550,y:140},
    {x:400,y:220},
    {x:250,y:220}
  ];
  
  krGraph.nodes = nodeLabels.map((label, i) => ({
    id: i,
    x: positions[i].x + Math.random()*40 - 20,
    y: positions[i].y + Math.random()*40 - 20,
    label: label
  }));
  
  // Generate random edges with random weights
  const newEdges = [];
  const edgeSet = new Set();
  
  // Ensure connected graph by creating some base edges
  newEdges.push({u:0, v:1, w: Math.floor(Math.random()*8)+1});
  newEdges.push({u:1, v:2, w: Math.floor(Math.random()*8)+1});
  newEdges.push({u:2, v:3, w: Math.floor(Math.random()*8)+1});
  newEdges.push({u:3, v:4, w: Math.floor(Math.random()*8)+1});
  newEdges.push({u:4, v:5, w: Math.floor(Math.random()*8)+1});
  newEdges.push({u:5, v:0, w: Math.floor(Math.random()*8)+1});
  
  // Add random extra edges
  for(let i = 0; i < 4; i++) {
    const u = Math.floor(Math.random() * 6);
    const v = Math.floor(Math.random() * 6);
    if(u !== v && !edgeSet.has(`${Math.min(u,v)}-${Math.max(u,v)}`)) {
      edgeSet.add(`${Math.min(u,v)}-${Math.max(u,v)}`);
      newEdges.push({u, v, w: Math.floor(Math.random()*10)+1});
    }
  }
  
  krGraph.edges = newEdges;
}

function initKruskalSVG() {
  const svg = document.getElementById('kruskal-svg');
  if (!svg) return;
  const g = krGraph;
  let html = '';
  g.edges.forEach((e,i) => {
    const u = g.nodes[e.u], v = g.nodes[e.v];
    const mx = (u.x+v.x)/2, my = (u.y+v.y)/2;
    html += `<line id="kr-edge-${i}" class="edge" x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}"/>`;
    html += `<rect x="${mx-8}" y="${my-8}" width="16" height="14" fill="var(--bg)" rx="2"/>`;
    html += `<text x="${mx}" y="${my+2}" text-anchor="middle" font-size="11" fill="var(--accent)" font-family="Courier Prime">${e.w}</text>`;
  });
  g.nodes.forEach(n => {
    html += `<g id="kr-node-${n.id}">
      <circle cx="${n.x}" cy="${n.y}" r="20" fill="var(--card)" stroke="var(--accent3)" stroke-width="2"/>
      <text x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="middle" font-size="13" fill="var(--accent3)" font-family="Courier Prime">${n.label}</text>
    </g>`;
  });
  svg.innerHTML = html;
}

function resetKruskal() {
  state.animRunning = false;
  clearLog('kr-log');
  initKruskalSVG();
  document.getElementById('kr-solve').disabled = true;
  document.getElementById('kr-result').textContent = '';
}

async function runKruskal() {
  if (state.animRunning) return;
  state.animRunning = true;
  clearLog('kr-log');

  const g = krGraph;
  const parent = Array.from({length:6}, (_,i) => i);
  const rank = new Array(6).fill(0);

  function find(x) { if (parent[x] !== x) parent[x] = find(parent[x]); return parent[x]; }
  function union(x,y) {
    const px = find(x), py = find(y);
    if (px === py) return false;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
  }

  const sorted = [...g.edges.entries()].sort((a,b) => a[1].w - b[1].w);
  log('kr-log', `Edges sorted by weight: ${sorted.map(([_,e])=>e.w).join(', ')}`, 'info');

  let mstWeight = 0, mstCount = 0;

  for (const [i, edge] of sorted) {
    const eEl = document.getElementById(`kr-edge-${i}`);
    if (eEl) { eEl.style.stroke = 'var(--accent)'; eEl.style.strokeWidth = '3'; }
    await sleep(state.speed);

    if (union(edge.u, edge.v)) {
      mstWeight += edge.w;
      mstCount++;
      log('kr-log', `✓ Added edge ${g.nodes[edge.u].label}-${g.nodes[edge.v].label} (w=${edge.w}) to MST`, 'success');
      if (eEl) { eEl.style.stroke = 'var(--green)'; eEl.style.strokeWidth = '4'; }
    } else {
      log('kr-log', `✗ Rejected ${g.nodes[edge.u].label}-${g.nodes[edge.v].label} (cycle!)`, 'error');
      if (eEl) { eEl.style.stroke = 'var(--accent2)'; eEl.style.strokeWidth = '2'; }
    }
    await sleep(state.speed);
    if (mstCount === g.nodes.length - 1) break;
  }

  document.getElementById('kr-result').innerHTML = `<span style="color:var(--green)">MST Total Weight: ${mstWeight} | Edges used: ${mstCount}</span>`;
  log('kr-log', `Kruskal complete. MST weight: ${mstWeight}`, 'success');
  logCaseConclusion('kr-log');
  state.animRunning = false;
  document.getElementById('kr-solve').disabled = false;
}

// ============================================================
// CASE 7 — TSP BRANCH & BOUND
// ============================================================
let tspCities = [
  {id:0,x:100,y:140,label:'HQ'},
  {id:1,x:250,y:60,label:'C1'},
  {id:2,x:440,y:60,label:'C2'},
  {id:3,x:580,y:160,label:'C3'},
  {id:4,x:440,y:240,label:'C4'},
  {id:5,x:250,y:240,label:'C5'}
];

function createRandomTSPCities() {
  const base = [
    {id:0,x:100,y:140,label:'HQ'},
    {id:1,x:250,y:60,label:'C1'},
    {id:2,x:440,y:60,label:'C2'},
    {id:3,x:580,y:160,label:'C3'},
    {id:4,x:440,y:240,label:'C4'},
    {id:5,x:250,y:240,label:'C5'}
  ];

  return base.map(city => ({
    ...city,
    x: Math.max(70, Math.min(630, city.x + Math.floor(Math.random() * 161) - 80)),
    y: Math.max(40, Math.min(260, city.y + Math.floor(Math.random() * 121) - 60))
  }));
}

function buildTSP() {
  const cities = tspCities;

  return `
    <div class="viz-area">
      <div class="viz-title">🗺 Crime Scene Tour — TSP Branch & Bound</div>
      <svg id="tsp-svg" class="graph-svg" viewBox="0 0 700 300">
        ${cities.map(c => `
          <g>
            <circle cx="${c.x}" cy="${c.y}" r="22" fill="var(--card)" stroke="var(--accent3)" stroke-width="2" id="tsp-node-${c.id}"/>
            <text x="${c.x}" y="${c.y}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="var(--accent3)" font-family="Courier Prime" font-weight="bold">${c.label}</text>
          </g>
        `).join('')}
        <g id="tsp-path-lines"></g>
      </svg>
    </div>
    <div class="log-area" id="tsp-log"></div>
    <div id="tsp-result" style="font-family:'Bebas Neue';font-size:20px;color:var(--accent);margin-bottom:12px"></div>
    <div class="controls">
      <button class="btn" onclick="generateNewTSP()">🎲 New Crime Scenes</button>
      <button class="btn" onclick="runTSP()">▶ Run Branch & Bound</button>
      <button class="btn danger" onclick="resetTSP()">↺ Reset</button>
    </div>
    <button class="solve-btn" id="tsp-solve" disabled onclick="solveCase(7,600,'TSP solved with Branch & Bound! Unlike brute force O(n!), B&B prunes hopeless branches — dramatically reducing search space.')">🔓 Case Solved — Submit</button>
  `;
}

function resetTSP() {
  state.animRunning = false;
  clearLog('tsp-log');
  document.getElementById('tsp-path-lines').innerHTML = '';
  document.getElementById('tsp-result').textContent = '';
  document.getElementById('tsp-solve').disabled = true;
}

  function generateNewTSP() {
    tspCities = createRandomTSPCities();
    resetTSP();
    renderCase(7);
  }
async function runTSP() {
  if (state.animRunning) return;
  state.animRunning = true;
  clearLog('tsp-log');

  const cities = tspCities.map(c => ({x: c.x, y: c.y}));
  const labels = ['HQ','C1','C2','C3','C4','C5'];
  const n = cities.length;

  const dist = Array(n).fill(null).map((_,i) =>
    Array(n).fill(0).map((_,j) => {
      const dx = cities[i].x - cities[j].x;
      const dy = cities[i].y - cities[j].y;
      return Math.round(Math.sqrt(dx*dx+dy*dy));
    })
  );

  log('tsp-log', `TSP with ${n} cities. Brute force: ${[...Array(n-1)].reduce((a,_,i)=>a*(i+2),1)} routes. B&B prunes!`, 'info');

  let best = Infinity, bestPath = [];
  let pruned = 0;

  async function bnb(path, visited, cost) {
    if (!state.animRunning) return;
    if (path.length === n) {
      const total = cost + dist[path[path.length-1]][0];
      if (total < best) {
        best = total;
        bestPath = [...path, 0];
        log('tsp-log', `New best: ${bestPath.map(i=>labels[i]).join('→')} = ${best}`, 'success');
        drawTSPPath(cities, bestPath);
        await sleep(state.speed);
      }
      return;
    }
    for (let next = 1; next < n; next++) {
      if (visited.has(next)) continue;
      const newCost = cost + dist[path[path.length-1]][next];
      if (newCost >= best) { pruned++; continue; }
      path.push(next);
      visited.add(next);
      await bnb(path, visited, newCost);
      path.pop();
      visited.delete(next);
    }
  }

  await bnb([0], new Set([0]), 0);

  log('tsp-log', `Optimal tour: ${bestPath.map(i=>labels[i]).join(' → ')}`, 'success');
  log('tsp-log', `Minimum distance: ${best} | Branches pruned: ${pruned}`, 'success');
  logCaseConclusion('tsp-log');
  document.getElementById('tsp-result').textContent = `Optimal Route: ${best} units`;
  drawTSPPath(cities, bestPath);

  state.animRunning = false;
  document.getElementById('tsp-solve').disabled = false;
}

function drawTSPPath(cities, path) {
  const g = document.getElementById('tsp-path-lines');
  if (!g) return;
  g.innerHTML = path.slice(0,-1).map((c,i) => {
    const nc = path[i+1];
    return `<line x1="${cities[c].x}" y1="${cities[c].y}" x2="${cities[nc].x}" y2="${cities[nc].y}" stroke="var(--green)" stroke-width="3" stroke-dasharray="6,3" opacity="0.8"/>`;
  }).join('');
}

// ============================================================
// CASE 8 — HUFFMAN
// ============================================================
function buildHuffman() {
  return `
    <div class="section-label">Enter Criminal Message to Encode</div>
    <input class="text-input" id="huff-input" value="INVESTIGATION" placeholder="Type message..." style="margin-bottom:16px"/>
    <div class="viz-area">
      <div class="viz-title">🌳 Huffman Tree — Greedy Encoding</div>
      <div id="huff-freq" style="margin-bottom:16px;flex-wrap:wrap;display:flex;gap:8px"></div>
      <div id="huff-tree-wrap" style="overflow-x:auto;overflow-y:auto;max-height:65vh;max-width:100%;border:1px solid var(--border);padding:6px;background:var(--bg)">
        <svg id="huff-tree" width="100%" height="220" viewBox="0 0 700 220"></svg>
      </div>
      <div id="huff-codes" style="margin-top:14px;font-size:12px;font-family:'Courier Prime';line-height:2;color:var(--text)"></div>
    </div>
    <div id="huff-result" style="background:var(--bg3);border:1px solid var(--border);padding:14px 18px;margin-bottom:16px;font-size:13px;display:none">
      <div style="color:var(--muted);margin-bottom:6px;font-size:10px;letter-spacing:3px">ENCODED OUTPUT</div>
      <div id="huff-encoded" style="word-break:break-all;color:var(--accent3);font-family:'Courier Prime'"></div>
      <div id="huff-ratio" style="margin-top:10px;color:var(--green);font-family:'Bebas Neue';font-size:20px"></div>
    </div>
    <div class="controls">
      <button class="btn" onclick="document.getElementById('huff-input').value=''; clearHuffman()">🎲 New Message</button>
      <button class="btn" onclick="runHuffman()">▶ Build Huffman Tree</button>
      <button class="btn success" onclick="encodeHuffman()">⚡ Encode Message</button>
    </div>
    <button class="solve-btn" id="huff-solve" disabled onclick="solveCase(8,380,'Huffman Encoding built! Greedy algorithm assigns minimum bits to most frequent characters — optimal prefix-free encoding.')">🔓 Case Solved — Submit</button>
  `;
}

let huffCodes = {};

function clearHuffman() {
  document.getElementById('huff-freq').innerHTML = '';
  document.getElementById('huff-tree').innerHTML = '';
  const wrap = document.getElementById('huff-tree-wrap');
  if (wrap) { wrap.scrollTop = 0; wrap.scrollLeft = 0; }
  document.getElementById('huff-codes').innerHTML = '';
  document.getElementById('huff-result').style.display = 'none';
  document.getElementById('huff-solve').disabled = true;
  huffCodes = {};
}

function runHuffman() {
  const msg = document.getElementById('huff-input')?.value.toUpperCase() || 'HELLO';
  if (!msg) return;

  const freq = {};
  for (const c of msg) freq[c] = (freq[c]||0) + 1;

  const freqDiv = document.getElementById('huff-freq');
  if (freqDiv) {
    freqDiv.innerHTML = Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([c,f]) =>
      `<div class="huffman-char">${c}: ${f}</div>`
    ).join('');
  }

  // Build tree
  let nodes = Object.entries(freq).map(([c,f]) => ({char:c,freq:f,left:null,right:null}));
  while (nodes.length > 1) {
    nodes.sort((a,b) => a.freq - b.freq);
    const left = nodes.shift(), right = nodes.shift();
    nodes.push({char:null,freq:left.freq+right.freq,left,right});
  }
  const root = nodes[0];

  // Generate codes
  huffCodes = {};
  function genCodes(node, code) {
    if (!node) return;
    if (node.char) { huffCodes[node.char] = code || '0'; return; }
    genCodes(node.left, code+'0');
    genCodes(node.right, code+'1');
  }
  genCodes(root, '');

  const codesDiv = document.getElementById('huff-codes');
  if (codesDiv) {
    codesDiv.innerHTML = '<strong style="color:var(--accent)">Codes: </strong>' +
      Object.entries(huffCodes).sort((a,b)=>a[1].length-b[1].length).map(([c,code]) =>
        `<span style="margin-right:16px"><span style="color:var(--accent)">${c}</span> → <span style="color:var(--accent3)">${code}</span></span>`
      ).join('') +
      `<div style="margin-top:10px;color:var(--green)">${CASE_RUN_CONCLUSIONS[state.currentCase] || ''}</div>`;
  }

  // Draw simple tree
  const svg = document.getElementById('huff-tree');
  if (svg) {
    const metrics = getHuffmanTreeMetrics(root);
    const svgWidth = Math.max(700, metrics.leaves * 90);
    const svgHeight = Math.max(220, metrics.depth * 90 + 40);
    const levelGap = Math.max(55, Math.floor((svgHeight - 40) / Math.max(metrics.depth - 1, 1)));

    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute('height', `${svgHeight}`);
    svg.style.width = `${svgWidth}px`;
    svg.style.maxWidth = 'none';

    let treeHTML = '';
    const drawNode = (node, x, y, spread) => {
      if (!node) return;
      if (node.left) {
        treeHTML += `<line x1="${x}" y1="${y}" x2="${x-spread}" y2="${y+levelGap}" stroke="var(--border)" stroke-width="1.5"/>`;
        drawNode(node.left, x-spread, y+levelGap, Math.max(spread*0.55, 24));
      }
      if (node.right) {
        treeHTML += `<line x1="${x}" y1="${y}" x2="${x+spread}" y2="${y+levelGap}" stroke="var(--border)" stroke-width="1.5"/>`;
        drawNode(node.right, x+spread, y+levelGap, Math.max(spread*0.55, 24));
      }
      const isLeaf = !node.left && !node.right;
      treeHTML += `<circle cx="${x}" cy="${y}" r="18" fill="var(--card)" stroke="${isLeaf?'var(--accent)':'var(--border)'}" stroke-width="${isLeaf?2:1}"/>`;
      treeHTML += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${isLeaf?12:10}" fill="${isLeaf?'var(--accent)':'var(--muted)'}" font-family="Courier Prime">${isLeaf?node.char:node.freq}</text>`;
    };
    drawNode(root, svgWidth / 2, 24, Math.max(svgWidth / 4, 140));
    svg.innerHTML = treeHTML;
  }

  document.getElementById('huff-solve').disabled = false;
}

function getHuffmanTreeMetrics(root) {
  let depth = 0;
  let leaves = 0;

  function walk(node, level) {
    if (!node) return;
    depth = Math.max(depth, level);
    if (!node.left && !node.right) {
      leaves++;
      return;
    }
    walk(node.left, level + 1);
    walk(node.right, level + 1);
  }

  walk(root, 1);
  return { depth, leaves: Math.max(leaves, 1) };
}

function encodeHuffman() {
  if (!Object.keys(huffCodes).length) { runHuffman(); return; }
  const msg = document.getElementById('huff-input')?.value.toUpperCase() || '';
  const encoded = msg.split('').map(c => huffCodes[c]||'').join(' ');
  const origBits = msg.length * 8;
  const encBits = encoded.replace(/ /g,'').length;
  const ratio = ((1 - encBits/origBits)*100).toFixed(1);

  const res = document.getElementById('huff-result');
  if (res) res.style.display = 'block';
  const encEl = document.getElementById('huff-encoded');
  if (encEl) encEl.textContent = encoded;
  const ratioEl = document.getElementById('huff-ratio');
  if (ratioEl) {
    const conclusion = CASE_RUN_CONCLUSIONS[state.currentCase] || '';
    ratioEl.textContent = `Compression: ${ratio}% saved | ${origBits} bits → ${encBits} bits | ${conclusion}`;
  }
}

// ============================================================
// CASE 9 — MAZE BACKTRACKING
// ============================================================
function buildMaze() {
  return `
    <div class="viz-area" style="overflow:auto;text-align:center">
      <div class="viz-title">🏃 Warehouse Maze — Backtracking Escape</div>
      <div id="maze-container"></div>
      <div style="margin-top:12px;font-size:12px;color:var(--muted)">
        🟩 Start &nbsp; 🟥 End &nbsp;
        <span style="color:var(--accent3)">■</span> Visited &nbsp;
        <span style="color:var(--green)">■</span> Solution Path
      </div>
    </div>
    <div class="log-area" id="maze-log"></div>
    <div id="maze-stats" style="font-family:'Bebas Neue';font-size:16px;color:var(--muted);margin-bottom:12px">
      Steps: <span id="maze-steps" style="color:var(--accent)">0</span> | Backtracks: <span id="maze-bt" style="color:var(--accent2)">0</span>
    </div>
    <div class="controls">
      <button class="btn" onclick="generateMaze()">🎲 New Maze</button>
      <button class="btn" onclick="runMaze()">▶ Solve Maze</button>
      <button class="btn danger" onclick="resetMazePath()">↺ Reset Path</button>
    </div>
    <button class="solve-btn" id="maze-solve" disabled onclick="solveCase(9,350,'Escape route found! Backtracking systematically explored all paths, retreating from dead ends until the exit was found.')">🔓 Case Solved — Submit</button>
  `;
}

let mazeGrid = [], mazeRows = 9, mazeCols = 13;
let mazeSteps = 0, mazeBT = 0;

function generateMaze() {
  // Simple maze with random walls
  const grid = Array(mazeRows).fill(null).map(() => Array(mazeCols).fill(1));

  // DFS maze generation
  const stack = [[1,1]];
  grid[1][1] = 0;

  const dirs = [[0,2],[2,0],[0,-2],[-2,0]];

  while (stack.length) {
    const [r,c] = stack[stack.length-1];
    const shuffled = dirs.sort(() => Math.random()-0.5);
    let moved = false;
    for (const [dr,dc] of shuffled) {
      const nr = r+dr, nc = c+dc;
      if (nr > 0 && nr < mazeRows-1 && nc > 0 && nc < mazeCols-1 && grid[nr][nc] === 1) {
        grid[r+dr/2][c+dc/2] = 0;
        grid[nr][nc] = 0;
        stack.push([nr,nc]);
        moved = true;
        break;
      }
    }
    if (!moved) stack.pop();
  }

  // Ensure start and end
  grid[1][1] = 0;
  grid[mazeRows-2][mazeCols-2] = 0;

  mazeGrid = grid;
  renderMazeGrid();
  clearLog('maze-log');
  document.getElementById('maze-solve').disabled = true;
}

function renderMazeGrid(visited=new Set(), solution=new Set(), current=null) {
  const container = document.getElementById('maze-container');
  if (!container) return;
  let html = `<div class="maze-grid" style="grid-template-columns:repeat(${mazeCols},1fr)">`;
  for (let r = 0; r < mazeRows; r++) {
    for (let c = 0; c < mazeCols; c++) {
      const key = `${r},${c}`;
      const isStart = r===1 && c===1;
      const isEnd = r===mazeRows-2 && c===mazeCols-2;
      const isCurrent = current && current[0]===r && current[1]===c;
      let cls = mazeGrid[r][c] === 1 ? 'wall' : 'path';
      if (isStart) cls = 'start';
      else if (isEnd) cls = 'end';
      else if (isCurrent) cls = 'current';
      else if (solution.has(key)) cls = 'solution';
      else if (visited.has(key)) cls = 'visited';
      const content = isStart ? '🟢' : isEnd ? '🔴' : '';
      html += `<div class="maze-cell ${cls}">${content}</div>`;
    }
  }
  html += '</div>';
  container.innerHTML = html;
}

function resetMazePath() {
  state.animRunning = false;
  mazeSteps = 0; mazeBT = 0;
  clearLog('maze-log');
  renderMazeGrid();
  if (document.getElementById('maze-steps')) document.getElementById('maze-steps').textContent = 0;
  if (document.getElementById('maze-bt')) document.getElementById('maze-bt').textContent = 0;
  document.getElementById('maze-solve').disabled = true;
}

async function runMaze() {
  if (!mazeGrid.length) { generateMaze(); return; }
  if (state.animRunning) return;
  state.animRunning = true;
  mazeSteps = 0; mazeBT = 0;
  clearLog('maze-log');
  log('maze-log', 'Starting backtracking maze solver...', 'info');

  const visited = new Set();
  const path = [];
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

  async function solve(r, c) {
    if (!state.animRunning) return false;
    const key = `${r},${c}`;
    if (r < 0 || r >= mazeRows || c < 0 || c >= mazeCols) return false;
    if (mazeGrid[r][c] === 1 || visited.has(key)) return false;

    visited.add(key);
    path.push(key);
    mazeSteps++;
    if (document.getElementById('maze-steps')) document.getElementById('maze-steps').textContent = mazeSteps;

    renderMazeGrid(visited, new Set(), [r,c]);
    await sleep(80);

    if (r === mazeRows-2 && c === mazeCols-2) {
      renderMazeGrid(visited, new Set(path), null);
      log('maze-log', `Exit found! Path length: ${path.length}`, 'success');
      return true;
    }

    for (const [dr,dc] of dirs) {
      if (await solve(r+dr, c+dc)) return true;
    }

    // Backtrack
    path.pop();
    mazeBT++;
    if (document.getElementById('maze-bt')) document.getElementById('maze-bt').textContent = mazeBT;
    log('maze-log', `Backtracking from (${r},${c})`, 'error');
    return false;
  }

  const found = await solve(1, 1);
  if (!found) log('maze-log', 'No solution found!', 'error');
  if (found) logCaseConclusion('maze-log');
  state.animRunning = false;
  if (found) document.getElementById('maze-solve').disabled = false;
}

// ============================================================
// CASE 10 — QUICK SORT
// ============================================================
function buildQuickSort() {
  return `
    <div class="viz-area">
      <div class="viz-title">⚡ Criminal Records — Quick Sort Final Showdown</div>
      <div class="bars-container" id="qs-bars" style="height:200px"></div>
      <div style="margin-top:30px;font-size:12px;color:var(--muted)">
        <span style="color:var(--accent2)">■</span> Pivot &nbsp;
        <span style="color:var(--accent)">■</span> Comparing &nbsp;
        <span style="color:var(--green)">■</span> Sorted
      </div>
    </div>
    <div class="two-col" style="margin-bottom:16px">
      <div class="info-box">
        <div class="info-box-label">Quick Sort Stats</div>
        <div class="info-box-value">Comparisons: <span id="qs-comp">0</span></div>
        <div class="info-box-value">Swaps: <span id="qs-swap">0</span></div>
      </div>
      <div class="info-box">
        <div class="info-box-label">Algorithm</div>
        <div class="info-box-value" style="font-size:12px">Partition: Lomuto scheme</div>
        <div class="info-box-value" style="font-size:12px">Pivot: Last element</div>
      </div>
    </div>
    <div class="log-area" id="qs-log"></div>
    <div class="controls">
      <button class="btn" onclick="resetQuickSort()">🎲 New Record Set</button>
      <button class="btn" onclick="runQuickSort()">▶ Run Quick Sort</button>
      <button class="btn danger" onclick="resetQuickSort()">↺ Reset</button>
    </div>
    <button class="solve-btn" id="qs-solve" disabled onclick="solveCase(10,500,'Quick Sort mastered! Divide & Conquer with in-place partitioning — average O(n log n) with minimal space overhead. All 10 cases solved!')">🏆 FINAL CASE SOLVED — Submit</button>
  `;
}

let qsArr = [], qsComps = 0, qsSwaps = 0;

function resetQuickSort() {
  state.animRunning = false;
  qsArr = Array.from({length:16}, () => Math.floor(Math.random()*80)+10);
  clearLog('qs-log');
  const container = document.getElementById('qs-bars');
  if (!container) return;
  container.innerHTML = qsArr.map((v,i) =>
    `<div class="bar" id="qs-bar-${i}" style="height:${v*2}px" data-val="${v}">
      <div style="position:absolute;bottom:-20px;font-size:9px;color:var(--muted);width:100%;text-align:center">${v}</div>
    </div>`
  ).join('');
  document.getElementById('qs-solve').disabled = true;
  qsComps = 0; qsSwaps = 0;
  if (document.getElementById('qs-comp')) document.getElementById('qs-comp').textContent = 0;
  if (document.getElementById('qs-swap')) document.getElementById('qs-swap').textContent = 0;
}

async function qsSetBar(i, val, cls) {
  const bar = document.getElementById(`qs-bar-${i}`);
  if (!bar) return;
  bar.style.height = val * 2 + 'px';
  bar.className = 'bar ' + cls;
  const label = bar.querySelector('div');
  if (label) label.textContent = val;
}

async function partition(arr, low, high) {
  const pivot = arr[high];
  await qsSetBar(high, pivot, 'pivot');
  let i = low - 1;

  for (let j = low; j < high; j++) {
    qsComps++;
    if (document.getElementById('qs-comp')) document.getElementById('qs-comp').textContent = qsComps;
    await qsSetBar(j, arr[j], 'comparing');
    await sleep(state.speed / 4);
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      qsSwaps++;
      if (document.getElementById('qs-swap')) document.getElementById('qs-swap').textContent = qsSwaps;
      await qsSetBar(i, arr[i], 'comparing');
      await qsSetBar(j, arr[j], 'comparing');
      await sleep(state.speed / 4);
    }
    await qsSetBar(j, arr[j], '');
  }
  [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
  qsSwaps++;
  await qsSetBar(i+1, arr[i+1], 'sorted');
  return i + 1;
}

async function quickSortViz(arr, low, high) {
  if (!state.animRunning || low >= high) return;
  log('qs-log', `Partitioning [${low}..${high}] — pivot=${arr[high]}`, 'info');
  const pi = await partition(arr, low, high);
  await sleep(state.speed / 2);
  await quickSortViz(arr, low, pi - 1);
  await quickSortViz(arr, pi + 1, high);
}

async function runQuickSort() {
  if (state.animRunning) return;
  state.animRunning = true;
  qsComps = 0; qsSwaps = 0;
  qsArr = Array.from({length:16}, (_,i) => {
    const bar = document.getElementById(`qs-bar-${i}`);
    return bar ? parseInt(bar.dataset.val) : Math.floor(Math.random()*80)+10;
  });
  clearLog('qs-log');
  log('qs-log', 'Starting Quick Sort — Lomuto partition scheme', 'info');
  await quickSortViz(qsArr, 0, qsArr.length - 1);

  // Mark all sorted
  for (let i = 0; i < qsArr.length; i++) await qsSetBar(i, qsArr[i], 'sorted');
  log('qs-log', `Sorted! ${qsComps} comparisons, ${qsSwaps} swaps`, 'success');
  logCaseConclusion('qs-log');
  state.animRunning = false;
  document.getElementById('qs-solve').disabled = false;
}

// ============================================================
// CASE 11 — FLOYD-WARSHALL ALL-PAIRS SHORTEST PATH
// ============================================================
function buildFloydWarshall() {
  const nodes = ['A','B','C','D','E'];
  const dist = [
    [0, 4, Infinity, 2, Infinity],
    [Infinity, 0, 1, Infinity, Infinity],
    [Infinity, Infinity, 0, Infinity, 3],
    [Infinity, Infinity, 4, 0, 5],
    [Infinity, Infinity, Infinity, Infinity, 0]
  ];
  
  return `
    <div class="viz-area">
      <div class="viz-title">🏠 Safe House Network — Floyd-Warshall Distance Matrix</div>
      <div id="fw-matrix" style="overflow-x:auto;text-align:center;margin:16px 0"></div>
    </div>
    <div class="log-area" id="fw-log"></div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px">
      Nodes: A,B,C,D,E (Safe houses) | Find shortest distance between every pair
    </div>
    <div class="controls">
      <button class="btn" onclick="generateFloydWarshall()">🎲 New Graph</button>
      <button class="btn" onclick="runFloydWarshall()">▶ Run Floyd-Warshall</button>
      <button class="btn danger" onclick="resetFloydWarshall()">↺ Reset</button>
    </div>
    <button class="solve-btn" id="fw-solve" disabled onclick="solveCase(11,600,'All-pairs shortest path computed! Floyd-Warshall distance matrix now enables instant route queries between any safe houses.')">🔓 Case Solved — Submit</button>
  `;
}

let fwDist = [
  [0, 4, Infinity, 2, Infinity],
  [Infinity, 0, 1, Infinity, Infinity],
  [Infinity, Infinity, 0, Infinity, 3],
  [Infinity, Infinity, 4, 0, 5],
  [Infinity, Infinity, Infinity, Infinity, 0]
];
const fwNodes = ['A','B','C','D','E'];

function generateFloydWarshall() {
  fwDist = [
    [0, Math.random() > 0.3 ? Math.floor(Math.random()*8)+1 : Infinity, Infinity, Math.floor(Math.random()*5)+1, Infinity],
    [Infinity, 0, Math.floor(Math.random()*5)+1, Infinity, Infinity],
    [Infinity, Infinity, 0, Infinity, Math.floor(Math.random()*7)+1],
    [Infinity, Infinity, Math.floor(Math.random()*6)+1, 0, Math.floor(Math.random()*5)+1],
    [Infinity, Infinity, Infinity, Infinity, 0]
  ];
  resetFloydWarshall();
}

function resetFloydWarshall() {
  clearLog('fw-log');
  document.getElementById('fw-matrix').innerHTML = '';
  document.getElementById('fw-solve').disabled = true;
}

async function runFloydWarshall() {
  if (state.animRunning) return;
  state.animRunning = true;
  clearLog('fw-log');
  
  const n = fwNodes.length;
  const dist = fwDist.map(row => [...row]);
  const next = Array(n).fill(null).map((_, i) => Array(n).fill(null).map((_, j) => (dist[i][j] !== Infinity ? j : null)));
  
  log('fw-log', `Initializing distance matrix for ${n} safe houses...`, 'info');
  renderFWMatrix(dist, -1, -1);
  await sleep(state.speed);
  
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const via = dist[i][k] + dist[k][j];
        if (via < dist[i][j]) {
          dist[i][j] = via;
          next[i][j] = next[i][k];
        }
      }
    }
    log('fw-log', `Processed via node ${fwNodes[k]} — checking all path improvements`, 'info');
    renderFWMatrix(dist, k, k);
    await sleep(state.speed);
  }
  
  log('fw-log', `Complete! All ${n}×${n} distances computed using Floyd-Warshall...`, 'success');
  renderFWMatrix(dist, -1, -1);
  logCaseConclusion('fw-log');
  
  state.animRunning = false;
  document.getElementById('fw-solve').disabled = false;
}

function renderFWMatrix(dist, hiRow, hiCol) {
  const n = dist.length;
  let html = '<table class="dp-table" style="margin:auto"><tr><th>Safe\\ Dist</th>';
  for (let j = 0; j < n; j++) html += `<th>${fwNodes[j]}</th>`;
  html += '</tr>';
  for (let i = 0; i < n; i++) {
    html += `<tr><th>${fwNodes[i]}</th>`;
    for (let j = 0; j < n; j++) {
      const val = dist[i][j];
      const isInf = val === Infinity;
      const cls = (i === hiRow && j === hiCol) ? ' active' : '';
      html += `<td class="${cls}" style="color:${isInf ? 'var(--muted)' : val < 5 ? 'var(--green)' : 'var(--accent)'}">${isInf ? '∞' : val}</td>`;
    }
    html += '</tr>';
  }
  html += '</table>';
  document.getElementById('fw-matrix').innerHTML = html;
}

// ============================================================
// CASE 12 — LONGEST COMMON SUBSEQUENCE (LCS)
// ============================================================
function buildLCS() {
  const seq1 = 'INTERVIEW WITNESS';
  const seq2 = 'INVESTIGATE WITH ';
  
  return `
    <div class="viz-area">
      <div class="viz-title">🔍 Pattern Detector — Longest Common Subsequence</div>
      <div style="margin:16px;font-size:13px">
        <div style="margin-bottom:8px"><strong>Suspect A Log:</strong> <span style="color:var(--accent)">${seq1}</span></div>
        <div style="margin-bottom:16px"><strong>Suspect B Log:</strong> <span style="color:var(--accent3)">${seq2}</span></div>
      </div>
      <div id="lcs-table" style="overflow-x:auto;text-align:center;margin:16px 0"></div>
    </div>
    <div class="log-area" id="lcs-log"></div>
    <div class="controls">
      <button class="btn" onclick="generateLCS()">🎲 New Logs</button>
      <button class="btn" onclick="runLCS()">▶ Find LCS</button>
      <button class="btn danger" onclick="resetLCS()">↺ Reset</button>
    </div>
    <button class="solve-btn" id="lcs-solve" disabled onclick="solveCase(12,480,'LCS found! Common behavioral pattern identified—suspects are linked through matching actions.')">🔓 Case Solved — Submit</button>
  `;
}

let lcsSeq1 = 'INTERVIEW WITNESS';
let lcsSeq2 = 'INVESTIGATE WITH ';

function generateLCS() {
  const actions = ['INTERVIEW', 'INVESTIGATE', 'FIND', 'ARREST', 'WATCH', 'WITNESS', 'SUSPECT', 'WITH', 'FOR'];
  const pick = (n) => actions[Math.floor(Math.random() * actions.length)];
  lcsSeq1 = `${pick(1)} ${pick(2)} ${pick(3)}`;
  lcsSeq2 = `${pick(1)} ${pick(2)} ${pick(3)}`;
  resetLCS();
}

function resetLCS() {
  clearLog('lcs-log');
  document.getElementById('lcs-table').innerHTML = '';
  document.getElementById('lcs-solve').disabled = true;
}

async function runLCS() {
  if (state.animRunning) return;
  state.animRunning = true;
  clearLog('lcs-log');
  
  const m = lcsSeq1.length;
  const n = lcsSeq2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  log('lcs-log', `Computing LCS for sequences of length ${m} and ${n}...`, 'info');
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (lcsSeq1[i - 1] === lcsSeq2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    await sleep(state.speed / 4);
  }
  
  let lcs = '';
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (lcsSeq1[i - 1] === lcsSeq2[j - 1]) {
      lcs = lcsSeq1[i - 1] + lcs;
      i--; j--;
    } else {
      dp[i][j] >= dp[i - 1][j] ? i-- : j--;
    }
  }
  
  log('lcs-log', `LCS Length: ${dp[m][n]} | Matched Sequence: "${lcs}"`, 'success');
  renderLCSTable(dp);
  logCaseConclusion('lcs-log');
  
  state.animRunning = false;
  document.getElementById('lcs-solve').disabled = false;
}

function renderLCSTable(dp) {
  let html = '<table class="dp-table"><tr><th>Char\\Char</th>';
  for (let c of lcsSeq2) html += `<th style="font-size:11px">${c}</th>`;
  html += '</tr>';
  for (let i = 0; i <= lcsSeq1.length; i++) {
    html += `<tr><th style="font-size:11px">${i === 0 ? '-' : lcsSeq1[i - 1]}</th>`;
    for (let j = 0; j <= lcsSeq2.length; j++) {
      html += `<td style="color:${dp[i][j] > 0 ? 'var(--green)' : 'var(--muted)'}">${dp[i][j]}</td>`;
    }
    html += '</tr>';
  }
  html += '</table>';
  document.getElementById('lcs-table').innerHTML = html;
}

// ============================================================
// CASE 13 — TOPOLOGICAL SORT
// ============================================================
function buildTopoSort() {
  return `
    <div class="viz-area">
      <div class="viz-title">📋 Investigation Timeline — Topological Sort</div>
      <div id="topo-graph" style="text-align:center;margin:20px 0;font-size:12px">
        <div style="color:var(--accent);margin:8px">Interview Witnesses → Arrest Suspects → Close Case</div>
        <div style="color:var(--accent3);margin:8px">Gather Evidence → Analyze Evidence → Report Findings</div>
        <div style="color:var(--green);margin:8px">Check Alibi → Verify Timeline → Confirm Identities</div>
      </div>
      <div id="topo-order" style="margin:16px;padding:12px;background:var(--card);border-radius:4px;font-family:monospace">Order: (computing...)</div>
    </div>
    <div class="log-area" id="topo-log"></div>
    <div class="controls">
      <button class="btn" onclick="generateTopoSort()">🎲 New Dependencies</button>
      <button class="btn" onclick="runTopoSort()">▶ Compute Sequence</button>
      <button class="btn danger" onclick="resetTopoSort()">↺ Reset</button>
    </div>
    <button class="solve-btn" id="topo-solve" disabled onclick="solveCase(13,500,'Topological order complete! Investigation tasks now scheduled respecting all dependencies.')">🔓 Case Solved — Submit</button>
  `;
}

// Simple DAG for investigation tasks
const topoTasks = {
  'Interview': ['Arrest'],
  'Gather': ['Analyze'],
  'Check': ['Verify'],
  'Analyze': ['Report'],
  'Verify': ['Confirm'],
  'Arrest': ['Close'],
  'Report': ['Close'],
  'Confirm': ['Close'],
  'Close': []
};

function generateTopoSort() {
  resetTopoSort();
}

function resetTopoSort() {
  clearLog('topo-log');
  document.getElementById('topo-order').textContent = 'Order: (waiting...)';
  document.getElementById('topo-solve').disabled = true;
}

async function runTopoSort() {
  if (state.animRunning) return;
  state.animRunning = true;
  clearLog('topo-log');
  
  const tasks = Object.keys(topoTasks);
  const inDegree = {};
  const adj = {};
  
  tasks.forEach(t => {
    inDegree[t] = 0;
    adj[t] = [];
  });
  
  for (const [u, deps] of Object.entries(topoTasks)) {
    deps.forEach(v => {
      adj[u].push(v);
      inDegree[v]++;
    });
  }
  
  const queue = tasks.filter(t => inDegree[t] === 0);
  const result = [];
  
  log('topo-log', `Starting with tasks having zero in-degree: ${queue.join(', ')}`, 'info');
  await sleep(state.speed);
  
  while (queue.length > 0) {
    const task = queue.shift();
    result.push(task);
    log('topo-log', `Selected: "${task}" — can now schedule ${topoTasks[task].join(', ') || 'none'}`, 'warning');
    document.getElementById('topo-order').textContent = `Order: ${result.join(' → ')}`;
    
    for (const neighbor of adj[task]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
    await sleep(state.speed);
  }
  
  log('topo-log', `Topological order computed: ${result.join(' → ')}`, 'success');
  logCaseConclusion('topo-log');
  
  state.animRunning = false;
  document.getElementById('topo-solve').disabled = false;
}

// ============================================================
// CASE 14 — BINARY SEARCH
// ============================================================
function buildBinarySearch() {
  const witnesses = Array.from({length: 20}, (_, i) => ({id: i+1, name: `Witness-${String(i+1).padStart(2,'0')}`, time: i*5}));
  
  return `
    <div class="viz-area">
      <div class="viz-title">🔎 Witness Database — Binary Search Lookup</div>
      <div id="bs-list" style="margin:16px;font-size:12px;display:grid;grid-template-columns:repeat(5,1fr);gap:8px">
        ${witnesses.map((w,i) => `<div class="item-card" id="bs-item-${i}" style="padding:8px;cursor:pointer" onclick="searchWitness(${i})">${w.name}<br/>Time: ${w.time}h</div>`).join('')}
      </div>
    </div>
    <div style="margin:16px">
      <label>Search for time (0-95):</label><br/>
      <input type="number" id="bs-target" min="0" max="95" value="45" style="padding:6px;margin:8px 0"/>
      <button class="btn" onclick="runBinarySearch()" style="margin-left:8px">🔍 Search</button>
    </div>
    <div class="log-area" id="bs-log"></div>
    <div class="controls">
      <button class="btn" onclick="generateBinarySearch()">🎲 New Witness List</button>
      <button class="btn danger" onclick="resetBS()">↺ Reset</button>
    </div>
    <button class="solve-btn" id="bs-solve" disabled onclick="solveCase(14,350,'Binary search complete! Target witness found in O(log n) comparisons—instant identification.')">🔓 Case Solved — Submit</button>
  `;
}

function resetBS() {
  clearLog('bs-log');
  document.querySelectorAll('[id^=bs-item-]').forEach(el => el.classList.remove('active','found'));
  document.getElementById('bs-solve').disabled = true;
}

function generateBinarySearch() {
  renderCase(14);
}

async function runBinarySearch() {
  if (state.animRunning) return;
  state.animRunning = true;
  clearLog('bs-log');
  resetBS();
  
  const target = parseInt(document.getElementById('bs-target').value);
  const witnesses = Array.from({length: 20}, (_, i) => i*5);
  
  log('bs-log', `Searching for witness with interrogation time: ${target}h`, 'info');
  
  let left = 0, right = witnesses.length - 1, comparisons = 0, found = false;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midEl = document.getElementById(`bs-item-${mid}`);
    if (midEl) midEl.classList.add('active');
    
    comparisons++;
    log('bs-log', `Checking index ${mid}: time=${witnesses[mid]}h vs target=${target}h`, 'warning');
    
    await sleep(state.speed);
    if (midEl) midEl.classList.remove('active');
    
    if (witnesses[mid] === target) {
      if (midEl) midEl.classList.add('found');
      log('bs-log', `✓ Found! Witness at index ${mid} with time ${target}h (${comparisons} comparisons)`, 'success');
      found = true;
      break;
    } else if (witnesses[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  if (!found) log('bs-log', `Not found in ${comparisons} comparisons`, 'warning');
  logCaseConclusion('bs-log');
  
  state.animRunning = false;
  document.getElementById('bs-solve').disabled = false;
}

function searchWitness(idx) {
  document.getElementById('bs-target').value = idx * 5;
  runBinarySearch();
}

// ============================================================
// CASE 15 — RABIN-KARP STRING MATCHING
// ============================================================
function buildRabinKarp() {
  const text = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG';
  const pattern = 'FOX';
  
  return `
    <div class="viz-area">
      <div class="viz-title">🔐 Code Breaker — Rabin-Karp Pattern Matching</div>
      <div style="margin:16px;font-size:12px">
        <div style="margin-bottom:12px"><strong>Message:</strong> <span style="font-family:monospace;color:var(--accent)" id="rk-text">${text}</span></div>
        <div><strong>Hidden Pattern:</strong> <span style="font-family:monospace;color:var(--accent3)" id="rk-pattern">${pattern}</span></div>
      </div>
      <div id="rk-matches" style="margin:16px;padding:12px;background:var(--card);border-radius:4px;font-size:12px">
        Matches: (scanning...)
      </div>
    </div>
    <div class="log-area" id="rk-log"></div>
    <div class="controls">
      <button class="btn" onclick="generateRabinKarp()">🎲 New Message</button>
      <button class="btn" onclick="runRabinKarp()">▶ Search Patterns</button>
      <button class="btn danger" onclick="resetRK()">↺ Reset</button>
    </div>
    <button class="solve-btn" id="rk-solve" disabled onclick="solveCase(15,600,'Rabin-Karp complete! All hidden patterns exposed—cipher fully decoded.')">🔓 Case Solved — Submit</button>
  `;
}

let rkText = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG';
let rkPattern = 'FOX';

function generateRabinKarp() {
  const messages = [
    'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG',
    'FINDTHESUSPECTINTHEMYSTERYAFTERTHENIGHT',
    'CRYPTOMESSAGECONTAINSHIDDENWORDSINTEXT'
  ];
  const patterns = ['FOX', 'THE', 'HIDDEN'];
  
  rkText = messages[Math.floor(Math.random() * messages.length)];
  rkPattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  document.getElementById('rk-text').textContent = rkText;
  document.getElementById('rk-pattern').textContent = rkPattern;
  resetRK();
}

function resetRK() {
  clearLog('rk-log');
  document.getElementById('rk-matches').textContent = 'Matches: (waiting...)';
  document.getElementById('rk-solve').disabled = true;
}

async function runRabinKarp() {
  if (state.animRunning) return;
  state.animRunning = true;
  clearLog('rk-log');
  
  const prime = 101;
  const base = 256;
  const n = rkText.length;
  const m = rkPattern.length;
  
  log('rk-log', `Searching for pattern "${rkPattern}" (length ${m}) in text of length ${n}`, 'info');
  
  let patternHash = 0, textHash = 0, highestPow = 1;
  for (let i = 0; i < m; i++) {
    patternHash += rkPattern.charCodeAt(i) * Math.pow(base, m - 1 - i);
    textHash += rkText.charCodeAt(i) * Math.pow(base, m - 1 - i);
    if (i < m - 1) highestPow *= base;
  }
  
  patternHash %= prime;
  textHash %= prime;
  const matches = [];
  
  for (let i = 0; i <= n - m; i++) {
    if (patternHash === textHash) {
      let match = true;
      for (let j = 0; j < m; j++) {
        if (rkText[i + j] !== rkPattern[j]) { match = false; break; }
      }
      if (match) {
        matches.push(i);
        log('rk-log', `✓ Match found at position ${i}`, 'success');
      }
    }
    
    if (i < n - m) {
      textHash -= rkText.charCodeAt(i) * highestPow;
      textHash = (textHash * base + rkText.charCodeAt(i + m)) % prime;
      if (textHash < 0) textHash += prime;
    }
    
    await sleep(state.speed / 2);
  }
  
  let display = matches.length > 0 ? matches.map(p => `<strong style="color:var(--green)">@${p}</strong>`).join(', ') : 'None found';
  document.getElementById('rk-matches').innerHTML = `Matches: ${display}`;
  log('rk-log', `Complete! Found ${matches.length} occurrence(s) of "${rkPattern}"`, 'success');
  logCaseConclusion('rk-log');
  
  state.animRunning = false;
  document.getElementById('rk-solve').disabled = false;
}

// ===== SPEED CONTROL =====
function updateSpeed(val) {
  state.speed = parseInt(val);
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  initParticleBackground();
  renderHome();
  // Init SVGs when case opens
});

// Re-init SVGs after case renders
const origOpen = openCase;
window.openCase = function(id) {
  origOpen(id);
  setTimeout(() => {
    if (id === 1) initDijkstraSVG();
    if (id === 5) initBFSSVG();
    if (id === 6) initKruskalSVG();
    if (id === 9) generateMaze();
    if (id === 3) resetMergeSort();
    if (id === 4) resetNQueens();
    if (id === 7) resetTSP();
    if (id === 10) resetQuickSort();
    // New cases 11-15 with unique algorithms
    if (id === 11) generateFloydWarshall();
    if (id === 12) generateLCS();
    if (id === 13) generateTopoSort();
    if (id === 14) resetBS();
    if (id === 15) generateRabinKarp();
  }, 100);
};

// Speed slider
document.addEventListener('input', e => {
  if (e.target.id === 'speed-global') state.speed = parseInt(e.target.value);
});
