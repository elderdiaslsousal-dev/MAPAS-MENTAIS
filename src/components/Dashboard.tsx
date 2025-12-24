import React, { useState } from 'react';
import { useMindMap } from '../store/MindMapContext';
import { Plus, Trash2, Calendar, Cpu, Zap, LayoutGrid } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { maps, createMap, openMap, deleteMap } = useMindMap();
    const [newMapTitle, setNewMapTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMapTitle.trim()) {
            createMap(newMapTitle.trim());
            setNewMapTitle('');
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text p-8 relative overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-subtle"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none animate-pulse-subtle"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6 animate-fade-in">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-surface-highlight/50 rounded-2xl shadow-lg backdrop-blur-sm border border-white/5">
                            <Cpu size={36} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight mb-1">
                                MAPAS MENTAIS
                            </h1>
                            <p className="text-text-muted font-medium tracking-wide text-sm">Organize seus pensamentos</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="group relative px-6 py-3 bg-primary hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span>NOVO MAPA</span>
                        </div>
                    </button>
                </header>

                {isCreating && (
                    <div className="mb-12 p-8 rounded-3xl animate-slide-up bg-surface border border-white/5 shadow-2xl backdrop-blur-xl">
                        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-center">
                            <LayoutGrid className="text-primary hidden md:block" size={28} />
                            <input
                                type="text"
                                placeholder="Nome do seu novo mapa..."
                                value={newMapTitle}
                                onChange={e => setNewMapTitle(e.target.value)}
                                className="w-full bg-background border border-surface-highlight text-white px-6 py-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder-text-muted/50 text-lg"
                                autoFocus
                            />
                            <div className="flex gap-3 w-full md:w-auto">
                                <button type="submit" className="flex-1 md:flex-none px-8 py-4 bg-primary hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/25">
                                    CRIAR
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 md:flex-none px-8 py-4 bg-surface-highlight hover:bg-surface-highlight/80 text-text-muted hover:text-white rounded-xl transition-all font-medium"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {maps.length === 0 ? (
                    <div className="text-center py-40 animate-fade-in opacity-60 flex flex-col items-center">
                        <div className="w-20 h-20 bg-surface-highlight/30 rounded-full flex items-center justify-center mb-6">
                            <Zap size={40} className="text-text-muted" />
                        </div>
                        <h3 className="text-2xl text-text font-semibold mb-2">Nenhum mapa encontrado</h3>
                        <p className="text-text-muted">Comece criando seu primeiro mapa mental.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {maps.map((map, idx) => (
                            <div
                                key={map.id}
                                onClick={() => openMap(map.id)}
                                className="group p-6 rounded-2xl bg-surface border border-white/5 hover:border-primary/30 transition-all duration-300 cursor-pointer relative overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteMap(map.id); }}
                                        className="text-text-muted hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors"
                                        title="Excluir mapa"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="mb-8 mt-2">
                                    <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors truncate pr-8 leading-tight">
                                        {map.title}
                                    </h3>
                                </div>

                                <div className="flex items-center justify-between text-xs text-text-muted mt-auto pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        <span>{new Date(map.updatedAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                                        <span className="font-medium">Ativo</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
