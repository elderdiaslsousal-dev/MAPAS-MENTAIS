import type { MindMapData, MindMapNode } from '../types/mindmap';
import { v4 as uuidv4 } from 'uuid';

export type Action =
    | { type: 'LOAD_MAP'; payload: MindMapData }
    | { type: 'CLOSE_MAP' }
    | { type: 'UPDATE_TITLE'; payload: string }
    | { type: 'ADD_NODE'; payload: { parentId: string, text?: string } }
    | { type: 'UPDATE_NODE'; payload: { id: string, text?: string } } // Simplified for MVP (only text/styles)
    | { type: 'DELETE_NODE'; payload: { id: string } }
    | { type: 'MOVE_NODE'; payload: { id: string, x: number, y: number } };

export const mindMapReducer = (state: MindMapData | null, action: Action): MindMapData | null => {
    if (action.type === 'LOAD_MAP') {
        return action.payload;
    }
    if (action.type === 'CLOSE_MAP') {
        return null;
    }

    if (!state) return null;

    switch (action.type) {
        case 'UPDATE_TITLE':
            return { ...state, title: action.payload, updatedAt: Date.now() };

        case 'ADD_NODE': {
            const newNodeId = uuidv4();
            const newNode: MindMapNode = {
                id: newNodeId,
                parentId: action.payload.parentId,
                text: action.payload.text || 'New Node',
                x: 0,
                y: 0,
            };

            return {
                ...state,
                nodes: {
                    ...state.nodes,
                    [newNodeId]: newNode
                },
                updatedAt: Date.now()
            };
        }

        case 'UPDATE_NODE': {
            const { id, text } = action.payload;
            const node = state.nodes[id];
            if (!node) return state;

            return {
                ...state,
                nodes: {
                    ...state.nodes,
                    [id]: { ...node, text: text !== undefined ? text : node.text }
                },
                updatedAt: Date.now()
            };
        }

        case 'DELETE_NODE': {
            const { id } = action.payload;
            if (id === state.rootId) return state; // Cannot delete root

            // Cascading delete: find all descendants
            const nodesToDelete = new Set<string>();
            const stack = [id];
            while (stack.length > 0) {
                const currentId = stack.pop()!;
                nodesToDelete.add(currentId);
                // Find children
                Object.values(state.nodes).forEach(n => {
                    if (n.parentId === currentId) {
                        stack.push(n.id);
                    }
                });
            }

            const newNodes = { ...state.nodes };
            nodesToDelete.forEach(nodeId => {
                delete newNodes[nodeId];
            });

            return {
                ...state,
                nodes: newNodes,
                updatedAt: Date.now()
            };
        }

        // Position updates will be handled by layout usually, but manual Move is good
        case 'MOVE_NODE': {
            const { id, x, y } = action.payload;
            const node = state.nodes[id];
            if (!node) return state;

            return {
                ...state,
                nodes: {
                    ...state.nodes,
                    [id]: { ...node, x, y }
                },
                updatedAt: Date.now()
            };
        }

        default:
            return state;
    }
};
