import React from 'react';

interface EdgeProps {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}

export const Edge: React.FC<EdgeProps> = ({ sourceX, sourceY, targetX, targetY }) => {
    const deltaX = targetX - sourceX;

    const c1x = sourceX + (deltaX / 2);
    const c1y = sourceY;
    const c2x = targetX - (deltaX / 2);
    const c2y = targetY;

    const path = `M ${sourceX} ${sourceY} C ${c1x} ${c1y} ${c2x} ${c2y} ${targetX} ${targetY}`;

    return (
        <g>
            {/* Glow Effect (Wide, blurred) */}
            <path
                d={path}
                stroke="rgba(6, 182, 212, 0.2)"
                strokeWidth="6"
                fill="none"
                className="transition-all duration-300 pointer-events-none"
                style={{ filter: 'blur(2px)' }}
            />
            {/* Core Line (Gradient) */}
            <path
                d={path}
                stroke="url(#edge-gradient)" // References the gradient def defined in Canvas
                strokeWidth="2"
                fill="none"
                className="transition-all duration-300 opacity-60"
            />
            {/* Animation Packet (Optional pulse) */}
        </g>
    );
};
