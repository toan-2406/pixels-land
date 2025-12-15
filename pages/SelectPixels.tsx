import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Application, Graphics, Container } from 'pixi.js';

// --- Configuration Constants ---
const CELL_SIZE = 20; // 1 pixel on grid = 20px on screen
const GRID_COLS = 100; // 100 cells wide
const GRID_ROWS = 100; // 100 cells tall
const MAX_CANVAS_PIXELS = 1000000; // Maximum 1 million pixels can be selected
const CANVAS_WIDTH = GRID_COLS * CELL_SIZE;
const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE;

// --- Mock Occupied Data (Real Life Brands) ---
// Using same coordinates as Home.tsx but converted to grid cells (approx)
const MOCK_OCCUPIED = [
    { id: 1, name: "OpenAI", x: 20, y: 15, w: 10, h: 5, color: 0x10a37f },
    { id: 2, name: "SpaceX", x: 2, y: 2, w: 8, h: 8, color: 0x000000 },
    { id: 3, name: "Nike", x: 32, y: 5, w: 6, h: 6, color: 0xfa5400 },
    { id: 4, name: "McDonald's", x: 5, y: 25, w: 5, h: 5, color: 0xffc72c },
    { id: 5, name: "Ethereum", x: 40, y: 20, w: 5, h: 8, color: 0x627eea },
    { id: 6, name: "Duolingo", x: 15, y: 30, w: 4, h: 4, color: 0x58cc02 }
];

