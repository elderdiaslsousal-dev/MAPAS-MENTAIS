import type { MindMapData } from '../../types/mindmap';

// Simple Right-Angle Tree Layout
// Stores computed positions in the nodes (mutates valid layout, or returns new position map)
// For MVP, we will compute positions on the fly or mutate a copy.

interface LayoutResult {
    [id: string]: { x: number; y: number };
}

export const calculateTreeLayout = (data: MindMapData): LayoutResult => {
    const result: LayoutResult = {};
    const { rootId, nodes } = data;

    if (!nodes[rootId]) return result;

    // Constants
    const LEVEL_WIDTH = 250; // Horizontal spacing
    const NODE_HEIGHT = 80;  // Vertical spacing estimate

    // Build tree structure
    const childrenMap: Record<string, string[]> = {};
    Object.values(nodes).forEach(node => {
        if (node.parentId) {
            if (!childrenMap[node.parentId]) childrenMap[node.parentId] = [];
            childrenMap[node.parentId].push(node.id);
        }
    });

    // Recursive layout
    // We need to calculate height of each subtree to center parents

    const getSubtreeHeight = (nodeId: string): number => {
        const children = childrenMap[nodeId] || [];
        if (children.length === 0) return NODE_HEIGHT;
        return children.reduce((sum, childId) => sum + getSubtreeHeight(childId), 0);
    };

    const layoutNode = (nodeId: string, x: number, yStart: number) => {
        const children = childrenMap[nodeId] || [];
        const myHeight = getSubtreeHeight(nodeId);

        // Y position is middle of available vertical space
        const y = yStart + myHeight / 2;

        result[nodeId] = { x, y };

        // Layout children
        let currentY = yStart;
        children.forEach(childId => {
            const childHeight = getSubtreeHeight(childId);
            layoutNode(childId, x + LEVEL_WIDTH, currentY);
            currentY += childHeight;
        });
    };

    // Start layout
    // We want root at (0,0) conceptually? Or strictly structured.
    // result[rootId] = { x: 0, y: 0 }; 
    // But recursive function needs top-left bounds.

    // Let's center root at 0,0 locally
    // We'll run the layout starting at some arbitrary Y, then shift everything so Root is at 0,0

    const totalHeight = getSubtreeHeight(rootId);
    layoutNode(rootId, 0, -totalHeight / 2);

    return result;
};
