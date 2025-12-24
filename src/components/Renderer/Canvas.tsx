import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMindMap } from '../../store/MindMapContext';
import { Node } from './Node';
import { Edge } from './Edge';
import { calculateTreeLayout } from '../Layout/layoutUtils';
import { ArrowLeft, Plus, Trash2, Edit3 } from 'lucide-react';

export const Canvas: React.FC = () => {
    const { currentMap, dispatch, closeMap } = useMindMap();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(currentMap?.rootId || null);
    const [pan, setPan] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Touch handling state
    const [lastTouchPos, setLastTouchPos] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);

    const layout = useMemo(() => {
        if (!currentMap) return {};
        return calculateTreeLayout(currentMap);
    }, [currentMap?.nodes, currentMap?.rootId]);

    // --- Keyboard Shortcuts (Desktop) ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isInputActive = document.activeElement instanceof HTMLInputElement;
            if (isInputActive) {
                if (e.key === 'Tab') e.preventDefault();
                else return;
            }

            if (!selectedNodeId) return;

            switch (e.key) {
                case 'Tab':
                    e.preventDefault();
                    if (currentMap) {
                        dispatch({ type: 'ADD_NODE', payload: { parentId: selectedNodeId } });
                    }
                    break;

                case 'Backspace':
                case 'Delete':
                    if (currentMap && selectedNodeId !== currentMap.rootId) {
                        const parentId = currentMap.nodes[selectedNodeId]?.parentId;
                        dispatch({ type: 'DELETE_NODE', payload: { id: selectedNodeId } });
                        if (parentId) setSelectedNodeId(parentId);
                    }
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentMap, selectedNodeId, dispatch]);

    if (!currentMap) return null;

    // --- Mouse Handling (Desktop) ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === containerRef.current) {
            setIsPanning(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
            setSelectedNodeId(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    // --- Touch Handling (Mobile) ---
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.target === containerRef.current) {
            setIsPanning(true);
            const touch = e.touches[0];
            setLastTouchPos({ x: touch.clientX, y: touch.clientY });
            // Optional: Deselect on background touch? Maybe keep selection for easier operation.
            // setSelectedNodeId(null); 
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isPanning) {
            const touch = e.touches[0];
            const dx = touch.clientX - lastTouchPos.x;
            const dy = touch.clientY - lastTouchPos.y;
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            setLastTouchPos({ x: touch.clientX, y: touch.clientY });
        }
    };

    const handleTouchEnd = () => {
        setIsPanning(false);
    };

    // --- Action Handlers ---
    const handleAddNode = () => {
        if (selectedNodeId) {
            dispatch({ type: 'ADD_NODE', payload: { parentId: selectedNodeId } });
        }
    };

    const handleDeleteNode = () => {
        if (selectedNodeId && selectedNodeId !== currentMap.rootId) {
            const parentId = currentMap.nodes[selectedNodeId]?.parentId;
            dispatch({ type: 'DELETE_NODE', payload: { id: selectedNodeId } });
            if (parentId) setSelectedNodeId(parentId);
        }
    };

    const handleEditNode = () => {
        // Logic to trigger edit mode. 
        // The Node component listens for double click.
        // We can force edit by passing a prop or dispatching an action if we refactor Node state.
        // For MVP, simple double tap on node works, but a button is requested.
        // We will trick this by dispatching a custom event or refactoring Node to listen to context?
        // Simpler: The Node component check if it is selected and we trigger a re-render with "edit mode" forced?
        // Actually, Node manages its own `isEditing`. 
        // Let's rely on double-tap for now or add an "edit" capability later if strictly needed.
        // BUT user said "I can't create anything".
        // Let's simulate a double click event on the selected DOM node? Hacky.
        // Better: Move `isEditing` to Context or Reducer? excessive for MVP.
        // Alternative: Just tell user to "Double Tap" to edit. 
        // OR: Send a "start edit" signal via a ref?
        // Let's implement a global "EditingId" in state/context to support this button.
        // For now, let's keep it simple: Add and Delete are the critical missing ones.
        // Edit is usually Double Tap which works on touch too.
        // Let's try to dispatch a fake double click?
        const el = document.getElementById(`node-${selectedNodeId}`);
        if (el) {
            const event = new MouseEvent('dblclick', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            el.dispatchEvent(event);
        }
    };


    const edges = Object.values(currentMap.nodes).map(node => {
        if (!node.parentId) return null;
        const start = layout[node.parentId];
        const end = layout[node.id];
        if (!start || !end) return null;

        return (
            <Edge
                key={`${node.parentId}-${node.id}`}
                sourceX={start.x}
                sourceY={start.y}
                targetX={end.x}
                targetY={end.y}
            />
        );
    });

    const glassButton = "bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 backdrop-blur-sm active:scale-95";
    const glassPanel = "bg-surface/70 backdrop-blur-xl border border-white/10 shadow-xl";

    return (
        <div className="w-full h-full relative overflow-hidden bg-background"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}

            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Animated Grid Background */}
            <div
                className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"
                style={{
                    backgroundPosition: `${pan.x}px ${pan.y}px`
                }}
            ></div>

            {/* Toolbar / Header */}
            <div className="absolute top-6 left-6 z-50 flex gap-4 animate-fade-in pointer-events-none">
                <div className="pointer-events-auto">
                    <button onClick={closeMap} className={`p-3 rounded-xl text-cyan-300 hover:text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] ${glassButton}`}>
                        <ArrowLeft size={24} />
                    </button>
                </div>
                <div className={`px-6 py-3 rounded-xl flex items-center gap-3 ${glassPanel} pointer-events-auto`}>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="font-bold text-gray-100 tracking-wide uppercase text-sm truncate max-w-[150px]">{currentMap.title}</span>
                </div>
            </div>

            {/* Infinite Canvas Container */}
            <div
                ref={containerRef}
                className="absolute w-full h-full origin-top-left cursor-grab active:cursor-grabbing touch-none" // touch-none vital for handling gestures manually
            >
                <div
                    className="absolute transition-transform duration-75 ease-out origin-center"
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
                >
                    <svg className="absolute top-0 left-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                        <defs>
                            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
                                <stop offset="100%" stopColor="#d946ef" /> {/* Fuchsia */}
                            </linearGradient>
                        </defs>
                        {edges}
                    </svg>

                    {Object.values(currentMap.nodes).map(node => {
                        const pos = layout[node.id];
                        if (!pos) return null;
                        const nodeWithPos = { ...node, x: pos.x, y: pos.y }; // Pass computed pos
                        return (
                            <Node
                                key={node.id}
                                node={nodeWithPos}
                                isSelected={selectedNodeId === node.id}
                                onSelect={setSelectedNodeId}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Desktop Hint - Hidden on small screens? Or just keep it. */}
            <div className={`hidden md:block absolute bottom-6 right-6 z-50 px-6 py-3 rounded-full text-xs text-cyan-300/70 font-mono tracking-widest uppercase ${glassPanel}`}>
                TAB: ADD CHILD | DEL: PURGE | DRAG: NAVIGATE
            </div>

            {/* MOBILE ACTION BAR */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex gap-4 md:hidden">
                <button
                    onClick={handleDeleteNode}
                    disabled={!selectedNodeId || selectedNodeId === currentMap.rootId}
                    className={`p-4 rounded-full text-red-400 bg-surface/90 border border-red-500/30 shadow-lg backdrop-blur disabled:opacity-30 disabled:grayscale transition-all active:scale-90`}
                >
                    <Trash2 size={24} />
                </button>

                <button
                    onClick={handleEditNode}
                    disabled={!selectedNodeId}
                    className={`p-4 rounded-full text-cyan-300 bg-surface/90 border border-cyan-500/30 shadow-lg backdrop-blur disabled:opacity-30 disabled:grayscale transition-all active:scale-90`}
                >
                    <Edit3 size={24} />
                </button>

                <button
                    onClick={handleAddNode}
                    disabled={!selectedNodeId}
                    className={`p-4 rounded-full text-white bg-primary shadow-[0_0_20px_rgba(6,182,212,0.6)] disabled:opacity-30 disabled:grayscale transition-all active:scale-90`}
                >
                    <Plus size={28} />
                </button>
            </div>
        </div>
    );
};
