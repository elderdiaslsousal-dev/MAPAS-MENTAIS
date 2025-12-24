import React, { useEffect, useRef, useState } from 'react';
import type { MindMapNode } from '../../types/mindmap';
import clsx from 'clsx';
import { useMindMap } from '../../store/MindMapContext';
import { Plus } from 'lucide-react';

interface NodeProps {
    node: MindMapNode;
    isSelected?: boolean;
    onSelect: (id: string) => void;
    onDragStart?: (e: React.MouseEvent | React.TouchEvent, nodeId: string) => void;
}

export const Node: React.FC<NodeProps> = ({ node, isSelected, onSelect, onDragStart }) => {
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

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        onSelect(node.id);
        if (onDragStart) {
            onDragStart(e, node.id);
        }
    };

    // Modern Professional Style System
    const baseClasses = `
    absolute transform -translate-y-1/2 
    min-w-[150px] max-w-[300px] px-6 py-3 rounded-2xl
    transition-all duration-200
    flex items-center justify-center cursor-move
    group
    backdrop-blur-md
    text-sm font-medium tracking-wide
  `;

    const defaultStyle = "bg-surface/80 border border-surface-highlight text-text shadow-md hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5";
    const selectedStyle = "bg-surface border-primary text-white shadow-xl shadow-primary/20 ring-2 ring-primary/20 z-20";

    return (
        <div
            ref={nodeRef}
            id={`node-${node.id}`}
            className={clsx(
                baseClasses,
                isSelected ? selectedStyle : defaultStyle,
                node.style?.fontSize || 'text-sm'
            )}
            style={{
                left: node.x,
                top: node.y,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    value={node.text}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent text-center focus:outline-none w-full text-white font-medium selection:bg-primary/30 min-w-[100px]"
                />
            ) : (
                <span className="text-center select-none whitespace-pre-wrap block overflow-hidden text-ellipsis line-clamp-3">
                    {node.text}
                </span>
            )}

            {/* Floating Action Button for Add Child (Top-Right) */}
            <div
                onClick={handleAddChild}
                className={clsx(
                    "absolute -right-3 -top-3 w-7 h-7 rounded-full bg-surface border border-surface-highlight text-text-muted flex items-center justify-center shadow-md transition-all hover:bg-primary hover:text-white hover:border-primary hover:scale-110 z-30",
                    isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto",
                    "duration-200 cursor-pointer"
                )}
                title="Adicionar filho"
            >
                <Plus size={14} />
            </div>
        </div>
    );
};
