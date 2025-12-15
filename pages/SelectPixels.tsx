import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Application, Graphics, Container } from 'pixi.js';

// --- Configuration Constants ---
const CELL_SIZE = 20; // 1 pixel on grid = 20px on screen
const GRID_COLS = 100; // 100 cells wide
const GRID_ROWS = 100; // 100 cells tall
const MAX_PIXELS_PER_USER = 100;
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
    
    // Logic State
    const [selectedPixels, setSelectedPixels] = useState<Set<string>>(new Set());
    const [currentTool, setCurrentTool] = useState<'draw' | 'pan'>('draw');
    const [totalCost, setTotalCost] = useState(0);
    const [zoom, setZoom] = useState(1);

    // Ref to track current tool for event handlers (avoid stale closure)
    const toolRef = useRef(currentTool);

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

                // 4. Interaction Events on Stage
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
                        attemptDraw(localPos.x, localPos.y);
                    }
                });

                app.stage.on('pointermove', (e) => {
                    if (!isDragging) return;
                    const globalPos = e.global;

                    if (toolRef.current === 'pan') {
                        mainStage.x = startStagePos.x + (globalPos.x - dragStart.x);
                        mainStage.y = startStagePos.y + (globalPos.y - dragStart.y);
                    } else if (toolRef.current === 'draw') {
                        const localPos = mainStage.toLocal(globalPos);
                        attemptDraw(localPos.x, localPos.y);
                    }
                });

                app.stage.on('pointerup', () => { isDragging = false; });
                app.stage.on('pointerupoutside', () => { isDragging = false; });
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

    // Sync toolRef with currentTool state changes
    useEffect(() => { toolRef.current = currentTool; }, [currentTool]);

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
        setTotalCost(selectedPixels.size * 0.10);
    }, [selectedPixels]);


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
        
        // 3. Max Limit Check
        // Note: Using functional state update to get fresh state in closure
        setSelectedPixels(prev => {
            if (prev.has(key)) return prev; // Already selected
            if (prev.size >= MAX_PIXELS_PER_USER) return prev; // Max Limit
            
            const newSet = new Set(prev);
            newSet.add(key);
            return newSet;
        });
    };

    const handleClear = () => {
        setSelectedPixels(new Set());
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
            duration: 3, // Default
            totalCost: totalCost,
            pricePerPx: 0.10
        }));
        navigate('/buy/step3');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-text-inverse overflow-hidden h-screen flex flex-col">
            <Header hideBuyButton minimal />

            <div className="flex-1 flex flex-col relative">
                
                {/* --- Top Toolbar (Figma Style) --- */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-2 bg-white dark:bg-surface-light border border-border-light dark:border-border-dark rounded-xl shadow-2xl animate-fade-in-up">
                    
                    {/* Tool Switcher */}
                    <div className="flex bg-gray-100 dark:bg-surface-dark rounded-lg p-1 gap-1">
                        <button 
                            onClick={() => { setCurrentTool('pan'); if(appRef.current) appRef.current.canvas.style.cursor = 'grab'; }}
                            className={`p-2 rounded-md transition-all ${currentTool === 'pan' ? 'bg-white dark:bg-surface-lighter shadow text-primary' : 'text-text-subtle hover:text-text-main'}`}
                            title="Pan Tool (Space)"
                        >
                            <span className="material-symbols-outlined text-[20px]">pan_tool</span>
                        </button>
                        <button 
                            onClick={() => { setCurrentTool('draw'); if(appRef.current) appRef.current.canvas.style.cursor = 'crosshair'; }}
                            className={`p-2 rounded-md transition-all ${currentTool === 'draw' ? 'bg-white dark:bg-surface-lighter shadow text-primary' : 'text-text-subtle hover:text-text-main'}`}
                            title="Draw Pixels"
                        >
                            <span className="material-symbols-outlined text-[20px]">brush</span>
                        </button>
                    </div>

                    <div className="w-px h-8 bg-border-light dark:bg-border-dark mx-1"></div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 px-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-text-subtle uppercase font-bold tracking-wider">Selected</span>
                            <span className={`text-sm font-mono font-bold ${selectedPixels.size >= MAX_PIXELS_PER_USER ? 'text-red-500' : 'text-text-main dark:text-text-inverse'}`}>
                                {selectedPixels.size} <span className="text-text-muted">/ {MAX_PIXELS_PER_USER}</span>
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-text-subtle uppercase font-bold tracking-wider">Total</span>
                            <span className="text-sm font-mono font-bold text-primary">
                                ${totalCost.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-border-light dark:bg-border-dark mx-1"></div>

                    {/* Actions */}
                    <button 
                        onClick={handleClear}
                        className="p-2 text-text-subtle hover:text-red-500 transition-colors"
                        title="Clear Selection"
                    >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>

                    <button 
                        onClick={handleNext}
                        disabled={selectedPixels.size === 0}
                        className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                    >
                        Next
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                </div>

                {/* --- Zoom Controls (Bottom Left) --- */}
                <div className="absolute bottom-8 left-8 z-20 flex flex-col gap-2">
                     <div className="bg-white/90 dark:bg-surface-light/90 backdrop-blur text-text-main dark:text-text-inverse text-xs font-mono px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark shadow-lg pointer-events-none mb-2">
                        {Math.round(zoom * 100)}%
                    </div>
                </div>

                {/* --- PixiJS Canvas Container --- */}
                <div 
                    ref={containerRef} 
                    className="flex-1 w-full h-full bg-[#111] overflow-hidden"
                    style={{ cursor: currentTool === 'draw' ? 'crosshair' : 'grab' }}
                />
            </div>
        </div>
    );
}