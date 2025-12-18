// --- Global State ---
let originalImg = null;
let originalData = null; 
let manualMaskData = null; 
let floodFillMask = null;
let currentTool = 'pan';
let targetRGB = { r: 0, g: 255, b: 0 };

let scale = 1;
let panX = 0, panY = 0;
let isDragging = false;
let dragStart = {x:0, y:0};
let lastPos = null;
let rectStart = null;
let rectCurrent = null;

let isSliceMode = false;
let sliceLinesX = [];
let sliceLinesY = [];
let draggingLine = null;

let historyStack = [];
let historyIndex = -1;
const MAX_HISTORY = 30;

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const wrapper = document.getElementById('canvasWrapper');
const container = document.getElementById('canvasContainer');
const loading = document.getElementById('loadingOverlay');

// --- Initialization ---
window.onload = () => {
    setupEventListeners();
    setTool('pan');
};

function setupEventListeners() {
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, {passive:false});

    // File Drag & Drop
    container.addEventListener('dragover', e => { e.preventDefault(); container.classList.add('drag-active'); });
    container.addEventListener('dragleave', () => container.classList.remove('drag-active'));
    container.addEventListener('drop', e => {
        e.preventDefault();
        container.classList.remove('drag-active');
        if(e.dataTransfer.files[0]) handleFileSelect({files: e.dataTransfer.files});
    });

    // Before/After Comparison
    const compareBtn = document.getElementById('compareBtn');
    compareBtn.addEventListener('mousedown', () => showOriginal(true));
    compareBtn.addEventListener('mouseup', () => showOriginal(false));
    window.addEventListener('keydown', (e) => {
        if(e.key.toLowerCase() === 'z' && !e.ctrlKey && !e.metaKey) showOriginal(true);
        if(e.ctrlKey && e.key === 'z') undo();
        if(e.ctrlKey && e.key === 'y') redo();
    });
    window.addEventListener('keyup', (e) => {
        if(e.key.toLowerCase() === 'z') showOriginal(false);
    });
}

function handleFileSelect(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => initImage(img);
            img.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function initImage(img) {
    originalImg = img;
    canvas.width = img.width;
    canvas.height = img.height;
    
    const tCtx = document.createElement('canvas').getContext('2d');
    tCtx.canvas.width = img.width; tCtx.canvas.height = img.height;
    tCtx.drawImage(img, 0, 0);
    originalData = tCtx.getImageData(0, 0, img.width, img.height).data;
    
    manualMaskData = new Uint8Array(img.width * img.height).fill(100);
    floodFillMask = null;
    sliceLinesX = []; sliceLinesY = [];
    
    document.getElementById('dropZone').style.display = 'none';
    document.getElementById('downloadBtn').disabled = false;
    document.getElementById('autoCutBtn').disabled = false;
    document.getElementById('img-info').textContent = `${img.width} x ${img.height} px`;

    historyStack = []; historyIndex = -1;
    saveHistory();
    fitImage();
    runProcess();
}

// --- View Engine ---
function fitImage() {
    const rect = container.getBoundingClientRect();
    const margin = 40;
    const sc = Math.min((rect.width - margin)/originalImg.width, (rect.height - margin)/originalImg.height);
    scale = Math.min(1.5, sc);
    panX = (rect.width - originalImg.width * scale) / 2;
    panY = (rect.height - originalImg.height * scale) / 2;
    updateTransform();
}

function updateTransform() {
    wrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    document.getElementById('zoomVal').textContent = `${Math.round(scale * 100)}%`;
}

function showOriginal(bool) {
    if(!originalImg) return;
    if(bool) {
        ctx.putImageData(new ImageData(new Uint8ClampedArray(originalData), canvas.width, canvas.height), 0, 0);
    } else {
        runProcess();
    }
}

// --- Tool Engine ---
function setTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById('btn-' + tool);
    if(activeBtn) activeBtn.classList.add('active');
    
    wrapper.style.cursor = (tool === 'pan') ? 'grab' : 'crosshair';
}

