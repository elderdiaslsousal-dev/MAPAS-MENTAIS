export interface NodePosition {
    x: number;
    y: number;
}

export interface NodeStyle {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    fontSize?: string; // e.g. "text-lg" or "18px"
}

export interface MindMapNode {
    id: string;
    parentId: string | null;
    text: string;
    // Position is often calculated by layout, but stored for manual tweaks if needed. 
    // For MVP auto-layout, this might be ephemeral, but we store specific coordinates if dragging is allowed "freely" eventually.
    // For now, let's keep it optional or part of a Layout cache.
    // Actually, for "Free" layout, we need persistent x/y. For "Tree" layout, it's computed.
    // We'll add x,y for potential manual override.
    x?: number;
    y?: number;

    // Visuals
    style?: NodeStyle;

    // Collapse state
    isCollapsed?: boolean;
}

export interface MindMapData {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    rootId: string;
    nodes: Record<string, MindMapNode>; // ID -> Node lookup for O(1) access
}

export interface MindMapMetadata {
    id: string;
    title: string;
    updatedAt: number;
}
