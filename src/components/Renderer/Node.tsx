import React, { useEffect, useRef, useState } from 'react';
import type { MindMapNode } from '../../types/mindmap';
import clsx from 'clsx';
import { useMindMap } from '../../store/MindMapContext';
import { Plus } from 'lucide-react';

interface NodeProps {
    node: MindMapNode;
    isSelected?: boolean;
    onSelect: (id: string) => void;
}

export const Node: React.FC<NodeProps> = ({ node, isSelected, onSelect }) => {
    const { dispatch } = useMindMap();
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const nodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleDoubleClick = () => {
        setIsEditing(true);
        onSelect(node.id);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'UPDATE_NODE', payload: { id: node.id, text: e.target.value } });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
        }
    };

    const handleAddChild = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'ADD_NODE', payload: { parentId: node.id } });
    };

    // Futuristic Style System
    const baseClasses = `
    absolute transform -translate-x-1/2 -translate-y-1/2 
    min-w-[140px] px-6 py-4 rounded-full
    transition-all duration-300 ease-out
    flex items-center justify-center cursor-pointer
    group
    backdrop-blur-md
  `;

    const defaultStyle = "bg-surface/60 border border-white/10 text-gray-100 shadow-lg hover:border-cyan-500/50";
    const selectedStyle = "bg-surface/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105 z-20 ring-1 ring-cyan-400/50";

    // If not selected, hover scale
    const hoverEffect = !isSelected ? "hover:scale-105" : "";

    return (
        <div
            ref={nodeRef}
            id={`node-${node.id}`}
            className={clsx(
                baseClasses,
                isSelected ? selectedStyle : defaultStyle,
                hoverEffect,
                node.style?.fontSize || 'text-sm'
            )}
            style={{
                left: node.x,
                top: node.y,
                // Optional override if node has custom colors
                // backgroundColor: node.style?.backgroundColor,
                // borderColor: node.style?.borderColor
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(node.id);
            }}
            onDoubleClick={handleDoubleClick}
        >
            {/* Glow Effect Element (Behind) */}
            <div className={clsx("absolute inset-0 rounded-full transition-opacity duration-500 opacity-0 group-hover:opacity-100", isSelected && "opacity-100")}
                style={{ boxShadow: 'inset 0 0 10px rgba(6,182,212,0.1)' }}
            ></div>

            {isEditing ? (
                <input
                    ref={inputRef}
                    value={node.text}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent text-center focus:outline-none w-full text-white font-medium tracking-wide selection:bg-cyan-500/30"
                />
            ) : (
                <span className="text-center select-none whitespace-pre-wrap max-w-xs block overflow-hidden text-ellipsis font-medium tracking-wide drop-shadow-md">
                    {node.text}
                </span>
            )}

            {/* Floating Action Button for Add Child (Top-Right) */}
            <div
                onClick={handleAddChild}
                className={clsx(
                    "absolute -right-3 -top-3 w-8 h-8 rounded-full bg-surface border border-cyan-500/50 text-cyan-400 flex items-center justify-center shadow-lg transition-all hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_10px_rgba(6,182,212,0.6)] z-30",
                    isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto",
                    "duration-200 cursor-pointer"
                )}
                title="Add Child"
            >
                <Plus size={16} />
            </div>
        </div>
    );
};