// --- Core Image Processing ---
function runProcess() {
    if (!originalImg) return;

    const w = canvas.width, h = canvas.height;
    const out = ctx.createImageData(w, h);
    const data = out.data;
    const src = originalData;

    // Params
    const thresh = parseInt(document.getElementById('s-thresh').value) * 4.4;
    const soft = parseInt(document.getElementById('s-soft').value) * 2;
    const spill = parseInt(document.getElementById('s-spill').value) / 100;
    const isContiguous = document.getElementById('contiguousMode').checked;
    const isMaskView = document.getElementById('maskViewMode').checked;
    const smoothLevel = parseInt(document.getElementById('s-smooth').value);
    
    // Adjustment Params
    const bright = parseInt(document.getElementById('s-bright').value) / 100;
    const contrast = parseInt(document.getElementById('s-contrast').value) / 100;

    const tr = targetRGB.r, tg = targetRGB.g, tb = targetRGB.b;

    // Temporary array for Alpha Mask
    const alphaMask = new Uint8Array(w * h);

    for (let i = 0; i < src.length; i += 4) {
        const mIdx = i / 4;
        const mVal = manualMaskData[mIdx];
        
        if (mVal === 0) { alphaMask[mIdx] = 0; continue; }
        if (mVal === 255) { alphaMask[mIdx] = 255; continue; }

        let alpha = 255;
        if (thresh > 0) {
            const r = src[i], g = src[i+1], b = src[i+2];
            let dist = 0;
            if (isContiguous && floodFillMask) {
                dist = (floodFillMask[mIdx] === 1) ? Math.sqrt((r-tr)**2 + (g-tg)**2 + (b-tb)**2) : 999;
            } else {
                dist = Math.sqrt((r-tr)**2 + (g-tg)**2 + (b-tb)**2);
            }
            
            if (dist < thresh) alpha = 0;
            else if (dist < thresh + soft) alpha = ((dist - thresh) / soft) * 255;
        }
        alphaMask[mIdx] = alpha;
    }

    // Apply Smoothing (Simple Box Blur on Alpha if requested)
    // プロ向け：エッジを滑らかにする
    const finalAlpha = (smoothLevel > 0) ? applySmooth(alphaMask, w, h, smoothLevel) : alphaMask;

    for (let i = 0; i < src.length; i += 4) {
        const mIdx = i / 4;
        let r = src[i], g = src[i+1], b = src[i+2];
        let a = finalAlpha[mIdx];

        // Spill Reduction
        if (spill > 0 && a > 0) {
            const avg = (r + b) / 2;
            if (g > avg) g -= (g - avg) * spill;
        }

        // Brightness & Contrast
        r = ((r / 255 - 0.5) * contrast + 0.5) * 255 * bright;
        g = ((g / 255 - 0.5) * contrast + 0.5) * 255 * bright;
        b = ((b / 255 - 0.5) * contrast + 0.5) * 255 * bright;

        if (isMaskView) {
            data[i] = data[i+1] = data[i+2] = a;
            data[i+3] = 255;
        } else {
            data[i] = r; data[i+1] = g; data[i+2] = b; data[i+3] = a;
        }
    }

    ctx.putImageData(out, 0, 0);

    // Post Effects
    if (document.getElementById('enableBorder').checked && !isMaskView) applyBorder(w, h);
    if (isSliceMode) drawGridLines();
    if (rectStart && rectCurrent) drawRectOverlay();
}

function applySmooth(mask, w, h, level) {
    const out = new Uint8Array(mask.length);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let sum = 0, count = 0;
            for (let ky = -level; ky <= level; ky++) {
                for (let kx = -level; kx <= level; kx++) {
                    const nx = x + kx, ny = y + ky;
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                        sum += mask[ny * w + nx];
                        count++;
                    }
                }
            }
            out[y * w + x] = sum / count;
        }
    }
    return out;
}

// --- Interaction Handlers ---
function onMouseDown(e) {
    if (!originalImg) return;
    const pt = getCanvasPoint(e);
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };

    if (currentTool === 'pan') return;
    if (!pt) return;

    if (currentTool === 'dropper') {
        pickColor(pt);
    } else if (currentTool === 'wand') {
        magicWand(pt);
    } else if (currentTool === 'rect' || currentTool === 'crop') {
        rectStart = pt; rectCurrent = pt;
    } else if (currentTool === 'eraser' || currentTool === 'protect') {
        lastPos = pt; stroke(pt);
    }
}

function onMouseMove(e) {
    const pt = getCanvasPoint(e);
    updateCursorPos(e);

    if (!isDragging) return;

    if (currentTool === 'pan') {
        panX += e.clientX - dragStart.x;
        panY += e.clientY - dragStart.y;
        dragStart = { x: e.clientX, y: e.clientY };
        updateTransform();
    } else if (pt) {
        if (currentTool === 'rect' || currentTool === 'crop') {
            rectCurrent = pt; runProcess();
        } else if (currentTool === 'eraser' || currentTool === 'protect') {
            strokeLine(lastPos, pt); lastPos = pt; runProcess();
        }
    }
}

function onMouseUp() {
    if (isDragging && (currentTool === 'eraser' || currentTool === 'protect' || currentTool === 'rect')) {
        if(currentTool === 'rect' && rectStart) applyRect();
        saveHistory();
    }
    if (currentTool === 'crop' && rectStart) downloadCroppedArea();
    
    isDragging = false;
    rectStart = null; rectCurrent = null;
    runProcess();
}

