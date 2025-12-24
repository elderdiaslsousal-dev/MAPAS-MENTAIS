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

    const glassPanel = "bg-surface/70 backdrop-blur-xl border border-white/10 shadow-xl";

    return (
        <div className="min-h-screen bg-background text-gray-200 p-8 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex items-center justify-between mb-12 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                            <Cpu size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary tracking-tight">
                                NEURAL MAP
                            </h1>
                            <p className="text-cyan-200/60 font-medium tracking-wide">Next-Gen Thought Processor</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="group relative px-6 py-3 bg-primary/10 border border-primary/50 text-cyan-300 rounded-lg overflow-hidden transition-all hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
                    >
                        <div className="flex items-center gap-2 relative z-10">
                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                            <span className="font-semibold">INITIATE MAP</span>
                        </div>
                    </button>
                </header>

                {isCreating && (
                    <div className={`mb-12 p-8 rounded-2xl animate-slide-up border-l-4 border-l-primary ${glassPanel}`}>
                        <form onSubmit={handleCreate} className="flex gap-4 items-center">
                            <LayoutGrid className="text-primary animate-pulse" size={24} />
                            <input
                                type="text"
                                placeholder="Enter system protocol name..."
                                value={newMapTitle}
                                onChange={e => setNewMapTitle(e.target.value)}
                                className="flex-1 bg-black/30 border border-white/10 text-white px-6 py-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all placeholder-gray-600 text-lg"
                                autoFocus
                            />
                            <button type="submit" className="px-8 py-4 bg-primary hover:bg-cyan-400 text-black font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                                INITIALIZE
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-8 py-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                ABORT
                            </button>
                        </form>
                    </div>
                )}

                {maps.length === 0 ? (
                    <div className="text-center py-32 animate-fade-in opacity-50">
                        <Zap size={64} className="mx-auto text-gray-700 mb-6" />
                        <p className="text-2xl text-gray-500 font-light">SYSTEM IDLE. AWAITING INPUT.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {maps.map((map, idx) => (
                            <div
                                key={map.id}
                                onClick={() => openMap(map.id)}
                                className={`group p-6 rounded-2xl hover:border-primary/50 transition-all duration-300 cursor-pointer relative overflow-hidden hover:-translate-y-2 ${glassPanel}`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors truncate pr-8">
                                        {map.title}
                                    </h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteMap(map.id); }}
                                        className="text-gray-500 hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between text-xs text-cyan-200/40 mt-4 relative z-10 uppercase tracking-wider font-semibold">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} />
                                        <span>{new Date(map.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
