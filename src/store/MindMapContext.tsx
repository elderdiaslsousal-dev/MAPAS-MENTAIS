import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import type { MindMapData, MindMapMetadata } from '../types/mindmap';
import type { Action } from './mindMapReducer';
import { mindMapReducer } from './mindMapReducer';
import { storage } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface MindMapContextType {
    maps: MindMapMetadata[];
    currentMap: MindMapData | null;
    dispatch: React.Dispatch<Action>;
    createMap: (title: string) => string; // returns new ID
    openMap: (id: string) => void;
    deleteMap: (id: string) => void;
    closeMap: () => void;
}

const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export const MindMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [maps, setMaps] = useState<MindMapMetadata[]>([]);
    const [currentMap, dispatch] = useReducer(mindMapReducer, null);

    // Load maps list on mount
    useEffect(() => {
        setMaps(storage.getMaps());
    }, []);

    // Auto-save current map on change
    useEffect(() => {
        if (currentMap) {
            storage.saveMap(currentMap);
            // Update local maps list to reflect timestamp changes if needed (optional optimization)
            setMaps(prev => {
                const idx = prev.findIndex(m => m.id === currentMap.id);
                if (idx >= 0 && (prev[idx].title !== currentMap.title || prev[idx].updatedAt !== currentMap.updatedAt)) {
                    const newMaps = [...prev];
                    newMaps[idx] = { ...newMaps[idx], title: currentMap.title, updatedAt: currentMap.updatedAt };
                    return newMaps;
                }
                return prev;
            });
        }
    }, [currentMap]);

    const createMap = (title: string) => {
        const rootId = uuidv4();
        const newMap: MindMapData = {
            id: uuidv4(),
            title,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            rootId,
            nodes: {
                [rootId]: {
                    id: rootId,
                    parentId: null,
                    text: 'Central Idea',
                    x: 0,
                    y: 0,
                    style: { fontSize: 'text-xl', textColor: '#ffffff', backgroundColor: '#3b82f6' } // Default style
                }
            }
        };

        storage.saveMap(newMap);

        setMaps(prev => {
            const newMeta = { id: newMap.id, title: newMap.title, updatedAt: newMap.updatedAt };
            const newIndex = [newMeta, ...prev];
            storage.saveMapIndex(newIndex);
            return newIndex;
        });

        dispatch({ type: 'LOAD_MAP', payload: newMap });
        return newMap.id;
    };

    const openMap = (id: string) => {
        const mapData = storage.getMap(id);
        if (mapData) {
            dispatch({ type: 'LOAD_MAP', payload: mapData });
        }
    };

    const closeMap = () => {
        dispatch({ type: 'CLOSE_MAP' });
    };

    const deleteMap = (id: string) => {
        storage.deleteMap(id);
        setMaps(prev => prev.filter(m => m.id !== id));
        if (currentMap?.id === id) {
            // Clear current map if it was deleted
            // dispatch({ type: 'LOAD_MAP', payload: ... }) // Need null support
            window.location.reload(); // Lazy reload to clear state for MVP
        }
    };

    return (
        <MindMapContext.Provider value={{ maps, currentMap, dispatch, createMap, openMap, deleteMap, closeMap }}>
            {children}
        </MindMapContext.Provider>
    );
};

export const useMindMap = () => {
    const context = useContext(MindMapContext);
    if (!context) {
        throw new Error('useMindMap must be used within a MindMapProvider');
    }
    return context;
};