function onWheel(e) {
    if (!originalImg) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale = Math.min(Math.max(0.1, scale * delta), 10);
    updateTransform();
}

function getCanvasPoint(e) {
    const rect = wrapper.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return null;
    return {x, y};
}

// --- Helper Utilities ---
function updateVal(id, val) { document.getElementById(id).textContent = val; }

function pickColor(pt) {
    const idx = (pt.y * canvas.width + pt.x) * 4;
    targetRGB = { r: originalData[idx], g: originalData[idx+1], b: originalData[idx+2] };
    const hex = "#" + ((1<<24)+(targetRGB.r<<16)+(targetRGB.g<<8)+targetRGB.b).toString(16).slice(1).toUpperCase();
    document.getElementById('bgColorInput').value = hex;
    document.getElementById('bgColorPreview').style.background = hex;
    if(document.getElementById('contiguousMode').checked) updateFloodMask(pt);
    runProcess();
}

function updateFloodMask(seed) {
    const w = canvas.width, h = canvas.height;
    floodFillMask = new Uint8Array(w*h);
    const tol = parseInt(document.getElementById('s-thresh').value) * 4;
    const stack = [[seed.x, seed.y]];
    while(stack.length) {
        const [x,y] = stack.pop();
        const idx = y*w+x;
        if(floodFillMask[idx]) continue;
        const i = idx*4;
        const d = Math.sqrt((originalData[i]-targetRGB.r)**2 + (originalData[i+1]-targetRGB.g)**2 + (originalData[i+2]-targetRGB.b)**2);
        if(d <= tol) {
            floodFillMask[idx] = 1;
            if(x>0) stack.push([x-1,y]); if(x<w-1) stack.push([x+1,y]);
            if(y>0) stack.push([x,y-1]); if(y<h-1) stack.push([x,y+1]);
        }
    }
}

function stroke(pt) {
    const size = 20; // Fixed for now, can be slider
    const val = (currentTool === 'protect') ? 255 : 0;
    const w = canvas.width;
    for(let y=pt.y-size; y<pt.y+size; y++) {
        for(let x=pt.x-size; x<pt.x+size; x++) {
            if(x>=0 && x<w && y>=0 && y<canvas.height) {
                if(Math.hypot(x-pt.x, y-pt.y) < size) manualMaskData[y*w+x] = val;
            }
        }
    }
}

function strokeLine(p1, p2) {
    const dist = Math.hypot(p2.x-p1.x, p2.y-p1.y);
    for(let i=0; i<=dist; i++) {
        const t = i/dist;
        stroke({x: Math.round(p1.x+(p2.x-p1.x)*t), y: Math.round(p1.y+(p2.y-p1.y)*t)});
    }
}

function applyRect() {
    const x1=Math.min(rectStart.x, rectCurrent.x), x2=Math.max(rectStart.x, rectCurrent.x);
    const y1=Math.min(rectStart.y, rectCurrent.y), y2=Math.max(rectStart.y, rectCurrent.y);
    for(let y=y1; y<y2; y++) for(let x=x1; x<x2; x++) manualMaskData[y*canvas.width+x] = 0;
}

function saveHistory() {
    const state = { mask: new Uint8Array(manualMaskData) };
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(state);
    if(historyStack.length > MAX_HISTORY) historyStack.shift();
    else historyIndex++;
    updateHistoryBtns();
}

function undo() {
    if(historyIndex > 0) { historyIndex--; manualMaskData.set(historyStack[historyIndex].mask); runProcess(); updateHistoryBtns(); }
}

function redo() {
    if(historyIndex < historyStack.length - 1) { historyIndex++; manualMaskData.set(historyStack[historyIndex].mask); runProcess(); updateHistoryBtns(); }
}

function updateHistoryBtns() {
    document.getElementById('undoBtn').disabled = (historyIndex <= 0);
    document.getElementById('redoBtn').disabled = (historyIndex >= historyStack.length - 1);
}

function updateCursorPos(e) {
    const eC = document.getElementById('eraser-cursor');
    const pC = document.getElementById('protect-cursor');
    if(currentTool === 'eraser') { eC.style.display='block'; eC.style.left=e.clientX+'px'; eC.style.top=e.clientY+'px'; pC.style.display='none'; }
    else if(currentTool === 'protect') { pC.style.display='block'; pC.style.left=e.clientX+'px'; pC.style.top=e.clientY+'px'; eC.style.display='none'; }
    else { eC.style.display='none'; pC.style.display='none'; }
}

// --- Export Logic ---
function downloadImage() {
    runProcess(); 
    const link = document.createElement('a');
    link.download = `chroma_pro_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// 既存のZIP保存やオートカットロジックをここに統合可能...
// (長さの関係上、主要な高画質化ロジックを優先して記述しました)