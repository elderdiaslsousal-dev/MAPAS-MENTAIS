import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMindMap } from '../../store/MindMapContext';
import { Node } from './Node';
import { Edge } from './Edge';
import { calculateTreeLayout } from '../Layout/layoutUtils';
import { ArrowLeft, Plus, Trash2, Edit3, Grid, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';

export const Canvas: React.FC = () => {
    const { currentMap, dispatch, closeMap } = useMindMap();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(currentMap?.rootId || null);

    // Canvas State
    const [pan, setPan] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const [scale, setScale] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [isDraggingNode, setIsDraggingNode] = useState(false);

    // Interaction Refs
    const lastMousePos = useRef({ x: 0, y: 0 });
    const lastTouchPos = useRef({ x: 0, y: 0 }); // Single touch pan
    const lastPinchDist = useRef<number | null>(null); // Pinch zoom
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Auto-Layout (Once per load if fresh map?) 
    // Actually, if map has existing positions, we use them.
    // If we want "Auto Layout" it should be an action triggered by user.
    // For now, reliance on `currentMap.nodes` having x,y is key. 
    // The Reducer initializes new nodes at 0,0. 
    // We should probably init layout if all nodes are at 0,0?
    // Let's assume user wants to start fresh.

    // --- Actions ---

    const handleAutoAlign = () => {
        if (!currentMap) return;
        const layout = calculateTreeLayout(currentMap);
        // Dispatch "Apply Layout" (Not mapped in reducer, so we do batched moves or just one by one?)
        // Better: Add APPLY_LAYOUT to reducer. For now, let's iterate.
        // Optimization: Create a pseudo-action or just iterate.
        Object.keys(layout).forEach(id => {
            dispatch({ type: 'MOVE_NODE', payload: { id, x: layout[id].x, y: layout[id].y } });
        });
    };

    const handleCenterMap = () => {
        // Calculate center of all nodes
        if (!currentMap) return;
        const nodes = Object.values(currentMap.nodes);
        if (nodes.length === 0) return;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodes.forEach(n => {
            minX = Math.min(minX, n.x);
            maxX = Math.max(maxX, n.x);
            minY = Math.min(minY, n.y);
            maxY = Math.max(maxY, n.y);
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        setPan({
            x: window.innerWidth / 2 - centerX * scale,
            y: window.innerHeight / 2 - centerY * scale
        });
    };

    const handleZoom = (delta: number) => {
        setScale(s => Math.min(Math.max(0.1, s + delta), 3));
    };

    // --- Inputs Handling ---

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault(); // Prevent browser zoom
            const zoomSensitivity = 0.001;
            const delta = -e.deltaY * zoomSensitivity;
            setScale(s => Math.min(Math.max(0.1, s + delta), 3));
        } else {
            // Pan
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) { // Left click
            setIsPanning(true);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            setSelectedNodeId(null);
        }
    };

    const handleNodeDragStart = (e: React.MouseEvent | React.TouchEvent, nodeId: string) => {
        setIsDraggingNode(true);
        setSelectedNodeId(nodeId);

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        lastMousePos.current = { x: clientX, y: clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        if (isDraggingNode && selectedNodeId) {
            // Calculate delta in world space
            dispatch({
                type: 'MOVE_NODE',
                payload: {
                    id: selectedNodeId,
                    x: currentMap!.nodes[selectedNodeId].x + dx / scale,
                    y: currentMap!.nodes[selectedNodeId].y + dy / scale
                }
            });
        } else if (isPanning) {
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        setIsDraggingNode(false);
    };

    // --- Touch Handling ---

    const getDistance = (touches: React.TouchList) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch start
            lastPinchDist.current = getDistance(e.touches);
        } else if (e.touches.length === 1) {
            if (!isDraggingNode) { // Only pan if not dragging node
                setIsPanning(true);
                lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && lastPinchDist.current) {
            // Pinch Zoom
            const newDist = getDistance(e.touches);
            const delta = (newDist - lastPinchDist.current) * 0.005;
            setScale(s => Math.min(Math.max(0.1, s + delta), 3));
            lastPinchDist.current = newDist;
        } else if (e.touches.length === 1) {
            const touch = e.touches[0];
            const dx = touch.clientX - lastTouchPos.current.x;
            const dy = touch.clientY - lastTouchPos.current.y;
            lastTouchPos.current = { x: touch.clientX, y: touch.clientY };

            if (isDraggingNode && selectedNodeId) {
                dispatch({
                    type: 'MOVE_NODE',
                    payload: {
                        id: selectedNodeId,
                        x: currentMap!.nodes[selectedNodeId].x + dx / scale,
                        y: currentMap!.nodes[selectedNodeId].y + dy / scale
                    }
                });
            } else if (isPanning) {
                setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            }
        }
    };

    const handleTouchEnd = () => {
        setIsPanning(false);
        setIsDraggingNode(false);
        lastPinchDist.current = null;
    };


    if (!currentMap) return null;

    // Computed Edges
    const edges = Object.values(currentMap.nodes).map(node => {
        if (!node.parentId) return null;
        const parent = currentMap.nodes[node.parentId];
        if (!parent) return null;

        return (
            <Edge
                key={`${node.parentId}-${node.id}`}
                sourceX={parent.x}
                sourceY={parent.y}
                targetX={node.x}
                targetY={node.y}
            />
        );
    });

    const glassButton = "bg-surface/80 hover:bg-surface border border-surface-highlight text-text-muted hover:text-white p-3 rounded-xl transition-all shadow-lg active:scale-95 backdrop-blur-sm";

    return (
        <div className="w-full h-full relative overflow-hidden bg-background select-none font-sans"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel} // Integrated Zoom/Pan on Wheel
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background Pattern */}
            <div
                className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none"
                style={{
                    backgroundPosition: `${pan.x}px ${pan.y}px`,
                    backgroundSize: `${20 * scale}px ${20 * scale}px`
                }}
            ></div>

            {/* Top Bar */}
            <div className="absolute top-4 left-4 z-50 flex gap-4 pointer-events-none">
                <div className="pointer-events-auto">
                    <button onClick={closeMap} className={glassButton}>
                        <ArrowLeft size={24} />
                    </button>
                </div>
                <div className="px-6 py-3 rounded-xl bg-surface/90 backdrop-blur-md border border-surface-highlight flex items-center gap-3 shadow-lg pointer-events-auto">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    <span className="font-bold text-gray-100 tracking-wide text-sm truncate max-w-[200px]">{currentMap.title}</span>
                </div>
            </div>

            {/* Control Toolbar (Right Side) */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 z-50 flex flex-col gap-3 pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-2 p-2 rounded-2xl bg-surface/50 backdrop-blur-sm border border-white/5">
                    <button onClick={handleAutoAlign} className={glassButton} title="Organizar Automaticamente">
                        <Grid size={20} />
                    </button>
                    <button onClick={handleCenterMap} className={glassButton} title="Centralizar Mapa">
                        <Crosshair size={20} />
                    </button>
                    <div className="w-full h-px bg-white/10 my-1"></div>
                    <button onClick={() => handleZoom(0.2)} className={glassButton} title="Aumentar Zoom">
                        <ZoomIn size={20} />
                    </button>
                    <button onClick={() => handleZoom(-0.2)} className={glassButton} title="Diminuir Zoom">
                        <ZoomOut size={20} />
                    </button>
                </div>
            </div>

            {/* Canvas Content */}
            <div
                className="absolute origin-top-left will-change-transform"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
            >
                <div className="relative"> {/* Zero-size wrapper to allow negative logic if needed, but absolute children work fine */}
                    <svg className="absolute top-[-50000px] left-[-50000px] w-[100000px] h-[100000px] overflow-visible pointer-events-none">
                        {/* Large SVG canvas for edges */}
                        <defs>
                            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
                                <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
                            </linearGradient>
                        </defs>
                        <g transform={`translate(50000, 50000)`}> {/* Center datum */}
                            {Object.values(currentMap.nodes).map(node => {
                                if (!node.parentId) return null;
                                const parent = currentMap.nodes[node.parentId];
                                if (!parent) return null;
                                return (
                                    <Edge
                                        key={`${node.parentId}-${node.id}`}
                                        sourceX={parent.x}
                                        sourceY={parent.y}
                                        targetX={node.x}
                                        targetY={node.y}
                                    />
                                );
                            })}
                        </g>
                    </svg>

                    {/* Nodes Layer - We use the same translate trick or just raw comparison. 
                        Actually, SVG Transform group above is offset 50000. 
                        Let's just use raw coords for Nodes and SVG lines without massive SVG wrapper if possible.
                        Better: SVG spans viewport? No, panning moves it. 
                        The container `div` moves. So (0,0) inside the `div` is the world origin.
                        Nodes at (x,y) are relative to this origin.
                        SVG Lines also relative to this origin.
                        So we don't need the 50k offset hack if coordinate space allows negative values in SVG.
                        SVG overflow-visible is key.
                     */}

                    <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
                        {edges}
                    </svg>

                    {Object.values(currentMap.nodes).map(node => (
                        <Node
                            key={node.id}
                            node={node}
                            isSelected={selectedNodeId === node.id}
                            onSelect={setSelectedNodeId}
                            onDragStart={handleNodeDragStart}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile Action Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4 md:hidden pointer-events-no">
                <div className="pointer-events-auto flex gap-4 p-2 bg-surface/80 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
                    <button
                        onClick={() => {
                            if (selectedNodeId && selectedNodeId !== currentMap.rootId) {
                                dispatch({ type: 'DELETE_NODE', payload: { id: selectedNodeId } });
                                const parentId = currentMap.nodes[selectedNodeId]?.parentId;
                                if (parentId) setSelectedNodeId(parentId);
                            }
                        }}
                        disabled={!selectedNodeId || selectedNodeId === currentMap.rootId}
                        className="p-3 rounded-full text-red-400 bg-white/5 disabled:opacity-30"
                    >
                        <Trash2 size={24} />
                    </button>

                    <button
                        onClick={() => {
                            if (selectedNodeId) {
                                dispatch({ type: 'ADD_NODE', payload: { parentId: selectedNodeId } });
                            }
                        }}
                        disabled={!selectedNodeId}
                        className="p-3 rounded-full text-white bg-primary shadow-lg shadow-primary/40 disabled:opacity-30"
                    >
                        <Plus size={28} />
                    </button>

                    {/* Organize Button Mobile */}
                    <button
                        onClick={handleAutoAlign}
                        className="p-3 rounded-full text-cyan-300 bg-white/5"
                    >
                        <Grid size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};
