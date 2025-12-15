import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

// --- Real Life Mock Data ---
export const MOCK_BLOCKS = [
    { id: 1, name: "OpenAI", category: "AI & Tech", x: 400, y: 300, w: 200, h: 100, color: "#10a37f", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg", desc: "Creating safe AGI that benefits all of humanity." },
    { id: 2, name: "SpaceX", category: "Aerospace", x: 50, y: 50, w: 150, h: 150, color: "#000000", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/SpaceX_logo_black.svg", desc: "Designing, manufacturing and launching advanced rockets and spacecraft." },
    { id: 3, name: "Nike", category: "Retail", x: 650, y: 100, w: 120, h: 120, color: "#fa5400", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg", desc: "Just Do It." },
    { id: 4, name: "McDonald's", category: "Food", x: 100, y: 500, w: 100, h: 100, color: "#ffc72c", logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg", desc: "I'm lovin' it." },
    { id: 5, name: "Ethereum Foundation", category: "Crypto", x: 800, y: 400, w: 100, h: 150, color: "#627eea", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg", desc: "Build on the world's computer." },
    { id: 6, name: "Duolingo", category: "Education", x: 300, y: 600, w: 80, h: 80, color: "#58cc02", logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/Duolingo_Duo_logo.svg", desc: "Free language education for the world." }
];

export default function Home() {
    const navigate = useNavigate();
    const [selectedBlock, setSelectedBlock] = useState<typeof MOCK_BLOCKS[0] | null>(null);
    const [transform, setTransform] = useState({ x: -100, y: -100, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef({ x: 0, y: 0 });

    // Handle Pan
    const handleMouseDown = (e: React.MouseEvent) => {
        // Only drag if clicking background, not a block
        if ((e.target as HTMLElement).closest('.brand-block')) return;
        
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
        document.body.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setTransform(prev => ({
            ...prev,
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y
        }));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.body.style.cursor = 'default';
    };

    // Handle Zoom
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const scaleAmount = -e.deltaY * 0.001;
            const newScale = Math.min(Math.max(0.5, transform.scale + scaleAmount), 3);
            setTransform(prev => ({ ...prev, scale: newScale }));
        }
    };

    // Zoom buttons
    const handleZoom = (delta: number) => {
         setTransform(prev => ({ ...prev, scale: Math.min(Math.max(0.5, prev.scale + delta), 3) }));
    };

    return (
        <div className="overflow-hidden h-screen flex flex-col bg-background-light dark:bg-background-dark">
            <Header />

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Sidebar */}
                <aside className="flex-none w-full md:w-80 border-b md:border-b-0 md:border-r border-border-light dark:border-border-dark bg-white dark:bg-surface-dark flex flex-col z-20 shadow-xl">
                    <div className="p-6 border-b border-border-light dark:border-border-dark space-y-6">
                        <div>
                            <p className="text-text-subtle text-xs font-medium uppercase tracking-wider mb-2">Pixels Sold</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-primary">840,200</span>
                                <span className="text-sm text-text-subtle">/ 1,000,000</span>
                            </div>
                            <div className="w-full bg-surface-lighter h-1.5 rounded-full mt-3">
                                <div className="bg-primary h-1.5 rounded-full shadow-[0_0_10px_rgba(248,191,22,0.5)]" style={{ width: "84%" }}></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-text-subtle text-xs font-medium uppercase tracking-wider mb-1">Brands</p>
                                <p className="text-xl font-bold text-text-main dark:text-text-inverse">{MOCK_BLOCKS.length + 4100}</p>
                            </div>
                            <div>
                                <p className="text-text-subtle text-xs font-medium uppercase tracking-wider mb-1">Price / px</p>
                                <p className="text-xl font-bold text-text-main dark:text-text-inverse">$1.00</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 mt-auto bg-gray-50 dark:bg-surface-dark">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium text-text-subtle">Canvas Controls</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleZoom(-0.2)} className="flex-1 bg-white dark:bg-surface-light hover:bg-gray-100 dark:hover:bg-surface-lighter border border-border-light dark:border-border-dark text-text-main dark:text-text-inverse p-2 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                            <button onClick={() => setTransform({x: -100, y: -100, scale: 1})} className="flex-1 bg-white dark:bg-surface-light hover:bg-gray-100 dark:hover:bg-surface-lighter border border-border-light dark:border-border-dark text-text-main dark:text-text-inverse p-2 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                <span className="material-symbols-outlined">center_focus_strong</span>
                            </button>
                            <button onClick={() => handleZoom(0.2)} className="flex-1 bg-white dark:bg-surface-light hover:bg-gray-100 dark:hover:bg-surface-lighter border border-border-light dark:border-border-dark text-text-main dark:text-text-inverse p-2 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Canvas */}
                <main 
                    className="flex-1 relative bg-gray-100 dark:bg-[#0a0a0a] overflow-hidden cursor-grab active:cursor-grabbing group"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    ref={containerRef}
                >
                    <div 
                        className="absolute origin-top-left transition-transform duration-75 ease-out"
                        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
                    >
                        {/* The Grid Canvas 2000x2000 */}
                        <div className="relative w-[2000px] h-[2000px] bg-white dark:bg-[#151515] grid-pattern shadow-2xl">
                            
                            {/* Render Mock Blocks */}
                            {MOCK_BLOCKS.map((block) => (
                                <div
                                    key={block.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedBlock(block); }}
                                    className="brand-block absolute cursor-pointer hover:ring-4 hover:ring-primary hover:z-50 transition-all shadow-md group overflow-hidden"
                                    style={{
                                        left: block.x,
                                        top: block.y,
                                        width: block.w,
                                        height: block.h,
                                        backgroundColor: block.color || '#333'
                                    }}
                                >
                                    {block.logo && (
                                        <img src={block.logo} alt={block.name} className="w-full h-full object-cover pointer-events-none" />
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                </div>
                            ))}

                            {/* Call to Action Block */}
                            <div
                                onClick={(e) => { e.stopPropagation(); navigate('/buy/step1'); }}
                                className="brand-block absolute top-[500px] right-[600px] w-[150px] h-[150px] border-2 border-dashed border-primary bg-primary/5 flex flex-col items-center justify-center text-primary font-bold text-xs text-center p-2 cursor-pointer hover:bg-primary/20 transition-colors hover:scale-105"
                            >
                                <span className="material-symbols-outlined text-3xl mb-1">add_circle</span>
                                <span>Buy This Space</span>
                            </div>

                        </div>
                    </div>

                    {/* Coordinates Indicator */}
                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-surface-dark/90 backdrop-blur px-3 py-1.5 rounded-md border border-border-light dark:border-border-dark text-xs font-mono text-text-subtle pointer-events-none">
                        Zoom: {(transform.scale * 100).toFixed(0)}%
                    </div>
                </main>
            </div>

            {/* Block Detail Modal */}
            {selectedBlock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedBlock(null)}>
                    <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="h-32 w-full relative" style={{ backgroundColor: selectedBlock.color }}>
                            <button onClick={() => setSelectedBlock(null)} className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <div className="p-6 relative">
                            <div className="size-16 rounded-lg border-4 border-white dark:border-surface-dark bg-white absolute -top-10 left-6 flex items-center justify-center overflow-hidden shadow-lg p-2">
                                <img alt="Brand Logo" className="object-contain w-full h-full" src={selectedBlock.logo} />
                            </div>
                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-text-main dark:text-text-inverse mb-1">{selectedBlock.name}</h3>
                                <p className="text-primary text-sm font-medium mb-3">{selectedBlock.category}</p>
                                <p className="text-text-subtle text-sm leading-relaxed mb-6">
                                    {selectedBlock.desc}
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                    <div className="bg-gray-50 dark:bg-surface-light p-3 rounded-lg">
                                        <p className="text-xs text-text-muted uppercase font-bold">Location</p>
                                        <p className="font-mono text-text-main dark:text-text-inverse">X:{selectedBlock.x}, Y:{selectedBlock.y}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-surface-light p-3 rounded-lg">
                                        <p className="text-xs text-text-muted uppercase font-bold">Size</p>
                                        <p className="font-mono text-text-main dark:text-text-inverse">{selectedBlock.w * selectedBlock.h} px</p>
                                    </div>
                                </div>
                                <button className="flex w-full items-center justify-center gap-2 bg-primary hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors shadow-lg shadow-primary/20">
                                    Visit Website
                                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}