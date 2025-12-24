import type { MindMapData, MindMapMetadata } from '../types/mindmap';

const INDEX_KEY = 'mindmap_index';
const MAP_PREFIX = 'mindmap_map_';

export const storage = {
    getMaps: (): MindMapMetadata[] => {
        try {
            const json = localStorage.getItem(INDEX_KEY);
            return json ? JSON.parse(json) : [];
        } catch (e) {
            console.error("Failed to load map index", e);
            return [];
        }
    },

    saveMapIndex: (maps: MindMapMetadata[]) => {
        localStorage.setItem(INDEX_KEY, JSON.stringify(maps));
    },

    getMap: (id: string): MindMapData | null => {
        try {
            const json = localStorage.getItem(MAP_PREFIX + id);
            return json ? JSON.parse(json) : null;
        } catch (e) {
            console.error(`Failed to load map ${id}`, e);
            return null;
        }
    },

    saveMap: (data: MindMapData) => {
        try {
            localStorage.setItem(MAP_PREFIX + data.id, JSON.stringify(data));
            // Also update index timestamp if exists
            const maps = storage.getMaps();
            const existingIndex = maps.findIndex(m => m.id === data.id);
            if (existingIndex >= 0) {
                maps[existingIndex].updatedAt = Date.now();
                maps[existingIndex].title = data.title;
                storage.saveMapIndex(maps);
            } else {
                // New map should be added via createMap, but here we just ensure sync
            }
        } catch (e) {
            console.error(`Failed to save map ${data.id}`, e);
        }
    },

    deleteMap: (id: string) => {
        localStorage.removeItem(MAP_PREFIX + id);
        const maps = storage.getMaps().filter(m => m.id !== id);
        storage.saveMapIndex(maps);
    }
};