export default function SelectPixels() {
    const navigate = useNavigate();

    // PixiJS Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);
    const gridRef = useRef<Graphics | null>(null);
    const selectionRef = useRef<Graphics | null>(null);
    const rectanglePreviewRef = useRef<Graphics | null>(null);

    // Logic State
    const [selectedPixels, setSelectedPixels] = useState<Set<string>>(new Set());
    const [currentTool, setCurrentTool] = useState<'draw' | 'pan'>('draw');
    const [selectMode, setSelectMode] = useState<'auto' | 'manual'>('manual');
    const [blockSize, setBlockSize] = useState<number>(100); // Number of pixels in preset block
    const [leaseDuration, setLeaseDuration] = useState<number>(3); // Years
    const [pricePerPixel] = useState<number>(0.10); // $0.10 per pixel
    const [totalCost, setTotalCost] = useState(0);
    const [zoom, setZoom] = useState(1);

    // Ref to track current tool for event handlers (avoid stale closure)
    const toolRef = useRef(currentTool);
    const selectModeRef = useRef(selectMode);

    // Rectangle selection tracking (for manual mode)
    const rectangleStartRef = useRef<{ x: number, y: number } | null>(null);

    // Calculate Occupied Set for O(1) Lookup
    const occupiedSet = useRef<Set<string>>(new Set());

    // --- Initialization ---
    useEffect(() => {
        // Pre-calculate occupied cells
        if (occupiedSet.current.size === 0) {
            MOCK_OCCUPIED.forEach(block => {
                for(let dx = 0; dx < block.w; dx++) {
                    for(let dy = 0; dy < block.h; dy++) {
                        occupiedSet.current.add(`${block.x + dx},${block.y + dy}`);
                    }
                }
            });
        }

        // Init Pixi Application
        const app = new Application();
        let cancelled = false;

        const initPixi = async () => {
             if (!containerRef.current) return;

             try {
                await app.init({
                    background: '#151515',
                    resizeTo: containerRef.current,
                    antialias: true,
                    resolution: window.devicePixelRatio || 1,
                });

                if (cancelled) {
                    await app.destroy(true, { children: true });
                    return;
                }

                containerRef.current.appendChild(app.canvas);
                appRef.current = app;

                // Main Container for Pan/Zoom
                const mainStage = new Container();
                mainStage.name = "mainStage";
                // Center the grid initially
                mainStage.x = app.screen.width / 2 - CANVAS_WIDTH / 2;
                mainStage.y = app.screen.height / 2 - CANVAS_HEIGHT / 2;
                app.stage.addChild(mainStage);

                // 1. Draw Background Grid
                const gridGraphics = new Graphics();
                gridRef.current = gridGraphics;
                drawGrid(gridGraphics);
                mainStage.addChild(gridGraphics);

                // 2. Draw Occupied Blocks (Bottom Layer)
                const occupiedGraphics = new Graphics();
                MOCK_OCCUPIED.forEach(block => {
                    occupiedGraphics.rect(
                        block.x * CELL_SIZE,
                        block.y * CELL_SIZE,
                        block.w * CELL_SIZE,
                        block.h * CELL_SIZE
                    );
                    occupiedGraphics.fill({ color: block.color });
                    // Add subtle border
                    occupiedGraphics.stroke({ width: 1, color: 0xffffff, alpha: 0.2 });
                });
                mainStage.addChild(occupiedGraphics);

                // 3. Selection Layer (Top Layer)
                const selGraphics = new Graphics();
                selectionRef.current = selGraphics;
                mainStage.addChild(selGraphics);

                // 4. Rectangle Preview Layer (for manual mode)
                const rectPreviewGraphics = new Graphics();
                rectanglePreviewRef.current = rectPreviewGraphics;
                mainStage.addChild(rectPreviewGraphics);

                // 5. Interaction Events on Stage
                app.stage.eventMode = 'static';
                app.stage.hitArea = app.screen;

                let isDragging = false;
                let dragStart = { x: 0, y: 0 };
                let startStagePos = { x: 0, y: 0 };

                // Handle Input
                app.stage.on('pointerdown', (e) => {
                    const globalPos = e.global;
                    isDragging = true;
                    dragStart = { x: globalPos.x, y: globalPos.y };
                    startStagePos = { x: mainStage.x, y: mainStage.y };

                    if (toolRef.current === 'draw') {
                        // Convert to local grid coords
                        const localPos = mainStage.toLocal(globalPos);

                        // Use auto select or manual draw based on mode
                        if (selectModeRef.current === 'auto') {
                            attemptAutoSelect(localPos.x, localPos.y);
                        } else {
                            // Manual mode: Start rectangle selection
                            const gx = Math.floor(localPos.x / CELL_SIZE);
                            const gy = Math.floor(localPos.y / CELL_SIZE);
                            rectangleStartRef.current = { x: gx, y: gy };
                        }
                    }
                });

                app.stage.on('pointermove', (e) => {
                    if (!isDragging) return;
                    const globalPos = e.global;

                    if (toolRef.current === 'pan') {
                        mainStage.x = startStagePos.x + (globalPos.x - dragStart.x);
                        mainStage.y = startStagePos.y + (globalPos.y - dragStart.y);
                    } else if (toolRef.current === 'draw' && selectModeRef.current === 'manual') {
                        // Manual mode: Draw rectangle preview
                        if (rectangleStartRef.current && rectanglePreviewRef.current) {
                            const localPos = mainStage.toLocal(globalPos);
                            const gx = Math.floor(localPos.x / CELL_SIZE);
                            const gy = Math.floor(localPos.y / CELL_SIZE);

                            const startX = Math.min(rectangleStartRef.current.x, gx);
                            const startY = Math.min(rectangleStartRef.current.y, gy);
                            const endX = Math.max(rectangleStartRef.current.x, gx);
                            const endY = Math.max(rectangleStartRef.current.y, gy);

                            const width = (endX - startX + 1) * CELL_SIZE;
                            const height = (endY - startY + 1) * CELL_SIZE;

                            // Draw preview rectangle
                            const preview = rectanglePreviewRef.current;
                            preview.clear();
                            preview.rect(startX * CELL_SIZE, startY * CELL_SIZE, width, height);
                            preview.fill({ color: 0x22c55e, alpha: 0.3 }); // Semi-transparent green
                            preview.stroke({ width: 2, color: 0x22c55e });
                        }
                    }
                });

                app.stage.on('pointerup', (e) => {
                    // If we're in manual mode and have a rectangle selection
                    if (toolRef.current === 'draw' && selectModeRef.current === 'manual' && rectangleStartRef.current) {
                        const globalPos = e.global;
                        const localPos = mainStage.toLocal(globalPos);
                        const gx = Math.floor(localPos.x / CELL_SIZE);
                        const gy = Math.floor(localPos.y / CELL_SIZE);

                        // Fill the rectangle
                        fillRectangleSelection(rectangleStartRef.current.x, rectangleStartRef.current.y, gx, gy);

                        // Clear preview
                        if (rectanglePreviewRef.current) {
                            rectanglePreviewRef.current.clear();
                        }

                        // Reset rectangle start
                        rectangleStartRef.current = null;
                    }

                    isDragging = false;
                });

                app.stage.on('pointerupoutside', (e) => {
                    // Same logic as pointerup
                    if (toolRef.current === 'draw' && selectModeRef.current === 'manual' && rectangleStartRef.current) {
                        const globalPos = e.global;
                        const localPos = mainStage.toLocal(globalPos);
                        const gx = Math.floor(localPos.x / CELL_SIZE);
                        const gy = Math.floor(localPos.y / CELL_SIZE);

                        fillRectangleSelection(rectangleStartRef.current.x, rectangleStartRef.current.y, gx, gy);

                        if (rectanglePreviewRef.current) {
                            rectanglePreviewRef.current.clear();
                        }

                        rectangleStartRef.current = null;
                    }

                    isDragging = false;
                });
                app.stage.on('wheel', (e) => {
                    // Zoom logic
                    e.preventDefault(); // Prevent page scroll
                    const zoomFactor = 0.001;
                    const newScale = Math.min(Math.max(mainStage.scale.x - e.deltaY * zoomFactor, 0.2), 3);

                    // Simple center zoom (can be improved to mouse-point zoom)
                    mainStage.scale.set(newScale);
                    setZoom(newScale);
                });

             } catch (error) {
                 console.error("Failed to initialize PixiJS app:", error);
             }
        };

        initPixi();

        return () => {
            cancelled = true;
            if (appRef.current) {
                appRef.current.destroy(true, { children: true });
                appRef.current = null;
            }
        };
    }, []); // Run once on mount

    // Sync refs with state changes
    useEffect(() => { toolRef.current = currentTool; }, [currentTool]);
    useEffect(() => { selectModeRef.current = selectMode; }, [selectMode]);

    // Update selection graphics when state changes
    useEffect(() => {
        if (selectionRef.current) {
            const g = selectionRef.current;
            g.clear();

            // Draw all selected pixels
            selectedPixels.forEach(key => {
                const [gx, gy] = key.split(',').map(Number);
                g.rect(gx * CELL_SIZE, gy * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            });

            if (selectedPixels.size > 0) {
                g.fill({ color: 0x22c55e }); // Green selection
                g.stroke({ width: 1, color: 0x15803d });
            }
        }
        setTotalCost(selectedPixels.size * pricePerPixel);
    }, [selectedPixels, pricePerPixel]);


    // --- Helper Functions ---

    const drawGrid = (g: Graphics) => {
        g.clear();
        // White Background
        g.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        g.fill({ color: 0xffffff }); // Light mode base

        // Grid Lines
        g.strokeStyle = { width: 1, color: 0xeeeeee }; // Faint grid

        for (let i = 0; i <= GRID_COLS; i++) {
            g.moveTo(i * CELL_SIZE, 0);
            g.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
        }
        for (let i = 0; i <= GRID_ROWS; i++) {
            g.moveTo(0, i * CELL_SIZE);
            g.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
        }
        g.stroke();
    };

    const fillRectangleSelection = (x1: number, y1: number, x2: number, y2: number) => {
        // Normalize coordinates to get top-left and bottom-right
        const startX = Math.min(x1, x2);
        const startY = Math.min(y1, y2);
        const endX = Math.max(x1, x2);
        const endY = Math.max(y1, y2);

        const newPixels = new Set(selectedPixels);

        // Fill all pixels in the rectangle
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                // Bounds check
                if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) continue;

                const key = `${x},${y}`;

                // Skip if occupied or already selected
                if (occupiedSet.current.has(key)) continue;
                if (newPixels.has(key)) continue;

                // Check max limit
                if (newPixels.size >= MAX_CANVAS_PIXELS) break;

                newPixels.add(key);
            }
        }

        setSelectedPixels(newPixels);
    };

    const attemptAutoSelect = (localX: number, localY: number) => {
        // Auto select a block based on blockSize preset
        const gx = Math.floor(localX / CELL_SIZE);
        const gy = Math.floor(localY / CELL_SIZE);

        // Calculate block dimensions (approximate square)
        const blockDim = Math.ceil(Math.sqrt(blockSize));

        // Select block centered on click (or from top-left)
        const startX = gx;
        const startY = gy;

        const newPixels = new Set(selectedPixels);
        let added = 0;

        for (let dx = 0; dx < blockDim && added < blockSize; dx++) {
            for (let dy = 0; dy < blockDim && added < blockSize; dy++) {
                const x = startX + dx;
                const y = startY + dy;

                // Bounds check
                if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) continue;

                const key = `${x},${y}`;

                // Skip if occupied or already selected
                if (occupiedSet.current.has(key)) continue;
                if (newPixels.has(key)) continue;

                // Check max limit
                if (newPixels.size >= MAX_CANVAS_PIXELS) break;

                newPixels.add(key);
                added++;
            }
        }

        setSelectedPixels(newPixels);
    };

    const attemptDraw = (localX: number, localY: number) => {
        // Convert local pixel coords to grid coords
        const gx = Math.floor(localX / CELL_SIZE);
        const gy = Math.floor(localY / CELL_SIZE);

        // Bounds Check
        if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return;

        const key = `${gx},${gy}`;

        // 1. Collision Check (Occupied?)
        if (occupiedSet.current.has(key)) return;

        // 2. Already Selected? (Toggle logic or Add only? Let's do Add only for painting)
        // If key exists, do nothing (painting). If you want toggle, use click.

        // 3. Max Limit Check (1 million pixels max)
        // Note: Using functional state update to get fresh state in closure
        setSelectedPixels(prev => {
            if (prev.has(key)) return prev; // Already selected
            if (prev.size >= MAX_CANVAS_PIXELS) return prev; // Max Limit

            const newSet = new Set(prev);
            newSet.add(key);
            return newSet;
        });
    };

    const handleClear = () => {
        setSelectedPixels(new Set());
    };

    const handleZoomIn = () => {
        if (appRef.current) {
            const mainStage = appRef.current.stage.getChildByName('mainStage') as Container;
            if (mainStage) {
                const newScale = Math.min(mainStage.scale.x * 1.2, 3); // Max 300%
                mainStage.scale.set(newScale);
                setZoom(newScale);
            }
        }
    };

    const handleZoomOut = () => {
        if (appRef.current) {
            const mainStage = appRef.current.stage.getChildByName('mainStage') as Container;
            if (mainStage) {
                const newScale = Math.max(mainStage.scale.x / 1.2, 0.2); // Min 20%
                mainStage.scale.set(newScale);
                setZoom(newScale);
            }
        }
    };

    const handleFitView = () => {
        if (appRef.current && containerRef.current) {
            const mainStage = appRef.current.stage.getChildByName('mainStage') as Container;
            if (mainStage) {
                // Calculate scale to fit canvas in viewport
                const viewWidth = containerRef.current.clientWidth;
                const viewHeight = containerRef.current.clientHeight;
                const scaleX = viewWidth / CANVAS_WIDTH;
                const scaleY = viewHeight / CANVAS_HEIGHT;
                const newScale = Math.min(scaleX, scaleY) * 0.9; // 90% to add padding

                mainStage.scale.set(newScale);

                // Center the canvas
                mainStage.x = (viewWidth - CANVAS_WIDTH * newScale) / 2;
                mainStage.y = (viewHeight - CANVAS_HEIGHT * newScale) / 2;

                setZoom(newScale);
            }
        }
    };

    const handleNext = () => {
        // Prepare data for Step 3
        const pixelCount = selectedPixels.size;
        if (pixelCount === 0) return;

        // Arbitrary center for the "location" display
        const firstPixel = Array.from(selectedPixels)[0].split(',');

        localStorage.setItem('pixelOrder', JSON.stringify({
            selection: {
                x: parseInt(firstPixel[0]),
                y: parseInt(firstPixel[1]),
                w: 1, h: 1 // Dummy dim for compatibility
            },
            area: pixelCount,
            duration: leaseDuration,
            totalCost: totalCost,
            pricePerPx: pricePerPixel
        }));
        navigate('/buy/step3');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-text-inverse overflow-hidden h-screen flex flex-col">
            <Header hideBuyButton minimal />

            <div className="flex-1 flex overflow-hidden">
                {/* --- LEFT SIDEBAR --- */}
                <div className="w-[320px] bg-[#1a1a1a] border-r border-border-dark flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-border-dark">
                        <h2 className="text-lg font-bold text-white mb-1">Configure Space</h2>
                        <p className="text-sm text-text-subtle">Select an area on the canvas to rent.</p>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Tool Mode Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-text-inverse mb-3">Selection Mode</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectMode('auto')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                                        selectMode === 'auto'
                                            ? 'bg-primary text-black shadow-lg'
                                            : 'bg-surface-dark text-text-subtle hover:bg-surface-lighter hover:text-text-inverse'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">grid_on</span>
                                    <span>Auto Select</span>
                                </button>
                                <button
                                    onClick={() => setSelectMode('manual')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                                        selectMode === 'manual'
                                            ? 'bg-primary text-black shadow-lg'
                                            : 'bg-surface-dark text-text-subtle hover:bg-surface-lighter hover:text-text-inverse'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">brush</span>
                                    <span>Manual Draw</span>
                                </button>
                            </div>
                        </div>

                        {/* Block Size Preset (only for Auto Select) */}
                        {selectMode === 'auto' && (
                            <div>
                                <label className="block text-sm font-semibold text-text-inverse mb-3">Block Size Preset</label>
                                <select
                                    value={blockSize}
                                    onChange={(e) => setBlockSize(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-surface-dark border border-border-dark rounded-lg text-text-inverse focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value={100}>10×10 Block (100 px) = ${(100 * pricePerPixel).toFixed(2)}</option>
                                    <option value={200}>14×14 Block (200 px) = ${(200 * pricePerPixel).toFixed(2)}</option>
                                    <option value={500}>22×22 Block (500 px) = ${(500 * pricePerPixel).toFixed(2)}</option>
                                    <option value={1000}>32×32 Block (1,000 px) = ${(1000 * pricePerPixel).toFixed(2)}</option>
                                    <option value={2500}>50×50 Block (2,500 px) = ${(2500 * pricePerPixel).toFixed(2)}</option>
                                </select>
                            </div>
                        )}

                        {/* Lease Duration Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-semibold text-text-inverse">Lease Duration</label>
                                <span className="text-lg font-bold text-primary">{leaseDuration} Years</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={leaseDuration}
                                onChange={(e) => setLeaseDuration(Number(e.target.value))}
                                className="w-full h-2 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-xs text-text-subtle mt-2">
                                <span>1 Year</span>
                                <span>10 Years</span>
                            </div>
                        </div>

                        {/* Pan/Zoom Tools */}
                        <div>
                            <label className="block text-sm font-semibold text-text-inverse mb-3">Canvas Tools</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setCurrentTool('draw'); if(appRef.current) appRef.current.canvas.style.cursor = 'crosshair'; }}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                                        currentTool === 'draw'
                                            ? 'bg-surface-lighter text-primary border border-primary'
                                            : 'bg-surface-dark text-text-subtle hover:bg-surface-lighter hover:text-text-inverse'
                                    }`}
                                    title="Draw Tool"
                                >
                                    <span className="material-symbols-outlined text-[18px]">touch_app</span>
                                    <span>Select</span>
                                </button>
                                <button
                                    onClick={() => { setCurrentTool('pan'); if(appRef.current) appRef.current.canvas.style.cursor = 'grab'; }}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                                        currentTool === 'pan'
                                            ? 'bg-surface-lighter text-primary border border-primary'
                                            : 'bg-surface-dark text-text-subtle hover:bg-surface-lighter hover:text-text-inverse'
                                    }`}
                                    title="Pan Tool"
                                >
                                    <span className="material-symbols-outlined text-[18px]">pan_tool</span>
                                    <span>Pan</span>
                                </button>
                            </div>
                        </div>

                        {/* Clear Button */}
                        <button
                            onClick={handleClear}
                            className="w-full px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            <span>Clear Selection</span>
                        </button>
                    </div>

                    {/* Purchase Summary (Fixed at Bottom) */}
                    <div className="p-6 border-t border-border-dark bg-[#0f0f0f] space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-subtle">Pixels Selected</span>
                                <span className="font-mono font-bold text-text-inverse">{selectedPixels.size.toLocaleString()} px</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-subtle">Price per Pixel</span>
                                <span className="font-mono text-text-inverse">${pricePerPixel.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-border-dark pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-semibold text-text-inverse">Total Cost</span>
                                    <span className="text-xl font-bold text-primary">${totalCost.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/buy/step1')}
                                className="flex-1 px-4 py-3 bg-surface-dark hover:bg-surface-lighter text-text-inverse border border-border-dark rounded-lg font-semibold transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={selectedPixels.size === 0}
                                className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                Next Step
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- CANVAS AREA --- */}
                <div className="flex-1 relative bg-[#0a0a0a]">
                    {/* Tool Controls (Top Left) */}
                    <div className="absolute top-6 left-6 z-10 space-y-3">
                        {/* Selection Mode */}
                        <div className="bg-black/80 backdrop-blur rounded-lg p-3 border border-white/10 shadow-lg">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectMode('auto')}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                                        selectMode === 'auto'
                                            ? 'bg-primary text-black'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                    title="Auto Select - Click to select preset blocks"
                                >
                                    <span className="material-symbols-outlined text-[16px]">grid_on</span>
                                    <span>Auto</span>
                                </button>
                                <button
                                    onClick={() => setSelectMode('manual')}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                                        selectMode === 'manual'
                                            ? 'bg-primary text-black'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                    title="Manual Draw - Draw rectangles to select"
                                >
                                    <span className="material-symbols-outlined text-[16px]">brush</span>
                                    <span>Manual</span>
                                </button>
                            </div>
                        </div>

                        {/* Block Size Preset (only for Auto) */}
                        {selectMode === 'auto' && (
                            <div className="bg-black/80 backdrop-blur rounded-lg p-3 border border-white/10 shadow-lg">
                                <select
                                    value={blockSize}
                                    onChange={(e) => setBlockSize(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value={100}>10×10 (100px)</option>
                                    <option value={200}>14×14 (200px)</option>
                                    <option value={500}>22×22 (500px)</option>
                                    <option value={1000}>32×32 (1K px)</option>
                                    <option value={2500}>50×50 (2.5K px)</option>
                                </select>
                            </div>
                        )}

                        {/* Canvas Tools */}
                        <div className="bg-black/80 backdrop-blur rounded-lg p-3 border border-white/10 shadow-lg">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setCurrentTool('draw'); if(appRef.current) appRef.current.canvas.style.cursor = 'crosshair'; }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                                        currentTool === 'draw'
                                            ? 'bg-primary text-black'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                    title="Select Tool"
                                >
                                    <span className="material-symbols-outlined text-[16px]">touch_app</span>
                                    <span>Select</span>
                                </button>
                                <button
                                    onClick={() => { setCurrentTool('pan'); if(appRef.current) appRef.current.canvas.style.cursor = 'grab'; }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                                        currentTool === 'pan'
                                            ? 'bg-primary text-black'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                    title="Pan Tool"
                                >
                                    <span className="material-symbols-outlined text-[16px]">pan_tool</span>
                                    <span>Pan</span>
                                </button>
                            </div>
                        </div>

                        {/* Clear Button */}
                        <button
                            onClick={handleClear}
                            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 border border-red-500/30"
                        >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span>Clear</span>
                        </button>
                    </div>

                    {/* Zoom Controls (Bottom Right) */}
                    <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
                        <button
                            onClick={handleZoomIn}
                            className="bg-black/80 backdrop-blur hover:bg-black/90 text-white p-2 rounded-lg border border-white/10 shadow-lg transition-all"
                            title="Zoom In"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                        </button>
                        <button
                            onClick={handleZoomOut}
                            className="bg-black/80 backdrop-blur hover:bg-black/90 text-white p-2 rounded-lg border border-white/10 shadow-lg transition-all"
                            title="Zoom Out"
                        >
                            <span className="material-symbols-outlined text-[20px]">remove</span>
                        </button>
                        <button
                            onClick={handleFitView}
                            className="bg-black/80 backdrop-blur hover:bg-black/90 text-white p-2 rounded-lg border border-white/10 shadow-lg transition-all"
                            title="Fit to View"
                        >
                            <span className="material-symbols-outlined text-[20px]">fit_screen</span>
                        </button>
                        <div className="bg-black/80 backdrop-blur text-white text-xs font-mono px-3 py-2 rounded-lg border border-white/10 shadow-lg text-center">
                            {Math.round(zoom * 100)}%
                        </div>
                    </div>

                    {/* PixiJS Canvas Container */}
                    <div
                        ref={containerRef}
                        className="w-full h-full overflow-hidden"
                        style={{ cursor: currentTool === 'draw' ? 'crosshair' : 'grab' }}
                    />
                </div>
            </div>
        </div>
    );
}
